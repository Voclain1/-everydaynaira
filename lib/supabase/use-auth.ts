"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "./client";
import { isSupabaseConfigured } from "./config";

export type AuthState = { configured: boolean; loading: boolean; user: User | null };

/**
 * Client-side auth state. Reads the session once on mount and follows
 * sign-in / sign-out events. When Supabase is not configured yet,
 * reports configured: false and never calls the API.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(() => ({
    configured: isSupabaseConfigured(),
    loading: isSupabaseConfigured(),
    user: null,
  }));

  useEffect(() => {
    const client = getSupabaseBrowser();
    if (!client) return;
    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (mounted) setState({ configured: true, loading: false, user: data.session?.user ?? null });
    });
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setState({ configured: true, loading: false, user: session?.user ?? null });
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
