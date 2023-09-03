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

import { mapGetters, mapMutations, mapState } from 'vuex';

export default {
    name: 'Profile',
    components: {
        profileInfoBlock,
        floatWindowBase
    },
    props: {
        value: {
            default: false
        }
    },
    data() {
        return {
            show: this.value
        };
    },
    watch: {
        value() {
            this.show = this.value;
        },
        show() {
            this.$emit('input', this.show);
        }
    },
    computed: {
        ...mapGetters(['local', 'currentDataPath']),
        ...mapState({
            theme: (state) => state.config.theme
        })
    },
    mounted() {},
    methods: {
        ...mapMutations('User', {
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