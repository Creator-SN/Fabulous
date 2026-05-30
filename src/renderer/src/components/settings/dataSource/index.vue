<template>
    <div class="s-item-block">
        <fv-list-view
            :model-value="thisPathList"
            :theme="theme"
            :rowHeight="60"
            :header-foreground="'rgba(140, 148, 228, 1)'"
            :choosen-background="
                theme === 'dark' ? 'rgba(120, 120, 120, 0.3)' : 'rgba(255, 255, 255, 0.6)'
            "
            :showSlider="true"
            :slider-index="-1"
            style="width: 100%; height: auto; margin-top: 15px"
            @chooseItem="switchDataIndex"
        >
            <template v-slot:listItem="x">
                <data-path-item
                    :model-value="x.item"
                    :local="local"
                    :theme="theme"
                    :choosen="x.item.path === data_index"
                    @edit-ds="editDS"
                    @remove-ds="removeDS"
                ></data-path-item>
            </template>
        </fv-list-view>
    </div>
</template>

<script>
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { useTheme } from '@/stores/theme'
import { mapState, mapActions } from 'pinia'

import dataPathItem from './dataPathItem.vue'

export default {
    components: {
        dataPathItem
    },
    computed: {
        ...mapState(useTheme, {
            theme: 'theme'
        }),
        ...mapState(useAppConfig, ['local']),
        ...mapState(useDataStore, {
            data_index: (state) => state.configState.data_index,
            data_path: (state) => state.data_path
        }),
        thisPathList() {
            const pathList = this.data_path
            const result = []
            if (pathList.length === 0) return []
            pathList.forEach((el, idx) => {
                el.path = el.path ? el.path : el.id
                result.push({
                    key: idx,
                    name: el.path,
                    ...el,
                    choosen: el.path === this.data_index,
                    disabled: () => false
                })
            })
            return result
        }
    },
    mounted() {},
    methods: {
        ...mapActions(useDataStore, {
            reviseConfig: 'reviseConfig',
            removeDataSource: 'removeDataSource'
        }),
        switchDataIndex({ item }) {
            this.reviseConfig({
                data_index: item.path
            })
        },
        editDS(dbItem) {
            this.$emit('edit-ds', dbItem)
        },
        removeDS(dbItem) {
            this.$infoBox(this.local('Are you sure to remove this data source?'), {
                status: 'error',
                title: this.local('Remove Data Source'),
                confirmTitle: this.local('Confirm'),
                cancelTitle: this.local('Cancel'),
                theme: this.theme,
                confirm: async () => {
                    await this.removeDataSource(dbItem.id)
                },
                cancel: () => {}
            })
        }
    }
}
</script>

<style lang="scss">
.s-item-block {
    position: relative;
    width: calc(100% - 30px);
    max-width: 1280px;
    height: auto;
    line-height: 2.5;
    display: flex;
    flex-direction: column;

    .s-item-title {
        user-select: none;
        cursor: default;
    }
}
</style>
