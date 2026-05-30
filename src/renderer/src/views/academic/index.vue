<template>
    <div class="academic-wrapper" :class="[{ dark: theme === 'dark' }]">
        <editor-container
            editor-id="academic"
            :refreshContentTool="refreshContentTool"
            :imgInterceptTool="imgInterceptTool"
            :openEditorTool="openEditorTool"
            :saveConfirmTool="saveConfirmTool"
            :openFileTool="openFileTool"
            :breadcrumbTool="breadcrumbTool"
            :backTool="backTool"
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
        <create-page-panel ref="createPagePanel" editor-id="academic"></create-page-panel>
    </div>
</template>

<script>
import { useTheme } from '@/stores/theme'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useAcademicConfig } from '@/stores/academic.js'
import { mapState, mapActions } from 'pinia'

import loading from '@/components/general/loading.vue'
import editorContainer from '@/components/general/editorContainer/index.vue'
import createPagePanel from '@/components/academic/createPagePanel.vue'

export default {
    name: 'Academic',
    components: {
        loading,
        editorContainer,
        createPagePanel
    },
    data() {
        return {
            path: '',
            loading: false
        }
    },
    computed: {
        ...mapState(useTheme, ['theme', 'color']),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        }),
        ...mapState(useAppConfig, {
            local: (state) => state.local,
            editorMap: (state) => state.editor
        }),
        currentEditor() {
            return this.editorMap?.academic || null
        },
        editorDsId() {
            return this.currentEditor?.dsId || null
        },
        itemType() {
            return this.currentEditor?.type || null
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
        displayMode() {
            return this.currentEditor?.displayMode || 'note'
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
                    name: this.$route.name,
                    data_path: segs[0],
                    parentId: segs[0],
                    targetId: segs[1]
                }
            return {
                valid: true,
                name: this.$route.name,
                data_path: segs[0],
                parentId: segs[1],
                targetId: segs[2]
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
            if (this.$route.name !== 'Academic' && this.$route.name !== 'Template') return
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
        this.refreshPathParams()
        this.initEditorBinding()
    },
    methods: {
        ...mapActions(useAppConfig, {
            reviseEditor: 'reviseEditor',
            reviseEditorContent: 'reviseEditorContent',
            reviseConfig: 'reviseConfig'
        }),
        ...mapActions(useAcademicConfig, {
            getItem: 'getItem',
            getTemplateInfo: 'getTemplateInfo',
            getRemoteItemPageContent: 'getItemPageContent',
            getRemoteTemplateContent: 'getTemplateContent',
            saveRemoteItemPageContent: 'saveItemPageContent',
            saveRemoteTemplateContent: 'saveTemplateContent',
            openRemoteItemFile: 'openItemFile',
            searchRemoteItems: 'getSearchItems'
        }),
        refreshPathParams() {
            // 1. 解析路由参数
            let path = decodeURI(this.$route.params.path || '')
            if (!path) return
            this.path = path.replace(/\\/g, '/')
        },
        async initEditorBinding() {
            // 是否更新Editor状态, 此举若修改target则会触发EditorBlock内容更新, 内容更新会调用refreshContentTool
            if (!this.currentDataPath) return
            if (!this.path) return
            if (!this.parsePath.valid) return
            this.loading = true
            this.refreshPathParams()
            const { name, data_path, parentId, targetId } = this.parsePath
            if (this.target?.id === targetId) {
                this.loading = false
                this.$refs.editor_container.scrollToTop(this.tmpScrollTop)
                return
            }
            if (this.shouldReloadItem) {
                let parentItem = {}
                if (name === 'Academic') {
                    await this.getItem(data_path, parentId).then((res) => {
                        if (res.code === 200 || res.status === 'success') {
                            parentItem = res.data || {}
                        } else {
                            this.$barWarning(res.message, {
                                status: 'error'
                            })
                        }
                    })
                    let targetItem = parentItem.pages.find((item) => item.id === targetId) || {}
                    this.reviseEditor({
                        id: 'academic',
                        dsId: data_path,
                        type: 'item',
                        item: {
                            ...parentItem
                        },
                        target: {
                            ...targetItem
                        },
                        scrollTop: 0,
                        displayMode: 'note',
                        cache: true
                    })
                } else {
                    await this.getTemplateInfo(data_path).then((res) => {
                        if (res.code === 200 || res.status === 'success') {
                            parentItem = {
                                id: parentId,
                                name: this.local('Template'),
                                pages: res.data || []
                            }
                        } else {
                            this.$barWarning(res.message, {
                                status: 'error'
                            })
                        }
                    })
                    let targetItem = parentItem.pages.find((item) => item.id === targetId) || {}
                    this.reviseEditor({
                        id: 'academic',
                        dsId: data_path,
                        type: 'template',
                        item: {
                            ...parentItem
                        },
                        target: {
                            ...targetItem
                        },
                        scrollTop: 0,
                        displayMode: 'note',
                        cache: true
                    })
                }
            } else {
                let targetItem = this.item.pages.find((item) => item.id === targetId) || {}
                this.reviseEditor({
                    id: 'academic',
                    dsId: data_path,
                    target: {
                        ...targetItem
                    },
                    scrollTop: 0
                })
            }
            this.loading = false
        },
        async refreshContentTool() {
            if (
                !this.itemType ||
                !this.target ||
                !this.target.id ||
                !this.editorDsId ||
                (this.itemType !== 'item' && this.itemType !== 'template')
            )
                return {
                    shouldStop: true,
                    docInfo: {},
                    contentType: ''
                }
            let res = null
            if (this.itemType === 'item') {
                res = await this.getRemoteItemPageContent(
                    this.editorDsId,
                    this.item.id,
                    this.target.id
                )
            } else {
                res = await this.getRemoteTemplateContent(this.editorDsId, this.target.id)
            }
            let docInfo = res.data
            let contentType = ''
            if (res.code === 200) {
                let contentData = res.data.content
                try {
                    let rawJson = JSON.parse(contentData)
                    if (rawJson.fabulous_notebook) {
                        contentType = 'fabulous_notebook'
                        this.reviseEditorContent({ id: 'academic', ...rawJson })
                    } else {
                        contentType = 'json'
                        this.reviseEditorContent({
                            id: 'academic',
                            title: rawJson.title || '',
                            banner: rawJson.banner || '',
                            content: rawJson,
                            updateDate: rawJson.updateDate || new Date(),
                            author: rawJson.author || []
                        })
                    }
                } catch (e) {
                    contentType = 'fabulous_notebook'
                    this.reviseEditorContent({
                        id: 'academic',
                        title: '',
                        banner: '',
                        content: {
                            type: 'doc',
                            content: []
                        },
                        updateDate: new Date(),
                        author: []
                    })
                }
            } else {
                this.$barWarning(res.message, {
                    status: 'error'
                })
            }
            return {
                shouldStop: false,
                docInfo,
                contentType
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
        openEditorTool(item, page, getScrollTop) {
            // item: 要跳转的项目
            // page: 要跳转的页面
            // getScrollTop: 获取滚动位置函数
            this.history.push({
                type: this.itemType,
                item: this.item,
                page: this.target,
                scrollTop: getScrollTop(),
                dsId: this.editorDsId
            })
            this.reviseEditor({
                id: 'academic',
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
        async saveConfirmTool({ json, docInfo, wrapCotent }) {
            // json: 编辑器内容
            // docInfo: 文档信息
            // wrapCotent: 包装内容函数(json, type), 其中type为fabulous_notebook或json等
            let saveContent = wrapCotent(json, 'fabulous_notebook')
            if (!this.itemType || this.displayMode === 'pdf')
                return {
                    res: null,
                    shouldStop: true
                }
            if (!this.target?.id) {
                await this.$refs.createPagePanel.open(this.item, saveContent)
                return {
                    res: null,
                    shouldStop: true
                }
            }
            let resp = null
            if (this.itemType === 'item') {
                resp = await this.saveRemoteItemPageContent(
                    this.editorDsId,
                    this.item.id,
                    this.target.id,
                    docInfo.versionId,
                    saveContent
                )
                    .then((res) => {
                        return res
                    })
                    .catch((res) => {
                        return res
                    })
            } else {
                resp = await this.saveRemoteTemplateContent(
                    this.editorDsId,
                    this.target.id,
                    docInfo.versionId,
                    JSON.stringify(json)
                )
                    .then((res) => {
                        return res
                    })
                    .catch((res) => {
                        return res
                    })
            }
            return {
                res: resp,
                shouldStop: false
            }
        },
        openFileTool(itemid, fileid, type = 'pdf') {
            if (type !== 'pdf') return
            if (!fileid && itemid.indexOf('/') > -1 && itemid.indexOf('.') > -1) {
                fileid = itemid.split('/')[1]
                fileid = fileid.split('.')[0]
                itemid = itemid.split('/')[0]
            }
            this.openRemoteItemFile(this.editorDsId, itemid, fileid).then((res) => {
                const targetUrl = `${this.$server}${res.data.url}`
                window.open(targetUrl, this.item.name, 'width=1200,height=640')
            })
        },
        breadcrumbTool() {
            if (this.itemType === 'item')
                return {
                    path: `${this.item?.name || ''}/${this.target?.name || ''}`,
                    disabled: this.history.length === 0,
                    rootIcon: this.history.length > 0 ? 'PageLeft' : 'FolderHorizontal'
                }
            return {
                path: `${this.item?.name || ''}`,
                disabled: true,
                rootIcon: 'FolderHorizontal'
            }
        },
        backTool() {
            if (this.history.length === 0) return
            let last = this.history[this.history.length - 1]
            this.history.splice(this.history.length - 1, 1)
            if (last.item.id === this.item.id && last.page.id === this.target.id) return
            this.reviseEditor({
                id: 'academic',
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
                url = `/notebook/${encodeURI(last.page.filePath.replace(/\//g, '\\'))}`
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
.academic-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(246, 246, 246, 0.7);
    display: flex;
    overflow: hidden;

    &.dark {
        background: rgba(20, 20, 20, 0.9);
    }
}
</style>
