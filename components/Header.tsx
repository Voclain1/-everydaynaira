"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Arrow } from "./Arrow";
import { SearchDialog } from "./SearchDialog";
import { TOPICS } from "@/lib/topics";

const NAV = [
  { href: "/start-here/", label: "Start here" },
  { href: "/tools/", label: "Calculators" },
  { href: "/about-everydaynaira/", label: "About" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState(false);
  const [search, setSearch] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setTopics(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === "/" && !(e.target as HTMLElement)?.closest("input,textarea,select")) {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === "Escape") setTopics(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="wrap flex h-[4.5rem] items-center justify-between gap-6">
        <Link href="/" aria-label="EverydayNaira home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          <div className="relative" onMouseLeave={() => setTopics(false)}>
            <button
              type="button"
              aria-expanded={topics}
              aria-controls="topics-menu"
              onClick={() => setTopics((v) => !v)}
              onMouseEnter={() => setTopics(true)}
              className="flex items-center gap-1.5 text-[0.98rem] font-medium hover:text-ink-2"
            >
              Topics
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className={`transition-transform ${topics ? "rotate-180" : ""}`}>
                <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
            {topics && (
              <div id="topics-menu" className="absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-4">
                <ul className="grid grid-cols-2 border border-ink bg-card p-2 shadow-[6px_6px_0_0_#1A2329]">
                  {TOPICS.map((t) => (
                    <li key={t.hub}>
                      <Link href={t.hub} className="block p-3.5 hover:bg-lime-wash">
                        <span className="block font-semibold">{t.name}</span>
                        <span className="mt-1 block text-sm leading-snug text-ink-2">{t.summary}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={pathname === n.href ? "page" : undefined} className="text-[0.98rem] font-medium hover:text-ink-2 aria-[current=page]:underline decoration-lime-deep decoration-2 underline-offset-8">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearch(true)}
            className="flex h-11 items-center gap-3 border border-line bg-card px-3 text-sm text-ink-2 hover:border-ink"
            aria-label="Search guides"
          >
            <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M13 13l4.5 4.5" />
            </svg>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden border border-line px-1.5 py-0.5 font-mono text-[0.7rem] text-ink-3 md:inline">/</kbd>
          </button>
          <Link href="/#newsletter" className="btn btn-primary hidden !py-2.5 xl:inline-flex">
            Weekly money tips <Arrow up />
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border border-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden stroke="currentColor" strokeWidth="1.8">
              {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M2 6h16M2 14h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-paper lg:hidden">
          <nav aria-label="Mobile" className="wrap max-h-[calc(100dvh-4.5rem)] overflow-y-auto py-6">
            <p className="text-sm text-ink-3">Topics</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-4">
              {TOPICS.map((t) => (
                <li key={t.hub}>
                  <Link href={t.hub} className="block py-2.5 text-lg font-semibold">{t.name}</Link>
                </li>
              ))}
            </ul>
            <ul className="mt-4 border-t border-line pt-4">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block py-2.5 text-lg font-semibold">{n.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/contact/" className="block py-2.5 text-lg font-semibold">Contact</Link>
              </li>
            </ul>
            <Link href="/#newsletter" className="btn btn-primary mt-6 w-full justify-center">Get weekly money tips</Link>
          </nav>
        </div>
      )}

      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </header>
  );
}
