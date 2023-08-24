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
                style="width: 100%; height: 100%;"
                @chooseItem="$emit('chooseItem', $event)"
            >
            </fv-list-view>
        </template>
    </callout-base>
</template>

<script>
import calloutBase from './calloutBase.vue';

export default {
    components: {
        calloutBase
    },
    props: {
        value: {
            default: ''
        },
        mobileMode: {
            default: false
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
            docHistory: []
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
            this.$api.NotebookController.getDocumentContentHistory(
                this.value.id,
                10000
            )
                .then((res) => {
                    res.data.forEach((el) => {
                        el.key = el.versionId;
                        el.name = el.versionId.split('-').pop();
                    });
                    this.docHistory = res.data;
                })
                .catch((res) => {
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

        .fabulous-history-list {
            position: relative;
            width: 100%;
            height: auto;

            .title {
                font-size: 12px;
            }

            .fabulous-history-group {
                position: relative;
                width: 100%;
                height: auto;
                display: flex;
                flex-wrap: wrap;

                .emoji-item {
                    position: relative;
                    width: 35px;
                    height: 35px;
                    padding: 1px;
                    border-radius: 3px;
                    font-size: 20px;
                    font-style: normal;
                    box-sizing: border-box;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    user-select: none;
                    cursor: default;

                    &:hover {
                        background: rgba(200, 200, 200, 0.6);
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
