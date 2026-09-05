import { describe, expect, it } from "vitest";
import { ackreview, applyreview, arbitrate, assignwork, boardstate, checkclaim, collectresults, consensusstate, castvote, electleader, escalate, openconsensus, plannersplit, reportstep, requestreview, resolveescalation, scaleworkers, sweepreviews } from "../swarm.js";
import type { agentidentity, arbitrationrule, handoffrecord, leaderworker, reviewrequest } from "../types.js";
import { emptyqueue, enqueue } from "../swarm.js";

const now = 1_800_000_000_000;

/** Builds one agent identity fixture with every value user chosen. */
function agent(over: Partial<agentidentity> = {}): agentidentity {
  return { id: "a1", name: "Scout", role: "worker", depth: 0, state: "active", registeredat: now, heartbeatat: now, ...over };
}

/** Builds one review request fixture routed between two agents. */
function request(over: Partial<reviewrequest> = {}): reviewrequest {
  return { id: "r1", fromagentid: "a1", toagentid: "a2", subject: "The extraction output", payload: "The table rows", state: "open", requestedat: now, ...over };
}

describe("orchestration leader election and work assignment", () => {
  /** The stored agent list stays newest first, so the first registered agent sits at its end exactly like the registeragent order keeps it. */
  const swarm = [agent({ id: "a4", name: "Guide", role: "planner" }), agent({ id: "a3", name: "Probe", role: "verifier" }), agent({ id: "a2", name: "Scribe", role: "critic" }), agent({ id: "a1", name: "Scout", role: "worker", tabid: 1 })];

  it("elects the first registered agent under the first rule and separates the worker, critic and verifier lanes", () => {
    const topology = electleader({ agents: swarm, id: "top1", rule: { kind: "first" }, now });
    expect(topology.leaderid).toBe("a1");
    expect(topology.workerids).toEqual([]);
    expect(topology.criticids).toEqual(["a2"]);
    expect(topology.verifierids).toEqual(["a3"]);
    expect(topology.rule).toEqual({ kind: "first" });
  });

  it("elects the user named agent under the named rule and refuses an unknown name", () => {
    const topology = electleader({ agents: swarm, id: "top2", rule: { kind: "named", agentid: "a4" }, now });
    expect(topology.leaderid).toBe("a4");
    expect(topology.workerids).toEqual(["a1"]);
    expect(() => electleader({ agents: swarm, id: "top3", rule: { kind: "named", agentid: "missing" }, now })).toThrow(/not a live agent/i);
    expect(() => electleader({ agents: swarm, id: "top4", rule: { kind: "named" }, now })).toThrow(/agent id the user named/i);
  });

  it("slices the tasks across the workers in turns and records the worker assignments", () => {
    const workers = [agent({ id: "a1" }), agent({ id: "a2" }), agent({ id: "a3" })];
    const topology = electleader({ agents: [agent({ id: "a9", name: "Guide", role: "planner" }), ...workers], id: "top5", rule: { kind: "named", agentid: "a9" }, now });
    const queue = enqueue({ queue: enqueue({ queue: emptyqueue({ lanes: ["extraction"] }), id: "t1", lane: "extraction", priority: 1, payload: "Read the table", now }), id: "t2", lane: "extraction", priority: 1, payload: "Read the footer", now });
    const assigned = assignwork({ topology, tasks: queue.items, now: now + 1 });
    expect(assigned.assignments.map(assignment => assignment.workerid)).toEqual(["a1", "a2"]);
    expect(assigned.assignments[0]).toMatchObject({ taskid: "t1", slice: expect.stringContaining("Read the table") });
    expect(assignwork({ topology, tasks: [], now }).assignments).toHaveLength(0);
    expect(() => assignwork({ topology: { ...topology, workerids: [] }, tasks: queue.items, now })).toThrow(/no worker/i);
  });

  it("gathers the worker outputs with status and names the missing slices", () => {
    const topology: leaderworker = { id: "top", leaderid: "a9", workerids: ["a1", "a2"], criticids: [], verifierids: [], assignments: [{ workerid: "a1", taskid: "t1", slice: "One", assignedat: now }, { workerid: "a2", taskid: "t2", slice: "Two", assignedat: now }], rule: { kind: "first" }, electedat: now };
    const gathered = collectresults({ topology, outputs: [{ workerid: "a1", taskid: "t1", state: "done", summary: "Rows read." }] });
    expect(gathered.gathered[0]).toMatchObject({ state: "done", summary: "Rows read." });
    expect(gathered.gathered[1]).toMatchObject({ state: "pending" });
    expect(gathered.missing).toEqual(["a2:t2"]);
  });

  it("scales the worker lane by load under the user configured bound with no engine cap", () => {
    const live = [agent({ id: "a1" }), agent({ id: "a2" }), agent({ id: "a3" }), agent({ id: "a9", name: "Guide", role: "planner" })];
    const topology: leaderworker = { id: "top", leaderid: "a9", workerids: ["a1"], criticids: [], verifierids: [], assignments: [], rule: { kind: "first" }, electedat: now };
    const grown = scaleworkers({ topology, agents: live, pending: 3, now });
    expect(grown.added).toEqual(["a2", "a3"]);
    expect(grown.topology.workerids).toEqual(["a1", "a2", "a3"]);
    const bounded = scaleworkers({ topology: grown.topology, agents: live, pending: 6, bound: 3, now });
    expect(bounded.added).toEqual([]);
    expect(bounded.reason).toMatch(/bound of 3 workers holds/i);
    const unbounded = scaleworkers({ topology: grown.topology, agents: live, pending: 9, now });
    expect(unbounded.reason).toMatch(/no further live worker role agent to add/i);
    const spare = scaleworkers({ topology: { ...topology, workerids: ["a1"] }, agents: live, pending: 2, now });
    expect(spare.added).toEqual(["a2"]);
    expect(spare.reason).toMatch(/added the workers a2/i);
    const retired = scaleworkers({ topology: grown.topology, agents: live, pending: 1, now });
    expect(retired.retired).toEqual(["a2", "a3"]);
    expect(retired.topology.workerids).toEqual(["a1"]);
  });
});

describe("orchestration planner executor split", () => {
  it("keeps plan drafting and execution in different agents and collects the executor step reports", () => {
    const split = plannersplit({ id: "s1", planownerid: "a1", runownerid: "a2", taskid: "t1", now });
    expect(split).toMatchObject({ planownerid: "a1", runownerid: "a2", taskid: "t1" });
    expect(split.stepreports).toHaveLength(0);
    const reported = reportstep({ split, stepid: "step1", outcome: "done", detail: "The row count is 42.", now: now + 1 });
    const twice = reportstep({ split: reported, stepid: "step1", outcome: "failed", detail: "The re-read found 41.", now: now + 2 });
    expect(twice.stepreports).toHaveLength(1);
    expect(twice.stepreports[0]).toMatchObject({ outcome: "failed" });
    expect(() => plannersplit({ id: "s2", planownerid: "a1", runownerid: "a1", now })).toThrow(/different agents/i);
    expect(() => reportstep({ split, stepid: " ", outcome: "done", detail: "d", now })).toThrow(/step id/i);
  });
});

describe("orchestration critic review verdict flows", () => {
  it("routes a review request between agents with ack, answer and timeout", () => {
    const requests = requestreview({ requests: [], id: "r1", fromagentid: "a1", toagentid: "a2", subject: "The output", payload: "The rows", timeoutms: 1000, now });
    expect(requests[0]).toMatchObject({ state: "open", timeoutat: now + 1000 });
    const acked = ackreview({ requests, id: "r1", now: now + 1 });
    expect(acked[0]).toMatchObject({ state: "acked", ackedat: now + 1 });
    expect(() => ackreview({ requests: acked, id: "r1", now: now + 2 })).toThrow(/only an open request/i);
    const swept = sweepreviews({ requests: acked, now: now + 2000 });
    expect(swept.requests[0]?.state).toBe("timeout");
    expect(swept.timedout).toEqual(["r1"]);
    const never = sweepreviews({ requests: requestreview({ requests: [], id: "r2", fromagentid: "a1", toagentid: "a2", subject: "s", payload: "p", now }), now: now + 999_999 });
    expect(never.timedout).toEqual([]);
  });

  it("applies the critic verdict with issues and required changes and refuses the wrong reviewer", () => {
    const requests = requestreview({ requests: [], id: "r1", fromagentid: "a1", toagentid: "a2", subject: "The output", payload: "The rows", now });
    const outcome = applyreview({ requests, id: "r1", reviewerid: "a2", verdict: "changes", issues: ["One row is stale."], requiredchanges: ["Re-read the footer."], taskid: "t1", now: now + 1 });
    expect(outcome.review).toMatchObject({ verdict: "changes", subjectagentid: "a1", issues: ["One row is stale."], requiredchanges: ["Re-read the footer."] });
    expect(outcome.requests[0]).toMatchObject({ state: "answered", answeredat: now + 1 });
    expect(() => applyreview({ requests: outcome.requests, id: "r1", reviewerid: "a2", verdict: "approve", issues: [], requiredchanges: [], now })).toThrow(/never reviews again/i);
    expect(() => applyreview({ requests, id: "r1", reviewerid: "a3", verdict: "approve", issues: [], requiredchanges: [], now })).toThrow(/routes to the agent/i);
    expect(() => applyreview({ requests, id: "r1", reviewerid: "a2", verdict: "changes", issues: [], requiredchanges: [], now })).toThrow(/required changes/i);
  });

  it("routes review requests only to another reviewing agent", () => {
    expect(() => requestreview({ requests: [], id: "r1", fromagentid: "a1", toagentid: "a1", subject: "s", payload: "p", now })).toThrow(/never its own requester/i);
    expect(() => requestreview({ requests: [], id: "r1", fromagentid: "a1", toagentid: "a2", subject: " ", payload: "p", now })).toThrow(/subject/i);
  });
});

describe("orchestration verifier pass and fail checks", () => {
  it("marks one claim pass with the method used and its evidence", () => {
    const pass = checkclaim({ id: "v1", verifierid: "a3", claimagentid: "a1", claim: "The table holds 42 rows.", method: "re-read", outcome: "pass", evidence: "The re-read counted 42 rows.", taskid: "t1", now });
    expect(pass).toMatchObject({ outcome: "pass", method: "re-read", evidence: "The re-read counted 42 rows." });
  });

  it("marks one claim fail and refuses a claim or method without words", () => {
    const fail = checkclaim({ id: "v2", verifierid: "a3", claimagentid: "a1", claim: "The footer shows the price.", method: "compare", outcome: "fail", now });
    expect(fail.outcome).toBe("fail");
    expect(fail.evidence).toBeUndefined();
    expect(fail.taskid).toBeUndefined();
    expect(() => checkclaim({ id: "v3", verifierid: "a3", claimagentid: "a1", claim: " ", method: "re-read", outcome: "pass", now })).toThrow(/claim/i);
    expect(() => checkclaim({ id: "v4", verifierid: "a3", claimagentid: "a1", claim: "c", method: " ", outcome: "pass", now })).toThrow(/method/i);
  });
});

describe("orchestration boardstate, escalation, arbitration and consensus", () => {
  it("aggregates the agents, queue and topology into progressboard lanes", () => {
    const agents = [agent({ id: "a1", name: "Scout" }), agent({ id: "a2", name: "Watcher", role: "observer" })];
    const enqueued = enqueue({ queue: emptyqueue({ lanes: ["extraction"] }), id: "t1", lane: "extraction", priority: 1, payload: "Read the table", now });
    const queue = { ...enqueued, items: enqueued.items.map(item => ({ ...item, state: "claimed" as const })), claims: [{ agentid: "a1", taskid: "t1", claimedat: now, heartbeatat: now }] };
    const topology: leaderworker = { id: "top", leaderid: "a9", workerids: ["a1"], criticids: [], verifierids: [], assignments: [{ workerid: "a1", taskid: "t1", slice: "Read the table", assignedat: now }], rule: { kind: "first" }, electedat: now };
    const board = boardstate({ agents, queue, topology, milestones: { a1: [{ label: "Rows read", done: true, at: now }] }, now });
    expect(board.lanes).toHaveLength(2);
    expect(board.lanes[0]).toMatchObject({ agentid: "a1", role: "worker", lane: "extraction", currenttask: "Read the table" });
    expect(board.lanes[0]?.milestones[0]).toMatchObject({ label: "Rows read", done: true });
    expect(board.lanes[1]).toMatchObject({ agentid: "a2", role: "observer", lane: "idle" });
  });

  it("lifts a stalled decision to the user and only the user decides it", () => {
    const raised = escalate({ id: "e1", agentid: "a1", subject: "Which origin to open next", context: "Both origins hold half of the table.", now });
    expect(raised).toMatchObject({ state: "open" });
    expect(raised.decision).toBeUndefined();
    const decided = resolveescalation({ escalation: raised, decision: "Open the second origin.", now: now + 1 });
    expect(decided).toMatchObject({ state: "decided", decision: "Open the second origin.", decidedat: now + 1 });
    expect(() => resolveescalation({ escalation: decided, decision: "Again.", now: now + 2 })).toThrow(/already carries/i);
    expect(() => escalate({ id: "e2", agentid: "a1", subject: "s", context: " ", now })).toThrow(/full context/i);
  });

  it("orders competing resource claims by the user rule and priority", () => {
    const claims = [{ agentid: "a2", claimedat: now + 5 }, { agentid: "a1", claimedat: now }, { agentid: "a3", claimedat: now + 2 }];
    const priority: arbitrationrule = { id: "rule1", strategy: "priority", priorityorder: ["a3", "a2"], configuredat: now };
    expect(arbitrate({ rule: priority, claims })).toEqual(["a3", "a2", "a1"]);
    expect(arbitrate({ rule: { ...priority, strategy: "age" }, claims })).toEqual(["a1", "a3", "a2"]);
    expect(arbitrate({ rule: { ...priority, strategy: "leader" }, leaderid: "a2", claims })).toEqual(["a2", "a1", "a3"]);
    expect(() => arbitrate({ rule: { ...priority, strategy: "leader" }, claims })).toThrow(/elected leader/i);
    expect(arbitrate({ rule: priority, claims: [] })).toEqual([]);
  });

  it("collects verdicts to the user configured quorum and closes the round", () => {
    const round = openconsensus({ id: "c1", subject: "Which lane runs first", quorum: 2, now });
    expect(round).toMatchObject({ state: "open", quorum: 2 });
    const first = castvote({ round, agentid: "a1", vote: "yes", now: now + 1 });
    expect(consensusstate(first)).toMatchObject({ yes: 1, no: 0, abstain: 0, quorum: 2, state: "open" });
    const carried = castvote({ round: first, agentid: "a2", vote: "yes", now: now + 2 });
    expect(carried.state).toBe("carried");
    expect(() => castvote({ round: carried, agentid: "a3", vote: "yes", now: now + 3 })).toThrow(/closed round/i);
    expect(() => castvote({ round: first, agentid: "a1", vote: "yes", now: now + 3 })).toThrow(/already voted/i);
    const failing = openconsensus({ id: "c2", subject: "Abort the run", quorum: 2, now });
    const votedno = castvote({ round: failing, agentid: "a1", vote: "no", now: now + 1 });
    expect(castvote({ round: votedno, agentid: "a2", vote: "no", now: now + 2 }).state).toBe("failed");
    expect(consensusstate(votedno).abstain).toBe(0);
    expect(() => openconsensus({ id: "c3", subject: "s", quorum: 0, now })).toThrow(/quorum/i);
  });

  it("builds handoff shaped records from the swarm shapes without losing the packaged state", () => {
    const record: handoffrecord = { id: "h1", fromagentid: "a1", toagentid: "a2", tabid: 7, taskstate: "Halfway through the footer.", state: "prepared", createdat: now };
    expect(record).toMatchObject({ state: "prepared", tabid: 7 });
  });
});
