<template>
    <div class="auth-block">
        <div class="auth-card">
            <fv-progress-bar
                v-show="!lock.login"
                :loading="true"
                :foreground="color"
                class="auth-progress"
            ></fv-progress-bar>
            <img draggable="false" class="auth-logo" src="@/assets/logo.svg" alt="Fab" />
            <h1 class="auth-title">{{ local(step === 0 ? 'Login' : 'Verify') }}</h1>
            <div v-if="step === 0" class="auth-fields">
                <fv-text-box
                    v-model="user.id"
                    :placeholder="local('Email')"
                    type="email"
                    autocomplete="username"
                    :aria-label="local('Email')"
                    :theme="theme"
                    background="var(--auth-input)"
                    border-radius="6"
                    :reveal-border="true"
                    focus-border-color="#958df1"
                    :reveal-border-gradient-list="['#958df1', '#b79bef', '#b8c7fa']"
                    style="width: 100%; height: 38px"
                    @keyup="handleEnter"
                ></fv-text-box>
                <fv-text-box
                    v-model="user.password"
                    :placeholder="local('Password')"
                    type="password"
                    autocomplete="current-password"
                    :aria-label="local('Password')"
                    :theme="theme"
                    background="var(--auth-input)"
                    border-radius="6"
                    :reveal-border="true"
                    focus-border-color="#958df1"
                    :reveal-border-gradient-list="['#958df1', '#b79bef', '#b8c7fa']"
                    style="width: 100%; height: 38px"
                    @keyup="handleEnter"
                ></fv-text-box>
                <fv-button
                    background="linear-gradient(100deg, #7673d5, #a578bc, #a578bc)"
                    foreground="#ffffff"
                    border-color="#c3afe8"
                    border-radius="28"
                    :reveal-border-color="true"
                    :reveal-border-gradient-list="['#9563df', '#ad7cde', '#c495dc', '#b8c7fa']"
                    :reveal-background-gradient-list="[
                        'rgba(210, 193, 250, 0.38)',
                        'rgba(210, 193, 250, 0.18)',
                        'rgba(143, 97, 231, 0.12)'
                    ]"
                    :is-box-shadow="true"
                    style="width: 100%; height: 37px"
                    font-size="13"
                    font-weight="normal"
                    :disabled="!lock.login || !user.id || !user.password"
                    @click="handleLogin()"
                    >{{ local('Login') }}</fv-button
                >
            </div>
            <div v-else class="auth-fields">
                <div class="verify-id-block">
                    <button
                        type="button"
                        class="auth-back"
                        :aria-label="local('Email')"
                        @click="step = 0"
                    >
                        <i class="ms-Icon ms-Icon--ChevronLeft20" aria-hidden="true"></i>
                    </button>
                    <span>{{ user.id }}</span>
                </div>
                <fv-text-box
                    v-model="verifyCode"
                    :placeholder="local('Verification Code')"
                    :aria-label="local('Verification Code')"
                    inputmode="numeric"
                    maxlength="6"
                    :disabled="!lock.login"
                    :theme="theme"
                    background="var(--auth-input)"
                    border-radius="6"
                    :reveal-border="true"
                    focus-border-color="#958df1"
                    :reveal-border-gradient-list="['#958df1', '#b79bef', '#b8c7fa']"
                    style="width: 100%; height: 38px"
                    @keyup="handleEnter"
                ></fv-text-box>
                <fv-button
                    background="linear-gradient(100deg, #7673d5, #a578bc, #a578bc)"
                    foreground="#ffffff"
                    border-color="#c3afe8"
                    border-radius="28"
                    :reveal-border-color="true"
                    :reveal-border-gradient-list="['#9563df', '#ad7cde', '#c495dc', '#b8c7fa']"
                    :reveal-background-gradient-list="[
                        'rgba(210, 193, 250, 0.38)',
                        'rgba(210, 193, 250, 0.18)',
                        'rgba(143, 97, 231, 0.12)'
                    ]"
                    :is-box-shadow="true"
                    style="width: 100%; height: 37px"
                    font-size="13"
                    font-weight="normal"
                    :disabled="!lock.login || verifyCode.length !== 6"
                    @click="handleLogin()"
                    >{{ local('Continue') }}</fv-button
                >

                <fv-button
                    background="linear-gradient(100deg, #7673d5, #a578bc, #a578bc)"
                    foreground="#ffffff"
                    border-color="#c3afe8"
                    border-radius="28"
                    :reveal-border-color="true"
                    :reveal-border-gradient-list="['#9563df', '#ad7cde', '#c495dc', '#b8c7fa']"
                    :reveal-background-gradient-list="[
                        'rgba(210, 193, 250, 0.38)',
                        'rgba(210, 193, 250, 0.18)',
                        'rgba(143, 97, 231, 0.12)'
                    ]"
                    :is-box-shadow="true"
                    style="width: 100%; height: 37px"
                    font-size="13"
                    font-weight="normal"
                    :disabled="!lock.sendCode || counter > 0"
                    @click="sendCode"
                    >{{ local('Resend Code')
                    }}{{ counter > 0 ? ' ' + counter + 's' : '' }}</fv-button
                >
            </div>
            <button type="button" class="auth-link" @click="$emit('switch-block', 'forgot')">
                {{ local('Forget Password') }}
            </button>
        </div>
        <div class="auth-switch">
            <span>{{ local('No account yet?') }}</span
            ><button type="button" class="auth-link" @click="$emit('switch-block', 'apply')">
                {{ local('Apply New Account') }}
            </button>
        </div>
    </div>
</template>

<script>
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useUserStore } from '@/stores/user'
import { useTheme } from '@/stores/theme'
import { mapActions, mapState } from 'pinia'

export default {
    name: 'FabLogin',
    data() {
        return {
            step: 0,
            user: {
                id: '',
                password: ''
            },
            verifyCode: '',
            counter: 0,
            lock: {
                login: true,
                sendCode: true
            },
            timer: {
                sendCode: null
            }
        }
    },
    beforeUnmount() {
        clearInterval(this.timer.sendCode)
    },
    watch: {
        step() {
            this.verifyCode = ''
        }
    },
    computed: {
        ...mapState(useAppConfig, ['local']),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        }),
        ...mapState(useTheme, ['color', 'gradient']),
        ...mapState(useTheme, {
            theme: 'theme'
        })
    },
    methods: {
        ...mapActions(useUserStore, {
            clearInfo: 'clearInfo',
            getInfo: 'getInfo',
            getAvatar: 'getAvatar'
        }),
        async handleLogin(code = this.step === 1 ? this.verifyCode : null) {
            if (!this.lock.login) return
            if (this.step === 1 && (!code || code.length !== 6)) return
            this.lock.login = false
            let user = {
                id: this.user.id,
                password: this.user.password,
                code
            }
            this.$api.UserController.login(user)
                .then(async (res) => {
                    if (res.code === 200) {
                        let { accessToken, schema, expiredAt } = res.data
                        localStorage.setItem('ApiToken', [schema, accessToken].join(' '))
                        localStorage.setItem('ApiTokenExpiredAt', expiredAt)
                        this.clearInfo()
                        this.$barWarning(this.local('Login Success'), {
                            status: 'correct'
                        })
                        await this.getInfo()
                        this.getAvatar()
                        this.$emit('finished')
                    } else if (res.code === 40001) {
                        this.$barWarning(this.local(`User Not Exists`), {
                            status: 'warning'
                        })
                    } else if (res.code === 40006) {
                        this.$barWarning(this.local(`Password Error`), {
                            status: 'warning'
                        })
                    } else if (res.code === 40007) {
                        this.sendCode()
                        this.step = 1
                    } else if (res.code === 40008) {
                        this.$barWarning(this.local(`Verify Code Error`), {
                            status: 'warning'
                        })
                        this.verifyCode = ''
                    }
                    this.lock.login = true
                })
                .catch((err) => {
                    if (err.message) {
                        this.$barWarning(err.message, {
                            status: 'warning'
                        })
                    }
                    this.lock.login = true
                })
        },
        async sendCode() {
            if (!this.lock.sendCode) return
            this.lock.sendCode = false
            this.$api.UserController.sendVerifiedEmail(this.user.id)
                .then((data) => {
                    if (data.code === 200) {
                        this.$barWarning(this.local(`Email code has been sent.`), {
                            status: 'correct'
                        })
                        this.counter = 60
                        this.timer.sendCode = setInterval(() => {
                            this.counter--
                            if (this.counter <= 0) clearInterval(this.timer.sendCode)
                        }, 1000)
                    }
                    this.lock.sendCode = true
                })
                .catch((err) => {
                    this.lock.sendCode = true
                    if (err.code === 40012) {
                        this.$barWarning(this.local(`Code Exists, Please wait for a while.`), {
                            status: 'warning'
                        })
                    } else if (err.message) {
                        this.$barWarning(err.message, {
                            status: 'warning'
                        })
                    }
                })
        },
        handleEnter(event) {
            if (event.keyCode == 13) this.handleLogin()
        }
    }
}
</script>
