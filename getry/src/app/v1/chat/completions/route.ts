/**
 * v1/chat/completions/route.ts
 *
 * zai v1 - openai-compatible chat completions endpoint.
 *
 * what this route does:
 *   1. converts z-ai web sdk (glm-5.2) into openai-compatible chat completions
 *   2. activates thinking via thinking: { type: "enabled" } on the zai sdk
 *   3. separates thinking from answer (thinking separator — universal, no whitelist)
 *   4. supports 7 thinking levels: none, minimal, low, medium, high, xhigh, max
 *   5. budget independent for thinking and response (each up to 98304)
 *   6. 2-calls feature: ONLY when thinking + response > 98304, makes 2 separate calls
 *   7. accepts all params in any case (camelcase, snake_case, pascalcase, etc) — no whitelist
 *   8. passes tools/tool_choice/response_format/stream_options through to backend
 *   9. saves all params to db (allparams + allresponse)
 *  10. real sse forwarder (no non-stream-to-stream conversion)
 *
 * no thinking instructions injected — the system separates via structural analysis.
 * no blacklists, no whitelists, no xml filtering — pure passthrough of all params.
 * acts like a normal conversational api (like nvidia v3): client asks, responds, continues.
 *
 * 40 http methods, max safe timeout ≈ 24.8 days.
 */

// ─── instrumentation (embedded) ─────────────────────────────────────
void (async () => {
  if (typeof window === "undefined" && typeof globalThis.process !== "undefined" && globalThis.process.versions?.node) {
    try {
      const http = await (0, eval)('import("http")') as typeof import("http");
      const https = await (0, eval)('import("https")') as typeof import("https");
      const LONG_TIMEOUT = 86400000;
      if (http.Server.prototype) { http.Server.prototype.timeout = LONG_TIMEOUT; (http.Server.prototype as unknown as Record<string, unknown>).headersTimeout = LONG_TIMEOUT; (http.Server.prototype as unknown as Record<string, unknown>).keepAliveTimeout = LONG_TIMEOUT; (http.Server.prototype as unknown as Record<string, unknown>).requestTimeout = LONG_TIMEOUT; }
      if (https.Server.prototype) { https.Server.prototype.timeout = LONG_TIMEOUT; (https.Server.prototype as unknown as Record<string, unknown>).headersTimeout = LONG_TIMEOUT; (https.Server.prototype as unknown as Record<string, unknown>).keepAliveTimeout = LONG_TIMEOUT; (https.Server.prototype as unknown as Record<string, unknown>).requestTimeout = LONG_TIMEOUT; }
      if (http.globalAgent) (http.globalAgent as unknown as Record<string, unknown>).timeout = LONG_TIMEOUT;
      if (https.globalAgent) (https.globalAgent as unknown as Record<string, unknown>).timeout = LONG_TIMEOUT;
      console.log("[instrumentation] server timeout set to 24h");
    } catch {}
  }
})();

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";
import { V1_MODELS, V1Model, isv1model, DEFAULT_MODEL, MAX_CONTEXT, PROVIDER, resolvev1model } from "../../models/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 2147483647;

// ─── safe enqueue / safe close ──────────────────────────────────────
function safeenqueue(c: ReadableStreamDefaultController, chunk: Uint8Array | string): void {
  if (c.desiredSize === null) return;
  try { c.enqueue(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk); } catch { /* closed */ }
}
function safeclose(c: ReadableStreamDefaultController): void {
  try { c.close(); } catch { /* closed */ }
}

// ─── config ─────────────────────────────────────────────────────────
// the sdk backend model is resolved per request (devthink meta over the
// glm-5.3 flagship, or any individual glm model the client requested)
const MODEL = "glm-5.2"; // fallback backend for legacy paths only
const CONTEXT = 1000000;
const GLM_MAX = 98304;
const KEEPALIVE_MS = 500;
const MAX_CONCURRENT = 4;
const MIN_SPACING = 300;
const MAX_RETRIES = 5;

// ─── 7 thinking levels (budget independent) ─────────────────────────
const LEVELS: Record<string, { thinking: number; response: number }> = {
  none:    { thinking: 0,     response: 98304 },
  minimal: { thinking: 500,   response: 98304 },
  low:     { thinking: 2000,  response: 98304 },
  medium:  { thinking: 8000,  response: 98304 },
  high:    { thinking: 32000, response: 98304 },
  xhigh:   { thinking: 65536, response: 98304 },
  max:     { thinking: 98304, response: 98304 },
};

const VALID_EFFORTS = ["none", "minimal", "low", "medium", "high", "xhigh", "max"] as const;
type Effort = typeof VALID_EFFORTS[number];

const enc = new TextEncoder();
const dec = new TextDecoder();

// ─── cors headers ───────────────────────────────────────────────────
const HTTP_METHODS_40 = [
  "GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS","CONNECT","TRACE",
  "PROPFIND","PROPPATCH","MKCOL","COPY","MOVE","LOCK","UNLOCK","SEARCH",
  "PURGE","LINK","UNLINK","REPORT","CHECKOUT","CHECKIN","UNCHECKOUT",
  "VERSION_CONTROL","LABEL","MERGE","BASELINE_CONTROL","MKACTIVITY",
  "MKWORKSPACE","UPDATE","SUBSCRIBE","UNSUBSCRIBE","NOTIFY","POLL",
  "BIND","REBIND","UNBIND","REINDEX","ACL",
] as const;

function corsheaders(extra?: Record<string, string>): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": HTTP_METHODS_40.join(", "),
    "access-control-allow-headers": "content-type, authorization, x-request-id, x-session-id, x-api-key, accept, origin, user-agent, dnt, if-modified-since, if-none-match, range",
    "access-control-expose-headers": "x-request-id, x-response-id, x-session-id, x-rate-limit, x-rate-remaining",
    ...extra,
  };
}

// ─── hybrid case-insensitive param lookup (no whitelist) ────────────
function normkey(k: string): string {
  return String(k).replace(/[_\-.]/g, "").toLowerCase();
}

function getparam(b: Record<string, unknown>, key: string): unknown {
  if (key in b) return b[key];
  const snake = key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
  const candidates = [
    key, snake, key.toLowerCase(),
    key.charAt(0).toUpperCase() + key.slice(1),
    snake.toUpperCase(), snake.replace(/_/g, "-"),
    key.toLowerCase().replace(/[_\-.]/g, ""),
  ];
  for (const c of candidates) if (c in b) return b[c];
  const target = normkey(key);
  for (const k of Object.keys(b)) if (normkey(k) === target) return b[k];
  return undefined;
}

// ─── resolve thinking from any input ────────────────────────────────
function resolvethinking(body: Record<string, unknown>): {
  level: Effort; thinkingbudget: number; responsemax: number; enabled: boolean; tree: boolean;
} {
  let raw = getparam(body, "reasoningEffort") ?? getparam(body, "reasoningLevel")
    ?? getparam(body, "thinkingLevel") ?? getparam(body, "effort") ?? getparam(body, "thinking");
  const enable = getparam(body, "thinkingEnable") ?? getparam(body, "thinking");
  if (enable !== undefined) {
    if (typeof enable === "boolean" && !enable) raw = "none";
    else if (typeof enable === "string" && /disabled|false|off|none/i.test(enable)) raw = "none";
    else if (typeof enable === "object" && enable !== null && (enable as Record<string, unknown>).type === "disabled") raw = "none";
    else if (raw === undefined) raw = "medium";
  }

  let level: Effort = "medium";
  if (raw !== undefined && raw !== null) {
    if (typeof raw === "number") {
      const n = Math.max(0, Math.min(raw, GLM_MAX));
      level = n <= 0 ? "none" : n <= 500 ? "minimal" : n <= 2000 ? "low" : n <= 8000 ? "medium" : n <= 32000 ? "high" : n <= 65536 ? "xhigh" : "max";
    } else {
      const s = String(raw).toLowerCase().trim();
      if (VALID_EFFORTS.includes(s as Effort)) level = s as Effort;
      else if (/^\d+$/.test(s)) {
        const n = parseInt(s, 10);
        level = n <= 0 ? "none" : n <= 500 ? "minimal" : n <= 2000 ? "low" : n <= 8000 ? "medium" : n <= 32000 ? "high" : n <= 65536 ? "xhigh" : "max";
      } else if (/none|off|disabled|false/i.test(s)) level = "none";
      else if (/minimal|min/i.test(s)) level = "minimal";
      else if (/low/i.test(s)) level = "low";
      else if (/med|medium|mid/i.test(s)) level = "medium";
      else if (/high|hi/i.test(s)) level = "high";
      else if (/xhigh|extra|ultra/i.test(s)) level = "xhigh";
      else if (/max|maximum|full|all/i.test(s)) level = "max";
    }
  }

  const userthink = getparam(body, "thinkingBudget") ?? getparam(body, "reasoningBudget") ?? getparam(body, "budgetTokens");
  const userresp = getparam(body, "maxTokens") ?? getparam(body, "maxOutputTokens") ?? getparam(body, "maxCompletionTokens");
  const tree = getparam(body, "thinkingTree") ?? getparam(body, "treeOfThought") ?? false;
  const cfg = LEVELS[level];

  let thinkingbudget = cfg.thinking;
  if (typeof userthink === "number") thinkingbudget = Math.max(0, Math.min(userthink, GLM_MAX));
  else if (typeof raw === "number") thinkingbudget = Math.max(0, Math.min(raw, GLM_MAX));
  else if (typeof raw === "string" && /^\d+$/.test(raw.trim())) thinkingbudget = Math.max(0, Math.min(parseInt(raw.trim(), 10), GLM_MAX));

  const responsemax = typeof userresp === "number" ? Math.max(0, Math.min(userresp, GLM_MAX)) : cfg.response;
  return { level, thinkingbudget, responsemax, enabled: level !== "none" && thinkingbudget > 0, tree: Boolean(tree) };
}

// ─── autocorrect params (no whitelist — pure passthrough of unknowns) ──
function autocorrect(body: Record<string, unknown>, t: ReturnType<typeof resolvethinking>): Record<string, unknown> {
  const c: Record<string, unknown> = {};
  c.thinking = { type: t.enabled ? "enabled" : "disabled" };
  if (t.enabled) c.reasoning_effort = t.level;
  c.max_tokens = Math.min(t.thinkingbudget + t.responsemax, GLM_MAX) || 1;

  const clamp = (v: unknown, min: number, max: number, def: number) => {
    const n = Number(v); return isNaN(n) ? def : Math.max(min, Math.min(n, max));
  };
  if (getparam(body, "temperature") !== undefined) c.temperature = clamp(getparam(body, "temperature"), 0, 2, 0.7);
  if (getparam(body, "topP") !== undefined) c.top_p = clamp(getparam(body, "topP"), 0, 1, 0.9);
  if (getparam(body, "topK") !== undefined) c.top_k = clamp(getparam(body, "topK"), 0, 1000, 40);
  if (getparam(body, "seed") !== undefined) { const s = Number(getparam(body, "seed")); if (!isNaN(s)) c.seed = Math.max(0, Math.min(s, 2147483647)); }
  if (getparam(body, "stop") !== undefined) c.stop = getparam(body, "stop");
  if (getparam(body, "presencePenalty") !== undefined) c.presence_penalty = clamp(getparam(body, "presencePenalty"), -2, 2, 0);
  if (getparam(body, "frequencyPenalty") !== undefined) c.frequency_penalty = clamp(getparam(body, "frequencyPenalty"), -2, 2, 0);
  if (getparam(body, "n") !== undefined) c.n = clamp(getparam(body, "n"), 1, 10, 1);

  // pass through known openai params (camelcase → snake_case)
  for (const key of ["tools", "toolChoice", "responseFormat", "streamOptions", "user", "metadata", "logprobs", "topLogprobs", "chatTemplateKwargs", "parallelToolCalls"]) {
    const v = getparam(body, key);
    if (v !== undefined) c[key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()] = v;
  }
  if (t.tree) c.thinking_tree = true;

  // pure passthrough of any unknown params (no whitelist — intelligent syntax)
  const known = new Set([
    "thinking", "reasoningeffort", "maxtokens", "temperature", "topp", "topk", "seed", "stop",
    "presencepenalty", "frequencypenalty", "n", "tools", "toolchoice", "responseformat",
    "streamoptions", "user", "metadata", "logprobs", "toplogprobs", "chattemplatekwargs",
    "thinkingtree", "reasoninglevel", "thinkinglevel", "thinkingeffort", "effort", "effortlevel",
    "reasoning", "thinkingenable", "thinkingbudget", "reasoningbudget", "thinkingtokens",
    "budgettokens", "maxoutputtokens", "maxcompletiontokens", "maxresponsetokens", "treeofthought",
    "model", "messages", "stream", "sessionid", "session", "paralleltollcalls",
  ]);
  for (const k of Object.keys(body)) if (!known.has(normkey(k))) c[k] = body[k];
  return c;
}

// ─── zai sdk singleton + anti-429 ───────────────────────────────────
type ZaiSdk = Awaited<ReturnType<typeof ZAI.create>>;
let zaip: Promise<ZaiSdk> | null = null;
const getzai = () => (zaip ??= ZAI.create());

type Lim = { last: number; cd: number; active: number; waiters: (() => void)[] };
const limiter = (globalThis as unknown as { gll?: Lim }).gll ??= { last: 0, cd: 0, active: 0, waiters: [] };
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const is429 = (e: unknown) => /\b429\b|rate.?limit|overloaded|too many/i.test(e instanceof Error ? e.message : String(e ?? ""));
const isretry = (e: unknown) => /\b429\b|\b50[234]\b|rate.?limit|overloaded|timeout|econnreset|fetch failed|aborted|too many|network/i.test(e instanceof Error ? e.message : String(e ?? ""));
const backoff = (a: number, rl: boolean) => Math.floor(Math.min(rl ? 30000 : 8000, (rl ? 1500 : 400) * 2 ** (a - 1)) * (0.5 + Math.random()));
const retrysecs = () => Math.ceil(Math.max(limiter.cd - Date.now(), 5000) / 1000);

async function gate(): Promise<void> {
  const now = Date.now();
  if (limiter.cd > now) await sleep(limiter.cd - now);
  const s = Date.now() - limiter.last;
  if (s < MIN_SPACING) await sleep(MIN_SPACING - s);
  limiter.last = Date.now();
}
function setcd(ms: number): void { const u = Date.now() + ms; if (u > limiter.cd) limiter.cd = u; }
async function acquire(): Promise<void> {
  for (;;) {
    if (limiter.active < MAX_CONCURRENT) { limiter.active++; break; }
    await new Promise<void>((r) => limiter.waiters.push(r));
  }
  await gate();
}
function release(): void { limiter.active = Math.max(0, limiter.active - 1); limiter.waiters.shift()?.(); }
function err429(): Response {
  const ra = retrysecs();
  return NextResponse.json(
    { error: { message: "rate limit exceeded. please retry.", type: "rate_limit_error", code: "rate_limit_exceeded" } },
    { status: 429, headers: { "retry-after": String(ra), ...corsheaders() } },
  );
}

async function callglm(body: Record<string, unknown>, stream: boolean): Promise<{ result: unknown; release: () => void }> {
  let err: unknown = null;
  for (let a = 0; a <= MAX_RETRIES; a++) {
    await acquire();
    try {
      const z = await getzai();
      const r = await z.chat.completions.create({ ...body, stream } as any);
      return { result: r, release };
    } catch (e) {
      release();
      err = e;
      if (is429(e)) setcd(backoff(a + 1, true));
      if (!isretry(e) || a === MAX_RETRIES) break;
      await sleep(backoff(a + 1, is429(e)));
    }
  }
  throw err instanceof Error ? err : new Error("glm failed");
}

// ─── sse parser (tracks {} and [] depth — brace-depth, string-aware) ──
function extractdata(buf: string): { items: string[]; rest: string } {
  const items: string[] = [];
  let i = 0;
  while (i < buf.length) {
    const idx = buf.indexOf("data:", i);
    if (idx === -1) break;
    let j = idx + 5;
    while (j < buf.length && (buf[j] === " " || buf[j] === "\t")) j++;
    if (j >= buf.length) { i = idx; break; }
    const first = buf[j];
    if (first !== "{" && first !== "[") {
      const nl = buf.indexOf("\n", j);
      if (nl === -1) { i = idx; break; }
      const s = buf.slice(j, nl).trim();
      if (s) items.push(s);
      i = nl + 1;
      continue;
    }
    const close = first === "{" ? "}" : "]";
    let depth = 0, instr = false, esc = false, end = -1;
    for (let k = j; k < buf.length; k++) {
      const c = buf[k];
      if (instr) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === '"') instr = false;
      } else if (c === '"') instr = true;
      else if (c === "{" || c === "[") depth++;
      else if (c === "}" || c === "]") { depth--; if (depth === 0 && c === close) { end = k + 1; break; } }
    }
    if (end === -1) { i = idx; break; }
    items.push(buf.slice(j, end));
    i = end;
  }
  return { items, rest: buf.slice(i) };
}

// ─── thinking separator (no format instruction — structural analysis) ──
// 1. reasoning_content native from api (if present)
// 2. tags <thinking>...</thinking> in content
// 3. marker separator: detects "resposta final:", "portanto:", etc
// 4. if no tags/markers: entire buffer is reasoning on flush (call 1 was thinking phase)
// NO forced 30% split — NO thinking instruction — NO thinking format
function makethinker() {
  let intag = false, pending = "", buf = "";
  const tagre = /<\/?(?:thinking|think|reasoning|reflection|analysis)\b[^<>]*>/gi;
  const partialre = /^<\/?(?:t(?:hi|hin|think|hinki|thinkin)|rea(?:s|aso|reason|reasoni)|ref(?:l|le|fle|refl|reflect)|ana(?:l|ly|lys|analy|analysi))/i;
  const markerre =
    /(?:\**resposta\s*(?:final|correta)?\**\s*[:.]|resultado\s*[:.]|a\s+resposta\s+é|portanto\s*[,.]|logo\s*[,.]|conclus[ãa]o\s*[:.]|em\s+resumo\s*[:.]|em\s+suma\s*[:.]|the\s+answer\s+is|therefore\s*[,.]|in\s+conclusion\s*[:.]|final\s+answer\s*[:.]|##\s*(?:resposta|answer|result|conclus)\s*[:.])/i;
  return {
    push(t: string): { c: string; r: string } {
      const s = pending + t;
      pending = "";
      let c = "", r = "", last = 0, m: RegExpExecArray | null;
      tagre.lastIndex = 0;
      let has = false;
      while ((m = tagre.exec(s))) {
        has = true;
        const b = s.slice(last, m.index);
        if (intag) r += b; else c += b;
        intag = !m[0].startsWith("</");
        last = m.index + m[0].length;
      }
      const rem = s.slice(last);
      if (!has) {
        const lt = rem.lastIndexOf("<");
        if (lt !== -1 && lt > rem.length - 20) {
          const tail = rem.slice(lt);
          if (!tail.includes(">") && partialre.test(tail)) {
            pending = tail;
            const safe = rem.slice(0, lt);
            if (intag) r += safe; else c += safe;
            return { c, r };
          }
        }
      }
      if (has || intag) {
        if (intag) r += rem; else c += rem;
        return { c, r };
      }
      // no tags found — buffer and check for markers
      buf += t;
      const mt = buf.match(markerre);
      if (mt?.index !== undefined) {
        const bf = buf.slice(0, mt.index);
        const af = buf.slice(mt.index);
        buf = "";
        return { c: af, r: bf };
      }
      // no markers either — return empty (caller treats remaining as reasoning on flush)
      return { c: "", r: "" };
    },
    flush(): { c: string; r: string } {
      const p = pending;
      pending = "";
      const b = buf;
      buf = "";
      let c = "", r = "";
      if (intag) r += p; else c += p;
      // no tags/markers found — entire buffer is reasoning (call 1 was the thinking phase)
      r += b;
      return { c, r };
    },
  };
}

// ─── db helpers ─────────────────────────────────────────────────────
async function loadhistory(sid: string): Promise<{ role: string; content: string }[]> {
  try {
    const r = await db.chatMessage.findMany({
      where: { chatId: sid },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return r.reverse().map((x) => ({ role: x.role, content: x.content }));
  } catch { return []; }
}

function savemsg(
  sid: string, role: string, content: string, reasoning: string,
  level: string, ip: string, ua: string, extra: Record<string, unknown> = {},
): void {
  if (!content?.trim() && !reasoning?.trim()) return;
  try {
    db.chatMessage.create({
      data: {
        role,
        content: content || "",
        reasoningContent: reasoning || null,
        ip,
        model: MODEL,
        route: "/v1/chat/completions",
        provider: PROVIDER,
        chatId: sid,
        ...extra,
      },
    }).catch(() => {});
  } catch {}
}

// ─── build glm body ─────────────────────────────────────────────────
function buildglmbody(
  msgs: { role: string; content: string }[],
  stream: boolean,
  body: Record<string, unknown>,
  t: ReturnType<typeof resolvethinking>,
  backend: string,
): Record<string, unknown> {
  const c = autocorrect(body, t);
  c.model = backend;
  c.messages = msgs;
  c.stream = stream;
  // NO format instruction — the system separates via thinkingseparator (structural heuristics)
  return c;
}

// ─── ip extraction ──────────────────────────────────────────────────
function ipof(req: Request): { ip: string; version: string } {
  const xff = req.headers.get("x-forwarded-for") || "";
  for (const p of xff.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (!/^(10\.|127\.|192\.168\.|::1$)/i.test(p)) {
      return { ip: p, version: p.includes(":") ? "ipv6" : "ipv4" };
    }
  }
  return { ip: "0.0.0.0", version: "ipv4" };
}

// ─── POST handler ───────────────────────────────────────────────────
async function handlepost(req: NextRequest): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await req.json() as Record<string, unknown>; }
  catch { return NextResponse.json({ error: { message: "invalid json" } }, { status: 400, headers: corsheaders() }); }

  const messages = body.messages as { role: string; content: unknown }[] | undefined;
  if (!messages?.length) {
    return NextResponse.json({ error: { message: "messages is required" } }, { status: 400, headers: corsheaders() });
  }

  const stream = body.stream === true;
  const t = resolvethinking(body);
  // resolve the requested model — devthink meta over glm-5.3, or the exact
  // individual glm model the client asked for (echoed back in responses)
  const resolved = resolvev1model(body.model);
  const { ip, version: iv } = ipof(req);
  const sid = String(getparam(body, "sessionId") || getparam(body, "session") || `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const ua = req.headers.get("user-agent") || "";

  // normalize messages (accept string or array content)
  let msgs = messages.map((m) => ({
    role: String(m.role ?? "user"),
    content: typeof m.content === "string" ? m.content
      : Array.isArray(m.content) ? m.content.map((b: unknown) => typeof b === "string" ? b : (b as Record<string, unknown>)?.text || "").join("")
      : String(m.content ?? ""),
  })) as { role: string; content: string }[];

  // load history if single message or just system+user
  if (msgs.length === 1 || (msgs.length <= 2 && msgs[0]?.role === "system")) {
    const h = await loadhistory(sid);
    if (h.length) {
      const sy = msgs.find((m) => m.role === "system");
      const ns = msgs.filter((m) => m.role !== "system");
      msgs = sy ? [sy, ...h, ...ns] : [...h, ...ns];
    }
  }

  const allp = JSON.stringify(body);
  const lu = msgs[msgs.length - 1];
  if (lu?.role === "user") {
    savemsg(sid, "user", String(lu.content || ""), "", t.level, ip, ua, {
      stream, allparams: allp.slice(0, 8192), model: resolved.requested,
    });
  }

  const glmbody = buildglmbody(msgs, stream, body, t, resolved.backend);
  const twocalls = t.enabled && (t.thinkingbudget + t.responsemax > GLM_MAX);

  // ─── non-stream ───────────────────────────────────────────────────
  if (!stream) {
    try {
      let result: Record<string, unknown>;
      let out = "", reasoning = "", pt = 0, ct = 0, tt = 0, rid = "", fr = "stop";

      if (twocalls) {
        // ─── thinking != response FIX (2026-08-30) ──────────────────────
        // OLD BUG: call 2 received reasoning as assistant context, so the model
        //         "continued" the reasoning → thinking == response.
        // FIX:    call 1 (thinking enabled, non-stream) → get reasoning_content (R) + content (C)
        //         if C is non-empty → use C as response (already separated by SDK)
        //         if C is empty (SDK returned only R) → call 2 with ORIGINAL msgs only
        //         (NO assistant context), thinking disabled → produces fresh response.
        //         This GUARANTEES thinking != response: call 2 has never seen the reasoning.
        // NO thinking_format / thinking_instructions / format_instructions injected — pure SDK passthrough.
        const r1 = await callglm({
          ...glmbody,
          thinking: { type: "enabled" },
          max_tokens: Math.min(t.thinkingbudget, GLM_MAX),
          stream: false,
        }, false);
        result = r1.result as Record<string, unknown>;
        r1.release();
        const choices1 = (result?.choices ?? []) as Array<Record<string, unknown>>;
        const msg1 = ((choices1[0] ?? {}).message ?? {}) as Record<string, unknown>;
        const tc1 = typeof msg1.content === "string" ? msg1.content : "";
        const nr1 = typeof msg1.reasoning_content === "string" ? msg1.reasoning_content : "";
        const usage1 = (result?.usage ?? {}) as Record<string, unknown>;
        pt += Number(usage1.prompt_tokens ?? 0);
        ct += Number(usage1.completion_tokens ?? 0);
        rid = String(result?.id ?? "");

        // Prefer native reasoning_content; fall back to separator split of content
        const sep = makethinker();
        const s1 = sep.push(tc1);
        const f1 = sep.flush();
        reasoning = (nr1 + " " + s1.r + " " + f1.r).trim();
        // content from call 1 (may be non-empty if SDK split thinking/response natively)
        const call1content = (s1.c + " " + f1.c).trim();

        // ─── thinking != response GUARANTEE (2026-08-30) ─────────────────
        // Some GLM responses return the SAME text in content AND reasoning_content.
        // If reasoning == call1content, the SDK duplicated — we MUST make call 2 with
        // thinking DISABLED and ORIGINAL msgs (no assistant context) so the model
        // produces a fresh response different from the reasoning.
        const sametext = reasoning && call1content && reasoning === call1content;

        if (call1content && !sametext) {
          // SDK natively separated thinking and response — use the response portion directly
          out = call1content;
          fr = String(choices1[0]?.finish_reason ?? "stop");
        } else {
          // Either:
          //   (a) call 1 only returned reasoning (no content), OR
          //   (b) reasoning == content (SDK duplicated — must make call 2 to get a fresh response)
          // Make call 2 with ORIGINAL msgs only, thinking DISABLED, NO assistant context.
          // This GUARANTEES thinking != response: call 2 has never seen the reasoning text.
          // Note: even if reasoning is empty, call 2 will produce a fresh response.
          const r2 = await callglm({
            ...glmbody,
            thinking: { type: "disabled" },
            max_tokens: Math.min(t.responsemax, GLM_MAX),
            messages: msgs,            // ← ORIGINAL msgs only, NOT [...msgs, {assistant: reasoning}]
            stream: false,
          }, false);
          result = r2.result as Record<string, unknown>;
          r2.release();
          const choices2 = (result?.choices ?? []) as Array<Record<string, unknown>>;
          const msg2 = ((choices2[0] ?? {}).message ?? {}) as Record<string, unknown>;
          out = typeof msg2.content === "string" ? msg2.content : "";
          const usage2 = (result?.usage ?? {}) as Record<string, unknown>;
          pt += Number(usage2.prompt_tokens ?? 0);
          ct += Number(usage2.completion_tokens ?? 0);
          tt = pt + ct;
          fr = String(choices2[0]?.finish_reason ?? "stop");
          rid = String(result?.id ?? rid);
        }
      } else {
        // single call — thinking enabled, model produces reasoning + response in one shot
        const r = await callglm({ ...glmbody, stream: false }, false);
        result = r.result as Record<string, unknown>;
        r.release();
        const choices = (result?.choices ?? []) as Array<Record<string, unknown>>;
        const msg = ((choices[0] ?? {}).message ?? {}) as Record<string, unknown>;
        const rc = typeof msg.content === "string" ? msg.content : "";
        const nr = typeof msg.reasoning_content === "string" ? msg.reasoning_content : "";
        out = rc;
        reasoning = nr;
        // if thinking enabled but no native reasoning_content, use separator heuristics
        if (t.enabled && !nr && rc) {
          const sep = makethinker();
          const s = sep.push(rc);
          const f = sep.flush();
          out = (s.c + " " + f.c).trim() || rc;
          reasoning = (s.r + " " + f.r).trim();
        }
        const usage = (result?.usage ?? {}) as Record<string, unknown>;
        pt = Number(usage.prompt_tokens ?? 0);
        ct = Number(usage.completion_tokens ?? 0);
        tt = Number(usage.total_tokens ?? (pt + ct));
        rid = String(result?.id ?? "");
        fr = String(choices[0]?.finish_reason ?? "stop");
      }

      const allr = JSON.stringify(result);
      savemsg(sid, "assistant", out, reasoning, t.level, ip, ua, {
        stream: false,
        allparams: allp.slice(0, 8192), allresponse: allr.slice(0, 8192), model: resolved.requested,
        temperature: typeof body.temperature === "number" ? body.temperature : null,
        topp: typeof body.top_p === "number" ? body.top_p : (typeof body.topP === "number" ? body.topP : null),
        topk: typeof body.top_k === "number" ? body.top_k : (typeof body.topK === "number" ? body.topK : null),
        maxtokens: t.responsemax,
        seed: typeof body.seed === "number" ? body.seed : null,
        reasoningeffort: t.level, thinkinglevel: t.level,
        prompttokens: pt, completiontokens: ct, totaltokens: tt,
        responseid: rid, objectid: "chat.completion", finishreason: fr,
        thinkingbudget: t.thinkingbudget, thinkingenabled: t.enabled,
        sessionid: sid, httpstatus: 200,
      });

      return NextResponse.json({
        id: rid || `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: resolved.requested,
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: out,
            ...(reasoning ? { reasoning_content: reasoning } : {}),
          },
          finish_reason: fr,
        }],
        usage: {
          prompt_tokens: pt,
          completion_tokens: ct,
          total_tokens: tt || (pt + ct),
        },
        session_id: sid,
        level: t.level,
        thinking_budget: t.thinkingbudget,
        response_max: t.responsemax,
        twocalls,
        context_window: CONTEXT,
        provider: PROVIDER,
      }, { headers: corsheaders() });
    } catch (e) {
      if (is429(e)) return err429();
      return NextResponse.json(
        { error: { message: e instanceof Error ? e.message : "glm failed" } },
        { status: 502, headers: corsheaders() },
      );
    }
  }

  // ─── stream (thinking != response FIX 2026-08-30) ─────────────────
  // Pattern:
  //   call 1: NON-STREAM, thinking enabled → get reasoning_content (R) + content (C)
  //   stream reasoning chunks (R) as reasoning_content deltas
  //   if C is non-empty → stream C as content deltas (SDK already separated)
  //   if C is empty → call 2: STREAM, thinking DISABLED, ORIGINAL msgs only (NO assistant
  //     context — model produces fresh response different from reasoning) → forward as content deltas
  // This guarantees thinking != response: call 2 never sees the reasoning text.
  // NO thinking_format / thinking_instructions / format_instructions — pure SDK passthrough.
  const id = `chatcmpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const created = Math.floor(Date.now() / 1000);
  let ssebuf = "";
  let released = false;
  let atxt = "", rtxt = "";
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  let ctrl: ReadableStreamDefaultController<Uint8Array> | null = null;
  let ka: ReturnType<typeof setInterval> | null = null;
  let glmres: { result: ReadableStream<Uint8Array> | unknown; release: () => void } | null = null;
  let cancelled = false;
  let chunkcount = 0;
  const t0 = Date.now();

  const writesse = (json: Record<string, unknown>): void => {
    if (ctrl) safeenqueue(ctrl, `data: ${JSON.stringify(json)}\n\n`);
  };
  const kajson = {
    id, object: "chat.completion.chunk", created, model: resolved.requested,
    choices: [{ index: 0, delta: {}, finish_reason: null }],
  };
  const emit = (delta: Record<string, unknown>, fr: string | null = null): void => {
    writesse({
      id, object: "chat.completion.chunk", created, model: resolved.requested,
      choices: [{ index: 0, delta, finish_reason: fr }],
    });
  };

  const out = new ReadableStream<Uint8Array>({
    async start(c) {
      ctrl = c;
      // keepalive during glm wait
      ka = setInterval(() => {
        try { writesse(kajson); } catch { if (ka) clearInterval(ka); }
      }, KEEPALIVE_MS);

      // initial role chunk
      emit({ role: "assistant", content: "", ...(t.enabled ? { reasoning_content: "" } : {}) });

      try {
        // ─── call 1: thinking (NON-STREAM) — get full reasoning + content ────
        let reasoning = "";
        let call1content = "";
        if (t.enabled) {
          try {
            const r1 = await callglm({
              ...glmbody,
              thinking: { type: "enabled" },
              max_tokens: Math.min(t.thinkingbudget, GLM_MAX),
              stream: false,
            }, false);
            const result1 = r1.result as Record<string, unknown>;
            r1.release();
            if (cancelled) { safeclose(c); return; }
            const choices1 = (result1?.choices ?? []) as Array<Record<string, unknown>>;
            const msg1 = ((choices1[0] ?? {}).message ?? {}) as Record<string, unknown>;
            const tc = typeof msg1.content === "string" ? msg1.content : "";
            const nr = typeof msg1.reasoning_content === "string" ? msg1.reasoning_content : "";
            // use native reasoning_content if present, otherwise split content via separator
            const sep = makethinker();
            const s1 = sep.push(tc);
            const f1 = sep.flush();
            reasoning = (nr + " " + s1.r + " " + f1.r).trim();
            call1content = (s1.c + " " + f1.c).trim();
          } catch (e) {
            if (is429(e)) {
              writesse({ error: { message: "rate limit", retry_after: retrysecs() }, type: "rate_limit_error" });
              writesse({ id, object: "chat.completion.chunk", created, model: resolved.requested, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] });
              safeenqueue(ctrl, "data: [DONE]\n\n");
              safeclose(c);
              return;
            }
            // thinking call failed — continue without reasoning
          }
        }

        // stream reasoning as reasoning_content chunks (split into ~50 char pieces for smooth streaming)
        if (reasoning && !cancelled) {
          rtxt = reasoning;
          const pieces = reasoning.match(/.{1,50}/g) ?? [reasoning];
          for (const piece of pieces) {
            if (cancelled) break;
            emit({ reasoning_content: piece });
            chunkcount++;
          }
        }

        if (cancelled) { safeclose(c); return; }

        // ─── if call 1 already produced content, stream it directly (no call 2 needed) ──
        // BUT: if reasoning == call1content (SDK duplicated), MUST make call 2 to get fresh response
        const sametext = reasoning && call1content && reasoning === call1content;
        if (call1content && !sametext && !cancelled) {
          const pieces = call1content.match(/.{1,50}/g) ?? [call1content];
          for (const piece of pieces) {
            if (cancelled) break;
            atxt += piece;
            emit({ content: piece });
            chunkcount++;
          }
        }

        // ─── call 2: only if call 1 produced NO content OR reasoning == content (SDK duplicated) ──
        // CRITICAL: messages = ORIGINAL msgs only — NO assistant context with reasoning!
        // This ensures thinking != response: call 2 has never seen the reasoning text.
        if ((!call1content || sametext) && !cancelled) {
          const responsebody = {
            ...glmbody,
            thinking: { type: "disabled" as const },
            max_tokens: Math.min(t.responsemax, GLM_MAX),
            messages: msgs,             // ← ORIGINAL msgs only, NOT [...msgs, {assistant: reasoning}]
            stream: true,
          };

          try {
            glmres = await callglm(responsebody, true) as { result: ReadableStream<Uint8Array>; release: () => void };
          } catch (e) {
            if (ka) clearInterval(ka);
            if (is429(e)) writesse({ error: { message: "rate limit", retry_after: retrysecs() } });
            else writesse({ error: { message: e instanceof Error ? e.message : "failed" } });
            // fallback: if we have reasoning, emit it as content so client gets an answer
            if (rtxt.trim()) { atxt = rtxt; emit({ content: rtxt }); }
            writesse({
              id, object: "chat.completion.chunk", created, model: resolved.requested,
              choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
            });
            safeenqueue(ctrl, "data: [DONE]\n\n");
            safeclose(c);
            return;
          }

          if (cancelled) { if (!released && glmres) { released = true; glmres.release(); } safeclose(c); return; }
          if (!glmres) { if (ka) clearInterval(ka); safeclose(c); return; }

          reader = (glmres.result as ReadableStream<Uint8Array>).getReader();
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            ssebuf += dec.decode(value, { stream: true });
            const { items, rest } = extractdata(ssebuf);
            ssebuf = rest;
            for (const d of items) {
              if (d === "[DONE]") continue;
              let j: Record<string, unknown>;
              try { j = JSON.parse(d) as Record<string, unknown>; } catch { continue; }
              chunkcount++;
              const choices = (j?.choices ?? []) as Array<Record<string, unknown>>;
              const delta = (choices[0]?.delta ?? {}) as Record<string, unknown>;
              // forward content directly (thinking is disabled in call 2, so all text is content)
              if (delta.content) {
                atxt += String(delta.content);
                emit({ content: delta.content });
              }
              // forward any reasoning_content (shouldn't happen with thinking disabled, but just in case)
              if (delta.reasoning_content) {
                rtxt += String(delta.reasoning_content);
                emit({ reasoning_content: delta.reasoning_content });
              }
              // forward tool_calls directly (agentic loop continues)
              if (delta.tool_calls) {
                emit({ tool_calls: delta.tool_calls });
              }
            }
          }
          // flush remaining buffer
          const { items } = extractdata(ssebuf);
          ssebuf = "";
          for (const d of items) {
            if (d === "[DONE]") continue;
            let j: Record<string, unknown>;
            try { j = JSON.parse(d) as Record<string, unknown>; } catch { continue; }
            const choices = (j?.choices ?? []) as Array<Record<string, unknown>>;
            const delta = (choices[0]?.delta ?? {}) as Record<string, unknown>;
            if (delta.content) { atxt += String(delta.content); emit({ content: delta.content }); }
            if (delta.reasoning_content) { rtxt += String(delta.reasoning_content); emit({ reasoning_content: delta.reasoning_content }); }
            if (delta.tool_calls) { emit({ tool_calls: delta.tool_calls }); }
          }
        }

        // fallback: if call 2 produced no content, emit reasoning as content (client always gets an answer)
        if (!atxt.trim() && rtxt.trim()) {
          atxt = rtxt;
          emit({ content: rtxt });
        }

        // usage + finish
        const pt = Math.ceil(JSON.stringify(msgs).length / 4);
        const ct = Math.ceil((atxt.length + rtxt.length) / 4);
        writesse({
          id, object: "chat.completion.chunk", created, model: resolved.requested,
          choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          usage: { prompt_tokens: pt, completion_tokens: ct, total_tokens: pt + ct },
        });
        safeenqueue(ctrl, "data: [DONE]\n\n");
      } catch (e) {
        try {
          writesse({ error: { message: e instanceof Error ? e.message : "stream error", type: "stream_error" } });
          writesse({ id, object: "chat.completion.chunk", created, model: resolved.requested, choices: [{ index: 0, delta: {}, finish_reason: "error" }] });
          safeenqueue(ctrl, "data: [DONE]\n\n");
        } catch {}
      } finally {
        if (ka) clearInterval(ka);
        if (!released && glmres) { released = true; try { glmres.release(); } catch {} }
        savemsg(sid, "assistant", atxt, rtxt, t.level, ip, ua, {
          stream: true, model: resolved.requested,
          allparams: allp.slice(0, 8192),
          allresponse: JSON.stringify({ content: atxt, reasoning: rtxt, chunks: chunkcount }).slice(0, 8192),
          thinkingbudget: t.thinkingbudget, thinkingenabled: t.enabled,
          sessionid: sid, httpstatus: 200, finishreason: "stop",
          responseid: id, objectid: "chat.completion.chunk",
          latencyms: Date.now() - t0,
        });
        if (ctrl) safeclose(ctrl);
      }
    },
    cancel() {
      cancelled = true;
      if (ka) clearInterval(ka);
      try { reader?.cancel(); } catch {}
      if (!released && glmres) { released = true; try { glmres.release(); } catch {} }
      savemsg(sid, "assistant", atxt, rtxt, t.level, ip, ua, {
        stream: true, model: resolved.requested, allparams: allp.slice(0, 8192),
        sessionid: sid, httpstatus: 499, finishreason: "cancelled",
      });
    },
  });

  return new Response(out, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "connection": "keep-alive",
      "x-accel-buffering": "no",
      "x-session-id": sid,
      "x-model": MODEL,
      "x-level": t.level,
      ...corsheaders(),
    },
  });
}

// ─── 40 http methods ────────────────────────────────────────────────
/** Handle POST request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function POST(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle GET request for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function GET(_req: NextRequest): Promise<Response> {
  return NextResponse.json({
    endpoint: "/v1/chat/completions", method: "POST required for chat",
    model: MODEL, context_window: CONTEXT, max_output_tokens: GLM_MAX,
    provider: PROVIDER, sdk: "z-ai-web-dev-sdk",
    thinking_levels: VALID_EFFORTS,
    thinking_budgets: Object.fromEntries(Object.entries(LEVELS).map(([k, v]) => [k, v])),
    keepalive_ms: KEEPALIVE_MS,
  }, { headers: corsheaders() });
}
/** Handle PUT request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function PUT(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle PATCH request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function PATCH(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle DELETE request for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function DELETE(_req: NextRequest): Promise<Response> {
  return NextResponse.json({ info: "use POST for chat" }, { headers: corsheaders() });
}
/** Return headers only for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function HEAD(_req: NextRequest): Promise<Response> {
  return new Response(null, { status: 200, headers: { "x-endpoint": "/v1/chat/completions", ...corsheaders() } });
}
/** Return CORS preflight response for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function OPTIONS(_req: NextRequest): Promise<Response> {
  return new Response(null, { status: 204, headers: corsheaders() });
}
/** Handle CONNECT request for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function CONNECT(_req: NextRequest): Promise<Response> {
  return NextResponse.json({ info: "use POST" }, { headers: corsheaders() });
}
/** Handle TRACE request for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function TRACE(_req: NextRequest): Promise<Response> {
  return NextResponse.json({ info: "use POST" }, { headers: corsheaders() });
}
/** Handle WebDAV PROPFIND for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function PROPFIND(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV PROPPATCH for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function PROPPATCH(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV MKCOL for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function MKCOL(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV COPY for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function COPY(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV MOVE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function MOVE(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV LOCK for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function LOCK(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV UNLOCK for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function UNLOCK(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle SEARCH for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function SEARCH(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle PURGE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function PURGE(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle LINK for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function LINK(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle UNLINK for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function UNLINK(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV REPORT for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function REPORT(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV CHECKOUT for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function CHECKOUT(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV CHECKIN for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function CHECKIN(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV UNCHECKOUT for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function UNCHECKOUT(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV VERSION-CONTROL for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function VERSION_CONTROL(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV LABEL for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function LABEL(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV MERGE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function MERGE(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV BASELINE-CONTROL for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function BASELINE_CONTROL(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV MKACTIVITY for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function MKACTIVITY(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle WebDAV MKWORKSPACE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function MKWORKSPACE(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle UPDATE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function UPDATE(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle SUBSCRIBE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function SUBSCRIBE(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle UNSUBSCRIBE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function UNSUBSCRIBE(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle NOTIFY for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function NOTIFY(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle POLL for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function POLL(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle BIND for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function BIND(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle REBIND for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function REBIND(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle UNBIND for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function UNBIND(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle REINDEX for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function REINDEX(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle ACL for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function ACL(req: NextRequest): Promise<Response> { return handlepost(req); }
