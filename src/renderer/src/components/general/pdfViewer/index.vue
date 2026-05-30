<template>
    <div class="fabulous-pdf-wrapper" :class="[{ dark: theme === 'dark' }]">
        <div class="fabulous-pdf-container" ref="parent" @mousewheel="onMouseWheel">
            <div
                class="pdf-display-scroll-view"
                :style="{ width: scroller.width }"
                ref="scroller_view"
            >
                <pdf-item
                    :model-value="getPdfPage(pageIdx)"
                    v-for="pageIdx in totalPages"
                    :ref="`pdf_item:${pageIdx}`"
                    :key="pageIdx"
                    :root="$refs.parent"
                    :parent="$refs.scroller_view"
                    :pageIdx="pageIdx"
                    :currentPage="currentPage"
                    v-model:currentScale="currentScale"
                    :additionScaleRatio="additionScaleRatio"
                    :scrollTop="container.scrollTop"
                    :scrollTopRatio="container.scrollTopRatio"
                    :highlightNodes="highlightNodes"
                    :show="show.toolbar"
                    :theme="theme"
                    @add-queue="queueFunction.push($event)"
                    @update-page="revisePdfPage(pageIdx, $event)"
                ></pdf-item>
            </div>
            <add-ring-button
                v-model="show.addNote"
                :parent="$refs.parent"
                :selectionObj="selectionObj"
                @choose-selection="$emit('choose-selection', $event)"
            ></add-ring-button>
            <translator-box
                v-model="show.translate"
                :theme="theme"
                :local="local"
                :translateObj="translateObj"
                :ctrlEnterTranslate="ctrlEnterTranslate"
            ></translator-box>
        </div>
        <transition name="move-top-to-bottom">
            <tool-bar
                :container="container"
                v-model:currentPageStr="currentPageStr"
                :totalPages="totalPages"
                :show="show.toolbar"
                @to-page="toPageFromToolbar"
                @scale-down="scaleDown"
                @scale-up="scaleUp"
                @open-with-browser="$emit('open-with-browser')"
                @toggle-translator="show.toolbar.translate ^= true"
            >
                <template #tool-extra="{ controlBtnClass }">
                    <slot name="tool-extra" :control-btn-class="controlBtnClass"></slot>
                </template>
            </tool-bar>
        </transition>
        <fv-progress-ring
            v-if="totalPages === 0"
            class="pdf-loading-ring"
            :model-value="loadingProgress"
            :loading="loadingProgress === -1"
            r="20"
            color="rgba(246, 161, 187, 1)"
            :background="theme === 'dark' ? 'rgba(28, 28, 28, 0.6)' : 'rgba(245, 245, 245, 0.6)'"
            borderWidth="5"
        ></fv-progress-ring>
        <slot name="extra-area"></slot>
    </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'

const proxy = getCurrentInstance().proxy

defineExpose({
    getContainer: (...args) => proxy.getContainer(...args)
})
</script>

<script>
import gsap from 'gsap'
import { markRaw } from 'vue'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { mapState, mapActions } from 'pinia'

import pdfItem from './pdfItem.vue'
import addRingButton from './addRingButton.vue'
import translatorBox from '@/components/general/pdfViewer/translatorBox.vue'
import toolBar from '@/components/general/pdfViewer/toolBar.vue'

import 'pdfjs-dist/web/pdf_viewer.css'

export default {
    components: {
        pdfItem,
        addRingButton,
        translatorBox,
        toolBar
    },
    props: {
        modelValue: {
            default: null
        },
        editorId: {
            type: String,
            default: null
        },
        disabledEditor: {
            default: false
        },
        theme: {
            default: 'light'
        }
    },
    data() {
        return {
            currentPage: 1,
            currentPageStr: '1',
            totalPages: 0,
            visualPages: [],
            currentScale: -1,
            additionScaleRatio: 0,
            pdfDoc: null,
            pdfPages: [],
            hmrVersion: 0,
            container: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                width: 0,
                height: 0,
                scrollTop: 0,
                scrollTopRatio: 0
            },
            scroller: {
                width: `100%`
            },
            translateObj: {
                selection: '',
                text: '',
                pronunciation: ''
            },
            selectionObj: {
                pos: {
                    left: 0,
                    top: 0,
                    canvasIndex: 0
                },
                anchor: {
                    pages: []
                },
                content: ''
            },
            queueFunction: [],
            show: {
                translate: false,
                editable: false,
                addNote: false,
                toolbar: {
                    translate: true
                }
            },
            loadingProgress: -1,
            timer: {
                width: null,
                translate: null,
                queue: null
            },
            lock: {
                init: true,
                page: [],
                scaling: false,
                isQueueRunning: true
            }
        }
    },
    watch: {
        modelValue() {
            this.$nextTick(() => {
                this.totalPages = 0
                this.currentPage - 1
                this.currentPageStr - '1'
                this.hmrVersion = 0
                this.pdfPages = []
                this.initPDF()
            })
        },
        additionScaleRatio() {
            this.hmrVersion += 1
        },
        currentPage() {
            this.currentPageStr = this.currentPage.toString()
        },
        'translateObj.selection'() {
            this.translateObj.text = ''
            this.toTranslate(800)
        },
        async 'queueFunction.length'() {
            if (this.queueFunction.length === 0) return
            if (!this.lock.isQueueRunning) return
            this.lock.isQueueRunning = false
            while (this.queueFunction.length > 0) {
                let func = this.queueFunction.shift()
                try {
                    await func()
                } catch (e) {
                    console.log(e)
                }
            }
            this.lock.isQueueRunning = true
        }
    },
    computed: {
        ...mapState(useDataStore, {
            currentDataPath: (state) => state.currentDataPath
        }),
        ...mapState(useAppConfig, {
            editorMap: (state) => state.editor,
            local: (state) => state.local
        }),
        currentEditor() {
            if (!this.editorId) return null
            return this.editorMap?.[this.editorId] || null
        },
        editorContent() {
            return this.currentEditor?.editorContent || null
        },
        realtimeContent() {
            return this.currentEditor?.realtimeContent || null
        },
        highlightNodes() {
            let content =
                !this.realtimeContent || !this.realtimeContent.content
                    ? []
                    : this.realtimeContent.content
            let result = []
            for (let i = 0; i < content.length; i++) {
                let node = content[i]
                if (node.content) content = content.concat(node.content)
                try {
                    if (node.type === 'pdfNote' && node?.attrs?.itemid === this.modelValue) {
                        result.push({
                            itemid: node.attrs.itemid,
                            pdfid: node.attrs.pdfid,
                            pos: node.attrs.pos,
                            anchor: node.attrs.anchor,
                            content: node.attrs.content
                        })
                    }
                } catch (e) {
                    console.log(e)
                }
            }
            return result
        },
        getPdfPage() {
            return (pageIdx) => {
                let item = this.pdfPages.find((it) => it.num === pageIdx)
                return item
                    ? item
                    : {
                          num: pageIdx,
                          page: null,
                          lock: true,
                          version: -1
                      }
            }
        }
    },
    mounted() {
        this.timerInit()
        setTimeout(() => {
            this.initPDF()
        }, 300)
        this.eventInit()
    },
    methods: {
        timerInit() {
            // PDFViewer 位置刷新器：每 10ms 同步容器位置信息
            this.timer.width = setInterval(() => {
                window.requestAnimationFrame(() => {
                    if (!this.$refs.parent) return
                    const { left, top, right, bottom } = this.$refs.parent.getBoundingClientRect()
                    this.container.left = left
                    this.container.top = top
                    this.container.right = right
                    this.container.bottom = bottom
                    this.container.width = right - left
                    this.container.height = bottom - top
                })
            }, 10)
        },
        eventInit() {
            // PDFViewer 滚动刷新：滚动时更新当前页和滚动位置
            this.$refs.parent.addEventListener('scroll', () => {
                this.refreshCurrentPage()
                this.container.scrollTop = this.$refs.parent.scrollTop
            })
            let getSelectionAnchor = () => {
                // 获取当前浏览器中的文本选区
                const selection = window.getSelection()

                // 没有选区、没有 range、或只是光标没有实际选中文本时，直接返回
                if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null

                // 这里只取第一个 Range。一般普通鼠标选择只有一个 Range
                const range = selection.getRangeAt(0)

                // 获取选中的文本内容，并把连续空格压缩成一个空格
                // trim 用于避免只选中空白内容
                const text = selection.toString().replace(/ +/g, ' ').trim()
                if (!text) return null

                // 收集每一页 PDF 的页面 DOM 信息、PDF.js viewport 信息
                // 后续需要用这些信息判断 selection rect 属于哪一页
                const pageMetas = []

                for (let i = 1; i <= this.totalPages; i++) {
                    const item = this.$refs[`pdf_item:${i}`]
                    if (!item || !item[0] || !item[0].modelValue?.page) continue
                    const pageItem = item[0]

                    // 当前 PDF 页在浏览器视口中的位置和尺寸
                    // 注意：这是 DOM 坐标，会受到滚动、缩放、布局影响
                    const pageRect = pageItem.$el.getBoundingClientRect()

                    // 当前页面实际渲染 scale
                    // thisCurrentScale 是基础缩放，additionScaleRatio 是额外缩放增量
                    const scale = pageItem.thisCurrentScale + pageItem.additionScaleRatio

                    // 获取 PDF.js 当前 scale 下的 viewport
                    // 后面用 viewport.scale 把 DOM 坐标反算成不受缩放影响的 PDF 坐标
                    const viewport = pageItem.modelValue.page.getViewport({ scale })

                    pageMetas.push({
                        page: i,
                        pageRect,
                        viewport
                    })
                }

                // 如果没有任何有效页面信息，说明 PDF 还没准备好
                if (pageMetas.length === 0) return null

                // grouped 用于按页保存高亮区域
                // 结构大致是：
                // pageNumber -> rects[]
                const grouped = new Map()

                // range.getClientRects() 会返回选区的所有视觉矩形
                // 多行选择时通常会有多个 rect
                // PDF.js 的 textLayer 跨多个 span 时，也可能产生多个 rect
                const clientRects = [...range.getClientRects()].filter(
                    // 过滤掉无效矩形，避免保存 0 宽 / 0 高的区域
                    (rect) => rect.width > 0 && rect.height > 0
                )

                // 遍历选区产生的每一个 DOM rect
                for (const rect of clientRects) {
                    // 对每个 rect 判断它和哪些 PDF 页面相交
                    // 这样可以支持跨页选择，或者 rect 位于页面边界附近的情况
                    for (const meta of pageMetas) {
                        // 计算当前 selection rect 与当前 PDF 页面的相交区域
                        // left/top/right/bottom 是相交矩形的四条边
                        const left = Math.max(rect.left, meta.pageRect.left)
                        const top = Math.max(rect.top, meta.pageRect.top)
                        const right = Math.min(rect.right, meta.pageRect.right)
                        const bottom = Math.min(rect.bottom, meta.pageRect.bottom)

                        // 相交区域的宽高
                        const width = Math.max(0, right - left)
                        const height = Math.max(0, bottom - top)

                        // 如果没有相交，说明这个 rect 不属于当前页
                        if (width <= 0 || height <= 0) continue

                        // 当前 PDF 页面的 DOM 面积
                        const pageArea = meta.pageRect.width * meta.pageRect.height

                        // 当前相交区域面积
                        const rectArea = width * height

                        // 防御性过滤：
                        // 如果某个 rect 几乎覆盖整页，通常不是正常文本选区，
                        // 可能是浏览器 / textLayer 异常产生的大范围矩形
                        if (pageArea > 0 && rectArea / pageArea > 0.95) continue

                        // 关键步骤：
                        // 把浏览器 DOM 坐标转换成 PDF 页内坐标。
                        //
                        // left - meta.pageRect.left：
                        //   将浏览器视口坐标转成“当前页内部坐标”
                        //
                        // / meta.viewport.scale：
                        //   去掉当前 PDF 缩放比例影响，得到稳定坐标
                        //
                        // 这样保存后的 rect 不受 PDF 缩放影响，
                        // 下次恢复时只需要再乘以当前 scale 即可。
                        const normalized = {
                            x: (left - meta.pageRect.left) / meta.viewport.scale,
                            y: (top - meta.pageRect.top) / meta.viewport.scale,
                            width: width / meta.viewport.scale,
                            height: height / meta.viewport.scale
                        }

                        // 初始化当前页的 rect 数组
                        if (!grouped.has(meta.page)) grouped.set(meta.page, [])

                        // 将当前 rect 保存到对应页
                        grouped.get(meta.page).push(normalized)
                    }
                }

                // 将 Map 转成数组，并按页码排序
                // 最终结构：
                // [
                //   { page: 1, rects: [...] },
                //   { page: 2, rects: [...] }
                // ]
                const pages = [...grouped.entries()]
                    .sort((a, b) => a[0] - b[0])
                    .map(([page, rects]) => ({ page, rects }))

                // 如果没有任何可用高亮区域，返回 null
                if (pages.length === 0) return null

                // 记录第一个选区所在页
                // 后续可以用于定位、弹出添加笔记按钮、设置 canvasIndex 等
                const firstPage = pages[0].page

                return {
                    // 选中的文本内容，可用于 Tiptap 组件展示
                    text,

                    // 第一个高亮区域所在页
                    pageIndex: firstPage,

                    // 真正用于恢复 PDF 高亮的锚点数据
                    anchor: {
                        pages
                    }
                }
            }
            // 判断点击事件是否在文本层内 (Determine whether the click event is in the text layer)
            let insideTextLayer = (event) => {
                let x = event.target
                let _self = false
                while (x && x.tagName && x.tagName.toLowerCase() != 'body') {
                    if ([...x.classList].includes('textLayer')) {
                        _self = true
                        break
                    }
                    x = x.parentNode
                }
                return _self
            }
            // 点击事件：触发划词翻译
            let translateEvent = (event) => {
                if (!this.show.toolbar.translate) return
                if (!insideTextLayer(event)) return
                const selected = getSelectionAnchor()
                if (!selected) return
                this.translateObj.selection = selected.text
                if (this.translateObj.selection !== '') this.show.translate = true
                this.toTranslate()
            }
            // 点击事件：添加 PDF 笔记
            let addPDFNoteEvent = (event) => {
                if (this.disabledEditor) return
                const selected = getSelectionAnchor()
                if (!selected) {
                    this.show.addNote = false
                    return
                }
                this.selectionObj.content = selected.text
                this.selectionObj.anchor = selected.anchor
                const pageItem = this.$refs[`pdf_item:${selected.pageIndex}`][0]
                const firstRect = selected.anchor.pages[0].rects[0]
                const baseViewport = pageItem.modelValue.page.getViewport({ scale: 1 })
                this.selectionObj.pos.left = firstRect.x / baseViewport.width
                this.selectionObj.pos.top = firstRect.y / baseViewport.height
                this.selectionObj.pos.canvasIndex = selected.pageIndex
                this.show.addNote = true
            }
            this.$refs.scroller_view.addEventListener('click', translateEvent)
            this.$refs.scroller_view.addEventListener('click', addPDFNoteEvent)
        },
        async initPDF() {
            // 初始化 PDF
            // 拉取 PDF 文件并通过 PDF.js 构建文档对象
            if (!this.modelValue) return
            if (!this.lock.init) return
            this.lock.init = false
            await this.$api.AcademicController.getItemPDF(
                this.currentDataPath,
                this.modelValue,
                this.modelValue,
                null,
                null,
                ({ loaded, total }) => {
                    this.loadingProgress = Math.floor((loaded / total) * 100)
                    if (loaded === total) this.loadingProgress = 100
                }
            )
                .then(async (res) => {
                    let blob = null
                    if (!res.code) blob = res
                    else blob = res.data
                    let url = URL.createObjectURL(blob)
                    this.$PDFJS.getDocument({ url }).promise.then((pdf) => {
                        // 保存 PDF 文档对象
                        this.pdfDoc = markRaw(pdf)
                        // 记录总页数
                        this.totalPages = pdf.numPages
                        this.lock.init = true
                        // 逐页预取 page 对象，交给子组件按需渲染
                        for (let i = 1; i <= this.totalPages; i++) {
                            this.pdfDoc.getPage(i).then((page) => {
                                this.pdfPages.push({
                                    num: i,
                                    page: markRaw(page),
                                    lock: true,
                                    version: -1
                                })
                            })
                        }
                        URL.revokeObjectURL(url)
                    })
                })
                .catch((res) => {
                    console.error(res)
                    this.$barWarning(this.local(`Read PDF Failed`), {
                        status: 'warning'
                    })
                })
        },
        refreshCurrentPage() {
            // 刷新当前页码：根据页面在可视区域中的位置估算
            if (!this.pdfDoc) return
            let arr = []
            for (let i = 1; i <= this.totalPages; i++) {
                const { bottom } = this.$refs[`pdf_item:${i}`][0].$el.getBoundingClientRect()
                arr.push({
                    i,
                    value: Math.abs(bottom - this.container.height)
                })
            }
            arr.sort((a, b) => {
                return a.value - b.value
            })
            if (arr[0]) this.currentPage = arr[0].i
        },
        revisePdfPage(idx, obj) {
            let index = this.pdfPages.findIndex((item) => item.num === idx)
            if (index === -1) return
            this.pdfPages[index] = obj
        },
        scaleUp() {
            this.container.scrollTopRatio =
                this.$refs.parent.scrollTop / this.$refs.parent.scrollHeight
            if (this.currentScale + this.additionScaleRatio < 5.7) {
                this.additionScaleRatio += 0.3
                this.widthFormat()
            }
        },
        scaleDown() {
            this.container.scrollTopRatio =
                this.$refs.parent.scrollTop / this.$refs.parent.scrollHeight
            if (this.currentScale + this.additionScaleRatio > 0.6) {
                this.additionScaleRatio -= 0.3
                this.widthFormat()
            }
        },
        onMouseWheel(event) {
            // 滚轮事件：按 Ctrl + 滚轮执行缩放
            if (event.ctrlKey) {
                event.preventDefault()
                if (event.deltaY > 0) {
                    this.scaleDown()
                } else {
                    this.scaleUp()
                }
            }
        },
        toTranslate(period = 500) {
            clearTimeout(this.timer.translate)
            this.timer.translate = setTimeout(() => {
                if (this.translateObj.selection !== '') {
                    this.$api.AcademicController.getTranslation(
                        this.translateObj.selection,
                        'auto',
                        'zh-CN'
                    ).then((res) => {
                        if (res.code !== 200) console.log(res.message)
                        this.translateObj.text = res.data.text
                        this.translateObj.pronunciation = res.data.pronunciation
                    })
                }
            }, period)
        },
        ctrlEnterTranslate(event) {
            if (!(event.keyCode === 13 && event.ctrlKey)) return
            this.toTranslate()
        },
        widthFormat() {
            let el = this.$refs.scroller_view
            el = el.querySelectorAll('.pdf-item')[0]
            if (!el) return
            this.scroller.width = `${el.offsetWidth + 50}px`
            this.$nextTick(() => {
                this.alignFormat()
            })
        },
        alignFormat() {
            let width = this.$refs.parent.clientWidth
            let scrollerWidth = this.$refs.scroller_view.clientWidth
            this.$refs.parent.scrollLeft = (scrollerWidth - width) / 2
        },
        toPage(event, offset = 0) {
            if (event.keyCode !== 13) return
            if (this.currentPageStr <= 0) {
                this.currentPageStr = 1
            }
            if (this.currentPageStr > this.totalPages) {
                this.currentPageStr = this.totalPages
            }
            let height = 0
            for (let i = 2; i <= this.currentPageStr; i++) {
                let pdfItem = this.$refs[`pdf_item:${i - 1}`][0].$el
                height +=
                    pdfItem.offsetHeight +
                    parseFloat(getComputedStyle(pdfItem).getPropertyValue('margin-bottom'))
            }
            gsap.to(this.$refs.parent, {
                scrollTop: height + offset,
                duration: 0.2,
                ease: 'power3.out'
            })
        },
        toPageFromToolbar(pageStr) {
            this.currentPageStr = pageStr
            this.toPage({ keyCode: 13 })
        },
        getContainer() {
            return this.$refs.parent
        }
    },
    beforeUnmount() {
        for (let key in this.timer) {
            clearInterval(this.timer[key])
        }
    }
}
</script>

<style lang="scss">
.fabulous-pdf-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    &.dark {
        .fabulous-pdf-tool-bar {
            .fabulous-pdf-tool-bar-wrapper {
                background: rgba(50, 50, 50, 0.8);
                color: whitesmoke;
            }
        }
    }

    .pdf-loading-ring {
        position: absolute;
        top: 120px;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 999;
    }

    .fabulous-pdf-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: auto;

        .pdf-display-scroll-view {
            position: relative;
            min-width: 100%;
            width: auto;
            height: auto;
            flex-shrink: 0;
            padding-top: 80px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            float: left;
            overflow: hidden;

            .pdf-item {
                position: relative;
                width: auto;
                height: auto;
                margin-bottom: 15px;
                flex-shrink: 0;
                box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);
                overflow: visible;
                overflow-x: visible;

                &.hide {
                    .textLayer {
                        .highlight {
                            background: none;

                            &:hover {
                                background: none;
                                border: none;
                            }

                            &:active {
                                background: none;
                                border: none;
                            }
                        }
                    }
                }

                .textLayer {
                    .highlight {
                        background-color: #4158d0;
                        background-image: linear-gradient(
                            43deg,
                            #4158d0 0%,
                            #c850c0 16%,
                            #ffcc70 36%
                        );
                        background-size: 300%;
                        border-radius: 1.5px;
                        background-position: 0% 50%;
                        transition: background-position 0.8s;
                        opacity: 0.3;

                        &:hover {
                            background-position: 50% 50%;
                            border-bottom: #4158d0 solid 2px;
                        }

                        &:active {
                            background-color: #4158d0;
                            background-image: linear-gradient(
                                43deg,
                                #4158d0 0%,
                                #c850c0 46%,
                                #ffcc70 100%
                            );
                            background-position: 150% 50%;
                            border-bottom: #4158d0 solid 2px;
                            transition: background-position 0.1s;
                        }
                    }
                }
            }
        }
    }
}
</style>
