<template>
    <div
        class="fabulous-editor-block"
        :class="[{ dark: theme == 'dark' }]"
        @mousewheel="onMouseWheel"
    >
        <div class="control-banner">
            <div class="control-left-block">
                <slot name="control-left"></slot>
            </div>
            <div class="control-right-block">
                <span
                    v-if="collabSession && collabWriteDenied"
                    class="collaboration-permission-status"
                    :title="local('No Write Permission')"
                    >{{ local('No Write Permission') }}</span
                >
                <collaborator-avatars :users="collabUsers"></collaborator-avatars>
                <history-callout
                    v-if="isRemote && item && itemType !== 'template'"
                    :model-value="target"
                    :uri="currentEditor?.dsId"
                    :itemid="item.id"
                    :mode="itemType"
                    :theme="theme"
                    :local="local"
                    @chooseItem="previewHistory"
                ></history-callout>
                <slot name="control-right"></slot>
            </div>
        </div>
        <div v-show="info.id" class="nav-banner" :class="[{ half: displayMode === 2 }]">
            <fv-Breadcrumb
                :model-value="breadcrumbState.path"
                :disabled="breadcrumbState.disabled"
                :theme="theme"
                :rootIcon="breadcrumbState.rootIcon"
                :font-size="'12px'"
                @root-click="back"
            ></fv-Breadcrumb>
        </div>
        <input v-show="false" type="file" accept=".md" ref="md_input" @change="openMarkdown" />
        <input
            v-show="false"
            type="file"
            multiple
            ref="attachment_input"
            @change="chooseAttachments"
        />
        <div v-show="lock.loading" class="main-display-block">
            <power-editor
                :key="collabKey"
                :model-value="collabSession ? '' : editorContent.content"
                :starter-kit="collabSession ? { undoRedo: false } : undefined"
                :placeholder="local('Write something ...')"
                :editable="!readonly && (!collabSession || collabCanWrite)"
                :theme="theme"
                :language="language"
                :editorBackground="
                    theme == 'dark' ? 'rgba(47, 52, 55, 0)' : 'rgba(250, 250, 250, 0)'
                "
                :editorOutSideBackground="
                    theme == 'dark' ? 'rgba(47, 52, 55, 0)' : 'rgba(250, 250, 250, 0)'
                "
                :toolbarHeight="170"
                :editablePaddingTop="180"
                :readOnlyPaddingTop="100"
                :contentMaxWidth="
                    editorExpandContent ? 'calc(100% - 50px)' : 'min(900px, calc(100% - 50px))'
                "
                :mobileDisplayWidth="0"
                :mentionItemAttr="currentMentionItemAttr"
                :extensions="customExtensions"
                :imgInterceptor="imgIntercept"
                ref="editor"
                :show-drag-handler="true"
                :useTab="true"
                :style="{ background: 'transparent', 'font-size': `${fontSize}px` }"
                style="position: relative; width: 100%; height: 100%; flex: 1"
                @save-json="saveConfirm"
                @click.capture="show.quickNav = false"
                @change="editorContentChange"
                @on-mounted="onPowerEditorMounted"
                @content-change="editorSetContentChange"
                @container-scroll="$emit('container-scroll', $event)"
            >
                <template v-slot:custom-buttons-front="x">
                    <fv-button
                        :theme="theme"
                        :foreground="theme === 'dark' ? 'rgba(200, 200, 200, 1)' : ''"
                        :background="'transparent'"
                        border-color="transparent"
                        :class="[x.defaultClass]"
                        :title="local('Import Markdown')"
                        @click="$refs.md_input.click()"
                    >
                        <img
                            draggable="false"
                            :src="img.openMarkdown"
                            alt=""
                            style="width: 16px; height: 16px; object-fit: contain"
                            :style="{ filter: theme == 'dark' ? 'invert(1)' : '' }"
                        />
                    </fv-button>
                </template>
                <template v-slot:custom-buttons-0="x">
                    <fv-button
                        :theme="theme"
                        :foreground="'rgba(147, 79, 125, 1)'"
                        :background="'transparent'"
                        border-color="transparent"
                        :class="[x.defaultClass]"
                        :title="local('Save As')"
                        @click="saveAs"
                    >
                        <i class="ms-Icon ms-Icon--SaveAs"></i>
                    </fv-button>
                </template>
                <template #custom-buttons-2="x">
                    <fv-button
                        v-if="attachmentResource && !readonly"
                        :theme="theme"
                        background="transparent"
                        border-color="transparent"
                        :class="[x.defaultClass]"
                        :disabled="!!collabSession && !collabCanWrite"
                        :title="local('Upload File')"
                        @click="$refs.attachment_input.click()"
                    >
                        <i class="ms-Icon ms-Icon--Attach"></i>
                    </fv-button>
                </template>
                <template v-slot:front-content>
                    <fv-img
                        v-show="editorContent.banner"
                        :src="currentBanner"
                        class="fabulous-notebook-banner-img"
                        @click.capture="$refs.input.click()"
                    ></fv-img>
                    <div v-show="!readonly" class="fabulous-notebook-info-block">
                        <fv-button
                            v-show="!editorContent.banner"
                            :theme="theme"
                            icon="Picture"
                            background="rgba(255, 255, 255, 0.6)"
                            :border-radius="6"
                            foreground="rgba(120, 120, 120, 1)"
                            style="min-width: 120px; width: 50%; max-width: 300px"
                            @click="$refs.input.click()"
                            >{{ local('Add Banner') }}</fv-button
                        >
                        <fv-button
                            v-show="editorContent.banner"
                            theme="dark"
                            icon="Picture"
                            background="rgba(220, 62, 72, 0.9)"
                            :border-radius="6"
                            style="min-width: 120px; width: 50%; max-width: 300px"
                            @click="
                                () => {
                                    editorContent.banner = ''
                                    toggleUnsave(true)
                                }
                            "
                            >{{ local('Delete Banner') }}</fv-button
                        >
                        <input
                            v-show="false"
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
                            ref="input"
                            @change="chooseBanner"
                        />
                    </div>
                    <div class="fabulous-notebook-title-block">
                        <fv-text-box
                            v-show="!readonly"
                            :placeholder="local('Input title here ...')"
                            v-model="titleModel"
                            :theme="theme"
                            :font-size="28"
                            :font-weight="600"
                            :background="`transparent`"
                            :border-color="`rgba(217, 204, 237, 0.1)`"
                            :focus-border-color="`rgba(217, 204, 237, 0.8)`"
                            :border-width="3"
                            :border-radius="0"
                            underline
                            :readonly="readonly != false"
                            @keydown="toggleUnsave(true), titleBlockTab($event)"
                            style="height: 60px"
                            :style="{
                                width: '100%',
                                'max-width': editorExpandContent
                                    ? 'calc(100% - 50px)'
                                    : 'min(900px, calc(100% - 50px))'
                            }"
                        ></fv-text-box>
                        <p
                            v-show="readonly && editorContent.title"
                            class="fabulous-notebook-title"
                            :class="[{ dark: theme === 'dark' }]"
                            :style="{
                                width: '100%',
                                'max-width': editorExpandContent
                                    ? 'calc(100% - 50px)'
                                    : 'min(900px, calc(100% - 50px))'
                            }"
                        >
                            {{ editorContent.title }}
                        </p>
                    </div>
                    <editor-nav
                        v-show="editorShowNav"
                        :el="() => $refs.editor"
                        ref="editor_nav"
                    ></editor-nav>
                </template>
            </power-editor>
        </div>
        <div v-show="!lock.loading" class="loading-block">
            <fv-progress-ring
                loading="true"
                r="20"
                borderWidth="5"
                :color="color"
                background="rgba(120, 120, 120, 0.1)"
            ></fv-progress-ring>
        </div>
        <div
            class="bottom-control"
            :class="[{ dark: theme == 'dark' }, { close: !show.bottomControl }]"
        >
            <i
                class="ms-Icon trigger"
                :class="[`ms-Icon--${show.bottomControl ? 'ChevronRightMed' : 'ChevronLeftMed'}`]"
                style="flex: 1"
                @click="show.bottomControl ^= true"
            ></i>
            <div v-show="show.bottomControl" class="right-block">
                <i class="ms-Icon ms-Icon--FontSize" style="margin: 0px 5px"></i>
                <fv-slider
                    v-model="fontSize"
                    :theme="theme"
                    :mininum="12"
                    :maxinum="72"
                    color="rgba(145, 145, 235, 1)"
                    :background="
                        theme === 'dark' ? 'rgba(20, 20, 20, 0.6)' : 'rgba(255, 255, 255, 1)'
                    "
                    :showLabel="true"
                    style="width: 150px; margin-right: 15px"
                >
                    <template v-slot="prop">
                        <p style="margin: 5px">{{ prop.value }}px</p>
                    </template>
                </fv-slider>
            </div>
        </div>
        <save-options v-model:show="show.saveOptions" @save="confirmSaveAs"></save-options>
        <template-preview
            :title="local('History Preview')"
            :model-value="currentHistory"
            v-model:show="show.historyPreview"
            :showBanner="true"
            :showTitle="true"
        >
            <template v-slot:control="x">
                <fv-button
                    v-if="info.id && !readonly && (!collabSession || collabCanWrite)"
                    theme="dark"
                    background="rgba(140, 148, 228, 1)"
                    border-radius="6"
                    style="width: 120px; margin-right: 5px"
                    @click="
                        () => {
                            commitDiff(x.result)
                            show.historyPreview = false
                        }
                    "
                    >{{ local('Rollback version') }}</fv-button
                >
            </template>
        </template-preview>
        <diff-previewer
            v-model="show.diff"
            :author="beforeSavingDiff.author"
            :source="beforeSavingDiff.source"
            :target="beforeSavingDiff.target"
            :createDate="beforeSavingDiff.createDate"
            @commit="commitDiff"
            @save="commitDiffAndSave"
        ></diff-previewer>
    </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'

const proxy = getCurrentInstance().proxy

defineExpose({
    scrollToTop: (...args) => proxy.scrollToTop(...args),
    getEditor: (...args) => proxy.getEditor(...args),
    refreshContent: (...args) => proxy.refreshContent(...args)
})
</script>

<script>
import { mapState, mapActions } from 'pinia'
import { useDataStore } from '@/stores/data'
import { useAppConfig } from '@/stores/appConfig'
import { useNotebookConfig } from '@/stores/notebook'
import { useTheme } from '@/stores/theme'
import * as Diff from 'diff'

import editorNav from '@/components/general/editorContainer/editorNav.vue'
import saveOptions from '@/components/notebook/saveOptions.vue'
import diffPreviewer from '@/components/general/editorContainer/diffPreviewer.vue'
import historyCallout from '@/components/general/callout/historyCallout.vue'
import templatePreview from '@/components/templates/templatePreview.vue'
import collaboratorAvatars from '@/components/general/editorContainer/collaboratorAvatars.vue'
import { Collaboration, yXmlFragmentToProsemirrorJSON } from '@creatorsn/powereditor3/collaboration'
import { useCollaborationStore } from '@/stores/editorStore/collaboration'
import { seedYXmlFragmentFromJSON } from '@/js/collaboration/seed.js'
import collaborationCaret from '@/js/collaboration/caret.js'
import { useUserStore } from '@/stores/user'

import pdfNote from '@/components/general/editorCustom/extension/pdfNote.js'
import fileAttachment from '@/components/general/editorCustom/extension/fileAttachment.js'

import pdf from '@/assets/home/pdf.svg'
import note from '@/assets/home/note.svg'
import markdown from '@/assets/home/md.svg'
import openMarkdownImg from '@/assets/home/open_md.svg'

import { fabulous_notebook } from '@/js/data_sample.js'

export default {
    emits: ['read-permission-change', 'container-scroll', 'editor-mounted'],
    components: {
        editorNav,
        saveOptions,
        diffPreviewer,
        historyCallout,
        templatePreview,
        collaboratorAvatars
    },
    props: {
        readonly: {
            type: Boolean,
            default: false
        },
        editorId: {
            type: String,
            required: true
        },
        refreshContentTool: {
            default: null,
            type: Function
        },
        imgInterceptTool: {
            default: null,
            type: Function
        },
        openEditorTool: {
            default: null,
            type: Function
        },
        openFileTool: {
            default: null,
            type: Function
        },
        saveConfirmTool: {
            default: null,
            type: Function
        },
        breadcrumbTool: {
            default: null,
            type: Function
        },
        backTool: {
            default: null,
            type: Function
        },
        isRemote: {
            type: Boolean,
            default: true
        },
        mentionItemAttr: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            visible: false,
            fontSize: 16,
            docInfo: {
                versionId: null
            },
            beforeSavingDiff: {
                versionId: null,
                author: null,
                source: null,
                target: null,
                createDate: new Date()
            },
            currentHistory: {},
            contentType: 'fabulous_notebook',
            customExtensions: [pdfNote, fileAttachment],
            collabOwner: Symbol('editorBlock'),
            collabKey: 0,
            collabRestartNeeded: false,
            collabApplyingRemote: false,
            collabRestartPending: false,
            collabPendingSnapshot: null,
            saveRequestSnapshot: null,
            collabSavedSnapshot: null,
            contentLoadRequestId: 0,
            img: {
                pdf: pdf,
                note: note,
                markdown: markdown,
                openMarkdown: openMarkdownImg
            },
            lock: {
                loading: true,
                diff: true,
                save: true,
                awaitContentChangeDiffComputing: null
            },
            show: {
                quickNav: false,
                addItemPage: false,
                bottomControl: false,
                diff: false,
                historyPreview: false
            },
            timer: {
                diff: undefined,
                autoSave: undefined
            }
        }
    },
    watch: {
        displayMode: {
            handler(newVal, oldVal) {
                if (!oldVal || oldVal === 'pdf') {
                    this.toggleUnsave(false)
                    this.refreshContent()
                }
            },
            immediate: true
        },
        target() {
            this.$emit('read-permission-change', false)
            this.toggleUnsave(false)
            this.refreshContent()
        },
        collaborationResourceKey() {
            this.restartCollaboration()
        },
        autoSave() {
            this.collabSession?.syncAwarenessMode()
        },
        collabStatus(status) {
            if (status !== 'connected') this.reviseEditor({ id: this.editorId, savePending: false })
        }
    },
    computed: {
        ...mapState(useDataStore, {
            data_path: (state) => state.data_path,
            data_index: (state) => state.configState.data_index,
            language: (state) => state.configState.language,
            currentDataPath: (state) => state.currentDataPath,
            currentDataPathItem: (state) => state.currentDataPathItem,
            autoSave: (state) => state.configState.autoSave,
            editorExpandContent: (state) => state.configState.editorExpandContent,
            editorShowNav: (state) => state.configState.editorShowNav
        }),
        ...mapState(useAppConfig, {
            editorMap: (state) => state.editor,
            local: 'local'
        }),
        ...mapState(useTheme, { theme: 'theme', color: 'color' }),
        ...mapState(useUserStore, ['info']),
        currentEditor() {
            return this.editorMap?.[this.editorId] || null
        },
        attachmentResource() {
            if (!this.isRemote || !this.target?.id || !['notebook', 'item'].includes(this.itemType))
                return null
            return { type: this.itemType === 'notebook' ? 'notebook' : 'page', id: this.target.id }
        },
        itemType() {
            return this.currentEditor?.type || null
        },
        scrollTop() {
            return this.currentEditor?.scrollTop || 0
        },
        history() {
            return this.currentEditor?.history || []
        },
        item() {
            return this.currentEditor?.item || null
        },
        displayMode() {
            return this.currentEditor?.displayMode || 'note'
        },
        editorContent() {
            return (
                this.currentEditor?.editorContent || {
                    title: '',
                    description: null,
                    banner: '',
                    content: {
                        type: 'doc',
                        content: []
                    },
                    author: [],
                    createDate: null,
                    updateDate: null
                }
            )
        },
        storeContent() {
            return this.currentEditor?.storeContent || ''
        },
        realtimeContent() {
            return this.currentEditor?.realtimeContent || ''
        },
        unsave() {
            return this.currentEditor?.unsave || false
        },
        target() {
            return this.currentEditor?.target || null
        },
        collaborationResourceKey() {
            return useCollaborationStore().resourceKey(
                this.editorId,
                this.currentEditor,
                this.isRemote
            )
        },
        collaborationState() {
            const state = useCollaborationStore().editors[this.editorId]
            return state?.owner === this.collabOwner ? state : null
        },
        collabSession() {
            return this.collaborationState?.session || null
        },
        collabResourceKey() {
            return this.collaborationState?.resourceKey || null
        },
        collabUsers() {
            return this.collaborationState?.users || []
        },
        collabStatus() {
            return this.collaborationState?.status || 'disconnected'
        },
        collabCanWrite() {
            return this.collaborationState?.canWrite || false
        },
        collabWriteDenied() {
            return this.collaborationState?.writeDenied || false
        },
        breadcrumbState() {
            if (this.breadcrumbTool) {
                let state = this.breadcrumbTool()
                if (state) return state
            }
            return {
                path: ``,
                disabled: this.history.length === 0,
                rootIcon: this.history.length > 0 ? 'PageLeft' : 'FolderHorizontal'
            }
        },
        currentBanner() {
            if (!this.editorContent.banner) return ''
            return this.editorContent.banner
        },
        currentMentionItemAttr() {
            if (this.mentionItemAttr) return this.mentionItemAttr
            return {
                mentionList: async () => [],
                filterFunc: () => true,
                chooseItemCallback: () => {},
                mentionClickCallback: () => {},
                headerForeground: () => 'rgba(149, 141, 241, 1)'
            }
        },
        titleModel: {
            get() {
                return this.editorContent.title
            },
            set(val) {
                this.reviseEditorContent({ id: this.editorId, title: val })
            }
        }
    },
    mounted() {
        this.visible = true
        this.startCollaboration()
        this.ShortCutInit()
        this.timerInit()
        this.bindNativeEditorEvents()
    },
    methods: {
        ...mapActions(useAppConfig, {
            reviseEditor: 'reviseEditor',
            reviseEditorContent: 'reviseEditorContent',
            reviseConfig: 'reviseConfig'
        }),
        ...mapActions(useNotebookConfig, {
            uploadRemoteBinaryImage: 'uploadBinaryImage'
        }),
        timerInit() {
            clearInterval(this.timer.autoSave)
            this.timer.autoSave = setInterval(() => {
                if (this.visible && this.autoSave && this.unsave && !this.show.diff) {
                    let editor = this.getEditor()
                    if (this.collabSession) {
                        if (!this.collabSession.hasPendingUpdates) this.flushCollaboration()
                        return
                    }
                    editor.save()
                }
            }, 3000)
        },
        diffContent() {
            let nodeDirtyAttrRemove = (obj) => {
                let dirtyAttrs = ['theme', 'headerForeground']
                let arr = obj.content
                if (!arr) {
                    console.log('nodeDirtyAttrRemove in editorBlock.vue:diffContent `arr` is empty')
                    return
                }
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].content && arr[i].content.length > 0)
                        arr = arr.concat(arr[i].content)
                }
                arr.forEach((el) => {
                    if (el.attrs) {
                        dirtyAttrs.forEach((attr) => {
                            if (el.attrs[attr]) delete el.attrs[attr]
                        })
                    }
                })
            }
            clearTimeout(this.timer.diff)
            this.timer.diff = setTimeout(() => {
                if (this.visible && this.lock.diff) {
                    this.lock.diff = false
                    let status = false
                    let editor = this.getEditor()
                    this.reviseEditor({
                        id: this.editorId,
                        realtimeContent: editor.editor().getJSON()
                    })
                    let thisContent = JSON.parse(JSON.stringify(this.realtimeContent))
                    let storeContent = JSON.parse(JSON.stringify(this.storeContent))
                    nodeDirtyAttrRemove(storeContent)
                    nodeDirtyAttrRemove(thisContent)
                    let diff =
                        this.collabSession && this.collabSavedSnapshot
                            ? Diff.diffJson(
                                  this.collaborationComparable(this.collabSavedSnapshot),
                                  this.collaborationComparable(this.collaborationSnapshot())
                              )
                            : Diff.diffJson(storeContent, thisContent)
                    if (diff.length > 1) status = true
                    else {
                        if (diff[0].added || diff[0].removed) status = true
                    }
                    this.toggleUnsave(status)
                    this.lock.diff = true
                    if (this.lock.awaitContentChangeDiffComputing) {
                        // Commit diff提交完后, 一定会触发编辑器重新set content和content change, 这会导致diffContent被调用, 需要等待diffContent执行完, 告诉CommitDiff完成
                        this.lock.awaitContentChangeDiffComputing()
                        this.lock.awaitContentChangeDiffComputing = null
                    }
                }
            }, 300)
        },
        ShortCutInit() {
            window.addEventListener('keydown', this.shortCutEvent, true)
        },
        onPowerEditorMounted(editor) {
            editor.storage.fileAttachment.getResource = () => this.attachmentResource
            this.$emit('editor-mounted', editor)
            if (!this.collabSession) return
            // 菜单插件重建编辑器状态时可能移除 UndoManager 对自身的追踪，导致撤销无法生成重做记录。
            const restoreUndoOrigin = () => {
                const undoManager = editor.state.plugins
                    .find((plugin) => plugin.key === 'y-undo$')
                    ?.getState(editor.state)?.undoManager
                undoManager?.addTrackedOrigin(undoManager)
            }
            editor.on('transaction', restoreUndoOrigin)
            editor.on('destroy', () => editor.off('transaction', restoreUndoOrigin))
            restoreUndoOrigin()
        },
        chooseAttachments(event) {
            const files = Array.from(event.target.files || [])
            event.target.value = ''
            this.insertAttachments(files)
        },
        insertAttachments(files = [], position = null) {
            const editor = this.getEditor()?.editor?.()
            if (!files.length || this.readonly || !this.attachmentResource || !editor?.isEditable) return
            for (const [index, file] of files.entries()) {
                editor.chain().focus().insertFileAttachment(file, index === 0 ? position : null).run()
            }
        },
        bindNativeEditorEvents() {
            this.$nextTick(() => {
                if (!this.$el) return
                this.$el.addEventListener('paste', this.handleEditorPaste, true)
                this.$el.addEventListener('dragenter', this.handleEditorDragOver, true)
                this.$el.addEventListener('dragover', this.handleEditorDragOver, true)
                this.$el.addEventListener('drop', this.handleEditorDrop, true)
            })
        },
        shortCutEvent(event) {
            if (!this.visible) return
            if (this.isRemote && !this.info.id) {
                if ((event.ctrlKey || event.metaKey) && event.keyCode === 83) event.preventDefault()
                return
            }
            let ctrl = event.ctrlKey || event.metaKey
            if (
                this.collabSession &&
                ctrl &&
                !event.altKey &&
                (event.target?.closest?.('.ProseMirror') ||
                    document.activeElement?.closest?.('.ProseMirror'))
            ) {
                const isUndo = event.keyCode === 90 && !event.shiftKey
                const isRedo = event.keyCode === 89 || (event.keyCode === 90 && event.shiftKey)
                if (isUndo || isRedo) {
                    event.preventDefault()
                    event.stopImmediatePropagation()
                    const editor = this.getEditor()?.editor?.()
                    if (isUndo) editor?.commands.undo()
                    else editor?.commands.redo()
                    return
                }
            }
            if (event.keyCode === 83 && ctrl && !event.shiftKey) {
                event.preventDefault()
                let editor = this.getEditor()
                if (this.collabSession) {
                    if (!this.flushCollaboration())
                        this.$barWarning(this.collaborationSaveFailureMessage(), {
                            status: 'warning'
                        })
                    return
                }
                editor.save()
            } else if (event.keyCode === 83 && ctrl && event.shiftKey) {
                event.preventDefault()
                this.saveAs()
            }
        },
        getEditor() {
            return this.$refs.editor
        },
        getClipboardFiles(clipboardData) {
            const files = Array.from(clipboardData?.files || [])
            if (files.length) return files
            // Some browsers expose pasted files through items instead of the FileList.
            return Array.from(clipboardData?.items || [])
                .filter((item) => item.kind === 'file')
                .map((item) => item.getAsFile?.())
                .filter(Boolean)
        },
        async readFilesAsDataUrls(files = []) {
            return await Promise.all(
                files.map(
                    (file) =>
                        new Promise((resolve, reject) => {
                            const reader = new FileReader()
                            reader.onload = (e) => resolve(e.target.result)
                            reader.onerror = () => reject(new Error('Read image file failed'))
                            reader.readAsDataURL(file)
                        })
                )
            )
        },
        insertImages(dataUrls = []) {
            if (!dataUrls.length) return
            const editor = this.getEditor()
            if (!editor) return
            const tiptap = editor.editor()
            if (!tiptap) return
            dataUrls.forEach((src) => {
                tiptap
                    .chain()
                    .focus()
                    .insertContent(`<img src="${src}" theme="${this.theme}"></img>`)
                    .run()
            })
        },
        async handleEditorPaste(event) {
            if (event.defaultPrevented) return
            const editor = this.getEditor()?.editor?.()
            if (this.readonly || !editor?.isEditable || !editor.view.dom.contains(event.target)) return
            const files = this.getClipboardFiles(event.clipboardData)
            if (!files.length) return
            const hasAttachments = files.some((file) => !file.type?.startsWith('image/'))
            if (hasAttachments && this.attachmentResource) {
                event.preventDefault()
                event.stopImmediatePropagation()
                this.insertAttachments(files)
                return
            }
            const imageFiles = files.filter((file) => file.type?.startsWith('image/'))
            if (!imageFiles.length) return
            event.preventDefault()
            event.stopImmediatePropagation()
            try {
                const dataUrls = await this.readFilesAsDataUrls(imageFiles)
                if (editor.isDestroyed || !editor.isEditable || this.getEditor()?.editor?.() !== editor) return
                this.insertImages(dataUrls)
            } catch (err) {
                console.error(err)
                this.$barWarning(this.local('Read Image Failed'), {
                    status: 'warning'
                })
            }
        },
        isFileDrag(event) {
            const transfer = event.dataTransfer
            return Array.from(transfer?.types || []).includes('Files') ||
                Boolean(transfer?.files?.length) ||
                Array.from(transfer?.items || []).some((item) => item.kind === 'file')
        },
        getDroppedFiles(transfer) {
            const items = Array.from(transfer?.items || []).filter((item) => item.kind === 'file')
            if (!items.length) return Array.from(transfer?.files || [])
            return items
                .filter((item) => !item.webkitGetAsEntry?.()?.isDirectory)
                .map((item) => item.getAsFile?.())
                .filter(Boolean)
        },
        handleEditorDragOver(event) {
            const editor = this.getEditor()?.editor?.()
            if (!editor || !editor.view.dom.contains(event.target) || !this.isFileDrag(event)) return
            event.preventDefault()
            event.stopImmediatePropagation()
            const hasImages = Array.from(event.dataTransfer.items || []).some((item) => item.type?.startsWith('image/')) ||
                Array.from(event.dataTransfer.files || []).some((file) => file.type?.startsWith('image/'))
            event.dataTransfer.dropEffect = !this.readonly && editor.isEditable &&
                (this.attachmentResource || hasImages) ? 'copy' : 'none'
        },
        async handleEditorDrop(event) {
            const editor = this.getEditor()?.editor?.()
            if (!editor || !editor.view.dom.contains(event.target) || !this.isFileDrag(event)) return
            // Keep an editor file drop from reaching the app-wide PDF/notebook importer.
            event.preventDefault()
            event.stopImmediatePropagation()
            if (this.readonly || !editor.isEditable) return
            const files = this.getDroppedFiles(event.dataTransfer)
            if (!files.length) return
            const hasAttachments = files.some((file) => !file.type?.startsWith('image/'))
            if (hasAttachments && this.attachmentResource) {
                const position = editor.view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
                this.insertAttachments(files, position)
                return
            }
            const imageFiles = files.filter((file) => file.type?.startsWith('image/'))
            if (!imageFiles.length) return
            try {
                const dataUrls = await this.readFilesAsDataUrls(imageFiles)
                if (editor.isDestroyed || !editor.isEditable || this.getEditor()?.editor?.() !== editor) return
                this.insertImages(dataUrls)
            } catch (err) {
                console.error(err)
                this.$barWarning(this.local('Read Image Failed'), {
                    status: 'warning'
                })
            }
        },
        openMarkdown() {
            let files = this.$refs.md_input.files
            if (files.length > 0) {
                let file = files[0]
                let reader = new FileReader()
                reader.onload = (e) => {
                    let mdContent = e.target.result
                    let obj = this.$refs.editor.computeMarkdown(mdContent)
                    this.reviseEditorContent({
                        id: this.editorId,
                        content: obj
                    })
                    this.$refs.md_input.value = ''
                }
                reader.readAsText(file)
            }
        },
        async refreshContent() {
            if (!this.refreshContentTool) return
            const requestId = ++this.contentLoadRequestId
            this.lock.loading = false
            try {
                const { shouldStop, readDenied, docInfo, contentType } =
                    await this.refreshContentTool({
                        getEditor: this.getEditor
                    })
                if (requestId !== this.contentLoadRequestId) return
                if (readDenied) this.$emit('read-permission-change', true)
                if (shouldStop) return
                this.$emit('read-permission-change', false)
                this.docInfo = docInfo
                this.contentType = contentType
                try {
                    if (this.visible && this.$refs.editor)
                        this.getEditor().editor().chain().focus().setTextSelection(0).run()
                } catch (e) {}
            } catch (error) {
                if (requestId === this.contentLoadRequestId) {
                    console.error('[editor] Failed to load document content.', error)
                    this.$barWarning(this.local('Failed to load document content.'), {
                        status: 'error'
                    })
                }
            } finally {
                if (requestId === this.contentLoadRequestId) this.lock.loading = true
            }
        },
        toggleUnsave(status = true) {
            const pendingSnapshot = this.collabPendingSnapshot || this.saveRequestSnapshot
            const savePending = Boolean(
                status &&
                    pendingSnapshot &&
                    (!this.collabSession || this.collabStatus === 'connected') &&
                    !Diff.diffJson(
                        this.collaborationComparable(pendingSnapshot),
                        this.collaborationComparable(this.collaborationSnapshot())
                    ).some((change) => change.added || change.removed)
            )
            this.reviseEditor({
                id: this.editorId,
                unsave: status,
                savePending
            })
        },
        wrapCotent(json, contentType = null) {
            // 根据不同contentType以字符串形式封装json.
            let saveContent = null
            if (!contentType) contentType = this.contentType
            if (contentType === 'fabulous_notebook') {
                let _fabulous_notebook = JSON.parse(JSON.stringify(fabulous_notebook))
                for (let key in this.editorContent) {
                    _fabulous_notebook[key] = this.editorContent[key]
                }
                _fabulous_notebook.content = json
                _fabulous_notebook.updateDate = new Date()
                saveContent = JSON.stringify(_fabulous_notebook)
            } else if (contentType == 'template') {
                saveContent = JSON.stringify(json)
            } else if (contentType === 'md') {
                saveContent = this.$refs.editor.saveMarkdown()
            } else {
                saveContent = JSON.stringify(json)
            }
            return saveContent
        },
        formatFAB(json) {
            // 格式化json为fabulous_notebook格式
            if (!json.fabulous_notebook) {
                let _fabulous_notebook = JSON.parse(JSON.stringify(fabulous_notebook))
                _fabulous_notebook.content = json
                json = _fabulous_notebook
                return json
            }
            return json
        },
        async saveConfirm(json) {
            if (this.isRemote && !this.info.id) return
            if (this.collabSession) {
                if (!this.flushCollaboration(this.collaborationSnapshot(json)))
                    this.$barWarning(this.collaborationSaveFailureMessage(), { status: 'warning' })
                this.lock.save = true
                return
            }
            if (!this.lock.save) return
            this.lock.save = false
            let onerror = (res) => {
                if (res.code === 40036) {
                    let sourceNotebook = res.data.content
                    try {
                        sourceNotebook = JSON.parse(sourceNotebook)
                    } catch (e) {
                        sourceNotebook = {}
                    }
                    this.beforeSavingDiff.versionId = res.data.versionId
                    this.beforeSavingDiff.author = res.data.author
                    this.beforeSavingDiff.source = this.formatFAB(sourceNotebook)
                    this.beforeSavingDiff.target = this.formatFAB(json)
                    this.beforeSavingDiff.createDate = new Date(res.data.createDate)
                    this.show.diff = true
                    this.$barWarning(
                        this.local(`Current notebook version conflicts with remote version.`),
                        {
                            status: 'warning'
                        }
                    )
                    return
                }
                this.$barWarning(res.message, {
                    status: 'error'
                })
            }
            this.saveRequestSnapshot = this.collaborationSnapshot(json)
            this.reviseEditor({ id: this.editorId, savePending: true })
            try {
                let { res, shouldStop } = await this.saveConfirmTool({
                    json,
                    docInfo: this.docInfo,
                    wrapCotent: this.wrapCotent
                })
                if (shouldStop) return
                if (res.code === 200) {
                    if (res.data.versionId) this.docInfo.versionId = res.data.versionId
                    this.reviseEditor({
                        id: this.editorId,
                        storeContent: this.saveRequestSnapshot.content,
                        realtimeContent: this.getEditor().editor().getJSON()
                    })
                    const changes = Diff.diffJson(
                        this.collaborationComparable(this.saveRequestSnapshot),
                        this.collaborationComparable(this.collaborationSnapshot())
                    )
                    this.toggleUnsave(changes.some((change) => change.added || change.removed))
                } else {
                    onerror(res)
                }
            } finally {
                this.saveRequestSnapshot = null
                this.reviseEditor({ id: this.editorId, savePending: false })
                this.lock.save = true
            }
        },
        async commitDiff(result) {
            if (this.collabSession) {
                const session = this.collabSession
                const editor = this.getEditor()?.editor?.()
                if (this.readonly || !this.collabCanWrite || !editor?.isEditable) {
                    this.$barWarning(this.collaborationSaveFailureMessage(), { status: 'warning' })
                    return false
                }
                try {
                    // Validate the complete body before changing either metadata or the shared document.
                    if (result.content?.type !== 'doc') throw new Error('Invalid history document')
                    let body = editor.schema.nodeFromJSON(result.content)
                    if (!body.content.size) body = editor.schema.topNodeType.createAndFill()
                    body.check()
                    this.reviseEditorContent({
                        id: this.editorId,
                        banner: result.banner,
                        title: result.title,
                        content: body.toJSON()
                    })
                    // The editor transaction updates the bound Y.Doc and uses the normal sync/undo flow.
                    editor.commands.setContent(body.toJSON(), {
                        emitUpdate: true,
                        errorOnInvalidContent: true
                    })
                    await this.$nextTick()
                    if (session !== this.collabSession || this.getEditor()?.editor?.() !== editor) return false
                    this.reviseEditor({ id: this.editorId, realtimeContent: editor.getJSON() })
                    this.$refs.editor_nav.getEditorNavList()
                    this.toggleUnsave(true)
                    if (this.autoSave && !this.flushCollaboration()) {
                        this.$barWarning(this.collaborationSaveFailureMessage(), { status: 'warning' })
                    }
                    return true
                } catch (error) {
                    console.error('[collaboration] Failed to restore version.', error)
                    this.$barWarning(this.local('Rollback version failed'), { status: 'error' })
                    return false
                }
            }
            this.reviseEditorContent({
                id: this.editorId,
                banner: result.banner,
                title: result.title,
                content: result.content
            })
            this.docInfo.versionId = this.beforeSavingDiff.versionId
            await new Promise((resolve) => {
                this.lock.awaitContentChangeDiffComputing = resolve
            })
            this.toggleUnsave(true)
        },
        async commitDiffAndSave(result) {
            if ((await this.commitDiff(result)) === false) return
            this.getEditor()?.save()
        },
        downloadTxtFile(text, filename) {
            // 创建一个新的 Blob 对象，用于存储文本内容
            const blob = new Blob([text], { type: 'text/plain' })

            // 创建一个 <a> 元素
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)

            // 设置文件名
            a.download = filename

            // 模拟点击下载链接
            a.click()

            // 释放 URL 对象
            URL.revokeObjectURL(a.href)
        },
        saveAs() {
            this.show.saveOptions = true
        },
        confirmSaveAs(prop) {
            let saveContent = ''
            if (prop === 'md') {
                try {
                    saveContent = this.$refs.editor.saveMarkdown()
                    this.downloadTxtFile(saveContent, `notebook.${prop}`)
                } catch (e) {
                    this.$barWarning(
                        this.local('Export Markdown Failed, Please Check Your Content.'),
                        {
                            status: 'warning'
                        }
                    )
                }
            } else if (prop === 'html') {
                saveContent = this.$refs.editor.editor().getHTML()
                this.downloadTxtFile(saveContent, `notebook.${prop}`)
            } else {
                let json = this.$refs.editor.editor().getJSON()
                saveContent = this.wrapCotent(json)
                this.downloadTxtFile(saveContent, `notebook.${prop}`)
            }
        },
        saveMarkdown() {
            let saveContent = this.$refs.editor.saveMarkdown()
            this.downloadTxtFile(saveContent, 'note.md')
        },
        base64ToBlob(base64, mimeType) {
            // 去掉base64的头部信息
            let byteCharacters = atob(base64.split(',')[1])

            let byteArrays = []
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                let slice = byteCharacters.slice(offset, offset + 512)

                let byteNumbers = new Array(slice.length)
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i)
                }

                let byteArray = new Uint8Array(byteNumbers)
                byteArrays.push(byteArray)
            }

            return new Blob(byteArrays, { type: mimeType })
        },
        // imgIntercept () {},
        async imgIntercept({ getImage, interceptImage, showStatus, updateStatus, updateImage }) {
            if (this.imgInterceptTool) {
                await this.imgInterceptTool({
                    getImage,
                    interceptImage,
                    showStatus,
                    updateStatus,
                    updateImage,
                    isRemote: this.isRemote,
                    base64ToBlob: this.base64ToBlob
                })
            }
        },
        editorSetContentChange() {
            this.reviseEditor({
                id: this.editorId,
                storeContent: this.getEditor().editor().getJSON(),
                realtimeContent: this.getEditor().editor().getJSON()
            })
            this.$refs.editor_nav.getEditorNavList()
            this.$nextTick(() => {
                setTimeout(() => {
                    if (this.scrollTop) this.scrollToTop(this.scrollTop)
                    else this.scrollToTop(0)
                }, 300)
            })
        },
        editorContentChange() {
            if (this.collabApplyingRemote) {
                this.$refs.editor_nav.getEditorNavList()
                return
            }
            this.timerInit() // 重新初始化自动保存
            this.diffContent() // 比较内容是否有变化
            this.$refs.editor_nav.getEditorNavList()
        },
        openEditor(item, page) {
            if (!this.openEditorTool) return
            if (!this.lock.loading) return
            this.openEditorTool(item, page, this.getScrollTop)
        },
        openFile(itemid, fileid, type = 'pdf') {
            if (!this.openFileTool) return
            this.openFileTool(itemid, fileid, type)
        },
        previewHistory(item) {
            let contentData = item.content
            try {
                let rawJson = JSON.parse(contentData)
                rawJson = this.formatFAB(rawJson)
                this.currentHistory = rawJson
                console.log(rawJson)
            } catch (e) {
                this.currentHistory = {}
            }
            this.beforeSavingDiff.versionId = this.docInfo.versionId
            this.show.historyPreview = true
        },
        back() {
            if (!this.backTool) return
            this.backTool()
        },
        scrollToTop(top) {
            let editorContent = this.$el.querySelectorAll('.tip-tap-editor-container')[0]
            console.log(editorContent)
            if (!editorContent) return
            editorContent.scrollTop = top
        },
        getScrollTop() {
            let editorContent = this.$el.querySelectorAll('.tip-tap-editor-container')[0]
            if (!editorContent) return 0
            return editorContent.scrollTop ? editorContent.scrollTop : 0
        },
        onMouseWheel(event) {
            if (event.ctrlKey) {
                event.preventDefault()
                if (event.deltaY > 0 && this.fontSize > 12) {
                    this.fontSize -= 1
                } else if (this.fontSize < 72) {
                    this.fontSize = this.fontSize / 1 + 1
                }
            }
        },
        titleBlockTab(event) {
            if (event.keyCode === 9) {
                event.preventDefault()
                event.stopPropagation()
                this.$refs.editor.editor().commands.focus()
                this.$refs.editor.editor().commands.setTextSelection(0)
            }
        },
        chooseBanner() {
            if (this.$refs.input.files.length === 0) return
            let file = this.$refs.input.files[0]
            let reader = new FileReader()
            reader.onload = (e) => {
                this.reviseEditorContent({ id: this.editorId, banner: e.target.result })
                this.$refs.input.value = ''
            }
            reader.readAsDataURL(file)
            this.toggleUnsave(true)
        },
        collaborationSnapshot(content = null) {
            let body = this.collabSession
                ? yXmlFragmentToProsemirrorJSON(this.collabSession.doc.getXmlFragment('default'))
                : content || this.getEditor()?.editor()?.getJSON() || this.editorContent.content
            try {
                return JSON.parse(this.wrapCotent(body, 'fabulous_notebook'))
            } catch {
                return {
                    content: body,
                    title: this.editorContent.title,
                    banner: this.editorContent.banner
                }
            }
        },
        collaborationComparable(snapshot) {
            const cleanContent = (value, inAttrs = false) => {
                if (Array.isArray(value)) return value.map((child) => cleanContent(child))
                if (!value || typeof value !== 'object') return value
                return Object.fromEntries(
                    Object.entries(value)
                        .filter(([key]) => !inAttrs || !['theme', 'headerForeground'].includes(key))
                        .map(([key, child]) => [key, cleanContent(child, key === 'attrs')])
                )
            }
            return {
                title: snapshot?.title ?? '',
                banner: snapshot?.banner ?? '',
                description: snapshot?.description ?? null,
                content: cleanContent(snapshot?.content ?? { type: 'doc', content: [] })
            }
        },
        flushCollaboration(snapshot = this.collaborationSnapshot()) {
            if (!this.collabSession?.flush(snapshot)) return false
            this.collabPendingSnapshot = snapshot
            this.reviseEditor({ id: this.editorId, savePending: true })
            return true
        },
        collaborationSaveFailureMessage() {
            if (this.collabWriteDenied) return this.local('No Write Permission')
            return this.local('Collaboration is not connected. Changes are still waiting to sync.')
        },
        seedCollaborationBaseline(attempt = 0, body = null, session = this.collabSession) {
            if (session !== this.collabSession) return
            const editor = this.getEditor()?.editor?.()
            if (!editor || !session) {
                if (attempt < 30)
                    requestAnimationFrame(() =>
                        this.seedCollaborationBaseline(attempt + 1, body, session)
                    )
                return
            }
            if (body?.type === 'doc') {
                const fragment = session.doc.getXmlFragment('default')
                if (fragment.length === 0) {
                    try {
                        const normalized = editor.schema.nodeFromJSON(body).toJSON()
                        seedYXmlFragmentFromJSON(fragment, normalized)
                    } catch (error) {
                        console.error('[collaboration] Failed to load notebook into Yjs.', error)
                        useCollaborationStore().setStatus(this.editorId, 'error')
                        return
                    }
                }
            }
            const published = session.publishBaseline(this.collaborationSnapshot())
            if (published) this.collabSavedSnapshot = this.collaborationSnapshot()
            useCollaborationStore().setCanWrite(
                this.editorId,
                Boolean(published && session.canWrite)
            )
        },
        startCollaboration() {
            if (!this.collaborationResourceKey) return
            this.collabSavedSnapshot = null
            const resourceType = this.isRemote
                ? this.itemType === 'notebook'
                    ? 'notebook'
                    : 'page'
                : 'local-notebook'
            const session = useCollaborationStore().start(this.editorId, {
                owner: this.collabOwner,
                resourceKey: this.collaborationResourceKey,
                resourceType,
                resourceId: this.isRemote ? this.target.id : this.target.filePath,
                sourceId: this.currentEditor?.dsId,
                targetId: this.target.id,
                user: this.info,
                autoSave: () => this.autoSave,
                getSnapshot: () => this.collaborationSnapshot(),
                onPersisted: () => {
                    if (session !== this.collabSession) return
                    if (
                        this.collabPendingSnapshot === null ||
                        this.collabSession?.hasPendingUpdates
                    )
                        return
                    this.collabSavedSnapshot = this.collabPendingSnapshot
                    this.collabPendingSnapshot = null
                    const changes = Diff.diffJson(
                        this.collaborationComparable(this.collabSavedSnapshot),
                        this.collaborationComparable(this.collaborationSnapshot())
                    )
                    this.toggleUnsave(changes.some((change) => change.added || change.removed))
                },
                onRemoteUpdate: () => {
                    if (session !== this.collabSession) return
                    this.collabApplyingRemote = true
                    this.$nextTick(() => {
                        if (session === this.collabSession) this.collabApplyingRemote = false
                    })
                },
                onSnapshot: (snapshot, meta = {}) => {
                    if (session !== this.collabSession) return
                    if (snapshot == null) {
                        if (meta.needsSeed) {
                            this.$nextTick(() => this.seedCollaborationBaseline(0, null, session))
                        }
                        return
                    }
                    if (typeof snapshot === 'string') {
                        try {
                            snapshot = JSON.parse(snapshot)
                        } catch {
                            return
                        }
                    }
                    if (!snapshot || typeof snapshot !== 'object') return
                    if (
                        (this.isRemote ||
                            (!this.unsave && !this.collabSession?.hasPendingUpdates)) &&
                        (snapshot.fabulous_notebook || 'title' in snapshot || 'banner' in snapshot)
                    ) {
                        this.reviseEditorContent({
                            id: this.editorId,
                            title: snapshot.title,
                            banner: snapshot.banner,
                            description: snapshot.description
                        })
                    }
                    this.collabSavedSnapshot =
                        !this.unsave && !this.collabSession?.hasPendingUpdates
                            ? this.collaborationSnapshot()
                            : snapshot
                    const body = snapshot.fabulous_notebook ? snapshot.content : snapshot
                    if (meta.needsSeed) {
                        this.$nextTick(() =>
                            this.seedCollaborationBaseline(
                                0,
                                body?.type === 'doc' ? body : null,
                                session
                            )
                        )
                    }
                }
            })
            this.customExtensions = [
                pdfNote,
                fileAttachment,
                Collaboration.configure({ document: session.doc }),
                collaborationCaret.configure({ provider: session.provider })
            ]
            this.collabKey += 1
        },
        stopCollaboration() {
            useCollaborationStore().stop(this.editorId, this.collabOwner)
            this.collabApplyingRemote = false
            this.collabPendingSnapshot = null
            this.reviseEditor({ id: this.editorId, savePending: false })
            this.collabSavedSnapshot = null
            this.customExtensions = [pdfNote, fileAttachment]
            this.collabKey += 1
        },
        restartCollaboration() {
            if (this.collabRestartPending) {
                this.collabRestartNeeded = true
                return
            }
            if (!this.visible) {
                this.stopCollaboration()
                this.collabRestartNeeded = true
                return
            }
            this.collabRestartPending = true
            this.collabRestartNeeded = false
            this.stopCollaboration()
            this.$nextTick(() => {
                this.collabRestartPending = false
                if (!this.visible) {
                    this.collabRestartNeeded = true
                    return
                }
                this.startCollaboration()
                this.collabRestartNeeded = false
            })
        }
    },
    beforeUnmount() {
        clearInterval(this.timer.autoSave)
        useCollaborationStore().stop(this.editorId, this.collabOwner)
        if (this.$el) {
            this.$el.removeEventListener('paste', this.handleEditorPaste, true)
            this.$el.removeEventListener('dragenter', this.handleEditorDragOver, true)
            this.$el.removeEventListener('dragover', this.handleEditorDragOver, true)
            this.$el.removeEventListener('drop', this.handleEditorDrop, true)
        }
        window.removeEventListener('keydown', this.shortCutEvent, true)
    },
    activated() {
        this.visible = true
        if (this.collabRestartNeeded || this.collabResourceKey !== this.collaborationResourceKey)
            this.restartCollaboration()
    },
    deactivated() {
        this.visible = false
    }
}
</script>

<style lang="scss">
.fabulous-editor-block {
    position: relative;
    width: 100%;
    height: 100%;
    top: 0px;
    right: 0px;
    flex-shrink: 0;
    background: rgba(250, 250, 250, 1);
    font-family:
        -apple-system,
        BlinkMacSystemFont,
        Segoe UI,
        Roboto,
        Oxygen,
        Ubuntu,
        Cantarell,
        Fira Sans,
        Droid Sans,
        Helvetica Neue,
        sans-serif;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    box-shadow: -10px 3px 8px rgba(0, 0, 0, 0.1);
    transition: background 0.3s;
    overflow: hidden;
    z-index: 2;

    &.dark {
        background: rgba(47, 52, 55, 1);

        .collaboration-permission-status {
            color: rgba(255, 194, 151, 1);
            background: rgba(225, 151, 99, 0.2);
        }

        .main-display-block {
            background: rgba(47, 52, 55, 0.8);
        }
    }

    .control-banner {
        @include Vcenter;

        position: relative;
        min-height: 40px;
        height: 40px;
        padding-top: 40px;
        z-index: 3;

        .control-left-block {
            @include Vcenter;

            flex: 1;
            padding-left: 10px;
        }

        .control-right-block {
            @include Vcenter;

            .collaboration-permission-status {
                padding: 4px 8px;
                border-radius: 6px;
                color: rgba(156, 78, 36, 1);
                background: rgba(225, 151, 99, 0.14);
                font-size: 11px;
                white-space: nowrap;
            }

            .save-btn {
                margin-right: 15px;
            }

            .control-btn:last-child {
                margin-right: 10px;
            }
        }

        .control-btn {
            width: 30px;
            height: 30px;
            margin: 5px;
        }
    }

    .nav-banner {
        position: relative;
        width: 100%;
        height: 40px;
        padding: 0px 5px;
        flex-shrink: 0;

        display: flex;
        align-items: center;
        z-index: 2;

        &.half {
            width: 48%;
        }
    }

    .fabulous-notebook-info-block {
        @include HcenterVcenter;

        position: relative;
        width: 100%;
        height: 50px;
        padding: 0px 5px;
        box-sizing: border-box;
        overflow: hidden;
        z-index: 2;
    }

    .fabulous-notebook-banner-img {
        position: relative;
        width: calc(100% - 30px);
        height: auto;
        margin-left: 15px;
        margin-top: 25px;
        border-radius: 6px;
        transition: all 0.3s;
        z-index: 2;

        &:hover {
            opacity: 0.8;
        }

        &:active {
            opacity: 0.6;
        }
    }

    .fabulous-notebook-title-block {
        @include Hcenter;

        position: relative;
        width: 100%;
        padding: 15px;
        font-size: 24px;
        font-weight: 600;
        box-sizing: border-box;

        &.dark {
            color: whitesmoke;
        }

        .fabulous-notebook-title {
            &.dark {
                color: whitesmoke;
            }
        }
    }

    .main-display-block {
        @include Vend;

        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 1);
        overflow: hidden;
        z-index: 1;

        .pdf-viewer {
            position: relative;
            width: 100%;
            height: calc(100% - 80px);
            flex: 1;
            border-left: rgba(120, 120, 120, 0.1) solid thin;
        }
    }

    .loading-block {
        @include HcenterVcenter;

        position: relative;
        width: 100%;
        height: calc(100% - 40px);
        flex: 1;
    }

    .bottom-control {
        @include HendVcenter;

        position: absolute;
        right: 0px;
        bottom: 0px;
        width: 100%;
        height: 35px;
        background: rgba(245, 245, 245, 0.6);
        font-size: 12px;
        transition: all 0.3s;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        z-index: 2;

        &.dark {
            background: rgba(36, 36, 36, 0.6);
            color: whitesmoke;
        }

        &.close {
            width: 25px;
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
            overflow: hidden;
        }

        * {
            @include Vcenter;
        }

        .trigger {
            height: 100%;
            padding: 5px;
            box-sizing: border-box;

            &:hover {
                background: rgba(200, 200, 200, 0.1);
            }

            &:active {
                background: rgba(200, 200, 200, 0.3);
            }
        }

        .right-block {
            @include Vcenter;
        }
    }

    .ProseMirror {
        * {
            line-height: 2;
        }
    }

    .fab-collab-cursor {
        position: relative;
        border-left: 2px solid;
        margin-left: -1px;
        margin-right: -1px;
        pointer-events: none;
    }

    .fab-collab-cursor-label {
        position: absolute;
        z-index: 5;
        top: -1.4em;
        left: -1px;
        padding: 1px 5px;
        border-radius: 3px 3px 3px 0;
        color: #fff;
        font-size: 11px;
        font-weight: 500;
        line-height: 1.5;
        white-space: nowrap;
        user-select: none;
    }
}

@media screen and (max-width: 1024px) {
    .fabulous-editor-block {
        .control-banner {
            padding-top: 35px;
        }
    }
}
</style>
