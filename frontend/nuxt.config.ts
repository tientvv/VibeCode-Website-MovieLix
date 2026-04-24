// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  app: {
    head: {
      title: 'MovieLix — Watch Movies in 1080p & 2K',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        {
          name: 'description',
          content:
            'Stream movies and TV series in stunning 1080p and 2K quality. High-quality streaming platform.',
        },
        { name: 'theme-color', content: '#0a0a0a' },
        { property: 'og:title', content: 'MovieLix — Watch Movies in 1080p & 2K' },
        { property: 'og:description', content: 'Stream movies and TV series in stunning quality.' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    streamingApiUrl: process.env.STREAMING_API_URL || 'http://localhost:4000',
    pretranscodeOnUpload: process.env.PRETRANSCODE_ON_UPLOAD || 'true',
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      streamingUrl: process.env.NUXT_PUBLIC_STREAMING_URL || 'http://localhost:4000',
    },
  },

  routeRules: {
    '/api/stream/**': {
      proxy:
        process.env.NODE_ENV === 'production'
          ? 'http://streaming-api:4000/api/stream/**'
          : 'http://localhost:4000/api/stream/**',
    },
  },
});
