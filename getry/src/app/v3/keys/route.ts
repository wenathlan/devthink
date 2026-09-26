/**
 * v3/keys/route.ts
 *
 * nvidia v3 - crud for nvidia api keys. self-contained, no imports from @/lib/gateway.
 *
 * manages the nvidiakey table. supports get (list), post (create),
 * put (update by id), delete (delete by id). 5 content types supported.
 *
 * 40 http methods, max safe timeout ≈ near-infinite.
 */

// ─── instrumentation (embedded) ─────────────────────────────────────
void (async () => {
  if (typeof window === "undefined" && typeof globalThis.process !== "undefined" && globalThis.process.versions?.node) {
    try {
      const http = await (0, eval)('import("http")') as typeof import("http");
      const https = await (0, eval)('import("https")') as typeof import("https");
      const LONG_TIMEOUT = 2147483647;
      if (http.Server.prototype) { http.Server.prototype.timeout = LONG_TIMEOUT; (http.Server.prototype as unknown as Record<string, unknown>).headersTimeout = LONG_TIMEOUT; (http.Server.prototype as unknown as Record<string, unknown>).keepAliveTimeout = LONG_TIMEOUT; (http.Server.prototype as unknown as Record<string, unknown>).requestTimeout = LONG_TIMEOUT; }
      if (https.Server.prototype) { https.Server.prototype.timeout = LONG_TIMEOUT; (https.Server.prototype as unknown as Record<string, unknown>).headersTimeout = LONG_TIMEOUT; (https.Server.prototype as unknown as Record<string, unknown>).keepAliveTimeout = LONG_TIMEOUT; (https.Server.prototype as unknown as Record<string, unknown>).requestTimeout = LONG_TIMEOUT; }
      if (http.globalAgent) (http.globalAgent as unknown as Record<string, unknown>).timeout = LONG_TIMEOUT;
      if (https.globalAgent) (https.globalAgent as unknown as Record<string, unknown>).timeout = LONG_TIMEOUT;
      console.log("[instrumentation] server timeout set to near-infinite (2147483647ms)");
    } catch {}
  }
})();

import { db } from "@/lib/db";
import {
  PROVIDER, UPSTREAM_URL, DEVTHINK_ID,
  DEVTHINK_ROTATION_MODELS, NvidiaChatModel,
  V3_CHAT_MODELS, V3_EMBED_MODELS, ALL_MODEL_IDS,
  THINKING_LEVELS, ThinkingLevel, THINKING_BUDGETS, BLOCKED_MODELS,
  DEFAULT_MODEL, MAX_TOKENS, MAX_CONTEXT, MAX_THINKING_BUDGET,
  isv3model, isv3chatmodel, isv3embedmodel, extractthinkingLevel, getthinkingBudget,
  MODELS, ModelEntry
} from "../models/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 2147483647;

// ─── embedded sse-parser ─────────────────────────────────────────────
function safestringify(val: unknown): string { try { return typeof val === "string" ? val : JSON.stringify(val); } catch { return String(val); } }

// ─── inline gateway utilities ──────────────────────────────────────
const httpmethods40 = ["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS","CONNECT","TRACE","PROPFIND","PROPPATCH","MKCOL","COPY","MOVE","LOCK","UNLOCK","SEARCH","PURGE","LINK","UNLINK","REPORT","CHECKOUT","CHECKIN","UNCHECKOUT","VERSION_CONTROL","LABEL","MERGE","BASELINE_CONTROL","MKACTIVITY","MKWORKSPACE","UPDATE","SUBSCRIBE","UNSUBSCRIBE","NOTIFY","POLL","BIND","REBIND","UNBIND","REINDEX","ACL"] as const;
function corsheaders(extra?: Record<string, string>): Record<string, string> { return { "access-control-allow-origin": "*", "access-control-allow-methods": httpmethods40.join(", "), "access-control-allow-headers": "content-type, authorization, x-request-id, x-session-id, x-api-key, accept, origin, user-agent, dnt, if-modified-since, if-none-match, range", "access-control-expose-headers": "x-request-id, x-response-id, x-session-id, x-rate-limit, x-rate-remaining", ...extra }; }
function jsonheaders(extra?: Record<string, string>): Record<string, string> { return { "content-type": "application/json", ...corsheaders(extra) }; }
function sseheaders(extra?: Record<string, string>): Record<string, string> { return { "content-type": "text/event-stream", "cache-control": "no-cache, no-transform", "connection": "keep-alive", "x-accel-buffering": "no", ...corsheaders(extra) }; }
function ndjsonheaders(extra?: Record<string, string>): Record<string, string> { return { "content-type": "application/x-ndjson", "cache-control": "no-cache", "connection": "keep-alive", ...corsheaders(extra) }; }
function plainheaders(extra?: Record<string, string>): Record<string, string> { return { "content-type": "text/plain; charset=utf-8", ...corsheaders(extra) }; }
function binaryheaders(extra?: Record<string, string>): Record<string, string> { return { "content-type": "application/octet-stream", ...corsheaders(extra) }; }
function jsonresponse(body: unknown, status = 200, extra?: Record<string, string>): Response { return new Response(JSON.stringify(body), { status, headers: jsonheaders(extra) }); }
function errorresponse(status: number, message: string, type = "server_error"): Response { return jsonresponse({ error: { message, type } }, status); }
function optionsresponse(): Response { return new Response(null, { status: 204, headers: corsheaders() }); }
function genid(prefix = ""): string { const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); return prefix ? `${prefix}-${id}` : id; }
// safestringify (embedded)
function getip(req: Request): string { const h = req.headers; return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? h.get("cf-connecting-ip") ?? "unknown"; }
function sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }
function maskkey(key: string): string { if (!key || key.length < 8) return "****"; return key.slice(0, 4) + "****" + key.slice(-4); }

async function parsebody(req: Request): Promise<Record<string, unknown>> {
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) return (await req.json()) as Record<string, unknown>;
    if (ct.includes("text/plain") || ct.includes("text/event-stream")) { const text = await req.text(); try { return JSON.parse(text) as Record<string, unknown>; } catch { return { prompt: text }; } }
    if (ct.includes("application/x-www-form-urlencoded")) { const text = await req.text(); const params = new URLSearchParams(text); const obj: Record<string, unknown> = {}; params.forEach((v, k) => { obj[k] = v; }); return obj; }
    if (ct.includes("multipart/form-data")) { const fd = await req.formData(); const obj: Record<string, unknown> = {}; fd.forEach((v, k) => { if (typeof v === "string") obj[k] = v; else obj[k] = `[file: ${v instanceof File ? v.name : "blob"}]`; }); return obj; }
    if (ct.includes("application/xml") || ct.includes("text/xml")) { const text = await req.text(); return { prompt: text }; }
    if (ct.startsWith("image/")) { const buf = await req.arrayBuffer(); const b64 = Buffer.from(buf).toString("base64"); return { prompt: `[image data: ${ct}, base64 length ${b64.length}]`, image: b64 }; }
    if (ct.startsWith("audio/") || ct.startsWith("video/")) { const buf = await req.arrayBuffer(); const b64 = Buffer.from(buf).toString("base64"); return { prompt: `[${ct} data: base64 length ${b64.length}]`, media: b64 }; }
    if (ct.includes("application/octet-stream")) { const text = await req.text().catch(() => ""); try { return JSON.parse(text) as Record<string, unknown>; } catch { return { prompt: text }; } }
    const text = await req.text(); try { return JSON.parse(text) as Record<string, unknown>; } catch { return { prompt: text }; }
  } catch { return {}; }
}

const SSE_SPACING_MS = 50;
class sseinstance { private encoder = new TextEncoder(); private controller: ReadableStreamDefaultController | null = null; private lastemit = 0; closed = false; response: Response; constructor(extra?: Record<string, string>) { const stream = new ReadableStream({ start: (ctrl) => { this.controller = ctrl; } }); this.response = new Response(stream, { headers: sseheaders(extra) }); } async emit(data: string): Promise<void> { if (this.closed || !this.controller) return; const now = Date.now(); if (this.lastemit > 0 && (now - this.lastemit) < SSE_SPACING_MS) await sleep(SSE_SPACING_MS - (now - this.lastemit)); this.lastemit = Date.now(); try { this.controller.enqueue(this.encoder.encode(`data: ${data}\n\n`)); } catch { this.closed = true; } } emitnow(data: string): void { if (this.closed || !this.controller) return; try { this.controller.enqueue(this.encoder.encode(`data: ${data}\n\n`)); } catch { this.closed = true; } } keepalive(): void { if (this.closed || !this.controller) return; try { this.controller.enqueue(this.encoder.encode(": keepalive\n\n")); } catch { this.closed = true; } } close(): void { if (this.closed) return; this.closed = true; try { this.controller?.close(); } catch {} } }
function makesse(extra?: Record<string, string>): sseinstance { return new sseinstance(extra); }
class ndjsoninstance { private encoder = new TextEncoder(); private controller: ReadableStreamDefaultController | null = null; private lastemit = 0; closed = false; response: Response; constructor(extra?: Record<string, string>) { const stream = new ReadableStream({ start: (ctrl) => { this.controller = ctrl; } }); this.response = new Response(stream, { headers: ndjsonheaders(extra) }); } async emit(data: string): Promise<void> { if (this.closed || !this.controller) return; const now = Date.now(); if (this.lastemit > 0 && (now - this.lastemit) < SSE_SPACING_MS) await sleep(SSE_SPACING_MS - (now - this.lastemit)); this.lastemit = Date.now(); try { this.controller.enqueue(this.encoder.encode(data + "\n")); } catch { this.closed = true; } } keepalive(): void { if (this.closed || !this.controller) return; try { this.controller.enqueue(this.encoder.encode("# keepalive\n")); } catch { this.closed = true; } } close(): void { if (this.closed) return; this.closed = true; try { this.controller?.close(); } catch {} } }
function makendjson(extra?: Record<string, string>): ndjsoninstance { return new ndjsoninstance(extra); }

// ─── v3 model definitions (imported from ../config) ─────────────────
// PROVIDER, UPSTREAM_URL, DEVTHINK_ID, DEVTHINK_ROTATION_MODELS, NvidiaChatModel,
// V3_CHAT_MODELS, MAX_TOKENS, DEFAULT_MODEL, isv3chatmodel, etc.

// ─── session context / model rotation ────────────────────────────────

async function getsessioncontext(sessionid: string) { const key = { sessionId: sessionid, provider: PROVIDER }; let ctx = await db.sessionContext.findUnique({ where: { sessionId_provider: key } }); if (!ctx) ctx = await db.sessionContext.create({ data: { ...key, messageCount: 0, rotationIndex: 0 } }); return ctx; }
async function getrotationmodel(sessionid: string) { const ctx = await getsessioncontext(sessionid); const ri = Math.floor(ctx.messageCount / 6) % DEVTHINK_ROTATION_MODELS.length; const m = DEVTHINK_ROTATION_MODELS[ri]; await db.sessionContext.update({ where: { id: ctx.id }, data: { messageCount: { increment: 1 }, model: m.id, rotationIndex: ri } }); return { model: m.id, rotationIndex: ri, messageNumber: ctx.messageCount + 1 }; }

// ─── savedb ──────────────────────────────────────────────────────────
// workspace ChatMessage schema: chatId, chatSubId, provider, route, model, role,
// content, reasoningContent, ip, keyId, finishReason, promptTokens, completionTokens,
// totalTokens, durationMs, allParams, allResponse.
async function savedb(p: Record<string, unknown>): Promise<void> {
  try { await db.chatMessage.create({ data: { role: "assistant", content: "", reasoningContent: null, route: "/v3/keys", provider: PROVIDER, model: DEVTHINK_ID, keyId: String(p.keyId ?? "") || null, finishReason: "stop", promptTokens: 0, completionTokens: 0, totalTokens: 0, durationMs: Number(p.durationMs ?? 0) || null, allParams: safestringify(p.allParams ?? "").slice(0, 8192) || null, allResponse: safestringify(p.allResponse ?? "").slice(0, 8192) || null, ip: String(p.ip ?? "unknown"), chatId: String(p.sessionid ?? p.chatId ?? "v3keys"), chatSubId: String(p.responseid ?? p.requestid ?? "") || null } as never }); } catch { /* best-effort */ }
}

// ─── respond5ct helper ───────────────────────────────────────────────
async function respond5ct(req: Request, data: unknown, status = 200): Promise<Response> {
  const accept = req.headers.get("accept") || "";

  // NDJSON
  if (accept.includes("application/x-ndjson")) {
    const nd = makendjson(); const keepalive = setInterval(() => { nd.keepalive(); }, SSE_SPACING_MS);
    (async () => { try { if (typeof data === "object" && data !== null) { const obj = data as Record<string, unknown>; if (Array.isArray(obj.data)) { for (const item of obj.data) await nd.emit(safestringify(item)); } else { await nd.emit(safestringify(data)); } } } finally { clearInterval(keepalive); if (!nd.closed) nd.close(); } })();
    return nd.response;
  }

  // SSE
  if (accept.includes("text/event-stream")) {
    const sse = makesse();
    const keepalive = setInterval(() => { sse.keepalive(); }, SSE_SPACING_MS);
    (async () => {
      try {
        if (typeof data === "object" && data !== null) {
          const obj = data as Record<string, unknown>;
          if (Array.isArray(obj.data)) {
            for (const item of obj.data) await sse.emit(safestringify(item));
          } else {
            await sse.emit(safestringify(data));
          }
        }
        sse.emitnow("[DONE]");
      } finally {
        clearInterval(keepalive);
        if (!sse.closed) sse.close();
      }
    })();
    return sse.response;
  }

  // plain text
  if (accept.includes("text/plain")) {
    const text = typeof data === "object" && data !== null
      ? (Array.isArray((data as Record<string, unknown>).data)
          ? ((data as Record<string, unknown>).data as Array<Record<string, unknown>>).map((k: Record<string, unknown>) => `${k.id ?? ""} ${maskkey(String(k.key ?? ""))} ${k.active ? "active" : "inactive"} ${k.label ?? ""}`).join("\n")
          : safestringify(data))
      : String(data);
    return new Response(text, { status, headers: plainheaders() });
  }

  // binary
  if (accept.includes("application/octet-stream")) {
    return new Response(Buffer.from(safestringify(data), "utf-8"), { status, headers: binaryheaders() });
  }

  // json (default)
  return jsonresponse(data, status);
}

// ─── GET handler: list all nvidia keys ───────────────────────────────
/** GET handler: list all nvidia keys. */
export async function GET(req: Request): Promise<Response> {
  const startms = Date.now(); const ip = getip(req); const userAgent = req.headers.get("user-agent") ?? "";
  const sessionid = req.headers.get("x-session-id") ?? `v3-${startms}-${Math.random().toString(36).slice(2, 8)}`; const requestid = req.headers.get("x-request-id") ?? genid("req");

  try {
    const rows = await db.apiKey.findMany({ where: { provider: PROVIDER }, orderBy: { createdAt: "desc" } });
    const data = (rows as Array<Record<string, unknown>>).map((row) => ({
      id: row.id, active: row.active, label: row.label ?? "",
      key: maskkey(String(row.key ?? "")),
      status: row.status ?? "active",
      useCount: Number(row.useCount ?? 0),
      rotationCount: Number(row.rotationCount ?? 0),
      errorCount: Number(row.errorCount ?? 0),
      lastUsedAt: row.lastUsedAt ?? null,
      lastErrorMessage: row.lastErrorMessage ?? null,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt ?? null,
    }));
    const body = { object: "list", data, provider: PROVIDER, count: data.length };
    void savedb({ sessionid, responseid: genid("keys"), requestid, allParams: "", allResponse: body, durationMs: Date.now() - startms, ip, userAgent, startms });
    return respond5ct(req, body);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorresponse(500, msg);
  }
}

// ─── POST handler: create a new nvidia key ───────────────────────────
/** POST handler: create a new nvidia key. */
export async function POST(req: Request): Promise<Response> {
  const startms = Date.now(); const ip = getip(req); const userAgent = req.headers.get("user-agent") ?? "";
  const sessionid = req.headers.get("x-session-id") ?? `v3-${startms}-${Math.random().toString(36).slice(2, 8)}`; const requestid = req.headers.get("x-request-id") ?? genid("req");

  const body = await parsebody(req);
  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!key) return errorresponse(400, "key is required");
  try {
    const existing = await db.apiKey.findFirst({ where: { provider: PROVIDER, key } });
    if (existing) return errorresponse(409, "key already exists", "conflict");
    const created = await db.apiKey.create({
      data: { key, label: typeof body.label === "string" ? body.label : "", active: typeof body.active === "boolean" ? body.active : true, status: "active", provider: PROVIDER } as never,
    });
    const row = created as Record<string, unknown>;
    const data = { id: row.id, active: row.active, label: row.label ?? "", key: maskkey(String(row.key ?? "")), status: row.status ?? "active", createdAt: row.createdAt, expiresAt: row.expiresAt ?? null };
    void savedb({ sessionid, responseid: genid("key"), requestid, allParams: body, allResponse: data, durationMs: Date.now() - startms, ip, userAgent, startms, keyId: String(row.id), keyLabel: String(row.label ?? "") });
    return respond5ct(req, data, 201);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorresponse(500, msg);
  }
}

// ─── PUT handler: update a key by id ─────────────────────────────────
/** PUT handler: update a key by id. */
export async function PUT(req: Request): Promise<Response> {
  const startms = Date.now(); const ip = getip(req); const userAgent = req.headers.get("user-agent") ?? "";
  const sessionid = req.headers.get("x-session-id") ?? `v3-${startms}-${Math.random().toString(36).slice(2, 8)}`; const requestid = req.headers.get("x-request-id") ?? genid("req");

  const body = await parsebody(req);
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return errorresponse(400, "id is required");
  try {
    const existing = await db.apiKey.findUnique({ where: { id } });
    if (!existing) return errorresponse(404, "key not found", "not_found");
    const data: Record<string, unknown> = {};
    if (typeof body.label === "string") data.label = body.label;
    if (typeof body.active === "boolean") data.active = body.active;
    if (typeof body.status === "string") data.status = body.status;
    if (typeof body.key === "string" && body.key.trim()) data.key = body.key.trim();
    const updated = await db.apiKey.update({ where: { id }, data: data as never });
    const row = updated as Record<string, unknown>;
    const respdata = { id: row.id, active: row.active, label: row.label ?? "", key: maskkey(String(row.key ?? "")), status: row.status ?? "active", updatedAt: row.updatedAt, expiresAt: row.expiresAt ?? null };
    void savedb({ sessionid, responseid: genid("key"), requestid, allParams: body, allResponse: respdata, durationMs: Date.now() - startms, ip, userAgent, startms, keyId: id, keyLabel: String(row.label ?? "") });
    return respond5ct(req, respdata);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorresponse(500, msg);
  }
}

// ─── DELETE handler: delete a key by id or by key ───────────────
/** DELETE handler: delete a key by id or by key. */
export async function DELETE(req: Request): Promise<Response> {
  const startms = Date.now(); const ip = getip(req); const userAgent = req.headers.get("user-agent") ?? "";
  const sessionid = req.headers.get("x-session-id") ?? `v3-${startms}-${Math.random().toString(36).slice(2, 8)}`; const requestid = req.headers.get("x-request-id") ?? genid("req");

  let id = ""; let key = "";
  try { const u = new URL(req.url); id = u.searchParams.get("id") || ""; key = u.searchParams.get("key") || ""; if (!id && !key) { try { const body = await parsebody(req); if (typeof body.id === "string") id = body.id; if (typeof body.key === "string") key = body.key; } catch {} } } catch {}
  if (!id && !key) return errorresponse(400, "id or key query param is required");
  try {
    let existing: Record<string, unknown> | null = null;
    if (id) existing = await db.apiKey.findUnique({ where: { id } }) as Record<string, unknown> | null;
    else if (key) existing = await db.apiKey.findFirst({ where: { provider: PROVIDER, key } }) as Record<string, unknown> | null;
    if (!existing) return errorresponse(404, "key not found", "not_found");
    const targetid = String(existing.id);
    await db.apiKey.delete({ where: { id: targetid } });
    const data = { id: targetid, deleted: true };
    void savedb({ sessionid, responseid: genid("key"), requestid, allParams: { id: targetid, key }, allResponse: data, durationMs: Date.now() - startms, ip, userAgent, startms, keyId: targetid, keyLabel: String(existing.label ?? "") });
    return respond5ct(req, data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorresponse(500, msg);
  }
}

// ─── 40 http methods ─────────────────────────────────────────────────
/** PATCH handler for /v3/keys endpoint. */
export async function PATCH(req: Request): Promise<Response> { return PUT(req); }
/** HEAD handler for /v3/keys endpoint. */
export async function HEAD(): Promise<Response> { return new Response(null, { status: 200, headers: corsheaders() }); }
/** OPTIONS handler for /v3/keys endpoint. */
export async function OPTIONS(): Promise<Response> { return optionsresponse(); }
/** CONNECT handler for /v3/keys endpoint. */
export async function CONNECT(): Promise<Response> { return errorresponse(405, "method not allowed", "method_not_allowed"); }
/** TRACE handler for /v3/keys endpoint. */
export async function TRACE(): Promise<Response> { return errorresponse(405, "method not allowed", "method_not_allowed"); }
/** PROPFIND handler for /v3/keys endpoint. */
export async function PROPFIND(req: Request): Promise<Response> { return POST(req); }
/** PROPPATCH handler for /v3/keys endpoint. */
export async function PROPPATCH(req: Request): Promise<Response> { return PUT(req); }
/** MKCOL handler for /v3/keys endpoint. */
export async function MKCOL(req: Request): Promise<Response> { return POST(req); }
/** COPY handler for /v3/keys endpoint. */
export async function COPY(req: Request): Promise<Response> { return POST(req); }
/** MOVE handler for /v3/keys endpoint. */
export async function MOVE(req: Request): Promise<Response> { return POST(req); }
/** LOCK handler for /v3/keys endpoint. */
export async function LOCK(req: Request): Promise<Response> { return POST(req); }
/** UNLOCK handler for /v3/keys endpoint. */
export async function UNLOCK(req: Request): Promise<Response> { return DELETE(req); }
/** SEARCH handler for /v3/keys endpoint. */
export async function SEARCH(req: Request): Promise<Response> { return GET(req); }
/** PURGE handler for /v3/keys endpoint. */
export async function PURGE(req: Request): Promise<Response> { return DELETE(req); }
/** LINK handler for /v3/keys endpoint. */
export async function LINK(req: Request): Promise<Response> { return POST(req); }
/** UNLINK handler for /v3/keys endpoint. */
export async function UNLINK(req: Request): Promise<Response> { return DELETE(req); }
/** REPORT handler for /v3/keys endpoint. */
export async function REPORT(req: Request): Promise<Response> { return POST(req); }
/** CHECKOUT handler for /v3/keys endpoint. */
export async function CHECKOUT(req: Request): Promise<Response> { return POST(req); }
/** CHECKIN handler for /v3/keys endpoint. */
export async function CHECKIN(req: Request): Promise<Response> { return PUT(req); }
/** UNCHECKOUT handler for /v3/keys endpoint. */
export async function UNCHECKOUT(req: Request): Promise<Response> { return DELETE(req); }
/** VERSION_CONTROL handler for /v3/keys endpoint. */
export async function VERSION_CONTROL(req: Request): Promise<Response> { return PUT(req); }
/** LABEL handler for /v3/keys endpoint. */
export async function LABEL(req: Request): Promise<Response> { return PUT(req); }
/** MERGE handler for /v3/keys endpoint. */
export async function MERGE(req: Request): Promise<Response> { return POST(req); }
/** BASELINE_CONTROL handler for /v3/keys endpoint. */
export async function BASELINE_CONTROL(req: Request): Promise<Response> { return PUT(req); }
/** MKACTIVITY handler for /v3/keys endpoint. */
export async function MKACTIVITY(req: Request): Promise<Response> { return POST(req); }
/** MKWORKSPACE handler for /v3/keys endpoint. */
export async function MKWORKSPACE(req: Request): Promise<Response> { return POST(req); }
/** UPDATE handler for /v3/keys endpoint. */
export async function UPDATE(req: Request): Promise<Response> { return PUT(req); }
/** SUBSCRIBE handler for /v3/keys endpoint. */
export async function SUBSCRIBE(req: Request): Promise<Response> { return POST(req); }
/** UNSUBSCRIBE handler for /v3/keys endpoint. */
export async function UNSUBSCRIBE(req: Request): Promise<Response> { return DELETE(req); }
/** NOTIFY handler for /v3/keys endpoint. */
export async function NOTIFY(req: Request): Promise<Response> { return POST(req); }
/** POLL handler for /v3/keys endpoint. */
export async function POLL(req: Request): Promise<Response> { return GET(req); }
/** BIND handler for /v3/keys endpoint. */
export async function BIND(req: Request): Promise<Response> { return POST(req); }
/** REBIND handler for /v3/keys endpoint. */
export async function REBIND(req: Request): Promise<Response> { return PUT(req); }
/** UNBIND handler for /v3/keys endpoint. */
export async function UNBIND(req: Request): Promise<Response> { return DELETE(req); }
/** REINDEX handler for /v3/keys endpoint. */
export async function REINDEX(req: Request): Promise<Response> { return GET(req); }
/** ACL handler for /v3/keys endpoint. */
export async function ACL(req: Request): Promise<Response> { return PUT(req); }
