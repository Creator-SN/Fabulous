<template>
    <fv-panel
        v-model="thisValue"
        :title="title"
        :theme="theme"
        width="800px"
        :height="height"
        :background="theme === 'dark' ? 'rgba(32, 35, 45, 0.6)' : 'rgba(255, 255, 255, 0.6)'"
        :title-size="15"
        :teleport="teleport"
        :isAcrylic="true"
        :is-central-side="true"
        :is-footer="isFooter"
    >
        <template v-slot:header>
            <slot name="control-header">
                <slot name="header">
                    <p class="panel-title" style="font-size: 15px">{{ title }}</p>
                </slot>
                <i class="control-btn ms-Icon ms-Icon--Cancel" @click="thisValue = !thisValue"></i>
            </slot>
        </template>
        <template v-slot:container>
            <div
                class="float-window-container"
                :class="[{ dark: theme === 'dark' }]"
                @keyup.enter="$emit('confirm')"
            >
                <slot name="content"></slot>
            </div>
        </template>
        <template v-slot:footer>
            <slot name="control" :close="close">
                <fv-button></fv-button>
            </slot>
        </template>
    </fv-panel>
</template>

<script>
export default {
    props: {
        modelValue: {
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
        teleport: {
            default: false
        },
        theme: {
            default: 'light'
        }
    },
    data() {
        return {
            thisValue: this.modelValue
        }
    },
    watch: {
        modelValue(val) {
            this.thisValue = val
        },
        thisValue(val) {
            this.$emit('update:modelValue', val)
        }
    },
    methods: {
        close() {
            this.thisValue = false
        }
    }
}
</script>

<style lang="scss">
.float-window-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 15px;
    color: rgba(28, 30, 41, 1);
    font-family:
        Akkurat Std,
        -apple-system,
        BlinkMacSystemFont,
        Segoe UI,
        Roboto,
        Oxygen,
        Ubuntu,
        Cantarell,
        Helvetica Neue,
        sans-serif;
    font-weight: 400;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.dark {
        p {
            color: rgba(255, 255, 255, 0.8);
        }
    }

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
