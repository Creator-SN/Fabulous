<template>
    <div class="favorite-notes-area collections-recent" :class="theme">
<div class="favorite-notes-heading">
    <span class="favorite-card-icon"><i class="ms-Icon ms-Icon--Recent"></i></span>
    <div>
        <h2>{{ local('Recent') }}</h2>
        <p>{{ local('Open a note to continue reading') }}</p>
    </div>
</div>
<div v-if="loading" class="favorites-loading">
    <fv-progress-ring
        :loading="true"
        r="16"
        :border-width="3"
        :color="color"
        background="rgba(180, 160, 200, 0.12)"
    ></fv-progress-ring>
</div>
<template v-else>
    <div
        v-for="item in filteredItems"
        :key="`${item.kind}:${item.sourceId}:${item.itemId}:${item.pageId || ''}`"
        class="favorite-note-item"
        @click="openItem(item)"
    >
        <span class="favorite-note-icon">
            <img :src="item.kind === 'academic' ? noteIcon : notebookIcon" alt="" />
        </span>
        <span class="favorite-note-text">
            <strong :title="item.name">{{ item.name }}</strong>
            <small>{{ local(item.kind === 'academic' ? 'Academic' : 'Notebook') }}</small>
        </span>
        <small class="collections-recent-date">{{ formatDate(item.viewedAt) }}</small>
        <button
            :title="local('Edit Favorites')"
            :disabled="isFavoriteLoading(item)"
            @click.stop="openFavoritePicker(item)"
        >
            <img :src="isFavorite(item) ? favorIcon : favorEmptyIcon" alt="" />
        </button>
    </div>
    <p v-if="!filteredItems.length" class="favorites-empty">
        {{ searchText.trim() ? local('No matching notes') : local('No recent notes') }}
    </p>
</template>
        <favorite-picker
            v-if="pickerTarget"
            v-model="showPicker"
            :target="pickerTarget"
            @saved="handleFavoriteSaved"
        ></favorite-picker>
    </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useCollectionStore } from '@/stores/collection'
import { useTheme } from '@/stores/theme'
import noteIcon from '@/assets/nav/note.svg'
import notebookIcon from '@/assets/nav/notebook.svg'
import favorIcon from '@/assets/nav/favor.svg'
import favorEmptyIcon from '@/assets/nav/favor_empty.svg'
import favoritePicker from '@/components/collections/favorites/favoritePicker.vue'

export default {
    name: 'CollectionRecent',
    components: { favoritePicker },
    props: { searchText: { type: String, default: '' } },
    data() {
return {
    loading: false,
    favoriteStates: {},
    favoriteLoadingKeys: {},
    pickerTarget: null,
    showPicker: false,
    noteIcon,
    notebookIcon,
    favorIcon,
    favorEmptyIcon
}
    },
    computed: {
...mapState(useAppConfig, { local: (state) => state.local }),
...mapState(useTheme, { color: (state) => state.color, theme: (state) => state.theme }),
...mapState(useCollectionStore, ['recentItems', 'recentLoaded']),
filteredItems() {
    const query = this.searchText.trim().toLowerCase()
    return query
        ? this.recentItems.filter((item) => item.name?.toLowerCase().includes(query))
        : this.recentItems
}
    },
    mounted() {
this.loadRecent()
    },
    activated() {
if (!this.recentLoaded) this.loadRecent()
    },
    methods: {
...mapActions(useAppConfig, { reviseEditor: 'reviseEditor' }),
async loadRecent() {
    if (this.loading) return
    this.loading = true
    try {
        if (!this.recentLoaded) await useCollectionStore().loadRecent()
    } catch (error) {
        console.error(error)
    } finally {
        this.loading = false
    }
    this.loadFavoriteStates()
},
formatDate(value) {
    return value ? new Date(value).toLocaleString() : ''
},
        itemKey(item) {
            return `${item.kind}:${item.sourceId}:${item.itemId}:${item.pageId || ''}`
        },
        isFavorite(item) {
            return !!this.favoriteStates[this.itemKey(item)]
        },
        isFavoriteLoading(item) {
            return !!this.favoriteLoadingKeys[this.itemKey(item)]
        },
        async loadFavoriteStates() {
            await Promise.all(this.recentItems.map((item) => this.loadFavoriteState(item)))
        },
        async loadFavoriteState(item) {
            const key = this.itemKey(item)
            if (
                this.favoriteLoadingKeys[key] ||
                Object.prototype.hasOwnProperty.call(this.favoriteStates, key)
            )
                return
            if (typeof item.isFavorite === 'boolean') {
                this.favoriteStates[key] = item.isFavorite
                return
            }
            const folderIds = item.favoriteFolderIds || item.folderIds
            if (Array.isArray(folderIds)) {
                this.favoriteStates[key] = folderIds.length > 0
                return
            }
            this.favoriteLoadingKeys[key] = true
            try {
                const folders = await useCollectionStore().loadFolders(item)
                this.favoriteStates[key] = folders.some((folder) => folder.containsItem)
            } catch (error) {
                console.error(error)
                this.favoriteStates[key] = false
            } finally {
                delete this.favoriteLoadingKeys[key]
            }
        },
        openFavoritePicker(item) {
            this.pickerTarget = item
            this.showPicker = true
        },
        handleFavoriteSaved(folders) {
            if (!this.pickerTarget) return
            this.favoriteStates[this.itemKey(this.pickerTarget)] = folders.length > 0
        },
openItem(item) {
    if (!item?.kind || !item?.itemId) return
    if (item.kind === 'notebook') {
        const guidPath = item.filePath
        if (!guidPath) return
        const pages = this.recentItems
            .filter(
                (entry) => entry.kind === 'notebook' && entry.parentId === item.parentId
            )
            .map((entry) => ({ ...entry, id: entry.itemId, createDate: entry.viewedAt }))
        this.reviseEditor({
            id: 'notebook',
            type: 'notebook',
            dsId: item.sourceId,
            item: {
                id: item.parentId,
                name: item.parentName,
                filePath: guidPath.split('/').slice(0, -1).join('/'),
                pages
            },
            target: { ...item, id: item.itemId },
            scrollTop: 0,
            displayMode: 'note',
            history: [],
            unsave: false,
            cache: true
        })
        this.$Go(`/notebook/${encodeURI(guidPath.replace(/\//g, '\\'))}`)
        return
    }
    if (item.kind === 'academic' && item.pageId) {
        const pages = this.recentItems
            .filter((entry) => entry.kind === 'academic' && entry.itemId === item.itemId)
            .map((entry) => ({
                ...entry,
                id: entry.pageId,
                parent: entry.itemId,
                createDate: entry.viewedAt
            }))
        this.reviseEditor({
            id: 'academic',
            type: 'item',
            dsId: item.sourceId,
            item: { id: item.itemId, name: item.itemName, pages },
            target: { ...item, id: item.pageId, createDate: item.viewedAt },
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
.collections-recent {
    flex: 1;
    padding-top: 22px;
    overflow: auto;

    .favorite-notes-heading {
        margin-bottom: 18px;
        display: flex;
        align-items: center;
        gap: 12px;

        .favorite-card-icon {
            width: 46px;
            height: 46px;
            border-radius: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(176, 138, 218, 0.16);
            color: rgba(137, 80, 181, 1);
            font-size: 22px;
        }

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

    .favorite-note-item {
        min-height: 62px;
        margin-bottom: 8px;
        padding: 8px 16px;
        border: 1px solid rgba(255, 255, 255, 0.85);
        border-radius: 13px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255, 255, 255, 0.79);
        cursor: pointer;

        &:hover {
            background: rgba(255, 255, 255, 1);
        }

        .favorite-note-icon {
            width: 36px;
            height: 36px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(174, 143, 215, 0.1);

            img {
                width: 18px;
            }
        }

        .favorite-note-text {
            min-width: 0;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;

            strong {
                overflow: hidden;
                font-size: 13px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            small {
                color: rgba(159, 147, 170, 1);
                font-size: 11px;
            }
        }

        button {
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

            img {
                width: 17px;
            }
        }
    }

    .favorites-loading {
        min-height: 160px;
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .favorites-empty {
        grid-column: 1 / -1;
        padding: 32px;
        color: rgba(155, 144, 170, 1);
        text-align: center;
    }

    .collections-recent-date {
        color: rgba(153, 144, 166, 1);
        font-size: 12px;
    }
    &.dark {
        .favorite-note-item {
            border-color: rgba(190, 175, 210, 0.14);
            background: rgba(48, 44, 61, 0.9);
        }
    }
}
</style>
