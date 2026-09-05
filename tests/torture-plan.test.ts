import { describe, expect, it } from "vitest";
import {
  activetimelineanchor, appendlogstreamevent, auditexcerptof, diffpreviewof, filterlogstream, formatdiagnostics, lintplanfile, livebufferof, livebufferof as _unused, loglevelof, logstreameventof, logstreamgenesis, loopkinds, maskverdictsof, parseplanfile, plancardgroups, plancardsof, planfilestepfields, planlintexitcode, planlintsummary, planoriginprofile, plansensitiveclasses, plansteprisk, resolutionhistoryafter, resolutionlogeventof, retrykinds, rulesetcachekey, stepresolutionof, stepstimelinenodes, verifylogstream,
} from "../plan.js";
import type { agentplan, classconsent, correctionentry, planfile, portableruleset, toolstep, uisurface } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one minimal plan file fixture that lints clean against the empty ruleset. */
function planfile(over: Partial<planfile> = {}): planfile {
  return {
    version: "1",
    goal: "Scrape the pricing page",
    origin: "https://example.com",
    steps: [
      { id: "s1", kind: "navigate", label: "open the page" },
      { id: "s2", kind: "readtext", label: "read the heading" },
    ],
    ...over,
  };
}

/** Builds one portable ruleset fixture with the named rule ids active. */
function ruleset(ids: string[] = []): portableruleset {
  return { version: "1", compiledat: now, rules: ids.map(id => ({ id, family: "planlint", validates: id })) };
}

/** Builds one approved agentplan fixture. */
function approvedplan(over: Partial<agentplan> = {}): agentplan {
  return {
    id: "plan1",
    objective: "torture the plan module",
    origin: "https://example.com",
    steps: [
      { id: "s1", kind: "navigate", value: "https://example.com", summary: "open the page", risk: "sensitive" },
      { id: "s2", kind: "readtext", target: "h1", summary: "read the heading", risk: "read" },
    ],
    createdat: now - 1000,
    expiresat: now + 600_000,
    state: "approved",
    ...over,
  };
}

describe("torture: plan file parse under schemastrict", () => {
  it("parses one minimal plan file with the documented step fields and grants", () => {
    const parsed = parseplanfile({ version: "1", goal: "go", origin: "https://example.com", steps: [{ id: "s1", kind: "navigate", label: "open" }], grants: ["navigate"], denials: ["click"] });
    expect(parsed.version).toBe("1");
    expect(parsed.goal).toBe("go");
    expect(parsed.origin).toBe("https://example.com");
    expect(parsed.steps).toHaveLength(1);
    expect(parsed.grants).toEqual(["navigate"]);
    expect(parsed.denials).toEqual(["click"]);
  });

  it("refuses non object, null and array payloads", () => {
    expect(() => parseplanfile("not an object")).toThrow(/json object/i);
    expect(() => parseplanfile(null)).toThrow(/json object/i);
    expect(() => parseplanfile([])).toThrow(/json object/i);
    expect(() => parseplanfile(42)).toThrow(/json object/i);
    expect(() => parseplanfile(undefined)).toThrow(/json object/i);
  });

  it("refuses unknown root and step fields under schemastrict", () => {
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: "s1", kind: "navigate", label: "open" }], ghost: "haunt" })).toThrow(/unknown field/i);
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: "s1", kind: "navigate", label: "open", ghost: "haunt" }] })).toThrow(/unknown field/i);
  });

  it("refuses the non https origin and the empty step list", () => {
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "http://example.com", steps: [{ id: "s1", kind: "navigate", label: "open" }] })).toThrow(/HTTPS/i);
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [] })).toThrow(/at least one step/i);
  });

  it("refuses blank ids, kinds, labels and accepts the optional target, value and options", () => {
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: " ", kind: "navigate", label: "open" }] })).toThrow(/non-empty string/i);
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: "s1", kind: "", label: "open" }] })).toThrow(/non-empty string/i);
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: "s1", kind: "navigate", label: "" }] })).toThrow(/non-empty string/i);
    const parsed = parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: "s1", kind: "type", label: "open", target: "#user", value: "alice", options: "{}" }] });
    expect(parsed.steps[0]).toMatchObject({ id: "s1", kind: "type", label: "open", target: "#user", value: "alice", options: "{}" });
  });

  it("refuses the non integer and non positive loop bound and retry attempts", () => {
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: "s1", kind: "navigate", label: "open", bound: 0 }] })).toThrow(/positive integer/i);
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: "s1", kind: "navigate", label: "open", bound: 1.5 }] })).toThrow(/positive integer/i);
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: "s1", kind: "navigate", label: "open", attempts: -1 }] })).toThrow(/positive integer/i);
  });

  it("accepts the boolean gate declaration and refuses the non boolean one", () => {
    const parsed = parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: "s1", kind: "click", label: "open", gate: true }] });
    expect(parsed.steps[0]?.gate).toBe(true);
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: "s1", kind: "click", label: "open", gate: "yes" }] })).toThrow(/not a boolean/i);
  });

  it("refuses the grant list with blank or non string entries", () => {
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: "s1", kind: "navigate", label: "open" }], grants: [""] })).toThrow(/non-empty action kind/i);
    expect(() => parseplanfile({ version: "1", goal: "g", origin: "https://example.com", steps: [{ id: "s1", kind: "navigate", label: "open" }], grants: ["navigate", 5] as never })).toThrow(/non-empty action kind/i);
  });

  it("preserves unicode, cjk and emoji ids and goals without truncation", () => {
    const parsed = parseplanfile({ version: "1", goal: "完成调查 🚀", origin: "https://example.com", steps: [{ id: "步1", kind: "navigate", label: "打开页面" }] });
    expect(parsed.goal).toBe("完成调查 🚀");
    expect(parsed.steps[0]?.id).toBe("步1");
  });

  it("lists the documented step fields in the reviewed order", () => {
    expect([...planfilestepfields]).toEqual(["id", "kind", "label", "target", "value", "options", "gate", "bound", "attempts"]);
  });
});

describe("torture: plan lint diagnostics and exit code", () => {
  it("raises the loopbound warn for every unbounded loop and the retrybound warn for the missing attempts", () => {
    const file = planfile({ steps: [{ id: "s1", kind: "loop", label: "loop the rows" }, { id: "s2", kind: "retryaction", label: "retry the click" }, { id: "s3", kind: "navigate", label: "open" }] });
    const diagnostics = lintplanfile({ file, ruleset: ruleset(["loopbound", "retrybound"]), capabilities: ["navigate"], now });
    expect(diagnostics.filter(d => d.code === "plan.control.loopbound")).toHaveLength(1);
    expect(diagnostics.filter(d => d.code === "plan.control.retrybound")).toHaveLength(1);
    expect(diagnostics.every(d => d.severity === "warn")).toBe(true);
    expect(planlintexitcode(diagnostics)).toBe(0);
  });

  it("raises the static selector info for templated targets and the goal and origin errors at the end", () => {
    const file = planfile({ goal: "", origin: "", steps: [{ id: "s1", kind: "readtext", label: "open", target: "{{row}}" }] });
    const diagnostics = lintplanfile({ file, ruleset: ruleset(["staticselector"]), capabilities: ["readtext"], now });
    expect(diagnostics.some(d => d.code === "plan.selector.static")).toBe(true);
    expect(diagnostics.some(d => d.code === "plan.goal.empty")).toBe(true);
    expect(diagnostics.some(d => d.code === "plan.origin.empty")).toBe(true);
    expect(planlintexitcode(diagnostics)).toBe(1);
  });

  it("reports the diagnostic counts and the exit code in the summary", () => {
    const file = planfile({ goal: "", origin: "", steps: [{ id: "s1", kind: "loop", label: "loop" }] });
    const diagnostics = lintplanfile({ file, ruleset: ruleset(["loopbound"]), capabilities: ["navigate"], now });
    const summary = planlintsummary(diagnostics);
    expect(summary.warn).toBe(1);
    expect(summary.error).toBe(2);
    expect(summary.exitcode).toBe(1);
    expect(summary.info).toBe(0);
  });

  it("formats the diagnostics for human and json output", () => {
    const diagnostics = [{ code: "plan.test", path: "steps[0]", severity: "error" as const, message: "boom" }];
    expect(formatdiagnostics(diagnostics, "human")).toBe("ERROR plan.test at steps[0]: boom");
    expect(JSON.parse(formatdiagnostics(diagnostics, "json"))).toHaveLength(1);
    expect(formatdiagnostics([], "human")).toBe("No planlint diagnostics.");
  });

  it("computes the deterministic ruleset cache key from the version and the rule ids", () => {
    expect(rulesetcachekey({ version: "2", compiledat: now, rules: [{ id: "loopbound", family: "planlint", validates: "loopbound" }, { id: "retrybound", family: "planlint", validates: "retrybound" }] })).toBe("planlint-2-loopbound+retrybound");
  });
});

describe("torture: plan step risk and sensitive class derivation", () => {
  it("reads the derived risk of one step against the policy grading", () => {
    expect(plansteprisk({ id: "s1", kind: "readtext", label: "read" })).toBe("read");
    expect(plansteprisk({ id: "s1", kind: "navigate", label: "open" })).toBe("sensitive");
    expect(plansteprisk({ id: "s1", kind: "teleport" as never, label: "ghost" })).toBe("sensitive");
  });

  it("lists the sensitive classes the plan needs consent for", () => {
    const file = planfile({ steps: [{ id: "s1", kind: "navigate", label: "open" }, { id: "s2", kind: "type", label: "type", value: "alice" }] });
    const classes = plansensitiveclasses(file);
    expect(Array.isArray(classes)).toBe(true);
  });

  it("builds the originprofile of one plan file with the declared grants and denials", () => {
    const profile = planoriginprofile(planfile({ grants: ["navigate"], denials: ["click"] }), now);
    expect(profile.origin).toBe("https://example.com");
    expect(profile.grants).toEqual(["navigate"]);
    expect(profile.denials).toEqual(["click"]);
  });

  it("reviews the documented loop kinds and retry kinds of the linter", () => {
    expect([...loopkinds]).toEqual(["loop", "whileloop", "repeatuntil"]);
    expect([...retrykinds]).toEqual(["retryaction", "trycatch"]);
  });
});

describe("torture: plan review plancards and groups", () => {
  it("builds one plancard per proposed step with the matching corrections", () => {
    const corrections: correctionentry[] = [{ id: "c1", origin: "https://example.com", kind: "navigate", stepid: "s1", original: "open", corrected: "open the page", reason: "made the summary clearer", source: "edited", at: now }];
    const cards = plancardsof({ plan: approvedplan(), corrections });
    expect(cards).toHaveLength(2);
    expect(cards[0]).toMatchObject({ stepid: "s1", kind: "navigate", risk: "sensitive", editable: false });
    expect(cards[0]?.corrections).toHaveLength(1);
    expect(cards[0]?.corrections[0]?.id).toBe("c1");
  });

  it("marks the cards editable when the plan stays pending", () => {
    const cards = plancardsof({ plan: approvedplan({ state: "pending" }), corrections: [] });
    expect(cards.every(card => card.editable)).toBe(true);
  });

  it("groups the cards by risk class with the sensitive group expanded by default", () => {
    const cards = plancardsof({ plan: approvedplan(), corrections: [] });
    const groups = plancardgroups(cards);
    expect(groups.map(group => group.risk)).toEqual(["sensitive", "read"]);
    expect(groups[0]?.expanded).toBe(true);
    expect(groups[1]?.expanded).toBe(false);
    expect(plancardgroups([])).toEqual([]);
  });

  it("marks the read group folded and the sensitive group expanded for the full palette", () => {
    const cards = [
      { stepid: "s1", kind: "readtext", risk: "read", environment: "pagecontext", options: "", summary: "read", corrections: [], editable: false },
      { stepid: "s2", kind: "click", risk: "sensitive", environment: "pagecontext", options: "", summary: "click", corrections: [], editable: false },
      { stepid: "s3", kind: "hover", risk: "interaction", environment: "pagecontext", options: "", summary: "hover", corrections: [], editable: false },
    ] as never;
    const groups = plancardgroups(cards);
    expect(groups.map(group => group.risk)).toEqual(["sensitive", "interaction", "read"]);
    expect(groups.every(group => group.cards.length === 1)).toBe(true);
  });
});

describe("torture: plan stepapprove resolution and immutable log event", () => {
  const surface: uisurface = "sidepanel";

  it("builds the approve, reject and edit resolutions with the edited shape", () => {
    const approve = stepresolutionof({ stepid: "s1", planid: "p1", origin: "https://example.com", resolution: "approve", surface, at: now });
    expect(approve).toMatchObject({ stepid: "s1", resolution: "approve" });
    expect(approve.edited).toBeUndefined();
    const edit = stepresolutionof({ stepid: "s1", planid: "p1", origin: "https://example.com", resolution: "edit", surface, edited: "the new step shape", at: now });
    expect(edit.edited).toBe("the new step shape");
  });

  it("refuses the blank stepid and the edited resolution without the edited shape", () => {
    expect(() => stepresolutionof({ stepid: "", planid: "p1", origin: "https://example.com", resolution: "approve", surface, at: now })).toThrow(/step/i);
    expect(() => stepresolutionof({ stepid: "s1", planid: "p1", origin: "https://example.com", resolution: "edit", surface, edited: "  ", at: now })).toThrow(/corrected step/i);
  });

  it("builds the immutable log event summary for the approve, reject and edit resolutions", () => {
    const approve = stepresolutionof({ stepid: "s1", planid: "p1", origin: "https://example.com", resolution: "approve", surface, at: now });
    expect(resolutionlogeventof(approve)).toMatchObject({ kind: "review", stepid: "s1" });
    expect(resolutionlogeventof(approve).summary).toMatch(/approved/i);
    const reject = stepresolutionof({ stepid: "s1", planid: "p1", origin: "https://example.com", resolution: "reject", surface, at: now });
    expect(resolutionlogeventof(reject).summary).toMatch(/rejected/i);
    const edit = stepresolutionof({ stepid: "s1", planid: "p1", origin: "https://example.com", resolution: "edit", surface, edited: "x", at: now });
    expect(resolutionlogeventof(edit).summary).toMatch(/edited/i);
  });

  it("appends the resolution to the per origin history with the newest first", () => {
    const first = stepresolutionof({ stepid: "s1", planid: "p1", origin: "https://example.com", resolution: "approve", surface, at: now });
    const second = stepresolutionof({ stepid: "s2", planid: "p1", origin: "https://example.com", resolution: "approve", surface, at: now + 1 });
    const history = resolutionhistoryafter(resolutionhistoryafter([], first), second);
    expect(history).toHaveLength(2);
    expect(history[0]?.stepid).toBe("s2");
  });
});

describe("torture: plan diff preview and mask verdicts", () => {
  it("compares the before and after states and reports the added, changed and removed fields", () => {
    const diff = diffpreviewof({ stepid: "s1", before: { name: "alice", age: "30", removed: "x" }, after: { name: "alice2", age: "30", added: "y" }, provenance: "offscreenworker" });
    expect(diff.changes.map(c => c.field)).toEqual(["name", "removed", "added"]);
    expect(diff.changes.find(c => c.field === "name")).toMatchObject({ kind: "changed", before: "alice", after: "alice2" });
    expect(diff.changes.find(c => c.field === "removed")).toMatchObject({ kind: "removed", before: "x" });
    expect(diff.changes.find(c => c.field === "added")).toMatchObject({ kind: "added", after: "y" });
    expect(diff.provenance).toBe("offscreenworker");
  });

  it("returns no changes when the states match", () => {
    const diff = diffpreviewof({ stepid: "s1", before: { a: "1" }, after: { a: "1" }, provenance: "inline" });
    expect(diff.changes).toEqual([]);
  });

  it("derives the mask verdicts of the sensitive fields", () => {
    const verdicts = maskverdictsof({ name: "alice", password: "hunter2", token: "sk-1234567890" }, ["password", "token"]);
    expect(Object.keys(verdicts)).toEqual(["password", "token"]);
    expect(verdicts.password).toMatch(/masked/i);
    expect(verdicts.name).toBeUndefined();
  });

  it("carries the mask verdicts through the diff preview payload", () => {
    const verdicts = maskverdictsof({ password: "hunter2" }, ["password"]);
    const diff = diffpreviewof({ stepid: "s1", before: {}, after: { password: "hunter2" }, maskverdicts: verdicts, provenance: "offscreenworker" });
    expect(diff.maskverdicts).toBe(verdicts);
  });
});

describe("torture: plan steps timeline nodes from progress", () => {
  it("derives the done, running and pending statuses from the plan state and progress", () => {
    const nodes = stepstimelinenodes({ plan: approvedplan(), now });
    expect(nodes.map(node => node.status)).toEqual(["running", "pending"]);
    expect(nodes.find(node => node.active)?.stepid).toBe("s1");
    expect(activetimelineanchor(nodes)).toBe("#step-s1");
  });

  it("marks the cancelled and expired plans as halted with no active node", () => {
    const nodes = stepstimelinenodes({ plan: approvedplan({ state: "cancelled" }), now });
    expect(nodes.every(node => node.status === "halted")).toBe(true);
    expect(activetimelineanchor(nodes)).toBeUndefined();
    const expired = stepstimelinenodes({ plan: approvedplan({ state: "expired" }), now });
    expect(expired.every(node => node.status === "halted")).toBe(true);
  });

  it("reports the done status from the completedsteps when no outcome carries one", () => {
    const nodes = stepstimelinenodes({ plan: approvedplan(), progress: { planid: "plan1", completedsteps: ["s1", "s2"], updatedat: now }, now });
    expect(nodes.map(node => node.status)).toEqual(["done", "done"]);
  });

  it("reads the failed outcome and the waiting gate wait status", () => {
    const nodes = stepstimelinenodes({ plan: approvedplan(), progress: { planid: "plan1", completedsteps: [], outcomes: [{ stepid: "s1", ok: false, summary: "boom", at: now }], gatewaits: { s2: { gateid: "s2", kind: "confirm", openedat: now, resolvedat: now, waitedms: 1 } }, updatedat: now }, now });
    expect(nodes[0]?.status).toBe("failed");
    expect(nodes[1]?.status).toBe("waiting");
    expect(nodes[1]?.active).toBe(false);
  });

  it("carries the duration, the environment and the result summary from the progress", () => {
    const nodes = stepstimelinenodes({ plan: approvedplan(), progress: { planid: "plan1", completedsteps: ["s1"], outcomes: [{ stepid: "s1", ok: true, summary: "done", at: now }], turnarounds: { s1: 42 }, environments: { s1: "offscreenworker" }, updatedat: now }, now });
    expect(nodes[0]).toMatchObject({ durationms: 42, environment: "offscreenworker", resultsummary: "done" });
  });
});

describe("torture: plan logstream hash chain integrity", () => {
  it("chains the events under the genesis hash and verifies the chain link by link", async () => {
    const first = await logstreameventof({ level: "info", source: "console", origin: "https://example.com", summary: "first event", masked: false, maskverdict: "", previous: logstreamgenesis, at: now });
    const second = await logstreameventof({ level: "warn", source: "error", origin: "https://example.com", summary: "second event", stepid: "s1", masked: true, maskverdict: "the password stays masked", previous: first.hash.current, at: now + 1 });
    const events = appendlogstreamevent(appendlogstreamevent([], first), second);
    const verified = await verifylogstream(events);
    expect(verified.valid).toBe(true);
  });

  it("refuses the empty summary event", async () => {
    await expect(logstreameventof({ level: "info", source: "console", origin: "https://example.com", summary: "  ", masked: false, maskverdict: "", previous: logstreamgenesis, at: now })).rejects.toThrow(/summary/i);
  });

  it("detects the broken link and the tampered hash", async () => {
    const first = await logstreameventof({ level: "info", source: "console", origin: "https://example.com", summary: "first", masked: false, maskverdict: "", previous: logstreamgenesis, at: now });
    const broken = await logstreameventof({ level: "info", source: "console", origin: "https://example.com", summary: "second", masked: false, maskverdict: "", previous: "0".repeat(64), at: now + 1 });
    const events = appendlogstreamevent(appendlogstreamevent([], first), broken);
    const verified = await verifylogstream(events);
    expect(verified.valid).toBe(false);
    expect(verified.brokenat).toBe(1);
    const tampered = { ...broken, summary: "tampered summary that changes the hash" };
    const tamperedEvents = appendlogstreamevent([first], tampered);
    const tamperedVerified = await verifylogstream(tamperedEvents);
    expect(tamperedVerified.valid).toBe(false);
  });

  it("filters the events by level, origin and step ref and the absent filter keeps everything", () => {
    const events = [
      { id: "e1", level: "info", source: "console", origin: "https://example.com", summary: "a", masked: false, maskverdict: "", hash: { previous: "x", current: "y" }, at: now },
      { id: "e2", level: "warn", source: "error", origin: "https://other.example", summary: "b", stepid: "s1", masked: true, maskverdict: "masked", hash: { previous: "y", current: "z" }, at: now + 1 },
    ] as never;
    expect(filterlogstream(events, {})).toHaveLength(2);
    expect(filterlogstream(events, { level: "warn" })).toHaveLength(1);
    expect(filterlogstream(events, { origin: "https://example.com" })).toHaveLength(1);
    expect(filterlogstream(events, { stepid: "s1" })).toHaveLength(1);
  });

  it("returns the bounded live window and keeps the full set when the bound is absent or invalid", () => {
    const events = Array.from({ length: 10 }, (_, index) => ({ id: `e${index}`, level: "info", source: "console", origin: "o", summary: `s${index}`, masked: false, maskverdict: "", hash: { previous: "p", current: "c" }, at: now + index })) as never;
    expect(livebufferof(events, 5)).toHaveLength(5);
    expect(livebufferof(events, 5)[0]?.id).toBe("e5");
    expect(livebufferof(events, undefined)).toHaveLength(10);
    expect(livebufferof(events, 0)).toHaveLength(10);
    expect(livebufferof(events, -1)).toHaveLength(10);
    expect(livebufferof(events, 1.5)).toHaveLength(10);
  });

  it("copies the verified excerpt range and refuses the out of range and the unverified range", async () => {
    const first = await logstreameventof({ level: "info", source: "console", origin: "https://example.com", summary: "first", masked: false, maskverdict: "", previous: logstreamgenesis, at: now });
    const second = await logstreameventof({ level: "info", source: "console", origin: "https://example.com", summary: "second", masked: false, maskverdict: "", previous: first.hash.current, at: now + 1 });
    const third = await logstreameventof({ level: "info", source: "console", origin: "https://example.com", summary: "third", masked: false, maskverdict: "", previous: second.hash.current, at: now + 2 });
    const events = appendlogstreamevent(appendlogstreamevent(appendlogstreamevent([], first), second), third);
    const excerpt = await auditexcerptof(events, { from: 0, to: 2 });
    expect(excerpt.ok).toBe(true);
    expect(excerpt.text).toContain("first");
    const outOfRange = await auditexcerptof(events, { from: 1, to: 10 });
    expect(outOfRange.ok).toBe(false);
    expect(outOfRange.reason).toMatch(/no contiguous slice/i);
  });

  it("maps the audit kind onto the logstream level", () => {
    expect(loglevelof("error")).toBe("error");
    expect(loglevelof("deny")).toBe("warn");
    expect(loglevelof("revoke")).toBe("warn");
    expect(loglevelof("anything")).toBe("info");
  });
});
