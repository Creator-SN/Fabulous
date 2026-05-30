<template>
    <div v-if="currentEditor" class="academic-view">
        <editor-block
            v-show="displayMode !== 'pdf'"
            ref="editor_block"
            :visible="displayMode !== 'pdf'"
            :editor-id="editorId"
            :readonly="readonly"
            :refreshContentTool="refreshContentTool"
            :imgInterceptTool="imgInterceptTool"
            :openEditorTool="openEditorTool"
            :saveConfirmTool="saveConfirmTool"
            :openFileTool="openFileTool"
            :breadcrumbTool="breadcrumbTool"
            :backTool="backTool"
            :isRemote="isRemote"
            :mentionItemAttr="editorMentionItemAttr"
            :style="{ width: `${displayMode === 'both' ? splitRatio * 100 + '%' : ''}` }"
            @container-scroll="$emit('container-scroll', $event)"
        >
            <template #control-left>
                <fv-button
                    v-if="item"
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    ref="itemNavTrigger"
                    @click="show.currentItemNav ^= true"
                >
                    <i
                        class="ms-Icon"
                        :class="[
                            show.currentItemNav ? 'ms-Icon--ChevronUp' : 'ms-Icon--ChevronDown'
                        ]"
                    ></i>
                </fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    @click="readonly = readonly == true ? false : true"
                    ><i
                        class="ms-Icon"
                        :class="[`ms-Icon--${readonly === true ? 'Edit' : 'ReadingMode'}`]"
                    ></i
                ></fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    @click="expandContentModel = expandContentModel == true ? false : true"
                    ><i
                        class="ms-Icon"
                        :class="[
                            `ms-Icon--${
                                expandContentModel === true
                                    ? 'StaplingPortraitBookBinding'
                                    : 'StaplingLandscapeTwoTop'
                            }`
                        ]"
                    ></i
                ></fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    :background="editorShowNavModel ? 'rgba(140, 148, 228, 1)' : ''"
                    :foreground="editorShowNavModel ? '#fff' : ''"
                    class="control-btn"
                    @click="editorShowNavModel = editorShowNavModel ? false : true"
                >
                    <i class="ms-Icon ms-Icon--ButtonMenu"></i>
                </fv-button>
                <fv-toggle-switch
                    :title="local('Auto Save')"
                    v-model="autoSaveModel"
                    class="save-btn"
                    width="85"
                    height="30"
                    :on="local('Auto Save')"
                    :off="local('Auto Save')"
                    :onForeground="theme === 'dark' ? '#fff' : '#000'"
                    :offForeground="theme === 'dark' ? '#fff' : '#000'"
                    :switch-on-background="theme === 'dark' ? '#000' : 'rgba(140, 148, 228, 1)'"
                    :insideContent="true"
                    style="margin-left: 5px"
                >
                </fv-toggle-switch>
                <fv-button
                    v-show="unsave"
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    background="rgba(0, 204, 153, 1)"
                    style="width: 10px; height: 10px; margin-left: 15px"
                >
                    {{ '' }}
                </fv-button>
                <button
                    v-if="isItemPDF"
                    :class="[
                        'control-btn',
                        'pdf-entry-btn',
                        { 'pdf-entry-btn--animating': pdfBtnAnimating }
                    ]"
                    type="button"
                    :title="local('Open PDF')"
                    @animationend="handlePdfBtnAnimationEnd"
                    @click="displayCurrentItemPDF"
                >
                    <span class="pdf-icon-wrap">
                        <img :src="img.barePdf" alt="pdf" />
                    </span>
                    <span class="label">{{ local('PDF') }}</span>
                </button>
            </template>
        </editor-block>
        <split-bar
            v-show="displayMode === 'both'"
            :model-value="splitRatio"
            @change-ratio="splitViewRatio"
            @only-left="splitViewRatio(0.5, 'left')"
            @only-right="splitViewRatio(0.5, 'right')"
            :style="{ left: `${splitRatio * 100}%` }"
        ></split-bar>
        <!-- PDF拥有一个自己的id, 但是目前访问PDF时, 后端实际需要的是项目ID -->
        <pdf-viewer
            v-if="displayMode !== 'note' && displayPDF"
            v-model="displayPDF"
            :editor-id="editorId"
            :theme="theme"
            ref="pdf_viewer"
            :disabledEditor="displayMode === 'pdf'"
            class="pdf-viewer"
            :style="{ width: `${displayMode === 'both' ? (1 - splitRatio) * 100 + '%' : ''}%` }"
            @open-with-browser="externalPDF"
            @choose-selection="addPDFNote"
        >
            <template #tool-extra="{ controlBtnClass }">
                <fv-button
                    :class="[controlBtnClass]"
                    :theme="theme"
                    :borderRadius="8"
                    @click="displayModeModel = displayMode === 'pdf' ? 'both' : 'pdf'"
                >
                    <i
                        class="ms-Icon"
                        :class="[
                            `ms-Icon--${displayMode === 'pdf' ? 'BackToWindow' : 'FullScreen'}`
                        ]"
                    ></i>
                </fv-button>
                <fv-button
                    :class="[controlBtnClass]"
                    :theme="theme"
                    :borderRadius="8"
                    @click="displayModeModel = 'note'"
                >
                    <i class="ms-Icon ms-Icon--Cancel"></i>
                </fv-button>
            </template>
        </pdf-viewer>
        <item-nav
            v-model="show.currentItemNav"
            :editor-id="editorId"
            :trigger="$refs.itemNavTrigger ? $refs.itemNavTrigger.$el : null"
            :getScrollTop="getScrollTop"
            @add-item-page="show.addItemPage = true"
        ></item-nav>
        <add-item-page
            v-if="item && item.id"
            v-model:show="show.addItemPage"
            :editor-id="editorId"
            :item="item"
        ></add-item-page>
        <user-card v-model:show="show.userCard" :model-value="currentMentionUser"></user-card>
    </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'

const proxy = getCurrentInstance().proxy

defineExpose({
    getScrollTop: (...args) => proxy.getScrollTop(...args),
    scrollToTop: (...args) => proxy.scrollToTop(...args)
})
</script>

<script>
import { mapActions, mapState } from 'pinia'
import { useTheme } from '@/stores/theme'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import editorBlock from '@/components/general/editorContainer/editorBlock.vue'
import splitBar from '@/components/general/editorContainer/splitBar.vue'
import pdfViewer from '@/components/general/pdfViewer/index.vue'
import editorMention from '@/components/general/editorContainer/editorMention.js'

import itemNav from '@/components/academic/itemNav.vue'
import addItemPage from '@/components/home/addItemPage.vue'
import barePdf from '@/assets/home/bare_pdf.svg'

export default {
    name: 'EditorContainer',
    mixins: [editorMention],
    components: {
        editorBlock,
        splitBar,
        pdfViewer,
        itemNav,
        addItemPage
    },
    props: {
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
        editorId: {
            type: String,
            required: true
        },
        isRemote: {
            default: true,
            type: Boolean
        }
    },
    data() {
        return {
            splitRatio: 0.5,
            readonly: false,
            show: {
                currentItemNav: false,
                addItemPage: false
            },
            displayMentionItem: null,
            pdfBtnAnimating: true,
            img: {
                barePdf
            }
        }
    },
    watch: {
        isItemPDF(val) {
            if (!val) return
            this.pdfBtnAnimating = false
            this.$nextTick(() => {
                this.pdfBtnAnimating = true
            })
        },
        item() {
            if (this.item?.pdf) this.displayMentionItem = null
        }
    },
    computed: {
        ...mapState(useTheme, {
            theme: (state) => state.theme
        }),
        ...mapState(useAppConfig, {
            local: (state) => state.local,
            editorMap: (state) => state.editor
        }),
        ...mapState(useDataStore, {
            autoSave: (state) => state.configState.autoSave,
            editorExpandContent: (state) => state.configState.editorExpandContent,
            editorShowNav: (state) => state.configState.editorShowNav,
            currentDataPath: (state) => state.currentDataPath
        }),
        currentEditor() {
            return this.editorMap?.[this.editorId] || null
        },
        displayMode() {
            return this.currentEditor?.displayMode || 'note'
        },
        editorDsId() {
            return this.currentEditor?.dsId || null
        },
        item() {
            return this.currentEditor?.item || null
        },
        type() {
            return this.currentEditor?.type || null
        },
        target() {
            return this.currentEditor?.target || null
        },
        unsave() {
            return this.currentEditor?.unsave || false
        },
        expandContentModel: {
            get() {
                return this.editorExpandContent
            },
            set(value) {
                this.reviseConfig({
                    editorExpandContent: value
                })
            }
        },
        editorShowNavModel: {
            get() {
                return this.editorShowNav
            },
            set(value) {
                this.reviseConfig({
                    editorShowNav: value
                })
            }
        },
        autoSaveModel: {
            get() {
                return this.autoSave
            },
            set(value) {
                this.reviseConfig({
                    autoSave: value
                })
            }
        },
        displayModeModel: {
            get() {
                return this.displayMode
            },
            set(value) {
                this.reviseEditor({
                    id: this.editorId,
                    displayMode: value
                })
            }
        },
        isItemPDF() {
            if (this.type !== 'item') return false
            if (!this.item) return false
            if (!this.item.pdf) return false
            return true
        },
        displayPDF() {
            if (!this.displayMentionItem) {
                if (!this.item.pdf) return null
                return this.item.id
            }
            if (!this.displayMentionItem.pdf) return null
            return this.displayMentionItem.id
        }
    },
    mounted() {
        this.pdfNoteStorageInit()
    },
    methods: {
        ...mapActions(useAppConfig, {
            reviseEditor: 'reviseEditor'
        }),
        ...mapActions(useDataStore, {
            reviseConfig: 'reviseConfig'
        }),
        handlePdfBtnAnimationEnd(event) {
            if (event.animationName === 'pdfBtnAutoCollapse') {
                this.pdfBtnAnimating = false
            }
        },
        splitViewRatio(event, bounce = false) {
            if (this.displayMode !== 'both') return
            if (bounce === 'left') {
                this.reviseEditor({
                    id: this.editorId,
                    displayMode: 'note'
                })
                this.splitRatio = event + Math.random() * 0.0001
            } else if (bounce === 'right') {
                this.reviseEditor({
                    id: this.editorId,
                    displayMode: 'pdf'
                })
                this.splitRatio = event + Math.random() * 0.0001
            }
            this.splitRatio = event
        },
        pdfNoteStorageInit() {
            const editor = this.$refs.editor_block.getEditor().editor()
            editor.storage.defaultStorage.pdfNote = {
                getContainer: () => {
                    const pdfViewer = this.$refs.pdf_viewer
                    if (!pdfViewer) return null
                    let container = pdfViewer.getContainer()
                    return container
                },
                displayPDF: (itemid, pdfid) => {
                    this.displayMentionItem = {
                        id: itemid,
                        pdf: pdfid
                    }
                    this.displayModeModel = 'both'
                }
            }
        },
        addPDFNote(event) {
            let { pos, anchor, content } = event
            let inteliInsert = (x) => {
                // 防止光标在pdfNote内部时嵌套添加
                x.editor().commands.focus()
                let selection = x.editor().view.state.selection
                let parentNodeName = selection.$anchor.parent.type.name
                let path = selection.$anchor.path
                let jump = false
                for (let p of path) {
                    if (!p.type) continue
                    let name = p.type.name
                    if (name.indexOf('pdfNote') > -1) {
                        jump = true
                        break
                    }
                }
                if (jump) {
                    while (parentNodeName !== 'doc') {
                        if (selection.$anchorCell != undefined) {
                            x.editor().commands.deleteTable()
                        } else x.editor().commands.selectParentNode()
                        selection = x.editor().view.state.selection
                        parentNodeName = selection.$anchor.parent.type.name
                    }

                    // let pos = selection.$anchor.pos + selection.node.nodeSize;
                    // x.editor().commands.setTextSelection(pos + 1);
                    x.editor().commands.createParagraphNear()
                }
                x.editor()
                    .chain()
                    .insertContent({
                        type: 'pdfNote',
                        attrs: {
                            guid: this.$Guid(),
                            dsid: this.editorDsId,
                            itemid: this.displayMentionItem?.id || this.item.id,
                            pdfid: this.displayMentionItem?.pdf || this.item.pdf,
                            pos: JSON.parse(JSON.stringify(pos)),
                            anchor: JSON.parse(JSON.stringify(anchor)),
                            content: content
                        },
                        content: [
                            {
                                type: 'paragraph'
                            }
                        ]
                    })
                    .run()
            }
            let editor = this.getEditor()
            inteliInsert(editor)
            this.reviseEditor({
                id: this.editorId,
                displayMode: this.displayMode === 'pdf' ? 'both' : this.displayMode
            })
            // this.toggleUnsave(true)
        },
        getEditor() {
            return this.$refs.editor_block.getEditor()
        },
        getScrollTop() {
            let editorContent = this.$el.querySelectorAll('.tip-tap-editor-container')[0]
            return editorContent.scrollTop ? editorContent.scrollTop : 0
        },
        scrollToTop(...args) {
            this.$refs.editor_block.scrollToTop(...args)
        },
        displayCurrentItemPDF() {
            this.displayMentionItem = null
            this.displayModeModel = 'both'
        },
        externalPDF() {
            let itemid = this.item.id
            let fileid = this.item.pdf
            if (this.displayMentionItem) {
                itemid = this.displayMentionItem.id
                fileid = this.displayMentionItem.pdf
            }
            if (!fileid && itemid.indexOf('/') > -1 && itemid.indexOf('.') > -1) {
                fileid = itemid.split('/')[1]
                fileid = fileid.split('.')[0]
                itemid = itemid.split('/')[0]
            }
            this.$api.AcademicController.openItemFile(this.editorDsId, itemid, fileid).then(
                (res) => {
                    const targetUrl = `${this.$server}${res.data.url}`
                    window.open(targetUrl, this.item.name, 'width=1200,height=640')
                }
            )
        }
    }
}
</script>

<style lang="scss">
.academic-view {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;

    .control-banner {
        .pdf-entry-btn {
            position: relative;
            width: 30px;
            min-width: 30px;
            height: 30px;
            margin-left: 5px;
            background: linear-gradient(
                90deg,
                rgba(255, 105, 117, 1) 0%,
                rgba(220, 62, 72, 1) 100%
            );
            background-size: 130% 130%;
            background-position: 0% 50%;
            border: none;
            border-radius: 30px;
            outline: none;
            display: inline-flex;
            align-items: center;
            justify-content: flex-start;
            padding: 0 2px;
            box-sizing: border-box;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 0 0 rgba(220, 62, 72, 0.35);
            transition:
                width 0.24s ease-out,
                background-position 0.28s ease-out,
                filter 0.28s ease-out,
                transform 0.28s ease-out,
                box-shadow 0.28s ease-out;

            &::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: inherit;
                pointer-events: none;
                background: linear-gradient(
                    90deg,
                    rgba(255, 150, 160, 0.34) 0%,
                    rgba(245, 96, 106, 0.28) 100%
                );
                opacity: 0;
                transition: opacity 0.26s ease-out;
            }

            &:hover {
                width: 90px;
                padding-right: 2px;
                background-position: 100% 50%;
                filter: brightness(1.08) saturate(1.08);
                box-shadow:
                    0 4px 14px rgba(220, 62, 72, 0.38),
                    0 0 0 1px rgba(255, 140, 148, 0.28) inset;
            }

            &:hover::before {
                opacity: 1;
            }

            &:active {
                transform: scale(0.985);
                filter: brightness(1.02) saturate(1.04);
                box-shadow:
                    0 2px 8px rgba(220, 62, 72, 0.28),
                    0 0 0 1px rgba(255, 120, 132, 0.24) inset;
            }

            .pdf-icon-wrap {
                width: 26px;
                height: 26px;
                border-radius: 50%;
                background: #fff;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                margin-right: 2px;
                transform: scale(0);
                animation: pdfIconPop 0.26s ease-out 0.02s forwards;

                img {
                    width: 14px;
                    height: 14px;
                    object-fit: contain;
                }
            }

            .label {
                flex: 1;
                font-size: 12px;
                color: #fff;
                font-weight: 600;
                line-height: 1;
                white-space: nowrap;
                transition: opacity 0.2s ease-out;
            }
        }

        .pdf-entry-btn--animating {
            animation:
                pdfBtnAutoExpand 0.45s ease-out 0.28s forwards,
                pdfBtnAutoCollapse 0.38s ease-out 3.28s forwards,
                pdfBtnShadowPulse 0.72s ease-out 0.28s;
        }
    }

    .pdf-viewer {
        position: relative;
        width: 100%;
        height: 100%;
        border-left: rgba(120, 120, 120, 0.1) solid thin;
    }
}

@keyframes pdfIconPop {
    0% {
        transform: scale(0);
    }
    75% {
        transform: scale(1.08);
    }
    100% {
        transform: scale(1);
    }
}

@keyframes pdfBtnAutoExpand {
    0% {
        width: 28px;
        min-width: 28px;
        padding-right: 2px;
    }
    100% {
        width: 90px;
        min-width: 90px;
        padding-right: 2px;
    }
}

@keyframes pdfBtnAutoCollapse {
    0% {
        width: 90px;
        min-width: 90px;
        padding-right: 2px;
    }
    100% {
        width: 28px;
        min-width: 28px;
        padding-right: 2px;
    }
}

@keyframes pdfBtnShadowPulse {
    0% {
        box-shadow: 0 0 0 rgba(220, 62, 72, 0.2);
    }
    45% {
        box-shadow:
            0 6px 16px rgba(220, 62, 72, 0.35),
            0 0 0 1px rgba(255, 170, 176, 0.24) inset;
    }
    100% {
        box-shadow: 0 0 0 rgba(220, 62, 72, 0.15);
    }
}
</style>
