export const config = {
    configId: null,
    init_status: true,
    data_path: [],
    data_index: -1,
    language: "en",
    autoSave: false,
    lastLocalPath: "",
    editorExpandContent: false,
    editorSplitRatio: 0.5,
    editorShowNav: true,
    activeSystemMode: 'both', // ds, notebook, both
    dynamicEffect: true,
    watchAllExtensions: false,
    themeColorList: [],
    theme: "light"
}

export const data_path_item = {
    path: null,
    shared: false,
    local: true
}

export const data_structure = {
    id: null,
    name: null,
    groups: [],
    partitions: [],
    items: [],
    templates: [],
    path: null,
    createDate: null
}

export const group = {
    id: null,
    name: null,
    emoji: null,
    groups: [], // deprecated in new version
    parent: null,
    partitions: [],
    createDate: null,
    updateDate: null
}
export const partition = {
    id: null,
    name: null,
    emoji: null,
    items: [], // only item id
    createDate: null,
    updateDate: null
}

export const item = {
    id: null,
    name: null,
    emoji: null,
    pdf: null,
    metadata: null,
    pages: [],
    labels: [],
    createDate: null,
    updateDate: null
}

export const page = {
    id: null,
    name: null,
    emoji: null,
    createDate: null,
    updateDate: null
}

export const metadata = {
    publisher: null,
    DOI: null,
    year: null,
    createDate: null,
    source: null,
    title: null,
    url: null,
    containerTitle: null, //一般是会议名称
    abstract: null,
    ISSN: null,
    language: null,
    chapter: null,
    pages: null,
    school: null,
    note: null,
    authors: []
}

export const author = {
    first: null,
    last: null,
    sequence: null
}

export const fabulous_notebook = {
    fabulous_notebook: true,
    title: null,
    description: null,
    banner: null,
    content: null,
    author: [],
    createDate: null,
    updateDate: null
}