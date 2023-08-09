import Vue from 'vue';

const config = {
    namespaced: true,
    state: {
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
    mutations: {
        
    },
    actions: {
        async reviseConfig({ state }, obj) {
            for (let key in obj) {
                if (!Object.prototype.hasOwnProperty.call(state, key)) // 要用undefined比较好, 因为其他情况也有可能false.
                    continue;
                state[key] = obj[key];
            }
            await Vue.prototype.$local_api.Config.updateConfig(state);
        }
    },
    getters: {}
};

export default config;
