// ============================================================
// sw.js — Service Worker de Le Filtre v2
// Rend l'app installable + utilisable hors-ligne (local-first).
// Bumper CACHE à chaque déploiement qui change un fichier listé.
// ============================================================

const CACHE = 'lefiltre-v2-2026-06-05';

// App shell servi en même-origine (chemins relatifs au scope).
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './app/db.jsx',
  './app/rituel.jsx',
  './app/capture.jsx',
  './app/chantiers.jsx',
  './app/produire.jsx',
  './app/app.jsx',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Navigations → réseau d'abord, repli sur l'index en cache (offline).
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  if (sameOrigin) {
    // Assets locaux (jsx, icônes) → cache d'abord, MAJ en arrière-plan.
    e.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Cross-origin (polices Google, CDN React/Babel/Dexie) → stale-while-revalidate.
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(req).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res && (res.status === 200 || res.type === 'opaque')) c.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    )
  );
});
