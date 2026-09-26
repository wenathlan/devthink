/**
 * v1/embeddings/route.ts
 *
 * zai v1 - openai-compatible embeddings endpoint (synthetic, 1536-dim).
 *
 * full pipeline:
 *   1. auto fix (levenshtein fuzzy matching on param names, clamp values)
 *   2. repasse (re-process after fixing, ensure defaults)
 *   3. construct payload manually (synthetic 1536-dim embeddings)
 *   4. construct headers in 5 content types (json, sse, plain, ndjson, binary)
 *   5. save to db all parameter values
 *   6. shared context + model switch every 6 messages
 *
 * the zai sdk does not expose an embeddings endpoint, so this route
 * generates synthetic 1536-dimensional embeddings deterministically
 * derived from the input text. no streaming, no thinking.
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

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { V1_MODELS, isv1model, PROVIDER } from "../models/route";

// ─── embedded sse-parser ─────────────────────────────────────────────
function safeparse(raw: string): Record<string, unknown> | null { try { return JSON.parse(raw) as Record<string, unknown>; } catch { return null; } }
function safestringify(val: unknown): string { try { return typeof val === "string" ? val : JSON.stringify(val); } catch { return String(val); } }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 2147483647;

// ─── 40 http methods ───────────────────────────────────────────────
const httpmethods40 = [
  "GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS","CONNECT","TRACE",
  "PROPFIND","PROPPATCH","MKCOL","COPY","MOVE","LOCK","UNLOCK","SEARCH",
  "PURGE","LINK","UNLINK","REPORT","CHECKOUT","CHECKIN","UNCHECKOUT",
  "VERSION_CONTROL","LABEL","MERGE","BASELINE_CONTROL","MKACTIVITY",
  "MKWORKSPACE","UPDATE","SUBSCRIBE","UNSUBSCRIBE","NOTIFY","POLL",
  "BIND","REBIND","UNBIND","REINDEX","ACL",
] as const;

// ─── cors headers ──────────────────────────────────────────────────
function corsheaders(extra?: Record<string, string>): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": httpmethods40.join(", "),
    "access-control-allow-headers": "content-type, authorization, x-request-id, x-session-id, x-api-key, accept, origin, user-agent, dnt, if-modified-since, if-none-match, range",
    "access-control-expose-headers": "x-request-id, x-response-id, x-session-id, x-rate-limit, x-rate-remaining",
    ...extra,
  };
}

function jsonheaders(extra?: Record<string, string>): Record<string, string> {
  return { "content-type": "application/json", ...corsheaders(extra) };
}

function sseheaders(extra?: Record<string, string>): Record<string, string> {
  return {
    "content-type": "text/event-stream",
    "cache-control": "no-cache, no-transform",
    "connection": "keep-alive",
    "x-accel-buffering": "no",
    ...corsheaders(extra),
  };
}

function ndjsonheaders(extra?: Record<string, string>): Record<string, string> {
  return {
    "content-type": "application/x-ndjson",
    "cache-control": "no-cache",
    "connection": "keep-alive",
    ...corsheaders(extra),
  };
}

function plainheaders(extra?: Record<string, string>): Record<string, string> {
  return { "content-type": "text/plain; charset=utf-8", ...corsheaders(extra) };
}

function binaryheaders(extra?: Record<string, string>): Record<string, string> {
  return { "content-type": "application/octet-stream", ...corsheaders(extra) };
}

// ─── response helpers ──────────────────────────────────────────────
function jsonresponse(body: unknown, status = 200, extra?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonheaders(extra) });
}

function errorresponse(status: number, message: string, type = "server_error"): Response {
  return jsonresponse({ error: { message, type } }, status);
}

function optionsresponse(): Response {
  return new Response(null, { status: 204, headers: corsheaders() });
}

// ─── id generation ─────────────────────────────────────────────────
function genid(prefix = ""): string {
  const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  return prefix ? `${prefix}-${id}` : id;
}

// ─── safe json (embedded) ─────────────────────

// ─── ip extraction ─────────────────────────────────────────────────
function getip(req: Request | NextRequest): string {
  const h = req.headers;
  return h.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? h.get("x-real-ip")
    ?? h.get("cf-connecting-ip")
    ?? "unknown";
}

// ─── sleep ─────────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── parse body (accepts any content type) ─────────────────────────
async function parsebody(req: Request): Promise<Record<string, unknown>> {
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return (await req.json()) as Record<string, unknown>;
    }
    if (ct.includes("text/plain") || ct.includes("text/event-stream")) {
      const text = await req.text();
      return safeparse(text) ?? { prompt: text };
    }
    if (ct.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      const obj: Record<string, unknown> = {};
      params.forEach((v, k) => { obj[k] = v; });
      return obj;
    }
    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      const obj: Record<string, unknown> = {};
      for (const [k, v] of fd.entries()) {
        if (typeof v === "string") { obj[k] = v; }
        else { obj[k] = `[file:${v.name}]`; }
      }
      return obj;
    }
    if (ct.includes("application/xml") || ct.includes("text/xml")) {
      const text = await req.text();
      return { prompt: text };
    }
    if (ct.startsWith("image/")) {
      const buf = await req.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      return { prompt: `[image:${ct};base64,${b64.slice(0, 256)}...]` };
    }
    if (ct.startsWith("audio/")) {
      const buf = await req.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      return { prompt: `[audio:${ct};base64,${b64.slice(0, 256)}...]` };
    }
    if (ct.startsWith("video/")) {
      const buf = await req.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      return { prompt: `[video:${ct};base64,${b64.slice(0, 256)}...]` };
    }
    if (ct.includes("application/octet-stream")) {
      const text = await req.text();
      return safeparse(text) ?? { prompt: text };
    }
    const text = await req.text();
    return safeparse(text) ?? { prompt: text };
  } catch {
    return {};
  }
}

// ─── sse emitter class ─────────────────────────────────────────────
const SSE_SPACING_MS = 200;

class sseinstance {
  private encoder = new TextEncoder();
  private controller: ReadableStreamDefaultController | null = null;
  private lastemit = 0;
  closed = false;
  response: Response;

  constructor(extra?: Record<string, string>) {
    const stream = new ReadableStream({ start: (ctrl) => { this.controller = ctrl; } });
    this.response = new Response(stream, { headers: sseheaders(extra) });
  }

  async emit(data: string): Promise<void> {
    if (this.closed || !this.controller) return;
    const now = Date.now();
    const elapsed = now - this.lastemit;
    if (this.lastemit > 0 && elapsed < SSE_SPACING_MS) await sleep(SSE_SPACING_MS - elapsed);
    this.lastemit = Date.now();
    try { this.controller.enqueue(this.encoder.encode(`data: ${data}\n\n`)); } catch { this.closed = true; }
  }

  emitnow(data: string): void {
    if (this.closed || !this.controller) return;
    try { this.controller.enqueue(this.encoder.encode(`data: ${data}\n\n`)); } catch { this.closed = true; }
  }

  keepalive(): void {
    if (this.closed || !this.controller) return;
    try { this.controller.enqueue(this.encoder.encode(": keepalive\n\n")); } catch { this.closed = true; }
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    try { this.controller?.close(); } catch {}
  }
}

function makesse(extra?: Record<string, string>): sseinstance { return new sseinstance(extra); }

// ─── ndjson emitter class ──────────────────────────────────────────
class ndjsoninstance {
  private encoder = new TextEncoder();
  private controller: ReadableStreamDefaultController | null = null;
  private lastemit = 0;
  closed = false;
  response: Response;

  constructor(extra?: Record<string, string>) {
    const stream = new ReadableStream({ start: (ctrl) => { this.controller = ctrl; } });
    this.response = new Response(stream, { headers: ndjsonheaders(extra) });
  }

  async emit(data: string): Promise<void> {
    if (this.closed || !this.controller) return;
    const now = Date.now();
    const elapsed = now - this.lastemit;
    if (this.lastemit > 0 && elapsed < SSE_SPACING_MS) await sleep(SSE_SPACING_MS - elapsed);
    this.lastemit = Date.now();
    try { this.controller.enqueue(this.encoder.encode(data + "\n")); } catch { this.closed = true; }
  }

  keepalive(): void {
    if (this.closed || !this.controller) return;
    try { this.controller.enqueue(this.encoder.encode("# keepalive\n")); } catch { this.closed = true; }
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    try { this.controller?.close(); } catch {}
  }
}

function makendjson(extra?: Record<string, string>): ndjsoninstance { return new ndjsoninstance(extra); }

// ─── clamp / tonumber ──────────────────────────────────────────────
function clamp(v: number, min: number, max: number): number { return Math.max(min, Math.min(max, v)); }
function tonumber(v: unknown): number { const n = Number(v); return Number.isFinite(n) ? n : 0; }

// ─── levenshtein / normkey ─────────────────────────────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}

function normkey(k: string): string { return k.toLowerCase().replace(/[-_\s]/g, ""); }

// ─── constants ───────────────────────────────────────────────────────
const ROUTE = "v1/embeddings";

const DEFAULT_EMBED_MODEL = "zai-synthetic-embedding-1536";
const DIM = 1536;
// validatechunk embedded

// ─── session context / model rotation ────────────────────────────────
async function getsessioncontext(sessionid: string) {
  const key = { sessionId: sessionid, provider: PROVIDER };
  let ctx = await db.sessionContext.findUnique({ where: { sessionId_provider: key } });
  if (!ctx) {
    ctx = await db.sessionContext.create({
      data: { ...key, messageCount: 0, rotationIndex: 0 },
    });
  }
  return ctx;
}

async function getrotationmodel(sessionid: string) {
  const ctx = await getsessioncontext(sessionid);
  const ri = Math.floor(ctx.messageCount / 6) % V1_MODELS.length;
  const model = V1_MODELS[ri];
  await db.sessionContext.update({
    where: { id: ctx.id },
    data: { messageCount: { increment: 1 }, model, rotationIndex: ri },
  });
  return { model, rotationindex: ri, messagenumber: ctx.messageCount + 1 };
}

// ─── auto fix ────────────────────────────────────────────────────────
const validparams = [
  "model", "input", "encodingformat", "dimensions", "user", "sessionid",
];

const normalizeparam = (name: string): string => {
  const k = normkey(name);
  if (validparams.includes(k)) return k;
  let best = k;
  let bestdist = Infinity;
  for (const v of validparams) {
    const d = levenshtein(k, v);
    if (d < bestdist) { bestdist = d; best = v; }
    if (d === 0) return v;
  }
  return bestdist <= 3 ? best : k;
};

const autofixparams = (body: Record<string, unknown>): { fixed: Record<string, unknown>; applied: string[] } => {
  const f: Record<string, unknown> = {};
  const applied: string[] = [];
  for (const [k, v] of Object.entries(body)) {
    const nk = normalizeparam(k);
    if (nk !== k.toLowerCase().replace(/[-_\s]/g, "")) applied.push(`${k}->${nk}`);
    f[nk] = v;
  }
  if (f.dimensions !== undefined) f.dimensions = clamp(tonumber(f.dimensions), 1, 3072);
  return { fixed: f, applied };
};

// ─── repasse ─────────────────────────────────────────────────────────
const repasse = (fixed: Record<string, unknown>): Record<string, unknown> => {
  const r = { ...fixed };
  if (!r.model || typeof r.model !== "string") r.model = DEFAULT_EMBED_MODEL;
  if (!r.input) r.input = [];
  if (!r.encodingformat) r.encodingformat = "float";
  return r;
};

// ─── input normalization ─────────────────────────────────────────────
const normalizeinputs = (input: unknown): string[] => {
  if (typeof input === "string") return [input];
  if (Array.isArray(input)) {
    return input.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        if (typeof o.text === "string") return o.text;
        if (typeof o.content === "string") return o.content;
      }
      return "";
    });
  }
  return [];
};

// ─── synthetic embedding ─────────────────────────────────────────────
function synthembed(text: string): number[] {
  const vec = new Float64Array(DIM);
  if (!text) { vec[0] = 1.0; return Array.from(vec); }
  for (let i = 0; i < text.length; i++) { vec[text.charCodeAt(i) % DIM] += 1.0; }
  for (let i = 0; i < text.length - 1; i++) {
    const pair = text.charCodeAt(i) * 31 + text.charCodeAt(i + 1);
    const idx = pair % DIM;
    vec[idx] += 0.5; vec[(DIM - 1) - idx] -= 0.25;
  }
  for (let i = 0; i < text.length - 2; i++) {
    const tri = text.charCodeAt(i) * 961 + text.charCodeAt(i + 1) * 31 + text.charCodeAt(i + 2);
    vec[tri % DIM] += 0.25;
  }
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    const avglen = words.reduce((s, w) => s + w.length, 0) / words.length;
    vec[Math.floor(avglen) % DIM] += 1.0;
    vec[text.length % DIM] += 0.5;
  }
  let norm = 0.0;
  for (let i = 0; i < DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) { for (let i = 0; i < DIM; i++) vec[i] = vec[i] / norm; }
  else { vec[0] = 1.0; }
  return Array.from(vec);
}

// ─── savedb ──────────────────────────────────────────────────────────
async function savedb(p: Record<string, unknown>): Promise<void> {
  try {
    await db.chatMessage.create({
      data: {
        role: "assistant",
        content: String(p.input ?? "").slice(0, 4000),
        route: "/v1/embeddings",
        provider: PROVIDER,
        model: String(p.model ?? DEFAULT_EMBED_MODEL),
        chatId: String(p.sessionid ?? `v1-${Date.now()}`),
        promptTokens: Number(p.inputcount ?? 0),
        completionTokens: 0,
        totalTokens: Number(p.inputcount ?? 0),
        allParams: safestringify(p.allparams ?? "").slice(0, 8192),
        allResponse: `[${p.inputcount ?? 0} embeddings x ${DIM} dims]`,
        durationMs: Number(p.latencyms ?? 0),
        finishReason: "stop",
        ip: String(p.ip ?? "unknown"),
        keyId: String(p.keyid ?? ""),
      },
    });
  } catch { /* best-effort */ }
}

// ─── POST handler ────────────────────────────────────────────────────
async function handlepost(req: NextRequest): Promise<Response> {
  const startms = Date.now();
  const ip = getip(req);
  const useragent = req.headers.get("user-agent") ?? "";
  const sessionid = req.headers.get("x-session-id") ?? `v1-${startms}-${Math.random().toString(36).slice(2, 8)}`;
  const requestid = req.headers.get("x-request-id") ?? genid("req");
  const accept = req.headers.get("accept") || "";

  // 1. parse body
  const body = await parsebody(req);

  // 2. auto fix
  const { fixed, applied } = autofixparams(body);

  // 3. repasse
  const rp = repasse(fixed);

  // 4. extract params
  const inputs = normalizeinputs(rp.input);
  if (inputs.length === 0) return errorresponse(400, "input is required", "invalid_request");

  const requestedmodel = typeof rp.model === "string" ? rp.model : DEFAULT_EMBED_MODEL;
  const encodingformat = typeof rp.encodingformat === "string" ? rp.encodingformat : "float";
  const autofixstr = applied.length > 0 ? applied.join("; ") : "";

  // 5. model rotation
  const { rotationindex, messagenumber } = await getrotationmodel(sessionid);

  const responseid = genid("emb");
  const created = Math.floor(Date.now() / 1000);

  const data = inputs.map((text, index) => {
    const embedding = synthembed(text);
    return {
      object: "embedding",
      index,
      embedding: encodingformat === "base64" ? Buffer.from(new Float32Array(embedding).buffer).toString("base64") : embedding,
    };
  });

  const totalchars = inputs.reduce((s, t) => s + t.length, 0);
  const inputtokens = Math.ceil(totalchars / 4);

  const response = {
    object: "list",
    data,
    model: requestedmodel,
    usage: { prompt_tokens: inputtokens, total_tokens: inputtokens },
  };

  void savedb({
    input: inputs.join("\n").slice(0, 4000),
    inputcount: inputs.length,
    model: requestedmodel,
    sessionid, responseid, requestid, allparams: body,
    latencyms: Date.now() - startms, ip, useragent, rotationindex, messagenumber,
    startms, autofixapplied: autofixstr, httpstatus: 200,
  });

  // 6. construct response based on accept header (5 content types)
  const wantsSSE = accept.includes("text/event-stream");
  const wantsPlain = accept.includes("text/plain");
  const wantsBinary = accept.includes("application/octet-stream");
  const wantsNDJSON = accept.includes("application/x-ndjson");

  // sse - stream each embedding as an event
  if (wantsSSE) {
    const sse = makesse();
    const keepalive = setInterval(() => { sse.keepalive(); }, 200);
    (async () => {
      try {
        for (const d of data) {
          await sse.emit(safestringify(d));
        }
        sse.emitnow("[DONE]");
      } finally {
        clearInterval(keepalive);
        if (!sse.closed) sse.close();
      }
    })();
    return sse.response;
  }

  // plain text - return embedding vectors as text
  if (wantsPlain) {
    const text = data.map((d) => Array.isArray(d.embedding) ? d.embedding.join(",") : String(d.embedding)).join("\n");
    return new Response(text, { status: 200, headers: plainheaders() });
  }
  // binary - return as buffer
  if (wantsBinary) {
    const buf = Buffer.from(safestringify(response), "utf-8");
    return new Response(buf, { status: 200, headers: binaryheaders() });
  }
  // ndjson - each embedding as a line
  if (wantsNDJSON) {
    const nd = makendjson();
    const keepalive = setInterval(() => { nd.keepalive(); }, 200);
    (async () => {
      try {
        for (const d of data) {
          await nd.emit(safestringify(d));
        }
      } finally {
        clearInterval(keepalive);
        if (!nd.closed) nd.close();
      }
    })();
    return nd.response;
  }
  // json (default)
  return jsonresponse(response);
}

// ─── 40 http methods ─────────────────────────────────────────────────
/** Handle POST request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function POST(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle GET request for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function GET(_req: NextRequest): Promise<Response> { return errorresponse(405, "method not allowed - use POST", "method_not_allowed"); }
/** Handle PUT request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function PUT(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle PATCH request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function PATCH(req: NextRequest): Promise<Response> { return handlepost(req); }
/** Handle DELETE request for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function DELETE(_req: NextRequest): Promise<Response> { return errorresponse(405, "method not allowed - use POST", "method_not_allowed"); }
/** Return headers only for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function HEAD(_req: NextRequest): Promise<Response> { return new Response(null, { status: 200, headers: corsheaders() }); }
/** Return CORS preflight response for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function OPTIONS(_req: NextRequest): Promise<Response> { return optionsresponse(); }
/** Handle CONNECT request for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function CONNECT(_req: NextRequest): Promise<Response> { return errorresponse(405, "method not allowed - use POST", "method_not_allowed"); }
/** Handle TRACE request for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function TRACE(_req: NextRequest): Promise<Response> { return errorresponse(405, "method not allowed - use POST", "method_not_allowed"); }

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
