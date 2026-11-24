/**
 * Supabase connection settings, read from the environment.
 *
 * The publishable key is public by design (Row Level Security protects
 * the data), but it still comes from env vars — never hard-coded here.
 * Everything in this sprint must work when the vars are missing, because
 * Vercel env vars are set after the PR opens: no throw at import time.
 */
export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
