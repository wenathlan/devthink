import type { agentplan, agentsession, callcontext, capabilityset, clientrecord, jsonrpcframe, mcpserverconfig, methodentry, rpcerror, rpcerrorcode, stdiobridge, toolcatalog, toolcallrecord, toolnamespace, toolresult, toolstep, transportkind, allowlistentry, approvalrequest, auditevent, batchcall, batchoutcome, callratelimit, clientbinding, idempotencyrecord, progressnotice, prompttemplate, resourcewatch, samplingrequest, servehealth, servedresource, servetransport, streamchunk, structurederror, toolmock } from "./types.js";
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
import { composeenvelope } from "./bridge.js";
/**
 * Mcp server mode of the 1.1.84 family.
 * Every serve mode concern lives in this file: the serve entry that runs devthink as a model context protocol server over the stdio and http transports, the initialization with the capability negotiation and the server metadata that reports the mcp version alongside the server contract version, the client metadata of the initialize handshake that records the client name and version for the audit trail, the session bindings that pair one client with exactly one extension session so concurrent clients hold isolated sessions, the read only degradation when no origin grant covers the session, the exposed tool filtering by scopes and degradation so the serve never lists a tool the current grants do not cover, the health resource with its version and uptime, the shutdown drain that waits for the in flight calls before the exit, the plan progress events that reuse the server contract envelopes, the sampling frames that route generation requests back into the client model, the stream chunk and progress notifications of long calls, the mock, dry run, idempotency and batch dispatch composition, the allowlist and rate limit admission, the approval gated sensitive calls that block until the human answers, the audit entries that name the caller, the tool and the outcome, and the serve frame router with its extended method table.
 * The mode stays pure and shares the engine: the policy gates, the kind catalog, the memory store and the progress store ride through the same modules the extension surfaces use, execution flows through the injected execute seam so tests run on plain fixtures, and no port, window, ceiling, endpoint, provider or key is ever hardcoded.
 */
/** The serve method table of the mcp server mode: the protocol family methods beside the resource, prompt, batch and health surfaces the serve mode adds. */
export declare function servemethods(): methodentry[];
/** The server metadata of the serve mode: the mcp identity, the protocol version, the server contract version reported alongside it, the tool, resource and prompt counts and the instructions that state the consent model in plain language. */
export declare function servemetadata(input: {
    config: mcpserverconfig;
    catalog: toolcatalog;
    templates: prompttemplate[];
}): {
    serverinfo: capabilityset & {
        servercontractversion: number;
        resourcecount: number;
        promptcount: number;
    };
    protocolversion: string;
    servercontractversion: number;
    instructions: string;
};
/** Reads the client metadata of one initialize handshake: the client declares its name and version so the audit trail records exactly which build called. */
export declare function clientmetadataof(params: Record<string, unknown> | undefined): {
    name?: string;
    version?: string;
};
/** Stamps one client record with the declared client metadata: the name and version ride the record so every audit entry of its calls names the caller build. */
export declare function recordclientmetadata(client: clientrecord, metadata: {
    name?: string;
    version?: string;
}): clientrecord;
/** Completes the serve initialize handshake: the server metadata with the negotiated capability set and the client metadata recorded on the client record the caller persists. */
export declare function serveinitialize(input: {
    params?: Record<string, unknown>;
    config: mcpserverconfig;
    catalog: toolcatalog;
    templates: prompttemplate[];
}): {
    handshake: ReturnType<typeof servemetadata>;
    client: (client: clientrecord) => clientrecord;
};
/** Builds the transport endpoints of the serve mode: the stdio transport rides the process pipes while the http transport rides its own localhost bind with its own port, and both run at the same time on separate channels when the config allows both. */
export declare function transportendpoints(input: {
    config: mcpserverconfig;
    now: number;
}): servetransport[];
/** Starts the serve mode: the mcpmode gate must pass, the transports report their endpoints and the degradation gate decides the read only flag from the session grants; a refused gate reports its reason instead of a state. */
export declare function startserve(input: {
    config: mcpserverconfig;
    now: number;
    grants?: string[];
    origin?: string;
}): {
    state?: {
        state: "running";
        transports: servetransport[];
        startedat: number;
        degraded: boolean;
    };
    reason?: string;
};
/** The shutdown drain of the serve mode: the drain waits for the in flight calls before the exit — a stopped answer needs an empty in flight set or a drain window the user configured that elapsed. */
export declare function shutdowndrain(input: {
    inflight: callcontext[];
    drainstart?: number;
    now: number;
    window?: number;
}): {
    phase: "draining" | "stopped";
    waiting: number;
};
/** Builds the health resource of the serve mode: the extension version, the protocol version, the server contract version, the uptime and the serve state — no payload, origin or client identity rides the line. */
export declare function healthof(input: {
    startedat: number;
    now: number;
    state: string;
}): servehealth;
/** Binds one client to exactly one extension session: concurrent clients hold isolated sessions, the token id rides the binding when the pairing issued one, and the degradation gate decides the read only flag from the grants. */
export declare function bindclientsession(input: {
    clientid: string;
    sessionid: string;
    tokenid?: string;
    grants?: string[];
    origin?: string;
    now: number;
}): clientbinding;
/** Releases one client binding; the record stays for the audit trail with its release time. */
export declare function releasebinding(bindings: clientbinding[], clientid: string, now: number): clientbinding[];
/** True when every live binding names a distinct extension session so concurrent clients hold isolated sessions. */
export declare function isolatedsessions(bindings: clientbinding[]): boolean;
/** Filters the catalog to the tools the current grants cover: a degraded binding exposes the read only tools alone while the scopes narrow the namespaces the session token grants. */
export declare function exposedtools(catalog: toolcatalog, options?: {
    readonly?: boolean;
    scopes?: toolnamespace[];
}): toolcatalog;
/** Builds one plan progress event of the serve mode: the progress payload rides the server contract envelope of the eventpost operation so subscribed clients read the same envelope shape the bridge family streams, and the wire form is the newline terminated frame text the stream channel emits. */
export declare function planprogressevent(input: {
    stepid: string;
    status: string;
    sessionid?: string;
    sequence: number;
    at: number;
}): {
    envelope: ReturnType<typeof composeenvelope>;
    wire: string;
};
/** Builds the sampling request frame the serve mode sends to the client model: the prompt, the optional system text, the granted page content and the granted maximum tokens ride the request the client answers. */
export declare function samplingframe(input: {
    clientid: string;
    capabilities?: capabilityset;
    prompt: string;
    system?: string;
    pagecontent?: string;
    pagegrant?: boolean;
    maxtokens?: number;
    now: number;
}): {
    request?: samplingrequest;
    frame?: jsonrpcframe;
    reason?: string;
};
/** Builds the stream chunk notification frames of one progressive tool result so a client reads the partial results as they arrive. */
export declare function chunkframes(chunks: streamchunk[]): jsonrpcframe[];
/** Builds the progress notification frame of one long tool call with its cancel hint. */
export declare function progressframe(notice: progressnotice): jsonrpcframe;
/** Emits one stream chunk of a progressive result beside its notification frame. */
export declare function chunkof(input: {
    callid: string;
    seq: number;
    content: string;
    done?: boolean;
    now: number;
}): {
    chunk: streamchunk;
    frame: jsonrpcframe;
};
/** Emits one progress notice of a long call beside its notification frame. */
export declare function progressof(input: {
    callid: string;
    percent?: number;
    message: string;
    cancellable?: boolean;
    now: number;
}): {
    notice: progressnotice;
    frame: jsonrpcframe;
};
/** Builds the serve audit entry of one tool call: the caller client, the tool, the origin and the outcome without any payload. */
export declare function servecallevent(input: {
    client: clientrecord;
    tool: string;
    origin: string;
    ok: boolean;
    now: number;
    code?: rpcerrorcode;
    callid?: string;
    idempotencykey?: string;
    dryrun?: boolean;
    mocked?: boolean;
    batchid?: string;
    replayed?: boolean;
}): toolcallrecord;
/** Renders the audit line of one serve tool call: the caller name and version beside the tool, the origin and the outcome so the trail names the exact client build. */
export declare function auditline(record: toolcallrecord, client: clientrecord | undefined): string;
/** Wraps one tool result with the structured details the sidepanel steps read: the step id, kind, risk and summary ride the payload so a client reads the same evidence the panels render. */
export declare function stepdetails(step: toolstep, result: toolresult): toolresult;
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
export declare function dispatchcall(input: {
    params?: Record<string, unknown>;
    id?: number | string | null;
    client: clientrecord;
    catalog: toolcatalog;
    session?: agentsession;
    plan?: agentplan;
    origin: string;
    now: number;
    scopes?: toolnamespace[];
    readonly?: boolean;
    mocks?: toolmock[];
    idempotency?: idempotencyrecord[];
    idempotencywindow?: number;
    limits?: callratelimit[];
    allowlist?: allowlistentry[];
    approvals?: approvalrequest[];
    approvaltimeout?: number;
    contexts?: callcontext[];
    execute: (step: toolstep) => toolresult | Promise<toolresult>;
}): Promise<calloutcome>;
/** Resumes one approval gated call after the human answered: an approved gate executes the held step with its structured details while a refused or expired gate never executes. */
export declare function resumegatedcall(input: {
    approval: approvalrequest;
    client: clientrecord;
    catalog: toolcatalog;
    session?: agentsession;
    plan?: agentplan;
    origin: string;
    now: number;
    execute: (step: toolstep) => toolresult | Promise<toolresult>;
}): Promise<calloutcome>;
/** Runs one ordered batch of tool calls in a single request: every member dispatches through the caller composition while the stop on first error flag halts the batch at its first failure; the batch record grades through its members and lands with its per call outcomes. */
export declare function runcallsbatch(input: {
    calls: Array<{
        id: string;
        name: string;
        params: Record<string, unknown>;
    }>;
    client: clientrecord;
    now: number;
    stoponerror: boolean;
    execute: (call: {
        id: string;
        name: string;
        params: Record<string, unknown>;
    }, index: number) => Promise<{
        ok: boolean;
        result?: toolresult;
        error?: structurederror;
    }>;
}): Promise<{
    batch: batchcall;
    outcomes: batchoutcome[];
}>;
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
export declare function routeserveframe(input: {
    frame: jsonrpcframe;
    state: servesession;
    now: number;
    execute: (step: toolstep) => toolresult | Promise<toolresult>;
}): Promise<{
    response?: jsonrpcframe;
    notifications?: jsonrpcframe[];
    state: servesession;
}>;
/** Publishes one resource change of the serve session to its subscribers: every watcher of the resource receives its delta notification frame while the session keeps the updated watches. */
export declare function publishresourcechange(input: {
    state: servesession;
    uri: string;
    changed: Record<string, unknown>;
    now: number;
}): {
    notifications: jsonrpcframe[];
    state: servesession;
};
/** Builds one serve session over the default catalog and the empty stores: the caller threads the session through the frame router and persists the returned state. */
export declare function createservesession(input: {
    config: mcpserverconfig;
    client: clientrecord;
    templates?: prompttemplate[];
    session?: agentsession;
    plan?: agentplan;
    origin: string;
    now: number;
    catalog?: toolcatalog;
}): servesession;
/** Names the health resource of the served catalog so the serve route and the docs share one entry point. */
export declare function healthresourceof(): servedresource | undefined;
/**
 * Mcp server of the 1.1.54 and 1.1.55 agent protocol family.
 * Every server, transport and frame routing concern lives in this file: the json rpc frame grammar with newline delimited and http post envelopes, the parse and serialize round trips, the frame validation that rejects malformed ids, unknown methods and bad params, the rpc error codes with their json rpc number mapping, the initialize handshake with the server info, the ping keepalive, the tools/list report of every tool with its json schema inputs and full consent metadata, the capability negotiation over protocol version, tool compatibility floor and transports, the per client tool floor negotiation, the client records with their pairing state, the per client request queue serialization under the user configured depth, the consent gated tool dispatch that checks the namespace first so unknown tools fail fast and never bypasses review, the localhost bind with its documented default, the stdio bridge that launches through the native messaging host manifest, relays frames in both directions and restarts a dead client process, and the framed logs that never leak payloads.
 * The server stays pure: execution flows through the injected execute seam so tests run on plain fixtures, the frame size and queue depth stay user configured with no code ceiling, and no endpoint, provider or key is ever hardcoded.
 */
/** The documented default bind address of the http listener: localhost only. */
export declare const localhostbind = "127.0.0.1";
/** The documented default port of the http listener; any user configured port wins. */
export declare const defaultmcpport = 7436;
/** The json rpc error numbers of the agent protocol: parse, method, params and internal keep the classic json rpc codes while consentrefused reserves -32001 for gate refusals. */
export declare const rpcerrornumbers: Record<rpcerrorcode, number>;
/** Builds one rpc error payload from its code name and message. */
export declare function rpcerrorof(code: rpcerrorcode, message: string, data?: unknown): rpcerror;
/** Maps one json rpc error number back to its agent protocol code name; classic numbers the protocol does not use stay undefined. */
export declare function rpcerrorcodeof(number: number): rpcerrorcode | undefined;
/** The user configured default server config: localhost bind, the documented default port, both transports allowed and the server off until the user enables it. */
export declare function defaultmcpconfig(): mcpserverconfig;
/** Parses one raw json rpc frame from the wire, bare or wrapped in an http post envelope; malformed json throws so the caller answers with the parse error. */
export declare function parseframe(raw: string): jsonrpcframe;
/** Parses a newline delimited wire block into its frames; empty lines carry no frame. */
export declare function parsewire(raw: string): jsonrpcframe[];
/** Serializes one frame to its compact json rpc wire form. */
export declare function serializeframe(frame: jsonrpcframe): string;
/** Serializes one frame for the requested wire format: newline delimited blocks end in one newline while http post envelopes wrap the frame for a posted body. */
export declare function wireformat(frame: jsonrpcframe, format: "newline" | "httppost"): string;
/** Validates one request frame against the routing table: the jsonrpc tag, well formed ids, known methods, object params and the user configured frame size; a clean frame returns undefined. */
export declare function validateframe(frame: jsonrpcframe, methods: methodentry[], config?: mcpserverconfig): rpcerror | undefined;
/** Builds one response frame that answers the request id with either a result or an error; error frames without an id answer null so the client can correlate the failure. */
export declare function respond(input: {
    id?: number | string | null;
    result?: unknown;
    error?: rpcerror;
}): jsonrpcframe;
/** The mcp server routing table: every json rpc method with its plain language description and the internal handler its frames route to; the 1.1.56 family adds the prompt tools and the in flight cancellation. */
export declare function servermethods(): methodentry[];
/** Builds the capability set the server offers: the protocol version, the server identity, the tool compatibility floor, the tool count, the namespaces and the allowed transports. */
export declare function servercapabilities(input: {
    config: mcpserverconfig;
    catalog: toolcatalog;
}): capabilityset;
/** Completes the mcp handshake: the server info, the protocol version the server speaks, the frozen protocolv2 major a new client answers as its default wire line and the instructions that state the consent model in plain language. */
export declare function initialize(input: {
    params?: Record<string, unknown>;
    config: mcpserverconfig;
    catalog: toolcatalog;
}): {
    serverinfo: capabilityset;
    protocolversion: string;
    protocolmajor: number;
    instructions: string;
};
/** Answers one keepalive frame with pong. */
export declare function ping(input: {
    now: number;
}): {
    pong: true;
    at: number;
};
/** Lists every tool of the catalog with its version, its json schema inputs, its risk grade and the full consent metadata of tools with side effects: the review requirement, the policy derived risk class, the approval gate requirement and the session origin scope. */
export declare function listtools(catalog: toolcatalog): {
    tools: Array<{
        name: string;
        version: number;
        description: string;
        inputschema: toolcatalog["domains"][number]["tools"][number]["inputschema"];
        risk: string;
        consentmeta?: {
            review: string;
            riskclass: string;
            approvalrequired: boolean;
            originscope: string;
        };
    }>;
};
/** Collects the unknown top level fields of one wire frame: every key outside the json rpc grammar of jsonrpc, id, method, params, result and error names an unknown field the strict protocolv2 mode refuses before dispatch. */
export declare function unknownframefields(frame: jsonrpcframe): string[];
/** Reads the negotiated protocol major of one client: the client capability set declares the numeric protocolmajor and a client that declares nothing answers the protocolv2 default of two, so the strict schema modes follow the negotiated line. The deprecated full version string the version one clients exchanged left the capability set at the 2.0.0 sunset: the string form parses nowhere and a client that still sends it answers the strict refusal through the schema layer, never a negotiated major. */
export declare function clientprotocolmajor(client: clientrecord): number;
/** Exchanges capability sets with one client: protocol version, tool compatibility floor and transports must agree or the negotiation reports the mismatch; the 1.1.91 api freeze negotiates the protocol major as the 2.0.0 sunset left it — a client that declares nothing answers the frozen major two, the capability set declares the numeric protocolmajor (the deprecated full version string the version one clients exchanged left the wire at the sunset and parses nowhere), a major below the supported floor refuses with the migration path inside the mismatch, and a major above the supported range reports its mismatch with the supported range in plain language; the agreed set carries the negotiated floor. */
export declare function negotiate(input: {
    client?: Partial<capabilityset>;
    server: capabilityset;
}): {
    agreed: boolean;
    mismatch?: string;
    capabilities?: capabilityset;
    protocolmajor?: number;
    deprecation?: string;
};
/** Registers one connected client per transport; every client starts unpaired and waits for the user pairing approval. */
export declare function connectclient(input: {
    transport: transportkind;
    now: number;
    id?: string;
}): clientrecord;
/** Applies one pairing decision: approval pairs the client while refusal leaves it unpaired and disconnected; already disconnected clients stay untouched. */
export declare function pairclient(clients: clientrecord[], id: string, approved: boolean, now: number): clientrecord[];
/** Disconnects one client on demand; the record stays for the audit trail with its disconnect time. */
export declare function disconnectclient(clients: clientrecord[], id: string, now: number): clientrecord[];
/** Enqueues one request frame for a client; frames serialize per client in arrival order and the user configured depth refuses the frame that would exceed it while an absent depth keeps the queue unbounded. */
export declare function enqueuerequest(input: {
    queue: jsonrpcframe[];
    frame: jsonrpcframe;
    depth?: number;
}): jsonrpcframe[] | undefined;
/** Pops the next request frame of one client queue; an empty queue returns undefined. */
export declare function nextrequest(queue: jsonrpcframe[]): {
    frame: jsonrpcframe;
    remaining: jsonrpcframe[];
} | undefined;
/** Negotiates the tool compatibility floor with one client: the client declares the highest floor it can parse and the catalog must satisfy it, so the negotiated floor is the client floor while a floor above the catalog version reports its mismatch in plain language. */
export declare function negotiatetoolfloor(clientfloor: number | undefined, catalogversion: number): {
    floor: number;
} | {
    mismatch: string;
};
/** Dispatches one tool call behind the consent gates: the namespace check runs first so unknown tools fail fast, then the client must be paired, the session live, the plan approved, the origin inside the session grants and the tool version at or above the negotiated floor; read only tools run under the dryrun risk class while every tool with side effects executes exactly the approved plan step it names. */
export declare function dispatchtool(input: {
    params?: Record<string, unknown>;
    client: clientrecord;
    catalog: toolcatalog;
    session?: agentsession;
    plan?: agentplan;
    origin: string;
    now: number;
    scopes?: toolnamespace[];
    execute: (step: toolstep) => toolresult | Promise<toolresult>;
}): Promise<{
    result?: toolresult;
    error?: rpcerror;
    step?: toolstep;
}>;
/** Parses, validates and routes one json rpc frame: parse failures answer with the parse error, validation failures echo the same id with their error, and clean frames reach the handler the routing table names — the 1.1.56 family routes the prompt tool listing, the prompt rendering and the in flight cancellation while the stateful subscription, resource, sampling and batch methods route through the frame intake with their persisted state; every response keeps the request id. */
export declare function handleframe(input: {
    raw?: string;
    frame?: jsonrpcframe;
    client: clientrecord;
    catalog: toolcatalog;
    config: mcpserverconfig;
    session?: agentsession;
    plan?: agentplan;
    origin: string;
    tabid: number;
    now: number;
    scopes?: toolnamespace[];
    contexts?: callcontext[];
    execute: (step: toolstep) => toolresult | Promise<toolresult>;
}): Promise<jsonrpcframe>;
/** Normalizes the http listener bind of one server config: an absent bind keeps the documented localhost default and the report states whether the bind stays local. */
export declare function bindlocalhost(config: mcpserverconfig): {
    bind: string;
    port: number;
    localhost: boolean;
};
/** Launches the stdio bridge for one local client process through its native messaging host manifest; the host name is the manifest name and the process id rides the bridge record when the host reports it, because the browser itself never exposes the native host process id. The 1.1.95 hardening adds the client signature verification: a platform verifier that allows signature checks confirms the presented signature before the bridge connects, a failed signature refuses the bridge outright, and a platform without a verifier keeps the bridge unverified while the record says so. */
export declare function launchbridge(input: {
    host: string;
    pid?: number;
    now: number;
    id?: string;
    signature?: string;
    verifier?: (host: string, signature: string) => boolean;
}): stdiobridge;
/** Relays one frame between the local client process and the server: inbound frames arrive from the client wire, outbound frames return to it, and the bridge stamps its counters and the frame time. */
export declare function relayframe(input: {
    bridge: stdiobridge;
    direction: "inbound" | "outbound";
    frame: jsonrpcframe;
    now: number;
}): stdiobridge;
/** Restarts a dead client process on demand: the bridge reconnects under the new process id, counts the restart and keeps its relay counters. */
export declare function restartbridge(input: {
    bridge: stdiobridge;
    pid: number;
    now: number;
}): stdiobridge;
/** Emits one framed log line for local debugging: only the event, the time and scalar fields ride the line so params, results and payloads never leak into logs. */
export declare function framedlog(event: string, at: number, fields?: Record<string, string | number | boolean>): string;
/** Builds one mcp tool call record for the audit trail and the recent calls view: the client, the tool, the origin and the outcome without any payload; the 1.1.56 family adds the call id, the idempotency key and the dry run, mock, batch and replay markers. */
export declare function toolcallevent(input: {
    id: string;
    clientid: string;
    tool: string;
    origin: string;
    ok: boolean;
    now: number;
    code?: rpcerrorcode;
    callid?: string;
    idempotencykey?: string;
    dryrun?: boolean;
    mocked?: boolean;
    batchid?: string;
    replayed?: boolean;
}): toolcallrecord;
//# sourceMappingURL=mcp.d.ts.map