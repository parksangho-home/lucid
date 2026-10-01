import { createClient } from "@supabase/supabase-js";

function getServerSecret() {
  return process.env.SUPABASE_SECRET_KEY;
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      getServerSecret(),
  );
}

export function createAdminClient() {
  const secret = getServerSecret();
  if (!isSupabaseConfigured() || !secret) {
    throw new Error("Supabase is not configured.");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
