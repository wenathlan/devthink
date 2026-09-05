import { describe, expect, it } from "vitest";
import { formatdiagnostics, lintplanfile, loopkinds, parseplanfile, planlintexitcode, planlintsummary, planoriginprofile, plansensitiveclasses, retrykinds, rulesetcachekey } from "../plan.js";
import { actionkindcatalog, portablerulesetgate, portablerulesetof, portablerulefamilies } from "../policy.js";
import { packageversion } from "../version.js";
import type { classconsent, planfile, planlintdiagnostic, portableruleset } from "../types.js";

const now = 1_800_000_000_000;
const ruleset = portablerulesetof(now);
const capabilities = actionkindcatalog();

function file(overrides?: Partial<planfile>): planfile {
  return {
    version: packageversion,
    goal: "digest the changelog of the release",
    origin: "https://example.org",
    steps: [
      { id: "observe", kind: "observe", label: "Observe the page" },
      { id: "read", kind: "readtext", label: "Read the changelog", target: "main" }
    ],
    ...overrides
  };
}

describe("planlint of plan files", () => {
  it("parses one plan file under schemastrict and refuses unknown fields with the path that names them", () => {
    const parsed = parseplanfile(file());
    expect(parsed.origin).toBe("https://example.org");
    expect(parsed.steps).toHaveLength(2);
    expect(() => parseplanfile({ ...file(), unexpected: true })).toThrow(/unknown field.*unexpected.*schemastrict/);
    const firststep = file().steps[0];
    expect(firststep).toBeDefined();
    expect(() => parseplanfile({ ...file(), steps: [{ ...firststep as object, extra: 1 } as object] })).toThrow(/unknown field.*extra/);
    expect(() => parseplanfile({ ...file(), origin: "http://example.org" })).toThrow(/HTTPS/);
    expect(() => parseplanfile({ ...file(), steps: [] })).toThrow(/at least one step/);
    expect(() => parseplanfile({ ...file(), steps: [{ id: "s", kind: "loop", label: "l", bound: 0 }] })).toThrow(/positive integer/);
    expect(() => parseplanfile({ ...file(), steps: [{ id: "s", kind: "retryaction", label: "l", attempts: -2 }] })).toThrow(/positive integer/);
    expect(() => parseplanfile({ ...file(), grants: [""] })).toThrow(/grants/);
    expect(() => parseplanfile({ ...file(), denials: ["click", 3] })).toThrow(/denials/);
  });

  it("keeps one clean read only plan free of diagnostics", () => {
    expect(lintplanfile({ file: file(), ruleset, capabilities, now })).toEqual([]);
  });

  it("applies the same originprofile rules as the extension: a denied kind never lints clean", () => {
    const denied = lintplanfile({ file: file({ steps: [{ id: "type", kind: "type", label: "Type the query", target: "input", gate: true }], denials: ["type"] }), ruleset, capabilities, now });
    const grade = denied.find(diagnostic => diagnostic.code === "plan.origin.grade");
    expect(grade?.severity).toBe("error");
    expect(grade?.path).toBe("steps[0].kind");
    expect(grade?.message).toMatch(/denies the type kind/);
    expect(planoriginprofile(file({ denials: ["type"] }), now).denials).toEqual(["type"]);
  });

  it("demands the same fresh class consents the extension demands", () => {
    const paying = file({ steps: [{ id: "card", kind: "fillcard", label: "Fill the card", gate: true }] });
    const withoutconsent = lintplanfile({ file: paying, ruleset, capabilities, now });
    expect(withoutconsent.some(diagnostic => diagnostic.code === "plan.consent.class" && diagnostic.message.includes("payment"))).toBe(true);
    const consent: classconsent = { id: "c1", origin: "https://example.org", sensitiveclass: "payment", grantedat: now - 1000 } as classconsent;
    const withconsent = lintplanfile({ file: paying, ruleset, capabilities, consents: [consent], now });
    expect(withconsent.some(diagnostic => diagnostic.code === "plan.consent.class")).toBe(false);
    expect(withconsent.some(diagnostic => diagnostic.code === "plan.gate.declaration")).toBe(false);
    expect(plansensitiveclasses(paying)).toEqual(["payment"]);
  });

  it("flags steps whose kinds exceed the portable capability set", () => {
    const diagnostics = lintplanfile({ file: file(), ruleset, capabilities: ["observe"], now });
    const capability = diagnostics.find(diagnostic => diagnostic.code === "plan.capability.kind");
    expect(capability?.severity).toBe("error");
    expect(capability?.message).toMatch(/readtext.*exceeds the portable capability set/);
    expect(lintplanfile({ file: file(), ruleset, capabilities: ["observe", "readtext"], now })).toEqual([]);
  });

  it("flags sensitive steps without an explicit gate declaration", () => {
    const typing = file({ steps: [{ id: "type", kind: "type", label: "Type the query", target: "input" }] });
    const ungated = lintplanfile({ file: typing, ruleset, capabilities, now });
    expect(ungated.some(diagnostic => diagnostic.code === "plan.gate.declaration" && diagnostic.severity === "error")).toBe(true);
    const gated = lintplanfile({ file: file({ steps: [{ id: "type", kind: "type", label: "Type the query", target: "input", gate: true }] }), ruleset, capabilities, now });
    expect(gated.some(diagnostic => diagnostic.code === "plan.gate.declaration")).toBe(false);
  });

  it("flags selectors that cannot resolve without a live page as info", () => {
    const templated = lintplanfile({ file: file({ steps: [{ id: "click", kind: "click", label: "Click the hit", target: "{{firsthit}}", gate: true }] }), ruleset, capabilities, now });
    const selector = templated.find(diagnostic => diagnostic.code === "plan.selector.static");
    expect(selector?.severity).toBe("info");
    expect(selector?.message).toMatch(/resolves only against the live page/);
  });

  it("flags unbounded loops and missing retry bounds as warnings", () => {
    expect(loopkinds).toContain("loop");
    expect(retrykinds).toContain("retryaction");
    const unbounded = lintplanfile({ file: file({ steps: [{ id: "spin", kind: "loop", label: "Spin the rows" }] }), ruleset, capabilities, now });
    expect(unbounded.some(diagnostic => diagnostic.code === "plan.control.loopbound" && diagnostic.severity === "warn")).toBe(true);
    const unretrying = lintplanfile({ file: file({ steps: [{ id: "retry", kind: "retryaction", label: "Retry the click" }] }), ruleset, capabilities, now });
    expect(unretrying.some(diagnostic => diagnostic.code === "plan.control.retrybound" && diagnostic.severity === "warn")).toBe(true);
    const bounded = lintplanfile({ file: file({ steps: [{ id: "spin", kind: "loop", label: "Spin the rows", bound: 12 }, { id: "retry", kind: "retryaction", label: "Retry the click", attempts: 3 }] }), ruleset, capabilities, now });
    expect(bounded.some(diagnostic => diagnostic.code.startsWith("plan.control."))).toBe(false);
  });

  it("runs only the rules the compiled set carries so a cache from another release never lints half", () => {
    const typing = file({ steps: [{ id: "type", kind: "type", label: "Type the query", target: "input" }] });
    const withoutgate = { ...ruleset, rules: ruleset.rules.filter(rule => rule.id !== "gatedeclaration") };
    expect(lintplanfile({ file: typing, ruleset: withoutgate, capabilities, now }).some(diagnostic => diagnostic.code === "plan.gate.declaration")).toBe(false);
    expect(lintplanfile({ file: typing, ruleset, capabilities, now }).some(diagnostic => diagnostic.code === "plan.gate.declaration")).toBe(true);
  });

  it("formats diagnostics in human and json shapes and exits non zero on error only", () => {
    const diagnostics: planlintdiagnostic[] = [
      { code: "plan.selector.static", path: "steps[0].target", severity: "info", message: "A templated selector resolves only against the live page." },
      { code: "plan.control.loopbound", path: "steps[1].bound", severity: "warn", message: "The loop carries no bound." },
      { code: "plan.gate.declaration", path: "steps[2].gate", severity: "error", message: "A sensitive step declares no gate." }
    ];
    expect(planlintexitcode(diagnostics.slice(0, 2))).toBe(0);
    expect(planlintexitcode(diagnostics)).toBe(1);
    expect(formatdiagnostics([], "human")).toBe("No planlint diagnostics.");
    expect(formatdiagnostics(diagnostics, "human")).toContain("ERROR plan.gate.declaration at steps[2].gate");
    expect(JSON.parse(formatdiagnostics(diagnostics, "json"))).toHaveLength(3);
    const summary = planlintsummary(diagnostics);
    expect(summary).toMatchObject({ info: 1, warn: 1, error: 1, exitcode: 1 });
    expect(summary.reason).toMatch(/refuse the plan file/);
  });
});

describe("the portable rule set", () => {
  it("compiles one versioned set shared by the extension and the cli with a stable cache key", () => {
    expect(ruleset.version).toBe(packageversion);
    expect(ruleset.rules.map(rule => rule.id)).toContain("originprofilegrade");
    expect(rulesetcachekey(ruleset)).toBe(rulesetcachekey(portablerulesetof(now + 5_000)));
    expect(rulesetcachekey({ ...ruleset, rules: ruleset.rules.slice(1) })).not.toBe(rulesetcachekey(ruleset));
  });

  it("gates the compiled set against drift", () => {
    expect(portablerulesetgate(ruleset).allowed).toBe(true);
    expect(portablerulesetgate({ ...ruleset, version: "0.0.1" }).allowed).toBe(false);
    expect(portablerulesetgate({ ...ruleset, rules: [] }).allowed).toBe(false);
    expect(portablerulesetgate({ ...ruleset, rules: [...ruleset.rules, ruleset.rules[0] as never] }).allowed).toBe(false);
    const missingfamily = { ...ruleset, rules: ruleset.rules.filter(rule => rule.family !== "consent") };
    expect(portablerulesetgate(missingfamily).allowed).toBe(false);
    expect(portablerulesetgate({ ...ruleset, rules: ruleset.rules.map(rule => ({ ...rule, id: "" })) }).allowed).toBe(false);
    expect(portablerulefamilies).toHaveLength(7);
  });
});
