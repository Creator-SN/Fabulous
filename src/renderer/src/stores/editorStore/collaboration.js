import { markRaw } from 'vue'
import { defineStore } from 'pinia'
import { getProxy } from '@/stores/proxyHolder'
import { createCollaborationSession } from '@/js/collaboration/session.js'

const createEditorState = () => ({
    owner: null,
    session: null,
    resourceKey: null,
    status: 'disconnected',
    canWrite: false,
    writeDenied: false,
    users: []
})

export const useCollaborationStore = defineStore('collaboration', {
    state: () => ({ editors: {} }),
    actions: {
        ensure(editorId) {
            if (!this.editors[editorId]) this.editors[editorId] = createEditorState()
            return this.editors[editorId]
        },
        resourceKey(editorId, editor, isRemote) {
            const target = editor?.target
            if (
                (isRemote && !localStorage.getItem('ApiToken')) ||
                (!isRemote && !target?.filePath?.toLowerCase().endsWith('.fbn')) ||
                !target?.id ||
                !['notebook', 'item'].includes(editor?.type)
            ) return null
            return `${editorId}:${editor.dsId || ''}:${editor.type}:${target.id}`
        },
        isReady(editorId, resourceKey) {
            const state = this.editors[editorId]
            return state?.resourceKey === resourceKey && state.status === 'connected' && state.canWrite
        },
        setStatus(editorId, status) {
            const state = this.ensure(editorId)
            state.status = status
            if (status === 'read-only' || status === 'permission-denied') state.writeDenied = true
            else if (status === 'connected') state.writeDenied = false
        },
        setCanWrite(editorId, canWrite) {
            this.ensure(editorId).canWrite = canWrite
        },
        start(editorId, options) {
            this.stop(editorId)
            const state = this.ensure(editorId)
            state.owner = options.owner
            state.resourceKey = options.resourceKey
            let session = null
            let permissionCheckPending = false
            let permissionChecked = false
            const isCurrent = () => session && this.editors[editorId]?.session === session
            session = createCollaborationSession({
                resourceType: options.resourceType,
                resourceId: options.resourceId,
                user: options.user,
                autoSave: options.autoSave,
                getSnapshot: () => isCurrent() ? options.getSnapshot() : null,
                onSnapshot: (snapshot, meta) => {
                    if (isCurrent()) options.onSnapshot?.(snapshot, meta, session)
                },
                onRemoteUpdate: () => {
                    if (isCurrent()) options.onRemoteUpdate?.(session)
                },
                onPersisted: () => {
                    if (isCurrent()) options.onPersisted?.(session)
                },
                onUsers: (users) => {
                    if (isCurrent()) state.users = users.filter((user) => user.id !== options.user?.id)
                },
                onWritePermission: (canWrite, needsSeed) => {
                    if (isCurrent()) state.canWrite = canWrite && !needsSeed
                },
                onStatus: (status, detail) => {
                    if (session && !isCurrent()) return
                    this.setStatus(editorId, status)
                    if (
                        status !== 'disconnected' || !detail?.beforeSync ||
                        options.resourceType !== 'notebook' || permissionCheckPending || permissionChecked
                    ) return
                    permissionCheckPending = true
                    getProxy().$api.NotebookController.getMyNotebookPermission(
                        options.sourceId,
                        options.targetId
                    ).then((res) => {
                        if (!isCurrent() || state.status === 'connected') return
                        if (res?.code === 40300 ||
                            (res?.code === 200 && res.data?.permissionCode?.charAt(1) === '0')) {
                            session.setPermissionDenied()
                        } else if (res?.code === 200) {
                            permissionChecked = true
                        }
                    }).catch((error) => {
                        console.error('[collaboration] Permission check failed.', error)
                    }).finally(() => {
                        permissionCheckPending = false
                    })
                }
            })
            state.session = markRaw(session)
            return session
        },
        stop(editorId, owner = null) {
            const state = this.ensure(editorId)
            if (owner && state.owner !== owner) return
            state.session?.destroy()
            Object.assign(state, createEditorState())
        }
    }
})
