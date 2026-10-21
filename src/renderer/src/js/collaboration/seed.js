import { Y } from '@creatorsn/powereditor3/collaboration'

function childrenToY(content = []) {
    const result = []
    let textRun = []

    const appendText = () => {
        if (!textRun.length) return
        const text = new Y.XmlText()
        text.applyDelta(textRun.map((node) => ({
            insert: node.text,
            attributes: Object.fromEntries(
                (node.marks || [])
                    .filter((mark) => mark.type !== 'ychange')
                    .map((mark) => [mark.type, mark.attrs || {}])
            )
        })))
        result.push(text)
        textRun = []
    }

    for (const node of content) {
        if (node.type === 'text') {
            textRun.push(node)
            continue
        }
        appendText()
        const element = new Y.XmlElement(node.type)
        for (const [key, value] of Object.entries(node.attrs || {})) {
            if (value !== null && key !== 'ychange') element.setAttribute(key, value)
        }
        const children = childrenToY(node.content || [])
        if (children.length) element.insert(0, children)
        result.push(element)
    }
    appendText()
    return result
}

export function seedYXmlFragmentFromJSON(fragment, body) {
    if (body?.type !== 'doc' || fragment.length !== 0)
        throw new Error('The collaboration document cannot be seeded')
    const children = childrenToY(body.content || [])
    if (children.length) fragment.insert(0, children)
}
