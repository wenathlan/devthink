import { describe, expect, it } from "vitest";
import { advancerun, cancelrollback, cancelrunrecord, checkpointisvalid, dequeueoffline, enqueueoffline, heartbeatisstale, heartbeatwindowof, initialrun, makecheckpoint, queuesize, reaprun, replayqueue, resumecheckpoint, rollbackrun, runcomplete, runfail, runfromplan, runheartbeat, runstatemachine, runsummaryof, sideeffects, stepkey, transitionislegal, zombiecheck } from "../run.js";
import { canexecute, checkpointgate, heartbeatwindowvalid, offlinegate, queuedepthvalid, queuedtaskexpirygate, replaycheck, rollbackgate, rollbackorigingate, zombiegate } from "../policy.js";
import { parseproposal, requestbody, rollbacksummarycheck } from "../protocol.js";
import { sessionmemory } from "../memory.js";
import { protocolversion, type agentplan, type agentsession, type heartbeatrecord, type runrecord, type toolstep } from "../types.js";

const now = 1_800_000_000_000;
const session: agentsession = { id: "session", tabid: 4, origin: "https://example.com", startedat: now, expiresat: now + 1_000_000 };
const clickstep: toolstep = { id: "s1", kind: "click", target: "#submit", summary: "Click the reviewed submit control.", risk: "sensitive" };
const plan: agentplan = { id: "plan", objective: "Submit once", origin: "https://example.com", steps: [clickstep, { id: "s2", kind: "observe", summary: "Read the page.", risk: "read" }], createdat: now, expiresat: now + 1_000_000, state: "approved" };

function runof(state: runrecord["state"]): runrecord { return { runid: "run1", planid: "plan", sessionid: "session", state, createdat: now, updatedat: now }; }

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> { return this.data.get(key) as T | undefined; }
  async set<T>(key: string, value: T): Promise<void> { this.data.set(key, value); }
}

describe("runstatemachine", () => {
  it("covers every legal and illegal transition of the run lifecycle", () => {
    const machine = runstatemachine();
    expect(machine.queued).toContain("running");
    expect(machine.running).toContain("awaitingapproval");
    expect(machine.failed).toEqual(["rolledback"]);
    expect(machine.cancelled).toEqual(["rolledback"]);
    expect(machine.completed).toEqual([]);
    expect(machine.rolledback).toEqual([]);
    expect(transitionislegal({ from: "queued", to: "running" })).toBe(true);
    expect(transitionislegal({ from: "running", to: "completed" })).toBe(true);
    expect(transitionislegal({ from: "completed", to: "running" })).toBe(false);
    expect(transitionislegal({ from: "rolledback", to: "running" })).toBe(false);
    expect(transitionislegal({ from: "queued", to: "rolledback" })).toBe(false);
    expect(transitionislegal({ from: "running", to: "queued" })).toBe(false);
    expect(() => advancerun(runof("completed"), "running", now)).toThrow(/legal transitions/i);
    const advanced = advancerun(runof("queued"), "running", now + 5);
    expect(advanced).toEqual({ runid: "run1", planid: "plan", sessionid: "session", state: "running", createdat: now, updatedat: now + 5 });
  });

  it("creates the initial queued run for an approved plan and rebuilds one after a restart", () => {
    const initial = initialrun({ planid: "plan", sessionid: "session", now });
    expect(initial.state).toBe("queued");
    expect(() => initialrun({ planid: " ", sessionid: "session", now })).toThrow(/plan id/i);
    const rebuilt = runfromplan(plan, "session", now + 1);
    expect(rebuilt.state).toBe("running");
    expect(rebuilt.planid).toBe("plan");
    const expired = runfromplan({ ...plan, expiresat: now }, "session", now + 1);
    expect(expired.state).toBe("failed");
  });
});

describe("checkpoints", () => {
  it("captures, validates and orders one checkpoint", () => {
    const checkpoint = makecheckpoint({ runid: "run1", stepid: "s1", completed: ["s1"], digest: "digest1", now });
    expect(checkpoint).toEqual({ runid: "run1", stepid: "s1", completed: ["s1"], digest: "digest1", createdat: now });
    expect(() => makecheckpoint({ runid: "run1", stepid: "s1", completed: [], digest: " ", now })).toThrow(/digest/i);
    expect(checkpointisvalid({ checkpoint, runid: "run1", digest: "digest1" })).toBe(true);
    expect(checkpointisvalid({ checkpoint, runid: "run1", digest: "digest2" })).toBe(false);
    expect(checkpointisvalid({ checkpoint, runid: "run2", digest: "digest1" })).toBe(false);
    expect(resumecheckpoint({ checkpoint: undefined, steps: ["s1", "s2"] })).toEqual(["s1", "s2"]);
    expect(resumecheckpoint({ checkpoint, steps: ["s1", "s2"] })).toEqual(["s2"]);
    expect(checkpointgate({ checkpoint, runid: "run1", digest: "digest2" }).allowed).toBe(false);
    expect(checkpointgate({ checkpoint, runid: "run1", digest: "digest1" }).allowed).toBe(true);
  });
});

describe("rollback", () => {
  it("builds one compensating step for each mutating kind and none for read only steps", () => {
    const steps: toolstep[] = [
      { id: "s1", kind: "click", summary: "Click", risk: "sensitive" },
      { id: "s2", kind: "observe", summary: "Read", risk: "read" },
      { id: "s3", kind: "type", target: "#field", value: "typed", summary: "Type", risk: "sensitive" },
      { id: "s4", kind: "setcookies", summary: "Set cookies", risk: "sensitive" },
      { id: "s5", kind: "blockrequest", summary: "Block", risk: "sensitive" },
      { id: "s6", kind: "evaluate", summary: "Evaluate", risk: "sensitive" },
      { id: "s7", kind: "submitform", summary: "Submit", risk: "sensitive" },
    ];
    expect(sideeffects(steps, ["s1", "s2", "s3", "s4", "s5", "s6", "s7"]).map(step => step.id)).toEqual(["s1", "s3", "s4", "s5", "s6", "s7"]);
    const items = rollbackrun({ runid: "run1", steps, executedstepids: ["s1", "s2", "s3", "s4", "s5", "s6", "s7"], origin: "https://example.com", now });
    expect(items).toHaveLength(6);
    expect(items.find(item => item.stepid === "s3")?.compensation).toMatch(/restore the field value/i);
    expect(items.find(item => item.stepid === "s4")?.compensation).toMatch(/delete the cookies/i);
    expect(items.find(item => item.stepid === "s5")?.compensation).toMatch(/remove the block rule/i);
    expect(items.find(item => item.stepid === "s6")?.compensation).toMatch(/reports its effect/i);
    expect(items.find(item => item.stepid === "s7")?.compensation).toMatch(/stays submitted/i);
    expect(items.every(item => item.origin === "https://example.com")).toBe(true);
    const failed = runfail({ run: runof("running"), progress: { planid: "plan", completedsteps: ["s1"], updatedat: now }, now });
    expect(failed.run.state).toBe("failed");
    expect(failed.frozen?.runid).toBe("run1");
    const completed = runcomplete({ run: runof("running"), plan, progress: { planid: "plan", completedsteps: ["s1", "s2"], updatedat: now }, now });
    expect(completed.state).toBe("completed");
    expect(() => runcomplete({ run: runof("running"), plan, progress: { planid: "plan", completedsteps: ["s1"], updatedat: now }, now })).toThrow(/never completes/i);
  });

  it("pairs one cancellation with its optional rollback behind the explicit user choice", () => {
    const cancelled = cancelrunrecord(runof("running"), now);
    expect(cancelled.state).toBe("cancelled");
    const plain = cancelrollback({ run: runof("running"), steps: plan.steps, executedstepids: ["s1"], origin: "https://example.com", choice: "none", now });
    expect(plain.run.state).toBe("cancelled");
    expect(plain.compensations).toHaveLength(0);
    const rolled = cancelrollback({ run: runof("running"), steps: plan.steps, executedstepids: ["s1"], origin: "https://example.com", choice: "rollback", now });
    expect(rolled.run.state).toBe("rolledback");
    expect(rolled.compensations).toHaveLength(1);
    expect(rollbackgate({ choice: "none" }).allowed).toBe(false);
    expect(rollbackgate({ choice: "rollback" }).allowed).toBe(false);
    expect(rollbackgate({ choice: "rollback", failed: true }).allowed).toBe(true);
    expect(rollbackorigingate({ items: rolled.compensations, origin: "https://example.com" }).allowed).toBe(true);
    expect(rollbackorigingate({ items: [{ ...rolled.compensations[0]!, origin: "https://evil.example" }], origin: "https://example.com" }).allowed).toBe(false);
    expect(rollbacksummarycheck("restore the field value the form carried").ok).toBe(true);
    expect(rollbacksummarycheck("  padded  ").ok).toBe(false);
    expect(rollbacksummarycheck("").ok).toBe(false);
    expect(rollbacksummarycheck("bad\u0007summary").ok).toBe(false);
  });
});

describe("zombies and heartbeats", () => {
  it("reaps the running runs whose heartbeat fell stale", () => {
    const beat: heartbeatrecord = runheartbeat({ runid: "run1", now });
    expect(beat).toEqual({ runid: "run1", beat: 1, at: now });
    expect(runheartbeat({ runid: "run1", beat: 4, now: now + 1 }).beat).toBe(5);
    expect(heartbeatisstale({ heartbeat: beat, now: now + 59_000, window: 60_000 })).toBe(false);
    expect(heartbeatisstale({ heartbeat: beat, now: now + 61_000, window: 60_000 })).toBe(true);
    expect(heartbeatisstale({ heartbeat: undefined, now, window: 60_000 })).toBe(true);
    expect(heartbeatwindowof(undefined)).toBe(60_000);
    expect(heartbeatwindowof({ heartbeatwindow: 120_000 })).toBe(120_000);
    expect(heartbeatwindowvalid({ window: 120_000 }).allowed).toBe(true);
    expect(heartbeatwindowvalid({ window: 0 }).allowed).toBe(false);
    const stale = { runid: "run1", beat: 1, at: now - 120_000 };
    const live = { runid: "run2", beat: 1, at: now - 10 };
    const zombies = zombiecheck({ runs: [runof("running"), { ...runof("running"), runid: "run2" }], heartbeats: { run1: stale, run2: live }, now, window: 60_000 });
    expect(zombies.map(run => run.runid)).toEqual(["run1"]);
    const reaped = reaprun(runof("running"), now);
    expect(reaped.run.state).toBe("failed");
    expect(reaped.event.kind).toBe("reap");
    expect(() => reaprun(runof("completed"), now)).toThrow(/only a running run/i);
    expect(zombiegate({ zombies: ["run1"] }).allowed).toBe(false);
    expect(zombiegate({ zombies: [] }).allowed).toBe(true);
  });
});

describe("offlinequeue", () => {
  it("enqueues, dequeues, replays and expires the approved plans in sequence order", () => {
    expect(queuesize([])).toBe(0);
    expect(() => enqueueoffline([], { plan: { ...plan, state: "pending" }, sessionid: "session", now })).toThrow(/approved/i);
    const queue = enqueueoffline([], { plan, sessionid: "session", now });
    const second = enqueueoffline(queue, { plan: { ...plan, id: "plan2", steps: [{ id: "s9", kind: "observe", summary: "Read", risk: "read" }] }, sessionid: "session", now });
    expect(queuesize(second)).toBe(2);
    expect(second.map(task => task.sequence)).toEqual([1, 2]);
    const next = dequeueoffline(second);
    expect(next.task?.planid).toBe("plan");
    expect(next.queue).toHaveLength(1);
    const empty = dequeueoffline([]);
    expect(empty.task).toBeUndefined();
    const replayable = replayqueue(second, now + 10);
    expect(replayable.ready.map(task => task.planid)).toEqual(["plan", "plan2"]);
    expect(replayable.expired).toHaveLength(0);
    const expiredtask = second[0]!;
    expect(queuedtaskexpirygate({ task: { planid: expiredtask.planid, expiresat: expiredtask.expiresat }, now: expiredtask.expiresat + 1 }).allowed).toBe(false);
    const expired = replayqueue(second, now + 2_000_000);
    expect(expired.ready).toHaveLength(0);
    expect(expired.expired.map(task => task.planid)).toEqual(["plan", "plan2"]);
    expect(offlinegate({ reachable: false }).action).toBe("queue");
    expect(offlinegate({ reachable: true }).action).toBe("execute");
    expect(queuedepthvalid({ depth: 5 }).allowed).toBe(true);
    expect(queuedepthvalid({ depth: -1 }).allowed).toBe(false);
    expect(queuedepthvalid({}).allowed).toBe(true);
  });
});

describe("idempotent replays", () => {
  it("deduplicates the replays of one step through its stepkey", () => {
    const key = stepkey({ planid: "plan", stepid: "s1", kind: "click" });
    expect(key).toBe("plan:s1:click");
    expect(stepkey({ planid: "plan", stepid: "s1", kind: "click" })).toBe(key);
    expect(stepkey({ planid: "plan", stepid: "s2", kind: "click" })).not.toBe(key);
    expect(() => stepkey({ planid: " ", stepid: "s1", kind: "click" })).toThrow(/plan and step ids/i);
    expect(replaycheck({ key, executedkeys: [] }).allowed).toBe(true);
    expect(replaycheck({ key, executedkeys: [key] }).allowed).toBe(false);
    expect(replaycheck({ key: " ", executedkeys: [] }).allowed).toBe(false);
  });

  it("refuses the steps of queued, cancelled and rolledback runs and stale sensitive heartbeats inside canexecute", () => {
    const base = { session, plan, step: clickstep, tabid: 4, origin: "https://example.com", now };
    const fresh = { run: runof("running"), heartbeat: { runid: "run1", beat: 2, at: now - 1_000 } };
    expect(canexecute(base).allowed).toBe(true);
    expect(canexecute({ ...base, run: runof("queued") }).allowed).toBe(false);
    expect(canexecute({ ...base, run: runof("cancelled") }).allowed).toBe(false);
    expect(canexecute({ ...base, run: runof("rolledback") }).allowed).toBe(false);
    expect(canexecute({ ...base, ...fresh }).allowed).toBe(true);
    expect(canexecute({ ...base, run: runof("running") }).allowed).toBe(false);
    expect(canexecute({ ...base, run: runof("running"), heartbeat: { runid: "run1", beat: 2, at: now - 120_000 } }).allowed).toBe(false);
    expect(canexecute({ ...base, run: runof("running"), heartbeat: { runid: "run1", beat: 2, at: now - 120_000 }, settings: { heartbeatwindow: 300_000 } }).allowed).toBe(true);
  });
});

describe("resilience protocol", () => {
  it("parses the resumedfrom marker, refuses colliding idempotencykeys and carries the run context", () => {
    const proposal = { version: protocolversion, plan: { id: "plan", objective: "Submit once", origin: "https://example.com", steps: [
      { id: "s1", kind: "click", target: "#submit", summary: "Click the reviewed submit control.", idempotencykey: "plan:s1:click" },
      { id: "s2", kind: "observe", summary: "Read the page.", idempotencykey: "plan:s2:observe" },
    ] } };
    const parsed = parseproposal(proposal, "https://example.com");
    expect(parsed.resumedfrom).toBeUndefined();
    expect(parsed.plan.steps[0]?.idempotencykey).toBe("plan:s1:click");
    const resumed = parseproposal({ ...proposal, resumedfrom: ["s1"] }, "https://example.com");
    expect(resumed.resumedfrom).toEqual(["s1"]);
    expect(() => parseproposal({ ...proposal, resumedfrom: ["sX"] }, "https://example.com")).toThrow(/does not carry/i);
    expect(() => parseproposal({ ...proposal, plan: { ...proposal.plan, steps: [
      { id: "s1", kind: "click", target: "#submit", summary: "Click", idempotencykey: "same" },
      { id: "s2", kind: "observe", summary: "Read", idempotencykey: "same" },
    ] } }, "https://example.com")).toThrow(/idempotencykey/i);
    const body = JSON.parse(requestbody({ objective: "o", session, observation: { schemaversion: 1, url: "https://example.com", title: "t", textpreview: "", textlength: 0, forms: [], interactive: [], capturedat: now }, capabilities: { tabs: false, downloads: false, clipboardread: false, clipboardwrite: false, reportedat: now }, runstate: "queued", queuedepth: 2 }));
    expect(body.runstate).toBe("queued");
    expect(body.queuedepth).toBe(2);
  });
});

describe("resilience memory", () => {
  it("persists runs, checkpoints, heartbeats, the queue, the rollbacks, the executed keys and the user choices", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setrunrecord(runof("running"));
    await store.setrunrecord({ ...runof("running"), runid: "run2", updatedat: now - 5 });
    expect((await store.getrunrecord("run1"))?.state).toBe("running");
    expect((await store.listruns()).map(run => run.runid)).toEqual(["run1", "run2"]);
    await store.setcheckpoint(makecheckpoint({ runid: "run1", stepid: "s1", completed: ["s1"], digest: "digest1", now }));
    expect((await store.getcheckpoint("run1"))?.stepid).toBe("s1");
    expect(await store.getcheckpoint("run2")).toBeUndefined();
    await store.setheartbeat(runheartbeat({ runid: "run1", now }));
    expect((await store.getheartbeat("run1"))?.beat).toBe(1);
    await store.setqueue(enqueueoffline([], { plan, sessionid: "session", now }));
    expect(queuesize(await store.getqueue())).toBe(1);
    await store.addrollback({ runid: "run1", stepid: "s1", kind: "click", origin: "https://example.com", compensation: "report the outcome", at: now });
    expect((await store.listrollbacks("run1"))).toHaveLength(1);
    await store.addexecutedkey("run1", "plan:s1:click");
    expect(await store.getexecutedkeys("run1")).toEqual(["plan:s1:click"]);
    await store.setheartbeatwindow(120_000);
    expect(await store.getheartbeatwindow()).toBe(120_000);
    await store.setqueuedepthsetting(7);
    expect(await store.getqueuedepthsetting()).toBe(7);
    await store.setrunrecord({ ...runof("failed"), updatedat: now - 500_000 });
    const pruned = await store.pruneruns(60_000, now);
    expect(pruned.pruned).toEqual(["run1"]);
    expect(pruned.kept.map(run => run.runid)).toEqual(["run2"]);
    expect((await store.pruneruns(undefined, now)).pruned).toHaveLength(0);
  });

  it("summarizes one run with its state, step counts and checkpoint position", () => {
    const summary = runsummaryof({ run: runof("running"), plan, progress: { planid: "plan", completedsteps: ["s1"], updatedat: now }, checkpoint: makecheckpoint({ runid: "run1", stepid: "s1", completed: ["s1"], digest: "digest1", now }) });
    expect(summary).toEqual({ runid: "run1", state: "running", steps: 2, completed: 1, checkpointstep: "s1", updatedat: now });
    expect(runsummaryof({ run: runof("queued"), plan }).completed).toBe(0);
  });
});
