<template>
    <div v-show="items.length > 0" class="recent-notes-list" :class="[{ dark: theme === 'dark' }]">
        <button
            v-for="item in items"
            :key="`${item.kind}:${item.sourceId}:${item.itemId}:${item.pageId || ''}`"
            class="recent-note-item"
            :title="item.name"
            @click="openRecentItem(item)"
        >
            <img :src="item.kind === 'academic' ? noteIcon : notebookIcon" alt="" />
            <span class="recent-note-name">{{ item.name }}</span>
            <span class="recent-note-kind">
                {{ local(item.kind === 'academic' ? 'Academic' : 'Notebook') }}
            </span>
        </button>
        <p v-if="!loading && !items.length" class="recent-notes-empty">
            {{ local('No recent notes') }}
        </p>
        <fv-progress-ring
            v-if="loading"
            :loading="true"
            :r="12"
            :borderWidth="2"
            color="rgba(133, 148, 211, 1)"
            :background="'transparent'"
        ></fv-progress-ring>
        <hr class="recent-notes-divider" />
    </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useCollectionStore } from '@/stores/collection'
import noteIcon from '@/assets/nav/note.svg'
import notebookIcon from '@/assets/nav/notebook.svg'

export default {
    props: {
        theme: { type: String, default: 'light' },
        local: { type: Function, default: (value) => value },
        Go: { type: Function, default: () => {} }
    },
    data() {
        return { loading: false, noteIcon, notebookIcon }
    },
    computed: {
        ...mapState(useCollectionStore, {
            items: (state) => state.recentItems.slice(0, 5)
        })
    },
    mounted() {
        this.loadRecent()
    },
    methods: {
        ...mapActions(useAppConfig, {
            reviseEditor: 'reviseEditor'
        }),
        async loadRecent() {
            this.loading = true
            try {
                await useCollectionStore().loadRecent()
            } catch (error) {
                console.error(error)
            } finally {
                this.loading = false
            }
        },
        async openRecentItem(item) {
            if (!item?.kind || !item?.itemId) return
            try {
                if (item.kind === 'notebook') {
                    const guidPath = item.filePath
                    if (!guidPath) return
                    const parentPath = guidPath.split('/').slice(0, -1).join('/')
                    const pages = this.items
                        .filter(
                            (entry) => entry.kind === 'notebook' && entry.parentId === item.parentId
                        )
                        .map((entry) => ({
                            ...entry,
                            id: entry.itemId,
                            filePath: entry.filePath,
                            createDate: entry.viewedAt
                        }))
                    this.reviseEditor({
                        id: 'notebook',
                        type: 'notebook',
                        dsId: item.sourceId,
                        item: {
                            id: item.parentId,
                            name: item.parentName,
                            filePath: parentPath,
                            pages
                        },
                        target: { ...item, id: item.itemId, filePath: guidPath },
                        scrollTop: 0,
                        displayMode: 'note',
                        history: [],
                        unsave: false,
                        cache: true
                    })
                    this.Go(`/notebook/${encodeURI(guidPath.replace(/\//g, '\\'))}`)
                    return
                }
                if (item.kind === 'academic' && item.pageId) {
                    const path = `${item.sourceId}/${item.itemId}/${item.pageId}`
                    const pages = this.items
                        .filter(
                            (entry) => entry.kind === 'academic' && entry.itemId === item.itemId
                        )
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
                    this.Go(`/academic/${encodeURI(path.replace(/\//g, '\\'))}`)
                }
            } catch (error) {
                console.error(error)
                this.$barWarning(this.local('Open Recent Note Failed'), { status: 'warning' })
            }
        }
    }
}
</script>

<style lang="scss">
.recent-notes-list {
    position: relative;
    width: 100%;
    height: auto;
    flex-shrink: 0;
    padding: 0px 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    user-select: none;

    &.dark {
        color: whitesmoke;

        .recent-notes-title {
            color: rgba(133, 148, 211, 1);
        }

        .recent-notes-divider {
            border-top: rgba(120, 120, 120, 0.2) solid thin;
        }
    }

    .recent-notes-title {
        width: 100%;
        margin-bottom: 10px;
        padding: 0 25px;
        font-size: 12px;
        font-weight: bold;
        box-sizing: border-box;
        color: rgba(133, 148, 211, 1);
        user-select: none;
    }

    .recent-notes-divider {
        width: 90%;
        margin-left: 5%;
        margin: 5px 0;
        border-top: rgba(200, 200, 200, 0.1) solid thin;
        border-bottom: 0;
        box-sizing: border-box;
    }

    .recent-note-item {
        width: 100%;
        height: 35px;
        padding: 0 25px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 7px;
        border: 0;
        background: transparent;
        border-radius: 8px;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;

        &:hover {
            background: rgba(200, 200, 200, 0.2);
        }

        img {
            width: 16px;
            flex-shrink: 0;
        }

        .recent-note-name {
            flex: 1;
            overflow: hidden;
            font-size: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .recent-note-kind {
            flex-shrink: 0;
            font-size: 10px;
            opacity: 0.55;
        }
    }

    &.dark .recent-note-item:hover {
        background: rgba(255, 255, 255, 0.08);
    }

    &.dark .recent-note-item {
        color: whitesmoke;
    }

    .recent-notes-empty {
        padding: 12px;
        font-size: 12px;
        opacity: 0.6;
        text-align: center;
    }
}
</style>
