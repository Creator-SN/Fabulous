<template>
    <div
        class="personal-info-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div class="block-1">
            <div style="width: 100%; display: flex; flex-direction: column">
                <fv-persona
                    :src="userInfo.avatar"
                    size="60"
                    :theme="theme"
                    :name="displayName"
                    :showInfo="true"
                    @click.native="showAvatar ^= true"
                >
                    <template v-slot:name>
                        <span class="email-info">
                            <i class="ms-Icon ms-Icon--Mail"></i>
                            <p style="margin-left: 5px;">{{obj.email}}</p>
                        </span>
                    </template>
                    <template v-slot:secondary>
                        <fv-button
                            theme="dark"
                            :background="gradient"
                            :border-radius="6"
                            reveal-border-color="rgba(0, 0, 0, 0.1)"
                            :is-box-shadow="true"
                            @click="handlerAvatarInputClick"
                            style="width: 120px; margin-top: 10px;"
                        >{{local('Select Picture')}}</fv-button>
                    </template>
                </fv-persona>
            </div>
            <div style="width: 100%; margin-top: 15px; display: flex; flex-direction: column">
                <div class="personal-info-block">
                    <transition name="show-top-to-bottom">
                        <div v-show="showAvatar">
                            <choose-avatar
                                ref="avatar"
                                :disabled-confirm="!lock.avatar || !cuttingAvatar"
                                @update-base64="cuttingAvatar = $event"
                                @confirm="UploadAvatar"
                            >
                            </choose-avatar>
                        </div>
                    </transition>
                    <div
                        v-show="false"
                        class="row"
                    >
                        <p class="s1">{{local('Email')}}</p>
                        <fv-text-box
                            :disabled="true"
                            ref="nameinput"
                            v-model="obj.email"
                            :theme="theme"
                            underline
                            :border-color="'rgba(200, 200, 200, 1)'"
                            :focus-border-color="color"
                            :border-width="2"
                        ></fv-text-box>
                    </div>
                    <div class="row">
                        <p class="s1">{{local('Nick Name')}}</p>
                        <fv-text-box
                            :disabled="!isedit"
                            v-model="obj.nickname"
                            :theme="theme"
                            underline
                            :border-color="'rgba(200, 200, 200, 1)'"
                            :focus-border-color="color"
                            :border-width="2"
                        ></fv-text-box>
                    </div>
                    <div class="row">
                        <p class="s1">{{local('Real Name')}}</p>
                        <fv-text-box
                            :disabled="!isedit"
                            v-model="obj.name"
                            :theme="theme"
                            underline
                            :border-color="'rgba(200, 200, 200, 1)'"
                            :focus-border-color="color"
                            :border-width="2"
                        ></fv-text-box>
                    </div>
                    <div class="row">
                        <p class="s1">{{local('Apply Time')}}</p>
                        <fv-text-box
                            disabled="true"
                            :theme="theme"
                            :value="$SDate.Format('YYYY-mm-dd HH:MM', new Date(obj.createDate))"
                        ></fv-text-box>
                    </div>
                </div>
            </div>
            <div style="width: 100%; display: flex; justify-content: space-around; margin-top: 25px">
                <fv-button
                    v-show="!isedit"
                    theme="dark"
                    :background="gradient"
                    :border-radius="6"
                    :is-box-shadow="true"
                    style="width: 250px;"
                    @click="isedit = true"
                >{{local('Edit')}}</fv-button>
                <fv-button
                    v-show="isedit"
                    theme="dark"
                    :background="color"
                    :border-radius="6"
                    :is-box-shadow="true"
                    style="width: 250px;"
                    @click="setInformation()"
                >{{local('Accept Changes')}}</fv-button>
            </div>
        </div>
    </div>
</template>

<script>
import chooseAvatar from './chooseAvatar.vue';

import { mapGetters, mapState, mapMutations, mapActions } from 'vuex';

export default {
    name: 'u_info',
    components: {
        chooseAvatar
    },
    props: {
        refresh: {
            default: false
        }
    },
    data() {
        return {
            obj: {
                id: '',
                username: '',
                nickName: ''
            },
            isedit: false,
            cuttingAvatar: null,
            showAvatar: false,
            lock: {
                avatar: true
            }
        };
    },
    watch: {
        refresh() {
            this.getInfo();
            this.getInformation();
        }
    },
    computed: {
        ...mapGetters(['local', 'currentDataPath']),
        ...mapGetters('Theme', ['color', 'gradient']),
        ...mapState({
            userInfo: (state) => state.User.info,
            theme: (state) => state.config.theme
        }),
        isLogin() {
            return this.userInfo.id;
        },
        displayName() {
            if (!this.isLogin) return this.local(`Guest`);
            if (this.obj.name) return this.obj.name;
            if (this.obj.nickname) this.obj.nickname;
            return this.obj.id;
        },
        displayEmail() {
            if (!this.isLogin) return this.local(`Local User`);
            return this.obj.email;
        }
    },
    mounted() {
        this.getInfo();
    },
    methods: {
        ...mapMutations('User', {
            setInfo: 'setInfo'
        }),
        ...mapActions('User', ['getInfo']),
        getdate(date) {
            this.obj.birthday =
                date.year.toString() +
                '/' +
                date.month.toString() +
                '/' +
                date.date.toString();
        },
        DatePickerFormat(date) {
            this.$refs.datePicker.day.year = date.getFullYear();
            this.$refs.datePicker.day.month = date.getMonth() + 1;
            this.$refs.datePicker.day.date = date.getDate();
            this.$refs.datePicker.dateFormat();
        },
        getInformation() {
            this.$api.UserController.getMyUserInfo()
                .then((response) => {
                    this.obj = response.data;
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        setInformation() {
            this.$api.UserController.updateMyUserInfo(this.obj)
                .then(() => {
                    this.$barWarning(
                        this.local('Successfully Revised Information'),
                        {
                            status: 'correct'
                        }
                    );
                    this.isedit = false;
                    this.getInfo();
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        handlerAvatarInputClick(event) {
            event.stopPropagation();
            this.showAvatar = true;
            this.$refs.avatar.inputClick();
        },
        async getAvatar() {
            if (this.userInfo.id) {
                this.$api.UserController.getAvatar(this.userInfo.id)
                    .then((res) => {
                        if (res.code == 200)
                            this.setInfo({
                                avatar: res.data ? res.data : null
                            });
                    })
                    .catch(() => {});
            }
        },
        UploadAvatar() {
            if (!this.lock.avatar) {
                this.$barWarning(this.local('Uploading'), {
                    status: 'warning'
                });
                return;
            }
            if (!this.cuttingAvatar)
                this.$barWarning(this.local('No Picture Selected'), {
                    status: 'warning'
                });
            else {
                this.lock.avatar = false;
                this.$api.UserController.updateMyAvatar({
                    avatar: this.cuttingAvatar
                })
                    .then((data) => {
                        if (data.code == 200) {
                            this.$barWarning(
                                this.local('Successfully Revised Avatar'),
                                {
                                    status: 'correct'
                                }
                            );
                            this.showAvatar = false;
                            this.getAvatar();
                        }
                        this.lock.avatar = true;
                    })
                    .catch((res) => {
                        if (res.message) {
                            this.$barWarning(res.message, {
                                status: 'warning'
                            });
                        }
                        this.lock.avatar = true;
                    });
            }
        }
    }
};
</script>

<style lang="scss">
.personal-info-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0px calc(50% - 640px);
    box-sizing: border-box;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .block-1 {
        position: relative;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        overflow: auto;

        .control-banner {
            @include Vcenter;

            font-size: 24px;
        }

        .email-info {
            @include Vcenter;

            margin-top: 5px;
        }
    }

    &.dark {
        .personal-info-block {
            div {
                &.row {
                    &:hover {
                        background: rgba(255, 255, 255, 0.1);
                    }
                }
            }
        }
    }

    .personal-info-block {
        position: relative;
        width: 100%;
        line-height: 2.5;

        div {
            &.row {
                position: relative;
                width: 100%;
                height: auto;
                flex: 1;
                padding: 8px;
                border-radius: 6px;
                box-sizing: border-box;
                transition: all 0.3s;

                &:hover {
                    background: white;
                    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.1);
                }
                .s1 {
                    width: 100%;
                    font-size: 15px;
                    font-weight: bold;
                    color: rgba(75, 75, 75, 1);
                    display: flex;
                    align-items: center;
                }

                .row-block {
                    @include Vcenter;

                    .top-up-btn {
                        height: 45px;
                        margin: 5px 5px 5px 0px;
                    }
                }

                .Ali-pay-block {
                    @include HcenterVcenter;

                    position: relative;
                    width: 100%;
                    height: 200px;
                    margin-top: 5px;
                }
            }
        }
        .info-gender {
            margin: 0px 5px;
            font-size: 24px;
            display: flex;
            align-items: center;
            transition: all 0.3s;
            &.choose {
                font-weight: bold;
            }
        }
    }
}

.panel-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 15px 15px 55px 15px;
    color: rgba(28, 30, 41, 1);

    .panel-title {
        font-size: 12px;
    }
}

.show-top-to-bottom-enter-active,
.show-top-to-bottom-leave-active {
    transform-origin: 50% 0%;
    transition: all 0.3s;
}

.show-top-to-bottom-enter, .show-top-to-bottom-leave-to
/* .show-enter-active, .show-leave-active */ {
    opacity: 0;
    max-height: 0px;
    transform: scaleY(0);
}

.show-top-to-bottom-enter-to, .show-top-to-bottom-leave
/* .show-enter-to, .show-leave */ {
    opacity: 1;
    max-height: auto;
    transform: scaleY(1);
}
</style>
