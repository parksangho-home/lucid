import { createAdminClient, isSupabaseConfigured } from "../lib/supabase/admin.ts";

if (!isSupabaseConfigured()) {
  console.error(
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY.",
  );
  process.exit(1);
}

const db = createAdminClient();
const requiredTables = ["lotto_draws", "lotto_predictions", "lotto_results"];

for (const table of requiredTables) {
  const { error } = await db.from(table).select("*", { count: "exact", head: true });
  if (error) {
    console.error(`${table}: ${error.message}`);
    process.exit(1);
  }
  console.log(`${table}: ready`);
}

console.log("Supabase LOTTO LAB schema is ready.");
