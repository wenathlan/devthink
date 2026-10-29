/**
 * configparity.ts — the family config equality gate.
 * the standard set of framework configs rides identical in every app root
 * and the biome baseline is byte identical across the family, so the gate
 * walks the app folders and fails on the first drift. run it with node
 * from the os app: node ../tests/devthink.configparity.ts
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/* the flat typed folder law moved this gate into tests/ at the repository
 * root, so the repository root is one hop up — the two hops of the old
 * devthink/tests/ home pointed outside the tree and answered MISSING for
 * every app. */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

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

/** the saddle vm pins the family overrides never inherit (the saddle
 * exceptions the standardization law keeps). */
const saddleExempt = ["@grpc/grpc-js", "xcode"];

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

/* the standardization laws of the twelfth wave: the family devdependencies
 * lockstep and the overrides union, both read from the manifests the walk
 * already collects. */

/** every app manifest keyed by name, for the lockstep and the union. */
const manifests = new Map(
  appDirs.map((app) => [
    app,
    JSON.parse(readFileSync(join(repoRoot, app, "package.json"), "utf8")) as {
      devDependencies?: Record<string, string>;
      overrides?: Record<string, unknown>;
    },
  ]),
);

/** law one: a devdependency two or more apps carry rides the identical
 * version in every carrier (the family lockstep, additive only). */
const depStamps = new Map<string, [string, string][]>();
for (const app of appDirs)
  for (const [name, version] of Object.entries(manifests.get(app)?.devDependencies ?? {}))
    depStamps.set(name, [...(depStamps.get(name) ?? []), [app, version] as [string, string]]);
for (const [name, stamps] of depStamps) {
  const versions = new Set(stamps.map(([, version]) => version));
  if (versions.size > 1) {
    console.error(`DRIFT the devdependency ${name} rides different versions across the family: ${stamps.map(([app, version]) => `${app} ${version}`).join(" · ")}`);
    failures += 1;
  }
}

/** law two: the overrides union rides identical in every non saddle app and
 * the saddle vm pins stay saddle (the family reference is the os app). */
const sortedEntries = (overrides: Record<string, unknown>) =>
  JSON.stringify(Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b)));
const familyOverrides = sortedEntries(manifests.get("devthink")?.overrides ?? {});
for (const app of appDirs) {
  const overrides = { ...(manifests.get(app)?.overrides ?? {}) };
  for (const key of saddleExempt) delete overrides[key];
  if (sortedEntries(overrides) !== familyOverrides) {
    console.error(`DRIFT ${app}/package.json overrides differ from the family union`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`config parity: ${failures} failure(s) across ${appDirs.length} apps`);
  process.exit(1);
}
console.log(`config parity: green across ${appDirs.length} apps — the identical set, the lockstep and the union hold (${appDirs.join(", ")})`);
