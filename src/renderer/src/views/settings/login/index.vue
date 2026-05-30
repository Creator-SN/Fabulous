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
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { mapState } from 'pinia'

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
        modelValue: {
            default: false
        },
        block: {
            default: 'login'
        }
    },
    data() {
        return {
            thisShow: this.modelValue,
            thisBlock: this.block
        };
    },
    watch: {
        modelValue(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit('update:modelValue', val);
        },
        block(val) {
            this.thisBlock = val;
        },
        thisBlock(val) {
            this.$emit('update:block', val);
        }
    },
    computed: {
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        ...mapState(useAppConfig, ['local']),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        })
    }
};
</script>

<style lang="scss">

</style>