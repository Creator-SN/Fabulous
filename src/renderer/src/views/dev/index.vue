<template>
    <div class="dev-power-editor-page" :class="[{ dark: theme === 'dark' }]">
        <section class="debug-shell">
            <header class="debug-header">
                <div>
                    <p class="eyebrow">PowerEditor Debug</p>
                    <h1>PowerEditor / pdfNote 调试页</h1>
                    <p class="description">
                        这里用于单独调试 `power-editor`，并已接入 `pdfNote` 扩展。
                    </p>
                </div>
                <div class="header-actions">
                    <fv-button :theme="theme" border-radius="8" @click="resetDemoContent">
                        重置示例内容
                    </fv-button>
                    <fv-button
                        :theme="theme"
                        border-radius="8"
                        background="rgba(220, 62, 72, 1)"
                        foreground="#fff"
                        @click="insertPdfNote"
                    >
                        插入 pdfNote
                    </fv-button>
                    <fv-button :theme="theme" border-radius="8" @click="captureJson">
                        刷新 JSON
                    </fv-button>
                </div>
            </header>

            <div class="debug-content">
                <section class="editor-panel">
                    <power-editor
                        ref="editor"
                        :model-value="editorContent"
                        :theme="theme"
                        :language="language"
                        :placeholder="'Write something for debug...'"
                        :extensions="customExtensions"
                        :mobileDisplayWidth="0"
                        :toolbarHeight="120"
                        :editablePaddingTop="132"
                        :readOnlyPaddingTop="84"
                        :editorBackground="
                            theme === 'dark'
                                ? 'rgba(47, 52, 55, 0.92)'
                                : 'rgba(255, 255, 255, 0.96)'
                        "
                        :editorOutSideBackground="
                            theme === 'dark' ? 'rgba(29, 33, 36, 1)' : 'rgba(243, 244, 246, 1)'
                        "
                        style="position: relative; width: 100%; height: 100%"
                        @content-change="captureJson"
                    />
                </section>

                <aside class="side-panel">
                    <div class="status-card">
                        <p class="card-title">pdfNote 状态</p>
                        <p class="status-line">
                            当前点击:
                            <span>{{ pdfState.lastOpen || '尚未触发' }}</span>
                        </p>
                        <p class="status-line">
                            滚动定位:
                            <span>{{ pdfState.lastScroll || '尚未触发' }}</span>
                        </p>
                    </div>

                    <div class="status-card">
                        <p class="card-title">模拟 PDF 容器</p>
                        <div ref="pdfContainer" class="mock-pdf-container">
                            <div v-for="page in 6" :key="page" class="pdf-item">
                                <span>Page {{ page }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="status-card json-card">
                        <p class="card-title">当前 JSON</p>
                        <pre>{{ jsonPreview }}</pre>
                    </div>
                </aside>
            </div>
        </section>
    </div>
</template>

<script>
import { mapState } from 'pinia'
import { useTheme } from '@/stores/theme'
import { useDataStore } from '@/stores/data'
import pdfNote from '@/components/general/editorCustom/extension/pdfNote.js'

const createDemoDoc = () => ({
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [
                {
                    type: 'text',
                    text: '这是一个独立的 PowerEditor 调试页，可以直接测试普通编辑和 pdfNote 节点。'
                }
            ]
        },
        {
            type: 'bulletList',
            content: [
                {
                    type: 'listItem',
                    content: [
                        {
                            type: 'paragraph',
                            content: [{ type: 'text', text: '验证工具栏和内容变更事件' }]
                        }
                    ]
                },
                {
                    type: 'listItem',
                    content: [
                        {
                            type: 'paragraph',
                            content: [{ type: 'text', text: '点击按钮插入 pdfNote 扩展节点' }]
                        }
                    ]
                },
                {
                    type: 'listItem',
                    content: [
                        {
                            type: 'paragraph',
                            content: [{ type: 'text', text: '右侧模拟 PDF 容器用于测试滚动定位' }]
                        }
                    ]
                }
            ]
        }
    ]
})

export default {
    name: 'DevPowerEditorPage',
    data() {
        return {
            customExtensions: [pdfNote],
            editorContent: createDemoDoc(),
            jsonPreview: '',
            pdfState: {
                lastOpen: '',
                lastScroll: ''
            }
        }
    },
    computed: {
        ...mapState(useTheme, {
            theme: (state) => state.theme
        }),
        ...mapState(useDataStore, {
            language: (state) => state.configState.language
        })
    },
    mounted() {
        this.$nextTick(() => {
            this.initPdfNoteStorage()
            this.captureJson()
        })
    },
    methods: {
        getPowerEditor() {
            return this.$refs.editor
        },
        getTipTapEditor() {
            return this.getPowerEditor()?.editor?.() || null
        },
        initPdfNoteStorage() {
            const editor = this.getTipTapEditor()
            if (!editor) return
            editor.storage.defaultStorage.pdfNote = {
                getContainer: () => this.$refs.pdfContainer || null,
                displayPDF: (itemid, pdfid) => {
                    this.pdfState.lastOpen = `${itemid || 'unknown-item'} / ${pdfid || 'unknown-pdf'}`
                }
            }
        },
        resetDemoContent() {
            this.editorContent = createDemoDoc()
            this.pdfState.lastOpen = ''
            this.pdfState.lastScroll = ''
            this.$nextTick(() => {
                this.initPdfNoteStorage()
                this.captureJson()
            })
        },
        captureJson() {
            const editor = this.getTipTapEditor()
            if (!editor) {
                this.jsonPreview = JSON.stringify(this.editorContent, null, 2)
                return
            }
            this.jsonPreview = JSON.stringify(editor.getJSON(), null, 2)
        },
        insertPdfNote() {
            const editor = this.getTipTapEditor()
            if (!editor) return
            const pageIndex = Math.floor(Math.random() * 6) + 1
            editor
                .chain()
                .focus()
                .insertContent({
                    type: 'pdfNote',
                    attrs: {
                        guid: this.$Guid(),
                        dsid: 'debug-dsid',
                        itemid: 'debug-item',
                        pdfid: 'debug-pdf',
                        pos: {
                            left: 0.12,
                            top: 0.18 * pageIndex,
                            canvasIndex: pageIndex
                        },
                        anchor: {
                            pages: [pageIndex]
                        },
                        content: `Debug clip on page ${pageIndex}`,
                        theme: this.theme
                    },
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: `这是第 ${pageIndex} 页的 pdfNote 调试内容。`
                                }
                            ]
                        }
                    ]
                })
                .run()

            this.pdfState.lastScroll = `准备跳转到第 ${pageIndex} 页`
            this.captureJson()
        }
    },
    watch: {
        theme() {
            const editor = this.getTipTapEditor()
            if (!editor) return
            this.captureJson()
        }
    }
}
</script>

<style lang="scss">
.dev-power-editor-page {
    position: relative;
    width: 100%;
    min-height: 100%;
    padding: 24px;
    box-sizing: border-box;
    background: radial-gradient(circle at top left, rgba(255, 105, 117, 0.16), transparent 30%),
        radial-gradient(circle at top right, rgba(91, 141, 239, 0.14), transparent 28%),
        linear-gradient(180deg, rgba(248, 249, 251, 1) 0%, rgba(238, 241, 245, 1) 100%);

    &.dark {
        background: radial-gradient(circle at top left, rgba(255, 105, 117, 0.18), transparent 30%),
            radial-gradient(circle at top right, rgba(91, 141, 239, 0.16), transparent 28%),
            linear-gradient(180deg, rgba(27, 31, 35, 1) 0%, rgba(18, 20, 24, 1) 100%);

        .debug-shell,
        .status-card {
            background: rgba(36, 40, 45, 0.92);
            border-color: rgba(255, 255, 255, 0.08);
            color: rgba(245, 247, 250, 0.92);
        }

        .description,
        .status-line,
        .mock-pdf-container .pdf-item {
            color: rgba(220, 223, 228, 0.84);
        }

        .json-card pre {
            background: rgba(20, 22, 25, 0.92);
            color: rgba(238, 242, 247, 0.94);
        }
    }

    .debug-shell {
        width: 100%;
        min-height: calc(100vh - 48px);
        padding: 20px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 24px;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.82);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        box-shadow:
            0 24px 60px rgba(15, 23, 42, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
    }

    .debug-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;

        h1 {
            margin: 4px 0 8px;
            font-size: 28px;
        }

        .eyebrow {
            margin: 0;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: rgba(220, 62, 72, 1);
        }

        .description {
            margin: 0;
            color: rgba(71, 85, 105, 0.9);
        }
    }

    .header-actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 10px;
    }

    .debug-content {
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.9fr);
        gap: 18px;
        min-height: calc(100vh - 180px);
    }

    .editor-panel,
    .side-panel {
        min-height: 0;
    }

    .editor-panel {
        overflow: hidden;
        border-radius: 20px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
    }

    .side-panel {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .status-card {
        padding: 16px;
        border-radius: 18px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        background: rgba(255, 255, 255, 0.88);
        box-sizing: border-box;
    }

    .card-title {
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 700;
    }

    .status-line {
        margin: 0;
        line-height: 1.7;
        color: rgba(71, 85, 105, 0.9);

        span {
            color: inherit;
            font-weight: 600;
        }
    }

    .mock-pdf-container {
        height: 260px;
        overflow: auto;
        padding: 10px;
        border-radius: 14px;
        background: linear-gradient(180deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%);
        border: 1px solid rgba(148, 163, 184, 0.16);
        box-sizing: border-box;

        .pdf-item {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 180px;
            margin-bottom: 12px;
            border-radius: 12px;
            color: rgba(71, 85, 105, 0.9);
            background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(235, 239, 244, 1));
            border: 1px solid rgba(148, 163, 184, 0.16);
            box-shadow: 0 8px 20px rgba(148, 163, 184, 0.12);
        }

        .pdf-item:last-child {
            margin-bottom: 0;
        }
    }

    .json-card {
        flex: 1;
        min-height: 0;

        pre {
            margin: 0;
            height: 100%;
            min-height: 260px;
            max-height: 420px;
            overflow: auto;
            padding: 14px;
            border-radius: 14px;
            box-sizing: border-box;
            background: rgba(248, 250, 252, 0.95);
            color: rgba(15, 23, 42, 0.94);
            font-size: 12px;
            line-height: 1.6;
        }
    }
}

@media screen and (max-width: 1080px) {
    .dev-power-editor-page {
        padding: 16px;

        .debug-header {
            flex-direction: column;
        }

        .header-actions {
            width: 100%;
            justify-content: flex-start;
        }

        .debug-content {
            grid-template-columns: 1fr;
        }

        .editor-panel {
            min-height: 560px;
        }
    }
}
</style>
