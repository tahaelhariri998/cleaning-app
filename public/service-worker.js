const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/profile',
  '/ProfileRating',
  // Static assets
  '/logo.png',
  '/styles/main.css',
  '/globals.css',
  // Add API routes for offline data
  '/api/auth/session',
  '/api/rating',
  '/api/user',
  // Add manifest and icons
  '/manifest.json',
  
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Special handling for API routes
  if (event.request.url.includes('/api/')) {
    return event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }

  // Regular route handling
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            // Return the offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            throw error;
          });
      })
  );
});

// Add cache cleanup on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});