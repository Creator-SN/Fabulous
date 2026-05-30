<template>
    <div class="ds-tree-view-container">
        <div class="ds-tree-view-search">
            <search-box
                :theme="theme"
                :local="local"
                :currentDataPath="currentDataPath"
                :visibleGroups="visibleGroups"
                :searchPartitions="searchRemotePartitions"
                @choose-item="treeItemClick"
            ></search-box>
        </div>
        <div class="navigation-view-mode-block" :class="[{ dark: theme === 'dark' }]">
            <div class="navigation-view-mode-left-block">
                <img draggable="false" :src="img.dataSource" alt="" class="icon-img" />
                <p class="title">{{ !dsInfo.name ? local('Unselected') : dsInfo.name }}</p>
            </div>
            <div
                class="navigation-view-mode-right-block"
                :title="local('Config Data Source')"
                @click="
                    ($event) => {
                        $event.stopPropagation()
                        Go(`/settings`)
                    }
                "
            >
                <i class="ms-Icon ms-Icon--Repair more-menu-btn"></i>
            </div>
        </div>
        <div class="navigation-view-tree-view-block">
            <fv-tree-view
                v-show="treeList.length > 0"
                v-model="treeList"
                :theme="theme"
                :foreground="'rgba(255, 180, 0, 0.8)'"
                :expandClickMode="'normal'"
                style="width: 100%; height: 100%; padding-left: 5px; overflow: overlay"
                ref="tree"
                @click="treeItemClick"
            >
                <template v-slot:default="x">
                    <div
                        class="tree-view-custom-item"
                        :class="[{ dark: theme === 'dark' }]"
                        @contextmenu="rightClick($event, x.item)"
                    >
                        <div class="tree-view-item-left-block">
                            <emoji-callout
                                v-if="x.item.loading === false"
                                :model-value="x.item.emoji"
                                :theme="theme"
                                @insert-emoji="reviseEmoji(x.item, $event)"
                            ></emoji-callout>
                            <fv-progress-ring
                                v-else
                                loading="true"
                                r="10"
                                borderWidth="2"
                                background="rgba(200, 200, 200, 0.1)"
                                :color="'rgba(255, 180, 0, 0.8)'"
                                style="display: flex; align-item: center"
                            ></fv-progress-ring>
                            <p v-show="!x.item.editable" class="tree-view-custom-label">
                                {{ x.item.name }}
                            </p>
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
                                @click.capture="$event.stopPropagation()"
                                @keyup.capture.enter="rename(x.item)"
                            ></fv-text-box>
                            <fv-button
                                v-show="x.item.editable"
                                :theme="theme"
                                borderRadius="50"
                                class="tree-view-custom-confirm"
                                @click="
                                    ($event) => {
                                        $event.stopPropagation()
                                        rename(x.item)
                                    }
                                "
                            >
                                <i class="ms-Icon ms-Icon--CheckMark"></i>
                            </fv-button>
                        </div>
                        <div class="tree-view-item-right-block" @click="rightClick($event, x.item)">
                            <i class="ms-Icon ms-Icon--More more-menu-btn"></i>
                        </div>
                    </div>
                </template>
            </fv-tree-view>
            <nav-empty v-show="treeList.length === 0"></nav-empty>
        </div>
        <div class="navigation-view-command-bar-block" :class="[{ dark: theme === 'dark' }]">
            <div
                v-for="(item, index) in dsCmdList"
                :key="`command-bar-item: ${index}`"
                class="command-item"
                :class="[{ disabled: item.disabled() }]"
                @click="
                    () => {
                        item.disabled() ? null : item.func()
                    }
                "
            >
                <span class="command-item-icon">
                    <img :src="img[item.img]" alt="" class="icon-img" />
                </span>
                <p class="command-item-content">{{ item.name() }}</p>
            </div>
        </div>
        <right-menu
            ref="rightMenu"
            class="nv-right-menu"
            :rightMenuWidth="rightMenuWidth"
            :theme="theme"
        >
            <div>
                <span v-if="false" v-show="rightMenuItem.type === 'partition'">
                    <i class="ms-Icon ms-Icon--Add" style="color: rgba(140, 148, 228, 1)"></i>
                    <p>{{ local('New Item (Not Useful)') }}</p>
                </span>
                <span
                    v-show="rightMenuItem.type === 'group'"
                    @click="addNewOne(rightMenuItem, 'partition')"
                >
                    <img draggable="false" :src="img.partition" alt="" class="icon-img" />
                    <p>{{ local('New Partition') }}</p>
                </span>
                <span v-show="rightMenuItem.type === 'group'" @click="addNewOne(rightMenuItem)">
                    <img draggable="false" :src="img.group" alt="" class="icon-img" />
                    <p>{{ local('New Group') }}</p>
                </span>
                <hr v-show="rightMenuItem.type === 'group'" />
                <span @click="showRename(rightMenuItem)">
                    <i class="ms-Icon ms-Icon--Rename" style="color: rgba(149, 141, 241, 1)"></i>
                    <p>{{ local('Rename') }}</p>
                </span>
                <span @click="deleteConfirm(rightMenuItem)">
                    <i class="ms-Icon ms-Icon--Delete" style="color: rgba(220, 62, 72, 1)"></i>
                    <p>{{ local('Delete') }}</p>
                </span>
            </div>
        </right-menu>
    </div>
</template>

<script>
import navEmpty from '@/components/general/empty/navEmpty.vue'
import rightMenu from '@/components/general/rightMenu.vue'
import emojiCallout from '@/components/general/callout/emojiCallout.vue'
import searchBox from '@/components/general/navigationView/dsTreeView/searchBox.vue'
import { useAcademicConfig } from '@/stores/academic'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { mapActions, mapState } from 'pinia'

import dataSource from '@/assets/nav/research.svg'
import groupImg from '@/assets/nav/group.svg'
import partitionImg from '@/assets/nav/partition.svg'
import templatesImg from '@/assets/nav/template.svg'
import folderImg from '@/assets/nav/folder.svg'
import allImg from '@/assets/nav/all.svg'

export default {
    name: 'fab-navigation-view',
    components: {
        navEmpty,
        rightMenu,
        emojiCallout,
        searchBox
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
        }
    },
    watch: {
        currentDataPath() {
            this.$nextTick(() => {
                this.getDSInfo()
                this.refreshTreeList()
            })
        }
    },
    computed: {
        ...mapState(useDataStore, {
            data_path: (state) => state.data_path,
            data_index: (state) => state.configState.data_index,
            language: (state) => state.configState.language,
            currentDataPath: (state) => state.currentDataPath,
            currentDataPathItem: (state) => state.currentDataPathItem
        }),
        ...mapState(useAppConfig, {
            local: 'local'
        }),
        ...mapState(useTheme, {
            theme: 'theme',
            color: 'color'
        }),
        SourceDisabled() {
            return !this.currentDataPath
        },
        isRemote() {
            return this.currentDataPathItem && !this.currentDataPathItem.local
        },
        computeItemParent() {
            return (item) => {
                if (!item.parent) return this.isRemote ? this.currentDataPath : null
                return item.parent
            }
        },
        visibleGroups() {
            return this.FLAT.filter((item) => item.type === 'group')
        }
    },
    mounted() {
        this.getDSInfo()
        this.refreshTreeList()
        window.addEventListener('click', this.whiteClickClearTmp)
    },
    methods: {
        ...mapActions(useAcademicConfig, {
            getRemoteDataSourceInfo: 'getDataSourceInfo',
            getRemoteRootGroups: 'getRootGroups',
            getRemoteRootPartitions: 'getRootPartitions',
            getRemoteGroups: 'getGroups',
            getRemotePartitions: 'getPartitions',
            searchRemotePartitions: 'searchPartitions',
            createRemoteGroup: 'createGroup',
            createRemotePartition: 'createPartition',
            updateRemoteGroup: 'updateGroup',
            updateRemotePartition: 'updatePartition',
            deleteRemoteGroup: 'deleteGroup',
            deleteRemotePartition: 'deletePartition'
        }),
        getDSInfo() {
            if (this.SourceDisabled) return
            this.getRemoteDataSourceInfo(this.currentDataPath)
                .then((res) => {
                    if (res.status === 'success') {
                        this.dsInfo = res.data
                    } else
                        this.$barWarning(res.message, {
                            status: 'warning'
                        })
                })
                .catch((err) => {
                    this.$barWarning(err, {
                        status: 'error'
                    })
                })
        },
        async refreshTreeList() {
            if (!this.currentDataPath) return
            if (!this.lock.treeList) return
            this.lock.treeList = false
            this.treeList = []
            this.FLAT = []
            let result = []
            let groups = []
            let groupRes = await this.getRemoteRootGroups(this.currentDataPath)
            if (groupRes.status === 'success') groups = groupRes.data
            let partitions = []
            let partitionRes = await this.getRemoteRootPartitions(this.currentDataPath)
            if (partitionRes.status === 'success') partitions = partitionRes.data
            groups.forEach((el) => {
                result.push(this.itemFormat(el))
            })
            partitions.forEach((el) => {
                result.push(this.itemFormat(el, 'partition'))
            })
            let arr = [].concat(result)
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].children) arr = arr.concat(arr[i].children)
                this.hotPushFLAT(arr[i])
            }
            this.treeList = result
            this.lock.treeList = true
        },
        itemFormat(item, type = 'group') {
            let obj = {
                ...item,
                editable: false,
                children: type === 'group' ? (item.children ? item.children : []) : null,
                expanded: false,
                loading: false,
                finished: false,
                type
            }
            return obj
        },
        listFormat(arr, type = 'group') {
            let list = []
            arr.forEach((item) => {
                let obj = this.itemFormat(item, type)
                list.push(obj)
            })
            return list
        },
        hotPushFLAT(item) {
            let index = this.FLAT.findIndex((it) => it.id === item.id)
            if (index > -1) {
                let oriItem = this.FLAT[index]
                for (let key in oriItem) {
                    let skipKey = ['children', 'expanded']
                    if (!skipKey.includes(key)) {
                        oriItem[key] = item[key]
                    }
                }
            } else {
                this.FLAT.push(item)
            }
        },
        async loadChildren(item) {
            item.loading = true
            let groupList = []
            let partitionList = []
            let groupsRes = await this.getRemoteGroups(this.currentDataPath, item.id)
            if (groupsRes.code === 200 || groupsRes.status === 'success') {
                let children = groupsRes.data
                let formatChildren = this.listFormat(children)
                for (let childItem of formatChildren) {
                    this.hotPushFLAT(childItem)
                }
                groupList = formatChildren
            } else {
                this.$barWarning(groupsRes.message, {
                    status: 'warning'
                })
                item.loading = false
            }
            let partitionsRes = await this.getRemotePartitions(this.currentDataPath, item.id)
            if (partitionsRes.code === 200 || partitionsRes.status === 'success') {
                let children = partitionsRes.data
                let formatChildren = this.listFormat(children, 'partition')
                for (let child of formatChildren) {
                    child.parent = item.id
                    this.hotPushFLAT(child)
                }
                partitionList = formatChildren
            } else {
                this.$barWarning(partitionsRes.message, {
                    status: 'warning'
                })
                item.loading = false
            }
            let final_list = groupList.concat(partitionList)
            this.hotReplace(item.children, final_list)
            item.expanded = true
            item.finished = true
            item.loading = false
            this.$refs.tree.$forceUpdate()
        },
        hotReplace(arr, tgt) {
            for (let i = arr.length - 1; i >= 0; i--) {
                let index = tgt.findIndex((it) => it.id === arr[i].id)
                if (index === -1) {
                    arr.splice(i, 1)
                    i--
                }
            }
            tgt.forEach((item) => {
                let index = arr.findIndex((it) => it.id === item.id)
                if (index === -1) {
                    arr.push(item)
                } else {
                    let oriItem = arr[index]
                    for (let key in oriItem) {
                        let skipKey = ['children', 'expanded']
                        if (!skipKey.includes(key)) {
                            oriItem[key] = item[key]
                        }
                    }
                }
            })
        },
        removeTmp() {
            for (let i = this.treeList.length - 1; i >= 0; i--) {
                if (this.treeList[i].isTmp) {
                    this.treeList.splice(i, 1)
                }
            }
            for (let item of this.FLAT) {
                if (item.children) {
                    for (let i = item.children.length - 1; i >= 0; i--) {
                        if (item.children[i].isTmp) {
                            item.children.splice(i, 1)
                        }
                    }
                }
            }
            for (let i = this.FLAT.length - 1; i >= 0; i--) {
                if (this.FLAT[i].isTmp) {
                    this.FLAT.splice(i, 1)
                    i--
                }
            }
            this.$refs.tree.$forceUpdate()
        },
        async addNewOne(parent = null, type = 'group') {
            this.removeTmp()
            let tmpItem = {}
            tmpItem.id = this.$Guid()
            tmpItem.name =
                type === 'group' ? this.local('New Group Name') : this.local('New Partition Name')
            tmpItem.emoji = type === 'group' ? '馃搧' : '馃摂'
            tmpItem.parent = parent ? parent.id : null
            tmpItem.createDate = this.$SDate.DateToString(new Date())
            tmpItem.isTmp = true
            tmpItem.editable = true
            tmpItem.type = type
            tmpItem.children = type === 'group' ? [] : null
            tmpItem.loading = false
            tmpItem.finished = true

            if (parent) {
                if (parent.finished) parent.expanded = true
                else await this.loadChildren(parent)
                parent.children.unshift(tmpItem)
            } else this.treeList.push(tmpItem)
            this.FLAT.push(tmpItem)
            setTimeout(() => {
                let textbox = this.$refs[`t:${tmpItem.id}`]
                textbox.focus()
                document.execCommand('selectAll')
            }, 300)
        },
        showRename(item) {
            if (item.loading) return
            item.editable = true
            setTimeout(() => {
                let textbox = this.$refs[`t:${item.id}`]
                textbox.focus()
                document.execCommand('selectAll')
            }, 300)
        },
        async rename(item) {
            item = this.FLAT.find((it) => it.id === item.id)
            let res = null
            let mode = null
            if (item.isTmp) {
                if (item.type === 'group') {
                    res = await this.createRemoteGroup(
                        this.currentDataPath,
                        this.computeItemParent(item),
                        item
                    )
                } else
                    res = await this.createRemotePartition(
                        this.currentDataPath,
                        this.computeItemParent(item),
                        item
                    )
                mode = 'add'
            } else {
                if (item.type === 'group') {
                    res = await this.updateRemoteGroup(this.currentDataPath, item)
                } else
                    res = await this.updateRemotePartition(
                        this.currentDataPath,
                        this.computeItemParent(item),
                        item
                    )
                mode = 'update'
            }
            if (res.status !== 'success') {
                this.$barWarning(res.message, {
                    status: 'error'
                })
                return
            }
            if (mode === 'add') {
                let data = res.data
                for (let key in data) {
                    item[key] = data[key]
                }
                item.children = item.type === 'group' ? [] : null
                item.isTmp = false
            }
            item.editable = false
        },
        async reviseEmoji(item, emoji) {
            if (item.loading) return
            item = this.FLAT.find((it) => it.id === item.id)
            item.emoji = emoji
            item.loading = true
            let res = null
            if (item.type === 'group') {
                res = await this.updateRemoteGroup(this.currentDataPath, item)
            } else
                res = await this.updateRemotePartition(
                    this.currentDataPath,
                    this.computeItemParent(item),
                    item
                )
            item.loading = false
            if (res.status !== 'success') {
                this.$barWarning(res.message, {
                    status: 'error'
                })
                return
            }
        },
        deleteConfirm(item) {
            this.$infoBox(this.local(`Are you sure to delete this `) + item.type + '?', {
                status: 'error',
                title: this.local('Delete'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: () => {
                    this.delete(item)
                },
                cancel: () => {}
            })
        },
        async delete(item) {
            if (item.isTmp) return
            if (item.loading) return
            item = this.FLAT.find((it) => it.id === item.id)
            item.loading = true
            let res = null
            if (item.type === 'group') {
                res = await this.deleteRemoteGroup(this.currentDataPath, item.id)
            } else
                res = await this.deleteRemotePartition(
                    this.currentDataPath,
                    this.computeItemParent(item),
                    item.id
                )
            item.loading = false
            if (res.status !== 'success') {
                this.$barWarning(res.message, {
                    status: 'error'
                })
                return
            }
            item.isTmp = true
            this.removeTmp()
        },
        rightClick($event, item) {
            $event.preventDefault()
            $event.stopPropagation()
            this.rightMenuItem = item
            this.$refs.rightMenu.rightClick($event, this.$el)
        },
        collapseFunc(func) {
            this.expand = true
            func()
        },
        treeItemClick(item) {
            if (item.isTmp) return
            if (item.loading) return
            item = this.FLAT.find((it) => it.id === item.id) || item
            if (item.type === 'group') {
                if (!item.finished) this.loadChildren(item)
            } else {
                let id = item.id
                if (this.$route.params.id === id) return 0
                this.Go(`/partitions/${id}`)
            }
        },
        whiteClickClearTmp(event) {
            let x = event.target
            let _self = false
            while (x && x.tagName && x.tagName.toLowerCase() != 'body') {
                let classList = [...x.classList]
                if (
                    classList.includes('fv-TreeView--item') ||
                    classList.includes('navigation-view-mode-block') ||
                    classList.includes('navigation-view-command-bar-block') ||
                    classList.includes('nv-right-menu') ||
                    classList.includes('ds-tree-view-search')
                ) {
                    _self = true
                    break
                }
                x = x.parentNode
            }
            if (!_self) {
                this.removeTmp()
                for (let item of this.FLAT) {
                    item.editable = false
                }
                this.$refs.tree.$forceUpdate()
            }
        }
    },
    beforeUnmount() {
        window.removeEventListener('click', this.whiteClickClearTmp)
    }
}
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

        padding: 0px 20px;
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
