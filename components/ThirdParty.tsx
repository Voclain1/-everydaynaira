"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, getConsent, type ConsentChoice } from "./CookieConsent";

/**
 * Loads Google Analytics and AdSense only after the reader has chosen
 * "Accept all" in the cookie consent banner. With no consent — or with
 * "Essential only" / "Reject" — no tracking or advertising script loads.
 */
export function ThirdParty() {
  const [consent, setConsent] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    const read = () => setConsent(getConsent());
    read();
    window.addEventListener(CONSENT_EVENT, read);
    return () => window.removeEventListener(CONSENT_EVENT, read);
  }, []);

  if (consent !== "all") return null;

  const ga = process.env.NEXT_PUBLIC_GA_ID;
  const ads = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  return (
    <>
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`}</Script>
        </>
      )}
      {ads && (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}
