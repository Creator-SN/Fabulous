<template>
    <float-window-base
        v-model="thisShow"
        :title="title ? title : local('Template Preview')"
        :theme="theme"
    >
        <template v-slot:content>
            <div
                class="w-p-block"
                style="overflow: auto;"
            >
                <fv-img
                    v-if="showBanner"
                    :src="value.banner"
                    class="preview-notebook-banner-img"
                ></fv-img>
                <p
                    v-if="showTitle"
                    class="preview-notebook-title"
                >{{value.title}}</p>
                <power-editor
                    :value="computeContent(value.content)"
                    :placeholder="local('No content here ...')"
                    :editable="false"
                    :theme="theme"
                    :editorBackground="'transparent'"
                    :editorOutSideBackground="'transparent'"
                    :mobileDisplayWidth="0"
                    style="position: relative; width: 100%; height: auto; background: transparent;"
                ></power-editor>
            </div>
        </template>
        <template v-slot:control>
            <slot
                name="control"
                :result="value"
            ></slot>
            <fv-button
                :theme="theme"
                @click="thisShow = false"
            >{{local('Cancel')}}</fv-button>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from '../window/floatWindowBase.vue';

import { mapState, mapGetters } from 'vuex';

export default {
    components: {
        floatWindowBase
    },
    props: {
        value: {
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
            thisShow: this.show
        };
    },
    watch: {
        show(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit('update:show', val);
        }
    },
    computed: {
        ...mapState({
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath']),
        computeContent() {
            return (content) => {
                if (content && content.type == 'doc') return content;
                try {
                    return JSON.parse(content);
                } catch (e) {
                    return {
                        type: 'doc',
                        content: []
                    };
                }
            };
        }
    },
    mounted() {},
    methods: {}
};
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