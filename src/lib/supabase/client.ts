"use client";

import { createBrowserClient } from "@supabase/ssr";

let supabaseBrowserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (supabaseBrowserClient) return supabaseBrowserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // In dev mode without Supabase envs, return null gracefully so fallback mock mode works
    return null;
  }

  supabaseBrowserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabaseBrowserClient;
}
