import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:3001' },
    watch: {
      ignored: ['**/server/**', '**/server/backups/**'],
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react'
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor-motion'
            }
            if (id.includes('socket.io-client')) {
              return 'vendor-socket'
            }
          }
        },
      },
    },
  },

})

