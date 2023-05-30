import * as api from './api';

export default {
    install: (Vue) => {
        Vue.prototype.$local_api = api;
    },
};

export { api };
