"use client";

import { useState } from "react";

const sections = [
  {
    title: "Identify the transaction",
    items: [
      ["type", "Choose the correct problem: failed transfer, wrong account, ATM non-dispense or unauthorised debit."],
      ["reference", "Find the original transaction reference or NIP session ID, if shown by your bank."],
      ["time", "Write down the date, time, amount and transfer/withdrawal channel."],
      ["institutions", "Record the sender and receiving institutions or the ATM location and operator."],
    ],
  },
  {
    title: "Preserve evidence safely",
    items: [
      ["receipt", "Save the original payment receipt, app transaction detail or relevant statement excerpt."],
      ["status", "Capture the latest transaction status and check separately for a completed reversal."],
      ["recipient", "If appropriate, ask the intended recipient to check their account history, not just SMS alerts."],
      ["security", "Remove unrelated personal information before sharing documents; never share OTPs, PINs or passwords."],
    ],
  },
  {
    title: "Create a traceable complaint",
    items: [
      ["bank", "Contact your sending institution or card issuer through its official app or website."],
      ["ticket", "Ask for a formal complaint number, transaction trace and written next-update date."],
      ["follow", "Save the institution's response and record every follow-up date."],
      ["escalate", "If unresolved, use the relevant official regulator complaints route and attach the complaint trail."],
    ],
  },
] as const;

const total = sections.reduce((sum, group) => sum + group.items.length, 0);
const sample = `Subject: Request to investigate disputed banking transaction

I am requesting a formal investigation into the following transaction.

Type of dispute: [failed transfer / wrong-account transfer / ATM non-dispense / unrecognised debit]
Date and time: [date, time]
Amount: ₦[amount]
Sending institution or card issuer: [name]
Receiving institution or ATM operator: [name]
Transaction reference / NIP session ID (if available): [reference]
What happened: [brief factual description]
What I have confirmed: [debit, receipt, recipient status, any reversal]
Requested action: [trace, confirmed reversal where applicable, explanation or recall request]

Please register this complaint and provide a tracking reference, the institution responsible for investigation and a date for a written update. I can supply the relevant receipt or statement excerpt through your official secure channel.

[Your name and a safe contact method]

Do not include your bank PIN, password, CVV or OTP.`;

export function BankDisputeChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const done = Object.values(checked).filter(Boolean).length;

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(sample);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <div className="space-y-10">
      <section className="border border-ink bg-card p-6 sm:p-8" aria-label="Checklist progress">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-bold tracking-[-0.02em]">Your evidence checklist</h2>
          <span className="font-mono text-sm tabular-nums text-ink-2">{done} of {total} complete</span>
        </div>
        <div role="progressbar" aria-label="Checklist completion" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} className="mt-5 h-3 w-full overflow-hidden bg-paper-2">
          <div className="h-full bg-lime-deep transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-2">Tick items as you complete them. The checks are temporary and reset when this page is reloaded. You do not need to enter a bank account number or any other sensitive information here.</p>
      </section>

      {sections.map((group, index) => (
        <section className="border-t-2 border-ink pt-5" key={group.title} aria-labelledby={`checklist-section-${index}`}>
          <h2 id={`checklist-section-${index}`} className="text-2xl font-bold tracking-[-0.025em]">
            <span className="mr-3 font-mono text-sm font-normal text-ink-3">{String(index + 1).padStart(2, "0")}</span>{group.title}
          </h2>
          <ul className="mt-6 space-y-4">
            {group.items.map(([id, label]) => (
              <li key={id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-line bg-card p-4 hover:border-ink">
                  <input type="checkbox" checked={Boolean(checked[id])} onChange={(event) => setChecked((old) => ({ ...old, [id]: event.target.checked }))} className="mt-1 h-5 w-5 shrink-0 accent-lime-deep" />
                  <span className="leading-relaxed">{label}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="border border-ink bg-paper-2 p-6 sm:p-8" aria-labelledby="complaint-template">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="complaint-template" className="text-2xl font-bold tracking-[-0.025em]">Bank complaint letter template</h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-ink-2">Copy and fill the blanks privately. Send your complaint through your institution&apos;s verified channel.</p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button type="button" onClick={copyTemplate} className="btn btn-primary">Copy letter</button>
            <button type="button" onClick={() => window.print()} className="btn btn-ghost">Print checklist</button>
          </div>
        </div>
        <p role="status" aria-live="polite" className="mt-3 text-sm text-ink-2">
          {copyState === "copied" ? "Template copied. Fill it in privately before sending." : copyState === "error" ? "Clipboard unavailable. Select and copy the template text below." : ""}
        </p>
        <pre className="mt-5 overflow-x-auto whitespace-pre-wrap break-words border border-line bg-card p-4 font-sans text-sm leading-7 sm:p-6">{sample}</pre>
      </section>
    </div>
  );
}
