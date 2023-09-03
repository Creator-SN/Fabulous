<template>
    <div
        class="fabulous-templates-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div class="s-row">
            <p
                class="s-title"
                style="margin-top: 20px;"
            >{{local('Templates')}}</p>
        </div>
        <div class="m-templates-block">
            <div class="row between">
                <fv-text-box
                    v-model="currentSearch"
                    :placeholder="local('Filtering from current content')"
                    :theme="theme"
                    :background="theme === 'dark' ? 'rgba(75, 75, 75, 0.6)' : 'rgba(255, 255, 255, 0.6)'"
                    icon="Filter"
                    borderWidth="1"
                    :border-radius="30"
                    :revealBorder="true"
                ></fv-text-box>
            </div>
            <div class="row command-bar">
                <fv-command-bar
                    :options="cmd"
                    :theme="theme"
                    :background="theme === 'dark' ? 'transparent' : 'rgba(245, 245, 245, 0)'"
                    style="flex: 1; background: transparent;"
                ></fv-command-bar>
            </div>
            <div class="row main-table">
                <template-grid
                    :value="templates"
                    :filter="currentSearch"
                    :multiChoosen="true"
                    @rightclick="currentItem = $event"
                    @choose-items="currentChoosen = $event"
                    @item-click="openEditor($event)"
                >
                    <template v-slot:menu>
                        <div v-show="!currentItem.default">
                            <span @click="show.rename = true">
                                <i
                                    class="ms-Icon ms-Icon--Rename"
                                    style="color: rgba(0, 153, 204, 1);"
                                ></i>
                                <p>{{local("Rename Template")}}</p>
                            </span>
                            <span @click="deleteTemplate">
                                <i
                                    class="ms-Icon ms-Icon--Delete"
                                    style="color: rgba(173, 38, 45, 1);"
                                ></i>
                                <p>{{local("Delete Template")}}</p>
                            </span>
                        </div>
                    </template>
                </template-grid>
            </div>
        </div>
        <add-template
            :show.sync="show.add"
            @finished="getTemplates"
        ></add-template>
        <rename-template
            :value="currentItem"
            :show.sync="show.rename"
        ></rename-template>
        <template-preview
            :value="currentItem"
            :show.sync="show.templatePreview"
        ></template-preview>
    </div>
</template>

<script>
import addTemplate from '@/components/templates/addTemplate.vue';
import renameTemplate from '@/components/templates/renameTemplate.vue';
import templateGrid from '@/components/templates/templateGrid.vue';
import templatePreview from '@/components/templates/templatePreview.vue';

import { mapMutations, mapState, mapGetters } from 'vuex';

export default {
    components: {
        addTemplate,
        renameTemplate,
        templateGrid,
        templatePreview
    },
    data() {
        return {
            cmd: [
                {
                    name: () => this.local('Add'),
                    icon: 'Add',
                    iconColor: 'rgba(0, 90, 158, 1)',
                    disabled: () => this.SourceDisabled || !this.lock,
                    func: () => {
                        this.show.add = true;
                    }
                },
                {
                    name: () => this.local('Delete'),
                    icon: 'Delete',
                    iconColor: 'rgba(173, 38, 45, 1)',
                    disabled: () =>
                        this.currentChoosen.length === 0 || !this.lock,
                    func: this.deleteTemplates
                }
            ],
            head: [
                { content: 'No.', width: 120 },
                { content: 'Icon', sortName: 'emoji', width: 80 },
                { content: 'Name', sortName: 'name', width: 300 },
                { content: 'Create Date', sortName: 'createDate', width: 120 }
            ],
            templates: [],
            currentItem: {},
            currentChoosen: [],
            currentSearch: '',
            show: {
                add: false,
                rename: false,
                templatePreview: false
            },
            lock: true
        };
    },
    watch: {
        $route() {
            this.getTemplates();
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath']),
        SourceDisabled() {
            return !this.currentDataPath;
        }
    },
    mounted() {
        this.getTemplates();
    },
    methods: {
        ...mapMutations({
            reviseEditor: 'reviseEditor',
            toggleEditor: 'toggleEditor'
        }),
        async getTemplates() {
            let res = await this.$auto.AcademicController.getTemplateInfo(
                this.currentDataPath
            );
            if (res.status === 'success') {
                this.templates = res.data;
            } else {
                this.$barWarning(res.message, {
                    status: 'error'
                });
            }
        },
        deleteTemplate() {
            if (!this.currentItem.id || !this.lock) return;
            this.$infoBox(this.local(`Are you sure to delete this template?`), {
                status: 'error',
                title: this.local('Delete Template'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    this.lock = false;
                    let res =
                        await this.$auto.AcademicController.deleteTemplate(
                            this.currentDataPath,
                            this.currentItem.id
                        );
                    if (res.status !== 'success') {
                        this.$barWarning(res.message, {
                            status: 'error'
                        });
                        this.lock = true;
                        return;
                    }
                    this.getTemplates();
                    this.lock = true;
                },
                cancel: () => {}
            });
        },
        deleteTemplates() {
            if (!this.currentChoosen || !this.lock) return;
            this.$infoBox(
                this.local(`Are you sure to delete these templates?`),
                {
                    status: 'error',
                    title: this.local('Delete Templates'),
                    confirmTitle: this.local('Confirm'),
                    cancelTitle: this.local('Cancel'),
                    theme: this.theme,
                    confirm: async () => {
                        this.lock = false;
                        for (let i = 0; i < this.currentChoosen.length; i++) {
                            let res =
                                await this.$auto.AcademicController.deleteTemplate(
                                    this.currentDataPath,
                                    this.currentChoosen[i].id
                                );
                            if (res.status !== 'success') {
                                this.$barWarning(res.message, {
                                    status: 'error'
                                });
                                this.lock = true;
                                return;
                            }
                        }
                        this.getTemplates();
                        this.lock = true;
                    },
                    cancel: () => {}
                }
            );
        },
        openEditor(template) {
            if (template.default) {
                this.currentItem = template;
                this.show.templatePreview = true;
                return;
            }
            this.reviseEditor({
                type: 'template',
                item: {},
                displayMode: 0,
                target: template
            });
            this.toggleEditor(true);
        }
    }
};
</script>

<style lang="scss">
.fabulous-templates-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(245, 245, 245, 0.9);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;

    &.dark {
        background: rgba(36, 36, 36, 0.9);

        .s-title {
            color: whitesmoke;
        }

        .m-templates-block {
            .row {
                &.main-table {
                    background: black;
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

    .m-templates-block {
        position: relative;
        width: 100%;
        height: 100%;
        flex: 1;
        box-sizing: border-box;
        overflow: hidden;

        display: flex;
        flex-direction: column;

        .row {
            position: relative;
            width: 100%;
            height: auto;
            padding: 12px;
            box-sizing: border-box;

            &.between {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            &.command-bar {
                padding: 0px 12px;
                display: flex;
                align-items: center;
            }

            &.main-table {
                width: calc(100% - 24px);
                flex: 1;
                margin: 8px 12px;
                padding: 0px;
                background: white;
                border-radius: 5px;
                box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;

                p.highlight {
                    text-align: center;
                    cursor: pointer;

                    &:hover {
                        color: rgba(0, 120, 212, 1);
                        text-decoration: underline;
                    }
                }
            }

            &.bottom-control {
                width: calc(100% - 24px);
                height: 45px;
                margin: 8px 12px;
                padding: 0px;
                border-radius: 5px;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .head-info {
                position: absolute;
                left: 0px;
                top: 100%;
                width: 100%;
                height: auto;
                background: whitesmoke;
                display: flex;
                flex-direction: column;
                box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.1);
                z-index: 20;

                .item {
                    width: 100%;
                    min-height: 35px;
                    height: 35px;
                    padding: 0px 15px;
                    font-size: 12px;
                    font-weight: 400;
                    box-sizing: border-box;
                    grid-template-columns: 80px 80px 80px 1fr;
                    display: grid;
                    align-items: center;
                }
            }
        }
    }
}
</style>