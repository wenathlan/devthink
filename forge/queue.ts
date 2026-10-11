// # queue — the run queue engine of the forge (root layer, pure logic).
// The execution queue of the runner floor: every run enters with a priority
// (express → normal → batch), keeps its place in arrival order and leaves
// through the head. Storage order never lies (append only); the serving
// order is a derived snapshot — priority first, FIFO inside the priority.
// Deterministic helpers seed a rehearsal queue, count the depth per
// priority and estimate the wait — no clocks, no randomness at serve time.
// This module is the testable core of the /queue page.

import type { RunnerMode } from "./runner.ts";

/** the three priorities of the floor: express cuts ahead, batch rides last. */
export type QueuePriority = "express" | "normal" | "batch";

/** the priorities in serve order. */
export const QUEUE_PRIORITIES: readonly QueuePriority[] = ["express", "normal", "batch"];

/** the numeric rank behind each priority (lower serves first). */
export const PRIORITY_RANK: Readonly<Record<QueuePriority, 0 | 1 | 2>> = { express: 0, normal: 1, batch: 2 };

/** one queued run. */
export interface QueueItem {
  /** the stable id of the queued run */
  id: string;
  /** what the run is (the label the floor shows) */
  label: string;
  /** the saddle runner mode the run asks for */
  mode: RunnerMode;
  /** the priority the run rides */
  priority: QueuePriority;
  /** the arrival sequence of the queue (monotonic, never reused) */
  seq: number;
  /** the enqueue tick (the caller's clock — the engine never reads one) */
  enqueuedAt: number;
}

/** the derived serving order: priority first, FIFO inside the priority. */
export function queueOrder(queue: readonly QueueItem[]): QueueItem[] {
  return [...queue].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.seq - b.seq);
}

/** appends a run to the queue, stamping the next arrival seq (storage is
 * append-only — the returned array is a new one, the input never mutates). */
export function enqueue(queue: readonly QueueItem[], draft: Omit<QueueItem, "seq">): QueueItem[] {
  const seq = queue.reduce((max, item) => Math.max(max, item.seq), 0) + 1;
  return [...queue, { ...draft, seq }];
}

/** removes a run from the queue by id (cancels); undefined id is a no-op. */
export function cancel(queue: readonly QueueItem[], id: string): QueueItem[] {
  return queue.filter((item) => item.id !== id);
}

/** pops the head of the serving order: the queue without it and the item
 * that left (undefined when the queue is empty — an honest empty answer). */
export function dequeue(queue: readonly QueueItem[]): { queue: QueueItem[]; item: QueueItem | undefined } {
  const order = queueOrder(queue);
  const item = order[0];
  if (!item) return { queue: [...queue], item: undefined };
  return { queue: queue.filter((entry) => entry.id !== item.id), item };
}

/** the depth of the queue (the one number the floor watches). */
export function queueDepth(queue: readonly QueueItem[]): number {
  return queue.length;
}

/** the depth per priority lane. */
export function depthByPriority(queue: readonly QueueItem[]): Readonly<Record<QueuePriority, number>> {
  const lanes: Record<QueuePriority, number> = { express: 0, normal: 0, batch: 0 };
  for (const item of queue) lanes[item.priority] += 1;
  return lanes;
}

/** the honest wait estimate of one item: how many runs ahead of it in the
 * serving order, scaled by the runners able to take them. */
export function positionOf(queue: readonly QueueItem[], id: string): number {
  const order = queueOrder(queue);
  const index = order.findIndex((item) => item.id === id);
  return index;
}

/** mulberry32 — the small deterministic prng of the family engines. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** the rehearsal labels the floor queues (honest build work, no fake repos). */
const REHEARSAL_LABELS: readonly string[] = [
  "build family site (pages)",
  "verify ladder (tests + lint)",
  "package release archive",
  "clone working set",
  "publish preview floor",
  "run smoke on the herd",
] as const;

/** a rehearsal queue, deterministic from the seed: n items with seeded
 * priorities, modes and labels (the surface says the queue is a seeded
 * rehearsal, never a live claim). */
export function queueFromSeed(seed: number, count = 6): QueueItem[] {
  const rand = mulberry32(seed);
  const labels = ["express", "normal", "batch"] as const;
  let queue: QueueItem[] = [];
  let modeIndex = 0;
  for (let i = 0; i < count; i++) {
    const priority = labels[Math.floor(rand() * labels.length)];
    const label = REHEARSAL_LABELS[i % REHEARSAL_LABELS.length];
    const modes: readonly RunnerMode[] = ["full-virtual", "runner", "node-packages", "docker", "ghcr"];
    const mode = modes[modeIndex % modes.length] as RunnerMode;
    modeIndex += 1 + Math.floor(rand() * 2);
    queue = enqueue(queue, {
      id: `q-${(seed >>> 0).toString(36)}-${String(i + 1).padStart(2, "0")}`,
      label,
      mode,
      priority,
      enqueuedAt: i * 90_000,
    });
  }
  return queue;
}

/** the floor rule the /queue page pins: the head of the serving order is
 * the run that leaves next — expressed as one pure answer. */
export function nextUp(queue: readonly QueueItem[]): QueueItem | undefined {
  return queueOrder(queue)[0];
}
