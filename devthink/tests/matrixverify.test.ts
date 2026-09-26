import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execute = promisify(execFile);

/* ── The release candidate verification matrix coverage. ── */

describe("the release candidate verification matrix artifact", () => {
  it("declares every cell family the gate enumerates over the candidate surface", async () => {
    const source = await readFile("tests/matrixverify.mjs", "utf8");
    for (const family of ["kinds", "surfaces", "cli", "mcp", "migration", "importers", "gates"])
      expect(source).toContain(`family: "${family}"`);
    /* the gate covers the fake tab provider of every browser kind, the full kind catalog and the standing gates */
    expect(source).toContain('["chromium", "firefox", "safari"]');
    expect(source).toContain("actionkindcatalog");
    expect(source).toContain("tests/artifacts/matrixverify.json");
    expect(source).toContain("process.exitCode = 1");
  });

  it("covers every matrix cell with a passing outcome once the gate has run", async () => {
    const artifactpath = "tests/artifacts/matrixverify.json";
    const built = existsSync("dist/index.js");
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    /* the matrix joins the recorded artifacts of the agent, cost, documentation and sweep gates beside its self contained subprocess cells, so the lane independence holds only where those artifacts exist: a built tree with its inputs present runs the gate itself, while a lane that skipped the earlier gates asserts the source declarations only and leaves the matrix verification to the gate chain that joins the matrix in order */
    const inputs = [
      "tests/artifacts/agentcert.json",
      "tests/artifacts/costcert.json",
      "tests/artifacts/doccheck.json",
      "tests/artifacts/sweep.json",
    ];
    const inputsready = inputs.every((input) => existsSync(input));
    if (built && inputsready && !existsSync(artifactpath)) await execute("node", ["tests/matrixverify.mjs"]);
    if (built && inputsready && existsSync(artifactpath)) {
      const stored = JSON.parse(await readFile(artifactpath, "utf8")) as { release: string };
      if (stored.release !== packagejson.version) await execute("node", ["tests/matrixverify.mjs"]);
    }
    const stored = existsSync(artifactpath);
    if (built && inputsready) expect(stored).toBe(true);
    if (!stored) return;
    const report = JSON.parse(await readFile(artifactpath, "utf8")) as {
      release: string;
      matrix: { browsers: string[]; kinds: number; cells: number };
      cells: Array<{ family: string; name: string; outcome: string }>;
      coverage: number;
      summary: { total: number; passed: number; failed: number };
    };
    expect(report.release).toBe(packagejson.version);
    expect(report.summary.failed).toBe(0);
    expect(report.summary.passed).toBe(report.summary.total);
    expect(report.coverage).toBe(100);
    expect(report.matrix.browsers).toEqual(["chromium", "firefox", "safari"]);
    expect(report.matrix.kinds).toBeGreaterThan(300);
    expect(report.matrix.cells).toBe(report.summary.total);
    /* the kind cells cover every browser kind of the fake tab provider */
    for (const browser of report.matrix.browsers) {
      expect(report.cells.some((cell) => cell.family === "kinds" && cell.name.includes(browser))).toBe(true);
    }
    /* the gate cells cover the poolaudit, the api freeze, the csp audit and the permission diff as subprocess runs, and the agentcert, costcert, doccheck and sweep artifacts as recorded evidence */
    const gates = report.cells.filter((cell) => cell.family === "gates").map((cell) => cell.name);
    for (const name of [
      "the pool audit gate runs green over the 626 item pool",
      "the api freeze gate runs green over the frozen contract",
      "the csp audit gate runs green over the content security policy",
      "the permission diff gate runs green over the versioned baseline",
      "the agentcert artifact records a green run",
      "the costcert artifact records a green run",
      "the doccheck artifact records a green run",
      "the sweep artifact records a green run",
    ])
      expect(gates).toContain(name);
    /* the migration cell covers the version one window and the importer cells cover the fixture formats */
    expect(report.cells.some((cell) => cell.family === "migration" && cell.name.includes("version one"))).toBe(true);
    expect(report.cells.filter((cell) => cell.family === "importers").length).toBeGreaterThanOrEqual(3);
  });
});

describe("the release candidate pool audit artifact", () => {
  it("records the full pool disposition with no unknown item", async () => {
    const artifactpath = "tests/artifacts/poolcoverage.json";
    const built = existsSync("dist/index.js");
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    if (built && !existsSync(artifactpath)) await execute("node", ["tests/poolaudit.mjs"]);
    if (built && existsSync(artifactpath)) {
      const stored = JSON.parse(await readFile(artifactpath, "utf8")) as { release: string };
      if (stored.release !== packagejson.version) await execute("node", ["tests/poolaudit.mjs"]);
    }
    const stored = existsSync(artifactpath);
    if (built) expect(stored).toBe(true);
    if (!stored) return;
    const report = JSON.parse(await readFile(artifactpath, "utf8")) as {
      release: string;
      corpus: number;
      pool: { total: number; implemented: number; planned: number; unknown: number };
      groups: Record<string, { total: number; implemented: number; planned: number; unknown: number }>;
      summary: { failed: number };
    };
    expect(report.release).toBe(packagejson.version);
    expect(report.summary.failed).toBe(0);
    expect(report.pool.total).toBe(626);
    expect(report.pool.unknown).toBe(0);
    expect(report.pool.implemented).toBeGreaterThan(590);
    expect(report.pool.implemented + report.pool.planned).toBe(report.pool.total);
    const groupcount = Object.keys(report.groups).length;
    expect(groupcount).toBeGreaterThan(10);
    for (const group of Object.values(report.groups))
      expect(group.total).toBe(group.implemented + group.planned + group.unknown);
  });
});
