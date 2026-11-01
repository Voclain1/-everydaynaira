import Link from "next/link";
import type { Metadata } from "next";
import { ogFor } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with the EverydayNaira editorial team. For factual corrections, content questions, editorial enquiries, and partnership requests.",
  alternates: { canonical: "/contact/" },
  ...ogFor("contact", "Contact EverydayNaira"),
};

export default function Contact() {
  return (
    <>
      <section className="gridlines border-b border-line">
        <div className="wrap pb-12 pt-8 md:pt-12">
          <Breadcrumbs items={[{ name: "Contact", href: "/contact/" }]} />
          <h1 className="display mt-10 text-[clamp(2.8rem,6.4vw,5rem)]">Get in touch</h1>
          <p className="mt-6 max-w-2xl text-[1.2rem] leading-relaxed text-ink-2">
            A question about our content, a factual correction to flag, or a genuine editorial enquiry: we read every message and respond to those we can help with.
          </p>
        </div>
      </section>

      <div className="wrap grid gap-14 py-14 md:py-20 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <aside className="mb-10 border border-line bg-card p-6">
            <p className="flex items-center gap-3 font-semibold"><span className="marker" />Before you write</p>
            <p className="mt-2 leading-relaxed text-ink-2">
              We are a small editorial team, so we can’t offer one-on-one financial, legal, loan, or investment advice. If your question is about a money topic we cover, there’s a good chance a <Link href="/start-here/" className="link">guide already answers it</Link>.
            </p>
          </aside>
          <ContactForm />
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold tracking-[-0.025em]">What to expect</h2>
            <dl className="mt-5 space-y-5">
              {[
                ["Response time", "We aim to respond within 3–5 business days. We read every message but cannot guarantee a reply to all enquiries."],
                ["Factual corrections", "We take accuracy seriously. Please include the specific claim and the source supporting the correction. We investigate all credible corrections."],
                ["What we cannot help with", "Personalised financial advice, loan or investment enquiries, or legal and tax guidance."],
              ].map(([t, d]) => (
                <div key={t} className="border-t border-line pt-4">
                  <dt className="font-semibold">{t}</dt>
                  <dd className="mt-1 leading-relaxed text-ink-2">{d}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section>
            <h2 className="text-xl font-bold tracking-[-0.025em]">Other ways to find answers</h2>
            <ul className="mt-4">
              {[
                ["/start-here/", "Browse our guides by topic"],
                ["/tools/", "Use a free calculator"],
                ["/editorial-policy/", "Read our editorial policy"],
                ["/disclaimer/", "Read our disclaimer"],
              ].map(([h, l]) => (
                <li key={h} className="border-t border-line">
                  <Link href={h} className="block py-3 font-medium hover:bg-lime-wash">{l}</Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="bg-ink p-6 text-paper">
            <h2 className="font-semibold">For media enquiries</h2>
            <p className="mt-2 leading-relaxed text-paper/75">
              Journalists and researchers: choose “Editorial or media enquiry” in the form and include your publication and deadline.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
