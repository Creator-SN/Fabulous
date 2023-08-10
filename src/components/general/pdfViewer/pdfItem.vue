<template>
    <div
        class="pdf-item"
        :class="{
            hide: resizing
        }"
        :key="pageIdx"
    >
        <canvas
            ref="pdfCanvas"
            style="width: 100%; height: 100%;"
        ></canvas>
        <div ref="textLayer"></div>
        <note-layer
            v-if="show.quickNote"
            v-show="displayMode === 1"
            :value="pdfNoteList[pageIdx]"
            :theme="theme"
            :local="local"
            :language="language"
            :scale="thisCurrentScale + additionScaleRatio"
            :pdfNoteInfo="pdfNoteInfo"
            :reviseEditor="reviseEditor"
        ></note-layer>
    </div>
</template>

<script>
import gsap from 'gsap';
import noteLayer from './noteLayer.vue';
import { TextLayerBuilder } from 'pdfjs-dist/web/pdf_viewer';

import { mapGetters, mapMutations, mapState } from 'vuex';

export default {
    components: {
        noteLayer
    },
    props: {
        value: {
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
        pdfNoteInfo: {
            default: () => ({})
        },
        pdfNoteList: {
            default: () => []
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
            thisValue: this.value,
            thisCurrentScale: this.currentScale,
            backendCanvas: null,
            textContent: null,
            resizing: false,
            timer: {
                render: null
            }
        };
    },
    watch: {
        'value.page'(val) {
            if (val !== null) {
                this.thisValue = this.value;
                this.initPage(2);
            }
        },
        thisValue(val) {
            this.$emit('update-page', val);
        },
        currentScale(val) {
            this.thisCurrentScale = val;
        },
        thisCurrentScale(val) {
            this.$emit('update:currentScale', val);
        },
        additionScaleRatio() {
            this.scrollHandler();
        },
        nearCurrentPage: {
            handler() {
                // 当前页附近状态变化时才触发 (Trigger only when the status near the current page changes)
                this.dynamicRenderAction();
            },
            immediate: true
        },
        highlightNodes: {
            deep: true,
            handler() {
                if (this.value.page !== null) this.refreshHighlight();
            }
        }
    },
    computed: {
        ...mapState({
            language: (state) => state.config.language,
            displayMode: (state) => state.editor.displayMode
        }),
        ...mapGetters(['local', 'currentDataPath']),
        nearCurrentPage() {
            return (
                Math.abs(this.pageIdx - this.currentPage) <= 2 ||
                this.inVisual()
            );
        }
    },
    mounted() {},
    methods: {
        ...mapMutations({
            reviseEditor: 'reviseEditor'
        }),
        scrollHandler() {
            this.resizePage();
        },
        transitionStartHandler() {
            this.root.scrollTop = this.scrollTopRatio * this.root.scrollHeight;
        },
        dynamicRenderAction() {
            clearTimeout(this.timer.render);
            this.timer.render = setTimeout(() => {
                if (!this.nearCurrentPage) {
                    this.clearContent();
                    return;
                } else {
                    this.$emit('add-queue', async () => {
                        await this.renderPage(2);
                        await this.renderText(this.textContent);
                    });
                }
            }, 300);
        },
        initPage(fixed_scale = null) {
            let pageX = this.thisValue;
            let { page } = pageX;
            if (page === null) return;

            this.backendCanvas = document.createElement('canvas');
            let ctx = this.backendCanvas.getContext('2d');
            // 获取页面比率
            let ratio = this.getRatio(ctx);

            // 根据页面宽度和视口宽度的比率就是内容区的放大比率
            if (this.thisCurrentScale == -1) {
                let dialogWidth = this.parent.clientWidth - 5;
                let pageWidth = page.view[2] * ratio;
                let scale = dialogWidth / pageWidth;
                this.thisCurrentScale = scale;
            }

            let canvasViewport = page.getViewport({
                scale: fixed_scale
                    ? fixed_scale
                    : this.thisCurrentScale + this.additionScaleRatio
            });

            let viewport = page.getViewport({
                scale: this.thisCurrentScale + this.additionScaleRatio
            });

            // 记录内容区宽高，后期添加水印时需要
            this.width = canvasViewport.width * ratio;
            this.height = canvasViewport.height * ratio;

            // 将宽高传递给父元素
            this.$el.style.width = viewport.width + 'px';
            this.$el.style.height = viewport.height + 'px';
        },
        async renderPage(fixed_scale = null) {
            // 渲染Canvas和获取文本内容, 但不渲染文本图层 (Render Canvas and get text content, but do not render text layer)
            // fixed_scale: 固定缩放比例 (fixed_scale: fixed zoom ratio)
            let pageX = this.thisValue;
            let { page } = pageX;
            if (page === null) return;
            if (!pageX.lock) return;
            pageX.lock = false;

            return await new Promise((resolve) => {
                // 创建临时画布, 并不渲染到页面上 (Create a temporary canvas and do not render it to the page)
                this.backendCanvas = document.createElement('canvas');
                let ctx = this.backendCanvas.getContext('2d');
                // 获取页面比率
                let ratio = this.getRatio(ctx);

                // 根据页面宽度和视口宽度的比率就是内容区的放大比率
                if (this.thisCurrentScale == -1) {
                    let dialogWidth = this.parent.clientWidth - 5;
                    let pageWidth = page.view[2] * ratio;
                    let scale = dialogWidth / pageWidth;
                    this.thisCurrentScale = scale;
                }

                let canvasViewport = page.getViewport({
                    scale: fixed_scale
                        ? fixed_scale
                        : this.thisCurrentScale + this.additionScaleRatio
                });

                let viewport = page.getViewport({
                    scale: this.thisCurrentScale + this.additionScaleRatio
                });

                // 记录内容区宽高，后期添加水印时需要
                this.width = canvasViewport.width * ratio;
                this.height = canvasViewport.height * ratio;

                // 画布渲染尺寸
                this.backendCanvas.width = this.width;
                this.backendCanvas.height = this.height;

                // 展示尺寸
                // this.backendCanvas.style.width = `${viewport.width}px`;
                // this.backendCanvas.style.height = `${viewport.height}px`;

                // 将宽高传递给父元素
                this.$el.style.width = viewport.width + 'px';
                this.$el.style.height = viewport.height + 'px';

                page.render({
                    canvasContext: ctx,
                    viewport: canvasViewport,
                    transform: [ratio, 0, 0, ratio, 0, 0]
                })
                    .promise.then(() => {
                        return page.getTextContent();
                    })
                    .then((textContent) => {
                        this.textContent = textContent;
                        // this.renderText(textContent);
                        this.transferContent();
                        pageX.lock = true;
                        this.thisValue = pageX;
                        resolve(1);
                    });
            });
        },
        transferContent() {
            let canvas = this.$refs.pdfCanvas;
            let ctx = canvas.getContext('2d');
            canvas.width = this.width;
            canvas.height = this.height;
            ctx.drawImage(this.backendCanvas, 0, 0);
        },
        clearContent() {
            let canvas = this.$refs.pdfCanvas;
            let ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let textLayerDiv = this.$refs.textLayer;
            textLayerDiv.innerHTML = '';
        },
        async renderText(textContent) {
            let pageX = this.thisValue;
            let { page } = pageX;
            if (page === null) return;

            let viewport = page.getViewport({
                scale: this.thisCurrentScale + this.additionScaleRatio
            });

            // 创建文本图层div (Create text layer div)
            let textLayerDiv = this.$refs.textLayer;
            textLayerDiv.setAttribute('class', 'textLayer');
            textLayerDiv.innerHTML = '';

            // 创建新的TextLayerBuilder实例 (Create a new TextLayerBuilder instance)
            let textLayer = new TextLayerBuilder({
                textLayerDiv: textLayerDiv,
                pageIndex: this.pageIdx,
                viewport: viewport
            });

            textLayer.setTextContent(textContent);

            textLayer.render();

            setTimeout(() => {
                this.refreshHighlight();
            }, 300);

            // console.log(
            //     this.pageIdx,
            //     "render success",
            //     pageX.version
            // );
        },
        resizePage() {
            let pageX = this.thisValue;
            let { page } = pageX;
            if (page === null) return;
            let viewport = page.getViewport({
                scale: this.thisCurrentScale + this.additionScaleRatio
            });

            // 展示尺寸
            // canvas.style.width = `${viewport.width}px`;
            // canvas.style.height = `${viewport.height}px`;

            this.goResize(viewport.width, viewport.height);
        },
        goResize(width, height) {
            gsap.to(this.$el.style, {
                duration: 0.3,
                width: width + 'px',
                height: height + 'px',
                ease: 'power2.out',
                onComplete: () => {
                    this.renderText(this.textContent);
                    this.resizing = false;
                },
                onUpdate: () => {
                    this.transitionStartHandler();
                    this.resizing = true;
                }
            });
        },
        getRatio(ctx) {
            let dpr = window.devicePixelRatio || 1;
            let bsr =
                ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio ||
                1;

            return dpr / bsr;
        },
        refreshHighlight() {
            let updateGuid = (event) => {
                if (!this.show.quickNote) this.$emit('show-quick-note', true);
                this.reviseEditor({
                    pdfNoteInfo: {
                        guid: event.target.getAttribute('guid'),
                        version: this.$Guid()
                    }
                });
            };

            let children = this.$el.querySelectorAll('span');
            children.forEach((child) => {
                child.classList.remove('highlight');
                child.removeAttribute('guid');
                child.onclick = null;
            });

            for (let node of this.highlightNodes) {
                let children = this.$refs.textLayer.querySelectorAll('span');
                for (let i = 0; i < node.rangeNodes.length; i++) {
                    if (node.rangeNodes[i].layerIndex !== this.pageIdx)
                        continue;
                    let index = node.rangeNodes[i].relativeIndex
                        ? node.rangeNodes[i].relativeIndex
                        : 0;
                    if (!children[index]) continue;
                    children[index].setAttribute('class', 'highlight');
                    children[index].setAttribute('guid', node.guid);
                    children[index].onclick = updateGuid;
                }
            }
        },
        inVisual() {
            const rootBoundary = this.root.getBoundingClientRect();
            let container = {
                left: rootBoundary.left,
                top: rootBoundary.top,
                right: rootBoundary.right,
                bottom: rootBoundary.bottom,
                width: rootBoundary.right - rootBoundary.left,
                height: rootBoundary.bottom - rootBoundary.top
            };
            try {
                const { bottom } = this.$refs.pdfCanvas.getBoundingClientRect();
                if (
                    bottom - container.top >= 0 &&
                    bottom - container.top <=
                        this.$refs.pdfCanvas.offsetHeight + container.height
                )
                    return true;
            } catch (e) {
                return false;
            }
            return false;
        }
    }
};
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
            span.highlight {
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
        span.highlight {
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
</style>