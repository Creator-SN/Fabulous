<template>
    <div class="settings-container" :class="[{ dark: theme === 'dark' }]">
        <div class="s-row">
            <p class="s-title" style="margin-top: 20px">
                {{ local('Setting') }}
            </p>
        </div>
        <user-profile></user-profile>
        <div class="scroll-view">
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'StorageTape'"
                :title="local('Source')"
                :content="local('Add New Source')"
                :background="theme === 'dark' ? 'rgba(23, 29, 39, 1)' : ''"
                :hover-background="theme === 'dark' ? 'rgba(19, 24, 35, 1)' : ''"
                :border-color="theme === 'dark' ? 'rgba(120, 120, 120, 0.2)' : ''"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 35px"
            >
                <template #icon>
                    <div class="collapse-icon-block">
                        <img class="collapse-icon" :src="img.source" alt="" draggable="false" />
                    </div>
                </template>
                <template v-slot:extension>
                    <fv-button
                        :theme="theme"
                        icon="OneDriveAdd"
                        :border-radius="6"
                        font-size="12"
                        :is-box-shadow="true"
                        style="width: 120px"
                        @click="openAddDS"
                        >{{ local('Add New Source') }}</fv-button
                    >
                    <fv-button
                        :theme="theme"
                        icon="Link"
                        :border-radius="6"
                        font-size="12"
                        :is-box-shadow="true"
                        style="width: 60px; margin-left: 5px"
                        @click="show.joinInvite = true"
                        >{{ local('Join') }}</fv-button
                    >
                </template>
            </fv-Collapse>
            <data-source @edit-ds="openEditDS"></data-source>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'Color'"
                :title="local('Theme')"
                :content="theme === 'light' ? `${local('Light')}` : `${local('Dark')}`"
                :background="theme === 'dark' ? 'rgba(23, 29, 39, 1)' : ''"
                :hover-background="theme === 'dark' ? 'rgba(19, 24, 35, 1)' : ''"
                :border-color="theme === 'dark' ? 'rgba(120, 120, 120, 0.2)' : ''"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 15px"
            >
                <template #icon>
                    <div class="collapse-icon-block">
                        <img
                            class="collapse-icon"
                            :src="img.theme"
                            alt=""
                            draggable="false"
                            style="width: 25px"
                        />
                    </div>
                </template>
                <template v-slot:extension>
                    <fv-button
                        :theme="theme"
                        fontSize="16"
                        borderRadius="50"
                        :is-box-shadow="true"
                        style="width: 40px; height: 40px"
                        :title="
                            theme === 'light'
                                ? `${local('Switch to the dark theme')}`
                                : `${local('Switch to the light theme')}`
                        "
                        :disabled="!lock_config"
                        @click="toggleTheme"
                    >
                        <img
                            draggable="false"
                            :src="theme === 'light' ? img.sun : img.moon"
                            alt=""
                            style="width: 20px"
                        />
                    </fv-button>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'LocaleLanguage'"
                :title="local('Language')"
                :content="local('Choose A Language')"
                :background="theme === 'dark' ? 'rgba(23, 29, 39, 1)' : ''"
                :hover-background="theme === 'dark' ? 'rgba(19, 24, 35, 1)' : ''"
                :border-color="theme === 'dark' ? 'rgba(120, 120, 120, 0.2)' : ''"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px"
            >
                <template #icon>
                    <div class="collapse-icon-block">
                        <img
                            class="collapse-icon"
                            :src="img.language"
                            alt=""
                            draggable="false"
                            style="width: 25px"
                        />
                    </div>
                </template>
                <template v-slot:extension>
                    <fv-Combobox
                        v-model="languageModel"
                        :theme="theme"
                        :options="languages"
                        :disabled="!lock_config"
                        :placeholder="local('Choose A Language')"
                        :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : ''"
                        border-color="rgba(120, 120, 120, 0.3)"
                        :border-radius="6"
                        style="width: 120px"
                    ></fv-Combobox>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'Manage'"
                :title="local('System Mode')"
                :content="local('Switch System Mode')"
                :background="theme === 'dark' ? 'rgba(23, 29, 39, 1)' : ''"
                :hover-background="theme === 'dark' ? 'rgba(19, 24, 35, 1)' : ''"
                :border-color="theme === 'dark' ? 'rgba(120, 120, 120, 0.2)' : ''"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px"
            >
                <template #icon>
                    <div class="collapse-icon-block">
                        <img
                            class="collapse-icon"
                            :src="img.mode"
                            alt=""
                            draggable="false"
                            style="width: 20px"
                        />
                    </div>
                </template>
                <template v-slot:extension>
                    <fv-Combobox
                        v-model="activeSystemModeModel"
                        :theme="theme"
                        :options="active_system_modes"
                        :disabled="!lock_config"
                        :placeholder="local('Choose A Mode')"
                        :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : ''"
                        border-color="rgba(120, 120, 120, 0.3)"
                        :border-radius="6"
                        style="width: 120px"
                    ></fv-Combobox>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'Save'"
                :title="local('Auto Save')"
                :content="local('Auto Save')"
                :background="theme === 'dark' ? 'rgba(23, 29, 39, 1)' : ''"
                :hover-background="theme === 'dark' ? 'rgba(19, 24, 35, 1)' : ''"
                :border-color="theme === 'dark' ? 'rgba(120, 120, 120, 0.2)' : ''"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px"
            >
                <template #icon>
                    <div class="collapse-icon-block">
                        <img
                            class="collapse-icon"
                            :src="img.saving"
                            alt=""
                            draggable="false"
                            style="width: 20px"
                        />
                    </div>
                </template>
                <template v-slot:extension>
                    <fv-toggle-switch
                        :title="local('Auto Save')"
                        v-model="autoSaveModel"
                        :disabled="!lock_config"
                        :on="local('Turn Off Auto Save')"
                        :off="local('Turn On Auto Save')"
                        :onForeground="theme === 'dark' ? '#fff' : '#000'"
                        :offForeground="theme === 'dark' ? '#fff' : '#000'"
                        :switch-on-background="'rgba(140, 148, 228, 1)'"
                    >
                    </fv-toggle-switch>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="
                    editorExpandContentModel
                        ? 'StaplingLandscapeTwoTop'
                        : 'StaplingPortraitBookBinding'
                "
                :title="local('Editor Content Expand')"
                :content="local('Switch Editor Content Expand')"
                :background="theme === 'dark' ? 'rgba(23, 29, 39, 1)' : ''"
                :hover-background="theme === 'dark' ? 'rgba(19, 24, 35, 1)' : ''"
                :border-color="theme === 'dark' ? 'rgba(120, 120, 120, 0.2)' : ''"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px"
            >
                <template #icon>
                    <div class="collapse-icon-block">
                        <img
                            class="collapse-icon"
                            :src="img.expanding"
                            alt=""
                            draggable="false"
                            style="width: 20px"
                        />
                    </div>
                </template>
                <template v-slot:extension>
                    <fv-toggle-switch
                        :title="local('Switch Editor Content Expand')"
                        v-model="editorExpandContentModel"
                        :disabled="!lock_config"
                        :on="local('Expand Mode')"
                        :off="local('Collaspe Mode')"
                        :onForeground="theme === 'dark' ? '#fff' : '#000'"
                        :offForeground="theme === 'dark' ? '#fff' : '#000'"
                        :switch-on-background="'rgba(140, 148, 228, 1)'"
                    >
                    </fv-toggle-switch>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'ButtonMenu'"
                :title="local('Show Navigation')"
                :content="local('Show Navigation on Editor')"
                :background="theme === 'dark' ? 'rgba(23, 29, 39, 1)' : ''"
                :hover-background="theme === 'dark' ? 'rgba(19, 24, 35, 1)' : ''"
                :border-color="theme === 'dark' ? 'rgba(120, 120, 120, 0.2)' : ''"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px"
            >
                <template #icon>
                    <div class="collapse-icon-block">
                        <img
                            class="collapse-icon"
                            :src="img.nav"
                            alt=""
                            draggable="false"
                            style="width: 20px"
                        />
                    </div>
                </template>
                <template v-slot:extension>
                    <fv-toggle-switch
                        :title="local('Switch Editor Navigation')"
                        v-model="editorShowNavModel"
                        :disabled="!lock_config"
                        :on="local('Show Navigation')"
                        :off="local('Hide Navigation')"
                        :onForeground="theme === 'dark' ? '#fff' : '#000'"
                        :offForeground="theme === 'dark' ? '#fff' : '#000'"
                        :switch-on-background="'rgba(140, 148, 228, 1)'"
                    >
                    </fv-toggle-switch>
                </template>
            </fv-Collapse>
            <fv-Collapse
                v-if="false"
                :disabledCollapse="true"
                :theme="theme"
                :icon="'Diagnostic'"
                :title="local('Watch All Files')"
                :content="local('Switch whether to watch all extension files on Notebook system')"
                :background="theme === 'dark' ? 'rgba(23, 29, 39, 1)' : ''"
                :hover-background="theme === 'dark' ? 'rgba(19, 24, 35, 1)' : ''"
                :border-color="theme === 'dark' ? 'rgba(120, 120, 120, 0.2)' : ''"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px"
            >
                <template v-slot:extension>
                    <fv-toggle-switch
                        :title="local('Watch All Files')"
                        v-model="watchAllExtensionsModel"
                        :on="local('ON')"
                        :off="local('OFF')"
                        :onForeground="theme === 'dark' ? '#fff' : '#000'"
                        :offForeground="theme === 'dark' ? '#fff' : '#000'"
                        :switch-on-background="'rgba(140, 148, 228, 1)'"
                    >
                    </fv-toggle-switch>
                </template>
            </fv-Collapse>
            <fv-Collapse
                v-if="false"
                :disabledCollapse="true"
                :theme="theme"
                :icon="'DeveloperTools'"
                :title="local('Dev Tools')"
                :content="local('Dev Tools for Developer')"
                :background="theme === 'dark' ? 'rgba(23, 29, 39, 1)' : ''"
                :hover-background="theme === 'dark' ? 'rgba(19, 24, 35, 1)' : ''"
                :border-color="theme === 'dark' ? 'rgba(120, 120, 120, 0.2)' : ''"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px"
            >
                <template v-slot:extension>
                    <fv-button
                        :theme="theme"
                        :is-box-shadow="true"
                        style="width: 120px"
                        @click="$Go('/dev')"
                    >
                        {{ local('Dev Page') }}
                    </fv-button>
                </template>
            </fv-Collapse>
            <fv-Collapse
                v-if="false"
                :disabledCollapse="true"
                :theme="theme"
                :icon="'DevUpdate'"
                :title="local('App Update')"
                :content="
                    !updater.version ? local('Automatic application update') : updater.version
                "
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px"
            >
                <template v-slot:extension>
                    <div class="update-info-block">
                        <i
                            v-show="updater.status === 'latest'"
                            class="ms-Icon ms-Icon--Accept latest-icon"
                        ></i>
                        <p v-show="updater.status === 'latest'" class="update-content-info">
                            {{ local('Latest Version') }}
                        </p>
                        <fv-progress-ring
                            v-show="updater.status === 'checking' || updater.status === 'loading'"
                            :model-value="updater.downloadPercent"
                            :loading="updater.status === 'checking'"
                            r="15"
                            borderWidth="3"
                        ></fv-progress-ring>
                        <p v-show="updater.status === 'checking'" class="update-content-info">
                            {{ local('Checking...') }}
                        </p>
                        <p
                            v-show="updater.status === 'checking' || updater.status === 'loading'"
                            class="update-content-info"
                        >
                            {{ updater.downloadPercent }}%
                        </p>
                    </div>
                </template>
            </fv-Collapse>
        </div>
        <source-editor
            v-model:show="show.addDS"
            :theme="theme"
            :mode="show.dsMode"
            :source="editingDS"
            @finished="handleDSFinished"
        ></source-editor>
        <join-invite-panel
            v-model="show.joinInvite"
            :theme="theme"
            :local="local"
            @join="handleJoinInvite"
        ></join-invite-panel>
    </div>
</template>

<script>
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { mapState, mapActions } from 'pinia'
import userProfile from './profile/userProfile.vue'
import sourceEditor from '@/components/settings/dataSource/sourceEditor.vue'
import dataSource from '@/components/settings/dataSource/index.vue'
import joinInvitePanel from '@/components/settings/dataSource/joinInvitePanel.vue'

import sourceImg from '@/assets/settings/source.svg'
import themeImg from '@/assets/settings/theme.svg'
import languageImg from '@/assets/settings/language.svg'
import modeImg from '@/assets/settings/mode.svg'
import savingImg from '@/assets/settings/saving.svg'
import expandingImg from '@/assets/settings/expanding.svg'
import navImg from '@/assets/settings/nav.svg'
import sunImg from '@/assets/settings/sun.svg'
import moonImg from '@/assets/settings/moon.svg'

export default {
    name: 'Settings',
    components: {
        userProfile,
        sourceEditor,
        dataSource,
        joinInvitePanel
    },
    data() {
        return {
            languages: [
                { key: 'en', text: 'English' },
                { key: 'cn', text: '简体中文' }
            ],
            active_system_modes: [
                {
                    key: 'ds',
                    text: () => this.local('Research System')
                },
                { key: 'notebook', text: () => this.local('Notebook System') },
                { key: 'both', text: () => this.local('Both Systems') }
            ],
            db_index: -1,
            updater: {
                status: 'init',
                downloadPercent: 0,
                version: false
            },
            editingDS: null,
            img: {
                source: sourceImg,
                theme: themeImg,
                language: languageImg,
                mode: modeImg,
                saving: savingImg,
                expanding: expandingImg,
                nav: navImg,
                sun: sunImg,
                moon: moonImg
            },
            show: {
                addDS: false,
                dsMode: 'add',
                joinInvite: false
            }
        }
    },
    watch: {
        $route() {
            this.getConfig()
        },
        'show.addDS'(val) {
            if (!val) {
                this.show.dsMode = 'add'
                this.editingDS = null
            }
        }
    },
    computed: {
        ...mapState(useDataStore, {
            language: (state) => state.configState.language,
            autoSave: (state) => state.configState.autoSave,
            activeSystemMode: (state) => state.configState.activeSystemMode,
            editorExpandContent: (state) => state.configState.editorExpandContent,
            editorShowNav: (state) => state.configState.editorShowNav,
            dynamicEffect: (state) => state.configState.dynamicEffect,
            watchAllExtensions: (state) => state.configState.watchAllExtensions,
            lock_config: (state) => state.lock.config
        }),
        languageModel: {
            get() {
                return this.languages.find((item) => item.key === this.language) || {}
            },
            set(value) {
                if (value && value.key) {
                    this.reviseConfig({ language: value.key })
                }
            }
        },
        activeSystemModeModel: {
            get() {
                return (
                    this.active_system_modes.find((item) => item.key === this.activeSystemMode) ||
                    {}
                )
            },
            set(value) {
                if (value && value.key) {
                    this.reviseConfig({ activeSystemMode: value.key })
                }
            }
        },
        autoSaveModel: {
            get() {
                return this.autoSave
            },
            set(value) {
                this.reviseConfig({ autoSave: value })
            }
        },
        editorExpandContentModel: {
            get() {
                return this.editorExpandContent
            },
            set(value) {
                this.reviseConfig({ editorExpandContent: value })
            }
        },
        editorShowNavModel: {
            get() {
                return this.editorShowNav
            },
            set(value) {
                this.reviseConfig({ editorShowNav: value })
            }
        },
        watchAllExtensionsModel: {
            get() {
                return this.watchAllExtensions
            },
            set(value) {
                this.reviseConfig({ watchAllExtensions: value })
            }
        },
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        ...mapState(useAppConfig, ['local'])
    },
    async mounted() {
        this.eventInit()
        await this.getConfig()
    },
    methods: {
        ...mapActions(useTheme, ['toggleTheme']),
        ...mapActions(useDataStore, {
            getConfig: 'getConfig',
            reviseConfig: 'reviseConfig',
            getDataPath: 'getDataPath',
            acceptSourcePermissionGroupInvite: 'acceptSourcePermissionGroupInvite'
        }),
        eventInit() {
            // this.nw.on('updater-callback', (event, { status, info }) => {
            //     this.updater.status = status;
            //     if (status === 'latest')
            //         this.updater.version = info.releaseName;
            //     if (status === 'loading')
            //         this.updater.downloadPercent = info.percent.toFixed(0);
            //     console.log({ status, info });
            // });
        },
        openAddDS() {
            this.show.dsMode = 'add'
            this.editingDS = null
            this.show.addDS = true
        },
        openEditDS(dbItem) {
            this.show.dsMode = 'edit'
            this.editingDS = dbItem
            this.show.addDS = true
        },
        handleDSFinished() {
            this.getConfig()
            this.show.dsMode = 'add'
            this.editingDS = null
        },
        async handleJoinInvite({ inviteCode, onSuccess }) {
            const res = await this.acceptSourcePermissionGroupInvite(inviteCode)
            if (res && res.code === 200) {
                await this.getDataPath()
                if (typeof onSuccess === 'function') {
                    onSuccess()
                }
            }
        }
    }
}
</script>

<style lang="scss">
.settings-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(246, 246, 246, 0.7);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;

    &.dark {
        background: rgba(5, 9, 15, 0.9);

        .s-title {
            color: whitesmoke;
        }

        .scroll-view {
            .s-item-block {
                .s-item-title {
                    color: whitesmoke;
                }
            }
        }
    }

    .s-row {
        position: relative;
        margin: 25px 0px;
        padding: 0px 15px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
    }

    .s-title {
        font-size: 24px;
        user-select: none;
        cursor: default;
    }

    .scroll-view {
        position: relative;
        width: 100%;
        flex: 1;
        padding-left: 15px;
        padding-bottom: 15px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        overflow: auto;

        .s-item-block {
            position: relative;
            width: calc(100% - 30px);
            max-width: 1280px;
            height: auto;
            line-height: 2.5;
            display: flex;
            flex-direction: column;

            .s-item-title {
                user-select: none;
                cursor: default;
            }

            .list-view-item {
                position: relative;
                width: 100%;
                padding-left: 5px;
                border-left: rgba(140, 148, 228, 0) solid 5px;
                border-radius: 3px;
                display: flex;
                align-items: center;

                &.disabled {
                    filter: grayscale(100%);
                }

                &.choosen {
                    border-color: rgba(140, 148, 228, 0.6);
                }

                .icon-img {
                    width: 16px;
                    height: auto;
                }

                .item-name {
                    margin-left: 15px;
                    font-size: 13px;
                    flex: 1;
                }

                .control-btn {
                    width: 35px;
                    height: 35px;
                    margin-right: 5px;
                }
            }
        }

        .collapse-icon-block {
            @include HcenterVcenter;

            width: 35px;

            .collapse-icon {
                width: 35px;
                height: auto;
                object-fit: cover;
                user-select: none;
            }
        }

        .update-info-block {
            @include Vcenter;

            font-size: 12px;

            .latest-icon {
                color: rgba(0, 158, 98, 1);
            }

            .update-content-info {
                margin-left: 15px;
            }
        }
    }

    .theme-color-label-block {
        @include Vcenter;

        margin-top: 5px;

        .theme-color-label-item-sample {
            width: 15px;
            height: 15px;
            margin-right: 20px;
            border-radius: 50%;
        }
    }
}
</style>
