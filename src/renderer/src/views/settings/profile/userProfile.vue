<template>
    <div class="user-profile-block">
        <fv-Persona
            :src="userInfo.avatar"
            :theme="theme"
            size="72"
            :showInfo="true"
            :name="displayName"
            @click.capture="isLogin ? (show.profile = true) : ''"
        >
            <template v-slot:name>
                <p>{{ displayName }}</p>
            </template>
            <template v-slot:secondary>
                <p>{{ displayEmail }}</p>
            </template>
        </fv-Persona>
        <div class="right-controller">
            <fv-button
                theme="dark"
                :background="isLogin ? color : gradient"
                :border-radius="6"
                :is-box-shadow="true"
                style="width: 120px"
                @click="isLogin ? logout() : login()"
                >{{ isLogin ? local(`Logout`) : local(`Login`) }}</fv-button
            >
        </div>
        <info-window v-model="show.profile"></info-window>
    </div>
</template>

<script>
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useUserStore } from '@/stores/user'
import { useTheme } from '@/stores/theme'
import { mapState, mapActions } from 'pinia'
import infoWindow from './infoWindow.vue'

export default {
    components: {
        infoWindow
    },
    props: {},
    data() {
        return {
            show: {
                profile: false
            }
        }
    },
    computed: {
        ...mapState(useUserStore, {
            userInfo: 'info'
        }),
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        ...mapState(useAppConfig, ['local']),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        }),
        ...mapState(useTheme, ['color', 'gradient']),
        isLogin() {
            return this.userInfo.id
        },
        displayName() {
            if (!this.isLogin) return this.local(`Guest`)
            if (this.userInfo.name) return this.userInfo.name
            if (this.userInfo.nickname) return this.userInfo.nickname
            return this.userInfo.id
        },
        displayEmail() {
            if (!this.isLogin) return this.local(`Local User`)
            return this.userInfo.email
        }
    },
    mounted() {},
    methods: {
        ...mapActions(useUserStore, ['setInfo', 'clearInfo']),
        login() {
            this.$Go('/login')
        },
        logout() {
            localStorage.removeItem('ApiToken')
            this.clearInfo()
            this.$Go('/login')
        }
    }
}
</script>

<style lang="scss">
.user-profile-block {
    @include HbetweenVcenter;

    position: relative;
    width: 100%;
    max-width: 1300px;
    height: auto;
    padding: 15px;
    box-sizing: border-box;

    .right-controller {
        @include Vcenter;
    }
}
</style>
