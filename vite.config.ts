import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Khi deploy GitHub Pages, để đúng tên repo:
  base: '/hanh-trinh-trieu-usd/',
  server: {
    // tắt overlay lỗi nếu muốn, không bắt buộc:
    // hmr: { overlay: false }
  }
})
