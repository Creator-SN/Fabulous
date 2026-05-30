<template>
    <div :style="{ 'z-index': windowWidth < mobileDisplay ? 2 : '' }">
        <fv-navigation-panel
            v-show="!fullScreen"
            :title="''"
            class="navigation-view"
            v-model:expand="expand"
            :theme="theme"
            :background="navigationViewBackground"
            :settingTitle="local('Setting')"
            :mobileDisplay="mobileDisplay"
            :flyout-display="mobileDisplay"
            :expandWidth="350"
            :showNav="windowWidth < mobileDisplay"
            :show-search="false"
            :show-back="false"
            :mobile-control-top="'5px'"
            :style="{ 'z-index': windowWidth < mobileDisplay ? 2 : 1 }"
            @setting-click="Go(`/settings`)"
            @back="$Back"
        >
            <template v-slot:panel>
                <div class="navigation-view-template" ref="view">
                    <div class="navigation-view-pivot">
                        <fv-pivot
                            :items="pivotList"
                            :theme="theme"
                            :tab="true"
                            :slider-background="
                                theme === 'dark' ? 'rgba(75, 75, 75, 1)' : 'rgba(255, 255, 255, 1)'
                            "
                            foreground="black"
                            choosenForeground="black"
                            :background="
                                theme === 'dark' ? 'rgba(20, 20, 20, 1)' : 'rgba(238, 238, 239, 1)'
                            "
                            borderRadius="30"
                            padding="0 3px"
                            slider-border-radius="30"
                            style="width: 100%; height: 35px"
                            @change="switchDisplay"
                        >
                            <template v-slot:container="x">
                                <img draggable="false" :src="x.item.img" alt="" class="icon-img" />
                                <p
                                    class="control-title"
                                    :style="{
                                        color: x.eqal(x.item) ? 'rgba(237, 180, 37, 1)' : ''
                                    }"
                                >
                                    {{ x.item.name() }}
                                </p>
                            </template>
                        </fv-pivot>
                    </div>
                    <div
                        v-if="
                            false &&
                            menuDisplayMode.key === 1 &&
                            isLogin &&
                            !currentDataPathItem.local
                        "
                        class="navigation-view-pivot"
                    >
                        <fv-button
                            :theme="theme"
                            :foreground="notebookMode === 0 ? '' : 'rgba(250, 250, 250, 1)'"
                            :background="notebookMode === 0 ? '' : 'rgba(145, 145, 235, 1)'"
                            :font-size="12"
                            :border-radius="6"
                            :icon="notebookMode === 0 ? 'ChromeSwitch' : 'Cloud'"
                            :reveal-border-color="
                                notebookMode === 0
                                    ? [
                                          'rgba(145, 145, 235, 1)',
                                          'rgba(255, 139, 216, 1)',
                                          'rgba(255, 188, 105, 1)'
                                      ]
                                    : ['rgba(255, 139, 216, 1)', 'rgba(255, 188, 105, 1)']
                            "
                            style="width: 80%; margin-left: 10%"
                            @click="switchNotebookMode"
                            >{{ notebookPivot[notebookMode].name() }}</fv-button
                        >
                    </div>
                    <ds-tree-view
                        v-show="expand && activeSystemMode !== 'notebook' && computeDisplay('ds')"
                        :Go="Go"
                    ></ds-tree-view>
                    <local-tree-view
                        v-if="false"
                        v-show="
                            expand &&
                            activeSystemMode !== 'ds' &&
                            computeDisplay('notebook') &&
                            notebookMode === 0
                        "
                        v-model="localPath"
                        :Go="Go"
                        ref="local_view"
                    ></local-tree-view>
                    <remote-tree-view
                        v-if="currentDataPathItem.local !== true"
                        v-show="
                            expand &&
                            activeSystemMode !== 'ds' &&
                            computeDisplay('notebook') &&
                            notebookMode === 1
                        "
                        :model-value="currentDataPath"
                        :isRemote="true"
                        :Go="Go"
                        ref="remote_view"
                    ></remote-tree-view>
                </div>
            </template>
            <template v-slot:mask>
                <loading v-show="!currentDataPath" style="z-index: 2">
                    <div v-show="!dataPathLock && userInfo.id" class="central-box">
                        <fv-progress-ring
                            :loading="true"
                            r="10"
                            border-width="2"
                            :color="color"
                            :background="theme === 'dark' ? 'rgba(0, 0, 0, 1)' : 'white'"
                        ></fv-progress-ring>
                        <p class="title">{{ local('Loading...') }}</p>
                    </div>
                    <div v-show="!userInfo.id" class="central-box">
                        <p class="title" style="width: 100%">{{ local('Loading...') }}</p>
                        <fv-button
                            theme="dark"
                            :background="gradient"
                            :border-radius="6"
                            style="width: 120px"
                            @click="$Go(`/login`)"
                            >{{ local('Login to Start') }}</fv-button
                        >
                    </div>
                    <div v-show="dataPathLock && userInfo.id" class="central-box">
                        <fv-Combobox
                            v-model="languageModel"
                            :theme="theme"
                            :options="languages"
                            :disabled="!lock_config"
                            :placeholder="local('Choose A Language')"
                            :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : ''"
                            :border-color="'rgba(120, 120, 120, 0.3)'"
                            style="width: 120px"
                        ></fv-Combobox>
                        <p class="title" style="width: 100%">{{ local('No Data Source') }}</p>
                        <p class="description">
                            {{
                                local(
                                    'Please set up your data source in Settings by clicking the add data source button.'
                                )
                            }}
                        </p>
                        <fv-button
                            theme="dark"
                            :background="gradient"
                            :border-radius="6"
                            style="width: 120px"
                            @click="$Go(`/settings`)"
                            >{{ local('Settings') }}</fv-button
                        >
                    </div>
                </loading>
            </template>
        </fv-navigation-panel>
        <div
            v-show="windowWidth > mobileDisplay"
            draggable="false"
            class="full-screen-btn-block"
            :class="[{ dark: theme === 'dark' }]"
            @click="setFullScreen(!fullScreen)"
        >
            <i
                class="ms-Icon"
                :class="[`ms-Icon--${fullScreen ? 'ChevronRight' : 'ChevronLeft'}`]"
            ></i>
        </div>
    </div>
</template>

<script>
import loading from '@/components/general/loading.vue'
import dsTreeView from '@/components/general/navigationView/dsTreeView/index.vue'
import localTreeView from '@/components/general/navigationView/localTreeView.vue'
import remoteTreeView from '@/components/general/navigationView/remoteTreeView/index.vue'
import { mapState, mapActions } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useUserStore } from '@/stores/user'
import { useTheme } from '@/stores/theme'

import dataSource from '@/assets/nav/research.svg'
import notebook from '@/assets/nav/notebook.svg'

export default {
    name: 'fab-navigation-view',
    components: {
        loading,
        dsTreeView,
        localTreeView,
        remoteTreeView // 因为外部如果定义了两个localTreeView, 在销毁组件时, Remote的直接被复用了.
    },
    props: {
        rightMenuWidth: {
            default: 200
        }
    },
    data() {
        return {
            expand: true,
            pivotList: [
                {
                    key: 0,
                    name: () => {
                        return this.local('Research')
                    },
                    img: dataSource,
                    show: () => this.activeSystemMode !== 'notebook',
                    width: '50%'
                },
                {
                    key: 1,
                    name: () => {
                        return this.local('Notebook')
                    },
                    img: notebook,
                    show: () => this.activeSystemMode !== 'ds',
                    width: '50%'
                }
            ],
            notebookMode: 0,
            notebookPivot: [
                {
                    key: 0,
                    name: () => {
                        return this.local('Local Notebook')
                    }
                },
                {
                    key: 1,
                    name: () => {
                        return this.local('Remote Notebook')
                    }
                }
            ],
            languages: [
                { key: 'en', text: 'English' },
                { key: 'cn', text: '简体中文' }
            ],
            img: {
                dataSource,
                notebook
            },
            localPath: '',
            menuDisplayMode: {
                key: 0,
                name: () => {
                    return this.local('Reference Management System')
                }
            }
        }
    },
    watch: {
        windowWidth() {
            if (this.windowWidth > this.mobileDisplay) this.expand = true
        },
        localPath() {
            this.reviseConfig({
                lastLocalPath: this.localPath
            })
        },
        lastLocalPath() {
            this.localPath = this.lastLocalPath
        },
        currentDataPath() {
            if (this.currentDataPathItem.local && this.notebookMode === 1) this.notebookMode = 0
        }
    },
    computed: {
        ...mapState(useDataStore, {
            dataPathLock: (state) => state.lock.data_path,
            language: (state) => state.configState.language,
            lastLocalPath: (state) => state.configState.lastLocalPath,
            activeSystemMode: (state) => state.configState.activeSystemMode,
            watchAllExtensions: (state) => state.configState.watchAllExtensions,
            currentDataPath: (state) => state.currentDataPath,
            currentDataPathItem: (state) => state.currentDataPathItem,
            lock_config: (state) => state.lock.config
        }),
        ...mapState(useAppConfig, {
            windowWidth: (state) => state.window.width,
            mobileDisplay: (state) => state.window.mobileDisplay,
            fullScreen: (state) => state.fullScreen,
            local: (state) => state.local
        }),
        ...mapState(useUserStore, {
            userInfo: (state) => state.info
        }),
        ...mapState(useTheme, {
            theme: (state) => state.theme,
            color: (state) => state.color,
            gradient: (state) => state.gradient
        }),
        navigationViewBackground() {
            if (this.theme == 'light') return 'rgba(246, 246, 246, 0.7)'
            return 'rgba(5, 9, 15, 0.9)'
        },
        localPathFolderName() {
            let pathList = this.localPath.split(/[\\/]/)
            return pathList[pathList.length - 1]
        },
        isLogin() {
            return this.userInfo.id
        },
        computeDisplay() {
            return (name) => {
                if (name === 'ds') {
                    if (this.activeSystemMode === 'ds') return true
                    if (this.activeSystemMode === 'notebook') return false
                    return this.menuDisplayMode.key === 0
                }
                if (name === 'notebook') {
                    if (this.activeSystemMode === 'ds') return false
                    if (this.activeSystemMode === 'notebook') return true
                    return this.menuDisplayMode.key === 1
                }
            }
        },
        languageModel: {
            get() {
                return this.languages.find((item) => item.key === this.language) || {}
            },
            set(value) {
                if (value && value.key) {
                    this.reviseConfig({ language: value.key })
                }
            }
        }
    },
    mounted() {
        this.localPath = this.lastLocalPath
    },
    methods: {
        ...mapActions(useAppConfig, {
            setFullScreen: 'setFullScreen'
        }),
        ...mapActions(useDataStore, {
            reviseConfig: 'reviseConfig'
        }),
        switchDisplay(event) {
            this.menuDisplayMode = event
            if (!this.isLogin || this.currentDataPathItem.local) this.notebookMode = 0
            else this.notebookMode = 1
        },
        switchNotebookMode() {
            this.notebookMode = 1 - this.notebookMode
        },
        Go(path) {
            if (this.$route.path === path) return 0
            if (this.windowWidth < this.mobileDisplay) this.expand = false
            this.$Go(path)
        }
    }
}
</script>

<style lang="scss">
.navigation-view {
    position: relative;
    height: 100%;
    z-index: 5;

    &.hidden {
        display: none;
    }

    .navigation-view-template {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .navigation-view-pivot {
            @include Vcenter;

            width: 100%;
            height: 60px;
            padding: 0px 20px;
            box-sizing: border-box;

            .control-title {
                font-size: 12px;
                margin-left: 10px;
                text-align: center;
            }

            .icon-img {
                width: 15px;
                height: auto;
            }
        }

        .navigation-view-mode-block {
            position: relative;
            width: calc(100% - 40px);
            margin: 3px 20px;
            padding: 8px 15px;
            border-radius: 6px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            transition: all 0.6s;
            user-select: none;

            &:hover {
                background: rgba(200, 200, 200, 0.1);

                .navigation-view-mode-right-block {
                    opacity: 1;
                }
            }

            &:active {
                background: rgba(200, 200, 200, 0.3);
            }

            &.dark {
                color: rgba(245, 245, 245, 0.8);
            }

            .navigation-view-mode-left-block {
                @include Vcenter;

                flex: 1;
            }

            .navigation-view-mode-right-block {
                @include HendVcenter;

                width: 100px;
                opacity: 0;
                transition: all 0.3s;

                .more-menu-btn {
                    @include HcenterVcenter;

                    width: 25px;
                    height: 25px;
                    font-size: 12px;
                    border-radius: 8px;

                    &:hover {
                        background: rgba(200, 200, 200, 0.2);
                    }

                    &:active {
                        background: rgba(200, 200, 200, 0.3);
                    }
                }
            }

            .title {
                margin-left: 15px;
                font-weight: bold;
                color: rgba(255, 180, 0, 1);
            }
        }

        .navigation-view-command-bar-block {
            position: relative;
            width: calc(100% - 40px);
            height: auto;
            margin: 20px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 12px;

            &.dark {
                background: rgba(23, 28, 40, 0.6);

                .command-item {
                    .command-item-icon {
                        background: rgba(36, 36, 36, 1);
                    }

                    .command-item-content {
                        color: rgba(245, 245, 245, 0.9);
                    }
                }
            }

            .command-item {
                @include Vcenter;

                position: relative;
                width: calc(100% - 30px);
                height: 45px;
                margin: 3px 15px;
                padding: 0px 15px;
                border-radius: 6px;
                box-sizing: border-box;
                transition: all 0.3s;

                &:hover {
                    background: rgba(120, 120, 120, 0.1);
                }

                &:active {
                    background: rgba(120, 120, 120, 0.2);
                }

                &.disabled {
                    filter: grayscale(1);
                    opacity: 0.6;

                    &:hover {
                        background: transparent;
                    }

                    &:active {
                        background: transparent;
                    }
                }

                .command-item-icon {
                    @include HcenterVcenter;

                    position: relative;
                    width: 30px;
                    height: 30px;
                    background: rgba(245, 245, 245, 1);
                    border-radius: 35px;

                    .icon-img {
                        width: 15px;
                        height: auto;
                    }
                }

                .command-item-content {
                    @include nowrap;

                    margin-left: 15px;
                    font-size: 13.8px;
                    font-weight: 600;
                    color: rgba(53, 55, 62, 1);
                    user-select: none;
                }
            }
        }

        .navigation-view-command-bar-block-collapse {
            @include HcenterVcenterC;

            position: relative;
            width: 100%;
            height: 100%;

            .collapse-command-btn {
                width: 100%;
                flex: 1;
            }
        }
    }

    .icon-img {
        width: 15px;
        height: auto;
        user-select: none;
    }

    .expand-top-to-bottom-enter-active,
    .expand-top-to-bottom-leave-active {
        transform-origin: 50% 0%;
        transition: all 0.3s linear;
    }

    .expand-top-to-bottom-enter,
    .expand-top-to-bottom-leave-to {
        transform: scaleY(0);
    }

    .expand-top-to-bottom-enter-to,
    .expand-top-to-bottom-leave {
        transform: scaleY(1);
    }

    .expand-bottom-to-top-enter-active,
    .expand-bottom-to-top-leave-active {
        transform-origin: 50% 100%;
        transition: all 0.3s linear;
    }

    .expand-bottom-to-top-enter,
    .expand-bottom-to-top-leave-to {
        transform: scaleY(0);
    }

    .expand-bottom-to-top-enter-to,
    .expand-bottom-to-top-leave {
        transform: scaleY(1);
    }
}

.full-screen-btn-block {
    @include HcenterVcenter;

    position: absolute;
    left: 0px;
    top: calc(50% - 18px);
    width: 15px;
    height: 36px;
    background: rgba(245, 245, 245, 0.8);
    border: rgba(120, 120, 120, 0.1) solid thin;
    border-radius: 8px;
    z-index: 3;
    transition:
        left 0.1s,
        background 0.3s;
    box-shadow: 0px 0px 1px rgba(120, 120, 120, 0.1);

    &.dark {
        background: rgba(23, 28, 40, 0.6);
        color: rgba(245, 245, 245, 0.9);

        &:hover {
            background: rgba(120, 120, 120, 0.3);
        }
        &:active {
            background: rgba(120, 120, 120, 0.1);
        }
    }

    .ms-Icon {
        font-size: 10px;
    }

    &:hover {
        background: rgba(250, 250, 250, 0.9);
    }

    &:active {
        background: rgba(245, 245, 245, 0.9);
    }
}
</style>
