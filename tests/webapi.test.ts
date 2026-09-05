import { describe, expect, it } from "vitest";
import { apicallrecordof, cachecleanup, cachekeyof, cacheresponse, cacheserv, correlationexport, correlateids, formpost, graphqlsub, graphqlsubscribeframe, graphqlsubscriptionof, joincorrelation, longpoll, longpollrequestof, multipartpost, parsegraphqlmessage, ratelimitdirectiveof, ratelimitrespect, ratelimitwaitof, subevents, type pollfetch, type streamopen } from "../gateway.js";
import { apicallgrade, cachegate, correlationmappinggate, postgate, ratelimitrespectgate, subscribegate, subscriptionboundgate, transportgate, uploadgate } from "../policy.js";
import type { correlationcontext, eventsubscription, multipartpayload, pollcursor } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one reviewed event subscription fixture of the pricing stream. */
function subscription(over: Partial<eventsubscription> = {}): eventsubscription {
  return { id: "s1", runid: "run1", stepid: "st1", url: "https://example.com/stream", origin: "https://example.com", state: "open", events: 0, names: [], cancel: { kind: "stop", value: "stop" }, openedat: now, ...over };
}

/** Builds one reviewed long poll cursor fixture. */
function pollcursorfixture(over: Partial<pollcursor> = {}): pollcursor {
  return { url: "https://example.com/poll", cursorfield: "cursor", interval: 10, stop: { field: "done", equals: "true" }, ...over };
}

describe("web api server sent events subscription", () => {
  it("parses the event data id and retry fields chunk by chunk while the last event id resumes the stream after a reconnect and a cancelled step closes the channel cleanly", async () => {
    const opened: Array<{ url: string; headers: Record<string, string> }> = [];
    const chunks = ["event: price\ndata: 10\nid: e1\nretry: 500\n\n", "event: price\ndata: 20\nid: e2\n\nevent: done\ndata: finished\nid: e3\n\n"];
    const open: streamopen = async (url, headers) => {
      opened.push({ url, headers });
      let index = 0;
      return { ok: true, status: 200, read: async () => (index < chunks.length ? { done: false, text: chunks[index++] ?? "" } : { done: true }) };
    };
    const resumed = await subevents({ record: subscription({ lasteventid: "e0" }), open, now: () => now });
    expect(opened[0]?.headers["last-event-id"]).toBe("e0");
    expect(opened[0]?.headers.accept).toBe("text/event-stream");
    expect(resumed.events.map(event => event.data)).toEqual(["10", "20", "finished"]);
    expect(resumed.events[0]?.event).toBe("price");
    expect(resumed.events[0]?.id).toBe("e1");
    expect(resumed.events[0]?.retry).toBe(500);
    expect(resumed.record.events).toBe(3);
    expect(resumed.record.lasteventid).toBe("e3");
    expect(resumed.record.names).toEqual(["price", "done"]);
    expect(resumed.record.state).toBe("closed");
    expect(resumed.error).toBeUndefined();
    let reads = 0;
    const cancelledopen: streamopen = async () => ({ ok: true, status: 200, read: async () => { reads += 1; return reads <= 2 ? { done: false, text: chunks[reads - 1] ?? "" } : { done: true }; } });
    const cancelled = await subevents({ record: subscription(), open: cancelledopen, cancelled: () => reads >= 2, now: () => now });
    expect(cancelled.record.state).toBe("closed");
    expect(cancelled.record.events).toBe(3);
    expect(cancelled.error).toBeUndefined();
    const failed = await subevents({ record: subscription(), open: async () => ({ ok: false, status: 403, read: async () => ({ done: true }), error: "The event stream channel refused the subscription." }), now: () => now });
    expect(failed.record.state).toBe("failed");
    expect(failed.error).toContain("refused");
    const elapsed = await subevents({ record: subscription({ lifetime: 5000 }), open, now: () => now + 10000 });
    expect(elapsed.record.state).toBe("closed");
    expect(elapsed.events).toHaveLength(0);
    expect(subscribegate({ url: "https://example.com/stream", grants: ["https://example.com"] }).allowed).toBe(true);
    expect(subscribegate({ url: "wss://outside.example/stream", grants: ["https://example.com"] }).allowed).toBe(false);
    expect(subscriptionboundgate({ count: 2, limit: 2 }).allowed).toBe(true);
    expect(subscriptionboundgate({ count: 3, limit: 2 }).allowed).toBe(false);
    expect(subscriptionboundgate({ count: 3 }).allowed).toBe(true);
  });
});

describe("web api long poll loop", () => {
  it("retries a timed out request under the configured backoff while the loop stops on the reviewed stop condition, the cancellation flag and the plan expiry", async () => {
    expect(longpollrequestof({ url: "https://example.com/poll", timeout: 500, cursor: "c0" })).toEqual({ url: "https://example.com/poll", timeout: 500, cursor: "c0" });
    expect(longpollrequestof({ timeout: 500 })).toBeUndefined();
    const answers: Array<{ status: number; headers: Record<string, string>; body: string; timeout?: boolean }> = [
      { status: 504, headers: {}, body: "", timeout: true },
      { status: 200, headers: {}, body: JSON.stringify({ cursor: "c1", done: "false" }) },
      { status: 200, headers: {}, body: JSON.stringify({ cursor: "c2", done: "true" }) },
    ];
    const calls: Array<{ url: string; body?: string }> = [];
    const sleeps: number[] = [];
    let index = 0;
    const fetchpoll: pollfetch = async (url, body) => { calls.push({ url, ...(body !== undefined ? { body } : {}) }); const answer = answers[index++] ?? { status: 200, headers: {}, body: "{}" }; return answer; };
    const result = await longpoll({ request: { url: "https://example.com/poll", timeout: 500 }, cursor: pollcursorfixture(), fetchpoll, backoff: 5, now: () => now, sleep: async milliseconds => { sleeps.push(milliseconds); } });
    expect(result.polls).toBe(2);
    expect(result.retries).toBe(1);
    expect(result.cursor).toBe("c1");
    expect(result.reason).toContain("stop condition matched done true");
    expect(result.exchanges.map(exchange => exchange.timeout)).toEqual([true, false, false]);
    expect(calls[0]?.body).toBeUndefined();
    expect(calls[1]?.body).toBeUndefined();
    expect(calls[2]?.body).toBe(JSON.stringify({ cursor: "c1" }));
    expect(sleeps).toEqual([5, 10]);
    const cancelled = await longpoll({ request: { url: "https://example.com/poll" }, cursor: pollcursorfixture(), fetchpoll, cancelled: () => true, now: () => now, sleep: async () => {} });
    expect(cancelled.polls).toBe(0);
    expect(cancelled.reason).toContain("cancelled");
    const expired = await longpoll({ request: { url: "https://example.com/poll" }, cursor: pollcursorfixture(), fetchpoll, expiresat: now - 1, now: () => now, sleep: async () => {} });
    expect(expired.reason).toContain("plan expiry");
    const ceiling = await longpoll({ request: { url: "https://example.com/poll" }, cursor: pollcursorfixture({ maxpolls: 1 }), fetchpoll: async () => ({ status: 200, headers: {}, body: JSON.stringify({ cursor: "c9", done: "false" }) }), now: () => now, sleep: async () => {} });
    expect(ceiling.reason).toContain("poll ceiling of 1");
    expect(ratelimitrespectgate({ waitms: 500, origin: "https://example.com", budget: 1000 }).allowed).toBe(true);
    expect(ratelimitrespectgate({ waitms: 5000, origin: "https://example.com", budget: 1000 }).allowed).toBe(false);
  });
});

describe("web api graphql subscription mapping", () => {
  it("maps the next error and complete messages of the graphql-ws grammar into step results while the subscribe frame carries the query and its variables", () => {
    const parsed = graphqlsubscriptionof({ query: "subscription { price(symbol: $symbol) }", channel: "wss://example.com/ws", variables: { symbol: "dev" } });
    expect(parsed).toEqual({ query: "subscription { price(symbol: $symbol) }", variables: { symbol: "dev" }, channel: "wss://example.com/ws" });
    expect(graphqlsubscriptionof({ channel: "wss://example.com/ws" })).toBeUndefined();
    expect(graphqlsubscriptionof({ query: "subscription { price }", channel: "wss://example.com/ws", variables: { symbol: 3 } })).toBeUndefined();
    const frame = graphqlsubscribeframe(parsed!, "op1");
    expect(JSON.parse(frame)).toEqual({ id: "op1", type: "subscribe", payload: { query: "subscription { price(symbol: $symbol) }", variables: { symbol: "dev" } } });
    const messages = [
      JSON.stringify({ id: "op1", type: "next", payload: { price: 10 } }),
      "not json",
      JSON.stringify({ id: "op1", type: "error", payload: [{ message: "the channel broke" }] }),
      JSON.stringify({ id: "op1", type: "next", payload: { price: 20 } }),
      JSON.stringify({ id: "op1", type: "complete" }),
    ];
    const mapped = graphqlsub({ subscription: parsed!, messages });
    expect(mapped.results).toEqual([{ id: "op1", data: { price: 10 } }, { id: "op1", data: { price: 20 } }]);
    expect(mapped.errors.join(" ")).toContain("does not parse as json");
    expect(mapped.errors.join(" ")).toContain("the channel broke");
    expect(mapped.completed).toBe(true);
    expect(parsegraphqlmessage(JSON.stringify({ type: "next", payload: 1 }))).toEqual({ kind: "next", payload: 1 });
    expect(parsegraphqlmessage(JSON.stringify({ type: "stop", id: "op1" }))).toEqual({ kind: "complete", id: "op1" });
    expect(parsegraphqlmessage(JSON.stringify({ type: "ka" }))).toEqual({ kind: "error", errors: ["The graphql subscription message carries the unknown type ka."] });
    expect(graphqlsub({ subscription: parsed!, messages: [JSON.stringify({ type: "next", payload: { price: 30 } })] }).completed).toBe(false);
  });
});

describe("web api form posts and multipart uploads", () => {
  it("encodes the reviewed fields with the urlencoded content type while the multipart body streams its parts chunk by chunk with progress and refuses unreviewed files and ungranted origins", () => {
    const form = formpost({ payload: { url: "https://example.com/submit", fields: [{ name: "name", value: "Dev Think" }, { name: "price", value: "1299.50" }] }, grants: ["https://example.com"] });
    expect(form.ok).toBe(true);
    if (form.ok) {
      expect(form.method).toBe("POST");
      expect(form.headers["content-type"]).toBe("application/x-www-form-urlencoded");
      expect(form.body).toBe("name=Dev%20Think&price=1299.50");
    }
    const refusedform = formpost({ payload: { url: "https://outside.example/submit", fields: [] }, grants: ["https://example.com"] });
    expect(refusedform.ok).toBe(false);
    if (!refusedform.ok) expect(refusedform.refusal).toContain("outside the session grants");
    const payload: multipartpayload = { url: "https://example.com/upload", fields: [{ name: "label", value: "report" }], files: [{ name: "file", filename: "report.csv", mime: "text/csv", content: "a,b\n1,2\n", reviewed: true }], boundary: "----devthink" };
    const progress: Array<{ chunk: number; chunks: number; sent: number; total: number }> = [];
    const upload = multipartpost({ payload, grants: ["https://example.com"], onprogress: entry => { progress.push({ ...entry }); } });
    expect(upload.ok).toBe(true);
    if (upload.ok) {
      expect(upload.headers["content-type"]).toBe("multipart/form-data; boundary=----devthink");
      expect(upload.chunks).toHaveLength(3);
      expect(upload.chunks[0]).toContain('content-disposition: form-data; name="label"');
      expect(upload.chunks[0]).toContain("report");
      expect(upload.chunks[1]).toContain('name="file"; filename="report.csv"');
      expect(upload.chunks[1]).toContain("content-type: text/csv");
      expect(upload.chunks[1]).toContain("a,b\n1,2\n");
      expect(upload.chunks[2]).toBe("------devthink--\r\n");
      expect(upload.bytes).toBe(upload.chunks.reduce((total, chunk) => total + chunk.length, 0));
      expect(progress.map(entry => entry.chunk)).toEqual([1, 2, 3]);
      expect(progress[2]?.sent).toBe(upload.bytes);
      expect(progress[2]?.total).toBe(upload.bytes);
    }
    const unreviewed = multipartpost({ payload: { ...payload, files: [{ name: "file", filename: "x.csv", mime: "text/csv", content: "x", reviewed: false }] }, grants: ["https://example.com"] });
    expect(unreviewed.ok).toBe(false);
    if (!unreviewed.ok) expect(unreviewed.refusal).toContain("explicit reviewed flag");
    const outside = multipartpost({ payload: { url: "https://outside.example/upload", fields: [], files: [] }, grants: ["https://example.com"] });
    expect(outside.ok).toBe(false);
    expect(transportgate({ url: "https://example.com/api", grants: ["https://example.com"] }).allowed).toBe(true);
    expect(transportgate({ url: "https://outside.example/api", grants: ["https://example.com"] }).allowed).toBe(false);
    expect(transportgate({ url: "not a url", grants: ["https://example.com"] }).allowed).toBe(false);
    expect(postgate("postform").allowed).toBe(true);
    expect(postgate("postfiles").allowed).toBe(true);
    expect(postgate("subscribesse").allowed).toBe(false);
    expect(uploadgate({ files: [{ reviewed: true }], count: 1 }).allowed).toBe(true);
    expect(uploadgate({ files: [{ reviewed: false }], count: 1 }).allowed).toBe(false);
    expect(uploadgate({ files: [], count: 0 }).allowed).toBe(false);
  });
});

describe("web api correlation ids", () => {
  it("assigns one id per outbound request of the run while the responses join their pairs and the export reads the per run map", () => {
    let context: correlationcontext = { runid: "run1", requests: [] };
    const first = correlateids({ context, stepid: "st1", url: "https://example.com/api/price", method: "GET", now });
    expect(first.requestid).toBe("req-1");
    expect(first.context.requests[0]?.correlationid).toBe("run1-1");
    expect(first.context.requests[0]?.origin).toBe("https://example.com");
    const second = correlateids({ context: first.context, stepid: "st2", url: "https://example.com/api/order", method: "POST", now: now + 1000 });
    expect(second.requestid).toBe("req-2");
    const joined = joincorrelation({ context: second.context, requestid: "req-1", responseid: "res-1", status: 200, now: now + 2000 });
    expect(joined.requests.find(request => request.requestid === "req-1")?.responseid).toBe("res-1");
    expect(joined.requests.find(request => request.requestid === "req-1")?.status).toBe(200);
    expect(joined.requests.find(request => request.requestid === "req-2")?.responseid).toBeUndefined();
    expect(() => joincorrelation({ context: joined, requestid: "req-9", status: 200, now })).toThrow(/carries no request req-9/);
    const exported = correlationexport(joined);
    expect(exported.runid).toBe("run1");
    expect(exported.requests).toBe(2);
    expect(exported.pairs).toBe(1);
    expect(exported.map.find(entry => entry.requestid === "req-1")?.paired).toBe(true);
    expect(exported.map.find(entry => entry.requestid === "req-2")?.paired).toBe(false);
    expect(exported.map.find(entry => entry.requestid === "req-2")?.method).toBe("POST");
    expect(correlationmappinggate("assign").allowed).toBe(true);
    expect(correlationmappinggate("join").allowed).toBe(true);
    expect(correlationmappinggate("export").allowed).toBe(true);
    expect(correlationmappinggate("rewrite").allowed).toBe(false);
  });
});

describe("web api rate limit respect and response caching", () => {
  it("delays the next request of an origin until the reset window passes while the per run cache serves repeated read only calls and expires by its headers", async () => {
    const directive = ratelimitdirectiveof({ "x-ratelimit-remaining": "3", "x-ratelimit-reset": "5" }, "https://example.com", 200, now);
    expect(directive).toMatchObject({ origin: "https://example.com", scope: "https://example.com", remaining: 3, resetat: now + 5000 });
    const epoch = ratelimitdirectiveof({ "x-ratelimit-reset": "1800000060" }, "https://example.com", 200, now);
    expect(epoch?.resetat).toBe(1_800_000_060_000);
    const limited = ratelimitdirectiveof({ "retry-after": "2" }, "https://example.com", 429, now);
    expect(limited?.retryafter).toBe(2000);
    expect(limited?.resetat).toBe(now + 2000);
    expect(ratelimitdirectiveof({ "content-type": "text/html" }, "https://example.com", 200, now)).toBeUndefined();
    const waits: number[] = [];
    const respected = await ratelimitrespect({ directives: [directive!], origin: "https://example.com", now: () => now, sleep: async milliseconds => { waits.push(milliseconds); } });
    expect(respected.waitms).toBe(5000);
    expect(respected.directive?.remaining).toBe(3);
    expect(waits).toEqual([5000]);
    expect(ratelimitwaitof([directive!], "https://other.example", now).waitms).toBe(0);
    expect(ratelimitwaitof([{ ...directive!, resetat: now - 1 }], "https://example.com", now).waitms).toBe(0);
    const stored = cacheresponse({ entries: [], url: "https://example.com/api/price", method: "GET", body: "", headers: { "cache-control": "max-age=60" }, status: 200, runid: "run1", now });
    expect(stored.entry?.expiry).toBe(now + 60000);
    expect(stored.entry?.key).toBe(cachekeyof({ runid: "run1", url: "https://example.com/api/price", method: "GET", body: "" }));
    expect(cachekeyof({ runid: "run1", url: "https://example.com/api/price", method: "GET", body: "" })).not.toBe(cachekeyof({ runid: "run2", url: "https://example.com/api/price", method: "GET", body: "" }));
    const served = cacheserv({ entries: stored.entries, url: "https://example.com/api/price", method: "GET", body: "", runid: "run1", now: now + 1000 });
    expect(served.entry?.hits).toBe(1);
    expect(served.entry?.body).toBe(stored.entry?.body);
    const miss = cacheserv({ entries: stored.entries, url: "https://example.com/api/price", method: "GET", body: "other", runid: "run1", now: now + 1000 });
    expect(miss.entry).toBeUndefined();
    const mutated = cacheresponse({ entries: stored.entries, url: "https://example.com/api/price", method: "GET", body: "", headers: {}, status: 200, runid: "run1", now, mutatedat: now });
    expect(mutated.refusal).toContain("mutation");
    expect(mutated.entries).toHaveLength(0);
    const postrefusal = cacheresponse({ entries: [], url: "https://example.com/api/price", method: "POST", body: "{}", headers: {}, status: 200, runid: "run1", now });
    expect(postrefusal.refusal).toContain("mutation verb");
    const credrefusal = cacheresponse({ entries: [], url: "https://example.com/api/price", method: "GET", body: "", headers: {}, status: 200, runid: "run1", now, credentials: true });
    expect(credrefusal.refusal).toContain("credentials");
    const expired = cacheserv({ entries: stored.entries, url: "https://example.com/api/price", method: "GET", body: "", runid: "run1", now: now + 61000 });
    expect(expired.entry).toBeUndefined();
    expect(expired.expired?.key).toBe(stored.entry?.key);
    expect(expired.entries).toHaveLength(0);
    const cleaned = cachecleanup([...stored.entries, { ...stored.entry!, expiry: now - 1 }], now);
    expect(cleaned.kept).toHaveLength(1);
    expect(cleaned.expired).toHaveLength(1);
    expect(cachegate({ credentials: false, url: "https://example.com/api" }).allowed).toBe(true);
    expect(cachegate({ credentials: true, url: "https://example.com/api" }).allowed).toBe(false);
    const observed = apicallrecordof({ id: "a1", runid: "run1", stepid: "st1", url: "https://example.com/api/price?symbol=dev", method: "GET", status: 200, mime: "application/json", at: now });
    expect(observed.endpoint).toBe("/api/price?symbol=dev");
    expect(observed.origin).toBe("https://example.com");
    expect(apicallgrade("observeapicalls").allowed).toBe(true);
    expect(apicallgrade("apicallrecord").allowed).toBe(true);
    expect(apicallgrade("cacheresponse").allowed).toBe(false);
  });
});
