<template>
    <transition :name="thisValue ? 'move-right-to-left' : 'move-left-to-right'">
        <div
            v-show="thisValue"
            class="ikfb-pdf-importer"
            :class="[{dark: theme == 'dark'}]"
        >
            <input
                v-show="false"
                type="file"
                :multiple="mode === 'import' ? '' : false"
                accept=".pdf"
                ref="input"
                @change="getPDFData"
            >
            <div class="line">
                <p class="title">{{local('Processing PDF')}}</p>
            </div>
            <div class="line">
                <p class="path">{{path_title}}</p>
            </div>
            <div class="line">
                <fv-progress-bar
                    v-model="progress"
                    foreground="white"
                    background="rgba(200, 200, 200, 0.3)"
                ></fv-progress-bar>
            </div>
            <div class="line right">
                <fv-button
                    theme="dark"
                    :disabled="stop"
                    background="rgba(0, 153, 204, 1)"
                    style="margin-top: 15px;"
                    @click="cancel"
                >{{local('Cancel')}}</fv-button>
            </div>
        </div>
    </transition>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";
import { metadata, author, item } from "@/js/data_sample.js";
import Extractor from "@/js/extractTitle.js";

const { ipcRenderer: ipc } = require("electron");
const path = require("path");

export default {
    props: {
        value: {
            default: false,
        },
        item: {
            default: null,
        },
        mode: {
            default: "item",
        },
    },
    data() {
        return {
            thisValue: this.value,
            extractor: Extractor,
            progress: 0,
            path_title: "",
            stop: false,
        };
    },
    watch: {
        value(val) {
            this.thisValue = val;
        },
        thisValue(val) {
            this.$emit("input", val);
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            data_index: (state) => state.data_index,
            items: (state) => state.data_structure.items,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
        }),
        inputInspectClick() {
            if (!this.item && this.mode === "item") return;
            this.$refs.input.click();
        },
        async getPDFData() {
            if (!this.item) return;
            if (this.$refs.input.files.length === 0) return;
            if (this.mode === "item") {
                for (let i = 0; i < this.$refs.input.files.length; i++) {
                    let file = this.$refs.input.files[i];
                    let _metadata = await this.getTitleMetadata(file);
                    let item = this.items.find((it) => it.id === this.item.id);
                    item.pdf = `${item.id}`;
                    item.metadata = _metadata;
                    this.reviseDS({
                        $index: this.data_index,
                        items: this.items,
                    });
                    await this.copyPdf(file.path);
                    await this.saveMetadata(_metadata);
                }
            } else if (this.mode === "import") {
                this.thisValue = true;
                for (let i = 0; i < this.$refs.input.files.length; i++) {
                    if (this.stop) {
                        this.stop = false;
                        this.thisValue = false;
                        return;
                    }
                    this.progress =
                        ((i + 1) / this.$refs.input.files.length) * 100;
                    this.path_title = this.$refs.input.files[i].path;

                    let file = this.$refs.input.files[i];
                    let _metadata = await this.getTitleMetadata(file);
                    let _item = JSON.parse(JSON.stringify(item));
                    _item.id = this.$Guid();
                    _item.name = _metadata.title;
                    _item.emoji = "📦";
                    _item.createDate = this.$SDate.DateToString(new Date());
                    _item.pdf = `${_item.id}`;
                    _item.metadata = _metadata;
                    this.items.push(_item);
                    this.reviseDS({
                        $index: this.data_index,
                        items: this.items,
                    });
                    await this.copyPdf(file.path, _item.id);
                    await this.saveMetadata(_metadata, _item.id);
                }
                this.stop = false;
                this.thisValue = false;
                this.progress = 0;
                this.path_title = "";
            }
        },
        async copyPdf(objURL, id = null) {
            if (!id) id = this.item.id;
            let url = path.join(
                this.data_path[this.data_index],
                "root/items",
                `${id}/${id}.pdf`
            );
            ipc.send("copy-file", {
                src: objURL,
                tgt: url,
            });
            await new Promise((resolve) => {
                ipc.on("copy-file-callback", () => {
                    resolve(1);
                });
            });
        },
        async saveMetadata(_metadata, id = null) {
            if (!id) id = this.item.id;
            let url = path.join(
                this.data_path[this.data_index],
                "root/items",
                `${id}/${id}.metadata`
            );
            ipc.send("output-file", {
                path: url,
                data: JSON.stringify(_metadata),
            });
            await new Promise((resolve) => {
                ipc.on("output-file-callback", () => {
                    resolve(1);
                });
            });
        },
        async getTitleMetadata(file) {
            this.extractor.PDFJS = this.$PDFJS;
            let title = await this.extractor.getTitle(
                URL.createObjectURL(file)
            );
            let pdfMetadata = await this.extractor.getMetadata(
                URL.createObjectURL(file)
            );
            title = pdfMetadata.title ? pdfMetadata.title : title;
            let crefInfo = await this.cref_getInfoByTitle(title);
            let _metadata = JSON.parse(JSON.stringify(metadata));
            _metadata.title = title;
            if (pdfMetadata.Author && pdfMetadata.Author.indexOf(" ; ") > -1) {
                let authors = [];
                let authors_str = pdfMetadata.Author.split(" ; ");
                authors_str.forEach((el, idx) => {
                    let _author = JSON.parse(JSON.stringify(author));
                    _author.first = el.split(" ")[0];
                    _author.last =
                        el.split(" ").length > 1 ? el.split(" ")[1] : "";
                    _author.sequence = idx;
                    authors.push(_author);
                });
                _metadata.authors = authors;
            }
            for (let it of crefInfo) {
                if (it.title[0] === title) {
                    let authors = [];
                    _metadata.DOI = it.DOI;
                    _metadata.abstract = it.abstract;
                    _metadata.ISSN = it.ISSN ? it.ISSN[0] : "";
                    _metadata.containerTitle = it["container-title"]
                        ? it["container-title"][0]
                        : "";
                    _metadata.createDate = it.created
                        ? it.created["date-time"]
                        : "";
                    _metadata.language = it.language;
                    _metadata.publisher = it.publisher;
                    _metadata.source = it.source;
                    _metadata.url = it.URL;
                    it.author.forEach((el) => {
                        let _author = JSON.parse(JSON.stringify(author));
                        _author.first = el.first;
                        _author.last = el.last;
                        _author.sequence = el.sequence;
                        authors.push(_author);
                    });
                    _metadata.authors = authors;
                }
            }
            return _metadata;
        },
        async cref_getInfoByTitle(title) {
            let baseUrl = "https://api.crossref.org/works";
            title = title.replace(/ +/g, "+");
            try {
                return await new Promise((resolve) => {
                    this.axios
                        .get(
                            baseUrl,
                            {
                                params: {
                                    "query.bibliographic": title,
                                },
                            },
                            {
                                timeout: 10000,
                            }
                        )
                        .then((response) => {
                            resolve(response.data.message.items);
                        })
                        .catch((error) => {
                            this.$barWarning(error, {
                                status: "error",
                            });
                            this.stop = false;
                            this.thisValue = false;
                            this.progress = 0;
                            this.path_title = "";
                        });
                });
            } catch (e) {
                return [];
            }
        },
        cancel() {
            this.stop = true;
        },
    },
};
</script>

<style lang="scss">
.ikfb-pdf-importer {
    position: fixed;
    width: 350px;
    height: auto;
    top: 60px;
    right: 15px;
    padding: 15px 5px;
    background: rgba(32, 102, 156, 0.9);
    border-radius: 8px;
    color: whitesmoke;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    box-shadow: 10px 3px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    user-select: none;
    backdrop-filter: blur(50px);
    -webkit-backdrop-filter: blur(50px);
    z-index: 2;

    &.dark {
    }

    .line {
        @include Vcenter;

        position: relative;
        width: 100%;
        height: auto;
        padding: 0px 15px;
        box-sizing: border-box;
        line-height: 2;

        .title {
            font-size: 20px;
            font-weight: bold;
        }

        .path {
            @include nowrap;

            font-size: 12px;
            color: rgba(230, 230, 230, 1);
        }

        &.right {
            justify-content: flex-end;
        }
    }
}
</style>