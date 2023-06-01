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