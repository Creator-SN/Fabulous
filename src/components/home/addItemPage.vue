<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Add Page')"
        :theme="theme"
    >
        <template v-slot:content>
            <div class="p-col">
                <p class="w-title">{{local('Page Name')}}</p>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('Input page name...')"
                    :theme="theme"
                    :font-size="18"
                    :font-weight="'bold'"
                    underline
                    :border-color="'rgba(123, 139, 209, 0.3)'"
                    :focus-border-color="'rgba(123, 139, 209, 1)'"
                    :border-width="2"
                    :is-box-shadow="true"
                    style="width: 100%; height: 60px; margin-top: 15px;"
                    @keyup.enter="add"
                ></fv-text-box>
            </div>
            <div class="p-col full">
                <p class="w-title">{{local('From Template')}}</p>
                <div style="width: 100%; height: 300px; flex: 1; overflow: auto;">
                    <template-grid
                        :value="templates"
                        @choose-items="currentChoosen = $event"
                    >
                    </template-grid>
                </div>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(0, 98, 158, 1)"
                :disabled="name === '' || currentChoosen.length > 1"
                @click="add"
            >{{local('Confirm')}}</fv-button>
            <fv-button
                :theme="theme"
                style="margin-left: 5px;"
                @click="thisShow = false"
            >{{local('Cancel')}}</fv-button>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from '../window/floatWindowBase.vue';
import templateGrid from '@/components/templates/templateGrid.vue';
import { page } from '@/js/data_sample.js';
import { mapMutations, mapState, mapGetters } from 'vuex';

export default {
    components: {
        floatWindowBase,
        templateGrid
    },
    props: {
        show: {
            default: false
        },
        item: {
            default: null
        }
    },
    data() {
        return {
            thisShow: this.show,
            name: '',
            currentChoosen: [],
            templates: []
        };
    },
    watch: {
        show(val) {
            this.thisShow = val;
            if (val) {
                this.getTemplates();
            }
        },
        thisShow(val) {
            this.$emit('update:show', val);
            this.name = '';
        }
    },
    computed: {
        ...mapState({
            data_index: (state) => state.config.data_index,
            data_path: (state) => state.config.data_path,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath'])
    },
    mounted() {},
    methods: {
        ...mapMutations({
            reviseEditor: 'reviseEditor',
            toggleEditor: 'toggleEditor'
        }),
        async add() {
            if (
                !this.item ||
                this.name === '' ||
                this.currentChoosen.length > 1
            )
                return;
            let templateContent = JSON.stringify({
                type: 'doc',
                content: []
            });
            if (this.currentChoosen.length === 1) {
                templateContent = this.currentChoosen[0].content;
            }
            let _page = JSON.parse(JSON.stringify(page));
            _page.id = this.$Guid();
            _page.name = this.name;
            _page.emoji = '📑';
            _page.createDate = this.$SDate.DateToString(new Date());
            let res = await this.$auto.AcademicController.createItemPage(
                this.currentDataPath,
                this.item.id,
                { ..._page, content: templateContent }
            );
            if (res.status === 'success') {
                this.item.pages.push(res.data);
                this.thisShow = false;
            } else {
                this.$barWarning(res.message, {
                    status: 'error'
                });
            }
        },
        async getTemplates() {
            let res = await this.$auto.AcademicController.getTemplateInfo(
                this.currentDataPath
            );
            if (res.status === 'success') {
                this.templates = res.data;
            } else {
                this.$barWarning(res.message, {
                    status: 'error'
                });
            }
        },
        openEditor(template) {
            this.reviseEditor({
                type: 'template',
                target: template
            });
            this.toggleEditor(true);
        }
    }
};
</script>

<style lang="scss">
</style>