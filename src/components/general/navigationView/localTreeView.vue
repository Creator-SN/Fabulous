<template>
    <div class="local-tree-view-container">
        <fv-TreeView
            v-show="treeList.length > 0"
            v-model="treeList"
            :theme="theme"
            ref="tree"
            :background="theme == 'dark' ? 'rgba(7, 7, 7, 0)' : 'rgba(245, 245, 245, 0)'"
            :view-style="{backgroundColor: theme == 'dark' ? 'rgba(7, 7, 7, 0)' : 'rgba(245, 245, 245, 0)', backgroundColorHover: theme == 'dark' ? 'rgba(200, 200, 200, 0.3)' : 'rgba(245, 245, 245, 0.3)'}"
            style="width: 100%; height: 100%;"
            @click="treeItemClick"
        >
            <template v-slot:default="x">
                <div
                    class="tree-view-custom-item"
                    @contextmenu="rightClick($event, x.item)"
                >
                    <div class="tree-view-item-left-block">
                        <img
                            v-if="x.item.loading == false"
                            draggable="false"
                            class="icon-img"
                            :src="x.item.isDir ? img.folder : img.note"
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
                    >
                        <i class="ms-Icon ms-Icon--More more-menu-btn"></i>
                    </div>
                </div>
            </template>
        </fv-TreeView>
        <div
            v-show="treeList.length === 0"
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
                <span @click="openFile(`${rightMenuItem.filePath}`)">
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
import rightMenu from "@/components/general/rightMenu.vue";

import { fabulous_notebook } from "@/js/data_sample.js";

const { ipcRenderer: ipc } = require("electron");
const { dialog } = require("@electron/remote");

import folderImg from "@/assets/nav/folder.svg";
import noteImg from "@/assets/nav/note.svg";

export default {
    components: { rightMenu },
    props: {
        value: {
            default: "",
        },
        local: {
            default: () => {
                return {};
            },
        },
        rightMenuWidth: {
            default: 200,
        },
        theme: {
            default: "light",
        },
    },
    watch: {
        value(val) {
            this.path = val;
        },
        path(val) {
            this.$emit("input", val);
            if (!val) return;
            this.treeList = [];
            this.FLAT = [];
            if (val) {
                ipc.send("list-dir", { dir: val, target: null });
            }
        },
    },
    data() {
        return {
            path: "",
            treeList: [],
            img: {
                folder: folderImg,
                note: noteImg,
            },
            FLAT: [],
            posX: 0,
            posY: 0,
            rightMenuItem: {},
            rightMenuHeight: 0,
            show: {
                rightMenu: false,
            },
        };
    },
    computed: {
        computeTreeList() {
            return (fileList, dir = null) => {
                let treeList = [];
                fileList.forEach((file) => {
                    let item = {
                        id: this.$Guid(),
                        name: file.name,
                        editable: false,
                        children: file.isDir ? [] : null,
                        dir: dir ? dir : this.path,
                        loading: false,
                        finished: false,
                        ...file,
                    };
                    let index = this.FLAT.findIndex(
                        (it) => it.filePath === item.filePath
                    );
                    if (index > -1) {
                        let oriItem = this.FLAT[index];
                        for (let key in oriItem) {
                            let skipKey = ["children", "expanded"];
                            if (!skipKey.includes(key)) {
                                oriItem[key] = item[key];
                            }
                        }
                        treeList.push(oriItem);
                    } else {
                        this.FLAT.push(item);
                        treeList.push(item);
                    }
                });
                return treeList;
            };
        },
    },
    mounted() {
        this.eventInit();
    },
    methods: {
        // t() {
        //     this.$refs.tree.$forceUpdate();
        //     console.log(this.treeList);
        // },
        eventInit() {
            ipc.on("list-dir-callback", (event, { status, files, target }) => {
                if (status) {
                    console.error(status);
                    return;
                }
                if (!target) this.treeList = this.computeTreeList(files);
                else this.expandItem(target, files);
            });

            let refreshDir = (target) => {
                let dirItem = this.FLAT.find(
                    (it) => it.filePath === target.dir
                );
                if (dirItem) {
                    dirItem.finished = false;
                    ipc.send("list-dir", {
                        dir: dirItem.filePath,
                        target: dirItem,
                    });
                } else ipc.send("list-dir", { dir: this.path, target: null });
            };

            ipc.on(
                "output-file-localTree",
                (event, { status, target, message }) => {
                    if (status !== 200) {
                        console.error(message);
                        this.$barWarning(this.local(`Create File Failed`), {
                            status: "warning",
                        });
                        return;
                    }
                    refreshDir(target);
                }
            );
            ipc.on(
                "ensure-folder-localTree",
                (event, { status, target, message }) => {
                    if (!target) return;
                    if (status !== 200) {
                        console.error(message);
                        this.$barWarning(this.local(`Create Folder Failed`), {
                            status: "warning",
                        });
                        return;
                    }
                    refreshDir(target);
                }
            );
            ipc.on(
                "remove-file-localTree",
                (event, { status, target, message }) => {
                    if (!target) return;
                    if (status !== 200) {
                        console.error(message);
                        this.$barWarning(this.local(`Remove File Failed`), {
                            status: "warning",
                        });
                        return;
                    }
                    refreshDir(target);
                }
            );
            ipc.on(
                "remove-folder-localTree",
                (event, { status, target, message }) => {
                    if (!target) return;
                    if (status !== 200) {
                        console.error(message);
                        this.$barWarning(this.local(`Remove Folder Failed`), {
                            status: "warning",
                        });
                        return;
                    }
                    refreshDir(target);
                }
            );
            ipc.on("rename-localTree", (event, { status, target, message }) => {
                if (!target) return;
                if (status !== 200) {
                    console.error(message);
                    this.$barWarning(this.local(`Rename Failed`), {
                        status: "warning",
                    });
                    return;
                }
                let targetItem = this.FLAT.find(
                    (it) => it.filePath === target.filePath
                );
                targetItem.filePath =
                    targetItem.dir.replace(/\\/g, "/") + `/${targetItem.name}`;
                this.refreshAllExpandedDir();
            });
        },
        async chooseFolder() {
            let path = (
                await dialog.showOpenDialog({
                    properties: ["openDirectory"],
                })
            ).filePaths[0];
            if (!path) return;
            this.path = path;
        },
        async expandItem(target, files) {
            let item = this.FLAT.find((it) => it.filePath === target.filePath);
            if (!item.isDir) return;
            if (item.finished) return;
            item.loading = true;
            item.children = this.computeTreeList(files, target.filePath);
            item.finished = true;
            item.loading = false;
            this.$refs.tree.$forceUpdate();
        },
        treeItemClick(item) {
            if (!item.filePath) return;
            if (!item.isDir) {
                let url = `/notebook/${encodeURI(item.filePath)}`;
                if (this.$route.path !== url) this.$Go(url);
                return;
            }
            if (item.finished) return;
            ipc.send("list-dir", { dir: item.filePath, target: item });
        },
        createFile(dir = null) {
            this.removeTmp();
            let tmpItem = {
                id: this.$Guid(),
                name: ".fbn",
                editable: true,
                loading: false,
                finished: false,
                filePath: null,
                dir: dir ? dir : this.path,
                isFile: true,
                isDir: false,
            };
            if (!dir) {
                this.treeList.unshift(tmpItem);
            } else {
                let dirItem = this.FLAT.find((it) => it.filePath === dir);
                if (!dirItem) return;
                this.treeItemClick(dirItem);
                dirItem.expanded = true;
                dirItem.children.unshift(tmpItem);
            }
            this.FLAT.push(tmpItem);
            setTimeout(() => {
                let textbox = this.$refs[`t:${tmpItem.id}`];
                textbox.focus();
                let input = textbox.$el.querySelector("input");
                input.setSelectionRange(0, 0);
            }, 300);
        },
        createFolder(dir = null) {
            this.removeTmp();
            let tmpItem = {
                id: this.$Guid(),
                name: "",
                editable: true,
                children: [],
                loading: false,
                finished: false,
                filePath: null,
                dir: dir ? dir : this.path,
                isFile: false,
                isDir: true,
            };
            if (!dir) {
                this.treeList.unshift(tmpItem);
            } else {
                let dirItem = this.FLAT.find((it) => it.filePath === dir);
                if (!dirItem) return;
                this.treeItemClick(dirItem);
                dirItem.expanded = true;
                dirItem.children.unshift(tmpItem);
            }
            this.FLAT.push(tmpItem);
            setTimeout(() => {
                let textbox = this.$refs[`t:${tmpItem.id}`];
                textbox.focus();
                let input = textbox.$el.querySelector("input");
                input.setSelectionRange(0, 0);
            }, 300);
        },
        nameJudge(target) {
            let pattern = /[<>:"/\\\\|\\?\\*]/;
            if (pattern.test(target.name)) return "name";
            let dir = target.dir ? target.dir : this.path;
            dir = dir.replace(/\\/g, "/");
            if (target.filePath) {
                let matchItem = this.FLAT.find((it) => {
                    let filePath = it.filePath;
                    filePath = filePath ? filePath.replace(/\\/g, "/") : "";
                    return (
                        filePath === `${dir}/${target.name}` &&
                        it.id !== target.id
                    );
                });
                if (matchItem) return "exists";
            } else {
                let matchItem = this.FLAT.find((it) => {
                    let filePath = it.filePath;
                    filePath = filePath ? filePath.replace(/\\/g, "/") : "";
                    return filePath === `${dir}/${target.name}`;
                });
                if (matchItem) return "exists";
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
            this.$refs.tree.$forceUpdate();
        },
        showRename(item) {
            item.editable = true;
            setTimeout(() => {
                let textbox = this.$refs[`t:${item.id}`];
                textbox.focus();
                let input = textbox.$el.querySelector("input");
                let dotIndex = input.value.lastIndexOf(".");
                if (dotIndex > -1) input.setSelectionRange(0, dotIndex);
                else document.execCommand("selectAll");
            }, 300);
        },
        rename(target) {
            let judge = this.nameJudge(target);
            if (judge === "name") {
                this.$barWarning(
                    this.local("Name cannot contain special characters"),
                    {
                        status: "warning",
                    }
                );
                return;
            } else if (judge === "exists") {
                this.$barWarning(this.local("Name already exists"), {
                    status: "warning",
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
            let url = target.dir.replace(/\\/g, "/") + `/${target.name}`;
            fbn.id = this.$Guid();
            fbn.title = target.name;
            fbn.content = {
                type: "doc",
                content: [],
            };
            fbn.createDate = new Date();
            fbn.updateDate = new Date();
            ipc.send("output-file", {
                id: "localTree",
                path: url,
                data: JSON.stringify(fbn),
                target,
            });
        },
        newFolderConfirm(target) {
            let url = target.dir.replace(/\\/g, "/") + `/${target.name}`;
            ipc.send("ensure-folder", {
                id: "localTree",
                dir: url,
                target,
            });
        },
        renameConfirm(target) {
            ipc.send("rename", {
                id: "localTree",
                path: target.filePath,
                newPath: target.dir.replace(/\\/g, "/") + `/${target.name}`,
                target,
            });
        },
        deleteConfirm(target) {
            if (!target.filePath) return;
            let flatIndex = this.FLAT.findIndex(
                (it) => it.filePath === target.filePath
            );
            this.FLAT.splice(flatIndex, 1);
            if (target.isDir) {
                let itemsDelete = [target];
                for (let i = 0; i < itemsDelete.length; i++) {
                    if (itemsDelete[i].children)
                        itemsDelete = itemsDelete.concat(
                            itemsDelete[i].children
                        );
                    let flatIndex = this.FLAT.findIndex(
                        (it) => it.filePath === itemsDelete[i].filePath
                    );
                    this.FLAT.splice(flatIndex, 1);
                }
                ipc.send("remove-folder", {
                    id: "localTree",
                    path: target.filePath,
                    target,
                });
                return;
            }
            ipc.send("remove-file", {
                id: "localTree",
                path: target.filePath,
                target,
            });
        },
        refreshAllExpandedDir() {
            for (let i = 0; i < this.FLAT.length; i++) {
                if (this.FLAT[i].isDir && this.FLAT[i].expanded)
                    ipc.send("list-dir", {
                        dir: this.FLAT[i].filePath,
                        target: this.FLAT[i],
                    });
            }
        },
        rightClick(event, item) {
            event.preventDefault();
            if (!item.filePath) return;
            this.show.rightMenu = true;
            let bounding = this.$el.getBoundingClientRect();
            let targetPos = {};
            targetPos.x = event.x;
            targetPos.y = event.y;
            if (targetPos.x < bounding.left) targetPos.x = bounding.left;
            if (targetPos.x + this.rightMenuWidth > bounding.right)
                targetPos.x = bounding.right - this.rightMenuWidth;
            if (targetPos.y < bounding.top) targetPos.y = bounding.top;
            if (targetPos.y + this.rightMenuHeight > bounding.bottom)
                targetPos.y = bounding.bottom - this.rightMenuHeight;
            this.posX = targetPos.x;
            this.posY = targetPos.y;

            this.rightMenuItem = item;
        },
        openFile(url) {
            ipc.send("open-file", {
                id: "local",
                path: url,
            });
        },
    },
};
</script>

<style lang="scss">
.local-tree-view-container {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 1;
    overflow: auto;
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

        .tree-view-item-left-block {
            @include Vcenter;

            flex: 1;

            .tree-view-custom-label {
                margin-left: 5px;
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