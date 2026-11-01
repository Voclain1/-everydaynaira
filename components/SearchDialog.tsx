"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Doc = { t: string; u: string; c: string; d: string; h: string; b: string; k: "guide" | "page" | "tool" | "topic" };

let cache: Doc[] | null = null;

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s₦/]/g, " ");

function score(doc: Doc, terms: string[]) {
  let s = 0;
  const t = norm(doc.t), h = norm(doc.h), d = norm(doc.d), b = norm(doc.b);
  for (const term of terms) {
    let hit = false;
    if (t.includes(term)) { s += 10; hit = true; }
    if (h.includes(term)) { s += 4; hit = true; }
    if (d.includes(term)) { s += 3; hit = true; }
    if (b.includes(term)) { s += 1; hit = true; }
    if (!hit) return 0;
  }
  if (doc.k === "tool" || doc.k === "topic") s += 1;
  return s;
}

function snippet(doc: Doc, terms: string[]) {
  const text = doc.b;
  const lower = text.toLowerCase();
  const i = Math.max(0, ...terms.map((t) => lower.indexOf(t)));
  if (i <= 0) return doc.d;
  const start = Math.max(0, i - 60);
  return (start > 0 ? "…" : "") + text.slice(start, start + 160) + "…";
}

const SUGGESTED = ["emergency fund", "bank charges", "loan interest", "budget", "scams", "irregular income"];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [docs, setDocs] = useState<Doc[] | null>(cache);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      setTimeout(() => input.current?.focus(), 10);
      if (!cache)
        fetch("/search-index.json")
          .then((r) => r.json())
          .then((d: Doc[]) => {
            cache = d;
            setDocs(d);
          })
          .catch(() => setDocs([]));
    }
    if (!open && el.open) el.close();
  }, [open]);

  const terms = useMemo(() => norm(q).split(/\s+/).filter((t) => t.length > 1), [q]);
  const results = useMemo(() => {
    if (!docs || !terms.length) return [];
    return docs
      .map((d) => ({ d, s: score(d, terms) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((r) => r.d);
  }, [docs, terms]);

  useEffect(() => setActive(0), [q]);

  const go = (u: string) => {
    onClose();
    setQ("");
    router.push(u);
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      className="m-0 mx-auto mt-[8vh] w-[min(42rem,calc(100vw-2rem))] max-w-none bg-transparent p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
      aria-label="Search EverydayNaira"
    >
      <div className="border border-ink bg-card shadow-[8px_8px_0_0_#1A2329]">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M13 13l4.5 4.5" />
          </svg>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              if (e.key === "Enter" && results[active]) go(results[active].u);
            }}
            placeholder="Search guides, topics and calculators"
            className="h-16 w-full bg-transparent text-lg outline-none placeholder:text-ink-3"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `sr-${active}` : undefined}
          />
          <button type="button" onClick={onClose} className="border border-line px-2 py-1 font-mono text-xs text-ink-3 hover:border-ink">
            Esc
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {!terms.length && (
            <div className="p-5">
              <p className="text-sm text-ink-3">Popular searches</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTED.map((s) => (
                  <button key={s} type="button" onClick={() => setQ(s)} className="border border-line px-3 py-1.5 text-sm hover:border-ink hover:bg-lime-wash">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {terms.length > 0 && docs && results.length === 0 && (
            <div className="p-5 text-ink-2">
              <p>No guides match “{q}”. Try a broader word like “loan” or “savings”, or <Link href="/start-here/" onClick={onClose} className="link">start with the basics</Link>.</p>
            </div>
          )}
          {terms.length > 0 && !docs && <p className="p-5 text-ink-3">Loading…</p>}
          {results.length > 0 && (
            <ul id="search-results" role="listbox">
              {results.map((r, i) => (
                <li key={r.u} id={`sr-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={r.u}
                    onClick={(e) => { e.preventDefault(); go(r.u); }}
                    onMouseEnter={() => setActive(i)}
                    className={`block border-b border-line px-5 py-4 ${i === active ? "bg-lime-wash" : ""}`}
                  >
                    <span className="text-xs text-ink-3">{r.c}</span>
                    <span className="mt-0.5 block font-semibold leading-snug">{r.t}</span>
                    <span className="mt-1 line-clamp-2 block text-sm text-ink-2">{snippet(r, terms)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </dialog>
  );
}
