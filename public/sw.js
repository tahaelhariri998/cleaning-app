// public/sw.js
// List of pages to cache immediately
const PRECACHE_PAGES = [
    '/',
    '/profile'
  ];
  
  // Cache name definitions
  const CACHE_NAMES = {
    pages: 'pages-cache-v1',
    images: 'images-cache-v1',
    static: 'static-cache-v1'
  };
  
  self.addEventListener('install', (event) => {
    event.waitUntil(
      Promise.all([
        // Cache critical pages immediately
        caches.open(CACHE_NAMES.pages).then((cache) => {
          return cache.addAll(PRECACHE_PAGES);
        }),
        // Cache the offline page
        caches.open(CACHE_NAMES.pages).then((cache) => {
          return cache.add('/profile');
        })
      ])
    );
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
      return;
    }
  
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          // Return cached version
          return response;
        }
  
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
  
          // Clone the response
          const responseToCache = response.clone();
  
          // Determine cache storage based on request type
          const cacheKey = event.request.url.includes('/_next/image') || 
            event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/) 
            ? CACHE_NAMES.images 
            : event.request.url.match(/\.(js|css)$/) 
              ? CACHE_NAMES.static 
              : CACHE_NAMES.pages;
  
          caches.open(cacheKey).then((cache) => {
            cache.put(event.request, responseToCache);
          });
  
          return response;
        }).catch(() => {
          // Return offline page if network request fails
          if (event.request.mode === 'navigate') {
            return caches.match('/profile');
          }
        });
      })
    );
  });
  
  // Listen for page prefetch requests from the app
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PREFETCH_PAGES') {
      event.waitUntil(
        caches.open(CACHE_NAMES.pages).then((cache) => {
          return cache.addAll(event.data.pages);
        })
      );
    }
  });