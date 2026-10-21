import { Node, mergeAttributes, VueNodeViewRenderer } from '@creatorsn/powereditor3'
import FileAttachment from '../source/fileAttachment.vue'
import { createFileAttachmentUploads } from '@/js/fileAttachment/fileAttachmentUpload'
import { useFileResourcesStore } from '@/stores/editorStore/fileResources'

function uploads(extension) {
    if (!extension.storage.uploads) {
        extension.storage.uploads = createFileAttachmentUploads({
            editor: extension.editor,
            getResource: () => extension.storage.getResource?.(),
            upload: (...args) => useFileResourcesStore().upload(...args)
        })
    }
    return extension.storage.uploads
}

export default Node.create({
    name: 'fileAttachment',
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,
    addStorage() {
        return { getResource: null, uploads: null }
    },
    addAttributes() {
        return {
            fileId: { default: '' },
            name: { default: '' },
            size: { default: 0 },
            contentType: { default: '' },
            resourceType: { default: '' },
            resourceId: { default: '' },
            uploadId: { default: '' },
            uploadState: { default: 'ready' },
            uploadProgress: { default: 0 },
            uploadError: { default: '' }
        }
    },
    addCommands() {
        return {
            insertFileAttachment: (file, position) => (context) => uploads(this).insert(file, context, position),
            cancelFileAttachmentUpload: (id, position) => (context) => uploads(this).cancel(id, context, position),
            retryFileAttachmentUpload: (id) => (context) => uploads(this).retry(id, context)
        }
    },
    parseHTML() {
        return [{ tag: 'file-attachment' }]
    },
    renderHTML({ HTMLAttributes }) {
        return ['file-attachment', mergeAttributes(HTMLAttributes)]
    },
    addNodeView() {
        return VueNodeViewRenderer(FileAttachment)
    }
})
