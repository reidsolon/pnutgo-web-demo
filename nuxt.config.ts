// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  
  vite: {
    define: {
      global: 'globalThis'
    }
  },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET,
    public: {
      authUrl: process.env.NUXT_AUTH_URL || 'http://localhost:3000',
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000/api',
      wsHost: process.env.REVERB_HOST || 'localhost',
      wsPort: process.env.REVERB_PORT,
      wsKey: process.env.REVERB_APP_KEY || 'local-key'
    }
  },

  app: {
    head: {
      title: 'PnutGo - Companion Collecting Adventure',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Discover and collect companions in the real world with PnutGo' },
        { name: 'theme-color', content: '#3B82F6' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/assets/images/app-icon.png' },
        { rel: 'apple-touch-icon', href: '/assets/images/app-icon.png' },
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' }
      ]
    }
  },


})
