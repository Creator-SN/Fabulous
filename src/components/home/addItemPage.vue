<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Add Page')"
        :theme="theme"
    >
        <template v-slot:content>
            <div class="p-col">
                <p class="w-title">{{local('Page Name')}}</p>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('Input page name...')"
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
            <div class="p-col full">
                <p class="w-title">{{local('From Template')}}</p>
                <div style="width: 100%; height: 300px; flex: 1; overflow: auto;">
                    <template-grid
                        :value="templates"
                        @choose-items="currentChoosen = $event"
                    >
                    </template-grid>
                </div>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(0, 98, 158, 1)"
                :disabled="name === '' || !ds_db || currentChoosen.length > 1"
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
import templateGrid from "@/components/templates/templateGrid.vue";
import { page } from "@/js/data_sample.js";
import { mapMutations, mapState, mapGetters } from "vuex";
const { ipcRenderer: ipc } = require("electron");
const path = require("path");

export default {
    components: {
        floatWindowBase,
        templateGrid,
    },
    props: {
        show: {
            default: false,
        },
        item: {
            default: null,
        },
    },
    data() {
        return {
            thisShow: this.show,
            name: "",
            currentChoosen: [],
        };
    },
    watch: {
        show(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit("update:show", val);
            this.name = "";
        },
    },
    computed: {
        ...mapState({
            data_index: (state) => state.config.data_index,
            data_path: (state) => state.config.data_path,
            templates: (state) => state.data_structure.templates,
            items: (state) => state.data_structure.items,
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        v() {
            return this;
        },
    },
    mounted() {
        this.eventInit();
    },
    methods: {
        ...mapMutations({
            reviseData: "reviseData",
            reviseEditor: "reviseEditor",
            toggleEditor: "toggleEditor",
        }),
        eventInit() {
            ipc.on("output-file-addItemPage", () => {
                this.thisShow = false;
            });
        },
        async add() {
            if (
                !this.ds_db ||
                !this.item ||
                this.name === "" ||
                this.currentChoosen.length > 1
            )
                return;
            let _page = JSON.parse(JSON.stringify(page));
            _page.id = this.$Guid();
            _page.name = this.name;
            _page.emoji = "????";
            _page.createDate = this.$SDate.DateToString(new Date());
            let item = this.items.find((it) => it.id === this.item.id);
            item.pages.push(_page);
            this.item.pages = item.pages;
            this.reviseData({
                items: this.items,
            });
            let url = path.join(
                this.data_path[this.data_index],
                "root/items",
                `${item.id}`,
                `${_page.id}.json`
            );
            let templateContent =
                this.currentChoosen.length == 1
                    ? JSON.stringify(this.currentChoosen[0].content)
                    : "";
            ipc.send("output-file", {
                id: "addItemPage",
                path: url,
                data: templateContent,
            });
        },
        openEditor(template) {
            this.reviseEditor({
                type: "template",
                target: template,
            });
            this.toggleEditor(true);
        },
    },
};
</script>

<style lang="scss">
</style>