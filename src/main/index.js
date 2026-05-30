import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import remoteMain from '@electron/remote/main'

const isDevelopment = process.env.NODE_ENV !== 'production'

remoteMain.initialize()

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

  remoteMain.enable(win.webContents)

  win.on('ready-to-show', () => {
    win.show()
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

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

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
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
