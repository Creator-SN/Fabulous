<template>
    <div class="local-tree-view-container">
        <div
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
                <p class="title">{{!value ? local('Notebook') : localPathFolderName}}</p>
            </div>
            <div
                v-show="value"
                class="navigation-view-mode-right-block"
            >
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
            :backgroundColorHover="theme == 'dark' ? 'rgba(36, 36, 36, 0.3)' : 'rgba(255, 255, 255, 0.3)'"
            :backgroundColorActive="theme == 'dark' ? 'rgba(36, 36, 36, 0.6)' : 'rgba(255, 255, 255, 0.6)'"
            :leftIconForeground="'rgba(245, 78, 162, 0.8)'"
            :expandClickMode="'normal'"
            style="width: 100%; height: 100%; overflow: overlay;"
            @click="treeItemClick"
        >
            <template v-slot:default="x">
                <div
                    class="tree-view-custom-item"
                    :class="[{dark: theme === 'dark'}]"
                    :style="{opacity: copyList.find(it => it.path === x.item.filePath && it.type === 'move') ? 0.6 : ''}"
                    @contextmenu="rightClick($event, x.item)"
                >
                    <div class="tree-view-item-left-block">
                        <img
                            v-if="x.item.loading == false"
                            draggable="false"
                            class="icon-img"
                            :src="computeIcon(x.item)"
                            alt=""
                        >
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
                            :title="x.item.name"
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
        <div
            v-if="!isRemote"
            v-show="!path"
            class="local-empty-block"
        >
            <fv-button
                theme="dark"
                background="rgba(255, 180, 0, 1)"
                :is-box-shadow="true"
                style="width: calc(100% - 50px);"
                @click="chooseFolder"
            >{{local('Open Folder')}}</fv-button>
        </div>
        <div
            class="navigation-view-command-bar-block"
            :class="[{dark: theme === 'dark'}]"
        >
            <div
                v-show="item.show()"
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
        <right-menu
            class="lt-right-menu"
            ref="rightMenu"
            :theme="theme"
            :rightMenuWidth="rightMenuWidth"
        >
            <div>
                <span
                    v-show="rightMenuItem.isDir"
                    @click="createFile(rightMenuItem.filePath)"
                >
                    <i
                        class="ms-Icon ms-Icon--SubscriptionAdd"
                        style="color: rgba(0, 120, 212, 1);"
                    ></i>
                    <p>{{local("New Note")}}</p>
                </span>
                <span
                    v-show="rightMenuItem.isDir"
                    @click="createFolder(rightMenuItem.filePath)"
                >
                    <i
                        class="ms-Icon ms-Icon--NewFolder"
                        style="color: rgba(0, 153, 204, 1);"
                    ></i>
                    <p>{{local("New Folder")}}</p>
                </span>
                <hr v-show="rightMenuItem.isDir">
                <span @click="copy(rightMenuItem)">
                    <i
                        class="ms-Icon ms-Icon--Copy"
                        style="color: rgba(0, 98, 158, 1);"
                    ></i>
                    <p>{{local("Copy")}}</p>
                </span>
                <span @click="move(rightMenuItem)">
                    <i
                        class="ms-Icon ms-Icon--Cut"
                        style="color: rgba(0, 98, 158, 1);"
                    ></i>
                    <p>{{local("Cut")}}</p>
                </span>
                <span
                    v-show="rightMenuItem.isDir && copyList.length > 0"
                    @click="paste(rightMenuItem)"
                >
                    <i
                        class="ms-Icon ms-Icon--Paste"
                        style="color: rgba(0, 98, 158, 1);"
                    ></i>
                    <p>{{local("Paste")}}</p>
                </span>
                <hr v-if="!isRemote">
                <span
                    v-if="!isRemote"
                    @click="openFile(rightMenuItem)"
                >
                    <img
                        draggable="false"
                        :src="img.folder"
                        alt=""
                        style="width: 13px; height: 13px; object-fit: contain;"
                    >
                    <p>{{local("Open Folder")}}</p>
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
    </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex';

import rightMenu from '@/components/general/rightMenu.vue';

import { fabulous_notebook } from '@/js/data_sample.js';

import { NotebookWatcher, RemoteNotebookWatcher } from '@/js/eventManager.js';

import notebook from '@/assets/nav/notebook.svg';
import folderImg from '@/assets/nav/folder.svg';
import noteImg from '@/assets/nav/note.svg';
import jsonImg from '@/assets/nav/json.svg';
import htmlImg from '@/assets/nav/html.svg';
import fileImg from '@/assets/nav/file.svg';
import markdownImg from '@/assets/nav/markdown.svg';
import newFolderImg from '@/assets/nav/newFolder.svg';
import refreshImg from '@/assets/nav/refresh.svg';
import pasteImg from '@/assets/nav/paste.svg';
import allImg from '@/assets/nav/all.svg';

export default {
    components: { rightMenu },
    props: {
        value: {
            default: ''
        },
        rightMenuWidth: {
            default: 200
        },
        isRemote: {
            default: false
        },
        Go: {
            default: () => {}
        }
    },
    data() {
        return {
            path: this.value,
            treeList: [],
            notebookCmdList: [
                {
                    name: () => this.local('New Folder'),
                    func: () => this.createFolder(),
                    img: 'newFolder',
                    disabled: () => !this.value,
                    show: () => true,
                    iconColor: 'rgba(213, 99, 70, 1)'
                },
                {
                    name: () => this.local('Choose Folder'),
                    func: () => this.chooseFolder(),
                    img: 'folder',
                    disabled: () => false,
                    show: () => !this.isRemote,
                    iconColor: 'rgba(213, 99, 70, 1)'
                },
                {
                    name: () => this.local('Refresh Folder'),
                    func: () => this.refreshFolder(),
                    img: 'refresh',
                    disabled: () => !this.value,
                    show: () => true,
                    iconColor: 'rgba(172, 84, 206, 1)'
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
                paste: pasteImg,
                all: allImg
            },
            FLAT: [],
            copyList: [],
            nw: !this.isRemote
                ? new NotebookWatcher()
                : new RemoteNotebookWatcher(),
            rightMenuItem: {},
            show: {
                rightMenu: false
            },
            lock: {
                loading: true
            }
        };
    },
    watch: {
        value(val) {
            this.path = val;
        },
        path(val) {
            this.$emit('input', val);
            if (!val) return;
            this.refreshFolder();
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            watchAllExtensions: (state) => state.config.watchAllExtensions,
            unsave: (state) => state.editor.unsave,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath', 'currentDataPathItem']),
        computeTreeItem() {
            return (fileObj) => {
                let item = {
                    id: this.$Guid(),
                    name: fileObj.name,
                    editable: false,
                    children: fileObj.isDir ? [] : null,
                    dir: null,
                    loading: false,
                    finished: false,
                    ...fileObj
                };
                let parentPath = this.findParentPath(item);
                item.dir = parentPath.path;
                return item;
            };
        },
        comparePath() {
            return (path1, path2) => {
                if (!path1 || !path2) return false;
                return path1.replace(/\\/g, '/') === path2.replace(/\\/g, '/');
            };
        },
        computeIcon() {
            return (item) => {
                if (item.isDir) return this.img.folder;
                let nameList = item.name.split('.');
                let ext = nameList[nameList.length - 1];
                if (ext === 'fbn') return this.img.note;
                if (ext === 'json') return this.img.json;
                if (ext === 'html') return this.img.html;
                if (ext === 'md') return this.img.markdown;
                return this.img.file;
            };
        },
        computeFileName() {
            return (path) => {
                let pathList = path.split(/[\\/]/);
                return pathList[pathList.length - 1];
            };
        },
        localPathFolderName() {
            if (this.isRemote) return this.currentDataPathItem.name;
            let pathList = this.value.split(/[\\/]/);
            return pathList[pathList.length - 1];
        },
        SourceDisabled() {
            return !this.currentDataPath;
        },
        uri() {
            if (this.currentDataPath) return this.currentDataPath;
            else return 'local';
        },
        Auto() {
            return this.isRemote ? this.$api : this.$local_api;
        }
    },
    mounted() {
        this.eventInit();
        this.refreshFolder();
        this.openNotebook();
    },
    methods: {
        // t() {
        //     this.$refs.tree.$forceUpdate();
        //     console.log(this.treeList);
        // },
        ...mapMutations({
            toggleEditor: 'toggleEditor'
        }),
        eventInit() {
            this.nw.on('watch-path-localTree', (e, { event, path, file }) => {
                // console.log(event, file);
                if (event === 'addDir' || event === 'add') {
                    let fileItem = this.computeTreeItem(file);
                    let parentPath = this.findParentPath(fileItem);
                    if (parentPath.isRoot) {
                        this.treeList.push(fileItem);
                        this.hotPushFLAT(fileItem);
                    } else {
                        let parentItem = this.FLAT.find((it) =>
                            this.comparePath(it.filePath, parentPath.path)
                        );
                        if (parentItem) {
                            let existsItem = parentItem.children.find((it) =>
                                this.comparePath(it.filePath, fileItem.filePath)
                            );
                            if (!existsItem) {
                                parentItem.children.push(fileItem);
                            }
                            this.hotPushFLAT(fileItem);
                        }
                    }
                } else if (event === 'unlinkDir' || event === 'unlink') {
                    let fileItem = this.FLAT.find((it) =>
                        this.comparePath(it.filePath, path)
                    );
                    if (fileItem) {
                        let parentPath = this.findParentPath(fileItem);
                        if (parentPath.isRoot) {
                            let treeIndex = this.treeList.findIndex((it) =>
                                this.comparePath(it.filePath, fileItem.filePath)
                            );
                            let flatIndex = this.FLAT.findIndex((it) =>
                                this.comparePath(it.filePath, fileItem.filePath)
                            );
                            if (treeIndex > -1)
                                this.treeList.splice(treeIndex, 1);
                            if (flatIndex > -1) this.FLAT.splice(flatIndex, 1);
                        } else {
                            let parentItem = this.FLAT.find((it) =>
                                this.comparePath(it.filePath, parentPath.path)
                            );
                            if (parentItem) {
                                let index = parentItem.children.findIndex(
                                    (it) =>
                                        this.comparePath(
                                            it.filePath,
                                            fileItem.filePath
                                        )
                                );
                                let flatIndex = this.FLAT.findIndex((it) =>
                                    this.comparePath(
                                        it.filePath,
                                        fileItem.filePath
                                    )
                                );
                                if (index > -1)
                                    parentItem.children.splice(index, 1);
                                if (flatIndex > -1)
                                    this.FLAT.splice(flatIndex, 1);
                            }
                        }
                    }
                } else if (event && event.startsWith('lock')) {
                    let lockItem = event.split('-')[1];
                    this.lock[lockItem] = false;
                } else if (event && event.startsWith('unlock')) {
                    let lockItem = event.split('-')[1];
                    this.lock[lockItem] = true;
                }

                this.nw.on('open-notebook', async (event, argv) => {
                    console.log(argv);
                    let id = this.$Guid();
                    let path = argv[argv.length - 1];
                    let url = `/notebook/${
                        this.isRemote ? 'remote/' : ''
                    }${encodeURI(path.replace(/\//g, '\\'))}`;
                    this.Auto.NotebookController.existsPath(id, path)
                        .then((res) => {
                            if (res.code === 200) {
                                if (res.data)
                                    setTimeout(() => {
                                        if (this.$route.path === url) return;
                                        this.toggleEditor(false);
                                        this.Go(url);
                                    }, 300);
                            }
                        })
                        .catch((res) => {
                            console.error(res);
                            this.$barWarning(res, {
                                status: 'error'
                            });
                        });
                });
                this.forceUpdate();
            });

            window.addEventListener('click', this.whiteClickClearTmp);
        },
        async chooseFolder() {
            await this.$local_api.ConfigController.selectLocalDataSourcePath().then(
                (res) => {
                    if (res.code === 200) {
                        this.path = res.data;
                    }
                }
            );
        },
        refreshFolder() {
            this.treeList = [];
            this.FLAT = [];
            if (this.path) {
                // let computePath =
                //     this.path.replace(/\\/g, "/") +
                //     (this.watchAllExtensions ? "" : "/**/*.+(fbn|json|html)");
                this.nw.send('watch-path', {
                    id: 'localTree',
                    server: this.$server,
                    path: this.path,
                    target: null
                });
            }
        },
        hotPushFLAT(item) {
            let index = this.FLAT.findIndex((it) =>
                this.comparePath(it.filePath, item.filePath)
            );
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
        findParentPath(target) {
            let targetPath = target.filePath.replace(/\\/g, '/');
            let parentPath = targetPath.substring(
                0,
                targetPath.lastIndexOf('/')
            );
            return {
                path: parentPath,
                isRoot: parentPath === this.path.replace(/\\/g, '/')
            };
        },
        treeItemClick(item) {
            if (!item.filePath) return;
            if (!item.isDir) {
                let url = `/notebook/${
                    this.isRemote ? 'remote/' : ''
                }${encodeURI(item.filePath.replace(/\//g, '\\'))}`;
                if (this.$route.path !== url) {
                    if (this.unsave) {
                        this.$infoBox(
                            this.local(
                                `Are you sure to redirect without saved?`
                            ),
                            {
                                status: 'warning',
                                title: this.local('Confirm'),
                                confirmTitle: this.local('Confirm'),
                                cancelTitle: this.local('Cancel'),
                                theme: this.theme,
                                confirm: () => {
                                    this.Go(url);
                                },
                                cancel: () => {}
                            }
                        );
                    } else this.Go(url);
                }
                return;
            } else {
                this.nw.send('load-children', item);
            }
        },
        createFile(dir = null) {
            this.removeTmp();
            let tmpItem = {
                id: this.$Guid(),
                name: '.fbn',
                editable: true,
                loading: false,
                finished: false,
                filePath: null,
                dir: dir ? dir : this.path,
                isFile: true,
                isDir: false
            };
            if (!dir) {
                this.treeList.unshift(tmpItem);
            } else {
                let dirItem = this.FLAT.find((it) =>
                    this.comparePath(it.filePath, dir)
                );
                if (!dirItem) return;
                dirItem.expanded = true;
                dirItem.children.unshift(tmpItem);
            }
            this.FLAT.push(tmpItem);
            setTimeout(() => {
                let textbox = this.$refs[`t:${tmpItem.id}`];
                textbox.focus();
                let input = textbox.$el.querySelector('input');
                input.setSelectionRange(0, 0);
            }, 300);
        },
        createFolder(dir = null) {
            this.removeTmp();
            let tmpItem = {
                id: this.$Guid(),
                name: '',
                editable: true,
                children: [],
                loading: false,
                finished: false,
                filePath: null,
                dir: dir ? dir : this.path,
                isFile: false,
                isDir: true
            };
            if (!dir) {
                this.treeList.unshift(tmpItem);
            } else {
                let dirItem = this.FLAT.find((it) =>
                    this.comparePath(it.filePath, dir)
                );
                if (!dirItem) return;
                dirItem.expanded = true;
                dirItem.children.unshift(tmpItem);
            }
            this.FLAT.push(tmpItem);
            setTimeout(() => {
                let textbox = this.$refs[`t:${tmpItem.id}`];
                textbox.focus();
                let input = textbox.$el.querySelector('input');
                input.setSelectionRange(0, 0);
            }, 300);
        },
        nameJudge(target) {
            let pattern = /[<>:"/\\\\|\\?\\*]/;
            if (pattern.test(target.name)) return 'name';
            let dir = target.dir ? target.dir : this.path;
            dir = dir.replace(/\\/g, '/');
            if (target.filePath) {
                let matchItem = this.FLAT.find((it) => {
                    let filePath = it.filePath;
                    filePath = filePath ? filePath.replace(/\\/g, '/') : '';
                    return (
                        filePath === `${dir}/${target.name}` &&
                        it.id !== target.id
                    );
                });
                if (matchItem) return 'exists';
            } else {
                let matchItem = this.FLAT.find((it) => {
                    let filePath = it.filePath;
                    filePath = filePath ? filePath.replace(/\\/g, '/') : '';
                    return filePath === `${dir}/${target.name}`;
                });
                if (matchItem) return 'exists';
            }
            return false;
        },
        removeTmp() {
            for (let i = this.treeList.length - 1; i >= 0; i--) {
                if (this.treeList[i].filePath === null) {
                    this.treeList.splice(i, 1);
                }
            }
            for (let item of this.FLAT) {
                if (item.children) {
                    for (let i = item.children.length - 1; i >= 0; i--) {
                        if (item.children[i].filePath === null) {
                            item.children.splice(i, 1);
                        }
                    }
                }
            }
            for (let i = this.FLAT.length - 1; i >= 0; i--) {
                if (this.FLAT[i].filePath === null) {
                    this.FLAT.splice(i, 1);
                    i--;
                }
            }
            this.forceUpdate();
        },
        showRename(item) {
            item.editable = true;
            setTimeout(() => {
                let textbox = this.$refs[`t:${item.id}`];
                textbox.focus();
                let input = textbox.$el.querySelector('input');
                let dotIndex = input.value.lastIndexOf('.');
                if (dotIndex > -1) input.setSelectionRange(0, dotIndex);
                else document.execCommand('selectAll');
            }, 300);
        },
        rename(target) {
            let judge = this.nameJudge(target);
            if (judge === 'name') {
                this.$barWarning(
                    this.local('Name cannot contain special characters'),
                    {
                        status: 'warning'
                    }
                );
                return;
            } else if (judge === 'exists') {
                this.$barWarning(this.local('Name already exists'), {
                    status: 'warning'
                });
                return;
            }
            let item = this.FLAT.find((it) => it.id === target.id);
            item.name = target.name;
            item.editable = false;
            if (!item.filePath) {
                if (item.isDir) this.newFolderConfirm(item);
                else this.newFileConfirm(item);
            } else this.renameConfirm(item);
        },
        newFileConfirm(target) {
            let fbn = JSON.parse(JSON.stringify(fabulous_notebook));
            let url = target.dir.replace(/\\/g, '/') + `/${target.name}`;
            fbn.id = this.$Guid();
            fbn.title = '';
            fbn.content = {
                type: 'doc',
                content: []
            };
            fbn.createDate = new Date();
            fbn.updateDate = new Date();
            this.Auto.NotebookController.createDocument(
                this.uri,
                url,
                JSON.stringify(fbn)
            )
                .then((res) => {
                    if (res.code === 200) {
                        this.removeTmp();
                    } else
                        this.$barWarning(this.local(`Create File Failed`), {
                            status: 'warning'
                        });
                })
                .catch((res) => {
                    console.error(res);
                    this.$barWarning(this.local(`Create File Failed`), {
                        status: 'warning'
                    });
                });
        },
        newFolderConfirm(target) {
            let url = target.dir.replace(/\\/g, '/') + `/${target.name}`;
            console.log('create', this.Auto);
            this.Auto.NotebookController.createDirectory(this.uri, url)
                .then((res) => {
                    if (res.code === 200) {
                        this.removeTmp();
                    } else
                        this.$barWarning(this.local(`Create Folder Failed`), {
                            status: 'warning'
                        });
                })
                .catch((res) => {
                    console.error(res);
                    this.$barWarning(this.local(`Create Folder Failed`), {
                        status: 'warning'
                    });
                });
        },
        renameConfirm(target) {
            if (target.isDir)
                this.Auto.NotebookController.updateDirectoryInfo(
                    this.uri,
                    target.filePath,
                    {
                        name: target.name
                    }
                )
                    .then((res) => {
                        if (res.code !== 200) {
                            this.$barWarning(this.local(`Rename Failed`), {
                                status: 'warning'
                            });
                        }
                    })
                    .catch((res) => {
                        console.error(res);
                        this.$barWarning(this.local(`Rename Failed`), {
                            status: 'warning'
                        });
                    });
            else
                this.Auto.NotebookController.updateDocumentInfo(
                    this.uri,
                    target.filePath,
                    {
                        name: target.name
                    }
                )
                    .then((res) => {
                        if (res.code !== 200) {
                            this.$barWarning(this.local(`Rename Failed`), {
                                status: 'warning'
                            });
                        }
                    })
                    .catch((res) => {
                        console.error(res);
                        this.$barWarning(this.local(`Rename Failed`), {
                            status: 'warning'
                        });
                    });
        },
        deleteConfirm(target) {
            if (!target.filePath) return;
            if (target.isDir) {
                this.Auto.NotebookController.removeDirectory(
                    this.uri,
                    target.filePath
                )
                    .then((res) => {
                        if (res.code !== 200) {
                            console.error(res);
                            this.$barWarning(
                                this.local(`Remove Folder Failed`),
                                {
                                    status: 'warning'
                                }
                            );
                        }
                    })
                    .catch((res) => {
                        console.error(res);
                        this.$barWarning(this.local(`Remove Folder Failed`), {
                            status: 'warning'
                        });
                    });
            } else {
                this.Auto.NotebookController.removeDocument(
                    this.uri,
                    target.filePath
                )
                    .then((res) => {
                        if (res.code !== 200) {
                            console.error(res);
                            this.$barWarning(this.local(`Remove File Failed`), {
                                status: 'warning'
                            });
                        }
                    })
                    .catch((res) => {
                        console.error(res);
                        this.$barWarning(this.local(`Remove File Failed`), {
                            status: 'warning'
                        });
                    });
            }
        },
        copy(target) {
            this.copyList = [
                {
                    type: 'copy',
                    name: target.name,
                    path: target.filePath
                }
            ];
        },
        move(target) {
            this.copyList = [
                {
                    type: 'move',
                    name: target.name,
                    path: target.filePath
                }
            ];
        },
        paste(target) {
            if (!target.isDir) return;
            for (let item of this.copyList) {
                let itemPath = this.isRemote
                    ? this.computeFileName(item.path)
                    : item.name;
                if (item.type === 'copy') {
                    let targetItem = this.FLAT.find((it) =>
                        this.comparePath(it.filePath, target.filePath)
                    );
                    if (targetItem) targetItem.expanded = true; // 要先展开才能给它添加新的项.
                    this.Auto.NotebookController.copyDirectory(
                        this.uri,
                        item.path,
                        target.filePath.replace(/\\/g, '/') + `/${itemPath}`
                    )
                        .then((res) => {
                            if (res.code === 200) {
                                this.forceUpdate();
                            } else {
                                console.error(res);
                                this.$barWarning(
                                    this.local(`Copy File Failed`),
                                    {
                                        status: 'warning'
                                    }
                                );
                            }
                        })
                        .catch((res) => {
                            console.error(res);
                            this.$barWarning(this.local(`Copy File Failed`), {
                                status: 'warning'
                            });
                        });
                    this.copyList = [];
                } else if (item.type === 'move') {
                    let targetItem = this.FLAT.find((it) =>
                        this.comparePath(it.filePath, target.filePath)
                    );
                    if (targetItem) targetItem.expanded = true; // 要先展开才能给它添加新的项.
                    this.Auto.NotebookController.moveDirectory(
                        this.uri,
                        item.path,
                        target.filePath.replace(/\\/g, '/') + `/${itemPath}`
                    )
                        .then((res) => {
                            if (res.code === 200) {
                                this.forceUpdate();
                            } else {
                                console.error(res);
                                this.$barWarning(
                                    this.local(`Move File Failed`),
                                    {
                                        status: 'warning'
                                    }
                                );
                            }
                        })
                        .catch((res) => {
                            console.error(res);
                            this.$barWarning(this.local(`Move File Failed`), {
                                status: 'warning'
                            });
                        });
                    this.copyList = [];
                }
            }
        },
        rootPasteDisabled() {
            return this.copyList.length === 0;
        },
        rootPaste() {
            let target = {
                filePath: this.path
            };
            for (let item of this.copyList) {
                let itemPath = this.isRemote
                    ? this.computeFileName(item.path)
                    : item.name;
                if (item.type === 'copy') {
                    this.Auto.NotebookController.copyDirectory(
                        this.uri,
                        item.path,
                        target.filePath.replace(/\\/g, '/') + `/${itemPath}`
                    )
                        .then((res) => {
                            if (res.code === 200) {
                                let targetItem = this.FLAT.find((it) =>
                                    this.comparePath(
                                        it.filePath,
                                        target.filePath
                                    )
                                );
                                if (targetItem) targetItem.expanded = true;
                                this.forceUpdate();
                            } else {
                                console.error(res);
                                this.$barWarning(
                                    this.local(`Copy File Failed`),
                                    {
                                        status: 'warning'
                                    }
                                );
                            }
                        })
                        .catch((res) => {
                            console.error(res);
                            this.$barWarning(this.local(`Copy File Failed`), {
                                status: 'warning'
                            });
                        });
                    this.copyList = [];
                } else if (item.type === 'move') {
                    this.Auto.NotebookController.moveDirectory(
                        this.uri,
                        item.path,
                        target.filePath.replace(/\\/g, '/') + `/${itemPath}`
                    )
                        .then((res) => {
                            if (res.code === 200) {
                                let targetItem = this.FLAT.find((it) =>
                                    this.comparePath(
                                        it.filePath,
                                        target.filePath
                                    )
                                );
                                if (targetItem) targetItem.expanded = true;
                                this.forceUpdate();
                            } else {
                                console.error(res);
                                this.$barWarning(
                                    this.local(`Move File Failed`),
                                    {
                                        status: 'warning'
                                    }
                                );
                            }
                        })
                        .catch((res) => {
                            console.error(res);
                            this.$barWarning(this.local(`Move File Failed`), {
                                status: 'warning'
                            });
                        });
                    this.copyList = [];
                }
            }
        },
        collapseAll() {
            for (let item of this.FLAT) {
                if (item.isDir) item.expanded = false;
            }
            this.forceUpdate();
        },
        forceUpdate() {
            if (this.$refs.tree) this.$refs.tree.$forceUpdate();
        },
        rightClick($event, item) {
            $event.preventDefault();
            $event.stopPropagation();
            if (!item.filePath) return;
            this.rightMenuItem = item;
            this.$refs.rightMenu.rightClick($event, this.$el);
        },
        openFile(item) {
            let url = item.filePath;
            if (!item.isDir) url = this.findParentPath(item).path;
            this.Auto.NotebookController.openFile(this.uri, url);
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
                    classList.includes('lt-right-menu')
                ) {
                    _self = true;
                    break;
                }
                x = x.parentNode;
            }
            if (!_self) this.removeTmp();
        },
        async openNotebook() {
            let id = this.$Guid();
            if (this.isRemote) {
                console.log('open-remote');
                return;
            }
            this.$local_api.NotebookController.getLocalProcess().then((res) => {
                let process = res.data;
                if (process.argv.length >= 2) {
                    let path = process.argv[1];
                    if (path === 'dist_electron') return;
                    let url = `/notebook/${
                        this.isRemote ? 'remote/' : ''
                    }${encodeURI(path.replace(/\//g, '\\'))}`;
                    this.Auto.NotebookController.existsPath(id, url)
                        .then((res) => {
                            if (res.code === 200) {
                                if (res.data)
                                    setTimeout(() => {
                                        this.toggleEditor(false);
                                        this.Go(url);
                                    }, 300);
                            }
                        })
                        .catch((res) => {
                            console.error(res);
                            this.$barWarning(res, {
                                status: 'error'
                            });
                        });
                }
            });
        }
    },
    beforeDestroy() {
        window.removeEventListener('click', this.whiteClickClearTmp);
        if (this.isRemote) this.nw.destroy();
    }
};
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