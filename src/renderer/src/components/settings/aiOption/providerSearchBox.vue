<template>
    <fv-search-box
        v-model="keyword"
        :options="options"
        icon="Search"
        :placeholder="` ` + local('Search or input provider')"
        :theme="theme"
        borderWidth="1"
        :disabled="disabled"
        :resultPlaceholder="[selectedItem]"
        :background="theme === 'dark' ? 'rgba(36, 39, 45, 0.6)' : 'rgba(255, 255, 255, 0.1)'"
        :border-radius="8"
        :revealBorder="true"
        :resultBorderRadius="8"
        :result-background="
            theme === 'dark' ? 'rgba(42, 42, 42, 0.96)' : 'rgba(255, 255, 255, 0.96)'
        "
        style="width: 100%"
        @keydown="focusList"
        @choose-result="chooseResult"
    >
        <template #resultPlaceholder="x">
            <fv-img
                :src="selectedItem ? getProviderIcon(selectedItem.key) : fallbackIcon"
                style="width: 20px; height: 20px; margin: 0px 0px 0px 3px"
            />
        </template>
        <template #searchResult="x">
            <fv-list-view
                ref="list"
                v-model="x.data"
                :theme="theme"
                :headerForeground="
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(20, 20, 20, 0.75)'
                "
                rowHeight="42"
                itemBorderRadius="8"
                :item-border-width="1"
                :item-border-color="
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(180, 180, 180, 0.3)'
                "
                style="width: 100%; height: auto; max-height: 280px"
                @chooseItem="chooseItem($event, x.chooseResult)"
            >
                <template #listItem="slot">
                    <div class="provider-search-item" :class="[{ dark: theme === 'dark' }]">
                        <img
                            class="provider-option-logo"
                            :src="getProviderIcon(slot.item.key)"
                            alt=""
                            draggable="false"
                            @error="useFallbackIcon"
                        />
                        <div class="provider-option-text">
                            <span>{{ slot.item.key }}</span>
                            <small>{{ slot.item.baseUrl }}</small>
                        </div>
                    </div>
                </template>
            </fv-list-view>
        </template>
    </fv-search-box>
</template>

<script>
import fallbackIcon from '@/assets/settings/api.svg'
import { getProviderIconCandidates, searchProviderPresets } from '@/js/aiProviderPresets'

export default {
    name: 'settings-ai-option-provider-search-box',
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        theme: {
            type: String,
            default: 'light'
        },
        disabled: {
            type: Boolean,
            default: false
        },
        local: {
            type: Function,
            default: (value) => value
        }
    },
    emits: ['update:modelValue', 'choose-provider'],
    data() {
        return {
            keyword: this.modelValue,
            fallbackIcon
        }
    },
    watch: {
        modelValue(val) {
            if (val !== this.keyword) this.keyword = val
        },
        keyword(val) {
            this.$emit('update:modelValue', val)
        }
    },
    computed: {
        options() {
            return searchProviderPresets(this.keyword).slice(0, 8)
        },
        selectedItem() {
            return this.options.find((item) => item.key === this.keyword)
        }
    },
    methods: {
        focusList(event) {
            if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
            this.$refs.list?.setFocus?.()
        },
        chooseItem(item, chooseResult) {
            if (!item) return
            chooseResult(item)
        },
        chooseResult(item) {
            if (!item) return
            this.keyword = item.key
            this.$emit('choose-provider', item)
        },
        getProviderIcon(provider) {
            return getProviderIconCandidates(provider)[0] || this.fallbackIcon
        },
        useFallbackIcon(event) {
            if (event?.target) event.target.src = this.fallbackIcon
        }
    }
}
</script>

<style lang="scss">
.provider-search-item {
    width: 100%;
    min-height: 42px;
    padding: 0px 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(32, 32, 32, 0.9);

    &.dark {
        color: rgba(255, 255, 255, 0.9);
    }
}

.provider-option-logo {
    width: 20px;
    height: 20px;
    object-fit: contain;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.06);
}

.provider-option-text {
    display: flex;
    flex-direction: column;
    min-width: 0;

    span {
        font-size: 13px;
        font-weight: 600;
    }

    small {
        font-size: 11px;
        opacity: 0.65;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>
