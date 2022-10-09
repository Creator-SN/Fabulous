<template>
    <div
        id="app"
        :class="{dark: theme == 'dark'}"
    >
        <dynamic-b-g
            :theme="theme"
            :disabled="!dynamicEffect"
            :themeColorList="themeColorList"
        ></dynamic-b-g>
        <navigation-view></navigation-view>
        <title-bar
            class="title-bar"
            :theme="theme"
            :left-offset="windowWidth <= mobileDisplay ? 80 : 350"
            style="background: transparent;"
        ></title-bar>
        <div class="addition-container">
            <div class="global-container">
                <keep-alive include="Home,Templates,Settings">
                    <router-view></router-view>
                </keep-alive>
            </div>
        </div>
        <editor-container></editor-container>
        <pdf-importer ref="pdf_importer"></pdf-importer>
        <item-carrier @update-progess="updateProgress"></item-carrier>
        <div
            v-show="show.drop"
            class="file-drop-mask"
            ref="drop"
        ></div>
        <transition :name="init_status ? `move-bottom-to-top` : `move-top-to-bottom`">
            <starter v-if="init_status"></starter>
        </transition>
        <progress-bar></progress-bar>
    </div>
</template>

<script>
import i18n from "@/js/i18n.js";
import starter from "@/components/general/starter.vue";
import titleBar from "@/components/general/titleBar.vue";
import progressBar from "@/components/general/progressbar.vue";
import navigationView from "@/components/general/navigationView";
import editorContainer from "@/components/general/editorContainer.vue";
import pdfImporter from "@/components/general/pdfImporter.vue";
import itemCarrier from "@/components/general/itemCarrier.vue";
import dynamicBG from "@/components/general/dynamicBG.vue";
import { config, data_structure } from "@/js/data_sample";
import { mapMutations, mapState, mapGetters } from "vuex";

export default {
    name: "App",
    components: {
        starter,
        titleBar,
        progressBar,
        navigationView,
        editorContainer,
        pdfImporter,
        itemCarrier,
        dynamicBG,
    },
    data() {
        return {
            show: {
                drop: false,
            },
        };
    },
    watch: {
        $route() {
            this.pdfImporterInit();
        },
        currentPath() {
            this.dataDBInit();
        },
        DataDB() {
            this.syncDataStructure();
        },
    },
    computed: {
        ...mapState({
            ConfigDB: (state) => state.ConfigDB,
            DataDB: (state) => state.DataDB,
            init_status: (state) => state.config.init_status,
            data_index: (state) => state.config.data_index,
            data_path: (state) => state.config.data_path,
            language: (state) => state.config.language,
            dynamicEffect: (state) => state.config.dynamicEffect,
            themeColorList: (state) => state.config.themeColorList,
            show_editor: (state) => state.editor.show,
            windowWidth: (state) => state.window.width,
            mobileDisplay: (state) => state.window.mobileDisplay,
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(["local"]),
        currentPath() {
            if (this.data_path[this.data_index])
                return this.data_path[this.data_index];
            else return null;
        },
    },
    mounted() {
        this.configDBInit();
        this.pdfImporterInit();
        this.dropFilesInit();
        this.i18nInit();
        this.refreshWindowSizeInit();
        if (this.$route.path !== "/") this.$Go("/");
    },
    methods: {
        ...mapMutations({
            initDB: "initDB",
            reviseConfig: "reviseConfig",
            reviseData: "reviseData",
            revisePdfImporter: "revisePdfImporter",
            reviseProgress: "reviseProgress",
            setWindowSize: "setWindowSize",
            reviseI18N: "reviseI18N",
        }),
        i18nInit() {
            this.reviseI18N(i18n);
        },
        configDBInit() {
            let configDB = this.$DBM.getConfigDB();
            this.initDB({ ConfigDB: configDB });
            let _config = JSON.parse(JSON.stringify(config));
            for (let key in _config) {
                _config[key] = this.ConfigDB.get(key).write();
            }
            this.reviseConfig(_config);
        },
        dataDBInit() {
            let pathList = this.data_path;
            let dataDB = null;
            if (!pathList || pathList.length === 0) {
                this.initDB({
                    DataDB: null,
                });
                this.reviseData(Object.assign({}, data_structure));
                return;
            }
            if (this.data_index >= pathList.length || this.data_index < 0) {
                dataDB = this.$DBM.getDataDB(pathList[0]);
            } else dataDB = this.$DBM.getDataDB(pathList[this.data_index]);
            this.initDB({
                DataDB: dataDB,
            });
        },
        syncDataStructure() {
            if (!this.DataDB) return;
            let _data_structure = JSON.parse(JSON.stringify(data_structure));
            for (let key in _data_structure) {
                let keyValue = this.DataDB.get(key).write();
                if (!keyValue && Array.isArray(_data_structure[key])) {
                    _data_structure[key] = [];
                } else _data_structure[key] = this.DataDB.get(key).write();
            }
            this.reviseData(_data_structure);
        },
        pdfImporterInit() {
            this.revisePdfImporter({
                pdf_importer: this.$refs.pdf_importer,
            });
        },
        dropFilesInit() {
            this.$el.addEventListener(
                "dragenter",
                (e) => {
                    if (!this.show_editor) {
                        this.show.drop = true;
                        e.preventDefault();
                        e.stopPropagation();
                    }
                },
                false
            );

            this.$el.addEventListener(
                "dragover",
                (e) => {
                    if (!this.show_editor) {
                        this.show.drop = true;
                        e.preventDefault();
                        e.stopPropagation();
                    }
                },
                false
            );

            this.$el.addEventListener(
                "dragleave",
                (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                },
                false
            );

            this.$refs.drop.addEventListener(
                "dragleave",
                (e) => {
                    this.show.drop = false;
                    e.preventDefault();
                    e.stopPropagation();
                },
                false
            );

            this.$el.addEventListener("drop", (e) => {
                if (this.show_editor) {
                    this.show.drop = false;
                    return;
                }
                // if (this.$route.path.startsWith("/notebook")) {
                //     this.show.drop = false;
                //     return;
                // }
                if (!this.DataDB) {
                    this.show.drop = false;
                    return;
                }
                e.preventDefault();
                e.stopPropagation();

                this.show.drop = false;
                var df = e.dataTransfer;
                var files = [];

                if (df.items !== undefined) {
                    for (let i = 0; i < df.items.length; i++) {
                        let item = df.items[i];
                        let fileEntry = item.webkitGetAsEntry();
                        let ext = fileEntry ? fileEntry.name.split(".") : [];
                        ext = ext[ext.length - 1];
                        // 用webkitGetAsEntry禁止上传目录
                        if (
                            item.kind === "file" &&
                            fileEntry.isFile &&
                            item.type === "application/pdf"
                        ) {
                            let file = item.getAsFile();
                            files.push(file);
                        } else if (ext === "fbn") {
                            let file = item.getAsFile();
                            let url = `/notebook/${encodeURI(
                                file.path.replace(/\//g, "\\")
                            )}`;
                            if (this.$route.path === url) return;
                            this.$Go(url);
                        }
                    }
                }

                this.revisePdfImporter({
                    df: files,
                });
            });
        },
        refreshWindowSizeInit() {
            this.timer = setInterval(() => {
                let width = document.body.clientWidth;
                let height = document.body.clientHeight;
                this.setWindowSize({
                    width,
                    height,
                });
            }, 100);
        },
        updateProgress(value) {
            this.reviseProgress(value);
        },
        Go(path) {
            if (this.$route.path === path) return 0;
            this.$Go(path);
        },
    },
};
</script>

<style lang="scss">
#app {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
    display: flex;
    overflow: hidden;
    transition: all 0.3s;

    &.dark {
        background: rgba(36, 36, 36, 1);
    }

    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;

        &:hover {
            width: 10px;
        }
    }
    /*定义滚动条轨道
 内阴影+圆角*/
    ::-webkit-scrollbar-track {
        border-radius: 10px;
    }
    /*定义滑块
 内阴影+圆角*/
    ::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background-color: rgba(191, 190, 189, 0.3);
        transition: background-color 0.3s;
        cursor: pointer;

        &:hover {
            width: 16px;
            background-color: rgba(191, 190, 189, 0.6);
        }
    }

    .title-bar {
        position: absolute;
        z-index: 10;
    }

    .addition-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        overflow: hidden;
        z-index: 1;

        .global-container {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
    }

    .file-drop-mask {
        position: absolute;
        left: 5px;
        top: 5px;
        width: calc(100% - 10px);
        height: calc(100% - 10px);
        background: rgba(200, 200, 200, 0.1);
        border: rgba(200, 200, 200, 0.6) dashed 3px;
        border-radius: 8px;
        box-sizing: border-box;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        overflow: hidden;
        z-index: 6;
    }

    .move-bottom-to-top-enter-active {
        animation: moveFromBottom 0.25s ease both;
    }
    .move-bottom-to-top-leave-active {
        animation: moveToTop 0.25s ease both;
    }
    @keyframes moveFromBottom {
        from {
            transform: translateY(30%);
        }
    }
    @keyframes moveToTop {
        to {
            transform: translateY(-30%);
        }
    }
}
</style>
