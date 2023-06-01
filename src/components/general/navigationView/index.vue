<template>
    <fv-navigation-panel
        :title="local('Fabulous')"
        class="navigation-view"
        :expand.sync="expand"
        :theme="theme"
        :background="navigationViewBackground"
        :settingTitle="local('Setting')"
        :mobileDisplay="mobileDisplay"
        :flyout-display="mobileDisplay"
        :expandWidth="350"
        :showNav="windowWidth < mobileDisplay"
        :style="{'z-index': windowWidth < mobileDisplay ? 2 : 1}"
        @setting-click="Go(`/settings`)"
        @back="$Back"
    >
        <template v-slot:searchBlock>
            <fv-search-box
                :options="FLAT"
                icon="Search"
                :placeholder="` ` + local('Search Partitions')"
                :theme="theme"
                borderWidth="1"
                background="rgba(255, 255, 255, 0.1)"
                :border-radius="30"
                :revealBorder="true"
                style="width: 95%;"
                @choose-result="treeItemClick"
            ></fv-search-box>
        </template>
        <template v-slot:panel>
            <div
                class="navigation-view-template"
                ref="view"
            >
                <div
                    v-show="expand && activeSystemMode !== 'notebook'"
                    class="navigation-view-mode-block"
                    :class="[{dark: theme === 'dark'}]"
                    @click="menuDisplayMode = 0"
                >
                    <div class="navigation-view-mode-left-block">
                        <img
                            draggable="false"
                            :src="img.dataSource"
                            alt=""
                            class="icon-img"
                        >
                        <p class="title">{{!dsInfo.name ? local('Unselected') : dsInfo.name}}</p>
                    </div>
                    <div
                        class="navigation-view-mode-right-block"
                        :title="local('Config Data Source')"
                        @click="$event => {$event.stopPropagation(); Go(`/settings`);}"
                    >
                        <i class="ms-Icon ms-Icon--Repair more-menu-btn"></i>
                    </div>
                </div>
                <transition name="expand-top-to-bottom">
                    <div
                        v-show="computeDisplay('ds')"
                        class="navigation-view-tree-view-block"
                    >
                        <fv-TreeView
                            v-show="treeList.length > 0"
                            v-model="treeList"
                            :theme="theme"
                            :backgroundColorHover="theme == 'dark' ? 'rgba(36, 36, 36, 0.3)' : 'rgba(245, 245, 245, 0.3)'"
                            :backgroundColorActive="theme == 'dark' ? 'rgba(36, 36, 36, 0.6)' : 'rgba(245, 245, 245, 0.6)'"
                            :leftIconForeground="'rgba(255, 180, 0, 0.8)'"
                            :expandClickMode="'normal'"
                            style="width: 100%; height: 100%; overflow: auto;"
                            ref="tree"
                            @click="treeItemClick"
                        >
                            <template v-slot:default="x">
                                <div
                                    class="tree-view-custom-item"
                                    :class="[{dark: theme === 'dark'}]"
                                    @contextmenu="rightClick($event, x.item)"
                                >
                                    <div class="tree-view-item-left-block">
                                        <emoji-callout
                                            v-if="x.item.loading === false"
                                            :value="x.item.emoji"
                                            :theme="theme"
                                            @insert-emoji="reviseEmoji(x.item, $event)"
                                        ></emoji-callout>
                                        <fv-progress-ring
                                            v-else
                                            loading="true"
                                            r="10"
                                            borderWidth="2"
                                            background="rgba(200, 200, 200, 0.1)"
                                            style="display: flex; align-item: center;"
                                        ></fv-progress-ring>
                                        <p
                                            v-show="!x.item.editable"
                                            class="tree-view-custom-label"
                                        >{{x.item.name}}</p>
                                        <fv-text-box
                                            v-model="x.item.name"
                                            v-show="x.item.editable"
                                            :theme="theme"
                                            :ref="`t:${x.item.id}`"
                                            class="tree-view-custom-text-box"
                                            background="rgba(255, 255, 255, 0.3)"
                                            border-color="rgba(250, 176, 70, 0.3)"
                                            focus-border-color="rgba(250, 176, 70, 1)"
                                            underline
                                            @click.native="$event.stopPropagation()"
                                            @keyup.native.enter="rename(x.item)"
                                        ></fv-text-box>
                                        <fv-button
                                            v-show="x.item.editable"
                                            :theme="theme"
                                            borderRadius="50"
                                            class="tree-view-custom-confirm"
                                            @click="$event => {$event.stopPropagation(); rename(x.item);}"
                                        >
                                            <i class="ms-Icon ms-Icon--CheckMark"></i>
                                        </fv-button>
                                    </div>
                                    <div
                                        class="tree-view-item-right-block"
                                        @click="rightClick($event, x.item)"
                                    >
                                        <i class="ms-Icon ms-Icon--More more-menu-btn"></i>
                                    </div>
                                </div>
                            </template>
                        </fv-TreeView>
                        <nav-empty v-show="treeList.length === 0"></nav-empty>
                        <loading
                            v-show="SourceDisabled"
                            :title="treeList.length === 0 ? local('Choose a source to start.') : local('Init a source to start.')"
                        ></loading>
                    </div>
                </transition>
                <transition name="expand-top-to-bottom">
                    <div
                        v-show="computeDisplay('ds')"
                        class="navigation-view-command-bar-block"
                        :class="[{dark: theme === 'dark'}]"
                    >
                        <div
                            v-for="(item, index) in dsCmdList"
                            :key="`command-bar-item: ${index}`"
                            class="command-item"
                            :class="[{disabled: item.disabled()}]"
                            @click="() => {item.disabled() ? null : item.func()}"
                        >
                            <span class="command-item-icon">
                                <img
                                    :src="img[item.img]"
                                    alt=""
                                    class="icon-img"
                                >
                            </span>
                            <p class="command-item-content">{{item.name()}}</p>
                        </div>
                    </div>
                </transition>
                <div
                    v-show="expand && activeSystemMode !== 'ds'"
                    class="navigation-view-mode-block"
                    :class="[{dark: theme === 'dark'}]"
                    @click="menuDisplayMode = 1"
                >
                    <div class="navigation-view-mode-left-block">
                        <img
                            draggable="false"
                            :src="img.notebook"
                            alt=""
                            class="icon-img"
                        >
                        <p class="title">{{!localPath ? local('Notebook') : localPathFolderName}}</p>
                    </div>
                    <div
                        v-show="localPath"
                        class="navigation-view-mode-right-block"
                    >
                        <i
                            class="ms-Icon ms-Icon--SubscriptionAdd more-menu-btn"
                            :title="local('New Note')"
                            @click="() => $refs.local_view.createFile()"
                        ></i>
                        <i
                            class="ms-Icon ms-Icon--NewFolder more-menu-btn"
                            :title="local('New Folder')"
                            @click="() => $refs.local_view.createFolder()"
                        ></i>
                        <i
                            class="ms-Icon ms-Icon--Refresh more-menu-btn"
                            :title="local('Refresh Folder')"
                            @click="() => $refs.local_view.refreshFolder()"
                        ></i>
                        <i
                            class="ms-Icon ms-Icon--CollapseContent more-menu-btn"
                            :title="local('Collaspe All')"
                            @click="() => $refs.local_view.collapseAll()"
                        ></i>
                    </div>
                </div>
                <transition name="expand-bottom-to-top">
                    <local-tree-view
                        v-show="computeDisplay('notebook')"
                        v-model="localPath"
                        :theme="theme"
                        :local="local"
                        :unsave="unsave"
                        :uri="SourceDisabled ? 'localTree' : data_path[data_index]"
                        :watchAllExtensions="watchAllExtensions"
                        :toggleEditor="toggleEditor"
                        :Go="Go"
                        ref="local_view"
                    ></local-tree-view>
                </transition>
                <transition name="expand-bottom-to-top">
                    <div
                        v-show="computeDisplay('notebook')"
                        class="navigation-view-command-bar-block"
                        :class="[{dark: theme === 'dark'}]"
                    >
                        <div
                            v-for="(item, index) in notebookCmdList"
                            :key="`command-bar-item: ${index}`"
                            class="command-item"
                            :class="[{disabled: item.disabled()}]"
                            @click="() => {item.disabled() ? null : item.func()}"
                        >
                            <span class="command-item-icon">
                                <img
                                    :src="img[item.img]"
                                    alt=""
                                    class="icon-img"
                                >
                            </span>
                            <p class="command-item-content">{{item.name()}}</p>
                        </div>
                    </div>
                </transition>
            </div>
            <right-menu
                ref="rightMenu"
                class="nv-right-menu"
                :rightMenuWidth="rightMenuWidth"
                :theme="theme"
            >
                <div>
                    <span
                        v-if="false"
                        v-show="rightMenuItem.type === 'partition'"
                    >
                        <i
                            class="ms-Icon ms-Icon--Add"
                            style="color: rgba(0, 153, 204, 1);"
                        ></i>
                        <p>{{local("New Item (Not Useful)")}}</p>
                    </span>
                    <span
                        v-show="rightMenuItem.type === 'group'"
                        @click="addNewOne(rightMenuItem, 'partition')"
                    >
                        <img
                            draggable="false"
                            :src="img.partition"
                            alt=""
                            class="icon-img"
                        >
                        <p>{{local("New Partition")}}</p>
                    </span>
                    <span
                        v-show="rightMenuItem.type === 'group'"
                        @click="addNewOne(rightMenuItem)"
                    >
                        <img
                            draggable="false"
                            :src="img.group"
                            alt=""
                            class="icon-img"
                        >
                        <p>{{local("New Group")}}</p>
                    </span>
                    <hr>
                    <span @click="showRename(rightMenuItem)">
                        <i
                            class="ms-Icon ms-Icon--Rename"
                            style="color: rgba(0, 120, 212, 1);"
                        ></i>
                        <p>{{local("Rename")}}</p>
                    </span>
                    <span @click="deleteConfirm(rightMenuItem)">
                        <i
                            class="ms-Icon ms-Icon--Delete"
                            style="color: rgba(173, 38, 45, 1);"
                        ></i>
                        <p>{{local("Delete")}}</p>
                    </span>
                </div>
            </right-menu>
        </template>
    </fv-navigation-panel>
</template>

<script>
import loading from '@/components/general/loading.vue';
import navEmpty from '@/components/general/empty/navEmpty.vue';
import localTreeView from '@/components/general/navigationView/localTreeView.vue';
import rightMenu from '@/components/general/rightMenu.vue';
import emojiCallout from '@/components/general/callout/emojiCallout.vue';
import { mapMutations, mapState, mapGetters } from 'vuex';

import dataSource from '@/assets/nav/dataSource.svg';
import notebook from '@/assets/nav/notebook.svg';
import groupImg from '@/assets/nav/group.svg';
import partitionImg from '@/assets/nav/partition.svg';
import templatesImg from '@/assets/nav/template.svg';
import folderImg from '@/assets/nav/folder.svg';
import newFolderImg from '@/assets/nav/newFolder.svg';
import refreshImg from '@/assets/nav/refresh.svg';
import pasteImg from '@/assets/nav/paste.svg';
import allImg from '@/assets/nav/all.svg';

export default {
    name: 'fab-navigation-view',
    components: {
        loading,
        navEmpty,
        localTreeView,
        rightMenu,
        emojiCallout
    },
    props: {
        rightMenuWidth: {
            default: 200
        }
    },
    data() {
        return {
            expand: true,
            dsCmdList: [
                {
                    name: () => this.local('Add Partition'),
                    func: () => this.addNewOne(null, 'partition'),
                    img: 'partition',
                    disabled: () => this.SourceDisabled,
                    iconColor: 'rgba(213, 99, 70, 1)'
                },
                {
                    name: () => this.local('Add Group'),
                    func: () => this.addNewOne(),
                    img: 'group',
                    disabled: () => this.SourceDisabled,
                    iconColor: 'rgba(172, 84, 206, 1)'
                },
                {
                    name: () => this.local('Templates Page'),
                    img: 'templates',
                    func: () => this.Go('/templates'),
                    disabled: () => this.SourceDisabled
                },
                {
                    name: () => this.local('All Content'),
                    img: 'all',
                    func: () => this.Go('/'),
                    disabled: () => this.SourceDisabled
                }
            ],
            notebookCmdList: [
                {
                    name: () => this.local('New Folder'),
                    func: () => this.$refs.local_view.createFolder(),
                    img: 'newFolder',
                    disabled: () => !this.localPath,
                    iconColor: 'rgba(213, 99, 70, 1)'
                },
                {
                    name: () => this.local('Choose Folder'),
                    func: () => this.$refs.local_view.chooseFolder(),
                    img: 'folder',
                    disabled: () => false,
                    iconColor: 'rgba(213, 99, 70, 1)'
                },
                {
                    name: () => this.local('Refresh Folder'),
                    func: () => this.$refs.local_view.refreshFolder(),
                    img: 'refresh',
                    disabled: () => !this.localPath,
                    iconColor: 'rgba(172, 84, 206, 1)'
                },
                {
                    name: () => this.local('Paste to Root'),
                    img: 'paste',
                    func: () => this.$refs.local_view.rootPaste(),
                    disabled: () =>
                        this.$refs.local_view
                            ? this.$refs.local_view.rootPasteDisabled()
                            : true
                }
            ],
            dsInfo: {
                id: '',
                name: '',
                createDate: ''
            },
            img: {
                dataSource,
                notebook,
                group: groupImg,
                partition: partitionImg,
                templates: templatesImg,
                folder: folderImg,
                newFolder: newFolderImg,
                refresh: refreshImg,
                paste: pasteImg,
                all: allImg
            },
            treeList: [],
            FLAT: [],
            localPath: '',
            rightMenuItem: {},
            menuDisplayMode: 0,
            lock: {
                treeList: true
            }
        };
    },
    watch: {
        data_path() {
            this.getDSInfo();
            this.refreshTreeList();
        },
        data_index() {
            this.getDSInfo();
            this.refreshTreeList();
        },
        windowWidth() {
            if (this.windowWidth > this.mobileDisplay) this.expand = true;
        },
        localPath() {
            this.reviseConfig({
                lastLocalPath: this.localPath
            });
        },
        lastLocalPath() {
            this.localPath = this.lastLocalPath;
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            language: (state) => state.config.language,
            lastLocalPath: (state) => state.config.lastLocalPath,
            activeSystemMode: (state) => state.config.activeSystemMode,
            watchAllExtensions: (state) => state.config.watchAllExtensions,
            unsave: (state) => state.editor.unsave,
            windowWidth: (state) => state.window.width,
            mobileDisplay: (state) => state.window.mobileDisplay,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local']),
        navigationViewBackground() {
            if (this.theme == 'light') return 'rgba(242, 242, 242, 0.8)';
            return 'rgba(0, 0, 0, 0.8)';
        },
        SourceDisabled() {
            return !this.data_path[this.data_index];
        },
        localPathFolderName() {
            let pathList = this.localPath.split(/[\\/]/);
            return pathList[pathList.length - 1];
        },
        computeDisplay() {
            return (name) => {
                if (name === 'ds') {
                    if (this.activeSystemMode === 'ds') return true;
                    if (this.activeSystemMode === 'notebook') return false;
                    return this.menuDisplayMode === 0;
                }
                if (name === 'notebook') {
                    if (this.activeSystemMode === 'ds') return false;
                    if (this.activeSystemMode === 'notebook') return true;
                    return this.menuDisplayMode === 1;
                }
            };
        }
    },
    mounted() {
        this.getDSInfo();
        this.refreshTreeList();
        this.localPath = this.lastLocalPath;
        window.addEventListener('click', this.whiteClickClearTmp);
    },
    methods: {
        ...mapMutations({
            reviseConfig: 'reviseConfig',
            toggleEditor: 'toggleEditor'
        }),
        getDSInfo() {
            if (this.SourceDisabled) return;
            this.$local_api.Academic.getDataSourceInfo(
                this.data_path[this.data_index]
            )
                .then((res) => {
                    if (res.status === 'success') {
                        this.dsInfo = res.data;
                    } else
                        this.$barWarning(res.message, {
                            status: 'warning'
                        });
                })
                .catch((err) => {
                    this.$barWarning(err, {
                        status: 'error'
                    });
                });
        },
        async refreshTreeList() {
            if (!this.data_path[this.data_index]) return;
            if (!this.lock.treeList) return;
            this.lock.treeList = false;
            this.treeList = [];
            this.FLAT = [];
            let result = [];
            let groups = await this.$local_api.Academic.getRootGroups(
                this.data_path[this.data_index]
            );
            let partitions = await this.$local_api.Academic.getRootPartitions(
                this.data_path[this.data_index]
            );
            groups = groups.data;
            partitions = partitions.data;
            groups.forEach((el) => {
                result.push(this.itemFormat(el));
            });
            partitions.forEach((el) => {
                result.push(this.itemFormat(el, 'partition'));
            });
            let arr = [].concat(result);
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].children) arr = arr.concat(arr[i].children);
                this.hotPushFLAT(arr[i]);
            }
            this.treeList = result;
            this.lock.treeList = true;
        },
        itemFormat(item, type = 'group') {
            let obj = {
                ...item,
                editable: false,
                children:
                    type === 'group'
                        ? item.children
                            ? item.children
                            : []
                        : null,
                expanded: false,
                loading: false,
                finished: false,
                type
            };
            return obj;
        },
        listFormat(arr, type = 'group') {
            let list = [];
            arr.forEach((item) => {
                let obj = this.itemFormat(item, type);
                list.push(obj);
            });
            return list;
        },
        hotPushFLAT(item) {
            let index = this.FLAT.findIndex((it) => it.id === item.id);
            if (index > -1) {
                let oriItem = this.FLAT[index];
                for (let key in oriItem) {
                    let skipKey = ['children', 'expanded'];
                    if (!skipKey.includes(key)) {
                        oriItem[key] = item[key];
                    }
                }
            } else {
                this.FLAT.push(item);
            }
        },
        async loadChildren(item) {
            item.loading = true;
            let groupList = [];
            let partitionList = [];
            await this.$local_api.Academic.getGroups(
                this.data_path[this.data_index],
                item.id
            )
                .then((res) => {
                    if (res.code === 200) {
                        let children = res.data;
                        let formatChildren = this.listFormat(children);
                        for (let item of formatChildren) {
                            this.hotPushFLAT(item);
                        }
                        groupList = formatChildren;
                    } else {
                        this.$barWarning(res.message, {
                            status: 'warning'
                        });
                    }
                })
                .catch((e) => {
                    this.$barWarning(e, {
                        status: 'error'
                    });
                    item.loading = false;
                });
            await this.$local_api.Academic.getPartitions(
                this.data_path[this.data_index],
                item.id
            )
                .then((res) => {
                    if (res.code === 200) {
                        let children = res.data;
                        let formatChildren = this.listFormat(
                            children,
                            'partition'
                        );
                        for (let child of formatChildren) {
                            child.parent = item.id;
                            this.hotPushFLAT(child);
                        }
                        partitionList = formatChildren;
                    } else {
                        this.$barWarning(res.message, {
                            status: 'warning'
                        });
                    }
                })
                .catch((e) => {
                    this.$barWarning(e, {
                        status: 'error'
                    });
                    item.loading = false;
                });
            let final_list = groupList.concat(partitionList);
            this.hotReplace(item.children, final_list);
            item.expanded = true;
            item.finished = true;
            item.loading = false;
            this.$refs.tree.$forceUpdate();
        },
        hotReplace(arr, tgt) {
            for (let i = arr.length - 1; i >= 0; i--) {
                let index = tgt.findIndex((it) => it.id === arr[i].id);
                if (index === -1) {
                    arr.splice(i, 1);
                    i--;
                }
            }
            tgt.forEach((item) => {
                let index = arr.findIndex((it) => it.id === item.id);
                if (index === -1) {
                    arr.push(item);
                } else {
                    let oriItem = arr[index];
                    for (let key in oriItem) {
                        let skipKey = ['children', 'expanded'];
                        if (!skipKey.includes(key)) {
                            oriItem[key] = item[key];
                        }
                    }
                }
            });
        },
        removeTmp() {
            for (let i = this.treeList.length - 1; i >= 0; i--) {
                if (this.treeList[i].isTmp) {
                    this.treeList.splice(i, 1);
                }
            }
            for (let item of this.FLAT) {
                if (item.children) {
                    for (let i = item.children.length - 1; i >= 0; i--) {
                        if (item.children[i].isTmp) {
                            item.children.splice(i, 1);
                        }
                    }
                }
            }
            for (let i = this.FLAT.length - 1; i >= 0; i--) {
                if (this.FLAT[i].isTmp) {
                    this.FLAT.splice(i, 1);
                    i--;
                }
            }
            this.$refs.tree.$forceUpdate();
        },
        async addNewOne(parent = null, type = 'group') {
            this.removeTmp();
            let tmpItem = {};
            tmpItem.id = this.$Guid();
            tmpItem.name =
                type === 'group'
                    ? this.local('New Group Name')
                    : this.local('New Partition Name');
            tmpItem.emoji = type === 'group' ? '📁' : '📔';
            tmpItem.parent = parent ? parent.id : null;
            tmpItem.createDate = this.$SDate.DateToString(new Date());
            tmpItem.isTmp = true;
            tmpItem.editable = true;
            tmpItem.type = type;
            tmpItem.children = type === 'group' ? [] : null;
            tmpItem.loading = false;
            tmpItem.finished = true;

            if (parent) {
                if (parent.finished) parent.expanded = true;
                else await this.loadChildren(parent);
                parent.children.unshift(tmpItem);
            } else this.treeList.push(tmpItem);
            this.FLAT.push(tmpItem);
            setTimeout(() => {
                let textbox = this.$refs[`t:${tmpItem.id}`];
                textbox.focus();
                document.execCommand('selectAll');
            }, 300);
        },
        showRename(item) {
            if (item.loading) return;
            item.editable = true;
            setTimeout(() => {
                let textbox = this.$refs[`t:${item.id}`];
                textbox.focus();
                document.execCommand('selectAll');
            }, 300);
        },
        async rename(item) {
            item = this.FLAT.find((it) => it.id === item.id);
            let res = null;
            let mode = null;
            if (item.isTmp) {
                if (item.type === 'group') {
                    res = await this.$local_api.Academic.createGroup(
                        this.data_path[this.data_index],
                        item.parent,
                        item
                    );
                } else
                    res = await this.$local_api.Academic.createPartition(
                        this.data_path[this.data_index],
                        item.parent,
                        item
                    );
                mode = 'add';
            } else {
                if (item.type === 'group') {
                    res = await this.$local_api.Academic.updateGroup(
                        this.data_path[this.data_index],
                        item
                    );
                } else
                    res = await this.$local_api.Academic.updatePartition(
                        this.data_path[this.data_index],
                        item.parent,
                        item
                    );
                mode = 'update';
            }
            if (res.status !== 'success') {
                this.$barWarning(res.message, {
                    status: 'error'
                });
                return;
            }
            if (mode === 'add') {
                let data = res.data;
                for (let key in data) {
                    item[key] = data[key];
                }
                item.children = item.type === 'group' ? [] : null;
                item.isTmp = false;
            }
            item.editable = false;
        },
        async reviseEmoji(item, emoji) {
            if (item.loading) return;
            item = this.FLAT.find((it) => it.id === item.id);
            item.emoji = emoji;
            item.loading = true;
            let res = null;
            if (item.type === 'group') {
                res = await this.$local_api.Academic.updateGroup(
                    this.data_path[this.data_index],
                    item
                );
            } else
                res = await this.$local_api.Academic.updatePartition(
                    this.data_path[this.data_index],
                    item.parent,
                    item
                );
            item.loading = false;
            if (res.status !== 'success') {
                this.$barWarning(res.message, {
                    status: 'error'
                });
                return;
            }
        },
        deleteConfirm(item) {
            this.$infoBox(
                this.local(`Are you sure to delete this ${item.type}?`),
                {
                    status: 'error',
                    title: this.local('Delete'),
                    confirmTitle: this.local('Confirm'),
                    cancelTitle: this.local('Cancel'),
                    theme: this.theme,
                    confirm: () => {
                        this.delete(item);
                    },
                    cancel: () => {}
                }
            );
        },
        async delete(item) {
            if (item.isTmp) return;
            if (item.loading) return;
            item = this.FLAT.find((it) => it.id === item.id);
            item.loading = true;
            let res = null;
            if (item.type === 'group') {
                res = await this.$local_api.Academic.deleteGroup(
                    this.data_path[this.data_index],
                    item.id
                );
            } else
                res = await this.$local_api.Academic.deletePartition(
                    this.data_path[this.data_index],
                    item.parent,
                    item.id
                );
            item.loading = false;
            if (res.status !== 'success') {
                this.$barWarning(res.message, {
                    status: 'error'
                });
                return;
            }
            item.isTmp = true;
            this.removeTmp();
        },
        rightClick($event, item) {
            $event.preventDefault();
            $event.stopPropagation();
            this.rightMenuItem = item;
            this.$refs.rightMenu.rightClick($event, this.$el);
        },
        collapseFunc(func) {
            this.expand = true;
            func();
        },
        treeItemClick(item) {
            if (item.isTmp) return;
            if (item.loading) return;
            item = this.FLAT.find((it) => it.id === item.id);
            if (item.type === 'group') {
                if (!item.finished) this.loadChildren(item);
            } else {
                let id = item.id;
                if (this.$route.params.id === id) return 0;
                this.Go(`/partitions/${id}`);
            }
        },
        whiteClickClearTmp(event) {
            let x = event.target;
            let _self = false;
            while (x && x.tagName && x.tagName.toLowerCase() != 'body') {
                let classList = [...x.classList];
                if (
                    classList.includes('fv-TreeView--item') ||
                    classList.includes('navigation-view-mode-block') ||
                    classList.includes('navigation-view-command-bar-block') ||
                    classList.includes('nv-right-menu')
                ) {
                    _self = true;
                    break;
                }
                x = x.parentNode;
            }
            if (!_self) {
                this.removeTmp();
                for (let item of this.FLAT) {
                    item.editable = false;
                }
                this.$refs.tree.$forceUpdate();
            }
        },
        Go(path) {
            if (this.$route.path === path) return 0;
            if (this.windowWidth < this.mobileDisplay) this.expand = false;
            this.$Go(path);
        }
    },
    beforeDestroy() {
        window.removeEventListener('click', this.whiteClickClearTmp);
    }
};
</script>

<style lang="scss">
.navigation-view {
    position: relative;
    height: 100%;
    z-index: 5;

    .navigation-view-template {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .navigation-view-mode-block {
            position: relative;
            width: calc(100% - 40px);
            margin: 3px 20px;
            padding: 8px 15px;
            border-radius: 6px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            transition: all 0.6s;
            user-select: none;

            &:hover {
                background: rgba(200, 200, 200, 0.1);

                .navigation-view-mode-right-block {
                    opacity: 1;
                }
            }

            &:active {
                background: rgba(200, 200, 200, 0.3);
            }

            &.dark {
                color: rgba(245, 245, 245, 0.8);
            }

            .navigation-view-mode-left-block {
                @include Vcenter;

                flex: 1;
            }

            .navigation-view-mode-right-block {
                @include HendVcenter;

                width: 100px;
                opacity: 0;
                transition: all 0.3s;

                .more-menu-btn {
                    @include HcenterVcenter;

                    width: 25px;
                    height: 25px;
                    font-size: 12px;
                    border-radius: 8px;

                    &:hover {
                        background: rgba(200, 200, 200, 0.2);
                    }

                    &:active {
                        background: rgba(200, 200, 200, 0.3);
                    }
                }
            }

            .title {
                margin-left: 15px;
                font-weight: bold;
                color: rgba(255, 180, 0, 1);
            }
        }

        .navigation-view-tree-view-block {
            position: relative;
            flex: 1;
            overflow: hidden;

            .tree-view-custom-item {
                position: relative;
                width: 100%;
                box-sizing: border-box;
                display: flex;
                align-items: center;

                &.dark {
                    color: whitesmoke;
                }

                .tree-view-item-left-block {
                    @include Vcenter;

                    flex: 1;

                    .tree-view-custom-label {
                        margin-left: 5px;
                        user-select: none;
                        cursor: default;
                    }

                    .tree-view-custom-text-box {
                        width: 100%;
                        margin-left: 5px;
                        flex: 1;
                    }

                    .tree-view-custom-confirm {
                        width: 30px;
                        height: 30px;
                        flex-shrink: 0;
                        margin-left: 5px;
                        margin-right: 25px;

                        i.ms-Icon {
                            margin: 0px;
                            padding: 0px;
                            display: flex;
                            align-items: center;
                        }
                    }
                }

                .tree-view-item-right-block {
                    @include Vcenter;

                    width: 50px;

                    .more-menu-btn {
                        @include HcenterVcenter;

                        width: 25px;
                        height: 25px;
                        border-radius: 8px;

                        &:hover {
                            background: rgba(200, 200, 200, 0.2);
                        }

                        &:active {
                            background: rgba(200, 200, 200, 0.3);
                        }
                    }
                }
            }
        }

        .navigation-view-command-bar-block {
            position: relative;
            width: calc(100% - 40px);
            height: auto;
            margin: 20px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 12px;

            &.dark {
                background: rgba(0, 0, 0, 0.3);

                .command-item {
                    .command-item-icon {
                        background: rgba(36, 36, 36, 1);
                    }

                    .command-item-content {
                        color: rgba(245, 245, 245, 0.9);
                    }
                }
            }

            .command-item {
                @include Vcenter;

                position: relative;
                width: calc(100% - 30px);
                height: 45px;
                margin: 3px 15px;
                padding: 0px 15px;
                border-radius: 6px;
                box-sizing: border-box;
                transition: all 0.3s;

                &:hover {
                    background: rgba(120, 120, 120, 0.1);
                }

                &:active {
                    background: rgba(120, 120, 120, 0.2);
                }

                &.disabled {
                    filter: grayscale(1);
                    opacity: 0.6;

                    &:hover {
                        background: transparent;
                    }

                    &:active {
                        background: transparent;
                    }
                }

                .command-item-icon {
                    @include HcenterVcenter;

                    position: relative;
                    width: 30px;
                    height: 30px;
                    background: rgba(245, 245, 245, 1);
                    border-radius: 35px;

                    .icon-img {
                        width: 15px;
                        height: auto;
                    }
                }

                .command-item-content {
                    @include nowrap;

                    margin-left: 15px;
                    font-size: 13.8px;
                    font-weight: 600;
                    color: rgba(53, 55, 62, 1);
                    user-select: none;
                }
            }
        }

        .navigation-view-command-bar-block-collapse {
            @include HcenterVcenterC;

            position: relative;
            width: 100%;
            height: 100%;

            .collapse-command-btn {
                width: 100%;
                flex: 1;
            }
        }
    }

    .icon-img {
        width: 15px;
        height: auto;
        user-select: none;
    }

    .expand-top-to-bottom-enter-active,
    .expand-top-to-bottom-leave-active {
        transform-origin: 50% 0%;
        transition: all 0.3s linear;
    }

    .expand-top-to-bottom-enter,
    .expand-top-to-bottom-leave-to {
        transform: scaleY(0);
    }

    .expand-top-to-bottom-enter-to,
    .expand-top-to-bottom-leave {
        transform: scaleY(1);
    }

    .expand-bottom-to-top-enter-active,
    .expand-bottom-to-top-leave-active {
        transform-origin: 50% 100%;
        transition: all 0.3s linear;
    }

    .expand-bottom-to-top-enter,
    .expand-bottom-to-top-leave-to {
        transform: scaleY(0);
    }

    .expand-bottom-to-top-enter-to,
    .expand-bottom-to-top-leave {
        transform: scaleY(1);
    }
}
</style>