import { Extension } from '@creatorsn/powereditor3'
import { yCursorPlugin } from '@creatorsn/powereditor3/collaboration'

function normalizeColor(value) {
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
