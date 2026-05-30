<template>
    <float-window-base
        v-model="thisValue"
        :theme="theme"
        :title="panelTitle"
        :width="720"
        :height="'min(600px, 90%)'"
    >
        <template v-slot:content>
            <div class="user-panel">
                <div class="search-row">
                    <fv-text-box
                        v-model="searchKeyword"
                        :theme="theme"
                        :placeholder="local('Search user by id, email, or name')"
                        underline
                        :border-width="2"
                        :border-color="'rgba(123, 139, 209, 0.4)'"
                        :focus-border-color="'rgba(123, 139, 209, 1)'"
                        :is-box-shadow="true"
                        style="flex: 1; height: 42px"
                        @debounce-input="emitSearch"
                    ></fv-text-box>
                    <fv-button
                        theme="dark"
                        background="rgba(140, 148, 228, 1)"
                        :disabled="!lock.userSearch"
                        :is-box-shadow="true"
                        style="width: 42px; height: 42px; margin-left: 8px"
                        :title="local('Search Users')"
                        @click="emitSearch(searchKeyword)"
                    >
                        <fv-progress-ring
                            v-if="!lock.userSearch"
                            :loading="true"
                            :color="'whitesmoke'"
                            :r="10"
                            :border-width="2"
                            background="rgba(255, 255, 255, 0.6)"
                        ></fv-progress-ring>
                        <i v-else class="ms-Icon ms-Icon--Search"></i>
                    </fv-button>
                </div>

                <div class="search-result-tip">
                    <p>{{ local('Search Results') }}: {{ searchResults.length }}</p>
                </div>

                <fv-details-list
                    :model-value="searchResults"
                    :head="searchResultHeads"
                    :theme="theme"
                    :foreground="color"
                    :head-background="
                        theme === 'dark' ? 'rgba(36, 36, 36, 0.96)' : 'rgba(255, 255, 255, 0.96)'
                    "
                    ref="table"
                    :compact="true"
                    style="width: 100%; height: 360px"
                    @choose-items="handleChooseItems"
                >
                    <template v-slot:column_0="{ item }">
                        <p class="details-cell strong">{{ item.displayName }}</p>
                    </template>
                    <template v-slot:column_1="{ item }">
                        <p class="details-cell">{{ item.emailDisplay || '-' }}</p>
                    </template>
                    <template v-slot:column_2="{ item }">
                        <p class="details-cell" :class="{ added: item.alreadyAdded }">
                            {{ item.alreadyAdded ? local('Already Added') : local('Available') }}
                        </p>
                    </template>
                    <template v-slot:column_3="{ item }">
                        <p class="details-cell">{{ item.userId }}</p>
                    </template>
                </fv-details-list>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(140, 148, 228, 1)"
                :disabled="
                    !selectedUser ||
                    selectedUser.alreadyAdded ||
                    !ds_lock.permission_group_user_update
                "
                :is-box-shadow="true"
                @click="emitAddUser"
            >
                {{ local('Add User') }}
            </fv-button>
            <fv-button
                :theme="theme"
                :is-box-shadow="true"
                style="margin-left: 5px"
                @click="thisValue = false"
            >
                {{ local('Close') }}
            </fv-button>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from '@/components/window/floatWindowBase.vue'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { mapActions, mapState } from 'pinia'

export default {
    components: {
        floatWindowBase
    },
    props: {
        modelValue: {
            default: false
        },
        theme: {
            default: 'light'
        },
        local: {
            default: () => {}
        },
        group: {
            default: null
        }
    },
    emits: ['update:modelValue', 'add-user'],
    data() {
        return {
            thisValue: this.modelValue,
            searchKeyword: '',
            selectedUsers: [],
            searchResults: [],
            lock: {
                userSearch: true
            },
            searchResultHeads: [
                {
                    content: 'Name',
                    width: 150,
                    minWidth: 120
                },
                {
                    content: 'Email',
                    width: 200,
                    minWidth: 160
                },

                {
                    content: 'Status',
                    width: 150,
                    minWidth: 100
                },
                {
                    content: 'User ID',
                    width: 150,
                    minWidth: 100
                }
            ]
        }
    },
    watch: {
        modelValue(val) {
            this.thisValue = val
            if (val && this.$refs.table) {
                this.$refs.table.headInit()
            }
        },
        thisValue(val) {
            this.$emit('update:modelValue', val)
        },
        group() {
            this.searchKeyword = ''
            this.selectedUsers = []
            this.searchResults = []
            this.lock.userSearch = true
        }
    },
    computed: {
        ...mapState(useTheme, ['color']),
        ...mapState(useDataStore, {
            ds_lock: (state) => state.lock
        }),
        panelTitle() {
            if (!this.group) return this.local('Add Group User')
            return `${this.local('Add Group User')} - ${this.group.name || ''}`
        },
        selectedUser() {
            return this.selectedUsers[0] || null
        }
    },
    methods: {
        ...mapActions(useDataStore, {
            searchUsers: 'searchUsers'
        }),
        async emitSearch(searchKeyword) {
            const keyword = searchKeyword.trim()
            if (!keyword || !this.group || !this.lock.userSearch) return
            this.lock.userSearch = false
            const res = await this.searchUsers(keyword, 30)
            if (res && res.code === 200) {
                const list = Array.isArray(res.data) ? res.data : []
                const userIds = (this.group.users || []).map((item) => item.userId)
                this.searchResults = list.map((item) => {
                    const userId = item.id || item.userId || ''
                    return {
                        ...item,
                        userId,
                        displayName: item.name || item.nickname || item.email || userId,
                        emailDisplay: item.email || '',
                        alreadyAdded: userIds.includes(userId)
                    }
                })
            }
            this.selectedUsers = []
            this.lock.userSearch = true
        },
        handleChooseItems(items) {
            this.selectedUsers = Array.isArray(items) ? items : []
        },
        emitAddUser() {
            if (!this.selectedUser || this.selectedUser.alreadyAdded) return
            this.$emit('add-user', this.selectedUser)
        }
    }
}
</script>

<style lang="scss">
.user-panel {
    width: 100%;
    height: 100%;
}

.search-row {
    @include Vcenter;

    width: 100%;
}

.search-result-tip {
    margin: 12px 0px 8px;
    font-size: 12px;
    opacity: 0.75;
}

.details-cell {
    width: 100%;
    padding: 0px 8px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.strong {
        font-weight: bold;
    }

    &.added {
        color: rgba(0, 158, 98, 1);
    }
}

.rotating {
    animation: group-user-panel-rotate 1s linear infinite;
}

@keyframes group-user-panel-rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>
