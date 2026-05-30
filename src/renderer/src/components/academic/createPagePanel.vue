<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Add Page')"
        :theme="theme"
        width="400px"
        height="300px"
    >
        <template v-slot:content>
            <div class="panel-content">
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
                    @keyup.enter="confirm"
                ></fv-text-box>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(140, 148, 228, 1)"
                border-radius="6"
                :disabled="name.trim() === '' || creating"
                style="width: 100px"
                @click="confirm"
                >{{ local('Confirm') }}</fv-button
            >
            <fv-button
                :theme="theme"
                border-radius="6"
                style="width: 100px; margin-left: 5px"
                @click="cancel"
                >{{ local('Cancel') }}</fv-button
            >
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from '../window/floatWindowBase.vue'
import { page } from '@/js/data_sample.js'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { mapState, mapActions } from 'pinia'

export default {
    components: {
        floatWindowBase
    },
    props: {
        editorId: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            thisShow: false,
            name: '',
            creating: false,
            resolver: null,
            currentItem: null,
            content: ''
        }
    },
    computed: {
        ...mapState(useAppConfig, {
            local: (state) => state.local,
            editorMap: (state) => state.editor
        }),
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        }),
        currentEditor() {
            return this.editorMap?.[this.editorId] || null
        },
        history() {
            return this.currentEditor?.history || []
        },
        displayMode() {
            return this.currentEditor?.displayMode || 'note'
        }
    },
    watch: {
        thisShow(val) {
            if (!val) {
                this.name = ''
                if (!this.creating) this.finish(null)
            }
        }
    },
    methods: {
        ...mapActions(useAppConfig, {
            reviseEditor: 'reviseEditor'
        }),
        open(item, content) {
            this.currentItem = item
            this.content = content
            this.name = ''
            this.creating = false
            this.thisShow = true
            return new Promise((resolve) => {
                this.resolver = resolve
            })
        },
        finish(result) {
            if (!this.resolver) return
            const resolve = this.resolver
            this.resolver = null
            resolve(result)
        },
        cancel() {
            this.thisShow = false
            this.finish(null)
        },
        async confirm() {
            if (!this.currentItem || this.name.trim() === '' || this.creating) return
            this.creating = true
            let _page = JSON.parse(JSON.stringify(page))
            _page.id = this.$Guid()
            _page.name = this.name.trim()
            _page.emoji = '📑'
            _page.createDate = this.$SDate.DateToString(new Date())
            let res = await this.$api.AcademicController.createItemPage(
                this.currentDataPath,
                this.currentItem.id,
                {
                    ..._page,
                    content: this.content
                }
            ).catch((err) => err)
            this.creating = false
            if (!res || res.status !== 'success') {
                this.$barWarning(res?.message || this.local('Create Page Failed'), {
                    status: 'error'
                })
                return
            }
            const nextTarget = res.data
            const nextItem = {
                ...this.currentItem,
                pages: [...(this.currentItem.pages || []), nextTarget]
            }
            this.reviseEditor({
                id: this.editorId,
                dsId: this.currentDataPath,
                item: nextItem,
                target: nextTarget,
                scrollTop: 0
            })
            let path = `${this.currentDataPath}/${nextItem.id}/${nextTarget.id}`
            let url = `/academic/${encodeURI(path.replace(/\//g, '\\'))}`
            this.$Go(url)
            this.thisShow = false
            this.finish(nextTarget)
        }
    }
}
</script>

<style lang="scss" scoped>
.panel-content {
    width: 100%;
    min-height: 120px;
    display: flex;
    flex-direction: column;
}

.w-title {
    margin: 0 5px;
    font-size: 12px;
    font-weight: bold;
}
</style>
