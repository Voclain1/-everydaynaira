import type { NextConfig } from "next";
import linkFixes from "./lib/legacy-link-fixes.json";
import legacyIds from "./lib/legacy-ids.json";

/**
 * Every URL from the WordPress site keeps working:
 *  - posts and pages render at the same /slug/ paths (trailing slash kept)
 *  - WordPress-only URLs (categories, authors, feeds, Rank Math sitemaps, ?p= links)
 *    301 to their new equivalents
 *  - internal links that were broken on the old site now point to the right guide
 */
const CATEGORY_TO_HUB: Record<string, string> = {
  budgeting: "/budgeting/",
  savings: "/saving/",
  banking: "/banking/",
  debt: "/debt/",
  income: "/income/",
  "money-safety": "/money-safety/",
  uncategorized: "/",
};

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      ...Object.entries(CATEGORY_TO_HUB).flatMap(([cat, hub]) => [
        { source: `/category/${cat}`, destination: hub, permanent: true },
        { source: `/category/${cat}/page/:n`, destination: hub, permanent: true },
      ]),
      { source: "/author/:name", destination: "/authors/", permanent: true },
      { source: "/author/:name/page/:n", destination: "/authors/", permanent: true },
      { source: "/tag/:tag", destination: "/", permanent: true },
      { source: "/page/:n", destination: "/", permanent: true },
      { source: "/feed", destination: "/feed.xml", permanent: true },
      { source: "/comments/feed", destination: "/feed.xml", permanent: true },
      { source: "/:slug/feed", destination: "/:slug/", permanent: true },
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/:type(post|page|category|local|author)-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/sitemap", destination: "/sitemap.xml", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      ...Object.entries(legacyIds as Record<string, string>).flatMap(([id, dest]) => [
        { source: "/", has: [{ type: "query" as const, key: "p", value: id }], destination: dest, permanent: true },
        { source: "/", has: [{ type: "query" as const, key: "page_id", value: id }], destination: dest, permanent: true },
      ]),
      ...Object.entries(linkFixes as Record<string, string>).map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
