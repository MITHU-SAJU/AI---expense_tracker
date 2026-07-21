import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['react-bootstrap', 'bootstrap', 'bootstrap-icons'],
          charts: ['recharts'],
          utils: ['axios', 'jwt-decode']
        }
      }
    }
  }
})
