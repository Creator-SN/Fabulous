<template>
    <div
        class="fabulous-home-container"
        :class="[{dark: theme === 'dark', 'full-screen': expandContainer}]"
        @mousewheel="onMouseWheel"
    >
        <div class="control-banner">
            <div class="control-left-block">
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    :is-box-shadow="true"
                    @click="expandContainer ^= true"
                >
                    <i
                        class="ms-Icon"
                        :class="[`ms-Icon--${expandContainer ? 'BackToWindow' : 'FullScreen'}`]"
                    ></i>
                </fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    @click="readonly = readonly ? false : true"
                >
                    <i
                        class="ms-Icon"
                        :class="[
                            `ms-Icon--${
                                readonly === true ? 'Edit' : 'ReadingMode'
                            }`,
                        ]"
                    ></i>
                </fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    @click="expandContent = expandContent ? false : true"
                >
                    <i
                        class="ms-Icon"
                        :class="[
                            `ms-Icon--${
                                expandContent === true ? 'StaplingPortraitBookBinding' : 'StaplingLandscapeTwoTop'
                            }`,
                        ]"
                    ></i>
                </fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    :background="showNav ? 'rgba(0, 98, 158, 1)' : ''"
                    :foreground="showNav ? '#fff' : ''"
                    class="control-btn"
                    @click="showNav = showNav ? false : true"
                >
                    <i class="ms-Icon ms-Icon--ButtonMenu"></i>
                </fv-button>
                <fv-button
                    v-show="contentType !== 'fabulous_notebook'"
                    theme="dark"
                    :borderRadius="30"
                    class="control-btn"
                    background="linear-gradient(to right, #800080, #ffc0cb)"
                    :title="local('Upgrade to Fabulous Notebook')"
                    @click="upgrade"
                >
                    <i class="ms-Icon ms-Icon--UpArrowShiftKey"></i>
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
                    style="margin-left: 10px;"
                >
                </fv-toggle-switch>
            </div>
            <div class="control-right-block">
                <history-callout
                    v-if="isRemote"
                    :value="docInfo"
                    :theme="theme"
                    :local="local"
                    @chooseItem="previewHistory"
                ></history-callout>
            </div>
        </div>
        <div class="nav-banner">
            <fv-Breadcrumb
                :value="!isRemote ? path : remotePath"
                :disabled="history.length === 0"
                :theme="theme"
                :rootIcon="history.length > 0 ? 'PageLeft' : 'FolderHorizontal'"
                :separator="'ChevronRightMed'"
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
        <div class="main-display-block">
            <power-editor
                v-show="lock.loading"
                :value="fabulousNotebook.content"
                :placeholder="local('Write something ...')"
                :editable="!readonly"
                :theme="theme"
                :language="language"
                :editorBackground="
                    theme == 'dark' ? 'rgba(47, 52, 55, 0)' : 'rgba(250, 250, 250, 0)'"
                :editorOutSideBackground="
                    theme == 'dark' ? 'rgba(47, 52, 55, 0)' : 'rgba(250, 250, 250, 0)'"
                :toolbarHeight="160"
                :editablePaddingTop="180"
                :readOnlyPaddingTop="100"
                :contentMaxWidth="expandContent ? '99999px' : '900px'"
                :mobileDisplayWidth="0"
                ref="editor"
                :style="{background: 'transparent', 'font-size': `${fontSize}px`}"
                style="position: relative; width: 100%; height: 100%; flex: 1;"
                @save-json="saveConfirm"
                @click.native="show.quickNav = false"
                @change="editorContentChange"
                @content-change="editorSetContentChange"
            >
                <template v-slot:custom-buttons-front="x">
                    <fv-button
                        :theme="theme"
                        :foreground="theme === 'dark' ? 'rgba(200, 200, 200, 1)' : ''"
                        :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : ''"
                        :class="[x.defaultClass]"
                        :isBoxShadow="true"
                        :title="local('Import Markdown')"
                        @click="$refs.md_input.click()"
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
                        :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : ''"
                        :class="[x.defaultClass]"
                        :isBoxShadow="true"
                        :title="local('Save As')"
                        @click="saveAs"
                    >
                        <i class="ms-Icon ms-Icon--SaveAs"></i>
                    </fv-button>
                </template>
                <template v-slot:front-content>
                    <fv-img
                        v-show="fabulousNotebook.banner"
                        :src="currentBanner"
                        class="fabulous-notebook-banner-img"
                        @click.native="$refs.input.click()"
                    ></fv-img>
                    <div
                        v-show="!readonly && contentType === 'fabulous_notebook'"
                        class="fabulous-notebook-info-block"
                    >
                        <fv-button
                            v-show="!fabulousNotebook.banner"
                            :theme="theme"
                            icon="Picture"
                            background="rgba(255, 255, 255, 0.6)"
                            :border-radius="6"
                            foreground="rgba(120, 120, 120, 1)"
                            style="min-width: 120px; width: 50%; max-width: 300px;"
                            @click="$refs.input.click()"
                        >{{local('Add Banner')}}</fv-button>
                        <fv-button
                            v-show="fabulousNotebook.banner"
                            theme="dark"
                            icon="Picture"
                            background="rgba(220, 62, 72, 0.9)"
                            :border-radius="6"
                            style="min-width: 120px; width: 50%; max-width: 300px;"
                            @click="() => { fabulousNotebook.banner = ''; toggleUnsave(true); }"
                        >{{local('Delete Banner')}}</fv-button>
                        <input
                            v-show="false"
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
                            ref="input"
                            @change="chooseBanner"
                        />
                    </div>
                    <div class="fabulous-notebook-title-block">
                        <fv-text-box
                            v-show="!readonly && contentType == 'fabulous_notebook'"
                            :placeholder="local('Input title here ...')"
                            v-model="fabulousNotebook.title"
                            :theme="theme"
                            :font-size="28"
                            :font-weight="600"
                            :background="`transparent`"
                            :border-color="`rgba(245, 78, 162, 0.3)`"
                            :focus-border-color="`rgba(245, 78, 162, 0.8)`"
                            :border-width="3"
                            :border-radius="0"
                            underline
                            :readonly="readonly != false"
                            @keydown="toggleUnsave(true)"
                            style="height: 60px;"
                            :style="{width: '100%', 'max-width': expandContent ? '99999px' : '900px'}"
                        ></fv-text-box>
                        <p
                            v-show="readonly && fabulousNotebook.title"
                            class="fabulous-notebook-title"
                            :class="[{dark: theme === 'dark'}]"
                            :style="{width: '100%', 'max-width': expandContent ? '99999px' : '900px'}"
                        >{{fabulousNotebook.title}}</p>
                    </div>
                    <editor-nav
                        v-show="showNav"
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
        <save-options
            :show.sync="show.saveOptions"
            @save="confirmSaveAs"
        ></save-options>
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
import saveOptions from '@/components/notebook/saveOptions.vue';
import historyCallout from '@/components/general/callout/historyCallout.vue';
import templatePreview from '@/components/templates/templatePreview.vue';
import diffPreviewer from '@/components/general/editorContainer/diffPreviewer.vue';

import markdown from '@/assets/home/open_md.svg';

import { fabulous_notebook } from '@/js/data_sample.js';

export default {
    components: {
        editorNav,
        saveOptions,
        historyCallout,
        templatePreview,
        diffPreviewer
    },
    data() {
        return {
            path: '',
            remotePath: '',
            storeContent: '',
            contentType: '', // json, html, fabulous_notebook
            docInfo: {
                id: null,
                versionId: null
            },
            currentHistory: {},
            fabulousNotebook: {
                title: null,
                description: null,
                banner: null,
                content: null,
                author: [],
                createDate: null,
                updateDate: null
            },
            beforeSavingDiff: {
                versionId: null,
                author: null,
                source: null,
                target: null,
                createDate: new Date()
            },
            readonly: false,
            fontSize: 16,
            expandContent: false,
            showNav: false,
            history: [],
            auto_save: false,
            containerPos: {
                scrollTop: 0
            },
            expandContainer: false,
            img: {
                markdown
            },
            lock: {
                loading: true,
                diff: true,
                save: true
            },
            show: {
                bottomControl: false,
                saveOptions: false,
                historyPreview: false,
                diff: false
            },
            timer: {
                diff: undefined,
                autoSave: undefined
            }
        };
    },
    watch: {
        $route() {
            if (this.$route.name === 'NoteBook') {
                this.refreshPath();
            }
        },
        path() {
            this.refreshContent();
            this.getRemotePath();
        },
        auto_save() {
            this.switchAutoSave();
        },
        autoSave() {
            this.auto_save = this.autoSave;
        },
        expandContent(val) {
            this.reviseConfig({
                editorExpandContent: val
            });
        },
        editorExpandContent(val) {
            this.expandContent = val;
        },
        showNav(val) {
            this.reviseConfig({
                editorShowNav: val
            });
        },
        editorShowNav(val) {
            this.showNav = val;
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            unsave: (state) => state.editor.unsave,
            autoSave: (state) => state.config.autoSave,
            language: (state) => state.config.language,
            editorExpandContent: (state) => state.config.editorExpandContent,
            editorShowNav: (state) => state.config.editorShowNav,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath']),
        currentBanner() {
            if (!this.fabulousNotebook.banner) return '';
            return this.fabulousNotebook.banner;
        },
        isRemote() {
            return this.$route.path.startsWith('/notebook/remote');
        },
        Auto() {
            return this.isRemote ? this.$api : this.$local_api;
        }
    },
    mounted() {
        this.eventInit();
        this.configInit();
        this.ShortCutInit();
        this.timerInit();
        this.refreshPath();
    },
    methods: {
        ...mapMutations({
            reviseEditor: 'reviseEditor'
        }),
        ...mapActions({
            reviseConfig: 'reviseConfig'
        }),
        eventInit() {
            this.$el.addEventListener(
                'dragenter',
                (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                },
                false
            );
            this.$el.addEventListener(
                'dragover',
                (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                },
                false
            );
        },
        configInit() {
            this.auto_save = this.autoSave;
            this.expandContent = this.editorExpandContent;
            this.showNav = this.editorShowNav;
        },
        timerInit() {
            clearInterval(this.timer.autoSave);
            this.timer.autoSave = setInterval(() => {
                if (this.auto_save && this.unsave) {
                    this.$refs.editor.save();
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
                if (!this.lock.diff) return;
                this.lock.diff = false;
                let status = false;
                let thisContent = JSON.parse(
                    JSON.stringify(this.$refs.editor.editor.getJSON())
                );
                let storeContent = JSON.parse(
                    JSON.stringify(this.storeContent)
                );
                nodeDirtyAttrRemove(thisContent);
                nodeDirtyAttrRemove(storeContent);
                let diff = Diff.diffJson(storeContent, thisContent);
                if (diff.length > 1) status = true;
                else {
                    if (diff[0].added || diff[0].removed) status = true;
                }
                this.toggleUnsave(status);
                this.lock.diff = true;
            }, 300);
        },
        ShortCutInit() {
            window.addEventListener('keydown', this.shortCutEvent);
        },
        shortCutEvent(event) {
            if (this.$route.name !== 'NoteBook') return;
            let ctrl = event.ctrlKey || event.metaKey;
            if (event.keyCode === 83 && ctrl && !event.shiftKey) {
                this.getEditor().save();
            } else if (event.keyCode === 83 && ctrl && event.shiftKey) {
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
        getRemotePath() {
            if (!this.isRemote) return;
            this.$api.NotebookController.transferIdsToNames(this.path).then(
                (res) => {
                    if (res.status === 'success') {
                        this.remotePath = res.data;
                    }
                }
            );
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
                    this.fabulousNotebook.content = obj;
                    this.$refs.md_input.value = '';
                };
                reader.readAsText(file);
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
        refreshPath() {
            let path = decodeURI(this.$route.params.path);
            if (!path) return;
            path = path.replace(/\\/g, '/');
            this.path = path;
        },
        async refreshContent() {
            if (!this.path) return;
            if (!this.lock.loading) return;
            this.lock.loading = false;
            this.fabulousNotebook.banner = null;
            await this.Auto.NotebookController.getDocument(
                this.currentDataPath,
                this.path
            )
                .then((res) => {
                    if (res.status === 'success') {
                        let contentData = res.data.content;
                        this.docInfo = res.data;
                        try {
                            let rawJson = JSON.parse(contentData);
                            if (rawJson.fabulous_notebook) {
                                this.contentType = 'fabulous_notebook';
                                for (let key in this.fabulousNotebook)
                                    this.fabulousNotebook[key] = rawJson[key];
                            } else {
                                this.contentType = 'json';
                                this.fabulousNotebook.content = rawJson;
                            }
                            this.lock.loading = true;
                        } catch (e) {
                            let ext = this.path.split('.').pop();
                            if (ext === 'md') {
                                this.contentType = 'md';
                                this.fabulousNotebook.content =
                                    this.$refs.editor.insertMarkdown(
                                        contentData
                                    );
                            } else {
                                this.contentType = 'html';
                                this.fabulousNotebook.content = contentData;
                            }
                            this.lock.loading = true;
                        }
                        if (this.fabulousNotebook.content === '')
                            this.$refs.editor.focus();
                    }
                })
                .catch((res) => {
                    console.error(res);
                    this.$barWarning(this.local(`Read File Failed`), {
                        status: 'warning'
                    });
                    this.lock.loading = true;
                });
        },
        commitDiff(result) {
            console.log(result);
            this.toggleUnsave(true);
            this.fabulousNotebook.banner = result.banner;
            this.fabulousNotebook.title = result.title;
            this.fabulousNotebook.content = result.content;
            this.docInfo.versionId = this.beforeSavingDiff.versionId;
        },
        commitDiffAndSave(result) {
            this.commitDiff(result);
            this.saveClick();
        },
        editorContentChange() {
            this.diffContent();
            this.$refs.editor_nav.getEditorNavList();
        },
        editorSetContentChange() {
            // 外部修改绑定内容后, 内部设置完content触发content-change事件
            this.storeContent = this.getEditor().editor.getJSON();
            this.$refs.editor_nav.getEditorNavList();
        },
        saveContent(json) {
            let saveContent = null;
            if (this.contentType === 'fabulous_notebook') {
                let _fabulous_notebook = JSON.parse(
                    JSON.stringify(fabulous_notebook)
                );
                for (let key in this.fabulousNotebook) {
                    _fabulous_notebook[key] = this.fabulousNotebook[key];
                }
                _fabulous_notebook.content = json;
                _fabulous_notebook.updateDate = new Date();
                saveContent = JSON.stringify(_fabulous_notebook);
            } else if (this.contentType == 'md') {
                saveContent = this.$refs.editor.saveMarkdown();
            } else {
                saveContent = JSON.stringify(json);
            }
            return saveContent;
        },
        async saveConfirm(obj) {
            if (!this.lock.save) return;
            this.lock.save = false;
            let saveContent = this.saveContent(obj);
            await this.Auto.NotebookController.updateDocument(
                this.currentDataPath,
                this.path,
                this.docInfo.versionId,
                saveContent
            )
                .then((res) => {
                    if (res.status === 'success') {
                        if (res.data.versionId)
                            this.docInfo.versionId = res.data.versionId;
                        this.storeContent = this.getEditor().editor.getJSON();
                        this.toggleUnsave(false);
                    }
                })
                .catch((res) => {
                    if (res.code === 40036) {
                        let sourceNotebook = res.data.content.content;
                        try {
                            sourceNotebook = JSON.parse(sourceNotebook);
                        } catch (e) {
                            sourceNotebook = {};
                        }
                        this.beforeSavingDiff.versionId =
                            res.data.content.versionId;
                        this.beforeSavingDiff.author = res.data.content.author;
                        this.beforeSavingDiff.source = sourceNotebook;
                        this.beforeSavingDiff.target = JSON.parse(saveContent);
                        this.beforeSavingDiff.createDate = new Date(
                            res.data.content.createDate
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
                    console.error(res);
                    this.$barWarning(this.local(`Save Content Failed`), {
                        status: 'warning'
                    });
                });
            this.lock.save = true;
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
        },
        upgrade() {
            this.contentType = 'fabulous_notebook';
            this.fabulousNotebook.title = '';
        },
        chooseBanner() {
            if (this.$refs.input.files.length === 0) return;
            let file = this.$refs.input.files[0];
            let reader = new FileReader();
            reader.onload = (e) => {
                this.fabulousNotebook.banner = e.target.result;
                this.$refs.input.value = '';
            };
            reader.readAsDataURL(file);
            this.toggleUnsave(true);
        },
        saveClick() {
            this.$refs.editor.save();
            this.toggleUnsave(false);
        },
        saveAs() {
            this.show.saveOptions = true;
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
        confirmSaveAs(prop) {
            let saveContent = '';
            if (prop === 'md') {
                try {
                    saveContent = this.$refs.editor.saveMarkdown();
                    this.downloadTxtFile(saveContent, `notebook.${prop}`);
                } catch (e) {
                    this.$barWarning(
                        this.local(
                            'Export Markdown Failed, Please Check Your Content.'
                        ),
                        {
                            status: 'warning'
                        }
                    );
                }
            } else if (prop === 'html') {
                saveContent = this.$refs.editor.editor.getHTML();
                this.downloadTxtFile(saveContent, `notebook.${prop}`);
            } else {
                let json = this.$refs.editor.editor.getJSON();
                saveContent = this.saveContent(json);
                this.downloadTxtFile(saveContent, `notebook.${prop}`);
            }
        },
        previewHistory(item) {
            let contentData = item.content;
            try {
                let rawJson = JSON.parse(contentData);
                this.currentHistory = rawJson;
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
            this.$Go(`/notebook/${encodeURI(last)}`);
        }
    },
    beforeDestroy() {
        clearInterval(this.timer.autoSave);
        window.removeEventListener('keydown', this.shortCutEvent);
    }
};
</script>

<style lang="scss">
.fabulous-home-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(245, 245, 245, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;
    z-index: 1;

    &.dark {
        background: rgba(36, 36, 36, 1);
    }

    &.full-screen {
        position: fixed;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        z-index: 2;
    }

    .control-banner {
        @include Vcenter;

        position: relative;
        width: calc(100% - 12px);
        min-height: 40px;
        height: 40px;
        margin-left: 6px;
        padding-top: 32px;
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
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
        width: calc(100% - 12px);
        height: 40px;
        margin-left: 6px;
        padding: 0px 5px;

        box-sizing: border-box;
        display: flex;
        align-items: center;
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        z-index: 3;
    }

    .fabulous-notebook-info-block {
        @include HcenterVcenter;

        position: relative;
        width: 100%;
        height: 50px;
        padding: 0px 5px;
        box-sizing: border-box;
        overflow: hidden;
        z-index: 2;
    }

    .fabulous-notebook-banner-img {
        position: relative;
        width: calc(100% - 30px);
        height: auto;
        margin-left: 15px;
        margin-top: 25px;
        border-radius: 6px;
        transition: all 0.3s;
        z-index: 2;

        &:hover {
            opacity: 0.8;
        }

        &:active {
            opacity: 0.6;
        }
    }

    .fabulous-notebook-title-block {
        @include Hcenter;

        position: relative;
        width: 100%;
        padding: 15px;
        font-size: 24px;
        font-weight: 600;
        box-sizing: border-box;

        &.dark {
            color: whitesmoke;
        }

        .fabulous-notebook-title {
            &.dark {
                color: whitesmoke;
            }
        }
    }

    .main-display-block {
        @include Vend;

        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 1;
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
        z-index: 3;

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

    .ProseMirror {
        p {
            line-height: 2;
        }
    }
}
</style>