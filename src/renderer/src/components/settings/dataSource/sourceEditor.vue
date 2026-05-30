<template>
    <div>
        <float-window-base v-model="thisShow" :title="dialogTitle" :theme="theme">
            <template v-slot:content>
                <div class="source-editor">
                    <div class="section-block">
                        <p class="section-title">{{ local('Data Source Name') }}</p>
                        <fv-text-box
                            v-model="name"
                            :placeholder="inputPlaceholder"
                            :theme="theme"
                            :font-size="15"
                            :readonly="!isOwner && isEditMode"
                            underline
                            :border-radius="3"
                            :border-color="'rgba(123, 139, 209, 0.6)'"
                            :focus-border-color="'rgba(123, 139, 209, 1)'"
                            :border-width="2"
                            style="width: 100%; height: 45px; margin-top: 15px"
                            @keyup.enter="submitSource"
                        ></fv-text-box>
                        <p v-if="isEditMode && currentSource.id !== undefined" class="source-id">
                            ID: {{ currentSource.id }}
                        </p>
                    </div>

                    <div v-if="isEditMode" class="section-block">
                        <div class="section-header">
                            <p class="section-title">{{ local('Permission Groups') }}</p>
                            <div class="action-row">
                                <fv-button
                                    v-show="isOwner"
                                    theme="dark"
                                    :background="color"
                                    :border-radius="6"
                                    :is-box-shadow="true"
                                    style="width: 38px; height: 35px"
                                    :title="local('Create Permission Group')"
                                    @click="createPermissionGroup"
                                >
                                    <i class="ms-Icon ms-Icon--Add"></i>
                                </fv-button>
                                <fv-button
                                    :theme="theme"
                                    :border-radius="6"
                                    :is-box-shadow="true"
                                    style="width: 35px; height: 35px; margin-left: 6px"
                                    :title="local('Refresh Permission Groups')"
                                    @click="loadPermissionGroups"
                                >
                                    <i
                                        class="ms-Icon ms-Icon--Sync"
                                        :class="{ rotating: !lock.permissionGroups }"
                                    ></i>
                                </fv-button>
                            </div>
                        </div>

                        <div v-if="permissionGroups.length === 0" class="empty-block">
                            <p>{{ local('No Permission Groups') }}</p>
                        </div>

                        <fv-collapse
                            v-for="group in permissionGroups"
                            :key="group.key"
                            v-model="group.expanded"
                            :theme="theme"
                            :title="group.name || local('Unnamed Group')"
                            icon="Permissions"
                            :content="`${local('Permission Code')}: ${group.permissionCode}`"
                            :default-height="60"
                            :maxHeight="'auto'"
                            :visible-overflow="true"
                            style="margin-top: 8px"
                            @update:modelValue="handleGroupExpand(group, $event)"
                        >
                            <template v-slot:extension>
                                <div class="group-header-actions">
                                    <fv-button
                                        v-show="canManageGroupUsers(group)"
                                        theme="dark"
                                        background="rgba(140, 148, 228, 1)"
                                        :border-radius="6"
                                        :is-box-shadow="true"
                                        style="width: 38px; height: 30px"
                                        :title="local('Add Group User')"
                                        @click="openAddUserPanel($event, group)"
                                    >
                                        <i class="ms-Icon ms-Icon--AddFriend"></i>
                                    </fv-button>
                                    <fv-button
                                        v-show="canManageGroupUsers(group)"
                                        theme="dark"
                                        background="rgba(140, 148, 228, 1)"
                                        :border-radius="6"
                                        :is-box-shadow="true"
                                        style="width: 38px; height: 30px; margin-left: 6px"
                                        :title="local('Get Invite Code')"
                                        @click="openInvitePanel($event, group)"
                                    >
                                        <i class="ms-Icon ms-Icon--Share"></i>
                                    </fv-button>
                                    <fv-button
                                        v-show="isOwner"
                                        theme="dark"
                                        background="rgba(200, 76, 76, 1)"
                                        :border-radius="6"
                                        :is-box-shadow="true"
                                        style="width: 38px; height: 30px; margin-left: 6px"
                                        :title="local('Remove Permission Group')"
                                        @click="removePermissionGroup($event, group)"
                                    >
                                        <i class="ms-Icon ms-Icon--Delete"></i>
                                    </fv-button>
                                </div>
                            </template>

                            <div class="group-content">
                                <div v-show="isOwner" class="group-name-row">
                                    <p class="label">{{ local('Group Name') }}</p>
                                    <div class="group-name-actions">
                                        <fv-text-box
                                            v-model="group.nameDraft"
                                            :theme="theme"
                                            :placeholder="local('Permission Group Name')"
                                            underline
                                            :border-width="2"
                                            :border-color="'rgba(123, 139, 209, 0.35)'"
                                            :focus-border-color="'rgba(123, 139, 209, 1)'"
                                            :is-box-shadow="true"
                                            style="flex: 1; height: 38px"
                                            @click.stop
                                            @keyup.enter="savePermissionGroup(group)"
                                        ></fv-text-box>
                                        <fv-button
                                            theme="dark"
                                            background="rgba(146, 119, 199, 1)"
                                            :border-radius="6"
                                            :disabled="
                                                !ds_lock.permission_groups || group.savingGroup
                                            "
                                            :is-box-shadow="true"
                                            style="width: 35px; height: 35px; margin-left: 8px"
                                            :title="local('Save Permission Group')"
                                            @click="savePermissionGroup(group)"
                                        >
                                            <i class="ms-Icon ms-Icon--Save"></i>
                                        </fv-button>
                                    </div>
                                </div>

                                <div class="permission-row">
                                    <p class="label">{{ local('Permissions') }}</p>
                                    <div class="permission-boxes">
                                        <fv-check-box
                                            :model-value="group.permissionState.read"
                                            :theme="theme"
                                            background="rgba(140, 148, 228, 1)"
                                            :disabled="!ds_lock.permission_groups || !isOwner"
                                            @update:modelValue="
                                                onPermissionToggle(group, 'read', $event)
                                            "
                                        >
                                            {{ local('Read') }}
                                        </fv-check-box>
                                        <fv-check-box
                                            :model-value="group.permissionState.write"
                                            :theme="theme"
                                            background="rgba(140, 148, 228, 1)"
                                            :disabled="!ds_lock.permission_groups || !isOwner"
                                            @update:modelValue="
                                                onPermissionToggle(group, 'write', $event)
                                            "
                                        >
                                            {{ local('Write') }}
                                        </fv-check-box>
                                        <fv-check-box
                                            :model-value="group.permissionState.delete"
                                            :theme="theme"
                                            background="rgba(140, 148, 228, 1)"
                                            :disabled="!ds_lock.permission_groups || !isOwner"
                                            @update:modelValue="
                                                onPermissionToggle(group, 'delete', $event)
                                            "
                                        >
                                            {{ local('Delete') }}
                                        </fv-check-box>
                                        <fv-check-box
                                            :model-value="group.permissionState.manage"
                                            :theme="theme"
                                            background="rgba(140, 148, 228, 1)"
                                            :disabled="!ds_lock.permission_groups || !isOwner"
                                            @update:modelValue="
                                                onPermissionToggle(group, 'manage', $event)
                                            "
                                        >
                                            {{ local('Permission Manage') }}
                                        </fv-check-box>
                                    </div>
                                    <p class="permission-code">
                                        {{ local('Current Code') }}: {{ group.permissionCode }}
                                    </p>
                                </div>

                                <div v-show="canManageGroupUsers(group)" class="users-block">
                                    <div class="section-header mini">
                                        <p class="label">{{ local('Group Users') }}</p>
                                        <div class="mini-status">
                                            <i
                                                v-if="group.loadingUsers"
                                                class="ms-Icon ms-Icon--Sync rotating"
                                            ></i>
                                            <p v-else>{{ group.users.length }}</p>
                                        </div>
                                    </div>

                                    <fv-list-view
                                        :model-value="group.users"
                                        :theme="theme"
                                        :rowHeight="64"
                                        :choosen-background="'rgba(142, 148, 225, 0.1)'"
                                        style="width: 100%; height: auto; margin-top: 8px"
                                    >
                                        <template v-slot:listItem="x">
                                            <div class="user-row">
                                                <div class="user-info">
                                                    <user-avatar
                                                        :model-value="x.item.userId"
                                                    ></user-avatar>
                                                    <div class="user-content-info">
                                                        <p class="user-name">
                                                            {{ x.item.displayName }}
                                                        </p>
                                                        <p class="user-sub">
                                                            {{
                                                                x.item.emailDisplay || x.item.userId
                                                            }}
                                                        </p>
                                                        <p class="user-role">
                                                            {{
                                                                x.item.userRole === 'manager'
                                                                    ? local('Manager')
                                                                    : local('Member')
                                                            }}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div class="user-actions">
                                                    <fv-toggle-switch
                                                        :model-value="
                                                            x.item.userRole === 'manager'
                                                        "
                                                        :disabled="
                                                            !canEditGroupUserRole(group, x.item)
                                                        "
                                                        width="95"
                                                        height="30"
                                                        :on="local('Manager')"
                                                        :off="local('Member')"
                                                        :onForeground="
                                                            theme === 'dark' ? '#fff' : '#000'
                                                        "
                                                        :offForeground="
                                                            theme === 'dark' ? '#fff' : '#000'
                                                        "
                                                        :switch-on-background="
                                                            'rgba(140, 148, 228, 1)'
                                                        "
                                                        :insideContent="true"
                                                        @update:modelValue="
                                                            onGroupUserRoleToggle(
                                                                group,
                                                                x.item,
                                                                $event
                                                            )
                                                        "
                                                    >
                                                    </fv-toggle-switch>
                                                </div>
                                                <fv-button
                                                    v-show="isOwner"
                                                    theme="dark"
                                                    background="rgba(200, 76, 76, 1)"
                                                    :border-radius="6"
                                                    :is-box-shadow="true"
                                                    class="remove-user-btn"
                                                    :disabled="x.item.savingRole"
                                                    :title="local('Remove Group User')"
                                                    @click="removeGroupUser($event, group, x.item)"
                                                >
                                                    <i
                                                        class="ms-Icon ms-Icon--Delete"
                                                        style="color: whitesmoke"
                                                    ></i>
                                                </fv-button>
                                            </div>
                                        </template>
                                    </fv-list-view>
                                </div>
                            </div>
                        </fv-collapse>
                    </div>

                    <div v-else class="section-block empty-block">
                        <p>
                            {{
                                local(
                                    'Create the data source first, then manage permission groups.'
                                )
                            }}
                        </p>
                    </div>
                </div>
            </template>
            <template v-slot:control>
                <fv-button
                    v-show="isOwner || !isEditMode"
                    theme="dark"
                    background="rgba(140, 148, 228, 1)"
                    :border-radius="6"
                    :disabled="name.trim() === ''"
                    @click="submitSource"
                >
                    {{ local('Confirm') }}
                </fv-button>
                <fv-button
                    :theme="theme"
                    :border-radius="6"
                    style="margin-left: 5px"
                    @click="thisShow = false"
                >
                    {{ local('Cancel') }}
                </fv-button>
            </template>
        </float-window-base>

        <group-user-panel
            v-model="showUserPanel"
            :theme="theme"
            :local="local"
            :group="activeGroup"
            @add-user="confirmAddGroupUser"
        ></group-user-panel>
        <group-invite-panel
            v-model="showInvitePanel"
            :theme="theme"
            :local="local"
            :group="activeGroup"
            @generate-invite="handleGenerateInviteCode"
        ></group-invite-panel>
    </div>
</template>

<script>
import floatWindowBase from '@/components/window/floatWindowBase.vue'
import groupUserPanel from './groupUserPanel.vue'
import groupInvitePanel from './groupInvitePanel.vue'
import userAvatar from '@/components/general/userAvatar.vue'

import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { mapState, mapActions } from 'pinia'

export default {
    components: {
        floatWindowBase,
        groupUserPanel,
        groupInvitePanel,
        userAvatar
    },
    props: {
        show: {
            default: false
        },
        mode: {
            default: 'add'
        },
        source: {
            default: () => null
        }
    },
    data() {
        return {
            thisShow: this.show,
            name: '',
            permissionGroups: [],
            showUserPanel: false,
            showInvitePanel: false,
            activeGroupId: null,
            lock: {
                permissionGroups: true
            }
        }
    },
    watch: {
        show(val) {
            this.thisShow = val
            if (val) {
                this.initializeEditor()
            }
        },
        thisShow(val) {
            this.$emit('update:show', val)
            if (!val) {
                this.resetTransientState()
            }
        },
        showUserPanel(val) {
            if (!val) {
                if (!this.showInvitePanel) {
                    this.activeGroupId = null
                }
            }
        },
        showInvitePanel(val) {
            if (!val) {
                if (!this.showUserPanel) {
                    this.activeGroupId = null
                }
            }
        },
        source: {
            handler() {
                if (this.thisShow) {
                    this.initializeEditor()
                }
            },
            deep: true
        }
    },
    computed: {
        ...mapState(useTheme, {
            theme: 'theme',
            color: 'color'
        }),
        ...mapState(useAppConfig, ['local']),
        ...mapState(useDataStore, {
            ds_lock: (state) => state.lock
        }),
        ...mapState(useUserStore, {
            userInfo: (state) => state.info
        }),
        isEditMode() {
            return this.mode === 'edit'
        },
        currentSource() {
            return this.source || {}
        },
        isOwner() {
            if (!this.userInfo.id) return false
            return this.currentSource.userId === this.userInfo.id
        },
        dialogTitle() {
            if (!this.isEditMode) return this.local('New Data Source')
            return `Edit Data Source (${this.currentSource.name || ''})`
        },
        inputPlaceholder() {
            if (!this.isEditMode) return this.local('New Data Source Name')
            return this.local('Data Source Name')
        },
        activeGroup() {
            return this.permissionGroups.find((item) => item.id === this.activeGroupId) || null
        }
    },
    methods: {
        ...mapActions(useDataStore, {
            addDataSource: 'addDataSource',
            getDataPath: 'getDataPath',
            reviseDataSource: 'reviseDataSource',
            listVisibleSourcePermissionGroups: 'listVisibleSourcePermissionGroups',
            createSourcePermissionGroup: 'createSourcePermissionGroup',
            updateSourcePermissionGroup: 'updateSourcePermissionGroup',
            removeSourcePermissionGroup: 'removeSourcePermissionGroup',
            createSourcePermissionGroupInvite: 'createSourcePermissionGroupInvite',
            listSourcePermissionGroupUsers: 'listSourcePermissionGroupUsers',
            createSourcePermissionGroupUser: 'createSourcePermissionGroupUser',
            updateSourcePermissionGroupUser: 'updateSourcePermissionGroupUser',
            removeSourcePermissionGroupUser: 'removeSourcePermissionGroupUser'
        }),
        resetTransientState() {
            this.name = ''
            this.permissionGroups = []
            this.showUserPanel = false
            this.showInvitePanel = false
            this.activeGroupId = null
            this.lock.permissionGroups = true
        },
        async initializeEditor() {
            this.name = this.isEditMode ? this.currentSource.name || '' : ''
            this.showUserPanel = false
            this.showInvitePanel = false
            this.activeGroupId = null

            if (this.isEditMode && this.currentSource.id) {
                await this.loadPermissionGroups()
            } else {
                this.permissionGroups = []
            }
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
        normalizeUserRole(role = 'member') {
            const normalized = (role || '').toString().trim().toLowerCase()
            if (normalized === 'manager') return 'manager'
            return 'member'
        },
        canManageGroupUsers(group) {
            if (!group?.id) return false
            return this.isOwner || this.normalizeUserRole(group.userRole) === 'manager'
        },
        canEditGroupUserRole(group, userItem) {
            if (!this.canManageGroupUsers(group)) return false
            if (!userItem?.relationId || userItem.savingRole) return false
            if (!userItem.userId || userItem.userId === this.userInfo.id) return false
            return this.normalizeUserRole(userItem.userRole) !== 'owner'
        },
        resolvePermissionGroupId(item) {
            return item?.id || item?.groupId || ''
        },
        normalizePermissionGroup(item, index) {
            const groupId = this.resolvePermissionGroupId(item)
            const permissionCode = this.normalizePermissionCode(item.permissionCode)
            return {
                ...item,
                id: groupId,
                key: groupId || `group-${index}`,
                expanded: false,
                loadingUsers: false,
                savingPermission: false,
                savingGroup: false,
                usersLoaded: false,
                users: [],
                nameDraft: item.name || '',
                userRole: this.normalizeUserRole(item.userRole),
                permissionCode,
                permissionState: this.permissionCodeToState(permissionCode)
            }
        },
        normalizeGroupUser(item, index) {
            const profile = item.user || item.userInfo || {}
            const userId = item.userId || profile.id || item.id || ''
            const relationId = item.relationId || item.userRelationId || item.id || userId
            return {
                ...item,
                key: relationId || `group-user-${index}`,
                relationId,
                userId,
                userRole: this.normalizeUserRole(item.userRole),
                savingRole: false,
                displayName:
                    item.userName ||
                    item.nickname ||
                    item.name ||
                    profile.userName ||
                    profile.nickname ||
                    profile.name ||
                    profile.email ||
                    userId,
                emailDisplay: item.email || profile.email || ''
            }
        },
        async loadPermissionGroups() {
            if (!this.currentSource.id || !this.lock.permissionGroups) return
            this.lock.permissionGroups = false
            const res = await this.listVisibleSourcePermissionGroups(
                this.currentSource.id,
                this.isOwner
            )
            if (res && res.code === 200) {
                const list = Array.isArray(res.data) ? res.data : []
                this.permissionGroups = list.map((item, index) =>
                    this.normalizePermissionGroup(item, index)
                )
            }
            this.lock.permissionGroups = true
        },
        async createPermissionGroup() {
            if (!this.currentSource.id || !this.lock.permissionGroups) return
            const defaultName = `Group ${this.permissionGroups.length + 1}`
            const res = await this.createSourcePermissionGroup(this.currentSource.id, {
                name: defaultName,
                description: '',
                permissionCode: '0000'
            })
            if (res && res.code === 200) {
                await this.loadPermissionGroups()
                const createdId = res.data?.id
                const createdGroup = this.permissionGroups.find((item) => item.id === createdId)
                if (createdGroup) {
                    createdGroup.expanded = true
                }
            }
        },
        async savePermissionGroup(group) {
            if (!group || group.savingGroup || !group.id) return
            const name = (group.nameDraft || '').trim()
            if (name === '') {
                group.nameDraft = group.name || ''
                return
            }
            if (name === group.name) return
            group.savingGroup = true
            const res = await this.updateSourcePermissionGroup(this.currentSource.id, group.id, {
                name,
                description: group.description,
                permissionCode: group.permissionCode
            })
            if (res && res.code === 200) {
                group.name = name
                group.nameDraft = name
            } else {
                group.nameDraft = group.name || ''
            }
            group.savingGroup = false
        },
        removePermissionGroup(event, group) {
            event.stopPropagation()
            this.$infoBox(this.local('Are you sure to remove this permission group?'), {
                status: 'warning',
                title: this.local('Remove Permission Group'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    const res = await this.removeSourcePermissionGroup(
                        this.currentSource.id,
                        group.id
                    )
                    if (res && res.code === 200) {
                        if (this.activeGroupId === group.id) {
                            this.showUserPanel = false
                            this.showInvitePanel = false
                        }
                        await this.loadPermissionGroups()
                    }
                },
                cancel: () => {}
            })
        },
        async handleGroupExpand(group, expanded) {
            group.expanded = expanded
            if (expanded && this.canManageGroupUsers(group)) {
                await this.ensureGroupUsers(group)
            }
        },
        async ensureGroupUsers(group, force = false) {
            if (!group || !group.id || group.loadingUsers) return
            if (group.usersLoaded && !force) return
            group.loadingUsers = true
            const res = await this.listSourcePermissionGroupUsers(
                this.currentSource.id,
                group.id,
                0,
                100
            )
            if (res && res.code === 200) {
                const list = Array.isArray(res.data) ? res.data : []
                group.users = list.map((item, index) => this.normalizeGroupUser(item, index))
                group.usersLoaded = true
            }
            group.loadingUsers = false
        },
        async onPermissionToggle(group, key, value) {
            if (!group || group.savingPermission) return
            const previousState = {
                ...group.permissionState
            }
            group.permissionState = {
                ...group.permissionState,
                [key]: value
            }
            group.savingPermission = true
            const permissionCode = this.permissionStateToCode(group.permissionState)
            const res = await this.updateSourcePermissionGroup(this.currentSource.id, group.id, {
                name: (group.nameDraft || group.name || '').trim(),
                description: group.description,
                permissionCode
            })
            if (res && res.code === 200) {
                group.permissionCode = permissionCode
                group.name = (group.nameDraft || group.name || '').trim()
            } else {
                group.permissionState = previousState
                group.permissionCode = this.permissionStateToCode(previousState)
            }
            group.savingPermission = false
        },
        openAddUserPanel(event, group) {
            event.stopPropagation()
            this.activeGroupId = group.id
            this.showUserPanel = true
        },
        openInvitePanel(event, group) {
            event.stopPropagation()
            this.activeGroupId = group.id
            this.showInvitePanel = true
        },
        async handleGenerateInviteCode({ group, expireDays, onSuccess }) {
            if (!group?.id || !this.currentSource.id || !this.canManageGroupUsers(group)) return
            const res = await this.createSourcePermissionGroupInvite(
                this.currentSource.id,
                group.id,
                expireDays
            )
            if (res && res.code === 200) {
                const inviteCode = res.data?.inviteCode || res.data?.code || res.data || ''
                if (typeof onSuccess === 'function') {
                    await onSuccess(inviteCode)
                }
            }
        },
        async confirmAddGroupUser(selectedUser) {
            if (!selectedUser || !this.activeGroup || !this.canManageGroupUsers(this.activeGroup))
                return
            const res = await this.createSourcePermissionGroupUser(
                this.currentSource.id,
                this.activeGroup.id,
                selectedUser.userId
            )
            if (res && res.code === 200) {
                await this.ensureGroupUsers(this.activeGroup, true)
                this.showUserPanel = false
            }
        },
        async onGroupUserRoleToggle(group, userItem, value) {
            if (!this.canEditGroupUserRole(group, userItem)) return
            const nextUserRole = value ? 'manager' : 'member'
            const previousUserRole = userItem.userRole
            if (nextUserRole === previousUserRole) return
            userItem.userRole = nextUserRole
            userItem.savingRole = true
            const res = await this.updateSourcePermissionGroupUser(
                this.currentSource.id,
                group.id,
                userItem.relationId,
                {
                    userId: userItem.userId,
                    userRole: nextUserRole
                }
            )
            if (res && res.code === 200) {
                userItem.userRole = nextUserRole
            } else {
                userItem.userRole = previousUserRole
            }
            userItem.savingRole = false
        },
        removeGroupUser(event, group, userItem) {
            event.stopPropagation()
            this.$infoBox(this.local('Are you sure to remove this group user?'), {
                status: 'warning',
                title: this.local('Remove Group User'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    const res = await this.removeSourcePermissionGroupUser(
                        this.currentSource.id,
                        group.id,
                        userItem.relationId
                    )
                    if (res && res.code === 200) {
                        await this.ensureGroupUsers(group, true)
                    }
                },
                cancel: () => {}
            })
        },
        async submitSource() {
            if (this.name.trim() === '') return
            if (this.isEditMode) {
                if (!this.currentSource.id) return
                if (this.name.trim() === (this.currentSource.name || '').trim()) {
                    this.$emit('finished')
                    this.thisShow = false
                    return
                }
                const res = await this.reviseDataSource(this.currentSource.id, this.name.trim())
                if (res && res.code === 200) {
                    this.$emit('finished')
                    this.getDataPath()
                    this.thisShow = false
                }
                return
            }

            const res = await this.addDataSource(this.name.trim())
            if (res && res.code === 200) {
                this.$emit('finished')
                this.getDataPath()
                this.thisShow = false
            }
        }
    }
}
</script>

<style lang="scss">
.source-editor {
    position: relative;
    width: 100%;
    max-height: 70vh;
    padding-right: 5px;
    overflow: auto;

    .section-block {
        margin-bottom: 18px;
    }

    .section-header {
        @include HbetweenVcenter;

        width: 100%;

        &.mini {
            align-items: center;
        }
    }

    .section-title {
        font-size: 13px;
        font-weight: bold;
    }

    .source-id {
        margin-top: 8px;
        font-size: 12px;
        opacity: 0.7;
    }

    .action-row {
        @include Vcenter;
    }

    .group-header-actions {
        @include Vcenter;
    }

    .group-name-row {
        padding-bottom: 12px;
        border-bottom: rgba(123, 139, 209, 0.15) solid 1px;
    }

    .group-name-actions {
        @include Vcenter;

        width: 100%;
        margin-top: 10px;
    }

    .empty-block {
        padding: 10px 0px;
        font-size: 12px;
        opacity: 0.75;
    }

    .group-content {
        padding: 5px 0px 10px;
    }

    .permission-row {
        padding: 12px 0px;
        border-bottom: rgba(123, 139, 209, 0.15) solid 1px;

        .permission-boxes {
            display: flex;
            flex-wrap: wrap;
            gap: 18px;
            margin-top: 10px;
        }

        .permission-code {
            margin-top: 10px;
            font-size: 12px;
            opacity: 0.75;
        }
    }

    .label {
        font-size: 12px;
        font-weight: bold;
    }

    .users-block {
        margin-top: 14px;

        .mini-status {
            @include Vcenter;

            min-width: 20px;
            justify-content: flex-end;
            font-size: 12px;
            opacity: 0.7;
        }

        .user-row {
            @include HbetweenVcenter;

            width: 100%;
            height: 100%;
            padding: 0px 10px 0px 5px;
            box-sizing: border-box;

            .user-info {
                @include Vcenter;

                flex: 1;
                gap: 15px;
                overflow: hidden;

                .user-content-info {
                    @include VcenterC;

                    .user-name {
                        font-size: 13px;
                        font-weight: bold;
                    }

                    .user-sub {
                        margin-top: 3px;
                        font-size: 10px;
                        opacity: 0.75;
                    }

                    .user-role {
                        margin-top: 4px;
                        font-size: 10px;
                        opacity: 0.75;
                    }
                }
            }

            .user-actions {
                @include Vcenter;

                margin-left: 10px;
            }

            .remove-user-btn {
                width: 35px;
                height: 35px;
                margin-left: 10px;
            }
        }
    }

    .rotating {
        animation: source-editor-rotate 1s linear infinite;
    }
}

@keyframes source-editor-rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>
