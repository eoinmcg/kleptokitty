const CACHE_NAME = 'kleptokitty-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/t.gif',
  '/map_t.gif',
  '/spotlight.png',
  '/mugshot.png',
  '/Slackey-Regular.ttf',
  '/mapeditor.html',
  '/map/map.css',
  '/map/map.js',
  '/vids/mapeditor.png',
  '/vids/transparent.png',
  '/vids/loot.png',
  '/vids/level1.webm',
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
