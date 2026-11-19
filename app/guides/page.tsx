import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import { TOPICS } from "@/lib/topics";
import { PostCard } from "@/components/PostCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NewsletterBand } from "@/components/Newsletter";
import { JsonLd } from "@/components/JsonLd";
import { absUrl, ogFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "All guides: practical Nigerian money articles",
  description: "Browse every EverydayNaira money guide in one place. Find practical answers on budgeting, savings, bank transfers, loans, income and avoiding scams.",
  alternates: { canonical: "/guides/" },
  ...ogFor("guides", "All money guides"),
};

export default function GuidesIndex() {
  const posts = getAllPosts();
  const counts = Object.fromEntries(TOPICS.map((topic) => [
    topic.category,
    posts.filter((post) => post.category === topic.category).length,
  ]));

  return (
    <>
      <section className="gridlines border-b border-line">
        <div className="wrap pb-14 pt-8 md:pb-20 md:pt-12">
          <Breadcrumbs items={[{ name: "All guides", href: "/guides/" }]} />
          <div className="mt-10 max-w-4xl">
            <p className="flex items-center gap-3 font-medium"><span className="marker" /> The EverydayNaira library</p>
            <h1 className="display mt-5 text-[clamp(2.8rem,6vw,5rem)]">Every money guide, in one place.</h1>
            <p className="mt-6 max-w-2xl text-[1.2rem] leading-relaxed text-ink-2">
              Browse all {posts.length} published articles on everyday finances in Nigeria, from resolving bank transfers to planning rent, saving and understanding loans.
            </p>
          </div>
        </div>
      </section>

      <div className="wrap py-14 md:py-20">
        <section aria-labelledby="browse-topics-heading">
          <h2 id="browse-topics-heading" className="text-xl font-bold tracking-[-0.025em]">Explore by topic</h2>
          <nav aria-label="Browse guides by topic" className="mt-5 flex flex-wrap gap-2.5">
            {TOPICS.map((topic) => (
              <Link key={topic.hub} href={topic.hub} className="inline-flex items-center gap-2 border border-line bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-ink hover:bg-lime-wash">
                {topic.name} <span className="font-mono text-ink-3">{counts[topic.category]}</span>
              </Link>
            ))}
          </nav>
        </section>

        <section aria-labelledby="all-guides-heading" className="mt-14 md:mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
            <h2 id="all-guides-heading" className="display text-[clamp(2rem,4vw,3rem)]">All {posts.length} guides</h2>
            <p className="text-sm text-ink-2">Newest first · Every published article</p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </div>
      <NewsletterBand />

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": absUrl("/guides/") + "#collection",
        name: "EverydayNaira money guides",
        url: absUrl("/guides/"),
        inLanguage: "en-NG",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: posts.length,
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: post.title,
            url: absUrl(`/${post.slug}/`),
          })),
        },
      }} />
    </>
  );
}
