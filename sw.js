// ─── FuelLog Service Worker ───
// Cambia este string en cada deploy → fuerza actualización automática en todos los dispositivos
var CACHE = 'fuellog-v5';

var PRECACHE = [
  '/',
  '/index.html',
  '/app.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// ── Instalación: precachea los assets críticos ──
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE).then(function(cache) { return cache.addAll(PRECACHE); })
  );
  self.skipWaiting();
});

// ── Activación: borra cachés viejos y toma el control de todos los clientes ──
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(key) { return key !== CACHE; })
          .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// ── Fetch: Network-first para HTML, Cache-first para el resto ──
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Peticiones externas (OFF API, Quagga CDN…) → siempre red, sin cachear
  if (url.origin !== self.location.origin) return;

  // index.html y app.html → Network-first
  if (
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/app.html'
  ) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(event.request, clone); });
          return response;
        })
        .catch(function() { return caches.match(event.request); })
    );
    return;
  }

  // Resto de assets (iconos, manifest…) → Cache-first
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) { cache.put(event.request, clone); });
        return response;
      });
    })
  );
});
