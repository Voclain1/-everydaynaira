import Link from "next/link";
import { Logo } from "./Logo";
import { TOPICS } from "@/lib/topics";

const TRUST = [
  { href: "/about-everydaynaira/", label: "About" },
  { href: "/authors/", label: "Authors" },
  { href: "/editorial-policy/", label: "Editorial policy" },
  { href: "/fact-checking-policy/", label: "Fact-checking policy" },
  { href: "/contact/", label: "Contact" },
];
const LEGAL = [
  { href: "/disclaimer/", label: "Disclaimer" },
  { href: "/privacy-policy/", label: "Privacy policy" },
  { href: "/terms/", label: "Terms of use" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs leading-relaxed text-ink-2">
            Practical, sourced money guidance for everyday Nigerians. Educational content only, not personalised financial advice.
          </p>
        </div>
        <FooterCol title="Topics" links={TOPICS.map((t) => ({ href: t.hub, label: t.name }))} />
        <FooterCol
          title="Start"
          links={[
            { href: "/start-here/", label: "Start here" },
            { href: "/tools/", label: "Calculators" },
            { href: "/feed.xml", label: "RSS feed" },
          ]}
        />
        <FooterCol title="EverydayNaira" links={TRUST} />
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-3 py-6 text-sm text-ink-2 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} EverydayNaira. Written in Lagos.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-ink hover:underline underline-offset-4">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="font-semibold">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-ink-2 hover:text-ink hover:underline underline-offset-4">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
