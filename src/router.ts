import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('./pages/IdeasPage.vue') },
    { path: '/timeline', component: () => import('./pages/TimelinePage.vue') },
    { path: '/idea/new', component: () => import('./pages/IdeaEditorPage.vue'), meta: { hideNav: true } },
    { path: '/idea/:id', component: () => import('./pages/IdeaDetailPage.vue'), meta: { hideNav: true } },
    { path: '/tags', component: () => import('./pages/TagsPage.vue') },
    { path: '/settings', component: () => import('./pages/SettingsPage.vue') },
  ],
})
