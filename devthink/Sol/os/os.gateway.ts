/**
 * os.gateway.ts — client of the working AI gateway: POST
 * /v1/chat/completions · body { model: "devthink", messages } · standard
 * OpenAI answer (choices[0].message.content + reasoning_content). Named
 * os.gateway to avoid clashing with the Sol workbench gateway.ts. Zero
 * network outside this module — everything is client-first.
 */

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
 * @param opts the optional model, timeout and abort signal.
 * @returns the gateway reply.
 */
export async function gatewayChat(
  messages: GatewayMessage[],
  opts?: { model?: string; timeoutMs?: number; signal?: AbortSignal }
): Promise<GatewayReply> {
  const timeoutMs = opts?.timeoutMs ?? 60_000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  // when the caller passed a signal, chain the external abort
  const onExternalAbort = () => ctrl.abort();
  opts?.signal?.addEventListener("abort", onExternalAbort);

  try {
    const res = await fetch("/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: opts?.model ?? "devthink", messages }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`gateway ${res.status}${detail ? ` — ${detail.slice(0, 140)}` : ""}`);
    }

    const json = (await res.json()) as ApiResponse;
    if (json.error?.message) throw new Error(json.error.message);
    const msg = json.choices?.[0]?.message;
    const content = msg?.content ?? "";
    if (!content.trim()) throw new Error("resposta vazia do gateway");
    return {
      content,
      reasoning: msg?.reasoning_content ?? undefined,
      model: typeof (json as { model?: string }).model === "string" ? (json as { model: string }).model : undefined,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("tempo esgotado esperando o gateway (60s)");
    }
    throw err instanceof Error ? err : new Error(String(err));
  } finally {
    clearTimeout(timer);
    opts?.signal?.removeEventListener("abort", onExternalAbort);
  }
}
