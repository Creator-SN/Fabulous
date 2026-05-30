import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { config as configSample } from '@/js/data_sample'

import { getProxy } from '@/stores/proxyHolder'

export const useDataStore = defineStore('data', () => {
    const proxy = getProxy()

    // state
    const configState = ref({
        configId: null,
        init_status: false,
        data_index: -1,
        language: 'en',
        autoSave: false,
        lastLocalPath: '',
        editorExpandContent: false,
        editorSplitRatio: 0.5,
        editorShowNav: true,
        activeSystemMode: 'both',
        dynamicEffect: true,
        watchAllExtensions: false,
        isConfigMounted: false,
        themeColorList: [],
        theme: 'light'
    })
    const data_path = ref([])
    const lock = ref({
        config: true,
        data_path: true,
        permission_groups: true,
        permission_group_users: true,
        permission_group_invite: true,
        permission_group_user_update: true,
        user_search: true
    })

    // getters
    const currentDataPathItem = computed(() => {
        let item = data_path.value.find((item) => item.path === configState.value.data_index);
        if (item)
            return item;
        else
            return { path: null, local: true };
    })
    const currentDataPathOwner = computed(() => currentDataPathItem.value.userId)
    const currentDataPath = computed(() => currentDataPathItem.value.path)

    function warningMessage(message) {
        if (!message)
            return;
        proxy.$barWarning(message, {
            status: 'warning'
        })
    }

    // actions
    async function getDataPath() {
        if (!lock.value.data_path)
            return;
        let id = useUserStore().info.id;
        if (id) {
            lock.value.data_path = false;
            await proxy.$api.ConfigController.listDataSources().then((res) => {
                if (res.code === 200) {
                    data_path.value = res.data;
                }
                else
                    data_path.value = [];
            })
                .catch((err) => {
                    data_path.value = [];
                    console.log(err);
                });
            lock.value.data_path = true;

            await checkDataIndex();
        }
    }

    async function checkDataIndex() {
        // 如果data_index不存在, 则默认选中第一个 //
        if (data_path.value.length > 0) {
            if (configState.value.data_index === -1)
                configState.value.data_index = data_path.value[0].path;
            else if (!data_path.value.find((it) => it.path === configState.value.data_index))
                configState.value.data_index = data_path.value[0].path;
        }
        else
            configState.value.data_index = -1;
        await reviseConfig({
            data_index: configState.value.data_index
        })
    }

    async function addDataSource(name) {
        if (name === '') return
        let resp = await proxy.$api.ConfigController.createDataSource({
            name: name
        })
            .then((res) => {
                if (res.code !== 200) {
                    proxy.$barWarning(res.message, {
                        status: 'warning'
                    })
                }
                return res;
            })
            .catch((res) => {
                proxy.$barWarning(res.message, {
                    status: 'warning'
                })
                return res;
            })
        return resp;
    }

    async function reviseDataSource(pathid, name) {
        if (name === '') return
        if (!lock.value.data_path)
            return;
        lock.value.data_path = false;
        let resp = await proxy.$api.ConfigController.updateDataSource(pathid, {
            name: name
        })
            .then(async (res) => {
                if (res.code !== 200) {
                    warningMessage(res.message);
                    await getDataPath();
                }
                return res;
            })
            .catch((res) => {
                warningMessage(res.message);
                return res;
            })
            .finally(() => {
                lock.value.data_path = true;
            })
        return resp;
    }

    async function listSourcePermissionGroups(pathid) {
        if (!pathid)
            return { code: 400, data: [] };
        if (!lock.value.permission_groups)
            return { code: 423, data: [] };
        lock.value.permission_groups = false;
        let resp = await proxy.$api.ConfigController.listSourcePermissionGroups(pathid)
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.permission_groups = true;
            });
        return resp;
    }

    async function listMySourcePermissionGroups(pathid) {
        if (!pathid)
            return { code: 400, data: [] };
        if (!lock.value.permission_groups)
            return { code: 423, data: [] };
        lock.value.permission_groups = false;
        let resp = await proxy.$api.ConfigController.listMySourcePermissionGroups(pathid)
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.permission_groups = true;
            });
        return resp;
    }

    async function listVisibleSourcePermissionGroups(pathid, isOwner = true) {
        if (isOwner)
            return await listSourcePermissionGroups(pathid);
        return await listMySourcePermissionGroups(pathid);
    }

    async function createSourcePermissionGroup(pathid, payload) {
        if (!pathid)
            return { code: 400 };
        if (!lock.value.permission_groups)
            return { code: 423 };
        lock.value.permission_groups = false;
        let resp = await proxy.$api.ConfigController.createSourcePermissionGroup(pathid, payload)
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.permission_groups = true;
            });
        return resp;
    }

    async function updateSourcePermissionGroup(pathid, groupId, payload) {
        if (!pathid || !groupId)
            return { code: 400 };
        if (!lock.value.permission_groups)
            return { code: 423 };
        lock.value.permission_groups = false;
        let resp = await proxy.$api.ConfigController.updateSourcePermissionGroup(pathid, groupId, payload)
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.permission_groups = true;
            });
        return resp;
    }

    async function removeSourcePermissionGroup(pathid, groupId) {
        if (!pathid || !groupId)
            return { code: 400 };
        if (!lock.value.permission_groups)
            return { code: 423 };
        lock.value.permission_groups = false;
        let resp = await proxy.$api.ConfigController.removeSourcePermissionGroup(pathid, groupId)
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.permission_groups = true;
            });
        return resp;
    }

    async function listSourcePermissionGroupUsers(pathid, groupId, offset = 0, pageSize = 100) {
        if (!pathid || !groupId)
            return { code: 400, data: [] };
        if (!lock.value.permission_group_users)
            return { code: 423, data: [] };
        lock.value.permission_group_users = false;
        let resp = await proxy.$api.ConfigController.listSourcePermissionGroupUsers(pathid, groupId, offset, pageSize)
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.permission_group_users = true;
            });
        return resp;
    }

    async function createSourcePermissionGroupUser(pathid, groupId, userId) {
        if (!pathid || !groupId || !userId)
            return { code: 400 };
        if (!lock.value.permission_group_user_update)
            return { code: 423 };
        lock.value.permission_group_user_update = false;
        let resp = await proxy.$api.ConfigController.createSourcePermissionGroupUser(pathid, groupId, {
            userId
        })
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.permission_group_user_update = true;
            });
        return resp;
    }

    async function createSourcePermissionGroupInvite(pathid, groupId, expireDays) {
        if (!pathid || !groupId || !expireDays)
            return { code: 400 };
        if (!lock.value.permission_group_invite)
            return { code: 423 };
        lock.value.permission_group_invite = false;
        let resp = await proxy.$api.ConfigController.createSourcePermissionGroupInvite(pathid, groupId, {
            expireDays
        })
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.permission_group_invite = true;
            });
        return resp;
    }

    async function acceptSourcePermissionGroupInvite(inviteCode) {
        if (!inviteCode)
            return { code: 400 };
        if (!lock.value.permission_group_invite)
            return { code: 423 };
        lock.value.permission_group_invite = false;
        let resp = await proxy.$api.ConfigController.acceptSourcePermissionGroupInvite({
            inviteCode
        })
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.permission_group_invite = true;
            });
        return resp;
    }

    async function updateSourcePermissionGroupUser(pathid, groupId, relationId, payload = {}) {
        if (!pathid || !groupId || !relationId)
            return { code: 400 };
        if (!lock.value.permission_group_user_update)
            return { code: 423 };
        let requestPayload = {};
        if (typeof payload === 'string') {
            requestPayload.userId = payload;
        } else if (payload && typeof payload === 'object') {
            requestPayload = payload;
        }
        if (requestPayload.userId && typeof requestPayload.userId === 'object') {
            requestPayload = {
                ...requestPayload.userId,
                ...requestPayload
            };
            delete requestPayload.userId;
        }
        if (!requestPayload.userId && !requestPayload.userRole)
            return { code: 400 };
        lock.value.permission_group_user_update = false;
        let resp = await proxy.$api.ConfigController.updateSourcePermissionGroupUser(pathid, groupId, relationId, requestPayload)
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.permission_group_user_update = true;
            });
        return resp;
    }

    async function removeSourcePermissionGroupUser(pathid, groupId, relationId) {
        if (!pathid || !groupId || !relationId)
            return { code: 400 };
        if (!lock.value.permission_group_user_update)
            return { code: 423 };
        lock.value.permission_group_user_update = false;
        let resp = await proxy.$api.ConfigController.removeSourcePermissionGroupUser(pathid, groupId, relationId)
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.permission_group_user_update = true;
            });
        return resp;
    }

    async function searchUsers(query, limit = 20) {
        if (!query)
            return { code: 200, data: [] };
        if (!lock.value.user_search)
            return { code: 423, data: [] };
        lock.value.user_search = false;
        let resp = await proxy.$api.UserController.searchUsers(query, limit)
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.user_search = true;
            });
        return resp;
    }

    async function searchSourceUsers(pathid, query, limit = 20) {
        if (!pathid || !query)
            return { code: 200, data: [] };
        if (!lock.value.user_search)
            return { code: 423, data: [] };
        lock.value.user_search = false;
        let resp = await proxy.$api.ConfigController.searchSourceUsers(pathid, query, limit)
            .then((res) => {
                if (res.code !== 200)
                    warningMessage(res.message);
                return res;
            })
            .catch((err) => {
                warningMessage(err.message);
                return err;
            })
            .finally(() => {
                lock.value.user_search = true;
            });
        return resp;
    }

    async function removeDataSource(pathid) {
        if (!lock.value.data_path)
            return;
        let id = useUserStore().info.id;
        if (id) {
            lock.value.data_path = false;
            await proxy.$api.ConfigController.removeDataSource(pathid).then(async (res) => {
                if (res.code === 200) {
                    console.log('remove data source success');
                    lock.value.data_path = true;
                    await getDataPath();
                    if (configState.value.data_index === pathid) {
                        await checkDataIndex();
                    }
                }
                else
                    console.log(res);
            })
                .catch((err) => {
                    console.log(err);
                });
            lock.value.data_path = true;
        }
    }

    async function getConfig() {
        if (!lock.value.config)
            return;
        let _config = JSON.parse(JSON.stringify(configSample));
        // 远程配置获取 //
        let id = useUserStore().info.id;
        if (id) {
            lock.value.config = false;
            await proxy.$api.ConfigController.getConfig(id).then((res) => {
                if (res.code === 200) {
                    let target = res.data;
                    for (let key in _config) {
                        if (!Object.prototype.hasOwnProperty.call(target, key))
                            // 要用undefined比较好, 因为其他情况也有可能false.
                            continue;
                        else
                            _config[key] = target[key];
                    }
                }
            })
                .catch((err) => {
                    console.log(err);
                });
            lock.value.config = true;
        }

        // 配置赋予state //
        for (let key in configState.value) {
            configState.value[key] = _config[key];
        }

        console.log('finished get config')
    }

    async function refreshDataInfo() {
        await getConfig();
        await getDataPath();
    }

    async function reviseConfig(obj) {
        if (!lock.value.config)
            return;
        let id = useUserStore().info.id;
        if (id) {
            let remoteTarget = {
                ...configState.value,
                ...obj
            };
            remoteTarget.userId = id;
            lock.value.config = false;
            await proxy.$api.ConfigController.createOrUpdateConfig(remoteTarget).then((res) => {
                if (res.code === 200) {
                    console.log('revise remote config success');
                    for (let key in obj) {
                        configState.value[key] = obj[key];
                    }
                }
            })
                .catch((err) => {
                    console.log(err);
                });
            lock.value.config = true;
        }
    }

    return {
        // state
        configState,
        data_path,
        lock,
        // actions
        getDataPath,
        addDataSource,
        reviseDataSource,
        listSourcePermissionGroups,
        listMySourcePermissionGroups,
        listVisibleSourcePermissionGroups,
        createSourcePermissionGroup,
        updateSourcePermissionGroup,
        removeSourcePermissionGroup,
        listSourcePermissionGroupUsers,
        createSourcePermissionGroupUser,
        createSourcePermissionGroupInvite,
        acceptSourcePermissionGroupInvite,
        updateSourcePermissionGroupUser,
        removeSourcePermissionGroupUser,
        searchUsers,
        searchSourceUsers,
        removeDataSource,
        getConfig,
        refreshDataInfo,
        reviseConfig,
        // getters
        currentDataPathItem,
        currentDataPathOwner,
        currentDataPath
    }
})

// 导入用户store以避免循环依赖
import { useUserStore } from './user'
