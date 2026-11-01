import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { ThirdParty } from "@/components/ThirdParty";
import { SITE, absUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} - ${SITE.tagline}`, template: `%s - ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/", types: { "application/rss+xml": [{ url: "/feed.xml", title: SITE.name }] } },
  openGraph: { type: "website", siteName: SITE.name, locale: SITE.locale, images: [{ url: "/og/home/", width: 1200, height: 630, alt: SITE.tagline }] },
  twitter: { card: "summary_large_image", images: ["/og/home/"] },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
};

export const viewport: Viewport = { themeColor: "#F3F2ED" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-lime focus:px-4 focus:py-2">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": absUrl("/#organization"),
                name: SITE.name,
                alternateName: SITE.legalName,
                url: absUrl("/"),
                logo: absUrl("/icon.svg"),
                email: SITE.email,
              },
              {
                "@type": "WebSite",
                "@id": absUrl("/#website"),
                url: absUrl("/"),
                name: SITE.name,
                publisher: { "@id": absUrl("/#organization") },
                inLanguage: "en-NG",
              },
            ],
          }}
        />
        <ThirdParty />
      </body>
    </html>
  );
}
