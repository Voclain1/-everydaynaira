import type { MetadataRoute } from "next";
import { getAllDocPages, getAllPosts } from "@/lib/content";
import { TOPICS } from "@/lib/topics";
import { absUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  // The newest published article is not necessarily the most recently updated.
  const latest = posts.reduce<string | undefined>(
    (max, p) => (!max || Date.parse(p.updated) > Date.parse(max) ? p.updated : max),
    undefined,
  );
  const topicLastModified = (category: string) =>
    posts.reduce<string | undefined>(
      (max, p) => p.category === category && (!max || Date.parse(p.updated) > Date.parse(max)) ? p.updated : max,
      undefined,
    );
  return [
    { url: absUrl("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: absUrl("/start-here/"), changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/tools/"), changeFrequency: "monthly", priority: 0.8 },
    ...TOPICS.map((t) => ({
      url: absUrl(t.hub),
      lastModified: topicLastModified(t.category),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: absUrl(`/${p.slug}/`),
      lastModified: p.updated,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      // Image sitemap should reference the real article image, not its social preview.
      images: p.image ? [absUrl(p.image)] : undefined,
    })),
    { url: absUrl("/contact/"), changeFrequency: "yearly", priority: 0.3 },
    { url: absUrl("/authors/"), changeFrequency: "yearly", priority: 0.4 },
    ...getAllDocPages()
      .filter((p) => p.slug !== "authors")
      .map((p) => ({ url: absUrl(`/${p.slug}/`), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
