import { describe, expect, it } from "vitest";
import { artifactcompressof, artifactreadplan, batteryawarestateof, logpruneplan, networkbackoff, suspendplan, tabsuspendrestoreplan, tabsuspendstateof } from "../perf.js";
import { logprunegate, suspendwindowvalid } from "../policy.js";
import { carrywarmselector, joinlanes, openlanes, readparallelgroupof, warmselectorcarryvalid } from "../run.js";
import { sessionmemory } from "../memory.js";

const now = 1_800_000_000_000;

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> { return this.data.get(key) as T | undefined; }
  async set<T>(key: string, value: T): Promise<void> { this.data.set(key, value); }
}

describe("tabsuspend", () => {
  it("discards idle tabs only during waits longer than the user window", () => {
    expect(suspendplan({ waitduration: 9000, window: 5000 }).suspend).toBe(true);
    expect(suspendplan({ waitduration: 4000, window: 5000 }).suspend).toBe(false);
    expect(suspendplan({ waitduration: 9000 }).suspend).toBe(false);
    expect(suspendplan({ waitduration: 9000 }).reason).toMatch(/no suspend window/i);
    expect(suspendwindowvalid({ window: 5000 }).allowed).toBe(true);
    expect(suspendwindowvalid({}).reason).toMatch(/never suspend/i);
    expect(suspendwindowvalid({ window: 0 }).allowed).toBe(false);
  });

  it("restores a tab before the next step that needs it and preserves the run state across the suspend and restore", () => {
    const state = tabsuspendstateof({ tabid: 7, runid: "run1", restoreurl: "https://example.com/a", discarded: true, now });
    expect(state.discarded).toBe(true);
    expect(() => tabsuspendstateof({ tabid: 7, runid: " ", restoreurl: "https://example.com/a", discarded: false, now })).toThrow(/run id/i);
    const restore = tabsuspendrestoreplan({ state, nextneedsurl: "https://example.com/a" });
    expect(restore.restore).toBe(true);
    expect(restore.reload).toBe(true);
    const other = tabsuspendrestoreplan({ state, nextneedsurl: "https://example.com/b" });
    expect(other.restore).toBe(false);
    const intact = tabsuspendrestoreplan({ state: { ...state, discarded: false }, nextneedsurl: "https://example.com/a" });
    expect(intact.reload).toBe(false);
    expect(tabsuspendrestoreplan({ state, nextneedsurl: "" }).restore).toBe(true);
  });

  it("stores and clears the tabsuspend states per run", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setsuspendstate(tabsuspendstateof({ tabid: 7, runid: "run1", restoreurl: "https://example.com/a", discarded: false, now }));
    expect((await store.getsuspendstates())).toHaveLength(1);
    await store.clearsuspendstate("run1");
    expect((await store.getsuspendstates())).toHaveLength(0);
  });
});

describe("artifactcompress", () => {
  it("compresses captures and logs at rest and decompresses them lazily on read", () => {
    const record = artifactcompressof({ artifactid: "cap1", codec: "deflate", now });
    expect(record.lazy).toBe(true);
    expect(artifactreadplan(record).decode).toBe("lazy");
    expect(artifactreadplan(record).reason).toMatch(/lazily on read/i);
    expect(artifactcompressof({ artifactid: "cap1", now }).codec).toBe("store");
    expect(artifactreadplan(artifactcompressof({ artifactid: "cap1", codec: "store", lazy: false, now })).decode).toBe("immediate");
    expect(() => artifactcompressof({ artifactid: " ", now })).toThrow(/artifact id/i);
  });

  it("stores the artifactcompress records of the profile workspace", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addartifactcompress(artifactcompressof({ artifactid: "cap1", codec: "deflate", now }));
    expect((await store.getartifactcompress())).toHaveLength(1);
    await store.addartifactcompress(artifactcompressof({ artifactid: "cap1", codec: "store", now }));
    expect((await store.getartifactcompress())).toHaveLength(1);
  });
});

describe("logprune", () => {
  it("removes sealed logs past the user retention window while it prunes whole sealed runs only", () => {
    const sealed = [
      { runid: "old1", sealedat: now - 20_000, bytes: 100, sealed: true },
      { runid: "fresh", sealedat: now - 100, bytes: 100, sealed: true },
      { runid: "big", sealedat: now - 100, bytes: 900, sealed: true },
      { runid: "open", sealedat: now - 20_000, bytes: 100, sealed: false },
    ];
    const plan = logpruneplan({ sealed, rule: { retention: 10_000, sizewindow: 500 }, now });
    expect(plan.prune).toEqual(["old1", "big"]);
    expect(plan.keep).toEqual(["fresh"]);
    expect(plan.refused).toEqual(["open"]);
    expect(logprunegate({ plan: { prune: plan.prune, refused: plan.refused }, sealed }).allowed).toBe(true);
    expect(logprunegate({ plan: { prune: ["open"], refused: [] }, sealed }).allowed).toBe(false);
    expect(logprunegate({ plan: { prune: ["open"], refused: [] }, sealed }).reason).toMatch(/whole sealed runs only/i);
    expect(logpruneplan({ sealed, rule: {}, now }).prune).toEqual([]);
  });
});

describe("batteryaware", () => {
  it("defers non urgent scheduled runs on low battery and never cancels a run", () => {
    const low = batteryawarestateof({ level: 0.15, charging: false, floor: 0.3, scheduled: ["r1", "r2"], now });
    expect(low.deferred).toEqual(["r1", "r2"]);
    const charged = batteryawarestateof({ level: 0.15, charging: true, floor: 0.3, scheduled: ["r1"], now });
    expect(charged.deferred).toEqual([]);
    const high = batteryawarestateof({ level: 0.8, charging: false, floor: 0.3, scheduled: ["r1"], now });
    expect(high.deferred).toEqual([]);
    expect(batteryawarestateof({ level: 2, charging: false, scheduled: [], now }).level).toBe(1);
    expect(batteryawarestateof({ level: 0.1, charging: false, scheduled: ["r1"], now }).deferred).toEqual([]);
  });
});

describe("networkaware", () => {
  it("adapts the retry backoff to the failure kind and honors the server signals when present", () => {
    const rules = [
      { failurekind: "ratelimit", backoff: 5000 },
      { failurekind: "servererror", backoff: 2000 },
    ];
    expect(networkbackoff({ failurekind: "ratelimit", rules })).toBe(5000);
    expect(networkbackoff({ failurekind: "servererror", rules })).toBe(2000);
    expect(networkbackoff({ failurekind: "unknown", rules })).toBe(0);
    expect(networkbackoff({ failurekind: "ratelimit", rules, serversignal: 30_000 })).toBe(30_000);
  });
});

describe("readparallel", () => {
  it("groups independent page reads into parallel lanes and joins them before the dependent steps", () => {
    const group = readparallelgroupof({ runid: "run1", reads: [{ stepid: "s1", origin: "https://a.example" }, { stepid: "s2", origin: "https://b.example" }, { stepid: "s3", origin: "https://c.example" }], lanes: 2 });
    expect(group.lanes).toHaveLength(2);
    expect(group.joined).toBe(false);
    expect(openlanes(group)).toHaveLength(2);
    const joined = joinlanes(group);
    expect(joined.joined).toBe(true);
    expect(readparallelgroupof({ runid: "run1", reads: [{ stepid: "s1", origin: "https://a.example" }] }).lanes).toHaveLength(1);
    expect(() => readparallelgroupof({ runid: " ", reads: [] })).toThrow(/run id/i);
  });
});

describe("warmselectors", () => {
  it("carries validated selectors between adjacent steps and revalidates on a fingerprint change only", () => {
    const record = carrywarmselector({ selector: "#button", resolution: "resolved:#button", fingerprint: "fp1", from: "s1" });
    expect(record.carriedfrom).toBe("s1");
    expect(() => carrywarmselector({ selector: " ", resolution: "r", fingerprint: "fp1", from: "s1" })).toThrow(/selector/i);
    expect(() => carrywarmselector({ selector: "#button", resolution: "r", fingerprint: " ", from: "s1" })).toThrow(/fingerprint/i);
    const valid = warmselectorcarryvalid({ record, fingerprint: "fp1" });
    expect(valid.carry).toBe(true);
    expect(valid.reason).toMatch(/no revalidation/i);
    const changed = warmselectorcarryvalid({ record, fingerprint: "fp2" });
    expect(changed.carry).toBe(false);
    expect(changed.reason).toMatch(/revalidates/i);
  });
});
