<template>
    <div class="favorites-page" :class="[{ dark: theme === 'dark' }]">
        <div class="favorites-page-scroll">
            <section class="favorites-hero">
                <p class="favorites-eyebrow">{{ local('FAVORITES') }}</p>
                <h1 class="favorites-hero-title">{{ local('Keep your favorites close.') }}</h1>
                <p class="favorites-hero-subtitle">
                    {{ local('Collect useful notes and pick up where you left off.') }}
                </p>
                <fv-text-box
                    v-model="searchText"
                    left-icon="Search"
                    :placeholder="local('Search favorite folders or notes')"
                    :borderRadius="12"
                    background="rgba(255, 255, 255, 0.72)"
                    foreground="rgba(165, 157, 175, 1)"
                    border-color="rgba(255, 255, 255, 0.8)"
                    :focus-border-color="'rgba(133, 153, 220, 0.3)'"
                    :reveal-border="true"
                    :reveal-border-color="['rgba(133, 153, 220, 1)']"
                    :reveal-background-color="['rgba(133, 153, 220, 0.1)']"
                    style="width: min(510px, 100%); height: 56px; margin-top: 20px"
                ></fv-text-box>
            </section>

            <section class="favorites-panel">
                <div class="favorites-panel-header">
                    <template v-if="!activeFolder">
                        <h2 class="favorites-section-title">{{ local('Favorites') }}</h2>
                        <button
                            class="favorites-panel-action"
                            :disabled="loadingFolders || showFolderEditor"
                            @click="openNewFolder"
                        >
                            <i class="ms-Icon ms-Icon--Add"></i>
                            {{ local('New Folder') }}
                        </button>
                    </template>
                    <template v-else>
                        <button
                            class="favorites-back"
                            :disabled="openingFolder || loadingItems"
                            @click="activeFolder = null"
                        >
                            <i class="ms-Icon ms-Icon--Back"></i>
                            {{ local('All Favorite Folders') }}
                        </button>
                        <span class="favorites-folder-count">
                            {{ activeFolder.itemCount || 0 }} {{ local('Notes') }}
                        </span>
                    </template>
                </div>

                <div v-if="!activeFolder" class="favorite-folder-grid">
                    <div v-if="loadingFolders" class="favorites-loading">
                        <fv-progress-ring
                            :loading="true"
                            r="16"
                            :border-width="3"
                            :color="color"
                            background="rgba(180, 160, 200, 0.12)"
                        ></fv-progress-ring>
                    </div>
                    <template v-else>
                        <article
                            v-for="(folder, index) in filteredFolders"
                            :key="folder.id"
                            class="favorite-folder-card"
                            tabindex="0"
                            role="button"
                            :aria-disabled="openingFolder"
                            @click="openFolder(folder)"
                            @keyup.enter="openFolder(folder)"
                            @contextmenu.prevent="rightClick($event, folder)"
                        >
                            <div class="favorite-card-top">
                                <span class="favorite-card-icon" :class="`tone-${index % 3}`">
                                    <i class="ms-Icon ms-Icon--FavoriteStar"></i>
                                </span>
                                <button
                                    class="favorite-card-menu"
                                    :title="local('Manage Favorites')"
                                    @click.stop="rightClick($event, folder)"
                                >
                                    <i class="ms-Icon ms-Icon--More"></i>
                                </button>
                            </div>
                            <h3 :title="folder.name">{{ folder.name }}</h3>
                            <p class="favorite-card-description">
                                {{ folder.itemCount || 0 }} {{ local('Notes') }} ·
                                {{ local('Saved for easy access') }}
                            </p>
                            <div class="favorite-card-bottom">
                                <span>{{ local('Favorite Folder') }}</span>
                            </div>
                        </article>
                        <button
                            v-if="!searchText.trim()"
                            class="favorite-folder-card favorite-create-card"
                            :disabled="showFolderEditor"
                            @click="openNewFolder"
                        >
                            <span class="favorite-card-icon"><i class="ms-Icon ms-Icon--Add"></i></span>
                            <strong>{{ local('New Folder') }}</strong>
                            <span>{{ local('Create a space for your notes') }}</span>
                        </button>
                        <p
                            v-if="!filteredFolders.length && searchText.trim()"
                            class="favorites-empty"
                        >
                            {{ local('No matching folders') }}
                        </p>
                    </template>
                </div>

                <div v-else class="favorite-notes-area">
                    <div class="favorite-notes-heading">
                        <span class="favorite-card-icon"
                            ><i class="ms-Icon ms-Icon--FabricFolder"></i
                        ></span>
                        <div>
                            <h2>{{ activeFolder.name }}</h2>
                            <p>{{ local('Open a note to continue reading') }}</p>
                        </div>
                    </div>
                    <div v-if="loadingItems" class="favorites-loading">
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
                            @click="openFavorite(item)"
                            @contextmenu.prevent="rightClick($event, item, true)"
                        >
                            <span class="favorite-note-icon">
                                <img :src="item.kind === 'academic' ? noteIcon : notebookIcon" alt="" />
                            </span>
                            <span class="favorite-note-text">
                                <strong :title="item.name">{{ item.name }}</strong>
                                <small>{{
                                    local(item.kind === 'academic' ? 'Academic' : 'Notebook')
                                }}</small>
                            </span>
                            <button
                                :title="local('Remove from Favorites')"
                                @click.stop="removeItem(item)"
                            >
                                <img :src="favorIcon" alt="" />
                            </button>
                            <button :title="local('Edit Favorites')" @click.stop="editItem(item)">
                                <i class="ms-Icon ms-Icon--Edit"></i>
                            </button>
                        </div>
                    </template>
                    <p v-if="!loadingItems && !filteredItems.length" class="favorites-empty">
                        {{ searchText.trim() ? local('No matching notes') : local('No favorites') }}
                    </p>
                </div>

                <p class="favorites-panel-hint">
                    <i class="ms-Icon ms-Icon--Lightbulb"></i>
                    {{ local('Keep useful notes in favorites to find them faster next time.') }}
                </p>
            </section>
            <footer class="favorites-page-footer">
                <span>FAB · {{ local('Make research easier') }}</span>
                <span>{{ local('A space for your notes') }}</span>
            </footer>
        </div>
        <fv-right-menu ref="rightMenu" :theme="theme" :rightMenuWidth="180">
            <div>
                <span v-if="!menuItem.isItem" @click="openFolder(menuItem)"
                    ><i class="ms-Icon ms-Icon--View" :style="{ color: color }"></i>
                    <p>{{ local('Open') }}</p></span
                >
                <span v-if="!menuItem.isItem" @click="renameFolder(menuItem)"
                    ><i class="ms-Icon ms-Icon--Rename" :style="{ color: color }"></i>
                    <p>{{ local('Rename') }}</p></span
                >
                <span v-if="menuItem.isItem" @click="removeItem(menuItem)"
                    ><i
                        class="ms-Icon ms-Icon--FavoriteStarFill"
                        :style="{ color: 'rgba(200, 38, 45, 1)' }"
                    ></i>
                    <p>{{ local('Remove from Favorites') }}</p></span
                >
                <span v-if="!menuItem.isItem" @click="deleteFolder(menuItem)"
                    ><i
                        class="ms-Icon ms-Icon--Delete"
                        :style="{ color: 'rgba(200, 38, 45, 1)' }"
                    ></i>
                    <p>{{ local('Delete') }}</p></span
                >
            </div>
        </fv-right-menu>
        <favorite-picker
            v-if="pickerTarget"
            v-model="showPicker"
            :target="pickerTarget"
            @saved="loadFolderItems"
        ></favorite-picker>
        <favorite-folder-editor
            v-model="showFolderEditor"
            :folder="folderEditorTarget"
            @saved="handleFolderSaved"
        ></favorite-folder-editor>
    </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useTheme } from '@/stores/theme'
import favoritePicker from '@/components/general/favorites/favoritePicker.vue'
import favoriteFolderEditor from '@/components/general/favorites/favoriteFolderEditor.vue'
import noteIcon from '@/assets/nav/note.svg'
import notebookIcon from '@/assets/nav/notebook.svg'
import favorIcon from '@/assets/nav/favor.svg'

export default {
    name: 'Favorites',
    components: { favoritePicker, favoriteFolderEditor },
    data() {
        return {
            folders: [],
            favoriteItems: [],
            activeFolder: null,
            searchText: '',
            loadingFolders: false,
            loadingItems: false,
            openingFolder: false,
            showFolderEditor: false,
            folderEditorTarget: null,
            menuItem: {},
            pickerTarget: null,
            showPicker: false,
            noteIcon,
            notebookIcon,
            favorIcon
        }
    },
    computed: {
        ...mapState(useAppConfig, { local: (state) => state.local }),
        ...mapState(useTheme, { theme: (state) => state.theme, color: (state) => state.color }),
        filteredFolders() {
            const query = this.searchText.trim().toLowerCase()
            return query
                ? this.folders.filter((folder) => folder.name.toLowerCase().includes(query))
                : this.folders
        },
        filteredItems() {
            const query = this.searchText.trim().toLowerCase()
            return query
                ? this.favoriteItems.filter((item) => item.name.toLowerCase().includes(query))
                : this.favoriteItems
        }
    },
    mounted() {
        this.loadFolders()
    },
    methods: {
        ...mapActions(useAppConfig, { reviseEditor: 'reviseEditor' }),
        async loadFolders() {
            this.loadingFolders = true
            try {
                const { data = [] } = await this.$api.FavoriteController.listFavoriteFolders()
                this.folders = data
            } catch (error) {
                console.error(error)
            } finally {
                this.loadingFolders = false
            }
        },
        async openFolder(folder) {
            if (this.openingFolder || this.loadingFolders) return
            this.openingFolder = true
            try {
                this.activeFolder = folder
                this.searchText = ''
                await this.loadFolderItems()
            } finally {
                this.openingFolder = false
            }
        },
        async loadFolderItems() {
            if (!this.activeFolder) return
            this.loadingItems = true
            try {
                const { data = [] } = await this.$api.FavoriteController.listFavoriteItems(
                    this.activeFolder.id
                )
                this.favoriteItems = data
            } catch (error) {
                console.error(error)
                this.favoriteItems = []
            } finally {
                this.loadingItems = false
            }
        },
        rightClick(event, item, isItem = false) {
            event.preventDefault()
            event.stopPropagation()
            this.menuItem = { ...item, isItem }
            this.$refs.rightMenu.rightClick(event, this.$el)
        },
        openNewFolder() {
            if (this.showFolderEditor || this.loadingFolders) return
            this.folderEditorTarget = null
            this.showFolderEditor = true
        },
        renameFolder(folder) {
            if (this.showFolderEditor) return
            this.folderEditorTarget = folder
            this.showFolderEditor = true
        },
        async handleFolderSaved(folderId) {
            await this.loadFolders()
            if (this.activeFolder?.id === folderId) {
                this.activeFolder = this.folders.find((folder) => folder.id === folderId)
            }
        },
        async deleteFolder(folder) {
            this.$infoBox(this.local('Are you sure to delete this folder?'), {
                status: 'error',
                title: this.local('Delete'),
                theme: this.theme,
                confirm: async () => {
                    await this.$api.FavoriteController.deleteFavoriteFolder(folder.id)
                    await this.loadFolders()
                }
            })
        },
        async removeItem(item) {
            await this.$api.FavoriteController.removeFavoriteItem(this.activeFolder.id, {
                kind: item.kind,
                sourceId: item.sourceId,
                itemId: item.itemId,
                pageId: item.pageId || null
            })
            await this.loadFolderItems()
            await this.loadFolders()
            this.activeFolder = this.folders.find((folder) => folder.id === this.activeFolder.id)
        },
        editItem(item) {
            this.pickerTarget = item
            this.showPicker = true
        },
        async openFavorite(item) {
            try {
                if (item.kind === 'notebook') {
                    const pages = this.favoriteItems
                        .filter(
                            (entry) => entry.kind === 'notebook' && entry.parentId === item.parentId
                        )
                        .map((entry) => ({
                            ...entry,
                            id: entry.itemId,
                            createDate: entry.viewedAt
                        }))
                    const parentPath = item.filePath.split('/').slice(0, -1).join('/')
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
                if (item.kind === 'academic') {
                    const pages = this.favoriteItems
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
                    this.$Go(
                        `/academic/${encodeURI(`${item.sourceId}/${item.itemId}/${item.pageId}`.replace(/\//g, '\\'))}`
                    )
                }
            } catch (error) {
                console.error(error)
            }
        }
    }
}
</script>

<style lang="scss">
.favorites-page {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    color: rgba(48, 43, 61, 1);
    background: rgba(246, 246, 246, 0.7);
    display: flex;
    flex-direction: column;

    &::before {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(ellipse at 28% 34%, rgba(249, 222, 239, 0.5), transparent 35%),
            radial-gradient(ellipse at 76% 58%, rgba(225, 216, 245, 0.34), transparent 43%),
            rgba(248, 247, 253, 1);
        -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 5%, #000 36%);
        mask-image: linear-gradient(to right, transparent 0%, transparent 5%, #000 36%);
        content: '';
    }

    .favorites-page-scroll {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 0 28px 30px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        overflow: auto;
    }

    .favorites-hero {
        gap: 5px;
        padding-top: 64px;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .favorites-eyebrow {
            margin: 0;
            color: rgba(145, 125, 158, 1);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 6px;
        }

        h1.favorites-hero-title {
            margin: 15px 0px;
            background: linear-gradient(95deg, rgba(153, 116, 206, 1), rgba(133, 155, 220, 1));
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            font-size: 30px;
            font-weight: 750;
            line-height: 1.2;
        }

        .favorites-hero-subtitle {
            margin: 0;
            color: rgba(146, 138, 159, 1);
            font-size: 15px;
        }
    }

    .favorites-panel {
        width: 100%;
        max-width: 1280px;
        min-height: 355px;
        flex: 1;
        margin: 74px auto 0;
        padding: 28px 36px 22px;
        border: 1px solid rgba(255, 255, 255, 0.9);
        border-radius: 30px;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.43);
        box-shadow: 0 22px 78px rgba(98, 73, 132, 0.09);
        backdrop-filter: blur(18px);

        .favorites-panel-header {
            min-height: 62px;
            border-bottom: 1px solid rgba(148, 133, 165, 0.1);
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 15px;
        }

        .favorites-section-title {
            position: relative;
            margin: 0;
            padding: 0 4px 17px;
            color: rgba(63, 54, 72, 1);
            font-size: 14px;
            font-weight: 600;

            &::after {
                position: absolute;
                right: 0;
                bottom: 0;
                left: 0;
                height: 3px;
                border-radius: 3px;
                background: rgba(151, 99, 170, 1);
                content: '';
            }
        }

        .favorites-panel-action,
        .favorites-back {
            padding: 5px 2px;
            border: 0;
            background: transparent;
            color: rgba(128, 105, 145, 1);
            font: inherit;
            font-size: 14px;
            cursor: pointer;

            i {
                margin-right: 8px;
            }

            &:hover {
                color: rgba(164, 84, 174, 1);
            }

            &:disabled {
                opacity: 0.45;
                cursor: default;
            }
        }

        .favorites-folder-count {
            color: rgba(153, 144, 166, 1);
            font-size: 13px;
        }

        .favorite-folder-grid {
            padding-top: 20px;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px;
        }

        .favorites-loading {
            min-height: 160px;
            grid-column: 1 / -1;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .favorite-folder-card {
            min-width: 0;
            min-height: 238px;
            padding: 25px 28px 22px;
            border: 1px solid rgba(255, 255, 255, 0.85);
            border-radius: 19px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            background: rgba(255, 255, 255, 0.82);
            color: inherit;
            text-align: left;
            cursor: pointer;
            transition:
                transform 160ms ease,
                box-shadow 160ms ease;

            &[aria-disabled='true'],
            &:disabled {
                opacity: 0.55;
                cursor: default;
            }

            &:hover,
            &:focus-visible {
                transform: translateY(-3px);
                box-shadow: 0 14px 36px rgba(117, 88, 146, 0.12);
            }

            .favorite-card-top {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
            }

            .favorite-card-icon {
                width: 55px;
                height: 55px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(176, 138, 218, 0.16);
                color: rgba(137, 80, 181, 1);
                font-size: 25px;

                &.tone-1 {
                    background: rgba(151, 184, 218, 0.18);
                    color: rgba(91, 135, 182, 1);
                }

                &.tone-2 {
                    background: rgba(238, 166, 200, 0.2);
                    color: rgba(197, 105, 150, 1);
                }
            }

            .favorite-card-menu {
                border: 0;
                background: transparent;
                color: rgba(181, 162, 194, 1);
                font-size: 16px;
                cursor: pointer;

                &:hover {
                    color: rgba(140, 84, 175, 1);
                }
            }

            h3 {
                margin: 24px 0 8px;
                overflow: hidden;
                color: rgba(45, 40, 61, 1);
                font-size: 18px;
                font-weight: 700;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .favorite-card-description {
                margin: 0;
                color: rgba(150, 140, 163, 1);
                font-size: 13px;
            }

            .favorite-card-bottom {
                margin-top: auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: rgba(170, 157, 180, 1);
                font-size: 11px;

                i {
                    font-size: 14px;
                }
            }
        }

        .favorite-create-card {
            justify-content: center;
            align-items: center;
            gap: 12px;
            border: 1px dashed rgba(156, 122, 186, 0.4);
            background: rgba(255, 255, 255, 0.37);
            text-align: center;

            .favorite-card-icon {
                width: 48px;
                height: 48px;
                font-size: 20px;
            }

            strong {
                color: rgba(87, 64, 110, 1);
                font-size: 15px;
            }

            > span:last-child {
                color: rgba(164, 151, 175, 1);
                font-size: 12px;
            }
        }

        .favorite-notes-area {
            padding-top: 22px;

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
        }

        .favorites-empty {
            grid-column: 1 / -1;
            padding: 32px;
            color: rgba(155, 144, 170, 1);
            text-align: center;
        }

        .favorites-panel-hint {
            margin: 22px 0 0;
            color: rgba(171, 153, 179, 1);
            font-size: 11px;
            text-align: center;

            i {
                margin-right: 7px;
            }
        }
    }

    .favorites-page-footer {
        max-width: 1280px;
        margin: 23px auto 0;
        padding: 0 8px;
        display: flex;
        justify-content: space-between;
        color: rgba(179, 165, 189, 1);
        font-size: 11px;
    }

    &.dark {
        color: rgba(241, 237, 246, 1);
        background: rgba(5, 9, 15, 0.85);

        &::before {
            background: radial-gradient(
                    ellipse at 28% 34%,
                    rgba(105, 50, 110, 0.24),
                    transparent 38%
                ),
                rgba(20, 19, 30, 1);
        }

        .favorites-panel {
            border-color: rgba(190, 175, 210, 0.13);
            background: rgba(38, 35, 49, 0.72);
        }

        .favorites-search,
        .favorite-folder-card,
        .favorite-notes-area .favorite-note-item {
            border-color: rgba(190, 175, 210, 0.14);
            background: rgba(48, 44, 61, 0.9);
        }

        .favorites-search input,
        .favorite-folder-card h3 {
            color: rgba(241, 237, 246, 1);
        }
    }

    @media (max-width: 960px) {
        .favorites-panel .favorite-folder-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 620px) {
        .favorites-page-scroll {
            padding: 0 14px 22px;
        }

        .favorites-hero {
            padding-top: 34px;
        }

        .favorites-panel {
            margin-top: 42px;
            padding: 20px 16px;
            border-radius: 20px;

            .favorite-folder-grid {
                grid-template-columns: 1fr;
            }

            .favorites-section-title {
                font-size: 12px;
            }

            .favorites-panel-action {
                font-size: 12px;
            }
        }
    }
}
</style>
