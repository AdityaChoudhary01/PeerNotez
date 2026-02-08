const CACHE_NAME = "peernotez-cache-v2"; // Incremented version
const urlsToCache = [
  "/",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "/favicon.ico"
];

// Install Event
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
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
  self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = event.request.url;

  // 1. Always network for API
  if (url.includes("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Network-First for index.html (Navigation requests)
  // This prevents the "blurred" look by ensuring the newest HTML is fetched first.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Fallback to cache only if offline
          return caches.match(event.request);
        })
    );
    return;
  }

  // 3. Cache-First for static assets (JS, CSS, Images)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return (
        cachedResponse ||
        fetch(event.request).then(networkResponse => {
          // Only cache successful responses
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
      );
    })
  );
});

// 4. Message Listener for SKIP_WAITING
// This connects with your serviceWorkerRegistration.js to allow immediate updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
