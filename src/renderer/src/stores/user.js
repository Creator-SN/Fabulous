import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getProxy } from '@/stores/proxyHolder'

export const useUserStore = defineStore('user', () => {
    const proxy = getProxy()

    const lock = ref({
        avatarById: {},
        infoById: {}
    })

    // state
    const info = ref({
        id: null,
        name: null,
        nickname: null,
        avatar: '',
        createdAt: null,
        lastLoginAt: null
    })

    const avatarCache = ref({});
    const infoCache = ref({});

    // actions
    async function getInfo() {
        let token = localStorage.getItem('ApiToken');
        if (!token) return;
        await proxy.$api.UserController.getMyUserInfo()
            .then((res) => {
                if (res.code === 200) {
                    Object.assign(info.value, res.data);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    async function getAvatar() {
        if (!info.value.id) return;
        await proxy.$api.UserController.getAvatar(info.value.id)
            .then((res) => {
                if (res.code == 200)
                    Object.assign(info.value, { avatar: res.data });
            })
            .catch(() => { });
    }

    async function refreshUserInfo() {
        await getInfo();
        await getAvatar();
    }

    function setInfo(newInfo) {
        Object.assign(info.value, newInfo);
    }

    function clearInfo() {
        info.value = {
            id: null
        };
    }

    function setAvatarCache({
        key,
        avatar
    }) {
        avatarCache.value[key] = avatar;
    }

    function setInfoCache({
        key,
        info
    }) {
        infoCache.value[key] = info;
    }

    async function getUserInfoByUserId(userId) {
        if (!userId) return null;
        if (lock.value.infoById[userId] === 'locked') return;
        lock.value.infoById[userId] = 'locked';
        if (infoCache.value[userId]) return infoCache.value[userId];
        let res = await proxy.$api.UserController.getUserById(userId).catch(() => { });
        if (res.code == 200)
            setInfoCache({ key: userId, info: res.data });
        lock.value.infoById[userId] = '';
        return res.data;
    }

    async function getAvatarByUserId(userId) {
        if (!userId) return '';
        if (lock.value.avatarById[userId] === 'locked') return;
        lock.value.avatarById[userId] = 'locked';
        if (avatarCache.value[userId]) return avatarCache.value[userId];
        let res = await proxy.$api.UserController.getAvatar(userId).catch(() => { });
        if (res.code == 200)
            setAvatarCache({ key: userId, avatar: res.data });
        lock.value.avatarById[userId] = '';
        return res.data;
    }

    return {
        info,
        avatarCache,
        infoCache,
        getInfo,
        getAvatar,
        refreshUserInfo,
        setInfo,
        clearInfo,
        setAvatarCache,
        getUserInfoByUserId,
        getAvatarByUserId
    }
})