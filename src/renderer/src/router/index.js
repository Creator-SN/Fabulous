import { createRouter, createWebHashHistory } from 'vue-router'
import tools from './tools';
const AsyncLoad = tools.AsyncLoad;

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: AsyncLoad(() => import("@/views/home/index.vue")),
            meta: {
                title: "FAB"
            }
        },
        {
            path: "/partitions/:id",
            name: "Partition",
            component: AsyncLoad(() => import("@/views/home/partition.vue"))
        },
        {
            path: "/local_notebook/:path",
            name: "Local Notebook",
            component: AsyncLoad(() => import("@/views/notebook/local.vue"))
        },
        {
            path: "/notebook/:path",
            name: "NoteBook",
            component: AsyncLoad(() => import("@/views/notebook/index.vue"))
        },
        {
            path: "/templates",
            name: "Templates",
            component: AsyncLoad(() => import("@/views/templates/index.vue"))
        },
        {
            path: "/settings",
            name: "Settings",
            component: AsyncLoad(() => import("@/views/settings/index.vue"))
        },
        {
            path: "/login/:block?",
            name: "Login",
            component: AsyncLoad(() => import("@/views/login/index.vue"))
        },
        {
            path: "/dev",
            name: "Dev",
            component: AsyncLoad(() => import("@/views/dev/index.vue"))
        },
        {
            path: "/academic/:path",
            name: "Academic",
            component: AsyncLoad(() => import("@/views/academic/index.vue"))
        },
        {
            path: "/academic/template/:path",
            name: "Template",
            component: AsyncLoad(() => import("@/views/academic/index.vue"))
        }
    ]
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('ApiToken')
    const isLoginRoute = to.path.startsWith('/login')
    if (!token && !isLoginRoute) {
        next('/login')
        return
    }
    next()
})

router.afterEach((to) => {
    document.title = to.meta?.title || to.name || 'FAB'
})

export default router
