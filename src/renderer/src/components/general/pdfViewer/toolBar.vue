<template>
    <transition name="move-top-to-bottom">
        <div class="fabulous-pdf-tool-bar">
            <div class="fabulous-pdf-tool-bar-wrapper">
                <div class="left-block">
                    <fv-text-box
                        v-model="thisCurrentPageStr"
                        :theme="theme"
                        fontSize="12"
                        :border-radius="8"
                        style="width: 40px; height: 30px; text-align: center"
                        @keyup.enter="$emit('to-page', thisCurrentPageStr)"
                    ></fv-text-box>
                    <p style="margin-left: 5px; font-size: 12px">/ {{ totalPages }}</p>
                </div>
                <div class="right-block">
                    <fv-button
                        :theme="theme"
                        class="control-btn"
                        :background="
                            theme === 'dark' ? 'rgba(36, 36, 36, 1)' : 'rgba(247, 247, 247, 1)'
                        "
                        :title="local(`Scale Down`)"
                        :border-radius="8"
                        @click="$emit('scale-down')"
                    >
                        <i class="ms-Icon ms-Icon--Remove"></i>
                    </fv-button>
                    <fv-button
                        :theme="theme"
                        class="control-btn"
                        :background="
                            theme === 'dark' ? 'rgba(36, 36, 36, 1)' : 'rgba(247, 247, 247, 1)'
                        "
                        :title="local(`Scale Up`)"
                        :border-radius="8"
                        @click="$emit('scale-up')"
                    >
                        <i class="ms-Icon ms-Icon--Add"></i>
                    </fv-button>
                    <fv-button
                        :theme="theme"
                        class="control-btn"
                        :background="
                            theme === 'dark' ? 'rgba(36, 36, 36, 1)' : 'rgba(247, 247, 247, 1)'
                        "
                        :title="local(`Open with Browser`)"
                        :border-radius="8"
                        @click="$emit('open-with-browser')"
                    >
                        <i class="ms-Icon ms-Icon--Globe"></i>
                    </fv-button>
                    <fv-button
                        :theme="show.translate ? 'dark' : theme"
                        class="control-btn"
                        :background="
                            show.translate
                                ? 'rgba(140, 148, 228, 1)'
                                : theme === 'dark'
                                  ? 'rgba(36, 36, 36, 1)'
                                  : 'rgba(247, 247, 247, 1)'
                        "
                        :title="local(`Toggle Translator`)"
                        :border-radius="8"
                        @click="$emit('toggle-translator')"
                    >
                        <i class="ms-Icon ms-Icon--LocaleLanguage"></i>
                    </fv-button>
                    <slot name="tool-extra" :control-btn-class="'control-btn'"></slot>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
const emits = defineEmits([
    'to-page',
    'scale-down',
    'scale-up',
    'open-with-browser',
    'toggle-translator',
    'update:currentPageStr'
])
</script>

<script>
import { useAppConfig } from '@/stores/appConfig'
import { useTheme } from '@/stores/theme'
import { mapState } from 'pinia'

export default {
    props: {
        currentPageStr: {
            default: '',
            type: String
        },
        totalPages: {
            default: 0,
            type: Number
        },
        show: {
            default: () => ({}),
            type: Object
        }
    },
    data() {
        return {
            thisCurrentPageStr: this.currentPageStr
        }
    },
    watch: {
        currentPageStr(newVal, oldVal) {
            this.thisCurrentPageStr = newVal
        },
        thisCurrentPageStr(newVal, oldVal) {
            this.$emit('update:currentPageStr', newVal)
        }
    },
    computed: {
        ...mapState(useAppConfig, ['local']),
        ...mapState(useTheme, ['theme'])
    },
    methods: {}
}
</script>

<style lang="scss">
.fabulous-pdf-tool-bar {
    position: absolute;
    left: 0px;
    top: 40px;
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    transition: all 0.3s;
    display: flex;
    justify-content: center;
    z-index: 3;

    .fabulous-pdf-tool-bar-wrapper {
        @include Vend;

        position: relative;
        width: min(350px, 100%);
        height: 100%;
        padding: 5px 15px;
        background: rgba(247, 247, 247, 0.6);
        border: rgba(120, 120, 120, 0.2) solid thin;
        border-radius: 12px;
        box-sizing: border-box;
        box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);

        .left-block {
            @include Vcenter;

            position: relative;
            width: 100%;
            height: 30px;
            flex: 1;
        }

        .right-block {
            @include HendVend;

            position: relative;
            width: 100%;
            height: 100%;
            flex: 1;
            gap: 2px;
        }

        .control-btn {
            width: 30px;
            height: 30px;
        }
    }
}
</style>
