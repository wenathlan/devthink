/**
 * utils — shared helpers for v1 v5 gateway replica
 * all identifiers lowercase no underscore no emoji per skill
 * related logics grouped in this one file 0 to 95 logics
 */

import { randomInt } from "node:crypto";

/** cors headers — open cors for all gateway routes */
export const corsheaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods":
    "get,post,put,patch,delete,head,options,connect,trace,propfind,proppatch,mkcol,copy,move,lock,unlock,search,purge,link,unlink,report,checkout,checkin,checkout,version-control,label,merge,baseline-control,mkactivity,mkworkspace,update,subscribe,unsubscribe,notify,poll,bind,rebind,unbind,reindex",
  "access-control-allow-headers":
    "content-type,authorization,x-token,x-chat-id,x-user-id,x-session-id,x-request-id,x-thinking-level,x-model,x-tools,accept",
  "access-control-max-age": "86400",
  "access-control-expose-headers": "x-request-id,x-session-id",
};

/** content type constants */
export const ctjson = "application/json";
export const ctsse = "text/event-stream";
export const ctplain = "text/plain";
export const ctndjson = "application/x-ndjson";
export const ctoctet = "application/octet-stream";

/** max duration — near infinite 2 power 31 minus 1 */
export const maxdurationconst = 2147483647;

/** default max tokens — conservative per request 32768 */
export const defaultmaxtokens = 32768;

/** randombase36 — cryptographically secure base36 string of n chars
 * node crypto randomint keeps every character uniformly distributed
 * code scanning js insecure randomness safe — never math random */
export function randombase36(n: number): string {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < n; i += 1) out += alphabet[randomInt(alphabet.length)];
  return out;
}

/** securerandom — cryptographically secure uniform float in 0 1
 * replacement for math random in every security sensitive path
 * jitter backoff session ids key selection all use this */
export function securerandom(): number {
  return randomInt(1, 2 ** 48) / 2 ** 48;
}

/** genid — generate a unique chatcmpl id
 * timestamp plus 8 chars of secure base36 entropy */
export function genid(prefix = "chatcmpl"): string {
  return `${prefix}-${Date.now().toString(36)}${randombase36(8)}`;
}

/** getip — extract client ip from request headers */
export function getip(req: Request): string {
  const headers = req.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("x-client-ip") ||
    "unknown"
  );
}

/** handlecors — handle options preflight returns response or null */
export function handlecors(req: Request): Response | null {
  if (req.method.toUpperCase() === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsheaders });
  }
  return null;
}

/** json headers */
export function jsonheaders(): Record<string, string> {
  return { ...corsheaders, "content-type": ctjson };
}

/** detectcontenttype — read accept header returns format */
export function detectcontenttype(req: Request): "sse" | "ndjson" | "json" | "plain" | "octet" {
  const accept = (req.headers.get("accept") || "").toLowerCase();
  if (accept.includes(ctndjson)) return "ndjson";
  if (accept.includes("text/event-stream")) return "sse";
  if (accept.includes(ctplain)) return "plain";
  if (accept.includes(ctoctet)) return "octet";
  return "json";
}

/** clamp — bound a number between min and max
 * only nan falls back: infinity is a boundable value (plus infinity clamps
 * to max minus infinity to min) — treating it like nan silently replaced
 * extreme inputs with the fallback */
export function clamp(n: unknown, min: number, max: number, fallback = 0): number {
  const v = typeof n === "string" ? parseFloat(n) : typeof n === "number" ? n : fallback;
  if (Number.isNaN(v)) return fallback;
  if (!Number.isFinite(v)) return v > 0 ? max : min;
  return Math.max(min, Math.min(max, v));
}

/** automaxtokens — clamp max tokens 1 to 98304 */
export function automaxtokens(n: unknown, fallback = defaultmaxtokens): number {
  const v = typeof n === "string" ? parseInt(n, 10) : typeof n === "number" ? n : fallback;
  if (!Number.isFinite(v) || v === 0) return fallback;
  return clamp(v, 1, 98304, fallback);
}

/** autotemp — clamp temperature 0 to 2 */
export function autotemp(n: unknown, fallback = 0.7): number {
  return clamp(n, 0, 2, fallback);
}

/** autotopp — clamp top p 0 to 1 */
export function autotopp(n: unknown, fallback = 0.9): number {
  return clamp(n, 0, 1, fallback);
}

/** autofrequencypenalty */
export function autofrequencypenalty(n: unknown, fallback = 0): number {
  return clamp(n, -2, 2, fallback);
}

/** autopresencepenalty */
export function autopresencepenalty(n: unknown, fallback = 0): number {
  return clamp(n, -2, 2, fallback);
}

/** auton — clamp n 1 to 10 */
export function auton(n: unknown, fallback = 1): number {
  return clamp(n, 1, 10, fallback);
}

/** autoseed — nonnegative int bounded
 * absolute value floors toward zero: abs before floor — floor before abs
 * rounded negatives away from zero (-12.9 became 13 while 12.9 was 12) */
export function autoseed(n: unknown, fallback = 0): number {
  const v = typeof n === "string" ? parseInt(n, 10) : typeof n === "number" ? n : fallback;
  if (!Number.isFinite(v)) return fallback;
  return clamp(Math.floor(Math.abs(v)), 0, 2147483647, fallback);
}

/** autothinking — normalize thinking level string to canonical 7 level */
export function autothinking(level?: unknown): "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max" {
  if (!level || typeof level !== "string") return "high";
  const l = String(level).toLowerCase().trim();
  if (l in thinkingbudgets) return l as "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
  if (l === "disabled" || l === "off" || l === "false") return "none";
  if (l === "minimum") return "minimal";
  if (l === "med" || l === "mid") return "medium";
  if (l === "extra" || l === "ultra") return "xhigh";
  if (l === "maximum" || l === "full" || l === "all") return "max";
  return "high";
}

/** thinking budgets — 7 level thinking token budgets */
export const thinkingbudgets: Record<string, number> = {
  none: 0,
  minimal: 1400,
  low: 5500,
  medium: 17000,
  high: 68000,
  xhigh: 68000,
  max: 68000,
};

/** thinkingbudget — get token budget for a level */
export function thinkingbudget(level?: string): number {
  return thinkingbudgets[autothinking(level)] ?? 68000;
}

/** makethinker — create a thinking budget object */
export function makethinker(level?: string) {
  const lvl = autothinking(level);
  if (lvl === "none") return { type: "disabled" as const };
  return { type: "enabled" as const, budget: thinkingbudgets[lvl] };
}

/** safestringify — json stringify that never throws */
export function safestringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

/** safejsonparse — json parse that never throws returns null on failure */
export function safejsonparse<T = unknown>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

/** levenshtein — fuzzy string distance for parameter name matching */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/** esttokens — cjk aware token estimate */
export function esttokens(text: string): number {
  if (!text) return 0;
  let ascii = 0;
  let cjk = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) || 0;
    if (code >= 0x3000 && code <= 0x9fff) cjk++;
    else if (code >= 0x4e00 && code <= 0x9fff) cjk++;
    else if (code >= 0xac00 && code <= 0xd7af) cjk++;
    else ascii++;
  }
  return Math.ceil(ascii / 4 + cjk / 2);
}

/** truncatemessages — truncate message history to fit context window */
export function truncatemessages(messages: unknown[], maxtokens: number): unknown[] {
  const result: unknown[] = [];
  let total = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i] as Record<string, unknown>;
    const content = typeof msg.content === "string" ? msg.content : safestringify(msg.content);
    const tokens = esttokens(content) + 4;
    if (total + tokens > maxtokens) break;
    result.unshift(msg);
    total += tokens;
  }
  return result;
}

// the devthink meta-model identity and the intelligencerank interface
// previously lived here as helpers for the deleted gatewayvN.ts files —
// that context now lives exactly once: the type surface in types.ts
// (intelligencerank, modeldef.rank) and the user definitions in
// web/config.ts (one context one file — nothing duplicated in utils)
