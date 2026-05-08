// sw.js — FuelLog
// El index.html NUNCA se cachea: siempre viene de la red
// Solo se cachean iconos y manifest para funcionar offline

var version = new URL(self.location.href).searchParams.get('v') || 'dev';
var CACHE = 'fuellog-v' + version;

// Solo cacheamos assets estáticos que no cambian con el código
var STATIC_ASSETS = [
  '/FuelLog/manifest.json',
  '/FuelLog/icon-192.png',
  '/FuelLog/icon-512.png'
];

self.addEventListener('install', function(e) {
  console.log('[SW] Install v' + version);
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return Promise.allSettled(
        STATIC_ASSETS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.log('[SW] Cache miss:', url, err);
          });
        })
      );
    })
  );
  // Activarse inmediatamente sin esperar
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  console.log('[SW] Activate v' + version + ' — borrando caches viejos');
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(k) { return k !== CACHE; })
          .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Nunca interceptar llamadas externas
  if (url.includes('openfoodfacts') ||
      url.includes('fonts.googleapis') ||
      url.includes('fonts.gstatic') ||
      url.includes('cdnjs.cloudflare') ||
      url.includes('stripe')) {
    return;
  }

  // index.html — SIEMPRE de la red, nunca del caché
  // Si no hay red, devuelve error (mejor que mostrar versión vieja)
  if (url.includes('index.html') || url.endsWith('/FuelLog/') || url.endsWith('/FuelLog')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(function() {
          // Sin red: intenta caché como último recurso
          return caches.match('/FuelLog/index.html');
        })
    );
    return;
  }

  // Iconos y manifest — caché primero (no cambian)
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        return response;
      });
    })
  );
});

self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
