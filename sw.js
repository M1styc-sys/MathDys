/* MathDys — service worker : garde une copie du site pour qu'il marche sans Internet.
   Aucune donnée des cahiers ne passe par ici : seuls les fichiers du site sont mis en cache. */
const VERSION = 'mathdys-1.1.1';
const CORE = ['./', './index.html', './style.css', './app.js', './manifest.webmanifest',
              './icon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
const CDN = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  // cache: 'reload' : on prend les fichiers sur le serveur, jamais une vieille copie du navigateur
  e.waitUntil(caches.open(VERSION)
    .then(c => Promise.all(CORE.map(u => fetch(u, { cache: 'reload' }).then(r => r.ok && c.put(u, r)).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Fichiers du site : Internet d'abord, en demandant au serveur s'il y a plus récent (cache: 'no-cache'),
// pour que la page et le code soient toujours de la même version.
// Sans réponse en 4 secondes (ou hors ligne), on prend la copie gardée.
function networkFirst(req) {
  const url = req.url;
  return new Promise(resolve => {
    let done = false;
    const fallback = () => caches.match(req, { ignoreSearch: true })
      .then(r => r || caches.match('./index.html'))
      .then(r => { if (!done && r) { done = true; resolve(r); } return r; });
    const timer = setTimeout(fallback, 4000);
    fetch(url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
      clearTimeout(timer);
      if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      if (!done) { done = true; resolve(res); }
    }).catch(() => { clearTimeout(timer); fallback().then(r => { if (!done) { done = true; resolve(r || Response.error()); } }); });
  });
}

// Éditeur de formules (version figée) et polices : la copie gardée d'abord, mise à jour en arrière-plan.
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
