import { defineStore } from 'pinia'
import { getProxy } from '@/stores/proxyHolder'

let recentRequest = null
const recentNum = 15

export const useCollectionStore = defineStore('collection', {
    state: () => ({
        activeSection: 'favorites',
        recentItems: [],
        recentLoaded: false,
        recentLoading: false,
        folders: [],
        foldersLoaded: false,
        itemsByFolder: {},
        sharedItems: [],
        sharedLoaded: false,
        sharedLoading: false
    }),
    actions: {
        setActiveSection(section) {
            if (['recent', 'favorites', 'shared'].includes(section)) this.activeSection = section
        },
        async loadRecent(force = false) {
            if (recentRequest) return recentRequest
            if (this.recentLoaded && !force) return this.recentItems
            this.recentLoading = true
            recentRequest = (async () => {
                try {
                    const response = await getProxy().$api.RecentViewController.listRecentViews(recentNum)
                    this.recentItems = (response?.data || []).slice(0, recentNum)
                    this.recentLoaded = true
                    return this.recentItems
                } finally {
                    this.recentLoading = false
                    recentRequest = null
                }
            })()
            return recentRequest
        },
        async recordRecent(entry) {
            if (!localStorage.getItem('ApiToken')) return
            const response = await getProxy().$api.RecentViewController.recordRecentView(entry)
            if (recentRequest) {
                try {
                    await recentRequest
                } catch (error) {
                    console.error(error)
                }
            }
            this.recentLoaded = false
            await this.loadRecent(true)
            return response
        },
        async loadFolders(target = null) {
            const response = await getProxy().$api.FavoriteController.listFavoriteFolders(
                target?.kind,
                target?.sourceId,
                target?.itemId,
                target?.pageId || undefined
            )
            const folders = response?.data || []
            if (!target) {
                this.folders = folders
                this.foldersLoaded = true
            }
            return folders
        },
        async loadFolderItems(folderId) {
            const response = await getProxy().$api.FavoriteController.listFavoriteItems(folderId)
            const items = response?.data || []
            this.itemsByFolder[folderId] = items
            return items
        },
        async createFolder(name) {
            const response = await getProxy().$api.FavoriteController.createFavoriteFolder({ name })
            if (response?.code === 200) this.foldersLoaded = false
            return response
        },
        async renameFolder(folderId, name) {
            const response = await getProxy().$api.FavoriteController.renameFavoriteFolder(folderId, { name })
            if (response?.code === 200) this.foldersLoaded = false
            return response
        },
        async deleteFolder(folderId) {
            const response = await getProxy().$api.FavoriteController.deleteFavoriteFolder(folderId)
            if (response?.code === 200) {
                delete this.itemsByFolder[folderId]
                this.foldersLoaded = false
            }
            return response
        },
        async removeItem(folderId, item) {
            const response = await getProxy().$api.FavoriteController.removeFavoriteItem(folderId, item)
            if (response?.code === 200) {
                delete this.itemsByFolder[folderId]
                this.foldersLoaded = false
            }
            return response
        },
        async setFolders(target, folderIds) {
            const response = await getProxy().$api.FavoriteController.setFavoriteFolders({
                kind: target.kind,
                sourceId: target.sourceId,
                itemId: target.itemId,
                pageId: target.pageId || null,
                folderIds
            })
            if (response?.code === 200) {
                this.itemsByFolder = {}
                this.foldersLoaded = false
            }
            return response
        },
        async listShared(force = false) {
            if (this.sharedLoading || (this.sharedLoaded && !force)) return this.sharedItems
            this.sharedLoading = true
            try {
                const response = await getProxy().$api.ShareController.listSharedItems()
                this.sharedItems = response?.data || []
                this.sharedLoaded = true
                return this.sharedItems
            } finally {
                this.sharedLoading = false
            }
        },
        async createShare(target, scope, permission) {
            const response = await getProxy().$api.ShareController.createSharedItem({
                ...target,
                scope,
                permission
            })
            this.sharedLoaded = false
            return response
        },
        async updateShare(id, scope, permission) {
            const response = await getProxy().$api.ShareController.updateSharedItem(id, {
                scope,
                permission
            })
            this.sharedLoaded = false
            return response
        },
        async removeShare(id) {
            const response = await getProxy().$api.ShareController.deleteSharedItem(id)
            this.sharedLoaded = false
            return response
        },
        async resolveMagicShare(key) {
            return await getProxy().$api.ShareController.resolveMagicShare(key)
        }
    }
})
