import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    minify: false,
    sourcemap: true,
    terserOptions: {
      compress: {
        // 禁用危险的压缩选项
        unsafe: false,
        unsafe_proto: false,
        unsafe_comps: false
      },
      mangle: {
        // 保留关键变量名，避免被混淆成v/w
        reserved: ['v', 'w', 'callback', 'assign']
      }
    }
  },
  server: {
    proxy: {
      // 将/api请求代理到后端服务器
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
