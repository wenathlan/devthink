import { describe, expect, it } from "vitest";
import {
  canceltask,
  claim,
  claimheartbeat,
  complete,
  emptyqueue,
  enqueue,
  lanereport,
  queuecomplete,
  requeue,
  steal,
  taskcounts,
} from "../swarm.js";
import type { taskqueue } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one queue fixture with the user configured lanes and priorities. */
function queue(over: Partial<taskqueue> = {}): taskqueue {
  return {
    lanes: ["extraction", "review"],
    priorities: [1, 2, 3],
    completionpolicy: "all",
    items: [],
    claims: [],
    ...over,
  };
}

describe("taskqueue enqueue claim complete", () => {
  it("enqueues a task item into a lane with its priority", () => {
    const withtask = enqueue({
      queue: queue(),
      id: "t1",
      lane: "extraction",
      priority: 2,
      payload: "Read the pricing table",
      now,
    });
    expect(withtask.items).toHaveLength(1);
    expect(withtask.items[0]).toMatchObject({ id: "t1", lane: "extraction", priority: 2, state: "queued" });
  });

  it("refuses a task outside the configured lanes or without a payload", () => {
    expect(() => enqueue({ queue: queue(), id: "t1", lane: "unknown", priority: 1, payload: "Task", now })).toThrow(
      /configured lanes/i,
    );
    expect(() => enqueue({ queue: queue(), id: "t1", lane: "extraction", priority: 1, payload: " ", now })).toThrow(
      /payload/i,
    );
    expect(() => enqueue({ queue: queue(), id: "t1", lane: " ", priority: 1, payload: "Task", now })).toThrow(/lane/i);
  });

  it("accepts any lane when the user configured no lanes at all", () => {
    const open = enqueue({ queue: emptyqueue(), id: "t1", lane: "anywhere", priority: 0, payload: "Task", now });
    expect(open.items[0]?.lane).toBe("anywhere");
  });

  it("lets one agent claim the highest priority task and complete releases the claim", () => {
    let state = enqueue({ queue: queue(), id: "t1", lane: "extraction", priority: 1, payload: "Low priority", now });
    state = enqueue({ queue: state, id: "t2", lane: "extraction", priority: 3, payload: "High priority", now });
    const claimed = claim({ queue: state, agentid: "a1", now });
    expect(claimed.task?.id).toBe("t2");
    expect(claimed.queue.claims[0]).toMatchObject({ agentid: "a1", taskid: "t2" });
    expect(claim({ queue: claimed.queue, agentid: "a1", now: now + 1 }).task?.id).toBe("t2");
    const completed = complete({ queue: claimed.queue, taskid: "t2", now: now + 2 });
    expect(completed.items.find((item) => item.id === "t2")?.state).toBe("done");
    expect(completed.claims).toHaveLength(0);
    const next = claim({ queue: completed, agentid: "a2", now: now + 3 });
    expect(next.task?.id).toBe("t1");
  });

  it("refuses the completion of a task that is not claimed", () => {
    const state = enqueue({ queue: queue(), id: "t1", lane: "review", priority: 1, payload: "Check", now });
    expect(() => complete({ queue: state, taskid: "t1", now })).toThrow(/only a claimed task/i);
    expect(() => complete({ queue: state, taskid: "missing", now })).toThrow(/not in the queue/i);
  });
});

describe("taskqueue priorities and ordering", () => {
  it("orders the claims by priority with the oldest task winning a tie", () => {
    let state = enqueue({ queue: queue(), id: "t1", lane: "extraction", priority: 2, payload: "Older", now });
    state = enqueue({ queue: state, id: "t2", lane: "extraction", priority: 2, payload: "Newer", now: now + 1 });
    state = enqueue({ queue: state, id: "t3", lane: "extraction", priority: 1, payload: "Lower", now: now + 2 });
    expect(claim({ queue: state, agentid: "a1", now }).task?.id).toBe("t1");
    const completed = complete({ queue: claim({ queue: state, agentid: "a1", now }).queue, taskid: "t1", now });
    expect(claim({ queue: completed, agentid: "a2", now }).task?.id).toBe("t2");
  });
});

describe("taskqueue work stealing", () => {
  it("lets an idle agent steal a queued task from a busy lane", () => {
    let state = enqueue({ queue: queue(), id: "t1", lane: "review", priority: 3, payload: "Busy lane task", now });
    const stolen = steal({ queue: state, agentid: "a2", role: "worker", fromlane: "review", now });
    expect(stolen.task?.id).toBe("t1");
    expect(stolen.queue.claims[0]).toMatchObject({ agentid: "a2", taskid: "t1" });
  });

  it("respects the lane ownership rules the user configures", () => {
    const state = enqueue({ queue: queue(), id: "t1", lane: "review", priority: 3, payload: "Owned lane task", now });
    const ownership = [{ lane: "review", roles: ["planner"] }];
    expect(() => steal({ queue: state, agentid: "a1", role: "worker", fromlane: "review", ownership, now })).toThrow(
      /roles planner/i,
    );
    const planned = steal({ queue: state, agentid: "a2", role: "planner", fromlane: "review", ownership, now });
    expect(planned.task?.id).toBe("t1");
  });

  it("steals nothing from an empty lane", () => {
    const stolen = steal({ queue: queue(), agentid: "a1", role: "worker", fromlane: "review", now });
    expect(stolen.task).toBeUndefined();
    expect(stolen.queue.items).toHaveLength(0);
  });
});

describe("taskqueue heartbeat expiry and requeue", () => {
  it("refreshes the claim heartbeats of one agent", () => {
    let state = enqueue({ queue: queue(), id: "t1", lane: "extraction", priority: 1, payload: "Task", now });
    state = claim({ queue: state, agentid: "a1", now }).queue;
    const beat = claimheartbeat({ queue: state, agentid: "a1", now: now + 4_000 });
    expect(beat.claims[0]?.heartbeatat).toBe(now + 4_000);
  });

  it("requeues the orphaned tasks whose claims expired past the window", () => {
    let state = enqueue({ queue: queue(), id: "t1", lane: "extraction", priority: 1, payload: "Orphan", now });
    state = claim({ queue: state, agentid: "a1", now }).queue;
    state = enqueue({ queue: state, id: "t2", lane: "extraction", priority: 1, payload: "Live", now });
    state = claim({ queue: state, agentid: "a2", now: now + 6_000 }).queue;
    const expired = requeue({ queue: state, now: now + 10_000, window: 5_000 });
    expect(expired.requeued).toEqual(["t1"]);
    expect(expired.queue.items.find((item) => item.id === "t1")?.state).toBe("queued");
    expect(expired.queue.items.find((item) => item.id === "t2")?.state).toBe("claimed");
    expect(expired.queue.claims.map((record) => record.taskid)).toEqual(["t2"]);
  });

  it("never expires a claim when no window is configured", () => {
    let state = enqueue({ queue: queue(), id: "t1", lane: "extraction", priority: 1, payload: "Held", now });
    state = claim({ queue: state, agentid: "a1", now }).queue;
    const outcome = requeue({ queue: state, now: now + 1_000_000 });
    expect(outcome.requeued).toEqual([]);
    expect(outcome.queue.items[0]?.state).toBe("claimed");
  });
});

describe("taskqueue reports and policies", () => {
  it("reports every lane with its task counts and live claims", () => {
    let state = enqueue({ queue: queue(), id: "t1", lane: "extraction", priority: 1, payload: "One", now });
    state = enqueue({ queue: state, id: "t2", lane: "review", priority: 2, payload: "Two", now });
    state = claim({ queue: state, agentid: "a1", now }).queue;
    const report = lanereport(state);
    expect(report.find((lane) => lane.lane === "extraction")).toMatchObject({
      queued: 1,
      claimed: 0,
      done: 0,
      cancelled: 0,
    });
    expect(report.find((lane) => lane.lane === "review")).toMatchObject({ queued: 0, claimed: 1 });
    expect(report.find((lane) => lane.lane === "review")?.claims[0]?.agentid).toBe("a1");
  });

  it("counts the tasks by claim state for the popup gauge", () => {
    let state = enqueue({ queue: queue(), id: "t1", lane: "extraction", priority: 1, payload: "One", now });
    state = enqueue({ queue: state, id: "t2", lane: "review", priority: 1, payload: "Two", now });
    state = claim({ queue: state, agentid: "a1", now }).queue;
    expect(taskcounts(state)).toEqual({ queued: 1, claimed: 1, done: 0, cancelled: 0 });
  });

  it("evaluates the completion policy of the queue", () => {
    let state = enqueue({ queue: queue(), id: "t1", lane: "extraction", priority: 1, payload: "One", now });
    state = enqueue({ queue: state, id: "t2", lane: "review", priority: 1, payload: "Two", now });
    expect(queuecomplete(state)).toBe(false);
    const anypolicy = enqueue({
      queue: emptyqueue({ completionpolicy: "any" }),
      id: "t1",
      lane: "extraction",
      priority: 1,
      payload: "Only",
      now,
    });
    expect(queuecomplete(anypolicy)).toBe(false);
    const claimedany = claim({ queue: anypolicy, agentid: "a1", now }).queue;
    expect(queuecomplete(complete({ queue: claimedany, taskid: "t1", now }))).toBe(true);
  });

  it("cancels a queued or claimed task and never a done one", () => {
    let state = enqueue({ queue: queue(), id: "t1", lane: "extraction", priority: 1, payload: "Cancel me", now });
    state = canceltask({ queue: state, taskid: "t1", now });
    expect(state.items[0]?.state).toBe("cancelled");
    state = enqueue({ queue: state, id: "t2", lane: "extraction", priority: 1, payload: "Claim then cancel", now });
    const claimed = claim({ queue: state, agentid: "a1", now }).queue;
    const cancelled = canceltask({ queue: claimed, taskid: "t2", now });
    expect(cancelled.items.find((item) => item.id === "t2")?.state).toBe("cancelled");
    expect(cancelled.claims).toHaveLength(0);
    const finished = complete({
      queue: claim({
        queue: enqueue({ queue: cancelled, id: "t3", lane: "review", priority: 1, payload: "Finish me", now }),
        agentid: "a2",
        now,
      }).queue,
      taskid: "t3",
      now: now + 1,
    });
    expect(() => canceltask({ queue: finished, taskid: "t3", now: now + 2 })).toThrow(/never cancels/i);
  });
});
