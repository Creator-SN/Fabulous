<template>
    <div class="login-page" :class="{ dark: theme === 'dark' }">
        <div class="login-shell">
            <div class="login-content" :class="{ 'legal-content': isLegalPage }">
                <legal-document v-if="isLegalPage" :kind="currentBlock"></legal-document>
                <login-block
                    v-else-if="currentBlock === 'login'"
                    @switch-block="switchBlock"
                    @finished="handleFinished"
                ></login-block>
                <apply-block
                    v-else-if="currentBlock === 'apply'"
                    @switch-block="switchBlock"
                ></apply-block>
                <forgot-block v-else @switch-block="switchBlock"></forgot-block>
            </div>
            <footer class="auth-footer">
                <p>
                    <router-link
                        :to="{ name: 'Login', params: { block: 'terms' }, query: $route.query }"
                        >{{ local('Terms and Conditions') }}</router-link
                    >
                    ·
                    <router-link
                        :to="{ name: 'Login', params: { block: 'privacy' }, query: $route.query }"
                        >{{ local('Privacy Policy') }}</router-link
                    >
                </p>
                <p>Fab · Creator SN<sup>®</sup></p>
            </footer>
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
import legalDocument from './legal/index.vue'

const VALID_BLOCKS = ['login', 'apply', 'forgot', 'terms', 'privacy']

export default {
    name: 'LoginPage',
    components: {
        loginBlock,
        applyBlock,
        forgotBlock,
        legalDocument
    },
    computed: {
        ...mapState(useTheme, {
            theme: 'theme',
            color: 'color',
            gradient: 'gradient'
        }),
        ...mapState(useAppConfig, ['local']),
        isLegalPage() {
            return ['terms', 'privacy'].includes(this.currentBlock)
        },
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
                },
                query: this.$route.query
            })
        },
        handleFinished() {
            const redirect = this.$route.query.redirect
            const target =
                typeof redirect === 'string' &&
                redirect.startsWith('/') &&
                !redirect.startsWith('//') &&
                !redirect.includes('\\') &&
                !redirect.startsWith('/login')
                    ? redirect
                    : '/'
            this.$router.replace(target)
        }
    }
}
</script>

<style lang="scss">
.login-page {
    --auth-text: #30334c;
    --auth-muted: #77758a;
    --auth-link: #7664ba;
    --auth-card: rgba(255, 255, 255, 0.85);
    --auth-input: rgba(255, 255, 255, 0.9);
    --auth-border: rgba(84, 69, 125, 0.14);
    position: relative;
    width: 100%;
    height: 100%;
    padding: 36px 20px;
    box-sizing: border-box;
    overflow: auto;
    color: var(--auth-text);
    background: #f6f5fd;
    -webkit-user-select: none;
    user-select: none;

    input {
        -webkit-user-select: text;
        user-select: text;
    }

    &::before {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(ellipse 420px 380px at 37% 42%, #bea3ef99, transparent 100%),
            radial-gradient(ellipse 480px 380px at 57% 67%, #c9c4fa80, transparent 100%);
        content: '';
    }

    &.dark {
        --auth-text: #eeebfa;
        --auth-muted: #aaa4bf;
        --auth-link: #bcb0f4;
        --auth-card: rgba(36, 32, 49, 0.78);
        --auth-input: rgba(24, 21, 34, 0.85);
        --auth-border: rgba(190, 174, 236, 0.18);
        background: #14131e;

        &::before {
            background: radial-gradient(ellipse 420px 380px at 37% 42%, #7c55ba55, transparent 100%),
                radial-gradient(ellipse 480px 380px at 57% 67%, #6861ad45, transparent 100%);
        }
    }

    .login-shell {
        position: relative;
        min-height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .login-content {
        width: 360px;
        max-width: 100%;
        flex-shrink: 0;

        &.legal-content {
            width: 860px;
        }
    }

    .auth-block {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .auth-card {
        position: relative;
        min-height: 350px;
        padding: 35px 40px;
        box-sizing: border-box;
        border: 1px solid var(--auth-border);
        border-radius: 12px;
        background: var(--auth-card);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        overflow: hidden;

        .auth-title {
            margin: 0;
            color: var(--auth-link);
            font-size: 18px;
            font-weight: 500;
            line-height: 1.4;
            text-align: center;
        }
    }

    .auth-logo {
        width: 64px;
        height: 64px;
        object-fit: contain;
    }

    .auth-progress {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }

    .auth-fields {
        width: 100%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .auth-description {
        margin: -10px 0 0;
        color: var(--auth-muted);
        font-size: 12px;
        line-height: 1.7;
        text-align: center;
    }

    .auth-policy {
        margin: 0;
        color: var(--auth-muted);
        font-size: 12px;
        line-height: 1.8;
        text-align: center;
    }

    .auth-consent {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        color: var(--auth-muted);
        font-size: 12px;
        line-height: 1.8;

        p {
            margin: 0;
        }
        a {
            color: var(--auth-link);
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        a:focus-visible {
            outline: 2px solid #958df1;
            outline-offset: 3px;
        }
    }

    .auth-link {
        padding: 0;
        border: 0;
        border-radius: 3px;
        background: transparent;
        color: var(--auth-link);
        font: inherit;
        font-size: 12px;
        line-height: 1.8;
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
        &:focus-visible {
            outline: 2px solid #958df1;
            outline-offset: 4px;
        }
        &:disabled {
            color: var(--auth-muted);
            cursor: default;
            text-decoration: none;
        }
    }

    .auth-switch {
        padding: 22px 20px;
        border: 1px solid var(--auth-border);
        border-radius: 12px;
        background: var(--auth-card);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;
        color: var(--auth-text);
        font-size: 12px;
    }

    .verify-id-block {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--auth-muted);
        font-size: 12px;

        span {
            min-width: 0;
            overflow-wrap: anywhere;
            -webkit-user-select: text;
            user-select: text;
        }
    }

    .auth-back {
        padding: 5px;
        border: 0;
        border-radius: 4px;
        background: transparent;
        color: var(--auth-link);
        cursor: pointer;

        &:hover {
            background: var(--auth-border);
        }
        &:focus-visible {
            outline: 2px solid #958df1;
        }
    }

    .auth-footer {
        margin-top: 22px;
        text-align: center;
        color: var(--auth-muted);
        font-size: 12px;
        line-height: 1.8;

        p {
            margin: 4px 0;
        }

        a {
            color: inherit;
            text-decoration: none;
            &:hover {
                color: var(--auth-link);
                text-decoration: underline;
            }
            &:focus-visible {
                outline: 2px solid #958df1;
                outline-offset: 3px;
            }
        }

        sup {
            font-size: 0.65em;
            line-height: 0;
            vertical-align: super;
        }
    }

    @media screen and (max-width: 500px) {
        padding: 28px 20px;

        .auth-card {
            padding: 30px 24px;
        }
        .auth-switch {
            padding: 20px 12px;
        }
    }
}
</style>
