import { createRouter, createWebHistory } from 'vue-router';
import Process from '../views/Process.vue';
import Login from '../views/Login.vue';
import Calibration from '../views/Calibration.vue';
import SystemInfo from '../views/SystemInfo.vue';

const routes = [
  {
    path: '/',
    name: 'process',
    component: Process
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: '/calibration',
    name: 'calibration',
    component: Calibration
  },
  {
    path: '/systeminfo',
    name: 'systeminfo',
    component: SystemInfo,
    props: true
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
