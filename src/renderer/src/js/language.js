const SUPPORTED_LANGUAGES = new Set(['en', 'cn'])
const CHINA_TIME_ZONES = new Set(['Asia/Shanghai', 'Asia/Urumqi'])

// 用时区和浏览器 locale 的地区代码推断默认语言。
export function detectDefaultLanguage(
    browser = navigator,
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
) {
    const languages = [browser.language, ...(browser.languages || [])]
        .filter(Boolean)
        .map((language) => String(language).replace(/_/g, '-'))
    if (CHINA_TIME_ZONES.has(timeZone)) return 'cn'

    const regions = languages
        .map((language) => language.match(/-([A-Z]{2})(?:-|$)/i)?.[1])
        .filter(Boolean)
        .map((region) => region.toUpperCase())
    if (regions.includes('CN')) return 'cn'
    if (regions.length) return 'en'
    return languages.some((language) => language.toLowerCase().startsWith('zh')) ? 'cn' : 'en'
}

export function isSupportedLanguage(language) {
    return SUPPORTED_LANGUAGES.has(language)
}

export function getInitialLanguage() {
    const storedLanguage = localStorage.getItem('language')
    return isSupportedLanguage(storedLanguage) ? storedLanguage : detectDefaultLanguage()
}

export function saveLanguagePreference(language) {
    if (isSupportedLanguage(language)) localStorage.setItem('language', language)
}

export function updateDocumentLanguage(language) {
    document.documentElement.lang = language === 'cn' ? 'zh-CN' : 'en'
}
