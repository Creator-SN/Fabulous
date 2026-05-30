const FALLBACK_STATE = Object.freeze({
    platform: 'web',
    isMaximized: false
})

function getWindowApi() {
    return globalThis?.api || null
}

export async function getWindowState() {
    const api = getWindowApi()
    if (!api?.getWindowState) {
        return FALLBACK_STATE
    }

    try {
        return await api.getWindowState()
    } catch {
        return FALLBACK_STATE
    }
}

export function minimizeWindow() {
    const api = getWindowApi()
    api?.minimizeWindow?.()
}

export function maximizeWindow() {
    const api = getWindowApi()
    api?.maximizeWindow?.()
}

export function closeWindow() {
    const api = getWindowApi()
    api?.closeWindow?.()
}
