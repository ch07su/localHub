import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api/kakao-directions': {
        target: 'https://apis-navi.kakaomobility.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/kakao-directions/, '/v1/directions')
      }
    }
  }
})