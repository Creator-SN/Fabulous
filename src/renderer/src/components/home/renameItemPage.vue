<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Rename Page')"
        :theme="theme"
    >
        <template v-slot:content>
            <div class="w-p-block">
                <p class="w-title">{{local('Page Name')}}</p>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('Input page name...')"
                    :theme="theme"
                    :font-size="13"
                    :font-weight="'bold'"
                    underline
                    :border-color="'rgba(123, 139, 209, 0.3)'"
                    :focus-border-color="'rgba(123, 139, 209, 1)'"
                    :border-width="2"
                    :is-box-shadow="true"
                    style="width: calc(100% - 10px); height: 40px; margin-left: 5px; margin-top: 15px;"
                    @keyup.enter="rename"
                ></fv-text-box>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(140, 148, 228, 1)"
                :disabled="!modelValue || name === ''"
                @click="rename"
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
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { mapState } from 'pinia';

export default {
    components: {
        floatWindowBase,
    },
    props: {
        modelValue: {
            default: null,
        },
        item: {
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
        };
    },
    watch: {
        show(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit("update:show", val);
            if (this.modelValue.name) this.name = this.modelValue.name;
            else this.name = "";
        },
    },
    computed: {
        ...mapState(useDataStore, {
            data_path: (state) => state.data_path,
            data_index: (state) => state.configState.data_index
        }),
        ...mapState(useAppConfig, ['local']),
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        }),
    },
    methods: {
        async rename() {
            if (!this.modelValue || !this.item || this.name === "") return;
            this.modelValue.name = this.name;
            let res = await this.$api.AcademicController.updateItemPage(
                this.currentDataPath,
                this.item.id,
                this.modelValue
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