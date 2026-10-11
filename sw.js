/* Çevrimdışı oynamak için önbellek. Önce ağ denenir (güncellemeler hemen gelsin), ağ yoksa önbellekten açılır.
   Yeni dosya eklersen FILES listesine ekle; büyük değişikliklerde VERSION'ı artır. */
const VERSION = "kampus-v1";
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "fonts/fonts.css",
  "fonts/nunito-latin.woff2",
  "fonts/nunito-latin-ext.woff2",
  "fonts/pixelify-sans-latin.woff2",
  "fonts/pixelify-sans-latin-ext.woff2",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, {ignoreSearch: true}))
  );
});
