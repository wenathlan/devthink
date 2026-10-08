import { describe, expect, it } from "vitest";
import { createRequestQueue, QueueCancelledError } from "../requestqueue.js";

/** Waits until the running count observed through the probe matches. */
async function until(fn: () => boolean): Promise<void> {
  for (let i = 0; i < 200; i++) {
    if (fn()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("condition never became true");
}

describe("requestqueue concurrency", () => {
  it("runs one task at a time at concurrency 1", async () => {
    const queue = createRequestQueue<void>({ concurrency: 1 });
    let active = 0;
    let peak = 0;
    const run = (): Promise<void> =>
      queue.enqueue(async () => {
        active++;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 10));
        active--;
      }).done;
    await Promise.all([run(), run(), run()]);
    expect(peak).toBe(1);
  });

  it("runs up to N tasks at once at concurrency 3", async () => {
    const queue = createRequestQueue<void>({ concurrency: 3 });
    let active = 0;
    let peak = 0;
    const run = (): Promise<void> =>
      queue.enqueue(async () => {
        active++;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 10));
        active--;
      }).done;
    await Promise.all([run(), run(), run(), run(), run()]);
    expect(peak).toBe(3);
  });

  it("keeps FIFO order within the same priority", async () => {
    const queue = createRequestQueue<string>({ concurrency: 1 });
    const order: string[] = [];
    const runs = ["a", "b", "c"].map((id) =>
      queue.enqueue(async () => {
        order.push(id);
        return id;
      }).done,
    );
    expect(await Promise.all(runs)).toEqual(["a", "b", "c"]);
    expect(order).toEqual(["a", "b", "c"]);
  });

  it("runs higher priority first among still-queued tasks", async () => {
    const queue = createRequestQueue<string>({ concurrency: 1 });
    const release = new Promise<void>((resolve) => setTimeout(resolve, 30));
    const order: string[] = [];
    const low = queue.enqueue(
      async () => {
        await release;
        order.push("low");
        return "low";
      },
      { priority: 1 },
    );
    // queued while the first task runs: the high-priority one must jump the line
    queue.enqueue(
      async () => {
        order.push("queued-low");
        return "queued-low";
      },
      { priority: 1 },
    );
    const high = queue.enqueue(
      async () => {
        order.push("high");
        return "high";
      },
      { priority: 10 },
    );
    expect(await high.done).toBe("high");
    expect(await low.done).toBe("low");
    expect(order[1]).toBe("high");
  });
});

describe("requestqueue cancellation", () => {
  it("rejects a queued task with the typed cancelled error", async () => {
    const queue = createRequestQueue<void>({ concurrency: 1 });
    const blocker = queue.enqueue(async () => new Promise<void>(() => {}));
    const victim = queue.enqueue(async () => {});
    expect(queue.stats().queued).toBe(1);
    const rejection = expect(victim.done).rejects.toThrow(QueueCancelledError);
    expect(victim.cancel()).toBe(true);
    await rejection;
    expect(queue.stats().queued).toBe(0);
    blocker.cancel();
  });

  it("aborts a running task through its own signal", async () => {
    const queue = createRequestQueue<string>({ concurrency: 1 });
    const handle = queue.enqueue(
      (signal) =>
        new Promise<string>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), { once: true });
        }),
    );
    await until(() => queue.stats().running === 1);
    expect(handle.cancel()).toBe(false); // already running: only the signal fires
    await expect(handle.done).rejects.toThrow();
    await queue.waitIdle();
  });

  it("cancelAll drains queued and running work and clearQueued keeps runners", async () => {
    const queue = createRequestQueue<void>({ concurrency: 1 });
    const blocker = queue.enqueue(
      (signal) =>
        new Promise<void>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
        }),
    );
    const queued = [queue.enqueue(async () => {}), queue.enqueue(async () => {})];
    for (const handle of queued) void handle.done.catch(() => {});
    await until(() => queue.stats().running === 1);
    queue.clearQueued();
    expect(queue.stats()).toEqual({ queued: 0, running: 1 });
    queue.cancelAll();
    // the aborted runner leaves the running set only once its promise settles
    await expect(blocker.done).rejects.toThrow("aborted");
    expect(queue.stats()).toEqual({ queued: 0, running: 0 });
  });
});

describe("requestqueue lifecycle", () => {
  it("waitIdle resolves when the queue drains", async () => {
    const queue = createRequestQueue<number>({ concurrency: 2 });
    expect(await queue.waitIdle()).toBeUndefined();
    const handles = [1, 2, 3].map((n) => queue.enqueue(async () => n));
    let idle = false;
    void queue.waitIdle().then(() => {
      idle = true;
    });
    const results = await Promise.all(handles.map((handle) => handle.done));
    expect(results).toEqual([1, 2, 3]);
    await until(() => idle);
    expect(idle).toBe(true);
  });

  it("assigns unique ids and honors caller-supplied ones", () => {
    const queue = createRequestQueue<void>();
    const a = queue.enqueue(async () => {});
    const b = queue.enqueue(async () => {}, { id: "chat-turn" });
    expect(a.id).not.toBe(b.id);
    expect(b.id).toBe("chat-turn");
    void a.done.catch(() => {});
    void b.done.catch(() => {});
  });
});
