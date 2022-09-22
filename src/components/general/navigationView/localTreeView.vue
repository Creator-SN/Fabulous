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
                <div class="tree-view-custom-item">
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
                    <div class="tree-view-item-right-block">
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
                style="width: 180px;"
                @click="chooseFolder"
            >{{local('Open Folder')}}</fv-button>
        </div>
    </div>
</template>

<script>
const { ipcRenderer: ipc } = require("electron");
const { dialog } = require("electron").remote;

import folderImg from "@/assets/nav/folder.svg";
import noteImg from "@/assets/nav/note.svg";

export default {
    props: {
        value: {
            default: "",
        },
        local: {
            default: () => {
                return {};
            },
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
                    treeList.push(item);
                    let index = this.FLAT.findIndex(
                        (it) => it.filePath === item.filePath
                    );
                    if (index > -1) {
                        let oriItem = this.FLAT[index];
                        for (let key in oriItem) {
                            if (key !== "children") {
                                item[key] = oriItem[key];
                            }
                        }
                    } else {
                        this.FLAT.push(item);
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
        eventInit() {
            ipc.on("list-dir-callback", (event, { status, files, target }) => {
                if (status) {
                    console.error(status);
                    return;
                }
                if (!target) this.treeList = this.computeTreeList(files);
                else this.expandItem(target, files);
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
                this.$Go(`/notebook/${encodeURI(item.filePath)}`);
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
            this.treeList.push(tmpItem);
            this.FLAT.push(tmpItem);
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
            this.treeList.push(tmpItem);
            this.FLAT.push(tmpItem);
        },
        nameJudge(name, dir = null) {
            let pattern = /[<>:"/\\\\|\\?\\*]/;
            if (pattern.test(name)) return "name";
            dir = dir ? dir : this.path;
            dir = dir.replace(/\\/g, "/");
            let matchItem = this.FLAT.find((it) =>
                it.filePath
                    ? it.filePath.replace(/\\/g, "/") === `${dir}/${name}`
                    : false
            );
            if (matchItem) return "exists";
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
        rename(target) {
            let judge = this.nameJudge(target.name, target.dir);
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