"use client";

import { useState } from "react";

/**
 * Share buttons for guides, tools and hub pages. The "Share" button uses
 * the Web Share API when the browser has it and falls back to copying the
 * link; WhatsApp, X and Facebook open their share pages. Uses the site's
 * existing button styles.
 */
export function ShareButtons({
  title,
  url,
  description,
  compact = false,
  label = "Share",
}: {
  title: string;
  url: string;
  description?: string;
  compact?: boolean;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text: description, url });
        return;
      } catch {
        // The reader closed the share sheet; stay on the page.
      }
    }
    await copyLink();
  };

  const shareText = encodeURIComponent(description ? `${title} — ${description}` : title);
  const shareUrl = encodeURIComponent(url);

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <button type="button" onClick={share} className="btn btn-ghost !py-2 text-sm">
        Share
      </button>
      <button type="button" onClick={copyLink} className="btn btn-ghost !py-2 text-sm">
        {copied ? "Link copied" : "Copy link"}
      </button>
      {!compact && (
        <>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost !py-2 text-sm"
          >
            WhatsApp
          </a>
          <a
            href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost !py-2 text-sm"
          >
            X
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost !py-2 text-sm"
          >
            Facebook
          </a>
        </>
      )}
    </div>
  );
}
