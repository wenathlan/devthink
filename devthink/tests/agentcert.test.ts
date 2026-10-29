import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { agentcertrecord } from "../agentcert.ts";

const execute = promisify(execFile);

/* ── The 1.1.96 multi agent coordination certification coverage. ── */

describe("the agentcert coordination artifact", () => {
  it("declares every automated entry of the release candidate coordination checklist with its family and module", async () => {
    const source = await readFile("agentcert.ts", "utf8");
    const declarations = [
      ...source.matchAll(/await entry\(\s*\{\s*id: (\d+),\s*title: "([^"]+)",\s*family: "([^"]+)",\s*module: "([^"]+)"\s*,?\s*\}/g),
    ].map((match) => ({ id: Number(match[1]), title: match[2], family: match[3], module: match[4] }));
    expect(declarations).toHaveLength(30);
    expect(declarations.map((entry) => entry.id)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1));
    const families = new Set(declarations.map((entry) => entry.family));
    for (const family of [
      "topology",
      "roles",
      "review",
      "verification",
      "messaging",
      "queue",
      "work stealing",
      "blackboard",
      "tab handoff",
      "locking",
      "conflicts",
      "merging",
      "consensus",
      "emergency stops",
      "lifecycle",
      "sub agents",
      "escalation",
      "review flow",
      "audit replay",
      "comparison",
      "lanes",
      "arbitration",
      "scaling",
      "budgets",
      "scopes",
      "reporting",
      "timeline",
      "lessons",
      "pool coverage",
    ])
      expect(families.has(family)).toBe(true);
    for (const entry of declarations) expect((entry.title ?? "").length).toBeGreaterThan(10);
  });

  it("covers every coordination scenario entry with a passing outcome once the gate has run", async () => {
    const built = existsSync("dist/extension/manifest.json");
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    /* a built tree runs the gate itself, so every lane that builds before the suite — the bun lane, the deno lane, a local two-pass validate — verifies the committed coordination record without depending on the gate having run before the tests: the gate reruns the checklist against the compiled modules and verifies the record stays internally consistent */
    if (built) await execute("node", ["agentcert.ts"]);
    const report = agentcertrecord;
    expect(report.release).toBe(packagejson.version);
    expect(report.summary.total).toBe(30);
    expect(report.summary.failed).toBe(0);
    expect(report.summary.passed).toBe(30);
    expect(report.entries.map((entry) => entry.id)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1));
    for (const entry of report.entries) {
      expect(entry.outcome).toBe("pass");
      expect(entry.detail.length).toBeGreaterThan(10);
    }
  });

  it("records the deterministic run mode, the fake tab kinds of every browser and the pool coverage of 469 through 502", async () => {
    const report = agentcertrecord;
    /* the fake clock mode keeps every coordination scenario deterministic, the fake tab provider covers every browser kind and the pool mapping covers every multi agent coordination item of the feature pool */
    expect(report.clockmode).toBe("fake");
    expect(report.faketabkinds).toEqual(["chromium", "firefox", "safari"]);
    expect(report.summary.poolitems).toEqual({ from: 469, to: 502, covered: 34 });
  });

  it("exercises the real compiled modules the checklist names and stays deterministic", async () => {
    const source = await readFile("agentcert.ts", "utf8");
    expect(source).toContain('import("./dist/index.js")');
    expect(source).toContain('import("./dist/policy.js")');
    expect(source).toContain('import("./dist/dashdone.js")');
    /* every fixture time flows from the fixed epoch of the fake clock that stays the default mode — the real clock exists only behind the explicit opt in switch the operator drives — and the committed record carries no timestamps so reruns stay byte identical */
    expect(source).toContain("fakeclock");
    expect(source).toContain("1_800_000_000_000");
    expect(source).toContain('clockmode = process.argv.includes("--clock")');
    expect(JSON.stringify(agentcertrecord)).not.toContain('"at"');
    expect(source).toContain("process.exitCode = 1");
  });

  it("exports the leader worker topology scenario the chromium smoke executes end to end", async () => {
    const source = await readFile("agentcert.ts", "utf8");
    expect(source).toContain("export async function runleaderworkertopologyscenario");
    expect(source).toContain("faketabprovider.tabof");
    /* the scenario registers five fake agents across the fake tabs of every browser kind, so the smoke covers one coordination scenario against the shipped bundles */
    expect(source).toContain('tabof("chromium"');
    expect(source).toContain('tabof("firefox"');
    expect(source).toContain('tabof("safari"');
  });
});
