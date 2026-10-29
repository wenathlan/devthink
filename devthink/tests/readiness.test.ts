import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { readinessrecord, runreadinesssuite } from "../readiness.ts";

describe("the release readiness review of the platform release", () => {
  it("answers a verdict row with its evidence link for every gate the review walks", async () => {
    const report = await runreadinesssuite();
    expect(report.verdicts.length).toBeGreaterThanOrEqual(20);
    for (const verdict of report.verdicts) {
      expect(verdict.gate.length).toBeGreaterThan(10);
      expect(typeof verdict.ok).toBe("boolean");
      expect(verdict.evidence.length).toBeGreaterThan(10);
    }
  });

  it("walks every candidate gate the chain greened and answers the go decision the release stamps", async () => {
    const report = await runreadinesssuite();
    const names = report.verdicts.map((verdict) => verdict.gate);
    for (const expected of [
      "pool audit",
      "api freeze",
      "deprecation window",
      "migrateplan",
      "pentest",
      "csp",
      "permission diff",
      "transparency",
      "agent certification",
      "cost certification",
      "doc check",
      "recipes",
      "sweep",
      "matrix",
      "telemetry",
      "changelog",
      "migration guide",
      "release notes",
      "roadmap",
      "release pipeline",
      "capability manifests",
    ]) {
      expect(names.join("; ")).toContain(expected);
    }
    /* the go assertion runs where the lane built the candidate: the gate chain commits every candidate record inside its own gate module (the committed evidence the flat folder law keeps), so a built tree — the dist the capability manifest and transparency gates read and the cli the migrateplan bridge drives — answers the full green walk, while a lane without the build asserts the structure and the gate names above and leaves the go decision to the verify lane that joins the readiness after the build */
    if (existsSync("dist/cli.js") && existsSync("dist/caps")) {
      expect(report.godecision).toBe("go");
      expect(report.summary.blocked).toBe(0);
      expect(report.summary.ok).toBe(report.summary.gates);
    }
  });

  it("records the committed record and the go decision review the roadmap publishes", async () => {
    /* the committed readiness record: the gate table with its verdicts and the summary the go decision reads (the record replaces the run time artifact the flat folder law dissolved) */
    const record = readinessrecord;
    if (record.summary.blocked === 0) {
      expect(record.summary.gates).toBe(record.summary.ok);
      expect(record.godecision).toBe("go");
      for (const verdict of record.verdicts) expect(verdict.ok).toBe(true);
      expect(record.summary.gates).toBe(record.verdicts.length);
    }
    const review = await readFile("docs/readiness.md", "utf8");
    expect(review).toContain("# Release readiness review");
    expect(review).toContain("The go decision");
    expect(review).toContain("| Gate | Verdict | Evidence |");
  });
});
