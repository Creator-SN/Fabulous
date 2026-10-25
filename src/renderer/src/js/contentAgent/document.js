import { generateHTML, getSchema, Extension, Mark } from '@tiptap/core'
import { DOMParser as ProseMirrorDOMParser, Fragment, Schema, Slice } from '@tiptap/pm/model'

const standardNodes = new Set([
    'doc', 'paragraph', 'heading', 'text', 'hardBreak', 'horizontalRule', 'blockquote',
    'codeBlock', 'bulletList', 'orderedList', 'listItem', 'table', 'tableRow', 'tableCell', 'tableHeader'
])
const clone = (value) => JSON.parse(JSON.stringify(value))
const addWarning = (warnings, message) => { if (!warnings.includes(message)) warnings.push(message) }
const styleWarning = 'Some unsupported text styles were skipped.'
function parseFormatPatch(value, warnings) {
    try {
        const patch = JSON.parse(value)
        if (patch && typeof patch === 'object' && !Array.isArray(patch)) return patch
    } catch { /* Ignore malformed presentation metadata and keep editable content. */ }
    addWarning(warnings, styleWarning)
    return {}
}

// 仅供审阅编辑器使用：为缺少跟踪属性的自定义组件补充整体增删记录。
export function reviewTrackingExtension(editor) {
    const types = Object.values(editor.schema.nodes)
        .filter((type) => !standardNodes.has(type.name) && !type.spec.attrs?.trackedChange)
        .map((type) => type.name)
    return Extension.create({
        name: 'contentAgentReviewTracking',
        addGlobalAttributes() {
            return [{ types, attributes: { trackedChange: {
                default: null,
                renderHTML: (attrs) => attrs.trackedChange ? {
                    'data-content-agent-review': attrs.trackedChange.type,
                    class: `tracked-change tracked-change-${attrs.trackedChange.type}`
                } : {}
            } } }]
        }
    })
}

function expectedLockedOrigins(protectedDoc, presentIds) {
    const present = new Set(presentIds)
    // 允许整体删除组件；只校验仍然保留的组件身份及相对顺序，数据属性另行恢复。
    return protectedDoc.locked.filter((id) => present.has(id))
}

// 临时 mark 承载后端明确要求的样式补丁，恢复原 marks 后再应用，避免覆盖用户的新样式要求。
const formatMark = Mark.create({
    name: 'contentAgentFormat',
    addAttributes() {
        return { patch: { default: '{}', parseHTML: (el) => el.getAttribute('data-content-agent-format'),
            renderHTML: (attrs) => ({ 'data-content-agent-format': attrs.patch }) },
            validationId: { default: '', parseHTML: (el) => el.getAttribute('data-content-agent-format-id') || '',
                renderHTML: () => ({}) } }
    },
    parseHTML() { return [{ tag: 'span[data-content-agent-format]' }] },
    renderHTML({ HTMLAttributes }) { return ['span', HTMLAttributes, 0] }
})

// 仅为 HTML 往返建立临时 schema：code 等互斥 mark 也必须允许来源/样式校验标记。
// 原编辑器的 mark 互斥规则不变，真实样式冲突在恢复时按明确请求处理。
function parsingSchema(extensions) {
    const schema = getSchema(extensions)
    const tracking = new Set(['contentAgentTextOrigin', 'contentAgentFormat'])
    let marks = schema.spec.marks
    for (const type of Object.values(schema.marks)) {
        if (tracking.has(type.name) || !type.excluded.some((mark) => tracking.has(mark.name))) continue
        marks = marks.update(type.name, { ...type.spec,
            excludes: type.excluded.filter((mark) => !tracking.has(mark.name)).map((mark) => mark.name).join(' ') })
    }
    return new Schema({ nodes: schema.spec.nodes, marks, topNode: schema.topNodeType.name })
}

// 只合并支持的文字样式；null 保留原值，false 或空颜色移除对应样式。
export function applyTextFormat(editor, marks, patch, warnings = []) {
    const allowed = ['bold', 'italic', 'underline', 'strike', 'code', 'color', 'backgroundColor']
    if (!patch || typeof patch !== 'object' || Array.isArray(patch) || Object.keys(patch).some((key) => !allowed.includes(key))) {
        addWarning(warnings, styleWarning)
        if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return clone(marks || [])
    }
    let result = clone(marks || [])
    const addRequestedMark = (mark) => {
        const requested = editor.schema.marks[mark.type]
        // 明确请求的样式优先于互斥的旧 mark，例如给行内 code 加粗时移除 code。
        result = result.filter((existing) => !requested.excludes(editor.schema.marks[existing.type])
            && !editor.schema.marks[existing.type].excludes(requested))
        result.push(mark)
    }
    for (const [key, value] of Object.entries(patch)) {
        if (!allowed.includes(key)) { addWarning(warnings, styleWarning); continue }
        if (value === null) continue
        const color = key === 'color' || key === 'backgroundColor'
        if (color ? typeof value !== 'string' || (value && !/^(?:#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})|[a-z]{1,30})$/i.test(value)) : typeof value !== 'boolean') {
            addWarning(warnings, styleWarning)
            continue
        }
        const type = key === 'color' ? 'textStyle' : key === 'backgroundColor' ? 'highlight' : key
        if (!editor.schema.marks[type]) { addWarning(warnings, styleWarning); continue }
        const original = result.find((mark) => mark.type === type)
        result = result.filter((mark) => mark.type !== type)
        if (color) {
            const attrs = { ...(original?.attrs || {}) }
            if (value) attrs.color = value
            else delete attrs.color
            if (Object.values(attrs).some((item) => item != null && item !== '')) addRequestedMark({ type, attrs })
        } else if (value) addRequestedMark({ type })
    }
    return result.sort((left, right) => editor.schema.marks[left.type].rank - editor.schema.marks[right.type].rank)
}

// 用临时文字来源 ID 找回原始 marks，保留链接、字体等未明确要求修改的属性。
const textOriginMark = Mark.create({
    name: 'contentAgentTextOrigin',
    inclusive: false,
    addAttributes() {
        return { origin: { default: '',
            parseHTML: (element) => element.getAttribute('data-content-agent-text-origin'),
            renderHTML: (attrs) => ({ 'data-content-agent-text-origin': attrs.origin }) } }
    },
    parseHTML() { return [{ tag: 'span[data-content-agent-text-origin]' }] },
    renderHTML({ HTMLAttributes }) { return ['span', HTMLAttributes, 0] }
})

// 节点来源、保护类型与结构校验标记仅用于 HTML 往返，恢复时从最终 JSON 中移除。
function originExtension(editor) {
    return Extension.create({
        name: 'contentAgentOrigins',
        addGlobalAttributes() {
            return [{ types: Object.keys(editor.schema.nodes).filter((type) => !['doc', 'text'].includes(type)),
                attributes: {
                    contentAgentOrigin: { default: '',
                        parseHTML: (element) => element.getAttribute('data-content-agent-origin') || '',
                        renderHTML: (attrs) => attrs.contentAgentOrigin ? { 'data-content-agent-origin': attrs.contentAgentOrigin } : {} },
                    contentAgentLock: { default: '',
                        parseHTML: (element) => element.getAttribute('data-content-agent-lock') || '',
                        renderHTML: (attrs) => attrs.contentAgentLock ? { 'data-content-agent-lock': attrs.contentAgentLock } : {} },
                    contentAgentStructure: { default: '',
                        parseHTML: (element) => element.getAttribute('data-content-agent-structure') || '',
                        renderHTML: () => ({}) }
                } }]
        }
    })
}

// 保存原始节点与文字样式，并输出带来源标记的 HTML；选区可复用全文的文字来源 ID。
export function protectDocument(editor, doc, sourceTextIds = null) {
    const originals = new Map()
    const textOriginals = new Map()
    const locked = []
    const walk = (node) => {
        if (node.type === 'text') {
            const id = sourceTextIds?.[textOriginals.size] || `text-origin-${textOriginals.size + 1}`
            textOriginals.set(id, { marks: clone(node.marks || []) })
            return { ...node, marks: [...(node.marks || []), { type: 'contentAgentTextOrigin', attrs: { origin: id } }] }
        }
        if (node.type === 'doc') return { ...node, content: (node.content || []).map(walk) }
        const id = `node-origin-${originals.size + 1}`
        const lock = !standardNodes.has(node.type) ? (editor.schema.nodes[node.type]?.isLeaf ? 'atom' : 'container') : ''
        // 原子组件保留完整 JSON；容器只保存类型和 attrs，内部正文继续独立参与修改。
        const original = lock === 'atom' ? clone(node) : { type: node.type, attrs: clone(node.attrs || {}) }
        originals.set(id, { node: original, lock })
        if (lock) locked.push(id)
        // 保护容器的数据属性，不锁定其可编辑正文。
        return { ...node, attrs: { ...(node.attrs || {}), contentAgentOrigin: id, contentAgentLock: lock },
            ...(node.content ? { content: node.content.map(walk) } : {}) }
    }
    const extensions = [...editor.options.extensions, originExtension(editor), textOriginMark, formatMark]
    const html = generateHTML(walk(doc), extensions)
    const dom = new DOMParser().parseFromString(html, 'text/html')
    const allowedTags = new Set([...dom.body.querySelectorAll('*')].map((element) => element.tagName))
    return { html, originals, textOriginals, locked, allowedTags, extensions }
}

// 先检查返回 HTML，再核对 schema 解析前后的结构，最后恢复原始数据属性和文字样式。
export function restoreDocument(editor, html, protectedDoc, { warnings = [] } = {}) {
    if (typeof html !== 'string' || !html.trim()) throw new Error('The polishing result is empty.')
    const dom = new DOMParser().parseFromString(html, 'text/html')
    if (dom.body.querySelector('script,iframe,object,embed,style,link,meta,base,form')) {
        throw new Error('The polishing result contains unsupported HTML.')
    }
    for (const element of dom.body.querySelectorAll('*')) {
        const safeNewTags = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'CODE', 'BR', 'STRONG', 'EM', 'U', 'S', 'SPAN', 'INLINE-EQUATION', 'EQUATION-BLOCK'])
        if (!protectedDoc.allowedTags.has(element.tagName) && !safeNewTags.has(element.tagName)) {
            if (!/^[A-Z][A-Z0-9]*$/.test(element.tagName)) throw new Error('The polishing result contains an unauthorized component.')
            addWarning(warnings, 'Some HTML tags were normalized by the editor.')
        }
        // 只允许新公式提供 LaTeX 和固定 UI 默认值，原有公式继续按 origin 恢复数据。
        if (['INLINE-EQUATION', 'EQUATION-BLOCK'].includes(element.tagName) && !element.hasAttribute('data-content-agent-origin')) {
            const defaults = { tag: element.tagName === 'INLINE-EQUATION' ? 'span' : 'div', placeholder: 'Y=WX^T+b', emptyplaceholder: 'New Equation', showpopper: 'false' }
            const value = element.getAttribute('value')
            if (!value?.trim() || value.length > 6000 || element.childNodes.length
                || Array.from(element.attributes).some((attr) => attr.name !== 'value' && defaults[attr.name] !== attr.value)) {
                throw new Error('The polishing result contains invalid equation attributes.')
            }
        }
        for (const attr of element.attributes) {
            if (/^on/i.test(attr.name) || (/^(href|src|xlink:href)$/i.test(attr.name)
                && /^(javascript:|vbscript:|data:text\/html)/i.test(attr.value.replace(/\s/g, '')))) {
                throw new Error('The polishing result contains an unsupported HTML attribute.')
            }
        }
    }
    const incoming = Array.from(dom.body.querySelectorAll('[data-content-agent-origin]'))
        .map((element) => element.getAttribute('data-content-agent-origin'))
    if (new Set(incoming).size !== incoming.length || incoming.some((id) => !protectedDoc.originals.has(id))) {
        throw new Error('The polishing result duplicated an original node or contains an unknown node ID.')
    }
    const locked = incoming.filter((id) => protectedDoc.originals.get(id).lock)
    if (JSON.stringify(locked) !== JSON.stringify(expectedLockedOrigins(protectedDoc, locked))) throw new Error('The polishing result removed or moved a protected component.')
    // 记录返回 HTML 的父子关系，防止解析器静默丢弃不支持的节点或调整非法嵌套。
    const expectedParents = new Map(Array.from(dom.body.querySelectorAll('[data-content-agent-origin]'))
        .map((element) => [element.getAttribute('data-content-agent-origin'),
            element.parentElement?.closest('[data-content-agent-origin]')?.getAttribute('data-content-agent-origin') || '']))
    const structuralTags = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'BR', 'HR', 'TABLE', 'TR', 'TD', 'TH', 'INLINE-EQUATION', 'EQUATION-BLOCK'])
    const expectedStructure = new Map()
    const expectedEquations = new Map()
    for (const element of dom.body.querySelectorAll('*')) {
        if (element.parentElement?.closest('[data-content-agent-lock="atom"]')) continue
        if (!element.hasAttribute('data-content-agent-origin') && !structuralTags.has(element.tagName)) continue
        const id = `structure-${expectedStructure.size}`
        element.setAttribute('data-content-agent-structure', id)
        expectedStructure.set(id, element.parentElement?.closest('[data-content-agent-structure]')?.getAttribute('data-content-agent-structure') || '')
        if (['INLINE-EQUATION', 'EQUATION-BLOCK'].includes(element.tagName)) {
            expectedEquations.set(id, { type: element.tagName === 'INLINE-EQUATION' ? 'inlineEquation' : 'equationBlock', value: element.getAttribute('value') || '' })
        }
    }
    // 记录样式覆盖文字；编辑器过滤不支持的样式时给出提示，继续生成审阅。
    const expectedFormats = new Map()
    for (const [index, element] of Array.from(dom.body.querySelectorAll('[data-content-agent-format]')).entries()) {
        const id = `format-${index}`
        const ancestors = []
        for (let parent = element; parent; parent = parent.parentElement) {
            if (parent.hasAttribute('data-content-agent-format')) ancestors.unshift(parent)
        }
        const patch = Object.assign({}, ...ancestors.map((parent) => parseFormatPatch(parent.getAttribute('data-content-agent-format'), warnings)))
        element.setAttribute('data-content-agent-format', JSON.stringify(patch))
        element.setAttribute('data-content-agent-format-id', id)
        const walker = dom.createTreeWalker(element, 4)
        let text = ''
        while (walker.nextNode()) {
            if (walker.currentNode.parentElement.closest('[data-content-agent-format]') === element) text += walker.currentNode.nodeValue
        }
        expectedFormats.set(id, text)
    }
    const parsed = ProseMirrorDOMParser.fromSchema(parsingSchema(protectedDoc.extensions))
        .parse(dom.body, { preserveWhitespace: 'full' }).toJSON()
    const actualParents = new Map()
    const actualStructure = new Map()
    const actualFormats = new Map()
    const verify = (node, parentOrigin = '', parentStructure = '') => {
        const origin = node.attrs?.contentAgentOrigin
        if (origin) actualParents.set(origin, parentOrigin)
        const structure = node.attrs?.contentAgentStructure
        if (structure) actualStructure.set(structure, parentStructure)
        const equation = expectedEquations.get(structure)
        if (equation && (node.type !== equation.type || node.attrs?.value !== equation.value)) {
            throw new Error('The editor could not preserve the equation value.')
        }
        const format = node.marks?.find((mark) => mark.type === 'contentAgentFormat')
        if (node.type === 'text' && format) {
            const id = format.attrs.validationId
            actualFormats.set(id, (actualFormats.get(id) || '') + node.text)
        }
        node.content?.forEach((child) => verify(child, origin || parentOrigin, structure || parentStructure))
    }
    verify(parsed)
    if (expectedParents.size !== actualParents.size || [...expectedParents].some(([id, parent]) => actualParents.get(id) !== parent)) {
        throw new Error('The polishing HTML does not match the editor component structure. Nodes were dropped or moved.')
    }
    if (expectedStructure.size !== actualStructure.size || [...expectedStructure].some(([id, parent]) => actualStructure.get(id) !== parent)) {
        addWarning(warnings, 'Some document layout was normalized by the editor.')
    }
    if ([...expectedFormats].some(([id, text]) => (actualFormats.get(id) || '') !== text)) {
        addWarning(warnings, styleWarning)
    }
    return restoreOriginJSON(editor, parsed, protectedDoc, { warnings })
}

// 原有节点从快照恢复 attrs（含 HTML 无法原样表达的对象）；新增节点使用解析后的默认属性。
export function restoreOriginJSON(editor, parsed, protectedDoc, { warnings = [] } = {}) {
    const restored = []
    const restoreMarks = (node, parentType) => {
        const marker = node.marks?.find((mark) => mark.type === 'contentAgentTextOrigin')
        let marks = marker ? protectedDoc.textOriginals.get(marker.attrs.origin)?.marks
            : node.marks?.filter((mark) => !['contentAgentTextOrigin', 'contentAgentFormat'].includes(mark.type))
        if (marker && !protectedDoc.textOriginals.has(marker.attrs.origin)) throw new Error('Unknown text style mapping.')
        const format = node.marks?.find((mark) => mark.type === 'contentAgentFormat')
        if (format) marks = applyTextFormat(editor, marks, parseFormatPatch(format.attrs.patch, warnings), warnings)
        if (marks?.length && parentType) {
            const supported = parentType.allowedMarks(marks.map((mark) => editor.schema.markFromJSON(mark)))
            if (supported.length !== marks.length) addWarning(warnings, styleWarning)
            marks = supported.map((mark) => mark.toJSON())
        }
        const result = { ...node }
        if (marks?.length) result.marks = clone(marks)
        else delete result.marks
        return result
    }
    const walk = (node, parentType = null) => {
        if (node.type === 'text') return restoreMarks(node, parentType)
        const id = node.attrs?.contentAgentOrigin
        const record = id ? protectedDoc.originals.get(id) : null
        if (id && (!record || record.node.type !== node.type)) throw new Error('An original node type was changed.')
        if (record?.lock) restored.push(id)
        // 原子组件只允许整体删除；保留下来时直接恢复原 JSON，不采用其内部渲染数据。
        if (record?.lock === 'atom') return clone(record.node)
        const attrs = record ? clone(record.node.attrs || {}) : { ...(node.attrs || {}) }
        delete attrs.contentAgentOrigin
        delete attrs.contentAgentLock
        delete attrs.contentAgentStructure
        // 原文 span 内新插入的行内公式也会继承临时 mark，必须和文字一起恢复、清理。
        const result = restoreMarks({ ...node, ...(Object.keys(attrs).length ? { attrs } : {}) }, parentType)
        if (!Object.keys(attrs).length) delete result.attrs
        if (node.content) result.content = node.content.map((child) => walk(child, editor.schema.nodes[node.type]))
        return result
    }
    const json = walk(parsed)
    if (JSON.stringify(restored) !== JSON.stringify(expectedLockedOrigins(protectedDoc, restored))) throw new Error('The component structure could not be fully restored.')
    const document = editor.schema.nodeFromJSON(json)
    document.check()
    return document.toJSON()
}

// 固定任务开始时的全文、选区及开放边界，并跟踪编辑期间的事务，供提交时检查并发修改。
export function capturePolishSnapshot(editor, selection = editor.state.selection) {
    const { doc } = editor.state
    const slice = selection && !selection.empty ? selection.content() : null
    if (slice) {
        if (!['text', 'all', 'node'].includes(selection.toJSON().type) || selection.node?.isInline) {
            throw new Error('Select continuous text or complete paragraphs to polish.')
        }
        if (selection.ranges.length !== 1) throw new Error('Select a continuous range. Multiple table cell selections are not supported yet.')
    }
    const full = doc.toJSON()
    const selectedSource = slice ? { type: 'doc', content: slice.content.toJSON() || [] } : null
    const reviewSelection = slice ? normalizeSelectionReview(editor, selectedSource, slice.openStart, slice.openEnd) : null
    const selected = reviewSelection?.doc || null
    const sourceTextIds = []
    let textIndex = 0
    doc.descendants((node, pos) => {
        if (!node.isText) return
        textIndex++
        if (slice && pos < selection.to && pos + node.nodeSize > selection.from) sourceTextIds.push(`text-origin-${textIndex}`)
    })
    const snapshot = {
        editor, full, selected,
        from: selection?.from ?? 0, to: selection?.to ?? 0,
        openStart: slice?.openStart || 0, openEnd: slice?.openEnd || 0,
        reviewWrappers: reviewSelection?.wrappers || [],
        reviewTextblock: reviewSelection?.textblock || null,
        selection: slice ? { selection: selection.toJSON(), content: selectedSource.content,
            openStart: slice.openStart, openEnd: slice.openEnd, nodes: [] } : null,
        originalSlice: slice ? JSON.stringify(doc.slice(selection.from, selection.to, true).toJSON()) : null,
        fullChanged: false,
        fullProtected: protectDocument(editor, full),
        selectedProtected: selected ? protectDocument(editor, selected, sourceTextIds) : null,
        selectionText: slice ? doc.textBetween(selection.from, selection.to, '\n') : ''
    }
    // 原文仍可编辑：全文修改会阻止全文提交；选区位置随事务映射，提交前再核对选区内容。
    snapshot.track = ({ transaction }) => {
        if (!transaction.docChanged) return
        snapshot.fullChanged = true
        if (snapshot.selected) {
            snapshot.from = transaction.mapping.map(snapshot.from, 1)
            snapshot.to = transaction.mapping.map(snapshot.to, -1)
        }
    }
    editor.on('transaction', snapshot.track)
    snapshot.dispose = () => editor.off('transaction', snapshot.track)
    return snapshot
}

// 正文通过 HTML 发送；selection.content 留空以省去重复 JSON，选区文字另附在 selection 中。
export function buildPolishRequest(snapshot, prompt) {
    return {
        prompt,
        selection: snapshot.selection ? { selection: { ...clone(snapshot.selection.selection), text: snapshot.selectionText || '' }, content: [],
            openStart: snapshot.openStart, openEnd: snapshot.openEnd } : null,
        selection_html: snapshot.selectedProtected?.html || '',
        document_html: snapshot.fullProtected.html,
        document_markdown: ''
    }
}

// Details 内部的开放选区可能缺少未选中的标题，无法直接作为完整文档审阅。
// 仅在审阅表示中去掉不完整外壳，保存原包装路径与文字块类型，写回时按原边界恢复。
export function normalizeSelectionReview(editor, source, openStart, openEnd) {
    let doc = clone(source)
    const wrappers = []
    let textblock = null
    for (let depth = 0; depth <= Math.min(openStart, openEnd); depth++) {
        try {
            const node = editor.schema.nodeFromJSON(doc)
            node.check()
            return { doc: node.toJSON(), wrappers, textblock }
        } catch {
            const only = doc.content?.length === 1 ? doc.content[0] : null
            if (!only || !only.content || depth === Math.min(openStart, openEnd)) break
            if (editor.schema.nodes[only.type]?.isTextblock && editor.schema.nodes.paragraph) {
                textblock = { type: only.type, attrs: clone(only.attrs || {}) }
                doc = { type: 'doc', content: [{ type: 'paragraph', content: only.content }] }
            } else {
                const wrapper = { ...only }
                delete wrapper.content
                wrappers.push(wrapper)
                doc = { type: 'doc', content: only.content }
            }
        }
    }
    throw new Error('The selection crosses an incomplete component boundary. Select text in one container or the entire component; clear the quote to polish the whole document.')
}

// 同时收集节点属性和文字 mark 上的变更，按 groupId 合并为侧栏中的同一项审阅操作。
export function collectReviewChanges(doc) {
    const changes = new Map()
    const walk = (node) => {
        const tracked = [node.attrs?.trackedChange, ...(node.marks || [])
            .filter((mark) => mark.type === 'trackedChange').map((mark) => mark.attrs)]
        for (const change of tracked) {
            if (!change?.groupId) continue
            if (!changes.has(change.groupId)) changes.set(change.groupId, {
                groupId: change.groupId, insert: [], delete: []
            })
            const snippet = node.text || node.content?.map((child) => child.text || '').join('') || node.type
            const list = changes.get(change.groupId)[change.type]
            if (list && !list.includes(snippet)) list.push(snippet)
        }
        node.content?.forEach(walk)
    }
    walk(doc)
    return [...changes.values()].map((change) => ({ ...change,
        label: change.insert.length && change.delete.length ? 'Replace' : change.delete.length ? 'Delete' : 'Insert'
    }))
}

// 全部差异处理完后才写回；mode 1 替换全文，mode 2 严格替换原选区。
export function commitPolish(snapshot, reviewed, mode) {
    const editor = snapshot.editor
    if (editor.isDestroyed || !editor.isEditable) throw new Error('The original editor is closed or read-only.')
    if (collectReviewChanges(reviewed).length) throw new Error('Review all pending changes first.')
    const next = editor.schema.nodeFromJSON(reviewed)
    next.check()
    let tr = editor.state.tr
    if (mode === 1) {
        if (snapshot.fullChanged) throw new Error('The document changed during polishing. Run it again to avoid overwriting new content.')
        tr = tr.replaceWith(0, tr.doc.content.size, next.content)
    } else if (mode === 2 && snapshot.selected) {
        const { from, to, openStart, openEnd } = snapshot
        if (from > to || JSON.stringify(tr.doc.slice(from, to, true).toJSON()) !== snapshot.originalSlice) {
            throw new Error('The selected content changed during polishing. Select it again and retry.')
        }
        // 使用严格 Slice 替换，保留两端未选中的内容，避免自动适配时扩大替换范围。
        try {
            let content = clone(reviewed.content || [])
            if (snapshot.reviewTextblock) {
                if (content.length !== 1 || content[0].type !== 'paragraph') throw new Error('Textblock shape changed')
                content[0] = { ...content[0], ...snapshot.reviewTextblock }
            }
            for (const wrapper of [...(snapshot.reviewWrappers || [])].reverse()) {
                content = [{ ...wrapper, content }]
            }
            const fragment = Fragment.fromJSON(editor.schema, content)
            // 结果必须仍能承载原选区的开放深度，防止额外空段落等变化破坏列表或容器边界。
            const maxOpen = Slice.maxOpen(fragment)
            if (openStart > maxOpen.openStart || openEnd > maxOpen.openEnd) throw new Error('Invalid open selection boundary')
            tr = tr.replace(from, to, new Slice(fragment, openStart, openEnd))
        } catch {
            throw new Error('The result changed the selection boundary structure. Select complete paragraphs and retry.')
        }
    } else {
        throw new Error('Invalid replacement scope.')
    }
    tr.doc.check()
    editor.view.dispatch(tr.scrollIntoView())
}
