"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/content";

export function Toc({ items, title = "In this guide" }: { items: TocItem[]; title?: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [items]);

  if (items.length < 2) return null;
  return (
    <nav aria-label="Table of contents">
      <p className="text-sm font-semibold">{title}</p>
      <ol className="mt-3 border-l border-line">
        {items.map((i, n) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "true" : undefined}
              className="-ml-px grid grid-cols-[1.6rem_1fr] border-l-2 border-transparent py-1.5 pl-3 text-[0.9rem] leading-snug text-ink-2 hover:text-ink aria-[current=true]:border-ink aria-[current=true]:font-medium aria-[current=true]:text-ink"
            >
              <span className="font-mono text-xs leading-[1.4rem] text-ink-3">{String(n + 1).padStart(2, "0")}</span>
              <span>{i.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
