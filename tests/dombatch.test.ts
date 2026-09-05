import { describe, expect, it } from "vitest";
import { batchqueryplanof, batchquerysavings, batchquerytaskof, coalescedombursts, debounceprofilesof, mutationbatchof, runbatchquery } from "../perf.js";
import { batchqueryplangate, debouncewindowvalid } from "../policy.js";

const now = 1_800_000_000_000;

describe("debouncedom coalescing across event storms", () => {
  it("builds the debounce profiles of the user configured windows only", () => {
    const profiles = debounceprofilesof({ scroll: 100, input: 50 });
    expect(profiles).toEqual([{ kind: "scroll", window: 100 }, { kind: "input", window: 50 }]);
    expect(debounceprofilesof({})).toEqual([]);
  });

  it("coalesces scroll, input and resize storms per window and closes the batch when the window elapses", () => {
    const profiles = [{ kind: "scroll" as const, window: 100 }, { kind: "input" as const, window: 200 }];
    const events = [
      { kind: "scroll" as const, at: now }, { kind: "scroll" as const, at: now + 40 }, { kind: "scroll" as const, at: now + 80 },
      { kind: "input" as const, at: now }, { kind: "input" as const, at: now + 250 },
    ];
    const batches = coalescedombursts({ events, profiles, now: now + 90 });
    const scroll = batches.find(batch => batch.kind === "scroll");
    expect(scroll?.count).toBe(3);
    expect(scroll?.closed).toBe(false);
    const inputbatches = batches.filter(batch => batch.kind === "input");
    expect(inputbatches).toHaveLength(2);
    expect(inputbatches[0]?.count).toBe(1);
    expect(inputbatches[0]?.closed).toBe(true);
    const closed = coalescedombursts({ events, profiles, now: now + 500 }).filter(batch => batch.kind === "scroll");
    expect(closed[0]?.closed).toBe(true);
  });

  it("debounces one rapid mutation burst of the dom observer into a single batch", () => {
    const burst = mutationbatchof({ mutations: [{ at: now }, { at: now + 5 }, { at: now + 9 }], window: 100, now: now + 10 });
    expect(burst.kind).toBe("mutation");
    expect(burst.count).toBe(3);
    expect(burst.closed).toBe(false);
    const spread = mutationbatchof({ mutations: [{ at: now }, { at: now + 500 }], window: 100, now: now + 600 });
    expect(spread.closed).toBe(true);
    const unbounded = mutationbatchof({ mutations: [{ at: now }, { at: now + 9999 }], now: now + 10000 });
    expect(unbounded.closed).toBe(true);
    expect(unbounded.count).toBe(2);
  });

  it("validates the windows as user choices with no engine default", () => {
    expect(debouncewindowvalid({ kind: "scroll", window: 100 }).allowed).toBe(true);
    expect(debouncewindowvalid({ kind: "scroll" }).allowed).toBe(true);
    expect(debouncewindowvalid({ kind: "scroll" }).reason).toMatch(/pass through uncoalesced/i);
    expect(debouncewindowvalid({ kind: "input", window: 0 }).allowed).toBe(false);
    expect(debouncewindowvalid({ kind: "input", window: -5 }).allowed).toBe(false);
  });
});

describe("batchquery folding of repeated selectors", () => {
  it("folds repeated selectors into one pass of distinct selectors", () => {
    const plan = batchqueryplanof(["#a", "#b", "#a", "#c", "#b", "#a"]);
    expect(plan.selectors).toEqual(["#a", "#b", "#c"]);
    expect(plan.folded).toBe(3);
    expect(plan.onepass).toBe(true);
    expect(batchqueryplangate(plan).allowed).toBe(true);
    expect(batchqueryplangate({ selectors: ["#a", "#a"], folded: 0, onepass: true }).allowed).toBe(false);
    expect(batchqueryplangate({ selectors: ["#a"], folded: 0, onepass: false }).allowed).toBe(false);
    expect(batchqueryplangate({ selectors: [], folded: 0, onepass: true }).allowed).toBe(false);
  });

  it("executes the grouped selectors in one pass with one resolver call per distinct selector", () => {
    const calls: string[] = [];
    const pass = runbatchquery({ plan: batchqueryplanof(["#a", "#b", "#a"]), resolver: selector => { calls.push(selector); return `resolved:${selector}`; } });
    expect(calls).toEqual(["#a", "#b"]);
    expect(pass.queries).toBe(2);
    expect(pass.resolutions).toEqual({ "#a": "resolved:#a", "#b": "resolved:#b" });
    const savings = batchquerysavings(batchqueryplanof(["#a", "#a", "#a"]));
    expect(savings).toEqual({ distinct: 1, folded: 2, saved: 2 });
  });

  it("shapes the plan into one offscreen worker task payload", () => {
    const task = batchquerytaskof({ plan: batchqueryplanof(["#a", "#b", "#a"]), runid: "run1", stepid: "s1" });
    expect(task.task).toBe("batchquery");
    expect(task.selectors).toEqual(["#a", "#b"]);
    expect(task.folded).toBe(1);
    expect(task.runid).toBe("run1");
  });
});
