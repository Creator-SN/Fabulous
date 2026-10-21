const icons = import.meta.glob('../../assets/fileTypes/*.svg', { eager: true, query: '?url', import: 'default' })

export function fileExtension(name = '') {
    const lastDot = name.lastIndexOf('.')
    return lastDot > 0 ? name.slice(lastDot + 1).toLowerCase() : ''
}

export function fileIcon(name) {
    return icons[`../../assets/fileTypes/${fileExtension(name)}.svg`] || icons['../../assets/fileTypes/other.svg']
}

export function fileTypeLabel(name) {
    const extension = fileExtension(name)
    const labels = { doc: 'Word', docx: 'Word', xls: 'Excel', xlsx: 'Excel', ppt: 'PowerPoint', pptx: 'PowerPoint', pdf: 'PDF', md: 'Markdown' }
    return labels[extension] || (extension ? extension.toUpperCase() : 'File')
}
