/**
 * The llm module of the 1.1.90 consolidation: every correlated variation of the model routing and prompt library logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the llm family: llm holds the model call core of the 1.1.57 family (the shaped request building, the provider call through the transport seam, the local model path, the stream delta parsing, the command guard with intent classification and plan drafting, the replan on fail, the step reflection, the guardrail stripping, the parse output guard, the tool briefs and the usage accounting with its budget check); modelroute holds the routing table that resolves one request to its provider with fallback routes, provider marks and revision bumps; and promptlibrary holds the template library with its variables, rendering, saving, search and removal.
 * No provider, key or template is ever hardcoded: every route and prompt stays the user's choice, and no model call ever bypasses the consent gates.
 */

import type { commandentity, commandparse, costbudget, draftstep, intentkind, localmodelconfig, modelmessage, modeloutput, parseguard, plandraft, providerconfig, protocolstyle, reflectnote, replanrecord, tokenstream, tooldef, toolbrief, usagerecord, modelroute, policyevaluation, prompttemplate } from "./types.js";
import { planlint, egressconsentgate } from "./policy.js";
import { sendfetch, type fetchtransport } from "./http.js";
import { randomid } from "./memory.js";


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
export function buildrequest(input: { provider: { endpoint: string; style: protocolstyle; headers?: Record<string, string> }; model: string; messages: modelmessage[]; apikey?: string; temperature?: number; maxtokens?: number; stream?: boolean }): shapedrequest {
  const headers: Record<string, string> = { "content-type": "application/json" };
  let url = input.provider.endpoint;
  const style = input.provider.style;
  if (style === "chatcompletions") {
    if (input.apikey !== undefined && input.apikey.trim() !== "") headers.authorization = `Bearer ${input.apikey}`;
    const body: Record<string, unknown> = { model: input.model, messages: input.messages.map(message => ({ role: message.role, content: message.content })), ...(input.temperature !== undefined ? { temperature: input.temperature } : {}), ...(input.maxtokens !== undefined ? { "max_tokens": input.maxtokens } : {}), ...(input.stream === true ? { stream: true } : {}) };
    return { url, method: "POST", headers: { ...headers, ...(input.provider.headers ?? {}) }, body: JSON.stringify(body) };
  }
  if (style === "responses") {
    if (input.apikey !== undefined && input.apikey.trim() !== "") headers.authorization = `Bearer ${input.apikey}`;
    const system = input.messages.filter(message => message.role === "system").map(message => message.content).join("\n");
    const turns = input.messages.filter(message => message.role !== "system").map(message => ({ role: message.role === "assistant" ? "assistant" : "user", content: message.content }));
    const body: Record<string, unknown> = { model: input.model, input: turns, ...(system.trim() !== "" ? { instructions: system } : {}), ...(input.temperature !== undefined ? { temperature: input.temperature } : {}), ...(input.maxtokens !== undefined ? { "max_output_tokens": input.maxtokens } : {}), ...(input.stream === true ? { stream: true } : {}) };
    return { url, method: "POST", headers: { ...headers, ...(input.provider.headers ?? {}) }, body: JSON.stringify(body) };
  }
  if (style === "messages") {
    if (input.apikey !== undefined && input.apikey.trim() !== "") headers["x-api-key"] = input.apikey;
    const system = input.messages.filter(message => message.role === "system").map(message => message.content).join("\n");
    const turns = input.messages.filter(message => message.role !== "system").map(message => ({ role: message.role, content: message.content }));
    const body: Record<string, unknown> = { model: input.model, messages: turns, ...(system.trim() !== "" ? { system } : {}), ...(input.temperature !== undefined ? { temperature: input.temperature } : {}), ...(input.maxtokens !== undefined ? { "max_tokens": input.maxtokens } : {}), ...(input.stream === true ? { stream: true } : {}) };
    return { url, method: "POST", headers: { ...headers, ...(input.provider.headers ?? {}) }, body: JSON.stringify(body) };
  }
  if (input.apikey !== undefined && input.apikey.trim() !== "") url = `${url}${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(input.apikey)}`;
  const system = input.messages.filter(message => message.role === "system").map(message => message.content).join("\n");
  const turns = input.messages.filter(message => message.role !== "system").map(message => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] }));
  const body: Record<string, unknown> = { contents: turns, ...(system.trim() !== "" ? { systemInstruction: { parts: [{ text: system }] } } : {}), ...(input.temperature !== undefined ? { generationConfig: { temperature: input.temperature, ...(input.maxtokens !== undefined ? { maxOutputTokens: input.maxtokens } : {}) } } : input.maxtokens !== undefined ? { generationConfig: { maxOutputTokens: input.maxtokens } } : {}) };
  return { url, method: "POST", headers: { ...headers, ...(input.provider.headers ?? {}) }, body: JSON.stringify(body) };
}

/** Reads one number field of a parsed json object; a missing or non numeric field reports undefined. */
function numberof(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Parses one completion answer of the protocol style: the answer text and the usage counts; a malformed answer reports why nothing parsed. */
export function parsecompletion(style: protocolstyle, body: string): { text?: string; usage?: modelusage; reason?: string } {
  let parsed: unknown;
  try { parsed = JSON.parse(body); } catch { return { reason: "The provider answer is not json." }; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { reason: "The provider answer is not a json object." };
  const record = parsed as Record<string, unknown>;
  if (style === "chatcompletions") {
    const choice = Array.isArray(record.choices) ? record.choices[0] as Record<string, unknown> | undefined : undefined;
    const message = choice !== undefined && choice.message !== undefined && typeof choice.message === "object" ? choice.message as Record<string, unknown> : undefined;
    if (message === undefined || typeof message.content !== "string") return { reason: "The chat completions answer carries no message content." };
    const usage = record.usage !== undefined && typeof record.usage === "object" ? record.usage as Record<string, unknown> : undefined;
    const prompttokens = usage !== undefined ? numberof(usage["prompt_tokens"]) : undefined;
    const completiontokens = usage !== undefined ? numberof(usage["completion_tokens"]) : undefined;
    const totaltokens = usage !== undefined ? numberof(usage["total_tokens"]) : undefined;
    return { text: message.content, ...(prompttokens !== undefined || completiontokens !== undefined || totaltokens !== undefined ? { usage: { prompttokens: prompttokens ?? 0, completiontokens: completiontokens ?? 0, totaltokens: totaltokens ?? (prompttokens ?? 0) + (completiontokens ?? 0) } } : {}) };
  }
  if (style === "responses") {
    const direct = typeof record["output_text"] === "string" ? record["output_text"] : undefined;
    let text = direct;
    if (text === undefined && Array.isArray(record.output)) {
      const parts: string[] = [];
      for (const item of record.output) {
        if (item && typeof item === "object" && Array.isArray((item as Record<string, unknown>).content)) {
          for (const part of (item as Record<string, unknown>).content as unknown[]) {
            if (part && typeof part === "object" && (part as Record<string, unknown>).type === "output_text" && typeof (part as Record<string, unknown>).text === "string") parts.push((part as Record<string, unknown>).text as string);
          }
        }
      }
      if (parts.length > 0) text = parts.join("");
    }
    if (text === undefined) return { reason: "The responses answer carries no output text." };
    const usage = record.usage !== undefined && typeof record.usage === "object" ? record.usage as Record<string, unknown> : undefined;
    const prompttokens = usage !== undefined ? numberof(usage["input_tokens"]) : undefined;
    const completiontokens = usage !== undefined ? numberof(usage["output_tokens"]) : undefined;
    const totaltokens = usage !== undefined ? numberof(usage["total_tokens"]) : undefined;
    return { text, ...(prompttokens !== undefined || completiontokens !== undefined || totaltokens !== undefined ? { usage: { prompttokens: prompttokens ?? 0, completiontokens: completiontokens ?? 0, totaltokens: totaltokens ?? (prompttokens ?? 0) + (completiontokens ?? 0) } } : {}) };
  }
  if (style === "messages") {
    const parts: string[] = [];
    if (Array.isArray(record.content)) {
      for (const part of record.content) {
        if (part && typeof part === "object" && (part as Record<string, unknown>).type === "text" && typeof (part as Record<string, unknown>).text === "string") parts.push((part as Record<string, unknown>).text as string);
      }
    }
    if (parts.length === 0) return { reason: "The messages answer carries no text block." };
    const usage = record.usage !== undefined && typeof record.usage === "object" ? record.usage as Record<string, unknown> : undefined;
    const prompttokens = usage !== undefined ? numberof(usage["input_tokens"]) : undefined;
    const completiontokens = usage !== undefined ? numberof(usage["output_tokens"]) : undefined;
    return { text: parts.join(""), ...(prompttokens !== undefined || completiontokens !== undefined ? { usage: { prompttokens: prompttokens ?? 0, completiontokens: completiontokens ?? 0, totaltokens: (prompttokens ?? 0) + (completiontokens ?? 0) } } : {}) };
  }
  const candidate = Array.isArray(record.candidates) ? record.candidates[0] as Record<string, unknown> | undefined : undefined;
  const content = candidate !== undefined && candidate.content !== undefined && typeof candidate.content === "object" ? (candidate.content as Record<string, unknown>).parts : undefined;
  const parts: string[] = [];
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string") parts.push((part as Record<string, unknown>).text as string);
    }
  }
  if (parts.length === 0) return { reason: "The gemini answer carries no candidate text." };
  const usage = record.usageMetadata !== undefined && typeof record.usageMetadata === "object" ? record.usageMetadata as Record<string, unknown> : undefined;
  const prompttokens = usage !== undefined ? numberof(usage.promptTokenCount) : undefined;
  const completiontokens = usage !== undefined ? numberof(usage.candidatesTokenCount) : undefined;
  const totaltokens = usage !== undefined ? numberof(usage.totalTokenCount) : undefined;
  return { text: parts.join(""), ...(prompttokens !== undefined || completiontokens !== undefined || totaltokens !== undefined ? { usage: { prompttokens: prompttokens ?? 0, completiontokens: completiontokens ?? 0, totaltokens: totaltokens ?? (prompttokens ?? 0) + (completiontokens ?? 0) } } : {}) };
}

/** Returns true when the url points at a local machine endpoint: a loopback host keeps the model call inside the machine. */
export function islocalorigin(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]" || host.endsWith(".localhost");
  } catch { return false; }
}

/** Sends one completion request to a user configured provider: the request shapes per protocol style, the page content stays stripped unless the user granted it, a configured auth reference without a resolved key refuses the call and the answer parses per style with its usage counts; retries and backoff ride the reviewed fetch options. */
export async function callmodel(input: { provider: providerconfig; model: string; messages: modelmessage[]; apikey?: string; temperature?: number; maxtokens?: number; pagecontent?: string; pagegrant?: boolean; stream?: boolean; options?: { timeout?: number; retries?: number; backoff?: number; follow?: number }; transport: fetchtransport; sleep?: (milliseconds: number) => Promise<void>; now?: () => number }): Promise<{ text: string; usage?: modelusage; request: shapedrequest }> {
  if (input.provider.endpoint.trim() === "") throw new Error("The provider needs the user configured endpoint url before any call leaves.");
  if (input.provider.authref !== undefined && (input.apikey === undefined || input.apikey.trim() === "")) throw new Error(`The provider ${input.provider.name} references the stored key ${input.provider.authref.name} and the call needs the resolved key material.`);
  const consent = egressconsentgate({ ...(input.pagecontent !== undefined ? { pagecontent: input.pagecontent } : {}), granted: input.pagegrant === true });
  if (!consent.allowed) throw new Error(consent.reason ?? "The page content stayed ungranted and the call refused.");
  const shaped = buildrequest({ provider: input.provider, model: input.model, messages: input.messages, ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), ...(input.temperature !== undefined ? { temperature: input.temperature } : {}), ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}), ...(input.stream === true ? { stream: true } : {}) });
  const transport = await sendfetch({ request: { url: shaped.url, method: shaped.method, headers: shaped.headers, body: shaped.body }, ...(input.options !== undefined ? { options: input.options } : {}), transport: input.transport, ...(input.sleep !== undefined ? { sleep: input.sleep } : {}), ...(input.now !== undefined ? { now: input.now } : {}) });
  const parsed = parsecompletion(input.provider.style, transport.body);
  if (parsed.text === undefined) throw new Error(parsed.reason ?? "The provider answer did not parse.");
  return { text: parsed.text, ...(parsed.usage !== undefined ? { usage: parsed.usage } : {}), request: shaped };
}

/** Sends one completion request to the local model endpoint: the endpoint must stay local so the call never leaves the machine, the key stays optional because local runtimes need none and the answer parses per the configured style. */
export async function calllocal(input: { local: localmodelconfig; messages: modelmessage[]; apikey?: string; temperature?: number; maxtokens?: number; options?: { timeout?: number; retries?: number; backoff?: number; follow?: number }; transport: fetchtransport; sleep?: (milliseconds: number) => Promise<void>; now?: () => number }): Promise<{ text: string; usage?: modelusage; request: shapedrequest }> {
  if (input.local.endpoint.trim() === "") throw new Error("The local model needs the user configured endpoint url before any call runs.");
  if (!islocalorigin(input.local.endpoint)) throw new Error("The local model endpoint must stay a local machine address; the call never leaves the machine.");
  const provider: providerconfig = { id: "local", name: "The local model endpoint", endpoint: input.local.endpoint, style: input.local.style, models: [input.local.model], status: "available", createdat: 0 };
  return callmodel({ provider, model: input.local.model, messages: input.messages, ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), ...(input.temperature !== undefined ? { temperature: input.temperature } : {}), ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}), ...(input.options !== undefined ? { options: input.options } : {}), transport: input.transport, ...(input.sleep !== undefined ? { sleep: input.sleep } : {}), ...(input.now !== undefined ? { now: input.now } : {}) });
}

/** Parses one streaming event payload of the protocol style into its token text: the chat completions delta content, the responses output text delta, the messages content block text delta and the gemini candidate part text. */
export function streamdelta(style: protocolstyle, event: string): string {
  let parsed: unknown;
  try { parsed = JSON.parse(event); } catch { return ""; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return "";
  const record = parsed as Record<string, unknown>;
  if (style === "chatcompletions") {
    const choice = Array.isArray(record.choices) ? record.choices[0] as Record<string, unknown> | undefined : undefined;
    const delta = choice !== undefined && choice.delta !== undefined && typeof choice.delta === "object" ? (choice.delta as Record<string, unknown>).content : undefined;
    return typeof delta === "string" ? delta : "";
  }
  if (style === "responses") {
    if (record.type === "response.output_text.delta" && typeof record.delta === "string") return record.delta;
    return "";
  }
  if (style === "messages") {
    if (record.type === "content_block_delta" && record.delta !== undefined && typeof record.delta === "object" && typeof (record.delta as Record<string, unknown>).text === "string") return (record.delta as Record<string, unknown>).text as string;
    return "";
  }
  const candidate = Array.isArray(record.candidates) ? record.candidates[0] as Record<string, unknown> | undefined : undefined;
  const content = candidate !== undefined && candidate.content !== undefined && typeof candidate.content === "object" ? (candidate.content as Record<string, unknown>).parts : undefined;
  if (!Array.isArray(content)) return "";
  const parts: string[] = [];
  for (const part of content) {
    if (part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string") parts.push((part as Record<string, unknown>).text as string);
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
    if (payload === "[DONE]") { done = true; continue; }
    const text = streamdelta(style, payload);
    if (text === "") continue;
    seq += 1;
    tokens.push({ seq, text, done: false });
  }
  if (tokens.length > 0 && done) tokens[tokens.length - 1] = { ...tokens[tokens.length - 1] as tokenstream, done: true };
  return tokens;
}

/** Streams one completion request when the provider supports it: the request carries the stream flag of its style, the transport seam returns the server sent event body and the ordered tokens assemble into the answer text with its token count. */
export async function streammodel(input: { provider: providerconfig; model: string; messages: modelmessage[]; apikey?: string; temperature?: number; maxtokens?: number; pagecontent?: string; pagegrant?: boolean; options?: { timeout?: number; retries?: number; backoff?: number; follow?: number }; transport: fetchtransport; sleep?: (milliseconds: number) => Promise<void>; now?: () => number }): Promise<{ text: string; tokens: number; request: shapedrequest }> {
  if (input.provider.endpoint.trim() === "") throw new Error("The provider needs the user configured endpoint url before any call leaves.");
  if (input.provider.authref !== undefined && (input.apikey === undefined || input.apikey.trim() === "")) throw new Error(`The provider ${input.provider.name} references the stored key ${input.provider.authref.name} and the call needs the resolved key material.`);
  const consent = egressconsentgate({ ...(input.pagecontent !== undefined ? { pagecontent: input.pagecontent } : {}), granted: input.pagegrant === true });
  if (!consent.allowed) throw new Error(consent.reason ?? "The page content stayed ungranted and the call refused.");
  const shaped = buildrequest({ provider: input.provider, model: input.model, messages: input.messages, ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), ...(input.temperature !== undefined ? { temperature: input.temperature } : {}), ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}), stream: true });
  const transport = await sendfetch({ request: { url: shaped.url, method: shaped.method, headers: shaped.headers, body: shaped.body }, ...(input.options !== undefined ? { options: input.options } : {}), transport: input.transport, ...(input.sleep !== undefined ? { sleep: input.sleep } : {}), ...(input.now !== undefined ? { now: input.now } : {}) });
  const tokens = parsestream(input.provider.style, transport.body);
  if (tokens.length === 0) return { text: transport.body, tokens: 0, request: shaped };
  return { text: tokens.map(token => token.text).join(""), tokens: tokens.length, request: shaped };
}

/** The command parse guard schema: the intent kind, the entities array and the confidence number the parsed command answer carries. */
export const commandguard: parseguard = { schema: { intent: { type: "string", required: true }, entities: { type: "array", required: true }, confidence: { type: "number", required: true } }, retries: 1 };

/** Classifies one natural language request into its intent kind with a confidence score: the deterministic keyword scan works without any provider, the confidence rides the matched keyword density and an unmatched request classifies as ask with a low score. */
export function classifyintent(text: string): { intent: intentkind; confidence: number } {
  const words = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (words.length === 0) return { intent: "ask", confidence: 0 };
  const scores: Record<intentkind, number> = { navigate: 0, extract: 0, fill: 0, monitor: 0, automate: 0, ask: 0 };
  const keywords: Array<[intentkind, string[]]> = [
    ["navigate", ["go", "open", "visit", "navigate", "browse", "url", "site", "page", "to"]],
    ["extract", ["extract", "scrape", "collect", "read", "gather", "copy", "table", "data", "text"]],
    ["fill", ["fill", "type", "enter", "form", "submit", "login", "sign", "checkout", "field"]],
    ["monitor", ["watch", "monitor", "observe", "track", "alert", "notify", "poll", "changes"]],
    ["automate", ["automate", "workflow", "repeat", "every", "schedule", "batch", "pipeline", "steps", "then"]],
    ["ask", ["what", "who", "when", "where", "why", "how", "explain", "summarize", "ask", "question", "tell"]]
  ];
  for (const [intent, list] of keywords) for (const word of list) if (words.includes(word)) scores[intent] += 1;
  let best: intentkind = "ask";
  let bestscore = scores.ask;
  for (const [intent] of keywords) if (scores[intent] > bestscore) { best = intent; bestscore = scores[intent]; }
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const confidence = bestscore === 0 ? 0.1 : Math.min(1, Math.round(((bestscore / total) * 0.6 + Math.min(bestscore / 3, 1) * 0.4) * 100) / 100);
  return { intent: best, confidence };
}

/** Parses one natural language command into its structured result: the model call rides the routed provider, the answer passes the command guard with its retries and the parsed intent, entities and confidence land in the commandparse record; a model refusal reports why nothing parsed. */
export async function parsecommand(input: { provider: providerconfig; model: string; text: string; apikey?: string; transport: fetchtransport; sleep?: (milliseconds: number) => Promise<void>; now?: () => number; guard?: parseguard }): Promise<{ parse?: commandparse; output?: modeloutput; reason?: string }> {
  if (input.text.trim() === "") return { reason: "The command parse needs the natural language text." };
  const guard = input.guard ?? commandguard;
  const answer = await callmodel({ provider: input.provider, model: input.model, messages: [{ role: "system", content: "Parse the user command into json with the fields intent (one of navigate, extract, fill, monitor, automate, ask), entities (an array of { name, value } objects) and confidence (a number between 0 and 1). Answer with the json object only." }, { role: "user", content: input.text }], ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), transport: input.transport, ...(input.sleep !== undefined ? { sleep: input.sleep } : {}), ...(input.now !== undefined ? { now: input.now } : {}) });
  const output = guardoutput({ guard, attempts: [answer.text] });
  if (output.verdict !== "valid" || output.parsed === undefined) return { output, reason: output.reason ?? "The command answer failed its guard." };
  const parsed = output.parsed;
  if (typeof parsed.intent !== "string") return { output, reason: "The command answer carries no intent." };
  const intents: intentkind[] = ["navigate", "extract", "fill", "monitor", "automate", "ask"];
  if (!intents.includes(parsed.intent as intentkind)) return { output, reason: `The intent ${parsed.intent} is not one of the intent kinds.` };
  const entities: commandentity[] = Array.isArray(parsed.entities) ? parsed.entities.filter((entity): entity is commandentity => entity !== null && typeof entity === "object" && !Array.isArray(entity) && typeof (entity as commandentity).name === "string" && typeof (entity as commandentity).value === "string") : [];
  const confidence = typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence) ? Math.min(1, Math.max(0, parsed.confidence)) : 0;
  return { parse: { text: input.text, intent: parsed.intent as intentkind, entities, confidence, model: input.model, providerid: input.provider.id, parsedat: (input.now ?? Date.now)() }, output };
}

/** Builds one model drafted plan from a goal: the model call drafts the steps and open questions, the grammar lint checks every drafted step against the action grammar before review and the draft records its provider and model provenance; the draft never executes until the human review approves it. */
export async function draftplan(input: { provider: providerconfig; model: string; goal: string; origin?: string; lessons?: string[]; apikey?: string; transport: fetchtransport; sleep?: (milliseconds: number) => Promise<void>; now?: () => number }): Promise<{ draft?: plandraft; output?: modeloutput; reason?: string }> {
  if (input.goal.trim() === "") return { reason: "The plan draft needs the goal." };
  const lessons = input.lessons ?? [];
  const answer = await callmodel({ provider: input.provider, model: input.model, messages: [{ role: "system", content: `Draft a browser agent plan as json with the fields goal (string), steps (an array of { kind, target, value, summary } objects using browser action kinds) and openquestions (an array of strings for what stays unclear).${lessons.length > 0 ? ` The running lessons of the earlier steps: ${lessons.join(" | ")}.` : ""} Answer with the json object only.` }, { role: "user", content: input.goal }], ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), transport: input.transport, ...(input.sleep !== undefined ? { sleep: input.sleep } : {}), ...(input.now !== undefined ? { now: input.now } : {}) });
  const guard: parseguard = { schema: { goal: { type: "string", required: true }, steps: { type: "array", required: true }, openquestions: { type: "array" } }, retries: 1 };
  const output = guardoutput({ guard, attempts: [answer.text] });
  if (output.verdict !== "valid" || output.parsed === undefined) return { output, reason: output.reason ?? "The plan draft answer failed its guard." };
  const parsed = output.parsed;
  const rawsteps = Array.isArray(parsed.steps) ? parsed.steps : [];
  const steps: draftstep[] = rawsteps.filter((step): step is Record<string, unknown> => step !== null && typeof step === "object" && !Array.isArray(step)).map((step, index) => ({ id: `step${index + 1}`, kind: typeof step.kind === "string" ? step.kind : "", ...(typeof step.target === "string" && step.target.trim() !== "" ? { target: step.target } : {}), ...(typeof step.value === "string" && step.value.trim() !== "" ? { value: step.value } : {}), summary: typeof step.summary === "string" ? step.summary : "" }));
  const openquestions = Array.isArray(parsed.openquestions) ? parsed.openquestions.filter((question): question is string => typeof question === "string") : [];
  const draft: plandraft = { id: randomid(), goal: typeof parsed.goal === "string" && parsed.goal.trim() !== "" ? parsed.goal : input.goal, steps, openquestions, providerid: input.provider.id, model: input.model, state: "draft", lintfindings: [], createdat: (input.now ?? Date.now)() };
  draft.lintfindings = planlint(draft, input.origin ?? "");
  return { draft, output };
}

/** Regenerates the tail of a failed plan: the completed steps stay untouched, the failed steps fall away and the model drafted tail steps carry the fresh review marker so the human review approves every revised step again; the replan record keeps the failure reason and the model provenance. */
export async function replannonfail(input: { provider: providerconfig; model: string; draft: plandraft; completedstepids: string[]; failedstepids: string[]; reason: string; lessons?: string[]; apikey?: string; transport: fetchtransport; sleep?: (milliseconds: number) => Promise<void>; now?: () => number }): Promise<{ replan?: replanrecord; output?: modeloutput; reason?: string }> {
  if (input.reason.trim() === "") return { reason: "The replan needs the failure reason." };
  const completed = input.draft.steps.filter(step => input.completedstepids.includes(step.id));
  const failed = input.draft.steps.filter(step => input.failedstepids.includes(step.id));
  const lessons = input.lessons ?? [];
  const answer = await callmodel({ provider: input.provider, model: input.model, messages: [{ role: "system", content: `The plan ${input.draft.goal} failed at the steps ${failed.map(step => step.summary).join("; ") || "unknown"} with the reason: ${input.reason}. The completed steps stay: ${completed.map(step => step.summary).join("; ") || "none"}.${lessons.length > 0 ? ` The running lessons: ${lessons.join(" | ")}.` : ""} Draft the revised tail steps of the plan as json with the field steps (an array of { kind, target, value, summary } objects using browser action kinds). Answer with the json object only.` }, { role: "user", content: input.draft.goal }], ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), transport: input.transport, ...(input.sleep !== undefined ? { sleep: input.sleep } : {}), ...(input.now !== undefined ? { now: input.now } : {}) });
  const guard: parseguard = { schema: { steps: { type: "array", required: true } }, retries: 1 };
  const output = guardoutput({ guard, attempts: [answer.text] });
  if (output.verdict !== "valid" || output.parsed === undefined) return { output, reason: output.reason ?? "The replan answer failed its guard." };
  const rawsteps = Array.isArray(output.parsed.steps) ? output.parsed.steps : [];
  const tail: draftstep[] = rawsteps.filter((step): step is Record<string, unknown> => step !== null && typeof step === "object" && !Array.isArray(step)).map((step, index) => ({ id: `tail${index + 1}`, kind: typeof step.kind === "string" ? step.kind : "", ...(typeof step.target === "string" && step.target.trim() !== "" ? { target: step.target } : {}), ...(typeof step.value === "string" && step.value.trim() !== "" ? { value: step.value } : {}), summary: typeof step.summary === "string" ? step.summary : "", freshreview: true }));
  const replan: replanrecord = { id: randomid(), draftid: input.draft.id, completedstepids: [...input.completedstepids], failedstepids: [...input.failedstepids], tail, reason: input.reason, providerid: input.provider.id, model: input.model, state: "pending", createdat: (input.now ?? Date.now)() };
  return { replan, output };
}

/** Reflects one executed step: the model call reads the step outcome with the running lessons of the earlier steps and answers the lesson learned plus the advice for the next step; the note records its run, step and model provenance. */
export async function reflectstep(input: { provider: providerconfig; model: string; runid: string; stepid: string; outcome: string; lessons?: string[]; apikey?: string; transport: fetchtransport; sleep?: (milliseconds: number) => Promise<void>; now?: () => number }): Promise<{ note?: reflectnote; output?: modeloutput; reason?: string }> {
  if (input.outcome.trim() === "") return { reason: "The reflection needs the step outcome." };
  const lessons = input.lessons ?? [];
  const answer = await callmodel({ provider: input.provider, model: input.model, messages: [{ role: "system", content: `Reflect on the executed step ${input.stepid} of the run ${input.runid} with the outcome: ${input.outcome}.${lessons.length > 0 ? ` The running lessons of the earlier steps: ${lessons.join(" | ")}.` : ""} Answer as json with the fields outcome (string), lesson (string) and advice (string) for the next step. Answer with the json object only.` }, { role: "user", content: input.outcome }], ...(input.apikey !== undefined ? { apikey: input.apikey } : {}), transport: input.transport, ...(input.sleep !== undefined ? { sleep: input.sleep } : {}), ...(input.now !== undefined ? { now: input.now } : {}) });
  const guard: parseguard = { schema: { outcome: { type: "string", required: true }, lesson: { type: "string", required: true }, advice: { type: "string", required: true } }, retries: 1 };
  const output = guardoutput({ guard, attempts: [answer.text] });
  if (output.verdict !== "valid" || output.parsed === undefined) return { output, reason: output.reason ?? "The reflection answer failed its guard." };
  const parsed = output.parsed;
  if (typeof parsed.lesson !== "string" || typeof parsed.advice !== "string") return { output, reason: "The reflection answer carries no lesson or advice." };
  const note: reflectnote = { id: randomid(), runid: input.runid, stepid: input.stepid, outcome: typeof parsed.outcome === "string" ? parsed.outcome : input.outcome, lesson: parsed.lesson, advice: parsed.advice, providerid: input.provider.id, model: input.model, createdat: (input.now ?? Date.now)() };
  return { note, output };
}

/** Summarizes the running lessons of the reflection notes so the next prompt carries them; the newest lesson of every step rides the summary in step order. */
export function reflectionsummary(notes: reflectnote[]): string {
  const latest = new Map<string, reflectnote>();
  for (const note of notes) latest.set(note.stepid, note);
  const lessons = [...latest.values()].sort((one, two) => one.createdat - two.createdat).map(note => note.lesson);
  return lessons.length === 0 ? "" : lessons.join(" | ");
}

/** Strips the guardrail noise of one model answer before parsing: code fences open the payload, chatter lines around a json object fall away and a fenced block without a language tag keeps its inner text. The fence runs through plain index scans, because a regex over the fence prefix would backtrack polynomially on adversarial answers built from repeated fence markers. */
export function stripguardrails(text: string): string {
  let candidate = text;
  const open = text.indexOf("```");
  if (open !== -1) {
    let cursor = open + 3;
    while (cursor < text.length) { const tag = text[cursor] ?? ""; if (!((tag >= "a" && tag <= "z") || (tag >= "A" && tag <= "Z"))) break; cursor += 1; } /* the language tag, either case */
    while (cursor < text.length) { const space = text[cursor] ?? ""; if (space !== " " && space !== "\t" && space !== "\r" && space !== "\n") break; cursor += 1; } /* the whitespace after the tag */
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
  for (const marker of markers) if (marker.trim() !== "" && lowered.includes(marker.toLowerCase())) return { raw, verdict: "refused", reason: `The model answer carries the refusal marker ${marker}.`, attempts: 1 };
  let parsed: unknown;
  try { parsed = JSON.parse(stripped); } catch { return { raw, verdict: "invalid", reason: "The model answer is not json after the guardrail strip.", attempts: 1 }; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { raw, verdict: "invalid", reason: "The model answer is not a json object.", attempts: 1 };
  const record = parsed as Record<string, unknown>;
  for (const [name, field] of Object.entries(input.guard.schema)) {
    const value = record[name];
    if (value === undefined || value === null) {
      if (field.required === true) return { raw, verdict: "invalid", reason: `The required field ${name} of the expected schema is missing.`, attempts: 1 };
      continue;
    }
    const actual = Array.isArray(value) ? "array" : typeof value;
    if (actual !== field.type) return { raw, verdict: "invalid", reason: `The field ${name} carries a ${actual} value where the schema asks a ${field.type}.`, attempts: 1 };
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
  const exhausted: modeloutput = last === undefined ? { raw: "", verdict: "invalid", reason: "The model answer never arrived.", attempts: 0 } : { ...last, verdict: "invalid", reason: `${last.reason ?? "The model answer failed its guard."} Every retry attempt failed, so the guard refuses the output and nothing executes.` };
  return exhausted;
}

/** Builds the openapi style tool brief of one catalog tool: the name, the summary line, the description, the risk class and the typed parameter list with their required markers. */
export function toolbriefof(tool: tooldef): toolbrief {
  return { tool: tool.name, summary: `${tool.name}: ${tool.description.split(".")[0] ?? tool.description}.`, description: tool.description, risk: tool.risk, parameters: Object.entries(tool.inputschema.properties).map(([name, property]) => ({ name, type: property.type, description: property.description, required: property.required === true })) };
}

/** Renders the tool briefs in openapi style for model consumption: every tool lists its name, summary, risk class and typed parameters so the model knows the surface it may propose; the consent notice states that side effects need the named approved step. */
export function rendertoolbriefs(tools: tooldef[]): string {
  const blocks = tools.map(tool => {
    const brief = toolbriefof(tool);
    const parameters = brief.parameters.map(parameter => `    - name: ${parameter.name}\n      type: ${parameter.type}\n      required: ${parameter.required ? "true" : "false"}\n      description: ${parameter.description}`).join("\n");
    return `  - tool: ${brief.tool}\n    summary: ${brief.summary}\n    risk: ${brief.risk}\n    parameters:\n${parameters}`;
  });
  return `tools:\n${blocks.join("\n")}\nconsent: every tool with side effects executes only the approved plan step it names; a proposal without the approved step stays refused.`;
}

/** Records one usage entry of a model call: the run and step ids ride the record together with the provider, the endpoint, the model, the token counts and the cost; newer records prepend so the newest call reads first. */
export function addusage(records: usagerecord[], record: usagerecord): usagerecord[] {
  return [record, ...records];
}

/** Aggregates the usage records per run, per step, per session and per period: the prompt, completion and total token counts, the cost total and the call count of every record the filter keeps; the session filter of the 1.1.83 gateway family reports the per session totals beside the per run totals. */
export function usagetotals(records: usagerecord[], filter: { runid?: string; stepid?: string; sessionid?: string; since?: number; until?: number } = {}): { prompttokens: number; completiontokens: number; totaltokens: number; cost: number; calls: number } {
  const kept = records.filter(record => (filter.runid === undefined || record.runid === filter.runid) && (filter.stepid === undefined || record.stepid === filter.stepid) && (filter.sessionid === undefined || record.sessionid === filter.sessionid) && (filter.since === undefined || record.at >= filter.since) && (filter.until === undefined || record.at <= filter.until));
  return kept.reduce((totals, record) => ({ prompttokens: totals.prompttokens + record.prompttokens, completiontokens: totals.completiontokens + record.completiontokens, totaltokens: totals.totaltokens + record.totaltokens, cost: totals.cost + record.cost, calls: totals.calls + 1 }), { prompttokens: 0, completiontokens: 0, totaltokens: 0, cost: 0, calls: 0 });
}

/** Checks the cost budget of a run: a reached token or currency ceiling halts the run and asks the user before anything else runs, while an absent ceiling stays unbounded because every ceiling is a user choice. */
export function budgetcheck(input: { budget: costbudget | undefined; totals: { totaltokens: number; cost: number } }): { allowed: boolean; halted: boolean; asksuser: boolean; reason?: string } {
  if (input.budget === undefined) return { allowed: true, halted: false, asksuser: false };
  if (input.budget.maxtokens !== undefined && Number.isFinite(input.budget.maxtokens) && input.totals.totaltokens >= input.budget.maxtokens) return { allowed: false, halted: true, asksuser: true, reason: `The run reached the user configured token ceiling of ${input.budget.maxtokens} and halts until the user answers.` };
  if (input.budget.maxcost !== undefined && Number.isFinite(input.budget.maxcost) && input.totals.cost >= input.budget.maxcost) return { allowed: false, halted: true, asksuser: true, reason: `The run reached the user configured cost ceiling of ${input.budget.maxcost} and halts until the user answers.` };
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
  if (route.providerid.trim() === "") return { allowed: false, reason: "The model route needs the provider it routes to." };
  if (route.model.trim() === "") return { allowed: false, reason: "The model route needs the model name it routes to." };
  const hasfallbackprovider = route.fallbackproviderid !== undefined && route.fallbackproviderid.trim() !== "";
  const hasfallbackmodel = route.fallbackmodel !== undefined && route.fallbackmodel.trim() !== "";
  if (hasfallbackprovider !== hasfallbackmodel) return { allowed: false, reason: "The fallback of a model route needs its provider and its model together." };
  return { allowed: true };
}

/** Returns every route of one task kind in revision order, newest revision first. */
export function routesfor(routes: modelroute[], kind: string): modelroute[] {
  return routes.filter(route => route.kind === kind).sort((one, two) => two.revision - one.revision);
}

/** Resolves the provider and model for one task kind: the newest route of the kind whose provider exists and stays available wins; an unrouted kind, a missing provider or an unavailable provider reports why nothing routed. */
export function resolveroute(input: { routes: modelroute[]; providers: providerconfig[]; kind: string }): { route?: modelroute; provider?: providerconfig; model?: string; reason?: string } {
  const candidates = routesfor(input.routes, input.kind);
  if (candidates.length === 0) return { reason: `No model route configures the task kind ${input.kind}; the user picks the provider and model pair.` };
  for (const route of candidates) {
    if (!routevalid(route).allowed) continue;
    const provider = input.providers.find(candidate => candidate.id === route.providerid);
    if (provider === undefined) return { reason: `The route of ${input.kind} names the missing provider ${route.providerid}.` };
    if (provider.status === "unavailable") return { reason: `The provider ${provider.name} of the route of ${input.kind} stays marked unavailable from its last failure.` };
    if (!provider.models.includes(route.model)) return { reason: `The route of ${input.kind} names the model ${route.model} outside the model list of ${provider.name}.` };
    return { route, provider, model: route.model };
  }
  return { reason: `Every route of the task kind ${input.kind} failed its validation.` };
}

/** Marks one provider unavailable after a failed call or available after a successful test; every other provider stays untouched. */
export function markprovider(input: { providers: providerconfig[]; providerid: string; available: boolean; now: number }): providerconfig[] {
  return input.providers.map(provider => provider.id === input.providerid ? { ...provider, status: input.available ? "available" as const : "unavailable" as const, lastcheckedat: input.now } : provider);
}

/** Resolves the fallback pair of one task kind on refusal or outage: the user configured fallback provider and model win when they exist and stay available; a missing fallback reports why nothing fell back so the caller asks the user. */
export function fallbackroute(input: { routes: modelroute[]; providers: providerconfig[]; kind: string }): { route?: modelroute; provider?: providerconfig; model?: string; reason?: string } {
  const candidates = routesfor(input.routes, input.kind);
  const primary = candidates.find(route => routevalid(route).allowed);
  if (primary === undefined) return { reason: `No valid route configures the task kind ${input.kind}, so no fallback applies.` };
  if (primary.fallbackproviderid === undefined || primary.fallbackmodel === undefined) return { reason: `The route of ${input.kind} carries no user configured fallback pair.` };
  const provider = input.providers.find(candidate => candidate.id === primary.fallbackproviderid);
  if (provider === undefined) return { reason: `The fallback names the missing provider ${primary.fallbackproviderid}.` };
  if (provider.status === "unavailable") return { reason: `The fallback provider ${provider.name} stays marked unavailable from its last failure.` };
  if (!provider.models.includes(primary.fallbackmodel)) return { reason: `The fallback names the model ${primary.fallbackmodel} outside the model list of ${provider.name}.` };
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
export function rendertemplate(input: { template: prompttemplate; variables?: Record<string, unknown>; sensitive?: boolean; consentnotice?: string }): { text?: string; reason?: string } {
  if (input.sensitive === true && (input.consentnotice === undefined || input.consentnotice.trim() === "")) return { reason: "The sensitive flow needs its consent notice before the template renders." };
  const variables = input.variables ?? {};
  const missing = input.template.variables.filter(name => variables[name] === undefined || variables[name] === null || (typeof variables[name] === "string" && (variables[name] as string).trim() === ""));
  if (missing.length > 0) return { reason: `The template variables ${missing.join(", ")} stay empty.` };
  let text = input.template.body.replace(/\{\{\s*([a-z0-9]+)\s*\}\}/g, (whole, name: string) => {
    const value = variables[name];
    if (value === undefined || value === null) return whole;
    return typeof value === "string" ? value : JSON.stringify(value);
  });
  if (input.sensitive === true && input.consentnotice !== undefined) text = `${text}\nConsent notice: ${input.consentnotice}`;
  return { text };
}

/** Saves one template version: a new name creates the first version while a known name bumps the version with its change notes; every earlier version stays stored so the history never rewrites. */
export function savetemplate(input: { templates: prompttemplate[]; name: string; body: string; notes?: string; now: number }): prompttemplate[] {
  const existing = input.templates.filter(template => template.name === input.name);
  const version = existing.length === 0 ? 1 : Math.max(...existing.map(template => template.version)) + 1;
  const record: prompttemplate = { id: randomid(), name: input.name, body: input.body, variables: templatevariables(input.body), version, ...(input.notes !== undefined && input.notes.trim() !== "" ? { notes: input.notes } : {}), createdat: input.now };
  return [record, ...input.templates];
}

/** Returns the newest stored version of one template name; an unknown name reports undefined. */
export function latesttemplate(templates: prompttemplate[], name: string): prompttemplate | undefined {
  const versions = templates.filter(template => template.name === name);
  return versions.length === 0 ? undefined : versions.reduce((newest, template) => template.version > newest.version ? template : newest);
}

/** Searches the library: the query matches the template name, the body text, the change notes or one of the declared variables, newest version first. */
export function searchtemplates(templates: prompttemplate[], query: string): prompttemplate[] {
  const term = query.trim().toLowerCase();
  const matches = term === "" ? templates : templates.filter(template => template.name.toLowerCase().includes(term) || template.body.toLowerCase().includes(term) || (template.notes ?? "").toLowerCase().includes(term) || template.variables.some(variable => variable.toLowerCase().includes(term)));
  return [...matches].sort((one, two) => two.version - one.version || two.createdat - one.createdat);
}

/** Removes every version of one template name from the library; the change history leaves with the name. */
export function removetemplate(templates: prompttemplate[], name: string): prompttemplate[] {
  return templates.filter(template => template.name !== name);
}
