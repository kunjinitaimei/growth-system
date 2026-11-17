/* 核心页面离线可用；大模型首次识别时懒加载并缓存。 */
var CACHE = 'growth-v9';
var FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './foods.js',
  './meal-photos.js',
  './food-recognition.worker.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function networkFirst(request, navigation) {
  return fetch(request).then(function (res) {
    if (res.ok) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(request, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(request).then(function (cached) {
      if (cached) return cached;
      if (navigation) return caches.match('./index.html');
      return Response.error();
    });
  });
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.indexOf('/models/') > -1) {
    e.respondWith(caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      });
    }));
    return;
  }

  e.respondWith(networkFirst(e.request, e.request.mode === 'navigate'));
});
