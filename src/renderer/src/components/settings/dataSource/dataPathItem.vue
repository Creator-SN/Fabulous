<template>
    <div class="data-path-item" :class="[{ choosen: choosen }]">
        <div class="left-block">
            <img draggable="false" class="data-path-icon-img" :src="img.dataSource" alt="" />
        </div>
        <div class="middle-block">
            <div class="content-row-block">
                <p class="item-name">{{ thisValue.name }}</p>
            </div>
            <p class="item-path">{{ thisValue.path }}</p>
        </div>
        <div class="right-block">
            <user-avatar
                v-if="thisValue.userId !== info.id"
                v-model="thisValue.userId"
                :show-info="true"
            ></user-avatar>
            <fv-button
                :theme="theme"
                class="control-btn"
                :border-radius="6"
                :is-box-shadow="true"
                :title="local(`Edit this source`)"
                @click="editDS"
            >
                <i class="ms-Icon ms-Icon--Manage" style="color: inherit"></i>
            </fv-button>
            <fv-button
                theme="dark"
                class="control-btn"
                background="rgba(200, 76, 76, 1)"
                :border-radius="6"
                :is-box-shadow="true"
                :title="local(`Unlink this source`)"
                @click="removeDS"
            >
                <i class="ms-Icon ms-Icon--RemoveLink" style="color: whitesmoke"></i>
            </fv-button>
        </div>
    </div>
</template>

<script>
import userAvatar from '@/components/general/userAvatar.vue'

import { useDataStore } from '@/stores/data'
import { useUserStore } from '@/stores/user'
import { mapState, mapActions } from 'pinia'

import dataSource from '@/assets/settings/dataSource.svg'

export default {
    components: {
        userAvatar
    },
    props: {
        modelValue: {
            default: () => ({})
        },
        choosen: {
            default: false
        },
        disabled: {
            default: false
        },
        local: {
            default: () => {}
        },
        theme: {
            default: 'light'
        }
    },
    data() {
        return {
            thisValue: this.modelValue,
            img: {
                dataSource
            }
        }
    },
    watch: {
        modelValue: {
            handler(val) {
                this.thisValue = val
            },
            deep: true
        },
        $route() {}
    },
    computed: {
        ...mapState(useUserStore, ['info'])
    },
    mounted() {},
    methods: {
        ...mapActions(useDataStore, {
            reviseConfig: 'reviseConfig'
        }),
        removeDS(event) {
            event.stopPropagation()
            this.$emit('remove-ds', this.thisValue)
        },
        editDS(event) {
            event.stopPropagation()
            this.$emit('edit-ds', this.thisValue)
        }
    }
}
</script>

<style lang="scss" scoped>
.data-path-item {
    position: relative;
    width: 100%;
    border-radius: 3px;
    display: flex;
    align-items: center;

    &.disabled {
        filter: grayscale(100%);
    }

    &.choosen {
        .middle-block {
            .item-name {
                @include fab-color(
                    linear-gradient(45deg, rgba(142, 148, 225, 1), rgba(215, 121, 188, 1))
                );
            }
        }
    }

    &.missing {
        background: rgba(220, 62, 72, 0.6);
        animation: missing-animate 3s infinite alternate ease-out;

        &.choosen {
            border-color: rgba(220, 62, 72, 0.6);
        }
    }

    @keyframes missing-animate {
        from {
            background: rgba(255, 200, 0, 0);
        }

        to {
            background: rgba(255, 200, 0, 0.3);
        }
    }

    .left-block {
        @include Hcenter;

        width: 30px;
        height: 100%;
    }

    .middle-block {
        @include VcenterC;

        height: 100%;
        flex: 1;
        overflow: hidden;

        .item-name {
            height: 30px;
            margin-left: 15px;
            font-size: 15px;
            font-weight: bold;
            flex: 1;
        }

        .item-path {
            height: 20px;
            margin-left: 15px;
            font-size: 12px;
            opacity: 0.8;
        }

        .content-row-block {
            @include Vcenter;
        }
    }

    .right-block {
        @include HendVcenter;

        min-width: 120px;
        width: auto;
        height: 100%;
    }

    .data-path-icon-img {
        width: 25px;
        height: auto;
    }

    .control-btn {
        width: 35px;
        height: 35px;
        margin-right: 5px;
    }
}
</style>
