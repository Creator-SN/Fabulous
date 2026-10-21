<template>
    <div class="favorites-page" :class="[{ dark: theme === 'dark' }]">
        <div class="favorites-page-content">
            <section class="favorites-hero">
                <p class="favorites-eyebrow">{{ local('FAVORITES') }}</p>
                <h1 class="favorites-hero-title">{{ local('Keep your favorites close.') }}</h1>
                <p class="favorites-hero-subtitle">
                    {{ local('Collect useful notes and pick up where you left off.') }}
                </p>
                <fv-text-box
                    v-model="searchText"
                    left-icon="Search"
                    :placeholder="local('Search favorite folders or notes')"
                    :borderRadius="12"
                    background="rgba(255, 255, 255, 0.72)"
                    foreground="rgba(165, 157, 175, 1)"
                    border-color="rgba(255, 255, 255, 0.8)"
                    :focus-border-color="'rgba(133, 153, 220, 0.3)'"
                    :reveal-border="true"
                    :reveal-border-color="['rgba(133, 153, 220, 1)']"
                    :reveal-background-color="['rgba(133, 153, 220, 0.1)']"
                    style="width: min(510px, 100%); height: 56px; margin-top: 20px"
                ></fv-text-box>
            </section>
            <section class="favorites-panel">
                <div class="collections-pivot">
                    <fv-pivot
                        :items="pivotItems"
                        :model-value="{ key: currentSection }"
                        :theme="theme"
                        :slider-background="color"
                        :foreground="theme === 'dark' ? '#aaa' : '#777'"
                        :choosen-foreground="color"
                        :font-size="13"
                        background="transparent"
                        @change="switchSection"
                    >
                    </fv-pivot>
                </div>
                <keep-alive include="CollectionRecent,CollectionFavorites,CollectionShared">
                    <component
                        :is="currentComponent"
                        :search-text="searchText"
                        @clear-search="searchText = ''"
                    />
                </keep-alive>
            </section>
            <footer class="favorites-page-footer">
                <span>FAB · {{ local('Make research easier') }}</span>
                <span>{{ local('A space for your notes') }}</span>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useTheme } from '@/stores/theme'
import { useCollectionStore } from '@/stores/collection'
import collectionRecent from './recent/index.vue'
import collectionFavorites from './favorites/index.vue'
import collectionShared from './shared/index.vue'

export default {
    name: 'Collections',
    data() {
        return { searchText: '' }
    },
    computed: {
        ...mapState(useAppConfig, { local: (state) => state.local }),
        ...mapState(useTheme, { theme: (state) => state.theme, color: (state) => state.color }),
        ...mapState(useCollectionStore, { currentSection: 'activeSection' }),
        pivotItems() {
            return [
                { key: 'recent', name: this.local('Recent') },
                { key: 'favorites', name: this.local('Favorites') },
                { key: 'shared', name: this.local('Shared') }
            ]
        },
        currentComponent() {
            return {
                recent: collectionRecent,
                favorites: collectionFavorites,
                shared: collectionShared
            }[this.currentSection] || collectionFavorites
        }
    },
    methods: {
        switchSection(item) {
            useCollectionStore().setActiveSection(item?.key)
        }
    }
}
</script>

<style lang="scss">
.favorites-page {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    color: rgba(48, 43, 61, 1);
    background: rgba(246, 246, 246, 0.7);
    display: flex;
    flex-direction: column;

    &::before {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(ellipse at 28% 34%, rgba(249, 222, 239, 0.5), transparent 35%),
            radial-gradient(ellipse at 76% 58%, rgba(225, 216, 245, 0.34), transparent 43%),
            rgba(248, 247, 253, 1);
        -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 5%, #000 36%);
        mask-image: linear-gradient(to right, transparent 0%, transparent 5%, #000 36%);
        content: '';
    }

    .favorites-page-content {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 0 28px 30px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .favorites-hero {
        gap: 5px;
        padding-top: 64px;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .favorites-eyebrow {
            margin: 0;
            color: rgba(145, 125, 158, 1);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 6px;
        }

        h1.favorites-hero-title {
            margin: 15px 0px;
            background: linear-gradient(95deg, rgba(153, 116, 206, 1), rgba(133, 155, 220, 1));
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            font-size: 30px;
            font-weight: 750;
            line-height: 1.2;
        }

        .favorites-hero-subtitle {
            margin: 0;
            color: rgba(146, 138, 159, 1);
            font-size: 15px;
        }
    }

    .favorites-panel {
        width: 100%;
        max-width: 1280px;
        flex: 1;
        height: 10px;
        margin: 74px auto 0;
        padding: 28px 36px 22px;
        border: 1px solid rgba(255, 255, 255, 0.9);
        border-radius: 30px;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.43);
        box-shadow: 0 22px 78px rgba(98, 73, 132, 0.09);
        backdrop-filter: blur(18px);
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .collections-pivot {
            min-height: 52px;
            border-bottom: 1px solid rgba(148, 133, 165, 0.1);
            display: flex;
            align-items: flex-start;

            .fv-Pivot {
                width: auto;
                min-width: 330px;
            }
        }
    }

    .favorites-page-footer {
        max-width: 1280px;
        margin: 23px auto 0;
        padding: 0 8px;
        display: flex;
        justify-content: space-between;
        color: rgba(179, 165, 189, 1);
        font-size: 11px;
    }

    &.dark {
        color: rgba(241, 237, 246, 1);
        background: rgba(5, 9, 15, 0.85);

        &::before {
            background: radial-gradient(
                    ellipse at 28% 34%,
                    rgba(105, 50, 110, 0.24),
                    transparent 38%
                ),
                rgba(20, 19, 30, 1);
        }

        .favorites-panel {
            border-color: rgba(190, 175, 210, 0.13);
            background: rgba(38, 35, 49, 0.72);
        }
    }

    @media (max-width: 620px) {
        .favorites-page-content {
            padding: 0 14px 22px;
        }

        .favorites-hero {
            padding-top: 34px;
        }

        .favorites-panel {
            margin-top: 42px;
            padding: 20px 16px;
            border-radius: 20px;
        }
    }
}
</style>
