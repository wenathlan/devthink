import type { apikeyref, baseurlconfig, costbudget, costestimate, gatewaychatstate, gatewayerror, gatewaychattoken, gatewaykind, gatewaymodelinfo, localmodelconfig, modelcacherecord, modelmessage, modeloutput, modelroute, parseguard, prompttemplate, providerconfig, secretvaultentry, tokenstream, tooldef, usagerecord, apicallrecord, cacheentry, correlationcontext, eventsubscription, formpayload, graphqlsubscription, longpollrequest, multipartfield, multipartpayload, pollcursor, ratelimitdirective, webextensionbrowser, webextensionapientry, webextensionapikind, apimapreport, apimapresolution, apimapbrowserprobe, apimapstructerror, apibrowserprobeinput } from "./types.js";
import { buildrequest, type modelusage } from "./llm.js";
import type { fetchtransport } from "./http.js";
/**
 * Provider gateway logics of the 1.1.83 family.
 * Every provider adapter concern lives in this file: the adapter interface one request, stream and cancel contract shares, the four adapters (the openaicompat chat completions shape with its streamed deltas, the anthropicgateway messages shape with its streamed content blocks and its system prompt mapping, the geminigateway generate content shape with its streamed candidate parts and its tool schema mapping, and the ollamalocal localhost runtime with its local model listing), the baseurlconfig one endpoint url per provider with its scheme, host and path shape validation, the per provider key vault behind the secretvault seam, the modellist discovery with its configurable cache window, the capabilityad tool catalog advertisement, the routing of task kinds onto providers with the local fallback, the token budget accounting with its warning threshold, the guardrails over every parsed model answer with the structured retry prompt and the capped retries, and the prompt template library of the per task templates with their variable slots.
 * The module composes with the llm provider model instead of duplicating it: the three remote adapters speak through the same request shaping, answer parsing and stream parsing the llm module owns, while the ollamalocal adapter speaks its own localhost wire format. Nothing is hardcoded: no remote endpoint, no model name and no key ever leaves the user configuration, the ollamalocal adapter alone defaults to the localhost machine and never to a cloud url, every timeout, retry, backoff and cache window stays a user choice, all http rides the injected fetch transport seam and every key resolves through the vault seam at the last possible moment.
 */
/** The local machine base url the ollamalocal adapter alone defaults to: a loopback address of the machine itself, never a cloud url — the explicit contract exception, while every remote provider ships an empty base url until the user configures one. */
export declare const ollamalocaldefault = "http://localhost:11434";
/** The provider kinds of the gateway family in their stable order; every surface that lists the adapters reads this one list. */
export declare const gatewaykinds: gatewaykind[];
/** Reads the default base url of one provider kind: the ollamalocal runtime alone carries the localhost machine default and every remote kind carries none, so no provider endpoint is contacted unless the user configured one. */
export declare function defaultbaseurl(kind: gatewaykind): string;
/** Joins the user configured base url, the optional per provider path prefix and the wire path of the adapter into the request url; the base keeps its trailing shape and the prefix sits between the base and the wire path. The slash trims run through plain character walks, because a leading or trailing slash regex would itself read as polynomial on adversarial bases. */
export declare function gatewayurl(config: Pick<baseurlconfig, "baseurl" | "pathprefix">, path: string): string;
/** The input every adapter shapes into one wire request: the provider config, the model, the conversation, the resolved key material, the sampling choices, the stream flag, the tool catalog the capabilityad advertises and the extra headers the user reviewed. */
export interface gatewayrequestinput {
    config: baseurlconfig;
    model: string;
    messages: modelmessage[];
    /** Resolved key material; the value reaches the wire headers only and never a log, an audit entry or an export. */
    apikey?: string;
    temperature?: number;
    maxtokens?: number;
    stream?: boolean;
    /** The tool catalog the request advertises through the capabilityad serialization of the adapter. */
    tools?: tooldef[];
    headers?: Record<string, string>;
}
/** The provider adapter contract: every adapter builds its wire request, parses one answer body, parses one streamed body into ordered tokens, lists its models and serializes the tool catalog in its own wire format — one request, stream and cancel contract shared by all four. */
export interface gatewayadapter {
    readonly kind: gatewaykind;
    /** The protocol style of the llm provider model this adapter extends, when it speaks one of them; the ollamalocal runtime speaks its own localhost wire format and carries none. */
    readonly style?: "chatcompletions" | "messages" | "gemini";
    /** The wire path of the chat endpoint relative to the base url; the gemini shape rides its model in the path. */
    chatpath(model: string): string;
    /** The wire path of the model list endpoint relative to the base url. */
    modelspath(): string;
    /** Builds one wire request: the url, the method, the headers with the key placed where the shape expects it and the body envelope the shape speaks, with the tool catalog embedded in the provider format when the request carries one. */
    build(input: gatewayrequestinput): ReturnType<typeof buildrequest>;
    /** Parses one answer body of the adapter wire format: the answer text and its usage counts, or the reason nothing parsed. */
    parseanswer(body: string): {
        text?: string;
        usage?: modelusage;
        reason?: string;
    };
    /** Parses one streamed body of the adapter wire format into its ordered token stream: the chat completions deltas, the messages content blocks, the gemini candidate parts or the ollama message lines. */
    parsestream(body: string): tokenstream[];
    /** Parses one model list body of the adapter wire format into the discovered models with their context and modality hints when offered. */
    parsemodellist(body: string): gatewaymodelinfo[];
    /** Serializes the tool catalog into the tool schema format of the provider for the capabilityad advertisement. */
    toolcatalog(tools: tooldef[]): unknown[];
}
/** The openai compatible chat completions adapter: any endpoint the user configures that speaks the chat completions shape works, the bearer header carries the resolved key, the streamed answer rides server sent event deltas and the tool catalog serializes into the function tool schema. */
export declare const openaicompatadapter: gatewayadapter;
/** The anthropic messages adapter: the messages wire shape with its system prompt mapping to the top level system field, the streamed answer rides content block deltas and the tool catalog serializes into the input schema format. */
export declare const anthropicgatewayadapter: gatewayadapter;
/** The gemini generate content adapter: the generate content wire shape with the model riding the path, the streamed answer rides candidate parts and the tool schema maps into the function declarations format. */
export declare const geminigatewayadapter: gatewayadapter;
/** The ollama local runtime adapter: it speaks its own localhost wire format (the chat endpoint with the message envelope, the tag list of the locally installed models and the newline delimited stream lines), the base url defaults to the local machine alone and never to a cloud url, and a call never leaves the machine. */
export declare const ollamalocaladapter: gatewayadapter;
/** Every adapter of the gateway family in its stable order; the surfaces and the tests read this one record. */
export declare const gatewayadapters: Record<gatewaykind, gatewayadapter>;
/** Reads the adapter of one provider kind; an unknown kind refuses because the four adapters are the contract. */
export declare function adapterof(kind: gatewaykind): gatewayadapter;
/** The cancel contract of the gateway family: one cancel state the caller creates, passes into the request and stream calls and cancels from any surface; the calls check the flag before the dispatch, between the attempts and after every streamed token. */
export interface gatewaycancelstate {
    cancelled(): boolean;
    cancel(reason?: string): void;
    reason(): string;
}
/** Creates one cancel state of the gateway stream contract; the state stays silent until the caller cancels it. */
export declare function gatewaycancel(): gatewaycancelstate;
/** Builds one structured gateway error with its code, message, retry hint and request id; every failure surface of the family answers this one shape. */
export declare function gatewayerrorof(code: gatewayerror["code"], message: string, requestid: string, retryhint?: string, retryafter?: number): gatewayerror;
/** Normalizes one thrown error into the structured gateway error surface: a thrown gateway error passes through, a timeout keeps its code and every other failure grades as a transport error with its retry hint. */
export declare function gatewayerrorfrom(error: unknown, requestid: string): gatewayerror;
/** Reads the retry after milliseconds a rate limited answer announced: the retry-after header carries seconds or milliseconds, the request epoch dates pass through and an absent or malformed header answers undefined. */
export declare function gatewayretryafterof(headers: Record<string, string>): number | undefined;
/** Masks one provider key for every log, audit entry and error message: the mask answers the key length alone, so no key material — no prefix, no suffix, no fragment — ever reaches a printed line. */
export declare function maskkey(key: string): string;
/** Builds the log safe view of one shaped request: the authorization, api key and proxy header values answer their masked form and a gemini url key parameter strips, so the audit trail and the surfaces never record key material. */
export declare function maskrequest(request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
}): {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
};
/** Stores one provider api key behind the vault seam under the explicit consent of the user: the key material enters the seam at the store moment and the metadata record alone answers, scoped to the origin of the provider base url so a key of one gateway never rides another. */
export declare function storeproviderkey(input: {
    seam: {
        put(vaultid: string, value: string): Promise<void>;
    };
    config: Pick<baseurlconfig, "providerid" | "kind" | "baseurl">;
    profileid: string;
    value: string;
    consent: boolean;
    now: number;
}): Promise<secretvaultentry>;
/** Resolves one provider key from the vault seam at the last possible moment before the wire header: the value answers to the dispatching caller only, never to a log writer, and the record stamps its use. */
export declare function resolveproviderkey(input: {
    seam: {
        fetch(vaultid: string): Promise<string | undefined>;
    };
    entry: secretvaultentry;
}): Promise<{
    ok: boolean;
    value?: string;
    reason: string;
}>;
/** Revokes one provider key with one click: the value drops from the seam and the metadata record leaves with it, because a deleted key leaves no trace a surface could read. */
export declare function revokeproviderkey(input: {
    seam: {
        drop(vaultid: string): Promise<void>;
    };
    entry: secretvaultentry;
}): Promise<{
    dropped: boolean;
    label: string;
    reason: string;
}>;
/** Checks one export candidate list for leaked provider keys: a candidate whose sha-256 digest matches a stored vault record is a leak the export refuses, because key material never rides an export path. */
export declare function keyexportcheck(input: {
    candidates: string[];
    entries: secretvaultentry[];
}): Promise<{
    leaks: string[];
    reason: string;
}>;
/** The call options of the one request contract: the timeout, the retry count, the backoff base, the jitter window and the extra headers the user reviewed — every bound a user choice with no code default. */
export interface gatewayoptions {
    timeout?: number;
    retries?: number;
    backoff?: number;
    /** Jitter window in milliseconds the backoff waits add; a zero window keeps the deterministic backoff. */
    jitter?: number;
    headers?: Record<string, string>;
}
/** The result of one gateway request: the answer text, the usage counts, the request id, the shaped request and the transport facts. */
export interface gatewayresult {
    text: string;
    usage?: modelusage;
    requestid: string;
    request: ReturnType<typeof buildrequest>;
    status: number;
    duration: number;
    retries: number;
}
/** Sends one gateway request through the shared contract: the dispatch loop runs the gates, the retries, the rate limit honoring, the timeout race and the cancellation, and the adapter parses the answer body with its usage counts — every failure answers the structured gateway error. */
export declare function gatewaycall(input: {
    config: baseurlconfig;
    model: string;
    messages: modelmessage[];
    apikey?: string;
    tools?: tooldef[];
    temperature?: number;
    maxtokens?: number;
    options?: gatewayoptions;
    requestid?: string;
    cancel?: gatewaycancelstate;
    transport: fetchtransport;
    sleep?: (milliseconds: number) => Promise<void>;
    jitter?: () => number;
    now?: () => number;
}): Promise<gatewayresult>;
/** Streams one gateway request through the shared contract: the request carries the stream flag of its wire format, the adapter parses the streamed body into its ordered tokens (the chat completions deltas, the messages content blocks, the gemini candidate parts or the ollama message lines), the onevent seam fires for every token as it parses so the surfaces append the answer incrementally, and the cancel state stops the parse loop at the token position it reached. */
export declare function gatewaystream(input: {
    config: baseurlconfig;
    model: string;
    messages: modelmessage[];
    apikey?: string;
    tools?: tooldef[];
    temperature?: number;
    maxtokens?: number;
    options?: gatewayoptions;
    requestid?: string;
    cancel?: gatewaycancelstate;
    transport: fetchtransport;
    sleep?: (milliseconds: number) => Promise<void>;
    jitter?: () => number;
    now?: () => number;
    onevent?: (token: tokenstream) => void;
}): Promise<{
    tokens: tokenstream[];
    text: string;
    requestid: string;
    request: ReturnType<typeof buildrequest>;
    status: number;
    retries: number;
}>;
/** Fetches the model list of one provider through the adapter: the cache window the user configured decides whether the cached list still serves, a fresh fetch rides the model list endpoint of the wire format, the discovered models annotate with their context and modality hints when the provider offers them and a failed fetch keeps the cache untouched. */
export declare function fetchmodellist(input: {
    config: baseurlconfig;
    apikey?: string;
    cachewindow?: number;
    cache?: modelcacherecord;
    transport: fetchtransport;
    options?: gatewayoptions;
    now?: () => number;
}): Promise<{
    models: gatewaymodelinfo[];
    cached: boolean;
    fetchedat: number;
    reason?: string;
}>;
/** Builds the capabilityad advertisement of the tool catalog: the tools serialize into the wire format of the provider (the function schema of the chat completions shape, the input schema of the messages shape, the function declarations of the generate content shape or the function schema of the local runtime), every tool declares its consent requirement from its metadata and the plan review gate rides the required capabilities because a model answer never executes a step the human review did not approve. */
export declare function capabilityadvertisement(input: {
    kind: gatewaykind;
    tools: tooldef[];
}): {
    kind: gatewaykind;
    tools: unknown[];
    consent: Array<{
        tool: string;
        review: string;
        riskclass?: string;
        approvalrequired?: boolean;
    }>;
    requiredcapabilities: string[];
};
/** Resolves the gateway route of one task kind: the user rules of the model routing table map the kind onto its provider and model, a remote provider the consent or enable gates refuse falls back to the user configured fallback pair, and when remote calls are not allowed at all the resolution falls back to the local provider so the task stays on the machine. */
export declare function resolvegatewayroute(input: {
    kind: string;
    routes: modelroute[];
    providers: providerconfig[];
    configs: baseurlconfig[];
    local?: localmodelconfig;
    remoteallowed?: boolean;
    sessionorigin?: string;
}): {
    source: "route" | "fallback" | "local";
    provider?: providerconfig;
    model?: string;
    config?: baseurlconfig;
    local?: localmodelconfig;
    reason?: string;
};
/** Builds one usage record of a gateway call: the request id rides the record for the correlation across the run, the session id reports the per session totals beside the per run totals, the cost answers the user configured price per million tokens and the local marker stamps the calls that never left the machine. */
export declare function gatewayusagerecord(input: {
    providerid: string;
    endpoint: string;
    model: string;
    usage?: modelusage;
    costpermilliontokens?: number;
    sessionid?: string;
    runid?: string;
    stepid?: string;
    requestid: string;
    local?: boolean;
    now: number;
}): usagerecord;
/** Checks the warning threshold of the cost budget: the budget tracking warns once the recorded tokens or cost cross the user configured share of their ceiling, while the halt of the reviewed budget check stays separate — a warning never blocks a call, the halt does. */
export declare function gatewaybudgetwarning(input: {
    budget?: costbudget;
    totals: {
        totaltokens: number;
        cost: number;
    };
}): {
    warned: boolean;
    tokenratio?: number;
    costratio?: number;
    reason?: string;
};
/** Builds the cost estimate view of the configured providers: the projected cost per million tokens answers the user configured price of every provider and model pair beside the recorded tokens and cost of the usage records, so the surfaces show what a call costs before it runs — a pair without configured pricing answers zero instead of an invented number. */
export declare function costestimates(input: {
    configs: baseurlconfig[];
    providers: providerconfig[];
    records: usagerecord[];
}): costestimate[];
/** The reviewed default guard of the gateway plan answers: the goal, the steps array and the open questions the plan schema asks, with one retry before the refusal. */
export declare const gatewayplanguard: parseguard;
/** Builds the structured retry prompt of one refused model answer: the prompt names the schema the answer failed, quotes the failure reason of the guard and asks the model to answer with the corrected json object alone, so a retry teaches the shape instead of repeating the failure. */
export declare function guardretryprompt(output: modeloutput): string;
/** Runs the gateway guardrails over the model answer attempts: every attempt validates against the plan schema through the shared parse guard, the attempts cap at the user configured retry count, a valid attempt wins, a refusal marker refuses without retries and the exhaustion of every capped attempt refuses the output so nothing invalid ever reaches a plan — the structured retry prompt answers whenever a retry is left. */
export declare function gatewayguard(input: {
    guard?: parseguard;
    attempts: string[];
}): {
    output: modeloutput;
    retryprompt?: string;
    cappedat: number;
};
/** The per task prompt templates of the gateway family: every template ships with its double braced variable slots and its version, the memory store keeps the versions and a template renders through the shared prompt library with its variables. */
export declare function gatewaytemplates(now: number): prompttemplate[];
/** Composes one gateway prompt from a stored template and its variable values through the shared prompt library; a missing template name answers the reason so the caller refuses instead of sending a hollow prompt. */
export declare function composegatewayprompt(input: {
    templates: prompttemplate[];
    name: string;
    variables: Record<string, unknown>;
}): {
    text?: string;
    reason?: string;
};
/** Assembles the streamed tokens of a gateway chat for incremental rendering: every poll reads the tokens past its cursor, the assembled text carries only the fresh batch and the done marker answers whether a finished stream delivered its last token — the sidepanel chat appends every batch as it arrives instead of waiting for the whole answer. */
export declare function streamrender(tokens: gatewaychattoken[], cursor: number, finished: boolean): {
    text: string;
    nextcursor: number;
    done: boolean;
};
/** Builds one gateway chat state of a streamed exchange: the request id, the provider, the model, the prompt and the token list the panel polls through its cursor; the state never carries key material. */
export declare function gatewaychatstateof(input: {
    requestid: string;
    config: baseurlconfig;
    model: string;
    prompt: string;
    tokens?: gatewaychattoken[];
    done?: boolean;
    error?: gatewayerror;
    now: number;
}): gatewaychatstate;
/** Reads whether one base url points at the local machine, shared with the llm provider model so the local marker of the usage records answers one rule. */
export declare function gatewayislocal(config: Pick<baseurlconfig, "baseurl">): boolean;
/** Runs the reviewed budget check over the usage totals: the token and currency ceilings halt the run and ask the user, exactly as every model call of the llm family already does — the gateway calls pass the same budget gate. */
export declare function gatewaybudgetcheck(input: {
    budget: costbudget | undefined;
    totals: {
        totaltokens: number;
        cost: number;
    };
}): {
    allowed: boolean;
    halted: boolean;
    asksuser: boolean;
    reason?: string;
};
/** Validates one gateway config before it saves: the base url passes its scheme, host and path shape gate, the path prefix passes its namespace gate, the ollamalocal base url defaults to the local machine when the user left it empty and every remote kind refuses an empty base url. */
export declare function validategatewayconfig(config: baseurlconfig): {
    ok: boolean;
    config: baseurlconfig;
    reason?: string;
};
/** The key reference the gateway config carries: the name the surfaces show, the origin scope of the provider base url and the storage id of the vault entry — never the key material. */
export declare function gatewaykeyref(name: string, baseurl: string, storageid: string, configuredat: number): apikeyref;
/**
 * Web api transport logics of the 1.1.76 family.
 * Every correlated rule for the widened transport surface lives in this one module: the server sent events subscription lifecycle with field parsing, last event id resume, clean cancellation and channel error surfacing; the long poll request loop that waits on the response cursor, retries on the configured timeout backoff and stops on cancellation or plan expiry; the graphql subscription message mapping of next, error and complete frames into step results; the urlencoded form post and the streamed multipart upload with their part encodings and upload progress; the per run correlation id assignment that joins request and response pairs and exports one request map to the audit trail; the rate limit directive parsing that delays the next request until the reset window and honors the retry after wait of 429 and 503 answers; and the per run response cache that keys by url, method and body hash, serves repeated read only calls inside one run, expires entries by the response headers and the user policy and never caches a response that follows a mutation.
 * The module reuses the socketbus parsing of the 1.1.43 family for the event stream grammar and the poll cursor decisions, and the netauth encodings of the 1.1.44 family for the urlencoded and multipart wire shapes, so the transport widening extends the reviewed families instead of duplicating them.
 * Message payloads and field values are opaque reviewed text; no payload value enters any audit summary built from these results, and every timeout, backoff, retention and bound stays a user choice with no code default — an absent value never hides a hardcoded ceiling.
 */
import { type sseevent } from "./net.js";
/** Stream open seam: one reviewed url with its request headers resolves to a reader of text chunks or an error class; the extension executor wires the fetch stream, tests wire plain fixtures. */
export type streamopen = (url: string, headers: Record<string, string>) => Promise<{
    ok: boolean;
    status: number;
    read: () => Promise<{
        done: boolean;
        text?: string;
    }>;
    error?: string;
}>;
/** Poll fetch seam: one poll url with its optional request body resolves to the response status, headers and text; the extension executor wires fetch, tests wire plain fixtures. */
export type pollfetch = (url: string, body?: string) => Promise<{
    status: number;
    headers: Record<string, string>;
    body: string;
    timeout?: boolean;
}>;
/**
 * Runs one server sent events subscription through the stream open seam: the channel reads chunk by chunk, every complete block parses into its event, data, id and retry fields, the last event id persists so a reconnect resumes exactly where the stream stopped, a cancelled step or an elapsed lifetime closes the channel cleanly, and a channel error surfaces to the run state machine instead of dying silently.
 */
export declare function subevents(input: {
    record: eventsubscription;
    open: streamopen;
    cancelled?: () => boolean;
    now?: () => number;
}): Promise<{
    record: eventsubscription;
    events: sseevent[];
    error?: string;
}>;
/** Normalizes one reviewed long poll request from step options: the url the poll drives, the user chosen timeout of one request and the resume cursor; an absent timeout never aborts a poll because the bound stays a user choice with no code default. */
export declare function longpollrequestof(value: unknown): longpollrequest | undefined;
/**
 * Runs one long poll loop through the poll fetch seam: each iteration issues the request the reviewed cursor builds, waits on the response cursor, retries a timed out request under the configured backoff and stops on the reviewed stop condition, the cancellation flag, the plan expiry or the reviewed poll ceiling; the loop never invents a bound of its own.
 */
export declare function longpoll(input: {
    request: longpollrequest;
    cursor: pollcursor;
    fetchpoll: pollfetch;
    cancelled?: () => boolean;
    expiresat?: number;
    backoff?: number;
    now?: () => number;
    sleep?: (milliseconds: number) => Promise<void>;
}): Promise<{
    polls: number;
    retries: number;
    reason: string;
    cursor?: string;
    exchanges: Array<{
        url: string;
        status: number;
        body: string;
        timeout: boolean;
    }>;
    error?: string;
}>;
/** One parsed graphql subscription message of the graphql-ws grammar: the next payload, the error list or the complete marker with its operation id. */
export interface graphqlmessage {
    kind: "next" | "error" | "complete";
    id?: string;
    /** The payload of a next message, kept opaque for the step results. */
    payload?: unknown;
    /** The error messages of an error message. */
    errors?: string[];
}
/** Normalizes one reviewed graphql subscription from step options: the query, its variables and the websocket channel the subscription rides. */
export declare function graphqlsubscriptionof(value: unknown): graphqlsubscription | undefined;
/** Parses one inbound graphql subscription message of the graphql-ws grammar into its next, error or complete kind; an unparseable frame reports itself as an error instead of dying silently. */
export declare function parsegraphqlmessage(payload: string): graphqlmessage;
/** Builds the graphql-ws subscribe frame of one reviewed subscription: the operation id, the query and its variables ride one json frame the channel publishes. */
export declare function graphqlsubscribeframe(subscription: graphqlsubscription, operationid: string): string;
/** Maps the inbound graphql subscription messages into step results: every next payload becomes one result with its operation id, the errors collect for the step outcome and the complete marker closes the mapping. */
export declare function graphqlsub(input: {
    subscription: graphqlsubscription;
    messages: string[];
}): {
    results: Array<{
        id?: string;
        data: unknown;
    }>;
    errors: string[];
    completed: boolean;
};
/** Builds one reviewed urlencoded form post for a granted origin: the fields encode with the urlencoded grammar under the application/x-www-form-urlencoded content type, and an origin outside the grants refuses before any byte moves. */
export declare function formpost(input: {
    payload: formpayload;
    grants: string[];
}): {
    ok: true;
    url: string;
    method: "POST";
    headers: Record<string, string>;
    body: string;
} | {
    ok: false;
    refusal: string;
};
/** Builds the part headers of one multipart file field: the content disposition names the field and the filename while the content type carries the reviewed mime of the part. */
export declare function multipartfieldheader(field: multipartfield): string;
/** Encodes one reviewed multipart upload for a granted origin: the fields and the files encode into ordered chunks under one boundary, the progress callback reports each streamed chunk with its sent and total bytes without ever buffering the whole payload, and an origin outside the grants or an unreviewed file refuses before any byte moves. */
export declare function multipartpost(input: {
    payload: multipartpayload;
    grants: string[];
    onprogress?: (progress: {
        chunk: number;
        chunks: number;
        sent: number;
        total: number;
    }) => void;
}): {
    ok: true;
    url: string;
    method: "POST";
    headers: Record<string, string>;
    chunks: string[];
    boundary: string;
    bytes: number;
} | {
    ok: false;
    refusal: string;
};
/** Assigns one request id per outbound request of the run: the correlation context grows by the request, the correlation id derives from the run and the request order, and the mapping stays read only inside the run. */
export declare function correlateids(input: {
    context: correlationcontext;
    stepid: string;
    url: string;
    method: string;
    now: number;
}): {
    context: correlationcontext;
    requestid: string;
};
/** Joins one response onto its request through the shared correlation id: the request gains its response id and status, and a request id the map does not carry refuses instead of pairing the wrong pair. */
export declare function joincorrelation(input: {
    context: correlationcontext;
    requestid: string;
    responseid?: string;
    status: number;
    now: number;
}): correlationcontext;
/** Exports the per run request map for the audit trail: every request with its correlation id, its pair state and the paired share, read only beside the run it belongs to. */
export declare function correlationexport(context: correlationcontext): {
    runid: string;
    requests: number;
    pairs: number;
    map: Array<{
        requestid: string;
        correlationid: string;
        stepid: string;
        url: string;
        origin: string;
        method: string;
        paired: boolean;
        status?: number;
        at: number;
    }>;
};
/** Parses one rate limit directive from the response headers: the remaining count and the reset window of the x-ratelimit family and the retry after wait of a 429 or 503 answer compose into one directive scoped to the origin; headers without any rate limit fact parse to nothing. */
export declare function ratelimitdirectiveof(headers: Record<string, string>, origin: string, status: number, now: number): ratelimitdirective | undefined;
/** Resolves the wait the next request of one origin owes: the newest directive of the origin names the milliseconds until its reset window passes, an absent or passed directive waits nothing, and the wait itself stays a user respected value with no code ceiling. */
export declare function ratelimitwaitof(directives: ratelimitdirective[], origin: string, now: number): {
    waitms: number;
    directive?: ratelimitdirective;
};
/** Applies the rate limit respect before one transport call: the wait sleeps until the reset window of the origin passes so the call never crosses a limit the endpoint published, and the resolved wait reports itself for the audit trail. */
export declare function ratelimitrespect(input: {
    directives: ratelimitdirective[];
    origin: string;
    now?: () => number;
    sleep?: (milliseconds: number) => Promise<void>;
}): Promise<{
    waitms: number;
    directive?: ratelimitdirective;
}>;
/** Hashes one request body for the cache key with a stable rolling digest; the hash never carries the body values anywhere, only their shape identity. */
export declare function bodyhashof(body: string): string;
/** Builds the cache key of one call: the run namespace, the method, the url and the body hash compose into one key so a repeated read of the same run serves from its own entry only. */
export declare function cachekeyof(input: {
    runid: string;
    url: string;
    method: string;
    body: string;
}): string;
/** Resolves the expiry timestamp of one stored response from its headers and the user policy: the cache-control max-age and the expires date cap the entry while the user configured retention bounds the entries per run, and an absent fact keeps the entry until the run ends. */
export declare function cacheexpiryof(headers: Record<string, string>, now: number, retention?: number): number | undefined;
/** True when the method reads only: GET and HEAD carry no mutation, every other verb mutates and its responses never cache. */
export declare function readmethod(method: string): boolean;
/** Stores one response in the per run cache: the entry keys by the run namespace, the url, the method and the body hash, only a read only method stores, a response that carries credentials refuses through the cache gate of the caller, and a response that follows a mutation on its origin never stores because the mutation invalidated the read it would answer. */
export declare function cacheresponse(input: {
    entries: cacheentry[];
    url: string;
    method: string;
    body: string;
    headers: Record<string, string>;
    status: number;
    runid: string;
    now: number;
    retention?: number;
    credentials?: boolean;
    mutatedat?: number;
}): {
    entries: cacheentry[];
    entry?: cacheentry;
    refusal?: string;
};
/** Serves one repeated read only call from the per run cache: the entry with the matching key serves while its expiry has not passed, a hit bumps its counter, an entry whose origin saw a mutation stops serving, and an expired entry drops with its expiry reported. */
export declare function cacheserv(input: {
    entries: cacheentry[];
    url: string;
    method: string;
    body: string;
    runid: string;
    now: number;
    mutatedat?: number;
}): {
    entries: cacheentry[];
    entry?: cacheentry;
    expired?: cacheentry;
};
/** Runs the cache expiry cleanup pass: every entry whose expiry passed drops while its metadata survives through the caller, and the pass reports exactly what it expired. */
export declare function cachecleanup(entries: cacheentry[], now: number): {
    kept: cacheentry[];
    expired: cacheentry[];
};
/** Builds one observed page api call record from a captured exchange fact: the url, its origin, the endpoint path, the method, the status and the mime compose into one read only observation beside the discovered api map. */
export declare function apicallrecordof(input: {
    id: string;
    runid: string;
    stepid: string;
    url: string;
    method: string;
    status: number;
    mime?: string;
    at: number;
}): apicallrecord;
/**
 * Apimap of the 1.1.86 browser coverage family.
 * Every webextension api concern of the cross browser build lives in this one pure module: the catalog of every webextension api the codebase touches, the per browser equivalents (chromium, firefox and safari) of every api, the runtime browser probe that resolves the right call for the running browser, the in memory cache that holds the resolved browser for the run, the structured errors that surface the unsupported calls with their retry hints and the build time unmapped api report that fails the build when a new api lacks a row. The module stays pure: the browser runtime object, the user agent and the install probe reach it through injected seams only, the kind catalog and the policy gates stay identical on every browser, no vendor endpoint and no download url ever appears here — a single source manifest speaks every webextension dialect through the per browser overlay it carries, and an unsupported call surfaces a structured error instead of a silent fallback.
 * Example: `const probe = apimapbrowsercacheprobe({ runtime: globalThis.chrome, probeuseragent: () => navigator.userAgent }); const browser = probe(); const api = apimapresolve("storage.local", browser); const unmapped = apimapunmapped(apimapentries());`
 */
/** The kind of every recorded webextension api: a namespace the codebase reads, a method it calls, an event it listens to, or a property it queries. */
export declare function apimapkinds(): webextensionapikind[];
/** The catalog of every webextension api the codebase touches: the api name the reviewed vocabulary uses, the per browser equivalent (chromium, firefox and safari), the kind and the unsupported marker that flags an api a single browser lacks. A new api without a chromium and firefox mapping fails the build before it ships; the catalog is the source of truth the apimap build check reads. */
export declare function apimapentries(): webextensionapientry[];
/** The default feature flag set: every feature flag that ships crosses every browser through the intersection of the per browser sets. */
export declare function apifeatureflagintersection(): string[];
/** Looks up one apimap entry by its reviewed api name; a missing entry returns undefined so the resolver and the unmapped reporter read the same shape. */
export declare function apimapentryof(api: string): webextensionapientry | undefined;
/** Resolves one reviewed api to the per browser call of the running browser; the runtime probe runs first when the caller passes the runtime seam, the empty probe answers the browser the caller chose, and an unmapped api surfaces an unsupported structured error with the retry hint instead of a silent fallback. */
export declare function apimapresolve(input: {
    api: string;
    browser?: webextensionbrowser;
    runtime?: unknown;
    probeuseragent?: () => string;
}): apimapresolution;
/** Reports the unmapped apis of the catalog at build time: an api without a chromium and firefox mapping fails the build before it ships, and the report keeps the per browser coverage of every api beside the missing rows. */
export declare function apimapunmapped(entries?: webextensionapientry[]): apimapreport;
/** The runtime browser probe resolves the running browser from the runtime seam and the user agent: the chromium runtime carries the chrome namespace, the firefox runtime carries the browser namespace, the safari runtime carries the browser namespace beside a vendor keyword in the user agent the probe reads, and an unknown runtime degrades to chromium so the source manifest stays the default the cross browser build loads. */
export declare function apimapbrowserof(input?: apibrowserprobeinput): webextensionbrowser;
/** Builds the in memory cached browser probe: the probe resolves the browser once per run, the cache holds it for the rest of the run, and a forced refresh rewrites the cache when the build runs the same process over a new context. */
export declare function apimapbrowsercacheprobe(input?: apibrowserprobeinput): apimapbrowserprobe;
/** The structured error of an unsupported apimap call: the family, the message, the retry hint and the time, so a caller maps the failure to its next action instead of a bare throw. */
export declare function apimapstructerrorof(input: {
    api: string;
    browser: webextensionbrowser;
    reason?: string;
    now: number;
}): apimapstructerror;
//# sourceMappingURL=gateway.d.ts.map