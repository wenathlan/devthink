import { describe, expect, it } from "vitest";
import {
  bindvariables,
  blockinvocationof,
  cancelrun,
  composeworkflow,
  delayjitter,
  dryrunworkflow,
  expandblocks,
  expressioneval,
  expressionof,
  newworkflowrun,
  pauserun,
  popscope,
  pushscope,
  regexextract,
  regexruleof,
  resolvevariable,
  runstep,
  runworkflow,
  steptemplateof,
  validateworkflow,
  waitelementplan,
  watchdogpass,
  workflowblockof,
  workflowkinds,
  workflowstepof,
} from "../workflow.js";
import {
  actionrisk,
  canexecute,
  dryrunprojection,
  isworkflowkind,
  validatestep,
  validateregexrule,
  workflowgate,
} from "../policy.js";
import { parseproposal, parseworkflowproposal, workflowoutcome, workflowreport } from "../protocol.js";
import { recordworkflow, workflowevidences, workflowshare } from "../progress.js";
import { sessionmemory } from "../memory.js";
import { protocolversion } from "../types.js";
import type {
  agentplan,
  agentsession,
  runlogentry,
  stepoutcome,
  toolstep,
  variablescope,
  workflowrun,
} from "../types.js";

const now = 1_800_000_000_000;
const session: agentsession = {
  id: "sess",
  tabid: 4,
  origin: "https://example.com",
  startedat: now - 1000,
  expiresat: now + 600_000,
  grants: ["https://example.com"],
};
const plan: agentplan = {
  id: "run",
  objective: "Run the reviewed workflow",
  origin: "https://example.com",
  steps: [],
  createdat: now - 2000,
  expiresat: now + 600_000,
  state: "approved",
};

function kindallowed(kind: string): boolean {
  try {
    actionrisk(kind as toolstep["kind"]);
    return true;
  } catch {
    return false;
  }
}

function riskof(kind: string): "read" | "interaction" | "sensitive" {
  return actionrisk(kind as toolstep["kind"]);
}

/** Composes one small workflow of read steps for the engine suites. */
function readworkflow(
  steps: Array<Record<string, unknown>> = [
    { id: "s1", kind: "readtext", label: "Read the heading", target: "h1" },
    { id: "s2", kind: "wait", label: "Wait a beat", value: "10" },
  ],
) {
  return composeworkflow({
    id: "wf1",
    name: "reader",
    version: 1,
    origins: ["https://example.com"],
    steps: steps.map((entry) => workflowstepof(entry) as never),
    now,
    kindallowed,
    riskof,
  });
}

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }
}

describe("workflow kinds and grammars", () => {
  it("lists the workflow kinds and marks every one inside the risk table", () => {
    expect(workflowkinds).toEqual([
      "composeworkflow",
      "savetemplate",
      "runworkflow",
      "dryrun",
      "delay",
      "waitelement",
      "compute",
      "extractvars",
    ]);
    for (const kind of workflowkinds) expect(isworkflowkind(kind as toolstep["kind"])).toBe(true);
    expect(isworkflowkind("click")).toBe(false);
    expect(actionrisk("runworkflow")).toBe("sensitive");
    expect(actionrisk("dryrun")).toBe("read");
  });

  it("normalizes workflow steps, blocks, invocations, bindings, expressions and regex rules", () => {
    const step = workflowstepof({
      id: "s1",
      kind: "readtext",
      label: "Read the heading",
      target: "h1",
      bindings: [{ variable: "title", kind: "string", stepid: "s0", path: "details.text" }],
      expression: {
        left: { ref: "title" },
        right: { literal: 2 },
        operator: "concat",
        result: "label",
        resultkind: "string",
      },
      extract: { pattern: "(?<code>[a-z]+)", flags: "g", groups: ["code"] },
    });
    if (!step) throw new Error("The reviewed workflow step did not normalize.");
    expect(step.bindings).toHaveLength(1);
    expect(step.expression?.operator).toBe("concat");
    expect(step.extract?.groups).toEqual(["code"]);
    expect(workflowstepof({ id: "s1", kind: "ReadText", label: "Mixed case" })).toBeUndefined();
    expect(workflowstepof({ id: "", kind: "wait", label: "Empty id" })).toBeUndefined();
    expect(
      workflowstepof({
        id: "s1",
        kind: "wait",
        label: "Bad binding",
        bindings: [{ variable: "x", kind: "string", stepid: "" }],
      }),
    ).toBeUndefined();
    expect(blockinvocationof({ block: "login", label: "Run the login block" })).toEqual({
      block: "login",
      label: "Run the login block",
    });
    expect(blockinvocationof({ block: "", label: "Empty" })).toBeUndefined();
    expect(
      workflowblockof({
        name: "login",
        label: "Login block",
        steps: [{ id: "b1", kind: "click", label: "Click submit", target: "#submit" }],
      }),
    ).toBeDefined();
    expect(workflowblockof({ name: "Login", label: "Upper case name", steps: [] })).toBeUndefined();
    expect(
      steptemplateof({
        id: "t1",
        name: "shared click",
        origin: "https://example.com",
        step: { id: "s1", kind: "click", label: "Click", target: "#x" },
        sharedat: now,
      }),
    ).toBeDefined();
    expect(
      steptemplateof({
        id: "t1",
        name: "shared click",
        origin: "https://example.com",
        step: { kind: "click" },
        sharedat: now,
      }),
    ).toBeUndefined();
    expect(
      expressionof({
        left: { ref: "count" },
        right: { literal: 1 },
        operator: "add",
        result: "total",
        resultkind: "number",
      }),
    ).toBeDefined();
    expect(
      expressionof({ left: { ref: "count" }, operator: "explode", result: "total", resultkind: "number" }),
    ).toBeUndefined();
    expect(regexruleof({ pattern: "(?<code>[a-z]+)", flags: "g", groups: ["code"] })).toBeDefined();
    expect(regexruleof({ pattern: "(", flags: "", groups: [] })).toBeDefined();
    expect(regexruleof({ pattern: "x", flags: "q", groups: [] })).toBeUndefined();
    expect(regexruleof({ pattern: "x", flags: "", groups: ["9bad"] })).toBeUndefined();
  });
});

describe("composeworkflow", () => {
  it("validates every grammar rule before freezing the record", () => {
    expect(() =>
      composeworkflow({ name: " ", version: 1, origins: ["https://example.com"], steps: [], now, kindallowed, riskof }),
    ).toThrow("name");
    expect(() =>
      composeworkflow({ name: "w", version: 0, origins: ["https://example.com"], steps: [], now, kindallowed, riskof }),
    ).toThrow("version");
    expect(() =>
      composeworkflow({
        name: "w",
        version: 1.5,
        origins: ["https://example.com"],
        steps: [],
        now,
        kindallowed,
        riskof,
      }),
    ).toThrow("version");
    expect(() => composeworkflow({ name: "w", version: 1, origins: [], steps: [], now, kindallowed, riskof })).toThrow(
      "origin",
    );
    expect(() =>
      composeworkflow({ name: "w", version: 1, origins: ["http://example.com"], steps: [], now, kindallowed, riskof }),
    ).toThrow("HTTPS");
    expect(() =>
      composeworkflow({ name: "w", version: 1, origins: ["https://example.com"], steps: [], now, kindallowed, riskof }),
    ).toThrow("at least one");
    expect(() =>
      composeworkflow({
        name: "w",
        version: 1,
        origins: ["https://example.com"],
        steps: [{ id: "s1", kind: "explode", label: "Unknown kind" } as never],
        now,
        kindallowed,
        riskof,
      }),
    ).toThrow("not a reviewed action kind");
    expect(() =>
      composeworkflow({
        name: "w",
        version: 1,
        origins: ["https://example.com"],
        steps: [{ id: "s1", kind: "wait", label: "Wait" } as never],
        blocks: [
          { name: "a", label: "A", steps: [] },
          { name: "a", label: "A again", steps: [] },
        ],
        now,
        kindallowed,
        riskof,
      }),
    ).toThrow("unique");
    expect(() =>
      composeworkflow({
        name: "w",
        version: 1,
        origins: ["https://example.com"],
        steps: [
          {
            id: "s1",
            kind: "wait",
            label: "Wait",
            bindings: [{ variable: "v", kind: "string", stepid: "missing" }],
          } as never,
        ],
        now,
        kindallowed,
        riskof,
      }),
    ).toThrow("unknown step");
    const record = readworkflow();
    expect(record.id).toBe("wf1");
    expect(record.risk).toBe("read");
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.steps[0])).toBe(true);
    expect(() => {
      (record.steps as unknown as { push(item: unknown): void }[])[0]?.push;
    }).not.toThrow();
  });

  it("grades workflows that write, submit or navigate as sensitive for review", () => {
    const sensitive = composeworkflow({
      name: "writer",
      version: 1,
      origins: ["https://example.com"],
      steps: [{ id: "s1", kind: "click", label: "Click submit", target: "#submit" } as never],
      now,
      kindallowed,
      riskof,
    });
    expect(sensitive.risk).toBe("sensitive");
    const interaction = composeworkflow({
      name: "hoverer",
      version: 1,
      origins: ["https://example.com"],
      steps: [{ id: "s1", kind: "hover", label: "Hover the menu", target: "#menu" } as never],
      now,
      kindallowed,
      riskof,
    });
    expect(interaction.risk).toBe("interaction");
  });
});

describe("expandblocks", () => {
  it("flattens three levels of nesting with the innermost block carried on every step", () => {
    const inner = workflowblockof({
      name: "inner",
      label: "Inner block",
      steps: [{ id: "i1", kind: "wait", label: "Inner wait", value: "5" }],
    })!;
    const middle = workflowblockof({
      name: "middle",
      label: "Middle block",
      steps: [
        { id: "m1", kind: "readtext", label: "Middle read", target: "p" },
        { block: "inner", label: "Call inner" },
      ],
    })!;
    const outer = workflowblockof({
      name: "outer",
      label: "Outer block",
      steps: [
        { block: "middle", label: "Call middle" },
        { id: "o1", kind: "wait", label: "Outer wait", value: "5" },
      ],
    })!;
    const flat = expandblocks([{ block: "outer", label: "Call outer" }], [inner, middle, outer]);
    expect(flat.map((step) => step.id)).toEqual(["m1", "i1", "o1"]);
    expect(flat.map((step) => step.block)).toEqual(["middle", "inner", "outer"]);
  });

  it("refuses unknown and cyclic block references and empty expansions", () => {
    expect(() => expandblocks([{ block: "ghost", label: "Missing block" }], [])).toThrow("not defined");
    expect(() =>
      expandblocks(
        [{ block: "loop", label: "Loop" }],
        [workflowblockof({ name: "loop", label: "Loop block", steps: [{ block: "loop", label: "Loop again" }] })!],
      ),
    ).toThrow("recurs");
    expect(() => expandblocks([], [])).toThrow("at least one");
  });
});

describe("validateworkflow", () => {
  it("checks kinds, scopes and bindings before a run", () => {
    const record = readworkflow([
      { id: "s1", kind: "readtext", label: "Read", target: "h1" },
      {
        id: "s2",
        kind: "wait",
        label: "Wait",
        value: "10",
        expression: {
          left: { ref: "title" },
          right: { literal: "!" },
          operator: "concat",
          result: "banner",
          resultkind: "string",
        },
      },
    ]);
    expect(validateworkflow(record, { inputs: ["title"] })).toEqual({ allowed: true });
    expect(validateworkflow(record, { kindallowed: (kind: string) => kind !== "wait" })).toMatchObject({
      allowed: false,
      reason: expect.stringContaining("not a reviewed action kind"),
    });
    expect(validateworkflow(record)).toMatchObject({
      allowed: false,
      reason: expect.stringContaining("undefined variable title"),
    });
    const chained = readworkflow([
      {
        id: "s1",
        kind: "readtext",
        label: "Read",
        target: "h1",
        bindings: [{ variable: "title", kind: "string", stepid: "s2" }],
      },
      {
        id: "s2",
        kind: "readtext",
        label: "Read more",
        target: "p",
        bindings: [{ variable: "title", kind: "string", stepid: "s1" }],
      },
    ]);
    expect(validateworkflow(chained)).toMatchObject({
      allowed: false,
      reason: expect.stringContaining("earlier step"),
    });
    expect(() =>
      readworkflow([
        {
          id: "s1",
          kind: "wait",
          label: "Wait",
          value: "5",
          bindings: [{ variable: "x", kind: "string", stepid: "ghost" }],
        },
      ]),
    ).toThrow("unknown step ghost");
    expect(validateworkflow(readworkflow())).toEqual({ allowed: true });
  });
});

describe("variable scopes", () => {
  it("resolves from the nearest scope outward and keeps shadowing local", () => {
    const root: variablescope = {
      name: "root",
      variables: [{ name: "title", kind: "string", value: "outer", setat: now }],
    };
    const child = pushscope([root], "block", "root");
    expect(child).toHaveLength(2);
    expect(resolvevariable(child, "title")?.value).toBe("outer");
    const shadowed: variablescope[] = [
      root,
      { name: "block", variables: [{ name: "title", kind: "string", value: "inner", setat: now }], parent: "root" },
    ];
    expect(resolvevariable(shadowed, "title")?.value).toBe("inner");
    expect(resolvevariable(shadowed, "missing")).toBeUndefined();
    const popped = popscope(shadowed);
    expect(popped).toHaveLength(1);
    expect(popscope([])).toHaveLength(0);
  });

  it("binds step outcomes into the newest scope and refuses absent paths", () => {
    const outputs: Record<string, stepoutcome> = {
      s0: { stepid: "s0", ok: true, summary: "42", details: { text: "hello", count: 3, tags: ["a", "b"] }, at: now },
    };
    const bound = bindvariables(
      [{ name: "root", variables: [] }],
      [
        { variable: "title", kind: "string", stepid: "s0", path: "text" },
        { variable: "count", kind: "number", stepid: "s0", path: "count" },
        { variable: "tags", kind: "list", stepid: "s0", path: "tags" },
        { variable: "summary", kind: "string", stepid: "s0" },
      ],
      outputs,
      now,
    );
    expect(bound.produced).toEqual(["title", "count", "tags", "summary"]);
    expect(resolvevariable(bound.scopes, "count")?.value).toBe(3);
    expect(resolvevariable(bound.scopes, "tags")?.value).toEqual(["a", "b"]);
    expect(resolvevariable(bound.scopes, "summary")?.value).toBe("42");
    expect(() =>
      bindvariables(
        [{ name: "root", variables: [] }],
        [{ variable: "x", kind: "string", stepid: "s0", path: "missing" }],
        outputs,
        now,
      ),
    ).toThrow("found no value");
    expect(() =>
      bindvariables(
        [{ name: "root", variables: [] }],
        [{ variable: "n", kind: "number", stepid: "s0", path: "text" }],
        outputs,
        now,
      ),
    ).toThrow("not a finite number");
    expect(() =>
      bindvariables(
        [{ name: "root", variables: [] }],
        [{ variable: "b", kind: "boolean", stepid: "s0", path: "text" }],
        outputs,
        now,
      ),
    ).toThrow("not a boolean");
  });
});

describe("expressioneval", () => {
  const scopes = (values: Record<string, string | number | boolean | string[]>): variablescope[] => [
    {
      name: "root",
      variables: Object.entries(values).map(([name, value]) => ({
        name,
        kind: Array.isArray(value)
          ? "list"
          : typeof value === "number"
            ? "number"
            : typeof value === "boolean"
              ? "boolean"
              : "string",
        value,
        setat: now,
      })),
    },
  ];

  it("evaluates arithmetic, comparison and logic operators", () => {
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "add", result: "sum", resultkind: "number" },
        scopes({ a: 2, b: 3 }),
      ),
    ).toBe(5);
    expect(
      expressioneval(
        { left: { literal: 10 }, right: { literal: 4 }, operator: "subtract", result: "d", resultkind: "number" },
        [],
      ),
    ).toBe(6);
    expect(
      expressioneval(
        { left: { literal: 3 }, right: { literal: 4 }, operator: "multiply", result: "p", resultkind: "number" },
        [],
      ),
    ).toBe(12);
    expect(
      expressioneval(
        { left: { literal: 10 }, right: { literal: 4 }, operator: "divide", result: "q", resultkind: "number" },
        [],
      ),
    ).toBe(2.5);
    expect(
      expressioneval(
        { left: { literal: 10 }, right: { literal: 3 }, operator: "modulo", result: "r", resultkind: "number" },
        [],
      ),
    ).toBe(1);
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "less", result: "lt", resultkind: "boolean" },
        scopes({ a: 1, b: 2 }),
      ),
    ).toBe(true);
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "greaterequal", result: "ge", resultkind: "boolean" },
        scopes({ a: 3, b: 2 }),
      ),
    ).toBe(true);
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "equal", result: "eq", resultkind: "boolean" },
        scopes({ a: "x", b: "x" }),
      ),
    ).toBe(true);
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "notequal", result: "ne", resultkind: "boolean" },
        scopes({ a: 1, b: 2 }),
      ),
    ).toBe(true);
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "and", result: "both", resultkind: "boolean" },
        scopes({ a: true, b: false }),
      ),
    ).toBe(false);
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "or", result: "any", resultkind: "boolean" },
        scopes({ a: true, b: false }),
      ),
    ).toBe(true);
    expect(
      expressioneval(
        { left: { ref: "a" }, operator: "not", result: "flipped", resultkind: "boolean" },
        scopes({ a: true }),
      ),
    ).toBe(false);
  });

  it("coerces operand kinds and rejects mismatched operators", () => {
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { literal: 2 }, operator: "add", result: "sum", resultkind: "number" },
        scopes({ a: "3" }),
      ),
    ).toBe(5);
    expect(() =>
      expressioneval(
        { left: { ref: "a" }, right: { literal: 1 }, operator: "add", result: "sum", resultkind: "number" },
        scopes({ a: "abc" }),
      ),
    ).toThrow("not a number");
    expect(() =>
      expressioneval(
        { left: { literal: 1 }, right: { literal: 0 }, operator: "divide", result: "q", resultkind: "number" },
        [],
      ),
    ).toThrow("divides by zero");
    expect(() =>
      expressioneval(
        { left: { literal: 1 }, right: { literal: 0 }, operator: "modulo", result: "r", resultkind: "number" },
        [],
      ),
    ).toThrow("divides by zero");
    expect(() =>
      expressioneval(
        { left: { ref: "a" }, right: { literal: true }, operator: "and", result: "b", resultkind: "boolean" },
        scopes({ a: "yes" }),
      ),
    ).toThrow("not a boolean");
    expect(() =>
      expressioneval({ left: { ref: "ghost" }, operator: "not", result: "b", resultkind: "boolean" }, []),
    ).toThrow("undefined variable ghost");
    expect(() =>
      expressioneval(
        { left: { ref: "items" }, right: { literal: 1 }, operator: "add", result: "n", resultkind: "number" },
        scopes({ items: ["a"] }),
      ),
    ).toThrow("list");
  });

  it("evaluates text, contains and length operators including lists", () => {
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "concat", result: "joined", resultkind: "string" },
        scopes({ a: "or", b: "der" }),
      ),
    ).toBe("order");
    expect(
      expressioneval(
        { left: { ref: "items" }, right: { literal: "b" }, operator: "contains", result: "has", resultkind: "boolean" },
        scopes({ items: ["a", "b"] }),
      ),
    ).toBe(true);
    expect(
      expressioneval(
        {
          left: { ref: "text" },
          right: { literal: "ell" },
          operator: "contains",
          result: "has",
          resultkind: "boolean",
        },
        scopes({ text: "hello" }),
      ),
    ).toBe(true);
    expect(
      expressioneval(
        { left: { ref: "items" }, operator: "length", result: "count", resultkind: "number" },
        scopes({ items: ["a", "b", "c"] }),
      ),
    ).toBe(3);
    expect(
      expressioneval(
        { left: { ref: "text" }, operator: "length", result: "count", resultkind: "number" },
        scopes({ text: "hello" }),
      ),
    ).toBe(5);
  });
});

describe("regexextract", () => {
  it("stores named captures as string variables and reports no match honestly", () => {
    const rule = regexruleof({ pattern: "order-(?<code>[a-z]+)-(?<num>\\d+)", flags: "", groups: ["code", "num"] })!;
    const matched = regexextract(rule, "ref order-abc-42 end", now);
    expect(matched.matched).toBe(true);
    expect(matched.variables.map((variable) => [variable.name, variable.value])).toEqual([
      ["code", "abc"],
      ["num", "42"],
    ]);
    const missed = regexextract(rule, "no marker here", now);
    expect(missed).toEqual({ matched: false, variables: [] });
    const optional = regexruleof({
      pattern: "ref-(?<code>[a-z]+)(?:-(?<num>\\d+))?",
      flags: "",
      groups: ["code", "num"],
    })!;
    const absent = regexextract(optional, "ref-abc", now);
    expect(absent.matched).toBe(true);
    expect(absent.variables.map((variable) => [variable.name, variable.value])).toEqual([
      ["code", "abc"],
      ["num", ""],
    ]);
  });
});

describe("delayjitter and waitelementplan", () => {
  it("samples the delay inside the reviewed window across seeded runs", () => {
    const delay = { base: 1000, jitter: 400 };
    const samples = Array.from({ length: 200 }, (_, index) => delayjitter(delay, index + 1));
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(800);
      expect(sample).toBeLessThanOrEqual(1200);
    }
    expect(new Set(samples.map((sample) => Math.round(sample))).size).toBeGreaterThan(50);
    expect(delayjitter({ base: 500, jitter: 0 }, 7)).toBe(500);
    expect(delayjitter({ base: 10, jitter: 100 }, 3)).toBeGreaterThanOrEqual(0);
    expect(delayjitter({ base: 0, jitter: 0 }, 3)).toBe(0);
  });

  it("plans the element wait polling inside the reviewed timeout and poll interval", () => {
    expect(waitelementplan({ timeout: 1000, poll: 250 })).toEqual({ probes: 5, lastwait: 0 });
    expect(waitelementplan({ timeout: 1100, poll: 250 })).toEqual({ probes: 5, lastwait: 100 });
    expect(waitelementplan({ timeout: 0, poll: 250 })).toEqual({ probes: 1, lastwait: 0 });
    expect(waitelementplan({ timeout: 1000, poll: 0 })).toEqual({ probes: 1, lastwait: 0 });
  });
});

describe("run lifecycle", () => {
  it("pauses, resumes and cancels with recorded reasons", () => {
    const run = newworkflowrun({ id: "run1", workflowid: "wf1", now });
    expect(run.state).toBe("pending");
    expect(run.cursor).toBe(0);
    const dry = newworkflowrun({ id: "run2", workflowid: "wf1", dryrun: true, now });
    expect(dry.dryrun).toBe(true);
    const running: workflowrun = { ...run, state: "running" };
    const paused = pauserun(running, now + 10);
    expect(paused.state).toBe("paused");
    expect(paused.cursor).toBe(0);
    expect(() => pauserun(paused, now + 20)).toThrow("Only a running");
    const cancelled = cancelrun(running, "user cancel", now + 30);
    expect(cancelled.state).toBe("cancelled");
    expect(cancelled.cancelreason).toBe("user cancel");
    expect(cancelrun({ ...run, state: "done" }, "late", now)).toEqual({ ...run, state: "done" });
  });
});

describe("runstep", () => {
  it("executes exactly one step with interpolation, expression and extract support", async () => {
    const step = workflowstepof({
      id: "s1",
      kind: "readtext",
      label: "Read the heading",
      target: 'h1[data-name="${name}"]',
      expression: {
        left: { ref: "name" },
        right: { literal: "!" },
        operator: "concat",
        result: "greeting",
        resultkind: "string",
      },
    })!;
    const executed = await runstep({
      step,
      scopes: [{ name: "root", variables: [{ name: "name", kind: "string", value: "dev", setat: now }] }],
      outputs: {},
      execute: async (dispatched) => ({ ok: true, summary: `read ${dispatched.target}`, details: { text: "hello" } }),
      now,
    });
    expect(executed.output.ok).toBe(true);
    expect(executed.output.summary).toBe('read h1[data-name="dev"]');
    expect(executed.log.state).toBe("done");
    expect(executed.log.produced).toEqual(["greeting"]);
    expect(executed.log.consumed).toEqual(["name"]);
    expect(resolvevariable(executed.scopes, "greeting")?.value).toBe("dev!");
  });

  it("refuses undefined variable references inside a single step", async () => {
    const step = workflowstepof({ id: "s1", kind: "readtext", label: "Read", target: "h1", value: "${missing}" })!;
    const executed = await runstep({
      step,
      scopes: [{ name: "root", variables: [] }],
      outputs: {},
      execute: async () => ({ ok: true, summary: "never" }),
      now,
    });
    expect(executed.output.ok).toBe(false);
    expect(executed.output.summary).toContain("undefined variable missing");
    expect(executed.log.state).toBe("failed");
  });

  it("runs one chosen step in isolation outside the run loop", async () => {
    const step = workflowstepof({ id: "s9", kind: "readtext", label: "Isolated read", target: "p" })!;
    const executed = await runstep({
      step,
      scopes: [{ name: "root", variables: [] }],
      outputs: {},
      execute: async (dispatched) => ({ ok: true, summary: `isolated ${dispatched.kind}` }),
      now,
    });
    expect(executed.output.summary).toBe("isolated readtext");
    expect(executed.log.checkpoint).toBe(true);
  });
});

describe("runworkflow", () => {
  const record = readworkflow();

  it("advances one step at a time with checkpoints after every completed step", async () => {
    const checkpoints: number[] = [];
    const result = await runworkflow({
      record,
      run: newworkflowrun({ id: "run1", workflowid: record.id, now }),
      execute: async (step) => ({ ok: true, summary: `did ${step.label}` }),
      now,
      gates: { sessionactive: true, planapproved: true, origingranted: () => true },
      oncheckpoint: async (state) => {
        checkpoints.push(state.run.cursor);
      },
    });
    expect(result.run.state).toBe("done");
    expect(result.run.cursor).toBe(2);
    expect(checkpoints).toEqual([1, 2]);
    expect(result.log.map((entry) => entry.state)).toEqual(["done", "done"]);
    expect(result.log.every((entry) => entry.checkpoint === true)).toBe(true);
  });

  it("opens a child scope per block region and closes it at the end", async () => {
    const inner = workflowblockof({
      name: "inner",
      label: "Inner",
      steps: [{ id: "i1", kind: "wait", label: "Inner wait", value: "5" }],
    })!;
    const blocked = composeworkflow({
      name: "blocked",
      version: 1,
      origins: ["https://example.com"],
      steps: [
        { block: "inner", label: "Call inner" },
        { id: "t1", kind: "readtext", label: "Top read", target: "p" },
      ],
      blocks: [inner],
      now,
      kindallowed,
      riskof,
    });
    const result = await runworkflow({
      record: blocked,
      run: newworkflowrun({ workflowid: blocked.id, now }),
      execute: async () => ({ ok: true, summary: "ok" }),
      now,
      gates: { sessionactive: true, planapproved: true, origingranted: () => true },
    });
    expect(result.log[0]?.block).toBe("inner");
    expect(result.log[1]?.block).toBeUndefined();
    expect(result.scopes).toHaveLength(1);
  });

  it("refuses to run outside an approved session and outside the origin grants", async () => {
    const run = newworkflowrun({ workflowid: record.id, now });
    await expect(
      runworkflow({
        record,
        run,
        execute: async () => ({ ok: true, summary: "x" }),
        now,
        gates: { sessionactive: false, planapproved: true, origingranted: () => true },
      }),
    ).rejects.toThrow("approved session");
    await expect(
      runworkflow({
        record,
        run,
        execute: async () => ({ ok: true, summary: "x" }),
        now,
        gates: { sessionactive: true, planapproved: false, origingranted: () => true },
      }),
    ).rejects.toThrow("approved plan");
    await expect(
      runworkflow({
        record,
        run,
        execute: async () => ({ ok: true, summary: "x" }),
        now,
        gates: { sessionactive: true, planapproved: true, origingranted: () => false },
      }),
    ).rejects.toThrow("outside the session grants");
    await expect(
      runworkflow({ record, run: { ...run, state: "done" }, execute: async () => ({ ok: true, summary: "x" }), now }),
    ).rejects.toThrow("already done");
  });

  it("fails the run when a step fails and resumes a paused run from its checkpoint", async () => {
    let calls = 0;
    const failing = await runworkflow({
      record,
      run: newworkflowrun({ workflowid: record.id, now }),
      execute: async (step) => {
        calls += 1;
        return step.id === "s1" ? { ok: true, summary: "first done" } : { ok: false, summary: "the page refused" };
      },
      now,
      gates: { sessionactive: true, planapproved: true, origingranted: () => true },
    });
    expect(failing.run.state).toBe("failed");
    expect(failing.run.cursor).toBe(1);
    expect(failing.run.failreason).toBe("the page refused");
    const resumed = await runworkflow({
      record,
      run: { ...failing.run, state: "paused" },
      log: failing.log,
      outputs: failing.outputs,
      execute: async () => {
        calls += 1;
        return { ok: true, summary: "recovered" };
      },
      now,
      gates: { sessionactive: true, planapproved: true, origingranted: () => true },
    });
    expect(resumed.run.state).toBe("done");
    expect(resumed.run.cursor).toBe(2);
    expect(resumed.log.map((entry) => entry.stepid)).toEqual(["s1", "s2", "s2"]);
    expect(resumed.log[1]?.state).toBe("failed");
    expect(resumed.log[2]?.state).toBe("done");
    expect(calls).toBe(3);
  });
});

describe("dryrunworkflow", () => {
  it("evaluates every step read only with no mutation and refuses steps without a projection", () => {
    const record = composeworkflow({
      name: "mixed",
      version: 1,
      origins: ["https://example.com"],
      steps: [
        { id: "r1", kind: "readtext", label: "Read only", target: "p" },
        { id: "c1", kind: "click", label: "Mutating click", target: "#submit" },
        {
          id: "d1",
          kind: "delay",
          label: "Jittered delay",
          options: JSON.stringify({ delay: { base: 100, jitter: 20 } }),
        },
      ] as never,
      now,
      kindallowed,
      riskof,
    });
    const evaluated = dryrunworkflow({
      record,
      run: newworkflowrun({ workflowid: record.id, dryrun: true, now }),
      now,
      projection: dryrunprojection,
    });
    expect(evaluated.run.state).toBe("done");
    expect(evaluated.run.dryrun).toBe(true);
    expect(evaluated.run.cursor).toBe(3);
    expect(evaluated.log.map((entry) => entry.state)).toEqual(["done", "refused", "done"]);
    expect(evaluated.log[1]?.summary).toContain("no read only projection");
    expect(evaluated.log[2]?.summary).toContain("jitter window");
    expect(evaluated.log.every((entry) => entry.duration === 0)).toBe(true);
    expect(dryrunprojection({ id: "x", kind: "click", label: "Click", target: "#a" })).toBeUndefined();
    expect(dryrunprojection({ id: "x", kind: "waitelement", label: "Wait", target: ".item" })).toContain("poll");
    expect(dryrunprojection({ id: "x", kind: "compute", label: "Compute" })).toContain("expression");
    expect(dryrunprojection({ id: "x", kind: "extractvars", label: "Extract" })).toContain("regex");
  });
});

describe("workflow policy", () => {
  const step = (kind: toolstep["kind"], options: Record<string, unknown>): toolstep => ({
    id: "w1",
    kind,
    summary: "Reviewed workflow step",
    risk: actionrisk(kind),
    options: JSON.stringify(options),
  });
  const workflowpayload = (overides: Record<string, unknown> = {}): Record<string, unknown> => ({
    name: "reader",
    version: 1,
    origins: ["https://example.com"],
    steps: [{ id: "s1", kind: "readtext", label: "Read", target: "h1" }],
    ...overides,
  });

  it("validates the workflow grammar of every kind before any run is proposed", () => {
    expect(validatestep(step("composeworkflow", { workflow: workflowpayload() }), "https://example.com")).toEqual({
      allowed: true,
    });
    expect(
      validatestep(step("composeworkflow", { workflow: workflowpayload({ name: " " }) }), "https://example.com"),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("name") });
    expect(
      validatestep(step("composeworkflow", { workflow: workflowpayload({ version: 0 }) }), "https://example.com"),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("version") });
    expect(
      validatestep(step("composeworkflow", { workflow: workflowpayload({ origins: [] }) }), "https://example.com"),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("origin") });
    expect(
      validatestep(
        step("composeworkflow", { workflow: workflowpayload({ origins: ["http://example.com"] }) }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("HTTPS") });
    expect(
      validatestep(step("composeworkflow", { workflow: workflowpayload({ steps: [] }) }), "https://example.com"),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("step list") });
    expect(
      validatestep(
        step("composeworkflow", {
          workflow: workflowpayload({ steps: [{ id: "s1", kind: "explode", label: "Ghost kind" }] }),
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false });
    expect(
      validatestep(
        step("composeworkflow", {
          workflow: workflowpayload({
            steps: [
              { id: "s1", kind: "wait", label: "Wait", bindings: [{ variable: "v", kind: "string", stepid: "ghost" }] },
            ],
          }),
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("ghost") });
    expect(validatestep(step("composeworkflow", {}), "https://example.com")).toMatchObject({
      allowed: false,
      reason: expect.stringContaining("workflow payload"),
    });
    expect(
      validatestep(
        step("savetemplate", {
          template: { name: "shared", step: { id: "s1", kind: "click", label: "Click", target: "#x" } },
        }),
        "https://example.com",
      ),
    ).toEqual({ allowed: true });
    expect(validatestep(step("savetemplate", { template: { name: " " } }), "https://example.com")).toMatchObject({
      allowed: false,
    });
    expect(validatestep(step("runworkflow", { workflowid: "wf1", reviewed: true }), "https://example.com")).toEqual({
      allowed: true,
    });
    expect(validatestep(step("runworkflow", { workflowid: "wf1" }), "https://example.com")).toMatchObject({
      allowed: false,
      reason: expect.stringContaining("run review"),
    });
    expect(validatestep(step("runworkflow", { reviewed: true }), "https://example.com")).toMatchObject({
      allowed: false,
    });
    expect(
      validatestep(
        step("runworkflow", { workflowid: "wf1", reviewed: true, variables: { count: "many" } }),
        "https://example.com",
      ),
    ).toEqual({ allowed: true });
    expect(
      validatestep(
        step("runworkflow", { workflowid: "wf1", reviewed: true, variables: { count: { nested: true } } }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("variables") });
    expect(validatestep(step("dryrun", { workflowid: "wf1" }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(step("dryrun", {}), "https://example.com")).toMatchObject({ allowed: false });
    expect(validatestep(step("delay", { delay: { base: 100, jitter: 20 } }), "https://example.com")).toEqual({
      allowed: true,
    });
    expect(validatestep(step("delay", { delay: { base: -1, jitter: 0 } }), "https://example.com")).toMatchObject({
      allowed: false,
      reason: expect.stringContaining("base"),
    });
    expect(validatestep(step("delay", { delay: { base: 100, jitter: -5 } }), "https://example.com")).toMatchObject({
      allowed: false,
      reason: expect.stringContaining("jitter"),
    });
    expect(validatestep(step("delay", {}), "https://example.com")).toMatchObject({ allowed: false });
    expect(
      validatestep(
        step("waitelement", { wait: { selector: ".item", timeout: 5000, poll: 250 } }),
        "https://example.com",
      ),
    ).toEqual({ allowed: true });
    expect(
      validatestep(step("waitelement", { wait: { selector: " ", timeout: 5, poll: 1 } }), "https://example.com"),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("selector") });
    expect(
      validatestep(step("waitelement", { wait: { selector: ".item", timeout: -1, poll: 1 } }), "https://example.com"),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("timeout") });
    expect(
      validatestep(step("waitelement", { wait: { selector: ".item", timeout: 5, poll: -1 } }), "https://example.com"),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("poll") });
    expect(
      validatestep(
        step("compute", {
          expression: {
            left: { ref: "a" },
            right: { literal: 1 },
            operator: "add",
            result: "total",
            resultkind: "number",
          },
        }),
        "https://example.com",
      ),
    ).toEqual({ allowed: true });
    expect(
      validatestep(
        step("compute", {
          expression: { left: { ref: "a" }, operator: "explode", result: "total", resultkind: "number" },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false });
    expect(
      validatestep(
        step("compute", {
          expression: {
            left: { literal: true },
            right: { literal: 1 },
            operator: "add",
            result: "total",
            resultkind: "number",
          },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("numeric operands") });
    expect(
      validatestep(
        step("compute", {
          expression: {
            left: { literal: 1 },
            right: { literal: 2 },
            operator: "and",
            result: "both",
            resultkind: "boolean",
          },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("boolean operands") });
    expect(
      validatestep(
        step("compute", {
          expression: {
            left: { ref: "a" },
            right: { literal: 2 },
            operator: "add",
            result: "total",
            resultkind: "boolean",
          },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("number result kind") });
    expect(
      validatestep(
        step("compute", {
          expression: {
            left: { ref: "a" },
            operator: "not",
            right: { literal: true },
            result: "n",
            resultkind: "boolean",
          },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("one operand") });
    expect(
      validatestep(
        step("compute", {
          expression: {
            left: { ref: "a" },
            operator: "length",
            right: { literal: 1 },
            result: "n",
            resultkind: "number",
          },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("one operand") });
    expect(
      validatestep(
        step("extractvars", { rule: { pattern: "(?<code>[a-z]+)", flags: "", groups: ["code"] }, text: "order-abc" }),
        "https://example.com",
      ),
    ).toEqual({ allowed: true });
    expect(
      validatestep(
        step("extractvars", { rule: { pattern: "(a+)+$", flags: "", groups: [] }, text: "x" }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("backtracking") });
    expect(
      validatestep(
        step("extractvars", { rule: { pattern: "(", flags: "", groups: [] }, text: "x" }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("compile") });
    expect(
      validatestep(step("extractvars", { rule: { pattern: "x", flags: "", groups: [] } }), "https://example.com"),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("text") });
  });

  it("rejects unbounded backtracking regex shapes while bounded repeats stay user choices", () => {
    /* the explosive shapes arrive assembled at runtime, because a constant explosive pattern would itself read as an unsafe regex reaching the compile check */
    const explosiveplus = ["(a", "+)+b"].join("");
    const explosivestar = ["(a", "*)*x"].join("");
    const explosiverepeat = ["(a{2,", "}){1,}"].join("");
    expect(validateregexrule(explosiveplus)).toMatchObject({ allowed: false });
    expect(validateregexrule(explosivestar)).toMatchObject({ allowed: false });
    expect(validateregexrule(explosiverepeat)).toMatchObject({ allowed: false });
    expect(validateregexrule("(?<code>[a-z]+)-\\d+")).toEqual({ allowed: true });
    expect(validateregexrule("a{2,5}")).toEqual({ allowed: true });
    expect(validateregexrule("[")).toMatchObject({ allowed: false, reason: expect.stringContaining("compile") });
  });

  it("gates every workflow behind the session, plan review and the explicit run review", () => {
    const runstep = step("runworkflow", { workflowid: "wf1", reviewed: true });
    expect(workflowgate({ session, plan, step: runstep, tabid: 4, origin: "https://example.com", now })).toEqual({
      allowed: true,
    });
    expect(
      workflowgate({ session: undefined, plan, step: runstep, tabid: 4, origin: "https://example.com", now }),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("session") });
    expect(
      workflowgate({
        session: { ...session, pausedat: now - 1 },
        plan,
        step: runstep,
        tabid: 4,
        origin: "https://example.com",
        now,
      }),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("paused") });
    expect(
      workflowgate({
        session,
        plan: { ...plan, state: "pending" },
        step: runstep,
        tabid: 4,
        origin: "https://example.com",
        now,
      }),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("approved plan review") });
    expect(
      workflowgate({
        session,
        plan,
        step: step("runworkflow", { workflowid: "wf1" }),
        tabid: 4,
        origin: "https://example.com",
        now,
      }),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("run review") });
    expect(
      workflowgate({
        session,
        plan,
        step: step("dryrun", { workflowid: "wf1" }),
        tabid: 4,
        origin: "https://example.com",
        now,
      }),
    ).toEqual({ allowed: true });
    expect(canexecute({ session, plan, step: runstep, tabid: 4, origin: "https://example.com", now })).toEqual({
      allowed: true,
    });
    expect(
      canexecute({
        session,
        plan: { ...plan, state: "pending" },
        step: runstep,
        tabid: 4,
        origin: "https://example.com",
        now,
      }),
    ).toMatchObject({ allowed: false });
  });
});

describe("workflow protocol", () => {
  it("parses a workflow proposal with the expanded step list and refuses ungranted origins", () => {
    const proposal = parseworkflowproposal(
      {
        version: protocolversion,
        workflow: {
          name: "reader",
          version: 2,
          origins: ["https://example.com"],
          steps: [{ id: "s1", kind: "readtext", label: "Read", target: "h1" }],
          blocks: [
            { name: "waitblock", label: "Waits", steps: [{ id: "b1", kind: "wait", label: "Wait", value: "5" }] },
          ],
        },
      },
      "https://example.com",
      ["https://example.com"],
      true,
    );
    expect(proposal.version).toBe(protocolversion);
    expect(proposal.dryrun).toBe(true);
    expect(proposal.workflow.version).toBe(2);
    expect(proposal.workflow.steps).toHaveLength(1);
    expect(Object.isFrozen(proposal.workflow)).toBe(true);
    expect(() =>
      parseworkflowproposal(
        {
          version: "1.0.0",
          workflow: {
            name: "x",
            version: 1,
            origins: ["https://example.com"],
            steps: [{ id: "s1", kind: "wait", label: "Wait" }],
          },
        },
        "https://example.com",
      ),
    ).toThrow("version");
    expect(() =>
      parseworkflowproposal(
        {
          version: protocolversion,
          workflow: {
            name: "x",
            version: 1,
            origins: ["https://elsewhere.example"],
            steps: [{ id: "s1", kind: "wait", label: "Wait" }],
          },
        },
        "https://example.com",
      ),
    ).toThrow("outside the grants");
    expect(() =>
      parseworkflowproposal(
        {
          version: protocolversion,
          workflow: {
            name: "x",
            version: 0,
            origins: ["https://example.com"],
            steps: [{ id: "s1", kind: "wait", label: "Wait" }],
          },
        },
        "https://example.com",
      ),
    ).toThrow("version");
    expect(() =>
      parseworkflowproposal(
        {
          version: protocolversion,
          workflow: { name: "x", version: 1, origins: [], steps: [{ id: "s1", kind: "wait", label: "Wait" }] },
        },
        "https://example.com",
      ),
    ).toThrow("origin");
    expect(() =>
      parseworkflowproposal(
        { version: protocolversion, workflow: { name: "x", version: 1, origins: ["https://example.com"], steps: [] } },
        "https://example.com",
      ),
    ).toThrow("at least one step");
    expect(() =>
      parseworkflowproposal(
        {
          version: protocolversion,
          workflow: {
            name: "x",
            version: 1,
            origins: ["https://example.com"],
            steps: [{ id: "s1", kind: "explode", label: "Ghost" }],
          },
        },
        "https://example.com",
      ),
    ).toThrow("reviewed action kind");
  });

  it("carries the workflow envelope through proposals and outcomes", () => {
    const proposal = parseproposal(
      {
        version: protocolversion,
        plan: {
          objective: "Compose and run",
          steps: [
            {
              kind: "composeworkflow",
              options: JSON.stringify({
                workflow: {
                  name: "reader",
                  version: 1,
                  origins: ["https://example.com"],
                  steps: [{ id: "s1", kind: "readtext", label: "Read", target: "h1" }],
                },
              }),
              summary: "Compose the reader workflow.",
            },
            {
              kind: "runworkflow",
              options: JSON.stringify({ workflowid: "wf1", reviewed: true }),
              summary: "Run the reviewed workflow.",
            },
            { kind: "dryrun", options: JSON.stringify({ workflowid: "wf1" }), summary: "Dry run the workflow." },
          ],
        },
      },
      "https://example.com",
    );
    expect(proposal.plan.steps.map((step) => step.kind)).toEqual(["composeworkflow", "runworkflow", "dryrun"]);
    expect(proposal.plan.steps.map((step) => step.risk)).toEqual(["read", "sensitive", "read"]);
    expect(() =>
      parseproposal(
        {
          version: protocolversion,
          plan: {
            objective: "Unreviewed run",
            steps: [
              { kind: "runworkflow", options: JSON.stringify({ workflowid: "wf1" }), summary: "Run without review." },
            ],
          },
        },
        "https://example.com",
      ),
    ).toThrow("run review");
    expect(() =>
      parseproposal(
        {
          version: protocolversion,
          plan: {
            objective: "Ungranted origin",
            steps: [
              {
                kind: "composeworkflow",
                options: JSON.stringify({
                  workflow: {
                    name: "x",
                    version: 1,
                    origins: ["https://elsewhere.example"],
                    steps: [{ id: "s1", kind: "wait", label: "Wait" }],
                  },
                }),
                summary: "Compose outside grants.",
              },
            ],
          },
        },
        "https://example.com",
      ),
    ).toThrow("outside the grants");
    const run = newworkflowrun({ id: "run1", workflowid: "wf1", now });
    const entries: runlogentry[] = [
      {
        stepid: "s1",
        label: "Read",
        state: "done",
        startedat: now,
        duration: 12,
        summary: "read the heading",
        produced: ["title"],
        consumed: [],
        checkpoint: true,
      },
      {
        stepid: "s2",
        label: "Click",
        state: "failed",
        startedat: now + 20,
        duration: 3,
        summary: "refused",
        block: "formblock",
      },
    ];
    const outcome = workflowoutcome({ run, entries });
    expect(outcome.runid).toBe("run1");
    expect(outcome.state).toBe("pending");
    expect(outcome.dryrun).toBeUndefined();
    expect(outcome.steps).toHaveLength(2);
    expect(outcome.steps[0]?.produced).toEqual(["title"]);
    expect(outcome.steps[1]?.block).toBe("formblock");
    const single = workflowoutcome({ run, entries, stepid: "s1" });
    expect(single.steps).toHaveLength(1);
    expect(single.steps[0]?.stepid).toBe("s1");
    const dryoutcome = workflowoutcome({ run: { ...run, dryrun: true }, entries });
    expect(dryoutcome.dryrun).toBe(true);
    const report = workflowreport({ workflows: [], runs: [run], templates: [] });
    expect(report.log).toEqual([]);
    expect(report.scopes).toEqual([]);
    expect(report.provenance).toEqual([]);
    expect(report.version).toBe(protocolversion);
  });
});

describe("workflow memory", () => {
  it("stores workflow records, runs, runlogs, scopes, provenance and templates", async () => {
    const store = new sessionmemory(new fakeadapter());
    const record = readworkflow();
    const older = { ...record, version: 1, steps: [{ ...(record.steps[0] as object), id: "old" }] } as typeof record;
    await store.addworkflowrecord(older);
    await store.addworkflowrecord(record);
    await store.addworkflowrecord({ ...record, version: 2 });
    const versions = await store.getworkflowrecordversions();
    expect(versions).toHaveLength(2);
    expect(await store.listworkflows()).toHaveLength(1);
    expect((await store.getworkflowrecord(record.id))?.version).toBe(2);
    expect(await store.getworkflowrecord("missing")).toBeUndefined();
    const run = newworkflowrun({ id: "run1", workflowid: record.id, now });
    await store.setworkflowrun(run);
    await store.setworkflowrun({ ...run, state: "done", endedat: now + 5 });
    const runs = await store.listworkflowruns();
    expect(runs).toHaveLength(1);
    expect(runs[0]?.state).toBe("done");
    await store.addrunlogentry(run.id, {
      stepid: "s1",
      label: "Read",
      state: "done",
      startedat: now,
      duration: 4,
      summary: "read",
      checkpoint: true,
    });
    await store.addrunlogentry(run.id, {
      stepid: "s2",
      label: "Wait",
      state: "done",
      startedat: now + 1,
      duration: 2,
      summary: "waited",
    });
    const stored = await store.getrun(run.id);
    expect(stored?.run.state).toBe("done");
    expect(stored?.log).toHaveLength(2);
    expect(await store.getrun("missing")).toBeUndefined();
    const scopes: variablescope[] = [
      { name: "root", variables: [{ name: "title", kind: "string", value: "hi", setat: now }] },
    ];
    await store.setrunscopes(run.id, scopes);
    expect(await store.getrunscopes(run.id)).toEqual(scopes);
    await store.addworkflowprovenance(run.id, { runid: run.id, kind: "expression", name: "total", value: 5, at: now });
    await store.addworkflowprovenance(run.id, { runid: run.id, kind: "regex", name: "code", value: "abc", at: now });
    expect((await store.getworkflowprovenance(run.id)).map((entry) => entry.kind)).toEqual(["expression", "regex"]);
    await store.addsteptemplate({
      id: "t1",
      name: "shared click",
      origin: "https://example.com",
      step: { id: "s1", kind: "click", label: "Click", target: "#x" },
      sharedat: now,
    });
    await store.addsteptemplate({
      id: "t2",
      name: "shared click",
      origin: "https://example.com",
      step: { id: "s2", kind: "click", label: "Click", target: "#y" },
      sharedat: now + 1,
    });
    expect(await store.getsteptemplates()).toHaveLength(1);
  });

  it("applies the runlog retention window as a user choice with no ceiling", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsettings({ runlogretention: 2 });
    for (const index of [1, 2, 3, 4])
      await store.addrunlogentry("run1", {
        stepid: `s${index}`,
        label: `Step ${index}`,
        state: "done",
        startedat: now + index,
        duration: 1,
        summary: "done",
      });
    const log = await store.getrunlog("run1");
    expect(log.map((entry) => entry.stepid)).toEqual(["s3", "s4"]);
    const unlimited = new sessionmemory(new fakeadapter());
    for (const index of [1, 2, 3])
      await unlimited.addrunlogentry("run1", {
        stepid: `s${index}`,
        label: `Step ${index}`,
        state: "done",
        startedat: now + index,
        duration: 1,
        summary: "done",
      });
    expect(await unlimited.getrunlog("run1")).toHaveLength(3);
  });
});

describe("workflow progress", () => {
  it("records workflow evidence and tracks completion as executed over total steps", () => {
    let progress = recordworkflow(
      undefined,
      "run",
      "w1",
      { family: "run", detail: "Ran the workflow reader", runid: "run1", executed: 2, total: 3 },
      now,
    );
    progress = recordworkflow(
      progress,
      "run",
      "w1",
      { family: "dryrun", detail: "Dry ran the workflow reader", runid: "run2", executed: 3, refused: 0, total: 3 },
      now + 1,
    );
    const evidence = workflowevidences(progress, "run", "w1");
    expect(evidence.map((entry) => entry.family)).toEqual(["run", "dryrun"]);
    expect(evidence[0]?.total).toBe(3);
    expect((progress.outcomes ?? [])[0]?.summary).toContain("2 executed steps");
    expect(workflowevidences(progress, "other", "w1")).toEqual([]);
    expect(workflowshare(2, 4)).toBe(0.5);
    expect(workflowshare(5, 4)).toBe(1);
    expect(workflowshare(0, 0)).toBe(0);
  });
});

describe("workflow editor engine", () => {
  it("binds the nested params of a block invocation into the block scope and refuses wrong kind defaults", async () => {
    const inner = workflowblockof({
      name: "inner",
      label: "Inner block",
      steps: [{ id: "i1", kind: "delay", label: "Delay by param", options: '{"base":"${base}"}' }],
    });
    if (!inner) throw new Error("The inner block did not normalize.");
    const record = composeworkflow({
      id: "wfparam",
      name: "params",
      version: 1,
      origins: ["https://example.com"],
      steps: [{ block: "inner", label: "Call inner", params: [{ name: "base", kind: "string", default: "250" }] }],
      blocks: [inner],
      now,
      kindallowed,
      riskof,
    });
    expect(record.steps[0]?.params).toEqual([{ name: "base", kind: "string", default: "250" }]);
    const dispatched: Array<string | undefined> = [];
    const result = await runworkflow({
      record,
      run: newworkflowrun({ workflowid: record.id, now }),
      execute: async (step) => {
        dispatched.push(step.options);
        return { ok: true, summary: "delayed" };
      },
      now,
      gates: { sessionactive: true, planapproved: true, origingranted: () => true },
    });
    expect(result.run.state).toBe("done");
    expect(dispatched).toEqual(['{"base":"250"}']);
    const bad = composeworkflow({
      id: "wfparam",
      name: "params",
      version: 1,
      origins: ["https://example.com"],
      steps: [
        { block: "inner", label: "Call inner", params: [{ name: "base", kind: "number", default: "not a number" }] },
      ],
      blocks: [inner],
      now,
      kindallowed,
      riskof,
    });
    const failed = await runworkflow({
      record: bad,
      run: newworkflowrun({ workflowid: bad.id, now }),
      execute: async () => ({ ok: true, summary: "never reached" }),
      now,
      gates: { sessionactive: true, planapproved: true, origingranted: () => true },
    });
    expect(failed.run.state).toBe("failed");
    expect(failed.run.failreason).toContain("nested parameter");
  });

  it("checkpoints a background run and restores it from the last checkpoint after a worker wake", async () => {
    const record = readworkflow();
    const stored = {
      run: { ...newworkflowrun({ id: "bgrun", workflowid: record.id, now }), background: true } as workflowrun,
      scopes: [{ name: "root", variables: [] }] as variablescope[],
      log: [] as runlogentry[],
    };
    const interrupted = await runworkflow({
      record,
      run: stored.run,
      scopes: stored.scopes,
      log: stored.log,
      execute: async (step) => {
        if (step.id === "s2") throw new Error("service worker restarted");
        return { ok: true, summary: `did ${step.id}` };
      },
      now,
      gates: { sessionactive: true, planapproved: true, origingranted: () => true },
      oncheckpoint: async (state) => {
        stored.run = state.run;
        stored.scopes = state.scopes;
        stored.log = [...state.log];
      },
    });
    expect(interrupted.run.state).toBe("failed");
    expect(interrupted.run.failreason).toBe("service worker restarted");
    expect(stored.run.cursor).toBe(1);
    expect(stored.log.map((entry) => entry.stepid)).toEqual(["s1"]);
    const paused = { ...stored.run, state: "paused" as const, pausedat: now + 1, pausekind: "interrupt" as const };
    const restored = await runworkflow({
      record,
      run: paused,
      scopes: stored.scopes,
      log: stored.log,
      execute: async (step) => ({ ok: true, summary: `restored ${step.id}` }),
      now,
      gates: { sessionactive: true, planapproved: true, origingranted: () => true },
    });
    expect(restored.run.state).toBe("done");
    expect(restored.run.cursor).toBe(2);
    expect(restored.log.map((entry) => entry.stepid)).toEqual(["s1", "s2"]);
    expect(restored.log[1]?.summary).toBe("restored s2");
  });

  it("detects stalled runs and recovers them by the configured action", () => {
    const config = { enabled: true, stallthreshold: 30_000, action: "retry" as const };
    const stalled = {
      ...newworkflowrun({ id: "stall", workflowid: "wf", now: now - 90_000 }),
      state: "running" as const,
      cursor: 2,
    };
    const verdicts = watchdogpass({
      runs: [stalled],
      lastcompletedat: { stall: now - 60_000 },
      liveexecutors: ["stall"],
      config,
      now,
    });
    expect(verdicts).toHaveLength(1);
    expect(verdicts[0]?.verdict).toBe("stalled");
    expect(verdicts[0]?.action).toBe("retry");
    expect(verdicts[0]?.reason).toContain("60");
    expect(verdicts[0]?.lastcompletedat).toBe(now - 60_000);
    const pausing = watchdogpass({
      runs: [stalled],
      lastcompletedat: { stall: now - 60_000 },
      liveexecutors: ["stall"],
      config: { enabled: true, stallthreshold: 30_000, action: "pause" },
      now,
    });
    expect(pausing[0]?.action).toBe("pause");
    const cancelling = watchdogpass({
      runs: [stalled],
      lastcompletedat: { stall: now - 60_000 },
      liveexecutors: ["stall"],
      config: { enabled: true, stallthreshold: 30_000, action: "cancel" },
      now,
    });
    expect(cancelling[0]?.action).toBe("cancel");
    const healthy = watchdogpass({
      runs: [stalled],
      lastcompletedat: { stall: now - 100 },
      liveexecutors: ["stall"],
      config,
      now,
    });
    expect(healthy[0]?.verdict).toBe("healthy");
    expect(healthy[0]?.action).toBe("none");
    expect(
      watchdogpass({
        runs: [{ ...stalled, state: "paused" }],
        lastcompletedat: { stall: now - 90_000 },
        liveexecutors: [],
        config,
        now,
      }),
    ).toEqual([]);
  });

  it("reaps zombie runs that browser shutdowns left behind", () => {
    const config = { enabled: true, stallthreshold: 30_000, action: "pause" as const, zombiewindow: 120_000 };
    const zombie = {
      ...newworkflowrun({ id: "zomb", workflowid: "wf", now: now - 300_000 }),
      state: "running" as const,
      cursor: 1,
    };
    const verdicts = watchdogpass({
      runs: [zombie],
      lastcompletedat: { zomb: now - 200_000 },
      liveexecutors: [],
      config,
      now,
    });
    expect(verdicts[0]?.verdict).toBe("zombie");
    expect(verdicts[0]?.action).toBe("reap");
    expect(verdicts[0]?.reason).toContain("checkpoint 1");
    const freshinterrupt = watchdogpass({
      runs: [zombie],
      lastcompletedat: { zomb: now - 1_000 },
      liveexecutors: [],
      config,
      now,
    });
    expect(freshinterrupt).toEqual([]);
    const nowindow = watchdogpass({
      runs: [zombie],
      lastcompletedat: { zomb: now - 200_000 },
      liveexecutors: [],
      config: { enabled: true, stallthreshold: 30_000, action: "pause" },
      now,
    });
    expect(nowindow).toEqual([]);
  });
});
