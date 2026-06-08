<template>
    <float-window-base v-model="thisShow" :title="local('API Option')" height="88%" :theme="theme">
        <template #content>
            <div class="api-option-panel" :class="[{ dark: theme === 'dark' }]">
                <div class="panel-toolbar">
                    <div class="toolbar-left">
                        <p class="w-title">{{ local('AI API Config') }}</p>
                        <p class="w-info">
                            {{ local('Manage your model endpoints, provider and credentials.') }}
                        </p>
                    </div>
                    <div class="toolbar-actions">
                        <fv-command-bar
                            :options="commandBarOptions"
                            :theme="theme"
                            :background="
                                theme === 'dark' ? 'transparent' : 'rgba(245, 245, 245, 0)'
                            "
                            style="flex: 1; background: transparent"
                        ></fv-command-bar>
                    </div>
                </div>

                <div v-if="!displayOptions.length" class="empty-state">
                    <img :src="fallbackIcon" alt="" draggable="false" />
                    <p>
                        {{ loading ? local('Loading...') : local('No API model configured yet.') }}
                    </p>
                </div>

                <div v-else class="api-option-list">
                    <div
                        v-for="item in displayOptions"
                        :key="item.id || 'temp-card'"
                        class="api-card-shell"
                        :class="[
                            {
                                expanded: item.expanded,
                                selected: item.id === aiOption
                            }
                        ]"
                        @click="handleCardClick(item)"
                    >
                        <div class="api-card" :class="[{ expanded: item.expanded }]">
                            <div class="card-summary">
                                <div class="summary-left" @click.stop>
                                    <fv-check-box
                                        v-if="selectMode && item.id"
                                        v-model="item.choosen"
                                        class="select-box"
                                        :theme="theme"
                                        background="rgba(140, 148, 228, 1)"
                                        :disabled="!lock_config"
                                    ></fv-check-box>
                                    <img
                                        class="provider-logo"
                                        :src="getProviderIcon(item.provider)"
                                        alt=""
                                        draggable="false"
                                    />
                                </div>
                                <div class="summary-actions">
                                    <fv-button
                                        theme="dark"
                                        background="rgba(153, 148, 246, 1)"
                                        :border-radius="6"
                                        :font-size="12"
                                        :is-box-shadow="true"
                                        style="width: 60px"
                                        :disabled="
                                            currentToken(item) === savingToken ||
                                            currentToken(item) === deletingToken ||
                                            (!isItemComplete(item) && item.expanded) ||
                                            !lock_config
                                        "
                                        @click.stop="toggleEditor(item)"
                                    >
                                        {{
                                            item.expanded
                                                ? currentToken(item) === savingToken
                                                    ? local('Saving...')
                                                    : local('Confirm')
                                                : local('Edit')
                                        }}
                                    </fv-button>
                                    <fv-button
                                        theme="dark"
                                        :border-radius="6"
                                        background="rgba(200, 38, 45, 1)"
                                        style="width: 30px; height: 30px"
                                        :disabled="
                                            !lock_config ||
                                            currentToken(item) === savingToken ||
                                            currentToken(item) === deletingToken
                                        "
                                        @click.stop="confirmRemoveOne(item)"
                                    >
                                        <i class="ms-Icon ms-Icon--Delete"></i>
                                    </fv-button>
                                </div>
                            </div>
                            <div class="summary-form">
                                <div class="summary-grid">
                                    <div class="editor-item provider-item full">
                                        <p class="editor-label">{{ local('Provider') }}</p>
                                        <provider-search-box
                                            v-model="item.provider"
                                            :theme="theme"
                                            :disabled="!lock_config || !item.expanded"
                                            :local="local"
                                            style="width: 100%"
                                            @choose-provider="applyProvider(item, $event)"
                                        ></provider-search-box>
                                    </div>
                                    <div class="editor-item full">
                                        <p class="editor-label">{{ local('Model Name') }}</p>
                                        <fv-text-box
                                            v-model="item.name"
                                            :placeholder="local('Required')"
                                            :theme="theme"
                                            :disabled="!lock_config || !item.expanded"
                                            :border-radius="8"
                                            style="width: 100%"
                                        ></fv-text-box>
                                    </div>
                                    <div class="editor-item full">
                                        <p class="editor-label">{{ local('Base URL') }}</p>
                                        <fv-text-box
                                            v-model="item.base_url"
                                            :placeholder="local('Required')"
                                            :theme="theme"
                                            :disabled="!lock_config || !item.expanded"
                                            :border-radius="8"
                                            style="width: 100%"
                                        ></fv-text-box>
                                    </div>
                                </div>
                                <div v-if="item.expanded" class="card-editor" @click.stop>
                                    <div class="editor-grid">
                                        <div class="editor-item full">
                                            <p class="editor-label">{{ local('API Key') }}</p>
                                            <fv-text-box
                                                v-model="item.api_key"
                                                :placeholder="local('Required')"
                                                :theme="theme"
                                                :disabled="!lock_config || !item.expanded"
                                                :border-radius="8"
                                                style="width: 100%"
                                            ></fv-text-box>
                                        </div>
                                        <div class="editor-item full">
                                            <p class="editor-label">
                                                {{ local('Description') }}
                                            </p>
                                            <fv-text-field
                                                v-model="item.description"
                                                :placeholder="local('Optional')"
                                                :theme="theme"
                                                :disabled="!lock_config || !item.expanded"
                                                :border-radius="8"
                                                style="width: 100%; height: 150px"
                                            >
                                            </fv-text-field>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template v-slot:control>
            <fv-button :theme="theme" :border-radius="6" @click="thisShow = false">
                {{ local('Close') }}
            </fv-button>
        </template>
    </float-window-base>
</template>

<script>
import { mapActions, mapState } from 'pinia'

import providerSearchBox from '@/components/settings/aiOption/providerSearchBox.vue'
import floatWindowBase from '@/components/window/floatWindowBase.vue'
import fallbackIcon from '@/assets/settings/api.svg'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { matchProviderPreset, getProviderIconCandidates } from '@/js/aiProviderPresets'

const blankOption = () => ({
    id: null,
    name: '',
    description: '',
    provider: '',
    api_key: '',
    base_url: '',
    choosen: false,
    expanded: false
})

export default {
    name: 'settings-ai-option-panel',
    components: {
        providerSearchBox,
        floatWindowBase
    },
    props: {
        modelValue: {
            default: false
        }
    },
    data() {
        return {
            thisShow: this.modelValue,
            tempCard: null,
            selectMode: false,
            savingToken: null,
            deletingToken: null,
            loading: false,
            editSnapshots: {},
            fallbackIcon
        }
    },
    watch: {
        modelValue(val) {
            this.thisShow = val
            if (val) this.load()
        },
        thisShow(val) {
            this.$emit('update:modelValue', val)
            if (val) this.load()
            else {
                this.cleanupTransientState()
            }
        },
        aiOptionList: {
            deep: true,
            handler() {
                if (!this.thisShow) this.prepareOptionState()
            }
        }
    },
    computed: {
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        ...mapState(useAppConfig, ['local']),
        ...mapState(useDataStore, {
            aiOption: (state) => state.configState.aiOption,
            aiOptionList: 'aiOptionList',
            lock_config: (state) => state.lock.config
        }),
        displayOptions() {
            return this.tempCard ? [this.tempCard, ...this.aiOptionList] : this.aiOptionList
        },
        selectedKeys() {
            return this.aiOptionList.filter((item) => item.choosen).map((item) => item.id)
        },
        commandBarOptions() {
            return [
                {
                    name: () => this.local('Add'),
                    icon: 'Add',
                    iconColor: () =>
                        this.theme === 'dark' ? 'rgba(118, 185, 237, 1)' : 'rgba(140, 148, 228, 1)',
                    disabled: () => !this.lock_config || this.loading || Boolean(this.tempCard),
                    func: this.addOption
                },
                {
                    name: () =>
                        this.selectMode ? this.local('Cancel Select') : this.local('Multi Select'),
                    icon: 'CheckboxComposite',
                    iconColor: () =>
                        this.theme === 'dark' ? 'rgba(118, 185, 237, 1)' : 'rgba(140, 148, 228, 1)',
                    disabled: () => !this.aiOptionList.length,
                    func: this.toggleSelectMode
                },
                {
                    name: () => this.local('Delete'),
                    icon: 'Delete',
                    iconColor: 'rgba(220, 62, 72, 1)',
                    disabled: () => !this.selectedKeys.length || !this.lock_config || this.loading,
                    func: this.confirmRemoveSelected
                }
            ]
        }
    },
    mounted() {
        if (this.thisShow) this.load()
        else this.prepareOptionState()
    },
    methods: {
        ...mapActions(useDataStore, {
            reviseConfig: 'reviseConfig',
            listAIOptions: 'listAIOptions',
            createAIOption: 'createAIOption',
            updateAIOption: 'updateAIOption',
            removeAIOption: 'removeAIOption'
        }),
        normalizeItem(raw = {}) {
            return Object.assign(raw, {
                ...blankOption(),
                ...raw,
                choosen: Boolean(raw.choosen),
                expanded: Boolean(raw.expanded)
            })
        },
        cleanupTransientState() {
            this.selectMode = false
            this.editSnapshots = {}
            this.savingToken = null
            this.deletingToken = null
            this.tempCard = null
            this.aiOptionList.forEach((item) => {
                this.normalizeItem(item)
                item.choosen = false
                item.expanded = false
            })
        },
        prepareOptionState() {
            this.aiOptionList.forEach((item) => {
                this.normalizeItem(item)
            })
        },
        async load() {
            this.loading = true
            try {
                await this.listAIOptions()
                this.prepareOptionState()
                this.cleanupTransientState()
            } finally {
                this.loading = false
            }
        },
        addOption() {
            this.selectMode = false
            this.aiOptionList.forEach((item) => {
                item.choosen = false
            })
            this.closeEditors()
            this.tempCard = this.normalizeItem(blankOption())
            this.tempCard.expanded = true
        },
        toggleSelectMode() {
            this.selectMode = !this.selectMode
            if (!this.selectMode) {
                this.aiOptionList.forEach((item) => {
                    item.choosen = false
                })
            }
        },
        isItemComplete(item) {
            return ['name', 'provider', 'api_key', 'base_url'].every(
                (key) => `${item?.[key] || ''}`.trim() !== ''
            )
        },
        currentToken(item) {
            return item?.id || 'temp'
        },
        restoreItem(item) {
            if (!item?.id) return
            const snapshot = this.editSnapshots[item.id]
            if (!snapshot) return
            Object.assign(item, snapshot, { id: item.id, expanded: false })
            delete this.editSnapshots[item.id]
        },
        destroyTempCard() {
            this.tempCard = null
        },
        closeEditors(exceptId = null) {
            this.aiOptionList.forEach((item) => {
                if (item.id === exceptId) return
                if (item.expanded) {
                    this.restoreItem(item)
                } else {
                    item.expanded = false
                }
            })
            if (this.tempCard && exceptId !== 'temp') {
                this.destroyTempCard()
            }
        },
        async handleCardClick(item) {
            if (!item) return
            this.closeEditors(item.id || 'temp')
            if (item.id && item.id !== this.aiOption && this.lock_config) {
                await this.reviseConfig({
                    aiOption: item.id
                })
            }
        },
        async toggleEditor(item) {
            if (!this.lock_config) return
            if (!item) return
            if (item.expanded) {
                await this.persistItem(item)
                return
            }
            this.closeEditors(item.id || 'temp')
            if (item.id && !this.editSnapshots[item.id]) {
                this.editSnapshots[item.id] = JSON.parse(
                    JSON.stringify({
                        id: item.id || null,
                        name: item.name || '',
                        description: item.description || '',
                        provider: item.provider || '',
                        api_key: item.api_key || '',
                        base_url: item.base_url || '',
                        choosen: Boolean(item.choosen),
                        expanded: Boolean(item.expanded)
                    })
                )
            }
            item.expanded = true
        },
        confirmRemoveSelected() {
            if (!this.selectedKeys.length) return
            this.$infoBox(this.local('Are you sure to delete selected models?'), {
                status: 'error',
                title: this.local('Delete Selected'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    await this.removeSelected()
                },
                cancel: () => {}
            })
        },
        async removeSelected() {
            const targets = this.aiOptionList.filter((item) => item.choosen)
            if (!targets.length) return
            const selectedRemoved = targets.some((item) => item.id === this.aiOption)
            for (const item of targets) {
                this.deletingToken = this.currentToken(item)
                const res = await this.removeAIOption(item.id)
                if (res?.code && res.code !== 200) {
                    this.deletingToken = null
                    return
                }
                this.removeLocalOption(item.id)
            }
            this.deletingToken = null
            this.selectMode = false
            if (selectedRemoved) {
                await this.syncSelectedOptionAfterRemoval()
            }
        },
        confirmRemoveOne(item) {
            if (!item) return
            this.$infoBox(this.local('Are you sure to delete this model?'), {
                status: 'error',
                title: this.local('Delete Model'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    await this.removeOne(item)
                },
                cancel: () => {}
            })
        },
        async removeOne(item) {
            if (!item) return
            if (!item.id) {
                this.destroyTempCard()
                return
            }
            const wasSelected = this.aiOption === item.id
            this.deletingToken = this.currentToken(item)
            const res = await this.removeAIOption(item.id)
            if (res?.code && res.code !== 200) {
                this.deletingToken = null
                return
            }
            this.removeLocalOption(item.id)
            this.deletingToken = null
            if (wasSelected) {
                await this.syncSelectedOptionAfterRemoval()
            }
        },
        removeLocalOption(id) {
            const index = this.aiOptionList.findIndex((item) => item.id === id)
            if (index < 0) return
            this.aiOptionList.splice(index, 1)
            delete this.editSnapshots[id]
        },
        async syncSelectedOptionAfterRemoval() {
            if (!this.lock_config) return
            await this.reviseConfig({
                aiOption: this.aiOptionList[0]?.id || null
            })
        },
        applyProvider(item, preset) {
            if (!item) return
            item.provider = preset.key
            if (!item.base_url) item.base_url = preset.baseUrl
        },
        getProviderIcon(provider) {
            return getProviderIconCandidates(provider)[0] || this.fallbackIcon
        },
        async persistItem(item) {
            if (!item || !this.isItemComplete(item) || this.loading || !this.lock_config) return
            this.savingToken = this.currentToken(item)
            try {
                const payload = {
                    id: item.id || null,
                    name: `${item.name || ''}`.trim(),
                    description: `${item.description || ''}`.trim(),
                    provider: item.provider.trim(),
                    api_key: `${item.api_key || ''}`.trim(),
                    base_url: `${item.base_url || ''}`.trim()
                }
                if (item.id) {
                    const res = await this.updateAIOption(item.id, {
                        name: payload.name,
                        description: payload.description,
                        provider: payload.provider,
                        api_key: payload.api_key,
                        base_url: payload.base_url
                    })
                    if (res?.code && res.code !== 200) return
                    Object.assign(item, payload, { expanded: false })
                    delete this.editSnapshots[item.id]
                } else {
                    const res = await this.createAIOption({
                        name: payload.name,
                        description: payload.description,
                        provider: payload.provider,
                        api_key: payload.api_key,
                        base_url: payload.base_url
                    })
                    if (res?.code && res.code !== 200) return
                    const createdId = res?.data?.id || res?.data?.data?.id || null
                    this.destroyTempCard()
                    await this.listAIOptions()
                    this.prepareOptionState()
                    if (createdId && this.lock_config) {
                        await this.reviseConfig({ aiOption: createdId })
                    }
                }
            } finally {
                this.savingToken = null
            }
        }
    }
}
</script>

<style lang="scss">
.api-option-panel {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .panel-toolbar {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(120, 120, 120, 0.12);

        .toolbar-left {
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-width: 0;
        }

        .toolbar-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            min-width: 260px;
        }
    }

    .empty-state {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        opacity: 0.75;

        img {
            width: 72px;
            height: 72px;
            object-fit: contain;
        }
    }

    .api-option-list {
        position: relative;
        width: 100%;
        flex: 1;
        gap: 5px;
        row-gap: 5px;
        padding: 18px 5px;
        overflow: auto;
        display: flex;
        align-items: flex-start;
        align-content: flex-start;
        flex-wrap: wrap;
        
        
    }

    .api-card-shell {
        position: relative;
        width: min(280px, 32.5%);
        height: 288px;
        border-radius: 20px;
        flex-shrink: 0;

        &.selected {
            .api-card {
                border-color: rgba(152, 142, 250, 0.6);
            }
        }

        .api-card {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 18px;
            border-radius: 18px;
            border: 2px solid rgba(120, 120, 120, 0.1);
            background: rgba(255, 255, 255, 0.72);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 20px 60px rgba(18, 24, 38, 0.08);
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 16px;
            transition:
                width 0.25s ease,
                height 0.25s ease,
                box-shadow 0.25s ease,
                background 0.25s ease;

            &.expanded {
                position: absolute;
                width: 350px;
                height: 580px;
                z-index: 20;
                background: rgba(255, 255, 255, 0.6);
                box-shadow: 0 28px 80px rgba(16, 21, 32, 0.18);
            }
        }

        .card-summary {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
        }

        .summary-left {
            flex: 1;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            min-width: 0;
        }

        .summary-form {
            flex: 1;
            min-width: 0;
        }

        .select-box {
            margin-top: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .provider-logo {
            width: 35px;
            height: 35px;
            margin-top: 4px;
            border-radius: 12px;
            object-fit: contain;
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.86);
        }

        .summary-title {
            @include nowrap;

            margin: 0;
            font-size: 13.8px;
            font-weight: 600;
        }

        .summary-grid,
        .editor-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-top: 10px;
        }

        .summary-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }

        .card-editor {
            flex: 1;
            padding-top: 8px;
            border-top: 1px solid rgba(120, 120, 120, 0.12);
        }

        .editor-item {
            min-width: 0;

            &.full {
                grid-column: 1 / -1;
            }
        }

        .editor-label {
            margin: 0px 0px 6px;
            font-size: 12px;
            font-weight: 600;
            opacity: 0.82;
        }

        .provider-item {
            position: relative;
            z-index: 3;
        }
    }

    &.dark {
        .api-card {
            background: rgba(24, 31, 43, 0.82);
            border-color: rgba(138, 151, 181, 0.12);
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);

            &.expanded {
                background: rgba(15, 20, 29, 0.98);
            }
        }

        .provider-logo,
        .provider-item img {
            background: rgba(255, 255, 255, 0.06);
        }
    }
}

@media (max-width: 960px) {
    .api-option-panel {
        .panel-toolbar {
            flex-direction: column;
            align-items: stretch;
        }

        .toolbar-actions {
            min-width: 0;
        }

        .api-option-list,
        .summary-grid,
        .editor-grid {
            grid-template-columns: 1fr;
        }
    }
}
</style>
