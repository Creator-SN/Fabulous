import type * as apiType from '@/api/remote/api'

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $api: typeof apiType
    }
}

export {}
