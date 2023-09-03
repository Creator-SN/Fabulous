<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Diff Preview')"
        :theme="theme"
    >
        <template v-slot:header>
            <div class="diff-title-block">
                <p
                    class="panel-title"
                    style="font-size: 15px;"
                >{{local('Diff Preview')}}</p>
                <div class="diff-author-info-block">
                    <fv-Persona
                        :src="authorInfo.avatar"
                        class="diff-author-avatar"
                        :theme="theme"
                        size="28"
                    >
                    </fv-Persona>
                    <p class="diff-author-info">{{authorInfo.email ? authorInfo.email : author}}</p>
                    <time-rounder
                        :value="createDate"
                        :local="local"
                        icon="History"
                        style="width: auto; color: #999; margin-left: 5px;"
                    ></time-rounder>
                    <p class="diff-author-info">{{local('revised')}}</p>
                </div>
            </div>
        </template>
        <template v-slot:content>
            <div
                class="w-p-block"
                style="overflow: auto;"
            >
                <div
                    v-for="(item, index) in diffBannerList"
                    :key="'banner' + index"
                    class="diff-compare-block"
                >
                    <div
                        v-show="item.added || item.removed"
                        class="diff-option-block"
                    >
                        <fv-check-box
                            v-model="item.choosen"
                            :theme="theme"
                            background="rgba(140, 148, 228, 1)"
                            @click="checkBanner($event, index)"
                        >{{local('Keep')}} {{item.added ? local('Current') : local('Remote')}} {{local('Banner')}}</fv-check-box>
                    </div>
                    <fv-img
                        :src="item.value"
                        class="diff-notebook-banner-img"
                    ></fv-img>
                </div>
                <div
                    v-for="(item, index) in diffTitleList"
                    :key="'title' + index"
                    class="diff-compare-block"
                >
                    <div
                        v-show="item.added || item.removed"
                        class="diff-option-block"
                    >
                        <fv-check-box
                            v-model="item.choosen"
                            :theme="theme"
                            background="rgba(140, 148, 228, 1)"
                            @click="checkTitle($event, index)"
                        >{{local('Keep')}} {{item.added ? local('Current') : local('Remote')}} {{local('Title')}}</fv-check-box>
                    </div>
                    <p
                        class="diff-notebook-title"
                        :class="[{added: item.added}, {removed: item.removed}]"
                    >{{item.value}}</p>
                </div>
                <div
                    v-for="(item, index) in diffContentList"
                    :key="'content' + index"
                    class="diff-compare-block"
                >
                    <div
                        v-show="item.added || item.removed"
                        class="diff-option-block"
                    >
                        <fv-check-box
                            v-model="item.choosen"
                            :theme="theme"
                            background="rgba(140, 148, 228, 1)"
                        >{{local('Keep')}} {{item.added ? local('Current') : local('Remote')}}</fv-check-box>
                    </div>
                    <div
                        class="note-item-block"
                        :class="[{added: item.added}, {removed: item.removed}]"
                    >
                        <power-editor
                            :value="computedContent(item)"
                            :placeholder="local('No content here ...')"
                            :editable="false"
                            :theme="theme"
                            :editorBackground="item.added ? diffBackground[theme].added : item.removed ? diffBackground[theme].removed : diffBackground.normal"
                            :editorOutSideBackground="item.added ? diffBackground[theme].added : item.removed ? diffBackground[theme].removed : diffBackground.normal"
                            :mobileDisplayWidth="0"
                            :extensions="customExtensions"
                            style="position: relative; width: 100%; height: auto; background: transparent;"
                        ></power-editor>
                    </div>
                </div>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(140, 148, 228, 1)"
                :is-box-shadow="true"
                style="width: 120px;"
                @click="commit(true)"
            >{{local('Commit and Save')}}</fv-button>
            <fv-button
                theme="dark"
                background="rgba(140, 148, 228, 1)"
                :is-box-shadow="true"
                style="width: 100px; margin-left: 5px;"
                @click="commit(false)"
            >{{local('Commit')}}</fv-button>
            <fv-button
                theme="dark"
                background="rgba(220, 168, 228, 1)"
                :is-box-shadow="true"
                style="width: 120px; margin-left: 5px;"
                @click="discard"
            >{{local('Discard Changes')}}</fv-button>
            <fv-button
                :theme="theme"
                style="margin-left: 5px;"
                @click="thisShow = false"
            >{{local('Cancel')}}</fv-button>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from '@/components/window/floatWindowBase.vue';

import timeRounder from '@/components/general/timeRounder.vue';

import pdfNote from '@/components/general/editorCustom/extension/pdfNote.js';

import * as Diff from 'diff';

import { mapState, mapGetters } from 'vuex';

export default {
    components: {
        floatWindowBase,
        timeRounder
    },
    props: {
        source: {
            default: null
        },
        target: {
            default: null
        },
        value: {
            default: false
        },
        author: {
            default: ''
        },
        createDate: {
            default: new Date()
        }
    },
    data() {
        return {
            diffBannerList: [],
            diffTitleList: [],
            diffContentList: [],
            diffBackground: {
                light: {
                    added: '#e6ffed',
                    removed: '#ffeef0'
                },
                dark: {
                    added: 'rgba(77, 90, 52, 1)',
                    removed: 'rgba(77, 25, 29, 1)'
                },
                normal: 'transparent'
            },
            authorInfo: {
                name: '',
                email: '',
                avatar: null
            },
            customExtensions: [pdfNote],
            thisShow: this.value,
            timer: {
                diff: null
            }
        };
    },
    watch: {
        value(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit('input', val);
        },
        source() {
            this.getDiff();
        },
        target() {
            this.getDiff();
        },
        author() {
            this.getAuthorInfo();
            this.getAuthorAvatar();
        }
    },
    computed: {
        ...mapState({
            theme: (state) => state.config.theme
        }),
        ...mapGetters(['local', 'currentDataPath']),
        computedContent() {
            return (item) => {
                let content = [];
                item.value.forEach((it) => {
                    content.push(JSON.parse(it));
                });
                return {
                    type: 'doc',
                    content
                };
            };
        }
    },
    mounted() {},
    methods: {
        checkBanner(event, index) {
            this.diffBannerList.forEach((item, i) => {
                if (i === index) {
                    item.choosen = event;
                    this.$set(this.diffBannerList, i, item);
                } else {
                    item.choosen = !event;
                    this.$set(this.diffBannerList, i, item);
                }
            });
        },
        checkTitle(event, index) {
            this.diffTitleList.forEach((item, i) => {
                if (i === index) {
                    item.choosen = event;
                    this.$set(this.diffTitleList, i, item);
                } else {
                    item.choosen = !event;
                    this.$set(this.diffTitleList, i, item);
                }
            });
        },
        getDiff() {
            clearTimeout(this.timer.diff);
            this.timer.diff = setTimeout(() => {
                if (this.source && this.target) {
                    if (this.source.banner === this.target.banner) {
                        this.diffBannerList = [
                            {
                                count: 1,
                                choosen: true,
                                value: this.source.banner
                            }
                        ];
                    } else {
                        this.diffBannerList = [];
                        if (this.source.banner)
                            this.diffBannerList.push({
                                count: 1,
                                choosen: false,
                                value: this.source.banner,
                                removed: true
                            });
                        this.diffBannerList.push({
                            count: 1,
                            choosen: true,
                            value: this.target.banner,
                            added: true
                        });
                    }

                    let diffTitleList = Diff.diffWords(
                        this.source.title,
                        this.target.title
                    );
                    diffTitleList.forEach((item) => {
                        if (item.removed) {
                            item.choosen = false;
                        } else item.choosen = true;
                    });
                    this.diffTitleList = diffTitleList;

                    let sourceContent = Object.assign(
                        [],
                        this.source.content.content
                    );
                    let targetContent = Object.assign(
                        [],
                        this.target.content.content
                    );
                    sourceContent.forEach((item, index) => {
                        sourceContent[index] = JSON.stringify(item);
                    });
                    targetContent.forEach((item, index) => {
                        targetContent[index] = JSON.stringify(item);
                    });
                    let diff = Diff.diffArrays(sourceContent, targetContent);
                    diff.forEach((item) => {
                        if (item.removed) {
                            item.choosen = false;
                        } else item.choosen = true;
                    });
                    console.log(diff);
                    this.diffContentList = diff;
                }
                return [];
            }, 100);
        },
        commit(save = false) {
            let result = {
                banner: '',
                title: '',
                content: {
                    type: 'doc',
                    content: []
                }
            };
            this.diffBannerList.forEach((item) => {
                if (item.choosen) {
                    result.banner = item.value;
                }
            });
            this.diffTitleList.forEach((item) => {
                if (item.choosen) {
                    result.title += item.value;
                }
            });
            this.diffContentList.forEach((item) => {
                if (item.choosen) {
                    let content = [];
                    item.value.forEach((it) => {
                        content.push(JSON.parse(it));
                    });
                    result.content.content =
                        result.content.content.concat(content);
                }
            });
            if (!save) this.$emit('commit', result);
            else this.$emit('save', result);
            this.thisShow = false;
        },
        discard() {
            let result = {
                banner: this.source.banner,
                title: this.source.title,
                content: this.source.content
            };
            this.$emit('commit', result);
            this.thisShow = false;
        },
        getAuthorAvatar() {
            this.$api.UserController.getAvatar(this.author).then((res) => {
                if (res.code === 200) {
                    this.authorInfo.avatar = res.data;
                }
            });
        },
        getAuthorInfo() {
            this.$api.UserController.getUserById(this.author).then((res) => {
                if (res.code === 200) {
                    this.authorInfo.email = res.data.email;
                }
            });
        }
    }
};
</script>

<style lang="scss">
.diff-title-block {
    @include Vcenter;

    position: relative;
    width: 100%;

    .diff-author-info-block {
        @include HcenterVcenter;

        flex: 1;

        .diff-author-avatar {
            position: relative;
            margin-left: 5px;
        }

        .diff-author-info {
            margin-left: 5px;
            font-size: 12px;
            color: #999;
        }
    }
}

.diff-compare-block {
    position: relative;
    width: 100%;
    height: auto;
    margin-bottom: 5px;
    border: rgba(200, 200, 200, 0) solid 2px;
    border-radius: 6px;
    box-sizing: border-box;

    &:hover {
        background: rgba(140, 148, 228, 0.05);
        border-color: rgba(200, 200, 200, 0.05);
    }

    .diff-notebook-banner-img {
        position: relative;
        width: 100%;
        height: auto;
        border-radius: 6px;
        transition: all 0.3s;
        z-index: 2;
    }

    .diff-notebook-title {
        position: relative;
        width: 100%;
        padding: 15px;
        font-size: 24px;
        font-weight: 600;
        box-sizing: border-box;

        &.added {
            background: rgba(52, 220, 100, 0.2);
        }

        &.removed {
            background: rgba(255, 77, 79, 0.2);
        }
    }

    .diff-option-block {
        @include Vcenter;

        position: relative;
        height: 50px;
        padding: 0px 5px;
        box-sizing: border-box;

        p {
            margin-left: 15px;
            font-size: 12px;
            color: #999;
        }
    }

    .note-item-block {
        position: relative;
        width: 100%;
        height: auto;
        padding: 5px;
        box-sizing: border-box;

        &.added {
            border-left: transparent solid 3px;
            border-left-color: rgba(52, 220, 100, 0.2);
        }

        &.removed {
            border-left: transparent solid 3px;
            border-left-color: rgba(255, 77, 79, 0.2);
        }
    }
}
</style>