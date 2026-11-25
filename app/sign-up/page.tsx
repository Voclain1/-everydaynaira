import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create a free EverydayNaira account to save guides, pick up where you left off, and keep your calculator results.",
  robots: { index: false, follow: false },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/dashboard/";
  return (
    <div className="wrap py-14 md:py-20">
      <div className="mx-auto max-w-md border border-ink bg-card p-6 sm:p-8">
        <h1 className="display text-[2rem]">Create your account</h1>
        <p className="mt-3 leading-relaxed text-ink-2">
          Free, no paywall. Save guides, pick up where you left off, and keep your calculator
          results in one place.
        </p>
        <Suspense>
          <AuthForm mode="sign-up" next={next} />
        </Suspense>
        <p className="mt-6 text-sm text-ink-2">
          Already have an account?{" "}
          <Link href="/sign-in/" className="link font-medium text-ink">
            Sign in
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
