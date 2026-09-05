import { describe, expect, it } from "vitest";
import { bindlocalhost, connectclient, defaultmcpconfig, defaultmcpport, disconnectclient, dispatchtool, enqueuerequest, framedlog, handleframe, initialize, launchbridge, listtools, localhostbind, negotiate, negotiatetoolfloor, nextrequest, pairclient, parseframe, parsewire, ping, relayframe, restartbridge, respond, rpcerrorcodeof, rpcerrornumbers, rpcerrorof, serializeframe, servercapabilities, servermethods, toolcallevent, validateframe, wireformat } from "../mcp.js";
import { buildtoolcatalog } from "../tools.js";
import { toolcallframe, toolresultframe } from "../protocol.js";
import type { agentplan, agentsession, clientrecord, jsonrpcframe, tooldef } from "../types.js";

const now = 1_800_000_000_000;
const session: agentsession = { id: "sess", tabid: 7, origin: "https://example.com", startedat: now - 5000, expiresat: now + 600_000, grants: ["https://example.com"] };
const clickstep = { id: "s1", kind: "click" as const, target: "#go", summary: "Click the reviewed button", risk: "sensitive" as const };
const plan: agentplan = { id: "plan1", objective: "Run the reviewed tool calls", origin: "https://example.com", steps: [clickstep, { id: "s2", kind: "observe", summary: "Snapshot the tab", risk: "read" }], createdat: now - 4000, expiresat: now + 600_000, state: "approved" };
const catalog = buildtoolcatalog();
const config = { ...defaultmcpconfig(), enabled: true };
const pairedclient: clientrecord = { id: "client1", transport: "stdio", paired: true, connectedat: now - 1000, pairedat: now - 500 };

/** Builds one json rpc request frame. */
function requestframe(id: number | string, method: string, params?: Record<string, unknown>): jsonrpcframe {
  return { jsonrpc: "2.0", id, method, ...(params !== undefined ? { params } : {}) };
}

describe("mcp frame grammar", () => {
  it("round trips frames through serialize and parse with both wire formats", () => {
    const frame = requestframe(1, "tools/call", { name: "browser.click", stepid: "s1" });
    expect(parseframe(serializeframe(frame))).toEqual(frame);
    expect(parseframe(wireformat(frame, "newline").trim())).toEqual(frame);
    expect(parseframe(wireformat(frame, "httppost"))).toEqual(frame);
    expect(parseframe(JSON.stringify({ transport: "http", frame }))).toEqual(frame);
    const second = requestframe(2, "ping");
    const block = `${wireformat(frame, "newline")}${wireformat(second, "newline")}`;
    expect(parsewire(block)).toEqual([frame, second]);
    expect(parsewire("\n\n")).toEqual([]);
  });

  it("rejects malformed wire input and frames with the rpc error codes", () => {
    expect(() => parseframe("not json")).toThrow();
    expect(() => parseframe("[1,2]")).toThrow();
    const response = respond({ error: rpcerrorof("parse", "The wire frame does not parse as json.") });
    expect(response.id).toBeNull();
    expect(response.error?.code).toBe("parse");
    expect(rpcerrornumbers).toEqual({ parse: -32700, method: -32601, params: -32602, internal: -32603, consentrefused: -32001 });
    for (const [code, number] of Object.entries(rpcerrornumbers) as Array<[keyof typeof rpcerrornumbers, number]>) expect(rpcerrorcodeof(number)).toBe(code);
    expect(rpcerrorcodeof(-32600)).toBeUndefined();
  });

  it("validates frame shape against the routing table and the user configured frame size", () => {
    const methods = servermethods();
    expect(methods.map(entry => entry.method)).toEqual(["initialize", "ping", "tools/list", "negotiate", "tools/call", "prompts/list", "prompts/call", "calls/cancel"]);
    expect(validateframe(requestframe(1, "ping"), methods)).toBeUndefined();
    expect(validateframe({ ...requestframe(1, "ping"), jsonrpc: "1.0" as never }, methods)?.code).toBe("parse");
    expect(validateframe({ jsonrpc: "2.0", id: { nested: true } as unknown as string, method: "ping" }, methods)?.code).toBe("parse");
    expect(validateframe({ jsonrpc: "2.0", id: 1 }, methods)?.code).toBe("method");
    expect(validateframe(requestframe(1, "nope/method"), methods)?.code).toBe("method");
    expect(validateframe(requestframe(1, "ping", ["array"] as never), methods)?.code).toBe("params");
    expect(validateframe(requestframe(1, "ping"), methods, { ...config, framesize: 10 })?.code).toBe("params");
    expect(validateframe(requestframe(1, "ping"), methods, { ...config, framesize: 10_000 })).toBeUndefined();
  });

  it("emits framed logs that never carry payloads", () => {
    expect(JSON.parse(framedlog("clientconnected", now, { clientid: "client1", transport: "stdio" }))).toEqual({ at: now, event: "clientconnected", clientid: "client1", transport: "stdio" });
    expect(framedlog("toolcall", now)).not.toContain("params");
    expect(framedlog("toolcall", now)).not.toContain("result");
  });
});

describe("mcp handshake and negotiation", () => {
  it("completes the initialize handshake and answers ping with pong", () => {
    const handshake = initialize({ params: { protocolversion: "bogus" }, config, catalog });
    expect(handshake.serverinfo.name).toBe("devthink");
    expect(handshake.serverinfo.toolversion).toBe(catalog.version);
    expect(handshake.serverinfo.tools).toBe(listtools(catalog).tools.length);
    expect(handshake.serverinfo.namespaces).toEqual(["browser", "workflow", "memory", "system"]);
    expect(handshake.protocolversion).toBe(handshake.serverinfo.protocolversion);
    expect(handshake.instructions).toMatch(/review/i);
    expect(ping({ now })).toEqual({ pong: true, at: now });
  });

  it("lists every tool with its version, risk grade, consent metadata and json schema inputs", () => {
    const listing = listtools(catalog);
    expect(listing.tools).toHaveLength(alltoolcount());
    for (const tool of listing.tools) {
      expect(tool.version).toBe(catalog.version);
      expect(tool.inputschema.type).toBe("object");
      expect(["read", "sensitive"]).toContain(tool.risk);
    }
    const run = listing.tools.find(tool => tool.name === "workflow.run");
    expect(run?.consentmeta?.review).toMatch(/run review/i);
    expect(run?.consentmeta?.riskclass).toBe("sensitive");
    expect(run?.consentmeta?.approvalrequired).toBe(true);
    expect(run?.consentmeta?.originscope).toBe("session");
    expect(listing.tools.find(tool => tool.name === "browser.snapshot")?.consentmeta).toBeUndefined();
  });

  it("negotiates the per client tool floor and enforces the token scopes before the consent gates", async () => {
    expect(negotiatetoolfloor(undefined, 1)).toEqual({ floor: 1 });
    expect(negotiatetoolfloor(1, 1)).toEqual({ floor: 1 });
    const highfloor = negotiatetoolfloor(2, 1);
    expect("mismatch" in highfloor ? highfloor.mismatch : "").toMatch(/tool version floor 2/i);
    const scoped = await dispatchtool({ params: { name: "memory.list" }, client: pairedclient, catalog, session, plan, origin: session.origin, now, scopes: ["browser"], execute: async step => ({ content: `ran ${step.kind}`, iserror: false }) });
    expect(scoped.error?.code).toBe("consentrefused");
    expect(scoped.error?.message).toMatch(/grants no memory tools/i);
    const allowed = await dispatchtool({ params: { name: "memory.list" }, client: pairedclient, catalog, session, plan, origin: session.origin, now, scopes: ["memory"], execute: async step => ({ content: `ran ${step.kind}`, iserror: false }) });
    expect(allowed.error).toBeUndefined();
    const floorclient = { ...pairedclient, toolfloor: 1 };
    expect((await dispatchtool({ params: { name: "browser.readtext", target: "#title" }, client: floorclient, catalog, session, plan, origin: session.origin, now, execute: async () => ({ content: "ok", iserror: false }) })).error).toBeUndefined();
  });

  it("negotiates capability sets on the happy path and reports the mismatches", () => {
    const server = servercapabilities({ config, catalog });
    const agreed = negotiate({ client: { protocolmajor: 2, toolversion: server.toolversion, transports: ["stdio"] }, server });
    expect(agreed.agreed).toBe(true);
    expect(agreed.capabilities?.tools).toBe(server.tools);
    expect(negotiate({ server }).agreed).toBe(true);
    /* the 2.0.0 sunset closed the window: the numeric major one declaration refuses below the supported floor with the conversion path inside the mismatch, and the deprecated version one string parses nowhere so it answers the default */
    expect(negotiate({ client: { protocolmajor: 1 }, server }).mismatch).toMatch(/below the supported floor/);
    expect(negotiate({ client: { protocolmajor: 1 }, server }).mismatch).toMatch(/migrateplan/);
    expect(negotiate({ client: { protocolversion: "1.1.54" }, server }).agreed).toBe(true);
    expect(negotiate({ client: { toolversion: server.toolversion + 1 }, server }).mismatch).toMatch(/tool version/i);
    expect(negotiate({ client: { transports: ["stdio", "carrierpigeon" as never] }, server }).mismatch).toMatch(/transport/i);
  });

  it("keeps one clientrecord per transport with the pairing decision and the negotiated set", () => {
    const first = connectclient({ transport: "stdio", now, id: "client1" });
    const second = connectclient({ transport: "http", now: now + 1, id: "client2" });
    expect(first.paired).toBe(false);
    expect(second.transport).toBe("http");
    const paired = pairclient([first, second], "client1", true, now + 2);
    expect(paired[0]?.paired).toBe(true);
    expect(paired[0]?.pairedat).toBe(now + 2);
    const refused = pairclient(paired, "client2", false, now + 3);
    expect(refused[1]?.paired).toBe(false);
    expect(refused[1]?.disconnectedat).toBe(now + 3);
    const disconnected = disconnectclient(paired, "client1", now + 4);
    expect(disconnected[0]?.disconnectedat).toBe(now + 4);
    expect(pairclient(disconnected, "client1", true, now + 5)[0]?.paired).toBe(true);
  });
});

describe("mcp request queue and localhost binding", () => {
  it("serializes request frames per client in arrival order under the user configured depth", () => {
    const one = requestframe(1, "ping");
    const two = requestframe(2, "ping");
    const three = requestframe(3, "ping");
    let queue = enqueuerequest({ queue: [], frame: one });
    queue = enqueuerequest({ queue: queue ?? [], frame: two });
    expect(queue).toEqual([one, two]);
    expect(enqueuerequest({ queue: queue ?? [], frame: three })).toEqual([one, two, three]);
    expect(enqueuerequest({ queue: queue ?? [], frame: three, depth: 3 })).toEqual([one, two, three]);
    expect(enqueuerequest({ queue: [], frame: one, depth: 1 })).toEqual([one]);
    const next = nextrequest(queue ?? []);
    expect(next?.frame).toBe(one);
    expect(next?.remaining).toEqual([two]);
    expect(nextrequest([])).toBeUndefined();
  });

  it("binds the http listener to localhost by default and reports the bind state", () => {
    expect(localhostbind).toBe("127.0.0.1");
    expect(defaultmcpport).toBe(7436);
    expect(bindlocalhost(config)).toEqual({ bind: "127.0.0.1", port: defaultmcpport, localhost: true });
    expect(bindlocalhost({ ...config, bind: "" })).toEqual({ bind: "127.0.0.1", port: defaultmcpport, localhost: true });
    expect(bindlocalhost({ ...config, bind: "localhost" }).localhost).toBe(true);
    expect(bindlocalhost({ ...config, bind: "::1" }).localhost).toBe(true);
    expect(bindlocalhost({ ...config, bind: "0.0.0.0" })).toEqual({ bind: "0.0.0.0", port: defaultmcpport, localhost: false });
    expect(defaultmcpconfig().enabled).toBe(false);
    expect(defaultmcpconfig().transports).toEqual(["stdio", "http"]);
  });
});

describe("mcp tool dispatch behind the consent gates", () => {
  /** Runs one tool call through the dispatch gate with a recording executor. */
  async function calltool(params: Record<string, unknown>, client: clientrecord = pairedclient, over: Partial<{ session: agentsession | undefined; plan: agentplan | undefined; origin: string; tool: tooldef | undefined }> = {}): Promise<{ result?: { content: string; iserror: boolean }; error?: { code: string; message: string }; stepid?: string }> {
    const executed: string[] = [];
    const sessionarg = "session" in over ? over.session : session;
    const planarg = "plan" in over ? over.plan : plan;
    const outcome = await dispatchtool({ params, client, catalog, ...(sessionarg !== undefined ? { session: sessionarg } : {}), ...(planarg !== undefined ? { plan: planarg } : {}), origin: over.origin ?? session.origin, now, execute: async step => { executed.push(`${step.kind}:${step.id}`); return { content: `ran ${step.kind}`, iserror: false }; } });
    return { ...outcome, ...(outcome.result !== undefined ? { result: outcome.result as { content: string; iserror: boolean } } : {}), ...(outcome.error !== undefined ? { error: outcome.error } : {}), ...(executed.length > 0 ? { stepid: executed[0] } : {}) };
  }

  it("runs read only tools under the dryrun risk class once the session is approved", async () => {
    const outcome = await calltool({ name: "browser.readtext", target: "#title" });
    expect(outcome.error).toBeUndefined();
    expect(outcome.result?.iserror).toBe(false);
    expect(outcome.stepid).toContain("readtext");
    const runs = await calltool({ name: "memory.list" });
    expect(runs.error).toBeUndefined();
    expect(runs.stepid).toContain("listruns");
  });

  it("runs a sensitive tool only as the approved plan step it names", async () => {
    const outcome = await calltool({ name: "browser.click", stepid: "s1" });
    expect(outcome.error).toBeUndefined();
    expect(outcome.stepid).toBe("click:s1");
    expect(await calltool({ name: "browser.click", stepid: "s2" })).toMatchObject({ error: { code: "consentrefused" } });
    expect(await calltool({ name: "browser.click" })).toMatchObject({ error: { code: "consentrefused" } });
    expect(await calltool({ name: "browser.click", stepid: "missing" })).toMatchObject({ error: { code: "consentrefused" } });
  });

  it("refuses unpaired clients, dead sessions, unapproved plans and origins outside the grants", async () => {
    const unpaired = { ...pairedclient, paired: false };
    expect(await calltool({ name: "browser.readtext", target: "#title" }, unpaired)).toMatchObject({ error: { code: "consentrefused" } });
    const disconnected = { ...pairedclient, disconnectedat: now };
    expect(await calltool({ name: "browser.readtext", target: "#title" }, disconnected)).toMatchObject({ error: { code: "consentrefused" } });
    expect(await calltool({ name: "browser.readtext", target: "#title" }, pairedclient, { session: { ...session, stoppedat: now - 1 } })).toMatchObject({ error: { code: "consentrefused" } });
    expect(await calltool({ name: "browser.readtext", target: "#title" }, pairedclient, { session: { ...session, expiresat: now - 1 } })).toMatchObject({ error: { code: "consentrefused" } });
    expect(await calltool({ name: "browser.readtext", target: "#title" }, pairedclient, { plan: { ...plan, state: "pending" } })).toMatchObject({ error: { code: "consentrefused" } });
    expect(await calltool({ name: "browser.readtext", target: "#title" }, pairedclient, { session: undefined })).toMatchObject({ error: { code: "consentrefused" } });
    expect(await calltool({ name: "browser.readtext", target: "#title" }, pairedclient, { origin: "https://other.example" })).toMatchObject({ error: { code: "consentrefused" } });
  });

  it("refuses unknown tools, ambiguous bare names and versions below the negotiated floor", async () => {
    expect(await calltool({})).toMatchObject({ error: { code: "params" } });
    expect(await calltool({ name: "" })).toMatchObject({ error: { code: "params" } });
    expect(await calltool({ name: "browser.nope" })).toMatchObject({ error: { code: "params" } });
    expect(await calltool({ name: "list" })).toMatchObject({ error: { code: "params" } });
    const oldfloor = { ...pairedclient, capabilities: { protocolversion: "1.1.54", name: "client", version: "1", toolversion: catalog.version + 1, tools: 0, namespaces: ["browser" as const], transports: ["stdio" as const] } };
    expect(await calltool({ name: "browser.readtext", target: "#title" }, oldfloor)).toMatchObject({ error: { code: "params" } });
  });

  it("carries executor failures as internal errors and tool failures as error results", async () => {
    const failing = await dispatchtool({ params: { name: "browser.readtext", target: "#title" }, client: pairedclient, catalog, session, plan, origin: session.origin, now, execute: () => { throw new Error("bridge missing"); } });
    expect(failing.error?.code).toBe("internal");
    const toolerror = await dispatchtool({ params: { name: "browser.readtext", target: "#title" }, client: pairedclient, catalog, session, plan, origin: session.origin, now, execute: async () => ({ content: "the read failed", iserror: true }) });
    expect(toolerror.result?.iserror).toBe(true);
    expect(toolerror.error).toBeUndefined();
  });
});

describe("mcp frame routing", () => {
  /** Routes one frame through handleframe with a recording executor. */
  async function route(frame: jsonrpcframe, client: clientrecord = pairedclient, raw?: string, configoverride: Partial<typeof config> = {}): Promise<jsonrpcframe> {
    return await handleframe({ ...(raw !== undefined ? { raw } : { frame }), client, catalog, config: { ...config, ...configoverride }, session, plan, origin: session.origin, tabid: session.tabid, now, execute: async step => ({ content: `ran ${step.kind}`, iserror: false }) });
  }

  it("routes initialize, ping, tools/list and negotiate through the method table", async () => {
    const handshake = await route(requestframe(1, "initialize", { protocolversion: "1.1.54" }));
    expect(handshake.id).toBe(1);
    expect((handshake.result as { serverinfo?: { name?: string } }).serverinfo?.name).toBe("devthink");
    const pong = await route(requestframe("alpha", "ping"));
    expect(pong.id).toBe("alpha");
    expect((pong.result as { pong?: boolean }).pong).toBe(true);
    const listing = await route(requestframe(3, "tools/list"));
    expect((listing.result as { tools?: unknown[] }).tools).toHaveLength(alltoolcount());
    const caps = servercapabilities({ config, catalog });
    const agreed = await route(requestframe(4, "negotiate", { capabilities: { protocolmajor: 2, toolversion: caps.toolversion, transports: ["stdio"] } }));
    expect((agreed.result as { tools?: number }).tools).toBe(caps.tools);
    /* the 2.0.0 sunset: the numeric major one declaration refuses below the supported floor, so the negotiate route answers the params error with the conversion path inside the message */
    const mismatch = await route(requestframe(5, "negotiate", { capabilities: { protocolmajor: 1 } }));
    expect(mismatch.error?.code).toBe("params");
    expect(mismatch.error?.message).toContain("migrateplan");
  });

  it("answers parse, method and consent failures with the matching error codes", async () => {
    expect((await route({ jsonrpc: "2.0", id: 1 }, pairedclient, "not json")).error?.code).toBe("parse");
    expect((await route(requestframe(1, "nope/method"))).error?.code).toBe("method");
    expect((await route(requestframe(1, "tools/call", { name: "browser.click" }), { ...pairedclient, paired: false })).error?.code).toBe("consentrefused");
    const oversized = await route({ jsonrpc: "2.0", id: 1 }, pairedclient, serializeframe(requestframe(1, "ping")) + " ".repeat(200), { framesize: 100 });
    expect(oversized.error?.code).toBe("params");
    expect(oversized.id).toBeNull();
    expect((await route({ jsonrpc: "2.0", id: 1 }, pairedclient, serializeframe(requestframe(1, "ping")) + " ".repeat(200))).error).toBeUndefined();
  });

  it("dispatches tool calls through the routing table and keeps the request id on the response", async () => {
    const response = await route(requestframe(42, "tools/call", { name: "browser.click", stepid: "s1" }));
    expect(response.id).toBe(42);
    expect((response.result as { iserror?: boolean }).iserror).toBe(false);
    const read = await route(requestframe(43, "tools/call", { name: "browser.snapshot" }));
    expect((read.result as { content?: string }).content).toBe("ran observe");
  });

  it("routes the prompt tools and the in flight cancellation through the routing table", async () => {
    const prompts = await route(requestframe(6, "prompts/list"));
    const listed = prompts.result as { prompts?: Array<{ name: string; arguments: unknown[] }> };
    expect(listed.prompts?.map(prompt => prompt.name)).toEqual(["runreview", "pagesummary", "failuretriage"]);
    expect(listed.prompts?.[0]?.arguments.length).toBeGreaterThan(0);
    const called = await route(requestframe(7, "prompts/call", { name: "runreview", arguments: { objective: "fill the form", steps: "click, type" } }));
    const rendered = called.result as { toolcall?: { name: string }; rendered?: string };
    expect(rendered.toolcall?.name).toBe("prompts.runreview");
    expect(rendered.rendered).toContain("fill the form");
    const missing = await route(requestframe(8, "prompts/call", { name: "bogus" }));
    expect(missing.error?.code).toBe("params");
    const required = await route(requestframe(9, "prompts/call", { name: "runreview", arguments: { steps: "click, type" } }));
    expect(required.error?.code).toBe("params");
    const inflight = await route(requestframe(10, "calls/cancel", { callid: "call-1", reason: "the user asked" }));
    expect(inflight.error?.code).toBe("params");
    const context = { callid: "call-1", clientid: pairedclient.id, tool: "browser.readtext", state: "inflight" as const, startedat: now, chunks: 1, partial: { content: "the first chunks", iserror: false } };
    const aborted = await handleframe({ frame: requestframe(11, "calls/cancel", { callid: "call-1", reason: "the user asked" }), client: pairedclient, catalog, config, session, plan, origin: session.origin, tabid: session.tabid, now, contexts: [context], execute: async () => ({ content: "never runs", iserror: false }) });
    expect((aborted.result as { cancelled?: boolean }).cancelled).toBe(true);
    expect((aborted.result as { partial?: { content: string } }).partial?.content).toBe("the first chunks");
    const finished = { ...context, state: "done" as const, endedat: now };
    expect((await handleframe({ frame: requestframe(12, "calls/cancel", { callid: "call-1" }), client: pairedclient, catalog, config, session, plan, origin: session.origin, tabid: session.tabid, now, contexts: [finished], execute: async () => ({ content: "ok", iserror: false }) })).error?.code).toBe("params");
  });

  it("stamps the extended tool call records with the 1.1.56 markers", () => {
    const event = toolcallevent({ id: "t2", clientid: "client1", tool: "browser.click", origin: "https://example.com", ok: true, now, callid: "call-1", idempotencykey: "key-1", dryrun: true, mocked: false, batchid: "batch-1", replayed: true });
    expect(event).toMatchObject({ callid: "call-1", idempotencykey: "key-1", dryrun: true, batchid: "batch-1", replayed: true });
    expect(event.mocked).toBeUndefined();
    expect(toolcallevent({ id: "t3", clientid: "client1", tool: "browser.click", origin: "https://example.com", ok: false, now, code: "consentrefused" }).callid).toBeUndefined();
  });

  it("builds toolcall and toolresult frames through the protocol envelopes", () => {
    const call = toolcallframe({ id: 7, name: "browser.click", params: { stepid: "s1" } });
    expect(call.method).toBe("tools/call");
    expect(call.params?.name).toBe("browser.click");
    expect(call.params?.stepid).toBe("s1");
    const result = toolresultframe({ id: 7, result: { content: "ran click", iserror: false } });
    expect(result.result).toEqual({ content: "ran click", iserror: false });
    const refusal = toolresultframe({ id: 7, error: rpcerrorof("consentrefused", "The consent gates refused the tool call.") });
    expect(refusal.error?.code).toBe("consentrefused");
    expect(toolcallevent({ id: "t1", clientid: "client1", tool: "browser.click", origin: "https://example.com", ok: false, now, code: "consentrefused" }).code).toBe("consentrefused");
  });
});

describe("mcp stdio bridge", () => {
  it("launches through the native messaging host manifest and relays frames in both directions", () => {
    const bridge = launchbridge({ host: "com.wenathlan.devthink", pid: 4242, now, id: "bridge1" });
    expect(bridge).toMatchObject({ host: "com.wenathlan.devthink", pid: 4242, connected: true, restarts: 0, received: 0, sent: 0 });
    expect(launchbridge({ host: "com.wenathlan.devthink", now: now + 1 }).pid).toBeUndefined();
    const request = requestframe(1, "initialize");
    const response = respond({ id: 1, result: { pong: true } });
    const relaying = relayframe({ bridge, direction: "inbound", frame: request, now: now + 2 });
    expect(relaying.received).toBe(1);
    expect(relaying.sent).toBe(0);
    expect(relaying.lastframeat).toBe(now + 2);
    const answered = relayframe({ bridge: relaying, direction: "outbound", frame: response, now: now + 3 });
    expect(answered.received).toBe(1);
    expect(answered.sent).toBe(1);
  });

  it("verifies the client signature when the platform allows it and refuses a failed signature", () => {
    /* the 1.1.95 hardening: the platform verifier confirms the presented signature before the bridge connects, a failed signature refuses the bridge outright and a platform without a verifier keeps the bridge unverified while the record says so */
    const verified = launchbridge({ host: "com.wenathlan.devthink", now, signature: "signature-one", verifier: () => true });
    expect(verified.clientverified).toBe(true);
    expect(() => launchbridge({ host: "com.wenathlan.devthink", now, signature: "forged-signature", verifier: () => false })).toThrow("failed the platform verification");
    const unverified = launchbridge({ host: "com.wenathlan.devthink", now, signature: "signature-one" });
    expect(unverified.clientverified).toBeUndefined();
    const verifierless = launchbridge({ host: "com.wenathlan.devthink", now, verifier: () => true });
    expect(verifierless.clientverified).toBeUndefined();
  });

  it("restarts a dead client process on demand and keeps the counters", () => {
    const bridge = launchbridge({ host: "com.wenathlan.devthink", pid: 4242, now });
    const dead = { ...relayframe({ bridge, direction: "inbound", frame: requestframe(1, "ping"), now: now + 1 }), connected: false };
    expect(dead.connected).toBe(false);
    const restarted = restartbridge({ bridge: dead, pid: 5252, now: now + 2 });
    expect(restarted.connected).toBe(true);
    expect(restarted.pid).toBe(5252);
    expect(restarted.restarts).toBe(1);
    expect(restarted.received).toBe(1);
    expect(restarted.startedat).toBe(now + 2);
    expect(restartbridge({ bridge: restarted, pid: 6363, now: now + 3 }).restarts).toBe(2);
  });
});

/** Counts the tools of the built catalog. */
function alltoolcount(): number {
  return listtools(catalog).tools.length;
}
