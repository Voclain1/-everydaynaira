import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BudgetCalculator, EmergencyFundCalculator, LoanCalculator, SavingsGoalCalculator } from "@/components/Calculators";
import { JsonLd } from "@/components/JsonLd";
import { ShareButtons } from "@/components/ShareButtons";
import { absUrl, ogFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Budget, Savings & Loan Calculators",
  description:
    "Calculate budgets, emergency savings, savings goals and loan repayments in naira. Four free Nigerian money tools, no sign-up required.",
  alternates: { canonical: "/tools/" },
  ...ogFor("tools", "Money calculators"),
};

const LIST = [
  ["budget-calculator", "Budget"],
  ["emergency-fund-calculator", "Emergency fund"],
  ["savings-goal-calculator", "Savings goal"],
  ["loan-calculator", "Loan"],
];

export default function Tools() {
  return (
    <>
      <section className="gridlines border-b border-line">
        <div className="wrap pb-12 pt-8 md:pt-12">
          <Breadcrumbs items={[{ name: "Calculators", href: "/tools/" }]} />
          <h1 className="display mt-10 max-w-4xl text-[clamp(2.8rem,6.4vw,5rem)]">Quick calculators for everyday money decisions</h1>
          <p className="mt-6 max-w-2xl text-[1.2rem] leading-relaxed text-ink-2">
            Four simple tools to help you budget, save, and borrow more clearly. No sign-up needed. All figures stay on your device.
          </p>
          <div className="mt-8">
            <ShareButtons
              title="Free Budget, Savings & Loan Calculators"
              url={absUrl("/tools/")}
              description="Calculate budgets, emergency savings, savings goals and loan repayments in naira."
            />
          </div>
          <nav aria-label="Calculators" className="mt-10 flex flex-wrap gap-2">
            {LIST.map(([id, l], i) => (
              <a key={id} href={`#${id}`} className="flex items-center gap-3 border border-ink bg-card px-4 py-2.5 font-medium hover:bg-lime">
                <span className="font-mono text-sm text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                {l}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="wrap space-y-10 py-14 md:py-20">
        <BudgetCalculator n={1} />
        <EmergencyFundCalculator n={2} />
        <SavingsGoalCalculator n={3} />
        <LoanCalculator n={4} />
        <section className="border border-ink bg-card p-6 sm:p-8">
          <p className="flex items-center gap-3 font-medium"><span className="marker" /> Free printable resource</p>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.025em]">Bank transfer dispute checklist</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">Save the important evidence, ask for the right transaction reference and copy a complaint letter without entering any personal banking details on our website.</p>
          <Link href="/resources/bank-dispute-checklist/" className="btn btn-ghost mt-6">Open free evidence checklist</Link>
        </section>

        <aside className="border-t-2 border-ink pt-6">
          <h2 className="font-bold">Disclaimer</h2>
          <p className="mt-2 max-w-[75ch] leading-relaxed text-ink-2">
            These calculators are for educational purposes only. Results are estimates based on the figures you enter and standard calculation methods. They do not account for all possible fees, taxes, or individual circumstances. Always verify figures directly with your bank, lender, or financial institution before making a decision. EverydayNaira does not offer personalised financial advice. <Link href="/disclaimer/" className="link">Read the full disclaimer</Link>.
          </p>
        </aside>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "EverydayNaira money calculators",
          itemListElement: LIST.map(([id, l], i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: { "@type": "WebApplication", name: `${l} calculator`, url: absUrl(`/tools/#${id}`), applicationCategory: "FinanceApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "NGN" } },
          })),
        }}
      />
    </>
  );
}
