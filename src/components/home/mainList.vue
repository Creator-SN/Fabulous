<template>
    <fv-infinite-scroll-view
        :value="visibleValue"
        class="collapse-list-block"
        @init-start="loading = true"
        @init-end="loading = false"
    >
        <template v-slot:default="x">
            <fv-collapse
                v-for="(item, index) in x.dynamicValue"
                v-show="item.show"
                :theme="theme"
                :key="index"
                :title="item.name"
                :content="`${local('Create Time')}: ${$date(item.createDate)}`"
                :maxHeight="350"
                :disabled-collapse="edit"
                style="margin: 5px"
                @contextmenu.native="rightClick($event, item)"
            >
                <template v-slot:icon>
                    <div
                        v-show="!edit"
                        class="icon-block"
                    >
                        <p class="index">{{index + 1}}</p>
                        <emoji-callout
                            :value="item.emoji"
                            :theme="theme"
                            @insert-emoji="$emit('insert-emoji', {item: item, emoji: $event})"
                        ></emoji-callout>
                    </div>
                    <div
                        v-show="edit"
                        class="icon-block"
                    >
                        <p class="index">{{index + 1}}</p>
                        <fv-check-box
                            v-model="item.choosen"
                            :borderColor="theme == 'dark' ? 'whitesmoke' : ''"
                            @click="itemChooseClick(item)"
                        ></fv-check-box>
                    </div>
                </template>
                <template v-slot:title="x">
                    <div class="custom-collapse-title">
                        <p
                            class="title-content h"
                            @click="itemTitleClick($event, item)"
                            @dblclick="item.pdf ? $emit('open-file', `${item.id}/${item.pdf}.pdf`) : $emit('open-file', `${item.id}`)"
                        >{{ x.title }}</p>
                    </div>
                </template>
                <template v-slot:content="x">
                    <div
                        class="collapse-info"
                        style="display: flex;"
                    >
                        <p style="width: 180px;">{{ x.content }}</p>
                        <fv-button
                            v-if="item.metadata && item.metadata.year"
                            theme="dark"
                            background="rgba(0, 204, 153, 1)"
                            fontSize="12"
                            style="width: 50px; height: 25px; margin: 0px 15px;"
                        >{{item.metadata.year}}</fv-button>
                    </div>
                </template>
                <template v-slot:extension>
                    <fv-tag
                        :value="item.labels"
                        :theme="theme"
                        class="tag-block"
                        :size="'xsmall'"
                        style="max-width: 120px; overflow: overlay;"
                        @click.native="$emit('label-click', item)"
                    ></fv-tag>
                </template>
                <slot
                    name="row_expand"
                    :item="item"
                >
                </slot>
            </fv-collapse>
            <fv-shimmer
                v-if="loading"
                :theme="theme"
                style="position: relative; width: 100%; height: auto;"
            >
                <div
                    v-for="(item, index) in 2"
                    :key="index"
                    style="margin-top: 5px; display: flex; align-items: center;"
                >
                    <div
                        class="sample"
                        style="width: 30px; height: 30px; margin: 5px; border-radius: 50%;"
                    ></div>
                    <div
                        class="sample"
                        style="width: 80%; flex: 1; margin: 5px;"
                    ></div>
                </div>
                <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
                    <div
                        v-for="(item, index) in 1"
                        :key="index"
                        style="margin-top: 5px; display: flex; align-items: center;"
                    >
                        <div
                            class="sample"
                            style="width: 80%; height: 15px; margin: 5px;"
                            :style="{width: `${100 - index * 10}%`}"
                        ></div>
                    </div>
                </div>
            </fv-shimmer>
            <right-menu
                ref="rightMenu"
                :rightMenuWidth="rightMenuWidth"
                :theme="theme"
            >
                <slot name="menu">
                </slot>
            </right-menu>
        </template>
    </fv-infinite-scroll-view>
</template>

<script>
import { mapGetters } from 'vuex';
import emojiCallout from '@/components/general/callout/emojiCallout.vue';
import rightMenu from '@/components/general/rightMenu.vue';

export default {
    name: 'mainList',
    components: {
        emojiCallout,
        rightMenu
    },
    props: {
        value: {
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
        return {
            thisValue: this.value,
            loading: false
        };
    },
    watch: {
        value: {
            deep: true,
            handler() {
                this.thisValue = this.value;
                this.valueInit();
            }
        },
        thisValue() {
            this.$emit('input', this.thisValue);
        },
        edit() {
            for (let i = 0; i < this.thisValue.length; i++) {
                let t = this.thisValue[i];
                t.choosen = false;
                this.$set(this.thisValue, i, t);
            }
        }
    },
    computed: {
        ...mapGetters(['local', 'currentDataPath']),
        currentChoosen() {
            let result = [];
            for (let i = 0; i < this.thisValue.length; i++) {
                if (this.thisValue[i].choosen && this.thisValue[i].show)
                    result.push(this.thisValue[i]);
            }
            return result;
        },
        currentChoosenAll() {
            for (let i = 0; i < this.thisValue.length; i++) {
                if (this.thisValue[i].choosen != true && this.thisValue[i].show)
                    return false;
            }
            return true;
        },
        currentChoosenNum() {
            let count = 0;
            for (let i = 0; i < this.thisValue.length; i++) {
                if (this.thisValue[i].choosen && this.thisValue[i].show)
                    count++;
            }
            return count;
        },
        visibleValue() {
            let result = [];
            for (let i = 0; i < this.thisValue.length; i++) {
                if (this.thisValue[i].show) result.push(this.thisValue[i]);
            }
            return result;
        }
    },
    mounted() {
        this.valueInit();
    },
    methods: {
        valueInit() {
            let val = JSON.parse(JSON.stringify(this.value));
            for (let i = 0; i < val.length; i++) {
                val[i].choosen =
                    val[i].choosen == undefined ? false : val[i].choosen;
                val[i].show = true;
            }
            this.thisValue = val;
        },
        rightClick($event, item) {
            $event.preventDefault();
            this.$emit('rightclick', item);
            this.$refs.rightMenu.rightClick($event, this.$el);
        },
        itemChooseClick(item) {
            let index = this.thisValue.indexOf(item);
            let t = item;
            t.choosen = !t.choosen;
            this.$set(this.thisValue, index, t);
            this.$emit('change-value', this.thisValue);
            this.$emit('choose-items', this.currentChoosen);
        },
        itemTitleClick($event, item) {
            if (this.edit) this.itemChooseClick(item);
        }
    }
};
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
            font-size: 13.8px;
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