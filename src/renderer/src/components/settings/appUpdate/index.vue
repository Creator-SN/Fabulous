<template>
    <fv-Collapse
        :disabledCollapse="true"
        :theme="theme"
        :icon="'DevUpdate'"
        :title="local('App Update')"
        :content="collapseContent"
        :background="theme === 'dark' ? 'rgba(23, 29, 39, 0.6)' : 'rgba(255, 255, 255, 0.6)'"
        :hover-background="theme === 'dark' ? 'rgba(19, 24, 35, 1)' : ''"
        :border-color="theme === 'dark' ? 'rgba(120, 120, 120, 0.2)' : ''"
        style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px"
    >
        <template #extension>
            <div class="update-info-block">
                <i
                    v-show="updater.status === 'latest'"
                    class="ms-Icon ms-Icon--Accept latest-icon"
                ></i>
                <div class="version-info-block">
                    <p v-show="updater.status === 'latest'" class="update-content-info">
                        {{ local('Latest Version') }}
                    </p>
                    <p v-show="updater.status === 'available'" class="update-content-info">
                        {{ local('Update Available') }}
                    </p>
                    <p v-show="updater.remoteVersion" class="update-content-info">
                        {{ local('Remote Version') }}: v{{ updater.remoteVersion }}
                    </p>
                </div>

                <fv-progress-ring
                    v-show="updater.status === 'checking' || updater.status === 'loading'"
                    :model-value="updater.downloadPercent"
                    :loading="updater.status === 'checking'"
                    :color="color"
                    :background="
                        theme === 'dark' ? 'rgba(23, 29, 39, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                    "
                    r="15"
                    borderWidth="3"
                ></fv-progress-ring>
                <p v-show="updater.status === 'checking'" class="update-content-info">
                    {{ local('Checking...') }}
                </p>
                <p v-show="updater.status === 'loading'" class="update-content-info">
                    {{ local('Downloading...') }} {{ updater.downloadPercent }}%
                </p>
                <p v-show="updater.status === 'downloaded'" class="update-content-info">
                    {{ local('Ready to Install') }}
                </p>
                <p v-show="updater.status === 'available'" class="update-content-info">
                    {{ updater.message }}
                </p>
                <p v-show="updater.status === 'error'" class="update-content-info error">
                    {{ updater.message || local('Update Error') }}
                </p>
                <fv-button
                    :theme="theme"
                    icon="Sync"
                    :border-radius="6"
                    font-size="12"
                    :is-box-shadow="true"
                    style="width: 120px; margin-left: 8px"
                    :disabled="updater.status === 'checking' || updater.status === 'loading'"
                    @click="checkForUpdates"
                >
                    {{ local('Check Update') }}
                </fv-button>
                <fv-button
                    v-show="updater.status === 'downloaded'"
                    :theme="theme"
                    icon="InstallToDrive"
                    :border-radius="6"
                    font-size="12"
                    :is-box-shadow="true"
                    style="width: 150px; margin-left: 8px"
                    @click="installUpdate"
                >
                    {{ local('Install Update') }}
                </fv-button>
            </div>
        </template>
    </fv-Collapse>
</template>

<script>
import { mapState } from 'pinia'
import { useTheme } from '@/stores/theme'
import { useAppConfig } from '@/stores/appConfig'

export default {
    name: 'settings-app-update',
    data() {
        return {
            updater: {
                status: 'init',
                currentVersion: '',
                version: '',
                remoteVersion: '',
                downloadPercent: 0,
                message: ''
            },
            releaseUpdater: null
        }
    },
    computed: {
        ...mapState(useTheme, {
            theme: 'theme',
            color: 'color'
        }),
        ...mapState(useAppConfig, {
            local: 'local'
        }),
        collapseContent() {
            const current = this.updater.currentVersion || this.local('Unknown Version')
            const remote = this.updater.remoteVersion
            if (remote && remote !== current) return `v${current} -> v${remote}`
            return `v${current}`
        }
    },
    async mounted() {
        const api = globalThis?.api || globalThis?.window?.api
        if (!api) return
        this.releaseUpdater = api.onUpdaterMessage?.((payload) => {
            this.applyUpdaterState(payload)
        })
        const state = await api.getAppUpdateState?.()
        this.applyUpdaterState(state)
        await this.checkForUpdates()
    },
    beforeUnmount() {
        this.releaseUpdater?.()
    },
    methods: {
        applyUpdaterState(payload = {}) {
            this.updater = {
                ...this.updater,
                ...payload
            }
        },
        async checkForUpdates() {
            const api = globalThis?.api || globalThis?.window?.api
            if (!api?.checkAppUpdate) return
            const state = await api.checkAppUpdate()
            this.applyUpdaterState(state)
        },
        async installUpdate() {
            const api = globalThis?.api || globalThis?.window?.api
            if (!api?.installAppUpdate) return
            await api.installAppUpdate()
        }
    }
}
</script>

<style lang="scss">
.update-info-block {
    display: flex;
    align-items: center;
    gap: 8px;

    .version-info-block {
        display: flex;
        flex-direction: column;
        margin-right: 6px;
    }

    .latest-icon {
        color: rgba(0, 204, 153, 1);
        font-size: 18px;
    }

    .update-content-info {
        font-size: 10px;
        line-height: 1.4;
        opacity: 0.9;

        &.error {
            color: rgba(220, 62, 72, 1);
        }
    }
}
</style>
