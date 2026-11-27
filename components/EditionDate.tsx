"use client";

import { useEffect, useState } from "react";

function lagosToday(): string {
  return new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

/**
 * The homepage edition date. The server renders the build-time date as
 * a fallback (so there is no layout shift and the line is never empty),
 * then the reader's browser replaces it with today's date in Lagos —
 * the printed edition no longer goes stale between deploys.
 */
export function EditionDate({ fallback }: { fallback: string }) {
  const [today, setToday] = useState(fallback);

  useEffect(() => {
    // Set outside the synchronous effect body, like the cookie banner:
    // computing during render would differ between server and client.
    const timer = setTimeout(() => setToday(lagosToday()), 0);
    return () => clearTimeout(timer);
  }, []);

  return <span className="font-semibold text-ink">{today}</span>;
}
