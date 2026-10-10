/**
 * providers.ts — the chat provider transport of the workbench (root layer).
 *
 * One responsibility: turn a ChatRequest into a provider-specific streaming
 * HTTP call and turn provider answers into a common ChatEvent stream. the
 * PROVIDERS table carries the eleven known provider ids with their base
 * urls, wire protocols (openai / anthropic / google) and the environment
 * variable that feeds their credential — never a literal key. every wire
 * family gets its own header and body builder; errors come back through
 * cleanError which redacts anything credential-shaped before it surfaces.
 * transport retries ride retryDelay backoff (3 attempts, 5xx only).
 */

import { type ProviderProtocol, redactProviderError, retryDelay } from "./compatibility.js";
import { type DevThinkConfig, type DevThinkPaths, resolveCredential } from "./config.js";
import { type ChatEvent, parseEventStream } from "./streaming.js";

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  provider: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number | undefined;
  maxTokens?: number | undefined;
  signal?: AbortSignal | undefined;
};

export type ModelInfo = {
  id: string;
  provider: string;
  contextWindow?: number | undefined;
  supportsStreaming: boolean;
};

type ProviderDefinition = {
  id: string;
  baseUrl?: string;
  protocol: ProviderProtocol;
  env: string;
};

/** The known provider table: id → base url, wire protocol and credential env var. */
const PROVIDERS: ProviderDefinition[] = [
  { id: "openai", baseUrl: "https://api.openai.com/v1", protocol: "openai", env: "OPENAI_API_KEY" },
  { id: "zai", baseUrl: "https://api.z.ai/api/paas/v4", protocol: "openai", env: "ZAI_API_KEY" },
  { id: "openrouter", baseUrl: "https://openrouter.ai/api/v1", protocol: "openai", env: "OPENROUTER_API_KEY" },
  { id: "anthropic", baseUrl: "https://api.anthropic.com", protocol: "anthropic", env: "ANTHROPIC_API_KEY" },
  {
    id: "google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    protocol: "google",
    env: "GEMINI_API_KEY",
  },
  {
    id: "qwen",
    baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    protocol: "openai",
    env: "QWEN_API_KEY",
  },
  { id: "deepseek", baseUrl: "https://api.deepseek.com", protocol: "openai", env: "DEEPSEEK_API_KEY" },
  { id: "groq", baseUrl: "https://api.groq.com/openai/v1", protocol: "openai", env: "GROQ_API_KEY" },
  { id: "mistral", baseUrl: "https://api.mistral.ai/v1", protocol: "openai", env: "MISTRAL_API_KEY" },
  { id: "xai", baseUrl: "https://api.x.ai/v1", protocol: "openai", env: "XAI_API_KEY" },
  { id: "ollama", protocol: "openai", env: "OLLAMA_API_KEY" },
  { id: "mimo", baseUrl: "https://api.xiaomimimo.com/v1", protocol: "openai", env: "MIMO_API_KEY" },
];

/** Finds one provider definition by id (case-insensitive).
 * @throws when the provider id is unknown. */
function findProvider(provider: string): ProviderDefinition {
  const definition = PROVIDERS.find((item) => item.id === provider.toLowerCase());
  if (!definition) throw new Error(`Unknown provider: ${provider}. Use devthink providers.`);
  return definition;
}

/** Joins a base url and a path with exactly one slash between them. */
function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

/** Converts one provider error body into a redacted, single-line Error.
 * @throws never — always returns the Error to throw at the call site. */
function cleanError(body: string, status: number): Error {
  let detail = body.trim();
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    const error = (parsed.error || parsed.message || parsed.detail) as unknown;
    if (typeof error === "string") detail = error;
    if (error && typeof error === "object") detail = JSON.stringify(error);
  } catch {
    detail = body.trim();
  }
  const safe = redactProviderError(detail);
  return new Error(`${status} ${safe || "Provider request failed."}`);
}

/**
 * Fetches with bounded retry: transparent on 5xx and network faults, immediate otherwise.
 *
 * @param input the absolute request url.
 * @param init the fetch initializer (headers, body, signal ride through untouched).
 * @param attempts total attempts (default 3); waits ride `retryDelay` backoff.
 * @returns the last response — caller decides ok/error handling.
 */
async function fetchWithRetry(input: string, init: RequestInit, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(input, init);
      if (response.ok || response.status < 500 || attempt === attempts) return response;
      await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt - 1)));
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt - 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Provider request failed.");
}

/** Bearer-token header set of the openai wire family (accept stays sse for streaming). */
function buildOpenAiHeaders(credential: string): HeadersInit {
  return { accept: "text/event-stream", "content-type": "application/json", authorization: `Bearer ${credential}` };
}

/** x-api-key header set of the anthropic wire family, pinned to the 2023-06-01 version. */
function buildAnthropicHeaders(credential: string): HeadersInit {
  return {
    accept: "text/event-stream",
    "content-type": "application/json",
    "x-api-key": credential,
    "anthropic-version": "2023-06-01",
  };
}

/** Maps the common ChatRequest onto the google generateContent body (systemInstruction + contents + generationConfig). */
function buildGoogleBody(request: ChatRequest): Record<string, unknown> {
  const system = request.messages
    .filter((message) => message.role === "system")
    .map((message) => ({ text: message.content }));
  const contents = request.messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));
  return {
    ...(system.length ? { systemInstruction: { parts: system } } : {}),
    contents,
    generationConfig: {
      ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
      ...(request.maxTokens === undefined ? {} : { maxOutputTokens: request.maxTokens }),
    },
  };
}

/** Maps the common ChatRequest onto the anthropic messages body (system folded into its own field). */
function buildAnthropicBody(request: ChatRequest): Record<string, unknown> {
  const system = request.messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");
  return {
    model: request.model,
    messages: request.messages.filter((message) => message.role !== "system"),
    max_tokens: request.maxTokens ?? 4096,
    stream: true,
    ...(system ? { system } : {}),
    ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
  };
}

/** Maps the common ChatRequest onto the openai chat/completions body. */
function buildOpenAiBody(request: ChatRequest): Record<string, unknown> {
  return {
    model: request.model,
    messages: request.messages,
    stream: true,
    ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
    ...(request.maxTokens === undefined ? {} : { max_tokens: request.maxTokens }),
  };
}

/**
 * Lists the known providers with their base urls, protocols and credential env names.
 *
 * @returns defensive copies — callers cannot mutate the table.
 */
export function listProviders(): ProviderDefinition[] {
  return PROVIDERS.map((provider) => ({ ...provider }));
}

/**
 * Resolves one provider to its concrete endpoint and credential.
 *
 * the base url precedence is config `providers.<id>.baseUrl` → active-provider
 * `config.baseUrl` → the table default; the credential comes from
 * `resolveCredential` (config first, then the provider's env var).
 *
 * @returns the definition plus the resolved baseUrl and credential.
 * @throws when no base url can be derived or no credential is present.
 */
export function resolveProvider(
  provider: string,
  config: DevThinkConfig,
  paths?: DevThinkPaths,
): ProviderDefinition & { baseUrl: string; credential: string } {
  const definition = findProvider(provider);
  const isActive = provider === (config.activeProvider || config.provider);
  const baseUrl =
    config.providers?.[provider]?.baseUrl || (isActive ? config.baseUrl : undefined) || definition.baseUrl;
  if (!baseUrl) throw new Error(`Provider ${provider} requires baseUrl in config or --base-url.`);
  const credential = resolveCredential(provider, config, paths);
  if (!credential)
    throw new Error(`No credential found for ${provider}. Set ${definition.env} or configure it explicitly.`);
  return { ...definition, baseUrl, credential };
}

/**
 * Streams one chat completion through the provider's native wire protocol.
 *
 * @param request the chat request (provider id, model, messages, sampling knobs, optional abort signal).
 * @param config the resolved DevThink config (active provider, base urls, credentials).
 * @param paths the resolved DevThink paths (credential file lookup).
 * @returns an async generator of normalized ChatEvents (deltas, usage, done).
 * @throws a redacted provider Error on non-ok responses after the retry budget.
 */
export async function streamChat(
  request: ChatRequest,
  config: DevThinkConfig,
  paths?: DevThinkPaths,
): Promise<AsyncGenerator<ChatEvent>> {
  const provider = resolveProvider(request.provider, config, paths);
  const url =
    provider.protocol === "google"
      ? `${joinUrl(provider.baseUrl, `models/${encodeURIComponent(request.model)}:streamGenerateContent`)}?alt=sse`
      : joinUrl(provider.baseUrl, provider.protocol === "anthropic" ? "/v1/messages" : "/chat/completions");
  const headers =
    provider.protocol === "google"
      ? { accept: "text/event-stream", "content-type": "application/json", "x-goog-api-key": provider.credential }
      : provider.protocol === "anthropic"
        ? buildAnthropicHeaders(provider.credential)
        : buildOpenAiHeaders(provider.credential);
  const body =
    provider.protocol === "google"
      ? buildGoogleBody(request)
      : provider.protocol === "anthropic"
        ? buildAnthropicBody(request)
        : buildOpenAiBody(request);
  const response = await fetchWithRetry(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    ...(request.signal ? { signal: request.signal } : {}),
  });
  if (!response.ok) throw cleanError(await response.text(), response.status);
  return parseEventStream(response, { provider: provider.id, model: request.model, signal: request.signal });
}

/**
 * Lists the models the provider currently exposes for the resolved credential.
 *
 * @param providerName the provider id from the PROVIDERS table.
 * @param config the resolved DevThink config.
 * @param paths the resolved DevThink paths (credential file lookup).
 * @returns model descriptors (id, provider, context window, streaming support); google reads inputTokenLimit, the openai family reads context_length.
 * @throws a redacted provider Error on non-ok responses after the retry budget.
 */
export async function listModels(
  providerName: string,
  config: DevThinkConfig,
  paths?: DevThinkPaths,
): Promise<ModelInfo[]> {
  const provider = resolveProvider(providerName, config, paths);
  if (provider.protocol === "google") {
    const response = await fetchWithRetry(joinUrl(provider.baseUrl, "models"), {
      headers: { "x-goog-api-key": provider.credential },
    });
    if (!response.ok) throw cleanError(await response.text(), response.status);
    const payload = (await response.json()) as { models?: Array<{ name?: string; inputTokenLimit?: number }> };
    return (payload.models || []).map((model) => ({
      id: (model.name || "").replace(/^models\//, ""),
      provider: provider.id,
      contextWindow: model.inputTokenLimit,
      supportsStreaming: true,
    }));
  }
  const path = provider.protocol === "anthropic" ? "/v1/models" : "/models";
  const headers =
    provider.protocol === "anthropic"
      ? buildAnthropicHeaders(provider.credential)
      : buildOpenAiHeaders(provider.credential);
  const response = await fetchWithRetry(joinUrl(provider.baseUrl, path), { headers });
  if (!response.ok) throw cleanError(await response.text(), response.status);
  const payload = (await response.json()) as { data?: Array<{ id?: string; context_length?: number }> };
  return (payload.data || [])
    .filter((model) => model.id)
    .map((model) => ({
      id: model.id as string,
      provider: provider.id,
      contextWindow: model["context_length"],
      supportsStreaming: true,
    }));
}
