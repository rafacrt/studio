// Basic service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // event.waitUntil(
  //   caches.open('alugo-cache-v1').then((cache) => {
  //     return cache.addAll([
  //       '/',
  //       // Add other assets to cache here
  //     ]);
  //   })
  // );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
});

self.addEventListener('fetch', (event) => {
  // console.log('Service Worker: Fetching', event.request.url);
  // event.respondWith(
  //   caches.match(event.request).then((response) => {
  //     return response || fetch(event.request);
  //   })
  // );
});
