<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Template Preview')"
        :theme="theme"
    >
        <template v-slot:content>
            <div class="w-p-block" style="overflow: auto;">
                <power-editor
                    v-if="value && value.content"
                    :value="value.content"
                    :placeholder="local('No content here ...')"
                    :editable="false"
                    :theme="theme"
                    :editorOutSideBackground="theme == 'dark' ? 'rgba(47, 52, 55, 1)' : 'white'"
                    :mobileDisplayWidth="0"
                    style="position: relative; width: 100%; height: auto;"
                ></power-editor>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                :theme="theme"
                @click="thisShow = false"
            >{{local('Cancel')}}</fv-button>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from "../window/floatWindowBase.vue";

import { mapState, mapGetters } from "vuex";

export default {
    components: {
        floatWindowBase,
    },
    props: {
        value: {
            default: null,
        },
        show: {
            default: false,
        }
    },
    data() {
        return {
            thisShow: this.show,
        };
    },
    watch: {
        show(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit("update:show", val);
        },
    },
    computed: {
        ...mapState({
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
    },
    mounted() {},
    methods: {},
};
</script>

<style lang="scss">
</style>