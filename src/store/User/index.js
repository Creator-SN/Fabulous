import Vue from 'vue';

const User = {
    namespaced: true,
    state: {
        info: {
            id: null,
            name: null,
            nickname: null,
            avatar: '',
            createdAt: null,
            lastLoginAt: null
        }
    },
    mutations: {
        setInfo(state, info) {
            Object.assign(state.info, info);
        },
        clearInfo(state) {
            state.info = {
                id: null
            };
        }
    },
    actions: {
        async getInfo(context) {
            let token = localStorage.getItem('ApiToken');
            if (!token) return;
            await Vue.prototype.$api.UserController.getMyUserInfo()
                .then((res) => {
                    if (res.code === 200) {
                        context.commit('setInfo', res.data);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        async getAvatar(context) {
            if (!context.state.info.id) return;
            await Vue.prototype.$api.UserController.getAvatar(context.state.info.id)
                .then((res) => {
                    if (res.code == 200)
                        context.commit('setInfo', { avatar: res.data });
                })
                .catch(() => { });
        }
    },
    getters: {}
};

export default User;
