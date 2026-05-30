<template>
    <div class="remote-tree-view-container">
        <div class="remote-tree-view-search">
            <search-box
                :theme="theme"
                :local="local"
                :currentDataPath="currentDataPath"
                :searchRemoteNotebooks="searchRemoteNotebooks"
                @choose-item="handleSearchNotebookChoose"
            ></search-box>
        </div>
        <div class="navigation-view-mode-block" :class="[{ dark: theme === 'dark' }]">
            <div class="navigation-view-mode-left-block">
                <img draggable="false" :src="img.notebook" alt="" class="icon-img" />
                <p class="title">{{ localPathFolderName }}</p>
            </div>
            <div v-show="path" class="navigation-view-mode-right-block">
                <i
                    class="ms-Icon ms-Icon--SubscriptionAdd more-menu-btn"
                    :title="local('New Note')"
                    @click="() => createFile()"
                ></i>
                <i
                    class="ms-Icon ms-Icon--NewFolder more-menu-btn"
                    :title="local('New Folder')"
                    @click="() => createFolder()"
                ></i>
                <i
                    class="ms-Icon ms-Icon--Refresh more-menu-btn"
                    :title="local('Refresh Folder')"
                    @click="() => refreshFolder()"
                ></i>
                <i
                    class="ms-Icon ms-Icon--CollapseContent more-menu-btn"
                    :title="local('Collaspe All')"
                    @click="() => collapseAll()"
                ></i>
            </div>
        </div>
        <fv-TreeView
            v-show="treeList.length > 0"
            v-model="treeList"
            :theme="theme"
            ref="tree"
            :background="theme == 'dark' ? 'rgba(7, 7, 7, 0)' : 'rgba(245, 245, 245, 0)'"
            :foreground="'rgba(255, 180, 0, 0.8)'"
            :item-height="35"
            :expandClickMode="'normal'"
            style="width: 100%; height: 100%; padding-left: 5px; overflow: overlay"
            @click="treeItemClick"
        >
            <template v-slot:default="x">
                <div
                    class="tree-view-custom-item"
                    :class="[{ dark: theme === 'dark' }]"
                    :style="{
                        opacity: copyList.find(
                            (it) => it.path === x.item.filePath && it.type === 'move'
                        )
                            ? 0.6
                            : ''
                    }"
                    @contextmenu="rightClick($event, x.item)"
                >
                    <div class="tree-view-item-left-block">
                        <img
                            v-if="x.item.loading == false"
                            draggable="false"
                            class="icon-img"
                            :src="computeIcon(x.item)"
                            alt=""
                        />
                        <fv-progress-ring
                            v-else
                            loading="true"
                            r="10"
                            borderWidth="2"
                            color="rgba(255, 180, 0, 0.8)"
                            background="rgba(200, 200, 200, 0.1)"
                            style="display: flex; align-item: center"
                        ></fv-progress-ring>
                        <p
                            v-show="!x.item.editable"
                            class="tree-view-custom-label"
                            :title="x.item.name"
                        >
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
                            font-size="12"
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
                    <div
                        v-show="x.item.filePath"
                        class="tree-view-item-right-block"
                        @click="rightClick($event, x.item)"
                        @mousedown.stop
                    >
                        <i class="ms-Icon ms-Icon--More more-menu-btn"></i>
                    </div>
                </div>
            </template>
        </fv-TreeView>
        <div class="navigation-view-command-bar-block" :class="[{ dark: theme === 'dark' }]">
            <div
                v-show="item.show()"
                v-for="(item, index) in notebookCmdList"
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
            class="lt-right-menu"
            ref="rightMenu"
            :theme="theme"
            :rightMenuWidth="rightMenuWidth"
        >
            <div>
                <span v-show="rightMenuItem.isDir" @click="createFile(rightMenuItem.filePath)">
                    <i
                        class="ms-Icon ms-Icon--SubscriptionAdd"
                        style="color: rgba(149, 141, 241, 1)"
                    ></i>
                    <p>{{ local('New Note') }}</p>
                </span>
                <span v-show="rightMenuItem.isDir" @click="createFolder(rightMenuItem.filePath)">
                    <i class="ms-Icon ms-Icon--NewFolder" style="color: rgba(140, 148, 228, 1)"></i>
                    <p>{{ local('New Folder') }}</p>
                </span>
                <hr v-show="rightMenuItem.isDir" />
                <span @click="openPermissionPanel(rightMenuItem)">
                    <i
                        class="ms-Icon ms-Icon--Permissions"
                        style="color: rgba(140, 148, 228, 1)"
                    ></i>
                    <p>{{ local('Permissions') }}</p>
                </span>
                <hr />
                <span @click="copy(rightMenuItem)">
                    <i class="ms-Icon ms-Icon--Set" style="color: rgba(140, 148, 228, 1)"></i>
                    <p>{{ local('Copy') }}</p>
                </span>
                <span @click="move(rightMenuItem)">
                    <i class="ms-Icon ms-Icon--Cut" style="color: rgba(140, 148, 228, 1)"></i>
                    <p>{{ local('Cut') }}</p>
                </span>
                <span
                    v-show="rightMenuItem.isDir && copyList.length > 0"
                    @click="paste(rightMenuItem)"
                >
                    <i class="ms-Icon ms-Icon--Paste" style="color: rgba(140, 148, 228, 1)"></i>
                    <p>{{ local('Paste') }}</p>
                </span>
                <hr />
                <span @click="showRename(rightMenuItem)">
                    <i class="ms-Icon ms-Icon--Rename" style="color: rgba(149, 141, 241, 1)"></i>
                    <p>{{ local('Rename') }}</p>
                </span>
                <span @click="openDeleteConfirmPanel(rightMenuItem)">
                    <i class="ms-Icon ms-Icon--Delete" style="color: rgba(220, 62, 72, 1)"></i>
                    <p>{{ local('Delete') }}</p>
                </span>
            </div>
        </right-menu>
        <permission-panel
            v-model="showPermissionPanel"
            :target="permissionTarget"
            :uri="uri"
        ></permission-panel>
        <delete-confirm-panel
            v-model="showDeleteConfirmPanel"
            :target="deleteTarget"
            :theme="theme"
            :local="local"
            @confirm="deleteConfirm"
        ></delete-confirm-panel>
    </div>
</template>

<script>
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { useNotebookConfig } from '@/stores/notebook'
import { mapState, mapActions } from 'pinia'

import rightMenu from '@/components/general/rightMenu.vue'
import permissionPanel from './permissionPanel.vue'
import deleteConfirmPanel from './deleteConfirmPanel.vue'
import searchBox from './searchBox.vue'

import { fabulous_notebook } from '@/js/data_sample.js'

import notebook from '@/assets/nav/notebook.svg'
import folderImg from '@/assets/nav/folder.svg'
import noteImg from '@/assets/nav/note.svg'
import jsonImg from '@/assets/nav/json.svg'
import htmlImg from '@/assets/nav/html.svg'
import fileImg from '@/assets/nav/file.svg'
import markdownImg from '@/assets/nav/markdown.svg'
import newFolderImg from '@/assets/nav/newFolder.svg'
import refreshImg from '@/assets/nav/refresh.svg'
import pasteImg from '@/assets/nav/paste.svg'

export default {
    name: 'remote-tree-view',
    components: { rightMenu, permissionPanel, deleteConfirmPanel, searchBox },
    props: {
        modelValue: {
            default: ''
        },
        rightMenuWidth: {
            default: 200
        },
        Go: {
            default: () => {}
        }
    },
    data() {
        return {
            path: this.modelValue,
            treeList: [],
            notebookCmdList: [
                {
                    name: () => this.local('New Folder'),
                    func: () => this.createFolder(),
                    img: 'newFolder',
                    disabled: () => !this.path || !this.lock.create,
                    show: () => true
                },
                {
                    name: () => this.local('Refresh Folder'),
                    func: () => this.refreshFolder(),
                    img: 'refresh',
                    disabled: () => !this.path || !this.lock.refresh,
                    show: () => true
                },
                {
                    name: () => this.local('Paste to Root'),
                    img: 'paste',
                    func: () => this.rootPaste(),
                    disabled: () => this.rootPasteDisabled(),
                    show: () => true
                }
            ],
            img: {
                notebook,
                folder: folderImg,
                note: noteImg,
                json: jsonImg,
                html: htmlImg,
                file: fileImg,
                markdown: markdownImg,
                newFolder: newFolderImg,
                refresh: refreshImg,
                paste: pasteImg
            },
            FLAT: [],
            copyList: [],
            rightMenuItem: {},
            showPermissionPanel: false,
            permissionTarget: null,
            showDeleteConfirmPanel: false,
            deleteTarget: null,
            lock: {
                loading: true,
                refresh: true,
                create: true,
                rename: true,
                remove: true,
                paste: true
            }
        }
    },
    watch: {
        modelValue(val) {
            this.path = val
            this.copyList = []
            this.refreshFolder()
        }
    },
    computed: {
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath,
            currentDataPathItem: (state) => state.currentDataPathItem
        }),
        ...mapState(useAppConfig, {
            unsave: (state) => state.editor?.notebook?.unsave || false,
            local: 'local',
            editorItem: (state) => state.editor?.notebook?.item || null,
            target: (state) => state.editor?.notebook?.target || null,
            itemType: (state) => state.editor?.notebook?.type || null,
            history: (state) => state.editor?.notebook?.history || []
        }),
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        comparePath() {
            return (path1, path2) => {
                if (!path1 || !path2) return false
                return path1.replace(/\\/g, '/') === path2.replace(/\\/g, '/')
            }
        },
        computeIcon() {
            return (item) => {
                if (item.isDir) return this.img.folder
                let nameList = item.name.split('.')
                let ext = nameList[nameList.length - 1]
                if (ext === 'fbn') return this.img.note
                if (ext === 'json') return this.img.json
                if (ext === 'html') return this.img.html
                if (ext === 'md') return this.img.markdown
                return this.img.file
            }
        },
        computeFileName() {
            return (path) => {
                let pathList = path.split(/[\\/]/)
                return pathList[pathList.length - 1]
            }
        },
        localPathFolderName() {
            return this.currentDataPathItem.name || this.local('Notebook')
        },
        uri() {
            return this.currentDataPath
        }
    },
    mounted() {
        this.refreshFolder()
        window.addEventListener('click', this.whiteClickClearTmp)
    },
    methods: {
        ...mapActions(useAppConfig, {
            reviseEditor: 'reviseEditor',
            tryGetScrollTop: 'tryGetScrollTop'
        }),
        ...mapActions(useNotebookConfig, [
            'listRemoteDirectoryChildren',
            'createRemoteDocument',
            'createRemoteDirectory',
            'updateRemoteDocumentInfo',
            'updateRemoteDirectoryInfo',
            'removeRemoteDocument',
            'removeRemoteDirectory',
            'copyRemoteDirectory',
            'moveRemoteDirectory',
            'searchRemoteNotebooks',
            'getRemoteNotebookPath'
        ]),
        itemFormat(item, dir) {
            return {
                id: this.$Guid(),
                remoteId: item.id,
                name: item.name ? item.name : item.title,
                editable: false,
                children: item.type === 'group' ? [] : null,
                protect: item.protect,
                expanded: false,
                loading: false,
                finished: false,
                filePath: `${dir}/${item.id}`,
                dir,
                isFile: item.type !== 'group',
                isDir: item.type === 'group',
                owner: item.owner || 'Unknown',
                createDate: item.createDate || new Date('0000-01-01').toISOString(),
                updateDate: item.updateDate || new Date('0000-01-01').toISOString()
            }
        },
        removeFlatBranch(path) {
            for (let i = this.FLAT.length - 1; i >= 0; i--) {
                let filePath = this.FLAT[i].filePath
                if (!filePath) continue
                if (
                    this.comparePath(filePath, path) ||
                    filePath.replace(/\\/g, '/').startsWith(`${path.replace(/\\/g, '/')}/`)
                ) {
                    this.FLAT.splice(i, 1)
                }
            }
        },
        removeItemFromCollections(path) {
            for (let i = this.treeList.length - 1; i >= 0; i--) {
                if (this.comparePath(this.treeList[i].filePath, path)) {
                    this.treeList.splice(i, 1)
                }
            }
            for (let item of this.FLAT) {
                if (!item.children) continue
                for (let i = item.children.length - 1; i >= 0; i--) {
                    if (this.comparePath(item.children[i].filePath, path)) {
                        item.children.splice(i, 1)
                    }
                }
            }
            this.removeFlatBranch(path)
        },
        /**
         * 将新创建成功的节点增量插入到当前树中，而不是重新加载整个父目录。
         *
         * @param {Object} item 由 `itemFormat` 格式化后的标准树节点。
         * 预期包含 `filePath`、`isDir`、`children`、`expanded`、`finished`
         * 等树渲染和状态同步所需字段。
         * @returns {Object} 最终存入 `FLAT` 的节点实例。
         */
        hotAddItem(item) {
            // 先根据当前节点路径计算父路径，判断它应该插到根节点列表，
            // 还是插到某个已展开目录的 children 中。
            let parentPath = this.findParentPath(item)

            // 第一步：先更新真正用于渲染的树结构。
            // 根节点直接写入 `treeList`，子节点则写入父目录的 `children`。
            if (parentPath.isRoot) {
                let exists = this.treeList.find((it) =>
                    this.comparePath(it.filePath, item.filePath)
                )
                if (!exists) this.treeList.push(item)
            } else {
                let parentItem = this.findItem(parentPath.path)
                if (parentItem) {
                    // 在目录下创建新节点时，父目录应保持展开，
                    // 并标记为已经具备本地 children 状态。
                    parentItem.expanded = true
                    if (parentItem.finished) {
                        if (!Array.isArray(parentItem.children)) parentItem.children = []
                        let exists = parentItem.children.find((it) =>
                            this.comparePath(it.filePath, item.filePath)
                        )
                        if (!exists) parentItem.children.push(item)
                    } else {
                        this.loadChildrenByPath(parentItem.filePath, true)
                    }
                }
            }

            // 第二步：同步更新 `FLAT`。
            // `FLAT` 是按路径建立的扁平索引，后续 rename、delete、查父节点等
            // 操作都依赖它快速定位节点。
            let exists = this.FLAT.find((it) => this.comparePath(it.filePath, item.filePath))
            if (exists) {
                // 如果 FLAT 中已存在该节点，则保留树结构相关状态，
                // 仅刷新其它普通字段。
                let skipKey = ['children', 'expanded']
                for (let key in item) {
                    if (!skipKey.includes(key)) exists[key] = item[key]
                }
                return exists
            }
            this.FLAT.push(item)
            return item
        },
        /**
         * 用远端接口返回的最新 children 快照，增量对齐当前渲染数组，
         * 同时尽量保留已经展开的本地子树状态。
         *
         * @param {Array<Object>} arr 当前要被原地修改的渲染数组。
         * 可能是根级的 `treeList`，也可能是某个目录节点的 `children`。
         * @param {Array<Object>} tgt 根据最新远端响应格式化后的目标 children 列表。
         */
        hotReplace(arr, tgt) {
            // 第一步：删除这次服务端快照中已经不存在的节点。
            // 同时把这些节点在 `FLAT` 里的整棵子树也移除，避免后续路径查找命中旧数据。
            for (let i = arr.length - 1; i >= 0; i--) {
                let index = tgt.findIndex((it) => this.comparePath(it.filePath, arr[i].filePath))
                if (index === -1) {
                    this.removeFlatBranch(arr[i].filePath)
                    arr.splice(i, 1)
                }
            }

            // 第二步：把目标节点逐个同步到 `FLAT`。
            // 如果节点原本已经存在，则保留前端树状态，例如 `children`、
            // `expanded`、`finished`，这样局部刷新当前层时不会把已展开目录折叠掉。
            tgt.forEach((item) => {
                let syncItem = item
                let exists = this.FLAT.find((it) => this.comparePath(it.filePath, item.filePath))
                if (exists) {
                    let preserve = {
                        children: exists.children,
                        expanded: exists.expanded,
                        finished: exists.finished
                    }
                    for (let key in item) {
                        exists[key] = item[key]
                    }
                    if (item.isDir) exists.children = preserve.children ? preserve.children : []
                    else exists.children = null
                    exists.expanded = preserve.expanded
                    exists.finished = preserve.finished
                    exists.loading = false
                    exists.editable = false
                    syncItem = exists
                } else {
                    // 新出现的节点先进入 `FLAT`，
                    // 后面渲染数组直接复用这个节点实例。
                    this.FLAT.push(syncItem)
                }

                // 第三步：再同步当前渲染数组本身。
                // 不存在就追加，已存在就替换成保留了旧状态的实例，
                // 这样 Vue 侧能继续复用活跃节点状态。
                let index = arr.findIndex((it) => this.comparePath(it.filePath, syncItem.filePath))
                if (index === -1) {
                    arr.push(syncItem)
                } else {
                    arr[index] = syncItem
                }
            })
        },
        findItem(path) {
            return this.FLAT.find((it) => this.comparePath(it.filePath, path))
        },
        findParentPath(target) {
            let targetPath = target.filePath.replace(/\\/g, '/')
            let parentPath = targetPath.substring(0, targetPath.lastIndexOf('/'))
            return {
                path: parentPath,
                isRoot: parentPath === this.path.replace(/\\/g, '/')
            }
        },
        async refreshFolder() {
            if (!this.path || !this.lock.refresh || !this.uri) {
                this.treeList = []
                this.FLAT = []
                return
            }
            this.lock.refresh = false
            this.removeTmp()
            this.treeList = []
            this.FLAT = []
            await this.loadChildrenByPath(this.path, true)
            this.lock.refresh = true
        },
        async loadChildrenByPath(path, force = false) {
            if (!path || !this.uri) return
            let isRoot = this.comparePath(path, this.path)
            let item = isRoot ? null : this.findItem(path)
            if (!isRoot && !item) return
            if (!isRoot && item.loading) return
            if (!force && !isRoot && item.finished) return

            if (isRoot) this.lock.loading = false
            else item.loading = true

            let pathId = this.computeFileName(path)
            let res = await this.listRemoteDirectoryChildren(pathId)
            if (res?.code === 200 && Array.isArray(res.data)) {
                let children = res.data.map((child) => this.itemFormat(child, path))
                if (isRoot) {
                    this.hotReplace(this.treeList, children)
                } else {
                    this.hotReplace(item.children, children)
                    item.expanded = true
                    item.finished = true
                }
            }

            if (isRoot) this.lock.loading = true
            else {
                item.loading = false
                item.finished = true
            }
        },
        async reloadDirectory(path) {
            if (!path) return
            await this.loadChildrenByPath(path, true)
        },
        handleSearchNotebookChoose(item) {
            if (!item?.id) return
            this.getRemoteNotebookPath(item.id).then((res) => {
                if (res?.code !== 200 || !res?.data?.guidPath) return
                let url = `/notebook/${encodeURI(res.data.guidPath.replace(/\//g, '\\'))}`
                this.Go(url)
            })
        },
        treeItemClick(item) {
            if (!item.filePath || item.loading) return
            if (!item.isDir) {
                let url = `/notebook/${encodeURI(item.filePath.replace(/\//g, '\\'))}`
                const switchNotebook = () => {
                    let parentPath = this.findParentPath(item)
                    let parentItem = this.FLAT.find((it) =>
                        this.comparePath(it.filePath, parentPath.path)
                    )
                    const history =
                        this.itemType === 'notebook'
                            ? this.history.concat({
                                  type: this.itemType,
                                  item: this.editorItem,
                                  page: this.target,
                                  scrollTop: this.tryGetScrollTop(),
                                  dsId: this.currentDataPath
                              })
                            : []
                    if (parentItem) {
                        let children = parentItem.children || []
                        let formatChildren = []
                        // 当初偏偏要在这里搞个remoteID来替换id, 这里id又要改用guid.
                        children.forEach((child) => {
                            if (child.isDir) return
                            formatChildren.push({
                                ...child,
                                id: child.remoteId
                            })
                        })
                        this.reviseEditor({
                            type: 'notebook',
                            dsId: this.currentDataPath,
                            item: {
                                ...parentItem,
                                id: parentItem.remoteId,
                                pages: formatChildren
                            },
                            target: {
                                ...item,
                                id: item.remoteId
                            },
                            scrollTop: 0,
                            displayMode: 'note',
                            history: history,
                            unsave: false,
                            cache: true
                        })
                    } else {
                        // 根目录时直接将数据源项当编辑器父项目
                        parentItem = this.currentDataPathItem
                        let children = this.treeList || []
                        let formatChildren = []
                        children.forEach((child) => {
                            if (child.isDir) return
                            formatChildren.push({
                                ...child,
                                id: child.remoteId
                            })
                        })
                        this.reviseEditor({
                            type: 'notebook',
                            dsId: this.currentDataPath,
                            item: {
                                ...parentItem,
                                pages: formatChildren
                            },
                            target: {
                                ...item,
                                id: item.remoteId
                            },
                            scrollTop: 0,
                            displayMode: 'note',
                            history: history,
                            unsave: false,
                            cache: true
                        })
                    }
                    this.Go(url)
                }
                if (this.$route.path !== url) {
                    if (this.unsave) {
                        this.$infoBox(this.local(`Are you sure to redirect without saved?`), {
                            status: 'warning',
                            title: this.local('Confirm'),
                            confirmTitle: this.local('Confirm'),
                            cancelTitle: this.local('Cancel'),
                            theme: this.theme,
                            confirm: () => {
                                switchNotebook()
                            },
                            cancel: () => {}
                        })
                    } else {
                        switchNotebook()
                    }
                }
                return
            }
            if (!item.finished) this.loadChildrenByPath(item.filePath)
        },
        createFile(dir = null) {
            if (!this.lock.create) return
            this.removeTmp()
            let tmpItem = {
                id: this.$Guid(),
                remoteId: null,
                name: '.fbn',
                editable: true,
                expanded: false,
                loading: false,
                finished: false,
                filePath: null,
                dir: dir ? dir : this.path,
                isFile: true,
                isDir: false
            }
            if (!dir || this.comparePath(dir, this.path)) {
                this.treeList.unshift(tmpItem)
            } else {
                let dirItem = this.findItem(dir)
                if (!dirItem) return
                dirItem.expanded = true
                dirItem.children.unshift(tmpItem)
            }
            this.FLAT.push(tmpItem)
            setTimeout(() => {
                let textbox = this.$refs[`t:${tmpItem.id}`]
                if (!textbox) return
                textbox.focus()
                let input = textbox.$el.querySelector('input')
                input.setSelectionRange(0, 0)
            }, 300)
        },
        createFolder(dir = null) {
            if (!this.lock.create) return
            this.removeTmp()
            let tmpItem = {
                id: this.$Guid(),
                remoteId: null,
                name: '',
                editable: true,
                children: [],
                expanded: false,
                loading: false,
                finished: false,
                filePath: null,
                dir: dir ? dir : this.path,
                isFile: false,
                isDir: true
            }
            if (!dir || this.comparePath(dir, this.path)) {
                this.treeList.unshift(tmpItem)
            } else {
                let dirItem = this.findItem(dir)
                if (!dirItem) return
                dirItem.expanded = true
                dirItem.children.unshift(tmpItem)
            }
            this.FLAT.push(tmpItem)
            setTimeout(() => {
                let textbox = this.$refs[`t:${tmpItem.id}`]
                if (!textbox) return
                textbox.focus()
                let input = textbox.$el.querySelector('input')
                input.setSelectionRange(0, 0)
            }, 300)
        },
        nameJudge(target) {
            let pattern = /[<>:"/\\\\|\\?\\*]/
            if (pattern.test(target.name)) return 'name'
            if (!target.name) return 'empty'
            let dir = target.dir ? target.dir : this.path
            let siblings = this.comparePath(dir, this.path)
                ? this.treeList
                : this.findItem(dir)?.children || []
            let matchItem = siblings.find((it) => it.name === target.name && it.id !== target.id)
            if (matchItem) return 'exists'
            return false
        },
        removeTmp() {
            for (let i = this.treeList.length - 1; i >= 0; i--) {
                if (this.treeList[i].filePath === null) {
                    this.treeList.splice(i, 1)
                }
            }
            for (let item of this.FLAT) {
                if (item.children) {
                    for (let i = item.children.length - 1; i >= 0; i--) {
                        if (item.children[i].filePath === null) {
                            item.children.splice(i, 1)
                        }
                    }
                }
            }
            for (let i = this.FLAT.length - 1; i >= 0; i--) {
                if (this.FLAT[i].filePath === null) {
                    this.FLAT.splice(i, 1)
                }
            }
        },
        showRename(item) {
            if (!item || item.loading) return
            item.originName = item.name
            item.editable = true
            setTimeout(() => {
                let textbox = this.$refs[`t:${item.id}`]
                if (!textbox) return
                textbox.focus()
                let input = textbox.$el.querySelector('input')
                let dotIndex = input.value.lastIndexOf('.')
                if (dotIndex > -1) input.setSelectionRange(0, dotIndex)
                else document.execCommand('selectAll')
            }, 300)
        },
        async rename(target) {
            let judge = this.nameJudge(target)
            if (judge === 'name') {
                this.$barWarning(this.local('Name cannot contain special characters'), {
                    status: 'warning'
                })
                return
            } else if (judge === 'empty') {
                this.$barWarning(this.local('Name cannot be empty'), {
                    status: 'warning'
                })
                return
            } else if (judge === 'exists') {
                this.$barWarning(this.local('Name already exists'), {
                    status: 'warning'
                })
                return
            }
            let item = this.FLAT.find((it) => it.id === target.id)
            if (!item) return
            item.name = target.name
            item.editable = false
            if (!item.filePath) {
                if (item.isDir) await this.newFolderConfirm(item)
                else await this.newFileConfirm(item)
            } else await this.renameConfirm(item)
        },
        async newFileConfirm(target) {
            if (!this.lock.create) return
            this.lock.create = false
            let fbn = JSON.parse(JSON.stringify(fabulous_notebook))
            let url = target.dir.replace(/\\/g, '/') + `/${target.name}`
            fbn.id = this.$Guid()
            fbn.title = ''
            fbn.content = {
                type: 'doc',
                content: []
            }
            fbn.createDate = new Date()
            fbn.updateDate = new Date()
            let res = await this.createRemoteDocument(this.uri, url, JSON.stringify(fbn))
            if (res?.code === 200) {
                this.removeTmp()
                let newItem = this.itemFormat(
                    {
                        id: res.data?.id,
                        name: target.name,
                        title: target.name,
                        type: 'document'
                    },
                    target.dir
                )
                this.hotAddItem(newItem)
            }
            this.lock.create = true
        },
        async newFolderConfirm(target) {
            if (!this.lock.create) return
            this.lock.create = false
            let url = target.dir.replace(/\\/g, '/') + `/${target.name}`
            let res = await this.createRemoteDirectory(this.uri, url)
            if (res?.code === 200) {
                this.removeTmp()
                let newItem = this.itemFormat(
                    {
                        id: res.data?.id,
                        name: target.name,
                        title: target.name,
                        type: 'group'
                    },
                    target.dir
                )
                newItem.children = []
                newItem.finished = false
                this.hotAddItem(newItem)
            }
            this.lock.create = true
        },
        async renameConfirm(target) {
            if (!this.lock.rename) return
            this.lock.rename = false
            let res = null
            if (target.isDir) {
                res = await this.updateRemoteDirectoryInfo(this.uri, target.filePath, {
                    name: target.name
                })
            } else {
                res = await this.updateRemoteDocumentInfo(this.uri, target.filePath, {
                    name: target.name
                })
            }
            if (res?.code !== 200) {
                target.name = target.originName
            }
            delete target.originName
            this.lock.rename = true
        },
        async deleteConfirm(target) {
            if (!target.filePath || !this.lock.remove) return
            this.lock.remove = false
            let res = null
            if (target.isDir) res = await this.removeRemoteDirectory(this.uri, target.filePath)
            else res = await this.removeRemoteDocument(this.uri, target.filePath)

            if (res?.code === 200) {
                this.removeItemFromCollections(target.filePath)
            }
            this.lock.remove = true
        },
        copy(target) {
            this.copyList = [
                {
                    type: 'copy',
                    name: target.name,
                    path: target.filePath
                }
            ]
        },
        move(target) {
            this.copyList = [
                {
                    type: 'move',
                    name: target.name,
                    path: target.filePath
                }
            ]
        },
        async paste(target) {
            if (!target.isDir || !this.lock.paste) return
            this.lock.paste = false
            for (let item of this.copyList) {
                let itemPath = this.computeFileName(item.path)
                let targetPath = target.filePath.replace(/\\/g, '/') + `/${itemPath}`
                let res = null
                if (item.type === 'copy') {
                    res = await this.copyRemoteDirectory(this.uri, item.path, targetPath)
                } else {
                    res = await this.moveRemoteDirectory(this.uri, item.path, targetPath)
                }
                if (res?.code !== 200) {
                    this.lock.paste = true
                    return
                }
                target.expanded = true
                await this.reloadDirectory(target.filePath)
                if (item.type === 'move') {
                    let sourceParent = item.path.substring(0, item.path.lastIndexOf('/'))
                    if (!this.comparePath(sourceParent, target.filePath)) {
                        await this.reloadDirectory(sourceParent)
                    }
                }
            }
            this.copyList = []
            this.lock.paste = true
        },
        rootPasteDisabled() {
            return this.copyList.length === 0 || !this.path || !this.lock.paste
        },
        async rootPaste() {
            if (this.rootPasteDisabled()) return
            await this.paste({
                isDir: true,
                filePath: this.path,
                expanded: true
            })
        },
        collapseAll() {
            for (let item of this.FLAT) {
                if (item.isDir) item.expanded = false
            }
        },
        rightClick($event, item) {
            $event.preventDefault()
            $event.stopPropagation()
            if (!item.filePath) return
            this.rightMenuItem = item
            this.$refs.rightMenu.rightClick($event, this.$el)
        },
        openPermissionPanel(item) {
            if (!item?.filePath || !item?.remoteId) return
            this.permissionTarget = item
            this.showPermissionPanel = true
        },
        openDeleteConfirmPanel(item) {
            if (!item?.filePath) return
            this.deleteTarget = item
            this.showDeleteConfirmPanel = true
        },
        whiteClickClearTmp(event) {
            let x = event.target
            let _self = false
            while (x && x.tagName && x.tagName.toLowerCase() != 'body') {
                let classList = [...x.classList]
                if (
                    classList.includes('fv-TreeView--item') ||
                    classList.includes('remote-tree-view-search') ||
                    classList.includes('navigation-view-mode-block') ||
                    classList.includes('navigation-view-command-bar-block') ||
                    classList.includes('lt-right-menu')
                ) {
                    _self = true
                    break
                }
                x = x.parentNode
            }
            if (!_self) this.removeTmp()
        }
    },
    beforeUnmount() {
        window.removeEventListener('click', this.whiteClickClearTmp)
    }
}
</script>

<style lang="scss">
.remote-tree-view-container {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    overflow-x: hidden;

    .remote-tree-view-search {
        @include Vcenter;

        padding: 0px 20px;
    }

    .tree-view-custom-item {
        position: relative;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        overflow-x: hidden;

        &.dark {
            color: whitesmoke;
        }

        .tree-view-item-left-block {
            @include Vcenter;

            width: 100%;
            flex: 1;
            overflow: hidden;

            .tree-view-custom-label {
                @include nowrap;

                width: 90%;
                margin-left: 5px;
                flex: 1;
                font-size: 12px;
                user-select: none;
                overflow: hidden;
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

    .icon-img {
        width: 16px;
        height: auto;
    }
}
</style>
