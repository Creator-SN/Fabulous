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
        :style="{'z-index': windowWidth < mobileDisplay ? 2 : 2}"
        @setting-click="Go(`/settings`)"
        @back="$Back"
    >
        <template v-slot:searchBlock>
            <fv-search-box
                :options="flatPartitions"
                icon="Search"
                :placeholder="` ` + local('Search Partitions')"
                :theme="theme"
                borderWidth="1"
                background="rgba(255, 255, 255, 0.1)"
                :border-radius="30"
                :revealBorder="true"
                style="width: 95%;"
                @choose-result="SwitchPartition"
            ></fv-search-box>
        </template>
        <template v-slot:panel>
            <div
                class="navigation-view-template"
                ref="view"
            >
                <div
                    v-show="expand"
                    class="navigation-view-mode-block"
                    @click="menuDisplayMode = 0"
                >
                    <div class="navigation-view-mode-left-block">
                        <img
                            draggable="false"
                            :src="img.dataSource"
                            alt=""
                            class="icon-img"
                        >
                        <p class="title">{{!name ? local('Unselected') : name}}</p>
                    </div>
                    <div
                        class="navigation-view-mode-right-block"
                        @click="$event => {$event.stopPropagation(); Go(`/settings`);}"
                    >
                        <i class="ms-Icon ms-Icon--Repair more-menu-btn"></i>
                    </div>
                </div>
                <transition name="expand-top-to-bottom">
                    <div
                        v-show="menuDisplayMode === 0"
                        class="navigation-view-tree-view-block"
                    >
                        <fv-TreeView
                            v-show="treeList.length > 0"
                            v-model="treeList"
                            :theme="theme"
                            :background="theme == 'dark' ? 'rgba(7, 7, 7, 0)' : 'rgba(245, 245, 245, 0)'"
                            :view-style="{backgroundColor: theme == 'dark' ? 'rgba(7, 7, 7, 0)' : 'rgba(245, 245, 245, 0)', backgroundColorHover: theme == 'dark' ? 'rgba(200, 200, 200, 0.3)' : 'rgba(245, 245, 245, 0.3)'}"
                            style="width: 100%; height: 100%;"
                            @click="SwitchPartition"
                        >
                            <template v-slot:default="x">
                                <div
                                    class="tree-view-custom-item"
                                    @contextmenu="rightClick($event, x.item)"
                                >
                                    <div class="tree-view-item-left-block">
                                        <emoji-callout
                                            :value="x.item.emoji"
                                            :theme="theme"
                                            @insert-emoji="reviseEmoji(x.item, $event)"
                                        ></emoji-callout>
                                        <!-- <p>{{x.item.emoji}}</p> -->
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
                                            @keyup.native.enter="rename(x.item)"
                                        ></fv-text-box>
                                        <fv-button
                                            v-show="x.item.editable"
                                            :theme="theme"
                                            borderRadius="50"
                                            class="tree-view-custom-confirm"
                                            @click="rename(x.item)"
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
                            :title="local('Choose a source to start.')"
                        ></loading>
                    </div>
                </transition>
                <div
                    v-show="expand"
                    class="navigation-view-mode-block"
                    @click="menuDisplayMode = 1"
                >
                    <div class="navigation-view-mode-left-block">
                        <img
                            draggable="false"
                            :src="img.notebook"
                            alt=""
                            class="icon-img"
                        >
                        <p class="title">{{!localPath ? local('Unselected') : localPathFolderName}}</p>
                    </div>
                    <div class="navigation-view-mode-right-block">
                        <i
                            class="ms-Icon ms-Icon--SubscriptionAdd more-menu-btn"
                            @click="() => $refs.local_view.createFile()"
                        ></i>
                        <i
                            class="ms-Icon ms-Icon--NewFolder more-menu-btn"
                            @click="() => $refs.local_view.createFolder()"
                        ></i>
                        <i
                            class="ms-Icon ms-Icon--FolderOpen more-menu-btn"
                            @click="() => $refs.local_view.chooseFolder()"
                        ></i>
                    </div>
                </div>
                <transition name="expand-top-to-bottom">
                    <local-tree-view
                        v-show="menuDisplayMode === 1"
                        v-model="localPath"
                        :theme="theme"
                        :local="local"
                        ref="local_view"
                    ></local-tree-view>
                </transition>
                <div
                    class="navigation-view-command-bar-block"
                    :class="[{dark: theme === 'dark'}]"
                >
                    <div
                        v-for="(item, index) in cmdList"
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
            </div>
            <right-menu
                v-model="show.rightMenu"
                :theme="theme"
                :posX="posX"
                :posY="posY"
                :rightMenuWidth="rightMenuWidth"
                @update-height="rightMenuHeight = $event"
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
                        @click="addPartitionAt(rightMenuItem)"
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
                        @click="addGroupAt(rightMenuItem)"
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
                    <span @click="rightMenuItem.editable = true">
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
import loading from "@/components/general/loading.vue";
import navEmpty from "@/components/general/empty/navEmpty.vue";
import localTreeView from "@/components/general/navigationView/localTreeView.vue";
import rightMenu from "@/components/general/rightMenu.vue";
import emojiCallout from "@/components/general/callout/emojiCallout.vue";
import { mapMutations, mapState, mapGetters } from "vuex";
import { group, partition } from "@/js/data_sample";

import dataSource from "@/assets/nav/dataSource.svg";
import notebook from "@/assets/nav/notebook.svg";
import groupImg from "@/assets/nav/group.svg";
import partitionImg from "@/assets/nav/partition.svg";
import templatesImg from "@/assets/nav/template.svg";
import allImg from "@/assets/nav/all.svg";

export default {
    components: {
        loading,
        navEmpty,
        localTreeView,
        rightMenu,
        emojiCallout,
    },
    props: {
        rightMenuWidth: {
            default: 200,
        },
    },
    data() {
        return {
            expand: true,
            cmdList: [
                {
                    name: () => this.local("Add Partition"),
                    func: this.addPartition,
                    img: "partition",
                    disabled: () => this.SourceDisabled,
                    iconColor: "rgba(213, 99, 70, 1)",
                },
                {
                    name: () => this.local("Add Group"),
                    func: this.addGroup,
                    img: "group",
                    disabled: () => this.SourceDisabled,
                    iconColor: "rgba(172, 84, 206, 1)",
                },
                {
                    name: () => this.local("Templates Page"),
                    img: "templates",
                    func: () => this.Go("/templates"),
                    disabled: () => this.SourceDisabled,
                },
                {
                    name: () => this.local("All Content"),
                    img: "all",
                    func: () => this.Go("/"),
                    disabled: () => this.SourceDisabled,
                },
            ],
            img: {
                dataSource,
                notebook,
                group: groupImg,
                partition: partitionImg,
                templates: templatesImg,
                all: allImg,
            },
            treeList: [],
            FLAT: [],
            localPath: "",
            posX: 0,
            posY: 0,
            menuDisplayMode: 0,
            rightMenuItem: {},
            rightMenuHeight: 0,
            show: {
                rightMenu: false,
            },
        };
    },
    watch: {
        groups() {
            this.refreshTreeList();
        },
        partitions() {
            this.refreshTreeList();
        },
        windowWidth() {
            if (this.windowWidth > this.mobileDisplay) this.expand = true;
        },
    },
    computed: {
        ...mapState({
            DataDB: (state) => state.DataDB,
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            language: (state) => state.config.language,
            ds_id: (state) => state.data_structure.id,
            name: (state) => state.data_structure.name,
            groups: (state) => state.data_structure.groups,
            partitions: (state) => state.data_structure.partitions,
            windowWidth: (state) => state.window.width,
            mobileDisplay: (state) => state.window.mobileDisplay,
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(["local"]),
        navigationViewBackground() {
            if (this.theme == "light") return "rgba(242, 242, 242, 0.8)";
            return "rgba(0, 0, 0, 0.8)";
        },
        SourceDisabled() {
            if (!this.DataDB) return true;
            if (!this.ds_id) return true;
            return false;
        },
        flatPartitions() {
            let result = [];
            let t = [].concat(this.treeList);
            for (let i = 0; i < t.length; i++) {
                if (t[i].children) t = t.concat(t[i].children);
                result.push(t[i]);
            }
            return result;
        },
        localPathFolderName() {
            let pathList = this.localPath.split(/[\\/]/);
            return pathList[pathList.length - 1];
        },
    },
    mounted() {
        this.refreshTreeList();
    },
    methods: {
        ...mapMutations({
            reviseData: "reviseData",
            reviseI18N: "reviseI18N",
        }),
        refreshTreeList() {
            let result = [];
            this.saveExpandedStatus();
            this.groups.forEach((el) => {
                let treeItem = this.dfsTree(el);
                result.push(treeItem);
            });
            result = result.concat(this.transPartitions(this.partitions));
            this.treeList = result;
        },
        dfsTree(groupItem) {
            let obj = JSON.parse(JSON.stringify(groupItem));

            obj.children = obj.groups;
            obj.editable = obj.editable == undefined ? false : obj.editable;
            obj.type = "group";
            obj.icon = "Folder";

            // 从存储状态里获取expand而不是从数据库中获取 //
            let restore_status = this.FLAT.find((it) => it.id === obj.id);
            if (restore_status) obj.expanded = restore_status.expanded;

            if (obj.children == undefined || obj.children.length == 0) {
                obj.children = this.transPartitions(obj.partitions);
                return obj;
            }
            for (let i = 0; i < obj.children.length; i++) {
                obj.children[i] = this.dfsTree(obj.children[i]);
            }
            obj.children = obj.children.concat(
                this.transPartitions(obj.partitions)
            );
            return obj;
        },
        transPartitions(partitions) {
            let result = JSON.parse(JSON.stringify(partitions));
            result.forEach((el, idx) => {
                el.editable = el.editable == undefined ? false : el.editable;
                el.type = "partition";
                el.icon = "FileCode";
                result[idx] = el;
            });
            return result;
        },
        saveExpandedStatus() {
            this.FLAT = [];
            let t = [].concat(this.treeList);
            for (let i = 0; i < t.length; i++) {
                if (t[i].children) t = t.concat(t[i].children);
                this.FLAT.push(t[i]);
            }
        },
        addGroup(target = null) {
            let _group = JSON.parse(JSON.stringify(group));
            _group.id = this.$Guid();
            _group.name = this.local("New Group Name");
            _group.emoji = "📁";
            _group.createDate = this.$SDate.DateToString(new Date());
            _group.editable = true;
            if (target) target.groups.push(_group);
            else this.groups.push(_group);
            this.reviseData({
                groups: this.groups,
            });
            setTimeout(() => {
                let textbox = this.$refs[`t:${_group.id}`];
                textbox.focus();
                document.execCommand("selectAll");
            }, 300);
        },
        addPartition(target = null) {
            let _partition = JSON.parse(JSON.stringify(partition));
            _partition.id = this.$Guid();
            _partition.name = this.local("New Partition Name");
            _partition.emoji = "📔";
            _partition.createDate = this.$SDate.DateToString(new Date());
            _partition.editable = true;
            if (target) target.partitions.push(_partition);
            else this.partitions.push(_partition);
            this.reviseData({
                partitions: this.partitions,
            });
            setTimeout(() => {
                let textbox = this.$refs[`t:${_partition.id}`];
                textbox.focus();
                document.execCommand("selectAll");
            }, 300);
        },
        addGroupAt(item) {
            if (item.type !== "group") return;
            let id = item.id;
            let t = [].concat(this.groups);
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].id === id) {
                    this.addGroup(t[i]);
                    break;
                }
            }
            // treeList expand //
            t = [].concat(this.treeList);
            for (let i = 0; i < t.length; i++) {
                if (t[i].children) t = t.concat(t[i].children);
                if (t[i].id === id) {
                    t[i].expanded = true;
                    break;
                }
            }
            this.reviseData({
                groups: this.groups,
                partitions: this.partitions,
            });
            this.refreshTreeList();
        },
        addPartitionAt(item) {
            if (item.type !== "group") return;
            let id = item.id;
            let t = [].concat(this.groups);
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].id === id) {
                    this.addPartition(t[i]);
                    break;
                }
            }
            // treeList expand //
            t = [].concat(this.treeList);
            for (let i = 0; i < t.length; i++) {
                if (t[i].children) t = t.concat(t[i].children);
                if (t[i].id === id) {
                    t[i].expanded = true;
                    break;
                }
            }
            this.reviseData({
                groups: this.groups,
                partitions: this.partitions,
            });
            this.refreshTreeList();
        },
        rename(item) {
            let id = item.id;
            let name = item.name;
            let t = [].concat(this.groups);
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].partitions) t = t.concat(t[i].partitions);
                if (t[i].id === id) {
                    t[i].name = name;
                    t[i].editable = false;
                    break;
                }
            }
            for (let i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].id === id) {
                    this.partitions[i].name = name;
                    this.partitions[i].editable = false;
                    break;
                }
            }
            this.reviseData({
                groups: this.groups,
                partitions: this.partitions,
            });
            this.refreshTreeList();
        },
        reviseEmoji(item, emoji) {
            let id = item.id;
            let t = [].concat(this.groups);
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].partitions) t = t.concat(t[i].partitions);
                if (t[i].id === id) {
                    t[i].emoji = emoji;
                    break;
                }
            }
            for (let i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].id === id) {
                    this.partitions[i].emoji = emoji;
                    break;
                }
            }
            this.reviseData({
                groups: this.groups,
                partitions: this.partitions,
            });
            this.refreshTreeList();
        },
        deleteConfirm(item) {
            this.$infoBox(
                this.local(`Are you sure to delete this ${item.type}?`),
                {
                    status: "error",
                    title: this.local("Delete"),
                    confirmTitle: this.local("Confirm"),
                    cancelTitle: this.local("Cancel"),
                    theme: this.theme,
                    confirm: () => {
                        this.delete(item);
                    },
                    cancel: () => {},
                }
            );
        },
        delete(item) {
            let id = item.id;
            if (this.$route.params.id === id) this.$Go("/");
            for (let i = 0; i < this.groups.length; i++) {
                if (this.groups[i].id === id) {
                    this.groups.splice(i, 1);
                    break;
                }
            }
            for (let i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].id === id) {
                    this.partitions.splice(i, 1);
                    break;
                }
            }
            let t = [].concat(this.groups);
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].groups && t[i].groups.length > 0) {
                    let d = t[i].groups.find((it) => it.id === id);
                    let idx = t[i].groups.indexOf(d);
                    if (idx > -1) {
                        t[i].groups.splice(idx, 1);
                        break;
                    }
                }
                if (t[i].partitions && t[i].partitions.length > 0) {
                    let d = t[i].partitions.find((it) => it.id === id);
                    let idx = t[i].partitions.indexOf(d);
                    if (idx > -1) {
                        t[i].partitions.splice(idx, 1);
                        break;
                    }
                }
            }
            this.reviseData({
                groups: this.groups,
                partitions: this.partitions,
            });
            this.refreshTreeList();
        },
        rightClick(event, item) {
            event.preventDefault();
            this.show.rightMenu = true;
            let bounding = this.$el.getBoundingClientRect();
            let viewBounding = this.$refs.view.getBoundingClientRect();
            let targetPos = {};
            console.log(event, event.x, event.y);
            targetPos.x = event.x;
            targetPos.y = event.y;
            if (targetPos.x < bounding.left) targetPos.x = bounding.left;
            if (targetPos.x + this.rightMenuWidth > viewBounding.right)
                targetPos.x = viewBounding.right - this.rightMenuWidth;
            if (targetPos.y < bounding.top) targetPos.y = bounding.top;
            if (targetPos.y + this.rightMenuHeight > bounding.bottom)
                targetPos.y = bounding.bottom - this.rightMenuHeight;
            this.posX = targetPos.x;
            this.posY = targetPos.y;

            this.rightMenuItem = item;
        },
        collapseFunc(func) {
            this.expand = true;
            func();
        },
        SwitchPartition(item) {
            if (item.type === "group") return 0;
            let id = item.id;
            if (this.$route.params.id === id) return 0;
            this.$Go(`/partitions/${id}`);
        },
        Go(path) {
            if (this.$route.path === path) return 0;
            this.$Go(path);
        },
    },
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
            }

            &:active {
                background: rgba(200, 200, 200, 0.3);
            }

            .navigation-view-mode-left-block {
                @include Vcenter;

                flex: 1;
            }

            .navigation-view-mode-right-block {
                @include HendVcenter;

                width: 100px;

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
            overflow: auto;

            .tree-view-custom-item {
                position: relative;
                width: 100%;
                box-sizing: border-box;
                display: flex;
                align-items: center;

                .tree-view-item-left-block {
                    @include Vcenter;

                    flex: 1;

                    .tree-view-custom-label {
                        margin-left: 5px;
                    }

                    .tree-view-custom-text-box {
                        margin-left: 5px;
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
            height: 200px;
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
        transition: all 0.3s;
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
        transition: all 0.3s;
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