<template>
    <float-window-base
        v-model="show"
        :title="local(`Profile`)"
        title-size="13.8"
        :theme="theme"
        :isFooter="false"
    >
        <template v-slot:content>
            <div class="panel-container">
                <profile-info-block :refresh="show"></profile-info-block>
            </div>
        </template>
    </float-window-base>
</template>

<script>
import profileInfoBlock from './profileInfoBlock.vue';
import floatWindowBase from '@/components/window/floatWindowBase.vue';

import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useUserStore } from '@/stores/user'
import { useTheme } from '@/stores/theme'
import { mapState, mapActions } from 'pinia'

export default {
    name: 'Profile',
    components: {
        profileInfoBlock,
        floatWindowBase
    },
    props: {
        modelValue: {
            default: false
        }
    },
    data() {
        return {
            show: this.modelValue
        };
    },
    watch: {
        modelValue(val) {
            this.show = val;
        },
        show() {
            this.$emit('update:modelValue', this.show);
        }
    },
    computed: {
        ...mapState(useAppConfig, ['local']),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        }),
        ...mapState(useTheme, {
            theme: 'theme'
        })
    },
    mounted() {},
    methods: {
        ...mapActions(useUserStore, {
            clearInfo: 'clearInfo'
        }),
        logout() {
            localStorage.removeItem('ApiToken');
            this.clearInfo();
        }
    }
};
</script>

<style lang="scss">
.panel-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 15px 15px 55px 15px;
    color: rgba(28, 30, 41, 1);

    .panel-title {
        font-size: 12px;
    }
}
</style>