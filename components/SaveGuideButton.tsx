"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/use-auth";

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
      <Link href={`/sign-in/?next=/${slug}/`} className="btn btn-ghost !py-2.5 text-sm">
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
      className="btn btn-ghost !py-2.5 text-sm"
      aria-pressed={saved}
    >
      {saved ? "✓ Saved" : "Save this guide"}
    </button>
  );
}
