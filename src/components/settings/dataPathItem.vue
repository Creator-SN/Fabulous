<template>
    <div
        class="data-path-item"
        :class="[{choosen: choosen, missing: scanValue.status === 'missing', disabled: disabled}]"
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
                class="ms-Icon ms-Icon--Link"
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
                @click="$emit('show-init-ds', thisValue)"
            >
                <i class="ms-Icon ms-Icon--StartPresenting"></i>
            </fv-button>
            <fv-button
                :theme="theme"
                class="control-btn"
                :is-box-shadow="true"
                :title="local(`Unlink this source`)"
                @click="$emit('remove-ds', thisValue)"
            >
                <i class="ms-Icon ms-Icon--RemoveLink"></i>
            </fv-button>
        </div>
    </div>
</template>

<script>
import OneDrive from "@/assets/settings/OneDrive.svg";

export default {
    props: {
        value: {
            default: () => ({}),
        },
        choosen: {
            default: false,
        },
        disabled: {
            default: false,
        },
        local: {
            default: () => {},
        },
        theme: {
            default: "light",
        },
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
                status: "ready", // ready, missing, normal
            },
            img: {
                OneDrive,
            },
        };
    },
    watch: {
        value: {
            handler: function (val) {
                this.thisValue = val;
                this.scanValue.status = "ready";
                this.scanDS();
            },
            deep: true,
        },
    },
    mounted() {
        this.scanDS();
    },
    methods: {
        scanDS() {
            if (!this.thisValue.path) return;
            let path = this.thisValue.path;
            let dataDB = this.$DBM.getDataDB(path);
            if (dataDB.has("id").value()) {
                this.scanValue.id = dataDB.get("id").write();
                this.scanValue.name = dataDB.get("name").write();
                this.scanValue.groupLength = dataDB
                    .get("groups")
                    .size()
                    .write();
                this.scanValue.itemLength = dataDB.get("items").size().write();
                this.scanValue.createDate = dataDB.get("createDate").write();
                this.scanValue.templatesLength = dataDB
                    .get("templates")
                    .size()
                    .write();
                this.scanValue.partitionsLength = dataDB
                    .get("partitions")
                    .size()
                    .write();
                this.scanValue.status = "normal";
            } else {
                this.scanValue.status = "missing";
            }
        },
    },
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

        to
        {
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