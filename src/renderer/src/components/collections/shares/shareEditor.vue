<template>
    <float-window-base
        v-model="visible"
        :title="local('Share Note')"
        :theme="theme"
        width="min(560px, 95vw)"
        height="min(550px, 95vh)"
        :teleport="true"
    >
        <template #content>
            <div class="share-editor">
                <div v-if="loadingShare" class="share-editor-loading">
                    <fv-progress-ring :loading="true" r="16" :border-width="3" :color="color"></fv-progress-ring>
                </div>
                <template v-else>
                <p>{{ local('Share Scope') }}</p>
                <div class="share-scope-options">
                    <fv-radio
                        v-for="option in scopeOptions"
                        :key="option.value"
                        v-model="scope"
                        :label="option.value"
                        :theme="theme"
                        :foreground="color"
                    >
                        {{ option.text }}
                    </fv-radio>
                </div>
                <p v-if="target?.kind === 'academic'" class="share-hint">
                    {{ local('Publicly sharing this note also makes the associated PDF public.') }}
                </p>
                <p class="share-link-label">{{ local('Permission') }}</p>
                <fv-combobox
                    v-model="permission"
                    :options="permissionOptions"
                    :theme="theme"
                    :border-radius="6"
                    :background="'rgba(255, 255, 255, 0.9)'"
                    :choosen-slider-background="color"
                    style="width: 180px; margin-top: 12px"
                ></fv-combobox>
                <p class="share-link-label">{{ local('Magic Link') }}</p>
                <div v-if="share" class="share-link">
                    <fv-text-box
                        v-model="magicLink"
                        :theme="theme"
                        :border-radius="6"
                        readonly
                        style="width: min(350px, 100%)"
                    ></fv-text-box>
                    <fv-button
                        :theme="theme"
                        :border-radius="6"
                        style="width: 35px"
                        @click="copyLink"
                        ><i class="ms-Icon ms-Icon--Set"></i
                    ></fv-button>
                </div>
                <p v-else class="share-hint">{{ local('Save to create a share link') }}</p>
                </template>
            </div>
        </template>
        <template #control>
            <fv-button
                theme="dark"
                background="rgba(155, 105, 205, 1)"
                :disabled="saving || loadingShare"
                :border-radius="6"
                @click="save"
                >{{ local('Save') }}</fv-button
            >
            <fv-button
                :theme="theme"
                :disabled="saving || loadingShare"
                :border-radius="6"
                style="margin-left: 5px"
                @click="visible = false"
                >{{ local('Cancel') }}</fv-button
            >
        </template>
    </float-window-base>
</template>

<script>
import { mapState } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useTheme } from '@/stores/theme'
import { useCollectionStore } from '@/stores/collection'
import floatWindowBase from '@/components/window/floatWindowBase.vue'

export default {
    components: { floatWindowBase },
    props: { modelValue: Boolean, target: Object },
    emits: ['update:modelValue', 'saved'],
    data() {
        return {
            visible: this.modelValue,
            scope: 'source',
            permission: { key: 'write', text: () => this.local('Can Edit') },
            share: null,
            saving: false,
            loadingShare: false
        }
    },
    computed: {
        ...mapState(useAppConfig, { local: (state) => state.local }),
        ...mapState(useTheme, { theme: (state) => state.theme, color: (state) => state.color }),
        scopeOptions() {
            return [
                { value: 'source', text: this.local('Source Members') },
                { value: 'public', text: this.local('Public') }
            ]
        },
        permissionOptions() {
            return [
                { key: 'read', text: this.local('Can View') },
                { key: 'write', text: this.local('Can Edit') }
            ]
        },
        magicLink() {
            return this.share
                ? `${window.location.origin}${window.location.pathname}#/magic?key=${encodeURIComponent(this.share.key)}`
                : ''
        }
    },
    mounted() {
        if (this.visible) this.loadShare()
    },
    watch: {
        modelValue(value) {
            this.visible = value
        },
        visible(value) {
            this.$emit('update:modelValue', value)
            if (value) this.loadShare()
        },
        target: {
            deep: true,
            handler() {
                if (this.visible) this.loadShare()
            }
        }
    },
    methods: {
        isCurrentTarget(item) {
            return (
                item?.kind === this.target?.kind &&
                item?.sourceId === this.target?.sourceId &&
                item?.itemId === this.target?.itemId &&
                (item?.pageId || null) === (this.target?.pageId || null)
            )
        },
        async loadShare() {
            if (!this.target || this.loadingShare) return
            this.loadingShare = true
            try {
                const items = await useCollectionStore().listShared(true)
                this.share = items.find((item) => this.isCurrentTarget(item)) || null
                this.scope = this.share?.scope || 'source'
                this.permission =
                    this.permissionOptions.find((item) => item.key === this.share?.permission) ||
                    this.permissionOptions.find((item) => item.key === 'write')
            } finally {
                this.loadingShare = false
            }
        },
        async save() {
            if (!this.target || this.saving || this.loadingShare) return
            this.saving = true
            try {
                const result = this.share
                    ? await useCollectionStore().updateShare(
                          this.share.id,
                          this.scope,
                          this.permission?.key || 'write'
                      )
                    : await useCollectionStore().createShare(
                          this.target,
                          this.scope,
                          this.permission?.key || 'write'
                      )
                if (result?.code === 200) {
                    this.share = result.data
                    this.$emit('saved', this.share)
                }
            } finally {
                this.saving = false
            }
        },
        async copyLink() {
            await navigator.clipboard?.writeText(this.magicLink)
            this.$barWarning(this.local('Successfully Copied'), {
                status: 'correct'
            })
        }
    }
}
</script>

<style lang="scss">
.share-editor {
    overflow: auto;

    .share-editor-loading {
        min-height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .share-scope-options {
        display: flex;
        gap: 18px;
        margin-top: 12px;
    }
    .share-link-label {
        margin-top: 24px;
    }
    .share-link {
        margin-top: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
        span {
            min-width: 0;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
    .share-hint {
        margin-top: 10px;
        opacity: 0.65;
    }
}
</style>
