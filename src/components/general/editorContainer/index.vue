<template>
    <transition :name="show_editor ? 'move-right-to-left' : 'move-left-to-right'">
        <div
            v-show="show_editor"
            class="fabulous-editor-container"
            :class="[{ dark: theme == 'dark' }]"
        >
            <div class="global-control-banner">
                <fv-button
                    v-if="item && item.pages"
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    style="position: fixed; left: 10px; top: 32px;"
                    @click="show.quickNav ^= true"
                >
                    <i
                        class="ms-Icon"
                        :class="[
                            show.quickNav
                                ? 'ms-Icon--RemoveFromShoppingList'
                                : 'ms-Icon--PageList',
                        ]"
                    ></i>
                </fv-button>
                <fv-button
                    v-show="isPdf"
                    :theme="theme"
                    :borderRadius="8"
                    class="control-btn"
                    :disabled="!target"
                    :is-box-shadow="true"
                    @click="reviseEditor({displayMode: 0})"
                >
                    <img
                        draggable="false"
                        :src="img.note"
                        alt=""
                        style="width: 16px; height: 16px; object-fit: contain;"
                    >
                </fv-button>
                <fv-button
                    v-show="isPdf"
                    :theme="theme"
                    :borderRadius="8"
                    class="control-btn"
                    :is-box-shadow="true"
                    @click="reviseEditor({displayMode: 1})"
                >
                    <img
                        draggable="false"
                        :src="img.pdf"
                        alt=""
                        style="width: 16px; height: 16px; object-fit: contain;"
                    >
                </fv-button>
                <fv-button
                    v-show="isPdf"
                    :theme="theme"
                    :borderRadius="8"
                    class="control-btn"
                    :disabled="!target"
                    :is-box-shadow="true"
                    @dblclick.native="saveRatio(0.5)"
                    @click="reviseEditor({displayMode: 2})"
                >
                    <i class="ms-Icon ms-Icon--ResizeMouseTall"></i>
                </fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    :is-box-shadow="true"
                    @click="close"
                >
                    <i class="ms-Icon ms-Icon--BackToWindow"></i>
                </fv-button>
            </div>
            <div class="main-display-block">
                <editor-block
                    v-show="displayMode !== 1"
                    ref="editor_block"
                    :style="{width: `${displayMode == 2 ? splitRatio * 100 + '%' : ''}`}"
                ></editor-block>
                <split-bar
                    v-show="displayMode === 2"
                    :value="editorSplitRatio"
                    @change-ratio="splitViewRatio"
                    @only-left="splitViewRatio(0.5, 'left')"
                    @only-right="splitViewRatio(0.5, 'right')"
                    @save-ratio="saveRatio"
                    :style="{left: `${splitRatio * 100}%`}"
                ></split-bar>
                <pdf-viewer
                    v-if="show_editor && displayMode !== 0 && item.pdf"
                    :theme="theme"
                    :disabledEditor="!disabledEditor"
                    class="pdf-viewer"
                    :style="{width: `${displayMode == 2 ? (1 - splitRatio) * 100 + '%' : ''}%`}"
                    @open-with-browser="openFile(item.id, item.pdf)"
                    @choose-selection="addPDFNote"
                    @click.native="show.quickNav = false"
                ></pdf-viewer>
            </div>
            <transition :name="!show.quickNav ? 'move-right-to-left' : 'move-left-to-right'">
                <div
                    v-if="item && item.id"
                    v-show="show.quickNav"
                    class="quick-nav-block"
                    :class="[{dark: theme == 'dark'}]"
                >
                    <div
                        v-for="(page, index) in item.pages"
                        :key="index"
                        class="item"
                        :class="[{choosen: target && page.id == target.id}]"
                        @click="openEditor(item, page)"
                    >
                        <p>{{page.emoji}}</p>
                        <div class="info-content-block">
                            <p class="highlight">{{page.name}}</p>
                            <p class="sec date">{{page.id.split('-').pop()}}</p>
                        </div>
                        <p class="sec">{{$date(page.createDate)}}</p>
                    </div>
                    <div
                        class="item"
                        @click="show.addItemPage = true"
                    >
                        <i class="ms-Icon ms-Icon--Add"></i>
                        <p style="margin-left: 15px;">{{local("Add Page")}}</p>
                    </div>
                </div>
            </transition>
            <add-item-page
                v-if="item && item.id"
                :show.sync="show.addItemPage"
                :item="item"
            ></add-item-page>
        </div>
    </transition>
</template>

<script>
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';

import addItemPage from '@/components/home/addItemPage.vue';
import editorBlock from '@/components/general/editorContainer/editorBlock.vue';
import pdfViewer from '@/components/general/pdfViewer';
import splitBar from '@/components/general/editorContainer/splitBar.vue';

import pdf from '@/assets/home/pdf.svg';
import note from '@/assets/home/note.svg';
import markdown from '@/assets/home/md.svg';

export default {
    components: {
        addItemPage,
        editorBlock,
        pdfViewer,
        splitBar
    },
    data() {
        return {
            content: '',
            readonly: false,
            fontSize: 16,
            img: {
                pdf: pdf,
                note: note,
                markdown: markdown
            },
            splitRatio: this.editorSplitRatio,
            lock: {
                loading: true
            },
            show: {
                quickNav: false,
                addItemPage: false,
                bottomControl: false
            }
        };
    },
    watch: {
        editorSplitRatio(val) {
            this.splitRatio = val;
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            language: (state) => state.config.language,
            theme: (state) => state.config.theme,
            editorSplitRatio: (state) => state.config.editorSplitRatio,
            show_editor: (state) => state.editor.show,
            type: (state) => state.editor.type,
            scrollTop: (state) => state.editor.scrollTop,
            history: (state) => state.editor.history,
            item: (state) => state.editor.item,
            displayMode: (state) => state.editor.displayMode,
            unsave: (state) => state.editor.unsave,
            target: (state) => state.editor.target
        }),
        ...mapGetters(['local', 'currentDataPath']),
        disabledEditor() {
            return (
                this.type === 'item' &&
                this.item.name &&
                this.target &&
                this.target.name
            );
        },
        isPdf() {
            if (this.type !== 'item') return false;
            if (!this.item) return false;
            if (!this.item.pdf) return false;
            return true;
        }
    },
    mounted() {},
    methods: {
        ...mapMutations({
            reviseEditor: 'reviseEditor',
            toggleEditor: 'toggleEditor'
        }),
        ...mapActions({
            reviseConfig: 'reviseConfig'
        }),
        getEditor() {
            return this.$refs.editor_block.getEditor();
        },
        toggleUnsave(status = true) {
            this.reviseEditor({
                unsave: status
            });
        },
        openEditor(item, page) {
            if (!this.lock.loading) return;
            if (this.type === 'item' && this.item && this.target) {
                this.history.push({
                    type: this.type,
                    item: this.item,
                    page: this.target,
                    scrollTop: this.getScrollTop()
                });
            }
            this.reviseEditor({
                type: 'item',
                item: item,
                target: page,
                scrollTop: 0,
                displayMode: this.displayMode === 1 ? 2 : this.displayMode,
                history: this.history
            });
        },
        openFile(itemid, fileid, type = 'pdf') {
            this.$local_api.AcademicController.openItemFile(
                this.currentDataPath,
                itemid,
                fileid,
                type
            );
        },
        addPDFNote(event) {
            let { pos, rangeNodes, content } = event;
            let r = [];
            for (let node of rangeNodes) {
                if (node.offset === Infinity) node.offset = 9999999999;
                if (node.endOffset === Infinity) node.endOffset = 9999999999;
                r.push(JSON.parse(JSON.stringify(node)));
            }
            let inteliInsert = (x) => {
                // 防止光标在pdfNote内部时嵌套添加
                x.editor.commands.focus();
                let selection = x.editor.view.state.selection;
                let parentNodeName = selection.$anchor.parent.type.name;
                let path = selection.$anchor.path;
                let jump = false;
                for (let p of path) {
                    if (!p.type) continue;
                    let name = p.type.name;
                    if (name.indexOf('pdfNote') > -1) {
                        jump = true;
                        break;
                    }
                }
                if (jump) {
                    while (parentNodeName !== 'doc') {
                        if (selection.$anchorCell != undefined) {
                            x.editor.commands.deleteTable();
                        } else x.editor.commands.selectParentNode();
                        selection = x.editor.view.state.selection;
                        parentNodeName = selection.$anchor.parent.type.name;
                    }

                    // let pos = selection.$anchor.pos + selection.node.nodeSize;
                    // x.editor.commands.setTextSelection(pos + 1);
                    x.editor.commands.createParagraphNear();
                }
                x.editor
                    .chain()
                    .insertContent({
                        type: 'pdfNote',
                        attrs: {
                            guid: this.$Guid(),
                            pos: JSON.parse(JSON.stringify(pos)),
                            rangeNodes: r,
                            content: content
                        },
                        content: [
                            {
                                type: 'paragraph'
                            }
                        ]
                    })
                    .run();
            };
            let editor = this.getEditor();
            inteliInsert(editor);
            this.reviseEditor({
                displayMode: this.displayMode === 1 ? 2 : this.displayMode,
                targetContent: editor.editor.getJSON()
            });
            this.toggleUnsave(true);
        },
        getScrollTop() {
            let editorContent = this.$el.querySelectorAll(
                '.tip-tap-editor-container'
            )[0];
            return editorContent.scrollTop ? editorContent.scrollTop : 0;
        },
        splitViewRatio(event, bounce = false) {
            if (this.displayMode !== 2) return;
            if (bounce === 'left') {
                this.reviseEditor({
                    displayMode: 0
                });
                this.saveRatio(event + Math.random() * 0.0001);
            } else if (bounce === 'right') {
                this.reviseEditor({
                    displayMode: 1
                });
                this.saveRatio(event + Math.random() * 0.0001);
            }
            this.splitRatio = event;
        },
        saveRatio(event) {
            this.reviseConfig({
                editorSplitRatio: event
            });
        },
        close() {
            if (this.unsave) {
                this.$infoBox(
                    this.local(`Are you sure to quit without saved?`),
                    {
                        status: 'default',
                        title: this.local('Confirm'),
                        confirmTitle: this.local('Confirm'),
                        cancelTitle: this.local('Cancel'),
                        theme: this.theme,
                        confirm: () => {
                            this.toggleEditor(false);
                        },
                        cancel: () => {}
                    }
                );
            } else this.toggleEditor(false);
        }
    }
};
</script>

<style lang="scss">
.fabulous-editor-container {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0px;
    right: 0px;
    background: rgba(250, 250, 250, 1);
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
        Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    box-shadow: -10px 3px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    overflow: hidden;
    z-index: 2;

    &.dark {
        background: rgba(47, 52, 55, 1);

        .main-display-block {
            background: rgba(47, 52, 55, 0.8);
        }
    }

    .global-control-banner {
        @include HendVcenter;

        position: absolute;
        right: 0px;
        width: 300px;
        min-height: 40px;
        height: 40px;
        padding-top: 32px;
        z-index: 2;

        .save-btn {
            margin-right: 15px;
        }

        .control-btn:last-child {
            margin-right: 10px;
        }

        .control-btn {
            width: 30px;
            height: 30px;
            margin: 5px;
        }
    }

    .nav-banner {
        position: relative;
        width: 100%;
        height: 40px;
        padding: 0px 5px;

        display: flex;
        align-items: center;
        z-index: 2;

        &.half {
            width: 48%;
        }
    }

    .main-display-block {
        @include Vend;

        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(250, 250, 250, 0.8);
        overflow: hidden;
        z-index: 1;

        .pdf-viewer {
            position: relative;
            width: 100%;
            height: calc(100% - 80px);
            border-left: rgba(120, 120, 120, 0.1) solid thin;
        }
    }

    .loading-block {
        @include HcenterVcenter;

        position: relative;
        width: 100%;
        height: calc(100% - 40px);
        flex: 1;
    }

    .bottom-control {
        @include HendVcenter;

        position: absolute;
        right: 0px;
        bottom: 0px;
        width: 100%;
        height: 35px;
        background: rgba(245, 245, 245, 0.6);
        font-size: 12px;
        transition: all 0.3s;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        z-index: 2;

        &.dark {
            background: rgba(36, 36, 36, 0.6);
            color: whitesmoke;
        }

        &.close {
            width: 25px;
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
            overflow: hidden;
        }

        * {
            @include Vcenter;
        }

        .trigger {
            height: 100%;
            padding: 5px;
            box-sizing: border-box;

            &:hover {
                background: rgba(200, 200, 200, 0.1);
            }

            &:active {
                background: rgba(200, 200, 200, 0.3);
            }
        }
    }

    .quick-nav-block {
        position: absolute;
        left: 5px;
        top: 80px;
        width: 350px;
        height: calc(100% - 85px);
        padding: 5px;
        background: rgba(245, 245, 245, 0.6);
        border: solid rgba(75, 75, 75, 0.1) thin;
        border-radius: 8px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
        overflow: auto;
        z-index: 9;

        &.dark {
            background: rgba(36, 36, 36, 0.6);

            .item {
                color: whitesmoke;
            }
        }

        .item {
            width: 100%;
            min-height: 65px;
            height: 65px;
            padding: 0px 15px;
            font-size: 13.8px;
            font-weight: 600;
            border: rgba(200, 200, 200, 0.1) solid thin;
            border-radius: 8px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            cursor: pointer;
            user-select: none;

            &.choosen {
                background: rgba(255, 255, 255, 0.8);

                &:hover {
                    background: rgba(255, 255, 255, 0.6);
                }
            }

            &:hover {
                background: rgba(200, 200, 200, 0.1);
            }

            &:active {
                background: rgba(200, 200, 200, 0.3);
            }

            .info-content-block {
                @include VcenterC;

                flex: 1;
                margin: 0px 0px 0px 15px;
                line-height: 1.5;

                .date {
                    font-size: 12px;
                    opacity: 0.6;
                }
            }

            p {
                @include nowrap;

                &.sec {
                    font-size: 12px;
                    font-weight: normal;
                }

                &.highlight {
                    text-align: left;
                    cursor: pointer;

                    &:hover {
                        color: rgba(0, 120, 212, 1);
                        text-decoration: underline;
                    }
                }
            }
        }
    }

    .ProseMirror {
        * {
            line-height: 2;
        }
    }
}
</style>