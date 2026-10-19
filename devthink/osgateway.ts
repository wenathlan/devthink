/**
 * osgateway.ts — client of the working AI gateway: POST
 * /v1/chat/completions · body { model: "devthink", messages } · standard
 * OpenAI answer (choices[0].message.content + reasoning_content). Named
 * osgateway to avoid clashing with the Sol workbench gateway.ts. Zero
 * network outside this module — everything is client-first.
 *
 * Retry wiring: the fetch round runs through retrybackoff.ts — failures
 * classified as transient (network, 408/425/429, 5xx) retry with exponential
 * backoff + jitter, and the server's Retry-After hint wins over the curve.
 * Default `retries` is 0, which preserves the historical one-shot contract;
 * opt in per call with `retries`.
 */

import { parseRetryAfterMs, RetryableError, retryWithBackoff } from "./retrybackoff.ts";

export type GatewayRole = "system" | "user" | "assistant";
export type GatewayMessage = { role: GatewayRole; content: string };

export type GatewayReply = {
  content: string;
  reasoning?: string;
  model?: string;
};

type ApiResponse = {
  choices?: Array<{
    message?: { role?: string; content?: string | null; reasoning_content?: string | null };
  }>;
  error?: { message?: string };
};

/**
 * gatewayChat — one chat round on the local gateway. Default timeout of
 * 60s via AbortController; errors propagate to the chat (toast + retry)
 * — nothing fails silently.
 *
 * @param messages the conversation messages.
 * @param opts the optional gateway base, model, timeout and abort signal —
 *   an empty base talks to the same origin (the local gateway); a configured
 *   base points the client at a deployed gateway of the family. `retries`
 *   (default 0) adds retrybackoff rounds for transient failures, honoring
 *   Retry-After.
 * @returns the gateway reply.
 */
export async function gatewayChat(
  messages: GatewayMessage[],
  opts?: { base?: string; model?: string; timeoutMs?: number; signal?: AbortSignal; retries?: number }
): Promise<GatewayReply> {
  const timeoutMs = opts?.timeoutMs ?? 60_000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  // when the caller passed a signal, chain the external abort
  const onExternalAbort = () => ctrl.abort();
  opts?.signal?.addEventListener("abort", onExternalAbort);

  /* the endpoint rides the configured base when the caller set one (the
   * deployed gateway of the family) and stays same-origin otherwise. */
  const base = (opts?.base ?? "").trim().replace(/\/+$/, "");
  const endpoint = `${base}/v1/chat/completions`;
  const body = JSON.stringify({ model: opts?.model ?? "devthink", messages });

  try {
    return await retryWithBackoff(
      async () => {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          signal: ctrl.signal,
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          throw new RetryableError(
            `gateway ${res.status}${detail ? ` — ${detail.slice(0, 140)}` : ""}`,
            res.status,
            parseRetryAfterMs(res.headers.get("retry-after")),
          );
        }

        const json = (await res.json()) as ApiResponse;
        if (json.error?.message) throw new Error(json.error.message);
        const msg = json.choices?.[0]?.message;
        const content = msg?.content ?? "";
        if (!content.trim()) throw new Error("the gateway answered with an empty body");
        return {
          content,
          reasoning: msg?.reasoning_content ?? undefined,
          model: typeof (json as { model?: string }).model === "string" ? (json as { model: string }).model : undefined,
        };
      },
      { config: { maxRetries: Math.max(0, opts?.retries ?? 0) }, signal: ctrl.signal },
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("the gateway timed out before answering (60s)");
    }
    throw err instanceof Error ? err : new Error(String(err));
  } finally {
    clearTimeout(timer);
    opts?.signal?.removeEventListener("abort", onExternalAbort);
  }
}

/* ---------------------------------------------------------------------- */
/* streaming — the SSE reader of the gateway contract                      */
/* ---------------------------------------------------------------------- */

/**
 * The thinking level header of the gateway — the pill maps here, the budget
 * rides server-side (none minimal low medium high xhigh max, default high).
 */
export type ThinkingLevel = "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

/** Progressive deltas of a streaming round — reasoning arrives first. */
export type StreamHandlers = {
  onReasoning?: (delta: string) => void;
  onContent?: (delta: string) => void;
};

/**
 * gatewayChatStream — one chat round over the SSE contract. The gateway
 * re-emits reasoning deltas before content and closes with one [DONE]; this
 * reader parses frames on the double-newline boundary (never a partial
 * frame), discards heartbeat lines starting with `:`, and folds every delta
 * into the handlers as it lands. Falls back to the JSON round when the
 * response is not an event stream (the honest degradation: same contract,
 * one code path on the caller).
 *
 * @param messages the conversation messages.
 * @param opts base/model/timeout/abort plus sessionId (x-session-id header,
 *   the rotation context lives on it) and thinkingLevel (x-thinking-level).
 * @returns the final reply with the folded content and reasoning.
 */
export async function gatewayChatStream(
  messages: GatewayMessage[],
  opts?: {
    base?: string;
    model?: string;
    sessionId?: string;
    thinkingLevel?: ThinkingLevel;
    timeoutMs?: number;
    signal?: AbortSignal;
    handlers?: StreamHandlers;
  },
): Promise<GatewayReply> {
  const timeoutMs = opts?.timeoutMs ?? 120_000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const onExternalAbort = () => ctrl.abort();
  opts?.signal?.addEventListener("abort", onExternalAbort);

  const base = (opts?.base ?? "").trim().replace(/\/+$/, "");
  const endpoint = `${base}/v1/chat/completions`;
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "text/event-stream" };
  if (opts?.sessionId) headers["x-session-id"] = opts.sessionId;
  if (opts?.thinkingLevel) headers["x-thinking-level"] = opts.thinkingLevel;
  const body = JSON.stringify({ model: opts?.model ?? "devthink", messages, stream: true });

  try {
    const res = await fetch(endpoint, { method: "POST", headers, body, signal: ctrl.signal });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`gateway ${res.status}${detail ? ` — ${detail.slice(0, 140)}` : ""}`);
    }
    const ctype = res.headers.get("content-type") ?? "";
    // not an event stream — degrade to the json contract
    if (!ctype.includes("text/event-stream") || !res.body) {
      const json = (await res.json()) as ApiResponse;
      const msg = json.choices?.[0]?.message;
      if (json.error?.message) throw new Error(json.error.message);
      return {
        content: msg?.content ?? "",
        reasoning: msg?.reasoning_content ?? undefined,
        model: typeof (json as { model?: string }).model === "string" ? (json as { model: string }).model : undefined,
      };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    let reasoning = "";
    let model: string | undefined;

    // one SSE frame at a time — the double-newline boundary, never partial
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf("\n\n");
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue; // heartbeats and comments discarded
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const chunk = JSON.parse(payload) as {
              model?: string;
              choices?: Array<{ delta?: { content?: string | null; reasoning_content?: string | null } }>;
            };
            if (typeof chunk.model === "string") model = chunk.model;
            const delta = chunk.choices?.[0]?.delta;
            const r = delta?.reasoning_content;
            if (typeof r === "string" && r) {
              reasoning += r;
              opts?.handlers?.onReasoning?.(r);
            }
            const c = delta?.content;
            if (typeof c === "string" && c) {
              content += c;
              opts?.handlers?.onContent?.(c);
            }
          } catch {
            /* a malformed frame never breaks the round */
          }
        }
      }
    }
    if (!content.trim()) throw new Error("the gateway stream closed with an empty body");
    return { content, reasoning: reasoning || undefined, model };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("the gateway timed out before answering (120s)");
    }
    throw err instanceof Error ? err : new Error(String(err));
  } finally {
    clearTimeout(timer);
    opts?.signal?.removeEventListener("abort", onExternalAbort);
  }
}
