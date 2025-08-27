self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("peernotez-cache").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/logo192.png",
        "/logo512.png",
        "/favicon.ico"
        
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
