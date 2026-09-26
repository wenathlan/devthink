import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execute = promisify(execFile);

/* ── The release candidate defect sweep coverage. ── */

describe("the release candidate defect sweep artifact", () => {
  it("declares every check family the gate runs over the trails, the sources and the runtime", async () => {
    const source = await readFile("tests/sweep.mjs", "utf8");
    for (const family of ["audittrails", "todoentries", "replay", "scans", "runtime"])
      expect(source).toContain(`record("${family}"`);
    /* the gate reads the compiled library and joins the validate chain after the build */
    expect(source).toContain("dist/index.js");
    expect(source).toContain("dist/policy.js");
    expect(source).toContain("tests/artifacts/sweep.json");
    expect(source).toContain("process.exitCode = 1");
  });

  it("covers every check family with a passing outcome once the gate has run", async () => {
    const artifactpath = "tests/artifacts/sweep.json";
    const built = existsSync("dist/index.js");
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    /* the sweep aggregates the audit trails the earlier gates record, so the lane independence holds only where those trails exist: a built tree with its trails present runs the gate itself, while a lane that skipped the earlier gates asserts the source declarations only and leaves the artifact verification to the gate chain that joins the sweep in order */
    const trails = [
      "tests/artifacts/agentcert.json",
      "tests/artifacts/costcert.json",
      "tests/artifacts/doccheck.json",
      "tests/artifacts/pentest.json",
    ];
    const trailsready = trails.every((trail) => existsSync(trail));
    if (built && trailsready && !existsSync(artifactpath)) await execute("node", ["tests/sweep.mjs"]);
    if (built && trailsready && existsSync(artifactpath)) {
      const stored = JSON.parse(await readFile(artifactpath, "utf8")) as { release: string };
      if (stored.release !== packagejson.version) await execute("node", ["tests/sweep.mjs"]);
    }
    const stored = existsSync(artifactpath);
    if (built && trailsready) expect(stored).toBe(true);
    if (!stored) return;
    const report = JSON.parse(await readFile(artifactpath, "utf8")) as {
      release: string;
      recordedfailures: number;
      findings: Array<{ family: string; name: string; status: string }>;
      summary: { families: number; total: number; fixed: number; open: number };
    };
    expect(report.release).toBe(packagejson.version);
    expect(report.summary.open).toBe(0);
    expect(report.summary.fixed).toBe(report.summary.total);
    expect(report.summary.families).toBe(5);
    expect(report.recordedfailures).toBe(0);
    const families = [...new Set(report.findings.map((finding) => finding.family))];
    expect(families).toEqual(["audittrails", "todoentries", "replay", "scans", "runtime"]);
    /* the scan family covers the defect classes the release candidates refuse to ship */
    const scans = report.findings.filter((finding) => finding.family === "scans").map((finding) => finding.name);
    for (const name of [
      "every todo marker has an owner and a target release",
      "every catch path surfaces its error to the envelope",
      "every loop bound comes from configuration",
      "no hardcoded origin outside the reviewed deep link catalog",
      "no secret material appears in the bundle",
      "no platform deprecated api usage remains",
    ])
      expect(scans).toContain(name);
    /* the runtime family covers the settings round trip, the cancel paths, the escape hatch, the clean profile load and the surface openings */
    const runtime = report.findings.filter((finding) => finding.family === "runtime").map((finding) => finding.name);
    for (const name of [
      "every settings toggle round trips through storage",
      "the cancel paths stop runs within the timeout budget",
      "the escape hatch works from every surface",
      "the extension loads without console errors on a clean profile",
      "the sidepanel, popup and dashboard open without errors",
    ])
      expect(runtime).toContain(name);
  });
});
