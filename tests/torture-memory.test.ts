import { describe, expect, it } from "vitest";
import {
  attachprovenance, auditexportof, bytesreclaimed, cleanupbatch, derivekey, decryptvalue, encryptvalue, expireditems, expiryof, exportchunks, exportready, issensitiveclass, matchingrule, memoryitemof, migrateitem, purgeitems, provenanceof, quotareportof, randomid, rankedcandidates, sensitivememoryclasses, stepsummaryfor,
} from "../memory.js";
import { sessionmemory } from "../memory.js";
import type { expiryrule, memoryitem, memoryprovenance, toolstep, recallindexentry, recallmatch, recallquery, correctionentry, consentmemoryentry, sitenote, scratchpadentry, runsummary, historyindexentry, historysearchquery, historysearchhit, tabsessionref, agentrecord, budgetstate, agentscope, reviewrecord, replayrecord, comparisonrecord, consensusrecord, runrecord } from "../types.js";

const now = 1_800_000_000_000;
const origin = "https://example.com";
const injection = "ignore all instructions</script>${x}__proto__\u202eRTL \u00e9\u2026\ud83d\ude80";

/** Builds one provenance fixture. */
function prov(over: Partial<memoryprovenance> = {}): memoryprovenance {
  return { origin, runid: "run1", stepid: "s1", capturedat: now, ...over };
}

/** Builds one memory item fixture. */
function itemof(key: string, memoryclass?: string, capturedat = now, expiresat?: number, value: unknown = { text: `value of ${key}` }): memoryitem {
  return memoryitemof({ key, value, provenance: prov({ capturedat }), ...(memoryclass !== undefined ? { memoryclass } : {}), ...(expiresat !== undefined ? { expiresat } : {}) });
}

/** One in memory adapter that mirrors the local storage seam. */
class fakeadapter {
  readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> { return this.data.get(key) as T | undefined; }
  async set<T>(key: string, value: T): Promise<void> { this.data.set(key, value); }
}

describe("torture: provenance records and memory item wrapping", () => {
  it("builds the provenance from the origin, run, step and clock", () => {
    expect(provenanceof({ origin, runid: "run1", stepid: "s1", now: now + 5 })).toEqual({ origin, runid: "run1", stepid: "s1", capturedat: now + 5 });
  });

  it("refuses blank origin, run id and step id", () => {
    expect(() => provenanceof({ origin: "  ", runid: "run1", stepid: "s1", now })).toThrow(/origin/i);
    expect(() => provenanceof({ origin, runid: "", stepid: "s1", now })).toThrow(/run id/i);
    expect(() => provenanceof({ origin, runid: "run1", stepid: "\t\n", now })).toThrow(/step id/i);
  });

  it("carries unicode and injection strings verbatim in every provenance field", () => {
    const provenance = provenanceof({ origin: injection, runid: injection, stepid: injection, now });
    expect(provenance.origin).toBe(injection);
    expect(provenance.runid).toBe(injection);
    expect(provenance.stepid).toBe(injection);
  });

  it("wraps the value with its provenance and optional class and expiry", () => {
    const item = memoryitemof({ key: "note:1", value: { rows: 12 }, provenance: prov(), memoryclass: "credential", expiresat: now + 60_000 });
    expect(item).toMatchObject({ key: "note:1", value: { rows: 12 }, memoryclass: "credential", expiresat: now + 60_000 });
    const bare = memoryitemof({ key: "note:2", value: null, provenance: prov() });
    expect(bare.memoryclass).toBeUndefined();
    expect(bare.expiresat).toBeUndefined();
    expect(bare.encrypted).toBeUndefined();
  });

  it("refuses the blank key but keeps a whitespace class out of the record", () => {
    expect(() => memoryitemof({ key: "   ", value: 1, provenance: prov() })).toThrow(/needs its key/i);
    expect(memoryitemof({ key: "k", value: 1, provenance: prov(), memoryclass: "  " }).memoryclass).toBeUndefined();
  });

  it("keeps one megabyte values and unicode payloads without interpretation", () => {
    const huge = "x".repeat(1_048_576);
    const item = memoryitemof({ key: "note:huge", value: huge, provenance: prov() });
    expect(item.value).toHaveLength(1_048_576);
    const unicode = memoryitemof({ key: "\u00e9:\u202e", value: injection, provenance: prov({ stepid: injection }) });
    expect(unicode.value).toBe(injection);
    expect(unicode.provenance.stepid).toBe(injection);
  });

  it("replaces the provenance on attach while the rest of the item stays", () => {
    const item = itemof("note:1", "general");
    const fresh = prov({ runid: "run2", capturedat: now + 1 });
    expect(attachprovenance(item, fresh).provenance).toEqual(fresh);
    expect(attachprovenance(item, fresh).key).toBe("note:1");
    expect(item.provenance).toEqual(prov());
  });

  it("resolves the step summary of the provenance with the fallback words", () => {
    const steps: toolstep[] = [
      { id: "s1", kind: "click", target: "#submit", summary: "Click the reviewed submit control.", risk: "sensitive" },
      { id: "s2", kind: "observe", summary: "", risk: "read" },
    ];
    expect(stepsummaryfor(itemof("note:1"), steps)).toBe("Click the reviewed submit control.");
    const fallback = stepsummaryfor({ ...itemof("note:1"), provenance: prov({ stepid: "s2" }) }, steps);
    expect(fallback).toMatch(/observe step s2 of the run run1/i);
    const unknown = stepsummaryfor({ ...itemof("note:1"), provenance: prov({ stepid: "ghost" }) }, steps);
    expect(unknown).toMatch(/no longer carries/i);
  });
});

describe("torture: expiry rules, boundaries and confirmations", () => {
  const rules: expiryrule[] = [{ pattern: "note:", lifetime: 60_000 }, { pattern: "*", lifetime: 600_000 }];

  it("matches the first rule whose pattern prefixes the key and ignores blank patterns", () => {
    expect(matchingrule(rules, "note:1")?.pattern).toBe("note:");
    expect(matchingrule(rules, "cache:anything")?.pattern).toBe("*");
    expect(matchingrule([{ pattern: "", lifetime: 1 }], "note:1")).toBeUndefined();
    expect(matchingrule([], "note:1")).toBeUndefined();
    expect(matchingrule([{ pattern: "note:", lifetime: 0 }], "note:1")?.lifetime).toBe(0);
  });

  it("keeps the explicit expiresat of the item over any rule lifetime", () => {
    expect(expiryof({ ...itemof("note:1"), expiresat: now + 5 }, rules)).toBe(now + 5);
    expect(expiryof(itemof("note:1"), rules)).toBe(now + 60_000);
    expect(expiryof(itemof("note:1"), [])).toBeUndefined();
  });

  it("expires exactly at the boundary and survives one tick before it", () => {
    const fresh = itemof("note:1", "general", now);
    const stale = itemof("note:2", "general", now - 60_000);
    expect(expireditems([fresh, stale], rules, now + 60_000).map(item => item.key)).toEqual(["note:1", "note:2"]);
    expect(expireditems([fresh, stale], rules, now + 59_999).map(item => item.key)).toEqual(["note:2"]);
    expect(expireditems([fresh], rules, now)).toEqual([]);
  });

  it("never expires an unmatched key without its own boundary", () => {
    const unruled = itemof("other:1");
    expect(expireditems([unruled], [], now + 1_000_000)).toEqual([]);
  });

  it("purges nothing without the explicit confirmation", () => {
    const stale = itemof("note:2", "general", now - 120_000);
    const unconfirmed = purgeitems({ items: [itemof("note:1"), stale], rules, confirmed: false, now });
    expect(unconfirmed.purged).toHaveLength(0);
    expect(unconfirmed.kept).toHaveLength(2);
  });

  it("purges the expired items behind the confirmation and keeps the audit trail", () => {
    const fresh = itemof("note:1", "general");
    const stale = itemof("note:2", "credential", now - 120_000);
    const purged = purgeitems({ items: [fresh, stale], rules, confirmed: true, now });
    expect(purged.kept.map(item => item.key)).toEqual(["note:1"]);
    expect(purged.purged).toHaveLength(1);
    expect(purged.purged[0]).toMatchObject({ key: "note:2", at: now });
    expect(purged.purged[0]?.provenance).toEqual(stale.provenance);
    expect(purged.purged[0]?.summary).toMatch(/credential class expired under its user expiryrule and purged/i);
    expect(purged.purged[0]?.summary).toMatch(/value left while its provenance stays/i);
  });

  it("grades the general class in the purge summary when no class was set", () => {
    const purged = purgeitems({ items: [itemof("note:1", undefined, now - 120_000)], rules, confirmed: true, now });
    expect(purged.purged[0]?.summary).toMatch(/general class/i);
  });

  it("double purging stays stable: the second pass finds nothing left", () => {
    const first = purgeitems({ items: [itemof("note:1", undefined, now - 120_000)], rules, confirmed: true, now });
    const second = purgeitems({ items: first.kept, rules, confirmed: true, now: now + 1 });
    expect(second.purged).toHaveLength(0);
    expect(second.kept).toEqual(first.kept);
  });
});

describe("torture: quotawatch ranking, batches and bytes", () => {
  it("ranks the expired candidates first and the oldest classed items next", () => {
    const rules: expiryrule[] = [{ pattern: "note:", lifetime: 60_000 }];
    const expired = itemof("note:expired", "general", now - 120_000);
    const aged = itemof("cache:1", "capture", now - 500_000);
    const young = itemof("cache:2", "capture", now - 1_000);
    const plain = itemof("other:1", undefined, now);
    expect(rankedcandidates([plain, young, aged, expired], rules, now).map(entry => entry.key)).toEqual(["note:expired", "cache:1", "cache:2"]);
    expect(rankedcandidates([plain], rules, now)).toEqual([]);
  });

  it("measures the bytes from the serialized value and reports the honest reasons", () => {
    const rules: expiryrule[] = [];
    const aged = itemof("cache:1", "capture", now - 10, undefined, "a".repeat(100));
    const ranked = rankedcandidates([aged], rules, now);
    expect(ranked[0]?.bytes).toBe(JSON.stringify("a".repeat(100)).length);
    expect(ranked[0]?.reason).toMatch(/aged past its capture/i);
    expect(rankedcandidates([itemof("note:x", "general", now - 120_000)], [{ pattern: "note:", lifetime: 60_000 }], now)[0]?.reason).toMatch(/expired under its user expiryrule/i);
  });

  it("counts null values as the json null payload", () => {
    const ranked = rankedcandidates([itemof("cache:null", "capture", now, undefined, null)], [], now);
    expect(ranked[0]?.bytes).toBe(4);
  });

  it("builds the quota report with the clamped remaining bytes and the candidates", () => {
    const report = quotareportof({ usage: 1_500, quota: 1_000, items: [itemof("cache:1", "capture", now)], rules: [], now });
    expect(report).toMatchObject({ usage: 1_500, quota: 1_000, remaining: 0 });
    const clean = quotareportof({ usage: 500, quota: 1_000, items: [], rules: [], now });
    expect(clean.remaining).toBe(500);
    expect(clean.candidates).toBeUndefined();
  });

  it("slices the cleanup batch at the exact boundaries the user configures", () => {
    const candidates = [1, 2, 3, 4].map(index => ({ key: `k${index}`, bytes: index, reason: "r" }));
    expect(cleanupbatch(candidates, 1)).toHaveLength(1);
    expect(cleanupbatch(candidates, 4)).toHaveLength(4);
    expect(cleanupbatch(candidates, 4).map(entry => entry.key)).toEqual(["k1", "k2", "k3", "k4"]);
    expect(cleanupbatch(candidates, 100)).toHaveLength(4);
  });

  it("treats zero, negative, fractional and non finite batch sizes as the whole list", () => {
    const candidates = [1, 2].map(index => ({ key: `k${index}`, bytes: index, reason: "r" }));
    for (const batchsize of [0, -1, 1.5, NaN, Infinity, Number.NaN]) {
      expect(cleanupbatch(candidates, batchsize)).toHaveLength(2);
    }
    expect(cleanupbatch(candidates, undefined)).toHaveLength(2);
  });

  it("never mutates the candidate list it slices", () => {
    const candidates = [{ key: "k1", bytes: 1, reason: "r" }];
    const batch = cleanupbatch(candidates, 1);
    expect(batch).not.toBe(candidates);
    expect(cleanupbatch([], 1)).toEqual([]);
  });

  it("sums the reclaimed bytes of the batch", () => {
    expect(bytesreclaimed([{ key: "k1", bytes: 3 }, { key: "k2", bytes: 4 }])).toBe(7);
    expect(bytesreclaimed([])).toBe(0);
    expect(bytesreclaimed([{ key: "k", bytes: 0 }])).toBe(0);
  });
});

describe("torture: audit export records and chunk streaming", () => {
  const rules: expiryrule[] = [{ pattern: "note:", lifetime: 60_000 }];
  const runs: runrecord[] = [{ runid: "run1", planid: "plan", sessionid: "session", state: "completed", createdat: now, updatedat: now }];

  it("bundles the runs, memory, rules, timeline and locks into one record", () => {
    const record = auditexportof({ runs, items: [itemof("note:1")], rules, timeline: [{ at: now, runid: "run1", source: "step", summary: "done" }], locks: [{ holder: "run1", runid: "run1", sessionid: "session", acquiredat: now, expiresat: now + 1 }], now });
    expect(record.at).toBe(now);
    expect(record.runs).toHaveLength(1);
    expect(record.memory).toHaveLength(1);
    expect(record.expiryrules).toEqual(rules);
    expect(record.locks).toHaveLength(1);
  });

  it("refuses the non positive, fractional and non finite chunk sizes", () => {
    const record = auditexportof({ runs: [], items: [], rules: [], timeline: [], locks: [], now });
    for (const chunksize of [0, -1, 1.5, NaN, Infinity]) {
      expect(() => exportchunks(record, chunksize)).toThrow(/chunk size/i);
    }
  });

  it("streams the whole record in unit sized chunks with the done flag on the last one", () => {
    const record = auditexportof({ runs, items: [itemof("note:1")], rules, timeline: [], locks: [], now });
    const serialized = JSON.stringify(record);
    const chunks = exportchunks(record, 1);
    expect(chunks).toHaveLength(serialized.length);
    expect(chunks.every(chunk => chunk.payload.length === 1)).toBe(true);
    expect(chunks.at(-1)?.done).toBe(true);
    expect(chunks.slice(0, -1).every(chunk => chunk.done === false)).toBe(true);
    expect(chunks.map(chunk => chunk.payload).join("")).toBe(serialized);
    expect(chunks[0]?.index).toBe(0);
    expect(chunks[7]?.index).toBe(7);
  });

  it("roundtrips a one chunk export whose payload covers everything", () => {
    const record = auditexportof({ runs, items: [itemof("note:1", "credential")], rules, timeline: [], locks: [], now });
    const chunks = exportchunks(record, 1_000_000);
    expect(chunks).toHaveLength(1);
    expect(JSON.parse(chunks[0]?.payload ?? "")).toEqual(record);
  });

  it("streams the empty record as one empty done chunk", () => {
    const record = auditexportof({ runs: [], items: [], rules: [], timeline: [], locks: [], now });
    const chunks = exportchunks(record, 200);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.done).toBe(true);
  });
});

describe("torture: encryptrest key derivation and envelopes", () => {
  it("refuses the empty secret at the derivation", async () => {
    await expect(derivekey("", "salt")).rejects.toThrow(/secret/i);
    await expect(derivekey("", "")).rejects.toThrow(/secret/i);
  });

  it("derives working keys for long and unicode secrets", async () => {
    for (const secret of [injection, "x".repeat(500)]) {
      const key = await derivekey(secret, "salt:run1");
      const roundtrip = await decryptvalue(key, await encryptvalue(key, { text: "value" }));
      expect(roundtrip).toEqual({ text: "value" });
    }
  });

  it("roundtrips unicode, emoji, huge and null values", async () => {
    const key = await derivekey("user secret", "salt:run1");
    for (const value of [injection, "\ud83d\ude80\ud83c\udf89", "x".repeat(100_000), null, 42, true, ["a", "b"], { nested: { deep: [1, 2] } }]) {
      expect(await decryptvalue(key, await encryptvalue(key, value))).toEqual(value);
    }
  });

  it("refuses the wrong passphrase with the exact operation error", async () => {
    const key = await derivekey("user secret", "salt:run1");
    const envelope = await encryptvalue(key, { secret: "the body" });
    await expect(decryptvalue(await derivekey("wrong secret", "salt:run1"), envelope)).rejects.toThrow();
    await expect(decryptvalue(await derivekey("user secret", "other salt"), envelope)).rejects.toThrow();
  });

  it("seals the payload so the plaintext never appears in the envelope", async () => {
    const key = await derivekey("user secret", "salt:run1");
    const envelope = await encryptvalue(key, { secret: "the pricing body \u00e9\u202e" });
    expect(envelope.payload).not.toContain("pricing");
    expect(envelope.iv).not.toBe("");
    expect(envelope.payload).not.toContain("body");
  });

  it("uses a fresh iv per envelope so equal values never leak equality", async () => {
    const key = await derivekey("user secret", "salt:run1");
    const one = await encryptvalue(key, "same");
    const two = await encryptvalue(key, "same");
    expect(one.iv).not.toBe(two.iv);
    expect(one.payload).not.toBe(two.payload);
  });

  it("migrates the predating item lazily and leaves the encrypted and disabled items alone", async () => {
    const key = await derivekey("user secret", "salt:run1");
    const plain = itemof("vault:1", "credential");
    const migrated = await migrateitem({ item: plain, key, enabled: true });
    expect(migrated.encrypted).toBe(true);
    expect(migrated.key).toBe("vault:1");
    expect(migrated.memoryclass).toBe("credential");
    expect(migrated.provenance).toEqual(plain.provenance);
    expect(await migrateitem({ item: migrated, key, enabled: true })).toEqual(migrated);
    expect(await migrateitem({ item: plain, key, enabled: false })).toEqual(plain);
    const roundtrip = await decryptvalue(key, migrated.value as { iv: string; payload: string });
    expect(roundtrip).toEqual({ text: "value of vault:1" });
  });

  it("reads the sensitive classes of the encrypt gate", () => {
    for (const memoryclass of ["credential", "secret", "token", "body", "capture", "profile"]) {
      expect(issensitiveclass(memoryclass)).toBe(true);
    }
    expect(issensitiveclass("general")).toBe(false);
    expect(issensitiveclass("")).toBe(false);
    expect(issensitiveclass(undefined)).toBe(false);
    expect(sensitivememoryclasses.has("credential")).toBe(true);
  });

  it("verifies the export readiness of every item provenance", () => {
    const good = itemof("note:1");
    expect(exportready([good])).toEqual({ ready: true, missing: [] });
    expect(exportready([{ ...good, provenance: prov({ origin: " " }) }]).missing).toEqual(["note:1"]);
    expect(exportready([{ ...good, provenance: prov({ runid: "" }) }]).ready).toBe(false);
    expect(exportready([{ ...good, provenance: prov({ stepid: " " }) }, { ...good, key: "note:2" }]).missing).toEqual(["note:1"]);
  });

  it("creates locally unique identifiers without a network dependency", () => {
    const ids = new Set(Array.from({ length: 500 }, () => randomid()));
    expect(ids.size).toBe(500);
    expect(randomid()).toMatch(/^[0-9a-f-]{36}$/i);
  });
});

describe("torture: sessionmemory memory items, expiry and encryptrest stores", () => {
  it("stores, replaces and removes the memory items by key", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setmemoryitem(itemof("note:1", "general"));
    await store.setmemoryitem(itemof("note:2", "credential", now, now + 60_000));
    expect((await store.getmemoryitems()).map(item => item.key)).toEqual(["note:1", "note:2"]);
    await store.setmemoryitem({ ...itemof("note:1", "general"), value: { text: "updated" } });
    expect(await store.getmemoryitems()).toHaveLength(2);
    expect((await store.getmemoryitems()).find(item => item.key === "note:1")?.value).toEqual({ text: "updated" });
    await store.removememoryitems(["note:1", "ghost"]);
    expect((await store.getmemoryitems()).map(item => item.key)).toEqual(["note:2"]);
    await store.removememoryitems([]);
    expect(await store.getmemoryitems()).toHaveLength(1);
  });

  it("keeps the empty item store absent from a fresh workspace", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.getmemoryitems()).toEqual([]);
    expect(await store.getexpiry()).toEqual([]);
    expect(await store.getquotareport()).toBeUndefined();
    expect(await store.getlastexpirepass()).toBeUndefined();
    expect(await store.listpurgesummaries()).toEqual([]);
  });

  it("persists the expiry rules and the quota report of the quotawatch pass", async () => {
    const store = new sessionmemory(new fakeadapter());
    const rules: expiryrule[] = [{ pattern: "note:", lifetime: 60_000 }, { pattern: "*", lifetime: 600_000 }];
    await store.setexpiry(rules);
    expect(await store.getexpiry()).toEqual(rules);
    const report = quotareportof({ usage: 500, quota: 1_000, items: [itemof("cache:1", "capture", now)], rules, now });
    await store.setquotareport(report);
    expect(await store.getquotareport()).toEqual(report);
  });

  it("flips the at rest encryption flag through the settings and keeps it false by default", async () => {
    const store = new sessionmemory(new fakeadapter());
    expect(await store.getencryptrest()).toBe(false);
    await store.setencryptrest(true);
    expect(await store.getencryptrest()).toBe(true);
    await store.setencryptrest(false);
    expect(await store.getencryptrest()).toBe(false);
  });

  it("records the purge summaries and the expirememory pass time", async () => {
    const store = new sessionmemory(new fakeadapter());
    const summary = { key: "note:1", summary: "purged", provenance: prov(), at: now };
    await store.addpurgesummary(summary);
    await store.addpurgesummary({ ...summary, key: "note:2", at: now + 1 });
    expect((await store.listpurgesummaries()).map(entry => entry.key)).toEqual(["note:2", "note:1"]);
    await store.setlastexpirepass(now + 10);
    expect(await store.getlastexpirepass()).toBe(now + 10);
    await store.setlastexpirepass(now + 20);
    expect(await store.getlastexpirepass()).toBe(now + 20);
  });
});

describe("torture: fleet, budget, scope and review stores", () => {
  it("keeps the fleet registry sorted by registration with replacement by id", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setagent({ id: "a1", name: "scout", role: "worker", origin, state: "active", registeredat: now });
    await store.setagent({ id: "a2", name: "mapper", role: "critic", origin, state: "active", registeredat: now + 1 });
    expect((await store.listagents()).map(record => record.id)).toEqual(["a2", "a1"]);
    await store.setagent({ id: "a1", name: "scout", role: "worker", origin, state: "paused", registeredat: now, lastseenat: now + 2 });
    expect(await store.listagents()).toHaveLength(2);
    expect(await store.getagent("a1")).toMatchObject({ state: "paused", lastseenat: now + 2 });
    expect(await store.getagent("ghost")).toBeUndefined();
    expect(await store.getpausedagents()).toEqual(["a1"]);
  });

  it("stores the budget and scope states per agent", async () => {
    const store = new sessionmemory(new fakeadapter());
    const state: budgetstate = { agentid: "a1", spentsteps: 1, spenttokens: 10, spentdurationms: 100, maxsteps: 5, updatedat: now };
    await store.setbudget(state);
    expect(await store.getbudget("a1")).toEqual(state);
    expect(await store.getbudget("ghost")).toBeUndefined();
    await store.setbudget({ ...state, spentsteps: 2 });
    expect((await store.getbudget("a1"))?.spentsteps).toBe(2);
    const scope: agentscope = { agentid: "a1", origins: [origin], toolnamespaces: ["memory"] };
    await store.setagentscope(scope);
    expect(await store.getagentscope("a1")).toEqual(scope);
    await store.setagentscope({ ...scope, origins: [] });
    expect((await store.getagentscope("a1"))?.origins).toEqual([]);
    expect(await store.getagentscope("ghost")).toBeUndefined();
  });

  it("sorts the fleet reviews with the open ones first and replaces by id", async () => {
    const store = new sessionmemory(new fakeadapter());
    const open: reviewrecord = { id: "r1", fromagentid: "a1", toagentid: "a2", subject: "s", output: "o", state: "open", requestedat: now };
    const answered: reviewrecord = { id: "r2", fromagentid: "a1", toagentid: "a2", subject: "s", output: "o", state: "answered", verdict: "approve", requestedat: now - 1, answeredat: now };
    await store.setreview(answered);
    await store.setreview(open);
    expect((await store.getreviews()).map(record => record.id)).toEqual(["r1", "r2"]);
    await store.setreview({ ...open, state: "answered", verdict: "reject" });
    expect((await store.getreviews()).every(record => record.state === "answered")).toBe(true);
  });

  it("keeps the runreplay captures newest first under the retention window", async () => {
    const store = new sessionmemory(new fakeadapter());
    const steps = [{ stepid: "s1", kind: "observe", summary: "read", state: "done", at: now }];
    await store.setreplay({ id: "p1", agentid: "a1", runid: "run1", steps, capturedat: now });
    await store.setreplay({ id: "p2", agentid: "a1", runid: "run2", steps, capturedat: now + 1 });
    expect((await store.getreplays("a1")).map(record => record.id)).toEqual(["p2", "p1"]);
    await store.setreplay({ id: "p3", agentid: "a1", runid: "run3", steps, capturedat: now + 2 }, 2);
    expect(await store.getreplays("a1")).toHaveLength(2);
    await store.setreplay({ id: "p4", agentid: "a1", runid: "run4", steps, capturedat: now + 3 }, 1);
    expect((await store.getreplays("a1")).map(record => record.id)).toEqual(["p4"]);
    await store.setreplay({ id: "p5", agentid: "a2", runid: "run5", steps, capturedat: now + 4 });
    expect(await store.getreplays("a2")).toHaveLength(1);
  });

  it("stores the output comparisons, consensus votes and the killswitch time", async () => {
    const store = new sessionmemory(new fakeadapter());
    const comparison: comparisonrecord = { id: "c1", subject: "s", left: { agentid: "a1", fields: { price: "12" } }, right: { agentid: "a2", fields: { price: "12" } }, matching: ["price"], conflicting: [], missing: [], comparedat: now };
    await store.setcomparison(comparison);
    expect(await store.getcomparison()).toEqual([comparison]);
    const vote: consensusrecord = { id: "v1", proposal: "p", votes: [{ agentid: "a1", vote: "yes", castat: now }], tally: { yes: 1, no: 0, abstain: 0 }, quorum: 1, outcome: "carried", closedat: now };
    await store.setvote(vote);
    await store.setvote({ ...vote, outcome: "open" });
    expect((await store.getvotes())[0]?.outcome).toBe("open");
    expect(await store.getkillswitchat()).toBeUndefined();
    await store.setkillswitchat(now + 7);
    expect(await store.getkillswitchat()).toBe(now + 7);
  });
});

describe("torture: sitenotes, scratchpad and run summaries", () => {
  it("writes the site notes by id, reads them by origin and removes them", async () => {
    const store = new sessionmemory(new fakeadapter());
    const note: sitenote = { id: "n1", origin, title: "the pricing page", body: injection, author: "user", sensitive: false, createdat: now, updatedat: now };
    await store.writesitenote(note);
    await store.writesitenote({ ...note, id: "n2", origin: "https://other.example", updatedat: now + 1 });
    expect(await store.getsitenotes()).toHaveLength(2);
    await store.writesitenote({ ...note, body: "edited", updatedat: now + 2 });
    expect(await store.getsitenotes()).toHaveLength(2);
    expect((await store.readsitenotes(origin))[0]?.body).toBe("edited");
    expect(await store.readsitenotes("https://denied.example")).toEqual([]);
    await store.removesitenote("n1");
    expect((await store.getsitenotes()).map(entry => entry.id)).toEqual(["n2"]);
    await store.removesitenote("ghost");
    expect(await store.getsitenotes()).toHaveLength(1);
  });

  it("expires the site notes past the retention window with the boundary kept", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.writesitenote({ id: "n1", origin, title: "t", body: "b", author: "user", sensitive: false, createdat: now, updatedat: now });
    await store.writesitenote({ id: "n2", origin, title: "t", body: "b", author: "user", sensitive: false, createdat: now - 100, updatedat: now - 100 });
    expect(await store.expiresitenotes(undefined, now + 50)).toHaveLength(2);
    expect(await store.expiresitenotes(101, now)).toHaveLength(2);
    expect(await store.expiresitenotes(100, now)).toHaveLength(1);
    expect((await store.getsitenotes()).map(entry => entry.id)).toEqual(["n1"]);
  });

  it("appends the scratchpad entries without rewriting history and isolates the tasks", async () => {
    const store = new sessionmemory(new fakeadapter());
    const entry = (id: string, taskid: string, sessionid: string, at: number): scratchpadentry => ({ id, taskid, sessionid, text: `note ${id}`, author: "user", at });
    await store.appendscratchentry(entry("e1", "t1", "s1", now));
    await store.appendscratchentry(entry("e2", "t1", "s1", now + 1));
    await store.appendscratchentry(entry("e3", "t2", "s1", now + 2));
    await store.appendscratchentry(entry("e4", "t1", "s2", now + 3));
    expect((await store.getscratchpadall()).map(one => one.id)).toEqual(["e4", "e3", "e2", "e1"]);
    expect((await store.readscratchpad("t1", "s1")).map(one => one.id)).toEqual(["e2", "e1"]);
    expect(await store.readscratchpad("t1", "ghost")).toEqual([]);
  });

  it("prunes the scratchpad past the window and keeps everything without one", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.appendscratchentry({ id: "e1", taskid: "t1", sessionid: "s1", text: "old", author: "user", at: now - 200 });
    await store.appendscratchentry({ id: "e2", taskid: "t1", sessionid: "s1", text: "new", author: "user", at: now });
    expect(await store.prunescratchentries(undefined, now + 500)).toHaveLength(2);
    expect(await store.prunescratchentries(201, now)).toHaveLength(2);
    expect(await store.prunescratchentries(200, now)).toHaveLength(1);
    expect((await store.getscratchpadall()).map(one => one.id)).toEqual(["e2"]);
  });

  it("tracks the run summaries and lists them oldest first filtered by origin", async () => {
    const store = new sessionmemory(new fakeadapter());
    const summary = (runid: string, distilledat: number, origins: string[]): runsummary => ({ runid, sessionid: "s1", origins, kinds: ["click"], steps: [{ stepid: "s1", kind: "click", ok: true, summary: "done" }], task: "runsummary", provenance: "offscreenworker", distilledat });
    await store.setrunsummary(summary("run1", now, [origin]));
    await store.trackrunsummary("run1");
    await store.trackrunsummary("run1");
    await store.setrunsummary(summary("run2", now + 1, ["https://other.example"]));
    await store.trackrunsummary("run2");
    expect((await store.listrunsummaries()).map(one => one.runid)).toEqual(["run1", "run2"]);
    expect((await store.listrunsummaries(origin)).map(one => one.runid)).toEqual(["run1"]);
    expect(await store.listrunsummaries("https://denied.example")).toEqual([]);
    expect(await store.getrunsummary("run1")).toBeDefined();
    expect(await store.getrunsummary("ghost")).toBeUndefined();
  });

  it("expires the run summaries by emptying their steps while the record and origins stay", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.setrunsummary({ runid: "run1", sessionid: "s1", origins: [origin], kinds: ["click"], steps: [{ stepid: "s1", kind: "click", ok: true, summary: "done" }], task: "runsummary", provenance: "inline", distilledat: now - 200 });
    await store.trackrunsummary("run1");
    const kept = await store.expirerunsummaries(undefined, now);
    expect(kept).toHaveLength(1);
    expect(await store.expirerunsummaries(100, now)).toHaveLength(0);
    const emptied = await store.getrunsummary("run1");
    expect(emptied?.steps).toEqual([]);
    expect(emptied?.kinds).toEqual([]);
    expect(emptied?.origins).toEqual([origin]);
  });
});

describe("torture: semantic recall, corrections and consent memory", () => {
  it("adds the recall entries with fingerprint and origin deduplication", async () => {
    const store = new sessionmemory(new fakeadapter());
    const entry = (fingerprint: string, at = now, entryorigin = origin): recallindexentry => ({ fingerprint, origin: entryorigin, runid: "run1", stepid: "s1", text: `text of ${fingerprint}`, at });
    await store.addrecallentry(entry("f1"));
    await store.addrecallentry(entry("f1", now + 1));
    await store.addrecallentry(entry("f1", now + 2, "https://other.example"));
    await store.addrecallentry(entry("f2", now + 3));
    expect((await store.getrecallindex()).map(one => one.fingerprint)).toEqual(["f2", "f1", "f1"]);
  });

  it("answers the semantic recall through the injected ranker with the stored index", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addrecallentry({ fingerprint: "f1", origin, runid: "run1", stepid: "s1", text: "the pricing rows", at: now });
    await store.addrecallentry({ fingerprint: "f2", origin, runid: "run1", stepid: "s2", text: "the banner state", at: now + 1 });
    const seen: recallindexentry[][] = [];
    const rank = (index: recallindexentry[], query: recallquery, scope: { origins: string[] }): recallmatch[] => {
      seen.push(index);
      return index.filter(entry => scope.origins.includes(entry.origin)).map(entry => ({ entry, score: 1, reason: `matched ${query.text} on ${entry.text}` }));
    };
    const matches = await store.semanticrecall({ text: "pricing" }, { origins: [origin] }, rank);
    expect(matches).toHaveLength(2);
    expect(matches.map(match => match.entry.fingerprint)).toEqual(["f2", "f1"]);
    expect(seen[0]).toHaveLength(2);
    const empty = await store.semanticrecall({ text: "x" }, { origins: ["https://denied.example"] }, rank);
    expect(empty).toEqual([]);
  });

  it("expires the recall index entries past the window with the boundary kept", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addrecallentry({ fingerprint: "f1", origin, runid: "run1", stepid: "s1", text: "old", at: now - 200 });
    await store.addrecallentry({ fingerprint: "f2", origin, runid: "run1", stepid: "s1", text: "new", at: now });
    expect(await store.expirerecallentries(undefined, now + 500)).toHaveLength(2);
    expect(await store.expirerecallentries(201, now)).toHaveLength(2);
    expect(await store.expirerecallentries(200, now)).toHaveLength(1);
    expect((await store.getrecallindex()).map(one => one.fingerprint)).toEqual(["f2"]);
  });

  it("records the correction memory newest first with the origin and kind filters", async () => {
    const store = new sessionmemory(new fakeadapter());
    const correction = (id: string, entryorigin: string, kind: string, at: number): correctionentry => ({ id, origin: entryorigin, kind, stepid: "s1", source: "edited", original: "the old target", corrected: "the new target", reason: "the review edit", at });
    await store.addcorrection(correction("c1", origin, "click", now));
    await store.addcorrection(correction("c2", "https://other.example", "type", now + 1));
    await store.addcorrection({ id: "c3", origin, kind: "click", stepid: "s2", source: "rejected", original: "the refused step", reason: "the refusal", at: now + 2 });
    expect((await store.getcorrections()).map(one => one.id)).toEqual(["c3", "c2", "c1"]);
    expect((await store.getcorrections({ origin })).map(one => one.id)).toEqual(["c3", "c1"]);
    expect((await store.getcorrections({ kind: "type" })).map(one => one.id)).toEqual(["c2"]);
    expect(await store.getcorrections({ origin: "https://denied.example" })).toEqual([]);
  });

  it("expires the correction memory past the window with the boundary kept", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addcorrection({ id: "c1", origin, kind: "click", stepid: "s1", source: "edited", original: "o", corrected: "c", reason: "r", at: now - 200 });
    await store.addcorrection({ id: "c2", origin, kind: "click", stepid: "s1", source: "edited", original: "o", corrected: "c", reason: "r", at: now });
    expect(await store.expirecorrectionentries(undefined, now + 500)).toHaveLength(2);
    expect(await store.expirecorrectionentries(201, now)).toHaveLength(2);
    expect(await store.expirecorrectionentries(200, now)).toHaveLength(1);
    expect((await store.getcorrections()).map(one => one.id)).toEqual(["c2"]);
  });

  it("records the consent memory with every decision and boundary", async () => {
    const store = new sessionmemory(new fakeadapter());
    const entry = (id: string, decision: consentmemoryentry["decision"], entryorigin: string, at: number, expiresat?: number): consentmemoryentry => ({ id, origin: entryorigin, decision, boundary: "the form submit", kinds: ["click"], at, ...(expiresat !== undefined ? { expiresat } : {}) });
    await store.addconsentmemoryentry(entry("g1", "grant", origin, now, now + 60_000));
    await store.addconsentmemoryentry(entry("d1", "deny", "https://other.example", now + 1));
    await store.addconsentmemoryentry(entry("r1", "revoke", origin, now + 2));
    await store.addconsentmemoryentry(entry("e1", "expire", origin, now + 3));
    expect((await store.getconsentmemory()).map(one => one.id)).toEqual(["e1", "r1", "d1", "g1"]);
    expect((await store.getconsentmemory(origin)).map(one => one.id)).toEqual(["e1", "r1", "g1"]);
    expect(await store.getconsentmemory("https://denied.example")).toEqual([]);
    expect((await store.getconsentmemory())[3]?.expiresat).toBe(now + 60_000);
    expect((await store.getconsentmemory())[2]?.expiresat).toBeUndefined();
  });

  it("caps the error surfaces at five hundred and filters them by step", async () => {
    const store = new sessionmemory(new fakeadapter());
    for (let index = 0; index < 505; index += 1) {
      await store.adderrorsurface({ stepid: `s${index % 3}`, runid: "run1", cause: "page", message: `failure ${index}`, retry: { allowed: true, reason: "retry" }, context: { index: String(index) }, at: now + index });
    }
    const surfaces = await store.geterrorsurfaces();
    expect(surfaces).toHaveLength(500);
    expect(surfaces[0]?.message).toBe("failure 504");
    expect((await store.geterrorsurfaces("s1"))[0]?.stepid).toBe("s1");
    expect(await store.geterrorsurfaces("ghost")).toEqual([]);
  });

  it("indexes the history corpus incrementally and answers through the injected searcher", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addhistoryentry({ source: "note", id: "n1", origin, title: "pricing", text: "the pricing rows", at: now });
    await store.addhistoryentry({ source: "note", id: "n1", origin, title: "pricing v2", text: "the edited pricing rows", at: now + 1 });
    await store.addhistoryentry({ source: "summary", id: "run1", origin, title: "the run", text: "the run summary", outcome: "completed", at: now + 2 });
    const corpus = await store.gethistoryindex();
    expect(corpus).toHaveLength(2);
    expect(corpus.find(entry => entry.id === "n1")?.title).toBe("pricing v2");
    const search = (entries: historyindexentry[], query: historysearchquery): historysearchhit[] => entries.filter(entry => entry.text.includes(query.text)).map(entry => ({ source: entry.source, id: entry.id, title: entry.title, excerpt: entry.text, highlights: [query.text], ...(entry.origin !== undefined ? { origin: entry.origin } : {}), ...(entry.outcome !== undefined ? { outcome: entry.outcome } : {}), at: entry.at }));
    const hits = await store.historysearch({ text: "pricing" }, search);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.id).toBe("n1");
  });

  it("isolates the per tab session references", async () => {
    const store = new sessionmemory(new fakeadapter());
    const ref = (tabid: number): tabsessionref => ({ tabid, sessionid: `s${tabid}`, origin, updatedat: now });
    await store.settabsession(ref(1));
    await store.settabsession(ref(2));
    await store.tracktabsession(1);
    await store.tracktabsession(2);
    await store.tracktabsession(2);
    expect((await store.listtabsessions()).map(entry => entry.tabid)).toEqual([1, 2]);
    expect(await store.gettabsession(1)).toMatchObject({ sessionid: "s1" });
    expect(await store.gettabsession(9)).toBeUndefined();
    await store.settabsession({ tabid: 1, sessionid: "rebound", origin, updatedat: now + 1 });
    expect(await store.gettabsession(1)).toMatchObject({ sessionid: "rebound" });
  });

  it("exports the session bundle with notes, summaries and corrections", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.writesitenote({ id: "n1", origin, title: "t", body: "b", author: "user", sensitive: false, createdat: now, updatedat: now });
    await store.addcorrection({ id: "c1", origin, kind: "click", stepid: "s1", source: "edited", original: "o", corrected: "c", reason: "r", at: now });
    const bundle = await store.exportsessionbundle(now + 1);
    expect(bundle).toEqual({ kind: "sessionbundle", notes: await store.getsitenotes(), summaries: [], corrections: await store.getcorrections(), exportedat: now + 1 });
    expect(bundle.notes).toHaveLength(1);
    expect(bundle.corrections).toHaveLength(1);
  });

  it("keeps the audit trail ordered with the retention window applied exactly", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addaudi({ id: "e1", kind: "observe", at: now, summary: "first" });
    await store.addaudi({ id: "e2", kind: "stop", at: now + 1, summary: "second" });
    expect((await store.getaudit()).map(event => event.id)).toEqual(["e2", "e1"]);
    await store.setsettings({ auditretention: 1 });
    await store.addaudi({ id: "e3", kind: "observe", at: now + 2, summary: "third" });
    expect((await store.getaudit()).map(event => event.id)).toEqual(["e3"]);
    await store.setsettings({ auditretention: 0 });
    await store.addaudi({ id: "e4", kind: "observe", at: now + 3, summary: "fourth" });
    expect(await store.getaudit()).toEqual([]);
  });

  it("keeps the step outcomes with the retention window applied exactly", async () => {
    const store = new sessionmemory(new fakeadapter());
    await store.addoutcome({ stepid: "s1", ok: true, summary: "Done.", at: now });
    await store.addoutcome({ stepid: "s2", ok: false, summary: "Failed.", at: now + 1 });
    expect((await store.getoutcomes()).map(outcome => outcome.stepid)).toEqual(["s2", "s1"]);
    await store.setsettings({ outcomeretention: 1 });
    await store.addoutcome({ stepid: "s3", ok: true, summary: "Done.", at: now + 2 });
    expect((await store.getoutcomes()).map(outcome => outcome.stepid)).toEqual(["s3"]);
    await store.setsettings({ outcomeretention: 0 });
    await store.addoutcome({ stepid: "s4", ok: true, summary: "Done.", at: now + 3 });
    expect(await store.getoutcomes()).toEqual([]);
  });
});
