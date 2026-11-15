/* MathDys — service worker : garde une copie du site pour qu'il marche sans Internet.
   Aucune donnée des cahiers ne passe par ici : seuls les fichiers du site sont mis en cache. */
const VERSION = 'mathdys-0.3.0';
const CORE = ['./', './index.html', './style.css', './app.js', './manifest.webmanifest',
              './icon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
const CDN = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Fichiers du site : on essaie Internet d'abord (pour avoir la dernière version),
// et si ça ne répond pas en 3 secondes, on prend la copie gardée.
function networkFirst(req) {
  return new Promise(resolve => {
    let done = false;
    const fallback = () => caches.match(req, { ignoreSearch: true })
      .then(r => r || caches.match('./index.html'))
      .then(r => { if (!done && r) { done = true; resolve(r); } });
    const timer = setTimeout(fallback, 3000);
    fetch(req).then(res => {
      clearTimeout(timer);
      if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      if (!done) { done = true; resolve(res); }
    }).catch(() => { clearTimeout(timer); fallback().then(() => { if (!done) resolve(Response.error()); }); });
  });
}

// Éditeur de formules et polices : la copie gardée d'abord (rapide, marche hors ligne),
// et on la met à jour en arrière-plan.
function cacheFirst(req) {
  return caches.open(VERSION).then(c => c.match(req).then(hit => {
    const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) e.respondWith(networkFirst(req));
  else if (CDN.includes(url.hostname)) e.respondWith(cacheFirst(req));
});
