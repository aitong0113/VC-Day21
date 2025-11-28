//即使 沒網路也能開啟網站

   

const cacheName = "心天氣-v1";
const filesToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./HeartWeather.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(filesToCache);
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