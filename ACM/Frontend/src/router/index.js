import { createRouter, createWebHistory } from 'vue-router';
import store from '../store/index';

import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Process from '../views/Process.vue';
import Calibration from '../views/Calibration.vue';
import SystemInfo from '../views/SystemInfo.vue';
import Logs from '../views/Logs.vue';

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: '/process',
    name: 'process',
    component: Process,
    meta: { requiresAuth: true },
  },
  {
    path: '/calibration',
    name: 'calibration',
    component: Calibration,
    meta: { requiresAuth: true },
  },
  {
    path: '/systeminfo',
    name: 'systeminfo',
    component: SystemInfo,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/logs',
    name: 'logs',
    component: Logs,
    props: true,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if(to.matched.some((record) => record.meta.requiresAuth)){
    if(store.getters.getAuthenticated){
      next();
      return;
    }
    next("/login");
  }
  else {
    next();
  }
});

export default router
