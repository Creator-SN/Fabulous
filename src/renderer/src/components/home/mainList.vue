<template>
    <div class="collapse-list-block" style="height: 100%">
        <fv-collapse
            v-for="(item, index) in modelValue"
            :theme="theme"
            :key="index"
            :title="item.name"
            :content="`${local('Create Time')}: ${$date(item.createDate)}`"
            :background="theme === 'dark' ? 'rgba(23, 29, 39, 0.6)' : ''"
            :hover-background="theme === 'dark' ? 'rgba(19, 24, 35, 0.8)' : ''"
            :border-color="theme === 'dark' ? 'rgba(120, 120, 120, 0.2)' : ''"
            :default-height="60"
            :maxHeight="'auto'"
            :disabled-collapse="edit"
            style="margin: 1.5px 3px"
            @contextmenu.capture="rightClick($event, item)"
        >
            <template v-slot:icon>
                <div v-show="!edit" class="icon-block">
                    <p class="index">{{ index + 1 }}</p>
                    <emoji-callout
                        :model-value="item.emoji"
                        :theme="theme"
                        @insert-emoji="
                            $emit('insert-emoji', {
                                item: item,
                                emoji: $event
                            })
                        "
                    ></emoji-callout>
                </div>
                <div v-show="edit" class="icon-block">
                    <p class="index">{{ index + 1 }}</p>
                    <fv-check-box
                        v-model="item.choosen"
                        background="rgba(140, 148, 228, 1)"
                        :borderColor="theme == 'dark' ? 'whitesmoke' : ''"
                        @click="itemChooseClick(item)"
                    ></fv-check-box>
                </div>
            </template>
            <template v-slot:title="x">
                <div class="custom-collapse-title">
                    <p
                        class="title-content h"
                        :title="x.title"
                        @click="itemTitleClick($event, item)"
                        @dblclick="
                            item.pdf
                                ? $emit('open-file', `${item.id}/${item.pdf}.pdf`)
                                : $emit('open-file', `${item.id}`)
                        "
                    >
                        {{ x.title }}
                    </p>
                </div>
            </template>
            <template v-slot:content="x">
                <div class="collapse-info" style="display: flex">
                    <p style="width: 180px">{{ x.content }}</p>
                    <fv-button
                        v-if="item.metadata && item.metadata.year"
                        theme="dark"
                        background="rgba(0, 204, 153, 1)"
                        fontSize="12"
                        font-weight="bold"
                        :border-radius="16"
                        style="width: 50px; height: 23px; flex-shrink: 0; margin: 0px 2px 0px 5px"
                        >{{ item.metadata.year }}</fv-button
                    >
                </div>
            </template>
            <template v-slot:extension>
                <fv-tag
                    :model-value="item.labels"
                    :theme="theme"
                    class="tag-block"
                    :size="'xsmall'"
                    style="max-width: 120px; font-weight: bold; overflow: overlay"
                    @click.capture="$emit('label-click', item)"
                ></fv-tag>
                <fv-button
                    v-if="item.metadata && item.metadata.bibtex"
                    :theme="theme"
                    :background="
                        theme === 'dark' ? 'rgba(255, 180, 0, 1)' : 'rgba(255, 203, 136, 1)'
                    "
                    fontSize="12"
                    font-weight="bold"
                    :border-radius="50"
                    :is-box-shadow="true"
                    :title="local('Copy BibTex')"
                    style="width: 23px; height: 23px; flex-shrink: 0; margin: 0px 2px"
                    @click="copyBibtex($event, item)"
                >
                    <i class="ms-Icon ms-Icon--SemiboldWeight"></i>
                </fv-button>
                <fv-button
                    v-if="item.metadata && item.metadata.url"
                    :theme="theme"
                    background="rgba(147, 162, 225, 0.8)"
                    fontSize="12"
                    font-weight="bold"
                    :border-radius="50"
                    :is-box-shadow="true"
                    :title="local('Open Url')"
                    style="width: 23px; height: 23px; flex-shrink: 0; margin: 0px 2px"
                    @click="
                        ($event) => {
                            $event.stopPropagation()
                            $Jump(item.metadata.url)
                        }
                    "
                >
                    <i class="ms-Icon ms-Icon--Link"></i>
                </fv-button>
            </template>
            <slot name="row_expand" :item="item"> </slot>
        </fv-collapse>
        <fv-shimmer
            v-if="isLoading"
            :theme="theme"
            style="position: relative; width: 100%; height: auto"
        >
            <div
                v-for="(item, index) in 2"
                :key="index"
                style="margin-top: 5px; display: flex; align-items: center"
            >
                <div
                    class="sample"
                    style="width: 30px; height: 30px; margin: 5px; border-radius: 50%"
                ></div>
                <div class="sample" style="width: 80%; flex: 1; margin: 5px"></div>
            </div>
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column">
                <div
                    v-for="(item, index) in 1"
                    :key="index"
                    style="margin-top: 5px; display: flex; align-items: center"
                >
                    <div
                        class="sample"
                        style="width: 80%; height: 15px; margin: 5px"
                        :style="{ width: `${100 - index * 10}%` }"
                    ></div>
                </div>
            </div>
        </fv-shimmer>
        <fv-right-menu ref="rightMenu" :rightMenuWidth="rightMenuWidth" :theme="theme">
            <slot name="menu"> </slot>
        </fv-right-menu>
    </div>
</template>

<script>
import { useAppConfig } from '@/stores/appConfig'
import { useAcademicConfig } from '@/stores/academic'
import { useDataStore } from '@/stores/data'
import { mapState } from 'pinia'
import emojiCallout from '@/components/general/callout/emojiCallout.vue'

export default {
    name: 'mainList',
    components: {
        emojiCallout
    },
    props: {
        modelValue: {
            type: Array,
            default: () => []
        },
        edit: {
            default: false
        },
        rightMenuWidth: {
            default: 200
        },
        theme: {
            default: 'light'
        }
    },
    data() {
        return {}
    },
    watch: {
        edit() {
            for (let i = 0; i < this.modelValue.length; i++) {
                let t = this.modelValue[i]
                t.choosen = false
            }
        }
    },
    computed: {
        ...mapState(useAppConfig, ['local']),
        ...mapState(useAcademicConfig, {
            academicLock: 'lock'
        }),
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        }),
        isLoading() {
            return (
                !this.academicLock.itemsRead ||
                !this.academicLock.allItemsRead ||
                !this.academicLock.searchItemsRead
            )
        },
        currentChoosen() {
            let result = []
            for (let i = 0; i < this.modelValue.length; i++) {
                if (this.modelValue[i].choosen) result.push(this.modelValue[i])
            }
            return result
        },
        currentChoosenAll() {
            for (let i = 0; i < this.modelValue.length; i++) {
                if (this.modelValue[i].choosen != true) return false
            }
            return true
        },
        currentChoosenNum() {
            let count = 0
            for (let i = 0; i < this.modelValue.length; i++) {
                if (this.modelValue[i].choosen) count++
            }
            return count
        }
    },
    mounted() {
        this.valueInit()
    },
    methods: {
        valueInit() {
            for (let i = 0; i < this.modelValue.length; i++) {
                this.modelValue[i].choosen =
                    this.modelValue[i].choosen == undefined ? false : this.modelValue[i].choosen
            }
        },
        rightClick($event, item) {
            $event.preventDefault()
            this.$emit('rightclick', item)
            this.$refs.rightMenu.rightClick($event, this.$el)
        },
        itemChooseClick(item) {
            let index = this.modelValue.indexOf(item)
            let t = item
            t.choosen = !t.choosen
            this.modelValue[index] = t
            this.$emit('choose-items', this.currentChoosen)
        },
        itemTitleClick($event, item) {
            if (this.edit) this.itemChooseClick(item)
        },
        copyBibtex($event, item) {
            $event.stopPropagation()
            if (!item.metadata.bibtex) {
                this.$barWarning(this.local('No BibTex Infomation'), {
                    status: 'warning'
                })
                return
            }
            if (navigator.clipboard) {
                navigator.clipboard
                    .writeText(item.metadata.bibtex)
                    .then(() => {
                        this.$barWarning(this.local('Successfully Copied'), {
                            status: 'correct'
                        })
                    })
                    .catch((err) => {
                        this.$barWarning(err, {
                            status: 'error'
                        })
                    })
            } else {
                // 回退到 document.execCommand
                const input = document.createElement('input')
                input.value = item.metadata.bibtex
                document.body.appendChild(input)
                input.select()
                document.execCommand('copy')
                document.body.removeChild(input)
                this.$barWarning(this.local('Successfully Copied'), {
                    status: 'correct'
                })
            }
        }
    }
}
</script>

<style lang="scss">
.collapse-list-block {
    position: relative;
    width: 100%;
    height: 100%;
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
            font-size: 12.8px;
            font-weight: bold;

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
</style>
