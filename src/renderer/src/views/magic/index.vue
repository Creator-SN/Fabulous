<template>
    <div class="magic-page"><fv-progress-ring :loading="true" r="18" :border-width="3"></fv-progress-ring></div>
</template>

<script>
import { useCollectionStore } from '@/stores/collection'

export default {
    name: 'MagicLink',
    async mounted() {
        const key = this.$route.query.key
        if (!key) return this.$router.replace('/')
        try {
            const response = await useCollectionStore().resolveMagicShare(key)
            const item = response?.data
            if (!item) return this.$router.replace('/')
            if (item.kind === 'notebook') {
                return this.$router.replace(`/notebook/${encodeURI(item.filePath.replace(/\//g, '\\'))}`)
            }
            const path = `${item.sourceId}/${item.itemId}/${item.pageId}`
            return this.$router.replace(`/academic/${encodeURI(path.replace(/\//g, '\\'))}`)
        } catch (error) {
            console.error(error)
            this.$router.replace('/')
        }
    }
}
</script>

<style lang="scss">
.magic-page { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
</style>
