"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Shared email + password form for /sign-in and /sign-up, plus the
 * Google sign-in button. The button is wired to Supabase OAuth, but it
 * stays inert until the Google provider is enabled in the Supabase
 * dashboard with a Google Cloud OAuth client.
 */
export function AuthForm({ mode, next }: { mode: "sign-in" | "sign-up"; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <p className="mt-6 border border-line bg-paper-2 p-4 text-sm leading-relaxed text-ink-2">
        Accounts are not set up yet — we are still connecting the sign-in service. Please check back
        soon.
      </p>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const client = getSupabaseBrowser();
    if (!client) return;
    setBusy(true);
    if (mode === "sign-in") {
      const { error } = await client.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push(next);
      router.refresh();
    } else {
      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: displayName ? { display_name: displayName } : undefined,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      setSent(true);
    }
  };

  const signInWithGoogle = async () => {
    const client = getSupabaseBrowser();
    if (!client) return;
    setError("");
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  if (sent) {
    return (
      <div className="mt-6">
        <p className="font-semibold">Check your email</p>
        <p className="mt-2 leading-relaxed text-ink-2">
          We sent a confirmation link to <strong>{email}</strong>. Click it to finish creating your
          account.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button type="button" onClick={signInWithGoogle} className="btn w-full justify-center bg-card">
        Continue with Google
      </button>
      <div className="my-6 flex items-center gap-3 text-sm text-ink-3" aria-hidden>
        <span className="h-px flex-1 bg-line" /> or with email{" "}
        <span className="h-px flex-1 bg-line" />
      </div>
      <form onSubmit={submit} className="space-y-5">
        {mode === "sign-up" && (
          <div>
            <label htmlFor="display-name" className="label">
              Your name (optional)
            </label>
            <input
              id="display-name"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="field"
              placeholder="e.g. Adaeze O."
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            placeholder="At least 6 characters"
          />
        </div>
        {error && (
          <p className="text-sm text-red-800" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center">
          {busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
