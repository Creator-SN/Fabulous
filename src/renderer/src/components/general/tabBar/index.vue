<template>
    <div
        v-if="!shouldHide"
        draggable="false"
        class="tab-bar"
        :class="{ dark: theme == 'dark' }"
        :style="{
            width: `calc(100% - ${leftOffset + rightOffset}px)`,
            left: `${leftOffset}px`,
            background: background
        }"
        @dragstart="setDraggingEl($el)"
        @dragend="setDraggingEl(null)"
    >
        <div class="left-block">
            <fv-tab-view
                v-model="tabValueModel"
                :items="tabList"
                :theme="theme"
                :itemWidth="160"
                :item-height="30"
                list-padding="0px 2px"
                background="transparent"
                overflowMode="scroll"
                class="tab-view"
                styleMode="rounded"
                :normal-background="
                    theme === 'dark' ? 'rgba(2, 9, 15, 0)' : 'rgba(236, 236, 236, 0)'
                "
                @update:items="updateItems"
                @click="handleClick"
                @close="closeTab"
            >
                <template #icon="{ item, valueTrigger }">
                    <img
                        v-if="item.image"
                        class="tab-view-item-icon tab-view-item-image"
                        :src="item.image"
                        draggable="false"
                    />
                    <i
                        v-else-if="valueTrigger(item.icon)"
                        class="ms-Icon tab-view-item-icon"
                        :class="`ms-Icon--${valueTrigger(item.icon)}`"
                    ></i>
                    <i v-if="item.emoji">{{ valueTrigger(item.emoji) }}</i>
                </template>
            </fv-tab-view>
        </div>
        <slot name="right"> </slot>
    </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'

import researchIcon from '@/assets/nav/research.svg'
import notebookIcon from '@/assets/nav/notebook.svg'
import templateIcon from '@/assets/nav/template.svg'

export default {
    props: {
        background: {
            default: ''
        },
        leftOffset: {
            default: 0
        },
        rightOffset: {
            default: 0
        },
        hidePrefix: {
            default: () => ['/login']
        },
        theme: {
            default: 'light'
        }
    },
    data() {
        return {}
    },
    watch: {
        $route() {
            this.addThisTab()
        }
    },
    computed: {
        ...mapState(useAppConfig, {
            tabList: (state) => state.tabList,
            tabValue: (state) => state.tabValue,
            academicTarget: (state) => state.editor.academic?.target,
            notebookTarget: (state) => state.editor.notebook?.target,
            academicUnsaved: (state) => state.editor.academic?.unsave,
            notebookUnsaved: (state) => state.editor.notebook?.unsave
        }),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath,
            currentDataPathItem: (state) => state.currentDataPathItem
        }),
        tabPresent() {
            return {
                '': {
                    name: this.local('Home'),
                    image: researchIcon
                },
                partitions: {
                    name: this.local('Partitions'),
                    image: researchIcon
                },
                settings: {
                    name: this.local('Settings'),
                    icon: 'Settings'
                },
                notebook: {
                    name: () => {
                        if (this.notebookTarget?.name) return this.notebookTarget.name
                        return this.local('Notebook')
                    },
                    image: notebookIcon,
                    modified: () => this.notebookUnsaved
                },
                academic: {
                    name: () => {
                        if (this.academicTarget?.name) return this.academicTarget.name
                        return this.local('Academic')
                    },
                    image: notebookIcon,
                    modified: () => this.academicUnsaved
                },
                templates: {
                    name: this.local('Templates'),
                    image: templateIcon
                }
            }
        },
        tabValueModel: {
            get() {
                return this.tabValue
            },
            set(value) {
                this.setTabValue(value)
            }
        },
        shouldHide() {
            return this.hidePrefix.some((prefix) => this.$route.fullPath.startsWith(prefix))
        }
    },
    mounted() {
        this.addThisTab()
    },
    methods: {
        ...mapActions(useAppConfig, [
            'local',
            'setTabValue',
            'addTab',
            'setTabList',
            'removeTab',
            'setDraggingEl'
        ]),
        addThisTab() {
            let key = this.getRouteKey()
            if (!this.tabPresent[key]) return
            this.addTab(
                {
                    ...this.tabPresent[key],
                    route: this.$route.fullPath
                },
                this.$route.fullPath
            )
        },
        getRouteKey() {
            return this.$route.fullPath.split('/')[1]
        },
        handleClick(item) {
            if (item?.route) this.$Go(item?.route)
        },
        updateItems(items) {
            this.setTabList(items)
        },
        closeTab({ item }) {
            let key = this.getRouteKey()
            let targetKey = item['key']
            this.removeTab(item['key'])
            if (key === targetKey) {
                if (this.tabList.length === 0 || !this.tabValue.route) {
                    this.$Go('/')
                } else {
                    this.$Go(this.tabList[0].route)
                }
            }
        }
    },
    beforeUnmount() {}
}
</script>

<style lang="scss">
.tab-bar {
    position: relative;
    top: 8px;
    width: 100%;
    min-height: 35px;
    height: 35px;
    background: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-items: center;
    user-select: none;
    overflow: visible;
    -webkit-app-region: drag;

    &.dark {
        background: black;

        .left-block {
            color: white;
        }

        .mid-block {
            color: white;
        }

        .control-block {
            .btn {
                color: white;

                &:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                &:active {
                    background: rgba(255, 255, 255, 0.1);
                }

                &.close {
                    &:hover {
                        background: rgba(215, 20, 37, 1);
                        color: white;
                    }

                    &:active {
                        background: rgba(155, 11, 23, 1);
                    }
                }
            }
        }
    }

    .left-block {
        flex: 1;
        min-width: 0;
        height: 100%;
        display: flex;
        align-items: center;
        padding-left: 10px;
        font-size: 13px;
        -webkit-app-region: drag;

        .tab-view-item {
            -webkit-app-region: no-drag;
        }
    }

    .tab-view {
        flex: 1;
        min-width: 0;
        width: 100%;
        height: 100%;
    }

    .control-block {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        user-select: none;
        -webkit-app-region: no-drag;

        .btn {
            width: 50px;
            height: 100%;
            font-size: 12px;
            display: flex;
            justify-content: center;
            align-items: center;

            &:hover {
                background: rgba(167, 167, 167, 0.2);
            }

            &:active {
                background: rgba(128, 128, 128, 0.2);
            }

            &.close {
                &:hover {
                    background: rgba(232, 17, 35, 1);
                    color: white;
                }

                &:active {
                    background: rgba(189, 11, 26, 1);
                }
            }
        }
    }
}
</style>
