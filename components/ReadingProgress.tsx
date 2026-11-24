"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/use-auth";

/**
 * Thin progress bar pinned to the top of the viewport while reading an
 * article. When a reader is signed in, the position is also recorded
 * (throttled) to their reading history, so the dashboard can show
 * "continue reading". Guests are never recorded.
 */
export function ReadingProgress({ slug }: { slug?: string }) {
  const [width, setWidth] = useState(0);
  const { user } = useAuth();
  const progressRef = useRef(0);
  const lastSavedRef = useRef<{ at: number; progress: number }>({ at: 0, progress: -1 });

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;
    const update = () => {
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const done = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const pct = total > 0 ? (done / total) * 100 : 100;
      progressRef.current = pct;
      setWidth(pct);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!slug || !user) return;
    const client = getSupabaseBrowser();
    if (!client) return;
    const save = (final = false) => {
      const progress = Math.round(progressRef.current);
      const last = lastSavedRef.current;
      if (progress === last.progress) return;
      const now = Date.now();
      const bigJump = Math.abs(progress - last.progress) >= 5 || progress >= 95;
      if (!final && !bigJump) return;
      if (!final && last.progress !== -1 && now - last.at < 15000) return;
      lastSavedRef.current = { at: now, progress };
      void client
        .from("reading_history")
        .upsert({ user_id: user.id, slug, progress }, { onConflict: "user_id,slug" });
    };
    const onScroll = () => save(false);
    const onHide = () => save(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [slug, user]);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden>
      <div className="h-full bg-lime-deep transition-[width] duration-100" style={{ width: `${width}%` }} />
    </div>
  );
}
