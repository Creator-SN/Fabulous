import onecolor from 'onecolor'
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { useDataStore } from './data'

export const useTheme = defineStore('useTheme', () => {
    const themeColor = ref('rgba(149, 141, 241, 1)')

    function reviseTheme(themeValue) {
        return useDataStore().reviseConfig({ theme: themeValue })
    }

    async function toggleTheme() {
        const dataStore = useDataStore()
        const nextTheme = dataStore.configState.theme === 'light' ? 'dark' : 'light'
        await dataStore.reviseConfig({ theme: nextTheme })
    }

    // 同步useDataStore里的theme
    const theme = computed(() => useDataStore().configState.theme)
    const color = computed(() => themeColor.value)
    const color01 = computed(() => {
        let color = onecolor(themeColor.value)
        color = color.alpha(0.1)
        return color.cssa()
    })
    const gradient = computed(() => {
        let color = onecolor(themeColor.value)
        color = color.alpha(1)
        const from = color.cssa()
        const hsl = color.hsl()
        let h = Math.round(hsl.h() * 360)
        let s = hsl.s()
        let l = hsl.l()
        h = h + 25
        s = (s - 0.1).toFixed(2)
        l = (l - 0.06).toFixed(2)
        const to = `hsla(${h}, ${s * 100}%, ${l * 100}%, 1)`
        return `linear-gradient(to right, ${from}, ${to})`
    })
    const gradient01 = computed(() => {
        let color = onecolor(themeColor.value)
        color = color.alpha(0.1)
        const from = color.cssa()
        const hsl = color.hsl()
        let h = Math.round(hsl.h() * 360)
        let s = hsl.s()
        let l = hsl.l()
        h = h + 25
        s = (s - 0.1).toFixed(2)
        l = (l - 0.06).toFixed(2)
        const to = `hsla(${h}, ${s * 100}%, ${l * 100}%, 0.1)`
        return `linear-gradient(to right, ${from}, ${to})`
    })
    const gray01 = computed(() => {
        let color = onecolor(themeColor.value)
        color = color.alpha(1)
        const hsl = color.hsl()
        const h = hsl.h()
        const s = 0.1
        const l = hsl.l()
        return `hsla(${h}, ${s * 100}%, ${l * 100}%, 1)`
    })

    return {
        reviseTheme,
        toggleTheme,
        theme,
        color,
        color01,
        gradient,
        gradient01,
        gray01
    }
})
