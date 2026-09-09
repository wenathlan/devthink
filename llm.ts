/**
 * The llm module of the 1.1.90 consolidation: every correlated variation of the model routing and prompt library logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the llm family: llm holds the model call core of the 1.1.57 family (the shaped request building, the provider call through the transport seam, the local model path, the stream delta parsing, the command guard with intent classification and plan drafting, the replan on fail, the step reflection, the guardrail stripping, the parse output guard, the tool briefs and the usage accounting with its budget check); modelroute holds the routing table that resolves one request to its provider with fallback routes, provider marks and revision bumps; and promptlibrary holds the template library with its variables, rendering, saving, search and removal.
 * No provider, key or template is ever hardcoded: every route and prompt stays the user's choice, and no model call ever bypasses the consent gates.
 */

import type {
  apikeyref,
  baseurlconfig,
  commandentity,
  commandparse,
  costbudget,
  costestimate,
  draftstep,
  gatewaychatstate,
  gatewaychattoken,
  gatewayerror,
  gatewaykind,
  gatewaymodelinfo,
  intentkind,
  localmodelconfig,
  modelcacherecord,
  modelmessage,
  modeloutput,
  modelroute,
  parseguard,
  plandraft,
  policyevaluation,
  prompttemplate,
  providerconfig,
  protocolstyle,
  reflectnote,
  replanrecord,
  secretvaultentry,
  tokenstream,
  toolbrief,
  tooldef,
  usagerecord,
} from "./types.js";
import {
  planlint,
  egressconsentgate,
  gatewaybaseurlgate,
  gatewaycachewindowvalid,
  gatewayconsentgate,
  gatewaykeyconsentgate,
  gatewayprefixgate,
  gatewayretrycapvalid,
} from "./policy.js";
import { sendfetch, type fetchtransport, type transportresponse } from "./http.js";
import { randomid } from "./memory.js";
import { secretleakscan, vaultdelete, vaultstore, vaultvaluefor } from "./security.js";

/**
 * Llm integration logics of the 1.1.57 family.
 * Every provider call concern lives in this file: the request shaping for the four protocol styles the user picks (the openai compatible chat completions shape, the openai responses shape, the anthropic messages shape and the google gemini shape — wire shapes for interoperability, never provider names), the response parsing per style, the completion call through the established fetch machinery with its reviewed retries and backoff, the local model calls that never leave the machine, the streaming token parse per style, the natural language command parsing with intent classification, the goal to plan drafting with the grammar lint, the replan of failed runs, the per step reflection with its running lessons, the openapi style tool briefs for model consumption, the parse guardrails that strip code fences and chatter, validate model text against the expected schema, retry malformed output and refuse after exhaustion, and the usage records with cost budget halts.
 * Nothing is hardcoded: no endpoint, no model name, no key, no temperature and no token ceiling ever leaves the user configuration, page content never joins a call the user has not granted and every model drafted plan still passes the same human review.
 */

/** The refusal markers reviewed by default; user configured markers always win and an empty configured list disables the marker scan. */
export const defaultrefusalmarkers: string[] = ["i cannot", "i can't", "i'm unable", "refusal:", "cannot comply"];

/** One shaped model request: the url, the method, the headers and the body text per protocol style. */
export interface shapedrequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

/** The usage a completion answer reports: prompt, completion and total token counts. */
export interface modelusage {
  prompttokens: number;
  completiontokens: number;
  totaltokens: number;
}

/** Builds the completion request of one protocol style: the endpoint url, the headers with the key placed where the style expects it and the body envelope the style speaks. The user configured headers merge over the shape headers so any gateway works. */
export function buildrequest(input: {
  provider: { endpoint: string; style: protocolstyle; headers?: Record<string, string> };
  model: string;
  messages: modelmessage[];
  apikey?: string;
  temperature?: number;
  maxtokens?: number;
  stream?: boolean;
}): shapedrequest {
  const headers: Record<string, string> = { "content-type": "application/json" };
  let url = input.provider.endpoint;
  const style = input.provider.style;
  if (style === "chatcompletions") {
    if (input.apikey !== undefined && input.apikey.trim() !== "") headers.authorization = `Bearer ${input.apikey}`;
    const body: Record<string, unknown> = {
      model: input.model,
      messages: input.messages.map((message) => ({ role: message.role, content: message.content })),
      ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
      ...(input.maxtokens !== undefined ? { max_tokens: input.maxtokens } : {}),
      ...(input.stream === true ? { stream: true } : {}),
    };
    return {
      url,
      method: "POST",
      headers: { ...headers, ...(input.provider.headers ?? {}) },
      body: JSON.stringify(body),
    };
  }
  if (style === "responses") {
    if (input.apikey !== undefined && input.apikey.trim() !== "") headers.authorization = `Bearer ${input.apikey}`;
    const system = input.messages
      .filter((message) => message.role === "system")
      .map((message) => message.content)
      .join("\n");
    const turns = input.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: message.content }));
    const body: Record<string, unknown> = {
      model: input.model,
      input: turns,
      ...(system.trim() !== "" ? { instructions: system } : {}),
      ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
      ...(input.maxtokens !== undefined ? { max_output_tokens: input.maxtokens } : {}),
      ...(input.stream === true ? { stream: true } : {}),
    };
    return {
      url,
      method: "POST",
      headers: { ...headers, ...(input.provider.headers ?? {}) },
      body: JSON.stringify(body),
    };
  }
  if (style === "messages") {
    if (input.apikey !== undefined && input.apikey.trim() !== "") headers["x-api-key"] = input.apikey;
    const system = input.messages
      .filter((message) => message.role === "system")
      .map((message) => message.content)
      .join("\n");
    const turns = input.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({ role: message.role, content: message.content }));
    const body: Record<string, unknown> = {
      model: input.model,
      messages: turns,
      ...(system.trim() !== "" ? { system } : {}),
      ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
      ...(input.maxtokens !== undefined ? { max_tokens: input.maxtokens } : {}),
      ...(input.stream === true ? { stream: true } : {}),
    };
    return {
      url,
      method: "POST",
      headers: { ...headers, ...(input.provider.headers ?? {}) },
      body: JSON.stringify(body),
    };
  }
  if (input.apikey !== undefined && input.apikey.trim() !== "")
    url = `${url}${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(input.apikey)}`;
  const system = input.messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n");
  const turns = input.messages
    .filter((message) => message.role !== "system")
    .map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] }));
  const body: Record<string, unknown> = {
    contents: turns,
    ...(system.trim() !== "" ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    ...(input.temperature !== undefined
      ? {
          generationConfig: {
            temperature: input.temperature,
            ...(input.maxtokens !== undefined ? { maxOutputTokens: input.maxtokens } : {}),
          },
        }
      : input.maxtokens !== undefined
        ? { generationConfig: { maxOutputTokens: input.maxtokens } }
        : {}),
  };
  return {
    url,
    method: "POST",
    headers: { ...headers, ...(input.provider.headers ?? {}) },
    body: JSON.stringify(body),
  };
}

/** Reads one number field of a parsed json object; a missing or non numeric field reports undefined. */
function numberof(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Parses one completion answer of the protocol style: the answer text and the usage counts; a malformed answer reports why nothing parsed. */
export function parsecompletion(
  style: protocolstyle,
  body: string,
): { text?: string; usage?: modelusage; reason?: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return { reason: "The provider answer is not json." };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    return { reason: "The provider answer is not a json object." };
  const record = parsed as Record<string, unknown>;
  if (style === "chatcompletions") {
    const choice = Array.isArray(record.choices)
      ? (record.choices[0] as Record<string, unknown> | undefined)
      : undefined;
    const message =
      choice !== undefined && choice.message !== undefined && typeof choice.message === "object"
        ? (choice.message as Record<string, unknown>)
        : undefined;
    if (message === undefined || typeof message.content !== "string")
      return { reason: "The chat completions answer carries no message content." };
    const usage =
      record.usage !== undefined && typeof record.usage === "object"
        ? (record.usage as Record<string, unknown>)
        : undefined;
    const prompttokens = usage !== undefined ? numberof(usage["prompt_tokens"]) : undefined;
    const completiontokens = usage !== undefined ? numberof(usage["completion_tokens"]) : undefined;
    const totaltokens = usage !== undefined ? numberof(usage["total_tokens"]) : undefined;
    return {
      text: message.content,
      ...(prompttokens !== undefined || completiontokens !== undefined || totaltokens !== undefined
        ? {
            usage: {
              prompttokens: prompttokens ?? 0,
              completiontokens: completiontokens ?? 0,
              totaltokens: totaltokens ?? (prompttokens ?? 0) + (completiontokens ?? 0),
            },
          }
        : {}),
    };
  }
  if (style === "responses") {
    const direct = typeof record["output_text"] === "string" ? record["output_text"] : undefined;
    let text = direct;
    if (text === undefined && Array.isArray(record.output)) {
      const parts: string[] = [];
      for (const item of record.output) {
        if (item && typeof item === "object" && Array.isArray((item as Record<string, unknown>).content)) {
          for (const part of (item as Record<string, unknown>).content as unknown[]) {
            if (
              part &&
              typeof part === "object" &&
              (part as Record<string, unknown>).type === "output_text" &&
              typeof (part as Record<string, unknown>).text === "string"
            )
              parts.push((part as Record<string, unknown>).text as string);
          }
        }
      }
      if (parts.length > 0) text = parts.join("");
    }
    if (text === undefined) return { reason: "The responses answer carries no output text." };
    const usage =
      record.usage !== undefined && typeof record.usage === "object"
        ? (record.usage as Record<string, unknown>)
        : undefined;
    const prompttokens = usage !== undefined ? numberof(usage["input_tokens"]) : undefined;
    const completiontokens = usage !== undefined ? numberof(usage["output_tokens"]) : undefined;
    const totaltokens = usage !== undefined ? numberof(usage["total_tokens"]) : undefined;
    return {
      text,
      ...(prompttokens !== undefined || completiontokens !== undefined || totaltokens !== undefined
        ? {
            usage: {
              prompttokens: prompttokens ?? 0,
              completiontokens: completiontokens ?? 0,
              totaltokens: totaltokens ?? (prompttokens ?? 0) + (completiontokens ?? 0),
            },
          }
        : {}),
    };
  }
  if (style === "messages") {
    const parts: string[] = [];
    if (Array.isArray(record.content)) {
      for (const part of record.content) {
        if (
          part &&
          typeof part === "object" &&
          (part as Record<string, unknown>).type === "text" &&
          typeof (part as Record<string, unknown>).text === "string"
        )
          parts.push((part as Record<string, unknown>).text as string);
      }
    }
    if (parts.length === 0) return { reason: "The messages answer carries no text block." };
    const usage =
      record.usage !== undefined && typeof record.usage === "object"
        ? (record.usage as Record<string, unknown>)
        : undefined;
    const prompttokens = usage !== undefined ? numberof(usage["input_tokens"]) : undefined;
    const completiontokens = usage !== undefined ? numberof(usage["output_tokens"]) : undefined;
    return {
      text: parts.join(""),
      ...(prompttokens !== undefined || completiontokens !== undefined
        ? {
            usage: {
              prompttokens: prompttokens ?? 0,
              completiontokens: completiontokens ?? 0,
              totaltokens: (prompttokens ?? 0) + (completiontokens ?? 0),
            },
          }
        : {}),
    };
  }
  const candidate = Array.isArray(record.candidates)
    ? (record.candidates[0] as Record<string, unknown> | undefined)
    : undefined;
  const content =
    candidate !== undefined && candidate.content !== undefined && typeof candidate.content === "object"
      ? (candidate.content as Record<string, unknown>).parts
      : undefined;
  const parts: string[] = [];
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string")
        parts.push((part as Record<string, unknown>).text as string);
    }
  }
  if (parts.length === 0) return { reason: "The gemini answer carries no candidate text." };
  const usage =
    record.usageMetadata !== undefined && typeof record.usageMetadata === "object"
      ? (record.usageMetadata as Record<string, unknown>)
      : undefined;
  const prompttokens = usage !== undefined ? numberof(usage.promptTokenCount) : undefined;
  const completiontokens = usage !== undefined ? numberof(usage.candidatesTokenCount) : undefined;
  const totaltokens = usage !== undefined ? numberof(usage.totalTokenCount) : undefined;
  return {
    text: parts.join(""),
    ...(prompttokens !== undefined || completiontokens !== undefined || totaltokens !== undefined
      ? {
          usage: {
            prompttokens: prompttokens ?? 0,
            completiontokens: completiontokens ?? 0,
            totaltokens: totaltokens ?? (prompttokens ?? 0) + (completiontokens ?? 0),
          },
        }
      : {}),
  };
}

/** Returns true when the url points at a local machine endpoint: a loopback host keeps the model call inside the machine. */
export function islocalorigin(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]" || host.endsWith(".localhost")
    );
  } catch {
    return false;
  }
}

/** Sends one completion request to a user configured provider: the request shapes per protocol style, the page content stays stripped unless the user granted it, a configured auth reference without a resolved key refuses the call and the answer parses per style with its usage counts; retries and backoff ride the reviewed fetch options. */
export async function callmodel(input: {
  provider: providerconfig;
  model: string;
  messages: modelmessage[];
  apikey?: string;
  temperature?: number;
  maxtokens?: number;
  pagecontent?: string;
  pagegrant?: boolean;
  stream?: boolean;
  options?: { timeout?: number; retries?: number; backoff?: number; follow?: number };
  transport: fetchtransport;
  sleep?: (milliseconds: number) => Promise<void>;
  now?: () => number;
}): Promise<{ text: string; usage?: modelusage; request: shapedrequest }> {
  if (input.provider.endpoint.trim() === "")
    throw new Error("The provider needs the user configured endpoint url before any call leaves.");
  if (input.provider.authref !== undefined && (input.apikey === undefined || input.apikey.trim() === ""))
    throw new Error(
      `The provider ${input.provider.name} references the stored key ${input.provider.authref.name} and the call needs the resolved key material.`,
    );
  const consent = egressconsentgate({
    ...(input.pagecontent !== undefined ? { pagecontent: input.pagecontent } : {}),
    granted: input.pagegrant === true,
  });
  if (!consent.allowed) throw new Error(consent.reason ?? "The page content stayed ungranted and the call refused.");
  const shaped = buildrequest({
    provider: input.provider,
    model: input.model,
    messages: input.messages,
    ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
    ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
    ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}),
    ...(input.stream === true ? { stream: true } : {}),
  });
  const transport = await sendfetch({
    request: { url: shaped.url, method: shaped.method, headers: shaped.headers, body: shaped.body },
    ...(input.options !== undefined ? { options: input.options } : {}),
    transport: input.transport,
    ...(input.sleep !== undefined ? { sleep: input.sleep } : {}),
    ...(input.now !== undefined ? { now: input.now } : {}),
  });
  const parsed = parsecompletion(input.provider.style, transport.body);
  if (parsed.text === undefined) throw new Error(parsed.reason ?? "The provider answer did not parse.");
  return { text: parsed.text, ...(parsed.usage !== undefined ? { usage: parsed.usage } : {}), request: shaped };
}

/** Sends one completion request to the local model endpoint: the endpoint must stay local so the call never leaves the machine, the key stays optional because local runtimes need none and the answer parses per the configured style. */
export async function calllocal(input: {
  local: localmodelconfig;
  messages: modelmessage[];
  apikey?: string;
  temperature?: number;
  maxtokens?: number;
  options?: { timeout?: number; retries?: number; backoff?: number; follow?: number };
  transport: fetchtransport;
  sleep?: (milliseconds: number) => Promise<void>;
  now?: () => number;
}): Promise<{ text: string; usage?: modelusage; request: shapedrequest }> {
  if (input.local.endpoint.trim() === "")
    throw new Error("The local model needs the user configured endpoint url before any call runs.");
  if (!islocalorigin(input.local.endpoint))
    throw new Error("The local model endpoint must stay a local machine address; the call never leaves the machine.");
  const provider: providerconfig = {
    id: "local",
    name: "The local model endpoint",
    endpoint: input.local.endpoint,
    style: input.local.style,
    models: [input.local.model],
    status: "available",
    createdat: 0,
  };
  return callmodel({
    provider,
    model: input.local.model,
    messages: input.messages,
    ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
    ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
    ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}),
    ...(input.options !== undefined ? { options: input.options } : {}),
    transport: input.transport,
    ...(input.sleep !== undefined ? { sleep: input.sleep } : {}),
    ...(input.now !== undefined ? { now: input.now } : {}),
  });
}

/** Parses one streaming event payload of the protocol style into its token text: the chat completions delta content, the responses output text delta, the messages content block text delta and the gemini candidate part text. */
export function streamdelta(style: protocolstyle, event: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(event);
  } catch {
    return "";
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return "";
  const record = parsed as Record<string, unknown>;
  if (style === "chatcompletions") {
    const choice = Array.isArray(record.choices)
      ? (record.choices[0] as Record<string, unknown> | undefined)
      : undefined;
    const delta =
      choice !== undefined && choice.delta !== undefined && typeof choice.delta === "object"
        ? (choice.delta as Record<string, unknown>).content
        : undefined;
    return typeof delta === "string" ? delta : "";
  }
  if (style === "responses") {
    if (record.type === "response.output_text.delta" && typeof record.delta === "string") return record.delta;
    return "";
  }
  if (style === "messages") {
    if (
      record.type === "content_block_delta" &&
      record.delta !== undefined &&
      typeof record.delta === "object" &&
      typeof (record.delta as Record<string, unknown>).text === "string"
    )
      return (record.delta as Record<string, unknown>).text as string;
    return "";
  }
  const candidate = Array.isArray(record.candidates)
    ? (record.candidates[0] as Record<string, unknown> | undefined)
    : undefined;
  const content =
    candidate !== undefined && candidate.content !== undefined && typeof candidate.content === "object"
      ? (candidate.content as Record<string, unknown>).parts
      : undefined;
  if (!Array.isArray(content)) return "";
  const parts: string[] = [];
  for (const part of content) {
    if (part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string")
      parts.push((part as Record<string, unknown>).text as string);
  }
  return parts.join("");
}

/** Parses one server sent event body of the protocol style into the ordered token stream it carries; the done marker rides the last token of a finished stream. */
export function parsestream(style: protocolstyle, body: string): tokenstream[] {
  const tokens: tokenstream[] = [];
  let seq = 0;
  let done = false;
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (!trimmed.startsWith("data:")) continue;
    const payload = trimmed.slice(5).trim();
    if (payload === "[DONE]") {
      done = true;
      continue;
    }
    const text = streamdelta(style, payload);
    if (text === "") continue;
    seq += 1;
    tokens.push({ seq, text, done: false });
  }
  if (tokens.length > 0 && done)
    tokens[tokens.length - 1] = { ...(tokens[tokens.length - 1] as tokenstream), done: true };
  return tokens;
}

/** Streams one completion request when the provider supports it: the request carries the stream flag of its style, the transport seam returns the server sent event body and the ordered tokens assemble into the answer text with its token count. */
export async function streammodel(input: {
  provider: providerconfig;
  model: string;
  messages: modelmessage[];
  apikey?: string;
  temperature?: number;
  maxtokens?: number;
  pagecontent?: string;
  pagegrant?: boolean;
  options?: { timeout?: number; retries?: number; backoff?: number; follow?: number };
  transport: fetchtransport;
  sleep?: (milliseconds: number) => Promise<void>;
  now?: () => number;
}): Promise<{ text: string; tokens: number; request: shapedrequest }> {
  if (input.provider.endpoint.trim() === "")
    throw new Error("The provider needs the user configured endpoint url before any call leaves.");
  if (input.provider.authref !== undefined && (input.apikey === undefined || input.apikey.trim() === ""))
    throw new Error(
      `The provider ${input.provider.name} references the stored key ${input.provider.authref.name} and the call needs the resolved key material.`,
    );
  const consent = egressconsentgate({
    ...(input.pagecontent !== undefined ? { pagecontent: input.pagecontent } : {}),
    granted: input.pagegrant === true,
  });
  if (!consent.allowed) throw new Error(consent.reason ?? "The page content stayed ungranted and the call refused.");
  const shaped = buildrequest({
    provider: input.provider,
    model: input.model,
    messages: input.messages,
    ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
    ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
    ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}),
    stream: true,
  });
  const transport = await sendfetch({
    request: { url: shaped.url, method: shaped.method, headers: shaped.headers, body: shaped.body },
    ...(input.options !== undefined ? { options: input.options } : {}),
    transport: input.transport,
    ...(input.sleep !== undefined ? { sleep: input.sleep } : {}),
    ...(input.now !== undefined ? { now: input.now } : {}),
  });
  const tokens = parsestream(input.provider.style, transport.body);
  if (tokens.length === 0) return { text: transport.body, tokens: 0, request: shaped };
  return { text: tokens.map((token) => token.text).join(""), tokens: tokens.length, request: shaped };
}

/** The command parse guard schema: the intent kind, the entities array and the confidence number the parsed command answer carries. */
export const commandguard: parseguard = {
  schema: {
    intent: { type: "string", required: true },
    entities: { type: "array", required: true },
    confidence: { type: "number", required: true },
  },
  retries: 1,
};

/** Classifies one natural language request into its intent kind with a confidence score: the deterministic keyword scan works without any provider, the confidence rides the matched keyword density and an unmatched request classifies as ask with a low score. */
export function classifyintent(text: string): { intent: intentkind; confidence: number } {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (words.length === 0) return { intent: "ask", confidence: 0 };
  const scores: Record<intentkind, number> = { navigate: 0, extract: 0, fill: 0, monitor: 0, automate: 0, ask: 0 };
  const keywords: Array<[intentkind, string[]]> = [
    ["navigate", ["go", "open", "visit", "navigate", "browse", "url", "site", "page", "to"]],
    ["extract", ["extract", "scrape", "collect", "read", "gather", "copy", "table", "data", "text"]],
    ["fill", ["fill", "type", "enter", "form", "submit", "login", "sign", "checkout", "field"]],
    ["monitor", ["watch", "monitor", "observe", "track", "alert", "notify", "poll", "changes"]],
    ["automate", ["automate", "workflow", "repeat", "every", "schedule", "batch", "pipeline", "steps", "then"]],
    ["ask", ["what", "who", "when", "where", "why", "how", "explain", "summarize", "ask", "question", "tell"]],
  ];
  for (const [intent, list] of keywords) for (const word of list) if (words.includes(word)) scores[intent] += 1;
  let best: intentkind = "ask";
  let bestscore = scores.ask;
  for (const [intent] of keywords)
    if (scores[intent] > bestscore) {
      best = intent;
      bestscore = scores[intent];
    }
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const confidence =
    bestscore === 0
      ? 0.1
      : Math.min(1, Math.round(((bestscore / total) * 0.6 + Math.min(bestscore / 3, 1) * 0.4) * 100) / 100);
  return { intent: best, confidence };
}

/** Parses one natural language command into its structured result: the model call rides the routed provider, the answer passes the command guard with its retries and the parsed intent, entities and confidence land in the commandparse record; a model refusal reports why nothing parsed. */
export async function parsecommand(input: {
  provider: providerconfig;
  model: string;
  text: string;
  apikey?: string;
  transport: fetchtransport;
  sleep?: (milliseconds: number) => Promise<void>;
  now?: () => number;
  guard?: parseguard;
}): Promise<{ parse?: commandparse; output?: modeloutput; reason?: string }> {
  if (input.text.trim() === "") return { reason: "The command parse needs the natural language text." };
  const guard = input.guard ?? commandguard;
  const answer = await callmodel({
    provider: input.provider,
    model: input.model,
    messages: [
      {
        role: "system",
        content:
          "Parse the user command into json with the fields intent (one of navigate, extract, fill, monitor, automate, ask), entities (an array of { name, value } objects) and confidence (a number between 0 and 1). Answer with the json object only.",
      },
      { role: "user", content: input.text },
    ],
    ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
    transport: input.transport,
    ...(input.sleep !== undefined ? { sleep: input.sleep } : {}),
    ...(input.now !== undefined ? { now: input.now } : {}),
  });
  const output = guardoutput({ guard, attempts: [answer.text] });
  if (output.verdict !== "valid" || output.parsed === undefined)
    return { output, reason: output.reason ?? "The command answer failed its guard." };
  const parsed = output.parsed;
  if (typeof parsed.intent !== "string") return { output, reason: "The command answer carries no intent." };
  const intents: intentkind[] = ["navigate", "extract", "fill", "monitor", "automate", "ask"];
  if (!intents.includes(parsed.intent as intentkind))
    return { output, reason: `The intent ${parsed.intent} is not one of the intent kinds.` };
  const entities: commandentity[] = Array.isArray(parsed.entities)
    ? parsed.entities.filter(
        (entity): entity is commandentity =>
          entity !== null &&
          typeof entity === "object" &&
          !Array.isArray(entity) &&
          typeof (entity as commandentity).name === "string" &&
          typeof (entity as commandentity).value === "string",
      )
    : [];
  const confidence =
    typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence)
      ? Math.min(1, Math.max(0, parsed.confidence))
      : 0;
  return {
    parse: {
      text: input.text,
      intent: parsed.intent as intentkind,
      entities,
      confidence,
      model: input.model,
      providerid: input.provider.id,
      parsedat: (input.now ?? Date.now)(),
    },
    output,
  };
}

/** Builds one model drafted plan from a goal: the model call drafts the steps and open questions, the grammar lint checks every drafted step against the action grammar before review and the draft records its provider and model provenance; the draft never executes until the human review approves it. */
export async function draftplan(input: {
  provider: providerconfig;
  model: string;
  goal: string;
  origin?: string;
  lessons?: string[];
  apikey?: string;
  transport: fetchtransport;
  sleep?: (milliseconds: number) => Promise<void>;
  now?: () => number;
}): Promise<{ draft?: plandraft; output?: modeloutput; reason?: string }> {
  if (input.goal.trim() === "") return { reason: "The plan draft needs the goal." };
  const lessons = input.lessons ?? [];
  const answer = await callmodel({
    provider: input.provider,
    model: input.model,
    messages: [
      {
        role: "system",
        content: `Draft a browser agent plan as json with the fields goal (string), steps (an array of { kind, target, value, summary } objects using browser action kinds) and openquestions (an array of strings for what stays unclear).${lessons.length > 0 ? ` The running lessons of the earlier steps: ${lessons.join(" | ")}.` : ""} Answer with the json object only.`,
      },
      { role: "user", content: input.goal },
    ],
    ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
    transport: input.transport,
    ...(input.sleep !== undefined ? { sleep: input.sleep } : {}),
    ...(input.now !== undefined ? { now: input.now } : {}),
  });
  const guard: parseguard = {
    schema: {
      goal: { type: "string", required: true },
      steps: { type: "array", required: true },
      openquestions: { type: "array" },
    },
    retries: 1,
  };
  const output = guardoutput({ guard, attempts: [answer.text] });
  if (output.verdict !== "valid" || output.parsed === undefined)
    return { output, reason: output.reason ?? "The plan draft answer failed its guard." };
  const parsed = output.parsed;
  const rawsteps = Array.isArray(parsed.steps) ? parsed.steps : [];
  const steps: draftstep[] = rawsteps
    .filter(
      (step): step is Record<string, unknown> => step !== null && typeof step === "object" && !Array.isArray(step),
    )
    .map((step, index) => ({
      id: `step${index + 1}`,
      kind: typeof step.kind === "string" ? step.kind : "",
      ...(typeof step.target === "string" && step.target.trim() !== "" ? { target: step.target } : {}),
      ...(typeof step.value === "string" && step.value.trim() !== "" ? { value: step.value } : {}),
      summary: typeof step.summary === "string" ? step.summary : "",
    }));
  const openquestions = Array.isArray(parsed.openquestions)
    ? parsed.openquestions.filter((question): question is string => typeof question === "string")
    : [];
  const draft: plandraft = {
    id: randomid(),
    goal: typeof parsed.goal === "string" && parsed.goal.trim() !== "" ? parsed.goal : input.goal,
    steps,
    openquestions,
    providerid: input.provider.id,
    model: input.model,
    state: "draft",
    lintfindings: [],
    createdat: (input.now ?? Date.now)(),
  };
  draft.lintfindings = planlint(draft, input.origin ?? "");
  return { draft, output };
}

/** Regenerates the tail of a failed plan: the completed steps stay untouched, the failed steps fall away and the model drafted tail steps carry the fresh review marker so the human review approves every revised step again; the replan record keeps the failure reason and the model provenance. */
export async function replannonfail(input: {
  provider: providerconfig;
  model: string;
  draft: plandraft;
  completedstepids: string[];
  failedstepids: string[];
  reason: string;
  lessons?: string[];
  apikey?: string;
  transport: fetchtransport;
  sleep?: (milliseconds: number) => Promise<void>;
  now?: () => number;
}): Promise<{ replan?: replanrecord; output?: modeloutput; reason?: string }> {
  if (input.reason.trim() === "") return { reason: "The replan needs the failure reason." };
  const completed = input.draft.steps.filter((step) => input.completedstepids.includes(step.id));
  const failed = input.draft.steps.filter((step) => input.failedstepids.includes(step.id));
  const lessons = input.lessons ?? [];
  const answer = await callmodel({
    provider: input.provider,
    model: input.model,
    messages: [
      {
        role: "system",
        content: `The plan ${input.draft.goal} failed at the steps ${failed.map((step) => step.summary).join("; ") || "unknown"} with the reason: ${input.reason}. The completed steps stay: ${completed.map((step) => step.summary).join("; ") || "none"}.${lessons.length > 0 ? ` The running lessons: ${lessons.join(" | ")}.` : ""} Draft the revised tail steps of the plan as json with the field steps (an array of { kind, target, value, summary } objects using browser action kinds). Answer with the json object only.`,
      },
      { role: "user", content: input.draft.goal },
    ],
    ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
    transport: input.transport,
    ...(input.sleep !== undefined ? { sleep: input.sleep } : {}),
    ...(input.now !== undefined ? { now: input.now } : {}),
  });
  const guard: parseguard = { schema: { steps: { type: "array", required: true } }, retries: 1 };
  const output = guardoutput({ guard, attempts: [answer.text] });
  if (output.verdict !== "valid" || output.parsed === undefined)
    return { output, reason: output.reason ?? "The replan answer failed its guard." };
  const rawsteps = Array.isArray(output.parsed.steps) ? output.parsed.steps : [];
  const tail: draftstep[] = rawsteps
    .filter(
      (step): step is Record<string, unknown> => step !== null && typeof step === "object" && !Array.isArray(step),
    )
    .map((step, index) => ({
      id: `tail${index + 1}`,
      kind: typeof step.kind === "string" ? step.kind : "",
      ...(typeof step.target === "string" && step.target.trim() !== "" ? { target: step.target } : {}),
      ...(typeof step.value === "string" && step.value.trim() !== "" ? { value: step.value } : {}),
      summary: typeof step.summary === "string" ? step.summary : "",
      freshreview: true,
    }));
  const replan: replanrecord = {
    id: randomid(),
    draftid: input.draft.id,
    completedstepids: [...input.completedstepids],
    failedstepids: [...input.failedstepids],
    tail,
    reason: input.reason,
    providerid: input.provider.id,
    model: input.model,
    state: "pending",
    createdat: (input.now ?? Date.now)(),
  };
  return { replan, output };
}

/** Reflects one executed step: the model call reads the step outcome with the running lessons of the earlier steps and answers the lesson learned plus the advice for the next step; the note records its run, step and model provenance. */
export async function reflectstep(input: {
  provider: providerconfig;
  model: string;
  runid: string;
  stepid: string;
  outcome: string;
  lessons?: string[];
  apikey?: string;
  transport: fetchtransport;
  sleep?: (milliseconds: number) => Promise<void>;
  now?: () => number;
}): Promise<{ note?: reflectnote; output?: modeloutput; reason?: string }> {
  if (input.outcome.trim() === "") return { reason: "The reflection needs the step outcome." };
  const lessons = input.lessons ?? [];
  const answer = await callmodel({
    provider: input.provider,
    model: input.model,
    messages: [
      {
        role: "system",
        content: `Reflect on the executed step ${input.stepid} of the run ${input.runid} with the outcome: ${input.outcome}.${lessons.length > 0 ? ` The running lessons of the earlier steps: ${lessons.join(" | ")}.` : ""} Answer as json with the fields outcome (string), lesson (string) and advice (string) for the next step. Answer with the json object only.`,
      },
      { role: "user", content: input.outcome },
    ],
    ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
    transport: input.transport,
    ...(input.sleep !== undefined ? { sleep: input.sleep } : {}),
    ...(input.now !== undefined ? { now: input.now } : {}),
  });
  const guard: parseguard = {
    schema: {
      outcome: { type: "string", required: true },
      lesson: { type: "string", required: true },
      advice: { type: "string", required: true },
    },
    retries: 1,
  };
  const output = guardoutput({ guard, attempts: [answer.text] });
  if (output.verdict !== "valid" || output.parsed === undefined)
    return { output, reason: output.reason ?? "The reflection answer failed its guard." };
  const parsed = output.parsed;
  if (typeof parsed.lesson !== "string" || typeof parsed.advice !== "string")
    return { output, reason: "The reflection answer carries no lesson or advice." };
  const note: reflectnote = {
    id: randomid(),
    runid: input.runid,
    stepid: input.stepid,
    outcome: typeof parsed.outcome === "string" ? parsed.outcome : input.outcome,
    lesson: parsed.lesson,
    advice: parsed.advice,
    providerid: input.provider.id,
    model: input.model,
    createdat: (input.now ?? Date.now)(),
  };
  return { note, output };
}

/** Summarizes the running lessons of the reflection notes so the next prompt carries them; the newest lesson of every step rides the summary in step order. */
export function reflectionsummary(notes: reflectnote[]): string {
  const latest = new Map<string, reflectnote>();
  for (const note of notes) latest.set(note.stepid, note);
  const lessons = [...latest.values()].sort((one, two) => one.createdat - two.createdat).map((note) => note.lesson);
  return lessons.length === 0 ? "" : lessons.join(" | ");
}

/** Strips the guardrail noise of one model answer before parsing: code fences open the payload, chatter lines around a json object fall away and a fenced block without a language tag keeps its inner text. The fence runs through plain index scans, because a regex over the fence prefix would backtrack polynomially on adversarial answers built from repeated fence markers. */
export function stripguardrails(text: string): string {
  let candidate = text;
  const open = text.indexOf("```");
  if (open !== -1) {
    let cursor = open + 3;
    while (cursor < text.length) {
      const tag = text[cursor] ?? "";
      if (!((tag >= "a" && tag <= "z") || (tag >= "A" && tag <= "Z"))) break;
      cursor += 1;
    } /* the language tag, either case */
    while (cursor < text.length) {
      const space = text[cursor] ?? "";
      if (space !== " " && space !== "\t" && space !== "\r" && space !== "\n") break;
      cursor += 1;
    } /* the whitespace after the tag */
    const close = text.indexOf("```", cursor);
    if (close !== -1) candidate = text.slice(cursor, close);
  }
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) return candidate.slice(start, end + 1);
  const arraystart = candidate.indexOf("[");
  const arrayend = candidate.lastIndexOf("]");
  if (arraystart >= 0 && arrayend > arraystart) return candidate.slice(arraystart, arrayend + 1);
  return candidate.trim();
}

/** Validates one stripped model answer against the guard schema: every required field must be present with its declared type while optional fields pass through; the verdict reports invalid with the reason otherwise. */
export function parseoutput(input: { guard: parseguard; text: string }): modeloutput {
  const raw = input.text;
  const stripped = stripguardrails(raw);
  const markers = input.guard.refusalmarkers ?? defaultrefusalmarkers;
  const lowered = stripped.toLowerCase();
  for (const marker of markers)
    if (marker.trim() !== "" && lowered.includes(marker.toLowerCase()))
      return { raw, verdict: "refused", reason: `The model answer carries the refusal marker ${marker}.`, attempts: 1 };
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return { raw, verdict: "invalid", reason: "The model answer is not json after the guardrail strip.", attempts: 1 };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    return { raw, verdict: "invalid", reason: "The model answer is not a json object.", attempts: 1 };
  const record = parsed as Record<string, unknown>;
  for (const [name, field] of Object.entries(input.guard.schema)) {
    const value = record[name];
    if (value === undefined || value === null) {
      if (field.required === true)
        return {
          raw,
          verdict: "invalid",
          reason: `The required field ${name} of the expected schema is missing.`,
          attempts: 1,
        };
      continue;
    }
    const actual = Array.isArray(value) ? "array" : typeof value;
    if (actual !== field.type)
      return {
        raw,
        verdict: "invalid",
        reason: `The field ${name} carries a ${actual} value where the schema asks a ${field.type}.`,
        attempts: 1,
      };
  }
  return { raw, parsed: record, verdict: "valid", attempts: 1 };
}

/** Runs the parse guard over the model answer attempts: a valid attempt wins, a refusal marker refuses without retries, malformed answers retry up to the configured count and the exhaustion of every attempt refuses the output so nothing invalid ever executes. */
export function guardoutput(input: { guard: parseguard; attempts: string[] }): modeloutput {
  const limit = Math.max(1, Math.floor(input.guard.retries) + 1);
  const attempts = input.attempts.slice(0, limit);
  let last: modeloutput | undefined;
  for (let index = 0; index < attempts.length; index += 1) {
    const output = parseoutput({ guard: input.guard, text: attempts[index] ?? "" });
    last = { ...output, attempts: index + 1 };
    if (output.verdict === "valid") return last;
    if (output.verdict === "refused") return { ...output, attempts: index + 1 };
  }
  const exhausted: modeloutput =
    last === undefined
      ? { raw: "", verdict: "invalid", reason: "The model answer never arrived.", attempts: 0 }
      : {
          ...last,
          verdict: "invalid",
          reason: `${last.reason ?? "The model answer failed its guard."} Every retry attempt failed, so the guard refuses the output and nothing executes.`,
        };
  return exhausted;
}

/** Builds the openapi style tool brief of one catalog tool: the name, the summary line, the description, the risk class and the typed parameter list with their required markers. */
export function toolbriefof(tool: tooldef): toolbrief {
  return {
    tool: tool.name,
    summary: `${tool.name}: ${tool.description.split(".")[0] ?? tool.description}.`,
    description: tool.description,
    risk: tool.risk,
    parameters: Object.entries(tool.inputschema.properties).map(([name, property]) => ({
      name,
      type: property.type,
      description: property.description,
      required: property.required === true,
    })),
  };
}

/** Renders the tool briefs in openapi style for model consumption: every tool lists its name, summary, risk class and typed parameters so the model knows the surface it may propose; the consent notice states that side effects need the named approved step. */
export function rendertoolbriefs(tools: tooldef[]): string {
  const blocks = tools.map((tool) => {
    const brief = toolbriefof(tool);
    const parameters = brief.parameters
      .map(
        (parameter) =>
          `    - name: ${parameter.name}\n      type: ${parameter.type}\n      required: ${parameter.required ? "true" : "false"}\n      description: ${parameter.description}`,
      )
      .join("\n");
    return `  - tool: ${brief.tool}\n    summary: ${brief.summary}\n    risk: ${brief.risk}\n    parameters:\n${parameters}`;
  });
  return `tools:\n${blocks.join("\n")}\nconsent: every tool with side effects executes only the approved plan step it names; a proposal without the approved step stays refused.`;
}

/** Records one usage entry of a model call: the run and step ids ride the record together with the provider, the endpoint, the model, the token counts and the cost; newer records prepend so the newest call reads first. */
export function addusage(records: usagerecord[], record: usagerecord): usagerecord[] {
  return [record, ...records];
}

/** Aggregates the usage records per run, per step, per session and per period: the prompt, completion and total token counts, the cost total and the call count of every record the filter keeps; the session filter of the 1.1.83 gateway family reports the per session totals beside the per run totals. */
export function usagetotals(
  records: usagerecord[],
  filter: { runid?: string; stepid?: string; sessionid?: string; since?: number; until?: number } = {},
): { prompttokens: number; completiontokens: number; totaltokens: number; cost: number; calls: number } {
  const kept = records.filter(
    (record) =>
      (filter.runid === undefined || record.runid === filter.runid) &&
      (filter.stepid === undefined || record.stepid === filter.stepid) &&
      (filter.sessionid === undefined || record.sessionid === filter.sessionid) &&
      (filter.since === undefined || record.at >= filter.since) &&
      (filter.until === undefined || record.at <= filter.until),
  );
  return kept.reduce(
    (totals, record) => ({
      prompttokens: totals.prompttokens + record.prompttokens,
      completiontokens: totals.completiontokens + record.completiontokens,
      totaltokens: totals.totaltokens + record.totaltokens,
      cost: totals.cost + record.cost,
      calls: totals.calls + 1,
    }),
    { prompttokens: 0, completiontokens: 0, totaltokens: 0, cost: 0, calls: 0 },
  );
}

/** Checks the cost budget of a run: a reached token or currency ceiling halts the run and asks the user before anything else runs, while an absent ceiling stays unbounded because every ceiling is a user choice. */
export function budgetcheck(input: { budget: costbudget | undefined; totals: { totaltokens: number; cost: number } }): {
  allowed: boolean;
  halted: boolean;
  asksuser: boolean;
  reason?: string;
} {
  if (input.budget === undefined) return { allowed: true, halted: false, asksuser: false };
  if (
    input.budget.maxtokens !== undefined &&
    Number.isFinite(input.budget.maxtokens) &&
    input.totals.totaltokens >= input.budget.maxtokens
  )
    return {
      allowed: false,
      halted: true,
      asksuser: true,
      reason: `The run reached the user configured token ceiling of ${input.budget.maxtokens} and halts until the user answers.`,
    };
  if (
    input.budget.maxcost !== undefined &&
    Number.isFinite(input.budget.maxcost) &&
    input.totals.cost >= input.budget.maxcost
  )
    return {
      allowed: false,
      halted: true,
      asksuser: true,
      reason: `The run reached the user configured cost ceiling of ${input.budget.maxcost} and halts until the user answers.`,
    };
  return { allowed: true, halted: false, asksuser: false };
}

/* ── Merged from modelroute.ts ── */

/**
 * Model routing of the 1.1.57 llm integration family.
 * Every routing concern lives in this file: the task kind resolution that maps a task kind onto its preferred provider and model, the availability marking of providers that failed their last call, the fallback resolution on refusal or outage with the user configured fallback pair and the route validation that keeps every entry a user configured choice.
 * No default route, no default model and no default provider ever applies: an unrouted task kind reports why nothing routed and the user picks the pair.
 */

/** Validates one model route entry: the task kind, the provider and the model stay user configured values and the fallback pair needs both halves or none. */
export function routevalid(route: modelroute): policyevaluation {
  if (route.kind.trim() === "") return { allowed: false, reason: "The model route needs its task kind." };
  if (route.providerid.trim() === "")
    return { allowed: false, reason: "The model route needs the provider it routes to." };
  if (route.model.trim() === "")
    return { allowed: false, reason: "The model route needs the model name it routes to." };
  const hasfallbackprovider = route.fallbackproviderid !== undefined && route.fallbackproviderid.trim() !== "";
  const hasfallbackmodel = route.fallbackmodel !== undefined && route.fallbackmodel.trim() !== "";
  if (hasfallbackprovider !== hasfallbackmodel)
    return { allowed: false, reason: "The fallback of a model route needs its provider and its model together." };
  return { allowed: true };
}

/** Returns every route of one task kind in revision order, newest revision first. */
export function routesfor(routes: modelroute[], kind: string): modelroute[] {
  return routes.filter((route) => route.kind === kind).sort((one, two) => two.revision - one.revision);
}

/** Resolves the provider and model for one task kind: the newest route of the kind whose provider exists and stays available wins; an unrouted kind, a missing provider or an unavailable provider reports why nothing routed. */
export function resolveroute(input: { routes: modelroute[]; providers: providerconfig[]; kind: string }): {
  route?: modelroute;
  provider?: providerconfig;
  model?: string;
  reason?: string;
} {
  const candidates = routesfor(input.routes, input.kind);
  if (candidates.length === 0)
    return {
      reason: `No model route configures the task kind ${input.kind}; the user picks the provider and model pair.`,
    };
  for (const route of candidates) {
    if (!routevalid(route).allowed) continue;
    const provider = input.providers.find((candidate) => candidate.id === route.providerid);
    if (provider === undefined)
      return { reason: `The route of ${input.kind} names the missing provider ${route.providerid}.` };
    if (provider.status === "unavailable")
      return {
        reason: `The provider ${provider.name} of the route of ${input.kind} stays marked unavailable from its last failure.`,
      };
    if (!provider.models.includes(route.model))
      return {
        reason: `The route of ${input.kind} names the model ${route.model} outside the model list of ${provider.name}.`,
      };
    return { route, provider, model: route.model };
  }
  return { reason: `Every route of the task kind ${input.kind} failed its validation.` };
}

/** Marks one provider unavailable after a failed call or available after a successful test; every other provider stays untouched. */
export function markprovider(input: {
  providers: providerconfig[];
  providerid: string;
  available: boolean;
  now: number;
}): providerconfig[] {
  return input.providers.map((provider) =>
    provider.id === input.providerid
      ? {
          ...provider,
          status: input.available ? ("available" as const) : ("unavailable" as const),
          lastcheckedat: input.now,
        }
      : provider,
  );
}

/** Resolves the fallback pair of one task kind on refusal or outage: the user configured fallback provider and model win when they exist and stay available; a missing fallback reports why nothing fell back so the caller asks the user. */
export function fallbackroute(input: { routes: modelroute[]; providers: providerconfig[]; kind: string }): {
  route?: modelroute;
  provider?: providerconfig;
  model?: string;
  reason?: string;
} {
  const candidates = routesfor(input.routes, input.kind);
  const primary = candidates.find((route) => routevalid(route).allowed);
  if (primary === undefined)
    return { reason: `No valid route configures the task kind ${input.kind}, so no fallback applies.` };
  if (primary.fallbackproviderid === undefined || primary.fallbackmodel === undefined)
    return { reason: `The route of ${input.kind} carries no user configured fallback pair.` };
  const provider = input.providers.find((candidate) => candidate.id === primary.fallbackproviderid);
  if (provider === undefined)
    return { reason: `The fallback names the missing provider ${primary.fallbackproviderid}.` };
  if (provider.status === "unavailable")
    return { reason: `The fallback provider ${provider.name} stays marked unavailable from its last failure.` };
  if (!provider.models.includes(primary.fallbackmodel))
    return {
      reason: `The fallback names the model ${primary.fallbackmodel} outside the model list of ${provider.name}.`,
    };
  return { route: primary, provider, model: primary.fallbackmodel };
}

/** Bumps the revision of one route entry so the revision history of the routing table stays queryable; the newest revision of a kind wins the resolution. */
export function bumprevision(route: modelroute, now: number): modelroute {
  return { ...route, revision: route.revision + 1, updatedat: now };
}

/* ── Merged from promptlibrary.ts ── */

/**
 * Prompt template library of the 1.1.57 llm integration family.
 * Every template concern lives in this file: the variable extraction from double braced placeholders, the template render that fills the variables, the consent notice requirement of sensitive flows, the versioning of every saved template with its change notes and the library search.
 * The library holds user templates only: no built-in template ever ships, so every prompt body stays a user reviewed choice.
 */

/** Extracts the double braced variable names of one template body in order of appearance, deduplicated. */
export function templatevariables(body: string): string[] {
  const names: string[] = [];
  for (const match of body.matchAll(/\{\{\s*([a-z0-9]+)\s*\}\}/g)) {
    const name = match[1] ?? "";
    if (name !== "" && !names.includes(name)) names.push(name);
  }
  return names;
}

/** Renders one template with its variables: every declared variable substitutes its value while a sensitive flow needs its consent notice before the render leaves; the notice rides the rendered text so the reviewer sees the consent line. */
export function rendertemplate(input: {
  template: prompttemplate;
  variables?: Record<string, unknown>;
  sensitive?: boolean;
  consentnotice?: string;
}): { text?: string; reason?: string } {
  if (input.sensitive === true && (input.consentnotice === undefined || input.consentnotice.trim() === ""))
    return { reason: "The sensitive flow needs its consent notice before the template renders." };
  const variables = input.variables ?? {};
  const missing = input.template.variables.filter(
    (name) =>
      variables[name] === undefined ||
      variables[name] === null ||
      (typeof variables[name] === "string" && (variables[name] as string).trim() === ""),
  );
  if (missing.length > 0) return { reason: `The template variables ${missing.join(", ")} stay empty.` };
  let text = input.template.body.replace(/\{\{\s*([a-z0-9]+)\s*\}\}/g, (whole, name: string) => {
    const value = variables[name];
    if (value === undefined || value === null) return whole;
    return typeof value === "string" ? value : JSON.stringify(value);
  });
  if (input.sensitive === true && input.consentnotice !== undefined)
    text = `${text}\nConsent notice: ${input.consentnotice}`;
  return { text };
}

/** Saves one template version: a new name creates the first version while a known name bumps the version with its change notes; every earlier version stays stored so the history never rewrites. */
export function savetemplate(input: {
  templates: prompttemplate[];
  name: string;
  body: string;
  notes?: string;
  now: number;
}): prompttemplate[] {
  const existing = input.templates.filter((template) => template.name === input.name);
  const version = existing.length === 0 ? 1 : Math.max(...existing.map((template) => template.version)) + 1;
  const record: prompttemplate = {
    id: randomid(),
    name: input.name,
    body: input.body,
    variables: templatevariables(input.body),
    version,
    ...(input.notes !== undefined && input.notes.trim() !== "" ? { notes: input.notes } : {}),
    createdat: input.now,
  };
  return [record, ...input.templates];
}

/** Returns the newest stored version of one template name; an unknown name reports undefined. */
export function latesttemplate(templates: prompttemplate[], name: string): prompttemplate | undefined {
  const versions = templates.filter((template) => template.name === name);
  return versions.length === 0
    ? undefined
    : versions.reduce((newest, template) => (template.version > newest.version ? template : newest));
}

/** Searches the library: the query matches the template name, the body text, the change notes or one of the declared variables, newest version first. */
export function searchtemplates(templates: prompttemplate[], query: string): prompttemplate[] {
  const term = query.trim().toLowerCase();
  const matches =
    term === ""
      ? templates
      : templates.filter(
          (template) =>
            template.name.toLowerCase().includes(term) ||
            template.body.toLowerCase().includes(term) ||
            (template.notes ?? "").toLowerCase().includes(term) ||
            template.variables.some((variable) => variable.toLowerCase().includes(term)),
        );
  return [...matches].sort((one, two) => two.version - one.version || two.createdat - one.createdat);
}

/** Removes every version of one template name from the library; the change history leaves with the name. */
export function removetemplate(templates: prompttemplate[], name: string): prompttemplate[] {
  return templates.filter((template) => template.name !== name);
}
/* ── Merged: the grand merge section ── the correlated provider gateway adapter logics of the merged repository interned here, one surface without duplicate variations. ── */

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
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

/** Reads one record field as a finite number when it is one. */
/** Reads the wire body of one shaped request as a record so the adapter merges its tool catalog, and answers the re-serialized body; a malformed body passes through untouched so the wire shape never silently changes. */
function withbody(
  request: ReturnType<typeof buildrequest>,
  merge: (body: Record<string, unknown>) => void,
): ReturnType<typeof buildrequest> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(request.body);
  } catch {
    return request;
  }
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
  build: (input) => {
    const shaped = buildrequest({
      provider: {
        endpoint: gatewayurl(input.config, "/chat/completions"),
        style: "chatcompletions",
        ...(input.headers !== undefined ? { headers: input.headers } : {}),
      },
      model: input.model,
      messages: input.messages,
      ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
      ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
      ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}),
      ...(input.stream === true ? { stream: true } : {}),
    });
    if (input.tools === undefined || input.tools.length === 0) return shaped;
    return withbody(shaped, (body) => {
      body.tools = input.tools?.map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: "object",
            properties: Object.fromEntries(
              Object.entries(tool.inputschema.properties).map(([name, property]) => [
                name,
                {
                  type: property.type,
                  description: property.description,
                  ...(property.required === true ? { required: true } : {}),
                  ...(property.default !== undefined ? { default: property.default } : {}),
                },
              ]),
            ),
            required: tool.inputschema.required,
          },
        },
      }));
    });
  },
  parseanswer: (body) => parsecompletion("chatcompletions", body),
  parsestream: (body) => parsestream("chatcompletions", body),
  parsemodellist: (body) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      return [];
    }
    const record = recordof(parsed);
    const list = record !== undefined && Array.isArray(record.data) ? record.data : undefined;
    if (list === undefined) return [];
    const models: gatewaymodelinfo[] = [];
    for (const item of list) {
      const entry = recordof(item);
      if (entry === undefined || typeof entry.id !== "string" || entry.id.trim() === "") continue;
      const context = numberof(entry["context_length"]) ?? numberof(entry["context_window"]);
      models.push({
        id: entry.id,
        ...(typeof entry.label === "string" && entry.label.trim() !== "" ? { label: entry.label } : {}),
        ...(context !== undefined ? { contextwindow: context } : {}),
        ...(Array.isArray(entry.modalities)
          ? { modalities: entry.modalities.filter((kind): kind is string => typeof kind === "string") }
          : {}),
      });
    }
    return models;
  },
  toolcatalog: (tools) =>
    tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object",
          properties: Object.fromEntries(
            Object.entries(tool.inputschema.properties).map(([name, property]) => [
              name,
              {
                type: property.type,
                description: property.description,
                ...(property.required === true ? { required: true } : {}),
              },
            ]),
          ),
          required: tool.inputschema.required,
        },
      },
    })),
};

/** The anthropic messages adapter: the messages wire shape with its system prompt mapping to the top level system field, the streamed answer rides content block deltas and the tool catalog serializes into the input schema format. */
export const anthropicgatewayadapter: gatewayadapter = {
  kind: "anthropicgateway",
  style: "messages",
  chatpath: () => "/v1/messages",
  modelspath: () => "/v1/models",
  build: (input) => {
    const shaped = buildrequest({
      provider: {
        endpoint: gatewayurl(input.config, "/v1/messages"),
        style: "messages",
        ...(input.headers !== undefined ? { headers: input.headers } : {}),
      },
      model: input.model,
      messages: input.messages,
      ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
      ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
      ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}),
      ...(input.stream === true ? { stream: true } : {}),
    });
    if (input.tools === undefined || input.tools.length === 0) return shaped;
    return withbody(shaped, (body) => {
      body.tools = input.tools?.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: {
          type: "object",
          properties: Object.fromEntries(
            Object.entries(tool.inputschema.properties).map(([name, property]) => [
              name,
              {
                type: property.type,
                description: property.description,
                ...(property.required === true ? { required: true } : {}),
              },
            ]),
          ),
          required: tool.inputschema.required,
        },
      }));
    });
  },
  parseanswer: (body) => parsecompletion("messages", body),
  parsestream: (body) => parsestream("messages", body),
  parsemodellist: (body) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      return [];
    }
    const record = recordof(parsed);
    const list = record !== undefined && Array.isArray(record.data) ? record.data : undefined;
    if (list === undefined) return [];
    const models: gatewaymodelinfo[] = [];
    for (const item of list) {
      const entry = recordof(item);
      if (entry === undefined || typeof entry.id !== "string" || entry.id.trim() === "") continue;
      const context = numberof(entry["context_window"]);
      models.push({
        id: entry.id,
        ...(typeof entry["display_name"] === "string" && (entry["display_name"] as string).trim() !== ""
          ? { label: entry["display_name"] as string }
          : {}),
        ...(context !== undefined ? { contextwindow: context } : {}),
      });
    }
    return models;
  },
  toolcatalog: (tools) =>
    tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(tool.inputschema.properties).map(([name, property]) => [
            name,
            {
              type: property.type,
              description: property.description,
              ...(property.required === true ? { required: true } : {}),
            },
          ]),
        ),
        required: tool.inputschema.required,
      },
    })),
};

/** The gemini generate content adapter: the generate content wire shape with the model riding the path, the streamed answer rides candidate parts and the tool schema maps into the function declarations format. */
export const geminigatewayadapter: gatewayadapter = {
  kind: "geminigateway",
  style: "gemini",
  chatpath: (model) => `/v1beta/models/${encodeURIComponent(model)}:generateContent`,
  modelspath: () => "/v1beta/models",
  build: (input) => {
    const shaped = buildrequest({
      provider: {
        endpoint: gatewayurl(input.config, geminigatewayadapter.chatpath(input.model)),
        style: "gemini",
        ...(input.headers !== undefined ? { headers: input.headers } : {}),
      },
      model: input.model,
      messages: input.messages,
      ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
      ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
      ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}),
      ...(input.stream === true ? { stream: true } : {}),
    });
    if (input.tools === undefined || input.tools.length === 0) return shaped;
    return withbody(shaped, (body) => {
      body.tools = [
        {
          functionDeclarations: input.tools?.map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: {
              type: "object",
              properties: Object.fromEntries(
                Object.entries(tool.inputschema.properties).map(([name, property]) => [
                  name,
                  {
                    type: property.type,
                    description: property.description,
                    ...(property.required === true ? { required: true } : {}),
                  },
                ]),
              ),
              required: tool.inputschema.required,
            },
          })),
        },
      ];
    });
  },
  parseanswer: (body) => parsecompletion("gemini", body),
  parsestream: (body) => parsestream("gemini", body),
  parsemodellist: (body) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      return [];
    }
    const record = recordof(parsed);
    const list = record !== undefined && Array.isArray(record.models) ? record.models : undefined;
    if (list === undefined) return [];
    const models: gatewaymodelinfo[] = [];
    for (const item of list) {
      const entry = recordof(item);
      if (entry === undefined || typeof entry.name !== "string" || entry.name.trim() === "") continue;
      const inputlimit = numberof(entry["inputTokenLimit"]);
      const methods = Array.isArray(entry["supportedGenerationMethods"])
        ? (entry["supportedGenerationMethods"] as unknown[]).filter((kind): kind is string => typeof kind === "string")
        : undefined;
      models.push({
        id: entry.name.replace(/^models\//, ""),
        ...(typeof entry.displayName === "string" && entry.displayName.trim() !== ""
          ? { label: entry.displayName }
          : {}),
        ...(inputlimit !== undefined ? { contextwindow: inputlimit } : {}),
        ...(methods !== undefined ? { modalities: methods } : {}),
      });
    }
    return models;
  },
  toolcatalog: (tools) => [
    {
      functionDeclarations: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object",
          properties: Object.fromEntries(
            Object.entries(tool.inputschema.properties).map(([name, property]) => [
              name,
              {
                type: property.type,
                description: property.description,
                ...(property.required === true ? { required: true } : {}),
              },
            ]),
          ),
          required: tool.inputschema.required,
        },
      })),
    },
  ],
};

/** The ollama local runtime adapter: it speaks its own localhost wire format (the chat endpoint with the message envelope, the tag list of the locally installed models and the newline delimited stream lines), the base url defaults to the local machine alone and never to a cloud url, and a call never leaves the machine. */
export const ollamalocaladapter: gatewayadapter = {
  kind: "ollamalocal",
  chatpath: () => "/api/chat",
  modelspath: () => "/api/tags",
  build: (input) => {
    const headers: Record<string, string> = { "content-type": "application/json", ...(input.headers ?? {}) };
    if (input.apikey !== undefined && input.apikey.trim() !== "") headers.authorization = `Bearer ${input.apikey}`;
    const body: Record<string, unknown> = {
      model: input.model,
      messages: input.messages.map((message) => ({ role: message.role, content: message.content })),
      ...(input.stream === true ? { stream: true } : {}),
    };
    if (input.tools !== undefined && input.tools.length > 0)
      body.tools = input.tools.map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: "object",
            properties: Object.fromEntries(
              Object.entries(tool.inputschema.properties).map(([name, property]) => [
                name,
                {
                  type: property.type,
                  description: property.description,
                  ...(property.required === true ? { required: true } : {}),
                },
              ]),
            ),
            required: tool.inputschema.required,
          },
        },
      }));
    return { url: gatewayurl(input.config, "/api/chat"), method: "POST", headers, body: JSON.stringify(body) };
  },
  parseanswer: (body) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      return { reason: "The ollama answer is not json." };
    }
    const record = recordof(parsed);
    if (record === undefined) return { reason: "The ollama answer is not a json object." };
    const message = recordof(record.message);
    if (message === undefined || typeof message.content !== "string")
      return { reason: "The ollama answer carries no message content." };
    const prompttokens = numberof(record["prompt_eval_count"]);
    const completiontokens = numberof(record["eval_count"]);
    return {
      text: message.content,
      ...(prompttokens !== undefined || completiontokens !== undefined
        ? {
            usage: {
              prompttokens: prompttokens ?? 0,
              completiontokens: completiontokens ?? 0,
              totaltokens: (prompttokens ?? 0) + (completiontokens ?? 0),
            },
          }
        : {}),
    };
  },
  parsestream: (body) => {
    const tokens: tokenstream[] = [];
    let seq = 0;
    let done = false;
    for (const line of body.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed === "") continue;
      let parsed: unknown;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        continue;
      }
      const record = recordof(parsed);
      if (record === undefined) continue;
      const message = recordof(record.message);
      const text = message !== undefined && typeof message.content === "string" ? message.content : "";
      if (record.done === true) done = true;
      if (text === "") continue;
      seq += 1;
      tokens.push({ seq, text, done: false });
    }
    if (tokens.length > 0 && done)
      tokens[tokens.length - 1] = { ...(tokens[tokens.length - 1] as tokenstream), done: true };
    return tokens;
  },
  parsemodellist: (body) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      return [];
    }
    const record = recordof(parsed);
    const list = record !== undefined && Array.isArray(record.models) ? record.models : undefined;
    if (list === undefined) return [];
    const models: gatewaymodelinfo[] = [];
    for (const item of list) {
      const entry = recordof(item);
      if (entry === undefined || typeof entry.name !== "string" || entry.name.trim() === "") continue;
      const details = recordof(entry.details);
      const families =
        details !== undefined && Array.isArray(details.families)
          ? (details.families as unknown[]).filter((kind): kind is string => typeof kind === "string")
          : undefined;
      models.push({
        id: entry.name,
        ...(details !== undefined && typeof details["parameter_size"] === "string"
          ? { label: `${entry.name} (${details["parameter_size"] as string})` }
          : {}),
        ...(families !== undefined ? { modalities: families } : {}),
      });
    }
    return models;
  },
  toolcatalog: (tools) =>
    tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object",
          properties: Object.fromEntries(
            Object.entries(tool.inputschema.properties).map(([name, property]) => [
              name,
              {
                type: property.type,
                description: property.description,
                ...(property.required === true ? { required: true } : {}),
              },
            ]),
          ),
          required: tool.inputschema.required,
        },
      },
    })),
};

/** Every adapter of the gateway family in its stable order; the surfaces and the tests read this one record. */
export const gatewayadapters: Record<gatewaykind, gatewayadapter> = {
  openaicompat: openaicompatadapter,
  anthropicgateway: anthropicgatewayadapter,
  geminigateway: geminigatewayadapter,
  ollamalocal: ollamalocaladapter,
};

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
    cancel: (why?: string) => {
      cancelled = true;
      if (why !== undefined && why.trim() !== "") reason = why.trim();
    },
    reason: () => reason,
  };
}

/** Builds one structured gateway error with its code, message, retry hint and request id; every failure surface of the family answers this one shape. */
export function gatewayerrorof(
  code: gatewayerror["code"],
  message: string,
  requestid: string,
  retryhint?: string,
  retryafter?: number,
): gatewayerror {
  return {
    code,
    message,
    requestid,
    ...(retryhint !== undefined && retryhint.trim() !== "" ? { retryhint } : {}),
    ...(retryafter !== undefined && Number.isFinite(retryafter) ? { retryafter } : {}),
  };
}

/** Normalizes one thrown error into the structured gateway error surface: a thrown gateway error passes through, a timeout keeps its code and every other failure grades as a transport error with its retry hint. */
export function gatewayerrorfrom(error: unknown, requestid: string): gatewayerror {
  if (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    "requestid" in error &&
    typeof (error as gatewayerror).code === "string"
  )
    return error as gatewayerror;
  const message = error instanceof Error ? error.message : String(error);
  const code = message.includes("timed out") ? "timeout" : "transport";
  return gatewayerrorof(
    code,
    message,
    requestid,
    "A transient network failure may succeed on a retry; the caller decides whether one runs.",
  );
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
export function maskrequest(request: { url: string; method: string; headers: Record<string, string>; body: string }): {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
} {
  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(request.headers)) {
    const lowered = name.toLowerCase();
    headers[name] =
      lowered === "authorization" || lowered === "x-api-key" || lowered.includes("token") || lowered.includes("secret")
        ? maskkey(value)
        : value;
  }
  const url = request.url.replace(/([?&])key=[^&]*/g, "$1key=masked");
  return { url, method: request.method, headers, body: request.body };
}

/** Stores one provider api key behind the vault seam under the explicit consent of the user: the key material enters the seam at the store moment and the metadata record alone answers, scoped to the origin of the provider base url so a key of one gateway never rides another. */
export async function storeproviderkey(input: {
  seam: { put(vaultid: string, value: string): Promise<void> };
  config: Pick<baseurlconfig, "providerid" | "kind" | "baseurl">;
  profileid: string;
  value: string;
  consent: boolean;
  now: number;
}): Promise<secretvaultentry> {
  const gate = gatewaykeyconsentgate({ consent: input.consent, providerid: input.config.providerid });
  if (!gate.allowed)
    throw new Error(gate.reason ?? "The provider key needs its explicit consent before the vault stores it.");
  if (input.value === "") throw new Error("The provider key needs its key material; an empty value stores nothing.");
  let scope = input.config.providerid;
  try {
    scope = new URL(input.config.baseurl).origin;
  } catch {
    /* the base url without a parsed origin keeps the provider id scope */
  }
  return vaultstore({
    seam: input.seam,
    label: input.config.providerid,
    scope,
    profileid: input.profileid,
    provenance: "user",
    value: input.value,
    now: input.now,
  });
}

/** Resolves one provider key from the vault seam at the last possible moment before the wire header: the value answers to the dispatching caller only, never to a log writer, and the record stamps its use. */
export async function resolveproviderkey(input: {
  seam: { fetch(vaultid: string): Promise<string | undefined> };
  entry: secretvaultentry;
}): Promise<{ ok: boolean; value?: string; reason: string }> {
  const resolved = await vaultvaluefor({ seam: input.seam, entry: input.entry });
  return {
    ok: resolved.ok,
    ...(resolved.value !== undefined ? { value: resolved.value } : {}),
    reason: resolved.reason,
  };
}

/** Revokes one provider key with one click: the value drops from the seam and the metadata record leaves with it, because a deleted key leaves no trace a surface could read. */
export async function revokeproviderkey(input: {
  seam: { drop(vaultid: string): Promise<void> };
  entry: secretvaultentry;
}): Promise<{ dropped: boolean; label: string; reason: string }> {
  return vaultdelete({ seam: input.seam, entry: input.entry });
}

/** Checks one export candidate list for leaked provider keys: a candidate whose sha-256 digest matches a stored vault record is a leak the export refuses, because key material never rides an export path. */
export async function keyexportcheck(input: {
  candidates: string[];
  entries: secretvaultentry[];
}): Promise<{ leaks: string[]; reason: string }> {
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
async function dispatch(input: {
  config: baseurlconfig;
  model: string;
  messages: modelmessage[];
  apikey?: string;
  tools?: tooldef[];
  temperature?: number;
  maxtokens?: number;
  stream?: boolean;
  options?: gatewayoptions;
  requestid?: string;
  cancel?: gatewaycancelstate;
  transport: fetchtransport;
  sleep?: (milliseconds: number) => Promise<void>;
  jitter?: () => number;
  now?: () => number;
}): Promise<{
  response: transportresponse;
  requestid: string;
  request: ReturnType<typeof buildrequest>;
  duration: number;
  retries: number;
}> {
  const requestid = input.requestid ?? randomid();
  const adapter = adapterof(input.config.kind);
  const sleep =
    input.sleep ??
    ((milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, milliseconds))));
  const jitter = input.jitter ?? (() => 0);
  const now = input.now ?? Date.now;
  const consent = gatewayconsentgate({ config: input.config });
  if (!consent.allowed)
    throw gatewayerrorof(
      "noconsent",
      consent.reason ?? "The provider call stayed behind the consent gate.",
      requestid,
      "Grant the provider consent from the options and the call runs.",
    );
  const baseurl = gatewaybaseurlgate({ kind: input.config.kind, baseurl: input.config.baseurl });
  if (!baseurl.allowed)
    throw gatewayerrorof("notconfigured", baseurl.reason ?? "The provider base url failed its validation.", requestid);
  const shaped = adapter.build({
    config: input.config,
    model: input.model,
    messages: input.messages,
    ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
    ...(input.tools !== undefined ? { tools: input.tools } : {}),
    ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
    ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}),
    ...(input.stream === true ? { stream: true } : {}),
    ...(input.options?.headers !== undefined ? { headers: input.options.headers } : {}),
  });
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
      const sent = input.transport(shaped.url, {
        method: shaped.method,
        headers: shaped.headers,
        body: shaped.body,
        redirect: "follow",
      });
      const timeout = input.options?.timeout;
      if (timeout !== undefined && Number.isFinite(timeout) && timeout >= 0) {
        let timedout = false;
        response = await Promise.race([
          sent,
          sleep(timeout).then(() => {
            timedout = true;
            return undefined;
          }),
        ]).then(
          (value) =>
            value ??
            (timedout
              ? (() => {
                  throw new Error(`The request timed out after ${timeout} milliseconds.`);
                })()
              : value),
        );
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
        throw gatewayerrorof(
          "ratelimited",
          `The provider answered rate limited and the retry budget of ${attempts - 1} attempt${attempts - 1 === 1 ? "" : "s"} is exhausted.`,
          requestid,
          "Wait the announced window and send the request again.",
          wait,
        );
      }
      if (response.status === 401 || response.status === 403)
        throw gatewayerrorof(
          "unauthorized",
          `The provider answered ${response.status}: the key the vault resolved did not authorize the call.`,
          requestid,
          "Check the stored key of the provider and revoke it if it rotated.",
        );
      if (response.status >= 200 && response.status < 300) {
        if (input.cancel?.cancelled() === true) throw gatewayerrorof("cancelled", input.cancel.reason(), requestid);
        return { response, requestid, request: shaped, duration: now() - startedat, retries };
      }
      lasterror = gatewayerrorof(
        "transport",
        `The provider answered ${response.status}: ${response.body.slice(0, 200)}`,
        requestid,
        "A transient server failure may succeed on a retry; the caller decides whether one runs.",
      );
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
export async function gatewaycall(input: {
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
}): Promise<gatewayresult> {
  const adapter = adapterof(input.config.kind);
  const outcome = await dispatch({
    config: input.config,
    model: input.model,
    messages: input.messages,
    ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
    ...(input.tools !== undefined ? { tools: input.tools } : {}),
    ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
    ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}),
    ...(input.options !== undefined ? { options: input.options } : {}),
    ...(input.requestid !== undefined ? { requestid: input.requestid } : {}),
    ...(input.cancel !== undefined ? { cancel: input.cancel } : {}),
    transport: input.transport,
    ...(input.sleep !== undefined ? { sleep: input.sleep } : {}),
    ...(input.jitter !== undefined ? { jitter: input.jitter } : {}),
    ...(input.now !== undefined ? { now: input.now } : {}),
  });
  const parsed = adapter.parseanswer(outcome.response.body);
  if (parsed.text === undefined)
    throw gatewayerrorof(
      "parse",
      parsed.reason ?? "The provider answer did not parse.",
      outcome.requestid,
      "A retried request may parse; the caller decides whether one runs.",
    );
  return {
    text: parsed.text,
    ...(parsed.usage !== undefined ? { usage: parsed.usage } : {}),
    requestid: outcome.requestid,
    request: outcome.request,
    status: outcome.response.status,
    duration: outcome.duration,
    retries: outcome.retries,
  };
}

/** Streams one gateway request through the shared contract: the request carries the stream flag of its wire format, the adapter parses the streamed body into its ordered tokens (the chat completions deltas, the messages content blocks, the gemini candidate parts or the ollama message lines), the onevent seam fires for every token as it parses so the surfaces append the answer incrementally, and the cancel state stops the parse loop at the token position it reached. */
export async function gatewaystream(input: {
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
}> {
  const adapter = adapterof(input.config.kind);
  const outcome = await dispatch({
    config: input.config,
    model: input.model,
    messages: input.messages,
    ...(input.apikey !== undefined ? { apikey: input.apikey } : {}),
    ...(input.tools !== undefined ? { tools: input.tools } : {}),
    ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
    ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}),
    stream: true,
    ...(input.options !== undefined ? { options: input.options } : {}),
    ...(input.requestid !== undefined ? { requestid: input.requestid } : {}),
    ...(input.cancel !== undefined ? { cancel: input.cancel } : {}),
    transport: input.transport,
    ...(input.sleep !== undefined ? { sleep: input.sleep } : {}),
    ...(input.jitter !== undefined ? { jitter: input.jitter } : {}),
    ...(input.now !== undefined ? { now: input.now } : {}),
  });
  const tokens: tokenstream[] = [];
  for (const token of adapter.parsestream(outcome.response.body)) {
    if (input.cancel?.cancelled() === true) break;
    tokens.push(token);
    input.onevent?.(token);
  }
  return {
    tokens,
    text: tokens.map((token) => token.text).join(""),
    requestid: outcome.requestid,
    request: outcome.request,
    status: outcome.response.status,
    retries: outcome.retries,
  };
}

/** Fetches the model list of one provider through the adapter: the cache window the user configured decides whether the cached list still serves, a fresh fetch rides the model list endpoint of the wire format, the discovered models annotate with their context and modality hints when the provider offers them and a failed fetch keeps the cache untouched. */
export async function fetchmodellist(input: {
  config: baseurlconfig;
  apikey?: string;
  cachewindow?: number;
  cache?: modelcacherecord;
  transport: fetchtransport;
  options?: gatewayoptions;
  now?: () => number;
}): Promise<{ models: gatewaymodelinfo[]; cached: boolean; fetchedat: number; reason?: string }> {
  const now = input.now ?? Date.now;
  const adapter = adapterof(input.config.kind);
  if (input.cache !== undefined) {
    const window = input.cachewindow;
    if (window !== undefined && Number.isFinite(window) && window > 0 && now() - input.cache.fetchedat < window)
      return { models: input.cache.models, cached: true, fetchedat: input.cache.fetchedat };
  }
  const baseurl = gatewaybaseurlgate({ kind: input.config.kind, baseurl: input.config.baseurl });
  if (!baseurl.allowed)
    return {
      models: [],
      cached: false,
      fetchedat: now(),
      ...(baseurl.reason !== undefined ? { reason: baseurl.reason } : {}),
    };
  const headers: Record<string, string> = { ...(input.options?.headers ?? {}) };
  let url = gatewayurl(input.config, adapter.modelspath());
  if (input.apikey !== undefined && input.apikey.trim() !== "") {
    if (input.config.kind === "geminigateway")
      url = `${url}${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(input.apikey)}`;
    else headers.authorization = `Bearer ${input.apikey}`;
  }
  let response: transportresponse;
  try {
    response = await input.transport(url, { method: "GET", headers, redirect: "follow" });
  } catch (error) {
    return {
      models: [],
      cached: false,
      fetchedat: now(),
      reason: `The model list fetch failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  if (response.status < 200 || response.status >= 300)
    return {
      models: [],
      cached: false,
      fetchedat: now(),
      reason: `The model list endpoint answered ${response.status}.`,
    };

  const models = adapter.parsemodellist(response.body);
  return { models, cached: false, fetchedat: now() };
}

/** Builds the capabilityad advertisement of the tool catalog: the tools serialize into the wire format of the provider (the function schema of the chat completions shape, the input schema of the messages shape, the function declarations of the generate content shape or the function schema of the local runtime), every tool declares its consent requirement from its metadata and the plan review gate rides the required capabilities because a model answer never executes a step the human review did not approve. */
export function capabilityadvertisement(input: { kind: gatewaykind; tools: tooldef[] }): {
  kind: gatewaykind;
  tools: unknown[];
  consent: Array<{ tool: string; review: string; riskclass?: string; approvalrequired?: boolean }>;
  requiredcapabilities: string[];
} {
  const adapter = adapterof(input.kind);
  return {
    kind: input.kind,
    tools: adapter.toolcatalog(input.tools),
    consent: input.tools.map((tool) => ({
      tool: tool.name,
      review:
        tool.consentmeta?.review ?? `${tool.name} is a ${tool.risk} tool; it runs only behind its reviewed plan step.`,
      ...(tool.consentmeta?.riskclass !== undefined ? { riskclass: tool.consentmeta.riskclass } : {}),
      ...(tool.consentmeta?.approvalrequired === true ? { approvalrequired: true } : {}),
    })),
    requiredcapabilities: ["planreview"],
  };
}

/** Resolves the gateway route of one task kind: the user rules of the model routing table map the kind onto its provider and model, a remote provider the consent or enable gates refuse falls back to the user configured fallback pair, and when remote calls are not allowed at all the resolution falls back to the local provider so the task stays on the machine. */
export function resolvegatewayroute(input: {
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
} {
  const remoteallowed = input.remoteallowed !== false;
  const configof = (providerid: string): baseurlconfig | undefined =>
    input.configs.find((config) => config.providerid === providerid);
  const primary = resolveroute({ routes: input.routes, providers: input.providers, kind: input.kind });
  if (primary.provider !== undefined && primary.model !== undefined) {
    const config = configof(primary.provider.id);
    if (remoteallowed && (config === undefined || gatewayconsentgate({ config }).allowed))
      return {
        source: "route",
        provider: primary.provider,
        model: primary.model,
        ...(config !== undefined ? { config } : {}),
      };
  }
  const fallback = fallbackroute({ routes: input.routes, providers: input.providers, kind: input.kind });
  if (fallback.provider !== undefined && fallback.model !== undefined && remoteallowed) {
    const config = configof(fallback.provider.id);
    if (config === undefined || gatewayconsentgate({ config }).allowed)
      return {
        source: "fallback",
        provider: fallback.provider,
        model: fallback.model,
        ...(config !== undefined ? { config } : {}),
      };
  }
  if (input.local !== undefined && input.local.endpoint.trim() !== "")
    return {
      source: "local",
      local: input.local,
      model: input.local.model,
      reason: remoteallowed
        ? `The remote route of ${input.kind} stayed behind its gates, so the resolution fell back to the local provider.`
        : `Remote calls are not allowed, so the ${input.kind} task fell back to the local provider.`,
    };
  return {
    source: "route",
    reason: primary.reason ?? `No model route configures the task kind ${input.kind} and no local provider stands in.`,
  };
}

/** Builds one usage record of a gateway call: the request id rides the record for the correlation across the run, the session id reports the per session totals beside the per run totals, the cost answers the user configured price per million tokens and the local marker stamps the calls that never left the machine. */
export function gatewayusagerecord(input: {
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
}): usagerecord {
  const prompttokens = input.usage?.prompttokens ?? 0;
  const completiontokens = input.usage?.completiontokens ?? 0;
  const totaltokens = input.usage?.totaltokens ?? prompttokens + completiontokens;
  const cost =
    input.costpermilliontokens !== undefined && Number.isFinite(input.costpermilliontokens)
      ? ((prompttokens + completiontokens) / 1_000_000) * input.costpermilliontokens
      : 0;
  return {
    id: randomid(),
    ...(input.runid !== undefined ? { runid: input.runid } : {}),
    ...(input.stepid !== undefined ? { stepid: input.stepid } : {}),
    ...(input.sessionid !== undefined ? { sessionid: input.sessionid } : {}),
    requestid: input.requestid,
    providerid: input.providerid,
    endpoint: input.endpoint,
    model: input.model,
    prompttokens,
    completiontokens,
    totaltokens,
    cost,
    ...(input.local === true ? { local: true } : {}),
    at: input.now,
  };
}

/** Checks the warning threshold of the cost budget: the budget tracking warns once the recorded tokens or cost cross the user configured share of their ceiling, while the halt of the reviewed budget check stays separate — a warning never blocks a call, the halt does. */
export function gatewaybudgetwarning(input: { budget?: costbudget; totals: { totaltokens: number; cost: number } }): {
  warned: boolean;
  tokenratio?: number;
  costratio?: number;
  reason?: string;
} {
  const budget = input.budget;
  if (
    budget === undefined ||
    budget.warnratio === undefined ||
    !Number.isFinite(budget.warnratio) ||
    budget.warnratio <= 0
  )
    return { warned: false };
  const ratio = Math.min(1, Math.max(0, budget.warnratio));
  const tokenratio =
    budget.maxtokens !== undefined && Number.isFinite(budget.maxtokens) && budget.maxtokens > 0
      ? input.totals.totaltokens / budget.maxtokens
      : undefined;
  const costratio =
    budget.maxcost !== undefined && Number.isFinite(budget.maxcost) && budget.maxcost > 0
      ? input.totals.cost / budget.maxcost
      : undefined;
  const warned = (tokenratio !== undefined && tokenratio >= ratio) || (costratio !== undefined && costratio >= ratio);
  if (!warned)
    return {
      warned: false,
      ...(tokenratio !== undefined ? { tokenratio } : {}),
      ...(costratio !== undefined ? { costratio } : {}),
    };
  return {
    warned: true,
    ...(tokenratio !== undefined ? { tokenratio } : {}),
    ...(costratio !== undefined ? { costratio } : {}),
    reason: `The recorded usage crossed the user configured warning threshold of ${Math.round(ratio * 100)} percent${tokenratio !== undefined && tokenratio >= ratio ? ` at ${Math.round(tokenratio * 100)} percent of the token ceiling` : ""}${costratio !== undefined && costratio >= ratio ? ` at ${Math.round(costratio * 100)} percent of the cost ceiling` : ""}.`,
  };
}

/** Builds the cost estimate view of the configured providers: the projected cost per million tokens answers the user configured price of every provider and model pair beside the recorded tokens and cost of the usage records, so the surfaces show what a call costs before it runs — a pair without configured pricing answers zero instead of an invented number. */
export function costestimates(input: {
  configs: baseurlconfig[];
  providers: providerconfig[];
  records: usagerecord[];
}): costestimate[] {
  const pairs = new Map<string, costestimate>();
  const pricingof = (providerid: string, model: string): { permillion: number; currency?: string } | undefined => {
    const config = input.configs.find((entry) => entry.providerid === providerid);
    if (
      config !== undefined &&
      config.costpermilliontokens !== undefined &&
      Number.isFinite(config.costpermilliontokens)
    )
      return {
        permillion: config.costpermilliontokens,
        ...(config.currency !== undefined && config.currency.trim() !== "" ? { currency: config.currency.trim() } : {}),
      };
    const provider = input.providers.find((entry) => entry.id === providerid);
    if (
      provider !== undefined &&
      provider.costpermilliontokens !== undefined &&
      Number.isFinite(provider.costpermilliontokens) &&
      provider.models.includes(model)
    )
      return {
        permillion: provider.costpermilliontokens,
        ...(provider.currency !== undefined && provider.currency.trim() !== ""
          ? { currency: provider.currency.trim() }
          : {}),
      };
    return undefined;
  };
  for (const record of input.records) {
    const key = `${record.providerid}::${record.model}`;
    const entry = pairs.get(key) ?? {
      providerid: record.providerid,
      model: record.model,
      permillion: 0,
      recordedtokens: 0,
      recordedcost: 0,
    };
    entry.recordedtokens += record.totaltokens;
    entry.recordedcost += record.cost;
    const pricing = pricingof(record.providerid, record.model);
    if (pricing !== undefined) {
      entry.permillion = pricing.permillion;
      if (pricing.currency !== undefined) entry.currency = pricing.currency;
    }
    pairs.set(key, entry);
  }
  for (const provider of input.providers) {
    if (provider.costpermilliontokens === undefined || !Number.isFinite(provider.costpermilliontokens)) continue;
    for (const model of provider.models) {
      const key = `${provider.id}::${model}`;
      if (pairs.has(key)) continue;
      pairs.set(key, {
        providerid: provider.id,
        model,
        permillion: provider.costpermilliontokens,
        ...(provider.currency !== undefined && provider.currency.trim() !== ""
          ? { currency: provider.currency.trim() }
          : {}),
        recordedtokens: 0,
        recordedcost: 0,
      });
    }
  }
  return [...pairs.values()];
}

/** The reviewed default guard of the gateway plan answers: the goal, the steps array and the open questions the plan schema asks, with one retry before the refusal. */
export const gatewayplanguard: parseguard = {
  schema: {
    goal: { type: "string", required: true },
    steps: { type: "array", required: true },
    openquestions: { type: "array" },
  },
  retries: 1,
};

/** Builds the structured retry prompt of one refused model answer: the prompt names the schema the answer failed, quotes the failure reason of the guard and asks the model to answer with the corrected json object alone, so a retry teaches the shape instead of repeating the failure. */
export function guardretryprompt(output: modeloutput): string {
  return `Your previous answer failed its guard: ${output.reason ?? "the answer did not match the expected schema."} Answer again with a single json object that carries the required fields with their declared types — the goal as a string, the steps as an array of { kind, target, value, summary } objects using browser action kinds and the openquestions as an array of strings — and nothing else around it.`;
}

/** Runs the gateway guardrails over the model answer attempts: every attempt validates against the plan schema through the shared parse guard, the attempts cap at the user configured retry count, a valid attempt wins, a refusal marker refuses without retries and the exhaustion of every capped attempt refuses the output so nothing invalid ever reaches a plan — the structured retry prompt answers whenever a retry is left. */
export function gatewayguard(input: { guard?: parseguard; attempts: string[] }): {
  output: modeloutput;
  retryprompt?: string;
  cappedat: number;
} {
  const guard = input.guard ?? gatewayplanguard;
  const capcheck = gatewayretrycapvalid(guard.retries);
  if (!capcheck.allowed) throw new Error(capcheck.reason ?? "The configured retry cap failed its validation.");
  const cap = Math.max(1, Math.floor(guard.retries) + 1);
  const attempts = input.attempts.slice(0, cap);
  const output = guardoutput({ guard, attempts });
  if (output.verdict === "invalid" && attempts.length < cap)
    return { output, retryprompt: guardretryprompt(output), cappedat: cap };
  return { output, cappedat: cap };
}

/** The per task prompt templates of the gateway family: every template ships with its double braced variable slots and its version, the memory store keeps the versions and a template renders through the shared prompt library with its variables. */
export function gatewaytemplates(now: number): prompttemplate[] {
  return [
    {
      id: randomid(),
      name: "gateway.parsecommand",
      body: "Parse the user command into json with the fields intent (one of navigate, extract, fill, monitor, automate, ask), entities (an array of { name, value } objects) and confidence (a number between 0 and 1). The command: {{command}}. Answer with the json object only.",
      variables: ["command"],
      version: 1,
      notes: "The gateway parsecommand template of the 1.1.83 family.",
      createdat: now,
    },
    {
      id: randomid(),
      name: "gateway.draftplan",
      body: "Draft a browser agent plan for the goal {{goal}} as json with the fields goal (string), steps (an array of { kind, target, value, summary } objects using browser action kinds) and openquestions (an array of strings for what stays unclear). The tool catalog: {{tools}}. Answer with the json object only.",
      variables: ["goal", "tools"],
      version: 1,
      notes: "The gateway draftplan template of the 1.1.83 family.",
      createdat: now,
    },
    {
      id: randomid(),
      name: "gateway.replan",
      body: "The plan for {{goal}} failed at the steps {{failed}} with the reason {{reason}}. The completed steps stay: {{completed}}. Draft the revised tail steps as json with the field steps (an array of { kind, target, value, summary } objects using browser action kinds). Answer with the json object only.",
      variables: ["goal", "failed", "reason", "completed"],
      version: 1,
      notes: "The gateway replan template of the 1.1.83 family.",
      createdat: now,
    },
    {
      id: randomid(),
      name: "gateway.reflect",
      body: "Reflect on the executed step {{stepid}} of the run {{runid}} with the outcome: {{outcome}}. Answer as json with the fields outcome (string), lesson (string) and advice (string) for the next step. Answer with the json object only.",
      variables: ["stepid", "runid", "outcome"],
      version: 1,
      notes: "The gateway reflect template of the 1.1.83 family.",
      createdat: now,
    },
    {
      id: randomid(),
      name: "gateway.chat",
      body: "{{prompt}}",
      variables: ["prompt"],
      version: 1,
      notes:
        "The gateway chat template of the 1.1.83 family; the streamed answers render token by token in the sidepanel chat.",
      createdat: now,
    },
  ];
}

/** Composes one gateway prompt from a stored template and its variable values through the shared prompt library; a missing template name answers the reason so the caller refuses instead of sending a hollow prompt. */
export function composegatewayprompt(input: {
  templates: prompttemplate[];
  name: string;
  variables: Record<string, unknown>;
}): { text?: string; reason?: string } {
  const template = input.templates.find((entry) => entry.name === input.name);
  if (template === undefined) return { reason: `No stored prompt template answers the name ${input.name}.` };
  return rendertemplate({ template, variables: input.variables });
}

/** Assembles the streamed tokens of a gateway chat for incremental rendering: every poll reads the tokens past its cursor, the assembled text carries only the fresh batch and the done marker answers whether a finished stream delivered its last token — the sidepanel chat appends every batch as it arrives instead of waiting for the whole answer. */
export function streamrender(
  tokens: gatewaychattoken[],
  cursor: number,
  finished: boolean,
): { text: string; nextcursor: number; done: boolean } {
  const fresh = tokens.filter((token) => token.seq > cursor);
  const nextcursor = fresh.length > 0 ? (fresh[fresh.length - 1] as gatewaychattoken).seq : cursor;
  const last = tokens.length > 0 ? (tokens[tokens.length - 1] as gatewaychattoken).seq : 0;
  return { text: fresh.map((token) => token.text).join(""), nextcursor, done: finished && nextcursor >= last };
}

/** Builds one gateway chat state of a streamed exchange: the request id, the provider, the model, the prompt and the token list the panel polls through its cursor; the state never carries key material. */
export function gatewaychatstateof(input: {
  requestid: string;
  config: baseurlconfig;
  model: string;
  prompt: string;
  tokens?: gatewaychattoken[];
  done?: boolean;
  error?: gatewayerror;
  now: number;
}): gatewaychatstate {
  return {
    requestid: input.requestid,
    providerid: input.config.providerid,
    kind: input.config.kind,
    model: input.model,
    prompt: input.prompt,
    tokens: input.tokens ?? [],
    done: input.done === true,
    ...(input.error !== undefined ? { error: input.error } : {}),
    at: input.now,
  };
}

/** Reads whether one base url points at the local machine, shared with the llm provider model so the local marker of the usage records answers one rule. */
export function gatewayislocal(config: Pick<baseurlconfig, "baseurl">): boolean {
  return islocalorigin(config.baseurl);
}

/** Runs the reviewed budget check over the usage totals: the token and currency ceilings halt the run and ask the user, exactly as every model call of the llm family already does — the gateway calls pass the same budget gate. */
export function gatewaybudgetcheck(input: {
  budget: costbudget | undefined;
  totals: { totaltokens: number; cost: number };
}): { allowed: boolean; halted: boolean; asksuser: boolean; reason?: string } {
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
  try {
    origins = [new URL(baseurl).origin];
  } catch {
    /* a base url without a parsed origin keeps the raw text the user typed */
  }
  return { name, origins, header: "authorization", storageid, configuredat };
}
