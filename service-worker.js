const CACHE_NAME = 'hmg-learnhub-v7-cache';
const ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './lesson.html',
  './quiz.html',
  './library.html',
  './planner.html',
  './tools.html',
  './certificate.html',
  './assets/js/dashboard.js',
  './assets/js/lesson.js',
  './assets/js/library.js',
  './assets/js/planner.js',
  './assets/js/quiz.js',
  './data/curriculum/map.json'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Stale-While-Revalidate / Cache-First)
self.addEventListener('fetch', (e) => {
  // Avoid intercepting non-GET requests or browser extension routes
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((cachedResponse) => {
        const fetchedResponse = fetch(e.request).then((networkResponse) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
          // Fallback if offline and request not cached
          return cachedResponse;
        });

        return cachedResponse || fetchedResponse;
      });
    })
  );
});
