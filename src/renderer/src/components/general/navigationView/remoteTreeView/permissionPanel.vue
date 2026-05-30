<template>
    <div>
        <float-window-base
            v-model="thisShow"
            :title="dialogTitle"
            :teleport="true"
            :height="'min(700px, 90%)'"
            :theme="theme"
        >
            <template v-slot:content>
                <div class="permission-panel">
                    <div class="target-block" :class="[{ dark: theme === 'dark' }]">
                        <p class="target-title">{{ targetName }}</p>
                        <p class="target-sub">
                            {{ targetTypeLabel }}
                            <span v-if="targetId">ID: {{ targetId }}</span>
                        </p>
                    </div>

                    <div
                        v-if="target?.isDir"
                        class="protect-row"
                        :class="[{ dark: theme === 'dark' }]"
                    >
                        <fv-check-box
                            :model-value="targetProtect"
                            :theme="theme"
                            background="rgba(140, 148, 228, 1)"
                            :disabled="!canEditProtect"
                            @update:modelValue="onProtectToggle"
                        >
                            {{ local('Protected Directory') }}
                        </fv-check-box>
                        <p class="protect-tip">
                            {{
                                local(
                                    'Only the owner or users with permission manage can change protection.'
                                )
                            }}
                        </p>
                    </div>

                    <hr style="margin-bottom: 15px; border: none; border-top: 1px solid rgba(120, 120, 120, 0.1);"/>

                    <div
                        v-if="target?.isDir"
                        class="cascade-row"
                        :class="[{ dark: theme === 'dark' }]"
                    >
                        <fv-check-box
                            :model-value="cascade"
                            :theme="theme"
                            background="rgba(140, 148, 228, 1)"
                            @update:modelValue="cascade = $event"
                        >
                            {{ local('Cascade Permission Changes') }}
                        </fv-check-box>
                    </div>

                    <div class="section-header">
                        <p class="section-title">{{ local('Permission Groups') }}</p>
                        <fv-button
                            :theme="theme"
                            :border-radius="6"
                            :is-box-shadow="true"
                            style="width: 35px; height: 35px"
                            :title="local('Refresh Permission Groups')"
                            @click="initializePanel"
                        >
                            <i
                                class="ms-Icon ms-Icon--Sync"
                                :class="{ rotating: !lock.loading }"
                            ></i>
                        </fv-button>
                    </div>

                    <div v-if="permissionGroups.length === 0" class="empty-block">
                        <p>{{ emptyText }}</p>
                    </div>

                    <div
                        v-for="group in permissionGroups"
                        :key="group.key"
                        class="permission-group-card"
                        :class="[{ dark: theme === 'dark' }]"
                    >
                        <div class="group-header">
                            <div class="group-info">
                                <p class="group-name">{{ group.name || local('Unnamed Group') }}</p>
                                <p class="group-sub">
                                    <template v-if="showCurrentPermissionPanel">
                                        {{ local('Current Code') }}: {{ group.permissionCode }}
                                    </template>
                                    <span
                                        v-if="showCurrentPermissionPanel && !isOwner"
                                        class="group-sub-separator"
                                    >
                                        |
                                    </span>
                                    <template v-if="!isOwner">
                                        {{ local('Final Code') }}: {{ group.finalPermissionCode }}
                                    </template>
                                </p>
                            </div>
                            <fv-button
                                v-show="group.hasPermission && isOwner"
                                theme="dark"
                                background="rgba(200, 76, 76, 1)"
                                :border-radius="6"
                                :is-box-shadow="true"
                                :disabled="group.savingPermission"
                                style="width: 35px; height: 35px"
                                :title="local('Clear Permissions to Default')"
                                @click="clearPermission(group)"
                            >
                                <i class="ms-Icon ms-Icon--EraseTool"></i>
                            </fv-button>
                        </div>

                        <div v-if="showCurrentPermissionPanel" class="permission-section">
                            <p class="permission-section-title">
                                {{ local('Current Permissions') }}
                            </p>
                            <div class="permission-boxes">
                                <fv-check-box
                                    :model-value="group.permissionState.read"
                                    :theme="theme"
                                    background="rgba(140, 148, 228, 1)"
                                    :disabled="!canEditBasicPermission(group)"
                                    @update:modelValue="onPermissionToggle(group, 'read', $event)"
                                >
                                    {{ local('Read') }}
                                </fv-check-box>
                                <fv-check-box
                                    :model-value="group.permissionState.write"
                                    :theme="theme"
                                    background="rgba(140, 148, 228, 1)"
                                    :disabled="!canEditBasicPermission(group)"
                                    @update:modelValue="onPermissionToggle(group, 'write', $event)"
                                >
                                    {{ local('Write') }}
                                </fv-check-box>
                                <fv-check-box
                                    :model-value="group.permissionState.delete"
                                    :theme="theme"
                                    background="rgba(140, 148, 228, 1)"
                                    :disabled="!canEditBasicPermission(group)"
                                    @update:modelValue="onPermissionToggle(group, 'delete', $event)"
                                >
                                    {{ local('Delete') }}
                                </fv-check-box>
                                <fv-check-box
                                    :model-value="group.permissionState.manage"
                                    :theme="theme"
                                    background="rgba(140, 148, 228, 1)"
                                    :disabled="!canEditManagePermission(group)"
                                    @update:modelValue="onPermissionToggle(group, 'manage', $event)"
                                >
                                    {{ local('Permission Manage') }}
                                </fv-check-box>
                            </div>
                        </div>

                        <div v-if="!isOwner" class="permission-section readonly">
                            <p class="permission-section-title">{{ local('Final Permissions') }}</p>
                            <div class="permission-boxes">
                                <fv-check-box
                                    :model-value="group.finalPermissionState.read"
                                    :theme="theme"
                                    background="rgba(140, 148, 228, 1)"
                                    :disabled="true"
                                >
                                    {{ local('Read') }}
                                </fv-check-box>
                                <fv-check-box
                                    :model-value="group.finalPermissionState.write"
                                    :theme="theme"
                                    background="rgba(140, 148, 228, 1)"
                                    :disabled="true"
                                >
                                    {{ local('Write') }}
                                </fv-check-box>
                                <fv-check-box
                                    :model-value="group.finalPermissionState.delete"
                                    :theme="theme"
                                    background="rgba(140, 148, 228, 1)"
                                    :disabled="true"
                                >
                                    {{ local('Delete') }}
                                </fv-check-box>
                                <fv-check-box
                                    :model-value="group.finalPermissionState.manage"
                                    :theme="theme"
                                    background="rgba(140, 148, 228, 1)"
                                    :disabled="true"
                                >
                                    {{ local('Permission Manage') }}
                                </fv-check-box>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template v-slot:control>
                <fv-button :theme="theme" @click="thisShow = false">
                    {{ local('Close') }}
                </fv-button>
            </template>
        </float-window-base>
    </div>
</template>

<script>
import floatWindowBase from '@/components/window/floatWindowBase.vue'

import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { useNotebookConfig } from '@/stores/notebook'
import { useUserStore } from '@/stores/user'
import { mapState, mapActions } from 'pinia'

export default {
    components: {
        floatWindowBase
    },
    props: {
        modelValue: {
            default: false
        },
        target: {
            default: () => null
        },
        uri: {
            default: ''
        }
    },
    data() {
        return {
            thisShow: this.modelValue,
            permissionGroups: [],
            cascade: false,
            myPermissionCode: '0000',
            protectSaving: false,
            lock: {
                loading: true
            }
        }
    },
    watch: {
        modelValue(val) {
            this.thisShow = val
            if (val) this.initializePanel()
        },
        thisShow(val) {
            this.$emit('update:modelValue', val)
            if (!val) this.resetPanel()
        },
        target: {
            handler() {
                if (this.thisShow) this.initializePanel()
            },
            deep: true
        }
    },
    computed: {
        ...mapState(useAppConfig, ['local']),
        ...mapState(useDataStore, {
            currentDataPathOwner: (state) => state.currentDataPathOwner
        }),
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        ...mapState(useUserStore, {
            userInfo: (state) => state.info
        }),
        dialogTitle() {
            return this.local('Permissions')
        },
        isOwner() {
            if (!this.userInfo.id) return false
            return this.currentDataPathOwner === this.userInfo.id
        },
        isTargetOwner() {
            if (!this.userInfo.id) return false
            if (this.target?.owner && this.target.owner !== 'Unknown') {
                return this.target.owner === this.userInfo.id
            }
            return this.isOwner
        },
        targetId() {
            if (this.target?.remoteId) return this.target.remoteId
            if (!this.target?.filePath) return ''
            let pathList = this.target.filePath.split(/[\\/]/)
            return pathList[pathList.length - 1]
        },
        targetName() {
            return this.target?.name || this.local('Unknown Target')
        },
        targetTypeLabel() {
            if (this.target?.isDir) return this.local('Folder')
            return this.local('Notebook')
        },
        myPermissionState() {
            return this.permissionCodeToState(this.myPermissionCode)
        },
        targetProtect() {
            return this.target?.protect === true
        },
        showCurrentPermissionPanel() {
            if (this.isOwner) return true
            return this.myPermissionState.manage === true
        },
        canEditProtect() {
            if (!this.target?.isDir || !this.uri || !this.target?.filePath) return false
            if (!this.lock.loading || this.protectSaving) return false
            return this.isTargetOwner || this.myPermissionState.manage === true
        },
        emptyText() {
            if (!this.uri || !this.targetId) return this.local('No Available Target')
            if (!this.lock.loading) return this.local('Loading')
            return this.local('No Permission Groups')
        }
    },
    methods: {
        ...mapActions(useNotebookConfig, [
            'listVisibleRemotePermissionGroups',
            'getRemoteDirectoryPermission',
            'getMyRemoteDirectoryPermission',
            'createRemoteDirectoryPermission',
            'updateRemoteDirectoryPermission',
            'removeRemoteDirectoryPermission',
            'getRemoteNotebookPermission',
            'getMyRemoteNotebookPermission',
            'createRemoteNotebookPermission',
            'updateRemoteNotebookPermission',
            'removeRemoteNotebookPermission',
            'updateRemoteDirectoryInfo'
        ]),
        resetPanel() {
            this.permissionGroups = []
            this.cascade = false
            this.myPermissionCode = '0000'
            this.protectSaving = false
            this.lock.loading = true
        },
        normalizePermissionCode(code = '0000') {
            return code.toString().padEnd(4, '0').slice(0, 4).replace(/[^01]/g, '0')
        },
        permissionCodeToState(code) {
            const normalized = this.normalizePermissionCode(code)
            return {
                read: normalized[0] === '1',
                write: normalized[1] === '1',
                delete: normalized[2] === '1',
                manage: normalized[3] === '1'
            }
        },
        permissionStateToCode(state) {
            return `${state.read ? 1 : 0}${state.write ? 1 : 0}${state.delete ? 1 : 0}${state.manage ? 1 : 0}`
        },
        canEditBasicPermission(group) {
            if (!group || !group.id || group.savingPermission || !this.lock.loading) return false
            if (this.isOwner) return true
            return group.finalPermissionState?.manage === true
        },
        canEditManagePermission(group) {
            if (!group || !group.id || group.savingPermission || !this.lock.loading) return false
            return this.isOwner
        },
        resolvePermissionGroupId(item) {
            return item?.id || item?.groupId || ''
        },
        normalizePermissionGroup(item, permissionRes, index) {
            const groupId = this.resolvePermissionGroupId(item)
            const exists = permissionRes?.code === 200
            const isDefaultPermission =
                permissionRes?.code === 400 &&
                permissionRes?.message === 'path permission not found'
            const permissionCode = this.normalizePermissionCode(
                exists ? permissionRes?.data?.permissionCode : '1111'
            )
            const finalPermissionCode = this.myPermissionCode
            return {
                ...item,
                id: groupId,
                key: groupId || `group-${index}`,
                permissionCode,
                permissionState: this.permissionCodeToState(permissionCode),
                finalPermissionCode,
                finalPermissionState: this.permissionCodeToState(finalPermissionCode),
                hasPermission: exists,
                isDefaultPermission,
                savingPermission: false
            }
        },
        syncGroupFinalPermissions() {
            const finalPermissionCode = this.normalizePermissionCode(this.myPermissionCode)
            const finalPermissionState = this.permissionCodeToState(finalPermissionCode)
            this.permissionGroups.forEach((group) => {
                group.finalPermissionCode = finalPermissionCode
                group.finalPermissionState = finalPermissionState
            })
        },
        async loadGroupPermission(group) {
            const groupId = this.resolvePermissionGroupId(group)
            if (!groupId) {
                return { code: 400, message: 'invalid permission group id' }
            }
            if (this.target?.isDir) {
                return await this.getRemoteDirectoryPermission(
                    this.uri,
                    groupId,
                    this.targetId,
                    true
                )
            }
            return await this.getRemoteNotebookPermission(this.uri, groupId, this.targetId, true)
        },
        async loadMyTargetPermission() {
            if (!this.uri || !this.targetId) return
            let res = null
            if (this.target?.isDir) {
                res = await this.getMyRemoteDirectoryPermission(this.uri, this.targetId, true)
            } else {
                res = await this.getMyRemoteNotebookPermission(this.uri, this.targetId, true)
            }
            this.myPermissionCode = this.normalizePermissionCode(
                res?.code === 200 ? res?.data?.permissionCode : '0000'
            )
            this.syncGroupFinalPermissions()
        },
        async initializePanel() {
            if (!this.uri || !this.targetId || !this.lock.loading) return
            this.lock.loading = false
            await this.loadMyTargetPermission()
            const groupsRes = await this.listVisibleRemotePermissionGroups(this.uri, this.isOwner)
            if (groupsRes?.code === 200) {
                const groups = Array.isArray(groupsRes.data) ? groupsRes.data : []
                let permissionResults = []
                if (this.showCurrentPermissionPanel) {
                    permissionResults = await Promise.all(
                        groups.map((group) => this.loadGroupPermission(group))
                    )
                }
                this.permissionGroups = groups.map((group, index) =>
                    this.normalizePermissionGroup(group, permissionResults[index], index)
                )
            } else {
                this.permissionGroups = []
            }
            this.syncGroupFinalPermissions()
            this.lock.loading = true
        },
        async onProtectToggle(value) {
            if (value === this.targetProtect || !this.canEditProtect) return
            const previousProtect = this.targetProtect
            this.protectSaving = true
            if (this.target) {
                this.target.protect = value
            }
            const res = await this.updateRemoteDirectoryInfo(this.uri, this.target.filePath, {
                protect: value
            })
            if (res?.code !== 200 && this.target) {
                this.target.protect = previousProtect
            }
            this.protectSaving = false
        },
        async savePermission(group, permissionCode) {
            const payload = {
                permissionCode
            }
            if (this.target?.isDir) {
                if (group.hasPermission) {
                    return await this.updateRemoteDirectoryPermission(
                        this.uri,
                        group.id,
                        this.targetId,
                        payload,
                        this.cascade
                    )
                }
                return await this.createRemoteDirectoryPermission(
                    this.uri,
                    group.id,
                    this.targetId,
                    payload,
                    this.cascade
                )
            }
            if (group.hasPermission) {
                return await this.updateRemoteNotebookPermission(
                    this.uri,
                    group.id,
                    this.targetId,
                    payload
                )
            }
            return await this.createRemoteNotebookPermission(
                this.uri,
                group.id,
                this.targetId,
                payload
            )
        },
        async clearPermission(group) {
            if (!group || !group.id || !group.hasPermission || group.savingPermission) return
            group.savingPermission = true
            let res = null
            if (this.target?.isDir) {
                res = await this.removeRemoteDirectoryPermission(
                    this.uri,
                    group.id,
                    this.targetId,
                    this.cascade
                )
            } else {
                res = await this.removeRemoteNotebookPermission(this.uri, group.id, this.targetId)
            }
            if (res?.code === 200) {
                group.hasPermission = false
                group.isDefaultPermission = true
                group.permissionCode = '1111'
                group.permissionState = this.permissionCodeToState('1111')
                await this.loadMyTargetPermission()
            }
            group.savingPermission = false
        },
        async onPermissionToggle(group, key, value) {
            if (!group || !group.id || group.savingPermission) return
            if (key === 'manage' && !this.canEditManagePermission(group)) return
            if (key !== 'manage' && !this.canEditBasicPermission(group)) return
            const previousState = {
                ...group.permissionState
            }
            const previousCode = group.permissionCode
            const previousHasPermission = group.hasPermission
            const previousDefaultPermission = group.isDefaultPermission
            group.permissionState = {
                ...group.permissionState,
                [key]: value
            }
            group.savingPermission = true
            const permissionCode = this.permissionStateToCode(group.permissionState)
            if (permissionCode === '1111' && !group.hasPermission) {
                group.permissionCode = '1111'
                group.isDefaultPermission = true
                group.savingPermission = false
                return
            }
            let res = await this.savePermission(group, permissionCode)

            if (res?.code === 200) {
                group.permissionCode = permissionCode
                group.hasPermission = true
                group.isDefaultPermission = false
                await this.loadMyTargetPermission()
            } else {
                group.permissionState = previousState
                group.permissionCode = previousCode
                group.hasPermission = previousHasPermission
                group.isDefaultPermission = previousDefaultPermission
            }
            group.savingPermission = false
        }
    }
}
</script>

<style lang="scss">
.permission-panel {
    position: relative;
    width: 100%;
    max-height: 70vh;
    padding-right: 5px;
    overflow: auto;

    .target-block {
        margin-bottom: 18px;

        &.dark {
            color: rgba(245, 245, 245, 0.92);
        }

        .target-title {
            font-size: 14px;
            font-weight: bold;
        }

        .target-sub {
            margin-top: 6px;
            font-size: 12px;
            opacity: 0.75;
        }
    }

    .section-header {
        @include HbetweenVcenter;

        width: 100%;
        margin-bottom: 10px;
    }

    .cascade-row {
        margin-bottom: 12px;

        &.dark {
            color: rgba(245, 245, 245, 0.92);
        }
    }

    .protect-row {
        margin-bottom: 16px;

        &.dark {
            color: rgba(245, 245, 245, 0.92);
        }

        .protect-tip {
            margin-top: 6px;
            font-size: 12px;
            opacity: 0.72;
        }
    }

    .section-title {
        font-size: 13px;
        font-weight: bold;
    }

    .empty-block {
        padding: 10px 0px;
        font-size: 12px;
        opacity: 0.75;
    }

    .permission-group-card {
        padding: 12px 14px;
        margin-bottom: 10px;
        border-radius: 10px;
        background: rgba(123, 139, 209, 0.08);
        border: rgba(123, 139, 209, 0.16) solid 1px;

        &.dark {
            background: rgba(123, 139, 209, 0.14);
            border-color: rgba(123, 139, 209, 0.24);
        }

        .group-header {
            @include HbetweenVcenter;

            gap: 12px;
        }

        .group-info {
            flex: 1;
            overflow: hidden;
        }

        .group-name {
            font-size: 13px;
            font-weight: bold;
        }

        .group-sub {
            margin-top: 4px;
            font-size: 12px;
            opacity: 0.75;
        }

        .group-sub-separator {
            margin: 0px 6px;
        }

        .permission-section {
            margin-top: 12px;

            &.readonly {
                padding-top: 12px;
                border-top: rgba(123, 139, 209, 0.12) solid 1px;
            }
        }

        .permission-section-title {
            font-size: 12px;
            font-weight: bold;
            opacity: 0.85;
        }

        .permission-boxes {
            display: flex;
            flex-wrap: wrap;
            gap: 18px;
            margin-top: 10px;
        }
    }

    .rotating {
        animation: permission-panel-rotate 1s linear infinite;
    }
}

@keyframes permission-panel-rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>
