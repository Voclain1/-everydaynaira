"use client";

import { useEffect, useRef, useState } from "react";

const DISMISS_KEY = "everydaynaira-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios/i.test(ua);
}

/**
 * A small, dismissible "Install EverydayNaira" prompt. Chromium fires
 * beforeinstallprompt, which we hold and replay on the button. iOS has
 * no such event, so iPhone/iPad Safari readers get a one-line Add to
 * Home Screen hint instead. Dismissal is remembered on the device,
 * following the cookie banner's localStorage pattern.
 */
export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (window.localStorage.getItem(DISMISS_KEY)) return;
    if (isStandalone()) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      deferredRef.current = event as BeforeInstallPromptEvent;
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS never fires the event; show the hint after a short delay,
    // set outside the synchronous effect body like the cookie banner.
    const timer = setTimeout(() => {
      if (isIosSafari() && !deferredRef.current) {
        setIosHint(true);
        setVisible(true);
      }
    }, 4000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    const deferred = deferredRef.current;
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    } else {
      dismiss();
    }
    deferredRef.current = null;
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Install EverydayNaira"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-card p-4 sm:p-5"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="leading-relaxed text-ink-2">
          <strong className="text-ink">Install EverydayNaira.</strong>{" "}
          {iosHint
            ? "Tap the Share button, then “Add to Home Screen”, to keep the guides one tap away."
            : "Keep the guides one tap away and read pages you have opened even without data."}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          {!iosHint && (
            <button type="button" onClick={() => void install()} className="btn btn-primary !py-2.5 text-sm">
              Install
            </button>
          )}
          <button type="button" onClick={dismiss} className="btn btn-ghost !py-2.5 text-sm">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
