import { getAllPosts } from "@/lib/content";
import { SITE, absUrl } from "@/lib/site";
import { topicByCategory } from "@/lib/topics";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const items = getAllPosts()
    .map(
      (p) => `<item>
  <title>${esc(p.title)}</title>
  <link>${absUrl(`/${p.slug}/`)}</link>
  <guid isPermaLink="true">${absUrl(`/${p.slug}/`)}</guid>
  <pubDate>${new Date(p.date).toUTCString()}</pubDate>
  <category>${esc(topicByCategory(p.category).name)}</category>
  <description>${esc(p.description)}</description>
</item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${SITE.name}</title>
  <link>${absUrl("/")}</link>
  <description>${esc(SITE.description)}</description>
  <language>en-NG</language>
  <atom:link href="${absUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
