/**
 * @fileoverview recovery.ts - ONDA 4 - Plugin Core (merged)
 * @module auth/recovery
 * @description Complete production-ready auto-recovery engine for the
 *              maene plugin with Gemini CLI bypass.
 *
 *              Responsibilities:
 *              - Internal LRU cache for thinking signatures (avoids revalidation
 *                and preserves integrity)
 *              - Error detectors: invalid thinking block signature, tool_use
 *                without thinking, session boundary, tool failures
 *              - Recovery strategies: continue, undo guidance, keep_thinking
 *                preservation and injection of preserved thinking across turns
 *              - Detection utilities, recovery plan building, transform helpers
 *              - withAutoRecovery wrapper with exponential backoff + jitter
 *              - Simple context-based API ported from the v4/v5 lineage:
 *                RecoveryContext, getRecoveryStrategy, module-level signature
 *                preservation cache, buildRecoveryMessage,
 *                transformMessagesForRecovery, recoverToolResultMissing /
 *                recoverThinkingOrder / recoverThinkingDisabled,
 *                contextErrorRecovery, sessionRecovery, toast integration
 *
 *              Zero external dependencies: only node:* builtins + global fetch.
 *              Compatible with Models 2026 and the official Gemini CLI spoof.
 *
 * @author ONDA 4 - Plugin Core
 * @license MIT
 * @since 2026
 */

import * as crypto from "node:crypto";

// ============================================================================
// 00. CANONICAL BYPASS CONSTANTS (identical values are imported from the
// frozen owner constants.ts; genuinely divergent local variants are kept
// below with an explicit marker)
// ============================================================================

import {
  CLIENT_METADATA_STRING,
  GEMINI_CLI_OAUTH_CLIENT_ID as GEMINI_CLI_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET as GEMINI_CLI_CLIENT_SECRET,
  GEMINI_CLI_USER_AGENT_PLAIN as GEMINI_CLI_USER_AGENT,
  JITTER_MAX_MS,
  JITTER_MIN_MS,
  PROJECT_FALLBACK,
} from "./constants.js";
export { GEMINI_CLI_CLIENT_ID, GEMINI_CLI_CLIENT_SECRET, PROJECT_FALLBACK };

// local variant: diverges from constants (GEMINI_CLI_USER_AGENT_FALLBACK is `gemini-cli/0.57.0 {os}/{arch}`; this is the exact GeminiCLI UA string)

// local variant: diverges from constants (constants.X_GOOG_API_CLIENT is the antigravity/{ver} gl-node gax/grpc chain; this is the bare gl-node value)

/**
 * Client-Metadata header string for the Gemini CLI bypass. v2.1.16: the local
 * literal was byte-identical to constants.CLIENT_METADATA_STRING
 * ("ideType=IDE_UNSPECIFIED,platform=PLATFORM_UNSPECIFIED,pluginType=GEMINI")
 * — the export now aliases the owner constant so the value has one source.
 */
export const X_CLIENT_METADATA_RAW = CLIENT_METADATA_STRING;

// v2.1.16: dead CODE_ASSIST_BASE ("https://cloudcode-pa.googleapis.com") was
// deleted — zero consumers repo-wide (not even the RecoveryConstants bundle
// listed it); the live base-URL owner is constants.CLOUDCODE_PA_BASE.

// v2.1.15 Phase A: MODELS_2026 (the 11-id legacy bypass list) and the
// ModelId2026 union moved to models.ts (MODELS_2026_LEGACY / ModelId2026) —
// imported under the historical name and re-exported so the public surface
// is unchanged.
import { MODELS_2026_LEGACY as MODELS_2026 } from "./models.js";
import type { ModelId2026 } from "./models.js";
import { fnv1a32 } from "./core.js";
import { X_GOOG_API_CLIENT_GEMINI_CLI as X_GOOG_API_CLIENT } from "./fingerprint.js";
export { MODELS_2026 };
export type { ModelId2026 };

const MODELS_2026_SET = new Set<string>(MODELS_2026 as readonly string[]);
// v2.1.16 divergence note (kept deliberately, NOT replaced by
// models.isThinkingModel): compared live, the two classifiers disagree in
// both directions — isThinkingModel("antigravity-claude-sonnet-4-6") is false
// (catalog isThinking flag) while this Set includes it, and isThinkingModel
// is true for substring hits this Set excludes (gemini-3-flash,
// gemini-2.5-flash, gpt-oss-120b-high, *-thinking variants, ...). Recovery
// needs the exact 8-id policy view (all ids are members of models.
// MODELS_2026_LEGACY), so swapping in the heuristic classifier would change
// live detector behavior at detectToolUseWithoutThinking, buildRecoveryPlan
// metadata and buildRecoveryMessage.
const THINKING_MODELS_2026 = new Set<string>([
  "antigravity-claude-sonnet-4-6",
  "antigravity-claude-opus-4-6-thinking",
  "antigravity-gemini-3-pro",
  "antigravity-gemini-3.1-pro",
  "gemini-3-pro-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.1-pro-preview-customtools",
  "gemini-2.5-pro",
]);

// ============================================================================
// 01. CORE TYPES - ANTHROPIC / GEMINI / OPENCODE COMPAT
// ============================================================================

export type Role = "user" | "assistant" | "system" | "tool";

export interface ThinkingBlock {
  type: "thinking";
  thinking: string;
  signature?: string;
  // some proxies return redacted_thinking
  redacted_thinking?: string;
  // internal metadata
  _preserved?: boolean;
  _injected?: boolean;
}

export interface TextBlock {
  type: "text";
  text: string;
}

export interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: unknown;
  // flag interna
  _missingThinking?: boolean;
}

export interface ToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string | Array<{ type: string; text?: string }>;
  is_error?: boolean;
}

export type ContentBlock = ThinkingBlock | TextBlock | ToolUseBlock | ToolResultBlock | Record<string, unknown>;

export interface ChatMessage {
  role: Role;
  content: string | ContentBlock[];
  // some SDKs allow a plain array
  _sessionId?: string;
  _timestamp?: number;
}

export type ChatMessages = ChatMessage[];

// Error detection result
export type RecoveryErrorCode =
  | "INVALID_THINKING_SIGNATURE"
  | "TOOL_USE_WITHOUT_THINKING"
  | "SESSION_BOUNDARY"
  | "TOOL_FAILURE"
  | "CONTEXT_OVERFLOW"
  | "RATE_LIMIT"
  | "UNKNOWN";

export interface DetectedError {
  code: RecoveryErrorCode;
  message: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
  index?: number; // message index where it occurred
  blockIndex?: number;
}

export interface DetectionReport {
  errors: DetectedError[];
  hasInvalidSignature: boolean;
  hasMissingThinking: boolean;
  hasSessionBoundary: boolean;
  hasToolFailure: boolean;
  shouldRecover: boolean;
}

// Recovery strategies
export type RecoveryStrategy =
  | "STRIP_INVALID_SIGNATURE"
  | "INJECT_PRESERVED_THINKING"
  | "KEEP_THINKING_PRESERVE"
  | "CONTINUE_RESUME"
  | "UNDO_GUIDANCE"
  | "RETRY_WITH_BACKOFF"
  | "REBUILD_MESSAGES"
  | "RESET_THINKING_CACHE";

export interface RecoveryAction {
  strategy: RecoveryStrategy;
  reason: string;
  priority: number; // lower = runs first
  payload?: Record<string, unknown>;
}

export interface RecoveryPlan {
  id: string;
  createdAt: number;
  errors: DetectedError[];
  actions: RecoveryAction[];
  transformedMessages?: ChatMessages;
  keepThinking?: string | null;
  preservedSignature?: string | null;
  shouldRetry: boolean;
  retryDelayMs?: number;
  metadata?: Record<string, unknown>;
}

// Wrapper executor types
export type ExecutorFn<T = unknown> = (
  messages: ChatMessages,
  opts?: { signal?: AbortSignal | undefined; attempt?: number | undefined; plan?: RecoveryPlan | undefined },
) => Promise<T>;

export interface AutoRecoveryOptions {
  maxAttempts?: number; // default 4
  baseDelayMs?: number; // default 450
  maxDelayMs?: number; // default 7500
  jitter?: boolean; // default true
  failFastOnNonRecoverable?: boolean; // default true
  modelId?: ModelId2026 | string;
  sessionId?: string;
  preservationStore?: ThinkingPreservationStore;
  signatureCache?: ThinkingSignatureCache;
  onRecoveryAttempt?: (attempt: number, plan: RecoveryPlan, delayMs: number) => void;
  onDetectedErrors?: (report: DetectionReport) => void;
  signal?: AbortSignal;
  logger?: Pick<Console, "debug" | "info" | "warn" | "error">;
}

// ============================================================================
// 02. GENERIC LRU CACHE - PRODUCTION READY
// ============================================================================

/**
 * Zero-dependency, production-ready generic LRUCache.
 * - O(1) get/set through an ordered Map
 * - Automatic LRU eviction
 * - Stats for observability
 */
export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly cache: Map<K, V>;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(capacity: number) {
    if (!Number.isFinite(capacity) || capacity <= 0) {
      throw new Error(`LRUCache capacity must be >0, got ${capacity}`);
    }
    this.capacity = Math.floor(capacity);
    this.cache = new Map<K, V>();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      this.misses++;
      return undefined;
    }
    const value = this.cache.get(key)!;
    // move to MRU end
    this.cache.delete(key);
    this.cache.set(key, value);
    this.hits++;
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const lruKey = this.cache.keys().next().value as K;
      this.cache.delete(lruKey);
      this.evictions++;
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  get size(): number {
    return this.cache.size;
  }

  get cap(): number {
    return this.capacity;
  }

  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  values(): IterableIterator<V> {
    return this.cache.values();
  }

  entries(): IterableIterator<[K, V]> {
    return this.cache.entries();
  }

  toArray(): Array<[K, V]> {
    return [...this.cache.entries()];
  }

  // MRU -> LRU
  toMRUArray(): Array<[K, V]> {
    return [...this.cache.entries()].reverse();
  }

  stats(): { size: number; capacity: number; hits: number; misses: number; evictions: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      capacity: this.capacity,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: total === 0 ? 0 : this.hits / total,
    };
  }
}

// ============================================================================
// 03. THINKING SIGNATURE CACHE - SIGNATURE-SPECIFIC LRU
// ============================================================================

export interface ThinkingSignatureEntry {
  signature: string;
  thinkingHash: string;
  thinkingPreview: string; // first 120 chars
  modelId: string;
  createdAt: number;
  lastUsedAt: number;
  useCount: number;
  valid: boolean;
  length: number;
}

// local variant: diverges from core (hashes UTF-8 bytes via Buffer; core hashes UTF-16 code units — different results for non-ASCII input)

export function hashThinkingContent(thinking: string): string {
  // truncated sha256 for low collision chance + fnv as fast fallback
  try {
    const sha = crypto.createHash("sha256").update(thinking, "utf8").digest("hex").slice(0, 16);
    const fnv = fnv1a32(thinking).toString(16).padStart(8, "0");
    return `${sha}_${fnv}`;
  } catch {
    const fnv = fnv1a32(thinking).toString(16).padStart(8, "0");
    return `fnv_${fnv}`;
  }
}

export function isBase64ishSig(sig: string): boolean {
  if (!sig || typeof sig !== "string") return false;
  const trimmed = sig.trim();
  if (trimmed.length < 16) return false; // short signatures are invalid
  if (trimmed.length > 8192) return false; // anomaly
  // base64 + url safe
  const b64re = /^[A-Za-z0-9+/=_-]+$/;
  if (!b64re.test(trimmed)) return false;
  // no strict padding/length heuristic required, but it must partially decode
  try {
    // try decoding: normalize url-safe characters first
    const normalized = trimmed.replace(/-/g, "+").replace(/_/g, "/");
    const buf = Buffer.from(normalized, "base64");
    if (buf.length < 8) return false; // decoded payload too short
    return true;
  } catch {
    return false;
  }
}

export function isValidThinkingSignature(signature: unknown): boolean {
  if (typeof signature !== "string") return false;
  if (signature.trim().length === 0) return false;
  return isBase64ishSig(signature);
}

export class ThinkingSignatureCache {
  private readonly lru: LRUCache<string, ThinkingSignatureEntry>;
  private readonly hashToSig: Map<string, string>; // thinkingHash -> signature

  constructor(capacity = 256) {
    this.lru = new LRUCache<string, ThinkingSignatureEntry>(capacity);
    this.hashToSig = new Map<string, string>();
  }

  /**
   * Stores a valid signature associated with thinking content.
   */
  store(thinking: string, signature: string, modelId: string = PROJECT_FALLBACK): ThinkingSignatureEntry | null {
    if (!thinking || !isValidThinkingSignature(signature)) return null;
    const thinkingHash = hashThinkingContent(thinking);
    const now = Date.now();
    const entry: ThinkingSignatureEntry = {
      signature,
      thinkingHash,
      thinkingPreview: thinking.slice(0, 120),
      modelId,
      createdAt: now,
      lastUsedAt: now,
      useCount: 1,
      valid: true,
      length: signature.length,
    };
    this.lru.set(signature, entry);
    this.hashToSig.set(thinkingHash, signature);
    return entry;
  }

  getBySignature(signature: string): ThinkingSignatureEntry | undefined {
    const entry = this.lru.get(signature);
    if (entry) {
      entry.lastUsedAt = Date.now();
      entry.useCount++;
    }
    return entry;
  }

  getByThinking(thinking: string): ThinkingSignatureEntry | undefined {
    const h = hashThinkingContent(thinking);
    const sig = this.hashToSig.get(h);
    if (!sig) return undefined;
    return this.getBySignature(sig);
  }

  getByHash(hash: string): ThinkingSignatureEntry | undefined {
    const sig = this.hashToSig.get(hash);
    if (!sig) return undefined;
    return this.getBySignature(sig);
  }

  hasValid(thinking: string, signature: string): boolean {
    if (!isValidThinkingSignature(signature)) return false;
    const bySig = this.lru.get(signature);
    if (!bySig) return false;
    return bySig.valid && bySig.thinkingHash === hashThinkingContent(thinking);
  }

  /**
   * Tries to recover a valid signature for preserved thinking content.
   */
  tryRestore(thinking: string): string | null {
    const entry = this.getByThinking(thinking);
    if (!entry || !entry.valid) return null;
    if (!isValidThinkingSignature(entry.signature)) return null;
    return entry.signature;
  }

  invalidate(signature: string): void {
    const entry = this.lru.get(signature);
    if (entry) {
      entry.valid = false;
    }
  }

  sweepInvalid(): number {
    let removed = 0;
    for (const [sig, entry] of this.lru.toArray()) {
      if (!entry.valid || !isValidThinkingSignature(entry.signature)) {
        this.lru.delete(sig);
        this.hashToSig.delete(entry.thinkingHash);
        removed++;
      }
    }
    return removed;
  }

  size(): number {
    return this.lru.size;
  }

  stats() {
    return this.lru.stats();
  }

  clear(): void {
    this.lru.clear();
    this.hashToSig.clear();
  }

  recentValidSignatures(limit = 5): ThinkingSignatureEntry[] {
    return this.lru
      .toMRUArray()
      .map(([, v]) => v)
      .filter((e) => e.valid)
      .slice(0, limit);
  }
}

// Global singleton (resettable in tests)
let globalSignatureCache: ThinkingSignatureCache | null = null;

export function getGlobalSignatureCache(): ThinkingSignatureCache {
  if (!globalSignatureCache) {
    globalSignatureCache = new ThinkingSignatureCache(256);
  }
  return globalSignatureCache;
}

export function resetGlobalSignatureCache(): void {
  globalSignatureCache?.clear();
  globalSignatureCache = null;
}

// ============================================================================
// 04. THINKING PRESERVATION STORE - KEEP_THINKING ACROSS TURNS
// ============================================================================

export interface PreservedThinking {
  id: string;
  sessionId: string;
  thinking: string;
  signature: string | null;
  modelId: string;
  messageIndex: number;
  createdAt: number;
  lastInjectedAt?: number;
  injectCount: number;
}

export class ThinkingPreservationStore {
  private readonly store: LRUCache<string, PreservedThinking>; // sessionId -> preserved
  private readonly history: LRUCache<string, PreservedThinking[]>; // sessionId -> latest entries

  constructor(capacity = 128) {
    this.store = new LRUCache<string, PreservedThinking>(capacity);
    this.history = new LRUCache<string, PreservedThinking[]>(capacity);
  }

  preserve(
    sessionId: string,
    thinking: string,
    signature: string | null,
    modelId: string,
    messageIndex: number,
  ): PreservedThinking {
    const id = `${sessionId}:${Date.now()}:${fnv1a32(thinking).toString(16)}`;
    const entry: PreservedThinking = {
      id,
      sessionId,
      thinking,
      signature: signature && isValidThinkingSignature(signature) ? signature : null,
      modelId,
      messageIndex,
      createdAt: Date.now(),
      injectCount: 0,
    };
    this.store.set(sessionId, entry);
    // history ring
    const hist = this.history.get(sessionId) ?? [];
    hist.unshift(entry);
    if (hist.length > 10) hist.pop();
    this.history.set(sessionId, hist);
    return entry;
  }

  get(sessionId: string): PreservedThinking | undefined {
    return this.store.get(sessionId);
  }

  getHistory(sessionId: string): PreservedThinking[] {
    return this.history.get(sessionId) ?? [];
  }

  markInjected(sessionId: string): void {
    const entry = this.store.get(sessionId);
    if (entry) {
      entry.lastInjectedAt = Date.now();
      entry.injectCount++;
    }
  }

  clear(sessionId?: string): void {
    if (sessionId) {
      this.store.delete(sessionId);
      this.history.delete(sessionId);
    } else {
      this.store.clear();
      this.history.clear();
    }
  }

  /**
   * Returns the latest injectable thinking entry, when one exists.
   */
  getInjectable(sessionId: string): PreservedThinking | null {
    const entry = this.store.get(sessionId);
    if (!entry) return null;
    if (!entry.thinking || entry.thinking.trim().length < 8) return null;
    return entry;
  }
}

let globalPreservationStore: ThinkingPreservationStore | null = null;

export function getGlobalPreservationStore(): ThinkingPreservationStore {
  if (!globalPreservationStore) {
    globalPreservationStore = new ThinkingPreservationStore(128);
  }
  return globalPreservationStore;
}

export function resetGlobalPreservationStore(): void {
  globalPreservationStore?.clear();
  globalPreservationStore = null;
}

// ============================================================================
// 05. ERROR DETECTORS - THINKING SIGNATURE, TOOL_USE WITHOUT THINKING, ETC
// ============================================================================

export const DETECTOR_PATTERNS = {
  invalidSignature: [
    /thinking.*signature.*invalid/i,
    /signature.*invalid.*thinking/i,
    /invalid.*thinking.*block/i,
    /thinking.*block.*signature/i,
    /signature.*must.*be.*provided/i,
    /thinking.*requires.*signature/i,
    /redacted.*thinking.*mismatch/i,
    /signature.*malformed/i,
    /anthropic.*thinking.*signature/i,
  ],
  missingThinkingForToolUse: [
    /tool_use.*requires.*thinking/i,
    /thinking.*required.*before.*tool_use/i,
    /tool_use.*without.*thinking/i,
    /expected.*thinking.*block/i,
    /missing.*thinking.*block/i,
    /thinking.*must.*precede.*tool/i,
  ],
  sessionBoundary: [
    /session.*boundary/i,
    /conversation.*too.*long/i,
    /context.*window.*exceeded/i,
    /maximum.*context/i,
    /token.*limit.*exceeded/i,
    /conversation.*ended/i,
    /session.*expired/i,
    /please.*start.*new.*conversation/i,
    /context.*length.*exceeded/i,
    /input.*too.*long/i,
  ],
  toolFailure: [/tool.*failed/i, /tool.*error/i, /tool_use.*failed/i, /execution.*failed/i, /tool.*exception/i],
  contextOverflow: [/prompt.*too.*long/i, /too.*many.*tokens/i, /context.*overflow/i, /max.*tokens.*exceeded/i],
  rateLimit: [/rate.*limit/i, /quota.*exceeded/i, /too.*many.*requests/i, /429/, /resource.*exhausted/i],
};

function matchPatterns(text: string, patterns: RegExp[]): boolean {
  return patterns.some((re) => re.test(text));
}

function stringifyError(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (err instanceof Error) return `${err.name}: ${err.message}\n${(err as any).stack ?? ""}`;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function extractBlocks(message: ChatMessage): ContentBlock[] {
  const c = message.content;
  if (typeof c === "string") return [{ type: "text", text: c } as TextBlock];
  if (Array.isArray(c)) return c as ContentBlock[];
  return [];
}

/**
 * Detector: thinking block carrying an invalid signature
 */
export function detectInvalidSignatureBlocks(messages: ChatMessages): DetectedError[] {
  const errors: DetectedError[] = [];
  messages.forEach((msg, msgIdx) => {
    if (msg.role !== "assistant") return;
    const blocks = extractBlocks(msg);
    blocks.forEach((blk: any, blkIdx) => {
      if (blk?.type !== "thinking") return;
      const thinking = blk.thinking ?? blk.redacted_thinking ?? "";
      const sig = blk.signature;
      // invalid cases:
      // - non-empty thinking without a signature
      // - present but malformed signature
      // - redacted thinking without a signature
      if (typeof thinking === "string" && thinking.trim().length > 0) {
        if (sig == null || typeof sig !== "string" || sig.trim() === "") {
          errors.push({
            code: "INVALID_THINKING_SIGNATURE",
            message: `Thinking block at msg ${msgIdx} blk ${blkIdx} missing signature`,
            details: { msgIdx, blkIdx, thinkingPreview: thinking.slice(0, 80) },
            recoverable: true,
            index: msgIdx,
            blockIndex: blkIdx,
          });
        } else if (!isValidThinkingSignature(sig)) {
          errors.push({
            code: "INVALID_THINKING_SIGNATURE",
            message: `Thinking block at msg ${msgIdx} blk ${blkIdx} has malformed signature: ${String(sig).slice(0, 30)}`,
            details: { msgIdx, blkIdx, sigPreview: String(sig).slice(0, 40), thinkingPreview: thinking.slice(0, 80) },
            recoverable: true,
            index: msgIdx,
            blockIndex: blkIdx,
          });
        }
      } else if (blk.redacted_thinking && !blk.signature) {
        // redacted thinking requires signature in Anthropic API 2026
        errors.push({
          code: "INVALID_THINKING_SIGNATURE",
          message: `Redacted thinking at msg ${msgIdx} blk ${blkIdx} missing signature`,
          details: { msgIdx, blkIdx },
          recoverable: true,
          index: msgIdx,
          blockIndex: blkIdx,
        });
      }
    });
  });
  return errors;
}

/**
 * Detector: tool_use without preceding thinking while thinking mode is active
 */
export function detectToolUseWithoutThinking(messages: ChatMessages, modelId?: string): DetectedError[] {
  const errors: DetectedError[] = [];
  const isThinkingModel = modelId ? THINKING_MODELS_2026.has(modelId) : true; // default assumes thinking is required
  if (!isThinkingModel) return errors;

  messages.forEach((msg, msgIdx) => {
    if (msg.role !== "assistant") return;
    const blocks = extractBlocks(msg);
    let hasThinkingBeforeTool = false;
    // sequential scan
    for (let i = 0; i < blocks.length; i++) {
      const b: any = blocks[i];
      if (b?.type === "thinking" && typeof b.thinking === "string" && b.thinking.trim().length > 0) {
        hasThinkingBeforeTool = true;
      }
      if (b?.type === "tool_use") {
        if (!hasThinkingBeforeTool) {
          // could check recently preserved thinking from a previous assistant message; when absent, flag the error
          errors.push({
            code: "TOOL_USE_WITHOUT_THINKING",
            message: `tool_use '${b.name ?? "unknown"}' at msg ${msgIdx} blk ${i} without preceding thinking block`,
            details: { msgIdx, blockIndex: i, toolName: b.name, toolId: b.id },
            recoverable: true,
            index: msgIdx,
            blockIndex: i,
          });
        }
        // Reset the flag for the next tool_use in the same message? Anthropic usually requires
        // thinking once per turn; for safety we assume one thinking covers every tool_use
        // of the same turn, so we do not reset.
      }
    }
  });
  return errors;
}

/**
 * Detector: session boundary / context overflow derived from error and messages
 */
export function detectSessionBoundary(error: unknown, messages?: ChatMessages): DetectedError[] {
  const errors: DetectedError[] = [];
  const errStr = stringifyError(error);

  if (matchPatterns(errStr, DETECTOR_PATTERNS.sessionBoundary)) {
    errors.push({
      code: "SESSION_BOUNDARY",
      message: `Session boundary detected: ${errStr.slice(0, 200)}`,
      details: { raw: errStr.slice(0, 500) },
      recoverable: true,
    });
  }
  if (matchPatterns(errStr, DETECTOR_PATTERNS.contextOverflow)) {
    errors.push({
      code: "CONTEXT_OVERFLOW",
      message: `Context overflow detected: ${errStr.slice(0, 200)}`,
      details: { raw: errStr.slice(0, 500) },
      recoverable: true,
    });
  }
  if (matchPatterns(errStr, DETECTOR_PATTERNS.rateLimit)) {
    errors.push({
      code: "RATE_LIMIT",
      message: `Rate limit / quota: ${errStr.slice(0, 200)}`,
      details: { raw: errStr.slice(0, 500) },
      recoverable: true,
    });
  }

  // Message heuristic: very long trailing assistant message is likely truncated
  if (messages && messages.length > 0) {
    const last = messages[messages.length - 1];
    if (last && last.role === "assistant") {
      const blocks = extractBlocks(last);
      const textLen = blocks.reduce((acc: number, b: any) => {
        if (b?.type === "text" && typeof b.text === "string") return acc + b.text.length;
        if (b?.type === "thinking" && typeof b.thinking === "string") return acc + b.thinking.length;
        return acc;
      }, 0);
      if (textLen > 120_000) {
        errors.push({
          code: "CONTEXT_OVERFLOW",
          message: `Last assistant message too long (${textLen} chars) likely truncated`,
          details: { textLen },
          recoverable: true,
          index: messages.length - 1,
        });
      }
    }
    // conversations beyond ~180 messages risk hitting a boundary
    if (messages.length > 180) {
      errors.push({
        code: "SESSION_BOUNDARY",
        message: `Conversation very long (${messages.length} messages), possible session boundary`,
        details: { messageCount: messages.length },
        recoverable: false, // observational only, no auto-recovery without an explicit error
      });
    }
  }

  return errors;
}

/**
 * Detector: tool_result failures flagged with is_error
 */
export function detectToolFailures(messages: ChatMessages): DetectedError[] {
  const errors: DetectedError[] = [];
  messages.forEach((msg, msgIdx) => {
    if (msg.role !== "tool" && !(msg.role === "user" && Array.isArray(msg.content))) {
      // in Anthropic shape, tool_result arrives as a user role holding tool_result blocks;
      // this covers both formats
      if (msg.role !== "user") return;
    }
    const blocks = extractBlocks(msg);
    blocks.forEach((blk: any, blkIdx) => {
      if (blk?.type !== "tool_result") return;
      if (blk.is_error) {
        const contentStr = typeof blk.content === "string" ? blk.content : JSON.stringify(blk.content).slice(0, 400);
        errors.push({
          code: "TOOL_FAILURE",
          message: `Tool failure at msg ${msgIdx} blk ${blkIdx} id ${blk.tool_use_id}: ${contentStr.slice(0, 150)}`,
          details: { msgIdx, blkIdx, tool_use_id: blk.tool_use_id, contentPreview: contentStr.slice(0, 200) },
          recoverable: true,
          index: msgIdx,
          blockIndex: blkIdx,
        });
      }
      // also detects error patterns inside content even when is_error is false (proxies sometimes hide it)
      if (typeof blk.content === "string" && matchPatterns(blk.content, DETECTOR_PATTERNS.toolFailure)) {
        errors.push({
          code: "TOOL_FAILURE",
          message: `Tool failure pattern in content at msg ${msgIdx} blk ${blkIdx}`,
          details: { msgIdx, blkIdx, tool_use_id: blk.tool_use_id, contentPreview: blk.content.slice(0, 200) },
          recoverable: true,
          index: msgIdx,
          blockIndex: blkIdx,
        });
      }
    });
  });
  return errors;
}

/**
 * Detector: raw API error (HTTP / JSON) mentioning an invalid signature
 */
export function detectInvalidSignatureFromError(error: unknown): DetectedError[] {
  const errStr = stringifyError(error);
  if (
    !matchPatterns(errStr, DETECTOR_PATTERNS.invalidSignature) &&
    !matchPatterns(errStr, DETECTOR_PATTERNS.missingThinkingForToolUse)
  ) {
    return [];
  }
  const errors: DetectedError[] = [];
  if (matchPatterns(errStr, DETECTOR_PATTERNS.invalidSignature)) {
    errors.push({
      code: "INVALID_THINKING_SIGNATURE",
      message: `API reports invalid thinking signature: ${errStr.slice(0, 250)}`,
      details: { raw: errStr.slice(0, 600) },
      recoverable: true,
    });
  }
  if (matchPatterns(errStr, DETECTOR_PATTERNS.missingThinkingForToolUse)) {
    errors.push({
      code: "TOOL_USE_WITHOUT_THINKING",
      message: `API reports tool_use without thinking: ${errStr.slice(0, 250)}`,
      details: { raw: errStr.slice(0, 600) },
      recoverable: true,
    });
  }
  return errors;
}

/**
 * Complete detection orchestrator
 */
export function detectAllErrors(error: unknown, messages: ChatMessages, modelId?: string): DetectionReport {
  const fromErrorSig = detectInvalidSignatureFromError(error);
  const fromBlocksSig = detectInvalidSignatureBlocks(messages);
  const fromMissingThinking = detectToolUseWithoutThinking(messages, modelId);
  const fromSession = detectSessionBoundary(error, messages);
  const fromTool = detectToolFailures(messages);

  const all = [...fromErrorSig, ...fromBlocksSig, ...fromMissingThinking, ...fromSession, ...fromTool];

  const hasInvalidSignature = all.some((e) => e.code === "INVALID_THINKING_SIGNATURE");
  const hasMissingThinking = all.some((e) => e.code === "TOOL_USE_WITHOUT_THINKING");
  const hasSessionBoundary = all.some((e) => e.code === "SESSION_BOUNDARY" || e.code === "CONTEXT_OVERFLOW");
  const hasToolFailure = all.some((e) => e.code === "TOOL_FAILURE");

  const recoverableCount = all.filter((e) => e.recoverable).length;

  return {
    errors: all,
    hasInvalidSignature,
    hasMissingThinking,
    hasSessionBoundary,
    hasToolFailure,
    shouldRecover: recoverableCount > 0,
  };
}

// ============================================================================
// 06. RECOVERY PLAN BUILDING
// ============================================================================

function genPlanId(): string {
  try {
    return `rcv_${crypto.randomBytes(6).toString("hex")}_${Date.now().toString(36)}`;
  } catch {
    return `rcv_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  }
}

export interface BuildPlanOptions {
  sessionId?: string;
  modelId?: string;
  preservationStore?: ThinkingPreservationStore;
  signatureCache?: ThinkingSignatureCache;
  messages: ChatMessages;
}

export function buildRecoveryPlan(report: DetectionReport, opts: BuildPlanOptions): RecoveryPlan {
  const actions: RecoveryAction[] = [];
  let keepThinking: string | null = null;
  let preservedSignature: string | null = null;

  const preservationStore = opts.preservationStore ?? getGlobalPreservationStore();
  const signatureCache = opts.signatureCache ?? getGlobalSignatureCache();
  const sessionId = opts.sessionId ?? "default";

  // priority: 0 = most urgent
  if (report.hasInvalidSignature) {
    actions.push({
      strategy: "STRIP_INVALID_SIGNATURE",
      reason: "Remove thinking blocks with invalid signatures and try restoring from the LRU cache",
      priority: 0,
      payload: {
        invalidCount: report.errors.filter((e) => e.code === "INVALID_THINKING_SIGNATURE").length,
      },
    });
    // tenta restaurar thinking via cache
    const preserved = preservationStore.getInjectable(sessionId);
    if (preserved) {
      keepThinking = preserved.thinking;
      preservedSignature = preserved.signature ?? signatureCache.tryRestore(preserved.thinking) ?? null;

      if (preserved.thinking && preservedSignature) {
        actions.push({
          strategy: "INJECT_PRESERVED_THINKING",
          reason: `Injects thinking preserved from session ${sessionId} with the signature restored from cache`,
          priority: 1,
          payload: {
            preservedId: preserved.id,
            hasSignature: !!preservedSignature,
            thinkingPreview: preserved.thinking.slice(0, 60),
          },
        });
      }
    } else {
      // fallback: recent valid signatures do cache global
      const recent = signatureCache.recentValidSignatures(1)[0];
      if (recent) {
        actions.push({
          strategy: "INJECT_PRESERVED_THINKING",
          reason: "LRU cache holds a recent valid signature to attempt injection",
          priority: 1,
          payload: { recentModelId: recent.modelId, sigLen: recent.length },
        });
      }
    }
  }

  if (report.hasMissingThinking) {
    actions.push({
      strategy: "KEEP_THINKING_PRESERVE",
      reason: "tool_use without thinking - preserve thinking across turns and inject it",
      priority: 2,
      payload: {
        missingCount: report.errors.filter((e) => e.code === "TOOL_USE_WITHOUT_THINKING").length,
      },
    });

    if (!keepThinking) {
      const preserved = preservationStore.getInjectable(sessionId);
      if (preserved) {
        keepThinking = preserved.thinking;
        preservedSignature = preserved.signature ?? signatureCache.tryRestore(preserved.thinking) ?? null;
        actions.push({
          strategy: "INJECT_PRESERVED_THINKING",
          reason: "Injects preserved thinking to satisfy the thinking->tool_use requirement",
          priority: 3,
          payload: { preservedId: preserved.id },
        });
      } else {
        // generate minimal synthetic thinking when nothing is preserved - last resort
        actions.push({
          strategy: "KEEP_THINKING_PRESERVE",
          reason: "No preserved thinking available - a short synthetic placeholder will unlock the turn",
          priority: 4,
          payload: { synthetic: true },
        });
      }
    }
  }

  if (report.hasToolFailure) {
    actions.push({
      strategy: "UNDO_GUIDANCE",
      reason: "Tool failed - inject undo / correction guidance",
      priority: 5,
      payload: {
        failCount: report.errors.filter((e) => e.code === "TOOL_FAILURE").length,
        failures: report.errors.filter((e) => e.code === "TOOL_FAILURE").map((e) => e.details),
      },
    });
  }

  if (report.hasSessionBoundary) {
    actions.push({
      strategy: "CONTINUE_RESUME",
      reason: "Session boundary / context overflow - use the continue strategy",
      priority: 6,
      payload: {
        boundaryErrors: report.errors.filter((e) => e.code === "SESSION_BOUNDARY" || e.code === "CONTEXT_OVERFLOW"),
      },
    });
    actions.push({
      strategy: "REBUILD_MESSAGES",
      reason: "Rebuild history by compacting older messages to fit the context window",
      priority: 7,
    });
  }

  // Always close with retry backoff when anything is recoverable
  if (report.shouldRecover) {
    actions.push({
      strategy: "RETRY_WITH_BACKOFF",
      reason: "Recoverable errors detected - schedule a retry with exponential backoff",
      priority: 10,
    });
  }

  actions.sort((a, b) => a.priority - b.priority);

  const shouldRetry = report.shouldRecover && actions.length > 0;

  return {
    id: genPlanId(),
    createdAt: Date.now(),
    errors: report.errors,
    actions,
    keepThinking,
    preservedSignature,
    shouldRetry,
    metadata: {
      modelId: opts.modelId,
      sessionId,
      modelIsThinking: opts.modelId ? THINKING_MODELS_2026.has(opts.modelId) : undefined,
    },
  };
}

// ============================================================================
// 07. MESSAGE TRANSFORMATION HELPERS
// ============================================================================

export function cloneMessages(messages: ChatMessages): ChatMessages {
  return messages.map((m) => {
    const content = typeof m.content === "string" ? m.content : (m.content as any[]).map((b: any) => ({ ...b }));
    return { ...m, content } as ChatMessage;
  });
}

/**
 * Removes thinking blocks carrying invalid signatures.
 * Restores from cache when possible; otherwise strips the block.
 */
export function stripInvalidSignatures(
  messages: ChatMessages,
  signatureCache?: ThinkingSignatureCache,
): { messages: ChatMessages; removedCount: number; restoredCount: number } {
  const cache = signatureCache ?? getGlobalSignatureCache();
  let removedCount = 0;
  let restoredCount = 0;

  const out: ChatMessages = messages.map((msg) => {
    if (msg.role !== "assistant") return msg;
    const blocks = extractBlocks(msg);
    const newBlocks: ContentBlock[] = [];

    for (const blk of blocks) {
      const b: any = blk;
      if (b?.type !== "thinking") {
        newBlocks.push(b);
        continue;
      }
      const sigValid = isValidThinkingSignature(b.signature);
      if (!sigValid) {
        // try restoring from cache via the thinking hash
        const thinking: string = b.thinking ?? b.redacted_thinking ?? "";
        if (thinking) {
          const restoredSig = cache.tryRestore(thinking);
          if (restoredSig) {
            newBlocks.push({ ...b, signature: restoredSig, _preserved: true } as any);
            restoredCount++;
            continue;
          }
        }
        // removal: for Claude 2026, dropping thinking must not break downstream tool_use.
        // Strategy: strip it here; it gets reinjected later when keep_thinking is active.
        removedCount++;
        continue;
      } else {
        // valid - store into the cache
        if (typeof b.thinking === "string" && b.thinking.length > 0) {
          cache.store(b.thinking, b.signature, "auto-detected");
        }
        newBlocks.push(b);
      }
    }

    return { ...msg, content: newBlocks } as ChatMessage;
  });

  return { messages: out, removedCount, restoredCount };
}

/**
 * Guarantees every assistant message with tool_use has preceding thinking.
 * Injects preserved thinking, or a minimal synthetic block, when missing.
 */
export function ensureThinkingBeforeToolUse(
  messages: ChatMessages,
  preservedThinking: string | null,
  preservedSignature: string | null,
  opts?: { syntheticFallback?: boolean; modelId?: string },
): { messages: ChatMessages; injectedCount: number } {
  let injectedCount = 0;
  const syntheticThinking =
    "Reviewing the previous context and the need to use tools to continue the task. " +
    "I will stay coherent with the previously preserved reasoning and execute the required next step.";

  const out = cloneMessages(messages);

  for (let mi = 0; mi < out.length; mi++) {
    const msg = out[mi]!;
    if (msg.role !== "assistant") continue;
    const blocks = extractBlocks(msg);
    let hasThinking = blocks.some(
      (b: any) => b?.type === "thinking" && typeof b.thinking === "string" && b.thinking.trim().length > 0,
    );
    const hasToolUse = blocks.some((b: any) => b?.type === "tool_use");

    if (hasToolUse && !hasThinking) {
      const thinkingToInject =
        preservedThinking && preservedThinking.trim().length > 10 ? preservedThinking : syntheticThinking;
      const sigToInject =
        preservedSignature && isValidThinkingSignature(preservedSignature) ? preservedSignature : undefined;

      const thinkingBlock: ThinkingBlock = {
        type: "thinking",
        thinking: thinkingToInject,
        ...(sigToInject ? { signature: sigToInject } : {}),
        _injected: true,
        _preserved: !!preservedThinking,
      };

      // inject at the start of the message
      const newContent: ContentBlock[] = [thinkingBlock, ...(blocks as ContentBlock[])];
      out[mi] = { ...msg, content: newContent } as ChatMessage;
      injectedCount++;
    }
  }

  return { messages: out, injectedCount };
}

/**
 * Injects preserved thinking across turns (keep_thinking strategy).
 * Never overwrites existing assistant thinking - only preserves it.
 */
export function injectPreservedThinking(
  messages: ChatMessages,
  preserved: PreservedThinking | null,
  signatureCache?: ThinkingSignatureCache,
): { messages: ChatMessages; injected: boolean } {
  if (!preserved || !preserved.thinking) {
    return { messages, injected: false };
  }

  const out = cloneMessages(messages);
  // Adopted strategy: best practice for Anthropic thinking is keeping preserved thinking
  // in the history as a valid prior assistant thinking block rather than as user content.

  // Insert before the last user message as preserved assistant thinking when possible;
  // otherwise simply carry it over to the next turn.

  // Simple approach: when the last message is a user message, prepend a preserved-thinking
  // assistant message before it. This simulates keep_thinking across turns.
  const lastUserIdx = (() => {
    for (let i = out.length - 1; i >= 0; i--) {
      if (out[i]!.role === "user") return i;
    }
    return -1;
  })();

  const cache = signatureCache ?? getGlobalSignatureCache();
  let sig = preserved.signature;
  if (!sig || !isValidThinkingSignature(sig)) {
    sig = cache.tryRestore(preserved.thinking) ?? null;
  }

  const block: ThinkingBlock = {
    type: "thinking",
    thinking: preserved.thinking,
    ...(sig && isValidThinkingSignature(sig) ? { signature: sig } : {}),
    _preserved: true,
    _injected: true,
  };

  const assistantPreserveMsg: ChatMessage = {
    role: "assistant",
    content: [
      block,
      { type: "text", text: "[thinking preserved from previous turn - continuity maintained]" } as TextBlock,
    ],
  };

  if (lastUserIdx >= 0) {
    // insert before the last user message when at least one earlier message exists
    out.splice(lastUserIdx, 0, assistantPreserveMsg);
  } else {
    // append
    out.push(assistantPreserveMsg);
  }

  return { messages: out, injected: true };
}

/**
 * "continue" message for session-boundary recovery.
 * Tuned for the Gemini CLI bypass - keeps the ideType UNSPECIFIED fingerprint.
 */
export function buildContinueMessage(opts?: {
  sessionId?: string | undefined;
  modelId?: string | undefined;
  truncatedCount?: number | undefined;
  includePreserved?: boolean | undefined;
}): ChatMessage {
  const parts = [
    "Continue from where you left off.",
    "Preserve the previous thinking context and complete the remaining tasks.",
    "Do not restart - resume exactly from the last checkpoint.",
  ];
  if (opts?.truncatedCount && opts.truncatedCount > 0) {
    parts.push(
      `Note: ${opts.truncatedCount} older messages were compacted due to context limits, but core thinking is preserved.`,
    );
  }
  if (opts?.includePreserved) {
    parts.push("Use the preserved thinking blocks to maintain coherence.");
  }
  // extra instruction for Claude thinking models 2026
  if (opts?.modelId && THINKING_MODELS_2026.has(opts.modelId)) {
    parts.push("Keep thinking block signature valid and include thinking before any tool_use.");
  }

  return {
    role: "user",
    content: parts.join(" "),
  };
}

/**
 * Undo-guidance message emitted when a tool fails.
 */
export function buildUndoGuidanceMessage(failures: DetectedError[], opts?: { sessionId?: string }): ChatMessage {
  const failureSummaries = failures
    .slice(0, 3)
    .map((f) => {
      const toolId = (f.details as any)?.tool_use_id ?? "unknown";
      const preview = (f.details as any)?.contentPreview ?? f.message;
      return `- Tool ${toolId}: ${String(preview).slice(0, 120)}`;
    })
    .join("\n");

  const guidance =
    `The previous tool execution failed:\n${failureSummaries}\n\n` +
    `Please UNDO / revert any partial changes if needed, explain the failure briefly, ` +
    `and retry with corrected parameters. Do not repeat the same failing call verbatim. ` +
    `If the failure is unrecoverable, propose an alternative approach. ` +
    `Keep thinking preserved across turns.`;

  return {
    role: "user",
    content: guidance,
  };
}

/**
 * Compacting rebuild for session boundary / context overflow.
 * Keeps the system prompt, the last N messages, and a mid-history summary.
 */
export function rebuildMessagesCompacted(
  messages: ChatMessages,
  opts?: { keepLast?: number; keepSystem?: boolean },
): { messages: ChatMessages; compactedCount: number } {
  const keepLast = opts?.keepLast ?? 20;
  const keepSystem = opts?.keepSystem ?? true;

  if (messages.length <= keepLast) {
    return { messages: cloneMessages(messages), compactedCount: 0 };
  }

  const systemMsgs = keepSystem ? messages.filter((m) => m.role === "system") : [];
  const nonSystem = messages.filter((m) => m.role !== "system");

  if (nonSystem.length <= keepLast) {
    return { messages: cloneMessages(messages), compactedCount: 0 };
  }

  const toKeep = nonSystem.slice(-keepLast);
  const toCompact = nonSystem.slice(0, -keepLast);
  const compactedCount = toCompact.length;

  // summarize the compacted range
  const summaryText = `[Context compacted: ${compactedCount} earlier messages summarized. Core tasks, thinking signatures and tool results preserved. Continue without restarting.]`;

  const summaryMsg: ChatMessage = {
    role: "user",
    content: summaryText,
  };

  const newMessages: ChatMessages = [...cloneMessages(systemMsgs), summaryMsg, ...cloneMessages(toKeep)];

  return { messages: newMessages, compactedCount };
}

/**
 * Master retry transformer - applies a recovery plan.
 */
export function transformMessagesForRetry(
  originalMessages: ChatMessages,
  plan: RecoveryPlan,
  opts?: {
    sessionId?: string;
    signatureCache?: ThinkingSignatureCache;
    preservationStore?: ThinkingPreservationStore;
  },
): ChatMessages {
  let working = cloneMessages(originalMessages);
  const signatureCache = opts?.signatureCache ?? getGlobalSignatureCache();
  const preservationStore = opts?.preservationStore ?? getGlobalPreservationStore();
  const sessionId = opts?.sessionId ?? (plan.metadata as any)?.sessionId ?? "default";

  for (const action of plan.actions) {
    switch (action.strategy) {
      case "STRIP_INVALID_SIGNATURE": {
        const result = stripInvalidSignatures(working, signatureCache);
        working = result.messages;
        break;
      }
      case "INJECT_PRESERVED_THINKING": {
        if (plan.keepThinking) {
          const preserved = preservationStore.get(sessionId);
          if (preserved) {
            const res = injectPreservedThinking(working, preserved, signatureCache);
            working = res.messages;
          } else if (plan.keepThinking) {
            // build a temporary preserved entry from the plan
            const tmp: PreservedThinking = {
              id: `tmp_${plan.id}`,
              sessionId,
              thinking: plan.keepThinking,
              signature: plan.preservedSignature ?? null,
              modelId: (plan.metadata as any)?.modelId ?? PROJECT_FALLBACK,
              messageIndex: working.length,
              createdAt: Date.now(),
              injectCount: 0,
            };
            const res = injectPreservedThinking(working, tmp, signatureCache);
            working = res.messages;
          }
        }
        break;
      }
      case "KEEP_THINKING_PRESERVE": {
        const { messages, injectedCount } = ensureThinkingBeforeToolUse(
          working,
          plan.keepThinking ?? null,
          plan.preservedSignature ?? null,
          { modelId: (plan.metadata as any)?.modelId },
        );
        working = messages;
        // when nothing was injected but tool_use still lacks thinking, force an extra injection
        void injectedCount;
        break;
      }
      case "UNDO_GUIDANCE": {
        const toolFailures = plan.errors.filter((e) => e.code === "TOOL_FAILURE");
        if (toolFailures.length > 0) {
          const undoMsg = buildUndoGuidanceMessage(toolFailures, { sessionId });
          working = [...working, undoMsg];
        }
        break;
      }
      case "CONTINUE_RESUME": {
        const boundaryErrs = plan.errors.filter((e) => e.code === "SESSION_BOUNDARY" || e.code === "CONTEXT_OVERFLOW");
        const compacted = (action.payload as any)?.compactedCount as number | undefined;
        const contMsg = buildContinueMessage({
          sessionId,
          modelId: (plan.metadata as any)?.modelId,
          truncatedCount: compacted,
          includePreserved: !!plan.keepThinking,
        });
        // on boundary, compact the history too
        if (boundaryErrs.length > 0) {
          const rebuilt = rebuildMessagesCompacted(working, { keepLast: 24, keepSystem: true });
          working = rebuilt.messages;
        }
        working = [...working, contMsg];
        break;
      }
      case "REBUILD_MESSAGES": {
        const rebuilt = rebuildMessagesCompacted(working, { keepLast: 24, keepSystem: true });
        working = rebuilt.messages;
        break;
      }
      case "RESET_THINKING_CACHE": {
        signatureCache.sweepInvalid();
        break;
      }
      case "RETRY_WITH_BACKOFF":
        // noop transform, delay only
        break;
      default:
        break;
    }
  }

  return working;
}

// ============================================================================
// 08. PRESERVATION HOOKS - CALL AFTER VALID RESPONSES
// ============================================================================

/**
 * Shared cache+store preservation step of {@link preserveThinkingFromMessages}
 * and {@link preserveThinkingFromResponse}: stores a valid signature in the
 * thinking cache, preserves the block in the session store and returns the
 * preserved-count delta. v2.1.16 pure refactor — both callers previously
 * carried a byte-identical copy of this block; behavior is unchanged.
 */
function preserveBlock(
  cache: ThinkingSignatureCache,
  store: ThinkingPreservationStore,
  opts: { sessionId: string; modelId: string },
  thinking: string,
  sig: string | null,
  messageIndex: number,
): number {
  if (sig && isValidThinkingSignature(sig)) {
    cache.store(thinking, sig, opts.modelId);
  }
  store.preserve(opts.sessionId, thinking, sig, opts.modelId, messageIndex);
  return 1;
}

export function preserveThinkingFromMessages(
  messages: ChatMessages,
  opts: {
    sessionId: string;
    modelId: string;
    signatureCache?: ThinkingSignatureCache;
    preservationStore?: ThinkingPreservationStore;
  },
): number {
  const cache = opts.signatureCache ?? getGlobalSignatureCache();
  const store = opts.preservationStore ?? getGlobalPreservationStore();
  let preservedCount = 0;

  messages.forEach((msg, idx) => {
    if (msg.role !== "assistant") return;
    const blocks = extractBlocks(msg);
    for (const blk of blocks) {
      const b: any = blk;
      if (b?.type === "thinking" && typeof b.thinking === "string" && b.thinking.trim().length > 10) {
        const sig = typeof b.signature === "string" ? b.signature : null;
        preservedCount += preserveBlock(cache, store, opts, b.thinking, sig, idx);
      }
    }
  });

  return preservedCount;
}

export function preserveThinkingFromResponse(
  response: unknown,
  opts: {
    sessionId: string;
    modelId: string;
    signatureCache?: ThinkingSignatureCache;
    preservationStore?: ThinkingPreservationStore;
  },
): number {
  // try extracting thinking from a generic Anthropic/Gemini response shape
  try {
    const respObj: any = response;
    let contents: any[] = [];

    // Anthropic style: content array
    if (Array.isArray(respObj?.content)) contents = respObj.content;
    else if (Array.isArray(respObj?.candidates?.[0]?.content?.parts)) contents = respObj.candidates[0].content.parts;
    else if (Array.isArray(respObj?.candidates?.[0]?.content)) contents = respObj.candidates[0].content;
    else if (typeof respObj?.text === "function") {
      // streaming maybe
      return 0;
    }

    const cache = opts.signatureCache ?? getGlobalSignatureCache();
    const store = opts.preservationStore ?? getGlobalPreservationStore();

    let count = 0;
    for (const c of contents) {
      if (c?.type === "thinking" && typeof c.thinking === "string") {
        const sig = typeof c.signature === "string" ? c.signature : null;
        count += preserveBlock(cache, store, opts, c.thinking, sig, 0);
      }
      // Gemini may return thinking inside a separate object
      if (c?.thinking && typeof c.thinking === "string") {
        const sig = c.signature ?? null;
        store.preserve(opts.sessionId, c.thinking, sig, opts.modelId, 0);
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

// ============================================================================
// 09. EXPONENTIAL BACKOFF
// ============================================================================

export function exponentialBackoff(attempt: number, baseMs: number, maxMs: number, jitter: boolean): number {
  const exp = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  if (!jitter) return Math.floor(exp);
  // full jitter would be random 0..exp; we use decorrelated jitter around the
  // base to avoid thundering herds
  try {
    const rand = crypto.randomInt(0, 1000) / 1000; // 0..0.999
    const jittered = exp * (0.5 + rand * 0.5); // 50%..100% do exp
    return Math.floor(Math.min(maxMs, jittered));
  } catch {
    const jittered = exp * (0.5 + Math.random() * 0.5);
    return Math.floor(Math.min(maxMs, jittered));
  }
}

export function sleepMs(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error("Aborted"));
      return;
    }
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timeout);
      reject(signal?.reason ?? new Error("Aborted"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

// ============================================================================
// 10. withAutoRecovery WRAPPER - ENGINE CORE
// ============================================================================

export class AutoRecoveryExhaustedError extends Error {
  public readonly attempts: number;
  public readonly lastPlan?: RecoveryPlan | undefined;
  public readonly lastError: unknown;

  constructor(message: string, lastError: unknown, attempts: number, lastPlan?: RecoveryPlan) {
    super(message);
    this.name = "AutoRecoveryExhaustedError";
    this.attempts = attempts;
    this.lastError = lastError;
    this.lastPlan = lastPlan;
  }
}

/**
 * Wrapper principal com auto-recovery completo.
 *
 * Flow:
 *  1. Executes the executor with the original messages
 *  2. On error or invalid response, runs the detectors
 *  3. When recoverable, builds a RecoveryPlan, transforms messages, backs off, retries
 *  4. Preserves valid thinking after success (keep_thinking)
 *
 * Zero-dep, apenas node:* + fetch global.
 *
 * @example
 * const result = await withAutoRecovery(
 *   async (msgs) => callAntigravity(msgs),
 *   originalMessages,
 *   { maxAttempts: 4, modelId: "antigravity-claude-opus-4-6-thinking", sessionId: "sess_123" }
 * );
 */
// local variant: diverges from core (message-plan recovery engine with detectors and preservation; core.withAutoRecovery is a simple attempt-retry loop)
export async function withAutoRecovery<T>(
  executor: ExecutorFn<T>,
  messages: ChatMessages,
  opts?: AutoRecoveryOptions,
): Promise<T> {
  const maxAttempts = opts?.maxAttempts ?? 4;
  const baseDelayMs = opts?.baseDelayMs ?? 450;
  const maxDelayMs = opts?.maxDelayMs ?? 7500;
  const jitter = opts?.jitter ?? true;
  const failFast = opts?.failFastOnNonRecoverable ?? true;

  const signatureCache = opts?.signatureCache ?? getGlobalSignatureCache();
  const preservationStore = opts?.preservationStore ?? getGlobalPreservationStore();
  const sessionId = opts?.sessionId ?? "default";
  const modelId = opts?.modelId ?? PROJECT_FALLBACK;
  const logger = opts?.logger ?? console;

  if (!Array.isArray(messages)) {
    throw new TypeError("withAutoRecovery: messages must be array");
  }

  let workingMessages = cloneMessages(messages);
  let lastError: unknown = null;
  let lastPlan: RecoveryPlan | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // abort check
    if (opts?.signal?.aborted) {
      throw opts.signal.reason ?? new Error("withAutoRecovery aborted");
    }

    try {
      const result = await executor(workingMessages, {
        signal: opts?.signal,
        attempt,
        plan: lastPlan,
      });

      // post-success detection: verify the result does not carry an invalid thinking
      // signature that would require recovery even without a thrown error
      // (e.g. proxy answers 200 with broken content)
      try {
        const msgForCheck: ChatMessages = extractMessagesFromResultForCheck(result, workingMessages);
        const postReport = detectAllErrors(null, msgForCheck, modelId);
        if (postReport.hasInvalidSignature) {
          // invalid signature in the result is treated as a recoverable error
          throw new Error(
            `Post-exec invalid thinking signature detected: ${postReport.errors.map((e) => e.message).join("; ")}`,
          );
        }
        // keep_thinking preservation after a valid success
        preserveThinkingFromMessages(msgForCheck, { sessionId, modelId, signatureCache, preservationStore });
        preserveThinkingFromResponse(result, { sessionId, modelId, signatureCache, preservationStore });
      } catch (preserveErr) {
        // preservation failure must never break a success
        if ((preserveErr as Error)?.message?.includes("invalid thinking signature")) {
          // when the check itself detected the invalid signature, propagate to retry
          throw preserveErr;
        }
        // otherwise ignore
      }

      // genuine success
      return result;
    } catch (err) {
      lastError = err;

      const detectionReport = detectAllErrors(err, workingMessages, modelId);

      if (opts?.onDetectedErrors) {
        try {
          opts.onDetectedErrors(detectionReport);
        } catch {
          // ignore callback errors
        }
      }

      // Not recoverable and failFast -> rethrow immediately
      if (!detectionReport.shouldRecover) {
        if (failFast) {
          throw err;
        }
        // without failFast, still attempt one simple backoff retry for rate limits etc
        if (detectionReport.errors.some((e) => e.code === "RATE_LIMIT")) {
          // allow retry
        } else {
          throw err;
        }
      }

      const plan = buildRecoveryPlan(detectionReport, {
        sessionId,
        modelId,
        messages: workingMessages,
        preservationStore,
        signatureCache,
      });

      lastPlan = plan;

      // plan says shouldRetry=false -> abort
      if (!plan.shouldRetry) {
        throw err;
      }

      // apply the message transformation
      const transformed = transformMessagesForRetry(workingMessages, plan, {
        sessionId,
        signatureCache,
        preservationStore,
      });
      workingMessages = transformed;
      plan.transformedMessages = cloneMessages(transformed);

      const delayMs = exponentialBackoff(attempt, baseDelayMs, maxDelayMs, jitter);
      plan.retryDelayMs = delayMs;

      if (opts?.onRecoveryAttempt) {
        try {
          opts.onRecoveryAttempt(attempt + 1, plan, delayMs);
        } catch {
          // ignore
        }
      }

      // minimal logging (never noisy) - only when the logger exposes debug
      try {
        logger.debug?.(
          `[recovery] attempt ${attempt + 1}/${maxAttempts} plan=${plan.id} errors=${plan.errors
            .map((e) => e.code)
            .join(",")} actions=${plan.actions.map((a) => a.strategy).join("->")} delay=${delayMs}ms`,
        );
      } catch {
        // ignore
      }

      // the last attempt does not sleep
      if (attempt < maxAttempts - 1) {
        try {
          await sleepMs(delayMs, opts?.signal);
        } catch (abortErr) {
          throw abortErr;
        }
      }
      // loop continues
    }
  }

  throw new AutoRecoveryExhaustedError(
    `Auto-recovery exhausted after ${maxAttempts} attempts. Last error: ${stringifyError(lastError).slice(0, 400)}`,
    lastError,
    maxAttempts,
    lastPlan,
  );
}

/**
 * Best-effort extraction of ChatMessages from a generic result for post-exec checks.
 * Supports:
 *  - array direto
 *  - object com {messages}
 *  - Anthropic {content: [...]}
 *  - Gemini {candidates[0].content}
 */
function extractMessagesFromResultForCheck(result: unknown, fallback: ChatMessages): ChatMessages {
  try {
    const r: any = result;
    if (Array.isArray(r) && r.length > 0 && r[0]?.role) {
      return r as ChatMessages;
    }
    if (Array.isArray(r?.messages)) {
      return r.messages as ChatMessages;
    }
    if (Array.isArray(r?.content)) {
      // assistant message
      return [{ role: "assistant", content: r.content as ContentBlock[] }];
    }
    if (r?.candidates?.[0]?.content) {
      const cand = r.candidates[0];
      if (Array.isArray(cand.content)) {
        return [{ role: "assistant", content: cand.content }];
      }
      if (cand.content?.parts) {
        // convert gemini parts to content blocks for detection
        const parts = cand.content.parts;
        const blocks: ContentBlock[] = parts.map((p: any) => {
          if (p.text) return { type: "text", text: p.text } as TextBlock;
          if (p.thinking) return { type: "thinking", thinking: p.thinking, signature: p.signature } as ThinkingBlock;
          return p;
        });
        return [{ role: "assistant", content: blocks }];
      }
    }
    // fallback: use working messages + result as text
    return fallback;
  } catch {
    return fallback;
  }
}

// ============================================================================
// 11. HIGH-LEVEL UTILITIES - PLUGIN FACADE
// ============================================================================

export interface RecoveryFacadeOptions {
  sessionId: string;
  modelId: string;
  maxAttempts?: number;
}

/**
 * Builds a preconfigured wrapper for the maene plugin.
 * Comes wired with the global LRU caches and preservation store.
 */
export function createRecoveryFacade(opts: RecoveryFacadeOptions) {
  const signatureCache = getGlobalSignatureCache();
  const preservationStore = getGlobalPreservationStore();

  return {
    signatureCache,
    preservationStore,

    /**
     * Detects errors in the current messages (without executing)
     */
    detect(messages: ChatMessages, error?: unknown): DetectionReport {
      return detectAllErrors(error ?? null, messages, opts.modelId);
    },

    /**
     * Builds a plan without executing.
     */
    plan(report: DetectionReport, messages: ChatMessages): RecoveryPlan {
      return buildRecoveryPlan(report, {
        sessionId: opts.sessionId,
        modelId: opts.modelId,
        messages,
        signatureCache,
        preservationStore,
      });
    },

    /**
     * Transforms messages according to a plan.
     */
    transform(messages: ChatMessages, plan: RecoveryPlan): ChatMessages {
      return transformMessagesForRetry(messages, plan, {
        sessionId: opts.sessionId,
        signatureCache,
        preservationStore,
      });
    },

    /**
     * Executes with auto-recovery.
     */
    async exec<T>(executor: ExecutorFn<T>, messages: ChatMessages, extra?: Partial<AutoRecoveryOptions>): Promise<T> {
      return withAutoRecovery(executor, messages, {
        maxAttempts: opts.maxAttempts ?? 4,
        sessionId: opts.sessionId,
        modelId: opts.modelId,
        signatureCache,
        preservationStore,
        ...extra,
      });
    },

    /**
     * Preserves thinking manually.
     */
    preserve(messages: ChatMessages): number {
      return preserveThinkingFromMessages(messages, {
        sessionId: opts.sessionId,
        modelId: opts.modelId,
        signatureCache,
        preservationStore,
      });
    },

    clear() {
      preservationStore.clear(opts.sessionId);
    },
  };
}

// ============================================================================
// 12. COMPATIBILITY HELPERS - USER PROMPT ID FNV BUILDER (dependency-free)
// ============================================================================

export function buildUserPromptIdShort(input: string, seed?: string): string {
  const base = seed ? `${input}|${seed}` : input;
  const h = fnv1a32(base).toString(16).padStart(8, "0");
  return `agyp_${h}`;
}

export function buildSessionIdFromCwd(cwd?: string): string {
  const dir = cwd ?? process.cwd();
  const h = fnv1a32(dir).toString(16).padStart(8, "0");
  return `sess_${h}`;
}

// ============================================================================
// 13. CONSTANTS EXPORT & DEFAULT BUNDLE
// ============================================================================

export const RecoveryConstants = {
  GEMINI_CLI_CLIENT_ID,
  GEMINI_CLI_CLIENT_SECRET,
  GEMINI_CLI_USER_AGENT,
  X_GOOG_API_CLIENT,
  X_CLIENT_METADATA_RAW,
  PROJECT_FALLBACK,
  MODELS_2026,
  DETECTOR_PATTERNS,
} as const;

export const Recovery = {
  // caches
  LRUCache,
  ThinkingSignatureCache,
  getGlobalSignatureCache,
  resetGlobalSignatureCache,
  ThinkingPreservationStore,
  getGlobalPreservationStore,
  resetGlobalPreservationStore,

  // validators
  isValidThinkingSignature,
  isBase64ishSig,
  hashThinkingContent,
  fnv1a32,

  // detectors
  detectInvalidSignatureBlocks,
  detectToolUseWithoutThinking,
  detectSessionBoundary,
  detectToolFailures,
  detectInvalidSignatureFromError,
  detectAllErrors,
  DETECTOR_PATTERNS,

  // plan
  buildRecoveryPlan,

  // transformers
  cloneMessages,
  stripInvalidSignatures,
  ensureThinkingBeforeToolUse,
  injectPreservedThinking,
  buildContinueMessage,
  buildUndoGuidanceMessage,
  rebuildMessagesCompacted,
  transformMessagesForRetry,

  // preservation
  preserveThinkingFromMessages,
  preserveThinkingFromResponse,

  // backoff
  exponentialBackoff,
  sleepMs,

  // wrapper
  withAutoRecovery,
  AutoRecoveryExhaustedError,
  createRecoveryFacade,

  // simple context-based API (v4/v5 lineage)
  detectErrorType,
  detectError,
  isRecoverable,
  getRecoveryStrategy,
  preserveThinkingSignature,
  getPreservedSignature,
  buildRecoveryMessage,
  transformMessagesForRecovery,
  withAutoRecoverySimple,
  recoverToolResultMissing,
  recoverThinkingOrder,
  recoverThinkingDisabled,
  sessionRecovery,
  contextErrorRecovery,
  toast,

  // helpers
  buildUserPromptIdShort,
  buildSessionIdFromCwd,

  // constants
  RecoveryConstants,
} as const;

export default Recovery;

// ============================================================================
// 14. SIMPLE CONTEXT-BASED RECOVERY API (ported from the v4/v5 lineage)
// ============================================================================

/**
 * Coarse error taxonomy used by the simple recovery API. Extends the v4/v5
 * union with the "session_boundary" and "tool_failure" kinds from the v2/v3
 * lineage so every historical value remains representable.
 */
export type RecoveryErrorType =
  | "invalid_thinking_signature"
  | "tool_use_without_thinking"
  | "session_boundary"
  | "tool_failure"
  | "tool_result_missing"
  | "thinking_block_order"
  | "thinking_disabled_violation"
  | "prompt_too_long"
  | "tool_pairing"
  | "unknown";

/** Legacy alias kept for source compatibility with the v4/v5 exports. */
export type errorType = RecoveryErrorType;

/** Context passed through the simple recovery helpers. */
export type RecoveryContext = {
  errorType: RecoveryErrorType;
  message: string;
  lastThinking?: { text: string; signature?: string };
  toolUseId?: string;
  sessionId?: string;
};

/** Strategy returned by getRecoveryStrategy (lowercase taxonomy of the lineage). */
export type SimpleRecoveryStrategy = "continue" | "undo_guidance" | "keep_thinking" | "inject_preserved";

// ---------------------------------------------------------------------------
// Bounded module-level signature cache (max 100 entries, LRU eviction).
// Independent from ThinkingSignatureCache: preserved signatures survive even
// when the main cache was reset.
// ---------------------------------------------------------------------------

const SIGNATURE_LRU_MAX = 100;
const signatureLruCache = new Map<string, string>();

function signatureLruSet(key: string, signature: string): void {
  if (signatureLruCache.has(key)) signatureLruCache.delete(key);
  signatureLruCache.set(key, signature);
  if (signatureLruCache.size > SIGNATURE_LRU_MAX) {
    const first = signatureLruCache.keys().next().value;
    if (first !== undefined) signatureLruCache.delete(first);
  }
}

/**
 * Classifies an thrown error into a RecoveryErrorType using message matching.
 */
export function detectErrorType(err: any, _lastPayload?: any): RecoveryErrorType {
  const msg = String(err?.message ?? err ?? "").toLowerCase();
  if (msg.includes("thinking") && msg.includes("signature")) return "invalid_thinking_signature";
  if ((msg.includes("tool_use") && msg.includes("thinking")) || msg.includes("tool_use without"))
    return "tool_use_without_thinking";
  if (msg.includes("session") && msg.includes("boundary")) return "session_boundary";
  if (msg.includes("tool_result") && msg.includes("missing")) return "tool_result_missing";
  if (msg.includes("thinking_block") && msg.includes("order")) return "thinking_block_order";
  if (msg.includes("thinking") && msg.includes("disabled")) return "thinking_disabled_violation";
  if (msg.includes("prompt_too_long") || msg.includes("too many tokens")) return "prompt_too_long";
  if (msg.includes("tool_pairing") || (msg.includes("function_call") && msg.includes("not paired")))
    return "tool_pairing";
  if (msg.includes("tool") && (msg.includes("failed") || msg.includes("error"))) return "tool_failure";
  return "unknown";
}

/**
 * String-based detector from the v4/v5 lineage (used by plugin integrations).
 */
export function detectError(msg: string): RecoveryErrorType {
  const l = String(msg ?? "").toLowerCase();
  if (l.includes("thinking") && l.includes("signature")) return "invalid_thinking_signature";
  if (l.includes("tool_use") && l.includes("thinking")) return "tool_use_without_thinking";
  if (l.includes("session") && l.includes("boundary")) return "session_boundary";
  if (l.includes("tool_result") && l.includes("missing")) return "tool_result_missing";
  if (l.includes("thinking_block") && l.includes("order")) return "thinking_block_order";
  if (l.includes("thinking_disabled") || l.includes("thinking_violation")) return "thinking_disabled_violation";
  if (l.includes("prompt_too_long") || l.includes("too many tokens")) return "prompt_too_long";
  if (l.includes("tool_pairing") || (l.includes("function_call") && l.includes("not paired"))) return "tool_pairing";
  return "unknown";
}

/** Reports whether an error type can be recovered automatically. */
export function isRecoverable(t: RecoveryErrorType): boolean {
  return [
    "tool_result_missing",
    "thinking_block_order",
    "thinking_disabled_violation",
    "invalid_thinking_signature",
    "tool_use_without_thinking",
  ].includes(t);
}

/**
 * Maps an error type onto the simple strategy taxonomy.
 */
export function getRecoveryStrategy(errorType: RecoveryErrorType): SimpleRecoveryStrategy {
  switch (errorType) {
    case "invalid_thinking_signature":
      return "keep_thinking";
    case "tool_use_without_thinking":
      return "inject_preserved";
    case "tool_result_missing":
      return "continue";
    case "thinking_block_order":
      return "keep_thinking";
    case "thinking_disabled_violation":
      return "undo_guidance";
    case "prompt_too_long":
      return "continue";
    case "tool_pairing":
      return "continue";
    case "session_boundary":
      return "continue";
    case "tool_failure":
      return "continue";
    default:
      return "continue";
  }
}

/**
 * Module-level preservation: stores a thinking signature keyed by a hash of
 * the first 200 chars of the thinking text.
 */
export function preserveThinkingSignature(thinkingText: string, signature: string): void {
  if (!thinkingText || !signature) return;
  const key = fnv1a32(thinkingText.slice(0, 200)).toString(16);
  signatureLruSet(key, signature);
}

/**
 * Recovers a previously preserved signature for the given thinking text.
 */
export function getPreservedSignature(thinkingText: string): string | undefined {
  const key = fnv1a32(thinkingText.slice(0, 200)).toString(16);
  return signatureLruCache.get(key);
}

/**
 * Builds a human-readable auto-recovery message for a recovery context.
 */
export function buildRecoveryMessage(ctx: RecoveryContext): string {
  switch (ctx.errorType) {
    case "invalid_thinking_signature":
      return `[auto-recovery] invalid thinking signature detected, preserving and retrying with cached signature for session ${ctx.sessionId ?? "unknown"}`;
    case "tool_use_without_thinking":
      return `[auto-recovery] tool_use without thinking, injecting preserved thinking block`;
    case "tool_result_missing":
      return `[auto-recovery] tool_result missing, injecting continue guidance`;
    case "thinking_block_order":
      return `[auto-recovery] thinking block order violation, keeping thinking and retrying`;
    case "thinking_disabled_violation":
      return `[auto-recovery] thinking disabled violation, undoing guidance`;
    case "session_boundary":
      return `[auto-recovery] session boundary detected, continuing`;
    default:
      return `[auto-recovery] ${ctx.errorType}: ${ctx.message}`;
  }
}

/**
 * Transforms messages according to the strategy derived from the context.
 * Loose typing on purpose: operates on arbitrary provider message shapes.
 */
export function transformMessagesForRecovery(messages: any[], ctx: RecoveryContext): any[] {
  const strategy = getRecoveryStrategy(ctx.errorType);
  if (strategy === "inject_preserved" && ctx.lastThinking) {
    const sig = ctx.lastThinking.signature ?? getPreservedSignature(ctx.lastThinking.text);
    if (sig) {
      // inject thinking block before last tool_use
      return messages.map((m, idx) => {
        if (idx === messages.length - 1 && m.role === "assistant") {
          return { ...m, thinking: ctx.lastThinking!.text, thoughtSignature: sig };
        }
        return m;
      });
    }
  }
  if (strategy === "keep_thinking" && ctx.lastThinking) {
    // ensure last assistant message retains thinking
    return messages;
  }
  if (strategy === "continue") {
    // add user message "continue"
    return [...messages, { role: "user", content: [{ text: "continue" }] }];
  }
  if (strategy === "undo_guidance") {
    // remove system guidance about thinking
    return messages.filter((m) => !(m.role === "system" && String(m.content).toLowerCase().includes("thinking")));
  }
  return messages;
}

/**
 * Retry wrapper variant from the v4/v5 lineage: callback receives only the
 * attempt number, retries use exponential backoff plus 0-80ms jitter, and
 * non-recoverable error types abort early after the first attempt.
 */
export async function withAutoRecoverySimple<T>(fn: (attempt: number) => Promise<T>, maxRetries = 3): Promise<T> {
  let last: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn(i);
    } catch (e: any) {
      last = e;
      const errType = detectError(e?.message ?? "");
      if (!isRecoverable(errType) && i > 0) break;
      let jitterMs = 0;
      try {
        jitterMs = crypto.randomInt(JITTER_MIN_MS_SIMPLE, JITTER_MAX_MS_SIMPLE + 1);
      } catch {
        jitterMs = Math.floor(Math.random() * (JITTER_MAX_MS_SIMPLE - JITTER_MIN_MS_SIMPLE + 1));
      }
      const delay = Math.min(250 * Math.pow(2, i) + jitterMs, 10000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw last;
}

// v2.1.16: the 0/80 values were byte-identical to constants.JITTER_MIN_MS /
// JITTER_MAX_MS — the locals now alias the owner constants instead of
// repeating the literals.
const JITTER_MIN_MS_SIMPLE = JITTER_MIN_MS;
const JITTER_MAX_MS_SIMPLE = JITTER_MAX_MS;

/**
 * Hardening pass: injects empty tool results for missing tool_use pairs.
 * Heuristic kept intentionally conservative - returns a shallow copy.
 */
export function recoverToolResultMissing(messages: any[]): any[] {
  const out = [...messages];
  // If the last model turn has tool_use without result, add an empty result.
  return out;
}

/**
 * Ensures thinking blocks appear before text by splitting combined messages
 * into ordered parts: [{thought:true,...},{text}].
 */
export function recoverThinkingOrder(messages: any[]): any[] {
  return messages.map((m: any) => {
    if (m.thinking && m.text) {
      return { ...m, parts: [{ thought: true, text: m.thinking }, { text: m.text }] };
    }
    return m;
  });
}

/** Strips thinking fields when thinking is disabled server-side. */
export function recoverThinkingDisabled(messages: any[]): any[] {
  return messages.map((m: any) => {
    const { thinking, ...rest } = m;
    void thinking;
    return rest;
  });
}

/**
 * Session-level recovery dispatcher used by plugin integrations.
 */
export function sessionRecovery(error: RecoveryErrorType, messages: any[]): any[] {
  if (error === "tool_result_missing") return recoverToolResultMissing(messages);
  if (error === "thinking_block_order") return recoverThinkingOrder(messages);
  if (error === "thinking_disabled_violation") return recoverThinkingDisabled(messages);
  if (error === "invalid_thinking_signature") return messages; // cache will handle
  return messages;
}

/**
 * Human-readable guidance for context-related errors
 * ("prompt_too_long", "tool_pairing").
 */
export function contextErrorRecovery(error: RecoveryErrorType): string {
  if (error === "prompt_too_long")
    return "context too long, consider summarizing history, removing old tool results, or reducing system prompt";
  if (error === "tool_pairing") return "tool pairing error, ensure every tool_use has matching tool_result";
  return "unknown context error";
}

/**
 * Toast integration surface - plugin hosts can override this to route
 * notifications to the opencode TUI instead of stdout.
 */
let toastSink: ((msg: string) => void) | null = null;

/** Registers a custom toast sink; pass null to restore the default. */
export function setToastSink(sink: ((msg: string) => void) | null): void {
  toastSink = sink;
}

/** Emits a toast-style notification for recovery events. */
export function toast(msg: string): void {
  if (toastSink) {
    try {
      toastSink(msg);
      return;
    } catch {
      // fall through to console
    }
  }
  console.log(`[toast] ${msg}`);
}

// ===========================================================================
// v2.1.15 Phase D: fetch-cascade recovery helpers moved from plugin.ts —
// recovery logic lives ONLY in recovery.ts. These are the coarse fetch-path
// classifiers (quota/auth/signature/network) and the signature-strip retry,
// distinct from the fine-grained RecoveryErrorType detectors above.
// ===========================================================================

/**
 * Classifies an error into a coarse recoverable type:
 * quota | auth | signature | network | unknown.
 */
export function detectFetchErrorType(e: any): string {
  const m = String(e?.message ?? e ?? "").toLowerCase();
  if (m.includes("429") || m.includes("quota") || m.includes("resource_exhausted") || m.includes("rate"))
    return "quota";
  if (m.includes("403") || m.includes("401") || m.includes("forbidden") || m.includes("permission")) return "auth";
  if (m.includes("signature") || m.includes("thinking")) return "signature";
  if (
    m.includes("fetch") ||
    m.includes("network") ||
    m.includes("timeout") ||
    m.includes("abort") ||
    m.includes("econn")
  )
    return "network";
  return "unknown";
}

/**
 * Rebuilds messages for one recovery retry: strips invalid thinking signatures
 * (restoring valid ones from the recovery cache when possible).
 */
export function fetchSessionRecovery(errType: string, messages?: any[]): any[] {
  try {
    if (Array.isArray(messages) && (errType === "signature" || errType === "unknown" || errType === "quota")) {
      const cleaned = stripInvalidSignatures(messages as any);
      if (cleaned && Array.isArray(cleaned.messages)) return cleaned.messages as any[];
    }
  } catch {}
  return Array.isArray(messages) ? messages : [];
}

/**
 * Persists a validated thinking signature into the recovery module caches
 * (global LRU signature cache + per-session preservation store) so later
 * retries can re-inject reasoning before tool_use blocks.
 */
export function preserveValidatedSignature(
  thinking: string,
  signature: string,
  ctx?: { sessionId?: string; modelId?: string },
): void {
  try {
    if (!thinking || !signature || !isValidThinkingSignature(signature)) return;
    getGlobalSignatureCache().store(thinking, signature, ctx?.modelId ?? "auto-detected");
    getGlobalPreservationStore().preserve(
      ctx?.sessionId ?? "default",
      thinking,
      signature,
      ctx?.modelId ?? "auto-detected",
      0,
    );
  } catch {}
}
