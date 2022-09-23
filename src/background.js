'use strict'

import { app, protocol, ipcMain, BrowserWindow, shell, globalShortcut, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { autoUpdater } from 'electron-updater'
import logger from "electron-log"
const isDevelopment = process.env.NODE_ENV !== 'production'

const translate = require('google-translate-cn-api');

var fs = require('fs-extra');
const path = require('path');

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])
logger.transports.file.level = "debug"
autoUpdater.logger = logger

autoUpdater.setFeedURL({
    repo: "Fabulous",
    provider: "github",
    owner: "Creator-SN",
})

autoUpdater.on("update-available", function (args) {
    autoUpdater.logger.log(args)
});
autoUpdater.on("update-not-available", function (args) {
    autoUpdater.logger.log(args)
});

autoUpdater.on("error", (err) => {
    autoUpdater.logger.log(err)
})



autoUpdater.on("checking-for-update", function (args) {
    autoUpdater.logger.log(args)
});

autoUpdater.on("download-progress", function (progressObj) {
    autoUpdater.logger.log(progressObj)
});

autoUpdater.on('update-downloaded', (info) => {
    autoUpdater.logger.log(info)
    autoUpdater.quitAndInstall();
});

let win = null;
async function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        frame: false,
        width: 1200,
        height: 600,
        minWidth: 800,
        minHeight: 500,
        webPreferences: {
            enableRemoteModule: true,
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
            webSecurity: false,
            devTools: true
        }
    })

    ipcMain.on("min", () => {
        win.minimize();
    });

    ipcMain.on("max", () => {
        if (win.isMaximized())
            win.restore();
        else
            win.maximize();
    });

    ipcMain.on("close", () => {
        win.close();
    });

    ipcMain.on("ensure-folder", (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        fs.ensureDir(obj.dir, err => {
            if (err) event.reply(`ensure-folder-${obj.id}`, {
                status: 500,
                target: obj.target
            });
            else event.reply(`ensure-folder-${obj.id}`, {
                status: 200,
                target: obj.target
            });
        });
    });

    ipcMain.on("ensure-file", (event, dir) => {
        fs.ensureDir(dir).then(() => {
            event.reply('ensure-file-callback', 200);
        });
    });

    ipcMain.on("list-dir", (event, { dir, target }) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                event.reply('list-dir-callback', {
                    status: err,
                    dir: dir,
                    files: [],
                    target: target
                });
                return;
            }
            let fileList = [];
            let promises = [];
            files.forEach(filename => {
                let fileObj = {};
                fileObj.filePath = path.join(dir, filename);

                promises.push(new Promise(resolve => {
                    fs.stat(fileObj.filePath, (error, stats) => {
                        if (!error) {
                            fileObj.name = filename;
                            fileObj.isFile = stats.isFile();
                            fileObj.isDir = stats.isDirectory();
                            fileList.push(fileObj);
                            resolve(1);
                        }
                    });
                }))
            });
            Promise.all(promises).then(() => {
                event.reply('list-dir-callback', {
                    status: err,
                    dir: dir,
                    files: fileList,
                    target: target
                });
            });
        });
    });

    ipcMain.on("read-file", (event, obj) => {
        fs.readFile(obj.path, 'utf8', (err, data) => {
            if (err) return console.error(err)
            event.reply(`read-file-${obj.id}`, data);
        });
    });

    ipcMain.on("read-binary", (event, obj) => {
        fs.readFile(obj.path, (err, data) => {
            if (err) return console.error(err)
            event.reply(`read-binary-${obj.id}`, data);
        });
    });

    ipcMain.on("output-file", (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        fs.outputFile(obj.path, obj.data, err => {
            if (err) event.reply(`output-file-${obj.id}`, {
                status: 500,
                target: obj.target,
                message: err
            });
            else event.reply(`output-file-${obj.id}`, {
                status: 200,
                target: obj.target
            });
        });
    });

    ipcMain.on("remove-file", (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        fs.unlink(obj.path, (err) => {
            if (err) event.reply(`remove-file-${obj.id}`, {
                status: 500,
                target: obj.target,
                message: err
            });
            event.reply(`remove-file-${obj.id}`, {
                status: 200,
                target: obj.target
            });
        });
    });

    ipcMain.on("remove-folder", (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        fs.rmdir(obj.path, { recursive: true }, (err) => {
            if (err) event.reply(`remove-folder-${obj.id}`, {
                status: 500,
                target: obj.target,
                message: err
            });
            event.reply(`remove-folder-${obj.id}`, {
                status: 200,
                target: obj.target
            });
        });
    });

    ipcMain.on("rename", (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        fs.rename(obj.path, obj.newPath, (err) => {
            if (err) event.reply(`rename-${obj.id}`, {
                status: 500,
                target: obj.target,
                message: err
            });
            event.reply(`rename-${obj.id}`, {
                status: 200,
                target: obj.target
            });
        });
    });

    ipcMain.on("copy-file", (event, obj) => {
        fs.copy(obj.src, obj.tgt, err => {
            if (err) return console.error(err)
            event.reply('copy-file-callback', 200);
        });
    });

    ipcMain.on("open-file", (event, path) => {
        fs.access(path, err => {
            // fix: 修复中文路径不能打开的问题
            shell.openPath(path)
            event.reply('open-file-callback', err);
        });
    });

    ipcMain.on("translate", (event, obj) => {
        translate(obj.text, { from: obj.from, to: obj.to }).then(res => {
            if (obj.id) {
                event.reply(`translate-callback:${obj.id}`, res);
            }
            else
                event.reply('translate-callback', res);
        })
    });

    let positionInfo = () => {
        let position = win.getPosition();
        let displays = screen.getAllDisplays();
        let maxXDisplay = displays[0];
        let maxYDisplay = displays[0];
        displays.sort((a, b) => b.bounds.x - a.bounds.x);
        maxXDisplay = displays[0];
        displays.sort((a, b) => b.bounds.y - a.bounds.y);
        maxYDisplay = displays[0];
        return {
            left: position[0],
            top: position[1],
            totalScreenWidth: maxXDisplay.bounds.x + maxXDisplay.bounds.width,
            totalScreenHeight: maxYDisplay.bounds.y + maxYDisplay.bounds.height
        }

    }

    ipcMain.on("move", (event) => {
        event.reply("move", positionInfo());
    });

    win.on("move", () => {
        win.webContents.send("move", positionInfo());
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }

    autoUpdater.checkForUpdatesAndNotify();
}



// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()

    // 注册 devtools 用以生产环境的下的异常调试
    globalShortcut.register('CommandOrControl+Shift+L', () => {
        let focusWin = BrowserWindow.getFocusedWindow()
        focusWin && focusWin.toggleDevTools()
    })
})

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
            win.show()
        }
    })
    // 创建 myWindow, 加载应用的其余部分, etc...
    // app.on('ready', () => {
    // })
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}
