import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/playlist/:id', name: 'Playlist', component: () => import('../views/Playlist.vue') },
  { path: '/daily', name: 'DailyMix', component: () => import('../views/DailyMix.vue') },
  { path: '/friends', name: 'Friends', component: () => import('../views/Friends.vue') },
  { path: '/downloads', name: 'Downloads', component: () => import('../views/Downloads.vue') },
  { path: '/history', name: 'History', component: () => import('../views/History.vue') },
  { path: '/favorites', name: 'Favorites', component: () => import('../views/Favorites.vue') },
  { path: '/user', name: 'User', component: () => import('../views/User.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router