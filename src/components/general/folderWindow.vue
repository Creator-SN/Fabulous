<template>
    <float-window-base
        v-model="thisValue"
        :title="title"
        :theme="theme"
    >
        <template v-slot:content>
            <div class="tree-view-window">
                <fv-TreeView
                    v-model="treeList"
                    :checkable="true"
                    :theme="theme"
                    :item-height="35"
                    expand-click-mode="normal"
                    expandedIconPosition="right"
                    background="transparent"
                    ref="tree"
                    style="width: 100%; height: 100%; box-sizing: border-box;"
                    @click="treeItemClick"
                >
                    <template v-slot:default="x">
                        <div class="tree-view-custom-item">
                            <p>{{x.item.emoji}}</p>
                            <p class="tree-view-custom-label">{{x.item.name}}</p>
                        </div>
                    </template>
                </fv-TreeView>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(0, 98, 158, 1)"
                @click="confirm"
            >{{local('Confirm')}}</fv-button>
            <fv-button
                :theme="theme"
                style="margin-left: 5px;"
                @click="thisValue = false"
            >{{local('Cancel')}}</fv-button>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from "../window/floatWindowBase.vue";
import { mapState, mapGetters } from "vuex";

export default {
    components: {
        floatWindowBase,
    },
    props: {
        value: {
            default: false,
        },
        title: {
            default: "Folder",
        },
    },
    data() {
        return {
            thisValue: this.value,
            treeList: [],
            FLAT: []
        };
    },
    watch: {
        value(val) {
            this.thisValue = val;
        },
        thisValue(val) {
            if (val) this.refreshTreeList();
            this.$emit("input", val);
        },
    },
    computed: {
        ...mapState({
            data_index: (state) => state.config.data_index,
            data_path: (state) => state.config.data_path,
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(['local', 'currentDataPath'])
    },
    mounted() {
        this.refreshTreeList();
    },
    methods: {
        async refreshTreeList() {
            if (!this.currentDataPath) return;
            this.treeList = [];
            this.FLAT = [];
            let result = [];
            let groups = await this.$auto.AcademicController.getRootGroups(
                this.currentDataPath
            );
            let partitions = await this.$auto.AcademicController.getRootPartitions(
                this.currentDataPath
            );
            groups = groups.data;
            partitions = partitions.data;
            groups.forEach((el) => {
                result.push(this.itemFormat(el));
            });
            partitions.forEach((el) => {
                result.push(this.itemFormat(el, "partition"));
            });
            let arr = [].concat(result);
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].children) arr = arr.concat(arr[i].children);
                this.hotPushFLAT(arr[i]);
            }
            this.treeList = result;
        },
        itemFormat(item, type = "group") {
            let obj = {
                ...item,
                editable: false,
                children:
                    type === "group"
                        ? item.children
                            ? item.children
                            : []
                        : null,
                loading: false,
                finished: false,
                selected: false,
                type,
            };
            return obj;
        },
        listFormat(arr, type = "group") {
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
                    let skipKey = ["children", "expanded"];
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
                            status: "warning",
                        });
                    }
                })
                .catch((e) => {
                    this.$barWarning(e, {
                        status: "error",
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
                            "partition"
                        );
                        for (let child of formatChildren) {
                            child.parent = item.id;
                            this.hotPushFLAT(child);
                        }
                        partitionList = formatChildren;
                    } else {
                        this.$barWarning(res.message, {
                            status: "warning",
                        });
                    }
                })
                .catch((e) => {
                    this.$barWarning(e, {
                        status: "error",
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
                        let skipKey = ["children", "expanded"];
                        if (!skipKey.includes(key)) {
                            oriItem[key] = item[key];
                        }
                    }
                }
            });
        },
        treeItemClick(item) {
            if (item.loading) return;
            item = this.FLAT.find((it) => it.id === item.id);
            if (item.type === "group") {
                if (!item.finished) this.loadChildren(item);
            }
        },
        getSelected() {
            let result = [];
            for (let i = this.treeList.length - 1; i >= 0; i--) {
                if (this.treeList[i].selected) {
                    result.push(this.treeList[i]);
                }
            }
            for (let item of this.FLAT) {
                if (item.children) {
                    for (let i = item.children.length - 1; i >= 0; i--) {
                        if (item.children[i].selected) {
                            result.push(item.children[i]);
                        }
                    }
                }
            }
            return result;
        },
        confirm() {
            let result = this.getSelected();
            this.$emit("choose-all", result);
            this.$emit(
                "choose-groups",
                result.filter((it) => it.type === "group")
            );
            this.$emit(
                "choose-partitions",
                result.filter((it) => it.type === "partition")
            );
            this.thisValue = false;
        },
    },
};
</script>

<style lang="scss">
.tree-view-window {
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    max-height: 100%;
    overflow: auto;

    .tree-view-custom-item {
        position: relative;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        user-select: none;

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
}
</style>