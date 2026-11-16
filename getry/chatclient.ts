/**
 * chatclient.ts — the browser chat transport domain of getry (root layer,
 * the file-per-context law): the seat the DevThinkChat surface rides. three
 * concerns live here and nowhere else — the gateway origin resolution (the
 * stored base url the person pins, empty meaning same-origin), the route
 * discovery (the parallel /vN/models probe of the five replicas with per-
 * route latency and status) and the completion lanes (the streaming sse
 * read loop that dispatches reasoning before content — the emission order
 * the gateway promises — beside the non-stream helper the retry lane
 * rides). pure typescript, no react: the screens import the doors, the
 * doors own the wire.
 *
 * the wire contract: POST {origin}/v{N}/chat/completions with stream true,
 * header x-session-id so the six-message rotation binds, thinking level
 * riding the body trio (thinking_level / thinking / reasoning_effort) and
 * the x-thinking-level header; the answer is server-sent events — `data:`
 * lines of openai chunks where delta.reasoning_content arrives first and
 * delta.content after, the final chunk carries usage, `data: [DONE]` ends
 * once — and the exposed headers (x-devthink-model, x-provider,
 * x-devthink-fallback) ride home with the result.
 */

/* ===== block: gateway origin ===== */

/** the localStorage key the pinned origin rides (empty string = same-origin). */
const ORIGINKEY = "getry.gateway.origin";

/**
 * reads the stored gateway origin — "" (same-origin) when nothing was ever
 * pinned or the storage lane is absent.
 *
 * @returns the origin base url, trailing slashes stripped.
 */
export function gatewayorigin(): string {
  if (typeof window === "undefined") return "";
  try {
    const stored = window.localStorage.getItem(ORIGINKEY);
    return typeof stored === "string" ? stored.trim().replace(/\/+$/, "") : "";
  } catch {
    return "";
  }
}

/**
 * validates and persists one gateway origin — an empty value reverts the
 * app to the same-origin lane, a value must parse as an http(s) url (the
 * browser fetch law) or it is refused to "". the stored value returns so
 * the field can show what was actually accepted.
 *
 * @param url the candidate origin ("http://host:port" or "").
 * @returns the origin now stored ("" when the candidate was refused).
 */
export function setgatewayorigin(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  let accepted = "";
  if (trimmed !== "") {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        accepted = parsed.origin;
      }
    } catch {
      /* a value that never parses as a url is refused — same-origin answers */
    }
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ORIGINKEY, accepted);
    } catch {
      /* the storage lane is best effort — the session keeps the value in memory */
    }
  }
  return accepted;
}

/* ===== block: session ids ===== */

/**
 * draws one session id — the uuid the rotation context binds to (the
 * six-message meta-model rotation the gateway keeps per session).
 *
 * @returns a fresh uuid (the crypto lane when present, the drawn fallback otherwise).
 */
export function newsessionid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x3f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/* ===== block: route discovery ===== */

/** the lifecycle a probed route can answer: live, paused (the 503 seat) or error. */
export type DiscoveryStatus = "live" | "paused" | "error";

/** the devthink meta entry a models payload carries — the mask row with its rotation pool. */
export type DevthinkMeta = {
  id: string;
  rotationPool: string[];
  thinkingLevels: Array<{ level: string; budget: number }>;
  contextWindow?: number;
  maxOutput?: number;
  pattern?: string;
};

/** one model row of a discovered catalog: the id plus the window ceilings
 * the payload carries (context_window, max_output). */
export type ModelRow = {
  id: string;
  context?: number;
  output?: number;
};

/** one probed gateway route: the version prefix, its status, its model catalog. */
export type DiscoveryRoute = {
  version: string;
  status: DiscoveryStatus;
  models: ModelRow[];
  meta: DevthinkMeta | null;
  latencyMs: number;
  error?: string;
};

/** the five route prefixes the discovery probes in parallel. */
export const DISCOVERYVERSIONS = ["v1", "v2", "v3", "v4", "v5"] as const;

/** the per-route probe budget in milliseconds. */
const PROBEBUDGET = 4000;

/**
 * parses one openai models payload: the ids of the catalog plus the devthink
 * meta row (rotation pool, thinking levels, window ceilings) when it rides.
 *
 * @param payload the parsed json of a /vN/models answer.
 * @returns the ids and the meta entry (null when the mask row never rode).
 */
function parsemodels(payload: unknown): { models: ModelRow[]; meta: DevthinkMeta | null } {
  const rows =
    payload !== null && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)
      ? (payload as { data: unknown[] }).data
      : [];
  const models: ModelRow[] = [];
  let meta: DevthinkMeta | null = null;
  for (const row of rows) {
    if (row === null || typeof row !== "object") continue;
    const id = (row as { id?: unknown }).id;
    if (typeof id !== "string" || id === "") continue;
    const ceiling = (value: unknown): number | undefined =>
      typeof value === "number" && Number.isFinite(value) ? value : undefined;
    models.push({
      id,
      context: ceiling((row as { context_window?: unknown }).context_window),
      output: ceiling((row as { max_output?: unknown }).max_output),
    });
    if (id === "devthink") meta = parsemeta(row as Record<string, unknown>);
  }
  return { models, meta };
}

/**
 * parses the devthink meta row — tolerant of both thinking-level shapes the
 * routes have answered (the record level→budget and the array of rungs).
 *
 * @param row the meta model row.
 * @returns the meta entry.
 */
function parsemeta(row: Record<string, unknown>): DevthinkMeta {
  const rotationPool = Array.isArray(row.rotation_pool)
    ? row.rotation_pool.filter((entry): entry is string => typeof entry === "string")
    : [];
  const rawLevels = row.thinking_levels;
  let thinkingLevels: Array<{ level: string; budget: number }> = [];
  if (Array.isArray(rawLevels)) {
    thinkingLevels = rawLevels
      .filter((entry): entry is Record<string, unknown> => entry !== null && typeof entry === "object")
      .map((entry) => ({
        level: typeof entry.level === "string" ? entry.level : "",
        budget: typeof entry.budget === "number" && Number.isFinite(entry.budget) ? entry.budget : 0,
      }))
      .filter((rung) => rung.level !== "");
  } else if (rawLevels !== null && typeof rawLevels === "object") {
    thinkingLevels = Object.entries(rawLevels as Record<string, unknown>)
      .map(([level, budget]) => ({
        level,
        budget: typeof budget === "number" && Number.isFinite(budget) ? budget : Number(budget) || 0,
      }))
      .sort((left, right) => left.budget - right.budget);
  }
  const ceiling = (value: unknown): number | undefined =>
    typeof value === "number" && Number.isFinite(value) ? value : undefined;
  return {
    id: "devthink",
    rotationPool,
    thinkingLevels,
    contextWindow: ceiling(row.context_window),
    maxOutput: ceiling(row.max_output),
    pattern: typeof row.pattern === "string" ? row.pattern : undefined,
  };
}

/**
 * probes one route: GET {origin}/{version}/models under the probe budget,
 * 503 answers paused, every other non-ok answers error, ok answers the
 * parsed catalog with the latency of the round trip.
 *
 * @param version the route prefix (v1 through v5).
 * @param origin the gateway origin ("" = same-origin).
 * @returns the probed route row.
 */
async function proberoute(version: string, origin: string): Promise<DiscoveryRoute> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBEBUDGET);
  try {
    const response = await fetch(`${origin}/${version}/models`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    const latencyMs = Date.now() - started;
    if (response.status === 503) {
      return { version, status: "paused", models: [], meta: null, latencyMs };
    }
    if (!response.ok) {
      return {
        version,
        status: "error",
        models: [],
        meta: null,
        latencyMs,
        error: `models answered ${response.status}`,
      };
    }
    const parsed = parsemodels(await response.json());
    return { version, status: "live", ...parsed, latencyMs };
  } catch (error) {
    return {
      version,
      status: "error",
      models: [],
      meta: null,
      latencyMs: Date.now() - started,
      error:
        error instanceof Error && error.name === "AbortError"
          ? "the probe timed out"
          : error instanceof Error
            ? error.message
            : "the route never answered",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * discovers every route in parallel — five probes at once, each under its
 * own budget, so one sleeping lane never delays the board.
 *
 * @param origin the gateway origin (defaults to the stored pin).
 * @returns the five route rows in version order.
 */
export async function discovery(origin: string = gatewayorigin()): Promise<DiscoveryRoute[]> {
  const rows = await Promise.all(DISCOVERYVERSIONS.map((version) => proberoute(version, origin)));
  return rows;
}

/* ===== block: completion lanes ===== */

/** one turn of the conversation history the gateway receives (the full resend law). */
/** one multimodal part of a user turn — the openai wire grammar the gateway
 * routes natively (text first, the images after, the vision-capable models
 * of the pool answer them; text-only lanes degrade them server-side). */
export type ChatPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type ChatTurn = {
  role: "user" | "assistant" | "system";
  /** the turn body — plain prose, or the multimodal parts array when the
   * turn carries images (the studio composer attaches up to four). */
  content: string | ChatPart[];
};

/** the usage row the final chunk carries. */
export type ChatUsage = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

/** the settled result of one completion — the streamed text, the reasoning
 * that preceded it, the usage of the final chunk and the exposed headers. */
export type ChatResult = {
  content: string;
  reasoning: string;
  usage?: ChatUsage;
  model?: string;
  backendModel?: string;
  provider?: string;
  fallback?: string;
  sessionId?: string;
  aborted?: boolean;
};

/** the streaming completion input: the wire shape plus the live callbacks. */
export type StreamChatInput = {
  origin?: string;
  version: string;
  model: string;
  messages: ChatTurn[];
  thinkingLevel?: string;
  temperature?: number;
  sessionId?: string;
  signal?: AbortSignal;
  onDelta?: (chunk: string) => void;
  onReasoning?: (chunk: string) => void;
  onDone?: (result: ChatResult) => void;
  onError?: (error: Error) => void;
};

/** the non-stream completion input: the same wire shape minus the callbacks. */
export type CompleteChatInput = Omit<StreamChatInput, "onDelta" | "onReasoning" | "onDone" | "onError">;

/** reads the usage row of one chunk payload, tolerating absent fields. */
function readusage(raw: unknown): ChatUsage | undefined {
  if (raw === null || typeof raw !== "object") return undefined;
  const row = raw as Record<string, unknown>;
  const count = (value: unknown): number | undefined =>
    typeof value === "number" && Number.isFinite(value) ? value : undefined;
  const usage: ChatUsage = {
    promptTokens: count(row.prompt_tokens),
    completionTokens: count(row.completion_tokens),
    totalTokens: count(row.total_tokens),
  };
  return usage.promptTokens === undefined && usage.completionTokens === undefined && usage.totalTokens === undefined
    ? undefined
    : usage;
}

/** builds the request body of a completion lane (the shared wire shape). */
function requestbody(input: { model: string; messages: ChatTurn[]; stream: boolean; thinkingLevel?: string; temperature?: number; sessionId?: string }): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: input.model,
    messages: input.messages,
    stream: input.stream,
  };
  if (typeof input.thinkingLevel === "string" && input.thinkingLevel !== "") {
    // the trio the routes accept — one of them always lands
    body.thinking_level = input.thinkingLevel;
    body.thinking = input.thinkingLevel;
    body.reasoning_effort = input.thinkingLevel;
  }
  if (typeof input.temperature === "number" && Number.isFinite(input.temperature)) {
    body.temperature = input.temperature;
  }
  if (typeof input.sessionId === "string" && input.sessionId !== "") {
    body.session_id = input.sessionId;
  }
  return body;
}

/** builds the request headers of a completion lane (the session pin rides
 * the header the cors preflight allows — the thinking level rides the body
 * trio instead, the x-thinking-level header is not in the gateway's
 * access-control-allow-headers list so it never leaves the browser). */
function requestheaders(input: { thinkingLevel?: string; sessionId?: string }): Record<string, string> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (typeof input.sessionId === "string" && input.sessionId !== "") headers["x-session-id"] = input.sessionId;
  return headers;
}

/** reads the error reason of a non-ok response body, best effort. */
async function readerror(response: Response): Promise<string> {
  let reason = `the route answered ${response.status}`;
  try {
    const payload: unknown = await response.json();
    if (payload !== null && typeof payload === "object") {
      const row = payload as Record<string, unknown>;
      const error = row.error;
      const message =
        error !== null && typeof error === "object" && typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : typeof error === "string"
            ? error
            : typeof row.message === "string"
              ? row.message
              : "";
      if (message !== "") reason = message;
    }
  } catch {
    /* a body that never parses keeps the status reason */
  }
  return reason;
}

/**
 * the streaming completion: POST /v{N}/chat/completions with stream true,
 * the sse body read through the proper reader — events split on the blank
 * line, `data:` lines parsed safely, delta.reasoning_content dispatched
 * before delta.content (the gateway emission order), usage captured from
 * the final chunk and [DONE] ending the read. an abort keeps the partial
 * answer (the stop button is a save, never an error); a non-ok response
 * and a broken wire answer through onError and reject.
 *
 * @param input the wire shape plus the live callbacks.
 * @returns the settled result — content, reasoning, usage and the exposed headers.
 */
export async function streamchat(input: StreamChatInput): Promise<ChatResult> {
  const origin = input.origin ?? gatewayorigin();
  const response = await fetch(`${origin}/${input.version}/chat/completions`, {
    method: "POST",
    headers: { ...requestheaders(input), accept: "text/event-stream" },
    body: JSON.stringify(requestbody({ ...input, stream: true })),
    signal: input.signal,
  });
  if (!response.ok) {
    const error = new Error(await readerror(response));
    input.onError?.(error);
    throw error;
  }

  const result: ChatResult = {
    content: "",
    reasoning: "",
    model: response.headers.get("x-model") ?? undefined,
    backendModel: response.headers.get("x-devthink-model") ?? undefined,
    provider: response.headers.get("x-provider") ?? undefined,
    fallback: response.headers.get("x-devthink-fallback") ?? undefined,
    sessionId: response.headers.get("x-session-id") ?? undefined,
  };

  /** dispatches the `data:` lines of one event — returns true on [DONE]. */
  const dispatch = (event: string): boolean => {
    for (const line of event.split("\n")) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "") continue;
      if (data === "[DONE]") return true;
      let parsed: unknown;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue; /* a chunk that never parses is skipped, never fatal */
      }
      if (parsed === null || typeof parsed !== "object") continue;
      const choices = (parsed as { choices?: unknown[] }).choices;
      const first = Array.isArray(choices) ? choices[0] : undefined;
      const delta =
        first !== null && typeof first === "object"
          ? (first as { delta?: unknown }).delta
          : undefined;
      if (delta !== null && typeof delta === "object") {
        const row = delta as { reasoning_content?: unknown; content?: unknown };
        if (typeof row.reasoning_content === "string" && row.reasoning_content !== "") {
          result.reasoning += row.reasoning_content;
          input.onReasoning?.(row.reasoning_content);
        }
        if (typeof row.content === "string" && row.content !== "") {
          result.content += row.content;
          input.onDelta?.(row.content);
        }
      }
      const usage = readusage((parsed as { usage?: unknown }).usage);
      if (usage) result.usage = usage;
    }
    return false;
  };

  const reader = response.body?.getReader();
  if (reader) {
    const decoder = new TextDecoder();
    let buffer = "";
    let doneseen = false;
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let cut = buffer.indexOf("\n\n");
        while (cut >= 0) {
          const event = buffer.slice(0, cut);
          buffer = buffer.slice(cut + 2);
          if (dispatch(event)) {
            doneseen = true;
            buffer = "";
            break;
          }
          cut = buffer.indexOf("\n\n");
        }
        if (doneseen) break;
      }
      // a final partial line without its blank line still gets its chance
      if (!doneseen && buffer.trim() !== "") dispatch(buffer);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        result.aborted = true; /* the partial answer stays — the stop is a save */
      } else {
        const failure = error instanceof Error ? error : new Error("the stream broke");
        input.onError?.(failure);
        throw failure;
      }
    }
  }

  input.onDone?.(result);
  return result;
}

/**
 * the non-stream completion: the same wire shape with stream false — the
 * lane the retry/regenerate button rides, answering the whole message at
 * once with its usage and the exposed headers.
 *
 * @param input the wire shape (no callbacks ride).
 * @returns the settled result of the one-shot answer.
 */
export async function completechat(input: CompleteChatInput): Promise<ChatResult> {
  const origin = input.origin ?? gatewayorigin();
  const response = await fetch(`${origin}/${input.version}/chat/completions`, {
    method: "POST",
    headers: requestheaders(input),
    body: JSON.stringify(requestbody({ ...input, stream: false })),
    signal: input.signal,
  });
  if (!response.ok) {
    throw new Error(await readerror(response));
  }
  const payload: unknown = await response.json();
  const result: ChatResult = {
    content: "",
    reasoning: "",
    model: response.headers.get("x-model") ?? undefined,
    backendModel: response.headers.get("x-devthink-model") ?? undefined,
    provider: response.headers.get("x-provider") ?? undefined,
    fallback: response.headers.get("x-devthink-fallback") ?? undefined,
    sessionId: response.headers.get("x-session-id") ?? undefined,
  };
  if (payload !== null && typeof payload === "object") {
    const row = payload as { choices?: unknown[]; usage?: unknown; provider?: unknown; session_id?: unknown };
    const first = Array.isArray(row.choices) ? row.choices[0] : undefined;
    const message =
      first !== null && typeof first === "object" ? (first as { message?: unknown }).message : undefined;
    if (message !== null && typeof message === "object") {
      const content = (message as { content?: unknown }).content;
      const reasoning = (message as { reasoning_content?: unknown }).reasoning_content;
      if (typeof content === "string") result.content = content;
      if (typeof reasoning === "string") result.reasoning = reasoning;
    }
    // the non-stream lane answers the provider and the session on the body
    // (the headers only carry them on the stream contract)
    if (result.provider === undefined && typeof row.provider === "string") result.provider = row.provider;
    if (result.sessionId === undefined && typeof row.session_id === "string") result.sessionId = row.session_id;
    const usage = readusage(row.usage);
    if (usage) result.usage = usage;
  }
  return result;
}
