/**
 * v3/models/route.ts
 *
 * Single source of truth for ALL V3 (NVIDIA) model configuration.
 *
 * This file:
 *   - Contains all model definitions (no import from config.ts)
 *   - Serves the /v3/models endpoint (OpenAI /v1/models compatible)
 *   - Exports every config constant/type/helper so other V3 routes import from HERE
 *
 * V3 NVIDIA models at https://integrate.api.nvidia.com/v1:
 *   - 4 DevThink rotation models (meta-model backends)
 *   - 7 individual chat models (same as rotation but listed individually)
 *   - 7 embedding models
 *   - Plus additional chat models from the NVIDIA catalog
 *
 * 40 http methods, maxDuration = 2147483647.
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
      console.log("[instrumentation] server timeout set to 24h");
    } catch {}
  }
})();

import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 2147483647;

// ─── provider ───────────────────────────────────────────────────────
export const PROVIDER = "nvidia" as const;

// ─── upstream ───────────────────────────────────────────────────────
export const UPSTREAM_URL = "https://integrate.api.nvidia.com/v1";

// ─── devthink id ────────────────────────────────────────────────────
export const DEVTHINK_ID = "devthink";

// ─── 4 DevThink rotation models ─────────────────────────────────────
// Selected from https://build.nvidia.com/models?pageSize=300 (2026-08-30)
// All 4 are CURRENT (not deprecated) and support thinking/reasoning.
// Older rotation backends retired/deprecated:
//   - stepfun-ai/step-3.7-flash: 410 Gone (retired 2026-08-28)
//   - z-ai/glm-5.2: 410 Gone (retired 2026-08-21)
//   - minimaxai/minimax-m3: Deprecation in 10d (per build.nvidia.com 2026-08-30)
export interface NvidiaChatModel {
  id: string;
  contextwindow: number;
  maxoutput: number;
  chattemplatekwargs: Record<string, unknown>;
}

export const DEVTHINK_ROTATION_MODELS: NvidiaChatModel[] = [
  // moonshotai/kimi-k3 — 3d old, 2.8T hybrid KDA+MLA MoE, long-horizon coding + agentic + multimodal
  { id: "moonshotai/kimi-k3", contextwindow: 262144, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  // deepseek-ai/deepseek-v4-pro-0813 — 3d old, 1M context, MoE coding
  { id: "deepseek-ai/deepseek-v4-pro-0813", contextwindow: 1000000, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  // meta/muse-glimmer-30b — 20d old, multimodal reasoning + native tool-calling + SEPARATE reasoning output (ideal for DevThink)
  { id: "meta/muse-glimmer-30b", contextwindow: 262144, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  // poolside/laguna-xs-2.1 — 1mo old, 33B MoE agentic coding/terminal
  { id: "poolside/laguna-xs-2.1", contextwindow: 262144, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
];

// devthink combined context window = SUM of all 4 rotation backends (joint context, "fusion" logic)
// devthink combined max output    = SUM of all 4 rotation backends (joint output capacity)
export const DEVTHINK_CONTEXT_WINDOW = DEVTHINK_ROTATION_MODELS.reduce((sum, m) => sum + m.contextwindow, 0);
export const DEVTHINK_MAX_OUTPUT = DEVTHINK_ROTATION_MODELS.reduce((sum, m) => sum + m.maxoutput, 0);

// ─── all NVIDIA chat model IDs (for model catalog) ──────────────────
// Validated against https://build.nvidia.com/models?pageSize=300 (2026-08-30)
// Excludes deprecated models (e.g. minimaxai/minimax-m3 — Deprecation in 10d)
// Excludes retired models (stepfun-ai/step-3.7-flash 410 Gone, z-ai/glm-5.2 410 Gone)
// Excludes non-LLM models (image/video/ASR/TTS/OCR/biology/chemistry/autonomous-vehicles/weather/route-optimization/guardrails)
export const V3_CHAT_MODELS = [
  // ── DevThink rotation backends (4) — most current + capable ──
  "moonshotai/kimi-k3",                       // 3d, 2.8T hybrid KDA+MLA MoE
  "deepseek-ai/deepseek-v4-pro-0813",         // 3d, 1M context, MoE coding
  "meta/muse-glimmer-30b",                    // 20d, multimodal reasoning + separate reasoning output
  "poolside/laguna-xs-2.1",                  // 1mo, 33B MoE agentic coding
  // ── Additional valid chat LLMs from build.nvidia.com ──
  "deepseek-ai/deepseek-v4-flash-0731",      // 11d, 284B MoE (13B active), coding/chat/agentic
  "nvidia/nemotron-3.5-lightning-30b-a3b",    // 19d, 30B A3B MoE, agentic
  "nvidia/nemotron-3-ultra-550b-a55b",       // 2mo, hybrid Mamba-Transformer MoE, 1M context
  "nvidia/nemotron-3-super-120b-a12b",        // 5mo, hybrid Mamba-Transformer MoE, 1M context
  "nvidia/nemotron-3-nano-30b-a3b",           // 8mo, MoE, 1M context
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning", // 4mo, omni-modal reasoning
  "google/gemma-4-31b-it",                    // 5mo, dense 31B, coding/agentic
  "openai/gpt-oss-20b",                       // 1y, MoE reasoning
  "openai/gpt-oss-120b",                      // 1y, MoE reasoning (80GB)
  "mistralai/mistral-nemotron",               // 1y, agentic/coding/function-calling
  "meta/llama-3.2-11b-vision-instruct",       // 1y, vision-language
  "meta/llama-3.2-90b-vision-instruct",       // 1y, vision-language
  "google/diffusiongemma-26b-a4b-it",        // 2mo, diffusion-based LLM (parallel token generation)
] as const;

// ─── NVIDIA embedding model IDs ─────────────────────────────────────
// Only models present in build.nvidia.com catalog (2026-08-30) with Free Endpoint
export const V3_EMBED_MODELS = [
  "nvidia/nemotron-3-embed-1b",               // 1mo, 1B embedding, semantic search/RAG
  "nvidia/llama-nemotron-embed-vl-1b-v2",     // 6mo, multimodal QA retrieval (text→query, image→doc)
] as const;

// ─── all model IDs (for validation) ─────────────────────────────────
export const ALL_MODEL_IDS = [
  DEVTHINK_ID,
  ...V3_CHAT_MODELS,
  ...V3_EMBED_MODELS,
] as const;

// ─── thinking levels ────────────────────────────────────────────────
export const THINKING_LEVELS = ["none", "minimal", "low", "medium", "high", "xhigh", "max"] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

export const THINKING_BUDGETS: Record<string, number> = {
  none: 0,
  minimal: 1400,
  low: 5500,
  medium: 17000,
  high: 68000,
  xhigh: 68000,
  max: 68000,
};

// ─── blocked models ─────────────────────────────────────────────────
export const BLOCKED_MODELS = ["deepseek-ai/deepseek-r1"] as const;

// ─── individual chat models with chat_template_kwargs ───────────────
// Only valid (non-deprecated, non-retired) models from build.nvidia.com (2026-08-30)
export const INDIVIDUAL_CHAT_MODELS: NvidiaChatModel[] = [
  // ── DevThink rotation backends (4) ──
  { id: "moonshotai/kimi-k3", contextwindow: 262144, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "deepseek-ai/deepseek-v4-pro-0813", contextwindow: 1000000, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "meta/muse-glimmer-30b", contextwindow: 262144, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "poolside/laguna-xs-2.1", contextwindow: 262144, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  // ── Additional valid chat LLMs ──
  { id: "deepseek-ai/deepseek-v4-flash-0731", contextwindow: 1000000, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "nvidia/nemotron-3.5-lightning-30b-a3b", contextwindow: 262144, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "nvidia/nemotron-3-ultra-550b-a55b", contextwindow: 1000000, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "nvidia/nemotron-3-super-120b-a12b", contextwindow: 1000000, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "nvidia/nemotron-3-nano-30b-a3b", contextwindow: 1000000, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning", contextwindow: 262144, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "google/gemma-4-31b-it", contextwindow: 262144, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "openai/gpt-oss-20b", contextwindow: 262144, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "openai/gpt-oss-120b", contextwindow: 262144, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "mistralai/mistral-nemotron", contextwindow: 262144, maxoutput: 68000, chattemplatekwargs: { enable_thinking: true } },
  { id: "meta/llama-3.2-11b-vision-instruct", contextwindow: 131072, maxoutput: 32768, chattemplatekwargs: {} },
  { id: "meta/llama-3.2-90b-vision-instruct", contextwindow: 131072, maxoutput: 32768, chattemplatekwargs: {} },
  { id: "google/diffusiongemma-26b-a4b-it", contextwindow: 262144, maxoutput: 65536, chattemplatekwargs: {} },
];

// ─── helpers for chat_template_kwargs ───────────────────────────────
/** Build chat_template_kwargs for a given NVIDIA model id. */
export function buildchattemplatekwargs(modelid: string): Record<string, unknown> {
  for (const m of DEVTHINK_ROTATION_MODELS) if (m.id === modelid) {
    const kwargs = { ...m.chattemplatekwargs };
    if (!kwargs.thinking && !kwargs.enable_thinking && !kwargs.thinking_mode) kwargs.enable_thinking = true;
    return kwargs;
  }
  for (const m of INDIVIDUAL_CHAT_MODELS) if (m.id === modelid) {
    const kwargs = { ...m.chattemplatekwargs };
    if (!kwargs.thinking && !kwargs.enable_thinking && !kwargs.thinking_mode) kwargs.enable_thinking = true;
    return kwargs;
  }
  return { enable_thinking: true };
}

/** Check if a model id is a valid NVIDIA chat model (including devthink meta-model). */
export function isnvidiachatmodel(modelid: string): boolean {
  return modelid === DEVTHINK_ID || isv3chatmodel(modelid);
}

// ─── defaults ───────────────────────────────────────────────────────
// DEFAULT_MODEL updated 2026-08-30: stepfun-ai/step-3.7-flash retired (410 Gone)
// New default: moonshotai/kimi-k3 (newest, 3d old, 2.8T hybrid KDA+MLA MoE)
export const DEFAULT_MODEL = "moonshotai/kimi-k3";
export const DEFAULT_MAX_TOKENS = 68000;
export const MAX_TOKENS = 68000;
export const MAX_CONTEXT = DEVTHINK_CONTEXT_WINDOW;
export const MAX_THINKING_BUDGET = 68000;

// ─── timeout and rotation constants (shared across all V3 AI routes) ─
export const MODEL_SWITCH_INTERVAL_MS = 60000;    // 1min per model before switching (fast rotation for better UX)
export const MAX_MODEL_ROTATIONS = 4;             // max model rotations (one per rotation model)
export const FETCH_TIMEOUT_MS = 2147483647;       // near-infinite for non-streaming
export const STREAM_BODY_TIMEOUT_MS = 2147483647;  // near-infinite for streaming body
export const EMBED_TIMEOUT_MS = 2147483647;       // near-infinite for embeddings
export const MAX_RETRIES = 3;                     // max key retries per model
export const BACKOFF_BASE = 400;                  // base backoff in ms
export const BACKOFF_CAP = 8000;                  // max backoff in ms
export const SSE_SPACING_MS = 0;                  // zero-delay emission (real-time retransmission)

// legacy alias for MODEL_SWITCH_INTERVAL_MS
export const MODEL_TIMEOUT_MS = MODEL_SWITCH_INTERVAL_MS;

// ─── helpers ────────────────────────────────────────────────────────
/** Check if an id is any valid V3 model (chat or embedding). */
export function isv3model(id: string): boolean {
  return ALL_MODEL_IDS.includes(id as typeof ALL_MODEL_IDS[number]);
}

/** Check if an id is a valid V3 chat model. */
export function isv3chatmodel(id: string): boolean {
  return V3_CHAT_MODELS.includes(id as typeof V3_CHAT_MODELS[number]);
}

/** Check if an id is a valid V3 embedding model. */
export function isv3embedmodel(id: string): boolean {
  return V3_EMBED_MODELS.includes(id as typeof V3_EMBED_MODELS[number]);
}

/** Extract thinking level from request body fields (thinking, reasoning_effort, etc). */
export function extractthinkingLevel(body: Record<string, unknown>): string {
  const raw = String(
    body.thinking ?? body.thinkingLevel ?? body.thinkinglevel ?? body.reasoning_effort
    ?? body.reasoning_level ?? body.thinking_level ?? "high"
  ).toLowerCase();
  const exact = THINKING_LEVELS.find((l) => l === raw);
  if (exact) return exact;
  for (const l of THINKING_LEVELS) {
    if (raw.includes(l)) return l;
  }
  return "high";
}

/** Get thinking budget in tokens for a given thinking level. */
export function getthinkingBudget(level: string): number {
  return THINKING_BUDGETS[level] ?? 68000;
}

// ─── legacy aliases (lowercase, kept for backward compat) ────────────
export const extractthinkinglevel = extractthinkingLevel;
export const getthinkingbudget = getthinkingBudget;

// ─── session stream manager (inlined, per-session isolation) ───────
// circuit breaker + concurrent session limit + per-session abort
const MAX_CONCURRENT_SESSIONS = 200;
const MAX_ERRORS_PER_SESSION = 8;
const ERROR_WINDOW_MS = 60_000;
const SESSION_TTL_MS = 300_000;
const CLEANUP_INTERVAL_MS = 60_000;
const MAX_SESSION_WAIT_MS = 5_000;

/** per-session streaming state with circuit breaker and abort controller */
interface SessionState {
  sessionId: string;
  startedAt: number;
  lastActivityAt: number;
  abortController: AbortController;
  errorCount: number;
  errorTimestamps: number[];
  isBlocked: boolean;
  blockedAt: number | null;
  activeStreams: number;
  totalRequests: number;
  totalErrors: number;
  lastError: string | null;
  lastHttpStatus: number | null;
}

/**
 * session stream manager - per-session streaming isolation.
 * each session gets its own abort controller, circuit breaker and
 * concurrent stream counter so one heavy session cannot overwhelm others.
 */
class SessionStreamManager {
  private sessions = new Map<string, SessionState>();
  private activeCount = 0;
  private totalRequests = 0;
  private totalErrors = 0;
  private totalRejected = 0;
  private totalCircuitBreaks = 0;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private waitQueue: Array<{ resolve: (ok: boolean) => void; timer: ReturnType<typeof setTimeout> }> = [];

  constructor() {
    this.cleanupTimer = setInterval(() => this.cleanup(), CLEANUP_INTERVAL_MS);
    if (this.cleanupTimer && typeof this.cleanupTimer === "object" && "unref" in this.cleanupTimer) {
      (this.cleanupTimer as ReturnType<typeof setInterval> & { unref: () => void }).unref();
    }
  }

  /** acquire a streaming slot for a session, returns null if rejected. */
  async acquire(sessionId: string): Promise<SessionState | null> {
    this.totalRequests++;
    const existing = this.sessions.get(sessionId);
    if (existing) {
      existing.lastActivityAt = Date.now();
      existing.totalRequests++;
      if (existing.isBlocked) {
        if (existing.blockedAt && Date.now() - existing.blockedAt > ERROR_WINDOW_MS) {
          existing.isBlocked = false;
          existing.blockedAt = null;
          existing.errorCount = 0;
          existing.errorTimestamps = [];
        } else {
          this.totalRejected++;
          return null;
        }
      }
      existing.activeStreams++;
      return existing;
    }
    if (this.activeCount >= MAX_CONCURRENT_SESSIONS) {
      const acquired = await this.waitForSlot();
      if (!acquired) {
        this.totalRejected++;
        return null;
      }
    }
    const state: SessionState = {
      sessionId, startedAt: Date.now(), lastActivityAt: Date.now(),
      abortController: new AbortController(), errorCount: 0, errorTimestamps: [],
      isBlocked: false, blockedAt: null, activeStreams: 1, totalRequests: 1,
      totalErrors: 0, lastError: null, lastHttpStatus: null,
    };
    this.sessions.set(sessionId, state);
    this.activeCount++;
    return state;
  }

  /** release a streaming slot for a session. */
  release(sessionId: string): void {
    const state = this.sessions.get(sessionId);
    if (!state) return;
    state.activeStreams = Math.max(0, state.activeStreams - 1);
    state.lastActivityAt = Date.now();
    if (state.activeStreams === 0 && Date.now() - state.lastActivityAt > SESSION_TTL_MS) {
      this.removeSession(sessionId);
    }
    this.notifyWaitQueue();
  }

  /** record an error for a session, may trigger circuit breaker. */
  recordError(sessionId: string, error: string, httpStatus?: number): void {
    const state = this.sessions.get(sessionId);
    if (!state) return;
    this.totalErrors++;
    state.totalErrors++;
    state.lastError = error;
    state.lastHttpStatus = httpStatus ?? null;
    state.lastActivityAt = Date.now();
    const now = Date.now();
    state.errorTimestamps.push(now);
    state.errorCount++;
    state.errorTimestamps = state.errorTimestamps.filter(t => now - t < ERROR_WINDOW_MS);
    if (state.errorTimestamps.length >= MAX_ERRORS_PER_SESSION && !state.isBlocked) {
      state.isBlocked = true;
      state.blockedAt = now;
      this.totalCircuitBreaks++;
      console.warn(`[v3-session] circuit breaker activated for ${sessionId}: ${state.errorTimestamps.length} errors in ${ERROR_WINDOW_MS}ms`);
    }
  }

  /** record a success for a session, gradually reduces error count. */
  recordSuccess(sessionId: string): void {
    const state = this.sessions.get(sessionId);
    if (!state) return;
    state.lastActivityAt = Date.now();
    state.lastHttpStatus = 200;
    if (state.errorCount > 0) state.errorCount = Math.max(0, state.errorCount - 1);
  }

  /** check if a session is currently circuit-broken. */
  isSessionBlocked(sessionId: string): boolean {
    const state = this.sessions.get(sessionId);
    if (!state || !state.isBlocked) return false;
    if (state.blockedAt && Date.now() - state.blockedAt > ERROR_WINDOW_MS) {
      state.isBlocked = false;
      state.blockedAt = null;
      state.errorCount = 0;
      state.errorTimestamps = [];
      return false;
    }
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    const staleIds: string[] = [];
    for (const [id, state] of this.sessions.entries()) {
      if (state.activeStreams === 0 && now - state.lastActivityAt > SESSION_TTL_MS) staleIds.push(id);
      if (now - state.lastActivityAt > 1_800_000) staleIds.push(id);
    }
    for (const id of staleIds) this.removeSession(id);
  }

  private removeSession(id: string): void {
    const state = this.sessions.get(id);
    if (state) {
      try { state.abortController.abort("session expired"); } catch {}
      this.sessions.delete(id);
      this.activeCount = Math.max(0, this.activeCount - 1);
      this.notifyWaitQueue();
    }
  }

  private async waitForSlot(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        const idx = this.waitQueue.findIndex(w => w.resolve === resolve);
        if (idx !== -1) this.waitQueue.splice(idx, 1);
        resolve(false);
      }, MAX_SESSION_WAIT_MS);
      this.waitQueue.push({ resolve, timer });
    });
  }

  private notifyWaitQueue(): void {
    if (this.waitQueue.length === 0 || this.activeCount >= MAX_CONCURRENT_SESSIONS) return;
    const next = this.waitQueue.shift();
    if (next) { clearTimeout(next.timer); next.resolve(true); }
  }
}

/** singleton session stream manager instance for all v3 routes */
export const sessionStreamManager = new SessionStreamManager();

// ─── vision models ──────────────────────────────────────────────────
const VISION_MODELS = new Set([
  "meta/llama-3.2-11b-vision-instruct",
  "meta/llama-3.2-90b-vision-instruct",
  "nvidia/nemotron-nano-12b-v2-vl",
  "nvidia/llama-3.1-nemotron-nano-vl-8b-v1",
]);

// ─── model catalog (for /v3/models endpoint) ────────────────────────
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

function makechatmodel(id: string, vision = false): ModelEntry {
  // real per-model context/output from INDIVIDUAL_CHAT_MODELS (the flat
  // 128k/32k default underreported the 1m-context nemotron + deepseek models)
  const im = INDIVIDUAL_CHAT_MODELS.find((m) => m.id === id);
  const ctx = im?.contextwindow ?? 131072;
  const out = im?.maxoutput ?? 32768;
  return {
    id, object: "model", created: 1735689600, owned_by: id.split("/")[0],
    permission: [], root: id, parent: null,
    max_context_length: ctx, max_output_tokens: out,
    supports_thinking: true, supports_streaming: true, supports_tools: !vision, supports_vision: vision,
    description: `nvidia ${id} via integrate.api.nvidia.com`,
    meta: { provider: PROVIDER, upstream: UPSTREAM_URL },
  };
}

const chatmodels: ModelEntry[] = [
  // DevThink meta-model — fusion over 4 current rotation backends
  {
    id: DEVTHINK_ID, object: "model", created: 1735689600, owned_by: "devthink",
    permission: [], root: DEVTHINK_ID, parent: null,
    // context window = SUM of all 4 rotation backends (joint context, "fusion" logic)
    // max output    = SUM of all 4 rotation backends (joint output capacity)
    max_context_length: DEVTHINK_CONTEXT_WINDOW, max_output_tokens: DEVTHINK_MAX_OUTPUT,
    supports_thinking: true, supports_streaming: true, supports_tools: true, supports_vision: false,
    description: "devthink meta-model - rotation over 4 NVIDIA reasoning models, 2-calls pattern",
    meta: { provider: PROVIDER, upstream: UPSTREAM_URL, reasoning: true, tier: "primary", pattern: "2-calls", rotation_backends: DEVTHINK_ROTATION_MODELS.map((m) => m.id), combined_context_window: DEVTHINK_CONTEXT_WINDOW, combined_max_output: DEVTHINK_MAX_OUTPUT },
  },
  // ── DevThink rotation backends (4) — moonshotai/kimi-k3 (3d, hybrid KDA+MLA MoE) ──
  makechatmodel("moonshotai/kimi-k3"),
  // deepseek-ai/deepseek-v4-pro-0813 — 3d old, 1M context, MoE coding
  makechatmodel("deepseek-ai/deepseek-v4-pro-0813"),
  // meta/muse-glimmer-30b — 20d old, multimodal reasoning + separate reasoning output (ideal for DevThink)
  makechatmodel("meta/muse-glimmer-30b", true),
  // poolside/laguna-xs-2.1 — 1mo old, 33B MoE agentic coding/terminal
  makechatmodel("poolside/laguna-xs-2.1"),
  // ── Additional valid chat LLMs from build.nvidia.com (2026-08-30) ──
  // deepseek-ai/deepseek-v4-flash-0731 — 11d, 284B MoE (13B active), coding/chat/agentic
  makechatmodel("deepseek-ai/deepseek-v4-flash-0731"),
  // nvidia/nemotron-3.5-lightning-30b-a3b — 19d, 30B A3B MoE, specialized agentic
  makechatmodel("nvidia/nemotron-3.5-lightning-30b-a3b"),
  // nvidia/nemotron-3-ultra-550b-a55b — 2mo, hybrid Mamba-Transformer MoE, 1M context
  makechatmodel("nvidia/nemotron-3-ultra-550b-a55b"),
  // nvidia/nemotron-3-super-120b-a12b — 5mo, hybrid Mamba-Transformer MoE, 1M context
  makechatmodel("nvidia/nemotron-3-super-120b-a12b"),
  // nvidia/nemotron-3-nano-30b-a3b — 8mo, MoE, 1M context
  makechatmodel("nvidia/nemotron-3-nano-30b-a3b"),
  // nvidia/nemotron-3-nano-omni-30b-a3b-reasoning — 4mo, omni-modal reasoning (images/video/speech/text)
  makechatmodel("nvidia/nemotron-3-nano-omni-30b-a3b-reasoning", true),
  // google/gemma-4-31b-it — 5mo, dense 31B, coding/agentic
  makechatmodel("google/gemma-4-31b-it"),
  // openai/gpt-oss-20b — 1y, MoE reasoning
  makechatmodel("openai/gpt-oss-20b"),
  // openai/gpt-oss-120b — 1y, MoE reasoning (80GB)
  makechatmodel("openai/gpt-oss-120b"),
  // mistralai/mistral-nemotron — 1y, agentic/coding/function-calling
  makechatmodel("mistralai/mistral-nemotron"),
  // meta/llama-3.2-11b-vision-instruct — 1y, vision-language
  makechatmodel("meta/llama-3.2-11b-vision-instruct", true),
  // meta/llama-3.2-90b-vision-instruct — 1y, vision-language
  makechatmodel("meta/llama-3.2-90b-vision-instruct", true),
];

const embedmodels: ModelEntry[] = V3_EMBED_MODELS.map((id) => ({
  id, object: "model", created: 1735689600, owned_by: id.split("/")[0],
  permission: [], root: id, parent: null,
  max_context_length: 512, max_output_tokens: 1024,
  supports_thinking: false, supports_streaming: false, supports_tools: false, supports_vision: false,
  description: `nvidia ${id} embedding model`,
  meta: { provider: PROVIDER, upstream: UPSTREAM_URL, type: "embedding" },
}));

export const MODELS: ModelEntry[] = [...chatmodels, ...embedmodels];

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

// ─── handler ────────────────────────────────────────────────────────
function handlemodels(): Response {
  const payload = { object: "list" as const, data: MODELS };
  return new Response(JSON.stringify(payload), { status: 200, headers: jsonheaders() });
}

// ─── 40 http method exports ─────────────────────────────────────────
/** POST handler for /v3/models endpoint. */
export async function POST(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** GET handler for /v3/models endpoint. */
export async function GET(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** PUT handler for /v3/models endpoint. */
export async function PUT(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** PATCH handler for /v3/models endpoint. */
export async function PATCH(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** DELETE handler for /v3/models endpoint. */
export async function DELETE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** HEAD handler for /v3/models endpoint. */
export async function HEAD(_req: NextRequest): Promise<Response> { return new Response(null, { status: 200, headers: corsheaders() }); }
/** OPTIONS handler for /v3/models endpoint. */
export async function OPTIONS(_req: NextRequest): Promise<Response> { return new Response(null, { status: 204, headers: corsheaders() }); }
/** CONNECT handler for /v3/models endpoint. */
export async function CONNECT(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** TRACE handler for /v3/models endpoint. */
export async function TRACE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** PROPFIND handler for /v3/models endpoint. */
export async function PROPFIND(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** PROPPATCH handler for /v3/models endpoint. */
export async function PROPPATCH(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** MKCOL handler for /v3/models endpoint. */
export async function MKCOL(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** COPY handler for /v3/models endpoint. */
export async function COPY(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** MOVE handler for /v3/models endpoint. */
export async function MOVE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** LOCK handler for /v3/models endpoint. */
export async function LOCK(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** UNLOCK handler for /v3/models endpoint. */
export async function UNLOCK(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** SEARCH handler for /v3/models endpoint. */
export async function SEARCH(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** PURGE handler for /v3/models endpoint. */
export async function PURGE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** LINK handler for /v3/models endpoint. */
export async function LINK(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** UNLINK handler for /v3/models endpoint. */
export async function UNLINK(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** REPORT handler for /v3/models endpoint. */
export async function REPORT(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** CHECKOUT handler for /v3/models endpoint. */
export async function CHECKOUT(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** CHECKIN handler for /v3/models endpoint. */
export async function CHECKIN(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** UNCHECKOUT handler for /v3/models endpoint. */
export async function UNCHECKOUT(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** VERSION_CONTROL handler for /v3/models endpoint. */
export async function VERSION_CONTROL(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** LABEL handler for /v3/models endpoint. */
export async function LABEL(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** MERGE handler for /v3/models endpoint. */
export async function MERGE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** BASELINE_CONTROL handler for /v3/models endpoint. */
export async function BASELINE_CONTROL(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** MKACTIVITY handler for /v3/models endpoint. */
export async function MKACTIVITY(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** MKWORKSPACE handler for /v3/models endpoint. */
export async function MKWORKSPACE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** UPDATE handler for /v3/models endpoint. */
export async function UPDATE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** SUBSCRIBE handler for /v3/models endpoint. */
export async function SUBSCRIBE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** UNSUBSCRIBE handler for /v3/models endpoint. */
export async function UNSUBSCRIBE(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** NOTIFY handler for /v3/models endpoint. */
export async function NOTIFY(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** POLL handler for /v3/models endpoint. */
export async function POLL(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** BIND handler for /v3/models endpoint. */
export async function BIND(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** REBIND handler for /v3/models endpoint. */
export async function REBIND(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** UNBIND handler for /v3/models endpoint. */
export async function UNBIND(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** REINDEX handler for /v3/models endpoint. */
export async function REINDEX(_req: NextRequest): Promise<Response> { return handlemodels(); }
/** ACL handler for /v3/models endpoint. */
export async function ACL(_req: NextRequest): Promise<Response> { return handlemodels(); }
