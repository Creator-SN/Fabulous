<template>
    <float-window-base
        v-model="thisValue"
        :theme="theme"
        :title="panelTitle"
        :width="520"
        :height="'min(380px, 90%)'"
    >
        <template v-slot:content>
            <div class="invite-panel">
                <div class="section-block">
                    <p class="section-title">{{ local('Invite Code') }}</p>
                    <div class="invite-row">
                        <fv-text-box
                            :model-value="inviteCode"
                            :theme="theme"
                            :placeholder="local('Click Get Invite Code to generate one')"
                            underline
                            :border-width="2"
                            :border-color="'rgba(123, 139, 209, 0.4)'"
                            :focus-border-color="'rgba(123, 139, 209, 1)'"
                            :is-box-shadow="true"
                            readonly
                            style="flex: 1; height: 42px"
                        ></fv-text-box>
                        <fv-button
                            theme="dark"
                            background="rgba(140, 148, 228, 1)"
                            :disabled="!inviteCode"
                            :border-radius="6"
                            :is-box-shadow="true"
                            style="width: 42px; height: 42px; margin-left: 8px"
                            :title="local('Copy Invite Code')"
                            @click="copyInviteCode"
                        >
                            <i
                                class="ms-Icon"
                                :class="`ms-Icon--${lock.copy ? 'Set' : 'Accept'}`"
                            ></i>
                        </fv-button>
                    </div>
                </div>

                <div class="section-block">
                    <p class="section-title">{{ local('Expire Time') }}</p>
                    <div class="radio-row">
                        <fv-radio
                            v-for="option in expireOptions"
                            :key="option.value"
                            v-model="expireDays"
                            :theme="theme"
                            :label="option.value"
                            :foreground="'rgba(140, 148, 228, 1)'"
                            style="margin-right: 18px"
                        >
                            {{ option.text }}
                        </fv-radio>
                    </div>
                </div>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(140, 148, 228, 1)"
                :disabled="!ds_lock.permission_group_invite"
                :border-radius="6"
                style="width: 120px"
                @click="emitGenerateInvite"
            >
                {{ local('Get Invite Code') }}
            </fv-button>
            <fv-button
                :theme="theme"
                :border-radius="6"
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
import { mapState } from 'pinia'

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
    emits: ['update:modelValue', 'generate-invite'],
    data() {
        return {
            thisValue: this.modelValue,
            expireDays: 7,
            inviteCode: '',
            expireOptions: [
                {
                    value: 7,
                    text: this.local('7 Days')
                },
                {
                    value: 30,
                    text: this.local('30 Days')
                },
                {
                    value: 180,
                    text: this.local('180 Days')
                }
            ],
            lock: {
                copy: true
            }
        }
    },
    watch: {
        modelValue(val) {
            this.thisValue = val
        },
        thisValue(val) {
            this.$emit('update:modelValue', val)
            if (!val) {
                this.inviteCode = ''
                this.expireDays = 7
            }
        },
        group() {
            this.inviteCode = ''
            this.expireDays = 7
        }
    },
    computed: {
        ...mapState(useDataStore, {
            ds_lock: (state) => state.lock
        }),
        panelTitle() {
            if (!this.group) return this.local('Group Invite Code')
            return `${this.local('Group Invite Code')} - ${this.group.name || ''}`
        }
    },
    methods: {
        async writeClipboard(text) {
            if (!text) return false
            if (navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(text)
                    return true
                } catch (err) {
                    console.log(err)
                }
            }
            const input = document.createElement('input')
            input.value = text
            document.body.appendChild(input)
            input.select()
            const copied = document.execCommand('copy')
            document.body.removeChild(input)
            return copied
        },
        async copyInviteCode() {
            if (!this.inviteCode) return
            const copied = await this.writeClipboard(this.inviteCode)
            if (copied) {
                this.lock.copy = false
                this.$barWarning(this.local('Successfully Copied'), {
                    status: 'correct'
                })
                setTimeout(() => {
                    this.lock.copy = true
                }, 3000)
            }
        },
        async syncInviteCode(inviteCode) {
            this.inviteCode = inviteCode || ''
            if (!this.inviteCode) return
            await this.copyInviteCode()
        },
        emitGenerateInvite() {
            if (!this.group?.id) return
            this.$emit('generate-invite', {
                group: this.group,
                expireDays: this.expireDays,
                onSuccess: this.syncInviteCode
            })
        }
    }
}
</script>

<style lang="scss">
.invite-panel {
    width: 100%;
    height: 100%;

    .section-block {
        margin-bottom: 18px;
    }

    .section-title {
        font-size: 13px;
        font-weight: bold;
    }

    .invite-row {
        @include Vcenter;

        width: 100%;
        margin-top: 12px;
    }

    .radio-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 14px;
    }
}
</style>
