<template>
    <div class="main-row-item-info" :class="{ dark: theme === 'dark' }">
        <div class="main-item-block as-btn" @click="$emit('show-rename-item', item)">
            <fv-tag
                v-if="item.labels.length > 0"
                :model-value="item.labels"
                :theme="theme"
                :size="'xsmall'"
                style="width: 100%"
            ></fv-tag>
            <i v-if="item.labels.length <= 0" class="ms-Icon ms-Icon--Tag"></i>
            <p v-if="item.labels.length <= 0" style="margin-left: 10px">
                {{ local('Add Labels') }}
            </p>
        </div>
        <div class="main-item-block">
            <div class="dbl-btn-block" @click="$emit('open-pdf', { item, mode: 'inside' })">
                <div class="left-side">
                    <img
                        draggable="false"
                        :src="img.pdf"
                        alt=""
                        style="width: 18px; height: 18px; object-fit: contain"
                    />
                    <p>PDF</p>
                </div>
                <fv-button
                    :theme="theme"
                    style="width: 25px; height: 25px"
                    :title="local('Open in Browser')"
                    border-radius="30"
                    @click.stop="$emit('open-pdf', { item, mode: 'outside' })"
                >
                    <img
                        draggable="false"
                        :src="img.viewer"
                        alt=""
                        style="width: 15px; height: 15px; object-fit: contain"
                    />
                </fv-button>
            </div>
            <div class="dbl-btn-block" @click="$emit('show-metadata', item)">
                <div class="left-side">
                    <img
                        draggable="false"
                        :src="img.metadata"
                        alt=""
                        style="width: 18px; height: 18px; object-fit: contain"
                    />
                    <p>Metadata</p>
                </div>
            </div>
        </div>
        <div
            v-show="item.pages.length > 0"
            class="main-item-block"
            style="height: 90px; overflow-x: overlay"
        >
            <div v-for="(page, index) in item.pages" :key="index" class="note-item">
                <div class="top-side">
                    <emoji-callout
                        :model-value="page.emoji"
                        :theme="theme"
                        style="width: 25px; flex-shrink: 0"
                        @insert-emoji="$emit('revise-page-emoji', { item, page, emoji: $event })"
                    ></emoji-callout>
                    <p
                        class="highlight"
                        :title="page.name"
                        style="text-align: left"
                        @click="$emit('open-editor', { item, page })"
                    >
                        {{ page.name }}
                    </p>
                </div>
                <div class="bottom-side">
                    <user-avatar
                        v-if="page.owner"
                        v-model="page.owner"
                        :show-info="true"
                        :size="28"
                        :font-size="8"
                        :infoTitle="$date(page.createDate)"
                        style="flex: 1"
                    ></user-avatar>
                    <div class="right-side">
                        <fv-button
                            theme="dark"
                            :background="
                                theme === 'dark'
                                    ? 'rgba(118, 185, 237, 1)'
                                    : 'rgba(140, 148, 228, 1)'
                            "
                            style="width: 30px; height: 30px; margin-left: 1.5px"
                            :title="local('Rename')"
                            border-radius="6"
                            @click="$emit('show-rename-item-page', { item, page })"
                        >
                            <i class="ms-Icon ms-Icon--Rename"></i>
                        </fv-button>
                        <fv-button
                            theme="dark"
                            :background="
                                theme === 'dark'
                                    ? 'rgba(118, 185, 237, 1)'
                                    : 'rgba(140, 148, 228, 1)'
                            "
                            style="width: 30px; height: 30px; margin-left: 1.5px"
                            :title="local('Duplicate')"
                            border-radius="6"
                            @click="$emit('duplicate-item-page', { item, page })"
                        >
                            <i class="ms-Icon ms-Icon--Set"></i>
                        </fv-button>
                        <fv-button
                            theme="dark"
                            background="rgba(220, 62, 72, 1)"
                            style="width: 30px; height: 30px; margin-left: 1.5px"
                            :title="local('Delete')"
                            border-radius="6"
                            @click="$emit('delete-item-page', { itemId: item.id, pageId: page.id })"
                        >
                            <i class="ms-Icon ms-Icon--Delete"></i>
                        </fv-button>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="main-item-block as-btn"
            style="display: flex"
            @click="$emit('show-add-item-page', item)"
        >
            <i class="ms-Icon ms-Icon--Add"></i>
            <p style="margin-left: 15px">
                {{ local('Add Page') }}
            </p>
        </div>
    </div>
</template>

<script>
import emojiCallout from '@/components/general/callout/emojiCallout.vue'
import userAvatar from '@/components/general/userAvatar.vue'

export default {
    components: {
        emojiCallout,
        userAvatar
    },
    props: {
        item: {
            type: Object,
            required: true
        },
        theme: {
            type: String,
            default: 'light'
        },
        img: {
            type: Object,
            required: true
        },
        local: {
            type: Function,
            required: true
        }
    },
    emits: [
        'show-rename-item',
        'open-pdf',
        'show-metadata',
        'revise-page-emoji',
        'open-editor',
        'show-rename-item-page',
        'duplicate-item-page',
        'delete-item-page',
        'show-add-item-page'
    ]
}
</script>

<style lang="scss">
.main-row-item-info {
    position: relative;
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    z-index: 1;

    &.dark {
        .main-item-block {
            color: whitesmoke;
            border-color: rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.02);

            &.as-btn {
                &:hover {
                    background: rgba(255, 255, 255, 0.06);
                }

                &:active {
                    background: rgba(255, 255, 255, 0.1);
                }
            }

            .dbl-btn-block {
                background: rgba(47, 52, 55, 0.9);
                border-color: rgba(255, 255, 255, 0.08);

                &:hover {
                    background: rgba(68, 74, 78, 0.9);
                }

                &:active {
                    background: rgba(82, 88, 92, 0.9);
                }
            }

            .note-item {
                background: rgba(47, 52, 55, 0.9);
                border-color: rgba(255, 255, 255, 0.08);
                box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.15);
            }
        }
    }

    .main-item-block {
        width: 100%;
        min-height: 50px;
        height: 50px;
        margin-bottom: 3px;
        padding: 0px 15px;
        font-size: 13.8px;
        font-weight: 600;
        border: rgba(200, 200, 200, 0.1) solid thin;
        border-radius: 8px;
        box-sizing: border-box;
        gap: 5px;
        display: flex;
        align-items: center;
        user-select: none;

        &.as-btn {
            cursor: pointer;

            &:hover {
                background: rgba(200, 200, 200, 0.1);
            }

            &:active {
                background: rgba(200, 200, 200, 0.3);
            }
        }

        .ms-Icon--PDF {
            color: rgba(245, 62, 72, 1);
        }

        .ms-Icon--LinkedDatabase {
            color: rgba(245, 149, 17, 1);
        }

        p {
            @include nowrap;

            flex: 1;

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

        .dbl-btn-block {
            @include HcenterVcenter;

            width: auto;
            height: 35px;
            padding: 0px 10px;
            background: rgba(255, 255, 255, 0.7);
            border: rgba(120, 120, 120, 0.1) solid thin;
            border-radius: 30px;
            gap: 10px;
            cursor: pointer;

            &:hover {
                background: rgba(200, 200, 200, 0.1);
            }

            &:active {
                background: rgba(200, 200, 200, 0.3);
            }

            .left-side {
                @include Vcenter;

                flex: 1;
                gap: 10px;
            }
        }

        .note-item {
            @include HcenterVcenterC;

            width: auto;
            max-width: 100%;
            height: 80px;
            padding: 0px 10px;
            background: rgba(255, 255, 255, 0.7);
            border: rgba(120, 120, 120, 0.1) solid thin;
            border-radius: 12px;
            gap: 5px;

            .top-side {
                @include Vcenter;

                width: 100%;
                gap: 5px;
            }

            .bottom-side {
                @include Vcenter;

                width: 100%;
                gap: 5px;

                .right-side {
                    @include Vcenter;

                    flex-shrink: 0;
                    gap: 1px;
                }
            }
        }
    }
}
</style>
