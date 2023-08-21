<template>
    <fv-navigation-panel
        :title="local('Fabulous')"
        class="navigation-view"
        :expand.sync="expand"
        :theme="theme"
        :background="navigationViewBackground"
        :settingTitle="local('Setting')"
        :mobileDisplay="mobileDisplay"
        :flyout-display="mobileDisplay"
        :expandWidth="350"
        :showNav="windowWidth < mobileDisplay"
        :show-search="false"
        :style="{'z-index': windowWidth < mobileDisplay ? 2 : 1}"
        @setting-click="Go(`/settings`)"
        @back="$Back"
    >
        <template v-slot:panel>
            <div
                class="navigation-view-template"
                ref="view"
            >
                <div class="navigation-view-pivot">
                    <fv-pivot
                        :items="pivotList"
                        :theme="theme"
                        slider-background="rgba(145, 145, 235, 1)"
                        style="width: calc(100% - 20px);"
                        @change="switchDisplay"
                    >
                        <template v-slot:container="x">
                            <img
                                draggable="false"
                                :src="x.item.img"
                                alt=""
                                class="icon-img"
                            >
                            <p class="control-title">{{x.item.name()}}</p>
                        </template>
                    </fv-pivot>
                </div>
                <div
                    v-if="menuDisplayMode.key != 0 && isLogin"
                    class="navigation-view-pivot"
                >
                    <fv-Pivot
                        v-model="menuDisplayMode"
                        :items="notebookPivot"
                        :tab="true"
                        :font-size="12"
                        style="width: calc(100% - 20px);"
                        @change="switchDisplay"
                    ></fv-Pivot>
                </div>
                <ds-tree-view
                    v-show="expand && activeSystemMode !== 'notebook' && computeDisplay('ds')"
                    :Go="Go"
                ></ds-tree-view>
                <local-tree-view
                    v-show="expand && activeSystemMode !== 'ds' && computeDisplay('local_notebook')"
                    v-model="localPath"
                    :Go="Go"
                    ref="local_view"
                ></local-tree-view>
                <local-tree-view
                    v-show="expand && activeSystemMode !== 'ds' && computeDisplay('remote_notebook')"
                    v-model="currentDataPath"
                    :isRemote="true"
                    :Go="Go"
                    ref="remote_view"
                ></local-tree-view>
            </div>
        </template>
    </fv-navigation-panel>
</template>

<script>
import dsTreeView from '@/components/general/navigationView/dsTreeView.vue';
import localTreeView from '@/components/general/navigationView/localTreeView.vue';
import { mapActions, mapState, mapGetters } from 'vuex';

import dataSource from '@/assets/nav/dataSource.svg';
import notebook from '@/assets/nav/notebook.svg';

export default {
    name: 'fab-navigation-view',
    components: {
        dsTreeView,
        localTreeView
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
                        return this.local('Reference Management System');
                    },
                    img: dataSource,
                    show: () => this.activeSystemMode !== 'notebook',
                    width: '50%'
                },
                {
                    key: 1,
                    name: () => {
                        return this.local('Notebook System');
                    },
                    img: notebook,
                    show: () => this.activeSystemMode !== 'ds',
                    width: '50%'
                }
            ],
            notebookPivot: [
                {
                    key: 2,
                    name: () => {
                        return this.local('Local Notebook');
                    },
                    img: notebook,
                    show: () => this.activeSystemMode !== 'ds',
                    width: '50%'
                },
                {
                    key: 3,
                    name: () => {
                        return this.local('Remote Notebook');
                    },
                    img: notebook,
                    show: () => this.activeSystemMode !== 'ds',
                    width: '50%'
                }
            ],
            img: {
                dataSource,
                notebook
            },
            localPath: '',
            menuDisplayMode: {
                key: 0
            }
        };
    },
    watch: {
        windowWidth() {
            if (this.windowWidth > this.mobileDisplay) this.expand = true;
        },
        localPath() {
            this.reviseConfig({
                lastLocalPath: this.localPath
            });
        },
        lastLocalPath() {
            this.localPath = this.lastLocalPath;
        }
    },
    computed: {
        ...mapState({
            language: (state) => state.config.language,
            lastLocalPath: (state) => state.config.lastLocalPath,
            activeSystemMode: (state) => state.config.activeSystemMode,
            watchAllExtensions: (state) => state.config.watchAllExtensions,
            windowWidth: (state) => state.window.width,
            mobileDisplay: (state) => state.window.mobileDisplay,
            userInfo: (state) => state.User.info,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath', '$auto']),
        navigationViewBackground() {
            if (this.theme == 'light') return 'rgba(242, 242, 242, 0.8)';
            return 'rgba(0, 0, 0, 0.8)';
        },
        localPathFolderName() {
            let pathList = this.localPath.split(/[\\/]/);
            return pathList[pathList.length - 1];
        },
        isLogin() {
            return this.userInfo.id;
        },
        computeDisplay() {
            return (name) => {
                if (name === 'ds') {
                    if (this.activeSystemMode === 'ds') return true;
                    if (this.activeSystemMode === 'notebook') return false;
                    return this.menuDisplayMode.key === 0;
                }
                if (name === 'local_notebook') {
                    if (this.activeSystemMode === 'ds') return false;
                    if (this.activeSystemMode === 'notebook' && !this.isLogin)
                        return true;
                    return this.menuDisplayMode.key === 2;
                }
                if (name === 'remote_notebook') {
                    if (this.activeSystemMode === 'ds') return false;
                    if (!this.isLogin) return false;
                    return this.menuDisplayMode.key === 3;
                }
            };
        }
    },
    mounted() {
        this.localPath = this.lastLocalPath;
    },
    methods: {
        ...mapActions({
            reviseConfig: 'reviseConfig'
        }),
        switchDisplay(event) {
            const key = event.key;
            if (key === 1) {
                if (!this.isLogin) this.menuDisplayMode = this.notebookPivot[0];
                else this.menuDisplayMode = this.notebookPivot[1];
                return;
            }
            this.menuDisplayMode = event;
        },
        Go(path) {
            if (this.$route.path === path) return 0;
            if (this.windowWidth < this.mobileDisplay) this.expand = false;
            this.$Go(path);
        }
    }
};
</script>

<style lang="scss">
.navigation-view {
    position: relative;
    height: 100%;
    z-index: 5;

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
            padding: 0px 15px;
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
                background: rgba(0, 0, 0, 0.3);

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
</style>