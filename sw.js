/* ConcursorIA Tech PWA - cache isolado, rede primeiro, versão 2026-10-20 */
const VERSION = 'concursoria-tech-shell-v1-20261020';
const ROOT = self.registration.scope;
const ASSETS = ['','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png'].map(p => new URL('./' + p, ROOT).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(n => n.startsWith('concursoria-tech-shell-') && n !== VERSION).map(n => caches.delete(n))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin || !url.href.startsWith(ROOT)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        event.waitUntil(caches.open(VERSION).then(cache => cache.put(new URL('./index.html', ROOT).href, copy)));
      }
      return res;
    }).catch(async () => (await caches.match(new URL('./index.html', ROOT).href)) || Response.error()));
    return;
  }
  const name = url.pathname.split('/').pop();
  if (!['manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png'].includes(name)) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
    if (res.ok) {
      const copy = res.clone();
      event.waitUntil(caches.open(VERSION).then(cache => cache.put(event.request, copy)));
    }
    return res;
  })));
});
