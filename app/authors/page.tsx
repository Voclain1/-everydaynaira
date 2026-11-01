import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PostCard } from "@/components/PostCard";
import { getAllPosts } from "@/lib/content";
import { AUTHORS, absUrl, ogFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "Authors",
  description: "Meet the editor behind EverydayNaira and learn how the site approaches practical, trustworthy personal finance content for Nigerians.",
  alternates: { canonical: "/authors/" },
  ...ogFor("authors", "Who writes EverydayNaira"),
};

const EXPERTISE = ["Budgeting", "Saving", "Banking basics", "Debt explainers", "Salary management", "Everyday money decisions"];

export default function Authors() {
  const a = AUTHORS.benedict;
  const posts = getAllPosts().filter((p) => p.author === "benedict");
  return (
    <>
      <section className="gridlines border-b border-line">
        <div className="wrap pb-12 pt-8 md:pt-12">
          <Breadcrumbs items={[{ name: "Authors", href: "/authors/" }]} />
          <h1 className="display mt-10 text-[clamp(2.8rem,6.4vw,5rem)]">Who writes EverydayNaira</h1>
          <p className="mt-6 max-w-2xl text-[1.2rem] leading-relaxed text-ink-2">
            EverydayNaira is independently run and edited with a simple goal: to publish clear, practical money content Nigerians can actually use.
          </p>
        </div>
      </section>

      <div className="wrap py-14 md:py-20">
        <div className="max-w-[68ch] space-y-4 text-lg leading-relaxed text-ink-2">
          <p>EverydayNaira is not a large newsroom. It is an independent publication, with a strong focus on clarity, honesty, and useful financial explainers for everyday Nigerians.</p>
          <p>All content published on EverydayNaira is written, edited, and reviewed through one clear editorial process.</p>
          <p>Our content is educational, not personalised financial advice. The goal is to explain money topics clearly and responsibly, not to tell readers what financial decision to make.</p>
        </div>

        <section id="founder-editor" className="mt-14 grid border border-ink bg-card lg:grid-cols-[22rem_1fr]">
          <div className="flex flex-col justify-between gap-10 bg-ink p-8 text-paper">
            <p className="text-sm text-paper/60">Founder and editor</p>
            <div>
              <span className="flex h-24 w-24 items-center justify-center border-2 border-lime text-3xl font-bold text-lime">{a.initials}</span>
              <h2 className="mt-6 text-[2rem] font-bold leading-tight tracking-[-0.035em]">{a.name}</h2>
              <p className="mt-1 text-paper/70">{a.role}</p>
            </div>
          </div>
          <div className="p-8 sm:p-10">
            <div className="max-w-[65ch] space-y-4 text-[1.05rem] leading-relaxed text-ink-2">
              <p>{a.bio}</p>
              <p>The site was built to make everyday money topics easier to understand without jargon, pressure, or false promises. Instead of publishing content that sounds clever but leaves readers confused, EverydayNaira focuses on clear explanations, grounded examples, and practical guidance around budgeting, saving, banking, debt, salary management, and everyday financial decisions.</p>
              <p>As editor, Benedict researches, writes, and reviews content with a strong emphasis on clarity, source quality, and reader trust. The goal is not to sound like a financial adviser. The goal is to explain what matters, what to watch out for, and what readers need to understand before making their own decisions.</p>
              <p>EverydayNaira publishes educational content only. It does not provide personalised financial advice, legal advice, loan recommendations, or investment advice.</p>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Areas covered">
              {EXPERTISE.map((e) => (
                <li key={e} className="border border-line px-3 py-1.5 text-sm">{e}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="border border-line bg-card p-7">
            <h2 className="text-xl font-bold tracking-[-0.025em]">Editorial structure</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              EverydayNaira is independently run. Some content may be developed with the help of research tools and internal workflows, but all published articles are reviewed before publication and held to the same editorial standards.
            </p>
          </div>
          <div className="border border-line bg-card p-7">
            <h2 className="text-xl font-bold tracking-[-0.025em]">How content is handled</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              Topics are chosen for practical usefulness to Nigerian readers. Where relevant, we prioritise verifiable sources such as the CBN, NBS, EFInA, NDIC and primary documentation. The site does not invent statistics, fees, policies, or expertise.
            </p>
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem] font-medium">
              <Link href="/editorial-policy/" className="link">Editorial policy</Link>
              <Link href="/fact-checking-policy/" className="link">Fact-checking policy</Link>
              <Link href="/disclaimer/" className="link">Disclaimer</Link>
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">Guides by {a.name}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 6).map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absUrl("/authors/"),
          mainEntity: {
            "@type": "Person",
            "@id": absUrl("/authors/#founder-editor"),
            name: a.name,
            jobTitle: a.role,
            description: a.bio,
            worksFor: { "@id": absUrl("/#organization") },
            knowsAbout: EXPERTISE,
          },
        }}
      />
    </>
  );
}
