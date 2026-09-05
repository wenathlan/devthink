import { describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { runrecipessuite } from "./recipes.mjs";
import type { recipereport } from "./recipes.mjs";

const execute = promisify(execFile);
const gallerypath = "tests/code/recipes/gallery.json";
const recipesdirectory = "tests/code/recipes";
const pagesdirectory = "tests/code/pages";
const artifactpath = "tests/artifacts/recipes.json";
const expectedcategories = { scraping: 8, forms: 9, testing: 8, monitoring: 6, agents: 5 };

/** One gallery index entry with the metadata the runner validates. */
interface galleryentry {
  id: string;
  category: string;
  difficulty: string;
  description: string;
  fixture: string;
  origin: string;
  expecteddurationms: number;
  capabilities: string[];
  consentclasses: string[];
  kinds: string[];
  exportformat?: string;
  schedule?: string;
  topology?: string;
}

/** The gallery index of the 36 recipes: the index metadata beside the fixture page declarations. */
interface galleryindex {
  version: string;
  fixturepages: Array<{ name: string; origin: string; features: string[] }>;
  entries: galleryentry[];
}

/** One recipe plan document the directory carries: the origin and the steps the grammar and lint checks read. */
interface recipedocument {
  origin: string;
  grants?: string[];
  steps: Array<{ id: string; kind: string; options?: string }>;
}

/** Collects every action kind one recipe names: the top level step kinds beside the child kinds nested in the control payloads of the options (the parallel branches, the loop bodies and the branch paths), so the grammar check reads the same surface the runner reads. */
function kindswithin(recipe: recipedocument): string[] {
  const kinds: string[] = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) { for (const item of value) walk(item); return; }
    if (value === null || typeof value !== "object") return;
    const candidate = value as Record<string, unknown>;
    if (typeof candidate.kind === "string") kinds.push(candidate.kind);
    for (const child of Object.values(candidate)) walk(child);
  };
  for (const step of recipe.steps) {
    kinds.push(step.kind);
    if (step.options !== undefined) { try { walk(JSON.parse(step.options)); } catch { /* the option grammar check of the runner reports the malformed payload */ } }
  }
  return [...new Set(kinds)];
}

/* ── The 2.0.0 example gallery coverage: the source grammar pass, the suite run over the built tree and the recorded artifact. ── */

describe("the example gallery of the 2.0.0 release", () => {
  it("parses every recipe with the lowercase kind grammar and the category metadata the index declares", async () => {
    const gallery = JSON.parse(await readFile(gallerypath, "utf8")) as galleryindex;
    expect(gallery.entries.length).toBe(36);
    /* no gallery entry id duplicates: the index names every recipe exactly once */
    expect(new Set(gallery.entries.map(entry => entry.id)).size).toBe(36);
    /* every recipe file of the directory other than the index joins the index, and every index entry names its file */
    const recipefiles = (await readdir(recipesdirectory)).filter(file => file.endsWith(".json") && file !== "gallery.json").sort();
    expect(recipefiles.length).toBe(36);
    const recipes = new Map<string, recipedocument>();
    for (const file of recipefiles) {
      const parsed = JSON.parse(await readFile(join(recipesdirectory, file), "utf8")) as recipedocument;
      recipes.set(file.replace(".json", ""), parsed);
    }
    expect(new Set([...recipes.keys(), ...gallery.entries.map(entry => entry.id)]).size).toBe(36);
    /* every step kind stays lowercase letter only: the workflow step grammar rejects digits (the a11ytree incident), so the gallery ships no kind the compose engine would refuse */
    const digitkinds = [...recipes].flatMap(([id, recipe]) => kindswithin(recipe).filter(kind => !/^[a-z]+$/.test(kind)).map(kind => `${id} carries ${kind}`));
    expect(digitkinds).toEqual([]);
    /* the monitoring entries declare their five field cron schedules, the agent entries their topologies and the scraping entries their export formats */
    for (const entry of gallery.entries) {
      if (entry.category === "monitoring") expect(entry.schedule).toMatch(/^(\*|\d+)(\/\d+)? (\*|\d+) (\*|\d+) (\*|\d+) (\*|\d+)$/);
      if (entry.category !== "monitoring") expect(entry.schedule).toBeUndefined();
      if (entry.category === "agents") expect(["swarm", "review", "parallel", "monitor", "compete"]).toContain(entry.topology);
      if (entry.category !== "agents") expect(entry.topology).toBeUndefined();
      if (entry.category === "scraping") expect(["csv", "json", "excel"]).toContain(entry.exportformat);
      if (entry.category !== "scraping") expect(entry.exportformat).toBeUndefined();
    }
  });

  it("runs the gallery suite green over the built tree", { timeout: 120_000 }, async () => {
    const built = existsSync("dist/gallery.json");
    /* the suite needs the built fixture copies the packages ship, so a lane without a build asserts the source pass only */
    if (!built) return;
    const report = await runrecipessuite();
    expect(report.gallery.entries).toBe(36);
    expect(report.gallery.fixtures).toBe(4);
    expect(report.gallery.categories).toEqual(expectedcategories);
    expect(report.summary.entries).toBe(36);
    expect(report.summary.passed).toBe(36);
    expect(report.summary.failed).toBe(0);
    expect(report.summary.checksok).toBe(report.summary.checks);
    expect(report.checks.every(check => check.ok)).toBe(true);
    expect(report.entries.length).toBe(36);
    expect(report.entries.every(entry => entry.outcome === "pass")).toBe(true);
    expect(report.entries.every(entry => entry.durationms >= 0)).toBe(true);
  });

  it("covers every gallery entry of the index in the recorded artifact", async () => {
    const built = existsSync("dist/gallery.json");
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    /* a built tree runs the gate itself when no fresh artifact of this release exists, so every lane that builds before the suite verifies the gallery artifact without depending on gate ordering */
    if (built && !existsSync(artifactpath)) await execute("node", ["tests/recipes.mjs"]);
    if (built && existsSync(artifactpath)) {
      const stored = JSON.parse(await readFile(artifactpath, "utf8")) as { release: string };
      if (stored.release !== packagejson.version) await execute("node", ["tests/recipes.mjs"]);
    }
    const stored = existsSync(artifactpath);
    if (built) expect(stored).toBe(true);
    if (!stored) return;
    const gallery = JSON.parse(await readFile(gallerypath, "utf8")) as galleryindex;
    const report = JSON.parse(await readFile(artifactpath, "utf8")) as recipereport;
    /* the artifact answers the current release with every entry passing and every check ok */
    expect(report.release).toBe(packagejson.version);
    expect(report.gallery.entries).toBe(36);
    expect(report.gallery.categories).toEqual(expectedcategories);
    expect(report.summary.failed).toBe(0);
    expect(report.summary.passed).toBe(report.summary.entries);
    expect(report.summary.checksok).toBe(report.summary.checks);
    /* the recorded entries cover every entry of the gallery index exactly, each with a passing outcome and a recorded duration */
    expect(report.entries.map(entry => entry.id).sort()).toEqual(gallery.entries.map(entry => entry.id).sort());
    expect(report.entries.every(entry => entry.outcome === "pass")).toBe(true);
    expect(report.entries.every(entry => entry.durationms >= 0)).toBe(true);
    /* the four fixture pages ship beside the recipes in the sources and in the built fixture set the packages carry */
    const sourcepages = new Set((await readdir(pagesdirectory)).filter(file => file.endsWith(".html")));
    for (const page of gallery.fixturepages) {
      expect(sourcepages.has(page.name)).toBe(true);
      if (built) expect(existsSync(join("dist", "fixtures", "pages", page.name))).toBe(true);
    }
  });
});
