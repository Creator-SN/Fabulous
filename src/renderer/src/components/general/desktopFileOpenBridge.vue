<script>
export default {
    name: 'desktop-file-open-bridge',
    data() {
        return {
            releaseNotebookOpen: null
        }
    },
    mounted() {
        const api = globalThis?.api || globalThis?.window?.api
        if (!api?.onOpenNotebookFile) return
        this.releaseNotebookOpen = api.onOpenNotebookFile(({ filePath } = {}) => {
            if (!filePath) return
            let url = `/local_notebook/${encodeURI(filePath.replace(/\//g, '\\'))}`
            if (this.$route.path === url) return
            this.$Go(url)
        })
    },
    beforeUnmount() {
        this.releaseNotebookOpen?.()
    },
    render() {
        return null
    }
}
</script>
