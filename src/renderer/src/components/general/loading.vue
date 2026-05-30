<template>
    <div class="fabulous-loading-container" :class="[{ dark: theme === 'dark' }]">
        <div class="bubble-layer" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
        <slot>
            <p class="title">{{ title }}</p>
        </slot>
    </div>
</template>

<script>
import { mapState } from 'pinia'
import { useTheme } from '@/stores/theme'

export default {
    props: {
        title: {
            default: 'Loading ...'
        }
    },
    computed: {
        ...mapState(useTheme, {
            theme: (state) => state.theme
        })
    }
}
</script>

<style lang="scss">
.fabulous-loading-container {
    @include HcenterVcenter;

    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.3);
    background-size: 260% 260%;
    animation: loading 18s ease-in-out infinite;
    backdrop-filter: blur(20px);

    &::before,
    &::after {
        content: '';
        position: absolute;
        border-radius: 44% 56% 52% 48% / 46% 42% 58% 54%;
        pointer-events: none;
        filter: blur(8px);
        opacity: 0;
    }

    &::before {
        width: 62vmin;
        height: 62vmin;
        left: -22vmin;
        bottom: -28vmin;
        background: radial-gradient(
            circle at 38% 34%,
            rgba(255, 255, 255, 0.78) 0%,
            rgba(233, 208, 255, 0.52) 30%,
            rgba(237, 184, 124, 0.26) 62%,
            rgba(237, 184, 124, 0) 100%
        );
        box-shadow: inset 0 0 42px rgba(255, 255, 255, 0.3);
        animation: bubble-fade 15s ease-in-out infinite;
        filter: blur(8px);
    }

    &::after {
        width: 52vmin;
        height: 52vmin;
        right: -18vmin;
        top: -22vmin;
        background: radial-gradient(
            circle at 62% 58%,
            rgba(255, 255, 255, 0.72) 0%,
            rgba(228, 196, 255, 0.4) 35%,
            rgba(245, 188, 136, 0.2) 68%,
            rgba(245, 188, 136, 0) 100%
        );
        box-shadow: inset 0 0 36px rgba(255, 255, 255, 0.3);
        animation: bubble-fade-2 17s ease-in-out infinite;
        filter: blur(8px);
    }

    .bubble-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        filter: blur(8px);
    }

    .bubble-layer span {
        position: absolute;
        display: block;
        border-radius: 46% 54% 58% 42% / 43% 47% 53% 57%;
        filter: blur(1.4px);
        opacity: 0;
        background: radial-gradient(
            circle at 45% 38%,
            rgba(255, 255, 255, 0.76) 0%,
            rgba(230, 196, 255, 0.34) 44%,
            rgba(241, 181, 124, 0.14) 70%,
            rgba(241, 181, 124, 0) 100%
        );
        box-shadow: inset 0 0 24px rgba(255, 255, 255, 0.24);
        animation: bubble-float 14s ease-in-out infinite;
        filter: blur(8px);
    }

    .bubble-layer span:nth-child(1) {
        width: 22vmin;
        height: 22vmin;
        left: 8%;
        top: 20%;
        animation-delay: -2.5s;
        animation-duration: 13s;
    }

    .bubble-layer span:nth-child(2) {
        width: 18vmin;
        height: 18vmin;
        left: 22%;
        bottom: 10%;
        animation-delay: -7s;
        animation-duration: 16s;
    }

    .bubble-layer span:nth-child(3) {
        width: 20vmin;
        height: 20vmin;
        right: 18%;
        top: 14%;
        animation-delay: -4.2s;
        animation-duration: 15.5s;
    }

    .bubble-layer span:nth-child(4) {
        width: 15vmin;
        height: 15vmin;
        right: 8%;
        bottom: 17%;
        animation-delay: -10.2s;
        animation-duration: 14.5s;
    }

    .bubble-layer span:nth-child(5) {
        width: 12vmin;
        height: 12vmin;
        left: 42%;
        top: 8%;
        animation-delay: -5.4s;
        animation-duration: 12.5s;
    }

    .bubble-layer span:nth-child(6) {
        width: 14vmin;
        height: 14vmin;
        left: 48%;
        bottom: 8%;
        animation-delay: -9.1s;
        animation-duration: 15s;
    }

    &.dark {
        background: rgba(5, 9, 15, 0.85);
        background-size: 180% 180%;
        animation: loading-dark 18s ease-in-out infinite;

        &::before {
            background: radial-gradient(
                circle at 48% 42%,
                rgba(200, 169, 252, 0.28) 0%,
                rgba(200, 169, 252, 0.11) 46%,
                rgba(200, 169, 252, 0) 100%
            );
            box-shadow: inset 0 0 34px rgba(210, 186, 252, 0.22);
        }

        &::after {
            background: radial-gradient(
                circle at 54% 56%,
                rgba(234, 168, 88, 0.26) 0%,
                rgba(234, 168, 88, 0.09) 48%,
                rgba(234, 168, 88, 0) 100%
            );
            box-shadow: inset 0 0 26px rgba(240, 194, 136, 0.18);
        }

        .bubble-layer span {
            background: radial-gradient(
                circle at 45% 38%,
                rgba(255, 255, 255, 0.2) 0%,
                rgba(200, 169, 252, 0.24) 42%,
                rgba(234, 168, 88, 0.16) 72%,
                rgba(234, 168, 88, 0) 100%
            );
            box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.08);
        }

        .title {
            color: whitesmoke;
        }

        .description {
            color: rgba(120, 120, 120, 0.8);
        }
    }

    .title {
        width: 80%;
        font-size: 12px;
        font-weight: bold;
        color: rgba(50, 49, 48, 1);
        text-align: center;
        user-select: none;
    }

    .description {
        width: calc(100% - 10px);
        font-size: 12px;
        color: rgba(120, 120, 120, 0.8);
        text-align: center;
    }

    .central-box {
        position: relative;
        min-width: 100px;
        width: auto;
        gap: 10px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        flex-direction: column;
    }

    @keyframes loading {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    @keyframes loading-dark {
        0% {
            background-position: 0% 28%;
        }

        to {
            background-position: 100% 72%;
        }
    }

    @keyframes bubble-fade {
        0% {
            transform: translate3d(0, 20px, 0) scale(0.94) rotate(-8deg);
            opacity: 0;
            border-radius: 43% 57% 55% 45% / 41% 45% 55% 59%;
        }
        22% {
            opacity: 0.62;
        }
        68% {
            opacity: 0.34;
        }
        100% {
            transform: translate3d(18px, -26px, 0) scale(1.06) rotate(7deg);
            opacity: 0;
            border-radius: 58% 42% 47% 53% / 56% 46% 54% 44%;
        }
    }

    @keyframes bubble-fade-2 {
        0% {
            transform: translate3d(0, -18px, 0) scale(0.9) rotate(10deg);
            opacity: 0;
            border-radius: 56% 44% 49% 51% / 54% 43% 57% 46%;
        }
        18% {
            opacity: 0.5;
        }
        64% {
            opacity: 0.28;
        }
        100% {
            transform: translate3d(-16px, 20px, 0) scale(1.08) rotate(-6deg);
            opacity: 0;
            border-radius: 45% 55% 54% 46% / 48% 56% 44% 52%;
        }
    }

    @keyframes bubble-float {
        0% {
            transform: translate3d(0, 14px, 0) scale(0.88) rotate(-9deg);
            opacity: 0;
            border-radius: 46% 54% 58% 42% / 43% 47% 53% 57%;
        }
        20% {
            opacity: 0.5;
        }
        65% {
            opacity: 0.3;
        }
        100% {
            transform: translate3d(12px, -18px, 0) scale(1.08) rotate(7deg);
            opacity: 0;
            border-radius: 57% 43% 46% 54% / 59% 43% 57% 41%;
        }
    }
}
</style>
