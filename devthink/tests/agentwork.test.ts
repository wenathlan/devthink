import { describe, expect, it } from "vitest";
import {
  aggregatereport,
  arbitrationcaseof,
  costentryof,
  depthlimitof,
  depthoflineage,
  interleave,
  lessondecay,
  lessonmatches,
  lessonrecordof,
  lessonreuse,
  loadreportof,
  prioritylaneof,
  releasecase,
  scalesuggestion,
  sharedcostsplit,
  spawnsubagent,
} from "../agent.js";
import {
  aggregateconflictescalationgate,
  aggregatemergegrade,
  arbitrationverdictgate,
  depthgate,
  lanechangegate,
  lessonsecretgate,
  lessonsanitizestep,
  scaleconsentgate,
  spawngate,
  subsetscopegate,
} from "../policy.js";
import type { agentrecord, agentscope, spawnrecord } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one fleet record fixture with every value user chosen. */
function record(over: Partial<agentrecord> = {}): agentrecord {
  return {
    id: "a1",
    name: "scout",
    role: "worker",
    origin: "https://example.com",
    state: "active",
    registeredat: now,
    lastseenat: now,
    ...over,
  };
}

/** Builds one parent scope fixture inside the session grants. */
function parentscope(over: Partial<agentscope> = {}): agentscope {
  return {
    agentid: "a1",
    origins: ["https://example.com", "https://shop.example"],
    toolnamespaces: ["browser", "memory"],
    actionkinds: ["observe", "readtext", "click"],
    ...over,
  };
}

describe("agentwork spawning and depth limits", () => {
  it("spawns a child under its parent with the copied scope and refuses paused parents and lineage depth jumps", () => {
    const parent = record({ id: "p1", name: "planner" });
    const spawned = spawnsubagent({
      records: [parent],
      spawns: [],
      spec: { parentid: "p1", objective: "Read the pricing table", depth: 1 },
      parentscope: parentscope(),
      id: "c1",
      now,
    });
    expect(spawned.record.name).toBe("plannersub1");
    expect(spawned.record.state).toBe("active");
    expect(spawned.scope.origins).toEqual(["https://example.com", "https://shop.example"]);
    expect(spawned.scope.actionkinds).toEqual(["observe", "readtext", "click"]);
    expect(spawned.spawn.objective).toBe("Read the pricing table");
    expect(subsetscopegate({ child: spawned.scope, parent: parentscope() }).allowed).toBe(true);
    const narrowed = spawnsubagent({
      records: [parent],
      spawns: [],
      spec: {
        parentid: "p1",
        objective: "Read the shop only",
        depth: 1,
        narrowscope: { origins: ["https://shop.example"], actionkinds: ["readtext"] },
      },
      parentscope: parentscope(),
      id: "c2",
      now,
    });
    expect(narrowed.scope.origins).toEqual(["https://shop.example"]);
    expect(narrowed.scope.actionkinds).toEqual(["readtext"]);
    expect(() =>
      spawnsubagent({
        records: [record({ id: "p1", name: "planner", state: "paused" })],
        spawns: [],
        spec: { parentid: "p1", objective: "No spawn from a paused parent", depth: 1 },
        parentscope: parentscope(),
        id: "c3",
        now,
      }),
    ).toThrow(/paused/i);
    expect(() =>
      spawnsubagent({
        records: [parent],
        spawns: [],
        spec: { parentid: "p1", objective: "Depth must stay one level under the parent", depth: 3 },
        parentscope: parentscope(),
        id: "c4",
        now,
      }),
    ).toThrow(/exactly one level under/i);
    expect(
      spawngate({ parentscope: parentscope(), objectiveorigin: "https://example.com", parentstate: "active" }).allowed,
    ).toBe(true);
    expect(
      spawngate({
        parentscope: parentscope({ origins: ["https://example.com"] }),
        objectiveorigin: "https://outside.example",
        parentstate: "active",
      }).allowed,
    ).toBe(false);
  });

  it("computes the lineage depth from the spawn records and refuses the configured depth limit while an absent limit stays unbounded", () => {
    const spawns: spawnrecord[] = [
      { id: "s1", parentid: "p1", childid: "c1", role: "worker", depth: 1, at: now },
      { id: "s2", parentid: "c1", childid: "g1", role: "worker", depth: 2, at: now },
      { id: "s3", parentid: "p1", childid: "c2", role: "worker", depth: 1, at: now },
    ];
    expect(depthoflineage({ spawns, agentid: "p1" })).toBe(0);
    expect(depthoflineage({ spawns, agentid: "c1" })).toBe(1);
    expect(depthoflineage({ spawns, agentid: "g1" })).toBe(2);
    expect(depthlimitof({ spawns, agentid: "g1", limit: { maxdepth: 3 } }).allowed).toBe(true);
    const refused = depthlimitof({ spawns, agentid: "g1", limit: { maxdepth: 1 } });
    expect(refused.allowed).toBe(false);
    expect(refused.depth).toBe(2);
    expect(depthlimitof({ spawns, agentid: "g1", limit: {} }).allowed).toBe(true);
    expect(depthgate({ depth: 3, limit: { maxdepth: 2 } }).allowed).toBe(false);
    expect(depthgate({ depth: 3, limit: {} }).allowed).toBe(true);
  });
});

describe("agentwork aggregation and interleaving", () => {
  it("merges parallel outputs with per agent provenance, resolves conflicts by policy order and escalates the unresolved", () => {
    const cells = [
      { agentid: "a1", runid: "run1", section: "output", output: "The price table holds 14 rows." },
      { agentid: "a2", runid: "run2", section: "output", output: "The price table holds 15 rows." },
      { agentid: "a1", runid: "run1", section: "notes", output: "The table sits under the hero." },
    ];
    const open = aggregatereport({ id: "agg1", subject: "The pricing table read", cells, now });
    expect(open.state).toBe("open");
    expect(open.conflicts).toEqual([{ key: "output" }]);
    const verdict = aggregateconflictescalationgate({
      unresolved: open.conflicts
        .filter((conflict) => conflict.resolvedby === undefined)
        .map((conflict) => conflict.key),
    });
    expect(verdict.allowed).toBe(false);
    const ordered = aggregatereport({
      id: "agg2",
      subject: "The pricing table read",
      cells,
      conflictorder: ["a2", "a1"],
      now,
    });
    expect(ordered.state).toBe("merged");
    expect(ordered.conflicts).toEqual([{ key: "output", resolvedby: "a2" }]);
    expect(ordered.cells.every((cell) => cell.agentid !== "" && cell.section !== "")).toBe(true);
    expect(aggregatemergegrade("aggregatereport").allowed).toBe(true);
    expect(aggregatemergegrade("spawnsubagent").allowed).toBe(false);
  });

  it("orders the actions of concurrent agents into one timeline while every event keeps its lane visible", () => {
    const lanes = [
      { name: "interactive", priority: 10, interactive: true, agentids: ["a1"] },
      { name: "background", priority: 1, agentids: ["a2"] },
    ];
    const events = [
      { agentid: "a2", kind: "readtext", summary: "The background agent read the table.", at: now + 300 },
      { agentid: "a1", kind: "click", summary: "The interactive agent opened the pricing page.", at: now + 100 },
      { agentid: "a2", kind: "observe", summary: "The background agent observed the hero.", at: now + 200 },
    ];
    const merged = interleave({ events, lanes });
    expect(merged.map((event) => event.kind)).toEqual(["click", "observe", "readtext"]);
    expect(merged[0]?.lane).toBe("interactive");
    expect(merged[1]?.lane).toBe("background");
    expect(merged[2]?.lane).toBe("background");
  });
});

describe("agentwork lessonshare", () => {
  it("records sanitized lessons, serves the matching ones, counts reuse and decays the stale", () => {
    const first = lessonrecordof({
      id: "l1",
      agentid: "a1",
      finding: "The pricing table loads only after the hero settles.",
      origin: "https://example.com",
      now,
    });
    const second = lessonrecordof({
      id: "l2",
      agentid: "a2",
      finding: "The login form refuses pasted passwords on the shop.",
      origin: "https://shop.example",
      now,
    });
    expect(first.reusecount).toBe(0);
    expect(lessonsecretgate({ text: "The api key = sk-abc123def456ghi789 of the shop." }).allowed).toBe(false);
    expect(lessonsecretgate({ text: "The pricing table loads only after the hero settles." }).allowed).toBe(true);
    expect(lessonsanitizestep("The token: abc123 loads the pricing table.")).toContain("[redacted]");
    const lessons = [first, second];
    const matches = lessonmatches({
      lessons,
      task: "Read the pricing table of the hero again",
      origin: "https://example.com",
    });
    expect(matches.map((lesson) => lesson.id)).toContain("l1");
    expect(matches.map((lesson) => lesson.id)).not.toContain("l2");
    const reused = lessonreuse({ lessons, id: "l1", now: now + 5000 });
    expect(reused.find((lesson) => lesson.id === "l1")?.reusecount).toBe(1);
    expect(reused.find((lesson) => lesson.id === "l1")?.lastusedat).toBe(now + 5000);
    const decayed = lessondecay({ lessons: reused, now: now + 10_000_000, stalewindow: 1_000_000 });
    expect(decayed.map((lesson) => lesson.id)).toEqual(["l1"]);
    const decayedall = lessondecay({ lessons: [first, second], now: now + 10_000_000, stalewindow: 1_000_000 });
    expect(decayedall.length).toBe(0);
    expect(lessondecay({ lessons: [first], now }).length).toBe(1);
  });
});

describe("agentwork arbitration and lanes", () => {
  it("grants the first requester by default, honors the priority lane, and releases when the holder finishes", () => {
    const lanes = [
      { name: "background", priority: 1, agentids: ["a1"] },
      { name: "fastlane", priority: 9, agentids: ["a2"] },
    ];
    const byfirst = arbitrationcaseof({
      id: "case1",
      resource: "https://example.com/pricing",
      origin: "https://example.com",
      requesters: ["a1", "a3"],
      lanes: [],
      now,
    });
    expect(byfirst.verdict?.holderagentid).toBe("a1");
    expect(byfirst.verdict?.reason).toContain("first requester");
    const bylane = arbitrationcaseof({
      id: "case2",
      resource: "https://example.com/pricing",
      origin: "https://example.com",
      requesters: ["a1", "a2"],
      lanes,
      now,
    });
    expect(bylane.verdict?.holderagentid).toBe("a2");
    expect(bylane.verdict?.lane).toBe("fastlane");
    expect(() =>
      arbitrationcaseof({
        id: "case3",
        resource: "https://example.com/pricing",
        origin: "https://example.com",
        requesters: ["a1"],
        lanes,
        now,
      }),
    ).toThrow(/at least two requesting agents/i);
    expect(
      arbitrationverdictgate({
        holderagentid: "a1",
        origin: "https://example.com",
        origingrants: ["https://example.com"],
      }).allowed,
    ).toBe(true);
    expect(
      arbitrationverdictgate({
        holderagentid: "a1",
        origin: "https://outside.example",
        origingrants: ["https://example.com"],
      }).allowed,
    ).toBe(false);
    expect(
      arbitrationverdictgate({ holderagentid: "a1", origin: "https://example.com", sessionlockholder: "another-run" })
        .allowed,
    ).toBe(false);
    const released = releasecase({ cases: [bylane], id: "case2", holderfinished: true, now: now + 1000 });
    expect(released.state).toBe("released");
    expect(released.closedat).toBe(now + 1000);
    expect(() => releasecase({ cases: [bylane], id: "case2", holderfinished: false, now })).toThrow(
      /holder.*still works/i,
    );
  });

  it("ranks the queue by lane priority, keeps sensitive steps in the interactive lane and prevents lane starvation through the round robin fallback", () => {
    const lanes = [
      { name: "interactive", priority: 10, interactive: true },
      { name: "high", priority: 5 },
      { name: "low", priority: 1 },
    ];
    const tasks = [
      { id: "high1", lane: "high", priority: 2, enqueuedat: now },
      { id: "high2", lane: "high", priority: 1, enqueuedat: now + 1 },
      { id: "low1", lane: "low", priority: 9, enqueuedat: now },
      { id: "low2", lane: "low", priority: 1, enqueuedat: now + 1 },
      { id: "sensitive1", lane: "low", priority: 1, sensitive: true, enqueuedat: now },
    ];
    const ordered = prioritylaneof({ tasks, lanes });
    expect(ordered[0]?.id).toBe("sensitive1");
    expect(ordered[0]?.lane).toBe("interactive");
    expect(ordered.slice(1).map((task) => task.lane)).toEqual(["high", "low", "high", "low"]);
    expect(lanechangegate({ lane: { name: "low", priority: 1 }, sensitive: true, confirmed: false }).allowed).toBe(
      false,
    );
    expect(lanechangegate({ lane: { name: "low", priority: 1 }, sensitive: true, confirmed: true }).allowed).toBe(true);
    expect(lanechangegate({ lane: { name: "low", priority: 1 }, sensitive: false, confirmed: false }).allowed).toBe(
      true,
    );
  });
});

describe("agentwork scaleworkers and costshare", () => {
  it("suggests spawning on low load, pausing on throttle, never acting without consent and splitting the shared costs", () => {
    const reports = [
      loadreportof({ origin: "https://example.com", concurrency: 1, latency: 80, now }),
      loadreportof({ origin: "https://shop.example", concurrency: 3, latency: 4500, now }),
    ];
    const suggestions = scalesuggestion({ reports, lowthreshold: 200, throttlethreshold: 4000 });
    expect(suggestions.find((suggestion) => suggestion.origin === "https://example.com")?.suggestion).toBe("spawn");
    expect(suggestions.find((suggestion) => suggestion.origin === "https://shop.example")?.suggestion).toBe("pause");
    expect(scaleconsentgate({ userconsented: false, origin: "https://example.com" }).allowed).toBe(false);
    expect(scaleconsentgate({ userconsented: true, origin: "https://example.com" }).allowed).toBe(true);
    expect(
      scalesuggestion({
        reports: [loadreportof({ origin: "https://example.com", concurrency: 2, latency: 900, now })],
        lowthreshold: 200,
        throttlethreshold: 4000,
      }).map((suggestion) => suggestion.suggestion),
    ).toEqual(["hold"]);
    const entries = [
      costentryof({ agentid: "a1", runid: "run1", units: 4, description: "The pricing table read.", now }),
      costentryof({ agentid: "a2", runid: "run2", units: 2, description: "The pricing table read.", now }),
      costentryof({ agentid: "a1", runid: "run1", units: 3, description: "The hero screenshot.", now }),
    ];
    const split = sharedcostsplit({ entries });
    const a1 = split.find((share) => share.agentid === "a1");
    const a2 = split.find((share) => share.agentid === "a2");
    expect(a1?.share).toBe(3);
    expect(a2?.share).toBe(0);
    expect(a1?.units).toBe(3 + 3);
    expect(a2?.units).toBe(3);
    expect(a1?.sharedwith).toEqual(["a2"]);
    expect(a2?.sharedwith).toEqual(["a1"]);
    expect(() =>
      costentryof({ agentid: "a1", units: 0, description: "A zero cost never enters the ledger.", now }),
    ).toThrow(/positive/i);
  });
});
