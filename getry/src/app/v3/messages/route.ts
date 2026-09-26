/**
 * v3/messages/route.ts
 *
 * nvidia v3 - anthropic-format messages endpoint.
 * definitive pass-through proxy: zero content filtering, zero xml parsing, zero chunk cleaning.
 *
 * core principle: the API is a workflow proxy for AI agents.
 *   - client sends anthropic /v1/messages format -> we convert to openai chat.completions for nvidia
 *   - nvidia responds -> we convert back to anthropic message shape
 *   - we parse SSE internally ONLY for DB persistence (content/reasoning/tokens)
 *   - we fix usage ONLY when nvidia omits total_tokens
 *   - NO content filtering, NO xml parsing, NO chunk cleaning, NO message normalization
 *
 * features:
 *   - streaming: openai SSE -> anthropic SSE (message_start, content_block_start/delta/stop, message_delta/stop)
 *   - non-streaming: openai response -> anthropic message object
 *   - pure payload spread: forward ALL client params to nvidia (strip only routing metadata)
 *   - 10s model switching on timeout (rotate to next model in DevThink rotation)
 *   - near-infinite timeout (2147483647ms) for both server and streaming body
 *   - thinking always enabled at high (chat_template_kwargs forced if not present)
 *   - LRU key rotation across nvidia API keys
 *   - 40 http methods, 5 content types
 *   - DB persistence (fire-and-forget, best-effort)
 *   - minimal message handling: only flatten content arrays for nvidia compat
 *   - image support: anthropic image blocks -> openai vision format
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
  DEVTHINK_ROTATION_MODELS,
  V3_CHAT_MODELS, BLOCKED_MODELS,
  DEFAULT_MODEL, MAX_TOKENS,
  isnvidiachatmodel, buildchattemplatekwargs,
  MODEL_SWITCH_INTERVAL_MS, MAX_MODEL_ROTATIONS,
  MAX_RETRIES, BACKOFF_BASE, BACKOFF_CAP, SSE_SPACING_MS,
  THINKING_BUDGETS, extractthinkingLevel,
} from "../models/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 2147483647;

// ─── constants ──────────────────────────────────────────────────────
const NVIDIA_CHAT_URL = `${UPSTREAM_URL}/chat/completions`;
const ROUTE = "v3/messages";
const LONG_TIMEOUT = 2147483647;
const KEEPALIVE_MS = 200;
const retryablestatuses = new Set([410, 429, 500, 502, 503, 529]);

// ─── encoding ──────────────────────────────────────────────────────
const enc = new TextEncoder();
const dec = new TextDecoder();

/**
 * Brace-depth SSE event extractor.
 *
 * Extracts `data: <json>` events from an SSE buffer by tracking `{}` brace
 * depth (respecting escaped strings), INDEPENDENT of `\n\n` separators.
 *
 * Why: NVIDIA upstream sometimes omits `\n\n` between events, or splits a JSON
 * value mid-string (e.g. `..."service_ti` + `data: {...`). The naive parser
 * (`indexOf("data: ")` + `indexOf("\n")`) would concatenate them into
 * `..."service_tidata: {...` and emit a broken JSON to the client, causing
 * "JSON Parse error: Expected ':' before value".
 *
 * This parser scans for `data: ` markers and extracts the JSON object by
 * counting braces. Incomplete JSON (depth > 0 at end of buffer) stays in the
 * remainder for the next chunk. Corrupted JSON (unterminated, with another
 * `data: ` following) is DISCARDED — never relayed to the client.
 *
 * @returns `{ items: string[]; rest: string }` — items are parsed payloads
 *          (either `[DONE]` or raw JSON string); rest is unparsed remainder.
 */
function extractsse(buffer: string): { items: string[]; rest: string } {
  const items: string[] = [];
  let i = 0;
  const len = buffer.length;
  while (i < len) {
    const marker = buffer.indexOf("data: ", i);
    if (marker === -1) {
      return { items, rest: "" };
    }
    const payloadStart = marker + 6;
    if (buffer.slice(payloadStart, payloadStart + 6).toUpperCase() === "[DONE]" &&
        (payloadStart + 6 >= buffer.length || buffer[payloadStart + 6] === "\n" || buffer[payloadStart + 6] === "\r")) {
      items.push("[DONE]");
      i = payloadStart + 6;
      continue;
    }
    const extracted = extractjsonobject(buffer, payloadStart);
    if (extracted === null) {
      const nextMarker = buffer.indexOf("data: ", payloadStart);
      if (nextMarker !== -1) {
        console.warn("[v3/messages] SSE: discarding corrupted chunk (unterminated JSON)");
        i = nextMarker;
        continue;
      }
      return { items, rest: buffer.slice(marker) };
    }
    items.push(extracted.json);
    i = extracted.endIdx;
  }
  return { items, rest: "" };
}

/** Extract a `{...}` JSON object starting at `start`, tracking brace depth
 *  and escaped strings. Returns `{ json, endIdx }` or null if incomplete. */
function extractjsonobject(s: string, start: number): { json: string; endIdx: number } | null {
  if (s[start] !== "{") return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (escaped) { escaped = false; }
      else if (ch === "\\") { escaped = true; }
      else if (ch === '"') { inString = false; }
      continue;
    }
    if (ch === '"') { inString = true; }
    else if (ch === "{") { depth++; }
    else if (ch === "}") {
      depth--;
      if (depth === 0) return { json: s.slice(start, i + 1), endIdx: i + 1 };
    }
  }
  return null;
}

// ─── anthropic protocol model handling ──────────────────────────────
/** map incoming model names to the v3 catalog. claude-protocol clients
 *  send anthropic model names — those route to the devthink meta (the
 *  gateway's own model), never to any upstream anthropic model. */
function mapmodel(raw: string): string {
  // anthropic-protocol model names -> devthink meta
  if (raw.startsWith("claude-") || raw.startsWith("anthropic-")) return DEVTHINK_ID;
  // known nvidia model -> pass through
  if (isnvidiachatmodel(raw)) return raw;
  // devthink -> devthink
  if (raw === DEVTHINK_ID) return DEVTHINK_ID;
  // unknown -> allow through, nvidia will validate
  return raw;
}

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
    "access-control-allow-headers": "content-type, authorization, x-request-id, x-session-id, x-api-key, anthropic-version, anthropic-beta, accept, origin, user-agent",
    "access-control-expose-headers": "x-request-id, x-response-id, x-session-id",
  };
}

function jsonheaders(): Record<string, string> {
  return { "content-type": "application/json", ...corsheaders() };
}

function sseheaders(): Record<string, string> {
  return {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    "connection": "keep-alive",
    "x-accel-buffering": "no",
    ...corsheaders(),
  };
}

function plainheaders(): Record<string, string> {
  return { "content-type": "text/plain; charset=utf-8", ...corsheaders() };
}

function jsonresponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonheaders() });
}

function errorresponse(status: number, message: string, type = "server_error"): Response {
  // anthropic error format
  return jsonresponse({ type: "error", error: { type, message } }, status);
}

function optionsresponse(): Response {
  return new Response(null, { status: 204, headers: corsheaders() });
}

function genid(prefix = ""): string {
  const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
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

// ─── session context / model rotation ───────────────────────────────
async function getsessioncontext(sessionid: string) {
  const key = { sessionId: sessionid, provider: PROVIDER };
  let ctx = await db.sessionContext.findUnique({ where: { sessionId_provider: key } });
  if (!ctx) ctx = await db.sessionContext.create({ data: { ...key, messageCount: 0, rotationIndex: 0 } });
  return ctx;
}

async function getrotationmodel(sessionid: string) {
  const ctx = await getsessioncontext(sessionid);
  const ri = Math.floor(ctx.messageCount / 6) % DEVTHINK_ROTATION_MODELS.length;
  const m = DEVTHINK_ROTATION_MODELS[ri];
  await db.sessionContext.update({
    where: { id: ctx.id },
    data: { messageCount: { increment: 1 }, model: m.id, rotationIndex: ri },
  });
  return { model: m.id, chattemplatekwargs: m.chattemplatekwargs, rotationIndex: ri, messageNumber: ctx.messageCount + 1 };
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

// ─── anthropic -> openai message conversion ─────────────────────────
/**
 * extractcontentstring: extract text from anthropic content.
 *   content can be a string or an array of content blocks:
 *   [{ type: "text", text }] or [{ type: "image", source: { ... } }]
 */
function extractcontentstring(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content ?? "");
  return content
    .map((part: unknown) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object") {
        const p = part as Record<string, unknown>;
        if (p.type === "text" && typeof p.text === "string") return p.text;
        if (typeof p.text === "string") return p.text;
        if (typeof p.content === "string") return p.content;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * convertanthropictoopenai: convert anthropic messages to openai format.
 *   - system (string or content block array) -> prepend system message
 *   - content arrays -> flatten text, map image blocks to openai vision format
 *   - tool messages -> fix tool call id (nvidia compat)
 *   - keep ALL other message fields as-is (no filtering)
 */
function convertanthropictoopenai(
  body: Record<string, unknown>,
): Record<string, unknown>[] {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const out: Record<string, unknown>[] = [];

  // handle system prompt (anthropic sends it as a top-level field)
  if (body.system !== undefined && body.system !== null) {
    const syscontent = extractcontentstring(body.system);
    if (syscontent) out.push({ role: "system", content: syscontent });
  }

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (!m || typeof m !== "object") {
      out.push({ role: "user", content: String(m ?? "") });
      continue;
    }

    const msg = { ...(m as Record<string, unknown>) };
    const role = String(msg.role ?? "user");

    // flatten content: anthropic content blocks -> openai format
    if (Array.isArray(msg.content)) {
      const parts = msg.content as Array<Record<string, unknown>>;

      // check for image blocks
      const hasImage = parts.some(
        (p) => p && typeof p === "object" && (p.type === "image" || p.type === "image_url"),
      );

      if (hasImage) {
        // convert to openai vision content array
        const openaiContent: Array<Record<string, unknown>> = [];
        for (const part of parts) {
          if (!part || typeof part !== "object") continue;

          if (part.type === "image" && part.source && typeof part.source === "object") {
            const src = part.source as Record<string, unknown>;
            if (src.type === "base64" && typeof src.data === "string" && typeof src.media_type === "string") {
              openaiContent.push({
                type: "image_url",
                image_url: { url: `data:${src.media_type};base64,${src.data}` },
              });
            } else if (src.type === "url" && typeof src.url === "string") {
              openaiContent.push({
                type: "image_url",
                image_url: { url: src.url },
              });
            }
          } else if (part.type === "image_url" && part.image_url) {
            openaiContent.push({ type: "image_url", image_url: part.image_url });
          } else if (part.type === "text" && typeof part.text === "string") {
            openaiContent.push({ type: "text", text: part.text });
          } else if (typeof part.text === "string") {
            openaiContent.push({ type: "text", text: part.text });
          }
        }
        msg.content = openaiContent;
      } else {
        // no images: flatten to string (nvidia chat requires string content for non-vision)
        msg.content = parts
          .map((part: Record<string, unknown>) => {
            if (typeof part === "string") return part;
            if (part && typeof part === "object") {
              if (part.type === "text" && typeof part.text === "string") return part.text;
              return String(part.text ?? part.content ?? "");
            }
            return String(part ?? "");
          })
          .filter(Boolean)
          .join("\n");
      }
    }

    // fix tool messages missing tool_call_id (nvidia 400 error)
    if (msg.role === "tool") {
      if (!msg.tool_call_id || String(msg.tool_call_id).trim() === "") {
        for (let j = out.length - 1; j >= 0; j--) {
          const prev = out[j];
          if (prev.role === "assistant" && Array.isArray(prev.tool_calls) && prev.tool_calls.length > 0) {
            msg.tool_call_id = (prev.tool_calls as Array<Record<string, unknown>>)[0]?.id ?? genid("call");
            break;
          }
        }
        if (!msg.tool_call_id) msg.tool_call_id = genid("call");
      }
    }

    // fix assistant tool_calls missing id/type/function
    if (msg.role === "assistant" && Array.isArray(msg.tool_calls)) {
      msg.tool_calls = (msg.tool_calls as Array<Record<string, unknown>>).map((tc: Record<string, unknown>) => ({
        ...tc,
        id: tc?.id && String(tc.id).trim() !== "" ? tc.id : genid("call"),
        type: tc?.type || "function",
        function: tc?.function || { name: "unknown", arguments: "" },
      }));
    }

    out.push(msg);
  }

  return out;
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
      catch { return { prompt: text }; }
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

    // for ALL other content types: pass through as-is
    const text = await req.text();
    try { return JSON.parse(text) as Record<string, unknown>; }
    catch { return { prompt: text }; }
  } catch {
    return {};
  }
}

// ─── fetch with retry + model switching ────────────────────────────
async function fetchwithretry(
  nvidiapayload: Record<string, unknown>,
  stream: boolean,
) {
  let lasterror = "no nvidia keys registered";
  let laststatus = 503;
  let upstream: Response | null = null;
  let keyId = "";
  let keyLabel = "";
  let rotatedmodel = String(nvidiapayload.model ?? "");

  // outer loop: model switching on timeout (10s per model)
  for (let modelattempt = 0; modelattempt < MAX_MODEL_ROTATIONS; modelattempt++) {
    let modeltimedout = false;

    // inner loop: key rotation + retry on retryable statuses
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const apikey = await getnextkey();
      if (!apikey) { lasterror = "no nvidia keys registered"; laststatus = 503; break; }
      keyId = apikey.id;
      keyLabel = apikey.label ?? "";

      const ctrl = new AbortController();
      const headerTimeoutMs = MODEL_SWITCH_INTERVAL_MS;
      const headerTimer = setTimeout(() => {
        ctrl.abort();
        modeltimedout = true;
      }, headerTimeoutMs);

      try {
        upstream = await fetch(NVIDIA_CHAT_URL, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${apikey.key}`,
          },
          body: JSON.stringify(nvidiapayload),
          signal: ctrl.signal,
        });

        clearTimeout(headerTimer);

        if (upstream.ok && (!stream || upstream.body)) break;

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
          if (attempt < MAX_RETRIES - 1) await sleep(backoffdelay(attempt));
          continue;
        } else {
          await db.apiKey.update({
            where: { id: apikey.id },
            data: { lastErrorMessage: lasterror },
          });
        }

        const retryAfterHeader = upstream.headers.get("retry-after");
        upstream = null;

        // handle 429 with retry-after
        if (laststatus === 429) {
          const retryAfter = retryAfterHeader;
          if (retryAfter) {
            const retryMs = parseInt(retryAfter, 10) * 1000;
            if (retryMs > 0 && retryMs < 60000) {
              await sleep(retryMs);
              continue;
            }
          }
          if (lasterror.includes("ResourceExhausted") || lasterror.includes("rate_limit") || lasterror.includes("overloaded")) {
            if (attempt < MAX_RETRIES - 1) await sleep(5000 * (attempt + 1));
            continue;
          }
        }

        // handle 529 overloaded - rotate model
        if (laststatus === 529 || laststatus === 410) {
          const currentmodel = String(nvidiapayload.model ?? "");
          const nextidx = (DEVTHINK_ROTATION_MODELS.findIndex(m => m.id === currentmodel) + 1) % DEVTHINK_ROTATION_MODELS.length;
          const nextmodel = DEVTHINK_ROTATION_MODELS[nextidx];
          nvidiapayload.model = nextmodel.id;
          if (Object.keys(nextmodel.chattemplatekwargs).length > 0) {
            nvidiapayload.chat_template_kwargs = nextmodel.chattemplatekwargs;
          } else {
            delete nvidiapayload.chat_template_kwargs;
          }
          rotatedmodel = nextmodel.id;
          console.log(`[v3/messages] 529 overloaded, rotating model: ${currentmodel} -> ${nextmodel.id}`);
        }

        // 400 bad request - don't retry
        if (laststatus === 400) break;

        if (!retryablestatuses.has(laststatus)) break;
        if (attempt < MAX_RETRIES - 1) await sleep(backoffdelay(attempt));
      } catch (err: unknown) {
        clearTimeout(headerTimer);
        const aborted = err instanceof Error && /aborted/i.test(err.message);

        if (aborted && modeltimedout) {
          // model timeout (10s) - rotate to next model
          const currentmodel = String(nvidiapayload.model ?? "");
          const nextidx = (DEVTHINK_ROTATION_MODELS.findIndex(m => m.id === currentmodel) + 1) % DEVTHINK_ROTATION_MODELS.length;
          const nextmodel = DEVTHINK_ROTATION_MODELS[nextidx];
          nvidiapayload.model = nextmodel.id;
          if (Object.keys(nextmodel.chattemplatekwargs).length > 0) {
            nvidiapayload.chat_template_kwargs = nextmodel.chattemplatekwargs;
          } else {
            delete nvidiapayload.chat_template_kwargs;
          }
          rotatedmodel = nextmodel.id;
          console.log(`[v3/messages] model timeout after ${headerTimeoutMs}ms, switching: ${currentmodel} -> ${nextmodel.id} (rotation ${modelattempt + 1}/${MAX_MODEL_ROTATIONS})`);
          lasterror = `model ${currentmodel} timed out after ${headerTimeoutMs}ms`;
          laststatus = 504;
          break;
        }

        laststatus = aborted ? 504 : 502;
        lasterror = aborted ? `nvidia fetch timed out after ${headerTimeoutMs}ms` : (err instanceof Error ? err.message : String(err));
        await db.apiKey.update({ where: { id: apikey.id }, data: { lastErrorMessage: lasterror } });
        if (!retryablestatuses.has(laststatus)) break;
        if (attempt < MAX_RETRIES - 1) await sleep(backoffdelay(attempt));
      }
    }

    // got successful response
    if (upstream && upstream.ok) {
      return { upstream, error: "", status: 200, keyId, keyLabel, rotatedmodel };
    }

    // model timed out, try next model
    if (modeltimedout) continue;

    // non-timeout error that's not retryable
    break;
  }

  return { upstream, error: lasterror, status: laststatus, keyId, keyLabel, rotatedmodel };
}

function backoffdelay(a: number): number {
  return Math.min(BACKOFF_CAP, Math.floor(BACKOFF_BASE * Math.pow(2, a) * (0.8 + Math.random() * 0.4)));
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
        content: String(p.content ?? "").slice(0, 4000),
        reasoningContent: String(p.reasoning ?? "").slice(0, 4000) || null,
        route: "/v3/messages",
        provider: PROVIDER,
        model: String(p.model ?? DEFAULT_MODEL),
        keyId: String(p.keyId ?? "") || null,
        finishReason: String(p.finishReason ?? "stop"),
        promptTokens: Number(p.inputTokens ?? 0) || null,
        completionTokens: Number(p.outputTokens ?? 0) || null,
        totalTokens: Number(p.totalTokens ?? 0) || null,
        durationMs: Number(p.durationMs ?? 0) || null,
        allParams: safestringify(p.allParams ?? "").slice(0, 8192) || null,
        allResponse: safestringify(p.allResponse ?? "").slice(0, 8192) || null,
        ip: String(p.ip ?? "unknown"),
        chatId: String(p.sessionid ?? p.chatId ?? "v3msg"),
        chatSubId: String(p.responseid ?? p.requestid ?? "") || null,
      } as never,
    });
  } catch { /* persistence is best-effort */ }
}

// ─── anthropic SSE event helpers ────────────────────────────────────
function anthropevent(event: string, data: unknown): Uint8Array {
  return enc.encode(`event: ${event}\ndata: ${safestringify(data)}\n\n`);
}

function anthropicmessagestart(
  msgid: string,
  model: string,
  inputTokens: number,
): Uint8Array {
  return anthropevent("message_start", {
    type: "message_start",
    message: {
      id: msgid,
      type: "message",
      role: "assistant",
      content: [],
      model,
      stop_reason: null,
      stop_sequence: null,
      usage: { input_tokens: inputTokens, output_tokens: 0 },
    },
  });
}

function anthropicthinkingblockstart(index: number): Uint8Array {
  return anthropevent("content_block_start", {
    type: "content_block_start",
    index,
    content_block: { type: "thinking", thinking: "" },
  });
}

function anthropictextblockstart(index: number): Uint8Array {
  return anthropevent("content_block_start", {
    type: "content_block_start",
    index,
    content_block: { type: "text", text: "" },
  });
}

function anthropicthinkingdelta(index: number, thinking: string): Uint8Array {
  return anthropevent("content_block_delta", {
    type: "content_block_delta",
    index,
    delta: { type: "thinking_delta", thinking },
  });
}

function anthropictextdelta(index: number, text: string): Uint8Array {
  return anthropevent("content_block_delta", {
    type: "content_block_delta",
    index,
    delta: { type: "text_delta", text },
  });
}

function anthropicblockstop(index: number): Uint8Array {
  return anthropevent("content_block_stop", {
    type: "content_block_stop",
    index,
  });
}

function anthropicmessagedelta(
  stopreason: string,
  outputTokens: number,
): Uint8Array {
  return anthropevent("message_delta", {
    type: "message_delta",
    delta: { stop_reason: stopreason, stop_sequence: null },
    usage: { output_tokens: outputTokens },
  });
}

function anthropicmessagestop(): Uint8Array {
  return anthropevent("message_stop", { type: "message_stop" });
}

function anthropicdone(): Uint8Array {
  return enc.encode("event: message_stop\ndata: {\"type\": \"message_stop\"}\n\ndata: [DONE]\n\n");
}

/** map openai finish reason to anthropic stop reason. */
function mapstopreason(fr: string): string {
  if (fr === "stop") return "end_turn";
  if (fr === "length") return "max_tokens";
  if (fr === "tool_calls") return "tool_use";
  return "end_turn";
}

// ─── POST handler ──────────────────────────────────────────────────
export async function POST(req: Request): Promise<Response> {
  const startms = Date.now();
  const ip = getip(req);
  const userAgent = req.headers.get("user-agent") ?? "";
  const sessionid = req.headers.get("x-session-id")
    ?? `v3-${startms}-${Math.random().toString(36).slice(2, 8)}`;
  const requestid = req.headers.get("x-request-id") ?? genid("req");
  const accept = req.headers.get("accept") || "";

  // ── 1. parse body (any content type) ────────────────────────────
  const body = await parsebody(req);

  // ── 2. extract core params ──────────────────────────────────────
  const stream = body.stream === true || body.stream === "true";
  const rawmodel = typeof body.model === "string" ? body.model : DEVTHINK_ID;
  const clientmodel = mapmodel(rawmodel);

  // blocked models
  if (BLOCKED_MODELS.includes(clientmodel as typeof BLOCKED_MODELS[number])) {
    return errorresponse(400, `model ${clientmodel} is blocked`);
  }

  // ── 3. convert anthropic messages to openai format ──────────────
  const messages = convertanthropictoopenai(body);
  if (messages.length === 0) {
    return errorresponse(400, "messages array is required", "invalid_request_error");
  }

  // ── 4. model rotation ───────────────────────────────────────────
  let nvidiamodel = clientmodel;
  let chattemplatekwargs: Record<string, unknown> = {};
  let rotationIndex = 0;
  let messageNumber = 0;

  if (clientmodel === DEVTHINK_ID) {
    const rot = await getrotationmodel(sessionid);
    nvidiamodel = rot.model;
    chattemplatekwargs = rot.chattemplatekwargs;
    rotationIndex = rot.rotationIndex;
    messageNumber = rot.messageNumber;
  } else if (isnvidiachatmodel(clientmodel)) {
    chattemplatekwargs = buildchattemplatekwargs(clientmodel);
  } else {
    // allow unknown models through - nvidia will validate
  }

  const msgid = genid("msg");
  const created = Math.floor(Date.now() / 1000);

  // ── 5. build nvidia payload (PURE PASSTHROUGH) ──────────────────
  // start with ALL client params, then override only what we must
  const nvidiapayload: Record<string, unknown> = { ...body };

  // strip routing/session metadata (never forward to nvidia)
  for (const k of Object.keys(nvidiapayload)) {
    if (STRIP_KEYS.has(k)) delete nvidiapayload[k];
  }

  // strip anthropic-specific fields that nvidia doesn't understand
  delete nvidiapayload.system;
  delete nvidiapayload.metadata;
  delete nvidiapayload.stop_sequences;
  delete nvidiapayload.anthropic_version;
  delete nvidiapayload.anthropic_beta;
  // FORWARD tools as openai function declarations (converted from the
  // anthropic shape) — stripping them made capable models hallucinate their
  // tool syntax as visible text instead of emitting native tool_calls
  if (Array.isArray(body.tools) && (body.tools as unknown[]).length > 0) {
    nvidiapayload.tools = (body.tools as Array<Record<string, unknown>>).map((t) => {
      const name = (t.name ?? (t.function as Record<string, unknown> | undefined)?.name ?? "unknown_tool") as string;
      const desc = ((t.description ?? (t.function as Record<string, unknown> | undefined)?.description ?? "") as string);
      const params = (t.input_schema ?? t.parameters ?? (t.function as Record<string, unknown> | undefined)?.parameters ?? { type: "object", properties: {} }) as Record<string, unknown>;
      return { type: "function", function: { name, description: desc, parameters: params } };
    });
    if (body.tool_choice !== undefined) {
      // anthropic tool_choice {type auto any tool name} → openai form
      const tc = body.tool_choice as Record<string, unknown>;
      if (tc && typeof tc === "object" && typeof tc.type === "string") {
        if (tc.type === "auto") nvidiapayload.tool_choice = "auto";
        else if (tc.type === "any") nvidiapayload.tool_choice = "required";
        else if (tc.type === "tool" && typeof tc.name === "string") nvidiapayload.tool_choice = { type: "function", function: { name: tc.name } };
      } else {
        nvidiapayload.tool_choice = body.tool_choice;
      }
    }
  }

  // override with resolved values
  nvidiapayload.model = nvidiamodel;
  nvidiapayload.messages = messages;
  nvidiapayload.stream = stream;

  // map max_tokens if present
  if (body.max_tokens !== undefined) {
    nvidiapayload.max_tokens = Number(body.max_tokens) || MAX_TOKENS;
  }

  // force stream_options for usage reporting
  if (stream && !nvidiapayload.stream_options) {
    nvidiapayload.stream_options = { include_usage: true };
  }

  // force chat_template_kwargs for thinking (always enabled, always high)
  if (!nvidiapayload.chat_template_kwargs || Object.keys(nvidiapayload.chat_template_kwargs as Record<string, unknown>).length === 0) {
    if (Object.keys(chattemplatekwargs).length > 0) {
      nvidiapayload.chat_template_kwargs = chattemplatekwargs;
    } else {
      nvidiapayload.chat_template_kwargs = { enable_thinking: true };
    }
  }

  // force reasoning_effort to high if not set (equivalent to thinking budget = 68000)
  if (!nvidiapayload.reasoning_effort) {
    nvidiapayload.reasoning_effort = "high";
  }

  // enforce max_tokens cap at 68000 for devthink rotation models
  if (nvidiapayload.max_tokens && Number(nvidiapayload.max_tokens) > 68000) {
    nvidiapayload.max_tokens = 68000;
  }

  // ── 6. determine content type (before fetch for immediate stream start) ──
  const wantsNDJSON = accept.includes("application/x-ndjson");
  const wantsSSE = !wantsNDJSON && (accept.includes("text/event-stream") || stream);
  const wantsPlain = accept.includes("text/plain") && !stream;
  const wantsBinary = accept.includes("application/octet-stream") && !stream;

  // ── 7. STREAMING: immediate start architecture ───────────────────
  // Create the ReadableStream and return the Response IMMEDIATELY.
  // Send a message_start event right away so the client knows the stream is active.
  // Then do fetchwithretry INSIDE the ReadableStream's start() callback.
  // This eliminates the latency where the client waits for NVIDIA headers.
  if (stream) {
    // estimate input tokens for immediate message_start
    const estimatedInputTokens = Math.ceil(messages.reduce((s, m) => s + String(m.content ?? "").length, 0) / 4);

    if (wantsSSE && !wantsNDJSON) {
      // ── SSE streaming: immediate start ──────────────────────────
      const responseHeaders = new Headers();
      responseHeaders.set("content-type", "text/event-stream; charset=utf-8");
      responseHeaders.set("cache-control", "no-cache, no-transform");
      responseHeaders.set("connection", "keep-alive");
      responseHeaders.set("x-accel-buffering", "no");
      responseHeaders.set("x-request-id", requestid);
      responseHeaders.set("x-session-id", sessionid);
      for (const [k, v] of Object.entries(corsheaders())) {
        responseHeaders.set(k, v);
      }

      // KEEPALIVE from first byte + client-disconnect wiring (visible to cancel)
      let kaRef: ReturnType<typeof setInterval> | null = null;
      let sseReaderRef: ReadableStreamDefaultReader<Uint8Array> | null = null;
      let clientGone = false;
      const outStream = new ReadableStream<Uint8Array>({
        async start(c) {
          // ── send message_start IMMEDIATELY so client knows stream is active ──
          c.enqueue(anthropicmessagestart(msgid, rawmodel, estimatedInputTokens));
          // keepalive comment every 200ms from the first byte (KEEPALIVE_MS
          // was declared but never wired here — silent thinking windows
          // triggered reconnect loops)
          kaRef = setInterval(() => {
            if (clientGone) return;
            try { c.enqueue(enc.encode(": ka\n\n")); } catch {}
          }, KEEPALIVE_MS);

          // streaming state
          let tContent = "";
          let tReasoning = "";
          let tInputTokens = estimatedInputTokens;
          let tOutputTokens = 0;
          let tThinkingTokens = 0;
          let tFinishReason = "stop";
          let tUsageSeen = false;
          let firstTokenMs = 0;
          let sseBuf = "";

          // anthropic streaming state
          let thinkingBlockStarted = false;
          let textBlockStarted = false;
          let thinkingBlockIndex = -1;
          let textBlockIndex = -1;

          // fetch result tracking for DB persistence
          let fetchKeyid = "";
          let fetchKeylabel = "";
          let fetchError = "";
          let fetchStatus = 200;

          try {
            // ── do fetchwithretry INSIDE the stream ────────────────
            const { upstream, error: lasterror, status: laststatus, keyId, keyLabel, rotatedmodel: finalrotatedmodel } = await fetchwithretry(nvidiapayload, stream);
            fetchKeyid = keyId;
            fetchKeylabel = keyLabel;

            if (finalrotatedmodel && finalrotatedmodel !== nvidiamodel) {
              nvidiamodel = finalrotatedmodel;
            }

            // ── if fetch failed, send error event in the stream ────
            if (!upstream || !upstream.ok || !upstream.body) {
              const msg = (!upstream || !upstream.ok) ? (lasterror || `upstream ${laststatus}`) : "upstream returned no body";
              const st = (!upstream || !upstream.ok) ? laststatus : 502;
              fetchError = msg;
              fetchStatus = st;
              c.enqueue(anthropevent("error", { type: "error", error: { type: "api_error", message: msg } }));
              c.enqueue(anthropicmessagedelta("end_turn", 0));
              c.enqueue(anthropicmessagestop());
              c.enqueue(enc.encode("data: [DONE]\n\n"));
              return;
            }

            // ── pipe chunks from upstream in real-time ──────────────
            const reader = upstream.body.getReader();
            sseReaderRef = reader;

            for (;;) {
              if (clientGone) break;
              const { done, value } = await reader.read();
              if (done) break;

              if (firstTokenMs === 0) firstTokenMs = Date.now() - startms;

              // parse SSE internally for anthropic conversion + DB tracking
              const text = dec.decode(value, { stream: true });
              sseBuf += text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

              // ROBUST SSE PARSER (brace-depth): extracts `data: <json>` events
              // by tracking {} depth, INDEPENDENT of \n\n separators. Fixes the
              // "JSON Parse error: Expected ':'" bug caused by NVIDIA omitting
              // \n\n between events or splitting a JSON value mid-string.
              // Corrupted (unterminated) chunks are DISCARDED, never relayed.
              const parsed = extractsse(sseBuf);
              sseBuf = parsed.rest;

              for (const line of parsed.items) {
                if (line === "[DONE]") {
                  continue;
                }

                try {
                  const j = JSON.parse(line);
                  const delta = j?.choices?.[0]?.delta;
                  const finishReason = j?.choices?.[0]?.finish_reason;

                  // ── update input tokens from usage (message_start already sent) ──
                  if (j.usage && typeof j.usage === "object") {
                    tInputTokens = Number(j.usage.prompt_tokens ?? tInputTokens);
                  }

                  // ── handle reasoning_content (thinking) ──────────
                  if (delta?.reasoning_content) {
                    const rc = String(delta.reasoning_content);
                    tReasoning += rc;

                    if (!thinkingBlockStarted) {
                      thinkingBlockStarted = true;
                      thinkingBlockIndex = 0;
                      c.enqueue(anthropicthinkingblockstart(thinkingBlockIndex));
                    }

                    c.enqueue(anthropicthinkingdelta(thinkingBlockIndex, rc));
                  }

                  // ── handle content (text) ────────────────────────
                  if (delta?.content) {
                    const ct = String(delta.content);
                    tContent += ct;

                    if (!textBlockStarted) {
                      textBlockStarted = true;
                      textBlockIndex = thinkingBlockStarted ? 1 : 0;
                      c.enqueue(anthropictextblockstart(textBlockIndex));
                    }

                    c.enqueue(anthropictextdelta(textBlockIndex, ct));
                  }

                  // ── handle finish_reason ─────────────────────────
                  if (finishReason && finishReason !== null) {
                    tFinishReason = String(finishReason);
                  }

                  // ── track usage if present ──────────────────────
                  if (j.usage && typeof j.usage === "object") {
                    tUsageSeen = true;
                    tInputTokens = Number(j.usage.prompt_tokens ?? tInputTokens);
                    tOutputTokens = Number(j.usage.completion_tokens ?? tOutputTokens);
                    const ctd = j.usage.completion_tokens_details ?? {};
                    tThinkingTokens = Number(ctd.reasoning_tokens ?? tThinkingTokens);
                  }
                } catch {
                  // brace-depth parser already validated braces; if JSON.parse
                  // still fails, DISCARD instead of relaying broken JSON to
                  // client (prevents "Expected ':'" errors propagating)
                  console.warn("[v3/messages] SSE: discarding unparseable JSON chunk");
                }
              }
            }

            // ── close any open content blocks ─────────────────────
            if (thinkingBlockStarted) {
              c.enqueue(anthropicblockstop(thinkingBlockIndex));
            }
            if (textBlockStarted) {
              c.enqueue(anthropicblockstop(textBlockIndex));
            }

            // ── inject usage if nvidia never sent it ──────────────
            if (!tUsageSeen) {
              if (tInputTokens === 0 && tOutputTokens === 0) {
                tInputTokens = estimatedInputTokens;
                tOutputTokens = Math.ceil((tContent.length + tReasoning.length) / 4);
                tThinkingTokens = Math.ceil(tReasoning.length / 4);
              }
            }

            // ── emit message_delta with stop reason + usage ───────
            const stopreason = mapstopreason(tFinishReason);
            const finalOutputTokens = tOutputTokens || Math.ceil((tContent.length + tReasoning.length) / 4);
            c.enqueue(anthropicmessagedelta(stopreason, finalOutputTokens));

            // ── emit message_stop ─────────────────────────────────
            c.enqueue(anthropicmessagestop());

            // ── emit [DONE] ───────────────────────────────────────
            c.enqueue(enc.encode("data: [DONE]\n\n"));
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            fetchError = `stream error: ${msg}`;
            fetchStatus = 502;
            try {
              c.enqueue(anthropevent("error", { type: "error", error: { type: "stream_error", message: `stream error: ${msg}` } }));
            } catch {}
          } finally {
            if (kaRef) clearInterval(kaRef);
            // save to DB (fire-and-forget)
            const thinkingLevel = extractthinkingLevel(body);
            const dbcommon = {
              content: "", reasoning: "",
              model: rawmodel, rotatedmodel: nvidiamodel, sessionid, responseid: msgid, requestid,
              allParams: body, thinkingLevel, thinkingBudget: THINKING_BUDGETS[thinkingLevel] ?? 68000, thinkenabled: true,
              temperature: body.temperature ?? 1, topp: body.top_p ?? 1, topk: body.top_k ?? 50, maxtokens: body.max_tokens ?? MAX_TOKENS,
              thinkingTokens: 0, responseTokens: 0,
              inputTokens: 0, outputTokens: 0, totalTokens: 0,
              finishReason: "stop", ip, userAgent, keyId: fetchKeyid, keyLabel: fetchKeylabel, rotationIndex, messageNumber,
              contextShared: true, devthinkContext: 0, devthinkOutput: MAX_TOKENS,
              startms, autoFixApplied: "", chattemplatekwargs,
            };
            const responseTokens = tThinkingTokens > 0 ? Math.max(0, tOutputTokens - tThinkingTokens) : tOutputTokens;
            void savedb({
              ...dbcommon,
              content: tContent.slice(0, 4000),
              reasoning: tReasoning.slice(0, 4000),
              stream: true, streamMode: true,
              inputTokens: tInputTokens, outputTokens: tOutputTokens, thinkingTokens: tThinkingTokens, responseTokens,
              totalTokens: tInputTokens + tOutputTokens,
              finishReason: tFinishReason,
              allResponse: tContent.slice(0, 4096),
              durationMs: Date.now() - startms,
              firstTokenMs,
              httpStatus: fetchError ? fetchStatus : 200,
              ...(fetchError ? { error: fetchError } : {}),
            });
            try { c.close(); } catch {}
          }
        },
        cancel() {
          // client disconnect aborts the upstream read (no leaked requests)
          clientGone = true;
          try { sseReaderRef?.cancel(); } catch {}
          if (kaRef) clearInterval(kaRef);
        },
      });

      return new Response(outStream, { status: 200, headers: responseHeaders });
    }

    // ── NDJSON streaming: immediate start ─────────────────────────
    const ndHeaders = new Headers();
    ndHeaders.set("content-type", "application/x-ndjson");
    ndHeaders.set("cache-control", "no-cache");
    ndHeaders.set("connection", "keep-alive");
    for (const [k, v] of Object.entries(corsheaders())) {
      ndHeaders.set(k, v);
    }

    // KEEPALIVE + client-disconnect wiring for the ndjson lane
    let ndKaRef: ReturnType<typeof setInterval> | null = null;
    let ndReaderRef: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let ndClientGone = false;
    const ndStream = new ReadableStream<Uint8Array>({
      async start(c) {
        // ── send message_start IMMEDIATELY ────────────────────────
        c.enqueue(enc.encode(safestringify({
          type: "message_start",
          message: { id: msgid, type: "message", role: "assistant", content: [], model: rawmodel, stop_reason: null, stop_sequence: null, usage: { input_tokens: estimatedInputTokens, output_tokens: 0 } },
        }) + "\n"));
        // keepalive line every 200ms from the first byte
        ndKaRef = setInterval(() => {
          if (ndClientGone) return;
          try { c.enqueue(enc.encode("# ka\n")); } catch {}
        }, KEEPALIVE_MS);

        let ndContent = "";
        let ndReasoning = "";
        let ndInputTokens = estimatedInputTokens;
        let ndOutputTokens = 0;
        let ndThinkingTokens = 0;
        let ndFinishReason = "stop";
        let ndFirstTokenMs = 0;
        let ndBuf = "";
        let ndThinkingBlockStarted = false;
        let ndTextBlockStarted = false;
        let ndThinkingBlockIndex = -1;
        let ndTextBlockIndex = -1;
        let ndFetchKeyid = "";
        let ndFetchKeylabel = "";
        let ndFetchError = "";
        let ndFetchStatus = 200;

        try {
          // ── do fetchwithretry INSIDE the stream ──────────────────
          const { upstream, error: lasterror, status: laststatus, keyId, keyLabel, rotatedmodel: finalrotatedmodel } = await fetchwithretry(nvidiapayload, stream);
          ndFetchKeyid = keyId;
          ndFetchKeylabel = keyLabel;

          if (finalrotatedmodel && finalrotatedmodel !== nvidiamodel) {
            nvidiamodel = finalrotatedmodel;
          }

          // ── if fetch failed, send error in stream ───────────────
          if (!upstream || !upstream.ok || !upstream.body) {
            const msg = (!upstream || !upstream.ok) ? (lasterror || `upstream ${laststatus}`) : "upstream returned no body";
            const st = (!upstream || !upstream.ok) ? laststatus : 502;
            ndFetchError = msg;
            ndFetchStatus = st;
            c.enqueue(enc.encode(safestringify({ type: "error", error: { type: "api_error", message: msg } }) + "\n"));
            c.enqueue(enc.encode(safestringify({ type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 0 } }) + "\n"));
            c.enqueue(enc.encode(safestringify({ type: "message_stop" }) + "\n"));
            return;
          }

          // ── pipe chunks from upstream ────────────────────────────
          const reader = upstream.body.getReader();
          ndReaderRef = reader;

          for (;;) {
            if (ndClientGone) break;
            const { done, value } = await reader.read();
            if (done) break;
            if (ndFirstTokenMs === 0) ndFirstTokenMs = Date.now() - startms;

            const text = dec.decode(value, { stream: true });
            ndBuf += text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

            // ROBUST SSE PARSER (brace-depth) for NDJSON path too
            const ndparsed = extractsse(ndBuf);
            ndBuf = ndparsed.rest;

            for (const line of ndparsed.items) {
              if (line === "[DONE]") continue;

              try {
                const j = JSON.parse(line);
                const delta = j?.choices?.[0]?.delta;
                const finishReason = j?.choices?.[0]?.finish_reason;

                // update input tokens from usage (message_start already sent)
                if (j.usage) ndInputTokens = Number(j.usage.prompt_tokens ?? ndInputTokens);

                if (delta?.reasoning_content) {
                  const rc = String(delta.reasoning_content);
                  ndReasoning += rc;
                  if (!ndThinkingBlockStarted) {
                    ndThinkingBlockStarted = true;
                    ndThinkingBlockIndex = 0;
                    c.enqueue(enc.encode(safestringify({ type: "content_block_start", index: ndThinkingBlockIndex, content_block: { type: "thinking", thinking: "" } }) + "\n"));
                  }
                  c.enqueue(enc.encode(safestringify({ type: "content_block_delta", index: ndThinkingBlockIndex, delta: { type: "thinking_delta", thinking: rc } }) + "\n"));
                }

                if (delta?.content) {
                  const ct = String(delta.content);
                  ndContent += ct;
                  if (!ndTextBlockStarted) {
                    ndTextBlockStarted = true;
                    ndTextBlockIndex = ndThinkingBlockStarted ? 1 : 0;
                    c.enqueue(enc.encode(safestringify({ type: "content_block_start", index: ndTextBlockIndex, content_block: { type: "text", text: "" } }) + "\n"));
                  }
                  c.enqueue(enc.encode(safestringify({ type: "content_block_delta", index: ndTextBlockIndex, delta: { type: "text_delta", text: ct } }) + "\n"));
                }

                if (finishReason && finishReason !== null) ndFinishReason = String(finishReason);

                if (j.usage) {
                  ndInputTokens = Number(j.usage.prompt_tokens ?? ndInputTokens);
                  ndOutputTokens = Number(j.usage.completion_tokens ?? ndOutputTokens);
                  const ctd = j.usage.completion_tokens_details ?? {};
                  ndThinkingTokens = Number(ctd.reasoning_tokens ?? ndThinkingTokens);
                }
              } catch {
                // brace-depth parser already validated braces; DISCARD unparseable
                console.warn("[v3/messages] NDJSON: discarding unparseable JSON chunk");
              }
            }
          }

          // close blocks
          if (ndThinkingBlockStarted) c.enqueue(enc.encode(safestringify({ type: "content_block_stop", index: ndThinkingBlockIndex }) + "\n"));
          if (ndTextBlockStarted) c.enqueue(enc.encode(safestringify({ type: "content_block_stop", index: ndTextBlockIndex }) + "\n"));

          // inject usage if missing
          if (ndInputTokens === 0 && ndOutputTokens === 0 && (ndContent.length > 0 || ndReasoning.length > 0)) {
            ndInputTokens = estimatedInputTokens;
            ndOutputTokens = Math.ceil((ndContent.length + ndReasoning.length) / 4);
            ndThinkingTokens = Math.ceil(ndReasoning.length / 4);
          }

          const stopreason = mapstopreason(ndFinishReason);
          const finalOutputTokens = ndOutputTokens || Math.ceil((ndContent.length + ndReasoning.length) / 4);

          c.enqueue(enc.encode(safestringify({ type: "message_delta", delta: { stop_reason: stopreason, stop_sequence: null }, usage: { output_tokens: finalOutputTokens } }) + "\n"));
          c.enqueue(enc.encode(safestringify({ type: "message_stop" }) + "\n"));
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          ndFetchError = `stream error: ${msg}`;
          ndFetchStatus = 502;
          try { c.enqueue(enc.encode(safestringify({ type: "error", error: { type: "stream_error", message: `stream error: ${msg}` } }) + "\n")); } catch {}
        } finally {
          if (ndKaRef) clearInterval(ndKaRef);
          const thinkingLevel = extractthinkingLevel(body);
          const dbcommon = {
            content: "", reasoning: "",
            model: rawmodel, rotatedmodel: nvidiamodel, sessionid, responseid: msgid, requestid,
            allParams: body, thinkingLevel, thinkingBudget: THINKING_BUDGETS[thinkingLevel] ?? 68000, thinkenabled: true,
            temperature: body.temperature ?? 1, topp: body.top_p ?? 1, topk: body.top_k ?? 50, maxtokens: body.max_tokens ?? MAX_TOKENS,
            thinkingTokens: 0, responseTokens: 0,
            inputTokens: 0, outputTokens: 0, totalTokens: 0,
            finishReason: "stop", ip, userAgent, keyId: ndFetchKeyid, keyLabel: ndFetchKeylabel, rotationIndex, messageNumber,
            contextShared: true, devthinkContext: 0, devthinkOutput: MAX_TOKENS,
            startms, autoFixApplied: "", chattemplatekwargs,
          };
          const responseTokens = ndThinkingTokens > 0 ? Math.max(0, ndOutputTokens - ndThinkingTokens) : ndOutputTokens;
          void savedb({
            ...dbcommon, content: ndContent.slice(0, 4000), reasoning: ndReasoning.slice(0, 4000),
            stream: true, streamMode: true,
            inputTokens: ndInputTokens, outputTokens: ndOutputTokens, thinkingTokens: ndThinkingTokens, responseTokens,
            totalTokens: ndInputTokens + ndOutputTokens, finishReason: ndFinishReason,
            allResponse: ndContent.slice(0, 4096), durationMs: Date.now() - startms, firstTokenMs: ndFirstTokenMs,
            httpStatus: ndFetchError ? ndFetchStatus : 200,
            ...(ndFetchError ? { error: ndFetchError } : {}),
          });
          try { c.close(); } catch {}
        }
      },
      cancel() {
        ndClientGone = true;
        try { ndReaderRef?.cancel(); } catch {}
        if (ndKaRef) clearInterval(ndKaRef);
      },
    });

    return new Response(ndStream, { status: 200, headers: ndHeaders });
  }

  // ── 8. NON-STREAMING: fetch then process ─────────────────────────
  const { upstream, error: lasterror, status: laststatus, keyId, keyLabel, rotatedmodel: finalrotatedmodel } = await fetchwithretry(nvidiapayload, stream);

  if (finalrotatedmodel && finalrotatedmodel !== nvidiamodel) {
    nvidiamodel = finalrotatedmodel;
  }

  const thinkingLevel = extractthinkingLevel(body);
  const dbcommon = {
    content: "", reasoning: "",
    model: rawmodel, rotatedmodel: nvidiamodel, sessionid, responseid: msgid, requestid,
    allParams: body, thinkingLevel, thinkingBudget: THINKING_BUDGETS[thinkingLevel] ?? 68000, thinkenabled: true,
    temperature: body.temperature ?? 1, topp: body.top_p ?? 1, topk: body.top_k ?? 50, maxtokens: body.max_tokens ?? MAX_TOKENS,
    thinkingTokens: 0, responseTokens: 0,
    inputTokens: 0, outputTokens: 0, totalTokens: 0,
    finishReason: "stop", ip, userAgent, keyId, keyLabel, rotationIndex, messageNumber,
    contextShared: true, devthinkContext: 0, devthinkOutput: MAX_TOKENS,
    startms, autoFixApplied: "", chattemplatekwargs,
  };

  if (!upstream || !upstream.ok) {
    const msg = lasterror || `upstream ${laststatus}`;
    void savedb({ ...dbcommon, error: msg, durationMs: Date.now() - startms, httpStatus: laststatus });
    return errorresponse(laststatus, msg);
  }

  // ── 9. NON-STREAMING: collect upstream and convert to anthropic ──
  const raw: unknown = await upstream.json();
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  // extract content/reasoning from openai response (read-only, no mutation)
  const choices = (data.choices ?? []) as Array<Record<string, unknown>>;
  let content = "";
  let reasoning = "";
  let finishReason = "stop";
  if (choices[0]) {
    const message = (choices[0].message ?? {}) as Record<string, unknown>;
    content = typeof message.content === "string" ? message.content : "";
    reasoning = typeof message.reasoning_content === "string" ? message.reasoning_content : "";
    finishReason = typeof choices[0].finish_reason === "string" ? choices[0].finish_reason : "stop";
  }

  // extract usage (read-only)
  const usage = (data.usage ?? {}) as Record<string, unknown>;
  let inputTokens = Number(usage.prompt_tokens ?? 0);
  let outputTokens = Number(usage.completion_tokens ?? 0);
  let thinkingTokens = Number((usage.completion_tokens_details as Record<string, unknown> | undefined)?.reasoning_tokens ?? usage.reasoning_tokens ?? 0);
  if (thinkingTokens === 0 && reasoning.length > 0) {
    thinkingTokens = Math.ceil(reasoning.length / 4);
  }
  const responseTokens = thinkingTokens > 0 ? Math.max(0, outputTokens - thinkingTokens) : outputTokens;
  const totalTokens = inputTokens + outputTokens;

  // fix usage if nvidia omitted total_tokens
  if (inputTokens === 0 && outputTokens === 0 && (content.length > 0 || reasoning.length > 0)) {
    const msgChars = messages.reduce((s, m) => s + String(m.content ?? "").length, 0);
    inputTokens = Math.ceil(msgChars / 4);
    outputTokens = Math.ceil((content.length + reasoning.length) / 4);
    thinkingTokens = Math.ceil(reasoning.length / 4);
  }

  const stopreason = mapstopreason(finishReason);

  // ── build anthropic message response ─────────────────────────────
  const anthropiccontent: Array<Record<string, unknown>> = [];
  if (reasoning) {
    anthropiccontent.push({ type: "thinking", thinking: reasoning });
  }
  anthropiccontent.push({ type: "text", text: content });

  const anthropicmsg = {
    id: msgid,
    type: "message",
    role: "assistant",
    content: anthropiccontent,
    model: rawmodel,
    stop_reason: stopreason,
    stop_sequence: null,
    usage: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    },
  };

  // ── content type negotiation for non-streaming ──────────────────
  // if client wants streaming but we got non-streaming upstream, convert
  if (wantsNDJSON || wantsSSE) {
    const isNDJSON = wantsNDJSON;
    const outHeaders = new Headers();
    outHeaders.set("content-type", isNDJSON ? "application/x-ndjson" : "text/event-stream; charset=utf-8");
    outHeaders.set("cache-control", "no-cache, no-transform");
    outHeaders.set("connection", "keep-alive");
    outHeaders.set("x-accel-buffering", "no");
    for (const [k, v] of Object.entries(corsheaders())) outHeaders.set(k, v);

    const outStream = new ReadableStream<Uint8Array>({
      async start(c) {
        try {
          // message_start
          const msgStart = { type: "message_start", message: { id: msgid, type: "message", role: "assistant", content: [], model: rawmodel, stop_reason: null, stop_sequence: null, usage: { input_tokens: inputTokens, output_tokens: 0 } } };
          if (isNDJSON) {
            c.enqueue(enc.encode(safestringify(msgStart) + "\n"));
          } else {
            c.enqueue(anthropevent("message_start", msgStart));
          }

          // thinking block (if any)
          let blockIdx = 0;
          if (reasoning) {
            const thinkStart = { type: "content_block_start", index: blockIdx, content_block: { type: "thinking", thinking: "" } };
            if (isNDJSON) {
              c.enqueue(enc.encode(safestringify(thinkStart) + "\n"));
              c.enqueue(enc.encode(safestringify({ type: "content_block_delta", index: blockIdx, delta: { type: "thinking_delta", thinking: reasoning } }) + "\n"));
            } else {
              c.enqueue(anthropevent("content_block_start", thinkStart));
              c.enqueue(anthropicthinkingdelta(blockIdx, reasoning));
            }
            const blockStop = { type: "content_block_stop", index: blockIdx };
            if (isNDJSON) {
              c.enqueue(enc.encode(safestringify(blockStop) + "\n"));
            } else {
              c.enqueue(anthropevent("content_block_stop", blockStop));
            }
            blockIdx++;
          }

          // text block
          const textStart = { type: "content_block_start", index: blockIdx, content_block: { type: "text", text: "" } };
          if (isNDJSON) {
            c.enqueue(enc.encode(safestringify(textStart) + "\n"));
            c.enqueue(enc.encode(safestringify({ type: "content_block_delta", index: blockIdx, delta: { type: "text_delta", text: content } }) + "\n"));
          } else {
            c.enqueue(anthropevent("content_block_start", textStart));
            c.enqueue(anthropictextdelta(blockIdx, content));
          }
          const textStop = { type: "content_block_stop", index: blockIdx };
          if (isNDJSON) {
            c.enqueue(enc.encode(safestringify(textStop) + "\n"));
          } else {
            c.enqueue(anthropevent("content_block_stop", textStop));
          }

          // message_delta
          const msgDelta = { type: "message_delta", delta: { stop_reason: stopreason, stop_sequence: null }, usage: { output_tokens: outputTokens } };
          if (isNDJSON) {
            c.enqueue(enc.encode(safestringify(msgDelta) + "\n"));
            c.enqueue(enc.encode(safestringify({ type: "message_stop" }) + "\n"));
          } else {
            c.enqueue(anthropevent("message_delta", msgDelta));
            c.enqueue(anthropevent("message_stop", { type: "message_stop" }));
            c.enqueue(enc.encode("data: [DONE]\n\n"));
          }
        } catch {} finally { try { c.close(); } catch {} }
      },
    });

    void savedb({ ...dbcommon, content: content.slice(0, 4000), reasoning: reasoning.slice(0, 4000), stream: true, streamMode: true, allResponse: content.slice(0, 4096), durationMs: Date.now() - startms, httpStatus: 200, inputTokens, outputTokens, thinkingTokens, responseTokens, totalTokens, finishReason });
    return new Response(outStream, { status: 200, headers: outHeaders });
  }

  if (wantsPlain) {
    void savedb({ ...dbcommon, content: content.slice(0, 4000), reasoning: reasoning.slice(0, 4000), stream: false, streamMode: false, allResponse: data, durationMs: Date.now() - startms, httpStatus: 200, inputTokens, outputTokens, thinkingTokens, responseTokens, totalTokens, finishReason });
    return new Response(content, { status: 200, headers: plainheaders() });
  }

  if (wantsBinary) {
    void savedb({ ...dbcommon, content: content.slice(0, 4000), reasoning: reasoning.slice(0, 4000), stream: false, streamMode: false, allResponse: data, durationMs: Date.now() - startms, httpStatus: 200, inputTokens, outputTokens, thinkingTokens, responseTokens, totalTokens, finishReason });
    return new Response(Buffer.from(safestringify(anthropicmsg), "utf-8"), { status: 200, headers: { "content-type": "application/octet-stream", ...corsheaders() } });
  }

  // JSON (default - anthropic format)
  void savedb({ ...dbcommon, content: content.slice(0, 4000), reasoning: reasoning.slice(0, 4000), stream: false, streamMode: false, allResponse: anthropicmsg, durationMs: Date.now() - startms, httpStatus: 200, inputTokens, outputTokens, thinkingTokens, responseTokens, totalTokens, finishReason });
  return jsonresponse(anthropicmsg);
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
