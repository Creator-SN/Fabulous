<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Add Item')"
        :theme="theme"
    >
        <template v-slot:content>
            <div class="w-p-block">
                <p class="w-title">{{local('Item Name')}}</p>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('Input item name...')"
                    :theme="theme"
                    :font-size="18"
                    :font-weight="'bold'"
                    underline
                    :focus-border-color="'rgba(123, 139, 209, 1)'"
                    :is-box-shadow="true"
                    style="width: 100%; height: 60px; margin-top: 15px;"
                    @keyup.enter="add"
                ></fv-text-box>
            </div>
            <div class="w-p-block">
                <p class="w-title">{{local('Item Labels')}}</p>
            </div>
            <div
                class="label-text-box-block"
                style="line-height: 2;"
            >
                <div
                    v-for="(item, index) in colorList"
                    class="label-text-item"
                    :key="index"
                >
                    <p
                        class="label-text-item-sample"
                        :style="{background: item.color}"
                    ></p>
                    <fv-text-box
                        v-model="item.content"
                        :placeholder="local('New item label (Press Enter)')"
                        icon="Tag"
                        :theme="theme"
                        :border-color="item.color"
                        :focus-border-color="item.color"
                        :is-box-shadow="true"
                        style="margin: 5px 0px;"
                        @keyup.enter="addLabel(item)"
                    ></fv-text-box>
                </div>
            </div>
            <div
                class="w-p-block"
                style="height: 130px; overflow-x: auto;"
            >
                <fv-tag
                    v-model="labels"
                    :theme="theme"
                    :isDel="true"
                ></fv-tag>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(0, 98, 158, 1)"
                :disabled="name === '' || !ds_db"
                @click="add"
            >{{local('Confirm')}}</fv-button>
            <fv-button
                :theme="theme"
                style="margin-left: 5px;"
                @click="thisShow = false"
            >{{local('Cancel')}}</fv-button>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from "../window/floatWindowBase.vue";
import { item } from "@/js/data_sample.js";
import { mapMutations, mapState, mapGetters } from "vuex";
const { ipcRenderer: ipc } = require("electron");
const path = require("path");

export default {
    components: {
        floatWindowBase,
    },
    props: {
        show: {
            default: false,
        },
    },
    data() {
        return {
            thisShow: this.show,
            name: "",
            labels: [],
            colorList: [
                { name: "purple", color: "#958DF1", check: false, content: "" },
                { name: "red", color: "#F98181", check: false, content: "" },
                { name: "orange", color: "#FBBC88", check: false, content: "" },
                { name: "yellow", color: "#ffd747", check: false, content: "" },
                { name: "blue", color: "#70CFF8", check: false, content: "" },
                { name: "teal", color: "#53deae", check: false, content: "" },
                { name: "green", color: "#ace887", check: false, content: "" },
                { name: "red", color: "#ffa8a8", check: false, content: "" },
                { name: "orange", color: "#ffc078", check: false, content: "" },
                { name: "green", color: "#8ce99a", check: false, content: "" },
                { name: "blue", color: "#74c0fc", check: false, content: "" },
                { name: "pink", color: "#e28deb", check: false, content: "" },
            ],
        };
    },
    watch: {
        show(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit("update:show", val);
            this.name = "";
            this.labels = [];
        },
    },
    computed: {
        ...mapState({
            data_index: (state) => state.config.data_index,
            data_path: (state) => state.config.data_path,
            items: (state) => state.data_structure.items,
            groups: (state) => state.data_structure.groups,
            partitions: (state) => state.data_structure.partitions,
            c: (state) => state.pdfImporter.c,
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        v() {
            return this;
        },
    },
    methods: {
        ...mapMutations({
            reviseData: "reviseData",
            revisePdfImporter: "revisePdfImporter",
        }),
        async add() {
            if (!this.ds_db || this.name === "") return;
            let _item = JSON.parse(JSON.stringify(item));
            _item.id = this.$Guid();
            _item.name = this.name;
            _item.emoji = "📦";
            _item.labels = this.labels;
            _item.createDate = this.$SDate.DateToString(new Date());
            this.items.push(_item);
            this.reviseData({
                items: this.items,
            });
            this.copyToPartition(_item);
            this.revisePdfImporter({
                c: this.c + 1,
            });
            let url = path.join(
                this.data_path[this.data_index],
                `root/items/${_item.id}`
            );
            ipc.send("ensure-folder", url);
            await new Promise((resolve) => {
                ipc.on("ensure-folder-callback", () => {
                    resolve(1);
                });
            });
            this.thisShow = false;
        },
        copyToPartition(item) {
            let id = this.$route.params.id;
            if (id === undefined) return;
            let t = [].concat(this.groups);
            let partitions = [];
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].partitions)
                    partitions = partitions.concat(t[i].partitions);
            }
            partitions = partitions.concat(this.partitions);
            for (let i = 0; i < partitions.length; i++) {
                if (partitions[i].id === id) {
                    partitions[i].items.push(item.id);
                }
            }
            this.reviseData({
                groups: this.groups,
                partitions: this.partitions,
            });
        },
        addLabel(item) {
            if (item.content === "") return;
            this.labels.push({
                text: item.content,
                background: item.color,
            });
            item.content = "";
            this.$set(this.colorList, this.colorList.indexOf(item), item);
        },
        chooseColor(index) {
            this.colorList.forEach((el, idx) => {
                if (index !== idx) {
                    el.check = false;
                    el.content = "";
                    this.$set(this.colorList, idx, el);
                }
            });
        },
    },
};
</script>

<style lang="scss">
.label-text-box-block {
    width: 100%;
    height: 500px;
    overflow: auto;

    .label-text-item {
        @include Vcenter;

        flex: 1;

        .label-text-item-sample {
            width: 25px;
            height: 25px;
            margin-right: 20px;
            border-radius: 50%;
        }
    }
}
</style>