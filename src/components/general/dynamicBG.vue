<template>
    <div
        class="dynamic-bg-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div
            v-show="!disabled"
            class="dynamic-bg-block"
            :style="{left: computedLeft, top: computedTop, width: computedWidth, height: computedHeight, opacity: theme === 'dark' ? 1 : 0.8}"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:svgjs="http://svgjs.dev/svgjs"
                :viewBox="`0 0 ${position.totalScreenWidth} ${position.totalScreenHeight}`"
                style="width: 100%; height: 100%;"
                opacity="0.67"
            >
                <defs>
                    <filter
                        id="bbblurry-filter"
                        x="-100%"
                        y="-100%"
                        width="400%"
                        height="400%"
                        filterUnits="objectBoundingBox"
                        primitiveUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB"
                    >
                        <feGaussianBlur
                            :stdDeviation="58 / 800 * position.totalScreenWidth"
                            x="0%"
                            y="0%"
                            width="100%"
                            height="100%"
                            in="SourceGraphic"
                            edgeMode="none"
                            result="blur"
                        ></feGaussianBlur>
                    </filter>
                </defs>
                <g filter="url(#bbblurry-filter)">
                    <ellipse
                        :rx="228.5 / 800 * position.totalScreenWidth"
                        :ry="233 / 450 * position.totalScreenHeight"
                        :cx="220.5862579345703 / 800 * position.totalScreenWidth"
                        :cy="36.34315490722656 / 450 * position.totalScreenHeight"
                        :fill="computedColor(0)"
                    >
                    </ellipse>
                    <ellipse
                        :rx="228.5 / 800 * position.totalScreenWidth"
                        :ry="233 / 450 * position.totalScreenHeight"
                        :cx="577.9253872958097 / 800 * position.totalScreenWidth"
                        :cy="59.557355013760656 / 450 * position.totalScreenHeight"
                        :fill="computedColor(1)"
                    >
                    </ellipse>
                    <ellipse
                        :rx="228.5 / 800 * position.totalScreenWidth"
                        :ry="233 / 450 * position.totalScreenHeight"
                        :cx="260.5261757590555 / 800 * position.totalScreenWidth"
                        :cy="352.03034834428263 / 450 * position.totalScreenHeight"
                        :fill="computedColor(2)"
                    >
                    </ellipse>
                    <ellipse
                        :rx="228.5 / 800 * position.totalScreenWidth"
                        :ry="233 / 450 * position.totalScreenHeight"
                        :cx="595.5195257013493 / 800 * position.totalScreenWidth"
                        :cy="330.0561856356534 / 450 * position.totalScreenHeight"
                        :fill="computedColor(3)"
                    ></ellipse>
                </g>
            </svg>
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
        themeColorList: {
            default: () => [],
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
            defaultColorList: [
                "hsla(38, 99%, 67%, 0.76)",
                "hsla(327, 73%, 52%, 0.85)",
                "hsla(203, 100%, 57%, 0.76)",
                "hsl(208, 100%, 86%)",
            ],
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
        computedColor() {
            return (index) => {
                if (this.themeColorList[index]) {
                    return `rgba(${this.themeColorList[index].color.join(
                        ", "
                    )}, 1)`;
                } else {
                    return this.defaultColorList[index];
                }
            };
        },
    },
    mounted() {
        this.positionInit();
    },
    methods: {
        positionInit() {
            this.sendMove();

            window.removeEventListener("resize", this.sendMove);
            window.addEventListener("resize", this.sendMove);

            ipc.on("move", (event, arg) => {
                window.requestAnimationFrame(() => {
                    this.position.left = arg.left;
                    this.position.top = arg.top;
                    this.position.totalScreenWidth = arg.totalScreenWidth;
                    this.position.totalScreenHeight = arg.totalScreenHeight;
                });
            });
        },
        sendMove() {
            ipc.send("move");
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