"use client";

import { useState } from "react";
import { Arrow } from "./Arrow";

const REASONS = [
  "I found a factual error in an article",
  "I have a question about something in an article",
  "I have a content topic suggestion",
  "Editorial or media enquiry",
  "Partnership or sponsorship enquiry",
  "Technical issue on the site",
  "Other",
];

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (data.company) return;
    setState("sending");
    try {
      const res = await fetch("/api/contact/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || "Your message could not be sent.");
      setState("sent");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Your message could not be sent.");
    }
  }

  if (state === "sent")
    return (
      <div role="status" className="border border-ink bg-lime-wash p-8">
        <p className="text-2xl font-bold tracking-[-0.03em]">Message sent.</p>
        <p className="mt-2 text-lg text-ink-2">We aim to reply within 3–5 business days.</p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="c-first" className="label">First name</label>
          <input id="c-first" name="firstName" required autoComplete="given-name" className="field" />
        </div>
        <div>
          <label htmlFor="c-last" className="label">Last name</label>
          <input id="c-last" name="lastName" required autoComplete="family-name" className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="c-email" className="label">Email address</label>
        <input id="c-email" name="email" type="email" required autoComplete="email" className="field" />
        <p className="mt-1.5 text-sm text-ink-3">We only use this to reply. We never add you to a mailing list without your consent.</p>
      </div>
      <div>
        <label htmlFor="c-reason" className="label">Reason for contact</label>
        <select id="c-reason" name="reason" required defaultValue="" className="field">
          <option value="" disabled>Select a reason</option>
          {REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="c-url" className="label">Article URL <span className="font-normal text-ink-3">(if relevant)</span></label>
        <input id="c-url" name="url" type="url" placeholder="https://everydaynaira.com/…" className="field" />
      </div>
      <div>
        <label htmlFor="c-msg" className="label">Your message</label>
        <textarea id="c-msg" name="message" required rows={7} className="field resize-y" />
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state === "error" && <p role="alert" className="font-medium text-red-800">{error} You can also email ben@everydaynaira.com directly.</p>}
      <button type="submit" disabled={state === "sending"} className="btn btn-primary disabled:opacity-60">
        {state === "sending" ? "Sending…" : "Send message"} <Arrow />
      </button>
    </form>
  );
}
