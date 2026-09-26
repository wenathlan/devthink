/**
 * v1/keys/route.ts
 *
 * zai v1 - key management stub.
 *
 * full pipeline:
 *   1. construct payload manually (keyless status)
 *   2. construct headers in 5 content types (json, sse, plain, ndjson, binary)
 *   3. save to db all parameter values
 *   4. shared context + model switch every 6 messages
 *
 * the zai sdk is configured via /etc/.z-ai-config and does not require
 * any client-supplied api key. this endpoint exists for openai client
 * compatibility and always returns a "keyless" status.
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
import { V1_MODELS, isv1model, DEFAULT_MODEL, PROVIDER } from "../models/route";

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

// ─── 5 content types ──────────────────────────────────────────────
const contenttypes = {
  json: "application/json",
  sse: "text/event-stream",
  plain: "text/plain",
  ndjson: "application/x-ndjson",
  binary: "application/octet-stream",
} as const;

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
const ROUTE = "v1/keys";

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

// ─── keyless status ──────────────────────────────────────────────────
function keylessstatus(): Record<string, unknown> {
  return {
    provider: PROVIDER,
    route: "v1",
    keyless: true,
    message: "v1 (zai sdk) is configured server-side via /etc/.z-ai-config and requires no client-supplied api key. all requests to /v1/* are accepted without an authorization header.",
    keys: [],
    count: 0,
    active: 0,
    note: "for key-managed routes, use /v2/keys (babel.town) or /v3/keys (nvidia).",
  };
}

// ─── savedb ──────────────────────────────────────────────────────────
async function savedb(p: Record<string, unknown>): Promise<void> {
  try {
    await db.chatMessage.create({
      data: {
        role: "assistant",
        content: "v1 keyless",
        route: "/v1/keys",
        provider: PROVIDER,
        model: DEFAULT_MODEL,
        chatId: String(p.sessionid ?? `v1-${Date.now()}`),
        durationMs: Number(p.latencyms ?? 0),
        finishReason: "stop",
        ip: String(p.ip ?? "unknown"),
        keyId: String(p.keyid ?? ""),
        allParams: safestringify(p.allparams ?? "").slice(0, 8192),
        allResponse: "keyless",
      },
    });
  } catch { /* best-effort */ }
}

// ─── core handler ────────────────────────────────────────────────────
async function handlekeys(req: NextRequest): Promise<Response> {
  const startms = Date.now();
  const ip = getip(req);
  const useragent = req.headers.get("user-agent") ?? "";
  const sessionid = req.headers.get("x-session-id") ?? `v1-${startms}-${Math.random().toString(36).slice(2, 8)}`;
  const requestid = req.headers.get("x-request-id") ?? genid("req");
  const accept = req.headers.get("accept") || "";

  const payload = keylessstatus();
  const responseid = genid("keys");

  void savedb({
    sessionid, responseid, requestid, ip, useragent,
    latencyms: Date.now() - startms, startms,
    allparams: { accept, method: req.method },
  });

  // 5 content types
  const wantsSSE = accept.includes("text/event-stream");
  const wantsPlain = accept.includes("text/plain");
  const wantsBinary = accept.includes("application/octet-stream");
  const wantsNDJSON = accept.includes("application/x-ndjson");

  if (wantsSSE) {
    const sse = makesse();
    const keepalive = setInterval(() => { sse.keepalive(); }, 200);
    (async () => {
      try {
        await sse.emit(safestringify(payload));
        sse.emitnow("[DONE]");
      } finally {
        clearInterval(keepalive);
        if (!sse.closed) sse.close();
      }
    })();
    return sse.response;
  }
  if (wantsPlain) {
    const text = `provider: zai\nroute: v1\nkeyless: true\nmessage: v1 (zai sdk) is configured server-side and requires no client-supplied api key.\ncount: 0\nactive: 0\nnote: for key-managed routes, use /v2/keys (babel.town) or /v3/keys (nvidia).`;
    return new Response(text, { status: 200, headers: plainheaders() });
  }
  if (wantsBinary) {
    return new Response(Buffer.from(safestringify(payload), "utf-8"), { status: 200, headers: binaryheaders() });
  }
  if (wantsNDJSON) {
    const nd = makendjson();
    const keepalive = setInterval(() => { nd.keepalive(); }, 200);
    (async () => {
      try {
        await nd.emit(safestringify(payload));
      } finally {
        clearInterval(keepalive);
        if (!nd.closed) nd.close();
      }
    })();
    return nd.response;
  }
  return jsonresponse(payload, 200);
}

// ─── 40 http methods ─────────────────────────────────────────────────
/** Handle POST request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function POST(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle GET request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function GET(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle PUT request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function PUT(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle PATCH request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function PATCH(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle DELETE request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function DELETE(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Return headers only for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function HEAD(_req: NextRequest): Promise<Response> { return new Response(null, { status: 200, headers: corsheaders() }); }
/** Return CORS preflight response for this V1 endpoint. @param _req - incoming request @returns promise of response */
export async function OPTIONS(_req: NextRequest): Promise<Response> { return optionsresponse(); }
/** Handle CONNECT request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function CONNECT(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle TRACE request for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function TRACE(req: NextRequest): Promise<Response> { return handlekeys(req); }

/** Handle WebDAV PROPFIND for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function PROPFIND(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV PROPPATCH for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function PROPPATCH(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV MKCOL for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function MKCOL(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV COPY for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function COPY(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV MOVE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function MOVE(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV LOCK for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function LOCK(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV UNLOCK for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function UNLOCK(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle SEARCH for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function SEARCH(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle PURGE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function PURGE(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle LINK for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function LINK(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle UNLINK for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function UNLINK(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV REPORT for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function REPORT(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV CHECKOUT for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function CHECKOUT(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV CHECKIN for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function CHECKIN(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV UNCHECKOUT for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function UNCHECKOUT(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV VERSION-CONTROL for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function VERSION_CONTROL(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV LABEL for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function LABEL(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV MERGE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function MERGE(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV BASELINE-CONTROL for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function BASELINE_CONTROL(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV MKACTIVITY for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function MKACTIVITY(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle WebDAV MKWORKSPACE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function MKWORKSPACE(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle UPDATE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function UPDATE(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle SUBSCRIBE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function SUBSCRIBE(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle UNSUBSCRIBE for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function UNSUBSCRIBE(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle NOTIFY for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function NOTIFY(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle POLL for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function POLL(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle BIND for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function BIND(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle REBIND for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function REBIND(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle UNBIND for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function UNBIND(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle REINDEX for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function REINDEX(req: NextRequest): Promise<Response> { return handlekeys(req); }
/** Handle ACL for this V1 endpoint. @param req - incoming request @returns promise of response */
export async function ACL(req: NextRequest): Promise<Response> { return handlekeys(req); }
