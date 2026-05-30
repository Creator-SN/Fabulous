<template>
    <div id="app" :class="{ dark: theme == 'dark' }">
        <navigation-view v-show="show.nav"></navigation-view>
        <title-bar
            v-if="clientMode !== 'web'"
            :theme="theme"
            style="background: transparent"
        ></title-bar>
        <tab-bar
            class="tab-bar"
            :theme="theme"
            :left-offset="titleBarOffset"
            :right-offset="150"
            style="background: transparent"
        ></tab-bar>
        <div class="addition-container">
            <div class="global-container">
                <router-view v-slot="{ Component }">
                    <keep-alive include="Home,Partition,Templates,Settings,Academic,Notebook,LocalNotebook">
                        <component :is="Component" :key="$route.name" />
                    </keep-alive>
                </router-view>
            </div>
        </div>
        <pdf-importer ref="pdf_importer"></pdf-importer>
        <item-carrier @update-progress="updateProgress"></item-carrier>
        <div v-show="show.drop" class="file-drop-mask" ref="drop"></div>
        <progress-bar></progress-bar>
    </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
import { setProxy } from '@/stores/proxyHolder'

const instance = getCurrentInstance()
setProxy(instance.proxy)
</script>

<script>
import i18n from '@/js/i18n.js'
import progressBar from '@/components/general/progressbar.vue'
import navigationView from '@/components/general/navigationView/index.vue'
import titleBar from '@/components/general/titleBar.vue'
import tabBar from '@/components/general/tabBar/index.vue'
import pdfImporter from '@/components/general/pdfImporter.vue'
import itemCarrier from '@/components/general/itemCarrier.vue'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useUserStore } from '@/stores/user'
import { useTheme } from '@/stores/theme'
import { mapState, mapActions } from 'pinia'

export default {
    name: 'App',
    components: {
        progressBar,
        tabBar,
        navigationView,
        pdfImporter,
        itemCarrier
    },
    data() {
        return {
            show: {
                nav: false,
                drop: false
            }
        }
    },
    watch: {
        $route() {
            this.pdfImporterInit()
            this.refreshUserInfo()
            this.refreshNavShow()
        },
        'userInfo.id'() {
            this.refreshDataInfo()
        }
    },
    computed: {
        ...mapState(useUserStore, {
            userInfo: 'info'
        }),
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        ...mapState(useAppConfig, {
            local: (state) => state.local,
            clientMode: (state) => state.clientMode,
            draggingEl: (state) => state.draggingEl,
            fullScreen: (state) => state.fullScreen,
            windowWidth: (state) => state.window.width,
            mobileDisplay: (state) => state.window.mobileDisplay
        }),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        }),
        SourceDisabled() {
            return !this.currentDataPath
        },
        show_editor() {
            return (
                this.$route.path.startsWith('/academic') || this.$route.path.startsWith('/notebook')
            )
        },
        titleBarOffset() {
            if (this.fullScreen) return 0
            return this.windowWidth <= this.mobileDisplay ? 40 : 350
        }
    },
    mounted() {
        this.asyncInit()
        this.pdfImporterInit()
        this.dropFilesInit()
        this.i18nInit()
        this.refreshNavShow()
        this.refreshWindowSizeInit()
    },
    methods: {
        ...mapActions(useAppConfig, {
            revisePdfImporter: 'revisePdfImporter',
            reviseProgress: 'reviseProgress',
            setWindowSize: 'setWindowSize',
            reviseI18N: 'reviseI18N'
        }),
        ...mapActions(useDataStore, {
            refreshDataInfo: 'refreshDataInfo'
        }),
        ...mapActions(useUserStore, {
            getAvatar: 'getAvatar',
            refreshUserInfo: 'refreshUserInfo'
        }),
        i18nInit() {
            this.reviseI18N(i18n)
        },
        refreshNavShow() {
            this.show.nav = !this.$route.path.startsWith('/login')
        },
        async asyncInit() {
            await this.refreshUserInfo()
            await this.refreshDataInfo()
        },
        pdfImporterInit() {
            this.revisePdfImporter({
                pdf_importer: this.$refs.pdf_importer
            })
        },
        dropFilesInit() {
            const skip_condition = () => {
                if (this.show_editor) return true
                if (!this.draggingEl?.classList?.contains('tab-view')) return true
                return false
            }
            this.$el.addEventListener(
                'dragenter',
                (e) => {
                    if (!skip_condition(e)) {
                        this.show.drop = true
                        e.preventDefault()
                        e.stopPropagation()
                    }
                },
                false
            )

            this.$el.addEventListener(
                'dragover',
                (e) => {
                    if (!skip_condition(e)) {
                        this.show.drop = true
                        e.preventDefault()
                        e.stopPropagation()
                    }
                },
                false
            )

            this.$el.addEventListener(
                'dragleave',
                (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                },
                false
            )

            this.$refs.drop.addEventListener(
                'dragleave',
                (e) => {
                    this.show.drop = false
                    e.preventDefault()
                    e.stopPropagation()
                },
                false
            )

            this.$el.addEventListener('drop', (e) => {
                e.preventDefault()
                e.stopPropagation()

                this.show.drop = false
                var df = e.dataTransfer
                var files = []

                if (df.items !== undefined) {
                    for (let i = 0; i < df.items.length; i++) {
                        let item = df.items[i]
                        let fileEntry = item.webkitGetAsEntry()
                        let ext = fileEntry ? fileEntry.name.split('.') : []
                        ext = ext[ext.length - 1]
                        // 用webkitGetAsEntry禁止上传目录
                        if (
                            item.kind === 'file' &&
                            fileEntry.isFile &&
                            item.type === 'application/pdf'
                        ) {
                            let file = item.getAsFile()
                            files.push(file)
                        } else if (ext === 'fbn') {
                            let file = item.getAsFile()
                            let url = `/notebook/${encodeURI(file.path.replace(/\//g, '\\'))}`
                            if (this.$route.path === url) return
                            this.$Go(url)
                        }
                    }
                }

                if (this.show_editor) return
                if (this.SourceDisabled) return

                this.revisePdfImporter({
                    df: files
                })
            })
        },
        refreshWindowSizeInit() {
            this.timer = setInterval(() => {
                let width = document.body.clientWidth
                let height = document.body.clientHeight
                this.setWindowSize({
                    width,
                    height
                })
            }, 100)
        },
        updateProgress(value) {
            this.reviseProgress(value)
        },
        Go(path) {
            if (this.$route.path === path) return 0
            this.$Go(path)
        }
    }
}
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
    font-family:
        Segoe UI Emoji,
        Segoe UI Symbol,
        Segoe UI,
        Helvetica Neue,
        Helvetica,
        Arial,
        sans-serif;
    display: flex;
    overflow: hidden;
    transition: all 0.3s;

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

    .tab-bar {
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

@media print {
    body {
        * {
            visibility: hidden;
        }

        #app {
            position: relative;
            height: auto;
            overflow: auto;

            > * {
                display: none;
            }

            .addition-container {
                height: auto;
                display: flex;

                .global-container {
                    width: 100%;
                    height: auto;
                }
            }

            .fabulous-editor-container {
                display: flex;
            }
        }

        .fabulous-editor-container {
            position: relative;
            left: 0px;
            top: 0px;
            width: 100%;
            height: auto;
            overflow: hidden;

            .main-display-block {
                position: relative;
                height: auto;
                overflow: hidden;
            }
        }

        .power-editor-container {
            height: auto;
            visibility: visible;
            overflow: hidden;

            * {
                visibility: visible;
            }

            .power-editor-tool-bar-acrylic-background,
            .power-editor-tool-bar-container {
                display: none;
            }

            .tip-tap-editor-container {
                padding-top: 5px;
                overflow: hidden;
            }

            * .editor-nav-wrapper {
                visibility: hidden;

                * {
                    visibility: hidden;
                }
            }
        }
    }
}
</style>
