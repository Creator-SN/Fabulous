<template>
    <callout-base
        :show.sync="show"
        :mobileMode="mobileMode"
        :title="'Emoji'"
        :theme="theme"
        :popperClass="['fabulous-history-callout']"
    >
        <template v-slot:trigger>
            <fv-button
                :theme="theme"
                :borderRadius="30"
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
            <fv-list-view
                :value="docHistory"
                :theme="theme"
                :row-height="60"
                :showSlider="true"
                :header-foreground="'rgba(140, 148, 228, 1)'"
                :choosen-background="theme === 'dark' ? '#333' : '#fff'"
                style="width: 100%; height: 100%;"
                @chooseItem="getNotebookHistoryContent($event)"
            >
                <template v-slot:listItem="x">
                    <div class="list-view-custom-content">
                        <p class="main-title">{{x.item.name}}</p>
                        <span class="info-block">
                            <time-rounder
                                :value="new Date(x.item.createDate)"
                                icon="DevUpdate"
                                class="max-len"
                                style="width: auto;"
                            ></time-rounder>
                            <span class="author-block">
                                <i class="ms-Icon ms-Icon--StatusCircleInner"></i>
                                <p>{{x.item.email}}</p>
                            </span>
                        </span>
                    </div>
                </template>
            </fv-list-view>
            <fake-progress :progressCount="progressCount"></fake-progress>
        </template>
    </callout-base>
</template>

<script>
import calloutBase from './calloutBase.vue';
import timeRounder from '@/components/general/timeRounder.vue';
import fakeProgress from '@/components/general/fakeProgress.vue';

export default {
    components: {
        calloutBase,
        timeRounder,
        fakeProgress
    },
    props: {
        value: {
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
        },
        theme: {
            default: 'light'
        }
    },
    data() {
        return {
            show: false,
            docHistory: [],
            progressCount: 0,
            lock: {
                content: true
            }
        };
    },
    watch: {
        show(val) {
            if (val) {
                this.getNotebookHistory();
            }
        }
    },
    methods: {
        getNotebookHistory() {
            if (!this.value.id) return;
            let computeRes = (res) => {
                res.data.forEach((el) => {
                    el.key = el.versionId;
                    el.name = el.versionId.split('-').pop();
                    el.disabled = () => !this.lock.content;
                });
                this.docHistory = res.data;
            };
            if (this.mode === 'notebook')
                this.$api.NotebookController.getDocumentContentHistoryVersionIds(
                    this.value.id
                )
                    .then((res) => {
                        computeRes(res);
                    })
                    .catch((res) => {
                        console.error(res);
                        this.$barWarning(this.local(`Read History Failed`), {
                            status: 'warning'
                        });
                    });
            else
                this.$api.AcademicController.listItemPageVersions(
                    this.uri,
                    this.itemid,
                    this.value.id
                )
                    .then((res) => {
                        computeRes(res);
                    })
                    .catch((res) => {
                        console.error(res);
                        this.$barWarning(this.local(`Read History Failed`), {
                            status: 'warning'
                        });
                    });
        },
        getNotebookHistoryContent(event) {
            if (!this.lock.content) return;
            this.lock.content = false;
            const item = event.item;
            if (this.mode === 'notebook')
                this.$api.NotebookController.getDocumentContentHistoryByVersionIds(
                    this.value.id,
                    item.versionId,
                    null,
                    null,
                    () => {
                        this.progressCount++;
                    }
                )
                    .then((res) => {
                        this.$emit('chooseItem', res.data[0]);
                        this.progressCount = 0;
                        this.lock.content = true;
                    })
                    .catch((res) => {
                        this.lock.content = true;
                        this.progressCount = 0;
                        console.error(res);
                        this.$barWarning(this.local(`Read History Failed`), {
                            status: 'warning'
                        });
                    });
            else
                this.$api.NotebookController.getDocumentContentHistoryByVersionIds(
                    this.value.id,
                    item.versionId,
                    null,
                    null,
                    () => {
                        this.progressCount++;
                    }
                )
                    .then((res) => {
                        this.$emit('chooseItem', res.data[0]);
                        this.progressCount = 0;
                        this.lock.content = true;
                    })
                    .catch((res) => {
                        this.lock.content = true;
                        this.progressCount = 0;
                        console.error(res);
                        this.$barWarning(this.local(`Read History Failed`), {
                            status: 'warning'
                        });
                    });
        }
    }
};
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

        .list-view-custom-content {
            position: relative;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;

            .main-title {
                font-size: 13.8px;
                font-weight: bold;
            }

            .info-block {
                @include HbetweenVcenter;

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
