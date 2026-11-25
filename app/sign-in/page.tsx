import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to your EverydayNaira account to see saved guides, reading history and calculator results.",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; deleted?: string }>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/dashboard/";
  return (
    <div className="wrap py-14 md:py-20">
      <div className="mx-auto max-w-md border border-ink bg-card p-6 sm:p-8">
        <h1 className="display text-[2rem]">Sign in</h1>
        <p className="mt-3 leading-relaxed text-ink-2">
          Your saved guides, reading history and calculator results live in your account.
        </p>
        {params.deleted && (
          <p className="mt-4 border border-ink bg-lime-wash p-3 text-sm leading-relaxed">
            Your account data has been deleted. You can create a new account any time.
          </p>
        )}
        {params.error && (
          <p className="mt-4 border border-ink bg-card p-3 text-sm text-red-800">
            Could not sign you in — please try again.
          </p>
        )}
        <Suspense>
          <AuthForm mode="sign-in" next={next} />
        </Suspense>
        <p className="mt-6 text-sm text-ink-2">
          No account yet?{" "}
          <Link href="/sign-up/" className="link font-medium text-ink">
            Create one
          </Link>{" "}
          — it takes a minute, and it is free.
        </p>
      </div>
    </div>
  );
}
