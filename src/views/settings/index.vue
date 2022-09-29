<template>
    <div
        class="settings-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div class="s-row">
            <p
                class="s-title"
                style="margin-top: 20px;"
            >{{local('Setting')}}</p>
        </div>
        <div class="scroll-view">
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'StorageTape'"
                :title="local('Source')"
                :content="local('Add New Source')"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 35px;"
            >
                <template v-slot:extension>
                    <fv-button
                        :theme="theme"
                        icon="OneDriveAdd"
                        :is-box-shadow="true"
                        style="width: 150px;"
                        @click="addSource"
                    >{{local('Add New Source')}}</fv-button>
                    <fv-button
                        :theme="theme"
                        icon="Link"
                        :is-box-shadow="true"
                        style="width: 150px; margin-left: 5px;"
                        @click="linkSource"
                    >{{local('Link Exists Source')}}</fv-button>
                </template>
            </fv-Collapse>
            <div class="s-item-block">
                <fv-list-view
                    :value="thisPathList"
                    :theme="theme"
                    :rowHeight="60"
                    :choosen-background="'rgba(255, 255, 255, 0.1)'"
                    style="width: 100%; height: auto; margin-top: 15px;"
                    @chooseItem="switchDataIndex($event.item)"
                >
                    <template v-slot:listItem="x">
                        <data-path-item
                            :value="x.item"
                            :choosen="data_index === x.index"
                            :disabled="SourceIndexDisabled(x.index)"
                            :local="local"
                            :theme="theme"
                            @remove-ds="removeDS(x.item)"
                            @show-init-ds="showInitDS(x.item)"
                        ></data-path-item>
                    </template>
                </fv-list-view>
            </div>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'Color'"
                :title="local('Theme')"
                :content="theme === 'light' ? `${local('Light')}` : `${local('Dark')}`"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 15px;"
            >
                <template v-slot:extension>
                    <fv-button
                        :theme="theme"
                        fontSize="16"
                        borderRadius="50"
                        :is-box-shadow="true"
                        style="width: 40px; height: 40px;"
                        :title="theme === 'light' ? `${local('Switch to the dark theme')}` : `${local('Switch to the light theme')}`"
                        @click="toggleTheme"
                    >
                        <i
                            class="ms-Icon"
                            :class="[`ms-Icon--${theme === 'light' ? 'Sunny' : 'ClearNight'}`]"
                        ></i>
                    </fv-button>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'LocaleLanguage'"
                :title="local('Language')"
                :content="local('Choose A Language')"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px;"
            >
                <template v-slot:extension>
                    <fv-Combobox
                        v-model="cur_language"
                        :theme="theme"
                        :options="languages"
                        :placeholder="local('Choose A Language')"
                        :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : ''"
                        style="width: 120px;"
                        @choose-item="chooseLanguage"
                    ></fv-Combobox>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'Manage'"
                :title="local('System Mode')"
                :content="local('Switch System Mode')"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px;"
            >
                <template v-slot:extension>
                    <fv-Combobox
                        v-model="cur_active_system_mode"
                        :theme="theme"
                        :options="active_system_modes"
                        :placeholder="local('Choose A Mode')"
                        :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : ''"
                        style="width: 120px;"
                        @choose-item="chooseSystemMode"
                    ></fv-Combobox>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'Save'"
                :title="local('Auto Save')"
                :content="local('Auto Save')"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px;"
            >
                <template v-slot:extension>
                    <fv-toggle-switch
                        :title="local('Auto Save')"
                        v-model="auto_save"
                        :on="local('Turn Off Auto Save')"
                        :off="local('Turn On Auto Save')"
                        :onForeground="theme === 'dark' ? '#fff' : '#000'"
                        :offForeground="theme === 'dark' ? '#fff' : '#000'"
                    >
                    </fv-toggle-switch>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="editor_expand_content ? 'StaplingLandscapeTwoTop' : 'StaplingPortraitBookBinding'"
                :title="local('Editor Content Expand')"
                :content="local('Switch Editor Content Expand')"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px;"
            >
                <template v-slot:extension>
                    <fv-toggle-switch
                        :title="local('Switch Editor Content Expand')"
                        v-model="editor_expand_content"
                        :on="local('Expand Mode')"
                        :off="local('Collaspe Mode')"
                        :onForeground="theme === 'dark' ? '#fff' : '#000'"
                        :offForeground="theme === 'dark' ? '#fff' : '#000'"
                    >
                    </fv-toggle-switch>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'SpecialEffectSize'"
                :title="local('Dynamic Effect')"
                :content="local('Dynamic Effect Background')"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px;"
            >
                <template v-slot:extension>
                    <fv-toggle-switch
                        :title="local('Dynamic Effect')"
                        v-model="dynamic_effect"
                        :on="local('Dynamic Effect ON')"
                        :off="local('Dynamic Effect OFF')"
                        :onForeground="theme === 'dark' ? '#fff' : '#000'"
                        :offForeground="theme === 'dark' ? '#fff' : '#000'"
                    >
                    </fv-toggle-switch>
                </template>
            </fv-Collapse>
            <fv-Collapse
                v-if="themeColorList"
                v-show="dynamic_effect"
                :disabledCollapse="true"
                :theme="theme"
                :icon="'ImageExport'"
                :title="local('Dynamic Effect Theme Color')"
                :content="local('Pick Theme Color from Image')"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px;"
            >
                <template v-slot:extension>
                    <input
                        v-show="false"
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
                        ref="input"
                        @change="getImgColor"
                    />
                    <fv-button
                        :theme="theme"
                        :is-box-shadow="true"
                        style="width: 120px;"
                        @click="$refs.input.click()"
                    >
                        {{local('Pick from Image')}}
                    </fv-button>
                </template>
                <template v-slot:content="x">
                    <div class="collapse-info">
                        <p v-show="themeColorList.length === 0">{{ x.content }}</p>
                        <div
                            v-show="themeColorList.length > 0"
                            class="theme-color-label-block"
                        >
                            <p
                                v-for="(item, index) in themeColorList"
                                :key="`color: ${index}`"
                                class="theme-color-label-item-sample"
                                :style="{background: `rgba(${item.color.join(', ')}, 0.8)`}"
                            ></p>
                            <fv-button
                                :theme="theme"
                                :border-radius="50"
                                :font-size="12"
                                :is-box-shadow="true"
                                style="width: 20px; height: 20px;"
                                @click="shuffleThemeColorList"
                            >
                                <i class="ms-Icon ms-Icon--Shuffle"></i>
                            </fv-button>
                        </div>
                    </div>
                </template>
            </fv-Collapse>
            <fv-Collapse
                v-if="false"
                :disabledCollapse="true"
                :theme="theme"
                :icon="'Diagnostic'"
                :title="local('Watch All Files')"
                :content="local('Switch whether to watch all extension files on Notebook system')"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px;"
            >
                <template v-slot:extension>
                    <fv-toggle-switch
                        :title="local('Watch All Files')"
                        v-model="watch_all_extensions"
                        :on="local('ON')"
                        :off="local('OFF')"
                        :onForeground="theme === 'dark' ? '#fff' : '#000'"
                        :offForeground="theme === 'dark' ? '#fff' : '#000'"
                    >
                    </fv-toggle-switch>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'DeveloperTools'"
                :title="local('Dev Tools')"
                :content="local('Dev Tools for Developer')"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px;"
            >
                <template v-slot:extension>
                    <fv-button
                        :theme="theme"
                        :is-box-shadow="true"
                        style="width: 120px;"
                        @click="$Go('/dev')"
                    >
                        {{local('Dev Page')}}
                    </fv-button>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'DevUpdate'"
                :title="local('App Update')"
                :content="!updater.version ? local('Automatic application update') : updater.version"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px;"
            >
                <template v-slot:extension>
                    <div class="update-info-block">
                        <i
                            v-show="updater.status === 'latest'"
                            class="ms-Icon ms-Icon--Accept latest-icon"
                        ></i>
                        <p
                            v-show="updater.status === 'latest'"
                            class="update-content-info"
                        >{{local('Latest Version')}}</p>
                        <fv-progress-ring
                            v-show="updater.status === 'checking' || updater.status === 'loading'"
                            :value="updater.downloadPercent"
                            :loading="updater.status === 'checking'"
                            r="15"
                            borderWidth="3"
                        ></fv-progress-ring>
                        <p
                            v-show="updater.status === 'checking'"
                            class="update-content-info"
                        >{{local('Checking...')}}</p>
                        <p
                            v-show="updater.status === 'checking' || updater.status === 'loading'"
                            class="update-content-info"
                        >{{updater.downloadPercent}}%</p>
                    </div>
                </template>
            </fv-Collapse>
        </div>
        <init-ds
            :show.sync="show.initDS"
            :theme="theme"
            :db_index="db_index"
        ></init-ds>
        <add-ds
            :show.sync="show.addDS"
            :theme="theme"
        ></add-ds>
    </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";
import initDs from "@/components/settings/initDS.vue";
import addDs from "@/components/settings/addDS.vue";
import dataPathItem from "@/components/settings/dataPathItem.vue";

import OneDrive from "@/assets/settings/OneDrive.svg";

import ThemeColor from "@/js/themeColorPicker.js";

const { ipcRenderer: ipc } = require("electron");
const { dialog } = require("@electron/remote");

export default {
    components: {
        initDs,
        addDs,
        dataPathItem,
    },
    data() {
        return {
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
            thisPathList: [],
            auto_save: false,
            dynamic_effect: true,
            editor_expand_content: false,
            watch_all_extensions: false,
            db_index: -1,
            img: {
                OneDrive,
            },
            updater: {
                status: "init",
                downloadPercent: 0,
                version: false,
            },
            show: {
                initDS: false,
                addDS: false,
            },
            lock: {
                switchDataIndex: true,
            },
        };
    },
    watch: {
        $route() {
            this.configInit();
            this.refreshDBList();
        },
        data_path() {
            this.refreshDBList();
        },
        data_index() {
            this.refreshDBList();
        },
        language() {
            this.configInit();
        },
        auto_save() {
            this.switchAutoSave();
        },
        autoSave() {
            this.configInit();
        },
        dynamic_effect() {
            this.switchDynamicEffect();
        },
        dynamicEffect() {
            this.configInit();
        },
        editor_expand_content() {
            this.switchEditorExpandContent();
        },
        activeSystemMode() {
            this.configInit();
            this.refreshDBList();
        },
        editorExpandContent() {
            this.configInit();
        },
        watch_all_extensions() {
            this.switchWatchAllExtensions();
        },
        watchAllExtensions() {
            this.configInit();
        },
        "show.initDS"() {
            this.refreshDBList();
        },
    },
    computed: {
        ...mapState({
            init_status: (state) => state.config.init_status,
            data_index: (state) => state.config.data_index,
            data_path: (state) => state.config.data_path,
            DataDB: (state) => state.DataDB,
            language: (state) => state.config.language,
            autoSave: (state) => state.config.autoSave,
            activeSystemMode: (state) => state.config.activeSystemMode,
            editorExpandContent: (state) => state.config.editorExpandContent,
            dynamicEffect: (state) => state.config.dynamicEffect,
            watchAllExtensions: (state) => state.config.watchAllExtensions,
            themeColorList: (state) => state.config.themeColorList,
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        v() {
            return this;
        },
        SourceIndexDisabled() {
            return (index) => {
                if (!this.data_path[index]) return true;
                return false;
            };
        },
    },
    mounted() {
        this.eventInit();
        this.configInit();
        this.refreshDBList();
    },
    methods: {
        ...mapMutations({
            reviseConfig: "reviseConfig",
            reviseData: "reviseData",
            toggleTheme: "toggleTheme",
            syncDS: "syncDS",
        }),
        configInit() {
            this.cur_language = this.languages.find(
                (item) => item.key === this.language
            );
            this.cur_active_system_mode = this.active_system_modes.find(
                (item) => item.key === this.activeSystemMode
            );
            this.auto_save = this.autoSave;
            this.dynamic_effect = this.dynamicEffect;
            this.editor_expand_content = this.editorExpandContent;
            this.watch_all_extensions = this.watchAllExtensions;
        },
        eventInit() {
            ipc.on("updater-callback", (event, { status, info }) => {
                this.updater.status = status;
                if (status === "latest")
                    this.updater.version = info.releaseName;
                if (status === "loading")
                    this.updater.downloadPercent = info.percent.toFixed(0);
                console.log({ status, info });
            });
        },
        chooseLanguage(item) {
            this.reviseConfig({
                language: item.key,
            });
        },
        refreshDBList() {
            // 此函数初始化数据源的DB //
            // 同时也会初始化ListView列表项目 //
            if (this.activeSystemMode === "notebook") return;
            let pathList = this.data_path;
            if (pathList.length === 0) {
                this.$barWarning(
                    this.local(
                        "There is no source, please add a data source to getting started."
                    ),
                    {
                        status: "warning",
                        // autoClose: -1,
                    }
                );
                this.thisPathList = [];
                return;
            }
            let thisPathList = [];
            pathList.forEach((el, idx) => {
                thisPathList.push({
                    key: idx,
                    name: pathList[idx],
                    path: pathList[idx],
                    choosen: idx === this.data_index,
                    disabled: () => false,
                });
            });
            this.thisPathList.splice(0, this.thisPathList.length);
            this.thisPathList = thisPathList;
        },
        switchAutoSave() {
            this.reviseConfig({
                autoSave: this.auto_save,
            });
        },
        switchDynamicEffect() {
            this.reviseConfig({
                dynamicEffect: this.dynamic_effect,
            });
        },
        chooseSystemMode(item) {
            this.reviseConfig({
                activeSystemMode: item.key,
            });
        },
        switchEditorExpandContent() {
            this.reviseConfig({
                editorExpandContent: this.editor_expand_content,
            });
        },
        switchWatchAllExtensions() {
            this.reviseConfig({
                watchAllExtensions: this.watch_all_extensions,
            });
        },
        addSource() {
            this.show.addDS = true;
        },
        async linkSource() {
            let path = (
                await dialog.showOpenDialog({
                    properties: ["openDirectory"],
                })
            ).filePaths[0];
            if (!path) return;
            let pathList = this.data_path;
            if (!pathList.find((url) => url === path)) pathList.push(path);
            await this.reviseConfig({
                data_path: pathList,
            });
            let index = pathList.indexOf(path);
            if (!this.SourceIndexDisabled(index)) {
                if (this.data_index === index)
                    await this.reviseConfig({
                        data_index: -1,
                    });
                this.reviseConfig({
                    data_index: index,
                });
            }
        },
        switchDataIndex(item) {
            this.lock.switchDataIndex = false;
            let index = this.data_path.indexOf(item.path);
            this.reviseConfig({
                data_index: index,
            });
            this.lock.switchDataIndex = true;
        },
        showInitDS(item) {
            let index = this.data_path.indexOf(item.path);
            this.db_index = index;
            this.show.initDS = true;
        },
        removeDS(db_item) {
            this.$infoBox(
                this.local("Are you sure to remove this data source?"),
                {
                    status: "error",
                    title: this.local("Remove Data Source"),
                    confirmTitle: this.local("Confirm"),
                    cancelTitle: this.local("Cancel"),
                    theme: this.theme,
                    confirm: () => {
                        let url = db_item.path;
                        let index = this.data_path.indexOf(url);
                        this.data_path.splice(index, 1);
                        if (index - 1 > 0 && this.data_path.length > 0)
                            this.reviseConfig({
                                data_index: index - 1,
                            });
                        else if (this.data_path.length > 0)
                            this.reviseConfig({
                                data_index: 0,
                            });
                        else
                            this.reviseConfig({
                                data_index: -1,
                            });
                    },
                    cancel: () => {},
                }
            );
        },
        getImgColor() {
            if (this.$refs.input.files.length === 0) return;
            let file = this.$refs.input.files[0];
            ThemeColor.ThemeColorPicker(file.path, (result) => {
                let color = [];
                result.forEach((el) => {
                    color.push({
                        hot: el.hot,
                        color: el.color,
                    });
                });
                this.reviseConfig({
                    themeColorList: color,
                });
                this.$refs.input.value = "";
            });
        },
        shuffleThemeColorList() {
            let color = this.themeColorList;
            color.sort(() => {
                return Math.random() - 0.5;
            });
            this.reviseConfig({
                themeColorList: color,
            });
        },
    },
};
</script>

<style lang="scss">
.settings-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(245, 245, 245, 0.9);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;

    &.dark {
        background: rgba(36, 36, 36, 0.9);

        .s-title {
            color: whitesmoke;
        }

        .scroll-view {
            .s-item-block {
                .s-item-title {
                    color: whitesmoke;
                }
            }
        }
    }

    .s-row {
        position: relative;
        margin: 25px 0px;
        padding: 0px 15px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
    }

    .s-title {
        font-size: 24px;
        user-select: none;
        cursor: default;
    }

    .scroll-view {
        position: relative;
        width: 100%;
        flex: 1;
        padding-left: 15px;
        padding-bottom: 5px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        overflow: auto;

        .s-item-block {
            position: relative;
            width: calc(100% - 30px);
            max-width: 1280px;
            height: auto;
            line-height: 2.5;
            display: flex;
            flex-direction: column;

            .s-item-title {
                user-select: none;
                cursor: default;
            }

            .list-view-item {
                position: relative;
                width: 100%;
                padding-left: 5px;
                border-left: rgba(0, 98, 158, 0) solid 5px;
                border-radius: 3px;
                display: flex;
                align-items: center;

                &.disabled {
                    filter: grayscale(100%);
                }

                &.choosen {
                    border-color: rgba(0, 98, 158, 0.6);
                }

                .icon-img {
                    width: 16px;
                    height: auto;
                }

                .item-name {
                    margin-left: 15px;
                    font-size: 13px;
                    flex: 1;
                }

                .control-btn {
                    width: 35px;
                    height: 35px;
                    margin-right: 5px;
                }
            }
        }

        .update-info-block {
            @include Vcenter;

            font-size: 12px;

            .latest-icon {
                color: rgba(0, 158, 98, 1);
            }

            .update-content-info {
                margin-left: 15px;
            }
        }
    }

    .theme-color-label-block {
        @include Vcenter;

        margin-top: 5px;

        .theme-color-label-item-sample {
            width: 15px;
            height: 15px;
            margin-right: 20px;
            border-radius: 50%;
        }
    }
}
</style>