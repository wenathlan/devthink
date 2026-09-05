/**
 * authentication — aggressive tests for the 12 auth methods
 * inbound extraction, key resolution from env inline ephemeral,
 * outbound header building for every mode, query param building,
 * round robin rotation and masking
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  appendqueryparams,
  buildauthheaders,
  buildauthqueryparams,
  extractchatid,
  extractrequestid,
  extractsessionid,
  extracttoken,
  getkey,
  getkeycount,
  masktoken,
  resolvekeys,
  validatetoken,
} from "../../gateway-auth.js";
import type { authconfig } from "../../types.js";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function req(headers: Record<string, string>, method = "GET"): Request {
  return new Request("http://x/api", { method, headers });
}

const savedenv: Record<string, string | undefined> = {};

beforeEach(() => {
  delete process.env.gatewaytestkeys;
  delete process.env.gatewaytestsingle;
  delete process.env.gatewaytestempty;
});

afterEach(() => {
  for (const [k, v] of Object.entries(savedenv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

// ---------------------------------------------------------------------------
// inbound extractors — token from every header position
// ---------------------------------------------------------------------------

describe("extracttoken — every inbound position", () => {
  it("x-token header wins first", () => {
    expect(extracttoken(req({ "x-token": "tok-x" }))).toBe("tok-x");
  });
  it("authorization bearer is stripped", () => {
    expect(extracttoken(req({ authorization: "Bearer tok-b" }))).toBe("tok-b");
    expect(extracttoken(req({ authorization: "bearer tok-b" }))).toBe("tok-b");
    expect(extracttoken(req({ authorization: "BEARER tok-b" }))).toBe("tok-b");
  });
  it("api key headers fall through the chain", () => {
    expect(extracttoken(req({ "x-api-key": "k1" }))).toBe("k1");
    expect(extracttoken(req({ "x-goog-api-key": "k2" }))).toBe("k2");
    expect(extracttoken(req({ "api-key": "k3" }))).toBe("k3");
  });
  it("body token fields are read when headers are absent", () => {
    expect(extracttoken(req({}), { token: "bt" })).toBe("bt");
    expect(extracttoken(req({}), { apiKey: "bak" })).toBe("bak");
  });
  it("headers beat body", () => {
    expect(extracttoken(req({ "x-token": "h" }), { token: "b" })).toBe("h");
  });
  it("empty when nothing matches", () => {
    expect(extracttoken(req({}))).toBe("");
    expect(extracttoken(req({}), {})).toBe("");
  });
  it("authorization without bearer prefix passes as-is", () => {
    expect(extracttoken(req({ authorization: "Basic abc" }))).toBe("Basic abc");
  });
});

describe("extractchatid — chat id resolution", () => {
  it("x-chat-id wins", () => {
    expect(extractchatid(req({ "x-chat-id": "c1" }))).toBe("c1");
  });
  it("x-user-id is the alias", () => {
    expect(extractchatid(req({ "x-user-id": "u1" }))).toBe("u1");
  });
  it("body fields fall through — chat_id chatId userId", () => {
    expect(extractchatid(req({}), { chat_id: "b1" })).toBe("b1");
    expect(extractchatid(req({}), { chatId: "b2" })).toBe("b2");
    expect(extractchatid(req({}), { userId: "b3" })).toBe("b3");
  });
  it("generates a chat- id when absent", () => {
    const id = extractchatid(req({}));
    expect(id.startsWith("chat-")).toBe(true);
  });
});

describe("extractsessionid — session id resolution", () => {
  it("header wins over body", () => {
    expect(extractsessionid(req({ "x-session-id": "s-h" }), { session_id: "s-b" })).toBe("s-h");
  });
  it("body session_id and sessionId both work", () => {
    expect(extractsessionid(req({}), { session_id: "a" })).toBe("a");
    expect(extractsessionid(req({}), { sessionId: "b" })).toBe("b");
  });
  it("generates a sess- id when absent", () => {
    expect(extractsessionid(req({})).startsWith("sess-")).toBe(true);
  });
  it("two generated ids differ", () => {
    expect(extractsessionid(req({}))).not.toBe(extractsessionid(req({})));
  });
});

describe("extractrequestid — request id resolution", () => {
  it("header is honored", () => {
    expect(extractrequestid(req({ "x-request-id": "r1" }))).toBe("r1");
  });
  it("generates a req- id when absent", () => {
    expect(extractrequestid(req({})).startsWith("req-")).toBe(true);
  });
});

describe("validatetoken masktoken — token guards", () => {
  it("validation rejects short and empty tokens", () => {
    expect(validatetoken("")).toBe(false);
    expect(validatetoken("short")).toBe(false);
    expect(validatetoken("1234567890")).toBe(true);
    expect(validatetoken("a-much-longer-token")).toBe(true);
  });
  it("masking hides the middle", () => {
    // biome-ignore lint/security/noSecrets: synthetic token fixture — not a credential
    const masked = masktoken("sk-1234567890abcdef");
    expect(masked).toBe("sk-12345...cdef");
    expect(masked).not.toContain("abcdefg");
  });
  it("masking rejects short tokens", () => {
    expect(masktoken("short")).toBe("invalid");
    expect(masktoken("")).toBe("invalid");
    expect(masktoken("12-chars-ok!")).not.toBe("invalid");
  });
});

// ---------------------------------------------------------------------------
// key resolution — env inline and mixed sources
// ---------------------------------------------------------------------------

describe("resolvekeys — env source", () => {
  it("resolves comma separated keys", async () => {
    process.env.gatewaytestkeys = "key-aaaaaaaaaa, key-bbbbbbbbbb ,key-cccccccccc";
    const keys = await resolvekeys({
      mode: "bearer",
      envvar: "gatewaytestkeys",
      keysources: ["env"],
    });
    expect(keys.map((k) => k.key)).toEqual(["key-aaaaaaaaaa", "key-bbbbbbbbbb", "key-cccccccccc"]);
    expect(keys.every((k) => k.source === "env")).toBe(true);
  });
  it("honors a custom separator", async () => {
    process.env.gatewaytestkeys = "key-aaaaaaaaaa|key-bbbbbbbbbb";
    const keys = await resolvekeys({
      mode: "bearer",
      envvar: "gatewaytestkeys",
      envseparator: "|",
      keysources: ["env"],
    });
    expect(keys).toHaveLength(2);
  });
  it("empty env yields no keys", async () => {
    process.env.gatewaytestempty = "";
    const keys = await resolvekeys({
      mode: "bearer",
      envvar: "gatewaytestempty",
      keysources: ["env"],
    });
    expect(keys).toHaveLength(0);
  });
  it("unset env yields no keys", async () => {
    const keys = await resolvekeys({
      mode: "bearer",
      envvar: "gatewaytestmissing",
      keysources: ["env"],
    });
    expect(keys).toHaveLength(0);
  });
  it("whitespace only entries are filtered", async () => {
    process.env.gatewaytestkeys = "  ,   ,key-aaaaaaaaaa,,";
    const keys = await resolvekeys({
      mode: "bearer",
      envvar: "gatewaytestkeys",
      keysources: ["env"],
    });
    expect(keys).toHaveLength(1);
  });
  it("minkeylength filters short keys", async () => {
    process.env.gatewaytestkeys = "short,key-aaaaaaaaaa";
    const keys = await resolvekeys({
      mode: "bearer",
      envvar: "gatewaytestkeys",
      keysources: ["env"],
      minkeylength: 8,
    });
    expect(keys).toHaveLength(1);
    expect(keys[0].key).toBe("key-aaaaaaaaaa");
  });
  it("key labels use the configured format", async () => {
    process.env.gatewaytestkeys = "key-aaaaaaaaaa,key-bbbbbbbbbb";
    const keys = await resolvekeys({
      mode: "bearer",
      envvar: "gatewaytestkeys",
      keysources: ["env"],
      keylabelformat: "nvapi-key-{idx}",
    });
    expect(keys[0].label).toBe("nvapi-key-0");
    expect(keys[1].label).toBe("nvapi-key-1");
  });
});

describe("resolvekeys — inline source", () => {
  it("resolves inline keys with labels", async () => {
    const keys = await resolvekeys({
      mode: "bearer",
      keysources: ["inline"],
      inlinekeys: ["inline-aaaaaaaaaa", "inline-bbbbbbbbbb"],
    });
    expect(keys).toHaveLength(2);
    expect(keys[0].source).toBe("inline");
    expect(keys[0].key).toBe("inline-aaaaaaaaaa");
  });
  it("empty inline list yields nothing", async () => {
    const keys = await resolvekeys({ mode: "bearer", keysources: ["inline"], inlinekeys: [] });
    expect(keys).toHaveLength(0);
  });
});

describe("resolvekeys — default source is env", () => {
  it("keysources defaults to env", async () => {
    const auth = { mode: "bearer", envvar: "gatewaytestmissing" } as authconfig;
    const keys = await resolvekeys(auth);
    expect(keys).toHaveLength(0);
  });
});

describe("resolvekeys — order and merge", () => {
  it("db source with an unknown model yields nothing without throwing", async () => {
    const keys = await resolvekeys({
      mode: "bearer",
      keysources: ["db"],
      dbmodel: "definitelynotamodel",
    });
    expect(keys).toHaveLength(0);
  });
  it("multiple sources concatenate", async () => {
    process.env.gatewaytestkeys = "key-aaaaaaaaaa";
    const keys = await resolvekeys({
      mode: "bearer",
      keysources: ["inline", "env"],
      inlinekeys: ["inline-bbbbbbbbbb"],
      envvar: "gatewaytestkeys",
    });
    expect(keys).toHaveLength(2);
  });
  it("default minkeylength is 10", async () => {
    const keys = await resolvekeys({
      mode: "bearer",
      keysources: ["inline"],
      inlinekeys: ["123456789", "1234567890"],
    });
    expect(keys).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// outbound header building — all 12 auth methods
// ---------------------------------------------------------------------------

describe("buildauthheaders — every auth mode", () => {
  it("bearer sets authorization bearer", () => {
    const h = buildauthheaders({ mode: "bearer" }, "tok");
    expect(h["authorization"]).toBe("Bearer tok");
  });
  it("oauth2clientcredentials rides the bearer pattern", () => {
    const h = buildauthheaders({ mode: "oauth2clientcredentials" }, "tok");
    expect(h["authorization"]).toBe("Bearer tok");
  });
  it("jwtsign rides the bearer pattern", () => {
    const h = buildauthheaders({ mode: "jwtsign" }, "tok");
    expect(h["authorization"]).toBe("Bearer tok");
  });
  it("apikeyheader defaults to x-api-key", () => {
    const h = buildauthheaders({ mode: "apikeyheader" }, "tok");
    expect(h["x-api-key"]).toBe("tok");
    expect(h["authorization"]).toBeUndefined();
  });
  it("apikeyheader honors custom header names", () => {
    expect(
      buildauthheaders({ mode: "apikeyheader", headername: "x-goog-api-key" }, "k")[
        "x-goog-api-key"
      ],
    ).toBe("k");
    expect(buildauthheaders({ mode: "apikeyheader", headername: "api-key" }, "k")["api-key"]).toBe(
      "k",
    );
  });
  it("basic encodes base64 credentials", () => {
    const h = buildauthheaders({ mode: "basic" }, "user:pass");
    expect(h["authorization"]).toBe(`Basic ${Buffer.from("user:pass").toString("base64")}`);
  });
  it("queryparam sets no headers", () => {
    const h = buildauthheaders({ mode: "queryparam" }, "tok");
    expect(Object.keys(h)).toHaveLength(0);
  });
  it("headerless modes produce no headers", () => {
    for (const mode of ["cookie", "mtls", "sigv4", "hmacsign", "keylesssdk", "anonymous", "none"]) {
      const h = buildauthheaders({ mode: mode as authconfig["mode"] }, "tok");
      expect(Object.keys(h)).toHaveLength(0);
    }
  });
  it("extraheaders ride along every mode", () => {
    const h = buildauthheaders(
      { mode: "bearer", extraheaders: { "http-referer": "https://x", "x-title": "t" } },
      "k",
    );
    expect(h["http-referer"]).toBe("https://x");
    expect(h["x-title"]).toBe("t");
    expect(h["authorization"]).toBe("Bearer k");
  });
  it("extraheaders override mode headers", () => {
    const h = buildauthheaders({ mode: "bearer", extraheaders: { authorization: "custom" } }, "k");
    expect(h["authorization"]).toBe("custom");
  });
});

// ---------------------------------------------------------------------------
// query param building
// ---------------------------------------------------------------------------

describe("buildauthqueryparams — query auth", () => {
  it("queryparam mode injects the key", () => {
    const p = buildauthqueryparams({ mode: "queryparam" }, "secret");
    expect(p).toEqual({ key: "secret" });
  });
  it("custom param name", () => {
    const p = buildauthqueryparams({ mode: "queryparam", queryparamname: "api_key" }, "s");
    expect(p).toEqual({ api_key: "s" });
  });
  it("non queryparam modes produce nothing", () => {
    expect(buildauthqueryparams({ mode: "bearer" }, "k")).toEqual({});
    expect(buildauthqueryparams({ mode: "apikeyheader" }, "k")).toEqual({});
  });
  it("extraparams ride along", () => {
    const p = buildauthqueryparams(
      { mode: "queryparam", extraparams: { "api-version": "2024-02-01" } },
      "k",
    );
    expect(p).toEqual({ key: "k", "api-version": "2024-02-01" });
  });
});

describe("appendqueryparams — url assembly", () => {
  it("empty params return the url untouched", () => {
    expect(appendqueryparams("http://x/y", {})).toBe("http://x/y");
  });
  it("adds the first param with a question mark", () => {
    expect(appendqueryparams("http://x/y", { a: "1" })).toBe("http://x/y?a=1");
  });
  it("joins additional params with ampersand", () => {
    expect(appendqueryparams("http://x/y", { a: "1", b: "2" })).toBe("http://x/y?a=1&b=2");
  });
  it("existing query strings are preserved", () => {
    expect(appendqueryparams("http://x/y?z=9", { a: "1" })).toBe("http://x/y?z=9&a=1");
  });
  it("values are url encoded", () => {
    // biome-ignore lint/security/noSecrets: synthetic query fixture — not a credential
    expect(appendqueryparams("http://x", { q: "a b&c=d" })).toBe("http://x?q=a%20b%26c%3Dd");
  });
  it("keys are url encoded", () => {
    expect(appendqueryparams("http://x", { "a b": "1" })).toBe("http://x?a%20b=1");
  });
});

// ---------------------------------------------------------------------------
// key helpers — round robin and counts
// ---------------------------------------------------------------------------

describe("getkey getkeycount — key helpers", () => {
  it("returns empty when no keys resolve", async () => {
    expect(await getkey({ mode: "bearer", envvar: "gatewaytestmissing" })).toBe("");
  });
  it("returns the first key by default", async () => {
    process.env.gatewaytestkeys = "key-aaaaaaaaaa,key-bbbbbbbbbb";
    expect(await getkey({ mode: "bearer", envvar: "gatewaytestkeys" })).toBe("key-aaaaaaaaaa");
  });
  it("index wraps modulo the pool size", async () => {
    process.env.gatewaytestkeys = "key-aaaaaaaaaa,key-bbbbbbbbbb";
    const auth = { mode: "bearer", envvar: "gatewaytestkeys" } as authconfig;
    expect(await getkey(auth, 2)).toBe("key-aaaaaaaaaa");
    expect(await getkey(auth, 3)).toBe("key-bbbbbbbbbb");
  });
  it("counts resolvable keys", async () => {
    process.env.gatewaytestkeys = "key-aaaaaaaaaa,key-bbbbbbbbbb,key-cccccccccc";
    expect(await getkeycount({ mode: "bearer", envvar: "gatewaytestkeys" })).toBe(3);
  });
});
