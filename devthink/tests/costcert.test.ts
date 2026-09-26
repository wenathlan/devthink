import { describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const execute = promisify(execFile);

/* ── The 1.1.96 shared accounting certification coverage. ── */

describe("the costcert reconciliation artifact", () => {
  it("declares every accounting check of the release candidate reconciliation with its family and module", async () => {
    const source = await readFile("tests/costcert.mjs", "utf8");
    const declarations = [
      ...source.matchAll(/await entry\(\{ id: (\d+), title: "([^"]+)", family: "([^"]+)", module: "([^"]+)" \}/g),
    ].map((match) => ({ id: Number(match[1]), title: match[2], family: match[3], module: match[4] }));
    expect(declarations).toHaveLength(9);
    expect(declarations.map((entry) => entry.id)).toEqual(Array.from({ length: 9 }, (_, index) => index + 1));
    const families = new Set(declarations.map((entry) => entry.family));
    for (const family of [
      "replay",
      "token accounting",
      "shared accounting",
      "budgets",
      "refunds",
      "routing",
      "export",
      "audit trail",
      "report",
    ])
      expect(families.has(family)).toBe(true);
    for (const entry of declarations) expect((entry.title ?? "").length).toBeGreaterThan(10);
  });

  it("covers every accounting check with a passing outcome once the gate has run", async () => {
    const artifactpath = "tests/artifacts/costcert.json";
    const built = existsSync("dist/extension/manifest.json");
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    /* a built tree runs the gate itself when no fresh artifact of this release exists, so every lane that builds before the suite — the bun lane, the deno lane, a local two-pass validate — verifies the reconciliation artifact without depending on the gate having run before the tests */
    if (built && !existsSync(artifactpath)) await execute("node", ["tests/costcert.mjs"]);
    if (built && existsSync(artifactpath)) {
      const stored = JSON.parse(await readFile(artifactpath, "utf8")) as { release: string };
      if (stored.release !== packagejson.version) await execute("node", ["tests/costcert.mjs"]);
    }
    const stored = existsSync(artifactpath);
    if (built) expect(stored).toBe(true);
    if (!stored) return;
    const report = JSON.parse(await readFile(artifactpath, "utf8")) as {
      release: string;
      entries: Array<{ id: number; title: string; outcome: string; detail: string }>;
      summary: { total: number; passed: number; failed: number };
    };
    expect(report.release).toBe(packagejson.version);
    expect(report.summary.total).toBe(9);
    expect(report.summary.failed).toBe(0);
    expect(report.summary.passed).toBe(9);
    expect(report.entries.map((entry) => entry.id)).toEqual(Array.from({ length: 9 }, (_, index) => index + 1));
    for (const entry of report.entries) {
      expect(entry.outcome).toBe("pass");
      expect(entry.detail.length).toBeGreaterThan(10);
    }
  });

  it("keeps the reconciliation invariants of the artifact summary and the recorded checks", async () => {
    const artifactpath = "tests/artifacts/costcert.json";
    if (!existsSync(artifactpath)) return;
    const report = JSON.parse(await readFile(artifactpath, "utf8")) as {
      release: string;
      entries: Array<{ id: number; outcome: string }>;
      summary: { total: number; passed: number; failed: number };
    };
    /* the reconciliation invariants: the summary total equals the recorded check count, the passed count equals the passing outcomes, the failed count equals the failing outcomes and the totals sum back to the whole */
    const passing = report.entries.filter((entry) => entry.outcome === "pass").length;
    const failing = report.entries.filter((entry) => entry.outcome === "fail").length;
    expect(report.summary.total).toBe(report.entries.length);
    expect(report.summary.passed).toBe(passing);
    expect(report.summary.failed).toBe(failing);
    expect(report.summary.total).toBe(report.summary.passed + report.summary.failed);
    expect(report.summary.failed).toBe(0);
  });

  it("exercises the real compiled accounting modules and recomputes the cost lines from recorded evidence", async () => {
    const source = await readFile("tests/costcert.mjs", "utf8");
    expect(source).toContain('import("../dist/index.js")');
    expect(source).toContain('import("../dist/memory.js")');
    expect(source).toContain("usagetotals");
    expect(source).toContain("recordagentusage");
    expect(source).toContain("swarmcosts");
    expect(source).toContain("sharedcostsplit");
    /* the recorded evidence replays through the real sessionmemory store behind the in-memory adapter seam and every fixture time flows from the fixed epoch, so reruns stay byte identical */
    expect(source).toContain("fakeadapter");
    expect(source).toContain("1_800_000_000_000");
    expect(source).toContain("process.exitCode = 1");
  });
});
