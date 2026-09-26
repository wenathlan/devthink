import { describe, expect, it } from "vitest";
import {
  authrefusedmessage,
  capturecode,
  checkallowlist,
  defaultchallengelifetimems,
  defaultpairinglifetimems,
  defaulttokenlifetimems,
  exchangebridgepairing,
  expiretokens,
  grantallowlistentry,
  issuechallenge,
  issuepairingcode,
  issuetoken,
  livetokensof,
  mintbridgepairing,
  oauthflowof,
  pairingcountdown,
  parsetokens,
  redeempairingcode,
  revokeallsessions,
  revokeclient,
  scopecheck,
  tokenhashof,
  tokenhashprefix,
  tokenscopedkey,
  verifyauth,
  verifytoken,
} from "../auth.js";
import type { allowlistentry, clientidentity, sessiontoken } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one allowlist fixture. */
function entry(fingerprint: string, namespaces: allowlistentry["namespaces"]): allowlistentry {
  return {
    fingerprint,
    displayname: `Client ${fingerprint.slice(0, 4)}`,
    namespaces,
    grantedat: now - 1_000,
    history: [{ at: now - 1_000, actor: "user", change: "Granted." }],
  };
}

/** Builds one client identity fixture. */
function client(fingerprint: string): clientidentity {
  return { fingerprint, displayname: `Client ${fingerprint.slice(0, 4)}` };
}

describe("torture: pairing code lifecycle", () => {
  it("filters unknown scopes, keeps user lifetimes and generates dt codes", () => {
    const code = issuepairingcode({ now, scopes: ["browser", "memory", "carrierpigeon" as never] });
    expect(code.scopes).toEqual(["browser", "memory"]);
    expect(code.code).toMatch(/^DT-[A-Z0-9]{8}$/);
    expect(code.expiresat).toBe(now + defaultpairinglifetimems);
    expect(issuepairingcode({ now, scopes: ["browser"], lifetime: 1_000 }).expiresat).toBe(now + 1_000);
    expect(issuepairingcode({ now, scopes: [], lifetime: 0 }).expiresat).toBe(now);
    expect(issuepairingcode({ now, scopes: ["browser"], code: "DT-CUSTOM" }).code).toBe("DT-CUSTOM");
    expect(issuepairingcode({ now, scopes: ["browser"], code: "not-a-code" }).code).toBe("not-a-code");
  });

  it("two generated codes never collide in a large batch", () => {
    const codes = new Set<string>();
    for (let index = 0; index < 200; index += 1) codes.add(issuepairingcode({ now, scopes: ["browser"] }).code);
    expect(codes.size).toBe(200);
  });

  it("redeems each code exactly once with the expiry tick exclusive", () => {
    const code = issuepairingcode({ now, scopes: ["browser"], code: "DT-ONCE", lifetime: 1_000 });
    const first = redeempairingcode({ codes: [code], code: "DT-ONCE", now: now + 500 });
    expect(first.code?.usedat).toBe(now + 500);
    const second = redeempairingcode({ codes: [first.code!], code: "DT-ONCE", now: now + 600 });
    expect(second.code).toBeUndefined();
    expect(second.reason).toMatch(/already used once/i);
    const late = issuepairingcode({ now, scopes: ["browser"], code: "DT-LATE", lifetime: 1_000 });
    expect(redeempairingcode({ codes: [late], code: "DT-LATE", now: now + 999 }).code).toBeDefined();
    expect(redeempairingcode({ codes: [late], code: "DT-LATE", now: now + 1_000 }).reason).toMatch(/expired/i);
    expect(redeempairingcode({ codes: [late], code: "DT-OTHER", now: now + 1 }).reason).toBe(authrefusedmessage);
    expect(redeempairingcode({ codes: [], code: "DT-ONCE", now }).reason).toBe(authrefusedmessage);
  });

  it("code comparison stays exact against lookalike and malformed codes", () => {
    const code = issuepairingcode({ now, scopes: ["browser"], code: "DT-AB12CD34" });
    for (const lookalike of [
      "dt-ab12cd34",
      "DT-AB12CD35",
      " DT-AB12CD34",
      "DT-AB12CD34 ",
      "DT-ABl2CD34",
      "DT-AB12CD3",
    ]) {
      expect(redeempairingcode({ codes: [code], code: lookalike, now }).code).toBeUndefined();
    }
  });
});

describe("torture: session token hashing and verification", () => {
  it("token hashes never carry the raw value and stay deterministic", async () => {
    const hash = await tokenhashof("raw-token-value");
    expect(hash.startsWith(tokenhashprefix)).toBe(true);
    expect(hash).not.toContain("raw-token-value");
    expect(await tokenhashof("raw-token-value")).toBe(hash);
    expect(await tokenhashof("raw-token-valuE")).not.toBe(hash);
    const empty = await tokenhashof("");
    expect(empty.startsWith(tokenhashprefix)).toBe(true);
    const unicode = await tokenhashof("こんにちは 🌍");
    expect(unicode.startsWith(tokenhashprefix)).toBe(true);
    const long = await tokenhashof("x".repeat(1_000_000));
    expect(long.startsWith(tokenhashprefix)).toBe(true);
    expect(await tokenhashof("a")).not.toBe(await tokenhashof("b"));
  });

  it("verifies only stored, unrevoked, unexpired tokens with fixed refusal messages", async () => {
    const issued = await issuetoken({ clientid: "client1", scopes: ["browser"], now, lifetime: 1_000, raw: "raw-one" });
    const wrong = await verifytoken({ tokens: [issued.token], raw: "raw-two", now: now + 1 });
    expect(wrong.reason).toBe(authrefusedmessage);
    const atlimit = await verifytoken({ tokens: [issued.token], raw: "raw-one", now: now + 1_000 });
    expect(atlimit.token).toBeUndefined();
    expect(atlimit.reason).toBe(authrefusedmessage);
    const before = await verifytoken({ tokens: [issued.token], raw: "raw-one", now: now + 999 });
    expect(before.token?.clientid).toBe("client1");
    const revoked = revokeclient([issued.token], "client1", now + 1);
    const afterrevoke = await verifytoken({ tokens: revoked, raw: "raw-one", now: now + 2 });
    expect(afterrevoke.reason).toBe(authrefusedmessage);
    const otherrevoked = revokeclient([issued.token], "client2", now + 1);
    expect((await verifytoken({ tokens: otherrevoked, raw: "raw-one", now: now + 2 })).token?.clientid).toBe("client1");
  });

  it("revocation stays once and the audit record survives", async () => {
    const issued = await issuetoken({ clientid: "client1", scopes: ["browser"], now, raw: "raw-one" });
    const revokedonce = revokeclient([issued.token], "client1", now + 1);
    const revokedtwice = revokeclient(revokedonce, "client1", now + 2);
    expect(revokedtwice[0]?.revokedat).toBe(now + 1);
  });

  it("expiry sweeps exactly the unrevoked past their lifetime", async () => {
    const live = (await issuetoken({ clientid: "c1", scopes: ["browser"], now, lifetime: 10_000, raw: "raw-live" }))
      .token;
    const dead = (await issuetoken({ clientid: "c2", scopes: ["browser"], now, lifetime: 1_000, raw: "raw-dead" }))
      .token;
    const revoked = (
      await issuetoken({ clientid: "c3", scopes: ["browser"], now, lifetime: 1_000, raw: "raw-revoked" })
    ).token;
    const revokedrecord = revokeclient([revoked], "c3", now);
    const swept = expiretokens({ tokens: [live, dead, ...revokedrecord], now: now + 1_001 });
    expect(swept.expired.map((token) => token.clientid)).toEqual(["c2"]);
    expect(swept.live.map((token) => token.clientid).sort()).toEqual(["c1", "c3"]);
    const atlimit = expiretokens({ tokens: [dead], now: now + 1_000 });
    expect(atlimit.expired.map((token) => token.clientid)).toEqual(["c2"]);
  });

  it("scope checks fail fast without a namespace and refuse ungranted scopes", async () => {
    const token = (await issuetoken({ clientid: "c1", scopes: ["browser"], now, raw: "raw" })).token;
    expect(scopecheck(undefined, undefined).fast).toBe(true);
    expect(scopecheck(token, undefined).fast).toBe(true);
    expect(scopecheck(undefined, "browser").reason).toMatch(/no verified session token/i);
    expect(scopecheck(token, "browser").allowed).toBe(true);
    expect(scopecheck(token, "memory").reason).toMatch(/grants no memory tools/i);
  });
});

describe("torture: auth challenges and the handshake", () => {
  it("challenges carry single use nonces with user lifetimes", () => {
    const challenge = issuechallenge({ method: "token", now });
    expect(challenge.nonce).toMatch(/^[0-9a-f-]{36}$/);
    expect(challenge.expiresat).toBe(now + defaultchallengelifetimems);
    expect(issuechallenge({ method: "token", now, lifetime: 1_000 }).expiresat).toBe(now + 1_000);
    expect(issuechallenge({ method: "token", now, nonce: "fixed" }).nonce).toBe("fixed");
    const nonces = new Set<string>();
    for (let index = 0; index < 100; index += 1)
      nonces.add(issuechallenge({ method: "token", now: now + index }).nonce);
    expect(nonces.size).toBe(100);
  });

  it("the handshake refuses wrong nonces, expired challenges and bad tokens", async () => {
    const challenge = issuechallenge({ method: "token", now, lifetime: 1_000, nonce: "nonce-1" });
    const issued = await issuetoken({ clientid: "client1", scopes: ["browser"], now, raw: "raw-token" });
    const wrongnonce = await verifyauth({
      challenge,
      nonce: "nonce-2",
      tokens: [issued.token],
      rawtoken: "raw-token",
      now: now + 1,
    });
    expect(wrongnonce.reason).toBe(authrefusedmessage);
    const late = await verifyauth({
      challenge,
      nonce: "nonce-1",
      tokens: [issued.token],
      rawtoken: "raw-token",
      now: now + 1_000,
    });
    expect(late.reason).toMatch(/challenge expired/i);
    const before = await verifyauth({
      challenge,
      nonce: "nonce-1",
      tokens: [issued.token],
      rawtoken: "raw-token",
      now: now + 999,
    });
    expect(before.verified).toBe(true);
    expect(before.clientid).toBe("client1");
    const badtoken = await verifyauth({
      challenge,
      nonce: "nonce-1",
      tokens: [issued.token],
      rawtoken: "wrong",
      now: now + 1,
    });
    expect(badtoken.reason).toBe(authrefusedmessage);
    const emptynonce = await verifyauth({
      challenge,
      nonce: "",
      tokens: [issued.token],
      rawtoken: "raw-token",
      now: now + 1,
    });
    expect(emptynonce.reason).toBe(authrefusedmessage);
  });
});

describe("torture: allowlist discipline", () => {
  it("refuses unknown fingerprints and ungranted namespaces with exact reasons", () => {
    const entries = [entry("fp123", ["browser", "memory"])];
    expect(checkallowlist({ entries, fingerprint: "fp123" }).allowed).toBe(true);
    expect(checkallowlist({ entries, fingerprint: "fp123", namespace: "browser" }).allowed).toBe(true);
    expect(checkallowlist({ entries, fingerprint: "fp123", namespace: "memory" }).allowed).toBe(true);
    const refused = checkallowlist({ entries, fingerprint: "fp123", namespace: "system" });
    expect(refused.allowed).toBe(false);
    expect(refused.reason).toMatch(/grants no system tools/i);
    const unknown = checkallowlist({ entries, fingerprint: "fp999" });
    expect(unknown.allowed).toBe(false);
    expect(unknown.reason).toMatch(/not on the allowlist/i);
    expect(checkallowlist({ entries: [], fingerprint: "fp123" }).allowed).toBe(false);
    expect(checkallowlist({ entries, fingerprint: "" }).allowed).toBe(false);
  });

  it("fingerprint comparison stays exact against lookalikes", () => {
    const entries = [entry("fp123", ["browser"])];
    for (const lookalike of ["FP123", "fp12", "fp1234", " fp123", "fp123 "]) {
      expect(checkallowlist({ entries, fingerprint: lookalike }).allowed).toBe(false);
    }
  });

  it("grants record scope history and rescope keeps the trail", () => {
    const granted = grantallowlistentry({
      entries: [],
      identity: client("fp1"),
      namespaces: ["browser"],
      actor: "user",
      now,
    });
    expect(granted[0]?.namespaces).toEqual(["browser"]);
    expect(granted[0]?.history.length).toBe(1);
    expect(granted[0]?.history[0]?.change).toMatch(/Granted the browser namespaces/i);
    const rescoped = grantallowlistentry({
      entries: granted,
      identity: client("fp1"),
      namespaces: ["browser", "memory"],
      actor: "user",
      now: now + 1,
    });
    expect(rescoped[0]?.namespaces).toEqual(["browser", "memory"]);
    expect(rescoped[0]?.history.length).toBe(2);
    expect(rescoped[0]?.history[0]?.change).toMatch(/Rescoped to browser, memory namespaces/i);
    const unknownscopes = grantallowlistentry({
      entries: [],
      identity: client("fp2"),
      namespaces: ["browser", "nope" as never],
      actor: "user",
      now,
    });
    expect(unknownscopes[0]?.namespaces).toEqual(["browser"]);
    const empty = grantallowlistentry({ entries: [], identity: client("fp3"), namespaces: [], actor: "user", now });
    expect(empty[0]?.namespaces).toEqual([]);
    expect(empty[0]?.history[0]?.change).toMatch(/Granted the no namespaces/i);
  });
});

describe("torture: oauth flow parsing and code capture", () => {
  it("parses only well formed oauth flows", () => {
    expect(oauthflowof(null)).toBeUndefined();
    expect(oauthflowof(undefined)).toBeUndefined();
    expect(oauthflowof("string")).toBeUndefined();
    expect(oauthflowof(42)).toBeUndefined();
    expect(oauthflowof([])).toBeUndefined();
    expect(oauthflowof({})).toBeUndefined();
    const flow = oauthflowof({
      provider: "acme",
      authorizeurl: "https://acme.example/authorize",
      tokenurl: "https://acme.example/token",
      scopes: ["read"],
      redirectorigin: "https://app.example",
    });
    expect(flow?.provider).toBe("acme");
    expect(
      oauthflowof({
        provider: "",
        authorizeurl: "https://acme.example/authorize",
        tokenurl: "https://acme.example/token",
        scopes: [],
        redirectorigin: "https://app.example",
      }),
    ).toBeUndefined();
  });

  it("captures codes only for the exact state and redirect origin", () => {
    const state = "xyz123";
    expect(
      capturecode("https://app.example/callback?code=the-code&state=xyz123", "https://app.example", state),
    ).toEqual({ code: "the-code" });
    expect(
      capturecode("https://evil.example/callback?code=the-code&state=xyz123", "https://app.example", state).error,
    ).toBeDefined();
    expect(
      capturecode("https://app.example/callback?code=the-code&state=other", "https://app.example", state).error,
    ).toBeDefined();
    expect(capturecode("https://app.example/callback?state=xyz123", "https://app.example", state).error).toBeDefined();
    expect(
      capturecode("https://app.example/callback?error=access_denied&state=xyz123", "https://app.example", state).error,
    ).toMatch(/access_denied/i);
    expect(capturecode("not a url", "https://app.example", state).error).toBeDefined();
    expect(
      capturecode("https://app.example/callback?code=x&state=xyz123", "https://app.example.evil.com", state).error,
    ).toBeDefined();
  });

  it("parses token bodies conservatively", () => {
    expect(
      parsetokens('{"access_token":"a","refresh_token":"r","expires_in":3600,"scope":"read write"}'),
    ).toMatchObject({ accesstoken: "a", refreshtoken: "r", expiresin: 3600, scopes: ["read", "write"] });
    expect(parsetokens('{"access_token":"a"}')).toMatchObject({ accesstoken: "a" });
    expect(parsetokens("{}")).toBeUndefined();
    expect(parsetokens("not json")).toBeUndefined();
    expect(parsetokens("[]")).toBeUndefined();
    expect(parsetokens('{"expires_in":"not a number"}')).toBeUndefined();
    expect(parsetokens('{"expires_in":0}')).toBeUndefined();
    expect(parsetokens('{"expires_in":-5}')).toBeUndefined();
    expect(parsetokens('{"expires_in":3600.5}')).toBeUndefined();
    expect(parsetokens('{"scope":"read"}')).toBeUndefined();
  });
});

describe("torture: bridge pairing and relay tokens", () => {
  it("mints bridge pairings bound to their relay origin", () => {
    const record = mintbridgepairing({ origin: "https://relay.example", now, code: "DT-BRIDGE1", lifetime: 60_000 });
    expect(record.origin).toBe("https://relay.example");
    expect(record.code.code).toBe("DT-BRIDGE1");
    expect(record.code.scopes).toEqual(["browser"]);
    expect(() => mintbridgepairing({ origin: " ", now })).toThrow(/relay origin/i);
    expect(() => mintbridgepairing({ origin: "", now })).toThrow(/relay origin/i);
    expect(mintbridgepairing({ origin: "  https://relay.example  ", now }).origin).toBe("https://relay.example");
  });

  it("the countdown reports the exact seconds left and the expired flag at the boundary", () => {
    const record = mintbridgepairing({ origin: "https://relay.example", now, code: "DT-B1", lifetime: 90_000 });
    expect(pairingcountdown(record, now).secondsleft).toBe(90);
    expect(pairingcountdown(record, now).expired).toBe(false);
    expect(pairingcountdown(record, now + 89_999).secondsleft).toBe(1);
    expect(pairingcountdown(record, now + 90_000).expired).toBe(true);
    expect(pairingcountdown(record, now + 120_000).secondsleft).toBe(0);
    const used = { ...record, code: { ...record.code, usedat: now + 1 } };
    expect(pairingcountdown(used, now + 2).expired).toBe(true);
  });

  it("exchanges bridge pairings once per code and refuses foreign origins", async () => {
    const record = mintbridgepairing({ origin: "https://relay.example", now, code: "DT-X1", lifetime: 60_000 });
    const first = await exchangebridgepairing({
      records: [record],
      origin: "https://relay.example",
      code: "DT-X1",
      sessionid: "sess1",
      now: now + 1,
    });
    expect(first.record).toBeDefined();
    expect(first.raw).toBeDefined();
    expect(first.record?.hash.startsWith(tokenhashprefix)).toBe(true);
    expect(first.used?.usedat).toBe(now + 1);
    const threaded = [{ ...record, code: first.used! }];
    const replay = await exchangebridgepairing({
      records: threaded,
      origin: "https://relay.example",
      code: "DT-X1",
      sessionid: "sess2",
      now: now + 2,
    });
    expect(replay.record).toBeUndefined();
    expect(replay.reason).toMatch(/already used once/i);
    const foreign = await exchangebridgepairing({
      records: [record],
      origin: "https://other.example",
      code: "DT-X1",
      sessionid: "sess3",
      now: now + 1,
    });
    expect(foreign.record).toBeUndefined();
    const blankorigin = await exchangebridgepairing({
      records: [record],
      origin: " ",
      code: "DT-X1",
      sessionid: "sess4",
      now,
    });
    expect(blankorigin.reason).toMatch(/relay origin/i);
    const blanksession = await exchangebridgepairing({
      records: [record],
      origin: "https://relay.example",
      code: "DT-X1",
      sessionid: " ",
      now,
    });
    expect(blanksession.reason).toMatch(/session/i);
    const unknowncode = await exchangebridgepairing({
      records: [record],
      origin: "https://relay.example",
      code: "DT-NOPE",
      sessionid: "sess5",
      now,
    });
    expect(unknowncode.reason).toMatch(/matches the typed code/i);
    const late = await exchangebridgepairing({
      records: [{ ...record, code: { ...record.code, expiresat: now + 1 } }],
      origin: "https://relay.example",
      code: "DT-X1",
      sessionid: "sess6",
      now: now + 1,
    });
    expect(late.reason).toMatch(/expired/i);
  });

  it("relay token storage keys scope per origin and revoke all kills every live token", () => {
    expect(tokenscopedkey("https://relay.example")).toBe("bridgetokens:https://relay.example");
    expect(tokenscopedkey(" https://relay.example ")).toBe("bridgetokens:https://relay.example");
    expect(() => tokenscopedkey("")).toThrow(/relay origin/i);
    const tokens = [
      {
        id: "tok1",
        origin: "https://relay.example",
        hash: "sha256:1",
        sessionid: "s1",
        issuedat: now,
        expiresat: now + 1_000,
      },
      { id: "tok2", origin: "https://relay.example", hash: "sha256:2", sessionid: "s2", issuedat: now },
      { id: "tok3", origin: "https://other.example", hash: "sha256:3", sessionid: "s3", issuedat: now },
    ];
    expect(livetokensof(tokens, "https://relay.example", now).length).toBe(2);
    expect(livetokensof(tokens, "https://relay.example", now + 1_001).length).toBe(1);
    const revoked = revokeallsessions(tokens, now + 1);
    expect(livetokensof(revoked, "https://relay.example", now + 1)).toEqual([]);
    expect(revoked.every((token) => token.revokedat === now + 1)).toBe(true);
  });
});

describe("torture: token hash collision resistance over a batch", () => {
  it("distinct raw tokens hash distinctly across ten thousand tokens", async () => {
    const hashes = new Set<string>();
    for (let index = 0; index < 10_000; index += 1) hashes.add(await tokenhashof(`raw-token-${index}`));
    expect(hashes.size).toBe(10_000);
  }, 30_000);
});
