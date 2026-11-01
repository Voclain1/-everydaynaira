"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

const naira = (n: number) =>
  Number.isFinite(n) ? "₦" + Math.round(n).toLocaleString("en-NG") : "—";

function parseMoney(s: string) {
  const n = Number(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function MoneyInput({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-ink-2">₦</span>
        <input
          id={id}
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, "");
            onChange(digits ? Number(digits).toLocaleString("en-NG") : "");
          }}
          className="field !pl-8 font-medium tabular-nums"
          placeholder="0"
        />
      </div>
      {hint && <p className="mt-1.5 text-sm text-ink-3">{hint}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22><path d=%22M2 4l4 4 4-4%22 fill=%22none%22 stroke=%22%231A2329%22 stroke-width=%221.6%22/></svg>')] bg-[length:12px] bg-[right_0.9rem_center] bg-no-repeat pr-9">
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </div>
  );
}

function Stat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`border-t border-ink/15 py-3.5 ${strong ? "" : ""}`}>
      <p className="text-sm text-ink-2">{label}</p>
      <p className={`mt-0.5 font-semibold tabular-nums tracking-[-0.03em] ${strong ? "text-[2.1rem] leading-tight" : "text-xl"}`}>{value}</p>
    </div>
  );
}

function Shell({ id, title, intro, children, result, related, n }: { id: string; title: string; intro: string; children: React.ReactNode; result: React.ReactNode; related: { href: string; label: string }[]; n: number }) {
  return (
    <section id={id} className="@container scroll-mt-24 border border-ink bg-card">
      <div className="grid @3xl:grid-cols-[1.15fr_1fr]">
        <div className="p-6 sm:p-8">
          {n > 0 && <p className="font-mono text-sm text-ink-3">{String(n).padStart(2, "0")}</p>}
          <h2 className="mt-2 text-[1.8rem] font-bold leading-tight tracking-[-0.035em]">{title}</h2>
          <p className="mt-2 max-w-prose text-ink-2">{intro}</p>
          <div className="mt-7 space-y-5">{children}</div>
        </div>
        <div className="flex flex-col border-t border-ink bg-lime-wash p-6 sm:p-8 @3xl:border-l @3xl:border-t-0" aria-live="polite">
          {result}
          <div className="mt-auto pt-8">
            <p className="text-sm font-semibold">Read next</p>
            <ul className="mt-2 space-y-1.5">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="link text-[0.95rem]">{r.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Budget ---------------- */
const BUDGET_DEFAULTS = [
  ["Housing / rent", 30],
  ["Food & groceries", 20],
  ["Transport", 10],
  ["Utilities & data", 8],
  ["Savings", 15],
  ["Family & others", 10],
] as const;

export function BudgetCalculator({ n = 1 }: { n?: number }) {
  const [income, setIncome] = useState("250,000");
  const [pcts, setPcts] = useState<number[]>(BUDGET_DEFAULTS.map((d) => d[1]));
  const inc = parseMoney(income);
  const total = pcts.reduce((a, b) => a + b, 0);
  const over = total > 100;

  return (
    <Shell
      n={n}
      id="budget-calculator"
      title="Budget calculator"
      intro="Enter your monthly take-home pay and adjust each share to match your real life. The bar shows where every naira goes."
      related={[
        { href: "/how-to-create-a-monthly-budget-in-nigeria/", label: "How to create a monthly budget" },
        { href: "/5030-20-budget-rule-for-nigerians/", label: "The 50/30/20 rule in Nigeria" },
        { href: "/budgeting/", label: "All budgeting guides" },
      ]}
      result={
        <div>
          <p className="text-sm font-semibold">Your monthly plan</p>
          <div className="mt-4 flex h-4 w-full overflow-hidden border border-ink bg-card" aria-hidden>
            {pcts.map((p, i) => (
              <div key={i} style={{ width: `${(Math.min(p, 100) / Math.max(total, 100)) * 100}%` }} className={i === 4 ? "bg-lime" : i % 2 ? "bg-ink/80" : "bg-ink/30"} />
            ))}
          </div>
          <ul className="mt-4">
            {BUDGET_DEFAULTS.map(([name], i) => (
              <li key={name} className="flex justify-between border-t border-ink/15 py-2 text-[0.95rem] tabular-nums">
                <span>{name}</span>
                <span className="font-semibold">{naira((inc * pcts[i]) / 100)}</span>
              </li>
            ))}
          </ul>
          <Stat label={over ? "Over-allocated by" : "Left unallocated"} value={naira(Math.abs(inc * (100 - total)) / 100)} strong />
          {over && <p className="text-sm font-medium text-red-800">Your shares add up to {total}%. Reduce one category until the total is 100% or less.</p>}
        </div>
      }
    >
      <MoneyInput label="Monthly income after tax" value={income} onChange={setIncome} />
      <fieldset>
        <legend className="label">Share of income, in percent <span className="font-normal text-ink-3">(total {total}%)</span></legend>
        <div className="mt-2 space-y-4">
          {BUDGET_DEFAULTS.map(([name], i) => (
            <div key={name} className="grid grid-cols-[1fr_3.5rem] items-center gap-4">
              <label className="text-[0.95rem]">
                <span className="mb-1.5 block">{name}</span>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={pcts[i]}
                  onChange={(e) => setPcts((p) => p.map((v, j) => (j === i ? Number(e.target.value) : v)))}
                  className="w-full accent-ink"
                />
              </label>
              <span className="text-right font-semibold tabular-nums">{pcts[i]}%</span>
            </div>
          ))}
        </div>
      </fieldset>
    </Shell>
  );
}

/* ---------------- Emergency fund ---------------- */
export function EmergencyFundCalculator({ n = 2 }: { n?: number }) {
  const [exp, setExp] = useState("150,000");
  const [saved, setSaved] = useState("");
  const [months, setMonths] = useState("3");
  const [contrib, setContrib] = useState("25,000");

  const r = useMemo(() => {
    const target = parseMoney(exp) * Number(months);
    const remaining = Math.max(0, target - parseMoney(saved));
    const c = parseMoney(contrib);
    const time = remaining === 0 ? 0 : c > 0 ? Math.ceil(remaining / c) : NaN;
    return { target, remaining, time, pct: target ? Math.min(100, (parseMoney(saved) / target) * 100) : 0 };
  }, [exp, saved, months, contrib]);

  return (
    <Shell
      n={n}
      id="emergency-fund-calculator"
      title="Emergency fund calculator"
      intro="Find out how much you need as a safety net, based on what you must spend each month to keep life running."
      related={[
        { href: "/emergency-fund-nigeria/", label: "How to build an emergency fund in Nigeria" },
        { href: "/where-to-keep-your-savings-in-nigeria/", label: "Where to keep your savings" },
        { href: "/saving/", label: "All saving guides" },
      ]}
      result={
        <div>
          <p className="text-sm font-semibold">Your emergency fund target</p>
          <Stat label="Target amount" value={naira(r.target)} strong />
          <div className="mb-3 h-2 w-full border border-ink bg-card" aria-hidden>
            <div className="h-full bg-ink" style={{ width: `${r.pct}%` }} />
          </div>
          <Stat label="Still to save" value={naira(r.remaining)} />
          <Stat
            label="Time to reach your target"
            value={r.time === 0 ? "Already there" : Number.isNaN(r.time) ? "Add a monthly amount" : `${r.time} month${r.time === 1 ? "" : "s"}${r.time >= 12 ? ` (${(r.time / 12).toFixed(1)} yrs)` : ""}`}
          />
        </div>
      }
    >
      <MoneyInput label="Monthly essential expenses" value={exp} onChange={setExp} hint="Rent, food, transport, utilities, school fees, loan repayments." />
      <MoneyInput label="Amount already saved (optional)" value={saved} onChange={setSaved} />
      <Select
        label="Months of cover"
        value={months}
        onChange={setMonths}
        options={[["1", "1 month (starter fund)"], ["3", "3 months (recommended minimum)"], ["4", "4 months"], ["6", "6 months (irregular income)"], ["9", "9 months"], ["12", "12 months"]]}
      />
      <MoneyInput label="What you can save each month (optional)" value={contrib} onChange={setContrib} />
    </Shell>
  );
}

/* ---------------- Savings goal ---------------- */
export function SavingsGoalCalculator({ n = 3 }: { n?: number }) {
  const [goal, setGoal] = useState("1,000,000");
  const [saved, setSaved] = useState("");
  const [months, setMonths] = useState("12");
  const [rate, setRate] = useState("0");

  const r = useMemo(() => {
    const g = parseMoney(goal), s = parseMoney(saved), nm = Number(months), i = Number(rate) / 100 / 12;
    const fvSaved = s * Math.pow(1 + i, nm);
    const need = Math.max(0, g - fvSaved);
    const monthly = need === 0 ? 0 : i === 0 ? need / nm : (need * i) / (Math.pow(1 + i, nm) - 1);
    const contributed = monthly * nm + s;
    return { monthly, remaining: Math.max(0, g - s), interest: Math.max(0, g - contributed), nm };
  }, [goal, saved, months, rate]);

  return (
    <Shell
      n={n}
      id="savings-goal-calculator"
      title="Savings goal calculator"
      intro="Set a target and a deadline. See exactly how much to put aside each month to get there."
      related={[
        { href: "/what-are-sinking-funds-and-how-do-you-use-them-in-nigeria/", label: "Sinking funds explained" },
        { href: "/how-to-save-money-in-nigeria-as-a-salary-earner-practical-guide/", label: "How to save on a salary" },
        { href: "/saving/", label: "All saving guides" },
      ]}
      result={
        <div>
          <p className="text-sm font-semibold">Your savings plan</p>
          <Stat label="Save each month" value={naira(r.monthly)} strong />
          <Stat label="Amount still to save" value={naira(r.remaining)} />
          <Stat label="Interest earned along the way" value={naira(r.interest)} />
          <Stat label="Timeframe" value={`${r.nm} months`} />
        </div>
      }
    >
      <MoneyInput label="Savings goal" value={goal} onChange={setGoal} hint="Rent, school fees, a laptop, a wedding, a business start-up." />
      <MoneyInput label="Amount already saved (optional)" value={saved} onChange={setSaved} />
      <Select
        label="Timeframe"
        value={months}
        onChange={setMonths}
        options={[["3", "3 months"], ["6", "6 months"], ["9", "9 months"], ["12", "12 months (1 year)"], ["18", "18 months"], ["24", "24 months (2 years)"], ["36", "36 months (3 years)"], ["60", "60 months (5 years)"]]}
      />
      <Select
        label="Expected interest rate per year"
        value={rate}
        onChange={setRate}
        options={[["0", "0% (unsure, or kept in cash)"], ["4", "4% (basic savings account)"], ["8", "8%"], ["12", "12% (target savings plan)"], ["16", "16%"], ["20", "20% (high-yield fintech, check the terms)"]]}
      />
    </Shell>
  );
}

/* ---------------- Loan ---------------- */
export function LoanCalculator({ n = 4 }: { n?: number }) {
  const [amount, setAmount] = useState("500,000");
  const [rate, setRate] = useState("30");
  const [months, setMonths] = useState("12");
  const [method, setMethod] = useState<"reducing" | "flat">("reducing");

  const calc = (m: "reducing" | "flat") => {
    const P = parseMoney(amount), nm = Number(months), annual = Number(rate) / 100;
    if (!P || !nm) return { monthly: 0, total: 0, interest: 0 };
    if (m === "flat") {
      const interest = P * annual * (nm / 12);
      return { monthly: (P + interest) / nm, total: P + interest, interest };
    }
    const i = annual / 12;
    const monthly = i === 0 ? P / nm : (P * i) / (1 - Math.pow(1 + i, -nm));
    return { monthly, total: monthly * nm, interest: monthly * nm - P };
  };
  const r = calc(method);
  const other = calc(method === "flat" ? "reducing" : "flat");
  const diff = Math.abs(other.interest - r.interest);

  return (
    <Shell
      n={n}
      id="loan-calculator"
      title="Loan calculator"
      intro="See your monthly repayment and the total interest before you borrow. Compare flat-rate and reducing-balance loans side by side."
      related={[
        { href: "/how-loan-interest-works-in-nigeria/", label: "How loan interest works" },
        { href: "/what-apr-means-in-nigeria-loans/", label: "What APR means" },
        { href: "/signs-of-dangerous-loan-offers-every-nigerian-should-know/", label: "Signs of a dangerous loan" },
      ]}
      result={
        <div>
          <p className="text-sm font-semibold">Your loan breakdown</p>
          <Stat label="Monthly repayment" value={naira(r.monthly)} strong />
          <Stat label="Total repayment" value={naira(r.total)} />
          <Stat label="Total interest paid" value={naira(r.interest)} />
          {diff > 0 && (
            <p className="mt-2 border border-ink bg-card p-3 text-sm leading-relaxed">
              At the same quoted rate, a <strong>{method === "flat" ? "reducing-balance" : "flat-rate"}</strong> loan would cost{" "}
              <strong>{naira(diff)} {other.interest > r.interest ? "more" : "less"}</strong> in interest. Always ask a lender which method they use.
            </p>
          )}
        </div>
      }
    >
      <MoneyInput label="Loan amount" value={amount} onChange={setAmount} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="loan-rate" className="label">Interest rate per year (%)</label>
          <input id="loan-rate" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))} className="field font-medium tabular-nums" />
        </div>
        <Select
          label="Repayment period"
          value={months}
          onChange={setMonths}
          options={[["1", "1 month"], ["3", "3 months"], ["6", "6 months"], ["12", "12 months (1 year)"], ["18", "18 months"], ["24", "24 months (2 years)"], ["36", "36 months (3 years)"]]}
        />
      </div>
      <fieldset>
        <legend className="label">How interest is calculated</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {([
            ["reducing", "Reducing balance", "Interest falls as you repay"],
            ["flat", "Flat rate", "Interest on the full amount throughout"],
          ] as const).map(([v, l, d]) => (
            <label key={v} className={`cursor-pointer border p-3.5 ${method === v ? "border-ink bg-lime-wash" : "border-line bg-card hover:border-ink"}`}>
              <input type="radio" name="method" value={v} checked={method === v} onChange={() => setMethod(v)} className="sr-only" />
              <span className="block font-semibold">{l}</span>
              <span className="block text-sm text-ink-2">{d}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </Shell>
  );
}

