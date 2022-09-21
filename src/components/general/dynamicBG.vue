<template>
    <div
        class="dynamic-bg-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div
            v-show="!disabled"
            class="dynamic-bg-block"
            :style="{left: computedLeft, top: computedTop, width: computedWidth, height: computedHeight, background: `url(${img.dynamicBG}) no-repeat`, 'background-size': 'cover', opacity: theme === 'dark' ? 1 : 0.7}"
        >

        </div>
    </div>
</template>

<script>
import dynamicBG from "@/assets/window/dynamicBG.svg";

const { ipcRenderer: ipc } = require("electron");

export default {
    props: {
        disabled: {
            default: false,
        },
        theme: {
            default: "light",
        },
    },
    data() {
        return {
            img: {
                dynamicBG,
            },
            position: {
                left: 0,
                top: 0,
                totalScreenWidth: 1,
                totalScreenHeight: 1,
            },
        };
    },
    computed: {
        computedWidth() {
            return `${this.position.totalScreenWidth}px`;
        },
        computedHeight() {
            return `${this.position.totalScreenHeight}px`;
        },
        computedLeft() {
            return `-${this.position.left}px`;
        },
        computedTop() {
            return ` -${this.position.top}px`;
        },
    },
    mounted() {
        this.positionInit();
    },
    methods: {
        positionInit() {
            ipc.send("move");

            ipc.on("move", (event, arg) => {
                window.requestAnimationFrame(() => {
                    this.position.left = arg.left;
                    this.position.top = arg.top;
                    this.position.totalScreenWidth = arg.totalScreenWidth;
                    this.position.totalScreenHeight = arg.totalScreenHeight;
                });
            });
        },
    },
};
</script>

<style lang="scss">
.dynamic-bg-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background: rgba(245, 245, 245, 1);
    background-size: cover;
    overflow: hidden;

    &.dark {
        background: rgba(36, 36, 36, 1);
    }

    .dynamic-bg-block {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
}
</style>