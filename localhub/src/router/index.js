import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Board from '../pages/Board.vue'
import PostDetail from '../pages/PostDetail.vue'
import MyActivity from '../pages/MyActivity.vue'
import Map from '../pages/Map.vue'
import Route from '../pages/Route.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
<<<<<<< HEAD
    { path: '/', name: 'Home', component: Home },
    { path: '/community', name: 'Board', component: Board },
    { path: '/community/:id', name: 'PostDetail', component: PostDetail, props: true },
    { path: '/map', name: 'Map', component: Map },
    { path: '/route', name: 'Route', component: Route }
=======
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
      path: '/activity/:type',
      name: 'MyActivity',
      component: MyActivity,
      props: true
    },
    {
      path: '/community/:id',
      name: 'PostDetail',
      component: PostDetail,
      props: true
    },
    {
      path: '/map',
      name: 'Map',
      component: Map
    }
>>>>>>> 49b367f278a52a01127579755c4cd54ccc8669da
  ]
})

export default router