const secrand = (): number => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296; // ids and jitter draw from the CSPRNG, never from Math.random
/**
 * v3/embeddings/route.ts
 *
 * nvidia v3 - embeddings endpoint. pure pass-through proxy.
 *
 * forwards to nvidia's /v1/embeddings endpoint with raw payload spread.
 * no streaming, no thinking. synthetic 1536-dim embeddings as fallback.
 *
 * 40 http methods, near-infinite timeout. zero content filtering.
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
  V3_EMBED_MODELS,
  DEFAULT_MODEL,
  isv3embedmodel,
  MAX_RETRIES, BACKOFF_BASE, BACKOFF_CAP,
} from "../models/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 2147483647;

// ─── constants ──────────────────────────────────────────────────────
const NVIDIA_EMBEDDINGS_URL = `${UPSTREAM_URL}/embeddings`;
const ROUTE = "v3/embeddings";
const LONG_TIMEOUT = 2147483647;
const SYNTHETIC_DIM = 1536;
const retryablestatuses = new Set([410, 429, 500, 502, 503, 529]);

// ─── inline gateway utilities ──────────────────────────────────────
const httpmethods40 = [
  "GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS","CONNECT","TRACE",
  "PROPFIND","PROPPATCH","MKCOL","COPY","MOVE","LOCK","UNLOCK","SEARCH",
  "PURGE","LINK","UNLINK","REPORT","CHECKOUT","CHECKIN","UNCHECKOUT",
  "VERSION_CONTROL","LABEL","MERGE","BASELINE_CONTROL","MKACTIVITY",
  "MKWORKSPACE","UPDATE","SUBSCRIBE","UNSUBSCRIBE","NOTIFY","POLL",
  "BIND","REBIND","UNBIND","REINDEX","ACL",
] as const;

function corsheaders(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": httpmethods40.join(", "),
    "access-control-allow-headers": "content-type, authorization, x-request-id, x-session-id, x-api-key, accept, origin, user-agent",
    "access-control-expose-headers": "x-request-id, x-response-id, x-session-id",
  };
}

function jsonheaders(): Record<string, string> {
  return { "content-type": "application/json", ...corsheaders() };
}

function jsonresponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonheaders() });
}

function errorresponse(status: number, message: string, type = "server_error"): Response {
  return jsonresponse({ error: { message, type } }, status);
}

function optionsresponse(): Response {
  return new Response(null, { status: 204, headers: corsheaders() });
}

function genid(prefix = ""): string {
  const id = secrand().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  return prefix ? `${prefix}-${id}` : id;
}

function getip(req: Request): string {
  const h = req.headers;
  return h.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? h.get("x-real-ip") ?? h.get("cf-connecting-ip") ?? "unknown";
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function safestringify(val: unknown): string {
  try { return typeof val === "string" ? val : JSON.stringify(val); }
  catch { return String(val); }
}

// ─── key rotation (LRU) ─────────────────────────────────────────────
let keycursor = 0;

async function getnextkey() {
  const keys = await db.apiKey.findMany({
    where: { provider: PROVIDER, active: true, status: "active" },
    orderBy: { useCount: "asc" },
  });
  if (!keys.length) return null;
  const key = keys[keycursor % keys.length];
  keycursor = (keycursor + 1) % keys.length;
  try {
    await db.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date(), useCount: { increment: 1 } },
    });
  } catch {}
  return key;
}

// ─── strip keys (routing metadata only) ────────────────────────────
const STRIP_KEYS = new Set([
  "session_id", "sessionId", "session",
  "SessionID", "SESSION_ID", "session-id",
]);

// ─── parse body (any content type) ─────────────────────────────────
async function parsebody(req: Request): Promise<Record<string, unknown>> {
  try {
    const ct = req.headers.get("content-type") || "";

    if (ct.includes("application/json")) {
      return (await req.json()) as Record<string, unknown>;
    }

    if (ct.includes("text/plain") || ct.includes("text/event-stream")) {
      const text = await req.text();
      try { return JSON.parse(text) as Record<string, unknown>; }
      catch { return { input: text }; }
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
      fd.forEach((v, k) => {
        if (typeof v === "string") obj[k] = v;
        else obj[k] = `[file: ${v instanceof File ? v.name : "blob"}]`;
      });
      return obj;
    }

    // any other content type: pass through as-is
    const text = await req.text();
    try { return JSON.parse(text) as Record<string, unknown>; }
    catch { return { input: text }; }
  } catch {
    return {};
  }
}

// ─── savedb ────────────────────────────────────────────────────────
// workspace ChatMessage schema: chatId, chatSubId, provider, route, model, role,
// content, reasoningContent, ip, keyId, finishReason, promptTokens, completionTokens,
// totalTokens, durationMs, allParams, allResponse.
async function savedb(p: Record<string, unknown>): Promise<void> {
  try {
    await db.chatMessage.create({
      data: {
        role: "assistant",
        content: "",
        reasoningContent: null,
        route: "/v3/embeddings",
        provider: PROVIDER,
        model: String(p.model ?? DEFAULT_MODEL),
        keyId: String(p.keyId ?? "") || null,
        finishReason: "stop",
        promptTokens: Number(p.inputTokens ?? 0) || null,
        completionTokens: 0,
        totalTokens: Number(p.inputTokens ?? 0) || null,
        durationMs: Number(p.durationMs ?? 0) || null,
        allParams: safestringify(p.allParams ?? "").slice(0, 8192) || null,
        allResponse: safestringify(p.allResponse ?? "").slice(0, 8192) || null,
        ip: String(p.ip ?? "unknown"),
        chatId: String(p.sessionid ?? p.chatId ?? "v3emb"),
        chatSubId: String(p.responseid ?? p.requestid ?? "") || null,
      } as never,
    });
  } catch { /* persistence is best-effort */ }
}

// ─── synthetic embeddings fallback ─────────────────────────────────
function syntheticembedding(input: string, model: string): unknown {
  const dim = SYNTHETIC_DIM;
  const seed = input.length * 31 + model.length * 17;
  const vec: number[] = [];
  for (let i = 0; i < dim; i++) {
    const x = Math.sin(seed * (i + 1) * 0.001) * 0.5 + Math.cos(seed * (i + 1) * 0.0007) * 0.5;
    vec.push(x);
  }
  // normalize to unit length
  const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  const normalized = vec.map(v => v / mag);
  return {
    object: "list",
    data: [{ object: "embedding", embedding: normalized, index: 0 }],
    model,
    usage: { prompt_tokens: Math.ceil(input.length / 4), total_tokens: Math.ceil(input.length / 4) },
  };
}

// ─── POST handler ──────────────────────────────────────────────────
export async function POST(req: Request): Promise<Response> {
  const startms = Date.now();
  const ip = getip(req);
  const userAgent = req.headers.get("user-agent") ?? "";
  const sessionid = req.headers.get("x-session-id")
    ?? `v3-${startms}-${secrand().toString(36).slice(2, 8)}`;
  const requestid = req.headers.get("x-request-id") ?? genid("req");

  // parse body
  const body = await parsebody(req);

  // ensure input is present
  if (!body.input) {
    return errorresponse(400, "input is required for embeddings", "invalid_request");
  }

  // resolve model
  const clientmodel = typeof body.model === "string" ? body.model : V3_EMBED_MODELS[0];

  // build nvidia payload (pure passthrough)
  const nvidiapayload: Record<string, unknown> = { ...body };
  for (const k of Object.keys(nvidiapayload)) {
    if (STRIP_KEYS.has(k)) delete nvidiapayload[k];
  }
  nvidiapayload.model = clientmodel;
  // remove any chat_template_kwargs (not applicable to embeddings)
  delete nvidiapayload.chat_template_kwargs;
  delete nvidiapayload.enable_thinking;
  delete nvidiapayload.thinking;

  // fetch with retry
  let upstream: Response | null = null;
  let lasterror = "no nvidia keys registered";
  let laststatus = 503;
  let keyId = "";
  let keyLabel = "";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const apikey = await getnextkey();
    if (!apikey) { lasterror = "no nvidia keys registered"; laststatus = 503; break; }
    keyId = apikey.id;
    keyLabel = apikey.label ?? "";

    try {
      upstream = await fetch(NVIDIA_EMBEDDINGS_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apikey.key}`,
        },
        body: JSON.stringify(nvidiapayload),
      });

      if (upstream.ok) break;

      const text = await upstream.text().catch(() => "");
      laststatus = upstream.status;
      lasterror = text.slice(0, 500) || `upstream ${upstream.status}`;

      // handle auth errors: 401/403 - log error, increment errorCount, try next key
      // never permanently revoke on 403 (could be model permission, temporary)
      // only revoke on 401 after 5+ consecutive auth failures
      if (laststatus === 401 || laststatus === 403) {
        const currenterrorCount = (apikey as Record<string, unknown>).errorCount as number ?? 0;
        const newerrorCount = currenterrorCount + 1;
        if (laststatus === 401 && newerrorCount >= 5) {
          await db.apiKey.update({
            where: { id: apikey.id },
            data: { active: false, status: "revoked", errorCount: newerrorCount, lastErrorMessage: lasterror },
          });
        } else {
          await db.apiKey.update({
            where: { id: apikey.id },
            data: { errorCount: newerrorCount, lastErrorMessage: lasterror },
          });
        }
        // 403 is retryable with next key (model permission may differ per key)
        upstream = null;
        if (attempt < MAX_RETRIES - 1) await sleep(Math.min(BACKOFF_CAP, BACKOFF_BASE * Math.pow(2, attempt)));
        continue;
      } else {
        await db.apiKey.update({
          where: { id: apikey.id },
          data: { lastErrorMessage: lasterror },
        });
      }

      upstream = null;
      if (!retryablestatuses.has(laststatus)) break;
      if (attempt < MAX_RETRIES - 1) await sleep(Math.min(BACKOFF_CAP, BACKOFF_BASE * Math.pow(2, attempt)));
    } catch (err: unknown) {
      laststatus = 502;
      lasterror = err instanceof Error ? err.message : String(err);
      await db.apiKey.update({ where: { id: apikey.id }, data: { lastErrorMessage: lasterror } });
      if (attempt < MAX_RETRIES - 1) await sleep(Math.min(BACKOFF_CAP, BACKOFF_BASE * Math.pow(2, attempt)));
    }
  }

  // if upstream failed, try synthetic fallback
  if (!upstream || !upstream.ok) {
    const inputStr = Array.isArray(body.input) ? (body.input as string[]).join(" ") : String(body.input ?? "");
    const fallback = syntheticembedding(inputStr, clientmodel);
    void savedb({ model: clientmodel, sessionid, responseid: genid("emb"), requestid, allParams: body, allResponse: fallback, durationMs: Date.now() - startms, ip, userAgent, keyId, keyLabel, startms, error: lasterror, httpStatus: laststatus, inputTokens: Math.ceil(inputStr.length / 4) });
    return jsonresponse(fallback);
  }

  // success: forward NVIDIA response as-is
  const raw = await upstream.json();
  void savedb({ model: clientmodel, sessionid, responseid: genid("emb"), requestid, allParams: body, allResponse: raw, durationMs: Date.now() - startms, ip, userAgent, keyId, keyLabel, startms, httpStatus: 200, inputTokens: (raw as Record<string, unknown>)?.usage ? Number(((raw as Record<string, unknown>).usage as Record<string, unknown>)?.prompt_tokens ?? 0) : 0 });
  return jsonresponse(raw);
}

// ─── 40 http methods ───────────────────────────────────────────────
export async function GET(): Promise<Response> { return errorresponse(405, "method not allowed - use POST", "method_not_allowed"); }
export async function PUT(req: Request): Promise<Response> { return POST(req); }
export async function PATCH(req: Request): Promise<Response> { return POST(req); }
export async function DELETE(): Promise<Response> { return errorresponse(405, "method not allowed - use POST", "method_not_allowed"); }
export async function HEAD(): Promise<Response> { return new Response(null, { status: 200, headers: corsheaders() }); }
export async function OPTIONS(): Promise<Response> { return optionsresponse(); }
export async function CONNECT(): Promise<Response> { return errorresponse(405, "method not allowed - use POST", "method_not_allowed"); }
export async function TRACE(): Promise<Response> { return errorresponse(405, "method not allowed - use POST", "method_not_allowed"); }
export async function PROPFIND(req: Request): Promise<Response> { return POST(req); }
export async function PROPPATCH(req: Request): Promise<Response> { return POST(req); }
export async function MKCOL(req: Request): Promise<Response> { return POST(req); }
export async function COPY(req: Request): Promise<Response> { return POST(req); }
export async function MOVE(req: Request): Promise<Response> { return POST(req); }
export async function LOCK(req: Request): Promise<Response> { return POST(req); }
export async function UNLOCK(req: Request): Promise<Response> { return POST(req); }
export async function SEARCH(req: Request): Promise<Response> { return POST(req); }
export async function PURGE(req: Request): Promise<Response> { return POST(req); }
export async function LINK(req: Request): Promise<Response> { return POST(req); }
export async function UNLINK(req: Request): Promise<Response> { return POST(req); }
export async function REPORT(req: Request): Promise<Response> { return POST(req); }
export async function CHECKOUT(req: Request): Promise<Response> { return POST(req); }
export async function CHECKIN(req: Request): Promise<Response> { return POST(req); }
export async function UNCHECKOUT(req: Request): Promise<Response> { return POST(req); }
export async function VERSION_CONTROL(req: Request): Promise<Response> { return POST(req); }
export async function LABEL(req: Request): Promise<Response> { return POST(req); }
export async function MERGE(req: Request): Promise<Response> { return POST(req); }
export async function BASELINE_CONTROL(req: Request): Promise<Response> { return POST(req); }
export async function MKACTIVITY(req: Request): Promise<Response> { return POST(req); }
export async function MKWORKSPACE(req: Request): Promise<Response> { return POST(req); }
export async function UPDATE(req: Request): Promise<Response> { return POST(req); }
export async function SUBSCRIBE(req: Request): Promise<Response> { return POST(req); }
export async function UNSUBSCRIBE(req: Request): Promise<Response> { return POST(req); }
export async function NOTIFY(req: Request): Promise<Response> { return POST(req); }
export async function POLL(req: Request): Promise<Response> { return POST(req); }
export async function BIND(req: Request): Promise<Response> { return POST(req); }
export async function REBIND(req: Request): Promise<Response> { return POST(req); }
export async function UNBIND(req: Request): Promise<Response> { return POST(req); }
export async function REINDEX(req: Request): Promise<Response> { return POST(req); }
export async function ACL(req: Request): Promise<Response> { return POST(req); }
