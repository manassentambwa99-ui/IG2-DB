hereconst CACHE_NAME = 'gombe2-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './IMG-20260924-WA0080.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
