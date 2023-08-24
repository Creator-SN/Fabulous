<template>
    <div
        draggable="false"
        class="title-bar"
        :class="{dark: theme == 'dark'}"
        :style="{width: `calc(100% - ${leftOffset + rightOffset}px)`, margin: `0 ${rightOffset}px 0 ${leftOffset}px`, background: background}"
    >
        <div class="left-block">
            <slot name="left">
            </slot>
        </div>
        <div class="mid-block">
            <slot name="mid">
            </slot>
        </div>
        <slot name="right">
            <div class="control-block">
                <i
                    class="btn ms-Icon ms-Icon--ChromeMinimize"
                    @click="minimize"
                ></i>
                <i
                    class="btn ms-Icon"
                    :class="[isMaximized ? 'ms-Icon--ChromeRestore' : 'ms-Icon--ChromeMaximize']"
                    @click="maximize"
                ></i>
                <i
                    class="btn close ms-Icon ms-Icon--ChromeClose"
                    @click="close"
                ></i>
            </div>
        </slot>
    </div>
</template>

<style lang="scss" scoped>
.title-bar {
    position: relative;
    width: 100%;
    min-height: 32px;
    height: 32px;
    background: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
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
        padding-left: 10px;
        font-size: 13px;
    }

    .mid-block {
        font-size: 13px;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
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

<script>
import { mapState, mapGetters } from "vuex";
import * as remote from "@electron/remote";
const { ipcRenderer: ipc } = require("electron");

export default {
    props: {
        background: {
            default: "",
        },
        leftOffset: {
            default: 0,
        },
        rightOffset: {
            default: 0,
        },
        theme: {
            default: "light",
        },
    },
    data() {
        return {
            isMaximized: remote.getCurrentWindow().isMaximized(),
            timer: {
                windowStatus: {},
            },
        };
    },
    computed: {
        ...mapState({
            unsave: (state) => state.editor.unsave,
        }),
        ...mapGetters(['local', 'currentDataPath']),
    },
    mounted() {
        this.timerInit();
    },
    methods: {
        timerInit() {
            this.timer.windowStatus = setInterval(() => {
                this.isMaximized = remote.getCurrentWindow().isMaximized();
            }, 50);
        },
        minimize() {
            ipc.send("min");
        },
        maximize() {
            ipc.send("max");
        },
        close() {
            if (this.unsave) {
                this.$infoBox(
                    this.local(`Are you sure to quit without saved?`),
                    {
                        status: "warning",
                        title: this.local("Confirm"),
                        confirmTitle: this.local("Confirm"),
                        cancelTitle: this.local("Cancel"),
                        theme: this.theme,
                        confirm: () => {
                            ipc.send("close");
                        },
                        cancel: () => {},
                    }
                );
            } else ipc.send("close");
        },
    },
    beforeDestroy() {
        for (let key in this.timer) {
            clearInterval(this.timer[key]);
        }
    },
};
</script>