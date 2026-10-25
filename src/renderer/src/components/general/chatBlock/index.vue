<template>
    <section
        class="content-chat-block"
        :class="{ dark: theme === 'dark', expanded: reviewOpen, busy }"
        :style="{
            '--content-agent-offset': `${navigationWidth / 2}px`,
            '--content-agent-navigation-width': `${navigationWidth}px`
        }"
        :aria-label="local('Content polishing assistant')"
    >
        <Transition name="island-review">
            <div v-if="reviewOpen" class="review-panel">
                <header class="review-header">
                    <div class="left-block">
                        <span class="review-eyebrow">{{ local('Review changes') }}</span>
                        <h2>
                            {{
                                result?.mode === 1
                                    ? local('Polish entire document')
                                    : local('Polish selection')
                            }}
                        </h2>
                        <p>{{ result?.summary }}</p>
                    </div>
                    <fv-button
                        :theme="theme"
                        border-radius="8"
                        borderColor="transparent"
                        :font-size="12"
                        style="width: 35px; height: 35px"
                        @click="discardReview"
                        ><i class="ms-Icon ms-Icon--Cancel"></i
                    ></fv-button>
                </header>
                <div class="review-body">
                    <div class="review-document">
                        <power-editor
                            ref="review"
                            :model-value="reviewContent"
                            :extensions="reviewExtensions"
                            :starterKit="{ trailingNode: false }"
                            :theme="theme"
                            :language="language"
                            :editable="false"
                            :showToolBar="false"
                            :showControlOnReadonly="false"
                            :showSave="false"
                            :readOnlyPaddingTop="20"
                            :readOnlyPaddingBottom="20"
                            :mobileDisplayWidth="0"
                            :mentionItemAttr="previewMentionAttr"
                            :editorBackground="'transparent'"
                            :editorOutSideBackground="'transparent'"
                            style="
                                width: 100%;
                                min-height: 220px;
                                height: 100%;
                                transition: height 0.35s ease;
                            "
                            :style="{ background: theme === 'dark' ? '#23262b' : 'white' }"
                            @on-mounted="onReviewMounted"
                        />
                    </div>
                    <aside class="change-sidebar" :aria-label="local('Changes')">
                        <div class="change-toolbar">
                            <span>{{
                                local('{count} pending changes').replace('{count}', changes.length)
                            }}</span>
                            <div v-if="changes.length" class="action-row">
                                <fv-button
                                    theme="dark"
                                    border-radius="6"
                                    :background="color"
                                    @click="resolveAll('accept')"
                                    >{{ local('Accept all') }}</fv-button
                                >
                                <fv-button
                                    theme="dark"
                                    border-radius="6"
                                    :background="'rgba(200, 38, 45, 1)'"
                                    @click="resolveAll('reject')"
                                    >{{ local('Reject all') }}</fv-button
                                >
                            </div>
                        </div>
                        <div v-for="change in changes" :key="change.groupId" class="change-card">
                            <span class="change-label">{{ local(change.label) }}</span>
                            <p v-if="change.delete.length" class="deleted">
                                {{ change.delete.join(' ').slice(0, 300) }}
                            </p>
                            <p v-if="change.insert.length" class="inserted">
                                {{ change.insert.join(' ').slice(0, 300) }}
                            </p>
                            <div class="action-row">
                                <fv-button
                                    theme="dark"
                                    border-radius="6"
                                    :background="color"
                                    @click="resolveChange(change.groupId, 'accept')"
                                    >{{ local('Accept') }}</fv-button
                                >
                                <fv-button
                                    theme="dark"
                                    border-radius="6"
                                    :background="'rgba(200, 38, 45, 1)'"
                                    @click="resolveChange(change.groupId, 'reject')"
                                    >{{ local('Reject') }}</fv-button
                                >
                            </div>
                        </div>
                        <p v-if="!changes.length" class="review-empty">
                            {{
                                local(
                                    'All changes have been reviewed. You can now update the original document.'
                                )
                            }}
                        </p>
                    </aside>
                </div>
                <footer class="review-footer">
                    <span>{{
                        local('The original document remains unchanged during preview')
                    }}</span>
                    <div class="action-row">
                        <fv-button
                            :theme="theme"
                            background="transparent"
                            border-color="#c3afe8"
                            border-radius="28"
                            @click="discardResult"
                            >{{ local('Do not update') }}</fv-button
                        >
                        <fv-button
                            theme="dark"
                            :disabled="changes.length > 0 || !reviewEditor"
                            background="linear-gradient(100deg, #7673d5, #a578bc, #a578bc)"
                            foreground="#ffffff"
                            border-color="#c3afe8"
                            border-radius="28"
                            :reveal-border-color="true"
                            :reveal-border-gradient-list="[
                                '#9563df',
                                '#ad7cde',
                                '#c495dc',
                                '#b8c7fa'
                            ]"
                            :reveal-background-gradient-list="[
                                'rgba(210, 193, 250, 0.38)',
                                'rgba(210, 193, 250, 0.18)',
                                'rgba(143, 97, 231, 0.12)'
                            ]"
                            :is-box-shadow="true"
                            @click="commitReview"
                            >{{ local('Update original') }}</fv-button
                        >
                    </div>
                </footer>
            </div>
        </Transition>

        <div v-if="status || busy" class="agent-status" role="status" aria-live="polite">
            <div class="overall-status" :title="overallStatus">
                <span class="status-dot" :class="{ spinning: busy }"></span>
                <span class="overall-status-text">{{ overallStatus }}</span>
            </div>
            <div ref="agentSteps" class="agent-steps" @keydown.esc.stop="stepsOpen = false">
                <fv-button
                    :theme="theme"
                    border-radius="8"
                    class="step-toggle"
                    role="button"
                    background="transparent"
                    borderColor="transparent"
                    :icon="stepsOpen ? 'ChevronUp' : 'ChevronDown'"
                    tabindex="0"
                    :title="latestStep"
                    :aria-expanded="stepsOpen"
                    :font-size="10"
                    :aria-label="local('Execution steps')"
                    style="width: auto; max-width: 100%"
                    @click="stepsOpen = !stepsOpen"
                    @keydown.enter.prevent="stepsOpen = !stepsOpen"
                    @keydown.space.prevent="stepsOpen = !stepsOpen"
                >
                    <span class="latest-step" :class="{ shimmering: busy }">{{ latestStep }}</span>
                </fv-button>
                <Teleport to="body">
                    <Transition name="step-menu">
                        <div
                            v-if="stepsOpen"
                            ref="stepPopover"
                            class="step-popover content-agent-step-popover"
                            :class="{ dark: theme === 'dark' }"
                            :style="stepPopoverPosition"
                            role="region"
                            :aria-label="local('Step history')"
                        >
                            <header class="step-popover-header">{{ local('Step history') }}</header>
                            <div
                                ref="stepScroll"
                                class="step-popover-content"
                                role="log"
                                :aria-label="local('All execution steps')"
                            >
                                <ol v-if="steps.length">
                                    <li v-for="(step, index) in steps" :key="index">{{ step }}</li>
                                </ol>
                                <p v-for="(item, index) in stepActivity" :key="index">{{ item }}</p>
                            </div>
                        </div>
                    </Transition>
                </Teleport>
            </div>
        </div>

        <div class="composer-block">
            <div
                v-if="quotedSelection"
                class="quoted-selection"
                :class="[{ busy: status || busy }]"
                role="group"
                :aria-label="local('Quoted selection')"
            >
                <i class="ms-Icon ms-Icon--LeftDoubleQuote quote-icon" aria-hidden="true"></i>
                <div :draggable="false" class="quote-content">
                    <span class="quote-label">{{
                        local('Quoted selection · {count} characters').replace(
                            '{count}',
                            quotedSelection.text.length
                        )
                    }}</span>
                    <p :title="quotedSelection.text">{{ quotedSelection.text }}</p>
                </div>
                <fv-button
                    :theme="theme"
                    background="transparent"
                    border-color="transparent"
                    class="quote-remove"
                    :disabled="busy || reviewOpen"
                    :title="local('Remove quote')"
                    border-radius="8"
                    font-size="10"
                    style="width: 20px; height: 20px"
                    @click="clearQuote"
                >
                    <i class="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
                </fv-button>
            </div>
            <div class="content-block">
                <label for="content-polish-prompt" class="sr-only">{{
                    local('Polishing instructions')
                }}</label>
                <textarea
                    ref="promptInput"
                    id="content-polish-prompt"
                    class="content-textarea"
                    v-model="prompt"
                    rows="2"
                    maxlength="8000"
                    :placeholder="
                        local(
                            'Tell me how to polish this, e.g. keep the meaning and make it clearer… (Ctrl+Enter to send)'
                        )
                    "
                    :disabled="busy"
                    @keydown.ctrl.enter.prevent="submit"
                    @keydown.meta.enter.prevent="submit"
                ></textarea>
                <div class="composer-toolbar">
                    <div class="composer-options">
                        <span class="scope-hint">{{ selectionLabel }}</span>
                    </div>
                    <fv-button
                        theme="dark"
                        background="linear-gradient(100deg, #7673d5, #a578bc, #a578bc)"
                        foreground="#ffffff"
                        border-color="#c3afe8"
                        border-radius="28"
                        :reveal-border-color="true"
                        :reveal-border-gradient-list="['#9563df', '#ad7cde', '#c495dc', '#b8c7fa']"
                        :reveal-background-gradient-list="[
                            'rgba(210, 193, 250, 0.38)',
                            'rgba(210, 193, 250, 0.18)',
                            'rgba(143, 97, 231, 0.12)'
                        ]"
                        :is-box-shadow="true"
                        :disabled="!busy && (!prompt.trim() || reviewOpen || !sourceEditor)"
                        :font-size="10"
                        :title="busy ? local('Stop task') : local('Start polishing')"
                        :aria-label="busy ? local('Stop task') : local('Start polishing')"
                        style="width: 30px; height: 30px"
                        @mousedown.prevent
                        @click="busy ? stopTask() : submit()"
                    >
                        <i
                            class="ms-Icon"
                            :class="busy ? 'ms-Icon--StopSolid' : 'ms-Icon--Up'"
                            aria-hidden="true"
                        ></i>
                    </fv-button>
                </div>
            </div>
        </div>
        <p v-if="warnings.length" class="agent-warning" role="status" :title="warnings.map((message) => local(message)).join('\n')">
            {{ local('Some content or formatting was adjusted for this editor. Review the preview before updating.') }}
        </p>
        <p v-if="error" class="agent-error" role="alert">{{ error }}</p>
    </section>
</template>

<script>
import { markRaw } from 'vue'
import { autoUpdate, computePosition, offset, flip, shift, size } from '@floating-ui/dom'
import { mapActions, mapState } from 'pinia'
import { configureDiffTool, applyTrackedGroup } from '@creatorsn/powereditor3'
import { useAppConfig } from '@/stores/appConfig'
import { useTheme } from '@/stores/theme'
import { useDataStore } from '@/stores/data'
import { useContentAgentStore } from '@/stores/editorStore/contentAgent'
import {
    capturePolishSnapshot,
    buildPolishRequest,
    restoreDocument,
    collectReviewChanges,
    reviewTrackingExtension,
    commitPolish
} from '@/js/contentAgent/document'

export default {
    name: 'ContentChatBlock',
    props: {
        editor: { type: Object, default: null },
        extensions: { type: Array, default: () => [] },
        getMarkdown: { type: Function, default: null }
    },
    emits: ['applied'],
    data() {
        return {
            prompt: '',
            busy: false,
            status: '',
            agentStage: '',
            error: '',
            warnings: [],
            steps: [],
            activity: [],
            stepsOpen: false,
            stepPopoverPosition: { left: '0px', top: '0px', visibility: 'hidden' },
            stopStepsPositioning: null,
            quotedSelection: null,
            session: null,
            snapshot: null,
            runId: 0,
            result: null,
            reviewOpen: false,
            reviewEditor: null,
            reviewContent: { type: 'doc', content: [] },
            changes: [],
            previewMentionAttr: {
                mentionList: () => [],
                filterFunc: () => {},
                chooseItemCallback: () => {},
                mentionClickCallback: () => {},
                isLoading: () => false,
                headerForeground: () => '#7764d8',
                placeholder: () => this.local('Mention')
            }
        }
    },
    computed: {
        ...mapState(useTheme, ['theme', 'color']),
        ...mapState(useAppConfig, ['local', 'navigationViewLayout']),
        ...mapState(useDataStore, { language: (state) => state.configState.language }),
        navigationWidth() {
            return this.navigationViewLayout.actualDisplayWidth
        },
        reviewExtensions() {
            return this.sourceEditor
                ? [...this.extensions, markRaw(reviewTrackingExtension(this.sourceEditor))]
                : this.extensions
        },
        selectionLabel() {
            return this.quotedSelection
                ? this.local('Quoted selection · Agent determines the editing scope')
                : this.local('Polish the document · Select text and click Quote')
        },
        overallStatus() {
            if (!this.busy) return this.status
            return (
                {
                    indexed: this.local('Preparing document'),
                    prefetched: this.local('Selection context ready'),
                    planning: this.local('Planning changes'),
                    validating: this.local('Generating review')
                }[this.agentStage] ||
                (this.agentStage ? this.local('Polishing content') : this.local('Preparing task'))
            )
        },
        latestStep() {
            return (
                this.status ||
                this.activity.at(-1) ||
                this.steps.at(-1) ||
                this.local('Execution steps')
            )
        },
        stepActivity() {
            return this.status && this.activity.at(-1) !== this.status
                ? [...this.activity, this.status]
                : this.activity
        },
        sourceEditor() {
            return typeof this.editor?.editor === 'function' ? this.editor.editor() : this.editor
        }
    },
    watch: {
        '$route.fullPath': {
            flush: 'sync',
            handler() {
                this.stopTask()
                this.discardResult()
            }
        },
        stepsOpen(open) {
            this.stopStepsPositioning?.()
            this.stopStepsPositioning = null
            this.stepPopoverPosition = { left: '0px', top: '0px', visibility: 'hidden' }
            if (!open) return
            this.$nextTick(() => {
                const reference = this.$refs.agentSteps
                const panel = this.$refs.stepPopover
                if (!this.stepsOpen || !reference || !panel) return
                this.stopStepsPositioning = autoUpdate(reference, panel, this.updateStepsPosition, {
                    animationFrame: true
                })
                this.scrollStepsToBottom()
            })
        },
        'activity.length'() {
            this.scrollStepsToBottom()
        },
        steps() {
            this.scrollStepsToBottom()
        },
        status(value) {
            if (value && this.activity.at(-1) !== value) this.activity.push(value)
            this.scrollStepsToBottom()
        },
        sourceEditor: {
            immediate: true,
            handler(editor, previous) {
                previous?.off('transaction', this.trackQuote)
                if (previous && previous !== editor) {
                    this.stopTask()
                    this.discardReview()
                    this.clearQuote()
                }
                editor?.on('transaction', this.trackQuote)
            }
        }
    },
    mounted() {
        document.addEventListener('pointerdown', this.closeStepsOutside, true)
        document.addEventListener('keydown', this.closeStepsOnEscape)
    },
    beforeUnmount() {
        document.removeEventListener('pointerdown', this.closeStepsOutside, true)
        document.removeEventListener('keydown', this.closeStepsOnEscape)
        this.stopStepsPositioning?.()
        this.sourceEditor?.off('transaction', this.trackQuote)
        this.stopTask()
        this.releaseSnapshot()
    },
    methods: {
        ...mapActions(useContentAgentStore, ['startContentPolish']),
        closeStepsOutside(event) {
            if (
                this.stepsOpen &&
                !this.$refs.agentSteps?.contains(event.target) &&
                !this.$refs.stepPopover?.contains(event.target)
            )
                this.stepsOpen = false
        },
        closeStepsOnEscape(event) {
            if (event.key === 'Escape' && this.stepsOpen) this.stepsOpen = false
        },
        async updateStepsPosition() {
            const reference = this.$refs.agentSteps
            const panel = this.$refs.stepPopover
            if (!this.stepsOpen || !reference || !panel) return
            const { x, y } = await computePosition(reference, panel, {
                strategy: 'fixed',
                placement: 'top-end',
                middleware: [
                    offset(10),
                    flip({ padding: 12 }),
                    shift({ padding: 12 }),
                    size({
                        padding: 12,
                        apply({ availableHeight, elements }) {
                            elements.floating.style.maxHeight = `min(320px, 45dvh, ${Math.max(0, availableHeight)}px)`
                        }
                    })
                ]
            })
            if (!this.stepsOpen || panel !== this.$refs.stepPopover) return
            this.stepPopoverPosition = { left: `${x}px`, top: `${y}px`, visibility: 'visible' }
        },
        scrollStepsToBottom() {
            if (!this.stepsOpen) return
            this.$nextTick(() => {
                const panel = this.$refs.stepScroll
                if (panel) panel.scrollTop = panel.scrollHeight
            })
        },
        quoteSelection(editor = this.sourceEditor) {
            if (this.busy || this.reviewOpen || !editor || editor !== this.sourceEditor) return
            const { selection, doc } = editor.state
            if (selection.empty) return
            this.quotedSelection = {
                selection: markRaw(selection),
                text: doc.textBetween(selection.from, selection.to, '\n', '\ufffc'),
                originalSlice: JSON.stringify(
                    doc.slice(selection.from, selection.to, true).toJSON()
                ),
                changed: false
            }
            this.error = ''
            this.$nextTick(() => this.$refs.promptInput?.focus())
        },
        clearQuote() {
            this.quotedSelection = null
        },
        trackQuote({ transaction }) {
            const quote = this.quotedSelection
            if (!quote || !transaction.docChanged) return
            quote.selection = markRaw(quote.selection.map(transaction.doc, transaction.mapping))
            const { from, to } = quote.selection
            if (
                quote.selection.empty ||
                JSON.stringify(transaction.doc.slice(from, to, true).toJSON()) !==
                    quote.originalSlice
            ) {
                quote.changed = true
            }
        },
        releaseSnapshot() {
            this.snapshot?.dispose()
            this.snapshot = null
        },
        async submit() {
            if (this.busy || this.reviewOpen || !this.prompt.trim() || !this.sourceEditor) return
            this.error = ''
            this.warnings = []
            this.steps = []
            this.activity = []
            this.stepsOpen = false
            this.agentStage = ''
            this.status = this.local('Preparing selection and document context')
            this.busy = true
            const run = ++this.runId
            try {
                this.releaseSnapshot()
                if (this.quotedSelection?.changed)
                    throw new Error(
                        this.local('The quoted content has changed. Select and quote it again.')
                    )
                this.snapshot = markRaw(
                    capturePolishSnapshot(
                        this.sourceEditor,
                        this.quotedSelection?.selection || null
                    )
                )
                const snapshot = this.snapshot
                this.session = markRaw(
                    this.startContentPolish(
                        buildPolishRequest(snapshot, this.prompt.trim()),
                        (event, data) => {
                            if (run !== this.runId) return
                            if (data.stage) this.agentStage = data.stage
                            if (data.summary) {
                                this.status = data.summary
                                if (this.activity.at(-1) !== data.summary)
                                    this.activity.push(data.summary)
                            }
                            if (event === 'plan') this.steps = data.steps || []
                        },
                        this.local
                    )
                )
                const result = await this.session.promise
                if (run !== this.runId) return
                if (![1, 2].includes(result.mode))
                    throw new Error(this.local('The service returned an invalid replacement mode.'))
                const protectedDoc =
                    result.mode === 1 ? snapshot.fullProtected : snapshot.selectedProtected
                if (!protectedDoc)
                    throw new Error(this.local('No valid selection is available for replacement.'))
                const target = restoreDocument(this.sourceEditor, result.html, protectedDoc, { warnings: this.warnings })
                const source = result.mode === 1 ? snapshot.full : snapshot.selected
                const diff = configureDiffTool({
                    extendContainerDiffBlockTypes: [
                        'pdfNote',
                        'details',
                        'detailsContent',
                        'table',
                        'tableRow',
                        'tableCell',
                        'tableHeader'
                    ],
                    extendInlineDiffBlockTypes: ['detailsSummary']
                }).compareDiff(source, target)
                this.result = result
                this.reviewContent = diff.reviewDoc
                this.changes = collectReviewChanges(diff.reviewDoc)
                this.reviewOpen = true
                this.status = this.local('Polishing complete. Review each change.')
            } catch (error) {
                if (run !== this.runId) return
                this.warnings = []
                this.status = error.cancelled
                    ? this.local('Task stopped')
                    : this.local('Polishing incomplete')
                if (!error.cancelled)
                    this.error =
                        this.local(error.message) ||
                        this.local('Polishing failed. Please try again.')
                this.releaseSnapshot()
            } finally {
                if (run === this.runId) {
                    this.busy = false
                    this.session = null
                }
            }
        },
        async stopTask() {
            const run = ++this.runId
            const session = this.session
            this.session = null
            this.busy = false
            if (session) {
                this.status = this.local('Stopping task')
                this.releaseSnapshot()
                try {
                    await session.cancel()
                    if (this.runId === run) this.status = this.local('Task stopped')
                } catch {
                    if (this.runId === run)
                        this.error = this.local(
                            'Stopped receiving results locally. The server cancellation failed; the task will end at its timeout.'
                        )
                }
            }
        },
        onReviewMounted(editor) {
            this.reviewEditor = markRaw(editor)
        },
        resolveChange(groupId, action) {
            if (!this.reviewEditor) return
            if (!applyTrackedGroup(this.reviewEditor, groupId, action)) {
                this.error = this.local('Unable to resolve this change. Generate a new preview.')
            }
            this.changes = collectReviewChanges(this.reviewEditor.getJSON())
        },
        resolveAll(action) {
            for (const change of [...this.changes]) this.resolveChange(change.groupId, action)
        },
        discardReview() {
            this.warnings = []
            this.reviewOpen = false
            this.reviewEditor = null
            this.result = null
            this.changes = []
            this.releaseSnapshot()
        },
        discardResult() {
            this.discardReview()
            this.reviewContent = { type: 'doc', content: [] }
            this.prompt = ''
            this.clearQuote()
            this.status = ''
            this.agentStage = ''
            this.error = ''
            this.steps = []
            this.activity = []
            this.stepsOpen = false
        },
        commitReview() {
            this.error = ''
            try {
                if (!this.snapshot || !this.reviewEditor || !this.result) return
                const content = this.reviewEditor.getJSON()
                commitPolish(this.snapshot, content, this.result.mode)
                const mode = this.result.mode
                this.discardReview()
                this.clearQuote()
                this.status = this.local(
                    'Review applied to the original document. You can undo it in the editor.'
                )
                this.$emit('applied', { mode })
            } catch (error) {
                this.error = this.local(error.message)
            }
        }
    }
}
</script>

<style lang="scss">
.content-chat-block {
    --chat-bg: rgba(255, 255, 255, 0.6);
    --chat-fg: #27303e;
    --chat-muted: #747d8a;
    --status-start: #d979ad;
    --status-middle: #4b509d;
    --status-end: #8650b5;
    --chat-line: rgba(120, 120, 120, 0.1);
    --step-glass-bg: rgba(248, 249, 255, 0.76);
    --step-hover-bg: rgba(255, 255, 255, 0.8);
    --step-glass-edge: rgba(255, 255, 255, 0.65);
    position: fixed;
    width: min(600px, calc(100vw - var(--content-agent-navigation-width, 0px) - 20px));
    left: calc(50% + var(--content-agent-offset, 0px));
    bottom: 24px;
    font-size: 13px;
    color: var(--chat-fg);
    border: 1px solid var(--chat-line);
    border-radius: 20px;
    background: var(--chat-bg);
    transform: translateX(-50%);
    box-shadow:
        0 8px 40px rgba(32, 42, 64, 0.12),
        0 1px 5px rgba(32, 42, 64, 0.06);
    transition:
        left 0.35s ease,
        width 0.35s ease,
        height 0.35s ease,
        border-radius 0.35s ease;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 5;

    &:focus-within {
        width: min(800px, calc(100vw - var(--content-agent-navigation-width, 0px) - 20px));

        &.expanded {
            width: min(1200px, calc(100vw - var(--content-agent-navigation-width, 0px) - 20px));
            border-radius: 24px;
        }

        .composer-block {
            .content-block {
                padding: 15px;

                textarea.content-textarea {
                    min-height: 52px;
                    height: 52px;
                    font-size: 13.8px;
                }
            }
        }
    }

    &.busy {
        &::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            pointer-events: none;
            box-shadow:
                -8px 0 26px rgba(232, 159, 108, 0.28),
                8px 0 26px rgba(155, 124, 226, 0.3);
            animation: content-agent-edge-glow 3.6s ease-in-out infinite alternate;
        }
        &::after {
            content: '';
            position: absolute;
            inset: -1px;
            padding: 1px;
            filter: blur(2px);
            border-radius: inherit;
            pointer-events: none;
            background: linear-gradient(
                110deg,
                rgba(232, 159, 108, 0.8),
                rgba(232, 159, 108, 0.14) 30%,
                rgba(155, 124, 226, 0.2) 50%,
                rgba(155, 124, 226, 0.8) 75%,
                rgba(232, 159, 108, 0.7)
            );
            background-size: 220% 100%;
            -webkit-mask:
                linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask:
                linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
            mask-composite: exclude;
            animation: content-agent-edge-flow 6s ease-in-out infinite alternate;
        }
    }
    &.expanded {
        width: min(600px, calc(100vw - var(--content-agent-navigation-width, 0px) - 20px));
        border-radius: 24px;
    }
    &.dark {
        --chat-bg: rgba(35, 38, 43, 0.8);
        --chat-fg: #eef0f5;
        --chat-muted: #aab0bf;
        --status-start: #8ad6ec;
        --status-middle: #acb7ff;
        --status-end: #d8a6f4;
        --chat-line: rgba(255, 255, 255, 0.12);
        --step-glass-bg: rgba(35, 38, 47, 0.72);
        --step-hover-bg: rgba(255, 255, 255, 0.09);
        --step-glass-edge: rgba(255, 255, 255, 0.1);
    }

    .composer-block {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;

        .content-block {
            position: relative;
            width: 100%;
            padding: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            transition: padding 0.35s ease;

            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                overflow: hidden;
                clip-path: inset(50%);
            }

            textarea.content-textarea {
                display: block;
                width: 100%;
                min-height: 25px;
                height: 25px;
                max-height: 140px;
                box-sizing: border-box;
                border: 0;
                resize: none;
                outline: none;
                background: transparent;
                color: inherit;
                font: inherit;
                font-size: 12px;
                line-height: 1.6;
                transition:
                    min-height 0.25s ease,
                    height 0.35s ease,
                    font-size 0.35s ease;
                &::placeholder {
                    color: var(--chat-muted);
                }
                &:focus-visible {
                    outline-offset: 2px;
                }
            }

            .composer-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                margin-top: 8px;
            }
        }
    }

    .composer-options {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
    }
    .scope-hint {
        color: var(--chat-muted);
        font-size: 10px;
    }
    .quoted-selection {
        width: auto;
        gap: 5px;
        max-width: 100%;
        margin-bottom: 10px;
        padding: 5px 10px;
        background: rgba(119, 100, 216, 0.06);
        border: 1px solid var(--chat-line);
        border-radius: 20px;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
        display: flex;
        align-items: flex-start;
        box-sizing: border-box;
        overflow: hidden;

        &.busy {
            border-radius: 0px;
        }

        .quote-icon {
            flex-shrink: 0;
            margin-top: 3px;
            color: #8a78dd;
            font-size: 15px;
        }
        .quote-content {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;

            .quote-label {
                color: var(--chat-muted);
                font-size: 10px;
                user-select: none;
            }
            p {
                @include nowrap;

                flex: 1;
                margin: 5px 0 0;
                color: var(--chat-fg);
                font-size: 12px;
                line-height: 1.65;
            }
        }

        .quote-remove {
            flex-shrink: 0;
        }
    }
    .agent-status {
        position: relative;
        gap: 10px;
        padding: 3px 20px;
        border-bottom: 1px solid var(--chat-line);
        color: var(--chat-muted);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
    }
    .status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #8a78dd;
        flex-shrink: 0;
        &.spinning {
            animation: content-agent-pulse 1s ease-in-out infinite alternate;
        }
    }
    .overall-status {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
        .overall-status-text {
            color: var(--status-middle);
            font-size: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            user-select: none;
            @supports ((background-clip: text) or (-webkit-background-clip: text)) {
                background-image: linear-gradient(
                    130deg,
                    var(--status-start),
                    var(--status-middle) 48%,
                    var(--status-end)
                );
                background-clip: text;
                -webkit-background-clip: text;
                color: transparent;
                -webkit-text-fill-color: transparent;
            }
        }
    }
    .agent-steps {
        position: relative;
        flex: 0 1 auto;
        max-width: 55%;
        margin-left: auto;
        min-width: 0;
        display: flex;
        justify-content: flex-end;

        .step-toggle {
            max-width: 100%;
        }
        .latest-step {
            min-width: 0;
            max-width: 100%;
            margin-right: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            @supports ((background-clip: text) or (-webkit-background-clip: text)) {
                &.shimmering {
                    background-image: linear-gradient(
                        110deg,
                        var(--chat-muted) 35%,
                        var(--chat-fg) 48%,
                        var(--chat-fg) 52%,
                        var(--chat-muted) 65%
                    );
                    background-size: 250% 100%;
                    background-clip: text;
                    -webkit-background-clip: text;
                    color: transparent;
                    -webkit-text-fill-color: transparent;
                    animation: content-agent-text-shimmer 2.4s linear infinite;
                }
            }
        }
        .ms-Icon {
            margin-left: 8px;
            font-size: 10px;
            flex-shrink: 0;
        }
    }
    .agent-warning {
        margin: 0;
        padding: 0 20px 14px;
        color: #a66b21;
        line-height: 1.6;
    }
    &.dark .agent-warning {
        color: #e0b46d;
    }
    .agent-error {
        margin: 0;
        padding: 0 20px 14px;
        color: #d44b60;
        line-height: 1.6;
    }
    .review-panel {
        display: flex;
        flex-direction: column;
        max-height: calc(100dvh - 230px);
        overflow: hidden;
    }
    .review-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding: 20px 22px 14px;

        .left-block {
            flex: 1;
            display: flex;
            flex-direction: column;

            h2 {
                margin: 5px 0;
                font-size: 16px;
            }
            p {
                margin: 4px 0 0;
                color: var(--chat-muted);
                line-height: 1.6;
            }
            .review-eyebrow {
                font-size: 10px;
                letter-spacing: 0.14em;
                color: #8a78dd;
                font-weight: 700;
            }
        }
    }
    .review-body {
        width: calc(100% - 10px);
        margin-left: 5px;
        margin-bottom: 5px;
        border: 1px solid var(--chat-line);
        border-radius: 12px;
        display: flex;
        min-height: 0;
        overflow: hidden;

        .review-document {
            flex: 1;
            min-width: 0;
            overflow: auto;
            max-height: 48dvh;
        }
        .change-sidebar {
            flex: 0 0 250px;
            overflow: auto;
            max-height: 48dvh;
            padding: 14px;
            box-sizing: border-box;
            border-left: 1px solid var(--chat-line);
            background: rgba(119, 100, 216, 0.025);
            transition: height 0.35s ease;

            .change-toolbar {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 12px;
                font-weight: 600;
            }
        }
    }

    .action-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
    .change-card {
        padding: 12px;
        gap: 6px;
        margin-bottom: 10px;
        border: 1px solid var(--chat-line);
        border-radius: 12px;
        background: var(--chat-bg);
        display: flex;
        flex-direction: column;

        p {
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            line-height: 1.6;
            font-size: 12px;
        }
        .change-label {
            width: fit-content;
            display: inline-flex;
            align-items: center;
            padding: 3px 10px;
            border-radius: 999px;
            background: rgba(138, 120, 221, 0.12);
            color: #8a78dd;
            font-size: 12px;
            font-weight: 600;
            line-height: 20px;
        }
        .deleted {
            color: #cc5265;
            text-decoration: line-through;
        }
        .inserted {
            color: #299873;
        }
    }
    .review-empty {
        color: var(--chat-muted);
        line-height: 1.8;
    }
    .review-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 20px;
        border-top: 1px solid var(--chat-line);
        color: var(--chat-muted);
    }
    .island-review-enter-active {
        transition:
            max-height 0.4s ease,
            opacity 0.3s ease,
            transform 0.4s ease;
    }
    .island-review-leave-active {
        transition:
            max-height 0.25s ease,
            opacity 0.2s ease;
    }
    .island-review-enter-from {
        max-height: 0;
        opacity: 0;
        transform: translateY(25px);
    }
    .island-review-leave-to {
        max-height: 0;
        opacity: 0;
    }
    @media (max-width: 720px) {
        bottom: 12px;
        width: calc(100vw - var(--content-agent-navigation-width, 0px) - 24px);
        &.expanded {
            width: calc(100vw - var(--content-agent-navigation-width, 0px) - 24px);
        }
        .review-body {
            flex-direction: column;
            overflow: auto;
        }
        .review-document {
            flex: none;
            max-height: 26dvh;
        }
        .change-sidebar {
            flex: none;
            max-height: 22dvh;
            border-left: 0;
            border-top: 1px solid var(--chat-line);
        }
        .scope-hint {
            display: none;
        }
    }
    @media (prefers-reduced-motion: reduce) {
        transition: none;
        &.busy::before {
            animation: none;
            opacity: 0.7;
        }
        &.busy::after {
            animation: none;
            background-position: 50% 0;
        }
        .status-dot {
            animation: none;
        }
        .agent-steps .latest-step.shimmering {
            animation: none;
            background: none;
            color: inherit;
            -webkit-text-fill-color: currentColor;
        }
        .island-review-enter-active {
            transition: none;
        }
        .island-review-leave-active {
            transition: none;
        }
    }
    @media (forced-colors: active) {
        &.busy {
            border-color: Highlight;
            &::before {
                display: none;
            }
            &::after {
                display: none;
            }
        }
        .overall-status-text {
            background: none;
            color: CanvasText;
            -webkit-text-fill-color: CanvasText;
        }
        .agent-steps .latest-step.shimmering {
            animation: none;
            background: none;
            color: ButtonText;
            -webkit-text-fill-color: ButtonText;
        }
    }
}
.content-agent-step-popover {
    --chat-fg: #27303e;
    --chat-muted: #747d8a;
    --chat-line: rgba(30, 45, 70, 0.1);
    --step-glass-bg: rgba(248, 249, 255, 0.76);
    --step-hover-bg: rgba(255, 255, 255, 0.8);
    --step-glass-edge: rgba(255, 255, 255, 0.65);
    &.dark {
        --chat-fg: #eef0f5;
        --chat-muted: #aab0bf;
        --chat-line: rgba(255, 255, 255, 0.12);
        --step-glass-bg: rgba(35, 38, 47, 0.72);
        --step-hover-bg: rgba(255, 255, 255, 0.09);
        --step-glass-edge: rgba(255, 255, 255, 0.1);
    }
    position: fixed;
    top: 0;
    left: 0;
    width: min(420px, calc(100vw - 64px));
    max-height: min(320px, 45dvh);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 10px;
    background: var(--step-glass-bg);
    -webkit-backdrop-filter: blur(20px) saturate(150%);
    backdrop-filter: blur(20px) saturate(150%);
    border: 1px solid var(--chat-line);
    border-radius: 14px;
    box-shadow:
        0 12px 36px rgba(20, 24, 40, 0.14),
        inset 0 1px 0 var(--step-glass-edge);
    z-index: 1000;
    color: var(--chat-muted);
    font-size: 10px;
    line-height: 1.2;
    box-sizing: border-box;
    overflow-wrap: anywhere;
    overscroll-behavior: contain;
    transform-origin: bottom right;

    .step-popover-header {
        flex-shrink: 0;
        padding: 3px 10px 10px;
        margin-bottom: 6px;
        color: var(--chat-fg);
        font-size: 12px;
        font-weight: 600;
    }
    .step-popover-content {
        min-height: 0;
        overflow: auto;
        overscroll-behavior: contain;
    }
    ol {
        margin: 0;
        padding-left: 26px;
        li {
            padding: 7px 10px 7px 6px;
            border-radius: 8px;
            transition: background-color 160ms ease;
            &::marker {
                color: var(--chat-muted);
                font-size: 11px;
            }
            &:hover {
                background-color: var(--step-hover-bg);
            }
        }
    }
    p {
        margin: 4px 0;
        padding: 8px 10px;
        border-radius: 8px;
        transition: background-color 160ms ease;
        &:hover {
            background-color: var(--step-hover-bg);
        }
    }
    @media (prefers-reduced-motion: reduce) {
        li {
            transition: none;
        }
        p {
            transition: none;
        }
    }
}
.content-agent-step-popover.step-menu-enter-active {
    transition:
        opacity 160ms ease,
        transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.content-agent-step-popover.step-menu-leave-active {
    transition:
        opacity 120ms ease,
        transform 120ms ease;
    pointer-events: none;
}
.content-agent-step-popover.step-menu-enter-from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
}
.content-agent-step-popover.step-menu-leave-to {
    opacity: 0;
    transform: translateY(4px) scale(0.98);
}
@media (prefers-reduced-motion: reduce) {
    .content-agent-step-popover.step-menu-enter-active {
        transition: none;
    }
    .content-agent-step-popover.step-menu-leave-active {
        transition: none;
    }
}
@keyframes content-agent-edge-glow {
    from {
        opacity: 0.5;
    }
    to {
        opacity: 0.95;
    }
}
@keyframes content-agent-edge-flow {
    from {
        background-position: 0% 50%;
    }
    to {
        background-position: 100% 50%;
    }
}
@keyframes content-agent-pulse {
    from {
        opacity: 0.35;
    }
    to {
        opacity: 1;
    }
}
@keyframes content-agent-text-shimmer {
    from {
        background-position: 150% 0;
    }
    to {
        background-position: -150% 0;
    }
}
</style>
