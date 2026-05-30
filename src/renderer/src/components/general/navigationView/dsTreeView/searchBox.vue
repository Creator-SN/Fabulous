<template>
    <fv-search-box
        ref="searchBox"
        v-model="keyword"
        :options="searchOptions"
        :customFilter="customFilter"
        icon="Search"
        :placeholder="` ` + local('Search Partitions')"
        :theme="theme"
        borderWidth="1"
        background="rgba(255, 255, 255, 0.1)"
        :border-radius="30"
        :revealBorder="true"
        :resultBorderRadius="8"
        :result-background="theme === 'dark' ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'"
        style="width: 100%"
        @debounce-input="searchRemotePartitions"
        @keydown="handleSearchKeydown"
        @choose-result="chooseResult"
    >
        <template v-slot:searchResult="x">
            <fv-list-view
                ref="list"
                v-model="x.data"
                :theme="theme"
                :headerForeground="
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(20, 20, 20, 0.75)'
                "
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
                        class="ds-tree-view-search-header"
                        :class="[{ dark: theme === 'dark' }]"
                    >
                        <p style="font-size: 10px" :style="{ color: color }">
                            {{ itemSlot.item.name }}
                        </p>
                        <fv-progress-ring
                            v-if="itemSlot.item.key === 'header-partition' && !lock.loading"
                            loading="true"
                            r="7"
                            borderWidth="2"
                            background="rgba(200, 200, 200, 0.08)"
                            :color="'rgba(255, 180, 0, 0.8)'"
                        ></fv-progress-ring>
                    </div>
                    <div
                        v-else
                        class="ds-tree-view-search-item"
                        :class="[{ dark: theme === 'dark' }]"
                    >
                        <div class="item-main">
                            <span class="item-emoji">{{ itemSlot.item.emoji || ' ' }}</span>
                            <p class="item-name">{{ itemSlot.item.name }}</p>
                        </div>
                        <p class="item-type" style="font-size: 10px">
                            {{
                                itemSlot.item.type === 'group'
                                    ? local('Visible Groups')
                                    : local('Partitions')
                            }}
                        </p>
                    </div>
                </template>
            </fv-list-view>
        </template>
    </fv-search-box>
</template>

<script>
import { useTheme } from '@/stores/theme'
import { mapState } from 'pinia'

export default {
    name: 'ds-tree-view-search-box',
    props: {
        theme: {
            type: String,
            default: 'light'
        },
        local: {
            type: Function,
            default: (value) => value
        },
        currentDataPath: {
            type: String,
            default: ''
        },
        visibleGroups: {
            type: Array,
            default: () => []
        },
        searchPartitions: {
            type: Function,
            default: async () => ({ status: 'success', data: [] })
        }
    },
    emits: ['choose-item'],
    data() {
        return {
            keyword: '',
            remotePartitions: [],
            lock: {
                loading: true
            }
        }
    },
    computed: {
        ...mapState(useTheme, {
            color: (state) => state.color
        }),
        customFilter() {
            return (options) => options
        },
        filteredVisibleGroups() {
            let keyword = this.keyword.trim().toLowerCase()
            let list = this.visibleGroups.filter((item) => item.type === 'group')
            if (!keyword) return list
            return list.filter((item) => {
                let label = `${item.emoji || ''} ${item.name || ''}`.toLowerCase()
                return label.includes(keyword)
            })
        },
        searchOptions() {
            return [
                {
                    key: 'header-visible-group',
                    name: this.local('Visible Groups'),
                    type: 'header'
                },
                ...this.filteredVisibleGroups,
                {
                    key: 'header-partition',
                    name: this.local('Partitions'),
                    type: 'header'
                },
                ...this.remotePartitions
            ]
        }
    },
    methods: {
        async searchRemotePartitions() {
            let keyword = this.keyword.trim()
            if (!keyword || !this.currentDataPath) {
                this.remotePartitions = []
                this.lock.loading = true
                return
            }
            if (!this.lock.loading) return
            this.lock.loading = false
            let res = await this.searchPartitions(this.currentDataPath, keyword, 8)
            if (res.code === 200) {
                this.remotePartitions = (res.data || []).map((item) => ({
                    ...item,
                    type: 'partition'
                }))
            } else {
                this.remotePartitions = []
            }
            this.lock.loading = true
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
.ds-tree-view-search-header {
    width: 100%;
    min-height: 34px;
    padding: 0px 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: rgba(20, 20, 20, 0.65);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    pointer-events: none;

    &.dark {
        color: rgba(255, 255, 255, 0.72);
    }

    p {
        margin: 0;
    }
}

.ds-tree-view-search-item {
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

    .item-emoji {
        width: 22px;
        flex-shrink: 0;
        text-align: center;
    }

    .item-name {
        @include nowrap;

        margin: 0;
        margin-left: 6px;
        flex: 1;
    }

    .item-type {
        margin: 0;
        margin-left: 12px;
        flex-shrink: 0;
        font-size: 12px;
        opacity: 0.65;
    }
}
</style>
