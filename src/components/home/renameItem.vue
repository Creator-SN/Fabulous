<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Rename Item')"
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
                    :border-color="'rgba(123, 139, 209, 0.3)'"
                    :focus-border-color="'rgba(123, 139, 209, 1)'"
                    :border-width="2"
                    :is-box-shadow="true"
                    style="width: 100%; height: 60px; margin-top: 15px;"
                    @keyup.enter="confirm"
                ></fv-text-box>
            </div>
            <div class="w-p-block">
                <p class="w-title">{{local('Item Labels')}}</p>
            </div>
            <div
                v-show="labels.length > 0"
                class="w-p-block"
                style="height: 120px; padding: 0px; overflow-x: auto;"
            >
                <fv-tag
                    v-model="labels"
                    :theme="theme"
                    :isDel="true"
                ></fv-tag>
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
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(0, 98, 158, 1)"
                :disabled="!value || name === ''"
                @click="confirm"
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
import { mapState, mapGetters } from "vuex";

export default {
    components: {
        floatWindowBase,
    },
    props: {
        value: {
            default: null,
        },
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
            if (this.value.name) this.name = this.value.name;
            else this.name = "";
            if (this.value.labels)
                this.labels = JSON.parse(JSON.stringify(this.value.labels));
            else this.labels = [];
        },
    },
    computed: {
        ...mapState({
            data_index: (state) => state.config.data_index,
            data_path: (state) => state.config.data_path,
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(['local', 'currentDataPath']),
    },
    methods: {
        async confirm() {
            if (!this.value || this.name === "") return;
            this.value.name = this.name;
            this.value.labels = this.labels;
            let res = await this.$auto.AcademicController.updateItem(
                this.currentDataPath,
                this.value
            );
            if (res.code !== 200) {
                this.$barWarning(res.message, {
                    status: "error",
                });
                return;
            }
            this.$emit("finished");
            this.thisShow = false;
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