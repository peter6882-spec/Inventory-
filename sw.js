const CACHE_NAME = 'tsai-inventory-pwa-v89-20260706';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.svg', './icon-512.svg'];

self.addEventListener('install', event => {
  // 逐項快取並容錯：單一資源失敗（例如某圖示暫時 404）不影響其他資源與整體安裝
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(APP_SHELL.map(url =>
        cache.add(url).catch(err => console.warn('SW 快取略過', url, err))
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      if (new URL(req.url).origin === location.origin) {
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
