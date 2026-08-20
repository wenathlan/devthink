import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { randomInt } from "node:crypto";
import { isAllowedOrigin } from "./compatibility.ts";
import { listModels, listProviders, streamChat, type ChatMessage } from "./providers.ts";
import { ensurePaths, resolvePaths, saveConfig, type DevThinkConfig, type DevThinkPaths } from "./config.ts";
import { consumePairing, getIdentity, pairingStatus, revokeBrowserSessions, setIdentityUserId, verifyBrowserSession } from "./identity.ts";
import { appendMessage, createSession, createTab, listSessions, loadSession, loadWorkspace, updateTab, type SessionSection } from "./session.ts";
import { readPreferences, savePreference } from "./storage.ts";

export type ServerOptions = {
  port?: number;
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
    if (!message.content || !["system", "user", "assistant"].includes(String(message.role))) throw new Error("Each message needs a supported role and content.");
    return { role: message.role as ChatMessage["role"], content: String(message.content) };
  });
}

function sectionFrom(value: unknown): SessionSection {
  return ["chat", "inspector", "settings", "memory", "providers", "projects", "routes", "usage"].includes(String(value)) ? value as SessionSection : "chat";
}

function routeParts(pathname: string): string[] {
  return pathname.split("/").filter(Boolean).map(decodeURIComponent);
}

async function streamChatRoute(request: IncomingMessage, response: ServerResponse, config: DevThinkConfig, paths: DevThinkPaths, origin?: string): Promise<void> {
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
  if (!session) session = createSession(paths, { mode: typeof body.mode === "string" ? body.mode : "chat", model, provider, workspaceId, tabId, sectionId, title: typeof body.title === "string" ? body.title : undefined });
  if (workspaceId && session.workspaceId !== workspaceId) return writeJson(response, 409, { error: "workspaceId does not match the session." }, origin);
  if (tabId && !session.tabs.some((tab) => tab.id === tabId)) return writeJson(response, 404, { error: "Tab not found." }, origin);
  session = appendMessage(paths, session, prompt, { tabId: tabId || session.activeTabId, sectionId });
  const history = session.messages.map(({ role, content }) => ({ role, content }));
  const events = await streamChat({ provider, model, messages: history, temperature: typeof body.temperature === "number" ? body.temperature : config.temperature, maxTokens: typeof body.maxTokens === "number" ? body.maxTokens : config.maxTokens }, config, paths);
  if (origin) response.setHeader("access-control-allow-origin", origin);
  response.setHeader("vary", "Origin");
  response.writeHead(200, { "cache-control": "no-cache", connection: "keep-alive", "content-type": "text/event-stream; charset=utf-8" });
  writeEvent(response, "identity", { workspaceId: session.workspaceId, sessionId: session.id, tabId: tabId || session.activeTabId, sectionId });
  let text = "";
  for await (const event of events) {
    if (event.type === "text") text += event.text;
    writeEvent(response, event.type, event);
  }
  const persisted = appendMessage(paths, session, { role: "assistant", content: text }, { tabId: tabId || session.activeTabId, sectionId });
  writeEvent(response, "persisted", { workspaceId: persisted.workspaceId, sessionId: persisted.id, tabId: tabId || persisted.activeTabId, messageId: persisted.messages.at(-1)?.id });
  response.end();
}

async function route(request: IncomingMessage, response: ServerResponse, config: DevThinkConfig, paths: DevThinkPaths): Promise<void> {
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
  if (request.headers.origin && !origin) return writeJson(response, 403, { error: "Origin is not allowed by web.allowedOrigins." });
  const mutationWithBody = ["POST", "PATCH", "PUT"].includes(request.method || "") && url.pathname !== "/pairings/revoke";
  if (mutationWithBody && !acceptsJson(request)) return writeJson(response, 415, { error: "JSON content-type is required for mutation requests." }, origin);
  if (request.method === "GET" && url.pathname === "/health") return writeJson(response, 200, { status: "ok", service: "devthink" }, origin);
  if (request.method === "GET" && url.pathname === "/providers") return writeJson(response, 200, listProviders().map(({ id, protocol, env }) => ({ id, protocol, env })), origin);
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
    return paired ? writeJson(response, 201, { token: paired.token, userId: paired.identity.userId, expiresAt: paired.expiresAt }, origin) : writeJson(response, 401, { error: "Pairing code is invalid, expired, or already used." }, origin);
  }
  const browserSession = origin ? verifyBrowserSession(paths, bearerToken(request)) : undefined;
  if (origin && !browserSession) return writeJson(response, 401, { error: "A current browser pairing token is required." }, origin);
  if (request.method === "GET" && url.pathname === "/identity") return writeJson(response, 200, { identity: getIdentity(paths), pairing: pairingStatus(paths) }, origin);
  if (request.method === "PUT" && url.pathname === "/identity") {
    const body = await readBody(request);
    if (typeof body.userId !== "string") return writeJson(response, 400, { error: "userId is required." }, origin);
    try { return writeJson(response, 200, { identity: setIdentityUserId(paths, body.userId), pairing: pairingStatus(paths) }, origin); }
    catch (error) { return writeJson(response, 400, { error: error instanceof Error ? error.message : "Identity update was rejected." }, origin); }
  }
  if (request.method === "POST" && url.pathname === "/pairings/revoke") return writeJson(response, 200, { revoked: revokeBrowserSessions(paths) }, origin);
  if (request.method === "GET" && url.pathname === "/sessions") return writeJson(response, 200, { sessions: listSessions(paths) }, origin);
  if (request.method === "GET" && url.pathname === "/workspaces") {
    const workspaces = new Map<string, { id: string; title: string; updatedAt: string; sessionCount: number }>();
    for (const session of listSessions(paths)) {
      const current = workspaces.get(session.workspaceId);
      workspaces.set(session.workspaceId, { id: session.workspaceId, title: current?.title || session.title.replace(/^Untitled session$/, "Untitled workspace"), updatedAt: current?.updatedAt && current.updatedAt > session.updatedAt ? current.updatedAt : session.updatedAt, sessionCount: (current?.sessionCount || 0) + 1 });
    }
    return writeJson(response, 200, { workspaces: [...workspaces.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)) }, origin);
  }
  if (request.method === "GET" && url.pathname === "/usage") {
    const sessions = listSessions(paths);
    const tabCount = sessions.reduce((total, session) => total + session.tabs.length, 0);
    const messageCount = sessions.reduce((total, session) => total + session.messages.length, 0);
    return writeJson(response, 200, { workspaces: new Set(sessions.map((session) => session.workspaceId)).size, sessions: sessions.length, tabs: tabCount, messages: messageCount, providers: listProviders().length, paired: pairingStatus(paths).activeSessions > 0 }, origin);
  }
  if (request.method === "GET" && url.pathname === "/preferences") {
    return writeJson(response, 200, { preferences: Object.fromEntries(Object.entries(readPreferences(paths)).map(([key, preference]) => [key, preference.value])) }, origin);
  }
  if (request.method === "GET" && url.pathname === "/settings") {
    const identity = getIdentity(paths);
    const sessions = listSessions(paths);
    return writeJson(response, 200, {
      identity,
      pairing: pairingStatus(paths),
      preferences: Object.fromEntries(Object.entries(readPreferences(paths)).map(([key, preference]) => [key, preference.value])),
      provider: { activeProvider: config.activeProvider || config.provider || undefined, activeModel: config.activeModel || config.model || undefined },
      database: { ownerUserId: identity.userId, local: true, persistence: "cli-owned-sqlite", workspaces: new Set(sessions.map((session) => session.workspaceId)).size, sessions: sessions.length },
    }, origin);
  }
  if (request.method === "PATCH" && url.pathname === "/preferences") {
    const body = await readBody(request);
    const key = typeof body.key === "string" ? body.key : "";
    const value = typeof body.value === "string" ? body.value : "";
    if (!browserPreferenceKeys.has(key) || !value || value.length > 32) return writeJson(response, 400, { error: "Preference is not supported." }, origin);
    return writeJson(response, 200, { preference: savePreference(paths, key, value) }, origin);
  }
  if (request.method === "PATCH" && url.pathname === "/providers/active") {
    const body = await readBody(request);
    const provider = typeof body.provider === "string" ? body.provider : "";
    const model = typeof body.model === "string" ? body.model : undefined;
    if (!listProviders().some((item) => item.id === provider)) return writeJson(response, 400, { error: "provider is not registered." }, origin);
    const next = { ...config, activeProvider: provider, ...(model ? { activeModel: model } : {}) };
    saveConfig(next, paths);
    Object.assign(config, next);
    return writeJson(response, 200, { activeProvider: next.activeProvider, activeModel: next.activeModel }, origin);
  }
  if (request.method === "GET" && parts[0] === "workspaces" && parts[1] && parts.length === 2) {
    const workspace = loadWorkspace(paths, parts[1]);
    if (!workspace) return writeJson(response, 404, { error: "Workspace not found." }, origin);
    return writeJson(response, 200, { workspace, sessions: listSessions(paths).filter((session) => session.workspaceId === workspace.id) }, origin);
  }
  if (request.method === "POST" && parts[0] === "sessions" && parts.length === 1) {
    const body = await readBody(request);
    const session = createSession(paths, { mode: typeof body.mode === "string" ? body.mode : "chat", model: typeof body.model === "string" ? body.model : config.activeModel, provider: typeof body.provider === "string" ? body.provider : config.activeProvider, workspaceId: typeof body.workspaceId === "string" ? body.workspaceId : undefined, tabId: typeof body.tabId === "string" ? body.tabId : undefined, sectionId: sectionFrom(body.sectionId), title: typeof body.title === "string" ? body.title : undefined });
    return writeJson(response, 201, session, origin);
  }
  if (parts[0] === "sessions" && parts[1] && parts.length === 2 && request.method === "GET") {
    const session = loadSession(paths, parts[1]);
    return session ? writeJson(response, 200, session, origin) : writeJson(response, 404, { error: "Session not found." }, origin);
  }
  if (parts[0] === "sessions" && parts[1] && parts[2] === "tabs" && parts.length === 3 && request.method === "POST") {
    const session = loadSession(paths, parts[1]);
    if (!session) return writeJson(response, 404, { error: "Session not found." }, origin);
    const body = await readBody(request);
    return writeJson(response, 201, createTab(paths, session, { id: typeof body.id === "string" ? body.id : undefined, label: typeof body.label === "string" ? body.label : undefined, provider: typeof body.provider === "string" ? body.provider : undefined, sectionId: sectionFrom(body.sectionId) }), origin);
  }
  if (parts[0] === "sessions" && parts[1] && parts[2] === "tabs" && parts[3] && parts.length === 4 && request.method === "PATCH") {
    const session = loadSession(paths, parts[1]);
    if (!session) return writeJson(response, 404, { error: "Session not found." }, origin);
    const body = await readBody(request);
    return writeJson(response, 200, updateTab(paths, session, parts[3], { label: typeof body.label === "string" ? body.label : undefined, provider: typeof body.provider === "string" ? body.provider : undefined, sectionId: body.sectionId === undefined ? undefined : sectionFrom(body.sectionId) }), origin);
  }
  if (request.method === "POST" && url.pathname === "/chat") return streamChatRoute(request, response, config, paths, origin);
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
    route(request, response, options.config, paths).catch((error: unknown) => writeJson(response, 500, { error: error instanceof Error ? error.message : "Request failed." }, safeOrigin(request, options.config)));
  });
  server.setMaxListeners(0);
  let port = options.port ?? 0;
  let lastError: unknown;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      port = await bind(server, port);
      const address = `http://127.0.0.1:${port}`;
      return { address, port, stop: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) };
    } catch (error) {
      lastError = error;
      port = randomPort();
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Could not bind the local server.");
}
