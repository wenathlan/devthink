import { describe, expect, it } from "vitest";
import {
  agentbudgetof, agentname, agentscopeof, budgetremaining, broadcastrecipient, consensusrecordof,
  engagekillswitch, escalationblock, fleetoverview, mailboxof, outputcompare, pauseagent, readonlyscope,
  recordverdict, receivemessages, resolverecipients, reviewrecordof, roleaddress, sendmessage, spendbudget, unpauseagent,
  unreadcount,
} from "../agent.js";
import type { agentidentity, agentmailbox, agentrecord, escalationrecord, runrecord, taskqueue } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one fleet record fixture. */
function record(over: Partial<agentrecord> = {}): agentrecord {
  return { id: "a1", name: "scout", role: "worker", origin: "https://example.com", state: "active", registeredat: now, lastseenat: now, ...over };
}

/** Builds one identity fixture for the routing layer. */
function identity(id: string, over: Partial<agentidentity> = {}): agentidentity {
  return { id, name: `agent${id}`, role: "worker", depth: 0, state: "active", registeredat: now, ...over };
}

describe("torture: fleet naming discipline", () => {
  it("refuses reserved words, duplicates, invalid identifiers and blanks", () => {
    for (const reserved of ["user", "operator", "human", "system"]) {
      expect(() => agentname({ records: [], id: "a1", proposed: reserved, origin: "https://example.com", now })).toThrow(/reserved/i);
    }
    expect(() => agentname({ records: [record({ name: "scout" })], id: "a2", proposed: "Scout", origin: "https://example.com", now })).toThrow(/already registered/i);
    for (const invalid of ["", " ", "1abc", "-abc", "a b", "a-b", "a.b", "über", "abc!", "日本", "a_b"]) {
      expect(() => agentname({ records: [], id: "a1", proposed: invalid, origin: "https://example.com", now })).toThrow();
    }
    expect(agentname({ records: [], id: "a1", proposed: "A", origin: "https://example.com", now }).name).toBe("a");
    expect(() => agentname({ records: [], id: "", proposed: "scout", origin: "https://example.com", now })).toThrow(/needs its id/i);
    expect(() => agentname({ records: [], id: "a1", proposed: "scout", origin: " ", now })).toThrow(/home origin/i);
  });

  it("lowercases and trims the proposal before validating", () => {
    const named = agentname({ records: [], id: "a1", proposed: "  Scout  ", origin: "https://example.com", now });
    expect(named.name).toBe("scout");
    expect(named.role).toBe("worker");
    expect(agentname({ records: [], id: "a1", proposed: "scout", role: "reviewer", origin: "https://example.com", now }).role).toBe("reviewer");
  });

  it("accepts long single token identifiers and digits after the first letter", () => {
    const longname = "a" + "1".repeat(64);
    expect(agentname({ records: [], id: "a1", proposed: longname, origin: "https://example.com", now }).name).toBe(longname);
    expect(agentname({ records: [], id: "a1", proposed: "agent42", origin: "https://example.com", now }).name).toBe("agent42");
  });
});

describe("torture: scope intersection and narrowing", () => {
  it("refuses a request that lands entirely outside the grants", () => {
    expect(() => agentscopeof({ agentid: "a1", requested: { origins: ["https://evil.com"] }, grants: ["https://example.com"] })).toThrow(/never widens/i);
    expect(() => agentscopeof({ agentid: "a1", requested: { actionkinds: ["nuke"] }, allowedkinds: ["readtext", "click"] })).toThrow(/allowed catalog/i);
    expect(() => agentscopeof({ agentid: " ", })).toThrow(/agent id/i);
  });

  it("narrows partial requests while keeping the granted intersection", () => {
    const scope = agentscopeof({ agentid: "a1", requested: { origins: ["https://example.com", "https://evil.com"], actionkinds: ["readtext", "nuke"] }, grants: ["https://example.com", "https://shop.example"], allowedkinds: ["readtext", "click"] });
    expect(scope.origins).toEqual(["https://example.com"]);
    expect(scope.actionkinds).toEqual(["readtext"]);
  });

  it("keeps whitespace and empty entries out of every scope list", () => {
    const scope = agentscopeof({ agentid: "a1", requested: { origins: ["", "  ", "https://example.com"], actionkinds: ["", "  ", "readtext"] } });
    expect(scope.origins).toEqual(["https://example.com"]);
    expect(scope.actionkinds).toEqual(["readtext"]);
  });

  it("an absent request stays unbounded while an empty request stays empty", () => {
    const unbounded = agentscopeof({ agentid: "a1", grants: ["https://example.com"] });
    expect(unbounded.origins).toEqual([]);
    const empty = agentscopeof({ agentid: "a1", requested: { origins: [] }, grants: ["https://example.com"] });
    expect(empty.origins).toEqual([]);
  });

  it("readonly scopes need their kinds and never carry origins", () => {
    expect(() => readonlyscope({ agentid: "a1", readkinds: [] })).toThrow(/reads nothing/i);
    expect(() => readonlyscope({ agentid: "a1", readkinds: ["", "  "] })).toThrow(/reads nothing/i);
    const scope = readonlyscope({ agentid: "a1", readkinds: ["readtext", " snapshot "] });
    expect(scope.readonly).toBe(true);
    expect(scope.origins).toEqual([]);
    expect(scope.actionkinds).toEqual(["readtext", "snapshot"]);
    expect(() => readonlyscope({ agentid: "", readkinds: ["readtext"] })).toThrow(/agent id/i);
  });

  it("lookalike origins never intersect a grant by suffix or subdomain tricks", () => {
    expect(() => agentscopeof({ agentid: "a1", requested: { origins: ["https://example.com.evil.com"] }, grants: ["https://example.com"] })).toThrow(/never widens/i);
    expect(() => agentscopeof({ agentid: "a1", requested: { origins: ["https://evil.com/example.com"] }, grants: ["https://example.com"] })).toThrow(/never widens/i);
    const narrowed = agentscopeof({ agentid: "a1", requested: { origins: ["https://example.com", "http://example.com", "https://example.com.evil.com"] }, grants: ["https://example.com"] });
    expect(narrowed.origins).toEqual(["https://example.com"]);
  });
});

describe("torture: per agent budgets", () => {
  it("refuses non positive and non finite ceilings", () => {
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => agentbudgetof({ agentid: "a1", maxsteps: bad, now })).toThrow(/positive number/i);
      expect(() => agentbudgetof({ agentid: "a1", maxtokens: bad, now })).toThrow(/positive number/i);
      expect(() => agentbudgetof({ agentid: "a1", maxdurationms: bad, now })).toThrow(/positive number/i);
    }
    expect(() => agentbudgetof({ agentid: "", now })).toThrow(/agent id/i);
  });

  it("spends exactly to the ceiling and refuses one past it", () => {
    const { state } = agentbudgetof({ agentid: "a1", maxsteps: 3, now });
    let spent = spendbudget({ state, now: now + 1 });
    spent = spendbudget({ state: spent, now: now + 2 });
    spent = spendbudget({ state: spent, now: now + 3 });
    expect(spent.spentsteps).toBe(3);
    expect(() => spendbudget({ state: spent, now: now + 4 })).toThrow(/budgeted steps/i);
    expect(budgetremaining(spent).steps).toBe(0);
  });

  it("refuses negative, non finite and absurd spends", () => {
    const { state } = agentbudgetof({ agentid: "a1", now });
    expect(() => spendbudget({ state, steps: -1, now })).toThrow(/finite non negative/i);
    expect(() => spendbudget({ state, steps: Number.NaN, now })).toThrow(/finite non negative/i);
    expect(() => spendbudget({ state, tokens: Number.POSITIVE_INFINITY, now })).toThrow(/finite non negative/i);
    expect(() => spendbudget({ state, durationms: -0.5, now })).toThrow(/finite non negative/i);
    expect(spendbudget({ state, steps: 0, tokens: 0, durationms: 0, now }).spentsteps).toBe(0);
  });

  it("token and duration ceilings refuse at their own boundary", () => {
    const tokens = agentbudgetof({ agentid: "a1", maxtokens: 100, now }).state;
    const spenttokens = spendbudget({ state: tokens, tokens: 100, now });
    expect(() => spendbudget({ state: spenttokens, tokens: 1, now })).toThrow(/budgeted tokens/i);
    const duration = agentbudgetof({ agentid: "a1", maxdurationms: 1_000, now }).state;
    const spentduration = spendbudget({ state: duration, durationms: 1_000, now });
    expect(() => spendbudget({ state: spentduration, durationms: 1, now })).toThrow(/budgeted milliseconds/i);
  });

  it("reports unbounded ceilings absent from the budget", () => {
    const { state } = agentbudgetof({ agentid: "a1", now });
    const remaining = budgetremaining(state);
    expect(remaining.steps).toBeUndefined();
    expect(remaining.tokens).toBeUndefined();
    expect(remaining.durationms).toBeUndefined();
    expect(remaining.reason).toMatch(/unbounded/i);
  });
});

describe("torture: pause, unpause and the killswitch", () => {
  it("pauses and unpauses only the named agent while unknown ids refuse", () => {
    const fleet = [record({ id: "a1", name: "scout" }), record({ id: "a2", name: "worker" })];
    const paused = pauseagent({ records: fleet, agentid: "a1", now: now + 1 });
    expect(paused.find(entry => entry.id === "a1")?.state).toBe("paused");
    expect(paused.find(entry => entry.id === "a2")?.state).toBe("active");
    const resumed = unpauseagent({ records: paused, agentid: "a1", now: now + 2 });
    expect(resumed.find(entry => entry.id === "a1")?.state).toBe("active");
    expect(() => unpauseagent({ records: fleet, agentid: "a1", now })).toThrow(/not paused/i);
    expect(() => pauseagent({ records: fleet, agentid: "a3", now })).toThrow(/not registered/i);
    expect(() => unpauseagent({ records: fleet, agentid: "a3", now })).toThrow(/not registered/i);
    const stopped = [record({ id: "a1", name: "scout", state: "stopped" })];
    expect(() => pauseagent({ records: stopped, agentid: "a1", now })).toThrow(/stopped/i);
  });

  it("double pause stays paused and double unpause of an active agent refuses", () => {
    const fleet = [record()];
    const once = pauseagent({ records: fleet, agentid: "a1", now: now + 1 });
    const twice = pauseagent({ records: once, agentid: "a1", now: now + 2 });
    expect(twice.find(entry => entry.id === "a1")?.state).toBe("paused");
    expect(() => unpauseagent({ records: [record()], agentid: "a1", now })).toThrow(/not paused/i);
  });

  it("the killswitch stops every agent, cancels every agent run and clears every queue", () => {
    const fleet = [record({ id: "a1" }), record({ id: "a2", state: "paused" })];
    const runs: runrecord[] = [
      { runid: "r1", planid: "p1", sessionid: "s1", state: "running", createdat: now, updatedat: now, agentid: "a1" },
      { runid: "r2", planid: "p1", sessionid: "s1", state: "running", createdat: now, updatedat: now, agentid: "a2" },
      { runid: "r3", planid: "p1", sessionid: "s1", state: "completed", createdat: now, updatedat: now, agentid: "a1" },
      { runid: "r4", planid: "p1", sessionid: "s1", state: "running", createdat: now, updatedat: now },
    ];
    const queues: taskqueue[] = [{ lanes: [], priorities: [], completionpolicy: "all", items: [{ id: "t1", lane: "default", priority: 1, payload: "work", state: "queued", enqueuedat: now }], claims: [{ agentid: "a1", taskid: "t1", claimedat: now, heartbeatat: now }] }];
    const result = engagekillswitch({ records: fleet, runs, queues, now: now + 5 });
    expect(result.records.every(entry => entry.state === "stopped")).toBe(true);
    expect(result.runs.find(run => run.runid === "r1")?.state).toBe("cancelled");
    expect(result.runs.find(run => run.runid === "r2")?.state).toBe("cancelled");
    expect(result.runs.find(run => run.runid === "r3")?.state).toBe("completed");
    expect(result.runs.find(run => run.runid === "r4")?.state).toBe("running");
    expect(result.queues[0]?.items).toEqual([]);
    expect(result.queues[0]?.claims).toEqual([]);
    expect(result.stopped.length).toBe(2);
    expect(result.reason).toMatch(/killswitch/i);
  });

  it("fleet overview counts every control state exactly", () => {
    const fleet = [record({ id: "a1" }), record({ id: "a2", state: "paused" }), record({ id: "a3", state: "stopped" }), record({ id: "a4", state: "stopped" })];
    const overview = fleetoverview({ records: fleet, budgets: [], openescalations: 2, openreviews: 1, killswitchat: now });
    expect(overview).toMatchObject({ agents: 4, active: 1, paused: 1, stopped: 2, openescalations: 2, openreviews: 1, lastkillswitchat: now });
  });
});

describe("torture: mailbox routing and delivery", () => {
  it("direct messages refuse unknown recipients and self addressing", () => {
    const agents = [identity("a1"), identity("a2")];
    expect(() => sendmessage({ mailboxes: [], agents, id: "m1", senderid: "a1", recipient: "a3", routing: "direct", payload: "hello", now })).toThrow(/not registered/i);
    expect(() => sendmessage({ mailboxes: [], agents, id: "m1", senderid: "a1", recipient: "a1", routing: "direct", payload: "hello", now })).toThrow(/own sender/i);
    expect(() => sendmessage({ mailboxes: [], agents, id: "m1", senderid: "a1", recipient: "a2", routing: "direct", payload: " ", now })).toThrow(/needs its payload/i);
    expect(() => resolverecipients({ agents, senderid: "a1", recipient: "a3", routing: "direct" })).toThrow(/not registered/i);
  });

  it("broadcast reaches every live agent but the sender while stopped agents never receive", () => {
    const agents = [identity("a1"), identity("a2"), identity("a3", { state: "stopped" })];
    const recipients = resolverecipients({ agents, senderid: "a1", recipient: broadcastrecipient, routing: "broadcast" });
    expect(recipients).toEqual(["a2"]);
    const delivered = sendmessage({ mailboxes: [], agents, id: "m1", senderid: "a1", recipient: broadcastrecipient, routing: "broadcast", payload: "fleet update", now });
    expect(unreadcount(delivered, "a2")).toBe(1);
    expect(unreadcount(delivered, "a1")).toBe(0);
    expect(unreadcount(delivered, "a3")).toBe(0);
    expect(mailboxof(delivered, "a1").outbox.length).toBe(1);
    expect(mailboxof(delivered, "a3").inbox.length).toBe(0);
  });

  it("role routing reaches only the live agents of that role", () => {
    const agents = [identity("a1", { role: "worker" }), identity("a2", { role: "reviewer" }), identity("a3", { role: "worker", state: "stopped" })];
    expect(resolverecipients({ agents, senderid: "a1", recipient: "worker", routing: "role" })).toEqual(["a1"]);
    expect(resolverecipients({ agents, senderid: "a1", recipient: "reviewer", routing: "role" })).toEqual(["a2"]);
    expect(resolverecipients({ agents, senderid: "a1", recipient: "nonexistent", routing: "role" })).toEqual([]);
    expect(roleaddress(agents, "worker")).toEqual(["a1"]);
  });

  it("receives drain resets the unread counter, marks read times and keeps read state on re-drain", () => {
    const agents = [identity("a1"), identity("a2")];
    let mailboxes: agentmailbox[] = sendmessage({ mailboxes: [], agents, id: "m1", senderid: "a1", recipient: "a2", routing: "direct", payload: "one", now });
    mailboxes = sendmessage({ mailboxes, agents, id: "m2", senderid: "a1", recipient: "a2", routing: "direct", payload: "two", now: now + 1 });
    expect(unreadcount(mailboxes, "a2")).toBe(2);
    const drained = receivemessages({ mailboxes, agentid: "a2", now: now + 10 });
    expect(drained.messages.map(message => message.payload)).toEqual(["one", "two"]);
    expect(unreadcount(drained.mailboxes, "a2")).toBe(0);
    expect(drained.messages.every(message => message.readat === now + 10)).toBe(true);
    const again = receivemessages({ mailboxes: drained.mailboxes, agentid: "a2", now: now + 20 });
    expect(again.messages.every(message => message.readat === now + 10)).toBe(true);
  });

  it("unicode, emoji and control payloads travel without loss", () => {
    const agents = [identity("a1"), identity("a2")];
    const payload = "こんにちは 🌍 \x00\x01<script>alert(1)</script> שלום";
    const mailboxes = sendmessage({ mailboxes: [], agents, id: "m1", senderid: "a1", recipient: "a2", routing: "direct", payload, now });
    expect(mailboxof(mailboxes, "a2").inbox[0]?.payload).toBe(payload);
  });
});

describe("torture: escalation holds and review verdicts", () => {
  it("an open escalation blocks its agent while decided ones never block", () => {
    const escalations: escalationrecord[] = [
      { id: "e1", agentid: "a1", subject: "payment flow needs a human", state: "open", raisedat: now, context: "the checkout needs consent" },
      { id: "e2", agentid: "a2", subject: "resolved", state: "decided", raisedat: now, context: "", decision: "approved" },
    ];
    const blocked = escalationblock({ escalations, agentid: "a1" });
    expect(blocked.blocked).toBe(true);
    expect(blocked.open).toBe(1);
    expect(blocked.reason).toMatch(/only the human answer lifts/i);
    const free = escalationblock({ escalations, agentid: "a2" });
    expect(free.blocked).toBe(false);
    const unknown = escalationblock({ escalations, agentid: "a3" });
    expect(unknown.blocked).toBe(false);
  });

  it("review requests refuse self review, blanks and unknown reviewers", () => {
    expect(() => reviewrecordof({ id: "", fromagentid: "a1", toagentid: "a2", subject: "s", output: "o", now })).toThrow(/needs its id/i);
    expect(() => reviewrecordof({ id: "r1", fromagentid: "a1", toagentid: "a1", subject: "s", output: "o", now })).toThrow(/never reviews its own/i);
    expect(() => reviewrecordof({ id: "r1", fromagentid: "a1", toagentid: "a2", subject: " ", output: "o", now })).toThrow(/subject/i);
    expect(() => reviewrecordof({ id: "r1", fromagentid: "a1", toagentid: "a2", subject: "s", output: "", now })).toThrow(/original output/i);
    const open = reviewrecordof({ id: "r1", fromagentid: "a1", toagentid: "a2", subject: "verify the totals", output: "42", now });
    expect(open.state).toBe("open");
    expect(() => recordverdict({ records: [open], id: "r2", reviewerid: "a2", verdict: "approve", now })).toThrow(/does not exist/i);
    expect(() => recordverdict({ records: [open], id: "r1", reviewerid: "a3", verdict: "approve", now })).toThrow(/never answers a review addressed to another agent/i);
    expect(() => recordverdict({ records: [open], id: "r1", reviewerid: "a2", verdict: "reject", now })).toThrow(/names its issues/i);
  });

  it("verdicts answer once while rejections demand their issues", () => {
    const open = reviewrecordof({ id: "r1", fromagentid: "a1", toagentid: "a2", subject: "verify the totals", output: "42", now });
    expect(() => recordverdict({ records: [open], id: "r1", reviewerid: "a2", verdict: "reject", now: now + 1 })).toThrow(/names its issues/i);
    expect(() => recordverdict({ records: [open], id: "r1", reviewerid: "a2", verdict: "changes", now: now + 1 })).toThrow(/names its issues/i);
    const answered = recordverdict({ records: [open], id: "r1", reviewerid: "a2", verdict: "reject", issues: ["the totals miss the tax row"], now: now + 1 });
    expect(answered.state).toBe("answered");
    expect(answered.verdict).toBe("reject");
    expect(answered.issues).toEqual(["the totals miss the tax row"]);
    expect(() => recordverdict({ records: [answered], id: "r1", reviewerid: "a2", verdict: "approve", now: now + 2 })).toThrow(/never rewrites/i);
    const approved = recordverdict({ records: [reviewrecordof({ id: "r2", fromagentid: "a1", toagentid: "a2", subject: "s", output: "o", now })], id: "r2", reviewerid: "a2", verdict: "approve", now: now + 1 });
    expect(approved.verdict).toBe("approve");
    expect(approved.issues).toBeUndefined();
  });

  it("issue lists keep only meaningful entries", () => {
    const open = reviewrecordof({ id: "r1", fromagentid: "a1", toagentid: "a2", subject: "s", output: "o", now });
    const answered = recordverdict({ records: [open], id: "r1", reviewerid: "a2", verdict: "reject", issues: ["", "  ", "real issue"], now: now + 1 });
    expect(answered.issues).toEqual(["real issue"]);
  });
});

describe("torture: output comparison", () => {
  it("grades matching, conflicting and missing fields with sorted keys", () => {
    const comparison = outputcompare({ id: "c1", subject: "the pricing table", left: { agentid: "a1", fields: { price: "42", tax: "8", note: "left only" } }, right: { agentid: "a2", fields: { price: "42", tax: "9", extra: "right only" } }, now });
    expect(comparison.matching).toEqual(["price"]);
    expect(comparison.conflicting).toEqual(["tax"]);
    expect(comparison.missing.sort()).toEqual(["extra", "note"]);
  });

  it("refuses blanks, self comparison and unicode keys sort deterministically", () => {
    expect(() => outputcompare({ id: "", subject: "s", left: { agentid: "a1", fields: {} }, right: { agentid: "a2", fields: {} }, now })).toThrow(/needs its id/i);
    expect(() => outputcompare({ id: "c1", subject: " ", left: { agentid: "a1", fields: {} }, right: { agentid: "a2", fields: {} }, now })).toThrow(/subject/i);
    expect(() => outputcompare({ id: "c1", subject: "s", left: { agentid: "a1", fields: {} }, right: { agentid: "a1", fields: {} }, now })).toThrow(/never competes with itself/i);
    const comparison = outputcompare({ id: "c1", subject: "s", left: { agentid: "a1", fields: { b: "1", a: "2", "é": "3" } }, right: { agentid: "a2", fields: { b: "1", a: "9", "é": "3" } }, now });
    expect(comparison.matching.sort()).toEqual(["b", "é"].sort());
    expect(comparison.conflicting).toEqual(["a"]);
  });
});

describe("torture: consensus voting", () => {
  it("refuses blank ids, proposals, quorums and votes", () => {
    expect(() => consensusrecordof({ id: "", proposal: "p", votes: [], quorum: 1, now })).toThrow(/needs its id/i);
    expect(() => consensusrecordof({ id: "c1", proposal: " ", votes: [], quorum: 1, now })).toThrow(/proposal/i);
    expect(() => consensusrecordof({ id: "c1", proposal: "p", votes: [], quorum: 0, now })).toThrow(/positive whole number/i);
    expect(() => consensusrecordof({ id: "c1", proposal: "p", votes: [], quorum: 1.5, now })).toThrow(/positive whole number/i);
    expect(() => consensusrecordof({ id: "c1", proposal: "p", votes: [], quorum: -1, now })).toThrow(/positive whole number/i);
    expect(() => consensusrecordof({ id: "c1", proposal: "p", votes: [{ agentid: "", vote: "yes", castat: now }], quorum: 1, now })).toThrow(/names its agent/i);
  });

  it("duplicate voters refuse loudly", () => {
    const votes = [
      { agentid: "a1", vote: "yes" as const, castat: now },
      { agentid: "a1", vote: "yes" as const, castat: now + 1 },
    ];
    expect(() => consensusrecordof({ id: "c1", proposal: "adopt the plan", votes, quorum: 1, now })).toThrow(/one per agent/i);
  });

  it("carries at exactly the quorum, fails only when complete and stays open otherwise", () => {
    const twoyes = consensusrecordof({ id: "c1", proposal: "p", votes: [{ agentid: "a1", vote: "yes", castat: now }, { agentid: "a2", vote: "yes", castat: now }], quorum: 2, now });
    expect(twoyes.outcome).toBe("carried");
    expect(twoyes.closedat).toBe(now);
    const oneyes = consensusrecordof({ id: "c1", proposal: "p", votes: [{ agentid: "a1", vote: "yes", castat: now }], quorum: 2, voters: 1, now });
    expect(oneyes.outcome).toBe("failed");
    const incomplete = consensusrecordof({ id: "c1", proposal: "p", votes: [{ agentid: "a1", vote: "yes", castat: now }], quorum: 2, now });
    expect(incomplete.outcome).toBe("open");
    expect(incomplete.closedat).toBeUndefined();
    const complete = consensusrecordof({ id: "c1", proposal: "p", votes: [{ agentid: "a1", vote: "yes", castat: now }, { agentid: "a2", vote: "no", castat: now }], quorum: 2, voters: 2, now });
    expect(complete.outcome).toBe("failed");
    const abstaincarried = consensusrecordof({ id: "c1", proposal: "p", votes: [{ agentid: "a1", vote: "abstain", castat: now }, { agentid: "a2", vote: "yes", castat: now }], quorum: 1, voters: 2, now });
    expect(abstaincarried.outcome).toBe("carried");
  });

  it("tallies every vote kind and keeps the dissenting reasons", () => {
    const round = consensusrecordof({ id: "c1", proposal: "p", votes: [
      { agentid: "a1", vote: "yes", castat: now },
      { agentid: "a2", vote: "no", reason: "the tax row is missing", castat: now + 1 },
      { agentid: "a3", vote: "abstain", reason: "", castat: now + 2 },
    ], quorum: 5, now });
    expect(round.tally).toEqual({ yes: 1, no: 1, abstain: 1 });
    expect(round.votes.find(vote => vote.agentid === "a2")?.reason).toBe("the tax row is missing");
    expect(round.votes.find(vote => vote.agentid === "a3")?.reason).toBeUndefined();
    expect(round.outcome).toBe("open");
  });
});
