/* ==========================================================================
   gateway.ts — cliente do gateway de IA já funcionando no app Next:
   POST /v1/chat/completions · body { model: "devthink", messages } ·
   resposta padrão OpenAI (choices[0].message.content + reasoning_content).
   Zero rede fora deste módulo — tudo client-first.
   ========================================================================== */

"use client";

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
 * gatewayChat — uma rodada de chat no gateway local.
 * Timeout padrão 60s via AbortController; erros propagam para o chat
 * (toast + retry) — nada silencioso.
 */
export async function gatewayChat(
  messages: GatewayMessage[],
  opts?: { model?: string; timeoutMs?: number; signal?: AbortSignal }
): Promise<GatewayReply> {
  const timeoutMs = opts?.timeoutMs ?? 60_000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  // se o chamador passou signal, encadeia o abort externo
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
