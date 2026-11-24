import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

let browserClient: SupabaseClient | null | undefined;

/**
 * Browser-side Supabase client. Returns null when the env vars are not
 * set yet (Vercel env vars land after the PR opens) — callers render a
 * not-configured state instead of calling the API.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (browserClient === undefined) {
    browserClient = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
  }
  return browserClient;
}
