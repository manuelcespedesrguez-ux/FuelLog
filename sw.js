// ─── FuelLog Service Worker ───
// Cambia este string en cada deploy → fuerza actualización automática en todos los dispositivos
const CACHE = 'fuellog-v4';

const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// ── Instalación: precachea los assets críticos ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  // Actívate inmediatamente sin esperar a que se cierren pestañas
  self.skipWaiting();
});

// ── Activación: borra cachés viejos y toma el control de todos los clientes ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  // Toma el control inmediato de todas las pestañas/ventanas abiertas
  self.clients.claim();
});

// ── Fetch: Network-first para index.html, Cache-first para el resto ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Peticiones externas (OFF API, Quagga CDN…) → siempre red, sin cachear
  if (url.origin !== self.location.origin) return;

  // index.html → Network-first: intenta red primero para pillar versión nueva,
  // cae a caché solo si no hay conexión
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Guarda la versión fresca en caché
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Resto de assets (iconos, manifest…) → Cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
