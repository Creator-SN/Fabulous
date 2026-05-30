<template>
    <div class="fabulous-home-container" :class="[{ dark: theme === 'dark' }]">
        <div :draggable="false" class="s-row" style="margin-top: 45px">
            <p class="s-title">{{ partitionInfo.name }}</p>
        </div>
        <div class="m-home-block">
            <div class="row between">
                <fv-text-box
                    v-model="currentSearch.value"
                    :placeholder="` ` + local('Filtering from current content')"
                    :theme="theme"
                    :background="
                        theme === 'dark' ? 'rgba(75, 75, 75, 0.6)' : 'rgba(255, 255, 255, 0.6)'
                    "
                    icon="Filter"
                    borderWidth="1"
                    :border-radius="30"
                    :revealBorder="true"
                    @debounce-input="currentSearch.debounce = $event"
                ></fv-text-box>
                <div class="sort-block">
                    <fv-combobox
                        v-model="sortKey"
                        :options="sortOptions"
                        :placeholder="local('Sort by')"
                        :inputBackground="
                            theme === 'dark' ? 'rgba(75, 75, 75, 1)' : 'rgba(255, 255, 255, 0.6)'
                        "
                        border-color="rgba(120, 120, 120, 0.3)"
                        :border-radius="6"
                        :theme="theme"
                        style="width: 120px"
                    ></fv-combobox>
                    <fv-button
                        :theme="theme"
                        :disabled="sortKey.key == undefined"
                        :background="theme === 'light' ? 'white' : ''"
                        border-radius="6"
                        style="width: 35px; height: 35px; margin-left: 5px"
                        :title="
                            sortDesc == 1
                                ? local('Switch to Descending')
                                : local('Switch to Ascending')
                        "
                        :is-box-shadow="true"
                        @click="sortDesc = -sortDesc"
                    >
                        <i
                            class="ms-Icon"
                            :class="[`ms-Icon--${sortDesc == 1 ? 'Ascending' : 'Descending'}`]"
                            style="font-size: 18px"
                        ></i>
                    </fv-button>
                </div>
            </div>
            <div class="row command-bar">
                <fv-command-bar
                    :options="cmd"
                    :theme="theme"
                    :background="theme === 'dark' ? 'transparent' : 'rgba(245, 245, 245, 0)'"
                    style="flex: 1; background: transparent"
                >
                    <template #optionItem="{ item, valueTrigger }">
                        <img
                            :src="item.img"
                            alt=""
                            draggable="false"
                            style="width: 15px; height: auto; margin-right: 15px; object-fit: cover"
                        />
                        <span
                            class="cmd-bar-item-name"
                            style="min-width: 45px; text-align: center"
                            >{{ valueTrigger(item.name) }}</span
                        >
                    </template>
                </fv-command-bar>
            </div>
            <div class="row main-table">
                <main-list
                    :model-value="itemList"
                    :edit="editable"
                    :theme="theme"
                    @open-file="openFile"
                    @label-click="
                        ($event) => {
                            currentItem = $event
                            show.rename = true
                        }
                    "
                    @rightclick="currentItem = $event"
                    @choose-items="currentChoosen = $event"
                    @insert-emoji="reviseItemEmoji($event.item, $event.emoji)"
                >
                    <template v-slot:row_expand="x">
                        <item-expand-info
                            :item="x.item"
                            :theme="theme"
                            :img="img"
                            :local="local"
                            @show-rename-item="
                                ($event) => {
                                    currentItem = $event
                                    show.rename = true
                                }
                            "
                            @open-pdf="({ item, mode }) => openPDF(item, mode)"
                            @show-metadata="showMetadata"
                            @revise-page-emoji="
                                ({ item, page, emoji }) => revisePageEmoji(item, page, emoji)
                            "
                            @open-editor="({ item, page }) => openEditor(item, page)"
                            @show-rename-item-page="
                                ({ item, page }) => showRenameItemPage(item, page)
                            "
                            @duplicate-item-page="({ item, page }) => duplicateItemPage(item, page)"
                            @delete-item-page="
                                ({ itemId, pageId }) => deleteItemPage(itemId, pageId)
                            "
                            @show-add-item-page="
                                ($event) => {
                                    currentItem = $event
                                    show.addItemPage = true
                                }
                            "
                        ></item-expand-info>
                    </template>
                    <template v-slot:menu>
                        <div>
                            <span @click="show.addItemPage = true">
                                <i
                                    class="ms-Icon ms-Icon--PageAdd"
                                    style="color: rgba(38, 188, 140, 1)"
                                ></i>
                                <p>{{ local('Add Page') }}</p>
                            </span>
                            <span @click="reviseItemPdf">
                                <img
                                    draggable="false"
                                    :src="img.pdf"
                                    alt=""
                                    style="width: 13px; height: 13px; object-fit: contain"
                                />
                                <p>{{ local('Revise PDF') }}</p>
                            </span>
                            <span @click="show.metadata = true">
                                <img
                                    draggable="false"
                                    :src="img.metadata"
                                    alt=""
                                    style="width: 13px; height: 13px; object-fit: contain"
                                />
                                <p>{{ local('Revise Metadata') }}</p>
                            </span>
                            <span @click="openFile(currentItem.id)">
                                <img
                                    draggable="false"
                                    :src="img.folder"
                                    alt=""
                                    style="width: 13px; height: 13px; object-fit: contain"
                                />
                                <p>{{ local('Open Folder') }}</p>
                            </span>
                            <hr />
                            <span @click="show.folder = true">
                                <img
                                    draggable="false"
                                    :src="img.favoriteIcon"
                                    alt=""
                                    style="width: 13px; height: 13px; object-fit: contain"
                                />
                                <p>{{ local('Induce to Partitions') }}</p>
                            </span>
                            <span @click="addToTransferCarrier">
                                <img
                                    draggable="false"
                                    :src="img.transferIcon"
                                    alt=""
                                    style="width: 13px; height: 13px; object-fit: contain"
                                />
                                <p>{{ local('Add to Transfer Carrier') }}</p>
                            </span>
                            <span @click="show.rename = true">
                                <i
                                    class="ms-Icon ms-Icon--Rename"
                                    :style="{
                                        color:
                                            theme === 'dark'
                                                ? 'rgba(118, 185, 237, 1)'
                                                : 'rgba(140, 148, 228, 1)'
                                    }"
                                ></i>
                                <p>{{ local('Rename Item') }}</p>
                            </span>
                            <span v-show="pid" @click="removeItemsFromPartition">
                                <img
                                    draggable="false"
                                    :src="img.removeIcon"
                                    alt=""
                                    style="width: 13px; height: 13px; object-fit: contain"
                                />
                                <p>{{ local('Remove From Partition') }}</p>
                            </span>
                            <span v-show="!pid" @click="deleteItem">
                                <img
                                    draggable="false"
                                    :src="img.deleteIcon"
                                    alt=""
                                    style="width: 13px; height: 13px; object-fit: contain"
                                />
                                <p>{{ local('Delete Item') }}</p>
                            </span>
                        </div>
                    </template>
                </main-list>
                <item-list-empty v-if="itemList.length === 0"></item-list-empty>
            </div>
            <div class="row bottom-control" v-if="pagination.totalPages > 0">
                <fv-pagination
                    :model-value="pagination.currentPage"
                    :total="pagination.totalPages"
                    :theme="theme"
                    :background="
                        theme === 'dark' ? 'rgba(75, 75, 75, 0.35)' : 'rgba(255, 255, 255, 0.85)'
                    "
                    :foreground="color"
                    :border-radius="6"
                    @update:modelValue="handlePageChange"
                ></fv-pagination>
            </div>
        </div>
        <add-item v-model:show="show.add" :partitionId="pid" @finished="getItems"></add-item>
        <rename-item :model-value="currentItem" v-model:show="show.rename"></rename-item>
        <add-item-page v-model:show="show.addItemPage" :item="currentItem"></add-item-page>
        <rename-item-page
            :model-value="currentItemPage"
            v-model:show="show.renameItemPage"
            :item="currentItem"
        ></rename-item-page>
        <metadata-panel v-model="show.metadata" :item="currentItem"></metadata-panel>
        <folder-window
            v-model="show.folder"
            :title="local('Induce to Partitions')"
            @choose-partitions="copyItemsToPartitions"
        ></folder-window>
    </div>
</template>

<script>
import addItem from '@/components/home/addItem.vue'
import renameItem from '@/components/home/renameItem.vue'
import mainList from '@/components/home/mainList.vue'
import itemExpandInfo from '@/components/home/itemExpandInfo.vue'
import itemListEmpty from '@/components/general/empty/itemListEmpty.vue'
import addItemPage from '@/components/home/addItemPage.vue'
import renameItemPage from '@/components/home/renameItemPage.vue'
import metadataPanel from '@/components/home/metadataPanel.vue'
import folderWindow from '@/components/general/folderWindow.vue'
import { useAppConfig } from '@/stores/appConfig'
import { useAcademicConfig } from '@/stores/academic'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { mapState, mapActions } from 'pinia'

import addIcon from '@/assets/home/add.svg'
import importIcon from '@/assets/home/import.svg'
import multipleIcon from '@/assets/home/multiple.svg'
import favoriteIcon from '@/assets/home/favorite.svg'
import transferIcon from '@/assets/home/transfer.svg'
import removeIcon from '@/assets/home/remove.svg'
import deleteIcon from '@/assets/home/delete.svg'

import pdf from '@/assets/home/pdf.svg'
import metadata from '@/assets/home/metadata.svg'
import folder from '@/assets/home/folder.svg'
import viewer from '@/assets/home/viewer.svg'
import fabulous from '@/assets/logo.svg'
import color from 'onecolor/lib/color'

export default {
    components: {
        addItem,
        renameItem,
        mainList,
        itemExpandInfo,
        itemListEmpty,
        addItemPage,
        renameItemPage,
        metadataPanel,
        folderWindow
    },
    props: {
        listMode: {
            type: String,
            default: 'all'
        }
    },
    data() {
        return {
            cmd: [
                {
                    name: () => this.local('Add'),
                    icon: 'Add',
                    iconColor: () =>
                        this.theme === 'dark' ? 'rgba(118, 185, 237, 1)' : 'rgba(140, 148, 228, 1)',
                    disabled: () => this.SourceDisabled || !this.lock,
                    func: () => {
                        this.show.add = true
                    },
                    img: addIcon
                },
                {
                    name: () => this.local('Import'),
                    icon: 'Upload',
                    iconColor: () =>
                        this.theme === 'dark' ? 'rgba(118, 185, 237, 1)' : 'rgba(140, 148, 228, 1)',
                    disabled: () => this.SourceDisabled || !this.lock,
                    func: this.importPdf,
                    img: importIcon
                },
                {
                    name: () => {
                        if (this.editable) return this.local('Cancel Multi-Selection')
                        return this.local('Multi-Selection')
                    },
                    icon: 'MultiSelect',
                    iconColor: () =>
                        this.theme === 'dark' ? 'rgba(118, 185, 237, 1)' : 'rgba(140, 148, 228, 1)',
                    disabled: () => this.SourceDisabled || !this.lock,
                    func: () => {
                        this.editable ^= true
                        if (!this.editable) this.currentChoosen = []
                    },
                    img: multipleIcon
                },
                {
                    name: () => this.local('Induce to Partitions'),
                    icon: 'FabricMovetoFolder',
                    iconColor: () =>
                        this.theme === 'dark' ? 'rgba(118, 185, 237, 1)' : 'rgba(140, 148, 228, 1)',
                    disabled: () => this.currentChoosen.length === 0 || !this.lock,
                    func: () => {
                        this.show.folder = true
                    },
                    img: favoriteIcon
                },
                {
                    name: () => this.local('Add to Transfer Carrier'),
                    icon: 'Send',
                    iconColor: 'rgba(229, 173, 70, 1)',
                    disabled: () => this.currentChoosen.length === 0 || !this.lock,
                    func: () => {
                        this.addToTransferCarrier()
                    },
                    img: transferIcon
                },
                {
                    name: () => this.local('Remove From Partition'),
                    icon: 'RemoveFrom',
                    iconColor: 'rgba(220, 62, 72, 1)',
                    show: () => this.currentChoosen.length > 0 && this.lock && this.pid,
                    disabled: () =>
                        this.currentChoosen.length === 0 || !this.lock || this.pid === false,
                    func: this.removeItemsFromPartition,
                    img: removeIcon
                },
                {
                    name: () => this.local('Delete'),
                    icon: 'Delete',
                    iconColor: 'rgba(220, 62, 72, 1)',
                    show: () => !(this.currentChoosen.length === 0 || !this.lock || this.pid),
                    disabled: () => this.currentChoosen.length === 0 || !this.lock || this.pid,
                    func: this.deleteItems,
                    img: deleteIcon
                }
            ],
            sortKey: {
                key: 'createDate',
                text: () => this.local('Create Date')
            },
            sortOptions: [
                { key: 'name', text: () => this.local('Name') },
                { key: 'metadata.title', text: () => this.local('Title') },
                {
                    key: 'metadata.publisher',
                    text: () => this.local('Publisher')
                },
                { key: 'createDate', text: () => this.local('Create Date') },
                { key: 'metadata.year', text: () => this.local('Year') }
            ],
            sortDesc: 1,
            editable: false,
            pid: null,
            partitionInfo: {
                id: '',
                name: ''
            },
            itemList: [],
            currentItem: {},
            currentChoosen: [],
            currentItemPage: {},
            currentSearch: {
                debounce: '',
                value: ''
            },
            pagination: {
                currentPage: 1,
                pageSize: 50,
                totalItems: 0,
                totalPages: 0,
                hasNextPage: false
            },
            img: {
                pdf: pdf,
                metadata: metadata,
                folder: folder,
                viewer: viewer,
                fabulous: fabulous,
                addIcon: addIcon,
                importIcon: importIcon,
                multipleIcon: multipleIcon,
                favoriteIcon: favoriteIcon,
                transferIcon: transferIcon,
                removeIcon: removeIcon,
                deleteIcon: deleteIcon
            },
            show: {
                add: false,
                rename: false,
                addItemPage: false,
                renameItemPage: false,
                metadata: false,
                folder: false,
                pdfImporter: false,
                chooseViewer: true
            }
        }
    },
    watch: {
        pid() {
            this.editable = false
            this.pagination.currentPage = 1
            this.getPartitionInfo()
            this.getItems()
        },
        $route() {
            if (this.listMode === 'all') this.pid = null
            else if (this.$route.params.id) {
                this.pid = this.$route.params.id
            }
        },
        currentDataPath() {
            this.editable = false
            this.pagination.currentPage = 1
            this.getPartitionInfo()
            this.getItems()
        },
        sortKey() {
            this.pagination.currentPage = 1
            this.getItems()
        },
        sortDesc() {
            this.pagination.currentPage = 1
            this.getItems()
        },
        'currentSearch.debounce'() {
            this.pagination.currentPage = 1
            this.getItems()
        },
        counter() {
            this.getItems()
        }
    },
    computed: {
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.configState.currentDataPath
        }),
        ...mapState(useAppConfig, {
            value: (state) => state.pdfImporter.value,
            item: (state) => state.pdfImporter.item,
            pdf_importer: (state) => state.pdfImporter.pdf_importer,
            counter: (state) => state.pdfImporter.counter,
            itemCarrier: (state) => state.itemCarrier,
            mode: (state) => state.pdfImporter.mode
        }),
        ...mapState(useTheme, {
            theme: 'theme',
            color: 'color'
        }),
        ...mapState(useAppConfig, ['local']),
        ...mapState(useDataStore, ['currentDataPath', 'currentDataPathItem']),
        ...mapState(useAcademicConfig, {
            academicLock: 'lock'
        }),
        lock() {
            return (
                this.academicLock.deleteItem &&
                this.academicLock.deleteItems &&
                this.academicLock.addItemsToPartition &&
                this.academicLock.removeItemsFromPartition
            )
        },
        SourceDisabled() {
            return !this.currentDataPath
        },
        isRemote() {
            return this.currentDataPathItem && !this.currentDataPathItem.local
        }
    },
    mounted() {
        this.getPartitionInfo()
        this.getItems()
    },
    methods: {
        ...mapActions(useAppConfig, {
            reviseEditor: 'reviseEditor',
            revisePdfImporter: 'revisePdfImporter',
            reviseItemCarrier: 'reviseItemCarrier'
        }),
        ...mapActions(useAcademicConfig, {
            getRemotePartition: 'getPartition',
            getRemoteItems: 'getItems',
            getRemoteAllItems: 'getAllItems',
            getRemoteItemsCount: 'getItemsCount',
            getRemoteAllItemsCount: 'getAllItemsCount',
            searchRemoteItems: 'getSearchItems',
            removeRemoteItem: 'deleteItem',
            removeRemoteItems: 'deleteItems',
            addRemoteItemsToPartition: 'addItemsToPartition',
            removeRemoteItemsFromPartition: 'removeItemsFromPartition',
            updateRemoteItem: 'updateItem',
            updateRemoteItemPage: 'updateItemPage',
            duplicateRemoteItemPage: 'duplicateItemPage',
            removeRemoteItemPage: 'deleteItemPage',
            openRemoteItemFile: 'openItemFile'
        }),
        getPartitionInfo() {
            if (!this.pid) {
                this.partitionInfo = {
                    id: 'all',
                    name: this.local('All')
                }
                return
            }
            this.getRemotePartition(this.currentDataPath, this.pid).then((res) => {
                if (res.status === 'success') {
                    this.partitionInfo = res.data
                } else if (res.code !== 423) {
                    this.$barWarning(res.message, {
                        status: 'warning'
                    })
                }
            })
        },
        normalizeCountResult(data) {
            if (typeof data === 'number') return data
            if (typeof data?.count === 'number') return data.count
            if (typeof data?.total === 'number') return data.total
            if (typeof data?.value === 'number') return data.value
            return 0
        },
        async refreshPaginationMeta(isSearching = false) {
            if (isSearching) {
                this.pagination.hasNextPage = false
                return
            }
            let res = null
            if (this.pid) {
                res = await this.getRemoteItemsCount(this.currentDataPath, this.pid)
            } else {
                res = await this.getRemoteAllItemsCount(this.currentDataPath)
            }
            if (res.status === 'success') {
                this.pagination.totalItems = this.normalizeCountResult(res.data)
                this.pagination.totalPages = Math.ceil(
                    this.pagination.totalItems / this.pagination.pageSize
                )
                this.pagination.hasNextPage = false
                if (this.pagination.totalPages === 0) {
                    this.pagination.currentPage = 1
                } else if (this.pagination.currentPage > this.pagination.totalPages) {
                    this.pagination.currentPage = this.pagination.totalPages
                }
            } else if (res.code !== 423) {
                this.$barWarning(res.message, {
                    status: 'warning'
                })
            }
        },
        async getItems() {
            if (this.SourceDisabled) return
            let sortDesc = this.sortDesc
            if (this.isRemote && sortDesc === -1) sortDesc = false
            const pageSize = this.pagination.pageSize
            const isSearching = Boolean(this.currentSearch.debounce)
            await this.refreshPaginationMeta(isSearching)
            if (!isSearching && this.pagination.totalPages === 0) {
                this.itemList = []
                return
            }
            const currentPage = this.pagination.currentPage
            const offset = (currentPage - 1) * pageSize
            let res = null
            if (!isSearching) {
                if (this.pid) {
                    res = await this.getRemoteItems(
                        this.currentDataPath,
                        this.pid,
                        pageSize,
                        offset,
                        this.sortKey.key,
                        sortDesc
                    )
                } else {
                    res = await this.getRemoteAllItems(
                        this.currentDataPath,
                        pageSize,
                        offset,
                        this.sortKey.key,
                        sortDesc
                    )
                }
            } else {
                res = await this.searchRemoteItems(
                    this.currentDataPath,
                    this.pid,
                    this.currentSearch.debounce,
                    pageSize + 1,
                    offset,
                    this.sortKey.key,
                    sortDesc
                )
            }
            if (res.status === 'success') {
                let list = Array.isArray(res.data) ? res.data : []
                if (isSearching) {
                    this.pagination.hasNextPage = list.length > pageSize
                    if (this.pagination.hasNextPage) {
                        list = list.slice(0, pageSize)
                    }
                    this.pagination.totalItems =
                        offset + list.length + (this.pagination.hasNextPage ? 1 : 0)
                    this.pagination.totalPages =
                        list.length === 0
                            ? currentPage > 1
                                ? currentPage - 1
                                : 0
                            : currentPage + (this.pagination.hasNextPage ? 1 : 0)
                    if (list.length === 0 && currentPage > 1) {
                        this.pagination.currentPage = currentPage - 1
                        return this.getItems()
                    }
                }
                list.forEach((el) => {
                    el.choosen = false
                })
                this.itemList = list
            } else if (res.code !== 423) {
                this.$barWarning(res.message, {
                    status: 'warning'
                })
            }
        },
        handlePageChange(page) {
            if (page === this.pagination.currentPage) return
            this.pagination.currentPage = page
            this.getItems()
        },
        async refreshListAfterMutation() {
            await this.refreshPaginationMeta(Boolean(this.currentSearch.debounce))
            if (!this.currentSearch.debounce && this.pagination.totalPages === 0) {
                this.pagination.currentPage = 1
            }
            await this.getItems()
        },
        deleteItem() {
            if (!this.currentItem.id || !this.lock) return
            this.$infoBox(this.local(`Are you sure to delete this item?`), {
                status: 'error',
                title: this.local('Delete Item'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    await this.removeRemoteItem(this.currentDataPath, this.currentItem.id)
                    await this.refreshListAfterMutation()
                },
                cancel: () => {}
            })
        },
        deleteItems() {
            if (!this.currentChoosen || !this.lock) return
            this.$infoBox(this.local(`Are you sure to delete these items?`), {
                status: 'error',
                title: this.local('Delete Items'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    let ids = this.currentChoosen.map((el) => el.id)
                    await this.removeRemoteItems(this.currentDataPath, ids)
                    this.currentChoosen = []
                    await this.refreshListAfterMutation()
                },
                cancel: () => {}
            })
        },
        reviseItemPdf() {
            this.revisePdfImporter({
                mode: 'item',
                item: this.currentItem
            })
            setTimeout(() => {
                this.pdf_importer.inputInspectClick()
            }, 300)
        },
        importPdf() {
            this.revisePdfImporter({
                mode: 'import'
            })
            setTimeout(() => {
                this.pdf_importer.inputInspectClick()
            }, 300)
        },
        openEditor(item, page) {
            this.reviseEditor({
                id: 'academic',
                dsId: this.currentDataPath,
                type: 'item',
                item: item,
                target: page,
                scrollTop: 0,
                displayMode: 'note',
                history: []
            })
            let path = `${this.currentDataPath}/${item.id}/${page.id}`
            let url = `/academic/${encodeURI(path.replace(/\//g, '\\'))}`
            this.$Go(url)
        },
        openFile(itemid, fileid, type = 'pdf') {
            if (type !== 'pdf') return
            if (!fileid && itemid.indexOf('/') > -1 && itemid.indexOf('.') > -1) {
                fileid = itemid.split('/')[1]
                fileid = fileid.split('.')[0]
                itemid = itemid.split('/')[0]
            }
            this.openRemoteItemFile(this.currentDataPath, itemid, fileid).then((res) => {
                const targetUrl = `${this.$server}${res.data.url}`
                window.open(targetUrl)
            })
        },
        openPDF(item, mode = 'outside') {
            if (mode === 'inside') {
                this.reviseEditor({
                    id: 'academic',
                    type: 'item',
                    item: item,
                    target: item.pages.length > 0 ? item.pages[0] : null,
                    scrollTop: 0,
                    displayMode: 'both',
                    history: []
                })
                let path = `${this.currentDataPath}/${item.id}/${item.pages.length > 0 ? item.pages[0].id : 'no-page'}`
                let url = `/academic/${encodeURI(path.replace(/\//g, '\\'))}`
                this.$Go(url)
            } else {
                this.openFile(item.id, item.pdf, 'pdf')
            }
        },
        async copyItemsToPartitions(partitions) {
            let choosen = [].concat(this.currentChoosen)
            if (
                this.currentItem.id &&
                !this.currentChoosen.find((it) => it.id === this.currentItem.id)
            )
                choosen.push(this.currentItem)
            if (choosen.length === 0) return
            let ids = choosen.map((el) => el.id)
            for (let partition of partitions) {
                let partitionid = partition.id
                let res = await this.addRemoteItemsToPartition(
                    this.currentDataPath,
                    partitionid,
                    ids
                )
                if (res.status !== 'success') {
                    this.$barWarning(res.message, {
                        status: 'warning'
                    })
                    break
                }
            }
            for (let item of this.itemList) {
                item.choosen = false
            }
            this.currentChoosen = []
            this.editable = false
        },
        addToTransferCarrier() {
            let items = this.currentChoosen
            if (items.length === 0) {
                items = [this.currentItem]
            }
            for (let i = 0; i < items.length; i++) {
                let item = JSON.parse(JSON.stringify(items[i]))
                if (!this.itemCarrier.itemsX.find((it) => it.item.id === item.id)) {
                    this.itemCarrier.itemsX.push({
                        uri: this.currentDataPath,
                        item,
                        choosen: true
                    })
                }
            }
            this.reviseItemCarrier({ itemsX: this.itemCarrier.itemsX })
        },
        removeItemsFromPartition() {
            if (this.pid === false) return
            let choosen = [].concat(this.currentChoosen)
            if (
                this.currentItem.id &&
                !this.currentChoosen.find((it) => it.id === this.currentItem.id)
            )
                choosen.push(this.currentItem)
            if (choosen.length === 0) return
            let ids = choosen.map((el) => el.id)
            this.removeRemoteItemsFromPartition(this.currentDataPath, this.pid, ids)
                .then((res) => {
                    if (res.status === 'success') {
                        this.currentChoosen = []
                        this.editable = false
                        this.refreshListAfterMutation()
                    } else {
                        this.$barWarning(res.message, {
                            status: 'warning'
                        })
                    }
                })
                .catch((res) => {
                    this.$barWarning(res.message, {
                        status: 'error'
                    })
                })
        },
        showRenameItemPage(item, page) {
            this.currentItem = item
            this.currentItemPage = page
            this.show.renameItemPage = true
        },
        showMetadata(item) {
            this.currentItem = item
            this.show.metadata = true
        },
        async reviseItemEmoji(item, emoji) {
            item.emoji = emoji
            await this.updateRemoteItem(this.currentDataPath, item).catch((res) => {
                if (res.message) {
                    this.$barWarning(res.message, {
                        status: 'error'
                    })
                }
            })
        },
        async revisePageEmoji(item, page, emoji) {
            if (!item) return
            page.emoji = emoji
            await this.updateRemoteItemPage(this.currentDataPath, item.id, page).catch((res) => {
                if (res.message) {
                    this.$barWarning(res.message, {
                        status: 'error'
                    })
                }
            })
        },
        async duplicateItemPage(item, page) {
            if (!item) return
            await this.duplicateRemoteItemPage(this.currentDataPath, item.id, page.id)
                .then((res) => {
                    item.pages.push(res.data)
                })
                .catch((res) => {
                    if (res.message) {
                        this.$barWarning(res.message, {
                            status: 'error'
                        })
                    }
                })
        },
        async deleteItemPage(itemId, pageId) {
            this.$infoBox(this.local(`Are you sure to delete this page?`), {
                status: 'error',
                title: this.local('Delete Page'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    await this.removeRemoteItemPage(this.currentDataPath, itemId, pageId)
                        .then(() => {
                            let item = this.itemList.find((el) => el.id === itemId)
                            item.pages = item.pages.filter((el) => el.id !== pageId)
                        })
                        .catch((res) => {
                            if (res.message) {
                                this.$barWarning(res.message, {
                                    status: 'error'
                                })
                            }
                        })
                },
                cancel: () => {}
            })
        }
    }
}
</script>

<style lang="scss">
.fabulous-home-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(246, 246, 246, 0.7);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;
    z-index: 1;

    &.dark {
        background: rgba(5, 9, 15, 0.9);

        .s-title {
            color: whitesmoke;
        }

        .m-home-block {
            .row {
                &.main-table {
                    background: rgba(16, 20, 28, 0.9);
                }

                .row-item-info {
                    background: rgba(37, 36, 35, 1);
                    color: whitesmoke;
                    box-shadow: 0px 12px 20px rgba(120, 120, 120, 0.2);
                }

                &.command-bar {
                    .cmd-bar-item-name {
                        color: whitesmoke;
                    }
                }
            }
        }
    }

    .s-row {
        position: relative;
        margin: 25px 0px;
        padding: 0px 15px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
    }

    .s-title {
        font-size: 24px;
        user-select: none;
        cursor: default;
    }

    .m-home-block {
        position: relative;
        width: 100%;
        height: 100%;
        flex: 1;
        box-sizing: border-box;
        overflow: hidden;

        display: flex;
        flex-direction: column;

        .row {
            position: relative;
            width: 100%;
            height: auto;
            padding: 12px;
            box-sizing: border-box;

            &.between {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            &.command-bar {
                padding: 0px 12px;
                display: flex;
                align-items: center;
                overflow-x: auto;

                .cmd-bar-item-name {
                    font-size: 12px;
                }
            }

            &.main-table {
                width: calc(100% - 24px);
                flex: 1;
                margin: 8px 12px;
                padding: 0px;
                padding-top: 3px;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 5px;
                box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1) inset;
                overflow: hidden;

                p.highlight {
                    text-align: center;
                    cursor: pointer;

                    &:hover {
                        color: rgba(149, 141, 241, 1);
                        text-decoration: underline;
                    }
                }

                i.drop-down-icon {
                    @include HcenterVcenter;

                    width: 100%;
                    height: 100%;

                    &:hover {
                        background: rgba(200, 200, 200, 0.3);
                    }
                }
            }

            &.bottom-control {
                width: calc(100% - 24px);
                height: 45px;
                margin: 8px 12px;
                padding: 0px;
                border-radius: 5px;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .sort-block {
                @include HcenterVcenter;
            }

            .fv-rightMenu {
                z-index: 3;
            }
        }
    }
}
</style>
