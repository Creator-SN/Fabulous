<template>
    <float-window-base
        v-model="thisShow"
        :title="local(thisBlock)"
        :theme="theme"
        :isFooter="false"
    >
        <template v-slot:content>
            <login-block
                v-if="thisBlock === 'login'"
                @switch-block="thisBlock = $event"
                @finished="thisShow = false"
            ></login-block>
            <apply-block
                v-else-if="thisBlock === 'apply'"
                @switch-block="thisBlock = $event"
            ></apply-block>
            <forgot-block
                v-else
                @switch-block="thisBlock = $event"
            ></forgot-block>
        </template>
    </float-window-base>
</template>
  

  
<script>
import { mapGetters, mapState } from 'vuex';

import floatWindowBase from '@/components/window/floatWindowBase.vue';
import loginBlock from './login.vue';
import applyBlock from './apply.vue';
import forgotBlock from './forgot.vue';

export default {
    components: {
        floatWindowBase,
        loginBlock,
        applyBlock,
        forgotBlock
    },
    props: {
        value: {
            default: false
        },
        block: {
            default: 'login'
        }
    },
    data() {
        return {
            thisShow: this.value,
            thisBlock: this.block
        };
    },
    watch: {
        value(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit('input', val);
        },
        block(val) {
            this.thisBlock = val;
        },
        thisBlock(val) {
            this.$emit('update:block', val);
        }
    },
    computed: {
        ...mapState({
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath'])
    }
};
</script>

<style lang="scss">

</style>