"use client";

import Link from "next/link";
import { useAuth } from "@/lib/supabase/use-auth";

/**
 * Header auth slot: "Sign in" when logged out, "Dashboard" when logged in.
 * Renders nothing while the session is being checked, and nothing at all
 * when Supabase is not configured yet.
 */
export function AuthNav() {
  const { configured, loading, user } = useAuth();
  if (!configured || loading) return null;
  if (user) {
    return (
      <Link href="/dashboard/" className="btn btn-ghost hidden !py-2.5 sm:inline-flex">
        Dashboard
      </Link>
    );
  }
  return (
    <Link href="/sign-in/" className="btn btn-ghost hidden !py-2.5 sm:inline-flex">
      Sign in
    </Link>
  );
}

/** Same link for the mobile menu, where the desktop slot is hidden. */
export function AuthNavMobile() {
  const { configured, loading, user } = useAuth();
  if (!configured || loading) return null;
  return (
    <li>
      <Link href={user ? "/dashboard/" : "/sign-in/"} className="block py-2.5 text-lg font-semibold">
        {user ? "Dashboard" : "Sign in"}
      </Link>
    </li>
  );
}
