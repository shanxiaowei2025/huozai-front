import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'
import Placeholder from '../views/Placeholder.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/devices',
    name: 'Devices',
    component: Placeholder,
    props: { title: '设备管理', icon: '📹' }
  },
  {
    path: '/alarms',
    name: 'Alarms',
    component: Placeholder,
    props: { title: '报警记录', icon: '🚨' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Placeholder,
    props: { title: '系统设置', icon: '⚙️' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

