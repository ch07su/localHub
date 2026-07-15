import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

console.log('앱 시작!');

// 1. 앱을 생성하고 변수에 담습니다.
const app = createApp(App)

// 2. 플러그인을 연결합니다.
app.use(router)

// 3. 앱을 마운트합니다.
app.mount('#app')