/**
 * sessions.ts — the session store domain of getry (root layer).
 *
 * the per-(sessionId, provider) rotation state the gateway keeps for the
 * devthink meta-model: one row per session and provider, carrying the
 * rotation index, the thinking budget and the context window math. the
 * rows below are the in-memory seed of the site DB: the self-hosted
 * database (see schema.prisma, the SessionContext kind) serves them over
 * HTTPS and the static build falls back to this seed without ever
 * touching the visitor machine.
 */

/** one session context row of the gateway. */
export type SessionContextRow = {
  id: string;
  sessionId: string;
  provider: string;
  route?: string | null;
  model?: string | null;
  modelVariant?: string | null;
  messageCount: number;
  lastMessageAt?: string | null;
  contextWindow?: number | null;
  rotationIndex: number;
  thinkingLevel?: string | null;
  thinkingBudget?: number | null;
  thinkingEnabled: boolean;
  updatedAt: string;
};

/** the in-memory seed the DB layer persists on first run. */
export const SESSIONSEED: SessionContextRow[] = [
  { id: "ctx-01", sessionId: "chat-9f21", provider: "zai", route: "/v1/chat/completions", model: "devthink", modelVariant: "glm-5.3-flash", messageCount: 6, lastMessageAt: "2026-09-30T14:02:11.000Z", contextWindow: 200000, rotationIndex: 0, thinkingLevel: "high", thinkingBudget: 68000, thinkingEnabled: true, updatedAt: "2026-09-30T14:02:11.000Z" },
  { id: "ctx-02", sessionId: "chat-4c07", provider: "nvidia", route: "/v3/chat/completions", model: "devthink", modelVariant: "deepseek-v4", messageCount: 12, lastMessageAt: "2026-09-30T14:07:41.000Z", contextWindow: 163840, rotationIndex: 2, thinkingLevel: "medium", thinkingBudget: 17000, thinkingEnabled: true, updatedAt: "2026-09-30T14:07:41.000Z" },
  { id: "ctx-03", sessionId: "chat-b5e3", provider: "free", route: "/v4/chat/completions", model: "devthink", modelVariant: null, messageCount: 3, lastMessageAt: "2026-09-30T12:44:02.000Z", contextWindow: 131072, rotationIndex: 0, thinkingLevel: "low", thinkingBudget: 5500, thinkingEnabled: true, updatedAt: "2026-09-30T12:44:02.000Z" },
  { id: "ctx-04", sessionId: "chat-e88a", provider: "openrouter", route: "/v5/chat/completions", model: "devthink", modelVariant: null, messageCount: 9, lastMessageAt: "2026-09-29T21:15:56.000Z", contextWindow: 131072, rotationIndex: 1, thinkingLevel: "high", thinkingBudget: 68000, thinkingEnabled: true, updatedAt: "2026-09-29T21:15:56.000Z" },
  { id: "ctx-05", sessionId: "chat-1d99", provider: "babeltown", route: "/v2/chat/completions", model: "babel-glm-5.2", modelVariant: null, messageCount: 0, lastMessageAt: null, contextWindow: 131072, rotationIndex: 0, thinkingLevel: null, thinkingBudget: null, thinkingEnabled: false, updatedAt: "2026-09-28T09:30:00.000Z" },
];

/** the meta model rotates to the next key every this many messages. */
export const ROTATIONEVERY = 6;

/** fetch budget for the HTTPS answer of the self-hosted DB. */
const fetchbudget = 2500;

/** the in-memory answer cache for the document lifetime (no storage). */
let sessionscache: SessionContextRow[] | null = null;

/**
 * lists the session contexts: asks the self-hosted DB over HTTPS first
 * and falls back to the in-memory seed when the endpoint is absent
 * (static build). never touches the visitor machine.
 *
 * @returns the session context rows.
 */
export async function listsessions(): Promise<SessionContextRow[]> {
  if (sessionscache) return sessionscache;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), fetchbudget);
    const response = await fetch("/api/v1/sessions", { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`sessions answered ${response.status}`);
    const rows = (await response.json()) as SessionContextRow[];
    sessionscache = rows;
    return rows;
  } catch {
    return SESSIONSEED;
  }
}

/**
 * advances the rotation index by the messages a session exchanged with
 * the meta model (the devthink model rotates every ROTATIONEVERY turns).
 *
 * @param context the session context to advance.
 * @returns the rotation index the session sits on now.
 */
export function rotationindex(context: SessionContextRow): number {
  return Math.floor(context.messageCount / ROTATIONEVERY) + context.rotationIndex;
}

/**
 * orders the sessions by the last message, freshest first; sessions
 * that never answered keep their seed order at the end.
 *
 * @param rows the session rows to order.
 * @returns the ordered rows.
 */
export function freshestfirst(rows: SessionContextRow[]): SessionContextRow[] {
  return [...rows].sort((left, right) => {
    if (!left.lastMessageAt) return 1;
    if (!right.lastMessageAt) return -1;
    return right.lastMessageAt.localeCompare(left.lastMessageAt);
  });
}

/**
 * computes the share of the context window a session already spent.
 *
 * @param context the session context to measure.
 * @returns the used share as a 0-100 percentage.
 */
export function contextshare(context: SessionContextRow): number {
  if (!context.contextWindow || context.messageCount === 0) return 0;
  const spent = context.messageCount * ROTATIONEVERY * 512;
  return Math.min(100, Math.round((spent / context.contextWindow) * 100));
}
