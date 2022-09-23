<template>
    <div
        class="fabulous-home-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div class="control-banner">
            <div class="control-left-block">
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    @click="readonly ^= true"
                >
                    <i
                        class="ms-Icon"
                        :class="[
                            `ms-Icon--${
                                readonly === true ? 'PageEdit' : 'ReadingMode'
                            }`,
                        ]"
                    ></i>
                </fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    @click="expandContent ^= true"
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
        <div class="main-display-block">
            <power-editor
                v-show="lock.loading"
                :value="content"
                :placeholder="local('Write something ...')"
                :editable="!readonly"
                :theme="theme"
                :language="language"
                :editorBackground="
                    theme == 'dark' ? 'rgba(47, 52, 55, 0)' : 'rgba(250, 250, 250, 0)'"
                :editorOutSideBackground="
                    theme == 'dark' ? 'rgba(47, 52, 55, 0)' : 'rgba(250, 250, 250, 0)'"
                :toolbarHeight="150"
                :readOnlyPaddingTop="100"
                :contentMaxWidth="expandContent ? '99999px' : '900px'"
                :mobileDisplayWidth="0"
                ref="editor"
                :style="{background: 'transparent', 'font-size': `${fontSize}px`}"
                style="position: relative; width: 100%; height: 100%; flex: 1;"
                @save-json="saveContent"
                @click.native="show.quickNav = false"
            >
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
    </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";

const { ipcRenderer: ipc } = require("electron");
const path = require("path");

export default {
    components: {},
    data() {
        return {
            path: "",
            content: "",
            contentType: "", // json, html, fabulous_notebook
            rawContent: "",
            readonly: false,
            fontSize: 16,
            expandContent: false,
            history: [],
            unsave: false,
            auto_save: false,
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
            if (this.$route.name === "NoteBook") this.refreshPath();
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
    },
    computed: {
        ...mapState({
            autoSave: (state) => state.config.autoSave,
            language: (state) => state.config.language,
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(["local"]),
    },
    mounted() {
        console.log(ipc, path);
        this.ShortCutInit();
        this.timerInit();
    },
    methods: {
        ...mapMutations({
            reviseConfig: "reviseConfig",
        }),
        timerInit() {
            clearInterval(this.timer.autoSave);
            this.timer.autoSave = setInterval(this.autoSaveContent, 10000);
        },
        ShortCutInit() {
            this.$el.addEventListener("keydown", (event) => {
                if (event.keyCode === 83 && event.ctrlKey) {
                    this.$refs.editor.save();
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
            path = path.replace(/\\/g, "/");
            this.path = path;
        },
        async refreshContent() {
            if (!this.lock.loading) return;
            this.lock.loading = false;
            ipc.send("read-file", {
                id: "notebook",
                path: this.path,
            });
            let content = await new Promise((resolve) => {
                ipc.on(`read-file-notebook`, (event, data) => {
                    resolve(data);
                });
            });
            try {
                this.rawContent = JSON.parse(content);
                if (this.rawContent.fabulous_notebook) {
                    this.contentType = "fabulous_notebook";
                    this.content = this.rawContent.content;
                } else {
                    this.contentType = "json";
                    this.content = this.rawContent;
                }
                this.lock.loading = true;
            } catch (e) {
                this.contentType = "html";
                this.content = content;
                this.lock.loading = true;
            }
            if (this.content === "") this.$refs.editor.focus();
        },
        autoSaveContent() {
            if (this.auto_save) {
                this.$refs.editor.save();
            }
        },
        async saveContent(json) {
            let saveContent = this.rawContent;
            if (this.contentType === "fabulous_notebook") {
                saveContent.content = json;
                saveContent.updateDate = new Date();
            } else {
                saveContent = json;
            }
            ipc.send("output-file", {
                path: this.path,
                data: JSON.stringify(saveContent),
            });
            await new Promise((resolve) => {
                ipc.on("output-file-callback", () => {
                    resolve(1);
                });
            });
            this.unsave = false;
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
        z-index: 2;

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
        z-index: 2;

        &.half {
            width: 48%;
        }
    }

    .main-display-block {
        @include Vend;

        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(250, 250, 250, 0.8);
        overflow: hidden;
        z-index: 1;

        .pdf-viewer {
            position: relative;
            width: 100%;
            height: calc(100% - 80px);
            flex: 1;
            border-left: rgba(120, 120, 120, 0.1) solid thin;
        }
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
        z-index: 2;

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
}
</style>