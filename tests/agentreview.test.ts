import { describe, expect, it } from "vitest";
import { consensusrecordof, escalationblock, outputcompare, recordverdict, reconstructreplay, reviewrecordof, runreplay } from "../agent.js";
import { escalate, resolveescalation } from "../swarm.js";
import { escalateholdgate, fleetoperationgrade, replayexportgate, reviewrequestgate } from "../policy.js";
import type { agentrecord, escalationrecord } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one fleet record fixture with every value user chosen. */
function record(over: Partial<agentrecord> = {}): agentrecord {
  return { id: "a1", name: "scout", role: "worker", origin: "https://example.com", state: "active", registeredat: now, lastseenat: now, ...over };
}

describe("agentreview escalation blocking and review request routing", () => {
  it("blocks the raising agent until the human answers and lifts the hold with the decision", () => {
    const raised = escalate({ id: "e1", agentid: "a1", subject: "Which pricing table should the extraction target?", context: "The page carries two tables and the plan covers one.", now });
    expect(raised.state).toBe("open");
    const held = escalationblock({ escalations: [raised], agentid: "a1" });
    expect(held.blocked).toBe(true);
    expect(held.reason).toMatch(/only the human answer lifts the hold/i);
    expect(escalateholdgate({ escalations: [raised], agentid: "a1" }).allowed).toBe(false);
    expect(escalateholdgate({ escalations: [raised], agentid: "a2" }).allowed).toBe(true);
    expect(escalationblock({ escalations: [raised], agentid: "a2" }).blocked).toBe(false);
    const decided = resolveescalation({ escalation: raised, decision: "Extract the second table; the first one repeats the header row.", now: now + 1_000 });
    expect(decided.state).toBe("decided");
    expect(escalateholdgate({ escalations: [decided], agentid: "a1" }).allowed).toBe(true);
    expect(escalationblock({ escalations: [decided], agentid: "a1" }).blocked).toBe(false);
  });

  it("routes one review request between two agents of the shared origin and records the verdict beside the original output", () => {
    const from = record();
    const to = record({ id: "a2", name: "mapper", role: "critic" });
    expect(reviewrequestgate({ from, to }).allowed).toBe(true);
    expect(reviewrequestgate({ from, to: record({ id: "a3", name: "outsider", origin: "https://other.example" }) }).allowed).toBe(false);
    const request = reviewrecordof({ id: "r1", fromagentid: "a1", toagentid: "a2", subject: "the extracted pricing rows", output: "rows: 12, columns: 4, currency: brl", now });
    expect(request.state).toBe("open");
    expect(() => reviewrecordof({ id: "r2", fromagentid: "a1", toagentid: "a1", subject: "self", output: "own", now })).toThrow(/never reviews its own/i);
    expect(() => recordverdict({ records: [request], id: "r1", reviewerid: "a3", verdict: "approve", now })).toThrow(/waits for the agent a2/i);
    expect(() => recordverdict({ records: [request], id: "r1", reviewerid: "a2", verdict: "reject", now })).toThrow(/names its issues/i);
    const answered = recordverdict({ records: [request], id: "r1", reviewerid: "a2", verdict: "changes", issues: ["the currency column missed the second page"], now: now + 1_000 });
    expect(answered.state).toBe("answered");
    expect(answered.verdict).toBe("changes");
    expect(answered.output).toBe("rows: 12, columns: 4, currency: brl");
    expect(answered.issues).toEqual(["the currency column missed the second page"]);
    expect(() => recordverdict({ records: [answered], id: "r1", reviewerid: "a2", verdict: "approve", now })).toThrow(/never rewrites/i);
  });
});

describe("agentreview runreplay capture and audit reconstruction", () => {
  it("captures the ordered steps and results of an agent run", () => {
    const capture = runreplay({ id: "p1", agentid: "a1", runid: "run1", steps: [
      { stepid: "s2", kind: "extract", summary: "read the pricing table", state: "done", at: now + 200 },
      { stepid: "s1", kind: "observe", summary: "snapshot the page", state: "done", at: now + 100 }
    ], now: now + 300 });
    expect(capture.steps.map(step => step.stepid)).toEqual(["s1", "s2"]);
    expect(capture.reconstructed).toBeUndefined();
    expect(() => runreplay({ id: "p2", agentid: "a1", runid: "run1", steps: [], now })).toThrow(/at least one recorded step/i);
  });

  it("reconstructs a run from the audit trail when the run memory is gone and marks the reconstruction", () => {
    const events = [
      { id: "ev1", kind: "action", summary: "The observe step s1 completed.", at: now + 100, agentid: "a1", stepid: "s1", planid: "run1" },
      { id: "ev2", kind: "error", summary: "The extract step s2 failed.", at: now + 200, agentid: "a1", stepid: "s2", planid: "run1" },
      { id: "ev3", kind: "action", summary: "The navigate step s3 of another agent completed.", at: now + 300, agentid: "a2", stepid: "s3", planid: "run2" }
    ];
    const rebuilt = reconstructreplay({ id: "p3", agentid: "a1", runid: "run1", events, now: now + 400 });
    expect(rebuilt.reconstructed).toBe(true);
    expect(rebuilt.steps.map(step => step.stepid)).toEqual(["s1", "s2"]);
    expect(rebuilt.steps.find(step => step.stepid === "s2")?.state).toBe("failed");
    expect(() => reconstructreplay({ id: "p4", agentid: "a9", runid: "run9", events, now })).toThrow(/carries no event/i);
    expect(replayexportgate({ consent: false, agentid: "a1" }).allowed).toBe(false);
    expect(replayexportgate({ consent: true, agentid: "a1" }).allowed).toBe(true);
  });
});

describe("agentreview outputcompare alignment and consensusvote tallies", () => {
  it("aligns two agent outputs field by field with matching, conflicting and missing fields", () => {
    const comparison = outputcompare({ id: "c1", subject: "the extracted totals", left: { agentid: "a1", fields: { rows: "12", currency: "brl", totals: "4" } }, right: { agentid: "a2", fields: { rows: "12", currency: "usd" } }, now });
    expect(comparison.matching).toEqual(["rows"]);
    expect(comparison.conflicting).toEqual(["currency"]);
    expect(comparison.missing).toEqual(["totals"]);
    expect(() => outputcompare({ id: "c2", subject: "self", left: { agentid: "a1", fields: {} }, right: { agentid: "a1", fields: {} }, now })).toThrow(/never competes with itself/i);
    expect(fleetoperationgrade("outputcompare").allowed).toBe(true);
    expect(fleetoperationgrade("consensusvote").allowed).toBe(true);
    expect(fleetoperationgrade("navigate").allowed).toBe(false);
  });

  it("collects one vote per agent, computes the outcome by the quorum rule and keeps the dissent", () => {
    const carried = consensusrecordof({ id: "v1", proposal: "the fleet extracts the second pricing table", votes: [
      { agentid: "a1", vote: "yes", castat: now },
      { agentid: "a2", vote: "yes", castat: now + 100 },
      { agentid: "a3", vote: "no", reason: "the first table carries the live prices", castat: now + 200 }
    ], quorum: 2, voters: 3, now: now + 300 });
    expect(carried.tally).toEqual({ yes: 2, no: 1, abstain: 0 });
    expect(carried.outcome).toBe("carried");
    expect(carried.votes.find(vote => vote.agentid === "a3")?.reason).toBe("the first table carries the live prices");
    expect(() => consensusrecordof({ id: "v2", proposal: "duplicate vote", votes: [
      { agentid: "a1", vote: "yes", castat: now },
      { agentid: "a1", vote: "no", castat: now + 100 }
    ], quorum: 1, now })).toThrow(/already voted/i);
    const failed = consensusrecordof({ id: "v3", proposal: "the fleet opens a second tab", votes: [
      { agentid: "a1", vote: "no", castat: now },
      { agentid: "a2", vote: "abstain", castat: now + 100 }
    ], quorum: 2, voters: 2, now: now + 200 });
    expect(failed.outcome).toBe("failed");
    const open = consensusrecordof({ id: "v4", proposal: "the fleet opens a second tab", votes: [{ agentid: "a1", vote: "yes", castat: now }], quorum: 2, voters: 3, now: now + 100 });
    expect(open.outcome).toBe("open");
    expect(open.closedat).toBeUndefined();
    expect(() => consensusrecordof({ id: "v5", proposal: "no quorum", votes: [], quorum: 0, now })).toThrow(/positive whole number/i);
  });
});
