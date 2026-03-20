// ============================================================
// ContractClear AI — Supabase Client (Browser)
// ============================================================

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing at runtime. Please set them in your Vercel Project Settings."
    );
  }

  return createBrowserClient(url, key);
}
