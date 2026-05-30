let globalProxy = null

export function setProxy(p) {
    globalProxy = p
}

export function getProxy() {
    return globalProxy
}