var CACHE = 'bozzone-tasks-v1';
var SHELL = ['./', './index.html', './manifest.json', './icon.svg'];

/* Install — cache app shell */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); })
  );
  self.skipWaiting();
});

/* Activate — clean old caches */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* Fetch — network-first, fall back to cache */
self.addEventListener('fetch', function (e) {
  /* Let Firebase requests go straight to network */
  if (e.request.url.indexOf('firebaseio.com') !== -1 ||
      e.request.url.indexOf('googleapis.com') !== -1 ||
      e.request.url.indexOf('gstatic.com') !== -1) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(function (res) {
        /* Update cache with fresh copy */
        var clone = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        return res;
      })
      .catch(function () {
        return caches.match(e.request);
      })
  );
});
