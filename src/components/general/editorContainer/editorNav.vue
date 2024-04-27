<template>
    <fv-affix
        v-show="navList.length > 0"
        :target="getTarget"
        :mode="fixed ? 'fixed' : 'relative'"
        :left="0"
        :top="marginTop"
    >
        <div
            class="editor-nav-wrapper"
            :class="[{dark: theme === 'dark'}, {fixed}, {expand: editorExpandContent}]"
            :style="{width: fixed ? width + 'px' : '', height: fixed ? height + 'px' : ''}"
        >
            <div class="editor-nav-container">
                <div
                    class="editor-nav-item"
                    :class="[{choosen: isChoosen(index)}]"
                    v-for="(item, index) in navList"
                    :key="index"
                    @click="jumpTo(item)"
                >
                    <div class="left-ul-block">
                        <i
                            class="up-line"
                            :class="[{hidden: index === 0}]"
                        ></i>
                        <i
                            class="mid-ring"
                            :class="[{mini: item.level > 0}]"
                        ></i>
                        <i
                            class="down-line"
                            :class="[{hidden: index === navList.length - 1}]"
                        ></i>
                    </div>
                    <div
                        class="right-content-block"
                        :style="{padding: `0px ${10 + item.level * 5}px`}"
                    >
                        <p>{{item.text}}</p>
                    </div>
                </div>
            </div>
        </div>
    </fv-affix>
</template>

<script>
import gsap from 'gsap';
import { mapState } from 'vuex';

export default {
    props: {
        el: {
            default: () => {}
        }
    },
    data() {
        return {
            fixed: false,
            width: 0,
            height: 0,
            scrollTop: 0,
            marginTop: 0,
            navList: [],
            timer: {
                nav: null
            },
            lock: {
                raf: true
            }
        };
    },
    watch: {},
    computed: {
        ...mapState({
            editorExpandContent: (state) => state.config.editorExpandContent,
            theme: (state) => state.config.theme
        }),
        isChoosen() {
            return (index) => {
                let item = this.navList[index];
                if (index == this.navList.length - 1)
                    return this.scrollTop >= this.getTop(item.el);
                return (
                    this.scrollTop >= this.getTop(item.el) &&
                    this.scrollTop < this.getTop(this.navList[index + 1].el)
                );
            };
        }
    },
    mounted() {
        this.eventInit();
    },
    methods: {
        eventInit() {
            let editorContainer = this.el().$refs.container;
            let contentContainer = this.el().$refs.editor.$el;
            editorContainer.addEventListener('scroll', this.layoutFormat);
            const resizeObserver = new ResizeObserver(() => {
                this.layoutFormat();
            });
            resizeObserver.observe(editorContainer);
            resizeObserver.observe(contentContainer);
        },
        getTarget() {
            return this.el().$refs.container;
        },
        jumpTo(item) {
            let editorContainer = this.el().$refs.container;
            try {
                gsap.to(editorContainer, {
                    scrollTop: this.getTop(item.el),
                    duration: 0.3,
                    onUpdate: () => {}
                });
            } catch (e) {
                console.log(e);
            }
        },
        getTop(el) {
            let editorContainer = this.el().$refs.container;
            let { top } = el.getBoundingClientRect();
            return editorContainer.scrollTop + top - 180;
        },
        getEditorNavList() {
            clearTimeout(this.timer.nav);
            this.timer.nav = setTimeout(() => {
                let contentContainer = this.el().$refs.editor.$el;
                let navList = [];
                let hList = contentContainer.querySelectorAll(
                    'h1, h2, h3, h4, h5, h6'
                );
                let maxLevel = 6;
                hList.forEach((el) => {
                    let level = el.tagName.slice(1);
                    if (level < maxLevel) maxLevel = level;
                });
                hList.forEach((el) => {
                    let text = el.innerText;
                    let level = el.tagName.slice(1);
                    navList.push({
                        text,
                        level: level - maxLevel,
                        el
                    });
                });
                this.navList = navList;
            }, 300);
        },
        layoutFormat() {
            if (!this.lock.raf) return;
            this.lock.raf = false;
            window.requestAnimationFrame(() => {
                if (!this.el()) {
                    this.lock.raf = true;
                    return;
                }
                let editorContainer = this.el().$refs.container;
                let contentContainer = this.el().$refs.editor.$el;
                let editorWidth = editorContainer.offsetWidth;
                let contentWidth = contentContainer.offsetWidth;
                let editorHeight = editorContainer.offsetHeight;
                let editorPaddingTop = parseInt(
                    window.getComputedStyle(editorContainer).paddingTop
                );
                let top = editorContainer.scrollTop;
                let width = (editorWidth - contentWidth) / 2;
                this.width = width - 30;
                this.height = editorHeight - editorPaddingTop;
                this.marginTop = editorPaddingTop;
                this.scrollTop = top;
                if (editorWidth - contentWidth > 460) {
                    this.fixed = true;
                } else {
                    this.fixed = false;
                }
                this.lock.raf = true;
            });
        }
    },
    beforeDestroy() {
        // 不用操作了, 因为editorContainer会先销毁掉
        // let editorContainer = this.el().$refs.container;
        // editorContainer.removeEventListener('scroll', this.layoutFormat);
    }
};
</script>

<style lang="scss">
.editor-nav-wrapper {
    @include HcenterVcenterC;

    position: relative;
    width: 100%;
    box-sizing: border-box;
    opacity: 0.6;
    transition: opacity 0.6s;

    &:hover {
        opacity: 1;
    }

    &.fixed {
        height: 100%;
        padding: 0px 25px;

        .editor-nav-container {
            max-width: 270px;
        }
    }

    &.expand {
        .editor-nav-container {
            max-width: none;
        }
    }

    &.dark {
        .editor-nav-container {
            .editor-nav-item {
                .right-content-block {
                    color: rgba(255, 255, 255, 1);

                    &:hover {
                        background: rgba(255, 255, 255, 1);
                        color: rgba(161, 169, 255, 1);
                    }
                }
            }
        }
    }

    .editor-nav-container {
        @include HcenterVcenterC;

        position: relative;
        width: 100%;
        max-width: 900px;
        height: auto;
        box-sizing: border-box;

        .editor-nav-item {
            @include Vcenter;

            width: 100%;
            height: 30px;

            &.choosen {
                .left-ul-block {
                    .mid-ring {
                        background: rgba(140, 148, 228, 1);
                    }
                }

                .right-content-block {
                    color: rgba(140, 148, 228, 1);
                }
            }

            .left-ul-block {
                @include HcenterVcenterC;

                position: relative;
                width: 20px;
                height: 100%;

                .up-line {
                    width: 3px;
                    flex: 1;
                    background: rgba(140, 148, 228, 0.1);
                }

                .mid-ring {
                    width: 8px;
                    height: 8px;
                    background: rgba(140, 148, 228, 0.3);
                    border-radius: 50%;

                    &:hover {
                        background: rgba(140, 148, 228, 0.6);
                    }

                    &.mini {
                        width: 5px;
                        height: 5px;
                    }
                }

                .down-line {
                    width: 3px;
                    flex: 1;
                    background: rgba(140, 148, 228, 0.1);
                }

                .hidden {
                    opacity: 0;
                }
            }
        }

        .right-content-block {
            @include Vcenter;

            position: relative;
            width: 50px;
            height: 100%;
            flex: 1;
            padding: 0px 10px;
            font-size: 13.8px;
            font-weight: bold;
            color: rgba(75, 75, 75, 1);
            border-radius: 6px;
            box-sizing: border-box;
            user-select: none;
            cursor: pointer;

            &:hover {
                background: rgba(255, 255, 255, 0.6);
                color: rgba(140, 148, 228, 1);
            }

            p {
                @include nowrap;
            }
        }
    }
}
</style>