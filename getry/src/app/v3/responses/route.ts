const secrand = (): number => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296; // ids and jitter draw from the CSPRNG, never from Math.random
/**
 * v3/responses/route.ts
 *
 * nvidia v3 - openai responses api format endpoint.
 * definitive pass-through proxy: format conversion, zero content filtering.
 *
 * accepts the openai /v1/responses format and converts to chat.completions
 * format for nvidia, then converts the response back to the responses api shape.
 *
 * core principle: the API is a workflow proxy for AI agents.
 *   - client sends responses-api payload -> we convert input to messages -> forward to NVIDIA
 *   - NVIDIA responds -> we convert chat.completions shape back to responses-api shape
 *   - we parse SSE internally ONLY for DB persistence (content/reasoning/tokens)
 *   - we fix usage ONLY when NVIDIA omits total_tokens
 *   - NO content filtering, NO XML parsing, NO chunk cleaning, NO message normalization
 *
 * key differences from chat/completions:
 *   - input format: { model, input: string | Message[], stream, ... }
 *     instead of { model, messages, stream, ... }
 *   - input can be a string (converted to [{ role: "user", content: input }])
 *     or an array of messages
 *   - response format is responses api:
 *     { id, object: "response", model, output: [{ type: "message", role: "assistant",
 *       content: [{ type: "output_text", text }] }], usage: { input_tokens, output_tokens, total_tokens } }
 *   - streaming uses NDJSON with event types:
 *     response.created, response.in_progress, response.output_item.added,
 *     response.content_part.added, response.output_text.delta,
 *     response.output_text.done, response.output_item.done, response.completed
 *   - the response.completed event includes the full response object with usage
 *
 * features:
 *   - SSE relay pattern for streaming: buffer → parse complete data: events → autofix model → re-emit
 *   - pure payload spread: forward ALL client params to NVIDIA (strip only routing metadata)
 *   - 10s model switching on timeout (rotate to next model in DevThink rotation)
 *   - near-infinite timeout (2147483647ms) for both server and streaming body
 *   - thinking always enabled at max (chat_template_kwargs forced if not present)
 *   - LRU key rotation across 25 NVIDIA API keys
 *   - 40 http methods, 5 content types
 *   - DB persistence (fire-and-forget, best-effort)
 *   - minimal message handling: only flatten content arrays for NVIDIA compat
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
const ROUTE = "v3/responses";
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
        console.warn("[v3/responses] SSE: discarding corrupted chunk (unterminated JSON)");
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

function sseheaders(): Record<string, string> {
  return {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    "connection": "keep-alive",
    "x-accel-buffering": "no",
    ...corsheaders(),
  };
}

function ndjsonheaders(): Record<string, string> {
  return {
    "content-type": "application/x-ndjson",
    "cache-control": "no-cache",
    "connection": "keep-alive",
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

// ─── convert responses-api input -> openai messages ─────────────────
/**
 * convertinputtomessages: convert the responses-api input field to
 * an openai-compatible messages array for NVIDIA chat.completions.
 *
 *   - if input is a string: [{ role: "user", content: input }]
 *   - if input is an array: convert each item (flatten content arrays)
 *   - if body.instructions is set: prepend as system message
 *   - keep ALL other message fields as-is (no filtering, no stripping)
 */
function convertinputtomessages(body: Record<string, unknown>): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];

  // instructions -> system message
  if (typeof body.instructions === "string" && body.instructions) {
    out.push({ role: "system", content: body.instructions });
  }

  const input = body.input;

  if (typeof input === "string") {
    out.push({ role: "user", content: input });
    return out;
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      if (!item || typeof item !== "object") {
        // bare string or primitive -> user message
        out.push({ role: "user", content: String(item ?? "") });
        continue;
      }

      // handle both responses-api message format and openai message format
      const msg = { ...(item as Record<string, unknown>) };

      // responses-api items have a "type" field
      // type: "message" -> has role + content array
      if (msg.type === "message" && Array.isArray(msg.content)) {
        // flatten content array: [{ type: "input_text", text: "..." }] -> string
        msg.content = (msg.content as Array<Record<string, unknown>>)
          .map((part: Record<string, unknown>) => {
            if (typeof part === "string") return part;
            if (typeof part === "object" && part !== null) {
              return String(part.text ?? part.content ?? "");
            }
            return String(part ?? "");
          })
          .join("\n");
        delete msg.type; // strip responses-api type field
      } else if (Array.isArray(msg.content)) {
        // openai-format content array -> flatten to string
        msg.content = (msg.content as Array<Record<string, unknown>>)
          .map((part: Record<string, unknown>) => {
            if (typeof part === "string") return part;
            if (typeof part === "object" && part !== null) {
              return String(part.text ?? part.content ?? "");
            }
            return String(part ?? "");
          })
          .join("\n");
      }

      // ensure role exists
      if (!msg.role) msg.role = "user";

      // skip tool/function messages (NVIDIA doesn't support them in responses context)
      if (msg.role === "tool" || msg.role === "function") continue;

      // strip responses-api specific fields that NVIDIA won't understand
      delete msg.type;

      out.push(msg);
    }
    return out;
  }

  // no input at all
  return out;
}

// ─── minimal message handling ──────────────────────────────────────
/**
 * flattenmessages: minimal processing for NVIDIA compat.
 *   - flatten content arrays to strings (NVIDIA chat requires string content)
 *   - fix tool messages missing tool_call_id (NVIDIA 400 error)
 *   - keep ALL other message fields as-is (no filtering, no stripping)
 *   - does NOT strip tool messages, function messages, or any content
 */
function flattenmessages(msgs: unknown[]): Record<string, unknown>[] {
  if (!Array.isArray(msgs)) return [];

  const out: Record<string, unknown>[] = [];

  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i];
    if (!m || typeof m !== "object") {
      out.push({ role: "user", content: String(m ?? "") });
      continue;
    }

    const msg = { ...(m as Record<string, unknown>) };

    // flatten content: array -> string (NVIDIA requires string content for chat)
    if (Array.isArray(msg.content)) {
      msg.content = (msg.content as Array<Record<string, unknown>>)
        .map((part: Record<string, unknown>) => {
          if (typeof part === "string") return part;
          if (typeof part === "object" && part !== null) {
            return String(part.text ?? part.content ?? "");
          }
          return String(part ?? "");
        })
        .join("\n");
    }

    // fix tool messages missing tool_call_id (NVIDIA returns 400 without it)
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

    // for ALL other content types: pass through as-is
    const text = await req.text();
    try { return JSON.parse(text) as Record<string, unknown>; }
    catch { return { input: text }; }
  } catch {
    return {};
  }
}

// ─── responses-api helpers ─────────────────────────────────────────
/**
 * buildresponseshape: convert a chat.completions response to responses-api shape.
 *
 * input:  chat.completions response { id, model, choices: [{ message: { role, content, reasoning_content } }], usage }
 * output: responses-api response   { id, object: "response", model, output: [{ type: "message", ... }], usage: { input_tokens, output_tokens, total_tokens } }
 */
function buildresponseshape(
  respid: string,
  msgid: string,
  model: string,
  content: string,
  reasoning: string,
  inputTokens: number,
  outputTokens: number,
  finishReason: string,
  createdAt: number,
): Record<string, unknown> {
  const outputitems: Record<string, unknown>[] = [];

  // reasoning output item (if present)
  if (reasoning) {
    outputitems.push({
      type: "reasoning",
      id: genid("rs"),
      summary: [],
      content: [{ type: "reasoning_text", text: reasoning }],
    });
  }

  // main message output item
  outputitems.push({
    type: "message",
    id: msgid,
    role: "assistant",
    content: [{
      type: "output_text",
      text: content,
      annotations: [],
    }],
    status: "completed",
  });

  return {
    id: respid,
    object: "response",
    model,
    output: outputitems,
    usage: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
    },
    status: "completed",
    created_at: createdAt,
    completed_at: Math.floor(Date.now() / 1000),
  };
}

/**
 * buildresponseevent: build a single NDJSON event for streaming.
 *
 * event types:
 *   response.created        -> initial response object (status: created)
 *   response.in_progress    -> response started processing (status: in_progress)
 *   response.output_item.added    -> new output item (message) being added
 *   response.content_part.added   -> new content part being added
 *   response.output_text.delta   -> text delta
 *   response.output_text.done    -> text complete
 *   response.output_item.done    -> output item complete
 *   response.completed           -> final event with full response object
 */
function buildevent(type: string, data: unknown): string {
  return safestringify({ type, ...(data as Record<string, unknown>) }) + "\n";
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
          console.log(`[v3/responses] 529 overloaded, rotating model: ${currentmodel} -> ${nextmodel.id}`);
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
          console.log(`[v3/responses] model timeout after ${headerTimeoutMs}ms, switching: ${currentmodel} -> ${nextmodel.id} (rotation ${modelattempt + 1}/${MAX_MODEL_ROTATIONS})`);
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
  return Math.min(BACKOFF_CAP, Math.floor(BACKOFF_BASE * Math.pow(2, a) * (0.8 + secrand() * 0.4)));
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
        route: "/v3/responses",
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
        chatId: String(p.sessionid ?? p.chatId ?? "v3resp"),
        chatSubId: String(p.responseid ?? p.requestid ?? "") || null,
      } as never,
    });
  } catch { /* persistence is best-effort */ }
}

// ─── POST handler ──────────────────────────────────────────────────
export async function POST(req: Request): Promise<Response> {
  const startms = Date.now();
  const ip = getip(req);
  const userAgent = req.headers.get("user-agent") ?? "";
  const sessionid = req.headers.get("x-session-id")
    ?? `v3-${startms}-${secrand().toString(36).slice(2, 8)}`;
  const requestid = req.headers.get("x-request-id") ?? genid("req");
  const accept = req.headers.get("accept") || "";

  // ── 1. parse body (any content type) ────────────────────────────
  const body = await parsebody(req);

  // ── 2. extract core params ──────────────────────────────────────
  const stream = body.stream === true;
  const clientmodel = typeof body.model === "string" ? body.model : DEVTHINK_ID;

  // check blocked models (parity with completions/messages)
  if ((BLOCKED_MODELS as readonly string[]).includes(clientmodel)) {
    return errorresponse(400, `model ${clientmodel} is not available`, "invalid_request");
  }

  // ── 3. convert responses-api input to messages ──────────────────
  const rawmessages = convertinputtomessages(body);
  const messages = flattenmessages(rawmessages);
  if (messages.length === 0) {
    return errorresponse(400, "input is required (string or array)", "invalid_request");
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
    // allow unknown models through - NVIDIA will validate
  }

  const respid = genid("resp");
  const msgid = genid("msg");
  const createdAt = Math.floor(Date.now() / 1000);

  // ── 5. build nvidia payload (PURE PASSTHROUGH) ──────────────────
  // spread ALL client params, then override only what we must
  const nvidiapayload: Record<string, unknown> = { ...body };

  // strip routing/session metadata (never forward to NVIDIA)
  for (const k of Object.keys(nvidiapayload)) {
    if (STRIP_KEYS.has(k)) delete nvidiapayload[k];
  }

  // strip responses-api-specific fields that NVIDIA won't understand
  delete nvidiapayload.input;
  delete nvidiapayload.instructions;

  // convert responses-api max_output_tokens to chat.completions max_tokens
  if (nvidiapayload.max_output_tokens && !nvidiapayload.max_tokens) {
    nvidiapayload.max_tokens = nvidiapayload.max_output_tokens;
  }
  delete nvidiapayload.max_output_tokens;

  // override model with resolved nvidia model
  nvidiapayload.model = nvidiamodel;
  nvidiapayload.messages = messages;
  nvidiapayload.stream = stream;

  // force stream_options for usage reporting (if client didn't set it)
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

  // ── 6. determine content type (BEFORE fetch - needed for immediate stream start) ──
  const wantsNDJSON = accept.includes("application/x-ndjson") || stream;
  const wantsSSE = !wantsNDJSON && accept.includes("text/event-stream");
  const wantsPlain = accept.includes("text/plain") && !stream;
  const wantsBinary = accept.includes("application/octet-stream") && !stream;

  const thinkingLevel = extractthinkingLevel(body);

  // ── 7. STREAMING: IMMEDIATE STREAM START + REAL-TIME RETRANSMISSION ──
  // KEY ARCHITECTURE CHANGE: Start the stream IMMEDIATELY, then do the
  // upstream fetch INSIDE the ReadableStream. This eliminates the latency of
  // waiting for NVIDIA to respond before the client gets the stream headers.
  // Chunks are relayed in real-time as soon as they arrive from NVIDIA.
  // The client gets the stream within ~1ms, not 6+ minutes.
  if (stream) {
    // ── NDJSON path: responses-api streaming events ───────────
    if (wantsNDJSON && !wantsSSE) {
      const ndHeaders = new Headers();
      ndHeaders.set("content-type", "application/x-ndjson");
      ndHeaders.set("cache-control", "no-cache");
      ndHeaders.set("connection", "keep-alive");
      ndHeaders.set("x-accel-buffering", "no");
      ndHeaders.set("x-request-id", requestid);
      ndHeaders.set("x-session-id", sessionid);
      for (const [k, v] of Object.entries(corsheaders())) {
        ndHeaders.set(k, v);
      }

      // KEEPALIVE from first byte + client-disconnect wiring for the ndjson lane
      let ndKaRef: ReturnType<typeof setInterval> | null = null;
      let ndReaderRef: ReadableStreamDefaultReader<Uint8Array> | null = null;
      let ndClientGone = false;
      const outStream = new ReadableStream<Uint8Array>({
        async start(c) {
          // SEND INITIAL EVENTS IMMEDIATELY - client knows stream is active
          const createdObj = {
            id: respid,
            object: "response",
            model: clientmodel,
            output: [],
            status: "created",
            created_at: createdAt,
          };
          c.enqueue(enc.encode(buildevent("response.created", { response: createdObj })));

          const inProgressObj = {
            id: respid,
            object: "response",
            model: clientmodel,
            output: [],
            status: "in_progress",
            created_at: createdAt,
          };
          c.enqueue(enc.encode(buildevent("response.in_progress", { response: inProgressObj })));
          // keepalive line every 200ms from the first byte (KEEPALIVE_MS was
          // declared but never wired here — silent thinking windows
          // triggered reconnect loops)
          ndKaRef = setInterval(() => {
            if (ndClientGone) return;
            try { c.enqueue(enc.encode("# ka\n")); } catch {}
          }, KEEPALIVE_MS);

          // streaming state (for internal tracking only)
          let tContent = "";
          let tReasoning = "";
          let tInputTokens = 0;
          let tOutputTokens = 0;
          let tThinkingTokens = 0;
          let tFinishReason = "stop";
          let tUsageSeen = false;
          let tDoneSeen = false;
          let firstTokenMs = 0;
          let sseBuf = "";
          let sentOutputItemAdded = false;
          let sentContentPartAdded = false;
          let usedKeyid = "";
          let usedKeylabel = "";
          let usedModel = nvidiamodel;

          try {
            // DO THE FETCH INSIDE THE STREAM - this may take time (NVIDIA thinking)
            // but the client already has the NDJSON stream active
            const { upstream, error: lasterror, status: laststatus, keyId: fk, keyLabel: fl, rotatedmodel: finalrotatedmodel } = await fetchwithretry(nvidiapayload, true);

            usedKeyid = fk;
            usedKeylabel = fl;
            if (finalrotatedmodel && finalrotatedmodel !== nvidiamodel) {
              usedModel = finalrotatedmodel;
            }

            if (!upstream || !upstream.ok || !upstream.body) {
              // Send error as NDJSON event (stream already started with 200)
              const errorMsg = lasterror || `upstream ${laststatus}`;
              c.enqueue(enc.encode(safestringify({ type: "error", error: { message: errorMsg, type: "upstream_error", status: laststatus } }) + "\n"));
              void savedb({
                content: "", reasoning: "",
                model: clientmodel, rotatedmodel: usedModel, sessionid, responseid: respid, requestid,
                allParams: body, thinkingLevel, thinkingBudget: THINKING_BUDGETS[thinkingLevel] ?? 68000, thinkenabled: true,
                temperature: body.temperature ?? 1, topp: body.top_p ?? 1, topk: body.top_k ?? 50, maxtokens: body.max_tokens ?? MAX_TOKENS,
                thinkingTokens: 0, responseTokens: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0,
                finishReason: "error", ip, userAgent, keyId: usedKeyid, keyLabel: usedKeylabel, rotationIndex, messageNumber,
                contextShared: true, devthinkContext: 0, devthinkOutput: MAX_TOKENS,
                startms, autoFixApplied: "", chattemplatekwargs,
                error: errorMsg, durationMs: Date.now() - startms, httpStatus: laststatus, stream: true, streamMode: true,
              });
              return;
            }

            // PIPE CHUNKS IN REAL-TIME - as soon as NVIDIA sends bytes, we relay them
            const reader = upstream.body.getReader();
            ndReaderRef = reader;

            for (;;) {
              if (ndClientGone) break;
              const { done, value } = await reader.read();
              if (done) break;

              // track first token latency
              if (firstTokenMs === 0) firstTokenMs = Date.now() - startms;

              // parse SSE internally to convert chat.completions chunks
              // to responses-api NDJSON events
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
                  // emit completion event with full response shape
                  tDoneSeen = true;
                  const responseObj = buildresponseshape(
                    respid, msgid, clientmodel,
                    tContent, tReasoning,
                    tInputTokens, tOutputTokens,
                    tFinishReason, createdAt,
                  );
                  c.enqueue(enc.encode(buildevent("response.completed", responseObj)));
                  continue;
                }

                try {
                  const j = JSON.parse(line);
                  // autofix model name: NVIDIA may return a different model than what client requested
                  if (j.model && j.model !== clientmodel) j.model = clientmodel;
                  const delta = j?.choices?.[0]?.delta;

                  // ── handle role delta (first chunk with role) ──
                  if (delta?.role && !sentOutputItemAdded) {
                    sentOutputItemAdded = true;
                    // output_item.added
                    c.enqueue(enc.encode(buildevent("response.output_item.added", {
                      output_index: 0,
                      item: { type: "message", id: msgid, role: "assistant", content: [], status: "in_progress" },
                    })));
                    // content_part.added
                    sentContentPartAdded = true;
                    c.enqueue(enc.encode(buildevent("response.content_part.added", {
                      output_index: 0,
                      content_index: 0,
                      part: { type: "output_text", text: "", annotations: [] },
                    })));
                  }

                  // ── handle reasoning_content delta ──────────────
                  if (delta?.reasoning_content) {
                    const rc = String(delta.reasoning_content);
                    tReasoning += rc;
                    // emit as output_text.delta (we fold reasoning into
                    // a separate output item for clients that handle it)
                    c.enqueue(enc.encode(buildevent("response.output_text.delta", {
                      output_index: 0,
                      content_index: 0,
                      delta: rc,
                    })));
                  }

                  // ── handle content delta ────────────────────────
                  if (delta?.content) {
                    const ct = String(delta.content);
                    tContent += ct;

                    // ensure initial events were sent
                    if (!sentOutputItemAdded) {
                      sentOutputItemAdded = true;
                      c.enqueue(enc.encode(buildevent("response.output_item.added", {
                        output_index: 0,
                        item: { type: "message", id: msgid, role: "assistant", content: [], status: "in_progress" },
                      })));
                      sentContentPartAdded = true;
                      c.enqueue(enc.encode(buildevent("response.content_part.added", {
                        output_index: 0,
                        content_index: 0,
                        part: { type: "output_text", text: "", annotations: [] },
                      })));
                    }

                    c.enqueue(enc.encode(buildevent("response.output_text.delta", {
                      output_index: 0,
                      content_index: 0,
                      delta: ct,
                    })));
                  }

                  // ── handle finish_reason ────────────────────────
                  const fr = j?.choices?.[0]?.finish_reason;
                  if (fr && fr !== null) {
                    tFinishReason = String(fr);

                    // emit output_text.done
                    c.enqueue(enc.encode(buildevent("response.output_text.done", {
                      output_index: 0,
                      content_index: 0,
                      text: tContent,
                    })));

                    // emit output_item.done
                    c.enqueue(enc.encode(buildevent("response.output_item.done", {
                      output_index: 0,
                      item: {
                        type: "message",
                        id: msgid,
                        role: "assistant",
                        content: [{ type: "output_text", text: tContent, annotations: [] }],
                        status: "completed",
                      },
                    })));
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
                  // still fails, DISCARD instead of relaying broken JSON
                  console.warn("[v3/responses] SSE: discarding unparseable JSON chunk");
                }
              }
            }

            // after stream ends, inject usage if NVIDIA never sent it
            if (!tUsageSeen) {
              if (tInputTokens === 0 && tOutputTokens === 0) {
                const msgChars = messages.reduce((s, m) => s + String(m.content ?? "").length, 0);
                tInputTokens = Math.ceil(msgChars / 4);
                tOutputTokens = Math.ceil((tContent.length + tReasoning.length) / 4);
                tThinkingTokens = Math.ceil(tReasoning.length / 4);
              }
            }

            // emit final response.completed event if [DONE] was not seen
            // (some NVIDIA models may not send [DONE])
            if (!tDoneSeen) {
              const responseObj = buildresponseshape(
                respid, msgid, clientmodel,
                tContent, tReasoning,
                tInputTokens, tOutputTokens,
                tFinishReason, createdAt,
              );
              c.enqueue(enc.encode(buildevent("response.completed", responseObj)));
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            try {
              c.enqueue(enc.encode(safestringify({ type: "error", error: { message: `stream error: ${msg}`, type: "stream_error" } }) + "\n"));
            } catch {}
          } finally {
            if (ndKaRef) clearInterval(ndKaRef);
            // save to DB (fire-and-forget)
            const responseTokens = tThinkingTokens > 0 ? Math.max(0, tOutputTokens - tThinkingTokens) : tOutputTokens;
            void savedb({
              content: tContent.slice(0, 4000),
              reasoning: tReasoning.slice(0, 4000),
              model: clientmodel, rotatedmodel: usedModel, sessionid, responseid: respid, requestid,
              allParams: body, thinkingLevel, thinkingBudget: THINKING_BUDGETS[thinkingLevel] ?? 68000, thinkenabled: true,
              temperature: body.temperature ?? 1, topp: body.top_p ?? 1, topk: body.top_k ?? 50, maxtokens: body.max_tokens ?? MAX_TOKENS,
              thinkingTokens: tThinkingTokens, responseTokens,
              inputTokens: tInputTokens, outputTokens: tOutputTokens, totalTokens: tInputTokens + tOutputTokens,
              finishReason: tFinishReason, ip, userAgent, keyId: usedKeyid, keyLabel: usedKeylabel, rotationIndex, messageNumber,
              contextShared: true, devthinkContext: 0, devthinkOutput: MAX_TOKENS,
              startms, autoFixApplied: "", chattemplatekwargs,
              stream: true, streamMode: true,
              allResponse: tContent.slice(0, 4096),
              durationMs: Date.now() - startms,
              firstTokenMs,
              httpStatus: 200,
            });
            try { c.close(); } catch {}
          }
        },
        cancel() {
          // client disconnect aborts the upstream read (no leaked requests)
          ndClientGone = true;
          try { ndReaderRef?.cancel(); } catch {}
          if (ndKaRef) clearInterval(ndKaRef);
        },
      });

      return new Response(outStream, { status: 200, headers: ndHeaders });
    }

    // ── SSE path: wrap responses-api events in SSE format ────
    // for clients that prefer text/event-stream
    const sseRespHeaders = new Headers();
    sseRespHeaders.set("content-type", "text/event-stream; charset=utf-8");
    sseRespHeaders.set("cache-control", "no-cache, no-transform");
    sseRespHeaders.set("connection", "keep-alive");
    sseRespHeaders.set("x-accel-buffering", "no");
    sseRespHeaders.set("x-request-id", requestid);
    sseRespHeaders.set("x-session-id", sessionid);
    for (const [k, v] of Object.entries(corsheaders())) {
      sseRespHeaders.set(k, v);
    }

    // KEEPALIVE + client-disconnect wiring for the sse lane
    let kaRef: ReturnType<typeof setInterval> | null = null;
    let sseReaderRef: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let clientGone = false;
    const sseStream = new ReadableStream<Uint8Array>({
      async start(c) {
        // SEND INITIAL EVENTS IMMEDIATELY - client knows stream is active
        const createdObj = { id: respid, object: "response", model: clientmodel, output: [], status: "created", created_at: createdAt };
        let ev = buildevent("response.created", { response: createdObj });
        c.enqueue(enc.encode(`data: ${ev.trim()}\n\n`));

        const inProgressObj = { id: respid, object: "response", model: clientmodel, output: [], status: "in_progress", created_at: createdAt };
        ev = buildevent("response.in_progress", { response: inProgressObj });
        c.enqueue(enc.encode(`data: ${ev.trim()}\n\n`));
        // keepalive comment every 200ms from the first byte
        kaRef = setInterval(() => {
          if (clientGone) return;
          try { c.enqueue(enc.encode(": ka\n\n")); } catch {}
        }, KEEPALIVE_MS);

        // streaming state (for internal tracking only)
        let tContent = "";
        let tReasoning = "";
        let tInputTokens = 0;
        let tOutputTokens = 0;
        let tThinkingTokens = 0;
        let tFinishReason = "stop";
        let tUsageSeen = false;
        let firstTokenMs = 0;
        let sseBuf = "";
        let sentOutputItemAdded = false;
        let sentContentPartAdded = false;
        let usedKeyid = "";
        let usedKeylabel = "";
        let usedModel = nvidiamodel;

        try {
          // DO THE FETCH INSIDE THE STREAM - this may take time (NVIDIA thinking)
          // but the client already has the SSE stream active
          const { upstream, error: lasterror, status: laststatus, keyId: fk, keyLabel: fl, rotatedmodel: finalrotatedmodel } = await fetchwithretry(nvidiapayload, true);

          usedKeyid = fk;
          usedKeylabel = fl;
          if (finalrotatedmodel && finalrotatedmodel !== nvidiamodel) {
            usedModel = finalrotatedmodel;
          }

          if (!upstream || !upstream.ok || !upstream.body) {
            // Send error as SSE event (stream already started with 200)
            const errorMsg = lasterror || `upstream ${laststatus}`;
            c.enqueue(enc.encode(`data: ${safestringify({ type: "error", error: { message: errorMsg, type: "upstream_error", status: laststatus } })}\n\n`));
            void savedb({
              content: "", reasoning: "",
              model: clientmodel, rotatedmodel: usedModel, sessionid, responseid: respid, requestid,
              allParams: body, thinkingLevel, thinkingBudget: THINKING_BUDGETS[thinkingLevel] ?? 68000, thinkenabled: true,
              temperature: body.temperature ?? 1, topp: body.top_p ?? 1, topk: body.top_k ?? 50, maxtokens: body.max_tokens ?? MAX_TOKENS,
              thinkingTokens: 0, responseTokens: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0,
              finishReason: "error", ip, userAgent, keyId: usedKeyid, keyLabel: usedKeylabel, rotationIndex, messageNumber,
              contextShared: true, devthinkContext: 0, devthinkOutput: MAX_TOKENS,
              startms, autoFixApplied: "", chattemplatekwargs,
              error: errorMsg, durationMs: Date.now() - startms, httpStatus: laststatus, stream: true, streamMode: true,
            });
            return;
          }

          // PIPE CHUNKS IN REAL-TIME - as soon as NVIDIA sends bytes, we relay them
          const reader = upstream.body.getReader();
          sseReaderRef = reader;

          for (;;) {
            if (clientGone) break;
            const { done, value } = await reader.read();
            if (done) break;
            if (firstTokenMs === 0) firstTokenMs = Date.now() - startms;

            const text = dec.decode(value, { stream: true });
            sseBuf += text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

            // ROBUST SSE PARSER (brace-depth) for non-stream-mode SSE path
            const parsed2 = extractsse(sseBuf);
            sseBuf = parsed2.rest;

            for (const line of parsed2.items) {
              if (line === "[DONE]") {
                const responseObj = buildresponseshape(
                  respid, msgid, clientmodel,
                  tContent, tReasoning,
                  tInputTokens, tOutputTokens,
                  tFinishReason, createdAt,
                );
                ev = buildevent("response.completed", responseObj);
                c.enqueue(enc.encode(`data: ${ev.trim()}\n\n`));
                continue;
              }

              try {
                const j = JSON.parse(line);
                // autofix model name: NVIDIA may return a different model than what client requested
                if (j.model && j.model !== clientmodel) j.model = clientmodel;
                const delta = j?.choices?.[0]?.delta;

                if (delta?.role && !sentOutputItemAdded) {
                  sentOutputItemAdded = true;
                  ev = buildevent("response.output_item.added", { output_index: 0, item: { type: "message", id: msgid, role: "assistant", content: [], status: "in_progress" } });
                  c.enqueue(enc.encode(`data: ${ev.trim()}\n\n`));
                  sentContentPartAdded = true;
                  ev = buildevent("response.content_part.added", { output_index: 0, content_index: 0, part: { type: "output_text", text: "", annotations: [] } });
                  c.enqueue(enc.encode(`data: ${ev.trim()}\n\n`));
                }

                if (delta?.reasoning_content) {
                  const rc = String(delta.reasoning_content);
                  tReasoning += rc;
                  ev = buildevent("response.output_text.delta", { output_index: 0, content_index: 0, delta: rc });
                  c.enqueue(enc.encode(`data: ${ev.trim()}\n\n`));
                }

                if (delta?.content) {
                  const ct = String(delta.content);
                  tContent += ct;
                  if (!sentOutputItemAdded) {
                    sentOutputItemAdded = true;
                    ev = buildevent("response.output_item.added", { output_index: 0, item: { type: "message", id: msgid, role: "assistant", content: [], status: "in_progress" } });
                    c.enqueue(enc.encode(`data: ${ev.trim()}\n\n`));
                    sentContentPartAdded = true;
                    ev = buildevent("response.content_part.added", { output_index: 0, content_index: 0, part: { type: "output_text", text: "", annotations: [] } });
                    c.enqueue(enc.encode(`data: ${ev.trim()}\n\n`));
                  }
                  ev = buildevent("response.output_text.delta", { output_index: 0, content_index: 0, delta: ct });
                  c.enqueue(enc.encode(`data: ${ev.trim()}\n\n`));
                }

                const fr = j?.choices?.[0]?.finish_reason;
                if (fr && fr !== null) {
                  tFinishReason = String(fr);
                  ev = buildevent("response.output_text.done", { output_index: 0, content_index: 0, text: tContent });
                  c.enqueue(enc.encode(`data: ${ev.trim()}\n\n`));
                  ev = buildevent("response.output_item.done", { output_index: 0, item: { type: "message", id: msgid, role: "assistant", content: [{ type: "output_text", text: tContent, annotations: [] }], status: "completed" } });
                  c.enqueue(enc.encode(`data: ${ev.trim()}\n\n`));
                }

                if (j.usage && typeof j.usage === "object") {
                  tUsageSeen = true;
                  tInputTokens = Number(j.usage.prompt_tokens ?? tInputTokens);
                  tOutputTokens = Number(j.usage.completion_tokens ?? tOutputTokens);
                  const ctd = j.usage.completion_tokens_details ?? {};
                  tThinkingTokens = Number(ctd.reasoning_tokens ?? tThinkingTokens);
                }
              } catch {
                // brace-depth parser already validated braces; DISCARD unparseable
                console.warn("[v3/responses] SSE: discarding unparseable JSON chunk");
              }
            }
          }

          // inject usage if missing
          if (!tUsageSeen) {
            if (tInputTokens === 0 && tOutputTokens === 0) {
              const msgChars = messages.reduce((s, m) => s + String(m.content ?? "").length, 0);
              tInputTokens = Math.ceil(msgChars / 4);
              tOutputTokens = Math.ceil((tContent.length + tReasoning.length) / 4);
              tThinkingTokens = Math.ceil(tReasoning.length / 4);
            }
          }

          // emit final response.completed if [DONE] was not seen
          const responseObj = buildresponseshape(
            respid, msgid, clientmodel,
            tContent, tReasoning,
            tInputTokens, tOutputTokens,
            tFinishReason, createdAt,
          );
          ev = buildevent("response.completed", responseObj);
          c.enqueue(enc.encode(`data: ${ev.trim()}\n\n`));
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          try {
            c.enqueue(enc.encode(`data: ${safestringify({ type: "error", error: { message: `stream error: ${msg}`, type: "stream_error" } })}\n\n`));
          } catch {}
        } finally {
          if (kaRef) clearInterval(kaRef);
          const responseTokens = tThinkingTokens > 0 ? Math.max(0, tOutputTokens - tThinkingTokens) : tOutputTokens;
          void savedb({
            content: tContent.slice(0, 4000),
            reasoning: tReasoning.slice(0, 4000),
            model: clientmodel, rotatedmodel: usedModel, sessionid, responseid: respid, requestid,
            allParams: body, thinkingLevel, thinkingBudget: THINKING_BUDGETS[thinkingLevel] ?? 68000, thinkenabled: true,
            temperature: body.temperature ?? 1, topp: body.top_p ?? 1, topk: body.top_k ?? 50, maxtokens: body.max_tokens ?? MAX_TOKENS,
            thinkingTokens: tThinkingTokens, responseTokens,
            inputTokens: tInputTokens, outputTokens: tOutputTokens, totalTokens: tInputTokens + tOutputTokens,
            finishReason: tFinishReason, ip, userAgent, keyId: usedKeyid, keyLabel: usedKeylabel, rotationIndex, messageNumber,
            contextShared: true, devthinkContext: 0, devthinkOutput: MAX_TOKENS,
            startms, autoFixApplied: "", chattemplatekwargs,
            stream: true, streamMode: true,
            allResponse: tContent.slice(0, 4096),
            durationMs: Date.now() - startms,
            firstTokenMs,
            httpStatus: 200,
          });
          try { c.close(); } catch {}
        }
      },
      cancel() {
        clientGone = true;
        try { sseReaderRef?.cancel(); } catch {}
        if (kaRef) clearInterval(kaRef);
      },
    });

    return new Response(sseStream, { status: 200, headers: sseRespHeaders });
  }

  // ── 8. NON-STREAMING: fetch with retry, then convert ────────────
  const { upstream, error: lasterror, status: laststatus, keyId, keyLabel, rotatedmodel: finalrotatedmodel } = await fetchwithretry(nvidiapayload, false);

  if (finalrotatedmodel && finalrotatedmodel !== nvidiamodel) {
    nvidiamodel = finalrotatedmodel;
  }

  const dbcommon = {
    content: "", reasoning: "",
    model: clientmodel, rotatedmodel: nvidiamodel, sessionid, responseid: respid, requestid,
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

  // ── 9. collect upstream response and convert ────────────────────
  const raw: unknown = await upstream.json();
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  // extract content/reasoning from chat.completions format
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

  // extract usage from chat.completions format
  const usage = (data.usage ?? {}) as Record<string, unknown>;
  let inputTokens = Number(usage.prompt_tokens ?? 0);
  let outputTokens = Number(usage.completion_tokens ?? 0);
  let thinkingTokens = Number((usage.completion_tokens_details as Record<string, unknown> | undefined)?.reasoning_tokens ?? usage.reasoning_tokens ?? 0);
  if (thinkingTokens === 0 && reasoning.length > 0) {
    thinkingTokens = Math.ceil(reasoning.length / 4);
  }
  const responseTokens = thinkingTokens > 0 ? Math.max(0, outputTokens - thinkingTokens) : outputTokens;
  const totalTokens = inputTokens + outputTokens;

  // ── convert to responses-api shape ──────────────────────────────
  const responseshape = buildresponseshape(
    respid, msgid, clientmodel,
    content, reasoning,
    inputTokens, outputTokens,
    finishReason, createdAt,
  );

  // ── content type negotiation for non-streaming ──────────────────
  if (wantsNDJSON || wantsSSE) {
    // non-streaming upstream but client wants streaming output:
    // emit responses-api events as NDJSON or SSE
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
          const format = isNDJSON
            ? (ev: string) => enc.encode(ev)
            : (ev: string) => enc.encode(`data: ${ev.trim()}\n\n`);

          // response.created
          c.enqueue(format(buildevent("response.created", {
            response: { id: respid, object: "response", model: clientmodel, output: [], status: "created", created_at: createdAt },
          })));

          // response.in_progress
          c.enqueue(format(buildevent("response.in_progress", {
            response: { id: respid, object: "response", model: clientmodel, output: [], status: "in_progress", created_at: createdAt },
          })));

          // response.output_item.added
          c.enqueue(format(buildevent("response.output_item.added", {
            output_index: 0,
            item: { type: "message", id: msgid, role: "assistant", content: [], status: "in_progress" },
          })));

          // response.content_part.added
          c.enqueue(format(buildevent("response.content_part.added", {
            output_index: 0, content_index: 0,
            part: { type: "output_text", text: "", annotations: [] },
          })));

          // response.output_text.delta (all content in one delta)
          if (content) {
            c.enqueue(format(buildevent("response.output_text.delta", {
              output_index: 0, content_index: 0, delta: content,
            })));
          }

          // response.output_text.done
          c.enqueue(format(buildevent("response.output_text.done", {
            output_index: 0, content_index: 0, text: content,
          })));

          // response.output_item.done
          c.enqueue(format(buildevent("response.output_item.done", {
            output_index: 0,
            item: {
              type: "message", id: msgid, role: "assistant",
              content: [{ type: "output_text", text: content, annotations: [] }],
              status: "completed",
            },
          })));

          // response.completed
          c.enqueue(format(buildevent("response.completed", responseshape)));
        } catch {} finally { try { c.close(); } catch {} }
      },
    });

    void savedb({ ...dbcommon, content: content.slice(0, 4000), reasoning: reasoning.slice(0, 4000), stream: true, streamMode: true, allResponse: responseshape, durationMs: Date.now() - startms, httpStatus: 200, inputTokens, outputTokens, thinkingTokens, responseTokens, totalTokens, finishReason });
    return new Response(outStream, { status: 200, headers: outHeaders });
  }

  if (wantsPlain) {
    void savedb({ ...dbcommon, content: content.slice(0, 4000), reasoning: reasoning.slice(0, 4000), stream: false, streamMode: false, allResponse: responseshape, durationMs: Date.now() - startms, httpStatus: 200, inputTokens, outputTokens, thinkingTokens, responseTokens, totalTokens, finishReason });
    return new Response(content, { status: 200, headers: plainheaders() });
  }

  if (wantsBinary) {
    void savedb({ ...dbcommon, content: content.slice(0, 4000), reasoning: reasoning.slice(0, 4000), stream: false, streamMode: false, allResponse: responseshape, durationMs: Date.now() - startms, httpStatus: 200, inputTokens, outputTokens, thinkingTokens, responseTokens, totalTokens, finishReason });
    return new Response(Buffer.from(safestringify(responseshape), "utf-8"), { status: 200, headers: { "content-type": "application/octet-stream", ...corsheaders() } });
  }

  // JSON (default) - return responses-api shape
  void savedb({ ...dbcommon, content: content.slice(0, 4000), reasoning: reasoning.slice(0, 4000), stream: false, streamMode: false, allResponse: responseshape, durationMs: Date.now() - startms, httpStatus: 200, inputTokens, outputTokens, thinkingTokens, responseTokens, totalTokens, finishReason });
  return jsonresponse(responseshape);
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
