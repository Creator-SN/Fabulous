<template>
    <div class="ds-tree-view-container">
        <div class="ds-tree-view-search">
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
        </div>
        <div
            class="navigation-view-mode-block"
            :class="[{dark: theme === 'dark'}]"
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
        <div class="navigation-view-tree-view-block">
            <fv-TreeView
                v-show="treeList.length > 0"
                v-model="treeList"
                :theme="theme"
                :foreground="'rgba(255, 180, 0, 0.8)'"
                :expandClickMode="'normal'"
                style="width: 100%; height: 100%; padding-left: 5px; overflow: overlay;"
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
        <div
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
                <hr v-show="rightMenuItem.type === 'group'">
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
    </div>
</template>

<script>
import loading from '@/components/general/loading.vue';
import navEmpty from '@/components/general/empty/navEmpty.vue';
import rightMenu from '@/components/general/rightMenu.vue';
import emojiCallout from '@/components/general/callout/emojiCallout.vue';
import { mapState, mapGetters } from 'vuex';

import dataSource from '@/assets/nav/dataSource.svg';
import groupImg from '@/assets/nav/group.svg';
import partitionImg from '@/assets/nav/partition.svg';
import templatesImg from '@/assets/nav/template.svg';
import folderImg from '@/assets/nav/folder.svg';
import allImg from '@/assets/nav/all.svg';

export default {
    name: 'fab-navigation-view',
    components: {
        loading,
        navEmpty,
        rightMenu,
        emojiCallout
    },
    props: {
        rightMenuWidth: {
            default: 200
        },
        Go: {
            type: Function,
            default: () => {}
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
            dsInfo: {
                id: '',
                name: '',
                createDate: ''
            },
            img: {
                dataSource,
                group: groupImg,
                partition: partitionImg,
                templates: templatesImg,
                folder: folderImg,
                all: allImg
            },
            treeList: [],
            FLAT: [],
            rightMenuItem: {},
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
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            language: (state) => state.config.language,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath', 'currentDataPathItem']),
        SourceDisabled() {
            return !this.currentDataPath;
        },
        isRemote() {
            return this.currentDataPathItem && !this.currentDataPathItem.local;
        },
        computeItemParent() {
            return (item) => {
                if (!item.parent)
                    return this.isRemote ? this.currentDataPath : null;
                return item.parent;
            };
        }
    },
    mounted() {
        this.getDSInfo();
        this.refreshTreeList();
        window.addEventListener('click', this.whiteClickClearTmp);
    },
    methods: {
        getDSInfo() {
            if (this.SourceDisabled) return;
            this.$auto.AcademicController.getDataSourceInfo(
                this.currentDataPath
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
            if (!this.currentDataPath) return;
            if (!this.lock.treeList) return;
            this.lock.treeList = false;
            this.treeList = [];
            this.FLAT = [];
            let result = [];
            let groups = [];
            await this.$auto.AcademicController.getRootGroups(
                this.currentDataPath
            )
                .then((res) => {
                    groups = res.data;
                })
                .catch(() => {});
            let partitions = [];
            await this.$auto.AcademicController.getRootPartitions(
                this.currentDataPath
            )
                .then((res) => {
                    partitions = res.data;
                })
                .catch(() => {});
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
            await this.$auto.AcademicController.getGroups(
                this.currentDataPath,
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
            await this.$auto.AcademicController.getPartitions(
                this.currentDataPath,
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
                    res = await this.$auto.AcademicController.createGroup(
                        this.currentDataPath,
                        this.computeItemParent(item),
                        item
                    );
                } else
                    res = await this.$auto.AcademicController.createPartition(
                        this.currentDataPath,
                        this.computeItemParent(item),
                        item
                    );
                mode = 'add';
            } else {
                if (item.type === 'group') {
                    res = await this.$auto.AcademicController.updateGroup(
                        this.currentDataPath,
                        item
                    );
                } else
                    res = await this.$auto.AcademicController.updatePartition(
                        this.currentDataPath,
                        this.computeItemParent(item),
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
                res = await this.$auto.AcademicController.updateGroup(
                    this.currentDataPath,
                    item
                );
            } else
                res = await this.$auto.AcademicController.updatePartition(
                    this.currentDataPath,
                    this.computeItemParent(item),
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
                res = await this.$auto.AcademicController.deleteGroup(
                    this.currentDataPath,
                    item.id
                );
            } else
                res = await this.$auto.AcademicController.deletePartition(
                    this.currentDataPath,
                    this.computeItemParent(item),
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
        }
    },
    beforeDestroy() {
        window.removeEventListener('click', this.whiteClickClearTmp);
    }
};
</script>

<style lang="scss">
.ds-tree-view-container {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    overflow-x: hidden;

    .ds-tree-view-search {
        @include Vcenter;

        padding: 0px 25px;
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
}
</style>