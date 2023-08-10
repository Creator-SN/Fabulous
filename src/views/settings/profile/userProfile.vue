<template>
    <div class="user-profile-block">
        <fv-Persona
            :src="userInfo.avatar"
            :theme="theme"
            size="72"
            :showInfo="true"
            :name="displayName"
            @click.native="isLogin ? show.profile = true : ''"
        >
            <template v-slot:name>
                <p>{{displayName}}</p>
            </template>
            <template v-slot:secondary>
                <p>{{displayEmail}}</p>
            </template>
        </fv-Persona>
        <div class="right-controller">
            <fv-button
                theme="dark"
                :background="isLogin ? color : gradient"
                :border-radius="6"
                :is-box-shadow="true"
                style="width: 120px;"
                @click="isLogin ? logout() : login()"
            >{{isLogin ? local(`Logout`) : local(`Login`)}}</fv-button>
        </div>
        <info-window v-model="show.profile"></info-window>
    </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex';
import infoWindow from './infoWindow.vue';

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
        };
    },
    computed: {
        ...mapState({
            userInfo: (state) => state.User.info,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath']),
        ...mapGetters('Theme', ['color', 'gradient']),
        isLogin() {
            return this.userInfo.id;
        },
        displayName() {
            if (!this.isLogin) return this.local(`Guest`);
            if (this.userInfo.name) return this.userInfo.name;
            if (this.userInfo.nickname) this.userInfo.nickname;
            return this.userInfo.id;
        },
        displayEmail() {
            if (!this.isLogin) return this.local(`Local User`);
            return this.userInfo.email;
        }
    },
    mounted() {},
    methods: {
        ...mapMutations('User', ['setInfo', 'clearInfo']),
        login() {
            this.$emit('switch-block', 'login');
        },
        logout() {
            localStorage.removeItem('ApiToken');
            this.clearInfo();
        }
    }
};
</script>

<style lang="scss">
.user-profile-block {
    @include HbetweenVcenter;

    position: relative;
    width: 100%;
    height: auto;
    padding: 15px;
    box-sizing: border-box;

    .right-controller {
        @include Vcenter;
    }
}
</style>