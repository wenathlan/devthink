import { describe, expect, it } from "vitest";
import { deltachangesof, isemptydelta, regionfingerprint, skipsrecomputation, snapshotbaserecord, snapshotdeltaof } from "../perf.js";
import { incrsnapshotgate } from "../policy.js";
import { recorddeltas, recordperf } from "../progress.js";
import { perfrecordof } from "../perf.js";

const now = 1_800_000_000_000;
const base = [
  { region: "header", content: "Example header" },
  { region: "table", content: "one two three" },
  { region: "footer", content: "Example footer" },
];

describe("incrsnapshot delta computation", () => {
  it("computes only the changed regions with stable fingerprints", () => {
    const fingerprint = regionfingerprint("table", "one two three");
    expect(fingerprint).toBe(regionfingerprint("table", "one two three"));
    expect(fingerprint).not.toBe(regionfingerprint("table", "one two four"));
    const delta = snapshotdeltaof({ baseref: "base:1", runid: "run1", base, current: [...base, { region: "modal", content: "new" }], now });
    expect(delta.baseref).toBe("base:1");
    expect(delta.runid).toBe("run1");
    expect(delta.full).toBe(false);
    expect(delta.changes).toEqual([{ region: "modal", fingerprint: regionfingerprint("modal", "new"), kind: "added" }]);
    const changed = snapshotdeltaof({ baseref: "base:1", runid: "run1", base, current: [{ region: "header", content: "Example header" }, { region: "table", content: "one two four" }, { region: "footer", content: "Example footer" }], now });
    expect(changed.changes.map(change => change.kind)).toEqual(["changed"]);
    const removed = snapshotdeltaof({ baseref: "base:1", runid: "run1", base, current: [{ region: "header", content: "Example header" }, { region: "footer", content: "Example footer" }], now });
    expect(removed.changes.map(change => change.kind)).toEqual(["removed"]);
    expect(removed.changes[0]?.region).toBe("table");
  });

  it("returns the empty delta that lets the executor skip the recomputation in full", () => {
    const delta = snapshotdeltaof({ baseref: "base:1", runid: "run1", base, current: base, now });
    expect(delta.changes).toHaveLength(0);
    expect(isemptydelta(delta)).toBe(true);
    expect(skipsrecomputation(delta)).toBe(true);
    const changed = snapshotdeltaof({ baseref: "base:1", runid: "run1", base, current: [{ region: "header", content: "changed" }, { region: "table", content: "one two three" }, { region: "footer", content: "Example footer" }], now });
    expect(isemptydelta(changed)).toBe(false);
    expect(skipsrecomputation(changed)).toBe(false);
  });

  it("keeps the full snapshot cadence as a user choice and refuses baseless deltas", () => {
    expect(() => snapshotdeltaof({ baseref: " ", runid: "run1", base: [], current: [], now })).toThrow(/base snapshot ref/i);
    const full = snapshotdeltaof({ baseref: "base:1", runid: "run1", base, current: base, deltasince: 5, cadence: 5, now });
    expect(full.full).toBe(true);
    expect(full.changes).toHaveLength(0);
    expect(full.fingerprint).toBe("full:base:1");
    expect(isemptydelta(full)).toBe(false);
    const notdue = snapshotdeltaof({ baseref: "base:1", runid: "run1", base, current: base, deltasince: 4, cadence: 5, now });
    expect(notdue.full).toBe(false);
  });

  it("gates the delta on its same run base and keeps base records", () => {
    const delta = snapshotdeltaof({ baseref: "base:1", runid: "run1", base, current: base, now });
    expect(incrsnapshotgate({ delta, runid: "run1", baseexists: true }).allowed).toBe(true);
    expect(incrsnapshotgate({ delta, runid: "run1", baseexists: false }).allowed).toBe(false);
    expect(incrsnapshotgate({ delta, runid: "run2", baseexists: true }).allowed).toBe(false);
    expect(incrsnapshotgate({ delta, runid: "run2", baseexists: true }).reason).toMatch(/never crosses runs/i);
    const record = snapshotbaserecord({ runid: "run1", ref: "base:1", now });
    expect(record.runid).toBe("run1");
    expect(() => snapshotbaserecord({ runid: " ", ref: "base:1", now })).toThrow(/run id/i);
    expect(() => snapshotbaserecord({ runid: "run1", ref: " ", now })).toThrow(/ref/i);
    expect(deltachangesof(delta)).toEqual([]);
  });

  it("records the perf data and the delta change set beside the step outcomes in progress", () => {
    const perf = perfrecordof({ runid: "run1", stepid: "s1", duration: 12, queries: 3, cachehits: 2, delta: true, now, provenance: { origin: "https://example.com" } });
    let progress = recordperf(undefined, "run1", "s1", perf, now);
    progress = recorddeltas(progress, "run1", "s1", [{ region: "table", fingerprint: "abc12345", kind: "changed" }], now);
    expect((progress.perf ?? {}).s1?.cachehits).toBe(2);
    expect((progress.deltas ?? {}).s1).toEqual([{ region: "table", fingerprint: "abc12345", kind: "changed" }]);
    const latest = recordperf(progress, "run1", "s1", perfrecordof({ runid: "run1", stepid: "s1", duration: 20, queries: 1, cachehits: 1, delta: false, now: now + 10, provenance: {} }), now + 10);
    expect((latest.perf ?? {}).s1?.duration).toBe(20);
    expect((latest.deltas ?? {}).s1).toHaveLength(1);
  });
});
