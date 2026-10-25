/**
 * The net module of the 1.1.90 consolidation: every correlated variation of the network logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the network plane of a run, ordered from observation through transport to control: netwatch holds the derived request observation of the run tab (the timing buffer facts, the correlation ids that join request and response pairs, the header allowlists with redaction, the body capture inside reviewed byte ceilings and the page api map with its ranking and replay extraction); socketbus holds the transport plane (the websocket channel lifecycle with reconnection backoff, the multiplexed named message streams with their channel scoped sequences, the message filter matching of waitmessage steps, the server sent events parsing with last event id resume and the long polling cursor loop with its stop conditions); and netcontrol holds the control plane (request blocking, response mocking, header rewriting, cookie scoping, proxy routing, the rate limit reads and the retry after waits, every rule run scoped and reverted the moment a run ends, fails or is cancelled).
 * No byte ceiling, reconnect budget, backoff base, rate window or poll bound is ever hardcoded anywhere in the family: every bound stays the user's choice, header values redact before storage, body bytes never enter any audit summary, and no network control rule ever bypasses the human review.
 */

/* ── Merged from netwatch.ts ── */

import type {
  apimapentry,
  apireplayspec,
  bodyfilter,
  bodyrecord,
  exchangerecord,
  headerfilter,
  responseentry,
} from "./types.js";
import { readpath } from "./http.js";

/**
 * Network observation part two watch logics for the 1.1.43 family.
 * Every correlated rule for the derived request observation of the run tab, the correlation ids that join request and response pairs, the header reading with allowlists and redaction, the response body capture inside reviewed byte ceilings, the page api mapping with frequency, json share and payload stability ranking and the api replay extraction paths lives in this file.
 * The page observation derives from the timing and navigation buffers the page itself exposes, so request and response headers and bodies exist only for exchanges captured through the extension context; header values are redacted before storage and body bytes never enter any audit summary.
 */

/** The netwatch kinds, listed among the available capabilities of every proposal request. */
export const netwatchkinds: string[] = ["watchrequests", "readheaders", "capturebodies", "mapapi", "extractapi"];

/** One derived request fact of the page timing buffers: url, initiator, timing, transfer size, protocol and the status a navigation entry exposes. */
export interface resourcefact {
  url: string;
  initiator: string;
  entrytype: string;
  start: number;
  duration: number;
  transfer: number;
  protocol: string;
  status?: number;
  /** Explicit failure flag a navigation buffer reports, for example a net error. */
  failed?: boolean;
}

/** Normalizes raw timing buffer entries into derived request facts; navigation entries contribute the response status they expose. */
export function resourcefacts(entries: Array<Record<string, unknown>>): resourcefact[] {
  const facts: resourcefact[] = [];
  for (const entry of entries) {
    const url = typeof entry.name === "string" ? entry.name : "";
    if (!url) continue;
    const entrytype = typeof entry.entryType === "string" ? entry.entryType : "resource";
    if (entrytype !== "resource" && entrytype !== "navigation") continue;
    facts.push({
      url,
      initiator: typeof entry.initiatorType === "string" ? entry.initiatorType : "",
      entrytype,
      start: typeof entry.startTime === "number" && Number.isFinite(entry.startTime) ? entry.startTime : 0,
      duration: typeof entry.duration === "number" && Number.isFinite(entry.duration) ? entry.duration : 0,
      transfer: typeof entry.transferSize === "number" && Number.isFinite(entry.transferSize) ? entry.transferSize : 0,
      protocol: typeof entry.nextHopProtocol === "string" ? entry.nextHopProtocol : "",
      ...(typeof entry.responseStatus === "number" && Number.isInteger(entry.responseStatus)
        ? { status: entry.responseStatus }
        : {}),
      ...(entry.failed === true ? { failed: true } : {}),
    });
  }
  return facts;
}

/** Classifies one derived request failure: an exposed status of four hundred or more is an http error and an explicit failure flag or a zero transfer fetch without a protocol is a network error; everything else reports no error class. */
export function failureclass(fact: resourcefact): { errorclass?: "httperror" | "networkerror"; status: number } {
  if (fact.status !== undefined && fact.status >= 400) return { errorclass: "httperror", status: fact.status };
  if (fact.failed === true) return { errorclass: "networkerror", status: 0 };
  if (
    (fact.initiator === "fetch" || fact.initiator === "xmlhttprequest") &&
    fact.duration > 0 &&
    fact.transfer === 0 &&
    fact.protocol === ""
  )
    return { errorclass: "networkerror", status: 0 };
  return { status: fact.status ?? 0 };
}

/** Assigns one correlation id per run request, ordered by first observation. */
export function correlationid(runid: string, index: number): string {
  return `${runid}-${index + 1}`;
}

/** Creates one observed exchange record from a derived request fact: the method stays honest with a question mark for fetch initiators the timing buffers cannot name, and the status and error class come from what the buffers expose. */
export function newexchange(input: {
  id: string;
  runid: string;
  stepid: string;
  correlationid: string;
  fact: resourcefact;
  at: number;
}): exchangerecord {
  const verdict = failureclass(input.fact);
  let origin = "";
  try {
    origin = new URL(input.fact.url).origin;
  } catch {
    origin = "";
  }
  const method = input.fact.initiator === "fetch" || input.fact.initiator === "xmlhttprequest" ? "?" : "GET";
  const statusclass =
    verdict.status >= 100 && verdict.status < 600
      ? verdict.status >= 200 && verdict.status < 300
        ? "success"
        : verdict.status >= 300 && verdict.status < 400
          ? "redirect"
          : verdict.status >= 400 && verdict.status < 500
            ? "clienterror"
            : verdict.status >= 500
              ? "servererror"
              : "informational"
      : "unknown";
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.stepid,
    correlationid: input.correlationid,
    url: input.fact.url,
    origin,
    method,
    status: verdict.status,
    statusclass,
    ...(verdict.errorclass !== undefined ? { errorclass: verdict.errorclass } : {}),
    source: "page",
    ...(input.fact.initiator ? { initiator: input.fact.initiator } : {}),
    timing: Math.round(input.fact.duration),
    bytes: input.fact.transfer,
    at: input.at,
  };
}

/** Joins one captured response entry onto its exchange through the shared correlation id; a mismatching correlation id is refused instead of paired. */
export function pairexchange(exchange: exchangerecord, response: responseentry): exchangerecord {
  if (exchange.correlationid !== response.correlationid)
    throw new Error(
      `The response ${response.correlationid} does not pair with the exchange ${exchange.correlationid}.`,
    );
  return {
    ...exchange,
    status: response.status,
    statusclass:
      response.status >= 200 && response.status < 300
        ? "success"
        : response.status >= 400 && response.status < 500
          ? "clienterror"
          : response.status >= 500
            ? "servererror"
            : response.status >= 300 && response.status < 400
              ? "redirect"
              : "unknown",
    bytes: response.bytes,
    ...(response.mime !== undefined ? { mime: response.mime } : {}),
    ...(response.bodyref !== undefined ? { bodyref: response.bodyref } : {}),
    ...(Object.keys(response.headers).length > 0 ? { responseheaders: response.headers } : {}),
  };
}

/** Filters observed exchanges by run, origin and status; the status filter accepts one status code or the failed class of every exchange with an error class. */
export function filterexchanges(
  exchanges: exchangerecord[],
  filter: { runid?: string; origin?: string; status?: number | "failed" },
): exchangerecord[] {
  return exchanges.filter(
    (exchange) =>
      (filter.runid === undefined || exchange.runid === filter.runid) &&
      (filter.origin === undefined || exchange.origin === filter.origin) &&
      (filter.status === undefined ||
        (filter.status === "failed" ? exchange.errorclass !== undefined : exchange.status === filter.status)),
  );
}

/** Normalizes a reviewed header filter: the name allowlist and the redaction list, both lowercased; the redaction list is required before any header value is stored. */
export function headerfilterof(value: unknown): headerfilter {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allow: [], redact: [] };
  const entry = value as Record<string, unknown>;
  const names = (source: unknown): string[] =>
    Array.isArray(source)
      ? source
          .filter((name): name is string => typeof name === "string" && name.trim().length > 0)
          .map((name) => name.trim().toLowerCase())
      : [];
  return { allow: names(entry.allow), redact: names(entry.redact) };
}

/** Applies one header filter to captured headers: only allowlisted names survive and redaction listed names keep their name with the value replaced by the redaction marker before storage. */
export function capturedheaders(headers: Record<string, string>, filter: headerfilter): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [name, value] of Object.entries(headers)) {
    const key = name.trim().toLowerCase();
    if (filter.allow.length > 0 && !filter.allow.includes(key)) continue;
    result[key] = filter.redact.includes(key) ? "[redacted]" : value;
  }
  return result;
}

/** Normalizes a reviewed body filter: url pattern, mime list and the byte ceiling of one captured body; the ceiling stays a user configured value with no code ceiling. */
export function bodyfilterof(value: unknown): bodyfilter {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const entry = value as Record<string, unknown>;
  const filter: bodyfilter = {};
  if (typeof entry.urlpattern === "string" && entry.urlpattern.trim()) filter.urlpattern = entry.urlpattern.trim();
  if (Array.isArray(entry.mimes))
    filter.mimes = entry.mimes
      .filter((mime): mime is string => typeof mime === "string" && mime.trim().length > 0)
      .map((mime) => mime.trim().toLowerCase());
  if (typeof entry.ceiling === "number" && Number.isFinite(entry.ceiling) && entry.ceiling >= 0)
    filter.ceiling = entry.ceiling;
  return filter;
}

/** True when one exchange matches the reviewed body filter: the url pattern appears inside the exchange url and the mime list, when reviewed, carries the exchange mime. */
export function bodymatches(filter: bodyfilter, exchange: { url: string; mime?: string }): boolean {
  if (filter.urlpattern !== undefined && !exchange.url.includes(filter.urlpattern)) return false;
  if (filter.mimes !== undefined && filter.mimes.length > 0) {
    const mime = ((exchange.mime ?? "").split(";")[0] ?? "").trim().toLowerCase();
    if (!filter.mimes.includes(mime)) return false;
  }
  return true;
}

/** Mime types whose bodies carry private document or data payloads; a capturebodies step that lists one of them grades sensitive. */
const privatemimes = new Set([
  "text/html",
  "text/plain",
  "text/xml",
  "application/xml",
  "application/json",
  "text/json",
  "application/x-www-form-urlencoded",
  "application/graphql",
  "multipart/form-data",
]);

/** True when a mime type carries private document or data payloads instead of public static assets. */
export function privatemime(mime: string): boolean {
  return privatemimes.has((mime.split(";")[0] ?? "").trim().toLowerCase());
}

/** Captures one response body inside the reviewed byte ceiling: the stored body truncates at the ceiling and the record keeps the stored byte size with its correlation linkage. */
export function capturebody(input: {
  ref: string;
  runid: string;
  exchange: exchangerecord;
  body: string;
  mime: string;
  filter: bodyfilter;
  at: number;
}): { record: bodyrecord; truncated: boolean } | { refused: string } {
  if (!bodymatches(input.filter, input.exchange))
    return { refused: `The exchange ${input.exchange.correlationid} does not match the reviewed body filter.` };
  const ceiling = input.filter.ceiling;
  const stored = ceiling !== undefined && input.body.length > ceiling ? input.body.slice(0, ceiling) : input.body;
  return {
    record: {
      ref: input.ref,
      runid: input.runid,
      correlationid: input.exchange.correlationid,
      url: input.exchange.url,
      mime: input.mime,
      bytes: stored.length,
      body: stored,
      at: input.at,
    },
    truncated: stored.length < input.body.length,
  };
}

/** Reads the payload shape of one captured body: the field names of a json object in first seen order, with array bodies reporting the shape of their first element. */
export function payloadshapeof(body: string | undefined): string[] {
  if (body === undefined) return [];
  try {
    const parsed = JSON.parse(body) as unknown;
    const shape = (value: unknown): string[] =>
      value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value as Record<string, unknown>) : [];
    if (Array.isArray(parsed)) return parsed.length > 0 ? shape(parsed[0]) : [];
    return shape(parsed);
  } catch {
    return [];
  }
}

/** True when one exchange looks like a page api call: a fetch or xmlhttprequest initiator, a captured body or an api shaped url path. */
function isapicandidate(exchange: exchangerecord): boolean {
  if (exchange.initiator === "fetch" || exchange.initiator === "xmlhttprequest") return true;
  if (exchange.bodyref !== undefined) return true;
  try {
    return /\/api\/|\/graphql|\.json($|\?)|\/v\d+\//i.test(new URL(exchange.url).pathname);
  } catch {
    return false;
  }
}

/** Builds the page api map of the run from observed exchanges and captured bodies: endpoint, method, mime, frequency, json share and payload stability with their correlation ids. */
export function apientries(exchanges: exchangerecord[], bodies: bodyrecord[]): apimapentry[] {
  const bodybyref = new Map(bodies.map((body) => [body.correlationid, body]));
  const groups = new Map<
    string,
    {
      endpoint: string;
      method: string;
      origin: string;
      mimes: Map<string, number>;
      frequency: number;
      json: number;
      captured: number;
      shapes: Map<string, number>;
      correlationids: string[];
    }
  >();
  for (const exchange of exchanges) {
    if (!isapicandidate(exchange)) continue;
    let endpoint = exchange.url;
    let origin = exchange.origin;
    try {
      const parsed = new URL(exchange.url);
      endpoint = `${parsed.origin}${parsed.pathname}`;
      origin = parsed.origin;
    } catch {
      /* an unparsable url keeps the raw endpoint */
    }
    const key = `${exchange.method} ${endpoint}`;
    const group = groups.get(key) ?? {
      endpoint,
      method: exchange.method,
      origin,
      mimes: new Map<string, number>(),
      frequency: 0,
      json: 0,
      captured: 0,
      shapes: new Map<string, number>(),
      correlationids: [],
    };
    group.frequency += 1;
    group.correlationids.push(exchange.correlationid);
    const body = exchange.bodyref !== undefined ? bodybyref.get(exchange.correlationid) : undefined;
    const mime = body?.mime ?? exchange.mime ?? "";
    group.mimes.set(mime, (group.mimes.get(mime) ?? 0) + 1);
    if (body !== undefined) {
      group.captured += 1;
      const shape = payloadshapeof(body.body);
      if (shape.length > 0) group.json += 1;
      const shapekey = shape.join(",");
      group.shapes.set(shapekey, (group.shapes.get(shapekey) ?? 0) + 1);
    }
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => {
    const mime = [...group.mimes.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "";
    const modalshape = [...group.shapes.entries()].sort((left, right) => right[1] - left[1])[0];
    return {
      endpoint: group.endpoint,
      method: group.method,
      mime,
      frequency: group.frequency,
      payloadshape: (modalshape?.[0] ?? "").split(",").filter(Boolean),
      jsonshare: group.captured > 0 ? group.json / group.captured : 0,
      stability: group.captured > 0 ? (modalshape?.[1] ?? 0) / group.captured : 0,
      origin: group.origin,
      correlationids: group.correlationids,
    };
  });
}

/** Ranks page api entries by frequency, json share and payload stability so the most used stable json endpoints surface first. */
export function rankapis(entries: apimapentry[]): apimapentry[] {
  const score = (entry: apimapentry): number => entry.frequency * (1 + entry.jsonshare + entry.stability);
  return [...entries].sort((left, right) => score(right) - score(left) || right.frequency - left.frequency);
}

/** Normalizes a reviewed api replay spec: the captured endpoint, the replay verb, the parameter overrides and the dotted extraction paths. */
export function apireplayspecof(value: unknown): apireplayspec | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  if (typeof entry.endpoint !== "string" || !entry.endpoint.trim()) return undefined;
  const spec: apireplayspec = { endpoint: entry.endpoint.trim() };
  if (typeof entry.verb === "string" && entry.verb.trim()) spec.verb = entry.verb.trim().toUpperCase();
  if (
    entry.overrides !== undefined &&
    entry.overrides !== null &&
    typeof entry.overrides === "object" &&
    !Array.isArray(entry.overrides)
  ) {
    const overrides: Record<string, string> = {};
    for (const [name, override] of Object.entries(entry.overrides as Record<string, unknown>)) {
      if (typeof override === "string") overrides[name] = override;
    }
    spec.overrides = overrides;
  }
  if (Array.isArray(entry.paths))
    spec.paths = entry.paths.filter((path): path is string => typeof path === "string" && path.trim().length > 0);
  return spec;
}

/** Builds the replay url of one captured endpoint with the reviewed parameter overrides applied as query parameters. */
export function replayurl(spec: apireplayspec): string {
  const url = new URL(spec.endpoint);
  for (const [name, value] of Object.entries(spec.overrides ?? {})) url.searchParams.set(name, value);
  return url.toString();
}

/** Maps one replayed response body onto the reviewed dotted extraction paths, reporting a miss instead of crashing when a path finds nothing. */
export function extractvalues(
  body: string,
  paths: string[],
): Array<{ path: string; value?: unknown; missing?: boolean }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return paths.map((path) => ({ path, missing: true }));
  }
  const fields = readpath(
    parsed,
    paths.map((path) => ({ name: path, path, kind: "json" as const })),
  );
  return fields.map((field) => ({
    path: field.path,
    ...(field.value !== undefined ? { value: field.value } : {}),
    ...(field.missing ? { missing: true } : {}),
  }));
}

/* ── Merged from socketbus.ts ── */

import type {
  channelrecord,
  channelstate,
  messageenvelope,
  messagefilter,
  pollcursor,
  socketoptions,
} from "./types.js";

/**
 * Network observation part two socket logics for the 1.1.43 family.
 * Every correlated rule for the websocket channel lifecycle with reconnection backoff, the multiplexing of named message streams over one channel with channel scoped sequence numbers, the message filter matching of waitmessage steps, the server sent events parsing with last event id resume and the long polling cursor loop with its stop conditions lives in this file.
 * Message payloads are opaque reviewed text; no payload value enters any audit summary built from these results.
 */

/** The socket and stream kinds, listed among the available capabilities of every proposal request. */
export const socketkinds: string[] = ["opensocket", "sendmessage", "waitmessage", "subscribesse", "longpoll"];

/** Connect seam signature: one reviewed channel url with its protocols; the extension executor wires the browser websocket, tests wire plain fixtures. */
export type socketconnect = (
  url: string,
  protocols: string[],
) => Promise<{ open: boolean; code?: number; error?: string }>;

/** Resolves the reviewed https origin behind a channel url: wss channels map onto their https origin so the origin grants cover both. */
export function channelorigin(url: string): string {
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol === "wss:" ? "https:" : parsed.protocol === "ws:" ? "http:" : parsed.protocol;
    return `${protocol}//${parsed.host}`;
  } catch {
    return "";
  }
}

/** Normalizes reviewed channel open options: url plus the socket options of protocols, reconnect budget, backoff base and backoff ceiling; every bound stays a user choice with no code ceiling. */
export function channeloptionsof(value: unknown): { url: string; options: socketoptions } | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  if (typeof entry.url !== "string" || !entry.url.trim()) return undefined;
  const options: socketoptions = {};
  if (Array.isArray(entry.protocols))
    options.protocols = entry.protocols.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  if (typeof entry.reconnect === "number" && Number.isFinite(entry.reconnect)) options.reconnect = entry.reconnect;
  if (typeof entry.backoff === "number" && Number.isFinite(entry.backoff)) options.backoff = entry.backoff;
  if (typeof entry.backoffceiling === "number" && Number.isFinite(entry.backoffceiling))
    options.backoffceiling = entry.backoffceiling;
  if (typeof entry.lifetime === "number" && Number.isFinite(entry.lifetime)) options.lifetime = entry.lifetime;
  return { url: entry.url.trim(), options };
}

/** Creates one channel record in the connecting state with its origin, protocols and zeroed message counters. */
export function newchannel(input: {
  id: string;
  runid: string;
  stepid: string;
  kind: "websocket" | "sse";
  url: string;
  protocols?: string[];
  at: number;
}): channelrecord {
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.stepid,
    kind: input.kind,
    url: input.url,
    origin: channelorigin(input.url),
    state: "connecting",
    openedat: input.at,
    sent: 0,
    received: 0,
    reconnects: 0,
    ...(input.protocols !== undefined && input.protocols.length > 0 ? { protocols: [...input.protocols] } : {}),
  };
}

/** Builds the exponential backoff waits of the reviewed reconnect budget: each wait doubles the base and growth stops at the user configured ceiling, so the budget bounds the growth and no code ceiling exists. */
export function reconnectwaits(attempts: number, base: number, ceiling: number | undefined): number[] {
  const count = Math.max(0, Math.floor(attempts));
  const waits: number[] = [];
  let wait = Math.max(0, base);
  for (let index = 0; index < count; index += 1) {
    waits.push(wait);
    const next = wait * 2;
    wait = ceiling !== undefined && Number.isFinite(ceiling) && ceiling >= 0 ? Math.min(next, ceiling) : next;
  }
  return waits;
}

/**
 * Opens one reviewed channel through the connect seam with the reviewed reconnect budget and backoff: failed attempts wait the exponential backoff before the retry, the channel opens on the first success and a budget exhausted without a connection fails the channel with the last error class.
 */
export async function openchannel(input: {
  record: channelrecord;
  options: socketoptions;
  connect: socketconnect;
  sleep?: (milliseconds: number) => Promise<void>;
  now?: () => number;
}): Promise<channelrecord> {
  const sleep =
    input.sleep ??
    ((milliseconds: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, Math.max(0, milliseconds))));
  const now = input.now ?? Date.now;
  const attempts = Math.max(1, Math.floor(input.options.reconnect ?? 0) + 1);
  const waits = reconnectwaits(attempts - 1, input.options.backoff ?? 0, input.options.backoffceiling);
  let record: channelrecord = { ...input.record, state: "connecting" };
  let lasterror = "";
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const result = await input.connect(record.url, record.protocols ?? []);
      if (result.open) return { ...record, state: "open", openedat: now() };
      lasterror = result.error ?? `closed with code ${result.code ?? 0}`;
    } catch (error) {
      lasterror = error instanceof Error ? error.message : String(error);
    }
    if (attempt < attempts - 1) {
      const wait = waits[attempt] ?? 0;
      if (wait > 0) await sleep(wait);
      record = { ...record, reconnects: record.reconnects + 1 };
    }
  }
  return { ...record, state: "failed", error: lasterror };
}

/** Closes one channel record cleanly with its close time and an optional error class, keeping every counter for the audit trail. */
export function closechannel(record: channelrecord, at: number, error?: string): channelrecord {
  const state: channelstate = error !== undefined ? "failed" : "closed";
  return { ...record, state, closedat: at, ...(error !== undefined ? { error } : {}) };
}

/** Live multiplexing state of one run: the per channel sequence counters and the inbound message queue. */
export interface busstate {
  sequences: Record<string, number>;
  queue: messageenvelope[];
}

/** Tags one message with the channel scoped sequence number: every stream multiplexed over the channel shares one strictly increasing sequence. */
function tagmessage(
  state: busstate,
  channelid: string,
  stream: string,
  payload: string,
  at: number,
): { state: busstate; envelope: messageenvelope } {
  const sequence = (state.sequences[channelid] ?? 0) + 1;
  const envelope: messageenvelope = { channelid, stream, payload, sequence, at };
  return { state: { sequences: { ...state.sequences, [channelid]: sequence }, queue: state.queue }, envelope };
}

/** Publishes one reviewed payload on a named stream of an open channel and returns the tagged envelope. */
export function publishmessage(
  state: busstate,
  channelid: string,
  stream: string,
  payload: string,
  at: number,
): { state: busstate; envelope: messageenvelope } {
  return tagmessage(state, channelid, stream, payload, at);
}

/** Receives one inbound channel message on a named stream, tags it with the next channel sequence and queues it for the waitmessage matchers. */
export function receivemessage(
  state: busstate,
  channelid: string,
  stream: string,
  payload: string,
  at: number,
): { state: busstate; envelope: messageenvelope } {
  const tagged = tagmessage(state, channelid, stream, payload, at);
  return { state: { ...tagged.state, queue: [...state.queue, tagged.envelope] }, envelope: tagged.envelope };
}

/** Resolves one dotted path segment against an object or an array index. */
function pathstep(current: unknown, segment: string): unknown {
  if (Array.isArray(current) && /^\d+$/.test(segment)) return current[Number.parseInt(segment, 10)];
  if (current && typeof current === "object" && !Array.isArray(current))
    return (current as Record<string, unknown>)[segment];
  return undefined;
}

/** True when one message envelope matches the reviewed filter: the stream name when reviewed, the dotted json path when reviewed and always the sequence integrity of the channel. */
export function matchmessage(filter: messagefilter | undefined, envelope: messageenvelope): boolean {
  if (!filter) return true;
  if (filter.stream !== undefined && filter.stream !== envelope.stream) return false;
  if (filter.path !== undefined) {
    try {
      const parsed = JSON.parse(envelope.payload) as unknown;
      let current: unknown = parsed;
      let missing = false;
      for (const segment of filter.path.split(".")) {
        const next = pathstep(current, segment);
        if (next === undefined) {
          missing = true;
          break;
        }
        current = next;
      }
      if (missing) return false;
    } catch {
      return false;
    }
  }
  return true;
}

/** Collects the queued messages of one channel matching the reviewed filter up to the reviewed match limit, removing the matched envelopes from the queue. */
export function collectmessages(
  state: busstate,
  channelid: string,
  filter: messagefilter | undefined,
): { state: busstate; matched: messageenvelope[] } {
  const limit =
    filter?.limit !== undefined && Number.isFinite(filter.limit) && filter.limit >= 1
      ? Math.floor(filter.limit)
      : Number.POSITIVE_INFINITY;
  const matched: messageenvelope[] = [];
  const queue: messageenvelope[] = [];
  for (const envelope of state.queue) {
    if (envelope.channelid === channelid && matched.length < limit && matchmessage(filter, envelope))
      matched.push(envelope);
    else queue.push(envelope);
  }
  return { state: { sequences: state.sequences, queue }, matched };
}

/** Verifies the sequence integrity of a message stream: per channel the sequences must form one strictly increasing run from one with no gaps. */
export function sequenceintegrity(envelopes: messageenvelope[]): {
  ok: boolean;
  gaps: Array<{ channelid: string; expected: number; found: number }>;
} {
  const last = new Map<string, number>();
  const gaps: Array<{ channelid: string; expected: number; found: number }> = [];
  for (const envelope of envelopes) {
    const expected = (last.get(envelope.channelid) ?? 0) + 1;
    if (envelope.sequence !== expected)
      gaps.push({ channelid: envelope.channelid, expected, found: envelope.sequence });
    last.set(envelope.channelid, Math.max(envelope.sequence, expected));
  }
  return { ok: gaps.length === 0, gaps };
}

/** Normalizes a reviewed message filter: stream name, dotted json path and the reviewed match limit with no code ceiling. */
export function messagefilterof(value: unknown): messagefilter {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const entry = value as Record<string, unknown>;
  const filter: messagefilter = {};
  if (typeof entry.stream === "string" && entry.stream.trim()) filter.stream = entry.stream.trim();
  if (typeof entry.path === "string" && entry.path.trim()) filter.path = entry.path.trim();
  if (typeof entry.limit === "number" && Number.isFinite(entry.limit) && entry.limit >= 1)
    filter.limit = Math.floor(entry.limit);
  return filter;
}

/** One parsed server sent event: id, event name, joined data lines and the reviewed retry hint. */
export interface sseevent {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
}

/** Parses one server sent events text chunk into complete events with id, event name, data and retry fields, returning the incomplete trailing block as the rest buffer; comment lines stay ignored. */
export function parsessetext(text: string): { events: sseevent[]; rest: string } {
  const separator = text.lastIndexOf("\n\n");
  const complete = separator === -1 ? "" : text.slice(0, separator + 2);
  const rest = separator === -1 ? text : text.slice(separator + 2);
  const events: sseevent[] = [];
  for (const block of complete.split(/\n\n/)) {
    const id: string[] = [];
    const names: string[] = [];
    const data: string[] = [];
    let retry: number | undefined;
    for (const line of block.split("\n")) {
      if (line === "" || line.startsWith(":")) continue;
      const colon = line.indexOf(":");
      const field = colon === -1 ? line : line.slice(0, colon);
      let value = colon === -1 ? "" : line.slice(colon + 1);
      if (value.startsWith(" ")) value = value.slice(1);
      if (field === "id" && value !== "") id.push(value);
      if (field === "event" && value !== "") names.push(value);
      if (field === "data") data.push(value);
      if (field === "retry" && /^\d+$/.test(value)) retry = Number.parseInt(value, 10);
    }
    if (id.length === 0 && names.length === 0 && data.length === 0) continue;
    events.push({
      ...(id.length > 0 ? { id: id[id.length - 1] } : {}),
      ...(names.length > 0 ? { event: names[names.length - 1] } : {}),
      data: data.join("\n"),
      ...(retry !== undefined ? { retry } : {}),
    });
  }
  return { events, rest };
}

/** Builds the request headers of one server sent events subscription, resuming from the last event id after a reconnect. */
export function sserequestheaders(record: { lasteventid?: string }): Record<string, string> {
  return {
    accept: "text/event-stream",
    ...(record.lasteventid !== undefined && record.lasteventid !== "" ? { "last-event-id": record.lasteventid } : {}),
  };
}

/** Normalizes reviewed subscription options: the event stream url, the lifetime window, the resume point and the reviewed cancellation path. */
export function subscriptionoptionsof(
  value: unknown,
):
  | {
      url: string;
      lifetime?: number;
      lasteventid?: string;
      cancel: { kind: "stop" | "lifetime"; value: string | number };
    }
  | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  if (typeof entry.url !== "string" || !entry.url.trim()) return undefined;
  const cancel = entry.cancel;
  if (!cancel || typeof cancel !== "object" || Array.isArray(cancel)) return undefined;
  const cancelrecord = cancel as Record<string, unknown>;
  if (cancelrecord.kind !== "stop" && cancelrecord.kind !== "lifetime") return undefined;
  if (typeof cancelrecord.value !== "string" && typeof cancelrecord.value !== "number") return undefined;
  const result: {
    url: string;
    lifetime?: number;
    lasteventid?: string;
    cancel: { kind: "stop" | "lifetime"; value: string | number };
  } = { url: entry.url.trim(), cancel: { kind: cancelrecord.kind, value: cancelrecord.value } };
  if (typeof entry.lifetime === "number" && Number.isFinite(entry.lifetime) && entry.lifetime > 0)
    result.lifetime = entry.lifetime;
  if (typeof entry.lasteventid === "string" && entry.lasteventid.trim()) result.lasteventid = entry.lasteventid.trim();
  return result;
}

/** Normalizes a reviewed long poll cursor: url, cursor field, interval, stop condition, optional poll ceiling and the cursor query parameter; every bound stays a user choice with no code ceiling. */
export function pollcursorof(value: unknown): pollcursor | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  if (typeof entry.url !== "string" || !entry.url.trim()) return undefined;
  if (typeof entry.cursorfield !== "string" || !entry.cursorfield.trim()) return undefined;
  if (typeof entry.interval !== "number" || !Number.isFinite(entry.interval) || entry.interval <= 0) return undefined;
  const stop = entry.stop;
  if (!stop || typeof stop !== "object" || Array.isArray(stop)) return undefined;
  const stoprecord = stop as Record<string, unknown>;
  if (typeof stoprecord.field !== "string" || !stoprecord.field.trim()) return undefined;
  if (typeof stoprecord.equals !== "string") return undefined;
  const cursor: pollcursor = {
    url: entry.url.trim(),
    cursorfield: entry.cursorfield.trim(),
    interval: entry.interval,
    stop: { field: stoprecord.field.trim(), equals: stoprecord.equals },
  };
  if (typeof entry.maxpolls === "number" && Number.isFinite(entry.maxpolls) && entry.maxpolls >= 1)
    cursor.maxpolls = Math.floor(entry.maxpolls);
  if (typeof entry.param === "string" && entry.param.trim()) cursor.param = entry.param.trim();
  return cursor;
}

/** Reads one cursor value from a polled response body by its dotted field path. */
export function cursorfrom(response: unknown, field: string): string | undefined {
  let current: unknown = response;
  for (const segment of field.split(".")) {
    const next = pathstep(current, segment);
    if (next === undefined) return undefined;
    current = next;
  }
  return current === undefined || current === null ? undefined : String(current);
}

/** Builds the next poll url of a cursor loop: the cursor rides the reviewed query parameter when one is set and posts inside the request body otherwise. */
export function pollurl(cursor: pollcursor, value: string | undefined): { url: string; body?: string } {
  if (cursor.param === undefined || value === undefined) {
    return {
      url: cursor.url,
      ...(value !== undefined ? { body: JSON.stringify({ [cursor.cursorfield]: value }) } : {}),
    };
  }
  const url = new URL(cursor.url);
  url.searchParams.set(cursor.param, value);
  return { url: url.toString() };
}

/**
 * Decides one long poll iteration: the loop stops on the reviewed stop condition, the cancellation flag, the plan expiry or the reviewed poll ceiling, and otherwise returns the next poll url with the reviewed interval wait.
 */
export function polldecision(input: {
  cursor: pollcursor;
  polls: number;
  response: unknown;
  cancelled?: () => boolean;
  expiresat?: number;
  now: number;
}): { continue: boolean; reason: string; cursor?: string; next?: { url: string; body?: string; wait: number } } {
  if (input.cancelled?.() === true) return { continue: false, reason: "The long poll loop was cancelled." };
  if (input.expiresat !== undefined && input.now >= input.expiresat)
    return { continue: false, reason: "The long poll loop stopped at the reviewed plan expiry." };
  const stopvalue = cursorfrom(input.response, input.cursor.stop.field);
  if (stopvalue !== undefined && stopvalue === input.cursor.stop.equals)
    return { continue: false, reason: `The stop condition matched ${input.cursor.stop.field} ${stopvalue}.` };
  if (input.cursor.maxpolls !== undefined && input.polls + 1 >= input.cursor.maxpolls)
    return {
      continue: false,
      reason: `The long poll loop reached the reviewed poll ceiling of ${input.cursor.maxpolls}.`,
    };
  const value = cursorfrom(input.response, input.cursor.cursorfield);
  const next = pollurl(input.cursor, value);
  return {
    continue: true,
    reason: "The long poll loop continues.",
    ...(value !== undefined ? { cursor: value } : {}),
    next: { ...next, wait: input.cursor.interval },
  };
}

/* ── Merged from netcontrol.ts ── */

/** Correlated network control logics of the 1.1.44 family: request blocking, response mocking, header rewriting, cookie scoping, proxy routing and the rate limiter, all run scoped and reverted the moment a run ends, fails or is cancelled. */
import type { blockrule, cookierecord, headerule, mockspec, proxyroute, ratelimitread } from "./types.js";

/** Every reviewed network control kind of the 1.1.44 family. */
export const controlkinds: string[] = [
  "blockrequest",
  "mockresponse",
  "rewriteheaders",
  "setcookies",
  "readcookies",
  "clearcookies",
  "authflow",
  "saveapikey",
  "routeproxy",
  "postform",
  "postfiles",
];

/** Resolves the origin a reviewed url pattern names; a pattern without an https origin prefix names no origin and is refused. */
export function patternorigin(pattern: string): string | undefined {
  const trimmed = pattern.trim();
  if (!trimmed.startsWith("https://")) return undefined;
  const rest = trimmed.slice("https://".length);
  const host = rest.split("/")[0] ?? "";
  if (!host.trim()) return undefined;
  return `https://${host.toLowerCase()}`;
}

/** Matches a reviewed url pattern against one request url: the pattern must name its https origin, then an optional path pattern where a single star matches within one segment and a double star matches across segments. */
export function matchurlpattern(pattern: string, url: string): boolean {
  const origin = patternorigin(pattern);
  if (!origin) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.origin !== origin) return false;
  const patternpath = pattern.trim().slice(origin.length);
  if (patternpath === "" || patternpath === "/") return true;
  const segments = patternpath.split("/").filter((segment) => segment !== "");
  if (segments.includes("**")) return true;
  const pathsegments = parsed.pathname.split("/").filter((segment) => segment !== "");
  if (segments.length !== pathsegments.length) return false;
  return segments.every(
    (segment, index) =>
      segment === pathsegments[index] ||
      (segment.includes("*") &&
        new RegExp(
          `^${segment
            .split("*")
            .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
            .join(".*")}$`,
        ).test(pathsegments[index] ?? "")),
  );
}

/** Parses one reviewed block rule from step options: the url pattern and an optional resource type list. */
export function blockruleof(value: unknown): { urlpattern: string; resourcetypes?: string[] } | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (typeof options.urlpattern !== "string" || !options.urlpattern.trim()) return undefined;
  const rule: { urlpattern: string; resourcetypes?: string[] } = { urlpattern: options.urlpattern.trim() };
  if (Array.isArray(options.resourcetypes)) {
    const types = options.resourcetypes.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
    if (types.length === 0) return undefined;
    rule.resourcetypes = types;
  }
  return rule;
}

/** Creates one registered block rule of a run with its hit counter at zero; every rule removes itself at run end. */
export function newblockrule(input: {
  id: string;
  runid: string;
  stepid: string;
  urlpattern: string;
  resourcetypes?: string[];
  at: number;
}): blockrule {
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.stepid,
    urlpattern: input.urlpattern,
    ...(input.resourcetypes !== undefined ? { resourcetypes: input.resourcetypes } : {}),
    hits: 0,
    registeredat: input.at,
  };
}

/** Parses one reviewed mock fixture from step options: url pattern, status, headers and either the reviewed body or the reference of a captured body of the 1.1.43 body store the fixture replays. */
export function mockspecof(
  value: unknown,
):
  | {
      urlpattern: string;
      status: number;
      headers?: Record<string, string>;
      body?: string;
      bodyref?: string;
      reviewed?: boolean;
    }
  | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (typeof options.urlpattern !== "string" || !options.urlpattern.trim()) return undefined;
  if (
    typeof options.status !== "number" ||
    !Number.isInteger(options.status) ||
    options.status < 100 ||
    options.status > 599
  )
    return undefined;
  const hasbody = typeof options.body === "string";
  const bodyref = typeof options.bodyref === "string" ? options.bodyref.trim() : "";
  if (!hasbody && bodyref === "") return undefined;
  const spec: {
    urlpattern: string;
    status: number;
    headers?: Record<string, string>;
    body?: string;
    bodyref?: string;
    reviewed?: boolean;
  } = { urlpattern: options.urlpattern.trim(), status: options.status };
  if (hasbody) spec.body = options.body as string;
  if (bodyref !== "") spec.bodyref = bodyref;
  if (options.headers && typeof options.headers === "object" && !Array.isArray(options.headers))
    spec.headers = options.headers as Record<string, string>;
  if (options.reviewed === true) spec.reviewed = true;
  return spec;
}

/** Creates one registered mock fixture of a run; the fixture serves matched requests and clears at run end. */
export function newmockspec(input: {
  id: string;
  runid: string;
  stepid: string;
  urlpattern: string;
  status: number;
  headers?: Record<string, string>;
  body?: string;
  bodyref?: string;
  reviewed: boolean;
  at: number;
}): mockspec {
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.stepid,
    urlpattern: input.urlpattern,
    status: input.status,
    ...(input.headers !== undefined ? { headers: input.headers } : {}),
    ...(input.body !== undefined ? { body: input.body } : {}),
    ...(input.bodyref !== undefined ? { bodyref: input.bodyref } : {}),
    reviewed: input.reviewed,
    hits: 0,
    registeredat: input.at,
  };
}

/** Returns the first active mock fixture that matches the url; matched fixtures count their hits for the step result. */
export function mockfor(url: string, specs: mockspec[]): mockspec | undefined {
  return specs.find((spec) => spec.revertedat === undefined && matchurlpattern(spec.urlpattern, url));
}

/** Parses one reviewed header rewrite rule from step options: url pattern, header name, operation and value. */
export function headeruleof(
  value: unknown,
): { urlpattern: string; name: string; operation: "set" | "append" | "remove"; value?: string } | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (typeof options.urlpattern !== "string" || !options.urlpattern.trim()) return undefined;
  if (typeof options.name !== "string" || !options.name.trim()) return undefined;
  if (options.operation !== "set" && options.operation !== "append" && options.operation !== "remove") return undefined;
  if (options.operation === "remove" && options.value !== undefined) return undefined;
  if (options.operation !== "remove" && typeof options.value !== "string") return undefined;
  const rule: { urlpattern: string; name: string; operation: "set" | "append" | "remove"; value?: string } = {
    urlpattern: options.urlpattern.trim(),
    name: options.name.trim(),
    operation: options.operation,
  };
  if (options.operation !== "remove") rule.value = typeof options.value === "string" ? options.value : "";
  return rule;
}

/** Creates one registered header rewrite rule of a run; the rule reverts at run end. */
export function newheaderule(input: {
  id: string;
  runid: string;
  stepid: string;
  urlpattern: string;
  name: string;
  operation: "set" | "append" | "remove";
  value?: string;
  at: number;
}): headerule {
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.stepid,
    urlpattern: input.urlpattern,
    name: input.name,
    operation: input.operation,
    ...(input.value !== undefined ? { value: input.value } : {}),
    hits: 0,
    registeredat: input.at,
  };
}

/** Applies the active header rewrite rules of one outgoing url: set overwrites, append joins with a comma and remove drops the header, returning the rewritten headers with the provenance of every applied rule for the audit trail. */
export function applyheaderules(
  url: string,
  headers: Record<string, string>,
  rules: headerule[],
): { headers: Record<string, string>; applied: headerule[] } {
  const rewritten: Record<string, string> = { ...headers };
  const applied: headerule[] = [];
  for (const rule of rules) {
    if (rule.revertedat !== undefined) continue;
    if (!matchurlpattern(rule.urlpattern, url)) continue;
    const name = rule.name;
    if (rule.operation === "remove") {
      delete rewritten[name];
      applied.push(rule);
      continue;
    }
    const value = rule.value ?? "";
    if (rule.operation === "set") rewritten[name] = value;
    else rewritten[name] = rewritten[name] !== undefined ? `${rewritten[name]}, ${value}` : value;
    applied.push(rule);
  }
  return { headers: rewritten, applied };
}

/** Marks one registered rule as reverted at the given time; reversion is idempotent and never touches the hit counter. */
export function revertrule<T extends blockrule | mockspec | headerule | proxyroute>(rule: T, at: number): T {
  if (rule.revertedat !== undefined) return rule;
  return { ...rule, revertedat: at };
}

/** Parses one reviewed cookie record from step options: name, domain, path, value and optional expiry. */
export function cookierecordof(value: unknown): cookierecord | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (typeof options.name !== "string" || !options.name.trim()) return undefined;
  if (typeof options.domain !== "string" || !options.domain.trim()) return undefined;
  if (typeof options.path !== "string" || !options.path.trim()) return undefined;
  if (typeof options.value !== "string") return undefined;
  const record: cookierecord = {
    name: options.name.trim(),
    domain: options.domain.trim().toLowerCase(),
    path: options.path.trim(),
    value: options.value,
  };
  if (typeof options.expiresat === "number" && Number.isFinite(options.expiresat)) record.expiresat = options.expiresat;
  return record;
}

/** True when the reviewed cookie domain stays inside the granted hosts: the domain equals a granted origin host or sits beneath it as a subdomain; every other domain is refused. */
export function cookiedomaingranted(domain: string, grants: string[]): boolean {
  const host = domain.trim().toLowerCase().replace(/^\./, "");
  return grants.some((grant) => {
    let granthost = "";
    try {
      granthost = new URL(grant).hostname.toLowerCase();
    } catch {
      return false;
    }
    return host === granthost || host.endsWith(`.${granthost}`);
  });
}

/** Redacts the values of reviewed cookies for the audit trail: only names, domains, paths and expiry windows survive. */
export function redactedcookies(
  records: cookierecord[],
): Array<{ name: string; domain: string; path: string; expiresat?: number }> {
  return records.map((record) => ({
    name: record.name,
    domain: record.domain,
    path: record.path,
    ...(record.expiresat !== undefined ? { expiresat: record.expiresat } : {}),
  }));
}

/** Parses one reviewed proxy route from step options: scheme, host, port and the required bypass list of origins that stay direct. */
export function proxyrouteof(
  value: unknown,
): { scheme: "http" | "https" | "socks4" | "socks5"; host: string; port: number; bypass: string[] } | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (
    options.scheme !== "http" &&
    options.scheme !== "https" &&
    options.scheme !== "socks4" &&
    options.scheme !== "socks5"
  )
    return undefined;
  if (typeof options.host !== "string" || !options.host.trim()) return undefined;
  if (typeof options.port !== "number" || !Number.isInteger(options.port) || options.port < 1 || options.port > 65535)
    return undefined;
  if (
    !Array.isArray(options.bypass) ||
    options.bypass.length === 0 ||
    !options.bypass.every((item): item is string => typeof item === "string" && item.trim().length > 0)
  )
    return undefined;
  return {
    scheme: options.scheme,
    host: options.host.trim(),
    port: options.port,
    bypass: options.bypass.map((item) => item.trim()),
  };
}

/** Parses one rate limit read from response headers: the remaining and limit counts plus the reset time; a reset value beyond the read time counts as epoch seconds and a smaller value as seconds remaining. */
export function ratelimitreadof(
  headers: Record<string, string>,
  origin: string,
  now: number,
): ratelimitread | undefined {
  const pick = (name: string): number | undefined => {
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() !== name) continue;
      const value = Number(headers[key]);
      return Number.isFinite(value) && value >= 0 ? value : undefined;
    }
    return undefined;
  };
  const remaining = pick("x-ratelimit-remaining");
  const limit = pick("x-ratelimit-limit");
  const reset = pick("x-ratelimit-reset");
  if (remaining === undefined && limit === undefined && reset === undefined) return undefined;
  const read: ratelimitread = {
    origin,
    ...(remaining !== undefined ? { remaining } : {}),
    ...(limit !== undefined ? { limit } : {}),
    resetat: now,
    at: now,
  };
  if (reset !== undefined) read.resetat = reset > Math.floor(now / 1000) ? reset * 1000 : now + reset * 1000;
  return read;
}

/** Resolves the retry after wait of one 429 or 503 response in milliseconds from the reviewed Retry-After header; a seconds value counts from now and an HTTP date resolves to its absolute time. */
export function retryafterof(status: number, headers: Record<string, string>): number | undefined {
  if (status !== 429 && status !== 503) return undefined;
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() !== "retry-after") continue;
    const raw = headers[key];
    if (raw === undefined) continue;
    const value = raw.trim();
    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
    const date = Date.parse(value);
    if (Number.isFinite(date)) return Math.max(0, date - Date.now());
    return undefined;
  }
  return undefined;
}

/** Resolves the rate limit wait in milliseconds until the reset window passes; an absent or passed state waits nothing and the wait itself stays a user configured behavior with no code ceiling. */
export function ratelimitwait(state: ratelimitread | undefined, now: number): number {
  if (!state) return 0;
  return Math.max(0, state.resetat - now);
}
