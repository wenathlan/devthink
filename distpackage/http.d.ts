/** The http module of the 1.1.88 consolidation: every correlated variation of the http logic interned in this one file, so the module family carries one surface without duplicate variations. */
import type { endpointrecord, fetchrequest, fetchoptions, graphqlrequest, htmlquery, jsonpathrule, parsedfield, payloadschema, streamwindow, jsonrpcframe, mcpserverconfig, sessiontoken, tlsconfig, transportkind, allowlistentry, clientrecord, httpstreamconfig, rpcerror, streamchannel, relayserverstate, relayserversession, serverenvelope } from "./types.js";
/**
 * Network observation part one logics for the 1.1.42 family.
 * Every correlated rule for the outbound fetch with timeout, retries, backoff and the redirect follow limit, the streamed reading of large bodies inside a byte budget, the dotted json path extraction, the html query evaluation over a parse seam, the typed rest call with payload schemas and url templating and the graphql envelope wrapping and unwrapping lives in this file.
 * Header values and body bytes never enter any audit summary built from these results.
 */
/** The network observation kinds, listed among the available capabilities of every proposal request. */
export declare const httpkinds: string[];
/** One transport response as the seam reports it: status, response headers, body text and redirect facts. */
export interface transportresponse {
    status: number;
    headers: Record<string, string>;
    body: string;
    /** Location of a readable redirect response, when the transport exposes one. */
    location?: string;
    redirected?: boolean;
}
/** Transport seam signature: one reviewed request against one url; the extension executor wires the browser fetch, tests wire plain fixtures. */
export type fetchtransport = (url: string, init: {
    method: string;
    headers: Record<string, string>;
    body?: string;
    mode?: string;
    redirect: "follow" | "error";
}) => Promise<transportresponse>;
/** Transport facts of one completed outbound request: status, response header names, body, byte size, duration, retries and redirect hops. */
export interface calltransport {
    url: string;
    status: number;
    statusclass: string;
    headernames: string[];
    body: string;
    bytes: number;
    duration: number;
    retries: number;
    redirects: number;
}
/** Maps one response status to its reviewed status class: informational, success, redirect, clienterror, servererror or unknown. */
export declare function statusclassof(status: number): "informational" | "success" | "redirect" | "clienterror" | "servererror" | "unknown";
/** Interpolates a reviewed url template by replacing every {variable} with the reviewed payload value of that name. */
export declare function templateurl(template: string, values: Record<string, unknown>): string;
/** Normalizes a reviewed fetch request value: url, method, custom header allowlist, body and mode; unknown fields stay ignored. */
export declare function fetchrequestof(value: unknown): fetchrequest | undefined;
/** Normalizes reviewed fetch policy options: timeout, retries, backoff base and redirect follow limit stay user choices with no code ceiling. */
export declare function fetchoptionsof(value: unknown): fetchoptions;
/** Normalizes a reviewed stream window: the byte budget ceiling stays a user choice. */
export declare function streamwindowof(value: unknown): streamwindow;
/** Normalizes reviewed json path rules: every rule needs a field name and a dotted path; kind and default stay optional. */
export declare function jsonpathrulesof(value: unknown): jsonpathrule[];
/** Normalizes reviewed html queries: selector, optional attribute and the multi flag for all matches versus the first. */
export declare function htmlqueriesof(value: unknown): htmlquery[];
/** Normalizes a reviewed graphql request: operation text, operation kind, variables and operation name. */
export declare function graphqlrequestof(value: unknown): graphqlrequest | undefined;
/**
 * Sends one reviewed outbound request through the transport seam with the reviewed timeout, retries, backoff and redirect follow limit.
 * Every bound stays a reviewed choice: the timeout races each attempt, failed attempts wait backoff times the attempt number before the retry, and redirect hops beyond the follow limit refuse instead of following.
 */
export declare function sendfetch(input: {
    request: fetchrequest;
    options?: fetchoptions;
    transport: fetchtransport;
    sleep?: (milliseconds: number) => Promise<void>;
    onretry?: (attempt: number, wait: number, reason: string) => void;
    now?: () => number;
}): Promise<calltransport>;
/**
 * Consumes a large response body in chunks inside the reviewed stream window: every chunk passes the reviewed handler path, the byte budget aborts past the ceiling and the abort flag stops the stream cleanly between chunks.
 */
export declare function readstream(input: {
    chunks: string[] | (() => Promise<string | undefined>);
    window: streamwindow;
}): Promise<{
    chunks: number;
    bytes: number;
    aborted: boolean;
    reason?: string;
}>;
/**
 * Extracts named fields from one parsed json body by dotted paths: array indexes use numeric segments, a miss fills the reviewed default and reports the miss instead of crashing, and every value carries its reviewed kind.
 */
export declare function readpath(parsed: unknown, rules: jsonpathrule[]): parsedfield[];
/** One element match of an html query as the parse seam reports it: text content plus attribute values. */
export interface htmlmatch {
    text: string;
    attributes: Record<string, string>;
}
/** The parsed document seam: one query function over fetched markup; the page bridge supplies the real domparser. */
export interface parseddocument {
    query(selector: string): htmlmatch[];
}
/** Parse seam signature: turns fetched markup into a queryable document. */
export type domparse = (markup: string) => parseddocument;
/** Result of one reviewed html query: attribute values or text, the element count and the multi flag. */
export interface htmlqueryresult {
    selector: string;
    attribute?: string;
    multi: boolean;
    count: number;
    values: string[];
}
/**
 * Parses fetched markup through the parse seam and runs the reviewed html queries: every query returns attribute values or text plus the element count, and the multi flag widens the first match to every match.
 */
export declare function parsehtmlbody(input: {
    body: string;
    queries: htmlquery[];
    parse?: domparse;
}): htmlqueryresult[];
/** Validates one reviewed payload against an endpoint payload schema: every required field must be present with its kind; extra fields pass through as reviewed values. */
export declare function payloadvalid(payload: Record<string, unknown>, schema: payloadschema | undefined): {
    ok: boolean;
    errors: string[];
};
/** Applies the schema defaults to one reviewed payload: missing optional fields gain their reviewed default values. */
export declare function payloadwithdefaults(payload: Record<string, unknown>, schema: payloadschema | undefined): Record<string, unknown>;
/**
 * Executes one typed rest endpoint call: the payload validates against the endpoint payload schema, the url templates its variables from the reviewed values, the reviewed success status list (or the two hundred class by default) maps the response code to the step outcome and json error bodies parse into structured errors.
 */
export declare function callrest(input: {
    endpoint: endpointrecord;
    payload: Record<string, unknown>;
    options?: fetchoptions;
    transport: fetchtransport;
    success?: number[];
    sleep?: (milliseconds: number) => Promise<void>;
    onretry?: (attempt: number, wait: number, reason: string) => void;
    now?: () => number;
}): Promise<{
    transport: calltransport;
    url: string;
    payload: Record<string, unknown>;
    ok: boolean;
    errors: string[];
}>;
/** Wraps one reviewed graphql request into the request body envelope with the operation text, the variables and the operation name. */
export declare function graphqlopenvelope(request: graphqlrequest): string;
/** Unwraps a graphql response into its data block and every returned error mapped to a plain string. */
export declare function unwrapgraphql(value: unknown): {
    data?: unknown;
    errors: string[];
};
/**
 * Executes one reviewed graphql query or mutation against a typed endpoint: the operation wraps with its variables and operation name, and the response unwraps its data block while every returned error maps into the step result details.
 */
export declare function callgraphql(input: {
    endpoint: endpointrecord;
    request: graphqlrequest;
    options?: fetchoptions;
    transport: fetchtransport;
    sleep?: (milliseconds: number) => Promise<void>;
    onretry?: (attempt: number, wait: number, reason: string) => void;
    now?: () => number;
}): Promise<{
    transport: calltransport;
    data?: unknown;
    errors: string[];
}>;
/**
 * Http transport of the 1.1.84 mcp server mode.
 * Every streamable http concern lives in this file: the localhost bind with its documented default and the reviewed remote bind behind the explicit review, the posted envelope intake that parses one posted json rpc message — a bare frame or a batch — through the same frame pipeline the remote family owns, the server sent event frames of the stream channel with their event ids so a client resumes after a reconnect, the tls decision that turns on exactly when the user provides a certificate while an unverified peer refuses under the required mode, and the auth handshake requirement that keeps every non localhost connection behind the token exchange while localhost stays direct.
 * The transport stays pure: the node listener reaches it through injected seams only, the bind, the port, the endpoint path and the tls material stay user choices with no code default beyond the documented localhost bind, and no certificate, endpoint or provider is ever hardcoded.
 */
/** Builds the http transport endpoint record of one server config: the bind with its port, the localhost state and the posted endpoint path the streamable transport serves. */
export declare function httpendpoint(config: mcpserverconfig): {
    kind: transportkind;
    endpoint: string;
    bind: string;
    port: number;
    localhost: boolean;
    path: string;
};
/** Decides the tls termination of one http transport: the transport speaks tls exactly when the user provides a certificate, the presented fingerprint must match the reviewed one under the required mode and an unverified peer refuses while the off mode keeps the plain localhost listener. */
export declare function tlsdecision(input: {
    config: tlsconfig;
    presented?: {
        fingerprint?: string;
    };
    now: number;
}): {
    tls: boolean;
    verified: boolean;
    reason?: string;
};
/** Requires the auth handshake of one posted frame: a localhost connection stays direct while any non localhost connection must present a verified session token through the same pipeline the remote family owns — the pipeline answers the refusal error the listener returns. */
export declare function postauth(input: {
    config: mcpserverconfig;
    local: boolean;
    tokens: sessiontoken[];
    rawtoken?: string;
    fingerprint?: string;
    toolname?: string;
    now: number;
}): Promise<{
    error?: {
        code: string;
        message: string;
        retryhint: "retry" | "wait" | "none";
    };
    token?: sessiontoken;
}>;
/** Parses one posted body into its wire message: a bare frame parses as itself, an array parses as a batch and anything else refuses with the parse error the listener answers. */
export declare function parsepost(body: string): {
    message?: jsonrpcframe | jsonrpcframe[];
    error?: {
        code: string;
        message: string;
    };
};
/** Encodes the http answer of one handled frame: the json body the post returns with its newline terminator so a line reader consumes it too. */
export declare function httpanswer(frame: jsonrpcframe): string;
/** Formats one server sent event of the stream channel: the event id the client resumes after, the event name and the json data line pair; the id advances with every event the channel emits. */
export declare function sseframe(input: {
    id: number;
    event: string;
    frame: jsonrpcframe;
}): string;
/** Builds the stream channel endpoint record of one server config: the stream path beside the posted endpoint, on the same localhost bind and port while the channel rides its own path. */
export declare function streampathof(config: mcpserverconfig): {
    path: string;
    bind: string;
    port: number;
    localhost: boolean;
};
/** Answers whether one requested path is the posted endpoint or the stream channel of the configured transport; any other path refuses with the method error. */
export declare function routepath(config: mcpserverconfig, path: string): "endpoint" | "stream" | undefined;
/** The documented bind of the http listener: localhost only, kept beside the transport so the serve state and the docs share one name. */
export declare const documentedbind = "127.0.0.1";
/**
 * Http stream transport of the 1.1.55 agent protocol part two.
 * Every remote transport concern lives in this file: the http stream config with the posted json rpc endpoint and the server sent event channel paths, the stream channels the server keeps open for client streams, the heartbeat rhythm that keeps idle channels alive and closes dead ones, the tls termination that requires valid certificates before any remote traffic, the user configured client ceiling, the remote status report of endpoint, tls and client counts, and the ordered frame pipeline that terminates tls first, verifies the session token on every frame, checks the allowlist and runs the namespace scope check before any consent gate — auth failures answer with one fixed json rpc error so the pairing state never leaks.
 * The transport stays honest: the browser runtime exposes no listening socket, so the frame intake rides the same seam as the stdio bridge while the endpoint, tls mode, heartbeat and ceiling all stay user configured with no code ceiling and no hardcoded endpoint or certificate.
 */
/** The documented default heartbeat interval of the event channels; any user configured rhythm wins. */
export declare const defaultheartbeatms = 30000;
/** The documented default idle window after which a silent channel counts as dead; any user configured window wins. */
export declare const defaultidlewindowms = 90000;
/** The documented default http stream config: the posted json rpc endpoint path, the server sent event channel path, tls off for the localhost default and the documented heartbeat rhythm. */
export declare function defaulthttpstream(): httpstreamconfig;
/** Opens one server sent event channel for a remote client stream: the open and first heartbeat times ride the record. */
export declare function openstreamchannel(input: {
    clientid: string;
    now: number;
    id?: string;
}): streamchannel;
/** Stamps one heartbeat on every open channel of a client so idle channels stay alive. */
export declare function heartbeat(input: {
    channels: streamchannel[];
    clientid: string;
    now: number;
}): streamchannel[];
/** Reports whether one channel stays live: an open channel inside its idle window counts as alive while closed channels and silent ones past the window count as dead. */
export declare function channellive(channel: streamchannel, now: number, idlewindow?: number): boolean;
/** Closes every dead channel: silent channels past the user configured idle window close while live channels stay open. */
export declare function closeidlechannels(input: {
    channels: streamchannel[];
    now: number;
    idlewindow?: number;
}): streamchannel[];
/** Terminates tls before any remote traffic: the off mode keeps the documented localhost default, the on mode negotiates while the required mode refuses any peer without a valid certificate that matches the user configured fingerprint. */
export declare function starttls(input: {
    config: tlsconfig;
    presented?: {
        fingerprint?: string;
    };
    now: number;
}): {
    tls: boolean;
    verified: boolean;
    reason?: string;
};
/** Enforces the user configured client ceiling: a configured maximum refuses connections past it while an absent value keeps the client count unbounded. */
export declare function enforcemaxclients(input: {
    clients: clientrecord[];
    maxclients?: number;
}): {
    allowed: boolean;
    reason?: string;
};
/** Reports the remote transport status: the advertised endpoint, the tls state, the client counts, the open and dead stream channels and the live token count. */
export declare function listremotestatus(input: {
    config: mcpserverconfig;
    channels: streamchannel[];
    clients: clientrecord[];
    tokens: sessiontoken[];
    now: number;
}): {
    endpoint: string;
    tls: {
        mode: string;
        certificaterequired: boolean;
        verified: boolean;
    };
    clients: number;
    paired: number;
    channelsopen: number;
    channelsdead: number;
    tokenslive: number;
};
/**
 * Runs the ordered intake pipeline of one remote frame: tls terminates first, the session token verifies on every frame, the allowlist refuses unknown fingerprints and the namespace scope check runs before any consent gate so unknown tools fail fast.
 * A clean frame returns the verified token; every failure returns its json rpc error while auth failures answer with the fixed message that leaks no pairing state.
 */
export declare function httpframepipeline(input: {
    config: mcpserverconfig;
    presented?: {
        fingerprint?: string;
    };
    tokens: sessiontoken[];
    rawtoken?: string;
    allowlist: allowlistentry[];
    fingerprint: string;
    toolname?: string;
    now: number;
}): Promise<{
    error?: rpcerror;
    token?: sessiontoken;
}>;
/**
 * Relayserve of the 1.1.87 self hosting family.
 * Every server side relay concern of the publishing pipeline lives in this one pure module: the session state machine a self hosted relay drives for the extension and the site members, the pairing code exchange the extension side registers and the site side redeems, the per frame token authentication (the relay issues one token per member, keeps the hash in the session records and rotates the token on every rejoin — the raw token lives only in the memory-only issuance map so the routed frames address their member and no log or record ever carries it), the event routing between the two members of a session over the four servercontract operations, the idle sweep that closes a quiet connection inside the window the operator chose, and the deterministic reply list the runner writes back onto its sockets. The module stays pure: the wire frames reach it as text through injected seams, the ids and the token hashes come from injected seams (the container runner injects crypto randomness, tests inject counters), the relay never names an endpoint of its own because the operator hosts it at the address they choose, and no pairing code, token or page content ever enters an error message it builds.
 * Example: `const outcome = relayserverframe({ state, connectionid: "conn-1", frame: text, now }); const routed = outcome.routed;`
 */
/** The id seam signature: one call resolves the next opaque id (a session id, a token or a pairing code); the container runner injects crypto randomness while the tests inject deterministic counters. */
export type relayidseam = () => string;
/** The hash seam signature: the relay hashes every token it issues so the session records keep the hash only; the container runner injects the sha256 digest, the tests inject the plain identity. */
export type relayhashseam = (token: string) => string;
/** Creates the empty relay server state: no session, no pairing, no connection and no token — the runner registers connections as its sockets open. */
export declare function newrelayserverstate(): relayserverstate;
/** Registers one connection the relay accepted: the connection starts with no role, no session and no token; the frame handler fills them as the servercontract handshake proceeds. */
export declare function relayconnectionopen(state: relayserverstate, connectionid: string, now: number): relayserverstate;
/** Removes one connection the relay lost: the session keeps its event log, the member slot frees for a rejoin, the memory-only token record of the connection drops with it and the pairing codes stay pending until they expire. */
export declare function relayconnectionclose(state: relayserverstate, connectionid: string): relayserverstate;
/** Reads the live token hashes of one session: the hashes the session issued minus the revoked ones — the frame authentication checks every incoming token against this list. */
export declare function relaylivetokens(session: relayserversession): string[];
/** Encodes one envelope as the wire frame text the runner writes onto the socket: the plain json text of the servercontract codec. */
export declare function relayframeof(envelope: Omit<serverenvelope, "version"> & {
    version?: number;
}): string;
/** Handles one wire frame of one connection: the frame parses through the servercontract codec, the sessioncreate operation opens a session for the extension member (issuing its token and registering the pairing code when the frame carries one), the sessionjoin operation redeems a pairing code for the site member or rotates the token of a returning member, the eventpost operation routes the event to the other member of the session, and the eventstream operation acks the subscription — every other frame answers the outside the contract error and a failed token authentication answers the refusal without touching the session state. */
export declare function relayserverframe(input: {
    state: relayserverstate;
    connectionid: string;
    frame: string;
    now: number;
    idof?: relayidseam;
    hashof?: relayhashseam;
}): {
    state: relayserverstate;
    replies: string[];
    routed: Array<{
        connectionid: string;
        frame: string;
    }>;
};
/** Lists the connection ids the idle sweep closes: a connection quiet past the window the operator chose leaves, while an absent window never expires a connection because the bound stays the operator's choice. */
export declare function relayidleconnections(state: relayserverstate, now: number, idlewindow?: number): string[];
/** Reads the pairing codes pending redemption: the codes the extension side registered, still unused and still inside their lifetime — the list the self hosting walkthrough prints so the operator pairs the site side. */
export declare function relaypendingpairings(state: relayserverstate, now: number): string[];
/**
 * Stdio transport of the 1.1.84 mcp server mode.
 * Every stdio wire concern lives in this file: the frame boundary handling that splits the raw stdin bytes into newline delimited json lines while a partial tail stays buffered until its newline arrives, the line pump a local client rides — every decoded message routes through the injected handler seam and every response frame encodes back to stdout through the injected write seam while notifications stay unanswered — the transport counters that mirror the frames both directions, and the transport record the serve state reports.
 * The transport stays pure: the process pipes reach it through the injected read and write seams only, the handler seam carries the serve frame router, and no client process, host name or endpoint is ever hardcoded — the user launches the local client and its stdio wires the two together.
 */
/** One stdio transport record of the serve mode: the pipe channel it rides, the frame counters of both directions and the lifecycle times. */
export interface stdiotransportrecord {
    kind: "stdio";
    endpoint: string;
    startedat: number;
    received: number;
    sent: number;
    lastframeat?: number;
    closedat?: number;
}
/** Splits one raw stdin chunk into its complete newline delimited lines: every complete line parses while a trailing fragment without its newline stays buffered for the next chunk; a buffer without a newline yields no line. */
export declare function splitlines(buffer: string): {
    lines: string[];
    rest: string;
};
/** Creates one stdio transport record for the serve state: the pipe channel of the spawned serve process with its frame counters at zero. */
export declare function stdiotransport(now: number): stdiotransportrecord;
/** Creates the line pump of one stdio session: raw stdin chunks feed the pump, complete lines decode through the message codec, every frame of the decoded message routes through the handler seam and every response frame encodes newline delimited back through the write seam — notifications carry no id and stay unanswered while a handler that throws answers the internal error frame so a failing frame never kills the transport. */
export declare function createlinepump(input: {
    write: (line: string) => void;
    handle: (frame: jsonrpcframe) => Promise<jsonrpcframe | undefined>;
    now: number;
}): {
    feed: (chunk: string) => Promise<void>;
    record: () => stdiotransportrecord;
    close: (now: number) => stdiotransportrecord;
};
//# sourceMappingURL=http.d.ts.map