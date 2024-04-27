<template>
    <div
        class="fabulous-editor-block"
        :class="[{ dark: theme == 'dark' }]"
        @mousewheel="onMouseWheel"
    >
        <div class="control-banner">
            <div class="control-left-block">
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    style="margin-left: 45px;"
                    @click="readonly = readonly == true ? false : true"
                ><i
                        class="ms-Icon"
                        :class="[
                            `ms-Icon--${
                                readonly === true ? 'Edit' : 'ReadingMode'
                            }`,
                        ]"
                    ></i></fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    @click="expandContent = expandContent == true ? false : true"
                ><i
                        class="ms-Icon"
                        :class="[
                            `ms-Icon--${
                                expandContent === true ? 'StaplingPortraitBookBinding' : 'StaplingLandscapeTwoTop'
                            }`,
                        ]"
                    ></i></fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    :background="editor_show_nav ? 'rgba(0, 98, 158, 1)' : ''"
                    :foreground="editor_show_nav ? '#fff' : ''"
                    class="control-btn"
                    @click="editor_show_nav = editor_show_nav ? false : true"
                >
                    <i class="ms-Icon ms-Icon--ButtonMenu"></i>
                </fv-button>
                <fv-button
                    v-show="unsave"
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    background="rgba(0, 204, 153, 1)"
                >
                    {{ "" }}
                </fv-button>
                <history-callout
                    v-if="isRemote && item && type === 'item'"
                    :value="target"
                    :uri="currentDataPath"
                    :itemid="item.id"
                    :mode="'page'"
                    :theme="theme"
                    :local="local"
                    @chooseItem="previewHistory"
                ></history-callout>
                <fv-toggle-switch
                    :title="local('Auto Save')"
                    v-model="auto_save"
                    class="save-btn"
                    width="85"
                    height="30"
                    :on="local('Auto Save')"
                    :off="local('Auto Save')"
                    :onForeground="theme === 'dark' ? '#fff' : '#000'"
                    :offForeground="theme === 'dark' ? '#fff' : '#000'"
                    :switch-on-background="theme === 'dark' ? '#000' : 'rgba(140, 148, 228, 1)'"
                    :insideContent="true"
                    style="margin-left: 5px;"
                >
                </fv-toggle-switch>
            </div>
        </div>
        <div
            v-if="showNav"
            class="nav-banner"
            :class="[{half: displayMode === 2}]"
        >
            <fv-Breadcrumb
                :value="`${item.name}/${target.name}`"
                :disabled="history.length === 0"
                :theme="theme"
                :rootIcon="history.length > 0 ? 'PageLeft' : 'FolderHorizontal'"
                style="font-size: 12px; white-space: nowrap;"
                @root-click="back"
            ></fv-Breadcrumb>
        </div>
        <input
            v-show="false"
            type="file"
            accept=".md"
            ref="md_input"
            @change="openMarkdown"
        />
        <div
            v-show="lock.loading"
            class="main-display-block"
        >
            <power-editor
                :value="content"
                :placeholder="local('Write something ...')"
                :editable="!readonly"
                :theme="theme"
                :language="language"
                :editorBackground="
                    theme == 'dark' ? 'rgba(47, 52, 55, 0)' : 'rgba(250, 250, 250, 0)'"
                :editorOutSideBackground="
                    theme == 'dark' ? 'rgba(47, 52, 55, 0)' : 'rgba(250, 250, 250, 0)'"
                :toolbarHeight="150"
                :editablePaddingTop="180"
                :readOnlyPaddingTop="100"
                :contentMaxWidth="expandContent ? '99999px' : '900px'"
                :mobileDisplayWidth="0"
                :mentionItemAttr="editorMentionItemAttr"
                :extensions="customExtensions"
                ref="editor"
                :style="{background: 'transparent', 'font-size': `${fontSize}px`}"
                style="position: relative; width: 100%; height: 100%; flex: 1;"
                @save-json="saveContent"
                @click.native="show.quickNav = false"
                @change="editorContentChange"
                @content-change="editorSetContentChange"
            >
                <template v-slot:custom-buttons-front="x">
                    <fv-button
                        :theme="theme"
                        :foreground="theme === 'dark' ? 'rgba(200, 200, 200, 1)' : ''"
                        :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : 'rgba(255, 255, 255, 1)'"
                        :class="[x.defaultClass]"
                        :isBoxShadow="true"
                        :title="local('Import Markdown')"
                        @click="$refs.md_input.click()"
                    >
                        <img
                            draggable="false"
                            :src="img.openMarkdown"
                            alt=""
                            style="width: 16px; height: 16px; object-fit: contain;"
                            :style="{filter: theme == 'dark' ? 'invert(1)' : ''}"
                        >
                    </fv-button>
                    <fv-button
                        :theme="theme"
                        :foreground="'rgba(147, 79, 125, 1)'"
                        :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : 'rgba(255, 255, 255, 1)'"
                        :class="[x.defaultClass]"
                        :isBoxShadow="true"
                        :title="local('Export Markdown')"
                        @click="saveMarkdown"
                    >
                        <img
                            draggable="false"
                            :src="img.markdown"
                            alt=""
                            style="width: 16px; height: 16px; object-fit: contain;"
                            :style="{filter: theme == 'dark' ? 'invert(1)' : ''}"
                        >
                    </fv-button>
                </template>
                <template v-slot:custom-buttons-0="x">
                    <fv-button
                        :theme="theme"
                        :foreground="'rgba(147, 79, 125, 1)'"
                        :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : 'rgba(255, 255, 255, 1)'"
                        :class="[x.defaultClass]"
                        :isBoxShadow="true"
                        :title="local('Save As')"
                        @click="saveAs"
                    >
                        <i class="ms-Icon ms-Icon--SaveAs"></i>
                    </fv-button>
                </template>
                <template v-slot:front-content>
                    <editor-nav
                        v-show="editor_show_nav"
                        :el="() => $refs.editor"
                        ref="editor_nav"
                    ></editor-nav>
                </template>
            </power-editor>
        </div>
        <div
            v-show="!lock.loading"
            class="loading-block"
        >
            <fv-progress-ring
                loading="true"
                r="20"
                borderWidth="5"
            ></fv-progress-ring>
        </div>
        <div
            class="bottom-control"
            :class="[{dark: theme == 'dark'}, {close: !show.bottomControl}]"
        >
            <i
                class="ms-Icon trigger"
                :class="[`ms-Icon--${show.bottomControl ? 'ChevronRightMed' : 'ChevronLeftMed'}`]"
                style="flex: 1;"
                @click="show.bottomControl ^= true"
            ></i>
            <fv-slider
                v-show="show.bottomControl"
                v-model="fontSize"
                :mininum="12"
                :maxinum="72"
                icon="RadioBullet"
                color="rgba(87, 156, 193, 1)"
                :showLabel="true"
                style="width: 150px; margin-right: 15px;"
            >
                <template slot-scope="prop">
                    <p style="margin: 5px;">{{prop.value}}px</p>
                </template>
            </fv-slider>
        </div>
        <template-preview
            :title="local('History Preview')"
            :value="currentHistory"
            :show.sync="show.historyPreview"
            :showBanner="true"
            :showTitle="true"
        >
            <template v-slot:control="x">
                <fv-button
                    theme="dark"
                    background="rgba(140, 148, 228, 1)"
                    :is-box-shadow="true"
                    style="width: 120px; margin-right: 5px;"
                    @click="() => {commitDiff(x.result); show.historyPreview = false;}"
                >{{local('Rollback version')}}</fv-button>
            </template>
        </template-preview>
        <diff-previewer
            v-model="show.diff"
            :author="beforeSavingDiff.author"
            :source="beforeSavingDiff.source"
            :target="beforeSavingDiff.target"
            :createDate="beforeSavingDiff.createDate"
            @commit="commitDiff"
            @save="commitDiffAndSave"
        ></diff-previewer>
    </div>
</template>

<script>
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import * as Diff from 'diff';

import editorNav from '@/components/general/editorContainer/editorNav.vue';
import diffPreviewer from '@/components/general/editorContainer/diffPreviewer.vue';
import historyCallout from '@/components/general/callout/historyCallout.vue';
import templatePreview from '@/components/templates/templatePreview.vue';

import pdfNote from '@/components/general/editorCustom/extension/pdfNote.js';

import pdf from '@/assets/home/pdf.svg';
import note from '@/assets/home/note.svg';
import markdown from '@/assets/home/md.svg';
import openMarkdownImg from '@/assets/home/open_md.svg';

import { fabulous_notebook } from '@/js/data_sample.js';

export default {
    components: {
        editorNav,
        diffPreviewer,
        historyCallout,
        templatePreview
    },
    data() {
        return {
            content: '',
            readonly: false,
            fontSize: 16,
            expandContent: false,
            editor_show_nav: false,
            auto_save: false,
            docInfo: {
                versionId: null
            },
            beforeSavingDiff: {
                versionId: null,
                author: null,
                source: null,
                target: null,
                createDate: new Date()
            },
            currentHistory: {},
            editorMentionItemAttr: {
                mentionList: this.mentionList,
                filterFunc: () => {
                    return true;
                },
                chooseItemCallback: () => {
                    console.log('chooseItemCallback');
                },
                mentionClickCallback: (item) => {
                    if (item.type === 'item') {
                        this.openFile(item.id, item.pdf);
                    } else if (item.type === 'page') {
                        if (this.unsave) {
                            this.$infoBox(
                                this.local(
                                    `Are you sure to redirect without saved?`
                                ),
                                {
                                    status: 'warning',
                                    title: this.local('Confirm'),
                                    confirmTitle: this.local('Confirm'),
                                    cancelTitle: this.local('Cancel'),
                                    theme: this.theme,
                                    confirm: () => {
                                        this.openEditor(
                                            item.parent,
                                            item._page
                                        );
                                    },
                                    cancel: () => {}
                                }
                            );
                        } else this.openEditor(item.parent, item._page);
                    }
                },
                headerForeground: () => 'rgba(0, 120, 212, 1)'
            },
            customExtensions: [pdfNote],
            img: {
                pdf: pdf,
                note: note,
                markdown: markdown,
                openMarkdown: openMarkdownImg
            },
            lock: {
                loading: true,
                diff: true,
                save: true
            },
            show: {
                quickNav: false,
                addItemPage: false,
                bottomControl: false,
                diff: false,
                historyPreview: false
            },
            timer: {
                diff: undefined,
                autoSave: undefined
            }
        };
    },
    watch: {
        $route() {
            this.toggleUnsave(false);
        },
        show_editor() {
            this.toggleUnsave(false);
            this.refreshContent();
        },
        auto_save() {
            this.switchAutoSave();
        },
        autoSave() {
            this.auto_save = this.autoSave;
        },
        target() {
            this.toggleUnsave(false);
            this.refreshContent();
            this.$nextTick(() => {
                this.scrollToTop(this.scrollTop);
            });
        },
        'pdfNoteInfo.version'() {
            this.scrollToPDFNote();
        },
        expandContent(val) {
            this.reviseConfig({
                editorExpandContent: val
            });
        },
        editorExpandContent(val) {
            this.expandContent = val;
        },
        editor_show_nav(val) {
            this.reviseConfig({
                editorShowNav: val
            });
        },
        editorShowNav(val) {
            this.editor_show_nav = val;
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            language: (state) => state.config.language,
            autoSave: (state) => state.config.autoSave,
            editorExpandContent: (state) => state.config.editorExpandContent,
            editorShowNav: (state) => state.config.editorShowNav,
            theme: (state) => state.config.theme,
            show_editor: (state) => state.editor.show,
            type: (state) => state.editor.type,
            scrollTop: (state) => state.editor.scrollTop,
            history: (state) => state.editor.history,
            item: (state) => state.editor.item,
            displayMode: (state) => state.editor.displayMode,
            targetContent: (state) => state.editor.targetContent,
            pdfNoteInfo: (state) => state.editor.pdfNoteInfo,
            unsave: (state) => state.editor.unsave,
            target: (state) => state.editor.target
        }),
        ...mapGetters(['local', 'currentDataPath', 'currentDataPathItem']),
        showNav() {
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
        },
        isRemote() {
            return this.currentDataPathItem && !this.currentDataPathItem.local;
        }
    },
    mounted() {
        this.configInit();
        this.ShortCutInit();
        this.timerInit();
    },
    methods: {
        ...mapMutations({
            reviseEditor: 'reviseEditor',
            Editor: 'toggleEditor'
        }),
        ...mapActions({
            reviseConfig: 'reviseConfig'
        }),
        configInit() {
            this.auto_save = this.autoSave;
            this.expandContent = this.editorExpandContent;
            this.editor_show_nav = this.editorShowNav;
        },
        timerInit() {
            clearInterval(this.timer.autoSave);
            this.timer.autoSave = setInterval(() => {
                if (this.show_editor && this.auto_save && this.unsave) {
                    let editor = this.getEditor();
                    editor.save();
                    this.toggleUnsave(false);
                }
            }, 300);
        },
        diffContent() {
            let nodeDirtyAttrRemove = (obj) => {
                let dirtyAttrs = ['theme', 'headerForeground'];
                let arr = obj.content;
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].content && arr[i].content.length > 0)
                        arr = arr.concat(arr[i].content);
                }
                arr.forEach((el) => {
                    if (el.attrs) {
                        dirtyAttrs.forEach((attr) => {
                            if (el.attrs[attr]) delete el.attrs[attr];
                        });
                    }
                });
            };
            clearTimeout(this.timer.diff);
            this.timer.diff = setTimeout(() => {
                if (this.show_editor && this.lock.diff) {
                    this.lock.diff = false;
                    let editor = this.getEditor();

                    let targetContent = JSON.parse(
                        JSON.stringify(this.targetContent)
                    );
                    let thisContent = JSON.parse(
                        JSON.stringify(editor.editor.getJSON())
                    );
                    nodeDirtyAttrRemove(targetContent);
                    nodeDirtyAttrRemove(thisContent);
                    let diff = Diff.diffJson(targetContent, thisContent);
                    if (diff.length > 1) this.toggleUnsave(true);
                    else {
                        if (diff[0].added || diff[0].removed)
                            this.toggleUnsave(true);
                        else this.toggleUnsave(false);
                    }
                    this.lock.diff = true;
                }
            }, 300);
        },
        ShortCutInit() {
            window.addEventListener('keydown', this.shortCutEvent);
        },
        shortCutEvent(event) {
            if (!this.show_editor) return;
            let ctrl = event.ctrlKey || event.metaKey;
            if (event.keyCode === 83 && ctrl && !event.shiftKey) {
                event.preventDefault();
                let editor = this.getEditor();
                editor.save();
                this.toggleUnsave(false);
            } else if (event.keyCode === 83 && ctrl && event.shiftKey) {
                event.preventDefault();
                this.saveAs();
            }

            if (event.keyCode === 9) {
                event.preventDefault();
                if (
                    this.getEditor().editor.isActive('bulletList') ||
                    this.getEditor().editor.isActive('orderedList')
                )
                    return;
                if (this.readonly) return;
                this.getEditor().editor.commands.insertContent('    ');
            }
        },
        getEditor() {
            return this.$refs.editor;
        },
        openMarkdown() {
            let files = this.$refs.md_input.files;
            if (files.length > 0) {
                let file = files[0];
                let reader = new FileReader();
                reader.onload = (e) => {
                    let mdContent = e.target.result;
                    let obj = this.$refs.editor.computeMarkdown(mdContent);
                    this.content = obj;
                    this.$refs.md_input.value = '';
                };
                reader.readAsText(file);
            }
        },
        async refreshContent() {
            if (!this.type || !this.target || !this.target.id) return;
            if (!this.lock.loading) return;
            this.lock.loading = false;
            let res = null;
            if (this.type === 'item') {
                res = await this.$auto.AcademicController.getItemPageContent(
                    this.currentDataPath,
                    this.item.id,
                    this.target.id
                );
            } else {
                res = await this.$auto.AcademicController.getTemplateContent(
                    this.currentDataPath,
                    this.target.id
                );
            }
            this.docInfo = res.data;
            if (res.code === 200) {
                let content = res.data.content;
                try {
                    this.content = JSON.parse(content);
                    this.reviseEditor({
                        targetContent: this.content
                    });
                } catch (e) {
                    this.content = content;
                    this.reviseEditor({
                        targetContent: {
                            type: 'doc',
                            content: []
                        }
                    });
                }
                if (this.content === '') this.$refs.editor.focus();
                this.lock.loading = true;
            } else {
                this.$barWarning(res.message, {
                    status: 'error'
                });
                this.lock.loading = true;
            }
        },
        toggleUnsave(status = true) {
            this.reviseEditor({
                unsave: status
            });
        },
        switchAutoSave() {
            this.reviseConfig({
                autoSave: this.auto_save
            });
        },
        async saveContent(json) {
            if (!this.type || !this.target.id || this.displayMode === 1) return;
            if (!this.lock.save) return;
            this.lock.save = false;
            let onerror = (res) => {
                if (res.code === 40036) {
                    let sourceNotebook = res.data.content;
                    try {
                        sourceNotebook = JSON.parse(sourceNotebook);
                    } catch (e) {
                        sourceNotebook = {};
                    }
                    this.beforeSavingDiff.versionId = res.data.versionId;
                    this.beforeSavingDiff.author = res.data.author;
                    this.beforeSavingDiff.source = {
                        banner: null,
                        title: '',
                        content: sourceNotebook
                    };
                    this.beforeSavingDiff.target = {
                        banner: null,
                        title: '',
                        content: json
                    };
                    this.beforeSavingDiff.createDate = new Date(
                        res.data.createDate
                    );
                    this.show.diff = true;
                    this.$barWarning(
                        this.local(
                            `Current notebook version conflicts with remote version.`
                        ),
                        {
                            status: 'warning'
                        }
                    );
                    return;
                }
                this.$barWarning(res.message, {
                    status: 'error'
                });
            };
            if (this.type === 'item') {
                await this.$auto.AcademicController.saveItemPageContent(
                    this.currentDataPath,
                    this.item.id,
                    this.target.id,
                    this.docInfo.versionId,
                    JSON.stringify(json)
                )
                    .then((res) => {
                        if (res.data.versionId)
                            this.docInfo.versionId = res.data.versionId;
                        this.reviseEditor({
                            targetContent: json
                        });
                    })
                    .catch((res) => {
                        onerror(res);
                    });
            } else {
                await this.$auto.AcademicController.saveTemplateContent(
                    this.currentDataPath,
                    this.target.id,
                    this.docInfo.versionId,
                    JSON.stringify(json)
                )
                    .then((res) => {
                        if (res.data.versionId)
                            this.docInfo.versionId = res.data.versionId;
                        this.reviseEditor({
                            targetContent: json
                        });
                    })
                    .catch((res) => {
                        onerror(res);
                    });
            }
            this.lock.save = true;
        },
        commitDiff(result) {
            console.log(result);
            this.toggleUnsave(true);
            this.content = result.content;
            this.reviseEditor({
                targetContent: this.content
            });
            this.docInfo.versionId = this.beforeSavingDiff.versionId;
        },
        commitDiffAndSave(result) {
            this.commitDiff(result);
            this.commitDiff(result);
            setTimeout(() => {
                let editor = this.getEditor();
                editor.save();
                this.toggleUnsave(false);
            }, 300);
        },
        downloadTxtFile(text, filename) {
            // 创建一个新的 Blob 对象，用于存储文本内容
            const blob = new Blob([text], { type: 'text/plain' });

            // 创建一个 <a> 元素
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);

            // 设置文件名
            a.download = filename;

            // 模拟点击下载链接
            a.click();

            // 释放 URL 对象
            URL.revokeObjectURL(a.href);
        },
        saveAs() {
            let json = this.$refs.editor.editor.getJSON();
            let saveContent = Object.assign({}, fabulous_notebook);
            saveContent.title = this.target.name;
            saveContent.content = json;
            saveContent.updateDate = new Date();
            this.downloadTxtFile(JSON.stringify(saveContent), 'note.fbn');
        },
        saveMarkdown() {
            let saveContent = this.$refs.editor.saveMarkdown();
            this.downloadTxtFile(saveContent, 'note.md');
        },
        editorSetContentChange() {
            this.$refs.editor_nav.getEditorNavList();
        },
        editorContentChange() {
            this.diffContent();
            this.$refs.editor_nav.getEditorNavList();
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
            this.$auto.AcademicController.openItemFile(
                this.currentDataPath,
                itemid,
                fileid,
                type
            );
        },
        async mentionList(value) {
            let result = [];
            let rList = [];
            // let rPage = [];
            result.push({
                key: -1,
                name: this.local('Item'),
                type: 'header'
            });

            let queryPage =
                value.split('/').length > 1 ? value.split('/')[1] : '';

            let res = null;
            res = await this.$auto.AcademicController.getSearchItems(
                this.currentDataPath,
                null,
                value.split('/')[0],
                20,
                0
            );

            if (res.status !== 'success') return [];
            let items = res.data;

            items.forEach((el, idx) => {
                if (
                    el.name.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
                    el.name
                        .toLowerCase()
                        .indexOf(value.split('/')[0].toLowerCase()) > -1
                ) {
                    rList.push({
                        key: idx,
                        id: el.id,
                        name: `${el.emoji} ${el.name}`,
                        emoji: el.emoji,
                        pdf: el.pdf,
                        type: 'item'
                    });

                    if (value.indexOf('/') > -1) {
                        el.pages.forEach((page, pidx) => {
                            if (
                                page.name
                                    .toLowerCase()
                                    .indexOf(queryPage.toLowerCase()) > -1
                            ) {
                                rList.push({
                                    key: idx + '-' + pidx,
                                    id: page.id,
                                    name: `${page.emoji}  ${page.name}`,
                                    emoji: page.emoji,
                                    icon: 'Go',
                                    iconColor:
                                        this.theme === 'light'
                                            ? 'rgba(36, 36, 36, 1)'
                                            : 'rgba(220, 220, 220, 1)',
                                    parent: el,
                                    _page: page,
                                    type: 'page'
                                });
                            }
                        });
                        rList.push({
                            key: idx + '-divider',
                            name: `-`,
                            type: 'divider'
                        });
                    }
                }
            });
            rList = rList.slice(0, 20);
            result = result.concat(rList);

            return result;
        },
        previewHistory(item) {
            let contentData = item.content;
            try {
                let rawJson = JSON.parse(contentData);
                this.currentHistory = {
                    content: rawJson
                };
                console.log(rawJson);
            } catch (e) {
                this.currentHistory = {};
            }
            this.beforeSavingDiff.versionId = this.docInfo.versionId;
            this.show.historyPreview = true;
        },
        back() {
            let last = this.history[this.history.length - 1];
            this.history.splice(this.history.length - 1, 1);
            this.reviseEditor({
                type: last.type,
                item: last.item,
                target: last.page,
                scrollTop: last.scrollTop,
                history: this.history
            });
        },
        scrollToTop(top) {
            let editorContent = this.$el.querySelectorAll(
                '.tip-tap-editor-container'
            )[0];
            console.log(editorContent);
            if (!editorContent) return;
            editorContent.scrollTop = top;
        },
        getScrollTop() {
            let editorContent = this.$el.querySelectorAll(
                '.tip-tap-editor-container'
            )[0];
            return editorContent.scrollTop ? editorContent.scrollTop : 0;
        },
        scrollToPDFNote() {
            let editorContent = this.$el.querySelectorAll(
                '.tip-tap-editor-container'
            )[0];
            let children = this.$refs.editor.editor.contentComponent.$children;
            for (let component of children) {
                if (
                    component.node.type.name === 'pdfNote' &&
                    component.node.attrs.guid === this.pdfNoteInfo.guid
                ) {
                    const { top } = component.$el.getBoundingClientRect();
                    const { top: editorTop } =
                        editorContent.getBoundingClientRect();
                    editorContent.scrollTop =
                        editorContent.scrollTop + top - editorTop - 100;
                    break;
                }
            }
        },
        onMouseWheel(event) {
            if (event.ctrlKey) {
                event.preventDefault();
                if (event.deltaY > 0 && this.fontSize > 12) {
                    this.fontSize -= 1;
                } else if (this.fontSize < 72) {
                    this.fontSize += 1;
                }
            }
        }
    },
    beforeDestroy() {
        clearInterval(this.timer.autoSave);
    }
};
</script>

<style lang="scss">
.fabulous-editor-block {
    position: relative;
    width: 100%;
    height: 100%;
    top: 0px;
    right: 0px;
    flex-shrink: 0;
    background: rgba(250, 250, 250, 1);
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
        Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    box-shadow: -10px 3px 8px rgba(0, 0, 0, 0.1);
    transition: background 0.3s;
    overflow: hidden;
    z-index: 2;

    &.dark {
        background: rgba(47, 52, 55, 1);

        .main-display-block {
            background: rgba(47, 52, 55, 0.8);
        }
    }

    .control-banner {
        @include Vcenter;

        position: relative;
        min-height: 40px;
        height: 40px;
        padding-top: 32px;
        z-index: 3;

        .control-left-block {
            @include Vcenter;

            flex: 1;
            padding-left: 10px;
        }

        .control-right-block {
            @include Vcenter;

            .save-btn {
                margin-right: 15px;
            }

            .control-btn:last-child {
                margin-right: 10px;
            }
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
            flex: 1;
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
        border-right: solid rgba(75, 75, 75, 0.1) thin;
        border-radius: 8px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
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
            min-height: 55px;
            height: 55px;
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
                background: rgba(200, 200, 200, 0.6);

                &:hover {
                    background: rgba(200, 200, 200, 0.6);
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
                margin: 0px 5px;

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