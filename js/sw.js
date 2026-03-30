// Service Worker for Whore Image Generator PWA

const CACHE_NAME = 'whore-generator-v1';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/presets.js',
  './js/storage.js',
  './js/prompt.js',
  './js/toast.js',
  './schemas/presets/master.json',
  './manifest.json',
  './offline.html'
];

// Individual preset files
const PRESET_FILES = [
  './schemas/presets/individual/asian-whore.json',
  './schemas/presets/individual/bbw-whore.json',
  './schemas/presets/individual/car-whore.json',
  './schemas/presets/individual/college-slut.json',
  './schemas/presets/individual/dumb-bimbo-whore.json',
  './schemas/presets/individual/goth-whore.json',
  './schemas/presets/individual/high-class-escort.json',
  './schemas/presets/individual/milf-whore.json',
  './schemas/presets/individual/nurse-whore.json',
  './schemas/presets/individual/street-whore.json'
];

// Combine all assets
const ALL_ASSETS = [...ASSETS, ...PRESET_FILES];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ALL_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cache if available
        if (response) {
          return response;
        }

        // Clone request for network fetch
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response for cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page if available
            return caches.match('./offline.html');
          });
      })
  );
});