import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getWindowState: () => ipcRenderer.invoke('get-window-state'),
  minimizeWindow: () => ipcRenderer.send('min'),
  maximizeWindow: () => ipcRenderer.send('max'),
  closeWindow: () => ipcRenderer.send('close'),
  getAppUpdateState: () => ipcRenderer.invoke('get-app-update-state'),
  checkAppUpdate: () => ipcRenderer.invoke('check-app-update'),
  installAppUpdate: () => ipcRenderer.invoke('install-app-update'),
  chooseLocalDirectory: () => ipcRenderer.invoke('choose-local-directory'),
  chooseLocalFile: () => ipcRenderer.invoke('choose-local-file'),
  listLocalDirectoryChildren: (directoryPath) =>
    ipcRenderer.invoke('list-local-directory-children', directoryPath),
  searchLocalDirectories: (directoryPath, keyword) =>
    ipcRenderer.invoke('search-local-directories', directoryPath, keyword),
  searchLocalNotebooks: (directoryPath, keyword, top) =>
    ipcRenderer.invoke('search-local-notebooks', directoryPath, keyword, top),
  readLocalFile: (filePath) => ipcRenderer.invoke('read-local-file', filePath),
  writeLocalFile: (filePath, content) => ipcRenderer.invoke('write-local-file', filePath, content),
  createLocalDirectory: (directoryPath) =>
    ipcRenderer.invoke('create-local-directory', directoryPath),
  renameLocalEntry: (entryPath, newName) =>
    ipcRenderer.invoke('rename-local-entry', entryPath, newName),
  removeLocalEntry: (entryPath) => ipcRenderer.invoke('remove-local-entry', entryPath),
  copyLocalEntry: (sourcePath, targetPath) =>
    ipcRenderer.invoke('copy-local-entry', sourcePath, targetPath),
  moveLocalEntry: (sourcePath, targetPath) =>
    ipcRenderer.invoke('move-local-entry', sourcePath, targetPath),
  openLocalPath: (targetPath) => ipcRenderer.invoke('open-local-path', targetPath),
  watchLocalDirectory: (directoryPath) => ipcRenderer.invoke('watch-local-directory', directoryPath),
  unwatchLocalDirectory: (directoryPath) =>
    ipcRenderer.invoke('unwatch-local-directory', directoryPath),
  onLocalDirectoryChange: (callback) => {
    const handler = (_, payload) => callback(payload)
    ipcRenderer.on('local-directory-changed', handler)
    return () => ipcRenderer.removeListener('local-directory-changed', handler)
  },
  onUpdaterMessage: (callback) => {
    const handler = (_, payload) => callback(payload)
    ipcRenderer.on('updater-callback', handler)
    return () => ipcRenderer.removeListener('updater-callback', handler)
  },
  onOpenNotebookFile: (callback) => {
    const handler = (_, payload) => callback(payload)
    ipcRenderer.on('open-notebook-file', handler)
    return () => ipcRenderer.removeListener('open-notebook-file', handler)
  }
}

// Local notebooks use the same collaboration messages as remote notebooks.
// The transport stays in preload so renderer code can keep using WebSocket.
function installLocalCollaborationSocket() {
  const NativeWebSocket = window.WebSocket
  const localPrefix = '/collaboration/ws/local-notebook/'

  class LocalCollaborationSocket {
    constructor(filePath, needsSeed) {
      this.readyState = NativeWebSocket.CONNECTING
      this.listeners = new Map()
      this.filePath = filePath
      this.needsSeed = needsSeed
      this.pendingWrites = Promise.resolve()

      Promise.resolve().then(async () => {
        try {
          const content = await ipcRenderer.invoke('read-local-file', filePath)
          if (this.readyState === NativeWebSocket.CLOSED) return
          const snapshot = content.trim() ? JSON.parse(content) : null
          this.readyState = NativeWebSocket.OPEN
          this.emit('open')
          this.emit('message', {
            type: 'sync',
            canWrite: true,
            needsSeed: this.needsSeed,
            snapshot
          })
        } catch (error) {
          if (this.readyState === NativeWebSocket.CLOSED) return
          console.error('[collaboration] Failed to read local notebook.', error)
          this.emit('error')
          this.close()
        }
      })
    }

    addEventListener(type, listener) {
      if (!this.listeners.has(type)) this.listeners.set(type, new Set())
      this.listeners.get(type).add(listener)
    }

    removeEventListener(type, listener) {
      this.listeners.get(type)?.delete(listener)
    }

    emit(type, message) {
      const event = type === 'message' ? { data: JSON.stringify(message) } : {}
      for (const listener of this.listeners.get(type) || []) listener(event)
    }

    send(data) {
      if (this.readyState !== NativeWebSocket.OPEN)
        throw new Error('Local collaboration is disconnected')
      const message = JSON.parse(data)
      if (message.type !== 'update' && message.type !== 'snapshot') return

      this.pendingWrites = this.pendingWrites.then(async () => {
        if (this.readyState !== NativeWebSocket.OPEN) return
        if (this.needsSeed && message.type === 'update') {
          // These updates reproduce the file that was just loaded.
          if (message.baseline) this.needsSeed = false
        } else {
          if (!message.snapshot) throw new Error('Local collaboration snapshot is missing')
          await ipcRenderer.invoke('write-local-file', this.filePath, JSON.stringify(message.snapshot))
        }
        if (this.readyState === NativeWebSocket.OPEN) {
          this.emit('message', {
            type: 'ack',
            updateId: message.updateId,
            snapshotId: message.snapshotId
          })
        }
      }).catch((error) => {
        console.error('[collaboration] Failed to save local notebook.', error)
        this.emit('error')
        this.close()
      })
    }

    close() {
      if (this.readyState === NativeWebSocket.CLOSED) return
      this.readyState = NativeWebSocket.CLOSED
      this.emit('close')
    }
  }

  function RoutedWebSocket(url, protocols) {
    const endpoint = new URL(url, window.location.href)
    const offset = endpoint.pathname.indexOf(localPrefix)
    if (offset < 0) {
      return protocols === undefined
        ? new NativeWebSocket(url)
        : new NativeWebSocket(url, protocols)
    }
    const filePath = decodeURIComponent(endpoint.pathname.slice(offset + localPrefix.length))
    return new LocalCollaborationSocket(filePath, endpoint.searchParams.get('seeded') !== '1')
  }

  for (const state of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) {
    RoutedWebSocket[state] = NativeWebSocket[state]
  }
  window.WebSocket = RoutedWebSocket
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  installLocalCollaborationSocket()
}
