"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type PendingComment = {
  id: string;
  post_slug: string;
  display_name: string;
  body: string;
  created_at: string;
};

/**
 * Comment moderation queue for the dashboard. Rendered only for admin
 * profiles (the dashboard page checks profiles.is_admin server-side);
 * the database policies enforce the same rule, so this component is a
 * view, not the security boundary.
 */
export function ModerationQueue() {
  const [pending, setPending] = useState<PendingComment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const client = getSupabaseBrowser();
    if (!client) return;
    let mounted = true;
    client
      .from("comments")
      .select("id, post_slug, display_name, body, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (!mounted) return;
        if (fetchError) setError(fetchError.message);
        else setPending((data ?? []) as PendingComment[]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const act = async (id: string, status: "approved" | "rejected") => {
    const client = getSupabaseBrowser();
    if (!client) return;
    setBusyId(id);
    const { error: updateError } = await client
      .from("comments")
      .update({ status })
      .eq("id", id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPending((rows) => (rows ?? []).filter((row) => row.id !== id));
  };

  if (error) {
    return (
      <p role="alert" className="mt-4 text-sm font-medium">
        Could not load the moderation queue: {error}
      </p>
    );
  }
  if (pending === null) {
    return <p className="mt-4 text-ink-2">Loading pending comments…</p>;
  }
  if (pending.length === 0) {
    return (
      <p className="mt-4 max-w-prose leading-relaxed text-ink-2">
        Nothing waiting. New comments will appear here for approval before they show on a guide.
      </p>
    );
  }
  return (
    <ul className="mt-6 space-y-4">
      {pending.map((comment) => (
        <li key={comment.id} className="border border-line bg-card p-5">
          <p className="font-semibold">{comment.display_name}</p>
          <p className="mt-0.5 text-sm text-ink-3">
            On{" "}
            <Link href={`/${comment.post_slug}/`} className="link">
              {comment.post_slug}
            </Link>{" "}
            ·{" "}
            {new Date(comment.created_at).toLocaleString("en-NG", {
              day: "numeric",
              month: "long",
              hour: "numeric",
              minute: "2-digit",
              timeZone: "Africa/Lagos",
            })}
          </p>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-2">{comment.body}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busyId === comment.id}
              onClick={() => void act(comment.id, "approved")}
              className="btn btn-primary !py-2 !px-3 text-sm"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busyId === comment.id}
              onClick={() => void act(comment.id, "rejected")}
              className="btn btn-ghost !py-2 !px-3 text-sm"
            >
              Reject
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
