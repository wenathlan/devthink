/* ── The gateway entry section the family kept before the 1.1.88 merge. ── */
import type { apikeyref, baseurlconfig, costbudget, costestimate, gatewaychatstate, gatewayerror, gatewaychattoken, gatewaykind, gatewaymodelinfo, localmodelconfig, modelcacherecord, modelmessage, modeloutput, modelroute, parseguard, prompttemplate, providerconfig, secretvaultentry, tokenstream, tooldef, usagerecord, apicallrecord, cacheentry, correlationcontext, correlatedrequest, eventsubscription, formpayload, graphqlsubscription, longpollrequest, multipartfield, multipartpayload, pollcursor, ratelimitdirective, webextensionbrowser, webextensionapientry, webextensionapikind, apimapreport, apimapresolution, apimapbrowserprobe, apimapstructerror, apibrowserprobeinput } from "./types.js";
import { budgetcheck, buildrequest, guardoutput, islocalorigin, parsecompletion, parsestream, type modelusage } from "./llm.js";
import type { fetchtransport, transportresponse } from "./http.js";
import { secretleakscan, vaultdelete, vaultstore, vaultvaluefor } from "./security.js";
import { fallbackroute, resolveroute } from "./llm.js";
import { gatewaybaseurlgate, gatewaycachewindowvalid, gatewayconsentgate, gatewaykeyconsentgate, gatewayprefixgate, gatewayretrycapvalid } from "./policy.js";
import { randomid } from "./memory.js";
import { rendertemplate } from "./llm.js";

/**
 * Provider gateway logics of the 1.1.83 family.
 * Every provider adapter concern lives in this file: the adapter interface one request, stream and cancel contract shares, the four adapters (the openaicompat chat completions shape with its streamed deltas, the anthropicgateway messages shape with its streamed content blocks and its system prompt mapping, the geminigateway generate content shape with its streamed candidate parts and its tool schema mapping, and the ollamalocal localhost runtime with its local model listing), the baseurlconfig one endpoint url per provider with its scheme, host and path shape validation, the per provider key vault behind the secretvault seam, the modellist discovery with its configurable cache window, the capabilityad tool catalog advertisement, the routing of task kinds onto providers with the local fallback, the token budget accounting with its warning threshold, the guardrails over every parsed model answer with the structured retry prompt and the capped retries, and the prompt template library of the per task templates with their variable slots.
 * The module composes with the llm provider model instead of duplicating it: the three remote adapters speak through the same request shaping, answer parsing and stream parsing the llm module owns, while the ollamalocal adapter speaks its own localhost wire format. Nothing is hardcoded: no remote endpoint, no model name and no key ever leaves the user configuration, the ollamalocal adapter alone defaults to the localhost machine and never to a cloud url, every timeout, retry, backoff and cache window stays a user choice, all http rides the injected fetch transport seam and every key resolves through the vault seam at the last possible moment.
 */

/** The local machine base url the ollamalocal adapter alone defaults to: a loopback address of the machine itself, never a cloud url — the explicit contract exception, while every remote provider ships an empty base url until the user configures one. */
export const ollamalocaldefault = "http://localhost:11434";

/** The provider kinds of the gateway family in their stable order; every surface that lists the adapters reads this one list. */
export const gatewaykinds: gatewaykind[] = ["openaicompat", "anthropicgateway", "geminigateway", "ollamalocal"];

/** Reads the default base url of one provider kind: the ollamalocal runtime alone carries the localhost machine default and every remote kind carries none, so no provider endpoint is contacted unless the user configured one. */
export function defaultbaseurl(kind: gatewaykind): string {
  return kind === "ollamalocal" ? ollamalocaldefault : "";
}

/** Joins the user configured base url, the optional per provider path prefix and the wire path of the adapter into the request url; the base keeps its trailing shape and the prefix sits between the base and the wire path. The slash trims run through plain character walks, because a leading or trailing slash regex would itself read as polynomial on adversarial bases. */
export function gatewayurl(config: Pick<baseurlconfig, "baseurl" | "pathprefix">, path: string): string {
  const base = trailingslashes(config.baseurl.trim());
  const trimmedprefix = (config.pathprefix ?? "").trim();
  const prefix = leadingslashes(trailingslashes(trimmedprefix));
  const wire = path.startsWith("/") ? path : `/${path}`;
  return `${base}${prefix !== "" ? `/${prefix}` : ""}${wire}`;
}

/** Trims the trailing forward slashes of one string through a plain character walk, because a trailing slash regex would itself read as polynomial on adversarial bases. */
function trailingslashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 0x2f) end -= 1;
  return value.slice(0, end);
}

/** Trims the leading forward slashes of one string through a plain character walk, because a leading slash regex would itself read as polynomial on adversarial prefixes. */
function leadingslashes(value: string): string {
  let start = 0;
  while (start < value.length && value.charCodeAt(start) === 0x2f) start += 1;
  return value.slice(start);
}

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
  parseanswer(body: string): { text?: string; usage?: modelusage; reason?: string };
  /** Parses one streamed body of the adapter wire format into its ordered token stream: the chat completions deltas, the messages content blocks, the gemini candidate parts or the ollama message lines. */
  parsestream(body: string): tokenstream[];
  /** Parses one model list body of the adapter wire format into the discovered models with their context and modality hints when offered. */
  parsemodellist(body: string): gatewaymodelinfo[];
  /** Serializes the tool catalog into the tool schema format of the provider for the capabilityad advertisement. */
  toolcatalog(tools: tooldef[]): unknown[];
}

/** Reads one record field as a plain object when it is one. */
function recordof(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

/** Reads one record field as a finite number when it is one. */
function numberof(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Reads the wire body of one shaped request as a record so the adapter merges its tool catalog, and answers the re-serialized body; a malformed body passes through untouched so the wire shape never silently changes. */
function withbody(request: ReturnType<typeof buildrequest>, merge: (body: Record<string, unknown>) => void): ReturnType<typeof buildrequest> {
  let parsed: unknown;
  try { parsed = JSON.parse(request.body); } catch { return request; }
  const record = recordof(parsed);
  if (record === undefined) return request;
  merge(record);
  return { ...request, body: JSON.stringify(record) };
}

/** The openai compatible chat completions adapter: any endpoint the user configures that speaks the chat completions shape works, the bearer header carries the resolved key, the streamed answer rides server sent event deltas and the tool catalog serializes into the function tool schema. */
export const openaicompatadapter: gatewayadapter = {
  kind: "openaicompat",
  style: "chatcompletions",
  chatpath: () => "/chat/completions",
  modelspath: () => "/models",
  build: input => {
    const shaped = buildrequest({ provider: { endpoint: gatewayurl(input.config, "/chat/completions"), style: "chatcompletions", ...(input.headers !== undefined ? { headers: input.headers } : {}) }, model: input.model, messages: input.messages, ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), ...(input.temperature !== undefined ? { temperature: input.temperature } : {}), ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}), ...(input.stream === true ? { stream: true } : {}) });
    if (input.tools === undefined || input.tools.length === 0) return shaped;
    return withbody(shaped, body => { body.tools = input.tools?.map(tool => ({ type: "function", function: { name: tool.name, description: tool.description, parameters: { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...(property.required === true ? { required: true } : {}), ...(property.default !== undefined ? { "default": property.default } : {}) }])), required: tool.inputschema.required } } })); });
  },
  parseanswer: body => parsecompletion("chatcompletions", body),
  parsestream: body => parsestream("chatcompletions", body),
  parsemodellist: body => {
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { return []; }
    const record = recordof(parsed);
    const list = record !== undefined && Array.isArray(record.data) ? record.data : undefined;
    if (list === undefined) return [];
    const models: gatewaymodelinfo[] = [];
    for (const item of list) {
      const entry = recordof(item);
      if (entry === undefined || typeof entry.id !== "string" || entry.id.trim() === "") continue;
      const context = numberof(entry["context_length"]) ?? numberof(entry["context_window"]);
      models.push({ id: entry.id, ...(typeof entry.label === "string" && entry.label.trim() !== "" ? { label: entry.label } : {}), ...(context !== undefined ? { contextwindow: context } : {}), ...(Array.isArray(entry.modalities) ? { modalities: entry.modalities.filter((kind): kind is string => typeof kind === "string") } : {}) });
    }
    return models;
  },
  toolcatalog: tools => tools.map(tool => ({ type: "function", function: { name: tool.name, description: tool.description, parameters: { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...(property.required === true ? { required: true } : {}) }])), required: tool.inputschema.required } } }))
};

/** The anthropic messages adapter: the messages wire shape with its system prompt mapping to the top level system field, the streamed answer rides content block deltas and the tool catalog serializes into the input schema format. */
export const anthropicgatewayadapter: gatewayadapter = {
  kind: "anthropicgateway",
  style: "messages",
  chatpath: () => "/v1/messages",
  modelspath: () => "/v1/models",
  build: input => {
    const shaped = buildrequest({ provider: { endpoint: gatewayurl(input.config, "/v1/messages"), style: "messages", ...(input.headers !== undefined ? { headers: input.headers } : {}) }, model: input.model, messages: input.messages, ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), ...(input.temperature !== undefined ? { temperature: input.temperature } : {}), ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}), ...(input.stream === true ? { stream: true } : {}) });
    if (input.tools === undefined || input.tools.length === 0) return shaped;
    return withbody(shaped, body => { body.tools = input.tools?.map(tool => ({ name: tool.name, description: tool.description, "input_schema": { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...(property.required === true ? { required: true } : {}) }])), required: tool.inputschema.required } })); });
  },
  parseanswer: body => parsecompletion("messages", body),
  parsestream: body => parsestream("messages", body),
  parsemodellist: body => {
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { return []; }
    const record = recordof(parsed);
    const list = record !== undefined && Array.isArray(record.data) ? record.data : undefined;
    if (list === undefined) return [];
    const models: gatewaymodelinfo[] = [];
    for (const item of list) {
      const entry = recordof(item);
      if (entry === undefined || typeof entry.id !== "string" || entry.id.trim() === "") continue;
      const context = numberof(entry["context_window"]);
      models.push({ id: entry.id, ...(typeof entry["display_name"] === "string" && (entry["display_name"] as string).trim() !== "" ? { label: entry["display_name"] as string } : {}), ...(context !== undefined ? { contextwindow: context } : {}) });
    }
    return models;
  },
  toolcatalog: tools => tools.map(tool => ({ name: tool.name, description: tool.description, "input_schema": { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...(property.required === true ? { required: true } : {}) }])), required: tool.inputschema.required } }))
};

/** The gemini generate content adapter: the generate content wire shape with the model riding the path, the streamed answer rides candidate parts and the tool schema maps into the function declarations format. */
export const geminigatewayadapter: gatewayadapter = {
  kind: "geminigateway",
  style: "gemini",
  chatpath: model => `/v1beta/models/${encodeURIComponent(model)}:generateContent`,
  modelspath: () => "/v1beta/models",
  build: input => {
    const shaped = buildrequest({ provider: { endpoint: gatewayurl(input.config, geminigatewayadapter.chatpath(input.model)), style: "gemini", ...(input.headers !== undefined ? { headers: input.headers } : {}) }, model: input.model, messages: input.messages, ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), ...(input.temperature !== undefined ? { temperature: input.temperature } : {}), ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}), ...(input.stream === true ? { stream: true } : {}) });
    if (input.tools === undefined || input.tools.length === 0) return shaped;
    return withbody(shaped, body => { body.tools = [{ functionDeclarations: input.tools?.map(tool => ({ name: tool.name, description: tool.description, parameters: { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...(property.required === true ? { required: true } : {}) }])), required: tool.inputschema.required } })) }]; });
  },
  parseanswer: body => parsecompletion("gemini", body),
  parsestream: body => parsestream("gemini", body),
  parsemodellist: body => {
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { return []; }
    const record = recordof(parsed);
    const list = record !== undefined && Array.isArray(record.models) ? record.models : undefined;
    if (list === undefined) return [];
    const models: gatewaymodelinfo[] = [];
    for (const item of list) {
      const entry = recordof(item);
      if (entry === undefined || typeof entry.name !== "string" || entry.name.trim() === "") continue;
      const inputlimit = numberof(entry["inputTokenLimit"]);
      const methods = Array.isArray(entry["supportedGenerationMethods"]) ? (entry["supportedGenerationMethods"] as unknown[]).filter((kind): kind is string => typeof kind === "string") : undefined;
      models.push({ id: entry.name.replace(/^models\//, ""), ...(typeof entry.displayName === "string" && entry.displayName.trim() !== "" ? { label: entry.displayName } : {}), ...(inputlimit !== undefined ? { contextwindow: inputlimit } : {}), ...(methods !== undefined ? { modalities: methods } : {}) });
    }
    return models;
  },
  toolcatalog: tools => [{ functionDeclarations: tools.map(tool => ({ name: tool.name, description: tool.description, parameters: { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...(property.required === true ? { required: true } : {}) }])), required: tool.inputschema.required } })) }]
};

/** The ollama local runtime adapter: it speaks its own localhost wire format (the chat endpoint with the message envelope, the tag list of the locally installed models and the newline delimited stream lines), the base url defaults to the local machine alone and never to a cloud url, and a call never leaves the machine. */
export const ollamalocaladapter: gatewayadapter = {
  kind: "ollamalocal",
  chatpath: () => "/api/chat",
  modelspath: () => "/api/tags",
  build: input => {
    const headers: Record<string, string> = { "content-type": "application/json", ...(input.headers ?? {}) };
    if (input.apikey !== undefined && input.apikey.trim() !== "") headers.authorization = `Bearer ${input.apikey}`;
    const body: Record<string, unknown> = { model: input.model, messages: input.messages.map(message => ({ role: message.role, content: message.content })), ...(input.stream === true ? { stream: true } : {}) };
    if (input.tools !== undefined && input.tools.length > 0) body.tools = input.tools.map(tool => ({ type: "function", function: { name: tool.name, description: tool.description, parameters: { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...(property.required === true ? { required: true } : {}) }])), required: tool.inputschema.required } } }));
    return { url: gatewayurl(input.config, "/api/chat"), method: "POST", headers, body: JSON.stringify(body) };
  },
  parseanswer: body => {
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { return { reason: "The ollama answer is not json." }; }
    const record = recordof(parsed);
    if (record === undefined) return { reason: "The ollama answer is not a json object." };
    const message = recordof(record.message);
    if (message === undefined || typeof message.content !== "string") return { reason: "The ollama answer carries no message content." };
    const prompttokens = numberof(record["prompt_eval_count"]);
    const completiontokens = numberof(record["eval_count"]);
    return { text: message.content, ...(prompttokens !== undefined || completiontokens !== undefined ? { usage: { prompttokens: prompttokens ?? 0, completiontokens: completiontokens ?? 0, totaltokens: (prompttokens ?? 0) + (completiontokens ?? 0) } } : {}) };
  },
  parsestream: body => {
    const tokens: tokenstream[] = [];
    let seq = 0;
    let done = false;
    for (const line of body.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed === "") continue;
      let parsed: unknown;
      try { parsed = JSON.parse(trimmed); } catch { continue; }
      const record = recordof(parsed);
      if (record === undefined) continue;
      const message = recordof(record.message);
      const text = message !== undefined && typeof message.content === "string" ? message.content : "";
      if (record.done === true) done = true;
      if (text === "") continue;
      seq += 1;
      tokens.push({ seq, text, done: false });
    }
    if (tokens.length > 0 && done) tokens[tokens.length - 1] = { ...(tokens[tokens.length - 1] as tokenstream), done: true };
    return tokens;
  },
  parsemodellist: body => {
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { return []; }
    const record = recordof(parsed);
    const list = record !== undefined && Array.isArray(record.models) ? record.models : undefined;
    if (list === undefined) return [];
    const models: gatewaymodelinfo[] = [];
    for (const item of list) {
      const entry = recordof(item);
      if (entry === undefined || typeof entry.name !== "string" || entry.name.trim() === "") continue;
      const details = recordof(entry.details);
      const families = details !== undefined && Array.isArray(details.families) ? (details.families as unknown[]).filter((kind): kind is string => typeof kind === "string") : undefined;
      models.push({ id: entry.name, ...(details !== undefined && typeof details["parameter_size"] === "string" ? { label: `${entry.name} (${details["parameter_size"] as string})` } : {}), ...(families !== undefined ? { modalities: families } : {}) });
    }
    return models;
  },
  toolcatalog: tools => tools.map(tool => ({ type: "function", function: { name: tool.name, description: tool.description, parameters: { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...(property.required === true ? { required: true } : {}) }])), required: tool.inputschema.required } } }))
};

/** Every adapter of the gateway family in its stable order; the surfaces and the tests read this one record. */
export const gatewayadapters: Record<gatewaykind, gatewayadapter> = { openaicompat: openaicompatadapter, anthropicgateway: anthropicgatewayadapter, geminigateway: geminigatewayadapter, ollamalocal: ollamalocaladapter };

/** Reads the adapter of one provider kind; an unknown kind refuses because the four adapters are the contract. */
export function adapterof(kind: gatewaykind): gatewayadapter {
  const adapter = gatewayadapters[kind];
  if (adapter === undefined) throw new Error(`The gateway family carries no ${kind} adapter.`);
  return adapter;
}

/** The cancel contract of the gateway family: one cancel state the caller creates, passes into the request and stream calls and cancels from any surface; the calls check the flag before the dispatch, between the attempts and after every streamed token. */
export interface gatewaycancelstate {
  cancelled(): boolean;
  cancel(reason?: string): void;
  reason(): string;
}

/** Creates one cancel state of the gateway stream contract; the state stays silent until the caller cancels it. */
export function gatewaycancel(): gatewaycancelstate {
  let cancelled = false;
  let reason = "The user cancelled the provider call.";
  return {
    cancelled: () => cancelled,
    cancel: (why?: string) => { cancelled = true; if (why !== undefined && why.trim() !== "") reason = why.trim(); },
    reason: () => reason
  };
}

/** Builds one structured gateway error with its code, message, retry hint and request id; every failure surface of the family answers this one shape. */
export function gatewayerrorof(code: gatewayerror["code"], message: string, requestid: string, retryhint?: string, retryafter?: number): gatewayerror {
  return { code, message, requestid, ...(retryhint !== undefined && retryhint.trim() !== "" ? { retryhint } : {}), ...(retryafter !== undefined && Number.isFinite(retryafter) ? { retryafter } : {}) };
}

/** Normalizes one thrown error into the structured gateway error surface: a thrown gateway error passes through, a timeout keeps its code and every other failure grades as a transport error with its retry hint. */
export function gatewayerrorfrom(error: unknown, requestid: string): gatewayerror {
  if (error !== null && typeof error === "object" && "code" in error && "requestid" in error && typeof (error as gatewayerror).code === "string") return error as gatewayerror;
  const message = error instanceof Error ? error.message : String(error);
  const code = message.includes("timed out") ? "timeout" : "transport";
  return gatewayerrorof(code, message, requestid, "A transient network failure may succeed on a retry; the caller decides whether one runs.");
}

/** Reads the retry after milliseconds a rate limited answer announced: the retry-after header carries seconds or milliseconds, the request epoch dates pass through and an absent or malformed header answers undefined. */
export function gatewayretryafterof(headers: Record<string, string>): number | undefined {
  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() !== "retry-after") continue;
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      const parsed = Number.parseInt(trimmed, 10);
      return parsed > 10_000_000 ? parsed : parsed * 1000;
    }
    const date = Date.parse(trimmed);
    if (Number.isFinite(date)) return Math.max(0, date - Date.now());
  }
  return undefined;
}

/** Masks one provider key for every log, audit entry and error message: the mask answers the key length alone, so no key material — no prefix, no suffix, no fragment — ever reaches a printed line. */
export function maskkey(key: string): string {
  return `vault-key(${key.length} chars, material never prints)`;
}

/** Builds the log safe view of one shaped request: the authorization, api key and proxy header values answer their masked form and a gemini url key parameter strips, so the audit trail and the surfaces never record key material. */
export function maskrequest(request: { url: string; method: string; headers: Record<string, string>; body: string }): { url: string; method: string; headers: Record<string, string>; body: string } {
  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(request.headers)) {
    const lowered = name.toLowerCase();
    headers[name] = lowered === "authorization" || lowered === "x-api-key" || lowered.includes("token") || lowered.includes("secret") ? maskkey(value) : value;
  }
  const url = request.url.replace(/([?&])key=[^&]*/g, "$1key=masked");
  return { url, method: request.method, headers, body: request.body };
}

/** Stores one provider api key behind the vault seam under the explicit consent of the user: the key material enters the seam at the store moment and the metadata record alone answers, scoped to the origin of the provider base url so a key of one gateway never rides another. */
export async function storeproviderkey(input: { seam: { put(vaultid: string, value: string): Promise<void> }; config: Pick<baseurlconfig, "providerid" | "kind" | "baseurl">; profileid: string; value: string; consent: boolean; now: number }): Promise<secretvaultentry> {
  const gate = gatewaykeyconsentgate({ consent: input.consent, providerid: input.config.providerid });
  if (!gate.allowed) throw new Error(gate.reason ?? "The provider key needs its explicit consent before the vault stores it.");
  if (input.value === "") throw new Error("The provider key needs its key material; an empty value stores nothing.");
  let scope = input.config.providerid;
  try { scope = new URL(input.config.baseurl).origin; } catch { /* the base url without a parsed origin keeps the provider id scope */ }
  return vaultstore({ seam: input.seam, label: input.config.providerid, scope, profileid: input.profileid, provenance: "user", value: input.value, now: input.now });
}

/** Resolves one provider key from the vault seam at the last possible moment before the wire header: the value answers to the dispatching caller only, never to a log writer, and the record stamps its use. */
export async function resolveproviderkey(input: { seam: { fetch(vaultid: string): Promise<string | undefined> }; entry: secretvaultentry }): Promise<{ ok: boolean; value?: string; reason: string }> {
  const resolved = await vaultvaluefor({ seam: input.seam, entry: input.entry });
  return { ok: resolved.ok, ...(resolved.value !== undefined ? { value: resolved.value } : {}), reason: resolved.reason };
}

/** Revokes one provider key with one click: the value drops from the seam and the metadata record leaves with it, because a deleted key leaves no trace a surface could read. */
export async function revokeproviderkey(input: { seam: { drop(vaultid: string): Promise<void> }; entry: secretvaultentry }): Promise<{ dropped: boolean; label: string; reason: string }> {
  return vaultdelete({ seam: input.seam, entry: input.entry });
}

/** Checks one export candidate list for leaked provider keys: a candidate whose sha-256 digest matches a stored vault record is a leak the export refuses, because key material never rides an export path. */
export async function keyexportcheck(input: { candidates: string[]; entries: secretvaultentry[] }): Promise<{ leaks: string[]; reason: string }> {
  return secretleakscan({ candidates: input.candidates, entries: input.entries });
}

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

/** Dispatches one wire request through the shared contract loop: the consent and base url gates pass first, the adapter builds its wire request, the transport seam carries it, a rate limited answer honors its retry-after header with the backoff, a transient failure retries under the jittered backoff, the timeout races every attempt, the cancel state stops before the dispatch and between the attempts, and the raw transport answer returns to the caller that parses it — every failure answers the structured gateway error. */
async function dispatch(input: { config: baseurlconfig; model: string; messages: modelmessage[]; apikey?: string; tools?: tooldef[]; temperature?: number; maxtokens?: number; stream?: boolean; options?: gatewayoptions; requestid?: string; cancel?: gatewaycancelstate; transport: fetchtransport; sleep?: (milliseconds: number) => Promise<void>; jitter?: () => number; now?: () => number }): Promise<{ response: transportresponse; requestid: string; request: ReturnType<typeof buildrequest>; duration: number; retries: number }> {
  const requestid = input.requestid ?? randomid();
  const adapter = adapterof(input.config.kind);
  const sleep = input.sleep ?? ((milliseconds: number) => new Promise<void>(resolve => setTimeout(resolve, Math.max(0, milliseconds))));
  const jitter = input.jitter ?? (() => 0);
  const now = input.now ?? Date.now;
  const consent = gatewayconsentgate({ config: input.config });
  if (!consent.allowed) throw gatewayerrorof("noconsent", consent.reason ?? "The provider call stayed behind the consent gate.", requestid, "Grant the provider consent from the options and the call runs.");
  const baseurl = gatewaybaseurlgate({ kind: input.config.kind, baseurl: input.config.baseurl });
  if (!baseurl.allowed) throw gatewayerrorof("notconfigured", baseurl.reason ?? "The provider base url failed its validation.", requestid);
  const shaped = adapter.build({ config: input.config, model: input.model, messages: input.messages, ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), ...(input.tools !== undefined ? { tools: input.tools } : {}), ...(input.temperature !== undefined ? { temperature: input.temperature } : {}), ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}), ...(input.stream === true ? { stream: true } : {}), ...(input.options?.headers !== undefined ? { headers: input.options.headers } : {}) });
  const attempts = Math.max(1, Math.floor(input.options?.retries ?? 0) + 1);
  const backoff = input.options?.backoff ?? 0;
  const jitterwindow = input.options?.jitter ?? 0;
  let retries = 0;
  let lasterror: gatewayerror | undefined;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (input.cancel?.cancelled() === true) throw gatewayerrorof("cancelled", input.cancel.reason(), requestid);
    const startedat = now();
    let response: transportresponse | undefined;
    try {
      const sent = input.transport(shaped.url, { method: shaped.method, headers: shaped.headers, body: shaped.body, redirect: "follow" });
      const timeout = input.options?.timeout;
      if (timeout !== undefined && Number.isFinite(timeout) && timeout >= 0) {
        let timedout = false;
        response = await Promise.race([sent, sleep(timeout).then(() => { timedout = true; return undefined; })]).then(value => value ?? (timedout ? (() => { throw new Error(`The request timed out after ${timeout} milliseconds.`); })() : value));
      } else {
        response = await sent;
      }
    } catch (error) {
      lasterror = gatewayerrorfrom(error, requestid);
    }
    if (response !== undefined) {
      if (response.status === 429) {
        const wait = gatewayretryafterof(response.headers) ?? 0;
        if (attempt < attempts) {
          retries = attempt;
          await sleep(wait + (jitterwindow > 0 ? Math.floor(jitter() * jitterwindow) : 0));
          continue;
        }
        throw gatewayerrorof("ratelimited", `The provider answered rate limited and the retry budget of ${attempts - 1} attempt${attempts - 1 === 1 ? "" : "s"} is exhausted.`, requestid, "Wait the announced window and send the request again.", wait);
      }
      if (response.status === 401 || response.status === 403) throw gatewayerrorof("unauthorized", `The provider answered ${response.status}: the key the vault resolved did not authorize the call.`, requestid, "Check the stored key of the provider and revoke it if it rotated.");
      if (response.status >= 200 && response.status < 300) {
        if (input.cancel?.cancelled() === true) throw gatewayerrorof("cancelled", input.cancel.reason(), requestid);
        return { response, requestid, request: shaped, duration: now() - startedat, retries };
      }
      lasterror = gatewayerrorof("transport", `The provider answered ${response.status}: ${response.body.slice(0, 200)}`, requestid, "A transient server failure may succeed on a retry; the caller decides whether one runs.");
    }
    if (attempt < attempts) {
      const wait = backoff * attempt + (jitterwindow > 0 ? Math.floor(jitter() * jitterwindow) : 0);
      if (wait > 0) await sleep(wait);
      retries = attempt;
    }
  }
  throw lasterror ?? gatewayerrorof("transport", "The provider call failed without an answer.", requestid);
}

/** Sends one gateway request through the shared contract: the dispatch loop runs the gates, the retries, the rate limit honoring, the timeout race and the cancellation, and the adapter parses the answer body with its usage counts — every failure answers the structured gateway error. */
export async function gatewaycall(input: { config: baseurlconfig; model: string; messages: modelmessage[]; apikey?: string; tools?: tooldef[]; temperature?: number; maxtokens?: number; options?: gatewayoptions; requestid?: string; cancel?: gatewaycancelstate; transport: fetchtransport; sleep?: (milliseconds: number) => Promise<void>; jitter?: () => number; now?: () => number }): Promise<gatewayresult> {
  const adapter = adapterof(input.config.kind);
  const outcome = await dispatch({ config: input.config, model: input.model, messages: input.messages, ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), ...(input.tools !== undefined ? { tools: input.tools } : {}), ...(input.temperature !== undefined ? { temperature: input.temperature } : {}), ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}), ...(input.options !== undefined ? { options: input.options } : {}), ...(input.requestid !== undefined ? { requestid: input.requestid } : {}), ...(input.cancel !== undefined ? { cancel: input.cancel } : {}), transport: input.transport, ...(input.sleep !== undefined ? { sleep: input.sleep } : {}), ...(input.jitter !== undefined ? { jitter: input.jitter } : {}), ...(input.now !== undefined ? { now: input.now } : {}) });
  const parsed = adapter.parseanswer(outcome.response.body);
  if (parsed.text === undefined) throw gatewayerrorof("parse", parsed.reason ?? "The provider answer did not parse.", outcome.requestid, "A retried request may parse; the caller decides whether one runs.");
  return { text: parsed.text, ...(parsed.usage !== undefined ? { usage: parsed.usage } : {}), requestid: outcome.requestid, request: outcome.request, status: outcome.response.status, duration: outcome.duration, retries: outcome.retries };
}

/** Streams one gateway request through the shared contract: the request carries the stream flag of its wire format, the adapter parses the streamed body into its ordered tokens (the chat completions deltas, the messages content blocks, the gemini candidate parts or the ollama message lines), the onevent seam fires for every token as it parses so the surfaces append the answer incrementally, and the cancel state stops the parse loop at the token position it reached. */
export async function gatewaystream(input: { config: baseurlconfig; model: string; messages: modelmessage[]; apikey?: string; tools?: tooldef[]; temperature?: number; maxtokens?: number; options?: gatewayoptions; requestid?: string; cancel?: gatewaycancelstate; transport: fetchtransport; sleep?: (milliseconds: number) => Promise<void>; jitter?: () => number; now?: () => number; onevent?: (token: tokenstream) => void }): Promise<{ tokens: tokenstream[]; text: string; requestid: string; request: ReturnType<typeof buildrequest>; status: number; retries: number }> {
  const adapter = adapterof(input.config.kind);
  const outcome = await dispatch({ config: input.config, model: input.model, messages: input.messages, ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), ...(input.tools !== undefined ? { tools: input.tools } : {}), ...(input.temperature !== undefined ? { temperature: input.temperature } : {}), ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}), stream: true, ...(input.options !== undefined ? { options: input.options } : {}), ...(input.requestid !== undefined ? { requestid: input.requestid } : {}), ...(input.cancel !== undefined ? { cancel: input.cancel } : {}), transport: input.transport, ...(input.sleep !== undefined ? { sleep: input.sleep } : {}), ...(input.jitter !== undefined ? { jitter: input.jitter } : {}), ...(input.now !== undefined ? { now: input.now } : {}) });
  const tokens: tokenstream[] = [];
  for (const token of adapter.parsestream(outcome.response.body)) {
    if (input.cancel?.cancelled() === true) break;
    tokens.push(token);
    input.onevent?.(token);
  }
  return { tokens, text: tokens.map(token => token.text).join(""), requestid: outcome.requestid, request: outcome.request, status: outcome.response.status, retries: outcome.retries };
}

/** Fetches the model list of one provider through the adapter: the cache window the user configured decides whether the cached list still serves, a fresh fetch rides the model list endpoint of the wire format, the discovered models annotate with their context and modality hints when the provider offers them and a failed fetch keeps the cache untouched. */
export async function fetchmodellist(input: { config: baseurlconfig; apikey?: string; cachewindow?: number; cache?: modelcacherecord; transport: fetchtransport; options?: gatewayoptions; now?: () => number }): Promise<{ models: gatewaymodelinfo[]; cached: boolean; fetchedat: number; reason?: string }> {
  const now = input.now ?? Date.now;
  const adapter = adapterof(input.config.kind);
  if (input.cache !== undefined) {
    const window = input.cachewindow;
    if (window !== undefined && Number.isFinite(window) && window > 0 && now() - input.cache.fetchedat < window) return { models: input.cache.models, cached: true, fetchedat: input.cache.fetchedat };
  }
  const baseurl = gatewaybaseurlgate({ kind: input.config.kind, baseurl: input.config.baseurl });
  if (!baseurl.allowed) return { models: [], cached: false, fetchedat: now(), ...(baseurl.reason !== undefined ? { reason: baseurl.reason } : {}) };
  const headers: Record<string, string> = { ...(input.options?.headers ?? {}) };
  let url = gatewayurl(input.config, adapter.modelspath());
  if (input.apikey !== undefined && input.apikey.trim() !== "") {
    if (input.config.kind === "geminigateway") url = `${url}${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(input.apikey)}`;
    else headers.authorization = `Bearer ${input.apikey}`;
  }
  let response: transportresponse;
  try {
    response = await input.transport(url, { method: "GET", headers, redirect: "follow" });
  } catch (error) {
    return { models: [], cached: false, fetchedat: now(), reason: `The model list fetch failed: ${error instanceof Error ? error.message : String(error)}` };
  }
  if (response.status < 200 || response.status >= 300) return { models: [], cached: false, fetchedat: now(), reason: `The model list endpoint answered ${response.status}.` };

  const models = adapter.parsemodellist(response.body);
  return { models, cached: false, fetchedat: now() };
}

/** Builds the capabilityad advertisement of the tool catalog: the tools serialize into the wire format of the provider (the function schema of the chat completions shape, the input schema of the messages shape, the function declarations of the generate content shape or the function schema of the local runtime), every tool declares its consent requirement from its metadata and the plan review gate rides the required capabilities because a model answer never executes a step the human review did not approve. */
export function capabilityadvertisement(input: { kind: gatewaykind; tools: tooldef[] }): { kind: gatewaykind; tools: unknown[]; consent: Array<{ tool: string; review: string; riskclass?: string; approvalrequired?: boolean }>; requiredcapabilities: string[] } {
  const adapter = adapterof(input.kind);
  return {
    kind: input.kind,
    tools: adapter.toolcatalog(input.tools),
    consent: input.tools.map(tool => ({ tool: tool.name, review: tool.consentmeta?.review ?? `${tool.name} is a ${tool.risk} tool; it runs only behind its reviewed plan step.`, ...(tool.consentmeta?.riskclass !== undefined ? { riskclass: tool.consentmeta.riskclass } : {}), ...(tool.consentmeta?.approvalrequired === true ? { approvalrequired: true } : {}) })),
    requiredcapabilities: ["planreview"]
  };
}

/** Resolves the gateway route of one task kind: the user rules of the model routing table map the kind onto its provider and model, a remote provider the consent or enable gates refuse falls back to the user configured fallback pair, and when remote calls are not allowed at all the resolution falls back to the local provider so the task stays on the machine. */
export function resolvegatewayroute(input: { kind: string; routes: modelroute[]; providers: providerconfig[]; configs: baseurlconfig[]; local?: localmodelconfig; remoteallowed?: boolean; sessionorigin?: string }): { source: "route" | "fallback" | "local"; provider?: providerconfig; model?: string; config?: baseurlconfig; local?: localmodelconfig; reason?: string } {
  const remoteallowed = input.remoteallowed !== false;
  const configof = (providerid: string): baseurlconfig | undefined => input.configs.find(config => config.providerid === providerid);
  const primary = resolveroute({ routes: input.routes, providers: input.providers, kind: input.kind });
  if (primary.provider !== undefined && primary.model !== undefined) {
    const config = configof(primary.provider.id);
    if (remoteallowed && (config === undefined || gatewayconsentgate({ config }).allowed)) return { source: "route", provider: primary.provider, model: primary.model, ...(config !== undefined ? { config } : {}) };
  }
  const fallback = fallbackroute({ routes: input.routes, providers: input.providers, kind: input.kind });
  if (fallback.provider !== undefined && fallback.model !== undefined && remoteallowed) {
    const config = configof(fallback.provider.id);
    if (config === undefined || gatewayconsentgate({ config }).allowed) return { source: "fallback", provider: fallback.provider, model: fallback.model, ...(config !== undefined ? { config } : {}) };
  }
  if (input.local !== undefined && input.local.endpoint.trim() !== "") return { source: "local", local: input.local, model: input.local.model, reason: remoteallowed ? `The remote route of ${input.kind} stayed behind its gates, so the resolution fell back to the local provider.` : `Remote calls are not allowed, so the ${input.kind} task fell back to the local provider.` };
  return { source: "route", reason: primary.reason ?? `No model route configures the task kind ${input.kind} and no local provider stands in.` };
}

/** Builds one usage record of a gateway call: the request id rides the record for the correlation across the run, the session id reports the per session totals beside the per run totals, the cost answers the user configured price per million tokens and the local marker stamps the calls that never left the machine. */
export function gatewayusagerecord(input: { providerid: string; endpoint: string; model: string; usage?: modelusage; costpermilliontokens?: number; sessionid?: string; runid?: string; stepid?: string; requestid: string; local?: boolean; now: number }): usagerecord {
  const prompttokens = input.usage?.prompttokens ?? 0;
  const completiontokens = input.usage?.completiontokens ?? 0;
  const totaltokens = input.usage?.totaltokens ?? prompttokens + completiontokens;
  const cost = input.costpermilliontokens !== undefined && Number.isFinite(input.costpermilliontokens) ? ((prompttokens + completiontokens) / 1_000_000) * input.costpermilliontokens : 0;
  return { id: randomid(), ...(input.runid !== undefined ? { runid: input.runid } : {}), ...(input.stepid !== undefined ? { stepid: input.stepid } : {}), ...(input.sessionid !== undefined ? { sessionid: input.sessionid } : {}), requestid: input.requestid, providerid: input.providerid, endpoint: input.endpoint, model: input.model, prompttokens, completiontokens, totaltokens, cost, ...(input.local === true ? { local: true } : {}), at: input.now };
}

/** Checks the warning threshold of the cost budget: the budget tracking warns once the recorded tokens or cost cross the user configured share of their ceiling, while the halt of the reviewed budget check stays separate — a warning never blocks a call, the halt does. */
export function gatewaybudgetwarning(input: { budget?: costbudget; totals: { totaltokens: number; cost: number } }): { warned: boolean; tokenratio?: number; costratio?: number; reason?: string } {
  const budget = input.budget;
  if (budget === undefined || budget.warnratio === undefined || !Number.isFinite(budget.warnratio) || budget.warnratio <= 0) return { warned: false };
  const ratio = Math.min(1, Math.max(0, budget.warnratio));
  const tokenratio = budget.maxtokens !== undefined && Number.isFinite(budget.maxtokens) && budget.maxtokens > 0 ? input.totals.totaltokens / budget.maxtokens : undefined;
  const costratio = budget.maxcost !== undefined && Number.isFinite(budget.maxcost) && budget.maxcost > 0 ? input.totals.cost / budget.maxcost : undefined;
  const warned = (tokenratio !== undefined && tokenratio >= ratio) || (costratio !== undefined && costratio >= ratio);
  if (!warned) return { warned: false, ...(tokenratio !== undefined ? { tokenratio } : {}), ...(costratio !== undefined ? { costratio } : {}) };
  return { warned: true, ...(tokenratio !== undefined ? { tokenratio } : {}), ...(costratio !== undefined ? { costratio } : {}), reason: `The recorded usage crossed the user configured warning threshold of ${Math.round(ratio * 100)} percent${tokenratio !== undefined && tokenratio >= ratio ? ` at ${Math.round(tokenratio * 100)} percent of the token ceiling` : ""}${costratio !== undefined && costratio >= ratio ? ` at ${Math.round(costratio * 100)} percent of the cost ceiling` : ""}.` };
}

/** Builds the cost estimate view of the configured providers: the projected cost per million tokens answers the user configured price of every provider and model pair beside the recorded tokens and cost of the usage records, so the surfaces show what a call costs before it runs — a pair without configured pricing answers zero instead of an invented number. */
export function costestimates(input: { configs: baseurlconfig[]; providers: providerconfig[]; records: usagerecord[] }): costestimate[] {
  const pairs = new Map<string, costestimate>();
  const pricingof = (providerid: string, model: string): { permillion: number; currency?: string } | undefined => {
    const config = input.configs.find(entry => entry.providerid === providerid);
    if (config !== undefined && config.costpermilliontokens !== undefined && Number.isFinite(config.costpermilliontokens)) return { permillion: config.costpermilliontokens, ...(config.currency !== undefined && config.currency.trim() !== "" ? { currency: config.currency.trim() } : {}) };
    const provider = input.providers.find(entry => entry.id === providerid);
    if (provider !== undefined && provider.costpermilliontokens !== undefined && Number.isFinite(provider.costpermilliontokens) && provider.models.includes(model)) return { permillion: provider.costpermilliontokens, ...(provider.currency !== undefined && provider.currency.trim() !== "" ? { currency: provider.currency.trim() } : {}) };
    return undefined;
  };
  for (const record of input.records) {
    const key = `${record.providerid}::${record.model}`;
    const entry = pairs.get(key) ?? { providerid: record.providerid, model: record.model, permillion: 0, recordedtokens: 0, recordedcost: 0 };
    entry.recordedtokens += record.totaltokens;
    entry.recordedcost += record.cost;
    const pricing = pricingof(record.providerid, record.model);
    if (pricing !== undefined) { entry.permillion = pricing.permillion; if (pricing.currency !== undefined) entry.currency = pricing.currency; }
    pairs.set(key, entry);
  }
  for (const provider of input.providers) {
    if (provider.costpermilliontokens === undefined || !Number.isFinite(provider.costpermilliontokens)) continue;
    for (const model of provider.models) {
      const key = `${provider.id}::${model}`;
      if (pairs.has(key)) continue;
      pairs.set(key, { providerid: provider.id, model, permillion: provider.costpermilliontokens, ...(provider.currency !== undefined && provider.currency.trim() !== "" ? { currency: provider.currency.trim() } : {}), recordedtokens: 0, recordedcost: 0 });
    }
  }
  return [...pairs.values()];
}

/** The reviewed default guard of the gateway plan answers: the goal, the steps array and the open questions the plan schema asks, with one retry before the refusal. */
export const gatewayplanguard: parseguard = { schema: { goal: { type: "string", required: true }, steps: { type: "array", required: true }, openquestions: { type: "array" } }, retries: 1 };

/** Builds the structured retry prompt of one refused model answer: the prompt names the schema the answer failed, quotes the failure reason of the guard and asks the model to answer with the corrected json object alone, so a retry teaches the shape instead of repeating the failure. */
export function guardretryprompt(output: modeloutput): string {
  return `Your previous answer failed its guard: ${output.reason ?? "the answer did not match the expected schema."} Answer again with a single json object that carries the required fields with their declared types — the goal as a string, the steps as an array of { kind, target, value, summary } objects using browser action kinds and the openquestions as an array of strings — and nothing else around it.`;
}

/** Runs the gateway guardrails over the model answer attempts: every attempt validates against the plan schema through the shared parse guard, the attempts cap at the user configured retry count, a valid attempt wins, a refusal marker refuses without retries and the exhaustion of every capped attempt refuses the output so nothing invalid ever reaches a plan — the structured retry prompt answers whenever a retry is left. */
export function gatewayguard(input: { guard?: parseguard; attempts: string[] }): { output: modeloutput; retryprompt?: string; cappedat: number } {
  const guard = input.guard ?? gatewayplanguard;
  const capcheck = gatewayretrycapvalid(guard.retries);
  if (!capcheck.allowed) throw new Error(capcheck.reason ?? "The configured retry cap failed its validation.");
  const cap = Math.max(1, Math.floor(guard.retries) + 1);
  const attempts = input.attempts.slice(0, cap);
  const output = guardoutput({ guard, attempts });
  if (output.verdict === "invalid" && attempts.length < cap) return { output, retryprompt: guardretryprompt(output), cappedat: cap };
  return { output, cappedat: cap };
}

/** The per task prompt templates of the gateway family: every template ships with its double braced variable slots and its version, the memory store keeps the versions and a template renders through the shared prompt library with its variables. */
export function gatewaytemplates(now: number): prompttemplate[] {
  return [
    { id: randomid(), name: "gateway.parsecommand", body: "Parse the user command into json with the fields intent (one of navigate, extract, fill, monitor, automate, ask), entities (an array of { name, value } objects) and confidence (a number between 0 and 1). The command: {{command}}. Answer with the json object only.", variables: ["command"], version: 1, notes: "The gateway parsecommand template of the 1.1.83 family.", createdat: now },
    { id: randomid(), name: "gateway.draftplan", body: "Draft a browser agent plan for the goal {{goal}} as json with the fields goal (string), steps (an array of { kind, target, value, summary } objects using browser action kinds) and openquestions (an array of strings for what stays unclear). The tool catalog: {{tools}}. Answer with the json object only.", variables: ["goal", "tools"], version: 1, notes: "The gateway draftplan template of the 1.1.83 family.", createdat: now },
    { id: randomid(), name: "gateway.replan", body: "The plan for {{goal}} failed at the steps {{failed}} with the reason {{reason}}. The completed steps stay: {{completed}}. Draft the revised tail steps as json with the field steps (an array of { kind, target, value, summary } objects using browser action kinds). Answer with the json object only.", variables: ["goal", "failed", "reason", "completed"], version: 1, notes: "The gateway replan template of the 1.1.83 family.", createdat: now },
    { id: randomid(), name: "gateway.reflect", body: "Reflect on the executed step {{stepid}} of the run {{runid}} with the outcome: {{outcome}}. Answer as json with the fields outcome (string), lesson (string) and advice (string) for the next step. Answer with the json object only.", variables: ["stepid", "runid", "outcome"], version: 1, notes: "The gateway reflect template of the 1.1.83 family.", createdat: now },
    { id: randomid(), name: "gateway.chat", body: "{{prompt}}", variables: ["prompt"], version: 1, notes: "The gateway chat template of the 1.1.83 family; the streamed answers render token by token in the sidepanel chat.", createdat: now }
  ];
}

/** Composes one gateway prompt from a stored template and its variable values through the shared prompt library; a missing template name answers the reason so the caller refuses instead of sending a hollow prompt. */
export function composegatewayprompt(input: { templates: prompttemplate[]; name: string; variables: Record<string, unknown> }): { text?: string; reason?: string } {
  const template = input.templates.find(entry => entry.name === input.name);
  if (template === undefined) return { reason: `No stored prompt template answers the name ${input.name}.` };
  return rendertemplate({ template, variables: input.variables });
}

/** Assembles the streamed tokens of a gateway chat for incremental rendering: every poll reads the tokens past its cursor, the assembled text carries only the fresh batch and the done marker answers whether a finished stream delivered its last token — the sidepanel chat appends every batch as it arrives instead of waiting for the whole answer. */
export function streamrender(tokens: gatewaychattoken[], cursor: number, finished: boolean): { text: string; nextcursor: number; done: boolean } {
  const fresh = tokens.filter(token => token.seq > cursor);
  const nextcursor = fresh.length > 0 ? (fresh[fresh.length - 1] as gatewaychattoken).seq : cursor;
  const last = tokens.length > 0 ? (tokens[tokens.length - 1] as gatewaychattoken).seq : 0;
  return { text: fresh.map(token => token.text).join(""), nextcursor, done: finished && nextcursor >= last };
}

/** Builds one gateway chat state of a streamed exchange: the request id, the provider, the model, the prompt and the token list the panel polls through its cursor; the state never carries key material. */
export function gatewaychatstateof(input: { requestid: string; config: baseurlconfig; model: string; prompt: string; tokens?: gatewaychattoken[]; done?: boolean; error?: gatewayerror; now: number }): gatewaychatstate {
  return { requestid: input.requestid, providerid: input.config.providerid, kind: input.config.kind, model: input.model, prompt: input.prompt, tokens: input.tokens ?? [], done: input.done === true, ...(input.error !== undefined ? { error: input.error } : {}), at: input.now };
}

/** Reads whether one base url points at the local machine, shared with the llm provider model so the local marker of the usage records answers one rule. */
export function gatewayislocal(config: Pick<baseurlconfig, "baseurl">): boolean {
  return islocalorigin(config.baseurl);
}

/** Runs the reviewed budget check over the usage totals: the token and currency ceilings halt the run and ask the user, exactly as every model call of the llm family already does — the gateway calls pass the same budget gate. */
export function gatewaybudgetcheck(input: { budget: costbudget | undefined; totals: { totaltokens: number; cost: number } }): { allowed: boolean; halted: boolean; asksuser: boolean; reason?: string } {
  return budgetcheck({ budget: input.budget, totals: input.totals });
}

/** Validates one gateway config before it saves: the base url passes its scheme, host and path shape gate, the path prefix passes its namespace gate, the ollamalocal base url defaults to the local machine when the user left it empty and every remote kind refuses an empty base url. */
export function validategatewayconfig(config: baseurlconfig): { ok: boolean; config: baseurlconfig; reason?: string } {
  const baseurl = config.baseurl.trim() !== "" ? config.baseurl.trim() : defaultbaseurl(config.kind);
  const normalized: baseurlconfig = { ...config, baseurl };
  const prefix = gatewayprefixgate(normalized.pathprefix ?? "");
  if (!prefix.allowed) return { ok: false, config, ...(prefix.reason !== undefined ? { reason: prefix.reason } : {}) };
  const gate = gatewaybaseurlgate({ kind: normalized.kind, baseurl });
  if (!gate.allowed) return { ok: false, config, ...(gate.reason !== undefined ? { reason: gate.reason } : {}) };
  return { ok: true, config: normalized };
}

/** The key reference the gateway config carries: the name the surfaces show, the origin scope of the provider base url and the storage id of the vault entry — never the key material. */
export function gatewaykeyref(name: string, baseurl: string, storageid: string, configuredat: number): apikeyref {
  let origins = [baseurl];
  try { origins = [new URL(baseurl).origin]; } catch { /* a base url without a parsed origin keeps the raw text the user typed */ }
  return { name, origins, header: "authorization", storageid, configuredat };
}


/* ── Merged from webapi.ts: the 1.1.88 consolidation interns the correlated webapi logic here, so no variation of the same file lives beside another. ── */
/**
 * Web api transport logics of the 1.1.76 family.
 * Every correlated rule for the widened transport surface lives in this one module: the server sent events subscription lifecycle with field parsing, last event id resume, clean cancellation and channel error surfacing; the long poll request loop that waits on the response cursor, retries on the configured timeout backoff and stops on cancellation or plan expiry; the graphql subscription message mapping of next, error and complete frames into step results; the urlencoded form post and the streamed multipart upload with their part encodings and upload progress; the per run correlation id assignment that joins request and response pairs and exports one request map to the audit trail; the rate limit directive parsing that delays the next request until the reset window and honors the retry after wait of 429 and 503 answers; and the per run response cache that keys by url, method and body hash, serves repeated read only calls inside one run, expires entries by the response headers and the user policy and never caches a response that follows a mutation.
 * The module reuses the socketbus parsing of the 1.1.43 family for the event stream grammar and the poll cursor decisions, and the netauth encodings of the 1.1.44 family for the urlencoded and multipart wire shapes, so the transport widening extends the reviewed families instead of duplicating them.
 * Message payloads and field values are opaque reviewed text; no payload value enters any audit summary built from these results, and every timeout, backoff, retention and bound stays a user choice with no code default — an absent value never hides a hardcoded ceiling.
 */
import { parsessetext, polldecision, pollurl, sserequestheaders, type sseevent } from "./net.js";
import { urlencodeform } from "./auth.js";
import { retryafterof } from "./net.js";

/** Stream open seam: one reviewed url with its request headers resolves to a reader of text chunks or an error class; the extension executor wires the fetch stream, tests wire plain fixtures. */
export type streamopen = (url: string, headers: Record<string, string>) => Promise<{ ok: boolean; status: number; read: () => Promise<{ done: boolean; text?: string }>; error?: string }>;

/** Poll fetch seam: one poll url with its optional request body resolves to the response status, headers and text; the extension executor wires fetch, tests wire plain fixtures. */
export type pollfetch = (url: string, body?: string) => Promise<{ status: number; headers: Record<string, string>; body: string; timeout?: boolean }>;

/**
 * Runs one server sent events subscription through the stream open seam: the channel reads chunk by chunk, every complete block parses into its event, data, id and retry fields, the last event id persists so a reconnect resumes exactly where the stream stopped, a cancelled step or an elapsed lifetime closes the channel cleanly, and a channel error surfaces to the run state machine instead of dying silently.
 */
export async function subevents(input: { record: eventsubscription; open: streamopen; cancelled?: () => boolean; now?: () => number }): Promise<{ record: eventsubscription; events: sseevent[]; error?: string }> {
  const now = input.now ?? Date.now;
  let current = { ...input.record, state: "open" as const };
  const events: sseevent[] = [];
  let buffer = "";
  let error: string | undefined;
  const lifetimeelapsed = (): boolean => current.lifetime !== undefined && now() - current.openedat >= current.lifetime;
  try {
    const opened = await input.open(current.url, sserequestheaders(current));
    if (!opened.ok) {
      return { record: { ...current, state: "failed", closedat: now(), ...(opened.error !== undefined ? { error: opened.error } : {}) }, events, error: opened.error ?? `The event stream channel refused the subscription with status ${opened.status}.` };
    }
    for (;;) {
      if (input.cancelled?.() === true) break;
      if (lifetimeelapsed()) break;
      const chunk = await opened.read();
      if (chunk.done) break;
      buffer += chunk.text ?? "";
      const parsed = parsessetext(buffer);
      buffer = parsed.rest;
      for (const event of parsed.events) {
        const names = event.event !== undefined && !current.names.includes(event.event) ? [...current.names, event.event] : current.names;
        current = { ...current, events: current.events + 1, names, ...(event.id !== undefined ? { lasteventid: event.id } : {}) };
        events.push(event);
      }
    }
  } catch (failure) {
    if (input.cancelled?.() !== true && !lifetimeelapsed()) error = failure instanceof Error ? failure.message : String(failure);
  }
  const state: eventsubscription["state"] = error !== undefined ? "failed" : "closed";
  const closed = { ...current, state, closedat: now() };
  return { record: closed, events, ...(error !== undefined ? { error } : {}) };
}

/** Normalizes one reviewed long poll request from step options: the url the poll drives, the user chosen timeout of one request and the resume cursor; an absent timeout never aborts a poll because the bound stays a user choice with no code default. */
export function longpollrequestof(value: unknown): longpollrequest | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  if (typeof entry.url !== "string" || !entry.url.trim()) return undefined;
  const request: longpollrequest = { url: entry.url.trim() };
  if (typeof entry.timeout === "number" && Number.isFinite(entry.timeout) && entry.timeout > 0) request.timeout = entry.timeout;
  if (typeof entry.cursor === "string" && entry.cursor.trim()) request.cursor = entry.cursor.trim();
  return request;
}

/**
 * Runs one long poll loop through the poll fetch seam: each iteration issues the request the reviewed cursor builds, waits on the response cursor, retries a timed out request under the configured backoff and stops on the reviewed stop condition, the cancellation flag, the plan expiry or the reviewed poll ceiling; the loop never invents a bound of its own.
 */
export async function longpoll(input: { request: longpollrequest; cursor: pollcursor; fetchpoll: pollfetch; cancelled?: () => boolean; expiresat?: number; backoff?: number; now?: () => number; sleep?: (milliseconds: number) => Promise<void> }): Promise<{ polls: number; retries: number; reason: string; cursor?: string; exchanges: Array<{ url: string; status: number; body: string; timeout: boolean }>; error?: string }> {
  const now = input.now ?? Date.now;
  const sleep = input.sleep ?? ((milliseconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, Math.max(0, milliseconds))));
  const exchanges: Array<{ url: string; status: number; body: string; timeout: boolean }> = [];
  let polls = 0;
  let retries = 0;
  let reason = "The long poll loop stopped.";
  let cursorvalue = input.request.cursor;
  let next = pollurl(input.cursor, cursorvalue);
  let error: string | undefined;
  for (;;) {
    if (input.cancelled?.() === true) { reason = "The long poll loop was cancelled."; break; }
    if (input.expiresat !== undefined && now() >= input.expiresat) { reason = "The long poll loop stopped at the reviewed plan expiry."; break; }
    let response: Awaited<ReturnType<pollfetch>> | undefined;
    try {
      response = await input.fetchpoll(next.url, next.body);
    } catch (failure) {
      if (input.cancelled?.() === true) { reason = "The long poll loop was cancelled."; break; }
      error = failure instanceof Error ? failure.message : String(failure);
      reason = `The long poll request failed: ${error}`;
      break;
    }
    if (response.timeout === true && input.request.timeout !== undefined) {
      retries += 1;
      exchanges.push({ url: next.url, status: response.status, body: response.body, timeout: true });
      if (input.backoff !== undefined && input.backoff > 0) await sleep(input.backoff);
      continue;
    }
    polls += 1;
    exchanges.push({ url: next.url, status: response.status, body: response.body, timeout: false });
    let parsed: unknown;
    try { parsed = JSON.parse(response.body); } catch { parsed = undefined; }
    const decision = polldecision({ cursor: input.cursor, polls: polls - 1, response: parsed, cancelled: () => input.cancelled?.() === true, ...(input.expiresat !== undefined ? { expiresat: input.expiresat } : {}), now: now() });
    if (!decision.continue) { reason = decision.reason; break; }
    cursorvalue = decision.cursor;
    const following = decision.next ?? { url: next.url, wait: input.cursor.interval };
    await sleep(following.wait);
    next = { url: following.url, ...(following.body !== undefined ? { body: following.body } : {}) };
  }
  return { polls, retries, reason, ...(cursorvalue !== undefined ? { cursor: cursorvalue } : {}), exchanges, ...(error !== undefined ? { error } : {}) };
}

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
export function graphqlsubscriptionof(value: unknown): graphqlsubscription | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  if (typeof entry.query !== "string" || !entry.query.trim()) return undefined;
  if (typeof entry.channel !== "string" || !entry.channel.trim()) return undefined;
  const variables: Record<string, string> = {};
  if (entry.variables !== undefined) {
    if (!entry.variables || typeof entry.variables !== "object" || Array.isArray(entry.variables)) return undefined;
    for (const [name, item] of Object.entries(entry.variables as Record<string, unknown>)) {
      if (typeof item !== "string") return undefined;
      variables[name] = item;
    }
  }
  return { query: entry.query.trim(), ...(Object.keys(variables).length > 0 ? { variables } : {}), channel: entry.channel.trim() };
}

/** Parses one inbound graphql subscription message of the graphql-ws grammar into its next, error or complete kind; an unparseable frame reports itself as an error instead of dying silently. */
export function parsegraphqlmessage(payload: string): graphqlmessage {
  let parsed: unknown;
  try { parsed = JSON.parse(payload); } catch { return { kind: "error", errors: ["The graphql subscription message does not parse as json."] }; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { kind: "error", errors: ["The graphql subscription message is not an object."] };
  const entry = parsed as Record<string, unknown>;
  const id = typeof entry.id === "string" && entry.id.trim() !== "" ? entry.id.trim() : undefined;
  if (entry.type === "complete" || entry.type === "stop") return { kind: "complete", ...(id !== undefined ? { id } : {}) };
  if (entry.type === "error") {
    const raw = entry.payload;
    const messages = Array.isArray(raw) ? raw.map(item => item instanceof Error ? item.message : typeof item === "object" && item !== null && "message" in item ? String((item as Record<string, unknown>).message) : String(item)) : raw !== undefined ? [String(raw)] : ["The graphql subscription reported an error without a message."];
    return { kind: "error", ...(id !== undefined ? { id } : {}), errors: messages };
  }
  if (entry.type === "next" || entry.type === "data") return { kind: "next", ...(id !== undefined ? { id } : {}), payload: entry.payload };
  return { kind: "error", errors: [`The graphql subscription message carries the unknown type ${String(entry.type)}.`] };
}

/** Builds the graphql-ws subscribe frame of one reviewed subscription: the operation id, the query and its variables ride one json frame the channel publishes. */
export function graphqlsubscribeframe(subscription: graphqlsubscription, operationid: string): string {
  return JSON.stringify({ id: operationid, type: "subscribe", payload: { query: subscription.query, ...(subscription.variables !== undefined ? { variables: subscription.variables } : {}) } });
}

/** Maps the inbound graphql subscription messages into step results: every next payload becomes one result with its operation id, the errors collect for the step outcome and the complete marker closes the mapping. */
export function graphqlsub(input: { subscription: graphqlsubscription; messages: string[] }): { results: Array<{ id?: string; data: unknown }>; errors: string[]; completed: boolean } {
  const results: Array<{ id?: string; data: unknown }> = [];
  const errors: string[] = [];
  let completed = false;
  for (const message of input.messages) {
    const parsed = parsegraphqlmessage(message);
    if (parsed.kind === "next") results.push({ ...(parsed.id !== undefined ? { id: parsed.id } : {}), data: parsed.payload });
    if (parsed.kind === "error") errors.push(...(parsed.errors ?? ["The graphql subscription reported an error."]));
    if (parsed.kind === "complete") completed = true;
  }
  return { results, errors, completed };
}

/** True when one url origin sits inside the granted origins; wss channels map onto their https origin through the channel origin rule. */
function granted(url: string, grants: string[]): boolean {
  let origin = "";
  try { origin = new URL(url).origin; } catch { return false; }
  return grants.some(pattern => {
    try { return origin === new URL(pattern).origin; } catch { return false; }
  });
}

/** Builds one reviewed urlencoded form post for a granted origin: the fields encode with the urlencoded grammar under the application/x-www-form-urlencoded content type, and an origin outside the grants refuses before any byte moves. */
export function formpost(input: { payload: formpayload; grants: string[] }): { ok: true; url: string; method: "POST"; headers: Record<string, string>; body: string } | { ok: false; refusal: string } {
  if (!granted(input.payload.url, input.grants)) return { ok: false, refusal: `The form post to ${input.payload.url} targets an origin outside the session grants; the transport never widens the grants.` };
  return { ok: true, url: input.payload.url, method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: urlencodeform(input.payload.fields) };
}

/** Builds the part headers of one multipart file field: the content disposition names the field and the filename while the content type carries the reviewed mime of the part. */
export function multipartfieldheader(field: multipartfield): string {
  return `--BOUNDARY\r\ncontent-disposition: form-data; name="${field.name}"; filename="${field.filename}"\r\ncontent-type: ${field.contenttype}\r\n\r\n`;
}

/** Encodes one reviewed multipart upload for a granted origin: the fields and the files encode into ordered chunks under one boundary, the progress callback reports each streamed chunk with its sent and total bytes without ever buffering the whole payload, and an origin outside the grants or an unreviewed file refuses before any byte moves. */
export function multipartpost(input: { payload: multipartpayload; grants: string[]; onprogress?: (progress: { chunk: number; chunks: number; sent: number; total: number }) => void }): { ok: true; url: string; method: "POST"; headers: Record<string, string>; chunks: string[]; boundary: string; bytes: number } | { ok: false; refusal: string } {
  if (!granted(input.payload.url, input.grants)) return { ok: false, refusal: `The multipart upload to ${input.payload.url} targets an origin outside the session grants; the transport never widens the grants.` };
  if (input.payload.files.some(file => file.reviewed !== true)) return { ok: false, refusal: "Every file of a multipart upload carries its explicit reviewed flag before the payload encodes." };
  const boundary = input.payload.boundary ?? `----devthink${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  const chunks: string[] = [];
  for (const field of input.payload.fields) chunks.push(`--${boundary}\r\ncontent-disposition: form-data; name="${field.name}"\r\n\r\n${field.value}\r\n`);
  for (const file of input.payload.files) chunks.push(multipartfieldheader({ name: file.name, filename: file.filename, contenttype: file.mime }).replaceAll("BOUNDARY", boundary) + `${file.content}\r\n`);
  chunks.push(`--${boundary}--\r\n`);
  const bytes = chunks.reduce((total, chunk) => total + chunk.length, 0);
  let sent = 0;
  for (const [index, chunk] of chunks.entries()) {
    sent += chunk.length;
    input.onprogress?.({ chunk: index + 1, chunks: chunks.length, sent, total: bytes });
  }
  return { ok: true, url: input.payload.url, method: "POST", headers: { "content-type": `multipart/form-data; boundary=${boundary}` }, chunks, boundary, bytes };
}

/** Assigns one request id per outbound request of the run: the correlation context grows by the request, the correlation id derives from the run and the request order, and the mapping stays read only inside the run. */
export function correlateids(input: { context: correlationcontext; stepid: string; url: string; method: string; now: number }): { context: correlationcontext; requestid: string } {
  let origin = "";
  try { origin = new URL(input.url).origin; } catch { origin = ""; }
  const index = input.context.requests.length + 1;
  const requestid = `req-${index}`;
  const request: correlatedrequest = { requestid, correlationid: `${input.context.runid}-${index}`, stepid: input.stepid, url: input.url, origin, method: input.method, at: input.now };
  return { context: { runid: input.context.runid, requests: [...input.context.requests, request] }, requestid };
}

/** Joins one response onto its request through the shared correlation id: the request gains its response id and status, and a request id the map does not carry refuses instead of pairing the wrong pair. */
export function joincorrelation(input: { context: correlationcontext; requestid: string; responseid?: string; status: number; now: number }): correlationcontext {
  const request = input.context.requests.find(entry => entry.requestid === input.requestid);
  if (!request) throw new Error(`The correlation map of the run carries no request ${input.requestid}; the response joins only its own request.`);
  const joined: correlatedrequest = { ...request, ...(input.responseid !== undefined ? { responseid: input.responseid } : {}), status: input.status };
  return { runid: input.context.runid, requests: input.context.requests.map(entry => entry.requestid === input.requestid ? joined : entry) };
}

/** Exports the per run request map for the audit trail: every request with its correlation id, its pair state and the paired share, read only beside the run it belongs to. */
export function correlationexport(context: correlationcontext): { runid: string; requests: number; pairs: number; map: Array<{ requestid: string; correlationid: string; stepid: string; url: string; origin: string; method: string; paired: boolean; status?: number; at: number }> } {
  const map = context.requests.map(request => ({ requestid: request.requestid, correlationid: request.correlationid, stepid: request.stepid, url: request.url, origin: request.origin, method: request.method, paired: request.responseid !== undefined, ...(request.status !== undefined ? { status: request.status } : {}), at: request.at }));
  return { runid: context.runid, requests: map.length, pairs: map.filter(entry => entry.paired).length, map };
}

/** Parses one rate limit directive from the response headers: the remaining count and the reset window of the x-ratelimit family and the retry after wait of a 429 or 503 answer compose into one directive scoped to the origin; headers without any rate limit fact parse to nothing. */
export function ratelimitdirectiveof(headers: Record<string, string>, origin: string, status: number, now: number): ratelimitdirective | undefined {
  const pick = (name: string): number | undefined => {
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() !== name) continue;
      const value = Number(headers[key]);
      if (Number.isFinite(value) && value >= 0) return value;
    }
    return undefined;
  };
  const remaining = pick("x-ratelimit-remaining");
  const reset = pick("x-ratelimit-reset");
  const retryafter = retryafterof(status, headers);
  if (remaining === undefined && reset === undefined && retryafter === undefined) return undefined;
  let resetat = now;
  if (reset !== undefined) resetat = reset > Math.floor(now / 1000) ? reset * 1000 : now + reset * 1000;
  if (retryafter !== undefined) resetat = Math.max(resetat, now + retryafter);
  return { origin, scope: origin, ...(remaining !== undefined ? { remaining } : {}), resetat, ...(retryafter !== undefined ? { retryafter } : {}), at: now };
}

/** Resolves the wait the next request of one origin owes: the newest directive of the origin names the milliseconds until its reset window passes, an absent or passed directive waits nothing, and the wait itself stays a user respected value with no code ceiling. */
export function ratelimitwaitof(directives: ratelimitdirective[], origin: string, now: number): { waitms: number; directive?: ratelimitdirective } {
  const scoped = directives.filter(directive => directive.origin === origin);
  let newest: ratelimitdirective | undefined;
  for (const directive of scoped) if (newest === undefined || directive.at > newest.at) newest = directive;
  if (newest === undefined) return { waitms: 0 };
  return { waitms: Math.max(0, newest.resetat - now), ...(newest !== undefined ? { directive: newest } : {}) };
}

/** Applies the rate limit respect before one transport call: the wait sleeps until the reset window of the origin passes so the call never crosses a limit the endpoint published, and the resolved wait reports itself for the audit trail. */
export async function ratelimitrespect(input: { directives: ratelimitdirective[]; origin: string; now?: () => number; sleep?: (milliseconds: number) => Promise<void> }): Promise<{ waitms: number; directive?: ratelimitdirective }> {
  const now = input.now ?? Date.now;
  const sleep = input.sleep ?? ((milliseconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, Math.max(0, milliseconds))));
  const resolved = ratelimitwaitof(input.directives, input.origin, now());
  if (resolved.waitms > 0) await sleep(resolved.waitms);
  return resolved;
}

/** Hashes one request body for the cache key with a stable rolling digest; the hash never carries the body values anywhere, only their shape identity. */
export function bodyhashof(body: string): string {
  let hash = 5381;
  for (let index = 0; index < body.length; index += 1) hash = ((hash * 33) ^ body.charCodeAt(index)) & 0x7fffffff;
  return hash.toString(36);
}

/** Builds the cache key of one call: the run namespace, the method, the url and the body hash compose into one key so a repeated read of the same run serves from its own entry only. */
export function cachekeyof(input: { runid: string; url: string; method: string; body: string }): string {
  return `${input.runid}:${input.method}:${input.url}:${bodyhashof(input.body)}`;
}

/** Resolves the expiry timestamp of one stored response from its headers and the user policy: the cache-control max-age and the expires date cap the entry while the user configured retention bounds the entries per run, and an absent fact keeps the entry until the run ends. */
export function cacheexpiryof(headers: Record<string, string>, now: number, retention?: number): number | undefined {
  let candidates: number[] = [];
  for (const key of Object.keys(headers)) {
    const lowered = key.toLowerCase();
    const value = headers[key];
    if (lowered === "cache-control") {
      const match = /max-age\s*=\s*(\d+)/i.exec(value ?? "");
      if (match !== null) candidates.push(now + Number.parseInt(match[1] ?? "0", 10) * 1000);
    }
    if (lowered === "expires") {
      const date = Date.parse(value ?? "");
      if (Number.isFinite(date)) candidates.push(date);
    }
  }
  if (retention !== undefined && Number.isFinite(retention) && retention > 0) candidates.push(now + retention);
  const valid = candidates.filter(candidate => Number.isFinite(candidate) && candidate > now);
  return valid.length > 0 ? Math.min(...valid) : undefined;
}

/** True when the method reads only: GET and HEAD carry no mutation, every other verb mutates and its responses never cache. */
export function readmethod(method: string): boolean {
  const upper = method.toUpperCase();
  return upper === "GET" || upper === "HEAD";
}

/** Stores one response in the per run cache: the entry keys by the run namespace, the url, the method and the body hash, only a read only method stores, a response that carries credentials refuses through the cache gate of the caller, and a response that follows a mutation on its origin never stores because the mutation invalidated the read it would answer. */
export function cacheresponse(input: { entries: cacheentry[]; url: string; method: string; body: string; headers: Record<string, string>; status: number; runid: string; now: number; retention?: number; credentials?: boolean; mutatedat?: number }): { entries: cacheentry[]; entry?: cacheentry; refusal?: string } {
  if (!readmethod(input.method)) return { entries: input.entries, refusal: `The ${input.method} response of ${input.url} follows a mutation verb and never caches.` };
  if (input.credentials === true) return { entries: input.entries, refusal: `The response of ${input.url} carries credentials and the cache refuses it.` };
  if (input.mutatedat !== undefined && input.mutatedat > 0) {
    return { entries: input.entries.filter(entry => !(entry.runid === input.runid && sameorigin(entry, input.url))), refusal: `A mutation landed on the origin of ${input.url}; the responses that follow a mutation never cache and the invalidated entries drop.` };
  }
  const key = cachekeyof({ runid: input.runid, url: input.url, method: input.method, body: input.body });
  const expiry = cacheexpiryof(input.headers, input.now, input.retention);
  const entry: cacheentry = { key, runid: input.runid, url: input.url, method: input.method.toUpperCase(), body: input.body, headers: input.headers, status: input.status, ...(expiry !== undefined ? { expiry } : {}), hits: 0, at: input.now };
  const entries = [entry, ...input.entries.filter(candidate => candidate.key !== key)];
  return { entries, entry };
}

/** Serves one repeated read only call from the per run cache: the entry with the matching key serves while its expiry has not passed, a hit bumps its counter, an entry whose origin saw a mutation stops serving, and an expired entry drops with its expiry reported. */
export function cacheserv(input: { entries: cacheentry[]; url: string; method: string; body: string; runid: string; now: number; mutatedat?: number }): { entries: cacheentry[]; entry?: cacheentry; expired?: cacheentry } {
  if (!readmethod(input.method)) return { entries: input.entries };
  const key = cachekeyof({ runid: input.runid, url: input.url, method: input.method, body: input.body });
  const found = input.entries.find(entry => entry.key === key);
  if (found === undefined) return { entries: input.entries };
  if (input.mutatedat !== undefined && found.at < input.mutatedat) {
    return { entries: input.entries.filter(entry => entry.key !== key), expired: found };
  }
  if (found.expiry !== undefined && input.now >= found.expiry) {
    return { entries: input.entries.filter(entry => entry.key !== key), expired: found };
  }
  const served: cacheentry = { ...found, hits: found.hits + 1 };
  return { entries: input.entries.map(entry => entry.key === key ? served : entry), entry: served };
}

/** Runs the cache expiry cleanup pass: every entry whose expiry passed drops while its metadata survives through the caller, and the pass reports exactly what it expired. */
export function cachecleanup(entries: cacheentry[], now: number): { kept: cacheentry[]; expired: cacheentry[] } {
  const kept: cacheentry[] = [];
  const expired: cacheentry[] = [];
  for (const entry of entries) {
    if (entry.expiry !== undefined && now >= entry.expiry) expired.push(entry);
    else kept.push(entry);
  }
  return { kept, expired };
}

/** Builds one observed page api call record from a captured exchange fact: the url, its origin, the endpoint path, the method, the status and the mime compose into one read only observation beside the discovered api map. */
export function apicallrecordof(input: { id: string; runid: string; stepid: string; url: string; method: string; status: number; mime?: string; at: number }): apicallrecord {
  let origin = "";
  let endpoint = "";
  try { const parsed = new URL(input.url); origin = parsed.origin; endpoint = `${parsed.pathname}${parsed.search}`; } catch { origin = ""; endpoint = input.url; }
  return { id: input.id, runid: input.runid, stepid: input.stepid, url: input.url, origin, endpoint, method: input.method, status: input.status, ...(input.mime !== undefined && input.mime !== "" ? { mime: input.mime } : {}), at: input.at };
}

/** True when one cache entry shares the origin of the url; the helper keeps the mutation invalidation readable. */
function sameorigin(entry: cacheentry, url: string): boolean {
  try { return new URL(entry.url).origin === new URL(url).origin; } catch { return false; }
}


/* ── Merged from apimap.ts: the 1.1.88 consolidation interns the correlated apimap logic here, so no variation of the same file lives beside another. ── */

/**
 * Apimap of the 1.1.86 browser coverage family.
 * Every webextension api concern of the cross browser build lives in this one pure module: the catalog of every webextension api the codebase touches, the per browser equivalents (chromium, firefox and safari) of every api, the runtime browser probe that resolves the right call for the running browser, the in memory cache that holds the resolved browser for the run, the structured errors that surface the unsupported calls with their retry hints and the build time unmapped api report that fails the build when a new api lacks a row. The module stays pure: the browser runtime object, the user agent and the install probe reach it through injected seams only, the kind catalog and the policy gates stay identical on every browser, no vendor endpoint and no download url ever appears here — a single source manifest speaks every webextension dialect through the per browser overlay it carries, and an unsupported call surfaces a structured error instead of a silent fallback.
 * Example: `const probe = apimapbrowsercacheprobe({ runtime: globalThis.chrome, probeuseragent: () => navigator.userAgent }); const browser = probe(); const api = apimapresolve("storage.local", browser); const unmapped = apimapunmapped(apimapentries());`
 */

/** The kind of every recorded webextension api: a namespace the codebase reads, a method it calls, an event it listens to, or a property it queries. */
export function apimapkinds(): webextensionapikind[] {
  return ["namespace", "method", "event", "property"];
}

/** The catalog of every webextension api the codebase touches: the api name the reviewed vocabulary uses, the per browser equivalent (chromium, firefox and safari), the kind and the unsupported marker that flags an api a single browser lacks. A new api without a chromium and firefox mapping fails the build before it ships; the catalog is the source of truth the apimap build check reads. */
export function apimapentries(): webextensionapientry[] {
  return [
    { api: "runtime", chromium: "chrome.runtime", firefox: "browser.runtime", safari: "browser.runtime", kind: "namespace" },
    { api: "runtime.geturl", chromium: "chrome.runtime.getURL", firefox: "browser.runtime.getURL", safari: "browser.runtime.getURL", kind: "method" },
    { api: "runtime.connect", chromium: "chrome.runtime.connect", firefox: "browser.runtime.connect", safari: "browser.runtime.connect", kind: "method" },
    { api: "runtime.sendmessage", chromium: "chrome.runtime.sendMessage", firefox: "browser.runtime.sendMessage", safari: "browser.runtime.sendMessage", kind: "method" },
    { api: "runtime.onmessage", chromium: "chrome.runtime.onMessage", firefox: "browser.runtime.onMessage", safari: "browser.runtime.onMessage", kind: "event" },
    { api: "runtime.id", chromium: "chrome.runtime.id", firefox: "browser.runtime.id", safari: "browser.runtime.id", kind: "property" },
    { api: "tabs", chromium: "chrome.tabs", firefox: "browser.tabs", safari: "browser.tabs", kind: "namespace" },
    { api: "tabs.query", chromium: "chrome.tabs.query", firefox: "browser.tabs.query", safari: "browser.tabs.query", kind: "method" },
    { api: "tabs.create", chromium: "chrome.tabs.create", firefox: "browser.tabs.create", safari: "browser.tabs.create", kind: "method" },
    { api: "tabs.update", chromium: "chrome.tabs.update", firefox: "browser.tabs.update", safari: "browser.tabs.update", kind: "method" },
    { api: "tabs.executeScript", chromium: "chrome.tabs.executeScript", firefox: "browser.tabs.executeScript", safari: "", kind: "method" },
    { api: "scripting", chromium: "chrome.scripting", firefox: "browser.scripting", safari: "browser.scripting", kind: "namespace" },
    { api: "scripting.executeScript", chromium: "chrome.scripting.executeScript", firefox: "browser.scripting.executeScript", safari: "browser.scripting.executeScript", kind: "method" },
    { api: "storage", chromium: "chrome.storage", firefox: "browser.storage", safari: "browser.storage", kind: "namespace" },
    { api: "storage.local", chromium: "chrome.storage.local", firefox: "browser.storage.local", safari: "browser.storage.local", kind: "namespace" },
    { api: "storage.session", chromium: "chrome.storage.session", firefox: "browser.storage.session", safari: "browser.storage.session", kind: "namespace" },
    { api: "windows", chromium: "chrome.windows", firefox: "browser.windows", safari: "browser.windows", kind: "namespace" },
    { api: "windows.create", chromium: "chrome.windows.create", firefox: "browser.windows.create", safari: "browser.windows.create", kind: "method" },
    { api: "windows.update", chromium: "chrome.windows.update", firefox: "browser.windows.update", safari: "browser.windows.update", kind: "method" },
    { api: "notifications", chromium: "chrome.notifications", firefox: "browser.notifications", safari: "browser.notifications", kind: "namespace" },
    { api: "notifications.create", chromium: "chrome.notifications.create", firefox: "browser.notifications.create", safari: "browser.notifications.create", kind: "method" },
    { api: "downloads", chromium: "chrome.downloads", firefox: "browser.downloads", safari: "browser.downloads", kind: "namespace" },
    { api: "downloads.download", chromium: "chrome.downloads.download", firefox: "browser.downloads.download", safari: "browser.downloads.download", kind: "method" },
    { api: "contextMenus", chromium: "chrome.contextMenus", firefox: "browser.contextMenus", safari: "browser.contextMenus", kind: "namespace" },
    { api: "contextMenus.create", chromium: "chrome.contextMenus.create", firefox: "browser.contextMenus.create", safari: "browser.contextMenus.create", kind: "method" },
    { api: "sidePanel", chromium: "chrome.sidePanel", firefox: "browserpolyfill.sidepanel", safari: "browserpolyfill.sidepanel", kind: "namespace" },
    { api: "sidePanel.open", chromium: "chrome.sidePanel.open", firefox: "browserpolyfill.sidepanel.open", safari: "browserpolyfill.sidepanel.open", kind: "method" },
    { api: "sidePanel.setoptions", chromium: "chrome.sidePanel.setOptions", firefox: "browserpolyfill.sidepanel.setoptions", safari: "browserpolyfill.sidepanel.setoptions", kind: "method" },
    { api: "offscreen", chromium: "chrome.offscreen", firefox: "browserpolyfill.offscreen", safari: "browserpolyfill.offscreen", kind: "namespace" },
    { api: "offscreen.createDocument", chromium: "chrome.offscreen.createDocument", firefox: "browserpolyfill.offscreen.inline", safari: "browserpolyfill.offscreen.inline", kind: "method" },
    { api: "action", chromium: "chrome.action", firefox: "browser.action", safari: "browser.action", kind: "namespace" },
    { api: "action.setpopup", chromium: "chrome.action.setPopup", firefox: "browser.action.setPopup", safari: "browser.action.setPopup", kind: "method" },
    { api: "clipboardRead", chromium: "navigator.clipboard.readText", firefox: "navigator.clipboard.readText", safari: "navigator.clipboard.readText", kind: "method" },
    { api: "clipboardWrite", chromium: "navigator.clipboard.writeText", firefox: "navigator.clipboard.writeText", safari: "navigator.clipboard.writeText", kind: "method" },
    { api: "i18n", chromium: "chrome.i18n", firefox: "browser.i18n", safari: "browser.i18n", kind: "namespace" },
    { api: "i18n.getmessage", chromium: "chrome.i18n.getMessage", firefox: "browser.i18n.getMessage", safari: "browser.i18n.getMessage", kind: "method" },
    { api: "permissions", chromium: "chrome.permissions", firefox: "browser.permissions", safari: "browser.permissions", kind: "namespace" },
    { api: "permissions.request", chromium: "chrome.permissions.request", firefox: "browser.permissions.request", safari: "browser.permissions.request", kind: "method" },
    { api: "permissions.contains", chromium: "chrome.permissions.contains", firefox: "browser.permissions.contains", safari: "browser.permissions.contains", kind: "method" },
    { api: "management", chromium: "chrome.management", firefox: "browser.management", safari: "browser.management", kind: "namespace" },
    { api: "commands", chromium: "chrome.commands", firefox: "browser.commands", safari: "browser.commands", kind: "namespace" },
    { api: "commands.onCommand", chromium: "chrome.commands.onCommand", firefox: "browser.commands.onCommand", safari: "browser.commands.onCommand", kind: "event" },
    { api: "nativeMessaging", chromium: "chrome.runtime.connectNative", firefox: "browser.runtime.connectNative", safari: "", kind: "method" },
  ];
}

/** The default feature flag set: every feature flag that ships crosses every browser through the intersection of the per browser sets. */
export function apifeatureflagintersection(): string[] {
  const entries = apimapentries();
  const browsers: webextensionbrowser[] = ["chromium", "firefox", "safari"];
  const flags: string[] = [];
  for (const entry of entries) {
    let all = true;
    for (const browser of browsers) {
      const value = browser === "chromium" ? entry.chromium : browser === "firefox" ? entry.firefox : entry.safari;
      if (value === "") { all = false; break; }
    }
    if (all) flags.push(entry.api);
  }
  return flags.sort();
}

/** Looks up one apimap entry by its reviewed api name; a missing entry returns undefined so the resolver and the unmapped reporter read the same shape. */
export function apimapentryof(api: string): webextensionapientry | undefined {
  return apimapentries().find(entry => entry.api === api);
}

/** Resolves one reviewed api to the per browser call of the running browser; the runtime probe runs first when the caller passes the runtime seam, the empty probe answers the browser the caller chose, and an unmapped api surfaces an unsupported structured error with the retry hint instead of a silent fallback. */
export function apimapresolve(input: { api: string; browser?: webextensionbrowser; runtime?: unknown; probeuseragent?: () => string }): apimapresolution {
  const api = (input.api ?? "").trim();
  if (api === "") return { ok: false, browser: input.browser ?? "chromium", reason: "The apimap resolution names its api; an empty api resolves nothing.", retry: "none" };
  const entry = apimapentryof(api);
  if (entry === undefined) return { ok: false, browser: input.browser ?? "chromium", reason: `The apimap carries no row for the ${api} api; the catalog must record every api the codebase touches.`, retry: "none" };
  const browser = input.browser ?? apimapbrowserof({ ...(input.runtime !== undefined ? { runtime: input.runtime } : {}), ...(input.probeuseragent !== undefined ? { probeuseragent: input.probeuseragent } : {}) });
  const value = browser === "chromium" ? entry.chromium : browser === "firefox" ? entry.firefox : entry.safari;
  if (value === "") return { ok: false, browser, reason: `The ${api} api has no ${browser} equivalent in the apimap; the feature flag stays off and the call surfaces a structured error.`, retry: "none" };
  return { ok: true, browser, api, equivalent: value };
}

/** Reports the unmapped apis of the catalog at build time: an api without a chromium and firefox mapping fails the build before it ships, and the report keeps the per browser coverage of every api beside the missing rows. */
export function apimapunmapped(entries: webextensionapientry[] = apimapentries()): apimapreport {
  const rows: apimapreport["rows"] = entries.map(entry => ({ api: entry.api, chromium: entry.chromium !== "", firefox: entry.firefox !== "", safari: entry.safari !== "" }));
  const missingchromium = rows.filter(row => !row.chromium).map(row => row.api);
  const missingfirefox = rows.filter(row => !row.firefox).map(row => row.api);
  const missingsafari = rows.filter(row => !row.safari).map(row => row.api);
  const failed = missingchromium.length > 0 || missingfirefox.length > 0;
  const reason = failed ? `The apimap carries apis without a chromium or firefox mapping: ${[...missingchromium, ...missingfirefox].filter((name, index, source) => source.indexOf(name) === index).slice(0, 5).join(", ")}; every webextension api the codebase touches needs a chromium and firefox row.` : "";
  return { rows, missingchromium, missingfirefox, missingsafari, failed, reason };
}

/** The runtime browser probe resolves the running browser from the runtime seam and the user agent: the chromium runtime carries the chrome namespace, the firefox runtime carries the browser namespace, the safari runtime carries the browser namespace beside a vendor keyword in the user agent the probe reads, and an unknown runtime degrades to chromium so the source manifest stays the default the cross browser build loads. */
export function apimapbrowserof(input: apibrowserprobeinput = {}): webextensionbrowser {
  if (input.runtime !== undefined && input.runtime !== null) {
    const record = input.runtime as Record<string, unknown>;
    if (typeof record.browser === "object" && record.browser !== null) return "firefox";
    if (typeof record.chrome === "object" && record.chrome !== null) return "chromium";
    if (typeof record.sidePanel === "object" && record.sidePanel !== null) return "chromium";
  }
  const useragent = input.probeuseragent !== undefined ? input.probeuseragent() : "";
  if (useragent !== "") {
    if (/firefox/i.test(useragent)) return "firefox";
    if (/safari/i.test(useragent) && !/chrome/i.test(useragent)) return "safari";
  }
  return "chromium";
}

/** Builds the in memory cached browser probe: the probe resolves the browser once per run, the cache holds it for the rest of the run, and a forced refresh rewrites the cache when the build runs the same process over a new context. */
export function apimapbrowsercacheprobe(input: apibrowserprobeinput = {}): apimapbrowserprobe {
  let cached: webextensionbrowser | undefined;
  const probe = (): webextensionbrowser => {
    if (cached === undefined) cached = apimapbrowserof(input);
    return cached;
  };
  const refresh = (): webextensionbrowser => {
    cached = apimapbrowserof(input);
    return cached;
  };
  return { probe, refresh };
}

/** The structured error of an unsupported apimap call: the family, the message, the retry hint and the time, so a caller maps the failure to its next action instead of a bare throw. */
export function apimapstructerrorof(input: { api: string; browser: webextensionbrowser; reason?: string; now: number }): apimapstructerror {
  const message = input.reason !== undefined && input.reason !== "" ? input.reason : `The ${input.api} api has no ${input.browser} equivalent; the feature flag stays off and the call surfaces a structured error.`;
  return { family: "apimap", message, retry: "none", browser: input.browser, api: input.api, at: input.now };
}

