"use client";

import { useEffect, useState } from "react";

/** Thin progress bar pinned to the top of the viewport while reading an article. */
export function ReadingProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;
    const update = () => {
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const done = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      setWidth(total > 0 ? (done / total) * 100 : 100);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden>
      <div className="h-full bg-lime-deep transition-[width] duration-100" style={{ width: `${width}%` }} />
    </div>
  );
}
