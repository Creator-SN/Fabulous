<template>
    <transition :name="itemCarrier.itemsX.length > 0 ? 'move-right-to-left' : 'move-left-to-right'">
        <div
            v-show="itemCarrier.itemsX.length > 0"
            class="fabulous-item-carrier"
            :class="[{ dark: theme == 'dark', show: show.panel }]"
        >
            <div
                v-show="!show.panel"
                class="carrier-flag"
                @click="show.panel = true"
            >
                <i class="ms-Icon ms-Icon--ChevronLeftSmall"></i>
            </div>
            <fv-panel
                v-model="show.panel"
                :title="local('Item Transfer Carrier')"
                :title-size="15"
                :theme="theme"
                width="600px"
                height="60%"
                :is-central-side="true"
                :is-footer="true"
            >
                <template v-slot:container>
                    <div class="panel-container">
                        <fv-collapse
                            v-for="(itemX, index) in itemCarrier.itemsX"
                            v-show="itemX.item.show"
                            :theme="theme"
                            :key="index"
                            :title="itemX.item.name"
                            :content="`${local('From Path')}: ${itemX.uri}`"
                            :disabled-collapse="true"
                            style="margin: 5px;"
                            @contextmenu.native="rightClick($event, itemX.item)"
                        >
                            <template v-slot:icon>
                                <div class="icon-block">
                                    <p class="index">{{index + 1}}</p>
                                    <fv-check-box
                                        v-model="itemX.choosen"
                                        :borderColor="theme == 'dark' ? 'whitesmoke' : ''"
                                        @click="itemChooseClick(itemX.item)"
                                    ></fv-check-box>
                                </div>
                            </template>
                            <template v-slot:title="x">
                                <div class="custom-collapse-title">
                                    <p
                                        class="title-content h"
                                        :title="x.title"
                                    >{{ x.title }}</p>
                                </div>
                            </template>
                            <template v-slot:content="x">
                                <div
                                    class="collapse-info"
                                    style="display: flex;"
                                >
                                    <p
                                        style="width: 180px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"
                                        :title="x.content"
                                    >{{ x.content }}</p>
                                    <fv-button
                                        v-if="itemX.item.metadata && itemX.item.metadata.year"
                                        theme="dark"
                                        background="rgba(0, 204, 153, 1)"
                                        fontSize="12"
                                        style="width: 50px; height: 25px; margin: 0px 15px;"
                                    >{{itemX.item.metadata.year}}</fv-button>
                                </div>
                            </template>
                            <template v-slot:extension>
                                <fv-tag
                                    :value="itemX.item.labels"
                                    :theme="theme"
                                    class="tag-block"
                                    :size="'xsmall'"
                                    style="max-width: 120px; overflow: auto;"
                                    @click.native="$emit('label-click', itemX.item)"
                                ></fv-tag>
                            </template>
                        </fv-collapse>
                    </div>
                </template>
                <template v-slot:footer>
                    <fv-button
                        theme="dark"
                        background="rgba(115, 153, 215, 1)"
                        icon="Download"
                        borderRadius="3"
                        style="width: 100px;"
                        :disabled="!lock"
                        @click="confirm"
                    >{{local('Confirm')}}</fv-button>
                    <fv-button
                        theme="dark"
                        background="rgba(220, 62, 72, 1)"
                        icon="Delete"
                        borderRadius="3"
                        :disabled="currentChoosen.length <= 0"
                        style="width: 100px; margin-left: 5px;"
                        @click="remove"
                    >{{local('Remove')}}</fv-button>
                    <fv-button
                        :theme="theme"
                        borderRadius="3"
                        style="width: 100px; margin-left: 5px;"
                        @click="show.panel = false"
                    >{{local('Close')}}</fv-button>
                </template>
            </fv-panel>
        </div>
    </transition>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex';

import { metadata as Metadata } from '@/js/data_sample.js';

export default {
    data() {
        return {
            lock: true,
            show: {
                panel: false
            }
        };
    },
    watch: {},
    computed: {
        ...mapState({
            data_index: (state) => state.config.data_index,
            data_path: (state) => state.config.data_path,
            itemCarrier: (state) => state.itemCarrier,
            counter: (state) => state.pdfImporter.counter,
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath']),
        currentChoosen() {
            let result = [];
            for (let i = 0; i < this.itemCarrier.itemsX.length; i++) {
                if (this.itemCarrier.itemsX[i].choosen)
                    result.push(this.itemCarrier.itemsX[i]);
            }
            return result;
        },
        Auto() {
            return (path) => {
                let item = this.data_path.find((item) => item.path === path);
                if (item.local) return this.$local_api;
                return this.$api;
            };
        }
    },
    methods: {
        ...mapMutations({
            revisePdfImporter: 'revisePdfImporter',
            reviseItemCarrier: 'reviseItemCarrier'
        }),
        itemChooseClick(itemX) {
            let index = this.itemCarrier.itemsX.indexOf(itemX);
            let t = itemX;
            t.choosen = !t.choosen;
            this.$set(this.itemCarrier.itemsX, index, t);
            this.$emit('change-value', this.itemCarrier.itemsX);
            this.$emit('choose-items', this.currentChoosen);
        },
        remove() {
            this.currentChoosen.forEach((itemX) => {
                let index = this.itemCarrier.itemsX.indexOf(itemX);
                this.itemCarrier.itemsX.splice(index, 1);
            });
            this.reviseItemCarrier({
                itemsX: this.itemCarrier.itemsX
            });
        },
        async confirm() {
            if (!this.lock) return;
            this.lock = false;

            let dataList = [];
            for (let i = 0; i < this.currentChoosen.length; i++) {
                let itemX = this.currentChoosen[i];
                let { item, uri } = itemX;

                // 迁移Pages (Migrate Pages)
                if (!Array.isArray(item.pages)) item.pages = [];

                for (let page of item.pages) {
                    await this.Auto(uri)
                        .AcademicController.getItemPageContent(
                            uri,
                            item.id,
                            page.id
                        )
                        .then((res) => {
                            if (res.status === 'success') {
                                page.content = res.data.content;
                            }
                        })
                        .catch((res) => {
                            console.warn(res.message);
                            page.content = '';
                        });
                }

                // 迁移PDF (Migrate PDF)
                if (item.pdf) {
                    await this.Auto(uri)
                        .AcademicController.getItemPDF(uri, item.id, item.pdf)
                        .then((res) => {
                            let blob = null;
                            if (!res.code) blob = res;
                            else blob = res.data;
                            item.pdfFile = blob;
                        })
                        .catch((res) => {
                            console.warn(res.message);
                        });
                }

                dataList.push(itemX);

                this.$emit(
                    'update-progress',
                    (((i + 1) / this.currentChoosen.length) * 50).toFixed(2)
                );
            }

            let newItemsCollection = [];
            for (let i = 0; i < dataList.length; i++) {
                let { item } = dataList[i];

                let targetUri = this.currentDataPath;

                let pureItem = JSON.parse(JSON.stringify(item));
                pureItem.pdf = null;
                pureItem.pdfFile = null;
                pureItem.pages = [];

                // let item_ = JSON.parse(JSON.stringify(Item));
                // for (let key in item_) {
                //     item_[key] = pureItem[key];
                // }

                // 创建新数据项 (Create New Item)
                let res = await this.Auto(
                    targetUri
                ).AcademicController.createItem(targetUri, pureItem);

                if (res.status !== 'success') {
                    this.$barWarning(res.message, {
                        status: 'error'
                    });
                    return;
                }

                let newItem = res.data;
                newItemsCollection.push(newItem);

                // 创建新PDF (Create New PDF)
                if (item.pdfFile) {
                    let res = await this.Auto(targetUri)
                        .AcademicController.updateItemPDF(
                            targetUri,
                            newItem.id,
                            newItem.id,
                            item.pdfFile
                        )
                        .catch((res) => {
                            console.warn('aaa', res.message);
                        });

                    if (res.status !== 'success') {
                        this.$barWarning(res.message, {
                            status: 'error'
                        });
                        return;
                    }
                }

                // 更新元数据 (Update Metadata)
                let _metadata = JSON.parse(JSON.stringify(Metadata));
                for (let key in _metadata) {
                    if (item.metadata !== undefined && item.metadata !== null)
                        _metadata[key] = item.metadata[key];
                }

                res = await this.Auto(targetUri)
                    .AcademicController.updateItemMetadata(
                        targetUri,
                        newItem.id,
                        _metadata
                    )
                    .catch((res) => {
                        console.warn(res.message);
                    });

                if (res.status !== 'success') {
                    this.$barWarning(res.message, {
                        status: 'error'
                    });
                    return;
                }

                // 创建新Pages (Create New Pages)
                for (let page of item.pages) {
                    let res = await this.Auto(targetUri)
                        .AcademicController.createItemPage(
                            targetUri,
                            newItem.id,
                            page
                        )
                        .catch((res) => {
                            console.warn(res.message);
                        });

                    if (res.status !== 'success') {
                        this.$barWarning(res.message, {
                            status: 'error'
                        });
                        return;
                    }
                }

                this.revisePdfImporter({
                    // 触发刷新Items
                    counter: this.counter + 1
                });

                this.$emit(
                    'update-progress',
                    (50 + ((i + 1) / dataList.length) * 50).toFixed(2)
                );
            }

            if (this.$route.params.id) {
                let partitionid = this.$route.params.id;
                let ids = newItemsCollection.map((item) => item.id);
                await this.Auto(this.currentDataPath)
                    .AcademicController.addItemsToPartition(
                        this.currentDataPath,
                        partitionid,
                        ids
                    )
                    .then(() => {
                        this.revisePdfImporter({
                            // 触发刷新Items
                            counter: this.counter + 1
                        });
                    })
                    .catch((res) => {
                        console.warn(res.message);
                    });
            }

            this.$emit('update-progress', 110);
            this.reviseItemCarrier({
                itemsX: []
            });
            this.show.panel = false;
            this.lock = true;
        }
    }
};
</script>

<style lang="scss">
.fabulous-item-carrier {
    position: fixed;
    width: 35px;
    height: 60px;
    top: 35px;
    right: 0px;
    padding: 5px;
    background: rgba(245, 245, 245, 0.6);
    border-radius: 8px;
    color: rgba(36, 36, 36, 1);
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    user-select: none;
    backdrop-filter: blur(50px);
    -webkit-backdrop-filter: blur(50px);
    z-index: 2;

    &:hover {
        background: rgba(250, 250, 250, 0.6);
    }

    &:active {
        background: rgba(235, 235, 235, 0.6);
    }

    &.dark {
        background: rgba(90, 90, 90, 0.6);
        color: whitesmoke;

        &:hover {
            background: rgba(120, 120, 120, 0.6);
        }

        &:active {
            background: rgba(50, 49, 48, 0.6);
        }

        &.show {
            background: rgba(90, 90, 90, 0.01);
        }
    }

    &.show {
        top: 0px;
        right: 0px;
        width: 100%;
        height: 100%;
        background: rgba(245, 245, 245, 0.01);
        border-radius: 0px;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
    }

    .carrier-flag {
        @include HcenterVcenter;

        position: relative;
        width: 100%;
        height: 100%;
        user-select: none;
    }

    .panel-container {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 15px 15px 55px 15px;
        color: rgba(28, 30, 41, 1);
        font-family: Akkurat Std, -apple-system, BlinkMacSystemFont, Segoe UI,
            Roboto, Oxygen, Ubuntu, Cantarell, Helvetica Neue, sans-serif;
        font-weight: 400;
        box-sizing: border-box;
        overflow: auto;

        .icon-block {
            @include HcenterVcenter;

            width: 90px;
            font-size: 15px;

            .index {
                margin-right: 10px;
                text-align: right;
            }
        }

        .custom-collapse-title {
            @include Vcenter;

            width: 100%;
            overflow: hidden;

            .title-content {
                @include nowrap;

                flex: 1;
                font-size: 13.8px;
                font-weight: bold;
                overflow: hidden;

                &.h {
                    cursor: pointer;

                    &:hover {
                        color: rgba(255, 180, 0, 1);
                    }
                }
            }

            .tag-block {
                width: 150px;
                margin-right: 25px;
                overflow-x: auto;
            }
        }
    }
}
</style>