import { describe, expect, it } from "vitest";
import { agentbudgetof, agentname, agentscopeof, budgetremaining, engagekillswitch, fleetoverview, pauseagent, readonlyscope, spendbudget, unpauseagent } from "../agent.js";
import { agentnamevalid, agentscopegate, budgetgate, killswitchgate, pauseagentgate, voteweightvalid } from "../policy.js";
import type { agentrecord, runrecord, taskqueue } from "../types.js";
import { emptyqueue } from "../swarm.js";

const now = 1_800_000_000_000;

/** Builds one fleet record fixture with every value user chosen. */
function record(over: Partial<agentrecord> = {}): agentrecord {
  return { id: "a1", name: "scout", role: "worker", origin: "https://example.com", state: "active", registeredat: now, lastseenat: now, ...over };
}

/** Builds one run record fixture of the fleet attribution. */
function run(over: Partial<runrecord> = {}): runrecord {
  return { runid: "run1", planid: "plan1", sessionid: "session1", state: "running", createdat: now, updatedat: now, agentid: "a1", ...over };
}

describe("agentfleet naming and scope narrowing", () => {
  it("assigns unique lowercase names and refuses duplicates, reserved words and out of rule names", () => {
    const first = agentname({ records: [], id: "a1", proposed: " Scout ", origin: "https://example.com", now });
    expect(first.name).toBe("scout");
    expect(first.state).toBe("active");
    expect(agentnamevalid({ name: "Scout", records: [first] }).allowed).toBe(false);
    expect(() => agentname({ records: [first], id: "a2", proposed: "scout", origin: "https://example.com", now })).toThrow(/already registered/i);
    expect(() => agentname({ records: [first], id: "a2", proposed: "user", origin: "https://example.com", now })).toThrow(/reserved/i);
    expect(() => agentname({ records: [first], id: "a2", proposed: "Scout Two", origin: "https://example.com", now })).toThrow(/lowercase identifier/i);
    const second = agentname({ records: [first], id: "a2", proposed: "verifier", role: "verifier", origin: "https://example.com", now });
    expect(second.name).toBe("verifier");
    expect(second.role).toBe("verifier");
  });

  it("intersects the requested scope with the session grants and narrows the action kinds", () => {
    const grants = ["https://example.com", "https://other.example"];
    const scope = agentscopeof({ agentid: "a1", requested: { origins: ["https://example.com", "https://denied.example"], actionkinds: ["observe", "readtext", "click"] }, grants, allowedkinds: ["observe", "readtext", "navigate", "click"] });
    expect(scope.origins).toEqual(["https://example.com"]);
    expect(scope.actionkinds).toEqual(["observe", "readtext", "click"]);
    expect(() => agentscopeof({ agentid: "a1", requested: { origins: ["https://denied.example"] }, grants, allowedkinds: ["observe"] })).toThrow(/outside the session grants/i);
    expect(() => agentscopeof({ agentid: "a1", requested: { actionkinds: ["typetime"] }, grants, allowedkinds: ["observe"] })).toThrow(/outside the allowed catalog/i);
    const observer = readonlyscope({ agentid: "a2", readkinds: ["observe", "readtext"] });
    expect(observer.readonly).toBe(true);
    expect(observer.toolnamespaces).toEqual(["memory", "system"]);
    expect(agentscopegate({ scope: observer, kind: "click", risk: "sensitive" }).allowed).toBe(false);
    expect(agentscopegate({ scope: observer, kind: "observe", risk: "read" }).allowed).toBe(true);
    expect(agentscopegate({ scope, kind: "observe", origin: "https://example.com", risk: "read" }).allowed).toBe(true);
    expect(agentscopegate({ scope, kind: "click", origin: "https://denied.example", risk: "sensitive" }).allowed).toBe(false);
  });
});

describe("agentfleet budget grant, spend refusal and reporting", () => {
  it("grants a budget from user configuration, spends one unit per step and refuses past the ceiling", () => {
    const grant = agentbudgetof({ agentid: "a1", maxsteps: 2, maxtokens: 100, maxdurationms: 5_000, now });
    expect(grant.state.spentsteps).toBe(0);
    expect(grant.budget.maxsteps).toBe(2);
    const onestep = spendbudget({ state: grant.state, steps: 1, tokens: 40, durationms: 1_000, now });
    expect(onestep.spentsteps).toBe(1);
    const twosteps = spendbudget({ state: onestep, steps: 1, tokens: 40, durationms: 1_000, now });
    expect(twosteps.spentsteps).toBe(2);
    expect(() => spendbudget({ state: twosteps, steps: 1, now })).toThrow(/budgeted steps/i);
    expect(() => spendbudget({ state: twosteps, steps: 0, tokens: 40, now })).toThrow(/budgeted tokens/i);
    expect(() => spendbudget({ state: twosteps, steps: 0, tokens: 0, durationms: 5_000, now })).toThrow(/budgeted milliseconds/i);
    const gate = budgetgate({ state: twosteps, steps: 1 });
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/user configured steps/i);
    const unbounded = agentbudgetof({ agentid: "a2", now });
    expect(budgetgate({ state: unbounded.state, steps: 1_000 }).allowed).toBe(true);
    const remaining = budgetremaining(twosteps);
    expect(remaining.steps).toBe(0);
    expect(remaining.reason).toMatch(/0 of 2 steps left/i);
    expect(() => agentbudgetof({ agentid: "a1", maxsteps: -3, now })).toThrow(/positive number/i);
  });
});

describe("agentfleet pause isolation and killswitch completeness", () => {
  it("pauses one agent without stopping its peers and leaves their run records untouched", () => {
    const fleet = [record(), record({ id: "a2", name: "mapper" })];
    const gate = pauseagentgate({ records: fleet, agentid: "a1" });
    expect(gate.allowed).toBe(true);
    expect(gate.reason).toMatch(/1 peer/i);
    const paused = pauseagent({ records: fleet, agentid: "a1", now });
    expect(paused.find(entry => entry.id === "a1")?.state).toBe("paused");
    expect(paused.find(entry => entry.id === "a2")?.state).toBe("active");
    expect(() => pauseagent({ records: paused, agentid: "missing", now })).toThrow(/not registered/i);
    const resumed = unpauseagent({ records: paused, agentid: "a1", now });
    expect(resumed.find(entry => entry.id === "a1")?.state).toBe("active");
  });

  it("engages the killswitch in one call: every record stops, every agent run cancels, every queue clears and each stopped agent counts", () => {
    const fleet = [record(), record({ id: "a2", name: "mapper" }), record({ id: "a3", name: "watcher", state: "paused" })];
    const userrun: runrecord = { runid: "run3", planid: "plan3", sessionid: "session1", state: "running", createdat: now, updatedat: now };
    const runs = [run(), run({ runid: "run2", agentid: "a2", state: "queued" }), userrun, run({ runid: "run4", agentid: "a2", state: "completed" })];
    const queue: taskqueue = { ...emptyqueue({ lanes: ["main"] }), items: [{ id: "t1", lane: "main", priority: 1, payload: "task", state: "queued", enqueuedat: now }], claims: [] };
    const usergate = killswitchgate({ triggeredby: "user", pausedagents: 1 });
    expect(usergate.allowed).toBe(true);
    expect(usergate.reason).toMatch(/stays effective over the 1 paused agent/i);
    expect(killswitchgate({ triggeredby: "agent" }).allowed).toBe(false);
    const stop = engagekillswitch({ records: fleet, runs, queues: [queue], reason: "The user halted the fleet.", now });
    expect(stop.records.every(entry => entry.state === "stopped")).toBe(true);
    expect(stop.runs.find(entry => entry.runid === "run1")?.state).toBe("cancelled");
    expect(stop.runs.find(entry => entry.runid === "run2")?.state).toBe("cancelled");
    expect(stop.runs.find(entry => entry.runid === "run3")?.state).toBe("running");
    expect(stop.runs.find(entry => entry.runid === "run4")?.state).toBe("completed");
    expect(stop.queues[0]?.items).toHaveLength(0);
    expect(stop.stopped).toHaveLength(3);
    expect(stop.stopped.map(entry => entry.name)).toEqual(["scout", "mapper", "watcher"]);
    expect(stop.stopped.find(entry => entry.agentid === "a1")?.runs).toEqual(["run1"]);
    const overview = fleetoverview({ records: stop.records, budgets: [], openescalations: 1, openreviews: 2, killswitchat: now });
    expect(overview.stopped).toBe(3);
    expect(overview.openescalations).toBe(1);
    expect(overview.lastkillswitchat).toBe(now);
  });

  it("keeps the vote weight at one per agentrecord", () => {
    expect(voteweightvalid({ votes: [{ agentid: "a1" }, { agentid: "a2" }] }).allowed).toBe(true);
    expect(voteweightvalid({ votes: [{ agentid: "a1" }, { agentid: "a1" }] }).reason).toMatch(/voted twice/i);
    expect(voteweightvalid({ votes: [{ agentid: " " }] }).allowed).toBe(false);
  });
});
