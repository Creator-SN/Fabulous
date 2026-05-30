import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getProxy } from '@/stores/proxyHolder'

function getLocalApi() {
    return globalThis?.api || globalThis?.window?.api || null
}

function encodePath(targetPath) {
    return encodeURIComponent(targetPath.replace(/\\/g, '/'))
}

function normalizePath(targetPath) {
    return (targetPath || '').replace(/\\/g, '/')
}

function getBaseName(targetPath) {
    const normalizedPath = normalizePath(targetPath)
    const pathList = normalizedPath.split('/')
    return pathList[pathList.length - 1] || ''
}

function createError(message, code = 500) {
    return {
        code,
        status: 'error',
        message
    }
}

export const useLocalNotebookConfig = defineStore('localNotebookConfig', () => {
    const proxy = getProxy()

    const currentRootPath = ref('')
    const currentWatchPath = ref('')
    const releaseWatch = ref(null)

    const lock = ref({
        directoryChildren: {},
        searchDirectories: true,
        searchNotebooks: true,
        documentRead: true,
        documentWrite: true,
        createDocument: true,
        createDirectory: true,
        renameEntry: true,
        removeEntry: true,
        copyEntry: true,
        moveEntry: true,
        chooseDirectory: true,
        chooseFile: true
    })

    function warningMessage(message) {
        if (!message) return
        proxy.$barWarning(message, {
            status: 'warning'
        })
    }

    async function withLock(key, task, fallback = { code: 423, message: 'locked' }) {
        if (!lock.value[key]) return fallback
        lock.value[key] = false
        try {
            return await task()
        } catch (error) {
            warningMessage(error?.message)
            return createError(error?.message || 'operation failed')
        } finally {
            lock.value[key] = true
        }
    }

    async function withMapLock(bucket, lockKey, task, fallback = { code: 423, data: [] }) {
        if (!lockKey) return { code: 400, data: [] }
        if (lock.value[bucket][lockKey] === false) return fallback
        lock.value[bucket][lockKey] = false
        try {
            return await task()
        } catch (error) {
            warningMessage(error?.message)
            return createError(error?.message || 'operation failed')
        } finally {
            lock.value[bucket][lockKey] = true
        }
    }

    function formatEntry(entry) {
        return {
            ...entry,
            id: entry.id || encodePath(entry.filePath)
        }
    }

    function setRootPath(targetPath) {
        currentRootPath.value = targetPath || ''
    }

    async function chooseLocalDirectory() {
        return await withLock('chooseDirectory', async () => {
            const api = getLocalApi()
            if (!api?.chooseLocalDirectory) {
                warningMessage('local directory picker unavailable')
                return createError('local directory picker unavailable')
            }
            const data = await api.chooseLocalDirectory()
            if (!data) return { code: 204, data: null }
            currentRootPath.value = data
            return {
                code: 200,
                status: 'success',
                data
            }
        }, { code: 423, data: null })
    }

    async function chooseLocalFile() {
        return await withLock('chooseFile', async () => {
            const api = getLocalApi()
            if (!api?.chooseLocalFile) {
                warningMessage('local file picker unavailable')
                return createError('local file picker unavailable')
            }
            const data = await api.chooseLocalFile()
            if (!data) return { code: 204, data: null }
            return {
                code: 200,
                status: 'success',
                data: normalizePath(data)
            }
        }, { code: 423, data: null })
    }

    async function listLocalDirectoryChildren(directoryPath) {
        return await withMapLock('directoryChildren', directoryPath, async () => {
            const api = getLocalApi()
            if (!api?.listLocalDirectoryChildren) {
                warningMessage('local directory reader unavailable')
                return createError('local directory reader unavailable')
            }
            const data = await api.listLocalDirectoryChildren(directoryPath)
            return {
                code: 200,
                status: 'success',
                data: (data || []).map(formatEntry)
            }
        })
    }

    async function searchLocalDirectories(directoryPath, keyword) {
        return await withLock('searchDirectories', async () => {
            const api = getLocalApi()
            if (!api?.searchLocalDirectories) {
                warningMessage('local directory search unavailable')
                return createError('local directory search unavailable')
            }
            const data = await api.searchLocalDirectories(directoryPath, keyword)
            return {
                code: 200,
                status: 'success',
                data: (data || []).map(formatEntry)
            }
        }, { code: 423, data: [] })
    }

    async function searchLocalNotebooks(directoryPath, keyword, top = 8) {
        return await withLock('searchNotebooks', async () => {
            const api = getLocalApi()
            if (!api?.searchLocalNotebooks) {
                warningMessage('local notebook search unavailable')
                return createError('local notebook search unavailable')
            }
            const data = await api.searchLocalNotebooks(directoryPath, keyword, top)
            return {
                code: 200,
                status: 'success',
                data: (data || []).map(formatEntry)
            }
        }, { code: 423, data: [] })
    }

    async function getDocument(_, filePath) {
        return await withLock('documentRead', async () => {
            const api = getLocalApi()
            if (!api?.readLocalFile) {
                warningMessage('local file reader unavailable')
                return createError('local file reader unavailable')
            }
            const content = await api.readLocalFile(filePath)
            return {
                code: 200,
                status: 'success',
                data: {
                    id: encodePath(filePath),
                    versionId: 0,
                    content
                }
            }
        })
    }

    async function updateDocument(_, filePath, versionId, content) {
        return await withLock('documentWrite', async () => {
            const api = getLocalApi()
            if (!api?.writeLocalFile) {
                warningMessage('local file writer unavailable')
                return createError('local file writer unavailable')
            }
            await api.writeLocalFile(filePath, content)
            return {
                code: 200,
                status: 'success',
                data: {
                    versionId
                }
            }
        })
    }

    async function createDocument(_, filePath, content) {
        return await withLock('createDocument', async () => {
            const api = getLocalApi()
            if (!api?.writeLocalFile) {
                warningMessage('local file writer unavailable')
                return createError('local file writer unavailable')
            }
            await api.writeLocalFile(filePath, content)
            return {
                code: 200,
                status: 'success',
                data: encodePath(filePath)
            }
        })
    }

    async function createDirectory(_, directoryPath) {
        return await withLock('createDirectory', async () => {
            const api = getLocalApi()
            if (!api?.createLocalDirectory) {
                warningMessage('local directory creator unavailable')
                return createError('local directory creator unavailable')
            }
            await api.createLocalDirectory(directoryPath)
            return {
                code: 200,
                status: 'success',
                data: encodePath(directoryPath)
            }
        })
    }

    async function updateDocumentInfo(_, filePath, payload) {
        return await renameEntry(filePath, payload?.name)
    }

    async function updateDirectoryInfo(_, directoryPath, payload) {
        return await renameEntry(directoryPath, payload?.name)
    }

    async function renameEntry(entryPath, nextName) {
        return await withLock('renameEntry', async () => {
            const api = getLocalApi()
            if (!api?.renameLocalEntry) {
                warningMessage('local rename unavailable')
                return createError('local rename unavailable')
            }
            const currentName = getBaseName(entryPath)
            const targetName = (nextName || '').trim()
            if (!targetName) {
                return createError('invalid name', 400)
            }
            if (currentName === targetName) {
                return {
                    code: 200,
                    status: 'success',
                    data: normalizePath(entryPath)
                }
            }
            const nextPath = await api.renameLocalEntry(entryPath, nextName)
            return {
                code: 200,
                status: 'success',
                data: nextPath
            }
        })
    }

    async function removeDocument(_, filePath) {
        return await removeEntry(filePath)
    }

    async function removeDirectory(_, directoryPath) {
        return await removeEntry(directoryPath)
    }

    async function removeEntry(entryPath) {
        return await withLock('removeEntry', async () => {
            const api = getLocalApi()
            if (!api?.removeLocalEntry) {
                warningMessage('local remove unavailable')
                return createError('local remove unavailable')
            }
            await api.removeLocalEntry(entryPath)
            return {
                code: 200,
                status: 'success'
            }
        })
    }

    async function copyDirectory(_, sourcePath, targetPath) {
        return await withLock('copyEntry', async () => {
            const api = getLocalApi()
            if (!api?.copyLocalEntry) {
                warningMessage('local copy unavailable')
                return createError('local copy unavailable')
            }
            await api.copyLocalEntry(sourcePath, targetPath)
            return {
                code: 200,
                status: 'success'
            }
        })
    }

    async function moveDirectory(_, sourcePath, targetPath) {
        return await withLock('moveEntry', async () => {
            const api = getLocalApi()
            if (!api?.moveLocalEntry) {
                warningMessage('local move unavailable')
                return createError('local move unavailable')
            }
            await api.moveLocalEntry(sourcePath, targetPath)
            return {
                code: 200,
                status: 'success'
            }
        })
    }

    async function openFile(_, targetPath) {
        const api = getLocalApi()
        if (!api?.openLocalPath) {
            warningMessage('local open unavailable')
            return createError('local open unavailable')
        }
        await api.openLocalPath(targetPath)
        return {
            code: 200,
            status: 'success'
        }
    }

    async function watchDirectory(directoryPath, callback) {
        const api = getLocalApi()
        if (!api?.watchLocalDirectory || !api?.onLocalDirectoryChange) {
            warningMessage('local watcher unavailable')
            return createError('local watcher unavailable')
        }
        if (releaseWatch.value) {
            releaseWatch.value()
            releaseWatch.value = null
        }
        if (currentWatchPath.value) {
            await api.unwatchLocalDirectory?.(currentWatchPath.value)
        }
        await api.watchLocalDirectory(directoryPath)
        currentWatchPath.value = directoryPath
        releaseWatch.value = api.onLocalDirectoryChange((payload) => {
            if (!payload?.watchRoot) return
            if (payload.watchRoot !== directoryPath.replace(/\\/g, '/')) return
            callback?.(payload)
        })
        return {
            code: 200,
            status: 'success'
        }
    }

    async function stopWatchDirectory() {
        const api = getLocalApi()
        if (releaseWatch.value) {
            releaseWatch.value()
            releaseWatch.value = null
        }
        if (currentWatchPath.value && api?.unwatchLocalDirectory) {
            await api.unwatchLocalDirectory(currentWatchPath.value)
        }
        currentWatchPath.value = ''
    }

    return {
        lock,
        currentRootPath,
        currentWatchPath,
        setRootPath,
        chooseLocalDirectory,
        chooseLocalFile,
        listLocalDirectoryChildren,
        searchLocalDirectories,
        searchLocalNotebooks,
        getDocument,
        updateDocument,
        createDocument,
        createDirectory,
        updateDocumentInfo,
        updateDirectoryInfo,
        removeDocument,
        removeDirectory,
        copyDirectory,
        moveDirectory,
        openFile,
        watchDirectory,
        stopWatchDirectory
    }
})
