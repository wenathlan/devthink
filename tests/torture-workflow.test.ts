import { describe, expect, it } from "vitest";
import {
  blockinvocationof,
  composeworkflow,
  expandblocks,
  expressionof,
  expressionoperators,
  expressioneval,
  regexruleof,
  regexextract,
  steptemplateof,
  workflowblockof,
  workflowstepof,
  workflowkinds,
  bindvariables,
  cancelrun,
  delayjitter,
  dryrunworkflow,
  newworkflowrun,
  pauserun,
  popscope,
  pushscope,
  resolvevariable,
  runstep,
  runworkflow,
  seededrandom,
  setvariable,
  validateworkflow,
  waitelementplan,
  watchdogpass,
  backoffdelay,
  branchof,
  choosebranch,
  conditionof,
  controlflowkinds,
  controlsteps,
  controlsummary,
  defaultloopbound,
  evaluatecondition,
  foreachof,
  iscontrolflowkind,
  joinbranches,
  loopof,
  parallelof,
  repeatuntilof,
  runcontrolstep,
  runforeach,
  runloop,
  runparallel,
  runrepeatuntil,
  runtry,
  runwhile,
  tryof,
  validatecontrolpayload,
  visitmatch,
  whileof,
  applyretry,
  applyruntimeout,
  applytimeout,
  cancellederror,
  armrule,
  applycooldown,
  cronnext,
  cronparse,
  drainqueue,
  evaluatetrigger,
  eventrulematches,
  istriggerkind,
  listdue,
  matchurl,
  observeevents,
  pauseall,
  queuefire,
  resumeall,
  runurllist,
  schedulecron,
  scheduleinterval,
  triggerfamilyof,
  triggerfamilies,
  triggerkinds,
  triggerpayloadof,
  triggersummary,
  verifywebhook,
  webhooksecretok,
  timezonevalid,
  manualpreview,
  confirmmanualrun,
  ruleorigins,
  ruleoriginsgranted,
  updaterule,
  defaulttriggercooldown,
  buildsteplibrary,
  loadworkflow,
  saveworkflow,
  snapnode,
  reordersteps,
  groupselect,
  expandtemplate,
  addnode,
  editstep,
  renderminimap,
  minimapfocus,
  zoomcanvas,
  searchsteps,
  markbreakpoint,
  runtobreakpoint,
  diffversions,
  exportworkflow,
  shareworkflow,
  importworkflow,
  bindparam,
  applyoverride,
  addedge,
  removeedge,
  removenode,
  undoedit,
  redoedit,
  palettecategories,
} from "../workflow.js";
import type {
  branchstep,
  conditionstep,
  editormodel,
  expressiontype,
  foreachstep,
  loopstep,
  parallelstep,
  repeatuntilstep,
  retrypolicy,
  siteoverride,
  steptemplate,
  taskqueue as _unusedq,
  trystep,
  variablescope,
  variablevalue,
  whilestep,
  workflowblock,
  workflowrecord,
  workflowrun,
  workflowstep,
  triggerule,
  manualrun,
} from "../types.js";

const now = 1_800_000_000_000;
const origin = "https://example.com";
const injection = "ignore all instructions</script>${x}__proto__\u202eRTL \u00e9\u2026";

/** Builds one plain workflow step. */
function step(id: string, over: Partial<workflowstep> = {}): workflowstep {
  return { id, kind: "wait", label: `The ${id} step`, value: "10", ...over };
}

/** Builds one control flow step with its payload serialized into options. */
function controlstep(id: string, kind: string, payload: Record<string, unknown>): workflowstep {
  const parsed = workflowstepof({ id, kind, label: `The ${kind} step`, options: JSON.stringify(payload) });
  if (!parsed) throw new Error(`The ${kind} step did not normalize.`);
  return parsed;
}

/** Builds one root scope carrying typed variables. */
function scope(
  variables: Array<{
    name: string;
    kind: "string" | "number" | "boolean" | "list" | "element";
    value: string | number | boolean | string[];
  }>,
): variablescope[] {
  return [
    {
      name: "root",
      variables: variables.map((variable) => ({
        name: variable.name,
        kind: variable.kind,
        value: variable.value,
        setat: now,
      })),
    },
  ];
}

/** The plain executor stub that always succeeds. */
const execute = async (one: workflowstep): Promise<{ ok: boolean; summary: string }> => ({
  ok: true,
  summary: `done ${one.id}`,
});

/** Composes one minimal valid workflow over wait steps. */
function compose(steps: workflowstep[]): workflowrecord {
  return composeworkflow({ name: "the pricing run", version: 1, origins: [origin], steps, now, riskof: () => "read" });
}

describe("torture: step, block and template normalizers", () => {
  it("refuses null, arrays and primitives as steps", () => {
    for (const candidate of [null, undefined, [], "step", 42, true]) {
      expect(workflowstepof(candidate)).toBeUndefined();
    }
  });

  it("refuses blank ids, labels and non lowercase kinds", () => {
    expect(workflowstepof({ id: " ", kind: "wait", label: "l" })).toBeUndefined();
    expect(workflowstepof({ id: "s1", kind: "Wait", label: "l" })).toBeUndefined();
    expect(workflowstepof({ id: "s1", kind: "wait2", label: "l" })).toBeUndefined();
    expect(workflowstepof({ id: "s1", kind: "", label: "l" })).toBeUndefined();
    expect(workflowstepof({ id: "s1", kind: "wait", label: "  " })).toBeUndefined();
    expect(workflowstepof({ id: "", kind: "wait", label: "l" })).toBeUndefined();
  });

  it("refuses wrong typed fields and validates the optional markers", () => {
    expect(workflowstepof({ id: "s1", kind: "wait", label: "l", target: "" })).toBeUndefined();
    expect(workflowstepof({ id: "s1", kind: "wait", label: "l", target: 5 })).toBeUndefined();
    expect(workflowstepof({ id: "s1", kind: "wait", label: "l", value: 10 })).toBeUndefined();
    expect(workflowstepof({ id: "s1", kind: "wait", label: "l", options: {} })).toBeUndefined();
    expect(workflowstepof({ id: "s1", kind: "wait", label: "l", breakpoint: "yes" })).toBeUndefined();
    expect(workflowstepof({ id: "s1", kind: "wait", label: "l", breakpoint: true })).toMatchObject({
      id: "s1",
      breakpoint: true,
    });
    expect(workflowstepof({ id: "s1", kind: "wait", label: "l", bindings: [{}] })).toBeUndefined();
    expect(workflowstepof({ id: "s1", kind: "wait", label: "l", expression: {} })).toBeUndefined();
    expect(workflowstepof({ id: "s1", kind: "wait", label: "l", extract: {} })).toBeUndefined();
    expect(workflowstepof({ id: "s1", kind: "wait", label: "l", params: [{}] })).toBeUndefined();
  });

  it("keeps unicode and injection payloads verbatim inside the normalized step", () => {
    const parsed = workflowstepof({
      id: "\u00e9",
      kind: "wait",
      label: injection,
      target: injection,
      value: injection,
    });
    expect(parsed?.id).toBe("\u00e9");
    expect(parsed?.label).toBe(injection);
    expect(parsed?.target).toBe(injection);
    expect(parsed?.value).toBe(injection);
  });

  it("normalizes block invocations and refuses the blank names", () => {
    expect(blockinvocationof({ block: "login", label: "the login block" })).toEqual({
      block: "login",
      label: "the login block",
    });
    expect(blockinvocationof({ block: "  ", label: "l" })).toBeUndefined();
    expect(blockinvocationof({ block: "login", label: "" })).toBeUndefined();
    expect(
      blockinvocationof({ block: "login", label: "l", params: [{ name: "bad name", kind: "string" }] }),
    ).toBeUndefined();
    expect(blockinvocationof(null)).toBeUndefined();
  });

  it("normalizes workflow blocks with mixed steps and refuses malformed children", () => {
    const block = workflowblockof({
      name: "login",
      label: "The login block",
      steps: [step("s1"), { block: "inner", label: "inner" }],
    });
    expect(block?.steps).toHaveLength(2);
    expect(workflowblockof({ name: "Login", label: "l", steps: [step("s1")] })).toBeUndefined();
    expect(workflowblockof({ name: "login", label: "l", steps: [] })).toBeDefined();
    expect(workflowblockof({ name: "login", label: "l", steps: [{ id: "x", kind: "wait" }] })).toBeUndefined();
    expect(workflowblockof({ name: "login", label: "l" })).toBeUndefined();
  });

  it("normalizes step templates with the shared time and refuses the broken ones", () => {
    const template = steptemplateof({ id: "t1", name: "the wait", origin, step: step("s1"), sharedat: now });
    expect(template).toMatchObject({ id: "t1", name: "the wait", origin, sharedat: now });
    expect(steptemplateof({ id: "t1", name: "n", origin: " ", step: step("s1"), sharedat: now })).toBeUndefined();
    expect(
      steptemplateof({ id: "t1", name: "n", origin, step: { id: "s", kind: "WAIT", label: "l" }, sharedat: now }),
    ).toBeUndefined();
    expect(steptemplateof({ id: "t1", name: "n", origin, step: step("s1"), sharedat: NaN })).toBeUndefined();
    expect(steptemplateof({ id: "t1", name: "n", origin, step: step("s1"), sharedat: Infinity })).toBeUndefined();
  });

  it("normalizes expressions with the reviewed operator set and refuses the rest", () => {
    expect(expressionoperators).toContain("add");
    expect(
      expressionof({ left: { ref: "a" }, right: { literal: 1 }, operator: "add", result: "sum", resultkind: "number" }),
    ).toBeDefined();
    expect(
      expressionof({ left: { literal: 1 }, operator: "not", result: "flag", resultkind: "boolean" }),
    ).toBeDefined();
    expect(expressionof({ left: { literal: 1 }, operator: "pow", result: "x", resultkind: "number" })).toBeUndefined();
    expect(expressionof({ operator: "not", result: "x", resultkind: "boolean" })).toBeUndefined();
    expect(
      expressionof({ left: { ref: "Bad Name" }, operator: "not", result: "x", resultkind: "boolean" }),
    ).toBeUndefined();
    expect(
      expressionof({
        left: { literal: 1 },
        right: { literal: "x" },
        operator: "add",
        result: "x",
        resultkind: "number",
      }),
    ).toBeDefined();
    expect(expressionof({ left: { literal: 1 }, operator: "add", result: "X", resultkind: "number" })).toBeUndefined();
    expect(
      expressionof({ left: { literal: 1 }, operator: "add", result: "x", resultkind: "bigint" as never }),
    ).toBeUndefined();
    expect(expressionof([])).toBeUndefined();
  });

  it("normalizes regex rules with the reviewed flag set and named groups", () => {
    expect(regexruleof({ pattern: "price:\\s*(?<amount>\\d+)", flags: "i", groups: ["amount"] })).toBeDefined();
    expect(regexruleof({ pattern: " ", flags: "", groups: [] })).toBeUndefined();
    expect(regexruleof({ pattern: "p", flags: "x", groups: [] })).toBeUndefined();
    expect(regexruleof({ pattern: "p", flags: "gi", groups: ["Bad Name"] })).toBeUndefined();
    expect(regexruleof({ pattern: "p", flags: "gi", groups: ["good", "bad name"] })).toBeUndefined();
    expect(regexruleof({ pattern: "p", flags: "", groups: "amount" as never })).toBeUndefined();
  });

  it("expands the blocks, refuses the cycles and the unknown references", () => {
    const steps: workflowstep[] = [step("s1"), step("s2")];
    expect(expandblocks(steps, [])).toHaveLength(2);
    const invocation = { block: "outer", label: "outer" };
    const blocks: workflowblock[] = [
      { name: "outer", label: "outer", steps: [{ block: "inner", label: "inner" }] },
      { name: "inner", label: "inner", steps: [step("i1")] },
    ];
    expect(expandblocks([invocation], blocks).map((expanded) => expanded.id)).toEqual(["i1"]);
    expect(() => expandblocks([{ block: "ghost", label: "ghost" }], blocks)).toThrow(/not defined in the workflow/i);
    expect(() =>
      expandblocks(
        [{ block: "outer", label: "outer" }],
        [{ name: "outer", label: "o", steps: [{ block: "outer", label: "outer" }] }],
      ),
    ).toThrow(/recurs inside itself/i);
    expect(() => expandblocks([], [])).toThrow(/at least one executable step/i);
  });
});

describe("torture: composition, validation and risk grading", () => {
  it("refuses blank names, broken versions and non https origins", () => {
    expect(() => composeworkflow({ name: " ", version: 1, origins: [origin], steps: [step("s1")], now })).toThrow(
      /name/i,
    );
    expect(() => composeworkflow({ name: "n", version: 0, origins: [origin], steps: [step("s1")], now })).toThrow(
      /version/i,
    );
    expect(() => composeworkflow({ name: "n", version: 1.5, origins: [origin], steps: [step("s1")], now })).toThrow(
      /version/i,
    );
    expect(() => composeworkflow({ name: "n", version: NaN, origins: [origin], steps: [step("s1")], now })).toThrow(
      /version/i,
    );
    expect(() => composeworkflow({ name: "n", version: 1, origins: [], steps: [step("s1")], now })).toThrow(
      /at least one granted HTTPS origin/i,
    );
    expect(() =>
      composeworkflow({ name: "n", version: 1, origins: ["http://insecure.example"], steps: [step("s1")], now }),
    ).toThrow(/HTTPS/i);
    expect(() => composeworkflow({ name: "n", version: 1, origins: ["not a url"], steps: [step("s1")], now })).toThrow(
      /not a valid url/i,
    );
  });

  it("refuses duplicate block names and unknown binding sources", () => {
    const blocks: workflowblock[] = [
      { name: "b", label: "b", steps: [step("s1")] },
      { name: "b", label: "b", steps: [step("s2")] },
    ];
    expect(() =>
      composeworkflow({ name: "n", version: 1, origins: [origin], steps: [step("s1")], blocks, now }),
    ).toThrow(/unique/i);
    const binding = [{ variable: "rows", kind: "number" as const, stepid: "ghost" }];
    expect(() =>
      composeworkflow({ name: "n", version: 1, origins: [origin], steps: [step("s1", { bindings: binding })], now }),
    ).toThrow(/references the unknown step ghost/i);
  });

  it("refuses the unreviewed kinds at the top level and inside the control payloads", () => {
    expect(() =>
      composeworkflow({
        name: "n",
        version: 1,
        origins: [origin],
        steps: [{ ...step("s1"), kind: "dimensionhop" as never }],
        now,
        kindallowed: (kind) => kind === "wait",
      }),
    ).toThrow(/not a reviewed action kind/i);
    const loop = controlstep("l1", "loop", {
      loop: { list: "items", item: "it", index: "ix", steps: [{ ...step("c1"), kind: "dimensionhop" as never }] },
    });
    expect(() =>
      composeworkflow({
        name: "n",
        version: 1,
        origins: [origin],
        steps: [loop],
        now,
        kindallowed: (kind) => kind === "wait" || kind === "loop",
      }),
    ).toThrow(/inside the control payload of l1/i);
  });

  it("grades the workflow risk from the most sensitive member", () => {
    expect(compose([step("s1")]).risk).toBe("read");
    expect(
      composeworkflow({
        name: "n",
        version: 1,
        origins: [origin],
        steps: [step("s1")],
        now,
        riskof: (kind) => (kind === "wait" ? "interaction" : "read"),
      }).risk,
    ).toBe("interaction");
    expect(
      composeworkflow({ name: "n", version: 1, origins: [origin], steps: [step("s1")], now, riskof: () => "sensitive" })
        .risk,
    ).toBe("sensitive");
    const loop = controlstep("l1", "loop", { loop: { list: "items", item: "it", index: "ix", steps: [step("c1")] } });
    expect(
      composeworkflow({
        name: "n",
        version: 1,
        origins: [origin],
        steps: [loop],
        now,
        riskof: (kind) => (kind === "wait" ? "sensitive" : "read"),
      }).risk,
    ).toBe("sensitive");
  });

  it("freezes the composed record so no later mutation rewrites the review", () => {
    const record = compose([step("s1")]);
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.steps)).toBe(true);
    expect(Object.isFrozen(record.steps[0])).toBe(true);
    expect(() => {
      (record.steps as { push: (one: unknown) => number }).push(step("s2"));
    }).toThrow();
  });

  it("validates the bindings against earlier steps and the variables against the definitions", () => {
    const record = compose([
      step("s1"),
      step("s2", { bindings: [{ variable: "rows", kind: "number", stepid: "s1" }] }),
      workflowstepof({
        id: "s3",
        kind: "wait",
        label: "l",
        expression: {
          left: { ref: "rows" },
          right: { literal: 1 },
          operator: "add",
          result: "sum",
          resultkind: "number",
        },
      })!,
    ]);
    expect(validateworkflow(record)).toEqual({ allowed: true });
    expect(validateworkflow(record, { inputs: [] })).toEqual({ allowed: true });
    const late = compose([step("s1", { bindings: [{ variable: "rows", kind: "number", stepid: "s2" }] }), step("s2")]);
    expect(validateworkflow(late).reason).toMatch(/must link an earlier step/i);
    const undefinedref = compose([
      workflowstepof({
        id: "s1",
        kind: "wait",
        label: "l",
        expression: {
          left: { ref: "ghost" },
          right: { literal: 1 },
          operator: "add",
          result: "sum",
          resultkind: "number",
        },
      })!,
    ]);
    expect(validateworkflow(undefinedref).reason).toMatch(/references the undefined variable ghost/i);
    expect(validateworkflow(undefinedref, { inputs: ["ghost"] })).toEqual({ allowed: true });
    expect(validateworkflow({ ...compose([step("s1")]), steps: [] }).reason).toMatch(/at least one reviewed step/i);
  });

  it("carries the unicode origins and deduplicates them", () => {
    const record = composeworkflow({
      name: "n",
      version: 1,
      origins: [`${origin}/path?x=1`, `${origin}/other`, origin],
      steps: [step("s1")],
      now,
      riskof: () => "read",
    });
    expect(record.origins).toEqual([origin]);
  });
});

describe("torture: typed scope stack, bindings and expressions", () => {
  it("pushes and pops scopes with the parent chain intact", () => {
    let scopes = pushscope([{ name: "root", variables: [] }], "block1");
    scopes = pushscope(scopes, "block2", "block1");
    expect(scopes).toHaveLength(3);
    expect(scopes[2]?.parent).toBe("block1");
    expect(popscope(scopes)).toHaveLength(2);
    expect(popscope([])).toEqual([]);
    expect(popscope(popscope(popscope(scopes)))).toHaveLength(0);
  });

  it("resolves the shadowed variable from the newest scope and walks outward", () => {
    let scopes = scope([{ name: "x", kind: "string", value: "outer" }]);
    scopes = pushscope(scopes, "child", "root");
    scopes = setvariable(scopes, "x", "string", "inner", now);
    expect(resolvevariable(scopes, "x")?.value).toBe("inner");
    expect(resolvevariable(popscope(scopes), "x")?.value).toBe("outer");
    expect(resolvevariable(scopes, "ghost")).toBeUndefined();
  });

  it("writes into a fresh root scope when the stack is empty", () => {
    const scopes = setvariable([], "x", "string", "value", now);
    expect(scopes[0]?.name).toBe("root");
    expect(scopes[0]?.variables).toHaveLength(1);
  });

  it("replaces only the same named variable of the newest scope", () => {
    let scopes = pushscope(scope([{ name: "x", kind: "string", value: "outer" }]), "child", "root");
    scopes = setvariable(scopes, "x", "string", "inner", now + 1);
    scopes = setvariable(scopes, "y", "number", 2, now + 2);
    expect(scopes[1]?.variables).toHaveLength(2);
    expect(scopes[1]?.variables.find((variable) => variable.name === "x")?.value).toBe("inner");
    expect(scopes[1]?.variables.find((variable) => variable.name === "x")?.setat).toBe(now + 1);
  });

  it("binds the outcome values with the coercion rules and refuses the mismatches", () => {
    const outputs = {
      s1: {
        stepid: "s1",
        ok: true,
        summary: "rows: 12",
        details: { count: 12, flag: true, list: ["a", "b"], text: "t" },
        at: now,
      },
    };
    const bound = bindvariables(
      scope([]),
      [
        { variable: "count", kind: "number", stepid: "s1", path: "count" },
        { variable: "flag", kind: "boolean", stepid: "s1", path: "flag" },
        { variable: "list", kind: "list", stepid: "s1", path: "list" },
        { variable: "text", kind: "string", stepid: "s1", path: "text" },
        { variable: "summary", kind: "string", stepid: "s1" },
      ],
      outputs,
      now,
    );
    expect(bound.produced).toEqual(["count", "flag", "list", "text", "summary"]);
    expect(bound.scopes[0]?.variables.find((variable) => variable.name === "count")?.value).toBe(12);
    expect(bound.scopes[0]?.variables.find((variable) => variable.name === "list")?.value).toEqual(["a", "b"]);
    expect(() =>
      bindvariables(scope([]), [{ variable: "bad", kind: "number", stepid: "s1", path: "text" }], outputs, now),
    ).toThrow(/not a finite number/i);
    expect(() =>
      bindvariables(scope([]), [{ variable: "bad", kind: "boolean", stepid: "s1", path: "text" }], outputs, now),
    ).toThrow(/not a boolean/i);
    expect(() =>
      bindvariables(scope([]), [{ variable: "bad", kind: "list", stepid: "s1", path: "flag" }], outputs, now),
    ).toThrow(/not a list/i);
    expect(() =>
      bindvariables(scope([]), [{ variable: "bad", kind: "element", stepid: "s1", path: "count" }], outputs, now),
    ).toThrow(/not an element reference/i);
    expect(() =>
      bindvariables(scope([]), [{ variable: "bad", kind: "string", stepid: "s1", path: "missing.deep" }], outputs, now),
    ).toThrow(/found no value at missing.deep/i);
  });

  it("coerces the numeric strings and splits comma lists on binding", () => {
    const outputs = {
      s1: { stepid: "s1", ok: true, summary: "s", details: { numeric: "42", joined: "a,b,c" }, at: now },
    };
    const bound = bindvariables(
      scope([]),
      [
        { variable: "n", kind: "number", stepid: "s1", path: "numeric" },
        { variable: "l", kind: "list", stepid: "s1", path: "joined" },
      ],
      outputs,
      now,
    );
    expect(bound.scopes[0]?.variables.find((variable) => variable.name === "n")?.value).toBe(42);
    expect(bound.scopes[0]?.variables.find((variable) => variable.name === "l")?.value).toEqual(["a", "b", "c"]);
  });

  it("evaluates the arithmetic with the division and modulo guards", () => {
    const scopes = scope([
      { name: "a", kind: "number", value: 10 },
      { name: "b", kind: "number", value: 3 },
    ]);
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "add", result: "x", resultkind: "number" },
        scopes,
      ),
    ).toBe(13);
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "subtract", result: "x", resultkind: "number" },
        scopes,
      ),
    ).toBe(7);
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "multiply", result: "x", resultkind: "number" },
        scopes,
      ),
    ).toBe(30);
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "divide", result: "x", resultkind: "number" },
        scopes,
      ),
    ).toBeCloseTo(10 / 3);
    expect(
      expressioneval(
        { left: { ref: "a" }, right: { ref: "b" }, operator: "modulo", result: "x", resultkind: "number" },
        scopes,
      ),
    ).toBe(1);
    expect(() =>
      expressioneval(
        { left: { ref: "a" }, right: { literal: 0 }, operator: "divide", result: "x", resultkind: "number" },
        scopes,
      ),
    ).toThrow(/divides by zero/i);
    expect(() =>
      expressioneval(
        { left: { ref: "a" }, right: { literal: 0 }, operator: "modulo", result: "x", resultkind: "number" },
        scopes,
      ),
    ).toThrow(/divides by zero/i);
  });

  it("evaluates the comparisons, logic and text operators with coercion refusals", () => {
    const scopes = scope([
      { name: "s", kind: "string", value: "abc" },
      { name: "t", kind: "boolean", value: true },
      { name: "f", kind: "boolean", value: false },
      { name: "n", kind: "number", value: 5 },
    ]);
    expect(
      expressioneval(
        { left: { literal: "5" }, right: { ref: "n" }, operator: "less", result: "x", resultkind: "boolean" },
        scopes,
      ),
    ).toBe(false);
    expect(
      expressioneval(
        { left: { literal: 5 }, right: { ref: "n" }, operator: "equal", result: "x", resultkind: "boolean" },
        scopes,
      ),
    ).toBe(true);
    expect(
      expressioneval(
        { left: { literal: "5" }, right: { ref: "n" }, operator: "equal", result: "x", resultkind: "boolean" },
        scopes,
      ),
    ).toBe(false);
    expect(
      expressioneval(
        { left: { ref: "t" }, right: { ref: "f" }, operator: "and", result: "x", resultkind: "boolean" },
        scopes,
      ),
    ).toBe(false);
    expect(
      expressioneval(
        { left: { ref: "t" }, right: { ref: "f" }, operator: "or", result: "x", resultkind: "boolean" },
        scopes,
      ),
    ).toBe(true);
    expect(expressioneval({ left: { ref: "t" }, operator: "not", result: "x", resultkind: "boolean" }, scopes)).toBe(
      false,
    );
    expect(() =>
      expressioneval(
        { left: { ref: "s" }, right: { ref: "t" }, operator: "and", result: "x", resultkind: "boolean" },
        scopes,
      ),
    ).toThrow(/not a boolean/i);
    expect(
      expressioneval(
        { left: { ref: "s" }, right: { literal: "b" }, operator: "concat", result: "x", resultkind: "string" },
        scopes,
      ),
    ).toBe("abcb");
    expect(
      expressioneval(
        { left: { ref: "s" }, right: { literal: "b" }, operator: "contains", result: "x", resultkind: "boolean" },
        scopes,
      ),
    ).toBe(true);
    expect(expressioneval({ left: { ref: "s" }, operator: "length", result: "x", resultkind: "number" }, scopes)).toBe(
      3,
    );
  });

  it("refuses the list operands outside the contains and length operators", () => {
    const scopes = scope([{ name: "list", kind: "list", value: ["a", "b"] }]);
    expect(
      expressioneval(
        { left: { ref: "list" }, right: { literal: "a" }, operator: "contains", result: "x", resultkind: "boolean" },
        scopes,
      ),
    ).toBe(true);
    expect(
      expressioneval({ left: { ref: "list" }, operator: "length", result: "x", resultkind: "number" }, scopes),
    ).toBe(2);
    expect(() =>
      expressioneval(
        { left: { ref: "list" }, right: { literal: 1 }, operator: "add", result: "x", resultkind: "number" },
        scopes,
      ),
    ).toThrow(/needs the contains or length operator/i);
    expect(() =>
      expressioneval(
        { left: { ref: "ghost" }, right: { literal: 1 }, operator: "add", result: "x", resultkind: "number" },
        scopes,
      ),
    ).toThrow(/undefined variable ghost/i);
  });

  it("extracts the named groups and answers the honest no match", () => {
    const rule = { pattern: "price:\\s*(?<amount>\\d+)", flags: "", groups: ["amount"] };
    expect(regexextract(rule, "price: 42", now)).toEqual({
      matched: true,
      variables: [{ name: "amount", kind: "string", value: "42", setat: now }],
    });
    expect(regexextract(rule, "no price here", now)).toEqual({ matched: false, variables: [] });
    expect(regexextract({ pattern: "p", flags: "", groups: ["missing"] }, "p", now).variables[0]?.value).toBe("");
  });
});

describe("torture: run lifecycle, gates and the dry run projection", () => {
  it("builds the new run pending with a zero cursor and the dry run marker", () => {
    const run = newworkflowrun({ id: "r1", workflowid: "w1", now });
    expect(run).toMatchObject({ id: "r1", workflowid: "w1", state: "pending", cursor: 0, startedat: now });
    expect(run.dryrun).toBeUndefined();
    expect(newworkflowrun({ workflowid: "w1", dryrun: true, now }).dryrun).toBe(true);
    expect(newworkflowrun({ workflowid: "w1", now }).id).not.toBe(newworkflowrun({ workflowid: "w1", now }).id);
  });

  it("pauses only a running run and cancels everything but the terminal states", () => {
    const run = newworkflowrun({ id: "r1", workflowid: "w1", now });
    expect(() => pauserun(run, now)).toThrow(/only a running workflow can pause/i);
    const running = { ...run, state: "running" as const };
    expect(pauserun(running, now + 1)).toMatchObject({ state: "paused", pausedat: now + 1 });
    const cancelled = cancelrun(running, "the user stopped it", now + 2);
    expect(cancelled).toMatchObject({ state: "cancelled", cancelreason: "the user stopped it", endedat: now + 2 });
    const done = { ...run, state: "done" as const, endedat: now };
    expect(cancelrun(done, "again", now + 3)).toBe(done);
    const already = { ...run, state: "cancelled" as const };
    expect(cancelrun(already, "again", now + 3)).toBe(already);
  });

  it("refuses the run behind the session, plan and origin gates", async () => {
    const record = compose([step("s1")]);
    const run = newworkflowrun({ workflowid: record.id, now });
    await expect(
      runworkflow({
        record,
        run,
        execute,
        now,
        gates: { sessionactive: false, planapproved: true, origingranted: () => true },
      }),
    ).rejects.toThrow(/outside an approved session/i);
    await expect(
      runworkflow({
        record,
        run,
        execute,
        now,
        gates: { sessionactive: true, planapproved: false, origingranted: () => true },
      }),
    ).rejects.toThrow(/approved plan review/i);
    await expect(
      runworkflow({
        record,
        run,
        execute,
        now,
        gates: { sessionactive: true, planapproved: true, origingranted: () => false },
      }),
    ).rejects.toThrow(/falls outside the session grants/i);
  });

  it("refuses the run of a terminal state and resumes the paused run from its checkpoint", async () => {
    const record = compose([step("s1"), step("s2")]);
    for (const state of ["done", "failed", "cancelled"] as const) {
      await expect(
        runworkflow({ record, run: { ...newworkflowrun({ workflowid: record.id, now }), state }, execute, now }),
      ).rejects.toThrow(new RegExp(`already ${state}`, "i"));
    }
    const paused = {
      ...newworkflowrun({ id: "r1", workflowid: record.id, now }),
      state: "paused" as const,
      cursor: 1,
      pausedat: now,
    };
    const resumed = await runworkflow({ record, run: paused, execute, now });
    expect(resumed.run.state).toBe("done");
    expect(resumed.run.cursor).toBe(2);
    expect(resumed.log.map((entry) => entry.stepid)).toEqual(["s2"]);
  });

  it("runs the steps in order, checkpoints and fails honestly on the executor failure", async () => {
    const record = compose([step("s1"), step("s2"), step("s3")]);
    const failing = async (one: workflowstep): Promise<{ ok: boolean; summary: string }> =>
      one.id === "s2" ? { ok: false, summary: "the wait timed out" } : { ok: true, summary: `done ${one.id}` };
    const failed = await runworkflow({
      record,
      run: newworkflowrun({ workflowid: record.id, now }),
      execute: failing,
      now,
    });
    expect(failed.run.state).toBe("failed");
    expect(failed.run.failreason).toBe("the wait timed out");
    expect(failed.run.cursor).toBe(1);
    expect(failed.outputs.s1?.ok).toBe(true);
    let checkpoints = 0;
    await runworkflow({
      record,
      run: newworkflowrun({ workflowid: record.id, now }),
      execute,
      now,
      oncheckpoint: () => {
        checkpoints += 1;
      },
    });
    expect(checkpoints).toBe(3);
  });

  it("interpolates the step fields from the scopes and records the consumed names", async () => {
    const record = compose([workflowstepof({ id: "s1", kind: "wait", label: "l", value: "the ${name} wait" })!]);
    const executed = await runstep({
      step: record.steps[0]!,
      scopes: scope([{ name: "name", kind: "string", value: "reviewed" }]),
      outputs: {},
      execute,
      now,
    });
    expect(executed.output.summary).toBe("done s1");
    expect(executed.log.consumed).toEqual(["name"]);
    await expect(
      runstep({ step: record.steps[0]!, scopes: scope([]), outputs: {}, execute, now }),
    ).resolves.toMatchObject({ output: { ok: false } });
  });

  it("answers the dry run with the read only projection and the refusal entries", () => {
    const record = compose([step("s1"), { ...step("s2"), kind: "navigate" as never }]);
    const projected = dryrunworkflow({
      record,
      run: newworkflowrun({ workflowid: record.id, dryrun: true, now }),
      now,
      projection: (one) => (one.kind === "wait" ? `would wait ${one.value}` : undefined),
    });
    expect(projected.run.state).toBe("done");
    expect(projected.run.dryrun).toBe(true);
    expect(projected.run.cursor).toBe(2);
    expect(projected.log[0]?.state).toBe("done");
    expect(projected.log[1]?.state).toBe("refused");
    expect(projected.log[1]?.summary).toMatch(/no read only projection/i);
    expect(resolvevariable(projected.scopes, "s1outcome")?.value).toBe(true);
    expect(resolvevariable(projected.scopes, "s2outcome")?.value).toBe(false);
  });

  it("reads the element wait plan and the seeded delay jitter windows", () => {
    expect(waitelementplan({ timeout: 0, poll: 100 })).toEqual({ probes: 1, lastwait: 0 });
    expect(waitelementplan({ timeout: 100, poll: 0 })).toEqual({ probes: 1, lastwait: 0 });
    expect(waitelementplan({ timeout: 1050, poll: 100 })).toEqual({ probes: 11, lastwait: 50 });
    expect(delayjitter({ base: 100, jitter: 0 } as never, 1)).toBe(100);
    expect(delayjitter({ base: 0, jitter: 0 } as never, 1)).toBe(0);
    expect(delayjitter({ base: 100, jitter: 100 } as never, 7)).toBeGreaterThanOrEqual(50);
    expect(delayjitter({ base: 100, jitter: 100 } as never, 7)).toBeLessThanOrEqual(150);
    expect(delayjitter({ base: 5, jitter: 100 } as never, 3)).toBeGreaterThanOrEqual(0);
  });

  it("keeps the seeded random deterministic and inside the unit interval", () => {
    expect(seededrandom(42)).toBe(seededrandom(42));
    expect(seededrandom(0)).not.toBe(seededrandom(1));
    for (const seed of [0, 1, 42, 999, Number.MAX_SAFE_INTEGER]) {
      const value = seededrandom(seed);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("grades the watchdog verdicts at the stall and zombie boundaries", () => {
    const runs = [
      { ...newworkflowrun({ id: "r1", workflowid: "w", now: now - 5000 }), state: "running" as const, cursor: 1 },
      { ...newworkflowrun({ id: "r2", workflowid: "w", now: now - 5000 }), state: "running" as const, cursor: 0 },
      { ...newworkflowrun({ id: "r3", workflowid: "w", now: now - 5000 }), state: "done" as const },
    ];
    const verdicts = watchdogpass({
      runs,
      lastcompletedat: { r1: now - 500, r2: now - 1000 },
      liveexecutors: ["r1"],
      config: { enabled: true, stallthreshold: 500, zombiewindow: 1000, action: "pause" as never },
      now,
    });
    expect(verdicts).toHaveLength(2);
    expect(verdicts[0]).toMatchObject({ runid: "r1", verdict: "stalled", action: "pause" });
    expect(verdicts[0]?.reason).toMatch(/recovers it with pause/i);
    expect(verdicts[1]).toMatchObject({ runid: "r2", verdict: "zombie", action: "reap" });
    const healthy = watchdogpass({
      runs: [runs[0]!],
      lastcompletedat: { r1: now - 100 },
      liveexecutors: ["r1"],
      config: { enabled: true, stallthreshold: 500, zombiewindow: 1000, action: "pause" as never },
      now,
    });
    expect(healthy[0]?.verdict).toBe("healthy");
  });
});

describe("torture: control flow payloads, bounds and runners", () => {
  it("normalizes the control payloads and refuses the malformed twins", () => {
    expect(
      conditionof({ expression: { left: { ref: "ready" }, operator: "not", result: "stop", resultkind: "boolean" } }),
    ).toBeDefined();
    expect(
      conditionof({ expression: { left: { ref: "ready" }, operator: "add", result: "sum", resultkind: "number" } }),
    ).toBeUndefined();
    expect(loopof({ list: "items", item: "it", index: "ix", steps: [step("c1")] })).toBeDefined();
    expect(loopof({ list: "items", item: "items", index: "ix", steps: [step("c1")] })).toBeUndefined();
    expect(loopof({ list: "items", item: "it", index: "it", steps: [step("c1")] })).toBeUndefined();
    expect(loopof({ list: "items", item: "it", index: "ix", steps: [] })).toBeUndefined();
    expect(loopof({ list: "items", item: "it", index: "ix", bound: 0, steps: [step("c1")] })).toBeUndefined();
    expect(loopof({ list: "items", item: "it", index: "ix", bound: 1.5, steps: [step("c1")] })).toBeUndefined();
    expect(loopof({ list: "items", item: "it", index: "ix", bound: 3, steps: [step("c1")] })).toMatchObject({
      bound: 3,
    });
    expect(
      whileof({
        while: { left: { ref: "ready" }, operator: "not", result: "stop", resultkind: "boolean" },
        steps: [step("c1")],
      }),
    ).toBeUndefined();
    expect(
      whileof({
        while: { left: { ref: "ready" }, operator: "not", result: "stop", resultkind: "boolean" },
        bound: 2,
        steps: [step("c1")],
      }),
    ).toMatchObject({ bound: 2 });
    expect(
      whileof({
        while: { left: { ref: "ready" }, operator: "not", result: "stop", resultkind: "boolean" },
        bound: 0,
        steps: [step("c1")],
      }),
    ).toBeUndefined();
    expect(
      repeatuntilof({
        until: { left: { ref: "ready" }, operator: "not", result: "stop", resultkind: "boolean" },
        steps: [step("c1")],
      }),
    ).toBeDefined();
    expect(foreachof({ selector: "  ", item: "it", index: "ix", steps: [step("c1")] })).toBeUndefined();
    expect(foreachof({ selector: ".row", item: "it", index: "it", steps: [step("c1")] })).toBeUndefined();
    expect(
      parallelof({ branches: [{ id: "b1", steps: [step("c1")] }], join: { strategy: "first", onfail: "cancel" } }),
    ).toBeDefined();
    expect(
      parallelof({
        branches: [
          { id: "b1", steps: [step("c1")] },
          { id: "b1", steps: [step("c2")] },
        ],
        join: { strategy: "first", onfail: "cancel" },
      }),
    ).toBeUndefined();
    expect(
      parallelof({ branches: [{ id: "b1", steps: [step("c1")] }], join: { strategy: "never", onfail: "cancel" } }),
    ).toBeUndefined();
    expect(
      parallelof({ branches: [{ id: "b1", steps: [step("c1")] }], join: { strategy: "first", onfail: "ignore" } }),
    ).toBeUndefined();
    expect(tryof({ steps: [step("c1")], catch: { steps: [step("h1")] } })).toBeDefined();
    expect(tryof({ steps: [step("c1")], catch: { steps: [] } })).toBeUndefined();
    expect(tryof({ steps: [], catch: { steps: [step("h1")] } })).toBeUndefined();
    expect(tryof({ steps: [step("c1")], catch: { steps: [step("h1")], rerun: "yes" } })).toBeUndefined();
  });

  it("validates the control payload of every kind with the kind specific error", () => {
    expect(() => validatecontrolpayload(controlstep("c1", "condition", {}))).toThrow(
      /needs a reviewed boolean expression/i,
    );
    expect(() => validatecontrolpayload(controlstep("c1", "branch", {}))).toThrow(/unique paths/i);
    expect(() => validatecontrolpayload(controlstep("c1", "loop", {}))).toThrow(/list variable/i);
    expect(() => validatecontrolpayload(controlstep("c1", "repeatuntil", {}))).toThrow(/convergence expression/i);
    expect(() => validatecontrolpayload(controlstep("c1", "whileloop", {}))).toThrow(
      /mandatory positive safety bound/i,
    );
    expect(() => validatecontrolpayload(controlstep("c1", "foreach", {}))).toThrow(/non-empty selector/i);
    expect(() => validatecontrolpayload(controlstep("c1", "parallel", {}))).toThrow(/join policy/i);
    expect(() => validatecontrolpayload(controlstep("c1", "trycatch", {}))).toThrow(/catch handler/i);
    expect(() =>
      validatecontrolpayload(workflowstepof({ id: "c1", kind: "wait", label: "l", options: "{bad json" })!),
    ).not.toThrow();
    expect(() =>
      validatecontrolpayload(workflowstepof({ id: "c1", kind: "loop", label: "l", options: "{bad json" })!),
    ).toThrow(/JSON object/i);
  });

  it("collects the child steps recursively and summarizes the constructs for review", () => {
    const nested = controlstep("l1", "loop", {
      loop: {
        list: "items",
        item: "it",
        index: "ix",
        steps: [
          controlstep("l2", "foreach", { foreach: { selector: ".row", item: "e", index: "i", steps: [step("c1")] } }),
        ],
      },
    });
    expect(controlsteps(nested).map((child) => child.id)).toEqual(["l2", "c1"]);
    expect(controlsteps(step("s1"))).toEqual([]);
    expect(
      controlsteps(controlstep("c1", "loop", { loop: { list: "items", item: "it", index: "ix", steps: [step("x")] } })),
    ).toHaveLength(1);
    const summary = controlsummary(nested);
    expect(summary).toMatchObject({ kind: "loop", list: "items", item: "it", index: "ix" });
    expect(
      controlsummary(
        controlstep("r1", "repeatuntil", {
          repeatuntil: {
            until: { left: { ref: "ready" }, operator: "not", result: "stop", resultkind: "boolean" },
            steps: [step("c1")],
          },
        }),
      ),
    ).toMatchObject({ kind: "repeatuntil", bound: defaultloopbound });
    expect(
      controlsummary(
        controlstep("w1", "whileloop", {
          while: {
            while: { left: { ref: "ready" }, operator: "not", result: "stop", resultkind: "boolean" },
            bound: 7,
            steps: [step("c1")],
          },
        }),
      ),
    ).toMatchObject({ kind: "whileloop", bound: 7 });
    expect(
      controlsummary(
        controlstep("b1", "branch", {
          branch: { paths: [{ name: "one", steps: [step("c1")] }], else: { name: "other", steps: [] } },
        }),
      ),
    ).toMatchObject({ kind: "branch", paths: ["one"], elsepath: "other" });
    expect(controlsummary(step("s1"))).toBeUndefined();
    expect(
      controlsummary(controlstep("c1", "loop", { loop: { list: "l", item: "i", index: "x", steps: [step("c1")] } })),
    ).toMatchObject({ bound: defaultloopbound });
  });

  it("evaluates the conditions and refuses the non boolean result", () => {
    const scopes = scope([{ name: "flag", kind: "boolean", value: true }]);
    expect(
      evaluatecondition(
        { expression: { left: { ref: "flag" }, operator: "not", result: "x", resultkind: "boolean" } },
        scopes,
      ),
    ).toBe(false);
    expect(() =>
      evaluatecondition(
        {
          expression: {
            left: { literal: 1 },
            right: { literal: 1 },
            operator: "add",
            result: "x",
            resultkind: "number",
          },
        },
        scopes,
      ),
    ).toThrow(/must resolve to a boolean/i);
  });

  it("chooses the branch path by page state with the unconditional and else fallbacks", () => {
    const readywhen: expressiontype = {
      left: { ref: "pageready" },
      right: { literal: true },
      operator: "equal",
      result: "x",
      resultkind: "boolean",
    };
    const branch: branchstep = {
      paths: [
        { name: "ready", when: readywhen, steps: [step("r1")] },
        { name: "always", steps: [step("a1")] },
      ],
      else: { name: "fallback", steps: [step("e1")] },
    };
    const scopes = scope([]);
    const ready = choosebranch({ stepid: "b1", branch, scopes, pagestate: { ready: true }, now });
    expect(ready.outcome.path).toBe("ready");
    const fallback = choosebranch({ stepid: "b1", branch, scopes: scope([]), pagestate: { ready: false }, now });
    expect(fallback.outcome.path).toBe("always");
    const unconditional = choosebranch({ stepid: "b1", branch, scopes: scope([]), pagestate: { ready: false }, now });
    expect(unconditional.outcome.path).toBe("always");
    const negated: branchstep = {
      paths: [
        {
          name: "ready",
          when: { left: { ref: "pageready" }, operator: "not", result: "x", resultkind: "boolean" },
          steps: [step("r1")],
        },
      ],
      else: branch.else,
    };
    const elsepath = choosebranch({
      stepid: "b1",
      branch: negated,
      scopes: scope([]),
      pagestate: { ready: true },
      now,
    });
    expect(elsepath.outcome.path).toBe("fallback");
    expect(elsepath.outcome.reason).toMatch(/else path ran/i);
  });

  it("runs the loop inside the bound and refuses the list that exceeds it", async () => {
    const loop: loopstep = { list: "items", item: "it", index: "ix", bound: 2, steps: [step("c1")] };
    const within = await runloop({
      step: controlstep("l1", "loop", { loop }),
      loop,
      scopes: scope([{ name: "items", kind: "list", value: ["a", "b"] }]),
      outputs: {},
      execute,
      now,
    });
    expect(within.ok).toBe(true);
    expect(within.summary).toMatch(/ran 2 iterations/i);
    const overflow = await runloop({
      step: controlstep("l1", "loop", { loop }),
      loop,
      scopes: scope([{ name: "items", kind: "list", value: ["a", "b", "c"] }]),
      outputs: {},
      execute,
      now,
    });
    expect(overflow.ok).toBe(false);
    expect(overflow.summary).toMatch(/exceeds the reviewed safety bound of 2/i);
    await expect(
      runloop({ step: controlstep("l1", "loop", { loop }), loop, scopes: scope([]), outputs: {}, execute, now }),
    ).rejects.toThrow(/undefined list variable items/i);
    await expect(
      runloop({
        step: controlstep("l1", "loop", { loop }),
        loop,
        scopes: scope([{ name: "items", kind: "string", value: "a" }]),
        outputs: {},
        execute,
        now,
      }),
    ).rejects.toThrow(/not a list/i);
    const emptyloop: loopstep = { ...loop, bound: 0 };
    const empty = await runloop({
      step: controlstep("l1", "loop", { loop: emptyloop }),
      loop: emptyloop,
      scopes: scope([{ name: "items", kind: "list", value: [] }]),
      outputs: {},
      execute,
      now,
    });
    expect(empty.ok).toBe(true);
    expect(empty.summary).toMatch(/ran 0 iterations/i);
  });

  it("runs the loop body per iteration and rebinds the item and index", async () => {
    const seen: string[] = [];
    const loop: loopstep = { list: "items", item: "it", index: "ix", steps: [{ ...step("c1") }] };
    const runner = async (
      one: workflowstep,
      context: { scopes: variablescope[] },
    ): Promise<{ ok: boolean; summary: string }> => {
      const item = resolvevariable(context.scopes, "it")?.value;
      const index = resolvevariable(context.scopes, "ix")?.value;
      seen.push(`${one.id}:${String(item)}:${String(index)}`);
      return { ok: true, summary: "done" };
    };
    const result = await runloop({
      step: controlstep("l1", "loop", { loop }),
      loop,
      scopes: scope([{ name: "items", kind: "list", value: ["a", "b"] }]),
      outputs: {},
      execute: runner,
      now,
    });
    expect(result.ok).toBe(true);
    expect(seen).toEqual(["c1:a:0", "c1:b:1"]);
  });

  it("runs the repeat until convergence and refuses the endless block", async () => {
    const until: expressiontype = {
      left: { ref: "done" },
      right: { literal: true },
      operator: "equal",
      result: "x",
      resultkind: "boolean",
    };
    let scopes = scope([{ name: "done", kind: "boolean", value: false }]);
    const converging = async (
      one: workflowstep,
      context: { scopes: variablescope[] },
    ): Promise<{ ok: boolean; summary: string; scopes?: variablescope[] }> => {
      if (one.id === "c1")
        return { ok: true, summary: "flips", scopes: setvariable(context.scopes, "done", "boolean", true, now) };
      return { ok: true, summary: "done" };
    };
    const converged = await runrepeatuntil({
      step: controlstep("r1", "repeatuntil", { repeatuntil: { until, bound: 3, steps: [step("c1")] } }),
      repeat: { until, bound: 3, steps: [step("c1")] },
      scopes,
      outputs: {},
      execute: converging,
      now,
    });
    expect(converged.ok).toBe(true);
    expect(converged.summary).toMatch(/converged after 1 iteration/i);
    const endless = await runrepeatuntil({
      step: controlstep("r2", "repeatuntil", { repeatuntil: { until, bound: 2, steps: [step("c2")] } }),
      repeat: { until, bound: 2, steps: [step("c2")] },
      scopes,
      outputs: {},
      execute,
      now,
    });
    expect(endless.ok).toBe(false);
    expect(endless.summary).toMatch(/never converged within the reviewed safety bound of 2/i);
  });

  it("runs the while loop until the condition stops and reports the overflow", async () => {
    const condition = {
      while: { left: { ref: "count" }, right: { literal: 2 }, operator: "less", result: "x", resultkind: "boolean" },
      bound: 5,
      steps: [{ ...step("c1") }],
    } as whilestep;
    let scopes = scope([{ name: "count", kind: "number", value: 0 }]);
    const counting = async (
      one: workflowstep,
      context: { scopes: variablescope[] },
    ): Promise<{ ok: boolean; summary: string; scopes?: variablescope[] }> => {
      if (one.id === "c1") {
        const current = resolvevariable(context.scopes, "count")?.value;
        scopes = setvariable(context.scopes, "count", "number", (typeof current === "number" ? current : 0) + 1, now);
        return { ok: true, summary: "counts", scopes };
      }
      return { ok: true, summary: "done" };
    };
    const ended = await runwhile({
      step: controlstep("w1", "whileloop", { while: condition }),
      condition,
      scopes: scope([{ name: "count", kind: "number", value: 0 }]),
      outputs: {},
      execute: counting,
      now,
    });
    expect(ended.ok).toBe(true);
    expect(ended.summary).toMatch(/ended after 2 iterations/i);
    const overflowing = await runwhile({
      step: controlstep("w2", "whileloop", { while: { ...condition, bound: 1 } }),
      condition: { ...condition, bound: 1 },
      scopes: scope([{ name: "count", kind: "number", value: 0 }]),
      outputs: {},
      execute: counting,
      now,
    });
    expect(overflowing.ok).toBe(false);
    expect(overflowing.summary).toMatch(
      /hit its reviewed safety bound of 1 iterations while its condition still held/i,
    );
    const never = await runwhile({
      step: controlstep("w3", "whileloop", { while: condition }),
      condition,
      scopes: scope([{ name: "count", kind: "number", value: 10 }]),
      outputs: {},
      execute,
      now,
    });
    expect(never.ok).toBe(true);
    expect(never.summary).toMatch(/ended after 0 iterations/i);
  });

  it("runs the foreach over the resolved elements with the honest zero match", async () => {
    const foreach: foreachstep = { selector: ".row", item: "e", index: "i", steps: [step("c1")] };
    const resolved = await runforeach({
      step: controlstep("f1", "foreach", { foreach }),
      foreach,
      scopes: scope([]),
      outputs: {},
      execute,
      now,
      resolveelements: async () => ["r1", "r2", "r3"],
    });
    expect(resolved.ok).toBe(true);
    expect(resolved.summary).toMatch(/ran 3 iterations/i);
    const empty = await runforeach({
      step: controlstep("f2", "foreach", { foreach }),
      foreach,
      scopes: scope([]),
      outputs: {},
      execute,
      now,
      resolveelements: async () => [],
    });
    expect(empty.ok).toBe(true);
    expect(empty.summary).toMatch(/matched no element and the foreach ran zero iterations/i);
    await expect(
      runforeach({
        step: controlstep("f3", "foreach", { foreach }),
        foreach,
        scopes: scope([]),
        outputs: {},
        execute,
        now,
      }),
    ).rejects.toThrow(/needs the element resolver/i);
  });

  it("merges the parallel writes under the first, last and fail strategies", () => {
    const branches: Array<{ id: string; order: number; ok: boolean; cancelled: boolean; variables: variablevalue[] }> =
      [
        {
          id: "b1",
          order: 0,
          ok: true,
          cancelled: false,
          variables: [{ name: "rows", kind: "number", value: 12, setat: now }],
        },
        {
          id: "b2",
          order: 1,
          ok: true,
          cancelled: false,
          variables: [
            { name: "rows", kind: "number", value: 14, setat: now },
            { name: "solo", kind: "string", value: "only", setat: now },
          ],
        },
        {
          id: "b3",
          order: 2,
          ok: false,
          cancelled: true,
          variables: [{ name: "rows", kind: "number", value: 99, setat: now }],
        },
      ];
    const first = joinbranches({ stepid: "p1", branches, strategy: "first", now });
    expect(first.ok).toBe(true);
    expect(first.conflicts).toEqual(["rows"]);
    expect(first.merged.find((variable) => variable.name === "rows")?.value).toBe(12);
    expect(first.merged.find((variable) => variable.name === "solo")?.value).toBe("only");
    const last = joinbranches({ stepid: "p1", branches, strategy: "last", now });
    expect(last.merged.find((variable) => variable.name === "rows")?.value).toBe(14);
    const failed = joinbranches({ stepid: "p1", branches, strategy: "fail", now });
    expect(failed.ok).toBe(false);
    expect(failed.summary).toMatch(/refused the conflicting writes of rows/i);
    const clean = joinbranches({ stepid: "p1", branches: branches.slice(0, 1), strategy: "fail", now });
    expect(clean.ok).toBe(true);
    expect(clean.conflicts).toEqual([]);
  });

  it("runs the parallel block with the join and the cancel on fail policy", async () => {
    const parallel: parallelstep = {
      branches: [
        { id: "ok", steps: [step("c1")] },
        { id: "bad", steps: [step("c2")] },
      ],
      join: { strategy: "first", onfail: "cancel" },
    };
    const failing = async (one: workflowstep): Promise<{ ok: boolean; summary: string }> =>
      one.id === "c2" ? { ok: false, summary: "the branch failed" } : { ok: true, summary: "done" };
    const cancelled = await runparallel({
      step: controlstep("p1", "parallel", { parallel }),
      parallel,
      scopes: scope([]),
      outputs: {},
      execute: failing,
      now,
    });
    expect(cancelled.ok).toBe(false);
    expect(cancelled.summary).toMatch(/failed on branch bad/i);
    const continuingparallel: parallelstep = { ...parallel, join: { strategy: "first", onfail: "continue" } };
    const continuing = await runparallel({
      step: controlstep("p2", "parallel", { parallel: continuingparallel }),
      parallel: continuingparallel,
      scopes: scope([]),
      outputs: {},
      execute: failing,
      now,
    });
    expect(continuing.ok).toBe(true);
    expect(continuing.summary).toMatch(/ran 2 concurrent branches/i);
  });

  it("computes the retry backoff under the fixed and exponential shapes", () => {
    const fixed: retrypolicy = {
      attempts: 3,
      backoff: { shape: "fixed", base: 100, jitter: 0 },
      retryable: ["timeout"],
    };
    expect(backoffdelay(fixed, 1, 1)).toBe(100);
    expect(backoffdelay(fixed, 3, 1)).toBe(100);
    const exponential: retrypolicy = {
      attempts: 3,
      backoff: { shape: "exponential", base: 100, jitter: 0 },
      retryable: ["timeout"],
    };
    expect(backoffdelay(exponential, 1, 1)).toBe(100);
    expect(backoffdelay(exponential, 2, 1)).toBe(200);
    expect(backoffdelay(exponential, 3, 1)).toBe(400);
    const jittered: retrypolicy = {
      attempts: 3,
      backoff: { shape: "fixed", base: 100, jitter: 50 },
      retryable: ["timeout"],
    };
    expect(backoffdelay(jittered, 1, 7)).toBeGreaterThanOrEqual(75);
    expect(backoffdelay(jittered, 1, 7)).toBeLessThanOrEqual(125);
  });

  it("retries only the reviewed error classes and reports the exhaustion", async () => {
    const policy: retrypolicy = {
      attempts: 3,
      backoff: { shape: "fixed", base: 0, jitter: 0 },
      retryable: ["timeout"],
    };
    let calls = 0;
    const retried = await applyretry({
      stepid: "s1",
      policy,
      run: async () => {
        calls += 1;
        return calls < 3 ? { ok: false } : { ok: true };
      },
      errorclass: () => "timeout",
      now,
    });
    expect(retried.value.ok).toBe(true);
    expect(retried.attempts).toHaveLength(2);
    expect(retried.exhausted).toBe(false);
    let nonretryable = 0;
    const refused = await applyretry({
      stepid: "s1",
      policy,
      run: async () => {
        nonretryable += 1;
        return { ok: false };
      },
      errorclass: () => "consent",
      now,
    });
    expect(nonretryable).toBe(1);
    expect(refused.exhausted).toBe(false);
    let exhausted = 0;
    const drained = await applyretry({
      stepid: "s1",
      policy,
      run: async () => {
        exhausted += 1;
        return { ok: false };
      },
      errorclass: () => "timeout",
      now,
    });
    expect(exhausted).toBe(3);
    expect(drained.exhausted).toBe(true);
  });

  it("aborts the step and the run against their reviewed budgets", async () => {
    const slow = () => new Promise<{ ok: boolean }>((resolve) => setTimeout(() => resolve({ ok: true }), 80));
    const aborted = await applytimeout({ stepid: "s1", budgetms: 5, run: slow });
    expect(aborted.aborted).toBe(true);
    expect(aborted.output?.details).toMatchObject({ errorclass: "timeout", cancelled: true });
    expect(aborted.abort).toMatchObject({ stepid: "s1", budget: 5, scope: "step" });
    const finished = await applytimeout({ stepid: "s1", budgetms: 1_000, run: async () => ({ ok: true }) });
    expect(finished.aborted).toBe(false);
    const runaborted = await applyruntimeout({ budgetms: 5, run: slow });
    expect(runaborted.cancelled).toBe(true);
    if (!runaborted.cancelled || runaborted.error === undefined)
      throw new Error("The run budget abort carries its cancellation error.");
    expect(runaborted.error).toBeInstanceOf(cancellederror);
    expect(runaborted.error.message).toMatch(/exceeded its reviewed budget of 5 milliseconds/i);
    const runfinished = await applyruntimeout({ budgetms: 1_000, run: async () => "value" });
    expect(runfinished).toEqual({ cancelled: false, value: "value" });
  });

  it("runs the try block through the catch handler and the rerun option", async () => {
    const failing = async (
      one: workflowstep,
    ): Promise<{ ok: boolean; summary: string; details?: Record<string, unknown> }> =>
      one.id === "c1"
        ? { ok: false, summary: "the fragile step failed", details: { errorclass: "page" } }
        : { ok: true, summary: `done ${one.id}` };
    const handledfragile = { steps: [step("c1")], catch: { steps: [step("h1")] } };
    const handled = await runtry({
      step: controlstep("t1", "trycatch", { try: handledfragile }),
      fragile: handledfragile,
      scopes: scope([]),
      outputs: {},
      execute: failing,
      now,
    });
    expect(handled.ok).toBe(true);
    expect(handled.summary).toMatch(/catch handler ran 1 step after the page failure/i);
    let c1runs = 0;
    const rerunfragile = { steps: [step("c1")], catch: { steps: [step("h1")], rerun: true } };
    const rerun = await runtry({
      step: controlstep("t2", "trycatch", { try: rerunfragile }),
      fragile: rerunfragile,
      scopes: scope([]),
      outputs: {},
      execute: async (one: workflowstep) => {
        if (one.id === "c1") {
          c1runs += 1;
          return c1runs < 2 ? { ok: false, summary: "fails once" } : { ok: true, summary: "recovers" };
        }
        return { ok: true, summary: `done ${one.id}` };
      },
      now,
    });
    expect(rerun.ok).toBe(true);
    const failingfragile = { steps: [step("c1")], catch: { steps: [step("h1")] } };
    const failinghandler = await runtry({
      step: controlstep("t3", "trycatch", { try: failingfragile }),
      fragile: failingfragile,
      scopes: scope([]),
      outputs: {},
      execute: async () => ({ ok: false, summary: "always fails" }),
      now,
    });
    expect(failinghandler.ok).toBe(false);
    expect(failinghandler.summary).toMatch(/catch handler of the try block failed/i);
  });

  it("dispatches the control step through runcontrolstep with the merged scopes and log", async () => {
    const dispatched = await runcontrolstep({
      step: controlstep("c1", "condition", {
        condition: { expression: { left: { literal: true }, operator: "not", result: "flag", resultkind: "boolean" } },
      }),
      scopes: scope([]),
      outputs: {},
      execute,
      now,
    });
    expect(dispatched.output.ok).toBe(true);
    expect(dispatched.output.summary).toMatch(/flag does not hold/i);
    expect(resolvevariable(dispatched.scopes, "flag")?.value).toBe(false);
    const malformed = workflowstepof({ id: "c1", kind: "loop", label: "l", options: "{}" })!;
    await expect(runcontrolstep({ step: malformed, scopes: scope([]), outputs: {}, execute, now })).rejects.toThrow(
      /loop step needs a reviewed list variable/i,
    );
    const passthrough = controlstep("p1", "parallel", {
      parallel: { branches: [{ id: "b1", steps: [step("c1")] }], join: { strategy: "first", onfail: "cancel" } },
    });
    expect(iscontrolflowkind("parallel")).toBe(true);
    expect(iscontrolflowkind("click")).toBe(false);
    expect(controlflowkinds).toHaveLength(8);
    expect(workflowkinds).toContain("composeworkflow");
  });
});

describe("torture: trigger payloads, cron grammar and cooldowns", () => {
  it("maps the trigger kinds to their families and refuses the unknown", () => {
    expect(triggerkinds).toHaveLength(10);
    expect(triggerfamilies).toHaveLength(10);
    expect(istriggerkind("cronrule")).toBe(true);
    expect(istriggerkind("cron")).toBe(false);
    expect(triggerfamilyof("visitrule")).toBe("visit");
    expect(triggerfamilyof("webhookrule")).toBe("webhook");
    expect(triggerfamilyof("nope")).toBeUndefined();
  });

  it("normalizes every family payload and refuses the malformed twins", () => {
    expect(triggerpayloadof("visit", { origins: [origin] })).toEqual({ origins: [origin] });
    expect(triggerpayloadof("visit", { origins: [] })).toBeUndefined();
    expect(triggerpayloadof("visit", { origins: ["http://insecure.example"] })).toBeUndefined();
    expect(triggerpayloadof("visit", { origins: [origin, origin] })).toEqual({ origins: [origin] });
    expect(triggerpayloadof("url", { pattern: `${origin}/pricing*` })).toEqual({ pattern: `${origin}/pricing*` });
    expect(triggerpayloadof("url", { pattern: "notaurl" })).toBeUndefined();
    expect(triggerpayloadof("menu", { title: "Run the pricing extraction" })).toEqual({
      title: "Run the pricing extraction",
    });
    expect(triggerpayloadof("menu", { title: " " })).toBeUndefined();
    expect(triggerpayloadof("key", { command: "run-pricing" })).toEqual({ command: "run-pricing" });
    expect(triggerpayloadof("key", { command: "Run Pricing" })).toBeUndefined();
    expect(triggerpayloadof("key", { command: "run", key: " " })).toBeUndefined();
    expect(triggerpayloadof("button", {})).toEqual({});
    expect(triggerpayloadof("cron", { cron: "*/5 * * * *" })).toEqual({ cron: "*/5 * * * *" });
    expect(triggerpayloadof("cron", { cron: "99 * * * *" })).toBeUndefined();
    expect(triggerpayloadof("cron", { cron: "* * * * *", timezone: "Not/AZone" })).toBeUndefined();
    expect(triggerpayloadof("interval", { period: 1000 })).toEqual({ period: 1000 });
    expect(triggerpayloadof("interval", { period: 0 })).toBeUndefined();
    expect(triggerpayloadof("interval", { period: -1 })).toBeUndefined();
    expect(triggerpayloadof("interval", { period: 1000, jitter: -1 })).toBeUndefined();
    expect(triggerpayloadof("urllist", { urls: [origin] })).toEqual({ urls: [origin] });
    expect(triggerpayloadof("urllist", { urls: [] })).toBeUndefined();
    expect(triggerpayloadof("urllist", { urls: ["nope"] })).toBeUndefined();
    const secret = "abcdefgh12345678abcdefgh12345678";
    expect(triggerpayloadof("webhook", { secret, schema: [{ name: "rows", kind: "number", required: true }] })).toEqual(
      { secret, schema: [{ name: "rows", kind: "number", required: true }] },
    );
    expect(
      triggerpayloadof("webhook", { secret: "short", schema: [{ name: "rows", kind: "number" }] }),
    ).toBeUndefined();
    expect(
      triggerpayloadof("webhook", {
        secret,
        schema: [
          { name: "rows", kind: "number" },
          { name: "rows", kind: "string" },
        ],
      }),
    ).toBeUndefined();
    expect(triggerpayloadof("event", { events: ["mutate", "focus"] })).toEqual({ events: ["mutate", "focus"] });
    expect(triggerpayloadof("event", { events: ["mutate", "mutate"] })).toEqual({ events: ["mutate"] });
    expect(triggerpayloadof("event", { events: ["unknown"] })).toBeUndefined();
    expect(triggerpayloadof("event", { events: [] })).toBeUndefined();
  });

  it("checks the webhook secret entropy floor and the timezone names", () => {
    expect(webhooksecretok("abcdefgh12345678abcdefgh12345678")).toBe(true);
    expect(webhooksecretok("short")).toBe(false);
    expect(webhooksecretok("aaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toBe(false);
    expect(webhooksecretok("abcdefghijklmnopqrstuvwx")).toBe(false);
    expect(webhooksecretok("123456789012345678901234")).toBe(false);
    expect(timezonevalid("UTC")).toBe(true);
    expect(timezonevalid("America/Sao_Paulo")).toBe(true);
    expect(timezonevalid("Mars/Olympus")).toBe(false);
  });

  it("arms the rules with the reviewed payloads and the default cooldowns", () => {
    const rule = armrule({ family: "cron", workflowid: "w1", payload: { cron: "*/5 * * * *" }, now });
    expect(rule).toMatchObject({
      kind: "cron",
      workflowid: "w1",
      cron: "*/5 * * * *",
      cooldown: 0,
      state: { enabled: true },
      stats: { fires: 0, launches: 0, suppressions: 0 },
      createdat: now,
    });
    expect(rule?.label).toBe("The cron rule of w1");
    const webhook = armrule({
      family: "webhook",
      workflowid: "w1",
      payload: { secret: "abcdefgh12345678abcdefgh12345678", schema: [{ name: "rows", kind: "number" }] },
      now,
    });
    expect(webhook?.cooldown).toBe(defaulttriggercooldown);
    expect(armrule({ family: "event", workflowid: "w1", payload: { events: ["mutate"] }, now })?.cooldown).toBe(
      defaulttriggercooldown,
    );
    expect(armrule({ family: "cron", workflowid: " ", payload: { cron: "* * * * *" }, now })).toBeUndefined();
    expect(armrule({ family: "cron", workflowid: "w1", payload: { cron: "bad" }, now })).toBeUndefined();
    expect(
      armrule({ family: "cron", workflowid: "w1", payload: { cron: "* * * * *" }, cooldown: 0, now }),
    ).toBeUndefined();
    expect(
      armrule({ family: "cron", workflowid: "w1", payload: { cron: "* * * * *" }, cooldown: -1, now }),
    ).toBeUndefined();
    expect(
      armrule({
        family: "cron",
        workflowid: "w1",
        payload: { cron: "* * * * *" },
        cooldown: 5,
        label: "  every minute  ",
        now,
      })?.label,
    ).toBe("  every minute  ");
  });

  it("updates the rule state and stats immutably", () => {
    const rule = armrule({ family: "cron", workflowid: "w1", payload: { cron: "* * * * *" }, now })!;
    const updated = updaterule(rule, { state: { lastfireat: now + 1, nextfireat: now + 2 }, stats: { fires: 1 } });
    expect(updated.state.lastfireat).toBe(now + 1);
    expect(updated.state.nextfireat).toBe(now + 2);
    expect(updated.stats.fires).toBe(1);
    expect(rule.state.lastfireat).toBeUndefined();
    expect(rule.stats.fires).toBe(0);
  });

  it("matches the glob url patterns with schemes, hosts, ports and stars", () => {
    expect(matchurl(`${origin}/pricing`, `${origin}/pricing`)).toBe(true);
    expect(matchurl(`${origin}/pricing*`, `${origin}/pricingX`)).toBe(true);
    expect(matchurl(`${origin}/pricing*`, `${origin}/pricing/table`)).toBe(false);
    expect(matchurl(`${origin}/pricing/**`, `${origin}/pricing/a/b/c?x=1`)).toBe(true);
    expect(matchurl("https://example.com:8443/x", "https://example.com:8443/x")).toBe(true);
    expect(matchurl("https://example.com/x", "https://example.com:9999/x")).toBe(true);
    expect(matchurl("https://example.com:8443/x", "https://example.com:9999/x")).toBe(false);
    expect(matchurl("http://example.com/x", "https://example.com/x")).toBe(false);
    expect(matchurl("https://other.example/x", "https://example.com/x")).toBe(false);
    expect(matchurl("not a url", "https://example.com/x")).toBe(false);
    expect(matchurl("https://example.com/x", "not a url")).toBe(false);
    expect(visitmatch([origin], `${origin}/pricing?x=1`)).toBe(true);
    expect(visitmatch([origin], "https://denied.example")).toBe(false);
    expect(visitmatch([origin], "not a url")).toBe(false);
  });

  it("parses the cron grammar with names, steps, ranges and the sunday normalization", () => {
    expect(cronparse("*/15 * * * *")).toMatchObject({ minutes: [0, 15, 30, 45] });
    expect(cronparse("0 12 * * *")).toMatchObject({ hours: [12] });
    expect(cronparse("1-3 * * * *")?.minutes).toEqual([1, 2, 3]);
    expect(cronparse("1,3,5 * * * *")?.minutes).toEqual([1, 3, 5]);
    expect(cronparse("* * * jan,dec *")?.months).toEqual([1, 12]);
    expect(cronparse("* * * * mon-fri")?.daysofweek).toEqual([1, 2, 3, 4, 5]);
    expect(cronparse("* * * * sun")?.daysofweek).toEqual([0]);
    expect(cronparse("* * * * 7")?.daysofweek).toEqual([0]);
    expect(cronparse("* * * * 0,7")?.daysofweek).toEqual([0]);
    for (const bad of [
      "",
      "* * * *",
      "* * * * * *",
      "60 * * * *",
      "* 24 * * *",
      "* * 0 * *",
      "* * 32 * *",
      "* * * 0 *",
      "* * * * 8",
      "* * * * tue-mon",
      "*/0 * * * *",
      "a * * * *",
      "1--2 * * * *",
    ]) {
      expect(cronparse(bad)).toBeUndefined();
    }
  });

  it("computes the next cron fire strictly after the given time and never for impossible schedules", () => {
    const base = Date.UTC(2026, 0, 15, 10, 30, 0);
    const nextminute = cronnext("* * * * *", base);
    expect(nextminute).toBe(base + 60_000);
    expect(cronnext("0 11 * * *", base)).toBe(base + 30 * 60_000);
    expect(cronnext("30 10 * * *", base)).toBe(base + 24 * 60 * 60_000);
    expect(cronnext("0 0 31 2 *", base)).toBeUndefined();
    expect(cronnext("bad", base)).toBeUndefined();
    expect(schedulecron({ cron: "*/5 * * * *" }, base)).toBe(base + 5 * 60_000);
  });

  it("schedules the interval fires with the jitter spread and lists the due rules", () => {
    expect(scheduleinterval({ period: 1000 }, undefined, now, 1)).toBe(now + 1000);
    expect(scheduleinterval({ period: 1000, jitter: 0 }, now, now, 1)).toBe(now + 1000);
    const spread = scheduleinterval({ period: 1000, jitter: 200 }, now, now, 42);
    expect(spread).toBeGreaterThanOrEqual(now + 900);
    expect(spread).toBeLessThanOrEqual(now + 1100);
    const rule = {
      ...armrule({ family: "interval", workflowid: "w1", payload: { period: 1000 }, now })!,
      state: { enabled: true, cooldown: 0, nextfireat: now - 1 },
    };
    const paused = { ...rule, state: { ...rule.state, pausedat: now } };
    const disabled = { ...rule, state: { ...rule.state, enabled: false } };
    expect(listdue([rule, paused, disabled], now)).toEqual([{ rule, overdueby: 1 }]);
    expect(listdue([{ ...rule, state: { ...rule.state, nextfireat: now + 1 } }], now)).toEqual([]);
  });

  it("applies the cooldown window with the exact boundary kept", () => {
    const rule = {
      ...armrule({ family: "interval", workflowid: "w1", payload: { period: 1000 }, now })!,
      state: { enabled: true, cooldown: 100, lastfireat: now },
    };
    expect(applycooldown(rule, now + 99)).toMatchObject({ suppressed: true, remaining: 1 });
    expect(applycooldown(rule, now + 100)).toMatchObject({ suppressed: false, remaining: 0 });
    const { lastfireat: _lastfire, ...statewithoutlastfire } = rule.state;
    expect(applycooldown({ ...rule, state: statewithoutlastfire }, now + 50).suppressed).toBe(false);
    expect(applycooldown({ ...rule, state: { ...rule.state, cooldown: 0 } }, now + 1).suppressed).toBe(false);
  });

  it("evaluates the triggers through the suppression gates and queues the fires", () => {
    const rule = armrule({ family: "interval", workflowid: "w1", payload: { period: 1000 }, now })!;
    expect(evaluatetrigger({ rule, now, cause: "interval", runactive: false, workflowreviewed: true })).toMatchObject({
      fired: true,
    });
    expect(
      evaluatetrigger({
        rule: updaterule(rule, { state: { enabled: false } }),
        now,
        cause: "c",
        runactive: false,
        workflowreviewed: true,
      }).suppressed,
    ).toBe("disabled");
    expect(
      evaluatetrigger({
        rule: updaterule(rule, { state: { pausedat: now } }),
        now,
        cause: "c",
        runactive: false,
        workflowreviewed: true,
      }).suppressed,
    ).toBe("paused");
    expect(evaluatetrigger({ rule, now, cause: "c", runactive: false, workflowreviewed: false }).suppressed).toBe(
      "unreviewed",
    );
    expect(evaluatetrigger({ rule, now, cause: "c", runactive: true, workflowreviewed: true }).suppressed).toBe(
      "dedupe",
    );
    const cooled = updaterule(rule, { state: { lastfireat: now, cooldown: 100 } });
    expect(
      evaluatetrigger({ rule: cooled, now: now + 50, cause: "c", runactive: false, workflowreviewed: true }),
    ).toMatchObject({ fired: false, suppressed: "cooldown", remaining: 50 });
    const fired = evaluatetrigger({
      rule,
      now: now + 1,
      cause: "visit",
      url: `${origin}/pricing`,
      title: "Pricing",
      payload: { rows: 12 },
      runactive: false,
      workflowreviewed: true,
    });
    expect(fired.fire).toMatchObject({
      ruleid: rule.id,
      at: now + 1,
      cause: "visit",
      url: `${origin}/pricing`,
      title: "Pricing",
    });
    const queue = queuefire([], fired.fire!);
    expect(queue.queued).toBe(true);
    const deduped = queuefire(queue.queue, { ...fired.fire!, id: "other" });
    expect(deduped.queued).toBe(false);
    expect(deduped.deduped).toBe(true);
  });

  it("drains the queued fires and keeps the failed one for the next wake", async () => {
    const fires = [
      { id: "f1", ruleid: "r1", at: now, cause: "visit" },
      { id: "f2", ruleid: "r2", at: now + 1, cause: "url" },
    ];
    let launched = 0;
    const drained = await drainqueue(fires, async () => {
      launched += 1;
      if (launched === 1) throw new Error("the launch failed");
    });
    expect(launched).toBe(1);
    expect(drained.remaining.map((fire) => fire.id)).toEqual(["f1", "f2"]);
    const done = await drainqueue(fires, async () => {
      launched += 1;
    });
    expect(done.launched).toBe(2);
    expect(done.remaining).toEqual([]);
  });

  it("verifies the webhook deliveries against the secret and the schema", () => {
    const secret = "abcdefgh12345678abcdefgh12345678";
    const rule = armrule({
      family: "webhook",
      workflowid: "w1",
      payload: {
        secret,
        schema: [
          { name: "rows", kind: "number", required: true },
          { name: "note", kind: "string" },
        ],
      },
      now,
    })!;
    expect(verifywebhook({ rule, secret, payload: { rows: 12 } })).toEqual({ verified: true });
    expect(verifywebhook({ rule, secret: "wrong secret 1234567890123456", payload: { rows: 12 } }).reason).toMatch(
      /does not match the reviewed secret/i,
    );
    expect(verifywebhook({ rule, secret, payload: { note: "x" } }).reason).toMatch(
      /required webhook field rows is missing/i,
    );
    expect(verifywebhook({ rule, secret, payload: { rows: "twelve" } }).reason).toMatch(/not a number/i);
    expect(verifywebhook({ rule, secret, payload: "not an object" }).reason).toMatch(/must be a JSON object/i);
    const { secret: _secret, ...rulewithoutsecret } = rule;
    expect(verifywebhook({ rule: rulewithoutsecret, secret, payload: {} }).reason).toMatch(
      /carries no reviewed secret/i,
    );
  });

  it("observes the event rules, suspends and resumes the fleet", () => {
    const rule = armrule({ family: "event", workflowid: "w1", payload: { events: ["mutate", "console"] }, now })!;
    expect(eventrulematches(rule, "mutate")).toBe(true);
    expect(eventrulematches(rule, "navigate")).toBe(false);
    expect(
      observeevents(
        [rule, armrule({ family: "cron", workflowid: "w2", payload: { cron: "* * * * *" }, now })!],
        "mutate",
      ),
    ).toEqual([rule]);
    expect(observeevents([rule], "unknown")).toEqual([]);
    expect(observeevents([updaterule(rule, { state: { enabled: false } })], "mutate")).toEqual([]);
    const paused = pauseall([rule], now);
    expect(paused[0]?.state.pausedat).toBe(now);
    const resumed = resumeall(paused);
    expect(resumed[0]?.state.pausedat).toBeUndefined();
    expect(resumeall([rule])[0]?.state.pausedat).toBeUndefined();
  });

  it("previews the manual run and records the confirmation", () => {
    const record = compose([
      step("s1"),
      controlstep("l1", "loop", { loop: { list: "items", item: "it", index: "ix", bound: 4, steps: [step("c1")] } }),
    ]);
    const preview: manualrun = manualpreview(record, now);
    expect(preview.workflowid).toBe(record.id);
    expect(preview.preview).toHaveLength(2);
    expect(preview.preview[1]?.control).toMatchObject({ kind: "loop", bound: 4 });
    expect(preview.confirmed).toBeUndefined();
    const confirmed = confirmmanualrun(preview, true, now + 1);
    expect(confirmed).toMatchObject({ confirmed: true, decidedat: now + 1 });
    expect(confirmmanualrun(preview, false, now + 2).confirmed).toBe(false);
  });

  it("summarizes the rules and checks the origins against the workflow grants", () => {
    const rule = armrule({
      family: "visit",
      workflowid: "w1",
      payload: { origins: [origin, "https://other.example"] },
      now,
    })!;
    expect(triggersummary(rule)).toMatchObject({
      kind: "visit",
      workflowid: "w1",
      origins: [origin, "https://other.example"],
      cooldown: 0,
      enabled: true,
    });
    expect(ruleorigins(rule)).toEqual([origin, "https://other.example"]);
    expect(ruleoriginsgranted(rule, [origin])).toBe(false);
    expect(ruleoriginsgranted(rule, [origin, "https://other.example"])).toBe(true);
    expect(ruleoriginsgranted(armrule({ family: "menu", workflowid: "w1", payload: { title: "t" }, now })!, [])).toBe(
      true,
    );
  });

  it("plans one fire per url of the url list rules", () => {
    const rule = armrule({
      family: "urllist",
      workflowid: "w1",
      payload: { urls: [origin, "https://other.example"] },
      now,
    })!;
    const fires = runurllist(rule, now + 1);
    expect(fires.map((fire) => fire.url)).toEqual([origin, "https://other.example"]);
    expect(fires.every((fire) => fire.cause === "urllist" && fire.ruleid === rule.id && fire.at === now + 1)).toBe(
      true,
    );
    const { urls: _urls, ...rulewithouturls } = rule;
    expect(runurllist(rulewithouturls, now)).toEqual([]);
  });
});

describe("torture: workflow editor parsing, files and canvas rules", () => {
  const record = (): workflowrecord =>
    compose([
      step("s1"),
      step("s2"),
      controlstep("l1", "loop", { loop: { list: "items", item: "it", index: "ix", bound: 3, steps: [step("c1")] } }),
    ]);

  it("builds the step library over the kinds grouped by category", () => {
    const library = buildsteplibrary(["click", "type", "wait", "delay", "compute", "loop", "cronrule", "click"]);
    expect(library).toHaveLength(7);
    expect(library.find((entry) => entry.kind === "loop")).toMatchObject({ category: "controlflow" });
    expect(library.find((entry) => entry.kind === "delay")).toMatchObject({ category: "waits" });
    expect(library.find((entry) => entry.kind === "compute")).toMatchObject({ category: "variables" });
    expect(library.find((entry) => entry.kind === "cronrule")).toMatchObject({ category: "triggers" });
    expect(library.find((entry) => entry.kind === "click")).toMatchObject({ category: "actions" });
    expect(library.find((entry) => entry.kind === "delay")?.optionschema[0]).toMatchObject({
      name: "base",
      kind: "number",
      required: true,
    });
    expect(palettecategories).toHaveLength(5);
  });

  it("roundtrips the canvas model through load and save", () => {
    const loaded = loadworkflow(record());
    expect(loaded.nodes).toHaveLength(3);
    expect(loaded.dirty).toBe(false);
    const saved = saveworkflow(loaded, { now, kindallowed: () => true, riskof: () => "read" });
    expect(saved.steps.map((one) => one.id)).toEqual(["s1", "s2", "l1"]);
    expect(saved.origins).toEqual([origin]);
  });

  it("refuses the canvas save with blank names, broken versions and empty origins", () => {
    const model = loadworkflow(record());
    expect(() => saveworkflow({ ...model, name: " " }, { now })).toThrow(/name/i);
    expect(() => saveworkflow({ ...model, version: 0 }, { now })).toThrow(/version/i);
    expect(() => saveworkflow({ ...model, version: 1.5 }, { now })).toThrow(/version/i);
    expect(() => saveworkflow({ ...model, origins: [] }, { now })).toThrow(/at least one granted HTTPS origin/i);
  });

  it("refuses the node that is both a step and an invocation and the duplicate ids", () => {
    const model = loadworkflow(record());
    const both = { ...model.nodes[0]!, invocation: { block: "b", label: "l" } };
    expect(() => saveworkflow({ ...model, nodes: [both] }, { now })).toThrow(
      /exactly one workflow step or one block invocation/i,
    );
    const duplicated = { ...model, nodes: [model.nodes[0]!, { ...model.nodes[0]! }] };
    expect(() => saveworkflow(duplicated, { now })).toThrow(/must be unique/i);
    const neither = { ...model, nodes: [{ x: 0, y: 0 }] as never };
    expect(() => saveworkflow(neither, { now })).toThrow(/exactly one workflow step or one block invocation/i);
  });

  it("refuses the edges that run backwards or reference unknown steps", () => {
    const model = loadworkflow(record());
    expect(() =>
      saveworkflow({ ...model, edges: [{ from: "s2", to: "s1", variable: "rows", kind: "number" }] }, { now }),
    ).toThrow(/would form a cycle/i);
    expect(() =>
      saveworkflow({ ...model, edges: [{ from: "ghost", to: "s1", variable: "rows", kind: "number" }] }, { now }),
    ).toThrow(/unknown source step ghost/i);
    expect(() =>
      saveworkflow({ ...model, edges: [{ from: "s1", to: "ghost", variable: "rows", kind: "number" }] }, { now }),
    ).toThrow(/unknown target step ghost/i);
  });

  it("snaps nodes to the grid, refuses the broken grids and the invocation nodes", () => {
    const model = loadworkflow(record());
    expect(() => snapnode(model, "s1", 0, 0, 0)).toThrow(/snap grid must be a positive number/i);
    expect(() => snapnode(model, "s1", 0, 0, -20)).toThrow(/snap grid must be a positive number/i);
    expect(() => snapnode(model, "ghost", 0, 0)).toThrow(/No canvas node matches ghost/i);
    const snapped = snapnode(model, "s1", 47, 93, 20);
    expect(snapped.nodes[0]).toMatchObject({ x: 40, y: 100 });
    expect(snapped.dirty).toBe(true);
    const invocationmodel = loadworkflow(
      composeworkflow({
        name: "n",
        version: 1,
        origins: [origin],
        steps: [{ block: "b", label: "b" }],
        blocks: [{ name: "b", label: "b", steps: [step("i1")] }],
        now,
      }),
    );
    expect(() => snapnode(invocationmodel, "b", 0, 0)).toThrow(/attaches through its own definition/i);
  });

  it("reorders the canvas nodes and refuses the broken indexes", () => {
    const model = loadworkflow(record());
    expect(() => reordersteps(model, "ghost", 0)).toThrow(/No canvas node matches ghost/i);
    expect(() => reordersteps(model, "s1", -1)).toThrow(/must address an existing position/i);
    expect(() => reordersteps(model, "s1", 3)).toThrow(/must address an existing position/i);
    expect(() => reordersteps(model, "s1", 1.5)).toThrow(/must address an existing position/i);
    const reordered = reordersteps(model, "s2", 0);
    expect(reordered.nodes.map((node) => node.step?.id)).toEqual(["s2", "s1", "l1"]);
  });

  it("groups the selection into a new block and refuses the broken names", () => {
    const model = loadworkflow(record());
    expect(() => groupselect(model, ["s1"], "Bad Name")).toThrow(/block name must be a unique lowercase word/i);
    const grouped = groupselect(model, ["s1", "s2"], "pair");
    expect(() => groupselect(grouped, ["l1"], "pair")).toThrow(/already exists on the canvas/i);
    expect(() => groupselect(model, [], "block1")).toThrow(/at least one step node/i);
    expect(() => groupselect(model, ["ghost"], "block1")).toThrow(/not one/i);
    expect(grouped.blocks.map((block) => block.name)).toEqual(["pair"]);
    expect(grouped.nodes.map((node) => node.invocation?.block ?? node.step?.id)).toEqual(["pair", "l1"]);
  });

  it("inserts templates and steps with id deduplication and refuses the malformed ones", () => {
    const model = loadworkflow(record());
    const template: steptemplate = { id: "t1", name: "the wait", origin, step: step("s1"), sharedat: now };
    const expanded = expandtemplate(model, template, [], 1);
    expect(expanded.nodes[1]?.step?.id).toBe("s12");
    expect(() => expandtemplate(model, { ...template, step: { ...step("s1"), kind: "WAIT" as never } })).toThrow(
      /does not carry one reviewed workflow step/i,
    );
    expect(() => expandtemplate(model, template, [{ name: "Notvalid", kind: "string" } as never])).toThrow(
      /malformed nested parameter/i,
    );
    const added = addnode(model, step("s9"), 0);
    expect(added.nodes[0]?.step?.id).toBe("s9");
    const deduped = addnode(added, step("s9"));
    expect(deduped.nodes.at(-1)?.step?.id).toBe("s92");
    expect(() => addnode(model, { ...step("x"), kind: "WAIT2" as never })).toThrow(/needs one reviewed workflow step/i);
    expect(() => addnode(model, step("s9"), -1)).not.toThrow();
  });

  it("edits the step payloads through the inspector and refuses the unknown steps", () => {
    const model = loadworkflow(record());
    const edited = editstep(model, { ...step("s1"), value: "20" });
    expect(edited.nodes[0]?.step?.value).toBe("20");
    expect(() => editstep(model, step("ghost"))).toThrow(/No canvas step matches ghost/i);
    expect(() => editstep(model, { ...step("s1"), kind: "WAIT" as never })).toThrow(
      /needs one reviewed workflow step/i,
    );
  });

  it("renders the minimap, focuses it and zooms with the label compensation", () => {
    const model = loadworkflow(record());
    const projection = renderminimap(model);
    expect(projection.minimap.scale).toBeGreaterThan(0);
    expect(projection.nodes).toHaveLength(3);
    expect(() => renderminimap(model, 0, 100)).toThrow(/mini map size must be positive/i);
    expect(() => renderminimap(model, 160, -1)).toThrow(/mini map size must be positive/i);
    const focused = minimapfocus(model, 80, 50);
    expect(focused.layout.viewportx).toBeGreaterThanOrEqual(0);
    const zoomed = zoomcanvas(model, 0.5);
    expect(zoomed.model.layout.zoom).toBe(0.5);
    expect(zoomed.labelscale).toBe(2);
    expect(zoomcanvas(model, 2).labelscale).toBe(1);
    expect(() => zoomcanvas(model, 0)).toThrow(/positive number with no code ceiling/i);
    expect(() => zoomcanvas(model, -1)).toThrow(/positive number with no code ceiling/i);
    expect(() => zoomcanvas(model, NaN)).toThrow(/positive number with no code ceiling/i);
  });

  it("searches the steps by label, kind and variable with the blank query empty", () => {
    const model = loadworkflow(record());
    expect(searchsteps(model, " ")).toEqual([]);
    const bylabel = searchsteps(model, "the s1");
    expect(bylabel[0]?.matched).toContain("label");
    const bykind = searchsteps(model, "loop");
    expect(bykind[0]?.id).toBe("l1");
    const withedges: editormodel = { ...model, edges: [{ from: "s1", to: "s2", variable: "rows", kind: "number" }] };
    expect(searchsteps(withedges, "rows")[0]?.matched).toContain("variable");
  });

  it("marks the breakpoints on the canvas and in the blocks and refuses the unknown", () => {
    const model = loadworkflow(record());
    const marked = markbreakpoint(model, "s1");
    expect(marked.nodes[0]?.step?.breakpoint).toBe(true);
    const unmarked = markbreakpoint(marked, "s1");
    expect(unmarked.nodes[0]?.step?.breakpoint).toBeUndefined();
    expect(() => markbreakpoint(model, "ghost")).toThrow(/No canvas step matches ghost/i);
    const blockmodel = loadworkflow(
      composeworkflow({
        name: "n",
        version: 1,
        origins: [origin],
        steps: [{ block: "b", label: "b" }],
        blocks: [{ name: "b", label: "b", steps: [step("i1")] }],
        now,
      }),
    );
    const blockmarked = markbreakpoint(blockmodel, "i1");
    expect(blockmarked.blocks[0]?.steps[0]).toMatchObject({ id: "i1", breakpoint: true });
  });

  it("segments the debug runs at the breakpoints and reports the remaining steps", () => {
    const withbreakpoint = compose([step("s1"), { ...step("s2"), breakpoint: true }, step("s3")]);
    expect(runtobreakpoint({ record: withbreakpoint, breakpoints: [] })).toMatchObject({
      until: 1,
      pausat: "s2",
      remaining: 2,
    });
    expect(runtobreakpoint({ record: withbreakpoint, breakpoints: ["s3"] })).toMatchObject({
      until: 1,
      pausat: "s2",
      remaining: 2,
    });
    expect(runtobreakpoint({ record: record(), breakpoints: ["s9"] })).toMatchObject({
      until: 3,
      pausat: undefined,
      remaining: 0,
    });
    expect(runtobreakpoint({ record: record(), cursor: 2, breakpoints: [] })).toMatchObject({ until: 3, remaining: 0 });
    expect(runtobreakpoint({ record: record(), cursor: -5, breakpoints: [] }).until).toBe(3);
  });

  it("diffs the workflow versions with the added, removed and changed steps", () => {
    const from = record();
    const to = compose([
      step("s1", { value: "20" }),
      step("s3"),
      controlstep("l1", "loop", { loop: { list: "items", item: "it", index: "ix", bound: 9, steps: [step("c1")] } }),
    ]);
    const diff = diffversions(from, to, now);
    expect(diff.added.map((entry) => entry.stepid)).toEqual(["s3"]);
    expect(diff.removed.map((entry) => entry.stepid)).toEqual(["s2"]);
    expect(diff.changed.find((entry) => entry.stepid === "s1")?.changes).toEqual(["value"]);
    expect(diff.changed.find((entry) => entry.stepid === "l1")?.changes).toEqual(["options"]);
    expect(diff).toMatchObject({ from: 1, to: 1, at: now });
  });

  it("roundtrips the export and import in json and yaml with the format version gate", () => {
    const source = record();
    for (const format of ["json", "yaml"] as const) {
      const exported = exportworkflow(source, format, "  the shared run  ", now);
      expect(exported.file.note).toBe("  the shared run  ");
      expect(exported.file.format).toBe(1);
      const imported = importworkflow({
        contents: exported.contents,
        format,
        now,
        kindallowed: () => true,
        riskof: () => "read",
      });
      expect(imported.record.steps.map((one) => one.id)).toEqual(source.steps.map((one) => one.id));
      expect(imported.record.reviewstate).toBe("pending");
      expect(imported.file.format).toBe(1);
    }
    const auto = importworkflow({
      contents: exportworkflow(source, "json").contents,
      now,
      kindallowed: () => true,
      riskof: () => "read",
    });
    expect(auto.record.id).toBe(source.id);
  });

  it("refuses the malformed import documents of every shape", () => {
    expect(() => importworkflow({ contents: "{bad json", format: "json", now })).toThrow();
    expect(() => importworkflow({ contents: "[]", format: "json", now })).toThrow(/not a json object/i);
    expect(() =>
      importworkflow({
        contents: JSON.stringify({ format: 99, exportedat: now, workflow: { steps: [] }, templates: [] }),
        format: "json",
        now,
      }),
    ).toThrow(/not the reviewed format 1/i);
    expect(() =>
      importworkflow({
        contents: JSON.stringify({ format: 1, exportedat: now, workflow: { steps: [] }, templates: [] }),
        format: "json",
        now,
      }),
    ).toThrow(/at least one step/i);
    const steps = [step("s1")];
    const minimal = (workflow: Record<string, unknown>): string =>
      JSON.stringify({ format: 1, exportedat: now, workflow, templates: [] });
    expect(() =>
      importworkflow({
        contents: minimal({ name: "n", version: 1, origins: [origin], steps: [{ ...steps[0]!, kind: "WAIT" }] }),
        format: "json",
        now,
      }),
    ).toThrow(/reviewed step/i);
    expect(() =>
      importworkflow({
        contents: JSON.stringify({
          format: 1,
          exportedat: now,
          workflow: { name: "n", version: 1, origins: [origin], steps },
          templates: "nope",
        }),
        format: "json",
        now,
      }),
    ).toThrow(/templates .* must be a list/i);
    expect(() =>
      importworkflow({
        contents: JSON.stringify({
          format: 1,
          exportedat: now,
          workflow: { name: "n", version: 1, origins: [origin], steps },
          templates: [{ id: "t", name: "n", origin, step: { ...steps[0]!, kind: "WAIT" }, sharedat: now }],
        }),
        format: "json",
        now,
      }),
    ).toThrow(/does not carry one reviewed step/i);
    expect(() => importworkflow({ contents: "", format: "yaml", now })).toThrow(/empty/i);
    expect(() => importworkflow({ contents: "key with no colon\n  nested: 1", format: "yaml", now })).toThrow();
    expect(() => importworkflow({ contents: "- a\n- b", format: "yaml", now })).toThrow(/is not a mapping/i);
  });

  it("shares the workflow with the packed templates and imports them back", () => {
    const source = record();
    const templates: steptemplate[] = [{ id: "t1", name: "the wait", origin, step: step("w9"), sharedat: now }];
    const shared = shareworkflow(source, templates, "yaml", "the library note", now);
    expect(shared.file.templates).toHaveLength(1);
    const imported = importworkflow({
      contents: shared.contents,
      format: "yaml",
      now,
      kindallowed: () => true,
      riskof: () => "read",
    });
    expect(imported.templates[0]).toEqual(templates[0]);
    expect(importworkflow({ contents: shared.contents, now }).file.templates).toHaveLength(1);
  });

  it("wires the nested parameters into the block invocations", () => {
    const model = loadworkflow(
      composeworkflow({
        name: "n",
        version: 1,
        origins: [origin],
        steps: [{ block: "b", label: "b", params: [{ name: "depth", kind: "number" }] }],
        blocks: [{ name: "b", label: "b", steps: [step("i1")] }],
        now,
      }),
    );
    const bound = bindparam(model, "b", { name: "depth", kind: "number", default: 2 });
    expect(bound.nodes[0]?.invocation?.params).toEqual([{ name: "depth", kind: "number", default: 2 }]);
    expect(() => bindparam(model, "b", { name: "Bad Name", kind: "number" })).toThrow(/lowercase word/i);
    expect(() => bindparam(model, "ghost", { name: "depth", kind: "number" })).toThrow(/No block invocation of ghost/i);
  });

  it("applies the site overrides to the matching knobs only", () => {
    const override: siteoverride = {
      id: "o1",
      workflowid: record().id,
      pattern: origin,
      deltas: { loopbound: 9 },
      createdat: now,
    };
    const withloop = compose([
      step("s1"),
      controlstep("l1", "loop", { loop: { list: "items", item: "it", index: "ix", bound: 3, steps: [step("c1")] } }),
    ]);
    const applied = applyoverride(withloop, override);
    const payload = JSON.parse(applied.steps[1]?.options ?? "{}") as { loop: { bound: number } };
    expect(payload.loop.bound).toBe(9);
    expect(() => applyoverride(withloop, { ...override, pattern: "https://denied.example" })).toThrow(
      /matches none of the workflow origins/i,
    );
    expect(() => applyoverride(withloop, { ...override, deltas: { unknown: 1 } })).toThrow(
      /not one of the reviewed knobs/i,
    );
    expect(() => applyoverride(withloop, { ...override, deltas: { loopbound: 0 } })).toThrow(
      /must be a positive number/i,
    );
    expect(() => applyoverride(withloop, { ...override, deltas: { loopbound: -1 } })).toThrow(
      /must be a positive number/i,
    );
    expect(() => applyoverride(withloop, { ...override, deltas: { loopbound: NaN } })).toThrow(
      /must be a positive number/i,
    );
    expect(applyoverride(withloop, { ...override, deltas: {} }).steps).toEqual(withloop.steps);
  });

  it("adds, removes and refuses the binding edges of the canvas", () => {
    const model = loadworkflow(record());
    const withedge = addedge(model, { from: "s1", to: "s2", variable: "rows", kind: "number" });
    expect(withedge.edges).toHaveLength(1);
    expect(() => addedge(model, { from: "s2", to: "s1", variable: "rows", kind: "number" })).toThrow(
      /would run backwards/i,
    );
    expect(() => addedge(model, { from: "ghost", to: "s2", variable: "rows", kind: "number" })).toThrow(
      /unknown source step ghost/i,
    );
    expect(() => addedge(model, { from: "s1", to: "s2", variable: "Bad Name", kind: "number" })).toThrow(
      /lowercase word/i,
    );
    const removed = removeedge(withedge, "s1", "s2", "rows");
    expect(removed.edges).toHaveLength(0);
    expect(() => removeedge(withedge, "s1", "s2", "other")).toThrow(/No canvas edge of other links s1 into s2/i);
  });

  it("removes the nodes with their edges and undoes and redoes the edits", () => {
    const withedge = addedge(loadworkflow(record()), { from: "s1", to: "s2", variable: "rows", kind: "number" });
    const removed = removenode(withedge, "s1");
    expect(removed.nodes).toHaveLength(2);
    expect(removed.edges).toHaveLength(0);
    expect(() => removenode(removed, "s1")).toThrow(/No canvas node matches s1/i);
    const undone = undoedit(removed);
    expect(undone.nodes).toHaveLength(3);
    expect(undone.redo).toHaveLength(1);
    const redone = redoedit(undone);
    expect(redone.nodes).toHaveLength(2);
    expect(redone.undo).toHaveLength(2);
    expect(undoedit(loadworkflow(record())).dirty).toBe(false);
    expect(redoedit(loadworkflow(record())).dirty).toBe(false);
  });
});
