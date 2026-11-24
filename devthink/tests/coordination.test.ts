import { describe, expect, it } from "vitest";
import {
  acquirelock,
  compareoutputs,
  expirelocks,
  interleavetimeline,
  lockkey,
  mergeresults,
  preparehandoff,
  releaselock,
  replayagentrun,
  resumehandoff,
  scanconflicts,
  sharelesson,
  swarmcosts,
  swarmreport,
  transferhandoff,
} from "../agent.js";
import { emptyboard } from "../swarm.js";
import type { agentidentity, agentusage, mergeentry, resourcelock } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one agent identity fixture with every value user chosen. */
function agent(over: Partial<agentidentity> = {}): agentidentity {
  return {
    id: "a1",
    name: "Scout",
    role: "worker",
    depth: 0,
    state: "active",
    registeredat: now,
    heartbeatat: now,
    ...over,
  };
}

/** Builds one merge entry fixture of one parallel result. */
function entry(over: Partial<mergeentry> = {}): mergeentry {
  return { id: "m1", agentid: "a1", taskid: "t1", key: "rowcount", value: "42", mergedat: now, ...over };
}

describe("coordination tab handoffs", () => {
  const swarm = [agent({ id: "a1", name: "Scout", tabid: 7 }), agent({ id: "a2", name: "Scribe", tabid: 9 })];

  it("prepares the handoff with the packaged task state and the bound tab", () => {
    const record = preparehandoff({
      agents: swarm,
      id: "h1",
      fromagentid: "a1",
      toagentid: "a2",
      taskstate: "Halfway through the footer.",
      reason: "The user moved the work.",
      now,
    });
    expect(record).toMatchObject({ fromagentid: "a1", toagentid: "a2", tabid: 7, state: "prepared" });
    expect(record.reason).toBe("The user moved the work.");
    expect(() =>
      preparehandoff({ agents: swarm, id: "h2", fromagentid: "a1", toagentid: "a2", taskstate: " ", now }),
    ).toThrow(/packaged task state/i);
    expect(() =>
      preparehandoff({ agents: swarm, id: "h3", fromagentid: "a1", toagentid: "a1", taskstate: "State.", now }),
    ).toThrow(/never hands off to itself/i);
    expect(() =>
      preparehandoff({ agents: swarm, id: "h4", fromagentid: "missing", toagentid: "a2", taskstate: "State.", now }),
    ).toThrow(/not registered/i);
  });

  it("transfers the tab binding between the agents under the one agent per tab rule and resumes from the packaged state", () => {
    const prepared = preparehandoff({
      agents: swarm,
      id: "h1",
      fromagentid: "a1",
      toagentid: "a2",
      taskstate: "Halfway through the footer.",
      now,
    });
    const moved = transferhandoff({ agents: swarm, handoffs: [prepared], id: "h1", now: now + 1 });
    expect(moved.agents.find((candidate) => candidate.id === "a1")?.tabid).toBeUndefined();
    expect(moved.agents.find((candidate) => candidate.id === "a2")?.tabid).toBe(7);
    expect(moved.handoffs[0]).toMatchObject({ state: "transferred", transferredat: now + 1 });
    const resumed = resumehandoff({ handoffs: moved.handoffs, id: "h1", now: now + 2 });
    expect(resumed).toMatchObject({ state: "resumed", resumedat: now + 2, taskstate: "Halfway through the footer." });
    expect(() => resumehandoff({ handoffs: [resumed], id: "h1", now: now + 3 })).toThrow(
      /only a transferred handoff resumes/i,
    );
  });

  it("refuses the transfer onto a tab another live agent already holds", () => {
    const third = [agent({ id: "a3", name: "Probe", tabid: 7 })];
    const prepared = preparehandoff({
      agents: [swarm[0]!, ...third],
      id: "h1",
      fromagentid: "a1",
      toagentid: "a3",
      taskstate: "State.",
      now,
    });
    expect(() => transferhandoff({ agents: [swarm[0]!, ...third], handoffs: [prepared], id: "h1", now })).toThrow(
      /one tab binds one agent/i,
    );
    expect(() => transferhandoff({ agents: swarm, handoffs: [prepared], id: "h1", now })).toThrow(/not registered/i);
  });
});

describe("coordination resource locks", () => {
  const origin = "https://example.com";
  const selector = "#pricing table";

  it("acquires one exclusive lock keyed by the origin and the selector and refuses a second holder", () => {
    const first = acquirelock({ locks: [], holder: "a1", origin, selector, now });
    expect(first.acquired).toBe(true);
    expect(first.locks[0]).toMatchObject({
      key: `${origin}|${selector}`,
      holder: "a1",
      kind: "exclusive",
      origin,
      selector,
    });
    expect(lockkey(origin, selector)).toBe(`${origin}|${selector}`);
    const second = acquirelock({ locks: first.locks, holder: "a2", origin, selector, now });
    expect(second.acquired).toBe(false);
    expect(second.reason).toMatch(/held exclusively/i);
    const again = acquirelock({ locks: first.locks, holder: "a1", origin, selector, now });
    expect(again.acquired).toBe(false);
    expect(again.reason).toMatch(/already holds/i);
  });

  it("admits shared holders of one key while a mixed kind refuses", () => {
    const first = acquirelock({ locks: [], holder: "a1", origin, selector, kind: "shared", now });
    const second = acquirelock({ locks: first.locks, holder: "a2", origin, selector, kind: "shared", now });
    expect(second.acquired).toBe(true);
    expect(second.locks).toHaveLength(2);
    const mixed = acquirelock({ locks: first.locks, holder: "a3", origin, selector, kind: "exclusive", now });
    expect(mixed.acquired).toBe(false);
    expect(() => acquirelock({ locks: [], holder: " ", origin, selector, now })).toThrow(/holder/i);
    expect(() => acquirelock({ locks: [], holder: "a1", origin: " ", selector, now })).toThrow(/origin/i);
    expect(() => acquirelock({ locks: [], holder: "a1", origin, selector: " ", now })).toThrow(/selector/i);
  });

  it("releases one lock with its holder named and returns abandoned locks to the pool past the expiry", () => {
    const held = acquirelock({ locks: [], holder: "a1", origin, selector, expiresat: now + 1000, now }).locks;
    const released = releaselock({ locks: held, key: lockkey(origin, selector), holder: "a2", now: now + 1 });
    expect(released.released).toBe(false);
    const mine = releaselock({ locks: held, key: lockkey(origin, selector), holder: "a1", now: now + 1 });
    expect(mine.released).toBe(true);
    expect(mine.locks).toHaveLength(0);
    const stale: resourcelock = {
      key: lockkey(origin, selector),
      holder: "a1",
      kind: "exclusive",
      origin,
      selector,
      acquiredat: now,
      expiresat: now + 1000,
    };
    const eternal: resourcelock = {
      key: lockkey("https://other.example", "body"),
      holder: "a2",
      kind: "shared",
      origin: "https://other.example",
      selector: "body",
      acquiredat: now,
    };
    const swept = expirelocks({ locks: [stale, eternal], now: now + 2000 });
    expect(swept.expired).toEqual([`${lockkey(origin, selector)}:a1`]);
    expect(swept.locks).toEqual([eternal]);
    expect(expirelocks({ locks: [stale], now: now + 500 }).expired).toEqual([]);
  });
});

describe("coordination conflict scans", () => {
  it("detects the overlapping writes with their writers and the suggested ordering", () => {
    const scan = scanconflicts({
      id: "s1",
      writers: [
        { agentid: "a2", origin: "https://example.com", selector: "#form" },
        { agentid: "a1", origin: "https://example.com", selector: "#form" },
        { agentid: "a3", origin: "https://example.com", selector: "#table" },
      ],
      now,
    });
    expect(scan.clean).toBe(false);
    expect(scan.overlaps).toEqual([{ origin: "https://example.com", selector: "#form", writers: ["a2", "a1"] }]);
    expect(scan.suggestedorder).toEqual(["a1", "a2"]);
    expect(scan.writers).toHaveLength(3);
  });

  it("marks a scan clean when no writes overlap", () => {
    const scan = scanconflicts({
      id: "s2",
      writers: [
        { agentid: "a1", origin: "https://example.com", selector: "#form" },
        { agentid: "a2", origin: "https://other.example", selector: "#form" },
      ],
      now,
    });
    expect(scan.clean).toBe(true);
    expect(scan.overlaps).toEqual([]);
    expect(scan.suggestedorder).toEqual([]);
  });
});

describe("coordination result merging with conflict rules", () => {
  const parallel: mergeentry[] = [
    entry({ id: "m1", agentid: "a1", key: "rowcount", value: "42", mergedat: now }),
    entry({ id: "m2", agentid: "a2", key: "rowcount", value: "41", mergedat: now + 1 }),
    entry({ id: "m3", agentid: "a1", key: "title", value: "Pricing", mergedat: now + 2 }),
  ];

  it("keeps the earliest value under the first rule with the provenance and the conflict note", () => {
    const fold = mergeresults({ entries: parallel, rule: "first", now: now + 3 });
    expect(fold.refused).toBe(false);
    expect(fold.entries).toHaveLength(2);
    const rowcount = fold.entries.find((candidate) => candidate.key === "rowcount");
    expect(rowcount).toMatchObject({ value: "42", agentid: "a1" });
    expect(rowcount?.conflict).toMatch(/first rule kept the value of a1 from a1, a2/i);
    expect(fold.entries.find((candidate) => candidate.key === "title")?.conflict).toBeUndefined();
  });

  it("keeps the latest value under the last rule and the named agent under preferagent", () => {
    const last = mergeresults({ entries: parallel, rule: "last", now });
    expect(last.entries.find((candidate) => candidate.key === "rowcount")).toMatchObject({
      value: "41",
      agentid: "a2",
    });
    const preferred = mergeresults({ entries: parallel, rule: "preferagent", preferagent: "a2", now });
    expect(preferred.entries.find((candidate) => candidate.key === "rowcount")).toMatchObject({
      value: "41",
      agentid: "a2",
    });
    const fallback = mergeresults({ entries: parallel, rule: "preferagent", preferagent: "a3", now });
    expect(fallback.entries.find((candidate) => candidate.key === "rowcount")).toMatchObject({
      value: "41",
      agentid: "a2",
    });
    expect(fallback.conflicts[0]).toMatch(/names the agent a3 which wrote no value/i);
  });

  it("refuses the fold under the fail rule on any conflict", () => {
    const fold = mergeresults({ entries: parallel, rule: "fail", now });
    expect(fold.refused).toBe(true);
    expect(fold.conflicts[0]).toMatch(/fail rule refuses the fold/i);
    const single = mergeresults({ entries: [entry()], rule: "fail", now });
    expect(single.refused).toBe(false);
    expect(single.entries).toHaveLength(1);
  });

  it("builds the aggregate report across agents with sections, sources and confidence", () => {
    const built = swarmreport({
      id: "rep1",
      title: "The pricing extraction",
      outputs: parallel,
      rule: "first",
      confidence: "Every row was re-read once.",
      now,
    });
    expect(built.refused).toBe(false);
    expect(built.report).toMatchObject({ title: "The pricing extraction", confidence: "Every row was re-read once." });
    expect(built.report.sources).toEqual(["a1", "a2"]);
    expect(built.report.sections[0]).toMatchObject({ title: "Task t1", sources: ["a1", "a2"] });
    const refused = swarmreport({
      id: "rep2",
      title: "The conflicting extraction",
      outputs: parallel,
      rule: "fail",
      now,
    });
    expect(refused.refused).toBe(true);
    expect(() => swarmreport({ id: "rep3", title: " ", outputs: parallel, rule: "first", now })).toThrow(/title/i);
  });
});

describe("coordination comparison, timeline, lessons and costs", () => {
  it("contrasts the competing agent outputs for the user", () => {
    const comparison = compareoutputs({
      id: "c1",
      subject: "The row count",
      outputs: [
        { agentid: "a1", value: "42" },
        { agentid: "a2", value: "41" },
      ],
      now,
    });
    expect(comparison.differences).toHaveLength(1);
    expect(comparison.differences[0]).toMatch(/a2 answers 41 while the agent a1 answers 42/i);
    expect(() => compareoutputs({ id: "c2", subject: "s", outputs: [{ agentid: "a1", value: "42" }], now })).toThrow(
      /at least two/i,
    );
  });

  it("interleaves the actions of every agent into one ordered stream and replays one agent run", () => {
    const actions = [
      { id: "z9", kind: "claim", agentid: "a2", summary: "Second but earlier time.", at: now + 1 },
      { id: "a0", kind: "claim", agentid: "a1", summary: "First claim.", at: now },
      { id: "m5", kind: "handoff", summary: "The tab moved.", at: now + 2 },
    ];
    const stream = interleavetimeline(actions);
    expect(stream.map((action) => action.id)).toEqual(["a0", "z9", "m5"]);
    const replay = replayagentrun({
      events: [
        { id: "e1", kind: "claim", summary: "First claim.", at: now, agentid: "a1" },
        { id: "e2", kind: "lock", summary: "Lock held.", at: now + 1, agentid: "a2" },
        { id: "e3", kind: "complete", summary: "Done.", at: now + 2, agentid: "a1" },
      ],
      agentid: "a1",
    });
    expect(replay.map((action) => action.kind)).toEqual(["claim", "complete"]);
  });

  it("writes one verified lesson to the blackboard findings section", () => {
    const board = sharelesson({
      board: emptyboard(),
      id: "l1",
      agentid: "a1",
      statement: "The footer renders only after the scroll.",
      verifiedby: "a3",
      now,
    });
    const lesson = board.entries[0];
    expect(lesson).toMatchObject({
      key: expect.stringContaining("lesson:"),
      author: "a1",
      section: "findings",
      consentclass: "read",
    });
    expect(lesson?.value).toContain("verified by a3");
    expect(() =>
      sharelesson({ board: emptyboard(), id: "l2", agentid: "a1", statement: "Unverified.", verifiedby: " ", now }),
    ).toThrow(/verifier/i);
    expect(() =>
      sharelesson({ board: emptyboard(), id: "l3", agentid: "a1", statement: " ", verifiedby: "a3", now }),
    ).toThrow(/statement/i);
  });

  it("sums the per agent usage into the swarm totals", () => {
    const usage: agentusage[] = [
      { agentid: "a1", tokens: 100, cost: 0.5, steps: 3, updatedat: now },
      { agentid: "a2", tokens: 50, cost: 0.25, steps: 2, updatedat: now },
    ];
    const cost = swarmcosts({ usage, currency: "usd", now });
    expect(cost).toMatchObject({ agents: 2, tokens: 150, cost: 0.75, steps: 5, currency: "usd" });
    expect(swarmcosts({ usage: [], now }).tokens).toBe(0);
  });
});
