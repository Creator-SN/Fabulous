<template>
    <float-window-base
        v-model="thisShow"
        :title="local('User Info')"
        height="450px"
        :isFooter="false"
        :theme="theme"
    >
        <template #content>
            <div class="user-card" :class="{ dark: theme === 'dark' }">
                <div class="hero">
                    <user-avatar
                        v-if="userId"
                        :model-value="userId"
                        :show-info="true"
                        :size="36"
                        :font-size="12"
                        :info-title="currentUser.email || currentUser.phone || currentUser.id"

                    ></user-avatar>
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <p class="label">{{ local('Nickname') }}</p>
                        <p class="value">{{ currentUser.nickname || '-' }}</p>
                    </div>
                    <div class="info-item">
                        <p class="label">{{ local('Name') }}</p>
                        <p class="value">{{ currentUser.name || '-' }}</p>
                    </div>
                    <div class="info-item">
                        <p class="label">{{ local('Email') }}</p>
                        <p class="value">{{ currentUser.email || '-' }}</p>
                    </div>
                    <div class="info-item">
                        <p class="label">{{ local('Phone') }}</p>
                        <p class="value">{{ currentUser.phone || '-' }}</p>
                    </div>
                    <div class="info-item">
                        <p class="label">{{ local('Gender') }}</p>
                        <p class="value">{{ genderText }}</p>
                    </div>
                    <div class="info-item">
                        <p class="label">{{ local('Create Date') }}</p>
                        <p class="value">{{ formatDate(currentUser.createDate) }}</p>
                    </div>
                </div>
            </div>
        </template>
    </float-window-base>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useTheme } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import floatWindowBase from '@/components/window/floatWindowBase.vue'
import userAvatar from '@/components/general/userAvatar.vue'

export default {
    components: {
        floatWindowBase,
        userAvatar
    },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            thisShow: this.show,
            userInfo: this.modelValue || {}
        }
    },
    watch: {
        show(val) {
            this.thisShow = val
            if (val) this.loadUserInfo()
        },
        thisShow(val) {
            this.$emit('update:show', val)
        },
        modelValue: {
            handler(val) {
                this.userInfo = val || {}
                if (this.thisShow) this.loadUserInfo()
            },
            deep: true
        }
    },
    computed: {
        ...mapState(useTheme, ['theme']),
        ...mapState(useAppConfig, ['local']),
        ...mapState(useUserStore, ['infoCache']),
        userId() {
            return this.userInfo?.id || null
        },
        currentUser() {
            if (this.userId && this.infoCache[this.userId]) {
                return {
                    ...this.userInfo,
                    ...this.infoCache[this.userId]
                }
            }
            return this.userInfo || {}
        },
        displayName() {
            return (
                this.currentUser.nickname ||
                this.currentUser.name ||
                this.currentUser.email ||
                this.currentUser.phone ||
                this.currentUser.id ||
                '-'
            )
        },
        genderText() {
            if (this.currentUser.gender === 1) return this.local('Male')
            if (this.currentUser.gender === 2) return this.local('Female')
            return this.local('Unknown')
        }
    },
    mounted() {
        if (this.thisShow) this.loadUserInfo()
    },
    methods: {
        ...mapActions(useUserStore, ['getUserInfoByUserId']),
        async loadUserInfo() {
            if (!this.userId) return
            let info = await this.getUserInfoByUserId(this.userId)
            if (info) {
                this.userInfo = {
                    ...this.userInfo,
                    ...info
                }
            }
        },
        formatDate(value) {
            if (!value) return '-'
            try {
                return this.$date ? this.$date(value) : new Date(value).toLocaleString()
            } catch (e) {
                return value
            }
        }
    }
}
</script>

<style lang="scss">
.user-card {
    width: 100%;
    height: 100%;
    overflow: auto;

    .hero {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 6px 4px 18px;
        border-bottom: 1px solid rgba(120, 120, 120, 0.12);
    }

    .hero-meta {
        min-width: 0;
        flex: 1;
    }

    .display-name {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: rgba(45, 52, 76, 1);
        word-break: break-word;
    }

    .sub-line {
        margin: 8px 0px 0px;
        font-size: 13px;
        color: rgba(110, 118, 140, 1);
        word-break: break-word;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        padding-top: 18px;
    }

    .info-item {
        padding: 14px 16px;
        border-radius: 12px;
        background: rgba(247, 248, 252, 0.86);
        box-shadow: inset 0 0 0 1px rgba(130, 137, 164, 0.08);
        min-width: 0;
    }

    .label {
        margin: 0px 0px 8px;
        font-size: 12px;
        color: rgba(112, 118, 140, 1);
    }

    .value {
        margin: 0;
        font-size: 14px;
        line-height: 1.45;
        color: rgba(38, 43, 61, 1);
        word-break: break-word;
    }

    &.dark {
        .display-name {
            color: rgba(245, 247, 255, 0.95);
        }

        .sub-line {
            color: rgba(214, 220, 237, 0.7);
        }

        .info-item {
            background: rgba(255, 255, 255, 0.06);
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
        }

        .label {
            color: rgba(196, 204, 227, 0.68);
        }

        .value {
            color: rgba(245, 247, 255, 0.88);
        }
    }
}

@media (max-width: 768px) {
    .user-card {
        .hero {
            align-items: flex-start;
            flex-direction: column;
        }

        .info-grid {
            grid-template-columns: minmax(0, 1fr);
        }
    }
}
</style>
