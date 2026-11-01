import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { absUrl } from "@/lib/site";

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const all = [{ name: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-ink-2">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((it, i) => (
            <li key={it.href} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="text-ink-3">/</span>}
              {i < all.length - 1 ? (
                <Link href={it.href} className="hover:text-ink hover:underline underline-offset-4">{it.name}</Link>
              ) : (
                <span aria-current="page" className="text-ink line-clamp-1">{it.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absUrl(it.href) })),
        }}
      />
    </>
  );
}
