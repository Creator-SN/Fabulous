<template>
    <div class="collections-shared" :class="theme">
        <div class="collections-shared-header">
            <template v-if="!activeFolder">
                <span class="collections-shared-icon"><i class="ms-Icon ms-Icon--Share"></i></span>
                <div>
                    <h2>{{ local('Shared') }}</h2>
                    <p>{{ local('Notes you have shared') }}</p>
                </div>
            </template>
            <fv-button
                v-else
                icon="ChevronLeft"
                :border-radius="30"
                :foreground="'rgba(128, 105, 145, 1)'"
                font-size="12"
                border-color="rgba(128, 105, 145, 0.1)"
                style="width: 120px"
                @click="activeFolder = null"
            >
                {{ local('All Shared Folders') }}
            </fv-button>
        </div>

        <div v-if="loading" class="collections-shared-loading">
            <fv-progress-ring
                :loading="true"
                r="16"
                :border-width="3"
                :color="color"
            ></fv-progress-ring>
        </div>
        <template v-else-if="!activeFolder">
            <div class="collections-shared-folders">
                <button
                    v-for="folder in filteredFolders"
                    :key="folder.key"
                    class="collections-shared-folder"
                    @click="openFolder(folder)"
                >
                    <span class="collections-shared-folder-icon">
                        <span v-if="folder.emoji">{{ folder.emoji }}</span>
                        <img v-else :src="folderIcon" alt="" />
                    </span>
                    <span class="collections-shared-folder-text">
                        <strong :title="folder.name">{{ folder.name }}</strong>
                        <small
                            >{{ folder.items.length }} {{ local('Notes') }} ·
                            {{ local(folder.kind === 'academic' ? 'Academic' : 'Notebook') }}</small
                        >
                    </span>
                    <i class="ms-Icon ms-Icon--ChevronRight"></i>
                </button>
            </div>
            <p v-if="!filteredFolders.length" class="collections-shared-empty">
                {{ searchText.trim() ? local('No matching folders') : local('No shared notes') }}
            </p>
        </template>
        <template v-else>
            <div class="collections-shared-folder-title">
                <span class="collections-shared-icon"><i class="ms-Icon ms-Icon--Share"></i></span>
                <div>
                    <h2>{{ activeFolder.name }}</h2>
                    <p>{{ activeFolder.items.length }} {{ local('Notes') }}</p>
                </div>
            </div>
            <div
                v-for="item in filteredItems"
                :key="item.id"
                class="collections-shared-item"
                @click="openItem(item)"
            >
                <span class="collections-shared-item-icon">
                    <span v-if="item.emoji">{{ item.emoji }}</span>
                    <img v-else :src="folderIcon" alt="" />
                </span>
                <span class="collections-shared-item-text">
                    <strong :title="item.name">{{ item.name }}</strong>
                    <small
                        >{{ local(item.kind === 'academic' ? 'Academic' : 'Notebook') }} ·
                        {{ scopeText(item.scope) }} · {{ permissionText(item.permission) }}</small
                    >
                </span>
                <fv-button
                    :title="local('Edit Share')"
                    :border-radius="6"
                    border-color="rgba(128, 105, 145, 0.1)"
                    style="width: 30px"
                    @click.stop="editShare(item)"
                >
                    <i class="ms-Icon ms-Icon--Edit"></i>
                </fv-button>
                <fv-button
                    theme="dark"
                    :title="local('Remove Share')"
                    :disabled="removingId === item.id"
                    :border-radius="6"
                    background="rgba(200, 38, 45, 1)"
                    border-color="rgba(128, 105, 145, 0.1)"
                    style="width: 30px"
                    @click.stop="removeShare(item)"
                >
                    <i class="ms-Icon ms-Icon--Delete"></i>
                </fv-button>
            </div>
            <p v-if="!filteredItems.length" class="collections-shared-empty">
                {{ local('No matching notes') }}
            </p>
        </template>

        <share-editor
            v-if="editingItem"
            v-model="showShareEditor"
            :target="shareTarget(editingItem)"
            @saved="handleShareSaved"
        ></share-editor>
    </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useCollectionStore } from '@/stores/collection'
import { useTheme } from '@/stores/theme'
import shareEditor from '@/components/collections/shares/shareEditor.vue'
import folderIcon from '@/assets/nav/folder.svg'

export default {
    name: 'CollectionShared',
    components: { shareEditor },
    props: { searchText: { type: String, default: '' } },
    data() {
        return {
            loading: false,
            activeFolder: null,
            editingItem: null,
            showShareEditor: false,
            removingId: null,
            folderIcon
        }
    },
    computed: {
        ...mapState(useAppConfig, { local: (state) => state.local }),
        ...mapState(useTheme, { theme: (state) => state.theme, color: (state) => state.color }),
        ...mapState(useCollectionStore, ['sharedItems', 'sharedLoaded']),
        folders() {
            const groups = new Map()
            for (const item of this.sharedItems) {
                const parentId = item.parentId || item.itemId
                const key = `${item.kind}:${item.sourceId}:${parentId}`
                if (!groups.has(key))
                    groups.set(key, {
                        key,
                        kind: item.kind,
                        name: item.parentName || item.itemName || this.local('Untitled'),
                        emoji: item.parentEmoji,
                        items: []
                    })
                groups.get(key).items.push(item)
            }
            return [...groups.values()]
        },
        filteredFolders() {
            const query = this.searchText.trim().toLowerCase()
            return query
                ? this.folders.filter((folder) => folder.name.toLowerCase().includes(query))
                : this.folders
        },
        filteredItems() {
            if (!this.activeFolder) return []
            const query = this.searchText.trim().toLowerCase()
            return query
                ? this.activeFolder.items.filter((item) => item.name?.toLowerCase().includes(query))
                : this.activeFolder.items
        }
    },
    mounted() {
        this.loadShared()
    },
    activated() {
        if (!this.sharedLoaded) this.loadShared()
    },
    methods: {
        ...mapActions(useAppConfig, { reviseEditor: 'reviseEditor' }),
        async loadShared(force = false) {
            if (this.loading) return
            this.loading = true
            try {
                await useCollectionStore().listShared(force)
                if (this.activeFolder)
                    this.activeFolder =
                        this.folders.find((folder) => folder.key === this.activeFolder.key) || null
            } catch (error) {
                console.error(error)
            } finally {
                this.loading = false
            }
        },
        openFolder(folder) {
            this.activeFolder = folder
        },
        shareTarget(item) {
            return {
                kind: item.kind,
                sourceId: item.sourceId,
                itemId: item.itemId,
                pageId: item.pageId || null
            }
        },
        scopeText(scope) {
            return this.local(scope === 'public' ? 'Public' : 'Source Members')
        },
        permissionText(permission) {
            return this.local(permission === 'read' ? 'Can View' : 'Can Edit')
        },
        editShare(item) {
            this.editingItem = item
            this.showShareEditor = true
        },
        async handleShareSaved() {
            await this.loadShared(true)
        },
        async removeShare(item) {
            if (this.removingId) return
            this.removingId = item.id
            try {
                const result = await useCollectionStore().removeShare(item.id)
                if (result?.code === 200) await this.loadShared(true)
            } finally {
                this.removingId = null
            }
        },
        openItem(item) {
            if (item.kind === 'notebook' && item.filePath) {
                const pages = this.activeFolder.items
                    .filter(
                        (entry) => entry.kind === 'notebook' && entry.parentId === item.parentId
                    )
                    .map((entry) => ({ ...entry, id: entry.itemId, createDate: entry.updateDate }))
                this.reviseEditor({
                    id: 'notebook',
                    type: 'notebook',
                    dsId: item.sourceId,
                    item: {
                        id: item.parentId,
                        name: item.parentName,
                        filePath: item.filePath.split('/').slice(0, -1).join('/'),
                        pages
                    },
                    target: { ...item, id: item.itemId },
                    scrollTop: 0,
                    displayMode: 'note',
                    history: [],
                    unsave: false,
                    cache: true
                })
                this.$Go(`/notebook/${encodeURI(item.filePath.replace(/\//g, '\\'))}`)
                return
            }
            if (item.kind === 'academic' && item.pageId) {
                const pages = this.activeFolder.items
                    .filter((entry) => entry.kind === 'academic' && entry.itemId === item.itemId)
                    .map((entry) => ({
                        ...entry,
                        id: entry.pageId,
                        parent: entry.itemId,
                        createDate: entry.updateDate
                    }))
                this.reviseEditor({
                    id: 'academic',
                    type: 'item',
                    dsId: item.sourceId,
                    item: { id: item.itemId, name: item.parentName || item.itemName, pages },
                    target: { ...item, id: item.pageId, createDate: item.updateDate },
                    scrollTop: 0,
                    displayMode: 'note',
                    history: [],
                    cache: true
                })
                const path = `${item.sourceId}/${item.itemId}/${item.pageId}`
                this.$Go(`/academic/${encodeURI(path.replace(/\//g, '\\'))}`)
            }
        }
    }
}
</script>

<style lang="scss">
.collections-shared {
    flex: 1;
    padding-top: 22px;
    overflow: auto;
    .collections-shared-header,
    .collections-shared-folder-title {
        margin-bottom: 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        h2 {
            margin: 0;
            font-size: 19px;
        }
        p {
            margin: 5px 0 0;
            color: rgba(150, 140, 163, 1);
            font-size: 12px;
        }
    }
    .collections-shared-icon,
    .collections-shared-folder-icon,
    .collections-shared-item-icon {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(176, 138, 218, 0.16);
        color: rgba(137, 80, 181, 1);
    }
    .collections-shared-icon {
        width: 46px;
        height: 46px;
        border-radius: 13px;
        font-size: 22px;
    }
    .collections-shared-back {
        border: 0;
        padding: 8px 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        i {
            margin-right: 7px;
        }
    }
    .collections-shared-folders {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .collections-shared-folder {
        min-width: 0;
        min-height: 94px;
        padding: 16px;
        border: 1px solid rgba(255, 255, 255, 0.85);
        border-radius: 13px;
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255, 255, 255, 0.79);
        color: inherit;
        text-align: left;
        cursor: pointer;
    }
    .collections-shared-folder:hover,
    .collections-shared-item:hover {
        background: rgba(255, 255, 255, 1);
    }
    .collections-shared-folder-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        font-size: 22px;
        img {
            width: 22px;
        }
    }
    .collections-shared-folder-text,
    .collections-shared-item-text {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        strong {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 13px;
        }
        small {
            overflow: hidden;
            color: rgba(159, 147, 170, 1);
            font-size: 11px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
    .collections-shared-item {
        min-height: 62px;
        margin-bottom: 8px;
        padding: 8px 16px;
        border: 1px solid rgba(255, 255, 255, 0.85);
        border-radius: 13px;
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255, 255, 255, 0.79);
        cursor: pointer;
    }
    .collections-shared-item-icon {
        width: 36px;
        height: 36px;
        border-radius: 9px;
        font-size: 20px;
        img {
            width: 18px;
        }
    }
    .collections-shared-item button {
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: rgba(146, 112, 172, 1);
        cursor: pointer;
        &:hover {
            background: rgba(174, 143, 215, 0.12);
        }
        &:disabled {
            cursor: wait;
            opacity: 0.55;
        }
    }
    .collections-shared-loading {
        min-height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .collections-shared-empty {
        padding: 32px;
        color: rgba(155, 144, 170, 1);
        text-align: center;
    }
    &.dark .collections-shared-folder,
    &.dark .collections-shared-item {
        border-color: rgba(190, 175, 210, 0.14);
        background: rgba(48, 44, 61, 0.9);
    }
}
</style>
