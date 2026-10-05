/**
 * request.queue.ts — the request queue of the house: bounded concurrency,
 * priority ordering, cancellation of both queued and running work. Every
 * entry carries its own AbortController, so a task is written once and works
 * unchanged whether it runs immediately, waits in the queue or is cancelled
 * mid-flight. Pure TypeScript, node + browser (AbortController + Promise
 * only), zero DOM.
 *
 * Shape validated against the houses' existing swarm taskqueue (lanes and
 * claims live there; this module is the client-side gate for outbound
 * chat/agent requests that must not stampede the local gateway).
 */

/** Thrown when a queued task is cancelled before it starts. */
export class QueueCancelledError extends Error {
  constructor(message = "the request was cancelled while still queued") {
    super(message);
    this.name = "QueueCancelledError";
  }
}

/** The unit of work: receives the task's own abort signal. */
export type QueueTask<T> = (signal: AbortSignal) => Promise<T>;

export type QueueHandle<T> = {
  /** The queue-assigned id (caller-supplied when unique). */
  id: string;
  /** Resolves with the task result; rejects with QueueCancelledError when
   * cancelled while queued, or with the task's own error otherwise. */
  done: Promise<T>;
  /**
   * Cancels the task. Still queued: removed and `done` rejects with
   * QueueCancelledError. Already running: the abort signal fires and `done`
   * settles with the task's abort outcome.
   *
   * @returns true when the task was still queued and got removed.
   */
  cancel(): boolean;
};

export type RequestQueue<T> = {
  readonly concurrency: number;
  /** Enqueues a task. Higher priority runs first; ties stay FIFO. */
  enqueue(task: QueueTask<T>, opts?: { priority?: number; id?: string }): QueueHandle<T>;
  /** Cancels queued and running tasks; the queue drains to empty. */
  cancelAll(): void;
  /** Cancels only still-queued tasks; running ones finish. */
  clearQueued(): void;
  /** Counts at this instant. */
  stats(): { queued: number; running: number };
  /** Resolves when no task is queued or running. */
  waitIdle(): Promise<void>;
};

type Entry<T> = {
  id: string;
  priority: number;
  seq: number;
  task: QueueTask<T>;
  controller: AbortController;
  resolve: (value: T) => void;
  reject: (err: unknown) => void;
  settled: boolean;
};

let queueSeq = 0;

/**
 * createRequestQueue — builds the queue.
 *
 * @typeParam T the task result type.
 * @param opts.concurrency how many tasks run at once (1–16, default 1).
 * @returns the queue.
 */
export function createRequestQueue<T>(opts: { concurrency?: number } = {}): RequestQueue<T> {
  const concurrency = Math.min(Math.max(Math.floor(opts.concurrency ?? 1), 1), 16);
  const waiting: Array<Entry<T>> = [];
  const running = new Set<Entry<T>>();
  const idleWaiters: Array<() => void> = [];

  const isIdle = (): boolean => waiting.length === 0 && running.size === 0;

  const settle = (entry: Entry<T>, value: T): void => {
    if (entry.settled) return;
    entry.settled = true;
    entry.resolve(value);
  };
  const fail = (entry: Entry<T>, err: unknown): void => {
    if (entry.settled) return;
    entry.settled = true;
    entry.reject(err);
  };

  const pump = (): void => {
    while (running.size < concurrency && waiting.length > 0) {
      // highest priority first; ties in FIFO order (stable: lowest seq wins)
      let best = 0;
      for (let i = 1; i < waiting.length; i++) {
        if (waiting[i].priority > waiting[best].priority) best = i;
      }
      const entry = waiting.splice(best, 1)[0];
      running.add(entry);
      entry
        .task(entry.controller.signal)
        .then((value) => settle(entry, value))
        .catch((err: unknown) => fail(entry, err))
        .finally(() => {
          running.delete(entry);
          if (isIdle()) {
            for (const waiter of idleWaiters) waiter();
            idleWaiters.length = 0;
          }
          pump();
        });
    }
    if (isIdle()) {
      for (const waiter of idleWaiters) waiter();
      idleWaiters.length = 0;
    }
  };

  const cancelEntry = (entry: Entry<T>): boolean => {
    const idx = waiting.indexOf(entry);
    if (idx >= 0) {
      waiting.splice(idx, 1);
      fail(entry, new QueueCancelledError(`the request ${entry.id} was cancelled while still queued`));
      return true;
    }
    if (running.has(entry)) {
      entry.controller.abort();
      return false;
    }
    return false;
  };

  return {
    concurrency,
    enqueue(task, entryOpts = {}) {
      let resolve: (value: T) => void = () => {};
      let reject: (err: unknown) => void = () => {};
      const done = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      const entry: Entry<T> = {
        id: entryOpts.id ?? `q-${queueSeq++}`,
        priority: entryOpts.priority ?? 0,
        seq: queueSeq++,
        task,
        controller: new AbortController(),
        resolve,
        reject,
        settled: false,
      };
      waiting.push(entry);
      pump();
      return { id: entry.id, done, cancel: () => cancelEntry(entry) };
    },
    cancelAll() {
      for (const entry of [...waiting, ...running]) cancelEntry(entry);
      waiting.length = 0;
    },
    clearQueued() {
      for (const entry of [...waiting]) cancelEntry(entry);
    },
    stats() {
      return { queued: waiting.length, running: running.size };
    },
    waitIdle() {
      if (isIdle()) return Promise.resolve();
      return new Promise<void>((resolve) => idleWaiters.push(resolve));
    },
  };
}
