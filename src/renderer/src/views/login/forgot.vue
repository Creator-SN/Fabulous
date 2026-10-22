<template>
    <div class="auth-block">
        <div class="auth-card">
            <fv-progress-bar
                v-show="!lock.forgot || !lock.sendCode"
                :loading="true"
                :foreground="color"
                class="auth-progress"
            ></fv-progress-bar>
            <img draggable="false" class="auth-logo" src="@/assets/logo.svg" alt="Fab" />
            <h1 class="auth-title">{{ local('Forgot Password') }}</h1>
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
                    :disabled="!lock.forgot || !user.id || !lock.sendCode"
                    @click="sendCode"
                    >{{ local('Continue') }}</fv-button
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
                    v-model="user.password"
                    :placeholder="local('Passwords, 8-20 characters')"
                    type="password"
                    autocomplete="new-password"
                    :aria-label="local('Password')"
                    :disabled="!lock.forgot"
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
                    v-model="verifyCode"
                    :placeholder="local('Verification Code')"
                    :aria-label="local('Verification Code')"
                    inputmode="numeric"
                    maxlength="6"
                    :disabled="!lock.forgot"
                    :theme="theme"
                    background="var(--auth-input)"
                    border-radius="6"
                    :reveal-border="true"
                    focus-border-color="#958df1"
                    :reveal-border-gradient-list="['#958df1', '#b79bef', '#b8c7fa']"
                    style="width: 100%; height: 38px"
                    @keyup="handleEnter"
                ></fv-text-box>
                <button
                    type="button"
                    class="auth-link"
                    :disabled="!lock.sendCode || counter > 0"
                    @click="sendCode"
                >
                    {{ local('Resend Code') }}{{ counter > 0 ? ' ' + counter + 's' : '' }}
                </button>
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
                    :disabled="verifyCode.length < 6 || !user.password || !lock.forgot"
                    @click="handlerForgot()"
                    >{{ local('Continue') }}</fv-button
                >
            </div>
        </div>
        <div class="auth-switch">
            <button type="button" class="auth-link" @click="$emit('switch-block', 'login')">
                {{ local('Login') }}</button
            ><span aria-hidden="true">·</span
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
    name: 'FabForgotPassword',
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
                forgot: true,
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
            clearInfo: 'clearInfo'
        }),
        async handlerForgot(code = this.verifyCode) {
            if (!this.lock.forgot) return
            if (!this.user.password || !code || code.length < 6) return
            this.lock.forgot = false
            this.$api.UserController.updatePassword(this.user.id, {
                password: this.user.password,
                code
            })
                .then((res) => {
                    if (res.code === 200) {
                        this.$barWarning(this.local('Update Password Success.'), {
                            status: 'correct'
                        })
                        this.$Go('/login')
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
                        this.step++
                    } else if (res.code === 40008) {
                        this.$barWarning(this.local(`Verify Code Error`), {
                            status: 'warning'
                        })
                        this.verifyCode = ''
                    } else if (res.message) {
                        this.$barWarning(res.message, {
                            status: 'warning'
                        })
                    }
                    this.lock.forgot = true
                })
                .catch((err) => {
                    this.lock.forgot = true
                    if (err.message) {
                        this.$barWarning(err.message, {
                            status: 'error'
                        })
                    }
                })
        },
        async sendCode() {
            if (!this.lock.sendCode) return
            this.lock.sendCode = false
            this.$api.UserController.sendForgotVerifiedEmail(this.user.id)
                .then((data) => {
                    if (data.code === 200) {
                        this.$barWarning(this.local(`Email code has been sent.`), {
                            status: 'correct'
                        })
                        this.step = 1
                        this.counter = 60
                        this.timer.sendCode = setInterval(() => {
                            this.counter--
                            if (this.counter <= 0) clearInterval(this.timer.sendCode)
                        }, 1000)
                    } else if (data.code === 40012) {
                        this.$barWarning(data.message || this.local(`Code Exists.`), {
                            status: 'error'
                        })
                        this.step = 1
                    } else if (data.message) {
                        this.$barWarning(data.message, {
                            status: 'warning'
                        })
                    }
                    this.lock.sendCode = true
                })
                .catch((err) => {
                    this.lock.sendCode = true
                    if (err.message) {
                        this.$barWarning(err.message, {
                            status: 'error'
                        })
                    }
                })
        },
        handleEnter(event) {
            if (event.keyCode !== 13) return
            if (this.step === 0) this.sendCode()
            else this.handlerForgot()
        }
    }
}
</script>
