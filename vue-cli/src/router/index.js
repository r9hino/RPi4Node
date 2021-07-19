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
    component: SystemInfo
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
