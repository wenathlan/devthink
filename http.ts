/** The http module of the 1.1.88 consolidation: every correlated variation of the http logic interned in this one file, so the module family carries one surface without duplicate variations. */

/* ── Merged from httpclient.ts: the 1.1.88 consolidation interns the correlated httpclient logic here, so no variation of the same file lives beside another. ── */
import type { endpointrecord, fetchrequest, fetchoptions, graphqlrequest, htmlquery, jsonpathrule, parsedfield, payloadschema, streamwindow, jsonrpcframe, mcpserverconfig, sessiontoken, tlsconfig, transportkind, allowlistentry, clientrecord, httpstreamconfig, rpcerror, streamchannel, toolnamespace, relayserverconnection, relayserverstate, relayserversession, serverenvelope } from "./types.js";

/**
 * Network observation part one logics for the 1.1.42 family.
 * Every correlated rule for the outbound fetch with timeout, retries, backoff and the redirect follow limit, the streamed reading of large bodies inside a byte budget, the dotted json path extraction, the html query evaluation over a parse seam, the typed rest call with payload schemas and url templating and the graphql envelope wrapping and unwrapping lives in this file.
 * Header values and body bytes never enter any audit summary built from these results.
 */

/** The network observation kinds, listed among the available capabilities of every proposal request. */
export const httpkinds: string[] = ["fetchurl", "parsejson", "parsehtml", "callrest", "callgraphql"];

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
export type fetchtransport = (url: string, init: { method: string; headers: Record<string, string>; body?: string; mode?: string; redirect: "follow" | "error" }) => Promise<transportresponse>;

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

const redirectstatuses = new Set([301, 302, 303, 307, 308]);
const bodilessmethods = new Set(["GET", "HEAD"]);

/** Maps one response status to its reviewed status class: informational, success, redirect, clienterror, servererror or unknown. */
export function statusclassof(status: number): "informational" | "success" | "redirect" | "clienterror" | "servererror" | "unknown" {
  if (status >= 100 && status < 200) return "informational";
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "redirect";
  if (status >= 400 && status < 500) return "clienterror";
  if (status >= 500 && status < 600) return "servererror";
  return "unknown";
}

/** Interpolates a reviewed url template by replacing every {variable} with the reviewed payload value of that name. */
export function templateurl(template: string, values: Record<string, unknown>): string {
  return template.replace(/\{([a-z0-9_]+)\}/gi, (whole, name: string) => (values[name] === undefined ? whole : String(values[name])));
}

/** Normalizes a reviewed fetch request value: url, method, custom header allowlist, body and mode; unknown fields stay ignored. */
export function fetchrequestof(value: unknown): fetchrequest | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (typeof options.url !== "string" || !options.url.trim()) return undefined;
  const request: fetchrequest = { url: options.url.trim() };
  if (typeof options.method === "string" && options.method.trim()) request.method = options.method.trim().toUpperCase();
  if (options.headers && typeof options.headers === "object" && !Array.isArray(options.headers)) {
    const headers: Record<string, string> = {};
    for (const [name, headervalue] of Object.entries(options.headers as Record<string, unknown>)) {
      if (typeof headervalue === "string") headers[name] = headervalue;
    }
    request.headers = headers;
  }
  if (typeof options.body === "string") request.body = options.body;
  if (options.mode === "cors" || options.mode === "no-cors" || options.mode === "same-origin") request.mode = options.mode;
  return request;
}

/** Normalizes reviewed fetch policy options: timeout, retries, backoff base and redirect follow limit stay user choices with no code ceiling. */
export function fetchoptionsof(value: unknown): fetchoptions {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const options = value as Record<string, unknown>;
  const normalized: fetchoptions = {};
  if (typeof options.timeout === "number" && Number.isFinite(options.timeout)) normalized.timeout = options.timeout;
  if (typeof options.retries === "number" && Number.isFinite(options.retries)) normalized.retries = options.retries;
  if (typeof options.backoff === "number" && Number.isFinite(options.backoff)) normalized.backoff = options.backoff;
  if (typeof options.follow === "number" && Number.isFinite(options.follow)) normalized.follow = options.follow;
  return normalized;
}

/** Normalizes a reviewed stream window: the byte budget ceiling stays a user choice. */
export function streamwindowof(value: unknown): streamwindow {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const options = value as Record<string, unknown>;
  const window: streamwindow = {};
  if (typeof options.budget === "number" && Number.isFinite(options.budget)) window.budget = options.budget;
  return window;
}

/** Normalizes reviewed json path rules: every rule needs a field name and a dotted path; kind and default stay optional. */
export function jsonpathrulesof(value: unknown): jsonpathrule[] {
  if (!Array.isArray(value)) return [];
  const rules: jsonpathrule[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const entry = item as Record<string, unknown>;
    if (typeof entry.name !== "string" || !entry.name.trim()) continue;
    if (typeof entry.path !== "string" || !entry.path.trim()) continue;
    const rule: jsonpathrule = { name: entry.name.trim(), path: entry.path.trim() };
    if (entry.kind === "text" || entry.kind === "number" || entry.kind === "boolean" || entry.kind === "json") rule.kind = entry.kind;
    if (entry.default !== undefined) rule.default = entry.default;
    rules.push(rule);
  }
  return rules;
}

/** Normalizes reviewed html queries: selector, optional attribute and the multi flag for all matches versus the first. */
export function htmlqueriesof(value: unknown): htmlquery[] {
  if (!Array.isArray(value)) return [];
  const queries: htmlquery[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const entry = item as Record<string, unknown>;
    if (typeof entry.selector !== "string" || !entry.selector.trim()) continue;
    const query: htmlquery = { selector: entry.selector.trim() };
    if (typeof entry.attribute === "string" && entry.attribute.trim()) query.attribute = entry.attribute.trim();
    if (entry.multi === true) query.multi = true;
    queries.push(query);
  }
  return queries;
}

/** Normalizes a reviewed graphql request: operation text, operation kind, variables and operation name. */
export function graphqlrequestof(value: unknown): graphqlrequest | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (typeof options.query !== "string" || !options.query.trim()) return undefined;
  if (options.operationkind !== "query" && options.operationkind !== "mutation") return undefined;
  const request: graphqlrequest = { query: options.query, operationkind: options.operationkind };
  if (options.variables && typeof options.variables === "object" && !Array.isArray(options.variables)) request.variables = options.variables as Record<string, unknown>;
  if (typeof options.operationname === "string" && options.operationname.trim()) request.operationname = options.operationname.trim();
  return request;
}

/** Default sleeper used between retries; tests inject an instant fake to keep the suite fast. */
const realsleep = (milliseconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, Math.max(0, milliseconds)));

/**
 * Sends one reviewed outbound request through the transport seam with the reviewed timeout, retries, backoff and redirect follow limit.
 * Every bound stays a reviewed choice: the timeout races each attempt, failed attempts wait backoff times the attempt number before the retry, and redirect hops beyond the follow limit refuse instead of following.
 */
export async function sendfetch(input: { request: fetchrequest; options?: fetchoptions; transport: fetchtransport; sleep?: (milliseconds: number) => Promise<void>; onretry?: (attempt: number, wait: number, reason: string) => void; now?: () => number }): Promise<calltransport> {
  const options = input.options ?? {};
  const sleep = input.sleep ?? realsleep;
  const now = input.now ?? Date.now;
  const attempts = Math.max(1, Math.floor(options.retries ?? 0) + 1);
  const backoff = options.backoff ?? 0;
  const follow = options.follow ?? Number.POSITIVE_INFINITY;
  let url = input.request.url;
  let method = (input.request.method ?? "GET").toUpperCase();
  let retries = 0;
  let redirects = 0;
  let lastreason = "";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let hops = 0;
    const startedat = now();
    let response: transportresponse | undefined;
    try {
      const init = { method, headers: { ...(input.request.headers ?? {}) }, ...(input.request.body !== undefined && !bodilessmethods.has(method) ? { body: input.request.body } : {}), ...(input.request.mode !== undefined ? { mode: input.request.mode } : {}), redirect: follow <= 0 ? ("error" as const) : ("follow" as const) };
      const sent = input.transport(url, init);
      if (options.timeout !== undefined && Number.isFinite(options.timeout) && options.timeout >= 0) {
        let timedout = false;
        response = await Promise.race([sent, sleep(options.timeout).then(() => { timedout = true; return undefined; })]).then(value => value ?? (timedout ? (() => { throw new Error(`The request timed out after ${options.timeout} milliseconds.`); })() : value));
      } else {
        response = await sent;
      }
      while (response !== undefined && redirectstatuses.has(response.status) && typeof response.location === "string" && response.location) {
        hops += 1;
        if (hops > follow) throw new Error(`The redirect chain exceeded the reviewed follow limit of ${follow}.`);
        url = new URL(response.location, url).toString();
        if (method === "POST" && [301, 302, 303].includes(response.status)) method = "GET";
        const hopinit: { method: string; headers: Record<string, string>; body?: string; mode?: string; redirect: "error" | "follow" } = { ...init, method };
        if (bodilessmethods.has(method)) delete hopinit.body; /* a downgraded bodiless redirect carries no body onward */
        response = await input.transport(url, hopinit);
      }
      redirects = hops;
    } catch (error) {
      lastreason = error instanceof Error ? error.message : String(error);
      response = undefined;
    }
    if (response !== undefined) {
      const body = response.body;
      return { url, status: response.status, statusclass: statusclassof(response.status), headernames: Object.keys(response.headers), body, bytes: body.length, duration: now() - startedat, retries, redirects };
    }
    if (attempt < attempts) {
      const wait = backoff * attempt;
      if (wait > 0) await sleep(wait);
      input.onretry?.(attempt, wait, lastreason);
      retries = attempt;
    }
  }
  throw new Error(`The request failed after ${attempts} attempt${attempts === 1 ? "" : "s"} with ${retries} retr${retries === 1 ? "y" : "ies"}: ${lastreason}`);
}

/**
 * Consumes a large response body in chunks inside the reviewed stream window: every chunk passes the reviewed handler path, the byte budget aborts past the ceiling and the abort flag stops the stream cleanly between chunks.
 */
export async function readstream(input: { chunks: string[] | (() => Promise<string | undefined>); window: streamwindow }): Promise<{ chunks: number; bytes: number; aborted: boolean; reason?: string }> {
  const pull = typeof input.chunks === "function" ? input.chunks : ((source: string[]) => {
    let index = 0;
    return async () => source[index++] as string | undefined;
  })(input.chunks as string[]);
  let count = 0;
  let total = 0;
  for (;;) {
    if (input.window.abort?.() === true) return { chunks: count, bytes: total, aborted: true, reason: "The reviewed abort flag stopped the stream." };
    const chunk = await pull();
    if (chunk === undefined) return { chunks: count, bytes: total, aborted: false };
    const next = total + chunk.length;
    if (input.window.budget !== undefined && next > input.window.budget) return { chunks: count, bytes: total, aborted: true, reason: `The stream aborted at ${next} bytes past the reviewed byte budget of ${input.window.budget}.` };
    total = next;
    count += 1;
    input.window.onchunk?.(chunk, total);
  }
}

/** Resolves one dotted path segment against an object or an array index. */
function pathstep(current: unknown, segment: string): unknown {
  if (Array.isArray(current) && /^\d+$/.test(segment)) return current[Number.parseInt(segment, 10)];
  if (current && typeof current === "object" && !Array.isArray(current)) return (current as Record<string, unknown>)[segment];
  return undefined;
}

/** Coerces one extracted value to the reviewed field kind; a failed coercion falls back to the default with the miss flag. */
function coerce(value: unknown, kind: parsedfield["kind"], fallback: unknown): { value?: unknown; missing: boolean } {
  if (value === undefined || value === null) return { value: fallback, missing: true };
  if (kind === "text") return { value: String(value), missing: false };
  if (kind === "number") {
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? { value: numeric, missing: false } : { value: fallback, missing: true };
  }
  if (kind === "boolean") return { value: value === true || value === "true", missing: false };
  return { value, missing: false };
}

/**
 * Extracts named fields from one parsed json body by dotted paths: array indexes use numeric segments, a miss fills the reviewed default and reports the miss instead of crashing, and every value carries its reviewed kind.
 */
export function readpath(parsed: unknown, rules: jsonpathrule[]): parsedfield[] {
  const fields: parsedfield[] = [];
  for (const rule of rules) {
    const kind = rule.kind ?? "text";
    let current: unknown = parsed;
    let missing = false;
    for (const segment of rule.path.split(".")) {
      const next = pathstep(current, segment);
      if (next === undefined) { missing = true; break; }
      current = next;
    }
    if (missing) fields.push({ name: rule.name, path: rule.path, kind, ...(rule.default !== undefined ? { value: rule.default } : {}), missing: true });
    else {
      const resolved = coerce(current, kind, rule.default);
      fields.push({ name: rule.name, path: rule.path, kind, ...(resolved.value !== undefined ? { value: resolved.value } : {}), ...(resolved.missing ? { missing: true } : {}) });
    }
  }
  return fields;
}

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

/** Builds the default parse seam from the ambient DOMParser when one exists, which holds inside extension pages; other contexts must inject a seam. */
function defaultparse(): domparse {
  const parser = (globalThis as { DOMParser?: new () => { parseFromString(markup: string, type: string): Document } }).DOMParser;
  if (!parser) throw new Error("parsehtml needs a domparser seam outside the page context.");
  return markup => {
    const document = new parser().parseFromString(markup, "text/html");
    return { query: (selector: string): htmlmatch[] => Array.from(document.querySelectorAll(selector)).map(element => ({ text: element.textContent ?? "", attributes: Object.fromEntries(Array.from(element.attributes).map(attribute => [attribute.name, attribute.value])) })) };
  };
}

/**
 * Parses fetched markup through the parse seam and runs the reviewed html queries: every query returns attribute values or text plus the element count, and the multi flag widens the first match to every match.
 */
export function parsehtmlbody(input: { body: string; queries: htmlquery[]; parse?: domparse }): htmlqueryresult[] {
  const parse = input.parse ?? defaultparse();
  const document = parse(input.body);
  return input.queries.map(query => {
    const matches = document.query(query.selector);
    const chosen = query.multi === true ? matches : matches.slice(0, 1);
    const values = chosen.map(match => query.attribute !== undefined ? (match.attributes[query.attribute] ?? "") : match.text);
    return { selector: query.selector, ...(query.attribute !== undefined ? { attribute: query.attribute } : {}), multi: query.multi === true, count: matches.length, values };
  });
}

/** Validates one reviewed payload against an endpoint payload schema: every required field must be present with its kind; extra fields pass through as reviewed values. */
export function payloadvalid(payload: Record<string, unknown>, schema: payloadschema | undefined): { ok: boolean; errors: string[] } {
  if (!schema) return { ok: false, errors: ["The typed endpoint call needs a reviewed payload schema before it runs."] };
  const errors: string[] = [];
  for (const field of schema.fields) {
    const value = payload[field.name];
    if (value === undefined || value === null) {
      if (field.required === true) errors.push(`The required field ${field.name} of kind ${field.kind} is missing.`);
      continue;
    }
    if (field.kind === "string" && typeof value !== "string") errors.push(`The field ${field.name} must be a string.`);
    if (field.kind === "number" && (typeof value !== "number" || !Number.isFinite(value))) errors.push(`The field ${field.name} must be a finite number.`);
    if (field.kind === "boolean" && typeof value !== "boolean") errors.push(`The field ${field.name} must be a boolean.`);
  }
  return { ok: errors.length === 0, errors };
}

/** Applies the schema defaults to one reviewed payload: missing optional fields gain their reviewed default values. */
export function payloadwithdefaults(payload: Record<string, unknown>, schema: payloadschema | undefined): Record<string, unknown> {
  if (!schema) return payload;
  const merged: Record<string, unknown> = { ...payload };
  for (const field of schema.fields) {
    if (merged[field.name] === undefined && field.default !== undefined) merged[field.name] = field.default;
  }
  return merged;
}

/** Extracts structured error strings from a json error body of a failed call; non json bodies return the raw text. */
function errorsof(body: string): string[] {
  try {
    const parsed = JSON.parse(body) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [body];
    const record = parsed as Record<string, unknown>;
    for (const key of ["errors", "messages", "error", "message"]) {
      const value = record[key];
      if (Array.isArray(value)) return value.map(item => typeof item === "string" ? item : item && typeof item === "object" && typeof (item as Record<string, unknown>).message === "string" ? (item as Record<string, unknown>).message as string : String(item));
      if (typeof value === "string") return [value];
    }
    return [body];
  } catch {
    return [body];
  }
}

/**
 * Executes one typed rest endpoint call: the payload validates against the endpoint payload schema, the url templates its variables from the reviewed values, the reviewed success status list (or the two hundred class by default) maps the response code to the step outcome and json error bodies parse into structured errors.
 */
export async function callrest(input: { endpoint: endpointrecord; payload: Record<string, unknown>; options?: fetchoptions; transport: fetchtransport; success?: number[]; sleep?: (milliseconds: number) => Promise<void>; onretry?: (attempt: number, wait: number, reason: string) => void; now?: () => number }): Promise<{ transport: calltransport; url: string; payload: Record<string, unknown>; ok: boolean; errors: string[] }> {
  const check = payloadvalid(input.payload, input.endpoint.schema);
  if (!check.ok) throw new Error(check.errors.join(" "));
  const payload = payloadwithdefaults(input.payload, input.endpoint.schema);
  const url = templateurl(input.endpoint.url, payload);
  const method = input.endpoint.method.toUpperCase();
  const request: fetchrequest = { url, method, ...(input.endpoint.headers !== undefined ? { headers: input.endpoint.headers } : {}), ...(bodilessmethods.has(method) ? {} : { body: JSON.stringify(payload) }) };
  const transport = await sendfetch({ request, ...(input.options !== undefined ? { options: input.options } : {}), transport: input.transport, ...(input.sleep !== undefined ? { sleep: input.sleep } : {}), ...(input.onretry !== undefined ? { onretry: input.onretry } : {}), ...(input.now !== undefined ? { now: input.now } : {}) });
  const ok = input.success !== undefined ? input.success.includes(transport.status) : transport.statusclass === "success";
  return { transport, url, payload, ok, errors: ok ? [] : errorsof(transport.body) };
}

/** Wraps one reviewed graphql request into the request body envelope with the operation text, the variables and the operation name. */
export function graphqlopenvelope(request: graphqlrequest): string {
  return JSON.stringify({ query: request.query, ...(request.variables !== undefined ? { variables: request.variables } : {}), ...(request.operationname !== undefined ? { operationName: request.operationname } : {}) });
}

/** Unwraps a graphql response into its data block and every returned error mapped to a plain string. */
export function unwrapgraphql(value: unknown): { data?: unknown; errors: string[] } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { errors: ["The graphql response is not a json object."] };
  const record = value as Record<string, unknown>;
  const errors = Array.isArray(record.errors) ? record.errors.map(item => typeof item === "string" ? item : item && typeof item === "object" && typeof (item as Record<string, unknown>).message === "string" ? (item as Record<string, unknown>).message as string : String(item)) : [];
  return { ...(record.data !== undefined ? { data: record.data } : {}), errors };
}

/**
 * Executes one reviewed graphql query or mutation against a typed endpoint: the operation wraps with its variables and operation name, and the response unwraps its data block while every returned error maps into the step result details.
 */
export async function callgraphql(input: { endpoint: endpointrecord; request: graphqlrequest; options?: fetchoptions; transport: fetchtransport; sleep?: (milliseconds: number) => Promise<void>; onretry?: (attempt: number, wait: number, reason: string) => void; now?: () => number }): Promise<{ transport: calltransport; data?: unknown; errors: string[] }> {
  const request: fetchrequest = { url: input.endpoint.url, method: "POST", ...(input.endpoint.headers !== undefined ? { headers: input.endpoint.headers } : {}), body: graphqlopenvelope(input.request) };
  const transport = await sendfetch({ request, ...(input.options !== undefined ? { options: input.options } : {}), transport: input.transport, ...(input.sleep !== undefined ? { sleep: input.sleep } : {}), ...(input.onretry !== undefined ? { onretry: input.onretry } : {}), ...(input.now !== undefined ? { now: input.now } : {}) });
  try {
    const unwrapped = unwrapgraphql(JSON.parse(transport.body));
    return { transport, ...(unwrapped.data !== undefined ? { data: unwrapped.data } : {}), errors: unwrapped.errors };
  } catch {
    return { transport, errors: [transport.body] };
  }
}


/* ── Merged from httpserve.ts: the 1.1.88 consolidation interns the correlated httpserve logic here, so no variation of the same file lives beside another. ── */
import { bindlocalhost, localhostbind, parseframe, rpcerrorof } from "./mcp.js";
import { encodemessage, decodemessage, framesof, isnotification } from "./serve.js";

/**
 * Http transport of the 1.1.84 mcp server mode.
 * Every streamable http concern lives in this file: the localhost bind with its documented default and the reviewed remote bind behind the explicit review, the posted envelope intake that parses one posted json rpc message — a bare frame or a batch — through the same frame pipeline the remote family owns, the server sent event frames of the stream channel with their event ids so a client resumes after a reconnect, the tls decision that turns on exactly when the user provides a certificate while an unverified peer refuses under the required mode, and the auth handshake requirement that keeps every non localhost connection behind the token exchange while localhost stays direct.
 * The transport stays pure: the node listener reaches it through injected seams only, the bind, the port, the endpoint path and the tls material stay user choices with no code default beyond the documented localhost bind, and no certificate, endpoint or provider is ever hardcoded.
 */

/** Builds the http transport endpoint record of one server config: the bind with its port, the localhost state and the posted endpoint path the streamable transport serves. */
export function httpendpoint(config: mcpserverconfig): { kind: transportkind; endpoint: string; bind: string; port: number; localhost: boolean; path: string } {
  const binding = bindlocalhost(config);
  const path = config.httpstream?.endpoint !== undefined && config.httpstream.endpoint.trim() !== "" ? config.httpstream.endpoint.trim() : "/mcp";
  return { kind: "http", endpoint: `http://${binding.bind}:${binding.port}${path}`, bind: binding.bind, port: binding.port, localhost: binding.localhost, path };
}

/** Decides the tls termination of one http transport: the transport speaks tls exactly when the user provides a certificate, the presented fingerprint must match the reviewed one under the required mode and an unverified peer refuses while the off mode keeps the plain localhost listener. */
export function tlsdecision(input: { config: tlsconfig; presented?: { fingerprint?: string }; now: number }): { tls: boolean; verified: boolean; reason?: string } {
  return starttls({ config: input.config, ...(input.presented !== undefined ? { presented: input.presented } : {}), now: input.now });
}

/** Requires the auth handshake of one posted frame: a localhost connection stays direct while any non localhost connection must present a verified session token through the same pipeline the remote family owns — the pipeline answers the refusal error the listener returns. */
export async function postauth(input: { config: mcpserverconfig; local: boolean; tokens: sessiontoken[]; rawtoken?: string; fingerprint?: string; toolname?: string; now: number }): Promise<{ error?: { code: string; message: string; retryhint: "retry" | "wait" | "none" }; token?: sessiontoken }> {
  if (input.local) return {};
  if (input.fingerprint === undefined || input.fingerprint.trim() === "") return { error: { code: "consentrefused", message: "A non localhost connection must complete the auth handshake before any frame routes.", retryhint: "none" } };
  const pipeline = await httpframepipeline({ config: input.config, tokens: input.tokens, ...(input.rawtoken !== undefined ? { rawtoken: input.rawtoken } : {}), allowlist: [], fingerprint: input.fingerprint, ...(input.toolname !== undefined ? { toolname: input.toolname } : {}), now: input.now });
  if (pipeline.error !== undefined) return { error: { code: pipeline.error.code, message: pipeline.error.message, retryhint: "none" } };
  return pipeline.token !== undefined ? { token: pipeline.token } : {};
}

/** Parses one posted body into its wire message: a bare frame parses as itself, an array parses as a batch and anything else refuses with the parse error the listener answers. */
export function parsepost(body: string): { message?: jsonrpcframe | jsonrpcframe[]; error?: { code: string; message: string } } {
  try {
    const parsed = JSON.parse(body) as unknown;
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return { error: { code: "parse", message: "The posted body does not parse as one json rpc message." } }; /* an empty batch carries no call and refuses like every other invalid request */
      const frames: jsonrpcframe[] = [];
      for (const entry of parsed) frames.push(parseframe(JSON.stringify(entry)));
      return { message: frames };
    }
    return { message: parseframe(body) };
  } catch {
    return { error: { code: "parse", message: "The posted body does not parse as one json rpc message." } };
  }
}

/** Encodes the http answer of one handled frame: the json body the post returns with its newline terminator so a line reader consumes it too. */
export function httpanswer(frame: jsonrpcframe): string {
  return `${encodemessage(frame)}\n`;
}

/** Formats one server sent event of the stream channel: the event id the client resumes after, the event name and the json data line pair; the id advances with every event the channel emits. */
export function sseframe(input: { id: number; event: string; frame: jsonrpcframe }): string {
  return `id: ${input.id}\nevent: ${input.event}\ndata: ${JSON.stringify(input.frame)}\n\n`;
}

/** Builds the stream channel endpoint record of one server config: the stream path beside the posted endpoint, on the same localhost bind and port while the channel rides its own path. */
export function streampathof(config: mcpserverconfig): { path: string; bind: string; port: number; localhost: boolean } {
  const binding = bindlocalhost(config);
  const path = config.httpstream?.streampath !== undefined && config.httpstream.streampath.trim() !== "" ? config.httpstream.streampath.trim() : "/mcp/stream";
  return { path, bind: binding.bind, port: binding.port, localhost: binding.localhost };
}

/** Answers whether one requested path is the posted endpoint or the stream channel of the configured transport; any other path refuses with the method error. */
export function routepath(config: mcpserverconfig, path: string): "endpoint" | "stream" | undefined {
  const endpoint = httpendpoint(config).path;
  const stream = streampathof(config).path;
  if (path === endpoint) return "endpoint";
  if (path === stream) return "stream";
  return undefined;
}

/** The documented bind of the http listener: localhost only, kept beside the transport so the serve state and the docs share one name. */
export const documentedbind = localhostbind;


/* ── Merged from httpstream.ts: the 1.1.88 consolidation interns the correlated httpstream logic here, so no variation of the same file lives beside another. ── */
import { namespaceof } from "./tools.js";
import { authrefusedmessage, checkallowlist, scopecheck, tlsstateof, verifytoken } from "./auth.js";

/**
 * Http stream transport of the 1.1.55 agent protocol part two.
 * Every remote transport concern lives in this file: the http stream config with the posted json rpc endpoint and the server sent event channel paths, the stream channels the server keeps open for client streams, the heartbeat rhythm that keeps idle channels alive and closes dead ones, the tls termination that requires valid certificates before any remote traffic, the user configured client ceiling, the remote status report of endpoint, tls and client counts, and the ordered frame pipeline that terminates tls first, verifies the session token on every frame, checks the allowlist and runs the namespace scope check before any consent gate — auth failures answer with one fixed json rpc error so the pairing state never leaks.
 * The transport stays honest: the browser runtime exposes no listening socket, so the frame intake rides the same seam as the stdio bridge while the endpoint, tls mode, heartbeat and ceiling all stay user configured with no code ceiling and no hardcoded endpoint or certificate.
 */

/** The documented default heartbeat interval of the event channels; any user configured rhythm wins. */
export const defaultheartbeatms = 30_000;

/** The documented default idle window after which a silent channel counts as dead; any user configured window wins. */
export const defaultidlewindowms = 90_000;

/** The documented default http stream config: the posted json rpc endpoint path, the server sent event channel path, tls off for the localhost default and the documented heartbeat rhythm. */
export function defaulthttpstream(): httpstreamconfig {
  return { endpoint: "/mcp", streampath: "/mcp/stream", tls: { mode: "off" }, heartbeatms: defaultheartbeatms, idlewindowms: defaultidlewindowms };
}

/** Opens one server sent event channel for a remote client stream: the open and first heartbeat times ride the record. */
export function openstreamchannel(input: { clientid: string; now: number; id?: string }): streamchannel {
  return { id: input.id ?? `channel-${randomchannelid()}`, clientid: input.clientid, openedat: input.now, lastbeatat: input.now };
}

/** Draws one local channel identifier without a network dependency. */
function randomchannelid(): string {
  return crypto.randomUUID();
}

/** Stamps one heartbeat on every open channel of a client so idle channels stay alive. */
export function heartbeat(input: { channels: streamchannel[]; clientid: string; now: number }): streamchannel[] {
  return input.channels.map(channel => channel.clientid === input.clientid && channel.closedat === undefined ? { ...channel, lastbeatat: input.now } : channel);
}

/** Reports whether one channel stays live: an open channel inside its idle window counts as alive while closed channels and silent ones past the window count as dead. */
export function channellive(channel: streamchannel, now: number, idlewindow?: number): boolean {
  if (channel.closedat !== undefined) return false;
  return now - channel.lastbeatat < (idlewindow ?? defaultidlewindowms);
}

/** Closes every dead channel: silent channels past the user configured idle window close while live channels stay open. */
export function closeidlechannels(input: { channels: streamchannel[]; now: number; idlewindow?: number }): streamchannel[] {
  return input.channels.map(channel => channel.closedat === undefined && !channellive(channel, input.now, input.idlewindow) ? { ...channel, closedat: input.now } : channel);
}

/** Terminates tls before any remote traffic: the off mode keeps the documented localhost default, the on mode negotiates while the required mode refuses any peer without a valid certificate that matches the user configured fingerprint. */
export function starttls(input: { config: tlsconfig; presented?: { fingerprint?: string }; now: number }): { tls: boolean; verified: boolean; reason?: string } {
  if (input.config.mode === "off") return { tls: false, verified: false };
  if (input.config.mode === "required" && input.presented?.fingerprint === undefined) return { tls: false, verified: false, reason: "The remote transport requires tls and the peer presented no certificate." };
  if (input.config.certificatefingerprint !== undefined && input.presented?.fingerprint !== input.config.certificatefingerprint) return { tls: false, verified: false, reason: "The peer certificate does not match the user configured fingerprint and the remote traffic is refused." };
  return { tls: true, verified: true };
}

/** Enforces the user configured client ceiling: a configured maximum refuses connections past it while an absent value keeps the client count unbounded. */
export function enforcemaxclients(input: { clients: clientrecord[]; maxclients?: number }): { allowed: boolean; reason?: string } {
  if (input.maxclients === undefined) return { allowed: true };
  if (!Number.isFinite(input.maxclients)) return { allowed: false, reason: `The user configured maximum of ${input.maxclients} remote clients is invalid and the connection is refused.` }; /* a nonsensical ceiling fails closed */
  const connected = input.clients.filter(client => client.disconnectedat === undefined).length;
  if (connected >= input.maxclients) return { allowed: false, reason: `The user configured maximum of ${input.maxclients} remote clients is reached and the connection is refused.` };
  return { allowed: true };
}

/** Reports the remote transport status: the advertised endpoint, the tls state, the client counts, the open and dead stream channels and the live token count. */
export function listremotestatus(input: { config: mcpserverconfig; channels: streamchannel[]; clients: clientrecord[]; tokens: sessiontoken[]; now: number }): { endpoint: string; tls: { mode: string; certificaterequired: boolean; verified: boolean }; clients: number; paired: number; channelsopen: number; channelsdead: number; tokenslive: number } {
  const stream = input.config.httpstream ?? defaulthttpstream();
  const remote = input.config.remoteaccess;
  const idlewindow = stream.idlewindowms;
  const open = input.channels.filter(channel => channellive(channel, input.now, idlewindow));
  return { endpoint: remote?.endpoint ?? stream.endpoint, tls: tlsstateof(remote?.tls ?? stream.tls), clients: input.clients.filter(client => client.disconnectedat === undefined).length, paired: input.clients.filter(client => client.paired && client.disconnectedat === undefined).length, channelsopen: open.length, channelsdead: input.channels.length - open.length, tokenslive: input.tokens.filter(token => token.revokedat === undefined && input.now < token.expiresat).length };
}

/**
 * Runs the ordered intake pipeline of one remote frame: tls terminates first, the session token verifies on every frame, the allowlist refuses unknown fingerprints and the namespace scope check runs before any consent gate so unknown tools fail fast.
 * A clean frame returns the verified token; every failure returns its json rpc error while auth failures answer with the fixed message that leaks no pairing state.
 */
export async function httpframepipeline(input: { config: mcpserverconfig; presented?: { fingerprint?: string }; tokens: sessiontoken[]; rawtoken?: string; allowlist: allowlistentry[]; fingerprint: string; toolname?: string; now: number }): Promise<{ error?: rpcerror; token?: sessiontoken }> {
  const stream = input.config.httpstream ?? defaulthttpstream();
  const tls = starttls({ config: input.config.remoteaccess?.tls ?? stream.tls, ...(input.presented !== undefined ? { presented: input.presented } : {}), now: input.now });
  if (tls.reason !== undefined) return { error: rpcerrorof("consentrefused", tls.reason) };
  if (input.rawtoken === undefined) return { error: rpcerrorof("consentrefused", authrefusedmessage) };
  const verified = await verifytoken({ tokens: input.tokens, raw: input.rawtoken, now: input.now });
  if (verified.token === undefined) return { error: rpcerrorof("consentrefused", verified.reason ?? authrefusedmessage) };
  const namespace = input.toolname !== undefined ? namespaceof(input.toolname) : undefined;
  const listed = checkallowlist({ entries: input.allowlist, fingerprint: input.fingerprint, ...(namespace !== undefined ? { namespace } : {}) });
  if (!listed.allowed) return { error: rpcerrorof("consentrefused", listed.reason ?? "The allowlist refused the client.") };
  const scoped = scopecheck(verified.token, namespace);
  if (!scoped.allowed) return { error: rpcerrorof(scoped.fast === true ? "params" : "consentrefused", scoped.reason ?? "The tool call stayed outside the granted scopes.") };
  return { token: verified.token };
}


/* ── Merged from relayserve.ts: the 1.1.88 consolidation interns the correlated relayserve logic here, so no variation of the same file lives beside another. ── */
import { composeenvelope, contractcapabilities, parsewireframe, servercontractversion } from "./bridge.js";

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
export function newrelayserverstate(): relayserverstate {
  return { sessions: [], pairings: [], connections: [], tokens: [], issued: 0 };
}

/** Registers one connection the relay accepted: the connection starts with no role, no session and no token; the frame handler fills them as the servercontract handshake proceeds. */
export function relayconnectionopen(state: relayserverstate, connectionid: string, now: number): relayserverstate {
  if (connectionid.trim() === "") throw new Error("The relay names every connection; an empty connection id never registers.");
  if (state.connections.some(connection => connection.id === connectionid)) return state;
  return { ...state, connections: [...state.connections, { id: connectionid, role: "", sessionid: "", tokenhash: "", lastframeat: now }] };
}

/** Removes one connection the relay lost: the session keeps its event log, the member slot frees for a rejoin, the memory-only token record of the connection drops with it and the pairing codes stay pending until they expire. */
export function relayconnectionclose(state: relayserverstate, connectionid: string): relayserverstate {
  return { ...state, connections: state.connections.filter(connection => connection.id !== connectionid), tokens: state.tokens.filter(record => record.connectionid !== connectionid) };
}

/** Reads the live token hashes of one session: the hashes the session issued minus the revoked ones — the frame authentication checks every incoming token against this list. */
export function relaylivetokens(session: relayserversession): string[] {
  return session.tokenhashes.filter(hash => !session.revoked.includes(hash));
}

/** Encodes one envelope as the wire frame text the runner writes onto the socket: the plain json text of the servercontract codec. */
export function relayframeof(envelope: Omit<serverenvelope, "version"> & { version?: number }): string {
  return JSON.stringify(composeenvelope({ ...envelope, version: envelope.version ?? servercontractversion }));
}

/** Handles one wire frame of one connection: the frame parses through the servercontract codec, the sessioncreate operation opens a session for the extension member (issuing its token and registering the pairing code when the frame carries one), the sessionjoin operation redeems a pairing code for the site member or rotates the token of a returning member, the eventpost operation routes the event to the other member of the session, and the eventstream operation acks the subscription — every other frame answers the outside the contract error and a failed token authentication answers the refusal without touching the session state. */
export function relayserverframe(input: { state: relayserverstate; connectionid: string; frame: string; now: number; idof?: relayidseam; hashof?: relayhashseam }): { state: relayserverstate; replies: string[]; routed: Array<{ connectionid: string; frame: string }> } {
  const idof: relayidseam = input.idof ?? ((): string => {
    const next = input.state.issued + 1;
    return `${next}`;
  });
  const hashof: relayhashseam = input.hashof ?? ((token: string): string => token);
  const connection = input.state.connections.find(entry => entry.id === input.connectionid);
  if (connection === undefined) return { state: input.state, replies: [], routed: [] };
  let envelope: serverenvelope;
  try {
    envelope = parsewireframe(input.frame);
  } catch {
    return { state: input.state, replies: [relayframeof({ op: "eventpost", opid: "op-relay-parse", at: input.now, body: { error: "The frame does not parse as a servercontract envelope." } })], routed: [] };
  }
  const touched: relayserverconnection = { ...connection, lastframeat: input.now };
  const base: relayserverstate = { ...input.state, connections: input.state.connections.map(entry => entry.id === touched.id ? touched : entry), issued: input.state.issued + 1 };
  if (envelope.op === "sessioncreate") {
    const body = envelope.body ?? {};
    if (body.role !== "extension") {
      return { state: base, replies: [relayframeof({ op: "sessioncreate", opid: envelope.opid, at: input.now, body: { error: "The sessioncreate operation serves the extension member only." } })], routed: [] };
    }
    const sessionid = `session-${idof()}`;
    const token = `token-${idof()}`;
    const tokenhash = hashof(token);
    const session: relayserversession = { id: sessionid, extension: touched.id, site: undefined, events: [], tokenhashes: [tokenhash], revoked: [] };
    let pairings = base.pairings;
    const pairingcode = typeof body.pairingcode === "string" ? body.pairingcode.trim() : "";
    if (pairingcode !== "") pairings = [...pairings, { code: pairingcode, sessionid, expiresat: input.now + 300000, used: false }];
    const memberid = typeof body.memberid === "string" ? body.memberid : "";
    const reply = relayframeof({ op: "sessioncreate", opid: envelope.opid, sessionid, token, at: input.now, body: { sessionid, token, capabilities: contractcapabilities(), members: [{ role: "extension", id: memberid, joinedat: input.now }] } });
    return {
      state: {
        ...base,
        sessions: [...base.sessions, session],
        pairings,
        connections: base.connections.map(entry => entry.id === touched.id ? { ...entry, role: "extension", sessionid, tokenhash } : entry),
        tokens: [...base.tokens.filter(record => record.connectionid !== touched.id), { connectionid: touched.id, token }],
      },
      replies: [reply],
      routed: [],
    };
  }
  if (envelope.op === "sessionjoin") {
    const body = envelope.body ?? {};
    const pairingcode = typeof body.pairingcode === "string" ? body.pairingcode.trim() : "";
    if (pairingcode !== "" && body.role === "site") {
      const pairing = base.pairings.find(entry => entry.code === pairingcode && !entry.used && input.now < entry.expiresat);
      const session = pairing === undefined ? undefined : base.sessions.find(entry => entry.id === pairing.sessionid);
      if (pairing === undefined || session === undefined) {
        return { state: base, replies: [relayframeof({ op: "sessionjoin", opid: envelope.opid, at: input.now, body: { error: "The pairing code matches no pending session of this relay." } })], routed: [] };
      }
      if (session.site !== undefined) {
        return { state: base, replies: [relayframeof({ op: "sessionjoin", opid: envelope.opid, at: input.now, body: { error: "The relay session holds at most one site member." } })], routed: [] };
      }
      const token = `token-${idof()}`;
      const tokenhash = hashof(token);
      const reply = relayframeof({ op: "sessionjoin", opid: envelope.opid, sessionid: session.id, token, at: input.now, body: { sessionid: session.id, token, capabilities: contractcapabilities() } });
      return {
        state: {
          ...base,
          sessions: base.sessions.map(entry => entry.id === session.id ? { ...entry, site: touched.id, tokenhashes: [...entry.tokenhashes, tokenhash] } : entry),
          pairings: base.pairings.map(entry => entry.code === pairingcode ? { ...entry, used: true } : entry),
          connections: base.connections.map(entry => entry.id === touched.id ? { ...entry, role: "site", sessionid: session.id, tokenhash } : entry),
          tokens: [...base.tokens.filter(record => record.connectionid !== touched.id), { connectionid: touched.id, token }],
        },
        replies: [reply],
        routed: [],
      };
    }
    const session = base.sessions.find(entry => entry.id === envelope.sessionid);
    const tokenhash = typeof envelope.token === "string" ? hashof(envelope.token) : "";
    if (session === undefined || tokenhash === "" || !relaylivetokens(session).includes(tokenhash)) {
      return { state: base, replies: [relayframeof({ op: "sessionjoin", opid: envelope.opid, at: input.now, body: { error: "The sessionjoin frame failed the token authentication." } })], routed: [] };
    }
    const token = `token-${idof()}`;
    const nexttokenhash = hashof(token);
    const role = body.role === "extension" || body.role === "site" ? body.role : touched.role;
    const reply = relayframeof({ op: "sessionjoin", opid: envelope.opid, sessionid: session.id, token, at: input.now, body: { sessionid: session.id, token, capabilities: contractcapabilities(), rotated: true } });
    return {
      state: {
        ...base,
        sessions: base.sessions.map(entry => entry.id === session.id ? { ...entry, tokenhashes: [...entry.tokenhashes, nexttokenhash], revoked: [...entry.revoked, tokenhash], ...(role === "extension" ? { extension: touched.id } : role === "site" ? { site: touched.id } : {}) } : entry),
        connections: base.connections.map(entry => entry.id === touched.id ? { ...entry, role: role === "" ? entry.role : role, sessionid: session.id, tokenhash: nexttokenhash } : entry),
        tokens: [...base.tokens.filter(record => record.connectionid !== touched.id), { connectionid: touched.id, token }],
      },
      replies: [reply],
      routed: [],
    };
  }
  const session = base.sessions.find(entry => entry.id === envelope.sessionid);
  const tokenhash = typeof envelope.token === "string" ? hashof(envelope.token) : "";
  if (session === undefined || tokenhash === "" || !relaylivetokens(session).includes(tokenhash)) {
    return { state: base, replies: [relayframeof({ op: envelope.op, opid: envelope.opid, at: input.now, body: { error: "The frame failed the token authentication of its session." } })], routed: [] };
  }
  if (envelope.op === "eventstream") {
    const streams = Array.isArray(envelope.body?.streams) ? envelope.body?.streams : [];
    const reply = relayframeof({ op: "eventstream", opid: envelope.opid, sessionid: session.id, ...(envelope.token !== undefined ? { token: envelope.token } : {}), at: input.now, body: { streams, subscribed: true } });
    return { state: base, replies: [reply], routed: [] };
  }
  if (envelope.op === "eventpost") {
    const kind = typeof envelope.body?.kind === "string" ? envelope.body.kind : "";
    const stream = typeof envelope.body?.stream === "string" ? envelope.body.stream : "";
    const event = { opid: envelope.opid, kind, stream, at: input.now };
    const routed = [session.extension, session.site].filter((id): id is string => id !== undefined && id !== touched.id).map(memberid => {
      const membertoken = base.tokens.find(record => record.connectionid === memberid)?.token ?? "";
      return { connectionid: memberid, frame: relayframeof({ op: "eventpost", opid: envelope.opid, sessionid: session.id, token: membertoken, at: input.now, body: envelope.body ?? {} }) };
    });
    const reply = relayframeof({ op: "eventpost", opid: envelope.opid, sessionid: session.id, ...(envelope.token !== undefined ? { token: envelope.token } : {}), at: input.now, body: { accepted: true } });
    return {
      state: { ...base, sessions: base.sessions.map(entry => entry.id === session.id ? { ...entry, events: [...entry.events, event] } : entry) },
      replies: [reply],
      routed,
    };
  }
  return { state: base, replies: [relayframeof({ op: envelope.op, opid: envelope.opid, at: input.now, body: { error: "The operation sits outside the servercontract." } })], routed: [] };
}

/** Lists the connection ids the idle sweep closes: a connection quiet past the window the operator chose leaves, while an absent window never expires a connection because the bound stays the operator's choice. */
export function relayidleconnections(state: relayserverstate, now: number, idlewindow?: number): string[] {
  if (idlewindow === undefined || !Number.isFinite(idlewindow) || idlewindow <= 0) return [];
  return state.connections.filter(connection => now - connection.lastframeat >= idlewindow).map(connection => connection.id);
}

/** Reads the pairing codes pending redemption: the codes the extension side registered, still unused and still inside their lifetime — the list the self hosting walkthrough prints so the operator pairs the site side. */
export function relaypendingpairings(state: relayserverstate, now: number): string[] {
  return state.pairings.filter(pairing => !pairing.used && now < pairing.expiresat).map(pairing => pairing.code);
}


/* ── Merged from stdioserve.ts: the 1.1.88 consolidation interns the correlated stdioserve logic here, so no variation of the same file lives beside another. ── */

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
export function splitlines(buffer: string): { lines: string[]; rest: string } {
  if (!buffer.includes("\n")) return { lines: [], rest: buffer };
  const parts = buffer.split("\n");
  const rest = parts.pop() ?? "";
  const lines = parts.map(line => line.trim()).filter(line => line !== "");
  return { lines, rest };
}

/** Creates one stdio transport record for the serve state: the pipe channel of the spawned serve process with its frame counters at zero. */
export function stdiotransport(now: number): stdiotransportrecord {
  return { kind: "stdio", endpoint: "stdio://devthink", startedat: now, received: 0, sent: 0 };
}

/** Creates the line pump of one stdio session: raw stdin chunks feed the pump, complete lines decode through the message codec, every frame of the decoded message routes through the handler seam and every response frame encodes newline delimited back through the write seam — notifications carry no id and stay unanswered while a handler that throws answers the internal error frame so a failing frame never kills the transport. */
export function createlinepump(input: { write: (line: string) => void; handle: (frame: jsonrpcframe) => Promise<jsonrpcframe | undefined>; now: number }): { feed: (chunk: string) => Promise<void>; record: () => stdiotransportrecord; close: (now: number) => stdiotransportrecord } {
  let buffer = "";
  let record = stdiotransport(input.now);
  const feed = async (chunk: string): Promise<void> => {
    buffer = `${buffer}${chunk}`;
    for (;;) {
      const newline = buffer.indexOf("\n");
      if (newline < 0) return;
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line === "") continue;
      record = { ...record, received: record.received + 1, lastframeat: input.now };
      const decoded = decodemessage(line);
      if (decoded.error !== undefined) {
        input.write(`${JSON.stringify({ jsonrpc: "2.0", id: null, error: decoded.error })}\n`);
        record = { ...record, sent: record.sent + 1 };
        continue;
      }
      const frames = framesof(decoded.message as jsonrpcframe | jsonrpcframe[]);
      const answers: jsonrpcframe[] = [];
      for (const frame of frames) {
        if (isnotification(frame)) continue;
        try {
          const answer = await input.handle(frame);
          if (answer !== undefined) answers.push(answer);
        } catch (error) {
          answers.push({ jsonrpc: "2.0", id: frame.id ?? null, error: { code: "internal", message: error instanceof Error ? error.message : String(error) } });
        }
      }
      for (const answer of answers) {
        input.write(`${encodemessage(answer)}\n`);
        record = { ...record, sent: record.sent + 1 };
      }
    }
  };
  return { feed, record: () => record, close: (now: number) => { record = { ...record, closedat: now }; return record; } };
}

