<template>
    <float-window-base
        v-model="thisValue"
        :theme="theme"
        :title="local('Join Shared Source')"
        :width="560"
        :height="'min(320px, 70%)'"
    >
        <template v-slot:content>
            <div class="join-invite-panel">
                <div class="section-block">
                    <p class="section-title">{{ local('Invite Code') }}</p>
                    <fv-text-box
                        v-model="inviteCode"
                        :theme="theme"
                        :placeholder="local('Please input invite code')"
                        underline
                        :border-width="2"
                        :border-color="'rgba(123, 139, 209, 0.4)'"
                        :focus-border-color="'rgba(123, 139, 209, 1)'"
                        :is-box-shadow="true"
                        style="width: 100%; height: 42px; margin-top: 12px"
                        @keyup.enter="emitJoin"
                    ></fv-text-box>
                </div>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(140, 148, 228, 1)"
                :disabled="!inviteCode.trim() || !ds_lock.permission_group_invite"
                :is-box-shadow="true"
                @click="emitJoin"
            >
                {{ local('Join') }}
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
        }
    },
    emits: ['update:modelValue', 'join'],
    data() {
        return {
            thisValue: this.modelValue,
            inviteCode: ''
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
            }
        }
    },
    computed: {
        ...mapState(useDataStore, {
            ds_lock: (state) => state.lock
        })
    },
    methods: {
        emitJoin() {
            const inviteCode = this.inviteCode.trim()
            if (!inviteCode) return
            this.$emit('join', {
                inviteCode,
                onSuccess: () => {
                    this.thisValue = false
                }
            })
        }
    }
}
</script>

<style lang="scss">
.join-invite-panel {
    width: 100%;
    height: 100%;

    .section-block {
        margin-bottom: 18px;
    }

    .section-title {
        font-size: 13px;
        font-weight: bold;
    }
}
</style>
