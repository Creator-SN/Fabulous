// global @types helper Vscode
import Vue from "vue";
import store from "./src/store/";
import router from "./src/router/";
import { api } from "./src/api/remote";
import { api as local_api } from "./src/api/local"

declare module "vue/types/vue" {
    interface Vue {
        $store: typeof store;
        $router: typeof router;
        $api: typeof api;
        $local_api: typeof local_api;
        $auto: typeof api;
    }
}
