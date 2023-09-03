<template>
    <div
        v-if="templates.length > 0"
        class="fabulous-templates-grid"
        :class="[{dark: theme === 'dark'}]"
    >
        <div
            v-show="item.show"
            v-for="(item, index) in templates"
            class="template-block"
            :class="[{choosen: item.choosen}]"
            :key="index"
            ref="list"
            @contextmenu="rightClick($event, item)"
        >
            <div
                class="content-preview"
                @click="itemClick(item)"
            >
                <fv-shimmer
                    v-if="!item.minContent"
                    :theme="theme"
                    style="position: relative; width: 100%; height: 100%;"
                >
                    <div
                        v-for="(item, index) in 2"
                        :key="index"
                        style="margin-top: 5px; display: flex; align-items: center;"
                    >
                        <div
                            class="sample"
                            style="width: 30px; height: 30px; margin: 5px; border-radius: 50%;"
                        ></div>
                        <div
                            class="sample"
                            style="width: 80%; flex: 1; margin: 5px;"
                        ></div>
                    </div>
                    <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
                        <div
                            v-for="(item, index) in 5"
                            :key="index"
                            style="margin-top: 5px; display: flex; align-items: center;"
                        >
                            <div
                                class="sample"
                                style="width: 80%; height: 15px; margin: 5px;"
                                :style="{width: `${100 - index * 10}%`}"
                            ></div>
                        </div>
                    </div>
                </fv-shimmer>
                <power-editor
                    v-else
                    :value="computeContent(item.minContent)"
                    :placeholder="local('No content here ...')"
                    :editable="false"
                    :theme="theme"
                    :editorOutSideBackground="theme == 'dark' ? 'rgba(47, 52, 55, 1)' : 'white'"
                    :mobileDisplayWidth="0"
                    style="position: relative; width: 100%; min-height: 100%; height: auto;"
                ></power-editor>
            </div>
            <div class="bottom-info">
                <div class="bottom-item-row">
                    <p class="template-icon">{{item.emoji}}</p>
                    <p
                        class="template-title"
                        :title="item.name"
                    >{{item.name}}</p>
                </div>
                <div class="bottom-item-row">
                    <i class="ms-Icon ms-Icon--Clock"></i>
                    <p class="template-date">{{item.createDate}}</p>
                </div>
            </div>
            <span
                v-show="!item.default && multiChoosen"
                class="icon-block icon"
                key="multi-col"
            >
                <fv-check-box
                    v-model="item.choosen"
                    @click.native="chooseCurrent($event, item)"
                ></fv-check-box>
            </span>
        </div>
        <right-menu
            ref="rightMenu"
            :theme="theme"
            :rightMenuWidth="rightMenuWidth"
        >
            <slot name="menu">
            </slot>
        </right-menu>
    </div>
</template>

<script>
import rightMenu from '@/components/general/rightMenu.vue';
import { mapState, mapGetters } from 'vuex';

import standardT from '@/assets/templates/Standard.json';
import standardWithTableT from '@/assets/templates/Standard_with_Table.json';
import ideaT from '@/assets/templates/Idea.json';

export default {
    components: {
        rightMenu
    },
    props: {
        value: {
            default: []
        },
        filter: {
            default: () => {
                return {
                    key: 'any',
                    value: ''
                };
            }
        },
        multiChoosen: {
            default: false
        },
        rightMenuWidth: {
            default: 200
        }
    },
    data() {
        return {
            templates: [],
            defaults: {
                standard: standardT,
                standardWithTable: standardWithTableT,
                idea: ideaT
            },
            show: {
                rightMenu: false
            }
        };
    },
    watch: {
        value() {
            this.loadTemplates();
        },
        show_editor(val) {
            if (!val) this.loadTemplates();
        },
        filter() {
            this.filterValue();
        },
        'filter.value'() {
            this.filterValue();
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            show_editor: (state) => state.editor.show,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath']),
        currentChoosen() {
            let result = [];
            for (let i = 0; i < this.templates.length; i++) {
                if (this.templates[i].choosen && this.templates[i].show)
                    result.push(this.templates[i]);
            }
            return result;
        },
        computeContent() {
            return (content) => {
                try {
                    return JSON.parse(content);
                } catch (e) {
                    return {
                        type: 'doc',
                        content: []
                    };
                }
            };
        }
    },
    mounted() {
        this.loadTemplates();
        this.filterValue();
    },
    methods: {
        async loadTemplates() {
            this.templates = [];
            let templates = [];
            for (let el of this.value) {
                let template = {};
                template.id = el.id;
                template.name = el.name;
                template.emoji = el.emoji;
                template.default = false;
                template.createDate = el.createDate;
                template.updateDate = el.updateDate;
                template.choosen = false;
                template.show = true;
                let res = await this.$auto.AcademicController.getTemplateContent(
                    this.currentDataPath,
                    el.id
                );
                if (res.code !== 200) {
                    this.$barWarning(res.message, {
                        status: 'error'
                    });
                    return;
                }
                try {
                    template.content = res.data;
                    let contentObj = JSON.parse(template.content);
                    let minContent = {
                        type: 'doc',
                        content: []
                    };
                    minContent.content = contentObj.content.slice(0, 10);
                    template.minContent = JSON.stringify(minContent);
                } catch (e) {
                    template.minContent = template.content;
                }
                templates.push(template);
            }
            let defaults = this.defaultTemplates();
            for (let el of defaults) {
                templates.push(el);
            }
            this.templates.splice(0, this.templates.length);
            this.templates = templates;
        },
        defaultTemplates() {
            let ori = [
                { name: 'Standard', ori: standardT },
                { name: 'Standard with Table', ori: standardWithTableT },
                { name: 'Idea', ori: ideaT }
            ];
            let result = [];
            ori.forEach((el) => {
                let template = {};
                template.id = this.$Guid();
                template.name = el.name;
                template.emoji = '⚙';
                template.default = true;
                template.createDate = null;
                template.updateDate = null;
                template.choosen = false;
                template.show = true;
                template.content = JSON.stringify(el.ori.content);
                try {
                    let contentObj = el.ori.content;
                    let minContent = {
                        type: 'doc',
                        content: []
                    };
                    minContent.content = contentObj.content.slice(0, 10);
                    template.minContent = JSON.stringify(minContent);
                } catch (e) {
                    template.minContent = JSON.stringify(el.ori.content);
                }
                result.push(template);
            });
            return result;
        },
        rightClick($event, item) {
            $event.preventDefault();
            this.$emit('rightclick', item);
            this.$refs.rightMenu.rightClick($event, this.$el);
        },
        filterValue() {
            let filter = this.filter;
            if (typeof this.filter == 'string')
                filter = {
                    key: 'any',
                    value: this.filter
                };
            if (filter.key == undefined || filter.value == undefined) {
                console.warn(this.filter, 'Invalid filter.');
                return 0;
            }
            if (filter.key == 'any') {
                for (let i = 0; i < this.templates.length; i++) {
                    let status = false;
                    let item = this.templates[i];
                    for (let it in this.templates[i]) {
                        if (typeof item[it] != 'string') continue;
                        if (
                            item[it]
                                .toLowerCase()
                                .indexOf(filter.value.toLowerCase()) > -1
                        ) {
                            status = true;
                            break;
                        }
                    }
                    item.show = status;
                    this.$set(this.templates, i, item);
                }
            } else {
                for (let i = 0; i < this.templates.length; i++) {
                    let item = this.templates[i];
                    let status =
                        this.templates[i][this.filter.key]
                            .toLowerCase()
                            .indexOf(filter.value.toLowerCase()) > -1;
                    item.show = status;
                    this.$set(this.templates, i, item);
                }
            }
            this.$emit('change-value', this.templates);
        },
        itemClick(item) {
            if (!this.multiChoosen)
                for (let i = 0; i < this.templates.length; i++) {
                    let t = this.templates[i];
                    if (t !== item) {
                        t.choosen = false;
                        this.$set(this.templates, i, t);
                    } else {
                        t.choosen = true;
                        this.$set(this.templates, i, t);
                    }
                }

            this.$emit('change-value', this.templates);
            this.$emit('item-click', item);
            this.$emit('choose-items', this.currentChoosen);
        },
        chooseCurrent(event, item) {
            event.stopPropagation();
            if (!this.multiChoosen)
                for (let i = 0; i < this.templates.length; i++) {
                    let t = this.templates[i];
                    if (t !== item) {
                        t.choosen = false;
                        this.$set(this.templates, i, t);
                    }
                }
            this.$emit('change-value', this.templates);
            this.$emit('choose-items', this.currentChoosen);
        }
    }
};
</script>

<style lang="scss">
.fabulous-templates-grid {
    @include FullRelative;

    padding: 15px;
    grid-template-columns: repeat(auto-fill, 200px);
    grid-template-rows: auto;
    column-gap: 30px;
    row-gap: 30px;
    box-sizing: border-box;
    display: grid;
    overflow: auto;

    &.dark {
        .template-block {
            background: rgba(36, 36, 36, 1);
            color: whitesmoke;
            border: rgba(200, 200, 200, 0.1) solid thin;

            .bottom-info {
                color: whitesmoke;

                .template-title {
                    color: whitesmoke;
                }

                .template-date {
                    color: whitesmoke;
                }
            }
        }
    }

    .template-block {
        @include FullRelative;

        height: 300px;
        border: rgba(90, 90, 90, 0.1) solid 2px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        transition: all 0.2s;
        box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;

        &:hover {
            box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2),
                -3px -3px 8px rgba(0, 0, 0, 0.2);
        }

        &:active {
            box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.2),
                0px 3px 8px rgba(0, 0, 0, 0.2);
        }

        &.choosen {
            border-color: rgba(255, 180, 0, 0.6);
        }

        .content-preview {
            position: relative;

            flex: 1;
            overflow: hidden;

            .shimmer-container {
                height: 100%;
            }
        }

        .bottom-info {
            position: relative;
            width: 100%;
            height: 60px;
            padding: 0px 10px;
            border-top: rgba(200, 200, 200, 0.1) solid thin;
            box-sizing: border-box;
            line-height: 2;
            display: flex;
            flex-direction: column;
            justify-content: center;

            .bottom-item-row {
                @include Vcenter;

                user-select: none;
            }

            .template-title {
                @include nowrap;

                margin-left: 5px;
                font-size: 12px;
                font-weight: bold;
                color: rgba(50, 49, 48, 1);
            }

            .template-date {
                @include nowrap;

                margin-left: 5px;
                font-size: 12px;
                color: rgba(50, 49, 48, 1);
            }
        }

        .icon-block {
            @include HcenterVcenter;

            position: absolute;
            top: 15px;
            right: 5px;
            width: 30px;
            height: 30px;
            border-radius: 8px;
            box-sizing: border-box;
            z-index: 2;
        }
    }
}
</style>