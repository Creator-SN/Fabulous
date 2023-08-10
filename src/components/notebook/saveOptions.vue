<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Save As')"
        height="50%"
        :isFooter="false"
        :theme="theme"
    >
        <template v-slot:content>
            <div
                class="w-p-block"
                style="overflow: auto;"
            >
                <p class="w-title">{{local('Save Options')}}</p>
                <fv-button
                    theme="dark"
                    v-for="(item, index) in options"
                    :key="index"
                    background="transparent"
                    :foreground="theme === 'dark' ? 'white' : 'black'"
                    style="width: calc(100% - 5px); height: 60px; margin: 5px 0px; flex-shrink: 0;"
                    @click="saveProp(item)"
                >
                    <img
                        :src="item.img"
                        alt=""
                        style="width: 30px; margin: 0px 15px;"
                    >
                    <p style="flex: 1;">{{item.name}}</p>
                </fv-button>
            </div>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from '../window/floatWindowBase.vue';
import { mapState, mapGetters } from 'vuex';

import notebookImg from '@/assets/nav/note.svg';
import markdownImg from '@/assets/nav/markdown.svg';
import jsonImg from '@/assets/nav/json.svg';
import htmlImg from '@/assets/nav/html.svg';

export default {
    components: {
        floatWindowBase
    },
    props: {
        show: {
            default: false
        }
    },
    data() {
        return {
            thisShow: this.show,
            options: [
                {
                    name: 'FAB Notebook',
                    img: notebookImg,
                    prop: 'fbn'
                },
                {
                    name: 'Markdown',
                    img: markdownImg,
                    prop: 'md'
                },
                { name: 'Json', img: jsonImg, prop: 'json' },
                { name: 'HTML', img: htmlImg, prop: 'html' }
            ]
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
        ...mapGetters(['local', 'currentDataPath'])
    },
    methods: {
        saveProp(item) {
            this.$emit('save', item.prop);
            this.thisShow = false;
        }
    }
};
</script>

<style lang="scss">
</style>