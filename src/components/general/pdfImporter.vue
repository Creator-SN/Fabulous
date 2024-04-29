<template>
    <transition :name="value ? 'move-right-to-left' : 'move-left-to-right'">
        <div
            v-show="value"
            class="fabulous-pdf-importer"
            :class="[{ dark: theme == 'dark' }]"
        >
            <input
                v-show="false"
                type="file"
                :multiple="mode === 'import' ? '' : false"
                accept=".pdf"
                ref="input"
                @change="getPDFData"
            />
            <div class="line">
                <img
                    draggable="false"
                    :src="img.pdf"
                    class="fab-pdf-importer-img-icon"
                    alt=""
                >
                <p class="title">{{ local("Processing PDF") }}</p>
            </div>
            <div
                class="line"
                style="margin-top: 15px;"
            >
                <p class="path">{{ path_title }}</p>
            </div>
            <div
                class="line"
                style="margin-top: 5px;"
            >
                <fv-progress-bar
                    v-model="progress"
                    foreground="white"
                    background="rgba(200, 200, 200, 0.3)"
                    style="width: 100%; border-radius: 6px;"
                ></fv-progress-bar>
            </div>
            <div class="line right">
                <fv-button
                    theme="dark"
                    :disabled="stop"
                    background="rgba(0, 98, 158, 1)"
                    style="margin-top: 15px"
                    @click="cancel"
                >{{ local("Cancel") }}</fv-button>
            </div>
            <img
                draggable="false"
                :src="img.pdf"
                class="fab-pdf-importer-img-icon-bg"
                alt=""
            >
        </div>
    </transition>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex';
import { META_API } from '@/js/meta_api.js';
import { metadata, author, item } from '@/js/data_sample.js';
import Extractor from '@/js/extractTitle.js';

import pdfIcon from '@/assets/home/pdf.svg';

export default {
    data() {
        return {
            extractor: Extractor,
            metaAPI: META_API,
            progress: 0,
            path_title: '',
            img: {
                pdf: pdfIcon
            },
            stop: false,
            lock: true
        };
    },
    watch: {
        df(val) {
            if (val.length > 0) this.dropFiles();
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path,
            data_index: (state) => state.config.data_index,
            value: (state) => state.pdfImporter.value,
            item: (state) => state.pdfImporter.item,
            mode: (state) => state.pdfImporter.mode,
            df: (state) => state.pdfImporter.df,
            counter: (state) => state.pdfImporter.counter,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath'])
    },
    mounted() {},
    methods: {
        ...mapMutations({
            revisePdfImporter: 'revisePdfImporter'
        }),
        inputInspectClick() {
            if (!this.item && this.mode === 'item') return;
            this.$refs.input.click();
        },
        async getPDFData() {
            if (!this.lock) return;
            this.lock = false;
            if (this.$refs.input.files.length === 0) return;
            // 为数据项替换PDF文件 (Replace PDF file for data item)
            if (this.mode === 'item') {
                if (!this.item) return;
                for (let i = 0; i < this.$refs.input.files.length; i++) {
                    let file = this.$refs.input.files[i];
                    let _metadata = await this.getTitleMetadata(file);
                    this.item.metadata = _metadata;
                    this.item.pdf = await this.copyPdf(file);
                    await this.saveMetadata(_metadata);
                }
                this.lock = true;
                this.$barWarning(this.local('Successfully update PDF file.'), {
                    status: 'correct'
                });
                return;
                // 在当前数据源导入PDF文件 (Import PDF file in current data source)
            } else if (this.mode === 'import') {
                this.revisePdfImporter({
                    value: true
                });
                for (let i = 0; i < this.$refs.input.files.length; i++) {
                    if (this.stop) {
                        this.stop = false;
                        this.lock = true;
                        this.revisePdfImporter({
                            value: false
                        });
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
                    _item.emoji = '📦';
                    _item.createDate = this.$SDate.DateToString(new Date());
                    _item.pdf = `${_item.id}`;
                    _item.metadata = _metadata;
                    console.log('metadata:', _metadata);
                    let res = await this.$auto.AcademicController.createItem(
                        this.currentDataPath,
                        _item
                    );
                    if (res.code !== 200) {
                        this.$barWarning(res.message, {
                            status: 'error'
                        });
                        this.stop = false;
                        this.lock = true;
                        this.revisePdfImporter({
                            value: false
                        });
                        return;
                    }
                    await this.copyPdf(file, res.data.id);
                    await this.saveMetadata(_metadata, res.data.id);
                    await this.copyToPartition(res.data.id);
                }
                this.stop = false;
                this.lock = true;
                this.revisePdfImporter({
                    value: false,
                    counter: this.counter + 1
                });
                this.progress = 0;
                this.path_title = '';
            }
        },
        async dropFiles() {
            if (!this.lock) return;
            this.lock = false;
            this.revisePdfImporter({
                value: true
            });
            for (let i = 0; i < this.df.length; i++) {
                if (this.stop) {
                    this.stop = false;
                    this.lock = true;
                    this.revisePdfImporter({
                        value: false
                    });
                    return;
                }
                this.progress = ((i + 1) / this.df.length) * 100;
                this.path_title = this.df[i].path;

                let file = this.df[i];
                let _metadata = await this.getTitleMetadata(file);
                let _item = JSON.parse(JSON.stringify(item));
                _item.id = this.$Guid();
                _item.name = _metadata.title;
                _item.emoji = '📦';
                _item.createDate = this.$SDate.DateToString(new Date());
                _item.pdf = `${_item.id}`;
                _item.metadata = _metadata;
                let res = await this.$auto.AcademicController.createItem(
                    this.currentDataPath,
                    _item
                );
                if (res.code !== 200) {
                    this.$barWarning(res.message, {
                        status: 'error'
                    });
                    this.stop = false;
                    this.lock = true;
                    return;
                }
                await this.copyPdf(file, res.data.id);
                await this.saveMetadata(_metadata, res.data.id);
                await this.copyToPartition(res.data.id);
            }
            this.stop = false;
            this.lock = true;
            this.revisePdfImporter({
                value: false,
                df: [],
                counter: this.counter + 1
            });
            this.progress = 0;
            this.path_title = '';
        },
        async copyToPartition(itemid) {
            let id = this.$route.params.id;
            if (!id) return;
            let res = null;
            res = await this.$auto.AcademicController.addItemsToPartition(
                this.currentDataPath,
                id,
                [itemid]
            );
            if (res.code !== 200) {
                this.$barWarning(res.message, {
                    status: 'error'
                });
                return;
            }
        },
        async copyPdf(objURL, id = null) {
            if (!id) id = this.item.id;
            // 2023/11/26
            // fix macos app:// schema.
            // /Users/Username -> Production app://./Users/Username
            // so remove app://.
            // console.log(objURL)
            // if (objURL.startsWith("app://")){
            //     objURL = objURL.replace("app://","")
            //     if (objURL.startsWith(".")){
            //         objURL = objURL.substring(1)
            //     }
            // }
            objURL = URL.createObjectURL(objURL);
            let blob = await fetch(objURL).then((r) => r.blob());
            let pdfid = id;
            await this.$auto.AcademicController.updateItemPDF(
                this.currentDataPath,
                id,
                id,
                blob
            )
                .then((res) => {
                    if (res.code === 200) pdfid = res.data;
                })
                .catch((res) => {
                    this.$barWarning(res.message, {
                        status: 'warning'
                    });
                });
            return pdfid;
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
        async getTitleMetadata(file) {
            this.extractor.PDFJS = this.$PDFJS;
            let title = await this.extractor.getTitle(
                URL.createObjectURL(file)
            );
            let pdfMetadata = await this.extractor.getMetadata(
                URL.createObjectURL(file)
            );
            if (pdfMetadata.title && pdfMetadata.title != '')
                title = pdfMetadata.title;
            else if (pdfMetadata.Title && pdfMetadata.Title != '')
                title = pdfMetadata.Title;
            let crefInfo = await this.getMetaInfo(title);
            let _metadata = JSON.parse(JSON.stringify(metadata));
            _metadata.title = title;
            if (pdfMetadata.Author && pdfMetadata.Author.indexOf(' ; ') > -1) {
                let authors = [];
                let authors_str = pdfMetadata.Author.split(' ; ');
                authors_str.forEach((el, idx) => {
                    let _author = JSON.parse(JSON.stringify(author));
                    _author.first = el.split(' ')[0];
                    _author.last =
                        el.split(' ').length > 1 ? el.split(' ')[1] : '';
                    _author.sequence = idx;
                    authors.push(_author);
                });
                _metadata.authors = authors;
            }

            for (let it of crefInfo) {
                if (it.title.toLowerCase() === title.toLowerCase()) {
                    Object.assign(_metadata, it);
                }
            }
            return _metadata;
        },
        async getMetaInfo(title) {
            let p = [];
            let fn = [
                this.metaAPI.cref_getInfoByTitle,
                this.metaAPI.semanticScholar_getInfoByTitle,
                this.metaAPI.dataCite_getInfoByTitle
            ];
            for (let f of fn) {
                p.push(f(title, this.axios));
            }
            let result = [];
            await Promise.all(p).then((res) => {
                res.forEach((it) => {
                    result = result.concat(it);
                });
            });
            return result;
        },
        cancel() {
            this.stop = true;
        }
    }
};
</script>

<style lang="scss">
.fabulous-pdf-importer {
    position: fixed;
    width: 350px;
    height: auto;
    top: 60px;
    right: 15px;
    padding: 15px 0px;
    background: rgba(250, 250, 250, 0.9);
    border: rgba(36, 36, 36, 0.1) solid thin;
    border-radius: 6px;
    color: rgba(50, 49, 48, 1);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    box-shadow: 0px 6px 12px rgba(120, 120, 120, 0.1);
    transition: all 0.3s;
    user-select: none;
    backdrop-filter: blur(50px);
    -webkit-backdrop-filter: blur(50px);
    z-index: 2;

    &.dark {
        background: rgba(50, 49, 48, 0.9);
        color: rgba(250, 250, 250, 1);
        border: rgba(90, 90, 90, 0.1) solid thin;
        box-shadow: 0px 6px 12px rgba(36, 36, 36, 0.1);

        .line {
            .path {
                color: rgba(200, 200, 200, 1);
            }
        }
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
            color: rgba(90, 90, 90, 1);
        }

        &.right {
            justify-content: flex-end;
        }
    }

    .fab-pdf-importer-img-icon {
        position: relative;
        width: 25px;
        height: auto;
        margin-right: 15px;
        object-fit: cover;
        user-select: none;
    }

    .fab-pdf-importer-img-icon-bg {
        position: absolute;
        width: 100%;
        height: 50px;
        object-fit: cover;
        user-select: none;
        filter: blur(25px);
        opacity: 0.8;
    }
}
</style>