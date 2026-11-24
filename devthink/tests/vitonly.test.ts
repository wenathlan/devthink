// # vitonly.test — the family runner-and-folder law cell (the vitest-only
// law and the tests-folder TS law the owner charged): the family batteries
// run on vitest exclusively (any test importing or registering node:test is
// the violation — node:assert stays lawful), every app's test folder rides
// the one spelling the gates read (tests/, the seat every vitest config
// includes) and answers TypeScript only (no json/mjs/cjs/images in the
// test folders — the codefixtures grammar carries the fixture seats), and
// every app's npm test script answers vitest run so the ci family lane
// walks one runner the family template names. the seat rides the same
// context law the infrawave cell walks: the container cut ships the app
// surfaces without the sibling roots, so the walk skips there and the
// monorepo lanes red it instead.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const approot = join(import.meta.dirname, "..");
const reporoot = join(approot, "..");

const apps = [
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

const familyroot = apps.some((app) => existsSync(join(reporoot, app, "tests")));

/** the node:test registration grammar: any import of the node built-in
 * runner (static, dynamic or require) is the violation — node:assert
 * imports never match because the specifier differs. */
const nodetest = /(?:from|import|require)\s*\(?\s*["']node:test["']/;

/** one app's test folder audit: the files it carries and whether any
 * imports the node built-in runner. */
function audit(app: string) {
  const dir = join(reporoot, app, "tests");
  const files = readdirSync(dir).filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"));
  const foreign = readdirSync(dir).filter((name) => !name.endsWith(".ts") && !name.endsWith(".tsx"));
  const hits: string[] = [];
  for (const file of files) {
    const text = readFileSync(join(dir, file), "utf8");
    if (nodetest.test(text)) hits.push(`${app}/tests/${file}`);
  }
  return { files, foreign, hits };
}

describe("the family runner-and-folder law", () => {
  it.skipIf(!familyroot)("every app's test folder carries TypeScript only", () => {
    for (const app of apps) {
      const { foreign } = audit(app);
      expect(foreign, `${app}/test carries foreign files: ${foreign.join(", ")}`).toEqual([]);
    }
  });

  it.skipIf(!familyroot)("no test file imports or registers node:test", () => {
    const hits: string[] = [];
    for (const app of apps) hits.push(...audit(app).hits);
    expect(hits, "node:test imports are the violation; the family rides vitest").toEqual([]);
  });

  it.skipIf(!familyroot)("every app's test script answers vitest run", () => {
    for (const app of apps) {
      const pkg = JSON.parse(readFileSync(join(reporoot, app, "package.json"), "utf8")) as {
        scripts?: Record<string, string>;
      };
      expect(pkg.scripts?.test, `${app} must ride vitest run (the vitest-only law)`).toBe("vitest run");
    }
  });

  it.skipIf(!familyroot)("every app's vitest config reads the tests/ folder seat", () => {
    for (const app of apps) {
      const config = readFileSync(join(reporoot, app, "vitest.config.ts"), "utf8");
      expect(config, `${app}/vitest.config.ts must include tests/*.test.ts`).toContain('include: ["tests/*.test.ts"]');
    }
  });

  it.skipIf(!familyroot)("the debonair battery walks serial — the runner's memory law", () => {
    /* the serial suite seat: the hosted runner's memory ceiling killed the
     * runner service mid-suite three runs straight (every completed file
     * green, the deaths always mid-suite, never a failed assertion — the
     * file parallelism answered the audio dsp with overlapping worker
     * peaks). the file lane rides single-file through the CONFIG the
     * runner reads, never the script: the vitest-only law keeps its exact
     * vitest run seat and the memory law still answers. */
    const config = readFileSync(join(reporoot, "debonair", "vitest.config.ts"), "utf8");
    expect(config, "the debonair file lane rides single-file (fileParallelism: false)").toContain(
      "fileParallelism: false",
    );
  });

  it.skipIf(!familyroot)("the family rides the one tests folder spelling the gates read", () => {
    for (const app of apps) {
      expect(existsSync(join(reporoot, app, "tests")), `${app} carries the tests/ seat the vitest configs include`).toBe(
        true,
      );
      // the one-spelling law: no second test/ seat may carry content beside
      // the tests/ folder the configs include (an empty local artifact dir
      // never tracks, so only real files reddens the cell).
      const second = join(reporoot, app, "test");
      if (existsSync(second)) {
        const stray: string[] = [];
        const walk = (dir: string): void => {
          for (const entry of readdirSync(dir, { withFileTypes: true })) {
            if (entry.isDirectory()) walk(join(dir, entry.name));
            else stray.push(join(app, "test", entry.name));
          }
        };
        walk(second);
        expect(stray, `${app} carries content in a second test/ spelling: ${stray.join(", ")}`).toEqual([]);
      }
    }
  });
});
