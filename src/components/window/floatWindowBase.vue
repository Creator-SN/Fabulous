<template>
    <fv-panel
        v-model="thisValue"
        :title="title"
        :theme="theme"
        width="600px"
        :height="height"
        :background="theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.6)'"
        :title-size="15"
        :isAcrylic="true"
        :is-central-side="true"
        :is-footer="isFooter"
    >
        <template v-slot:header>
            <slot name="header">
                <p
                    class="panel-title"
                    style="font-size: 15px;"
                >{{title}}</p>
            </slot>
            <i
                class="ms-Icon ms-Icon--Cancel"
                @click="thisValue = !thisValue"
            ></i>
        </template>
        <template v-slot:container>
            <div
                class="float-window-container"
                @keyup.enter="$emit('confirm')"
            >
                <slot name="content"></slot>
            </div>
        </template>
        <template v-slot:footer>
            <slot
                name="control"
                :close="close"
            >
                <fv-button></fv-button>
            </slot>
        </template>
    </fv-panel>
</template>

<script>
export default {
    props: {
        value: {
            default: true
        },
        title: {
            default: 'Title'
        },
        height: {
            default: '80%'
        },
        isFooter: {
            default: true
        },
        theme: {
            default: 'light'
        }
    },
    data() {
        return {
            thisValue: this.value
        };
    },
    watch: {
        value(val) {
            this.thisValue = val;
        },
        thisValue(val) {
            this.$emit('input', val);
        }
    },
    methods: {
        close() {
            this.thisValue = false;
        }
    }
};
</script>

<style lang="scss">
.float-window-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 15px;
    color: rgba(28, 30, 41, 1);
    font-family: Akkurat Std, -apple-system, BlinkMacSystemFont, Segoe UI,
        Roboto, Oxygen, Ubuntu, Cantarell, Helvetica Neue, sans-serif;
    font-weight: 400;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .w-title {
        margin: 5px 0px;
        font-size: 13.8px;
        font-weight: bold;
        color: rgba(123, 139, 209, 1);
        user-select: none;
    }

    .w-info {
        margin: 5px 0px;
        font-size: 12px;
        color: rgba(120, 120, 120, 1);
        user-select: none;
    }

    .w-p-block {
        position: relative;
        width: 100%;
        height: auto;
        padding: 15px 0px;
        box-sizing: border-box;
        line-height: 3;
        display: flex;
        flex-direction: column;
    }

    .w-p-row {
        position: relative;
        width: 100%;
        flex-wrap: wrap;
        box-sizing: border-box;
        display: flex;
        align-items: center;
    }

    .p-row {
        @include Vcenter;

        padding: 5px 0px;
        overflow: hidden;

        &.full {
            flex: 1;
        }

        &.auto {
            overflow: auto;
        }
    }

    .p-col {
        @include VcenterC;

        padding: 5px 0px;
        overflow: hidden;

        &.full {
            flex: 1;
        }

        &.auto {
            overflow: auto;
        }
    }
}
</style>