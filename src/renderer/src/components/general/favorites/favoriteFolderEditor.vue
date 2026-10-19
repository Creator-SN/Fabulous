<template>
    <float-window-base
        v-model="windowVisible"
        :title="folder ? local('Rename') : local('New Folder')"
        :theme="theme"
        width="min(500px, 95vw)"
        height="min(300px, 95vh)"
    >
        <template #content>
            <div class="favorite-folder-editor">
                <p>{{ local('Folder Name') }}</p>
                <fv-text-box
                    v-model="nameDraft"
                    :theme="theme"
                    :placeholder="local('Folder Name')"
                    :border-radius="6"
                    :reveal-border="true"
                    :disabled="saving"
                    style="width: 100%; margin-top: 15px"
                    @keyup.enter="save"
                ></fv-text-box>
            </div>
        </template>
        <template #control>
            <fv-button
                theme="dark"
                background="rgba(155, 105, 205, 1)"
                :disabled="!nameDraft.trim() || saving"
                :border-radius="6"
                style="min-width: 86px"
                @click="save"
            >
                <fv-progress-ring
                    v-if="saving"
                    :loading="true"
                    r="9"
                    :border-width="2"
                    color="white"
                    background="rgba(255, 255, 255, 0.25)"
                ></fv-progress-ring>
                <template v-else>{{ local('Confirm') }}</template>
            </fv-button>
            <fv-button
                :theme="theme"
                :border-radius="6"
                :disabled="saving"
                style="margin-left: 5px"
                @click="visible = false"
            >
                {{ local('Cancel') }}
            </fv-button>
        </template>
    </float-window-base>
</template>

<script>
import { mapState } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useTheme } from '@/stores/theme'
import floatWindowBase from '@/components/window/floatWindowBase.vue'

export default {
    components: { floatWindowBase },
    props: {
        modelValue: { type: Boolean, default: false },
        folder: { type: Object, default: null }
    },
    emits: ['update:modelValue', 'saved'],
    data() {
        return {
            visible: this.modelValue,
            nameDraft: this.folder?.name || '',
            saving: false
        }
    },
    watch: {
        modelValue(value) {
            this.visible = value
            if (value) this.nameDraft = this.folder?.name || ''
        },
        visible(value) {
            this.$emit('update:modelValue', value)
        }
    },
    computed: {
        ...mapState(useAppConfig, { local: (state) => state.local }),
        ...mapState(useTheme, { theme: (state) => state.theme }),
        windowVisible: {
            get() {
                return this.visible
            },
            set(value) {
                if (!value && this.saving) return
                this.visible = value
            }
        }
    },
    methods: {
        async save() {
            const name = this.nameDraft.trim()
            if (!name || this.saving) return
            this.saving = true
            try {
                const response = this.folder
                    ? await this.$api.FavoriteController.renameFavoriteFolder(this.folder.id, {
                          name
                      })
                    : await this.$api.FavoriteController.createFavoriteFolder({ name })
                if (response?.code !== 200) return
                this.$emit('saved', this.folder?.id)
                this.visible = false
            } catch (error) {
                console.error(error)
            } finally {
                this.saving = false
            }
        }
    }
}
</script>

<style lang="scss">
.favorite-folder-editor {
    width: 100%;
    box-sizing: border-box;

    p {
        margin: 0 0 10px;
        font-size: 13px;
    }
}
</style>
