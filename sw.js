// SW básico para permitir instalação PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Apenas repassa as requisições, necessário para o navegador considerar "instalável"
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});