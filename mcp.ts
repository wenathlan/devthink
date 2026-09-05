import { protocolmajorversion, protocolversion } from "./types.js";
import { negotiateprotocol, protocolmajorof } from "./apifreeze.js";
import type { agentplan, agentsession, callcontext, capabilityset, clientrecord, jsonrpcframe, mcpserverconfig, methodentry, rpcerror, rpcerrorcode, stdiobridge, toolcatalog, toolcallrecord, toolnamespace, toolresult, toolstep, transportkind, allowlistentry, approvalrequest, auditevent, batchcall, batchoutcome, callratelimit, clientbinding, idempotencyrecord, progressnotice, prompttemplate, resourcewatch, samplingrequest, servehealth, servedresource, servetransport, streamchunk, structurederror, toolmock } from "./types.js";
/* ── The mcp entry section the family kept before the 1.1.88 merge. ── */
/** The mcp server library entry of the 1.1.84 family: the full model context protocol server surface of devthink as one tree shakable entry — the serve mode with its frame router, session bindings, approval gates and dispatch composition, the json rpc message codec with its structured retry hints, the stdio and http transports with their injected seams, the served resources with their change subscriptions, the prompt exposure of the template library and the walkthroughs, and the tool catalog, call runtime, client auth, http stream and server contract families the serve mode composes; the 1.1.85 native host bridge family joins the entry so the nativehost and wsbridge surfaces — the native call events the subscribed mcp clients stream and the servercontract envelope translation the wsbridge frames reuse — ride the same tree shakable server surface. */
export * from "./serve.js";
export * from "./serve.js";
export * from "./serve.js";
export * from "./http.js";
export * from "./http.js";
export * from "./tools.js";
export * from "./agent.js";
export * from "./tools.js";
export * from "./auth.js";
export * from "./gates.js";
export * from "./http.js";
export * from "./bridge.js";
export * from "./bridge.js";
export * from "./bridge.js";
export * from "./policy.js";


/* ── Merged from mcpmode.ts: the 1.1.88 consolidation interns the correlated mcpmode logic here, so no variation of the same file lives beside another. ── */
import { notifyprogress, requestsampling, streamchunkof, canceltool, callprompt, listprompts } from "./agent.js";
import { requireapproval } from "./gates.js";
import { checkallowlist } from "./auth.js";
import { notificationframe } from "./serve.js";
import { randomid } from "./memory.js";
import { degradationgate, mcpmodegate, promptexposuregate, resourceexposuregate, tooldispatchgate, unknownfieldsgate } from "./policy.js";
import { listmcpprompts, rendermcpprompt } from "./serve.js";
import { publishchange, readresource, resourceof, resourceslist, servedresources, subscriberesource } from "./serve.js";
import { composeenvelope, eventpostbody, frameof, progresseventpayload, servercontractversion, stableopid } from "./bridge.js";
import { packageversion } from "./version.js";
import { alltools, buildtoolcatalog, namespaceof, resolvetool, toolnamespaces } from "./tools.js";
import { applymock, applyratelimit, begincall, checkidempotency, dryruntool, endcall, recordidempotency, runbatch } from "./tools.js";

/**
 * Mcp server mode of the 1.1.84 family.
 * Every serve mode concern lives in this file: the serve entry that runs devthink as a model context protocol server over the stdio and http transports, the initialization with the capability negotiation and the server metadata that reports the mcp version alongside the server contract version, the client metadata of the initialize handshake that records the client name and version for the audit trail, the session bindings that pair one client with exactly one extension session so concurrent clients hold isolated sessions, the read only degradation when no origin grant covers the session, the exposed tool filtering by scopes and degradation so the serve never lists a tool the current grants do not cover, the health resource with its version and uptime, the shutdown drain that waits for the in flight calls before the exit, the plan progress events that reuse the server contract envelopes, the sampling frames that route generation requests back into the client model, the stream chunk and progress notifications of long calls, the mock, dry run, idempotency and batch dispatch composition, the allowlist and rate limit admission, the approval gated sensitive calls that block until the human answers, the audit entries that name the caller, the tool and the outcome, and the serve frame router with its extended method table.
 * The mode stays pure and shares the engine: the policy gates, the kind catalog, the memory store and the progress store ride through the same modules the extension surfaces use, execution flows through the injected execute seam so tests run on plain fixtures, and no port, window, ceiling, endpoint, provider or key is ever hardcoded.
 */

/** The serve method table of the mcp server mode: the protocol family methods beside the resource, prompt, batch and health surfaces the serve mode adds. */
export function servemethods(): methodentry[] {
  return [
    { method: "initialize", handler: "initialize", description: "Completes the mcp handshake, records the client metadata and returns the server info with the server contract version." },
    { method: "ping", handler: "ping", description: "Answers keepalive frames with pong." },
    { method: "tools/list", handler: "listtools", description: "Returns every exposed tool the current grants cover with its version, json schema inputs and consent metadata." },
    { method: "negotiate", handler: "negotiate", description: "Exchanges capability sets with the client." },
    { method: "tools/call", handler: "dispatch", description: "Invokes one tool behind the consent gates with the mock, dry run, idempotency and approval composition." },
    { method: "prompts/list", handler: "listprompts", description: "Lists the walkthrough prompts, the user authored template library and the protocol prompt tools." },
    { method: "prompts/call", handler: "callprompt", description: "Renders one served prompt with its declared arguments." },
    { method: "resources/list", handler: "listresources", description: "Lists every served resource with its uri, description and mimetype." },
    { method: "resources/read", handler: "readresource", description: "Reads one served resource into its wire text." },
    { method: "resources/subscribe", handler: "subscriberesource", description: "Opens one resource subscription with its change notifications." },
    { method: "resources/unsubscribe", handler: "unsubscriberesource", description: "Closes one resource subscription." },
    { method: "calls/cancel", handler: "cancel", description: "Aborts one in flight tool call and preserves its partial result." },
    { method: "calls/batch", handler: "batch", description: "Runs an ordered batch of tool calls in one request with the stop on first error flag." },
    { method: "health", handler: "health", description: "Returns the health resource with the version and the uptime." }
  ];
}

/** The server metadata of the serve mode: the mcp identity, the protocol version, the server contract version reported alongside it, the tool, resource and prompt counts and the instructions that state the consent model in plain language. */
export function servemetadata(input: { config: mcpserverconfig; catalog: toolcatalog; templates: prompttemplate[] }): { serverinfo: capabilityset & { servercontractversion: number; resourcecount: number; promptcount: number }; protocolversion: string; servercontractversion: number; instructions: string } {
  const capabilities = servercapabilities({ config: input.config, catalog: input.catalog });
  return {
    serverinfo: { ...capabilities, servercontractversion, resourcecount: servedresources().length, promptcount: listmcpprompts(input.templates).length },
    protocolversion,
    servercontractversion,
    instructions: `Devthink serves its browser tools, resources and prompts behind the human review gates: read only tools run once a session is approved, every tool with side effects executes exactly the approved plan step it names and blocks until the human approval gate answers, the served resources carry no page content the user granted none of, and every call lands in the audit trail with its caller, tool and outcome. The server contract version ${servercontractversion} rides beside the mcp version ${protocolversion} on every event envelope. No endpoint, provider or key is hardcoded; the user pairs every client.`
  };
}

/** Reads the client metadata of one initialize handshake: the client declares its name and version so the audit trail records exactly which build called. */
export function clientmetadataof(params: Record<string, unknown> | undefined): { name?: string; version?: string } {
  const info = params?.clientinfo ?? params?.client;
  if (info === undefined || info === null || typeof info !== "object" || Array.isArray(info)) return {};
  const candidate = info as Record<string, unknown>;
  const name = typeof candidate.name === "string" && candidate.name.trim() !== "" ? candidate.name.trim() : undefined;
  const version = typeof candidate.version === "string" && candidate.version.trim() !== "" ? candidate.version.trim() : undefined;
  return { ...(name !== undefined ? { name } : {}), ...(version !== undefined ? { version } : {}) };
}

/** Stamps one client record with the declared client metadata: the name and version ride the record so every audit entry of its calls names the caller build. */
export function recordclientmetadata(client: clientrecord, metadata: { name?: string; version?: string }): clientrecord {
  return { ...client, ...(metadata.name !== undefined ? { name: metadata.name } : {}), ...(metadata.version !== undefined ? { clientversion: metadata.version } : {}) };
}

/** Completes the serve initialize handshake: the server metadata with the negotiated capability set and the client metadata recorded on the client record the caller persists. */
export function serveinitialize(input: { params?: Record<string, unknown>; config: mcpserverconfig; catalog: toolcatalog; templates: prompttemplate[] }): { handshake: ReturnType<typeof servemetadata>; client: (client: clientrecord) => clientrecord } {
  return { handshake: servemetadata({ config: input.config, catalog: input.catalog, templates: input.templates }), client: (client: clientrecord) => recordclientmetadata(client, clientmetadataof(input.params)) };
}

/** Builds the transport endpoints of the serve mode: the stdio transport rides the process pipes while the http transport rides its own localhost bind with its own port, and both run at the same time on separate channels when the config allows both. */
export function transportendpoints(input: { config: mcpserverconfig; now: number }): servetransport[] {
  const transports: servetransport[] = [];
  if (input.config.transports.includes("stdio")) transports.push({ kind: "stdio", endpoint: "stdio://devthink", startedat: input.now });
  if (input.config.transports.includes("http")) {
    const bind = input.config.bind !== undefined && input.config.bind.trim() !== "" ? input.config.bind.trim() : "127.0.0.1";
    const path = input.config.httpstream?.endpoint !== undefined && input.config.httpstream.endpoint.trim() !== "" ? input.config.httpstream.endpoint.trim() : "/mcp";
    transports.push({ kind: "http", endpoint: `http://${bind}:${input.config.port}${path}`, startedat: input.now });
  }
  return transports;
}

/** Starts the serve mode: the mcpmode gate must pass, the transports report their endpoints and the degradation gate decides the read only flag from the session grants; a refused gate reports its reason instead of a state. */
export function startserve(input: { config: mcpserverconfig; now: number; grants?: string[]; origin?: string }): { state?: { state: "running"; transports: servetransport[]; startedat: number; degraded: boolean }; reason?: string } {
  const gate = mcpmodegate(input.config);
  if (!gate.allowed) return { reason: gate.reason ?? "The serve mode failed its gate." };
  const degradation = degradationgate({ ...(input.grants !== undefined ? { grants: input.grants } : {}), ...(input.origin !== undefined ? { origin: input.origin } : {}) });
  return { state: { state: "running", transports: transportendpoints({ config: input.config, now: input.now }), startedat: input.now, degraded: !degradation.allowed } };
}

/** The shutdown drain of the serve mode: the drain waits for the in flight calls before the exit — a stopped answer needs an empty in flight set or a drain window the user configured that elapsed. */
export function shutdowndrain(input: { inflight: callcontext[]; drainstart?: number; now: number; window?: number }): { phase: "draining" | "stopped"; waiting: number } {
  const waiting = input.inflight.filter(context => context.state === "inflight").length;
  if (waiting === 0) return { phase: "stopped", waiting: 0 };
  if (input.window !== undefined && input.drainstart !== undefined && input.now - input.drainstart >= input.window) return { phase: "stopped", waiting };
  return { phase: "draining", waiting };
}

/** Builds the health resource of the serve mode: the extension version, the protocol version, the server contract version, the uptime and the serve state — no payload, origin or client identity rides the line. */
export function healthof(input: { startedat: number; now: number; state: string }): servehealth {
  return { version: packageversion, protocolversion, servercontractversion, uptime: Math.max(0, input.now - input.startedat), state: input.state, at: input.now };
}

/** Binds one client to exactly one extension session: concurrent clients hold isolated sessions, the token id rides the binding when the pairing issued one, and the degradation gate decides the read only flag from the grants. */
export function bindclientsession(input: { clientid: string; sessionid: string; tokenid?: string; grants?: string[]; origin?: string; now: number }): clientbinding {
  const degradation = degradationgate({ ...(input.grants !== undefined ? { grants: input.grants } : {}), ...(input.origin !== undefined ? { origin: input.origin } : {}) });
  return { clientid: input.clientid, sessionid: input.sessionid, ...(input.tokenid !== undefined ? { tokenid: input.tokenid } : {}), readonly: !degradation.allowed, boundat: input.now };
}

/** Releases one client binding; the record stays for the audit trail with its release time. */
export function releasebinding(bindings: clientbinding[], clientid: string, now: number): clientbinding[] {
  return bindings.map(binding => binding.clientid === clientid && binding.releasedat === undefined ? { ...binding, releasedat: now } : binding);
}

/** True when every live binding names a distinct extension session so concurrent clients hold isolated sessions. */
export function isolatedsessions(bindings: clientbinding[]): boolean {
  const live = bindings.filter(binding => binding.releasedat === undefined);
  return new Set(live.map(binding => binding.sessionid)).size === live.length;
}

/** Filters the catalog to the tools the current grants cover: a degraded binding exposes the read only tools alone while the scopes narrow the namespaces the session token grants. */
export function exposedtools(catalog: toolcatalog, options: { readonly?: boolean; scopes?: toolnamespace[] } = {}): toolcatalog {
  const exposed = alltools(catalog).filter(tool => (options.readonly !== true || tool.risk === "read") && (options.scopes === undefined || options.scopes.includes(namespaceof(tool.name) as toolnamespace)));
  return { version: catalog.version, domains: catalog.domains.map(domain => ({ ...domain, tools: domain.tools.filter(tool => exposed.some(entry => entry.name === tool.name)) })).filter(domain => domain.tools.length > 0) };
}

/** Builds one plan progress event of the serve mode: the progress payload rides the server contract envelope of the eventpost operation so subscribed clients read the same envelope shape the bridge family streams, and the wire form is the newline terminated frame text the stream channel emits. */
export function planprogressevent(input: { stepid: string; status: string; sessionid?: string; sequence: number; at: number }): { envelope: ReturnType<typeof composeenvelope>; wire: string } {
  const envelope = composeenvelope({ op: "eventpost", opid: stableopid(`mcpmode-progress-${input.stepid}`, input.sequence), at: input.at, version: servercontractversion, ...(input.sessionid !== undefined ? { sessionid: input.sessionid } : {}), body: eventpostbody({ event: { kind: "progress", stream: "mcpmode", payload: progresseventpayload({ stepid: input.stepid, status: input.status }) } }) });
  return { envelope, wire: `${frameof(envelope)}\n` };
}

/** Builds the sampling request frame the serve mode sends to the client model: the prompt, the optional system text, the granted page content and the granted maximum tokens ride the request the client answers. */
export function samplingframe(input: { clientid: string; capabilities?: capabilityset; prompt: string; system?: string; pagecontent?: string; pagegrant?: boolean; maxtokens?: number; now: number }): { request?: samplingrequest; frame?: jsonrpcframe; reason?: string } {
  const requested = requestsampling({ clientid: input.clientid, ...(input.capabilities !== undefined ? { capabilities: input.capabilities } : {}), prompt: input.prompt, ...(input.system !== undefined ? { system: input.system } : {}), ...(input.pagecontent !== undefined ? { pagecontent: input.pagecontent } : {}), ...(input.pagegrant !== undefined ? { pagegrant: input.pagegrant } : {}), ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}), now: input.now });
  if (requested.request === undefined) return { ...(requested.reason !== undefined ? { reason: requested.reason } : {}) };
  return { request: requested.request, frame: { jsonrpc: "2.0", id: requested.request.id, method: "sampling/create", params: { id: requested.request.id, prompt: requested.request.prompt, ...(requested.request.system !== undefined ? { system: requested.request.system } : {}), ...(requested.request.pagecontent !== undefined ? { pagecontent: requested.request.pagecontent } : {}), ...(requested.request.maxtokens !== undefined ? { maxtokens: requested.request.maxtokens } : {}) } } };
}

/** Builds the stream chunk notification frames of one progressive tool result so a client reads the partial results as they arrive. */
export function chunkframes(chunks: streamchunk[]): jsonrpcframe[] {
  return chunks.map(chunk => notificationframe("calls/streamchunk", { callid: chunk.callid, seq: chunk.seq, content: chunk.content, done: chunk.done, at: chunk.at }));
}

/** Builds the progress notification frame of one long tool call with its cancel hint. */
export function progressframe(notice: progressnotice): jsonrpcframe {
  return notificationframe("calls/progress", { callid: notice.callid, ...(notice.percent !== undefined ? { percent: notice.percent } : {}), message: notice.message, cancellable: notice.cancellable, at: notice.at });
}

/** Emits one stream chunk of a progressive result beside its notification frame. */
export function chunkof(input: { callid: string; seq: number; content: string; done?: boolean; now: number }): { chunk: streamchunk; frame: jsonrpcframe } {
  const chunk = streamchunkof(input);
  return { chunk, frame: chunkframes([chunk])[0] as jsonrpcframe };
}

/** Emits one progress notice of a long call beside its notification frame. */
export function progressof(input: { callid: string; percent?: number; message: string; cancellable?: boolean; now: number }): { notice: progressnotice; frame: jsonrpcframe } {
  const notice = notifyprogress(input);
  return { notice, frame: progressframe(notice) };
}

/** Builds the serve audit entry of one tool call: the caller client, the tool, the origin and the outcome without any payload. */
export function servecallevent(input: { client: clientrecord; tool: string; origin: string; ok: boolean; now: number; code?: rpcerrorcode; callid?: string; idempotencykey?: string; dryrun?: boolean; mocked?: boolean; batchid?: string; replayed?: boolean }): toolcallrecord {
  return { id: randomid(), clientid: input.client.id, tool: input.tool, origin: input.origin, ok: input.ok, ...(input.code !== undefined ? { code: input.code } : {}), at: input.now, ...(input.callid !== undefined ? { callid: input.callid } : {}), ...(input.idempotencykey !== undefined && input.idempotencykey.trim() !== "" ? { idempotencykey: input.idempotencykey } : {}), ...(input.dryrun === true ? { dryrun: true } : {}), ...(input.mocked === true ? { mocked: true } : {}), ...(input.batchid !== undefined ? { batchid: input.batchid } : {}), ...(input.replayed === true ? { replayed: true } : {}) };
}

/** Renders the audit line of one serve tool call: the caller name and version beside the tool, the origin and the outcome so the trail names the exact client build. */
export function auditline(record: toolcallrecord, client: clientrecord | undefined): string {
  const caller = client !== undefined ? `${client.name ?? client.id}${client.clientversion !== undefined ? ` (${client.clientversion})` : ""}` : record.clientid;
  return `The client ${caller} called ${record.tool} on ${record.origin} with the outcome ${record.ok ? "ok" : `refused (${String(record.code ?? "internal")})`}${record.dryrun === true ? " as a dry run" : ""}${record.mocked === true ? " through a test mock" : ""}${record.replayed === true ? " as an idempotent replay" : ""}${record.batchid !== undefined ? ` in the batch ${record.batchid}` : ""}.`;
}

/** Wraps one tool result with the structured details the sidepanel steps read: the step id, kind, risk and summary ride the payload so a client reads the same evidence the panels render. */
export function stepdetails(step: toolstep, result: toolresult): toolresult {
  return { ...result, payload: { ...(result.payload ?? {}), stepid: step.id, kind: step.kind, risk: step.risk, summary: step.summary } };
}

/** The outcome of one serve tool call: the response frame the transport writes, the audit record the trail keeps and the state updates the caller persists. */
export interface calloutcome {
  response?: jsonrpcframe;
  record?: toolcallrecord;
  blocked?: boolean;
  approval?: approvalrequest;
  approvals?: approvalrequest[];
  contexts?: callcontext[];
  records?: idempotencyrecord[];
}

/** Runs one serve tool call through the full composition: the mock seam answers test contexts without touching the browser, the dry run flag evaluates arguments and consent with no side effects, the idempotency key replays the stored result of a repeated call, the rate limit and the allowlist admit the client, the consent gates refuse what the session does not grant, a sensitive tool with the approval requirement raises the human gate and blocks until it answers, and every executed call returns the structured step details with its audit record. */
export async function dispatchcall(input: { params?: Record<string, unknown>; id?: number | string | null; client: clientrecord; catalog: toolcatalog; session?: agentsession; plan?: agentplan; origin: string; now: number; scopes?: toolnamespace[]; readonly?: boolean; mocks?: toolmock[]; idempotency?: idempotencyrecord[]; idempotencywindow?: number; limits?: callratelimit[]; allowlist?: allowlistentry[]; approvals?: approvalrequest[]; approvaltimeout?: number; contexts?: callcontext[]; execute: (step: toolstep) => toolresult | Promise<toolresult> }): Promise<calloutcome> {
  const params = input.params;
  const id = input.id;
  const answer = (result: unknown): calloutcome => ({ response: respond({ ...(id !== undefined ? { id } : {}), result }) });
  const fail = (code: rpcerrorcode, message: string): calloutcome => ({ response: respond({ ...(id !== undefined ? { id } : {}), error: rpcerrorof(code, message) }) });
  if (!params || typeof params !== "object" || Array.isArray(params)) return fail("params", "The tool call needs its params object.");
  const name = typeof params.name === "string" ? params.name.trim() : "";
  if (name === "") return fail("params", "The tool call needs the namespaced name of the tool it invokes.");
  const tool = resolvetool(input.catalog, name);
  if (tool === undefined) return fail("params", `The catalog holds no unambiguous tool named ${name}.`);
  if (input.readonly === true && tool.risk !== "read") return fail("consentrefused", `The serve runs degraded to the read only tools and refuses ${name}.`);
  const namespace = namespaceof(tool.name);
  if (input.scopes !== undefined && namespace !== undefined && !input.scopes.includes(namespace)) return fail("consentrefused", `The session token grants no ${namespace} tools.`);
  const key = typeof params.idempotencykey === "string" && params.idempotencykey.trim() !== "" ? params.idempotencykey : undefined;
  if (key !== undefined) {
    const replay = checkidempotency({ records: input.idempotency ?? [], key, clientid: input.client.id, now: input.now });
    if (replay.replay !== undefined) {
      const record = servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: !replay.replay.iserror, now: input.now, idempotencykey: key, replayed: true });
      return { ...answer(replay.replay), record };
    }
  }
  const mocked = applymock({ mocks: input.mocks ?? [], tool: tool.name });
  if (mocked.result !== undefined) {
    const record = servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: !mocked.result.iserror, now: input.now, mocked: true });
    return { ...answer(mocked.result), record };
  }
  if (params.dryrun === true) {
    const dryrun = dryruntool({ tool, params, client: input.client, ...(input.session !== undefined ? { session: input.session } : {}), ...(input.plan !== undefined ? { plan: input.plan } : {}), origin: input.origin, ...(typeof params.stepid === "string" ? { stepid: params.stepid } : {}), now: input.now });
    const ok = dryrun.argsvalid && dryrun.consentok;
    const record = servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok, now: input.now, ...(ok ? {} : { code: "consentrefused" as rpcerrorcode }), dryrun: true });
    return { response: respond({ ...(id !== undefined ? { id } : {}), result: { content: JSON.stringify(dryrun), iserror: !ok } }), record };
  }
  if (input.limits !== undefined && input.limits.length > 0) {
    const limited = applyratelimit({ limits: input.limits, clientid: input.client.id, now: input.now });
    if (!limited.allowed) return fail("params", `The client exhausted its call budget of ${String(limited.budget ?? 0)} for the ${String(limited.limit?.windowms ?? 0)} millisecond window; retry after ${String(limited.retryafter ?? 0)} milliseconds.`);
  }
  if (input.client.fingerprint !== undefined && input.allowlist !== undefined && input.allowlist.length > 0) {
    const admitted = checkallowlist({ entries: input.allowlist, fingerprint: input.client.fingerprint, ...(namespace !== undefined ? { namespace } : {}) });
    if (!admitted.allowed) return fail("consentrefused", admitted.reason ?? "The client fingerprint stays outside the allowlist.");
  }
  const stepid = typeof params.stepid === "string" ? params.stepid : undefined;
  const gate = tooldispatchgate({ client: input.client, tool, session: input.session, plan: input.plan, origin: input.origin, ...(stepid !== undefined ? { stepid } : {}), now: input.now });
  if (!gate.allowed) {
    const record = servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: false, now: input.now, code: "consentrefused" });
    return { ...fail("consentrefused", gate.reason ?? "The consent gates refused the tool call."), record };
  }
  if (tool.risk !== "read" && tool.consentmeta?.approvalrequired === true) {
    const approval = requireapproval({ clientid: input.client.id, tool: tool.name, reason: tool.consentmeta.review, params, now: input.now, ...(input.approvaltimeout !== undefined ? { timeout: input.approvaltimeout } : {}) });
    return { blocked: true, approval, approvals: [...(input.approvals ?? []).filter(candidate => candidate.id !== approval.id), approval] };
  }
  const step = tool.risk === "read"
    ? { id: `mcp-${input.client.id}-${input.now}`, kind: tool.kind, summary: tool.description.split(".")[0] ?? tool.description, risk: "read" as const, ...(typeof params.target === "string" ? { target: params.target } : {}), ...(typeof params.value === "string" ? { value: params.value } : {}), ...(params.options !== undefined && typeof params.options === "object" && !Array.isArray(params.options) ? { options: JSON.stringify(params.options) } : {}) }
    : input.plan?.steps.find(candidate => candidate.id === stepid);
  if (step === undefined) return fail("consentrefused", "The tool call names a step the approved plan does not carry.");
  const callid = `call-${input.now}-${randomid().slice(0, 6)}`;
  const contexts = [...(input.contexts ?? []), begincall({ clientid: input.client.id, tool: tool.name, callid, ...(key !== undefined ? { idempotencykey: key } : {}), now: input.now })];
  let result: toolresult;
  try {
    result = await input.execute(step);
  } catch (error) {
    const closed = endcall({ contexts, callid, ok: false, errorcode: "internal", now: input.now });
    return { response: respond({ ...(id !== undefined ? { id } : {}), error: rpcerrorof("internal", error instanceof Error ? error.message : String(error)) }), contexts: closed.contexts, record: servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: false, now: input.now, code: "internal", callid }) };
  }
  const closed = endcall({ contexts, callid, ok: !result.iserror, now: input.now });
  const detailed = stepdetails(step, result);
  const record = servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: !result.iserror, now: input.now, callid, ...(key !== undefined ? { idempotencykey: key } : {}) });
  const records = key !== undefined ? recordidempotency({ records: input.idempotency ?? [], key, clientid: input.client.id, tool: tool.name, result: detailed, now: input.now, ...(input.idempotencywindow !== undefined ? { window: input.idempotencywindow } : {}) }) : input.idempotency;
  return { ...answer(detailed), record, contexts: closed.contexts, ...(records !== undefined ? { records } : {}) };
}

/** Resumes one approval gated call after the human answered: an approved gate executes the held step with its structured details while a refused or expired gate never executes. */
export async function resumegatedcall(input: { approval: approvalrequest; client: clientrecord; catalog: toolcatalog; session?: agentsession; plan?: agentplan; origin: string; now: number; execute: (step: toolstep) => toolresult | Promise<toolresult> }): Promise<calloutcome> {
  if (input.approval.state !== "approved") {
    return { response: respond({ error: rpcerrorof("consentrefused", `The approval gate ${input.approval.id} answered ${input.approval.state} and the call never executes.`) }), record: servecallevent({ client: input.client, tool: input.approval.tool, origin: input.origin, ok: false, now: input.now, code: "consentrefused" }) };
  }
  const tool = resolvetool(input.catalog, input.approval.tool);
  if (tool === undefined) return { response: respond({ error: rpcerrorof("params", `The catalog holds no unambiguous tool named ${input.approval.tool}.`) }) };
  const stepid = typeof input.approval.params.stepid === "string" ? input.approval.params.stepid : undefined;
  const gate = tooldispatchgate({ client: input.client, tool, session: input.session, plan: input.plan, origin: input.origin, ...(stepid !== undefined ? { stepid } : {}), now: input.now });
  if (!gate.allowed) {
    return { response: respond({ error: rpcerrorof("consentrefused", gate.reason ?? "The consent gates refused the tool call.") }), record: servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: false, now: input.now, code: "consentrefused" }) };
  }
  const step = input.plan?.steps.find(candidate => candidate.id === stepid);
  if (step === undefined) return { response: respond({ error: rpcerrorof("consentrefused", "The approved gate names no step the approved plan carries.") }) };
  const result = await input.execute(step);
  return { response: respond({ ...(input.approval.params.id !== undefined ? { id: input.approval.params.id as number | string } : {}), result: stepdetails(step, result) }), record: servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: !result.iserror, now: input.now }) };
}

/** Runs one ordered batch of tool calls in a single request: every member dispatches through the caller composition while the stop on first error flag halts the batch at its first failure; the batch record grades through its members and lands with its per call outcomes. */
export async function runcallsbatch(input: { calls: Array<{ id: string; name: string; params: Record<string, unknown> }>; client: clientrecord; now: number; stoponerror: boolean; execute: (call: { id: string; name: string; params: Record<string, unknown> }, index: number) => Promise<{ ok: boolean; result?: toolresult; error?: structurederror }> }): Promise<{ batch: batchcall; outcomes: batchoutcome[] }> {
  const batchid = `batch-${input.now}-${randomid().slice(0, 6)}`;
  const batch: batchcall = { id: batchid, clientid: input.client.id, calls: input.calls.map(call => ({ id: call.id, name: call.name, params: call.params })), stoponerror: input.stoponerror, state: "running", createdat: input.now, outcomes: [] };
  const outcome = await runbatch({ calls: input.calls, stoponerror: input.stoponerror, now: input.now, execute: input.execute });
  return { batch: { ...batch, state: outcome.stoppedat !== undefined ? "stopped" : "done", finishedat: input.now, outcomes: outcome.outcomes }, outcomes: outcome.outcomes };
}

/** The serve session state one frame routes through: the client, the session and plan the gates read, the served surfaces and the stores the composition updates. */
export interface servesession {
  config: mcpserverconfig;
  catalog: toolcatalog;
  templates: prompttemplate[];
  client: clientrecord;
  session?: agentsession;
  plan?: agentplan;
  origin: string;
  bindings: clientbinding[];
  approvals: approvalrequest[];
  watches: resourcewatch[];
  contexts: callcontext[];
  idempotency: idempotencyrecord[];
  limits: callratelimit[];
  mocks: toolmock[];
  allowlist: allowlistentry[];
  pagestate?: Record<string, unknown>;
  audit?: auditevent[];
  startedat: number;
}

/** Routes one serve frame through the extended method table: the initialize handshake records the client metadata, the tool listing respects the degradation and the negotiated namespaces, the tool calls run the full composition, the prompts and resources serve behind their exposure gates, the batches run their ordered members and the health answers its resource; every response keeps the request id. */
export async function routeserveframe(input: { frame: jsonrpcframe; state: servesession; now: number; execute: (step: toolstep) => toolresult | Promise<toolresult> }): Promise<{ response?: jsonrpcframe; notifications?: jsonrpcframe[]; state: servesession }> {
  const frame = input.frame;
  const state = input.state;
  const id = frame.id;
  const params = frame.params;
  const answer = (result: unknown): { response: jsonrpcframe; state: servesession } => ({ response: respond({ ...(id !== undefined ? { id } : {}), result }), state });
  const fail = (error: rpcerror): { response: jsonrpcframe; state: servesession } => ({ response: respond({ ...(id !== undefined ? { id } : {}), error }), state });
  if (frame.method === undefined) return fail(rpcerrorof("method", "The serve frame carries no method to route."));
  const entry = servemethods().find(candidate => candidate.method === frame.method);
  if (entry === undefined) return fail(rpcerrorof("method", `The serve mode routes no method named ${frame.method}.`));
  if (entry.handler === "initialize") {
    const handshake = serveinitialize({ ...(params !== undefined ? { params } : {}), config: state.config, catalog: state.catalog, templates: state.templates });
    return { response: respond({ ...(id !== undefined ? { id } : {}), result: { serverinfo: handshake.handshake.serverinfo, protocolversion: handshake.handshake.protocolversion, servercontractversion: handshake.handshake.servercontractversion, instructions: handshake.handshake.instructions } }), state: { ...state, client: handshake.client(state.client) } };
  }
  if (entry.handler === "ping") return answer(ping({ now: input.now }));
  if (entry.handler === "health") return answer(healthof({ startedat: state.startedat, now: input.now, state: "running" }));
  if (entry.handler === "listtools") {
    const binding = state.bindings.find(candidate => candidate.clientid === state.client.id && candidate.releasedat === undefined);
    const degraded = binding?.readonly === true;
    const scopes = state.client.capabilities?.namespaces;
    const exposed = exposedtools(state.catalog, { ...(degraded ? { readonly: true } : {}), ...(scopes !== undefined ? { scopes } : {}) });
    return answer(listtools(exposed));
  }
  if (entry.handler === "negotiate") {
    const server = servercapabilities({ config: state.config, catalog: state.catalog });
    const clientcaps = params?.capabilities && typeof params.capabilities === "object" && !Array.isArray(params.capabilities) ? params.capabilities as Partial<capabilityset> : undefined;
    const outcome = negotiate({ ...(clientcaps !== undefined ? { client: clientcaps } : {}), server });
    return outcome.agreed ? answer(outcome.capabilities) : fail(rpcerrorof("params", outcome.mismatch ?? "The capability negotiation did not agree."));
  }
  if (entry.handler === "listresources") {
    const gate = resourceexposuregate({ client: state.client, uri: "devthink://health", served: servedresources().map(resource => resource.uri) });
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The resource exposure was refused."));
    return answer(resourceslist());
  }
  if (entry.handler === "readresource") {
    const uri = typeof params?.uri === "string" ? params.uri : "";
    const gate = resourceexposuregate({ client: state.client, uri, served: servedresources().map(resource => resource.uri) });
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The resource exposure was refused."));
    const read = readresource({ uri, ...(state.pagestate !== undefined ? { pagestate: state.pagestate } : {}), ...(state.plan !== undefined ? { plan: state.plan } : {}), ...(state.audit !== undefined ? { audit: state.audit } : {}), ...(state.session !== undefined ? { session: state.session } : {}), health: healthof({ startedat: state.startedat, now: input.now, state: "running" }) });
    if (read.resource === undefined || read.text === undefined) return fail(rpcerrorof("params", read.reason ?? "The resource read failed."));
    return answer({ uri: read.resource.uri, mimetype: read.resource.mimetype, text: read.text });
  }
  if (entry.handler === "subscriberesource") {
    const uri = typeof params?.uri === "string" ? params.uri : "";
    const gate = resourceexposuregate({ client: state.client, uri, served: servedresources().map(resource => resource.uri) });
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The resource exposure was refused."));
    const subscribed = subscriberesource({ clientid: state.client.id, uri, ...(state.pagestate !== undefined && uri === "devthink://pagestate" ? { state: state.pagestate } : {}), now: input.now });
    if (subscribed.watch === undefined) return fail(rpcerrorof("params", subscribed.reason ?? "The resource subscription did not open."));
    return { response: respond({ ...(id !== undefined ? { id } : {}), result: { watchid: subscribed.watch.id, uri } }), state: { ...state, watches: [subscribed.watch, ...state.watches] } };
  }
  if (entry.handler === "unsubscriberesource") {
    const watchid = typeof params?.watchid === "string" ? params.watchid : "";
    if (watchid === "") return fail(rpcerrorof("params", "The unsubscribe needs the watcher id."));
    return { response: respond({ ...(id !== undefined ? { id } : {}), result: { watchid, canceled: true } }), state: { ...state, watches: state.watches.map(watch => watch.id === watchid && watch.canceledat === undefined ? { ...watch, canceledat: input.now } : watch) } };
  }
  if (entry.handler === "listprompts") {
    const gate = promptexposuregate(state.client);
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The prompt exposure was refused."));
    return answer({ prompts: listmcpprompts(state.templates) });
  }
  if (entry.handler === "callprompt") {
    const gate = promptexposuregate(state.client);
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The prompt exposure was refused."));
    const name = typeof params?.name === "string" ? params.name : "";
    const args = params?.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments as Record<string, unknown> : undefined;
    const rendered = rendermcpprompt({ name, ...(args !== undefined ? { args } : {}), templates: state.templates });
    if (rendered.rendered === undefined || rendered.prompt === undefined) return fail(rpcerrorof("params", rendered.reason ?? "The prompt call did not render."));
    return answer({ prompt: rendered.prompt.name, rendered: rendered.rendered, arguments: rendered.prompt.arguments });
  }
  if (entry.handler === "cancel") {
    const callid = typeof params?.callid === "string" ? params.callid : "";
    if (callid.trim() === "") return fail(rpcerrorof("params", "The cancellation frame needs the call id it aborts."));
    const aborted = canceltool({ contexts: state.contexts, callid, ...(typeof params?.reason === "string" ? { reason: params.reason } : {}), now: input.now });
    if (aborted.context === undefined) return fail(rpcerrorof("params", aborted.reason ?? "The cancellation frame named no in flight tool call."));
    return { response: respond({ ...(id !== undefined ? { id } : {}), result: { cancelled: true, callid, ...(aborted.context.partial !== undefined ? { partial: aborted.context.partial } : {}) } }), state: { ...state, contexts: aborted.contexts } };
  }
  if (entry.handler === "batch") {
    const rawcalls = params !== undefined && Array.isArray(params.calls) ? params.calls as Array<Record<string, unknown>> : [];
    const calls = rawcalls.filter(call => call !== null && typeof call === "object" && typeof call.name === "string").map((call, index) => ({ id: typeof call.id === "string" ? call.id : `member-${index + 1}`, name: call.name as string, params: call.params !== undefined && typeof call.params === "object" && !Array.isArray(call.params) ? call.params as Record<string, unknown> : {} }));
    if (calls.length === 0) return fail(rpcerrorof("params", "The batch call needs its ordered tool calls."));
    const run = await runcallsbatch({ calls, client: state.client, now: input.now, stoponerror: params?.stoponerror !== false, execute: async call => {
      const outcome = await dispatchcall({ params: { ...call.params, name: call.name }, ...(id !== undefined ? { id } : {}), client: state.client, catalog: state.catalog, ...(state.session !== undefined ? { session: state.session } : {}), ...(state.plan !== undefined ? { plan: state.plan } : {}), origin: state.origin, now: input.now, ...(state.mocks.length > 0 ? { mocks: state.mocks } : {}), ...(state.idempotency.length > 0 ? { idempotency: state.idempotency } : {}), ...(state.limits.length > 0 ? { limits: state.limits } : {}), ...(state.allowlist.length > 0 ? { allowlist: state.allowlist } : {}), approvals: state.approvals, contexts: state.contexts, execute: input.execute });
      if (outcome.response?.error !== undefined) return { ok: false, error: { code: outcome.response.error.code, message: outcome.response.error.message, retryhint: "none" } };
      const result = outcome.response?.result as toolresult | undefined;
      return result !== undefined ? { ok: !result.iserror, result } : { ok: false, error: { code: "internal", message: "The batch member produced no result.", retryhint: "none" } };
    } });
    return answer({ batchid: run.batch.id, state: run.batch.state, outcomes: run.outcomes });
  }
  const outcome = await dispatchcall({ ...(params !== undefined ? { params } : {}), ...(id !== undefined ? { id } : {}), client: state.client, catalog: state.catalog, ...(state.session !== undefined ? { session: state.session } : {}), ...(state.plan !== undefined ? { plan: state.plan } : {}), origin: state.origin, now: input.now, ...(state.bindings.find(binding => binding.clientid === state.client.id && binding.releasedat === undefined)?.readonly === true ? { readonly: true } : {}), ...(state.mocks.length > 0 ? { mocks: state.mocks } : {}), ...(state.idempotency.length > 0 ? { idempotency: state.idempotency } : {}), ...(state.limits.length > 0 ? { limits: state.limits } : {}), ...(state.allowlist.length > 0 ? { allowlist: state.allowlist } : {}), approvals: state.approvals, ...(state.config.remoteaccess?.approvaltimeout?.windowms !== undefined ? { approvaltimeout: state.config.remoteaccess.approvaltimeout.windowms } : {}), contexts: state.contexts, execute: input.execute });
  return { ...(outcome.response !== undefined ? { response: outcome.response } : {}), state: { ...state, ...(outcome.approvals !== undefined ? { approvals: outcome.approvals } : {}), ...(outcome.contexts !== undefined ? { contexts: outcome.contexts } : {}), ...(outcome.records !== undefined ? { idempotency: outcome.records } : {}) } };
}

/** Publishes one resource change of the serve session to its subscribers: every watcher of the resource receives its delta notification frame while the session keeps the updated watches. */
export function publishresourcechange(input: { state: servesession; uri: string; changed: Record<string, unknown>; now: number }): { notifications: jsonrpcframe[]; state: servesession } {
  const published = publishchange({ watches: input.state.watches, uri: input.uri, state: input.changed, now: input.now });
  return { notifications: published.deliveries.map(delivery => delivery.frame), state: { ...input.state, watches: published.watches } };
}

/** Builds one serve session over the default catalog and the empty stores: the caller threads the session through the frame router and persists the returned state. */
export function createservesession(input: { config: mcpserverconfig; client: clientrecord; templates?: prompttemplate[]; session?: agentsession; plan?: agentplan; origin: string; now: number; catalog?: toolcatalog }): servesession {
  return { config: input.config, catalog: input.catalog ?? buildtoolcatalog(), templates: input.templates ?? [], client: input.client, ...(input.session !== undefined ? { session: input.session } : {}), ...(input.plan !== undefined ? { plan: input.plan } : {}), origin: input.origin, bindings: [], approvals: [], watches: [], contexts: [], idempotency: [], limits: [], mocks: [], allowlist: [], startedat: input.now };
}

/** Names the health resource of the served catalog so the serve route and the docs share one entry point. */
export function healthresourceof(): servedresource | undefined {
  return resourceof("devthink://health");
}


/* ── Merged from mcpserver.ts: the 1.1.88 consolidation interns the correlated mcpserver logic here, so no variation of the same file lives beside another. ── */

/**
 * Mcp server of the 1.1.54 and 1.1.55 agent protocol family.
 * Every server, transport and frame routing concern lives in this file: the json rpc frame grammar with newline delimited and http post envelopes, the parse and serialize round trips, the frame validation that rejects malformed ids, unknown methods and bad params, the rpc error codes with their json rpc number mapping, the initialize handshake with the server info, the ping keepalive, the tools/list report of every tool with its json schema inputs and full consent metadata, the capability negotiation over protocol version, tool compatibility floor and transports, the per client tool floor negotiation, the client records with their pairing state, the per client request queue serialization under the user configured depth, the consent gated tool dispatch that checks the namespace first so unknown tools fail fast and never bypasses review, the localhost bind with its documented default, the stdio bridge that launches through the native messaging host manifest, relays frames in both directions and restarts a dead client process, and the framed logs that never leak payloads.
 * The server stays pure: execution flows through the injected execute seam so tests run on plain fixtures, the frame size and queue depth stay user configured with no code ceiling, and no endpoint, provider or key is ever hardcoded.
 */

/** The documented default bind address of the http listener: localhost only. */
export const localhostbind = "127.0.0.1";

/** The documented default port of the http listener; any user configured port wins. */
export const defaultmcpport = 7436;

/** The json rpc error numbers of the agent protocol: parse, method, params and internal keep the classic json rpc codes while consentrefused reserves -32001 for gate refusals. */
export const rpcerrornumbers: Record<rpcerrorcode, number> = { parse: -32700, method: -32601, params: -32602, internal: -32603, consentrefused: -32001 };

/** Builds one rpc error payload from its code name and message. */
export function rpcerrorof(code: rpcerrorcode, message: string, data?: unknown): rpcerror {
  return { code, message, ...(data !== undefined ? { data } : {}) };
}

/** Maps one json rpc error number back to its agent protocol code name; classic numbers the protocol does not use stay undefined. */
export function rpcerrorcodeof(number: number): rpcerrorcode | undefined {
  const entry = (Object.entries(rpcerrornumbers) as Array<[rpcerrorcode, number]>).find(([, value]) => value === number);
  return entry?.[0];
}

/** The user configured default server config: localhost bind, the documented default port, both transports allowed and the server off until the user enables it. */
export function defaultmcpconfig(): mcpserverconfig {
  return { port: defaultmcpport, transports: ["stdio", "http"], enabled: false };
}

/** Unwraps one http post envelope around a frame; a bare frame passes through untouched. */
function unwraphttppost(value: unknown): unknown {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const candidate = value as Record<string, unknown>;
    if (candidate.transport === "http" && candidate.frame && typeof candidate.frame === "object" && !Array.isArray(candidate.frame)) return candidate.frame;
  }
  return value;
}

/** Parses one raw json rpc frame from the wire, bare or wrapped in an http post envelope; malformed json throws so the caller answers with the parse error. */
export function parseframe(raw: string): jsonrpcframe {
  const parsed = unwraphttppost(JSON.parse(raw) as unknown);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("A json rpc frame must be an object.");
  return parsed as jsonrpcframe;
}

/** Parses a newline delimited wire block into its frames; empty lines carry no frame. */
export function parsewire(raw: string): jsonrpcframe[] {
  return raw.split("\n").map(line => line.trim()).filter(line => line.length > 0).map(line => parseframe(line));
}

/** Serializes one frame to its compact json rpc wire form. */
export function serializeframe(frame: jsonrpcframe): string {
  return JSON.stringify(frame);
}

/** Serializes one frame for the requested wire format: newline delimited blocks end in one newline while http post envelopes wrap the frame for a posted body. */
export function wireformat(frame: jsonrpcframe, format: "newline" | "httppost"): string {
  return format === "newline" ? `${serializeframe(frame)}\n` : JSON.stringify({ transport: "http", frame });
}

/** Validates one request frame against the routing table: the jsonrpc tag, well formed ids, known methods, object params and the user configured frame size; a clean frame returns undefined. */
export function validateframe(frame: jsonrpcframe, methods: methodentry[], config?: mcpserverconfig): rpcerror | undefined {
  if (frame.jsonrpc !== "2.0") return rpcerrorof("parse", "The frame must carry the jsonrpc 2.0 tag.");
  if (frame.id !== undefined && typeof frame.id !== "number" && typeof frame.id !== "string" && frame.id !== null) return rpcerrorof("parse", "The frame id must be a number, a string or null.");
  if (frame.method === undefined || frame.method.trim() === "") return rpcerrorof("method", "The frame carries no method to route.");
  if (!methods.some(entry => entry.method === frame.method)) return rpcerrorof("method", `The server routes no method named ${frame.method}.`);
  if (frame.params !== undefined && (typeof frame.params !== "object" || Array.isArray(frame.params))) return rpcerrorof("params", "The frame params must be an object.");
  if (config?.framesize !== undefined && serializeframe(frame).length > config.framesize) return rpcerrorof("params", `The serialized frame exceeds the user configured frame size of ${config.framesize} characters.`);
  return undefined;
}

/** Builds one response frame that answers the request id with either a result or an error; error frames without an id answer null so the client can correlate the failure. */
export function respond(input: { id?: number | string | null; result?: unknown; error?: rpcerror }): jsonrpcframe {
  return { jsonrpc: "2.0", ...(input.id === undefined ? (input.error !== undefined ? { id: null } : {}) : { id: input.id }), ...(input.error !== undefined ? { error: input.error } : { result: input.result }) };
}

/** The mcp server routing table: every json rpc method with its plain language description and the internal handler its frames route to; the 1.1.56 family adds the prompt tools and the in flight cancellation. */
export function servermethods(): methodentry[] {
  return [
    { method: "initialize", handler: "initialize", description: "Completes the mcp handshake and returns the server info." },
    { method: "ping", handler: "ping", description: "Answers keepalive frames with pong." },
    { method: "tools/list", handler: "listtools", description: "Returns every tool with its version and json schema inputs." },
    { method: "negotiate", handler: "negotiate", description: "Exchanges capability sets with the client." },
    { method: "tools/call", handler: "dispatch", description: "Invokes one tool behind the consent gates." },
    { method: "prompts/list", handler: "listprompts", description: "Lists the prompt defs the server exposes as callable tools." },
    { method: "prompts/call", handler: "callprompt", description: "Renders one prompt and returns its arguments as a tool call." },
    { method: "calls/cancel", handler: "cancel", description: "Aborts one in flight tool call and preserves its partial result." }
  ];
}

/** Builds the capability set the server offers: the protocol version, the server identity, the tool compatibility floor, the tool count, the namespaces and the allowed transports. */
export function servercapabilities(input: { config: mcpserverconfig; catalog: toolcatalog }): capabilityset {
  return { protocolversion, name: "devthink", version: protocolversion, toolversion: input.catalog.version, tools: alltools(input.catalog).length, namespaces: toolnamespaces, transports: input.config.transports };
}

/** Completes the mcp handshake: the server info, the protocol version the server speaks, the frozen protocolv2 major a new client answers as its default wire line and the instructions that state the consent model in plain language. */
export function initialize(input: { params?: Record<string, unknown>; config: mcpserverconfig; catalog: toolcatalog }): { serverinfo: capabilityset; protocolversion: string; protocolmajor: number; instructions: string } {
  void input.params;
  return { serverinfo: servercapabilities({ config: input.config, catalog: input.catalog }), protocolversion, protocolmajor: protocolmajorversion, instructions: "Devthink serves browser tools behind the human review gates: read only tools run once a session is approved while every tool with side effects executes exactly the approved plan step it names. No endpoint, provider or key is hardcoded; the user pairs every client." };
}

/** Answers one keepalive frame with pong. */
export function ping(input: { now: number }): { pong: true; at: number } {
  return { pong: true, at: input.now };
}

/** Lists every tool of the catalog with its version, its json schema inputs, its risk grade and the full consent metadata of tools with side effects: the review requirement, the policy derived risk class, the approval gate requirement and the session origin scope. */
export function listtools(catalog: toolcatalog): { tools: Array<{ name: string; version: number; description: string; inputschema: toolcatalog["domains"][number]["tools"][number]["inputschema"]; risk: string; consentmeta?: { review: string; riskclass: string; approvalrequired: boolean; originscope: string } }> } {
  return { tools: alltools(catalog).map(tool => ({ name: tool.name, version: tool.version, description: tool.description, inputschema: tool.inputschema, risk: tool.risk, ...(tool.consentmeta !== undefined ? { consentmeta: { review: tool.consentmeta.review, riskclass: tool.consentmeta.riskclass ?? tool.risk, approvalrequired: tool.consentmeta.approvalrequired ?? true, originscope: tool.consentmeta.originscope ?? "session" } } : {}) })) };
}

/** Collects the unknown top level fields of one wire frame: every key outside the json rpc grammar of jsonrpc, id, method, params, result and error names an unknown field the strict protocolv2 mode refuses before dispatch. */
export function unknownframefields(frame: jsonrpcframe): string[] {
  return Object.keys(frame as unknown as Record<string, unknown>).filter(key => key !== "jsonrpc" && key !== "id" && key !== "method" && key !== "params" && key !== "result" && key !== "error");
}

/** Reads the negotiated protocol major of one client: the client capability set declares the numeric protocolmajor and a client that declares nothing answers the protocolv2 default of two, so the strict schema modes follow the negotiated line. The deprecated full version string the version one clients exchanged left the capability set at the 2.0.0 sunset: the string form parses nowhere and a client that still sends it answers the strict refusal through the schema layer, never a negotiated major. */
export function clientprotocolmajor(client: clientrecord): number {
  return protocolmajorof(client.capabilities?.protocolmajor) ?? protocolmajorversion;
}

/** Exchanges capability sets with one client: protocol version, tool compatibility floor and transports must agree or the negotiation reports the mismatch; the 1.1.91 api freeze negotiates the protocol major as the 2.0.0 sunset left it — a client that declares nothing answers the frozen major two, the capability set declares the numeric protocolmajor (the deprecated full version string the version one clients exchanged left the wire at the sunset and parses nowhere), a major below the supported floor refuses with the migration path inside the mismatch, and a major above the supported range reports its mismatch with the supported range in plain language; the agreed set carries the negotiated floor. */
export function negotiate(input: { client?: Partial<capabilityset>; server: capabilityset }): { agreed: boolean; mismatch?: string; capabilities?: capabilityset; protocolmajor?: number; deprecation?: string } {
  const client = input.client;
  const negotiation = negotiateprotocol({ ...(client?.protocolmajor !== undefined ? { client: client.protocolmajor } : {}) });
  if (!negotiation.agreed) return { agreed: false, ...(negotiation.reason !== undefined ? { mismatch: negotiation.reason } : {}) };
  if (client?.toolversion !== undefined && client.toolversion > input.server.toolversion) return { agreed: false, mismatch: `The client requires tool version ${String(client.toolversion)} while the server offers ${String(input.server.toolversion)}.` };
  if (client?.transports !== undefined && client.transports.some(transport => !input.server.transports.includes(transport))) return { agreed: false, mismatch: "The client requires a transport the server configuration does not allow." };
  return { agreed: true, capabilities: input.server, ...(negotiation.major !== undefined ? { protocolmajor: negotiation.major } : {}), ...(negotiation.deprecation !== undefined ? { deprecation: negotiation.deprecation } : {}) };
}

/** Registers one connected client per transport; every client starts unpaired and waits for the user pairing approval. */
export function connectclient(input: { transport: transportkind; now: number; id?: string }): clientrecord {
  return { id: input.id ?? `client-${input.now}`, transport: input.transport, paired: false, connectedat: input.now };
}

/** Applies one pairing decision: approval pairs the client while refusal leaves it unpaired and disconnected; already disconnected clients stay untouched. */
export function pairclient(clients: clientrecord[], id: string, approved: boolean, now: number): clientrecord[] {
  return clients.map(client => client.id !== id || client.disconnectedat !== undefined ? client : approved ? { ...client, paired: true, pairedat: now } : { ...client, paired: false, disconnectedat: now });
}

/** Disconnects one client on demand; the record stays for the audit trail with its disconnect time. */
export function disconnectclient(clients: clientrecord[], id: string, now: number): clientrecord[] {
  return clients.map(client => client.id === id && client.disconnectedat === undefined ? { ...client, disconnectedat: now } : client);
}

/** Enqueues one request frame for a client; frames serialize per client in arrival order and the user configured depth refuses the frame that would exceed it while an absent depth keeps the queue unbounded. */
export function enqueuerequest(input: { queue: jsonrpcframe[]; frame: jsonrpcframe; depth?: number }): jsonrpcframe[] | undefined {
  if (input.depth !== undefined && input.queue.length + 1 > input.depth) return undefined;
  return [...input.queue, input.frame];
}

/** Pops the next request frame of one client queue; an empty queue returns undefined. */
export function nextrequest(queue: jsonrpcframe[]): { frame: jsonrpcframe; remaining: jsonrpcframe[] } | undefined {
  return queue.length === 0 ? undefined : { frame: queue[0] as jsonrpcframe, remaining: queue.slice(1) };
}

/** Negotiates the tool compatibility floor with one client: the client declares the highest floor it can parse and the catalog must satisfy it, so the negotiated floor is the client floor while a floor above the catalog version reports its mismatch in plain language. */
export function negotiatetoolfloor(clientfloor: number | undefined, catalogversion: number): { floor: number } | { mismatch: string } {
  if (clientfloor === undefined) return { floor: catalogversion };
  if (clientfloor > catalogversion) return { mismatch: `The client requires the tool version floor ${clientfloor} while the catalog serves version ${catalogversion}.` };
  return { floor: clientfloor };
}

/** Dispatches one tool call behind the consent gates: the namespace check runs first so unknown tools fail fast, then the client must be paired, the session live, the plan approved, the origin inside the session grants and the tool version at or above the negotiated floor; read only tools run under the dryrun risk class while every tool with side effects executes exactly the approved plan step it names. */
export async function dispatchtool(input: { params?: Record<string, unknown>; client: clientrecord; catalog: toolcatalog; session?: agentsession; plan?: agentplan; origin: string; now: number; scopes?: toolnamespace[]; execute: (step: toolstep) => toolresult | Promise<toolresult> }): Promise<{ result?: toolresult; error?: rpcerror; step?: toolstep }> {
  const params = input.params;
  if (!params || typeof params !== "object" || Array.isArray(params)) return { error: rpcerrorof("params", "The tool call needs its params object.") };
  if (typeof params.name !== "string" || !params.name.trim()) return { error: rpcerrorof("params", "The tool call needs the namespaced name of the tool it invokes.") };
  const tool = resolvetool(input.catalog, params.name.trim());
  if (tool === undefined) return { error: rpcerrorof("params", `The catalog holds no unambiguous tool named ${params.name.trim()}.`) };
  const namespace = namespaceof(tool.name);
  if (namespace === undefined) return { error: rpcerrorof("params", `The tool ${tool.name} carries no reviewed namespace.`) };
  if (input.scopes !== undefined && !input.scopes.includes(namespace)) return { error: rpcerrorof("consentrefused", `The session token grants no ${namespace} tools.`) };
  const floor = input.client.toolfloor ?? input.client.capabilities?.toolversion ?? input.catalog.version;
  if (tool.version < floor) return { error: rpcerrorof("params", `The tool ${tool.name} of version ${tool.version} stays below the negotiated compatibility floor of ${floor}.`) };
  const stepid = typeof params.stepid === "string" ? params.stepid : undefined;
  const gate = tooldispatchgate({ client: input.client, tool, session: input.session, plan: input.plan, origin: input.origin, ...(stepid !== undefined ? { stepid } : {}), now: input.now });
  if (!gate.allowed) return { error: rpcerrorof("consentrefused", gate.reason ?? "The consent gates refused the tool call.") };
  const step = tool.risk === "read"
    ? { id: `mcp-${input.client.id}-${input.now}`, kind: tool.kind, summary: tool.description.split(".")[0] ?? tool.description, risk: "read" as const, ...(typeof params.target === "string" ? { target: params.target } : {}), ...(typeof params.value === "string" ? { value: params.value } : {}), ...(params.options !== undefined && typeof params.options === "object" && !Array.isArray(params.options) ? { options: JSON.stringify(params.options) } : {}) }
    : input.plan?.steps.find(candidate => candidate.id === stepid);
  if (step === undefined) return { error: rpcerrorof("consentrefused", "The tool call names a step the approved plan does not carry.") };
  try {
    const result = await input.execute(step);
    return { result, step };
  } catch (error) {
    return { error: rpcerrorof("internal", error instanceof Error ? error.message : String(error)) };
  }
}

/** Parses, validates and routes one json rpc frame: parse failures answer with the parse error, validation failures echo the same id with their error, and clean frames reach the handler the routing table names — the 1.1.56 family routes the prompt tool listing, the prompt rendering and the in flight cancellation while the stateful subscription, resource, sampling and batch methods route through the frame intake with their persisted state; every response keeps the request id. */
export async function handleframe(input: { raw?: string; frame?: jsonrpcframe; client: clientrecord; catalog: toolcatalog; config: mcpserverconfig; session?: agentsession; plan?: agentplan; origin: string; tabid: number; now: number; scopes?: toolnamespace[]; contexts?: callcontext[]; execute: (step: toolstep) => toolresult | Promise<toolresult> }): Promise<jsonrpcframe> {
  if (input.raw !== undefined && input.config.framesize !== undefined && input.raw.length > input.config.framesize) return respond({ id: null, error: rpcerrorof("params", `The wire frame exceeds the user configured frame size of ${input.config.framesize} characters.`) });
  let frame: jsonrpcframe;
  if (input.raw !== undefined) {
    try {
      frame = parseframe(input.raw);
    } catch {
      return respond({ id: null, error: rpcerrorof("parse", "The wire frame does not parse as json.") });
    }
  } else if (input.frame !== undefined) {
    frame = input.frame;
  } else {
    return respond({ id: null, error: rpcerrorof("parse", "The server received no frame to route.") });
  }
  const invalid = validateframe(frame, servermethods(), input.config);
  if (invalid !== undefined) return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), error: invalid });
  /* the 1.1.91 api freeze runs schema validation on every incoming message before dispatch: the strict refusal answers unknown frame fields on every major the line accepts — the 2.0.0 sunset closed the version one tolerance the deprecation window carried */
  const unknown = unknownframefields(frame);
  if (unknown.length > 0) {
    const strictness = unknownfieldsgate({ unknown, major: clientprotocolmajor(input.client) });
    if (!strictness.allowed) return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), error: rpcerrorof("params", strictness.reason ?? "The frame carries unknown fields the frozen schema declares nowhere.") });
  }
  const entry = servermethods().find(candidate => candidate.method === frame.method);
  if (entry === undefined) return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), error: rpcerrorof("method", `The server routes no method named ${String(frame.method)}.`) });
  const params = frame.params;
  if (entry.handler === "initialize") return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), result: initialize({ ...(params !== undefined ? { params } : {}), config: input.config, catalog: input.catalog }) });
  if (entry.handler === "ping") return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), result: ping({ now: input.now }) });
  if (entry.handler === "listtools") return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), result: listtools(input.catalog) });
  if (entry.handler === "negotiate") {
    const server = servercapabilities({ config: input.config, catalog: input.catalog });
    const clientcaps = params?.capabilities && typeof params.capabilities === "object" && !Array.isArray(params.capabilities) ? params.capabilities as Partial<capabilityset> : undefined;
    const outcome = negotiate({ ...(clientcaps !== undefined ? { client: clientcaps } : {}), server });
    return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), ...(outcome.agreed ? { result: outcome.capabilities } : { error: rpcerrorof("params", outcome.mismatch ?? "The capability negotiation did not agree.") }) });
  }
  if (entry.handler === "listprompts") return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), result: { prompts: listprompts() } });
  if (entry.handler === "callprompt") {
    const name = typeof params?.name === "string" ? params.name : "";
    const args = params?.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments as Record<string, unknown> : undefined;
    const called = name === "" ? { reason: "The prompt call needs the prompt name." } : callprompt({ name, ...(args !== undefined ? { args } : {}) });
    if (called.toolcall === undefined) return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), error: rpcerrorof("params", called.reason ?? "The prompt call did not render.") });
    return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), result: { toolcall: called.toolcall, rendered: called.rendered } });
  }
  if (entry.handler === "cancel") {
    const callid = typeof params?.callid === "string" ? params.callid : "";
    const reason = typeof params?.reason === "string" ? params.reason : undefined;
    if (callid.trim() === "") return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), error: rpcerrorof("params", "The cancellation frame needs the call id it aborts.") });
    const aborted = canceltool({ contexts: input.contexts ?? [], callid, ...(reason !== undefined ? { reason } : {}), now: input.now });
    if (aborted.context === undefined) return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), error: rpcerrorof("params", aborted.reason ?? "The cancellation frame named no in flight tool call.") });
    return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), result: { cancelled: true, callid, ...(reason !== undefined ? { reason } : {}), ...(aborted.context.partial !== undefined ? { partial: aborted.context.partial } : {}) } });
  }
  const dispatched = await dispatchtool({ ...(params !== undefined ? { params } : {}), client: input.client, catalog: input.catalog, ...(input.session !== undefined ? { session: input.session } : {}), ...(input.plan !== undefined ? { plan: input.plan } : {}), ...(input.scopes !== undefined ? { scopes: input.scopes } : {}), origin: input.origin, now: input.now, execute: input.execute });
  return respond({ ...(frame.id !== undefined ? { id: frame.id } : {}), ...(dispatched.error !== undefined ? { error: dispatched.error } : { result: dispatched.result }) });
}

/** Normalizes the http listener bind of one server config: an absent bind keeps the documented localhost default and the report states whether the bind stays local. */
export function bindlocalhost(config: mcpserverconfig): { bind: string; port: number; localhost: boolean } {
  const bind = config.bind !== undefined && config.bind.trim() !== "" ? config.bind.trim() : localhostbind;
  return { bind, port: config.port, localhost: bind === localhostbind || bind === "localhost" || bind === "::1" };
}

/** Launches the stdio bridge for one local client process through its native messaging host manifest; the host name is the manifest name and the process id rides the bridge record when the host reports it, because the browser itself never exposes the native host process id. The 1.1.95 hardening adds the client signature verification: a platform verifier that allows signature checks confirms the presented signature before the bridge connects, a failed signature refuses the bridge outright, and a platform without a verifier keeps the bridge unverified while the record says so. */
export function launchbridge(input: { host: string; pid?: number; now: number; id?: string; signature?: string; verifier?: (host: string, signature: string) => boolean }): stdiobridge {
  if (input.signature !== undefined && input.verifier !== undefined && !input.verifier(input.host, input.signature)) throw new Error(`The client signature of the ${input.host} bridge failed the platform verification; the local stdio bridge refuses the client and no frame relays.`);
  return { id: input.id ?? `bridge-${input.now}`, host: input.host, connected: true, ...(input.pid !== undefined ? { pid: input.pid } : {}), startedat: input.now, restarts: 0, received: 0, sent: 0, ...(input.signature !== undefined && input.verifier !== undefined ? { clientverified: input.verifier(input.host, input.signature) } : {}) };
}

/** Relays one frame between the local client process and the server: inbound frames arrive from the client wire, outbound frames return to it, and the bridge stamps its counters and the frame time. */
export function relayframe(input: { bridge: stdiobridge; direction: "inbound" | "outbound"; frame: jsonrpcframe; now: number }): stdiobridge {
  return { ...input.bridge, connected: true, received: input.bridge.received + (input.direction === "inbound" ? 1 : 0), sent: input.bridge.sent + (input.direction === "outbound" ? 1 : 0), lastframeat: input.now };
}

/** Restarts a dead client process on demand: the bridge reconnects under the new process id, counts the restart and keeps its relay counters. */
export function restartbridge(input: { bridge: stdiobridge; pid: number; now: number }): stdiobridge {
  return { ...input.bridge, connected: true, pid: input.pid, restarts: input.bridge.restarts + 1, startedat: input.now };
}

/** Emits one framed log line for local debugging: only the event, the time and scalar fields ride the line so params, results and payloads never leak into logs. */
export function framedlog(event: string, at: number, fields?: Record<string, string | number | boolean>): string {
  return JSON.stringify({ at, event, ...(fields ?? {}) });
}

/** Builds one mcp tool call record for the audit trail and the recent calls view: the client, the tool, the origin and the outcome without any payload; the 1.1.56 family adds the call id, the idempotency key and the dry run, mock, batch and replay markers. */
export function toolcallevent(input: { id: string; clientid: string; tool: string; origin: string; ok: boolean; now: number; code?: rpcerrorcode; callid?: string; idempotencykey?: string; dryrun?: boolean; mocked?: boolean; batchid?: string; replayed?: boolean }): toolcallrecord {
  return { id: input.id, clientid: input.clientid, tool: input.tool, origin: input.origin, ok: input.ok, ...(input.code !== undefined ? { code: input.code } : {}), at: input.now, ...(input.callid !== undefined ? { callid: input.callid } : {}), ...(input.idempotencykey !== undefined && input.idempotencykey.trim() !== "" ? { idempotencykey: input.idempotencykey } : {}), ...(input.dryrun === true ? { dryrun: true } : {}), ...(input.mocked === true ? { mocked: true } : {}), ...(input.batchid !== undefined ? { batchid: input.batchid } : {}), ...(input.replayed === true ? { replayed: true } : {}) };
}

