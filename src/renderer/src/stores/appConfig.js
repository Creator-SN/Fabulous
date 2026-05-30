import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { useDataStore } from './data'
import { useTheme } from './theme'
import { getProxy } from '@/stores/proxyHolder'
import { resolveClientMode } from '@/js/clientMode'

const createEditorPrototype = () => ({
    type: null,
    dsId: null,
    item: null,
    target: null,
    scrollTop: 0,
    displayMode: 'note',
    unsave: false,
    editorContent: {
        title: null,
        description: null,
        banner: null,
        content: {
            type: 'doc',
            content: []
        },
        author: [],
        createDate: null,
        updateDate: null
    },
    storeContent: '',
    realtimeContent: '',
    history: [],
    cache: false
})

export const useAppConfig = defineStore('appConfig', () => {
    const proxy = getProxy()

    const editor = ref({
        academic: createEditorPrototype(),
        notebook: createEditorPrototype(),
        local: createEditorPrototype()
    })

    const tabList = ref([])
    const tabValue = ref(null)

    const draggingEl = ref(null)
    const pdfImporter = ref({
        value: false,
        item: null,
        mode: 'item',
        pdf_importer: null,
        df: [],
        counter: 0
    })

    const itemCarrier = ref({
        itemsX: []
    })

    const window = ref({
        width: 0,
        height: 0,
        mobileDisplay: 1024
    })

    const clientMode = ref(resolveClientMode())
    const fullScreen = ref(false)

    const progress = ref(0)
    const i18n = ref({})

    const local = computed(() => (text) => {
        const result = i18n.value[text]
        if (!result) return text
        return result[useDataStore().configState.language]
    })

    function getEditorById(id) {
        if (!id) return null
        return editor.value[id] || null
    }

    function ensureEditor(id) {
        if (!id) return null
        if (!editor.value[id]) {
            editor.value[id] = createEditorPrototype()
        }
        return editor.value[id]
    }

    function setWindowSize(obj) {
        window.value.width = obj.width
        window.value.height = obj.height
    }

    function setFullScreen(value) {
        fullScreen.value = value
    }

    function reviseEditor(obj) {
        const { id, ...nextEditor } = obj || {}
        const targetEditor = ensureEditor(id)
        if (!targetEditor) return
        for (const key in nextEditor) {
            if (Object.prototype.hasOwnProperty.call(targetEditor, key)) {
                targetEditor[key] = nextEditor[key]
            }
        }
    }

    function reviseEditorContent(obj) {
        const { id, ...nextContent } = obj || {}
        const targetEditor = getEditorById(id)
        if (!targetEditor) return
        for (const key in nextContent) {
            if (Object.prototype.hasOwnProperty.call(targetEditor.editorContent, key)) {
                targetEditor.editorContent[key] = nextContent[key]
            }
        }
    }

    function editorGo(id, route) {
        const targetEditor = getEditorById(id)
        if (!targetEditor) return
        const theme = useTheme().theme
        if (targetEditor.unsave) {
            proxy.$infoBox(local(`Are you sure to redirect without saved?`), {
                status: 'warning',
                title: local('Confirm'),
                confirmTitle: local('Confirm'),
                cancelTitle: local('Cancel'),
                theme,
                confirm: () => {
                    proxy.$Go(route)
                },
                cancel: () => { }
            })
            return
        }
    }

    function setDraggingEl(el) {
        draggingEl.value = el
    }

    function addTab(obj, fullPath) {
        const key = fullPath.split('/')[1]
        let existIndex = tabList.value.findIndex(item => item.key === key)
        let addObj = {
            key,
            ...obj
        }
        if (existIndex !== -1) {
            tabList.value[existIndex] = addObj
            tabValue.value = tabList.value[existIndex]
            return
        }
        else {
            tabList.value.push(addObj)
            tabValue.value = tabList.value[tabList.value.length - 1]
        }
    }

    function setTabList(items) {
        tabList.value = items
    }

    function removeTab(key) {
        let existIndex = tabList.value.findIndex(item => item.key === key)
        if (existIndex !== -1) {
            tabList.value.splice(existIndex, 1)
        }
    }

    function setTabValue(value) {
        tabValue.value = value
    }

    function tryGetScrollTop(className = '.tip-tap-editor-container', index = 0) {
        let editorContent = document.body.querySelectorAll(className)[index]
        if (!editorContent) return 0
        return editorContent.scrollTop ? editorContent.scrollTop : 0
    }

    function revisePdfImporter(obj) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(pdfImporter.value, key)) {
                pdfImporter.value[key] = obj[key]
            }
        }
    }

    function reviseItemCarrier(obj) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(itemCarrier.value, key)) {
                itemCarrier.value[key] = obj[key]
            }
        }
    }

    function reviseProgress(obj) {
        progress.value = obj
    }

    function reviseI18N(i18nData) {
        i18n.value = i18nData
    }

    async function reviseConfig(obj) {
        await useDataStore().reviseConfig(obj)
    }

    return {
        editor,
        tabList,
        tabValue,
        draggingEl,
        pdfImporter,
        itemCarrier,
        window,
        clientMode,
        fullScreen,
        progress,
        i18n,
        local,
        getEditorById,
        ensureEditor,
        setWindowSize,
        setFullScreen,
        reviseEditor,
        reviseEditorContent,
        editorGo,
        setDraggingEl,
        addTab,
        setTabList,
        removeTab,
        setTabValue,
        tryGetScrollTop,
        revisePdfImporter,
        reviseItemCarrier,
        reviseProgress,
        reviseI18N,
        reviseConfig
    }
})
