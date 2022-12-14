<template>
    <div
        class="fabulous-pdf-container"
        :class="[{dark: theme === 'dark'}]"
        @mousewheel="onMouseWheel"
    >
        <div
            class="pdf-display-scroll-view"
            :style="{width: scroller.width}"
            ref="scroller_view"
        >
            <pdf-item
                :value="getPdfPage(pageIdx)"
                v-for="pageIdx in totalPages"
                :ref="`pdf_item:${pageIdx}`"
                :key="pageIdx"
                :root="$el"
                :parent="$refs.scroller_view"
                :pageIdx="pageIdx"
                :hmrVersion="hmrVersion"
                :displayMode="displayMode"
                :local="local"
                :currentScale.sync="currentScale"
                :additionScaleRatio="additionScaleRatio"
                :scrollTop="container.scrollTop"
                :scrollTopRatio="container.scrollTopRatio"
                :pdfNoteInfo="pdfNoteInfo"
                :pdfNoteList="pdfNoteList"
                :highlightNodes="highlightNodes"
                :reviseEditor="reviseEditor"
                :show="show.toolbar"
                :theme="theme"
                @update-page="revisePdfPage(pageIdx, $event)"
                @show-quick-note="show.toolbar.quickNote = $event"
            ></pdf-item>
            <fv-progress-ring
                v-if="totalPages === 0"
                loading="true"
                r="20"
                color="rgba(246, 161, 187, 1)"
                borderWidth="5"
            ></fv-progress-ring>
        </div>
        <transition name="move-top-to-bottom">
            <div
                v-show="container.width !== 0"
                class="fabulous-pdf-tool-bar"
                :style="{left: `${container.left + 60}px`, top: `${container.top + 35}px`, width: `${container.width - 120}px`}"
            >
                <div class="fabulous-pdf-tool-bar-wrapper">
                    <div class="left-block">
                        <fv-text-box
                            v-model="currentPageStr"
                            :theme="theme"
                            fontSize="12"
                            style="width: 40px; height: 100%;"
                            @keyup="toPage"
                        ></fv-text-box>
                        <p style="margin-left: 5px; font-size: 12px;">/ {{totalPages}}</p>
                    </div>
                    <div class="right-block">
                        <fv-button
                            :theme="theme"
                            class="control-btn"
                            :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)': 'rgba(247, 247, 247, 1)'"
                            :title="local(`Scale Down`)"
                            style="margin-left: 2px;"
                            @click="scaleDown"
                        >
                            <i class="ms-Icon ms-Icon--Remove"></i>
                        </fv-button>
                        <fv-button
                            :theme="theme"
                            class="control-btn"
                            :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)': 'rgba(247, 247, 247, 1)'"
                            :title="local(`Scale Up`)"
                            style="margin-left: 2px;"
                            @click="scaleUp"
                        >
                            <i class="ms-Icon ms-Icon--Add"></i>
                        </fv-button>
                        <fv-button
                            :theme="theme"
                            class="control-btn"
                            :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)': 'rgba(247, 247, 247, 1)'"
                            :title="local(`Open with Browser`)"
                            style="margin-left: 2px;"
                            @click="$emit('open-with-browser')"
                        >
                            <i class="ms-Icon ms-Icon--Globe"></i>
                        </fv-button>
                        <fv-button
                            :theme="show.toolbar.quickNote ? 'dark' : theme"
                            class="control-btn"
                            :background="show.toolbar.quickNote ? 'rgba(247, 191, 100, 1)' : theme === 'dark' ? 'rgba(36, 36, 36, 1)': 'rgba(247, 247, 247, 1)'"
                            :title="local(`Toggle QuickNote`)"
                            :disabled="disabledEditor"
                            style="margin-left: 2px;"
                            @click="show.toolbar.quickNote ^= true"
                        >
                            <i class="ms-Icon ms-Icon--QuickNote"></i>
                        </fv-button>
                        <fv-button
                            :theme="show.toolbar.translate ? 'dark' : theme"
                            class="control-btn"
                            :background="show.toolbar.translate ? 'rgba(0, 98, 158, 1)' : theme === 'dark' ? 'rgba(36, 36, 36, 1)': 'rgba(247, 247, 247, 1)'"
                            :title="local(`Toggle Translator`)"
                            style="margin-left: 2px;"
                            @click="show.toolbar.translate ^= true"
                        >
                            <i class="ms-Icon ms-Icon--LocaleLanguage"></i>
                        </fv-button>
                    </div>
                </div>
            </div>
        </transition>
        <add-ring-button
            v-model="show.addNote"
            :parent="$el"
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
</template>

<script>
import gsap from "gsap";

import { mapGetters, mapMutations, mapState } from "vuex";

import pdfItem from "./pdfItem.vue";
import addRingButton from "./addRingButton.vue";
import translatorBox from "@/components/general/pdfViewer/translatorBox.vue";

import "pdfjs-dist/web/pdf_viewer.css";

const { ipcRenderer: ipc } = require("electron");

export default {
    components: {
        pdfItem,
        addRingButton,
        translatorBox,
    },
    props: {
        url: {
            default:
                "C:/Users/Alever/OneDrive/Documents/Papers/Fabulous/root/items/c8732a00/c8732a00.pdf",
        },
        disabledEditor: {
            default: false,
        },
        theme: {
            default: "light",
        },
    },
    data() {
        return {
            currentPage: 1,
            currentPageStr: "1",
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
                scrollTopRatio: 0,
            },
            scroller: {
                width: `100%`,
            },
            translateObj: {
                selection: "",
                text: "",
                pronunciation: "",
            },
            selectionObj: {
                pos: {
                    left: 0,
                    top: 0,
                    canvasIndex: 0,
                },
                rangeNodes: [],
                content: "",
            },
            show: {
                translate: false,
                editable: false,
                addNote: false,
                toolbar: {
                    translate: true,
                    quickNote: false,
                },
            },
            timer: {
                width: null,
                translate: null,
            },
            lock: {
                init: true,
                page: [],
                scaling: false,
            },
        };
    },
    watch: {
        url() {
            this.$nextTick(() => {
                this.totalPages = 0;
                this.currentPage - 1;
                this.currentPageStr - "1";
                this.hmrVersion = 0;
                this.pdfPages = [];
                this.initPDF();
            });
        },
        additionScaleRatio() {
            this.hmrVersion += 1;
        },
        currentPage() {
            this.currentPageStr = this.currentPage.toString();
        },
        "translateObj.selection"() {
            this.translateObj.text = "";
            this.toTranslate(800);
        },
        "show.toolbar.quickNote"() {
            this.widthFormat();
        },
        displayMode() {
            if (this.displayMode !== 0) {
                this.alignFormat();
            }
        },
    },
    computed: {
        ...mapState({
            targetContent: (state) => state.editor.targetContent,
            pdfNoteInfo: (state) => state.editor.pdfNoteInfo,
            displayMode: (state) => state.editor.displayMode,
        }),
        ...mapGetters(["local"]),
        highlightNodes() {
            let content = this.targetContent.content;
            let result = [];
            for (let i = 0; i < content.length; i++) {
                let node = content[i];
                if (node.content) content = content.concat(node.content);
                try {
                    if (node.type === "pdfNote") {
                        result.push({
                            guid: node.attrs.guid,
                            pos: node.attrs.pos,
                            rangeNodes: node.attrs.rangeNodes,
                            content: node.attrs.content,
                        });
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            return result;
        },
        pdfNoteList() {
            let content = this.targetContent.content;
            let arr = [];
            let result = [];
            for (let i = 0; i < content.length; i++) {
                let node = content[i];
                if (node.content) content = content.concat(node.content);
                try {
                    if (node.type === "pdfNote") {
                        arr.push({
                            guid: node.attrs.guid,
                            type: node.type,
                            content: node.content,
                            idx: node.attrs.pos.canvasIndex,
                            pos: node.attrs.pos,
                        });
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            for (let item of arr) {
                if (!result[item.idx]) {
                    result[item.idx] = [];
                }
                result[item.idx].push(item);
            }
            return result;
        },
        getPdfPage() {
            return (pageIdx) => {
                let item = this.pdfPages.find((it) => it.num === pageIdx);
                return item
                    ? item
                    : {
                          num: pageIdx,
                          page: null,
                          lock: true,
                          version: -1,
                      };
            };
        },
    },
    mounted() {
        this.timerInit();
        setTimeout(() => {
            this.initPDF();
        }, 300);
        this.eventInit();
    },
    methods: {
        ...mapMutations({
            reviseEditor: "reviseEditor",
        }),
        timerInit() {
            this.timer.width = setInterval(() => {
                window.requestAnimationFrame(() => {
                    const { left, top, right, bottom } =
                        this.$el.getBoundingClientRect();
                    this.container.left = left;
                    this.container.top = top;
                    this.container.right = right;
                    this.container.bottom = bottom;
                    this.container.width = right - left;
                    this.container.height = bottom - top;
                });
            }, 10);
        },
        eventInit() {
            this.$el.addEventListener("scroll", () => {
                this.refreshCurrentPage();
                this.container.scrollTop = this.$el.scrollTop;
            });
            let getTextEvent = () => {
                let result = this.getRangeNodes(this.$refs.scroller_view);
                let text = "";
                if (result.length === 1) {
                    text = result[0].node.innerText.slice(
                        result[0].offset,
                        result[0].endOffset
                    );
                } else {
                    result.forEach((el) => {
                        text += `${el.node.innerText.slice(
                            el.offset,
                            el.endOffset
                        )} `;
                    });
                }
                text = text.replace(/ +/g, " ");
                return {
                    text,
                    rangeNodes: result,
                };
            };
            let insideTextLayer = (event) => {
                let x = event.target;
                let _self = false;
                while (x && x.tagName && x.tagName.toLowerCase() != "body") {
                    if ([...x.classList].includes("textLayer")) {
                        _self = true;
                        break;
                    }
                    x = x.parentNode;
                }
                return _self;
            };
            let translateEvent = (event) => {
                if (!this.show.toolbar.translate) return;
                if (!insideTextLayer(event)) return;
                let text = getTextEvent().text;
                this.translateObj.selection = text;
                if (this.translateObj.selection !== "")
                    this.show.translate = true;
                this.toTranslate();
            };
            let addPDFNoteEvent = (event) => {
                if (this.disabledEditor) return;
                if (!insideTextLayer(event)) return;
                let { text, rangeNodes } = getTextEvent();
                if (text.replace(/ +/g, "") === "") {
                    this.show.addNote = false;
                    return;
                }
                this.selectionObj.content = text;
                this.selectionObj.rangeNodes = rangeNodes;
                let node = rangeNodes[0].node;
                let targetNode = {
                    index: 0,
                    node: null,
                };
                for (let i = 1; i <= this.totalPages; i++) {
                    let pdf_item = this.$refs[`pdf_item:${i}`][0].$el;
                    let index = [].indexOf.call(
                        pdf_item.querySelectorAll("span"),
                        node
                    );
                    if (index > -1) {
                        targetNode.index = i;
                        targetNode.node = pdf_item;
                        break;
                    }
                }
                this.selectionObj.pos.left =
                    parseFloat(
                        getComputedStyle(node).getPropertyValue("left")
                    ) / targetNode.node.offsetWidth;
                this.selectionObj.pos.top =
                    parseFloat(getComputedStyle(node).getPropertyValue("top")) /
                    targetNode.node.offsetHeight;
                this.selectionObj.pos.canvasIndex = targetNode.index;
                this.show.addNote = true;
            };
            this.$refs.scroller_view.addEventListener("click", translateEvent);
            this.$refs.scroller_view.addEventListener("click", addPDFNoteEvent);
            ipc.on("translate-callback", (event, res) => {
                this.translateObj.text = res.text;
                this.translateObj.pronunciation = res.pronunciation;
            });
        },
        async initPDF() {
            if (!this.lock.init) return;
            this.lock.init = false;
            let guid = this.$Guid();
            ipc.send("read-binary", {
                id: guid,
                path: this.url,
            });
            let url = await new Promise((resolve) => {
                ipc.on(`read-binary-${guid}`, (event, arg) => {
                    let blob = new Blob([arg], { type: "application/pdf" });
                    let url = URL.createObjectURL(blob);
                    resolve(url);
                });
            });
            this.$PDFJS.getDocument(url).promise.then((pdf) => {
                // ????????????
                this.pdfDoc = pdf;
                // ?????????
                this.totalPages = pdf.numPages;
                this.lock.init = true;
                // ????????????
                for (let i = 1; i <= this.totalPages; i++) {
                    this.pdfDoc.getPage(i).then((page) => {
                        this.pdfPages.push({
                            num: i,
                            page,
                            lock: true,
                            version: -1,
                        });
                    });
                }
            });
        },
        refreshCurrentPage() {
            if (!this.pdfDoc) return;
            let arr = [];
            for (let i = 1; i <= this.totalPages; i++) {
                const { bottom } =
                    this.$refs[`pdf_item:${i}`][0].$el.getBoundingClientRect();
                arr.push({
                    i,
                    value: Math.abs(bottom - this.container.height),
                });
            }
            arr.sort((a, b) => {
                return a.value - b.value;
            });
            if (arr[0]) this.currentPage = arr[0].i;
        },
        revisePdfPage(idx, obj) {
            let index = this.pdfPages.findIndex((item) => item.num === idx);
            if (index === -1) return;
            this.$set(this.pdfPages, index, obj);
        },
        scaleUp() {
            this.container.scrollTopRatio =
                this.$el.scrollTop / this.$el.scrollHeight;
            if (this.currentScale + this.additionScaleRatio < 5.7) {
                this.additionScaleRatio += 0.3;
                this.widthFormat();
            }
        },
        scaleDown() {
            this.container.scrollTopRatio =
                this.$el.scrollTop / this.$el.scrollHeight;
            if (this.currentScale + this.additionScaleRatio > 0.6) {
                this.additionScaleRatio -= 0.3;
                this.widthFormat();
            }
        },
        onMouseWheel(event) {
            if (event.ctrlKey) {
                event.preventDefault();
                if (event.deltaY > 0) {
                    this.scaleDown();
                } else {
                    this.scaleUp();
                }
            }
        },
        tryFindTextLayerIndex(node) {
            let parent = node.parentNode;
            while (
                parent &&
                parent.tagName &&
                parent.tagName.toLowerCase() != "body"
            ) {
                if ([...parent.classList].includes("textLayer")) {
                    let children = this.$el.querySelectorAll("div.textLayer");
                    return [...children].indexOf(parent) / 1 + 1;
                }
                parent = parent.parentNode;
            }
            return 1;
        },
        getRangeNodes(rootNode = null) {
            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            let root = rootNode ? rootNode : range.commonAncestorContainer;
            if (root.nodeType === Node.TEXT_NODE) {
                root = root.parentNode;
                return [
                    {
                        node: root,
                        offset: range.startOffset,
                        endOffset: range.endOffset,
                        index: null,
                        layerIndex: this.tryFindTextLayerIndex(root),
                        relativeIndex: [
                            ...root.parentNode.querySelectorAll(root.tagName),
                        ].indexOf(root),
                    },
                ];
            }
            let start = {
                node: range.startContainer,
                offset: range.startOffset,
                endOffset: Infinity,
            };
            let end = {
                node: range.endContainer,
                offset: null,
                endOffset: range.endOffset,
            };
            if (start.node.nodeType === Node.TEXT_NODE)
                start.node = start.node.parentNode;
            if (end.node.nodeType === Node.TEXT_NODE)
                end.node = end.node.parentNode;
            let children = root.querySelectorAll("span");
            start.index = [...children].indexOf(start.node);
            start.relativeIndex = [
                ...start.node.parentNode.querySelectorAll("span"),
            ].indexOf(start.node);
            start.layerIndex = this.tryFindTextLayerIndex(start.node);
            end.index = [...children].indexOf(end.node);
            end.relativeIndex = [
                ...end.node.parentNode.querySelectorAll("span"),
            ].indexOf(end.node);
            end.layerIndex = this.tryFindTextLayerIndex(end.node);
            if (
                range.collapsed === true ||
                range.startContainer === range.endContainer
            ) {
                return [
                    {
                        node: start.node,
                        offset: range.startOffset,
                        endOffset: range.endOffset,
                        index: start.index,
                        layerIndex: this.tryFindTextLayerIndex(start.node),
                        relativeIndex: start.relativeIndex,
                    },
                ];
            }
            let result = [];
            result.push(start);
            for (let i = start.index + 1; i < end.index; i++) {
                result.push({
                    node: children[i],
                    offset: null,
                    endOffset: Infinity,
                    index: i,
                    layerIndex: this.tryFindTextLayerIndex(children[i]),
                    relativeIndex: [
                        ...children[i].parentNode.querySelectorAll("span"),
                    ].indexOf(children[i]),
                });
            }
            result.push(end);
            return result;
        },
        toTranslate(period = 500) {
            clearTimeout(this.timer.translate);
            this.timer.translate = setTimeout(() => {
                if (this.translateObj.selection !== "") {
                    ipc.send("translate", {
                        text: this.translateObj.selection,
                        from: "en",
                        to: "zh-CN",
                    });
                }
            }, period);
        },
        ctrlEnterTranslate(event) {
            if (!(event.keyCode === 13 && event.ctrlKey)) return;
            this.toTranslate();
        },
        widthFormat() {
            let el = this.$refs.scroller_view;
            el = el.querySelectorAll(".pdf-item")[0];
            if (!el) return;
            this.scroller.width = `${
                el.offsetWidth +
                (this.displayMode === 1 && this.show.toolbar.quickNote
                    ? 1000
                    : 50)
            }px`;
            this.$nextTick(() => {
                this.alignFormat();
            });
        },
        alignFormat() {
            let width = this.$el.clientWidth;
            let scrollerWidth = this.$refs.scroller_view.clientWidth;
            this.$el.scrollLeft = (scrollerWidth - width) / 2;
        },
        toPage(event, offset = 0) {
            if (event.keyCode !== 13) return;
            if (this.currentPageStr <= 0) {
                this.currentPageStr = 1;
            }
            if (this.currentPageStr > this.totalPages) {
                this.currentPageStr = this.totalPages;
            }
            let height = 0;
            for (let i = 2; i <= this.currentPageStr; i++) {
                let pdfItem = this.$refs[`pdf_item:${i - 1}`][0].$el;
                height +=
                    pdfItem.offsetHeight +
                    parseFloat(
                        getComputedStyle(pdfItem).getPropertyValue(
                            "margin-bottom"
                        )
                    );
            }
            gsap.to(this.$el, {
                scrollTop: height + offset,
                duration: 0.2,
                ease: "power3.out",
            });
        },
    },
    beforeDestroy() {
        for (let key in this.timer) {
            clearInterval(this.timer[key]);
        }
    },
};
</script>

<style lang="scss">
.fabulous-pdf-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;

    &.dark {
        .fabulous-pdf-tool-bar {
            .fabulous-pdf-tool-bar-wrapper {
                background: rgba(50, 50, 50, 0.8);
                color: whitesmoke;
            }
        }
    }

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
    }

    .fabulous-pdf-tool-bar {
        position: fixed;
        left: 15px;
        top: 50px;
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        transition: all 0.3s;
        z-index: 3;

        .fabulous-pdf-tool-bar-wrapper {
            @include Vcenter;

            position: relative;
            width: 100%;
            height: 100%;
            padding: 5px 15px;
            background: rgba(247, 247, 247, 0.8);
            border: rgba(120, 120, 120, 0.1) solid thin;
            border-radius: 12px;
            box-sizing: border-box;
            box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1),
                0px 3px 6px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(50px);
            -webkit-backdrop-filter: blur(50px);

            .left-block {
                @include Vcenter;

                position: relative;
                width: 100%;
                height: 100%;
                flex: 1;
            }

            .right-block {
                @include HendVcenter;

                position: relative;
                width: 100%;
                height: 100%;
                flex: 1;
            }

            .control-btn {
                width: 30px;
                height: 100%;
            }
        }
    }
}
</style>