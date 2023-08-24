import Vue from "vue";
import Vuex from "vuex";

// entry
import User from "./User";
import Theme from "./Theme";
import config from "./Config";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        editor: {
            show: false, // 显示编辑器
            type: null, // 编辑器操作类型 item 或 template
            item: null, // 当前绑定的item
            target: null, // 当前绑定的page
            scrollTop: 0, // 当前编辑器滚动条位置
            displayMode: 0, // 当前编辑器显示模式 0: 笔记 1: PDF 2: 双栏
            unsave: false, // 当前未保存
            targetContent: {
                type: "doc",
                content: []
            }, // 当前绑定的page内容(Json格式), 显示未保存内容
            pdfNoteInfo: {
                guid: "",
                version: ""
            }, // 当前绑定的pdfNote信息
            history: []
        },
        //
        pdfImporter: {
            value: false,
            item: null,
            mode: "item",
            pdf_importer: null,
            df: [],
            counter: 0
        },
        //
        itemCarrier: {
            itemsX: []
        },
        //
        window: {
            width: 0,
            height: 0,
            mobileDisplay: 1024
        },
        progress: 0,
        i18n: {}
    },
    mutations: {
        setWindowSize(state, obj) {
            state.window.width = obj.width;
            state.window.height = obj.height;
        },
        reviseEditor(state, obj) {
            for (let key in obj) {
                if (!Object.prototype.hasOwnProperty.call(state.editor, key))
                    continue;
                state.editor[key] = obj[key];
            }
        },
        revisePdfImporter(state, obj) {
            for (let key in obj) {
                if (!Object.prototype.hasOwnProperty.call(state.pdfImporter, key))
                    continue;
                state.pdfImporter[key] = obj[key];
            }
        },
        reviseItemCarrier(state, obj) {
            for (let key in obj) {
                if (!Object.prototype.hasOwnProperty.call(state.itemCarrier, key))
                    continue;
                state.itemCarrier[key] = obj[key];
            }
        },
        reviseProgress(state, obj) {
            state.progress = obj;
        },
        reviseI18N(state, i18n) {
            state.i18n = i18n
        },
        toggleEditor(state, status) {
            state.editor.show = status;
        },
        refreshAutoAPI(state) {
            let isLocal = true;
            if (state.config.data_path[state.config.data_index])
                isLocal = state.config.data_path[state.config.data_index].local;
            let dataPathItem = state.config.data_path.find(item => item.path === state.config.data_index);
            if (dataPathItem)
                isLocal = dataPathItem.local;
            if (isLocal) Vue.prototype.$auto = Vue.prototype.$local_api;
            else Vue.prototype.$auto = Vue.prototype.$api;
        }
    },
    actions: {
        async toggleTheme(context) {
            const state = context.state;
            if (state.config.theme == 'light') {
                state.config.theme = 'dark'
            } else {
                state.config.theme = 'light'
            }
            await context.dispatch("config/reviseConfig", state.config);
        },
        async reviseConfig(context, obj) {
            context.dispatch("config/reviseConfig", obj);
        }
    },
    getters: {
        local: state => text => {
            let result = state.i18n[text];
            if (!result)
                return text;
            return result[state.config.language];
        },
        currentDataPathItem: state => {
            return state.config.dataPathItem;
        },
        currentDataPath: state => {
            return state.config.dataPathItem.path;
        }
    },
    modules: {
        User,
        Theme,
        config
    }
});