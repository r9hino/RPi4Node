import { createRouter, createWebHistory } from 'vue-router'
import Process from '../views/Process.vue'
import Calibration from '../views/Calibration.vue'
import SystemInfo from '../views/SystemInfo.vue'

const routes = [
  {
    path: '/',
    name: 'Process',
    component: Process
  },
  {
    path: '/Calibration',
    name: 'Calibration',
    component: Calibration
  },
  {
    path: '/SystemInfo',
    name: 'SystemInfo',
    component: SystemInfo,
    props: true
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
