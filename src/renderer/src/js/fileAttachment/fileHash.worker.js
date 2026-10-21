import { createSHA256 } from 'hash-wasm'

self.onmessage = async ({ data: file }) => {
    try {
        const hasher = await createSHA256()
        const chunkSize = 4 * 1024 * 1024
        hasher.init()
        for (let offset = 0; offset < file.size; offset += chunkSize) {
            const chunk = await file.slice(offset, offset + chunkSize).arrayBuffer()
            hasher.update(new Uint8Array(chunk))
            self.postMessage({ progress: Math.round(Math.min(offset + chunkSize, file.size) / file.size * 100) })
        }
        self.postMessage({ sha256: hasher.digest('hex') })
    } catch (error) {
        self.postMessage({ error: error.message })
    }
}
