const CACHE_NAME = "peernotez-cache-v1";
const urlsToCache = [
  "/",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "/favicon.ico"
];

// Install SW and cache static assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // activate new SW immediately
});

// Activate SW and remove old caches
self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim(); // claim clients immediately
});

// Fetch event with method filtering
self.addEventListener("fetch", event => {
  // Skip non-GET requests (e.g. PUT, POST)
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate" || event.request.url.endsWith("/index.html")) {
    // Network-first strategy for navigation
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first strategy for static assets
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});
