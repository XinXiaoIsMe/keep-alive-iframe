import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  routes: [
    {
      path: '/',
      redirect: '/pinia'
    },
    {
      path: '/pinia',
      component: () => import('../views/Pinia.vue')
    },
    {
      path: '/vue_router',
      component: () => import('../views/VueRouter.vue')
    },
    {
      path: '/search',
      component: () => import('../views/Search.vue')
    }
  ],
  history: createWebHashHistory()
})

export default router
