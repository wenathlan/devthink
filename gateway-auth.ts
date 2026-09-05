/**
 * authentication — universal authentication for any llm api
 * one file one responsibility — only auth and key logic lives here
 * 0 to 100 correlated logics grouped in this one file
 *
 * supports 12 auth methods found across the llm api market:
 *   bearer                — authorization bearer (openai nvidia groq mistral deepseek kimi xai openrouter)
 *   apikeyheader          — x-api-key (anthropic) x-goog-api-key (gemini) api-key (azure)
 *   queryparam            — key or api_key as url query param
 *   basic                 — authorization basic base64 user colon pass
 *   oauth2clientcredentials — token endpoint then bearer (ibm watsonx azure entra auth0)
 *   jwtsign               — hs256 signed tokens zhipu keyid dot secret format
 *   sigv4                 — aws4-hmac-sha256 request signing (bedrock)
 *   hmacsign              — stripe github slack webhook signatures
 *   cookie                — session cookie auth
 *   mtls                  — client certificate mutual tls
 *   keylesssdk            — sdk resolved auth like z-ai-web-dev-sdk
 *   anonymous none        — keyless free endpoints opencode zen kilo ollama
 *
 * key sources resolve in order — db then env then inline
 * keys rotate round robin across requests via the engine cursor
 */

import type { authconfig, resolvedkey } from "./types";
import { genid } from "./utils";

// ---------------------------------------------------------------------------
// inbound extractors — read credentials from client requests
// ---------------------------------------------------------------------------

/** extract token — get user supplied token from headers or body */
export function extracttoken(req: Request, body?: Record<string, unknown>): string {
  return (
    req.headers.get("x-token") ||
    req.headers.get("authorization")?.replace(/^bearer\s+/i, "") ||
    req.headers.get("x-api-key") ||
    req.headers.get("x-goog-api-key") ||
    req.headers.get("api-key") ||
    (body?.token as string) ||
    (body?.apiKey as string) ||
    ""
  );
}

/** extract chat id — get or generate chat id for zai api */
export function extractchatid(req: Request, body?: Record<string, unknown>): string {
  return (
    req.headers.get("x-chat-id") ||
    req.headers.get("x-user-id") ||
    (body?.chat_id as string) ||
    (body?.chatId as string) ||
    (body?.userId as string) ||
    genid("chat")
  );
}

/** extract session id — get or generate session id for context tracking */
export function extractsessionid(req: Request, body?: Record<string, unknown>): string {
  return (
    req.headers.get("x-session-id") ||
    (body?.session_id as string) ||
    (body?.sessionId as string) ||
    genid("sess")
  );
}

/** extract request id — get or generate request id */
export function extractrequestid(req: Request): string {
  return req.headers.get("x-request-id") || genid("req");
}

/** validate token — check if token format is valid */
export function validatetoken(token: string): boolean {
  if (!token || token.length < 10) return false;
  return true;
}

/** mask token — mask token for logging showing only prefix and suffix */
export function masktoken(token: string): string {
  if (!token || token.length < 12) return "invalid";
  return `${token.slice(0, 8)}...${token.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// universal key resolution — db env inline ephemeral
// ---------------------------------------------------------------------------

/** resolve keys from the db source — prisma model lookup */
async function keysfromdb(auth: authconfig): Promise<resolvedkey[]> {
  const model = auth.dbmodel ?? "apiKey";
  const take = auth.dbtake ?? 50;
  try {
    const { db } = await import("./database");
    const table = (
      db as unknown as Record<
        string,
        {
          findMany: (args: Record<string, unknown>) => Promise<Array<Record<string, unknown>>>;
        }
      >
    )[model];
    if (!table) return [];
    const rows = await table.findMany({ where: { active: true, status: "active" }, take });
    return rows
      .map((row, idx) => ({
        key: String(row.keyValue ?? row.key ?? ""),
        label: String(
          row.label ?? (auth.keylabelformat ?? "key-{idx}").replace("{idx}", String(idx)),
        ),
        source: "db" as const,
      }))
      .filter((k) => k.key.length > 0);
  } catch {
    return [];
  }
}

/** resolve keys from the env source — single or separator-joined */
function keysfromenv(auth: authconfig): resolvedkey[] {
  if (!auth.envvar) return [];
  const raw = process.env[auth.envvar] ?? "";
  const sep = auth.envseparator ?? ",";
  const keys = raw
    .split(sep)
    .map((k) => k.trim())
    .filter(Boolean);
  return keys.map((key, idx) => ({
    key,
    label: (auth.keylabelformat ?? "env-key-{idx}").replace("{idx}", String(idx)),
    source: "env" as const,
  }));
}

/** resolve keys from the inline source — config provided */
function keysfrominline(auth: authconfig): resolvedkey[] {
  return (auth.inlinekeys ?? []).map((key, idx) => ({
    key,
    label: (auth.keylabelformat ?? "inline-key-{idx}").replace("{idx}", String(idx)),
    source: "inline" as const,
  }));
}

/** resolve keys from the ephemeral url source — babel town pattern */
async function keysfromephemeral(auth: authconfig): Promise<resolvedkey[]> {
  if (!auth.keyurl) return [];
  try {
    const res = await fetch(auth.keyurl, { method: "GET" });
    const data = (await res.json()) as Record<string, unknown>;
    const key = String(data.key ?? data.api_key ?? data.token ?? "");
    if (!key) return [];
    return [{ key, label: "ephemeral", source: "ephemeralurl" as const }];
  } catch {
    return [];
  }
}

/** resolvekeys — resolve all available keys per the auth config source order */
export async function resolvekeys(auth: authconfig): Promise<resolvedkey[]> {
  const sources = auth.keysources ?? ["env"];
  const minlen = auth.minkeylength ?? 10;
  const all: resolvedkey[] = [];
  for (const source of sources) {
    if (source === "db") all.push(...(await keysfromdb(auth)));
    else if (source === "env") all.push(...keysfromenv(auth));
    else if (source === "inline") all.push(...keysfrominline(auth));
    else if (source === "ephemeralurl") all.push(...(await keysfromephemeral(auth)));
  }
  return all.filter((k) => k.key.length >= minlen);
}

// ---------------------------------------------------------------------------
// outbound header building — per auth method
// ---------------------------------------------------------------------------

/** buildauthheaders — build upstream auth headers from the auth config and key */
export function buildauthheaders(auth: authconfig, key: string): Record<string, string> {
  const headers: Record<string, string> = {};
  switch (auth.mode) {
    case "bearer":
    case "oauth2clientcredentials":
    case "jwtsign":
      headers["authorization"] = `Bearer ${key}`;
      break;
    case "apikeyheader":
      headers[auth.headername ?? "x-api-key"] = key;
      break;
    case "basic": {
      const encoded = Buffer.from(key).toString("base64");
      headers["authorization"] = `Basic ${encoded}`;
      break;
    }
    case "queryparam":
    case "cookie":
    case "mtls":
    case "sigv4":
    case "hmacsign":
    case "keylesssdk":
    case "anonymous":
    case "none":
      // these methods do not use simple headers — handled by transport or url
      break;
  }
  // ride-along headers — anthropic-version azure api-version http-referer x-title etc
  for (const [k, v] of Object.entries(auth.extraheaders ?? {})) {
    headers[k] = v;
  }
  return headers;
}

/** buildauthqueryparams — build query params for queryparam auth mode */
export function buildauthqueryparams(auth: authconfig, key: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (auth.mode === "queryparam") {
    params[auth.queryparamname ?? "key"] = key;
  }
  for (const [k, v] of Object.entries(auth.extraparams ?? {})) {
    params[k] = v;
  }
  return params;
}

/** appendqueryparams — append query params to a url string */
export function appendqueryparams(url: string, params: Record<string, string>): string {
  const entries = Object.entries(params);
  if (entries.length === 0) return url;
  const separator = url.includes("?") ? "&" : "?";
  const qs = entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
  return `${url}${separator}${qs}`;
}

// ---------------------------------------------------------------------------
// legacy helpers — kept for backward compat with existing callers
// ---------------------------------------------------------------------------

/** get key by index — simple round robin helper for single key lookups */
export async function getkey(auth: authconfig, index = 0): Promise<string> {
  const keys = await resolvekeys(auth);
  if (keys.length === 0) return "";
  return keys[index % keys.length].key;
}

/** get key count — total resolvable keys */
export async function getkeycount(auth: authconfig): Promise<number> {
  const keys = await resolvekeys(auth);
  return keys.length;
}
