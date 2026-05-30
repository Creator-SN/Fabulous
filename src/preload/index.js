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
  }
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
}
