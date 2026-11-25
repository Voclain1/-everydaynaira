"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/use-auth";

export type CalculatorId = "budget" | "emergency-fund" | "savings-goal" | "loan";

/**
 * "Save this result" for the calculators. Signed-in readers store a
 * snapshot in their account; everyone else is pointed at sign-in. It
 * always renders, even before Supabase is configured.
 * `summary` is one human-readable line shown on the dashboard.
 */
export function SaveCalculatorResult({
  calculator,
  inputs,
  results,
  summary,
}: {
  calculator: CalculatorId;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  summary: string;
}) {
  const { loading, user } = useAuth();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (loading) return null;
  if (!user) {
    return (
      <p className="text-sm text-ink-2">
        <Link href="/sign-in/?next=/tools/" className="link font-medium text-ink">
          Sign in
        </Link>{" "}
        to save this result to your account.
      </p>
    );
  }

  const save = async () => {
    const client = getSupabaseBrowser();
    if (!client || state === "saving") return;
    setState("saving");
    const { error } = await client.from("calculator_snapshots").insert({
      user_id: user.id,
      calculator,
      inputs,
      results: { ...results, summary },
    });
    setState(error ? "error" : "saved");
  };

  if (state === "saved") {
    return (
      <p className="text-sm font-medium">
        Saved to your account — see it on your{" "}
        <Link href="/dashboard/" className="link">
          dashboard
        </Link>
        .
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={save}
        disabled={state === "saving"}
        className="btn btn-ghost !py-2.5 text-sm"
      >
        {state === "saving" ? "Saving…" : "Save this result"}
      </button>
      {state === "error" && (
        <p className="mt-2 text-sm text-red-800">Could not save — please try again.</p>
      )}
    </div>
  );
}
