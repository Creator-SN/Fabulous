'use strict'

import { app, protocol, ipcMain, BrowserWindow, shell, globalShortcut, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { autoUpdater } from 'electron-updater'
import logger from "electron-log"
const isDevelopment = process.env.NODE_ENV !== 'production'
import * as remote from "@electron/remote/main"
remote.initialize()

const { microsoft } = require('translate-platforms');

var fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])

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
    remote.enable(win.webContents)

    ipcMain.on("min", () => {
        win.minimize();
    });

    ipcMain.on("max", () => {
        if (process.platform === "darwin") {
            if (win.isMaximized()) {
                win.setFullScreen(false);
            } else {
                win.setFullScreen(true);
            }
        }
        else {
            if (win.isMaximized())
                win.restore();
            else
                win.maximize();
        }
    });

    ipcMain.on("close", () => {
        if (process.platform === "darwin") {
            app.hide();
        }
        else {
            win.close();
        }
    });

    ipcMain.on("ensure-folder", (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        fs.ensureDir(obj.dir, err => {
            if (err) event.reply(`ensure-folder-${obj.id}`, {
                status: 500,
                target: obj.target,
                message: err
            });
            else event.reply(`ensure-folder-${obj.id}`, {
                status: 200,
                target: obj.target
            });
        });
    });

    ipcMain.on("ensure-file", (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        fs.ensureFile(obj.path, err => {
            if (err) event.reply(`ensure-file-${obj.id}`, {
                status: 500,
                target: obj.target,
                message: err
            });
            else event.reply(`ensure-file-${obj.id}`, {
                status: 200,
                target: obj.target
            });
        });
    });

    ipcMain.on("exists-path", (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        fs.pathExists(obj.path, (err, exists) => {
            if (err) event.reply(`exists-path-${obj.id}`, {
                status: 500,
                target: obj.target,
                exists: exists,
                message: err
            });
            else event.reply(`exists-path-${obj.id}`, {
                status: 200,
                target: obj.target,
                exists: exists
            });
        });
    });

    ipcMain.on("list-dir", (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        fs.readdir(obj.dir, (err, files) => {
            if (err) {
                event.reply(`list-dir-${obj.id}`, {
                    status: err,
                    dir: obj.dir,
                    files: [],
                    target: obj.target
                });
                return;
            }
            let fileList = [];
            let promises = [];
            files.forEach(filename => {
                let fileObj = {};
                fileObj.filePath = path.join(obj.dir, filename).replace(/\\/g, '/');

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
                event.reply(`list-dir-${obj.id}`, {
                    status: err,
                    dir: obj.dir,
                    files: fileList,
                    target: obj.target
                });
            });
        });
    });

    ipcMain.on("read-file", (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        fs.readFile(obj.path, 'utf8', (err, data) => {
            if (err) event.reply(`read-file-${obj.id}`, {
                status: 500,
                data: "",
                target: obj.target,
                message: err
            });
            event.reply(`read-file-${obj.id}`, {
                status: 200,
                data,
                target: obj.target,
                message: err
            });
        });
    });

    ipcMain.on("read-binary", (event, obj) => {
        fs.readFile(obj.path, (err, data) => {
            if (err) event.reply(`read-binary-${obj.id}`, {
                status: 500,
                data: "",
                target: obj.target,
                message: err
            });
            event.reply(`read-binary-${obj.id}`, {
                status: 200,
                data,
                target: obj.target,
                message: err
            });
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
        if (!obj.id) obj.id = 'callback';
        fs.copy(obj.src, obj.tgt, err => {
            if (err) return event.reply(`copy-file-${obj.id}`, {
                status: 500,
                target: obj.target,
                message: err
            });
            event.reply(`copy-file-${obj.id}`, {
                status: 200,
                target: obj.target,
            });
        });
    });

    ipcMain.on("move-file", (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        fs.move(obj.src, obj.tgt, err => {
            if (err) return event.reply(`move-file-${obj.id}`, {
                status: 500,
                target: obj.target,
                message: err
            });
            event.reply(`move-file-${obj.id}`, {
                status: 200,
                target: obj.target,
            });
        });
    });

    ipcMain.on('save-buffer', (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        let buffer = obj.data;
        fs.writeFile(obj.path, buffer, err => {
            if (err) return event.reply(`save-blob-${obj.id}`, {
                status: 500,
                target: obj.target,
                message: err
            });
            event.reply(`save-blob-${obj.id}`, {
                status: 200,
                target: obj.target,
            });
        });
    });

    ipcMain.on("open-file", (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        fs.access(obj.path, err => {
            if (err) event.reply(`open-file-${obj.id}`, {
                status: 500,
                message: err
            });
            else {
                // fix: 修复中文路径不能打开的问题
                if (process.platform == 'win32') {
                    shell.openPath(obj.path.replace(/\//g, '\\'));
                }
                else
                    shell.openPath(obj.path.replace(/\\/g, '/'));
                event.reply(`open-file-${obj.id}`, {
                    status: 200
                });
            }
        });
    });

    let chokidarWatcher = null;
    ipcMain.on("watch-path", async (event, obj) => {
        if (!obj.id) obj.id = 'callback';
        try {
            if (!chokidarWatcher) console.log('not watching yet');
            else {
                await new Promise(resolve => {
                    chokidarWatcher.close().then(() => {
                        console.log('change-path', obj.path);
                        resolve(0);
                    });
                });
            }
        }
        catch (e) {
            console.log('not watching yet', e);
        }
        chokidarWatcher = chokidar.watch(obj.path).on('all', (event, p) => {
            if (event === 'add' || event === 'addDir') {
                let fileObj = {};
                fs.stat(p, (error, stats) => {
                    if (!error) {
                        fileObj.filePath = p.replace(/\\/g, '/');
                        fileObj.relativePath = (path.relative(obj.path, p)).replace(/\\/g, '/');
                        fileObj.name = path.basename(p);
                        fileObj.isFile = stats.isFile();
                        fileObj.isDir = stats.isDirectory();
                        win.webContents.send(`watch-path-${obj.id}`, {
                            status: 200,
                            file: fileObj,
                            event,
                            path: p
                        });
                    }
                    else
                        win.webContents.send(`watch-path-${obj.id}`, {
                            status: 500,
                            message: error
                        });
                });
            }
            else
                win.webContents.send(`watch-path-${obj.id}`, {
                    status: 200,
                    event,
                    path: p
                });
        });
    });

    ipcMain.on("translate", async (event, obj) => {
        try {
            const result = await microsoft(obj.text, { to: microsoft.zh });
            console.log(result)
            if (obj.id) {
                event.reply(`translate-callback-${obj.id}`, {
                    data: result,
                    status: 200,
                });
            }
            else
                event.reply('translate-callback', {
                    data: result,
                    status: 200,
                });
        }
        catch (e) {
            if (obj.id) {
                event.reply(`translate-callback-${obj.id}`, {
                    status: 200,
                    data: {
                        text: '翻译失败'
                    },
                    message: e
                });
            }
            else
                event.reply('translate-callback', {
                    status: 200,
                    data: {
                        text: '翻译失败'
                    },
                    message: e
                });
        }
    });

    let positionInfo = () => {
        let position = win.getPosition();
        let displays = screen.getAllDisplays();
        let totalScreenWidth = 0;
        let totalScreenHeight = 0;
        displays.forEach(display => {
            totalScreenWidth += display.bounds.width;
            totalScreenHeight += display.bounds.height;
        });
        return {
            left: position[0],
            top: position[1],
            totalScreenWidth: totalScreenWidth,
            totalScreenHeight: totalScreenHeight
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
        setTimeout(() => {
            win.webContents.send("updater-callback", {
                status: "latest",
                info: args
            });
        }, 1500);
        autoUpdater.logger.log(args)
    });

    autoUpdater.on("error", (err) => {
        autoUpdater.logger.log(err)
    })



    autoUpdater.on("checking-for-update", function (args) {
        setTimeout(() => {
            win.webContents.send("updater-callback", {
                status: "checking",
                info: args
            });
        }, 1000);
        autoUpdater.logger.log(args)
    });

    autoUpdater.on("download-progress", function (progressObj) {
        win.webContents.send("updater-callback", {
            status: "loading",
            info: progressObj
        });
        autoUpdater.logger.log(progressObj)
    });

    autoUpdater.on('update-downloaded', (info) => {
        autoUpdater.logger.log(info)
        autoUpdater.quitAndInstall();
    });

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
    win.show();
})

// On Mac OS open with file path.
app.on("open-file", async (event, path) => {
    if (!win) {
        let i = 0
        while (i < 10) {
            await new Promise(resolve => setTimeout(resolve, 600));
            i += 1;
            if (win) {
                setTimeout(() => {
                    win.webContents.send("open-notebook", [path]);
                }, 600);
                break;
            }
        }
    }
    win.webContents.send("open-notebook", [path]);
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
    app.on('second-instance', (event, argv) => {
        // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
            win.show()
            if (process.platform !== 'darwin') {
                win.webContents.send("open-notebook", argv)
            }
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
