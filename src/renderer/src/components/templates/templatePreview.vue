<template>
    <float-window-base
        v-model="thisShow"
        :title="title ? title : local('Template Preview')"
        :theme="theme"
    >
        <template v-slot:content>
            <div class="w-p-block" style="overflow: auto">
                <fv-img
                    v-if="showBanner"
                    :src="modelValue.banner"
                    class="preview-notebook-banner-img"
                ></fv-img>
                <p v-if="showTitle" class="preview-notebook-title">{{ modelValue.title }}</p>
                <power-editor
                    :model-value="computedContent"
                    :placeholder="local('No content here ...')"
                    :editable="false"
                    :theme="theme"
                    :extensions="customExtensions"
                    :editorBackground="'transparent'"
                    :editorOutSideBackground="'transparent'"
                    :mobileDisplayWidth="0"
                    style="position: relative; width: 100%; height: auto; background: transparent"
                ></power-editor>
            </div>
        </template>
        <template v-slot:control>
            <slot name="control" :result="modelValue"></slot>
            <fv-button :theme="theme" border-radius="6" @click="thisShow = false">{{
                local('Cancel')
            }}</fv-button>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from '../window/floatWindowBase.vue'
import pdfNote from '@/components/general/editorCustom/extension/pdfNote.js'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { mapState } from 'pinia'

export default {
    components: {
        floatWindowBase
    },
    props: {
        modelValue: {
            default: null
        },
        title: {
            default: ''
        },
        showBanner: {
            default: false
        },
        showTitle: {
            default: false
        },
        show: {
            default: false
        }
    },
    data() {
        return {
            thisShow: this.show,
            customExtensions: [pdfNote],
            computedContent: {
                type: 'doc',
                content: []
            }
        }
    },
    watch: {
        show(val) {
            this.thisShow = val
        },
        thisShow(val) {
            this.$emit('update:show', val)
        },
        'modelValue.content'() {
            this.computedContent = this.computeContent(this.modelValue.content)
        }
    },
    computed: {
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        ...mapState(useAppConfig, ['local']),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        })
    },
    mounted() {
        this.computedContent = this.computeContent(this.modelValue.content)
    },
    methods: {
        computeContent(content) {
            if (content && content.type == 'doc') return content
            try {
                return JSON.parse(content)
            } catch (e) {
                return {
                    type: 'doc',
                    content: []
                }
            }
        }
    }
}
</script>

<style lang="scss">
.preview-notebook-banner-img {
    position: relative;
    width: 100%;
    height: auto;
    flex-shrink: 0;
    border-radius: 6px;
    transition: all 0.3s;
    z-index: 2;
}

.preview-notebook-title {
    position: relative;
    width: 100%;
    padding: 15px;
    font-size: 24px;
    font-weight: 600;
    box-sizing: border-box;
}
</style>
