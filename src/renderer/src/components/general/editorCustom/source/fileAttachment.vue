<template>
    <node-view-wrapper
        class="power-editor-file-attachment"
        :class="{ dark: theme === 'dark', selected, pending, failed }"
        :style="{ '--attachment-foreground': foreground }"
        contenteditable="false"
        :aria-busy="pending"
    >
        <span
            v-if="uploading"
            class="file-progress"
            :style="{ width: `${progress}%` }"
            aria-hidden="true"
        ></span>
        <span class="file-icon">
            <img :src="icon" alt="" draggable="false" />
            <span v-if="pending" class="file-icon-mask" aria-hidden="true">
                <fv-progress-ring
                    :loading="!uploading"
                    :model-value="progress"
                    :r="12"
                    :border-width="3"
                    :color="foreground"
                    background="transparent"
                ></fv-progress-ring>
            </span>
        </span>
        <div class="file-info">
            <span class="file-name" :title="node.attrs.name">{{ node.attrs.name }}</span>
            <span
                v-if="pending"
                class="file-status"
                role="status"
                aria-live="polite"
                :aria-label="statusLabel"
                >{{ statusLabel }}</span
            >
            <span
                v-else-if="failed"
                class="file-error"
                role="alert"
                :title="node.attrs.uploadError"
            >
                {{ local('File upload failed')
                }}<template v-if="node.attrs.uploadError"> · {{ node.attrs.uploadError }}</template>
            </span>
            <span v-else class="file-type">{{ typeLabel }}</span>
        </div>
        <div v-if="pending || failed" class="file-actions">
            <fv-button
                v-if="canRetry"
                :theme="theme"
                :border-radius="20"
                :disabled="!editor.isEditable"
                font-size="12"
                @mousedown.prevent
                @click.stop="retry"
            >
                {{ local('Retry') }}
            </fv-button>
            <fv-button
                :theme="theme"
                :border-radius="20"
                icon="Cancel"
                :disabled="!editor.isEditable"
                font-size="12"
                :title="local('Cancel upload')"
                @mousedown.prevent
                @click.stop="cancel"
            >
                {{ local('Cancel') }}
            </fv-button>
        </div>
        <fv-button
            v-else
            :theme="theme"
            :border-radius="20"
            :disabled="downloading || !node.attrs.fileId"
            class="file-download"
            font-size="12"
            @mousedown.prevent
            @click.stop="download"
        >
            {{ downloading ? local('Downloading...') : local('Download') }}
        </fv-button>
    </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps } from '@creatorsn/powereditor3'
import { mapState } from 'pinia'
import { useAppConfig } from '@/stores/appConfig'
import { useFileResourcesStore } from '@/stores/editorStore/fileResources'
import { fileIcon, fileTypeLabel } from '@/js/fileAttachment/fileIcons'

export default {
    components: { NodeViewWrapper },
    props: nodeViewProps,
    data: () => ({ downloading: false }),
    computed: {
        theme() {
            return this.editor.storage.defaultStorage.theme
        },
        foreground() {
            return this.editor.storage.defaultStorage.foreground
        },
        ...mapState(useAppConfig, ['local']),
        icon() {
            return fileIcon(this.node.attrs.name)
        },
        typeLabel() {
            return fileTypeLabel(this.node.attrs.name)
        },
        pending() {
            return (
                !this.node.attrs.fileId &&
                ['hashing', 'checking', 'uploading'].includes(this.node.attrs.uploadState)
            )
        },
        uploading() {
            return this.pending && this.node.attrs.uploadState === 'uploading'
        },
        failed() {
            return !this.node.attrs.fileId && this.node.attrs.uploadState === 'failed'
        },
        progress() {
            return Math.max(0, Math.min(100, Number(this.node.attrs.uploadProgress) || 0))
        },
        statusLabel() {
            if (this.node.attrs.uploadState === 'checking') return this.local('Checking file...')
            if (this.node.attrs.uploadState === 'uploading' && this.progress === 100)
                return this.local('Finalizing upload...')
            const label =
                this.node.attrs.uploadState === 'uploading'
                    ? 'Uploading file...'
                    : 'Parsing file...'
            return `${this.local(label)} ${this.progress}%`
        },
        canRetry() {
            return (
                this.failed &&
                Boolean(this.editor.storage.fileAttachment?.uploads?.has(this.node.attrs.uploadId))
            )
        }
    },
    methods: {
        cancel() {
            if (!this.editor.isEditable) return
            // NodeView's position follows this exact node even after remote edits or moves.
            const id = this.node.attrs.uploadId
            if (id) this.editor.commands.cancelFileAttachmentUpload(id, this.getPos())
            else this.deleteNode()
        },
        retry() {
            this.editor.commands.retryFileAttachmentUpload(this.node.attrs.uploadId)
        },
        async download() {
            if (this.downloading) return
            this.downloading = true
            try {
                const resolver = this.editor.storage.fileAttachment?.getResource
                const resource = resolver
                    ? resolver()
                    : { type: this.node.attrs.resourceType, id: this.node.attrs.resourceId }
                if (!resource?.type || !resource?.id)
                    throw new Error(this.local('Attachment is unavailable'))
                await useFileResourcesStore().download(
                    resource,
                    this.node.attrs.fileId,
                    this.node.attrs.name
                )
            } catch (error) {
                this.$barWarning(error.message || this.local('File download failed'), {
                    status: 'warning'
                })
            } finally {
                this.downloading = false
            }
        }
    }
}
</script>

<style lang="scss">
.power-editor-file-attachment {
    position: relative;

    min-width: 0;
    height: 60px;
    margin: 12px 0;
    padding: 18px;
    gap: 10px;
    border: 1px solid rgba(120, 120, 120, 0.16);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.7);
    color: #242424;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    overflow: hidden;

    &:hover {
        background: rgba(250, 250, 250, 0.8);
    }

    .file-progress {
        position: absolute;
        inset: 0 auto 0 0;
        background: var(--attachment-foreground);
        opacity: 0.09;
        pointer-events: none;
        transition: width 0.18s ease;
    }

    &.pending .file-icon img {
        opacity: 0.3;
    }
    &.failed {
        border-color: rgba(200, 80, 80, 0.35);
    }

    &.dark {
        background: rgba(255, 255, 255, 0.035);
        color: #f3f3f3;
    }

    &.selected {
        outline: 2px solid var(--attachment-foreground);
    }

    .file-icon {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 35px;
        height: 35px;
        flex-shrink: 0;
        border-radius: 6px;
        background: rgba(120, 120, 120, 0.05);

        img {
            width: 25px;
            height: 25px;
            object-fit: contain;
        }

        .file-icon-mask {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .file-info {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;

        .file-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 12px;
            font-weight: 600;
        }
        .file-type {
            color: #808080;
            font-size: 10px;
        }
        .file-status {
            color: var(--attachment-foreground);
            font-size: 10px;
        }
        .file-error {
            color: #c55858;
            font-size: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .file-download {
        position: relative;
        flex-shrink: 0;
    }

    .file-actions {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
    }

    @media (max-width: 480px) {
        gap: 10px;
        padding: 12px;
        .file-icon {
            width: 40px;
            height: 48px;
            border-radius: 10px;
        }
        .file-info .file-name {
            font-size: 12px;
        }
    }
}
</style>
