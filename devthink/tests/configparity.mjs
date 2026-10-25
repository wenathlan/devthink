/**
 * configparity.mjs — the family config equality gate.
 * the standard set of framework configs rides identical in every app root
 * and the biome baseline is byte identical across the family, so the gate
 * walks the app folders and fails on the first drift. run it with node
 * from the os app: node tests/configparity.mjs
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** the standard set every app root carries. */
const standardSet = [
  "package.json",
  "bun.lock",
  "tsconfig.json",
  "tsconfig.node.json",
  "vite.config.ts",
  "vitest.config.ts",
  "biome.jsonc",
  "capacitor.config.ts",
  "devthink.toml",
  "wrangler.toml",
  "vercel.json",
  "netlify.toml",
  "_headers",
  "_redirects",
  "Dockerfile",
];

/** the byte identical files across the family. */
const identicalFiles = ["biome.jsonc"];

const appDirs = readdirSync(repoRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(repoRoot, entry.name, "package.json")))
  .map((entry) => entry.name)
  .sort();

let failures = 0;

/** the byte identical template rides the os app: every other app must match it. */
const templateRoot = join(repoRoot, "devthink");

for (const app of appDirs) {
  const appRoot = join(repoRoot, app);
  for (const file of standardSet) {
    if (!existsSync(join(appRoot, file))) {
      console.error(`MISSING ${app}/${file}`);
      failures += 1;
    }
  }
  for (const file of identicalFiles) {
    const appBytes = existsSync(join(appRoot, file)) ? readFileSync(join(appRoot, file)) : null;
    const templateBytes = readFileSync(join(templateRoot, file));
    if (!appBytes) {
      console.error(`MISSING ${app}/${file} (the identical set needs it)`);
      failures += 1;
      continue;
    }
    const appHash = createHash("sha256").update(appBytes).digest("hex");
    const templateHash = createHash("sha256").update(templateBytes).digest("hex");
    if (appHash !== templateHash) {
      console.error(`DRIFT ${app}/${file} differs from the family template`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`config parity: ${failures} failure(s) across ${appDirs.length} apps`);
  process.exit(1);
}
console.log(`config parity: green across ${appDirs.length} apps (${appDirs.join(", ")})`);
