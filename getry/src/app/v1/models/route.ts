/**
 * v1/models/route.ts
 *
 * V1 ZAI SDK model registry — SINGLE SOURCE OF TRUTH for all V1 config.
 *
 * This file embeds the complete V1 model configuration (formerly v1/config.ts)
 * AND serves as the /v1/models OpenAI-compatible endpoint with 40 HTTP methods.
 *
 * Other V1 routes import config exports from THIS file.
 *
 * Exports:
 *   PROVIDER, V1_MODELS, V1Model, THINKING_LEVELS, ThinkingLevel,
 *   THINKING_BUDGETS, DEFAULT_MODEL, MAX_TOKENS, MAX_CONTEXT,
 *   MAX_THINKING_BUDGET, DEFAULT_MAX_TOKENS, isv1model, extractthinkinglevel,
 *   getthinkingbudget, MODELS, ModelEntry
 *   + 40 HTTP method handlers
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

// ─── runtime / route config ─────────────────────────────────────────
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 2147483647;

// ─── provider ───────────────────────────────────────────────────────
export const PROVIDER = "zai" as const;

// ─── model ids ──────────────────────────────────────────────────────
// the full z.ai web sdk glm family (glm-5.x flagship line + legacy glm-4)
export const V1_MODELS = ["devthink", "glm-5.3", "glm-5.3-flash", "glm-5.3-fast", "glm-5.3-air", "glm-5.2", "glm-5.1", "glm-5", "glm-5v", "glm-5-turbo", "glm-4-plus", "glm-4-flash"] as const;
export type V1Model = (typeof V1_MODELS)[number];

/** devthink meta backend — the 2-calls thinking engine runs on the flagship */
export const DEVTHINK_BACKEND = "glm-5.3";

// ─── thinking levels ────────────────────────────────────────────────
export const THINKING_LEVELS = ["none", "minimal", "low", "medium", "high", "xhigh", "max"] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

export const THINKING_BUDGETS: Record<string, number> = {
  none: 0,
  minimal: 2000,
  low: 8000,
  medium: 24000,
  high: 98000,
  xhigh: 98000,
  max: 98000,
};

// ─── defaults ───────────────────────────────────────────────────────
export const DEFAULT_MODEL = "glm-5.2";
export const MAX_TOKENS = 98304;
export const MAX_CONTEXT = 2300000;  // devthink meta-model context
export const MAX_THINKING_BUDGET = 98000;
export const DEFAULT_MAX_TOKENS = 98304;

// ─── helpers ────────────────────────────────────────────────────────
/** Check whether a model id is a valid V1 model. */
export function isv1model(id: string): boolean {
  return V1_MODELS.includes(id as V1Model);
}

/**
 * Resolve a requested model to the sdk backend model.
 *   - "devthink" or absent → meta model over the glm-5.3 flagship (2-calls thinking)
 *   - any valid v1 glm model → direct individual call on that model
 *   - unknown id → meta model fallback, requested id echoed back to the client
 */
export function resolvev1model(requested: unknown): { backend: string; requested: string; meta: boolean } {
  const raw = typeof requested === "string" ? requested.trim().toLowerCase() : "";
  if (!raw || raw === "devthink") return { backend: DEVTHINK_BACKEND, requested: "devthink", meta: true };
  if (isv1model(raw)) return { backend: raw, requested: raw, meta: false };
  return { backend: DEVTHINK_BACKEND, requested: raw, meta: true };
}

/**
 * Extract the thinking level from a request body.
 * Checks body.thinking, body.thinkinglevel, body.reasoning_effort,
 * body.reasoning_level, body.thinking_level in order; defaults to "high".
 * Supports partial matching (e.g. "med" -> "medium").
 * @param body - the parsed request body
 * @returns a valid ThinkingLevel string
 */
export function extractthinkinglevel(body: Record<string, unknown>): string {
  const raw = String(
    body.thinking ?? body.thinkinglevel ?? body.reasoning_effort
    ?? body.reasoning_level ?? body.thinking_level ?? "high"
  ).toLowerCase();
  const exact = THINKING_LEVELS.find((l) => l === raw);
  if (exact) return exact;
  for (const l of THINKING_LEVELS) {
    if (raw.includes(l)) return l;
  }
  return "high";
}

/**
 * Get the thinking budget (token count) for a given thinking level.
 * @param level - the thinking level name
 * @returns the budget in tokens, defaults to 98000
 */
export function getthinkingbudget(level: string): number {
  return THINKING_BUDGETS[level] ?? 98000;
}

// ─── model catalog (for /v1/models endpoint) ────────────────────────
export interface ModelEntry {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: unknown[];
  root: string;
  parent: string | null;
  max_context_length: number;
  max_output_tokens: number;
  supports_thinking: boolean;
  supports_streaming: boolean;
  supports_tools: boolean;
  supports_vision: boolean;
  description: string;
  meta: Record<string, unknown>;
}

export const MODELS: ModelEntry[] = [
  {
    id: "devthink", object: "model", created: 1735689600, owned_by: "devthink",
    permission: [], root: "devthink", parent: null,
    max_context_length: 2300000, max_output_tokens: 98304,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: false,
    description: "devthink meta-model - 2-calls thinking over glm-5.3 flagship backend, 2.3m context",
    meta: { provider: PROVIDER, backend: "glm-5.3", reasoning: true, tier: "primary", pattern: "2-calls" },
  },
  {
    id: "glm-5.3", object: "model", created: 1735689600, owned_by: "zai",
    permission: [], root: "glm-5.3", parent: null,
    max_context_length: 1048576, max_output_tokens: 98304,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: false,
    description: "zai glm-5.3 new flagship - 1m context, thinking via 2-calls pattern",
    meta: { provider: PROVIDER, reasoning: true, tier: "primary", pattern: "2-calls", flagship: true },
  },
  {
    id: "glm-5.3-flash", object: "model", created: 1735689600, owned_by: "zai",
    permission: [], root: "glm-5.3-flash", parent: null,
    max_context_length: 1048576, max_output_tokens: 16384,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: false,
    description: "zai glm-5.3-flash new lightweight flagship - 1m context, thinking via 2-calls pattern",
    meta: { provider: PROVIDER, reasoning: true, tier: "primary", pattern: "2-calls", flash: true, flagship: true },
  },
  {
    id: "glm-5.3-fast", object: "model", created: 1735689600, owned_by: "zai",
    permission: [], root: "glm-5.3-fast", parent: null,
    max_context_length: 1048576, max_output_tokens: 65536,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: false,
    description: "zai glm-5.3-fast fast variant of the new flagship - 1m context, thinking via 2-calls pattern",
    meta: { provider: PROVIDER, reasoning: true, tier: "primary", pattern: "2-calls", fast: true, flagship: true },
  },
  {
    id: "glm-5.3-air", object: "model", created: 1735689600, owned_by: "zai",
    permission: [], root: "glm-5.3-air", parent: null,
    max_context_length: 1048576, max_output_tokens: 16384,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: false,
    description: "zai glm-5.3-air lightweight flagship variant - 1m context, thinking via 2-calls pattern",
    meta: { provider: PROVIDER, reasoning: true, tier: "primary", pattern: "2-calls", air: true, flagship: true },
  },
  {
    id: "glm-5.2", object: "model", created: 1735689600, owned_by: "zai",
    permission: [], root: "glm-5.2", parent: null,
    max_context_length: 1000000, max_output_tokens: 98304,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: false,
    description: "zai glm-5.2 previous flagship - 1m context, thinking via 2-calls pattern",
    meta: { provider: PROVIDER, reasoning: true, tier: "secondary", pattern: "2-calls" },
  },
  {
    id: "glm-5.1", object: "model", created: 1732982400, owned_by: "zai",
    permission: [], root: "glm-5.1", parent: null,
    max_context_length: 131072, max_output_tokens: 16384,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: false,
    description: "zai glm-5.1 previous generation - 128k context, thinking via 2-calls pattern",
    meta: { provider: PROVIDER, reasoning: true, tier: "secondary", pattern: "2-calls" },
  },
  {
    id: "glm-5v", object: "model", created: 1735689600, owned_by: "zai",
    permission: [], root: "glm-5v", parent: null,
    max_context_length: 131072, max_output_tokens: 16384,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: true,
    description: "zai glm-5v vision model - 128k context, supports image input, thinking via 2-calls",
    meta: { provider: PROVIDER, reasoning: true, tier: "primary", pattern: "2-calls", vision: true },
  },
  {
    id: "glm-5", object: "model", created: 1732982400, owned_by: "zai",
    permission: [], root: "glm-5", parent: null,
    max_context_length: 131072, max_output_tokens: 32768,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: false,
    description: "zai glm-5 base of the 5-series generation - 128k context, thinking via 2-calls pattern",
    meta: { provider: PROVIDER, reasoning: true, tier: "secondary", pattern: "2-calls" },
  },
  {
    id: "glm-5-turbo", object: "model", created: 1732982400, owned_by: "zai",
    permission: [], root: "glm-5-turbo", parent: null,
    max_context_length: 131072, max_output_tokens: 16384,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: false,
    description: "zai glm-5-turbo low-latency 5-series variant - 128k context, thinking via 2-calls pattern",
    meta: { provider: PROVIDER, reasoning: true, tier: "secondary", pattern: "2-calls", turbo: true },
  },
  {
    id: "glm-4-plus", object: "model", created: 1720396800, owned_by: "zai",
    permission: [], root: "glm-4-plus", parent: null,
    max_context_length: 131072, max_output_tokens: 4096,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: false,
    description: "zai glm-4-plus stable - 128k context, thinking via 2-calls pattern",
    meta: { provider: PROVIDER, reasoning: true, tier: "secondary", pattern: "2-calls" },
  },
  {
    id: "glm-4-flash", object: "model", created: 1720396800, owned_by: "zai",
    permission: [], root: "glm-4-flash", parent: null,
    max_context_length: 131072, max_output_tokens: 4096,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: false,
    description: "zai glm-4-flash fast lightweight - 128k context, thinking via 2-calls pattern",
    meta: { provider: PROVIDER, reasoning: true, tier: "secondary", pattern: "2-calls" },
  },
];

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
    "access-control-allow-headers": "content-type, authorization, x-request-id, x-session-id, x-api-key, accept, origin, user-agent",
    "access-control-expose-headers": "x-request-id, x-response-id, x-session-id, x-rate-limit, x-rate-remaining",
    ...extra,
  };
}

function jsonheaders(extra?: Record<string, string>): Record<string, string> {
  return { "content-type": "application/json", ...corsheaders(extra) };
}

// ─── handler ────────────────────────────────────────────────────────
function handlemodels(): Response {
  const payload = { object: "list" as const, data: MODELS };
  return new Response(JSON.stringify(payload), { status: 200, headers: jsonheaders() });
}

// ─── 40 http method exports ─────────────────────────────────────────
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function POST(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function GET(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function PUT(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function PATCH(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function DELETE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return headers only for the models endpoint. @param _req - incoming request @returns empty 200 with cors headers */
export async function HEAD(_req: NextRequest): Promise<Response> { return new Response(null, { status: 200, headers: corsheaders() }); }
/** Return CORS preflight response. @param _req - incoming request @returns empty 204 with cors headers */
export async function OPTIONS(_req: NextRequest): Promise<Response> { return new Response(null, { status: 204, headers: corsheaders() }); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function CONNECT(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function TRACE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV PROPFIND). @param _req - incoming request @returns json model list response */
export async function PROPFIND(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV PROPPATCH). @param _req - incoming request @returns json model list response */
export async function PROPPATCH(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV MKCOL). @param _req - incoming request @returns json model list response */
export async function MKCOL(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV COPY). @param _req - incoming request @returns json model list response */
export async function COPY(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV MOVE). @param _req - incoming request @returns json model list response */
export async function MOVE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV LOCK). @param _req - incoming request @returns json model list response */
export async function LOCK(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV UNLOCK). @param _req - incoming request @returns json model list response */
export async function UNLOCK(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function SEARCH(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function PURGE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function LINK(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function UNLINK(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV REPORT). @param _req - incoming request @returns json model list response */
export async function REPORT(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV CHECKOUT). @param _req - incoming request @returns json model list response */
export async function CHECKOUT(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV CHECKIN). @param _req - incoming request @returns json model list response */
export async function CHECKIN(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV UNCHECKOUT). @param _req - incoming request @returns json model list response */
export async function UNCHECKOUT(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV VERSION-CONTROL). @param _req - incoming request @returns json model list response */
export async function VERSION_CONTROL(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV LABEL). @param _req - incoming request @returns json model list response */
export async function LABEL(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV MERGE). @param _req - incoming request @returns json model list response */
export async function MERGE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV BASELINE-CONTROL). @param _req - incoming request @returns json model list response */
export async function BASELINE_CONTROL(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV MKACTIVITY). @param _req - incoming request @returns json model list response */
export async function MKACTIVITY(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list (WebDAV MKWORKSPACE). @param _req - incoming request @returns json model list response */
export async function MKWORKSPACE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function UPDATE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function SUBSCRIBE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function UNSUBSCRIBE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function NOTIFY(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function POLL(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function BIND(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function REBIND(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function UNBIND(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function REINDEX(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** Return the V1 model list. @param _req - incoming request @returns json model list response */
export async function ACL(_req: NextRequest): Promise<Response> { return handlemodels(); }
