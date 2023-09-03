<template>
    <div
        class="data-path-item"
        :class="[{choosen: choosen, missing: scanValue.status === 'missing', disabled: disabled}]"
        @click="switchDataIndex"
    >
        <div class="left-block">
            <img
                v-if="thisValue.path.indexOf('OneDrive') > -1"
                draggable="false"
                class="icon-img"
                :src="img.OneDrive"
                alt=""
            >
            <i
                v-else
                class="ms-Icon"
                :class="[`ms-Icon--${thisValue.local ? 'Link' : 'Cloud'}`]"
            ></i>
        </div>
        <div class="middle-block">
            <div class="content-row-block">
                <fv-progress-ring
                    v-show="scanValue.status === 'ready'"
                    :loading="true"
                    r="10"
                    borderWidth="2"
                ></fv-progress-ring>
                <p class="item-name">{{scanValue.name}}</p>
            </div>
            <p class="item-path">{{thisValue.path}}</p>
        </div>
        <div class="right-block">
            <fv-button
                v-show="scanValue.status === 'missing'"
                :theme="theme"
                class="control-btn"
                background="rgba(255, 200, 0, 1)"
                :is-box-shadow="true"
                :title="local(`Can't find data_structure.json on this source, shall we init new one ?`)"
                @click="showInitDS"
            >
                <i class="ms-Icon ms-Icon--StartPresenting"></i>
            </fv-button>
            <fv-button
                :theme="theme"
                class="control-btn"
                :is-box-shadow="true"
                :title="local(`Unlink this source`)"
                @click="removeDS"
            >
                <i class="ms-Icon ms-Icon--RemoveLink"></i>
            </fv-button>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import OneDrive from '@/assets/settings/OneDrive.svg';

export default {
    props: {
        value: {
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
            thisValue: this.value,
            scanValue: {
                id: null,
                name: null,
                groupLength: 0,
                itemLength: 0,
                createDate: null,
                templatesLength: 0,
                partitionsLength: 0,
                status: 'ready' // ready, missing, normal
            },
            img: {
                OneDrive
            }
        };
    },
    watch: {
        value: {
            handler: function (val) {
                this.thisValue = val;
                this.scanValue.status = 'ready';
                this.scanDS();
            },
            deep: true
        },
        $route() {
            this.scanDS();
        }
    },
    computed: {
        ...mapState({
            data_path: (state) => state.config.data_path
        })
    },
    mounted() {
        this.scanDS();
    },
    methods: {
        ...mapActions({
            reviseConfig: 'reviseConfig'
        }),
        scanDS() {
            if (!this.thisValue.path) return;
            let path = this.thisValue.path;
            if (this.thisValue.local)
                this.$local_api.AcademicController.getDataSourceInfo(path)
                    .then((res) => {
                        if (res.status === 'success') {
                            let data = res.data;
                            this.scanValue.id = data.id;
                            if (!this.scanValue.id) {
                                this.scanValue.status = 'missing';
                                return;
                            }
                            this.scanValue.name = data.name;
                            this.scanValue.groupLength = data.groupLength;
                            this.scanValue.itemLength = data.itemLength;
                            this.scanValue.createDate = data.createDate;
                            this.scanValue.templatesLength =
                                data.templatesLength;
                            this.scanValue.partitionsLength =
                                data.partitionsLength;
                            this.scanValue.status = 'normal';
                        } else this.scanValue.status = 'missing';
                    })
                    .catch(() => {
                        this.scanValue.status = 'missing';
                    });
            else {
                this.scanValue.id = this.thisValue.id;
                this.scanValue.name = this.thisValue.name;
                this.scanValue.groupLength = this.thisValue.groupLength;
                this.scanValue.itemLength = this.thisValue.itemLength;
                this.scanValue.createDate = this.thisValue.createDate;
                this.scanValue.templatesLength = this.thisValue.templatesLength;
                this.scanValue.partitionsLength =
                    this.thisValue.partitionsLength;
                this.scanValue.status = 'normal';
            }
        },
        switchDataIndex() {
            if (this.disabled) return;
            if (this.scanValue.status !== 'normal') return;
            this.reviseConfig({
                data_index: this.thisValue.path
            });
        },
        showInitDS(event) {
            event.stopPropagation();
            this.$emit('show-init-ds', this.thisValue);
        },
        removeDS(event) {
            event.stopPropagation();
            this.$emit('remove-ds', this.thisValue);
        }
    }
};
</script>

<style lang="scss" scoped>
.data-path-item {
    position: relative;
    width: 100%;
    padding-left: 5px;
    border-left: rgba(0, 98, 158, 0) solid 5px;
    border-radius: 3px;
    display: flex;
    align-items: center;

    &.disabled {
        filter: grayscale(100%);
    }

    &.choosen {
        border-color: rgba(0, 98, 158, 0.6);
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

        width: 120px;
        height: 100%;
    }

    .icon-img {
        width: 16px;
        height: auto;
    }

    .control-btn {
        width: 35px;
        height: 35px;
        margin-right: 5px;
    }
}
</style>