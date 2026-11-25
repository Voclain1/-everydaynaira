import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * OAuth + email-confirmation callback. Supabase redirects here with a
 * one-time code; we exchange it for a session and send the reader on.
 * Only local redirect targets are accepted.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requested = searchParams.get("next") ?? "/dashboard/";
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard/";
  if (code) {
    const supabase = await getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/sign-in/?error=1`);
}
