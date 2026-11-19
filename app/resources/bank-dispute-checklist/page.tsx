import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BankDisputeChecklist } from "@/components/BankDisputeChecklist";
import { JsonLd } from "@/components/JsonLd";
import { NewsletterBand } from "@/components/Newsletter";
import { absUrl, ogFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free bank dispute evidence checklist and complaint letter (Nigeria)",
  description: "Free Nigerian bank complaint checklist: save transaction evidence, find a reference, request a reversal trace and copy a private complaint letter.",
  alternates: { canonical: "/resources/bank-dispute-checklist/" },
  ...ogFor("bank-dispute-checklist", "Free bank dispute checklist"),
};

export default function BankDisputeChecklistPage() {
  return (
    <>
      <section className="gridlines border-b border-line">
        <div className="wrap pb-14 pt-8 md:pb-20 md:pt-12">
          <Breadcrumbs items={[{ name: "Calculators & tools", href: "/tools/" }, { name: "Bank dispute checklist", href: "/resources/bank-dispute-checklist/" }]} />
          <p className="mt-9 flex items-center gap-3 font-medium"><span className="marker" /> Free printable resource</p>
          <h1 className="display mt-5 max-w-5xl text-[clamp(2.8rem,6vw,5rem)]">A better way to document a banking dispute.</h1>
          <p className="mt-7 max-w-3xl text-[1.2rem] leading-relaxed text-ink-2">
            Whether a transfer failed, an ATM dispensed no cash or a payment went to the wrong account, start with evidence and a formal complaint number. This free checklist helps you organise the facts.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-3">No sign-up. No account number, PIN, OTP or financial document upload requested.</p>
        </div>
      </section>
      <div className="wrap grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16 md:py-20">
        <div className="min-w-0">
          <BankDisputeChecklist />
        </div>
        <aside className="lg:pt-2">
          <div className="border-t-2 border-ink pt-5">
            <h2 className="text-lg font-bold">Choose the right guide</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed">
              <li><Link className="link" href="/bank-transfer-failed-but-debited-in-nigeria/">Debited but recipient not credited</Link></li>
              <li><Link className="link" href="/atm-debited-but-no-cash-dispensed-in-nigeria/">ATM debited but no cash</Link></li>
              <li><Link className="link" href="/how-to-reverse-money-sent-to-wrong-account-in-nigeria/">Money sent to wrong account</Link></li>
              <li><Link className="link" href="/what-to-do-after-an-unauthorized-debit-in-nigeria/">Unauthorised debit</Link></li>
              <li><Link className="link" href="/how-to-report-a-bank-to-cbn-in-nigeria/">Escalate a complaint to CBN</Link></li>
            </ul>
          </div>
          <div className="mt-9 border border-line bg-card p-5">
            <p className="font-semibold">Important limitation</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">A checklist cannot tell whether a transaction was fraudulent or compel a bank to reverse a successful transfer. Confirm current rules with the institution or regulator. Never share sensitive banking credentials.</p>
          </div>
        </aside>
      </div>
      <NewsletterBand />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Bank dispute evidence checklist for Nigerians",
        url: absUrl("/resources/bank-dispute-checklist/"),
        inLanguage: "en-NG",
        isAccessibleForFree: true,
        description: "A privacy-conscious checklist and sample complaint letter to help document Nigerian banking disputes.",
      }} />
    </>
  );
}
