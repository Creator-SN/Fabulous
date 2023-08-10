<template>
    <div
        id="app"
        :class="{dark: theme == 'dark'}"
    >
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
import i18n from '@/js/i18n.js';
import starter from '@/components/general/starter.vue';
import titleBar from '@/components/general/titleBar.vue';
import progressBar from '@/components/general/progressbar.vue';
import navigationView from '@/components/general/navigationView';
import editorContainer from '@/components/general/editorContainer';
import pdfImporter from '@/components/general/pdfImporter.vue';
import itemCarrier from '@/components/general/itemCarrier.vue';
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';

export default {
    name: 'App',
    components: {
        starter,
        titleBar,
        progressBar,
        navigationView,
        editorContainer,
        pdfImporter,
        itemCarrier
    },
    data() {
        return {
            show: {
                drop: false
            }
        };
    },
    watch: {
        $route() {
            this.pdfImporterInit();
            this.refreshUserInfo();
        }
    },
    computed: {
        ...mapState({
            init_status: (state) => state.config.init_status,
            data_index: (state) => state.config.data_index,
            data_path: (state) => state.config.data_path,
            language: (state) => state.config.language,
            show_editor: (state) => state.editor.show,
            windowWidth: (state) => state.window.width,
            mobileDisplay: (state) => state.window.mobileDisplay,
            userInfo: (state) => state.User.info,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath']),
        currentPath() {
            return this.currentDataPath;
        },
        SourceDisabled() {
            return !this.currentDataPath;
        }
    },
    mounted() {
        this.configInit();
        this.pdfImporterInit();
        this.dropFilesInit();
        this.i18nInit();
        this.refreshWindowSizeInit();
        this.refreshUserInfo();
        if (this.$route.path !== '/') this.$Go('/');
    },
    methods: {
        ...mapMutations({
            revisePdfImporter: 'revisePdfImporter',
            reviseProgress: 'reviseProgress',
            setWindowSize: 'setWindowSize',
            reviseI18N: 'reviseI18N'
        }),
        ...mapActions('config', {
            getConfig: 'getConfig',
            reviseConfig: 'reviseConfig'
        }),
        ...mapMutations('User', {
            setInfo: 'setInfo'
        }),
        ...mapActions('User', {
            getInfo: 'getInfo',
            getAvatar: 'getAvatar'
        }),
        i18nInit() {
            this.reviseI18N(i18n);
        },
        async configInit() {
            await this.getConfig();
        },
        async refreshUserInfo() {
            if (localStorage.getItem('ApiToken')) {
                await this.getInfo();
                await this.getAvatar();
            }
        },
        pdfImporterInit() {
            this.revisePdfImporter({
                pdf_importer: this.$refs.pdf_importer
            });
        },
        dropFilesInit() {
            this.$el.addEventListener(
                'dragenter',
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
                'dragover',
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
                'dragleave',
                (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                },
                false
            );

            this.$refs.drop.addEventListener(
                'dragleave',
                (e) => {
                    this.show.drop = false;
                    e.preventDefault();
                    e.stopPropagation();
                },
                false
            );

            this.$el.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();

                this.show.drop = false;
                var df = e.dataTransfer;
                var files = [];

                if (df.items !== undefined) {
                    for (let i = 0; i < df.items.length; i++) {
                        let item = df.items[i];
                        let fileEntry = item.webkitGetAsEntry();
                        let ext = fileEntry ? fileEntry.name.split('.') : [];
                        ext = ext[ext.length - 1];
                        // 用webkitGetAsEntry禁止上传目录
                        if (
                            item.kind === 'file' &&
                            fileEntry.isFile &&
                            item.type === 'application/pdf'
                        ) {
                            let file = item.getAsFile();
                            files.push(file);
                        } else if (ext === 'fbn') {
                            let file = item.getAsFile();
                            let url = `/notebook/${encodeURI(
                                file.path.replace(/\//g, '\\')
                            )}`;
                            if (this.$route.path === url) return;
                            this.$Go(url);
                        }
                    }
                }

                if (this.show_editor) return;
                if (this.SourceDisabled) return;

                this.revisePdfImporter({
                    df: files
                });
            });
        },
        refreshWindowSizeInit() {
            this.timer = setInterval(() => {
                let width = document.body.clientWidth;
                let height = document.body.clientHeight;
                this.setWindowSize({
                    width,
                    height
                });
            }, 100);
        },
        updateProgress(value) {
            this.reviseProgress(value);
        },
        Go(path) {
            if (this.$route.path === path) return 0;
            this.$Go(path);
        }
    }
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
    font-family: Segoe UI Emoji, Segoe UI Symbol, Segoe UI, Helvetica Neue,
        Helvetica, Arial, sans-serif;
    display: flex;
    overflow: hidden;
    transition: all 0.3s;

    &.dark {
        background: rgba(36, 36, 36, 1);
    }

    ::-webkit-scrollbar {
        width: 10px;
        height: 8px;

        &:hover {
            width: 16px;
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
        border-right: rgba(191, 190, 189, 0.2) solid 5px;
        background-color: rgba(191, 190, 189, 0);
        transition: background-color 0.3s;
        cursor: pointer;

        &:hover {
            border-radius: 10px;
            border-color: transparent;
            background-color: rgba(191, 190, 189, 0.6);
        }

        &:active {
            background-color: rgba(191, 190, 189, 0.5);
        }

        &:horizontal {
            border-right: none;
            border-bottom: rgba(191, 190, 189, 0.2) solid 5px;
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
