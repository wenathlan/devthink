import { describe, expect, it } from "vitest";
import { acquirerunlock, beatrun, closerun, expirerunlocks, exportrunstate, markpending, openrun, prunerunstates, reattachrun, recordenvironment, recordturnaround, recordurl, recoveryplan, releaserunlock, sealrunstate, serializesteps, zombiesweep, openseal } from "../run.js";

const now = 1_000;
const interval = 30_000;

function run(overrides: Partial<ReturnType<typeof openrun>> = {}) {
  return { ...openrun({ runid: "run1", sessionid: "session1", planid: "plan1", profileid: "profile1", interval, now }), ...overrides };
}

describe("run state and keepalive", () => {
  it("opens the typed run state with its start event and an open keepalive port", () => {
    const state = openrun({ runid: "run1", sessionid: "session1", planid: "plan1", profileid: "profile1", interval, now });
    expect(state.state).toBe("active");
    expect(state.keepalive.portopen).toBe(true);
    expect(state.keepalive.beats).toBe(0);
    expect(state.keepalive.events).toHaveLength(1);
    expect(state.keepalive.events[0]).toMatchObject({ kind: "start", at: now });
    expect(() => openrun({ runid: " ", sessionid: "s", planid: "p", profileid: "d", interval, now })).toThrow(/run and session ids/i);
    expect(() => openrun({ runid: "r", sessionid: "s", planid: "p", profileid: "d", interval: 0, now })).toThrow(/positive user value/i);
  });

  it("emits one keepalive heartbeat per beat and closes the port at the terminal state", () => {
    let state = run();
    state = beatrun(state, now + interval);
    state = beatrun(state, now + interval * 2);
    expect(state.keepalive.beats).toBe(2);
    expect(state.keepalive.lastbeatat).toBe(now + interval * 2);
    expect(state.keepalive.events.filter(event => event.kind === "heartbeat")).toHaveLength(2);
    const closed = closerun(state, now + interval * 3);
    expect(closed.keepalive.state).toBe("stopped");
    expect(closed.keepalive.portopen).toBe(false);
    expect(closed.state).toBe("completed");
    expect(closed.keepalive.events[closed.keepalive.events.length - 1]?.kind).toBe("stop");
    expect(() => beatrun(closed, now + interval * 4)).toThrow(/stopped/);
    expect(() => closerun(closed, now + interval * 5)).toThrow(/already stopped/);
  });

  it("reattaches the keepalive port after a service worker restart from the persisted state", () => {
    const state = reattachrun(run(), now + 5_000);
    expect(state.state).toBe("recovered");
    expect(state.keepalive.portopen).toBe(true);
    expect(state.keepalive.events.some(event => event.kind === "reattach")).toBe(true);
    expect(() => reattachrun(closerun(run(), now + 1), now + 2)).toThrow(/never reattaches/);
  });

  it("records the url history, the environment and the worker turnaround of every step", () => {
    let state = run();
    state = recordurl(state, { url: "https://example.com/start", stepid: "s1", now: now + 1 });
    state = recordurl(state, { url: "https://example.com/list", stepid: "s2", now: now + 2 });
    state = recordurl(state, { url: "https://example.com/start", stepid: "s1", now: now + 3 });
    expect(state.urlhistory).toHaveLength(2);
    state = recordenvironment(state, { stepid: "s2", environment: "offscreenworker", origin: "https://example.com", now: now + 4 });
    expect(state.environments.s2).toBe("offscreenworker");
    expect(state.lastprovenance).toEqual({ origin: "https://example.com", stepid: "s2", environment: "offscreenworker" });
    state = recordturnaround(state, { stepid: "s2", milliseconds: 42, now: now + 5 });
    expect(state.turnarounds.s2).toBe(42);
    expect(() => recordurl(state, { url: " ", stepid: "s1", now: now + 6 })).toThrow(/url/i);
    expect(() => recordenvironment(state, { stepid: " ", environment: "pagecontext", origin: "o", now: now + 6 })).toThrow(/step id/i);
    expect(() => recordturnaround(state, { stepid: "s1", milliseconds: -1, now: now + 6 })).toThrow(/non-negative/i);
  });

  it("resumes exactly the pending step after a service worker restart", () => {
    const withpending = markpending(run(), "s3", now + 1);
    const plan = recoveryplan(withpending);
    expect(plan).toMatchObject({ runid: "run1", pendingstepid: "s3", recoverable: true });
    expect(plan.reason).toMatch(/resumes the pending step s3/i);
    expect(recoveryplan(run()).recoverable).toBe(false);
    expect(recoveryplan(closerun(run(), now + 1)).reason).toMatch(/completed before the restart/i);
    expect(recoveryplan(markpending(run(), "s3", now)).reason).toMatch(/resumes the pending step/i);
    const reaped = zombiesweep({ states: [markpending(run(), "s3", now)], now: now + interval * 4, interval, missedlimit: 3 }).states[0];
    expect(recoveryplan(reaped as ReturnType<typeof openrun>).reason).toMatch(/reaped as a zombie/i);
  });

  it("detects and reaps zombie runs whose heartbeat fell silent past the tolerated intervals", () => {
    const live = beatrun(run(), now + interval * 3);
    const silent = run({ runid: "run2" });
    const stopped = closerun(run({ runid: "run3" }), now + 1);
    const sweep = zombiesweep({ states: [live, silent, stopped], now: now + interval * 3 + 1, interval, missedlimit: 3 });
    expect(sweep.reaped).toEqual(["run2"]);
    const reaped = sweep.states.find(state => state.runid === "run2");
    expect(reaped?.state).toBe("reaped");
    expect(reaped?.keepalive.state).toBe("stopped");
    expect(reaped?.keepalive.portopen).toBe(false);
    expect(sweep.states.find(state => state.runid === "run1")?.state).toBe("active");
    expect(sweep.states.find(state => state.runid === "run3")?.state).toBe("completed");
    const tolerant = zombiesweep({ states: [silent], now: now + interval * 3 - 1, interval, missedlimit: 3 });
    expect(tolerant.reaped).toEqual([]);
    expect(zombiesweep({ states: [live], now: now + interval * 4, interval, missedlimit: 4 }).reaped).toEqual([]);
    expect(() => zombiesweep({ states: [], now, interval: 0, missedlimit: 3 })).toThrow(/positive user value/i);
    expect(() => zombiesweep({ states: [], now, interval, missedlimit: 0 })).toThrow(/positive whole number/i);
  });

  it("locks one session against concurrent runs through the storage level run lock", () => {
    const acquired = acquirerunlock({ locks: [], sessionid: "session1", runid: "run1", holder: "executor", now });
    expect(acquired.acquired).toBe(true);
    const concurrent = acquirerunlock({ locks: acquired.locks, sessionid: "session1", runid: "run2", holder: "executor", now: now + 1 });
    expect(concurrent.acquired).toBe(false);
    expect(concurrent.reason).toMatch(/never carries two concurrent runs/i);
    const same = acquirerunlock({ locks: acquired.locks, sessionid: "session1", runid: "run1", holder: "executor", now: now + 2 });
    expect(same.acquired).toBe(true);
    const other = acquirerunlock({ locks: acquired.locks, sessionid: "session2", runid: "run9", holder: "executor", now: now + 3 });
    expect(other.acquired).toBe(true);
    expect(other.locks).toHaveLength(2);
    const released = releaserunlock({ locks: acquired.locks, sessionid: "session1", runid: "run1", now: now + 4 });
    expect(released.released).toBe(true);
    expect(released.locks).toHaveLength(0);
    expect(releaserunlock({ locks: acquired.locks, sessionid: "session1", runid: "runX", now: now + 5 }).released).toBe(false);
    expect(() => acquirerunlock({ locks: [], sessionid: " ", runid: "r", holder: "h", now })).toThrow(/session and run ids/i);
  });

  it("expires the run locks past their user configured expiry while locks without one keep holding", () => {
    const locks = acquirerunlock({ locks: [], sessionid: "session1", runid: "run1", holder: "executor", expiresat: now + 100, now }).locks;
    const withother = acquirerunlock({ locks, sessionid: "session2", runid: "run2", holder: "executor", now: now + 1 }).locks;
    const expired = expirerunlocks(withother, now + 200);
    expect(expired.expired).toEqual(["session1"]);
    expect(expired.locks.map(lock => lock.sessionid)).toEqual(["session2"]);
    expect(expirerunlocks(withother, now + 50).expired).toEqual([]);
  });

  it("serializes the steps that share one tab across parallel branches", () => {
    const order = serializesteps({ branches: [
      { branchid: "a", steps: [{ stepid: "a1", tabid: 1 }, { stepid: "a2", tabid: 2 }] },
      { branchid: "b", steps: [{ stepid: "b1", tabid: 1 }, { stepid: "b2", tabid: 3 }] },
    ] });
    expect(order.map(entry => entry.stepid)).toEqual(["a1", "b1", "a2", "b2"]);
    expect(order.filter(entry => entry.tabid === 1).map(entry => entry.order)).toEqual([0, 1]);
    const single = serializesteps({ branches: [{ branchid: "a", steps: [{ stepid: "a1", tabid: 7 }] }, { branchid: "b", steps: [{ stepid: "b1", tabid: 8 }] }] });
    expect(single.map(entry => entry.stepid)).toEqual(["a1", "b1"]);
    expect(serializesteps({ branches: [] })).toEqual([]);
  });

  it("seals the persisted run state with its integrity digest and refuses a tampered seal", async () => {
    const state = recordenvironment(run(), { stepid: "s1", environment: "pagecontext", origin: "https://example.com", now });
    const sealed = await sealrunstate(state);
    expect(sealed.algorithm).toBe("sha-256");
    expect(sealed.digest).toMatch(/^[0-9a-f]{64}$/);
    const opened = await openseal(sealed);
    expect(opened.runid).toBe("run1");
    expect(opened.environments.s1).toBe("pagecontext");
    const tampered = { ...sealed, payload: sealed.payload.replace("run1", "runX") };
    await expect(openseal(tampered)).rejects.toThrow(/integrity digest/i);
    const broken = { ...sealed, digest: "0".repeat(64) };
    await expect(openseal(broken)).rejects.toThrow(/integrity digest/i);
  });

  it("prunes the oldest finished run states under storage pressure while active runs keep their state", () => {
    const active = run();
    const finishedone = closerun(run({ runid: "old" }), now + 1);
    const finishedtwo = closerun(run({ runid: "newer" }), now + 5);
    const nopressure = prunerunstates({ states: [active, finishedone, finishedtwo], used: 100, ceiling: 1_000 });
    expect(nopressure.pruned).toEqual([]);
    const pressure = prunerunstates({ states: [active, finishedone, finishedtwo], used: 2_000, ceiling: 1_000 });
    expect(pressure.pruned).toContain("old");
    expect(pressure.pruned).not.toContain("run1");
    expect(pressure.states.some(state => state.runid === "run1")).toBe(true);
    expect(pressure.reason).toMatch(/storage pressure/i);
    expect(prunerunstates({ states: [active], used: 2_000, ceiling: 0 }).pruned).toEqual([]);
  });

  it("exports the run states as one single audit record", () => {
    let first = run();
    first = recordurl(first, { url: "https://example.com/a", stepid: "s1", now: now + 1 });
    first = recordenvironment(first, { stepid: "s1", environment: "offscreenworker", origin: "https://example.com", now: now + 2 });
    first = recordturnaround(first, { stepid: "s1", milliseconds: 12, now: now + 3 });
    const second = beatrun(run({ runid: "run2" }), now + 4);
    const exported = exportrunstate([first, second], now + 10);
    expect(exported).toEqual({ runs: 2, urls: 1, environments: 1, offloaded: 1, beats: 1, exportedat: now + 10 });
  });
});
