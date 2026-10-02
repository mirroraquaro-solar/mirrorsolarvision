import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        drainClips: resolve(__dirname, 'drain-clips/index.html'),
        bulkCombo: resolve(__dirname, 'bulk-combo/index.html'),
        ppSpunFilter: resolve(__dirname, 'products/10-inch-pp-spun-filter/index.html'),
        spunCombo: resolve(__dirname, 'products/5-spun-filter-pack-with-free-wrench/index.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }
        }
      }
    }
  }
})

