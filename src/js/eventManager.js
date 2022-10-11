export class EventManager {
    constructor(obj) {
        this.useIPC = obj.useIPC;
        this.defaultMethod = obj.defaultMethod;

        this.methodList = this.messageMethodsInit();
    }

    messageMethodsInit() {

        let methods = {};
        if (this.useIPC) {
            let { ipcRenderer: ipc } = require("electron");
            this.ipc = ipc;
        }
        methods.ipc = true;
        return methods;
    }

    setDefaultMethod(method='ipc') {
        this.defaultMethod = method;
    }
}