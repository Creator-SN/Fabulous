<template>
    <div class="notebook-wrapper" :class="[{ dark: theme === 'dark' }]">
        <editor-container
            editor-id="notebook"
            :refreshContentTool="refreshContentTool"
            :imgInterceptTool="imgInterceptTool"
            :openEditorTool="openEditorTool"
            :saveConfirmTool="saveConfirmTool"
            :openFileTool="openFileTool"
            :breadcrumbTool="breadcrumbTool"
            :backTool="backTool"
            :isRemote="isRemote"
            ref="editor_container"
            @container-scroll="handleContainerScroll"
        ></editor-container>
        <loading v-show="loading || !currentDataPath" style="z-index: 2">
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
import { useDataStore } from '@/stores/data'
import { useNotebookConfig } from '@/stores/notebook'
import loading from '@/components/general/loading.vue'
import editorContainer from '@/components/general/editorContainer/index.vue'
import { item } from '@/js/data_sample'

export default {
    name: 'Notebook',
    components: {
        loading,
        editorContainer
    },
    data() {
        return {
            path: '',
            remotePath: '',
            isRemote: true,
            tmpScrollTop: 0,
            docInfo: {
                versionId: null
            },
            loading: false
        }
    },
    computed: {
        ...mapState(useTheme, ['theme', 'color']),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath,
            currentDataPathItem: (state) => state.currentDataPathItem
        }),
        ...mapState(useAppConfig, {
            local: (state) => state.local,
            editorMap: (state) => state.editor
        }),
        currentEditor() {
            return this.editorMap?.notebook || null
        },
        editorDsId() {
            return this.currentEditor?.dsId || null
        },
        item() {
            return this.currentEditor?.item || null
        },
        target() {
            return this.currentEditor?.target || null
        },
        itemType() {
            return this.currentEditor?.type || null
        },
        displayMode() {
            return this.currentEditor?.displayMode || 'note'
        },
        history() {
            return this.currentEditor?.history || []
        },
        editorCache() {
            return this.currentEditor?.cache || false
        },
        parsePath() {
            const segs = this.path.split('/').filter(Boolean) // 去除无效路径段
            if (segs.length < 2)
                return {
                    valid: false
                }
            if (segs.length === 2)
                return {
                    valid: true,
                    data_path: segs[0],
                    parentId: segs[0],
                    targetId: segs[1],
                    parentPath: segs[0],
                    targetPath: segs.join('/')
                }
            return {
                valid: true,
                data_path: segs[0],
                parentId: segs[segs.length - 2],
                targetId: segs[segs.length - 1],
                parentPath: segs.slice(0, segs.length - 1).join('/'),
                targetPath: segs.join('/')
            }
        },
        shouldReloadItem() {
            return (
                !this.editorCache ||
                this.editorDsId !== this.parsePath.data_path ||
                this.item.id !== this.parsePath.parentId
            )
        }
    },
    watch: {
        $route() {
            if (this.$route.name !== 'NoteBook') return
            this.refreshRemote()
            this.initEditorBinding()
        },
        currentDataPath() {
            this.initEditorBinding()
        },
        target() {
            this.refreshPathParams()
        }
    },
    mounted() {
        this.refreshRemote()
        this.refreshPathParams()
        this.initEditorBinding()
    },
    methods: {
        ...mapActions(useAppConfig, {
            reviseEditor: 'reviseEditor',
            reviseEditorContent: 'reviseEditorContent'
        }),
        ...mapActions(useNotebookConfig, {
            getNotebookDocument: 'getDocument',
            updateNotebookDocument: 'updateDocument',
            transferIdsToNames: 'transferIdsToNames',
            getRemoteDirectory: 'getRemoteDirectory',
            listRemoteDirectoryChildren: 'listRemoteDirectoryChildren'
        }),
        refreshRemote() {
            if (this.$route.path.startsWith('/local_notebook/')) this.isRemote = false
            else this.isRemote = true
        },
        refreshPathParams() {
            // 1. 解析路由参数
            let path = decodeURI(this.$route.params.path || '')
            if (!path) return
            this.path = path.replace(/\\/g, '/')
            this.getRemotePath()
        },
        async initEditorBinding() {
            // 是否更新Editor状态, 此举若修改target则会触发EditorBlock内容更新, 内容更新会调用refreshContentTool
            if (!this.currentDataPath) return
            if (!this.path) return
            if (!this.parsePath.valid) return
            this.loading = true
            this.refreshPathParams()
            const { data_path, parentId, targetId, parentPath, targetPath } = this.parsePath
            if (this.target?.id === targetId) {
                this.loading = false
                this.$refs.editor_container.scrollToTop(this.tmpScrollTop)
                return
            }
            if (this.shouldReloadItem) {
                let parentItem = {}
                let children = []
                let promises = []
                if (data_path !== parentId) {
                    promises.push(
                        this.getRemoteDirectory(parentId).then((res) => {
                            if (res.code === 200 || res.status === 'success') {
                                parentItem = res.data || {}
                            } else {
                                this.$barWarning(res.message, {
                                    status: 'error'
                                })
                            }
                        })
                    )
                } else {
                    parentItem = this.currentDataPathItem || {}
                }
                promises.push(
                    this.listRemoteDirectoryChildren(parentId).then((res) => {
                        if (res.code === 200 || res.status === 'success') {
                            children = res.data || []
                            children = children.filter((item) => item.type === 'notebook')
                            children.forEach((item) => {
                                item.filePath = `${parentPath}/${item.id}`
                            })
                        } else {
                            this.$barWarning(res.message, {
                                status: 'error'
                            })
                        }
                    })
                )
                await Promise.all(promises)
                let targetItem = children.find((item) => item.id === targetId) || {}
                this.reviseEditor({
                    id: 'notebook',
                    dsId: data_path,
                    type: 'notebook',
                    item: {
                        ...parentItem,
                        pages: children,
                        filePath: parentPath
                    },
                    target: {
                        ...targetItem,
                        filePath: targetPath
                    },
                    scrollTop: 0,
                    displayMode: 'note',
                    cache: true
                })
            } else {
                let targetItem = this.item.pages.find((item) => item.id === targetId) || {}
                this.reviseEditor({
                    id: 'notebook',
                    dsId: data_path,
                    target: {
                        ...targetItem,
                        filePath: targetPath
                    },
                    scrollTop: 0
                })
            }
            this.loading = false
        },
        async getRemotePath() {
            if (!this.isRemote || !this.path) {
                this.remotePath = this.path
                return
            }
            const res = await this.transferIdsToNames(this.path, true)
            if (res.code === 200 || res.status === 'success') {
                this.remotePath = (res.data || this.path).replace(/\\/g, '/')
            } else {
                this.remotePath = this.path
            }
        },
        async refreshContentTool() {
            if (!this.editorDsId || !this.target || this.itemType !== 'notebook') {
                return {
                    shouldStop: true,
                    docInfo: {},
                    contentType: 'fabulous_notebook'
                }
            }

            const res = await this.getNotebookDocument(
                this.editorDsId,
                this.target.filePath,
                this.isRemote
            )

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

            try {
                const rawJson = JSON.parse(contentData)
                if (rawJson.fabulous_notebook) {
                    contentType = 'fabulous_notebook'
                    this.reviseEditorContent({
                        id: 'notebook',
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
                        id: 'notebook',
                        title: rawJson.title || '',
                        banner: rawJson.banner || '',
                        content: rawJson,
                        author: rawJson.author || [],
                        updateDate: rawJson.updateDate || new Date()
                    })
                }
            } catch (e) {
                const ext = this.path.split('.').pop()
                if (ext === 'md') {
                    contentType = 'html'
                    this.reviseEditorContent({
                        id: 'notebook',
                        title: '',
                        banner: '',
                        content: contentData,
                        updateDate: new Date(),
                        author: []
                    })
                } else {
                    contentType = 'html'
                    this.reviseEditorContent({
                        id: 'notebook',
                        title: '',
                        banner: '',
                        content: contentData,
                        updateDate: new Date(),
                        author: []
                    })
                }
            }

            return {
                shouldStop: false,
                docInfo: this.docInfo,
                contentType
            }
        },
        async saveConfirmTool({ json, docInfo, wrapCotent }) {
            if (!this.editorDsId || !this.path) {
                return {
                    shouldStop: true,
                    res: { code: 400, message: 'invalid path' }
                }
            }
            const saveContent = wrapCotent(json)
            const res = await this.updateNotebookDocument(
                this.editorDsId,
                this.path,
                docInfo.versionId,
                saveContent,
                this.isRemote
            )
                .then((resp) => resp)
                .catch((err) => err)

            return {
                shouldStop: false,
                res
            }
        },
        async imgInterceptTool({
            getImage,
            interceptImage,
            showStatus,
            updateStatus,
            updateImage,
            isRemote,
            base64ToBlob
        }) {
            if (!isRemote) return { shouldStop: true }
            setTimeout(async () => {
                let src = getImage()
                let blob = false
                if (src.startsWith('data:image')) {
                    let mimeType = src.split(';')[0].split(':')[1]
                    blob = base64ToBlob(src, mimeType)
                } else if (src.startsWith('file:///') || src.startsWith('blob:')) {
                    const response = await fetch(src)
                    blob = await response.blob()
                }
                if (!blob) return
                let oriUrl = interceptImage('')
                showStatus(true)
                this.$api.NotebookController.uploadBinaryImage(
                    this.target.id,
                    {
                        file: blob
                    },
                    null,
                    (progress) => {
                        const { loaded, total } = progress
                        let percent = Math.floor((loaded / total) * 100)
                        updateStatus(percent < 100, percent, this.local('Uploading Image...'))
                    }
                )
                    .then((res) => {
                        showStatus(false)
                        if (res.code === 200) {
                            let id = res.data
                            let targetUrl = this.$remote_server + '/sources/image/' + id
                            updateImage(targetUrl)
                        }
                    })
                    .catch((err) => {
                        console.error(err)
                        showStatus(false)
                        updateImage(oriUrl)
                        this.$barWarning(this.local('Upload Image Failed'), {
                            status: 'warning'
                        })
                    })
            }, 3000)
            return { shouldStop: true }
        },
        notebookRoute() {
            return this.isRemote ? '/notebook/' : '/local_notebook/'
        },
        openEditorTool(item, page, getScrollTop) {
            this.history.push({
                dsId: this.editorDsId,
                type: this.itemType,
                item: this.item,
                page: this.target,
                scrollTop: getScrollTop()
            })
            this.reviseEditor({
                id: 'notebook',
                dsId: this.editorDsId,
                type: 'item',
                item: item,
                target: page,
                scrollTop: 0,
                displayMode: this.displayMode === 'pdf' ? 'both' : this.displayMode,
                history: this.history
            })
            let path = `${this.editorDsId}/${this.item.id}/${this.target.id}`
            let url = `/academic/${encodeURI(path.replace(/\//g, '\\'))}`
            this.$Go(url)
        },
        openFileTool() {},
        breadcrumbTool() {
            const breadcrumbPath = this.isRemote ? this.remotePath : this.path
            return {
                path: breadcrumbPath,
                disabled: this.history.length === 0,
                rootIcon: this.history.length > 0 ? 'PageLeft' : 'FolderHorizontal'
            }
        },
        backTool() {
            if (this.history.length === 0) return
            let last = this.history[this.history.length - 1]
            this.history.splice(this.history.length - 1, 1)
            if (last.item.id === this.item.id && last.page.id === this.target.id) return
            this.reviseEditor({
                id: 'notebook',
                dsId: last.dsId,
                type: last.type,
                item: last.item,
                target: last.page,
                scrollTop: last.scrollTop,
                history: this.history
            })
            let url = ''
            if (this.itemType === 'item') {
                let path = `${last.dsId}/${last.item.id}/${last.page.id}`
                url = `/academic/${encodeURI(path.replace(/\//g, '\\'))}`
            } else if (this.itemType === 'template') {
                let path = `${last.dsId}/${last.page.id}`
                url = `/academic/template/${encodeURI(path.replace(/\//g, '\\'))}`
            } else if (this.itemType === 'notebook' && last.page.filePath) {
                url = `${this.notebookRoute()}${encodeURI(last.page.filePath.replace(/\//g, '\\'))}`
            }
            this.$Go(url)
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
