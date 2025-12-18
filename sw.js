// Simple passthrough service worker
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Always fetch from network to avoid "Internal Error" or white screens in development
  event.respondWith(fetch(event.request));
});