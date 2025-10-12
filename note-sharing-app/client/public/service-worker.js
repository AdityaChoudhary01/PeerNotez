const CACHE_NAME = "peernotez-cache-v1";
const urlsToCache = [
  "/",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "/favicon.ico"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) return caches.delete(cacheName);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = event.request.url;

  // 1. Always network for API
  if (url.includes("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Stale-while-revalidate for index.html
  if (event.request.mode === "navigate" || url.endsWith("/index.html")) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        });
        return cachedResponse || fetchPromise; // serve cache immediately if exists
      })
    );
    return;
  }

  // 3. Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
        return networkResponse;
      });
    })
  );
});
