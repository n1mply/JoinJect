import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Доступ с любого IP в локальной сети
    port: 5173,      // Порт (можно поменять, если занят)
    strictPort: true, // Не автоматически искать другой порт, если 5173 занят
  },
})