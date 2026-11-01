import type { MetadataRoute } from "next";
import { getAllDocPages, getAllPosts } from "@/lib/content";
import { TOPICS } from "@/lib/topics";
import { absUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latest = posts[0]?.updated ?? new Date().toISOString();
  return [
    { url: absUrl("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: absUrl("/start-here/"), changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/tools/"), changeFrequency: "monthly", priority: 0.8 },
    ...TOPICS.map((t) => ({
      url: absUrl(t.hub),
      lastModified: posts.find((p) => p.category === t.category)?.updated ?? latest,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: absUrl(`/${p.slug}/`),
      lastModified: p.updated,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [absUrl(`/og/${p.slug}/`)],
    })),
    { url: absUrl("/contact/"), changeFrequency: "yearly", priority: 0.3 },
    { url: absUrl("/authors/"), changeFrequency: "yearly", priority: 0.4 },
    ...getAllDocPages()
      .filter((p) => p.slug !== "authors")
      .map((p) => ({ url: absUrl(`/${p.slug}/`), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
