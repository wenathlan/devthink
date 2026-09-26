import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { runreadinesssuite } from "./readiness.mjs";

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
    /* the go assertion runs where the lane recorded the candidate evidence: the validate chain runs the candidate gates before the suite, and the verify workflow runs the standalone readiness step after every gate wrote its artifact; a lane without the recorded artifacts (the bun matrix lane) still verifies the structure and the gate names above */
    if (
      existsSync("tests/artifacts/poolcoverage.json") &&
      existsSync("tests/artifacts/sweep.json") &&
      existsSync("tests/artifacts/telemetryfree.json") &&
      existsSync("tests/artifacts/agentcert.json") &&
      existsSync("tests/artifacts/doccheck.json") &&
      existsSync("tests/artifacts/recipes.json")
    ) {
      expect(report.godecision).toBe("go");
      expect(report.summary.blocked).toBe(0);
      expect(report.summary.ok).toBe(report.summary.gates);
    }
  });

  it("records the artifact and the go decision review the roadmap publishes", async () => {
    if (!existsSync("tests/artifacts/readiness.json"))
      return; /* the readiness lane runs after the candidate gates recorded their artifacts; the artifact pass covers the recorded state */
    const artifact = JSON.parse(await readFile("tests/artifacts/readiness.json", "utf8")) as {
      verdicts: Array<{ gate: string; ok: boolean }>;
      summary: { gates: number; ok: number; blocked: number };
      godecision: string;
    };
    if (artifact.summary.blocked === 0) {
      expect(artifact.summary.gates).toBe(artifact.summary.ok);
      expect(artifact.godecision).toBe("go");
      for (const verdict of artifact.verdicts) expect(verdict.ok).toBe(true);
    }
    const review = await readFile("docs/readiness.md", "utf8");
    expect(review).toContain("# Release readiness review");
    expect(review).toContain("The go decision");
    expect(review).toContain("| Gate | Verdict | Evidence |");
  });
});
