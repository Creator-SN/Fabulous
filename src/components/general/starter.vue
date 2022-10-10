<template>
    <div class="fabulous-starter-container">
        <fv-button
            v-show="step > 1"
            theme="dark"
            background="rgba(29, 85, 125, 1)"
            :border-radius="50"
            class="left"
            style="width: 30px; height: 30px;"
            @click="step > 0 ? step-- : step"
        ><i class="ms-Icon ms-Icon--ChevronLeftMed"></i></fv-button>
        <fv-button
            v-show="step > 2"
            theme="dark"
            background="rgba(29, 85, 125, 1)"
            :border-radius="50"
            class="right"
            style="width: 80px; height: 30px;"
            @click="close"
        >{{local('Skip')}}</fv-button>
        <transition name="scale-up-to-up">
            <div
                v-show="step === 0"
                class="item-block"
            >
                <fv-img
                    :src="img.logo"
                    style="width: 80px; height: auto;"
                ></fv-img>
                <p class="logo-title">Fab</p>
                <fv-button
                    theme="dark"
                    background="rgba(0, 130, 180, 1)"
                    class="starter-btn"
                    @click="step++"
                >{{local('Start')}}</fv-button>
            </div>
        </transition>
        <transition name="scale-up-to-up">
            <div
                v-show="step === 1"
                class="item-block"
            >
                <fv-img
                    :src="img.language"
                    style="width: 120px; height: auto;"
                ></fv-img>
                <p class="title">{{local(`Choose Language`)}}</p>
                <fv-Combobox
                    v-model="cur_language"
                    theme="dark"
                    :options="languages"
                    :placeholder="local('Choose A Language')"
                    background="rgba(36, 36, 36, 1)"
                    @choose-item="chooseLanguage"
                ></fv-Combobox>
                <fv-button
                    theme="dark"
                    background="rgba(0, 130, 180, 1)"
                    class="starter-btn"
                    style="margin-top: 15px;"
                    @click="step++"
                >{{local('Confirm')}}</fv-button>
            </div>
        </transition>
        <transition name="scale-up-to-up">
            <div
                v-show="step === 2"
                class="item-block"
            >
                <p class="title">{{local(`How you going to use Fabulous?`)}}</p>
                <fv-img
                    class="active-mode-img"
                    :src="img[cur_active_system_mode.key]"
                    style="width: 200px; height: auto;"
                ></fv-img>
                <fv-Combobox
                    v-model="cur_active_system_mode"
                    theme="dark"
                    :options="active_system_modes"
                    :placeholder="local('Choose A Mode')"
                    background="rgba(36, 36, 36, 1)"
                    style="margin-top: 35px;"
                    @choose-item="chooseSystemMode"
                ></fv-Combobox>
                <fv-button
                    theme="dark"
                    background="rgba(0, 130, 180, 1)"
                    class="starter-btn"
                    style="margin-top: 25px;"
                    @click="() => {
                        if(activeSystemMode === 'notebook') close();
                        else step++;
                    }"
                >{{local('Confirm')}}</fv-button>
            </div>
        </transition>
        <transition name="scale-up-to-up">
            <div
                v-show="step === 3"
                class="item-block"
            >
                <fv-img
                    :src="img.dataSource"
                    style="width: 120px; height: auto;"
                ></fv-img>
                <p class="title">{{local(`New Data Source`)}}</p>
                <p class="info" style="max-width: 600px; margin-bottom: 35px; text-align: center;">{{local('The data source is a directory for storing literature data. Please choose a suitable location to store it. No management is required after creation.')}}</p>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('Input Data Source Name')"
                    background="rgba(255, 255, 255, 0.6)"
                    :reveal-border="true"
                    @keyup.enter="addSource"
                ></fv-text-box>
                <fv-button
                    theme="dark"
                    icon="FolderOpen"
                    background="rgba(0, 130, 180, 0.6)"
                    :is-box-shadow="true"
                    style="width: 300px; height: 30px; margin-top: 15px; margin-bottom: 15px;"
                    :title="path"
                    @click="choosePath"
                >
                    <p style="max-width: 80%; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">{{path ? path : local('Choose Data Source Directory ...')}}</p>
                </fv-button>
                <p
                    v-show="name && path"
                    class="info"
                >{{local(`Will create on`)}} [{{path}}] {{local('create with new data source')}} [{{name}}]</p>
                <fv-button
                    theme="dark"
                    background="rgba(0, 130, 180, 1)"
                    :disabled="path === '' || name === ''"
                    class="starter-btn"
                    @click="addSource"
                >{{local('Confirm')}}</fv-button>
                <p class="info">{{local('Or')}}</p>
                <fv-button
                    theme="dark"
                    icon="Attach"
                    background="rgba(255, 180, 0, 0.8)"
                    class="starter-btn"
                    @click="() => {path = ''; step++;}"
                >{{local('Exists Data Source')}} ?</fv-button>
            </div>
        </transition>
        <transition name="scale-up-to-up">
            <div
                v-show="step === 4"
                class="item-block"
            >
                <fv-img
                    :src="img.link"
                    style="width: 120px; height: auto;"
                ></fv-img>
                <p class="title">{{local(`Choose from Exists`)}}</p>
                <p class="info" style="margin-bottom: 25px;">{{local('Please select the data source directory containing data_sturcture.json and root folder.')}}</p>
                <fv-button
                    theme="dark"
                    icon="FolderOpen"
                    background="rgba(0, 130, 180, 0.6)"
                    :is-box-shadow="true"
                    style="width: 300px; height: 35px; margin-top: 15px; margin-bottom: 15px;"
                    :title="path"
                    @click="choosePath"
                >
                    <p style="max-width: 80%; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">{{path ? path : local('Choose Data Source Path ...')}}</p>
                </fv-button>
                <fv-button
                    theme="dark"
                    background="rgba(0, 130, 180, 1)"
                    :disabled="path === ''"
                    class="starter-btn"
                    @click="chooseSource"
                >{{local('Confirm')}}</fv-button>
            </div>
        </transition>
    </div>
</template>

<script>
import logo from "../../assets/logo.svg";
import languageImg from "@/assets/nav/language.svg";
import dataSourceImg from "@/assets/nav/dataSource.svg";
import linkImg from "@/assets/nav/link.svg";
import refManagementImg from "@/assets/nav/refManagement.svg";
import notebookImg from "@/assets/nav/notebook.svg";
import allImg from "@/assets/nav/all.svg";

import { mapMutations, mapState, mapGetters } from "vuex";
import { data_structure } from "@/js/data_sample.js";

const { ipcRenderer: ipc } = require("electron");
const { dialog } = require("@electron/remote");
const path = require("path");

export default {
    data() {
        return {
            img: {
                logo: logo,
                language: languageImg,
                dataSource: dataSourceImg,
                link: linkImg,
                ds: refManagementImg,
                notebook: notebookImg,
                both: allImg,
            },
            step: 0,
            cur_language: {},
            languages: [
                { key: "en", text: "English" },
                { key: "cn", text: "简体中文" },
            ],
            cur_active_system_mode: {},
            active_system_modes: [
                {
                    key: "ds",
                    text: () => this.local("Reference Management System"),
                },
                { key: "notebook", text: () => this.local("Notebook System") },
                { key: "both", text: () => this.local("Both Systems") },
            ],
            path: "",
            name: "",
        };
    },
    watch: {
        language() {
            this.configInit();
        },
        activeSystemMode() {
            this.configInit();
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            DataDB: (state) => state.DataDB,
            dbList: (state) => state.dbList,
            language: (state) => state.config.language,
            activeSystemMode: (state) => state.config.activeSystemMode,
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        SourceIndexDisabled() {
            return (index) => {
                if (!this.dbList[index]) return true;
                let id = this.dbList[index].get("id").write();
                return id === null;
            };
        },
    },
    mounted() {
        this.configInit();
    },
    methods: {
        ...mapMutations({
            reviseConfig: "reviseConfig",
            reviseData: "reviseData",
        }),
        configInit() {
            this.cur_language = this.languages.find(
                (item) => item.key === this.language
            );
            this.cur_active_system_mode = this.active_system_modes.find(
                (item) => item.key === this.activeSystemMode
            );
        },
        chooseLanguage(item) {
            this.reviseConfig({
                language: item.key,
            });
        },
        chooseSystemMode(item) {
            this.reviseConfig({
                activeSystemMode: item.key,
            });
        },
        async choosePath() {
            let path = (
                await dialog.showOpenDialog({
                    properties: ["openDirectory"],
                })
            ).filePaths[0];
            if (!path) return;
            this.path = path;
        },
        async existsSource(url) {
            let id = this.$Guid();
            let _path = path.join(url, "data_structure.json");
            ipc.send("exists-path", {
                id: id,
                path: _path,
            });
            let _exists = false;
            await new Promise((resolve) => {
                ipc.on(`exists-path-${id}`, (event, { exists }) => {
                    _exists = exists;
                    resolve(1);
                });
            });
            return _exists;
        },
        async addSource() {
            if (this.path === "") return;
            if (this.name === "") return;
            let id = this.$Guid();
            let _path = path.join(this.path, this.name);
            if (await this.existsSource(_path)) {
                this.$infoBox(
                    this.local(`An existing data source is detected.`),
                    {
                        status: "warning",
                        title: this.local("Data Source Exists"),
                        confirmTitle: this.local("Link to It"),
                        cancelTitle: this.local("Continue to Cover"),
                        theme: "dark",
                        confirm: () => {
                            this.chooseSource();
                        },
                        cancel: () => {
                            this.addSourceConfirm(_path, id);
                        },
                    }
                );
            } else this.addSourceConfirm(_path, id);
        },
        async addSourceConfirm(_path, id) {
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

            this.close();
        },
        async chooseSource() {
            if (this.path === "") return;
            let _path = this.path;
            let pathList = this.data_path;
            if (!pathList.find((url) => url === _path)) pathList.push(_path);
            await this.reviseConfig({
                data_path: pathList,
            });
            let index = pathList.indexOf(_path);
            this.reviseConfig({
                data_index: index,
            });
            this.close();
        },
        close() {
            this.reviseConfig({
                init_status: false,
            });
        },
    },
};
</script>

<style lang="scss">
.fabulous-starter-container {
    @include HcenterVcenter;

    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: rgba(29, 84, 125, 0.8);
    backdrop-filter: blur(50px);
    -webkit-backdrop-filter: blur(50px);
    z-index: 6;

    .left {
        position: absolute;
        left: 15px;
        top: 65px;
        z-index: 2;
    }

    .right {
        position: absolute;
        right: 15px;
        top: 65px;
        z-index: 2;
    }

    .item-block {
        @include HcenterVcenterC;

        position: absolute;
        width: 100%;
        height: 100%;
        line-height: 2;

        .logo-title {
            margin: 25px;
            font-size: 20px;
            color: whitesmoke;
        }

        .title {
            margin-top: 25px;
            margin-bottom: 5px;
            font-size: 20px;
            color: whitesmoke;
        }

        .info {
            margin: 8px;
            font-size: 12px;
            color: rgba(239, 239, 239, 0.8);
        }

        .starter-btn {
            width: 150px;
            height: 40px;
            margin-bottom: 5px;
        }
    }

    .active-mode-img {
        animation: cute-mode 5s infinite ease-in-out;
    }

    @keyframes cute-mode {
        0% {
            transform: scaleY(1);
            transform-origin: 50% 100%;
        }

        10% {
            transform: scaleY(0.8);
            transform-origin: 50% 100%;
        }

        20% {
            transform: scaleY(0.9);
            transform-origin: 50% 100%;
        }

        40% {
            transform: scaleY(1.1);
            transform-origin: 50% 100%;
        }

        60% {
            transform: scaleY(0.8);
            transform-origin: 50% 100%;
        }

        80% {
            transform: scaleY(0.9);
            transform-origin: 50% 100%;
            transform: rotateY(0deg);
        }

        80% {
            transform: scaleY(0.9);
            transform-origin: 50% 100%;
            transform: rotateX(30deg);
        }

        90% {
            transform: rotateX(-30deg);
            transform-origin: 50% 100%;
        }

        100% {
            transform: scaleY(1);
            transform-origin: 50% 100%;
        }
    }
}
</style>