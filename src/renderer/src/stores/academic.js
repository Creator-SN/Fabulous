import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getProxy } from '@/stores/proxyHolder'

export const useAcademicConfig = defineStore('academicConfig', () => {
    const proxy = getProxy()

    const lock = ref({
        treeList: true,
        dataSourceInfoRead: true,
        rootGroupsRead: true,
        rootPartitionsRead: true,
        groupsRead: true,
        partitionsRead: true,
        searchPartitionsRead: true,
        createGroup: true,
        createPartition: true,
        updateGroup: true,
        updatePartition: true,
        deleteGroup: true,
        deletePartition: true,
        partitionRead: true,
        itemRead: true,
        itemsRead: true,
        allItemsRead: true,
        itemsCountRead: true,
        allItemsCountRead: true,
        searchItemsRead: true,
        deleteItem: true,
        deleteItems: true,
        addItemsToPartition: true,
        removeItemsFromPartition: true,
        templateRead: true,
        deleteTemplate: true,
        updateItem: true,
        updateItemPage: true,
        duplicateItemPage: true,
        deleteItemPage: true,
        openItemFile: true,
        itemPageContentRead: true,
        templateContentRead: true,
        itemPageContentSave: true,
        templateContentSave: true
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

    async function withLock(key, task, fallback = { code: 423, message: 'locked' }) {
        if (!lock.value[key]) return fallback
        lock.value[key] = false
        try {
            return await task()
        } finally {
            lock.value[key] = true
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

    async function getPartition(uri, partitionId) {
        return await withLock('partitionRead', async () => {
            return await proxy.$api.AcademicController.getPartition(uri, partitionId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function getDataSourceInfo(uri) {
        return await withLock('dataSourceInfoRead', async () => {
            return await proxy.$api.AcademicController.getDataSourceInfo(uri)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function getRootGroups(uri) {
        return await withLock('rootGroupsRead', async () => {
            return await proxy.$api.AcademicController.getRootGroups(uri)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        }, { code: 423, status: 'error', data: [] })
    }

    async function getRootPartitions(uri) {
        return await withLock('rootPartitionsRead', async () => {
            return await proxy.$api.AcademicController.getRootPartitions(uri)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        }, { code: 423, status: 'error', data: [] })
    }

    async function getGroups(uri, parentId) {
        return await withLock('groupsRead', async () => {
            return await proxy.$api.AcademicController.getGroups(uri, parentId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        }, { code: 423, status: 'error', data: [] })
    }

    async function getPartitions(uri, parentId) {
        return await withLock('partitionsRead', async () => {
            return await proxy.$api.AcademicController.getPartitions(uri, parentId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        }, { code: 423, status: 'error', data: [] })
    }

    async function searchPartitions(uri, keyword, top = 8) {
        return await withLock('searchPartitionsRead', async () => {
            return await proxy.$api.AcademicController.searchPartitions(uri, keyword, top)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        }, { code: 423, status: 'error', data: [] })
    }

    async function createGroup(uri, parentId, payload) {
        return await withLock('createGroup', async () => {
            return await proxy.$api.AcademicController.createGroup(uri, parentId, payload)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function createPartition(uri, parentId, payload) {
        return await withLock('createPartition', async () => {
            return await proxy.$api.AcademicController.createPartition(uri, parentId, payload)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function updateGroup(uri, payload) {
        return await withLock('updateGroup', async () => {
            return await proxy.$api.AcademicController.updateGroup(uri, payload)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function updatePartition(uri, parentId, payload) {
        return await withLock('updatePartition', async () => {
            return await proxy.$api.AcademicController.updatePartition(uri, parentId, payload)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function deleteGroup(uri, groupId) {
        return await withLock('deleteGroup', async () => {
            return await proxy.$api.AcademicController.deleteGroup(uri, groupId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function deletePartition(uri, parentId, partitionId) {
        return await withLock('deletePartition', async () => {
            return await proxy.$api.AcademicController.deletePartition(uri, parentId, partitionId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function getItems(uri, partitionId, size, skip, sortKey, sortDesc) {
        return await withLock('itemsRead', async () => {
            return await proxy.$api.AcademicController.getItems(
                uri,
                partitionId,
                size,
                skip,
                sortKey,
                sortDesc
            )
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        }, { code: 423, status: 'error', data: [] })
    }

    async function getAllItems(uri, size, skip, sortKey, sortDesc) {
        return await withLock('allItemsRead', async () => {
            return await proxy.$api.AcademicController.getAllItems(
                uri,
                size,
                skip,
                sortKey,
                sortDesc
            )
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        }, { code: 423, status: 'error', data: [] })
    }

    async function getItemsCount(uri, partitionId) {
        return await withLock('itemsCountRead', async () => {
            return await proxy.$api.AcademicController.getItemsCount(uri, partitionId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        }, { code: 423, status: 'error', data: 0 })
    }

    async function getAllItemsCount(uri) {
        return await withLock('allItemsCountRead', async () => {
            return await proxy.$api.AcademicController.getAllItemsCount(uri)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        }, { code: 423, status: 'error', data: 0 })
    }

    async function getItem(uri, itemId) {
        if (!itemId) return { code: 400, data: null }
        return await proxy.$api.AcademicController.getItem(uri, itemId)
            .then((res) => handleResponse(res))
            .catch((err) => handleError(err))
    }

    async function getSearchItems(uri, partitionId, search, size, skip, sortKey, sortDesc) {
        return await withLock('searchItemsRead', async () => {
            return await proxy.$api.AcademicController.getSearchItems(
                uri,
                partitionId,
                search,
                size,
                skip,
                sortKey,
                sortDesc
            )
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        }, { code: 423, status: 'error', data: [] })
    }

    async function deleteItem(uri, itemId) {
        return await withLock('deleteItem', async () => {
            return await proxy.$api.AcademicController.deleteItem(uri, itemId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function deleteItems(uri, itemIds) {
        return await withLock('deleteItems', async () => {
            return await proxy.$api.AcademicController.deleteItems(uri, itemIds)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function addItemsToPartition(uri, partitionId, itemIds) {
        return await withLock('addItemsToPartition', async () => {
            return await proxy.$api.AcademicController.addItemsToPartition(uri, partitionId, itemIds)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function removeItemsFromPartition(uri, partitionId, itemIds) {
        return await withLock('removeItemsFromPartition', async () => {
            return await proxy.$api.AcademicController.removeItemsFromPartition(
                uri,
                partitionId,
                itemIds
            )
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function getTemplateInfo(uri) {
        return await proxy.$api.AcademicController.getTemplateInfo(uri)
            .then((res) => handleResponse(res))
            .catch((err) => handleError(err))
    }

    async function deleteTemplate(uri, templateId) {
        return await withLock('deleteTemplate', async () => {
            return await proxy.$api.AcademicController.deleteTemplate(uri, templateId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function updateItem(uri, payload) {
        return await withLock('updateItem', async () => {
            return await proxy.$api.AcademicController.updateItem(uri, payload)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function updateItemPage(uri, itemId, pagePayload) {
        return await withLock('updateItemPage', async () => {
            return await proxy.$api.AcademicController.updateItemPage(uri, itemId, pagePayload)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function duplicateItemPage(uri, itemId, pageId) {
        return await withLock('duplicateItemPage', async () => {
            return await proxy.$api.AcademicController.duplicateItemPage(uri, itemId, pageId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function deleteItemPage(uri, itemId, pageId) {
        return await withLock('deleteItemPage', async () => {
            return await proxy.$api.AcademicController.deleteItemPage(uri, itemId, pageId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function openItemFile(uri, itemId, fileId) {
        return await withLock('openItemFile', async () => {
            return await proxy.$api.AcademicController.openItemFile(uri, itemId, fileId)
                .then((res) => handleResponse(res))
                .catch((err) => handleError(err))
        })
    }

    async function getItemPageContent(uri, itemId, pageId) {
        return await proxy.$api.AcademicController.getItemPageContent(uri, itemId, pageId)
            .then((res) => handleResponse(res))
            .catch((err) => handleError(err))
    }

    async function getTemplateContent(uri, templateId) {
        return await proxy.$api.AcademicController.getTemplateContent(uri, templateId)
            .then((res) => handleResponse(res))
            .catch((err) => handleError(err))
    }

    async function saveItemPageContent(uri, itemId, pageId, versionId, content) {
        return await withLock('itemPageContentSave', async () => {
            return await proxy.$api.AcademicController.saveItemPageContent(
                uri,
                itemId,
                pageId,
                versionId,
                content
            )
                .then((res) => handleResponse(res))
                .catch((err) => Promise.reject(err))
        })
    }

    async function saveTemplateContent(uri, templateId, versionId, content) {
        return await withLock('templateContentSave', async () => {
            return await proxy.$api.AcademicController.saveTemplateContent(
                uri,
                templateId,
                versionId,
                content
            )
                .then((res) => handleResponse(res))
                .catch((err) => Promise.reject(err))
        })
    }

    return {
        lock,
        getDataSourceInfo,
        getRootGroups,
        getRootPartitions,
        getGroups,
        getPartitions,
        searchPartitions,
        createGroup,
        createPartition,
        updateGroup,
        updatePartition,
        deleteGroup,
        deletePartition,
        getPartition,
        getItem,
        getItems,
        getAllItems,
        getItemsCount,
        getAllItemsCount,
        getSearchItems,
        deleteItem,
        deleteItems,
        addItemsToPartition,
        removeItemsFromPartition,
        getTemplateInfo,
        deleteTemplate,
        updateItem,
        updateItemPage,
        duplicateItemPage,
        deleteItemPage,
        openItemFile,
        getItemPageContent,
        getTemplateContent,
        saveItemPageContent,
        saveTemplateContent
    }
})
