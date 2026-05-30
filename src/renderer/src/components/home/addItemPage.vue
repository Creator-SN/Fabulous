<template>
    <float-window-base v-model="thisShow" :title="local('Add Page')" :theme="theme">
        <template v-slot:content>
            <div class="p-col">
                <p class="w-title">{{ local('Page Name') }}</p>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('Input page name...')"
                    :theme="theme"
                    :font-size="13"
                    :font-weight="'bold'"
                    underline
                    :border-color="'rgba(123, 139, 209, 0.3)'"
                    :focus-border-color="'rgba(123, 139, 209, 1)'"
                    :border-width="2"
                    :is-box-shadow="true"
                    style="
                        width: calc(100% - 10px);
                        height: 40px;
                        margin-left: 5px;
                        margin-top: 15px;
                    "
                    @keyup.enter="add"
                ></fv-text-box>
            </div>
            <div class="p-col full">
                <p class="w-title">{{ local('From Template') }}</p>
                <div style="width: 100%; height: 300px; flex: 1; overflow: auto">
                    <template-grid :model-value="templates" @choose-items="currentChoosen = $event">
                    </template-grid>
                </div>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(140, 148, 228, 1)"
                :disabled="name === '' || currentChoosen.length > 1"
                @click="add"
                >{{ local('Confirm') }}</fv-button
            >
            <fv-button :theme="theme" style="margin-left: 5px" @click="thisShow = false">{{
                local('Cancel')
            }}</fv-button>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from '../window/floatWindowBase.vue'
import templateGrid from '@/components/templates/templateGrid.vue'
import { page } from '@/js/data_sample.js'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { mapState, mapActions } from 'pinia'

export default {
    components: {
        floatWindowBase,
        templateGrid
    },
    props: {
        editorId: {
            type: String,
            default: 'academic'
        },
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
        }
    },
    watch: {
        show(val) {
            this.thisShow = val
            if (val) {
                this.getTemplates()
            }
        },
        thisShow(val) {
            this.$emit('update:show', val)
            this.name = ''
        }
    },
    computed: {
        ...mapState(useDataStore, {
            data_path: (state) => state.data_path,
            data_index: (state) => state.configState.data_index
        }),
        ...mapState(useAppConfig, ['local']),
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        })
    },
    mounted() {},
    methods: {
        ...mapActions(useAppConfig, {
            reviseEditor: 'reviseEditor'
        }),
        async add() {
            if (!this.item || this.name === '' || this.currentChoosen.length > 1) return
            let templateContent = JSON.stringify({
                type: 'doc',
                content: []
            })
            if (this.currentChoosen.length === 1) {
                templateContent = this.currentChoosen[0].content
            }
            let _page = JSON.parse(JSON.stringify(page))
            _page.id = this.$Guid()
            _page.name = this.name
            _page.emoji = '📑'
            _page.createDate = this.$SDate.DateToString(new Date())
            let res = await this.$api.AcademicController.createItemPage(
                this.currentDataPath,
                this.item.id,
                { ..._page, content: templateContent }
            )
            if (res.status === 'success') {
                this.item.pages.push(res.data)
                this.thisShow = false
            } else {
                this.$barWarning(res.message, {
                    status: 'error'
                })
            }
        },
        async getTemplates() {
            let res = await this.$api.AcademicController.getTemplateInfo(this.currentDataPath)
            if (res.status === 'success') {
                this.templates = res.data
            } else {
                this.$barWarning(res.message, {
                    status: 'error'
                })
            }
        },
        openEditor(template) {
            this.reviseEditor({
                id: this.editorId,
                dsId: this.currentDataPath,
                type: 'template',
                item: {
                    id: this.currentDataPath,
                    name: this.local('Template'),
                    pages: this.templates
                },
                target: template,
                scrollTop: 0,
                displayMode: 'note',
                cache: true
            })
            let path = `${this.currentDataPath}/${template.id}`
            let url = `/academic/template/${encodeURI(path.replace(/\//g, '\\'))}`
            this.$Go(url)
        }
    }
}
</script>

<style lang="scss"></style>
