const CACHE_NAME = 'barista-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './img/barista.png',
  './img/icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
