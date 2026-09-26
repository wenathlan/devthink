/**
 * utils — aggressive edge case tests
 * every helper is pushed to its bounds: malformed inputs, extreme numbers,
 * adversarial strings, circular structures, unicode planes, concurrency
 */

import { describe, expect, it } from "vitest";

import {
  autofrequencypenalty,
  automaxtokens,
  auton,
  autopresencepenalty,
  autoseed,
  autotemp,
  autothinking,
  autotopp,
  clamp,
  corsheaders,
  ctjson,
  ctndjson,
  ctoctet,
  ctplain,
  defaultmaxtokens,
  detectcontenttype,
  esttokens,
  genid,
  getip,
  handlecors,
  jsonheaders,
  levenshtein,
  makethinker,
  maxdurationconst,
  randombase36,
  safejsonparse,
  safestringify,
  securerandom,
  thinkingbudget,
  thinkingbudgets,
  truncatemessages,
} from "../../utils.js";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function req(headers: Record<string, string>, method = "GET"): Request {
  return new Request("http://x/api", { method, headers });
}

// ---------------------------------------------------------------------------
// clamp — the foundation of every sampling param guard
// ---------------------------------------------------------------------------

describe("clamp — extreme inputs", () => {
  it("bounds normal numbers", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("rejects nan with the fallback", () => {
    expect(clamp(Number.NaN, 0, 10)).toBe(0);
    expect(clamp(Number.NaN, 0, 10, 7)).toBe(7);
  });

  it("parses numeric strings", () => {
    expect(clamp("0.5", 0, 10)).toBe(0.5);
    expect(clamp("-3", 0, 10)).toBe(0);
    expect(clamp("abc", 0, 10)).toBe(0);
    expect(clamp("abc", 0, 10, 4)).toBe(4);
  });

  it("handles infinity and beyond", () => {
    expect(clamp(Number.POSITIVE_INFINITY, 0, 10)).toBe(10);
    expect(clamp(Number.NEGATIVE_INFINITY, 0, 10)).toBe(0);
    expect(clamp(1e308, 0, 10)).toBe(10);
  });

  it("handles non numeric types via fallback", () => {
    expect(clamp(null, 0, 10)).toBe(0);
    expect(clamp(undefined, 0, 10)).toBe(0);
    expect(clamp([], 0, 10, 3)).toBe(3);
    expect(clamp({}, 0, 10, 3)).toBe(3);
    expect(clamp(true, 0, 10, 3)).toBe(3);
  });

  it("inverted bounds still clamp inside min max math", () => {
    // max(min(10, 5), 0) — inverted bounds produce max bound
    expect(clamp(5, 10, 0)).toBe(10);
  });

  it("float precision at the boundaries", () => {
    expect(clamp(0.1 + 0.2, 0, 0.3)).toBe(0.3);
    expect(clamp(2 - 2, 0, 2)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// sampling param guards — every auto* wrapper
// ---------------------------------------------------------------------------

describe("autotemp — temperature 0 to 2", () => {
  it("clamps the valid range", () => {
    expect(autotemp(0)).toBe(0);
    expect(autotemp(1.5)).toBe(1.5);
    expect(autotemp(2)).toBe(2);
  });
  it("clamps out of range", () => {
    expect(autotemp(3)).toBe(2);
    expect(autotemp(-1)).toBe(0);
    expect(autotemp(Number.NaN)).toBe(0.7);
    expect(autotemp("hot")).toBe(0.7);
  });
  it("accepts numeric strings", () => {
    expect(autotemp("0.5")).toBe(0.5);
    expect(autotemp("2.5")).toBe(2);
  });
});

describe("autotopp — top p 0 to 1", () => {
  it("clamps the valid range", () => {
    expect(autotopp(0)).toBe(0);
    expect(autotopp(0.9)).toBe(0.9);
    expect(autotopp(1)).toBe(1);
  });
  it("clamps out of range", () => {
    expect(autotopp(1.5)).toBe(1);
    expect(autotopp(-0.5)).toBe(0);
    expect(autotopp(Number.NaN)).toBe(0.9);
  });
});

describe("auton — n 1 to 10", () => {
  it("clamps the valid range", () => {
    expect(auton(1)).toBe(1);
    expect(auton(5)).toBe(5);
    expect(auton(10)).toBe(10);
  });
  it("zero and below fall to the bound or fallback", () => {
    expect(auton(0)).toBe(1);
    expect(auton(-3)).toBe(1);
    expect(auton(Number.NaN)).toBe(1);
    expect(auton(11)).toBe(10);
  });
});

describe("autofrequencypenalty autopresencepenalty — -2 to 2", () => {
  it("clamp both directions", () => {
    expect(autofrequencypenalty(3)).toBe(2);
    expect(autofrequencypenalty(-3)).toBe(-2);
    expect(autopresencepenalty(3)).toBe(2);
    expect(autopresencepenalty(-3)).toBe(-2);
    expect(autofrequencypenalty(Number.NaN)).toBe(0);
    expect(autopresencepenalty(Number.NaN)).toBe(0);
  });
});

describe("autoseed — nonnegative int bounded", () => {
  it("normalizes negatives and floats", () => {
    expect(autoseed(-100)).toBe(100);
    expect(autoseed(12.9)).toBe(12);
    expect(autoseed(-12.9)).toBe(12);
  });
  it("bounds at the 32 bit int ceiling", () => {
    expect(autoseed(2 ** 31)).toBe(2147483647);
    expect(autoseed(Number.MAX_SAFE_INTEGER)).toBe(2147483647);
  });
  it("parses numeric strings", () => {
    expect(autoseed("42")).toBe(42);
    expect(autoseed("42abc")).toBe(42);
    expect(autoseed("abc")).toBe(0);
  });
});

describe("automaxtokens — 1 to 98304", () => {
  it("zero falls back to the default", () => {
    expect(automaxtokens(0)).toBe(defaultmaxtokens);
    expect(automaxtokens(0, 512)).toBe(512);
  });
  it("clamps the range", () => {
    expect(automaxtokens(200000)).toBe(98304);
    expect(automaxtokens(-5)).toBe(1);
    expect(automaxtokens("2048")).toBe(2048);
    expect(automaxtokens(Number.NaN, 99)).toBe(99);
  });
});

// ---------------------------------------------------------------------------
// thinking level normalization — the 7 level canonical map
// ---------------------------------------------------------------------------

describe("autothinking — level normalization", () => {
  it("canonical levels pass through", () => {
    for (const level of ["none", "minimal", "low", "medium", "high", "xhigh", "max"]) {
      expect(autothinking(level)).toBe(level);
    }
  });
  it("aliases map to canonical levels", () => {
    expect(autothinking("disabled")).toBe("none");
    expect(autothinking("off")).toBe("none");
    expect(autothinking("false")).toBe("none");
    expect(autothinking("minimum")).toBe("minimal");
    expect(autothinking("med")).toBe("medium");
    expect(autothinking("mid")).toBe("medium");
    expect(autothinking("extra")).toBe("xhigh");
    expect(autothinking("ultra")).toBe("xhigh");
    expect(autothinking("maximum")).toBe("max");
    expect(autothinking("full")).toBe("max");
    expect(autothinking("all")).toBe("max");
  });
  it("case and whitespace are normalized", () => {
    expect(autothinking("MAX")).toBe("max");
    expect(autothinking("  High  ")).toBe("high");
    expect(autothinking("MEDIUM")).toBe("medium");
  });
  it("garbage and non strings fall back to high", () => {
    expect(autothinking("bogus")).toBe("high");
    expect(autothinking("")).toBe("high");
    expect(autothinking(undefined)).toBe("high");
    expect(autothinking(42)).toBe("high");
    expect(autothinking({ level: "low" })).toBe("high");
    expect(autothinking(null)).toBe("high");
  });
});

describe("thinkingbudget — budgets for levels", () => {
  it("returns the canonical budget map", () => {
    expect(thinkingbudget("none")).toBe(0);
    expect(thinkingbudget("minimal")).toBe(1400);
    expect(thinkingbudget("low")).toBe(5500);
    expect(thinkingbudget("medium")).toBe(17000);
    expect(thinkingbudget("high")).toBe(68000);
    expect(thinkingbudget("max")).toBe(68000);
  });
  it("budgets are monotonic nondecreasing", () => {
    const levels = ["none", "minimal", "low", "medium", "high", "xhigh", "max"] as const;
    for (let i = 1; i < levels.length; i += 1) {
      expect(thinkingbudgets[levels[i]]).toBeGreaterThanOrEqual(thinkingbudgets[levels[i - 1]]);
    }
  });
  it("garbage falls back to the high budget", () => {
    expect(thinkingbudget("garbage")).toBe(68000);
  });
});

describe("makethinker — thinking budget objects", () => {
  it("none produces the disabled shape", () => {
    expect(makethinker("none")).toEqual({ type: "disabled" });
    expect(makethinker("off")).toEqual({ type: "disabled" });
  });
  it("levels produce enabled with budget", () => {
    expect(makethinker("low")).toEqual({ type: "enabled", budget: 5500 });
    expect(makethinker(undefined)).toEqual({ type: "enabled", budget: 68000 });
  });
});

// ---------------------------------------------------------------------------
// json safety — never throw invariants
// ---------------------------------------------------------------------------

describe("safestringify — never throws", () => {
  it("serializes normal values", () => {
    expect(safestringify({ a: 1 })).toBe('{"a":1}');
    expect(safestringify("x")).toBe('"x"');
    expect(safestringify(null)).toBe("null");
    expect(safestringify([1, 2])).toBe("[1,2]");
  });
  it("survives circular structures", () => {
    const a: Record<string, unknown> = {};
    a["self"] = a;
    const out = safestringify(a);
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });
  it("survives bigint which json rejects", () => {
    const out = safestringify({ big: 10n });
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });
  it("survives symbols and functions inside objects", () => {
    const out = safestringify({ fn: () => 1, sym: Symbol("x") });
    expect(typeof out).toBe("string");
  });
  it("handles deeply nested structures", () => {
    let deep: unknown = { v: 1 };
    for (let i = 0; i < 2000; i += 1) deep = { child: deep };
    const out = safestringify(deep);
    expect(out.length).toBeGreaterThan(0);
  });
});

describe("safejsonparse — never throws", () => {
  it("parses valid json", () => {
    expect(safejsonparse('{"a":1}')).toEqual({ a: 1 });
    expect(safejsonparse("[1,2]")).toEqual([1, 2]);
    expect(safejsonparse('"s"')).toBe("s");
    expect(safejsonparse("null")).toBeNull();
    expect(safejsonparse("42")).toBe(42);
  });
  it("returns null on garbage", () => {
    expect(safejsonparse("{")).toBeNull();
    expect(safejsonparse("")).toBeNull();
    expect(safejsonparse("not json")).toBeNull();
    expect(safejsonparse('{"a":')).toBeNull();
    expect(safejsonparse("undefined")).toBeNull();
  });
  it("round trips through safestringify", () => {
    const obj = { nested: { list: [1, "two", false, null] } };
    expect(safejsonparse(safestringify(obj))).toEqual(obj);
  });
});

// ---------------------------------------------------------------------------
// token estimation and truncation
// ---------------------------------------------------------------------------

describe("esttokens — cjk aware estimation", () => {
  it("empty and nullish are zero", () => {
    expect(esttokens("")).toBe(0);
  });
  it("ascii counts 4 chars per token", () => {
    expect(esttokens("abcd")).toBe(1);
    expect(esttokens("ab")).toBe(1); // ceil(2/4) = 1
    expect(esttokens("abcdefgh")).toBe(2);
  });
  it("cjk counts 2 chars per token", () => {
    expect(esttokens("中文")).toBe(1);
    expect(esttokens("中")).toBe(1); // ceil(1/2) = 1
    expect(esttokens("中文中文")).toBe(2);
  });
  it("korean hangul counts as cjk", () => {
    expect(esttokens("한국")).toBe(1);
  });
  it("mixed scripts split correctly", () => {
    const mixed = "abcd中文";
    const tokens = esttokens(mixed);
    expect(tokens).toBe(2); // 1 ascii + 1 cjk
  });
  it("emoji pass through the ascii bucket", () => {
    expect(esttokens("😀😀😀😀")).toBe(1);
  });
});

describe("truncatemessages — context window fitting", () => {
  it("empty list stays empty", () => {
    expect(truncatemessages([], 100)).toEqual([]);
  });
  it("keeps everything when it fits", () => {
    const msgs = [
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi" },
    ];
    expect(truncatemessages(msgs, 1000)).toEqual(msgs);
  });
  it("drops the oldest messages first — newest survive", () => {
    const msgs = [
      { role: "user", content: "a".repeat(100) },
      { role: "assistant", content: "b".repeat(100) },
      { role: "user", content: "latest" },
    ];
    const out = truncatemessages(msgs, 30) as Array<{ content: string }>;
    expect(out.length).toBe(1);
    expect(out[0].content).toBe("latest");
  });
  it("returns empty when nothing fits", () => {
    const msgs = [{ role: "user", content: "a".repeat(1000) }];
    expect(truncatemessages(msgs, 10)).toEqual([]);
  });
  it("serializes non string content to estimate", () => {
    const msgs = [{ role: "user", content: { nested: true } }];
    const out = truncatemessages(msgs, 1000);
    expect(out.length).toBe(1);
  });
  it("zero budget drops everything", () => {
    const msgs = [{ role: "user", content: "x" }];
    expect(truncatemessages(msgs, 0)).toEqual([]);
  });
  it("exact boundary fit includes the message", () => {
    // content "x" = 1 token + 4 overhead = 5
    const msgs = [{ role: "user", content: "x" }];
    expect(truncatemessages(msgs, 5).length).toBe(1);
    expect(truncatemessages(msgs, 4).length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// id generation — uniqueness under load
// ---------------------------------------------------------------------------

describe("genid — unique ids", () => {
  it("default prefix is chatcmpl", () => {
    expect(genid().startsWith("chatcmpl-")).toBe(true);
  });
  it("custom prefix is preserved", () => {
    expect(genid("req").startsWith("req-")).toBe(true);
    expect(genid("").startsWith("-")).toBe(true);
  });
  it("stays unique across 5000 rapid calls", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 5000; i += 1) ids.add(genid());
    expect(ids.size).toBe(5000);
  });
  it("concurrent generation stays unique", async () => {
    const batches = await Promise.all(
      Array.from({ length: 20 }, () => Promise.resolve(Array.from({ length: 100 }, () => genid()))),
    );
    const all = batches.flat();
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("randombase36 — secure base36", () => {
  it("zero length returns empty", () => {
    expect(randombase36(0)).toBe("");
  });
  it("respects the requested length", () => {
    expect(randombase36(1)).toHaveLength(1);
    expect(randombase36(64)).toHaveLength(64);
  });
  it("alphabet is strictly 0-9a-z", () => {
    expect(randombase36(500)).toMatch(/^[0-9a-z]+$/);
  });
  it("distribution covers the alphabet broadly", () => {
    const out = randombase36(2000);
    const distinct = new Set(out.split(""));
    expect(distinct.size).toBeGreaterThanOrEqual(20);
  });
});

describe("securerandom — uniform float", () => {
  it("stays in 0 1", () => {
    for (let i = 0; i < 1000; i += 1) {
      const v = securerandom();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
  it("produces many distinct values", () => {
    const values = new Set<number>();
    for (let i = 0; i < 500; i += 1) values.add(securerandom());
    expect(values.size).toBeGreaterThan(400);
  });
});

// ---------------------------------------------------------------------------
// request helpers — ip cors and content type detection
// ---------------------------------------------------------------------------

describe("getip — client ip extraction", () => {
  it("reads the first hop of x-forwarded-for", () => {
    expect(getip(req({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1");
  });
  it("falls through the header chain", () => {
    expect(getip(req({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3");
    expect(getip(req({ "cf-connecting-ip": "4.4.4.4" }))).toBe("4.4.4.4");
    expect(getip(req({ "x-client-ip": "5.5.5.5" }))).toBe("5.5.5.5");
  });
  it("unknown when nothing matches", () => {
    expect(getip(req({}))).toBe("unknown");
    expect(getip(req({ accept: "text/html" }))).toBe("unknown");
  });
  it("priority order — forwarded wins over real ip", () => {
    expect(getip(req({ "x-forwarded-for": "9.9.9.9", "x-real-ip": "8.8.8.8" }))).toBe("9.9.9.9");
  });
});

describe("handlecors — preflight handling", () => {
  it("answers options with 204 and cors headers", () => {
    const res = handlecors(req({}, "OPTIONS"));
    expect(res).not.toBeNull();
    expect(res?.status).toBe(204);
    expect(res?.headers.get("access-control-allow-origin")).toBe("*");
  });
  it("returns null for non options methods", () => {
    expect(handlecors(req({}))).toBeNull();
    expect(handlecors(req({}, "POST"))).toBeNull();
    expect(handlecors(req({ origin: "https://x.com" }))).toBeNull();
  });
});

describe("detectcontenttype — accept header detection", () => {
  it("detects each format", () => {
    expect(detectcontenttype(req({ accept: ctndjson }))).toBe("ndjson");
    expect(detectcontenttype(req({ accept: "text/event-stream" }))).toBe("sse");
    expect(detectcontenttype(req({ accept: ctplain }))).toBe("plain");
    expect(detectcontenttype(req({ accept: ctoctet }))).toBe("octet");
    expect(detectcontenttype(req({ accept: ctjson }))).toBe("json");
  });
  it("defaults to json when absent or unknown", () => {
    expect(detectcontenttype(req({}))).toBe("json");
    expect(detectcontenttype(req({ accept: "text/html" }))).toBe("json");
    expect(detectcontenttype(req({ accept: "*/*" }))).toBe("json");
  });
  it("ndjson wins over sse when both present", () => {
    expect(detectcontenttype(req({ accept: `${ctndjson}, text/event-stream` }))).toBe("ndjson");
  });
  it("case insensitive", () => {
    expect(detectcontenttype(req({ accept: "TEXT/EVENT-STREAM" }))).toBe("sse");
  });
});

describe("header constants", () => {
  it("jsonheaders carry cors plus json content type", () => {
    const h = jsonheaders();
    expect(h["content-type"]).toBe(ctjson);
    expect(h["access-control-allow-origin"]).toBe("*");
  });
  it("corsheaders expose request and session ids", () => {
    expect(corsheaders["access-control-expose-headers"]).toContain("x-request-id");
    expect(corsheaders["access-control-expose-headers"]).toContain("x-session-id");
  });
  it("maxdurationconst is the 31 bit ceiling", () => {
    expect(maxdurationconst).toBe(2 ** 31 - 1);
  });
});

// ---------------------------------------------------------------------------
// levenshtein — fuzzy distance
// ---------------------------------------------------------------------------

describe("levenshtein — distance properties", () => {
  it("empty versus non empty is the length", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
    expect(levenshtein("", "")).toBe(0);
  });
  it("identical strings are zero", () => {
    expect(levenshtein("gateway", "gateway")).toBe(0);
  });
  it("single edits cost one", () => {
    expect(levenshtein("cat", "cut")).toBe(1); // substitution
    expect(levenshtein("cat", "cart")).toBe(1); // insertion
    expect(levenshtein("cart", "cat")).toBe(1); // deletion
  });
  it("symmetry", () => {
    expect(levenshtein("kitten", "sitting")).toBe(levenshtein("sitting", "kitten"));
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });
  it("case sensitive", () => {
    expect(levenshtein("ABC", "abc")).toBe(3);
  });
  it("unicode handled by code units", () => {
    expect(levenshtein("中", "文")).toBe(1);
  });
});
