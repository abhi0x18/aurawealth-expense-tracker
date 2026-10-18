// AuraWealth Service Worker for PWA Installation and Asset Caching
const CACHE_NAME = "aurawealth-v1.0.0";
const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/login",
  "/manifest.json",
  "/icons/icon.svg",
  "/images/cashflow-hero.jpg"
];

// Install: precache critical shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("Pre-caching non-fatal warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up outdated cache buckets
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first for API routes, cache-first for static media
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Always use network for API requests and mutations
  if (url.pathname.startsWith("/api/") || event.request.method !== "GET") {
    return;
  }

  // Network-first with cache fallback for pages and static assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/");
          }
        });
      })
  );
});
