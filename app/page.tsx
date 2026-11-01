import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts, getPost } from "@/lib/content";
import { TOPICS } from "@/lib/topics";
import { IsoArt } from "@/components/IsoArt";
import { Arrow } from "@/components/Arrow";
import { PostCard, PostCover } from "@/components/PostCard";
import { NewsletterBand } from "@/components/Newsletter";

export const metadata: Metadata = {
  title: { absolute: "EverydayNaira - Practical money guidance for everyday Nigerians" },
  alternates: { canonical: "/" },
};

const BEGINNER = [
  "emergency-fund-nigeria",
  "how-to-create-a-monthly-budget-in-nigeria",
  "bank-charges-in-nigeria-explained",
  "how-loan-interest-works-in-nigeria",
  "online-scams-in-nigeria",
];

const TOOLS = [
  { id: "budget-calculator", name: "Budget calculator", body: "Enter your income and see a suggested monthly breakdown based on your real expenses." },
  { id: "emergency-fund-calculator", name: "Emergency fund calculator", body: "Find out exactly how much you need to build a proper safety net for your situation." },
  { id: "savings-goal-calculator", name: "Savings goal calculator", body: "Set a goal, pick a timeline, and see how much to save each month to get there." },
  { id: "loan-calculator", name: "Loan calculator", body: "See the true cost of a loan before you sign: monthly repayment, total interest, and method." },
];

export default function Home() {
  const posts = getAllPosts();
  const counts = Object.fromEntries(TOPICS.map((t) => [t.category, posts.filter((p) => p.category === t.category).length]));
  const beginner = BEGINNER.map((s) => getPost(s)!).filter(Boolean);
  const [lead, ...rest] = beginner;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="gridlines border-b border-line">
        <div className="wrap grid gap-12 pb-14 pt-12 md:pt-20 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:pb-20">
          <div className="flex flex-col">
            <p className="flex items-center gap-3 text-[0.95rem] font-medium">
              <span className="marker" /> Practical Nigerian personal finance
            </p>
            <h1 className="display mt-7 text-[clamp(3rem,7.4vw,5.6rem)]">
              Money made simpler for <span className="mark">everyday Nigerians.</span>
            </h1>
            <p className="mt-7 max-w-[34rem] text-[1.2rem] leading-relaxed text-ink-2">
              Clear, sourced guides on budgeting, saving, bank charges, loans and scams, written for how money actually moves in Nigeria.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/start-here/" className="btn btn-primary">
                Where do I start? <Arrow />
              </Link>
              <Link href="/tools/" className="btn btn-ghost">
                Try a calculator <Arrow />
              </Link>
            </div>
            <dl className="mt-auto grid grid-cols-3 gap-6 border-t border-line pt-7 max-lg:mt-12">
              <div>
                <dt className="sr-only">Guides</dt>
                <dd className="text-[2rem] font-bold tracking-[-0.04em] tabular-nums">{posts.length}</dd>
                <dd className="text-sm leading-snug text-ink-2">Practical guides, each one sourced</dd>
              </div>
              <div>
                <dt className="sr-only">Calculators</dt>
                <dd className="text-[2rem] font-bold tracking-[-0.04em] tabular-nums">{String(TOOLS.length).padStart(2, "0")}</dd>
                <dd className="text-sm leading-snug text-ink-2">Free calculators, no sign-up</dd>
              </div>
              <div>
                <dt className="sr-only">Topics</dt>
                <dd className="text-[2rem] font-bold tracking-[-0.04em] tabular-nums">{String(TOPICS.length).padStart(2, "0")}</dd>
                <dd className="text-sm leading-snug text-ink-2">Money topics, from budgets to scams</dd>
              </div>
            </dl>
          </div>

          <div>
            <IsoArt motif="hero" seed="home" background={null} grid={false} aspect={1.25} padding={0.05} className="hero-art mx-auto aspect-[1.25] w-full max-w-xl" />
            <ol className="mt-6 grid border-t border-line sm:grid-cols-2">
              {TOPICS.map((t, i) => (
                <li key={t.hub} className="border-b border-line sm:odd:border-r">
                  <Link href={t.hub} className="group flex items-center gap-4 px-1 py-3.5 hover:bg-lime-wash sm:px-4">
                    <span className="font-mono text-sm text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-medium group-hover:underline underline-offset-4">{t.name}</span>
                    <span className="ml-auto text-sm tabular-nums text-ink-3">{counts[t.category]} guides</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- Topics ---------- */}
      <section className="wrap py-20 md:py-28">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <h2 className="display text-[clamp(2.2rem,4.6vw,3.6rem)]">What do you want to understand?</h2>
          <p className="max-w-md text-lg leading-relaxed text-ink-2 md:justify-self-end">
            Pick the area that matches where you are right now. Every topic starts simple and goes as deep as you need.
          </p>
        </div>
        <ul className="mt-12 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => (
            <li key={t.hub} className="flex flex-col border-b border-r border-line bg-card">
              <Link href={t.hub} className="group block">
                <IsoArt motif={t.category} seed={t.hub} aspect={16 / 9} padding={0.12} className="aspect-[16/9] border-b border-line" />
                <div className="flex items-center justify-between px-6 pt-6">
                  <h3 className="text-2xl font-bold tracking-[-0.035em] group-hover:underline decoration-lime-deep decoration-[3px] underline-offset-[6px]">{t.name}</h3>
                  <Arrow className="transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
              <p className="px-6 pt-2 leading-relaxed text-ink-2">{t.summary}</p>
              <ul className="mt-auto px-6 pb-6 pt-5">
                {t.starters.map((s) => (
                  <li key={s.href} className="border-t border-line">
                    <Link href={s.href} className="block py-2.5 text-[0.95rem] hover:bg-lime-wash">{s.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Beginner guides ---------- */}
      <section className="border-y border-line bg-paper-2/60">
        <div className="wrap py-20 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="display text-[clamp(2.2rem,4.6vw,3.6rem)]">Start with these</h2>
            <Link href="/start-here/" className="btn btn-ghost">See the full path <Arrow /></Link>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
            {lead && (
              <Link href={`/${lead.slug}/`} className="group block border border-ink bg-card">
                <PostCover post={lead} aspect={16 / 9} className="aspect-[16/9] border-b border-ink" />
                <div className="p-6 sm:p-8">
                  <p className="text-sm text-ink-2">Most read first step</p>
                  <h3 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-[1.1] tracking-[-0.035em] group-hover:underline decoration-lime-deep decoration-[3px] underline-offset-[6px]">{lead.title}</h3>
                  <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-2">{lead.tagline}</p>
                </div>
              </Link>
            )}
            <div className="border-b border-line">
              {rest.map((p) => (
                <PostCard key={p.slug} post={p} variant="row" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Calculators ---------- */}
      <section className="wrap py-20 md:py-28">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <h2 className="display text-[clamp(2.2rem,4.6vw,3.6rem)]">Calculators that help you plan</h2>
          <p className="max-w-md text-lg leading-relaxed text-ink-2 md:justify-self-end">Free, in naira, and private. Your numbers stay on your device.</p>
        </div>
        <ul className="mt-12 grid border-l border-t border-ink sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((t) => (
            <li key={t.id} className="border-b border-r border-ink">
              <Link href={`/tools/#${t.id}`} className="group flex h-full flex-col p-6 transition-colors hover:bg-lime">
                <span className="flex h-11 w-11 items-center justify-center border border-ink bg-card font-mono text-lg font-semibold">₦</span>
                <h3 className="mt-8 text-xl font-bold tracking-[-0.03em]">{t.name}</h3>
                <p className="mt-2 leading-relaxed text-ink-2 group-hover:text-ink">{t.body}</p>
                <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold">Open calculator <Arrow /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Latest ---------- */}
      <section className="border-t border-line">
        <div className="wrap py-20 md:py-28">
          <h2 className="display text-[clamp(2.2rem,4.6vw,3.6rem)]">Latest guides</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 6).map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Trust ---------- */}
      <section className="border-t border-line">
        <div className="wrap grid gap-10 py-20 md:grid-cols-[1fr_2fr] md:py-24">
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
                <Link href={x.href} className="link mt-3 inline-block text-[0.95rem] font-medium">{x.l}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}
