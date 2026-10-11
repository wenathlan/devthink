// # queue.test — the execution queue engine of the /queue page, runnable
// with the node built-in runner (no dependencies, no install):
//   node --test tests/queue.test.ts
// The queue never lies: storage is append-only, the serving order is
// priority first and FIFO inside the lane, the depth counts exactly and
// the rehearsal seed replays the same queue every time.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cancel,
  depthByPriority,
  dequeue,
  enqueue,
  nextUp,
  PRIORITY_RANK,
  positionOf,
  QUEUE_PRIORITIES,
  type QueueItem,
  queueDepth,
  queueFromSeed,
  queueOrder,
} from "../queue.ts";

/** a draft without the seq (enqueue stamps it) */
function draft(id: string, priority: QueueItem["priority"], seqLess: true = true): Omit<QueueItem, "seq"> {
  void seqLess;
  return { id, label: `run ${id}`, mode: "runner", priority, enqueuedAt: 0 };
}

describe("queue order", () => {
  it("serves express before normal before batch", () => {
    const queue = [draft("b", "batch"), draft("e", "express"), draft("n", "normal")] as QueueItem[];
    const seeded = queue.reduce((acc, item) => enqueue(acc, item), [] as QueueItem[]);
    assert.deepEqual(
      queueOrder(seeded).map((item) => item.id),
      ["e", "n", "b"],
    );
  });

  it("keeps FIFO inside a lane (arrival order breaks the ties)", () => {
    let queue: QueueItem[] = [];
    queue = enqueue(queue, draft("a1", "normal"));
    queue = enqueue(queue, draft("a2", "normal"));
    queue = enqueue(queue, draft("a3", "normal"));
    assert.deepEqual(
      queueOrder(queue).map((item) => item.id),
      ["a1", "a2", "a3"],
    );
  });

  it("ranks the priorities in serve order", () => {
    assert.equal(PRIORITY_RANK.express, 0);
    assert.equal(PRIORITY_RANK.normal, 1);
    assert.equal(PRIORITY_RANK.batch, 2);
    assert.deepEqual(QUEUE_PRIORITIES, ["express", "normal", "batch"]);
  });
});

describe("enqueue", () => {
  it("stamps monotonic arrival seqs", () => {
    let queue: QueueItem[] = [];
    queue = enqueue(queue, draft("a", "express"));
    queue = enqueue(queue, draft("b", "express"));
    queue = enqueue(queue, draft("c", "express"));
    assert.deepEqual(
      queue.map((item) => item.seq),
      [1, 2, 3],
    );
  });

  it("appends without mutating the input queue", () => {
    const before: QueueItem[] = [{ id: "x", label: "run x", mode: "docker", priority: "batch", seq: 1, enqueuedAt: 0 }];
    const after = enqueue(before, draft("y", "normal"));
    assert.equal(before.length, 1);
    assert.equal(after.length, 2);
    assert.deepEqual(before[0], { id: "x", label: "run x", mode: "docker", priority: "batch", seq: 1, enqueuedAt: 0 });
  });
});

describe("dequeue", () => {
  it("pops the head of the serving order and removes it", () => {
    let queue: QueueItem[] = [];
    queue = enqueue(queue, draft("batch-1", "batch"));
    queue = enqueue(queue, draft("express-1", "express"));
    const answer = dequeue(queue);
    assert.equal(answer.item?.id, "express-1");
    assert.equal(answer.queue.length, 1);
    assert.equal(answer.queue[0].id, "batch-1");
  });

  it("answers an honest empty when the queue is empty", () => {
    const answer = dequeue([]);
    assert.equal(answer.item, undefined);
    assert.equal(answer.queue.length, 0);
  });

  it("serves FIFO inside the lane across dequeues", () => {
    let queue: QueueItem[] = [];
    queue = enqueue(queue, draft("n1", "normal"));
    queue = enqueue(queue, draft("n2", "normal"));
    const first = dequeue(queue);
    const second = dequeue(first.queue);
    assert.equal(first.item?.id, "n1");
    assert.equal(second.item?.id, "n2");
  });
});

describe("cancel", () => {
  it("removes only the cancelled run", () => {
    let queue: QueueItem[] = [];
    queue = enqueue(queue, draft("a", "normal"));
    queue = enqueue(queue, draft("b", "normal"));
    const next = cancel(queue, "a");
    assert.deepEqual(
      next.map((item) => item.id),
      ["b"],
    );
  });

  it("keeps the queue untouched when the id is unknown", () => {
    const queue = enqueue(enqueue([], draft("a", "normal")), draft("b", "normal"));
    const next = cancel(queue, "ghost");
    assert.equal(next.length, 2);
  });
});

describe("depth and position", () => {
  it("counts the depth exactly", () => {
    let queue: QueueItem[] = [];
    for (let i = 0; i < 5; i++) queue = enqueue(queue, draft(`r${i}`, "batch"));
    assert.equal(queueDepth(queue), 5);
    assert.equal(queueDepth([]), 0);
  });

  it("counts the lanes per priority", () => {
    let queue: QueueItem[] = [];
    queue = enqueue(queue, draft("e1", "express"));
    queue = enqueue(queue, draft("n1", "normal"));
    queue = enqueue(queue, draft("n2", "normal"));
    queue = enqueue(queue, draft("b1", "batch"));
    const lanes = depthByPriority(queue);
    assert.equal(lanes.express, 1);
    assert.equal(lanes.normal, 2);
    assert.equal(lanes.batch, 1);
  });

  it("answers the position in the serving order", () => {
    let queue: QueueItem[] = [];
    queue = enqueue(queue, draft("express", "express"));
    queue = enqueue(queue, draft("normal", "normal"));
    queue = enqueue(queue, draft("batch", "batch"));
    assert.equal(positionOf(queue, "express"), 0);
    assert.equal(positionOf(queue, "batch"), 2);
    assert.equal(positionOf(queue, "ghost"), -1);
  });
});

describe("rehearsal queue", () => {
  it("replays the same queue from the same seed", () => {
    assert.deepEqual(queueFromSeed(731004, 7), queueFromSeed(731004, 7));
  });

  it("stamps unique ids and seqs on every item", () => {
    const queue = queueFromSeed(42, 9);
    assert.equal(queue.length, 9);
    assert.equal(new Set(queue.map((item) => item.id)).size, 9);
    assert.equal(new Set(queue.map((item) => item.seq)).size, 9);
  });

  it("answers nextUp as the head of the serving order", () => {
    const queue = queueFromSeed(731004, 7);
    assert.equal(nextUp(queue)?.id, queueOrder(queue)[0]?.id);
  });
});
