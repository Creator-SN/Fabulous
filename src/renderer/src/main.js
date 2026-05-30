import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import VueFluent from "@creatorsn/vfluent3";
import '@creatorsn/vfluent3/style.css';

import PowerEditor from "@creatorsn/powereditor3";
import "@creatorsn/powereditor3/powereditor3.css";

import axios from 'axios'

const fabAxios = axios.create({
  timeout: 5000,
})

import { GlobalWorkerOptions, getDocument, TextLayer } from 'pdfjs-dist/build/pdf.mjs'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerPort = new Worker(pdfjsWorker, { type: 'module' })

import api from "./api/remote";

const app = createApp(App)
app.use(VueFluent);

app.use(PowerEditor);

app.use(createPinia())
app.use(router)

app.config.globalProperties.$PDFJS = {
    getDocument,
    TextLayer
};

app.config.globalProperties.$Go = (str) => {
    router.push(str)
}

app.config.globalProperties.$Back = () => {
    router.back()
}

app.config.globalProperties.$Jump = (str) => {
    window.open(str)
}

app.config.globalProperties.$Guid = () => {
    let guid = app.config.globalProperties.$SUtility.Guid();
    guid = guid.split('-')[0];
    return guid;
}

app.config.globalProperties.$date = (str, timezone = 1000) => {
    if (typeof (str) === 'number') str = str * timezone;
    let date = new Date(str);
    return app.config.globalProperties.$SDate.Format("YYYY-mm-dd HH:MM", date);
}

app.config.globalProperties.$axios = fabAxios;

const remote_server = import.meta.env.VITE_API_BASE_URL;
app.config.globalProperties.$server = remote_server;
app.config.globalProperties.$remote_server = remote_server;

app.use(api);

app.mount('#app')
