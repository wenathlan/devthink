/**
 * @file search.ts
 * @module maene/search
 * @description
 *  Third-person observer: the library watches how Antigravity Manager and
 *  Gemini CLI perform grounding via googleSearch + urlContext and reproduces
 *  the contract without relying on localhost v1 proxy. The observer calls
 *  cloudcode-pa.googleapis.com directly, cascades endpoints on 403/404/5xx,
 *  injects native Gemini tools, and parses groundingMetadata rigorously.
 *
 *  Layout: library-first, root-first — file lives beside its siblings
 *  Runtime: only node:* builtins + global fetch (Node >=18). Zero external deps.
 *  Date governance: 25/08/2026 — Canto do Buriti, PI, BR — version awareness 2.0.0
 *
 *  Contract:
 *  - Endpoint: https://cloudcode-pa.googleapis.com/v1internal:generateContent (primary)
 *    cascade: daily-cloudcode-pa.googleapis.com, sandbox fallback
 *  - No localhost v1 base-url proxy, direct cloudcode-pa (security + user choice)
 *  - Native tools: googleSearch + urlContext — both injected when enabled
 *  - Model: SEARCH_MODEL gemini-3-flash with preview fallback chain
 *  - Thinking: thinkingLevel → thinkingBudget mapping (8192/16384/32768) clamped 32k
 *  - Grounding parse: groundingMetadata.webSearchQueries, groundingChunks[].web.uri/title,
 *    groundingSupports, searchEntryPoint.renderedContent
 *  - Proxy support: env HTTPS_PROXY/HTTP_PROXY/NO_PROXY + options.proxyUrl
 *    manual CONNECT tunneling via node:net + node:tls — no external deps
 *  - Bypass metadata: mimics antigravity/{ver} {os}/{arch} UA, strips x-goog-user-project,
 *    jitter 0-80ms, FNV-1a deterministic session_id note (not needed here but coherent)
 *
 *  EN: Antigravity bypass relies on mimicking antigravity/{ver} {os}/{arch} UA
 *      and bypassing x-goog-user-project stripping, endpoint cascade 403/404/5xx.
 *  PT-BR: Bypass Antigravity depende de imitar UA antigravity/{ver} {os}/{arch}
 *      e remover x-goog-user-project, cascata de endpoints em 403/404/5xx.
 *
 *  Production-ready: JSDoc, exhaustive error handling, timeout, abort, proxy,
 *  endpoint cascade, thinking budget, grounding parsing, no placeholder.
 *
 * @author maene
 * @license MIT
 * @version 2.0.0
 */

import * as os from "node:os";
import { platform as osPlatform, arch as osArch, release as osRelease } from "node:os";
import * as net from "node:net";
import * as tls from "node:tls";
import * as http from "node:http";
import * as https from "node:https";
import { createHash } from "node:crypto";
import { join as pathJoin } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// Frozen-owner imports — identical values owned by constants.ts / core.ts /
// models.ts, re-exported below so the module surface stays unchanged.
// ---------------------------------------------------------------------------

import {
  ANTIGRAVITY_USER_AGENT_FALLBACK,
  ANTIGRAVITY_VERSION_FALLBACK,
  DEFAULT_TIMEOUT_MS,
  GENERATE_CONTENT_ENDPOINT,
  JITTER_MAX_MS,
  JITTER_MIN_MS,
  PLUGIN_VERSION,
  STREAM_GENERATE_ENDPOINT,
  FETCH_TIMEOUT_MS,
} from "./constants.js";
import { fnv1a32, getJitter, isRetryableStatus } from "./core.js";
import {
  buildAntagravityHeaders,
  getDynamicUserAgent,
  getXGoogApiClient,
  normalizeArch,
  normalizePlatform,
} from "./fingerprint.js";
// v2.1.15 Phase A: model-identification families (search/default model ids,
// thinking tables, image-gen helpers) are imported from models.ts — THE
// single owner — instead of the former constants.js re-exports.
import {
  CODE_ASSIST_ENDPOINTS,
  SEARCH_MODEL,
  SEARCH_MODEL_FALLBACKS,
  SEARCH_MODEL_PREVIEW,
  THINKING_BUDGET_MAP,
  THINKING_BUDGET_MAX_CLAUDE,
  THINKING_BUDGET_MAX_GEMINI,
  THINKING_LEVELS,
  buildImageGenConfig,
  isImageGenModel,
} from "./models.js";
import type { ThinkingLevel } from "./models.js";
// v2.1.15 Phase A: parseGrounding moved from core.ts — web-citation
// extraction is search-grounding domain logic.
function parseGrounding(meta: any): { uri: string; title?: string }[] {
  const chunks = meta?.groundingChunks || meta?.grounding_chunks || [];
  return chunks.map((c: any) => (c.web ? { uri: c.web.uri, title: c.web.title } : null)).filter(Boolean);
}

export {
  ANTIGRAVITY_USER_AGENT_FALLBACK,
  ANTIGRAVITY_VERSION_FALLBACK,
  CODE_ASSIST_ENDPOINTS,
  DEFAULT_TIMEOUT_MS,
  GENERATE_CONTENT_ENDPOINT,
  JITTER_MAX_MS,
  JITTER_MIN_MS,
  SEARCH_MODEL,
  SEARCH_MODEL_FALLBACKS,
  SEARCH_MODEL_PREVIEW,
  STREAM_GENERATE_ENDPOINT,
  THINKING_BUDGET_MAP,
  THINKING_BUDGET_MAX_CLAUDE,
  THINKING_BUDGET_MAX_GEMINI,
  THINKING_LEVELS,
  buildImageGenConfig,
  getDynamicUserAgent,
  getJitter,
  isImageGenModel,
};
export type { ThinkingLevel };
export { parseGrounding };

// ---------------------------------------------------------------------------
// Constants — observer notes prod is authoritative
// ---------------------------------------------------------------------------

/** Endpoint cascade — observer watches traffic: PROD first, then DAILY, SANDBOX */
export const DEFAULT_ENDPOINT_ORDER: readonly string[] = [
  CODE_ASSIST_ENDPOINTS.PROD,
  CODE_ASSIST_ENDPOINTS.DAILY,
  CODE_ASSIST_ENDPOINTS.SANDBOX,
] as const;

/** Timeouts — observer notes 10s per control call, 60s for content */
export const SEARCH_TIMEOUT_MS = 60_000 as const;
// local variant: diverges from models (models.FETCH_TIMEOUT_MS is the 10s control-plane timeout; this file pins it to the 60s content timeout)

// ---------------------------------------------------------------------------
// Types — grounding contract from Gemini API
// ---------------------------------------------------------------------------

/**
 * Web chunk returned by groundingMetadata.
 * Observer documents: each chunk points to a source URL used for grounding.
 */
export interface WebGroundingChunk {
  /** source uri, e.g. https://developer.mozilla.org/... */
  uri: string;
  /** title returned by search */
  title: string;
  /** derived domain — convenience */
  domain?: string | undefined;
}

/** Raw web object inside groundingChunks */
export interface GroundingChunkWeb {
  uri?: string;
  title?: string;
  domain?: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  /** alternative shapes: retrievedContext etc. — kept for resilience */
  retrievedContext?: { uri?: string; title?: string; text?: string };
  [k: string]: unknown;
}

export interface GroundingSupportSegment {
  startIndex?: number;
  endIndex?: number;
  text?: string;
}

export interface GroundingSupport {
  segment?: GroundingSupportSegment;
  groundingChunkIndices?: number[];
  confidenceScores?: number[];
}

export interface SearchEntryPoint {
  renderedContent?: string;
  [k: string]: unknown;
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: GroundingChunk[];
  groundingSupports?: GroundingSupport[];
  searchEntryPoint?: SearchEntryPoint;
  retrievalQueries?: string[];
  [k: string]: unknown;
}

/** Request shape */
export interface ExecuteSearchInput {
  /** user query to ground with googleSearch/urlContext */
  query: string;
  /** optional system instruction — helps guide grounded answer */
  systemPrompt?: string | undefined;
  /** optional additional context appended to user query for better grounding */
  additionalContext?: string | undefined;
}

export interface ExecuteSearchAuth {
  /** OAuth access_token Bearer — required */
  accessToken: string;
  /** project id resolved via loadCodeAssist/onboardUser — optional but improves success */
  projectId?: string;
  /** optional custom user agent — fallback uses dynamic UA */
  userAgent?: string;
  /** optional antigravity version for UA — defaults to 1.19.2 */
  version?: string;
  /** optional client metadata override */
  clientMetadata?: string;
}

export interface ExecuteSearchOptions {
  /** model — defaults to SEARCH_MODEL gemini-3-flash */
  model?: string;
  /** thinking level mapping to budget */
  thinkingLevel?: ThinkingLevel;
  /** direct budget override — clamped 0-32768 */
  thinkingBudget?: number;
  /** include groundingMetadata in result — default true */
  includeGrounding?: boolean;
  /** inject url_context companion tool — default true per spec */
  useUrlContext?: boolean;
  /** inject google_search tool — default true */
  useGoogleSearch?: boolean;
  /** proxy url e.g. http://127.0.0.1:8080 — null disables env proxy */
  proxyUrl?: string | null;
  /** timeout per fetch — default 60s */
  timeoutMs?: number;
  /** custom endpoint list for cascade — default PROD/DAILY/SANDBOX */
  endpoints?: string[];
  /** include rendered search entry point? */
  includeSearchEntryPoint?: boolean;
  /** temperature for grounded answer — default 0.2 */
  temperature?: number;
  /** max output tokens — default 8192 */
  maxOutputTokens?: number;
  /** debug logging */
  debug?: boolean;
  /** jitter between endpoint retries — default true */
  jitter?: boolean;
  /** max retries across endpoints — internal */
  maxRetries?: number;
}

/** Final grounded result */
export interface SearchResult {
  /** synthesized answer text */
  text: string;
  /** original query */
  query: string;
  /** model used */
  model: string;
  /** true if grounding sources returned */
  grounded: boolean;
  /** queries Gemini issued to Google Search */
  webSearchQueries: string[];
  /** parsed web sources — uri/title */
  groundingChunks: WebGroundingChunk[];
  /** raw supports — segment attribution */
  groundingSupports?: GroundingSupport[] | undefined;
  /** rendered search entry point HTML if present */
  searchEntryPoint?: SearchEntryPoint | undefined;
  /** raw groundingMetadata as returned */
  groundingMetadata?: GroundingMetadata | undefined;
  /** raw candidate response for debugging */
  raw?: unknown | undefined;
  /** endpoint that succeeded */
  endpointUsed?: string | undefined;
  /** thinking budget used */
  thinkingBudgetUsed?: number | undefined;
  /** was fallback project used? */
  isFallbackProject?: boolean;
}

// ---------------------------------------------------------------------------
// Error — production-ready with status context
// ---------------------------------------------------------------------------

export class SearchError extends Error {
  public readonly status?: number | undefined;
  public readonly endpoint?: string | undefined;
  public readonly retryable: boolean;
  public readonly code?: string | undefined;

  constructor(
    message: string,
    opts: { status?: number; endpoint?: string; retryable?: boolean; code?: string; cause?: unknown } = {},
  ) {
    super(message);
    this.name = "SearchError";
    this.status = opts.status;
    this.endpoint = opts.endpoint;
    this.retryable = opts.retryable ?? false;
    this.code = opts.code;
    if (opts.cause) (this as any).cause = opts.cause;
  }
}

// ---------------------------------------------------------------------------
// Observer helpers — third-person, coherent with fingerprint.ts / project.ts
// ---------------------------------------------------------------------------

// v2.1.16: the local normalizePlatform/normalizeArch copies were deleted —
// byte-identical (every branch) to the fingerprint.ts exports, which are now
// imported above (search is L4, fingerprint is L2 — downward import, allowed).

// getDynamicUserAgent is imported from constants.js (identical signature and
// outputs; the owner's trim placement differs but the fallback constant carries
// no whitespace, so results match for every input) and re-exported above.

// v2.1.16: the stale hardcoded pluginVersion literal (2.1.14) was replaced
// by the constants.js PLUGIN_VERSION import — the version-envelope owner — so
// the Client-Metadata header stops drifting behind the release version. The
// ANTIGRAVITY ideType/ideVersion/osVersion/arch fields stay local (the
// fingerprint.ts owner builder derives them differently).
function buildClientMetadata(version?: string): string {
  const ver = version ?? ANTIGRAVITY_VERSION_FALLBACK;
  const plat = normalizePlatform(osPlatform()).toUpperCase();
  const archUpper = normalizeArch(osArch()).toUpperCase();
  const parts = [
    `ideType=ANTIGRAVITY`,
    `platform=${plat}`,
    `ideVersion=${ver}`,
    `pluginVersion=${PLUGIN_VERSION}`,
    `osVersion=${osRelease()}`,
    `arch=${archUpper}`,
  ];
  return parts.join(",");
}

// getXGoogApiClient is imported from constants.js (byte-identical body:
// `antigravity/{ver} gl-node/{node} gax/4.9.0 grpc/1.14.0`).

// local variant: diverges from models (models.buildAntagravityHeaders takes an optional UA, omits X-Goog-Api-Client/Client-Metadata and strips FORBIDDEN_HEADERS; this variant requires the UA, emits both bypass headers and strips only x-goog-user-project)

/**
 * Builds Antigravity header map for cloudcode-pa.
 * Observer notes: AM only sends User-Agent on content requests, not X-Goog-Api-Client
 * for onboardUser/loadCodeAssist, but for generateContent it sends both.
 * Also strips x-goog-user-project to avoid 403 IAM (requirement).
 *
 * @param accessToken - bearer
 * @param userAgent - UA string
 * @param extra - extra headers
 */

/**
 * FNV-1a 32-bit — deterministic hashing for logs, not secrets.
 */
// local variant: diverges from core (uses plain multiplication `(hash * 0x01000193) >>> 0` instead of Math.imul; floats lose low bits so results differ from core/models for most inputs)

function hashToken(token: string): string {
  try {
    return createHash("sha256").update(token).digest("hex").slice(0, 16);
  } catch {
    return fnv1a32(token).toString(16);
  }
}

/**
 * Jitter 0-80ms anti-rate-limit — observed in AM.
 * Identical to constants.getJitter — imported from the frozen owner and
 * re-exported above.
 */

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Checks if HTTP status is retryable for endpoint cascade.
 * Observer: 403 project IAM mismatch, 404 rollout, 5xx instability → try next endpoint.
 */
// local variant: diverges from models (models.isRetryableStatus also treats 408 as retryable; this cascade variant does not)

// ---------------------------------------------------------------------------
// Proxy support — only node:* builtins + fetch
// ---------------------------------------------------------------------------

export interface ProxyResolution {
  /** final proxy url to use, null if disabled */
  proxyUrl: string | null;
  /** reason / source for debugging */
  source: "option" | "env_https_proxy" | "env_http_proxy" | "env_all_proxy" | "disabled" | "none" | "no_proxy_bypass";
}

/**
 * Parses NO_PROXY env — comma separated list of host suffixes, IPs, CIDRs (simplified).
 */
export function isNoProxyMatch(targetHost: string, noProxyRaw: string | undefined): boolean {
  if (!noProxyRaw) return false;
  const list = noProxyRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) return false;
  const host = targetHost.toLowerCase();
  for (const pattern of list) {
    if (pattern === "*" || pattern === "*.*") return true;
    if (pattern === host) return true;
    if (pattern.startsWith(".")) {
      // .example.com matches foo.example.com
      if (host.endsWith(pattern)) return true;
    }
    if (host.endsWith(`.${pattern}`)) return true;
    if (pattern.startsWith("*.")) {
      const suffix = pattern.slice(2);
      if (host === suffix || host.endsWith(`.${suffix}`)) return true;
    }
  }
  return false;
}

/**
 * Resolves proxy URL respecting options.proxyUrl, env vars, and NO_PROXY.
 * Observer scans env case-insensitively as per curl conventions.
 *
 * @param optionsProxy - explicit option, string or null (null disables)
 * @param targetUrl - target to check NO_PROXY against
 */
export function resolveProxyUrl(optionsProxy: string | null | undefined, targetUrl?: string): ProxyResolution {
  // explicit null disables proxy even if env present
  if (optionsProxy === null) {
    return { proxyUrl: null, source: "disabled" };
  }
  if (typeof optionsProxy === "string" && optionsProxy.trim().length > 0) {
    return { proxyUrl: optionsProxy.trim(), source: "option" };
  }

  // env var resolution — order HTTPS_PROXY > HTTP_PROXY > ALL_PROXY
  const envHttps = process.env.HTTPS_PROXY || process.env.https_proxy;
  const envHttp = process.env.HTTP_PROXY || process.env.http_proxy;
  const envAll = process.env.ALL_PROXY || process.env.all_proxy;
  const noProxyRaw = process.env.NO_PROXY || process.env.no_proxy;

  if (targetUrl) {
    try {
      const u = new URL(targetUrl);
      if (isNoProxyMatch(u.hostname, noProxyRaw)) {
        return { proxyUrl: null, source: "no_proxy_bypass" };
      }
    } catch {
      // ignore malformed target
    }
  }

  if (envHttps && envHttps.trim()) {
    return { proxyUrl: envHttps.trim(), source: "env_https_proxy" };
  }
  if (envHttp && envHttp.trim()) {
    return { proxyUrl: envHttp.trim(), source: "env_http_proxy" };
  }
  if (envAll && envAll.trim()) {
    return { proxyUrl: envAll.trim(), source: "env_all_proxy" };
  }
  return { proxyUrl: null, source: "none" };
}

/**
 * Builds Proxy-Authorization header if proxy URL contains credentials.
 */
function getProxyAuthHeader(proxyUrl: URL): string | null {
  if (proxyUrl.username) {
    try {
      const user = decodeURIComponent(proxyUrl.username);
      const pass = decodeURIComponent(proxyUrl.password);
      const token = Buffer.from(`${user}:${pass}`).toString("base64");
      return `Basic ${token}`;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Decodes chunked transfer-encoding.
 * Observer implements minimal but spec-compliant decoder for proxy HTTPS path.
 */
function decodeChunked(body: string): string {
  let out = "";
  let i = 0;
  const len = body.length;
  while (i < len) {
    const crlf = body.indexOf("\r\n", i);
    if (crlf === -1) break;
    const line = body.slice(i, crlf).trim();
    if (!line) {
      i = crlf + 2;
      continue;
    }
    // chunk size may have extension ; — ignore
    const semi = line.indexOf(";");
    const sizeHex = semi === -1 ? line : line.slice(0, semi);
    const size = parseInt(sizeHex, 16);
    if (Number.isNaN(size)) break;
    if (size === 0) break; // last chunk
    i = crlf + 2;
    if (i + size > len) {
      // incomplete — take what we have
      out += body.slice(i);
      break;
    }
    out += body.slice(i, i + size);
    i += size;
    // skip trailing CRLF after chunk
    if (body.slice(i, i + 2) === "\r\n") i += 2;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Low-level proxy fetch implementations — only node:net/tls/http/https
// ---------------------------------------------------------------------------

interface RawProxyResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  bodyText: string;
}

interface ProxyFetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: { get: (name: string) => string | null; [k: string]: any };
  text: () => Promise<string>;
  json: () => Promise<any>;
  arrayBuffer?: () => Promise<ArrayBuffer>;
}

/**
 * Creates a fetch-like Response wrapper from raw proxy result.
 */
function wrapRawResult(raw: RawProxyResult): ProxyFetchResponse {
  const lowerHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw.headers)) lowerHeaders[k.toLowerCase()] = v;

  return {
    ok: raw.status >= 200 && raw.status < 300,
    status: raw.status,
    statusText: raw.statusText,
    headers: {
      get: (name: string) => {
        const v = lowerHeaders[name.toLowerCase()];
        return v ?? null;
      },
      ...raw.headers,
    },
    text: async () => raw.bodyText,
    json: async () => {
      try {
        return JSON.parse(raw.bodyText);
      } catch (e: any) {
        throw new SearchError(
          `proxy response not JSON: ${e?.message ?? String(e)} — body: ${raw.bodyText.slice(0, 500)}`,
          {
            status: raw.status,
          },
        );
      }
    },
  };
}

/**
 * HTTP target via HTTP proxy — absolute URL in request line.
 * Observer uses node:http.request which already handles chunked.
 *
 * @param targetUrl - full target url
 * @param proxyUrl - proxy url object
 * @param init - fetch init
 * @param timeoutMs - timeout
 * @param signal - abort signal
 */
function httpRequestViaHttpProxy(
  targetUrl: URL,
  proxyUrl: URL,
  init: RequestInit,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<RawProxyResult> {
  return new Promise<RawProxyResult>((resolve, reject) => {
    const method = init.method ?? "POST";
    const bodyStr = typeof init.body === "string" ? init.body : init.body ? (init.body as any).toString() : undefined;

    const proxyAuth = getProxyAuthHeader(proxyUrl);
    const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) };

    // Ensure proxy-required headers
    if (!headers["Host"]) headers["Host"] = targetUrl.host;
    if (proxyAuth) headers["Proxy-Authorization"] = proxyAuth;
    if (!headers["Connection"]) headers["Connection"] = "close";

    const reqOpts: http.RequestOptions = {
      host: proxyUrl.hostname,
      port: proxyUrl.port ? parseInt(proxyUrl.port, 10) : 80,
      method,
      path: targetUrl.toString(), // absolute URI for HTTP proxy
      headers,
    };

    let finished = false;
    const cleanup = () => {
      finished = true;
    };

    const req = http.request(reqOpts, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => {
        if (finished) return;
        cleanup();
        const bodyBuf = Buffer.concat(chunks);
        const bodyText = bodyBuf.toString("utf8");
        const hdrs: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.headers)) {
          if (Array.isArray(v)) hdrs[k.toLowerCase()] = v.join(", ");
          else if (v) hdrs[k.toLowerCase()] = String(v);
        }
        resolve({
          status: res.statusCode ?? 0,
          statusText: res.statusMessage ?? "",
          headers: hdrs,
          bodyText,
        });
      });
    });

    req.on("error", (err) => {
      if (finished) return;
      cleanup();
      reject(err);
    });

    if (timeoutMs) {
      req.setTimeout(timeoutMs, () => {
        req.destroy(new Error(`proxy http request timeout after ${timeoutMs}ms to ${targetUrl.hostname}`));
      });
    }

    if (signal) {
      if (signal.aborted) {
        req.destroy(new Error("aborted"));
        return;
      }
      const onAbort = () => {
        req.destroy(new Error("aborted by signal"));
      };
      signal.addEventListener("abort", onAbort, { once: true });
      req.on("close", () => signal.removeEventListener("abort", onAbort));
    }

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

/**
 * HTTPS target via HTTP proxy using CONNECT tunneling + TLS.
 * Only node:net + node:tls builtins — observer builds tunnel manually.
 *
 * Flow:
 * 1. TCP connect to proxy
 * 2. Send CONNECT host:443
 * 3. Wait for 200
 * 4. TLS over socket
 * 5. Send HTTPS request manually
 *
 * @param targetUrl - https url
 * @param proxyUrl - http proxy url
 * @param init - fetch init
 * @param timeoutMs - timeout
 * @param signal - abort signal
 */
function httpsRequestViaHttpProxyConnect(
  targetUrl: URL,
  proxyUrl: URL,
  init: RequestInit,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<RawProxyResult> {
  return new Promise<RawProxyResult>((resolve, reject) => {
    const targetHost = targetUrl.hostname;
    const targetPort = targetUrl.port ? parseInt(targetUrl.port, 10) : 443;
    const proxyHost = proxyUrl.hostname;
    const proxyPort = proxyUrl.port ? parseInt(proxyUrl.port, 10) : 8080;

    let settled = false;
    const doReject = (err: any) => {
      if (settled) return;
      settled = true;
      reject(err);
    };
    const doResolve = (v: RawProxyResult) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };

    const socket = net.createConnection({ host: proxyHost, port: proxyPort });

    if (signal?.aborted) {
      socket.destroy(new Error("aborted before connect"));
      return;
    }

    const abortHandler = () => {
      socket.destroy(new Error("aborted by signal"));
    };
    signal?.addEventListener("abort", abortHandler, { once: true });

    let timeoutId: NodeJS.Timeout | null = null;
    if (timeoutMs) {
      timeoutId = setTimeout(() => {
        socket.destroy(new Error(`proxy CONNECT timeout ${timeoutMs}ms`));
      }, timeoutMs);
    }

    socket.on("error", (err) => {
      if (timeoutId) clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortHandler);
      doReject(err);
    });

    socket.on("connect", () => {
      const proxyAuth = getProxyAuthHeader(proxyUrl);
      const authLine = proxyAuth ? `Proxy-Authorization: ${proxyAuth}\r\n` : "";
      const connectReq =
        `CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\n` +
        `Host: ${targetHost}:${targetPort}\r\n` +
        `${authLine}` +
        `Proxy-Connection: Keep-Alive\r\n` +
        `Connection: Keep-Alive\r\n\r\n`;
      socket.write(connectReq);
    });

    let connectBuf = "";
    const onConnectData = (chunk: Buffer) => {
      connectBuf += chunk.toString("utf8");
      if (!connectBuf.includes("\r\n\r\n")) return; // wait full header

      socket.off("data", onConnectData);

      const headerEnd = connectBuf.indexOf("\r\n\r\n");
      const headerPart = connectBuf.slice(0, headerEnd);
      const lines = headerPart.split("\r\n");
      const statusLine = lines[0] ?? "";
      const m = statusLine.match(/HTTP\/\d\.\d\s+(\d+)/);
      const status = m ? parseInt(m[1]!, 10) : 0;

      if (status !== 200) {
        if (timeoutId) clearTimeout(timeoutId);
        signal?.removeEventListener("abort", abortHandler);
        socket.destroy();
        doReject(new SearchError(`proxy CONNECT failed: ${statusLine}`, { status, retryable: status >= 500 }));
        return;
      }

      // Tunnel established — leftover after \r\n\r\n may be start of TLS handshake? Actually not, it should be empty.
      // Now TLS over socket
      const tlsSocket = tls.connect({
        socket: socket as any,
        servername: targetHost,
        ALPNProtocols: ["http/1.1"],
      } as any);

      tlsSocket.on("error", (err) => {
        if (timeoutId) clearTimeout(timeoutId);
        signal?.removeEventListener("abort", abortHandler);
        doReject(err);
      });

      if (timeoutMs) {
        tlsSocket.setTimeout(timeoutMs, () => {
          tlsSocket.destroy(new Error(`TLS request timeout ${timeoutMs}ms`));
        });
      }

      tlsSocket.on("secureConnect", () => {
        const method = init.method ?? "POST";
        const path = `${targetUrl.pathname}${targetUrl.search}`;
        const initHeaders = (init.headers as Record<string, string>) ?? {};
        const headers: Record<string, string> = { ...initHeaders };

        if (!headers["Host"]) headers["Host"] = targetUrl.host;
        if (!headers["Connection"]) headers["Connection"] = "close";

        const bodyStr =
          typeof init.body === "string"
            ? init.body
            : init.body
              ? Buffer.isBuffer(init.body)
                ? (init.body as Buffer).toString("utf8")
                : String(init.body)
              : "";

        if (bodyStr && !headers["Content-Length"]) {
          headers["Content-Length"] = Buffer.byteLength(bodyStr).toString();
        }

        let reqStr = `${method} ${path} HTTP/1.1\r\n`;
        for (const [k, v] of Object.entries(headers)) {
          reqStr += `${k}: ${v}\r\n`;
        }
        reqStr += `\r\n`;
        if (bodyStr) reqStr += bodyStr;

        tlsSocket.write(reqStr);
      });

      let respBuf = Buffer.alloc(0);
      tlsSocket.on("data", (d: Buffer) => {
        respBuf = Buffer.concat([respBuf, d]);
      });

      tlsSocket.on("end", () => {
        if (timeoutId) clearTimeout(timeoutId);
        signal?.removeEventListener("abort", abortHandler);
        try {
          const respStr = respBuf.toString("utf8");
          const hdrEnd = respStr.indexOf("\r\n\r\n");
          if (hdrEnd === -1) {
            doReject(new SearchError(`invalid HTTPS response via proxy tunnel from ${targetHost}`));
            return;
          }
          const hdrPart = respStr.slice(0, hdrEnd);
          let bodyPart = respStr.slice(hdrEnd + 4);
          const hdrLines = hdrPart.split("\r\n");
          const statusLine = hdrLines[0] ?? "";
          const sm = statusLine.match(/HTTP\/\d\.\d\s+(\d+)\s*(.*)/);
          const statusCode = sm ? parseInt(sm[1]!, 10) : 0;
          const statusText = sm ? (sm[2] ?? "") : "";

          const hdrs: Record<string, string> = {};
          for (let i = 1; i < hdrLines.length; i++) {
            const line = hdrLines[i]!;
            const idx = line.indexOf(":");
            if (idx === -1) continue;
            const k = line.slice(0, idx).trim().toLowerCase();
            const v = line.slice(idx + 1).trim();
            hdrs[k] = v;
          }

          // Handle chunked
          if (hdrs["transfer-encoding"]?.toLowerCase() === "chunked") {
            bodyPart = decodeChunked(bodyPart);
          }

          doResolve({
            status: statusCode,
            statusText,
            headers: hdrs,
            bodyText: bodyPart,
          });
        } catch (e: any) {
          doReject(new SearchError(`failed parsing HTTPS proxy response: ${e?.message ?? String(e)}`, { cause: e }));
        } finally {
          try {
            tlsSocket.destroy();
          } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
        }
      });
    };

    socket.on("data", onConnectData);
  });
}

/**
 * Generic proxy-aware fetch — observer tries native fetch if no proxy,
 * otherwise manual CONNECT for https or absolute-URL for http.
 *
 * @param url - target
 * @param init - fetch init
 * @param proxyUrlStr - resolved proxy url string or null
 * @param timeoutMs - timeout
 */
async function fetchWithProxy(
  url: string,
  init: RequestInit,
  proxyUrlStr: string | null,
  timeoutMs: number,
): Promise<{
  ok: boolean;
  status: number;
  statusText?: string;
  headers: any;
  text: () => Promise<string>;
  json: () => Promise<any>;
}> {
  if (!proxyUrlStr) {
    // native path — with timeout + signal merge
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error(`timeout ${timeoutMs}ms ${url}`)), timeoutMs);

    // merge external signal if present
    const externalSignal = init.signal as AbortSignal | undefined;
    let onExternalAbort: (() => void) | null = null;
    if (externalSignal) {
      if (externalSignal.aborted) {
        clearTimeout(timer);
        controller.abort(externalSignal.reason);
      } else {
        onExternalAbort = () => controller.abort(externalSignal.reason);
        externalSignal.addEventListener("abort", onExternalAbort, { once: true });
      }
    }

    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      return res as any;
    } finally {
      clearTimeout(timer);
      if (onExternalAbort && externalSignal) {
        externalSignal.removeEventListener("abort", onExternalAbort);
      }
    }
  }

  // proxy path
  let proxyUrl: URL;
  let targetUrl: URL;
  try {
    proxyUrl = new URL(proxyUrlStr);
  } catch {
    throw new SearchError(`invalid proxyUrl: ${proxyUrlStr}`);
  }
  try {
    targetUrl = new URL(url);
  } catch {
    throw new SearchError(`invalid target url: ${url}`);
  }

  const method = init.method ?? "POST";

  const proxyResult =
    targetUrl.protocol === "https:"
      ? await httpsRequestViaHttpProxyConnect(
          targetUrl,
          proxyUrl,
          { ...init, method },
          timeoutMs,
          init.signal as AbortSignal | undefined,
        )
      : await httpRequestViaHttpProxy(
          targetUrl,
          proxyUrl,
          { ...init, method },
          timeoutMs,
          init.signal as AbortSignal | undefined,
        );

  return wrapRawResult(proxyResult) as any;
}

// ---------------------------------------------------------------------------
// Fetch with timeout helper — mirrors project.ts fetchWithTimeout
// ---------------------------------------------------------------------------

/**
 * Fetch with timeout using AbortController.
 * Observer pattern: never leaks abort timer.
 *
 * @param url - url
 * @param init - init
 * @param timeoutMs - timeout
 * @param proxyUrl - optional proxy
 */
// local variant: diverges from models (models.fetchWithTimeout takes `init.timeoutMs` and aborts a plain fetch; this variant takes an explicit timeoutMs plus proxyUrl and routes through fetchWithProxy)
export async function fetchWithProxyTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number = FETCH_TIMEOUT_MS,
  proxyUrl: string | null = null,
): Promise<any> {
  return fetchWithProxy(url, init, proxyUrl, timeoutMs);
}

// ---------------------------------------------------------------------------
// Thinking budget resolver — per RESEARCH.md 100+ terms
// ---------------------------------------------------------------------------

/**
 * Resolves thinking budget from level or direct number.
 * Observer clamps to Gemini max 32768.
 *
 * @param level - thinkingLevel minimal/low/medium/high
 * @param directBudget - optional direct thinkingBudget
 * @returns clamped budget number
 */
export function resolveThinkingBudget(level?: ThinkingLevel, directBudget?: number): number {
  if (typeof directBudget === "number" && Number.isFinite(directBudget)) {
    const clamped = Math.max(0, Math.min(directBudget, THINKING_BUDGET_MAX_GEMINI));
    return Math.floor(clamped);
  }
  if (level && (THINKING_LEVELS as readonly string[]).includes(level)) {
    return THINKING_BUDGET_MAP[level] ?? THINKING_BUDGET_MAP.medium;
  }
  // default medium per governance
  return THINKING_BUDGET_MAP.medium;
}

// ---------------------------------------------------------------------------
// Model helpers — 2026 awareness
// ---------------------------------------------------------------------------

/**
 * Normalizes model name — strips models/ prefix for body, keeps original for logging.
 * Observer notes cloudcode-pa accepts both gemini-3-flash and models/gemini-3-flash.
 *
 * @param raw - model id
 */
export function normalizeModelName(raw: string): { bare: string; withPrefix: string; original: string } {
  const original = String(raw ?? "").trim();
  const bare = original.replace(/^models\//i, "").trim();
  const withPrefix = `models/${bare}`;
  return { bare, withPrefix, original };
}

/**
 * Builds request body for cloudcode-pa v1internal:generateContent.
 * Observer has seen two shapes in the wild; prefers wrapped shape when projectId present.
 *
 * Shape A (Antigravity internal with project):
 * { model, project, request: { contents, tools, generationConfig, systemInstruction } }
 *
 * Shape B (flat Gemini SA):
 * { model, contents, tools, generationConfig, systemInstruction }
 *
 * @param model - bare model
 * @param projectId - optional project
 * @param contents - Gemini contents array
 * @param tools - googleSearch + urlContext tools
 * @param generationConfig - thinking + temp
 * @param systemInstruction - optional system instruction
 */
function buildGenerateContentBody(opts: {
  model: string;
  projectId?: string | undefined;
  contents: any[];
  tools: any[];
  generationConfig: any;
  systemInstruction?: any | undefined;
}): any {
  const { model, projectId, contents, tools, generationConfig, systemInstruction } = opts;

  if (projectId) {
    // wrapped — observed in AM content traffic
    return {
      model,
      project: projectId,
      request: {
        contents,
        tools,
        generationConfig,
        ...(systemInstruction ? { systemInstruction } : {}),
      },
    };
  }
  // flat
  return {
    model,
    contents,
    tools,
    generationConfig,
    ...(systemInstruction ? { systemInstruction } : {}),
  };
}

/**
 * Builds alternative body with models/ prefix if primary fails with 404/400.
 * Fallback chain: bare → withPrefix → wrapped with other model variant.
 */
function buildAlternativeBodies(
  primaryBody: any,
  normalized: ReturnType<typeof normalizeModelName>,
  projectId?: string,
): any[] {
  const bodies: any[] = [];
  const { bare, withPrefix } = normalized;

  // 1. try bare flat if primary was wrapped
  if (primaryBody.project) {
    bodies.push({
      model: bare,
      contents: primaryBody.request.contents,
      tools: primaryBody.request.tools,
      generationConfig: primaryBody.request.generationConfig,
      ...(primaryBody.request.systemInstruction ? { systemInstruction: primaryBody.request.systemInstruction } : {}),
    });
  }
  // 2. try withPrefix
  bodies.push({
    ...primaryBody,
    model: withPrefix,
  });
  if (primaryBody.request) {
    bodies.push({
      model: withPrefix,
      project: projectId,
      request: { ...primaryBody.request },
    });
    bodies.push({
      model: withPrefix,
      contents: primaryBody.request.contents,
      tools: primaryBody.request.tools,
      generationConfig: primaryBody.request.generationConfig,
      ...(primaryBody.request.systemInstruction ? { systemInstruction: primaryBody.request.systemInstruction } : {}),
    });
  } else {
    bodies.push({
      model: withPrefix,
      contents: primaryBody.contents,
      tools: primaryBody.tools,
      generationConfig: primaryBody.generationConfig,
      ...(primaryBody.systemInstruction ? { systemInstruction: primaryBody.systemInstruction } : {}),
    });
  }
  // 3. try fallback models from SEARCH_MODEL_FALLBACKS
  for (const fallbackModel of SEARCH_MODEL_FALLBACKS) {
    if (fallbackModel === bare || fallbackModel === withPrefix) continue;
    bodies.push({
      model: fallbackModel,
      project: projectId,
      request: primaryBody.request ?? {
        contents: primaryBody.contents,
        tools: primaryBody.tools,
        generationConfig: primaryBody.generationConfig,
      },
    });
    if (bodies.length > 8) break;
  }
  return bodies;
}

// ---------------------------------------------------------------------------
// Grounding parse — rigorous, handles heterogenous server shapes
// ---------------------------------------------------------------------------

/**
 * Extracts text from Gemini candidate content parts.
 * Observer notes parts may be [{text}, {thought}, {inlineData}] — only text counted.
 *
 * @param candidate - candidate object
 */
function extractTextFromCandidate(candidate: any): string {
  if (!candidate) return "";
  // direct text field (some internal shapes)
  if (typeof candidate.text === "string") return candidate.text;
  if (candidate.content?.parts && Array.isArray(candidate.content.parts)) {
    const texts: string[] = [];
    for (const part of candidate.content.parts) {
      if (part && typeof part.text === "string" && part.text.length > 0) {
        // thought parts are flagged think? but per spec includeThoughts=false we get only answer
        if (part.thought === true) continue;
        texts.push(part.text);
      }
    }
    if (texts.length > 0) return texts.join("\n");
  }
  // alternative: candidates[0].content.parts aggregation handled outside
  return "";
}

/**
 * Parses groundingMetadata from various response shapes.
 * Observer is resilient: checks candidate.groundingMetadata, response.groundingMetadata,
 * and alternative field grounding_metadata.
 *
 * @param response - full JSON response
 * @param candidate - first candidate
 */
function parseGroundingMetadataFromResponse(response: any, candidate: any): GroundingMetadata | undefined {
  if (candidate?.groundingMetadata) return candidate.groundingMetadata as GroundingMetadata;
  if (candidate?.grounding_metadata) return candidate.grounding_metadata as GroundingMetadata;
  if (response?.groundingMetadata) return response.groundingMetadata as GroundingMetadata;
  if (response?.grounding_metadata) return response.grounding_metadata as GroundingMetadata;
  // sometimes in candidates[0].citationMetadata.grounding? not
  if (response?.candidates && Array.isArray(response.candidates) && response.candidates[0]?.groundingMetadata) {
    return response.candidates[0].groundingMetadata as GroundingMetadata;
  }
  return undefined;
}

/**
 * Normalizes groundingChunks into WebGroundingChunk[] with uri/title/domain.
 * Observer filters out chunks without uri, dedupes by uri preservation order.
 *
 * @param meta - groundingMetadata
 */
function normalizeGroundingChunks(meta: GroundingMetadata | undefined): WebGroundingChunk[] {
  if (!meta?.groundingChunks || !Array.isArray(meta.groundingChunks)) return [];
  const seen = new Set<string>();
  const out: WebGroundingChunk[] = [];
  for (const ch of meta.groundingChunks) {
    const web = (ch as any).web ?? (ch as any).retrievedContext ?? {};
    const rawUri = web.uri ?? (ch as any).uri ?? "";
    const rawTitle = web.title ?? (ch as any).title ?? "";
    if (!rawUri || typeof rawUri !== "string") continue;
    // normalize uri
    let uri: string;
    try {
      // basic validation — must be http(s)
      const u = new URL(rawUri);
      if (!u.protocol.startsWith("http")) continue;
      uri = u.toString();
    } catch {
      continue;
    }
    if (seen.has(uri)) continue;
    seen.add(uri);
    let domain: string | undefined;
    try {
      domain = new URL(uri).hostname;
    } catch {
      domain = undefined;
    }
    out.push({
      uri,
      title: String(rawTitle || domain || uri).slice(0, 500),
      domain,
    });
  }
  return out;
}

/**
 * Extracts webSearchQueries from groundingMetadata.
 */
function extractWebSearchQueries(meta: GroundingMetadata | undefined): string[] {
  if (!meta) return [];
  const queries = meta.webSearchQueries ?? meta.retrievalQueries ?? [];
  if (!Array.isArray(queries)) return [];
  return queries
    .filter((q) => typeof q === "string" && (q as string).trim().length > 0)
    .map((q) => String(q).trim())
    .slice(0, 20); // cap 20 queries per spec sanity
}

// ---------------------------------------------------------------------------
// Core — executeSearch
// ---------------------------------------------------------------------------

/**
 * Executes grounded search using Gemini native googleSearch + urlContext tools.
 * Third-person observer pattern: imitates Antigravity's google_search tool wrapper
 * but calls cloudcode-pa.googleapis.com directly, no localhost proxy.
 *
 * The observer:
 * 1. Validates query + accessToken.
 * 2. Resolves proxy (env + option) with NO_PROXY bypass.
 * 3. Resolves thinking budget from level or direct number, clamped 32k.
 * 4. Builds contents + tools [{googleSearch:{}},{urlContext:{}}] + generationConfig.
 * 5. Builds Antigravity headers (Bearer, UA dynamic, Client-Metadata, Api-Client)
 *    stripping x-goog-user-project per bypass spec.
 * 6. Cascades endpoints PROD → DAILY → SANDBOX on 403/404/5xx with jitter 0-80ms.
 * 7. Parses groundingMetadata.groundingChunks[].web.uri/title and webSearchQueries.
 *
 * @param input - query + optional systemPrompt
 * @param auth - OAuth access token + projectId + UA override
 * @param opts - model, thinking, proxy, timeout, endpoints, etc.
 * @returns grounded SearchResult with parsed chunks
 *
 * @throws SearchError on validation, timeout, 401, exhausted cascade, or invalid JSON.
 *
 * @example
 * ```ts
 * const result = await executeSearch(
 *   { query: "latest Gemini 3 flash grounding changes 2026" },
 *   { accessToken: "...", projectId: "rising-fact-p41fc" },
 *   { thinkingLevel: "medium", useUrlContext: true }
 * );
 * console.log(result.text);
 * console.log(result.groundingChunks.map(c=>c.uri));
 * ```
 */
export async function executeSearch(
  input: ExecuteSearchInput,
  auth: ExecuteSearchAuth,
  opts: ExecuteSearchOptions = {},
): Promise<SearchResult> {
  // -----------------------------------------------------------------------
  // Validation — production ready, no placeholder
  // -----------------------------------------------------------------------
  if (!input || typeof input.query !== "string" || input.query.trim().length === 0) {
    throw new SearchError("query must be a non-empty string", { code: "INVALID_QUERY" });
  }
  const query = input.query.trim();
  if (query.length > 20000) {
    throw new SearchError(`query too long (${query.length} > 20000 chars)`, { code: "QUERY_TOO_LONG" });
  }
  if (!auth || typeof auth.accessToken !== "string" || auth.accessToken.trim().length === 0) {
    throw new SearchError("accessToken required — missing auth.accessToken Bearer", { code: "MISSING_TOKEN" });
  }
  const accessToken = auth.accessToken.trim();
  // basic Bearer format check — JWT-ish or ya29.
  if (accessToken.length < 20) {
    throw new SearchError("accessToken appears too short to be valid", { code: "INVALID_TOKEN" });
  }

  // -----------------------------------------------------------------------
  // Resolve model — SEARCH_MODEL gemini-3-flash per spec
  // -----------------------------------------------------------------------
  const rawModel = (opts.model ?? SEARCH_MODEL).trim() || SEARCH_MODEL;
  const normalizedModel = normalizeModelName(rawModel);
  const modelBare = normalizedModel.bare || SEARCH_MODEL;

  // -----------------------------------------------------------------------
  // Thinking budget — level → budget map, clamped
  // -----------------------------------------------------------------------
  const thinkingBudget = resolveThinkingBudget(opts.thinkingLevel, opts.thinkingBudget);

  // -----------------------------------------------------------------------
  // Tools — native googleSearch + urlContext per requirement
  // -----------------------------------------------------------------------
  const useGoogleSearch = opts.useGoogleSearch !== false; // default true
  const useUrlContext = opts.useUrlContext !== false; // default true
  const tools: any[] = [];
  if (useGoogleSearch) tools.push({ googleSearch: {} });
  if (useUrlContext) tools.push({ urlContext: {} });
  // fallback — at least one grounding tool required
  if (tools.length === 0) tools.push({ googleSearch: {} });

  // -----------------------------------------------------------------------
  // Contents + system instruction
  // -----------------------------------------------------------------------
  const contents: any[] = [
    {
      role: "user",
      parts: [
        {
          text: input.additionalContext ? `${query}\n\nContext: ${input.additionalContext}` : query,
        },
      ],
    },
  ];

  const systemInstruction = input.systemPrompt
    ? { parts: [{ text: String(input.systemPrompt).slice(0, 8000) }] }
    : undefined;

  const generationConfig: any = {
    // Thinking — Gemini 3 supports thinkingConfig
    thinkingConfig: {
      thinkingBudget,
      includeThoughts: false,
    },
    temperature: typeof opts.temperature === "number" ? opts.temperature : 0.2,
    maxOutputTokens: typeof opts.maxOutputTokens === "number" ? opts.maxOutputTokens : 8192,
  };

  const primaryBody = buildGenerateContentBody({
    model: modelBare,
    projectId: auth.projectId,
    contents,
    tools,
    generationConfig,
    systemInstruction,
  });

  // -----------------------------------------------------------------------
  // Proxy resolution — supports HTTP_PROXY/HTTPS_PROXY/NO_PROXY
  // -----------------------------------------------------------------------
  // Use first endpoint as NO_PROXY check target — if endpoint in NO_PROXY list, bypass
  const firstEndpointForProxyCheck = (opts.endpoints?.[0] ?? DEFAULT_ENDPOINT_ORDER[0]) + GENERATE_CONTENT_ENDPOINT;
  const proxyResolution = resolveProxyUrl(opts.proxyUrl, firstEndpointForProxyCheck);
  const proxyUrlStr = proxyResolution.proxyUrl;

  // -----------------------------------------------------------------------
  // UA + headers — observer builds dynamic UA antigravity/{ver} {os}/{arch}
  // -----------------------------------------------------------------------
  const version = auth.version ?? ANTIGRAVITY_VERSION_FALLBACK;
  const userAgent = auth.userAgent ?? getDynamicUserAgent(version);
  const extraHeaders: Record<string, string> = {};
  // allow projectId as header? No — strip per bypass. Project sent in body only.

  const baseHeaders = buildAntagravityHeaders(accessToken, { userAgent, extra: extraHeaders });

  // -----------------------------------------------------------------------
  // Endpoint cascade
  // -----------------------------------------------------------------------
  const endpoints = opts.endpoints && opts.endpoints.length > 0 ? opts.endpoints : [...DEFAULT_ENDPOINT_ORDER];
  const timeoutMs = typeof opts.timeoutMs === "number" && opts.timeoutMs > 0 ? opts.timeoutMs : SEARCH_TIMEOUT_MS;
  const jitterEnabled = opts.jitter !== false;

  let lastError: SearchError | Error | null = null;
  let attemptedBodiesTried = 0;

  // For debugging
  if (opts.debug) {
    // eslint-disable-next-line no-console
    console.debug(
      `[search] observer start queryLen=${query.length} model=${modelBare} budget=${thinkingBudget} proxy=${proxyResolution.source} tokenHash=${hashToken(accessToken)} endpoints=${endpoints.join(",")}`,
    );
  }

  // Try each endpoint, with body fallback strategy
  for (let epIdx = 0; epIdx < endpoints.length; epIdx++) {
    const base = endpoints[epIdx]!.replace(/\/$/, "");
    const url = `${base}${GENERATE_CONTENT_ENDPOINT}`;

    // Try primary body + alternative bodies if 400/404
    const bodiesToTry = [primaryBody, ...buildAlternativeBodies(primaryBody, normalizedModel, auth.projectId)];
    // deduplicate by JSON stringify quickly via model name (small optimization)
    const seenModels = new Set<string>();
    const dedupedBodies: any[] = [];
    for (const b of bodiesToTry) {
      const key = `${b.model}|${b.project ?? ""}|${b.request ? "wrapped" : "flat"}`;
      if (seenModels.has(key)) continue;
      seenModels.add(key);
      dedupedBodies.push(b);
    }

    for (let bodyIdx = 0; bodyIdx < dedupedBodies.length; bodyIdx++) {
      const body = dedupedBodies[bodyIdx];
      attemptedBodiesTried++;

      // To avoid infinite loops, limit total attempts
      if (opts.maxRetries && attemptedBodiesTried > (opts.maxRetries ?? 8) * endpoints.length) break;

      const fetchHeaders = { ...baseHeaders };

      const fetchInit: RequestInit = {
        method: "POST",
        headers: fetchHeaders as any,
        body: JSON.stringify(body),
      };

      if (opts.debug) {
        // eslint-disable-next-line no-console
        console.debug(
          `[search] attempt ep=${base} bodyModel=${body.model} wrapped=${!!body.request} attempt=${attemptedBodiesTried}`,
        );
      }

      let res: any;
      try {
        res = await fetchWithProxyTimeout(url, fetchInit, timeoutMs, proxyUrlStr);
      } catch (networkErr: any) {
        // network failure — retryable
        const err = new SearchError(`network failure to ${base}: ${networkErr?.message ?? String(networkErr)}`, {
          endpoint: base,
          retryable: true,
          code: "NETWORK_ERROR",
          cause: networkErr,
        });
        lastError = err;
        if (opts.debug) console.debug(`[search] network error ${err.message}`);
        // jitter before next endpoint/body
        if (jitterEnabled) await sleep(getJitter());
        continue; // next body / endpoint
      }

      // HTTP status handling
      const status: number = res.status ?? 0;
      if (!res.ok) {
        let bodyText = "";
        try {
          bodyText = await res.text();
        } catch {
          bodyText = "";
        }

        // Parse error for log trimming
        const truncated = bodyText.slice(0, 2000);

        const retryable = isRetryableStatus(status);
        const code =
          status === 401
            ? "UNAUTHORIZED"
            : status === 403
              ? "FORBIDDEN"
              : status === 429
                ? "RATE_LIMITED"
                : status >= 500
                  ? "SERVER_ERROR"
                  : "HTTP_ERROR";

        const err = new SearchError(`search failed ${status} at ${base}: ${truncated}`, {
          status,
          endpoint: base,
          retryable,
          code,
        });

        lastError = err;

        if (opts.debug) {
          // eslint-disable-next-line no-console
          console.debug(`[search] http ${status} retryable=${retryable} body=${truncated.slice(0, 500)}`);
        }

        // 401 Unauthorized — no point retrying other endpoints with same token
        if (status === 401) {
          throw err;
        }

        // 403/404/429/5xx — try next endpoint (cascade) or next body variant if 400
        if (status === 400 && bodyIdx === 0) {
          // bad request maybe due to model naming — try next body variant without switching endpoint
          if (jitterEnabled) await sleep(getJitter());
          continue;
        }

        if (retryable) {
          if (jitterEnabled) await sleep(getJitter());
          // break inner body loop to try next endpoint
          break;
        }

        // non-retryable 400 etc. — if first body, try alternative bodies
        if (status === 400 && bodyIdx < dedupedBodies.length - 1) {
          if (jitterEnabled) await sleep(getJitter());
          continue;
        }

        // otherwise keep as lastError and try next endpoint
        if (jitterEnabled) await sleep(getJitter());
        break;
      }

      // -----------------------------------------------------------------
      // Success path — parse JSON
      // -----------------------------------------------------------------
      let json: any;
      try {
        json = await res.json();
      } catch (parseErr: any) {
        let txt = "";
        try {
          txt = await res.text();
        } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
        throw new SearchError(
          `failed parsing search JSON from ${base}: ${parseErr?.message ?? String(parseErr)} — text: ${txt.slice(0, 1000)}`,
          {
            status,
            endpoint: base,
            code: "INVALID_JSON",
            cause: parseErr,
          },
        );
      }

      // Response shape may be array? Some internal endpoints wrap in []?
      // Normalize: if json is array, take first
      const responseObj = Array.isArray(json) ? json[0] : json;

      // Candidates extraction — heterogenous shapes
      const candidates = responseObj?.candidates ?? responseObj?.response?.candidates ?? [];
      const firstCandidate = Array.isArray(candidates) && candidates.length > 0 ? candidates[0] : responseObj;

      const text =
        extractTextFromCandidate(firstCandidate) ||
        (typeof responseObj?.text === "string" ? responseObj.text : "") ||
        (typeof responseObj?.output === "string" ? responseObj.output : "");

      if (!text || text.trim().length === 0) {
        // Sometimes grounding only returns metadata without text when query is just URLs? Treat as empty but still return grounding
        if (opts.debug)
          console.debug(`[search] empty text but status ok, json keys=${Object.keys(responseObj).join(",")}`);
      }

      const groundingMeta = parseGroundingMetadataFromResponse(responseObj, firstCandidate);
      const groundingChunks = normalizeGroundingChunks(groundingMeta);
      const webSearchQueries = extractWebSearchQueries(groundingMeta);

      const result: SearchResult = {
        text: text ?? "",
        query,
        model: body.model ?? modelBare,
        grounded: groundingChunks.length > 0 || webSearchQueries.length > 0,
        webSearchQueries,
        groundingChunks,
        groundingSupports: groundingMeta?.groundingSupports,
        searchEntryPoint: groundingMeta?.searchEntryPoint,
        groundingMetadata: opts.includeGrounding !== false ? groundingMeta : undefined,
        raw: responseObj,
        endpointUsed: base,
        thinkingBudgetUsed: thinkingBudget,
        isFallbackProject: auth.projectId === "rising-fact-p41fc" || body.project === "rising-fact-p41fc",
      };

      if (opts.debug) {
        // eslint-disable-next-line no-console
        console.debug(
          `[search] success endpoint=${base} grounded=${result.grounded} chunks=${result.groundingChunks.length} queries=${result.webSearchQueries.length} textLen=${result.text.length}`,
        );
      }

      return result;
    } // end bodies loop

    // after body loop for this endpoint, if we exhausted bodies and have retryable error, continue to next endpoint
    // jitter already applied
  } // end endpoints loop

  // -----------------------------------------------------------------------
  // All endpoints failed — throw last error with context
  // -----------------------------------------------------------------------
  if (lastError) {
    if (lastError instanceof SearchError) throw lastError;
    throw new SearchError(
      `all search endpoints failed: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
      {
        code: "ALL_ENDPOINTS_FAILED",
        cause: lastError,
      },
    );
  }
  throw new SearchError(
    `all search endpoints failed without specific error — attempted ${endpoints.length} endpoints, ${attemptedBodiesTried} bodies`,
    {
      code: "ALL_ENDPOINTS_FAILED",
    },
  );
}

// ---------------------------------------------------------------------------
// Convenience wrappers — library-first root-first exports
// ---------------------------------------------------------------------------

/**
 * Convenience: execute search with project fallback rising-fact-p41fc.
 * Observer notes this fallback works for Antigravity but 403 for Gemini CLI models.
 *
 * @param query - search query
 * @param accessToken - bearer token
 * @param opts - optional search options + projectId override
 */
export async function searchWithFallback(
  query: string,
  accessToken: string,
  opts: ExecuteSearchOptions & { projectId?: string; systemPrompt?: string } = {},
): Promise<SearchResult> {
  const projectId = opts.projectId ?? "rising-fact-p41fc";
  return executeSearch({ query, systemPrompt: opts.systemPrompt }, { accessToken, projectId }, opts);
}

/**
 * Extracts only grounding URIs from result — helper for TUI.
 *
 * @param result - SearchResult
 * @returns uri strings
 */
export function extractGroundingUris(result: SearchResult): string[] {
  return result.groundingChunks.map((c) => c.uri).filter(Boolean);
}

/**
 * Extracts grounding titles for UI display.
 */
export function extractGroundingTitles(result: SearchResult): Array<{ uri: string; title: string }> {
  return result.groundingChunks.map((c) => ({ uri: c.uri, title: c.title }));
}

// ---------------------------------------------------------------------------
// Plugin helpers - search gating, grounding formatting, image generation
// (ported from search(3).ts lineage)
// ---------------------------------------------------------------------------

/**
 * Decides whether native googleSearch grounding should be enabled for a model
 * given plugin config (`google_search_enabled`: true | "auto" | falsy).
 */
export const shouldEnableSearch = (model: string, cfg: any): boolean => {
  if (cfg?.google_search_enabled === true) return true;
  if (cfg?.google_search_enabled === "auto") {
    const l = model.toLowerCase();
    return l.includes("gemini") && !l.includes("image");
  }
  return false;
};

/** Builds the native grounding tool list: googleSearch + urlContext. */
export const buildSearchTools = (): any[] => [{ googleSearch: {} }, { urlContext: {} }];

/** Normalizes groundingMetadata chunks into {uri,title} pairs.
 * Identical to core.parseGrounding — imported from the frozen owner and
 * re-exported above. */

/** Formats grounding sources as markdown citation lines. */
export const extractCitations = (grounding: any[]): string =>
  grounding.map((g) => `[${g.title || "source"}](${g.uri})`).join("\n");

/**
 * Saves a base64-encoded PNG under ~/.config/opencode/generated-images (or a
 * custom dir) using an timestamped random filename; returns the written path.
 */
export const saveGeneratedImage = async (b64: string, dir?: string): Promise<string> => {
  const base = dir || pathJoin(os.homedir(), ".config", "opencode", "generated-images");
  try {
    mkdirSync(base, { recursive: true });
  } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
  const name = `img-${Date.now()}-${Math.random().toString(16).slice(2)}.png`;
  const filePath = pathJoin(base, name);
  const buf = Buffer.from(b64, "base64");
  writeFileSync(filePath, buf);
  return filePath;
};

/** Renders grounding sources as a markdown bullet list. */
export const groundingToMarkdown = (grounding: any[]): string =>
  grounding.map((g) => `- [${g.title || g.uri}](${g.uri})`).join("\n");

// ---------------------------------------------------------------------------
// Barrel default export — library-first
// ---------------------------------------------------------------------------

export const Search = {
  SEARCH_MODEL,
  SEARCH_MODEL_PREVIEW,
  SEARCH_MODEL_FALLBACKS,
  CODE_ASSIST_ENDPOINTS,
  DEFAULT_ENDPOINT_ORDER,
  GENERATE_CONTENT_ENDPOINT,
  THINKING_BUDGET_MAP,
  THINKING_LEVELS,
  THINKING_BUDGET_MAX_GEMINI,
  ANTIGRAVITY_VERSION_FALLBACK,
  ANTIGRAVITY_USER_AGENT_FALLBACK,
  getDynamicUserAgent,
  buildAntagravityHeaders,
  fetchWithProxyTimeout,
  resolveProxyUrl,
  isNoProxyMatch,
  resolveThinkingBudget,
  normalizeModelName,
  executeSearch,
  searchWithFallback,
  extractGroundingUris,
  extractGroundingTitles,
  shouldEnableSearch,
  buildSearchTools,
  parseGrounding,
  extractCitations,
  isImageGenModel,
  buildImageGenConfig,
  saveGeneratedImage,
  groundingToMarkdown,
  SearchError,
  isRetryableStatus,
  getJitter,
  fnv1a32,
};

export default Search;
