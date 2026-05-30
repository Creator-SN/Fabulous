<template>
    <node-view-wrapper
        class="power-editor-pdf-note-container"
        :class="[{ dark: node.attrs.theme === 'dark' }]"
    >
        <span
            class="power-editor-pdf-note-label"
            contenteditable="false"
            :title="'PDF Clip:' + node.attrs.content"
            @click="handleClick"
        >
            <span class="pdf-icon-wrap">
                <fv-progress-ring
                    v-if="!lock.loading"
                    :loading="true"
                    :r="8"
                    :border-width="2"
                    :color="'rgba(249, 108, 122, 1)'"
                    :background="'transparent'"
                ></fv-progress-ring>
                <img v-else :src="img.barePdf" alt="pdf" />
            </span>
            <i class="label-name">{{ itemInfo?.name || 'PDF Note' }}</i>
            <i class="ms-Icon ms-Icon--Forward" style="transform: scale(0.6)"></i>
        </span>
        <node-view-content class="power-editor-pdf-note-content" ref="content" />
    </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'

import barePdf from '@/assets/home/bare_pdf.svg'

export default {
    name: 'drawingBlock',

    components: {
        NodeViewWrapper,
        NodeViewContent
    },

    props: {
        // the editor instance
        editor: {
            type: Object
        },

        // the current node
        node: {
            type: Object
        },

        // an array of decorations
        decorations: {
            type: Array
        },

        // `true` when there is a `NodeSelection` at the current node view
        selected: {
            type: Boolean
        },

        // access to the node extension, for example to get options
        extension: {
            type: Object
        },

        // get the document position of the current node
        getPos: {
            type: Function
        },

        // update attributes of the current node
        updateAttributes: {
            type: Function
        },

        // delete the current node
        deleteNode: {
            type: Function
        }
    },

    data() {
        return {
            itemInfo: null,
            img: {
                barePdf
            },
            lock: {
                loading: true
            }
        }
    },

    computed: {
        pdfContainer() {
            return this.editor.storage.defaultStorage?.pdfNote?.getContainer()
        }
    },
    mounted() {
        this.getItemInfo()
    },
    methods: {
        getItemInfo() {
            if (!this.lock.loading) return
            this.lock.loading = false
            this.$api.AcademicController.getItem(this.node.attrs.dsid, this.node.attrs.itemid)
                .then((res) => {
                    this.itemInfo = res.data
                })
                .catch((e) => {
                    console.log(e)
                })
                .finally(() => {
                    this.lock.loading = true
                })
        },
        handleClick() {
            const openFunc = this.editor.storage.defaultStorage.pdfNote?.displayPDF
            if (openFunc) {
                openFunc(this.node.attrs.itemid, this.node.attrs.pdfid)
            }

            this.tryScrollToTop(this.node.attrs.pos)
        },
        tryScrollToTop(pos) {
            try {
                let container = this.pdfContainer
                let pdfItem = container ? container.querySelectorAll('.pdf-item') : []
                if (!container) return
                if (pdfItem.length < pos.canvasIndex - 1) return
                pdfItem = pdfItem[pos.canvasIndex - 1]
                const { top } = pdfItem.getBoundingClientRect()
                const { top: containerTop } = container.getBoundingClientRect()
                let offset = pos.top.toFixed(2) * pdfItem.clientHeight
                container.scrollTop = container.scrollTop + top + offset - containerTop - 75
            } catch (e) {
                console.log(e)
            }
        }
    }
}
</script>

<style lang="scss">
.power-editor-pdf-note-container {
    position: relative;
    background: rgba(255, 255, 255, 0);
    border: 1px solid rgba(200, 200, 200, 0);
    border-radius: 0.5rem;
    margin: 1rem 0;
    transition: all 0.3s;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        padding: 1.5px;
        border-radius: inherit;
        background: linear-gradient(
            120deg,
            rgba(255, 105, 117, 1),
            rgba(220, 62, 72, 1),
            #8b5cf6,
            #7c3cff
        );
        background-size: 300% 300%;
        animation: border-flow 3s ease both;
        z-index: -1;

        -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
        mask-composite: exclude;
    }

    @keyframes border-flow {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    &.dark {
        .power-editor-pdf-note-content {
            border: 1px dashed rgba(200, 200, 200, 0.2);

            &:hover {
                border-color: rgba(200, 200, 200, 0.6);
            }
        }
    }

    .power-editor-pdf-note-label {
        @include Vcenter;

        position: absolute;
        top: -3px;
        right: 0px;
        max-width: calc(100% - 50px);
        margin-right: 16px;
        padding: 5px 12px;
        gap: 5px;
        background: linear-gradient(90deg, rgba(255, 105, 117, 1) 0%, rgba(220, 62, 72, 1) 100%);
        font-size: 0.6rem;
        letter-spacing: 1px;
        font-weight: bold;
        text-transform: uppercase;
        color: #fff;
        border-radius: 0 0 8px 8px;
        transition: all 0.6s;
        user-select: none;
        transition:
            width 0.24s ease-out,
            background-position 0.28s ease-out,
            filter 0.28s ease-out,
            transform 0.28s ease-out,
            box-shadow 0.28s ease-out;
        z-index: 2;

        &:hover {
            background-position: 100% 50%;
            filter: brightness(1.08) saturate(1.08);
        }

        &:active {
            filter: brightness(1.02) saturate(1.04);
            box-shadow:
                0 2px 8px rgba(220, 62, 72, 0.28),
                0 0 0 1px rgba(255, 120, 132, 0.24) inset;
        }

        .pdf-icon-wrap {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
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
                width: 12px;
                height: 12px;
                object-fit: contain;
            }
        }

        .label-name {
            @include nowrap;

            flex: 1;
            font-style: normal;
            transition: width 0.24s ease-out;
        }
    }

    .power-editor-pdf-note-content {
        margin: 35px 10px 10px 10px;
        padding: 8px;
        border: 1px dashed rgba(120, 120, 120, 0.2);
        border-radius: 8px;
        transition: all 0.6s;
        cursor: text;

        &:hover {
            border-color: rgba(120, 120, 120, 0.3);
        }
    }
}
</style>
