import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All /api/* calls from the dev server are forwarded to the Spring Boot backend
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
})
