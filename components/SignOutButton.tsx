"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/** Signs the reader out and returns them to the homepage. */
export function SignOutButton({ className = "btn btn-ghost" }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    const client = getSupabaseBrowser();
    if (client) await client.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button type="button" onClick={signOut} disabled={busy} className={className}>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
