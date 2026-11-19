/**
 * studio.client.ts — the correlated-logic adapter of the interface-18 studio
 * surface (the "devthink chat3" replacement spec): every lane the surface
 * rides — types, discovery, streaming, understanding, image generation and
 * the conversation store — lives in THIS one file, wired to the root getry
 * logics (chatclient.ts, db.ts, gateway.ts, thinking.ts) so the wingets stay
 * pure interface and the anchor stays pure wiring.
 *
 * the contract mirrors the gateway (Next) edition of the surface: the same
 * function names and shapes the interface-18 components import, now answered
 * by the getry lanes:
 *
 *   - discovery: chatclient.discovery() probed per version, mapped into the
 *     RouteDiscoveryResult grammar (provider labels from GATEWAYVERSIONS,
 *     thinking budgets from the 7-rung ladder of thinking.ts)
 *   - streaming: chatclient.streamchat() with the onDelta/onReasoning
 *     callbacks folded into the patch flow (content/reasoning deltas + the
 *     final meta row: model · provider · fallback · session · devthink
 *     backend · usage)
 *   - understanding + image generation: direct fetch lanes against the
 *     gateway origin (the same endpoints the gateway edition rides)
 *   - conversations: the db lane (listconversations / saveconversationremote
 *     / deleteconversationremote) with the row ↔ surface mapping
 */

import {
  type ChatPart,
  type ChatResult,
  type ChatTurn,
  type DiscoveryRoute,
  DISCOVERYVERSIONS,
  discovery,
  gatewayorigin,
  newsessionid,
  streamchat,
} from "./chatclient";
import {
  type ClientConversationRow,
  type ClientMessageRow,
  type ConversationUpsert,
  deleteconversationremote,
  listconversations,
  saveconversationremote,
} from "./db";
import { GATEWAYVERSIONS } from "./gateway";
import { listlevels } from "./thinking";

/* ===== block: the surface types (the interface-18 grammar) ============= */

export type RouteName = "v1" | "v2" | "v3" | "v4" | "v5" | (string & {});

export interface ModelModalities {
  input?: string[];
  output?: string[];
}

export interface DiscoveredModel {
  id: string;
  route: RouteName;
  ownedBy: string;
  provider: string;
  meta: boolean;
  supportsVision: boolean;
  modalities?: ModelModalities;
  contextWindow?: number;
  maxOutput?: number;
  backend?: string;
  pattern?: string;
  rotation?: string;
  rotationPool?: string[];
  raw: Record<string, unknown>;
}

export type RouteHealthStatus = "live" | "paused" | "key_required" | "error" | "loading";

export interface UnderstandingRouteInfo {
  route: string;
  models: string[];
  note?: string;
}

export interface DiscoveredImageModel {
  id: string;
  sizes?: string[];
  modality?: string;
}

export interface RouteDiscoveryResult {
  route: RouteName;
  status: RouteHealthStatus;
  httpStatus: number;
  latencyMs: number;
  providerLabel: string;
  baseUrl?: string;
  defaultModel?: string;
  thinkingLevels?: Record<string, number>;
  understandingRoutes?: {
    image?: UnderstandingRouteInfo;
    audio?: UnderstandingRouteInfo;
    video?: UnderstandingRouteInfo;
  };
  imageModels?: DiscoveredImageModel[];
  models: DiscoveredModel[];
  error?: string;
  rawPayload?: unknown;
}

export interface TokenUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface ChatImageAttachment {
  id: string;
  name: string;
  dataUrl: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  images?: ChatImageAttachment[];
  generatedImages?: string[];
  modelId?: string;
  route?: RouteName;
  provider?: string;
  fallback?: string;
  usage?: TokenUsage;
  createdAt: number;
  isStreaming?: boolean;
  error?: string;
  /** transparent vision reroute reported by the gateway */
  visionReroute?: string;
  /** gateway degraded media in history to text placeholders */
  mediaDegraded?: boolean;
  /** live backend that served this devthink meta-model turn (smart-first) */
  devthinkModel?: string;
}

export interface Conversation {
  id: string;
  /** optional project grouping pointer (the studio workspace rail) */
  workspaceId?: string;
  title: string;
  route: RouteName;
  modelId: string;
  systemPrompt: string;
  temperature: number;
  thinkingLevel: string;
  messages: ChatMessage[];
  sessionId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface StreamDeltaPatch {
  contentDelta?: string;
  reasoningDelta?: string;
  model?: string;
  provider?: string;
  fallback?: string;
  sessionId?: string;
  usage?: TokenUsage;
  visionReroute?: string;
  mediaDegraded?: boolean;
  devthinkModel?: string;
}

/* ===== block: constants ================================================= */

/** the gateway this surface talks to = the getry origin lane. */
export const DEFAULT_GATEWAY_BASE_URL = gatewayorigin();

/** the five versions the discovery probes (the getry lane order). */
export const DEFAULT_ROUTES: RouteName[] = [...DISCOVERYVERSIONS];

/* ===== block: pure helpers ============================================== */

/** keeps one raw url honest: adds the scheme, drops trailing slashes. */
export function normalizeBaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    return parsed.origin;
  } catch {
    return "";
  }
}

/** 1048576 → "1.0M" · 131072 → "131k" · absent → "—" (the catalog grammar). */
export function formatCompactTokens(value?: number): string {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

/** derives the conversation title from the first user prompt (42 budget). */
export function deriveConversationTitle(firstPrompt: string): string {
  const cleaned = firstPrompt.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Nova conversa";
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}…` : cleaned;
}

/** the 7-rung ladder of thinking.ts as the level→budget record the
 *  effort spectrum rides (the getry ladder is the single source; the
 *  route/allRoutes params stay in the signature for interface-18 call-site
 *  compatibility — the getry ladder is global, they are advisory only). */
export function resolveThinkingLevels(
  _routeInfo?: RouteDiscoveryResult | null,
  _allRoutes?: RouteDiscoveryResult[]
): Record<string, number> {
  const levels: Record<string, number> = {};
  for (const rung of listlevels()) {
    levels[rung.level] = rung.budget;
  }
  return levels;
}

/** folds the history into the context-aware prompt the understanding
 *  endpoint rides (the analysis continues the conversation). */
export function buildUnderstandingPrompt(
  history: ChatMessage[],
  currentQuestion: string
): string {
  const prior = history.filter(
    (m) => !m.error && (m.content.trim() || (m.generatedImages && m.generatedImages.length > 0))
  );
  if (prior.length === 0) {
    return currentQuestion || "Descreva detalhadamente o que há nesta imagem.";
  }
  const transcript = prior
    .map((m) => {
      const who = m.role === "user" ? "Usuário" : "Assistente";
      const media =
        m.role === "user" && m.images && m.images.length > 0
          ? " [anexou imagem]"
          : m.generatedImages && m.generatedImages.length > 0
            ? " [gerou imagem]"
            : "";
      const text = m.content.trim() || "(sem texto)";
      return `${who}${media}: ${text.length > 1200 ? `${text.slice(0, 1200)}…` : text}`;
    })
    .join("\n\n");
  return `Transcrição anterior da conversa:\n${transcript}\n\nPergunta atual do usuário sobre a imagem anexada:\n${currentQuestion}`;
}

/** immutable stream-delta merge: content/reasoning concatenate, the meta
 *  fields overwrite when present (late events correct the attribution). */
export function applyStreamDeltaToMessage(
  msg: ChatMessage,
  patch: StreamDeltaPatch
): ChatMessage {
  return {
    ...msg,
    content: patch.contentDelta ? msg.content + patch.contentDelta : msg.content,
    reasoning: patch.reasoningDelta
      ? (msg.reasoning || "") + patch.reasoningDelta
      : msg.reasoning,
    modelId: patch.model !== undefined ? patch.model : msg.modelId,
    provider: patch.provider !== undefined ? patch.provider : msg.provider,
    fallback: patch.fallback !== undefined ? patch.fallback : msg.fallback,
    usage: patch.usage !== undefined ? patch.usage : msg.usage,
    visionReroute:
      patch.visionReroute !== undefined ? patch.visionReroute : msg.visionReroute,
    mediaDegraded:
      patch.mediaDegraded !== undefined ? patch.mediaDegraded : msg.mediaDegraded,
    devthinkModel:
      patch.devthinkModel !== undefined ? patch.devthinkModel : msg.devthinkModel,
  };
}

/** in-chat image intent: an explicit /image command or a pt/en create-image
 *  phrase routes the turn to the generation endpoint. */
export function shouldGenerateImageInChat(
  prompt: string,
  hasImageModel: boolean
): boolean {
  if (!hasImageModel) return false;
  const text = prompt.trim();
  if (!text) return false;
  if (/^\/(image|imagem|img)\b/i.test(text)) return true;
  const intentRe =
    /\b(crie|cria|gere|gera|desenhe|desenha|fa[cç]a|make|create|generate|draw|design|render|illustrate|produce)\b[\s\S]{0,48}\b(imagem|imagens|foto|fotos|arte|logo|logotipo|banner|poster|ilustra[cç][aã]o|picture|pictures|image|images|photo|photos|art|artwork|drawing|painting|illustration)\b/i;
  return intentRe.test(text);
}

/** browser-side canvas normalization: long edge ≤1280, fat PNGs re-encoded
 *  as jpeg 0.88, failures fall back to the raw reader. */
export async function normalizeImageFile(
  file: File,
  maxDimension = 1280
): Promise<ChatImageAttachment> {
  const readRaw = (): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });
  const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const name = file.name || "image";
  try {
    if (typeof document === "undefined") throw new Error("ssr");
    const dataUrl = await readRaw();
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = dataUrl;
    });
    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    if (scale >= 1 && dataUrl.length < 450_000) {
      return { id, name, dataUrl };
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const isPng = dataUrl.startsWith("data:image/png");
    const normalized = isPng && dataUrl.length > 450_000
      ? canvas.toDataURL("image/jpeg", 0.88)
      : canvas.toDataURL("image/png");
    return { id, name, dataUrl: normalized };
  } catch {
    return { id, name, dataUrl: await readRaw() };
  }
}

/* ===== block: discovery ================================================= */

/** maps one getry DiscoveryRoute into the interface-18 grammar. */
function maproute(route: DiscoveryRoute, origin: string): RouteDiscoveryResult {
  const versionInfo = GATEWAYVERSIONS.find((v) => v.v === route.version);
  const providerLabel = versionInfo?.provider ?? `/${route.version}`;
  const thinkingLevels: Record<string, number> | undefined = route.meta
    ? Object.fromEntries(route.meta.thinkingLevels.map((l) => [l.level, l.budget]))
    : undefined;
  const models: DiscoveredModel[] = route.models.map((m) => {
    const isMeta = route.meta !== null && (m.id === route.meta.id || m.id === "devthink");
    return {
      id: m.id,
      route: route.version,
      ownedBy: providerLabel,
      provider: providerLabel,
      meta: isMeta,
      supportsVision: /v\b|vision|glm-5v/i.test(m.id),
      contextWindow: m.context,
      maxOutput: m.output,
      pattern: versionInfo?.pattern,
      rotationPool: route.meta?.rotationPool,
      raw: { id: m.id },
    };
  });
  return {
    route: route.version,
    status: route.status === "live" ? "live" : route.status === "paused" ? "paused" : "error",
    httpStatus: route.status === "live" ? 200 : route.status === "paused" ? 503 : 0,
    latencyMs: route.latencyMs,
    providerLabel,
    baseUrl: origin,
    defaultModel: route.meta?.id ?? route.models[0]?.id,
    thinkingLevels,
    imageModels: [],
    models,
    error: route.error,
  };
}

/** probes the five versions through the getry discovery lane. */
export async function discoverGatewayRoutes(
  baseUrl: string,
  routes: RouteName[]
): Promise<{ baseUrl: string; results: RouteDiscoveryResult[] }> {
  const origin = baseUrl || gatewayorigin();
  const probed = await discovery(origin);
  const wanted = new Set(String(routes[0]) === String(DEFAULT_ROUTES) ? [] : routes);
  const filtered = wanted.size > 0 ? probed.filter((r) => wanted.has(r.version)) : probed;
  return { baseUrl: origin, results: filtered.map((r) => maproute(r, origin)) };
}

/* ===== block: streaming ================================================= */

export interface StreamChatCallbacks {
  onDelta: (patch: StreamDeltaPatch) => void;
  onError: (message: string) => void;
  onDone: () => void;
}

/** builds the multimodal turn body of one message (text + image parts). */
function turnof(msg: ChatMessage): ChatTurn {
  if (msg.images && msg.images.length > 0) {
    const parts: ChatPart[] = [];
    if (msg.content.trim()) parts.push({ type: "text", text: msg.content });
    for (const img of msg.images) parts.push({ type: "image_url", image_url: { url: img.dataUrl } });
    return { role: msg.role, content: parts };
  }
  return { role: msg.role, content: msg.content };
}

/** streams one completion through the getry chat lane, folding the
 *  onDelta/onReasoning callbacks and the settled meta row into the
 *  interface-18 patch flow (the reasoning ALWAYS precedes the content —
 *  the gateway contract both surfaces share). */
export async function streamChatCompletion(
  params: {
    baseUrl: string;
    route: RouteName;
    modelId: string;
    messages: ChatMessage[];
    systemPrompt: string;
    temperature: number;
    thinkingLevel?: string;
    sessionId?: string;
    signal?: AbortSignal;
  },
  callbacks: StreamChatCallbacks
): Promise<void> {
  const turns: ChatTurn[] = [];
  if (params.systemPrompt.trim()) turns.push({ role: "system", content: params.systemPrompt });
  for (const msg of params.messages) turns.push(turnof(msg));

  try {
    const result: ChatResult = await streamchat({
      origin: params.baseUrl || undefined,
      version: String(params.route),
      model: params.modelId,
      messages: turns,
      thinkingLevel: params.thinkingLevel && params.thinkingLevel !== "default" ? params.thinkingLevel : undefined,
      temperature: params.temperature,
      sessionId: params.sessionId,
      signal: params.signal,
      onDelta: (chunk) => callbacks.onDelta({ contentDelta: chunk }),
      onReasoning: (chunk) => callbacks.onDelta({ reasoningDelta: chunk }),
      onError: (err) => callbacks.onError(err.message),
    });
    callbacks.onDelta({
      model: result.model,
      provider: result.provider,
      fallback: result.fallback,
      sessionId: result.sessionId,
      devthinkModel: result.backendModel,
      usage: result.usage
        ? {
            prompt_tokens: result.usage.promptTokens,
            completion_tokens: result.usage.completionTokens,
            total_tokens: result.usage.totalTokens,
          }
        : undefined,
    });
    callbacks.onDone();
  } catch (err) {
    callbacks.onError(err instanceof Error ? err.message : String(err));
  }
}

/* ===== block: understanding + image generation ========================== */

export interface UnderstandingResult {
  content: string;
  reasoning?: string;
  model?: string;
  provider?: string;
  fallback?: string;
  usage?: TokenUsage;
}

/** the dedicated understanding route ({prompt, image}) with the context-
 *  aware prompt + the fallback path retry (no model on the second leg). */
export async function runImageUnderstanding(params: {
  baseUrl: string;
  routePath: string;
  fallbackRoutePath?: string;
  prompt: string;
  imageDataUrl: string;
  modelId?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<UnderstandingResult> {
  const attempt = async (path: string, withModel: boolean): Promise<UnderstandingResult> => {
    const body: Record<string, unknown> = {
      prompt: params.prompt.trim() || "Descreva detalhadamente o que há nesta imagem.",
      image: params.imageDataUrl,
    };
    if (withModel && params.modelId) body.model = params.modelId;
    const timeoutSignal = AbortSignal.timeout(params.timeoutMs ?? 45000);
    const signal = params.signal ? AbortSignal.any([params.signal, timeoutSignal]) : timeoutSignal;
    const response = await fetch(`${params.baseUrl || gatewayorigin()}${path.startsWith("/") ? path : `/${path}`}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal,
    });
    const text = await response.text();
    let json: Record<string, unknown> | null = null;
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      json = null;
    }
    if (!response.ok || json?.error) {
      const errObj = json?.error as Record<string, unknown> | string | undefined;
      const msg =
        (typeof errObj === "object" && errObj && typeof errObj.message === "string"
          ? errObj.message
          : typeof errObj === "string" ? errObj : text.trim().slice(0, 300)) || `Erro HTTP ${response.status}`;
      throw new Error(msg);
    }
    const choices = Array.isArray(json?.choices) ? json.choices : [];
    const first = (choices[0] as Record<string, unknown> | undefined) ?? undefined;
    const message = (first?.message as Record<string, unknown> | undefined) ?? undefined;
    const content =
      typeof message?.content === "string" ? message.content
      : typeof json?.content === "string" ? json.content
      : typeof json?.text === "string" ? json.text : "";
    const reasoning =
      typeof message?.reasoning_content === "string" && message.reasoning_content.trim()
        ? message.reasoning_content : undefined;
    if (!content.trim() && !reasoning) throw new Error("A rota de entendimento respondeu sem conteúdo.");
    return {
      content,
      reasoning,
      model: typeof json?.model === "string" ? json.model : response.headers.get("x-model") || params.modelId,
      provider: typeof json?.provider === "string" ? json.provider : response.headers.get("x-provider") || undefined,
      fallback: response.headers.get("x-fallback-route") || undefined,
      usage: (json?.usage as TokenUsage | undefined) || undefined,
    };
  };
  try {
    return await attempt(params.routePath, true);
  } catch (primaryError) {
    if (params.fallbackRoutePath && params.fallbackRoutePath !== params.routePath) {
      try {
        const res = await attempt(params.fallbackRoutePath, false);
        return { ...res, fallback: params.fallbackRoutePath };
      } catch {
        throw primaryError;
      }
    }
    throw primaryError;
  }
}

export interface GeneratedImageResult {
  imageDataUrl: string;
  revisedPrompt?: string;
  model?: string;
  fallback?: string;
}

/** the image generation lane (generations/edits) with the tolerant
 *  response parse (b64 in every dialect, or a hosted url). */
export async function generateGatewayImage(params: {
  baseUrl: string;
  route?: RouteName;
  action?: "generations" | "edits";
  modelId: string;
  fallbackModelId?: string;
  prompt: string;
  size?: string;
  sourceImageDataUrl?: string;
  signal?: AbortSignal;
}): Promise<GeneratedImageResult> {
  const action = params.action ?? (params.sourceImageDataUrl ? "edits" : "generations");
  const body: Record<string, unknown> = { model: params.modelId, prompt: params.prompt };
  if (params.size) body.size = params.size;
  if (params.sourceImageDataUrl) body.image = params.sourceImageDataUrl;
  const response = await fetch(
    `${params.baseUrl || gatewayorigin()}/${params.route || "v1"}/images/${action}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: params.signal ?? AbortSignal.timeout(120000),
    }
  );
  const text = await response.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    json = null;
  }
  if (!response.ok || json?.error) {
    const errObj = json?.error as Record<string, unknown> | string | undefined;
    const cleanText = text.trim().startsWith("<")
      ? `O gateway retornou HTTP ${response.status} ao gerar a imagem.`
      : text.trim().slice(0, 300);
    const msg =
      (typeof errObj === "object" && errObj && typeof errObj.message === "string" ? errObj.message
       : typeof errObj === "string" ? errObj
       : typeof json?.message === "string" ? json.message : cleanText) || `Erro HTTP ${response.status}`;
    throw new Error(msg);
  }
  const dataArr = Array.isArray(json?.data) ? json.data : Array.isArray(json?.images) ? json.images : [];
  const firstRaw = dataArr[0];
  const first = firstRaw && typeof firstRaw === "object" ? (firstRaw as Record<string, unknown>) : undefined;
  const firstStr = typeof firstRaw === "string" ? firstRaw : "";
  const rawB64 =
    (typeof first?.b64_json === "string" && first.b64_json) ||
    (typeof first?.base64 === "string" && first.base64) ||
    (typeof first?.b64 === "string" && first.b64) ||
    (typeof first?.image === "string" && !first.image.startsWith("http") ? first.image : "") ||
    (firstStr && !firstStr.startsWith("http") ? firstStr : "") ||
    (typeof json?.b64_json === "string" && json.b64_json) ||
    (typeof json?.image === "string" && !json.image.startsWith("http") ? json.image : "") || "";
  const rawUrl =
    (typeof first?.url === "string" && first.url) ||
    (typeof first?.image === "string" && first.image.startsWith("http") ? first.image : "") ||
    (firstStr && firstStr.startsWith("http") ? firstStr : "") ||
    (typeof json?.url === "string" && json.url) ||
    (typeof json?.image === "string" && json.image.startsWith("http") ? json.image : "") || "";
  const imageDataUrl = rawB64
    ? rawB64.startsWith("data:") ? rawB64 : `data:image/png;base64,${rawB64}`
    : rawUrl;
  if (!imageDataUrl) throw new Error("O endpoint de imagem não retornou imagem.");
  return {
    imageDataUrl,
    revisedPrompt: typeof first?.revised_prompt === "string" ? first.revised_prompt : undefined,
    model: typeof json?.model === "string" ? json.model : params.modelId,
  };
}

/* ===== block: the conversation store (the db lane) ====================== */

/** maps one stored message row into the surface grammar. */
function mapmessage(row: ClientMessageRow): ChatMessage {
  let images: ChatImageAttachment[] | undefined;
  if (Array.isArray(row.images)) {
    const mapped = row.images
      .map((raw, idx) => {
        if (typeof raw === "string") return { id: `img_${row.id}_${idx}`, name: "image", dataUrl: raw };
        if (raw && typeof raw === "object" && typeof (raw as { dataUrl?: unknown }).dataUrl === "string") {
          return { id: `img_${row.id}_${idx}`, name: "image", dataUrl: (raw as { dataUrl: string }).dataUrl };
        }
        return null;
      })
      .filter((x): x is ChatImageAttachment => x !== null && x.dataUrl !== "");
    if (mapped.length > 0) images = mapped;
  }
  let generatedImages: string[] | undefined;
  if (Array.isArray(row.generated)) {
    const mapped = row.generated.filter((x): x is string => typeof x === "string" && x !== "");
    if (mapped.length > 0) generatedImages = mapped;
  }
  let usage: TokenUsage | undefined;
  if (row.usage && typeof row.usage === "object") {
    const u = row.usage as { promptTokens?: number; completionTokens?: number; totalTokens?: number; prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    usage = {
      prompt_tokens: u.promptTokens ?? u.prompt_tokens,
      completion_tokens: u.completionTokens ?? u.completion_tokens,
      total_tokens: u.totalTokens ?? u.total_tokens,
    };
  }
  return {
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.content ?? "",
    reasoning: row.reasoning ?? undefined,
    images,
    generatedImages,
    modelId: row.modelId ?? undefined,
    route: (row.route as RouteName) ?? undefined,
    provider: row.provider ?? undefined,
    fallback: row.fallback ?? undefined,
    error: row.error ?? undefined,
    usage,
    createdAt: typeof row.createdAt === "string" ? new Date(row.createdAt).getTime() : Date.now(),
  };
}

/** maps one stored conversation row (with its messages) into the surface. */
function mapconversation(row: ClientConversationRow & { messages: ClientMessageRow[] }): Conversation {
  return {
    id: row.id,
    title: row.title ?? "Nova conversa",
    route: (row.route as RouteName) ?? "v1",
    modelId: row.modelId ?? "",
    systemPrompt: row.systemPrompt ?? "",
    temperature: typeof row.temperature === "number" ? row.temperature : 0.7,
    thinkingLevel: row.thinkingLevel ?? "default",
    sessionId: row.sessionId ?? newsessionid(),
    messages: (row.messages ?? []).map(mapmessage),
    createdAt: typeof row.createdAt === "string" ? new Date(row.createdAt).getTime() : Date.now(),
    updatedAt: typeof row.updatedAt === "string" ? new Date(row.updatedAt).getTime() : Date.now(),
  };
}

/** builds the upsert body of one conversation (images back to dataUrls). */
function toupsert(conversation: Conversation): ConversationUpsert {
  return {
    id: conversation.id,
    title: conversation.title,
    route: String(conversation.route),
    modelId: conversation.modelId,
    systemPrompt: conversation.systemPrompt,
    temperature: conversation.temperature,
    thinkingLevel: conversation.thinkingLevel,
    sessionId: conversation.sessionId,
    messages: conversation.messages
      .filter((m) => !m.isStreaming)
      .map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        reasoning: m.reasoning ?? null,
        images: m.images && m.images.length > 0 ? m.images.map((i) => i.dataUrl) : undefined,
        generated: m.generatedImages && m.generatedImages.length > 0 ? m.generatedImages : undefined,
        modelId: m.modelId ?? null,
        route: m.route ? String(m.route) : null,
        provider: m.provider ?? null,
        fallback: m.fallback ?? null,
        error: m.error ?? null,
        usage: m.usage
          ? {
              promptTokens: m.usage.prompt_tokens,
              completionTokens: m.usage.completion_tokens,
              totalTokens: m.usage.total_tokens,
            }
          : null,
      })),
  };
}

/** lists every conversation through the db lane (seed fallback inside). */
export async function fetchConversationsFromDb(): Promise<Conversation[]> {
  try {
    const rows = await listconversations();
    return rows.map(mapconversation);
  } catch {
    return [];
  }
}

/** persists one conversation through the db lane (best effort). */
export async function saveConversationToDb(conv: Conversation): Promise<void> {
  try {
    await saveconversationremote(toupsert(conv));
  } catch {
    // best-effort — the localStorage mirror keeps the data
  }
}

/** deletes one conversation through the db lane (best effort). */
export async function deleteConversationFromDb(id: string): Promise<void> {
  try {
    await deleteconversationremote(id);
  } catch {
    // best-effort
  }
}

/** the Sync import lane: re-reads the conversation store (the db lane
 *  refresh — the getry store IS the gateway database mirror). */
export async function importFromGatewayDatabase(
  _baseUrl: string,
  _conversationId?: string
): Promise<{ importedCount: number; conversations: Conversation[] }> {
  const conversations = await fetchConversationsFromDb();
  return { importedCount: conversations.length, conversations };
}
