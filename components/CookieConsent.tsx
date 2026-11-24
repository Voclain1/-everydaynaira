"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "everydaynaira-cookie-consent";
export type ConsentChoice = "all" | "essential" | "rejected";
export const CONSENT_EVENT = "en-cookie-consent";
export const SETTINGS_EVENT = "en-cookie-settings";

export function getConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "all" || v === "essential" || v === "rejected" ? v : null;
}

/**
 * Cookie consent banner. Shows until the reader picks a choice, which is
 * stored on their device. Analytics and advertising scripts only load
 * after "Accept all" — see components/ThirdParty.tsx.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check consent after mount: reading localStorage during render would
    // differ between server and client, and setting state synchronously
    // inside an effect is not allowed. A zero-delay timer keeps the
    // check out of the synchronous effect body.
    const timer = setTimeout(() => {
      if (!getConsent()) setVisible(true);
    }, 0);
    const reopen = () => setVisible(true);
    window.addEventListener(SETTINGS_EVENT, reopen);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(SETTINGS_EVENT, reopen);
    };
  }, []);

  const choose = (c: ConsentChoice) => {
    window.localStorage.setItem(CONSENT_KEY, c);
    setVisible(false);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: c }));
  };

  if (!visible) return null;

  return (
    <div role="region" aria-label="Cookie consent" className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-card p-5 sm:p-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[62ch] leading-relaxed text-ink-2">
          We use cookies to understand how readers use EverydayNaira and, with your permission, to show adverts. Read our{" "}
          <Link href="/cookie-policy/" className="link font-medium text-ink">
            cookie policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={() => choose("all")} className="btn btn-primary !py-2.5 text-sm">
            Accept all
          </button>
          <button type="button" onClick={() => choose("essential")} className="btn btn-ghost !py-2.5 text-sm">
            Essential only
          </button>
          <button type="button" onClick={() => choose("rejected")} className="btn btn-ghost !py-2.5 text-sm">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer button that re-opens the banner so a reader can change their choice. */
export function CookieSettingsButton() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(SETTINGS_EVENT))} className="hover:text-ink hover:underline underline-offset-4">
      Cookie settings
    </button>
  );
}
