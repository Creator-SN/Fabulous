<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Init Data Source')"
        :theme="theme"
    >
        <template v-slot:content>
            <div
                class="w-p-block"
                @keyup.enter="initDs"
            >
                <p class="w-title">{{local('Data Source Name')}}</p>
                <p class="w-info">{{local('Path')}}: {{thisDataPath}}</p>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('Input data source name...')"
                    :theme="theme"
                    :font-size="18"
                    underline
                    :border-radius="6"
                    :border-color="'rgba(123, 139, 209, 0.3)'"
                    :focus-border-color="'rgba(123, 139, 209, 1)'"
                    :border-width="2"
                    :is-box-shadow="true"
                    style="width: 100%; height: 50px; margin-top: 15px;"
                    @keyup.enter="initDs"
                ></fv-text-box>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(0, 98, 158, 1)"
                :disabled="db_index < 0 || name === ''"
                @click="initDs"
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
import floatWindowBase from '../window/floatWindowBase.vue';
import { mapState, mapGetters } from 'vuex';

export default {
    components: {
        floatWindowBase
    },
    props: {
        show: {
            default: false
        },
        db_index: {
            default: null
        }
    },
    data() {
        return {
            thisShow: this.show,
            name: ''
        };
    },
    watch: {
        show(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit('update:show', val);
            this.name = '';
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            language: (state) => state.config.language,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath']),
        thisDataPath() {
            if (this.data_path.length == 0) return null;
            if (this.data_path[this.db_index])
                return this.data_path[this.db_index].path;
            let dataPathItem = this.data_path.find(
                (item) => item.path === this.db_index
            );
            if (dataPathItem) return dataPathItem.path;
            return null;
        },
        v() {
            return this;
        }
    },
    methods: {
        initDs() {
            if (!this.db_index || this.name === '') return;
            if (!this.thisDataPath) return;
            this.$local_api.ConfigController.initDataSource(
                this.thisDataPath,
                this.name
            ).then((res) => {
                if (res.status !== 'success') {
                    this.$barWarning(res.message, {
                        status: 'warning'
                    });
                } else {
                    this.$emit('finished');
                    this.thisShow = false;
                }
            });
        }
    }
};
</script>

<style lang="scss">
</style>