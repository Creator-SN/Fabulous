<template>
    <fv-panel
        v-model="thisValue"
        :theme="theme"
        width="500"
        :title="local(`Metadata`)"
        :is-light-dismiss="true"
        :isAcrylic="true"
        :isFooter="true"
    >
        <template v-slot:container>
            <div class="metadata-container" :class="{ dark: theme == 'dark' }">
                <div class="metadata-item">
                    <p class="title">Title</p>
                    <div class="row-block">
                        <fv-text-box
                            v-model="metadata.title"
                            :theme="theme"
                            :placeholder="local(`Please Input title...`)"
                            :underline="true"
                            :border-width="2"
                            :border-color="'rgba(200, 200, 200, 0.1)'"
                            :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                            :is-box-shadow="true"
                            style="height: 45px; font-size: 20px; flex: 1"
                            @keyup.enter="getMetaInfo"
                        ></fv-text-box>
                        <fv-button
                            theme="dark"
                            style="width: 35px; height: 35px; margin-left: 15px"
                            :title="local('Retrieve Metadata')"
                            background="rgba(140, 148, 228, 1)"
                            :is-box-shadow="true"
                            @click="getMetaInfo"
                        >
                            <i
                                class="ms-Icon ms-Icon--Sync"
                                :class="[{ circle: !lock.metaInfo }]"
                            ></i>
                        </fv-button>
                    </div>
                </div>
                <div v-show="metaInfoList.length > 0" class="metadata-item">
                    <div class="row-block between">
                        <p class="title">{{ local('Searching Metadata') }}</p>
                        <fv-button
                            theme="dark"
                            borderRadius="6"
                            :font-size="12"
                            background="rgba(220, 62, 72, 1)"
                            style="width: 35px; height: 20px"
                            @click="metaInfoList = []"
                        >
                            <i class="ms-Icon ms-Icon--Cancel"></i>
                        </fv-button>
                    </div>
                    <transition-group
                        tag="div"
                        name="move-left-to-right"
                        style="position: relative; width: 100%"
                    >
                        <div
                            v-for="(item, index) in metaInfoList"
                            class="meta-item"
                            :key="`${item.title}-${index}`"
                        >
                            <div class="title-block">
                                <i
                                    class="ms-Icon ms-Icon--RightDoubleQuote"
                                ></i>
                                <p
                                    class="highlight"
                                    :title="item.title"
                                    @click="updateMetadata(item)"
                                    @dblclick="metaInfoList = []"
                                >
                                    {{ item.title }}
                                </p>
                            </div>
                            <div class="label-block">
                                <fv-button
                                    theme="dark"
                                    background="rgba(145, 145, 235, 1)"
                                    :border-radius="12"
                                    style="
                                        width: 80px;
                                        height: 25px;
                                        flex-shrink: 0;
                                    "
                                    >{{ item.year }}</fv-button
                                >
                                <fv-button
                                    v-show="item.publisher"
                                    theme="dark"
                                    background="rgba(0, 145, 235, 1)"
                                    :border-radius="12"
                                    style="
                                        width: auto;
                                        height: 25px;
                                        margin: 0px 5px;
                                    "
                                    :title="item.publisher"
                                >
                                    <p style="padding: 0px 15px">
                                        {{ item.publisher }}
                                    </p>
                                </fv-button>
                            </div>
                            <div class="extension-block">
                                <p>{{ item.from }}</p>
                                <fv-button
                                    theme="dark"
                                    borderRadius="12"
                                    background="rgba(255, 180, 0, 1)"
                                    fontSize="12"
                                    :is-box-shadow="true"
                                    style="width: 30px; height: 20px"
                                    @click="
                                        () => {
                                            item.expand ^= true;
                                            $set(metaInfoList, index, item);
                                        }
                                    "
                                    ><i
                                        class="ms-Icon"
                                        :class="[
                                            `ms-Icon--${
                                                item.expand
                                                    ? 'ChevronUp'
                                                    : 'ChevronDown'
                                            }`
                                        ]"
                                    ></i
                                ></fv-button>
                            </div>
                            <transition :name="'abstract-move'">
                                <div
                                    v-show="item.expand"
                                    class="abstract-block"
                                >
                                    <span>{{ item.abstract }}</span>
                                </div>
                            </transition>
                        </div>
                    </transition-group>
                </div>
                <div class="metadata-item">
                    <p class="title">BibTex Tools</p>
                    <fv-text-field
                        v-model="metadata.bibtex"
                        class="metadata-text-area"
                        :class="{ dark: theme == 'dark' }"
                        :placeholder="local(`BibTex Content`)"
                        underline
                        :border-width="2"
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        :is-box-shadow="true"
                        style="width: 100%; margin: 5px 0px; font-size: 12px"
                    ></fv-text-field>
                    <div class="row-block">
                        <fv-button
                            :theme="theme"
                            :disabled="!metadata.bibtex"
                            background="rgba(255, 180, 0, 1)"
                            :font-weight="'bold'"
                            :border-radius="6"
                            :isBoxShadow="true"
                            icon="SemiboldWeight"
                            style="width: 135px; height: 35px"
                            @click="copyBibtex"
                        >
                            {{ local('Copy BibTex') }}
                        </fv-button>
                    </div>
                </div>
                <div class="metadata-item">
                    <p class="title">Publisher</p>
                    <fv-text-box
                        v-model="metadata.publisher"
                        :theme="theme"
                        :placeholder="local(`Please Input publisher...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Year</p>
                    <fv-text-box
                        v-model="metadata.year"
                        :theme="theme"
                        :placeholder="local(`Please Input year...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">DOI</p>
                    <fv-text-box
                        v-model="metadata.DOI"
                        :theme="theme"
                        :placeholder="local(`Please Input DOI...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">CreateDate</p>
                    <fv-text-box
                        v-model="metadata.createDate"
                        :theme="theme"
                        :placeholder="local(`Please Input createDate...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Source</p>
                    <fv-text-box
                        v-model="metadata.source"
                        :theme="theme"
                        :placeholder="local(`Please Input source...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Url</p>
                    <fv-text-box
                        v-model="metadata.url"
                        :theme="theme"
                        :placeholder="local(`Please Input url...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">ContainerTitle</p>
                    <fv-text-box
                        v-model="metadata.containerTitle"
                        :theme="theme"
                        :placeholder="local(`Please Input containerTitle...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Abstract</p>
                    <fv-text-field
                        v-model="metadata.abstract"
                        class="metadata-text-area"
                        :class="{ dark: theme == 'dark' }"
                        :placeholder="local(`Please Input abstract...`)"
                        underline
                        :border-width="2"
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        :is-box-shadow="true"
                        style="
                            width: 100%;
                            height: 300px;
                            font-family: 'Times New Roman';
                        "
                    ></fv-text-field>
                </div>
                <div class="metadata-item">
                    <p class="title">ISSN</p>
                    <fv-text-box
                        v-model="metadata.ISSN"
                        :theme="theme"
                        :placeholder="local(`Please Input ISSN...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Language</p>
                    <fv-text-box
                        v-model="metadata.language"
                        :theme="theme"
                        :placeholder="local(`Please Input language...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Chapter</p>
                    <fv-text-box
                        v-model="metadata.chapter"
                        :theme="theme"
                        :placeholder="local(`Please Input chapter...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Pages</p>
                    <fv-text-box
                        v-model="metadata.pages"
                        :theme="theme"
                        :placeholder="local(`Please Input pages...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Note</p>
                    <fv-text-box
                        v-model="metadata.note"
                        :theme="theme"
                        :placeholder="local(`Please Input note...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">School</p>
                    <fv-text-box
                        v-model="metadata.school"
                        :theme="theme"
                        :placeholder="local(`Please Input school...`)"
                        :border-width="2"
                        :is-box-shadow="true"
                        underline
                        :border-color="'rgba(200, 200, 200, 0.1)'"
                        :focus-border-color="'rgba(140, 148, 228, 0.8)'"
                        style="width: 100%; height: 35px"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Authors</p>
                    <fv-button
                        v-show="metadata.authors.length === 0"
                        theme="dark"
                        background="rgba(0, 204, 153, 1)"
                        borderRadius="50"
                        :font-size="12"
                        style="height: 25px"
                        @click="addAuthor(0)"
                    >
                        <i class="ms-Icon ms-Icon--Add"></i>
                    </fv-button>
                    <div
                        v-for="(author, index) in metadata.authors"
                        class="author-block"
                        :key="index"
                    >
                        <fv-button
                            theme="dark"
                            background="rgba(220, 62, 72, 1)"
                            borderRadius="50"
                            :font-size="12"
                            class="control-btn"
                            @click="delAuthor(index)"
                        >
                            <i class="ms-Icon ms-Icon--Remove"></i>
                        </fv-button>
                        <fv-text-box
                            v-model="author.first"
                            :placeholder="local('First Name')"
                            :theme="theme"
                            style="margin: 0px 3px"
                        ></fv-text-box>
                        <fv-text-box
                            v-model="author.last"
                            :placeholder="local('Last Name')"
                            :theme="theme"
                            style="margin: 0px 3px"
                        ></fv-text-box>
                        <fv-text-box
                            v-model="author.sequence"
                            :placeholder="local('Sequence')"
                            :theme="theme"
                            style="margin: 0px 3px"
                        ></fv-text-box>
                        <fv-button
                            theme="dark"
                            background="rgba(0, 204, 153, 1)"
                            borderRadius="50"
                            :font-size="12"
                            class="control-btn"
                            @click="addAuthor(index)"
                        >
                            <i class="ms-Icon ms-Icon--Add"></i>
                        </fv-button>
                    </div>
                </div>
            </div>
        </template>
        <template v-slot:footer>
            <fv-button
                theme="dark"
                background="rgba(140, 148, 228, 1)"
                :is-box-shadow="true"
                @click="save"
                >{{ local('Confirm') }}</fv-button
            >
            <fv-button
                :theme="theme"
                :is-box-shadow="true"
                style="margin-left: 5px"
                @click="thisValue = false"
                >{{ local('Cancel') }}</fv-button
            >
        </template>
    </fv-panel>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { META_API } from '@/js/meta_api.js';
import { author } from '@/js/data_sample.js';

export default {
    props: {
        value: {
            default: false
        },
        item: {
            default: null
        }
    },
    data() {
        return {
            thisValue: this.value,
            metaAPI: META_API,
            metaInfoList: [],
            metadata: {
                publisher: '',
                DOI: '',
                year: '',
                createDate: '',
                source: '',
                title: '',
                url: '',
                containerTitle: '', //一般是会议名称
                abstract: '',
                ISSN: '',
                language: '',
                chapter: '',
                pages: '',
                school: '',
                note: '',
                bibtex: '',
                authors: []
            },
            bibTexValue: {},
            bibTexOptions: [
                {
                    key: 'article',
                    text: 'Article',
                    required: {
                        author: 'author',
                        title: 'title',
                        journal: 'publisher',
                        year: 'year'
                    }
                },
                {
                    key: 'book',
                    text: 'Book',
                    required: {
                        author: 'author',
                        title: 'title',
                        publisher: 'publisher',
                        year: 'year'
                    }
                },
                {
                    key: 'booklet',
                    text: 'Booklet',
                    required: {
                        title: 'title'
                    }
                },
                {
                    key: 'inbook',
                    text: 'Inbook',
                    required: {
                        author: 'author',
                        title: 'title',
                        publisher: 'publisher',
                        year: 'year',
                        chapter: 'chapter',
                        pages: 'pages'
                    }
                },
                {
                    key: 'incollection',
                    text: 'Incollection',
                    required: {
                        author: 'author',
                        title: 'title',
                        publisher: 'publisher',
                        year: 'year',
                        booktitle: 'containerTitle'
                    }
                },
                {
                    key: 'conference',
                    text: 'Conference',
                    required: {
                        author: 'author',
                        title: 'title',
                        publisher: 'publisher',
                        year: 'year',
                        booktitle: 'containerTitle'
                    }
                },
                {
                    key: 'inproceedings',
                    text: 'Inproceedings',
                    required: {
                        author: 'author',
                        title: 'title',
                        publisher: 'publisher',
                        year: 'year',
                        booktitle: 'containerTitle'
                    }
                },
                {
                    key: 'manual',
                    text: 'Manual',
                    required: {
                        title: 'title'
                    }
                },
                {
                    key: 'mastersthesis',
                    text: 'Mastersthesis',
                    required: {
                        author: 'author',
                        title: 'title',
                        school: 'school',
                        year: 'year'
                    }
                },
                {
                    key: 'misc',
                    text: 'Misc',
                    required: {
                        title: 'title'
                    }
                },
                {
                    key: 'phdthesis',
                    text: 'Phdthesis',
                    required: {
                        author: 'author',
                        title: 'title',
                        school: 'school',
                        year: 'year'
                    }
                },
                {
                    key: 'proceedings',
                    text: 'Proceedings',
                    required: {
                        title: 'title',
                        year: 'year'
                    }
                },
                {
                    key: 'techreport',
                    text: 'Techreport',
                    required: {
                        author: 'author',
                        title: 'title',
                        institution: 'publisher',
                        year: 'year'
                    }
                },
                {
                    key: 'unpublished',
                    text: 'Unpublished',
                    required: {
                        author: 'author',
                        title: 'title',
                        note: 'note'
                    }
                }
            ],
            bibTexContent: '',
            lock: {
                metaInfo: true
            }
        };
    },
    watch: {
        value(val) {
            this.thisValue = val;
        },
        thisValue(val) {
            this.$emit('input', val);
        },
        item() {
            // console.log(this.item)
            this.metadataInit();
            this.metaInfoList = [];
            this.lock.metaInfo = true;
            this.bibTexContent = '';
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath'])
    },
    mounted() {
        this.metadataInit();
    },
    methods: {
        metadataInit() {
            if (!this.item.metadata) return;
            for (let key in this.metadata) {
                if (this.item.metadata[key]) {
                    if (
                        Object.prototype.toString.call(
                            this.item.metadata[key]
                        ) === '[object Object]'
                    )
                        this.metadata[key] = this.item.metadata[key];
                    else
                        this.metadata[key] = this.item.metadata[key].toString();
                } else this.metadata[key] = '';
            }
            if (!this.item.metadata.authors) this.metadata.authors = [];
        },
        addAuthor(index = 0) {
            this.metadata.authors.splice(
                index,
                0,
                JSON.parse(JSON.stringify(author))
            );
        },
        delAuthor(index) {
            this.metadata.authors.splice(index, 1);
        },
        async getMetaInfo() {
            if (!this.lock.metaInfo) return;
            if (!this.metadata.title) return;

            this.lock.metaInfo = false;

            let p = [];
            let fn = [
                this.metaAPI.dblp_getInfoByTitle,
                this.metaAPI.cref_getInfoByTitle,
                this.metaAPI.semanticScholar_getInfoByTitle,
                this.metaAPI.dataCite_getInfoByTitle
            ];
            for (let f of fn) {
                p.push(f(this.metadata.title, this.axios));
            }
            let result = [];
            await Promise.all(p).then((res) => {
                res.forEach((it) => {
                    result = result.concat(it);
                });
            });

            result.sort((a, b) => {
                let additionA = a.from === 'DBLP' ? 0.2 : 0;
                let additionB = b.from === 'DBLP' ? 0.2 : 0;
                return (
                    this.metaAPI.titleSimilar(b.title, this.metadata.title) +
                    additionB -
                    this.metaAPI.titleSimilar(a.title, this.metadata.title) -
                    additionA
                );
            });

            this.metaInfoList = result;
            this.lock.metaInfo = true;
        },
        updateMetadata(item) {
            Object.assign(this.metadata, item);
        },
        async save() {
            this.item.metadata = JSON.parse(JSON.stringify(this.metadata));
            this.saveMetadata(this.metadata, this.item.id);
            this.thisValue = false;
        },
        async saveMetadata(_metadata, id = null) {
            if (!id) id = this.item.id;
            let res = await this.$auto.AcademicController.updateItemMetadata(
                this.currentDataPath,
                id,
                _metadata
            );
            if (res.status !== 'success')
                this.$barWarning(res.message, {
                    status: 'warning'
                });
        },
        generateBibTex() {
            let required = this.bibTexValue.required;
            let result = {};
            for (let key in required) {
                if (key == 'author') {
                    if (!this.metadata.authors.length > 0) {
                        this.$barWarning(
                            `'${key}' ${this.local('is required')}`,
                            {
                                status: 'warning'
                            }
                        );
                        return;
                    }
                    this.metadata.authors.forEach((it) => {
                        let name = `${it.last}, ${it.first}`;
                        if (result.name) result.name += ` and ${name}`;
                        else result.name = name;
                    });
                } else {
                    if (!this.metadata[required[key]]) {
                        this.$barWarning(
                            `'${required[key]}' ${this.local('is required')}`,
                            {
                                status: 'warning'
                            }
                        );
                        return;
                    }
                    result[key] = this.metadata[required[key]];
                }
            }

            let midContent = () => {
                let r = '';
                for (let key in result) {
                    r += `${key} = {${result[key]}},\n`;
                }
                return r;
            };
            let bib = `@${this.bibTexValue.key} {fabulous${this.$Guid()},
                ${midContent()}
            }`;

            this.bibTexContent = bib;

            navigator.clipboard.writeText(bib);
            this.$barWarning(this.local('Successfully copied to clipboard'), {
                status: 'correct'
            });
        },
        copyBibtex() {
            if (!this.metadata.bibtex) {
                this.$barWarning(this.local('No BibTex Infomation'), {
                    status: 'warning'
                });
                return;
            }
            if (navigator.clipboard) {
                navigator.clipboard
                    .writeText(this.metadata.bibtex)
                    .then(() => {
                        this.$barWarning(this.local('Successfully Copied'), {
                            status: 'correct'
                        });
                    })
                    .catch((err) => {
                        this.$barWarning(err, {
                            status: 'error'
                        });
                    });
            } else {
                // 回退到 document.execCommand
                const input = document.createElement('input');
                input.value = this.metadata.bibtex;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                this.$barWarning(this.local('Successfully Copied'), {
                    status: 'correct'
                });
            }
        }
    }
};
</script>

<style lang="scss">
.metadata-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;

    &.dark {
        .metadata-item {
            .meta-item {
                background: rgba(20, 20, 20, 0.8);

                &.choosen {
                    background: rgba(36, 36, 36, 0.6);

                    &:hover {
                        background: rgba(36, 36, 36, 0.5);
                    }
                }

                &:hover {
                    background: rgba(36, 36, 36, 0.6);
                }

                &:active {
                    background: rgba(36, 36, 36, 0.5);
                }
            }
        }
    }

    .metadata-item {
        @include HstartC;

        position: relative;
        width: 100%;
        padding: 5px 20px;
        box-sizing: border-box;
        line-height: 2;

        .title {
            margin: 5px 0px;
            font-size: 12px;
            font-weight: bold;
        }

        .row-block {
            @include Vcenter;

            width: 100%;

            &.between {
                justify-content: space-between;
            }
        }

        .circle {
            animation: circle 1s infinite linear;
        }

        @keyframes circle {
            from {
                transform: rotate(0);
            }
            to {
                transform: rotate(360deg);
            }
        }

        .meta-item {
            width: 100%;
            min-height: 55px;
            height: auto;
            margin-bottom: 1.5px;
            padding: 0px 15px;
            font-size: 13.8px;
            font-weight: 600;
            border: rgba(200, 200, 200, 0.1) solid thin;
            border-radius: 8px;
            box-sizing: border-box;
            display: flex;
            transition: all 0.3s;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            user-select: none;

            &.choosen {
                background: rgba(255, 255, 255, 0.6);

                &:hover {
                    background: rgba(255, 255, 255, 0.8);
                }
            }

            &:hover {
                background: rgba(250, 250, 250, 0.6);
            }

            &:active {
                background: rgba(255, 255, 255, 0.8);
            }

            .title-block {
                @include Vcenter;

                width: 100%;
                margin: 8px 0px;
                overflow: hidden;

                i {
                    font-size: 36px;
                }

                p {
                    margin: 0px 12px;
                    font-size: 13px;
                }
            }

            .label-block {
                @include Vcenter;

                width: 100%;
                margin: 8px 0px;
                overflow-x: auto;

                p {
                    @include nowrap;
                }
            }

            .extension-block {
                @include HbetweenVcenter;

                width: 100%;
                margin: 8px 0px;

                p {
                    font-size: 12px;
                    font-weight: normal;
                    color: rgba(75, 75, 75, 0.8);
                }
            }

            .abstract-block {
                width: 100%;
                margin: 8px 0px;
                font-size: 12px;
                font-family: 'Times New Roman', Times, serif;
                font-weight: normal;
                text-align: justify;
            }

            p {
                &.sec {
                    font-size: 12px;
                    font-weight: normal;
                }

                &.highlight {
                    text-align: left;
                    cursor: pointer;

                    &:hover {
                        color: rgba(149, 141, 241, 1);
                        text-decoration: underline;
                    }
                }
            }
        }

        .metadata-text-area {
            position: relative;
            width: 300px;
            height: 250px;
            font-size: 16px;
            font-family: 'Times New Roman', Times, serif;
            resize: none;
            outline: none;
            line-height: 1.5;

            * {
                font-family: 'Times New Roman', Times, serif;
                line-height: 1.5;
            }

            &.dark {
                background: transparent;
            }
        }

        .author-block {
            @include HcenterVcenter;

            position: relative;
            width: 100%;
            margin: 5px 0px;

            .control-btn {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
            }
        }
    }

    .abstract-move-enter-active,
    .abstract-move-leave-active {
        transition: all 0.3s ease-in-out;
    }

    .abstract-move-enter,
    .abstract-move-leave-to {
        max-height: 0px;
        opacity: 0;
    }

    .abstract-move-enter-to,
    .abstract-move-leave {
        max-height: 800px;
        opacity: 1;
    }
}
</style>
