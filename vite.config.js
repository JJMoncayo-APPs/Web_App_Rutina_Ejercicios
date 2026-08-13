// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Web_App_Rutina_Ejercicios/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      includeAssets: [
        'assets/branding/free-athlete-logo.png',
        'assets/branding/pwa-192.png',
        'assets/branding/pwa-512.png',
      ],

      manifest: {
        id: './',
        name: 'Free Athlete',
        short_name: 'Free Athlete',
        description:
          'Programa personal de entrenamiento de 15 semanas, workouts independientes y seguimiento de marcas.',

        start_url: './',
        scope: './',

        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0d0f13',
        background_color: '#0d0f13',

        lang: 'es',
        categories: [
          'fitness',
          'health',
          'sports',
          'lifestyle',
        ],

        icons: [
          {
            src: 'assets/branding/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'assets/branding/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'assets/branding/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'assets/branding/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        globPatterns: [
          '**/*.{html,js,css,ico,png,svg,webp,jpg,jpeg,woff,woff2}',
        ],

        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,

        navigateFallback: 'index.html',

        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'image',

            handler: 'CacheFirst',

            options: {
              cacheName: 'free-athlete-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
})