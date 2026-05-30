<template>
    <transition name="scale-top-left-bounce">
        <div
            v-if="item && item.id"
            v-show="thisValue"
            class="quick-nav-block"
            :class="[{ dark: theme == 'dark' }]"
        >
            <div class="item-summary-card">
                <p v-if="item.emoji" class="emoji">{{ item.emoji || '📄' }}</p>
                <img
                    v-else
                    class="icon-img"
                    :src="img.folder"
                    :alt="local('Folder')"
                    :draggable="false"
                />
                <div class="text-block">
                    <p class="title" :title="item.name">{{ item.name || local('Untitled') }}</p>
                    <p class="sub">
                        {{ local('Pages') }}: {{ (item.pages && item.pages.length) || 0 }}
                    </p>
                </div>
            </div>
            <div class="item-list-scroll">
                <div
                    v-for="(page, index) in item.pages"
                    :key="index"
                    class="item"
                    :class="[{ choosen: target && page.id == target.id }]"
                    @click="openEditor(page)"
                >
                    <p v-if="page.emoji" class="emoji">{{ page.emoji || '📄' }}</p>
                    <img
                        v-else
                        class="icon-img"
                        :src="img.file"
                        :alt="local('File')"
                        :draggable="false"
                    />
                    <div class="info-content-block">
                        <p class="highlight" :title="page.name">{{ page.name }}</p>
                        <p class="sec date">{{ page.id.split('-').pop() }}</p>
                    </div>
                    <p class="sec">{{ $date(page.createDate) }}</p>
                </div>
                <div
                    v-show="itemType === 'item' && currentDataPath === editorDsId"
                    class="item"
                    @click="$emit('add-item-page')"
                >
                    <i class="ms-Icon ms-Icon--Add"></i>
                    <p style="margin-left: 15px">{{ local('Add Page') }}</p>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'

import defaultFolderImg from '@/assets/nav/folder.svg'
import defaultFileImg from '@/assets/nav/note.svg'

export default {
    props: {
        editorId: {
            type: String,
            required: true
        },
        modelValue: {
            default: false
        },
        trigger: {
            default: null
        },
        getScrollTop: {
            default: () => {
                return () => 0
            }
        }
    },
    data() {
        return {
            thisValue: this.modelValue,
            img: {
                folder: defaultFolderImg,
                file: defaultFileImg
            },
            lock: {
                loading: true
            }
        }
    },
    watch: {
        modelValue(newVal) {
            this.thisValue = newVal
        },
        thisValue(newVal) {
            this.$emit('update:modelValue', newVal)
        }
    },
    computed: {
        ...mapState(useAppConfig, {
            local: (state) => state.local,
            editorMap: (state) => state.editor
        }),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        }),
        ...mapState(useTheme, {
            theme: (state) => state.theme
        }),
        currentEditor() {
            return this.editorMap?.[this.editorId] || null
        },
        editorDsId() {
            return this.currentEditor?.dsId || null
        },
        item() {
            return this.currentEditor?.item || null
        },
        itemType() {
            return this.currentEditor?.type || null
        },
        target() {
            return this.currentEditor?.target || null
        },
        history() {
            return this.currentEditor?.history || []
        },
        unsave() {
            return this.currentEditor?.unsave || false
        }
    },
    mounted() {
        this.outSideClickInit()
    },
    methods: {
        ...mapActions(useAppConfig, {
            reviseEditor: 'reviseEditor'
        }),
        outSideClickInit() {
            window.addEventListener('click', this.outSideClickEvent)
        },
        outSideClickEvent(event) {
            if (
                !event.composedPath().includes(this.$el) &&
                !event.composedPath().includes(this.trigger)
            )
                this.thisValue = false
        },
        openEditor(page) {
            if (!this.lock.loading) return
            if (this.itemType === 'item' && this.item && this.target) {
                let history = this.history || []
                history.push({
                    type: this.itemType,
                    item: this.item,
                    page: this.target,
                    scrollTop: this.getScrollTop(),
                    dsId: this.editorDsId
                })
                this.reviseEditor({
                    id: this.editorId,
                    dsId: this.editorDsId,
                    type: 'item',
                    item: this.item,
                    target: page,
                    scrollTop: 0,
                    history: history,
                    cache: true
                })
                let path = `${this.editorDsId}/${this.item.id}/${page.id}`
                let url = `/academic/${encodeURI(path.replace(/\//g, '\\'))}`
                this.$Go(url)
            } else if (this.itemType === 'template' && this.item && this.target) {
                let history = this.history || []
                history.push({
                    type: this.itemType,
                    item: this.item,
                    page: this.target,
                    scrollTop: this.getScrollTop(),
                    dsId: this.editorDsId
                })
                this.reviseEditor({
                    id: this.editorId,
                    dsId: this.editorDsId,
                    type: 'template',
                    item: this.item,
                    target: page,
                    scrollTop: 0,
                    history: history,
                    cache: true
                })
                let path = `${this.editorDsId}/${page.id}`
                let url = `/academic/template/${encodeURI(path.replace(/\//g, '\\'))}`
                this.$Go(url)
            } else if (this.itemType === 'notebook' && this.item && this.target) {
                let history = this.history || []
                history.push({
                    type: this.itemType,
                    item: this.item,
                    page: this.target,
                    scrollTop: this.getScrollTop(),
                    dsId: this.editorDsId
                })
                this.reviseEditor({
                    id: this.editorId,
                    dsId: this.editorDsId,
                    type: 'notebook',
                    item: this.item,
                    target: page,
                    scrollTop: 0,
                    history: history,
                    cache: true
                })
                let url = `/notebook/${encodeURI(page.filePath.replace(/\//g, '\\'))}`
                this.$Go(url)
            }
        }
    },
    beforeUnmount() {
        window.removeEventListener('click', this.outSideClickEvent)
    }
}
</script>

<style lang="scss">
.quick-nav-block {
    position: absolute;
    left: 15px;
    top: 75px;
    width: 350px;
    height: auto;
    max-height: min(500px, 90%);
    padding: 5px;
    background: rgba(245, 245, 245, 0.6);
    border: solid rgba(120, 120, 120, 0.1) thin;
    border-radius: 8px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.1);
    overflow: auto;
    z-index: 3;

    .item-list-scroll {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0px 2px;
    }

    &.dark {
        background: rgba(24, 28, 34, 0.78);
        border-color: rgba(138, 156, 196, 0.22);
        box-shadow:
            0 12px 36px rgba(0, 0, 0, 0.42),
            0 2px 10px rgba(0, 0, 0, 0.28);

        .item {
            color: rgba(236, 241, 255, 0.95);
            border-color: rgba(138, 156, 196, 0.2);

            .info-content-block {
                .date {
                    opacity: 0.72;
                    color: rgba(198, 210, 236, 0.88);
                }
            }

            p {
                &.sec {
                    color: rgba(198, 210, 236, 0.88);
                }

                &.highlight {
                    color: rgba(236, 241, 255, 0.95);
                }
            }

            &.choosen {
                background: rgba(112, 133, 255, 0.22);
                border-color: rgba(132, 154, 255, 0.42);

                &:hover {
                    background: rgba(112, 133, 255, 0.28);
                }
            }

            &:hover {
                background: rgba(138, 156, 196, 0.16);
            }

            &:active {
                background: rgba(138, 156, 196, 0.24);
            }
        }

        .item-list-scroll {
            &::-webkit-scrollbar-thumb {
                background: rgba(180, 195, 230, 0.3);
            }
        }
    }

    .item {
        width: 100%;
        min-height: 65px;
        height: 65px;
        margin-bottom: 3px;
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
                max-width: 160px;
                text-align: left;
                cursor: pointer;

                &:hover {
                    color: rgba(149, 141, 241, 1);
                    text-decoration: underline;
                }
            }
        }
    }

    .icon-img {
        width: 24px;
        height: 24px;
        margin-right: 10px;
    }

    .item-summary-card {
        width: 100%;
        min-height: 72px;
        margin-bottom: 5px;
        padding: 10px 12px;
        border-radius: 12px;
        border: rgba(120, 120, 120, 0) solid thin;
        background: rgba(255, 255, 255, 0.12);
        box-sizing: border-box;
        display: flex;
        align-items: center;

        .emoji {
            font-size: 24px;
            margin-right: 10px;
        }

        .text-block {
            flex: 1;
            overflow: hidden;

            .title {
                @include nowrap;
                font-size: 13px;
                font-weight: 600;
            }

            .sub {
                margin-top: 4px;
                font-size: 12px;
                opacity: 0.7;
            }
        }
    }

    &.dark {
        .item-summary-card {
            background: rgba(40, 47, 60, 0.78);
            border-color: rgba(138, 156, 196, 0.24);
        }

        .item-summary-card .text-block {
            .title {
                color: rgba(236, 241, 255, 0.95);
            }

            .sub {
                color: rgba(198, 210, 236, 0.88);
                opacity: 0.9;
            }
        }
    }
}

.scale-top-left-bounce-enter-active {
    animation: scaleTopLeftIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
    transform-origin: left top;
}

.scale-top-left-bounce-leave-active {
    animation: scaleTopLeftOut 0.2s ease-out both;
    transform-origin: left top;
}

@keyframes scaleTopLeftIn {
    0% {
        opacity: 0;
        transform: scale(0.88);
    }
    70% {
        opacity: 1;
        transform: scale(1.03);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes scaleTopLeftOut {
    0% {
        opacity: 1;
        transform: scale(1);
    }
    100% {
        opacity: 0;
        transform: scale(0.96);
    }
}
</style>
