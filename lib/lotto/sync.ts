import { ensureNextOpenDraw, getLatestCompletedDrawNumber, importDraw } from "./storage-supabase.ts";
import { fetchLatestDrawNumber, fetchOfficialRange } from "./source.ts";

const defaultDependencies = {
  getLatestCompletedDrawNumber,
  fetchLatestDrawNumber,
  fetchOfficialRange,
  importDraw,
  ensureNextOpenDraw,
};

export async function syncLotto(
  mode: "all" | "incremental",
  dependencies: typeof defaultDependencies = defaultDependencies,
) {
  // Check DB before any network access so a bad connection has no partial effects.
  const savedLatest = await dependencies.getLatestCompletedDrawNumber();
  const officialLatest = await dependencies.fetchLatestDrawNumber();
  if (savedLatest > officialLatest)
    throw new Error("Draw sequence mismatch: DB is ahead of the official source.");
  const start = mode === "all" ? 1 : savedLatest + 1;
  const draws = await dependencies.fetchOfficialRange(start, officialLatest);
  let imported = 0;
  let skipped = 0;
  let checked = 0;
  for (const draw of draws) {
    const result = await dependencies.importDraw(draw);
    if (result.imported) imported++;
    else skipped++;
    checked += result.checked;
  }
  const openCreated = await dependencies.ensureNextOpenDraw();
  return { officialLatest, imported, skipped, checked, openCreated };
}
