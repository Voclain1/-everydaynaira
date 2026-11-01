import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { IsoArt } from "@/components/IsoArt";
import { Arrow } from "@/components/Arrow";
import { NewsletterBand } from "@/components/Newsletter";
import { JsonLd } from "@/components/JsonLd";
import { absUrl, ogFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start here: a clear path through the basics",
  description:
    "New to EverydayNaira? Follow six steps through budgeting, emergency funds, bank charges, borrowing and scams, in the order that makes most sense for Nigerians starting from scratch.",
  alternates: { canonical: "/start-here/" },
  ...ogFor("start-here", "Start here"),
};

const STEPS = [
  {
    title: "Understand where your money actually goes",
    body: "Before you can plan, you need clarity. Most people are surprised when they honestly track their spending for a month. Bank charges, small daily purchases, and irregular costs add up more than expected.",
    links: [
      { label: "How to create a budget", href: "/how-to-create-a-monthly-budget-in-nigeria/" },
      { label: "Bank charges explained", href: "/bank-charges-in-nigeria-explained/" },
    ],
  },
  {
    title: "Build a small emergency fund first",
    body: "Even ₦20,000–₦50,000 set aside changes your financial stress level significantly. It means a flat tyre, a medical expense, or a slow month does not immediately become a crisis. Start small. Build up over time.",
    links: [
      { label: "Emergency fund guide", href: "/emergency-fund-nigeria/" },
      { label: "Emergency fund calculator", href: "/tools/#emergency-fund-calculator" },
    ],
  },
  {
    title: "Set up a simple monthly budget",
    body: "A budget is not about restriction. It is about deciding in advance how your money gets used, rather than finding out at the end of the month where it all went. It does not need to be perfect on day one.",
    links: [
      { label: "Monthly budget guide", href: "/how-to-create-a-monthly-budget-in-nigeria/" },
      { label: "Budget calculator", href: "/tools/#budget-calculator" },
    ],
  },
  {
    title: "Learn what your bank is actually charging you",
    body: "Transfer fees, SMS charges, card maintenance fees, and account management fees are common. Many people do not notice them individually, but they reduce your account balance steadily across a full year.",
    links: [
      { label: "Bank charges explained", href: "/bank-charges-in-nigeria-explained/" },
      { label: "Transfer fees guide", href: "/bank-charges-nigeria/" },
    ],
  },
  {
    title: "Understand debt before you borrow",
    body: "If you are considering a loan — salary advance, fintech loan, or bank loan — learn how interest is calculated first. The stated rate alone does not tell you the full cost of what you are taking on.",
    links: [
      { label: "How loan interest works", href: "/how-loan-interest-works-in-nigeria/" },
      { label: "Warning signs in loan offers", href: "/signs-of-dangerous-loan-offers-every-nigerian-should-know/" },
    ],
  },
  {
    title: "Protect yourself from scams and fraud",
    body: "Money scams in Nigeria are common, sophisticated, and often disguised as helpful financial offers. Knowing what to look for is one of the most practical things you can do for your financial safety.",
    links: [
      { label: "Common money scams", href: "/online-scams-in-nigeria/" },
      { label: "What to do after an unauthorized debit", href: "/what-to-do-after-an-unauthorized-debit-in-nigeria/" },
    ],
  },
];

export default function StartHere() {
  return (
    <>
      <section className="gridlines border-b border-line">
        <div className="wrap grid gap-10 pb-14 pt-8 md:pt-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <Breadcrumbs items={[{ name: "Start here", href: "/start-here/" }]} />
            <h1 className="display mt-10 text-[clamp(2.8rem,6.4vw,5rem)]">Start here: a clear path through the basics</h1>
            <p className="mt-6 max-w-xl text-[1.2rem] leading-relaxed text-ink-2">
              This website covers budgeting, saving, banking, debt, income, and money safety. Here is the order that makes the most sense for most people starting from scratch.
            </p>
          </div>
          <IsoArt motif="savings" seed="start-here" background={null} grid={false} aspect={1.3} className="hero-art aspect-[1.3] w-full" />
        </div>
      </section>

      <div className="wrap py-16 md:py-20">
        <aside className="grid gap-3 border border-line bg-card p-6 sm:grid-cols-[12rem_1fr] sm:p-7">
          <p className="flex items-start gap-3 font-semibold"><span className="marker mt-1" />Who this guide is for</p>
          <p className="max-w-[65ch] leading-relaxed text-ink-2">
            If you are looking to manage your salary more effectively, build savings on a limited income, or better understand bank charges and loan offers, this guide will help you identify where to begin and what to prioritise first.
          </p>
        </aside>

        <ol className="mt-14">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid gap-6 border-t border-ink py-10 md:grid-cols-[7rem_1fr_18rem] md:gap-10">
              <span className="display text-[4rem] tabular-nums text-ink/90 md:text-[5rem]">{i + 1}</span>
              <div>
                <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-tight tracking-[-0.035em]">{s.title}</h2>
                <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-ink-2">{s.body}</p>
              </div>
              <ul className="self-end">
                {s.links.map((l) => (
                  <li key={l.href} className="border-t border-line">
                    <Link href={l.href} className="group flex items-center justify-between gap-3 py-3 font-medium hover:bg-lime-wash">
                      {l.label} <Arrow className="shrink-0 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <NewsletterBand />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Start here: a clear path through the basics of personal finance in Nigeria",
          url: absUrl("/start-here/"),
          step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body, url: absUrl(s.links[0].href) })),
        }}
      />
    </>
  );
}
