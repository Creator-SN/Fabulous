import Vue from "vue";

const isdev = (process.env.NODE_ENV === "development")
console.log('Dev Env', isdev)

export class EventManager {
    constructor() {
        this.events = {};
    }

    on(eventName, handler) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(handler);
    }

    emit(eventName, ...args) {
        // 检查是否存在该事件的处理函数数组
        if (this.events[eventName]) {
            // 遍历事件的处理函数数组并依次调用处理函数
            this.events[eventName].forEach((handler) => {
                handler(...args);
            });
        }
    }
}

export class NotebookWatcher extends EventManager {
    constructor() {
        super();

        this.ipcInit();
        this.ipcEventInit();
    }

    ipcInit() {
        let { ipcRenderer: ipc } = require("electron");
        this.ipc = ipc;
    }

    ipcEventInit() {
        let forwardIPCList = [
            "watch-path-localTree",
            "open-notebook",
            "updater-callback"
        ];
        for (let item of forwardIPCList) {
            this.ipc.on(item, (event, arg) => {
                this.emit(item, event, arg);
            });
        }
    }

    send(eventName, obj) {
        this.ipc.send(eventName, obj);
    }
}

export class RemoteNotebookWatcher extends EventManager {
    constructor() {
        super();
    }

    eventSourceInit($server, dataPath) {
        let token = localStorage.getItem('ApiToken');
        if (!token) return;
        token = token.replace('Bearer ', '');
        if (this.eventSource) this.eventSource.close();
        this.eventSource = new EventSource(
            `${$server}/configs/sources/${dataPath}/chokidar?Authorization=${token}`
        );
        this.getChildren(dataPath);
    }

    callbackEventInit() {
        this.eventSource.addEventListener('message', (event) => {
            let data = JSON.parse(event.data);
            if (data.event === 'add' || data.event === 'addDir') {
                let fileObj = {};
                fileObj.filePath = data.path;
                fileObj.relativePath = data.relativePath;
                fileObj.name = data.name ? data.name : data.title;
                fileObj.isFile = data.file
                fileObj.isDir = data.dir
                data.file = fileObj;
            }
            this.emit("watch-path-localTree", event, {
                ...data
            });
            // if (isdev)
            //     console.log(data);
        });
        this.eventSource.addEventListener('error', (error) => {
            // console.log(error);
            this.emit("watch-path-localTree", error, {
                status: 500,
                message: error
            });
            if (this.eventSource) this.eventSource.close();
        });
    }

    getChildren(path) {
        this.emit('lock-loading', 'lock-loading', {});

        let id = path.split('/').pop();

        Vue.prototype.$api.NotebookController.getDirectoryChildren(id).then(res => {
            if (res.code === 200) {
                let children = res.data;
                children.forEach(item => {
                    item.event = item.type === 'group' ? 'addDir' : 'add';
                    item.path = path + '/' + item.id;
                    item.relativePath = item.id;
                    item.file = item.type !== 'group';
                    item.dir = item.type === 'group';

                    let fileObj = {};
                    fileObj.filePath = item.path;
                    fileObj.relativePath = item.relativePath;
                    fileObj.name = item.name ? item.name : item.title;
                    fileObj.isFile = item.file
                    fileObj.isDir = item.dir

                    item.file = fileObj;
                });
                for (let item of children) {
                    // if (isdev)
                    //     console.log(item);
                    this.emit("watch-path-localTree", item.event, item);
                }
                this.emit('unlock-loading', 'unlock-loading', {});
            }
        }).catch(err => {
            this.emit('unlock-loading', 'unlock-loading', {});
            console.log(err);
        });
    }

    send(eventName, obj) {
        if (eventName === 'watch-path') {
            console.log('refresh', obj.path)
            if (this.eventSource) this.eventSource.close();
            this.eventSourceInit(obj.server, obj.path);
            this.callbackEventInit();
        }
        else if (eventName === 'load-children') {
            this.getChildren(obj.filePath);
        }
    }

    destroy() {
        if (this.eventSource) this.eventSource.close();
        console.log('destroy');
    }
}