<template>
    <div
        class="power-editor-media-control-resize-block"
        @mousedown="forward($event, -1)"
        @mouseup="stop"
        @touchstart="forward($event.targetTouches[0], -1)"
        @touchend="stop"
    >
        <i></i>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            default: 0.5
        }
    },
    data() {
        return {
            active: false,
            moveable: false,
            disX: 0,
            leftRatio: 0.5,
            saveLeftRatio: 0.5
        };
    },
    watch: {
        value(val) {
            this.leftRatio = val;
        }
    },
    mounted() {
        this.Init();
        if (this.leftRatio < 0.1) this.$emit('only-right');
        else if (this.leftRatio > 0.9) this.$emit('only-left');
    },
    methods: {
        Init() {
            let agent = (event) => {
                return event.clientX - this.disX;
            };
            window.addEventListener('mousemove', (event) => {
                if (this.moveable) {
                    let left =
                        this.saveLeftRatio + agent(event) / window.innerWidth;
                    if (left < 0) left = 0;
                    if (left > 1) left = 1;
                    this.leftRatio = left;
                    this.$emit('change-ratio', this.leftRatio);
                }
            });
            window.addEventListener('touchmove', (event) => {
                event = event.targetTouches[0];
                if (this.moveable) {
                    let left =
                        this.saveLeftRatio + agent(event) / window.innerWidth;
                    if (left < 0) left = 0;
                    if (left > 1) left = 1;
                    this.leftRatio = left;
                    this.$emit('change-ratio', this.leftRatio);
                }
            });
            window.addEventListener('mouseup', (event) => {
                this.active = false;
                if (this.moveable) {
                    this.stop();
                }
                return event;
            });
            window.addEventListener('touchup', (event) => {
                this.active = false;
                if (this.moveable) {
                    this.stop();
                }
                return event;
            });
        },
        forward(event) {
            event.preventDefault();
            this.active = true;
            this.moveable = true;
            this.disX = event.clientX;
            this.saveLeftRatio = this.leftRatio;
        },
        stop() {
            this.active = false;
            this.moveable = false;
            if (this.leftRatio < 0.1) this.$emit('only-right');
            else if (this.leftRatio > 0.9) this.$emit('only-left');
            else this.$emit('save-ratio', this.leftRatio);
            this.$emit('change-ratio', this.leftRatio);
        }
    }
};
</script>

<style lang="scss">
.power-editor-media-control-resize-block {
    position: absolute;
    left: 0px;
    top: 0px;
    min-width: 3px;
    width: 6px;
    max-width: 8px;
    height: 100%;
    display: flex;
    align-items: center;
    cursor: e-resize;
    transition: opacity 1s;
    user-select: none;
    z-index: 2;

    &:hover {
        i {
            background: rgba(140, 148, 228, 0.3);
        }
    }

    &:active {
        i {
            background: rgba(146, 140, 228, 0.3);
        }
    }

    i {
        width: 90%;
        min-height: 10px;
        height: 100%;
        flex-shrink: 0;
        background: rgba(140, 148, 228, 0);
        transition: all 1s;
        z-index: 2;
    }
}
</style>