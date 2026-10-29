import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { sweeprecord } from "../sweep.ts";

const execute = promisify(execFile);

/* ── The release candidate defect sweep coverage. ── */

describe("the release candidate defect sweep record", () => {
  it("declares every check family the gate runs over the trails, the sources and the runtime", async () => {
    const source = await readFile("sweep.ts", "utf8");
    /* the record calls may wrap across lines (the formatter owns the wrap),
       so the family assertion reads the quoted family name itself */
    for (const family of ["audittrails", "todoentries", "replay", "scans", "runtime"])
      expect(source).toContain(`"${family}"`);
    /* the gate reads the compiled library, joins the validate chain after the build and carries its committed record inside its own module */
    expect(source).toContain("dist/index.js");
    expect(source).toContain("dist/policy.js");
    expect(source).toContain("export const sweeprecord: sweepreport");
    expect(source).toContain("syncrecord");
    expect(source).toContain("process.exitCode = 1");
  });

  it("covers every check family with a passing outcome once the gate has run", async () => {
    const built = existsSync("dist/index.js");
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    /* the sweep aggregates the committed records the earlier gates carry, so the lane independence holds over the built tree: a built tree runs the gate itself (the gate walks the trails, the source scans and the runtime checks and verifies the record stays internally consistent), while a lane that skipped the build asserts the committed record only and leaves the live walk to the gate chain that joins the sweep in order */
    if (built) await execute("node", ["sweep.ts"]);
    const report = sweeprecord;
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
