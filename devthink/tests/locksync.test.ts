/**
 * locksync.test.ts — the release cascade heal law
 * (the owner order: the PR must stay green until everything is green —
 * "tem que resolver até ficar tudo verde, esse tá sendo o principal
 * problema"). The v2.0.164/165/166 releases reddened their whole asset
 * ladder on two drift classes this battery pins so the regression never
 * lands silently again:
 *
 * - the lockfile seat: every pnpm lock the family carries walks the SAME
 *   specifiers its manifest declares (the manifestemplate wave bumped the
 *   @wenathlan sibling rungs to ~2.0.165 while the locks still froze the
 *   ~2.0.155 era, so every frozen-lockfile install — the family container
 *   archive lane, the family mobile android lane — died on
 *   ERR_PNPM_OUTDATED_LOCKFILE and the release lost its assets);
 * - the engines seat: the container builder reads the bun floor from the
 *   ROOT manifest alone (the manifestemplate law emptied the app copy the
 *   devthink Dockerfile once read, so the builder died on the engines.bun
 *   TypeError and the container archive froze);
 * - the npm seat: the saddle package-lock answers the manifest dependency
 *   set (the saddle plan lanes died on EUSAGE missing seats).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseAllDocuments } from "yaml";

/** the eleven application folders of the monorepo (the os beside the family) */
const APPS = [
  "argan",
  "cadria",
  "cobaia",
  "debonair",
  "devthink",
  "forge",
  "foundry",
  "getry",
  "saddle",
  "stealthhead",
  "vault",
] as const;

const reporoot = join(import.meta.dirname, "..", "..");

type Manifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

/** the manifest seat the lock must mirror, spec for spec */
const manifestseats = (manifest: Manifest): Array<[string, string]> => {
  const seats = new Map<string, string>();
  for (const section of ["dependencies", "devDependencies", "optionalDependencies"] as const)
    for (const [name, spec] of Object.entries(manifest[section] ?? {})) seats.set(name, spec);
  return [...seats.entries()].sort(([a], [b]) => a.localeCompare(b));
};

/** the pnpm 12 lock answers as multiple yaml documents (the importers
 * front matter beside the packages book) — the root importer walks the
 * document that carries it */
const lockroot = (source: string): Record<string, unknown> => {
  for (const doc of parseAllDocuments(source)) {
    const value = doc.toJS() as Record<string, unknown>;
    const importers = value?.importers as Record<string, Record<string, unknown>> | undefined;
    if (importers?.["."] && "dependencies" in importers["."]) return value;
  }
  return {};
};

/** the override pins the workspace stamps (pnpm rewrites the importer
 * specifiers through them, so an overridden seat answers the pin, never
 * the manifest range) */
const overridepins = (workspacepath: string): Record<string, string> => {
  if (!existsSync(workspacepath)) return {};
  const doc = parseAllDocuments(readFileSync(workspacepath, "utf8")).map((d) => d.toJS() as Record<string, unknown>);
  for (const value of doc) {
    const overrides = value?.overrides as Record<string, string> | undefined;
    if (overrides) return overrides;
  }
  return {};
};

describe("the lockfile seat (the frozen-lockfile install law)", () => {
  for (const app of APPS) {
    const lockpath = join(reporoot, app, "pnpm-lock.yaml");
    if (!existsSync(lockpath)) continue;
    it(`${app}: the pnpm lock walks the manifest specifiers, no drift`, () => {
      const manifest = JSON.parse(readFileSync(join(reporoot, app, "package.json"), "utf8")) as Manifest;
      const lock = lockroot(readFileSync(lockpath, "utf8")) as {
        importers?: Record<string, { dependencies?: Record<string, { specifier?: string }>; devDependencies?: Record<string, { specifier?: string }> }>;
      };
      const root = lock.importers?.["."];
      const pins = overridepins(join(reporoot, app, "pnpm-workspace.yaml"));
      const lockspecs = new Map<string, string>();
      for (const section of ["dependencies", "devDependencies"] as const)
        for (const [name, entry] of Object.entries(root?.[section] ?? {})) {
          /* the entry answers the registry string or the workspace record —
           * the object seat alone carries the specifier the lock pins. */
          const record = entry as string | { specifier?: string } | undefined;
          const specifier = typeof record === "object" && record !== undefined ? record.specifier : undefined;
          if (typeof specifier === "string") lockspecs.set(name, specifier);
        }
      const drifted: string[] = [];
      for (const [name, spec] of manifestseats(manifest))
        if (spec.startsWith("file:")) continue; /* the sibling sources the context stages, never a registry seat */
        else if (lockspecs.get(name) === spec) continue; /* the natural seat */
        else if (name in pins && lockspecs.get(name) === pins[name]) continue; /* the override pin the workspace stamps */
        else drifted.push(`${name}: manifest ${spec} vs lock ${lockspecs.get(name) ?? "<absent>"}`);
      expect(drifted, `the drifted seats: ${drifted.join("; ")}`).toEqual([]);
    });
  }
});

describe("the engines seat (the one-hop-up root manifest law)", () => {
  it("the devthink container builder reads the bun floor from the root manifest seat", () => {
    const dockerfile = readFileSync(join(reporoot, "devthink", "Dockerfile"), "utf8");
    /* the engines live in the root manifest alone — every container read
     * answers the /package.json the context root carries, never the app
     * copy the manifestemplate wave emptied */
    expect(dockerfile).not.toMatch(/require\('\.\/package\.json'\)\.engines\.bun/);
    expect(dockerfile.match(/require\('\/package\.json'\)\.engines\.bun/g)?.length).toBeGreaterThanOrEqual(2);
    /* the root manifest rides the context before the toolchain reads it */
    const copies = [...dockerfile.matchAll(/^COPY package\.json \/package\.json$/gm)];
    expect(copies.length).toBeGreaterThanOrEqual(2);
    const firstread = dockerfile.indexOf("require('/package.json').engines.bun");
    const firstcopy = dockerfile.indexOf("COPY package.json /package.json");
    expect(firstcopy).toBeGreaterThanOrEqual(0);
    expect(firstcopy).toBeLessThan(firstread);
  });
});

describe("the npm seat (the saddle plan install law)", () => {
  it("saddle: the package-lock answers the manifest dependency set", () => {
    const lockpath = join(reporoot, "saddle", "package-lock.json");
    if (!existsSync(lockpath)) return;
    const manifest = JSON.parse(readFileSync(join(reporoot, "saddle", "package.json"), "utf8")) as Manifest;
    const lock = JSON.parse(readFileSync(lockpath, "utf8")) as {
      packages?: Record<string, { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }>;
    };
    const root = lock.packages?.[""] ?? {};
    const locked = new Map<string, string>([
      ...Object.entries(root.dependencies ?? {}),
      ...Object.entries(root.devDependencies ?? {}),
    ]);
    const missing: string[] = [];
    for (const [name, spec] of manifestseats(manifest))
      if (spec.startsWith("file:")) continue;
      else if (locked.get(name) !== spec) missing.push(`${name}: manifest ${spec} vs lock ${locked.get(name) ?? "<absent>"}`);
    expect(missing, `the missing seats: ${missing.join("; ")}`).toEqual([]);
  });
});
