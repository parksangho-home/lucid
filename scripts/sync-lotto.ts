import { syncLotto } from "../lib/lotto/sync.ts";
import { isSupabaseConfigured } from "../lib/supabase/admin.ts";

const mode = process.argv[2] === "--all" ? "all" : "incremental";
if (!isSupabaseConfigured()) {
  console.error("Database unavailable: Supabase environment variables를 확인하세요.");
  process.exit(1);
}
try {
  const result = await syncLotto(mode);
  console.log(`Official latest ${result.officialLatest}회; imported ${result.imported}; skipped ${result.skipped}; checked predictions ${result.checked}; next open ${result.openCreated ? "created" : "ready"}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  // Supabase uses HTTP connections; there is no connection pool to close.
}
