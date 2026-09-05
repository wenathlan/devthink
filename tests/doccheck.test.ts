import { describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const execute = promisify(execFile);

/* ── The documentation consistency check coverage. ── */

describe("the documentation consistency artifact", () => {
  it("declares every check family the gate runs over the documentation", async () => {
    const source = await readFile("tests/doccheck.mjs", "utf8");
    for (const family of ["kindcoverage", "kindfields", "kindexamples", "doclinks", "codefences", "referencetables", "flowdiagrams", "changelogcoverage", "roadmapcoverage", "readmeclaims"]) expect(source).toContain(`record("${family}"`);
    /* the gate reads the compiled catalogs and joins the validate chain after the build */
    expect(source).toContain("dist/policy.js");
    expect(source).toContain("dist/index.js");
    expect(source).toContain("dist/protocol.js");
    expect(source).toContain("process.exitCode = 1");
  });

  it("covers every check family with a passing outcome once the gate has run", async () => {
    const artifactpath = "tests/artifacts/doccheck.json";
    const built = existsSync("dist/policy.js");
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    /* a built tree runs the gate itself when no fresh artifact of this release exists, so every lane that builds before the suite verifies the documentation artifact without depending on gate ordering */
    if (built && !existsSync(artifactpath)) await execute("node", ["tests/doccheck.mjs"]);
    if (built && existsSync(artifactpath)) {
      const stored = JSON.parse(await readFile(artifactpath, "utf8")) as { release: string };
      if (stored.release !== packagejson.version) await execute("node", ["tests/doccheck.mjs"]);
    }
    const stored = existsSync(artifactpath);
    if (built) expect(stored).toBe(true);
    if (!stored) return;
    const report = JSON.parse(await readFile(artifactpath, "utf8")) as { release: string; kindcount: number; checks: Array<{ name: string; ok: boolean }>; summary: { total: number; passed: number; failed: number } };
    expect(report.release).toBe(packagejson.version);
    expect(report.summary.failed).toBe(0);
    expect(report.summary.passed).toBe(report.summary.total);
    expect(report.kindcount).toBeGreaterThan(300);
    expect(report.checks.map(check => check.name)).toEqual(["kindcoverage", "kindfields", "kindexamples", "doclinks", "codefences", "referencetables", "flowdiagrams", "changelogcoverage", "roadmapcoverage", "readmeclaims"]);
  });

  it("keeps the kind documentation generated from the module surface and the flows mermaid", async () => {
    const kinddocs = await readFile("docs/kinddocs.md", "utf8");
    const headings = (kinddocs.match(/^### `([a-z0-9]+)`$/gm) ?? []).length;
    expect(headings).toBeGreaterThan(300);
    for (const family of ["## Interaction kinds", "## Observation kinds", "## Navigation kinds", "## Tab and window kinds", "## Form and data kinds", "## Capture kinds", "## Network kinds", "## Debugging kinds", "## Memory kinds", "## Workflow kinds", "## Protocol kinds", "## Coordination kinds"]) expect(kinddocs).toContain(family);
    const flowdocs = await readFile("docs/flowdocs.md", "utf8");
    expect((flowdocs.match(/```mermaid/g) ?? []).length).toBeGreaterThanOrEqual(12);
    const refdocs = await readFile("docs/refdocs.md", "utf8");
    for (const table of ["## cli command reference", "## protocol message reference", "## error code reference", "## audit event reference", "## configuration key reference", "## storage schema reference", "## capability manifest reference", "## mcp tool reference", "## trigger and scheduler reference", "## permission and consent reference"]) expect(refdocs).toContain(table);
  });
});
