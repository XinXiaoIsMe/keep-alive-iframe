import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  routes: [
    {
      path: '/home',
      component: () => import('../components/Home.vue')
    },
    {
      path: '/nav',
      component: () => import('../components/Nav.vue')
    }
  ],
  history: createWebHashHistory()
})

export default router
