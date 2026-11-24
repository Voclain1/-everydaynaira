"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/supabase/use-auth";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { topicByCategory, type Motif } from "@/lib/topics";
import {
  describeRecommendationBasis,
  pickRecommendations,
  type RecommendablePost,
} from "@/lib/recommendations";
import { IsoArt } from "./IsoArt";

type IndexGuide = {
  t: string;
  u: string;
  d: string;
  i: string | null;
  cat?: string;
  upd?: string;
  k: string;
};

type Pick = RecommendablePost & {
  title: string;
  url: string;
  description: string;
  image: string | null;
};

/**
 * "Recommended for you" for the homepage. Signed-in readers only: it
 * reads their chosen interests and recent reading history, then picks up
 * to 6 guides they have not read yet. Signed-out readers (and the
 * not-configured state) see nothing at all, so the public homepage is
 * unchanged for them — this section only ever adds to the page, it never
 * replaces or reorders anything.
 */
export function RecommendedForYou() {
  const { loading, user } = useAuth();
  const [picks, setPicks] = useState<Pick[] | null>(null);
  const [basis, setBasis] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    const client = getSupabaseBrowser();
    if (!client) return;
    let mounted = true;
    void (async () => {
      try {
        const [prefsRes, historyRes, savedRes, indexRes] = await Promise.all([
          client.from("preferences").select("interests").eq("user_id", user.id).maybeSingle(),
          client
            .from("reading_history")
            .select("slug")
            .order("updated_at", { ascending: false })
            .limit(20),
          client.from("saved_guides").select("slug"),
          fetch("/search-index.json"),
        ]);
        if (!mounted) return;
        const interests = (prefsRes.data?.interests ?? []) as string[];
        const historySlugs = ((historyRes.data ?? []) as { slug: string }[]).map((r) => r.slug);
        const savedSlugs = ((savedRes.data ?? []) as { slug: string }[]).map((r) => r.slug);
        const index = (await indexRes.json()) as IndexGuide[];
        const guides = index.filter((g) => g.k === "guide" && g.cat && g.upd);
        const bySlug = new Map(guides.map((g) => [g.u.replaceAll("/", ""), g]));
        const historyCategories = historySlugs
          .map((s) => bySlug.get(s)?.cat)
          .filter((c): c is string => Boolean(c));
        const chosen = pickRecommendations(
          guides.map((g) => ({
            slug: g.u.replaceAll("/", ""),
            category: g.cat as string,
            updated: g.upd as string,
          })),
          { interests, historyCategories, excludeSlugs: [...historySlugs, ...savedSlugs] },
        );
        if (!mounted) return;
        setBasis(describeRecommendationBasis(interests, historyCategories));
        setPicks(
          chosen.map((p) => {
            const g = bySlug.get(p.slug);
            return {
              ...p,
              title: g?.t ?? p.slug,
              url: g?.u ?? `/${p.slug}/`,
              description: g?.d ?? "",
              image: g?.i ?? null,
            };
          }),
        );
      } catch {
        if (mounted) setPicks([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loading, user]);

  if (!user || !picks || picks.length === 0) return null;

  return (
    <section className="border-b border-line">
      <div className="wrap py-10 md:py-20">
        <div className="flex flex-col items-start gap-4 border-t-2 border-ink pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-2">For you</p>
            <h2 className="display mt-2 text-[clamp(1.55rem,6vw,2.6rem)] leading-[1.05]">
              Recommended for you
            </h2>
          </div>
          <Link href="/dashboard/" className="btn btn-ghost shrink-0 !py-2.5 text-sm">
            Your dashboard
          </Link>
        </div>
        {basis && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">{basis}</p>}
        <div className="mt-8 grid gap-x-12 lg:grid-cols-2">
          {picks.map((p) => {
            const topic = topicByCategory(p.category);
            return (
              <Link
                key={p.slug}
                href={p.url}
                className="group grid grid-cols-[6rem_1fr] gap-3 border-t border-line py-4 first:border-t-0 first:pt-0 sm:grid-cols-[9rem_1fr] sm:gap-4 sm:py-5"
              >
                {p.image ? (
                  <span className="relative block aspect-[16/10] overflow-hidden border border-line bg-paper-2">
                    <Image src={p.image} alt="" fill sizes="144px" className="object-cover" />
                  </span>
                ) : (
                  <IsoArt
                    motif={p.category as Motif}
                    seed={p.slug}
                    aspect={1.6}
                    className="aspect-[16/10] border border-line"
                  />
                )}
                <span className="min-w-0">
                  <span className="block text-xs text-ink-2 sm:text-sm">{topic.name}</span>
                  <span className="mt-2 block text-lg font-semibold leading-snug tracking-[-0.02em] group-hover:underline decoration-lime-deep decoration-2 underline-offset-4">
                    {p.title}
                  </span>
                  <span className="mt-2 line-clamp-2 block text-[0.95rem] leading-relaxed text-ink-2">
                    {p.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
