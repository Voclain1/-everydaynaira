import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BudgetCalculator, EmergencyFundCalculator, LoanCalculator, SavingsGoalCalculator } from "@/components/Calculators";
import { JsonLd } from "@/components/JsonLd";
import { absUrl, ogFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free money calculators for Nigerians",
  description:
    "Free naira calculators: budget breakdown, emergency fund target, savings goal plan, and loan repayment with flat-rate vs reducing-balance comparison. No sign-up, nothing leaves your device.",
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
