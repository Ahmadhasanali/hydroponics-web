import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'Hydroponics Farm',
        short_name: 'HydroFarm',
        theme_color: '#0b1220',
        background_color: '#0b1220',
        display: 'standalone',
        icons: [
          { src: '/pwa-assets/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-assets/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-assets/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src'),
    },
  },
})
