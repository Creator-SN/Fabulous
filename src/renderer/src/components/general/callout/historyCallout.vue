<template>
    <callout-base
        v-model:show="show"
        :mobileMode="mobileMode"
        :title="local('History')"
        :theme="theme"
        :popperClass="['fabulous-history-callout']"
        :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : 'rgba(255, 255, 255, 1)'"
    >
        <template v-slot:trigger>
            <fv-button
                :theme="theme"
                :borderRadius="30"
                background="transparent"
                class="control-btn"
                :is-box-shadow="true"
            >
                <i class="ms-Icon ms-Icon--History"></i>
            </fv-button>
        </template>

        <template v-slot:header>
            <div class="fabulous-history-banner">
                <p style="font-size: 13.8px">{{ local('History') }}</p>
            </div>
        </template>
        <template v-slot:content>
            <div class="history-list-wrapper">
                <fv-list-view
                    :model-value="docHistory"
                    :theme="theme"
                    :row-height="60"
                    :showSlider="true"
                    :header-foreground="'rgba(140, 148, 228, 1)'"
                    :item-border-radius="8"
                    :choosen-background="theme === 'dark' ? '#333' : '#fff'"
                    style="width: 100%; height: 100%"
                    @chooseItem="getNotebookHistoryContent($event)"
                >
                    <template v-slot:listItem="x">
                        <div class="list-view-custom-content">
                            <span class="info-block">
                                <p class="main-title">{{ x.item.name }}</p>
                                <time-rounder
                                    :model-value="new Date(x.item.createDate)"
                                    icon="DevUpdate"
                                    class="max-len"
                                    :foreground="color"
                                    :font-size="'13px'"
                                    style="width: auto; opacity: 0.6"
                                ></time-rounder>
                            </span>
                            <user-avatar
                                v-model="x.item.author"
                                :show-info="true"
                                :size="28"
                                :font-size="10"
                                :infoTitle="'Updater'"
                                style="max-width: 120px"
                            ></user-avatar>
                        </div>
                    </template>
                </fv-list-view>
                <div v-show="!lock.loading" class="history-loading-mask">
                    <fv-progress-ring :loading="true" r="16" borderWidth="3" :color="color">
                    </fv-progress-ring>
                </div>
            </div>
            <fake-progress :progressCount="progressCount"></fake-progress>
        </template>
    </callout-base>
</template>

<script>
import { useTheme } from '@/stores/theme'
import { mapState } from 'pinia'

import calloutBase from './calloutBase.vue'
import timeRounder from '@/components/general/timeRounder.vue'
import userAvatar from '@/components/general/userAvatar.vue'
import fakeProgress from '@/components/general/fakeProgress.vue'

export default {
    components: {
        calloutBase,
        timeRounder,
        userAvatar,
        fakeProgress
    },
    props: {
        modelValue: {
            default: ''
        },
        uri: {
            default: ''
        },
        itemid: {
            default: ''
        },
        mobileMode: {
            default: false
        },
        mode: {
            default: 'notebook'
        },
        local: {
            default: () => {}
        }
    },
    data() {
        return {
            show: false,
            docHistory: [],
            progressCount: 0,
            lock: {
                loading: true,
                content: true
            }
        }
    },
    watch: {
        show(val) {
            if (val) {
                this.getNotebookHistory()
            }
        },
        'modelValue.id'() {
            this.docHistory = []
        }
    },
    computed: {
        ...mapState(useTheme, ['theme', 'color'])
    },
    methods: {
        async getNotebookHistory() {
            if (!this.modelValue.id) return
            if (!this.lock.loading) return
            this.lock.loading = false
            let computeRes = (res) => {
                res.data.forEach((el) => {
                    el.key = el.versionId
                    el.name = el.versionId.split('-').pop()
                    el.disabled = () => !this.lock.content
                })
                this.docHistory = res.data
            }
            if (this.mode === 'notebook')
                await this.$api.NotebookController.getDocumentContentHistoryVersionIds(
                    this.modelValue.id
                )
                    .then((res) => {
                        computeRes(res)
                    })
                    .catch((res) => {
                        console.error(res)
                        this.$barWarning(this.local(`Read History Failed`), {
                            status: 'warning'
                        })
                    })
            else
                await this.$api.AcademicController.listItemPageVersions(
                    this.uri,
                    this.itemid,
                    this.modelValue.id
                )
                    .then((res) => {
                        computeRes(res)
                    })
                    .catch((res) => {
                        console.error(res)
                        this.$barWarning(this.local(`Read History Failed`), {
                            status: 'warning'
                        })
                    })
            this.lock.loading = true
        },
        getNotebookHistoryContent(event) {
            if (!this.lock.content) return
            this.lock.content = false
            const item = event.item
            if (this.mode === 'notebook')
                this.$api.NotebookController.getDocumentContentHistoryByVersionIds(
                    this.modelValue.id,
                    item.versionId,
                    null,
                    null,
                    () => {
                        this.progressCount++
                    }
                )
                    .then((res) => {
                        this.$emit('chooseItem', res.data[0])
                        this.progressCount = 0
                        this.lock.content = true
                    })
                    .catch((res) => {
                        this.lock.content = true
                        this.progressCount = 0
                        console.error(res)
                        this.$barWarning(this.local(`Read History Failed`), {
                            status: 'warning'
                        })
                    })
            else
                this.$api.AcademicController.getItemPageContentByVersionId(
                    this.uri,
                    this.itemid,
                    this.modelValue.id,
                    item.versionId,
                    null,
                    null,
                    () => {
                        this.progressCount++
                    }
                )
                    .then((res) => {
                        this.$emit('chooseItem', res.data)
                        this.progressCount = 0
                        this.lock.content = true
                    })
                    .catch((res) => {
                        this.lock.content = true
                        this.progressCount = 0
                        console.error(res)
                        this.$barWarning(this.local(`Read History Failed`), {
                            status: 'warning'
                        })
                    })
        }
    }
}
</script>

<style lang="scss">
.fabulous-history-callout-content {
    position: relative;
    padding: 2px;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    cursor: pointer;

    &:hover {
        background: rgba(200, 200, 200, 0.3);
    }

    &:active {
        background: rgba(200, 200, 200, 0.6);
    }
}

.fabulous-history-callout {
    .fabulous-history-banner {
        position: relative;
        width: 100%;
        height: 35px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    div.main {
        position: relative;
        width: 300px;
        height: 500px;
        max-height: 100%;
        flex: 1;
        padding: 5px 0px;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: auto;

        .list-view-container {
            @include narrow-scroll-bar;
        }

        .history-list-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .history-loading-mask {
            position: absolute;
            inset: 0;
            z-index: 2;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            background: rgba(0, 0, 0, 0);
            pointer-events: none;
        }

        .list-view-custom-content {
            position: relative;
            width: 100%;
            display: flex;
            justify-content: space-between;

            .main-title {
                font-size: 10px;
                font-weight: bold;
            }

            .info-block {
                @include VcenterC;

                flex-shrink: 0;
                flex: 1;

                .max-len {
                    font-size: 12px;
                    color: rgba(90, 90, 90, 1);
                    transform: scale(0.8);
                    transform-origin: 0% 50%;
                }

                .author-block {
                    @include Vcenter;

                    font-size: 12px;
                    color: rgba(90, 90, 90, 1);
                    transform: scale(0.8);

                    i {
                        color: rgba(0, 204, 153, 1);
                    }
                }
            }
        }
    }
}

.fabulous-c-b-m-banner {
    .fabulous-history-banner {
        position: relative;
        width: 50%;
        height: 35px;
        padding: 0px 5px;
        box-sizing: border-box;
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-between;
        align-items: center;
    }
}
</style>
