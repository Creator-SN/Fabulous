<template>
    <div class="notebook-wrapper" :class="[{ dark: theme === 'dark' }]">
        <editor-container
            editor-id="local"
            :refreshContentTool="refreshContentTool"
            :openEditorTool="openEditorTool"
            :saveConfirmTool="saveConfirmTool"
            :openFileTool="openFileTool"
            :breadcrumbTool="breadcrumbTool"
            :backTool="backTool"
            :isRemote="false"
            :mentionItemAttr="disableMentionItemAttr"
            ref="editor_container"
            @container-scroll="handleContainerScroll"
        ></editor-container>
        <loading v-show="loading" style="z-index: 2">
            <div class="central-box">
                <fv-progress-ring
                    :loading="true"
                    r="10"
                    border-width="2"
                    :color="color"
                    :background="theme === 'dark' ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 0.6)'"
                ></fv-progress-ring>
                <p class="title">{{ local('Initializing...') }}</p>
            </div>
        </loading>
    </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useTheme } from '@/stores/theme'
import { useAppConfig } from '@/stores/appConfig'
import { useLocalNotebookConfig } from '@/stores/local_notebook'
import loading from '@/components/general/loading.vue'
import editorContainer from '@/components/general/editorContainer/index.vue'

export default {
    name: 'LocalNotebook',
    components: {
        loading,
        editorContainer
    },
    data() {
        return {
            filePath: '',
            tmpScrollTop: 0,
            docInfo: {
                versionId: 0
            },
            loading: false
        }
    },
    computed: {
        ...mapState(useTheme, ['theme', 'color']),
        ...mapState(useAppConfig, {
            local: (state) => state.local,
            editorMap: (state) => state.editor
        }),
        currentEditor() {
            return this.editorMap?.local || null
        },
        item() {
            return this.currentEditor?.item || null
        },
        target() {
            return this.currentEditor?.target || null
        },
        history() {
            return this.currentEditor?.history || []
        },
        itemType() {
            return this.currentEditor?.type || null
        },
        activeFilePath() {
            const targetPath = this.target?.filePath || ''
            if (targetPath) return targetPath.replace(/\\/g, '/')
            return this.filePath
        },
        isMarkdownFile() {
            return this.activeFilePath.toLowerCase().endsWith('.md')
        },
        disableMentionItemAttr() {
            return {
                mentionList: () => [],
                filterFunc: async () => {
                    return []
                },
                chooseItemCallback: () => {},
                mentionClickCallback: () => {},
                headerForeground: () => 'rgba(149, 141, 241, 1)',
                placeholder: () => this.local('Mention Disabled')
            }
        }
    },
    watch: {
        $route() {
            if (this.$route.name !== 'LocalNotebook') return
            this.refreshPathParams()
            this.initEditorBinding()
        },
        target() {
            this.refreshPathParams()
        }
    },
    mounted() {
        this.refreshPathParams()
        this.initEditorBinding()
    },
    methods: {
        ...mapActions(useAppConfig, {
            reviseEditor: 'reviseEditor',
            reviseEditorContent: 'reviseEditorContent'
        }),
        ...mapActions(useLocalNotebookConfig, {
            getNotebookDocument: 'getDocument',
            updateNotebookDocument: 'updateDocument',
            listLocalDirectoryChildren: 'listLocalDirectoryChildren'
        }),
        refreshPathParams() {
            let filePath = decodeURI(this.$route.params.path || '')
            this.filePath = filePath ? filePath.replace(/\\/g, '/') : ''
        },
        async initEditorBinding() {
            const currentFilePath = this.activeFilePath
            if (!currentFilePath) return
            this.loading = true
            let parentPath = currentFilePath.substring(0, currentFilePath.lastIndexOf('/'))
            let fileName = currentFilePath.split('/').pop()
            let res = await this.listLocalDirectoryChildren(parentPath)
            let pages = res?.data || []
            let target = pages.find((item) => item.filePath === currentFilePath)
            if (!target) {
                target = {
                    id: encodeURIComponent(currentFilePath),
                    name: fileName,
                    filePath: currentFilePath,
                    isFile: true,
                    isDir: false
                }
            }
            this.reviseEditor({
                id: 'local',
                dsId: 'local',
                type: 'notebook',
                item: {
                    id: encodeURIComponent(parentPath),
                    name: parentPath.split('/').pop() || fileName,
                    filePath: parentPath,
                    isDir: true,
                    pages: pages.filter((item) => item.isFile)
                },
                target: {
                    ...target,
                    id: encodeURIComponent(target.filePath)
                },
                scrollTop: 0,
                displayMode: 'note',
                cache: true
            })
            this.loading = false
        },
        async refreshContentTool({ getEditor }) {
            const currentFilePath = this.activeFilePath
            if (!currentFilePath) {
                return {
                    shouldStop: true,
                    docInfo: {},
                    contentType: 'fabulous_notebook'
                }
            }
            const res = await this.getNotebookDocument('local', currentFilePath)
            if (res.status !== 'success') {
                this.$barWarning(this.local('Read File Failed'), {
                    status: 'warning'
                })
                return {
                    shouldStop: true,
                    docInfo: {},
                    contentType: 'fabulous_notebook'
                }
            }

            const contentData = res.data.content
            this.docInfo = res.data
            let contentType = 'fabulous_notebook'

            if (this.isMarkdownFile) {
                contentType = 'md'
                let markdownContent = {
                    type: 'doc',
                    content: []
                }
                const editor = getEditor()
                if (editor?.computeMarkdown) {
                    markdownContent = editor.computeMarkdown(contentData)
                }
                this.reviseEditorContent({
                    id: 'local',
                    title: '',
                    banner: '',
                    content: markdownContent,
                    updateDate: new Date(),
                    author: []
                })
                return {
                    shouldStop: false,
                    docInfo: this.docInfo,
                    contentType
                }
            }

            try {
                const rawJson = JSON.parse(contentData)
                if (rawJson.fabulous_notebook) {
                    this.reviseEditorContent({
                        id: 'local',
                        title: rawJson.title || '',
                        description: rawJson.description || null,
                        banner: rawJson.banner || '',
                        content: rawJson.content || { type: 'doc', content: [] },
                        author: rawJson.author || [],
                        createDate: rawJson.createDate || null,
                        updateDate: rawJson.updateDate || new Date()
                    })
                } else {
                    contentType = 'json'
                    this.reviseEditorContent({
                        id: 'local',
                        title: rawJson.title || '',
                        banner: rawJson.banner || '',
                        content: rawJson,
                        author: rawJson.author || [],
                        updateDate: rawJson.updateDate || new Date()
                    })
                }
            } catch {
                contentType = 'html'
                this.reviseEditorContent({
                    id: 'local',
                    title: '',
                    banner: '',
                    content: contentData,
                    updateDate: new Date(),
                    author: []
                })
            }

            return {
                shouldStop: false,
                docInfo: this.docInfo,
                contentType
            }
        },
        async saveConfirmTool({ json, docInfo, wrapCotent }) {
            const currentFilePath = this.activeFilePath
            const res = await this.updateNotebookDocument(
                'local',
                currentFilePath,
                docInfo.versionId,
                wrapCotent(json)
            )
            return {
                shouldStop: false,
                res
            }
        },
        openEditorTool() {},
        openFileTool() {},
        breadcrumbTool() {
            return {
                path: this.activeFilePath,
                disabled: this.history.length === 0,
                rootIcon: this.history.length > 0 ? 'PageLeft' : 'FolderHorizontal'
            }
        },
        backTool() {
            if (this.history.length === 0) return
            let last = this.history[this.history.length - 1]
            this.history.splice(this.history.length - 1, 1)
            this.reviseEditor({
                id: 'local',
                dsId: last.dsId,
                type: last.type,
                item: last.item,
                target: last.page,
                scrollTop: last.scrollTop,
                history: this.history
            })
            if (last?.page?.filePath) {
                let url = `/notebook/local/${encodeURI(last.page.filePath.replace(/\//g, '\\'))}`
                this.$Go(url)
            }
        },
        handleContainerScroll(e) {
            this.tmpScrollTop = e?.el?.scrollTop || 0
        }
    }
}
</script>

<style lang="scss">
.notebook-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 1);
    display: flex;
    overflow: hidden;

    &.dark {
        background: rgba(36, 36, 36, 1);
    }
}
</style>
