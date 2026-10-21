function uploadId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function findNodes(editor, id) {
    const found = []
    editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'fileAttachment' && node.attrs.uploadId === id) found.push({ node, pos })
    })
    return found
}

// Uploads belong to the editor, rather than a Vue NodeView which can be recreated by Yjs.
export function createFileAttachmentUploads({ editor, getResource, upload }) {
    const jobs = new Map()
    let destroyed = false

    function current(job, controller) {
        const resource = getResource()
        return !destroyed && !editor.isDestroyed && editor.isEditable &&
            jobs.get(job.id) === job && job.controller === controller && !controller.signal.aborted &&
            resource?.type === job.resource.type && resource?.id === job.resource.id
    }

    function update(job, controller, attrs) {
        if (!current(job, controller)) return false
        const found = findNodes(editor, job.id)
        if (!found.length) return false
        const tr = editor.state.tr
        for (const { node, pos } of found) tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs })
        editor.view.dispatch(tr.setMeta('addToHistory', false))
        return true
    }

    function forget(job) {
        job.controller.abort()
        jobs.delete(job.id)
    }

    function prune({ transaction }) {
        if (!transaction.docChanged || !jobs.size) return
        const present = new Set()
        editor.state.doc.descendants((node) => {
            if (node.type.name === 'fileAttachment' && node.attrs.uploadId) present.add(node.attrs.uploadId)
        })
        // A local delete, undo, or remote Yjs deletion cancels the corresponding task too.
        for (const job of jobs.values()) if (!present.has(job.id)) forget(job)
    }

    async function run(job) {
        const controller = job.controller
        if (!current(job, controller) || !findNodes(editor, job.id).length) {
            if (jobs.get(job.id) === job) forget(job)
            return
        }
        let lastStage = ''
        let lastPercent = -1
        let lastUpdate = 0
        try {
            const attachment = await upload(job.resource, job.file, (stage, percent = 0) => {
                const progress = Math.max(0, Math.min(100, Math.round(percent)))
                const now = Date.now()
                if (stage === lastStage && progress === lastPercent) return
                if (stage === lastStage && progress < 100 && now - lastUpdate < 150) return
                lastStage = stage
                lastPercent = progress
                lastUpdate = now
                if (!update(job, controller, { uploadState: stage, uploadProgress: progress, uploadError: '' })) {
                    controller.abort()
                }
            }, { signal: controller.signal })
            if (update(job, controller, {
                fileId: attachment.fileId, name: attachment.name, size: attachment.size,
                contentType: attachment.contentType, uploadId: '', uploadState: 'ready',
                uploadProgress: 100, uploadError: ''
            })) jobs.delete(job.id)
        } catch (error) {
            if (!controller.signal.aborted && error?.name !== 'AbortError') {
                update(job, controller, { uploadState: 'failed', uploadError: error?.message || 'File upload failed' })
            }
        } finally {
            if (jobs.get(job.id) === job && job.controller === controller) {
                job.running = false
                if (controller.signal.aborted) forget(job)
            }
        }
    }

    function insert(file, { commands, dispatch }, position) {
        const resource = getResource()
        if (destroyed || !editor.isEditable || !resource?.type || !resource?.id || !file?.name) return false
        if (!dispatch) return true
        const job = {
            id: uploadId(), file, resource: { ...resource }, controller: new AbortController(), running: true
        }
        jobs.set(job.id, job)
        const content = {
            type: 'fileAttachment',
            attrs: {
                name: file.name, size: file.size, contentType: file.type || '',
                resourceType: resource.type, resourceId: resource.id,
                uploadId: job.id, uploadState: 'hashing', uploadProgress: 0
            }
        }
        const inserted = position == null
            ? commands.insertContent(content)
            : commands.insertContentAt(position, content)
        if (!inserted) {
            forget(job)
            return false
        }
        // Tiptap dispatches a chained command's transaction after the command returns.
        Promise.resolve().then(() => run(job))
        return true
    }

    function cancel(id, { commands, dispatch }, position) {
        if (destroyed || !editor.isEditable) return false
        const matches = findNodes(editor, id)
        const found = position == null ? matches[0] : matches.find(({ pos }) => pos === position)
        if (!found) return false
        if (!dispatch) return true
        const job = jobs.get(id)
        if (job && matches.length === 1) forget(job)
        return commands.deleteRange({ from: found.pos, to: found.pos + found.node.nodeSize })
    }

    function retry(id, { tr, dispatch }) {
        const job = jobs.get(id)
        if (!job || job.running || destroyed || !editor.isEditable) return false
        const found = findNodes(editor, id)
        if (!found.length) return false
        if (!dispatch) return true
        job.controller = new AbortController()
        job.running = true
        for (const { node, pos } of found) {
            tr.setNodeMarkup(pos, undefined, {
                ...node.attrs, uploadState: 'hashing', uploadProgress: 0, uploadError: ''
            })
        }
        tr.setMeta('addToHistory', false)
        Promise.resolve().then(() => run(job))
        return true
    }

    function destroy() {
        if (destroyed) return
        destroyed = true
        editor.off('transaction', prune)
        editor.off('destroy', destroy)
        for (const job of jobs.values()) job.controller.abort()
        jobs.clear()
    }

    editor.on('transaction', prune)
    editor.on('destroy', destroy)
    return { insert, cancel, retry, has: (id) => jobs.has(id), destroy }
}
