self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("peernotez-cache").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/icons/logo192.png",
        "/icons/logo512.png",
        "/icons/favicon.ico"
        
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
