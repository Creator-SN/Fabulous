<template>
    <div
        class="fabulous-home-container"
        :class="[{dark: theme === 'dark'}]"
        @mousewheel="onMouseWheel"
    >
        <div class="control-banner">
            <div class="control-left-block">
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    @click="readonly = readonly ? false : true"
                >
                    <i
                        class="ms-Icon"
                        :class="[
                            `ms-Icon--${
                                readonly === true ? 'Edit' : 'ReadingMode'
                            }`,
                        ]"
                    ></i>
                </fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    @click="expandContent = expandContent ? false : true"
                >
                    <i
                        class="ms-Icon"
                        :class="[
                            `ms-Icon--${
                                expandContent === true ? 'StaplingPortraitBookBinding' : 'StaplingLandscapeTwoTop'
                            }`,
                        ]"
                    ></i>
                </fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    :title="local('Save As')"
                    @click="saveAs"
                >
                    <i class="ms-Icon ms-Icon--SaveAs"></i>
                </fv-button>
                <fv-button
                    v-show="contentType !== 'fabulous_notebook'"
                    theme="dark"
                    :borderRadius="30"
                    class="control-btn"
                    background="linear-gradient(to right, #800080, #ffc0cb)"
                    :title="local('Upgrade to Fabulous Notebook')"
                    @click="upgrade"
                >
                    <i class="ms-Icon ms-Icon--UpArrowShiftKey"></i>
                </fv-button>
                <fv-button
                    v-show="unsave"
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    background="rgba(0, 204, 153, 1)"
                >
                    {{ "" }}
                </fv-button>
                <fv-toggle-switch
                    :title="local('Auto Save')"
                    v-model="auto_save"
                    class="save-btn"
                    :on="local('Turn Off Auto Save')"
                    :off="local('Turn On Auto Save')"
                    :onForeground="theme === 'dark' ? '#fff' : '#000'"
                    :offForeground="theme === 'dark' ? '#fff' : '#000'"
                    style="margin-left: 10px;"
                >
                </fv-toggle-switch>
            </div>
        </div>
        <div class="nav-banner">
            <fv-Breadcrumb
                :value="path"
                :disabled="history.length === 0"
                :theme="theme"
                :rootIcon="history.length > 0 ? 'PageLeft' : 'FolderHorizontal'"
                style="font-size: 12px; white-space: nowrap;"
                @root-click="back"
            ></fv-Breadcrumb>
        </div>
        <div
            v-show="!readonly && contentType === 'fabulous_notebook'"
            class="fabulous-notebook-info-block"
            :class="[{'has-banner': fabulousNotebook.banner}]"
        >
            <fv-button
                v-show="!fabulousNotebook.banner"
                :theme="theme"
                icon="Picture"
                background="transparent"
                :border-radius="6"
                foreground="rgba(120, 120, 120, 1)"
                style="width: 120px; margin: 15px 10px;"
                @click="$refs.input.click()"
            >{{local('Add Banner')}}</fv-button>
            <input
                v-show="false"
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
                ref="input"
                @change="chooseBanner"
            />
            <fv-text-Field
                :placeholder="local('Input title here ...')"
                v-model="fabulousNotebook.title"
                :theme="theme"
                :font-size="20"
                :background="`transparent`"
                :border-color="`rgba(246, 167, 197, 0.3)`"
                :focus-border-color="`rgba(246, 167, 197, 0.8)`"
                :border-width="2"
                :readonly="readonly != false"
                :reveal-border="true"
                style="width: calc(100% - 20px); height: 60px; margin-left: 10px; margin-bottom: 5px;"
            ></fv-text-Field>
        </div>
        <div class="main-display-block">
            <power-editor
                v-show="lock.loading"
                :value="fabulousNotebook.content"
                :placeholder="local('Write something ...')"
                :editable="!readonly"
                :theme="theme"
                :language="language"
                :editorBackground="
                    theme == 'dark' ? 'rgba(47, 52, 55, 0)' : 'rgba(250, 250, 250, 0)'"
                :editorOutSideBackground="
                    theme == 'dark' ? 'rgba(47, 52, 55, 0)' : 'rgba(250, 250, 250, 0)'"
                :toolbarHeight="toolbarHeight"
                :readOnlyPaddingTop="100"
                :contentMaxWidth="expandContent ? '99999px' : '900px'"
                :mobileDisplayWidth="0"
                ref="editor"
                :style="{background: 'transparent', 'font-size': `${fontSize}px`}"
                style="position: relative; width: 100%; height: 100%; flex: 1;"
                @save-json="saveConfirm"
                @click.native="show.quickNav = false"
            >
                <template v-slot:front-content>
                    <fv-img
                        v-show="fabulousNotebook.banner"
                        :src="currentBanner"
                        class="fabulous-notebook-banner-img"
                        @click.native="$refs.input.click()"
                    ></fv-img>
                    <div class="fabulous-notebook-readonly-title-block">
                        <p
                            v-show="readonly && fabulousNotebook.title"
                            :class="[{dark: theme === 'dark'}]"
                            :style="{width: '100%', 'max-width': expandContent ? '99999px' : '900px'}"
                        >{{fabulousNotebook.title}}</p>
                    </div>
                </template>
            </power-editor>
        </div>
        <div
            v-show="!lock.loading"
            class="loading-block"
        >
            <fv-progress-ring
                loading="true"
                r="20"
                borderWidth="5"
            ></fv-progress-ring>
        </div>
        <div
            class="bottom-control"
            :class="[{dark: theme == 'dark'}, {close: !show.bottomControl}]"
        >
            <i
                class="ms-Icon trigger"
                :class="[`ms-Icon--${show.bottomControl ? 'ChevronRightMed' : 'ChevronLeftMed'}`]"
                style="flex: 1;"
                @click="show.bottomControl ^= true"
            ></i>
            <fv-slider
                v-show="show.bottomControl"
                v-model="fontSize"
                :mininum="12"
                :maxinum="72"
                icon="RadioBullet"
                color="rgba(87, 156, 193, 1)"
                :showLabel="true"
                style="width: 150px; margin-right: 15px;"
            >
                <template slot-scope="prop">
                    <p style="margin: 5px;">{{prop.value}}px</p>
                </template>
            </fv-slider>
        </div>
    </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";

import { fabulous_notebook } from "@/js/data_sample.js";

const { ipcRenderer: ipc } = require("electron");
const { dialog } = require("@electron/remote");
const path = require("path");

export default {
    components: {},
    data() {
        return {
            path: "",
            content: "",
            contentType: "", // json, html, fabulous_notebook
            fabulousNotebook: {
                title: null,
                description: null,
                banner: null,
                content: null,
                author: [],
                createDate: null,
                updateDate: null,
            },
            readonly: false,
            fontSize: 16,
            expandContent: false,
            history: [],
            unsave: false,
            auto_save: false,
            containerPos: {
                scrollTop: 0,
            },
            lock: {
                loading: true,
            },
            show: {
                bottomControl: false,
            },
            timer: {
                autoSave: undefined,
            },
        };
    },
    watch: {
        $route() {
            if (this.$route.name === "NoteBook") {
                this.refreshPath();
                this.refreshContent();
            }
        },
        path() {
            this.refreshContent();
        },
        auto_save() {
            this.switchAutoSave();
        },
        autoSave() {
            this.auto_save = this.autoSave;
        },
        expandContent(val) {
            this.reviseConfig({
                editorExpandContent: val,
            });
        },
        editorExpandContent(val) {
            this.expandContent = val;
        },
    },
    computed: {
        ...mapState({
            autoSave: (state) => state.config.autoSave,
            language: (state) => state.config.language,
            editorExpandContent: (state) => state.config.editorExpandContent,
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(["local"]),
        dir() {
            return path.dirname(this.path);
        },
        currentBanner() {
            if (!this.fabulousNotebook.banner) return "";
            return this.fabulousNotebook.banner;
        },
        toolbarHeight() {
            if (this.contentType !== "fabulous_notebook") return 160;
            return this.fabulousNotebook.banner ? 250 : 290;
        },
    },
    mounted() {
        this.eventInit();
        this.configInit();
        this.ShortCutInit();
        this.timerInit();
        this.refreshPath();
    },
    methods: {
        ...mapMutations({
            reviseConfig: "reviseConfig",
        }),
        eventInit() {
            ipc.on("output-file-notebook", (event, { status, message }) => {
                if (status !== 200) {
                    console.error(message);
                    this.$barWarning(this.local(`Save Content Failed`), {
                        status: "warning",
                    });
                    return;
                }
                this.unsave = false;
            });
            ipc.on(`read-file-notebook`, (event, { status, message, data }) => {
                if (status !== 200) {
                    console.error(message);
                    this.$barWarning(this.local(`Read File Failed`), {
                        status: "warning",
                    });
                    return;
                }
                try {
                    let rawJson = JSON.parse(data);
                    if (rawJson.fabulous_notebook) {
                        this.contentType = "fabulous_notebook";
                        for (let key in this.fabulousNotebook)
                            this.fabulousNotebook[key] = rawJson[key];
                    } else {
                        this.contentType = "json";
                        this.fabulousNotebook.content = rawJson;
                    }
                    this.lock.loading = true;
                } catch (e) {
                    this.contentType = "html";
                    this.fabulousNotebook.content = data;
                    this.lock.loading = true;
                }
                if (this.fabulousNotebook.content === "")
                    this.$refs.editor.focus();
            });
        },
        configInit() {
            this.auto_save = this.autoSave;
            this.expandContent = this.editorExpandContent;
        },
        timerInit() {
            clearInterval(this.timer.autoSave);
            this.timer.autoSave = setInterval(this.autoSaveContent, 10000);
        },
        ShortCutInit() {
            this.$el.addEventListener("keydown", (event) => {
                if (event.keyCode === 83 && event.ctrlKey && !event.shiftKey) {
                    this.$refs.editor.save();
                    this.unsave = false;
                } else if (
                    event.keyCode === 83 &&
                    event.ctrlKey &&
                    event.shiftKey
                ) {
                    this.saveAs();
                    this.unsave = false;
                } else {
                    let filterKey = [16, 17, 18, 20];
                    if (filterKey.indexOf(event.keyCode) < 0) {
                        if (!this.readonly) this.unsave = true;
                    }
                }

                if (event.keyCode === 9) {
                    event.preventDefault();
                    if (
                        this.$refs.editor.editor.isActive("bulletList") ||
                        this.$refs.editor.editor.isActive("orderedList")
                    )
                        return;
                    this.$refs.editor.editor.commands.insertContent("    ");
                }
            });
        },
        switchAutoSave() {
            this.reviseConfig({
                autoSave: this.auto_save,
            });
        },
        refreshPath() {
            let path = decodeURI(this.$route.params.path);
            if (!path) return;
            path = path.replace(/\\/g, "/");
            this.path = path;
        },
        async refreshContent() {
            if (!path) return;
            if (!this.lock.loading) return;
            this.lock.loading = false;
            this.fabulousNotebook.banner = null;
            ipc.send("read-file", {
                id: "notebook",
                path: this.path,
            });
        },
        autoSaveContent() {
            if (this.auto_save) {
                this.$refs.editor.save();
            }
        },
        saveContent(json) {
            let saveContent = null;
            if (this.contentType === "fabulous_notebook") {
                this.fabulousNotebook.content = json;
                this.fabulousNotebook.updateDate = new Date();
                let _fabulous_notebook = JSON.parse(
                    JSON.stringify(fabulous_notebook)
                );
                for (let key in this.fabulousNotebook) {
                    _fabulous_notebook[key] = this.fabulousNotebook[key];
                }
                saveContent = _fabulous_notebook;
            } else {
                saveContent = json;
            }
            return saveContent;
        },
        saveConfirm(obj) {
            let saveContent = this.saveContent(obj);
            ipc.send("output-file", {
                id: "notebook",
                path: this.path,
                data: JSON.stringify(saveContent),
            });
        },
        onMouseWheel(event) {
            if (event.ctrlKey) {
                event.preventDefault();
                if (event.deltaY > 0 && this.fontSize > 12) {
                    this.fontSize -= 1;
                } else if (this.fontSize < 72) {
                    this.fontSize += 1;
                }
            }
        },
        upgrade() {
            this.contentType = "fabulous_notebook";
            this.fabulousNotebook.title = "";
        },
        chooseBanner() {
            if (this.$refs.input.files.length === 0) return;
            let file = this.$refs.input.files[0];
            let reader = new FileReader();
            reader.onload = (e) => {
                this.fabulousNotebook.banner = e.target.result;
                this.$refs.input.value = "";
            };
            reader.readAsDataURL(file);
        },
        saveAs() {
            let filters = [
                {
                    name: this.local("Fabulous Notebook"),
                    extensions: ["fbn"],
                },
                {
                    name: this.local("JSON"),
                    extensions: ["json"],
                },
                {
                    name: this.local("HTML"),
                    extensions: ["html"],
                },
            ];
            if (this.contentType === "json") filters = filters.slice(1);
            if (this.contentType === "html") filters = filters.slice(2);
            dialog
                .showSaveDialog({
                    title: this.local("Save As"),
                    defaultPath: this.dir,
                    filters: filters.concat([
                        {
                            name: this.local("All Files"),
                            extensions: ["*"],
                        },
                    ]),
                })
                .then((result) => {
                    if (result.canceled) return;
                    let targetPath = result.filePath;
                    let json = this.$refs.editor.editor.getJSON();
                    let saveContent = this.saveContent(json);
                    ipc.send("output-file", {
                        id: "notebook",
                        path: targetPath,
                        data: JSON.stringify(saveContent),
                    });
                });
        },
        back() {
            let last = this.history[this.history.length - 1];
            this.history.splice(this.history.length - 1, 1);
            this.$Go(`/notebook/${encodeURI(last)}`);
        },
    },
    beforeDestroy() {
        clearInterval(this.timer.autoSave);
    },
};
</script>

<style lang="scss">
.fabulous-home-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(245, 245, 245, 0.9);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;
    z-index: 1;

    &.dark {
        background: rgba(36, 36, 36, 0.9);
    }

    .control-banner {
        @include Vcenter;

        position: relative;
        min-height: 40px;
        height: 40px;
        padding-top: 32px;
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        z-index: 3;

        .control-left-block {
            @include Vcenter;

            flex: 1;
            padding-left: 10px;
        }

        .control-right-block {
            @include Vcenter;

            .save-btn {
                margin-right: 15px;
            }

            .control-btn:last-child {
                margin-right: 10px;
            }
        }

        .control-btn {
            width: 30px;
            height: 30px;
            margin: 5px;
        }
    }

    .nav-banner {
        position: relative;
        width: 100%;
        height: 40px;
        padding: 0px 5px;

        display: flex;
        align-items: center;
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        z-index: 3;
    }

    .fabulous-notebook-info-block {
        position: absolute;
        left: 0px;
        top: 5px;
        width: 100%;
        height: 230px;
        padding: 0px 5px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end;
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        overflow: hidden;
        z-index: 2;

        &.has-banner {
            height: 180px;
        }
    }

    .fabulous-notebook-banner-img {
        position: relative;
        width: calc(100% - 30px);
        height: auto;
        margin-left: 15px;
        margin-top: 25px;
        border-radius: 6px;
        transition: all 0.3s;
        z-index: 2;

        &:hover {
            opacity: 0.8;
        }

        &:active {
            opacity: 0.6;
        }
    }

    .fabulous-notebook-readonly-title-block {
        @include Hcenter;

        position: relative;
        width: 100%;
        padding: 15px;
        font-size: 24px;
        font-weight: 600;

        &.dark {
            color: whitesmoke;
        }
    }

    .main-display-block {
        @include Vend;

        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 1;
    }

    .loading-block {
        @include HcenterVcenter;

        position: relative;
        width: 100%;
        height: calc(100% - 40px);
        flex: 1;
    }

    .bottom-control {
        @include HendVcenter;

        position: absolute;
        right: 0px;
        bottom: 0px;
        width: 100%;
        height: 35px;
        background: rgba(245, 245, 245, 0.6);
        font-size: 12px;
        transition: all 0.3s;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        z-index: 3;

        &.dark {
            background: rgba(36, 36, 36, 0.6);
            color: whitesmoke;
        }

        &.close {
            width: 25px;
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
            overflow: hidden;
        }

        * {
            @include Vcenter;
        }

        .trigger {
            height: 100%;
            padding: 5px;
            box-sizing: border-box;

            &:hover {
                background: rgba(200, 200, 200, 0.1);
            }

            &:active {
                background: rgba(200, 200, 200, 0.3);
            }
        }
    }

    .ProseMirror {
        p {
            line-height: 2;
        }
    }
}
</style>