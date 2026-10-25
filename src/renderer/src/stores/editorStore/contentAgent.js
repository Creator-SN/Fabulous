import { defineStore } from 'pinia'
import ax from '@/api/remote/config'

const requestConfig = { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }

export const useContentAgentStore = defineStore('contentAgent', {
    actions: {
        startContentPolish(payload, onEvent, local = (text) => text) {
            let taskId = null
            let source = null
            let stopped = false
            let finish = null
            let watchdog = null
            const cancelled = () => Object.assign(new Error(local('Task stopped')), { cancelled: true })
            const cancelRemote = () => taskId
                ? ax.delete(`/content-agent/tasks/${taskId}`, requestConfig)
                : Promise.resolve()
            const close = () => {
                source?.close()
                source = null
                clearTimeout(watchdog)
            }
            const promise = (async () => {
                const response = await ax.post('/content-agent/tasks', payload, requestConfig)
                const body = response.data
                if (body?.code !== 200) throw new Error(body?.message || local('Unable to create the polishing task.'))
                taskId = body.data.task_id
                if (stopped) {
                    await cancelRemote()
                    throw cancelled()
                }
                return new Promise((resolve, reject) => {
                    finish = (error, result) => {
                        close()
                        finish = null
                        if (error) reject(error)
                        else resolve(result)
                    }
                    const base = (ax.defaults.baseURL || '').replace(/\/$/, '')
                    source = new EventSource(`${base}${body.data.events_path}`)
                    for (const name of ['status', 'plan', 'result', 'error', 'cancelled']) {
                        source.addEventListener(name, (event) => {
                            if (stopped || !finish) return
                            // Native network errors have no data; onerror handles those below.
                            if (typeof event.data !== 'string') return
                            try {
                                const data = JSON.parse(event.data)
                                onEvent?.(name, data)
                                if (name === 'result') finish(null, data)
                                else if (name === 'error') finish(new Error(data.summary || local('Polishing failed.')))
                                else if (name === 'cancelled') finish(cancelled())
                            } catch (error) {
                                finish?.(error)
                                cancelRemote().catch(() => {})
                            }
                        })
                    }
                    source.onerror = (event) => {
                        if (typeof event.data === 'string' || !finish) return
                        finish(new Error(local('The polishing connection was lost. Please try again.')))
                        cancelRemote().catch(() => {})
                    }
                    watchdog = setTimeout(() => {
                        finish?.(new Error(local('Timed out waiting for the polishing result. Please try again.')))
                        cancelRemote().catch(() => {})
                    }, 630000)
                })
            })()
            return {
                promise,
                async cancel() {
                    stopped = true
                    finish?.(cancelled())
                    close()
                    await cancelRemote()
                }
            }
        }
    }
})
