import Vue from "vue";
import Vuex from "vuex";

// entry
import User from "./User";
import Theme from "./Theme";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        // config //
        config: {
            init_status: false,
            data_path: [],
            data_index: -1,
            language: 'en',
            autoSave: false,
            lastLocalPath: '',
            editorExpandContent: false,
            editorSplitRatio: 0.5,
            editorShowNav: true,
            activeSystemMode: 'both', // ds, notebook, both
            dynamicEffect: true,
            watchAllExtensions: false,
            themeColorList: [],
            theme: 'light'
        },
        //
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
        async toggleTheme(state) {
            if (state.config.theme == 'light') {
                state.config.theme = 'dark'
            } else {
                state.config.theme = 'light'
            }
            await Vue.prototype.$local_api.Config.updateConfig(state.config);
        },
        toggleEditor(state, status) {
            state.editor.show = status;
        }
    },
    actions: {
        async reviseConfig({ state }, obj) {
            for (let key in obj) {
                if (!Object.prototype.hasOwnProperty.call(state.config, key)) // 要用undefined比较好, 因为其他情况也有可能false.
                    continue;
                state.config[key] = obj[key];
            }
            await Vue.prototype.$local_api.Config.updateConfig(state.config);
        }
    },
    getters: {
        local: state => text => {
            let result = state.i18n[text];
            if (!result)
                return text;
            return result[state.config.language];
        }
    },
    modules: {
        User,
        Theme
    }
});