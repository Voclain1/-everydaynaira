"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/use-auth";

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const pillBase =
  "inline-flex min-h-[40px] select-none items-center gap-2 rounded-full px-4 text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-deep";

/**
 * Save / unsave a guide. Signed-out readers get a sign-in prompt instead.
 * The button always renders, even before Supabase is configured — it just
 * cannot save anything until the sign-in service is connected.
 */
export function SaveGuideButton({ slug }: { slug: string }) {
  const { loading, user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const client = getSupabaseBrowser();
    if (!client) return;
    client
      .from("saved_guides")
      .select("slug")
      .eq("user_id", user.id)
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted) setSaved(Boolean(data));
      });
    return () => {
      mounted = false;
    };
  }, [user, slug]);

  if (loading) return null;
  if (!user) {
    return (
      <Link
        href={`/sign-in/?next=/${slug}/`}
        className={`${pillBase} border border-ink/60 text-ink hover:bg-ink hover:text-paper`}
      >
        <BookmarkIcon filled={false} />
        Save this guide
      </Link>
    );
  }

  const toggle = async () => {
    const client = getSupabaseBrowser();
    if (!client || busy) return;
    setBusy(true);
    if (saved) {
      await client.from("saved_guides").delete().eq("user_id", user.id).eq("slug", slug);
      setSaved(false);
    } else {
      await client
        .from("saved_guides")
        .upsert({ user_id: user.id, slug }, { onConflict: "user_id,slug" });
      setSaved(true);
    }
    setBusy(false);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={
        saved
          ? `${pillBase} border border-lime-deep/50 bg-lime text-ink shadow-sm hover:bg-lime-deep/70 disabled:opacity-60`
          : `${pillBase} border border-ink/60 text-ink hover:bg-ink hover:text-paper disabled:opacity-60`
      }
      aria-pressed={saved}
    >
      <BookmarkIcon filled={saved} />
      {saved ? "Saved" : "Save this guide"}
    </button>
  );
}
