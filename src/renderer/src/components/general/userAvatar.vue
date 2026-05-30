<template>
    <fv-Persona
        :src="avatar"
        class="persona-block"
        :theme="theme"
        :size="size"
        :showInfo="showInfo"
        :title="displayName"
    >
        <template v-slot:name>
            <p
                style="height: 20px; font-size: 10px; display: flex; align-items: center"
                :style="{ fontSize: fontSize + 'px' }"
            >
                {{ local(infoTitle) }}
            </p>
        </template>
        <template v-slot:secondary>
            <p
                v-if="displayName"
                class="display-name-content"
                :title="displayName"
                :style="{ fontSize: fontSize * 1.2 + 'px', display: 'block' }"
            >
                {{ displayName }}
            </p>
            <fv-shimmer v-else :theme="theme" style="width: 30px; height: 12px">
                <div class="sample" style="width: 30px; height: 12px"></div>
            </fv-shimmer>
        </template>
    </fv-Persona>
</template>

<script>
import { useAppConfig } from '@/stores/appConfig'
import { useUserStore } from '@/stores/user'
import { useTheme } from '@/stores/theme'
import { mapState, mapActions } from 'pinia'

export default {
    props: {
        modelValue: {
            default: null
        },
        size: {
            default: '36'
        },
        showInfo: {
            default: false
        },
        maxTry: {
            default: 3
        },
        infoTitle: {
            default: 'Shared from'
        },
        fontSize: {
            default: 10
        }
    },
    data() {
        return {
            tryCount: 0
        }
    },
    watch: {
        async modelValue(newVal) {
            await this.getAvatarByUserId(newVal)
            this.tryCount = 0
            this.timerInit()
            this.loadInfo()
        },
        showInfo(newVal) {
            if (newVal) this.loadInfo()
        }
    },
    computed: {
        ...mapState(useAppConfig, ['local']),
        ...mapState(useTheme, ['theme']),
        ...mapState(useUserStore, ['avatarCache', 'infoCache']),
        displayName() {
            if (this.userInfo.nickname) return this.userInfo.nickname
            if (this.userInfo.name) return this.userInfo.name
            return this.userInfo.id
        },
        avatar() {
            if (this.avatarCache[this.modelValue]) return this.avatarCache[this.modelValue]
            return ''
        },
        userInfo() {
            return this.infoCache[this.modelValue] || {}
        }
    },
    async mounted() {
        await this.getAvatarByUserId(this.modelValue)
        this.timerInit()
        this.loadInfo()
    },
    methods: {
        ...mapActions(useUserStore, ['getUserInfoByUserId', 'getAvatarByUserId']),
        timerInit() {
            let timer = setInterval(async () => {
                if (!this.modelValue || this.avatar || this.tryCount >= this.maxTry) {
                    clearInterval(timer)
                    return
                }
                await this.getAvatarByUserId(this.modelValue)
                this.tryCount++
            }, 3000)
        },
        async loadInfo() {
            await this.getUserInfoByUserId(this.modelValue)
        }
    }
}
</script>

<style lang="scss">
.persona-block {
    width: auto;
    flex-shrink: 0;

    .persona-avatar {
        flex-shrink: 0;
    }

    .persona-content-block {
        width: auto;
        flex: 1;
        overflow: hidden;

        .persona-title {
            width: auto;
            flex-shrink: 0;
        }

        .display-name-content {
            width: 120px;
            height: 20px;
            flex: 1;
            font-size: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }
}
</style>
