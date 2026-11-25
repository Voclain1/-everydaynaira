import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

/**
 * Server-side Supabase client bound to the request cookies.
 * Returns null when the env vars are not set yet (Vercel env vars land
 * after the PR opens) — callers render a not-configured state instead.
 */
export async function getSupabaseServer(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: setting cookies is not allowed
          // there, but the proxy refreshes the session instead.
        }
      },
    },
  });
}

export async function getCurrentUser(): Promise<{ supabase: SupabaseClient | null; user: User | null }> {
  const supabase = await getSupabaseServer();
  if (!supabase) return { supabase: null, user: null };
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}
