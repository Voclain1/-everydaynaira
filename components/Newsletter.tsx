"use client";

import { useState } from "react";
import { Arrow } from "./Arrow";

export function NewsletterForm({ source = "site", dark = false }: { source?: string; dark?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("company")) return; // honeypot
    setState("sending");
    try {
      const res = await fetch("/api/subscribe/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email"), source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Subscription failed.");
      setState("done");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Subscription failed.");
    }
  }

  if (state === "done")
    return (
      <p role="status" className={`border px-4 py-4 font-medium ${dark ? "border-lime text-lime" : "border-ink bg-lime-wash"}`}>
        You're subscribed. The next issue lands in your inbox this week.
      </p>
    );

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`nl-${source}`} className="sr-only">Email address</label>
        <input
          id={`nl-${source}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={`field h-[3.25rem] flex-1 ${dark ? "!border-ink-2 !bg-ink !text-paper placeholder:text-ink-3" : ""}`}
        />
        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button type="submit" disabled={state === "sending"} className="btn btn-primary h-[3.25rem] justify-center disabled:opacity-60">
          {state === "sending" ? "Subscribing…" : "Subscribe"} <Arrow />
        </button>
      </div>
      {state === "error" && (
        <p role="alert" className={`mt-2 text-sm ${dark ? "text-lime" : "text-red-800"}`}>
          {msg} Check the address and try again.
        </p>
      )}
    </form>
  );
}

export function NewsletterBand() {
  return (
    <section id="newsletter" className="bg-ink text-paper">
      <div className="wrap grid gap-10 py-16 md:grid-cols-[1.1fr_1fr] md:items-end md:py-24">
        <div>
          <p className="flex items-center gap-3 text-sm text-paper/70">
            <span className="marker !border-lime" /> Free, every week
          </p>
          <h2 className="display mt-5 text-[clamp(2.2rem,5vw,3.75rem)]">Plain-English money tips, weekly.</h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-paper/70">
            One short email with a practical money idea, a new guide, or a charge worth checking. No spam, unsubscribe anytime.
          </p>
        </div>
        <NewsletterForm source="band" dark />
      </div>
    </section>
  );
}
