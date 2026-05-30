import { mapActions } from 'pinia'
import { useDataStore } from '@/stores/data'
import { useAcademicConfig } from '@/stores/academic'
import { useNotebookConfig } from '@/stores/notebook'
import userCard from '@/components/general/displayCards/userCard.vue'

export default {
    components: {
        userCard
    },
    props: {
        mentionItemAttr: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            mentionData: {
                finalList: [],
                queryPage: null
            },
            currentMentionUser: null,
            loading: {
                searchMentionData: false
            },
            timer: {
                debounceSearch: null
            },
            show: {
                userCard: false
            }
        }
    },
    computed: {
        editorMentionItemAttr() {
            return {
                mentionList: () => this.mentionData.finalList,
                filterFunc: this.searchMentionData,
                chooseItemCallback: () => { },
                mentionClickCallback: this.mentionClickCallback,
                isLoading: () => this.loading.searchMentionData,
                headerForeground: () => 'rgba(149, 141, 241, 1)',
                placeholder: () => this.local('Mention User, Item or Notebook'),
                ...(this.mentionItemAttr || {})
            }
        }
    },
    methods: {
        ...mapActions(useAcademicConfig, {
            searchRemoteItems: 'getSearchItems'
        }),
        ...mapActions(useNotebookConfig, {
            searchRemoteNotebooks: 'searchRemoteNotebooks',
            getRemoteNotebookPath: 'getRemoteNotebookPath'
        }),
        ...mapActions(useDataStore, {
            searchSourceUsers: 'searchSourceUsers'
        }),
        async searchMentionData(value, oldVal) {
            clearTimeout(this.timer.debounceSearch)
            this.loading.searchMentionData = false
            let queryMain = value.split('/')[0].trim()
            let queryPage = value.split('/').length > 1 ? value.split('/')[1].trim() : null
            this.mentionData.queryPage = queryPage

            let oldQueryMain = (oldVal || '').split('/')[0].trim()

            let buildSection = (headerName, list) => {
                if (list.length === 0) return []
                return [
                    {
                        key: `header-${headerName}`,
                        name: headerName,
                        type: 'header'
                    },
                    ...list
                ]
            }

            if (queryMain === oldQueryMain && queryMain !== '') return

            this.timer.debounceSearch = setTimeout(async () => {
                this.loading.searchMentionData = true
                let [userRes, itemRes, notebookRes] = await Promise.all([
                    this.searchSourceUsers(this.editorDsId, queryMain, 5),
                    this.searchRemoteItems(this.editorDsId, null, queryMain, 8, 0),
                    this.searchRemoteNotebooks(this.editorDsId, queryMain, 8)
                ])

                let userList = []
                let itemList = []
                let notebookList = []

                userRes.data = userRes.data || []
                userRes.data.forEach((user, idx) => {
                    let displayName =
                        user.nickname || user.name || user.email || user.phone || user.id
                    userList.push({
                        key: `user-${idx}`,
                        id: user.id,
                        name: displayName,
                        image: () => `${this.$server}/users/${user.id}/avatar/content`,
                        email: user.email,
                        user,
                        type: 'user',
                        avatarImg: true,
                        dsId: this.editorDsId,
                        show: () => {
                            return this.mentionData.queryPage === null
                        }
                    })
                })

                itemRes.data = itemRes.data || []
                itemRes.data.forEach((el, idx) => {
                    itemList.push({
                        key: `item-${idx}`,
                        id: el.id,
                        name: `${el.emoji} ${el.name}`,
                        emoji: el.emoji,
                        image: './builtin-images/research.svg',
                        pdf: el.pdf,
                        type: 'item',
                        dsId: this.editorDsId,
                    })

                    el.pages.forEach((page, pidx) => {
                        itemList.push({
                            key: `item-${idx}-page-${pidx}`,
                            id: page.id,
                            name: `${page.emoji}  ${page.name}`,
                            emoji: page.emoji,
                            icon: 'Go',
                            iconColor:
                                this.theme === 'light'
                                    ? 'rgba(36, 36, 36, 1)'
                                    : 'rgba(220, 220, 220, 1)',
                            parent: el,
                            _page: page,
                            type: 'page',
                            dsId: this.editorDsId,
                            show: () => {
                                if (this.mentionData.queryPage === null) return false
                                return (
                                    page.name
                                        .toLowerCase()
                                        .indexOf(this.mentionData.queryPage.toLowerCase()) > -1
                                )
                            }
                        })
                    })
                    itemList.push({
                        key: `item-${idx}-divider`,
                        name: `-`,
                        type: 'divider',
                        show: () => {
                            return this.mentionData.queryPage !== null
                        }
                    })
                })

                notebookRes.data = notebookRes.data || []
                notebookRes.data.forEach((notebook, idx) => {
                    notebookList.push({
                        key: `notebook-${idx}`,
                        id: notebook.id,
                        name: notebook.name,
                        image: './builtin-images/notebook.svg',
                        notebook,
                        type: 'notebook',
                        dsId: this.editorDsId,
                        show: () => {
                            return this.mentionData.queryPage === null
                        }
                    })
                })

                this.mentionData.finalList = [
                    ...buildSection(this.local('User'), userList),
                    ...buildSection(this.local('Item'), itemList),
                    ...buildSection(this.local('Notebook'), notebookList)
                ]
                this.loading.searchMentionData = false
            }, 500)
        },
        mentionClickCallback(item) {
            if (item.type === 'item') {
                if (item.pdf) {
                    this.displayMentionItem = item
                }
                this.displayModeModel = 'both'
                return
            }
            if (item.type === 'user') {
                this.currentMentionUser = item.user || { id: item.id }
                this.show.userCard = true
                return
            }
            if (item.type === 'page') {
                let page = item._page || item
                let parent = item.parent || {}
                let dsId = item.dsId || this.editorDsId
                if (!dsId || !parent.id || !page.id) return
                let path = `${dsId}/${parent.id}/${page.id}`
                let url = `/academic/${encodeURI(path.replace(/\//g, '\\'))}`
                this.$Go(url)
                return
            }
            if (item.type === 'notebook') {
                this.getRemoteNotebookPath(item.id).then((res) => {
                    if (res?.code !== 200 || !res?.data?.guidPath) return
                    let url = `/notebook/${encodeURI(
                        res.data.guidPath.replace(/\//g, '\\')
                    )}`
                    this.$Go(url)
                })
            }
        }
    }
}
