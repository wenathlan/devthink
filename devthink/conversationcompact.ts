/**
 * conversationcompact.ts — history compaction for the house, the two-layer
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

import type { Validator } from "./Sol/os/use.stored.state";
import { estimateHistoryTokens, type TokenWeights } from "./tokenestimate";

/* ------------------------------ validators ---------------------------- */
/* the use.stored.state grammar: type-guards the persisted session data    */
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
  /** Estimator weights (see tokenestimate.ts). */
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
