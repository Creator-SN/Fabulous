<template>
    <transition name="zoom-in-top">
        <div
            v-show="thisValue"
            class="fabulous-rightMenu"
            :class="[{dark: theme === 'dark'}]"
            :style="{left: posX + 'px', top: posY + 'px', width: rightMenuWidth + 'px'}"
        >
            <slot>
                <div>
                    <span>
                        <p>Selected</p>
                    </span>
                </div>
            </slot>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'rightMenu',
    props: {
        value: {
            default: false
        },
        rightMenuWidth: {
            default: 200
        },
        theme: {
            default: 'light'
        }
    },
    data() {
        return {
            thisValue: this.value,
            posX: 0,
            posY: 0,
            rightMenuHeight: 0
        };
    },
    watch: {
        value(val) {
            this.thisValue = val;
        },
        thisValue(val) {
            this.$emit('input', val);
            if (this.rightMenuHeight == 0) {
                this.rightMenuHeight = this.$el.clientHeight;
                this.$emit('update-height', this.rightMenuHeight);
            }
        }
    },
    mounted() {
        this.globalAppendInit();
        this.rightMenuClearInit();
    },
    methods: {
        globalAppendInit() {
            this.$nextTick(() => {
                const body = document.querySelector('body');
                if (body.append) {
                    body.append(this.$el);
                } else {
                    body.appendChild(this.$el);
                }
            });
        },
        rightMenuClearInit() {
            window.addEventListener('click', (event) => {
                let x = event.target;
                if (x && x !== this.$el) this.thisValue = false;
            });
        },
        rightClick(event, el) {
            event.preventDefault();
            this.thisValue = true;
            let bounding = el.getBoundingClientRect();
            let targetPos = {};
            targetPos.x = event.x;
            targetPos.y = event.y;
            if (targetPos.x < bounding.left) targetPos.x = bounding.left;
            if (targetPos.x + this.rightMenuWidth > bounding.right)
                targetPos.x = bounding.right - this.rightMenuWidth;
            if (targetPos.y < bounding.top) targetPos.y = bounding.top;
            if (targetPos.y + this.rightMenuHeight > bounding.bottom)
                targetPos.y = bounding.bottom - this.rightMenuHeight;
            this.posX = targetPos.x;
            this.posY = targetPos.y;
        }
    }
};
</script>

<style lang="scss">
.fabulous-rightMenu {
    position: fixed;
    top: 100%;
    width: 200px;
    height: auto;
    padding: 8px 0px;
    background: rgba(255, 255, 255, 0.3);
    border: rgba(36, 36, 36, 0.1) solid thin;
    border-radius: 8px;
    box-sizing: border-box;
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    z-index: 3;

    div {
        padding: 1px 0px;

        span {
            width: calc(100% - 10px);
            margin-left: 5px;
            padding: 8px 10px;
            font-size: 13px;
            border-radius: 3px;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;

            &:hover {
                background: rgba(200, 200, 200, 0.3);
                cursor: pointer;
            }

            &:active {
                background: rgba(200, 200, 200, 0.5);
            }

            p {
                @include nowrap;

                width: 100%;
                margin: 0px;
                padding: 0px 15px;
                font-size: 12px;
                font-weight: 400;
                overflow: hidden;
            }
        }

        hr {
            margin: 8px 15px;
            border: thin;
            border-bottom: rgba(0, 0, 0, 0.1) solid thin;
        }
    }

    &.dark {
        background: rgba(36, 36, 36, 0.6);
        border: rgba(200, 200, 200, 0.1) solid thin;
        box-shadow: 0px 0px 0px rgba(36, 36, 36, 0.1),
            0px 3px 6px rgba(36, 36, 36, 0.3);

        div {
            span {
                &:hover {
                    background: rgba(36, 36, 36, 1);
                }

                p {
                    color: whitesmoke;
                }
            }

            hr {
                border-bottom: rgba(50, 49, 48, 1) solid thin;
            }
        }
    }

    .icon-img {
        width: 15px;
        height: auto;
        user-select: none;
    }
}

.zoom-in-top-enter-active,
.zoom-in-top-leave-active {
    opacity: 1;
    transform: scaleY(1);
    transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1),
        opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
    transform-origin: center top;
}
.zoom-in-top-enter,
.zoom-in-top-leave-active {
    opacity: 0;
    transform: scaleY(0);
}
</style>