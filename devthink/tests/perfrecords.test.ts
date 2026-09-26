import { describe, expect, it } from "vitest";
import {
  abandonedparsetasks,
  captureplanschedule,
  dedupesnapshotrequests,
  perfbundle,
  perfrecordof,
  perfsummary,
  pruneperfrecords,
  queuedepthsampleof,
  queuedepthview,
  snapshotrequestkey,
  stepdurationchart,
  workerbackpressure,
} from "../perf.js";
import { perfprovenancegate, workerbackpressuregate } from "../policy.js";
import { perfreport } from "../protocol.js";
import { sessionmemory } from "../memory.js";

const now = 1_800_000_000_000;

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }
}

describe("worker queue backpressure", () => {
  it("defers parse tasks past the user configured depth and never refuses them", () => {
    expect(workerbackpressure({ depth: 8, pending: 8, configured: 5 })).toEqual({
      deferred: 3,
      admitted: 5,
      unbounded: false,
    });
    expect(workerbackpressure({ depth: 2, pending: 4, configured: 5 })).toEqual({
      deferred: 0,
      admitted: 4,
      unbounded: false,
    });
    expect(workerbackpressure({ depth: 9, pending: 9 })).toEqual({ deferred: 0, admitted: 9, unbounded: true });
    expect(workerbackpressuregate({ depth: 5, pending: 9 }).allowed).toBe(true);
    expect(workerbackpressuregate({ depth: 5, pending: 9 }).reason).toMatch(/defers and never refuses/i);
    expect(workerbackpressuregate({ pending: 9 }).reason).toMatch(/unbounded/i);
    expect(workerbackpressuregate({ depth: 0, pending: 9 }).allowed).toBe(false);
  });

  it("records the queue depth over time for tuning", () => {
    const sample = queuedepthsampleof({ depth: 4, deferred: 2, now });
    expect(sample).toEqual({ at: now, depth: 4, deferred: 2 });
    const view = queuedepthview([sample, queuedepthsampleof({ depth: 7, deferred: 0, now: now + 100 })]);
    expect(view).toEqual({ peak: 7, deferred: 2, samples: 2 });
  });

  it("cancels the abandoned parse tasks of a halted run while the other runs keep theirs", () => {
    const pending = [
      { id: "a", runid: "run1", started: false },
      { id: "b", runid: "run1", started: true },
      { id: "c", runid: "run2", started: false },
    ];
    const halted = abandonedparsetasks({ halted: true, runid: "run1", pending });
    expect(halted.cancelled).toEqual(["a"]);
    expect(halted.kept.sort()).toEqual(["b", "c"]);
    const running = abandonedparsetasks({ halted: false, runid: "run1", pending });
    expect(running.cancelled).toEqual([]);
    expect(running.kept).toHaveLength(3);
  });
});

describe("perf recording per step", () => {
  it("records one perf record per step with its provenance attached", () => {
    const record = perfrecordof({
      runid: "run1",
      stepid: "s1",
      duration: 120,
      queries: 5,
      cachehits: 3,
      delta: true,
      now,
      provenance: { origin: "https://example.com", environment: "offscreenworker", task: "htmlsnapshot" },
    });
    expect(record.delta).toBe(true);
    expect(perfprovenancegate(record).allowed).toBe(true);
    expect(() =>
      perfrecordof({ runid: " ", stepid: "s1", duration: 1, queries: 1, cachehits: 0, delta: false, now }),
    ).toThrow(/run id/i);
    expect(() =>
      perfrecordof({ runid: "run1", stepid: " ", duration: 1, queries: 1, cachehits: 0, delta: false, now }),
    ).toThrow(/step id/i);
    expect(perfprovenancegate({ ...record, provenance: {} }).allowed).toBe(false);
  });

  it("sums the perf summary and charts the step durations over the run", () => {
    const records = [
      perfrecordof({
        runid: "run1",
        stepid: "s1",
        duration: 100,
        queries: 4,
        cachehits: 2,
        delta: false,
        now: now + 100,
        provenance: { origin: "https://example.com" },
      }),
      perfrecordof({
        runid: "run1",
        stepid: "s2",
        duration: 300,
        queries: 6,
        cachehits: 3,
        delta: true,
        now: now + 50,
        provenance: { environment: "offscreenworker" },
      }),
    ];
    const summary = perfsummary(records);
    expect(summary).toEqual({
      steps: 2,
      duration: 400,
      average: 200,
      queries: 10,
      cachehits: 5,
      hitratio: 0.5,
      deltashare: 0.5,
    });
    expect(perfsummary([]).steps).toBe(0);
    const chart = stepdurationchart(records);
    expect(chart.map((point) => point.stepid)).toEqual(["s2", "s1"]);
    expect(chart[0]?.delta).toBe(true);
    const bundle = perfbundle({ runid: "run1", records });
    expect(bundle.records).toHaveLength(2);
    expect(bundle.summary.steps).toBe(2);
  });

  it("deduplicates identical snapshot requests within one run", () => {
    const requests = [
      { stepid: "s1", fingerprint: "f1" },
      { stepid: "s1", fingerprint: "f1" },
      { stepid: "s2", fingerprint: "f1" },
      { stepid: "s2", fingerprint: "f2" },
    ];
    const deduped = dedupesnapshotrequests({ runid: "run1", requests });
    expect(deduped.distinct).toHaveLength(3);
    expect(deduped.duplicates).toBe(1);
    expect(snapshotrequestkey({ runid: "run1", stepid: "s1", fingerprint: "f1" })).toBe("run1:s1:f1");
  });

  it("schedules the heavy capture work behind the user priority choice and never drops a capture", () => {
    const speed = captureplanschedule({ priority: "speed", heavy: ["capturevisible", "captureelement"] });
    expect(speed.beside).toHaveLength(0);
    expect(speed.deferred).toEqual(["capturevisible", "captureelement"]);
    expect(speed.note).toMatch(/still runs inside the reviewed plan/i);
    const evidence = captureplanschedule({ priority: "evidence", heavy: ["capturevisible"] });
    expect(evidence.beside).toEqual(["capturevisible"]);
    expect(evidence.deferred).toHaveLength(0);
    const unset = captureplanschedule({ heavy: ["capturevisible"] });
    expect(unset.beside).toEqual(["capturevisible"]);
  });

  it("prunes the perf records past the user configured retention window and exports the bundle", async () => {
    const store = new sessionmemory(new fakeadapter());
    const fresh = perfrecordof({
      runid: "run1",
      stepid: "s1",
      duration: 10,
      queries: 1,
      cachehits: 0,
      delta: false,
      now,
      provenance: { origin: "https://example.com" },
    });
    const old = perfrecordof({
      runid: "run1",
      stepid: "s2",
      duration: 20,
      queries: 2,
      cachehits: 1,
      delta: false,
      now: now - 10_000,
      provenance: { environment: "pagecontext" },
    });
    await store.addperfrecord(fresh);
    await store.addperfrecord(old);
    await store.recordqueuedepth(queuedepthsampleof({ depth: 3, deferred: 1, now }));
    expect(await store.getperfrecords()).toHaveLength(2);
    const pruned = await store.pruneperfrecords(5000, now);
    expect(pruned.pruned).toBe(1);
    expect(pruned.kept).toHaveLength(1);
    const unpruned = await store.pruneperfrecords(undefined, now);
    expect(unpruned.pruned).toBe(0);
    const bundle = await store.exportperfbundle("run1");
    expect(bundle.records).toHaveLength(1);
    expect(await store.getqueuedepths()).toHaveLength(1);
  });

  it("builds the perf report envelope for the dashboardpage", () => {
    const report = perfreport({
      runid: "run1",
      summary: { steps: 2, duration: 400, average: 200, queries: 10, cachehits: 5, hitratio: 0.5, deltashare: 0.5 },
      chart: [{ stepid: "s1", duration: 100, delta: false }],
      selcache: { generation: 3, entries: 4 },
      queue: { depth: 2, deferred: 1, peak: 6 },
      chunk: { tableid: "table1", extracted: 10, total: 25, complete: false },
    });
    expect(report.runid).toBe("run1");
    expect(report.chart[0]?.stepid).toBe("s1");
    expect(report.chunk?.tableid).toBe("table1");
    const minimal = perfreport({
      runid: "run2",
      summary: { steps: 0, duration: 0, average: 0, queries: 0, cachehits: 0, hitratio: 0, deltashare: 0 },
      chart: [],
      selcache: { generation: 0, entries: 0 },
      queue: { depth: 0, deferred: 0, peak: 0 },
    });
    expect(minimal.chunk).toBeUndefined();
    expect(() =>
      perfreport({
        runid: " ",
        summary: { steps: 0, duration: 0, average: 0, queries: 0, cachehits: 0, hitratio: 0, deltashare: 0 },
        chart: [],
        selcache: { generation: 0, entries: 0 },
        queue: { depth: 0, deferred: 0, peak: 0 },
      }),
    ).toThrow(/run id/i);
  });

  it("prunes the record list through the pure pruner beside the store", () => {
    const records = [
      perfrecordof({
        runid: "run1",
        stepid: "s1",
        duration: 1,
        queries: 1,
        cachehits: 0,
        delta: false,
        now,
        provenance: {},
      }),
      perfrecordof({
        runid: "run1",
        stepid: "s2",
        duration: 1,
        queries: 1,
        cachehits: 0,
        delta: false,
        now: now - 100,
        provenance: {},
      }),
    ];
    const pruned = pruneperfrecords(records, 50, now);
    expect(pruned.pruned).toBe(1);
    expect(pruneperfrecords(records, undefined, now).kept).toHaveLength(2);
  });
});
