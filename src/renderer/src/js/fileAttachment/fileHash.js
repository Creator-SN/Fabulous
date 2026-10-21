export function abortError() {
    const error = new Error('Attachment upload cancelled')
    error.name = 'AbortError'
    return error
}

export function assertActive(signal) {
    if (signal?.aborted) throw abortError()
}

export function hashFile(file, onProgress = () => {}, signal) {
    return new Promise((resolve, reject) => {
        assertActive(signal)
        const worker = new Worker(new URL('./fileHash.worker.js', import.meta.url), { type: 'module' })
        const cleanup = () => {
            worker.terminate()
            signal?.removeEventListener('abort', cancel)
        }
        const cancel = () => {
            cleanup()
            reject(abortError())
        }
        signal?.addEventListener('abort', cancel, { once: true })
        worker.onmessage = ({ data }) => {
            if (signal?.aborted) return
            if (data.progress != null) {
                onProgress(data.progress)
                return
            }
            cleanup()
            if (data.error) reject(new Error(data.error))
            else resolve(data.sha256)
        }
        worker.onerror = () => {
            cleanup()
            reject(new Error('Could not calculate file hash'))
        }
        try {
            worker.postMessage(file)
        } catch (error) {
            cleanup()
            reject(error)
        }
    })
}
