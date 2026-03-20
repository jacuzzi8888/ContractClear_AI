// ============================================================
// ContractClear AI — Supabase Admin Client (Service Role)
// ============================================================
// This client bypasses Row Level Security. It is intended ONLY
// for server-side background jobs (Inngest workers) that run
// outside of a user's authenticated session.
// ============================================================

import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase configuration (URL or Service Role Key).");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
