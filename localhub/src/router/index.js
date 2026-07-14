import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Board from '../pages/Board.vue'
import Map from '../pages/Map.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/community',
      name: 'Board',
      component: Board
    },
    {
      path: '/map',
      name: 'Map',
      component: Map
    }
  ]
})

export default router