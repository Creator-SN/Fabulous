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
            // 配置赋予state //
            for (let key in _config) {
                Vue.set(context.state, key, _config[key]);
            }
            console.log('finished get config')
        },
        async reviseConfig({ state, rootState }, obj) {
            for (let key in obj) {
                if (!Object.prototype.hasOwnProperty.call(state, key)) // 要用undefined比较好, 因为其他情况也有可能false.
                    continue;
                Vue.set(state, key, obj[key]);
            }
            await Vue.prototype.$local_api.ConfigController.createOrUpdateConfig(state);
            let id = rootState.User.info.id;
            if (id) {
                let remoteTarget = Object.assign({}, state);
                remoteTarget.data_path = remoteTarget.data_path.filter((item) => !item.local);
                remoteTarget.userId = id;
                await Vue.prototype.$api.ConfigController.createOrUpdateConfig(remoteTarget);
            }
        }
    },
    getters: {}
};

export default config;
