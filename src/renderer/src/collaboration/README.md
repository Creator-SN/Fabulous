# Fab3 协同编辑代码导读

本文对应当前代码：[`session.js`](./session.js)、[`caret.js`](./caret.js)、[`editorBlock.vue`](../components/general/editorContainer/editorBlock.vue)。代码块是**带讲解注释的节选**，注释用于帮助阅读，并未写入原始 JavaScript / Vue 文件。本文描述的是当前实现，不把尚未验证的行为当作保证。

建议按“基本概念 → `session.js` → `caret.js` → `editorBlock.vue` → 完整流程”阅读。下面每段代码前说明它要解决什么，代码后说明它带来的实际行为。

## 先建立一个整体模型

编辑器里的内容同时涉及三种不同的东西，不能把它们都叫作“保存的数据”：

| 东西 | 当前代码里的载体 | 用途 |
| --- | --- | --- |
| 可协同的正文 | `Y.Doc` 中名为 `default` 的 `Y.XmlFragment` | 承载 Tiptap / ProseMirror 正文的协同更改。 |
| 完整笔记快照 | `fabulous_notebook` 对象；其中有 `content`、`title`、`banner` 等 | 给现有笔记格式和后端历史记录使用。正文从 Y.Doc 转成 JSON 后放进 `content`。 |
| 在线状态与光标 | `presenceUsers` 和 Yjs `Awareness` | 前者提供右上角协作者头像，后者提供远端选区、光标颜色和名字。 |

`Y.Doc` 是当前页面的协同文档；`Y.applyUpdate()` 合并其他客户端发来的二进制更新。`Awareness` 是另一个通道，它的状态不属于正文，也不应该被当作历史正文存储。当前代码把 Yjs 的更新和 Awareness 的更新都包装成 JSON 消息，通过同一个 WebSocket 发送；其中的二进制内容先转成 Base64 字符串。

```text
本地输入 ──> Tiptap Collaboration ──> Y.Doc ──> session.js 排队/发送 ──> WebSocket ──> 后端
远端消息 ──> session.js 的 Y.applyUpdate() ──> Y.Doc ──> Tiptap Collaboration ──> 编辑器显示
Y.Doc 正文 ──> JSON 转换 ──> fabulous_notebook 快照 ──> 保存消息/历史所需数据
Awareness ──> caret.js 的 yCursorPlugin ──> 远端光标和选区
presence 消息 ──> collabUsers ──> 右上角头像
```

这里的“快照”是当前笔记内容的普通 JSON 表示；它不等于 Yjs 二进制状态，也不是一次 CRDT 增量。WebSocket 收到或发出 `snapshot`，也不等于浏览器已经收到后端的持久化确认。

## 一、`session.js`：协同会话与消息协议

### 1. 导入、消息来源标记与 Base64 转换

这一段准备 Yjs 能力，定义来源标记，并实现二进制与 JSON 字符串之间的转换。`REMOTE_ORIGIN` 的主要作用是：远端更新被应用到本地 Y.Doc 时，不再把它当成本地输入发回服务器。

```js
import { Y, Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from '@creatorsn/powereditor3/collaboration'
import { markRaw } from 'vue'

const REMOTE_ORIGIN = 'fab-collaboration-remote'
const REMOTE_AWARENESS_ORIGIN = 'fab-collaboration-awareness-remote'

function encode(update) {
    let binary = ''
    update.forEach((byte) => (binary += String.fromCharCode(byte)))
    return btoa(binary) // Uint8Array -> Base64；这样可以放入 JSON 消息
}

function decode(value) {
    const binary = atob(value)
    return Uint8Array.from(binary, (char) => char.charCodeAt(0)) // Base64 -> Uint8Array
}
```

结果是：WebSocket 消息仍是 JSON，但 `update` 字段可以携带 Yjs 的二进制更新。两个 `origin` 只是本地事件标签，用来区分更新来源；它们不是用户 ID，也不是后端权限凭证。`markRaw` 则避免 Vue 对 Y.Doc / Awareness 做深层响应式代理。

### 2. 建立连接地址与会话状态

调用 `createCollaborationSession()` 时，组件传入资源类型、资源 ID、当前用户，以及读取快照和处理消息的回调。这里把当前页面的 HTTP 地址转换为 WebSocket 地址，并创建一个独立的 Y.Doc。

```js
export function createCollaborationSession({
    resourceType, resourceId, user, autoSave, getSnapshot,
    onSnapshot, onUsers, onStatus, onRemoteUpdate, onWritePermission
}) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
    const endpoint = new URL(
        `${apiBase.replace(/\/$/, '')}/collaboration/ws/${resourceType}/${encodeURIComponent(resourceId)}`,
        window.location.origin
    )
    endpoint.protocol = endpoint.protocol === 'https:' ? 'wss:' : 'ws:'
    endpoint.searchParams.set('token', localStorage.getItem('ApiToken') || '')

    const doc = markRaw(new Y.Doc())               // 当前资源在此页面内的协同正文
    const awareness = markRaw(new Awareness(doc))  // 与正文分离的光标/选区状态
    const provider = markRaw({ awareness })        // 提供给 caret.js 的轻量对象
    const queuedUpdates = []                       // 待发送的本地 Yjs 更新
    const inFlightUpdates = new Map()              // 已发送但尚未收到 ack 的更新
    const inFlightSnapshots = new Map()            // 已发送但尚未收到 ack 的快照
    let updateSequence = 0
    let socket = null
    let reconnectTimer = null
    let canWrite = false
    let ready = false
    let disposed = false
    let presenceUsers = []
```

`resourceType` 在组件中会是 `notebook` 或 `page`，所以不同资源有各自的 WebSocket 路径。`ready` 表示收到后端 `sync` 消息，`canWrite` 来自后端给出的写入权限，两者都不能仅凭 WebSocket 已建立来推断。`provider` 不是 `y-websocket` 的 Provider 实例，只是为了让光标插件拿到 `awareness` 的适配对象。

### 3. 本地身份与光标颜色

同一个用户 ID 经简单哈希后，会稳定落到预设颜色之一。用户名和颜色写进本地 Awareness；这一步只设置本地状态，不表示已经把光标发给其他人。

```js
const CURSOR_COLORS = ['#C239B3', '#0078D4', '#498205', '#CA5010', '#5C2D91', '#008272', '#D13438', '#8764B8']

function getCursorColor(userId = '') {
    let hash = 0
    for (const character of userId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
    return CURSOR_COLORS[hash % CURSOR_COLORS.length]
}

awareness.setLocalStateField('user', {
    name: user?.nickname || user?.name || user?.id || 'Collaborator',
    color: getCursorColor(user?.id)
})
```

颜色只有八种，所以两个用户可能同色。用户 ID 影响颜色选择，但这里没有把用户 ID 写入 Awareness 的 `user` 字段；右上角头像使用的是另一路 `presence` 消息。

### 4. 把本地 Yjs 更新排队、发送、等待确认

`Y.Doc` 每发生一次更新，监听器会收到二进制 `update` 和来源 `origin`。本地更新按照连接状态、写权限和自动保存设置决定立即发送还是先留在队列中。发送消息还附带当前完整快照和 state vector。

```js
const createUpdateEntry = (update, submitted = false) => ({
    id: `${doc.clientID.toString(36)}-${++updateSequence}`, // 本会话内用于匹配 ack 的 ID
    update,
    submitted
})

const sendUpdate = (entry, snapshot) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        queuedUpdates.push(entry) // 连接暂不可用，先保留
        return false
    }
    entry.submitted = true
    inFlightUpdates.set(entry.id, entry)
    socket.send(JSON.stringify({
        type: 'update',
        updateId: entry.id,
        update: encode(entry.update),
        snapshot,
        stateVector: encode(Y.encodeStateVector(doc))
    }))
    return true // 仅表示调用了 socket.send，不是后端已确认保存
}

doc.on('update', (update, origin) => {
    if (disposed || origin === REMOTE_ORIGIN) return // 避免远端更新回传形成回声
    const entry = createUpdateEntry(update)
    if (!ready) {
        queuedUpdates.push(entry)
        return
    }
    if (!canWrite) return
    if (!autoSave()) {
        queuedUpdates.push(entry) // 自动保存关闭：本地先积累，手动保存时再发送
        return
    }
    sendUpdate(entry, currentSnapshot()) // 自动保存开启：本地改动会立即尝试发送
})
```

`stateVector` 描述当前 Y.Doc 已见过的更新状态；后端将它与服务端 Pycrdt 文档的状态比较，判断客户端附带的元数据快照是否落后。需要特别分清：`sendUpdate()` 的 `true` 只表示前端调用了 WebSocket 发送；收到 `ack` 才会从 `inFlightUpdates` 移除。当前代码如果 `ready === true` 但 `canWrite === false`，不会保存这条本地更新到队列；编辑器通常会通过 `collabCanWrite` 变只读，但这里本身不提供“权限被拒时暂存全部更改”的保证。

### 5. 重连后的重发与自动保存队列

断线后，之前发出但尚无确认的更新会重新进入队列。重新收到 `sync` 后，代码先重发这些“已提交过”的内容；尚未提交的草稿仅在自动保存开启时发送。

```js
const retrySubmittedUpdates = () => {
    if (!ready || !canWrite || !socket || socket.readyState !== WebSocket.OPEN) return
    const retries = queuedUpdates.filter((entry) => entry.submitted)
    for (const entry of retries) {
        const index = queuedUpdates.indexOf(entry)
        if (index >= 0) queuedUpdates.splice(index, 1)
        sendUpdate(entry, currentSnapshot())
    }
    for (const message of inFlightSnapshots.values()) socket.send(JSON.stringify(message))
}

const flushQueued = () => {
    if (!ready || !canWrite || !autoSave() || !socket || socket.readyState !== WebSocket.OPEN) return
    const snapshot = currentSnapshot()
    const drafts = queuedUpdates.filter((entry) => !entry.submitted)
    for (const entry of drafts) {
        const index = queuedUpdates.indexOf(entry)
        if (index >= 0) queuedUpdates.splice(index, 1)
        sendUpdate(entry, snapshot)
    }
}
```

“草稿”仍已经进入**本地** Y.Doc，因此当前页面能显示它；自动保存关闭时，代码不会主动把这类草稿正文发出去。另一方面，远端更新仍能通过 `Y.applyUpdate()` 进入本地 Y.Doc。自动保存开关控制的是本地更新何时提交，不控制是否接收他人的修改。

### 6. Awareness 与光标发送时机

`Awareness` 用于显示光标与选区，而不是修改正文。自动保存开启时，本地 Awareness 变化会立即发送；自动保存关闭时，只有 `flush()` 提交当前光标。开关从关闭切到开启时，组件的 `autoSave` 监听器会立即公布当前位置。

```js
const sendAwareness = () => {
    if (!ready || !socket || socket.readyState !== WebSocket.OPEN) return
    const state = awareness.getLocalState()
    if (!state) return
    publishedAwarenessState = JSON.parse(JSON.stringify(state)) // 记住上次真正公布的位置
    socket.send(JSON.stringify({
        type: 'awareness',
        update: encode(encodeAwarenessUpdate(awareness, [doc.clientID]))
    }))
}

awareness.on('update', ({ added, updated, removed }, origin) => {
    if (disposed || origin !== 'local' || !autoSave()) return
    if ([...added, ...updated, ...removed].includes(doc.clientID)) sendAwareness()
})

// 收到 sync 或 awareness-sync 时：
if (autoSave()) sendAwareness()           // 实时模式公布当前位置
else refreshPublishedAwareness()          // 手动模式只重发已公布的位置
```

手动模式仍需每 10 秒刷新一次**上次已公布**的状态，因为 Yjs 会在约 30 秒后移除未刷新的远端光标。`refreshPublishedAwareness()` 用当前 Awareness 的递增时钟编码旧位置，不会把未提交的新位置发出。首次保存前没有已公布位置，因此不会发送光标。`caret.js` 负责根据已收到的 Awareness 状态画光标，并不决定发送频率。Awareness 与 `presenceUsers` 也是两套数据：收到了在线头像列表，不代表已经收到了此人的光标状态。

### 7. 接收后端消息：同步、增量、快照、在线人员

所有 WebSocket 文本消息都由 `handleMessage()` 解析。最关键的是首轮 `sync`：它先合并后端给的更新，再标记会话 ready，之后才重发本地待确认内容。普通 `update` 则直接合并进现有 Y.Doc。

```js
const handleMessage = (event) => {
    let message
    try { message = JSON.parse(event.data) } catch { return }

    if (message.type === 'ack') {
        if (message.updateId) inFlightUpdates.delete(message.updateId)
        if (message.snapshotId) inFlightSnapshots.delete(message.snapshotId)
        if (!queuedUpdates.length && !inFlightUpdates.size && !inFlightSnapshots.size)
            onPersisted?.()
    } else if (message.type === 'sync') {
        canWrite = Boolean(message.canWrite)                 // 后端告知的写权限
        if ((message.updates || []).length) onRemoteUpdate?.()
        for (const update of message.updates || [])
            Y.applyUpdate(doc, decode(update), REMOTE_ORIGIN) // 合并初始正文
        ready = true
        if (message.snapshot || message.needsSeed)
            onSnapshot?.(message.snapshot ?? null, { remote: true, needsSeed: message.needsSeed })
        onWritePermission?.(canWrite, Boolean(message.needsSeed))
        onStatus?.('connected')
        retrySubmittedUpdates()
        if (!message.needsSeed) flushQueued()
    } else if (message.type === 'update') {
        onRemoteUpdate?.()
        Y.applyUpdate(doc, decode(message.update), REMOTE_ORIGIN)
        if (message.snapshot) onSnapshot?.(message.snapshot, { remote: true, update: true })
    } else if (message.type === 'snapshot') {
        if (message.snapshot) onSnapshot?.(message.snapshot, { remote: true })
    }
    // 其余分支处理 presence、awareness、snapshot-request。
}
```

`Y.applyUpdate()` 触发的 Y.Doc 更新带 `REMOTE_ORIGIN`，所以不会走上面的本地发送流程。`onRemoteUpdate()` 是给组件的提示，用来防止远端变更触发旧版“本地有未保存内容”的逻辑。后端在写入 MinIO `note_state/` 后发 `ack`；当前端所有待确认消息都清空时，`onPersisted()` 才通知组件考虑清除未保存标记。SQL history 由后端周期任务另行写入。

在线人员的分支维护完整列表、加入与离开事件，随后都通知组件更新头像：

```js
} else if (message.type === 'presence') {
    presenceUsers = message.users || []
    onUsers?.(presenceUsers)
} else if (message.type === 'presence-join') {
    presenceUsers = [...presenceUsers.filter((item) => item.id !== message.user.id), message.user]
    onUsers?.(presenceUsers)
} else if (message.type === 'presence-leave') {
    presenceUsers = presenceUsers.filter((item) => item.id !== message.user.id)
    onUsers?.(presenceUsers)
} else if (message.type === 'snapshot-request') {
    if (ready && canWrite && socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'snapshot',
            snapshot: currentSnapshot(),
            stateVector: encode(Y.encodeStateVector(doc))
        }))
    }
}
```

`presence` 可以理解为“谁在线”，`awareness` 则是“某个 Yjs 客户端当前显示什么光标/选区”。`snapshot-request` 会让有写权限的客户端把它当前计算的完整笔记快照发回去；具体何时请求由后端决定。

### 8. 建立连接、断线处理与重连

连接建立后消息交给 `handleMessage()`。断开时，会把尚未确认的更新放回队列，清空当前在线人员，通知组件只读，并在两秒后重连。

```js
const connect = () => {
    if (disposed) return
    onStatus?.('connecting')
    const currentSocket = new WebSocket(endpoint)
    socket = currentSocket
    currentSocket.addEventListener('message', handleMessage)
    currentSocket.addEventListener('close', () => {
        if (socket !== currentSocket || disposed) return
        ready = false
        canWrite = false
        queuedUpdates.unshift(...inFlightUpdates.values())
        inFlightUpdates.clear()
        onWritePermission?.(false, false)
        presenceUsers = []
        onUsers?.(presenceUsers)
        onStatus?.('disconnected')
        reconnectTimer = setTimeout(connect, 2000)
    })
    currentSocket.addEventListener('error', () => onStatus?.('error'))
}

connect()
```

重连后仍要等待新的 `sync`；WebSocket 打开本身不足以让编辑器恢复写入。待确认更新重发后可能到达后端多次，服务端是否做去重需要看后端协议实现。`destroy()` 会标记 `disposed`，所以主动销毁不会触发这里的重连循环。

### 9. 对组件暴露的方法：初始化正文、手动提交、销毁

组件只能通过返回对象访问 Y.Doc、光标适配对象和几个会话操作。`publishBaseline()` 用来建立初始协同状态；`flush()` 用于明确提交当前排队更新和整份笔记快照。

```js
return {
    doc,
    provider,
    get canWrite() { return canWrite },
    get users() { return presenceUsers },
    get hasPendingUpdates() {
        return queuedUpdates.length > 0 || inFlightUpdates.size > 0 || inFlightSnapshots.size > 0
    },
    publishBaseline(snapshot = currentSnapshot()) {
        if (!ready || !canWrite || !socket || socket.readyState !== WebSocket.OPEN) return false
        const update = Y.encodeStateAsUpdate(doc) // 把当前 Y.Doc 状态编码成一份更新
        queuedUpdates.length = 0
        inFlightUpdates.clear()
        return sendUpdate(createUpdateEntry(update), snapshot)
    },
    flush(snapshot = currentSnapshot()) {
        if (!ready || !canWrite || !socket || socket.readyState !== WebSocket.OPEN) return false
        while (queuedUpdates.length) sendUpdate(queuedUpdates.shift(), snapshot)
        inFlightSnapshots.clear() // 新快照覆盖旧的待确认快照
        const snapshotId = `${doc.clientID.toString(36)}-s-${++updateSequence}`
        const snapshotMessage = {
            type: 'snapshot', snapshotId, snapshot,
            stateVector: encode(Y.encodeStateVector(doc))
        }
        inFlightSnapshots.set(snapshotId, snapshotMessage)
        sendSnapshotMessage(snapshotMessage)
        sendAwareness()
        return true
    },
    destroy() {
        disposed = true
        clearTimeout(reconnectTimer)
        socket?.close()
        awareness.destroy()
        doc.destroy()
    }
}
```

`publishBaseline()` 会清空已有的待发/待确认更新，然后发送当前 Y.Doc 的整体状态；它仅适用于“建立基线”的阶段，不是日常保存方法。`flush()` 先发待提交的正文更新，再发完整快照和本地 Awareness。它返回 `true` 仍只表示本次发送动作已经执行，**不是**收到快照的 `ack`。`hasPendingUpdates` 会把待发和待确认都算进去，供离开页面提示使用。

## 二、`caret.js`：把 Awareness 画成光标

### 1. 为何还需要这个文件

`session.js` 只保存或接收光标状态；Tiptap 还需要 ProseMirror 插件把远端位置画进编辑器。这里通过 PowerEditor 暴露的 `Extension` 和 `yCursorPlugin` 实现，组件稍后会把 `provider.awareness` 传进来。

```js
import { Extension } from '@creatorsn/powereditor3'
import { yCursorPlugin } from '@creatorsn/powereditor3/collaboration'

function normalizeColor(value) {
    // 只允许完整的 #RRGGBB；无效值统一用灰色。
    return /^#[0-9a-fA-F]{6}$/.test(value || '') ? value : '#7A7A7A'
}

function renderCaret(user) {
    const color = normalizeColor(user.color)
    const cursor = document.createElement('span')
    cursor.className = 'fab-collab-cursor'
    cursor.style.borderColor = color

    const label = document.createElement('span')
    label.className = 'fab-collab-cursor-label'
    label.style.backgroundColor = color
    label.textContent = user.name || 'Collaborator'
    cursor.appendChild(label)
    return cursor
}
```

颜色校验避免直接把任意字符串放入 CSS 颜色值；名字通过 `textContent` 写入标签，浏览器会把它当文本显示。这个 DOM 是光标的视觉表示，不是笔记正文里的一个 Tiptap 节点。

### 2. 将光标插件挂到编辑器

组件创建协同会话后会调用 `collaborationCaret.configure({ provider })`。扩展读取里面的 Awareness，构造一个 ProseMirror 插件；没有 Awareness 时不注册插件。

```js
const collaborationCaret = Extension.create({
    name: 'collaborationCaret',
    addOptions() {
        return { provider: null }
    },
    addProseMirrorPlugins() {
        if (!this.options.provider?.awareness) return []
        return [yCursorPlugin(this.options.provider.awareness, {
            cursorBuilder: renderCaret,
            selectionBuilder: (user) => ({
                style: `background-color: ${normalizeColor(user.color)}55`
            })
        })]
    }
})

export default collaborationCaret
```

`cursorBuilder` 负责竖线与名字标签，`selectionBuilder` 负责半透明选区颜色。后缀 `55` 是八位十六进制颜色中的透明度部分。此扩展没有 `socket.send()`，也不主动把光标写到 Y.Doc；发送时机由 `session.js` 控制。

## 三、`editorBlock.vue`：把会话接进现有编辑器

### 1. 头像与 PowerEditor 的关键属性

模板把其他在线用户传给 `collaboratorAvatars.vue` 显示，再根据协同会话决定 PowerEditor 的初始内容、扩展、可编辑状态和撤销系统。头像组件内部在用户列表为空时不渲染容器。

```vue
<collaborator-avatars :users="collabUsers"></collaborator-avatars>

<power-editor
    :key="collabKey"
    :model-value="collabSession ? '' : editorContent.content"
    :starter-kit="collabSession ? { undoRedo: false } : undefined"
    :editable="!readonly && (!collabSession || collabCanWrite)"
    :extensions="customExtensions"
    @save-json="saveConfirm"
    @change="editorContentChange"
/>
```

协同模式下正文应由 Y.Doc 驱动，所以传给 `model-value` 的是空字符串，避免旧的 `editorContent.content` 又被当成编辑器正文灌入。协同模式关闭 StarterKit 自带的 UndoRedo，交给 Collaboration 扩展的撤销命令处理。`:key="collabKey"` 改变时会重新创建编辑器实例，让新的 Y.Doc / 扩展生效。`editable` 同时看页面只读状态和后端给出的协同写权限。

### 2. 状态、资源切换与生命周期

组件保存会话对象、协作者列表、写权限和重建标记。当前资源或资源类型变化时，它会销毁旧会话，重新连接新资源。挂载时启动会话，卸载时释放 WebSocket、Awareness 和 Y.Doc。

```js
data() {
    return {
        customExtensions: [pdfNote],
        collabSession: null,
        collabKey: 0,
        collabUsers: [],
        collabApplyingRemote: false,
        collabStatus: 'disconnected',
        collabCanWrite: false,
        collabRestartPending: false,
        contentLoadRequestId: 0
        // 其余原有状态省略。
    }
},
watch: {
    target() {
        this.toggleUnsave(false)
        this.refreshContent()
        this.restartCollaboration()
    },
    itemType() {
        this.restartCollaboration()
    }
},
mounted() {
    this.visible = true
    this.startCollaboration()
    this.ShortCutInit()
    this.timerInit()
    window.addEventListener('beforeunload', this.warnOnCollabUnload)
},
beforeUnmount() {
    clearInterval(this.timer.autoSave)
    this.collabSession?.destroy()
    window.removeEventListener('beforeunload', this.warnOnCollabUnload)
    window.removeEventListener('keydown', this.shortCutEvent, true)
}
```

`collabStatus` 记录连接状态，但这段组件代码没有直接把它渲染为状态提示。`contentLoadRequestId` 是旧内容异步加载的序号，防止切换资源时较晚返回的旧请求覆盖较新的状态；它不是 Yjs 的版本号。

### 3. 从 Y.Doc 正文生成完整笔记快照

原有 `fabulous_notebook` 并非纯 Tiptap JSON：正文之外还有标题、封面、描述等字段。`collaborationSnapshot()` 先把协同正文转成 ProseMirror JSON，再借旧的 `wrapCotent()` 拼回完整笔记对象。

```js
collaborationSnapshot(content = null) {
    let body = this.collabSession
        ? yXmlFragmentToProsemirrorJSON(this.collabSession.doc.getXmlFragment('default'))
        : content || this.getEditor()?.editor()?.getJSON() || this.editorContent.content
    try {
        return JSON.parse(this.wrapCotent(body, 'fabulous_notebook'))
    } catch {
        return { content: body, title: this.editorContent.title, banner: this.editorContent.banner }
    }
},

wrapCotent(json, contentType = null) {
    // 原函数节选：保留原有笔记外壳的全部字段，替换其中的正文。
    if (contentType === 'fabulous_notebook') {
        let notebook = JSON.parse(JSON.stringify(fabulous_notebook))
        for (let key in this.editorContent) notebook[key] = this.editorContent[key]
        notebook.content = json
        notebook.updateDate = new Date()
        return JSON.stringify(notebook)
    }
    // 原函数还处理 template / md 等类型，此处省略。
}
```

需要留意 `content` 参数：**当前处于协同模式时，函数总是优先读取 Y.Doc，传入的 `content` 不会决定正文**。这是当前代码的实际优先级。标题、封面等字段从 `editorContent` 读取并放入快照；它们不在这个 `default` Y.XmlFragment 中。快照是发给后端的普通 JSON 对象，而旧的 `wrapCotent()` 返回 JSON 字符串，所以这里又 `JSON.parse()` 一次。

### 4. 首次把旧版笔记正文放入 Y.Doc

如果后端说当前协同文档需要建立基线，组件会等 PowerEditor 实例准备好；若快照里的正文是 `type: 'doc'` 的 ProseMirror JSON，且 Y.XmlFragment 仍为空，就把旧正文转换进去，再公布整份 Y.Doc 状态。

```js
seedCollaborationBaseline(attempt = 0, body = null) {
    const editor = this.getEditor()?.editor?.()
    const session = this.collabSession
    if (!editor || !session) {
        if (attempt < 30)
            requestAnimationFrame(() => this.seedCollaborationBaseline(attempt + 1, body))
        return
    }
    if (body?.type === 'doc') {
        const fragment = session.doc.getXmlFragment('default')
        if (fragment.length === 0)
            prosemirrorJSONToYXmlFragment(editor.schema, body, fragment)
    }
    const published = session.publishBaseline(this.collaborationSnapshot())
    this.collabCanWrite = Boolean(published && session.canWrite)
}
```

转换时需要编辑器的 `schema`，因为其中也包含 PDF 笔记等自定义节点的定义。`fragment.length === 0` 是防止已有协同正文再被旧 JSON 覆盖。`requestAnimationFrame` 最多再试 30 帧；如果到时编辑器仍未准备好，这段函数不会继续发布基线。`publishBaseline()` 的返回值只表示已执行发送，并非后端确认。

### 5. 创建会话、解释回调、挂载扩展

协同只在开发模式、远端笔记/页面且有资源 ID 时启动。先建 `session.js` 的会话，再把该会话的 Y.Doc 和 Awareness 分别交给正文协同扩展与光标扩展。

```js
startCollaboration() {
    if (!import.meta.env.DEV || !this.isRemote || !this.target?.id ||
        !['notebook', 'item'].includes(this.itemType)) return

    const resourceType = this.itemType === 'notebook' ? 'notebook' : 'page'
    this.collabSession = createCollaborationSession({
        resourceType,
        resourceId: this.target.id,
        user: this.info,
        autoSave: () => this.autoSave,
        getSnapshot: () => this.collaborationSnapshot(),
        onUsers: (users) => {
            this.collabUsers = users.filter((user) => user.id !== this.info.id)
        },
        onStatus: (status) => { this.collabStatus = status },
        onWritePermission: (canWrite, needsSeed) => {
            this.collabCanWrite = canWrite && !needsSeed
        },
        onRemoteUpdate: () => {
            this.collabApplyingRemote = true
            this.$nextTick(() => { this.collabApplyingRemote = false })
        },
        onSnapshot: (snapshot, meta = {}) => {
            // 具体解析见下段。
        }
    })
    this.customExtensions = [
        pdfNote,
        Collaboration.configure({ document: this.collabSession.doc }),
        collaborationCaret.configure({ provider: this.collabSession.provider })
    ]
    this.collabKey += 1
}
```

`Collaboration.configure({ document })` 把编辑器正文绑定到 Y.Doc，`collaborationCaret.configure({ provider })` 把 Awareness 绑定到视觉光标。PDF 自定义扩展继续保留，协同正文才能识别该节点。`getSnapshot` 是一个**函数**，每次需要发送快照时才读取最新正文和元数据。`onWritePermission` 如果提示要先建立基线，会暂时保持只读；建基线完成后才恢复写入。

`onSnapshot` 的完整处理还有两个职责：更新标题、封面等元数据；必要时提取旧正文并启动基线转换。

```js
onSnapshot: (snapshot, meta = {}) => {
    if (snapshot == null) {
        if (meta.needsSeed) this.$nextTick(() => this.seedCollaborationBaseline())
        return
    }
    if (typeof snapshot === 'string') {
        try { snapshot = JSON.parse(snapshot) } catch { return }
    }
    if (!snapshot || typeof snapshot !== 'object') return

    if (snapshot.fabulous_notebook || 'title' in snapshot || 'banner' in snapshot) {
        this.reviseEditorContent({
            id: this.editorId,
            title: snapshot.title,
            banner: snapshot.banner,
            description: snapshot.description
        })
    }
    const body = snapshot.fabulous_notebook ? snapshot.content : snapshot
    if (meta.needsSeed) {
        this.$nextTick(() =>
            this.seedCollaborationBaseline(0, body?.type === 'doc' ? body : null))
    }
}
```

收到普通远端快照时，这里主要更新元数据；正文一般通过 `Y.applyUpdate()` 和 Collaboration 扩展同步。只有 `needsSeed` 分支才尝试把快照正文写入 Y.Doc。这解释了为什么 `snapshot` 与 Yjs `update` 必须分清。

如果后端返回 `needsSeed: true` 但没有旧快照，`session.js` 也会以 `snapshot == null` 调用这里的回调，组件会建立一个空正文的协同基线。若存在旧快照，则先把旧正文转换进 Y.Doc，再公布基线。

### 6. 自动保存、手动保存与 Ctrl+Z

旧版非协同编辑仍走 `editor.save()` / `saveConfirmTool()`。有协同会话时，定时保存、Ctrl+S 和 PowerEditor 的 `save-json` 事件都改为调用 `flush()`。Ctrl+Z / Ctrl+Y 由当前编辑器命令执行。

```js
// timerInit() 中，每 3000 毫秒检查一次：
if (this.visible && this.autoSave && this.unsave && !this.show.diff) {
    if (this.collabSession) {
        if (!this.collabSession.hasPendingUpdates) this.flushCollaboration()
        return
    }
    editor.save() // 没有协同会话时保留旧逻辑
}

// shortCutEvent() 中：监听器以捕获阶段注册。
if (this.collabSession && ctrl && !event.altKey &&
    (event.target?.closest?.('.ProseMirror') || document.activeElement?.closest?.('.ProseMirror'))) {
    const isUndo = event.keyCode === 90 && !event.shiftKey
    const isRedo = event.keyCode === 89 || (event.keyCode === 90 && event.shiftKey)
    if (isUndo || isRedo) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const editor = this.getEditor()?.editor?.()
        if (isUndo) editor?.commands.undo()
        else editor?.commands.redo()
        return
    }
}

// saveConfirm() 开头：
if (this.collabSession) {
    if (!this.flushCollaboration(this.collaborationSnapshot(json)))
        this.$barWarning(this.local('Collaboration is not connected. Changes are still waiting to sync.'), { status: 'warning' })
    this.lock.save = true
    return // 不再调用旧版 saveConfirmTool()
}
```

自动保存开启时，`session.js` 对每次本地 Y.Doc 更新也会立即尝试发送，光标也会随 Awareness 更新发送；这里的三秒定时器在没有待确认消息且页面有改动时再提交一份完整快照。自动保存关闭时，本地正文更新会留在队列，光标停留在上次公布的位置，直到手动保存调用 `flush()`。协同模式的未保存标记比较当前完整笔记与最近一次已保存的正文、标题、封面等内容；因此输入一个字符后再删掉，内容回到基准时小绿点会消失，即使 Yjs 的插入和删除增量还在本地队列。队列仍保留，保证后续继续编辑时可按顺序提交；关闭自动保存且内容已回到基准时，不会仅因这些未提交的增量触发离开提示。`flush()` 后记录当前编辑修订号，等所有更新和快照都收到后端 `ack`，且期间没有新编辑，才把当前内容设为新的已保存基准并调用 `toggleUnsave(false)`。Ctrl+Z 调用编辑器命令；具体撤销栈由 Collaboration 扩展管理，这段组件逻辑只是拦截快捷键并分发命令。

### 7. 远端更新、资源切换与离开提醒

远端正文应用时，组件暂时跳过旧版内容差异计算，避免把别人的更新记成自己的待保存改动。切换资源会销毁旧会话；关闭页面前，如果还有待发/待确认消息，浏览器会尝试给出离开提醒。

```js
editorContentChange() {
    if (this.collabApplyingRemote) {
        this.$refs.editor_nav.getEditorNavList()
        return
    }
    this.timerInit()
    this.diffContent()
    this.$refs.editor_nav.getEditorNavList()
},
restartCollaboration() {
    if (!this.visible || this.collabRestartPending) return
    this.collabRestartPending = true
    this.collabSession?.destroy()
    this.collabSession = null
    this.collabCanWrite = false
    this.collabUsers = []
    this.customExtensions = [pdfNote]
    this.collabKey += 1
    this.$nextTick(() => {
        this.collabRestartPending = false
        this.startCollaboration()
    })
},
warnOnCollabUnload(event) {
    if (!this.collabSession || (!this.unsave && !this.collabSession.hasPendingUpdates)) return
    event.preventDefault()
    event.returnValue = ''
}
```

`collabApplyingRemote` 只维持到下一次 Vue 更新周期，目的是绕开那次 `@change` 的旧差异计算；它并不是一个长期的远端更新锁。资源切换时 `collabKey` 递增，编辑器会重新创建。`beforeunload` 提醒只覆盖浏览器允许触发该事件的场景，不能代替后端确认。

### 8. 光标和头像样式

`collaboratorAvatars.vue` 自己管理头像容器的布局；光标和名字标签的具体颜色由 `caret.js` 设置。这里的 CSS 只定义形状、位置和文字外观。

```scss
.collaborator-avatars {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    margin-right: 6px;
}

.fab-collab-cursor {
    position: relative;
    border-left: 2px solid;
    margin-left: -1px;
    margin-right: -1px;
    pointer-events: none;
}

.fab-collab-cursor-label {
    position: absolute;
    z-index: 5;
    top: -1.4em;
    left: -1px;
    padding: 1px 5px;
    color: #fff;
    white-space: nowrap;
    user-select: none;
}
```

这些样式不会进入 Y.Doc，也不会修改正文。若头像出现而光标未出现，应分别排查 `presence` 列表与 `awareness` 消息；它们不是同一条同步链路。

## 四、把调用链串起来

### 场景 A：打开一篇已有笔记

1. `editorBlock.vue` 挂载后调用 `startCollaboration()`，创建 `Y.Doc`、Awareness 和 WebSocket。
2. 后端发送 `sync`，`session.js` 用 `Y.applyUpdate()` 合并后端更新，并把快照交给组件。
3. 若后端提示 `needsSeed`，组件把旧快照中的 ProseMirror JSON 正文转换进空的 Y.XmlFragment，然后通过 `publishBaseline()` 发送初始协同状态。
4. `Collaboration` 扩展观察 Y.Doc，把正文显示在 PowerEditor 中；组件另外用快照更新标题、封面等字段。

### 场景 B：本地输入一句话

1. 编辑器通过 `Collaboration` 扩展修改 Y.Doc。
2. `doc.on('update')` 收到二进制增量。自动保存开启时立即尝试发送；关闭时留在 `queuedUpdates`。
3. 后端应用更新并向其他客户端广播 `update`，对方 `Y.applyUpdate()` 合并并显示。后端将该次更新及其作者检查点写入 MinIO 后发送 `ack`；SQL history 由周期任务之后生成。
4. 定时保存或手动保存还会调用 `flush()`，发送排队正文更新、完整 `fabulous_notebook` 快照以及 Awareness。

### 场景 C：断线后恢复

1. `close` 把未确认的更新退回队列，并撤销当前写权限。
2. 两秒后创建新 WebSocket；收到新的 `sync` 才算 ready。
3. 曾经发出但未确认的更新先重发；普通草稿是否随后发出取决于自动保存设置。
4. 只有后端 `ack` 到达，对应条目才从 `inFlightUpdates` / `inFlightSnapshots` 中删除。

## 五、读代码时最容易混淆的几点

- **Y.Doc 与 `fabulous_notebook` 不同。** Y.Doc 的 `default` 片段承载正文；快照把正文转换成 JSON，再加上标题、封面等旧格式字段。
- **头像与光标不同。** 头像来自 `presence` 消息；光标来自 Awareness。两者可以独立出现或缺失。
- **自动保存关闭不等于停止接收。** 本地更新先排队；远端更新仍会应用到本地 Y.Doc。
- **`flush()` 返回 `true` 不等于保存完成。** 它只表明消息已交给 WebSocket；`ack` 之后才会清除待确认记录。
- **建立基线与普通保存不能混用。** `publishBaseline()` 会清空本地待发和待确认更新，再发送当前 Y.Doc 状态，因此只能在确实需要建基线时调用。
- **协同模式的正文来源是 Y.Doc。** `collaborationSnapshot(content)` 在协同模式下忽略 `content` 形参，直接从 Y.XmlFragment 取正文。
- **这套协同目前只在开发模式启用。** `startCollaboration()` 使用 `import.meta.env.DEV` 作为启动条件。
- **文档反映实现，不替实现兜底。** 例如断线后的持久化、重复提交去重、历史写入时机，要以服务端协议及实际联调结果为准。

## 六、后端持久化与 history 聚合（2026-10 更新）

后端把 Yjs 更新、最新完整快照、已接受的更新 ID、待生成 history 的作者段以及处理进度一起写入 MinIO `note_state/`。写成功后才向客户端发送对应 `ack`。前端的“已保存”只表示这批协同状态已被后端持久化；history 由后端周期任务另行写入 SQL。

周期任务每 15 秒检查一次已持久化的作者段。当前作者段在**末次变更后静默 60 秒**或**连续编辑满 5 分钟**时写入 history；换作者则立即结束上一作者段。相邻且同作者的提交会合并为该段最后一份**完整笔记**：`A1、A2、B1、A3` 对应 `A2`、`B1`、`A3` 三份完整内容，作者依次是 A、B、A；最后的 A 段等待静默或最长编辑时限。每份历史版本使用由资源和提交序号派生的固定版本 ID；即使 SQL 已写入、进度尚未来得及写回 MinIO 时后端退出，恢复任务重跑也不会插入重复版本。后端启动会扫描 `note_state/`，继续处理剩余作者段。

当前 FastAPI 协同房间仍按**单进程**设计。后端用 Pycrdt 应用 Yjs 更新并物化正文，因此即使发送方附带的 JSON 快照落后，也能为该次更新构造服务器接受顺序上的正文检查点。标题、封面等正文外元数据仍取自客户端快照；如果快照的 state vector 落后，后端保留上次已接受的元数据并请求新的快照，不会把被拒绝的快照确认成“已保存”。自动保存开启时客户端用最新 Y.Doc 和元数据重发；自动保存关闭时只重发已经明确提交的快照，避免把尚未手动保存的草稿随恢复请求发出去。必要时用户再次点击保存，生成新的快照。
