import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const secret = process.env.SUPABASE_SECRET_KEY;
if (!secret) {
  console.error("SUPABASE_SECRET_KEY is not configured; client bundle cannot be checked.");
  process.exit(1);
}

async function* files(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const fullPath = join(path, entry.name);
    if (entry.isDirectory()) yield* files(fullPath);
    else if (entry.isFile()) yield fullPath;
  }
}

let count = 0;
for await (const path of files(".next/static")) {
  const contents = await readFile(path);
  count++;
  if (contents.includes(Buffer.from(secret))) {
    console.error(`Secret key found in a client asset: ${path}`);
    process.exit(1);
  }
}
console.log(`Checked ${count} client assets: Supabase secret key not present.`);
