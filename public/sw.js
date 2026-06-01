const CACHE_NAME = 'gamers-genge-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://i.postimg.cc/mgH2J9Ly/1ced088596254ce6778c7ffe66534f37.jpg'
];

// Install: Cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up prior caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((allCaches) => {
      return Promise.all(
        allCaches.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Intercept to serve from cache when offline, otherwise fetch and cache
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Cache GET requests only
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip Firestore API endpoints, auth endpoints, and Vite dev server WebSockets
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('identitytoolkit') ||
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('ws') ||
    url.hostname === 'localhost' && url.port !== '3000'
  ) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        // Cache successful requests and cross-origin images (opaque response status 0)
        if (networkRes && (networkRes.status === 200 || networkRes.status === 0)) {
          const cacheCopy = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, cacheCopy);
          });
        }
        return networkRes;
      })
      .catch(() => {
        // If offline, check cache matches
        return caches.match(req).then((cachedRes) => {
          if (cachedRes) {
            return cachedRes;
          }

          // fallback for client-side navigation inside SPA
          if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html') || caches.match('/');
          }
        });
      })
  );
});
