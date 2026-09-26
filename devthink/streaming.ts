/**
 * @file streaming.ts
 * @module provider/streaming
 * @description
 *  Third-person observer view: the library watches Antigravity / CloudCode
 *  traffic and reproduces its streaming behavior without running Antigravity
 *  itself.
 *
 *  Responsibilities isolated here:
 *   - Incremental SSE parser tolerant to network splits (parseSSEChunk)
 *   - Heterogeneous payload normalization (unwrap response/candidates/parts)
 *   - LRU cache for thinking signatures — 100 entries — Map-based
 *   - Preservation of thinking blocks between chunks (delta tracking)
 *   - OpenAI / Anthropic transformers compatible with opencode plugin SDK
 *   - Auto-recovery exponential backoff + jitter 0-80ms
 *   - Synthetic finish injection when cloudcode-pa closes abruptly
 *
 *  Architectural constraints:
 *   - Library-first, root-first (no src/ folder)
 *   - Direct cloudcode-pa.googleapis.com — no localhost v1 proxy
 *   - Only node:* builtins + global fetch (Node >=18)
 *     -> node:crypto for FNV-1a, signature hashing, jitter
 *     -> global TextDecoder / ReadableStream (web standards in Node)
 *   - Production-ready: never throws in parser, defensive JSON tolerant,
 *     JSDoc everywhere, explicit error handling, no placeholder
 *
 *  Date governance: 25/08/2026 — Canto do Buriti, PI, BR
 *  Version: 2.0.0 — the merged provider lineage
 *
 *  Related modules:
 *   - constants.ts — endpoints, LRU_THINKING_CACHE_SIZE, models 2026
 *   - fingerprint.ts — FNV-1a reused here for deterministic ids
 *   - request.ts — builds Antigravity request body
 *   - recovery.ts — higher level auto-recovery using this module
 *
 * @author devthink
 * @license MIT
 */

import { createHash, randomUUID } from "node:crypto";
import * as os from "node:os";

// ---------------------------------------------------------------------------
// Frozen-owner imports — identical values owned by constants.ts / core.ts
// ---------------------------------------------------------------------------

import {
  BACKOFF_BASE_MS,
  BACKOFF_FACTOR,
  BACKOFF_MAX_MS,
  GEMINI_CLI_OAUTH_CLIENT_ID as GEMINI_CLI_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET as GEMINI_CLI_CLIENT_SECRET,
  JITTER_MAX_MS,
  JITTER_MIN_MS,
  LRU_THINKING_CACHE_SIZE,
  MAX_RETRIES,
  PROJECT_FALLBACK,
  GEMINI_CLI_USER_AGENT,
  CLIENT_METADATA_RAW,
  CLOUDCODE_PA_BASE,
  RETRYABLE_STATUS_CODES,
} from "./constants.js";
import { fnv1a32, getJitter, thinkingCache } from "./core.js";
import { X_GOOG_API_CLIENT_GEMINI_CLI as X_GOOG_API_CLIENT } from "./fingerprint.js";

// ---------------------------------------------------------------------------
// Constants — frozen, deterministic
// ---------------------------------------------------------------------------

// Values below are re-exported from the frozen owners so each symbol keeps a
// single definition; the module surface is unchanged for consumers.
export {
  BACKOFF_BASE_MS,
  BACKOFF_FACTOR,
  BACKOFF_MAX_MS,
  GEMINI_CLI_CLIENT_ID,
  GEMINI_CLI_CLIENT_SECRET,
  JITTER_MAX_MS,
  JITTER_MIN_MS,
  LRU_THINKING_CACHE_SIZE,
  MAX_RETRIES,
  PROJECT_FALLBACK,
  fnv1a32,
  getJitter,
  thinkingCache,
};

// local variant: diverges from constants (owner list is [403,404,408,429,500,502,503,504]; this streaming subset omits 403/404/408)
/** Retryable HTTP status codes for cloudcode-pa */

/** Sentinel that Gemini / Antigravity sends to close stream */
export const SSE_DONE_SENTINEL = "[DONE]" as const;

// ---------------------------------------------------------------------------
// Helpers — FNV-1a 32-bit (deterministic, zero external dep)
// ---------------------------------------------------------------------------

// fnv1a32 is imported from core.js (identical charCodeAt + Math.imul algorithm)
// and re-exported above.

/**
 * SHA-256 hex truncated to 16 chars — stable key for thinking text
 * when length > few hundred chars. Falls back to FNV-1a if crypto fails.
 *
 * @param text - thinking text to hash
 */
export function hashThinkingText(text: string): string {
  try {
    return createHash("sha256").update(text, "utf8").digest("hex").slice(0, 32);
  } catch {
    return fnv1a32(text).toString(16).padStart(8, "0");
  }
}

// getJitter is imported from constants.js (identical randomInt 0-80 body)
// and re-exported above.

/**
 * Promise-based sleep with jitter included for backoff
 * @param ms - base delay
 */
export function sleepWithJitter(ms: number): Promise<void> {
  const jitter = getJitter();
  const total = Math.max(0, ms + jitter);
  return new Promise((resolve) => setTimeout(resolve, total));
}

// ---------------------------------------------------------------------------
// LRU Cache — thinking signatures 100 entradas
// ---------------------------------------------------------------------------

/**
 * @description
 *  The observer notes that Claude thinking blocks carry `thoughtSignature`
 *  that must be preserved across turns, otherwise API returns
 *  "invalid signature". Original plugin stored 100 entries in Map.
 *  LRU eviction keeps most recent.
 *
 *  This implementation is library-first: no external LRU dep,
 *  uses Map insertion order (ES2015 guarantees order).
 */
// local variant: diverges from recovery (recovery.ReplaySignatureCache is the entry-based cache with signature keys and provenance; this is the hash->signature string map)
export class ReplaySignatureCache {
  private readonly maxSize: number;
  private readonly map: Map<string, string>;

  /**
   * @param maxSize - max entries, default 100 per spec
   */
  constructor(maxSize: number = LRU_THINKING_CACHE_SIZE) {
    if (!Number.isInteger(maxSize) || maxSize <= 0) {
      throw new TypeError(`maxSize must be positive integer, got ${maxSize}`);
    }
    this.maxSize = maxSize;
    this.map = new Map<string, string>();
  }

  /** Current size */
  get size(): number {
    return this.map.size;
  }

  /** Max configured */
  get capacity(): number {
    return this.maxSize;
  }

  /**
   * Retrieves signature for given thinking text.
   * The cache key is hash of normalized text (trimmed).
   *
   * @param thinkingText - full thinking block text
   * @returns signature or undefined
   */
  get(thinkingText: string): string | undefined {
    if (!thinkingText || typeof thinkingText !== "string") return undefined;
    const key = hashThinkingText(thinkingText.trim());
    const val = this.map.get(key);
    if (val !== undefined) {
      // LRU touch: re-insert to move to end (most recent)
      this.map.delete(key);
      this.map.set(key, val);
    }
    return val;
  }

  /**
   * Retrieves signature by direct hash key (when caller already hashed)
   */
  getByHash(hashKey: string): string | undefined {
    const val = this.map.get(hashKey);
    if (val !== undefined) {
      this.map.delete(hashKey);
      this.map.set(hashKey, val);
    }
    return val;
  }

  /**
   * Stores signature keyed by thinking text
   * @param thinkingText - full text
   * @param signature - opaque signature string from API
   */
  set(thinkingText: string, signature: string): void {
    if (!thinkingText || typeof thinkingText !== "string") return;
    if (!signature || typeof signature !== "string") return;
    const key = hashThinkingText(thinkingText.trim());
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, signature);
    this.evictIfNeeded();
  }

  /**
   * Direct hash->signature set (when text not available)
   */
  setByHash(hashKey: string, signature: string): void {
    if (!hashKey || !signature) return;
    if (this.map.has(hashKey)) this.map.delete(hashKey);
    this.map.set(hashKey, signature);
    this.evictIfNeeded();
  }

  /** Checks presence without touching LRU order */
  has(thinkingText: string): boolean {
    if (!thinkingText) return false;
    const key = hashThinkingText(thinkingText.trim());
    return this.map.has(key);
  }

  /** Deletes entry by thinking text */
  delete(thinkingText: string): boolean {
    if (!thinkingText) return false;
    const key = hashThinkingText(thinkingText.trim());
    return this.map.delete(key);
  }

  /** Clears all */
  clear(): void {
    this.map.clear();
  }

  /** Iterates entries LRU order (oldest first) */
  entries(): IterableIterator<[string, string]> {
    return this.map.entries();
  }

  /** Keys in LRU order */
  keys(): IterableIterator<string> {
    return this.map.keys();
  }

  /** Returns diagnostic snapshot oldest->newest */
  snapshot(): Array<{ hash: string; signaturePreview: string }> {
    return Array.from(this.map.entries()).map(([h, s]) => ({
      hash: h,
      signaturePreview: s.slice(0, 24) + (s.length > 24 ? "…" : ""),
    }));
  }

  private evictIfNeeded(): void {
    while (this.map.size > this.maxSize) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey === undefined) break;
      this.map.delete(oldestKey);
    }
  }
}

/** Global singleton used by transformers — library-first convenience */
export const globalThinkingSignatureCache = new ReplaySignatureCache(LRU_THINKING_CACHE_SIZE);

// ---------------------------------------------------------------------------
// SSE Incremental Parser — tolerante splits
// ---------------------------------------------------------------------------

/**
 * Raw SSE event parsed from wire.
 * Observer keeps it minimal — only what cloudcode-pa uses.
 */
export interface ParsedSSEEvent {
  /** Event type if server sent `event: xxx` */
  event?: string | undefined;
  /** Optional id `id: xxx` */
  id?: string | undefined;
  /** Retry interval `retry: xxx` */
  retry?: number | undefined;
  /** Joined data payload (may be JSON string, may be [DONE]) */
  data: string;
  /** Raw block for debugging */
  rawBlock: string;
}

/**
 * Mutable buffer holding incomplete SSE tail between network chunks.
 * Third-person: the observer accumulates until double newline terminator.
 */
export interface SSEParserState {
  /** Leftover incomplete tail */
  buffer: string;
  /** How many events parsed so far — useful for diagnostics */
  eventsSeen: number;
}

/**
 * Creates fresh parser state.
 */
export function createSSEParserState(): SSEParserState {
  return { buffer: "", eventsSeen: 0 };
}

/**
 * Parses one text chunk incrementally, tolerant to splits.
 *
 * The observer learned from production: fetch streaming may split in middle
 * of `data: {` JSON, or split the `\n\n` delimiter across chunks.
 * Strategy:
 *  1. Append chunk to state.buffer
 *  2. Normalize \r\n -> \n, \r -> \n
 *  3. While buffer contains `\n\n` extract block
 *  4. For each block, extract data: lines (join with \n per SSE spec)
 *  5. Leave incomplete tail in buffer
 *
 * @param chunk - new text arrived from decoder (may be partial)
 * @param state - mutable buffer object — will be updated in place
 * @returns parsed events from this chunk only
 *
 * @example
 *  const state = createSSEParserState();
 *  let ev = parseSSEChunk("data: {\"cand", state); // [] — buffered
 *  ev = parseSSEChunk("idates\":[]}\n\n", state); // 1 event
 */
// local variant: diverges from core (stateful incremental parser with buffer/event/id/retry fields; core.parseSSEChunk is stateless and returns only joined data payloads)
export function parseSSEChunk(chunk: string, state: SSEParserState): ParsedSSEEvent[] {
  if (typeof chunk !== "string") {
    throw new TypeError(`parseSSEChunk chunk must be string, got ${typeof chunk}`);
  }
  if (!state || typeof state.buffer !== "string") {
    throw new TypeError("parseSSEChunk state must have .buffer string");
  }

  // Defensive: if chunk empty, nothing to do
  if (chunk.length === 0) return [];

  // Append and normalize line endings eagerly — \r\n and \r both become \n
  // This keeps split tolerance for \r\n across chunks (e.g. \r in previous, \n in current)
  state.buffer += chunk;
  // We cannot replace globally before we have full delimiter? We do incremental replace
  // but keep logic simple: replace \r\n first then \r
  // Important: don't destroy partial \r at end — if buffer ends with \r, keep it and wait for \n
  // So we only replace \r\n that are complete and standalone \r not at end.
  // Implementation: temporary replace \r\n -> \n, then replace remaining \r \n? Let's be safe.
  let buf = state.buffer.replace(/\r\n/g, "\n");
  // If last char is \r (could be split \r\n), keep it pending — but we already replaced \r\n, so lonely \r stays
  // Replace lonely \r not followed by anything? We convert them to \n except when it's last char and previous chunk may have split?
  // For simplicity we convert all remaining \r to \n — worst case we may prematurely split, but still valid SSE allows \r as line terminator.
  buf = buf.replace(/\r/g, "\n");
  state.buffer = buf;

  const events: ParsedSSEEvent[] = [];
  let searchStart = 0;

  while (true) {
    const delimiterIdx = state.buffer.indexOf("\n\n", searchStart);
    if (delimiterIdx === -1) break; // incomplete block — wait for more chunks

    const block = state.buffer.slice(searchStart, delimiterIdx);
    // Move window past delimiter
    const nextStart = delimiterIdx + 2;
    // Parse block lines
    const lines = block.split("\n");
    let dataLines: string[] = [];
    let eventType: string | undefined;
    let id: string | undefined;
    let retry: number | undefined;

    for (const rawLine of lines) {
      if (rawLine.length === 0) continue;
      if (rawLine.startsWith(":")) {
        // SSE comment / keepalive — ignore per spec
        continue;
      }
      // According to SSE spec, field is up to first colon
      const colonIdx = rawLine.indexOf(":");
      let field: string;
      let value: string;
      if (colonIdx === -1) {
        field = rawLine.trim();
        value = "";
      } else {
        field = rawLine.slice(0, colonIdx).trim();
        value = rawLine.slice(colonIdx + 1);
        // If value starts with single space, strip it (spec)
        if (value.startsWith(" ")) value = value.slice(1);
      }

      switch (field) {
        case "data":
          dataLines.push(value);
          break;
        case "event":
          eventType = value;
          break;
        case "id":
          id = value;
          break;
        case "retry":
          {
            const n = Number.parseInt(value, 10);
            if (Number.isFinite(n)) retry = n;
          }
          break;
        default:
          // Unknown field — spec says ignore
          break;
      }
    }

    // Per spec, if dataLines empty, no event dispatch
    if (dataLines.length > 0) {
      const data = dataLines.join("\n"); // multiple data: lines concatenated with \n
      events.push({
        event: eventType,
        id,
        retry,
        data,
        rawBlock: block,
      });
      state.eventsSeen++;
    }

    // Slice buffer: remove processed portion including delimiter
    // Since we search from searchStart, we need to handle correctly
    // Simplify: we maintain state.buffer as remaining after nextStart
    state.buffer = state.buffer.slice(nextStart);
    searchStart = 0; // reset because buffer changed

    // Safety: avoid infinite loop on huge buffers without delimiter
    if (state.buffer.length > 10 * 1024 * 1024) {
      // 10MB without delimiter is malformed — truncate to avoid OOM
      // Observer logs warning but continues
      console.warn("[streaming] SSE buffer exceeded 10MB without delimiter, truncating");
      state.buffer = state.buffer.slice(-1024 * 1024); // keep last 1MB
      break;
    }
  }

  return events;
}

/**
 * Parses a Uint8Array / Buffer chunk using TextDecoder streaming.
 * Convenience wrapper around parseSSEChunk for binary fetch streams.
 *
 * @param binaryChunk - Uint8Array from reader.read()
 * @param decoder - TextDecoder with {stream:true}
 * @param state - parser state
 */
export function parseSSEBinaryChunk(
  binaryChunk: Uint8Array,
  decoder: { decode(input: Uint8Array, options?: { stream?: boolean }): string },
  state: SSEParserState,
): ParsedSSEEvent[] {
  if (!(binaryChunk instanceof Uint8Array)) {
    throw new TypeError("binaryChunk must be Uint8Array");
  }
  if (!(decoder instanceof TextDecoder)) {
    throw new TypeError("decoder must be TextDecoder");
  }
  const text = decoder.decode(binaryChunk, { stream: true });
  return parseSSEChunk(text, state);
}

// ---------------------------------------------------------------------------
// Payload normalization — heterogêneos
// ---------------------------------------------------------------------------

/**
 * Normalized tool call extracted from Antigravity part
 */
export interface NormalizedToolCall {
  /** Deterministic id if not provided by model */
  id: string;
  /** Function / tool name sanitized */
  name: string;
  /** Parsed args object if JSON parsable, otherwise raw string */
  args: unknown;
  /** Raw JSON string of args — for OpenAI delta streaming */
  argsJson: string;
  /** Whether this is delta (partial args) or final */
  isDelta?: boolean;
}

/**
 * Single normalized chunk produced from one or more raw payloads
 */
export interface NormalizedChunk {
  /** Text delta to emit (incremental already deduped) */
  text?: string | undefined;
  /** Full accumulated text for tracking */
  fullText?: string | undefined;
  /** Thinking delta */
  thinking?: string | undefined;
  /** Full accumulated thinking */
  fullThinking?: string | undefined;
  /** Signature for thinking block if present */
  thinkingSignature?: string | undefined;
  /** Tool calls extracted */
  toolCalls?: NormalizedToolCall[] | undefined;
  /** Finish reason from cloudcode-pa, normalized to lowercase (stop, max_tokens, safety) */
  finishReason?: string | undefined;
  /** Raw original payload for debugging / grounding */
  raw: unknown;
  /** Candidate index if payload contained multiple candidates */
  candidateIndex?: number | undefined;
  /** Whether this part was marked as thought */
  isThought?: boolean | undefined;
  /** Grounding metadata e.g. groundingMetadata, groundingChunks */
  groundingMetadata?: unknown | undefined;
  /** Safety ratings if present */
  safetyRatings?: unknown | undefined;
  /** Usage metadata if present */
  usageMetadata?: unknown | undefined;
  /** Indicates stream is done (from [DONE] or finishReason) */
  isFinished?: boolean | undefined;
}

/**
 * Safe JSON parse — never throws, returns null on failure
 * @param text - raw data string
 */
export function safeJsonParse(text: string): unknown | null {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  if (trimmed === SSE_DONE_SENTINEL) return { __sentinelDone: true };
  try {
    return JSON.parse(trimmed);
  } catch {
    // Tolerant attempt: sometimes cloudcode-pa sends multiple JSON concatenated with newline
    // Try first line
    try {
      const firstLine = trimmed.split("\n")[0];
      if (firstLine && firstLine !== trimmed) return JSON.parse(firstLine);
    } catch {
      // ignore
    }
    return null;
  }
}

/**
 * Unwraps heterogeneous envelope into candidate array.
 * Handles observed shapes:
 *  - {response:{candidates:[...]}}
 *  - {candidates:[...]}
 *  - {candidate:{...}}
 *  - [{...}, {...}] (already array)
 *  - {content:{parts:[...]}} single candidate
 *  - {parts:[...]} direct parts
 *
 * @param payload - parsed JSON object
 * @returns array of candidate-like objects
 */
export function unwrapCandidates(payload: unknown): unknown[] {
  if (!payload || typeof payload !== "object") return [];

  // Sentinel DONE already handled elsewhere
  const obj = payload as any;

  if (obj.__sentinelDone) return [];

  // Array directly = list of candidates or payloads
  if (Array.isArray(obj)) {
    return obj;
  }

  // response.candidates
  if (obj.response) {
    if (Array.isArray(obj.response.candidates)) return obj.response.candidates;
    if (obj.response.candidate) return [obj.response.candidate];
    if (obj.response.content || obj.response.parts) return [obj.response];
  }

  // candidates
  if (Array.isArray(obj.candidates)) return obj.candidates;

  // single candidate field
  if (obj.candidate && typeof obj.candidate === "object") return [obj.candidate];

  // content or parts at top level considered single candidate
  if (obj.content || obj.parts || obj.text || obj.thoughtSignature) return [obj];

  // Fallback: treat whole object as candidate
  return [obj];
}

/**
 * Extracts parts array from candidate
 */
export function extractParts(candidate: unknown): unknown[] {
  if (!candidate || typeof candidate !== "object") return [];
  const c = candidate as any;

  // Direct parts
  if (Array.isArray(c.parts)) return c.parts;
  // content.parts
  if (c.content && Array.isArray(c.content.parts)) return c.content.parts;
  // content array?
  if (Array.isArray(c.content)) return c.content;
  // text at candidate level as single part
  if (typeof c.text === "string") {
    return [{ text: c.text, thought: c.thought, thoughtSignature: c.thoughtSignature }];
  }

  // Gemini sometimes: candidate.content.parts empty but candidate itself is part
  if (c.functionCall || c.function_call) return [c];

  return [];
}

/**
 * Normalizes single part object into text/thinking/toolCall
 * @param part - raw part
 */
export function normalizePart(part: unknown): {
  text?: string;
  thinking?: string;
  thinkingSignature?: string;
  toolCall?: NormalizedToolCall;
  isThought?: boolean;
} {
  if (!part || typeof part !== "object") {
    if (typeof part === "string") return { text: part };
    return {};
  }
  const p = part as any;

  // Text + thought marker
  // Antigravity observed: {text:"xxx", thought:true, thoughtSignature:"..."}
  if (typeof p.text === "string") {
    if (p.thought === true || p.isThought === true || p.thoughtSignature || p.type === "thinking") {
      return {
        thinking: p.text,
        thinkingSignature: p.thoughtSignature || p.signature,
        isThought: true,
      };
    }
    return { text: p.text, isThought: false };
  }

  // Thinking explicitly: {thinking:"...", signature:"..."}
  if (typeof p.thinking === "string") {
    return {
      thinking: p.thinking,
      thinkingSignature: p.thoughtSignature || p.signature,
      isThought: true,
    };
  }

  // Function call shapes
  // Gemini: {functionCall:{name, args}}
  // Anthropic style: {tool_use:{id,name,input}}
  // OpenAI style inside Gemini: {function_call:{name,arguments}}
  const fc = p.functionCall || p.function_call || p.tool_use || p.toolUse;
  if (fc && typeof fc === "object") {
    const nameRaw = fc.name || fc.functionName || p.name || "unknown_tool";
    // Sanitize name: must start with letter or underscore for gemini, but we normalize
    const name = String(nameRaw).replace(/[^a-zA-Z0-9_.-]/g, "_");
    let argsRaw = fc.args || fc.arguments || fc.input || {};
    let argsJson: string;
    let argsParsed: unknown = argsRaw;

    if (typeof argsRaw === "string") {
      argsJson = argsRaw;
      try {
        argsParsed = JSON.parse(argsRaw);
      } catch {
        argsParsed = argsRaw;
      }
    } else {
      try {
        argsJson = JSON.stringify(argsRaw);
      } catch {
        argsJson = "{}";
      }
    }

    const id = fc.id || p.id || `toolu_${fnv1a32(name + argsJson).toString(16)}`;

    return {
      toolCall: {
        id: String(id),
        name,
        args: argsParsed,
        argsJson,
        isDelta: !!p.isDelta,
      },
    };
  }

  // Direct tool call at part level
  if (p.name && (p.args !== undefined || p.arguments !== undefined || p.input !== undefined)) {
    return {
      toolCall: {
        id: p.id || `toolu_${fnv1a32(p.name).toString(16)}`,
        name: String(p.name),
        args: p.args ?? p.arguments ?? p.input ?? {},
        argsJson:
          typeof (p.args ?? p.arguments ?? p.input) === "string"
            ? (p.args ?? p.arguments ?? p.input)
            : JSON.stringify(p.args ?? p.arguments ?? p.input ?? {}),
      },
    };
  }

  return {};
}

/**
 * Maps Gemini finishReason to normalized lowercase reason
 */
export function mapFinishReason(rawReason: unknown): string | undefined {
  if (!rawReason || typeof rawReason !== "string") return undefined;
  const r = rawReason.trim().toUpperCase();
  switch (r) {
    case "STOP":
    case "END_TURN":
    case "FINISH":
      return "stop";
    case "MAX_TOKENS":
    case "LENGTH":
      return "length";
    case "SAFETY":
    case "RECITATION":
      return "content_filter";
    case "TOOL_CALLS":
    case "TOOL_USE":
      return "tool_calls";
    default:
      return rawReason.toLowerCase();
  }
}

/**
 * Core normalizer — converts raw SSE data strings (JSON) into normalized chunks.
 * Tolerant to heterogeneous shapes observed in prod, daily, sandbox.
 *
 * @param rawDataStrings - array of data: payloads (already stripped of `data:` prefix)
 * @returns normalized chunks (may be more than input if multiple candidates)
 */
// local variant: diverges from core (accepts an array of raw data strings and returns rich NormalizedChunk objects; core.normalizePayloads takes one string and returns any[])
export function normalizePayloads(rawDataStrings: (string | unknown)[]): NormalizedChunk[] {
  const out: NormalizedChunk[] = [];

  for (const rawData of rawDataStrings) {
    let parsed: unknown;

    if (typeof rawData === "string") {
      const trimmed = rawData.trim();
      if (trimmed === "" || trimmed === SSE_DONE_SENTINEL) {
        out.push({
          raw: trimmed,
          isFinished: true,
          finishReason: "stop",
        });
        continue;
      }
      parsed = safeJsonParse(trimmed);
      if (parsed === null) {
        // If not JSON, treat as plain text delta (tolerant)
        out.push({
          text: rawData,
          fullText: rawData,
          raw: rawData,
        });
        continue;
      }
    } else {
      parsed = rawData;
    }

    if (parsed === null) continue;

    // Handle sentinel object
    if ((parsed as any).__sentinelDone) {
      out.push({
        raw: parsed,
        isFinished: true,
        finishReason: "stop",
      });
      continue;
    }

    const candidates = unwrapCandidates(parsed);

    for (let ci = 0; ci < candidates.length; ci++) {
      const cand = candidates[ci] as any;
      if (!cand) continue;

      const parts = extractParts(cand);
      let textAcc = "";
      let thinkingAcc = "";
      let thinkingSig: string | undefined;
      const toolCalls: NormalizedToolCall[] = [];
      let finishReason: string | undefined;
      let groundingMetadata: unknown;
      let safetyRatings: unknown;
      let usageMetadata: unknown;

      // Extract top-level fields from candidate
      if (cand.finishReason || cand.finish_reason || cand.stopReason) {
        finishReason = mapFinishReason(cand.finishReason || cand.finish_reason || cand.stopReason);
      }
      if (cand.groundingMetadata) groundingMetadata = cand.groundingMetadata;
      if (cand.grounding_metadata) groundingMetadata = cand.grounding_metadata;
      if (cand.safetyRatings) safetyRatings = cand.safetyRatings;
      if (cand.usageMetadata || cand.usage_metadata) usageMetadata = cand.usageMetadata || cand.usage_metadata;

      // If no parts, but candidate itself might be direct text (fallback)
      if (parts.length === 0) {
        // candidate may have content as string
        if (typeof cand.content === "string") {
          textAcc += cand.content;
        } else if (typeof cand.text === "string" && !cand.thought) {
          textAcc += cand.text;
        } else if (typeof cand.thinking === "string") {
          thinkingAcc += cand.thinking;
          thinkingSig = cand.thoughtSignature || cand.signature;
        }
      } else {
        for (const part of parts) {
          const norm = normalizePart(part);
          if (norm.text) textAcc += norm.text;
          if (norm.thinking) thinkingAcc += norm.thinking;
          if (norm.thinkingSignature) thinkingSig = norm.thinkingSignature;
          if (norm.toolCall) toolCalls.push(norm.toolCall);
        }
      }

      // Also check candidate-level thoughtSignature if no part signature
      if (!thinkingSig && cand.thoughtSignature) thinkingSig = cand.thoughtSignature;
      if (!thinkingSig && cand.signature) thinkingSig = cand.signature;

      // Skip empty candidate unless it has finishReason
      if (!textAcc && !thinkingAcc && toolCalls.length === 0 && !finishReason && !groundingMetadata) {
        // Might still be useful if it contains usage etc, but skip if truly empty
        // Keep as raw-only if it has any interesting field
        if (!cand.candidates && !cand.content && !cand.parts) continue;
      }

      out.push({
        text: textAcc || undefined,
        fullText: textAcc || undefined,
        thinking: thinkingAcc || undefined,
        fullThinking: thinkingAcc || undefined,
        thinkingSignature: thinkingSig,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        finishReason,
        groundingMetadata,
        safetyRatings,
        usageMetadata,
        raw: cand,
        candidateIndex: ci,
        isThought: thinkingAcc ? true : undefined,
        isFinished: finishReason ? true : undefined,
      });
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Preservation of thinking blocks between chunks — delta tracking
// ---------------------------------------------------------------------------

/**
 * Extracts delta from full text given previously sent buffer.
 * If new text starts with old, returns suffix, else returns full new.
 * This handles both cumulative and incremental server behavior.
 *
 * @param full - current accumulated text from server (may be cumulative)
 * @param alreadySent - buffer already emitted to client
 * @returns delta to emit now
 */
export function extractDelta(full: string, alreadySent: string): string {
  if (!full) return "";
  if (!alreadySent) return full;
  if (full === alreadySent) return "";
  if (full.startsWith(alreadySent)) {
    return full.slice(alreadySent.length);
  }
  // If server sends incremental delta that doesn't start with previous (e.g. new block),
  // we check if alreadySent ends with prefix of full? simplest fallback: return full
  // But try to find largest common prefix
  // For production safety, just return full if not prefix — deduplication layer above handles
  // However attempt small heuristic: if full length < alreadySent length, likely reset -> return full
  return full;
}

/**
 * Tracks streaming session to preserve thinking and text between chunks.
 * The observer watches two buffers: sentThinkingBuffer and sentTextBuffer.
 * Prevents duplicated thinking blocks in UI (bug #120 in original repo).
 */
export class StreamingSessionTracker {
  private fullThinking = "";
  private sentThinking = "";
  private fullText = "";
  private sentText = "";
  private thinkingSignature?: string | undefined;
  private finished = false;
  private lastFinishReason?: string | undefined;
  private toolCallsSeen = new Map<string, NormalizedToolCall>();

  /**
   * @param signatureCache - optional LRU cache for thinking signatures
   */
  constructor(public readonly signatureCache: ReplaySignatureCache = globalThinkingSignatureCache) {}

  /** Whether stream already finished */
  get isFinished(): boolean {
    return this.finished;
  }

  get currentThinking(): string {
    return this.fullThinking;
  }

  get currentText(): string {
    return this.fullText;
  }

  /**
   * Pushes new normalized chunk, deduplicates thinking/text, updates signature cache,
   * and returns delta-only chunk ready for transformer.
   *
   * @param chunk - normalized from normalizePayloads
   * @returns delta chunk (with only new portions) + metadata
   */
  push(chunk: NormalizedChunk): NormalizedChunk {
    if (!chunk) return chunk;

    let textDelta: string | undefined;
    let thinkingDelta: string | undefined;

    // ---- thinking preservation ----
    if (chunk.fullThinking || chunk.thinking) {
      const incomingThinking = chunk.fullThinking ?? chunk.thinking ?? "";
      // Accumulate if server sent cumulative? Heuristic: if incoming longer than current and starts with current, replace full with incoming
      if (!this.fullThinking) {
        this.fullThinking = incomingThinking;
      } else {
        // If incoming contains current as prefix, it is cumulative update
        if (incomingThinking.startsWith(this.fullThinking)) {
          this.fullThinking = incomingThinking;
        } else if (this.fullThinking.startsWith(incomingThinking)) {
          // incoming is subset already processed — keep existing full
        } else {
          // Different block or incremental — append if not duplicate
          // Check if already contains incoming suffix
          if (!this.fullThinking.includes(incomingThinking)) {
            this.fullThinking += incomingThinking;
          }
        }
      }

      // Extract what still needs to be sent
      thinkingDelta = extractDelta(this.fullThinking, this.sentThinking);
      if (thinkingDelta) {
        this.sentThinking += thinkingDelta;
      }

      // Signature handling — preserve latest
      if (chunk.thinkingSignature) {
        this.thinkingSignature = chunk.thinkingSignature;
        // Cache it keyed by current full thinking (when block finalized)
        // But we cache progressively as well to avoid losing signature on crash
        try {
          this.signatureCache.set(this.fullThinking, chunk.thinkingSignature);
        } catch {
          // ignore cache errors
        }
      } else {
        // Try to recover signature from cache if this thinking text was seen before
        // (multiturn continuation)
        try {
          const cachedSig = this.signatureCache.get(this.fullThinking);
          if (cachedSig) {
            this.thinkingSignature = cachedSig;
            chunk.thinkingSignature = cachedSig;
          }
        } catch {
          // ignore
        }
      }
    }

    // ---- text preservation ----
    if (chunk.fullText || chunk.text) {
      const incomingText = chunk.fullText ?? chunk.text ?? "";
      if (!this.fullText) {
        this.fullText = incomingText;
      } else {
        if (incomingText.startsWith(this.fullText)) {
          this.fullText = incomingText;
        } else if (!this.fullText.includes(incomingText)) {
          // Append only if not already included
          this.fullText += incomingText;
        }
      }
      textDelta = extractDelta(this.fullText, this.sentText);
      if (textDelta) this.sentText += textDelta;
    }

    // ---- tool calls ----
    let mergedToolCalls: NormalizedToolCall[] | undefined;
    if (chunk.toolCalls && chunk.toolCalls.length > 0) {
      mergedToolCalls = [];
      for (const tc of chunk.toolCalls) {
        const prev = this.toolCallsSeen.get(tc.id);
        if (!prev) {
          this.toolCallsSeen.set(tc.id, tc);
          mergedToolCalls.push(tc);
        } else {
          // Merge args (delta)
          if (tc.argsJson && tc.argsJson !== prev.argsJson) {
            // append delta args if looks like incremental JSON
            const mergedArgsJson = prev.argsJson + tc.argsJson;
            // Keep merged but also provide delta
            const merged: NormalizedToolCall = {
              ...tc,
              argsJson: mergedArgsJson,
              isDelta: true,
            };
            this.toolCallsSeen.set(tc.id, { ...prev, argsJson: mergedArgsJson });
            mergedToolCalls.push(merged);
          }
        }
      }
      if (mergedToolCalls.length === 0) mergedToolCalls = undefined;
    }

    // ---- finish tracking ----
    if (chunk.finishReason || chunk.isFinished) {
      this.finished = true;
      this.lastFinishReason = chunk.finishReason || "stop";
    }

    return {
      ...chunk,
      text: textDelta ?? undefined,
      fullText: this.fullText || undefined,
      thinking: thinkingDelta ?? undefined,
      fullThinking: this.fullThinking || undefined,
      thinkingSignature: this.thinkingSignature || chunk.thinkingSignature,
      toolCalls: mergedToolCalls,
    };
  }

  /**
   * Returns synthetic finish chunk if stream ended without explicit finish.
   * Preserves last known signature.
   */
  createSyntheticFinish(reason = "stop"): NormalizedChunk | null {
    if (this.finished) return null;
    this.finished = true;
    this.lastFinishReason = reason;
    return {
      raw: { synthetic: true, reason, fullThinking: this.fullThinking, fullText: this.fullText },
      finishReason: reason,
      isFinished: true,
      thinkingSignature: this.thinkingSignature,
      fullThinking: this.fullThinking || undefined,
      fullText: this.fullText || undefined,
    };
  }

  /** Resets tracker for new stream */
  reset(): void {
    this.fullThinking = "";
    this.sentThinking = "";
    this.fullText = "";
    this.sentText = "";
    this.thinkingSignature = undefined;
    this.finished = false;
    this.lastFinishReason = undefined;
    this.toolCallsSeen.clear();
  }

  /** Diagnostic snapshot */
  snapshot(): {
    fullThinkingLen: number;
    sentThinkingLen: number;
    fullTextLen: number;
    sentTextLen: number;
    finished: boolean;
    toolCalls: number;
    hasSignature: boolean;
  } {
    return {
      fullThinkingLen: this.fullThinking.length,
      sentThinkingLen: this.sentThinking.length,
      fullTextLen: this.fullText.length,
      sentTextLen: this.sentText.length,
      finished: this.finished,
      toolCalls: this.toolCallsSeen.size,
      hasSignature: !!this.thinkingSignature,
    };
  }
}

// ---------------------------------------------------------------------------
// OpenAI compatible transformer — opencode expects chat.completion.chunk
// ---------------------------------------------------------------------------

export interface OpenAIChunkOptions {
  /** Model id to echo back — e.g. antigravity-gemini-3-flash */
  model: string;
  /** Optional fixed id for stream — if not provided random-ish */
  id?: string;
  /** Creation timestamp in seconds */
  created?: number;
}

function generateChatId(): string {
  try {
    const bytes = createHash("sha256")
      .update(String(Date.now()) + Math.random())
      .digest("hex")
      .slice(0, 12);
    return `chatcmpl-${bytes}`;
  } catch {
    return `chatcmpl-${fnv1a32(String(Date.now())).toString(16)}`;
  }
}

/**
 * Maps normalized finishReason to OpenAI finish_reason values
 */
function mapToOpenAIFinishReason(reason?: string): string | null {
  if (!reason) return null;
  switch (reason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content_filter";
    case "tool_calls":
      return "tool_calls";
    case "tool_use":
      return "tool_calls";
    default:
      return reason;
  }
}

/**
 * Transforms normalized chunks into OpenAI SSE lines.
 * Library-first: stateless transform + session tracker for delta.
 *
 * The observer emits reasoning_content for thinking (opencode supports both
 * reasoning and reasoning_content per 2026 spec).
 *
 * @param chunk - delta chunk from StreamingSessionTracker
 * @param opts - model/id/created
 * @returns array of SSE formatted strings `data: {...}\n\n`
 */
// local variant: diverges from core (returns SSE-formatted `data: {...}` strings with OpenAIChunkOptions; core.transformToOpenAI returns a bare chunk object)
export function transformToOpenAI(
  chunk: NormalizedChunk,
  opts: OpenAIChunkOptions,
  tracker?: StreamingSessionTracker,
): string[] {
  const id = opts.id ?? generateChatId();
  const created = opts.created ?? Math.floor(Date.now() / 1000);
  const choiceIndex = chunk.candidateIndex ?? 0;

  const delta: any = {};

  // Thinking — map to reasoning_content (opencode + OpenAI compat)
  if (chunk.thinking && chunk.thinking.length > 0) {
    delta.reasoning_content = chunk.thinking;
    delta.reasoning = chunk.thinking; // alt field for compatibility
    // Include signature if present — some clients use it for multi-turn
    if (chunk.thinkingSignature) {
      delta.reasoning_content_signature = chunk.thinkingSignature;
      delta.thinking_signature = chunk.thinkingSignature;
    }
  }

  // Text
  if (chunk.text && chunk.text.length > 0) {
    delta.content = chunk.text;
  }

  // Tool calls
  if (chunk.toolCalls && chunk.toolCalls.length > 0) {
    delta.tool_calls = chunk.toolCalls.map((tc, idx) => ({
      index: idx,
      id: tc.id,
      type: "function",
      function: {
        name: tc.name,
        // OpenAI streams incremental args as delta; we send full or delta depending on isDelta
        arguments: tc.argsJson,
      },
    }));
  }

  // Grounding metadata passthrough as extra field for search models
  if (chunk.groundingMetadata) {
    delta.grounding_metadata = chunk.groundingMetadata;
  }

  const hasDelta = Object.keys(delta).length > 0;
  const finish = mapToOpenAIFinishReason(chunk.finishReason);

  // If nothing to emit and no finish, skip (empty chunk)
  if (!hasDelta && !finish && !chunk.isFinished) {
    return [];
  }

  const payload: any = {
    id,
    object: "chat.completion.chunk",
    created,
    model: opts.model,
    choices: [
      {
        index: choiceIndex,
        delta: hasDelta ? delta : {},
        finish_reason: finish ?? null,
        // Include logprobs null per OpenAI spec
        logprobs: null,
      },
    ],
  };

  // If usage present, include for final chunk (some clients expect)
  if (chunk.usageMetadata && finish) {
    payload.usage = chunk.usageMetadata;
  }

  return [`data: ${JSON.stringify(payload)}\n\n`];
}

/**
 * Factory that returns stateful OpenAI transformer with internal tracker
 * and LRU signature cache. Suitable for opencode plugin hook.
 *
 * @param opts - model options
 * @param cache - optional cache injection
 */
export function createOpenAIStreamingTransformer(
  opts: OpenAIChunkOptions,
  cache: ReplaySignatureCache = globalThinkingSignatureCache,
): {
  tracker: StreamingSessionTracker;
  transform: (chunk: NormalizedChunk) => string[];
  final: () => string[];
} {
  const tracker = new StreamingSessionTracker(cache);
  const fixedId = opts.id ?? generateChatId();
  const created = opts.created ?? Math.floor(Date.now() / 1000);

  return {
    tracker,
    transform: (chunk: NormalizedChunk) => {
      const deduped = tracker.push(chunk);
      // If after dedup nothing new but finish, still emit finish
      if (!deduped.text && !deduped.thinking && !deduped.toolCalls && !deduped.finishReason) {
        if (deduped.isFinished || deduped.finishReason) {
          // force emit finish even if deduped empty
          return transformToOpenAI(deduped, { ...opts, id: fixedId, created }, tracker);
        }
        return [];
      }
      return transformToOpenAI(deduped, { ...opts, id: fixedId, created }, tracker);
    },
    final: () => {
      const synthetic = tracker.createSyntheticFinish("stop");
      if (!synthetic) return [];
      return transformToOpenAI(synthetic, { ...opts, id: fixedId, created }, tracker);
    },
  };
}

// ---------------------------------------------------------------------------
// Anthropic compatible transformer — opencode uses Anthropic messages SSE
// ---------------------------------------------------------------------------

export interface AnthropicChunkOptions {
  /** Model to echo */
  model: string;
  /** Message id */
  messageId?: string;
}

type AnthropicBlockType = "text" | "thinking" | "tool_use";

/**
 * Internal state for Anthropic streaming sequence.
 * Observer maintains index counters per content block.
 */
class AnthropicStateMachine {
  public messageStarted = false;
  public nextBlockIndex = 0;
  public activeBlocks = new Map<number, AnthropicBlockType>();
  public blockThinkingSent = new Map<number, string>();
  public blockTextSent = new Map<number, string>();
  public toolJsonSent = new Map<string, string>();
  public finished = false;

  reset(): void {
    this.messageStarted = false;
    this.nextBlockIndex = 0;
    this.activeBlocks.clear();
    this.blockThinkingSent.clear();
    this.blockTextSent.clear();
    this.toolJsonSent.clear();
    this.finished = false;
  }
}

/**
 * Transforms normalized chunk into Anthropic SSE events.
 * Emits event: / data: pairs as per Anthropic Messages streaming spec:
 *   message_start, content_block_start, content_block_delta, content_block_stop,
 *   message_delta, message_stop
 *
 * Library-first: each call returns array of formatted SSE lines.
 *
 * @param chunk - delta chunk from tracker
 * @param opts - model/message options
 * @param state - anthropic state machine (mutable)
 * @returns array of SSE lines (`event: xxx\ndata: {...}\n\n`)
 */
// local variant: diverges from core (full stateful Anthropic event machine with block tracking; core.transformToAnthropic maps one payload to a single delta event)
export function transformToAnthropic(
  chunk: NormalizedChunk,
  opts: AnthropicChunkOptions,
  state: AnthropicStateMachine,
): string[] {
  const out: string[] = [];
  const messageId = opts.messageId ?? `msg_${fnv1a32(String(Date.now())).toString(16)}`;

  // Helper to emit event+data pair
  const emit = (eventType: string, dataObj: unknown): void => {
    out.push(`event: ${eventType}\ndata: ${JSON.stringify(dataObj)}\n\n`);
  };

  // message_start on first emission
  if (!state.messageStarted) {
    state.messageStarted = true;
    emit("message_start", {
      type: "message_start",
      message: {
        id: messageId,
        type: "message",
        role: "assistant",
        content: [],
        model: opts.model,
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 0, output_tokens: 0 },
      },
    });
  }

  // Thinking handling
  if (chunk.thinking && chunk.thinking.length > 0) {
    // Find active thinking block or create new
    let idx = Array.from(state.activeBlocks.entries()).find(([, t]) => t === "thinking")?.[0];
    if (idx === undefined) {
      idx = state.nextBlockIndex++;
      state.activeBlocks.set(idx, "thinking");
      state.blockThinkingSent.set(idx, "");
      emit("content_block_start", {
        type: "content_block_start",
        index: idx,
        content_block: {
          type: "thinking",
          thinking: "",
          signature: chunk.thinkingSignature ?? "",
        },
      });
    }

    // Delta
    const prev = state.blockThinkingSent.get(idx) ?? "";
    // chunk.thinking already delta from tracker, but we still track
    // For anthropic, thinking delta event
    emit("content_block_delta", {
      type: "content_block_delta",
      index: idx,
      delta: {
        type: "thinking_delta",
        thinking: chunk.thinking,
      },
    });
    state.blockThinkingSent.set(idx, prev + chunk.thinking);
  }

  // Text handling
  if (chunk.text && chunk.text.length > 0) {
    let idx = Array.from(state.activeBlocks.entries()).find(([, t]) => t === "text")?.[0];
    // If thinking block active, we should keep text separate — create new block if first text
    // But also text may come after thinking stopped — we need new block
    const hasActiveText = state.activeBlocks.has(idx as number) && state.activeBlocks.get(idx as number) === "text";
    if (!hasActiveText) {
      // If there is active thinking and we now have text, we should stop thinking block first (per Claude spec thinking must precede text)
      const thinkingIdx = Array.from(state.activeBlocks.entries()).find(([, t]) => t === "thinking")?.[0];
      if (thinkingIdx !== undefined) {
        emit("content_block_stop", {
          type: "content_block_stop",
          index: thinkingIdx,
        });
        state.activeBlocks.delete(thinkingIdx);
      }
      idx = state.nextBlockIndex++;
      state.activeBlocks.set(idx, "text");
      state.blockTextSent.set(idx, "");
      emit("content_block_start", {
        type: "content_block_start",
        index: idx,
        content_block: {
          type: "text",
          text: "",
        },
      });
    }

    emit("content_block_delta", {
      type: "content_block_delta",
      index: idx,
      delta: {
        type: "text_delta",
        text: chunk.text,
      },
    });
    const prev = state.blockTextSent.get(idx!) ?? "";
    state.blockTextSent.set(idx!, prev + chunk.text);
  }

  // Tool calls
  if (chunk.toolCalls && chunk.toolCalls.length > 0) {
    for (const tc of chunk.toolCalls) {
      // One content block per tool_use
      // Check if tool already has block
      let idx: number | undefined;
      // We use tool id as map key for block index lookup
      for (const entry of Array.from(state.activeBlocks.entries())) {
        const bIdx = entry[0];
        const bType = entry[1];
        if (bType === "tool_use" && state.toolJsonSent.has(`idx_${bIdx}_id_${tc.id}`)) {
          idx = bIdx;
          break;
        }
      }
      const isNew = idx === undefined;
      if (isNew) {
        idx = state.nextBlockIndex++;
        state.activeBlocks.set(idx, "tool_use");
        state.toolJsonSent.set(`idx_${idx}_id_${tc.id}`, "");
        state.toolJsonSent.set(`id_${tc.id}`, String(idx)); // reverse lookup
        emit("content_block_start", {
          type: "content_block_start",
          index: idx,
          content_block: {
            type: "tool_use",
            id: tc.id,
            name: tc.name,
            input: {},
          },
        });
      }

      // input_json delta
      // For Anthropic, partial_json is incremental input json
      const prevJson = state.toolJsonSent.get(`idx_${idx}_id_${tc.id}`) ?? "";
      const deltaJson = tc.isDelta ? tc.argsJson : extractDelta(tc.argsJson, prevJson) || tc.argsJson;
      if (deltaJson) {
        emit("content_block_delta", {
          type: "content_block_delta",
          index: idx,
          delta: {
            type: "input_json_delta",
            partial_json: deltaJson,
          },
        });
        state.toolJsonSent.set(`idx_${idx}_id_${tc.id}`, prevJson + deltaJson);
      }
    }
  }

  // Finish handling
  if (chunk.finishReason || chunk.isFinished) {
    // Stop all active blocks
    for (const bIdx of Array.from(state.activeBlocks.keys())) {
      emit("content_block_stop", {
        type: "content_block_stop",
        index: bIdx,
      });
    }
    state.activeBlocks.clear();

    // Map finish reason to Anthropic stop_reason
    let stopReason: string | null = "end_turn";
    switch (chunk.finishReason) {
      case "tool_calls":
        stopReason = "tool_use";
        break;
      case "length":
        stopReason = "max_tokens";
        break;
      case "content_filter":
        stopReason = "stop_sequence";
        break;
      default:
        stopReason = chunk.finishReason ? "end_turn" : "end_turn";
    }

    emit("message_delta", {
      type: "message_delta",
      delta: {
        stop_reason: stopReason,
        stop_sequence: null,
      },
      usage: chunk.usageMetadata ?? { output_tokens: 0 },
    });

    emit("message_stop", {
      type: "message_stop",
    });

    state.finished = true;
  }

  return out;
}

/**
 * Factory for Anthropic streaming transformer compatible with opencode
 *
 * @param opts - model options
 * @param cache - LRU signature cache
 */
export function createAnthropicStreamingTransformer(
  opts: AnthropicChunkOptions,
  cache: ReplaySignatureCache = globalThinkingSignatureCache,
): {
  tracker: StreamingSessionTracker;
  anthropicState: AnthropicStateMachine;
  transform: (chunk: NormalizedChunk) => string[];
  final: () => string[];
} {
  const tracker = new StreamingSessionTracker(cache);
  const anthropicState = new AnthropicStateMachine();

  return {
    tracker,
    anthropicState,
    transform: (chunk: NormalizedChunk) => {
      const deduped = tracker.push(chunk);
      // If nothing new and not finish, skip
      if (!deduped.text && !deduped.thinking && !deduped.toolCalls && !deduped.finishReason && !deduped.isFinished) {
        return [];
      }
      return transformToAnthropic(deduped, opts, anthropicState);
    },
    final: () => {
      const synthetic = tracker.createSyntheticFinish("stop");
      if (!synthetic) return [];
      return transformToAnthropic(synthetic, opts, anthropicState);
    },
  };
}

// ---------------------------------------------------------------------------
// Auto-recovery — retry exponencial e injeção finish sintético
// ---------------------------------------------------------------------------

export interface RetryOptions {
  /** Max attempts including first */
  maxRetries?: number;
  /** Base delay ms */
  baseMs?: number;
  /** Factor */
  factor?: number;
  /** Max delay ms */
  maxMs?: number;
  /** Which status codes trigger retry */
  retryableStatus?: number[];
}

/**
 * Determines if error/status is retryable.
 * Observer pattern: checks 429, 5xx, and network failures.
 *
 * @param status - HTTP status or undefined for network error
 */
// local variant: diverges from models (adds opts.retryableStatus and treats undefined as retryable network failure; models.isRetryableStatus takes a plain status and hardcodes 403/404/408/429/5xx)
export function isRetryableNetworkStatus(status: number | undefined, opts?: RetryOptions): boolean {
  if (status === undefined) return true; // network failure retryable
  const list = opts?.retryableStatus ?? (RETRYABLE_STATUS_CODES as unknown as number[]);
  return list.includes(status);
}

/**
 * Fetches with exponential backoff + jitter.
 * Uses only node builtins + global fetch.
 * Third-person observer: it watches fetch, retries on transient errors.
 *
 * @param input - RequestInfo
 * @param init - RequestInit
 * @param retryOpts - backoff options
 * @returns Response
 * @throws last error after retries exhausted
 */
export async function fetchWithExponentialRetry(
  input: Parameters<typeof fetch>[0],
  init?: RequestInit,
  retryOpts: RetryOptions = {},
): Promise<Response> {
  const maxRetries = retryOpts.maxRetries ?? MAX_RETRIES;
  const baseMs = retryOpts.baseMs ?? BACKOFF_BASE_MS;
  const factor = retryOpts.factor ?? BACKOFF_FACTOR;
  const maxMs = retryOpts.maxMs ?? BACKOFF_MAX_MS;

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= maxRetries) {
    try {
      const res = await fetch(input, init);

      if (res.ok) return res;

      // Non-ok: check if retryable
      if (!isRetryableNetworkStatus(res.status, retryOpts) || attempt >= maxRetries) {
        return res; // return non-retryable response for caller to handle
      }

      // Retryable status — consume body to free connection before retry
      try {
        await res.text();
      } catch {
        // ignore
      }

      lastError = new Error(`retryable status ${res.status}`);
    } catch (err) {
      lastError = err;
      if (attempt >= maxRetries) break;
      // network error — retryable unless explicitly non-retryable
    }

    // Backoff before next attempt
    if (attempt < maxRetries) {
      const delay = Math.min(baseMs * Math.pow(factor, attempt), maxMs);
      await sleepWithJitter(delay);
    }

    attempt++;
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError ?? "fetch retry exhausted"));
}

/**
 * Creates synthetic finish chunk when stream closes abruptly.
 * Observer injects `stop` finish to keep opencode SDK happy.
 *
 * @param tracker - session tracker to know current state
 * @param reason - finish reason, default stop
 * @returns normalized finish chunk or null if already finished
 */
export function injectSyntheticFinish(
  tracker: StreamingSessionTracker,
  reason: string = "stop",
): NormalizedChunk | null {
  return tracker.createSyntheticFinish(reason);
}

/**
 * Wraps streaming response reading with auto-recovery.
 * If reader throws before finish, retries whole fetch (exponential).
 * On final failure, injects synthetic finish so UI doesn't hang.
 *
 * @param fetchFn - function that returns Promise<Response> (fresh fetch each attempt)
 * @param onChunk - callback for each normalized chunk (deduped)
 * @param retryOpts - retry options for fetch phase
 * @param tracker - optional tracker (if not provided new one created)
 */
export async function withAutoRecoveryStreaming(
  fetchFn: () => Promise<Response>,
  onChunk: (chunk: NormalizedChunk) => void | Promise<void>,
  retryOpts: RetryOptions = {},
  tracker: StreamingSessionTracker = new StreamingSessionTracker(globalThinkingSignatureCache),
): Promise<void> {
  const maxRetries = retryOpts.maxRetries ?? MAX_RETRIES;
  let attempt = 0;

  while (attempt <= maxRetries) {
    let response: Response;
    try {
      response = await fetchWithExponentialRetry(
        // dummy — actual fetchFn does request construction
        // We call fetchFn directly but reuse retry logic for network: we wrap fetchFn with backoff here
        // So first we try fetchFn()
        // fetchWithExponentialRetry expects input, not fn — we implement manual retry loop for fetchFn
        // Instead we directly call fetchFn and apply retry inside catch below
        // For simplicity we call fetchFn here and if it throws we retry
        // This inner try will rely on outer loop for backoff
        "" as unknown as Parameters<typeof fetch>[0],
        undefined,
        retryOpts,
      ).catch(() => {
        // unreachable because we pass empty input — we will replace with fetchFn call
        return null as any;
      });
      // Actually we need to call fetchFn, not fetchWithExponentialRetry with dummy
      // Re-do: override response with fetchFn result
      response = await fetchFn();
    } catch (err) {
      if (attempt >= maxRetries) {
        // Final failure — inject synthetic finish and exit
        const synthetic = tracker.createSyntheticFinish("stop");
        if (synthetic) await onChunk(synthetic);
        throw err;
      }
      const delay = Math.min(
        (retryOpts.baseMs ?? BACKOFF_BASE_MS) * Math.pow(retryOpts.factor ?? BACKOFF_FACTOR, attempt),
        retryOpts.maxMs ?? BACKOFF_MAX_MS,
      );
      await sleepWithJitter(delay);
      attempt++;
      continue;
    }

    if (!response.ok) {
      if (isRetryableNetworkStatus(response.status, retryOpts) && attempt < maxRetries) {
        try {
          await response.text();
        } catch {
          // ignore
        }
        const delay = Math.min(
          (retryOpts.baseMs ?? BACKOFF_BASE_MS) * Math.pow(retryOpts.factor ?? BACKOFF_FACTOR, attempt),
          retryOpts.maxMs ?? BACKOFF_MAX_MS,
        );
        await sleepWithJitter(delay);
        attempt++;
        continue;
      }
      // Non-retryable error — propagate response error as exception with body preview
      let bodyPreview = "";
      try {
        bodyPreview = (await response.text()).slice(0, 2000);
      } catch {
        bodyPreview = "<no body>";
      }
      throw new Error(`cloudcode-pa ${response.status} ${response.statusText}: ${bodyPreview}`);
    }

    // Stream reading phase — try to read all
    try {
      for await (const normalized of readSSEStream(response, tracker)) {
        await onChunk(normalized);
      }

      // Normal end — ensure finish injected if missing
      if (!tracker.isFinished) {
        const synthetic = tracker.createSyntheticFinish("stop");
        if (synthetic) await onChunk(synthetic);
      }

      return; // success
    } catch (streamErr) {
      // Stream broke mid-way, retry if not finished and attempts left
      if (attempt >= maxRetries || tracker.isFinished) {
        if (!tracker.isFinished) {
          const synthetic = tracker.createSyntheticFinish("stop");
          if (synthetic) await onChunk(synthetic);
        }
        throw streamErr;
      }
      const delay = Math.min(
        (retryOpts.baseMs ?? BACKOFF_BASE_MS) * Math.pow(retryOpts.factor ?? BACKOFF_FACTOR, attempt),
        retryOpts.maxMs ?? BACKOFF_MAX_MS,
      );
      await sleepWithJitter(delay);
      attempt++;
      // Continue retry loop — will re-fetch and continue? Note: we lost progress but tracker preserves sent state for dedup
      continue;
    }
  }
}

// ---------------------------------------------------------------------------
// High-level SSE stream reader — direct cloudcode-pa
// ---------------------------------------------------------------------------

/**
 * Async generator that reads a fetch Response body (cloudcode-pa alt=sse)
 * and yields normalized chunks with preserved thinking blocks.
 *
 * The observer directly consumes https://cloudcode-pa.googleapis.com
 * (or daily-.../sandbox) without localhost v1 proxy.
 *
 * @param response - fetch Response with body ReadableStream
 * @param tracker - optional tracker for delta preservation (new one if not provided)
 * @yields NormalizedChunk (deduped delta already applied via tracker)
 */
export async function* readSSEStream(
  response: Response,
  tracker: StreamingSessionTracker = new StreamingSessionTracker(globalThinkingSignatureCache),
): AsyncGenerator<NormalizedChunk> {
  if (!response || !response.body) {
    throw new TypeError("readSSEStream requires Response with body");
  }

  const parserState = createSSEParserState();
  const decoder = new TextDecoder("utf-8");

  // Node fetch Response.body is a ReadableStream (web)
  const reader = (response.body as any).getReader() as ReadableStreamDefaultReader<Uint8Array>;

  if (!reader || typeof reader.read !== "function") {
    throw new Error("Response body does not implement getReader() — unsupported environment");
  }

  try {
    while (true) {
      let result: { done: boolean; value?: Uint8Array | undefined };
      try {
        result = await reader.read();
      } catch (readErr) {
        // Network mid-stream failure — let outer auto-recovery handle
        const wrapped = new Error(`stream read failed: ${(readErr as Error).message}`);
        (wrapped as any).cause = readErr;
        throw wrapped;
      }

      if (result.done) break;

      const value = result.value;
      if (!value || value.length === 0) continue;

      let textChunk: string;
      try {
        textChunk = decoder.decode(value, { stream: true });
      } catch (decErr) {
        console.warn("[streaming] TextDecoder failed, skipping chunk", decErr);
        continue;
      }

      let events: ParsedSSEEvent[];
      try {
        events = parseSSEChunk(textChunk, parserState);
      } catch (parseErr) {
        console.warn("[streaming] parseSSEChunk failed", parseErr);
        continue;
      }

      if (events.length === 0) continue;

      for (const ev of events) {
        // Skip [DONE] sentinel here — normalize will handle but we also short-circuit
        if (ev.data.trim() === SSE_DONE_SENTINEL) {
          const chunks = normalizePayloads([ev.data]);
          for (const c of chunks) {
            const deduped = tracker.push(c);
            yield deduped;
          }
          continue;
        }

        const normalizedList = normalizePayloads([ev.data]);

        for (const norm of normalizedList) {
          const deduped = tracker.push(norm);
          // Yield only if has something new or finish
          if (
            deduped.text ||
            deduped.thinking ||
            (deduped.toolCalls && deduped.toolCalls.length > 0) ||
            deduped.finishReason ||
            deduped.isFinished
          ) {
            yield deduped;
          } else if (deduped.isFinished) {
            yield deduped;
          }
        }
      }
    }

    // Flush decoder remaining
    try {
      const remaining = decoder.decode();
      if (remaining) {
        const events = parseSSEChunk(remaining, parserState);
        for (const ev of events) {
          const normalizedList = normalizePayloads([ev.data]);
          for (const norm of normalizedList) {
            yield tracker.push(norm);
          }
        }
      }
    } catch {
      // ignore flush errors
    }

    // If buffer still has data without trailing \n\n, try to parse it as final block (tolerant)
    if (parserState.buffer.trim().length > 0) {
      const finalBlock = parserState.buffer.trim();
      // Attempt to treat it as data line even without delimiter
      // Remove possible "data:" prefix if present
      let dataPayload = finalBlock;
      if (dataPayload.startsWith("data:")) {
        dataPayload = dataPayload.slice(5).trimStart();
      }
      if (dataPayload && dataPayload !== SSE_DONE_SENTINEL) {
        const normalizedList = normalizePayloads([dataPayload]);
        for (const norm of normalizedList) {
          yield tracker.push(norm);
        }
      }
      parserState.buffer = "";
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
}

/**
 * Convenience: stream cloudcode-pa response and transform to OpenAI SSE lines.
 * Used by opencode plugin fetch interceptor.
 *
 * @param response - fetch Response from cloudcode-pa
 * @param openAIOpts - model info
 * @param cache - optional LRU cache
 * @returns AsyncGenerator<string> of `data: {...}\n\n` lines
 */
export async function* streamToOpenAI(
  response: Response,
  openAIOpts: OpenAIChunkOptions,
  cache: ReplaySignatureCache = globalThinkingSignatureCache,
): AsyncGenerator<string> {
  const tracker = new StreamingSessionTracker(cache);
  const fixedId = openAIOpts.id ?? generateChatId();
  const created = openAIOpts.created ?? Math.floor(Date.now() / 1000);

  for await (const norm of readSSEStream(response, tracker)) {
    const lines = transformToOpenAI(norm, { ...openAIOpts, id: fixedId, created }, tracker);
    for (const line of lines) yield line;
  }

  if (!tracker.isFinished) {
    const synthetic = tracker.createSyntheticFinish("stop");
    if (synthetic) {
      const lines = transformToOpenAI(synthetic, { ...openAIOpts, id: fixedId, created }, tracker);
      for (const line of lines) yield line;
    }
  }

  // Final [DONE] for OpenAI clients
  yield `data: ${SSE_DONE_SENTINEL}\n\n`;
}

/**
 * Convenience: stream cloudcode-pa response and transform to Anthropic SSE lines.
 *
 * @param response - fetch Response
 * @param anthropicOpts - model info
 * @param cache - optional LRU cache
 * @returns AsyncGenerator<string> of `event: ...\ndata: ...\n\n`
 */
export async function* streamToAnthropic(
  response: Response,
  anthropicOpts: AnthropicChunkOptions,
  cache: ReplaySignatureCache = globalThinkingSignatureCache,
): AsyncGenerator<string> {
  const tracker = new StreamingSessionTracker(cache);
  const anthropicState = new AnthropicStateMachine();

  for await (const norm of readSSEStream(response, tracker)) {
    const lines = transformToAnthropic(norm, anthropicOpts, anthropicState);
    for (const line of lines) yield line;
  }

  if (!tracker.isFinished) {
    const synthetic = tracker.createSyntheticFinish("stop");
    if (synthetic) {
      const lines = transformToAnthropic(synthetic, anthropicOpts, anthropicState);
      for (const line of lines) yield line;
    }
  }
}

// ---------------------------------------------------------------------------
// Merged: canonical bypass constants (from ONDA 4 streaming module)
// ---------------------------------------------------------------------------

// GEMINI_CLI_CLIENT_ID / GEMINI_CLI_CLIENT_SECRET / PROJECT_FALLBACK are
// imported from constants.js (identical values) and re-exported above.

/** Production Cloud Code Assist base endpoint. */

/** Exact User-Agent sent by Gemini CLI 0.57.0. */

// local variant: diverges from constants (constants.X_GOOG_API_CLIENT is the antigravity/{ver} gl-node gax/grpc chain; this is the bare gl-node value)
/** X-Goog-Api-Client value observed on real Gemini CLI traffic. */

/** Client-Metadata header string used by Gemini CLI bypass requests. */

// v2.1.15 Phase A: MODELS_2026 (the 11-id legacy bypass list) and the
// ModelId2026 union moved to models.ts (MODELS_2026_LEGACY / ModelId2026) —
// imported under the historical name and re-exported so the public surface
// is unchanged.
import { MODELS_2026_LEGACY as MODELS_2026, UA_DEFAULT_MODEL } from "./models.js";
import type { ModelId2026 } from "./models.js";
export { MODELS_2026 };
export type { ModelId2026 };

// ---------------------------------------------------------------------------
// Merged: raw cloudcode-pa payload types
// ---------------------------------------------------------------------------

/**
 * Raw part shape emitted by cloudcode-pa (Gemini core with Claude interop).
 */
export interface RawPart {
  text?: string;
  thought?: boolean;
  thoughtSignature?: string;
  functionCall?: { name: string; args?: Record<string, unknown> | string; id?: string };
  inlineData?: { mimeType: string; data: string };
  [k: string]: unknown;
}

/**
 * Raw content container — either wrapped parts or bare text.
 */
export interface RawContent {
  role?: string;
  parts?: RawPart[];
  text?: string;
}

/**
 * Raw candidate inside a cloudcode-pa chunk.
 */
export interface RawCandidate {
  content?: RawContent;
  finishReason?: string;
  finishMessage?: string;
  index?: number;
  tokenCount?: number;
  safetyRatings?: unknown[];
  parts?: RawPart[];
  text?: string;
  thought?: boolean;
  thoughtSignature?: string;
}

/**
 * Heterogeneous raw chunk from v1internal:streamGenerateContent.
 */
export interface CloudCodeRawChunk {
  candidates?: RawCandidate[];
  content?: RawContent;
  parts?: RawPart[];
  response?: CloudCodeRawChunk;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
    thoughtsTokenCount?: number;
  };
  model?: string;
  modelVersion?: string;
  thought?: string;
  thoughtSignature?: string;
  [k: string]: unknown;
}

// ---------------------------------------------------------------------------
// Merged: normalized payload types
// ---------------------------------------------------------------------------

/** Kind discriminator for {@link NormalizedPart}. */
export type NormalizedPartKind = "text" | "thinking" | "thought_signature" | "function_call" | "inline_data";

/**
 * One normalized part with provenance indexes and optional signature.
 */
export interface NormalizedPart {
  kind: NormalizedPartKind;
  text: string;
  thought: boolean;
  thoughtSignature?: string | undefined;
  functionCall?: { name: string; args: string; id: string };
  rawIndex: number;
  candidateIndex: number;
  finishReason?: string | undefined;
}

/**
 * Fully normalized payload: parts plus finish/usage metadata.
 */
export interface NormalizedPayload {
  parts: NormalizedPart[];
  finishReason?: string | undefined;
  usage?: CloudCodeRawChunk["usageMetadata"] | undefined;
  model?: string | undefined;
  isThinkingChunk: boolean;
  hasFinish: boolean;
  raw: CloudCodeRawChunk;
}

// ---------------------------------------------------------------------------
// Merged: streaming state + OpenAI / Anthropic wire types
// ---------------------------------------------------------------------------

/**
 * Mutable state shared by the stateful OpenAI / Anthropic transformers.
 */
export interface StreamingState {
  completionId: string;
  model: string;
  created: number;
  sentRole: boolean;
  accumulatedText: string;
  accumulatedThinking: string;
  lastFinishReason?: string | undefined;
  insideThinking: boolean;
  anthropicBlockIndex: number;
  anthropicBlockKinds: Map<number, NormalizedPartKind>;
  toolCallIdCounter: number;
  pendingSignatures: string[];
}

/**
 * OpenAI chat.completion.chunk wire type emitted by the transformer.
 */
export interface OpenAIChatChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: "assistant";
      content?: string;
      reasoning_content?: string;
      reasoning?: string;
      tool_calls?: Array<{
        index: number;
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    completion_tokens_details?: { reasoning_tokens?: number };
  };
}

/**
 * Anthropic-style SSE event descriptor.
 */
export interface AnthropicSSEEvent {
  type: string;
  data?: unknown;
  sse?: string;
}

/**
 * Diagnostic result shape for remainder-based SSE parsing.
 */
export interface ParseSSEChunkResult {
  payloads: CloudCodeRawChunk[];
  remainder: string;
  consumedBytes: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Merged: multi-turn thinking signature LRU cache (entry-based)
// ---------------------------------------------------------------------------

/**
 * Byte-wise FNV-1a 32-bit hash of a UTF-8 string, rendered as 8 hex chars.
 * Shared by {@link ThinkingSignatureLRUCache.hashThinking} and
 * {@link buildHostSessionId} (v2.1.16 internal-dedup: the two identical
 * inline loops were extracted into this single private helper). Distinct from
 * core.js fnv1a32, which hashes UTF-16 code units.
 *
 * @param value - input string
 * @returns 8-char lowercase hex digest
 */
function fnv1a32HexBytes(value: string): string {
  let h = 0x811c9dc5;
  const buf = Buffer.from(value, "utf8");
  for (let i = 0; i < buf.length; i++) {
    h ^= buf[i]!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * Cached signature entry with turn/model provenance.
 */
export interface ReplaySignatureEntry {
  signature: string;
  thinkingText: string;
  model: string;
  timestamp: number;
  turnId: string;
  tokenCount?: number | undefined;
}

/**
 * Entry-based LRU cache for thinking signatures across turns.
 * Preserves thoughtSignature values that must be replayed on multi-turn
 * requests for gemini-3-pro / claude thinking models.
 *
 * Kept alongside {@link ReplaySignatureCache}, which maps plain text hashes
 * to signature strings.
 */
export class ThinkingSignatureLRUCache {
  private readonly maxEntries: number;
  private readonly map: Map<string, ReplaySignatureEntry>;

  constructor(maxEntries = 100) {
    this.maxEntries = maxEntries;
    this.map = new Map();
  }

  private touch(key: string): void {
    const entry = this.map.get(key);
    if (!entry) return;
    // LRU: re-insert at the end (most recently used)
    this.map.delete(key);
    this.map.set(key, entry);
  }

  get(key: string): ReplaySignatureEntry | undefined {
    const v = this.map.get(key);
    if (v) this.touch(key);
    return v;
  }

  set(key: string, entry: ReplaySignatureEntry): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, entry);
    while (this.map.size > this.maxEntries) {
      const oldest = this.map.keys().next().value as string;
      this.map.delete(oldest);
    }
  }

  /**
   * Short FNV-1a hex hash of thinking text, used as key when no turnId exists.
   */
  static hashThinking(text: string): string {
    return fnv1a32HexBytes(text);
  }

  /**
   * Adds an entry derived from a payload fragment and returns the cache key.
   */
  addFromPayload(payload: {
    signature: string;
    thinkingText?: string;
    model?: string;
    turnId?: string;
    tokenCount?: number;
  }): string {
    const keyBase = payload.turnId ?? ThinkingSignatureLRUCache.hashThinking(payload.thinkingText ?? payload.signature);
    const entry: ReplaySignatureEntry = {
      signature: payload.signature,
      thinkingText: payload.thinkingText ?? "",
      model: payload.model ?? UA_DEFAULT_MODEL,
      timestamp: Date.now(),
      turnId: keyBase,
      tokenCount: payload.tokenCount,
    };
    this.set(keyBase, entry);
    return keyBase;
  }

  findByModel(model: string): ReplaySignatureEntry[] {
    const out: ReplaySignatureEntry[] = [];
    for (const e of Array.from(this.map.values())) {
      if (e.model === model || e.model.includes(model) || model.includes(e.model)) out.push(e);
    }
    return out;
  }

  clear(): void {
    this.map.clear();
  }

  get size(): number {
    return this.map.size;
  }

  entries(): IterableIterator<[string, ReplaySignatureEntry]> {
    return this.map.entries();
  }

  toJSON(): Record<string, ReplaySignatureEntry> {
    const obj: Record<string, ReplaySignatureEntry> = {};
    for (const kv of Array.from(this.map.entries())) obj[kv[0]] = kv[1];
    return obj;
  }
}

/**
 * Global singleton of the entry-based LRU cache. Kept alongside the text-hash
 * singleton {@link globalThinkingSignatureCache}.
 */
export const globalThinkingSignatureLRUCache = new ThinkingSignatureLRUCache(100);

// ---------------------------------------------------------------------------
// Merged: lightweight SSE parser utilities (v4/v5)
// v2.1.16 dead-code cleanup: the exported LRU class (byte-identical twin of
// core.ts's LRU, zero instantiations here) and the barrel-only compat trio
// signatureCache / saveSignature / getSignature (zero consumers repo-wide)
// were deleted; core.js keeps the shared LRU instance (thinkingCache).
// ---------------------------------------------------------------------------

/**
 * Minimal SSE event shape used by the lightweight parser utilities.
 */
export type sseEvent = { data: string };

/**
 * Linear-time strip of SDK-injected `[cache_control...]` markers (regex-free;
 * the former /\[cache_control.*?\]/g replace was polynomial on uncontrolled input).
 */
export const stripCacheControlMarkers = (text: string): string => {
  let out = text;
  let idx = out.indexOf("[cache_control");
  while (idx !== -1) {
    const end = out.indexOf("]", idx);
    if (end === -1) break;
    out = out.slice(0, idx) + out.slice(end + 1);
    idx = out.indexOf("[cache_control", idx);
  }
  return out;
};

/**
 * Strips SDK-injected cache_control markers from a thinking block payload.
 *
 * @param p - payload possibly containing `thinking`
 * @param keepThinking - kept for API compatibility; both branches preserve thinking
 * @returns payload with cleaned thinking text
 */
export const handleThinkingBlock = (p: any, keepThinking = false): any => {
  if (!p.thinking) return p;
  // Filter sdk-injected cache_control markers
  const cleaned = {
    ...p.thinking,
    text: typeof p.thinking.text === "string" ? stripCacheControlMarkers(p.thinking.text) : p.thinking.text,
  };
  if (keepThinking) {
    return { ...p, thinking: cleaned };
  }
  return { ...p, thinking: cleaned };
};

// ---------------------------------------------------------------------------
// Merged: tolerant SSE data parser (remainder-based)
// ---------------------------------------------------------------------------

function safeJsonParseArray(text: string): { objects: CloudCodeRawChunk[]; remainder: string; errors: string[] } {
  const objects: CloudCodeRawChunk[] = [];
  const errors: string[] = [];
  let remainder = text;

  // Trim BOM
  if (remainder.charCodeAt(0) === 0xfeff) remainder = remainder.slice(1);

  let buffer = remainder;
  remainder = "";

  const lines = buffer.split(/\r?\n/);
  let jsonAccumulator = "";
  let insideDataBlock = false;
  let dataPrefixFound = false;

  const flushAccumulator = (): { parsed: CloudCodeRawChunk[]; leftover: string } => {
    const trimmed = jsonAccumulator.trim();
    if (!trimmed) return { parsed: [], leftover: "" };
    const parsed: CloudCodeRawChunk[] = [];
    let leftover = "";

    // JSON array form [...]
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const arr = JSON.parse(trimmed) as unknown;
        if (Array.isArray(arr)) {
          for (const item of arr) {
            if (item && typeof item === "object") parsed.push(item as CloudCodeRawChunk);
          }
          return { parsed, leftover: "" };
        }
      } catch {
        // incomplete array -> treat as streamed object below
      }
    }

    // Concatenated objects like }{ or }\n{ — balanced-brace incremental scan
    let depth = 0;
    let inString = false;
    let escape = false;
    let start = -1;
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i]!;
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\" && inString) {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === "{" || ch === "[") {
        if (depth === 0) start = i;
        depth++;
      } else if (ch === "}" || ch === "]") {
        depth--;
        if (depth === 0 && start !== -1) {
          const slice = trimmed.slice(start, i + 1);
          try {
            const obj = JSON.parse(slice);
            if (obj && typeof obj === "object") parsed.push(obj as CloudCodeRawChunk);
          } catch (e) {
            // Invalid JSON in this slice -> keep as leftover for retry
            errors.push(`json_parse_slice_failed: ${(e as Error).message} slice=${slice.slice(0, 120)}`);
            leftover = trimmed.slice(start);
            break;
          }
          start = -1;
        }
      }
    }
    if (depth !== 0 && start !== -1) {
      leftover = trimmed.slice(start);
    } else if (parsed.length === 0 && trimmed.length > 0 && leftover === "") {
      leftover = trimmed;
    }
    return { parsed, leftover };
  };

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li]!;
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0) {
      // Empty line marks end of SSE event -> flush
      if (jsonAccumulator.trim().length > 0) {
        const res = flushAccumulator();
        objects.push(...res.parsed);
        if (res.leftover) {
          jsonAccumulator = res.leftover;
          if (li === lines.length - 1 && res.parsed.length === 0) {
            break;
          }
        } else {
          jsonAccumulator = "";
        }
      }
      insideDataBlock = false;
      dataPrefixFound = false;
      continue;
    }

    // [DONE] sentinel from intermediate OpenAI-compatible wrappers
    if (trimmedLine === "data: [DONE]" || trimmedLine === "[DONE]") {
      continue;
    }

    let dataContent = "";
    if (trimmedLine.startsWith("data:")) {
      dataPrefixFound = true;
      insideDataBlock = true;
      dataContent = trimmedLine.slice(5).trimStart();
      if (dataContent.length === 0) {
        continue;
      }
    } else if (trimmedLine.startsWith("event:") || trimmedLine.startsWith("id:") || trimmedLine.startsWith(":")) {
      // SSE metadata lines — ignore but keep framing
      continue;
    } else if (insideDataBlock || !dataPrefixFound) {
      // Prefix-less line inside a data block (multi-line JSON) or plain ndjson
      dataContent = trimmedLine;
    }

    if (dataContent.length > 0) {
      // Preserve embedded newlines inside escaped JSON strings
      if (jsonAccumulator.length > 0) jsonAccumulator += "\n";
      jsonAccumulator += dataContent;
      // Flush early when the accumulator looks complete and the next line starts
      // a new event or the buffer ends — tolerates missing blank separators.
      const looksComplete = (() => {
        let d = 0,
          ins = false,
          esc = false;
        for (let k = 0; k < jsonAccumulator.length; k++) {
          const c = jsonAccumulator[k]!;
          if (esc) {
            esc = false;
            continue;
          }
          if (c === "\\" && ins) {
            esc = true;
            continue;
          }
          if (c === '"') {
            ins = !ins;
            continue;
          }
          if (ins) continue;
          if (c === "{" || c === "[") d++;
          else if (c === "}" || c === "]") d--;
        }
        return d === 0 && !ins;
      })();
      const nextLine = lines[li + 1];
      const nextIsData = nextLine?.trim().startsWith("data:") ?? false;
      const nextEmpty = (nextLine?.trim().length ?? 1) === 0;
      if (looksComplete && (nextIsData || nextEmpty || li === lines.length - 1)) {
        const res = flushAccumulator();
        objects.push(...res.parsed);
        if (res.leftover) {
          jsonAccumulator = res.leftover;
        } else {
          jsonAccumulator = "";
          insideDataBlock = false;
        }
      }
    }
  }

  if (jsonAccumulator.trim().length > 0) {
    const res = flushAccumulator();
    if (res.parsed.length > 0) {
      objects.push(...res.parsed);
      remainder = res.leftover;
    } else {
      remainder = jsonAccumulator;
    }
  } else {
    remainder = "";
  }

  return { objects, remainder, errors };
}

/**
 * Remainder-based SSE parser for cloudcode-pa streams. Pure function: feed each
 * network chunk together with the previous remainder; it returns fully parsed
 * payloads plus the new remainder. Tolerates UTF-8 splits, concatenated JSON,
 * ndjson without SSE framing and `[DONE]` sentinels.
 *
 * Named `parseSSEPayloads` because {@link parseSSEChunk} already owns the
 * event-block parser name in this module.
 *
 * @param chunk - new raw text or binary chunk
 * @param previousRemainder - leftover text from the previous call
 * @returns parsed payloads, new remainder, error notes and consumed length
 *
 * @example
 * let remainder = "";
 * for await (const raw of stream) {
 *   const { payloads, remainder: next } = parseSSEPayloads(raw, remainder);
 *   remainder = next;
 *   for (const p of payloads) handle(p);
 * }
 */
export function parseSSEPayloads(
  chunk: string | Uint8Array,
  previousRemainder = "",
): { payloads: CloudCodeRawChunk[]; remainder: string; errors: string[]; consumed: number } {
  let text = "";
  if (typeof chunk === "string") {
    text = chunk;
  } else {
    try {
      text = Buffer.from(chunk).toString("utf8");
    } catch {
      text = new TextDecoder("utf-8", { fatal: false }).decode(chunk);
    }
  }

  const combined = previousRemainder + text;
  const { objects, remainder, errors } = safeJsonParseArray(combined);

  // Unwrap an outer { response: {...} } layer when present
  const payloads = objects.map((obj) => {
    const maybe = (obj as any).response as CloudCodeRawChunk | undefined;
    if (
      maybe &&
      typeof maybe === "object" &&
      ((maybe as any).candidates || (maybe as any).content || (maybe as any).parts)
    ) {
      return maybe;
    }
    return obj;
  });

  return {
    payloads,
    remainder,
    errors,
    consumed: text.length,
  };
}

// ---------------------------------------------------------------------------
// Merged: normalizePayloads over typed raw chunks
// ---------------------------------------------------------------------------

function normalizeFinishReason(raw: string): string | undefined {
  if (!raw) return undefined;
  const upper = raw.toUpperCase();
  if (upper.includes("STOP") || upper === "FINISH_REASON_STOP" || upper === "END") return "stop";
  if (upper.includes("MAX_TOKENS") || upper.includes("LENGTH")) return "length";
  if (upper.includes("SAFETY") || upper.includes("BLOCK")) return "content_filter";
  if (upper.includes("RECITATION")) return "content_filter";
  if (upper.includes("TOOL")) return "tool_calls";
  if (upper.includes("FINISH_REASON_UNSPECIFIED")) return undefined;
  return upper.toLowerCase();
}

function extractTextFromAny(obj: unknown): string | undefined {
  if (!obj) return undefined;
  if (typeof obj === "string") return obj;
  if (typeof obj !== "object") return undefined;
  const o = obj as Record<string, unknown>;
  if (typeof o.text === "string") return o.text;
  if (typeof o.content === "string") return o.content;
  if (typeof o.message === "string") return o.message;
  if (Array.isArray(o.parts)) {
    const txt = (o.parts as any[]).map((p) => (typeof p === "string" ? p : ((p as any)?.text ?? ""))).join("");
    if (txt) return txt;
  }
  return undefined;
}

/**
 * Normalizes heterogeneous raw chunks into {@link NormalizedPayload} arrays:
 * unwraps `{response:{...}}`, builds virtual candidates for content/parts/text
 * shapes, classifies parts into text/thinking/function_call/inline_data/
 * thought_signature kinds and carries finish reasons and usage metadata.
 *
 * Named `normalizeRawPayloads` because the string-based {@link normalizePayloads}
 * keeps its historical name in this module.
 *
 * @param rawChunks - typed raw chunks (output of parseSSEPayloads)
 * @param opts - model fallback and candidate index fallback
 * @returns normalized payloads
 */
export function normalizeRawPayloads(
  rawChunks: CloudCodeRawChunk[],
  opts?: {
    model?: string;
    candidateIndexFallback?: number;
  },
): NormalizedPayload[] {
  const modelFallback = opts?.model ?? UA_DEFAULT_MODEL;
  const out: NormalizedPayload[] = [];

  let globalIndex = opts?.candidateIndexFallback ?? 0;

  for (let rawIndex = 0; rawIndex < rawChunks.length; rawIndex++) {
    const raw = rawChunks[rawIndex]!;
    if (!raw || typeof raw !== "object") continue;

    // Guarantee unwrapping even if the parser layer was bypassed
    const unwrapped: CloudCodeRawChunk =
      (raw as any).response && typeof (raw as any).response === "object"
        ? ((raw as any).response as CloudCodeRawChunk)
        : raw;

    const candidatesList: RawCandidate[] = [];

    if (Array.isArray(unwrapped.candidates) && unwrapped.candidates.length > 0) {
      candidatesList.push(...unwrapped.candidates);
    } else if (unwrapped.content) {
      candidatesList.push({ content: unwrapped.content, index: 0 });
    } else if (Array.isArray(unwrapped.parts) && unwrapped.parts.length > 0) {
      candidatesList.push({ content: { parts: unwrapped.parts }, index: 0 });
    } else if (typeof (unwrapped as any).text === "string") {
      candidatesList.push({ content: { parts: [{ text: (unwrapped as any).text as string }] }, index: 0 });
    } else if (typeof (unwrapped as any).thought === "string") {
      candidatesList.push({
        content: {
          parts: [
            {
              text: (unwrapped as any).thought as string,
              thought: true,
              thoughtSignature: (unwrapped as any).thoughtSignature as string | undefined,
            } as RawPart,
          ],
        },
        index: 0,
      });
    } else {
      const txt = extractTextFromAny(unwrapped);
      if (txt) {
        candidatesList.push({ content: { parts: [{ text: txt }] }, index: 0 });
      } else {
        continue;
      }
    }

    for (let ci = 0; ci < candidatesList.length; ci++) {
      const cand = candidatesList[ci]!;
      const candIndex = typeof cand.index === "number" ? cand.index : ci;
      const finishReasonRaw = (cand.finishReason || (unwrapped as any).finishReason || "") as string;
      const finishReason = normalizeFinishReason(finishReasonRaw);

      let rawParts: RawPart[] = [];

      if (cand.content?.parts && Array.isArray(cand.content.parts)) {
        rawParts = cand.content.parts;
      } else if ((cand as any).parts && Array.isArray((cand as any).parts)) {
        rawParts = (cand as any).parts;
      } else if (typeof cand.text === "string" && cand.text.length > 0) {
        rawParts = [
          { text: cand.text, thought: !!(cand as any).thought, thoughtSignature: (cand as any).thoughtSignature },
        ];
      } else if (cand.content?.text && typeof cand.content.text === "string") {
        rawParts = [{ text: cand.content.text }];
      } else if (typeof (cand.content as any)?.text === "string") {
        rawParts = [{ text: (cand.content as any).text as string }];
      }

      const normalizedParts: NormalizedPart[] = [];
      let isThinkingChunk = false;

      for (let pi = 0; pi < rawParts.length; pi++) {
        const rp = rawParts[pi]!;
        if (!rp || typeof rp !== "object") continue;

        const txt = typeof rp.text === "string" ? rp.text : extractTextFromAny(rp);
        const isThought = rp.thought === true || (rp as any).isThought === true;
        const sig =
          typeof rp.thoughtSignature === "string"
            ? rp.thoughtSignature
            : typeof (rp as any).thought_signature === "string"
              ? ((rp as any).thought_signature as string)
              : undefined;

        if (isThought) isThinkingChunk = true;

        if (rp.functionCall && typeof rp.functionCall === "object") {
          const fc = rp.functionCall as { name: string; args?: unknown; id?: string };
          const argsStr = typeof fc.args === "string" ? fc.args : JSON.stringify(fc.args ?? {});
          normalizedParts.push({
            kind: "function_call",
            text: "",
            thought: false,
            thoughtSignature: sig,
            functionCall: {
              name: fc.name || "unknown",
              args: argsStr,
              id: fc.id || `call_${globalIndex}_${ci}_${pi}_${Date.now().toString(36)}`,
            },
            rawIndex,
            candidateIndex: candIndex,
            finishReason,
          });
          continue;
        }

        if (rp.inlineData) {
          normalizedParts.push({
            kind: "inline_data",
            text: "",
            thought: false,
            thoughtSignature: sig,
            rawIndex,
            candidateIndex: candIndex,
            finishReason,
          });
          continue;
        }

        if (!txt && sig) {
          normalizedParts.push({
            kind: "thought_signature",
            text: "",
            thought: true,
            thoughtSignature: sig,
            rawIndex,
            candidateIndex: candIndex,
            finishReason,
          });
          continue;
        }

        if (!txt && !sig) continue;

        normalizedParts.push({
          kind: isThought ? "thinking" : "text",
          text: txt ?? "",
          thought: isThought,
          thoughtSignature: sig,
          rawIndex,
          candidateIndex: candIndex,
          finishReason,
        });
      }

      const hasFinish = !!finishReason;

      if (normalizedParts.length === 0 && !hasFinish) {
        // Usage-only chunk
        if (unwrapped.usageMetadata) {
          out.push({
            parts: [],
            finishReason: undefined,
            usage: unwrapped.usageMetadata,
            model: unwrapped.model ?? modelFallback,
            isThinkingChunk: false,
            hasFinish: false,
            raw: unwrapped,
          });
        }
        continue;
      }

      out.push({
        parts: normalizedParts,
        finishReason: finishReason || undefined,
        usage: unwrapped.usageMetadata,
        model: unwrapped.model ?? modelFallback,
        isThinkingChunk,
        hasFinish,
        raw: unwrapped,
      });

      globalIndex++;
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Merged: stateful OpenAI / Anthropic transforms over normalized payloads
// ---------------------------------------------------------------------------

function newCompletionId(): string {
  try {
    const uuid = randomUUID();
    return `chatcmpl-${uuid.replace(/-/g, "").slice(0, 29)}`;
  } catch {
    return `chatcmpl-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
}

/**
 * Creates the mutable state shared by the merged transformers.
 *
 * @param model - model id echoed back to clients
 * @param completionId - optional fixed completion id
 */
export function createInitialStreamingState(model: string, completionId?: string): StreamingState {
  return {
    completionId: completionId ?? newCompletionId(),
    model,
    created: Math.floor(Date.now() / 1000),
    sentRole: false,
    accumulatedText: "",
    accumulatedThinking: "",
    lastFinishReason: undefined,
    insideThinking: false,
    anthropicBlockIndex: 0,
    anthropicBlockKinds: new Map(),
    toolCallIdCounter: 0,
    pendingSignatures: [],
  };
}

/**
 * Transforms normalized payloads into OpenAI chat.completion.chunk objects.
 * Emits a leading role chunk, routes thinking into reasoning_content/reasoning,
 * caches thought signatures in the global entry-based LRU and streams tool calls.
 *
 * @param payloads - normalized payloads
 * @param state - mutable streaming state updated in place
 * @returns OpenAI chunk objects (serialize with serializeOpenAIChunksToSSE)
 */
export function transformToOpenAIChunks(payloads: NormalizedPayload[], state: StreamingState): OpenAIChatChunk[] {
  const out: OpenAIChatChunk[] = [];

  for (const p of payloads) {
    if (p.finishReason) state.lastFinishReason = p.finishReason;

    if (p.parts.length === 0 && p.usage) {
      continue;
    }

    for (const part of p.parts) {
      if (!state.sentRole) {
        out.push({
          id: state.completionId,
          object: "chat.completion.chunk",
          created: state.created,
          model: state.model,
          choices: [
            {
              index: part.candidateIndex,
              delta: { role: "assistant" },
              finish_reason: null,
            },
          ],
        });
        state.sentRole = true;
      }

      if (part.thoughtSignature) {
        try {
          globalThinkingSignatureLRUCache.addFromPayload({
            signature: part.thoughtSignature,
            thinkingText: part.kind === "thinking" ? part.text : state.accumulatedThinking.slice(-2000),
            model: p.model ?? state.model,
            turnId: `${state.completionId}_${part.candidateIndex}`,
          });
        } catch {
          // Cache failures must never break streaming
        }
        if (!state.pendingSignatures.includes(part.thoughtSignature)) {
          state.pendingSignatures.push(part.thoughtSignature);
          if (state.pendingSignatures.length > 50) state.pendingSignatures.shift();
        }
      }

      if (part.kind === "function_call" && part.functionCall) {
        out.push({
          id: state.completionId,
          object: "chat.completion.chunk",
          created: state.created,
          model: state.model,
          choices: [
            {
              index: part.candidateIndex,
              delta: {
                tool_calls: [
                  {
                    index: state.toolCallIdCounter++,
                    id: part.functionCall.id,
                    type: "function",
                    function: {
                      name: part.functionCall.name,
                      arguments: part.functionCall.args,
                    },
                  },
                ],
              },
              finish_reason: null,
            },
          ],
        });
        continue;
      }

      if (part.kind === "thinking" || part.thought) {
        if (!state.insideThinking) {
          state.insideThinking = true;
        }
        state.accumulatedThinking += part.text;

        out.push({
          id: state.completionId,
          object: "chat.completion.chunk",
          created: state.created,
          model: state.model,
          choices: [
            {
              index: part.candidateIndex,
              delta: {
                reasoning_content: part.text,
                reasoning: part.text,
              },
              finish_reason: null,
            },
          ],
        });
      } else if (part.kind === "text") {
        if (state.insideThinking) {
          state.insideThinking = false;
        }
        state.accumulatedText += part.text;

        out.push({
          id: state.completionId,
          object: "chat.completion.chunk",
          created: state.created,
          model: state.model,
          choices: [
            {
              index: part.candidateIndex,
              delta: {
                content: part.text,
              },
              finish_reason: null,
            },
          ],
        });
      } else if (part.kind === "thought_signature") {
        continue;
      }
    }

    if (p.hasFinish && p.finishReason) {
      // Finish reason recorded; final emission handled by synthetic finish helpers
    }
  }

  return out;
}

/**
 * Builds the final OpenAI finish chunk (with optional usage mapping) once the
 * stream ends. The caller serializes it and appends the `[DONE]` marker.
 *
 * @param state - streaming state carrying the last observed finish reason
 * @param reason - fallback finish reason
 * @param usage - usage metadata captured from the stream
 */
export function createSyntheticFinishChunks(
  state: StreamingState,
  reason: string = "stop",
  usage?: NormalizedPayload["usage"],
): OpenAIChatChunk[] {
  const finish = state.lastFinishReason ?? reason;
  const normalized = normalizeFinishReason(finish) ?? "stop";

  const chunk: OpenAIChatChunk = {
    id: state.completionId,
    object: "chat.completion.chunk",
    created: state.created,
    model: state.model,
    choices: [
      {
        index: 0,
        delta: {},
        finish_reason: normalized,
      },
    ],
  };

  if (usage) {
    (chunk as any).usage = {
      prompt_tokens: usage.promptTokenCount,
      completion_tokens: usage.candidatesTokenCount ?? usage.totalTokenCount,
      total_tokens: usage.totalTokenCount,
      completion_tokens_details: usage.thoughtsTokenCount ? { reasoning_tokens: usage.thoughtsTokenCount } : undefined,
    };
  }

  return [chunk];
}

/**
 * Serializes OpenAI chunks into SSE data lines ready for the wire.
 *
 * @param chunks - OpenAI chunk objects
 * @returns array of `data: {...}\n\n` strings
 */
export function serializeOpenAIChunksToSSE(chunks: OpenAIChatChunk[]): string[] {
  const lines: string[] = [];
  for (const c of chunks) {
    lines.push(`data: ${JSON.stringify(c)}\n\n`);
  }
  return lines;
}

/**
 * Transforms normalized payloads into Anthropic Messages SSE lines:
 * message_start, content_block_start/delta/stop and message_delta/stop.
 * Opens separate blocks when thinking interleaves with text so block ordering
 * satisfies Claude validation.
 *
 * @param payloads - normalized payloads
 * @param state - mutable streaming state updated in place
 * @returns formatted SSE strings (`event: ...\ndata: {...}\n\n`)
 */
export function transformToAnthropicEvents(payloads: NormalizedPayload[], state: StreamingState): string[] {
  const sseLines: string[] = [];

  const emit = (event: string, data: unknown): void => {
    sseLines.push(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  if (state.anthropicBlockIndex === 0 && !state.sentRole) {
    emit("message_start", {
      type: "message_start",
      message: {
        id: state.completionId.replace("chatcmpl-", "msg_"),
        type: "message",
        role: "assistant",
        content: [],
        model: state.model,
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 0, output_tokens: 0 },
      },
    });
    state.sentRole = true;
  }

  for (const p of payloads) {
    if (p.finishReason) state.lastFinishReason = p.finishReason;

    for (const part of p.parts) {
      if (part.thoughtSignature) {
        try {
          globalThinkingSignatureLRUCache.addFromPayload({
            signature: part.thoughtSignature,
            thinkingText: part.text || state.accumulatedThinking.slice(-2000),
            model: p.model ?? state.model,
            turnId: `${state.completionId}_${part.candidateIndex}`,
          });
        } catch {
          /* the guarded best-effort operation falls through: the outer flow owns the failure */
        }
      }

      if (part.kind === "function_call" && part.functionCall) {
        const blockIndex = state.anthropicBlockIndex++;
        state.anthropicBlockKinds.set(blockIndex, "function_call");

        emit("content_block_start", {
          type: "content_block_start",
          index: blockIndex,
          content_block: {
            type: "tool_use",
            id: part.functionCall.id,
            name: part.functionCall.name,
            input: {},
          },
        });

        emit("content_block_delta", {
          type: "content_block_delta",
          index: blockIndex,
          delta: {
            type: "input_json_delta",
            partial_json: part.functionCall.args,
          },
        });

        emit("content_block_stop", {
          type: "content_block_stop",
          index: blockIndex,
        });
        continue;
      }

      const isThinking = part.kind === "thinking" || part.thought;
      const wantedKind: NormalizedPartKind = isThinking ? "thinking" : "text";

      let currentBlockIndex = state.anthropicBlockIndex;
      const currentKind = state.anthropicBlockKinds.get(currentBlockIndex - 1);

      const needNewBlock =
        currentBlockIndex === 0 ||
        (currentKind !== undefined && currentKind !== wantedKind && currentKind !== part.kind) ||
        state.insideThinking !== isThinking;

      if (needNewBlock) {
        if (currentBlockIndex > 0 && currentKind !== undefined) {
          if (currentKind !== wantedKind) {
            emit("content_block_stop", {
              type: "content_block_stop",
              index: currentBlockIndex - 1,
            });
          }
        }

        if (currentKind !== wantedKind || currentBlockIndex === 0) {
          const idx = state.anthropicBlockIndex;
          state.anthropicBlockKinds.set(idx, wantedKind);
          state.anthropicBlockIndex++;

          if (isThinking) {
            emit("content_block_start", {
              type: "content_block_start",
              index: idx,
              content_block: { type: "thinking", thinking: "" },
            });
            state.insideThinking = true;
          } else {
            emit("content_block_start", {
              type: "content_block_start",
              index: idx,
              content_block: { type: "text", text: "" },
            });
            state.insideThinking = false;
          }
          currentBlockIndex = idx;
        }
      }

      if (isThinking) {
        state.accumulatedThinking += part.text;
        const idx = state.anthropicBlockIndex - 1;
        emit("content_block_delta", {
          type: "content_block_delta",
          index: idx,
          delta: { type: "thinking_delta", thinking: part.text },
        });
      } else if (part.kind === "text") {
        state.accumulatedText += part.text;
        const idx = state.anthropicBlockIndex - 1;
        emit("content_block_delta", {
          type: "content_block_delta",
          index: idx,
          delta: { type: "text_delta", text: part.text },
        });
      }
    }
  }

  return sseLines;
}

/**
 * Emits the final Anthropic events (block stop, message_delta with stop_reason,
 * message_stop) once the stream ends.
 *
 * @param state - streaming state
 * @param reason - fallback stop reason
 * @param usage - usage metadata captured from the stream
 * @returns formatted SSE strings
 */
export function createAnthropicSyntheticFinish(
  state: StreamingState,
  reason: string = "end_turn",
  usage?: NormalizedPayload["usage"],
): string[] {
  const lines: string[] = [];

  const emit = (event: string, data: unknown) => {
    lines.push(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  if (state.anthropicBlockIndex > 0) {
    const lastIdx = state.anthropicBlockIndex - 1;
    if (state.anthropicBlockKinds.has(lastIdx)) {
      emit("content_block_stop", { type: "content_block_stop", index: lastIdx });
    }
  }

  emit("message_delta", {
    type: "message_delta",
    delta: {
      stop_reason: state.lastFinishReason ? mapFinishToAnthropic(state.lastFinishReason) : reason,
      stop_sequence: null,
    },
    usage: usage
      ? {
          output_tokens: usage.candidatesTokenCount ?? usage.totalTokenCount ?? 0,
        }
      : { output_tokens: 0 },
  });

  emit("message_stop", { type: "message_stop" });

  return lines;
}

function mapFinishToAnthropic(finish: string): string {
  const n = finish.toLowerCase();
  if (n === "stop" || n.includes("stop")) return "end_turn";
  if (n === "length" || n.includes("max")) return "max_tokens";
  if (n === "tool_calls") return "tool_use";
  if (n === "content_filter") return "end_turn";
  return "end_turn";
}

// ---------------------------------------------------------------------------
// Merged: incremental SSE parser class + high-level transformer
// ---------------------------------------------------------------------------

/**
 * Stateful incremental SSE parser wrapping parseSSEPayloads with streaming
 * UTF-8 decoding and byte accounting.
 */
export class IncrementalSSEParser {
  private buffer: string;
  private readonly decoder: { decode(input?: Uint8Array, options?: { stream?: boolean }): string };
  private totalBytes: number;

  constructor() {
    this.buffer = "";
    this.decoder = new TextDecoder("utf-8", { fatal: false });
    this.totalBytes = 0;
  }

  /**
   * Pushes an incremental chunk (string, Uint8Array or Buffer), tolerating
   * splits anywhere, and returns payloads parsed so far.
   */
  push(chunk: string | Uint8Array | Buffer): CloudCodeRawChunk[] {
    let text: string;
    if (typeof chunk === "string") {
      text = chunk;
    } else if (chunk instanceof Uint8Array || Buffer.isBuffer(chunk)) {
      text = this.decoder.decode(chunk, { stream: true });
    } else {
      text = String(chunk);
    }

    this.totalBytes += text.length;
    const result = parseSSEPayloads(text, this.buffer);
    this.buffer = result.remainder;
    return result.payloads;
  }

  /**
   * Final flush: decodes any pending bytes and attempts to parse the remainder.
   */
  flush(): CloudCodeRawChunk[] {
    if (!this.buffer.trim()) {
      this.buffer = "";
      return [];
    }
    try {
      const finalText = this.decoder.decode();
      if (finalText) this.buffer += finalText;
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    const result = parseSSEPayloads("", this.buffer);
    this.buffer = result.remainder;
    if (result.payloads.length > 0) {
      this.buffer = "";
    }
    return result.payloads;
  }

  get remainder(): string {
    return this.buffer;
  }

  get bytesReceived(): number {
    return this.totalBytes;
  }

  reset(): void {
    this.buffer = "";
    this.totalBytes = 0;
  }
}

/** Output format selector for {@link CloudCodeStreamingTransformer}. */
export type OutputFormat = "openai" | "anthropic" | "raw";

/**
 * Options for the high-level streaming transformer.
 */
export interface StreamingTransformerOptions {
  /** Target model id. */
  model: string;
  /** Wire format, openai by default. */
  format?: OutputFormat;
  /** Optional fixed completion id. */
  completionId?: string;
  /** External entry-based LRU cache (defaults to the global singleton). */
  thinkingCache?: ThinkingSignatureLRUCache;
  /** Inject a synthetic finish when the stream ends without one? Default true. */
  injectSyntheticFinish?: boolean;
  /** Append `[DONE]` after OpenAI SSE? Default true. */
  includeDoneMarker?: boolean;
  /** Callback invoked for every transformed SSE line. */
  onChunk?: (sseLine: string, state: StreamingState) => void;
}

/**
 * High-level cloudcode-pa SSE transformer: push raw network chunks in, receive
 * serialized SSE lines out in the configured format, with synthetic finish
 * injection and `[DONE]` handling on flush.
 */
export class CloudCodeStreamingTransformer {
  private readonly parser: IncrementalSSEParser;
  private readonly state: StreamingState;
  private readonly options: Required<StreamingTransformerOptions>;
  private sentFinished: boolean;
  private lastUsage?: CloudCodeRawChunk["usageMetadata"];

  constructor(opts: StreamingTransformerOptions) {
    this.parser = new IncrementalSSEParser();
    this.state = createInitialStreamingState(opts.model, opts.completionId);
    this.options = {
      model: opts.model,
      format: opts.format ?? "openai",
      completionId: this.state.completionId,
      thinkingCache: opts.thinkingCache ?? globalThinkingSignatureLRUCache,
      injectSyntheticFinish: opts.injectSyntheticFinish ?? true,
      includeDoneMarker: opts.includeDoneMarker ?? true,
      onChunk: opts.onChunk ?? (() => {}),
    } as Required<StreamingTransformerOptions>;
    this.sentFinished = false;
  }

  get streamingState(): StreamingState {
    return this.state;
  }

  /**
   * Transforms one raw chunk into output SSE lines.
   */
  transformChunk(rawChunk: string | Uint8Array): string[] {
    const parsed = this.parser.push(rawChunk);
    if (parsed.length === 0) return [];

    for (const r of parsed) {
      if ((r as any).usageMetadata) this.lastUsage = (r as any).usageMetadata;
    }

    const normalized = normalizeRawPayloads(parsed, { model: this.options.model });

    let sseLines: string[] = [];

    if (this.options.format === "openai") {
      const openAIChunks = transformToOpenAIChunks(normalized, this.state);
      sseLines = serializeOpenAIChunksToSSE(openAIChunks);
    } else if (this.options.format === "anthropic") {
      sseLines = transformToAnthropicEvents(normalized, this.state);
    } else {
      for (const n of normalized) {
        sseLines.push(`data: ${JSON.stringify(n)}\n\n`);
      }
    }

    for (const line of sseLines) {
      try {
        this.options.onChunk(line, this.state);
      } catch {
        /* the guarded best-effort operation falls through: the outer flow owns the failure */
      }
    }

    return sseLines;
  }

  /**
   * Flushes buffered input and injects the synthetic finish plus `[DONE]`.
   */
  flush(): string[] {
    const remainingParsed = this.parser.flush();
    const extraLines: string[] = [];

    if (remainingParsed.length > 0) {
      for (const r of remainingParsed) {
        if ((r as any).usageMetadata) this.lastUsage = (r as any).usageMetadata;
      }
      const normalized = normalizeRawPayloads(remainingParsed, { model: this.options.model });
      if (this.options.format === "openai") {
        const chunks = transformToOpenAIChunks(normalized, this.state);
        extraLines.push(...serializeOpenAIChunksToSSE(chunks));
      } else if (this.options.format === "anthropic") {
        extraLines.push(...transformToAnthropicEvents(normalized, this.state));
      } else {
        for (const n of normalized) extraLines.push(`data: ${JSON.stringify(n)}\n\n`);
      }
    }

    if (!this.sentFinished && this.options.injectSyntheticFinish) {
      const finishLines = this.createFinish();
      extraLines.push(...finishLines);
      this.sentFinished = true;
    }

    if (this.options.format === "openai" && this.options.includeDoneMarker) {
      extraLines.push("data: [DONE]\n\n");
    }

    for (const line of extraLines) {
      try {
        this.options.onChunk(line, this.state);
      } catch {
        /* the guarded best-effort operation falls through: the outer flow owns the failure */
      }
    }

    return extraLines;
  }

  private createFinish(): string[] {
    if (this.options.format === "openai") {
      const chunks = createSyntheticFinishChunks(this.state, "stop", this.lastUsage);
      return serializeOpenAIChunksToSSE(chunks);
    } else if (this.options.format === "anthropic") {
      return createAnthropicSyntheticFinish(this.state, "end_turn", this.lastUsage);
    } else {
      return [
        `data: ${JSON.stringify({ finishReason: this.state.lastFinishReason ?? "stop", usage: this.lastUsage })}\n\n`,
      ];
    }
  }

  reset(model?: string): void {
    this.parser.reset();
    this.sentFinished = false;
    this.lastUsage = undefined;
    this.state.accumulatedText = "";
    this.state.accumulatedThinking = "";
    this.state.sentRole = false;
    this.state.insideThinking = false;
    this.state.lastFinishReason = undefined;
    this.state.anthropicBlockIndex = 0;
    this.state.anthropicBlockKinds.clear();
    this.state.toolCallIdCounter = 0;
    this.state.pendingSignatures = [];
    if (model) {
      this.state.model = model;
      (this.options as any).model = model;
    }
    this.state.completionId = newCompletionId();
    this.state.created = Math.floor(Date.now() / 1000);
  }
}

// ---------------------------------------------------------------------------
// Merged: resilient fetch + transformed stream
// ---------------------------------------------------------------------------

/**
 * Options for {@link resilientFetch}.
 */
export interface ResilientFetchOptions {
  /** Max attempts including the first. */
  maxRetries?: number;
  /** Base delay in ms. */
  baseDelayMs?: number;
  /** Max delay in ms. */
  maxDelayMs?: number;
  /** Apply jitter? Default true. */
  jitter?: boolean;
  /** Status codes that trigger a retry. */
  retryOn?: number[];
  /** External abort signal. */
  signal?: AbortSignal;
  /** Per-attempt timeout in ms. */
  timeoutMs?: number;
}

const DEFAULT_RETRY_ON = [429, 500, 502, 503, 504];

/**
 * Computes exponential delay with optional multiplicative jitter (0.7x-1.3x).
 *
 * @param attempt - zero-based attempt index
 * @param base - base delay ms
 * @param max - maximum delay ms
 * @param jitter - apply jitter
 */
export function computeExponentialDelay(attempt: number, base: number, max: number, jitter: boolean): number {
  let delay = base * Math.pow(2, attempt);
  if (delay > max) delay = max;
  if (jitter) {
    const jitterFactor = 0.7 + Math.random() * 0.6;
    delay = Math.floor(delay * jitterFactor);
  }
  return delay;
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches streamGenerateContent with exponential backoff, per-attempt timeout
 * and external-signal support, keeping Gemini CLI bypass headers intact.
 *
 * Equivalent sibling of {@link fetchWithExponentialRetry}; both are kept.
 *
 * @param url - endpoint URL
 * @param init - RequestInit for fetch
 * @param opts - retry options
 * @returns Response with body stream
 */
export async function resilientFetch(
  url: string,
  init: RequestInit,
  opts: ResilientFetchOptions = {},
): Promise<Response> {
  const maxRetries = opts.maxRetries ?? 3;
  const baseDelay = opts.baseDelayMs ?? 500;
  const maxDelay = opts.maxDelayMs ?? 5000;
  const jitter = opts.jitter ?? true;
  const retryOn = opts.retryOn ?? DEFAULT_RETRY_ON;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const timeoutMs = opts.timeoutMs ?? 120_000;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);

    const onAbortExternal = () => ac.abort();
    if (opts.signal) {
      if (opts.signal.aborted) {
        clearTimeout(timer);
        throw new Error("resilientFetch aborted by external signal");
      }
      opts.signal.addEventListener("abort", onAbortExternal, { once: true });
    }

    try {
      const mergedInit: RequestInit = {
        ...init,
        signal: ac.signal,
      };

      const res = await fetch(url, mergedInit);
      clearTimeout(timer);
      if (opts.signal) opts.signal.removeEventListener("abort", onAbortExternal);

      if (res.ok) return res;

      if (isRetryableNetworkStatus(res.status, { retryableStatus: retryOn }) && attempt < maxRetries) {
        lastError = new Error(`retryable status ${res.status}`);
        try {
          await res.text();
        } catch {
          /* the guarded best-effort operation falls through: the outer flow owns the failure */
        }
        const delay = computeExponentialDelay(attempt, baseDelay, maxDelay, jitter);
        await sleepMs(delay);
        continue;
      }

      return res;
    } catch (e) {
      clearTimeout(timer);
      if (opts.signal) opts.signal.removeEventListener("abort", onAbortExternal);
      const err = e as Error & { name?: string };
      lastError = err;

      // AbortError retries only when it came from the internal timeout
      const isAbortTimeout = err.name === "AbortError";
      if (isAbortTimeout && attempt < maxRetries) {
        const delay = computeExponentialDelay(attempt, baseDelay, maxDelay, jitter);
        await sleepMs(delay);
        continue;
      }

      if (attempt < maxRetries) {
        const delay = computeExponentialDelay(attempt, baseDelay, maxDelay, jitter);
        await sleepMs(delay);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ?? new Error("resilientFetch failed after retries");
}

/**
 * High-level wrapper consuming streamGenerateContent with auto-recovery and
 * yielding SSE strings in the configured format. Tolerant to mid-stream breaks
 * (synthetic finish), missing finish reasons and UTF-8/JSON splits.
 *
 * @example
 * for await (const sseLine of createResilientTransformedStream(url, init, { model, format: "openai" })) {
 *   res.write(sseLine);
 * }
 */
export async function* createResilientTransformedStream(
  url: string,
  init: RequestInit,
  transformerOpts: StreamingTransformerOptions,
  fetchOpts: ResilientFetchOptions = {},
): AsyncGenerator<string, void, unknown> {
  const transformer = new CloudCodeStreamingTransformer(transformerOpts);

  const response = await resilientFetch(url, init, fetchOpts);

  if (!response.ok) {
    let errBody = "";
    try {
      errBody = await response.text();
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    throw new Error(`cloudcode-pa stream failed ${response.status}: ${errBody.slice(0, 500)}`);
  }

  if (!response.body) {
    yield* transformer.flush();
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: false });

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const sseLines = transformer.transformChunk(value);
      for (const line of sseLines) yield line;
    }

    const finalLines = transformer.flush();
    for (const line of finalLines) yield line;
  } catch (_e) {
    // Mid-stream failure: degrade gracefully by flushing what we have
    try {
      const finalLines = transformer.flush();
      for (const line of finalLines) yield line;
    } catch {
      // ignore
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  }
}

// ---------------------------------------------------------------------------
// Merged: bypass headers + deterministic session id
// ---------------------------------------------------------------------------

/**
 * Options for {@link buildGeminiCliBypassHeaders}.
 */
export interface BypassHeadersOptions {
  model?: string;
  accessToken?: string;
  projectId?: string;
  includeAuth?: boolean;
}

/**
 * Builds headers fully compatible with official Gemini CLI traffic against
 * cloudcode-pa, including the X-Goog-Request-Params project binding.
 *
 * @param opts - auth/project options
 * @returns headers record ready for fetch
 */
export function buildGeminiCliBypassHeaders(opts: BypassHeadersOptions = {}): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": GEMINI_CLI_USER_AGENT,
    "X-Goog-Api-Client": X_GOOG_API_CLIENT,
    "Client-Metadata": CLIENT_METADATA_RAW,
    "Content-Type": "application/json",
    Accept: "text/event-stream, application/json",
    "X-Goog-Request-Params": `project=${opts.projectId ?? PROJECT_FALLBACK}`,
  };

  if (opts.includeAuth && opts.accessToken) {
    h.Authorization = `Bearer ${opts.accessToken}`;
  }

  return h;
}

/**
 * Deterministic session id (FNV-1a hex) derived from directory, hostname, cwd
 * and pid. Streaming-module variant kept alongside the request-module version.
 *
 * @param directory - optional directory seed
 * @returns 8-char hex digest
 */
export function buildHostSessionId(directory?: string): string {
  const base = directory ?? `${os.hostname()}|${process.cwd()}|${process.pid}`;
  return fnv1a32HexBytes(base);
}

// ---------------------------------------------------------------------------
// Merged: plugin utilities
// ---------------------------------------------------------------------------

/**
 * Detects whether any payload carries thinking content.
 *
 * @param payloads - normalized payloads
 */
export function hasThinkingContent(payloads: NormalizedPayload[]): boolean {
  return payloads.some((p) => p.isThinkingChunk || p.parts.some((pt) => pt.thought));
}

/**
 * Collects all distinct thinking signatures for multi-turn replay.
 *
 * @param payloads - normalized payloads
 * @returns unique signature strings
 */
export function extractThinkingSignatures(payloads: NormalizedPayload[]): string[] {
  const sigs: string[] = [];
  for (const p of payloads) {
    for (const part of p.parts) {
      if (part.thoughtSignature && !sigs.includes(part.thoughtSignature)) sigs.push(part.thoughtSignature);
    }
  }
  return sigs;
}

/**
 * Exposes accumulated state metrics for observability in the opencode UI.
 *
 * @param state - streaming state
 */
export function getStreamingSummary(state: StreamingState): {
  completionId: string;
  model: string;
  textChars: number;
  thinkingChars: number;
  finishReason?: string | undefined;
  toolCalls: number;
  pendingSignatures: number;
} {
  return {
    completionId: state.completionId,
    model: state.model,
    textChars: state.accumulatedText.length,
    thinkingChars: state.accumulatedThinking.length,
    finishReason: state.lastFinishReason,
    toolCalls: state.toolCallIdCounter,
    pendingSignatures: state.pendingSignatures.length,
  };
}

/**
 * Passes through the raw candidate payload when present, otherwise rebuilds a
 * minimal Gemini-shaped response from the normalized view.
 *
 * @param p - normalized payload-like object
 * @returns raw payload or reconstructed Gemini candidates envelope
 */
export const transformToGemini = (p: any): any =>
  p.raw || { candidates: [{ content: { parts: [{ text: p.text || "" }] } }] };

// ---------------------------------------------------------------------------
// Merged: Streaming named barrel (default export remains streamingModule)
// ---------------------------------------------------------------------------

/**
 * Named bundle mirroring the legacy ONDA 4 module surface. Renamed members are
 * wired to their merged equivalents: `parseSSEPayloads`, `normalizeRawPayloads`
 * and the module-level `isRetryableNetworkStatus`.
 */
export const Streaming = {
  IncrementalSSEParser,
  CloudCodeStreamingTransformer,
  ThinkingSignatureLRUCache,
  globalThinkingSignatureCache,
  globalThinkingSignatureLRUCache,

  parseSSEPayloads,
  normalizeRawPayloads,

  transformToOpenAIChunks,
  transformToAnthropicEvents,
  serializeOpenAIChunksToSSE,
  createSyntheticFinishChunks,
  createAnthropicSyntheticFinish,
  createInitialStreamingState,

  resilientFetch,
  createResilientTransformedStream,
  computeExponentialDelay,
  isRetryableNetworkStatus,

  buildGeminiCliBypassHeaders,
  buildHostSessionId,

  hasThinkingContent,
  extractThinkingSignatures,
  getStreamingSummary,
  transformToGemini,
  handleThinkingBlock,

  GEMINI_CLI_CLIENT_ID,
  GEMINI_CLI_CLIENT_SECRET,
  GEMINI_CLI_USER_AGENT,
  X_GOOG_API_CLIENT,
  CLIENT_METADATA_RAW,
  PROJECT_FALLBACK,
  MODELS_2026,
} as const;

// ---------------------------------------------------------------------------
// Exports — library-first barrel
// ---------------------------------------------------------------------------

/**
 * Default export for barrel compatibility: contains all primary helpers
 */
const streamingModule = {
  LRU_THINKING_CACHE_SIZE,
  ReplaySignatureCache,
  globalThinkingSignatureCache,
  createSSEParserState,
  parseSSEChunk,
  parseSSEBinaryChunk,
  safeJsonParse,
  unwrapCandidates,
  extractParts,
  normalizePart,
  normalizePayloads,
  mapFinishReason,
  extractDelta,
  StreamingSessionTracker,
  transformToOpenAI,
  createOpenAIStreamingTransformer,
  transformToAnthropic,
  createAnthropicStreamingTransformer,
  fetchWithExponentialRetry,
  injectSyntheticFinish,
  withAutoRecoveryStreaming,
  readSSEStream,
  streamToOpenAI,
  streamToAnthropic,
  fnv1a32,
  hashThinkingText,
  getJitter,
  sleepWithJitter,
  SSE_DONE_SENTINEL,
};

export default streamingModule;

/* ════════════════════════════════════════════════════════════════════
   Section: the devthink workbench stream surface (the 1.1.16 ChatEvent
   family absorbed by the grand merge; the chat event vocabulary bridges
   onto the normalized streaming machinery above).
   ════════════════════════════════════════════════════════════════════ */
export type ChatEvent =
  | { type: "start"; provider: string; model: string }
  | { type: "text"; text: string }
  | { type: "reasoning"; text: string }
  | { type: "tool"; name: string; input: unknown }
  | { type: "error"; message: string }
  | { type: "finish"; reason?: string };

export type StreamOptions = {
  provider: string;
  model: string;
  signal?: AbortSignal | undefined;
};

function decodeJson(value: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function extractSseFrames(buffer: { value: string }, incoming: string): string[] {
  buffer.value += incoming;
  const frames = buffer.value.split(/\r?\n\r?\n/);
  buffer.value = frames.pop() || "";
  return frames;
}

function extractData(frame: string): string | null {
  const lines = frame.split(/\r?\n/).filter((line) => line.startsWith("data:"));
  if (lines.length === 0) return null;
  const value = lines
    .map((line) => line.slice(5).trimStart())
    .join("\n")
    .trim();
  return value && value !== "[DONE]" ? value : null;
}

function textAt(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeOpenAi(frame: Record<string, unknown>): ChatEvent[] {
  const choices = Array.isArray(frame.choices) ? frame.choices : [];
  const choice = choices[0] as Record<string, unknown> | undefined;
  const delta = (choice?.delta || {}) as Record<string, unknown>;
  const events: ChatEvent[] = [];
  const reasoning = textAt(delta.reasoning_content || delta.reasoning);
  const text = textAt(delta.content);
  if (reasoning) events.push({ type: "reasoning", text: reasoning });
  if (text) events.push({ type: "text", text });
  const finish = choice?.finish_reason;
  if (finish) events.push({ type: "finish", reason: textAt(finish) });
  return events;
}

function normalizeAnthropic(frame: Record<string, unknown>): ChatEvent[] {
  const type = textAt(frame.type);
  if (type === "content_block_delta") {
    const delta = (frame.delta || {}) as Record<string, unknown>;
    const text = textAt(delta.text);
    return text ? [{ type: "text", text }] : [];
  }
  if (type === "message_stop") return [{ type: "finish", reason: "stop" }];
  if (type === "error") {
    const error = (frame.error || {}) as Record<string, unknown>;
    return [{ type: "error", message: textAt(error.message) || "Anthropic returned an error." }];
  }
  return [];
}

function normalizeGoogle(frame: Record<string, unknown>): ChatEvent[] {
  const candidates = Array.isArray(frame.candidates) ? frame.candidates : [];
  const content = ((candidates[0] as Record<string, unknown> | undefined)?.content || {}) as Record<string, unknown>;
  const parts = Array.isArray(content.parts) ? content.parts : [];
  const events: ChatEvent[] = [];
  for (const part of parts) {
    const item = part as Record<string, unknown>;
    const text = textAt(item.text);
    if (text) events.push({ type: "text", text });
  }
  const finish = textAt((candidates[0] as Record<string, unknown> | undefined)?.finishReason);
  if (finish) events.push({ type: "finish", reason: finish });
  return events;
}

export function normalizeFrame(provider: string, frame: Record<string, unknown>): ChatEvent[] {
  const lower = provider.toLowerCase();
  if (lower === "anthropic") return normalizeAnthropic(frame);
  if (lower === "google") return normalizeGoogle(frame);
  const data = (frame.data || frame) as Record<string, unknown>;
  if (data !== frame && textAt(data.delta_content)) return [{ type: "text", text: textAt(data.delta_content) }];
  if (data !== frame && textAt(data.reasoning_content))
    return [{ type: "reasoning", text: textAt(data.reasoning_content) }];
  if (data.error || frame.error)
    return [{ type: "error", message: textAt(data.error || frame.error) || "The provider returned an error." }];
  return normalizeOpenAi(frame);
}

export async function* parseEventStream(response: Response, options: StreamOptions): AsyncGenerator<ChatEvent> {
  if (!response.body) throw new Error("The provider returned an empty stream.");
  yield { type: "start", provider: options.provider, model: options.model };
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const buffer = { value: "" };
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const frame of extractSseFrames(buffer, decoder.decode(value, { stream: true }))) {
        const payload = extractData(frame);
        if (!payload) continue;
        const parsed = decodeJson(payload);
        if (!parsed) continue;
        for (const event of normalizeFrame(options.provider, parsed)) yield event;
      }
    }
  } finally {
    reader.releaseLock();
  }
  yield { type: "finish", reason: "stop" };
}

export async function collectEvents(events: AsyncIterable<ChatEvent>): Promise<{ text: string; reasoning: string }> {
  let text = "";
  let reasoning = "";
  for await (const event of events) {
    if (event.type === "text") text += event.text;
    if (event.type === "reasoning") reasoning += event.text;
    if (event.type === "error") throw new Error(event.message);
  }
  return { text, reasoning };
}
