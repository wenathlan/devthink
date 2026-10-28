/**
 * queue.ts — the ONE keyed file of the queue family (root layer).
 *
 * The owner's law: every family of correlated logic lives in one keyed file
 * with a name that says the family. This file carries the whole request/queue
 * lineage of the platform — the bounded request queue, the retry backoff,
 * the token estimation, the conversation compaction, the resilient SSE
 * parsing and the id minting — merged from six root modules
 * (requestqueue.ts, retrybackoff.ts, tokenestimate.ts,
 * conversationcompact.ts, sse.ts, ids.ts) with every export preserved under
 * the same name and signature, the member files deleted (no shims, no
 * indirection) and every importer repointed here. No cross-member helper
 * twins existed — each private helper below (clampDelay, isCjk, the queue
 * Entry, the id alphabet) survives exactly once — and the one inter-member
 * import (conversationcompact → tokenestimate) is now an internal reference
 * between §3 and §4 of this file.
 *
 * The one deliberate exclusion: core.ts stays the base layer of its own
 * twelve-importer seam — it is not part of this family and is not absorbed
 * here.
 *
 * @section 1  requestqueue — the bounded request queue of the outbound calls
 * @section 2  retrybackoff — the retry discipline: backoff, jitter, Retry-After
 * @section 3  tokenestimate — the honest per-script token estimator
 * @section 4  conversationcompact — the two-layer history compaction
 * @section 5  sse — the canonical resilient SSE parser
 * @section 6  ids — the compact lowercase id minter
 */

import type { Validator } from "./usestoredstate.ts";

/* ============================================================================
 * @section 1 — requestqueue: the bounded request queue of the outbound calls.
 * ========================================================================== */

/**
 * requestqueue — the request queue of the house: bounded concurrency,
 * priority ordering, cancellation of both queued and running work. Every
 * entry carries its own AbortController, so a task is written once and works
 * unchanged whether it runs immediately, waits in the queue or is cancelled
 * mid-flight. Pure TypeScript, node + browser (AbortController + Promise
 * only), zero DOM.
 *
 * Shape validated against the houses' existing swarm taskqueue (lanes and
 * claims live there; this section is the client-side gate for outbound
 * chat/agent requests that must not stampede the local gateway).
 */

/** Thrown when a queued task is cancelled before it starts. */
export class QueueCancelledError extends Error {
  constructor(message = "the request was cancelled while still queued") {
    super(message);
    this.name = "QueueCancelledError";
  }
}

/** The unit of work: receives the task's own abort signal. */
export type QueueTask<T> = (signal: AbortSignal) => Promise<T>;

export type QueueHandle<T> = {
  /** The queue-assigned id (caller-supplied when unique). */
  id: string;
  /** Resolves with the task result; rejects with QueueCancelledError when
   * cancelled while queued, or with the task's own error otherwise. */
  done: Promise<T>;
  /**
   * Cancels the task. Still queued: removed and `done` rejects with
   * QueueCancelledError. Already running: the abort signal fires and `done`
   * settles with the task's abort outcome.
   *
   * @returns true when the task was still queued and got removed.
   */
  cancel(): boolean;
};

export type RequestQueue<T> = {
  readonly concurrency: number;
  /** Enqueues a task. Higher priority runs first; ties stay FIFO. */
  enqueue(task: QueueTask<T>, opts?: { priority?: number; id?: string }): QueueHandle<T>;
  /** Cancels queued and running tasks; the queue drains to empty. */
  cancelAll(): void;
  /** Cancels only still-queued tasks; running ones finish. */
  clearQueued(): void;
  /** Counts at this instant. */
  stats(): { queued: number; running: number };
  /** Resolves when no task is queued or running. */
  waitIdle(): Promise<void>;
};

type Entry<T> = {
  id: string;
  priority: number;
  seq: number;
  task: QueueTask<T>;
  controller: AbortController;
  resolve: (value: T) => void;
  reject: (err: unknown) => void;
  settled: boolean;
};

let queueSeq = 0;

/**
 * createRequestQueue — builds the queue.
 *
 * @typeParam T the task result type.
 * @param opts.concurrency how many tasks run at once (1–16, default 1).
 * @returns the queue.
 */
export function createRequestQueue<T>(opts: { concurrency?: number } = {}): RequestQueue<T> {
  const concurrency = Math.min(Math.max(Math.floor(opts.concurrency ?? 1), 1), 16);
  const waiting: Array<Entry<T>> = [];
  const running = new Set<Entry<T>>();
  const idleWaiters: Array<() => void> = [];

  const isIdle = (): boolean => waiting.length === 0 && running.size === 0;

  const settle = (entry: Entry<T>, value: T): void => {
    if (entry.settled) return;
    entry.settled = true;
    entry.resolve(value);
  };
  const fail = (entry: Entry<T>, err: unknown): void => {
    if (entry.settled) return;
    entry.settled = true;
    entry.reject(err);
  };

  const pump = (): void => {
    while (running.size < concurrency && waiting.length > 0) {
      // highest priority first; ties in FIFO order (stable: lowest seq wins)
      let best = 0;
      for (let i = 1; i < waiting.length; i++) {
        if (waiting[i].priority > waiting[best].priority) best = i;
      }
      const entry = waiting.splice(best, 1)[0];
      running.add(entry);
      entry
        .task(entry.controller.signal)
        .then((value) => settle(entry, value))
        .catch((err: unknown) => fail(entry, err))
        .finally(() => {
          running.delete(entry);
          if (isIdle()) {
            for (const waiter of idleWaiters) waiter();
            idleWaiters.length = 0;
          }
          pump();
        });
    }
    if (isIdle()) {
      for (const waiter of idleWaiters) waiter();
      idleWaiters.length = 0;
    }
  };

  const cancelEntry = (entry: Entry<T>): boolean => {
    const idx = waiting.indexOf(entry);
    if (idx >= 0) {
      waiting.splice(idx, 1);
      fail(entry, new QueueCancelledError(`the request ${entry.id} was cancelled while still queued`));
      return true;
    }
    if (running.has(entry)) {
      entry.controller.abort();
      return false;
    }
    return false;
  };

  return {
    concurrency,
    enqueue(task, entryOpts = {}) {
      let resolve: (value: T) => void = () => {};
      let reject: (err: unknown) => void = () => {};
      const done = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      const entry: Entry<T> = {
        id: entryOpts.id ?? `q-${queueSeq++}`,
        priority: entryOpts.priority ?? 0,
        seq: queueSeq++,
        task,
        controller: new AbortController(),
        resolve,
        reject,
        settled: false,
      };
      waiting.push(entry);
      pump();
      return { id: entry.id, done, cancel: () => cancelEntry(entry) };
    },
    cancelAll() {
      for (const entry of [...waiting, ...running]) cancelEntry(entry);
      waiting.length = 0;
    },
    clearQueued() {
      for (const entry of [...waiting]) cancelEntry(entry);
    },
    stats() {
      return { queued: waiting.length, running: running.size };
    },
    waitIdle() {
      if (isIdle()) return Promise.resolve();
      return new Promise<void>((resolve) => idleWaiters.push(resolve));
    },
  };
}

/* ============================================================================
 * @section 2 — retrybackoff: the retry discipline of the outbound calls.
 * ========================================================================== */

/**
 * retrybackoff — the retry discipline of the house: exponential backoff
 * with jitter, a `Retry-After` fast path and a retryable-error classification.
 * The shape is lifted from goose's provider retry (goose-provider-types
 * retry.rs + http_status.rs): max 3 attempts, 1s doubling to a 30s cap, ±20%
 * jitter to avoid the thundering herd, and the server's `Retry-After` hint
 * always wins over the computed delay. Pure TypeScript, node + browser.
 *
 * Consumers: osgateway.ts wraps its fetch round with `retryWithBackoff`; any
 * other house fetch may do the same. By default unknown errors are NOT
 * retried — only explicitly classified failures are, so a bug never turns
 * into a storm.
 */

/** Retry policy knobs. */
export type RetryConfig = {
  /** Retry attempts AFTER the first try (3 = up to 4 total executions). */
  maxRetries: number;
  /** Delay before the first retry, in milliseconds. */
  initialIntervalMs: number;
  /** Multiplier applied per attempt (exponential). */
  backoffMultiplier: number;
  /** Upper bound for any computed delay, before jitter, in milliseconds. */
  maxIntervalMs: number;
  /** ± ratio applied to the computed delay (0.2 = delay between 80% and 120%). */
  jitterRatio: number;
};

/** goose's defaults: 3 retries, 1s × 2.0 capped at 30s, ±20% jitter. */
export const RETRY_DEFAULTS: RetryConfig = {
  maxRetries: 3,
  initialIntervalMs: 1_000,
  backoffMultiplier: 2,
  maxIntervalMs: 30_000,
  jitterRatio: 0.2,
};

/**
 * RetryableError — a failure that carries its HTTP classification so the
 * retry loop can decide. Status 0 means "no HTTP answer at all" (network
 * failure, connection reset) and is always retryable.
 */
export class RetryableError extends Error {
  constructor(
    message: string,
    /** The HTTP status, or 0 for a transport-level failure. */
    readonly status: number,
    /** Server hint from `Retry-After`, in milliseconds, when advertised. */
    readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "RetryableError";
  }
}

/**
 * isAbortError — whether the error came from an aborted fetch/signal.
 *
 * @param err the thrown value.
 */
export function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

/**
 * isRetryableStatus — the transient set: transport failure, request timeout
 * (408), too early (425), rate limit (429) and every 5xx. Any other 4xx is a
 * deterministic client error: retrying it can never succeed.
 *
 * @param status the HTTP status, 0 for transport failures.
 */
export function isRetryableStatus(status: number): boolean {
  if (status === 0) return true;
  return status === 408 || status === 425 || status === 429 || (status >= 500 && status <= 599);
}

/**
 * parseRetryAfterMs — the `Retry-After` header per RFC 7231 §7.1.3: either a
 * non-negative integer of seconds or an HTTP-date. A date already in the past
 * answers 0 ("retry now") rather than falling back to backoff — clock skew
 * plus network latency commonly lands a near-now date a second behind.
 *
 * @param value the raw header value (null/undefined when absent).
 * @param now the reference clock, overridable for tests.
 * @param maxDelayMs the clamp applied to the parsed delay (2 minutes default).
 * @returns the delay in milliseconds, or undefined when the header is absent
 *   or unparseable.
 */
export function parseRetryAfterMs(value: string | null | undefined, now = Date.now(), maxDelayMs = 120_000): number | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  if (/^\d+$/.test(raw)) return clampDelay(Number.parseInt(raw, 10) * 1_000, maxDelayMs);
  const target = Date.parse(raw);
  if (!Number.isFinite(target)) return undefined;
  return clampDelay(target - now, maxDelayMs);
}

function clampDelay(ms: number, maxDelayMs: number): number {
  return Math.min(Math.max(Math.round(ms), 0), maxDelayMs);
}

/**
 * delayForAttempt — the backoff curve. Attempt 0 answers 0 (the first try
 * runs immediately); attempt n answers `initialIntervalMs × multiplier^(n-1)`
 * capped at `maxIntervalMs`, then jittered ±`jitterRatio`.
 *
 * @param config the retry policy.
 * @param attempt the zero-based attempt number the delay precedes.
 * @returns the delay in milliseconds (never negative).
 */
export function delayForAttempt(config: RetryConfig, attempt: number): number {
  if (attempt <= 0) return 0;
  const base = Math.min(config.initialIntervalMs * config.backoffMultiplier ** (attempt - 1), config.maxIntervalMs);
  const jitter = 1 + (2 * Math.random() - 1) * Math.min(Math.max(config.jitterRatio, 0), 1);
  return Math.max(0, Math.round(base * jitter));
}

/**
 * sleepMs — an abortable timer that works on node and in the browser.
 *
 * @param ms how long to wait.
 * @param signal an optional external abort signal — aborting rejects with the
 *   signal's reason instead of waiting.
 */
export function sleepMs(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason instanceof Error ? signal.reason : new Error("aborted"));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason instanceof Error ? signal.reason : new Error("aborted"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export type RetryOptions = {
  /** Partial override over {@link RETRY_DEFAULTS}. */
  config?: Partial<RetryConfig>;
  /** External abort — honored between attempts and during the backoff sleep. */
  signal?: AbortSignal;
  /**
   * Custom verdict: return true to retry the failure, false to rethrow it.
   * When absent, only {@link RetryableError} with a retryable status retries.
   */
  shouldRetry?: (err: unknown, status: number) => boolean;
  /** Progress hook fired before every wait (attempt starts at 1). */
  onRetry?: (info: { attempt: number; delayMs: number; error: unknown }) => void;
};

/**
 * retryWithBackoff — runs `attempt`, retrying classified transient failures
 * with exponential backoff and jitter. When the failure advertises
 * `Retry-After` (via {@link RetryableError.retryAfterMs}) that delay wins over
 * the computed curve. Abort errors always propagate immediately.
 *
 * @typeParam T the attempt result.
 * @param attempt the operation; called again from scratch on every retry.
 * @param opts the optional policy, abort signal, verdict and progress hooks.
 * @returns the first successful result.
 * @throws the last error when retries are exhausted or the failure is not
 *   retryable.
 */
export async function retryWithBackoff<T>(attempt: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const config: RetryConfig = { ...RETRY_DEFAULTS, ...opts.config };
  let lastError: unknown;
  for (let attemptNo = 0; attemptNo <= config.maxRetries; attemptNo++) {
    try {
      return await attempt();
    } catch (err) {
      lastError = err;
      if (isAbortError(err)) throw err;
      const status = err instanceof RetryableError ? err.status : -1;
      const retry = opts.shouldRetry ? opts.shouldRetry(err, status) : err instanceof RetryableError && isRetryableStatus(status);
      if (!retry || attemptNo >= config.maxRetries) throw err;
      const hint = err instanceof RetryableError && err.retryAfterMs !== undefined ? err.retryAfterMs : undefined;
      const delayMs = hint ?? delayForAttempt(config, attemptNo + 1);
      opts.onRetry?.({ attempt: attemptNo + 1, delayMs, error: err });
      await sleepMs(delayMs, opts.signal);
    }
  }
  throw lastError;
}

/* ============================================================================
 * @section 3 — tokenestimate: the honest per-script token estimator.
 * ========================================================================== */

/**
 * tokenestimate — context budgeting for the house: an honest,
 * dependency-free token estimator. There is no tokenizer on the client, so the
 * estimate is a characters-per-token approximation with per-script weights —
 * the strategy jan ships in its llamacpp extension (`estimateTokensFromText`,
 * chars-per-token) and its agent compaction (`estimate_token_count`: chars/4
 * plus a per-message envelope). Weights by script keep CJK honest: one CJK
 * glyph costs far more than one Latin character, and a flat chars/4 rule
 * under-budgets an Asian-language chat by a factor of three.
 *
 * Pure TypeScript, node + browser, zero DOM. Used by the conversation
 * compaction (§4) for the preflight trigger and available to any surface
 * that needs to show or enforce a context budget.
 */

/** Characters per token, per script family. Lower = costlier text. */
export type TokenWeights = {
  /** Latin text (English, Spanish, …). The usual OpenAI accounting value. */
  latin: number;
  /** CJK ideographs, kana and hangul. */
  cjk: number;
  /** Cyrillic text. */
  cyrillic: number;
  /** Everything else (Arabic, Devanagari, symbols…). */
  other: number;
};

/** The house defaults: Latin 4 chars/token, CJK 1.5, Cyrillic 2.5, other 3.5. */
export const DEFAULT_TOKEN_WEIGHTS: TokenWeights = { latin: 4, cjk: 1.5, cyrillic: 2.5, other: 3.5 };

/** Per-message envelope tokens (role, delimiters) — the OpenAI constant jan uses. */
export const TOKENS_PER_MESSAGE = 4;

const isCjk = (cp: number): boolean =>
  (cp >= 0x3040 && cp <= 0x30ff) || // hiragana + katakana
  (cp >= 0x3400 && cp <= 0x4dbf) || // CJK extension A
  (cp >= 0x4e00 && cp <= 0x9fff) || // CJK unified ideographs
  (cp >= 0xac00 && cp <= 0xd7af) || // hangul syllables
  (cp >= 0xf900 && cp <= 0xfaff) || // CJK compatibility ideographs
  (cp >= 0xff66 && cp <= 0xff9d) || // halfwidth katakana
  cp === 0x3000 || // ideographic space
  (cp >= 0x3001 && cp <= 0x303f); // CJK punctuation

const isCyrillic = (cp: number): boolean => cp >= 0x0400 && cp <= 0x04ff;

const isLatin = (cp: number): boolean =>
  (cp >= 0x0020 && cp <= 0x024f) || // basic latin, latin-1 supplement, extended A/B
  (cp >= 0x1e00 && cp <= 0x1eff); // latin extended additional

/**
 * estimateTokens — the token estimate of one text, script-aware.
 *
 * @param text the text to estimate.
 * @param weights the per-script chars-per-token weights (defaults for the house).
 * @returns at least 1 token for any non-empty input; 0 for empty text.
 */
export function estimateTokens(text: string, weights: TokenWeights = DEFAULT_TOKEN_WEIGHTS): number {
  if (text.length === 0) return 0;
  let latin = 0;
  let cjk = 0;
  let cyrillic = 0;
  let other = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (isCjk(cp)) cjk++;
    else if (isCyrillic(cp)) cyrillic++;
    else if (isLatin(cp)) latin++;
    else other++;
  }
  const tokens = latin / weights.latin + cjk / weights.cjk + cyrillic / weights.cyrillic + other / weights.other;
  return Math.max(1, Math.ceil(tokens));
}

/** A minimal chat message for budgeting purposes. */
export type BudgetMessage = { role: string; content: string };

/**
 * estimateMessageTokens — one message on the wire: content plus the
 * per-message envelope.
 *
 * @param message the message to estimate.
 * @param weights the per-script weights.
 */
export function estimateMessageTokens(message: BudgetMessage, weights: TokenWeights = DEFAULT_TOKEN_WEIGHTS): number {
  return TOKENS_PER_MESSAGE + estimateTokens(message.content, weights);
}

/**
 * estimateHistoryTokens — the whole conversation budget, envelope included.
 * This is jan's `estimate_token_count` (chars/4 + 4/message) generalized by
 * script weights, and the number the compaction preflight compares against
 * the context window.
 *
 * @param messages the conversation history.
 * @param weights the per-script weights.
 */
export function estimateHistoryTokens(messages: readonly BudgetMessage[], weights: TokenWeights = DEFAULT_TOKEN_WEIGHTS): number {
  let total = 0;
  for (const message of messages) total += estimateMessageTokens(message, weights);
  return total;
}

/**
 * truncateToTokenBudget — the longest prefix of `text` that fits the budget
 * (jan's util of the same name, script-aware). The cut lands on the last
 * whitespace when one is close, so words are not split mid-token.
 *
 * @param text the text to truncate.
 * @param budgetTokens the maximum estimated tokens.
 * @param weights the per-script weights.
 * @returns the truncated text (the original when it already fits).
 */
export function truncateToTokenBudget(text: string, budgetTokens: number, weights: TokenWeights = DEFAULT_TOKEN_WEIGHTS): string {
  if (budgetTokens <= 0) return "";
  if (estimateTokens(text, weights) <= budgetTokens) return text;
  // effective chars-per-token of THIS text, used to land near the cut in one step
  const effective = Math.max(1, Math.round(text.length / Math.max(1, estimateTokens(text, weights))));
  const approx = Math.max(0, Math.floor(budgetTokens * effective));
  let cut = Math.min(approx, text.length);
  while (cut > 0 && estimateTokens(text.slice(0, cut), weights) > budgetTokens) cut = Math.floor(cut * 0.9);
  if (cut === 0) return "";
  const space = text.lastIndexOf(" ", cut);
  if (space > cut * 0.5) cut = space;
  return text.slice(0, cut).trimEnd();
}

/**
 * formatCompactTokenCount — compact UI notation for token counts (openhands'
 * formatter): `940`, `198.5k`, `1.0M`. The k-to-M promotion keeps 999_999
 * from rendering as the four-digit `1000.0k`.
 *
 * @param value the token count.
 */
export function formatCompactTokenCount(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions >= 10 && Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    if (Number.isInteger(thousands)) return `${thousands.toFixed(0)}k`;
    const rounded = thousands.toFixed(1);
    if (Number(rounded) >= 1_000) return `${(Number(rounded) / 1_000).toFixed(1)}M`;
    return `${rounded}k`;
  }
  return value.toLocaleString();
}

/**
 * contextWindowUsagePercent — how full the context window is, clamped to
 * 0–100 (openhands' `getContextWindowUsagePercentage`). An unknown window
 * (zero or negative) answers 0 rather than inventing a share.
 *
 * @param used the estimated tokens about to be sent.
 * @param contextWindow the model's window, in tokens.
 */
export function contextWindowUsagePercent(used: number, contextWindow: number): number {
  if (contextWindow <= 0) return 0;
  return Math.min(100, (used / contextWindow) * 100);
}

/* ============================================================================
 * @section 4 — conversationcompact: the two-layer history compaction.
 * ========================================================================== */

/**
 * conversationcompact — history compaction for the house, the two-layer
 * strategy jan ships in its agent compaction (jan compaction.rs): BEFORE a
 * dispatch the estimated history is compared against the context window and,
 * past the trigger, the conversation is compacted at a boundary the client
 * chose. The shape of a compaction: keep the leading system block, the
 * conversation's first user turn (the goal) and a recent tail verbatim;
 * summarize the dropped middle through an injected summarizer; splice the
 * summary back as a marked system message. If summarization fails, the middle
 * is replaced by a short note — the run always makes forward progress.
 *
 * Previously-compacted summaries are recognized by their marker and never
 * dropped again, so compaction is stable across turns. Pure TypeScript,
 * node + browser, zero DOM — the summarizer is injected, never owned here.
 */

/* ------------------------------ validators ---------------------------- */
/* the usestoredstate grammar: type-guards the persisted session data     */
/* must pass before it is trusted.                                         */

export type CompactRole = "system" | "user" | "assistant";
export type CompactMessage = { role: CompactRole; content: string };

export const isCompactRole: Validator<CompactRole> = (v): v is CompactRole =>
  v === "system" || v === "user" || v === "assistant";

export const isCompactMessage: Validator<CompactMessage> = (v): v is CompactMessage => {
  if (typeof v !== "object" || v === null) return false;
  const m = v as Record<string, unknown>;
  return isCompactRole(m.role) && typeof m.content === "string";
};

export const isCompactMessageList: Validator<CompactMessage[]> = (v): v is CompactMessage[] =>
  Array.isArray(v) && v.every(isCompactMessage);

/* ------------------------------- constants ---------------------------- */

/** Prefix carried by every compaction summary — the marker jan uses so a
 * summary is recognized and preserved by the NEXT compaction. */
export const SUMMARY_MARKER = "[Summary of earlier conversation, condensed to save context]";

/** The note replacing the middle when no summarizer is available or it fails. */
export const FALLBACK_NOTE = "[Earlier conversation was omitted to fit the model's context window.]";

/** Most-recent messages kept verbatim (jan's DEFAULT_KEEP_RECENT). */
export const DEFAULT_KEEP_RECENT = 8;

/** Share of the context window a prompt may fill before compacting. */
export const DEFAULT_COMPACTION_RATIO = 0.8;

const RATIO_MIN = 0.1;
const RATIO_MAX = 0.99;

/**
 * isCompactionSummary — whether the message is a summary this module produced.
 * Summaries are protected input: compacting twice must not re-summarize (and
 * shrink) an already condensed brief.
 *
 * @param message the message to test.
 */
export function isCompactionSummary(message: CompactMessage): boolean {
  return message.role === "system" && message.content.startsWith(SUMMARY_MARKER);
}

/**
 * summaryMessage — the system message a summary travels in, marker included.
 *
 * @param summary the summary body.
 */
export function summaryMessage(summary: string): CompactMessage {
  return { role: "system", content: `${SUMMARY_MARKER} ${summary}` };
}

/**
 * triggerTokens — the prompt size at which a preflight compaction fires: the
 * window times the ratio, with the ratio clamped to [0.10, 0.99] (outside the
 * clamp a run compacts every turn, or never) and a non-finite ratio falling
 * back to the default.
 *
 * @param contextWindow the model window, in tokens.
 * @param ratio the fill share allowed before compacting.
 */
export function triggerTokens(contextWindow: number, ratio: number = DEFAULT_COMPACTION_RATIO): number {
  const safe = Number.isFinite(ratio) ? Math.min(Math.max(ratio, RATIO_MIN), RATIO_MAX) : DEFAULT_COMPACTION_RATIO;
  return Math.max(0, Math.floor(contextWindow * safe));
}

/* -------------------------------- planning ---------------------------- */

export type CompactPlan = {
  /** Protected verbatim: leading system block, summaries, first user turn. */
  head: CompactMessage[];
  /** Messages dropped and handed to the summarizer. Empty = nothing to do. */
  middle: CompactMessage[];
  /** Recent tail kept verbatim, original order. */
  tail: CompactMessage[];
};

export type PlanOptions = {
  /** How many recent messages stay verbatim (default {@link DEFAULT_KEEP_RECENT}). */
  keepRecent?: number;
  /** Keep the conversation's first user turn verbatim (default true). */
  keepFirstUser?: boolean;
};

/**
 * planCompact — the pure boundary decision: which messages stay, which go.
 * A plan whose `middle` is empty is a no-op.
 *
 * @param messages the conversation history, in order.
 * @param opts the boundary options.
 */
export function planCompact(messages: readonly CompactMessage[], opts: PlanOptions = {}): CompactPlan {
  const keepRecent = Math.max(0, opts.keepRecent ?? DEFAULT_KEEP_RECENT);
  const keepFirstUser = opts.keepFirstUser ?? true;

  // the leading system block is always protected
  let bodyStart = 0;
  while (bodyStart < messages.length && messages[bodyStart].role === "system") bodyStart++;
  const protectedIdx = new Set<number>();
  for (let i = 0; i < bodyStart; i++) protectedIdx.add(i);

  // the first user turn (the goal) and every earlier summary are protected
  let firstUserSeen = false;
  for (let i = bodyStart; i < messages.length; i++) {
    if (messages[i].role === "user") {
      if (keepFirstUser && !firstUserSeen) protectedIdx.add(i);
      firstUserSeen = true;
    }
    if (isCompactionSummary(messages[i])) protectedIdx.add(i);
  }

  // the newest keepRecent droppable messages stay verbatim
  const tailIdx = new Set<number>();
  let toKeep = keepRecent;
  for (let i = messages.length - 1; i >= bodyStart && toKeep > 0; i--) {
    if (!protectedIdx.has(i)) {
      tailIdx.add(i);
      toKeep--;
    }
  }

  const head: CompactMessage[] = [];
  const tail: CompactMessage[] = [];
  const middle: CompactMessage[] = [];
  for (let i = 0; i < messages.length; i++) {
    if (protectedIdx.has(i)) head.push(messages[i]);
    else if (tailIdx.has(i)) tail.push(messages[i]);
    else middle.push(messages[i]);
  }
  return { head, middle, tail };
}

/* ------------------------------- execution ---------------------------- */

export type CompactOptions = PlanOptions & {
  /** Async summarizer for the dropped middle; its failure uses the fallback. */
  summarize?: (middle: CompactMessage[]) => Promise<string> | string;
  /** Note used when no summarizer is given or it throws. */
  fallbackNote?: string;
  /** Preflight layer: skip compaction while the history fits this window. */
  contextWindow?: number;
  /** Fill share allowed before the preflight fires (default 0.8). */
  ratio?: number;
  /** Estimator weights (see the tokenestimate section). */
  weights?: TokenWeights;
};

export type CompactResult = {
  /** The compacted conversation (the input, untouched, when not compacted). */
  messages: CompactMessage[];
  /** Whether any message was actually dropped. */
  compacted: boolean;
  tokensBefore: number;
  tokensAfter: number;
};

/**
 * compactConversation — plan, summarize, splice. Layer one is the preflight:
 * with a `contextWindow`, a history under the trigger is returned untouched.
 * Layer two is the boundary plan itself: an already-short history has no
 * droppable middle and is returned untouched. A summarizer failure degrades
 * to the fallback note instead of failing the turn.
 *
 * @param messages the conversation history, in order.
 * @param opts the compaction options.
 */
export async function compactConversation(
  messages: readonly CompactMessage[],
  opts: CompactOptions = {},
): Promise<CompactResult> {
  const tokensBefore = estimateHistoryTokens(messages, opts.weights);
  if (opts.contextWindow !== undefined && tokensBefore <= triggerTokens(opts.contextWindow, opts.ratio)) {
    return { messages: [...messages], compacted: false, tokensBefore, tokensAfter: tokensBefore };
  }
  const plan = planCompact(messages, opts);
  if (plan.middle.length === 0) {
    return { messages: [...messages], compacted: false, tokensBefore, tokensAfter: tokensBefore };
  }
  let summary = opts.fallbackNote ?? FALLBACK_NOTE;
  if (opts.summarize) {
    try {
      const produced = await opts.summarize(plan.middle);
      if (typeof produced === "string" && produced.trim() !== "") summary = produced;
    } catch {
      // the summarizer is best-effort: the fallback note keeps the run going
    }
  }
  const compacted = [...plan.head, summaryMessage(summary), ...plan.tail];
  const tokensAfter = estimateHistoryTokens(compacted, opts.weights);
  return { messages: compacted, compacted: true, tokensBefore, tokensAfter };
}

/* ============================================================================
 * @section 5 — sse: the canonical resilient SSE parser.
 * ========================================================================== */

/**
 * sse — the canonical SSE parser of the house: a stateful,
 * incremental reader that survives network splits (a frame cut in half by a
 * chunk boundary), CRLF/LF/CR terminators, multi `data:` lines, `id:`/`retry:`
 * fields, comment lines and the OpenAI `[DONE]` sentinel. Pure TypeScript,
 * node + browser, zero DOM — the caller owns the byte stream and only feeds
 * decoded strings.
 *
 * Strategy extracted from the competitors: jan's chat transport feeds a
 * buffered reader and only dispatches complete frames; goose's providers
 * consume an event stream that never trusts a chunk boundary. This section is
 * the single shared implementation — the legacy copy inside home.tsx was
 * extracted into the standalone sse.ts and every consumer of the parser now
 * answers from this one file (the Sol panel's own import retired with its
 * later rewrite — zero duplication stands).
 *
 * The parser never throws on malformed input: it skips what it cannot use and
 * records typed issues. JSON decoding is explicit (`jsonDataOf`) so callers
 * choose between resilient and strict.
 */

/** The OpenAI streaming sentinel that closes a chat-completions stream. */
export const SSE_DONE = "[DONE]" as const;

/** One complete Server-Sent Event frame. */
export type SseFrame = {
  /** The `event:` field, empty string when the frame carries none. */
  event: string;
  /** Every `data:` line joined with `\n` per the SSE spec. */
  data: string;
  /** The last `id:` field seen on the frame, when present. */
  id?: string;
  /** The reconnection hint from `retry:`, in milliseconds, when valid. */
  retry?: number;
};

/** A malformed piece of input the parser skipped instead of throwing. */
export type SseIssue = {
  code: "bad-retry" | "unknown-field";
  /** The offending raw line, trimmed. */
  line: string;
};

/** Thrown by `jsonDataOf` when a frame payload is not valid JSON. */
export class SseDataError extends Error {
  constructor(
    message: string,
    /** The raw payload that failed to decode. */
    readonly payload: string,
  ) {
    super(message);
    this.name = "SseDataError";
  }
}

export type SseParser = {
  /** Feeds one network chunk and returns every frame it completes. */
  feed(chunk: string): SseFrame[];
  /** At end of stream, emits a trailing frame left without a blank line. */
  flush(): SseFrame[];
  /** Drops buffered partial input and issues. */
  reset(): void;
  /** Typed notes about input skipped so far. */
  readonly issues: readonly SseIssue[];
};

/**
 * createSseParser — the stateful core. Feed chunks as they arrive; a frame
 * split across any number of chunks is delivered once, exactly whole.
 *
 * @returns an incremental SSE parser.
 */
export function createSseParser(): SseParser {
  let buffer = "";
  let seenBom = false;
  const issueLog: SseIssue[] = [];
  let pending: { event: string; data: string[]; id?: string; retry?: number } | null = null;

  const dispatch = (): SseFrame | null => {
    const frame = pending;
    pending = null;
    if (!frame || (frame.event === "" && frame.data.length === 0 && frame.id === undefined)) return null;
    const out: SseFrame = { event: frame.event, data: frame.data.join("\n") };
    if (frame.id !== undefined) out.id = frame.id;
    if (frame.retry !== undefined) out.retry = frame.retry;
    return out;
  };

  const handleLine = (line: string): SseFrame | null => {
    if (line === "") return dispatch();
    if (line.startsWith(":")) return null; // SSE comment — heartbeat keepalive
    const colon = line.indexOf(":");
    if (colon < 0) {
      issueLog.push({ code: "unknown-field", line: line.trim() });
      return null;
    }
    const field = line.slice(0, colon);
    // the spec strips ONE optional leading space after the colon
    let value = line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") {
      pending ??= { event: "", data: [] };
      pending.event = value;
    } else if (field === "data") {
      pending ??= { event: "", data: [] };
      pending.data.push(value);
    } else if (field === "id") {
      pending ??= { event: "", data: [] };
      pending.id = value;
    } else if (field === "retry") {
      const ms = Number.parseInt(value, 10);
      if (Number.isInteger(ms) && ms >= 0) {
        pending ??= { event: "", data: [] };
        pending.retry = ms;
      } else {
        issueLog.push({ code: "bad-retry", line: line.trim() });
      }
    } else {
      issueLog.push({ code: "unknown-field", line: line.trim() });
    }
    return null;
  };

  /** Splits complete lines on CRLF, LF or CR. A trailing lone `\r` is held —
   * it may be the first half of a CRLF arriving in the next chunk. */
  const extractLines = (): string[] => {
    const lines: string[] = [];
    let start = 0;
    const terminators = /\r\n|\n|\r/g;
    for (let match = terminators.exec(buffer); match !== null; match = terminators.exec(buffer)) {
      if (match[0] === "\r" && match.index === buffer.length - 1) break;
      lines.push(buffer.slice(start, match.index));
      start = match.index + match[0].length;
    }
    buffer = buffer.slice(start);
    return lines;
  };

  return {
    feed(chunk) {
      if (!seenBom) {
        // a UTF-8 BOM at stream start is not part of the first field name
        buffer = chunk.replace(/^\uFEFF/, "");
        seenBom = true;
      } else {
        buffer += chunk;
      }
      const frames: SseFrame[] = [];
      for (const line of extractLines()) {
        const frame = handleLine(line);
        if (frame) frames.push(frame);
      }
      return frames;
    },
    flush() {
      // a gateway that forgot the final blank line still gets its frame
      let rest = buffer;
      buffer = "";
      if (rest.endsWith("\r")) rest = rest.slice(0, -1);
      const frames: SseFrame[] = [];
      if (rest !== "") {
        for (const line of rest.split(/\r\n|\n|\r/)) {
          const frame = handleLine(line);
          if (frame) frames.push(frame);
        }
      }
      const last = dispatch();
      if (last) frames.push(last);
      return frames;
    },
    reset() {
      buffer = "";
      seenBom = false;
      pending = null;
      issueLog.length = 0;
    },
    get issues() {
      return issueLog;
    },
  };
}

/**
 * parseSseChunk — stateless convenience for text known to be complete
 * (tests, replayed fixtures). For live network streams prefer `createSseParser`.
 *
 * @param chunk the complete SSE text.
 * @returns every frame found, in order.
 */
export function parseSseChunk(chunk: string): SseFrame[] {
  const parser = createSseParser();
  const frames = parser.feed(chunk);
  return [...frames, ...parser.flush()];
}

/**
 * isDoneFrame — whether the frame is the OpenAI `[DONE]` sentinel.
 *
 * @param frame the frame to test.
 */
export function isDoneFrame(frame: SseFrame): boolean {
  return frame.data.trim() === SSE_DONE;
}

/**
 * jsonDataOf — strict JSON decode of a frame payload with a typed error.
 *
 * @typeParam T the expected decoded shape.
 * @param frame the frame carrying the payload.
 * @returns the decoded value.
 * @throws SseDataError when the payload is not valid JSON.
 */
export function jsonDataOf<T>(frame: SseFrame): T {
  try {
    return JSON.parse(frame.data) as T;
  } catch {
    throw new SseDataError(`the SSE frame payload is not valid JSON (${frame.data.slice(0, 60)}…)`, frame.data);
  }
}

/** The typed event shape the Sol workbench streams carry: `event:` + JSON `data:`. */
export type SseEvent<T = Record<string, unknown>> = { type: string; data: T };

/**
 * sseEvents — the drop-in extraction of the parser that used to live inside
 * Sol/panel/panel.tsx: every frame that carries both an `event:` name and a
 * JSON `data:` payload. Frames without either, and payloads that fail to
 * decode, are skipped (the stream keeps flowing) — same contract, now backed
 * by the canonical resilient core.
 *
 * @param chunk a complete slice of SSE text (between blank-line boundaries).
 * @returns the decoded events in order.
 */
export function sseEvents<T = Record<string, unknown>>(chunk: string): SseEvent<T>[] {
  const out: SseEvent<T>[] = [];
  for (const frame of parseSseChunk(chunk)) {
    if (frame.event === "" || frame.data === "") continue;
    try {
      out.push({ type: frame.event, data: JSON.parse(frame.data) as T });
    } catch {
      // malformed payload: skip, never break the stream
    }
  }
  return out;
}

/* ============================================================================
 * @section 6 — ids: the compact lowercase id minter.
 * ========================================================================== */

/**
 * ids — DevThink identity contract: compact, lowercase, URL-safe identifiers
 * for new local records.
 */
const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
const tokenLength = 10;

/** Generates a 50-bit compact suffix that avoids ambiguous characters. */
export function compactToken(): string {
  // the webcrypto well: getRandomValues answers in every browser and every
  // node since 19 — the node:crypto import the browser graph must never ride
  const bytes = new Uint8Array(tokenLength);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value & 31]).join("");
}

/** Creates a short identifier such as `s_1e9k2m7v3q`; existing longer IDs remain valid inputs. */
export function createCompactId(prefix: string): string {
  const normalized =
    prefix
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 4) || "id";
  return `${normalized}_${compactToken()}`;
}

/** Identifies the compact format without rejecting existing legacy identifiers. */
export function isCompactId(value: string): boolean {
  return /^[a-z0-9]{1,4}_[0123456789abcdefghjkmnpqrstvwxyz]{10}$/.test(value);
}
