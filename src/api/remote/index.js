import * as api from './api';

export default {
    install: (Vue) => {
        Vue.prototype.$api = api;
    },
};

export { api };
