<template>
    <float-window-base
        v-model="thisShow"
        :title="local('New Data Source')"
        :theme="theme"
    >
        <template v-slot:content>
            <div
                class="w-p-block"
                @keyup.enter="addDS"
            >
                <p class="w-title">{{local('Data Source Name')}}</p>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('New Data Source Name')"
                    :theme="theme"
                    :font-size="15"
                    underline
                    :border-radius="6"
                    :border-color="'rgba(123, 139, 209, 0.6)'"
                    :focus-border-color="'rgba(123, 139, 209, 1)'"
                    :border-width="2"
                    :is-box-shadow="true"
                    style="width: 90%; height: 45px; margin-top: 5px;"
                    @keyup.enter="addDS"
                ></fv-text-box>
                <p
                    class="w-title"
                    style="margin-top: 25px;"
                >{{local('Choose Folder')}}</p>
                <fv-text-box
                    v-model="path"
                    :placeholder="local('Choose Data Source Directory ...')"
                    :theme="theme"
                    :font-size="12"
                    :border-radius="6"
                    background="transparent"
                    :border-color="'rgba(123, 139, 209, 0.3)'"
                    :focus-border-color="'rgba(123, 139, 209, 1)'"
                    :border-width="2"
                    :reveal-border="true"
                    :is-box-shadow="true"
                    readonly
                    style="width: 90%; height: 45px; margin-top: 5px;"
                    @click.native="choosePath"
                ></fv-text-box>
                <p class="w-info">{{local('When adding a data source, a data source folder will be created under the data source path, and a data source configuration file will be created under the data source folder.')}}</p>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(0, 98, 158, 1)"
                :disabled="name === '' || path === ''"
                @click="addDS"
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
        }
    },
    data() {
        return {
            thisShow: this.show,
            name: '',
            path: ''
        };
    },
    watch: {
        show(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit('update:show', val);
            this.name = '';
            this.path = '';
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            language: (state) => state.config.language,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local'])
    },
    methods: {
        async choosePath() {
            await this.$local_api.Config.selectLocalDataSourcePath().then(
                (res) => {
                    if (res.status === 'success') {
                        this.path = res.data;
                    }
                }
            );
        },
        async addDS() {
            if (this.path === '') return;
            if (this.name === '') return;
            this.$local_api.Config.createDataSource(this.path, this.name)
                .then((res) => {
                    if (res.status !== 'success') {
                        this.$barWarning(res.message, {
                            status: 'warning'
                        });
                    } else {
                        this.$emit('finished');
                        this.thisShow = false;
                    }
                })
                .catch((res) => {
                    this.$barWarning(res.message, {
                        status: 'warning'
                    });
                });
        }
    }
};
</script>

<style lang="scss">
</style>