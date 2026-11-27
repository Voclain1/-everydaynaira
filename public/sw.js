/* EverydayNaira service worker.
 *
 * Jobs:
 *  - Offline reading: pages the reader has already visited are kept in
 *    a runtime cache and served when the network is gone.
 *  - Push: show notifications for new guides and open the guide when
 *    the notification is tapped.
 *
 * Bump CACHE_VERSION whenever this file changes meaningfully; old
 * caches are deleted on activate.
 */
const CACHE_VERSION = "everydaynaira-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Pages: network first so news is fresh, falling back to the cached
  // copy of a page the reader has visited when offline.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGE_CACHE);
        try {
          const fresh = await fetch(request);
          if (fresh.ok) cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await cache.match(request);
          if (cached) return cached;
          const home = await cache.match("/");
          if (home) return home;
          throw new Error("offline and not cached");
        }
      })(),
    );
    return;
  }

  // Static assets: cache first, then network (and keep what we fetch).
  if (["script", "style", "image", "font"].includes(request.destination)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        if (fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      })(),
    );
  }
});

self.addEventListener("push", (event) => {
  let payload = { title: "EverydayNaira", body: "A new guide is out.", url: "/" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    if (event.data) payload.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  const absolute = new URL(target, self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windows) {
        if (client.url === absolute && "focus" in client) return client.focus();
      }
      for (const client of windows) {
        if ("navigate" in client) {
          await client.navigate(absolute);
          return client.focus();
        }
      }
      return self.clients.openWindow(absolute);
    })(),
  );
});
