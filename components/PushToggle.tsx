"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/use-auth";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

type PushState = "checking" | "unsupported" | "unconfigured" | "off" | "on" | "denied";

/**
 * "Get notified about new guides" switch. Subscriptions live in the
 * push_subscriptions table; sending happens server-side (see
 * app/api/push/notify). Renders nothing useful — and says so — when the
 * browser has no push support or the VAPID key is not set yet, the same
 * graceful pattern Sprint 6 uses for unconfigured Supabase.
 */
export function PushToggle({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [state, setState] = useState<PushState>("checking");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        if (mounted) setState("unsupported");
        return;
      }
      if (!VAPID_PUBLIC_KEY) {
        if (mounted) setState("unconfigured");
        return;
      }
      if (Notification.permission === "denied") {
        if (mounted) setState("denied");
        return;
      }
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = registration ? await registration.pushManager.getSubscription() : null;
      if (mounted) setState(subscription ? "on" : "off");
    };
    // Deferred like the cookie banner: state updates stay out of the
    // synchronous effect body.
    const timer = setTimeout(() => {
      void check();
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const enable = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = subscription.toJSON();
      const client = getSupabaseBrowser();
      if (client && json.endpoint && json.keys?.p256dh && json.keys?.auth) {
        const { error } = await client.from("push_subscriptions").upsert(
          {
            user_id: user?.id ?? null,
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
            user_agent: navigator.userAgent.slice(0, 300),
          },
          { onConflict: "endpoint" },
        );
        if (error) throw new Error(error.message);
      }
      setState("on");
      setMessage("Notifications on. We will tell you when a new guide is published.");
    } catch {
      setMessage("Could not switch notifications on. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = registration ? await registration.pushManager.getSubscription() : null;
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        const client = getSupabaseBrowser();
        if (client) await client.from("push_subscriptions").delete().eq("endpoint", endpoint);
      }
      setState("off");
      setMessage("Notifications off.");
    } catch {
      setMessage("Could not switch notifications off. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (state === "checking" || state === "unsupported" || state === "unconfigured") {
    if (compact) return null;
    return (
      <p className="text-sm leading-relaxed text-ink-3">
        Browser notifications are not available on this device yet.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || state === "denied"}
          onClick={() => void (state === "on" ? disable() : enable())}
          aria-pressed={state === "on"}
          className={
            state === "on"
              ? "btn btn-primary !py-2 !px-3 text-sm"
              : "btn btn-ghost !py-2 !px-3 text-sm"
          }
        >
          {busy ? "Working…" : state === "on" ? "Notifications on" : "Get notified about new guides"}
        </button>
        {state === "denied" && (
          <span className="text-sm text-ink-2">
            Notifications are blocked in your browser settings.
          </span>
        )}
      </div>
      {message && <p className="mt-2 text-sm font-medium">{message}</p>}
    </div>
  );
}
