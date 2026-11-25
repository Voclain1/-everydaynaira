import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate, getAllPosts, getPost } from "@/lib/content";
import { PostCard } from "@/components/PostCard";
import { describeRecommendationBasis, pickRecommendations } from "@/lib/recommendations";
import { SignOutButton } from "@/components/SignOutButton";
import * as DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your dashboard",
  description: "Your saved guides, reading history and calculator results on EverydayNaira.",
  robots: { index: false, follow: false },
};

const CALCULATOR_LABELS: Record<string, string> = {
  budget: "Budget calculator",
  "emergency-fund": "Emergency fund calculator",
  "savings-goal": "Savings goal calculator",
  loan: "Loan calculator",
};

type SavedRow = { slug: string; saved_at: string };
type HistoryRow = { slug: string; progress: number; updated_at: string };
type SnapshotRow = {
  id: string;
  calculator: string;
  results: Record<string, unknown>;
  created_at: string;
};
type PreferencesRow = { newsletter: boolean; notify_new_posts: boolean; interests: string[] };
type ProfileRow = { display_name: string | null };

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="wrap py-14 md:py-20">
        <div className="mx-auto max-w-xl border border-ink bg-card p-6 sm:p-8">
          <h1 className="display text-[2rem]">Your dashboard</h1>
          <p className="mt-3 leading-relaxed text-ink-2">
            Accounts are not set up yet — we are still connecting the sign-in service. Please check
            back soon.
          </p>
          <Link href="/" className="btn btn-ghost mt-6">
            Back to the homepage
          </Link>
        </div>
      </div>
    );
  }

  const { supabase, user } = await getCurrentUser();
  if (!user || !supabase) redirect("/sign-in/");

  const [savedRes, historyRes, snapshotsRes, prefsRes, profileRes] = await Promise.all([
    supabase.from("saved_guides").select("slug, saved_at").order("saved_at", { ascending: false }),
    supabase
      .from("reading_history")
      .select("slug, progress, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("calculator_snapshots")
      .select("id, calculator, results, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("preferences")
      .select("newsletter, notify_new_posts, interests")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
  ]);

  const savedRows = (savedRes.data ?? []) as SavedRow[];
  const historyRows = (historyRes.data ?? []) as HistoryRow[];
  const snapshotRows = (snapshotsRes.data ?? []) as SnapshotRow[];
  const prefs = (prefsRes.data ?? null) as PreferencesRow | null;
  const profile = (profileRes.data ?? null) as ProfileRow | null;

  const savedPosts = savedRows
    .map((row) => ({ post: getPost(row.slug), savedAt: row.saved_at }))
    .filter((x): x is { post: NonNullable<ReturnType<typeof getPost>>; savedAt: string } =>
      Boolean(x.post),
    );
  const historyPosts = historyRows
    .map((row) => ({ post: getPost(row.slug), progress: row.progress, updatedAt: row.updated_at }))
    .filter((x): x is { post: NonNullable<ReturnType<typeof getPost>>; progress: number; updatedAt: string } =>
      Boolean(x.post),
    );

  const interests = (prefs?.interests ?? []) as string[];
  const historyCategories = [...new Set(historyPosts.map((h) => h.post.category))];
  const excludeSlugs = [
    ...new Set([...historyRows.map((r) => r.slug), ...savedRows.map((r) => r.slug)]),
  ];
  const recommended = pickRecommendations(getAllPosts(), {
    interests,
    historyCategories,
    excludeSlugs,
  });
  const recommendationBasis = describeRecommendationBasis(interests, historyCategories);

  const displayName =
    profile?.display_name ?? (typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : "") ??
    "";

  return (
    <div className="wrap py-12 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <h1 className="display text-[clamp(2.2rem,5vw,3.4rem)]">Your dashboard</h1>
          <p className="mt-3 text-lg text-ink-2">
            {displayName ? `Welcome back, ${displayName}.` : `Signed in as ${user.email}.`}
          </p>
        </div>
        <SignOutButton className="btn btn-ghost !py-2.5 text-sm" />
      </header>

      <section aria-labelledby="recommended" className="mt-12">
        <h2 id="recommended" className="display text-[1.7rem]">
          Recommended for you
        </h2>
        {recommended.length === 0 ? (
          <p className="mt-4 max-w-prose leading-relaxed text-ink-2">
            {interests.length === 0 && historyRows.length === 0 ? (
              <>
                Nothing here yet. Pick the topics you care about in{" "}
                <a href="#preferences" className="link font-medium text-ink">
                  Preferences
                </a>{" "}
                below, and recommendations will appear here as you read.
              </>
            ) : (
              "You have caught up with your chosen topics for now — new guides will appear here as they are published."
            )}
          </p>
        ) : (
          <>
            {recommendationBasis && (
              <p className="mt-4 max-w-prose leading-relaxed text-ink-2">{recommendationBasis}</p>
            )}
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="saved" className="mt-12">
        <h2 id="saved" className="display text-[1.7rem]">
          Saved guides
        </h2>
        {savedPosts.length === 0 ? (
          <p className="mt-4 max-w-prose leading-relaxed text-ink-2">
            Nothing saved yet. Open any guide and press{" "}
            <strong className="text-ink">Save this guide</strong> to keep it here.{" "}
            <Link href="/guides/" className="link font-medium text-ink">
              Browse all guides
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedPosts.map(({ post }) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="reading" className="mt-14">
        <h2 id="reading" className="display text-[1.7rem]">
          Continue reading
        </h2>
        {historyPosts.length === 0 ? (
          <p className="mt-4 max-w-prose leading-relaxed text-ink-2">
            Your reading progress will show up here once you start a guide while signed in.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {historyPosts.map(({ post, progress, updatedAt }) => (
              <li key={post.slug} className="border border-line bg-card p-5">
                <Link
                  href={`/${post.slug}/`}
                  className="text-lg font-semibold leading-snug hover:underline decoration-lime-deep decoration-2 underline-offset-4"
                >
                  {post.title}
                </Link>
                <div className="mt-3 h-2 w-full border border-ink bg-paper-2" aria-hidden>
                  <div className="h-full bg-lime-deep" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-sm text-ink-2">
                  {progress}% read · last read {formatDate(updatedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="calculators" className="mt-14">
        <h2 id="calculators" className="display text-[1.7rem]">
          Calculator history
        </h2>
        {snapshotRows.length === 0 ? (
          <p className="mt-4 max-w-prose leading-relaxed text-ink-2">
            No saved results yet. Run any calculator and press{" "}
            <strong className="text-ink">Save this result</strong> to keep it here.{" "}
            <Link href="/tools/" className="link font-medium text-ink">
              Open the calculators
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {snapshotRows.map((row) => (
              <li key={row.id} className="border border-line bg-card p-5">
                <p className="font-semibold">
                  {CALCULATOR_LABELS[row.calculator] ?? row.calculator}
                </p>
                <p className="mt-1.5 leading-relaxed text-ink-2">
                  {typeof row.results?.summary === "string" ? row.results.summary : "Saved result"}
                </p>
                <p className="mt-2 text-sm text-ink-3">{formatDate(row.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="preferences" className="mt-14">
        <h2 id="preferences" className="display text-[1.7rem]">
          Preferences
        </h2>
        <div className="mt-6 max-w-2xl border border-line bg-card p-6">
          <DashboardClient.PreferencesForm
            initial={{
              newsletter: prefs?.newsletter ?? false,
              notify_new_posts: prefs?.notify_new_posts ?? false,
              interests: prefs?.interests ?? [],
            }}
          />
          <p className="mt-4 text-sm leading-relaxed text-ink-3">
            These choices are stored on your account. Newsletter emails also carry their own
            unsubscribe link.
          </p>
        </div>
      </section>

      <section aria-labelledby="account" className="mt-14">
        <h2 id="account" className="display text-[1.7rem]">
          Account settings
        </h2>
        <div className="mt-6 max-w-2xl space-y-8 border border-line bg-card p-6">
          <div>
            <p className="text-sm text-ink-2">
              Signed in as <strong className="text-ink">{user.email}</strong>
            </p>
            <div className="mt-5">
              <DashboardClient.DisplayNameForm initialName={displayName} />
            </div>
          </div>
          <div className="border-t border-line pt-6">
            <p className="font-semibold">Delete your account data</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Removes your saved guides, reading history, calculator results, preferences and
              profile. This follows your right to erasure under the Nigeria Data Protection Act
              2023.
            </p>
            <div className="mt-4">
              <DashboardClient.DeleteAccountForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
