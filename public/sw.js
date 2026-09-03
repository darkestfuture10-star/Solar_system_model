/*
 * sw.js — intentionally tiny service worker.
 *
 * STRATEGY: cache-first with network fallback, runtime caching.
 *   · fetch  → serve from cache if present, else network (and cache it)
 *   · activate → delete every old cache version
 *
 * WHY RUNTIME (no precache list)? Vite hashes asset filenames on every
 * build, so a static precache list would need tooling (vite-plugin-pwa).
 * Runtime caching needs no list: whatever you visit gets cached.
 *
 * ⚠ WHEN YOU SHIP AN UPDATE: bump CACHE_VERSION below. Old clients keep
 *   serving the old bundle until the new version activates — for a
 *   learning demo that's fine, for real products use vite-plugin-pwa.
 *
 * Registered from src/main.tsx, production builds only.
 */

const CACHE_VERSION = "orrery-v1";

self.addEventListener("install", () => {
  // don't wait for old tabs to close
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // only same-origin GETs; let everything else hit the network directly
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const hit = await cache.match(request);
      if (hit) return hit;
      try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      } catch (err) {
        // offline and never seen before: fall back to the cached app shell
        const shell = await cache.match("/index.html");
        if (shell) return shell;
        throw err;
      }
    })
  );
});
