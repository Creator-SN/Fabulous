<template>
    <div class="local-tree-view-container">
        <div class="local-tree-view-search">
            <search-box
                :theme="theme"
                :local="local"
                :root-path="path"
                :search-local-notebooks="searchLocalNotebooks"
                @choose-item="handleSearchNotebookChoose"
            ></search-box>
        </div>
        <div class="navigation-view-mode-block" :class="[{ dark: theme === 'dark' }]">
            <div class="navigation-view-mode-left-block">
                <img draggable="false" :src="img.notebook" alt="" class="icon-img" />
                <p class="title">{{ path ? localPathFolderName : local('Local Notebook') }}</p>
            </div>
            <div v-show="path" class="navigation-view-mode-right-block">
                <i
                    class="ms-Icon ms-Icon--OpenFolderHorizontal more-menu-btn"
                    :title="local('Choose Folder')"
                    @click="chooseFolder"
                ></i>
                <i
                    class="ms-Icon ms-Icon--SubscriptionAdd more-menu-btn"
                    :title="local('New Note')"
                    @click="createFile()"
                ></i>
                <i
                    class="ms-Icon ms-Icon--NewFolder more-menu-btn"
                    :title="local('New Folder')"
                    @click="createFolder()"
                ></i>
                <i
                    class="ms-Icon ms-Icon--Refresh more-menu-btn"
                    :title="local('Refresh Folder')"
                    @click="refreshFolder"
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
                    @contextmenu="rightClick($event, x.item)"
                >
                    <div class="tree-view-item-left-block">
                        <img
                            v-if="x.item.loading === false"
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
        <div v-show="!path" class="local-empty-block">
            <fv-button
                theme="dark"
                background="rgba(255, 180, 0, 1)"
                :is-box-shadow="true"
                style="width: calc(100% - 50px)"
                @click="chooseFolder"
            >
                {{ local('Open Folder') }}
            </fv-button>
        </div>
        <div class="navigation-view-command-bar-block" :class="[{ dark: theme === 'dark' }]">
            <div
                v-for="(item, index) in notebookCmdList"
                :key="`command-bar-item:${index}`"
                v-show="item.show()"
                class="command-item"
                :class="[{ disabled: item.disabled() }]"
                @click="() => (!item.disabled() ? item.func() : null)"
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
                <span @click="openFolder(rightMenuItem)">
                    <i
                        class="ms-Icon ms-Icon--OpenFolderHorizontal"
                        style="color: rgba(140, 148, 228, 1)"
                    ></i>
                    <p>{{ local('Open Folder') }}</p>
                </span>
                <hr />
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
import { mapActions, mapState } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { useLocalNotebookConfig } from '@/stores/local_notebook'
import { fabulous_notebook } from '@/js/data_sample'

import rightMenu from '@/components/general/rightMenu.vue'
import searchBox from './searchBox.vue'

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
    name: 'local-tree-view',
    components: { rightMenu, searchBox },
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
            FLAT: [],
            copyList: [],
            rightMenuItem: {},
            notebookCmdList: [
                {
                    name: () => this.local('Open File'),
                    func: () => this.chooseFile(),
                    img: 'note',
                    disabled: () => false,
                    show: () => true
                },
                {
                    name: () => this.local('Choose Folder'),
                    func: () => this.chooseFolder(),
                    img: 'folder',
                    disabled: () => false,
                    show: () => true
                },
                {
                    name: () => this.local('Refresh Folder'),
                    func: () => this.refreshFolder(),
                    img: 'refresh',
                    disabled: () => !this.path,
                    show: () => true
                },
                {
                    name: () => this.local('Paste to Root'),
                    img: 'paste',
                    func: () => this.rootPaste(),
                    disabled: () => !this.path || this.copyList.length === 0,
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
            }
        }
    },
    watch: {
        modelValue(val) {
            this.path = this.normalizePath(val)
            this.resetAndWatch()
        },
        path(val) {
            this.$emit('update:modelValue', val)
        }
    },
    computed: {
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        ...mapState(useAppConfig, {
            local: 'local',
            editorMap: (state) => state.editor
        }),
        ...mapState(useDataStore, {
            lastLocalPath: (state) => state.configState.lastLocalPath
        }),
        currentEditor() {
            return this.editorMap?.local || null
        },
        localPathFolderName() {
            let pathList = this.path.split(/[\\/]/)
            return pathList[pathList.length - 1]
        },
        computeIcon() {
            return (item) => {
                if (item.isDir) return this.img.folder
                let ext = item.name.split('.').pop()
                if (ext === 'fbn') return this.img.note
                if (ext === 'json') return this.img.json
                if (ext === 'html') return this.img.html
                if (ext === 'md') return this.img.markdown
                return this.img.file
            }
        }
    },
    mounted() {
        this.path = this.normalizePath(this.modelValue || this.lastLocalPath)
        this.resetAndWatch()
        window.addEventListener('click', this.whiteClickClearTmp)
    },
    methods: {
        ...mapActions(useAppConfig, {
            reviseEditor: 'reviseEditor',
            tryGetScrollTop: 'tryGetScrollTop'
        }),
        ...mapActions(useDataStore, {
            reviseConfig: 'reviseConfig'
        }),
        ...mapActions(useLocalNotebookConfig, [
            'setRootPath',
            'chooseLocalDirectory',
            'chooseLocalFile',
            'listLocalDirectoryChildren',
            'searchLocalDirectories',
            'searchLocalNotebooks',
            'createDocument',
            'createDirectory',
            'updateDocumentInfo',
            'updateDirectoryInfo',
            'removeDocument',
            'removeDirectory',
            'copyDirectory',
            'moveDirectory',
            'openFile',
            'watchDirectory',
            'stopWatchDirectory'
        ]),
        normalizePath(targetPath) {
            return (targetPath || '').replace(/\\/g, '/')
        },
        comparePath(path1, path2) {
            return this.normalizePath(path1) === this.normalizePath(path2)
        },
        buildItem(entry, dir = null) {
            return {
                id: entry.id || encodeURIComponent(this.normalizePath(entry.filePath || '')),
                name: entry.name,
                editable: false,
                children: entry.isDir ? [] : null,
                expanded: false,
                loading: false,
                finished: false,
                filePath: this.normalizePath(entry.filePath || ''),
                dir: dir,
                isFile: Boolean(entry.isFile),
                isDir: Boolean(entry.isDir),
                createDate: entry.createDate,
                updateDate: entry.updateDate
            }
        },
        async resetAndWatch() {
            this.treeList = []
            this.FLAT = []
            this.copyList = []
            await this.stopWatchDirectory()
            if (!this.path) return
            this.setRootPath(this.path)
            await this.watchDirectory(this.path, this.handleDirectoryChange)
            await this.refreshFolder()
        },
        async handleDirectoryChange(payload) {
            if (!payload?.directoryPath) return
            const targetPath = this.normalizePath(payload.directoryPath)
            if (this.comparePath(targetPath, this.path)) {
                await this.refreshFolder()
                return
            }
            let parentItem = this.findItem(targetPath)
            if (parentItem?.isDir) {
                await this.loadChildrenByPath(parentItem.filePath, true)
            }
        },
        findItem(targetPath, list = this.treeList) {
            for (const item of list) {
                if (this.comparePath(item.filePath, targetPath)) return item
                if (item.children?.length) {
                    const found = this.findItem(targetPath, item.children)
                    if (found) return found
                }
            }
            return null
        },
        getParentPath(targetPath) {
            let normalized = this.normalizePath(targetPath)
            let parts = normalized.split('/')
            parts.pop()
            return parts.join('/')
        },
        updateItemPath(item, nextPath) {
            const previousPath = this.normalizePath(item.filePath)
            const normalizedNextPath = this.normalizePath(nextPath)
            item.filePath = normalizedNextPath
            item.id = encodeURIComponent(normalizedNextPath)
            item.dir = this.getParentPath(normalizedNextPath)
            if (!item.isDir || !item.children?.length) return
            const previousPrefix = `${previousPath}/`
            const nextPrefix = `${normalizedNextPath}/`
            const walk = (children) => {
                for (const child of children) {
                    if (!child.filePath) continue
                    const normalizedChildPath = this.normalizePath(child.filePath)
                    if (normalizedChildPath.startsWith(previousPrefix)) {
                        child.filePath = normalizedChildPath.replace(previousPrefix, nextPrefix)
                        child.id = encodeURIComponent(child.filePath)
                    }
                    child.dir = this.getParentPath(child.filePath)
                    if (child.children?.length) walk(child.children)
                }
            }
            walk(item.children)
        },
        syncFlat() {
            const result = []
            const walk = (items) => {
                for (const item of items) {
                    result.push(item)
                    if (item.children?.length) walk(item.children)
                }
            }
            walk(this.treeList)
            this.FLAT = result
        },
        async applyChildren(directoryPath, children) {
            let nextChildren = children.map((child) => this.buildItem(child, directoryPath))
            if (this.comparePath(directoryPath, this.path)) {
                this.treeList = nextChildren
            } else {
                let parentItem = this.findItem(directoryPath)
                if (!parentItem) return
                parentItem.children = nextChildren
                parentItem.finished = true
                parentItem.loading = false
                parentItem.expanded = true
            }
            this.syncFlat()
        },
        async loadChildrenByPath(directoryPath, force = false) {
            let targetPath = this.normalizePath(directoryPath)
            let parentItem = this.findItem(targetPath)
            if (parentItem && parentItem.finished && !force) return
            if (parentItem) parentItem.loading = true
            let res = await this.listLocalDirectoryChildren(targetPath)
            if (res?.code === 200 || res?.status === 'success') {
                await this.applyChildren(targetPath, res.data || [])
            }
        },
        async refreshFolder() {
            if (!this.path) return
            await this.loadChildrenByPath(this.path, true)
        },
        async chooseFolder() {
            let res = await this.chooseLocalDirectory()
            if (res?.code === 204) return
            if (res?.code !== 200 || !res?.data) {
                this.$barWarning(res?.message || this.local('Open Folder Failed'), {
                    status: 'warning'
                })
                return
            }
            this.path = this.normalizePath(res.data)
            await this.reviseConfig({
                lastLocalPath: this.path
            })
            await this.resetAndWatch()
        },
        async chooseFile() {
            let res = await this.chooseLocalFile()
            if (res?.code === 204) return
            if (res?.code !== 200 || !res?.data) {
                this.$barWarning(res?.message || this.local('Open File Failed'), {
                    status: 'warning'
                })
                return
            }
            const filePath = this.normalizePath(res.data)
            this.openNotebook(
                this.buildItem(
                    {
                        name: filePath.split('/').pop(),
                        filePath,
                        isFile: true,
                        isDir: false
                    },
                    this.getParentPath(filePath)
                )
            )
        },
        async focusDirectory(item) {
            if (!item?.filePath) return
            let targetPath = this.normalizePath(item.filePath)
            if (this.comparePath(targetPath, this.path)) {
                await this.refreshFolder()
                return
            }
            let currentPath = targetPath
            const ancestors = []
            while (currentPath && !this.comparePath(currentPath, this.path)) {
                ancestors.unshift(currentPath)
                currentPath = this.getParentPath(currentPath)
            }
            let parentPath = this.path
            for (const folderPath of ancestors) {
                await this.loadChildrenByPath(parentPath, true)
                let folderItem = this.findItem(folderPath)
                if (!folderItem) continue
                folderItem.expanded = true
                parentPath = folderPath
            }
            await this.loadChildrenByPath(targetPath, true)
        },
        async handleSearchNotebookChoose(item) {
            if (!item?.filePath) return
            let parentPath = this.getParentPath(item.filePath)
            if (parentPath && !this.comparePath(parentPath, this.path)) {
                await this.focusDirectory({
                    filePath: parentPath
                })
            }
            this.openNotebook(this.buildItem(item, parentPath))
        },
        treeItemClick(item) {
            if (!item.filePath || item.loading) return
            if (item.isDir) {
                if (!item.finished) this.loadChildrenByPath(item.filePath)
                return
            }
            this.openNotebook(item)
        },
        openNotebook(item) {
            let url = `/notebook/local/${encodeURI(item.filePath.replace(/\//g, '\\'))}`
            const switchNotebook = () => {
                const parentPath = this.getParentPath(item.filePath)
                const parentItem =
                    this.findItem(parentPath) ||
                    this.buildItem(
                        {
                            name: parentPath.split('/').pop() || this.localPathFolderName,
                            filePath: parentPath,
                            isDir: true,
                            isFile: false
                        },
                        this.getParentPath(parentPath)
                    )
                const siblings = this.comparePath(parentPath, this.path)
                    ? this.treeList
                    : parentItem.children || []
                const pages = siblings
                    .filter((child) => child.isFile)
                    .map((child) => ({ ...child }))
                const history =
                    this.currentEditor?.type === 'notebook'
                        ? (this.currentEditor.history || []).concat({
                              type: this.currentEditor.type,
                              item: this.currentEditor.item,
                              page: this.currentEditor.target,
                              scrollTop: this.tryGetScrollTop(),
                              dsId: 'local'
                          })
                        : []

                this.reviseEditor({
                    id: 'local',
                    type: 'notebook',
                    dsId: 'local',
                    item: {
                        ...parentItem,
                        id: encodeURIComponent(parentItem.filePath),
                        pages
                    },
                    target: {
                        ...item,
                        id: encodeURIComponent(item.filePath)
                    },
                    scrollTop: 0,
                    displayMode: 'note',
                    history,
                    unsave: false,
                    cache: true
                })
                this.Go(url)
            }

            if (this.$route.path !== url) switchNotebook()
        },
        createFile(dir = null) {
            this.clearTransientStates()
            let targetDir = this.normalizePath(dir || this.path)
            let tmpItem = {
                id: this.$Guid(),
                name: '.fbn',
                editable: true,
                children: null,
                expanded: false,
                loading: false,
                finished: false,
                filePath: null,
                dir: targetDir,
                isFile: true,
                isDir: false
            }
            this.pushTmpItem(tmpItem, targetDir)
        },
        createFolder(dir = null) {
            this.clearTransientStates()
            let targetDir = this.normalizePath(dir || this.path)
            let tmpItem = {
                id: this.$Guid(),
                name: '',
                editable: true,
                children: [],
                expanded: false,
                loading: false,
                finished: false,
                filePath: null,
                dir: targetDir,
                isFile: false,
                isDir: true
            }
            this.pushTmpItem(tmpItem, targetDir)
        },
        pushTmpItem(tmpItem, targetDir) {
            if (this.comparePath(targetDir, this.path)) {
                this.treeList.unshift(tmpItem)
            } else {
                let dirItem = this.findItem(targetDir)
                if (!dirItem) return
                dirItem.expanded = true
                if (!Array.isArray(dirItem.children)) dirItem.children = []
                dirItem.children.unshift(tmpItem)
            }
            this.syncFlat()
            setTimeout(() => {
                let textbox = this.$refs[`t:${tmpItem.id}`]
                if (!textbox) return
                textbox.focus()
                let input = textbox.$el.querySelector('input')
                if (input) input.setSelectionRange(0, 0)
            }, 300)
        },
        nameJudge(target) {
            let pattern = /[<>:"/\\|\?\*]/
            if (pattern.test(target.name)) return 'name'
            if (!target.name) return 'empty'
            let dir = this.normalizePath(target.dir || this.path)
            let siblings = this.comparePath(dir, this.path)
                ? this.treeList
                : this.findItem(dir)?.children || []
            let exists = siblings.find((it) => it.name === target.name && it.id !== target.id)
            if (exists) return 'exists'
            return false
        },
        removeTmp() {
            for (let i = this.treeList.length - 1; i >= 0; i--) {
                if (this.treeList[i].filePath === null) {
                    this.treeList.splice(i, 1)
                }
            }
            for (let item of this.FLAT) {
                if (!item.children) continue
                for (let i = item.children.length - 1; i >= 0; i--) {
                    if (item.children[i].filePath === null) {
                        item.children.splice(i, 1)
                    }
                }
            }
            for (let i = this.FLAT.length - 1; i >= 0; i--) {
                if (this.FLAT[i].filePath === null) {
                    this.FLAT.splice(i, 1)
                }
            }
        },
        clearEditableStates(list = this.treeList) {
            for (const item of list) {
                if (item.editable) {
                    item.editable = false
                    if (item.originName !== undefined) {
                        item.name = item.originName
                        delete item.originName
                    }
                }
                if (item.children?.length) {
                    this.clearEditableStates(item.children)
                }
            }
        },
        clearTransientStates() {
            this.clearEditableStates()
            this.removeTmp()
        },
        showRename(item) {
            if (!item || item.loading) return
            this.clearTransientStates()
            item.originName = item.name
            item.editable = true
            setTimeout(() => {
                let textbox = this.$refs[`t:${item.id}`]
                if (!textbox) return
                textbox.focus()
                let input = textbox.$el.querySelector('input')
                if (!input) return
                let dotIndex = input.value.lastIndexOf('.')
                if (dotIndex > -1) input.setSelectionRange(0, dotIndex)
                else input.setSelectionRange(0, input.value.length)
            }, 300)
        },
        async rename(target) {
            let judge = this.nameJudge(target)
            if (judge === 'name') {
                this.$barWarning(this.local('Name cannot contain special characters'), {
                    status: 'warning'
                })
                return
            }
            if (judge === 'empty') {
                this.$barWarning(this.local('Name cannot be empty'), {
                    status: 'warning'
                })
                return
            }
            if (judge === 'exists') {
                this.$barWarning(this.local('Name already exists'), {
                    status: 'warning'
                })
                return
            }
            target.editable = false
            if (!target.filePath) {
                if (target.isDir) await this.newFolderConfirm(target)
                else await this.newFileConfirm(target)
                return
            }
            const previousPath = this.normalizePath(target.filePath)
            let res = target.isDir
                ? await this.updateDirectoryInfo('local', target.filePath, { name: target.name })
                : await this.updateDocumentInfo('local', target.filePath, { name: target.name })
            if (res?.code !== 200 && target.originName) {
                target.name = target.originName
            } else if (res?.data) {
                const nextPath = this.normalizePath(res.data)
                this.updateItemPath(target, nextPath)
                if (target.isDir && this.comparePath(previousPath, this.path)) {
                    this.path = nextPath
                    await this.reviseConfig({
                        lastLocalPath: this.path
                    })
                    delete target.originName
                    await this.resetAndWatch()
                    return
                }
            }
            delete target.originName
            await this.reloadDirectory(target.dir || this.path)
        },
        async newFileConfirm(target) {
            let fbn = JSON.parse(JSON.stringify(fabulous_notebook))
            let filePath = `${target.dir}/${target.name}`
            fbn.id = this.$Guid()
            fbn.title = ''
            fbn.content = {
                type: 'doc',
                content: []
            }
            fbn.createDate = new Date()
            fbn.updateDate = new Date()
            let res = await this.createDocument('local', filePath, JSON.stringify(fbn))
            if (res?.code === 200) {
                this.removeTmp()
                await this.reloadDirectory(target.dir)
            }
        },
        async newFolderConfirm(target) {
            let directoryPath = `${target.dir}/${target.name}`
            let res = await this.createDirectory('local', directoryPath)
            if (res?.code === 200) {
                this.removeTmp()
                await this.reloadDirectory(target.dir)
            }
        },
        async deleteConfirm(target) {
            if (!target?.filePath) return
            this.$infoBox(this.local('Are you sure to delete this file?'), {
                status: 'warning',
                title: this.local('Delete'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    let res = target.isDir
                        ? await this.removeDirectory('local', target.filePath)
                        : await this.removeDocument('local', target.filePath)
                    if (res?.code === 200) {
                        await this.reloadDirectory(target.dir || this.path)
                    }
                },
                cancel: () => {}
            })
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
            if (!target?.isDir) return
            for (let item of this.copyList) {
                let entryName = item.path.split('/').pop()
                let targetPath = `${target.filePath}/${entryName}`
                let res =
                    item.type === 'copy'
                        ? await this.copyDirectory('local', item.path, targetPath)
                        : await this.moveDirectory('local', item.path, targetPath)
                if (res?.code !== 200) return
                await this.reloadDirectory(target.filePath)
                if (item.type === 'move') {
                    await this.reloadDirectory(this.getParentPath(item.path))
                }
            }
            this.copyList = []
        },
        async rootPaste() {
            await this.paste({
                isDir: true,
                filePath: this.path
            })
        },
        async reloadDirectory(directoryPath) {
            let targetPath = this.normalizePath(directoryPath)
            if (!targetPath) return
            if (this.comparePath(targetPath, this.path)) {
                await this.refreshFolder()
                return
            }
            await this.loadChildrenByPath(targetPath, true)
        },
        async openFolder(item) {
            let path = item.isDir ? item.filePath : item.dir
            if (!path) return
            await this.openFile('local', path)
        },
        whiteClickClearTmp(event) {
            let x = event.target
            let _self = false
            while (x && x.tagName && x.tagName.toLowerCase() !== 'body') {
                let classList = [...x.classList]
                if (
                    classList.includes('fv-TreeView--item') ||
                    classList.includes('local-tree-view-search') ||
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
        },
        rightClick($event, item) {
            $event.preventDefault()
            $event.stopPropagation()
            if (!item.filePath) return
            this.rightMenuItem = item
            this.$refs.rightMenu.rightClick($event, this.$el)
        }
    },
    async beforeUnmount() {
        window.removeEventListener('click', this.whiteClickClearTmp)
        await this.stopWatchDirectory()
    }
}
</script>

<style lang="scss">
.local-tree-view-container {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    overflow-x: hidden;

    .local-tree-view-search {
        @include Vcenter;

        padding: 0px 20px;
    }

    .local-empty-block {
        @include HcenterVcenter;

        position: relative;
        width: 100%;
        height: 50px;
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

        .image-menu-btn {
            padding: 0px;
            overflow: hidden;
        }
    }

    .icon-img {
        width: 16px;
        height: auto;
    }
}
</style>
