<template>
    <div class="auth-block">
        <div class="auth-card">
            <fv-progress-bar
                v-show="Apply.Lock"
                :loading="true"
                :foreground="color"
                class="auth-progress"
            ></fv-progress-bar>
            <img draggable="false" class="auth-logo" src="@/assets/logo.svg" alt="Fab" />
            <h1 class="auth-title">{{ local('Apply New Account') }}</h1>
            <p class="auth-description">
                {{ local('Get the Full Experience by Creating Account.') }}
            </p>
            <div class="auth-fields">
                <fv-text-box
                    v-model="Form.email"
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
                    v-model="Form.password"
                    :placeholder="local('Passwords, 8-20 characters')"
                    type="password"
                    autocomplete="new-password"
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
                    :disabled="Apply.Lock || !acceptedTerms"
                    @click="handleApply"
                    >{{ local('Apply New Account') }}</fv-button
                >
            </div>
            <div class="auth-consent">
                <fv-check-box
                    v-model="acceptedTerms"
                    :theme="theme"
                    background="#958df1"
                    role="checkbox"
                    tabindex="0"
                    :aria-checked="acceptedTerms"
                    :aria-label="local('Read and agree to the legal documents')"
                    @keydown.space.prevent="acceptedTerms = !acceptedTerms"
                    @keydown.enter.prevent="acceptedTerms = !acceptedTerms"
                ></fv-check-box>
                <p>
                    {{ local('I have read and agree to') }}
                    <router-link
                        :to="{ name: 'Login', params: { block: 'terms' } }"
                        target="_blank"
                        rel="noopener noreferrer"
                        >{{ local('Term of Service') }}</router-link
                    >
                    {{ local('and acknowledge') }}
                    <router-link
                        :to="{ name: 'Login', params: { block: 'privacy' } }"
                        target="_blank"
                        rel="noopener noreferrer"
                        >{{ local('Privacy Policy') }}</router-link
                    >
                </p>
            </div>
        </div>
        <div class="auth-switch">
            <button type="button" class="auth-link" @click="$emit('switch-block', 'login')">
                {{ local('Already have an account? Log in') }}
            </button>
        </div>
    </div>
</template>

<script>
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { mapState } from 'pinia'

export default {
    name: 'FabRegister',
    data() {
        return {
            acceptedTerms: false,
            Form: {
                email: '',
                password: ''
            },
            Apply: {
                Lock: false
            }
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
        verifyInput() {
            if (this.Form.email == '') {
                this.$barWarning(this.local('Email can not be empty.'), {
                    status: 'warning'
                })
                return false
            } else if (this.Form.password == '') {
                this.$barWarning(this.local('Password can not be empty.'), {
                    status: 'warning'
                })
                return false
            }
            return true
        },
        async handleApply() {
            if (!this.acceptedTerms) {
                this.$barWarning(this.local('Please read and agree to the legal documents.'), {
                    status: 'warning'
                })
                return
            }
            if (!this.verifyInput()) return
            if (this.Apply.Lock) return
            this.Apply.Lock = true
            this.$api.UserController.register(this.Form)
                .then((res) => {
                    this.Apply.Lock = false
                    if (res.code === 200) {
                        this.$emit('switch-block', 'login')
                    }
                })
                .catch((res) => {
                    if (res.message) {
                        this.$barWarning(`${this.local(`Apply Failed:`)} ${res.message}`, {
                            status: 'warning'
                        })
                    }
                    this.Apply.Lock = false
                })
        },
        handleEnter(event) {
            if (event.keyCode == 13) this.handleApply()
        }
    }
}
</script>
