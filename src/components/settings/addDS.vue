<template>
    <float-window-base
        v-model="thisShow"
        :title="local('New Data Source')"
        :theme="theme"
    >
        <template v-slot:content>
            <div
                class="w-p-block"
                @keyup.enter="addDS"
            >
                <fv-text-box
                    v-model="path"
                    :placeholder="local('Choose Data Source Directory ...')"
                    :theme="theme"
                    :font-size="18"
                    underline
                    :border-radius="6"
                    :focus-border-color="'rgba(123, 139, 209, 1)'"
                    :is-box-shadow="true"
                    readonly
                    style="width: 100%; height: 50px; margin-top: 15px;"
                    @click.native="choosePath"
                ></fv-text-box>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('New Data Source Name')"
                    :theme="theme"
                    :font-size="18"
                    underline
                    :border-radius="6"
                    :focus-border-color="'rgba(123, 139, 209, 1)'"
                    :is-box-shadow="true"
                    style="width: 100%; height: 50px; margin-top: 25px;"
                    @keyup.enter="addDS"
                ></fv-text-box>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(0, 98, 158, 1)"
                :disabled="name === '' || path === ''"
                @click="addDS"
            >{{local('Confirm')}}</fv-button>
            <fv-button
                :theme="theme"
                style="margin-left: 5px;"
                @click="thisShow = false"
            >{{local('Cancel')}}</fv-button>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from "../window/floatWindowBase.vue";
import { mapMutations, mapState, mapGetters } from "vuex";
import { data_structure } from "@/js/data_sample.js";

const { ipcRenderer: ipc } = require("electron");
const { dialog } = require("@electron/remote");
const path = require("path");

export default {
    components: {
        floatWindowBase,
    },
    props: {
        show: {
            default: false,
        },
    },
    data() {
        return {
            thisShow: this.show,
            name: "",
            path: "",
        };
    },
    watch: {
        show(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit("update:show", val);
            this.name = "";
            this.path = "";
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            language: (state) => state.config.language,
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(["local"]),
        v() {
            return this;
        },
    },
    methods: {
        ...mapMutations({
            reviseConfig: "reviseConfig",
        }),
        async choosePath() {
            let path = (
                await dialog.showOpenDialog({
                    properties: ["openDirectory"],
                })
            ).filePaths[0];
            if (!path) return;
            this.path = path;
        },
        async addDS() {
            if (this.path === "") return;
            if (this.name === "") return;
            let id = this.$Guid();
            let _path = path.join(this.path, this.name);
            ipc.send("ensure-folder", { id: id, dir: _path });
            await new Promise((resolve) => {
                ipc.on(`ensure-folder-${id}`, () => {
                    resolve(1);
                });
            });

            let ds = JSON.parse(JSON.stringify(data_structure));
            ds.id = this.$Guid();
            ds.name = this.name;
            ds.createDate = this.$SDate.DateToString(new Date());

            ipc.send("output-file", {
                id: ds.id,
                path: path.join(_path, "data_structure.json"),
                data: JSON.stringify(ds),
            });
            await new Promise((resolve) => {
                ipc.on(`output-file-${ds.id}`, () => {
                    resolve(1);
                });
            });

            let pathList = this.data_path;
            if (!pathList.find((url) => url === _path)) pathList.push(_path);
            await this.reviseConfig({
                data_path: pathList,
            });

            let index = pathList.indexOf(_path);
            this.reviseConfig({
                data_index: index,
            });

            this.thisShow = false;
        },
    },
};
</script>

<style lang="scss">
</style>