<template>
    <callout-base
        v-if="users.length"
        v-model:show="show"
        title="Collaborators"
        :theme="theme"
        :popperClass="['fabulous-collaborator-callout']"
    >
        <template v-slot:trigger>
            <div class="direct-display-avatar">
                <user-avatar
                    v-for="user in users"
                    :key="user.id"
                    :model-value="user.id"
                    :size="28"
                ></user-avatar>
            </div>
        </template>
        <template v-slot:header>
            <p
                style="font-size: 12px"
                :style="{
                    color: theme === 'dark' ? 'rgba(133, 148, 211, 1)' : ''
                }"
            >
                {{ local('Collaborators') }}
            </p>
        </template>
        <template v-slot:content>
            <div class="collaborator-avatar-list">
                <user-avatar
                    v-for="user in users"
                    :key="user.id"
                    :model-value="user.id"
                    :size="36"
                    :info-title="local('Collaborator')"
                    :show-info="true"
                ></user-avatar>
            </div>
        </template>
    </callout-base>
</template>

<script>
import { useAppConfig } from '@/stores/appConfig'
import { useTheme } from '@/stores/theme'
import { mapState } from 'pinia'

import calloutBase from '@/components/general/callout/calloutBase.vue'
import userAvatar from '@/components/general/userAvatar.vue'

export default {
    components: { calloutBase, userAvatar },
    props: {
        users: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return { show: false }
    },
    computed: {
        ...mapState(useAppConfig, ['local']),
        ...mapState(useTheme, ['theme'])
    }
}
</script>

<style lang="scss">
.direct-display-avatar {
    max-width: 60px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    cursor: pointer;
}

.fabulous-collaborator-callout {
    div.main {
        width: 240px;
        max-width: calc(100vw - 32px);
        max-height: 300px;
        padding: 12px;
        box-sizing: border-box;
        overflow: auto;
    }

    .collaborator-avatar-list {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
    }
}
</style>
