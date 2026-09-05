import { describe, expect, it } from "vitest";
import { authrefusedmessage, checkallowlist, defaultchallengelifetimems, defaultpairinglifetimems, defaulttokenlifetimems, grantallowlistentry, issuechallenge, issuepairingcode, issuetoken, redeempairingcode, revokeclient, scopecheck, tokenhashof, tokenhashprefix, verifyauth, verifytoken } from "../auth.js";
import type { allowlistentry, sessiontoken } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one allowlist fixture with its grant history. */
function entry(fingerprint: string, namespaces: Array<"browser" | "workflow" | "memory" | "system">): allowlistentry {
  return { fingerprint, displayname: `Client ${fingerprint.slice(0, 4)}`, namespaces, grantedat: now - 1000, history: [{ at: now - 1000, actor: "user", change: `Granted the ${namespaces.join(", ")} namespaces.` }] };
}

describe("pairing codes", () => {
  it("issues one time pairing codes with their scopes and window", () => {
    const code = issuepairingcode({ now, scopes: ["browser", "memory"], code: "DT-TEST123" });
    expect(code.code).toBe("DT-TEST123");
    expect(code.scopes).toEqual(["browser", "memory"]);
    expect(code.issuedat).toBe(now);
    expect(code.expiresat).toBe(now + defaultpairinglifetimems);
    expect(issuepairingcode({ now, scopes: ["browser", "carrierpigeon" as never], lifetime: 1000 }).scopes).toEqual(["browser"]);
    expect(issuepairingcode({ now, scopes: ["browser"], lifetime: 1000 }).expiresat).toBe(now + 1000);
    expect(defaultpairinglifetimems).toBe(300_000);
  });

  it("exchanges each code exactly once while used and expired codes never pair again", () => {
    const code = issuepairingcode({ now, scopes: ["browser"], code: "DT-ONCE" });
    const first = redeempairingcode({ codes: [code], code: "DT-ONCE", now: now + 1000 });
    expect(first.code?.usedat).toBe(now + 1000);
    expect(first.code?.scopes).toEqual(["browser"]);
    const second = redeempairingcode({ codes: [{ ...code, usedat: now }], code: "DT-ONCE", now: now + 2000 });
    expect(second.code).toBeUndefined();
    expect(second.reason).toMatch(/already used once/i);
    const stale = redeempairingcode({ codes: [code], code: "DT-ONCE", now: code.expiresat + 1 });
    expect(stale.code).toBeUndefined();
    expect(stale.reason).toMatch(/expired/i);
    expect(redeempairingcode({ codes: [code], code: "DT-OTHER", now: now + 1 }).reason).toBe(authrefusedmessage);
  });
});

describe("session tokens", () => {
  it("issues tokens whose stored form never carries the raw value and verifies them on every frame", async () => {
    const issued = await issuetoken({ clientid: "client1", scopes: ["browser"], now, raw: "raw-token-value" });
    expect(issued.raw).toBe("raw-token-value");
    expect(issued.token.hash.startsWith(tokenhashprefix)).toBe(true);
    expect(issued.token.hash).not.toContain("raw-token-value");
    expect(issued.token.expiresat).toBe(now + defaulttokenlifetimems);
    expect(issued.token.scopes).toEqual(["browser"]);
    const verified = await verifytoken({ tokens: [issued.token], raw: "raw-token-value", now: now + 1 });
    expect(verified.token?.clientid).toBe("client1");
    const wrong = await verifytoken({ tokens: [issued.token], raw: "other-value", now: now + 1 });
    expect(wrong.token).toBeUndefined();
    expect(wrong.reason).toBe(authrefusedmessage);
    expect(await tokenhashof("same")).toBe(await tokenhashof("same"));
    expect(await tokenhashof("same")).not.toBe(await tokenhashof("different"));
    expect(defaulttokenlifetimems).toBe(3_600_000);
  });

  it("refuses expired and revoked tokens with the fixed message that leaks no pairing state", async () => {
    const issued = await issuetoken({ clientid: "client1", scopes: ["browser"], now, lifetime: 1000, raw: "raw" });
    expect((await verifytoken({ tokens: [issued.token], raw: "raw", now: now + 999 })).token?.clientid).toBe("client1");
    const expired = await verifytoken({ tokens: [issued.token], raw: "raw", now: now + 1000 });
    expect(expired.token).toBeUndefined();
    expect(expired.reason).toBe(authrefusedmessage);
    const revoked: sessiontoken = { ...issued.token, revokedat: now + 500 };
    expect((await verifytoken({ tokens: [revoked], raw: "raw", now: now + 600 })).token).toBeUndefined();
    expect(authrefusedmessage).not.toMatch(/pair|client|token id/i);
  });

  it("revokes every token of one client on demand while the records stay", async () => {
    const first = await issuetoken({ clientid: "client1", scopes: ["browser"], now, raw: "one" });
    const second = await issuetoken({ clientid: "client1", scopes: ["memory"], now, raw: "two" });
    const third = await issuetoken({ clientid: "client2", scopes: ["system"], now, raw: "three" });
    const revoked = revokeclient([first.token, second.token, third.token], "client1", now + 10);
    expect(revoked.filter(token => token.clientid === "client1").every(token => token.revokedat === now + 10)).toBe(true);
    expect(revoked.find(token => token.clientid === "client2")?.revokedat).toBeUndefined();
  });

  it("limits the namespaces a token may call through its scopes", () => {
    const token: sessiontoken = { id: "t1", clientid: "client1", hash: "sha256:abc", scopes: ["browser"], issuedat: now, expiresat: now + 1000 };
    expect(scopecheck(token, "browser").allowed).toBe(true);
    const denied = scopecheck(token, "memory");
    expect(denied.allowed).toBe(false);
    expect(denied.reason).toMatch(/grants no memory tools/i);
    const fast = scopecheck(token, undefined);
    expect(fast.allowed).toBe(false);
    expect(fast.fast).toBe(true);
    expect(scopecheck(undefined, "browser").reason).toMatch(/no verified session token/i);
  });
});

describe("allowlist", () => {
  it("refuses fingerprints that carry no entry or no granted namespace", () => {
    const allowed = checkallowlist({ entries: [entry("aa11", ["browser"])], fingerprint: "aa11" });
    expect(allowed.allowed).toBe(true);
    const unknown = checkallowlist({ entries: [entry("aa11", ["browser"])], fingerprint: "bb22" });
    expect(unknown.allowed).toBe(false);
    expect(unknown.reason).toMatch(/not on the allowlist/i);
    const scoped = checkallowlist({ entries: [entry("aa11", ["browser"])], fingerprint: "aa11", namespace: "workflow" });
    expect(scoped.allowed).toBe(false);
    expect(scoped.reason).toMatch(/grants no workflow tools/i);
    expect(checkallowlist({ entries: [entry("aa11", ["browser"])], fingerprint: "aa11", namespace: "browser" }).allowed).toBe(true);
  });

  it("grants and rescopes entries with their grant history", () => {
    const entries = grantallowlistentry({ entries: [], identity: { fingerprint: "cc33", displayname: "Laptop agent" }, namespaces: ["browser", "memory"], actor: "user", now });
    expect(entries[0]?.namespaces).toEqual(["browser", "memory"]);
    expect(entries[0]?.history[0]?.change).toMatch(/Granted the browser, memory namespaces/i);
    const rescoped = grantallowlistentry({ entries, identity: { fingerprint: "cc33", displayname: "Laptop agent" }, namespaces: ["system"], actor: "user", now: now + 1 });
    expect(rescoped[0]?.namespaces).toEqual(["system"]);
    expect(rescoped[0]?.history[0]?.change).toMatch(/Rescoped to system/i);
    expect(rescoped[0]?.history[1]?.change).toMatch(/Granted the browser, memory namespaces/i);
    expect(grantallowlistentry({ entries: [], identity: { fingerprint: "dd44", displayname: "Desk agent" }, namespaces: ["carrierpigeon" as never], actor: "user", now })[0]?.namespaces).toEqual([]);
  });
});

describe("auth handshake", () => {
  it("issues challenges with single use nonces and a user configured window", () => {
    const challenge = issuechallenge({ method: "pairingcode", now, nonce: "nonce-1" });
    expect(challenge.nonce).toBe("nonce-1");
    expect(challenge.method).toBe("pairingcode");
    expect(challenge.expiresat).toBe(now + defaultchallengelifetimems);
    expect(issuechallenge({ method: "token", now, lifetime: 500 }).expiresat).toBe(now + 500);
    expect(issuechallenge({ method: "certificate", now }).nonce).not.toBe("");
  });

  it("completes the handshake only with the live nonce and a verifying token", async () => {
    const challenge = issuechallenge({ method: "token", now, nonce: "nonce-1" });
    const issued = await issuetoken({ clientid: "client1", scopes: ["browser"], now, raw: "raw" });
    const verified = await verifyauth({ challenge, nonce: "nonce-1", tokens: [issued.token], rawtoken: "raw", now: now + 1 });
    expect(verified.verified).toBe(true);
    expect(verified.clientid).toBe("client1");
    const wrongnonce = await verifyauth({ challenge, nonce: "nonce-2", tokens: [issued.token], rawtoken: "raw", now: now + 1 });
    expect(wrongnonce.verified).toBe(false);
    expect(wrongnonce.reason).toBe(authrefusedmessage);
    const expiredchallenge = issuechallenge({ method: "token", now, nonce: "nonce-1", lifetime: 100 });
    expect((await verifyauth({ challenge: expiredchallenge, nonce: "nonce-1", tokens: [issued.token], rawtoken: "raw", now: now + 200 })).reason).toMatch(/expired/i);
    expect((await verifyauth({ challenge, nonce: "nonce-1", tokens: [issued.token], rawtoken: "wrong", now: now + 1 })).verified).toBe(false);
  });
});
