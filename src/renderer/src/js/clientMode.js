const CLIENT_MODE = Object.freeze({
    ELECTRON: 'electron',
    WEB: 'web'
})

export function resolveClientMode() {
    const globalProcess = globalThis?.process
    const hasElectronVersion = Boolean(globalProcess?.versions?.electron)
    const isElectronRenderer = globalProcess?.type === 'renderer'
    const userAgent = globalThis?.navigator?.userAgent || ''
    const hasElectronUserAgent = userAgent.includes('Electron')

    if (hasElectronVersion || isElectronRenderer || hasElectronUserAgent) {
        return CLIENT_MODE.ELECTRON
    }

    return CLIENT_MODE.WEB
}

export { CLIENT_MODE }
