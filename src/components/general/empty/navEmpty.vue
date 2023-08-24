<template>
    <div
        class="nav-empty-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <img
            draggable="false"
            class="empty-arrowhead"
            src="@/assets/empty/guide_arrowhead.svg"
            alt=""
        >
        <div class="nec-d1">
            <div class="nec-icon-block">
                <img
                    draggable="false"
                    :src="img.partition"
                    alt=""
                    class="empty-icon-img"
                />
                <img
                    draggable="false"
                    :src="img.group"
                    alt=""
                    class="empty-icon-img"
                />
            </div>
            <p class="nec-content">{{local('No any Content')}}</p>
            <p class="nec-content">{{local('Choose Menu Below to Add New Group & Partition')}}</p>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

import partitionImg from "@/assets/nav/partition.svg";
import groupImg from "@/assets/nav/group.svg";

export default {
    data() {
        return {
            img: {
                partition: partitionImg,
                group: groupImg,
            },
        };
    },
    computed: {
        ...mapState({
            theme: (state) => state.config.theme,
        }),
        ...mapGetters(['local', 'currentDataPath']),
    },
};
</script>

<style lang="scss">
.nav-empty-container {
    @include HcenterVcenter;

    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    user-select: none;
    overflow: hidden;

    &.dark {
        .empty-arrowhead {
            filter: invert(100%);
            opacity: 1;
        }

        .nec-d1 {
            color: whitesmoke;
        }
    }

    .empty-arrowhead {
        position: absolute;
        left: 35px;
        bottom: 5px;
        width: auto;
        height: 45%;
        max-height: 200px;
        opacity: 0.5;
    }

    .nec-d1 {
        @include HcenterVcenterC;

        position: relative;
        margin-bottom: 95px;
        opacity: 0.3;

        .nec-icon-block {
            margin: 5px;
            font-size: 36px;

            i {
                margin: 0px 15px;
            }
        }

        .nec-content {
            font-size: 12px;
        }
    }

    .empty-icon-img {
        width: 45px;
        height: auto;
        margin: 0px 10px;
        user-select: none;
        animation: empty-icon-shake 0.1s infinite linear alternate-reverse;
    }

    @keyframes empty-icon-shake
    {
        0%
        {
            transform: rotate(5deg);
        }

        100%
        {
            transform: rotate(-5deg);
        }
    }
}
</style>