import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        // DBClass //
        ConfigDB: null,
        DataDB: null,
        // config //
        config: {
            init_status: true,
            data_path: [],
            data_index: -1,
            language: 'en',
            autoSave: false,
            dynamicEffect: true,
            theme: 'light'
        },
        // ds //
        data_structure: {
            id: null,
            name: null,
            groups: [],
            partitions: [],
            items: [],
            templates: [],
            path: null,
            createDate: null,
        },
        //
        editor: {
            show: false, // 显示编辑器
            type: null, // 编辑器操作类型 item 或 template
            item: null, // 当前绑定的item
            target: null, // 当前绑定的page
            scrollTop: 0, // 当前编辑器滚动条位置
            displayMode: 0, // 当前编辑器显示模式 0: 笔记 1: PDF 2: 双栏
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
            c: 0
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
        initDB(state, obj) {
            for (let key in obj) {
                if (key === 'ConfigDB' || key === 'DataDB') {
                    state[key] = obj[key];
                }
            }
        },
        setWindowSize(state, obj) {
            state.window.width = obj.width;
            state.window.height = obj.height;
        },
        async reviseConfig(state, obj) {
            if (!state.ConfigDB) return;
            for (let key in obj) {
                if (!Object.prototype.hasOwnProperty.call(state.config, key)) // 要用undefined比较好, 因为其他情况也有可能false.
                    continue;
                state.config[key] = obj[key];
                await state.ConfigDB.set(key, state.config[key]).write();
            }
        },
        reviseData(state, obj) {
            for (let key in obj) {
                if (!Object.prototype.hasOwnProperty.call(state.data_structure, key))
                    continue;
                state.data_structure[key] = obj[key];
                state.DataDB.set(key, state.data_structure[key]).write();
            }
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
            if (!state.ConfigDB) return;
            if (state.config.theme == 'light') {
                state.config.theme = 'dark'
            } else {
                state.config.theme = 'light'
            }
            await state.ConfigDB.set('theme', state.config.theme).write();
        },
        toggleEditor(state, status) {
            state.editor.show = status;
        }
    },
    actions: {},
    getters: {
        local: state => text => {
            let result = state.i18n[text];
            if (!result)
                return text;
            return result[state.config.language];
        },
        ds_db: state => {
            return state.DataDB;
        }
    },
    modules: {

    }
});