"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuth } from "@/lib/supabase/use-auth";

type CommentRow = {
  id: string;
  user_id: string | null;
  display_name: string;
  body: string;
  created_at: string;
};

const URL_PATTERN = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
const URL_TEST = /^(?:https?:\/\/\S+|www\.\S+)$/;

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

/**
 * Comment body as plain text with line breaks. Links are only clickable
 * for signed-in readers — guest comments render every URL as plain text
 * (the owner's anti link-farming rule). Nothing is ever injected as
 * HTML, so a comment cannot carry markup.
 */
function CommentBody({ body, signedIn }: { body: string; signedIn: boolean }) {
  return (
    <>
      {body.split("\n").map((line, i) => (
        <span key={i} className="block">
          {signedIn
            ? line.split(URL_PATTERN).map((part, j) =>
                URL_TEST.test(part) ? (
                  <a
                    key={j}
                    href={part.startsWith("www.") ? `https://${part}` : part}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="link font-medium"
                  >
                    {part}
                  </a>
                ) : (
                  <span key={j}>{part}</span>
                ),
              )
            : line || " "}
        </span>
      ))}
    </>
  );
}

/**
 * Article comments. The section renders a light placeholder until it
 * scrolls near the viewport, and only then fetches — article pages keep
 * their fast first paint. New comments go to the moderation queue and
 * appear only after an admin approves them.
 */
export function Comments({ slug }: { slug: string }) {
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const [started, setStarted] = useState(false);
  const [comments, setComments] = useState<CommentRow[] | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [guestName, setGuestName] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Remember when the form appeared (for the minimum fill-time check)
  // without calling Date.now() during render.
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  // Start loading when the section approaches the viewport.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setStarted(true), 0);
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const client = getSupabaseBrowser();
    if (!client) return;
    let mounted = true;
    client
      .from("comments")
      .select("id, user_id, display_name, body, created_at")
      .eq("post_slug", slug)
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (mounted) setComments((data ?? []) as CommentRow[]);
      });
    return () => {
      mounted = false;
    };
  }, [started, slug]);

  // A signed-in reader posts under their profile name.
  useEffect(() => {
    if (!user) return;
    const client = getSupabaseBrowser();
    if (!client) return;
    let mounted = true;
    client
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted) return;
        const fromProfile = (data?.display_name as string | null) ?? "";
        const fromMeta =
          typeof user.user_metadata?.display_name === "string"
            ? user.user_metadata.display_name
            : "";
        setProfileName(fromProfile || fromMeta);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    // Honeypot + minimum fill time: real readers take a few seconds.
    if (honeypot) return;
    if (Date.now() - (startedAtRef.current ?? 0) < 3000) {
      setError("Please take a moment to write your comment, then try again.");
      return;
    }
    const displayName = user ? profileName.trim() : guestName.trim();
    const text = body.trim();
    if (!displayName) {
      setError(user ? "Add a display name in your dashboard first." : "Please enter your name.");
      return;
    }
    if (text.length < 2) {
      setError("Please write a comment first.");
      return;
    }
    const client = getSupabaseBrowser();
    if (!client) {
      setError("Comments are not available yet. Please try again soon.");
      return;
    }
    setBusy(true);
    const { error: insertError } = await client.from("comments").insert({
      post_slug: slug,
      user_id: user?.id ?? null,
      guest_name: user ? null : displayName,
      display_name: displayName,
      body: text.slice(0, 2000),
      status: "pending",
    });
    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setBody("");
    setNotice("Thanks — your comment is awaiting moderation.");
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="comments-heading"
      className="mt-16 max-w-[68ch] border-t-2 border-ink pt-8"
    >
      <h2 id="comments-heading" className="text-lg font-bold tracking-[-0.02em]">
        Comments{comments && comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      {!isSupabaseConfigured() ? (
        <p className="mt-4 leading-relaxed text-ink-2">
          Comments are not switched on yet. Please check back soon.
        </p>
      ) : (
        <>
          {comments === null ? (
            <p className="mt-4 text-ink-2">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="mt-4 leading-relaxed text-ink-2">
              No comments yet. Be the first to share what you think.
            </p>
          ) : (
            <ul className="mt-6 space-y-6">
              {comments.map((comment) => (
                <li key={comment.id} className="border border-line bg-card p-5">
                  <p className="font-semibold">{comment.display_name}</p>
                  <p className="mt-0.5 text-sm text-ink-3">{formatWhen(comment.created_at)}</p>
                  <div className="mt-3 leading-relaxed text-ink-2">
                    <CommentBody body={comment.body} signedIn={Boolean(comment.user_id)} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={submit} className="mt-10 border border-line bg-card p-6">
            <p className="font-semibold">Leave a comment</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
              Comments are checked by a moderator before they appear.
              {user
                ? " Links in signed-in readers' comments are clickable."
                : " Post as a guest with your name, or sign in — links in signed-in readers' comments are clickable."}
            </p>
            {!user && (
              <div className="mt-5">
                <label htmlFor="comment-name" className="label">
                  Your name
                </label>
                <input
                  id="comment-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={80}
                  className="field"
                  placeholder="e.g. Adaeze O."
                  autoComplete="name"
                />
              </div>
            )}
            {user && (
              <p className="mt-4 text-sm text-ink-2">
                Posting as <strong className="text-ink">{profileName || "your account"}</strong>
              </p>
            )}
            <div className="mt-4">
              <label htmlFor="comment-body" className="label">
                Comment
              </label>
              <textarea
                id="comment-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={2000}
                rows={4}
                className="field"
                placeholder="What do you think?"
              />
            </div>
            {/* Honeypot: hidden from people, tempting to bots. */}
            <div aria-hidden className="hidden">
              <label>
                Website
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>
            {error && (
              <p role="alert" className="mt-4 text-sm font-medium">
                {error}
              </p>
            )}
            {notice && <p className="mt-4 text-sm font-medium">{notice}</p>}
            <button type="submit" disabled={busy} className="btn btn-primary mt-5 !py-2.5 text-sm">
              {busy ? "Sending…" : "Post comment"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
