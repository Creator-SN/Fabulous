import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import remoteMain from '@electron/remote/main'
import { autoUpdater } from 'electron-updater'
import chokidar from 'chokidar'
import fs from 'fs-extra'
import path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'
const gotSingleInstanceLock = app.requestSingleInstanceLock()

remoteMain.initialize()

const NOTEBOOK_FILE_EXTENSIONS = new Set(['.fbn', '.md', '.html', '.json'])
const GITHUB_LATEST_RELEASE_API = 'https://api.github.com/repos/Creator-SN/Fabulous/releases/latest'
const localDirectoryWatchers = new Map()
const pendingNotebookOpenPaths = []
let mainWindow = null
const updaterState = {
  status: 'init',
  currentVersion: app.getVersion(),
  version: '',
  remoteVersion: '',
  downloadPercent: 0,
  message: ''
}

function normalizeSlashes(targetPath) {
  return targetPath.replace(/\\/g, '/')
}

function isNotebookPath(targetPath = '') {
  const ext = path.extname(targetPath).toLowerCase()
  return NOTEBOOK_FILE_EXTENSIONS.has(ext)
}

function normalizeNotebookPath(targetPath = '') {
  if (!targetPath) return ''
  return normalizeSlashes(path.resolve(targetPath))
}

function collectNotebookPaths(argv = []) {
  return (argv || [])
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim())
    .filter((item) => !item.startsWith('-'))
    .filter((item) => isNotebookPath(item))
    .map((item) => normalizeNotebookPath(item))
}

function queueNotebookOpen(targetPath) {
  const notebookPath = normalizeNotebookPath(targetPath)
  if (!notebookPath || !isNotebookPath(notebookPath)) return
  if (pendingNotebookOpenPaths.includes(notebookPath)) return
  pendingNotebookOpenPaths.push(notebookPath)
}

function emitNotebookOpen(targetPath) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    queueNotebookOpen(targetPath)
    return
  }

  const notebookPath = normalizeNotebookPath(targetPath)
  if (!notebookPath || !isNotebookPath(notebookPath)) return
  mainWindow.webContents.send('open-notebook-file', {
    filePath: notebookPath
  })
}

function flushPendingNotebookOpen() {
  if (!mainWindow || mainWindow.isDestroyed()) return
  while (pendingNotebookOpenPaths.length > 0) {
    const targetPath = pendingNotebookOpenPaths.shift()
    emitNotebookOpen(targetPath)
  }
}

function emitUpdaterState() {
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.send('updater-callback', { ...updaterState })
}

function updateUpdaterState(nextState = {}) {
  Object.assign(updaterState, nextState)
  emitUpdaterState()
}

function normalizeVersionString(version = '') {
  return String(version || '').trim().replace(/^v/i, '')
}

function normalizeVersionInfo(info = {}) {
  return normalizeVersionString(
    info?.version || info?.tag || info?.tag_name || info?.releaseName || info?.name || ''
  )
}

function compareVersions(left = '', right = '') {
  const leftParts = normalizeVersionString(left)
    .split('.')
    .map((item) => Number.parseInt(item, 10) || 0)
  const rightParts = normalizeVersionString(right)
    .split('.')
    .map((item) => Number.parseInt(item, 10) || 0)
  const length = Math.max(leftParts.length, rightParts.length)

  for (let index = 0; index < length; index += 1) {
    const leftValue = leftParts[index] || 0
    const rightValue = rightParts[index] || 0
    if (leftValue === rightValue) continue
    return leftValue > rightValue ? 1 : -1
  }

  return 0
}

async function fetchLatestReleaseVersion() {
  const response = await fetch(GITHUB_LATEST_RELEASE_API, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Fabulous3-Updater'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch latest release: ${response.status}`)
  }

  const payload = await response.json()
  return normalizeVersionInfo(payload)
}

function setupAutoUpdater() {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    updateUpdaterState({
      status: 'checking',
      message: '',
      downloadPercent: 0
    })
  })

  autoUpdater.on('update-available', (info) => {
    const remoteVersion = normalizeVersionInfo(info)
    updateUpdaterState({
      status: 'loading',
      version: remoteVersion,
      remoteVersion,
      message: ''
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    updateUpdaterState({
      status: 'loading',
      downloadPercent: Math.max(0, Math.min(100, Math.round(progress?.percent || 0)))
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    const remoteVersion = normalizeVersionInfo(info)
    updateUpdaterState({
      status: 'downloaded',
      version: remoteVersion,
      remoteVersion,
      downloadPercent: 100,
      message: ''
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    const remoteVersion = normalizeVersionInfo(info)
    updateUpdaterState({
      status: 'latest',
      version: remoteVersion || updaterState.currentVersion,
      remoteVersion: remoteVersion || updaterState.currentVersion,
      downloadPercent: 100,
      message: ''
    })
  })

  autoUpdater.on('error', (error) => {
    updateUpdaterState({
      status: 'error',
      message: error?.message || 'update failed'
    })
  })
}

async function checkForAppUpdates() {
  let remoteVersion = ''

  try {
    remoteVersion = await fetchLatestReleaseVersion()
  } catch (error) {
    console.warn('fetch latest release failed', error)
  }

  if (!app.isPackaged) {
    const hasNewVersion = remoteVersion && compareVersions(remoteVersion, updaterState.currentVersion) > 0
    updateUpdaterState({
      status: hasNewVersion ? 'available' : 'latest',
      version: remoteVersion || updaterState.currentVersion,
      remoteVersion,
      downloadPercent: 0,
      message: 'Dev mode only reads release info. Auto update works in packaged app builds.'
    })
    return { ...updaterState }
  }

  updateUpdaterState({
    version: remoteVersion || updaterState.version,
    remoteVersion: remoteVersion || updaterState.remoteVersion
  })

  await autoUpdater.checkForUpdates()
  return { ...updaterState }
}

function isVisibleNotebookFile(targetPath) {
  return NOTEBOOK_FILE_EXTENSIONS.has(path.extname(targetPath).toLowerCase())
}

async function listLocalDirectoryChildren(directoryPath) {
  const targetPath = path.resolve(directoryPath)
  const entries = await fs.readdir(targetPath)
  const children = []

  for (const entryName of entries) {
    const entryPath = path.join(targetPath, entryName)
    const stats = await fs.stat(entryPath)
    const isDir = stats.isDirectory()
    const isFile = stats.isFile()

    if (!isDir && (!isFile || !isVisibleNotebookFile(entryPath))) {
      continue
    }

    children.push({
      id: encodeURIComponent(normalizeSlashes(entryPath)),
      name: entryName,
      filePath: normalizeSlashes(entryPath),
      relativePath: entryName,
      isDir,
      isFile,
      createDate: stats.birthtime,
      updateDate: stats.mtime
    })
  }

  children.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return children
}

async function searchLocalDirectories(rootPath, keyword) {
  const targetPath = path.resolve(rootPath)
  const queue = [targetPath]
  const results = []
  const query = keyword.trim().toLowerCase()

  while (queue.length > 0) {
    const currentPath = queue.shift()
    const entries = await fs.readdir(currentPath)

    for (const entryName of entries) {
      const entryPath = path.join(currentPath, entryName)
      const stats = await fs.stat(entryPath)
      if (!stats.isDirectory()) continue

      queue.push(entryPath)
      if (!entryName.toLowerCase().includes(query)) continue

      results.push({
        id: encodeURIComponent(normalizeSlashes(entryPath)),
        name: entryName,
        filePath: normalizeSlashes(entryPath),
        relativePath: normalizeSlashes(path.relative(targetPath, entryPath)),
        isDir: true,
        isFile: false
      })
    }
  }

  return results
}

async function searchLocalNotebooks(rootPath, keyword, top = 8) {
  const targetPath = path.resolve(rootPath)
  const queue = [targetPath]
  const results = []
  const query = keyword.trim().toLowerCase()

  while (queue.length > 0) {
    const currentPath = queue.shift()
    const entries = await fs.readdir(currentPath)

    for (const entryName of entries) {
      const entryPath = path.join(currentPath, entryName)
      const stats = await fs.stat(entryPath)

      if (stats.isDirectory()) {
        queue.push(entryPath)
        continue
      }

      if (!stats.isFile() || !isVisibleNotebookFile(entryPath)) continue
      if (!entryName.toLowerCase().includes(query)) continue

      results.push({
        id: encodeURIComponent(normalizeSlashes(entryPath)),
        name: entryName,
        filePath: normalizeSlashes(entryPath),
        relativePath: normalizeSlashes(path.relative(targetPath, entryPath)),
        isDir: false,
        isFile: true
      })

      if (results.length >= top) return results
    }
  }

  return results
}

function broadcastLocalDirectoryChange(browserWindow, payload) {
  browserWindow.webContents.send('local-directory-changed', payload)
}

async function watchLocalDirectory(browserWindow, directoryPath) {
  const targetPath = path.resolve(directoryPath)
  const watcherKey = normalizeSlashes(targetPath)

  if (localDirectoryWatchers.has(watcherKey)) {
    return
  }

  const watcher = chokidar.watch(targetPath, {
    ignoreInitial: true,
    depth: 99
  })

  watcher.on('all', async (eventName, changedPath) => {
    const normalizedChangedPath = normalizeSlashes(changedPath)
    const parentPath = normalizeSlashes(path.dirname(changedPath))

    if (eventName === 'change' && !isVisibleNotebookFile(changedPath)) {
      return
    }

    broadcastLocalDirectoryChange(browserWindow, {
      watchRoot: watcherKey,
      event: eventName,
      path: normalizedChangedPath,
      directoryPath: parentPath
    })
  })

  localDirectoryWatchers.set(watcherKey, watcher)
}

async function unwatchLocalDirectory(directoryPath) {
  const targetPath = normalizeSlashes(path.resolve(directoryPath))
  const watcher = localDirectoryWatchers.get(targetPath)
  if (!watcher) return

  await watcher.close()
  localDirectoryWatchers.delete(targetPath)
}

function getWindowState(win) {
  return {
    platform: process.platform,
    isMaximized: process.platform === 'darwin' ? win.isFullScreen() : win.isMaximized()
  }
}

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    frame: false,
    width: 1440,
    height: 900,
    transparent: false,
    backgroundMaterial: 'acrylic',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true
    }
  })
  mainWindow = win

  remoteMain.enable(win.webContents)

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.on('did-finish-load', () => {
    flushPendingNotebookOpen()
  })

  win.setMenu(null)

  ipcMain.on('min', () => {
    win.minimize()
  })

  ipcMain.on('max', () => {
    if (process.platform === 'darwin') {
      win.setFullScreen(!win.isFullScreen())
      return
    }

    if (win.isMaximized()) win.restore()
    else win.maximize()
  })

  ipcMain.on('close', () => {
    if (process.platform === 'darwin') {
      app.hide()
      return
    }

    win.close()
  })

  ipcMain.handle('choose-local-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })

    if (canceled || filePaths.length === 0) return null
    return normalizeSlashes(filePaths[0])
  })

  ipcMain.handle('choose-local-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        {
          name: 'Fab Notes',
          extensions: ['fbn']
        }
      ]
    })

    if (canceled || filePaths.length === 0) return null
    return normalizeSlashes(filePaths[0])
  })

  ipcMain.handle('list-local-directory-children', async (_, directoryPath) => {
    return await listLocalDirectoryChildren(directoryPath)
  })

  ipcMain.handle('search-local-directories', async (_, directoryPath, keyword) => {
    return await searchLocalDirectories(directoryPath, keyword)
  })

  ipcMain.handle('search-local-notebooks', async (_, directoryPath, keyword, top = 8) => {
    return await searchLocalNotebooks(directoryPath, keyword, top)
  })

  ipcMain.handle('read-local-file', async (_, filePath) => {
    return await fs.readFile(path.resolve(filePath), 'utf-8')
  })

  ipcMain.handle('write-local-file', async (_, filePath, content) => {
    await fs.outputFile(path.resolve(filePath), content, 'utf-8')
    return true
  })

  ipcMain.handle('create-local-directory', async (_, directoryPath) => {
    await fs.ensureDir(path.resolve(directoryPath))
    return true
  })

  ipcMain.handle('rename-local-entry', async (_, entryPath, newName) => {
    const targetPath = path.resolve(entryPath)
    const nextPath = path.join(path.dirname(targetPath), newName)
    await fs.move(targetPath, nextPath, { overwrite: false })
    return normalizeSlashes(nextPath)
  })

  ipcMain.handle('remove-local-entry', async (_, entryPath) => {
    await fs.remove(path.resolve(entryPath))
    return true
  })

  ipcMain.handle('copy-local-entry', async (_, sourcePath, targetPath) => {
    await fs.copy(path.resolve(sourcePath), path.resolve(targetPath), { overwrite: false, errorOnExist: true })
    return true
  })

  ipcMain.handle('move-local-entry', async (_, sourcePath, targetPath) => {
    await fs.move(path.resolve(sourcePath), path.resolve(targetPath), { overwrite: false })
    return true
  })

  ipcMain.handle('open-local-path', async (_, targetPath) => {
    return await shell.openPath(path.resolve(targetPath))
  })

  ipcMain.handle('watch-local-directory', async (_, directoryPath) => {
    await watchLocalDirectory(win, directoryPath)
    return true
  })

  ipcMain.handle('unwatch-local-directory', async (_, directoryPath) => {
    await unwatchLocalDirectory(directoryPath)
    return true
  })

  ipcMain.handle('get-app-update-state', async () => {
    return { ...updaterState }
  })

  ipcMain.handle('check-app-update', async () => {
    return await checkForAppUpdates()
  })

  ipcMain.handle('install-app-update', async () => {
    if (updaterState.status !== 'downloaded') return false
    setImmediate(() => autoUpdater.quitAndInstall())
    return true
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

if (!gotSingleInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', (_, argv) => {
    const win = BrowserWindow.getAllWindows()[0]
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.focus()

    const notebookPaths = collectNotebookPaths(argv)
    for (const notebookPath of notebookPaths) {
      emitNotebookOpen(notebookPath)
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.creatorsn.fabulous')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('get-window-state', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return getWindowState(win)
  })

  setupAutoUpdater()
  createWindow()
  const notebookPaths = collectNotebookPaths(process.argv.slice(1))
  for (const notebookPath of notebookPaths) {
    queueNotebookOpen(notebookPath)
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('open-file', (event, targetPath) => {
  event.preventDefault()
  emitNotebookOpen(targetPath)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
