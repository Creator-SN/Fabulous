<template>
    <div class="apply-block">
        <transition name="scale-up-to-up">
            <fv-progress-bar
                v-show="Apply.Lock"
                :loading="true"
                :foreground="color"
                style="position: absolute; left: 0px; top: 0px; width: 100%;"
            ></fv-progress-bar>
        </transition>
        <div class="d-1">
            <p>{{local('Apply New Account')}}</p>
            <p>{{local('Get the Full Experience by Creating Account.')}}</p>
        </div>
        <div class="main-block">
            <div class="s1">
                <fv-text-box
                    v-model="Form.email"
                    placeholder="someone@example.com"
                    borderWidth="2"
                    :revealBorder="true"
                    background="whitesmoke"
                    :border-radius="6"
                    :theme="theme"
                    style="width: 100%; max-width: 375px; min-height: 40px; margin-top: 15px; flex-shrink: 0;"
                    @keyup="handleEnter"
                ></fv-text-box>
                <fv-text-box
                    :placeholder="local('Passwords, 8-20 characters')"
                    v-model="Form.password"
                    type="password"
                    borderWidth="2"
                    :revealBorder="true"
                    background="whitesmoke"
                    :border-radius="6"
                    :theme="theme"
                    style="width: 100%; max-width: 375px; min-height: 40px; margin-top: 15px; flex-shrink: 0;"
                    @keyup="handleEnter"
                ></fv-text-box>
                <fv-button
                    :background="gradient"
                    theme="dark"
                    borderRadius="50"
                    fontSize="16"
                    fontWeight="600"
                    :is-box-shadow="true"
                    style="width: 50px; height: 50px; margin-top: 20px; flex-shrink: 0;"
                    :disabled="Apply.Lock"
                    @click="handleApply"
                >
                    <p class="ms-Icon ms-Icon--ChevronRight"></p>
                </fv-button>
                <div class="s2">
                    <p class="to-apply">
                        {{local('I agree to the privacy policy and terms of service of this site by default when registering.')}}
                    </p>
                    <p
                        class="to-apply"
                        style="margin: 0px 8px;"
                    >·</p>
                    <p class="to-apply">{{local('Privacy Policy')}}</p>
                    <p
                        class="to-apply"
                        style="margin: 0px 8px;"
                    >·</p>
                    <p class="to-apply">{{local('Term of Service')}}</p>
                </div>
            </div>
        </div>
        <div
            class="s3"
            @click="$emit('switch-block', 'login')"
        >
            <p>{{local('Already have an account? Log in')}}</p>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
    name: 'Apply',
    data() {
        return {
            Form: {
                email: '',
                password: ''
            },
            Apply: {
                Lock: false
            }
        };
    },
    computed: {
        ...mapGetters(['local', 'currentDataPath']),
        ...mapGetters('Theme', ['color', 'gradient']),
        ...mapState({
            theme: (state) => state.config.theme
        })
    },
    methods: {
        verifyInput() {
            if (this.Form.email == '') {
                this.$barWarning(this.local('Email can not be empty.'), {
                    status: 'warning'
                });
                return false;
            } else if (this.Form.password == '') {
                this.$barWarning(this.local('Password can not be empty.'), {
                    status: 'warning'
                });
                return false;
            }
            return true;
        },
        async handleApply() {
            if (!this.verifyInput()) return;
            if (this.Apply.Lock) return;
            this.Apply.Lock = true;
            this.$api.UserController.register(this.Form)
                .then((res) => {
                    if (res.code === 200) {
                        this.Apply.Lock = false;
                        this.$emit('switch-block', 'login');
                    }
                })
                .catch((res) => {
                    if (res.message) {
                        this.$barWarning(
                            `${this.local(`Apply Failed:`)} ${res.message}`,
                            {
                                status: 'warning'
                            }
                        );
                    }
                    this.Apply.Lock = false;
                });
        },
        handleEnter(event) {
            if (event.keyCode == 13) this.handleApply();
        }
    }
};
</script>

<style lang="scss">
.apply-block {
    @include FullRelative;
    @include HcenterVcenterC;

    flex: 1;
    overflow: overlay;

    .d-1 {
        @include HcenterVcenterC;

        height: 150px;
        user-select: none;

        p {
            &:first-child {
                font-size: 20px;
                color: rgba(50, 49, 48, 1);
            }

            &:nth-child(2) {
                margin-top: 5px;
                font-size: 13.8px;
            }
        }
    }

    .main-block {
        @include HcenterVcenterC;

        position: relative;
        width: 550px;
        min-height: 330px;
        height: auto;
        background: white;
        border: rgba(200, 200, 200, 0.3) solid thin;
        border-radius: 8px;
        box-shadow: 0 5px 5px 0 rgba(154, 160, 185, 0.05),
            0 5px 30px 0 rgba(166, 173, 201, 0.22);
        overflow: hidden;

        .s1 {
            @include FullRelative;
            @include HcenterC;

            flex: 1;
            padding: 25px;

            .main-title {
                font-weight: 400;
            }

            .s2 {
                @include HcenterVcenter;

                width: 100%;
                margin-top: 25px;
                white-space: pre-wrap;
                flex-wrap: wrap;

                .to-apply {
                    @include a-link;

                    white-space: pre-wrap;
                    text-align: center;
                }
            }
        }
    }

    .s3 {
        @include a-link;

        height: 150px;
        margin-top: 35px;
        font-size: 12px;
    }
}
@media screen and (max-width: 768px) {
    .apply-block {
        overflow: inherit;

        .main-block {
            width: 100%;
            overflow: inherit;
            height: 100%;
            box-shadow: none;

            .s1 {
                width: 100%;
                // min-height:480px;
                margin: 0;
                padding: 0px 15px;

                .s2 {
                    flex-wrap: wrap;
                }
            }
        }
    }
}
</style>