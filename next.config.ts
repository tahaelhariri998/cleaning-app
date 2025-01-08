/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'https-calls',
        networkTimeoutSeconds: 15,
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      // Cache NextAuth.js session endpoint
      urlPattern: /\/api\/auth\/session/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'auth-session',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }
  ]
})

module.exports = withPWA({
  reactStrictMode: false
})