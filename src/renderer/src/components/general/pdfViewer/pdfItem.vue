<template>
    <div
        class="pdf-item"
        :class="{
            hide: resizing
        }"
        :key="pageIdx"
    >
        <canvas ref="pdfCanvas" style="width: 100%; height: 100%"></canvas>
        <div ref="textLayer"></div>
    </div>
</template>

<script>
import gsap from 'gsap'
import { useAppConfig } from '@/stores/appConfig'
import { useDataStore } from '@/stores/data'
import { mapState, mapActions } from 'pinia'

export default {
    props: {
        modelValue: {
            default: () => ({})
        },
        root: {
            default: () => ({})
        },
        parent: {
            default: () => ({})
        },
        pageIdx: {
            required: true
        },
        currentPage: {
            default: 0
        },
        currentScale: {
            default: 1
        },
        additionScaleRatio: {
            default: 0
        },
        scrollTop: {
            default: 0
        },
        scrollTopRatio: {
            default: 0
        },
        highlightNodes: {
            default: () => []
        },
        show: {
            default: () => ({})
        },
        theme: {
            default: 'light'
        }
    },
    data() {
        return {
            width: 0,
            height: 0,
            thisValue: this.modelValue,
            thisCurrentScale: this.currentScale,
            backendCanvas: null,
            textContent: null,
            textLayerRenderScale: 0,
            resizing: false,
            timer: {
                render: null,
                debounceRender: null
            }
        }
    },
    watch: {
        'modelValue.page'(val) {
            if (val !== null) {
                this.thisValue = this.modelValue
                this.initPage(2)
            }
        },
        thisValue(val) {
            this.$emit('update-page', val)
        },
        currentScale(val) {
            this.thisCurrentScale = val
        },
        thisCurrentScale(val) {
            this.$emit('update:currentScale', val)
        },
        additionScaleRatio() {
            this.scrollHandler()
        },
        nearCurrentPage: {
            handler() {
                // 当前页附近状态变化时才触发 (Trigger only when the status near the current page changes)
                this.dynamicRenderAction()
            },
            immediate: true
        },
        highlightNodes: {
            deep: true,
            handler() {
                if (this.modelValue.page !== null) this.refreshHighlight()
            }
        }
    },
    computed: {
        ...mapState(useDataStore, {
            language: (state) => state.configState.language,
            currentDataPath: (state) => state.currentDataPath,
            currentDataPathItem: (state) => state.currentDataPathItem
        }),
        ...mapState(useAppConfig, {
            local: 'local',
            displayMode: (state) => state.editor.displayMode
        }),
        nearCurrentPage() {
            return Math.abs(this.pageIdx - this.currentPage) <= 2 || this.inVisual()
        }
    },
    mounted() {},
    methods: {
        scrollHandler() {
            this.resizePage()
        },
        transitionStartHandler() {
            this.root.scrollTop = this.scrollTopRatio * this.root.scrollHeight
        },
        dynamicRenderAction() {
            // 只有在当前页附近时才触发渲染
            clearTimeout(this.timer.render)
            this.timer.render = setTimeout(() => {
                if (!this.nearCurrentPage) {
                    this.clearContent()
                    return
                } else {
                    this.$emit('add-queue', async () => {
                        await this.renderPage()
                        await this.renderText(this.textContent)
                    })
                }
            }, 300)
        },
        initPage(fixed_scale = null) {
            // 初始化页面 (Initialize page), 如果性能不佳, 可以尝试设置fixed_scale
            let pageX = this.thisValue
            let { page } = pageX
            if (page === null) return

            this.backendCanvas = document.createElement('canvas')
            let ctx = this.backendCanvas.getContext('2d')
            // 获取设备像素比与画布像素比的缩放系数
            let ratio = this.getRatio(ctx)

            // 根据页面宽度和视口宽度的比率就是内容区的放大比率
            if (this.thisCurrentScale == -1) {
                let dialogWidth = this.parent.clientWidth - 5
                let pageWidth = page.view[2] * ratio
                let scale = dialogWidth / pageWidth
                this.thisCurrentScale = scale
            }

            let canvasViewport = page.getViewport({
                scale: fixed_scale ? fixed_scale : this.thisCurrentScale + this.additionScaleRatio
            })

            let viewport = page.getViewport({
                scale: this.thisCurrentScale + this.additionScaleRatio
            })

            // 记录内容区宽高，后期添加水印时需要
            this.width = canvasViewport.width * ratio
            this.height = canvasViewport.height * ratio

            // 将宽高传递给父元素
            this.$el.style.width = viewport.width + 'px'
            this.$el.style.height = viewport.height + 'px'
        },
        async renderPage(fixed_scale = null) {
            // 渲染Canvas和获取文本内容, 但不渲染文本图层 (Render Canvas and get text content, but do not render text layer)
            // fixed_scale: 固定缩放比例 (fixed_scale: fixed zoom ratio)
            let pageX = this.thisValue
            let { page } = pageX
            if (page === null) return
            if (!pageX.lock) return
            pageX.lock = false

            return await new Promise((resolve) => {
                // 创建临时画布, 并不渲染到页面上 (Create a temporary canvas and do not render it to the page)
                this.backendCanvas = document.createElement('canvas')
                let ctx = this.backendCanvas.getContext('2d')
                // 获取设备像素比与画布像素比的缩放系数
                let ratio = this.getRatio(ctx)

                // 根据容器宽度计算自适应初始缩放比例
                if (this.thisCurrentScale == -1) {
                    let dialogWidth = this.parent.clientWidth - 5
                    let pageWidth = page.view[2] * ratio
                    let scale = dialogWidth / pageWidth
                    this.thisCurrentScale = scale
                }

                let canvasViewport = page.getViewport({
                    scale: fixed_scale
                        ? fixed_scale
                        : this.thisCurrentScale + this.additionScaleRatio
                })

                let viewport = page.getViewport({
                    scale: this.thisCurrentScale + this.additionScaleRatio
                })

                // 记录渲染后内容宽高，供主画布与布局使用
                this.width = canvasViewport.width * ratio
                this.height = canvasViewport.height * ratio

                // 设置离屏画布实际渲染尺寸
                this.backendCanvas.width = this.width
                this.backendCanvas.height = this.height

                // 这里是展示尺寸（保留注释便于后续调试）
                // this.backendCanvas.style.width = `${viewport.width}px`;
                // this.backendCanvas.style.height = `${viewport.height}px`;

                // 同步页面外层容器尺寸
                this.$el.style.width = viewport.width + 'px'
                this.$el.style.height = viewport.height + 'px'

                page.render({
                    canvasContext: ctx,
                    viewport: canvasViewport,
                    transform: [ratio, 0, 0, ratio, 0, 0]
                })
                    .promise.then(() => {
                        return page.getTextContent()
                    })
                    .then((textContent) => {
                        this.textContent = textContent
                        // this.renderText(textContent);
                        this.transferContent()
                        pageX.lock = true
                        this.thisValue = pageX
                        resolve(1)
                    })
            })
        },
        transferContent() {
            // 从离屏画布复制内容到主画布 (Copy content from off-screen canvas to main canvas)
            let canvas = this.$refs.pdfCanvas
            let ctx = canvas.getContext('2d')
            canvas.width = this.width
            canvas.height = this.height
            ctx.drawImage(this.backendCanvas, 0, 0)
        },
        clearContent() {
            // 清空主画布内容 (Clear content from main canvas)
            let canvas = this.$refs.pdfCanvas
            let ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            let textLayerDiv = this.$refs.textLayer
            textLayerDiv.innerHTML = ''
        },
        async renderText(textContent) {
            // 渲染文本图层 (Render text layer)
            let pageX = this.thisValue
            let { page } = pageX
            if (page === null) return
            if (!textContent) return

            let viewport = page.getViewport({
                scale: this.thisCurrentScale + this.additionScaleRatio
            })

            // 创建文本层容器，并与当前 viewport 尺寸保持一致
            let textLayerDiv = this.$refs.textLayer
            textLayerDiv.setAttribute('class', 'textLayer')
            textLayerDiv.style.width = `${viewport.width}px`
            textLayerDiv.style.height = `${viewport.height}px`
            textLayerDiv.style.left = '0'
            textLayerDiv.style.top = '0'
            textLayerDiv.style.transformOrigin = '0 0'
            textLayerDiv.style.transform = 'scale(1)'
            // pdf_viewer.css 依赖 --scale-factor 做字体与交互元素缩放
            textLayerDiv.style.setProperty('--scale-factor', viewport.scale)
            textLayerDiv.innerHTML = ''
            this.textLayerRenderScale = viewport.scale

            const textLayer = new this.$PDFJS.TextLayer({
                textContentSource: textContent,
                container: textLayerDiv,
                // 使用不翻转坐标系的 viewport，避免文本定位偏移
                viewport: viewport.clone({ dontFlip: true })
            })
            await textLayer.render()
            this.refreshHighlight()

            // console.log(
            //     this.pageIdx,
            //     "render success",
            //     pageX.version
            // );
        },
        resizePage() {
            // 重新调整页面尺寸 (Resize page)
            let pageX = this.thisValue
            let { page } = pageX
            if (page === null) return
            let viewport = page.getViewport({
                scale: this.thisCurrentScale + this.additionScaleRatio
            })

            // 这里只调整容器尺寸，文字层绘制由后续流程按需触发
            // canvas.style.width = `${viewport.width}px`;
            // canvas.style.height = `${viewport.height}px`;

            this.goResize(viewport.width, viewport.height)
        },
        goResize(width, height) {
            // 缩放页面
            gsap.to(this.$el.style, {
                duration: 0.3,
                width: width + 'px',
                height: height + 'px',
                ease: 'power2.out',
                onComplete: () => {
                    clearTimeout(this.timer.debounceRender)
                    this.timer.debounceRender = setTimeout(async () => {
                        // 这里也不用nearCurrentPage了, 因为不再视窗的靠dynamicRender就行
                        if (this.inVisual) await this.renderPage()
                    }, 350)
                    this.updateTextLayerTransform()
                    this.resizing = false
                },
                onUpdate: () => {
                    this.transitionStartHandler()
                    this.resizing = true
                }
            })
        },
        updateTextLayerTransform() {
            // 更新文本层缩放 (Update text layer scale), 目前采用CSS transform实现
            const textLayer = this.$refs.textLayer
            if (!textLayer) return
            if (!this.textLayerRenderScale) return
            const currentScale = this.thisCurrentScale + this.additionScaleRatio
            const factor = currentScale / this.textLayerRenderScale
            textLayer.style.transformOrigin = '0 0'
            textLayer.style.transform = `scale(${factor})`
        },
        getRatio(ctx) {
            // 获取设备像素比 (Get device pixel ratio)
            let dpr = window.devicePixelRatio || 1
            let bsr =
                ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio ||
                1

            return dpr / bsr
        },
        refreshHighlight() {
            // 清除所有高亮, 并根据当前viewport重新绘制.
            const textLayer = this.$refs.textLayer
            if (!textLayer) return
            ;[...textLayer.querySelectorAll('div.highlight')].forEach((el) => el.remove())

            for (let node of this.highlightNodes) {
                if (!node.anchor) continue
                const pageRects =
                    node.anchor.pages.find((it) => it.page === this.pageIdx)?.rects || []
                if (pageRects.length === 0) continue
                const scale =
                    this.textLayerRenderScale || this.thisCurrentScale + this.additionScaleRatio
                for (let rect of pageRects) {
                    const el = document.createElement('div')
                    el.setAttribute('class', 'highlight')
                    el.setAttribute('guid', node.guid)
                    el.setAttribute('pdfid', node.pdfid)
                    el.style.left = `${rect.x * scale}px`
                    el.style.top = `${rect.y * scale}px`
                    el.style.width = `${rect.width * scale}px`
                    el.style.height = `${rect.height * scale}px`
                    textLayer.appendChild(el)
                }
            }
        },
        inVisual() {
            // 检查页面是否在视窗内 (Check if page is in visual)
            const rootBoundary = this.root.getBoundingClientRect()
            let container = {
                left: rootBoundary.left,
                top: rootBoundary.top,
                right: rootBoundary.right,
                bottom: rootBoundary.bottom,
                width: rootBoundary.right - rootBoundary.left,
                height: rootBoundary.bottom - rootBoundary.top
            }
            try {
                const { bottom } = this.$refs.pdfCanvas.getBoundingClientRect()
                if (
                    bottom - container.top >= 0 &&
                    bottom - container.top <= this.$refs.pdfCanvas.offsetHeight + container.height
                )
                    return true
            } catch (e) {
                return false
            }
            return false
        }
    }
}
</script>

<style lang="scss">
.pdf-item {
    position: relative;
    width: auto;
    height: auto;
    margin-bottom: 15px;
    flex-shrink: 0;
    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);
    overflow: visible;
    overflow-x: visible;

    canvas {
        // transition: all 0.3s ease-out;
    }

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
            position: absolute;
            cursor: pointer;
            pointer-events: auto;
            z-index: 2;
            background-color: #4158d0;
            background-image: linear-gradient(43deg, #4158d0 0%, #c850c0 16%, #ffcc70 36%);
            background-size: 300%;
            border-radius: 1.5px;
            background-position: 0% 50%;
            transition: background-position 0.8s;
            opacity: 0.3;

            &:hover {
                background-position: 50% 50%;
                border-bottom: #4158d0 solid 2px;
                opacity: 0.4;
            }

            &:active {
                background-color: #4158d0;
                background-image: linear-gradient(43deg, #4158d0 0%, #c850c0 46%, #ffcc70 100%);
                background-position: 150% 50%;
                border-bottom: #4158d0 solid 2px;
                transition: background-position 0.1s;
            }
        }
    }
}
</style>
