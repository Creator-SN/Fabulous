import Vue from 'vue';
import { config as configSample } from '@/js/data_sample';

const config = {
    namespaced: true,
    state: {
        configId: null,
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
        dataPathItem: { path: null, local: true },
        isConfigMounted: false, // 防止加载前覆盖源配置 (prevent overwriting the source configuration before loading)
        themeColorList: [],
        theme: 'light'
    },
    mutations: {

    },
    actions: {
        async initRemoteConfig(context, obj = null) {
            let id = context.rootState.User.info.id;
            if (id) {
                let target = Object.assign({}, context.state);
                if (obj) target = Object.assign(target, obj);
                target.data_path = target.data_path.filter((item) => !item.local);
                target.userId = id;
                await Vue.prototype.$api.ConfigController.createOrUpdateConfig(obj ? obj : context.state).then((res) => {
                    if (res.code === 200) {
                        console.log('init remote config success');
                    }
                }
                ).catch((err) => {
                    console.log(err);
                });
            }
        },
        async getConfig(context) {
            let _config = JSON.parse(JSON.stringify(configSample));
            // 本地配置获取 //
            await Vue.prototype.$local_api.ConfigController.getConfig().then((res) => {
                if (res.status === 'success') {
                    let target = res.data;
                    for (let key in _config) {
                        if (!Object.prototype.hasOwnProperty.call(target, key))
                            // 要用undefined比较好, 因为其他情况也有可能false.
                            continue;
                        else if (key === 'data_path') {
                            _config[key] = target[key].filter((item) => item.local);
                        }
                        else
                            _config[key] = target[key];
                    }
                }
            }).catch(res => {
                console.warn(res);
            });
            // 远程配置获取 //
            let id = context.rootState.User.info.id;
            if (id) {
                await Vue.prototype.$api.ConfigController.getConfig(id).then((res) => {
                    if (res.code === 200) {
                        let target = res.data;
                        if (!target.configId) context.dispatch('initRemoteConfig', _config);
                        for (let key in _config) {
                            if (!Object.prototype.hasOwnProperty.call(target, key))
                                // 要用undefined比较好, 因为其他情况也有可能false.
                                continue;
                            else if (key === 'data_path') {
                                for (let i = 0; i < target[key].length; i++) {
                                    if (!target[key][i].path) target[key][i].path = target[key][i].id;
                                }
                                _config[key] = _config[key].concat(target[key]);
                            }
                            else
                                _config[key] = target[key];
                        }
                    }
                }
                ).catch((err) => {
                    console.log(err);
                });
            }
            // 如果data_index不存在, 则默认选中第一个 //
            if (!_config['data_path'].find(it => it.path === _config['data_index'] || it === _config['data_index'])) {
                if (_config['data_path'].length > 0) {
                    _config['data_index'] = _config['data_path'][0].path;
                }
                else
                    _config['data_index'] = -1;
            }
            // 配置赋予state //
            for (let key in _config) {
                Vue.set(context.state, key, _config[key]);
            }
            Vue.set(context.state, 'isConfigMounted', true);
            context.dispatch('refreshDataPathItem');
            console.log('finished get config')
        },
        async reviseConfig({ state, rootState }, obj) {
            for (let key in obj) {
                if (!Object.prototype.hasOwnProperty.call(state, key)) // 要用undefined比较好, 因为其他情况也有可能false.
                    continue;
                Vue.set(state, key, obj[key]);
            }
            if (!state.isConfigMounted) return;
            await Vue.prototype.$local_api.ConfigController.createOrUpdateConfig(state);
            let id = rootState.User.info.id;
            if (id) {
                let remoteTarget = Object.assign({}, state);
                remoteTarget.data_path = remoteTarget.data_path.filter((item) => !item.local);
                remoteTarget.userId = id;
                await Vue.prototype.$api.ConfigController.createOrUpdateConfig(remoteTarget);
            }
        },
        refreshDataPathItem({ state }) {
            if (state.data_path.length == 0) {
                state.dataPathItem = { path: null, local: true };
                return;
            }
            if (state.data_path[state.data_index]) {
                state.dataPathItem = state.data_path[state.data_index];
                return;
            }
            let dataPathItem = state.data_path.find(item => item.path === state.data_index);
            if (dataPathItem)
                state.dataPathItem = dataPathItem;
            else state.dataPathItem = { path: null, local: true };
        }
    },
    getters: {}
};

export default config;
