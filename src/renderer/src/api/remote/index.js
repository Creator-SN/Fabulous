import * as api from './api';
import axios from './config'

export default {
    install(app) {
        app.config.globalProperties.$api = api
    }
};

export { api };
