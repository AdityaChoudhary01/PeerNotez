const CACHE_NAME = "peernotez-cache-v3"; // Incremented for new logic
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/static/css/main.css", // Ensure paths match your build output
  "/static/js/main.js"
];

const IMAGE_CACHE = "peernotez-images-v1";
const FONT_CACHE = "peernotez-fonts-v1";

// Install Event
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (![CACHE_NAME, IMAGE_CACHE, FONT_CACHE].includes(key)) {
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 1. STRATEGY: Cache-First for Google Fonts (Speeds up text rendering)
  if (url.origin === "https://fonts.gstatic.com" || url.origin === "https://fonts.googleapis.com") {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 2. STRATEGY: Stale-While-Revalidate for Cloudinary Images
  // This shows the cached image instantly while updating it in the background
  if (url.origin === "https://res.cloudinary.com") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. STRATEGY: Network-First for API
  if (url.pathname.includes("/api/")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // 4. Default Strategy for static files
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        if (networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});

// Message Listener
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
