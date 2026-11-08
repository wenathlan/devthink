/** Heals the dev-flag corruption the both-blocks grammar plants inside npm locks.
 *
 * THE PROD-CLOSURE LAW (the saddle container heal): the family manifest
 * grammar carries the same package set inside `dependencies` and
 * `devDependencies` (the "mesmos pacotes nos tres blocos" doctrine), and
 * every npm version tested (11.19.1 and 12.0.2) answers that duplicate
 * seat by stamping `dev: true` onto the lock entry — so `npm ci
 * --omit=dev` inside the saddle runtime stage installs nothing, the
 * node_modules directory never lands, and the container build dies at
 * the cleanup walk. The heal walks the honest production closure — every
 * package reachable from the lock root's `dependencies` through the
 * per-entry dependency edges, resolving names the arborist way (nearest
 * node_modules first, walking up) — and clears the `dev` marker on
 * exactly those seats. Nothing else changes: versions stay, dev-only
 * seats stay dev, the root entry stays byte-identical.
 *
 * Modes: `check` asserts the closure is already clean (the CI gate),
 * `sync` heals the file in place (the review-branch pass).
 */
import { readFile, writeFile } from "node:fs/promises";

const mode = process.argv[2] ?? "check";
if (!new Set(["check", "sync"]).has(mode)) throw new Error("Use check or sync.");
const lockpath = process.argv[3] ?? "package-lock.json";
const lock = JSON.parse(await readFile(lockpath, "utf8")) as {
  packages?: Record<string, Record<string, unknown> & { dependencies?: Record<string, string>; dev?: boolean }>;
};
const packages = lock.packages ?? {};
if (!packages[""]) throw new Error("The lock carries no root entry.");

/** resolves a dependency name from a lock path the way arborist does:
 * nearest node_modules first, then every ancestor. Returns the lock key
 * or undefined when the name has no seat in this lock. */
const resolve = (from: string, name: string): string | undefined => {
  const base = from === "" ? "" : `${from}/`;
  let anchor = `${base}node_modules/${name}`;
  if (packages[anchor]) return anchor;
  const segments = from.split("node_modules/");
  while (segments.length > 1) {
    segments.pop();
    anchor = `${segments.join("node_modules/")}node_modules/${name}`;
    if (packages[anchor]) return anchor;
  }
  return undefined;
};

/* the production closure walk: breadth-first from the root dependencies,
 * following every entry's own dependency edges. peer/optional edges stay
 * untouched — npm ci answers the dependencies graph alone for --omit=dev. */
const prodseats = new Set<string>();
const queue: Array<{ from: string; name: string }> = Object.keys(packages[""].dependencies ?? {}).map((name) => ({
  from: "",
  name,
}));
while (queue.length > 0) {
  const { from, name } = queue.shift()!;
  const seat = resolve(from, name);
  if (!seat || prodseats.has(seat)) continue;
  prodseats.add(seat);
  for (const edge of Object.keys(packages[seat].dependencies ?? {})) queue.push({ from: seat, name: edge });
}

/* the heal itself: clear the dev marker on every prod seat that carries
 * it, keep every other marker exactly where the generator wrote it. */
const drifted: string[] = [];
for (const seat of prodseats) if (packages[seat].dev === true) drifted.push(seat);
if (drifted.length > 0 && mode === "sync") {
  for (const seat of drifted) delete packages[seat].dev;
  await writeFile(lockpath, `${JSON.stringify(lock, null, 2)}\n`);
}
console.log(
  JSON.stringify(
    {
      mode,
      lockpath,
      prodclosure: prodseats.size,
      drifted: drifted.length,
      ...(drifted.length > 0 && mode === "check" ? { heal: "run node lockprod.ts sync" } : {}),
    },
    null,
    2,
  ),
);
if (drifted.length > 0 && mode === "check")
  throw new Error(`The production closure carries ${drifted.length} dev-stamped seats. Run sync to heal the lock.`);
