import { describe, expect, it } from "vitest";
import {
  backgroundqueueentryof,
  backgroundrunattention,
  backgroundrunsview,
  backgroundtrayrows,
  beginbackgroundrun,
  cancelbackgroundentry,
  enqueuebackgroundrun,
  finishbackgroundrun,
  nextbackgroundrun,
  resumebackgroundqueue,
} from "../run.js";
import { backgroundrungate } from "../policy.js";

const now = 1_800_000_000_000;

describe("background run queue", () => {
  it("enqueues reviewed workflows in order and picks the oldest first", () => {
    const first = backgroundqueueentryof({ workflowid: "wf-a", summary: "run a", now });
    const queue = enqueuebackgroundrun({ queue: [first], workflowid: "wf-b", summary: "run b", now: now + 1000 });
    expect(queue).toHaveLength(2);
    expect(nextbackgroundrun(queue)?.workflowid).toBe("wf-a");
    expect(nextbackgroundrun([])).toBeUndefined();
    expect(() => backgroundqueueentryof({ workflowid: " ", summary: "", now })).toThrow(/workflow id/);
  });

  it("holds the keepalive signal for the whole run behind the background run gate", () => {
    const entry = backgroundqueueentryof({ workflowid: "wf-a", summary: "run a", now });
    const begun = beginbackgroundrun(entry, now, true);
    expect(begun.gate.allowed).toBe(true);
    expect(begun.entry.state).toBe("running");
    expect(begun.entry.keepaliveheld).toBe(true);
    expect(begun.entry.startedat).toBe(now);
    const refused = beginbackgroundrun(entry, now, false);
    expect(refused.gate.allowed).toBe(false);
    expect(refused.entry.state).toBe("queued");
    expect(backgroundrungate({ reviewed: false, keepaliveheld: true }).allowed).toBe(false);
    expect(backgroundrungate({ reviewed: true, keepaliveheld: false }).allowed).toBe(false);
    expect(backgroundrungate({ reviewed: true, keepaliveheld: true }).allowed).toBe(true);
  });

  it("finishes runs, releases the hold and feeds the attentionfeed on failure", () => {
    const entry = beginbackgroundrun(
      backgroundqueueentryof({ workflowid: "wf-a", summary: "run a", now }),
      now,
      true,
    ).entry;
    const done = finishbackgroundrun(entry, "done", now + 4000);
    expect(done.state).toBe("done");
    expect(done.keepaliveheld).toBe(false);
    expect(done.endedat).toBe(now + 4000);
    expect(backgroundrunattention(done, "https://example.com")).toBeUndefined();
    const failed = finishbackgroundrun(entry, "failed", now + 4000);
    const attention = backgroundrunattention(failed, "https://example.com");
    expect(attention?.cause).toBe("failure");
    expect(attention?.summary).toMatch(/failed/);
    const queued = backgroundqueueentryof({ workflowid: "wf-b", summary: "run b", now });
    expect(backgroundrunattention(queued, "https://example.com")?.cause).toBe("deferral");
  });

  it("requeues interrupted running entries for restart recovery", () => {
    const running = beginbackgroundrun(
      backgroundqueueentryof({ workflowid: "wf-a", summary: "run a", now }),
      now,
      true,
    ).entry;
    const done = finishbackgroundrun(
      beginbackgroundrun(backgroundqueueentryof({ workflowid: "wf-b", summary: "run b", now }), now, true).entry,
      "done",
      now + 1000,
    );
    const recovered = resumebackgroundqueue([running, done], now + 5000);
    expect(recovered.requeued).toEqual([running.id]);
    expect(recovered.queue[0]?.state).toBe("queued");
    expect(recovered.queue[0]?.keepaliveheld).toBe(false);
    expect(recovered.queue[1]?.state).toBe("done");
  });

  it("renders the dashboard view, the recenttray background section and cancels queued entries only", () => {
    const queued = backgroundqueueentryof({ workflowid: "wf-a", summary: "run a", now });
    const running = beginbackgroundrun(
      backgroundqueueentryof({ workflowid: "wf-b", summary: "run b", now: now + 1 }),
      now,
      true,
    ).entry;
    const view = backgroundrunsview([queued, running]);
    expect(view[0]?.progress).toMatch(/Queued/);
    expect(view[1]?.progress).toMatch(/keepalive signal held/);
    const tray = backgroundtrayrows([finishbackgroundrun(running, "done", now + 100)], "https://example.com");
    expect(tray[0]?.outcome).toBe("completed");
    expect(tray[0]?.reopenable).toBe(true);
    const cancelled = cancelbackgroundentry([queued, running], queued.id);
    expect(cancelled.cancelled).toEqual([queued.id]);
    expect(cancelled.queue).toHaveLength(1);
    const notcancelled = cancelbackgroundentry([queued, running], running.id);
    expect(notcancelled.cancelled).toHaveLength(0);
    expect(notcancelled.queue).toHaveLength(2);
  });
});
