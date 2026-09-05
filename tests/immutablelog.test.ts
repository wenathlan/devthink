import { describe, expect, it } from "vitest";
import { appendlogentry, chainreportof, entryhashof, exportlogchain, lasthashof, logentryof, openrunlog, readverifiedlog, sealrunlog, verifylogchain } from "../security.js";
import type { immutablelogentry, storedrunlog } from "../types.js";

const now = 1_000;
const origin = "https://example.com";

describe("immutable log hash chain", () => {
  async function samplelog(): Promise<storedrunlog> {
    let log = openrunlog({ runid: "run1", sessionid: "s1", now });
    log = await appendlogentry({ log, kind: "grant", summary: "The session started for the origin.", origin, at: now + 1 });
    log = await appendlogentry({ log, kind: "step", summary: "The click step completed.", origin, stepid: "s1", at: now + 2 });
    log = await appendlogentry({ log, kind: "deny", summary: "The submitform step was denied.", origin, stepid: "s2", at: now + 3 });
    return log;
  }

  it("chains every entry to the hash of its predecessor and writes the entry hash at append time", async () => {
    const log = await samplelog();
    expect(log.entries).toHaveLength(3);
    expect(log.entries[0]?.hash.previous).toBe("0".repeat(64));
    for (let index = 1; index < log.entries.length; index += 1) {
      expect(log.entries[index]?.hash.previous).toBe(log.entries[index - 1]?.hash.current);
    }
    for (const entry of log.entries) {
      expect(entry.hash.current).toMatch(/^[0-9a-f]{64}$/);
      expect(entry.hash.algorithm).toBe("sha-256");
    }
    expect(lasthashof(log)).toBe(log.entries[2]?.hash.current);
    expect(lasthashof(openrunlog({ runid: "r", sessionid: "s", now }))).toBe("0".repeat(64));
    expect(() => openrunlog({ runid: " ", sessionid: "s", now })).toThrow(/run and session ids/i);
  });

  it("derives the entry hash over the canonical body only", async () => {
    const body = { id: "e1", runid: "run1", kind: "step" as const, summary: "The step completed.", origin, at: now };
    const one = await entryhashof({ previous: "0".repeat(64), entry: body });
    const two = await entryhashof({ previous: "f".repeat(64), entry: body });
    expect(one.current).not.toBe(two.current);
    expect(one.previous).toBe("0".repeat(64));
    const entry = await logentryof({ runid: "run1", kind: "step", summary: "The step completed.", origin, at: now, previous: "0".repeat(64) });
    expect(entry.id).not.toBe("");
    await expect(logentryof({ runid: "run1", kind: "step", summary: " ", origin, at: now, previous: "" })).rejects.toThrow(/summary/i);
  });

  it("verifies the whole chain at read time and refuses reads of a broken link", async () => {
    const log = await samplelog();
    const verified = await verifylogchain(log.entries);
    expect(verified.valid).toBe(true);
    expect(verified.reason).toMatch(/verifies from the genesis hash/i);
    const read = await readverifiedlog(log);
    expect(read.ok).toBe(true);
    expect(read.entries).toHaveLength(3);
    const tampered = log.entries.map((entry, index) => index === 1 ? { ...entry, summary: "A forged summary." } : entry);
    const broken = await verifylogchain(tampered);
    expect(broken.valid).toBe(false);
    expect(broken.brokenat).toBe(1);
    expect(broken.reason).toMatch(/tamper evidence/i);
    const refused = await readverifiedlog({ ...log, entries: tampered });
    expect(refused.ok).toBe(false);
    expect(refused.entries).toEqual([]);
    const relinked = log.entries.map((entry, index) => index === 2 ? { ...entry, hash: { ...entry.hash, previous: "0".repeat(64) } } : entry);
    const relinkbroken = await verifylogchain(relinked);
    expect(relinkbroken.valid).toBe(false);
    expect(relinkbroken.brokenat).toBe(2);
  });

  it("seals the log at completion with a final hash and refuses every append after the seal", async () => {
    const log = await samplelog();
    const { log: sealed, seal } = await sealrunlog(log, now + 10);
    expect(seal.entries).toBe(3);
    expect(seal.sealhash.previous).toBe(log.entries[2]?.hash.current);
    expect(seal.sealhash.current).toMatch(/^[0-9a-f]{64}$/);
    expect(sealed.seal?.sealedat).toBe(now + 10);
    await expect(appendlogentry({ log: sealed, kind: "step", summary: "A late append.", origin, at: now + 11 })).rejects.toThrow(/accepts no append/i);
    await expect(sealrunlog(sealed, now + 12)).rejects.toThrow(/already sealed/i);
    await expect(sealrunlog(openrunlog({ runid: "empty", sessionid: "s", now }), now)).rejects.toThrow(/at least one entry/i);
  });

  it("reports the chain status per run with the seal hash and exports only verified chains", async () => {
    const log = await samplelog();
    const openreport = await chainreportof(log);
    expect(openreport.valid).toBe(true);
    expect(openreport.entries).toBe(3);
    expect(openreport.sealhash).toBeUndefined();
    const sealed = await sealrunlog(log, now + 10);
    const sealedreport = await chainreportof(sealed.log);
    expect(sealedreport.sealhash).toBe(sealed.seal.sealhash.current);
    expect(sealedreport.sealedat).toBe(now + 10);
    const exported = await exportlogchain(sealed.log);
    expect(exported.chainvalid).toBe(true);
    expect(exported.entries).toBe(3);
    expect(exported.sealhash).toBe(sealed.seal.sealhash.current);
    expect(exported.log).toHaveLength(3);
    const forged: immutablelogentry[] = sealed.log.entries.map((entry, index) => index === 0 ? { ...entry, summary: "Forged." } : entry);
    const refused = await exportlogchain({ ...sealed.log, entries: forged });
    expect(refused.chainvalid).toBe(false);
    expect(refused.log).toEqual([]);
    expect(refused.entries).toBe(0);
  });

  it("attaches provenance of origin and step to every entry", async () => {
    const log = await samplelog();
    expect(log.entries[0]?.origin).toBe(origin);
    expect(log.entries[0]?.stepid).toBeUndefined();
    expect(log.entries[1]?.stepid).toBe("s1");
    expect(log.entries[2]?.stepid).toBe("s2");
  });
});
