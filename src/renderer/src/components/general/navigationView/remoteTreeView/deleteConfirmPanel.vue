<template>
    <float-window-base
        v-model="thisShow"
        :title="dialogTitle"
        :teleport="true"
        :height="'min(500px, 90%)'"
        :theme="theme"
        @confirm="emitConfirm"
    >
        <template v-slot:content>
            <div class="delete-confirm-panel" :class="[{ dark: theme === 'dark' }]">
                <div class="hero-block">
                    <div class="hero-icon">
                        <i class="ms-Icon ms-Icon--Delete"></i>
                    </div>
                    <div class="hero-copy">
                        <p class="hero-title">{{ headline }}</p>
                        <p class="hero-sub">{{ description }}</p>
                    </div>
                </div>

                <div v-if="target?.isDir" class="warning-block">
                    <p class="warning-title">{{ local('Confirm by typing the folder name') }}</p>
                    <p class="warning-text">
                        {{
                            local(
                                'This action cannot be undone. Please type the folder name to confirm deletion.'
                            )
                        }}
                    </p>
                    <div class="name-chip">{{ expectedName }}</div>
                    <fv-text-box
                        v-model="confirmName"
                        :theme="theme"
                        left-icon="Folder"
                        :placeholder="local('Type folder name here')"
                        underline
                        :border-width="2"
                        :border-color="'rgba(220, 62, 72, 0.35)'"
                        :focus-border-color="'rgba(220, 62, 72, 1)'"
                        style="width: 100%; height: 42px; margin-top: 14px"
                    ></fv-text-box>
                </div>

                <div v-else class="warning-block">
                    <p class="warning-text">
                        {{
                            local(
                                'This will permanently delete the selected file. You can not undo this action.'
                            )
                        }}
                    </p>
                </div>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(220, 62, 72, 1)"
                :disabled="confirmDisabled"
                border-radius="6"
                style="width: 120px"
                @click="emitConfirm"
            >
                {{ confirmLabel }}
            </fv-button>
            <fv-button
                :theme="theme"
                border-radius="6"
                style="margin-left: 8px"
                @click="thisShow = false"
            >
                {{ local('Cancel') }}
            </fv-button>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from '@/components/window/floatWindowBase.vue'

export default {
    components: {
        floatWindowBase
    },
    props: {
        modelValue: {
            default: false
        },
        target: {
            default: null
        },
        theme: {
            default: 'light'
        },
        local: {
            default: () => {}
        }
    },
    emits: ['update:modelValue', 'confirm'],
    data() {
        return {
            thisShow: this.modelValue,
            confirmName: ''
        }
    },
    computed: {
        dialogTitle() {
            return this.target?.isDir ? this.local('Delete Folder') : this.local('Delete File')
        },
        expectedName() {
            return this.target?.name || ''
        },
        headline() {
            return this.target?.isDir
                ? this.local('Delete this folder?')
                : this.local('Delete this file?')
        },
        description() {
            return this.target?.isDir
                ? this.local(
                      'All nested files and folders will be removed permanently after confirmation.'
                  )
                : this.local('The selected file will be removed permanently after confirmation.')
        },
        confirmDisabled() {
            if (!this.target?.filePath) return true
            if (!this.target?.isDir) return false
            return this.confirmName.trim() !== this.expectedName
        },
        confirmLabel() {
            return this.target?.isDir ? this.local('Delete Folder') : this.local('Delete File')
        }
    },
    watch: {
        modelValue(val) {
            this.thisShow = val
        },
        thisShow(val) {
            this.$emit('update:modelValue', val)
            if (!val) this.confirmName = ''
        },
        target() {
            this.confirmName = ''
        }
    },
    methods: {
        emitConfirm() {
            if (this.confirmDisabled) return
            this.$emit('confirm', this.target)
            this.thisShow = false
        }
    }
}
</script>

<style lang="scss">
.delete-confirm-panel {
    width: 100%;
    height: 100%;
    color: rgba(28, 30, 41, 1);
    display: flex;
    flex-direction: column;
    gap: 18px;
    overflow: overlay;

    &.dark {
        color: rgba(255, 255, 255, 0.88);

        .hero-block {
            .hero-sub {
                color: rgba(255, 255, 255, 0.72);
            }
        }

        .warning-block {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.08);

            .warning-text {
                color: rgba(255, 255, 255, 0.72);
            }
        }

        .name-chip {
            background: rgba(220, 62, 72, 0.16);
            color: rgba(255, 228, 231, 1);
        }
    }

    .hero-block {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        user-select: none;

        .hero-icon {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: rgba(220, 62, 72, 0.12);
            color: rgba(220, 62, 72, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
        }

        .hero-title {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            line-height: 1.3;
        }

        .hero-sub {
            font-size: 13px;
            line-height: 1.6;
            color: rgba(75, 85, 99, 1);
        }
    }

    .warning-block {
        padding: 18px;
        border-radius: 16px;
        border: 1px solid rgba(220, 62, 72, 0.12);
        background: linear-gradient(180deg, rgba(220, 62, 72, 0.06), rgba(220, 62, 72, 0.02));
        display: flex;
        flex-direction: column;

        .warning-title {
            margin: 0;
            font-size: 13px;
            font-weight: 700;
            user-select: none;
        }

        .warning-text {
            font-size: 13px;
            line-height: 1.6;
            color: rgba(75, 85, 99, 1);
            display: flex;
            align-items: center;
            user-select: none;
        }
    }

    .name-chip {
        width: fit-content;
        max-width: 100%;
        margin-top: 14px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(220, 62, 72, 0.1);
        color: rgba(160, 26, 40, 1);
        font-size: 12px;
        font-weight: 700;
        word-break: break-all;
    }
}
</style>
