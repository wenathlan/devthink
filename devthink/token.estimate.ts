/**
 * token.estimate.ts — context budgeting for the house: an honest,
 * dependency-free token estimator. There is no tokenizer on the client, so the
 * estimate is a characters-per-token approximation with per-script weights —
 * the strategy jan ships in its llamacpp extension (`estimateTokensFromText`,
 * chars-per-token) and its agent compaction (`estimate_token_count`: chars/4
 * plus a per-message envelope). Weights by script keep CJK honest: one CJK
 * glyph costs far more than one Latin character, and a flat chars/4 rule
 * under-budgets an Asian-language chat by a factor of three.
 *
 * Pure TypeScript, node + browser, zero DOM. Used by conversation.compact.ts
 * for the preflight trigger and available to any surface that needs to show
 * or enforce a context budget.
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
