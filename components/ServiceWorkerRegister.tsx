"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (public/sw.js) in production only. The
 * worker powers offline reading of pages already visited and receives
 * push notifications. Development stays worker-free so hot reloads are
 * never served stale files.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // A failed registration only means no offline/push extras.
    });
  }, []);
  return null;
}
