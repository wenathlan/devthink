import { describe, expect, it } from "vitest";
import {
  channellive,
  closeidlechannels,
  createlinepump,
  defaultheartbeatms,
  defaulthttpstream,
  defaultidlewindowms,
  enforcemaxclients,
  fetchrequestof,
  fetchoptionsof,
  graphqlopenvelope,
  graphqlrequestof,
  httpanswer,
  httpendpoint,
  httpframepipeline,
  openstreamchannel,
  parsepost,
  parsehtmlbody,
  payloadvalid,
  payloadwithdefaults,
  readpath,
  readstream,
  relayconnectionclose,
  relayconnectionopen,
  relayframeof,
  relayidleconnections,
  relaylivetokens,
  relaypendingpairings,
  relayserverframe,
  newrelayserverstate,
  routepath,
  sendfetch,
  sseframe,
  splitlines,
  starttls,
  statusclassof,
  streampathof,
  streamwindowof,
  templateurl,
  tlsdecision,
  unwrapgraphql,
  heartbeat,
  listremotestatus,
} from "../http.js";
import { issuetoken, grantallowlistentry } from "../auth.js";
import { defaultmcpconfig, localhostbind } from "../mcp.js";
import type { clientrecord, fetchrequest, mcpserverconfig, streamchannel } from "../types.js";
import type { fetchtransport, transportresponse } from "../http.js";

const now = 1_800_000_000_000;
const instant = (): Promise<void> => Promise.resolve();

/** Builds one transport response fixture. */
function response(
  status: number,
  body = "",
  headers: Record<string, string> = {},
  location?: string,
): transportresponse {
  return { status, headers, body, ...(location !== undefined ? { location } : {}) };
}

/** Builds one allowlist fixture entry the pipeline trusts. */
async function pipelinefixture(): Promise<{
  tokens: Awaited<ReturnType<typeof issuetoken>>["token"][];
  raw: string;
  allowlist: ReturnType<typeof grantallowlistentry>;
}> {
  const issued = await issuetoken({ clientid: "client1", scopes: ["browser"], now, raw: "raw-token" });
  const allowlist = grantallowlistentry({
    entries: [],
    identity: { fingerprint: "fp-1", displayname: "Laptop agent" },
    namespaces: ["browser"],
    actor: "user",
    now,
  });
  return { tokens: [issued.token], raw: "raw-token", allowlist };
}

describe("torture: status class boundaries", () => {
  it("grades the exact class edges and unknown out of range statuses", () => {
    expect(statusclassof(100)).toBe("informational");
    expect(statusclassof(199)).toBe("informational");
    expect(statusclassof(200)).toBe("success");
    expect(statusclassof(299)).toBe("success");
    expect(statusclassof(300)).toBe("redirect");
    expect(statusclassof(399)).toBe("redirect");
    expect(statusclassof(400)).toBe("clienterror");
    expect(statusclassof(499)).toBe("clienterror");
    expect(statusclassof(500)).toBe("servererror");
    expect(statusclassof(599)).toBe("servererror");
  });

  it("refuses the out of range and hostile statuses as unknown", () => {
    expect(statusclassof(0)).toBe("unknown");
    expect(statusclassof(-1)).toBe("unknown");
    expect(statusclassof(600)).toBe("unknown");
    expect(statusclassof(99)).toBe("unknown");
    expect(statusclassof(Number.NaN)).toBe("unknown");
    expect(statusclassof(Number.POSITIVE_INFINITY)).toBe("unknown");
    expect(statusclassof(200.5)).toBe("success");
  });
});

describe("torture: url templating and request normalization", () => {
  it("substitutes reviewed values while missing keys keep their placeholder", () => {
    expect(templateurl("https://api.example/items/{id}", { id: "42" })).toBe("https://api.example/items/42");
    expect(templateurl("https://api.example/items/{id}", {})).toBe("https://api.example/items/{id}");
    expect(templateurl("https://api.example/{a}/{a}", { a: "x" })).toBe("https://api.example/x/x");
    expect(templateurl("https://api.example/{ user }", { user: "x" })).toBe("https://api.example/{ user }");
    expect(templateurl("https://api.example/{ID}", { id: "x" })).toBe("https://api.example/{ID}");
    expect(templateurl("https://api.example/{}", {})).toBe("https://api.example/{}");
  });

  it("refuses malformed fetch request shapes while normalizing the clean ones", () => {
    expect(fetchrequestof(undefined)).toBeUndefined();
    expect(fetchrequestof(null)).toBeUndefined();
    expect(fetchrequestof([])).toBeUndefined();
    expect(fetchrequestof("https://x.example")).toBeUndefined();
    expect(fetchrequestof({ url: "   " })).toBeUndefined();
    expect(fetchrequestof({ url: 42 })).toBeUndefined();
    expect(fetchrequestof({ url: "https://x.example", method: "  " })).toEqual({ url: "https://x.example" });
    expect(fetchrequestof({ url: " https://x.example ", method: " delete ", body: "x", mode: "cors" })).toEqual({
      url: "https://x.example",
      method: "DELETE",
      body: "x",
      mode: "cors",
    });
    expect(fetchrequestof({ url: "https://x.example", mode: "websocket" as never })).toEqual({
      url: "https://x.example",
    });
    expect(fetchrequestof({ url: "https://x.example", headers: { keep: "1", drop: 2, alsodrop: null } })).toEqual({
      url: "https://x.example",
      headers: { keep: "1" },
    });
    expect(fetchrequestof({ url: "https://x.example", headers: [] })).toEqual({ url: "https://x.example" });
  });

  it("normalizes fetch options and stream windows under hostile values", () => {
    expect(fetchoptionsof(null)).toEqual({});
    expect(fetchoptionsof([])).toEqual({});
    expect(fetchoptionsof({ timeout: Number.POSITIVE_INFINITY })).toEqual({});
    expect(fetchoptionsof({ timeout: "100" as never })).toEqual({});
    expect(fetchoptionsof({ retries: -5, backoff: 0, follow: 0 })).toEqual({ retries: -5, backoff: 0, follow: 0 });
    expect(streamwindowof({ budget: 0 })).toEqual({ budget: 0 });
    expect(streamwindowof({ budget: Number.NaN })).toEqual({});
    expect(streamwindowof({ budget: -1 })).toEqual({ budget: -1 });
    expect(streamwindowof([])).toEqual({});
  });
});

describe("torture: sendfetch transport loop", () => {
  it("follows redirect chains inside the limit and refuses past it", async () => {
    const hops: string[] = [];
    const transport: fetchtransport = async (url): Promise<transportresponse> => {
      hops.push(url);
      if (url === "https://a.example/start") return response(302, "", {}, "/one");
      if (url === "https://a.example/one") return response(301, "", {}, "/two");
      if (url === "https://a.example/two") return response(308, "", {}, "/final");
      return response(200, "landed");
    };
    const request: fetchrequest = { url: "https://a.example/start" };
    const outcome = await sendfetch({ request, transport, sleep: instant });
    expect(outcome.status).toBe(200);
    expect(outcome.redirects).toBe(3);
    expect(outcome.url).toBe("https://a.example/final");
    expect(hops).toHaveLength(4);
    await expect(sendfetch({ request, options: { follow: 2 }, transport, sleep: instant })).rejects.toThrow(
      /exceeded the reviewed follow limit of 2/,
    );
    await expect(sendfetch({ request, options: { follow: 3 }, transport, sleep: instant })).resolves.toMatchObject({
      status: 200,
      redirects: 3,
    });
  });

  it("refuses the chain one hop past the reviewed follow limit", async () => {
    const transport: fetchtransport = async (url): Promise<transportresponse> =>
      url.endsWith("/a")
        ? response(302, "", {}, "/b")
        : url.endsWith("/b")
          ? response(302, "", {}, "/c")
          : response(404, "gone");
    await expect(
      sendfetch({ request: { url: "https://a.example/a" }, options: { follow: 1 }, transport, sleep: instant }),
    ).rejects.toThrow(/exceeded the reviewed follow limit of 1/);
    await expect(
      sendfetch({ request: { url: "https://a.example/a" }, options: { follow: 0 }, transport, sleep: instant }),
    ).rejects.toThrow(/exceeded the reviewed follow limit of 0/);
  });

  it("resumes a retry from the redirect position the failed attempt reached", async () => {
    const transport: fetchtransport = async (url): Promise<transportresponse> =>
      url.endsWith("/a")
        ? response(302, "", {}, "/b")
        : url.endsWith("/b")
          ? response(302, "", {}, "/c")
          : response(404, "gone");
    const outcome = await sendfetch({
      request: { url: "https://a.example/a" },
      options: { follow: 1, retries: 1 },
      transport,
      sleep: instant,
    });
    expect(outcome.status).toBe(404);
    expect(outcome.url).toBe("https://a.example/c");
    expect(outcome.retries).toBe(1);
  });

  it("downgrades the post body to a bodiless GET on a 301, 302 or 303 redirect", async () => {
    const seen: Array<{ url: string; method: string; body?: string }> = [];
    const transport: fetchtransport = async (url, init): Promise<transportresponse> => {
      seen.push({ url, method: init.method, ...(init.body !== undefined ? { body: init.body } : {}) });
      if (url.endsWith("/pay")) return response(302, "", {}, "/landing");
      return response(200, "ok");
    };
    const outcome = await sendfetch({
      request: { url: "https://a.example/pay", method: "POST", body: "secret-payload" },
      transport,
      sleep: instant,
    });
    expect(outcome.status).toBe(200);
    expect(seen).toHaveLength(2);
    expect(seen[1]?.method).toBe("GET");
    expect(seen[1]?.body).toBeUndefined();
  });

  it("keeps the post body through a 307 and 308 redirect", async () => {
    const seen: Array<{ url: string; method: string; body?: string }> = [];
    const transport: fetchtransport = async (url, init): Promise<transportresponse> => {
      seen.push({ url, method: init.method, ...(init.body !== undefined ? { body: init.body } : {}) });
      if (url.endsWith("/pay")) return response(307, "", {}, "/pay2");
      return response(200, "ok");
    };
    await sendfetch({
      request: { url: "https://a.example/pay", method: "POST", body: "kept" },
      transport,
      sleep: instant,
    });
    expect(seen[1]?.method).toBe("POST");
    expect(seen[1]?.body).toBe("kept");
  });

  it("resolves relative and absolute redirect locations against the current url", async () => {
    const transport: fetchtransport = async (url): Promise<transportresponse> => {
      if (url === "https://a.example/dir/page") return response(302, "", {}, "other/page");
      return response(200, "ok");
    };
    const outcome = await sendfetch({ request: { url: "https://a.example/dir/page" }, transport, sleep: instant });
    expect(outcome.url).toBe("https://a.example/dir/other/page");
    const absolute: fetchtransport = async (url): Promise<transportresponse> =>
      url === "https://a.example/page" ? response(302, "", {}, "https://b.example/x") : response(200, "ok");
    const crossed = await sendfetch({
      request: { url: "https://a.example/page" },
      transport: absolute,
      sleep: instant,
    });
    expect(crossed.url).toBe("https://b.example/x");
  });

  it("stops only at a redirect without a location header", async () => {
    const transport: fetchtransport = async (url): Promise<transportresponse> =>
      url === "https://a.example/hop" ? response(302, "", {}, "") : response(200, "ok");
    const outcome = await sendfetch({ request: { url: "https://a.example/hop" }, transport, sleep: instant });
    expect(outcome.status).toBe(302);
    expect(outcome.redirects).toBe(0);
  });

  it("retries failed attempts with the backoff wait and reports the reason", async () => {
    const waits: number[] = [];
    let attempts = 0;
    const transport: fetchtransport = async (): Promise<transportresponse> => {
      attempts += 1;
      if (attempts < 3) throw new Error("socket hangup");
      return response(200, "third time");
    };
    const outcome = await sendfetch({
      request: { url: "https://a.example/" },
      options: { retries: 3, backoff: 25 },
      transport,
      sleep: async (ms) => {
        waits.push(ms);
      },
      onretry: (attempt, wait, reason) => {
        waits.push(-attempt);
        void reason;
      },
    });
    expect(outcome.body).toBe("third time");
    expect(outcome.retries).toBe(2);
    expect(waits).toContain(25);
    expect(waits).toContain(50);
    expect(waits).toContain(-1);
    expect(waits).toContain(-2);
  });

  it("throws the attempt accounting when every attempt fails", async () => {
    const transport: fetchtransport = async (): Promise<transportresponse> => {
      throw new Error("refused");
    };
    await expect(
      sendfetch({ request: { url: "https://a.example/" }, options: { retries: 2 }, transport, sleep: instant }),
    ).rejects.toThrow(/failed after 3 attempts with 2 retries: refused/);
    await expect(sendfetch({ request: { url: "https://a.example/" }, transport, sleep: instant })).rejects.toThrow(
      /failed after 1 attempt with 0 retries/,
    );
  });

  it("times one attempt out inside the reviewed timeout and answers the attempt accounting", async () => {
    let slowcalls = 0;
    const transport: fetchtransport = async (url): Promise<transportresponse> => {
      if (url.includes("slow")) {
        slowcalls += 1;
        await new Promise((resolve) => setTimeout(resolve, 30));
        return response(200, "late");
      }
      return response(200, "fast");
    };
    await expect(
      sendfetch({
        request: { url: "https://a.example/slow" },
        options: { timeout: 5, retries: 0 },
        transport,
        sleep: instant,
      }),
    ).rejects.toThrow(/failed after 1 attempt with 0 retries: The request timed out after 5 milliseconds/);
    expect(slowcalls).toBe(1);
    const hanging: fetchtransport = async (): Promise<transportresponse> => new Promise(() => undefined);
    await expect(
      sendfetch({
        request: { url: "https://a.example/" },
        options: { timeout: 5 },
        transport: hanging,
        sleep: instant,
      }),
    ).rejects.toThrow(/timed out after 5 milliseconds/);
  });

  it("times the attempt out and retries until the next attempt succeeds", async () => {
    let calls = 0;
    const transport: fetchtransport = async (): Promise<transportresponse> => {
      calls += 1;
      if (calls === 1) await new Promise((resolve) => setTimeout(resolve, 30));
      return response(200, "recovered");
    };
    const outcome = await sendfetch({
      request: { url: "https://a.example/" },
      options: { timeout: 5, retries: 1 },
      transport,
      sleep: instant,
    });
    expect(outcome.body).toBe("recovered");
    expect(calls).toBe(2);
    expect(outcome.retries).toBe(1);
  });

  it("never strips a body from a POST and never adds one to a GET", async () => {
    const seen: Array<{ method: string; body?: string }> = [];
    const transport: fetchtransport = async (_url, init): Promise<transportresponse> => {
      seen.push({ method: init.method, ...(init.body !== undefined ? { body: init.body } : {}) });
      return response(200, "");
    };
    await sendfetch({
      request: { url: "https://a.example/", method: "POST", body: "payload" },
      transport,
      sleep: instant,
    });
    await sendfetch({
      request: { url: "https://a.example/", method: "GET", body: "dropped" },
      transport,
      sleep: instant,
    });
    await sendfetch({ request: { url: "https://a.example/", method: "HEAD" }, transport, sleep: instant });
    expect(seen[0]).toEqual({ method: "POST", body: "payload" });
    expect(seen[1]).toEqual({ method: "GET" });
    expect(seen[2]).toEqual({ method: "HEAD" });
  });
});

describe("torture: stream reading budget", () => {
  it("aborts exactly past the byte budget while the exact fit passes", async () => {
    const exact = await readstream({ chunks: ["abc", "def"], window: { budget: 6 } });
    expect(exact).toEqual({ chunks: 2, bytes: 6, aborted: false });
    const over = await readstream({ chunks: ["abc", "def"], window: { budget: 5 } });
    expect(over.aborted).toBe(true);
    expect(over.bytes).toBe(3);
    expect(over.chunks).toBe(1);
    expect(over.reason).toMatch(/aborted at 6 bytes past the reviewed byte budget of 5/);
    const zero = await readstream({ chunks: ["a"], window: { budget: 0 } });
    expect(zero.aborted).toBe(true);
    expect(zero.chunks).toBe(0);
    const empty = await readstream({ chunks: [], window: { budget: 10 } });
    expect(empty).toEqual({ chunks: 0, bytes: 0, aborted: false });
  });

  it("stops cleanly on the reviewed abort flag between chunks", async () => {
    let stop = false;
    const outcome = await readstream({ chunks: ["one", "two", "three"], window: { abort: () => stop, budget: 100 } });
    expect(outcome.aborted).toBe(false);
    expect(outcome.chunks).toBe(3);
    stop = true;
    const halted = await readstream({ chunks: ["one", "two"], window: { abort: () => stop } });
    expect(halted).toEqual({
      chunks: 0,
      bytes: 0,
      aborted: true,
      reason: "The reviewed abort flag stopped the stream.",
    });
  });

  it("reads a pull function to its exhaustion", async () => {
    let pulls = 0;
    const outcome = await readstream({
      chunks: async () => {
        pulls += 1;
        return pulls <= 2 ? "x" : undefined;
      },
      window: {},
    });
    expect(outcome).toEqual({ chunks: 2, bytes: 2, aborted: false });
    expect(pulls).toBe(3);
  });
});

describe("torture: json path reading and graphql envelopes", () => {
  it("reads dotted paths with array indexes, defaults and misses", () => {
    const parsed = { user: { name: "ada", tags: ["a", "b"] }, count: 3, active: true };
    expect(readpath(parsed, [{ name: "n", path: "user.name", kind: "text" }])[0]).toMatchObject({
      name: "n",
      value: "ada",
    });
    expect(readpath(parsed, [{ name: "t", path: "user.tags.1", kind: "text" }])[0]?.value).toBe("b");
    expect(readpath(parsed, [{ name: "c", path: "count", kind: "number" }])[0]?.value).toBe(3);
    expect(readpath(parsed, [{ name: "b", path: "active", kind: "boolean" }])[0]?.value).toBe(true);
    expect(readpath(parsed, [{ name: "b", path: "missing.deep", kind: "number", default: -1 }])[0]).toMatchObject({
      value: -1,
      missing: true,
    });
    expect(readpath(parsed, [{ name: "x", path: "user.name", kind: "number" }])[0]?.missing).toBe(true);
    expect(readpath(null, [{ name: "x", path: "a.b" }])[0]?.missing).toBe(true);
    expect(readpath(parsed, [{ name: "x", path: "count", kind: "text" }])[0]?.value).toBe("3");
  });

  it("wraps and unwraps graphql envelopes while malformed answers refuse", () => {
    expect(
      graphqlopenvelope({ query: "query { x }", operationkind: "query", variables: { a: 1 }, operationname: "op" }),
    ).toBe(JSON.stringify({ query: "query { x }", variables: { a: 1 }, operationName: "op" }));
    expect(unwrapgraphql({ data: { x: 1 }, errors: [{ message: "bad" }, "plain", 5] })).toEqual({
      data: { x: 1 },
      errors: ["bad", "plain", "5"],
    });
    expect(unwrapgraphql("nope")).toEqual({ errors: ["The graphql response is not a json object."] });
    expect(unwrapgraphql([1])).toEqual({ errors: ["The graphql response is not a json object."] });
    expect(unwrapgraphql({ errors: null })).toEqual({ errors: [] });
    expect(graphqlrequestof({ query: " ", operationkind: "query" })).toBeUndefined();
    expect(graphqlrequestof({ query: "x", operationkind: "mutation" })).toBeDefined();
    expect(graphqlrequestof({ query: "x", operationkind: "subscribe" as never })).toBeUndefined();
    expect(graphqlrequestof({ query: "x", operationkind: "query", variables: [1] })).toEqual({
      query: "x",
      operationkind: "query",
    });
  });

  it("parses html bodies through the injected seam with the multi flag", () => {
    const seam = (markup: string) => ({
      query: (selector: string) =>
        selector === "p" ? markup.split("|").map((text) => ({ text, attributes: {} })) : [],
    });
    const outcome = parsehtmlbody({
      body: "a|b|c",
      queries: [{ selector: "p", multi: true }, { selector: "p" }],
      parse: seam,
    });
    expect(outcome[0]?.values).toEqual(["a", "b", "c"]);
    expect(outcome[0]?.count).toBe(3);
    expect(outcome[1]?.values).toEqual(["a"]);
    expect(outcome[1]?.multi).toBe(false);
    const attr = parsehtmlbody({ body: "x", queries: [{ selector: "p", attribute: "href" }], parse: seam });
    expect(attr[0]?.values).toEqual([""]);
  });

  it("validates and defaults payload schemas", () => {
    const schema = {
      fields: [
        { name: "id", kind: "string" as const, required: true },
        { name: "n", kind: "number" as const },
        { name: "b", kind: "boolean" as const, default: false },
      ],
    };
    expect(payloadvalid({ id: "x", n: 1 }, schema)).toEqual({ ok: true, errors: [] });
    expect(payloadvalid({}, undefined)).toEqual({
      ok: false,
      errors: ["The typed endpoint call needs a reviewed payload schema before it runs."],
    });
    expect(payloadvalid({ id: null }, schema).errors[0]).toMatch(/required field id of kind string is missing/);
    expect(payloadvalid({ id: 1 }, schema).errors[0]).toMatch(/field id must be a string/);
    expect(payloadvalid({ id: "x", n: "nan" }, schema).errors[0]).toMatch(/field n must be a finite number/);
    expect(payloadvalid({ id: "x", b: "yes" }, schema).errors[0]).toMatch(/field b must be a boolean/);
    expect(payloadwithdefaults({ id: "x" }, schema)).toEqual({ id: "x", b: false });
    expect(payloadwithdefaults({ id: "x" }, undefined)).toEqual({ id: "x" });
  });
});

describe("torture: http transport endpoints and routing", () => {
  it("builds the endpoint records from the config and refuses path confusion", () => {
    const config: mcpserverconfig = {
      ...defaultmcpconfig(),
      port: 9000,
      httpstream: { endpoint: "/agent", streampath: "/agent/stream", tls: { mode: "off" } },
    };
    const endpoint = httpendpoint(config);
    expect(endpoint).toMatchObject({
      kind: "http",
      endpoint: "http://127.0.0.1:9000/agent",
      bind: localhostbind,
      port: 9000,
      localhost: true,
      path: "/agent",
    });
    expect(streampathof(config)).toMatchObject({ path: "/agent/stream", bind: localhostbind, localhost: true });
    const defaulted = httpendpoint({
      ...defaultmcpconfig(),
      port: 7436,
      httpstream: { endpoint: "  ", streampath: " ", tls: { mode: "off" } },
    });
    expect(defaulted.path).toBe("/mcp");
    expect(streampathof({ ...defaultmcpconfig(), port: 7436 }).path).toBe("/mcp/stream");
    expect(
      streampathof({
        ...defaultmcpconfig(),
        port: 7436,
        httpstream: { endpoint: "/mcp", streampath: "agent", tls: { mode: "off" } },
      }).path,
    ).toBe("agent");
  });

  it("routes exactly the endpoint and stream paths", () => {
    const config: mcpserverconfig = { ...defaultmcpconfig(), httpstream: defaulthttpstream() };
    expect(routepath(config, "/mcp")).toBe("endpoint");
    expect(routepath(config, "/mcp/stream")).toBe("stream");
    expect(routepath(config, "/mcp/")).toBeUndefined();
    expect(routepath(config, "/mcp?x=1")).toBeUndefined();
    expect(routepath(config, "/mcp/stream/")).toBeUndefined();
    expect(routepath(config, "/")).toBeUndefined();
    expect(routepath(config, "")).toBeUndefined();
    expect(routepath(config, "//mcp")).toBeUndefined();
  });

  it("decides tls under every hostile configuration", () => {
    expect(tlsdecision({ config: { mode: "off" }, presented: { fingerprint: "sha256:zz" }, now })).toEqual({
      tls: false,
      verified: false,
    });
    expect(tlsdecision({ config: { mode: "required" }, now }).reason).toMatch(/presented no certificate/i);
    expect(
      tlsdecision({
        config: { mode: "on", certificatefingerprint: "sha256:aa" },
        presented: { fingerprint: "sha256:AA" },
        now,
      }).reason,
    ).toMatch(/does not match the user configured fingerprint/i);
    expect(
      tlsdecision({
        config: { mode: "required", certificatefingerprint: "sha256:aa" },
        presented: { fingerprint: "sha256:aa" },
        now,
      }),
    ).toEqual({ tls: true, verified: true });
    expect(
      tlsdecision({ config: { mode: "required", certificatefingerprint: "" }, presented: { fingerprint: "" }, now }),
    ).toEqual({ tls: true, verified: true });
  });
});

describe("torture: posted frame intake and sse framing", () => {
  it("parses one frame, one batch and refuses the mixed or garbage bodies", () => {
    const frame = { jsonrpc: "2.0", id: 1, method: "ping" };
    expect(parsepost(JSON.stringify(frame))).toEqual({ message: frame });
    expect(parsepost(JSON.stringify([frame, { jsonrpc: "2.0", id: 2, method: "ping" }]))).toEqual({
      message: [frame, { jsonrpc: "2.0", id: 2, method: "ping" }],
    });
    expect(parsepost(JSON.stringify([frame, "garbage"]))).toEqual({
      error: { code: "parse", message: "The posted body does not parse as one json rpc message." },
    });
    expect(parsepost("[]")).toEqual({
      error: { code: "parse", message: "The posted body does not parse as one json rpc message." },
    });
    expect(parsepost("null")).toEqual({
      error: { code: "parse", message: "The posted body does not parse as one json rpc message." },
    });
    expect(parsepost("42")).toEqual({
      error: { code: "parse", message: "The posted body does not parse as one json rpc message." },
    });
    expect(parsepost("{nope")).toEqual({
      error: { code: "parse", message: "The posted body does not parse as one json rpc message." },
    });
    expect(parsepost("")).toEqual({
      error: { code: "parse", message: "The posted body does not parse as one json rpc message." },
    });
  });

  it("formats the http answer and the server sent event frames exactly", () => {
    expect(httpanswer({ jsonrpc: "2.0", id: 7, result: { pong: true } })).toBe(
      `${JSON.stringify({ jsonrpc: "2.0", id: 7, result: { pong: true } })}\n`,
    );
    expect(
      httpanswer([
        { jsonrpc: "2.0", id: 1, result: 1 },
        { jsonrpc: "2.0", id: 2, result: 2 },
      ] as never),
    ).toBe(
      `${JSON.stringify([
        { jsonrpc: "2.0", id: 1, result: 1 },
        { jsonrpc: "2.0", id: 2, result: 2 },
      ])}\n`,
    );
    const event = sseframe({ id: 12, event: "message", frame: { jsonrpc: "2.0", id: 9, result: null } });
    expect(event).toBe(`id: 12\nevent: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", id: 9, result: null })}\n\n`);
    expect(sseframe({ id: 0, event: "", frame: { jsonrpc: "2.0" } }).startsWith("id: 0\n")).toBe(true);
  });
});

describe("torture: stream channels, heartbeats and the client ceiling", () => {
  it("opens, beats and sweeps channels with exact idle window edges", () => {
    const open = openstreamchannel({ clientid: "c1", now });
    expect(open.id).toMatch(/^channel-/);
    expect(open.clientid).toBe("c1");
    expect(open.openedat).toBe(now);
    const beaten = heartbeat({
      channels: [open, { ...open, clientid: "c2", closedat: now - 5 }],
      clientid: "c1",
      now: now + 1000,
    });
    expect(beaten[0]?.lastbeatat).toBe(now + 1000);
    expect(beaten[1]?.lastbeatat).toBe(now);
    expect(defaulthttpstream()).toEqual({
      endpoint: "/mcp",
      streampath: "/mcp/stream",
      tls: { mode: "off" },
      heartbeatms: defaultheartbeatms,
      idlewindowms: defaultidlewindowms,
    });
  });

  it("treats the exact idle window edge as dead while one millisecond under stays live", () => {
    const channel: streamchannel = { id: "ch", clientid: "c1", openedat: now - 100, lastbeatat: now - 10_000 };
    expect(channellive(channel, now, 10_000)).toBe(false);
    expect(channellive(channel, now - 1, 10_000)).toBe(true);
    expect(channellive({ ...channel, closedat: now }, now - 100_000, 1_000_000)).toBe(false);
    expect(channellive(channel, now)).toBe(true);
    expect(channellive(channel, now, 9_999)).toBe(false);
    expect(channellive({ ...channel, lastbeatat: now }, now, 1)).toBe(true);
    const swept = closeidlechannels({
      channels: [channel, { ...channel, id: "ch2", lastbeatat: now }],
      now,
      idlewindow: 10_000,
    });
    expect(swept[0]?.closedat).toBe(now);
    expect(swept[1]?.closedat).toBeUndefined();
  });

  it("enforces the client ceiling at the exact boundary", () => {
    const clients: clientrecord[] = [
      { id: "a", transport: "http", paired: true, connectedat: now },
      { id: "b", transport: "http", paired: false, connectedat: now },
    ];
    expect(enforcemaxclients({ clients, maxclients: 2 }).allowed).toBe(false);
    expect(enforcemaxclients({ clients, maxclients: 2 }).reason).toMatch(/maximum of 2 remote clients is reached/);
    expect(enforcemaxclients({ clients, maxclients: 3 }).allowed).toBe(true);
    expect(enforcemaxclients({ clients }).allowed).toBe(true);
    expect(
      enforcemaxclients({ clients: [{ ...clients[0]!, disconnectedat: now }, clients[1]!], maxclients: 2 }).allowed,
    ).toBe(true);
    expect(enforcemaxclients({ clients, maxclients: 0 }).allowed).toBe(false);
    expect(enforcemaxclients({ clients, maxclients: Number.NaN }).reason).toMatch(/maximum of NaN/);
  });

  it("reports the remote status of a configured transport", () => {
    const config: mcpserverconfig = {
      ...defaultmcpconfig(),
      enabled: true,
      remoteaccess: { endpoint: "https://agent.example", tls: { mode: "on" }, maxclients: 5 },
    };
    const status = listremotestatus({
      config,
      channels: [],
      clients: [{ id: "c1", transport: "http", paired: false, connectedat: now }],
      tokens: [],
      now,
    });
    expect(status.endpoint).toBe("https://agent.example");
    expect(status.tls.mode).toBe("on");
    expect(status.tls.certificaterequired).toBe(false);
    expect(status.clients).toBe(1);
    expect(status.paired).toBe(0);
  });
});

describe("torture: the ordered remote frame pipeline", () => {
  it("refuses before the token when tls fails and never leaks pairing state", async () => {
    const config: mcpserverconfig = {
      ...defaultmcpconfig(),
      enabled: true,
      remoteaccess: {
        endpoint: "https://agent.example",
        tls: { mode: "required", certificatefingerprint: "sha256:aa" },
      },
    };
    const fixture = await pipelinefixture();
    const refused = await httpframepipeline({
      config,
      presented: { fingerprint: "sha256:zz" },
      tokens: fixture.tokens,
      rawtoken: "totally-wrong-token",
      allowlist: fixture.allowlist,
      fingerprint: "fp-unknown",
      now,
    });
    expect(refused.error?.code).toBe("consentrefused");
    expect(refused.error?.message).toMatch(/does not match the user configured fingerprint/);
    expect(refused.error?.message).not.toContain("raw-token");
  });

  it("answers the fixed auth message for missing, wrong, revoked and expired tokens", async () => {
    const config: mcpserverconfig = { ...defaultmcpconfig(), enabled: true };
    const fixture = await pipelinefixture();
    const missing = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      now,
    });
    expect(missing.error?.message).toBe("The remote frame failed its authentication handshake.");
    const wrong = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      rawtoken: "",
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      now,
    });
    expect(wrong.error?.message).toBe("The remote frame failed its authentication handshake.");
    const emptytokens = await httpframepipeline({
      config,
      tokens: [],
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      now,
    });
    expect(emptytokens.error?.message).toBe("The remote frame failed its authentication handshake.");
    const revokedtoken = { ...fixture.tokens[0]!, revokedat: now - 1 };
    const revoked = await httpframepipeline({
      config,
      tokens: [revokedtoken],
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      now,
    });
    expect(revoked.error?.message).toBe("The remote frame failed its authentication handshake.");
    const expiredtoken = { ...fixture.tokens[0]!, expiresat: now };
    const expired = await httpframepipeline({
      config,
      tokens: [expiredtoken],
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      now,
    });
    expect(expired.error?.message).toBe("The remote frame failed its authentication handshake.");
  });

  it("refuses unknown fingerprints and ungranted scopes after the token verified", async () => {
    const config: mcpserverconfig = { ...defaultmcpconfig(), enabled: true };
    const fixture = await pipelinefixture();
    const unknownfp = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-attacker",
      now,
    });
    expect(unknownfp.error?.message).toMatch(/fp-attacker is not on the allowlist/);
    const namespaceoff = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      toolname: "memory.list",
      now,
    });
    expect(namespaceoff.error?.code).toBe("consentrefused");
    expect(namespaceoff.error?.message).toMatch(/grants no memory tools/);
    const unknownnamespace = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      toolname: "spy.satellite",
      now,
    });
    expect(unknownnamespace.error?.code).toBe("params");
    expect(unknownnamespace.error?.message).toMatch(/no reviewed namespace/);
  });

  it("verifies a clean frame and returns its token", async () => {
    const config: mcpserverconfig = { ...defaultmcpconfig(), enabled: true, httpstream: defaulthttpstream() };
    const fixture = await pipelinefixture();
    const clean = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      toolname: "browser.readtext",
      now,
    });
    expect(clean.error).toBeUndefined();
    expect(clean.token?.clientid).toBe("client1");
    const tokenless = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      rawtoken: fixture.raw,
      allowlist: [],
      fingerprint: "fp-1",
      now,
    });
    expect(tokenless.error?.message).toMatch(/not on the allowlist/);
  });
});

describe("torture: relay server state machine", () => {
  /** Builds one relay session through the deterministic id and hash seams. */
  function createsession(
    state: ReturnType<typeof newrelayserverstate>,
    code: string,
    connectionid = "conn-ext",
  ): { state: ReturnType<typeof newrelayserverstate>; token: string; sessionid: string } {
    const outcome = relayserverframe({
      state,
      connectionid,
      frame: relayframeof({
        op: "sessioncreate",
        opid: "op-1",
        at: now,
        body: { role: "extension", pairingcode: code },
      }),
      now,
      idof: (() => {
        let n = 0;
        return () => `${++n}`;
      })(),
      hashof: (token) => `h(${token})`,
    });
    const reply = JSON.parse(outcome.replies[0] ?? "{}") as {
      sessionid: string;
      token: string;
      body: { sessionid: string; token: string };
    };
    return { state: outcome.state, token: reply.body.token, sessionid: reply.body.sessionid };
  }

  it("refuses the unregistered connection and the unparseable frame without state drift", () => {
    const state = newrelayserverstate();
    const silent = relayserverframe({ state, connectionid: "conn-ghost", frame: "{}", now });
    expect(silent).toEqual({ state, replies: [], routed: [] });
    const registered = relayconnectionopen(state, "conn-1", now);
    const parse = relayserverframe({ state: registered, connectionid: "conn-1", frame: "not json", now });
    expect(parse.replies[0]).toContain("does not parse as a servercontract envelope");
    expect(parse.routed).toEqual([]);
    const emptyid = relayserverframe({
      state: registered,
      connectionid: "conn-1",
      frame: JSON.stringify({ version: 1, op: "eventpost", opid: "", at: now }),
      now,
    });
    expect(emptyid.replies[0]).toContain("does not parse as a servercontract envelope");
  });

  it("registers connections once and drops their tokens on close", () => {
    let state = relayconnectionopen(newrelayserverstate(), "conn-1", now);
    state = relayconnectionopen(state, "conn-1", now + 5);
    expect(state.connections).toHaveLength(1);
    expect(state.connections[0]?.lastframeat).toBe(now);
    expect(() => relayconnectionopen(state, "  ", now)).toThrow(/empty connection id never registers/);
    const created = createsession(state, "DT-AAA", "conn-1");
    expect(
      created.state.tokens.some((record) => record.connectionid === "conn-1" && record.token === created.token),
    ).toBe(true);
    const closed = relayconnectionclose(created.state, "conn-1");
    expect(closed.connections).toHaveLength(0);
    expect(closed.tokens).toHaveLength(0);
    expect(closed.sessions).toHaveLength(1);
  });

  it("serves the sessioncreate operation for the extension member only", () => {
    let state = relayconnectionopen(newrelayserverstate(), "conn-ext", now);
    state = relayconnectionopen(state, "conn-attacker", now);
    const attacker = relayserverframe({
      state,
      connectionid: "conn-attacker",
      frame: relayframeof({ op: "sessioncreate", opid: "op-a", at: now, body: { role: "site" } }),
      now,
      idof: () => "9",
      hashof: (t) => `h(${t})`,
    });
    expect(attacker.replies[0]).toContain("serves the extension member only");
    expect(attacker.state.sessions).toHaveLength(0);
    const created = relayserverframe({
      state,
      connectionid: "conn-ext",
      frame: relayframeof({
        op: "sessioncreate",
        opid: "op-1",
        at: now,
        body: { role: "extension", memberid: "ext-1" },
      }),
      now,
      idof: () => "1",
      hashof: (t) => `h(${t})`,
    });
    const reply = JSON.parse(created.replies[0] ?? "{}") as {
      body: { members: Array<{ role: string; id: string }>; capabilities: unknown };
    };
    expect(reply.body.members).toEqual([{ role: "extension", id: "ext-1", joinedat: now }]);
    expect(created.state.tokens).toHaveLength(1);
    expect(created.state.pairings).toHaveLength(0);
  });

  it("exchanges each pairing code exactly once and refuses the second spend", () => {
    let state = relayconnectionopen(newrelayserverstate(), "conn-ext", now);
    state = relayconnectionopen(state, "conn-site", now);
    state = relayconnectionopen(state, "conn-attacker", now);
    const created = createsession(state, "DT-PAIR");
    expect(created.state.pairings[0]).toMatchObject({ code: "DT-PAIR", used: false });
    const firstjoin = relayserverframe({
      state: created.state,
      connectionid: "conn-site",
      frame: relayframeof({
        op: "sessionjoin",
        opid: "op-2",
        at: now + 1,
        body: { role: "site", pairingcode: "DT-PAIR" },
      }),
      now: now + 1,
      idof: () => "2",
      hashof: (t) => `h(${t})`,
    });
    const joinreply = JSON.parse(firstjoin.replies[0] ?? "{}") as { body: { token: string; sessionid: string } };
    expect(joinreply.body.token).toBe("token-2");
    expect(firstjoin.state.pairings[0]?.used).toBe(true);
    const secondspend = relayserverframe({
      state: firstjoin.state,
      connectionid: "conn-attacker",
      frame: relayframeof({
        op: "sessionjoin",
        opid: "op-3",
        at: now + 2,
        body: { role: "site", pairingcode: "DT-PAIR" },
      }),
      now: now + 2,
      idof: () => "3",
      hashof: (t) => `h(${t})`,
    });
    expect(secondspend.replies[0]).toContain("matches no pending session");
    expect(secondspend.state.sessions).toHaveLength(1);
  });

  it("refuses expired and wrong pairing codes", () => {
    let state = relayconnectionopen(newrelayserverstate(), "conn-ext", now);
    state = relayconnectionopen(state, "conn-site", now);
    const created = createsession(state, "DT-EXP");
    const expired = relayserverframe({
      state: created.state,
      connectionid: "conn-site",
      frame: relayframeof({
        op: "sessionjoin",
        opid: "op-2",
        at: now + 300_001,
        body: { role: "site", pairingcode: "DT-EXP" },
      }),
      now: now + 300_001,
      idof: () => "2",
      hashof: (t) => `h(${t})`,
    });
    expect(expired.replies[0]).toContain("matches no pending session");
    const wrong = relayserverframe({
      state: created.state,
      connectionid: "conn-site",
      frame: relayframeof({
        op: "sessionjoin",
        opid: "op-2",
        at: now + 1,
        body: { role: "site", pairingcode: "DT-OTHER" },
      }),
      now: now + 1,
      idof: () => "2",
      hashof: (t) => `h(${t})`,
    });
    expect(wrong.replies[0]).toContain("matches no pending session");
    const whitespace = relayserverframe({
      state: created.state,
      connectionid: "conn-site",
      frame: relayframeof({ op: "sessionjoin", opid: "op-2", at: now + 1, body: { role: "site", pairingcode: "   " } }),
      now: now + 1,
      idof: () => "2",
      hashof: (t) => `h(${t})`,
    });
    expect(whitespace.replies[0]).toContain("failed the token authentication");
  });

  it("refuses a second site member while the session holds one", () => {
    let state = relayconnectionopen(newrelayserverstate(), "conn-ext", now);
    state = relayconnectionopen(state, "conn-site", now);
    state = relayconnectionopen(state, "conn-evil", now);
    const created = createsession(state, "DT-SITE");
    const first = relayserverframe({
      state: created.state,
      connectionid: "conn-site",
      frame: relayframeof({
        op: "sessionjoin",
        opid: "op-2",
        at: now + 1,
        body: { role: "site", pairingcode: "DT-SITE" },
      }),
      now: now + 1,
      idof: () => "2",
      hashof: (t) => `h(${t})`,
    });
    expect(JSON.parse(first.replies[0] ?? "{}").body.token).toBe("token-2");
    const second = relayserverframe({
      state: first.state,
      connectionid: "conn-evil",
      frame: relayframeof({
        op: "sessionjoin",
        opid: "op-3",
        at: now + 2,
        body: { role: "site", pairingcode: "DT-SITE" },
      }),
      now: now + 2,
      idof: () => "3",
      hashof: (t) => `h(${t})`,
    });
    expect(second.replies[0]).toContain("matches no pending session");
  });

  it("refuses forged tokens on every operation without touching the session state", () => {
    let state = relayconnectionopen(newrelayserverstate(), "conn-ext", now);
    state = relayconnectionopen(state, "conn-site", now);
    state = relayconnectionopen(state, "conn-evil", now);
    const created = createsession(state, "DT-TOK");
    const forged = relayserverframe({
      state: created.state,
      connectionid: "conn-evil",
      frame: relayframeof({
        op: "eventpost",
        opid: "op-e",
        sessionid: created.sessionid,
        token: "forged-token",
        at: now + 1,
        body: { kind: "chat", stream: "chat" },
      }),
      now: now + 1,
      idof: () => "2",
      hashof: (t) => `h(${t})`,
    });
    expect(forged.replies[0]).toContain("failed the token authentication of its session");
    expect(forged.state.sessions[0]?.events).toHaveLength(0);
    const tokenless = relayserverframe({
      state: created.state,
      connectionid: "conn-ext",
      frame: relayframeof({
        op: "eventpost",
        opid: "op-e",
        sessionid: created.sessionid,
        at: now + 1,
        body: { kind: "chat" },
      }),
      now: now + 1,
      idof: () => "2",
      hashof: (t) => `h(${t})`,
    });
    expect(tokenless.replies[0]).toContain("failed the token authentication");
    const wrongsession = relayserverframe({
      state: created.state,
      connectionid: "conn-ext",
      frame: relayframeof({
        op: "eventpost",
        opid: "op-e",
        sessionid: "session-other",
        token: created.token,
        at: now + 1,
        body: { kind: "chat" },
      }),
      now: now + 1,
      idof: () => "2",
      hashof: (t) => `h(${t})`,
    });
    expect(wrongsession.replies[0]).toContain("failed the token authentication");
  });

  it("routes events to the other member with the member token and never echoes secrets", () => {
    let state = relayconnectionopen(newrelayserverstate(), "conn-ext", now);
    state = relayconnectionopen(state, "conn-site", now);
    const created = createsession(state, "DT-ROUTE");
    const joined = relayserverframe({
      state: created.state,
      connectionid: "conn-site",
      frame: relayframeof({
        op: "sessionjoin",
        opid: "op-2",
        at: now + 1,
        body: { role: "site", pairingcode: "DT-ROUTE" },
      }),
      now: now + 1,
      idof: () => "2",
      hashof: (t) => `h(${t})`,
    });
    const sitetoken = (JSON.parse(joined.replies[0] ?? "{}") as { body: { token: string } }).body.token;
    const posted = relayserverframe({
      state: joined.state,
      connectionid: "conn-ext",
      frame: relayframeof({
        op: "eventpost",
        opid: "op-3",
        sessionid: created.sessionid,
        token: created.token,
        at: now + 2,
        body: { kind: "chat", stream: "chat", payload: { text: "hello" } },
      }),
      now: now + 2,
      idof: () => "3",
      hashof: (t) => `h(${t})`,
    });
    expect(posted.routed).toHaveLength(1);
    expect(posted.routed[0]?.connectionid).toBe("conn-site");
    const routedframe = JSON.parse(posted.routed[0]?.frame ?? "{}") as {
      token?: string;
      body: { payload: { text: string } };
    };
    expect(routedframe.token).toBe(sitetoken);
    expect(routedframe.body.payload.text).toBe("hello");
    const reply = JSON.parse(posted.replies[0] ?? "{}") as { body: { accepted: boolean } };
    expect(reply.body.accepted).toBe(true);
    expect(posted.state.sessions[0]?.events[0]).toMatchObject({ opid: "op-3", kind: "chat", stream: "chat" });
  });

  it("acks the eventstream subscription and refuses the operations outside the contract", () => {
    let state = relayconnectionopen(newrelayserverstate(), "conn-ext", now);
    const created = createsession(state, "DT-STREAM");
    const subscribed = relayserverframe({
      state: created.state,
      connectionid: "conn-ext",
      frame: relayframeof({
        op: "eventstream",
        opid: "op-2",
        sessionid: created.sessionid,
        token: created.token,
        at: now + 1,
        body: { streams: ["chat", "review"], subscribed: true },
      }),
      now: now + 1,
      idof: () => "2",
      hashof: (t) => `h(${t})`,
    });
    const ack = JSON.parse(subscribed.replies[0] ?? "{}") as { body: { streams: string[]; subscribed: boolean } };
    expect(ack.body.streams).toEqual(["chat", "review"]);
    expect(ack.body.subscribed).toBe(true);
    const invalidstreams = relayserverframe({
      state: created.state,
      connectionid: "conn-ext",
      frame: relayframeof({
        op: "eventstream",
        opid: "op-3",
        sessionid: created.sessionid,
        token: created.token,
        at: now + 1,
        body: { streams: "chat" },
      }),
      now: now + 1,
      idof: () => "3",
      hashof: (t) => `h(${t})`,
    });
    expect(JSON.parse(invalidstreams.replies[0] ?? "{}").body.streams).toEqual([]);
    const outside = relayserverframe({
      state: created.state,
      connectionid: "conn-ext",
      frame: JSON.stringify({ version: 1, op: "eventack", opid: "op-4", at: now + 1 }),
      now: now + 1,
      idof: () => "4",
      hashof: (t) => `h(${t})`,
    });
    expect(outside.replies[0]).toContain("does not parse as a servercontract envelope");
  });

  it("rotates the token of a returning member and revokes the previous one", () => {
    let state = relayconnectionopen(newrelayserverstate(), "conn-ext", now);
    const created = createsession(state, "");
    const rotated = relayserverframe({
      state: created.state,
      connectionid: "conn-ext",
      frame: relayframeof({
        op: "sessionjoin",
        opid: "op-2",
        sessionid: created.sessionid,
        token: created.token,
        at: now + 1,
        body: { role: "extension" },
      }),
      now: now + 1,
      idof: () => "9",
      hashof: (t) => `h(${t})`,
    });
    const reply = JSON.parse(rotated.replies[0] ?? "{}") as { body: { token: string; rotated: boolean } };
    expect(reply.body.token).toBe("token-9");
    expect(reply.body.rotated).toBe(true);
    const session = rotated.state.sessions[0]!;
    expect(session.revoked).toContain(`h(${created.token})`);
    expect(relaylivetokens(session)).not.toContain(`h(${created.token})`);
    const replay = relayserverframe({
      state: rotated.state,
      connectionid: "conn-ext",
      frame: relayframeof({
        op: "eventpost",
        opid: "op-3",
        sessionid: created.sessionid,
        token: created.token,
        at: now + 2,
        body: { kind: "chat", stream: "chat" },
      }),
      now: now + 2,
      idof: () => "3",
      hashof: (t) => `h(${t})`,
    });
    expect(replay.replies[0]).toContain("failed the token authentication");
    const fresh = relayserverframe({
      state: rotated.state,
      connectionid: "conn-ext",
      frame: relayframeof({
        op: "eventpost",
        opid: "op-4",
        sessionid: created.sessionid,
        token: "token-9",
        at: now + 3,
        body: { kind: "chat", stream: "chat" },
      }),
      now: now + 3,
      idof: () => "4",
      hashof: (t) => `h(${t})`,
    });
    expect(JSON.parse(fresh.replies[0] ?? "{}").body.accepted).toBe(true);
  });

  it("sweeps idle connections and lists pending pairings inside their window", () => {
    let state = relayconnectionopen(newrelayserverstate(), "conn-ext", now);
    state = relayconnectionopen(state, "conn-site", now - 60_000);
    expect(relayidleconnections(state, now, 60_000)).toEqual(["conn-site"]);
    expect(relayidleconnections(state, now, 60_001)).toEqual([]);
    expect(relayidleconnections(state, now, Number.NaN)).toEqual([]);
    expect(relayidleconnections(state, now, 0)).toEqual([]);
    expect(relayidleconnections(state, now, -1)).toEqual([]);
    const created = createsession(state, "DT-PEND");
    expect(relaypendingpairings(created.state, now)).toEqual(["DT-PEND"]);
    expect(relaypendingpairings(created.state, now + 300_000)).toEqual([]);
    const joined = relayserverframe({
      state: created.state,
      connectionid: "conn-site",
      frame: relayframeof({
        op: "sessionjoin",
        opid: "op-2",
        at: now + 1,
        body: { role: "site", pairingcode: "DT-PEND" },
      }),
      now: now + 1,
      idof: () => "2",
      hashof: (t) => `h(${t})`,
    });
    expect(relaypendingpairings(joined.state, now + 1)).toEqual([]);
    expect(relayframeof({ op: "eventpost", opid: "op-x", at: now, body: {} })).toBe(
      JSON.stringify({ version: 1, op: "eventpost", opid: "op-x", at: now, body: {} }),
    );
  });
});

describe("torture: stdio framing", () => {
  it("splits lines while partial tails stay buffered", () => {
    expect(splitlines("a\nb\n")).toEqual({ lines: ["a", "b"], rest: "" });
    expect(splitlines("a\nb")).toEqual({ lines: ["a"], rest: "b" });
    expect(splitlines("abc")).toEqual({ lines: [], rest: "abc" });
    expect(splitlines("")).toEqual({ lines: [], rest: "" });
    expect(splitlines("\n\n\n")).toEqual({ lines: [], rest: "" });
    expect(splitlines("  a  \n  b  ")).toEqual({ lines: ["a"], rest: "  b  " });
    expect(splitlines("a\0b\nc").lines).toEqual(["a\0b"]);
    expect(splitlines("a\r\nb\n").lines).toEqual(["a", "b"]);
  });

  it("pumps partial chunks into complete frames with the counters advancing", async () => {
    const written: string[] = [];
    const pump = createlinepump({
      write: (line) => {
        written.push(line);
      },
      handle: async (frame) => ({ jsonrpc: "2.0", id: frame.id ?? null, result: { echo: frame.method } }),
      now,
    });
    await pump.feed('{"jsonrpc":"2.0","id":1,');
    expect(written).toHaveLength(0);
    await pump.feed('"method":"ping"}\n{"jsonrpc":"2.0","id":2,"method":"ping"}\n');
    expect(written).toEqual([
      `${JSON.stringify({ jsonrpc: "2.0", id: 1, result: { echo: "ping" } })}\n`,
      `${JSON.stringify({ jsonrpc: "2.0", id: 2, result: { echo: "ping" } })}\n`,
    ]);
    await pump.feed("\n\n");
    const record = pump.record();
    expect(record.kind).toBe("stdio");
    expect(record.endpoint).toBe("stdio://devthink");
    expect(record.received).toBe(2);
    expect(record.sent).toBe(2);
    expect(record.startedat).toBe(now);
    expect(record.lastframeat).toBe(now);
    const closed = pump.close(now + 10);
    expect(closed.closedat).toBe(now + 10);
  });

  it("answers notifications with nothing and decode failures with the parse error", async () => {
    const written: string[] = [];
    let handled = 0;
    const pump = createlinepump({
      write: (line) => {
        written.push(line);
      },
      handle: async (frame) => {
        handled += 1;
        return { jsonrpc: "2.0", id: frame.id ?? null, result: null };
      },
      now,
    });
    await pump.feed('{"jsonrpc":"2.0","method","notifications/only"}\n'.replace("method", ",method"));
    await pump.feed('{"jsonrpc":"2.0","method":"notify/x"}\n');
    expect(handled).toBe(0);
    expect(written).toHaveLength(1);
    expect(JSON.parse(written[0] ?? "{}")).toMatchObject({ jsonrpc: "2.0", id: null, error: { code: "parse" } });
    await pump.feed("not json at all\n");
    expect(written).toHaveLength(2);
    expect(JSON.parse(written[1] ?? "{}")).toMatchObject({ id: null, error: { code: "parse" } });
  });

  it("keeps the transport alive when one handler throws", async () => {
    const written: string[] = [];
    let calls = 0;
    const pump = createlinepump({
      write: (line) => {
        written.push(line);
      },
      handle: async (frame) => {
        calls += 1;
        if (calls === 1) throw new Error("handler exploded");
        return { jsonrpc: "2.0", id: frame.id ?? null, result: "ok" };
      },
      now,
    });
    await pump.feed(
      '{"jsonrpc":"2.0","id":"boom","method":"tools/call"}\n{"jsonrpc":"2.0","id":"fine","method":"tools/call"}\n',
    );
    expect(written).toHaveLength(2);
    expect(JSON.parse(written[0] ?? "{}")).toMatchObject({
      id: "boom",
      error: { code: "internal", message: "handler exploded" },
    });
    expect(JSON.parse(written[1] ?? "{}")).toMatchObject({ id: "fine", result: "ok" });
    expect(pump.record().received).toBe(2);
  });
});
