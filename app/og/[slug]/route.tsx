import { getAllDocPages, getAllPosts, getDocPage, getPost } from "@/lib/content";
import { TOPICS, topicByCategory, topicByHub } from "@/lib/topics";
import { ogImage } from "@/lib/og";

/** Social share images, served at /og/<slug>/ as 1200×630 PNGs. */
export const dynamic = "force-static";
export const dynamicParams = false;

const EXTRA: Record<string, { title: string; kicker: string }> = {
  home: { title: "Money made simpler for everyday Nigerians.", kicker: "Practical Nigerian personal finance" },
  "start-here": { title: "Start here: a clear path through the basics", kicker: "Start here" },
  tools: { title: "Free money calculators for Nigerians", kicker: "Calculators" },
  contact: { title: "Get in touch", kicker: "Contact" },
};

export function generateStaticParams() {
  return [
    ...Object.keys(EXTRA),
    ...getAllPosts().map((p) => p.slug),
    ...getAllDocPages().map((p) => p.slug),
    ...TOPICS.map((t) => t.hub.replaceAll("/", "")),
  ].map((slug) => ({ slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (post) return ogImage({ title: post.title, kicker: topicByCategory(post.category).name, motif: post.category, seed: post.slug });
  const topic = topicByHub(slug);
  if (topic) return ogImage({ title: `${topic.name} guides for everyday Nigerians`, kicker: "Topic", motif: topic.category, seed: topic.hub });
  const extra = EXTRA[slug];
  if (extra) return ogImage({ ...extra, motif: slug === "tools" ? "budgeting" : "hero", seed: slug });
  const page = getDocPage(slug);
  return ogImage({ title: page?.title ?? "EverydayNaira", kicker: "EverydayNaira", motif: "hero", seed: slug });
}
