import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts, getPost, formatDate, type Post } from "@/lib/content";
import { TOPICS, topicByCategory } from "@/lib/topics";
import { Arrow } from "@/components/Arrow";
import { PostCard, PostCover } from "@/components/PostCard";
import { NewsletterBand } from "@/components/Newsletter";

export const metadata: Metadata = {
  title: { absolute: "EverydayNaira | Money Guides for Nigerians" },
  alternates: { canonical: "/" },
};

const NEW_SINCE = "2026-11-19";

const TOOLS = [
  { id: "budget-calculator", name: "Budget calculator", body: "Enter your income and see a suggested monthly breakdown based on your real expenses." },
  { id: "emergency-fund-calculator", name: "Emergency fund calculator", body: "Find out exactly how much you need to build a proper safety net for your situation." },
  { id: "savings-goal-calculator", name: "Savings goal calculator", body: "Set a goal, pick a timeline, and see how much to save each month to get there." },
  { id: "loan-calculator", name: "Loan calculator", body: "See the true cost of a loan before you sign: monthly repayment, total interest, and method." },
];

const BEGINNER = [
  "emergency-fund-nigeria",
  "how-to-create-a-monthly-budget-in-nigeria",
  "bank-charges-in-nigeria-explained",
  "how-loan-interest-works-in-nigeria",
  "online-scams-in-nigeria",
];

const LEAD_SLUG = "bank-transfer-failed-but-debited-in-nigeria";

const TOP_STORIES = [
  "atm-debited-but-no-cash-dispensed-in-nigeria",
  "how-to-budget-150000-to-250000-naira-salary-in-nigeria",
  "what-to-do-after-sending-money-to-an-online-scammer-in-nigeria",
];

const DONT_MISS = [
  "how-to-identify-fake-bank-customer-service-numbers-in-nigeria",
  "what-to-do-after-an-unauthorized-debit-in-nigeria",
  "how-to-report-loan-app-harassment-in-nigeria",
  "online-scams-in-nigeria",
];

// WSJ order: the most urgent / most-read sections first, then the rest.
const SECTION_ORDER = ["banking", "budgeting", "savings", "money-safety", "debt", "income"];

function contentType(post: Post): string {
  const tags = post.tags.map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes("how-to"))) return "How-to";
  if (tags.includes("explainer")) return "Explainer";
  return "Guide";
}

function isNew(post: Post): boolean {
  return post.date >= NEW_SINCE || post.updated >= NEW_SINCE;
}

function isUpdated(post: Post): boolean {
  return post.updated > post.date && !isNew(post);
}

function Meta({ post, showCategory = true }: { post: Post; showCategory?: boolean }) {
  const topic = topicByCategory(post.category);
  return (
    <p className="text-sm text-ink-2">
      <span className="font-semibold uppercase tracking-wide text-ink">{contentType(post)}</span>
      {showCategory ? (
        <>
          {" "}<span className="text-ink-3">/</span> {topic.name}
        </>
      ) : null}
      {" "}<span className="text-ink-3">/</span> {formatDate(post.updated)}
      {" "}<span className="text-ink-3">/</span> {post.readingMinutes} min read
      {isNew(post) ? (
        <>{" "}<span className="ml-1 inline-block border border-ink bg-lime px-1.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-ink">New</span></>
      ) : isUpdated(post) ? (
        <>{" "}<span className="ml-1 inline-block border border-line bg-card px-1.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-ink-2">Updated</span></>
      ) : null}
    </p>
  );
}

function HeadlineRow({ post }: { post: Post }) {
  return (
    <Link href={`/${post.slug}/`} className="group block border-t border-line py-5 first:border-t-0 first:pt-0">
      <Meta post={post} />
      <h3 className="mt-2 text-lg font-semibold leading-snug tracking-[-0.02em] group-hover:underline decoration-lime-deep decoration-2 underline-offset-4">
        {post.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-ink-2">{post.tagline || post.description}</p>
    </Link>
  );
}

function SectionHeading({ kicker, title, href, linkLabel }: { kicker: string; title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-t-2 border-ink pt-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-2">{kicker}</p>
        <h2 className="display mt-2 text-[clamp(1.8rem,3.6vw,2.6rem)]">{title}</h2>
      </div>
      <Link href={href} className="btn btn-ghost !py-2.5">
        {linkLabel} <Arrow />
      </Link>
    </div>
  );
}

export default function Home() {
  const posts = getAllPosts();
  const byUpdated = [...posts].sort((a, b) => +new Date(b.updated) - +new Date(a.updated));
  const lead = getPost(LEAD_SLUG) ?? byUpdated[0];
  const topStories = TOP_STORIES.map((s) => getPost(s)!).filter(Boolean);
  const dontMiss = DONT_MISS.map((s) => getPost(s)!).filter(Boolean);
  const latest = byUpdated.slice(0, 8);
  const beginner = BEGINNER.map((s) => getPost(s)!).filter(Boolean);
  const counts = Object.fromEntries(TOPICS.map((t) => [t.category, posts.filter((p) => p.category === t.category).length]));
  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });

  return (
    <>
      {/* ---------- Edition bar ---------- */}
      <section className="border-b border-line">
        <div className="wrap flex flex-wrap items-center justify-between gap-2 py-3 text-sm text-ink-2">
          <p>
            <span className="font-semibold text-ink">{today}</span>
            <span className="text-ink-3"> — </span>
            Lagos, Nigeria
          </p>
          <p className="font-mono text-[0.8rem]">
            {posts.length} guides <span className="text-ink-3">·</span> {TOPICS.length} sections{" "}
            <span className="text-ink-3">·</span> {TOOLS.length} calculators <span className="text-ink-3">·</span> Updated{" "}
            {formatDate(byUpdated[0]?.updated ?? lead.updated)}
          </p>
        </div>
      </section>

      {/* ---------- Front page: lead + top stories ---------- */}
      <section className="border-b border-line">
        <div className="wrap grid gap-10 py-10 md:py-14 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          <article>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-2">Top story — Banking</p>
            <Link href={`/${lead.slug}/`} className="group block">
              <PostCover post={lead} aspect={16 / 9} className="mt-4 aspect-[16/9] border border-ink" priority />
              <h1 className="display mt-6 text-[clamp(2.2rem,4.8vw,3.6rem)] group-hover:underline decoration-lime-deep decoration-[3px] underline-offset-[6px]">
                {lead.title}
              </h1>
              <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-2">{lead.tagline || lead.description}</p>
            </Link>
            <div className="mt-5">
              <Meta post={lead} />
            </div>
          </article>

          <aside aria-label="Top stories">
            <p className="border-t-2 border-ink pt-5 text-xs font-bold uppercase tracking-[0.18em]">Top stories</p>
            <div className="mt-2">
              {topStories.map((p) => (
                <HeadlineRow key={p.slug} post={p} />
              ))}
            </div>
            <Link href="/start-here/" className="btn btn-primary mt-6 w-full justify-center">
              Where do I start? <Arrow />
            </Link>
          </aside>
        </div>
      </section>

      {/* ---------- Don't miss: attention / urgent ---------- */}
      <section className="border-b border-line bg-paper-2/60">
        <div className="wrap py-10 md:py-12">
          <SectionHeading kicker="Attention" title="Don't miss" href="/money-safety/" linkLabel="All money safety" />
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {dontMiss.map((p) => (
              <article key={p.slug}>
                <Meta post={p} />
                <Link href={`/${p.slug}/`} className="group block">
                  <h3 className="mt-2 text-lg font-semibold leading-snug tracking-[-0.02em] group-hover:underline decoration-lime-deep decoration-2 underline-offset-4">
                    {p.title}
                  </h3>
                </Link>
                <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed text-ink-2">{p.tagline || p.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Latest: freshness first ---------- */}
      <section className="border-b border-line">
        <div className="wrap py-14 md:py-20">
          <SectionHeading kicker="Freshness" title="Latest" href="/guides/" linkLabel={`Browse all ${posts.length} guides`} />
          <div className="mt-8 grid gap-x-12 lg:grid-cols-2">
            {latest.map((p) => (
              <HeadlineRow key={p.slug} post={p} />
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-2">
            Ordered by last update, not just first publication — so a guide that was corrected or refreshed this week
            reads as fresh, even if it was first written in April.
          </p>
        </div>
      </section>

      {/* ---------- Sections by category ---------- */}
      {SECTION_ORDER.map((category) => {
        const topic = TOPICS.find((t) => t.category === category)!;
        const inCategory = byUpdated.filter((p) => p.category === category);
        const [featured, ...rest] = inCategory.filter((p) => p.slug !== lead.slug);
        if (!featured) return null;
        return (
          <section key={category} className="border-b border-line">
            <div className="wrap py-14 md:py-20">
              <SectionHeading
                kicker={`Section — ${counts[category]} guides`}
                title={topic.name}
                href={topic.hub}
                linkLabel={`All ${topic.name.toLowerCase()}`}
              />
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">{topic.summary}</p>
              <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
                <Link href={`/${featured.slug}/`} className="group block border border-ink bg-card">
                  <PostCover post={featured} aspect={16 / 9} className="aspect-[16/9] border-b border-ink" />
                  <div className="p-6 sm:p-8">
                    <Meta post={featured} showCategory={false} />
                    <h3 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-[1.1] tracking-[-0.035em] group-hover:underline decoration-lime-deep decoration-[3px] underline-offset-[6px]">
                      {featured.title}
                    </h3>
                    <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-2">{featured.tagline || featured.description}</p>
                  </div>
                </Link>
                <div>
                  {rest.slice(0, 3).map((p) => (
                    <HeadlineRow key={p.slug} post={p} />
                  ))}
                  <ul className="mt-2 border-t border-line pt-4">
                    {topic.starters.map((s) => (
                      <li key={s.href} className="py-1.5">
                        <Link href={s.href} className="text-[0.95rem] font-medium hover:bg-lime-wash">
                          {s.label} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ---------- Tools: compact utility strip ---------- */}
      <section className="border-b border-line">
        <div className="wrap py-14 md:py-16">
          <SectionHeading kicker="Tools" title="Calculators that help you plan" href="/tools/" linkLabel="All calculators" />
          <ul className="mt-8 grid border-l border-t border-ink sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((t) => (
              <li key={t.id} className="border-b border-r border-ink">
                <Link href={`/tools/#${t.id}`} className="group flex h-full flex-col p-6 transition-colors hover:bg-lime">
                  <span className="flex h-11 w-11 items-center justify-center border border-ink bg-card font-mono text-lg font-semibold">₦</span>
                  <h3 className="mt-6 text-xl font-bold tracking-[-0.03em]">{t.name}</h3>
                  <p className="mt-2 leading-relaxed text-ink-2 group-hover:text-ink">{t.body}</p>
                  <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold">
                    Open calculator <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-2">Free, in naira, and private. Your numbers stay on your device.</p>
        </div>
      </section>

      {/* ---------- Start here: relevance for new readers ---------- */}
      <section className="border-b border-line bg-paper-2/60">
        <div className="wrap py-14 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-2">New here?</p>
              <h2 className="display mt-2 text-[clamp(2rem,4vw,3rem)]">Start with these</h2>
            </div>
            <Link href="/start-here/" className="btn btn-ghost">
              See the full path <Arrow />
            </Link>
          </div>
          <div className="mt-10">
            {beginner.map((p) => (
              <PostCard key={p.slug} post={p} variant="row" />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Trust ---------- */}
      <section className="border-b border-line">
        <div className="wrap grid gap-10 py-14 md:grid-cols-[1fr_2fr] md:py-20">
          <h2 className="display text-[clamp(2rem,3.6vw,2.8rem)]">Written to be simple, honest, and useful.</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { t: "Official sources first", b: "Fees, rules and figures come from the CBN, NDIC, NIBSS, FIRS and the banks themselves.", href: "/fact-checking-policy/", l: "Fact-checking policy" },
              { t: "Education, not advice", b: "We explain your options clearly. The decision always stays with you.", href: "/disclaimer/", l: "Read the disclaimer" },
              { t: "Reviewed and updated", b: "Every guide is reviewed before publishing and corrected when rules change.", href: "/editorial-policy/", l: "Editorial policy" },
            ].map((x) => (
              <div key={x.t} className="border-t-2 border-ink pt-5">
                <h3 className="text-lg font-semibold tracking-[-0.02em]">{x.t}</h3>
                <p className="mt-2 leading-relaxed text-ink-2">{x.b}</p>
                <Link href={x.href} className="link mt-3 inline-block text-[0.95rem] font-medium">
                  {x.l}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}
