import { defineStore } from 'pinia'
import { FileResourceController } from '@/api/remote/api.js'
import axios from 'axios'
import { abortError, assertActive, hashFile } from '@/js/fileAttachment/fileHash'

function responseData(result) {
    if (result?.code !== 200) throw new Error(result?.message || 'File request failed')
    return result.data
}

export const useFileResourcesStore = defineStore('fileResources', {
    actions: {
        async upload(resource, file, onProgress = () => {}, { signal } = {}) {
            const cancelSource = axios.CancelToken.source()
            const cancel = () => cancelSource.cancel('Attachment upload cancelled')
            signal?.addEventListener('abort', cancel, { once: true })
            try {
                assertActive(signal)
                onProgress('hashing', 0)
                const sha256 = await hashFile(file, (percent) => onProgress('hashing', percent), signal)
                assertActive(signal)
                onProgress('checking', 0)
                const metadata = { sha256, size: file.size, name: file.name, contentType: file.type }
                const existing = responseData(await FileResourceController.checkFileResource(
                    resource.type, resource.id, metadata, cancelSource
                ))
                assertActive(signal)
                if (existing) return existing
                onProgress('uploading', 0)
                const result = responseData(await FileResourceController.uploadFileResource(
                    resource.type, resource.id, { file, sha256 }, cancelSource, (event) => {
                        if (!signal?.aborted) onProgress('uploading', event.total ? Math.round(event.loaded / event.total * 100) : 0)
                    }
                ))
                assertActive(signal)
                return result
            } catch (error) {
                if (signal?.aborted || axios.isCancel(error)) throw abortError()
                throw error
            } finally {
                signal?.removeEventListener('abort', cancel)
            }
        },
        async download(resource, fileId, name) {
            let blob
            try {
                blob = await FileResourceController.downloadFileResource(resource.type, resource.id, fileId)
            } catch (error) {
                if (!(error instanceof Blob) || !error.type.includes('application/json')) throw error
                blob = error
            }
            // The API can return JSON permission errors with either HTTP 200 or an error status.
            if (blob.type.includes('application/json')) {
                const result = JSON.parse(await blob.text())
                throw new Error(result.message || 'File download failed')
            }
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = name || 'download'
            document.body.appendChild(anchor)
            anchor.click()
            anchor.remove()
            setTimeout(() => URL.revokeObjectURL(url), 60000)
        }
    }
})
