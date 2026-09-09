/**
 * The server module of the merged repository: the workbench loopback server beside the embedded
 * gateway server of the merged lineages — the http transport and the sse/ndjson stream pipeline,
 * the request auth and the key resolution, the gateway console cli and the library barrel the
 * server surface re-exports — interned in this one file, one surface without duplicate variations.
 */

import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { randomInt } from "node:crypto";
import { isAllowedOrigin } from "./compatibility.js";
import { listModels, listProviders, streamChat, type ChatMessage } from "./providers.js";
import { ensurePaths, resolvePaths, saveConfig, type DevThinkConfig, type DevThinkPaths } from "./config.js";
import {
  consumePairing,
  getIdentity,
  pairingStatus,
  revokeBrowserSessions,
  setIdentityUserId,
  verifyBrowserSession,
} from "./identity.js";
import {
  appendMessage,
  createSession,
  createTab,
  listSessions,
  loadSession,
  loadWorkspace,
  updateTab,
  type SessionSection,
} from "./workbench-session.js";
import { readPreferences, savePreference } from "./storage.js";

export type ServerOptions = {
  port?: number | undefined;
  config: DevThinkConfig;
  paths?: DevThinkPaths;
};

export type ServerHandle = {
  address: string;
  port: number;
  stop: () => Promise<void>;
};

function writeJson(response: ServerResponse, status: number, payload: unknown, origin?: string): void {
  if (origin) response.setHeader("access-control-allow-origin", origin);
  response.setHeader("vary", "Origin");
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function safeOrigin(request: IncomingMessage, config: DevThinkConfig): string | undefined {
  const origin = request.headers.origin;
  return isAllowedOrigin(origin, config.web?.allowedOrigins) ? origin : undefined;
}

function bearerToken(request: IncomingMessage): string | undefined {
  const value = request.headers.authorization;
  return value?.startsWith("Bearer ") ? value.slice("Bearer ".length).trim() || undefined : undefined;
}

function writeEvent(response: ServerResponse, type: string, payload: unknown): void {
  response.write(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`);
}

async function readBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  const parsed: unknown = raw ? JSON.parse(raw) : {};
  return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
}

function acceptsJson(request: IncomingMessage): boolean {
  return request.headers["content-type"]?.toLowerCase().includes("application/json") === true;
}

const browserPreferenceKeys = new Set(["theme", "railMode", "interfaceZoom"]);

function messagesFromBody(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) throw new Error("messages must be an array.");
  return value.map((item) => {
    const message = item as Record<string, unknown>;
    if (!message.content || !["system", "user", "assistant"].includes(String(message.role)))
      throw new Error("Each message needs a supported role and content.");
    return { role: message.role as ChatMessage["role"], content: String(message.content) };
  });
}

function sectionFrom(value: unknown): SessionSection {
  return ["chat", "inspector", "settings", "memory", "providers", "projects", "routes", "usage"].includes(String(value))
    ? (value as SessionSection)
    : "chat";
}

function routeParts(pathname: string): string[] {
  return pathname.split("/").filter(Boolean).map(decodeURIComponent);
}

async function streamChatRoute(
  request: IncomingMessage,
  response: ServerResponse,
  config: DevThinkConfig,
  paths: DevThinkPaths,
  origin?: string,
): Promise<void> {
  const body = await readBody(request);
  const provider = String(body.provider || config.provider || "");
  const model = String(body.model || config.model || "");
  if (!provider || !model) return writeJson(response, 400, { error: "provider and model are required." }, origin);
  const incoming = messagesFromBody(body.messages);
  const prompt = [...incoming].reverse().find((message) => message.role === "user");
  if (!prompt) return writeJson(response, 400, { error: "messages must include a user message." }, origin);
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : undefined;
  const tabId = typeof body.tabId === "string" ? body.tabId : undefined;
  const sectionId = sectionFrom(body.sectionId);
  let session = sessionId ? loadSession(paths, sessionId) : undefined;
  if (sessionId && !session) return writeJson(response, 404, { error: "Session not found." }, origin);
  if (!session)
    session = createSession(paths, {
      mode: typeof body.mode === "string" ? body.mode : "chat",
      model,
      provider,
      workspaceId,
      tabId,
      sectionId,
      title: typeof body.title === "string" ? body.title : undefined,
    });
  if (workspaceId && session.workspaceId !== workspaceId)
    return writeJson(response, 409, { error: "workspaceId does not match the session." }, origin);
  if (tabId && !session.tabs.some((tab) => tab.id === tabId))
    return writeJson(response, 404, { error: "Tab not found." }, origin);
  session = appendMessage(paths, session, prompt, { tabId: tabId || session.activeTabId, sectionId });
  const history = session.messages.map(({ role, content }) => ({ role, content }));
  const events = await streamChat(
    {
      provider,
      model,
      messages: history,
      temperature: typeof body.temperature === "number" ? body.temperature : config.temperature,
      maxTokens: typeof body.maxTokens === "number" ? body.maxTokens : config.maxTokens,
    },
    config,
    paths,
  );
  if (origin) response.setHeader("access-control-allow-origin", origin);
  response.setHeader("vary", "Origin");
  response.writeHead(200, {
    "cache-control": "no-cache",
    connection: "keep-alive",
    "content-type": "text/event-stream; charset=utf-8",
  });
  writeEvent(response, "identity", {
    workspaceId: session.workspaceId,
    sessionId: session.id,
    tabId: tabId || session.activeTabId,
    sectionId,
  });
  let text = "";
  for await (const event of events) {
    if (event.type === "text") text += event.text;
    writeEvent(response, event.type, event);
  }
  const persisted = appendMessage(
    paths,
    session,
    { role: "assistant", content: text },
    { tabId: tabId || session.activeTabId, sectionId },
  );
  writeEvent(response, "persisted", {
    workspaceId: persisted.workspaceId,
    sessionId: persisted.id,
    tabId: tabId || persisted.activeTabId,
    messageId: persisted.messages.at(-1)?.id,
  });
  response.end();
}

async function route(
  request: IncomingMessage,
  response: ServerResponse,
  config: DevThinkConfig,
  paths: DevThinkPaths,
): Promise<void> {
  const url = new URL(request.url || "/", "http://127.0.0.1");
  const origin = safeOrigin(request, config);
  if (request.method === "OPTIONS") {
    if (origin) response.setHeader("access-control-allow-origin", origin);
    response.setHeader("access-control-allow-methods", "GET, POST, PATCH, PUT, OPTIONS");
    response.setHeader("access-control-allow-headers", "authorization, content-type");
    response.setHeader("vary", "Origin");
    response.writeHead(204);
    response.end();
    return;
  }
  if (request.headers.origin && !origin)
    return writeJson(response, 403, { error: "Origin is not allowed by web.allowedOrigins." });
  const mutationWithBody =
    ["POST", "PATCH", "PUT"].includes(request.method || "") && url.pathname !== "/pairings/revoke";
  if (mutationWithBody && !acceptsJson(request))
    return writeJson(response, 415, { error: "JSON content-type is required for mutation requests." }, origin);
  if (request.method === "GET" && url.pathname === "/health")
    return writeJson(response, 200, { status: "ok", service: "devthink" }, origin);
  if (request.method === "GET" && url.pathname === "/providers")
    return writeJson(
      response,
      200,
      listProviders().map(({ id, protocol, env }) => ({ id, protocol, env })),
      origin,
    );
  if (request.method === "GET" && url.pathname === "/models") {
    const provider = url.searchParams.get("provider") || config.provider;
    if (!provider) return writeJson(response, 400, { error: "provider is required." }, origin);
    return writeJson(response, 200, await listModels(provider, config, paths), origin);
  }
  const parts = routeParts(url.pathname);
  if (request.method === "POST" && url.pathname === "/pairings/consume") {
    const body = await readBody(request);
    const pairingId = typeof body.pairingId === "string" ? body.pairingId : "";
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const paired = consumePairing(paths, pairingId, code);
    return paired
      ? writeJson(
          response,
          201,
          { token: paired.token, userId: paired.identity.userId, expiresAt: paired.expiresAt },
          origin,
        )
      : writeJson(response, 401, { error: "Pairing code is invalid, expired, or already used." }, origin);
  }
  const browserSession = origin ? verifyBrowserSession(paths, bearerToken(request)) : undefined;
  if (origin && !browserSession)
    return writeJson(response, 401, { error: "A current browser pairing token is required." }, origin);
  if (request.method === "GET" && url.pathname === "/identity")
    return writeJson(response, 200, { identity: getIdentity(paths), pairing: pairingStatus(paths) }, origin);
  if (request.method === "PUT" && url.pathname === "/identity") {
    const body = await readBody(request);
    if (typeof body.userId !== "string") return writeJson(response, 400, { error: "userId is required." }, origin);
    try {
      return writeJson(
        response,
        200,
        { identity: setIdentityUserId(paths, body.userId), pairing: pairingStatus(paths) },
        origin,
      );
    } catch (error) {
      return writeJson(
        response,
        400,
        { error: error instanceof Error ? error.message : "Identity update was rejected." },
        origin,
      );
    }
  }
  if (request.method === "POST" && url.pathname === "/pairings/revoke")
    return writeJson(response, 200, { revoked: revokeBrowserSessions(paths) }, origin);
  if (request.method === "GET" && url.pathname === "/sessions")
    return writeJson(response, 200, { sessions: listSessions(paths) }, origin);
  if (request.method === "GET" && url.pathname === "/workspaces") {
    const workspaces = new Map<string, { id: string; title: string; updatedAt: string; sessionCount: number }>();
    for (const session of listSessions(paths)) {
      const current = workspaces.get(session.workspaceId);
      workspaces.set(session.workspaceId, {
        id: session.workspaceId,
        title: current?.title || session.title.replace(/^Untitled session$/, "Untitled workspace"),
        updatedAt: current?.updatedAt && current.updatedAt > session.updatedAt ? current.updatedAt : session.updatedAt,
        sessionCount: (current?.sessionCount || 0) + 1,
      });
    }
    return writeJson(
      response,
      200,
      { workspaces: [...workspaces.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)) },
      origin,
    );
  }
  if (request.method === "GET" && url.pathname === "/usage") {
    const sessions = listSessions(paths);
    const tabCount = sessions.reduce((total, session) => total + session.tabs.length, 0);
    const messageCount = sessions.reduce((total, session) => total + session.messages.length, 0);
    return writeJson(
      response,
      200,
      {
        workspaces: new Set(sessions.map((session) => session.workspaceId)).size,
        sessions: sessions.length,
        tabs: tabCount,
        messages: messageCount,
        providers: listProviders().length,
        paired: pairingStatus(paths).activeSessions > 0,
      },
      origin,
    );
  }
  if (request.method === "GET" && url.pathname === "/preferences") {
    return writeJson(
      response,
      200,
      {
        preferences: Object.fromEntries(
          Object.entries(readPreferences(paths)).map(([key, preference]) => [key, preference.value]),
        ),
      },
      origin,
    );
  }
  if (request.method === "GET" && url.pathname === "/settings") {
    const identity = getIdentity(paths);
    const sessions = listSessions(paths);
    return writeJson(
      response,
      200,
      {
        identity,
        pairing: pairingStatus(paths),
        preferences: Object.fromEntries(
          Object.entries(readPreferences(paths)).map(([key, preference]) => [key, preference.value]),
        ),
        provider: {
          activeProvider: config.activeProvider || config.provider || undefined,
          activeModel: config.activeModel || config.model || undefined,
        },
        database: {
          ownerUserId: identity.userId,
          local: true,
          persistence: "cli-owned-sqlite",
          workspaces: new Set(sessions.map((session) => session.workspaceId)).size,
          sessions: sessions.length,
        },
      },
      origin,
    );
  }
  if (request.method === "PATCH" && url.pathname === "/preferences") {
    const body = await readBody(request);
    const key = typeof body.key === "string" ? body.key : "";
    const value = typeof body.value === "string" ? body.value : "";
    if (!browserPreferenceKeys.has(key) || !value || value.length > 32)
      return writeJson(response, 400, { error: "Preference is not supported." }, origin);
    return writeJson(response, 200, { preference: savePreference(paths, key, value) }, origin);
  }
  if (request.method === "PATCH" && url.pathname === "/providers/active") {
    const body = await readBody(request);
    const provider = typeof body.provider === "string" ? body.provider : "";
    const model = typeof body.model === "string" ? body.model : undefined;
    if (!listProviders().some((item) => item.id === provider))
      return writeJson(response, 400, { error: "provider is not registered." }, origin);
    const next = { ...config, activeProvider: provider, ...(model ? { activeModel: model } : {}) };
    saveConfig(next, paths);
    Object.assign(config, next);
    return writeJson(response, 200, { activeProvider: next.activeProvider, activeModel: next.activeModel }, origin);
  }
  if (request.method === "GET" && parts[0] === "workspaces" && parts[1] && parts.length === 2) {
    const workspace = loadWorkspace(paths, parts[1]);
    if (!workspace) return writeJson(response, 404, { error: "Workspace not found." }, origin);
    return writeJson(
      response,
      200,
      { workspace, sessions: listSessions(paths).filter((session) => session.workspaceId === workspace.id) },
      origin,
    );
  }
  if (request.method === "POST" && parts[0] === "sessions" && parts.length === 1) {
    const body = await readBody(request);
    const session = createSession(paths, {
      mode: typeof body.mode === "string" ? body.mode : "chat",
      model: typeof body.model === "string" ? body.model : config.activeModel,
      provider: typeof body.provider === "string" ? body.provider : config.activeProvider,
      workspaceId: typeof body.workspaceId === "string" ? body.workspaceId : undefined,
      tabId: typeof body.tabId === "string" ? body.tabId : undefined,
      sectionId: sectionFrom(body.sectionId),
      title: typeof body.title === "string" ? body.title : undefined,
    });
    return writeJson(response, 201, session, origin);
  }
  if (parts[0] === "sessions" && parts[1] && parts.length === 2 && request.method === "GET") {
    const session = loadSession(paths, parts[1]);
    return session
      ? writeJson(response, 200, session, origin)
      : writeJson(response, 404, { error: "Session not found." }, origin);
  }
  if (parts[0] === "sessions" && parts[1] && parts[2] === "tabs" && parts.length === 3 && request.method === "POST") {
    const session = loadSession(paths, parts[1]);
    if (!session) return writeJson(response, 404, { error: "Session not found." }, origin);
    const body = await readBody(request);
    return writeJson(
      response,
      201,
      createTab(paths, session, {
        id: typeof body.id === "string" ? body.id : undefined,
        label: typeof body.label === "string" ? body.label : undefined,
        provider: typeof body.provider === "string" ? body.provider : undefined,
        sectionId: sectionFrom(body.sectionId),
      }),
      origin,
    );
  }
  if (
    parts[0] === "sessions" &&
    parts[1] &&
    parts[2] === "tabs" &&
    parts[3] &&
    parts.length === 4 &&
    request.method === "PATCH"
  ) {
    const session = loadSession(paths, parts[1]);
    if (!session) return writeJson(response, 404, { error: "Session not found." }, origin);
    const body = await readBody(request);
    return writeJson(
      response,
      200,
      updateTab(paths, session, parts[3], {
        label: typeof body.label === "string" ? body.label : undefined,
        provider: typeof body.provider === "string" ? body.provider : undefined,
        sectionId: body.sectionId === undefined ? undefined : sectionFrom(body.sectionId),
      }),
      origin,
    );
  }
  if (request.method === "POST" && url.pathname === "/chat")
    return streamChatRoute(request, response, config, paths, origin);
  return writeJson(response, 404, { error: "Route not found." }, origin);
}

function randomPort(): number {
  return randomInt(49_152, 65_535);
}

function bind(server: Server, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const onError = (error: NodeJS.ErrnoException) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      const address = server.address();
      resolve(typeof address === "object" && address ? address.port : port);
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, "127.0.0.1");
  });
}

export async function startServer(options: ServerOptions): Promise<ServerHandle> {
  const paths = ensurePaths(options.paths || resolvePaths());
  const server = createServer((request, response) => {
    route(request, response, options.config, paths).catch((error: unknown) =>
      writeJson(
        response,
        500,
        { error: error instanceof Error ? error.message : "Request failed." },
        safeOrigin(request, options.config),
      ),
    );
  });
  server.setMaxListeners(0);
  let port = options.port ?? 0;
  let lastError: unknown;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      port = await bind(server, port);
      const address = `http://127.0.0.1:${port}`;
      return {
        address,
        port,
        stop: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
      };
    } catch (error) {
      lastError = error;
      port = randomPort();
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Could not bind the local server.");
}

/* ── Merged: the grand merge section ── the correlated embedded gateway http transport logics of the merged repository interned here, one surface without duplicate variations. ── */
import { corsheaders, ctndjson, ctsse, safejsonparse, safestringify } from "./utils";

/** ka ms — keepalive interval milliseconds 200ms */
export const kams = 200;

/** ka suppress ms — suppress keepalive when data written recently */
export const kasuppressms = 1000;

/** sse headers — headers for sse streaming with x accel buffering no */
export function sseheaders(): Record<string, string> {
  return {
    ...corsheaders,
    "content-type": ctsse,
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no",
  };
}

/** ndjson headers */
export function ndjsonheaders(): Record<string, string> {
  return {
    ...corsheaders,
    "content-type": ctndjson,
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
  };
}

/** writeevent — write a single sse event to a controller */
export function writeevent(
  controller: ReadableStreamDefaultController,
  event: string | null,
  data: unknown,
  format: "sse" | "ndjson" | "json" | "plain" | "octet" = "sse",
): void {
  const datastr = typeof data === "string" ? data : safestringify(data);
  if (format === "ndjson") {
    controller.enqueue(`${datastr}\n`);
  } else if (format === "plain") {
    controller.enqueue(`${datastr}`);
  } else if (format === "sse") {
    const parts: string[] = [];
    if (event) parts.push(`event: ${event}`);
    parts.push(`data: ${datastr}`);
    parts.push("");
    parts.push("");
    controller.enqueue(parts.join("\n"));
  } else {
    controller.enqueue(`${datastr}`);
  }
}

/** writekeepalive — write a keepalive comment invisible to sse and ndjson parsers */
export function writekeepalive(controller: ReadableStreamDefaultController): void {
  controller.enqueue(": ka\n\n");
}

/** writedone — write the terminal done marker */
export function writedone(
  controller: ReadableStreamDefaultController,
  format: "sse" | "ndjson" | "json" | "plain" | "octet" = "sse",
): void {
  if (format === "sse") {
    controller.enqueue("data: [done]\n\n");
  } else if (format === "ndjson") {
    controller.enqueue('{"done":true}\n');
  }
}

/** safeenqueue — enqueue to controller catching errors */
export function safeenqueue(controller: ReadableStreamDefaultController, chunk: string): boolean {
  try {
    controller.enqueue(chunk);
    return true;
  } catch {
    return false;
  }
}

/** safeclose — close a controller catching errors */
export function safeclose(controller: ReadableStreamDefaultController): void {
  try {
    controller.close();
  } catch {
    // already closed
  }
}

/** maskmodel — pure byte regex mask model name to the target id */
export function maskmodel(chunk: string, target = "devthink"): string {
  const pattern = /"model"\s*:\s*"[^"]*"/g;
  return chunk.replace(pattern, `"model":"${target}"`);
}

/** discardheartbeat — check if a line is an sse heartbeat comment
 * the empty-data comparison runs on the trimmed line: "data: " and
 * "data:" both trim to "data:" so the untrimmed spelling never matched */
export function discardheartbeat(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith(":") || trimmed === "" || trimmed === "event: ping" || trimmed === "data:";
}

/** parsesseframes — split buffer on double newline returns complete frames plus residual */
export function parsesseframes(buffer: string): { frames: string[]; residual: string } {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const frames: string[] = [];
  let last = 0;
  for (let idx = normalized.indexOf("\n\n", last); idx !== -1; idx = normalized.indexOf("\n\n", last)) {
    frames.push(normalized.slice(last, idx));
    last = idx + 2;
  }
  const residual = normalized.slice(last);
  return { frames, residual };
}

/** extractdata — extract data lines from an sse frame */
export function extractdata(frame: string): string | null {
  const lines = frame.split("\n");
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }
  if (dataLines.length === 0) return null;
  const joined = dataLines.join("\n");
  // the done marker is case-insensitive: upstreams emit both [DONE]
  // (openai) and [done] (misc gateways)
  return isdone(joined) ? null : joined;
}

/** isdone — check if a data string is the done marker
 * case-insensitive: openai emits [DONE] others emit [done] */
export function isdone(data: string): boolean {
  const trimmed = data.trim().toLowerCase();
  return trimmed === "[done]" || trimmed === "data: [done]" || trimmed === "done";
}

/** makechunk — build a minimal openai compatible chat completion chunk */
export function makechunk(
  id: string,
  model: string,
  content: string,
  reasoningcontent?: string,
  finishreason?: string | null,
): Record<string, unknown> {
  const delta: Record<string, unknown> = {};
  if (content) delta.content = content;
  if (reasoningcontent) delta.reasoning_content = reasoningcontent;
  if (!finishreason) delta.role = "assistant";
  return {
    id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        delta,
        ...(finishreason ? { finish_reason: finishreason } : {}),
      },
    ],
  };
}

/** makefinalchunk — build the final chunk with finish reason and optional usage */
export function makefinalchunk(
  id: string,
  model: string,
  finishreason: string,
  usage?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, delta: {}, finish_reason: finishreason }],
    ...(usage ? { usage } : {}),
  };
}

// ---------------------------------------------------------------------------
// stream tracking — collects content reasoning usage while forwarding
// ---------------------------------------------------------------------------

/** tracked stream data — collected during passthrough for persistence */
export interface trackedstream {
  content: string;
  reasoning: string;
  totaltokens: number;
  prompttokens: number;
  completiontokens: number;
  frames: number;
  discarded: number;
}

/** createtracker — new empty tracking state */
function createtracker(): trackedstream {
  return {
    content: "",
    reasoning: "",
    totaltokens: 0,
    prompttokens: 0,
    completiontokens: 0,
    frames: 0,
    discarded: 0,
  };
}

/** framedatapayload — the joined data payload of a frame WITHOUT the done
 * nulling (extractdata maps the done marker to null by contract — the
 * stream loop needs the raw payload to recognize the marker and set its
 * terminated flag before that nulling hides it) */
function framedatapayload(frame: string): string | null {
  const lines = frame.split("\n").filter((l) => l.startsWith("data:"));
  if (lines.length === 0) return null;
  return lines.map((l) => l.slice(5).trim()).join("\n");
}

/** trackframe — parse a data frame and accumulate tracked fields */
function trackframe(tracker: trackedstream, data: string): void {
  const parsed = safejsonparse(data);
  if (!parsed || typeof parsed !== "object") return;
  const obj = parsed as Record<string, unknown>;
  // usage
  const usage = obj["usage"] as Record<string, unknown> | undefined;
  if (usage) {
    if (usage["total_tokens"]) tracker.totaltokens = Number(usage["total_tokens"]);
    if (usage["prompt_tokens"]) tracker.prompttokens = Number(usage["prompt_tokens"]);
    if (usage["completion_tokens"]) tracker.completiontokens = Number(usage["completion_tokens"]);
  }
  // choices deltas
  const choices = obj["choices"] as Array<Record<string, unknown>> | undefined;
  if (choices && choices.length > 0) {
    const delta = choices[0]["delta"] as Record<string, unknown> | undefined;
    if (delta) {
      if (typeof delta["content"] === "string") tracker.content += delta["content"];
      if (typeof delta["reasoning_content"] === "string") tracker.reasoning += delta["reasoning_content"];
    }
    const message = choices[0]["message"] as Record<string, unknown> | undefined;
    if (message) {
      if (typeof message["content"] === "string") tracker.content += message["content"];
      if (typeof message["reasoning_content"] === "string") tracker.reasoning += message["reasoning_content"];
    }
  }
}

// ---------------------------------------------------------------------------
// makestreamresponse — wrap an upstream response into a gateway stream
// ---------------------------------------------------------------------------

/** options for makestreamresponse */
export interface streamoptions {
  /** mask upstream model ids to this id — null disables masking */
  mask?: string | null;
  /** content type override — defaults from upstream response */
  format?: "sse" | "ndjson" | "json" | "plain" | "octet";
  /** keepalive interval ms — default 200 */
  keepaliveintervalms?: number;
  /** suppress keepalive when written within this ms — default 1000 */
  keepalivesuppressms?: number;
  /** callback with tracked data when the stream finishes */
  onfinal?: (tracked: trackedstream) => void;
}

/** makestreamresponse — wrap an upstream fetch response into a gateway streaming response
 * byte passthrough with sse parsing heartbeat discard masking and tracking */
export function makestreamresponse(upstream: Response, opts: streamoptions): Response {
  const mask = opts.mask ?? null;
  const kai = opts.keepaliveintervalms ?? kams;
  const kasuppress = opts.keepalivesuppressms ?? kasuppressms;
  const tracker = createtracker();
  const upstreamct = upstream.headers.get("content-type") ?? "";
  const format = opts.format ?? (upstreamct.includes("ndjson") ? "ndjson" : "sse");

  let closed = false;
  let lastwrite = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      // every chunk leaves as bytes: a response body is a byte stream —
      // string chunks throw "received non-uint8array chunk" the moment a
      // consumer reads the body (res.text() res.json()) even though node
      // http write happens to tolerate strings — encode uniformly
      const encoder = new TextEncoder();
      const push = (chunk: string | Uint8Array): boolean => {
        try {
          controller.enqueue(typeof chunk === "string" ? encoder.encode(chunk) : chunk);
          return true;
        } catch {
          return false;
        }
      };

      const keepalivetimer = setInterval(() => {
        if (closed) return;
        if (Date.now() - lastwrite > kasuppress) {
          push(": ka\n\n");
        }
      }, kai);

      try {
        const reader = upstream.body?.getReader();
        if (!reader) {
          // a bodyless upstream (new Response(null)) still terminates the
          // downstream stream properly — the early return used to close
          // without the done marker and without the sse terminator
          push("data: [DONE]\n\n");
          closed = true;
          safeclose(controller);
          return;
        }
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          lastwrite = Date.now();

          if (mask === null && format !== "sse") {
            // pure byte passthrough — raw bytes forwarded unchanged: no
            // decode encode round trip (multibyte sequences split across
            // chunks stay intact)
            push(value);
            continue;
          }

          // sse mode — parse frames discard heartbeats mask model ids track content
          buffer += decoder.decode(value, { stream: true });
          const { frames, residual } = parsesseframes(buffer);
          buffer = residual;
          for (const frame of frames) {
            if (discardheartbeat(frame)) {
              tracker.discarded += 1;
              continue;
            }
            // the done marker nulls inside extractdata — recognize it from
            // the raw payload first so the terminated flag actually sets
            // (the marker used to fall into the no-data branch, closed never
            // flipped and the loop appended a second done at the end)
            const payload = framedatapayload(frame);
            if (payload !== null && isdone(payload)) {
              push("data: [DONE]\n\n");
              closed = true;
              continue;
            }
            const data = extractdata(frame);
            if (data === null) {
              // frame with no data lines — forward raw
              push(`${frame}\n\n`);
              continue;
            }
            // track content for persistence
            tracker.frames += 1;
            trackframe(tracker, data);
            // mask and forward
            if (mask !== null) {
              const masked = data.replace(/"model"\s*:\s*"[^"]*"/g, `"model":"${mask}"`);
              push(`data: ${masked}\n\n`);
            } else {
              push(`data: ${data}\n\n`);
            }
          }
        }
        // flush residual — through the same done recognition so an
        // unterminated trailing marker terminates instead of duplicating
        if (buffer.trim()) {
          const payload = framedatapayload(buffer);
          if (payload !== null && isdone(payload)) {
            push("data: [DONE]\n\n");
            closed = true;
          } else {
            push(buffer.endsWith("\n\n") ? buffer : `${buffer}\n\n`);
          }
        }
        // ensure done marker present
        if (!closed) {
          push("data: [DONE]\n\n");
        }
      } catch {
        // upstream failed mid-stream — emit done and close
        try {
          push("data: [DONE]\n\n");
        } catch {
          /* closed */
        }
      } finally {
        clearInterval(keepalivetimer);
        closed = true;
        safeclose(controller);
        if (opts.onfinal) {
          try {
            opts.onfinal(tracker);
          } catch {
            /* callback error */
          }
        }
      }
    },
    cancel() {
      closed = true;
    },
  });

  const headers = format === "ndjson" ? ndjsonheaders() : sseheaders();
  return new Response(stream, { headers });
}

/** trackwrite — update last write timestamp for keepalive suppression */
export function trackwrite(): number {
  return Date.now();
}

// ---------------------------------------------------------------------------
// http server — hono bootstrap registers routes per version
// ---------------------------------------------------------------------------

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { loadconfig, validateconfig } from "./config.js";
import { createversion } from "./engine";

/** route resources per version — the canonical 7 */
const resources = ["keys", "models", "chat/completions", "completions", "messages", "responses", "embeddings"] as const;

/** map resource name to its engine handler */
function handlermap(
  handlers: ReturnType<typeof createversion>,
  resource: string,
): ((req: Request) => Promise<Response>) | null {
  switch (resource) {
    case "keys":
      return handlers.handlekeys;
    case "models":
      return handlers.handlemodels;
    case "chat/completions":
      return handlers.handlechatcompletions;
    case "completions":
      return handlers.handlecompletions;
    case "messages":
      return handlers.handlemessages;
    case "responses":
      return handlers.handleresponses;
    case "embeddings":
      return handlers.handleembeddings;
    default:
      return null;
  }
}

/** createserver — build the hono app from the loaded config */
async function createserver(): Promise<Hono> {
  const app = new Hono();

  // open cors — all methods all origins
  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      allowHeaders: [
        "content-type",
        "authorization",
        "x-token",
        "x-chat-id",
        "x-user-id",
        "x-session-id",
        "x-request-id",
        "x-thinking-level",
        "x-model",
        "x-tools",
        "accept",
      ],
      exposeHeaders: ["x-request-id", "x-session-id"],
      maxAge: 86400,
    }),
  );

  // load the user config — web/config.ts or gateway.config.ts
  const definition = await loadconfig();
  const problems = validateconfig(definition);

  // config endpoint — reports the loaded definition shape
  app.get("/api/config", (c) =>
    c.json({
      name: definition.name ?? "gateway",
      description: definition.description ?? "",
      versions: Object.keys(definition.versions),
      problems,
    }),
  );

  // register routes for every configured version
  for (const [versionid, versionconfig] of Object.entries(definition.versions)) {
    const handlers = createversion(versionconfig);
    const prefix = `/api/${versionid}`;

    // info routes — get returns the version descriptor
    for (const resource of resources) {
      app.get(`${prefix}/${resource}`, (c) => handlers.handleinfo(c.req.raw));
    }

    // action routes — post dispatches to the resource handler
    for (const resource of resources) {
      const handler = handlermap(handlers, resource);
      if (handler) {
        app.post(`${prefix}/${resource}`, (c) => handler(c.req.raw));
      }
    }
  }

  // static web ui: the host build (cwd/dist — a host application or repo dev
  // with its own vite build) wins, then the console that ships inside the
  // package (the bundled http transport lives in the package dist, so a
  // consumer running `npx @wenathlan/gateway serve` with no local build
  // still gets the web console out of the box)
  for (const root of consoleroots()) {
    app.use("*", serveStatic({ root }));
  }

  // api 404 fallback
  app.notFound((c) => {
    if (c.req.path.startsWith("/api/")) {
      return c.json({ error: "not found", path: c.req.path }, 404);
    }
    // spa fallback: index.html from the first console root that has it
    for (const root of consoleroots()) {
      const indexpath = join(root, "index.html");
      if (existsSync(indexpath)) {
        return c.html(readFileSync(indexpath, "utf8"));
      }
    }
    return c.body(null, 204);
  });

  return app;
}

/** consoleroots — the static roots in priority order: the local dist (the
 * host build — cwd relative), then the package's own dist when the http
 * transport itself runs from inside it (the bundled dist/http.js sits next
 * to the console the package ships; repo-dev runs http.ts from the root, so
 * the module dir only joins the list when it IS a dist directory) */
function consoleroots(): string[] {
  const roots: string[] = ["dist"];
  const moduledir = dirname(fileURLToPath(import.meta.url));
  if (basename(moduledir) === "dist" && moduledir !== resolve("dist")) {
    roots.push(moduledir);
  }
  return roots;
}

/** main — bootstrap the server on the configured port
 * host and port honor env — never hardcoded per open infrastructure rules */
async function main(): Promise<void> {
  const app = await createserver();
  const definition = await loadconfig();
  const versioncount = Object.keys(definition.versions).length;

  // global error guards — never crash the process
  process.on("uncaughtException", (err) => {
    console.error("[server] uncaught exception:", err.message);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[server] unhandled rejection:", reason);
  });

  const port = Number(process.env.PORT) || 3001;
  const hostname = process.env.HOST || "0.0.0.0";
  serve({ fetch: app.fetch, port, hostname }, (info) => {
    console.log(`[server] gateway listening on http://${info.address}:${info.port}`);
    console.log(`[server] config loaded — ${versioncount} versions`);
  });
}

/** export for library usage — users may embed the server */
export { createserver, main, main as runserver };

/* ── Merged: the grand merge section ── the correlated embedded gateway request auth and key resolution logics of the merged repository interned here, one surface without duplicate variations. ── */
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
    req.headers.get("x-session-id") || (body?.session_id as string) || (body?.sessionId as string) || genid("sess")
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
        label: String(row.label ?? (auth.keylabelformat ?? "key-{idx}").replace("{idx}", String(idx))),
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

/* ── Merged: the grand merge section ── the correlated embedded gateway console cli logics of the merged repository interned here, one surface without duplicate variations. ── */
import { stdin, stdout } from "node:process";
import { createInterface, type Interface } from "node:readline/promises";

// ---------------------------------------------------------------------------
// arg parsing — zero dependency
// ---------------------------------------------------------------------------

type parsedargs = { flags: Record<string, string | boolean>; positional: string[] };

function parseargs(args: string[]): parsedargs {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const value = args[i];
    if (!value.startsWith("-")) {
      positional.push(value);
      continue;
    }
    const key = value.replace(/^-+/, "");
    const next = args[i + 1];
    if (next && !next.startsWith("-")) {
      flags[key] = next;
      i += 1;
    } else flags[key] = true;
  }
  return { flags, positional };
}

function stringflag(parsed: parsedargs, key: string): string | undefined {
  const value = parsed.flags[key];
  return typeof value === "string" ? value : undefined;
}

// ---------------------------------------------------------------------------
// version — from package.json or env override
// ---------------------------------------------------------------------------

function version(): string {
  const embedded = process.env.DEVTHINK_VERSION?.trim();
  if (embedded) return embedded;
  // probe both the module directory (source tree) and its parent (the
  // built dist/ layout) so the bundled cli.js resolves the version too
  for (const candidate of ["./package.json", "../package.json"]) {
    try {
      const file = new URL(candidate, import.meta.url);
      return String((JSON.parse(readFileSync(file, "utf8")) as { version?: string }).version || "0.0.0");
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  }
  return "0.0.0";
}

// ---------------------------------------------------------------------------
// console colors — ansi escape codes
// ---------------------------------------------------------------------------

const colors = stdout.isTTY
  ? {
      cyan: "\u001b[36m",
      green: "\u001b[32m",
      yellow: "\u001b[33m",
      red: "\u001b[31m",
      bold: "\u001b[1m",
      dim: "\u001b[2m",
      reset: "\u001b[0m",
    }
  : {
      cyan: "",
      green: "",
      yellow: "",
      red: "",
      bold: "",
      dim: "",
      reset: "",
    };

// ---------------------------------------------------------------------------
// readline — interactive question helper
// ---------------------------------------------------------------------------

/** the stdin question stream — ONE readline interface serves every question
 * of a command and buffers lines that arrive while no question is pending
 * (sequential question() calls drop piped input: the 'line' events fire
 * with no listener and the answers are lost). interactive typing resolves
 * the pending question directly; piped answers queue; end-of-input answers
 * every remaining question with its default so piped/automation runs
 * complete. main() closes the interface so the process never hangs. */
let sharedrl: Interface | undefined;
const pendinglines: string[] = [];
let lineresolver: ((line: string) => void) | undefined;
let stdineof = false;

function questionstream(): Interface {
  if (sharedrl) return sharedrl;
  sharedrl = createInterface({ input: stdin, output: stdout });
  sharedrl.on("line", (line: string) => {
    if (lineresolver) {
      const resolve = lineresolver;
      lineresolver = undefined;
      resolve(line);
    } else {
      pendinglines.push(line);
    }
  });
  sharedrl.on("close", () => {
    stdineof = true;
    if (lineresolver) {
      const resolve = lineresolver;
      lineresolver = undefined;
      resolve("");
    }
  });
  return sharedrl;
}

async function ask(question: string, defaultanswer = ""): Promise<string> {
  questionstream();
  const suffix = defaultanswer ? ` (${defaultanswer})` : "";
  stdout.write(`${question}${suffix}: `);
  let answer: string;
  if (pendinglines.length > 0) {
    answer = pendinglines.shift() as string;
  } else if (stdineof) {
    answer = "";
  } else {
    answer = await new Promise<string>((resolve) => {
      lineresolver = resolve;
    });
  }
  return answer.trim() || defaultanswer;
}

async function askyesno(question: string, defaultanswer = false): Promise<boolean> {
  const hint = defaultanswer ? "Y/n" : "y/N";
  const answer = await ask(`${question} [${hint}]`);
  if (!answer) return defaultanswer;
  return answer.toLowerCase().startsWith("y");
}

// ---------------------------------------------------------------------------
// config file management
// ---------------------------------------------------------------------------

/** the config search names — .mjs first: it is the only flavor immune to
 * the nearest package.json type field (a plain `npm init -y` consumer has
 * no "type": "module", so node reads an esm-syntax .ts or .js as commonjs
 * and the import dies — the .mjs extension is module-typed by the file
 * name itself and loads everywhere) */
const confignames = [
  "web/config.mjs",
  "web/config.ts",
  "web/config.js",
  "gateway.config.mjs",
  "gateway.config.ts",
  "gateway.config.js",
];

/** config path — the scaffold target: web/config.mjs in cwd */
function configpath(): string {
  return resolve(process.cwd(), "web", "config.mjs");
}

/** find the config file — returns path plus parsed config or null */
async function findconfig(): Promise<{
  path: string;
  config: Record<string, unknown>;
} | null> {
  for (const name of confignames) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    try {
      const mod = await import(/* @vite-ignore */ path);
      const config = (mod.default ?? mod.config ?? mod) as Record<string, unknown>;
      if (config && typeof config === "object" && "versions" in config) {
        return { path, config };
      }
    } catch {
      // unreadable config flavor — try the next candidate
    }
  }
  return null;
}

/** read the existing config or return null */
async function readconfig(): Promise<Record<string, unknown> | null> {
  return (await findconfig())?.config ?? null;
}

/** generate the config file content from a definition object */
function generateconfigcontent(def: Record<string, unknown>): string {
  return [
    "/**",
    " * web config — user customization layer for the gateway",
    " * generated by the cli — edit freely",
    " * every value here is what you customize",
    " */",
    "",
    `export const config = ${jsontopretty(def)}`,
    "",
    "export default config",
    "",
  ].join("\n");
}

/** json to pretty typescript literal */
function jsontopretty(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  const padinner = "  ".repeat(indent + 1);
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${padinner}${jsontopretty(v, indent + 1)}`);
    return `[\n${items.join(",\n")},\n${pad}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const lines = entries.map(([k, v]) => `${padinner}${k}: ${jsontopretty(v, indent + 1)}`);
    return `{\n${lines.join(",\n")},\n${pad}}`;
  }
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// schema template — the prisma schema scaffolded for new users
// (prisma 7 style: no url in the schema — the datasource url lives in
// prisma.config.ts, scaffolded below)
// ---------------------------------------------------------------------------

const schematemplate = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}

model ChatMessage {
  id                String   @id @default(cuid())
  requestid         String?
  sessionid         String?
  route             String?
  provider          String?
  version           String?
  model             String?
  modelvariant      String?
  content           String?
  reasoningcontent  String?
  completion        String?
  prompttokens      Int?
  completiontokens  Int?
  totaltokens       Int?
  stream            Boolean?
  streammode        String?
  endpoint          String?
  twocalls          Boolean?
  thinkingbudget    Int?
  status            String?
  httpstatus        Int?
  error             String?
  rotationindex     Int?
  messagenumber     Int?
  contextshared     Boolean?
  startedat         DateTime? @default(now())
  createdat         DateTime @default(now())

  @@index([sessionid])
  @@index([route])
  @@index([model])
  @@index([provider])
  @@index([status])
  @@index([createdat])
}

model ApiKey {
  id            String    @id @default(cuid())
  keyValue      String    @unique
  label         String?
  active        Boolean   @default(true)
  status        String    @default("active")
  useCount      Int       @default(0)
  errorCount    Int       @default(0)
  lastUsedAt    DateTime?
  lastError     String?
  lastErrorAt   DateTime?
  createdat     DateTime  @default(now())

  @@index([active, status])
}

model NvidiaKey {
  id            String    @id @default(cuid())
  keyValue      String    @unique
  label         String?
  active        Boolean   @default(true)
  status        String    @default("active")
  useCount      Int       @default(0)
  errorCount    Int       @default(0)
  lastUsedAt    DateTime?
  lastError     String?
  lastErrorAt   DateTime?
  createdat     DateTime  @default(now())

  @@index([active, status])
}
`;

// ---------------------------------------------------------------------------
// prisma config template — scaffolded for new users (prisma 7: the
// datasource url lives here, not in the schema; the default matches the
// library runtime fallback so db push and serve share one sqlite)
// ---------------------------------------------------------------------------

const prismaconfigtemplate = `/** prisma config — the datasource url lives here (prisma 7 moved it
 * out of the schema file). the schema is web/schema.prisma; the url comes
 * from DEVTHINK_DATABASE_URL or DATABASE_URL, defaulting to the local
 * sqlite at prisma/devthink.db — the same default the gateway library
 * runtime uses, so the pushed database and the serving process agree on
 * one file with zero configuration */

import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

/** resolve schema path — web/schema.prisma is the standard location */
function resolveschemapath(): string {
  const candidates = [
    path.resolve(process.cwd(), "web", "schema.prisma"),
    path.resolve(process.cwd(), "schema.prisma"),
    path.resolve(process.cwd(), "prisma", "schema.prisma"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

export default defineConfig({
  schema: resolveschemapath(),
  datasource: {
    url:
      process.env.DEVTHINK_DATABASE_URL ||
      process.env.DATABASE_URL ||
      "file:./prisma/devthink.db",
  },
});
`;

// ---------------------------------------------------------------------------
// init — scaffold the whole project
// ---------------------------------------------------------------------------

async function cmdinit(): Promise<void> {
  console.log(`\n${colors.cyan}${colors.bold}@wenathlan/devthink gateway${colors.reset} v${version()} — init\n`);

  const targetdir = process.cwd();
  const webdir = join(targetdir, "web");

  // create web folder
  if (!existsSync(webdir)) {
    mkdirSync(webdir, { recursive: true });
    console.log(`${colors.green}created${colors.reset} web/`);
  }

  // check existing config — any flavor counts, the scaffold writes .mjs
  const existing = await findconfig();
  if (existing || existsSync(configpath())) {
    const overwrite = await askyesno(
      `config already exists${existing ? ` (${relative(process.cwd(), existing.path)})` : ""} — overwrite?`,
      false,
    );
    if (!overwrite) {
      console.log("keeping existing config");
      return;
    }
  }

  // interactive scaffold — how many versions
  console.log("\nthis scaffolds your gateway configuration");
  console.log(
    "each version gets all 7 routes: chat/completions completions messages responses embeddings keys models\n",
  );

  const versioncountanswer = await ask("how many versions (route groups) do you want", "1");
  const versioncount = Math.max(1, Math.min(20, Number(versioncountanswer) || 1));

  const versions: Record<string, unknown> = {};

  for (let i = 0; i < versioncount; i++) {
    console.log(`\n${colors.bold}--- version ${i + 1} of ${versioncount} ---${colors.reset}`);
    const vconfig = await askversiondetails(i + 1);
    versions[vconfig.id as string] = vconfig;
  }

  const definition = {
    name: await ask("gateway name", "My Gateway"),
    description: await ask("gateway description", "multi provider ai gateway"),
    versions,
  };

  // write config — .mjs loads under every package.json type (a plain
  // npm init -y consumer has no type module: an esm .ts or .js dies there)
  writeFileSync(configpath(), generateconfigcontent(definition));
  console.log(`\n${colors.green}created${colors.reset} web/config.mjs`);

  // write schema
  const schemapath = join(webdir, "schema.prisma");
  writeFileSync(schemapath, schematemplate);
  console.log(`${colors.green}created${colors.reset} web/schema.prisma`);

  // write prisma config — prisma 7 carries the datasource url here (out of
  // the schema file), and the default matches the library runtime fallback
  // so db push and serve agree on one sqlite with zero configuration
  writeFileSync(join(targetdir, "prisma.config.ts"), prismaconfigtemplate);
  console.log(`${colors.green}created${colors.reset} prisma.config.ts`);

  // write env example
  const envpath = join(targetdir, ".env.example");
  const envlines: string[] = [
    "# gateway environment",
    "# database url — libsql http postgres or file",
    "# DEVTHINK_DATABASE_URL=file:./prisma/devthink.db",
    "",
  ];
  for (const [id, v] of Object.entries(versions)) {
    const auth = (v as Record<string, unknown>).auth as Record<string, unknown> | undefined;
    if (auth?.envvar) {
      envlines.push(`# ${id} api key`);
      envlines.push(`${auth.envvar}=`);
      envlines.push("");
    }
  }
  writeFileSync(envpath, envlines.join("\n"));
  console.log(`${colors.green}created${colors.reset} .env.example`);

  console.log(`\n${colors.green}${colors.bold}done${colors.reset} — next steps:`);
  console.log("  1. edit web/config.mjs to tune your configuration");
  console.log("  2. register keys:      npx @wenathlan/devthink gateway keys <version>");
  console.log("  3. install prisma:     npm i -D prisma");
  console.log("  4. push + generate:    npx prisma db push && npx prisma generate");
  console.log("  5. start the server:   npx @wenathlan/devthink gateway serve");
  console.log("");
}

// ---------------------------------------------------------------------------
// askversiondetails — interactive version builder
// ---------------------------------------------------------------------------

async function askversiondetails(index: number): Promise<Record<string, unknown>> {
  const id = await ask(`version id (path prefix)`, `v${index}`);
  const providername = await ask("provider name (zai nvidia openai openrouter custom)", "custom");
  const baseurl = await ask("upstream base url", "https://gateway.example/v1");

  // auth
  console.log(
    "\nauth methods: bearer apikeyheader queryparam basic oauth2clientcredentials jwtsign sigv4 anonymous keylesssdk none",
  );
  const authmode = await ask("auth method", "bearer");
  const needskey = ["bearer", "apikeyheader", "queryparam", "basic"].includes(authmode);
  const auth: Record<string, unknown> = { mode: authmode };
  if (needskey) {
    auth.required = await askyesno("is the api key required?", true);
    const envvar = await ask(
      "env var name for the key",
      `${providername.toUpperCase().replace(/[^A-Z]/g, "_")}_API_KEY`,
    );
    auth.envvar = envvar;
    const usedb = await askyesno("store keys in the database (rotation)?", false);
    auth.keysources = usedb ? ["db", "env"] : ["env"];
    if (usedb) auth.dbmodel = await ask("prisma key model name", "apiKey");
  }

  // models
  const modelcountanswer = await ask("how many models", "2");
  const modelcount = Math.max(1, Number(modelcountanswer) || 2);
  const models: Array<Record<string, unknown>> = [];
  for (let m = 0; m < modelcount; m++) {
    console.log(`\nmodel ${m + 1} of ${modelcount}`);
    const mid = await ask("model id", m === 0 ? "default-model" : `model-${m + 1}`);
    const context = Number(await ask("context window", "131072"));
    const maxoutput = Number(await ask("max output tokens", "32768"));
    models.push({ id: mid, context, maxoutput, free: true });
  }

  // rotation
  const userotation = await askyesno("\nrotate models (meta model pattern)?", modelcount > 1);
  let rotation: Record<string, unknown> | undefined;
  if (userotation) {
    rotation = {
      mode: await ask("rotation mode (persession perrequest)", "persession"),
      models: models.map((m) => m.id),
      everynmessages: Number(await ask("rotate every n messages", "6")),
      maxmodelrotations: Number(await ask("max model rotations per request", "4")),
      rotateonstatus: [529, 404, 410],
      rotateontimeout: true,
    };
  }

  // retry
  const useretry = await askyesno("\nenable retry with backoff?", true);
  let retry: Record<string, unknown> | undefined;
  if (useretry) {
    retry = {
      maxretries: Number(await ask("max retries", "3")),
      backoffbasems: Number(await ask("backoff base ms", "400")),
      backoffcapms: Number(await ask("backoff cap ms", "8000")),
      jitter: 0.2,
      statuses: [429, 502, 503, 504],
      nonretryable: [400],
    };
  }

  // context
  const usecontext = await askyesno("\nshare context across sessions (db history)?", false);
  const context: Record<string, unknown> | undefined = usecontext
    ? {
        restoresessionhistory: true,
        historylimit: 1000,
        truncatemargin: 4096,
        percallfallback: 1048576,
      }
    : undefined;

  // meta model
  const metaid = await ask("\nmeta model id (the rotation facade)", "devthink");

  return {
    id,
    providername,
    upstreams: [{ name: providername, baseurl }],
    auth,
    models,
    defaultmodel: rotation ? metaid : models[0].id,
    ...(rotation ? { rotation } : {}),
    ...(retry ? { retry } : {}),
    ...(context ? { context } : {}),
    timeout: { requestms: 300000, streamms: 2147483647 },
    thinking: { defaultlevel: "high" },
    bodybuild: { optionalparamspolicy: "omit-unspecified", clampmaxtokens: true },
    metamodel: {
      id: metaid,
      fallbackcontext: 1048576,
      maxoutput: 32768,
      maskupstreammodel: true,
      alwaysdisplay: true,
    },
    headers: { useragent: `Gateway/${id}` },
  };
}

// ---------------------------------------------------------------------------
// add — add a new version to the existing config
// ---------------------------------------------------------------------------

async function cmdadd(_versionarg: string | undefined): Promise<void> {
  const existing = await findconfig();
  if (!existing) {
    console.log(`${colors.red}no config found${colors.reset} — run init first`);
    process.exit(1);
  }
  const nextindex = Object.keys((existing.config.versions as Record<string, unknown>) ?? {}).length + 1;
  console.log(`\n${colors.cyan}${colors.bold}add version${colors.reset}\n`);
  const vconfig = await askversiondetails(nextindex);
  const versions = (existing.config.versions as Record<string, unknown>) ?? {};
  versions[vconfig.id as string] = vconfig;
  existing.config.versions = versions;
  writeFileSync(existing.path, generateconfigcontent(existing.config));
  console.log(
    `\n${colors.green}added${colors.reset} version ${vconfig.id} to ${relative(process.cwd(), existing.path)}`,
  );
}

// ---------------------------------------------------------------------------
// list — show configured versions
// ---------------------------------------------------------------------------

async function cmdlist(): Promise<void> {
  const config = await readconfig();
  if (!config) {
    console.log(`${colors.red}no config found${colors.reset} — run init first`);
    process.exit(1);
  }
  const versions = (config.versions as Record<string, Record<string, unknown>>) ?? {};
  console.log(
    `\n${colors.bold}${config.name ?? "gateway"}${colors.reset} — ${Object.keys(versions).length} versions\n`,
  );
  for (const [id, v] of Object.entries(versions)) {
    const models = (v.models as unknown[])?.length ?? 0;
    const auth = v.auth as Record<string, unknown> | undefined;
    const rotation = v.rotation as Record<string, unknown> | undefined;
    console.log(`  ${colors.cyan}${id}${colors.reset}`);
    console.log(
      `    provider: ${v.providername ?? "?"}  upstream: ${(v.upstreams as Array<Record<string, unknown>>)?.[0]?.baseurl ?? "?"}`,
    );
    console.log(`    models: ${models}  auth: ${auth?.mode ?? "?"}  rotation: ${rotation?.mode ?? "none"}`);
  }
  console.log("");
}

// ---------------------------------------------------------------------------
// show — show one version detail
// ---------------------------------------------------------------------------

async function cmdshow(versionarg: string | undefined): Promise<void> {
  if (!versionarg) {
    console.log("usage: gateway show <version>");
    process.exit(1);
  }
  const config = await readconfig();
  const versions = (config?.versions as Record<string, unknown>) ?? {};
  const v = versions[versionarg];
  if (!v) {
    console.log(`${colors.red}version ${versionarg} not found${colors.reset}`);
    process.exit(1);
  }
  console.log(jsontopretty(v));
}

// ---------------------------------------------------------------------------
// validate — check the config
// ---------------------------------------------------------------------------

async function cmdvalidate(): Promise<void> {
  const config = await readconfig();
  if (!config) {
    console.log(`${colors.red}no config found${colors.reset} — run init first`);
    process.exit(1);
  }
  const versions = (config.versions as Record<string, Record<string, unknown>>) ?? {};
  const problems: string[] = [];
  if (Object.keys(versions).length === 0) problems.push("no versions defined");
  for (const [id, v] of Object.entries(versions)) {
    if (!v.providername) problems.push(`version ${id}: missing providername`);
    if (!v.upstreams) problems.push(`version ${id}: missing upstreams`);
    if (!v.auth) problems.push(`version ${id}: missing auth`);
    if (!v.models || (v.models as unknown[]).length === 0) problems.push(`version ${id}: no models`);
    if (!v.metamodel) problems.push(`version ${id}: missing metamodel`);
  }
  if (problems.length === 0) {
    console.log(`${colors.green}config is valid${colors.reset} — ${Object.keys(versions).length} versions`);
  } else {
    console.log(`${colors.yellow}problems found${colors.reset}:`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// keys — register api keys
// ---------------------------------------------------------------------------

async function cmdkeys(versionarg: string | undefined): Promise<void> {
  if (!versionarg) {
    console.log("usage: gateway keys <version>");
    process.exit(1);
  }
  const config = await readconfig();
  const versions = (config?.versions as Record<string, Record<string, unknown>>) ?? {};
  const v = versions[versionarg];
  if (!v) {
    console.log(`${colors.red}version ${versionarg} not found${colors.reset}`);
    process.exit(1);
  }
  const auth = v.auth as Record<string, unknown>;
  const envvar = auth?.envvar as string | undefined;
  const dbmodel = auth?.dbmodel as string | undefined;

  console.log(`\n${colors.bold}register keys for ${versionarg}${colors.reset}`);
  console.log(`auth mode: ${auth?.mode ?? "?"}`);

  if (envvar) {
    console.log(`\nset keys via environment variable:`);
    console.log(`  export ${envvar}=key1,key2,key3  (comma separated for rotation)`);
  }

  if (dbmodel) {
    console.log(`\nregister keys in the database (rotation with round robin):`);
    const keycountanswer = await ask("how many keys to register now", "0");
    const keycount = Number(keycountanswer) || 0;
    if (keycount > 0) {
      const keys: string[] = [];
      for (let i = 0; i < keycount; i++) {
        const key = await ask(`key ${i + 1}`);
        if (key) keys.push(key);
      }
      // write to a seed script the user can run
      const seedpath = resolve(process.cwd(), "tests", "seedkeys.mjs");
      const seedcontent = [
        "/** seed keys — generated by gateway cli */",
        'import { PrismaClient } from "@prisma/client"',
        "",
        `const keys = ${JSON.stringify(keys, null, 2)}`,
        "",
        "const db = new PrismaClient()",
        "",
        `for (const [idx, key] of keys.entries()) {`,
        `  await db.${dbmodel}.upsert({`,
        "    where: { keyValue: key },",
        '    update: { active: true, status: "active" },',
        `    create: { keyValue: key, label: \`key-\${idx}\`, active: true, status: "active" },`,
        "  })",
        "}",
        "",
        "await db.$disconnect()",
        `console.log(\`registered \${keys.length} keys\`)`,
        "",
      ].join("\n");
      mkdirSync(resolve(process.cwd(), "tests"), { recursive: true });
      writeFileSync(seedpath, seedcontent);
      console.log(`\n${colors.green}created${colors.reset} tests/seedkeys.mjs — run: node tests/seedkeys.mjs`);
    }
  }
  console.log("");
}

// ---------------------------------------------------------------------------
// models — list models for a version
// ---------------------------------------------------------------------------

async function cmdmodels(versionarg: string | undefined): Promise<void> {
  if (!versionarg) {
    console.log("usage: gateway models <version>");
    process.exit(1);
  }
  const config = await readconfig();
  const versions = (config?.versions as Record<string, Record<string, unknown>>) ?? {};
  const v = versions[versionarg];
  if (!v) {
    console.log(`${colors.red}version ${versionarg} not found${colors.reset}`);
    process.exit(1);
  }
  const models = (v.models as Array<Record<string, unknown>>) ?? [];
  console.log(`\n${colors.bold}models for ${versionarg}${colors.reset}\n`);
  for (const m of models) {
    console.log(
      `  ${colors.cyan}${m.id}${colors.reset}  ctx=${m.context}  out=${m.maxoutput}${m.vision ? "  vision" : ""}${m.reasoning ? "  reasoning" : ""}`,
    );
  }
  const rotation = v.rotation as Record<string, unknown> | undefined;
  if (rotation?.models) {
    console.log(`\n${colors.bold}rotation pool${colors.reset}: ${JSON.stringify(rotation.models)}`);
  }
  console.log("");
}

// ---------------------------------------------------------------------------
// serve — start the server
// ---------------------------------------------------------------------------

async function cmdserve(portarg: string | undefined): Promise<void> {
  const port = Number(portarg) || Number(process.env.PORT) || 3001;
  process.env.PORT = String(port);
  console.log(`${colors.cyan}starting gateway on port ${port}${colors.reset}`);
  await main();
}

// ---------------------------------------------------------------------------
// export — export the web scaffold
// ---------------------------------------------------------------------------

async function cmdexport(dirarg: string | undefined): Promise<void> {
  const target = resolve(process.cwd(), dirarg ?? "export");
  mkdirSync(target, { recursive: true });
  const found = await findconfig();
  if (found) {
    const name = basename(found.path);
    writeFileSync(join(target, name), readFileSync(found.path, "utf8"));
    console.log(`${colors.green}exported${colors.reset} ${name}`);
  }
  const schemapath = resolve(process.cwd(), "web", "schema.prisma");
  if (existsSync(schemapath)) {
    writeFileSync(join(target, "schema.prisma"), readFileSync(schemapath, "utf8"));
    console.log(`${colors.green}exported${colors.reset} schema.prisma`);
  }
  console.log(`\nexported to ${target} — deploy this folder to vercel or netlify`);
}

// ---------------------------------------------------------------------------
// help
// ---------------------------------------------------------------------------

function printhelp(): void {
  console.log(
    [
      `${colors.cyan}${colors.bold}@wenathlan/devthink gateway${colors.reset} v${version()}`,
      "",
      "the universal ai gateway library — any llm any baseurl any api key",
      "",
      "Usage: devthink gateway <command> [options]",
      "",
      "Commands:",
      "  init                       scaffold web/config.mjs schema and env interactively",
      "  add                        add a new version to the config",
      "  list                       list configured versions",
      "  show <version>             show one version config",
      "  validate                   validate the config for errors",
      "  keys <version>             register api keys for a version",
      "  models <version>           list models for a version",
      "  serve [--port <n>]         start the gateway server",
      "  export [--dir <path>]      export the web folder scaffold",
      "  help                       show this help",
      "",
      "Library usage:",
      '  import { createversion, loadconfig } from "@wenathlan/devthink"',
      "",
      "Documentation: https://github.com/wenathlan/devthink",
      "",
    ].join("\n"),
  );
}

// ---------------------------------------------------------------------------
// main — dispatch commands
// ---------------------------------------------------------------------------

/**
 * Family entry of the grand merge: the single devthink binary routes the
 * extension command family here (`devthink ext <command>`); the argv is
 * spliced into the process position the original entry reading expects,
 * the family main runs untouched and the caller argv is restored.
 *
 * @param argv the family arguments (without the family prefix).
 */
export async function runclifamily(argv: string[]): Promise<void> {
  const saved = process.argv.slice();
  process.argv = [saved[0], saved[1], ...argv];
  try {
    await consolemain();
  } finally {
    process.argv = saved;
  }
}

async function consolemain(): Promise<void> {
  const args = process.argv.slice(2);
  const parsed = parseargs(args);
  const command = parsed.positional[0];

  try {
    switch (command) {
      case "init":
        await cmdinit();
        break;
      case "add":
        await cmdadd(parsed.positional[1]);
        break;
      case "list":
        await cmdlist();
        break;
      case "show":
        await cmdshow(parsed.positional[1]);
        break;
      case "validate":
        await cmdvalidate();
        break;
      case "keys":
        await cmdkeys(parsed.positional[1]);
        break;
      case "models":
        await cmdmodels(parsed.positional[1]);
        break;
      case "serve":
        await cmdserve(stringflag(parsed, "port"));
        break;
      case "export":
        await cmdexport(stringflag(parsed, "dir"));
        break;
      case "help":
      case "--help":
      case "-h":
      case undefined:
        printhelp();
        break;
      default:
        console.log(`${colors.red}unknown command${colors.reset}: ${command}`);
        printhelp();
        process.exit(1);
    }
  } catch (err) {
    console.error(`${colors.red}error${colors.reset}: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  } finally {
    /** release the shared stdin handle so the process exits cleanly */
    sharedrl?.close();
  }
}

/* ── Merged: the grand merge section ── the correlated embedded gateway library barrel logics of the merged repository interned here, one surface without duplicate variations. ── */
/* the embedded gateway barrel: the config loading, the database, the engine, the types and the
   utils re-export beside the auth, transport and console exports this file already declares, so
   the server surface answers the whole library contract from one module. */
// config loading — bridge to the user customization layer
export { getversion, listversions, loadconfig, reloadconfig, validateconfig } from "./config.js";
// database — prisma persistence
export { db, getsession, getsessionmessages, savemsg } from "./database.js";
// engine — the universal request pipeline
export { createversion, engineinternals } from "./engine.js";
// types — the configuration surface
export type {
  authconfig,
  authmethod,
  bodybuildconfig,
  contextconfig,
  dbconfig,
  gatewayconfig,
  gatewaydefinition,
  headersconfig,
  intelligencerank,
  keysource,
  metamodelconfig,
  modeldef,
  resolvedkey,
  retryconfig,
  rotationconfig,
  rotationmode,
  routesconfig,
  sessionstate,
  thinkingconfig,
  thinkinglevel,
  timeoutconfig,
  transportconfig,
  transporttype,
  upstreamdef,
  versionhandlers,
} from "./types.js";

// utils — shared helpers
export {
  autofrequencypenalty,
  automaxtokens,
  auton,
  autopresencepenalty,
  autoseed,
  autotemp,
  autothinking,
  autotopp,
  clamp,
  corsheaders,
  defaultmaxtokens,
  detectcontenttype,
  esttokens,
  genid,
  getip,
  handlecors,
  jsonheaders,
  levenshtein,
  makethinker,
  safejsonparse,
  safestringify,
  thinkingbudget,
  truncatemessages,
} from "./utils.js";

/* the grand-merge guard: when this module is imported as a library surface by
   the devthink router (dynamic import), the module-load main must not fire —
   only a direct `bun server.ts` (or a built server.js entry) run executes the
   embedded gateway console. */
const serverDirectEntry = process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js");
const serverBunEntry = (import.meta as ImportMeta & { main?: boolean }).main === true;
if (serverDirectEntry || serverBunEntry) void consolemain();

/* ── Merged: the grand merge section ── the correlated provider account console cli logics of the merged repository interned here, one surface without duplicate variations ── */
/**
 * @fileoverview the provider account console cli of the merged repository (MERGED)
 * @module auth/cli
 * @description
 *  Unified merge of all duplicate CLI generations into a single modular entry
 *  point. Zero external dependencies (only node:* builtins + global fetch).
 *
 *  Merge provenance (every unique feature preserved):
 *   - BASE  cli.ts (=cli(1).ts): modular command CLI with commands
 *           login / accounts / quota / config / models / status / doctor /
 *           version / interactive menu. Secure atomic writes (chmod 600),
 *           multi-account management, quota thresholds via config.ts.
 *   - FROM  cli(2).ts (=cli(3).ts):
 *           logoutFlow + top-level logout command (OAuth token revocation +
 *           account removal, --all support, interactive picker);
 *           enableAccountFlow / disableAccountFlow as top-level commands;
 *           MODELS_2026_CATALOG (2026 antigravity model catalog);
 *           buildOpenCodeModelDefinitions() (rich provider model defs with
 *           bypass metadata); configureModelsFlow() writing
 *           provider.google.models (+ provider.antigravity.models and
 *           top-level model shortcuts) into opencode.json with --global /
 *           --path resolution; locateOpenCodeJson() +
 *           resolveOpenCodeJsonCandidates(); atomicWriteFileAtomic()
 *           (fs/promises); resolveAntigravityJsonPath();
 *           helpers confirm / redactEmail / fmtDuration / printHeader.
 *           v2.1.16: the MODELS_2026_CATALOG data moved to models.ts (single
 *           owner); the dead sync atomic writer twin was deleted.
 *   - FROM  cli(4).ts: richest account listing (store version, activeIndex,
 *           activeIndexByFamily, addedAt/createdAt/expiry/projectId,
 *           remaining/limit, rateLimitResetTimes per account); quota results
 *           persisted back into the accounts file; diagnostics dumping the
 *           first 1000 chars of the raw accounts file.
 *   - FROM  cli(5).ts: manage command (interactive per-account enable/disable
 *           toggle via auth.js accountManager.enable(email,bool)); login mode
 *           selection "1 add accounts / 2 fresh start (wipe all)";
 *           claude-sonnet low/high thinkingLevel variants in configure
 *           output; soft-quota (softQuotaUntil) display in account listing;
 *           debugLogger audit log on login; diagnostics reporting the logs
 *           dir and the default model.
 *   - cli(6).ts contained nothing unique (strict subset) - deleted.
 *
 *  Sibling modules are consumed from their deduplicated base files only:
 *  ./oauth.js (the provider oauth family) ./accounts.js
 *  ./config.js (v2.1.14: validate.ts + system.ts consolidated into it)
 *  ./constants.js ./quota.js ./version.js ./models.js ./system.js (shim)
 *
 *  Bypass constants (documented):
 *   client_id=681255809395-oo8f…b135j (.apps.googleusercontent.com)
 *   secret=GOCSPX-4uHgMPm…lXFsxl
 *   UA=GeminiCLI/0.57.0 (linux; x64; GitHub) google-api-nodejs-client/9.15.1
 *   X-Goog-Api-Client=gl-node/22.19.0
 *   Client-Metadata=ideType=IDE_UNSPECIFIED,platform=PLATFORM_UNSPECIFIED,pluginType=GEMINI
 *   project fallback=rising-fact-p41fc
 *   isolated dir=~/.config/opencode (override with OPENCODE_CONFIG_DIR)
 *
 * @author ONDA 5 - Finalization (merge pass)
 * @license MIT
 * @version 6.0.0
 */

import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// ---------------------------------------------------------------------------
// Local module imports (ESM .js extension for Node resolver, source is .ts).
// Import from deduplicated base modules ONLY - never from "(N)" copies.
// ---------------------------------------------------------------------------
import * as oauthMod from "./oauth.js";
import * as accountsMod from "./accounts.js";
import * as configMod from "./config.js";
import * as constantsMod from "./constants.js";
import * as quotaMod from "./quota.js";
import * as versionMod from "./versionregistry.js";
import * as authMod from "./oauth.js";
import * as modelsMod from "./models.js";
import * as systemMod from "./core.js";
// v2.1.16 single-owner fix: raw values come from constants.js, identity
// snapshots from fingerprint.js and model identification from models.js via
// static named imports (the namespace interop wrappers below stay for the
// historical CJS/ESM fallback chains — the local literal copies are gone).
import {
  ANTIGRAVITY_VERSION_FALLBACK,
  ANTIGRAVITY_VERSION_MIN_SUPPORTED,
  CLIENT_METADATA_STRING,
  CLOUDCODE_BASE_URL,
  CLOUDCODE_DAILY_BASE,
  CODE_ASSIST_PATH_MAP,
  ENDPOINTS,
  FETCH_TIMEOUT_MS,
  GEMINI_CLI_SCOPES,
  GEMINI_CLI_USER_AGENT,
  OAUTH_REVOKE_URL,
  OAUTH_TOKEN_URL,
  PROJECT_FALLBACK,
} from "./constants.js";
import { X_GOOG_API_CLIENT_GEMINI_CLI } from "./fingerprint.js";
import {
  DEFAULT_MODEL as MODELS_DEFAULT_MODEL,
  DEFAULT_MODEL_ID as MODELS_DEFAULT_MODEL_ID,
  ENDPOINT_ORDER,
  MODELS_2026_CATALOG,
  MODEL_BY_ID,
  SEARCH_MODEL_PREVIEW,
} from "./models.js";
import type { ModelCatalogEntry } from "./models.js";

// Resolve interop (CJS/ESM dual): pick default if exists or namespace
const oauth: any = (oauthMod as any).default ?? oauthMod;
const accountsPkg: any = (accountsMod as any).default ?? accountsMod;
const configPkg: any = (configMod as any).default ?? configMod;
const constantsPkg: any = (constantsMod as any).default ?? constantsMod;
const quotaPkg: any = (quotaMod as any).default ?? quotaMod;
const versionPkg: any = (versionMod as any).default ?? versionMod;
const authPkg: any = (authMod as any).default ?? authMod;
const modelsPkg: any = (modelsMod as any).default ?? modelsMod;
const systemPkg: any = (systemMod as any).default ?? systemMod;

// Destructure needed APIs with fallback to namespace exports
const authenticate = oauth.authenticate as typeof import("./oauth.js").authenticate;
const GEMINI_OAUTH_CLIENT_ID = (oauth.CLIENT_ID as string) ?? (constantsMod.GEMINI_CLI_OAUTH_CLIENT_ID as string);
const GEMINI_OAUTH_CLIENT_SECRET =
  (oauth.CLIENT_SECRET as string) ?? (constantsMod.GEMINI_CLI_OAUTH_CLIENT_SECRET as string);

const AccountManagerClass = (accountsMod.AccountManager as any) ?? (accountsPkg as any);
// v2.1.15 Phase A: ALL_MODELS_2026 lives in models.ts (model identification
// is owned by models.ts alone).
// v2.1.16 single-owner fix: the last-resort fallback entry is derived from
// models.js — a MODEL_BY_ID lookup keyed by the models.js DEFAULT_MODEL_ID
// ("antigravity-gemini-3-pro", whose catalog record carries the very same
// name/context/output/api/quotaGroup the former local literal spelled out).
const MODELS_FALLBACK_ENTRY = MODEL_BY_ID[MODELS_DEFAULT_MODEL_ID];
const ALL_MODELS_FALLBACK: ReadonlyArray<any> =
  (modelsMod.ALL_MODELS_2026 as any) ??
  (modelsPkg.ALL_MODELS_2026 as any) ??
  (MODELS_FALLBACK_ENTRY ? [MODELS_FALLBACK_ENTRY] : []);

const loadConfig = (configMod.loadConfig as any) ?? (configPkg.loadConfig as any);
// grand-merge rename: the provider saveConfig collided with devthink's root
// saveConfig in merged config.ts and was renamed agsaveConfig — reference the
// renamed export (the provider config writer), not devthink's saveConfig.
const providerSaveConfig = (configMod.agsaveConfig as any) ?? (configPkg.agsaveConfig as any);
const updateConfig = (configMod.updateConfig as any) ?? (configPkg.updateConfig as any);
const DEFAULT_CONFIG = (configMod.DEFAULT_CONFIG as any) ?? (configPkg.DEFAULT_CONFIG as any);
const parseAndValidateConfig = (configMod.parseAndValidateConfig as any) ?? (configPkg.parseAndValidateConfig as any);
const getConfigPath = (configMod.getConfigPath as any) ?? (() => path.join(resolveBaseDir(), "antigravity.json"));

// constants
const ALL_MODELS_2026: ReadonlyArray<any> = (modelsMod.ALL_MODELS_2026 as any) ?? ALL_MODELS_FALLBACK;
const FILE_PATHS = (constantsMod.FILE_PATHS as any) ?? {
  get baseDir() {
    return resolveBaseDir();
  },
  get authDir() {
    return path.join(resolveBaseDir(), "auth");
  },
};
// v2.1.16 single-owner fix: the fallback literal comes from constants.js
// (PROJECT_FALLBACK owner) instead of a local copy.
const FALLBACK_PROJECT_ID = (constantsMod.FALLBACK_PROJECT_ID as string) ?? PROJECT_FALLBACK;
const PLUGIN_VERSION_FALLBACK = (constantsMod.PLUGIN_VERSION as string) ?? "1.0.0";
// Ported from cli(2).ts: antigravity UA/version fallbacks (constants first, models.ts backup)
// v2.1.16 single-owner fix: the "1.19.2" literal comes from constants.js
// (ANTIGRAVITY_VERSION_FALLBACK owner) instead of a local copy.
const ANTIGRAVITY_VER_FB: string = (constantsMod as any).ANTIGRAVITY_VERSION_FALLBACK ?? ANTIGRAVITY_VERSION_FALLBACK;
const ANTIGRAVITY_UA_FB: string =
  (constantsMod as any).ANTIGRAVITY_USER_AGENT_FALLBACK ?? `antigravity/${ANTIGRAVITY_VER_FB}`;

// quota
const QuotaManager = (quotaMod.QuotaManager as any) ?? (quotaPkg.QuotaManager as any);
const getDefaultQuotaManager = (quotaMod.getDefaultQuotaManager as any) ?? null;
const checkQuotaFn = (quotaMod.checkQuota as any) ?? null;
const getQuotaGroupsFn = (quotaMod.getQuotaGroups as any) ?? null;

// version
const getVersion = (versionMod.getVersion as any) ?? (async () => FALLBACK_PROJECT_ID);
// v2.1.16 single-owner fix: the "1.15.8" hardcode comes from constants.js
// (ANTIGRAVITY_VERSION_MIN_SUPPORTED owner) instead of a local literal.
const getVersionInfo =
  (versionMod.getVersionInfo as any) ??
  (async () => ({ version: ANTIGRAVITY_VERSION_MIN_SUPPORTED, source: "hardcoded" }));

// auth.js (v3 robin-hood account manager + direct retrieveQuota) - consumers ported from cli(4)/cli(5)
const AuthAccountManager = (authMod.accountManager as any) ?? (authPkg.accountManager as any) ?? null;
const authRetrieveQuota = (authMod.retrieveQuota as any) ?? (authPkg.retrieveQuota as any) ?? null;

// models.js (flat 2026-08-25 catalog driving provider.google.models config)
const FLAT_MODELS_2026: any[] = (modelsMod.MODELS_2026_08_25 as any) ?? (modelsPkg.MODELS_2026_08_25 as any) ?? [];
// v2.1.16 single-owner fix: the endpoint URLs of the defensive fallback
// object come from constants.js (ENDPOINTS raw host-map owner).
const CODE_ASSIST = (modelsMod.CODE_ASSIST_ENDPOINTS as any) ??
  (modelsPkg.CODE_ASSIST_ENDPOINTS as any) ?? {
    PROD: ENDPOINTS.PROD,
    DAILY: ENDPOINTS.DAILY,
    SANDBOX: ENDPOINTS.SANDBOX,
  };
// v2.1.16 single-owner fix: the "antigravity-gemini-3.7-flash" literal comes
// from models.js (DEFAULT_MODEL owner) instead of a local copy.
const DEFAULT_MODEL_ID: string =
  (modelsMod.DEFAULT_MODEL as string) ?? (modelsPkg.DEFAULT_MODEL as string) ?? MODELS_DEFAULT_MODEL;

// system.js (debug logger singleton + logs dir) - audit trail on login (cli(5) feature)
const debugLoggerImpl: any = (systemMod.debugLogger as any) ?? (systemPkg.debugLogger as any) ?? null;
const logsDirImpl: any = (systemMod.logsDir as any) ?? (systemPkg.logsDir as any) ?? null;

/** Append a redacted line to the rotating debug audit log (best-effort). */
function auditLog(msg: string): void {
  try {
    debugLoggerImpl?.get?.().log(msg);
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
}

/** Resolve the antigravity logs directory (system.js logsDir with local fallback). */
function resolveLogsDir(): string {
  try {
    if (typeof logsDirImpl === "function") return logsDirImpl();
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  return path.join(resolveBaseDir(), "antigravity-logs");
}

// oauth.js extras used by the ported model-definition builder (cli(2))
const OAUTH_SUPPORTED_MODELS: readonly string[] = (oauthMod.SUPPORTED_MODELS_2026 as any) ?? [];

// ===========================================================================
// 00. ANSI COLORS - zero dep
// ===========================================================================
const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  inverse: "\x1b[7m",
  hidden: "\x1b[8m",
  // foreground
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
  // background
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

function colorize(s: string, ...codes: string[]): string {
  if (!s) return s;
  // disable colors if NO_COLOR is set
  if (process.env.NO_COLOR) return s;
  return `${codes.join("")}${s}${ANSI.reset}`;
}
const C = {
  bold: (s: string) => colorize(s, ANSI.bold),
  dim: (s: string) => colorize(s, ANSI.dim),
  red: (s: string) => colorize(s, ANSI.red),
  green: (s: string) => colorize(s, ANSI.green),
  yellow: (s: string) => colorize(s, ANSI.yellow),
  cyan: (s: string) => colorize(s, ANSI.cyan),
  magenta: (s: string) => colorize(s, ANSI.magenta),
  blue: (s: string) => colorize(s, ANSI.blue),
  gray: (s: string) => colorize(s, ANSI.gray),
  white: (s: string) => colorize(s, ANSI.white),
  b: (s: string) => colorize(s, ANSI.bold),
  bgGreen: (s: string) => colorize(s, ANSI.bgGreen, ANSI.black),
  bgRed: (s: string) => colorize(s, ANSI.bgRed, ANSI.white),
};

// Unified logger (plain-text markers instead of emoji glyphs)
function logInfo(msg: string) {
  console.log(`${C.cyan("[i]")} ${msg}`);
}
function logOk(msg: string) {
  console.log(`${C.green("[ok]")} ${msg}`);
}
function logWarn(msg: string) {
  console.log(`${C.yellow("[!]")} ${msg}`);
}
function logErr(msg: string) {
  console.error(`${C.red("[x]")} ${msg}`);
}
function logDim(msg: string) {
  console.log(C.dim(msg));
}

// ===========================================================================
// 00B. SHARED INTERACTION + FORMAT HELPERS (ported from cli(2).ts)
// ===========================================================================

/**
 * Ask one question on a promises-style readline interface and return the
 * trimmed answer.
 */
async function askQuestion(rl: readline.Interface, prompt: string): Promise<string> {
  const ans = await rl.question(prompt);
  return String(ans ?? "").trim();
}

/**
 * Yes/no confirmation prompt (ported from cli(2).ts).
 * Empty input returns {@link defaultYes}.
 */
async function confirm(rl: readline.Interface, prompt: string, defaultYes = false): Promise<boolean> {
  const suffix = defaultYes ? " [Y/n] " : " [y/N] ";
  const ans = await askQuestion(rl, `${prompt}${suffix}`);
  if (!ans) return defaultYes;
  return /^(y|yes)$/i.test(ans);
}

/**
 * Human friendly duration formatter (ported from cli(2).ts).
 * Examples: "now", "42s", "3m 12s", "5h 03m", "2d 7h".
 */
function fmtDuration(ms: number): string {
  if (ms <= 0) return "now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

/**
 * Email redaction hook for logs/table output (ported from cli(2).ts).
 * The operator-facing CLI intentionally shows the full address for UX;
 * swap the implementation here to redact the local part when needed.
 */
function redactEmail(email: string): string {
  return email;
}

/**
 * Boxed CLI banner printed by the ported flows (login/logout/configure/
 * diagnostics style headers from cli(2).ts).
 */
function printHeader(): void {
  console.log(
    C.bold(C.cyan("\n+---------------------------------------------------------+")) +
      `\n${C.bold(C.cyan("|"))}  ${C.bold("devthink")} ${C.dim(`v${CLI_VERSION}`)} - unified CLI  ${C.bold(C.cyan("|"))}` +
      `\n${C.bold(C.cyan("|"))}  ${C.dim("direct cloudcode-pa.googleapis.com, no localhost v1 proxy")}  ${C.bold(C.cyan("|"))}` +
      `\n${C.bold(C.cyan("+---------------------------------------------------------+"))}\n`,
  );
}

// ===========================================================================
// 01. PATHS & SECURE FILE UTILS - atomic + 600
// ===========================================================================
function resolveBaseDir(): string {
  const env = process.env.OPENCODE_CONFIG_DIR?.trim();
  if (env && env.length > 0) return path.resolve(env);
  return path.join(os.homedir(), ".config", "opencode");
}
function resolveAccountsPath(): string {
  try {
    const fp = (FILE_PATHS as any).authDir ? path.join((FILE_PATHS as any).baseDir, "antigravity-accounts.json") : null;
    if (fp) return fp;
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  return path.join(resolveBaseDir(), "antigravity-accounts.json");
}
function resolveConfigPath(): string {
  try {
    if (typeof getConfigPath === "function") return getConfigPath();
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  return path.join(resolveBaseDir(), "antigravity.json");
}
function ensureDirExists(dir: string) {
  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  try {
    fs.chmodSync(dir, 0o700);
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
}
function atomicWriteFileSecure(filePath: string, content: string, mode = 0o600): void {
  const dir = path.dirname(filePath);
  ensureDirExists(dir);
  const tmp = `${filePath}.tmp.${crypto.randomBytes(6).toString("hex")}.${process.pid}`;
  try {
    fs.writeFileSync(tmp, content, { encoding: "utf8", mode });
    try {
      fs.chmodSync(tmp, mode);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    fs.renameSync(tmp, filePath);
    try {
      fs.chmodSync(filePath, mode);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  } catch (e) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    throw e;
  }
}
function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    try {
      fs.chmodSync(filePath, 0o600);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function maskToken(t: string): string {
  if (!t) return "***";
  if (t.length <= 12) return "***";
  return `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function formatDate(ms?: number): string {
  if (!ms) return "-";
  try {
    return new Date(ms).toISOString().replace("T", " ").slice(0, 19);
  } catch {
    return String(ms);
  }
}

// ---------------------------------------------------------------------------
// 01B. ASYNC ATOMIC WRITERS (ported from cli(2).ts)
// ---------------------------------------------------------------------------

/** mkdir recursive + chmod, promise flavored (never throws). */
async function ensureDirAsync(dir: string): Promise<void> {
  try {
    await fsp.mkdir(dir, { recursive: true, mode: 0o700 });
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  try {
    await fsp.chmod(dir, 0o700);
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
}

/**
 * Atomic write using node:fs/promises (ported from cli(2).ts):
 * temp file in the same directory with random suffix, chmod 600, rename.
 */
async function atomicWriteFileAtomic(filePath: string, content: string, mode = 0o600): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDirAsync(dir);
  const rand = crypto.randomBytes(6).toString("hex");
  const tmp = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${rand}.tmp`);
  try {
    await fsp.writeFile(tmp, content, { encoding: "utf8", mode });
    try {
      await fsp.chmod(tmp, mode);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    await fsp.rename(tmp, filePath);
    try {
      await fsp.chmod(filePath, mode);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  } finally {
    try {
      await fsp.unlink(tmp);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  }
}

/**
 * Sibling of {@link atomicWriteFileAtomic} on the sync fs API
 * (ported from cli(2).ts): tmp + chmod 600 + rename.
 * v2.1.16 single-owner fix: DELETED — a dead twin of the live
 * {@link atomicWriteFileSecure} above with zero callers anywhere in the repo
 * (audit 16-B); the export barrel entry was removed with it.
 */

/** Async JSON reader returning null for missing/invalid files, {} for empty. */
async function readJsonFileSafe(filePath: string): Promise<any | null> {
  try {
    const txt = await fsp.readFile(filePath, "utf8");
    if (!txt.trim()) return {};
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 01C. OPENCODE.JSON LOCATION (ported from cli(2).ts)
// ---------------------------------------------------------------------------

/** Where opencode.json was found (or where it would be created). */
interface OpenCodeJsonLocation {
  path: string;
  exists: boolean;
  source: "cwd" | "global" | "env" | "custom";
}

/** Deterministic candidate list for opencode.json discovery (env wins first). */
function resolveOpenCodeJsonCandidates(): string[] {
  const candidates: string[] = [];
  // OPENCODE_CONFIG (opencode >= 1.18) points at the exact config FILE - the
  // strongest signal there is, so it goes first (plus its dir's canonical
  // name, in case the file itself is named differently).
  const envFile = process.env.OPENCODE_CONFIG?.trim();
  if (envFile) {
    const absFile = path.resolve(envFile);
    candidates.push(absFile, path.join(path.dirname(absFile), "opencode.json"));
  }
  const envDir = process.env.OPENCODE_CONFIG_DIR?.trim();
  if (envDir) {
    candidates.push(path.join(path.resolve(envDir), "opencode.json"));
  }
  candidates.push(path.join(process.cwd(), "opencode.json"));
  candidates.push(path.join(process.cwd(), ".opencode", "opencode.json"));
  candidates.push(path.join(os.homedir(), ".config", "opencode", "opencode.json"));
  candidates.push(path.join(os.homedir(), ".opencode", "opencode.json"));
  // dedup preserving order
  return Array.from(new Set(candidates));
}

/** Best-effort classification of where a located opencode.json came from. */
function classifyOpenCodeJsonSource(cand: string): OpenCodeJsonLocation["source"] {
  const envFile = process.env.OPENCODE_CONFIG?.trim();
  if (envFile && cand === path.resolve(envFile)) return "env";
  const envDir = process.env.OPENCODE_CONFIG_DIR?.trim();
  if (envDir && cand === path.join(path.resolve(envDir), "opencode.json")) return "env";
  if (cand.includes(process.cwd())) return "cwd";
  return "global";
}

/**
 * Locate opencode.json honoring --path overrides and --global preference
 * (ported from cli(2).ts).
 */
async function locateOpenCodeJson(customPath?: string, preferGlobal = false): Promise<OpenCodeJsonLocation> {
  if (customPath) {
    const abs = path.resolve(customPath);
    let exists = false;
    try {
      await fsp.access(abs, fs.constants.F_OK);
      exists = true;
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    return { path: abs, exists, source: "custom" };
  }

  const candidates = resolveOpenCodeJsonCandidates();
  const ordered = preferGlobal ? [...candidates].reverse() : candidates;

  for (const cand of ordered) {
    try {
      await fsp.access(cand, fs.constants.F_OK);
      return { path: cand, exists: true, source: classifyOpenCodeJsonSource(cand) };
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  }

  // nothing exists - pick the creation target based on the preference flag
  if (preferGlobal) {
    return { path: path.join(resolveBaseDir(), "opencode.json"), exists: false, source: "global" };
  }
  return { path: path.join(process.cwd(), "opencode.json"), exists: false, source: "cwd" };
}

/**
 * Path of the plugin config file antigravity.json (ported from cli(2).ts).
 * Honors an explicit custom path, otherwise delegates to config.getConfigPath.
 */
function resolveAntigravityJsonPath(custom?: string): string {
  if (custom) return path.resolve(custom);
  try {
    if (typeof getConfigPath === "function") {
      const p = getConfigPath();
      if (p) return p;
    }
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  return path.join(resolveBaseDir(), "antigravity.json");
}

// ===========================================================================
// 02. ACCOUNT MANAGER FACTORY (singleton aware)
// ===========================================================================
function getAccountManager(): any {
  try {
    // Prefer class constructor
    if (typeof AccountManagerClass === "function") {
      return new AccountManagerClass({ disableBackgroundTimer: true });
    }
    // If default export is factory
    if (accountsPkg.AccountManager) return new accountsPkg.AccountManager({ disableBackgroundTimer: true });
    // fallback minimal in-memory manager that uses file path directly
    return {
      listAccounts() {
        return readJsonSafe<any>(resolveAccountsPath(), { version: 3, accounts: [] }).accounts ?? [];
      },
      findAccount(email: string) {
        return this.listAccounts().find((a: any) => a.email.toLowerCase() === email.toLowerCase());
      },
      getEnabledAccounts() {
        return this.listAccounts().filter((a: any) => a.enabled !== false);
      },
      getActiveAccount() {
        const store = readJsonSafe<any>(resolveAccountsPath(), { version: 3, accounts: [], activeEmail: null });
        if (store.activeEmail)
          return store.accounts.find((a: any) => a.email === store.activeEmail) ?? store.accounts[0] ?? null;
        return store.accounts[0] ?? null;
      },
      addAccount(input: any) {
        const p = resolveAccountsPath();
        const store = readJsonSafe<any>(p, {
          version: 3,
          accounts: [],
          activeEmail: null,
          rotationIndex: 0,
          rotationStrategy: "round-robin",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        store.accounts = store.accounts ?? [];
        const idx = store.accounts.findIndex((a: any) => a.email.toLowerCase() === input.email.toLowerCase());
        const now = Date.now();
        const record = {
          email: input.email.toLowerCase(),
          refreshToken: input.refreshToken,
          accessToken: input.accessToken,
          expiryDate: input.expiryDate,
          projectId: input.projectId ?? FALLBACK_PROJECT_ID,
          enabled: input.enabled ?? true,
          oauthClientKey: "gemini-cli",
          createdAt: now,
          lastUsedAt: now,
          failureCount: 0,
        };
        if (idx >= 0)
          store.accounts[idx] = { ...store.accounts[idx], ...record, createdAt: store.accounts[idx].createdAt };
        else store.accounts.push(record);
        if (!store.activeEmail) store.activeEmail = record.email;
        store.updatedAt = now;
        atomicWriteFileSecure(p, JSON.stringify(store, null, 2) + "\n", 0o600);
        return record;
      },
      removeAccount(email: string) {
        const p = resolveAccountsPath();
        const store = readJsonSafe<any>(p, { version: 3, accounts: [], activeEmail: null });
        const before = store.accounts.length;
        store.accounts = store.accounts.filter((a: any) => a.email.toLowerCase() !== email.toLowerCase());
        if (store.activeEmail?.toLowerCase() === email.toLowerCase())
          store.activeEmail = store.accounts[0]?.email ?? null;
        atomicWriteFileSecure(p, JSON.stringify(store, null, 2) + "\n", 0o600);
        return store.accounts.length < before;
      },
      enableAccount(email: string) {
        const p = resolveAccountsPath();
        const store = readJsonSafe<any>(p, { version: 3, accounts: [] });
        const acc = store.accounts.find((a: any) => a.email.toLowerCase() === email.toLowerCase());
        if (!acc) throw new Error(`Account not found ${email}`);
        acc.enabled = true;
        acc.failureCount = 0;
        acc.disabledReason = undefined;
        acc.disabledUntil = undefined;
        atomicWriteFileSecure(p, JSON.stringify(store, null, 2) + "\n", 0o600);
        return acc;
      },
      disableAccount(email: string) {
        const p = resolveAccountsPath();
        const store = readJsonSafe<any>(p, { version: 3, accounts: [] });
        const acc = store.accounts.find((a: any) => a.email.toLowerCase() === email.toLowerCase());
        if (!acc) throw new Error(`Account not found ${email}`);
        acc.enabled = false;
        acc.disabledReason = "manually disabled";
        atomicWriteFileSecure(p, JSON.stringify(store, null, 2) + "\n", 0o600);
        return acc;
      },
      setActive(email: string, opts?: any) {
        const p = resolveAccountsPath();
        const store = readJsonSafe<any>(p, { version: 3, accounts: [], rotationStrategy: "round-robin" });
        const acc = store.accounts.find((a: any) => a.email.toLowerCase() === email.toLowerCase());
        if (!acc) throw new Error(`Account not found ${email}`);
        store.activeEmail = acc.email;
        if (opts?.sticky) store.rotationStrategy = "sticky";
        store.updatedAt = Date.now();
        atomicWriteFileSecure(p, JSON.stringify(store, null, 2) + "\n", 0o600);
        return acc;
      },
      async getValidAccessToken(email?: string) {
        // naive: return cached access token if not expired, else refresh via fetch
        const all = this.listAccounts();
        const target = email ? this.findAccount(email) : this.getActiveAccount();
        if (!target) throw new Error(`No account found ${email ?? ""}`);
        if (target.accessToken && target.expiryDate && target.expiryDate > Date.now() + 60000)
          return target.accessToken;
        // try refresh
        const body = new URLSearchParams({
          client_id: GEMINI_OAUTH_CLIENT_ID,
          client_secret: GEMINI_OAUTH_CLIENT_SECRET,
          refresh_token: target.refreshToken,
          grant_type: "refresh_token",
        });
        // v2.1.16 single-owner fix: token URL and gemini-cli identity headers
        // imported from constants.js / fingerprint.js (byte-identical values).
        const res = await fetch(OAUTH_TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": GEMINI_CLI_USER_AGENT,
            "X-Goog-Api-Client": X_GOOG_API_CLIENT_GEMINI_CLI,
            "Client-Metadata": CLIENT_METADATA_STRING,
          },
          body: body.toString(),
        });
        if (!res.ok) throw new Error(`Refresh failed ${res.status}`);
        const j: any = await res.json();
        const storePath = resolveAccountsPath();
        const store = readJsonSafe<any>(storePath, { version: 3, accounts: [] });
        const accIdx = store.accounts.findIndex((a: any) => a.email.toLowerCase() === target.email.toLowerCase());
        if (accIdx >= 0) {
          store.accounts[accIdx].accessToken = j.access_token;
          store.accounts[accIdx].expiryDate = Date.now() + (j.expires_in * 1000 || 3600000);
          store.accounts[accIdx].lastRefresh = Date.now();
          atomicWriteFileSecure(storePath, JSON.stringify(store, null, 2) + "\n", 0o600);
        }
        return j.access_token as string;
      },
      saveAccounts() {},
    };
  } catch (e) {
    // ultimate fallback
    return {
      listAccounts() {
        return [];
      },
      getEnabledAccounts() {
        return [];
      },
      getActiveAccount() {
        return null;
      },
    };
  }
}

// ===========================================================================
// 03. CONFIG HELPERS
// ===========================================================================
function loadAntigravityConfig(): any {
  try {
    if (typeof loadConfig === "function") return loadConfig();
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  return readJsonSafe<any>(
    resolveConfigPath(),
    DEFAULT_CONFIG ?? {
      cli_first: true,
      toast_scope: "all",
      soft_quota_threshold_percent: 90,
      quota_fallback: "auto",
      quota_refresh_interval_minutes: 15,
      soft_quota_cache_ttl_minutes: 5,
      pid_offset_enabled: true,
      google_search_enabled: false,
      debug: false,
      version_cache_ttl: 60,
    },
  );
}
function saveAntigravityConfigAtomic(cfg: any): any {
  try {
    if (typeof providerSaveConfig === "function") return providerSaveConfig(cfg);
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  // manual atomic
  const validated = (() => {
    try {
      if (typeof parseAndValidateConfig === "function") return parseAndValidateConfig(cfg, { strict: false });
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    return cfg;
  })();
  atomicWriteFileSecure(resolveConfigPath(), JSON.stringify(validated, null, 2) + "\n", 0o600);
  return validated;
}

// ===========================================================================
// 04. QUOTA HELPERS
// ===========================================================================
async function fetchQuotaForAccount(email: string | undefined, mgr: any, qManager: any): Promise<any> {
  const targetEmail = email ?? mgr.getActiveAccount()?.email ?? mgr.listAccounts()?.[0]?.email;
  if (!targetEmail) throw new Error("No account configured. Run `login` first.");
  const token = await mgr.getValidAccessToken(targetEmail);
  const projectId = mgr.findAccount?.(targetEmail)?.projectId ?? FALLBACK_PROJECT_ID;
  // Prefer quota.ts checkQuota if available
  if (checkQuotaFn && qManager) {
    // qManager already bound to token? use checkQuota directly
    try {
      if (typeof getQuotaGroupsFn === "function") {
        const groups = await getQuotaGroupsFn(token, projectId, { source: "antigravity" });
        return { email: targetEmail, groups, token, projectId };
      }
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  }
  // fallback: direct call to retrieveUserQuotaSummary using bypass headers
  // v2.1.16 single-owner fix: identity headers from constants.js /
  // fingerprint.js; base URLs and the v1internal method path from
  // constants.js (CLOUDCODE_*_BASE + CODE_ASSIST_PATH_MAP) — byte-identical
  // URLs and header values as the former local literals.
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "User-Agent": GEMINI_CLI_USER_AGENT,
    "X-Goog-Api-Client": X_GOOG_API_CLIENT_GEMINI_CLI,
    "Client-Metadata": CLIENT_METADATA_STRING,
    "Content-Type": "application/json",
  };
  const endpoints = [
    `${CLOUDCODE_DAILY_BASE}${CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA_SUMMARY}`,
    `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA_SUMMARY}`,
  ];
  let lastErr: any = null;
  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      // v2.1.16 single-owner fix: raw 10s timeout literal replaced by the
      // constants.js FETCH_TIMEOUT_MS owner (same 10_000 value).
      const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ project: projectId }),
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        lastErr = new Error(`${url} -> ${res.status}`);
        continue;
      }
      const j: any = await res.json();
      return { email: targetEmail, raw: j, token, projectId, endpoint: url };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Failed to fetch quota");
}

/**
 * Persist fetched quota numbers back into the accounts file
 * (ported from cli(4).ts: quota writes remaining/limit/lastUsed per account).
 * Pure best-effort: never throws, preserves every other field atomically.
 */
async function persistQuotaResultToAccountsFile(
  email: string,
  data: { remaining?: number | undefined; limit?: number | undefined },
): Promise<void> {
  try {
    const p = resolveAccountsPath();
    const store = readJsonSafe<any>(p, { version: 3, accounts: [] });
    const arr: any[] = store.accounts ?? [];
    const idx = arr.findIndex((a: any) => String(a.email).toLowerCase() === email.toLowerCase());
    if (idx < 0) return;
    const acc = arr[idx];
    if (!acc) return;
    if (typeof data.remaining === "number" && Number.isFinite(data.remaining)) acc.remaining = data.remaining;
    if (typeof data.limit === "number" && Number.isFinite(data.limit)) acc.limit = data.limit;
    acc.lastUsed = Date.now();
    store.updatedAt = Date.now();
    atomicWriteFileSecure(p, JSON.stringify(store, null, 2) + "\n", 0o600);
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
}

// ===========================================================================
// 05. COMMAND IMPLEMENTATIONS
// ===========================================================================

async function cmdLogin(args: string[], loginRl?: readline.Interface): Promise<void> {
  const noBrowser = args.includes("--no-browser") || args.includes("--noBrowser");
  const timeoutIdx = args.indexOf("--timeout");
  let timeoutMs = 300000;
  if (timeoutIdx >= 0 && args[timeoutIdx + 1]) {
    const v = Number(args[timeoutIdx + 1]);
    if (!Number.isNaN(v) && v > 0) timeoutMs = v;
  }
  // --email option only for hint, real email comes from OAuth userinfo
  const emailOptIdx = args.findIndex((a) => a === "--email" || a.startsWith("--email="));
  let hintEmail: string | undefined;
  if (emailOptIdx >= 0) {
    const a = args[emailOptIdx]!;
    if (a.includes("=")) hintEmail = a.split("=")[1];
    else hintEmail = args[emailOptIdx + 1];
  }

  // Login mode selection (ported from cli(5).ts):
  //   1 = add accounts (merge into store) | 2 = fresh start (wipe all first)
  let freshStart = args.includes("--fresh") || args.includes("--fresh-start") || args.includes("--wipe-all");
  if (!freshStart && (Boolean(loginRl) || process.stdin.isTTY === true)) {
    console.log("[login] mode selection: 1 = add accounts (merge) | 2 = fresh start (wipe all accounts)");
    const ans = loginRl ? await askQuestion(loginRl, "mode 1/2 [1]: ") : await promptLoginModeChoice();
    freshStart = ans.trim() === "2";
  }

  console.log(C.bold("\nAntigravity OAuth Login - Gemini CLI Bypass"));
  console.log(
    C.dim(
      `Client: ${GEMINI_OAUTH_CLIENT_ID.includes("681255809395") ? "gemini-cli default" : "custom override"} (id redacted in logs)`,
    ),
  );
  console.log(C.dim(`Project fallback: ${FALLBACK_PROJECT_ID}`));
  console.log(C.dim(`Headers: GeminiCLI/0.57.0 gl-node/22.19.0 ideType=IDE_UNSPECIFIED`));
  console.log("");

  if (!authenticate) {
    logErr("oauth.ts did not expose authenticate. Check the imports.");
    process.exit(1);
  }

  const mgr = getAccountManager();

  try {
    const result = await authenticate({
      noBrowser,
      callbackTimeoutMs: timeoutMs,
      onLog: (lvl: string, msg: string) => {
        if (lvl === "info") logDim(`[oauth] ${msg}`);
        else if (lvl === "warn") logWarn(`[oauth] ${msg}`);
        else logErr(`[oauth] ${msg}`);
      },
    });

    const { tokens, userInfo } = result as any;
    const email = (userInfo?.email ?? hintEmail ?? "").toLowerCase();
    if (!email) throw new Error("Could not determine the user email.");

    logOk(`Authenticated as ${C.bold(userInfo?.name ?? email)} <${email}>`);

    // Fresh-start wipe (cli(5) "mode 2"): remove every stored account first
    if (freshStart) {
      const previous: any[] = mgr.listAccounts?.() ?? [];
      for (const oldAcc of previous) {
        try {
          await mgr.removeAccount(oldAcc.email);
        } catch {
          /* the guarded best-effort operation falls through: the outer flow owns the failure */
        }
      }
      logWarn(`Fresh start: removed ${previous.length} previous account(s) before adding.`);
    }

    // Defensive: Google may not return a refresh_token if the prior consent is still
    // active on the user's Google account. Pre-empt with prompt=consent in oauth.ts
    // (auth.ts:265) and revokeGoogleToken() on logout, but still guard here.
    // Hint: if login keeps failing with a stale consent, review/revoke granted apps at
    // https://myaccount.google.com/permissions and retry.
    const refreshToken = tokens.refresh_token ?? tokens.refreshToken ?? result.tokens?.refresh_token;
    if (!refreshToken) {
      logErr(
        "Google did not return a refresh_token. Re-run login, or visit https://myaccount.google.com/permissions to remove the prior consent and try again.",
      );
      process.exitCode = 1;
      return;
    }

    // Add to store
    const account = mgr.addAccount({
      email,
      refreshToken,
      accessToken: tokens.access_token ?? tokens.accessToken,
      expiryDate: tokens.expires_at ?? Date.now() + (tokens.expires_in ?? 3600) * 1000,
      projectId: FALLBACK_PROJECT_ID,
      enabled: true,
      oauthClientKey: "gemini-cli",
      oauthClientConfig: {
        clientId: GEMINI_OAUTH_CLIENT_ID,
        clientSecret: GEMINI_OAUTH_CLIENT_SECRET,
      },
      scopes: [...GEMINI_CLI_SCOPES],
    });

    console.log("");
    logOk(`Account ${C.b(`${email}`)} added/saved successfully.`);
    console.log(C.dim(`  Store: ${resolveAccountsPath()} (chmod 600)`));
    console.log(
      C.dim(
        `  AccessToken: ${maskToken(account.accessToken ?? tokens.access_token)} expires ${formatDate(account.expiryDate)}`,
      ),
    );
    console.log(C.dim(`  RefreshToken: ${maskToken(account.refreshToken)}`));
    console.log("");

    // Audit trail on successful login (ported from cli(5).ts)
    auditLog(`login ${email}`);

    // Auto set active if first or none active
    try {
      const active = mgr.getActiveAccount?.();
      if (!active || active.email.toLowerCase() !== email) {
        mgr.setActive?.(email, { sticky: false });
        console.log(C.gray(`-> Set as active (use set-active to switch)`));
      }
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }

    // Verify quota quickly
    try {
      logInfo("Checking initial quota...");
      const q = await fetchQuotaForAccount(email, mgr, null);
      if (q.raw?.quotaGroups || q.groups) logOk("Quota reachable via bypass headers.");
      else logWarn("Quota returned empty, but the account is valid.");
    } catch (e) {
      logWarn(`Could not verify quota right now: ${(e as Error).message}`);
    }
  } catch (e) {
    logErr(`Login failed: ${(e as Error).message}`);
    console.error(C.dim((e as Error).stack ?? ""));
    process.exit(1);
  }
}

/** Temp readline used when the login mode question runs outside the menu. */
async function promptLoginModeChoice(): Promise<string> {
  const rl = readline.createInterface({ input, output });
  try {
    return await askQuestion(rl, "mode 1/2 [1]: ");
  } finally {
    rl.close();
  }
}

async function cmdAccounts(args: string[]): Promise<void> {
  const sub = (args[0] ?? "list").toLowerCase();
  const mgr = getAccountManager();

  switch (sub) {
    case "list":
    case "ls": {
      const jsonFlag = args.includes("--json");
      const accounts = mgr.listAccounts?.() ?? [];
      const activeEmail = (() => {
        try {
          return mgr.getActiveAccount?.()?.email ?? null;
        } catch {
          return null;
        }
      })();
      if (jsonFlag) {
        console.log(
          JSON.stringify(
            {
              activeEmail,
              accounts: accounts.map((a: any) => ({ ...a, refreshToken: maskToken(a.refreshToken) })),
              count: accounts.length,
            },
            null,
            2,
          ),
        );
        return;
      }
      console.log(C.bold(`\nAntigravity Accounts (${accounts.length}) - ${resolveAccountsPath()}`));
      if (accounts.length === 0) {
        logWarn("No accounts configured. Run: cli.ts login");
        return;
      }
      console.log(
        C.dim(`Active: ${activeEmail ?? "none"} | Strategy: ${(mgr as any).store?.rotationStrategy ?? "round-robin"}`),
      );
      // Richest listing (ported from cli(4).ts): store version + family indexes
      const storeMeta = readJsonSafe<any>(resolveAccountsPath(), { version: 3 } as any);
      console.log(
        C.dim(
          `Store: version=${storeMeta.version ?? "?"} activeIndex=${storeMeta.activeIndex ?? "?"} activeIndexByFamily=${JSON.stringify(storeMeta.activeIndexByFamily ?? {})}`,
        ),
      );
      console.log("");
      const nowMs = Date.now();
      for (const acc of accounts) {
        const isActive = activeEmail && acc.email.toLowerCase() === activeEmail.toLowerCase();
        const enabled =
          acc.enabled !== false && acc.disabled !== true && !(acc.disabledUntil && acc.disabledUntil > nowMs);
        const statusIcon = enabled ? C.green("*") : C.red("o");
        const activeMark = isActive ? C.bold(C.bgGreen(" ACTIVE ")) + " " : "         ";
        const fail = acc.failureCount ? C.yellow(` fail=${acc.failureCount}`) : "";
        const disabledReason = acc.disabledReason ? C.dim(` (${acc.disabledReason})`) : "";
        // Soft-quota marker (ported from cli(5).ts)
        const softLeft =
          acc.softQuotaUntil && acc.softQuotaUntil > nowMs
            ? C.yellow(` soft-quota=${fmtDuration(acc.softQuotaUntil - nowMs)} left`)
            : "";
        const exhLeft =
          acc.quotaExhaustedUntil && acc.quotaExhaustedUntil > nowMs
            ? C.yellow(` quota-cooldown=${fmtDuration(acc.quotaExhaustedUntil - nowMs)} left`)
            : "";
        // remaining/limit + rate-limit windows (ported from cli(4).ts)
        const remain =
          acc.remaining !== undefined && acc.limit !== undefined
            ? C.dim(` remaining=${acc.remaining}/${acc.limit}`)
            : "";
        const rateLimits =
          acc.rateLimitResetTimes && Object.keys(acc.rateLimitResetTimes).length
            ? C.dim(` rateLimits=${JSON.stringify(acc.rateLimitResetTimes)}`)
            : "";
        console.log(
          `${statusIcon} ${activeMark}${C.bold(redactEmail(String(acc.email)))} ${enabled ? C.green("enabled") : C.red("disabled")} ${C.dim(`project=${acc.projectId ?? FALLBACK_PROJECT_ID}`)}${fail}${disabledReason}${softLeft}${exhLeft}${remain}${rateLimits}`,
        );
        console.log(
          `   ${C.dim(`addedAt=${formatDate(acc.addedAt)} created=${formatDate(acc.createdAt)} lastUsed=${formatDate(acc.lastUsedAt)} expiry=${formatDate(acc.expiryDate ?? acc.expiry)} token=${maskToken(acc.accessToken ?? "")} refresh=${maskToken(acc.refreshToken)}`)}`,
        );
      }
      console.log("");
      break;
    }
    case "add": {
      // manual add via flags --email --refresh-token
      const emailIdx = args.findIndex((a) => a === "--email" || a.startsWith("--email="));
      const refreshIdx = args.findIndex(
        (a) =>
          a === "--refresh-token" ||
          a.startsWith("--refresh-token=") ||
          a === "--refresh" ||
          a.startsWith("--refresh="),
      );
      let email = "";
      let refresh = "";
      if (emailIdx >= 0) {
        const v = args[emailIdx]!;
        email = v.includes("=") ? v.split("=").slice(1).join("=") : (args[emailIdx + 1] ?? "");
      }
      if (refreshIdx >= 0) {
        const v = args[refreshIdx]!;
        refresh = v.includes("=") ? v.split("=").slice(1).join("=") : (args[refreshIdx + 1] ?? "");
      }
      if (!email || !refresh) {
        console.log(C.bold("Usage: accounts add --email <email> --refresh-token <token> [--project <id>]"));
        process.exit(1);
      }
      const projIdx = args.findIndex((a) => a === "--project" || a.startsWith("--project="));
      let project = FALLBACK_PROJECT_ID;
      if (projIdx >= 0) {
        const v = args[projIdx]!;
        project = v.includes("=") ? v.split("=").slice(1).join("=") : (args[projIdx + 1] ?? FALLBACK_PROJECT_ID);
      }
      const acc = mgr.addAccount({
        email,
        refreshToken: refresh,
        projectId: project,
        enabled: true,
        oauthClientKey: "gemini-cli",
      });
      logOk(`Account ${email} added. Total: ${mgr.listAccounts().length}`);
      console.log(C.dim(`  ${JSON.stringify({ email: acc.email, projectId: acc.projectId, enabled: acc.enabled })}`));
      break;
    }
    case "remove":
    case "rm":
    case "delete":
    case "del": {
      const email = args[1];
      if (!email) {
        console.log("Usage: accounts remove <email>");
        process.exit(1);
      }
      const ok = mgr.removeAccount(email);
      if (ok) logOk(`Removed ${email}`);
      else logErr(`Not found ${email}`);
      break;
    }
    case "enable": {
      const email = args[1];
      if (!email) {
        console.log("Usage: accounts enable <email>");
        process.exit(1);
      }
      try {
        await enableAccountFlow(email);
      } catch (e) {
        logErr((e as Error).message);
      }
      break;
    }
    case "disable": {
      const email = args[1];
      if (!email) {
        console.log("Usage: accounts disable <email> [--reason <txt>]");
        process.exit(1);
      }
      const reasonIdx = args.indexOf("--reason");
      const reason = reasonIdx >= 0 ? args[reasonIdx + 1] : "manually disabled via CLI";
      try {
        await disableAccountFlow(email, reason ?? "manually disabled via CLI");
      } catch (e) {
        logErr((e as Error).message);
      }
      break;
    }
    case "set-active":
    case "active":
    case "use": {
      const email = args[1];
      if (!email) {
        console.log("Usage: accounts set-active <email> [--sticky]");
        process.exit(1);
      }
      const sticky = args.includes("--sticky");
      try {
        mgr.setActive(email, { sticky });
        logOk(`Active now: ${email} ${sticky ? "(sticky)" : "(round-robin)"}`);
      } catch (e) {
        logErr((e as Error).message);
        process.exit(1);
      }
      break;
    }
    case "import": {
      const importPathIdx = args.findIndex((a) => a === "--path" || a.startsWith("--path="));
      let customPath: string | undefined;
      if (importPathIdx >= 0) {
        const v = args[importPathIdx]!;
        customPath = v.includes("=") ? v.split("=").slice(1).join("=") : args[importPathIdx + 1];
      }
      try {
        if (typeof (mgr as any).importFromAntigravityManager === "function") {
          const res = await (mgr as any).importFromAntigravityManager(customPath ? [customPath] : undefined);
          console.log(
            C.bold(
              `\nImport result: imported=${(res as any).imported} updated=${(res as any).updated} skipped=${(res as any).skipped}`,
            ),
          );
          if ((res as any).errors?.length) console.log(C.yellow(`Errors: ${(res as any).errors.join("; ")}`));
          if ((res as any).sources?.length) console.log(C.dim(`Sources: ${(res as any).sources.join(", ")}`));
        } else if (typeof (mgr as any).importFromAntigravity === "function") {
          const res = await (mgr as any).importFromAntigravity();
          console.log(JSON.stringify(res, null, 2));
        } else {
          logWarn(
            "importFromAntigravityManager is not available in this AccountManager version. Trying manual import...",
          );
          // manual fallback: scan known paths
          const candidates = customPath
            ? [customPath]
            : [
                path.join(os.homedir(), ".config", "antigravity", "accounts.json"),
                path.join(os.homedir(), ".antigravity", "accounts.json"),
                path.join(os.homedir(), ".config", "opencode", "antigravity-manager.json"),
              ];
          let count = 0;
          for (const p of candidates) {
            if (!fs.existsSync(p)) continue;
            try {
              const data = JSON.parse(fs.readFileSync(p, "utf8"));
              const arr = Array.isArray(data) ? data : (data.accounts ?? []);
              for (const raw of arr) {
                const email = (raw.email ?? raw.user_email)?.toLowerCase();
                const rt = raw.refreshToken ?? raw.refresh_token;
                if (email && rt) {
                  mgr.addAccount({ email, refreshToken: rt, projectId: raw.projectId ?? FALLBACK_PROJECT_ID });
                  count++;
                }
              }
              logOk(`Imported ${arr.length} from ${p}`);
            } catch (e) {
              logWarn(`Failed ${p}: ${(e as Error).message}`);
            }
          }
          console.log(C.dim(`Manual import total: ${count}`));
        }
      } catch (e) {
        logErr(`Import failed: ${(e as Error).message}`);
      }
      break;
    }
    default:
      console.log(C.bold("\naccounts subcommands:"));
      console.log("  list [--json]                 List accounts");
      console.log("  add --email --refresh-token  Add manually");
      console.log("  remove <email>               Remove account");
      console.log("  enable <email>               Enable account");
      console.log("  disable <email>              Disable account");
      console.log("  set-active <email> [--sticky] Set active + strategy");
      console.log("  import [--path <file>]       Import from antigravity-manager");
      break;
  }
}

function formatQuotaBar(remaining: number, limit: number): string {
  const cfg = loadAntigravityConfig();
  const softPct = cfg.soft_quota_threshold_percent ?? 90;
  const used = limit - remaining;
  const pctUsed = limit > 0 ? (used / limit) * 100 : 0;
  const barLen = 20;
  const filled = Math.round((pctUsed / 100) * barLen);
  const bar = "#".repeat(filled) + ".".repeat(barLen - filled);
  let col = C.green;
  if (pctUsed >= softPct) col = C.yellow;
  if (pctUsed >= 98) col = C.red;
  return `${col(bar)} ${pctUsed.toFixed(1)}% used (${remaining}/${limit} remaining)`;
}

async function cmdQuota(args: string[]): Promise<void> {
  const jsonFlag = args.includes("--json");
  const allFlag = args.includes("--all");
  let emailArg: string | undefined = undefined;
  // positional email unless flag
  for (const a of args) {
    if (!a.startsWith("-") && a.includes("@")) {
      emailArg = a;
      break;
    }
  }
  const emailIdx = args.findIndex((a) => a === "--email" || a.startsWith("--email="));
  if (emailIdx >= 0) {
    const v = args[emailIdx]!;
    emailArg = v.includes("=") ? v.split("=").slice(1).join("=") : args[emailIdx + 1];
  }

  const mgr = getAccountManager();
  const stores = mgr.listAccounts?.() ?? [];
  if (stores.length === 0) {
    logWarn("No accounts. Run login first.");
    return;
  }

  const targets = allFlag ? stores.map((s: any) => s.email) : [emailArg ?? stores[0]?.email];
  const cfg = loadAntigravityConfig();
  const softThresh = (cfg.soft_quota_threshold_percent ?? 90) / 100;

  console.log(
    C.bold(
      `\nQuota Check - soft threshold ${cfg.soft_quota_threshold_percent}% | refresh ${cfg.quota_refresh_interval_minutes}min`,
    ),
  );
  console.log(C.dim(`Bypass: GeminiCLI/0.57.0 gl-node/22.19.0 Client-Metadata=IDE_UNSPECIFIED`));
  console.log("");

  let qManagerInst: any = null;
  try {
    if (QuotaManager)
      qManagerInst = new QuotaManager({ projectFallback: FALLBACK_PROJECT_ID, softThreshold: softThresh });
    else if (getDefaultQuotaManager) qManagerInst = getDefaultQuotaManager({ softThreshold: softThresh });
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }

  for (const email of targets) {
    if (!email) continue;
    console.log(C.bold(`- ${email} -`));
    try {
      const token = await mgr.getValidAccessToken(email);
      const quotaResult = await fetchQuotaForAccount(email, mgr, qManagerInst);
      const raw = (quotaResult as any).raw ?? {};
      const groups = (quotaResult as any).groups ?? [];

      // Persist results back to the accounts file (ported from cli(4).ts):
      // sum numeric bucket values, otherwise fall back to auth.js retrieveQuota.
      let persistedRemaining: number | undefined;
      let persistedLimit: number | undefined;
      const bucketArr: any[] = Array.isArray(raw?.quotaBuckets)
        ? raw.quotaBuckets
        : Array.isArray(raw?.buckets)
          ? raw.buckets
          : [];
      if (bucketArr.length > 0) {
        let rSum = 0;
        let lSum = 0;
        let numeric = true;
        for (const b of bucketArr) {
          const r = Number(b?.remaining ?? b?.remainingQuota);
          const l = Number(b?.limit ?? b?.quotaLimit ?? b?.max);
          if (!Number.isFinite(r) || !Number.isFinite(l)) {
            numeric = false;
            break;
          }
          rSum += r;
          lSum += l;
        }
        if (numeric) {
          persistedRemaining = rSum;
          persistedLimit = lSum;
        }
      }
      if (
        (persistedRemaining === undefined || persistedLimit === undefined) &&
        typeof authRetrieveQuota === "function"
      ) {
        try {
          const qq = await authRetrieveQuota(token, (quotaResult as any).projectId ?? FALLBACK_PROJECT_ID);
          if (qq) {
            persistedRemaining = Number(qq.remaining);
            persistedLimit = Number(qq.limit);
          }
        } catch {
          /* the guarded best-effort operation falls through: the outer flow owns the failure */
        }
      }
      if (persistedRemaining !== undefined || persistedLimit !== undefined) {
        await persistQuotaResultToAccountsFile(email, { remaining: persistedRemaining, limit: persistedLimit });
      }

      if (jsonFlag) {
        console.log(
          JSON.stringify(
            {
              email,
              raw,
              groups,
              endpoint: (quotaResult as any).endpoint,
              projectId: (quotaResult as any).projectId,
              remaining: persistedRemaining,
              limit: persistedLimit,
            },
            null,
            2,
          ),
        );
        continue;
      }

      // Parse raw if coming from API
      if (raw && typeof raw === "object") {
        // raw may have structure with quotaBuckets or similar
        const buckets = raw.quotaBuckets ?? raw.buckets ?? raw.quota ?? [];
        if (Array.isArray(buckets) && buckets.length) {
          for (const b of buckets) {
            const name = b.displayName ?? b.group ?? b.name ?? b.id ?? "unknown";
            const remaining = b.remaining ?? b.remainingQuota ?? 0;
            const limit = b.limit ?? b.quotaLimit ?? b.max ?? remaining + (b.used ?? 0);
            const reset = b.resetTime ?? b.reset_at ?? b.resetAt;
            console.log(
              `  ${C.cyan(name)}: ${formatQuotaBar(remaining, limit)} ${reset ? C.dim(`reset=${formatDate(new Date(reset).getTime())}`) : ""}`,
            );
            if (b.models?.length)
              console.log(
                `    ${C.dim(`models: ${b.models.slice(0, 5).join(", ")}${b.models.length > 5 ? "..." : ""}`)}`,
              );
          }
        } else if (Object.keys(raw).length) {
          // pretty print all top-level keys
          console.log(C.dim(`  raw keys: ${Object.keys(raw).join(", ")}`));
          // try to interpret known fields
          for (const k of Object.keys(raw)) {
            const v = (raw as any)[k];
            if (v && typeof v === "object" && "remaining" in v) {
              console.log(`  ${C.cyan(k)}: ${formatQuotaBar((v as any).remaining ?? 0, (v as any).limit ?? 1000)}`);
            }
          }
          if (Array.isArray((raw as any).quotaGroups)) {
            for (const g of (raw as any).quotaGroups) {
              console.log(`  ${C.cyan(g.displayName ?? g.id)} remaining=${g.remaining ?? "?"} limit=${g.limit ?? "?"}`);
            }
          } else {
            console.log(`  ${C.dim(JSON.stringify(raw).slice(0, 800))}`);
          }
        }
      }

      if (groups.length) {
        for (const g of groups) {
          console.log(
            `  ${C.cyan(g.id ?? g.group)}: remaining=${(g as any).remaining ?? "?"} used=${(g as any).used ?? "?"} limit=${(g as any).limit ?? "?"}`,
          );
          if ((g as any).models) console.log(`    ${C.dim(`models: ${(g as any).models.join(", ")}`)}`);
        }
      }

      if (!raw || (Object.keys(raw).length === 0 && (!groups || groups.length === 0))) {
        logWarn("  Empty quota - endpoint may have returned 1.0 (expected for gemini-cli), trying daily endpoint...");
      }

      if (persistedRemaining !== undefined && persistedLimit !== undefined) {
        console.log(
          `  ${C.green("[saved]")} remaining=${persistedRemaining}/${persistedLimit} -> ${path.basename(resolveAccountsPath())}`,
        );
      }

      // Evaluate threshold warnings
      const thresholdPct = cfg.soft_quota_threshold_percent ?? 90;
      console.log(
        C.dim(
          `  soft_threshold=${thresholdPct}% | project=${(quotaResult as any).projectId ?? FALLBACK_PROJECT_ID} | endpoint=${(quotaResult as any).endpoint ?? "quota_manager"}`,
        ),
      );
    } catch (e) {
      logErr(`  ${email}: ${(e as Error).message}`);
      if (jsonFlag) console.log(JSON.stringify({ email, error: (e as Error).message }, null, 2));
    }
    console.log("");
  }
}

async function cmdConfig(args: string[]): Promise<void> {
  const sub = (args[0] ?? "list").toLowerCase();
  const cfg = loadAntigravityConfig();

  switch (sub) {
    case "list":
    case "ls":
    case "show": {
      const jsonFlag = args.includes("--json");
      if (jsonFlag) {
        console.log(JSON.stringify(cfg, null, 2));
        return;
      }
      console.log(C.bold(`\nAntigravity Config - ${resolveConfigPath()} (chmod 600)`));
      console.log("");
      for (const [k, v] of Object.entries(cfg)) {
        console.log(
          `  ${C.cyan(k)}: ${C.bold(String(v))} ${C.dim(`(default: ${String((DEFAULT_CONFIG as any)?.[k] ?? "-")})`)}`,
        );
      }
      console.log("");
      console.log(C.dim("Tunable keys:"));
      console.log(
        C.dim("  cli_first (bool), toast_scope (all|project|minimal|none), soft_quota_threshold_percent (0-100)"),
      );
      console.log(C.dim("  quota_fallback (true|false|auto|<model>), quota_refresh_interval_minutes (1-1440)"));
      console.log(
        C.dim(
          "  soft_quota_cache_ttl_minutes, pid_offset_enabled (bool), google_search_enabled (bool), debug (bool), version_cache_ttl",
        ),
      );
      break;
    }
    case "get": {
      const key = args[1];
      if (!key) {
        console.log("Usage: config get <key>");
        process.exit(1);
      }
      const val = (cfg as any)[key];
      if (val === undefined) {
        logWarn(`Key ${key} not found`);
        process.exit(1);
      }
      console.log(`${key}=${JSON.stringify(val)}`);
      break;
    }
    case "set": {
      const key = args[1];
      const rawVal = args[2];
      if (!key || rawVal === undefined) {
        console.log(
          "Usage: config set <key> <value>\nExample: config set soft_quota_threshold_percent 85\n         config set cli_first false",
        );
        process.exit(1);
      }
      // parse value smartly
      let parsed: any = rawVal;
      if (rawVal === "true") parsed = true;
      else if (rawVal === "false") parsed = false;
      else if (!Number.isNaN(Number(rawVal)) && rawVal.trim() !== "") {
        const n = Number(rawVal);
        if (Number.isFinite(n)) parsed = n;
      } else {
        // strip quotes
        parsed = rawVal.replace(/^['"]|['"]$/g, "");
      }

      // Special handling: model catalog validation for quota_fallback when a non-auto/non-bool string
      if (key === "quota_fallback" && typeof parsed === "string" && !["true", "false", "auto"].includes(parsed)) {
        // allow model ids
        const isModel = ALL_MODELS_2026.some((m: any) => m.id === parsed);
        if (!isModel) {
          logWarn(
            `Value ${parsed} is not a known model. Allowed: ${ALL_MODELS_2026.map((m: any) => m.id).join(", ")} or auto/true/false`,
          );
          // continue anyway
        }
      }

      const partial: any = { [key]: parsed };
      try {
        const updated = (() => {
          try {
            if (typeof updateConfig === "function") return updateConfig(partial);
          } catch {
            /* the guarded best-effort operation falls through: the outer flow owns the failure */
          }
          // manual merge atomic
          const current = loadAntigravityConfig();
          const mergedCfg = { ...current, ...partial };
          // validate
          let validated = mergedCfg;
          try {
            if (typeof parseAndValidateConfig === "function")
              validated = parseAndValidateConfig(mergedCfg, { strict: false });
          } catch {
            /* the guarded best-effort operation falls through: the outer flow owns the failure */
          }
          saveAntigravityConfigAtomic(validated);
          return validated;
        })();
        logOk(`Config ${C.bold(key)}=${C.bold(String(parsed))} saved.`);
        console.log(C.dim(JSON.stringify(updated, null, 2)));
      } catch (e) {
        logErr(`Failed to save config: ${(e as Error).message}`);
        process.exit(1);
      }
      break;
    }
    case "reset":
    case "defaults": {
      try {
        saveAntigravityConfigAtomic(DEFAULT_CONFIG ?? cfg);
        logOk("Config reset to defaults.");
        console.log(C.dim(JSON.stringify(DEFAULT_CONFIG, null, 2)));
      } catch (e) {
        logErr((e as Error).message);
      }
      break;
    }
    default:
      console.log(C.bold("config subcommands: list [--json], get <key>, set <key> <value>, reset"));
      console.log(C.dim("Examples:"));
      console.log(C.dim("  config set soft_quota_threshold_percent 85"));
      console.log(C.dim("  config set quota_refresh_interval_minutes 30"));
      console.log(C.dim("  config set toast_scope minimal"));
      break;
  }
}

async function cmdModels(args: string[]): Promise<void> {
  const sub = (args[0] ?? "list").toLowerCase();
  const jsonFlag = args.includes("--json");
  const apiFilter = (() => {
    const idx = args.indexOf("--api");
    if (idx >= 0) return args[idx + 1];
    const apiEq = args.find((a) => a.startsWith("--api="));
    if (apiEq) return apiEq.split("=")[1];
    return undefined;
  })();

  if (sub === "info" || sub === "show") {
    const id = args[1];
    if (!id) {
      console.log("Usage: models info <model-id>");
      process.exit(1);
    }
    const model = (ALL_MODELS_2026 as any[]).find((m: any) => m.id === id);
    if (!model) {
      logErr(`Model ${id} not found. Use models list`);
      process.exit(1);
    }
    if (jsonFlag) {
      console.log(JSON.stringify(model, null, 2));
      return;
    }
    console.log(C.bold(`\n${model.name} (${model.id})`));
    console.log(`  ${C.cyan("API")}: ${model.api} | ${C.cyan("Provider")}: ${model.provider ?? "google"}`);
    console.log(`  ${C.cyan("Context")}: ${model.context} | Output: ${model.output}`);
    console.log(`  ${C.cyan("Family")}: ${model.family} | QuotaGroup: ${model.quotaGroup}`);
    if (model.preview) console.log(`  ${C.yellow("preview=true")}`);
    if (model.thinking) console.log(`  ${C.magenta("thinking=true")}`);
    if (model.customTools) console.log(`  ${C.blue("customTools=true")}`);
    // routing info if available
    try {
      // v2.1.15 Phase A: MODEL_ROUTING lives in models.ts (model identification
      // is owned by models.ts alone).
      const routing = (modelsMod.MODEL_ROUTING as any)?.[id] ?? (modelsPkg.MODEL_ROUTING as any)?.[id];
      if (routing) {
        console.log(
          `  ${C.cyan("Routing")}: endpoint=${routing.endpoint} cloudModelId=${routing.cloudModelId} stream=${routing.stream}`,
        );
      }
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    console.log("");
    return;
  }

  // list
  let list = ALL_MODELS_2026 as any[];
  if (apiFilter) list = list.filter((m) => m.api === apiFilter);
  if (jsonFlag) {
    console.log(JSON.stringify(list, null, 2));
    return;
  }

  console.log(C.bold(`\nCatalog ALL_MODELS_2026 (${list.length} models)`));
  console.log(C.dim(`Fallback project: ${FALLBACK_PROJECT_ID} | Client: GeminiCLI/0.57.0`));
  console.log("");
  console.log(C.dim(`  ${"ID".padEnd(38)} ${"API".padEnd(14)} ${"CTX".padEnd(8)} QUOTA-GROUP`));
  console.log(C.dim("  " + "-".repeat(80)));
  for (const m of list) {
    const idPad = String(m.id).padEnd(38);
    const apiPad = String(m.api ?? "").padEnd(14);
    const ctx = String(m.context).padEnd(8);
    const color = m.api === "antigravity" ? C.cyan : C.green;
    const preview = m.preview ? C.yellow(" preview") : "";
    const think = m.thinking ? C.magenta(" thinking") : "";
    console.log(`  ${color(idPad)} ${apiPad} ${ctx} ${m.quotaGroup}${preview}${think}`);
  }
  console.log("");
  console.log(C.dim("Use: models info <id> for details"));
  console.log(C.dim("Filter: --api antigravity | --api gemini-cli"));
}

async function cmdStatus(_args: string[]): Promise<void> {
  const mgr = getAccountManager();
  const cfg = loadAntigravityConfig();
  const accounts = mgr.listAccounts?.() ?? [];
  const active = (() => {
    try {
      return mgr.getActiveAccount?.();
    } catch {
      return null;
    }
  })();
  console.log(C.bold("\nAntigravity Status"));
  console.log(
    C.dim(`BaseDir: ${resolveBaseDir()} | AccountsFile: ${resolveAccountsPath()} | ConfigFile: ${resolveConfigPath()}`),
  );
  console.log("");
  console.log(
    `  ${C.cyan("Accounts")}: ${accounts.length} total, ${accounts.filter((a: any) => a.enabled !== false).length} enabled`,
  );
  if (active)
    console.log(`  ${C.cyan("Active")}: ${C.bold(active.email)} (project=${active.projectId ?? FALLBACK_PROJECT_ID})`);
  else console.log(`  ${C.cyan("Active")}: ${C.yellow("none")}`);
  console.log(
    `  ${C.cyan("Config")}: cli_first=${cfg.cli_first} toast_scope=${cfg.toast_scope} soft_quota=${cfg.soft_quota_threshold_percent}% refresh=${cfg.quota_refresh_interval_minutes}min fallback=${cfg.quota_fallback}`,
  );
  // file perms
  for (const p of [resolveAccountsPath(), resolveConfigPath()]) {
    try {
      if (!fs.existsSync(p)) {
        console.log(`  ${C.dim(p)}: ${C.yellow("does not exist")}`);
        continue;
      }
      const stat = fs.statSync(p);
      const mode = (stat.mode & 0o777).toString(8);
      const ok = mode === "600" || mode === "700";
      console.log(
        `  ${C.dim(p)}: mode=${ok ? C.green(mode) : C.red(mode)} size=${stat.size}b mtime=${formatDate(stat.mtimeMs)}`,
      );
    } catch (e) {
      console.log(`  ${C.dim(p)}: ${C.red((e as Error).message)}`);
    }
  }
  // version cache
  try {
    const vInfo = await getVersionInfo();
    console.log(`  ${C.cyan("Antigravity Version")}: ${vInfo.version} (source=${vInfo.source})`);
  } catch {
    console.log(`  ${C.cyan("Antigravity Version")}: ${C.yellow("failed to fetch - using fallback")}`);
  }
  console.log("");
  // quick quota summary for active
  if (active) {
    try {
      console.log(C.dim("Checking quick quota for the active account..."));
      const q = await fetchQuotaForAccount(active.email, mgr, null);
      const buckets = (q.raw?.quotaBuckets ?? q.raw?.buckets ?? []) as any[];
      if (buckets.length) {
        for (const b of buckets.slice(0, 5)) {
          const name = b.displayName ?? b.group ?? "quota";
          console.log(`  ${C.cyan(name)} remaining=${b.remaining ?? "?"} limit=${b.limit ?? "?"}`);
        }
      } else {
        console.log(C.dim("  Raw quota available, but without detailed buckets (daily endpoint vs base)"));
      }
    } catch (e) {
      logWarn(`  Quota check failed: ${(e as Error).message}`);
    }
  }
  console.log("");
}

async function cmdDoctor(_args: string[]): Promise<void> {
  console.log(C.bold("\nDoctor - Antigravity Diagnostics"));
  console.log("");
  const checks: Array<{ name: string; ok: boolean; msg: string }> = [];
  // dir
  try {
    const base = resolveBaseDir();
    ensureDirExists(base);
    const stat = fs.statSync(base);
    checks.push({ name: "baseDir exists", ok: true, msg: `${base} mode=${(stat.mode & 0o777).toString(8)}` });
  } catch (e) {
    checks.push({ name: "baseDir exists", ok: false, msg: (e as Error).message });
  }
  // accounts file
  try {
    const p = resolveAccountsPath();
    if (fs.existsSync(p)) {
      const st = fs.statSync(p);
      const mode = (st.mode & 0o777).toString(8);
      checks.push({
        name: "accounts file",
        ok: mode === "600",
        msg: `${p} mode=${mode} ${mode !== "600" ? "(must be 600)" : ""}`,
      });
      // try to chmod fix
      if (mode !== "600") {
        try {
          fs.chmodSync(p, 0o600);
          checks.push({ name: "chmod fix accounts", ok: true, msg: "fixed to 600" });
        } catch {
          /* the guarded best-effort operation falls through: the outer flow owns the failure */
        }
      }
      const data = readJsonSafe<any>(p, { accounts: [] });
      checks.push({ name: "accounts valid JSON", ok: true, msg: `${data.accounts?.length ?? 0} accounts` });
      // check tokens expiring
      const now = Date.now();
      const expiring = (data.accounts ?? []).filter((a: any) => a.expiryDate && a.expiryDate < now + 600000);
      checks.push({
        name: "token expiry",
        ok: expiring.length === 0,
        msg: expiring.length ? `${expiring.length} token(s) expiring <10min` : "all valid",
      });
    } else {
      checks.push({ name: "accounts file", ok: false, msg: `${p} does not exist - run login` });
    }
  } catch (e) {
    checks.push({ name: "accounts file", ok: false, msg: (e as Error).message });
  }
  // config file
  try {
    const p = resolveConfigPath();
    if (fs.existsSync(p)) {
      const st = fs.statSync(p);
      checks.push({ name: "config file", ok: true, msg: `${p} mode=${(st.mode & 0o777).toString(8)}` });
      const cfgRaw = readJsonSafe<any>(p, {});
      checks.push({
        name: "config valid",
        ok: Object.keys(cfgRaw).length > 0,
        msg: `${Object.keys(cfgRaw).length} keys`,
      });
    } else {
      checks.push({ name: "config file", ok: false, msg: `${p} does not exist - defaults will be created` });
      saveAntigravityConfigAtomic(DEFAULT_CONFIG ?? { cli_first: true });
      checks.push({ name: "config created", ok: true, msg: "defaults created" });
    }
  } catch (e) {
    checks.push({ name: "config file", ok: false, msg: (e as Error).message });
  }
  // bypass headers constants
  checks.push({
    name: "bypass constants",
    ok: GEMINI_OAUTH_CLIENT_ID.includes("681255809395"),
    msg: `client_id=${GEMINI_OAUTH_CLIENT_ID.includes("681255809395") ? "gemini-cli-default" : "custom"} UA=GeminiCLI/0.57.0 X-Goog=gl-node/22.19.0`,
  });
  // fetch project?
  checks.push({ name: "fallback project", ok: !!FALLBACK_PROJECT_ID, msg: FALLBACK_PROJECT_ID });

  // Logs dir reporting (ported from cli(5).ts diagnostics)
  try {
    const ld = resolveLogsDir();
    checks.push({
      name: "logs dir",
      ok: fs.existsSync(ld),
      msg: `${ld}${fs.existsSync(ld) ? "" : " (not created yet)"}`,
    });
  } catch (e) {
    checks.push({ name: "logs dir", ok: false, msg: (e as Error).message });
  }

  // Default model reporting (ported from cli(5).ts diagnostics)
  try {
    const def = FLAT_MODELS_2026.find((m: any) => m.id === DEFAULT_MODEL_ID);
    checks.push({
      name: "default model",
      ok: Boolean(def),
      msg: def ? `${def.id} (${def.name}) release=${def.release ?? "?"}` : DEFAULT_MODEL_ID,
    });
  } catch (e) {
    checks.push({ name: "default model", ok: false, msg: (e as Error).message });
  }

  // opencode.json location (via the ported locateOpenCodeJson resolver)
  try {
    const loc = await locateOpenCodeJson();
    checks.push({
      name: "opencode.json",
      ok: loc.exists,
      msg: `${loc.path}${loc.exists ? ` (found via ${loc.source})` : ` (missing, would create via ${loc.source})`}`,
    });
  } catch (e) {
    checks.push({ name: "opencode.json", ok: false, msg: (e as Error).message });
  }

  for (const ch of checks) {
    console.log(`  ${ch.ok ? C.green("[ok]") : C.red("[x]")} ${C.bold(ch.name)}: ${ch.msg}`);
  }
  console.log("");
  // Raw accounts file dump - first 1000 chars (ported from cli(4).ts diagnostics)
  try {
    const ap = resolveAccountsPath();
    if (fs.existsSync(ap)) {
      const rawAcc = fs.readFileSync(ap, "utf8");
      console.log(C.dim("Accounts file raw (first 1000 chars):"));
      console.log(C.dim(rawAcc.slice(0, 1000)));
      console.log("");
    }
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  // suggestions
  console.log(C.dim("Suggestions:"));
  console.log(C.dim("  - If a token is expiring: AccountManager auto-refreshes on use, or run `login` again"));
  console.log(C.dim("  - If mode != 600: the CLI fixes permissions automatically on the next write"));
  console.log(C.dim("  - To force bypass headers: always use gl-node/22.19.0 and Client-Metadata IDE_UNSPECIFIED"));
  console.log("");
}

async function cmdVersion(_args: string[]): Promise<void> {
  const jsonFlag = _args.includes("--json");
  try {
    const info = await getVersionInfo();
    if (jsonFlag) {
      console.log(
        JSON.stringify(
          {
            plugin: PLUGIN_VERSION_FALLBACK,
            antigravity: info.version,
            full: info,
            client_id: GEMINI_OAUTH_CLIENT_ID.includes("681255809395") ? "gemini-cli-default" : "custom",
            project: FALLBACK_PROJECT_ID,
            models: ALL_MODELS_2026.length,
          },
          null,
          2,
        ),
      );
      return;
    }
    console.log(C.bold("\nVersions"));
    console.log(`  Plugin devthink: ${C.bold(PLUGIN_VERSION_FALLBACK)}`);
    console.log(
      `  Antigravity: ${C.bold(info.version)} full=${(info as any).fullVersion ?? "-"} source=${info.source}`,
    );
    console.log(
      `  ClientID: ${C.dim(GEMINI_OAUTH_CLIENT_ID.includes("681255809395") ? "gemini-cli-default (redacted)" : "custom (redacted)")} (Gemini CLI 0.57.0)`,
    );
    console.log(`  Project fallback: ${FALLBACK_PROJECT_ID}`);
    console.log(`  Models catalog: ${ALL_MODELS_2026.length} (antigravity-first)`);
    console.log(`  BaseDir: ${resolveBaseDir()}`);
  } catch (e) {
    console.log(C.bold(`\nFallback version: ${PLUGIN_VERSION_FALLBACK}`));
    console.log(C.dim(`Error fetching remote version: ${(e as Error).message}`));
  }
}

// ===========================================================================
// 05B. LOGOUT / ENABLE / DISABLE / MANAGE (ported from cli(2).ts + cli(5).ts)
// ===========================================================================

/**
 * Best-effort OAuth token revocation against Google's revoke endpoint.
 * A 400 response means the token was already invalid/revoked - counted as OK.
 */
async function revokeGoogleToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    // v2.1.16 single-owner fix: revoke endpoint from constants.js
    // (OAUTH_REVOKE_URL owner) instead of a local literal.
    const res = await fetch(OAUTH_REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }).toString(),
    });
    return res.ok || res.status === 400;
  } catch {
    return false;
  }
}

/**
 * Logout flow (ported from cli(2).ts, extended with token revocation):
 * revokes the Google refresh/access token and removes the account from the
 * store. Supports a single email, --all, and an interactive picker when no
 * email is given. Pass {@link sharedRl} when called from the interactive menu.
 */
async function logoutFlow(emailArg?: string, all = false, sharedRl?: readline.Interface): Promise<void> {
  printHeader();
  const rl = sharedRl ?? readline.createInterface({ input, output });
  const ownedRl = !sharedRl;
  try {
    const mgr: any = getAccountManager();
    const accounts: any[] = mgr.listAccounts?.() ?? [];

    if (accounts.length === 0) {
      logWarn("No accounts registered.");
      return;
    }

    if (all) {
      console.log(C.bold(`Logout --all: removing ${accounts.length} account(s)`));
      const okAll = await confirm(
        rl,
        C.red(`Confirm removal of ALL ${accounts.length} accounts (tokens will be revoked)?`),
        false,
      );
      if (!okAll) {
        console.log(C.dim("Cancelled."));
        return;
      }
      let removedCount = 0;
      for (const acc of accounts) {
        await revokeGoogleToken(acc.refreshToken ?? acc.refresh_token ?? acc.accessToken);
        try {
          await mgr.removeAccount(acc.email);
          removedCount++;
          console.log(C.dim(`  removed ${acc.email}`));
        } catch (e) {
          console.log(C.red(`  failed ${acc.email}: ${(e as Error).message}`));
        }
      }
      logOk(`All accounts removed (${removedCount}). Store: ${resolveAccountsPath()}`);
      auditLog(`logout --all removed=${removedCount}`);
      return;
    }

    let targetEmail = emailArg?.toLowerCase().trim();

    if (!targetEmail) {
      if (accounts.length === 1) {
        targetEmail = String(accounts[0]?.email ?? "").toLowerCase();
      } else {
        // interactive choose
        console.log(C.bold("Logout - choose an account to remove:\n"));
        accounts.forEach((acc, i) => {
          const mark = acc.disabled === true || acc.enabled === false ? C.red("[disabled]") : C.green("[active]");
          console.log(
            `  ${C.cyan(String(i + 1))}. ${redactEmail(String(acc.email))} ${mark} project=${acc.projectId ?? FALLBACK_PROJECT_ID}`,
          );
        });
        const ans = await askQuestion(rl, `\nEnter number (1-${accounts.length}) or email: `);
        const num = Number(ans);
        if (Number.isFinite(num) && num >= 1 && num <= accounts.length) {
          targetEmail = String(accounts[num - 1]?.email ?? "").toLowerCase();
        } else if (ans.includes("@")) {
          targetEmail = ans.toLowerCase();
        } else {
          logWarn("Invalid input, cancelled.");
          return;
        }
      }
    }

    if (!targetEmail) {
      logWarn("No email provided, cancelled.");
      return;
    }

    const chosen: string = targetEmail;
    const existing = mgr.findAccount?.(chosen) ?? accounts.find((a) => String(a.email).toLowerCase() === chosen);
    if (!existing) {
      logErr(`Account not found: ${chosen}`);
      console.log(C.dim(`Existing accounts: ${accounts.map((a) => a.email).join(", ")}`));
      process.exitCode = 1;
      return;
    }

    const okOne = await confirm(
      rl,
      `Remove account ${C.bold(existing.email)} (its refresh token will be revoked)?`,
      false,
    );
    if (!okOne) {
      console.log(C.dim("Cancelled."));
      return;
    }

    const revoked = await revokeGoogleToken(existing.refreshToken ?? existing.refresh_token ?? existing.accessToken);
    console.log(
      revoked
        ? C.dim("  token revoked via oauth2.googleapis.com/revoke")
        : C.dim("  token revocation skipped/failed (removing the account locally anyway)"),
    );

    const removed = await mgr.removeAccount(existing.email);
    if (removed) {
      logOk(`Account removed: ${existing.email}`);
    } else {
      logErr(`Failed to remove: ${existing.email}`);
      process.exitCode = 1;
    }
    auditLog(`logout ${existing.email} revoked=${revoked}`);
  } finally {
    if (ownedRl) rl.close();
  }
}

/** Top-level enable command (ported from cli(2).ts enableAccountFlow). */
async function enableAccountFlow(email: string): Promise<void> {
  printHeader();
  const mgr: any = getAccountManager();
  try {
    if (typeof mgr.enableAccount === "function") mgr.enableAccount(email);
    else if (typeof mgr.enable === "function") await mgr.enable(email);
    else throw new Error("account manager does not support enable");
    logOk(`Account enabled: ${email}`);
  } catch (e) {
    logErr(`Account not found or enable failed: ${email} (${(e as Error).message})`);
    process.exitCode = 1;
  }
}

/** Top-level disable command (ported from cli(2).ts disableAccountFlow). */
async function disableAccountFlow(email: string, reason = "manually disabled via CLI"): Promise<void> {
  printHeader();
  const mgr: any = getAccountManager();
  try {
    if (typeof mgr.disableAccount === "function") mgr.disableAccount(email, reason);
    else if (typeof mgr.disable === "function") await mgr.disable(email);
    else throw new Error("account manager does not support disable");
    logOk(`Account disabled: ${email} (skipped in rotation)`);
  } catch (e) {
    logErr(`Account not found or disable failed: ${email} (${(e as Error).message})`);
    process.exitCode = 1;
  }
}

/**
 * Interactive per-account enable/disable toggle
 * (ported from cli(5).ts manage command, backed by auth.js accountManager).
 * Pass {@link sharedRl} when invoked from the interactive menu.
 */
async function cmdManage(_args: string[], sharedRl?: readline.Interface): Promise<void> {
  const rl = sharedRl ?? readline.createInterface({ input, output });
  const ownedRl = !sharedRl;
  try {
    await cmdAccounts(["list"]);
    const email = await askQuestion(rl, "Email to toggle enable/disable: ");
    if (!email) {
      logWarn("Cancelled.");
      return;
    }
    const enStr = await askQuestion(rl, "Enable true/false [true]: ");
    const en = enStr.trim().toLowerCase() !== "false";

    let applied = false;
    // Preferred path: auth.js accountManager.enable(email, bool) on the v3 store
    if (typeof AuthAccountManager === "function") {
      try {
        const m = new AuthAccountManager();
        if (typeof m.load === "function") {
          try {
            await m.load();
          } catch {
            /* the guarded best-effort operation falls through: the outer flow owns the failure */
          }
        }
        if (typeof m.enable === "function") {
          await m.enable(email, en);
          applied = true;
        }
      } catch (e) {
        logWarn(`auth.js manager toggle failed: ${(e as Error).message}`);
      }
    }
    if (!applied) {
      const mgr: any = getAccountManager();
      if (en) mgr.enableAccount(email);
      else mgr.disableAccount(email, "disabled via manage command");
    }
    auditLog(`manage ${en ? "enable" : "disable"} ${email}`);
    console.log(`${en ? "enabled" : "disabled"} ${email}`);
  } finally {
    if (ownedRl) rl.close();
  }
}

// ===========================================================================
// 05C. MODELS 2026 CATALOG + OPENCODE.JSON CONFIGURE (ported from cli(2)/(4)/(5))
// ===========================================================================

const CLI_VERSION = "6.0.0" as const;

/** Plugin identifier written into the opencode.json plugin list. */
const PLUGIN_NAME = "devthink" as const;

/**
 * Direct cloudcode endpoints used by the documented bypass cascade.
 * v2.1.16 single-owner fix: derived from models.js ENDPOINT_ORDER (the
 * PROD/DAILY/SANDBOX routing-order owner) instead of local URL literals —
 * same three URLs in the same order.
 */
const CLOUDCODE_ENDPOINTS_DIRECT: readonly string[] = ENDPOINT_ORDER;

// v2.1.16 single-owner fix: ModelCatalogEntry + MODELS_2026_CATALOG moved to
// models.ts (model identification lives only in models.ts); they are imported
// at the top of this file and re-exported below under the historical names.

/**
 * Build the flat provider.google.models section from the merged models.ts
 * catalog (behavior of cli(5).ts configure):
 *  - every thinking level becomes a { thinkingLevel } variant;
 *  - claude-opus ids additionally gain low/max thinkingConfig budget variants;
 *  - claude-sonnet ids with thinking gain low/high thinkingLevel variants.
 */
function buildGoogleProviderModelConfigs(): Record<string, any> {
  const modelsConfig: Record<string, any> = {};
  for (const m of FLAT_MODELS_2026) {
    const variants: Record<string, any> = {};
    for (const v of m.thinking ?? []) {
      variants[v] = { thinkingLevel: v };
    }
    if (String(m.id).includes("claude-opus")) {
      variants.low = { thinkingConfig: { thinkingBudget: 8192 } };
      variants.max = { thinkingConfig: { thinkingBudget: 32768 } };
    }
    if (String(m.id).includes("claude-sonnet") && (m.thinking?.length ?? 0) > 0) {
      variants.low = { thinkingLevel: "low" };
      variants.high = { thinkingLevel: "high" };
    }
    modelsConfig[m.id] = {
      name: m.name,
      limit: { context: m.context, output: m.output },
      modalities: m.modalities,
      variants,
      release: m.release,
    };
  }
  return modelsConfig;
}

/**
 * Rich provider model definitions with bypass documentation metadata
 * (ported from cli(2).ts buildOpenCodeModelDefinitions).
 * Returns the plugin list, the provider-level models map and the top-level
 * model shortcut map for opencode.json.
 */
function buildOpenCodeModelDefinitions(): {
  pluginList: string[];
  providerModels: Record<string, any>;
  topLevelModels: Record<string, any>;
} {
  const pluginList = [PLUGIN_NAME];

  const providerModels: Record<string, any> = {};
  const topLevelModels: Record<string, any> = {};

  for (const entry of MODELS_2026_CATALOG) {
    const baseId = entry.id;

    // Provider-level definition - rich metadata for the plugin
    const richDef = {
      id: baseId,
      name: entry.name,
      // NOTE: no `provider` string field here - the opencode config schema
      // expects `provider.<id>.models.<id>.provider` to be an options OBJECT
      // (or absent); the models are already scoped under
      // provider.antigravity.models, so the string variant from the internal
      // catalog (entry.provider) must not leak into the written config.
      family: entry.family,
      contextWindow: entry.context,
      outputLimit: entry.output,
      thinking: entry.thinking
        ? {
            supported: true,
            budget: entry.family === "claude" ? 32_768 : 16_384,
            max: entry.family === "claude" ? 64_000 : 32_768,
            levels: ["minimal", "low", "medium", "high", "max"],
          }
        : { supported: false },
      modalities: { input: ["text", "image", "pdf"], output: ["text"] },
      // Bypass metadata - documents how the UA / headers work
      antigravity: {
        bypass: {
          userAgent: `${ANTIGRAVITY_UA_FB} {os}/{arch}`,
          stripHeaders: ["x-goog-user-project", "x-goog-quota-user"],
          endpoints: [...CLOUDCODE_ENDPOINTS_DIRECT],
          cascade: "403/404/5xx",
          versionFallback: ANTIGRAVITY_VER_FB,
        },
        endpoint: CODE_ASSIST.PROD,
        projectFallback: FALLBACK_PROJECT_ID,
      },
      // v2.1.16 single-owner fix: search model id from models.js
      // (SEARCH_MODEL_PREVIEW owner) instead of a local literal.
      googleSearch: entry.family === "gemini" ? { enabled: true, model: SEARCH_MODEL_PREVIEW } : undefined,
    };

    providerModels[baseId] = richDef;

    // Register variants/aliases as separate provider models + top-level shortcuts
    const allIds = [baseId, ...entry.variants, ...entry.aliases];
    const uniqIds = Array.from(new Set(allIds));

    for (const vid of uniqIds) {
      // Minimal top-level alias for opencode compatibility
      topLevelModels[vid] = {
        provider: "antigravity",
        model: baseId,
        name: entry.name,
        limit: { context: entry.context, output: entry.output },
      };
      if (!providerModels[vid]) {
        providerModels[vid] = {
          ...richDef,
          id: vid,
          aliasOf: baseId,
          name: `${entry.name} (alias ${vid})`,
        };
      }
    }

    // "antigravity/" slash prefixed shortcut for OpenCode provider routing
    const slashKey = `antigravity/${baseId}`;
    topLevelModels[slashKey] = {
      provider: "antigravity",
      model: baseId,
      name: entry.name,
    };
  }

  // Fallback: also register the OAuth supported model list from oauth.ts
  for (const m of OAUTH_SUPPORTED_MODELS) {
    const mid = String(m);
    if (!providerModels[mid]) {
      providerModels[mid] = {
        id: mid,
        name: `${mid} (Antigravity 2026)`,
        // no `provider` string field - see the richDef note above (the
        // opencode config schema rejects a string provider inside
        // provider.<id>.models.<id>).
        family: mid.includes("claude") ? "claude" : "gemini",
        contextWindow: mid.includes("claude") ? 200_000 : 1_048_576,
        outputLimit: mid.includes("claude") ? 64_000 : 65_535,
        thinking: { supported: true },
        aliasOf: undefined,
      };
    }
    if (!topLevelModels[mid]) {
      topLevelModels[mid] = { provider: "antigravity", model: mid };
    }
  }

  return { pluginList, providerModels, topLevelModels };
}

/**
 * Configure models flow (merge of cli(2).ts configureModelsFlow with the
 * cli(4)/cli(5) provider.google.models writer):
 *  - locates opencode.json via locateOpenCodeJson (--global / --path aware);
 *  - backs up an existing file with invalid JSON before overwriting;
 *  - detects the TARGET provider by MODEL IDS ONLY (any user-chosen provider
 *    name carrying antigravity-* / gemini-* models, e.g. "casas-bahia"),
 *    falling back to "google" when none exists yet;
 *  - ADD-ONLY merge: user model entries are NEVER overwritten (custom name /
 *    limit / options / thinking variants are preserved verbatim), catalog
 *    models are appended only when the id is missing;
 *  - user provider options/npm/name are never touched (no forced baseUrl,
 *    no __comment pollution); minimal block fields are set only when
 *    creating a brand-new provider;
 *  - preserves the file's existing indentation and trailing newline, and
 *    skips the write entirely when nothing changed;
 *  - writes everything with atomicWriteFileAtomic (tmp + chmod 600 + rename).
 */
async function configureModelsFlow(
  opts: { global?: boolean | undefined; customPath?: string | undefined } = {},
): Promise<void> {
  printHeader();
  console.log(C.bold("Configure models - writing plugin model definitions into opencode.json\n"));

  const loc = await locateOpenCodeJson(opts.customPath, opts.global === true);
  console.log(C.dim(`Target candidate: ${loc.path} (exists=${loc.exists}, source=${loc.source})`));
  console.log(C.dim(`Global config dir: ${resolveBaseDir()}`));
  console.log("");

  let existing: any = {};
  let rawOriginal = "";
  if (loc.exists) {
    rawOriginal = await fsp.readFile(loc.path, "utf8").catch(() => "");
    const parsed = await readJsonFileSafe(loc.path);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      existing = parsed;
      logOk(`Existing opencode.json loaded (${Object.keys(parsed).length} top-level keys)`);
    } else {
      logWarn("Existing opencode.json contains invalid JSON - backing it up and starting fresh");
      try {
        const backupPath = `${loc.path}.backup-${Date.now()}.json`;
        await fsp.copyFile(loc.path, backupPath);
        console.log(C.dim(`  backup -> ${backupPath}`));
      } catch {
        /* the guarded best-effort operation falls through: the outer flow owns the failure */
      }
      existing = {};
      rawOriginal = "";
    }
  } else {
    console.log(C.dim("opencode.json does not exist yet - a new one will be created"));
  }

  // Detect the target provider by model ids (never by fixed name); the
  // user may have named it anything as long as it carries our model ids.
  const detectTargetProvider = (cfg: any): { id: string; existed: boolean } => {
    const providers = cfg?.provider;
    if (providers && typeof providers === "object") {
      let best: { id: string; score: number } | null = null;
      for (const [id, block] of Object.entries(providers as Record<string, any>)) {
        if (!block || typeof block !== "object") continue;
        const models = block.models;
        if (!models || typeof models !== "object") continue;
        let score = 0;
        for (const modelId of Object.keys(models)) {
          const l = modelId.toLowerCase();
          if (l.startsWith("antigravity-")) {
            score = Math.max(score, 100);
            break;
          }
          if (l.startsWith("gemini-")) score = Math.max(score, 60);
        }
        if (score <= 0) continue;
        const lid = id.toLowerCase();
        if (lid === "google") score += 10;
        else if (lid === "antigravity") score += 5;
        if (!best || score > best.score) best = { id, score };
      }
      if (best) return { id: best.id, existed: true };
    }
    return { id: "google", existed: false };
  };

  const target = detectTargetProvider(existing);
  const defs = buildOpenCodeModelDefinitions();
  const googleModels = buildGoogleProviderModelConfigs();

  // Merge strategy - ADD-ONLY, user wins:
  //  - plugin: unique array merge; never duplicates devthink when a variant
  //    (@wenathlan/devthink, devthink@latest, ...) is already listed
  //  - provider.<target>.models: catalog ids appended ONLY when missing;
  //    existing user entries (custom limits/options/variants) untouched
  //  - provider npm/name/options: set only when creating a brand-new block
  //  - top-level models: additive merge keeping user overrides
  const merged: any = { ...existing };

  if (!merged.$schema) merged.$schema = "https://opencode.ai/config.json";

  const existingPlugins: any[] = Array.isArray(merged.plugin)
    ? merged.plugin
    : Array.isArray(merged.plugins)
      ? merged.plugins
      : [];
  const pluginsSet = new Set<string>(existingPlugins.map((p: any) => String(p)));
  // v2.1.21 — the plugin reference is name-agnostic: any variant already
  // listed counts ("@wenathlan/devthink", "devthink@npm:@wenathlan/devthink@latest"
  // — the scope-free npm alias —, "file:.../devthink", ...) and is never
  // duplicated. When nothing exists we add the canonical npm name.
  // (A package literally named "devthink" outside the @wenathlan scope cannot exist on npmjs.org — the
  // registry blocks the name with 403 "too similar to madge/panene/sane" —
  // so the bare spelling is the npm ALIAS, documented in the README.)
  const hasdevthinkvariant = [...pluginsSet].some((p) => /(^|[/@])devthink([@/]|$)/.test(p));
  if (!hasdevthinkvariant) {
    pluginsSet.add("@wenathlan/devthink");
  }
  merged.plugin = Array.from(pluginsSet);

  if (!merged.provider || typeof merged.provider !== "object") merged.provider = {};
  if (!merged.provider[target.id] || typeof merged.provider[target.id] !== "object") merged.provider[target.id] = {};
  const targetBlock = merged.provider[target.id];
  const existingModels = targetBlock.models && typeof targetBlock.models === "object" ? targetBlock.models : {};
  const addedModels: Record<string, any> = {};
  for (const [id, def] of Object.entries(googleModels)) {
    if (!existingModels[id]) addedModels[id] = def;
  }
  targetBlock.models = { ...existingModels, ...addedModels };
  if (!target.existed) {
    // brand-new provider: minimal fields only; options the user later adds
    // (or loader-injected credentials) always win - nothing is forced
    if (!targetBlock.name) targetBlock.name = target.id;
    if (!targetBlock.npm) targetBlock.npm = "@ai-sdk/openai-compatible";
    if (targetBlock.options === undefined) targetBlock.options = {};
  }

  if (!merged.models || typeof merged.models !== "object") merged.models = {};
  const topModels = merged.models;
  for (const k of Object.keys(defs.topLevelModels)) {
    const v = defs.topLevelModels[k];
    if (!topModels[k]) {
      topModels[k] = v;
    } else {
      topModels[k] = {
        ...(v as any),
        ...topModels[k],
        provider: topModels[k].provider ?? target.id,
        model: topModels[k].model ?? (v as any).model,
      };
    }
  }
  merged.models = topModels;

  // Preserve the user's formatting: detect indentation + trailing newline
  const detectIndent = (raw: string): { indent: string; trailingNewline: boolean } => {
    let indent = "  ";
    const m = raw.match(/\n([ \t]+)"/);
    if (m?.[1]) indent = m[1];
    return { indent, trailingNewline: raw === "" ? true : raw.endsWith("\n") };
  };
  const fmt = detectIndent(rawOriginal);
  const indentArg: number | "\t" = fmt.indent.includes("\t") ? "\t" : Math.min(Math.max(fmt.indent.length, 1), 8);
  const content = JSON.stringify(merged, null, indentArg) + (fmt.trailingNewline ? "\n" : "");

  if (rawOriginal !== "" && content === rawOriginal) {
    logOk(`opencode.json already up to date - nothing to add (target provider "${target.id}")`);
    console.log(
      C.dim(
        `  provider.${target.id}.models: ${Object.keys(targetBlock.models).length} definitions (all present, user entries preserved)`,
      ),
    );
    return;
  }

  try {
    await atomicWriteFileAtomic(loc.path, content, 0o600);
    logOk(`opencode.json written atomically (chmod 600) -> ${loc.path}`);
    console.log(
      C.dim(
        `  target provider: ${target.id} (${target.existed ? "detected by model ids, user block preserved" : "created (nothing existed yet)"})`,
      ),
    );
    console.log(C.dim(`  plugin: ${JSON.stringify(merged.plugin)}`));
    console.log(
      C.dim(
        `  provider.${target.id}.models: +${Object.keys(addedModels).length} added, ${Object.keys(existingModels).length} existing preserved (user customizations untouched)`,
      ),
    );
    console.log(C.dim(`  top-level models: ${Object.keys(topModels).length} entries (additive)`));
    console.log(C.dim(`  indentation preserved: ${JSON.stringify(fmt.indent)}`));
    console.log(`\n${C.bold("Verify:")} ${C.cyan(`cat ${loc.path}`)}`);
  } catch (e) {
    logErr(`Failed to write opencode.json: ${(e as Error).message}`);
    process.exitCode = 1;
  }
}

// ===========================================================================
// 06. INTERACTIVE MENU
// ===========================================================================
async function interactiveMenu(): Promise<void> {
  const rl = readline.createInterface({ input, output });
  let exit = false;
  const mgr = getAccountManager();

  const menu = `
${C.bold("============================================================")}
${C.bold("   Opencode Antigravity Auth - Interactive CLI (unified)    ")}
${C.bold("============================================================")}
${C.dim(`Dir: ${resolveBaseDir()} | Client: GeminiCLI/0.57.0 | gl-node/22.19.0 | project=${FALLBACK_PROJECT_ID}`)}

${C.cyan("1")}   Login OAuth (PKCE + browser) - add or fresh start
${C.cyan("2")}   List accounts (rich v3 format)
${C.cyan("3")}   Add account manually
${C.cyan("4")}   Set active account / rotation strategy
${C.cyan("5")}   Enable / Disable account
${C.cyan("6")}   Remove account
${C.cyan("7")}   Check quotas (active or all) - persists results
${C.cyan("8")}   Configure thresholds / catalog
${C.cyan("9")}   Models (catalog ALL_MODELS_2026)
${C.cyan("10")}  Status + Doctor/Diagnostics
${C.cyan("11")}  Version
${C.cyan("12")}  Logout (revoke token + remove account)
${C.cyan("13")}  Manage accounts (toggle enable/disable)
${C.cyan("14")}  Configure models -> opencode.json (--global/custom)
${C.cyan("0")}   Exit
`;

  while (!exit) {
    console.log(menu);
    const choice = (await rl.question(`${C.bold("Choose [0-14]: ")}`)).trim();
    switch (choice) {
      case "1": {
        const noB = (await askQuestion(rl, "No-browser? (y/N): ")).toLowerCase();
        await cmdLogin(noB ? ["--no-browser"] : [], rl);
        break;
      }
      case "2": {
        await cmdAccounts(["list"]);
        break;
      }
      case "3": {
        const email = await askQuestion(rl, "Email: ");
        const rt = await askQuestion(rl, "Refresh token: ");
        if (!email || !rt) {
          logWarn("Cancelled");
          break;
        }
        const proj = (await askQuestion(rl, `Project ID [${FALLBACK_PROJECT_ID}]: `)) || FALLBACK_PROJECT_ID;
        try {
          mgr.addAccount({ email, refreshToken: rt, projectId: proj, enabled: true });
          logOk(`Added ${email}`);
        } catch (e) {
          logErr((e as Error).message);
        }
        break;
      }
      case "4": {
        await cmdAccounts(["list"]);
        const email = await askQuestion(rl, "Email to activate: ");
        if (!email) break;
        const sticky = (await askQuestion(rl, "Sticky mode? (y/N): ")).toLowerCase();
        const stickyOn = /^(y|yes)$/.test(sticky);
        try {
          mgr.setActive(email, { sticky: stickyOn });
          logOk(`Active ${email} sticky=${stickyOn}`);
        } catch (e) {
          logErr((e as Error).message);
        }
        break;
      }
      case "5": {
        await cmdAccounts(["list"]);
        const email = await askQuestion(rl, "Email to toggle enable/disable: ");
        if (!email) break;
        const act = (await askQuestion(rl, "Enable (e) / Disable (d)? [e/d]: ")).toLowerCase();
        try {
          if (act === "d") {
            mgr.disableAccount(email, "manual interactive");
            logOk(`Disabled ${email}`);
          } else {
            mgr.enableAccount(email);
            logOk(`Enabled ${email}`);
          }
        } catch (e) {
          logErr((e as Error).message);
        }
        break;
      }
      case "6": {
        await cmdAccounts(["list"]);
        const email = await askQuestion(rl, "Email to remove: ");
        if (!email) break;
        const conf = await askQuestion(rl, `Confirm removal of ${email}? Type YES: `);
        if (conf !== "YES") {
          logWarn("Cancelled");
          break;
        }
        const ok = mgr.removeAccount(email);
        if (ok) logOk(`Removed ${email}`);
        else logErr("Not found");
        break;
      }
      case "7": {
        const all = (await askQuestion(rl, "All accounts? (y/N): ")).toLowerCase();
        const json = (await askQuestion(rl, "JSON output? (y/N): ")).toLowerCase();
        const args: string[] = [];
        if (/^(y|yes)$/.test(all)) args.push("--all");
        if (/^(y|yes)$/.test(json)) args.push("--json");
        await cmdQuota(args);
        break;
      }
      case "8": {
        await cmdConfig(["list"]);
        const k = await askQuestion(rl, "Key to change (or enter to go back): ");
        if (!k) break;
        const v = await askQuestion(rl, `New value for ${k}: `);
        if (!v) break;
        await cmdConfig(["set", k, v]);
        break;
      }
      case "9": {
        const api = await askQuestion(rl, "Filter API (antigravity/gemini-cli/enter for all): ");
        if (api) await cmdModels(["list", "--api", api]);
        else await cmdModels(["list"]);
        const mid = await askQuestion(rl, "Show model info (id) or enter to go back: ");
        if (mid) await cmdModels(["info", mid]);
        break;
      }
      case "10": {
        await cmdStatus([]);
        await cmdDoctor([]);
        break;
      }
      case "11": {
        await cmdVersion([]);
        break;
      }
      case "12": {
        const allAns = (await askQuestion(rl, "Logout ALL accounts? (y/N): ")).toLowerCase();
        await logoutFlow(undefined, /^(y|yes)$/.test(allAns), rl);
        break;
      }
      case "13": {
        await cmdManage([], rl);
        break;
      }
      case "14": {
        const gAns = (
          await askQuestion(rl, "Use global ~/.config/opencode/opencode.json instead of cwd/opencode.json? (y/N): ")
        ).toLowerCase();
        await configureModelsFlow({ global: /^(y|yes)$/.test(gAns) });
        break;
      }
      case "0":
      case "q":
      case "quit":
      case "exit": {
        exit = true;
        break;
      }
      default:
        logWarn("Invalid option");
        break;
    }
    if (!exit) {
      await askQuestion(rl, C.dim("\n[press enter to continue]"));
    }
  }
  rl.close();
  console.log(C.green("\nGoodbye!"));
}

// ===========================================================================
// 07. HELP & MAIN ROUTER
// ===========================================================================
function printHelp(): void {
  console.log(
    C.bold(`
devthink provider CLI (unified merge) - production-ready
Writes to ~/.config/opencode/ (600) atomically | honors OPENCODE_CONFIG_DIR
Bypass: client_id 681255809395-oo8f…b135j / UA GeminiCLI/0.57.0 / gl-node/22.19.0 / Client-Metadata IDE_UNSPECIFIED / project rising-fact-p41fc

Usage:
  cli.ts <command> [subcommand] [flags]

Commands:
  login [--no-browser] [--timeout <ms>] [--email <email>] [--fresh]
      OAuth PKCE Antigravity via oauth.ts (local browser callback on 127.0.0.1).
      Interactive mode selection: 1 = add accounts, 2 = fresh start (wipe all).
      Writes a debugLogger audit line on success.

  logout [<email>] [--all]
      Revoke the Google refresh token (oauth2.googleapis.com/revoke) and remove
      the account. Without an email: single-account auto pick or interactive
      chooser. --all removes every account after confirmation.

  accounts list [--json]
  accounts add --email <email> --refresh-token <token> [--project <id>]
  accounts remove <email>
  accounts enable <email>
  accounts disable <email> [--reason <text>]
  accounts set-active <email> [--sticky]
  accounts import [--path <file>]
      Rich listing: store version, activeIndexByFamily, addedAt/created/expiry,
      remaining/limit, rateLimits, soft-quota cooldowns.

  enable <email>
  disable <email>
      Top-level single-account toggles.

  manage
      Interactive per-account enable/disable toggle (robin-hood v3 store).

  quota [email] [--all] [--json] [--email <email>]
      Checks quotas via quota.ts (daily-cloudcode-pa + prod) with config
      thresholds; persists remaining/limit back into the accounts file.

  config list [--json]
  config get <key>
  config set <key> <value>
  config reset
      Tunables: soft_quota_threshold_percent (0-100), quota_refresh_interval_minutes
      (1-1440), toast_scope, cli_first, quota_fallback, etc. Model catalog
      ALL_MODELS_2026 from constants.ts.

  models list [--api antigravity|gemini-cli] [--json]
  models info <model-id>

  configure [--global] [--path <file>]
      Writes model definitions into opencode.json: provider.google.models
      (2026-08-25 catalog with thinkingLevel variants incl claude-sonnet
      low/high and claude-opus budgets), provider.antigravity.models (rich
      bypass metadata) and top-level model shortcuts. Atomic chmod 600 write.

  status
      Accounts summary + config + permissions + quick quota

  doctor | diagnostics
      File/permission/token-expiry diagnostics, logs dir, default model,
      opencode.json location, raw accounts file head (first 1000 chars)

  version [--json]
      Plugin + remote antigravity manifest versions

  menu | interactive
  help | --help | -h

Env:
  OPENCODE_CONFIG_DIR     Override ~/.config/opencode
  ANTIGRAVITY_DEBUG       Debug logging (1/true/debug)
  ANTIGRAVITY_CLI_AUTORUN Set to 0 to disable auto-run when executed directly
  NO_COLOR                Disable ANSI colors

No args => interactive menu (readline/promises), zero deps.

Examples:
  npx tsx cli.ts login --no-browser
  npx tsx cli.ts logout --all
  npx tsx cli.ts accounts list
  npx tsx cli.ts enable user@example.com
  npx tsx cli.ts quota --all
  npx tsx cli.ts config set soft_quota_threshold_percent 85
  npx tsx cli.ts configure --global
  npx tsx cli.ts models list --api antigravity
  npx tsx cli.ts status
`),
  );
}

/**
 * Family entry of the grand merge: the single devthink binary routes the
 * extension command family here (`devthink ext <command>`); the argv is
 * spliced into the process position the original entry reading expects,
 * the family main runs untouched and the caller argv is restored.
 *
 * @param argv the family arguments (without the family prefix).
 */
export async function runproviderfamily(argv: string[]): Promise<void> {
  const saved = process.argv.slice();
  process.argv = [saved[0], saved[1], ...argv];
  try {
    await providerconsolemain();
  } finally {
    process.argv = saved;
  }
}

async function providerconsolemain(): Promise<void> {
  const argv = process.argv.slice(2);
  const cmd = (argv[0] ?? "").toLowerCase();

  /** Read the value of a "--name value" / "--name=value" style flag. */
  const getFlagValue = (name: string): string | undefined => {
    const idx = argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
    if (idx === -1) return undefined;
    const a = argv[idx];
    if (a && a.includes("=")) return a.split("=").slice(1).join("=").trim();
    return argv[idx + 1]?.trim();
  };

  // If no command, interactive
  if (!cmd || cmd === "menu" || cmd === "interactive" || cmd === "i") {
    if (argv.includes("--help") || argv.includes("-h")) {
      printHelp();
      return;
    }
    // check if TTY; if not TTY and no args, show help
    if (!process.stdout.isTTY && !argv.length) {
      printHelp();
      return;
    }
    if (!argv.length) {
      await interactiveMenu();
      return;
    }
  }

  switch (cmd) {
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;
    case "login":
    case "auth":
    case "signin":
      await cmdLogin(argv.slice(1));
      break;
    case "logout":
    case "signout": {
      const restArgs = argv.slice(1);
      const emailArg = restArgs.find((a) => !a.startsWith("-") && a.includes("@"));
      const allFlag = restArgs.some((a) => a === "--all" || a === "-a");
      await logoutFlow(emailArg, allFlag);
      break;
    }
    case "accounts":
    case "account":
    case "acc":
      await cmdAccounts(argv.slice(1));
      break;
    case "enable": {
      const email = argv.slice(1).find((a) => !a.startsWith("-") && a.includes("@")) ?? getFlagValue("email");
      if (!email) {
        logErr("enable requires an email: enable <email> [--email <email>]");
        process.exitCode = 2;
        break;
      }
      await enableAccountFlow(email);
      break;
    }
    case "disable": {
      const email = argv.slice(1).find((a) => !a.startsWith("-") && a.includes("@")) ?? getFlagValue("email");
      if (!email) {
        logErr("disable requires an email: disable <email> [--email <email>]");
        process.exitCode = 2;
        break;
      }
      await disableAccountFlow(email);
      break;
    }
    case "manage":
    case "accounts-manage":
      await cmdManage(argv.slice(1));
      break;
    case "quota":
    case "quotas":
    case "q":
      await cmdQuota(argv.slice(1));
      break;
    case "config":
    case "cfg":
    case "settings":
      await cmdConfig(argv.slice(1));
      break;
    case "configure":
    case "configure-models":
    case "config-models":
    case "setup": {
      const globalFlag = argv.includes("--global") || argv.includes("-g");
      const customPath = getFlagValue("path") ?? getFlagValue("file") ?? argv.slice(1).find((a) => a.endsWith(".json"));
      await configureModelsFlow({ global: globalFlag, customPath });
      break;
    }
    case "models":
    case "model":
    case "m":
      await cmdModels(argv.slice(1));
      break;
    case "status":
    case "st":
      await cmdStatus(argv.slice(1));
      break;
    case "doctor":
    case "doc":
    case "check":
    case "diagnostics":
      await cmdDoctor(argv.slice(1));
      break;
    case "version":
    case "ver":
    case "v":
      await cmdVersion(argv.slice(1));
      break;
    default:
      logErr(`Unknown command: ${cmd}`);
      printHelp();
      process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Entry point (direct execution only - library-first when imported).
// Replaces the old import.meta.url comparison (which never matched on Windows
// and breaks plain tsc runs): match the invoked script basename instead.
// Set ANTIGRAVITY_CLI_AUTORUN=0 to disable the auto-run entirely.
// ---------------------------------------------------------------------------
const AUTORUN_DISABLED = (() => {
  const v = String(process.env.ANTIGRAVITY_CLI_AUTORUN ?? "").toLowerCase();
  return v === "0" || v === "false" || v === "off";
})();
const invokedAsMain = (() => {
  if (AUTORUN_DISABLED) return false;
  try {
    const entry = process.argv[1];
    if (!entry) return false;
    const base = path.basename(entry).toLowerCase();
    return base === "cli.ts" || base === "cli.js";
  } catch {
    return false;
  }
})();

if (invokedAsMain) {
  main().catch((e) => {
    logErr(`Fatal: ${(e as Error).message}`);
    console.error(C.dim((e as Error).stack ?? ""));
    process.exit(1);
  });
}

// ---------------------------------------------------------------------------
// Public API (~30 exports incl runCLI + default { runCLI, interactiveMenu })
// ---------------------------------------------------------------------------
export {
  providerconsolemain as runCLI,
  cmdLogin,
  cmdAccounts,
  cmdQuota,
  cmdConfig,
  cmdModels,
  cmdStatus,
  cmdDoctor,
  cmdVersion,
  cmdManage,
  logoutFlow,
  enableAccountFlow,
  disableAccountFlow,
  configureModelsFlow,
  interactiveMenu,
  printHelp,
  resolveBaseDir,
  resolveAccountsPath,
  resolveConfigPath,
  resolveAntigravityJsonPath,
  resolveOpenCodeJsonCandidates,
  locateOpenCodeJson,
  atomicWriteFileSecure,
  atomicWriteFileAtomic,
  getAccountManager,
  fetchQuotaForAccount,
  buildOpenCodeModelDefinitions,
  MODELS_2026_CATALOG,
  confirm,
  redactEmail,
  fmtDuration,
  printHeader,
  CLI_VERSION,
  ANSI,
  C,
};

export type { ModelCatalogEntry, OpenCodeJsonLocation };

export const providercli = {
  runCLI: providerconsolemain,
  interactiveMenu,
};

/* ── Merged: the grand merge section ── the correlated provider family library barrel logics of the merged repository interned here, one surface without duplicate variations ── */
/**
 * @file server.ts — the barrel section of the provider family.
 * @description The library barrel of the merged provider family —
 * library-first, root-first. The provider family modules of the merged
 * repository live as the flat root modules (constants, config, models,
 * accounts, fingerprint, project, quota, recovery, search, core, request,
 * streaming, oauth, antigravity, devthink, server) and every import path
 * of the provider surface resolves through this barrel.
 *
 * The namespace re-exports keep the historical surface: several siblings
 * (constants/config/oauth/accounts/fingerprint/search) intentionally share
 * exported names such as PROJECT_FALLBACK, MODELS_2026 or OAUTH_SCOPES —
 * every feature stays reachable through its module namespace below. The
 * consolidation history rides the mapping: the provider oauth family lives
 * in oauth.ts, request-helpers merged into request.ts, system merged into
 * config.ts (with the debug utilities in debug.ts) — the OAuth,
 * RequestHelpers and System namespaces below alias the consolidated modules
 * so every historical import path keeps resolving.
 */

export * as Constants from "./constants.js";
export * as Fingerprint from "./fingerprint.js";
// the provider oauth family answers the OAuth namespace (the grand merge
// consolidation interned the family in oauth.ts — node surface).
export * as OAuth from "./oauth.js";
export * as Accounts from "./accounts.js";
// the provider oauth family answers the AntigravityCli compat namespace.
export * as AntigravityCli from "./oauth.js";

// merged group additions: auth/core/system/models namespaces
export * as Auth from "./oauth.js";
export * as Core from "./core.js";
/** System — the v2.1.14 system utilities surface: config.ts absorbed the
 * system module (cfgDir, the version fallback chain, atomic writes, the
 * legacy validator aliases and the raw JSON IO helpers) while the debug
 * utilities (logsDir, redactSecrets, the debugLogger singleton) live in
 * debug.ts, so the namespace carries exactly the exports the system
 * shim used to publish. */
import {
  atomicWrite,
  cfgDir,
  fetchVersionChain,
  loadConfigRaw,
  saveConfigRaw,
  validateEmail,
  validateModelId,
  validateModelIdCharset,
  validateProjectId,
  validateSemver,
  VERSION_FALLBACK,
} from "./config.js";
import { debugLogger, logsDir, redactSecrets } from "./core.js";
export const System = {
  atomicWrite,
  cfgDir,
  fetchVersionChain,
  loadConfigRaw,
  saveConfigRaw,
  validateEmail,
  validateModelId,
  validateModelIdCharset,
  validateProjectId,
  validateSemver,
  VERSION_FALLBACK,
  debugLogger,
  logsDir,
  redactSecrets,
};
export * as Models from "./models.js";
export * as Models2026 from "./models.js";

export * as Project from "./project.js";
export * as Quota from "./quota.js";
export * as Config from "./config.js";
export * as Debug from "./core.js";
export * as Version from "./versionregistry.js";
// v2.1.14: request-helpers.ts was consolidated into request.ts; namespace kept for compat.
export * as RequestHelpers from "./request.js";
export * as Request from "./request.js";
export * as Streaming from "./streaming.js";
export * as Recovery from "./recovery.js";
export * as Search from "./search.js";
export * as CLI from "./server.js";
export * as PluginModule from "./antigravity.js";

// default plugin export for opencode compatibility (the antigravity plugin family)
export { default as opencodePluginModule, getPlugin, plugin } from "./antigravity.js";

// v2.1.16 single-owner doctrine: VERSION derives from constants.js
// PLUGIN_VERSION (raw value owner) and the two bypass aggregates assemble
// every value from its owner module instead of locally-reassembled literals.
import { GEMINI_CLI_OAUTH_CLIENT_ID, GEMINI_CLI_OAUTH_CLIENT_SECRET, PLUGIN_VERSION } from "./constants.js";
import {
  ANTIGRAVITY_CLI_GRPC_VERSION,
  ANTIGRAVITY_CLI_OAUTH_SCOPES,
  ANTIGRAVITY_CLI_REDIRECT_OFFICIAL,
  ANTIGRAVITY_CLI_VERSION_LATEST,
  CLIENT_ID as ANTIGRAVITY_CLI_CLIENT_ID,
  CLIENT_SECRET as ANTIGRAVITY_CLI_CLIENT_SECRET,
} from "./oauth.js";
/* the identity snapshot import rides the account console cli section above — one declaration per binding */

// version / identity
export const VERSION: string = PLUGIN_VERSION;
export const PLUGIN_ID = "devthink" as const;

// headline model catalog re-exports
export { ALL_MODELS_2026, MODEL_BY_ID, MODEL_ROUTING } from "./models.js";

/**
 * Gemini CLI bypass aggregate: exact identification the official Gemini CLI
 * sends when talking to cloudcode-pa. Consumed by bypass flows that must not
 * require a user project id. Every value is imported from its owner — the
 * OAuth pair, UA, Client-Metadata string, project fallback and base URL from
 * constants.js, the gl-node snapshot from fingerprint.js and the v1internal
 * method paths via constants.js CODE_ASSIST_PATH_MAP.
 */
export const GEMINI_CLI_BYPASS = {
  clientId: GEMINI_CLI_OAUTH_CLIENT_ID,
  clientSecret: GEMINI_CLI_OAUTH_CLIENT_SECRET,
  userAgent: GEMINI_CLI_USER_AGENT,
  xGoogApiClient: X_GOOG_API_CLIENT_GEMINI_CLI,
  clientMetadata: CLIENT_METADATA_STRING,
  fallbackProject: PROJECT_FALLBACK,
  endpoints: {
    loadCodeAssist: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST}`,
    generateContent: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.GENERATE_CONTENT}`,
    streamGenerateContent: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT}`,
  },
  /** Isolated credential dir — resolved per-OS at runtime, never hardcoded. */
  isolatedDir: "MAENE_ISOLATED_DIR | <opencode-base>/auth",
} as const;

/**
 * Antigravity CLI bypass aggregate: identification of the official `agy`
 * binary (extracted from the distributed CLI and live-validated 2026-08-26).
 * The client the plugin presents for NEW logins since 2.1.8: the client pair,
 * scopes, official redirect URI and version parts come from oauth.js
 * (the authentication owner — CLIENT_ID/CLIENT_SECRET are env-overridable
 * there, so the aggregate tracks the same override); the UA and
 * X-Goog-Api-Client keep their static linux/amd64 snapshot shape, composed
 * from the oauth.js version constants.
 */
export const ANTIGRAVITY_CLI_BYPASS = {
  clientId: ANTIGRAVITY_CLI_CLIENT_ID,
  clientSecret: ANTIGRAVITY_CLI_CLIENT_SECRET,
  userAgent: `antigravity-cli/${ANTIGRAVITY_CLI_VERSION_LATEST} (linux; amd64)`,
  xGoogApiClient: `antigravity-cli/${ANTIGRAVITY_CLI_VERSION_LATEST} grpc-go/${ANTIGRAVITY_CLI_GRPC_VERSION}`,
  redirectUriOfficial: ANTIGRAVITY_CLI_REDIRECT_OFFICIAL,
  scopes: ANTIGRAVITY_CLI_OAUTH_SCOPES,
  usesPKCE: true,
  appLabel: "Google Antigravity",
} as const;

/* ── Merged: the grand merge section ── the correlated opencode server plugin entry logics of the merged repository interned here, one surface without duplicate variations ── */
/**
 * @file server.ts — the opencode `./server` package entry (v2.1.20).
 *
 * opencode >= 1.18 resolves package.json exports["./server"] FIRST when
 * loading a server plugin. This entry uses the multi-export plugin shape so
 * a SINGLE plugin reference registers THREE auth entries in
 * `opencode auth login` (and in the TUI "Connect a provider" dialog):
 *
 *   - provider "google"      → the standard Google entry, OAuth method
 *   - provider "antigravity" → the standard Antigravity entry, OAuth method
 *   - the CUSTOM provider detected by MODEL IDS in opencode.json
 *     ("casasbahia", "my-google", ... — whatever the user named it)
 *
 * opencode's loader treats every exported FUNCTION as a plugin instance and
 * merges the returned hooks, which is exactly what we need: one instance
 * returns the main hooks (identification headers, config injection, the
 * custom-provider auth) and two more instances return the standard google /
 * antigravity auth hooks.
 *
 * IMPORTANT CONTRACT: every export in this file MUST be a function —
 * opencode's legacy loader throws "Plugin export is not a function" for any
 * other export shape. Never re-export constants, objects or types from here;
 * library consumers keep importing from the package root (plugin.ts).
 */

import { opencodeServer, buildOpencodeAuthHook } from "./antigravity.js";

/**
 * The main provider plugin instance: chat.headers identification spoof,
 * zero-config antigravity provider injection and the auth entry for the
 * custom provider detected by model ids (when one exists).
 */
export async function providerServer(input?: unknown, options?: Record<string, unknown>): Promise<Record<string, any>> {
  return opencodeServer(input, options as any);
}

/**
 * Standard auth entry for the provider id "google":
 * `opencode auth login` → Google → OAuth (the provider family behind the scenes).
 */
export const googleAuth = async (): Promise<Record<string, any>> => ({
  auth: buildOpencodeAuthHook("google"),
});

/**
 * Standard auth entry for the provider id "antigravity":
 * `opencode auth login` → Antigravity → OAuth (the provider family behind the scenes).
 */
export const antigravityAuth = async (): Promise<Record<string, any>> => ({
  auth: buildOpencodeAuthHook("antigravity"),
});
