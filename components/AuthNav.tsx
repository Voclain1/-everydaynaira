"use client";

import Link from "next/link";
import { useAuth } from "@/lib/supabase/use-auth";

/**
 * Header auth slot: "Sign in" when logged out, "Dashboard" when logged in.
 * It always renders — when Supabase is not configured yet there is no
 * session, so it shows "Sign in", which leads to a page that explains
 * accounts are not set up yet. It renders nothing only while the session
 * is still being checked.
 */
export function AuthNav() {
  const { loading, user } = useAuth();
  if (loading) return null;
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
  const { loading, user } = useAuth();
  if (loading) return null;
  return (
    <li>
      <Link href={user ? "/dashboard/" : "/sign-in/"} className="block py-2.5 text-lg font-semibold">
        {user ? "Dashboard" : "Sign in"}
      </Link>
    </li>
  );
}
