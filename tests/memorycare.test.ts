import { describe, expect, it } from "vitest";
import {
  attachprovenance,
  auditexportof,
  bytesreclaimed,
  cleanupbatch,
  derivekey,
  decryptvalue,
  encryptvalue,
  expireditems,
  expiryof,
  exportchunks,
  exportready,
  issensitiveclass,
  matchingrule,
  memoryitemof,
  migrateitem,
  purgeitems,
  provenanceof,
  quotareportof,
  rankedcandidates,
  stepsummaryfor,
} from "../memory.js";
import {
  auditexportgate,
  encryptionsecretgate,
  encryptmemorygate,
  expirygate,
  exportprovenancegate,
  quotacleanupgate,
} from "../policy.js";
import { auditexportreport } from "../protocol.js";
import { sessionmemory } from "../memory.js";
import type { purgeoutcome } from "../memory.js";
import type { expiryrule, memoryitem, toolstep } from "../types.js";

const now = 1_800_000_000_000;
const origin = "https://example.com";
const steps: toolstep[] = [
  { id: "s1", kind: "click", target: "#submit", summary: "Click the reviewed submit control.", risk: "sensitive" },
  { id: "s2", kind: "observe", summary: "Read the page.", risk: "read" },
];

function itemof(key: string, memoryclass?: string, capturedat = now, expiresat?: number): memoryitem {
  return memoryitemof({
    key,
    value: { text: `value of ${key}` },
    provenance: provenanceof({ origin, runid: "run1", stepid: "s1", now: capturedat }),
    ...(memoryclass !== undefined ? { memoryclass } : {}),
    ...(expiresat !== undefined ? { expiresat } : {}),
  });
}

class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }
}

describe("provenance", () => {
  it("attaches a provenance record to every stored memory item and resolves its originating step summary", () => {
    const provenance = provenanceof({ origin, runid: "run1", stepid: "s1", now });
    expect(provenance).toEqual({ origin, runid: "run1", stepid: "s1", capturedat: now });
    expect(() => provenanceof({ origin: " ", runid: "run1", stepid: "s1", now })).toThrow(/origin/i);
    expect(() => provenanceof({ origin, runid: " ", stepid: "s1", now })).toThrow(/run id/i);
    expect(() => provenanceof({ origin, runid: "run1", stepid: " ", now })).toThrow(/step id/i);
    const item = itemof("note:1", "general");
    expect(item.provenance).toEqual(provenance);
    expect(() => memoryitemof({ key: " ", value: 1, provenance })).toThrow(/key/i);
    expect(attachprovenance(item, provenance).provenance).toEqual(provenance);
    expect(stepsummaryfor(item, steps)).toBe("Click the reviewed submit control.");
    const unknown = { ...item, provenance: { ...provenance, stepid: "sX" } };
    expect(stepsummaryfor(unknown, steps)).toMatch(/no longer carries/i);
    expect(issensitiveclass("credential")).toBe(true);
    expect(issensitiveclass("general")).toBe(false);
    expect(issensitiveclass(undefined)).toBe(false);
    expect(exportready([item]).ready).toBe(true);
    expect(exportready([{ ...item, provenance: { ...provenance, stepid: " " } }]).ready).toBe(false);
    expect(exportprovenancegate({ items: [item] }).allowed).toBe(true);
    expect(exportprovenancegate({ items: [{ ...item, provenance: { ...provenance, stepid: " " } }] }).allowed).toBe(
      false,
    );
  });
});

describe("expirememory", () => {
  it("evaluates the user expiryrules, purges behind the confirmation and keeps the summaries for the audit trail", () => {
    const rules: expiryrule[] = [
      { pattern: "note:", lifetime: 60_000 },
      { pattern: "*", lifetime: 600_000 },
    ];
    const fresh = itemof("note:1", "general", now);
    const stale = itemof("note:2", "general", now - 120_000);
    expect(matchingrule(rules, "note:1")?.pattern).toBe("note:");
    expect(matchingrule(rules, "anything")?.pattern).toBe("*");
    expect(matchingrule([], "note:1")).toBeUndefined();
    expect(expiryof(fresh, rules)).toBe(now + 60_000);
    expect(expiryof({ ...fresh, expiresat: now + 5 }, rules)).toBe(now + 5);
    expect(expiryof(fresh, [])).toBeUndefined();
    expect(expireditems([fresh, stale], rules, now).map((item) => item.key)).toEqual(["note:2"]);
    const unconfirmed = purgeitems({ items: [fresh, stale], rules, confirmed: false, now });
    expect(unconfirmed.purged).toHaveLength(0);
    expect(unconfirmed.kept).toHaveLength(2);
    const gate = expirygate({ confirmed: false, count: 1 });
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/waits behind the explicit confirmation/i);
    expect(expirygate({ confirmed: true, count: 1 }).allowed).toBe(true);
    expect(expirygate({ confirmed: true, count: 0 }).allowed).toBe(false);
    const purged = purgeitems({ items: [fresh, stale], rules, confirmed: true, now });
    expect(purged.kept.map((item) => item.key)).toEqual(["note:1"]);
    expect(purged.purged.map((entry) => entry.key)).toEqual(["note:2"]);
    expect(purged.purged[0]?.summary).toMatch(/purged/i);
    expect(purged.purged[0]?.provenance.stepid).toBe("s1");
    const outcome: purgeoutcome = purged.purged[0]!;
    expect(outcome.at).toBe(now);
  });
});

describe("quotawatch", () => {
  it("ranks the cleanup candidates by age and expiry policy, proposes batches behind the per batch approval and reports the reclaimed bytes", () => {
    const rules: expiryrule[] = [{ pattern: "note:", lifetime: 60_000 }];
    const expired = itemof("note:expired", "general", now - 120_000);
    const aged = itemof("cache:1", "capture", now - 500_000);
    const young = itemof("cache:2", "capture", now - 1_000);
    const plain = itemof("other:1", undefined, now);
    const report = quotareportof({ usage: 500, quota: 1_000, items: [expired, aged, young, plain], rules, now });
    expect(report.remaining).toBe(500);
    expect(report.candidates?.map((candidate) => candidate.key)).toEqual(["note:expired", "cache:1", "cache:2"]);
    expect(report.candidates?.[0]?.reason).toMatch(/expired under its user expiryrule/i);
    expect(report.candidates?.[1]?.reason).toMatch(/aged past its capture/i);
    expect(bytesreclaimed(report.candidates ?? []) > 0).toBe(true);
    const batch = cleanupbatch(report.candidates ?? [], 2);
    expect(batch).toHaveLength(2);
    expect(cleanupbatch(report.candidates ?? [], undefined)).toHaveLength(3);
    expect(quotacleanupgate({ approved: false, batch, touchesaudit: false }).allowed).toBe(false);
    expect(quotacleanupgate({ approved: true, batch, touchesaudit: false }).allowed).toBe(true);
    expect(quotacleanupgate({ approved: true, batch, touchesaudit: true }).allowed).toBe(false);
    expect(quotacleanupgate({ approved: true, batch: [], touchesaudit: false }).allowed).toBe(false);
    expect(bytesreclaimed(batch)).toBe(batch.reduce((total, candidate) => total + candidate.bytes, 0));
  });
});

describe("encryptrest", () => {
  it("derives the key from the user secret through the webcrypto api, roundtrips the value and migrates the predating items lazily", async () => {
    const key = await derivekey("user secret", "salt:run1");
    const value = { text: "sensitive body", count: 2 };
    const envelope = await encryptvalue(key, value);
    expect(envelope.iv).not.toBe("");
    expect(envelope.payload).not.toContain("sensitive body");
    const decrypted = await decryptvalue(key, envelope);
    expect(decrypted).toEqual(value);
    await expect(decryptvalue(await derivekey("other secret", "salt:run1"), envelope)).rejects.toThrow();
    await expect(derivekey("", "salt")).rejects.toThrow(/secret/i);
    const item = itemof("vault:1", "credential");
    const migrated = await migrateitem({ item, key, enabled: true });
    expect(migrated.encrypted).toBe(true);
    expect(await migrateitem({ item: migrated, key, enabled: true })).toEqual(migrated);
    expect(await migrateitem({ item, key, enabled: false })).toEqual(item);
    expect(encryptmemorygate({ memoryclass: "credential", enabled: true, encrypted: false }).allowed).toBe(false);
    expect(encryptmemorygate({ memoryclass: "credential", enabled: true, encrypted: true }).allowed).toBe(true);
    expect(encryptmemorygate({ memoryclass: "credential", enabled: false, encrypted: false }).allowed).toBe(true);
    expect(encryptmemorygate({ memoryclass: "general", enabled: true, encrypted: false }).allowed).toBe(true);
    const secretgate = encryptionsecretgate({ secret: "user secret", consented: true });
    expect(secretgate.allowed).toBe(true);
    expect(encryptionsecretgate({ secret: "", consented: true }).allowed).toBe(false);
    expect(encryptionsecretgate({ secret: "user secret", consented: false }).allowed).toBe(false);
  });
});

describe("auditexport", () => {
  it("bundles runs, memory, provenance and expiry rules into one record that streams without a size cap behind the explicit user action", () => {
    const items = [itemof("note:1", "general"), itemof("vault:1", "credential")];
    const rules: expiryrule[] = [{ pattern: "note:", lifetime: 60_000 }];
    const record = auditexportof({
      runs: [
        { runid: "run1", planid: "plan", sessionid: "session", state: "completed", createdat: now, updatedat: now },
      ],
      items,
      rules,
      timeline: [{ at: now, runid: "run1", source: "step", summary: "completed" }],
      locks: [{ holder: "run1", runid: "run1", sessionid: "session", acquiredat: now, expiresat: now + 1 }],
      now,
    });
    expect(record.memory).toHaveLength(2);
    expect(record.expiryrules).toEqual(rules);
    const chunks = exportchunks(record, 200);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.at(-1)?.done).toBe(true);
    expect(JSON.parse(chunks.map((chunk) => chunk.payload).join(""))).toEqual(record);
    expect(() => exportchunks(record, 0)).toThrow(/chunk size/i);
    expect(auditexportgate({ useraction: true }).allowed).toBe(true);
    expect(auditexportgate({ useraction: false }).allowed).toBe(false);
    const envelope = auditexportreport({ record });
    expect(envelope.record.at).toBe(now);
  });

  it("persists the memory items, the expiry rules, the quotareport, the encryption flag and the purge summaries through the memory accessors", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setmemoryitem(itemof("note:1", "general"));
    await store.setmemoryitem(itemof("note:2", "general", now, now + 60_000));
    expect((await store.getmemoryitems()).map((item) => item.key)).toEqual(["note:1", "note:2"]);
    await store.setmemoryitem({ ...itemof("note:1", "general"), value: { text: "updated" } });
    expect(await store.getmemoryitems()).toHaveLength(2);
    await store.removememoryitems(["note:1"]);
    expect((await store.getmemoryitems()).map((item) => item.key)).toEqual(["note:2"]);
    await store.setexpiry([{ pattern: "note:", lifetime: 60_000 }]);
    expect(await store.getexpiry()).toEqual([{ pattern: "note:", lifetime: 60_000 }]);
    await store.setquotareport({ usage: 10, quota: 100, remaining: 90 });
    expect((await store.getquotareport())?.remaining).toBe(90);
    expect(await store.getencryptrest()).toBe(false);
    await store.setencryptrest(true);
    expect(await store.getencryptrest()).toBe(true);
    await store.addpurgesummary({
      key: "note:1",
      summary: "purged",
      provenance: provenanceof({ origin, runid: "run1", stepid: "s1", now }),
      at: now,
    });
    expect((await store.listpurgesummaries()).map((entry) => entry.key)).toEqual(["note:1"]);
    await store.setlastexpirepass(now);
    expect(await store.getlastexpirepass()).toBe(now);
    const exported = await store.getexport(now);
    expect(exported.memory).toHaveLength(1);
    expect(exported.expiryrules).toHaveLength(1);
  });
});
