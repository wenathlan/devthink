/**
 * db.ts — the database contract of the gateway (root layer).
 *
 * schema.prisma describes the four kinds the gateway lanes consume
 * (ChatMessage, ApiKey, SessionContext, TownKey) with the family sync
 * contract: identity pointers are text, counts are 32-bit ints, time is
 * datetime or iso text. the self-hosted deploy answers those rows over
 * HTTPS through the Prisma 7 client with the libsql adapter; this module
 * carries the typed rows, the small typed in-memory seeds and the HTTPS
 * accessors the static interface calls — the visitor machine stores
 * nothing and falls back to the seeds when the endpoint is absent.
 */

/** fetch budget for the HTTPS answers of the self-hosted DB. */
const fetchbudget = 2500;

/** one logged gateway request/response (the ChatMessage kind). */
export type ChatMessageRow = {
  id: string;
  chatId: string;
  chatSubId?: string | null;
  provider: string;
  route: string;
  model: string;
  role: "user" | "assistant" | "system";
  content: string;
  reasoningContent?: string | null;
  ip?: string | null;
  keyId?: string | null;
  finishReason?: string | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  durationMs?: number | null;
  createdAt: string;
};

/** one registered provider key (the ApiKey kind). */
export type ApiKeyRow = {
  id: string;
  provider: string;
  key: string;
  label?: string | null;
  active: boolean;
  status: "active" | "revoked" | "expired";
  useCount: number;
  rotationCount: number;
  errorCount: number;
  rateLimitHit: boolean;
  createdAt: string;
  expiresAt?: string | null;
};

/** one ephemeral IP-bound Babel key (the TownKey kind, 60min expiry). */
export type TownKeyRow = {
  id: string;
  key: string;
  ip?: string | null;
  ua?: string | null;
  active: boolean;
  createdAt: string;
  expiresAt: string;
};

/** masks a provider key the way the /keys routes answer it. */
export function maskkey(key: string): string {
  if (key.length <= 12) return `${key.slice(0, 4)}****`;
  return `${key.slice(0, 8)}****${key.slice(-4)}`;
}

/**
 * SECURITY: the seed rows carry masked demo placeholders — no real provider
 * credential is stored in the repository. each value is read from the
 * environment when present (GETRY_SEED_KEY_01 … GETRY_SEED_KEY_05) and
 * falls back to a non-credential-shaped demo id, so the committed sources
 * never embed a provider token shape (no nvapi-/sk- literals).
 *
 * @param slot zero-padded seed slot of the key row.
 * @returns the environment-provided placeholder or the demo fallback.
 */
function seedkey(slot: string): string {
  const name = `GETRY_SEED_KEY_${slot}`;
  const fromenv =
    typeof process !== "undefined" && process.env ? process.env[name] : undefined;
  return fromenv ?? `demo-gateway-key-${slot}`;
}

/** the in-memory key seed the static build serves (masked on render). */
export const KEYSEED: ApiKeyRow[] = [
  { id: "key-01", provider: "nvidia", key: seedkey("01"), label: "nim rotation 01", active: true, status: "active", useCount: 412, rotationCount: 18, errorCount: 0, rateLimitHit: false, createdAt: "2026-09-12T10:00:00.000Z", expiresAt: null },
  { id: "key-02", provider: "nvidia", key: seedkey("02"), label: "nim rotation 02", active: true, status: "active", useCount: 388, rotationCount: 18, errorCount: 1, rateLimitHit: false, createdAt: "2026-09-12T10:05:00.000Z", expiresAt: null },
  { id: "key-03", provider: "nvidia", key: seedkey("03"), label: "nim rotation 03", active: true, status: "active", useCount: 401, rotationCount: 18, errorCount: 0, rateLimitHit: true, createdAt: "2026-09-12T10:10:00.000Z", expiresAt: null },
  { id: "key-04", provider: "zai", key: seedkey("04"), label: "sdk internal", active: true, status: "active", useCount: 0, rotationCount: 0, errorCount: 0, rateLimitHit: false, createdAt: "2026-09-12T10:15:00.000Z", expiresAt: null },
  { id: "key-05", provider: "openrouter", key: seedkey("05"), label: "free tier", active: true, status: "active", useCount: 97, rotationCount: 2, errorCount: 0, rateLimitHit: false, createdAt: "2026-09-20T08:00:00.000Z", expiresAt: null },
];

/** the in-memory chat log seed the static build serves. */
export const MESSAGESEED: ChatMessageRow[] = [
  { id: "msg-01", chatId: "chat-9f21", provider: "zai", route: "/v1/chat/completions", model: "devthink", role: "user", content: "ping the gateway", ip: null, keyId: null, finishReason: "stop", promptTokens: 12, completionTokens: 26, totalTokens: 38, durationMs: 742, createdAt: "2026-09-30T14:02:11.000Z" },
  { id: "msg-02", chatId: "chat-9f21", provider: "zai", route: "/v1/chat/completions", model: "devthink", role: "assistant", content: "gateway alive, v1 answered with session id and usage", reasoningContent: "decided to answer directly, no tool call needed", ip: null, keyId: null, finishReason: "stop", promptTokens: 12, completionTokens: 26, totalTokens: 38, durationMs: 742, createdAt: "2026-09-30T14:02:11.742Z" },
  { id: "msg-03", chatId: "chat-4c07", provider: "nvidia", route: "/v3/chat/completions", model: "devthink", role: "user", content: "summarize the rotation state", ip: null, keyId: "key-02", finishReason: "stop", promptTokens: 18, completionTokens: 41, totalTokens: 59, durationMs: 1187, createdAt: "2026-09-30T14:07:40.000Z" },
  { id: "msg-04", chatId: "chat-4c07", provider: "nvidia", route: "/v3/chat/completions", model: "devthink", role: "assistant", content: "22 keys in round robin, the meta model rotates every 6 messages", reasoningContent: "read the rotation index before answering", ip: null, keyId: "key-02", finishReason: "stop", promptTokens: 18, completionTokens: 41, totalTokens: 59, durationMs: 1187, createdAt: "2026-09-30T14:07:41.187Z" },
];

/** the in-memory answer cache for the document lifetime (no storage). */
let keyscache: ApiKeyRow[] | null = null;
let messagescache: ChatMessageRow[] | null = null;

/**
 * lists the registered provider keys: asks the self-hosted DB over HTTPS
 * first and falls back to the in-memory seed when the endpoint is absent
 * (static build). never touches the visitor machine.
 *
 * @returns the key rows.
 */
export async function listkeys(): Promise<ApiKeyRow[]> {
  if (keyscache) return keyscache;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), fetchbudget);
    const response = await fetch("/api/v1/keys", { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`keys answered ${response.status}`);
    const rows = (await response.json()) as ApiKeyRow[];
    keyscache = rows;
    return rows;
  } catch {
    return KEYSEED;
  }
}

/**
 * lists the recent gateway chat log entries (bound to no chat id).
 *
 * @returns the message rows, newest last.
 */
export async function listmessages(): Promise<ChatMessageRow[]> {
  if (messagescache) return messagescache;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), fetchbudget);
    const response = await fetch("/api/v1/messages", { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`messages answered ${response.status}`);
    const rows = (await response.json()) as ChatMessageRow[];
    messagescache = rows;
    return rows;
  } catch {
    return MESSAGESEED;
  }
}

/**
 * summarizes the rotation state of one provider key pool.
 *
 * @param keys the key rows to summarize.
 * @returns the active, rotating and erroring key counts.
 */
export function rotationsummary(keys: ApiKeyRow[]): { active: number; rotating: number; erroring: number } {
  return {
    active: keys.filter((key) => key.active && key.status === "active").length,
    rotating: keys.filter((key) => key.rotationCount > 0).length,
    erroring: keys.filter((key) => key.errorCount > 0).length,
  };
}
