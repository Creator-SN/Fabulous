<template>
    <float-window-base
        v-model="windowVisible"
        :title="local('Choose Favorites')"
        :theme="theme"
        :width="'min(900px, 95vw)'"
        :height="'min(900px, 95vh)'"
    >
        <template #content>
            <div class="favorite-picker-list" :class="[{ dark: theme === 'dark' }]">
                <div v-if="loading" class="favorite-picker-loading">
                    <fv-progress-ring
                        :loading="true"
                        r="16"
                        :border-width="3"
                        :color="color"
                        background="rgba(180, 160, 200, 0.12)"
                    ></fv-progress-ring>
                </div>
                <template v-else>
                    <fv-collapse
                        v-model="addExpanded"
                        :theme="theme"
                        :title="local('Add Favorite Folder')"
                        :content="local('Create a folder to organize notes')"
                        :background="rowBackground"
                        :hover-background="rowHoverBackground"
                        :border-color="rowBorderColor"
                        :default-height="68"
                        :max-height="'auto'"
                        :disabled-collapse="true"
                        class="favorite-picker-row"
                    >
                        <template #icon>
                            <span class="favorite-picker-icon"
                                ><i class="ms-Icon ms-Icon--NewFolder"></i
                            ></span>
                        </template>
                        <template #extension>
                            <fv-button
                                theme="dark"
                                background="linear-gradient(70deg, rgba(158, 102, 215, 1), rgba(183, 155, 232, 1))"
                                :border-radius="6"
                                :is-box-shadow="true"
                                :disabled="creating || saving"
                                class="favorite-picker-add-button"
                                @click.stop="openCreateFolder"
                            >
                                <i class="ms-Icon ms-Icon--Add"></i>
                                {{ local('Add') }}
                            </fv-button>
                        </template>
                        <div class="favorite-picker-create-form">
                            <fv-text-box
                                v-model="newFolderName"
                                left-icon="NewFolder"
                                :theme="theme"
                                :placeholder="local('Folder Name')"
                                class="favorite-picker-name-input"
                                :reveal-border="true"
                                :border-radius="6"
                                :disabled="creating || saving"
                                @keyup.enter="createFolder"
                            ></fv-text-box>
                            <fv-button
                                theme="dark"
                                background="rgba(150, 110, 209, 1)"
                                :border-radius="6"
                                :disabled="!newFolderName.trim() || creating || saving"
                            style="min-width: 86px"
                                @click.stop="createFolder"
                            >
                                <fv-progress-ring
                                    v-if="creating"
                                    :loading="true"
                                    r="9"
                                    :border-width="2"
                                    color="white"
                                    background="rgba(255, 255, 255, 0.25)"
                                ></fv-progress-ring>
                                <template v-else>{{ local('Confirm') }}</template>
                            </fv-button>
                        </div>
                    </fv-collapse>
                    <fv-collapse
                        v-for="folder in folders"
                        :key="folder.id"
                        :theme="theme"
                        :title="folder.name"
                        :content="`${folder.itemCount || 0} ${local('Notes')}`"
                        :background="rowBackground"
                        :hover-background="rowHoverBackground"
                        :border-color="rowBorderColor"
                        :default-height="68"
                        :disabled-collapse="true"
                        class="favorite-picker-row"
                    >
                        <template #icon>
                            <span class="favorite-picker-icon"
                                ><i class="ms-Icon ms-Icon--FabricFolder"></i
                            ></span>
                        </template>
                        <template #extension>
                            <div class="favorite-picker-check" @click.stop>
                                <fv-check-box
                                    v-model="folder.selected"
                                    :theme="theme"
                                    background="rgba(150, 110, 209, 1)"
                                    :border-color="theme === 'dark' ? 'whitesmoke' : ''"
                                    :disabled="creating || saving"
                                ></fv-check-box>
                            </div>
                        </template>
                    </fv-collapse>
                    <p v-if="!loading && !folders.length" class="favorite-picker-empty">
                        {{ local('No favorite folders') }}
                    </p>
                </template>
            </div>
        </template>
        <template #control>
            <fv-button
                theme="dark"
                background="rgba(150, 110, 209, 1)"
                :border-radius="6"
                :disabled="loading || creating || saving"
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
                <template v-else>{{ local('Save') }}</template>
            </fv-button>
            <fv-button
                :theme="theme"
                :border-radius="6"
                :disabled="saving || creating"
                style="margin-left: 5px"
                @click="visible = false"
                >{{ local('Cancel') }}</fv-button
            >
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from '@/components/window/floatWindowBase.vue'
import { mapState } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useTheme } from '@/stores/theme'

export default {
    components: { floatWindowBase },
    props: {
        modelValue: { type: Boolean, default: false },
        target: { type: Object, default: null }
    },
    emits: ['update:modelValue', 'saved'],
    data() {
        return {
            visible: this.modelValue,
            folders: [],
            newFolderName: '',
            addExpanded: false,
            creating: false,
            saving: false,
            loading: false
        }
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(value) {
                this.visible = value
                if (value) {
                    this.addExpanded = false
                    this.newFolderName = ''
                    this.loadFolders()
                }
            }
        },
        visible(value) {
            this.$emit('update:modelValue', value)
        }
    },
    computed: {
        ...mapState(useAppConfig, { local: (state) => state.local }),
        ...mapState(useTheme, {
            theme: (state) => state.theme,
            color: (state) => state.color
        }),
        rowBackground() {
            return this.theme === 'dark' ? 'rgba(23, 29, 39, 0.75)' : 'rgba(255, 255, 255, 0.82)'
        },
        rowHoverBackground() {
            return this.theme === 'dark' ? 'rgba(32, 38, 52, 0.9)' : 'rgba(248, 246, 252, 1)'
        },
        rowBorderColor() {
            return this.theme === 'dark' ? 'rgba(120, 120, 120, 0.22)' : 'rgba(145, 135, 165, 0.18)'
        },
        windowVisible: {
            get() {
                return this.visible
            },
            set(value) {
                if (!value && (this.saving || this.creating)) return
                this.visible = value
            }
        }
    },
    methods: {
        async loadFolders() {
            if (!this.target || this.loading) return
            this.loading = true
            try {
                const { data = [] } = await this.$api.FavoriteController.listFavoriteFolders(
                    this.target.kind,
                    this.target.sourceId,
                    this.target.itemId,
                    this.target.pageId || undefined
                )
                this.folders = data.map((folder) => ({
                    ...folder,
                    selected: !!folder.containsItem
                }))
            } catch (error) {
                console.error(error)
                this.folders = []
            } finally {
                this.loading = false
            }
        },
        async createFolder() {
            const name = this.newFolderName.trim()
            if (!name || this.creating || this.saving || this.loading) return
            this.creating = true
            try {
                const selections = new Map(
                    this.folders.map((folder) => [folder.id, folder.selected])
                )
                const response = await this.$api.FavoriteController.createFavoriteFolder({ name })
                if (response?.code !== 200) return
                this.newFolderName = ''
                await this.loadFolders()
                this.folders.forEach((folder) => {
                    folder.selected = selections.get(folder.id) ?? folder.id === response.data?.id
                })
                this.addExpanded = false
            } catch (error) {
                console.error(error)
            } finally {
                this.creating = false
            }
        },
        openCreateFolder() {
            if (this.loading || this.creating || this.saving) return
            this.addExpanded = true
        },
        async save() {
            if (!this.target || this.loading || this.creating || this.saving) return
            this.saving = true
            try {
                const response = await this.$api.FavoriteController.setFavoriteFolders({
                    kind: this.target.kind,
                    sourceId: this.target.sourceId,
                    itemId: this.target.itemId,
                    pageId: this.target.pageId || null,
                    folderIds: this.folders
                        .filter((folder) => folder.selected)
                        .map((folder) => folder.id)
                })
                if (response?.code !== 200) return
                this.$emit(
                    'saved',
                    this.folders.filter((folder) => folder.selected)
                )
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
.favorite-picker-list {
    width: 100%;
    flex: 1;
    padding: 10px 14px 20px;
    box-sizing: border-box;
    overflow: auto;

    .favorite-picker-loading {
        min-height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .favorite-picker-row {
        width: 100%;
        margin-bottom: 9px;
        border-radius: 9px;

        .favorite-picker-icon {
            width: 40px;
            height: 40px;
            margin: 0 10px 0 4px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(162, 126, 215, 0.12);
            color: rgba(142, 92, 198, 1);
            font-size: 20px;
        }

        .favorite-picker-add-button {
            min-width: 86px;
            height: 34px;
            font-size: 12px;
            color: rgba(114, 74, 167, 1);

            i {
                margin-right: 6px;
            }
        }

        .favorite-picker-check {
            min-width: 86px;
            display: flex;
            justify-content: flex-end;
            padding-right: 8px;
        }

        .favorite-picker-create-form {
            padding: 12px 16px 16px;
            display: flex;
            align-items: center;
            gap: 10px;

            .favorite-picker-name-input {
                flex: 1;
                min-width: 0;
                height: 36px;
            }
        }
    }

    &.dark .favorite-picker-icon {
        background: rgba(162, 126, 215, 0.18);
        color: rgba(195, 163, 235, 1);
    }

    .favorite-picker-empty {
        padding: 15px;
        opacity: 0.6;
        text-align: center;
    }
}
</style>
