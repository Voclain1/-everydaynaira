import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatDate, getAllDocPages, getAllPosts, getDocPage, getPost, postsInCategory, relatedPosts, type DocPage, type Post } from "@/lib/content";
import { TOPICS, topicByCategory, topicByHub, type Topic } from "@/lib/topics";
import { AUTHORS, absUrl, ogFor } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { IsoArt } from "@/components/IsoArt";
import { PostCard, PostCover } from "@/components/PostCard";
import { Toc } from "@/components/Toc";
import { JsonLd } from "@/components/JsonLd";
import { Arrow } from "@/components/Arrow";
import { NewsletterBand, NewsletterForm } from "@/components/Newsletter";
import { CalculatorEmbed } from "@/components/CalculatorEmbed";

/** Pages with their own dedicated route folder are excluded here. */
const DEDICATED = new Set(["authors"]);

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...getAllPosts().map((p) => ({ slug: p.slug })),
    ...getAllDocPages().filter((p) => !DEDICATED.has(p.slug)).map((p) => ({ slug: p.slug })),
    ...TOPICS.map((t) => ({ slug: t.hub.replaceAll("/", "") })),
  ];
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (post)
    return {
      title: post.title,
      description: post.description,
      alternates: { canonical: `/${slug}/` },
      openGraph: {
        type: "article",
        title: post.title,
        description: post.description,
        url: `/${slug}/`,
        publishedTime: post.date,
        modifiedTime: post.updated,
        authors: [absUrl("/authors/")],
        section: topicByCategory(post.category).name,
        tags: post.tags,
        images: [{ url: `/og/${slug}/`, width: 1200, height: 630, alt: post.title }],
      },
      twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [`/og/${slug}/`] },
    };
  const topic = topicByHub(slug);
  if (topic)
    return { title: `${topic.name} guides for Nigerians`, description: topic.metaDescription, alternates: { canonical: topic.hub }, ...ogFor(slug, `${topic.name} guides`) };
  const page = getDocPage(slug);
  if (page) return { title: page.title, description: page.description, alternates: { canonical: `/${slug}/` }, ...ogFor(slug, page.title) };
  return {};
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (post) return <PostView post={post} />;
  const topic = topicByHub(slug);
  if (topic) return <HubView topic={topic} />;
  const page = getDocPage(slug);
  if (page) return <DocView page={page} />;
  notFound();
}

/* ============================================================ */
/*                            POST                              */
/* ============================================================ */
function PostView({ post }: { post: Post }) {
  const topic = topicByCategory(post.category);
  const author = AUTHORS[post.author];
  const related = relatedPosts(post, 3);
  const updated = post.updated.slice(0, 10) !== post.date.slice(0, 10);
  const url = absUrl(`/${post.slug}/`);

  return (
    <article>
      <header className="border-b border-line">
        <div className="wrap pb-10 pt-8 md:pt-12">
          <Breadcrumbs items={[{ name: topic.name, href: topic.hub }, { name: post.title, href: `/${post.slug}/` }]} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-end">
            <div>
              <Link href={topic.hub} className="inline-flex items-center gap-2.5 text-[0.95rem] font-medium hover:underline underline-offset-4">
                <span className="marker" /> {topic.name}
              </Link>
              <h1 className="display mt-5 text-[clamp(2.3rem,5vw,4rem)] !leading-[1.02]">{post.title}</h1>
              {post.tagline && <p className="mt-6 max-w-[42rem] text-[1.2rem] leading-relaxed text-ink-2">{post.tagline}</p>}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-2">
                <Link href="/authors/" className="flex items-center gap-3 text-ink">
                  <span className="flex h-10 w-10 items-center justify-center bg-ink text-xs font-semibold text-lime">{author.initials}</span>
                  <span>
                    <span className="block font-semibold">{author.name}</span>
                    <span className="block text-ink-2">Founder and lead researcher</span>
                  </span>
                </Link>
                <span className="hidden h-8 w-px bg-line sm:block" aria-hidden />
                <span>
                  {updated ? "Updated " : "Published "}
                  <time dateTime={updated ? post.updated : post.date}>{formatDate(updated ? post.updated : post.date)}</time>
                </span>
                <span>{post.readingMinutes} min read</span>
                {post.reviewed && (
                  <Link href="/fact-checking-policy/" className="flex items-center gap-2 text-ink hover:underline underline-offset-4">
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8.5l3 3 7-7" /></svg>
                    Fact-checked <time dateTime={post.reviewed}>{formatDate(post.reviewed)}</time>
                  </Link>
                )}
              </div>
            </div>
            <PostCover post={post} priority aspect={4 / 3} className="aspect-[4/3] border border-ink bg-paper" />
          </div>
        </div>
      </header>

      <div className="wrap grid gap-12 py-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[15rem_minmax(0,1fr)_14rem]">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <Toc items={post.toc} />
          </div>
        </aside>

        <div className="min-w-0">
          {post.keyTakeaways.length > 0 && (
            <section aria-labelledby="takeaways" className="mb-12 max-w-[68ch] border border-ink bg-lime-wash p-6 sm:p-7">
              <h2 id="takeaways" className="text-lg font-bold tracking-[-0.02em]">Key takeaways</h2>
              <ul className="mt-4 space-y-3">
                {post.keyTakeaways.map((k, i) => (
                  <li key={i} className="grid grid-cols-[1.2rem_1fr] gap-2 leading-relaxed">
                    <span className="mt-2 h-2 w-2 border border-ink bg-lime" aria-hidden />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Mobile table of contents */}
          {post.toc.length > 2 && (
            <details className="mb-10 max-w-[68ch] border border-line bg-card lg:hidden">
              <summary className="cursor-pointer p-4 font-semibold">In this guide ({post.toc.length} sections)</summary>
              <ol className="border-t border-line px-4 py-3">
                {post.toc.map((t, i) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="grid grid-cols-[1.8rem_1fr] py-1.5 text-[0.95rem] text-ink-2 hover:text-ink">
                      <span className="font-mono text-xs leading-6 text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                      {t.text}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}

          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />

          {post.calculator && (
            <div className="mt-16">
              <p className="mb-4 flex items-center gap-3 font-medium"><span className="marker" /> Run your own numbers</p>
              <CalculatorEmbed id={post.calculator} />
            </div>
          )}

          {post.sources.length > 0 && (
            <section aria-labelledby="sources" className="mt-16 max-w-[68ch] border-t-2 border-ink pt-6">
              <h2 id="sources" className="text-lg font-bold tracking-[-0.02em]">Sources</h2>
              <ol className="mt-5 space-y-4">
                {post.sources.map((s, i) => (
                  <li key={i} className="grid grid-cols-[2rem_1fr] text-[0.95rem] leading-relaxed">
                    <span className="font-mono text-sm leading-relaxed text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      {s.publisher && <span className="block text-sm text-ink-3">{s.publisher}{s.date ? `, ${s.date}` : ""}</span>}
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline decoration-lime-deep decoration-2 underline-offset-[3px] hover:bg-lime-wash">
                          {s.title}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <span className="font-medium">{s.title}</span>
                      )}
                      {s.url && <span className="block truncate text-xs text-ink-3">{new URL(s.url).hostname.replace(/^www\./, "")}</span>}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-sm text-ink-3">
                Links checked {formatDate(post.reviewed ?? post.updated)}. Found something out of date? <Link href="/contact/" className="link">Tell us</Link> and we will check it against the source. Read our <Link href="/fact-checking-policy/" className="link">fact-checking policy</Link>.
              </p>
            </section>
          )}

          <section className="mt-12 grid max-w-[68ch] gap-5 border border-line bg-card p-6 sm:grid-cols-[3.5rem_1fr]">
            <span className="flex h-14 w-14 items-center justify-center bg-ink font-semibold text-lime">{author.initials}</span>
            <div>
              <p className="font-semibold">Written by {author.name}</p>
              <p className="mt-1.5 leading-relaxed text-ink-2">{author.bio}</p>
              <Link href="/authors/" className="link mt-2 inline-block text-sm font-medium">About the author</Link>
            </div>
          </section>

          <p className="mt-6 max-w-[68ch] text-sm leading-relaxed text-ink-3">
            This guide is educational and is not personalised financial advice. Fees, rates and rules change; confirm current details with your bank or the relevant regulator. <Link href="/disclaimer/" className="link">Disclaimer</Link>.
          </p>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-28 border border-ink bg-card p-5">
            <p className="font-semibold leading-snug">Get one practical money tip every week.</p>
            <p className="mt-2 text-sm text-ink-2">Free. No spam.</p>
            <div className="mt-4 [&_form>div]:!flex-col [&_button]:w-full">
              <NewsletterForm source={`post-${post.slug}`} />
            </div>
          </div>
        </aside>
      </div>

      <section className="border-t border-line bg-paper-2/60">
        <div className="wrap py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display text-[clamp(1.9rem,3.6vw,2.8rem)]">Keep reading</h2>
            <Link href={topic.hub} className="btn btn-ghost">All {topic.name.toLowerCase()} guides <Arrow /></Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `${url}#article`,
              headline: post.title,
              description: post.description,
              datePublished: post.date,
              dateModified: post.updated,
              mainEntityOfPage: url,
              url,
              image: absUrl(`/og/${post.slug}/`),
              articleSection: topic.name,
              keywords: post.focusKeyword || undefined,
              wordCount: post.plain.split(" ").length,
              citation: post.sources.filter((src) => src.url).map((src) => ({ "@type": "CreativeWork", name: src.title, url: src.url, publisher: src.publisher || undefined })),
              inLanguage: "en-NG",
              author: { "@type": "Person", name: author.name, url: absUrl(author.url), jobTitle: author.role },
              publisher: { "@id": absUrl("/#organization") },
              isPartOf: { "@id": absUrl("/#website") },
            },
            ...(post.faqs.length
              ? [
                  {
                    "@type": "FAQPage",
                    "@id": `${url}#faq`,
                    mainEntity: post.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
                  },
                ]
              : []),
          ],
        }}
      />
    </article>
  );
}

/* ============================================================ */
/*                          TOPIC HUB                           */
/* ============================================================ */
function HubView({ topic }: { topic: Topic }) {
  const posts = postsInCategory(topic.category);
  const featured = posts.find((p) => `/${p.slug}/` === topic.starters[0]?.href) ?? posts[0];
  const rest = posts.filter((p) => p !== featured);
  const others = TOPICS.filter((t) => t.hub !== topic.hub);

  return (
    <>
      <section className="gridlines border-b border-line">
        <div className="wrap grid gap-10 pb-14 pt-8 md:pt-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Breadcrumbs items={[{ name: topic.name, href: topic.hub }]} />
            <h1 className="display mt-10 text-[clamp(3rem,7vw,5.4rem)]">{topic.name}</h1>
            <p className="mt-6 max-w-xl text-[1.2rem] leading-relaxed text-ink-2">{topic.intro}</p>
            <p className="mt-6 text-sm text-ink-3">{posts.length} guides in this topic</p>
          </div>
          <IsoArt motif={topic.category} seed={topic.hub} background={null} grid={false} aspect={1.3} padding={0.08} className="hero-art aspect-[1.3] w-full" />
        </div>
      </section>

      <div className="wrap py-16 md:py-20">
        {topic.note && (
          <aside className={`mb-14 grid gap-3 p-6 sm:grid-cols-[12rem_1fr] sm:p-7 ${topic.note.tone === "warn" ? "bg-ink text-paper" : "border border-line bg-card"}`}>
            <p className="flex items-start gap-3 font-semibold"><span className={`marker mt-1 ${topic.note.tone === "warn" ? "!border-lime" : ""}`} />{topic.note.title}</p>
            <p className={`max-w-[65ch] leading-relaxed ${topic.note.tone === "warn" ? "text-paper/80" : "text-ink-2"}`}>{topic.note.body}</p>
          </aside>
        )}

        {featured && (
          <Link href={`/${featured.slug}/`} className="group grid border border-ink bg-card md:grid-cols-2 md:divide-x md:divide-ink">
            <PostCover post={featured} aspect={1.35} className="aspect-[1.35] self-center border-b border-ink md:border-b-0" />
            <div className="flex flex-col p-6 sm:p-10">
              <p className="text-sm text-ink-2">Start here in {topic.name.toLowerCase()}</p>
              <h2 className="mt-3 text-[clamp(1.7rem,3vw,2.4rem)] font-bold leading-[1.08] tracking-[-0.035em] group-hover:underline decoration-lime-deep decoration-[3px] underline-offset-[6px]">{featured.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-2">{featured.tagline || featured.description}</p>
              <span className="mt-auto flex items-center gap-2 pt-8 font-semibold">Read the guide <Arrow /></span>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold tracking-[-0.03em]">All {topic.name.toLowerCase()} guides</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}

        {topic.tool && (
          <section className="mt-16 grid gap-6 border border-ink bg-lime p-7 sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-[1.7rem] font-bold leading-tight tracking-[-0.035em]">{topic.tool.title}</h2>
              <p className="mt-2 max-w-xl text-lg leading-relaxed">{topic.tool.body}</p>
            </div>
            <Link href={`/tools/#${topic.tool.id}`} className="btn bg-ink text-lime hover:bg-card hover:text-ink">{topic.tool.cta} <Arrow /></Link>
          </section>
        )}

        <section className="mt-20 grid gap-8 border-t border-line pt-10 md:grid-cols-[1fr_2fr]">
          <h2 className="text-xl font-bold tracking-[-0.025em]">About this topic</h2>
          <p className="max-w-[65ch] text-lg leading-relaxed text-ink-2">{topic.description}</p>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-[-0.025em]">Related topics</h2>
          <ul className="mt-6 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-5">
            {others.map((t) => (
              <li key={t.hub} className="border-b border-r border-line">
                <Link href={t.hub} className="group block bg-card hover:bg-lime-wash">
                  <IsoArt motif={t.category} seed={t.hub} className="aspect-[16/10]" grid={false} background={null} />
                  <span className="flex items-center justify-between p-4 font-semibold">{t.name} <Arrow className="transition-transform group-hover:translate-x-1" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <NewsletterBand />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${topic.name} guides`,
          description: topic.metaDescription,
          url: absUrl(topic.hub),
          isPartOf: { "@id": absUrl("/#website") },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: posts.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(`/${p.slug}/`), name: p.title })),
          },
        }}
      />
    </>
  );
}

/* ============================================================ */
/*                     POLICY / ABOUT PAGES                     */
/* ============================================================ */
function DocView({ page }: { page: DocPage }) {
  return (
    <article>
      <header className="gridlines border-b border-line">
        <div className="wrap pb-14 pt-8 md:pt-12">
          <Breadcrumbs items={[{ name: page.title, href: `/${page.slug}/` }]} />
          <h1 className="display mt-10 max-w-4xl text-[clamp(2.6rem,6vw,4.6rem)]">{page.title}</h1>
          {page.intro && <p className="mt-6 max-w-2xl text-[1.2rem] leading-relaxed text-ink-2">{page.intro}</p>}
          {page.updated && (
            <p className="mt-6 text-sm text-ink-3">
              Last updated <time dateTime={page.updated}>{formatDate(page.updated)}</time>
            </p>
          )}
        </div>
      </header>
      <div className="wrap grid gap-12 py-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <Toc items={page.toc} title="On this page" />
          </div>
        </aside>
        <div className="prose" dangerouslySetInnerHTML={{ __html: page.html }} />
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": page.slug === "about-everydaynaira" ? "AboutPage" : "WebPage",
          name: page.title,
          description: page.description,
          url: absUrl(`/${page.slug}/`),
          isPartOf: { "@id": absUrl("/#website") },
          publisher: { "@id": absUrl("/#organization") },
        }}
      />
    </article>
  );
}

