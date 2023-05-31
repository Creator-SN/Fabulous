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

class NotebookWatcher extends EventWatcher {
    constructor() {
        super();

        this.ipcInit();
    }

    ipcInit() {
        let { ipcRenderer: ipc } = require("electron");
        this.ipc = ipc;
    }

    ipcEventInit() {
        let forwardIPCList = [
            "output-file-localTree",
            "ensure-folder-localTree",
            "copy-file-localTree",
            "move-file-localTree",
            "remove-file-localTree",
            "remove-folder-localTree",
            "rename-localTree",
            "watch-path-localTree"
        ];
        for (let item of forwardIPCList) {
            this.ipc.on(item, (event, arg) => {
                this.emit(item, event, arg);
            });
        }
    }
}