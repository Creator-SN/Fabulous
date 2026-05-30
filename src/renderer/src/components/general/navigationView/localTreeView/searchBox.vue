<template>
    <fv-search-box
        ref="searchBox"
        v-model="keyword"
        :options="searchOptions"
        :customFilter="customFilter"
        icon="Search"
        :placeholder="` ` + local('Search Notebook')"
        :theme="theme"
        borderWidth="1"
        :background="theme === 'dark' ? 'rgba(36, 39, 45, 0.6)' : 'rgba(255, 255, 255, 0.1)'"
        :border-radius="30"
        :revealBorder="true"
        :resultBorderRadius="8"
        :result-background="theme === 'dark' ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'"
        style="width: 100%"
        @debounce-input="searchFolders"
        @keydown="handleSearchKeydown"
        @choose-result="chooseResult"
    >
        <template v-slot:searchResult="x">
            <fv-list-view
                ref="list"
                v-model="x.data"
                :theme="theme"
                rowHeight="30"
                itemBorderRadius="8"
                :item-border-width="1"
                :item-border-color="
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(180, 180, 180, 0.3)'
                "
                style="width: 100%; height: auto; max-height: 320px"
                @chooseItem="chooseListItem($event, x.chooseResult)"
            >
                <template v-slot:listItem="itemSlot">
                    <div
                        v-if="itemSlot.item.type === 'header'"
                        class="local-tree-view-search-header"
                        :class="[{ dark: theme === 'dark' }]"
                    >
                        <p style="font-size: 10px">{{ itemSlot.item.name }}</p>
                    </div>
                    <div
                        v-else
                        class="local-tree-view-search-item"
                        :class="[{ dark: theme === 'dark' }]"
                    >
                        <div class="item-main">
                            <img draggable="false" :src="notebookImg" alt="" class="icon-img" />
                            <p class="item-name" style="font-size: 10px">
                                {{ itemSlot.item.name }}
                            </p>
                        </div>
                        <p class="item-type" style="font-size: 10px">
                            {{ itemSlot.item.relativePath }}
                        </p>
                    </div>
                </template>
            </fv-list-view>
        </template>
    </fv-search-box>
</template>

<script>
import notebookImg from '@/assets/nav/notebook.svg'

export default {
    name: 'local-tree-view-search-box',
    props: {
        theme: {
            type: String,
            default: 'light'
        },
        local: {
            type: Function,
            default: (value) => value
        },
        rootPath: {
            type: String,
            default: ''
        },
        searchLocalNotebooks: {
            type: Function,
            default: async () => ({ code: 200, data: [] })
        }
    },
    emits: ['choose-item'],
    data() {
        return {
            keyword: '',
            notebooks: []
        }
    },
    computed: {
        customFilter() {
            return (options) => options
        },
        searchOptions() {
            return [
                {
                    key: 'header-notebook',
                    name: this.local('Notebook'),
                    type: 'header'
                },
                ...this.notebooks
            ]
        },
        notebookImg() {
            return notebookImg
        }
    },
    methods: {
        async searchFolders() {
            let keyword = this.keyword.trim()
            if (!keyword || !this.rootPath) {
                this.notebooks = []
                return
            }
            let res = await this.searchLocalNotebooks(this.rootPath, keyword, 8)
            if (res?.code === 200 || res?.status === 'success') {
                this.notebooks = (res.data || []).map((item, index) => ({
                    ...item,
                    key: `notebook-${index}`,
                    type: 'notebook'
                }))
            } else {
                this.notebooks = []
            }
        },
        handleSearchKeydown(event) {
            if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
            let list = this.$refs.list
            if (!list) return
            list.setFocus()
        },
        chooseListItem(item, chooseResult) {
            if (!item || item.type === 'header') return
            chooseResult(item)
        },
        chooseResult(item) {
            if (!item || item.type === 'header') return
            this.$emit('choose-item', item)
        }
    }
}
</script>

<style lang="scss">
.local-tree-view-search-header {
    width: 100%;
    min-height: 34px;
    padding: 0px 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    color: rgba(20, 20, 20, 0.65);

    &.dark {
        color: rgba(255, 255, 255, 0.72);
    }
}

.local-tree-view-search-item {
    width: 100%;
    min-height: 42px;
    padding: 0px 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: rgba(32, 32, 32, 0.9);

    &.dark {
        color: rgba(255, 255, 255, 0.9);
    }

    .item-main {
        min-width: 0;
        display: flex;
        align-items: center;
        flex: 1;
        gap: 6px;
    }

    .icon-img {
        width: 16px;
        height: auto;
        flex-shrink: 0;
    }

    .item-name {
        @include nowrap;

        margin: 0;
        flex: 1;
    }

    .item-type {
        @include nowrap;

        margin: 0;
        margin-left: 12px;
        flex-shrink: 0;
        opacity: 0.65;
        max-width: 50%;
    }
}
</style>
