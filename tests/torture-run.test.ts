import { describe, expect, it } from "vitest";
import {
  acquirerunlock, advancerun, beatrun, budgetalertstate, cancelrollback, checkpointisvalid,
  closerun, dequeueoffline, enqueueoffline, expirerunlocks, heartbeatwindowof, heartbeatisstale, initialrun,
  makecheckpoint, openrun, reattachrun, recordenvironment, recordturnaround, recordurl, recoveryplan,
  releaserunlock, replayqueue, resumecheckpoint, rollbackrun, runbudgetof, runcomplete, runfail, runfromplan,
  runheartbeat, runpausesforalerts, runstatemachine, serializesteps, sideeffects, stepkey, timeoutcanceldecision,
  transitionislegal, zombiecheck, zombiesweep,
} from "../run.js";
import type { agentplan, heartbeatrecord, planprogress, runrecord, runsettings, toolstep } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one minimal approved plan fixture. */
function plan(over: Partial<agentplan> = {}): agentplan {
  return { id: "p1", objective: "Check the pricing page", origin: "https://example.com", steps: [], createdat: now - 1000, expiresat: now + 60_000, state: "approved", ...over };
}

/** Builds one queued run fixture. */
function run(over: Partial<runrecord> = {}): runrecord {
  return { runid: "r1", planid: "p1", sessionid: "s1", state: "queued", createdat: now, updatedat: now, ...over };
}

/** Builds one heartbeat fixture. */
function beat(over: Partial<heartbeatrecord> = {}): heartbeatrecord {
  return { runid: "r1", beat: 1, at: now, ...over };
}

/** Builds one read only step fixture. */
function readstep(id: string, over: Partial<toolstep> = {}): toolstep {
  return { id, kind: "readtext", summary: `read ${id}`, risk: "read", ...over };
}

/** Builds one mutating step fixture. */
function writestep(id: string, over: Partial<toolstep> = {}): toolstep {
  return { id, kind: "type", target: "#field", value: "x", summary: `type ${id}`, risk: "interaction", ...over };
}

describe("torture: run lifecycle state machine", () => {
  it("refuses every illegal transition from every terminal state", () => {
    for (const to of ["queued", "running", "paused", "awaitingapproval", "completed", "failed", "cancelled", "rolledback"] as const) {
      expect(() => advancerun(run({ state: "completed" }), to, now)).toThrow(/cannot move/i);
      expect(() => advancerun(run({ state: "rolledback" }), to, now)).toThrow(/cannot move/i);
    }
    expect(() => advancerun(run({ state: "failed" }), "completed", now)).toThrow(/cannot move/i);
    expect(() => advancerun(run({ state: "cancelled" }), "running", now)).toThrow(/cannot move/i);
    expect(() => advancerun(run({ state: "failed" }), "failed", now)).toThrow(/cannot move/i);
  });

  it("accepts every legal transition the machine declares and only those", () => {
    const machine = runstatemachine();
    for (const [from, targets] of Object.entries(machine)) {
      for (const to of targets) {
        expect(transitionislegal({ from: from as never, to: to as never })).toBe(true);
        const moved = advancerun(run({ state: from as never }), to, now);
        expect(moved.state).toBe(to);
        expect(moved.updatedat).toBe(now);
      }
    }
  });

  it("keeps the record immutable through transitions", () => {
    const original = run();
    const moved = advancerun(original, "running", now);
    expect(original.state).toBe("queued");
    expect(moved.runid).toBe("r1");
    expect(moved).not.toBe(original);
  });

  it("refuses blank ids when creating runs and steps", () => {
    expect(() => initialrun({ planid: "", sessionid: "s1", now })).toThrow(/plan id/i);
    expect(() => initialrun({ planid: "  ", sessionid: "s1", now })).toThrow(/plan id/i);
    expect(() => initialrun({ planid: "p1", sessionid: "", now })).toThrow(/session id/i);
    expect(() => stepkey({ planid: "", stepid: "s1", kind: "click" })).toThrow(/plan and step ids/i);
    expect(() => stepkey({ planid: "p1", stepid: "", kind: "click" })).toThrow(/plan and step ids/i);
    expect(() => stepkey({ planid: "p1", stepid: "s1", kind: " " })).toThrow(/step kind/i);
    expect(stepkey({ planid: "p1", stepid: "s1", kind: "click" })).toBe("p1:s1:click");
    expect(stepkey({ planid: "p:1", stepid: "s:1", kind: "navigate" })).toBe("p:1:s:1:navigate");
  });

  it("derives unique step keys across plans, steps and kinds", () => {
    const keys = new Set<string>();
    for (const planid of ["p1", "p2"]) {
      for (const stepid of ["s1", "s2"]) {
        for (const kind of ["click", "readtext"]) {
          keys.add(stepkey({ planid, stepid, kind }));
        }
      }
    }
    expect(keys.size).toBe(8);
  });
});

describe("torture: keepalive lifecycle and zombie reaping", () => {
  it("refuses heartbeats and reattachment on stopped runs while closed runs stay frozen", () => {
    const state = openrun({ runid: "r1", sessionid: "s1", planid: "p1", profileid: "u1", interval: 1_000, now });
    const closed = closerun(state, now + 5_000);
    expect(() => beatrun(closed, now + 6_000)).toThrow(/stopped/i);
    expect(() => reattachrun(closed, now + 6_000)).toThrow(/stopped/i);
    expect(() => closerun(closed, now + 7_000)).toThrow(/already stopped/i);
    expect(closed.state).toBe("completed");
    expect(closed.keepalive.portopen).toBe(false);
  });

  it("refuses negative and non finite intervals at open time", () => {
    for (const interval of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => openrun({ runid: "r1", sessionid: "s1", planid: "p1", profileid: "u1", interval, now })).toThrow(/positive user value/i);
    }
    expect(() => openrun({ runid: "", sessionid: "s1", planid: "p1", profileid: "u1", interval: 1_000, now })).toThrow(/run and session ids/i);
  });

  it("caps the heartbeat event trail at two hundred beats", () => {
    let state = openrun({ runid: "r1", sessionid: "s1", planid: "p1", profileid: "u1", interval: 1_000, now });
    for (let index = 0; index < 250; index += 1) state = beatrun(state, now + index * 1_000);
    expect(state.keepalive.beats).toBe(250);
    expect(state.keepalive.events.length).toBe(200);
    expect(state.keepalive.lastbeatat).toBe(now + 249_000);
  });

  it("reaps exactly the runs whose silence passed the tolerance and only active ones", () => {
    const base = openrun({ runid: "base", sessionid: "s1", planid: "p1", profileid: "u1", interval: 1_000, now });
    const alive = { ...base, runid: "alive", keepalive: { ...base.keepalive, runid: "alive", lastbeatat: now } };
    const silent = { ...base, runid: "silent", keepalive: { ...base.keepalive, runid: "silent", lastbeatat: now - 10_000 } };
    const stopped = closerun({ ...base, runid: "stopped", keepalive: { ...base.keepalive, runid: "stopped" } }, now);
    const alreadyreaped = { ...base, runid: "reapedalready", state: "reaped" as const };
    const result = zombiesweep({ states: [alive, silent, stopped, alreadyreaped], now, interval: 1_000, missedlimit: 3 });
    expect(result.reaped).toEqual(["silent"]);
    expect(result.states.find(state => state.runid === "silent")?.state).toBe("reaped");
    expect(result.states.find(state => state.runid === "alive")?.state).toBe("active");
    expect(result.states.find(state => state.runid === "stopped")?.state).toBe("completed");
    expect(result.states.find(state => state.runid === "reapedalready")?.state).toBe("reaped");
  });

  it("reaps at exactly the tolerated boundary plus one and never at the boundary", () => {
    const base = openrun({ runid: "base", sessionid: "s1", planid: "p1", profileid: "u1", interval: 1_000, now });
    const atboundary = { ...base, runid: "r1", keepalive: { ...base.keepalive, runid: "r1", lastbeatat: now - 3_000 } };
    const overboundary = { ...base, runid: "over", keepalive: { ...base.keepalive, runid: "over", lastbeatat: now - 3_001 } };
    const exactly = zombiesweep({ states: [atboundary], now, interval: 1_000, missedlimit: 3 });
    expect(exactly.reaped).toEqual([]);
    const over = zombiesweep({ states: [overboundary], now, interval: 1_000, missedlimit: 3 });
    expect(over.reaped).toEqual(["over"]);
  });

  it("refuses invalid sweep parameters", () => {
    expect(() => zombiesweep({ states: [], now, interval: 0, missedlimit: 3 })).toThrow(/positive user value/i);
    expect(() => zombiesweep({ states: [], now, interval: 1_000, missedlimit: 0 })).toThrow(/positive whole number/i);
    expect(() => zombiesweep({ states: [], now, interval: Number.NaN, missedlimit: 3 })).toThrow(/positive user value/i);
    expect(() => zombiesweep({ states: [], now, interval: 1_000, missedlimit: 1.5 })).toThrow(/positive whole number/i);
  });

  it("answers recovery for every terminal state and the pending step rule", () => {
    const base = openrun({ runid: "r1", sessionid: "s1", planid: "p1", profileid: "u1", interval: 1_000, now });
    expect(recoveryplan(closerun(base, now + 1)).recoverable).toBe(false);
    expect(recoveryplan({ ...base, state: "reaped" }).recoverable).toBe(false);
    expect(recoveryplan(base).recoverable).toBe(false);
    expect(recoveryplan(base).reason).toMatch(/no pending step/i);
    const pending = { ...base, pendingstepid: "s5" };
    const recovery = recoveryplan(pending);
    expect(recovery.recoverable).toBe(true);
    expect(recovery.pendingstepid).toBe("s5");
  });

  it("records urls, environments and turnarounds with validation", () => {
    let state = openrun({ runid: "r1", sessionid: "s1", planid: "p1", profileid: "u1", interval: 1_000, now });
    expect(() => recordurl(state, { url: " ", stepid: "s1", now })).toThrow(/needs its url/i);
    state = recordurl(state, { url: "https://example.com/a", stepid: "s1", now });
    state = recordurl(state, { url: "https://example.com/a", stepid: "s1", now: now + 1 });
    expect(state.urlhistory.length).toBe(1);
    state = recordurl(state, { url: "https://example.com/a", stepid: "s2", now: now + 2 });
    expect(state.urlhistory.length).toBe(2);
    expect(() => recordenvironment(state, { stepid: "", environment: "pagecontext", origin: "https://example.com", now })).toThrow(/step id/i);
    state = recordenvironment(state, { stepid: "s1", environment: "offscreenworker", origin: "https://example.com", now });
    expect(state.environments["s1"]).toBe("offscreenworker");
    expect(state.lastprovenance?.environment).toBe("offscreenworker");
    expect(() => recordturnaround(state, { stepid: "s1", milliseconds: -1, now })).toThrow(/non-negative/i);
    expect(() => recordturnaround(state, { stepid: "s1", milliseconds: Number.NaN, now })).toThrow(/non-negative/i);
    state = recordturnaround(state, { stepid: "s1", milliseconds: 0, now });
    expect(state.turnarounds["s1"]).toBe(0);
  });
});

describe("torture: run locks and concurrency refusal", () => {
  it("refuses a second concurrent run of the same session while the same run renews", () => {
    const first = acquirerunlock({ locks: [], sessionid: "s1", runid: "r1", holder: "executor", now });
    expect(first.acquired).toBe(true);
    const second = acquirerunlock({ locks: first.locks, sessionid: "s1", runid: "r2", holder: "executor", now: now + 1 });
    expect(second.acquired).toBe(false);
    expect(second.reason).toMatch(/never carries two concurrent runs/i);
    expect(second.locks).toBe(first.locks);
    const renew = acquirerunlock({ locks: first.locks, sessionid: "s1", runid: "r1", holder: "executor", now: now + 2 });
    expect(renew.acquired).toBe(true);
    expect(renew.locks.length).toBe(1);
  });

  it("expires the locks past their expiry naming their sessions and never at the boundary", () => {
    const { locks } = acquirerunlock({ locks: [], sessionid: "s1", runid: "r1", holder: "executor", expiresat: now + 1_000, now });
    expect(expirerunlocks(locks, now).expired).toEqual([]);
    expect(expirerunlocks(locks, now + 999).expired).toEqual([]);
    expect(expirerunlocks(locks, now + 1_000).expired).toEqual([]);
    expect(expirerunlocks(locks, now + 1_001).expired).toEqual(["s1"]);
    expect(expirerunlocks(locks, now + 1_001).locks).toEqual([]);
    const takenover = acquirerunlock({ locks, sessionid: "s1", runid: "r2", holder: "executor", now: now + 1_001 });
    expect(takenover.acquired).toBe(true);
  });

  it("releases the run lock exactly for its own run", () => {
    const { locks } = acquirerunlock({ locks: [], sessionid: "s1", runid: "r1", holder: "executor", now });
    const released = releaserunlock({ locks, sessionid: "s1", runid: "r1", now });
    expect(released.released).toBe(true);
    expect(released.locks.length).toBe(0);
    const missing = releaserunlock({ locks: released.locks, sessionid: "s1", runid: "other", now });
    expect(missing.released).toBe(false);
    expect(missing.reason).toMatch(/holds no lock/i);
  });

  it("serializes steps that share one tab across parallel branches", () => {
    const order = serializesteps({ branches: [
      { branchid: "b1", steps: [{ stepid: "a1", tabid: 7 }, { stepid: "a2", tabid: 8 }] },
      { branchid: "b2", steps: [{ stepid: "b1", tabid: 7 }, { stepid: "b2", tabid: 9 }] },
    ] });
    const tabseven = order.filter(entry => entry.tabid === 7).map(entry => entry.stepid);
    expect(tabseven).toEqual(["a1", "b1"]);
    const unique = new Set(order.map(entry => entry.order));
    expect(unique.size).toBe(order.length);
    expect(order.length).toBe(4);
  });
});

describe("torture: offline queue ordering and replay", () => {
  it("queues only approved plans with monotonic sequence and drains in order", () => {
    const queue = [
      enqueueoffline([], { plan: plan({ id: "p1" }), sessionid: "s1", now }),
      enqueueoffline(enqueueoffline([], { plan: plan({ id: "p1" }), sessionid: "s1", now }), { plan: plan({ id: "p2" }), sessionid: "s2", now: now + 1 }),
    ];
    expect(() => enqueueoffline(queue[0]!, { plan: plan({ id: "px", state: "draft" }), sessionid: "s1", now })).toThrow(/only an approved plan/i);
    const drained: string[] = [];
    let rest = queue[1]!;
    for (let index = 0; index < 3; index += 1) {
      const next = dequeueoffline(rest);
      if (next.task) drained.push(next.task.planid);
      rest = next.queue;
    }
    expect(drained).toEqual(["p1", "p2"]);
    expect(dequeueoffline(rest).task).toBeUndefined();
  });

  it("expires exactly the plans whose window passed while draining offline (the expiry tick is exclusive)", () => {
    const early = enqueueoffline([], { plan: plan({ id: "p1", expiresat: now + 1_000 }), sessionid: "s1", now });
    const late = enqueueoffline(early, { plan: plan({ id: "p2", expiresat: now + 60_000 }), sessionid: "s1", now });
    const before = replayqueue(late, now + 999);
    expect(before.expired.map(task => task.planid)).toEqual([]);
    expect(before.ready.map(task => task.planid)).toEqual(["p1", "p2"]);
    const atboundary = replayqueue(late, now + 1_000);
    expect(atboundary.expired.map(task => task.planid)).toEqual(["p1"]);
    expect(atboundary.ready.map(task => task.planid)).toEqual(["p2"]);
    const after = replayqueue(late, now + 1_001);
    expect(after.expired.map(task => task.planid)).toEqual(["p1"]);
    expect(after.ready.map(task => task.planid)).toEqual(["p2"]);
  });

  it("keeps sequence order under interleaved enqueue bursts", () => {
    let queue: ReturnType<typeof enqueueoffline> = [];
    for (let index = 0; index < 50; index += 1) {
      queue = enqueueoffline(queue, { plan: plan({ id: `p${index}` }), sessionid: "s1", now: now + index });
    }
    const order: number[] = [];
    let rest = queue;
    while (rest.length > 0) {
      const next = dequeueoffline(rest);
      if (next.task) order.push(next.task.sequence);
      rest = next.queue;
    }
    expect(order).toEqual([...order].sort((one, two) => one - two));
    expect(order.length).toBe(50);
  });
});

describe("torture: checkpoints, digests and resume", () => {
  it("refuses checkpoints without their ids and digest", () => {
    expect(() => makecheckpoint({ runid: "", stepid: "s1", completed: [], digest: "d", now })).toThrow(/run id/i);
    expect(() => makecheckpoint({ runid: "r1", stepid: "", completed: [], digest: "d", now })).toThrow(/step id/i);
    expect(() => makecheckpoint({ runid: "r1", stepid: "s1", completed: [], digest: " ", now })).toThrow(/page digest/i);
    const checkpoint = makecheckpoint({ runid: "r1", stepid: "s3", completed: ["s1", "s2"], digest: "digest-a", now });
    expect(checkpoint.completed).toEqual(["s1", "s2"]);
    expect(checkpoint.completed).not.toBe(["s1", "s2"]);
  });

  it("validates only the checkpoint of its own run and unchanged digest", () => {
    const checkpoint = makecheckpoint({ runid: "r1", stepid: "s3", completed: ["s1"], digest: "digest-a", now });
    expect(checkpointisvalid({ checkpoint, runid: "r1", digest: "digest-a" })).toBe(true);
    expect(checkpointisvalid({ checkpoint, runid: "r2", digest: "digest-a" })).toBe(false);
    expect(checkpointisvalid({ checkpoint, runid: "r1", digest: "digest-b" })).toBe(false);
  });

  it("resumes from the first open step while a foreign checkpoint skips only named steps", () => {
    const steps = ["s1", "s2", "s3", "s4"];
    expect(resumecheckpoint({ checkpoint: undefined, steps })).toEqual(steps);
    const checkpoint = makecheckpoint({ runid: "r1", stepid: "s2", completed: ["s1", "s2"], digest: "d", now });
    expect(resumecheckpoint({ checkpoint, steps })).toEqual(["s3", "s4"]);
    expect(resumecheckpoint({ checkpoint, steps: [] })).toEqual([]);
    const foreign = makecheckpoint({ runid: "r2", stepid: "s9", completed: ["s1", "s9"], digest: "d", now });
    expect(resumecheckpoint({ checkpoint: foreign, steps })).toEqual(["s2", "s3", "s4"]);
  });

  it("freezes progress on failure with the run id stamped", () => {
    const moving = advancerun(run(), "running", now);
    const failed = runfail({ run: moving, progress: { planid: "p1", completedsteps: ["s1"], updatedat: now }, now: now + 1 });
    expect(failed.run.state).toBe("failed");
    expect(failed.frozen?.runid).toBe("r1");
    expect(failed.frozen?.updatedat).toBe(now + 1);
    const bare = runfail({ run: moving, now: now + 2 });
    expect(bare.frozen).toBeUndefined();
  });

  it("completes only a run whose plan finished every step", () => {
    const planfixture = plan({ steps: [readstep("s1"), readstep("s2")] });
    const moving = advancerun(run(), "running", now);
    expect(() => runcomplete({ run: moving, plan: planfixture, progress: { planid: "p1", completedsteps: ["s1"], updatedat: now }, now })).toThrow(/never completes/i);
    const done = runcomplete({ run: moving, plan: planfixture, progress: { planid: "p1", completedsteps: ["s1", "s2"], updatedat: now }, now: now + 1 });
    expect(done.state).toBe("completed");
  });

  it("rebuilds a failed run from an expired or unapproved plan and a running one otherwise", () => {
    expect(runfromplan(plan({ state: "draft" }), "s1", now).state).toBe("failed");
    expect(runfromplan(plan({ expiresat: now }), "s1", now).state).toBe("failed");
    expect(runfromplan(plan({ expiresat: now + 1 }), "s1", now).state).toBe("running");
    expect(runfromplan(plan(), "s1", now).runid).toBe("p1");
  });
});

describe("torture: heartbeats and the zombie check", () => {
  it("stale heartbeat sits exactly past the window and never at it", () => {
    const beat = runheartbeat({ runid: "r1", beat: 5, now });
    expect(beat.beat).toBe(6);
    expect(heartbeatisstale({ heartbeat: beat, now: now + 10_000, window: 10_000 })).toBe(false);
    expect(heartbeatisstale({ heartbeat: beat, now: now + 10_001, window: 10_000 })).toBe(true);
    expect(heartbeatisstale({ heartbeat: undefined, now, window: 1 })).toBe(true);
  });

  it("refuses blank run ids on heartbeats", () => {
    expect(() => runheartbeat({ runid: " ", now })).toThrow(/run id/i);
    expect(() => runheartbeat({ runid: "", now })).toThrow(/run id/i);
  });

  it("zombiecheck names only running runs with stale heartbeats", () => {
    const runs = [run({ runid: "alive", state: "running" }), run({ runid: "zombie", state: "running" }), run({ runid: "queued", state: "queued" }), run({ runid: "done", state: "completed" })];
    const heartbeats: Record<string, heartbeatrecord> = {
      alive: { runid: "alive", beat: 1, at: now - 5_000 },
      zombie: { runid: "zombie", beat: 1, at: now - 50_000 },
      queued: { runid: "queued", beat: 1, at: now - 50_000 },
      done: { runid: "done", beat: 1, at: now - 50_000 },
    };
    const zombies = zombiecheck({ runs, heartbeats, now, window: 10_000 });
    expect(zombies.map(entry => entry.runid)).toEqual(["zombie"]);
  });

  it("reads the heartbeat window from settings with the roadmap default", () => {
    expect(heartbeatwindowof(undefined)).toBe(60_000);
    const settings: runsettings = {};
    expect(heartbeatwindowof(settings)).toBe(60_000);
  });
});

describe("torture: side effects and rollback compensations", () => {
  it("compensates only the executed mutating steps while read steps carry none", () => {
    const steps = [readstep("r1"), writestep("w1"), writestep("w2"), writestep("w3")];
    const executed = ["r1", "w1", "w3"];
    const effects = sideeffects(steps, executed);
    expect(effects.map(step => step.id)).toEqual(["w1", "w3"]);
    const items = rollbackrun({ runid: "r1", steps, executedstepids: executed, origin: "https://example.com", now });
    expect(items.map(item => item.stepid)).toEqual(["w1", "w3"]);
    expect(items.every(item => item.compensation.length > 0)).toBe(true);
    expect(items.every(item => item.origin === "https://example.com")).toBe(true);
    expect(rollbackrun({ runid: "r1", steps, executedstepids: [], origin: "https://example.com", now })).toEqual([]);
  });

  it("reports the fallback compensation for an unknown mutating kind", () => {
    const alien = { id: "x1", kind: "dimensionhop", summary: "unknown", risk: "sensitive" } as unknown as toolstep;
    const items = rollbackrun({ runid: "r1", steps: [alien], executedstepids: ["x1"], origin: "https://example.com", now });
    expect(items[0]?.compensation).toMatch(/dimensionhop step stays executed/i);
  });

  it("cancel pairs the rollback choice with compensations only under the explicit user choice", () => {
    const steps = [writestep("w1"), readstep("r1")];
    const moving = advancerun(run(), "running", now);
    const none = cancelrollback({ run: moving, steps, executedstepids: ["w1", "r1"], origin: "https://example.com", choice: "none", now: now + 1 });
    expect(none.run.state).toBe("cancelled");
    expect(none.compensations).toEqual([]);
    expect(none.reason).toMatch(/without a rollback/i);
    const fresh = advancerun(run({ runid: "r2" }), "running", now);
    const rollback = cancelrollback({ run: fresh, steps, executedstepids: ["w1", "r1"], origin: "https://example.com", choice: "rollback", now: now + 1 });
    expect(rollback.run.state).toBe("rolledback");
    expect(rollback.compensations.map(item => item.stepid)).toEqual(["w1"]);
    expect(rollback.reason).toMatch(/explicit user choice/i);
    expect(() => cancelrollback({ run: rollback.run, steps, executedstepids: ["w1"], origin: "https://example.com", choice: "none", now: now + 2 })).toThrow(/cannot move/i);
    expect(() => cancelrollback({ run: none.run, steps, executedstepids: [], origin: "https://example.com", choice: "none", now: now + 2 })).toThrow(/cannot move/i);
  });
});

describe("torture: budget alerts and timeout cancels", () => {
  it("budget alerts fire at their reached severity with critical pausing and warnings informational", () => {
    const atwarning = budgetalertstate({ budget: runbudgetof({ runid: "r1", steps: 80, stepbudget: 100, pressure: 0.5, now }), thresholds: { warning: 0.8, critical: 0.95 } });
    expect(atwarning.map(alert => alert.level)).toEqual(["warning"]);
    expect(runpausesforalerts(atwarning)).toBe(false);
    const atcritical = budgetalertstate({ budget: runbudgetof({ runid: "r1", steps: 100, stepbudget: 100, pressure: 0.5, now }), thresholds: { warning: 0.8, critical: 0.95 } });
    expect(atcritical.map(alert => alert.level)).toEqual(["critical"]);
    expect(runpausesforalerts(atcritical)).toBe(true);
    const over = budgetalertstate({ budget: runbudgetof({ runid: "r1", steps: 101, stepbudget: 100, pressure: 0.5, now }), thresholds: { warning: 0.5, critical: 0.5 } });
    expect(runpausesforalerts(over)).toBe(true);
    const under = budgetalertstate({ budget: runbudgetof({ runid: "r1", steps: 10, stepbudget: 100, pressure: 0.5, now }), thresholds: { warning: 0.8, critical: 0.95 } });
    expect(under).toEqual([]);
    const nobudget = budgetalertstate({ budget: runbudgetof({ runid: "r1", steps: 10, pressure: 0.5, now }), thresholds: { warning: 0.5, critical: 0.5 } });
    expect(nobudget).toEqual([]);
  });

  it("timeout cancels at exactly the bound and one past it while memory pressure alerts beside the steps", () => {
    expect(timeoutcanceldecision({ elapsed: 999, bound: 1_000 }).abort).toBe(false);
    expect(timeoutcanceldecision({ elapsed: 1_000, bound: 1_000 }).abort).toBe(false);
    expect(timeoutcanceldecision({ elapsed: 1_001, bound: 1_000 }).abort).toBe(true);
    expect(timeoutcanceldecision({ elapsed: 0, bound: 0 }).abort).toBe(false);
    expect(timeoutcanceldecision({ elapsed: -5, bound: 1_000 }).abort).toBe(false);
    const unbound = timeoutcanceldecision({ elapsed: 10_000_000 });
    expect(unbound.abort).toBe(false);
    expect(unbound.reason).toMatch(/no timeout bound/i);
    const gap = timeoutcanceldecision({ elapsed: Number.NaN, bound: 1_000 });
    expect(gap.abort).toBe(false);
    expect(gap.reason).toMatch(/no finite elapsed/i);
    const memory = budgetalertstate({ budget: runbudgetof({ runid: "r1", steps: 1, pressure: 1, memorybudget: 1, now }), thresholds: { warning: 0.5, critical: 0.9 } });
    expect(memory.map(alert => alert.kind)).toEqual(["memory"]);
    expect(runpausesforalerts(memory)).toBe(true);
  });
});
