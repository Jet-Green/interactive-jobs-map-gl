import IndexView from '@/views/IndexView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 200,
      }
    }
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
  history: createWebHistory(new URL(import.meta.env.BASE_URL, window.location.href).pathname),
  routes: [
    {
      path: '/',
      name: 'Main',
      component: IndexView,
    },
  ],
})

export default router
