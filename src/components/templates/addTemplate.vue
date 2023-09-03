<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Add Template')"
        :theme="theme"
    >
        <template v-slot:content>
            <div class="w-p-block">
                <p class="w-title">{{local('Template Name')}}</p>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('Input template name...')"
                    :theme="theme"
                    :font-size="18"
                    :font-weight="'bold'"
                    underline
                    :border-color="'rgba(123, 139, 209, 0.3)'"
                    :focus-border-color="'rgba(123, 139, 209, 1)'"
                    :border-width="2"
                    :is-box-shadow="true"
                    style="width: 100%; height: 60px; margin-top: 15px;"
                    @keyup.enter="add"
                ></fv-text-box>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(0, 98, 158, 1)"
                :disabled="name === ''"
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
import { page } from "@/js/data_sample.js";
import { mapState, mapGetters } from "vuex";

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
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(['local', 'currentDataPath']),
    },
    mounted() {},
    methods: {
        async add() {
            if (this.name === "") return;
            let _page = JSON.parse(JSON.stringify(page));
            _page.id = this.$Guid();
            _page.name = this.name;
            _page.emoji = "📑";
            _page.createDate = this.$SDate.DateToString(new Date());
            let res = await this.$auto.AcademicController.createTemplate(
                this.currentDataPath,
                _page
            );
            if (res.status === "success") {
                this.thisShow = false;
                this.$emit("finished");
            } else {
                this.$barWarning(res.message, {
                    status: "error",
                });
            }
        },
    },
};
</script>

<style lang="scss">
</style>