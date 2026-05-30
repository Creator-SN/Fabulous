<template>
    <div class="login-page" :class="{ dark: theme === 'dark' }">
        <div class="login-shell">
            <div class="login-card">
                <login-block
                    v-if="currentBlock === 'login'"
                    @switch-block="switchBlock"
                    @finished="handleFinished"
                ></login-block>
                <apply-block
                    v-else-if="currentBlock === 'apply'"
                    @switch-block="switchBlock"
                ></apply-block>
                <forgot-block v-else @switch-block="switchBlock"></forgot-block>
            </div>
        </div>
    </div>
</template>

<script>
import { useAppConfig } from '@/stores/appConfig'
import { useTheme } from '@/stores/theme'
import { mapState } from 'pinia'

import loginBlock from './login.vue'
import applyBlock from './apply.vue'
import forgotBlock from './forgot.vue'

const VALID_BLOCKS = ['login', 'apply', 'forgot']

export default {
    name: 'LoginPage',
    components: {
        loginBlock,
        applyBlock,
        forgotBlock
    },
    computed: {
        ...mapState(useTheme, {
            theme: 'theme',
            color: 'color',
            gradient: 'gradient'
        }),
        ...mapState(useAppConfig, ['local']),
        currentBlock() {
            const block = this.$route.params.block
            if (typeof block === 'string' && VALID_BLOCKS.includes(block)) return block
            return 'login'
        }
    },
    watch: {
        '$route.params.block': {
            immediate: true,
            handler(value) {
                if (value === undefined) return
                if (!VALID_BLOCKS.includes(value)) {
                    this.replaceBlock('login')
                }
            }
        }
    },
    methods: {
        switchBlock(block) {
            this.replaceBlock(block)
        },
        replaceBlock(block) {
            this.$router.replace({
                name: 'Login',
                params: {
                    block
                }
            })
        },
        handleFinished() {
            this.$router.push('/')
        }
    }
}
</script>

<style lang="scss">
.login-page {
    position: relative;
    width: 100%;
    min-height: 100%;
    padding: 32px 20px;
    box-sizing: border-box;
    overflow: auto;
    background:
        radial-gradient(circle at top left, rgba(140, 148, 228, 0.2), transparent 35%),
        radial-gradient(circle at bottom right, rgba(255, 166, 0, 0.14), transparent 28%),
        linear-gradient(160deg, rgba(248, 248, 252, 1) 0%, rgba(240, 244, 255, 1) 100%);

    &.dark {
        background:
            radial-gradient(circle at top left, rgba(140, 148, 228, 0.22), transparent 35%),
            radial-gradient(circle at bottom right, rgba(255, 166, 0, 0.08), transparent 28%),
            linear-gradient(160deg, rgba(20, 22, 30, 1) 0%, rgba(12, 14, 20, 1) 100%);
    }

    .login-shell {
        min-height: calc(100vh - 64px);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .login-card {
        width: min(720px, 100%);
        min-height: 560px;
        padding: 24px;
        border-radius: 24px;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.88);
        backdrop-filter: blur(18px);
        box-shadow: 0 30px 80px rgba(36, 36, 36, 0.12);
        overflow: hidden;
    }

    &.dark .login-card {
        background: rgba(24, 24, 28, 0.9);
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
    }
}

@media screen and (max-width: 768px) {
    .login-page {
        padding: 0;

        .login-shell {
            min-height: 100vh;
        }

        .login-card {
            min-height: 100vh;
            border-radius: 0;
            padding: 16px;
        }
    }
}
</style>
