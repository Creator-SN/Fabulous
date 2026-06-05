import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import pdfNote from '../source/pdfNote.vue';

export default Node.create({
    name: 'pdfNote',

    group: 'block',

    content: "block+",

    addAttributes() {
        return {
            value: {
                default: ''
            },
            guid: {
                default: ''
            },
            dsid: {
                default: ''
            },
            itemid: {
                default: ''
            },
            pdfid: {
                default: ''
            },
            pos: {
                default: {
                    left: 0,
                    top: 0,
                    canvasIndex: 0
                }
            },
            anchor: {
                default: {
                    pages: []
                }
            },
            content: {
                default: ""
            },
            theme: {
                default: 'light',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'pdf-note',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['pdf-note', mergeAttributes(HTMLAttributes), 0];
    },

    addNodeView() {
        return VueNodeViewRenderer(pdfNote);
    },
});
