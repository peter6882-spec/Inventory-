const CACHE_NAME = 'tsai-inventory-pwa-v90-20260706';
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
  const url = new URL(req.url);
  // 不攔截跨網域請求（Firebase / CDN），讓資料與 SDK 直接走網路
  if (url.origin !== location.origin) return;
  // 網路優先：連線正常一律抓最新程式碼，離線才用快取備援 → 不會再看到舊版
  event.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
  );
});
