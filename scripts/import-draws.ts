import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { importDraw } from "../lib/lotto/storage-supabase.ts";
import { isSupabaseConfigured } from "../lib/supabase/admin.ts";
import type { Draw } from "../lib/lotto/types.ts";

const path = process.argv[2];
if (!path) {
  console.error("Usage: npm run lotto:import -- path/to/verified-draws.json");
  process.exit(1);
}

try {
  const draws = JSON.parse(await readFile(resolve(path), "utf8")) as Draw[];
  if (!Array.isArray(draws) || draws.length === 0)
    throw new Error("Expected a non-empty JSON array of draws.");
  for (const draw of draws) {
    const result = await importDraw(draw);
    console.log(
      `${draw.drawNumber}회: ${result.imported ? "saved" : "already saved"}; ${result.checked} predictions checked`,
    );
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (!isSupabaseConfigured() && !process.exitCode) process.exitCode = 1;
}
