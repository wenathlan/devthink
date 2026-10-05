/**
 * os.gateway.ts — client of the working AI gateway: POST
 * /v1/chat/completions · body { model: "devthink", messages } · standard
 * OpenAI answer (choices[0].message.content + reasoning_content). Named
 * os.gateway to avoid clashing with the Sol workbench gateway.ts. Zero
 * network outside this module — everything is client-first.
 *
 * Retry wiring: the fetch round runs through retry.backoff.ts — failures
 * classified as transient (network, 408/425/429, 5xx) retry with exponential
 * backoff + jitter, and the server's Retry-After hint wins over the curve.
 * Default `retries` is 0, which preserves the historical one-shot contract;
 * opt in per call with `retries`.
 */

import { parseRetryAfterMs, RetryableError, retryWithBackoff } from "./retry.backoff";

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
 *   (default 0) adds retry.backoff rounds for transient failures, honoring
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
