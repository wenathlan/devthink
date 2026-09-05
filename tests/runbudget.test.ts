import { describe, expect, it } from "vitest";
import { budgetalertstate, runbudgetof, runpausesforalerts, timeoutcanceldecision, timeoutcanceleventof, timeoutcancelpolicies } from "../run.js";
import { budgetthresholdsvalid, runbudgetvalid, timeoutboundvalid, timeoutrecordeventgate } from "../policy.js";
import { sessionmemory } from "../memory.js";

const now = 1_800_000_000_000;

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> { return this.data.get(key) as T | undefined; }
  async set<T>(key: string, value: T): Promise<void> { this.data.set(key, value); }
}

describe("runbudget tracking", () => {
  it("tracks the step usage and the memory pressure of one run against the user budgets", () => {
    const budget = runbudgetof({ runid: "run1", steps: 8, stepbudget: 10, pressure: 0.75, memorybudget: 0.8, now });
    expect(budget).toEqual({ runid: "run1", steps: 8, stepbudget: 10, pressure: 0.75, memorybudget: 0.8, at: now });
    expect(runbudgetof({ runid: "run1", steps: 3, pressure: 1.5, now }).pressure).toBe(1);
    expect(() => runbudgetof({ runid: " ", steps: 1, pressure: 0, now })).toThrow(/run id/i);
    expect(runbudgetvalid({ stepbudget: 10, memorybudget: 0.8 }).allowed).toBe(true);
    expect(runbudgetvalid({}).reason).toMatch(/informational/i);
    expect(runbudgetvalid({ stepbudget: 0 }).allowed).toBe(false);
    expect(runbudgetvalid({ memorybudget: 2 }).allowed).toBe(false);
  });

  it("fires budgetalerts at the user thresholds with severity levels and pauses only at the critical level", () => {
    const budget = runbudgetof({ runid: "run1", steps: 9, stepbudget: 10, pressure: 0.95, memorybudget: 0.8, now });
    const alerts = budgetalertstate({ budget, thresholds: { warning: 0.8, critical: 0.9 } });
    expect(alerts).toHaveLength(2);
    expect(alerts.every(alert => alert.level === "critical")).toBe(true);
    expect(alerts.every(alert => alert.paused)).toBe(true);
    expect(runpausesforalerts(alerts)).toBe(true);
    const warning = budgetalertstate({ budget: runbudgetof({ runid: "run1", steps: 5, stepbudget: 10, pressure: 0.5, memorybudget: 0.8, now }), thresholds: { warning: 0.8, critical: 0.9 } });
    expect(warning).toHaveLength(0);
    const mixed = budgetalertstate({ budget: runbudgetof({ runid: "run1", steps: 5, stepbudget: 6, pressure: 0.5, memorybudget: 0.8, now }), thresholds: { warning: 0.8, critical: 0.9 } });
    expect(mixed).toHaveLength(1);
    expect(mixed[0]?.level).toBe("warning");
    expect(mixed[0]?.paused).toBe(false);
    expect(runpausesforalerts(mixed)).toBe(false);
    expect(budgetthresholdsvalid({ thresholds: { warning: 0.8, critical: 0.9 } }).allowed).toBe(true);
    expect(budgetthresholdsvalid({ thresholds: { warning: 0.9, critical: 0.8 } }).allowed).toBe(false);
    expect(budgetthresholdsvalid({}).reason).toMatch(/informational/i);
  });

  it("stores the runbudget records and the budgetalerts of the profile workspace", async () => {
    const store = new sessionmemory(new fakeadapter());
    const budget = runbudgetof({ runid: "run1", steps: 5, stepbudget: 10, pressure: 0.5, memorybudget: 0.8, now });
    await store.addrunbudget(budget);
    await store.addrunbudget(runbudgetof({ runid: "run2", steps: 1, pressure: 0, now }));
    expect((await store.getrunbudgets())).toHaveLength(2);
    await store.addrunbudget(runbudgetof({ runid: "run1", steps: 6, stepbudget: 10, pressure: 0.5, memorybudget: 0.8, now }));
    const latest = (await store.getrunbudgets()).find(record => record.runid === "run1");
    expect(latest?.steps).toBe(6);
    const alert = budgetalertstate({ budget: latest!, thresholds: { critical: 0.5 } })[0]!;
    await store.addbudgetalert(alert);
    expect((await store.getbudgetalerts())).toHaveLength(1);
    expect((await store.getbudgetalerts())[0]?.paused).toBe(true);
  });
});

describe("timeoutcancel", () => {
  it("aborts a slow step at the user chosen bound and never aborts without one", () => {
    expect(timeoutcanceldecision({ elapsed: 300, bound: 500 }).abort).toBe(false);
    const aborted = timeoutcanceldecision({ elapsed: 700, bound: 500 });
    expect(aborted.abort).toBe(true);
    expect(aborted.reason).toMatch(/aborts/i);
    expect(timeoutcanceldecision({ elapsed: 700 }).abort).toBe(false);
    expect(timeoutboundvalid({ bound: 500 }).reason).toMatch(/immutable log/i);
    expect(timeoutboundvalid({}).reason).toMatch(/never abort/i);
    expect(timeoutboundvalid({ bound: 0 }).allowed).toBe(false);
  });

  it("records the cancel event beside the step outcome and requires its immutable log entry", () => {
    const event = timeoutcanceleventof({ runid: "run1", stepid: "s1", bound: 500, elapsed: 700, now, logged: true });
    expect(event.logged).toBe(true);
    expect(event.bound).toBe(500);
    expect(() => timeoutcanceleventof({ runid: " ", stepid: "s1", bound: 1, elapsed: 1, now, logged: true })).toThrow(/run id/i);
    expect(() => timeoutcanceleventof({ runid: "run1", stepid: " ", bound: 1, elapsed: 1, now, logged: true })).toThrow(/step id/i);
    expect(timeoutrecordeventgate({ event: { logged: true, stepid: "s1" } }).allowed).toBe(true);
    expect(timeoutrecordeventgate({ event: { logged: false, stepid: "s1" } }).allowed).toBe(false);
    expect(timeoutrecordeventgate({ event: { logged: false, stepid: "s1" } }).reason).toMatch(/immutable log/i);
    const policies = timeoutcancelpolicies({ steps: ["s1", "s2"], bound: 500 });
    expect(policies).toEqual([{ stepid: "s1", bound: 500 }, { stepid: "s2", bound: 500 }]);
    expect(timeoutcancelpolicies({ steps: ["s1"] })[0]?.bound).toBeUndefined();
  });

  it("stores the timeoutcancel events of the profile workspace", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addtimeoutevent(timeoutcanceleventof({ runid: "run1", stepid: "s1", bound: 500, elapsed: 700, now, logged: true }));
    const events = await store.gettimeoutevents();
    expect(events).toHaveLength(1);
    expect(events[0]?.stepid).toBe("s1");
    expect(timeoutrecordeventgate({ event: { logged: events[0]!.logged, stepid: events[0]!.stepid } }).allowed).toBe(true);
  });
});
