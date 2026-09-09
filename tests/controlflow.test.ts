import { describe, expect, it } from "vitest";
import { composeworkflow, newworkflowrun, resolvevariable, runstep, runworkflow, workflowstepof } from "../workflow.js";
import {
  applyretry,
  applyruntimeout,
  applytimeout,
  backoffdelay,
  branchof,
  cancellederror,
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
  tryof,
  whileof,
  controlexecutor,
} from "../workflow.js";
import { actionrisk, dryrunprojection, isworkflowkind, validatestep } from "../policy.js";
import { outcomeresponse, parseworkflowproposal, workflowoutcome, workflowreport } from "../protocol.js";
import { protocolversion } from "../types.js";
import { loopshare, recordworkflow, workflowevidences } from "../progress.js";
import { sessionmemory } from "../memory.js";
import type {
  agentplan,
  agentsession,
  controlflowdecision,
  retryattempt,
  runlogentry,
  timeoutabort,
  toolstep,
  variablescope,
  workflowstep,
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
  objective: "Run the reviewed workflow with control flow",
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

/** Builds one control flow step with its reviewed payload serialized into options. */
function controlstep(id: string, kind: string, payload: Record<string, unknown>): workflowstep {
  const parsed = workflowstepof({ id, kind, label: `The ${kind} step`, options: JSON.stringify(payload) });
  if (!parsed) throw new Error(`The ${kind} step did not normalize.`);
  return parsed;
}

/** Builds one plain child step of a control body. */
function childstep(id: string, label: string, extra: Record<string, unknown> = {}): workflowstep {
  const parsed = workflowstepof({ id, kind: "wait", label, value: "10", ...extra });
  if (!parsed) throw new Error(`The child step ${id} did not normalize.`);
  return parsed;
}

const rootscope = (
  variables: Array<{
    name: string;
    kind: "string" | "number" | "boolean" | "list" | "element";
    value: string | number | boolean | string[];
  }>,
): variablescope[] => [
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

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }
}

describe("control flow kinds and payload grammar", () => {
  it("lists the control kinds inside the risk table and the workflow family", () => {
    expect(controlflowkinds).toEqual([
      "condition",
      "branch",
      "loop",
      "repeatuntil",
      "whileloop",
      "foreach",
      "parallel",
      "trycatch",
    ]);
    for (const kind of controlflowkinds) {
      expect(iscontrolflowkind(kind)).toBe(true);
      expect(isworkflowkind(kind as toolstep["kind"])).toBe(true);
      expect(kindallowed(kind)).toBe(true);
    }
    expect(iscontrolflowkind("click")).toBe(false);
    expect(actionrisk("condition")).toBe("read");
    expect(actionrisk("branch")).toBe("read");
    expect(actionrisk("loop")).toBe("interaction");
    expect(actionrisk("repeatuntil")).toBe("interaction");
    expect(actionrisk("whileloop")).toBe("interaction");
    expect(actionrisk("foreach")).toBe("interaction");
    expect(actionrisk("parallel")).toBe("interaction");
    expect(actionrisk("trycatch")).toBe("interaction");
  });

  it("normalizes condition and branch payloads with unique paths and a mandatory else", () => {
    expect(
      conditionof({ expression: { left: { ref: "ready" }, operator: "not", result: "stop", resultkind: "boolean" } }),
    ).toBeDefined();
    expect(
      conditionof({
        expression: {
          left: { literal: 1 },
          right: { literal: 2 },
          operator: "add",
          result: "sum",
          resultkind: "number",
        },
      }),
    ).toBeUndefined();
    expect(conditionof({})).toBeUndefined();
    const branch = branchof({
      paths: [
        {
          name: "fresh",
          when: {
            left: { ref: "count" },
            right: { literal: 0 },
            operator: "equal",
            result: "isfresh",
            resultkind: "boolean",
          },
          steps: [childstep("b1", "Fresh path")],
        },
        { name: "always", steps: [childstep("b2", "Unconditional path")] },
      ],
      else: { name: "fallback", steps: [] },
    });
    if (!branch) throw new Error("The reviewed branch payload did not normalize.");
    expect(branch.paths).toHaveLength(2);
    expect(branch.paths[0]?.when?.operator).toBe("equal");
    expect(branch.paths[1]?.when).toBeUndefined();
    expect(branch.else.steps).toEqual([]);
    expect(
      branchof({
        paths: [
          { name: "dup", steps: [childstep("b1", "One")] },
          { name: "dup", steps: [childstep("b2", "Two")] },
        ],
        else: { name: "else", steps: [] },
      }),
    ).toBeUndefined();
    expect(branchof({ paths: [{ name: "only", steps: [childstep("b1", "One")] }] })).toBeUndefined();
    expect(
      branchof({ paths: [{ name: "only", steps: [childstep("b1", "One")] }], else: { name: "only", steps: [] } }),
    ).toBeUndefined();
    expect(
      branchof({
        paths: [
          {
            name: "only",
            when: { left: { literal: 1 }, right: { literal: 1 }, operator: "add", result: "x", resultkind: "number" },
            steps: [childstep("b1", "One")],
          },
        ],
        else: { name: "else", steps: [] },
      }),
    ).toBeUndefined();
    expect(
      branchof({
        paths: [{ name: "only", steps: [childstep("b1", "One")] }],
        else: { name: "else", steps: [childstep("b2", "Two")] },
        extra: true,
      }),
    ).toBeDefined();
  });

  it("normalizes loop, repeat until, while and foreach payloads with user configured bounds", () => {
    expect(
      loopof({ list: "items", item: "item", index: "index", bound: 50, steps: [childstep("b1", "Body")] }),
    ).toBeDefined();
    expect(loopof({ list: "items", item: "item", index: "index", steps: [childstep("b1", "Body")] })).toBeDefined();
    expect(loopof({ list: "items", item: "items", index: "index", steps: [childstep("b1", "Body")] })).toBeUndefined();
    expect(loopof({ list: "items", item: "item", index: "item", steps: [childstep("b1", "Body")] })).toBeUndefined();
    expect(
      loopof({ list: "items", item: "item", index: "index", bound: 0, steps: [childstep("b1", "Body")] }),
    ).toBeUndefined();
    expect(
      loopof({ list: "items", item: "item", index: "index", bound: 2.5, steps: [childstep("b1", "Body")] }),
    ).toBeUndefined();
    expect(loopof({ list: "items", item: "item", index: "index", steps: [] })).toBeUndefined();
    expect(
      repeatuntilof({
        until: {
          left: { ref: "count" },
          right: { literal: 3 },
          operator: "greaterequal",
          result: "done",
          resultkind: "boolean",
        },
        bound: 10,
        steps: [childstep("b1", "Body")],
      }),
    ).toBeDefined();
    expect(
      repeatuntilof({
        until: { left: { literal: 1 }, right: { literal: 2 }, operator: "add", result: "n", resultkind: "number" },
        steps: [childstep("b1", "Body")],
      }),
    ).toBeUndefined();
    expect(
      whileof({
        while: { left: { ref: "count" }, right: { literal: 3 }, operator: "less", result: "go", resultkind: "boolean" },
        bound: 4,
        steps: [childstep("b1", "Body")],
      }),
    ).toBeDefined();
    expect(
      whileof({
        while: { left: { ref: "count" }, right: { literal: 3 }, operator: "less", result: "go", resultkind: "boolean" },
        steps: [childstep("b1", "Body")],
      }),
    ).toBeUndefined();
    expect(
      foreachof({ selector: "li.item", item: "row", index: "rowindex", steps: [childstep("b1", "Body")] }),
    ).toBeDefined();
    expect(
      foreachof({ selector: " ", item: "row", index: "rowindex", steps: [childstep("b1", "Body")] }),
    ).toBeUndefined();
    expect(
      foreachof({ selector: "li.item", item: "row", index: "row", steps: [childstep("b1", "Body")] }),
    ).toBeUndefined();
  });

  it("normalizes parallel and try payloads with join, retry and timeout policies", () => {
    expect(
      parallelof({
        branches: [
          { id: "one", steps: [childstep("a1", "A")] },
          { id: "two", steps: [childstep("b1", "B")] },
        ],
        join: { strategy: "last", onfail: "cancel" },
      }),
    ).toBeDefined();
    expect(
      parallelof({
        branches: [
          { id: "one", steps: [childstep("a1", "A")] },
          { id: "one", steps: [childstep("b1", "B")] },
        ],
        join: { strategy: "first", onfail: "continue" },
      }),
    ).toBeUndefined();
    expect(
      parallelof({
        branches: [{ id: "one", steps: [childstep("a1", "A")] }],
        join: { strategy: "merge", onfail: "continue" },
      }),
    ).toBeUndefined();
    expect(
      parallelof({
        branches: [{ id: "one", steps: [childstep("a1", "A")] }],
        join: { strategy: "fail", onfail: "ignore" },
      }),
    ).toBeUndefined();
    expect(
      tryof({ steps: [childstep("f1", "Fragile")], catch: { steps: [childstep("c1", "Handler")] } }),
    ).toBeDefined();
    expect(
      tryof({
        steps: [childstep("f1", "Fragile")],
        catch: { steps: [childstep("c1", "Handler")], rerun: true },
        retry: {
          attempts: 5,
          backoff: { shape: "exponential", base: 100, jitter: 20 },
          retryable: ["timeout", "pageunresponsive"],
        },
        timeout: { stepms: 4000, runms: 30000 },
      }),
    ).toBeDefined();
    expect(tryof({ steps: [childstep("f1", "Fragile")] })).toBeUndefined();
    expect(tryof({ steps: [childstep("f1", "Fragile")], catch: { steps: [] } })).toBeUndefined();
    expect(
      tryof({
        steps: [childstep("f1", "Fragile")],
        catch: { steps: [childstep("c1", "Handler")] },
        retry: { attempts: 0, backoff: { shape: "fixed", base: 0, jitter: 0 }, retryable: ["timeout"] },
      }),
    ).toBeUndefined();
    expect(
      tryof({
        steps: [childstep("f1", "Fragile")],
        catch: { steps: [childstep("c1", "Handler")] },
        retry: { attempts: 2, backoff: { shape: "wave", base: 0, jitter: 0 }, retryable: ["timeout"] },
      }),
    ).toBeUndefined();
    expect(
      tryof({
        steps: [childstep("f1", "Fragile")],
        catch: { steps: [childstep("c1", "Handler")] },
        retry: { attempts: 2, backoff: { shape: "fixed", base: -1, jitter: 0 }, retryable: ["timeout"] },
      }),
    ).toBeUndefined();
    expect(
      tryof({
        steps: [childstep("f1", "Fragile")],
        catch: { steps: [childstep("c1", "Handler")] },
        timeout: { stepms: -5 },
      }),
    ).toBeUndefined();
    expect(
      tryof({ steps: [childstep("f1", "Fragile")], catch: { steps: [childstep("c1", "Handler")] }, timeout: {} }),
    ).toBeUndefined();
  });

  it("collects every nested child step of a control payload recursively", () => {
    const nested = controlstep("l1", "loop", {
      loop: {
        list: "items",
        item: "item",
        index: "index",
        steps: [
          childstep("b1", "Body read"),
          controlstep("p1", "parallel", {
            parallel: {
              branches: [
                { id: "one", steps: [childstep("a1", "Lane one")] },
                { id: "two", steps: [childstep("a2", "Lane two")] },
              ],
              join: { strategy: "first", onfail: "continue" },
            },
          }),
          controlstep("t1", "trycatch", {
            try: { steps: [childstep("f1", "Fragile")], catch: { steps: [childstep("c1", "Handler")] } },
          }),
        ],
      },
    });
    const children = controlsteps(nested);
    expect(children.map((child) => child.id)).toEqual(["b1", "p1", "a1", "a2", "t1", "f1", "c1"]);
    expect(controlsteps(childstep("b1", "Plain"))).toEqual([]);
    const malformed = controlstep("l1", "loop", { loop: { list: "items", item: "item", index: "index" } });
    expect(controlsteps(malformed)).toEqual([]);
  });

  it("summarizes every control kind for the review panel", () => {
    expect(
      controlsummary(
        controlstep("c1", "condition", {
          condition: { expression: { left: { ref: "ready" }, operator: "not", result: "stop", resultkind: "boolean" } },
        }),
      ),
    ).toMatchObject({ kind: "condition", expression: expect.stringContaining("not") });
    expect(
      controlsummary(
        controlstep("b1", "branch", {
          branch: { paths: [{ name: "fast", steps: [childstep("x1", "Fast")] }], else: { name: "slow", steps: [] } },
        }),
      ),
    ).toMatchObject({ kind: "branch", paths: ["fast"], elsepath: "slow" });
    expect(
      controlsummary(
        controlstep("l1", "loop", {
          loop: { list: "items", item: "item", index: "index", steps: [childstep("x1", "Body")] },
        }),
      ),
    ).toMatchObject({ kind: "loop", list: "items", item: "item", index: "index", bound: defaultloopbound });
    expect(
      controlsummary(
        controlstep("w1", "whileloop", {
          while: {
            while: { left: { literal: true }, operator: "not", result: "go", resultkind: "boolean" },
            bound: 7,
            steps: [childstep("x1", "Body")],
          },
        }),
      ),
    ).toMatchObject({ kind: "whileloop", bound: 7 });
    expect(
      controlsummary(
        controlstep("p1", "parallel", {
          parallel: {
            branches: [
              { id: "one", steps: [childstep("x1", "One")] },
              { id: "two", steps: [childstep("x2", "Two")] },
            ],
            join: { strategy: "fail", onfail: "cancel" },
          },
        }),
      ),
    ).toMatchObject({ kind: "parallel", branches: ["one", "two"], strategy: "fail", onfail: "cancel" });
    expect(
      controlsummary(
        controlstep("t1", "trycatch", {
          try: {
            steps: [childstep("f1", "Fragile")],
            catch: { steps: [childstep("c1", "Handler")], rerun: true },
            retry: { attempts: 3, backoff: { shape: "exponential", base: 100, jitter: 10 }, retryable: ["timeout"] },
            timeout: { stepms: 500, runms: 5000 },
          },
        }),
      ),
    ).toMatchObject({ kind: "trycatch", attempts: 3, rerun: true, stepms: 500, runms: 5000 });
    expect(controlsummary(childstep("b1", "Plain"))).toBeUndefined();
  });
});

describe("condition and branch evaluation", () => {
  it("evaluates conditions over extracted values with no page side effect", () => {
    const condition = conditionof({
      expression: {
        left: { ref: "count" },
        right: { literal: 3 },
        operator: "greaterequal",
        result: "done",
        resultkind: "boolean",
      },
    });
    if (!condition) throw new Error("The condition payload did not normalize.");
    expect(evaluatecondition(condition, rootscope([{ name: "count", kind: "number", value: 3 }]))).toBe(true);
    expect(evaluatecondition(condition, rootscope([{ name: "count", kind: "number", value: 2 }]))).toBe(false);
    expect(() => evaluatecondition(condition, rootscope([]))).toThrow("undefined variable count");
    expect(() =>
      evaluatecondition(
        {
          expression: {
            left: { literal: 1 },
            right: { literal: 2 },
            operator: "add",
            result: "sum",
            resultkind: "boolean",
          },
        },
        [],
      ),
    ).toThrow("boolean");
  });

  it("chooses the first matching branch path and falls back to the else path", () => {
    const branch = branchof({
      paths: [
        {
          name: "empty",
          when: {
            left: { ref: "count" },
            right: { literal: 0 },
            operator: "equal",
            result: "isempty",
            resultkind: "boolean",
          },
          steps: [childstep("b1", "Empty path")],
        },
        {
          name: "small",
          when: {
            left: { ref: "count" },
            right: { literal: 10 },
            operator: "less",
            result: "issmall",
            resultkind: "boolean",
          },
          steps: [childstep("b2", "Small path")],
        },
      ],
      else: { name: "large", steps: [childstep("b3", "Large path")] },
    });
    if (!branch) throw new Error("The branch payload did not normalize.");
    const empty = choosebranch({
      stepid: "br1",
      branch,
      scopes: rootscope([{ name: "count", kind: "number", value: 0 }]),
      now,
    });
    expect(empty.outcome.path).toBe("empty");
    expect(empty.outcome.reason).toContain("condition of the path empty holds");
    expect(empty.steps.map((step) => step.id)).toEqual(["b1"]);
    const small = choosebranch({
      stepid: "br1",
      branch,
      scopes: rootscope([{ name: "count", kind: "number", value: 5 }]),
      now,
    });
    expect(small.outcome.path).toBe("small");
    const fallback = choosebranch({
      stepid: "br1",
      branch,
      scopes: rootscope([{ name: "count", kind: "number", value: 50 }]),
      now,
    });
    expect(fallback.outcome.path).toBe("large");
    expect(fallback.outcome.reason).toContain("No path condition held");
    expect(fallback.steps.map((step) => step.id)).toEqual(["b3"]);
    expect(fallback.outcome.at).toBe(now);
  });

  it("matches branch paths over the page state of the snapshot accessor", () => {
    const branch = branchof({
      paths: [
        {
          name: "ready",
          when: { left: { ref: "pageready" }, operator: "not", result: "notready", resultkind: "boolean" },
          steps: [childstep("b1", "Wait for load")],
        },
        {
          name: "shop",
          when: {
            left: { ref: "pageurl" },
            right: { literal: "https://shop.example.com/cart" },
            operator: "equal",
            result: "oncart",
            resultkind: "boolean",
          },
          steps: [childstep("b2", "Cart path")],
        },
      ],
      else: { name: "other", steps: [] },
    });
    if (!branch) throw new Error("The branch payload did not normalize.");
    const ready = choosebranch({
      stepid: "br1",
      branch,
      scopes: rootscope([]),
      pagestate: { url: "https://shop.example.com/cart", ready: true },
      now,
    });
    expect(ready.outcome.path).toBe("shop");
    const loading = choosebranch({
      stepid: "br1",
      branch,
      scopes: rootscope([]),
      pagestate: { url: "https://example.com", ready: false },
      now,
    });
    expect(loading.outcome.path).toBe("ready");
    const other = choosebranch({
      stepid: "br1",
      branch,
      scopes: rootscope([]),
      pagestate: { url: "https://other.example.com", ready: true },
      now,
    });
    expect(other.outcome.path).toBe("other");
  });
});

describe("loop family runners", () => {
  const execute = async (dispatched: workflowstep): Promise<{ ok: boolean; summary: string }> => ({
    ok: true,
    summary: `ran ${dispatched.id}`,
  });

  it("iterates a list variable rebinding the item and index per iteration", async () => {
    const step = controlstep("l1", "loop", {
      loop: {
        list: "items",
        item: "item",
        index: "index",
        bound: 10,
        steps: [
          workflowstepof({
            id: "b1",
            kind: "wait",
            label: "Read the row",
            value: "row ${item} at ${index}",
          }) as workflowstep,
        ],
      },
    });
    const seen: string[] = [];
    const result = await runcontrolstep({
      step,
      scopes: rootscope([{ name: "items", kind: "list", value: ["a", "b", "c"] }]),
      outputs: {},
      execute: async (dispatched) => {
        seen.push(`${dispatched.id}:${dispatched.value}`);
        return { ok: true, summary: "ok" };
      },
      now,
    });
    expect(result.output.ok).toBe(true);
    expect(seen).toEqual(["b1:row a at 0", "b1:row b at 1", "b1:row c at 2"]);
    const decision = result.output.details?.control as controlflowdecision;
    expect(decision.kind).toBe("loop");
    expect(decision.loops?.map((counter) => counter.iteration)).toEqual([0, 1, 2]);
    expect(result.log.some((entry) => entry.label.includes("iteration 2"))).toBe(true);
    expect(
      result.log.some(
        (entry) => entry.details !== undefined && (entry.details as { iteration?: number }).iteration === 1,
      ),
    ).toBe(true);
  });

  it("refuses a list longer than the reviewed bound with nothing running and reports the overflow", async () => {
    const step = controlstep("l1", "loop", {
      loop: { list: "items", item: "item", index: "index", bound: 2, steps: [childstep("b1", "Body")] },
    });
    let runs = 0;
    const result = await runcontrolstep({
      step,
      scopes: rootscope([{ name: "items", kind: "list", value: ["a", "b", "c"] }]),
      outputs: {},
      execute: async () => {
        runs += 1;
        return { ok: true, summary: "never" };
      },
      now,
    });
    expect(result.output.ok).toBe(false);
    expect(result.output.summary).toContain("exceeds the reviewed safety bound of 2");
    expect(runs).toBe(0);
  });

  it("fails the loop when an iteration fails and keeps the counters of the passes", async () => {
    const step = controlstep("l1", "loop", {
      loop: { list: "items", item: "item", index: "index", steps: [childstep("b1", "Body")] },
    });
    const result = await runcontrolstep({
      step,
      scopes: rootscope([{ name: "items", kind: "list", value: ["a", "b"] }]),
      outputs: {},
      execute: async (dispatched) =>
        dispatched.value === "10" && dispatched.id === "b1"
          ? { ok: dispatched.id === "b1" ? false : true, summary: dispatched.id === "b1" ? "the row refused" : "ok" }
          : { ok: true, summary: "ok" },
      now,
    });
    expect(result.output.ok).toBe(false);
    expect(result.output.summary).toContain("failed at iteration 1");
    const decision = result.output.details?.control as controlflowdecision;
    expect(decision.loops?.at(0)?.ok).toBe(false);
  });

  it("runs nested loops tracking the outer and inner index paths for audit", async () => {
    const inner = controlstep("l2", "loop", {
      loop: {
        list: "columns",
        item: "column",
        index: "columnindex",
        steps: [
          workflowstepof({
            id: "b2",
            kind: "wait",
            label: "Read the cell",
            value: "cell ${item}${column}",
          }) as workflowstep,
        ],
      },
    });
    const outer = controlstep("l1", "loop", { loop: { list: "items", item: "item", index: "index", steps: [inner] } });
    const seen: string[] = [];
    const result = await runcontrolstep({
      step: outer,
      scopes: rootscope([
        { name: "items", kind: "list", value: ["a", "b"] },
        { name: "columns", kind: "list", value: ["1", "2"] },
      ]),
      outputs: {},
      execute: async (dispatched) => {
        seen.push(`${dispatched.value}`);
        return { ok: true, summary: "ok" };
      },
      now,
    });
    expect(seen).toEqual(["cell a1", "cell a2", "cell b1", "cell b2"]);
    const decision = result.output.details?.control as controlflowdecision;
    expect(decision.loops?.map((counter) => counter.path)).toEqual(["l1[0]", "l1[1]"]);
    const innerlog = result.log.filter((entry) => entry.stepid === "l2");
    expect(innerlog.length).toBeGreaterThanOrEqual(4);
  });

  it("runs repeat until convergence inside the bound and reports the overflow honestly", async () => {
    const converging = controlstep("r1", "repeatuntil", {
      repeatuntil: {
        until: {
          left: { ref: "count" },
          right: { literal: 3 },
          operator: "greaterequal",
          result: "done",
          resultkind: "boolean",
        },
        bound: 8,
        steps: [
          workflowstepof({
            id: "b1",
            kind: "wait",
            label: "Nudge the counter",
            value: "1",
            expression: {
              left: { ref: "count" },
              right: { literal: 1 },
              operator: "add",
              result: "count",
              resultkind: "number",
            },
          }) as workflowstep,
        ],
      },
    });
    const converged = await runcontrolstep({
      step: converging,
      scopes: rootscope([{ name: "count", kind: "number", value: 0 }]),
      outputs: {},
      execute,
      now,
    });
    expect(converged.output.ok).toBe(true);
    expect(converged.output.summary).toContain("converged after 3 iterations");
    const decision = converged.output.details?.control as controlflowdecision;
    expect(decision.loops).toHaveLength(3);

    const stuck = controlstep("r1", "repeatuntil", {
      repeatuntil: {
        until: { left: { literal: true }, operator: "not", result: "never", resultkind: "boolean" },
        bound: 2,
        steps: [childstep("b1", "Body")],
      },
    });
    const overflow = await runcontrolstep({ step: stuck, scopes: rootscope([]), outputs: {}, execute, now });
    expect(overflow.output.ok).toBe(false);
    expect(overflow.output.summary).toContain("never converged within the reviewed safety bound of 2");
  });

  it("runs while loops that end when the condition stops and refuses the endless ones at the bound", async () => {
    const ending = controlstep("w1", "whileloop", {
      while: {
        while: { left: { ref: "count" }, right: { literal: 3 }, operator: "less", result: "go", resultkind: "boolean" },
        bound: 10,
        steps: [
          workflowstepof({
            id: "b1",
            kind: "wait",
            label: "Grow the counter",
            value: "1",
            expression: {
              left: { ref: "count" },
              right: { literal: 1 },
              operator: "add",
              result: "count",
              resultkind: "number",
            },
          }) as workflowstep,
        ],
      },
    });
    const ended = await runcontrolstep({
      step: ending,
      scopes: rootscope([{ name: "count", kind: "number", value: 0 }]),
      outputs: {},
      execute,
      now,
    });
    expect(ended.output.ok).toBe(true);
    expect(ended.output.summary).toContain("ended after 3 iterations");
    expect(resolvevariable(ended.scopes, "count")?.value).toBe(3);

    const endless = controlstep("w1", "whileloop", {
      while: {
        while: { left: { literal: false }, operator: "not", result: "forever", resultkind: "boolean" },
        bound: 2,
        steps: [childstep("b1", "Body")],
      },
    });
    const overflow = await runcontrolstep({ step: endless, scopes: rootscope([]), outputs: {}, execute, now });
    expect(overflow.output.ok).toBe(false);
    expect(overflow.output.summary).toContain(
      "hit its reviewed safety bound of 2 iterations while its condition still held",
    );

    const nevers = controlstep("w1", "whileloop", {
      while: {
        while: { left: { literal: true }, operator: "not", result: "never", resultkind: "boolean" },
        bound: 4,
        steps: [childstep("b1", "Body")],
      },
    });
    const zero = await runcontrolstep({
      step: nevers,
      scopes: rootscope([]),
      outputs: {},
      execute: async () => {
        throw new Error("never");
      },
      now,
    });
    expect(zero.output.ok).toBe(true);
    expect(zero.output.summary).toContain("ended after 0 iterations");
  });

  it("runs foreach over matched elements and reports the empty match as zero iterations", async () => {
    const step = controlstep("f1", "foreach", {
      foreach: {
        selector: "li.row",
        item: "row",
        index: "rowindex",
        steps: [
          workflowstepof({
            id: "b1",
            kind: "wait",
            label: "Read the element",
            value: "element ${row} at ${rowindex}",
          }) as workflowstep,
        ],
      },
    });
    const seen: string[] = [];
    const filled = await runcontrolstep({
      step,
      scopes: rootscope([]),
      outputs: {},
      execute: async (dispatched) => {
        seen.push(`${dispatched.value}`);
        return { ok: true, summary: "ok" };
      },
      now,
      resolveelements: async (selector) =>
        selector === "li.row" ? ["li.row:nth-of-type(1)", "li.row:nth-of-type(2)"] : [],
    });
    expect(filled.output.ok).toBe(true);
    expect(seen).toEqual(["element li.row:nth-of-type(1) at 0", "element li.row:nth-of-type(2) at 1"]);
    expect(resolvevariable(filled.scopes, "row")?.kind).toBe("element");

    const empty = await runcontrolstep({
      step,
      scopes: rootscope([]),
      outputs: {},
      execute,
      now,
      resolveelements: async () => [],
    });
    expect(empty.output.ok).toBe(true);
    expect(empty.output.summary).toContain("matched no element and the foreach ran zero iterations");

    await expect(runcontrolstep({ step, scopes: rootscope([]), outputs: {}, execute, now })).rejects.toThrow(
      "element resolver",
    );
  });
});

describe("parallel branches and joins", () => {
  it("runs branches concurrently with isolated scopes and merges their writes at the join", async () => {
    const step = controlstep("p1", "parallel", {
      parallel: {
        branches: [
          {
            id: "one",
            steps: [
              workflowstepof({
                id: "a1",
                kind: "wait",
                label: "Lane one",
                value: "1",
                expression: {
                  left: { literal: 10 },
                  right: { literal: 1 },
                  operator: "add",
                  result: "firsttotal",
                  resultkind: "number",
                },
              }) as workflowstep,
            ],
          },
          {
            id: "two",
            steps: [
              workflowstepof({
                id: "b1",
                kind: "wait",
                label: "Lane two",
                value: "2",
                expression: {
                  left: { literal: 20 },
                  right: { literal: 2 },
                  operator: "add",
                  result: "secondtotal",
                  resultkind: "number",
                },
              }) as workflowstep,
            ],
          },
        ],
        join: { strategy: "last", onfail: "continue" },
      },
    });
    const result = await runcontrolstep({
      step,
      scopes: rootscope([]),
      outputs: {},
      execute: async () => ({ ok: true, summary: "lane ok" }),
      now,
    });
    expect(result.output.ok).toBe(true);
    expect(result.output.summary).toContain("ran 2 concurrent branches");
    expect(resolvevariable(result.scopes, "firsttotal")?.value).toBe(11);
    expect(resolvevariable(result.scopes, "secondtotal")?.value).toBe(22);
    const decision = result.output.details?.control as controlflowdecision;
    expect(decision.kind).toBe("join");
    expect(decision.join?.strategy).toBe("last");
    expect(decision.join?.conflicts).toEqual([]);
    expect(decision.join?.merged).toEqual(["firsttotal", "secondtotal"]);
    expect(decision.branches?.map((outcome) => outcome.branchid)).toEqual(["one", "two"]);
  });

  it("keeps sibling variables invisible across the isolated branch scopes", async () => {
    const step = controlstep("p1", "parallel", {
      parallel: {
        branches: [
          {
            id: "one",
            steps: [
              workflowstepof({
                id: "a1",
                kind: "wait",
                label: "Lane one",
                value: "1",
                expression: {
                  left: { literal: 1 },
                  right: { literal: 1 },
                  operator: "add",
                  result: "sibling",
                  resultkind: "number",
                },
              }) as workflowstep,
            ],
          },
          {
            id: "two",
            steps: [
              workflowstepof({
                id: "b1",
                kind: "wait",
                label: "Read the sibling",
                value: "value ${sibling}",
              }) as workflowstep,
            ],
          },
        ],
        join: { strategy: "last", onfail: "continue" },
      },
    });
    const result = await runcontrolstep({
      step,
      scopes: rootscope([]),
      outputs: {},
      execute: async () => ({ ok: true, summary: "lane ok" }),
      now,
    });
    const decision = result.output.details?.control as controlflowdecision;
    expect(decision.branches?.find((outcome) => outcome.branchid === "two")?.ok).toBe(false);
    expect(result.output.summary).toContain("merged 1 variable");
  });

  it("resolves join conflicts under the first, last and fail strategies", () => {
    const branches = [
      {
        id: "one",
        order: 0,
        ok: true,
        cancelled: false,
        variables: [
          { name: "shared", kind: "string" as const, value: "first lane", setat: now },
          { name: "onlyone", kind: "number" as const, value: 1, setat: now },
        ],
      },
      {
        id: "two",
        order: 1,
        ok: true,
        cancelled: false,
        variables: [{ name: "shared", kind: "string" as const, value: "second lane", setat: now }],
      },
    ];
    const last = joinbranches({ stepid: "p1", branches, strategy: "last", now });
    expect(last.ok).toBe(true);
    expect(last.merged.find((variable) => variable.name === "shared")?.value).toBe("second lane");
    expect(last.conflicts).toEqual(["shared"]);
    expect(last.summary).toContain("resolved by the strategy");
    const first = joinbranches({ stepid: "p1", branches, strategy: "first", now });
    expect(first.ok).toBe(true);
    expect(first.merged.find((variable) => variable.name === "shared")?.value).toBe("first lane");
    const failed = joinbranches({ stepid: "p1", branches, strategy: "fail", now });
    expect(failed.ok).toBe(false);
    expect(failed.conflicts).toEqual(["shared"]);
    expect(failed.summary).toContain("refused the conflicting writes of shared");
    const cancelledbranch = { id: "one", order: 0, ok: true, cancelled: true, variables: branches[0]!.variables };
    const cancelledonly = joinbranches({ stepid: "p1", branches: [cancelledbranch], strategy: "fail", now });
    expect(cancelledonly.ok).toBe(true);
    expect(cancelledonly.merged).toEqual([]);
  });

  it("cancels or continues sibling branches under the reviewed join policy on branch failure", async () => {
    const payload = (onfail: "cancel" | "continue"): workflowstep =>
      controlstep("p1", "parallel", {
        parallel: {
          branches: [
            { id: "one", steps: [childstep("a1", "Failing lane")] },
            {
              id: "two",
              steps: [
                workflowstepof({
                  id: "b1",
                  kind: "wait",
                  label: "Sibling lane",
                  value: "2",
                  expression: {
                    left: { literal: 2 },
                    right: { literal: 2 },
                    operator: "add",
                    result: "siblingtotal",
                    resultkind: "number",
                  },
                }) as workflowstep,
              ],
            },
          ],
          join: { strategy: "last", onfail },
        },
      });
    const failing = async (dispatched: workflowstep): Promise<{ ok: boolean; summary: string }> =>
      dispatched.id === "a1" ? { ok: false, summary: "the lane failed" } : { ok: true, summary: "lane ok" };
    const cancelled = await runcontrolstep({
      step: payload("cancel"),
      scopes: rootscope([]),
      outputs: {},
      execute: failing,
      now,
    });
    expect(cancelled.output.ok).toBe(false);
    expect(cancelled.output.summary).toContain("failed on branch one");
    const decision = cancelled.output.details?.control as controlflowdecision;
    expect(decision.branches?.find((outcome) => outcome.branchid === "two")?.cancelled).toBe(true);
    expect(decision.join?.merged).toEqual([]);

    const continued = await runcontrolstep({
      step: payload("continue"),
      scopes: rootscope([]),
      outputs: {},
      execute: failing,
      now,
    });
    expect(continued.output.ok).toBe(true);
    expect(resolvevariable(continued.scopes, "siblingtotal")?.value).toBe(4);
    const continuedecision = continued.output.details?.control as controlflowdecision;
    expect(continuedecision.branches?.find((outcome) => outcome.branchid === "one")?.ok).toBe(false);
  });

  it("refuses the whole parallel block when the fail strategy meets conflicting writes", async () => {
    const step = controlstep("p1", "parallel", {
      parallel: {
        branches: [
          {
            id: "one",
            steps: [
              workflowstepof({
                id: "a1",
                kind: "wait",
                label: "Lane one",
                value: "1",
                expression: {
                  left: { literal: 1 },
                  right: { literal: 1 },
                  operator: "add",
                  result: "shared",
                  resultkind: "number",
                },
              }) as workflowstep,
            ],
          },
          {
            id: "two",
            steps: [
              workflowstepof({
                id: "b1",
                kind: "wait",
                label: "Lane two",
                value: "2",
                expression: {
                  left: { literal: 2 },
                  right: { literal: 2 },
                  operator: "add",
                  result: "shared",
                  resultkind: "number",
                },
              }) as workflowstep,
            ],
          },
        ],
        join: { strategy: "fail", onfail: "continue" },
      },
    });
    const result = await runcontrolstep({
      step,
      scopes: rootscope([]),
      outputs: {},
      execute: async () => ({ ok: true, summary: "lane ok" }),
      now,
    });
    expect(result.output.ok).toBe(false);
    expect(result.output.summary).toContain("refused the conflicting writes of shared under the fail strategy");
  });
});

describe("try catch with retries and timeouts", () => {
  it("runs the catch handler after a fragile failure and reruns the body once on demand", async () => {
    const step = controlstep("t1", "trycatch", {
      try: { steps: [childstep("f1", "Fragile step")], catch: { steps: [childstep("c1", "Handler step")] } },
    });
    const plain = await runcontrolstep({
      step,
      scopes: rootscope([]),
      outputs: {},
      execute: async (dispatched) =>
        dispatched.id === "f1" ? { ok: false, summary: "the page refused" } : { ok: true, summary: "handled" },
      now,
    });
    expect(plain.output.ok).toBe(true);
    expect(plain.output.summary).toContain("The catch handler ran 1 step after the stepfailed failure");
    const decision = plain.output.details?.control as controlflowdecision;
    expect(decision.kind).toBe("catch");
    expect(decision.catch?.errorclass).toBe("stepfailed");
    expect(decision.catch?.message).toBe("the page refused");
    expect(decision.catch?.rerun).toBe(false);

    const rerunstep = controlstep("t1", "trycatch", {
      try: {
        steps: [childstep("f1", "Fragile step")],
        catch: { steps: [childstep("c1", "Handler step")], rerun: true },
      },
    });
    let attempts = 0;
    const rerun = await runcontrolstep({
      step: rerunstep,
      scopes: rootscope([]),
      outputs: {},
      execute: async (dispatched) => {
        if (dispatched.id === "f1") {
          attempts += 1;
          return { ok: attempts > 1, summary: attempts > 1 ? "recovered" : "flaky" };
        }
        return { ok: true, summary: "handled" };
      },
      now,
    });
    expect(rerun.output.ok).toBe(true);
    expect(rerun.output.summary).toContain("rerun of the try body succeeded");
    expect(attempts).toBe(2);
    const rerundecision = rerun.output.details?.control as controlflowdecision;
    expect(rerundecision.catch?.rerun).toBe(true);
  });

  it("captures the reviewed error class for the handler and fails when the handler fails", async () => {
    const step = controlstep("t1", "trycatch", {
      try: { steps: [childstep("f1", "Fragile step")], catch: { steps: [childstep("c1", "Handler step")] } },
    });
    const classy = await runcontrolstep({
      step,
      scopes: rootscope([]),
      outputs: {},
      execute: async (dispatched) =>
        dispatched.id === "f1"
          ? { ok: false, summary: "the page went away", details: { errorclass: "pageunresponsive" } }
          : { ok: true, summary: "handled" },
      now,
    });
    const classydecision = classy.output.details?.control as controlflowdecision;
    expect(classydecision.catch?.errorclass).toBe("pageunresponsive");

    const failinghandler = await runcontrolstep({
      step,
      scopes: rootscope([]),
      outputs: {},
      execute: async () => ({ ok: false, summary: "handler also failed" }),
      now,
    });
    expect(failinghandler.output.ok).toBe(false);
    expect(failinghandler.output.summary).toContain("catch handler of the try block failed");
  });

  it("retries a failed step under the policy with fixed and exponential backoff shapes", async () => {
    const policy = {
      attempts: 3,
      backoff: { shape: "exponential" as const, base: 10, jitter: 0 },
      retryable: ["pageunresponsive"],
    };
    let calls = 0;
    const recovered = await applyretry({
      stepid: "f1",
      policy,
      now,
      run: async () => {
        calls += 1;
        return { ok: calls >= 3, details: { errorclass: "pageunresponsive" } };
      },
      errorclass: (value) => String(value.details?.errorclass ?? "stepfailed"),
    });
    expect(calls).toBe(3);
    expect(recovered.value.ok).toBe(true);
    expect(recovered.attempts.map((attempt) => attempt.delay)).toEqual([10, 20]);
    expect(recovered.attempts.map((attempt) => attempt.errorclass)).toEqual(["pageunresponsive", "pageunresponsive"]);
    expect(recovered.exhausted).toBe(false);

    let failures = 0;
    const exhausted = await applyretry({
      stepid: "f1",
      policy,
      now,
      run: async () => {
        failures += 1;
        return { ok: false, details: { errorclass: "pageunresponsive" } };
      },
      errorclass: (value) => String(value.details?.errorclass ?? "stepfailed"),
    });
    expect(failures).toBe(3);
    expect(exhausted.exhausted).toBe(true);
    expect(exhausted.value.ok).toBe(false);

    let once = 0;
    const nonretryable = await applyretry({
      stepid: "f1",
      policy,
      now,
      run: async () => {
        once += 1;
        return { ok: false, details: { errorclass: "permissiondenied" } };
      },
      errorclass: (value) => String(value.details?.errorclass ?? "stepfailed"),
    });
    expect(once).toBe(1);
    expect(nonretryable.attempts).toEqual([]);
    expect(nonretryable.exhausted).toBe(false);

    expect(backoffdelay({ attempts: 3, backoff: { shape: "fixed", base: 100, jitter: 0 }, retryable: [] }, 2, 1)).toBe(
      100,
    );
    expect(
      backoffdelay({ attempts: 3, backoff: { shape: "exponential", base: 25, jitter: 0 }, retryable: [] }, 3, 1),
    ).toBe(100);
    for (let seed = 1; seed <= 50; seed += 1) {
      const jittered = backoffdelay(
        { attempts: 3, backoff: { shape: "fixed", base: 100, jitter: 40 }, retryable: [] },
        1,
        seed,
      );
      expect(jittered).toBeGreaterThanOrEqual(80);
      expect(jittered).toBeLessThanOrEqual(120);
    }
  });

  it("runs the retry policy of a try block over its children with the attempts recorded", async () => {
    const step = controlstep("t1", "trycatch", {
      try: {
        steps: [childstep("f1", "Fragile step")],
        catch: { steps: [childstep("c1", "Handler step")] },
        retry: { attempts: 3, backoff: { shape: "fixed", base: 0, jitter: 0 }, retryable: ["pageunresponsive"] },
      },
    });
    let calls = 0;
    const result = await runcontrolstep({
      step,
      scopes: rootscope([]),
      outputs: {},
      execute: async (dispatched) => {
        if (dispatched.id === "f1") {
          calls += 1;
          return {
            ok: calls >= 3,
            summary: calls >= 3 ? "recovered" : "flaky",
            details: { errorclass: "pageunresponsive" },
          };
        }
        return { ok: true, summary: "handled" };
      },
      now,
    });
    expect(result.output.ok).toBe(true);
    expect(result.output.summary).toContain("after 2 retry attempts");
    const decision = result.output.details?.control as controlflowdecision;
    expect(decision.kind).toBe("retry");
    expect(decision.retries?.map((attempt) => attempt.stepid)).toEqual(["f1", "f1"]);
  });

  it("aborts one step that exceeds its per step budget and hands it to the catch handler", async () => {
    const step = controlstep("t1", "trycatch", {
      try: {
        steps: [childstep("f1", "Slow step")],
        catch: { steps: [childstep("c1", "Handler step")] },
        timeout: { stepms: 10 },
      },
    });
    const result = await runcontrolstep({
      step,
      scopes: rootscope([]),
      outputs: {},
      execute: async (dispatched) => {
        if (dispatched.id === "f1") await new Promise((resolve) => setTimeout(resolve, 40));
        return { ok: true, summary: "slow done" };
      },
      now,
    });
    expect(result.output.ok).toBe(true);
    expect(result.output.summary).toContain("catch handler ran");
    const decision = result.output.details?.control as controlflowdecision;
    expect(decision.timeouts).toHaveLength(1);
    expect(decision.timeouts?.[0]?.budget).toBe(10);
    expect(decision.timeouts?.[0]?.scope).toBe("step");
  });

  it("aborts a whole try block that exceeds its per run budget", async () => {
    const step = controlstep("t1", "trycatch", {
      try: {
        steps: [childstep("f1", "Slow one"), childstep("f2", "Slow two"), childstep("f3", "Slow three")],
        catch: { steps: [childstep("c1", "Handler step")] },
        timeout: { runms: 15 },
      },
    });
    const result = await runcontrolstep({
      step,
      scopes: rootscope([]),
      outputs: {},
      execute: async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return { ok: true, summary: "slow done" };
      },
      now,
    });
    expect(result.output.ok).toBe(true);
    const decision = result.output.details?.control as controlflowdecision;
    expect(decision.timeouts?.[0]?.scope).toBe("run");
    expect(result.output.summary).toContain("catch handler ran");
  });

  it("races the run timeout with the cancelled error class and keeps fast runs intact", async () => {
    const fast = await applyruntimeout({ budgetms: 500, run: async () => "value" });
    expect(fast.cancelled).toBe(false);
    if (!fast.cancelled) expect(fast.value).toBe("value");
    const slow = await applyruntimeout({
      budgetms: 5,
      run: async () => {
        await new Promise((resolve) => setTimeout(resolve, 30));
        return "late";
      },
    });
    expect(slow.cancelled).toBe(true);
    if (slow.cancelled) {
      expect(slow.error).toBeInstanceOf(cancellederror);
      expect(slow.error.name).toBe("cancellederror");
      expect(slow.error.message).toContain("exceeded its reviewed budget of 5 milliseconds");
    }
    const guarded = await applytimeout({
      stepid: "f1",
      budgetms: 500,
      run: async () => ({ ok: true, summary: "fast" }),
    });
    expect(guarded.aborted).toBe(false);
    const aborted = await applytimeout({
      stepid: "f1",
      budgetms: 5,
      run: async () => {
        await new Promise((resolve) => setTimeout(resolve, 30));
        return { ok: true, summary: "late" };
      },
    });
    expect(aborted.aborted).toBe(true);
    expect(aborted.output?.details?.errorclass).toBe("timeout");
    expect(aborted.output?.summary).toContain("exceeded its reviewed budget of 5 milliseconds");
    expect(aborted.abort?.budget).toBe(5);
  });
});

describe("control flow policy", () => {
  const step = (kind: toolstep["kind"], options: Record<string, unknown>): toolstep => ({
    id: "w1",
    kind,
    summary: "Reviewed control step",
    risk: actionrisk(kind),
    options: JSON.stringify(options),
  });
  const listbody = {
    list: "items",
    item: "item",
    index: "index",
    bound: 5,
    steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }],
  };
  const branchbody = {
    paths: [
      {
        name: "fast",
        when: {
          left: { ref: "count" },
          right: { literal: 1 },
          operator: "equal",
          result: "isfast",
          resultkind: "boolean",
        },
        steps: [{ id: "b1", kind: "readtext", label: "Fast", target: "h1" }],
      },
    ],
    else: { name: "slow", steps: [] },
  };

  it("validates the control grammar of every kind before any review", () => {
    expect(
      validatestep(
        step("condition", {
          condition: { expression: { left: { ref: "ready" }, operator: "not", result: "stop", resultkind: "boolean" } },
        }),
        "https://example.com",
      ),
    ).toEqual({ allowed: true });
    expect(
      validatestep(
        step("condition", {
          condition: {
            expression: {
              left: { literal: 1 },
              right: { literal: 1 },
              operator: "add",
              result: "n",
              resultkind: "number",
            },
          },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false });
    expect(validatestep(step("branch", { branch: branchbody }), "https://example.com")).toEqual({ allowed: true });
    expect(
      validatestep(
        step("branch", {
          branch: { paths: [{ name: "only", steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }] }] },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("else path") });
    expect(validatestep(step("loop", { loop: listbody }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(step("loop", { loop: { ...listbody, item: "items" } }), "https://example.com")).toMatchObject({
      allowed: false,
    });
    expect(
      validatestep(
        step("repeatuntil", {
          repeatuntil: {
            until: {
              left: { ref: "count" },
              right: { literal: 1 },
              operator: "greaterequal",
              result: "done",
              resultkind: "boolean",
            },
            steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }],
          },
        }),
        "https://example.com",
      ),
    ).toEqual({ allowed: true });
    expect(
      validatestep(
        step("whileloop", {
          while: {
            while: { left: { literal: true }, operator: "not", result: "go", resultkind: "boolean" },
            bound: 4,
            steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }],
          },
        }),
        "https://example.com",
      ),
    ).toEqual({ allowed: true });
    expect(
      validatestep(
        step("whileloop", {
          while: {
            while: { left: { literal: true }, operator: "not", result: "go", resultkind: "boolean" },
            steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }],
          },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("safety bound") });
    expect(
      validatestep(
        step("foreach", {
          foreach: {
            selector: "li",
            item: "row",
            index: "rowindex",
            steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }],
          },
        }),
        "https://example.com",
      ),
    ).toEqual({ allowed: true });
    expect(
      validatestep(
        step("parallel", {
          parallel: {
            branches: [{ id: "one", steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }] }],
            join: { strategy: "first", onfail: "continue" },
          },
        }),
        "https://example.com",
      ),
    ).toEqual({ allowed: true });
    expect(
      validatestep(
        step("parallel", {
          parallel: {
            branches: [{ id: "one", steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }] }],
            join: { strategy: "bogus", onfail: "continue" },
          },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false });
    expect(
      validatestep(
        step("trycatch", {
          try: {
            steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }],
            catch: { steps: [{ id: "c1", kind: "wait", label: "Handle", value: "1" }] },
            retry: { attempts: 4, backoff: { shape: "exponential", base: 50, jitter: 10 }, retryable: ["timeout"] },
            timeout: { stepms: 3000 },
          },
        }),
        "https://example.com",
      ),
    ).toEqual({ allowed: true });
    expect(
      validatestep(
        step("trycatch", {
          try: {
            steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }],
            catch: { steps: [{ id: "c1", kind: "wait", label: "Handle", value: "1" }] },
            timeout: { stepms: -1 },
          },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false });
    expect(validatestep(step("loop", {}), "https://example.com")).toMatchObject({ allowed: false });
  });

  it("refuses control payloads that hide an unreviewed child kind behind their bodies", () => {
    expect(
      validatestep(
        step("loop", {
          loop: {
            list: "items",
            item: "item",
            index: "index",
            steps: [{ id: "b1", kind: "explode", label: "Ghost kind" }],
          },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("not a reviewed action kind") });
    expect(
      validatestep(
        step("branch", {
          branch: {
            paths: [{ name: "only", steps: [{ id: "b1", kind: "explode", label: "Ghost kind" }] }],
            else: { name: "else", steps: [] },
          },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("not a reviewed action kind") });
    expect(
      validatestep(
        step("trycatch", {
          try: {
            steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }],
            catch: { steps: [{ id: "c1", kind: "explode", label: "Ghost kind" }] },
          },
        }),
        "https://example.com",
      ),
    ).toMatchObject({ allowed: false, reason: expect.stringContaining("not a reviewed action kind") });
  });

  it("grades a composed workflow with control steps by its worst child kind", () => {
    const readonly = composeworkflow({
      name: "reader",
      version: 1,
      origins: ["https://example.com"],
      steps: [
        controlstep("l1", "loop", {
          loop: { ...listbody, steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }] },
        }),
      ] as never,
      now,
      kindallowed,
      riskof,
    });
    expect(readonly.risk).toBe("interaction");
    const mutating = composeworkflow({
      name: "writer",
      version: 1,
      origins: ["https://example.com"],
      steps: [
        controlstep("b1", "branch", {
          branch: {
            paths: [{ name: "only", steps: [{ id: "c1", kind: "click", label: "Click", target: "#submit" }] }],
            else: { name: "else", steps: [] },
          },
        }),
      ] as never,
      now,
      kindallowed,
      riskof,
    });
    expect(mutating.risk).toBe("sensitive");
    expect(() =>
      composeworkflow({
        name: "ghost",
        version: 1,
        origins: ["https://example.com"],
        steps: [controlstep("l1", "loop", { loop: { list: "items", item: "item", index: "index" } })] as never,
        now,
        kindallowed,
        riskof,
      }),
    ).toThrow("loop step needs");
    expect(() =>
      composeworkflow({
        name: "ghost",
        version: 1,
        origins: ["https://example.com"],
        steps: [
          controlstep("l1", "loop", { loop: { ...listbody, steps: [{ id: "b1", kind: "explode", label: "Ghost" }] } }),
        ] as never,
        now,
        kindallowed,
        riskof,
      }),
    ).toThrow("not a reviewed action kind");
  });

  it("projects control steps for dry runs only when every child step grades read", () => {
    expect(
      dryrunprojection(
        controlstep("c1", "condition", {
          condition: { expression: { left: { ref: "ready" }, operator: "not", result: "stop", resultkind: "boolean" } },
        }),
      ),
    ).toContain("no page side effect");
    expect(
      dryrunprojection(
        controlstep("l1", "loop", {
          loop: { ...listbody, steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }] },
        }),
      ),
    ).toContain("safety bound");
    expect(
      dryrunprojection(
        controlstep("p1", "parallel", {
          parallel: {
            branches: [{ id: "one", steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }] }],
            join: { strategy: "first", onfail: "continue" },
          },
        }),
      ),
    ).toContain("join their outcomes");
    expect(
      dryrunprojection(
        controlstep("t1", "trycatch", {
          try: {
            steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }],
            catch: { steps: [{ id: "c1", kind: "wait", label: "Handle", value: "1" }] },
          },
        }),
      ),
    ).toContain("catch handler");
    expect(
      dryrunprojection(
        controlstep("l1", "loop", {
          loop: { ...listbody, steps: [{ id: "b1", kind: "click", label: "Click", target: "#submit" }] },
        }),
      ),
    ).toBeUndefined();
    expect(
      dryrunprojection(
        controlstep("t1", "trycatch", {
          try: {
            steps: [{ id: "b1", kind: "click", label: "Click", target: "#submit" }],
            catch: { steps: [{ id: "c1", kind: "wait", label: "Handle", value: "1" }] },
          },
        }),
      ),
    ).toBeUndefined();
  });
});

describe("control flow inside the run loop", () => {
  it("runs a control step as a workflow step adopting its child runlog and merged scopes", async () => {
    const record = composeworkflow({
      name: "controlled",
      version: 1,
      origins: ["https://example.com"],
      steps: [
        controlstep("l1", "loop", {
          loop: {
            list: "items",
            item: "item",
            index: "index",
            bound: 4,
            steps: [
              workflowstepof({
                id: "b1",
                kind: "readtext",
                label: "Read the row",
                target: 'li[data-id="${item}"]',
              }) as workflowstep,
            ],
          },
        }),
        { id: "s2", kind: "wait", label: "Final wait", value: "10" },
      ] as never,
      now,
      kindallowed,
      riskof,
    });
    const seen: string[] = [];
    const baseexecute = async (dispatched: workflowstep): Promise<{ ok: boolean; summary: string }> => {
      seen.push(`${dispatched.id}:${dispatched.target ?? ""}`);
      return { ok: true, summary: "ok" };
    };
    const result = await runworkflow({
      record,
      run: newworkflowrun({ id: "run1", workflowid: record.id, now }),
      scopes: rootscope([{ name: "items", kind: "list", value: ["x", "y"] }]),
      execute: controlexecutor(baseexecute) as never,
      now,
      gates: { sessionactive: true, planapproved: true, origingranted: () => true },
    });
    expect(result.run.state).toBe("done");
    expect(result.run.cursor).toBe(2);
    expect(seen).toEqual(['b1:li[data-id="x"]', 'b1:li[data-id="y"]', "s2:"]);
    expect(result.log.map((entry) => entry.stepid)).toEqual(["b1", "l1", "b1", "l1", "l1", "s2"]);
    expect(result.log.every((entry) => entry.state === "done")).toBe(true);
  });

  it("fails the run at a failing control step without advancing the checkpoint", async () => {
    const record = composeworkflow({
      name: "failing",
      version: 1,
      origins: ["https://example.com"],
      steps: [
        controlstep("l1", "loop", {
          loop: {
            list: "items",
            item: "item",
            index: "index",
            steps: [{ id: "b1", kind: "wait", label: "Body", value: "10" }],
          },
        }),
        { id: "s2", kind: "wait", label: "Never reached", value: "10" },
      ] as never,
      now,
      kindallowed,
      riskof,
    });
    const result = await runworkflow({
      record,
      run: newworkflowrun({ id: "run1", workflowid: record.id, now }),
      scopes: rootscope([{ name: "items", kind: "list", value: ["x"] }]),
      execute: controlexecutor(async () => ({ ok: false, summary: "the row refused" })) as never,
      now,
      gates: { sessionactive: true, planapproved: true, origingranted: () => true },
    });
    expect(result.run.state).toBe("failed");
    expect(result.run.cursor).toBe(0);
    expect(result.run.failreason).toContain("failed at iteration 1");
  });

  it("keeps control steps inside the session, plan and origin gates", async () => {
    const record = composeworkflow({
      name: "gated",
      version: 1,
      origins: ["https://example.com"],
      steps: [
        controlstep("c1", "condition", {
          condition: {
            expression: { left: { literal: true }, operator: "not", result: "stop", resultkind: "boolean" },
          },
        }),
      ] as never,
      now,
      kindallowed,
      riskof,
    });
    const run = newworkflowrun({ workflowid: record.id, now });
    await expect(
      runworkflow({
        record,
        run,
        execute: controlexecutor(async () => ({ ok: true, summary: "x" })) as never,
        now,
        gates: { sessionactive: false, planapproved: true, origingranted: () => true },
      }),
    ).rejects.toThrow("approved session");
    await expect(
      runworkflow({
        record,
        run,
        execute: controlexecutor(async () => ({ ok: true, summary: "x" })) as never,
        now,
        gates: { sessionactive: true, planapproved: false, origingranted: () => true },
      }),
    ).rejects.toThrow("approved plan");
    await expect(
      runworkflow({
        record,
        run,
        execute: controlexecutor(async () => ({ ok: true, summary: "x" })) as never,
        now,
        gates: { sessionactive: true, planapproved: true, origingranted: () => false },
      }),
    ).rejects.toThrow("outside the session grants");
  });

  it("runs one control step in isolation outside the run loop", async () => {
    const step = controlstep("c1", "condition", {
      condition: {
        expression: {
          left: { ref: "count" },
          right: { literal: 3 },
          operator: "greaterequal",
          result: "done",
          resultkind: "boolean",
        },
      },
    });
    const executed = await runstep({
      step,
      scopes: rootscope([{ name: "count", kind: "number", value: 5 }]),
      outputs: {},
      execute: controlexecutor(async () => ({ ok: true, summary: "never" })) as never,
      now,
    });
    expect(executed.output.ok).toBe(true);
    expect(executed.output.summary).toContain("holds over the extracted values");
    expect(resolvevariable(executed.scopes, "done")?.value).toBe(true);
    expect(executed.log.checkpoint).toBe(true);
  });
});

describe("control flow protocol", () => {
  it("carries the control grammar summaries through a workflow proposal", () => {
    const proposal = parseworkflowproposal(
      {
        version: protocolversion,
        workflow: {
          name: "controlled",
          version: 1,
          origins: ["https://example.com"],
          steps: [
            controlstep("c1", "condition", {
              condition: {
                expression: { left: { literal: true }, operator: "not", result: "stop", resultkind: "boolean" },
              },
            }),
            controlstep("l1", "loop", {
              loop: {
                list: "items",
                item: "item",
                index: "index",
                bound: 12,
                steps: [{ id: "b1", kind: "readtext", label: "Read", target: "h1" }],
              },
            }),
            controlstep("t1", "trycatch", {
              try: {
                steps: [{ id: "f1", kind: "readtext", label: "Read", target: "p" }],
                catch: { steps: [{ id: "c1", kind: "wait", label: "Handle", value: "1" }] },
              },
            }),
            { id: "s2", kind: "wait", label: "Plain wait", value: "5" },
          ],
          blocks: [],
        },
      },
      "https://example.com",
      ["https://example.com"],
    );
    expect(proposal.control).toHaveLength(3);
    expect(proposal.control?.[0]).toMatchObject({ stepid: "c1", summary: { kind: "condition" } });
    expect(proposal.control?.[1]?.summary).toMatchObject({ kind: "loop", bound: 12 });
    expect(proposal.control?.[2]?.summary).toMatchObject({ kind: "trycatch" });
    const plain = parseworkflowproposal(
      {
        version: protocolversion,
        workflow: {
          name: "plain",
          version: 1,
          origins: ["https://example.com"],
          steps: [{ id: "s1", kind: "wait", label: "Wait", value: "5" }],
        },
      },
      "https://example.com",
    );
    expect(plain.control).toBeUndefined();
  });

  it("carries branch outcomes, loop counters, retries and timeout aborts through the outcome envelope", () => {
    const run = { ...newworkflowrun({ id: "run1", workflowid: "wf1", now }), state: "done" as const };
    const decision: controlflowdecision = {
      runid: "run1",
      stepid: "l1",
      kind: "loop",
      at: now,
      loops: [{ stepid: "l1", path: "l1[0]", iteration: 0, ok: true, at: now }],
    };
    const entries: runlogentry[] = [
      {
        stepid: "l1",
        label: "The loop step",
        state: "done",
        startedat: now,
        duration: 9,
        summary: "The loop ran 1 iteration.",
        checkpoint: true,
        details: { control: decision },
      },
      { stepid: "s2", label: "Plain", state: "done", startedat: now + 5, duration: 1, summary: "ok" },
    ];
    const outcome = workflowoutcome({ run, entries });
    expect(outcome.steps[0]?.control).toEqual(decision);
    expect(outcome.steps[1]?.control).toBeUndefined();
    const single = workflowoutcome({ run, entries, stepid: "l1" });
    expect(single.steps).toHaveLength(1);
    expect(single.steps[0]?.control?.kind).toBe("loop");
    const report = workflowreport({ workflows: [], runs: [run], templates: [], control: [decision] });
    expect(report.control).toEqual([decision]);
    expect(workflowreport({ workflows: [], runs: [], templates: [] }).control).toEqual([]);
  });

  it("reports timeout aborts and retry exhaustion distinctly in the response envelope", () => {
    const planapproved: agentplan = { ...plan, state: "approved" };
    const timeout: timeoutabort = { stepid: "f1", budget: 5000, scope: "step", at: now };
    const response = JSON.parse(
      outcomeresponse({
        outcome: { stepid: "w1", ok: false, summary: "The run failed after retries.", at: now },
        plan: planapproved,
        workflow: {
          runid: "run1",
          state: "failed",
          produced: ["count"],
          consumed: ["items"],
          timeout,
          retry: { stepid: "f1", attempts: 3, exhausted: true },
        },
      }),
    ) as { workflow?: { timeout?: timeoutabort; retry?: { attempts: number; exhausted: boolean } } };
    expect(response.workflow?.timeout).toEqual(timeout);
    expect(response.workflow?.retry).toEqual({ stepid: "f1", attempts: 3, exhausted: true });
    const clean = JSON.parse(
      outcomeresponse({
        outcome: { stepid: "w1", ok: true, summary: "done", at: now },
        plan: planapproved,
        workflow: { runid: "run2", state: "done", produced: [], consumed: [] },
      }),
    ) as { workflow?: { timeout?: unknown; retry?: unknown } };
    expect(clean.workflow?.timeout).toBeUndefined();
    expect(clean.workflow?.retry).toBeUndefined();
  });
});

describe("control flow memory and progress", () => {
  it("stores branch, loop, retry, timeout and join decisions and returns the branch history of a workflow", async () => {
    const store = new sessionmemory(new fakeadapter());
    const decisions: controlflowdecision[] = [
      {
        runid: "run1",
        stepid: "b1",
        kind: "branch",
        at: now,
        branch: { stepid: "b1", path: "fast", reason: "The condition of the path fast holds.", at: now },
      },
      {
        runid: "run1",
        stepid: "l1",
        kind: "loop",
        at: now + 1,
        loops: [{ stepid: "l1", path: "l1[0]", iteration: 0, ok: true, at: now + 1 }],
      },
      {
        runid: "run1",
        stepid: "t1",
        kind: "retry",
        at: now + 2,
        retries: [{ stepid: "f1", attempt: 2, delay: 20, errorclass: "pageunresponsive", at: now + 2 }],
      },
      {
        runid: "run1",
        stepid: "t1",
        kind: "timeout",
        at: now + 3,
        timeouts: [{ stepid: "f1", budget: 5000, scope: "step", at: now + 3 }],
      },
      {
        runid: "run1",
        stepid: "p1",
        kind: "join",
        at: now + 4,
        join: { stepid: "p1", strategy: "last", conflicts: ["shared"], merged: ["shared"], at: now + 4 },
      },
    ];
    for (const decision of decisions) await store.addcontroldecision("run1", decision);
    expect((await store.listcontroldecisions("run1")).map((decision) => decision.kind)).toEqual([
      "branch",
      "loop",
      "retry",
      "timeout",
      "join",
    ]);
    expect(await store.listcontroldecisions("missing")).toEqual([]);
    const retryattempt: retryattempt = { stepid: "f1", attempt: 2, delay: 20, errorclass: "pageunresponsive", at: now };
    expect(retryattempt.delay).toBe(20);
    await store.setworkflowrun({
      id: "run1",
      workflowid: "wf1",
      state: "done",
      cursor: 1,
      startedat: now,
      endedat: now + 5,
    });
    await store.setworkflowrun({
      id: "run2",
      workflowid: "wf1",
      state: "done",
      cursor: 1,
      startedat: now + 10,
      endedat: now + 15,
    });
    await store.setworkflowrun({
      id: "run3",
      workflowid: "wf2",
      state: "done",
      cursor: 1,
      startedat: now + 20,
      endedat: now + 25,
    });
    await store.addcontroldecision("run2", {
      runid: "run2",
      stepid: "b1",
      kind: "branch",
      at: now + 11,
      branch: { stepid: "b1", path: "slow", reason: "No path condition held and the else path ran.", at: now + 11 },
    });
    const history = await store.getbranchhistory("wf1");
    expect(history.map((outcome) => outcome.path)).toEqual(["fast", "slow"]);
    expect(await store.getbranchhistory("wf2")).toEqual([]);
  });

  it("counts loop iterations toward the user defined denominator in progress", () => {
    let progress = recordworkflow(
      undefined,
      "run",
      "w1",
      {
        family: "control",
        detail: "The control flow steps ran their loops",
        runid: "run1",
        iterations: 7,
        denominator: 10,
      },
      now,
    );
    const evidence = workflowevidences(progress, "run", "w1");
    expect(evidence[0]?.family).toBe("control");
    expect(evidence[0]?.iterations).toBe(7);
    expect(evidence[0]?.denominator).toBe(10);
    expect((progress.outcomes ?? [])[0]?.summary).toContain("7 iterations");
    expect((progress.outcomes ?? [])[0]?.summary).toContain("denominator 10");
    expect(loopshare(7, 10)).toBe(0.7);
    expect(loopshare(12, 10)).toBe(1);
    expect(loopshare(3, 0)).toBe(0);
    expect(workflowevidences(progress, "other", "w1")).toEqual([]);
  });
});
