import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { matrixverifyrecord } from "../matrixverify.ts";
import { poolcoveragerecord } from "../poolaudit.ts";

const execute = promisify(execFile);

/* ── The release candidate verification matrix coverage. ── */

describe("the release candidate verification matrix record", () => {
  it("declares every cell family the gate enumerates over the candidate surface", async () => {
    const source = await readFile("matrixverify.ts", "utf8");
    for (const family of ["kinds", "surfaces", "cli", "mcp", "migration", "importers", "gates"])
      expect(source).toContain(`family: "${family}"`);
    /* the gate covers the fake tab provider of every browser kind, the full kind catalog, the standing gates and its committed record */
    expect(source).toContain('["chromium", "firefox", "safari"]');
    expect(source).toContain("actionkindcatalog");
    expect(source).toContain("export const matrixverifyrecord: matrixverifyreport");
    expect(source).toContain("syncrecord");
    expect(source).toContain("process.exitCode = 1");
  });

  /* the matrix lane spawns the whole verification matrix as subprocesses
   * (every browser family cell the gate chain joins), and a cold CI runner
   * walks past the default five second window the lottery hit on the
   * bun lane — the cell walk carries its own sixty second budget. */
  it("covers every matrix cell with a passing outcome once the gate has run", { timeout: 60_000 }, async () => {
    const built = existsSync("dist/index.js");
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    /* the matrix joins the committed records of the agent, cost, documentation and sweep gates beside its self contained subprocess cells, so a built tree runs the gate itself (the gate walks every cell and verifies the record stays internally consistent), while a lane that skipped the build asserts the committed record only and leaves the live cell walk to the gate chain that joins the matrix in order */
    if (built) await execute("node", ["matrixverify.ts"]);
    const report = matrixverifyrecord;
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
    /* the gate cells cover the poolaudit, the api freeze, the csp audit and the permission diff as subprocess runs, and the agentcert, costcert, doccheck and sweep records as committed evidence */
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

describe("the release candidate pool audit record", () => {
  it("records the full pool disposition with no unknown item", async () => {
    const built = existsSync("dist/index.js");
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    /* a built tree runs the gate itself (the gate re-audits the pool against the shipped symbol corpus and verifies the record stays internally consistent), while a lane that skipped the build asserts the committed record only */
    if (built) await execute("node", ["poolaudit.ts"]);
    const report = poolcoveragerecord;
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
