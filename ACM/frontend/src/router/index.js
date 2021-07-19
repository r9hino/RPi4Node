import { createRouter, createWebHistory } from 'vue-router'
import Process from '../views/Process.vue'
import SystemInfo from '../views/SystemInfo.vue'

const routes = [
  {
    path: '/',
    name: 'Process',
    component: Process
  },
  {
    path: '/SystemInfo',
    name: 'SystemInfo',
    component: SystemInfo,
    props: true
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
