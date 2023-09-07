<template>
    <div
        class="fabulous-home-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div
            :draggable="false"
            class="s-row"
            style="margin-top: 45px;"
        >
            <p class="s-title">{{partitionInfo.name}}</p>
        </div>
        <div class="m-home-block">
            <div class="row between">
                <fv-text-box
                    v-model="currentSearch.value"
                    :placeholder="` ` + local('Filtering from current content')"
                    :theme="theme"
                    :background="theme === 'dark' ? 'rgba(75, 75, 75, 0.6)' : 'rgba(255, 255, 255, 0.6)'"
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
                        :inputBackground="theme === 'dark' ? 'rgba(75, 75, 75, 1)' : 'rgba(255, 255, 255, 0.6)'"
                        :borderRadius="3"
                        :theme="theme"
                        style="width: 120px;"
                    ></fv-combobox>
                    <fv-button
                        :theme="theme"
                        :disabled="sortKey.key == undefined"
                        :background="theme === 'light' ? 'white' : ''"
                        style="width: 35px; height: 35px; margin-left: 5px;"
                        :title="sortDesc == 1 ? local('Switch to Descending') : local('Switch to Ascending')"
                        :is-box-shadow="true"
                        @click="sortDesc = -sortDesc"
                    >
                        <i
                            class="ms-Icon"
                            :class="[`ms-Icon--${sortDesc == 1 ? 'Ascending' : 'Descending'}`]"
                            style="font-size: 18px;"
                        ></i>
                    </fv-button>
                </div>
            </div>
            <div class="row command-bar">
                <fv-command-bar
                    :options="cmd"
                    :theme="theme"
                    :background="theme === 'dark' ? 'transparent' : 'rgba(245, 245, 245, 0)'"
                    style="flex: 1; background: transparent;"
                ></fv-command-bar>
            </div>
            <div class="row main-table">
                <main-list
                    :value="itemList"
                    :edit="editable"
                    :theme="theme"
                    @open-file="openFile"
                    @label-click="($event) => {currentItem = $event; show.rename = true}"
                    @rightclick="currentItem = $event"
                    @choose-items="currentChoosen = $event"
                    @insert-emoji="reviseItemEmoji($event.item, $event.emoji)"
                >
                    <template v-slot:row_expand="x">
                        <div class="main-row-item-info">
                            <div
                                class="item"
                                style="display: flex;"
                                @click="($event) => {currentItem = x.item; show.rename = true}"
                            >
                                <fv-tag
                                    v-if="x.item.labels.length > 0"
                                    :value="x.item.labels"
                                    :theme="theme"
                                    style="width: 100%;"
                                ></fv-tag>
                                <i
                                    v-if="x.item.labels.length <= 0"
                                    class="ms-Icon ms-Icon--Tag"
                                ></i>
                                <p
                                    v-if="x.item.labels.length <= 0"
                                    style="margin-left: 15px;"
                                >{{local("Add Labels")}}</p>
                            </div>
                            <div
                                v-show="x.item.pdf"
                                class="item"
                                @dblclick="openFile(x.item.id, x.item.pdf, `.pdf`)"
                            >
                                <img
                                    draggable="false"
                                    :src="img.pdf"
                                    alt=""
                                    style="width: 18px; height: 18px; object-fit: contain;"
                                >
                                <p
                                    class="highlight"
                                    @click="openPDF(x.item, 'inside')"
                                >PDF</p>
                                <p
                                    v-show="!isRemote"
                                    class="sec highlight"
                                    @click="openFile(x.item.id, x.item.pdf, `.pdf`)"
                                >{{x.item.pdf}}.pdf</p>
                                <p></p>
                                <fv-button
                                    v-show="!isRemote"
                                    :theme="theme"
                                    style="width: 35px; height: 35px;"
                                    :title="local('Open Folder')"
                                    :is-box-shadow="true"
                                    @click="openFile(x.item.id)"
                                >
                                    <img
                                        draggable="false"
                                        :src="img.folder"
                                        alt=""
                                        style="width: 18px; height: 18px; object-fit: contain;"
                                    >
                                </fv-button>
                                <fv-button
                                    :theme="theme"
                                    style="width: 35px; height: 35px;"
                                    :title="local('Open in Browser')"
                                    :is-box-shadow="true"
                                    @click="openPDF(x.item, 'outside')"
                                >
                                    <img
                                        draggable="false"
                                        :src="img.viewer"
                                        alt=""
                                        style="width: 18px; height: 18px; object-fit: contain;"
                                    >
                                </fv-button>
                            </div>
                            <div
                                v-show="x.item.metadata"
                                class="item"
                            >
                                <img
                                    draggable="false"
                                    :src="img.metadata"
                                    alt=""
                                    style="width: 18px; height: 18px; object-fit: contain;"
                                >
                                <p
                                    class="highlight"
                                    @click="showMetadata(x.item)"
                                >Metadata</p>
                                <p
                                    v-show="!isRemote"
                                    class="sec highlight"
                                    @click="showMetadata(x.item)"
                                >{{x.item.id}}.metadata</p>
                                <p></p>
                                <fv-button
                                    v-show="!isRemote"
                                    :theme="theme"
                                    style="width: 35px; height: 35px;"
                                    :title="local('Open Folder')"
                                    :is-box-shadow="true"
                                    @click="openFile(x.item.id)"
                                >
                                    <img
                                        draggable="false"
                                        :src="img.folder"
                                        alt=""
                                        style="width: 18px; height: 18px; object-fit: contain;"
                                    >
                                </fv-button>
                                <fv-button
                                    :theme="theme"
                                    style="width: 35px; height: 35px;"
                                    :title="local('Open Folder')"
                                    :is-box-shadow="true"
                                    @click="showMetadata(x.item)"
                                >
                                    <img
                                        draggable="false"
                                        :src="img.folder"
                                        alt=""
                                        style="width: 18px; height: 18px; object-fit: contain;"
                                    >
                                </fv-button>
                            </div>
                            <div
                                v-for="(page, index) in x.item.pages"
                                :key="index"
                                class="item"
                            >
                                <emoji-callout
                                    :value="page.emoji"
                                    :theme="theme"
                                    style="width: 25px;"
                                    @insert-emoji="revisePageEmoji(x.item, page, $event)"
                                ></emoji-callout>
                                <p
                                    class="highlight"
                                    @click="openEditor(x.item, page)"
                                >{{page.name}}</p>
                                <p class="sec">{{page.id.split('-').pop()}}</p>
                                <p class="sec">{{$date(page.createDate)}}</p>
                                <fv-button
                                    theme="dark"
                                    :background="theme === 'dark' ? 'rgba(118, 185, 237, 1)' : 'rgba(0, 98, 158, 1)'"
                                    style="width: 35px; height: 35px;"
                                    :title="local('Rename')"
                                    :is-box-shadow="true"
                                    @click="showRenameItemPage(x.item, page)"
                                >
                                    <i class="ms-Icon ms-Icon--Rename"></i>
                                </fv-button>
                                <fv-button
                                    theme="dark"
                                    :background="theme === 'dark' ? 'rgba(118, 185, 237, 1)' : 'rgba(0, 98, 158, 1)'"
                                    style="width: 35px; height: 35px;"
                                    :title="local('Duplicate')"
                                    :is-box-shadow="true"
                                    @click="duplicateItemPage(x.item, page)"
                                >
                                    <i class="ms-Icon ms-Icon--Copy"></i>
                                </fv-button>
                                <fv-button
                                    theme="dark"
                                    background="rgba(220, 62, 72, 1)"
                                    style="width: 35px; height: 35px;"
                                    :title="local('Delete')"
                                    :is-box-shadow="true"
                                    @click="deleteItemPage(x.item.id, page.id)"
                                >
                                    <i class="ms-Icon ms-Icon--Delete"></i>
                                </fv-button>
                            </div>
                            <div
                                class="item"
                                style="display: flex;"
                                @click="($event) => {currentItem = x.item; show.addItemPage = true}"
                            >
                                <i class="ms-Icon ms-Icon--Add"></i>
                                <p style="margin-left: 15px;">{{local("Add Page")}}</p>
                            </div>
                        </div>
                    </template>
                    <template v-slot:menu>
                        <div>
                            <span @click="show.addItemPage = true">
                                <i
                                    class="ms-Icon ms-Icon--PageAdd"
                                    style="color: rgba(38, 188, 140, 1);"
                                ></i>
                                <p>{{local("Add Page")}}</p>
                            </span>
                            <span @click="reviseItemPdf">
                                <img
                                    draggable="false"
                                    :src="img.pdf"
                                    alt=""
                                    style="width: 13px; height: 13px; object-fit: contain;"
                                >
                                <p>{{local("Revise PDF")}}</p>
                            </span>
                            <span @click="show.metadata = true">
                                <img
                                    draggable="false"
                                    :src="img.metadata"
                                    alt=""
                                    style="width: 13px; height: 13px; object-fit: contain;"
                                >
                                <p>{{local("Revise Metadata")}}</p>
                            </span>
                            <span @click="openFile(currentItem.id)">
                                <img
                                    draggable="false"
                                    :src="img.folder"
                                    alt=""
                                    style="width: 13px; height: 13px; object-fit: contain;"
                                >
                                <p>{{local("Open Folder")}}</p>
                            </span>
                            <hr>
                            <span @click="show.folder = true">
                                <i
                                    class="ms-Icon ms-Icon--FabricMovetoFolder"
                                    :style="{color: theme === 'dark' ? 'rgba(118, 185, 237, 1)' : 'rgba(0, 90, 158, 1)'}"
                                ></i>
                                <p>{{local("Induce to Partitions")}}</p>
                            </span>
                            <span @click="addToTransferCarrier">
                                <i
                                    class="ms-Icon ms-Icon--Send"
                                    style="color: rgba(229, 173, 70, 1);"
                                ></i>
                                <p>{{local("Add to Transfer Carrier")}}</p>
                            </span>
                            <span @click="show.rename = true">
                                <i
                                    class="ms-Icon ms-Icon--Rename"
                                    :style="{color: theme === 'dark' ? 'rgba(118, 185, 237, 1)' : 'rgba(0, 90, 158, 1)'}"
                                ></i>
                                <p>{{local("Rename Item")}}</p>
                            </span>
                            <span
                                v-show="pid"
                                @click="removeItemsFromPartition"
                            >
                                <i
                                    class="ms-Icon ms-Icon--RemoveFrom"
                                    style="color: rgba(220, 62, 72, 1);"
                                ></i>
                                <p>{{local("Remove From Partition")}}</p>
                            </span>
                            <span
                                v-show="!pid"
                                @click="deleteItem"
                            >
                                <i
                                    class="ms-Icon ms-Icon--Delete"
                                    style="color: rgba(220, 62, 72, 1);"
                                ></i>
                                <p>{{local("Delete Item")}}</p>
                            </span>
                        </div>
                    </template>
                </main-list>
                <item-list-empty v-if="itemList.length === 0"></item-list-empty>
            </div>
        </div>
        <add-item
            :show.sync="show.add"
            :partitionId="pid"
            @finished="getItems"
        ></add-item>
        <rename-item
            :value="currentItem"
            :show.sync="show.rename"
        ></rename-item>
        <add-item-page
            :show.sync="show.addItemPage"
            :item="currentItem"
        ></add-item-page>
        <rename-item-page
            :value="currentItemPage"
            :show.sync="show.renameItemPage"
            :item="currentItem"
        ></rename-item-page>
        <metadata-panel
            v-model="show.metadata"
            :item="currentItem"
        ></metadata-panel>
        <folder-window
            v-model="show.folder"
            :title="local('Induce to Partitions')"
            @choose-partitions="copyItemsToPartitions"
        ></folder-window>
    </div>
</template>

<script>
import addItem from '@/components/home/addItem.vue';
import renameItem from '@/components/home/renameItem.vue';
import mainList from '@/components/home/mainList.vue';
import itemListEmpty from '@/components/general/empty/itemListEmpty.vue';
import addItemPage from '@/components/home/addItemPage.vue';
import renameItemPage from '@/components/home/renameItemPage.vue';
import metadataPanel from '@/components/home/metadataPanel.vue';
import folderWindow from '@/components/general/folderWindow.vue';
import emojiCallout from '@/components/general/callout/emojiCallout.vue';
import { mapMutations, mapState, mapGetters } from 'vuex';

import pdf from '@/assets/home/pdf.svg';
import metadata from '@/assets/home/metadata.svg';
import folder from '@/assets/home/folder.svg';
import viewer from '@/assets/home/viewer.svg';
import fabulous from '@/assets/logo.svg';

export default {
    components: {
        addItem,
        renameItem,
        mainList,
        itemListEmpty,
        addItemPage,
        renameItemPage,
        metadataPanel,
        folderWindow,
        emojiCallout
    },
    data() {
        return {
            cmd: [
                {
                    name: () => this.local('Add'),
                    icon: 'Add',
                    iconColor: () =>
                        this.theme === 'dark'
                            ? 'rgba(118, 185, 237, 1)'
                            : 'rgba(0, 90, 158, 1)',
                    disabled: () => this.SourceDisabled || !this.lock,
                    func: () => {
                        this.show.add = true;
                    }
                },
                {
                    name: () => this.local('Import'),
                    icon: 'Upload',
                    iconColor: () =>
                        this.theme === 'dark'
                            ? 'rgba(118, 185, 237, 1)'
                            : 'rgba(0, 90, 158, 1)',
                    disabled: () => this.SourceDisabled || !this.lock,
                    func: this.importPdf
                },
                {
                    name: () => {
                        if (this.editable)
                            return this.local('Cancel Multi-Selection');
                        return this.local('Multi-Selection');
                    },
                    icon: 'MultiSelect',
                    iconColor: () =>
                        this.theme === 'dark'
                            ? 'rgba(118, 185, 237, 1)'
                            : 'rgba(0, 90, 158, 1)',
                    disabled: () => this.SourceDisabled || !this.lock,
                    func: () => {
                        this.editable ^= true;
                        if (!this.editable) this.currentChoosen = [];
                    }
                },
                {
                    name: () => this.local('Induce to Partitions'),
                    icon: 'FabricMovetoFolder',
                    iconColor: () =>
                        this.theme === 'dark'
                            ? 'rgba(118, 185, 237, 1)'
                            : 'rgba(0, 90, 158, 1)',
                    disabled: () =>
                        this.currentChoosen.length === 0 || !this.lock,
                    func: () => {
                        this.show.folder = true;
                    }
                },
                {
                    name: () => this.local('Add to Transfer Carrier'),
                    icon: 'Send',
                    iconColor: 'rgba(229, 173, 70, 1)',
                    disabled: () =>
                        this.currentChoosen.length === 0 || !this.lock,
                    func: () => {
                        this.addToTransferCarrier();
                    }
                },
                {
                    name: () => this.local('Remove From Partition'),
                    icon: 'RemoveFrom',
                    iconColor: 'rgba(220, 62, 72, 1)',
                    show: () =>
                        this.currentChoosen.length > 0 && this.lock && this.pid,
                    disabled: () =>
                        this.currentChoosen.length === 0 ||
                        !this.lock ||
                        this.pid === false,
                    func: this.removeItemsFromPartition
                },
                {
                    name: () => this.local('Delete'),
                    icon: 'Delete',
                    iconColor: 'rgba(220, 62, 72, 1)',
                    show: () =>
                        !(
                            this.currentChoosen.length === 0 ||
                            !this.lock ||
                            this.pid
                        ),
                    disabled: () =>
                        this.currentChoosen.length === 0 ||
                        !this.lock ||
                        this.pid,
                    func: this.deleteItems
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
            img: {
                pdf: pdf,
                metadata: metadata,
                folder: folder,
                viewer: viewer,
                fabulous: fabulous
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
            },
            lock: true
        };
    },
    watch: {
        $route() {
            this.editable = false;
            this.getPartitionInfo();
            this.getItems();
        },
        data_index() {
            this.editable = false;
            this.getPartitionInfo();
            this.getItems();
        },
        sortKey() {
            this.getItems();
        },
        sortDesc() {
            this.getItems();
        },
        'currentSearch.debounce'() {
            this.getItems();
        },
        counter() {
            this.getItems();
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            value: (state) => state.pdfImporter.value,
            item: (state) => state.pdfImporter.item,
            pdf_importer: (state) => state.pdfImporter.pdf_importer,
            counter: (state) => state.pdfImporter.counter,
            itemCarrier: (state) => state.itemCarrier,
            mode: (state) => state.pdfImporter.mode,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath', 'currentDataPathItem']),
        pid() {
            if (!this.$route.params.id) return null;
            return this.$route.params.id;
        },
        SourceDisabled() {
            return !this.currentDataPath;
        },
        isRemote() {
            return this.currentDataPathItem && !this.currentDataPathItem.local;
        }
    },
    mounted() {
        this.getPartitionInfo();
        this.getItems();
    },
    methods: {
        ...mapMutations({
            reviseEditor: 'reviseEditor',
            revisePdfImporter: 'revisePdfImporter',
            reviseItemCarrier: 'reviseItemCarrier',
            toggleEditor: 'toggleEditor'
        }),
        getPartitionInfo() {
            if (!this.pid) {
                this.partitionInfo = {
                    id: 'all',
                    name: this.local('All')
                };
                return;
            }
            this.$auto.AcademicController.getPartition(
                this.currentDataPath,
                this.pid
            )
                .then((res) => {
                    if (res.status === 'success') {
                        this.partitionInfo = res.data;
                    } else {
                        this.$barWarning(res.message, {
                            status: 'warning'
                        });
                    }
                })
                .catch((res) => {
                    this.$barWarning(res.message, {
                        status: 'error'
                    });
                });
        },
        getItems() {
            if (this.SourceDisabled) return;
            let pid = this.pid;
            if (this.isRemote && !pid) pid = this.currentDataPath;
            let sortDesc = this.sortDesc;
            if (this.isRemote && sortDesc === -1) sortDesc = false;
            if (!this.currentSearch.debounce) {
                this.$auto.AcademicController.getItems(
                    this.currentDataPath,
                    pid,
                    -1,
                    0,
                    this.sortKey.key,
                    sortDesc
                )
                    .then((res) => {
                        if (res.status === 'success') {
                            res.data.forEach((el) => {
                                el.choosen = false;
                            });
                            this.itemList = res.data;
                        } else {
                            this.$barWarning(res.message, {
                                status: 'warning'
                            });
                        }
                    })
                    .catch((res) => {
                        this.$barWarning(res.message, {
                            status: 'error'
                        });
                    });
            } else
                this.$auto.AcademicController.getSearchItems(
                    this.currentDataPath,
                    this.pid,
                    this.currentSearch.debounce,
                    50,
                    0,
                    this.sortKey.key,
                    sortDesc
                )
                    .then((res) => {
                        if (res.status === 'success') {
                            res.data.forEach((el) => {
                                el.choosen = false;
                            });
                            this.itemList = res.data;
                        } else {
                            this.$barWarning(res.message, {
                                status: 'warning'
                            });
                        }
                    })
                    .catch((res) => {
                        this.$barWarning(res.message, {
                            status: 'error'
                        });
                    });
        },
        deleteItem() {
            if (!this.currentItem.id || !this.lock) return;
            this.$infoBox(this.local(`Are you sure to delete this item?`), {
                status: 'error',
                title: this.local('Delete Item'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    this.lock = false;
                    await this.$auto.AcademicController.deleteItem(
                        this.currentDataPath,
                        this.currentItem.id
                    )
                        .then(() => {
                            this.getItems();
                        })
                        .catch((res) => {
                            if (res.message)
                                this.$barWarning(res.message, {
                                    status: 'warning'
                                });
                        });
                    this.lock = true;
                },
                cancel: () => {}
            });
        },
        deleteItems() {
            if (!this.currentChoosen || !this.lock) return;
            this.$infoBox(this.local(`Are you sure to delete these items?`), {
                status: 'error',
                title: this.local('Delete Items'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    this.lock = false;
                    let ids = this.currentChoosen.map((el) => el.id);
                    await this.$auto.AcademicController.deleteItems(
                        this.currentDataPath,
                        ids
                    )
                        .then(() => {
                            this.getItems();
                            this.currentChoosen = [];
                        })
                        .catch((res) => {
                            if (res.message)
                                this.$barWarning(res.message, {
                                    status: 'warning'
                                });
                        });
                    this.lock = true;
                },
                cancel: () => {}
            });
        },
        reviseItemPdf() {
            this.revisePdfImporter({
                mode: 'item',
                item: this.currentItem
            });
            setTimeout(() => {
                this.pdf_importer.inputInspectClick();
            }, 300);
        },
        importPdf() {
            this.revisePdfImporter({
                mode: 'import'
            });
            setTimeout(() => {
                this.pdf_importer.inputInspectClick();
            }, 300);
        },
        openEditor(item, page) {
            this.reviseEditor({
                type: 'item',
                item: item,
                target: page,
                scrollTop: 0,
                displayMode: 0,
                history: []
            });
            this.toggleEditor(true);
        },
        openFile(itemid, fileid, type = 'pdf') {
            if (this.isRemote) {
                if (type !== 'pdf') return;
                if (
                    !fileid &&
                    itemid.indexOf('/') > -1 &&
                    itemid.indexOf('.') > -1
                ) {
                    fileid = itemid.split('/')[1];
                    fileid = fileid.split('.')[0];
                    itemid = itemid.split('/')[0];
                }
                this.$api.AcademicController.openItemFile(
                    this.currentDataPath,
                    itemid,
                    fileid
                ).then((res) => {
                    window.open(this.$server + res.data);
                });
            } else {
                this.$local_api.AcademicController.openItemFile(
                    this.currentDataPath,
                    itemid,
                    fileid,
                    type
                );
            }
        },
        openPDF(item, mode = 'outside') {
            if (mode === 'inside') {
                this.reviseEditor({
                    type: 'item',
                    item: item,
                    target: item.pages.length > 0 ? item.pages[0] : null,
                    scrollTop: 0,
                    displayMode: 1,
                    history: []
                });
                this.toggleEditor(true);
            } else {
                this.openFile(item.id, item.pdf, 'pdf');
            }
        },
        async copyItemsToPartitions(partitions) {
            let choosen = [].concat(this.currentChoosen);
            if (
                this.currentItem.id &&
                !this.currentChoosen.find((it) => it.id === this.currentItem.id)
            )
                choosen.push(this.currentItem);
            if (choosen.length === 0) return;
            let ids = choosen.map((el) => el.id);
            for (let partition of partitions) {
                let partitionid = partition.id;
                let res =
                    await this.$auto.AcademicController.addItemsToPartition(
                        this.currentDataPath,
                        partitionid,
                        ids
                    );
                if (res.status !== 'success') {
                    this.$barWarning(res.message, {
                        status: 'warning'
                    });
                    break;
                }
            }
            for (let item of this.itemList) {
                item.choosen = false;
                let index = this.itemList.indexOf(item);
                this.$set(this.itemList, index, item);
            }
            this.currentChoosen = [];
            this.editable = false;
        },
        addToTransferCarrier() {
            let items = this.currentChoosen;
            if (items.length === 0) {
                items = [this.currentItem];
            }
            for (let i = 0; i < items.length; i++) {
                let item = JSON.parse(JSON.stringify(items[i]));
                if (
                    !this.itemCarrier.itemsX.find(
                        (it) => it.item.id === item.id
                    )
                ) {
                    this.itemCarrier.itemsX.push({
                        uri: this.currentDataPath,
                        item,
                        choosen: true
                    });
                }
            }
            this.reviseItemCarrier({ itemsX: this.itemCarrier.itemsX });
        },
        removeItemsFromPartition() {
            if (this.pid === false) return;
            let choosen = [].concat(this.currentChoosen);
            if (
                this.currentItem.id &&
                !this.currentChoosen.find((it) => it.id === this.currentItem.id)
            )
                choosen.push(this.currentItem);
            if (choosen.length === 0) return;
            let ids = choosen.map((el) => el.id);
            this.$auto.AcademicController.removeItemsFromPartition(
                this.currentDataPath,
                this.pid,
                ids
            )
                .then((res) => {
                    if (res.status === 'success') {
                        this.currentChoosen = [];
                        this.editable = false;
                        this.getItems();
                    } else {
                        this.$barWarning(res.message, {
                            status: 'warning'
                        });
                    }
                })
                .catch((res) => {
                    this.$barWarning(res.message, {
                        status: 'error'
                    });
                });
        },
        showRenameItemPage(item, page) {
            this.currentItem = item;
            this.currentItemPage = page;
            this.show.renameItemPage = true;
        },
        showMetadata(item) {
            this.currentItem = item;
            this.show.metadata = true;
        },
        async reviseItemEmoji(item, emoji) {
            item.emoji = emoji;
            await this.$auto.AcademicController.updateItem(
                this.currentDataPath,
                item
            ).catch((res) => {
                if (res.message) {
                    this.$barWarning(res.message, {
                        status: 'error'
                    });
                }
            });
        },
        async revisePageEmoji(item, page, emoji) {
            if (!item) return;
            page.emoji = emoji;
            await this.$auto.AcademicController.updateItemPage(
                this.currentDataPath,
                item.id,
                page
            ).catch((res) => {
                if (res.message) {
                    this.$barWarning(res.message, {
                        status: 'error'
                    });
                }
            });
        },
        async duplicateItemPage(item, page) {
            if (!item) return;
            await this.$auto.AcademicController.duplicateItemPage(
                this.currentDataPath,
                item.id,
                page.id
            )
                .then((res) => {
                    item.pages.push(res.data);
                })
                .catch((res) => {
                    if (res.message) {
                        this.$barWarning(res.message, {
                            status: 'error'
                        });
                    }
                });
        },
        async deleteItemPage(itemId, pageId) {
            this.$infoBox(this.local(`Are you sure to delete this page?`), {
                status: 'error',
                title: this.local('Delete Page'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    await this.$auto.AcademicController.deleteItemPage(
                        this.currentDataPath,
                        itemId,
                        pageId
                    )
                        .then(() => {
                            let item = this.itemList.find(
                                (el) => el.id === itemId
                            );
                            item.pages = item.pages.filter(
                                (el) => el.id !== pageId
                            );
                        })
                        .catch((res) => {
                            if (res.message) {
                                this.$barWarning(res.message, {
                                    status: 'error'
                                });
                            }
                        });
                },
                cancel: () => {}
            });
        }
    }
};
</script>

<style lang="scss">
.fabulous-home-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(245, 245, 245, 0.9);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;
    z-index: 1;

    &.dark {
        background: rgba(36, 36, 36, 0.9);

        .s-title {
            color: whitesmoke;
        }

        .m-home-block {
            .row {
                &.main-table {
                    background: rgba(0, 0, 0, 0.6);
                }

                .row-item-info {
                    background: rgba(37, 36, 35, 1);
                    color: whitesmoke;
                    box-shadow: 0px 12px 20px rgba(120, 120, 120, 0.2);
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
            }

            &.main-table {
                width: calc(100% - 24px);
                flex: 1;
                margin: 8px 12px;
                padding: 0px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 5px;
                box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;

                p.highlight {
                    text-align: center;
                    cursor: pointer;

                    &:hover {
                        color: rgba(0, 120, 212, 1);
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

                .main-row-item-info {
                    position: relative;
                    width: 100%;
                    height: auto;
                    display: flex;
                    flex-direction: column;
                    z-index: 1;

                    .item {
                        width: 100%;
                        min-height: 55px;
                        height: 55px;
                        padding: 0px 15px;
                        font-size: 13.8px;
                        font-weight: 600;
                        border: rgba(200, 200, 200, 0.1) solid thin;
                        border-radius: 8px;
                        box-sizing: border-box;
                        grid-template-columns: 50px 160px 90px 150px 50px 50px 1fr;
                        display: grid;
                        align-items: center;
                        cursor: pointer;
                        user-select: none;

                        &:hover {
                            background: rgba(200, 200, 200, 0.1);
                        }

                        &:active {
                            background: rgba(200, 200, 200, 0.3);
                        }

                        .ms-Icon--PDF {
                            color: rgba(245, 62, 72, 1);
                        }

                        .ms-Icon--LinkedDatabase {
                            color: rgba(245, 149, 17, 1);
                        }

                        p {
                            @include nowrap;

                            &.sec {
                                font-size: 12px;
                                font-weight: normal;
                            }

                            &.highlight {
                                text-align: left;
                                cursor: pointer;

                                &:hover {
                                    color: rgba(0, 120, 212, 1);
                                    text-decoration: underline;
                                }
                            }
                        }
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