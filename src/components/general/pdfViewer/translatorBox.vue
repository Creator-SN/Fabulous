<template>
    <fv-web-window
        v-model="thisValue"
        :title="local('Translator')"
        class="fabulous-pdf-translation-panel"
        :class="[{dark: theme === 'dark'}]"
        style="width: 350px; height: 500px; background: rgba(239, 239, 239, 0.6); border: rgba(120, 120, 120, 0.1) solid thin;"
    >
        <fv-text-field
            v-model="translateObj.selection"
            :theme="theme"
            :placeholder="local(`Edit Text Here and Re-Translate by Press (Ctrl + Enter)`)"
            :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : 'rgba(255, 255, 255, 1)'"
            class="text-field"
            fontSize="13"
            :border-radius="6"
            style="margin-top: 50px;"
            @keyup="ctrlEnterTranslate"
        ></fv-text-field>
        <fv-text-field
            v-show="translateObj.selection !== '' && translateObj.text !== ''"
            v-model="translateObj.text"
            :theme="theme"
            class="text-field"
            :background="theme === 'dark' ? 'rgba(36, 36, 36, 0.6)' : 'rgba(255, 255, 255, 0.3)'"
            fontSize="13"
            readonly
            :border-radius="6"
        ></fv-text-field>
        <fv-shimmer
            v-if="translateObj.selection !== '' && translateObj.text === ''"
            :theme="theme"
            style="position: relative; width: 100%; height: 100%; flex: 1;"
        >
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
                <div
                    v-for="(item, index) in 2"
                    :key="index"
                    style="margin-top: 5px; display: flex; align-items: center;"
                >
                    <div
                        class="sample"
                        style="width: 80%; margin: 5px;"
                    ></div>
                    <div
                        class="sample"
                        style="width: 80%; flex: 1; margin: 5px;"
                    ></div>
                </div>
                <div
                    v-for="(item, index) in 2"
                    :key="`s2: ${index}`"
                    style="margin-top: 5px; display: flex; align-items: center;"
                >
                    <div
                        class="sample"
                        style="width: 80%; height: 15px; margin: 5px;"
                        :style="{width: `${100 - index * 10}%`}"
                    ></div>
                </div>
            </div>
        </fv-shimmer>
    </fv-web-window>
</template>

<script>
export default {
    props: {
        value: {
            default: false,
        },
        local: {
            type: Function,
            default: () => {},
        },
        translateObj: {
            type: Object,
            default: () => {},
        },
        ctrlEnterTranslate: {
            type: Function,
            default: () => {},
        },
        theme: {
            type: String,
            default: "light",
        },
    },
    data() {
        return {
            thisValue: this.value,
        };
    },
    watch: {
        value() {
            this.thisValue = this.value;
        },
        thisValue() {
            this.$emit("input", this.thisValue);
        },
    },
    mounted() {
        this.globalAppendInit();
    },
    methods: {
        globalAppendInit() {
            this.$nextTick(() => {
                const body = document.querySelector("body");
                if (body.append) {
                    body.append(this.$el);
                } else {
                    body.appendChild(this.$el);
                }
            });
        },
    },
};
</script>

<style lang="scss">
.fabulous-pdf-translation-panel {
    @include VcenterC;

    width: 350px;
    height: 500px;
    padding: 5px 12px;
    background: rgba(239, 239, 239, 0.6);
    border: rgba(120, 120, 120, 0.1) solid thin;
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    z-index: 10;

    &.dark {
        .fabulous-pdf-translation-panel {
            background: rgba(50, 50, 50, 0.8);
        }
    }

    .control-banner {
        @include HendVcenter;

        position: relative;
        width: 100%;
        height: 50px;

        .control-btn {
            width: 30px;
            height: 30px;
            margin: 5px;
        }
    }

    .text-field {
        width: 100%;
        height: 100%;
        margin: 5px 0px;
        flex: 1;
        transition: all 0.3s;

        textarea {
            padding: 8px;
            line-height: 2;
        }
    }
}
</style>