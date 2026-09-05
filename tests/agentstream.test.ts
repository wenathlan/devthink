import { describe, expect, it } from "vitest";
import { answersampling, assemblechunks, callprompt, cancelframeof, canceltool, chunkcontent, listprompts, notifyevent, notifyprogress, notifyresource, readonlyeventkinds, protocoleventkinds, renderprompt, requestsampling, streamchunkof, subscriberegister, unsubscriberegister, watchresource, unwatchresource } from "../agent.js";
import type { callcontext, capabilityset, toolresult } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one client capability set with the sampling flag the callbacks respect. */
function caps(sampling: boolean): capabilityset {
  return { protocolversion: "1.1.56", name: "client", version: "1", toolversion: 1, tools: 4, namespaces: ["browser"], transports: ["stdio"], sampling, prompts: true, streaming: true };
}

describe("agentstream event subscriptions", () => {
  it("registers subscriptions with their kinds and filters and refuses unknown kinds", () => {
    const registered = subscriberegister({ clientid: "client1", kinds: ["callresult", "progress"], origin: "https://example.com", tool: "browser.readtext", now });
    expect(registered.subscription?.kinds).toEqual(["callresult", "progress"]);
    expect(registered.subscription?.origin).toBe("https://example.com");
    expect(registered.subscription?.tool).toBe("browser.readtext");
    expect(registered.subscription?.createdat).toBe(now);
    const defaulted = subscriberegister({ clientid: "client1", now });
    expect(defaulted.subscription?.kinds).toEqual(readonlyeventkinds);
    expect(protocoleventkinds).toContain("callstarted");
    expect(readonlyeventkinds).not.toContain("callstarted");
    expect(subscriberegister({ clientid: "", now }).reason).toMatch(/paired client/i);
    expect(subscriberegister({ clientid: "client1", kinds: ["bogus" as never], now }).reason).toMatch(/not a protocol event kind/i);
    expect(subscriberegister({ clientid: "client1", origin: " ", now }).reason).toMatch(/origin filter/i);
    expect(subscriberegister({ clientid: "client1", tool: " ", now }).reason).toMatch(/tool filter/i);
  });

  it("unsubscribes by id while the record stays for the audit trail", () => {
    const subscription = subscriberegister({ clientid: "client1", now, id: "sub1" }).subscription;
    expect(subscription).toBeDefined();
    const cancelled = unsubscriberegister([subscription as NonNullable<typeof subscription>], "sub1", now + 1);
    expect(cancelled[0]?.canceledat).toBe(now + 1);
    expect(unsubscriberegister(cancelled, "sub1", now + 2)[0]?.canceledat).toBe(now + 1);
  });

  it("pushes protocol events to the matching subscribers only", () => {
    const one = subscriberegister({ clientid: "client1", kinds: ["callresult"], now, id: "sub1" }).subscription as NonNullable<ReturnType<typeof subscriberegister>["subscription"]>;
    const two = subscriberegister({ clientid: "client2", kinds: ["callresult", "progress"], origin: "https://example.com", now, id: "sub2" }).subscription as NonNullable<ReturnType<typeof subscriberegister>["subscription"]>;
    const three = subscriberegister({ clientid: "client3", kinds: ["progress"], tool: "browser.readtext", now, id: "sub3" }).subscription as NonNullable<ReturnType<typeof subscriberegister>["subscription"]>;
    const cancelled = { ...(subscriberegister({ clientid: "client4", kinds: ["callresult"], now, id: "sub4" }).subscription as NonNullable<ReturnType<typeof subscriberegister>["subscription"]>), canceledat: now };
    const delivered = notifyevent({ subscriptions: [one, two, three, cancelled], kind: "callresult", origin: "https://example.com", tool: "browser.readtext", payload: { ok: true }, now: now + 5 });
    expect(delivered.deliveries.map(delivery => delivery.subscriptionid)).toEqual(["sub1", "sub2"]);
    expect(delivered.deliveries[0]?.frame.method).toBe("events/notify");
    expect((delivered.deliveries[0]?.frame.params as { kind?: string }).kind).toBe("callresult");
    expect(delivered.deliveries[0]?.frame.params?.payload).toEqual({ ok: true });
    expect(delivered.subscriptions.find(subscription => subscription.id === "sub1")?.lastdeliveredat).toBe(now + 5);
    const filtered = notifyevent({ subscriptions: [two], kind: "callresult", origin: "https://other.example", now: now + 6 });
    expect(filtered.deliveries).toHaveLength(0);
    const toolevent = notifyevent({ subscriptions: [three], kind: "progress", tool: "browser.click", now });
    expect(toolevent.deliveries).toHaveLength(0);
  });
});

describe("agentstream resource watchers", () => {
  it("starts watchers with the page state baseline and refuses empty resources", () => {
    const watched = watchresource({ clientid: "client1", resource: "page", state: { url: "https://example.com", title: "Example" }, now });
    expect(watched.watch?.baseline).toEqual({ url: "https://example.com", title: "Example" });
    expect(watched.watch?.resource).toBe("page");
    expect(watchresource({ clientid: "client1", resource: " ", now }).reason).toMatch(/resource it watches/i);
    expect(watchresource({ clientid: "", resource: "page", now }).reason).toMatch(/paired client/i);
    expect(watchresource({ clientid: "client1", resource: "page", now }).watch?.baseline).toEqual({});
  });

  it("pushes the page state deltas of changed keys and absorbs the baseline", () => {
    const watch = watchresource({ clientid: "client1", resource: "page", state: { url: "https://example.com", title: "Example" }, now, id: "watch1" }).watch as NonNullable<ReturnType<typeof watchresource>["watch"]>;
    const unchanged = notifyresource({ watches: [watch], resource: "page", state: { url: "https://example.com", title: "Example" }, now: now + 1 });
    expect(unchanged.deliveries).toHaveLength(0);
    const changed = notifyresource({ watches: [watch], resource: "page", state: { url: "https://example.com/next", title: "Example" }, now: now + 2 });
    expect(changed.deliveries).toHaveLength(1);
    expect(changed.deliveries[0]?.delta).toEqual({ url: "https://example.com/next" });
    expect(changed.watches[0]?.baseline.url).toBe("https://example.com/next");
    expect(changed.watches[0]?.lastdeliveredat).toBe(now + 2);
    const other = notifyresource({ watches: changed.watches, resource: "other", state: { url: "https://elsewhere.example" }, now: now + 3 });
    expect(other.deliveries).toHaveLength(0);
    const unwatched = unwatchresource(changed.watches, "watch1", now + 4);
    expect(unwatched[0]?.canceledat).toBe(now + 4);
  });
});

describe("agentstream sampling callbacks", () => {
  it("sends sampling requests that respect the client capabilities and strip ungranted page content", () => {
    const capable = requestsampling({ clientid: "client1", capabilities: caps(true), prompt: "Summarize the run.", pagecontent: "the page text", pagegrant: false, now });
    expect(capable.request?.prompt).toMatch(/page content stays stripped/i);
    expect(capable.request?.pagecontent).toBeUndefined();
    const granted = requestsampling({ clientid: "client1", capabilities: caps(true), prompt: "Summarize.", pagecontent: "the page text", pagegrant: true, now });
    expect(granted.request?.pagecontent).toBe("the page text");
    expect(granted.request?.prompt).toBe("Summarize.");
    expect(requestsampling({ clientid: "client1", capabilities: caps(false), prompt: "Summarize.", now }).reason).toMatch(/declared no sampling capability/i);
    expect(requestsampling({ clientid: "client1", capabilities: caps(true), prompt: " ", now }).reason).toMatch(/needs its prompt/i);
    expect(requestsampling({ clientid: "client1", capabilities: caps(true), prompt: "Summarize.", maxtokens: 0, now }).reason).toMatch(/positive user value/i);
    expect(requestsampling({ clientid: "client1", prompt: "Summarize.", now }).request?.state).toBe("pending");
  });

  it("completes the sampling round trip with answers and refusals while closed requests stay untouched", () => {
    const request = requestsampling({ clientid: "client1", prompt: "Summarize.", now, id: "sample1" }).request as NonNullable<ReturnType<typeof requestsampling>["request"]>;
    const answered = answersampling({ requests: [request], id: "sample1", answer: "the model answer", now: now + 10 });
    expect(answered.request?.state).toBe("answered");
    expect(answered.request?.answer).toBe("the model answer");
    expect(answered.request?.answeredat).toBe(now + 10);
    expect(answered.requests[0]?.answer).toBe("the model answer");
    expect(answersampling({ requests: answered.requests, id: "sample1", answer: "again", now: now + 20 }).reason).toMatch(/already closed/i);
    expect(answersampling({ requests: answered.requests, id: "missing", now }).reason).toMatch(/names no stored request/i);
    const refused = requestsampling({ clientid: "client2", prompt: "Summarize.", now, id: "sample2" }).request as NonNullable<ReturnType<typeof requestsampling>["request"]>;
    const closed = answersampling({ requests: [refused], id: "sample2", refused: true, now: now + 1 });
    expect(closed.request?.state).toBe("refused");
    expect(closed.request?.answer).toBeUndefined();
  });
});

describe("agentstream prompt tools", () => {
  it("lists the prompt defs exposed as callable tools", () => {
    const prompts = listprompts();
    expect(prompts.map(prompt => prompt.name)).toEqual(["runreview", "pagesummary", "failuretriage"]);
    for (const prompt of prompts) {
      expect(prompt.template).toMatch(/\{\{/);
      expect(prompt.arguments.length).toBeGreaterThan(0);
    }
  });

  it("renders the templates and calls the prompts with defaults and required refusals", () => {
    const runreview = listprompts().find(prompt => prompt.name === "runreview");
    expect(runreview).toBeDefined();
    const rendered = renderprompt(runreview as NonNullable<typeof runreview>, { objective: "fill the form", steps: "click, type", tone: "plain" });
    expect(rendered).toContain("fill the form");
    expect(rendered).toContain("click, type");
    expect(rendered.includes("{{")).toBe(false);
    const called = callprompt({ name: "runreview", args: { objective: "fill the form", steps: "click, type" } });
    expect(called.toolcall?.name).toBe("prompts.runreview");
    expect(called.toolcall?.params.arguments).toMatchObject({ objective: "fill the form", steps: "click, type", tone: "plain" });
    expect(called.rendered).toContain("fill the form");
    expect(callprompt({ name: "runreview", args: { steps: "click, type" } }).reason).toMatch(/objective is required/i);
    expect(callprompt({ name: "bogus" }).reason).toMatch(/no prompt named bogus/i);
    const missing = renderprompt(runreview as NonNullable<typeof runreview>, { objective: "x" });
    expect(missing).toContain("{{steps}}");
  });
});

describe("agentstream streaming, progress and cancellation", () => {
  it("emits ordered stream chunks with the done marker and reassembles them", () => {
    const chunk = streamchunkof({ callid: "call1", seq: 1, content: "hello ", now });
    expect(chunk).toMatchObject({ callid: "call1", seq: 1, content: "hello ", done: false });
    const chunks = chunkcontent({ callid: "call1", content: "abcdefghij", size: 4, now });
    expect(chunks.map(piece => piece.content)).toEqual(["abcd", "efgh", "ij"]);
    expect(chunks.map(piece => piece.done)).toEqual([false, false, true]);
    expect(assemblechunks(chunks)).toBe("abcdefghij");
    expect(assemblechunks([chunks[2] as never, chunks[0] as never, chunks[1] as never])).toBe("abcdefghij");
    expect(chunkcontent({ callid: "call2", content: "", now })).toEqual([expect.objectContaining({ content: "", done: true })]);
  });

  it("emits progress notices with percent, message and cancel hint", () => {
    const notice = notifyprogress({ callid: "call1", percent: 45, message: "Typing the reviewed field.", now });
    expect(notice).toMatchObject({ callid: "call1", percent: 45, message: "Typing the reviewed field.", cancellable: true });
    const nocancel = notifyprogress({ callid: "call1", message: "Finishing.", cancellable: false, now });
    expect(nocancel.cancellable).toBe(false);
    expect(nocancel.percent).toBeUndefined();
  });

  it("aborts in flight calls on their cancel frame and preserves the partial result", () => {
    const frame = cancelframeof({ callid: "call1", reason: "the user asked", now });
    expect(frame).toMatchObject({ callid: "call1", reason: "the user asked", at: now });
    expect(cancelframeof({ callid: "call1", now }).reason).toBeUndefined();
    const partial: toolresult = { content: "the first chunks", iserror: false };
    const inflight: callcontext = { callid: "call1", clientid: "client1", tool: "browser.readtext", state: "inflight", startedat: now, chunks: 2 };
    const aborted = canceltool({ contexts: [inflight], callid: "call1", reason: "the user asked", partial, now: now + 100 });
    expect(aborted.context?.state).toBe("cancelled");
    expect(aborted.context?.partial).toEqual(partial);
    expect(aborted.context?.endedat).toBe(now + 100);
    expect(canceltool({ contexts: aborted.contexts, callid: "call1", now: now + 200 }).reason).toMatch(/already left the in flight state/i);
    expect(canceltool({ contexts: aborted.contexts, callid: "missing", now }).reason).toMatch(/names no call context/i);
    const finished: callcontext = { callid: "call2", clientid: "client1", tool: "memory.list", state: "done", startedat: now, endedat: now + 1, chunks: 1 };
    expect(canceltool({ contexts: [finished], callid: "call2", now }).reason).toMatch(/already left the in flight state/i);
  });
});
