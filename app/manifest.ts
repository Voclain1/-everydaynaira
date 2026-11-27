import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Web app manifest: the PWA groundwork for the EverydayNaira app.
 * Icons: the site only ships an SVG icon today, so the manifest points
 * at it; PNG icons at 192px and 512px are a follow-up (binary files
 * cannot be added through the current tooling).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f3f2ed",
    theme_color: "#f3f2ed",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
