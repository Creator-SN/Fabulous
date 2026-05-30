import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getProxy } from '@/stores/proxyHolder'

export const useNotebookConfig = defineStore('notebookConfig', () => {
    const proxy = getProxy()

    const lock = ref({
        directoryChildren: {},
        permissionGroups: true,
        directoryPermissionRead: {},
        notebookPermissionRead: {},
        directoryPermissionWrite: {},
        notebookPermissionWrite: {},
        createDocument: true,
        createDirectory: true,
        updateDocumentInfo: true,
        updateDirectoryInfo: true,
        documentRead: true,
        directoryRead: true,
        documentWrite: true,
        removeDocument: true,
        removeDirectory: true,
        copyDirectory: true,
        moveDirectory: true,
        searchNotebooksRead: true,
        notebookPathRead: true,
    })

    function warningMessage(message) {
        if (!message) return
        proxy.$barWarning(message, {
            status: 'warning'
        })
    }

    function errorMessage(message) {
        if (!message) return
        proxy.$barWarning(message, {
            status: 'error'
        })
    }

    async function withLock(key, task) {
        if (!lock.value[key]) return { code: 423, message: 'locked' }
        lock.value[key] = false
        try {
            return await task()
        } finally {
            lock.value[key] = true
        }
    }

    async function withMapLock(bucket, lockKey, task) {
        if (!lockKey) return { code: 400, message: 'invalid lock key' }
        if (lock.value[bucket][lockKey] === false) {
            return { code: 423, message: 'locked' }
        }
        lock.value[bucket][lockKey] = false
        try {
            return await task()
        } finally {
            lock.value[bucket][lockKey] = true
        }
    }

    async function withDirectoryChildrenLock(pathId, task) {
        if (!pathId) return { code: 400, data: [] }
        if (lock.value.directoryChildren[pathId] === false) {
            return { code: 423, data: [] }
        }
        lock.value.directoryChildren[pathId] = false
        try {
            return await task()
        } finally {
            lock.value.directoryChildren[pathId] = true
        }
    }

    function handleResponse(res) {
        if (res?.code !== 200 && res?.status !== 'success') {
            warningMessage(res?.message)
        }
        return res
    }

    function handleError(err) {
        errorMessage(err?.message)
        return err
    }

    function isPathPermissionNotFound(err) {
        return err?.code === 400 && err?.message === 'path permission not found'
    }

    function buildPermissionLockKey(uri, groupId, targetId) {
        return `${uri}:${groupId}:${targetId}`
    }

    function getNotebookController(isRemote = true) {
        return isRemote ? proxy.$api.NotebookController : proxy.$local_api.NotebookController
    }

    async function listRemoteDirectoryChildren(pathId) {
        return await withDirectoryChildrenLock(pathId, async () => {
            return await proxy.$api.NotebookController.getDirectoryChildren(pathId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function getRemoteDirectory(pathId) {
        if (!pathId) return { code: 400, data: null }
        return await withLock('directoryRead', async () => {
            return await proxy.$api.NotebookController.getDirectory(pathId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function listRemotePermissionGroups(uri) {
        if (!uri) return { code: 400, data: [] }
        return await withLock('permissionGroups', async () => {
            return await proxy.$api.ConfigController.listSourcePermissionGroups(uri)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function listMyRemotePermissionGroups(uri) {
        if (!uri) return { code: 400, data: [] }
        return await withLock('permissionGroups', async () => {
            return await proxy.$api.ConfigController.listMySourcePermissionGroups(uri)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function listVisibleRemotePermissionGroups(uri, isOwner = true) {
        if (isOwner) return await listRemotePermissionGroups(uri)
        return await listMyRemotePermissionGroups(uri)
    }

    async function getRemoteDirectoryPermission(uri, groupId, directoryId, silentNotFound = false) {
        let lockKey = buildPermissionLockKey(uri, groupId, directoryId)
        return await withMapLock('directoryPermissionRead', lockKey, async () => {
            return await proxy.$api.NotebookController.getSourcePermissionGroupDirectoryPermission(
                uri,
                groupId,
                directoryId
            )
                .then((res) => {
                    if (silentNotFound && isPathPermissionNotFound(res)) return res
                    return handleResponse(res)
                })
                .catch((err) => {
                    if (silentNotFound && isPathPermissionNotFound(err)) return err
                    return handleError(err)
                })
        })
    }

    async function createRemoteDirectoryPermission(
        uri,
        groupId,
        directoryId,
        payload,
        cascade = false
    ) {
        let lockKey = buildPermissionLockKey(uri, groupId, directoryId)
        return await withMapLock('directoryPermissionWrite', lockKey, async () => {
            return await proxy.$api.NotebookController.createSourcePermissionGroupDirectoryPermission(
                uri,
                groupId,
                directoryId,
                {
                    ...payload,
                    cascade
                }
            )
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function updateRemoteDirectoryPermission(
        uri,
        groupId,
        directoryId,
        payload,
        cascade = false
    ) {
        let lockKey = buildPermissionLockKey(uri, groupId, directoryId)
        return await withMapLock('directoryPermissionWrite', lockKey, async () => {
            return await proxy.$api.NotebookController.updateSourcePermissionGroupDirectoryPermission(
                uri,
                groupId,
                directoryId,
                {
                    ...payload,
                    cascade
                }
            )
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function removeRemoteDirectoryPermission(uri, groupId, directoryId, cascade = false) {
        let lockKey = buildPermissionLockKey(uri, groupId, directoryId)
        return await withMapLock('directoryPermissionWrite', lockKey, async () => {
            return await proxy.$api.NotebookController.removeSourcePermissionGroupDirectoryPermission(
                uri,
                groupId,
                directoryId,
                cascade
            )
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function getRemoteNotebookPermission(uri, groupId, notebookId, silentNotFound = false) {
        let lockKey = buildPermissionLockKey(uri, groupId, notebookId)
        return await withMapLock('notebookPermissionRead', lockKey, async () => {
            return await proxy.$api.NotebookController.getSourcePermissionGroupNotebookPermission(
                uri,
                groupId,
                notebookId
            )
                .then((res) => {
                    if (silentNotFound && isPathPermissionNotFound(res)) return res
                    return handleResponse(res)
                })
                .catch((err) => {
                    if (silentNotFound && isPathPermissionNotFound(err)) return err
                    return handleError(err)
                })
        })
    }

    async function getMyRemoteDirectoryPermission(uri, directoryId, silentNotFound = false) {
        let lockKey = `${uri}:my:${directoryId}`
        return await withMapLock('directoryPermissionRead', lockKey, async () => {
            return await proxy.$api.NotebookController.getMyDirectoryPermission(uri, directoryId)
                .then((res) => {
                    if (silentNotFound && isPathPermissionNotFound(res)) return res
                    return handleResponse(res)
                })
                .catch((err) => {
                    if (silentNotFound && isPathPermissionNotFound(err)) return err
                    return handleError(err)
                })
        })
    }

    async function getMyRemoteNotebookPermission(uri, notebookId, silentNotFound = false) {
        let lockKey = `${uri}:my:${notebookId}`
        return await withMapLock('notebookPermissionRead', lockKey, async () => {
            return await proxy.$api.NotebookController.getMyNotebookPermission(uri, notebookId)
                .then((res) => {
                    if (silentNotFound && isPathPermissionNotFound(res)) return res
                    return handleResponse(res)
                })
                .catch((err) => {
                    if (silentNotFound && isPathPermissionNotFound(err)) return err
                    return handleError(err)
                })
        })
    }

    async function getVisibleRemoteDirectoryPermission(
        uri,
        groupId,
        directoryId,
        isOwner = true,
        silentNotFound = false
    ) {
        if (isOwner) {
            return await getRemoteDirectoryPermission(
                uri,
                groupId,
                directoryId,
                silentNotFound
            )
        }
        return await getMyRemoteDirectoryPermission(uri, directoryId, silentNotFound)
    }

    async function getVisibleRemoteNotebookPermission(
        uri,
        groupId,
        notebookId,
        isOwner = true,
        silentNotFound = false
    ) {
        if (isOwner) {
            return await getRemoteNotebookPermission(uri, groupId, notebookId, silentNotFound)
        }
        return await getMyRemoteNotebookPermission(uri, notebookId, silentNotFound)
    }

    async function createRemoteNotebookPermission(uri, groupId, notebookId, payload) {
        let lockKey = buildPermissionLockKey(uri, groupId, notebookId)
        return await withMapLock('notebookPermissionWrite', lockKey, async () => {
            return await proxy.$api.NotebookController.createSourcePermissionGroupNotebookPermission(
                uri,
                groupId,
                notebookId,
                payload
            )
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function updateRemoteNotebookPermission(uri, groupId, notebookId, payload) {
        let lockKey = buildPermissionLockKey(uri, groupId, notebookId)
        return await withMapLock('notebookPermissionWrite', lockKey, async () => {
            return await proxy.$api.NotebookController.updateSourcePermissionGroupNotebookPermission(
                uri,
                groupId,
                notebookId,
                payload
            )
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function removeRemoteNotebookPermission(uri, groupId, notebookId) {
        let lockKey = buildPermissionLockKey(uri, groupId, notebookId)
        return await withMapLock('notebookPermissionWrite', lockKey, async () => {
            return await proxy.$api.NotebookController.removeSourcePermissionGroupNotebookPermission(
                uri,
                groupId,
                notebookId
            )
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function createRemoteDocument(uri, filepath, body) {
        return await withLock('createDocument', async () => {
            return await proxy.$api.NotebookController.createDocument(uri, filepath, body)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function createRemoteDirectory(uri, filepath) {
        return await withLock('createDirectory', async () => {
            return await proxy.$api.NotebookController.createDirectory(uri, filepath)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function updateRemoteDocumentInfo(uri, filepath, payload) {
        return await withLock('updateDocumentInfo', async () => {
            return await proxy.$api.NotebookController.updateDocumentInfo(uri, filepath, payload)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function updateRemoteDirectoryInfo(uri, filepath, payload) {
        return await withLock('updateDirectoryInfo', async () => {
            return await proxy.$api.NotebookController.updateDirectoryInfo(uri, filepath, payload)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function removeRemoteDocument(uri, filepath) {
        return await withLock('removeDocument', async () => {
            return await proxy.$api.NotebookController.removeDocument(uri, filepath)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function removeRemoteDirectory(uri, filepath) {
        return await withLock('removeDirectory', async () => {
            return await proxy.$api.NotebookController.removeDirectory(uri, filepath)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function copyRemoteDirectory(uri, filepath, newpath) {
        return await withLock('copyDirectory', async () => {
            return await proxy.$api.NotebookController.copyDirectory(uri, filepath, newpath)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function moveRemoteDirectory(uri, filepath, newpath) {
        return await withLock('moveDirectory', async () => {
            return await proxy.$api.NotebookController.moveDirectory(uri, filepath, newpath)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function getDocument(uri, filepath, isRemote = true) {
        return await withLock('documentRead', async () => {
            return await getNotebookController(isRemote).getDocument(uri, filepath)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function updateDocument(uri, filepath, versionId, content, isRemote = true) {
        return await withLock('documentWrite', async () => {
            return await getNotebookController(isRemote).updateDocument(
                uri,
                filepath,
                versionId,
                content
            )
                .then((res) => handleResponse(res))
                .catch((err) => Promise.reject(err))
        })
    }

    async function transferIdsToNames(filepath, isRemote = true) {
        if (!isRemote) return { code: 200, status: 'success', data: filepath }
        return await proxy.$api.NotebookController.transferIdsToNames(filepath)
            .then((res) => handleResponse(res))
            .catch((err) => handleError(err))
    }

    async function searchRemoteNotebooks(uri, query, top = 20) {
        if (!uri || !query) return { code: 200, data: [] }
        return await withLock('searchNotebooksRead', async () => {
            return await proxy.$api.NotebookController.searchNotebooks(uri, query, top)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        }, { code: 423, data: [] })
    }

    async function getRemoteNotebookPath(notebookId) {
        if (!notebookId) return { code: 400, data: null }
        return await withLock('notebookPathRead', async () => {
            return await proxy.$api.NotebookController.getNotebookPath(notebookId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        }, { code: 423, data: null })
    }

    return {
        lock,
        listRemoteDirectoryChildren,
        getRemoteDirectory,
        listRemotePermissionGroups,
        listMyRemotePermissionGroups,
        listVisibleRemotePermissionGroups,
        getRemoteDirectoryPermission,
        getVisibleRemoteDirectoryPermission,
        createRemoteDirectoryPermission,
        updateRemoteDirectoryPermission,
        removeRemoteDirectoryPermission,
        getRemoteNotebookPermission,
        getVisibleRemoteNotebookPermission,
        getMyRemoteDirectoryPermission,
        getMyRemoteNotebookPermission,
        createRemoteNotebookPermission,
        updateRemoteNotebookPermission,
        removeRemoteNotebookPermission,
        createRemoteDocument,
        createRemoteDirectory,
        updateRemoteDocumentInfo,
        updateRemoteDirectoryInfo,
        removeRemoteDocument,
        removeRemoteDirectory,
        copyRemoteDirectory,
        moveRemoteDirectory,
        getDocument,
        updateDocument,
        transferIdsToNames,
        searchRemoteNotebooks,
        getRemoteNotebookPath
    }
})
