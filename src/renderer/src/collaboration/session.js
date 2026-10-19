import { Y, Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from '@creatorsn/powereditor3/collaboration'
import { markRaw } from 'vue'

const REMOTE_ORIGIN = 'fab-collaboration-remote'
const REMOTE_AWARENESS_ORIGIN = 'fab-collaboration-awareness-remote'
const CURSOR_COLORS = ['#C239B3', '#0078D4', '#498205', '#CA5010', '#5C2D91', '#008272', '#D13438', '#8764B8']

function encode(update) {
    let binary = ''
    update.forEach((byte) => (binary += String.fromCharCode(byte)))
    return btoa(binary)
}

function decode(value) {
    const binary = atob(value)
    return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

function getCursorColor(userId = '') {
    let hash = 0
    for (const character of userId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
    return CURSOR_COLORS[hash % CURSOR_COLORS.length]
}

export function createCollaborationSession({
    resourceType,
    resourceId,
    user,
    autoSave,
    getSnapshot,
    onSnapshot,
    onUsers,
    onStatus,
    onRemoteUpdate,
    onWritePermission,
    onPersisted
}) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
    const endpoint = new URL(
        `${apiBase.replace(/\/$/, '')}/collaboration/ws/${resourceType}/${encodeURIComponent(resourceId)}`,
        window.location.origin
    )
    endpoint.protocol = endpoint.protocol === 'https:' ? 'wss:' : 'ws:'
    endpoint.searchParams.set('token', localStorage.getItem('ApiToken') || '')
    const isLocal = resourceType === 'local-notebook'

    const doc = markRaw(new Y.Doc())
    const awareness = markRaw(new Awareness(doc))
    const provider = markRaw({ awareness })
    const queuedUpdates = []
    const inFlightUpdates = new Map()
    const inFlightSnapshots = new Map()
    let updateSequence = 0
    let socket = null
    let reconnectTimer = null
    let canWrite = false
    let ready = false
    let disposed = false
    let presenceUsers = []
    let publishedAwarenessState = null
    let localSeeded = false

    const createUpdateEntry = (update, submitted = false) => ({
        id: `${doc.clientID.toString(36)}-${++updateSequence}`,
        update,
        submitted
    })

    awareness.setLocalStateField('user', {
        name: user?.nickname || user?.name || user?.id || 'Collaborator',
        color: getCursorColor(user?.id)
    })

    const currentSnapshot = () => getSnapshot?.()

    const sendUpdate = (entry, snapshot, baseline = false) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            queuedUpdates.push(entry)
            return false
        }
        entry.submitted = true
        inFlightUpdates.set(entry.id, entry)
        socket.send(JSON.stringify({
            type: 'update',
            updateId: entry.id,
            update: encode(entry.update),
            snapshot,
            baseline: isLocal ? baseline : undefined,
            stateVector: encode(Y.encodeStateVector(doc))
        }))
        return true
    }

    const sendSnapshotMessage = (message) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return
        const refreshed = autoSave()
            ? { ...message, snapshot: currentSnapshot(), stateVector: encode(Y.encodeStateVector(doc)) }
            : message
        if (refreshed.snapshotId) inFlightSnapshots.set(refreshed.snapshotId, refreshed)
        socket.send(JSON.stringify(refreshed))
    }

    const retrySubmittedUpdates = () => {
        if (!ready || !canWrite || !socket || socket.readyState !== WebSocket.OPEN) return
        const retries = queuedUpdates.filter((entry) => entry.submitted)
        for (const entry of retries) {
            const index = queuedUpdates.indexOf(entry)
            if (index >= 0) queuedUpdates.splice(index, 1)
            sendUpdate(entry, currentSnapshot())
        }
        for (const message of inFlightSnapshots.values()) sendSnapshotMessage(message)
    }

    const flushQueued = () => {
        if (!ready || !canWrite || !autoSave() || !socket || socket.readyState !== WebSocket.OPEN) return
        const snapshot = currentSnapshot()
        const drafts = queuedUpdates.filter((entry) => !entry.submitted)
        for (const entry of drafts) {
            const index = queuedUpdates.indexOf(entry)
            if (index >= 0) queuedUpdates.splice(index, 1)
            sendUpdate(entry, snapshot)
        }
    }

    const sendAwareness = () => {
        if (!ready || !socket || socket.readyState !== WebSocket.OPEN) return
        const state = awareness.getLocalState()
        if (!state) return
        publishedAwarenessState = JSON.parse(JSON.stringify(state))
        socket.send(JSON.stringify({
            type: 'awareness',
            update: encode(encodeAwarenessUpdate(awareness, [doc.clientID]))
        }))
    }

    const refreshPublishedAwareness = () => {
        if (autoSave() || !publishedAwarenessState || !ready || !socket || socket.readyState !== WebSocket.OPEN) return
        const state = awareness.getLocalState()
        if (!state) return
        // Advance the local clock while keeping the last submitted cursor position.
        awareness.setLocalState(state)
        const published = { states: new Map([[doc.clientID, publishedAwarenessState]]), meta: awareness.meta }
        socket.send(JSON.stringify({
            type: 'awareness',
            update: encode(encodeAwarenessUpdate(published, [doc.clientID]))
        }))
    }

    awareness.on('update', ({ added, updated, removed }, origin) => {
        if (disposed || origin !== 'local' || !autoSave()) return
        if ([...added, ...updated, ...removed].includes(doc.clientID)) sendAwareness()
    })

    const awarenessRefreshTimer = setInterval(refreshPublishedAwareness, 10000)

    doc.on('update', (update, origin) => {
        if (disposed || origin === REMOTE_ORIGIN) return
        const entry = createUpdateEntry(update)
        if (!ready) {
            queuedUpdates.push(entry)
            return
        }
        if (!canWrite) return
        if (!autoSave()) {
            queuedUpdates.push(entry)
            return
        }
        sendUpdate(entry, currentSnapshot())
    })

    const handleMessage = (event) => {
        let message
        try {
            message = JSON.parse(event.data)
        } catch {
            return
        }
        if (message.type === 'ack') {
            if (message.updateId) inFlightUpdates.delete(message.updateId)
            if (message.snapshotId) inFlightSnapshots.delete(message.snapshotId)
            if (!queuedUpdates.length && !inFlightUpdates.size && !inFlightSnapshots.size) onPersisted?.()
        } else if (message.type === 'sync') {
            canWrite = Boolean(message.canWrite)
            if ((message.updates || []).length) onRemoteUpdate?.()
            for (const update of message.updates || []) Y.applyUpdate(doc, decode(update), REMOTE_ORIGIN)
            ready = true
            if (message.snapshot || message.needsSeed) onSnapshot?.(message.snapshot ?? null, { remote: true, needsSeed: message.needsSeed })
            onWritePermission?.(canWrite, Boolean(message.needsSeed))
            onStatus?.('connected')
            retrySubmittedUpdates()
            if (!message.needsSeed) flushQueued()
            if (autoSave()) sendAwareness()
            else refreshPublishedAwareness()
        } else if (message.type === 'update') {
            onRemoteUpdate?.()
            Y.applyUpdate(doc, decode(message.update), REMOTE_ORIGIN)
            if (message.snapshot) onSnapshot?.(message.snapshot, { remote: true, update: true })
        } else if (message.type === 'snapshot') {
            if (message.snapshot) onSnapshot?.(message.snapshot, { remote: true })
        } else if (message.type === 'presence') {
            presenceUsers = message.users || []
            onUsers?.(presenceUsers)
        } else if (message.type === 'presence-join') {
            presenceUsers = [...presenceUsers.filter((item) => item.id !== message.user.id), message.user]
            onUsers?.(presenceUsers)
        } else if (message.type === 'presence-leave') {
            presenceUsers = presenceUsers.filter((item) => item.id !== message.user.id)
            onUsers?.(presenceUsers)
        } else if (message.type === 'awareness') {
            try {
                applyAwarenessUpdate(awareness, decode(message.update), REMOTE_AWARENESS_ORIGIN)
            } catch (error) {
                console.warn('[collaboration] Ignored invalid awareness update.', error)
            }
        } else if (message.type === 'awareness-sync') {
            if (autoSave()) sendAwareness()
            else refreshPublishedAwareness()
        } else if (message.type === 'snapshot-request') {
            if (ready && canWrite && socket?.readyState === WebSocket.OPEN) {
                if (inFlightSnapshots.size) {
                    for (const pending of inFlightSnapshots.values()) sendSnapshotMessage(pending)
                } else if (autoSave()) {
                    sendSnapshotMessage({ type: 'snapshot' })
                }
            }
        }
    }

    const connect = () => {
        if (disposed) return
        onStatus?.('connecting')
        if (isLocal && localSeeded) endpoint.searchParams.set('seeded', '1')
        const currentSocket = new WebSocket(endpoint)
        socket = currentSocket
        currentSocket.addEventListener('message', handleMessage)
        currentSocket.addEventListener('close', () => {
            if (socket !== currentSocket || disposed) return
            ready = false
            canWrite = false
            queuedUpdates.unshift(...inFlightUpdates.values())
            inFlightUpdates.clear()
            onWritePermission?.(false, false)
            presenceUsers = []
            onUsers?.(presenceUsers)
            onStatus?.('disconnected')
            reconnectTimer = setTimeout(connect, 2000)
        })
        currentSocket.addEventListener('error', () => onStatus?.('error'))
    }

    connect()

    return {
        doc,
        provider,
        get canWrite() {
            return canWrite
        },
        get users() {
            return presenceUsers
        },
        get hasPendingUpdates() {
            return queuedUpdates.length > 0 || inFlightUpdates.size > 0 || inFlightSnapshots.size > 0
        },
        publishBaseline(snapshot = currentSnapshot()) {
            if (!ready || !canWrite || !socket || socket.readyState !== WebSocket.OPEN) return false
            const update = Y.encodeStateAsUpdate(doc)
            queuedUpdates.length = 0
            inFlightUpdates.clear()
            const published = sendUpdate(createUpdateEntry(update), snapshot, true)
            if (published && isLocal) localSeeded = true
            return published
        },
        flush(snapshot = currentSnapshot()) {
            if (!ready || !canWrite || !socket || socket.readyState !== WebSocket.OPEN) return false
            while (queuedUpdates.length) sendUpdate(queuedUpdates.shift(), snapshot)
            // The new full snapshot supersedes any older unacknowledged snapshot.
            inFlightSnapshots.clear()
            const snapshotId = `${doc.clientID.toString(36)}-s-${++updateSequence}`
            const snapshotMessage = {
                type: 'snapshot',
                snapshotId,
                snapshot,
                stateVector: encode(Y.encodeStateVector(doc))
            }
            inFlightSnapshots.set(snapshotId, snapshotMessage)
            sendSnapshotMessage(snapshotMessage)
            sendAwareness()
            return true
        },
        syncAwarenessMode() {
            if (autoSave()) sendAwareness()
        },
        destroy() {
            disposed = true
            clearTimeout(reconnectTimer)
            clearInterval(awarenessRefreshTimer)
            socket?.close()
            awareness.destroy()
            doc.destroy()
        }
    }
}
