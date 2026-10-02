/* ============================================
   KE Tools — service-worker.js
   Caches the core app shell (HTML/CSS/JS) so the
   UI loads offline. Tool libraries loaded from a
   CDN (pdf-lib, PDF.js, QR/Barcode) still require
   an internet connection the first time they load.
   ============================================ */
const CACHE_NAME = "ke-tools-v14";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/main.css",
  "./css/auth.css",
  "./css/dashboard.css",
  "./css/components.css",
  "./css/tools.css",
  "./css/responsive.css",
  "./css/glass.css",
  "./js/utils.js",
  "./js/icons.js",
  "./js/storage.js",
  "./js/theme.js",
  "./js/favorites.js",
  "./js/recent.js",
  "./js/search.js",
  "./js/auth.js",
  "./js/router.js",
  "./tools/utilities/extended.js",
  "./js/app.js",
  "./assets/toolnest-logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(CORE_ASSETS.map(asset => new Request(asset, { cache:"reload" })))
    ).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Only handle same-origin GET requests; let CDN library requests pass through normally.
  if(event.request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if(cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      }).catch(() => cached);
    })
  );
});
