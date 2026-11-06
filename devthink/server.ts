/**
 * The server module of the merged repository: the workbench loopback server beside the embedded
 * gateway server of the merged lineages — the http transport and the sse/ndjson stream pipeline,
 * the request auth and the key resolution, the gateway console cli and the library barrel the
 * server surface re-exports — interned in this one file, one surface without duplicate variations.
 */

import { randomInt } from "node:crypto";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { isAllowedOrigin } from "./gateway.js";
import { type DevThinkConfig, type DevThinkPaths, ensurePaths, resolvePaths, saveConfig } from "./config.js";
import {
  AccountError,
  accountsessiontokenvalid,
  consumePairing,
  createaccount,
  exchangeoauthcode,
  GateError,
  getIdentity,
  issueaccountsession,
  type OAuthProvider,
  OAUTH_PROVIDERS,
  pairingStatus,
  prepareaccounts,
  revokeBrowserSessions,
  revokeaccountsession,
  setIdentityUserId,
  verifyBrowserSession,
  verifyaccount,
  verifyaccountsession,
} from "./account.js";
import { type ChatMessage, listModels, listProviders, streamChat } from "@wenathlan/getry/providers";
import {
  appendMessage,
  createSession,
  createTab,
  listSessions,
  loadSession,
  loadWorkspace,
  readPreferences,
  savePreference,
  type SessionSection,
  updateTab,
} from "./storage.js";

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

/**
 * the ownership move (wave/ownership.gateway step 3): the sse/ndjson stream
 * pipeline family — the keepalive constants, the sse/ndjson header builders,
 * the event writers, the heartbeat discard, the frame parser, the chunk
 * builders, the stream tracking state, makestreamresponse and trackwrite —
 * moved verbatim to the getry owner (getry/server.ts, the
 * "@wenathlan/getry/server" face: one owner, the family consumes). devthink
 * re-exports the public symbols here so every compat consumer (the http
 * transport test lane, the engine seams, the published ./server entry)
 * keeps resolving without an edit; the private createtracker /
 * framedatapayload / trackframe helpers moved with makestreamresponse and
 * stay private in the owner, and the gateway config loader family moved
 * with them (see the config.ts shim of the same wave).
 */
export { kams, kasuppressms, sseheaders, ndjsonheaders, writeevent, writekeepalive, writedone, safeenqueue, safeclose, maskmodel, discardheartbeat, parsesseframes, extractdata, isdone, makechunk, makefinalchunk, makestreamresponse, trackwrite } from "@wenathlan/getry/server";
export type { trackedstream, streamoptions } from "@wenathlan/getry/server";

// ---------------------------------------------------------------------------
// http server — hono bootstrap registers routes per version
// ---------------------------------------------------------------------------

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { serve } from "@hono/node-server";
import { type Context, type Hono } from "hono";
import {
  createserver as getrycreateserver,
  getversion as getrygetversion,
  listversions as getrylistversions,
  loadconfig,
  reloadconfig as getryreloadconfig,
} from "@wenathlan/getry/server";
import { copyseed } from "./uistore.ts";
import {
  DEFAULTQUOTAMB,
  ensureplanstore,
  StorageError,
  deleteobject,
  getobject,
  getonboardingstate,
  getplan,
  keyvalid,
  listcopyrows,
  listobjects,
  planquota,
  planquotamb,
  putobject,
  QUOTACEILMB,
  setonboardingstage,
  setplan,
  upsertcopyrows,
  usagefor,
} from "./storage.ts";
import {
  createsandboxsession,
  hostmodalityreport,
  listsandboxtree,
  runsandboxline,
  writesandboxfile,
} from "./sandboxlane.js";
import { uistoreget, uistoreingest, uistorelist } from "./uistore.ts";
/* the oslabels import the provider console barrel used to carry for this
   file's os lane (the paired database endpoint of the label file): the
   barrel moved to the getry owner with the provider console, so the os
   lane reads its label source through its own declaration now. */
import { osStringRows } from "./os.js";

/** createoslanes — register the nine os lanes of the workbench surface on
 * the hono app the gateway transport built (the os owns the lanes, the
 * transport owns the wire — the composed createserver below answers one
 * surface: onboarding, copy, the ui store, the os labels, the plan, the
 * sandbox, the storage, the accounts and the oauth exchange) */
async function createoslanes(app: Hono): Promise<void> {
  // onboarding endpoint — the catalogued visitor state of the entry flow:
  // GET answers the seen flags of one visitor, POST raises one stage. The
  // Prisma accessors in database.ts own the table (parameterized statements,
  // never concatenated SQL); a database failure degrades to the defaults.
  app.get("/api/v1/onboarding", async (c) => {
    const visitor = String(c.req.query("visitor") || "");
    if (!/^[a-z0-9]{6,64}$/i.test(visitor)) return c.json({ error: "invalid visitor" }, 400);
    const state = await getonboardingstate(visitor);
    return c.json(state ?? { introseen: false, onboardingseen: false });
  });
  app.post("/api/v1/onboarding", async (c) => {
    const body = (await c.req.json().catch(() => null)) as { visitor?: unknown; stage?: unknown } | null;
    const visitor = typeof body?.visitor === "string" ? body.visitor : "";
    const stage = body?.stage;
    if (!/^[a-z0-9]{6,64}$/i.test(visitor)) return c.json({ error: "invalid visitor" }, 400);
    if (stage !== "intro" && stage !== "onboarding") return c.json({ error: "invalid stage" }, 400);
    const state = await setonboardingstage(visitor, stage);
    if (!state) return c.json({ error: "onboarding state unavailable" }, 503);
    return c.json(state);
  });

  // copy endpoint — the stubs law: the components load every user-visible
  // string by id from this table; the build seed ingests the rows at boot
  // (the tables first, then the ingestion), a failure degrades to the
  // seed the bundle already carries
  const seedcopyrows = Object.entries(copyseed()).map(([key, text]) => ({ key, text }));
  await upsertcopyrows(seedcopyrows);
  // the account lane boots with the store: the data home exists, the
  // account schema lays down before the first route touches it, and the
  // plan store boots with its table the same way (an unpushed local
  // database answered every plan stamp with the unavailable refusal, so
  // the quota never composed by plan — the boot law closes it)
  await prepareaccounts();
  ensureplanstore();
  app.get("/api/v1/copy", async (c) => {
    const rows = await listcopyrows();
    return c.json({ rows });
  });

  // ui store lane — the winget copy of the os: the uicopy table of the
  // app's better-sqlite3 store answers the components over this
  // same-origin lane (the stubs law: no winget hardcodes text — the
  // strings live in the db, the seed of uistore.ts fills the table at
  // boot and the offline build answers from that same seed). One lane
  // lists the rows for the mount loader, one lane answers a single key,
  // and an unknown key refuses honestly instead of inventing a word.
  await uistoreingest();
  app.get("/api/v1/ui/copy", async (c) => {
    const rows = await uistorelist(String(c.req.query("locale") || "en"));
    return c.json({ rows });
  });
  app.get("/api/v1/ui/copy/:key", async (c) => {
    const row = await uistoreget(c.req.param("key"), String(c.req.query("locale") || "en"));
    if (!row) return c.json({ error: "unknown key" }, 404);
    return c.json(row);
  });

  // the paired oslabels endpoint — the database lane the label file
  // promises: the served rows answer the same truth the static seeds
  // carry (the pair the file header documents), so the os surfaces read
  // one catalog from both ends
  app.get("/api/v1/oslabels", (c) => {
    const rows = osStringRows();
    return c.json({ rows });
  });

  // plan endpoint — the visual gate: the tier the visitor selected and the
  // enterprise custom megabytes stamp the badge the identity wears; the
  // engines carry no limits, this row only draws what the plan answers
  app.get("/api/v1/plan", async (c) => {
    const visitor = String(c.req.query("visitor") || "");
    if (!/^[a-z0-9]{6,64}$/i.test(visitor)) return c.json({ error: "invalid visitor" }, 400);
    const row = await getplan(visitor);
    return c.json({
      plan: row
        ? {
            tier: row.tier,
            storagemb: row.storagemb === null ? undefined : Number(row.storagemb),
            rammib: row.rammib === null ? undefined : Number(row.rammib),
            since: row.since.toISOString(),
          }
        : null,
    });
  });
  app.post("/api/v1/plan", async (c) => {
    const body = (await c.req.json().catch(() => null)) as {
      visitor?: unknown;
      plan?: { tier?: unknown; storagemb?: unknown; rammib?: unknown };
    } | null;
    const visitor = typeof body?.visitor === "string" ? body.visitor : "";
    const tier = body?.plan?.tier;
    if (!/^[a-z0-9]{6,64}$/i.test(visitor)) return c.json({ error: "invalid visitor" }, 400);
    if (tier !== "free" && tier !== "pro" && tier !== "enterprise") return c.json({ error: "invalid tier" }, 400);
    const storagemb =
      typeof body?.plan?.storagemb === "number" && body.plan.storagemb > 0
        ? Math.floor(body.plan.storagemb)
        : undefined;
    if (storagemb !== undefined && (storagemb < DEFAULTQUOTAMB || storagemb > QUOTACEILMB)) {
      return c.json({ error: "the custom storage definition rides outside the quota floor and the ceiling" }, 400);
    }
    const rammib =
      typeof body?.plan?.rammib === "number" && body.plan.rammib > 0 ? Math.floor(body.plan.rammib) : undefined;
    const row = await setplan(visitor, tier, tier === "enterprise" ? { storagemb, rammib } : undefined);
    if (!row) return c.json({ error: "plan unavailable" }, 503);
    return c.json({
      plan: {
        tier: row.tier,
        storagemb: row.storagemb === null ? undefined : Number(row.storagemb),
        rammib: row.rammib === null ? undefined : Number(row.rammib),
        since: row.since.toISOString(),
      },
    });
  });

  // sandbox endpoints — the server-side sandbox of the run and storage
  // lane: nothing runs or stores in the visitor browser, every tool lands
  // inside the session jail under .sandboxrun, and the lanes the sandbox
  // does not carry answer honestly through the pending rows
  const sandboxsessionpattern = /^[a-z0-9][a-z0-9-]{3,63}$/i;
  app.post("/api/v1/sandbox/session", async (c) => {
    const body = (await c.req.json().catch(() => null)) as { sessionId?: unknown } | null;
    const sessionid = typeof body?.sessionId === "string" ? body.sessionId : "";
    if (!sandboxsessionpattern.test(sessionid)) return c.json({ error: "invalid session" }, 400);
    const rows = await createsandboxsession(sessionid);
    return c.json({ rows });
  });
  app.post("/api/v1/sandbox/run", async (c) => {
    const body = (await c.req.json().catch(() => null)) as { sessionId?: unknown; line?: unknown } | null;
    const sessionid = typeof body?.sessionId === "string" ? body.sessionId : "";
    if (!sandboxsessionpattern.test(sessionid)) return c.json({ error: "invalid session" }, 400);
    if (typeof body?.line !== "string") return c.json({ error: "invalid line" }, 400);
    if (body.line.length > 2000) return c.json({ error: "line too long" }, 400);
    const answer = await runsandboxline(sessionid, body.line);
    return c.json(answer);
  });
  app.get("/api/v1/sandbox/files", async (c) => {
    const sessionid = String(c.req.query("sessionId") || "");
    if (!sandboxsessionpattern.test(sessionid)) return c.json({ error: "invalid session" }, 400);
    const rows = await listsandboxtree(sessionid);
    return c.json({ rows });
  });
  app.post("/api/v1/sandbox/write", async (c) => {
    const body = (await c.req.json().catch(() => null)) as {
      sessionId?: unknown;
      target?: unknown;
      content?: unknown;
    } | null;
    const sessionid = typeof body?.sessionId === "string" ? body.sessionId : "";
    const target = typeof body?.target === "string" ? body.target : "";
    const content = typeof body?.content === "string" ? body.content : "";
    if (!sandboxsessionpattern.test(sessionid)) return c.json({ error: "invalid session" }, 400);
    const targetsafe =
      target.length > 0 &&
      !target.startsWith("/") &&
      !target.startsWith("\\") &&
      !target.split(/[\\/]/).includes("..");
    if (!targetsafe) return c.json({ error: "invalid target" }, 400);
    if (content.length > 5_000_000) return c.json({ error: "content too large" }, 400);
    await writesandboxfile(sessionid, target, content);
    return c.json({ ok: true });
  });
  app.get("/api/v1/sandbox/modalities", async (c) => {
    const rows = await hostmodalityreport();
    return c.json({ rows });
  });

  // the storage lane: the vault-shaped record surface the platform stores
  // everything through. The quota composes from the plan row through
  // planquotamb (the tier table, the enterprise custom definition under the
  // terabyte ceiling, the 900 floor when no plan answers), the database file
  // lives in the data home outside every served root, and this module is the
  // only swap point when the vault service deploys with its own host.
  const storagequotafor = async (owner: string): Promise<number> => {
    return planquotamb(await getplan(owner));
  };
  app.get("/api/v1/storage/quota", async (c) => {
    const owner = c.req.query("owner") ?? "";
    if (!/^[a-z0-9][a-z0-9-]{5,63}$/i.test(owner)) return c.json({ error: "invalid owner" }, 400);
    const answer = planquota(await getplan(owner));
    return c.json({ quotamb: answer.quotamb, tier: answer.tier, source: answer.source });
  });
  app.post("/api/v1/storage/objects", async (c) => {
    const body = (await c.req.json().catch(() => null)) as {
      owner?: unknown;
      key?: unknown;
      content?: unknown;
    } | null;
    const owner = typeof body?.owner === "string" ? body.owner : "";
    const key = typeof body?.key === "string" ? body.key : "";
    const content = typeof body?.content === "string" ? body.content : "";
    if (!/^[a-z0-9][a-z0-9-]{5,63}$/i.test(owner)) return c.json({ error: "invalid owner" }, 400);
    if (!keyvalid(key)) return c.json({ error: "invalid key" }, 400);
    const quotamb = await storagequotafor(owner);
    try {
      const stored = putobject(owner, key, content, quotamb);
      return c.json({ stored: { key: stored.key, bytes: stored.bytes, updatedAt: stored.updatedAt } });
    } catch (error) {
      if (error instanceof StorageError) {
        const over = error.message.includes("quota");
        return c.json({ error: error.message }, over ? 413 : 400);
      }
      return c.json({ error: "the storage write failed" }, 500);
    }
  });
  app.get("/api/v1/storage/objects", async (c) => {
    const owner = c.req.query("owner") ?? "";
    const key = c.req.query("key") ?? "";
    if (!/^[a-z0-9][a-z0-9-]{5,63}$/i.test(owner)) return c.json({ error: "invalid owner" }, 400);
    if (!keyvalid(key)) return c.json({ error: "invalid key" }, 400);
    if (key) {
      const found = getobject(owner, key);
      if (!found) return c.json({ error: "not found" }, 404);
      return c.json({ object: found });
    }
    return c.json({ objects: listobjects(owner) });
  });
  app.delete("/api/v1/storage/objects", async (c) => {
    const owner = c.req.query("owner") ?? "";
    const key = c.req.query("key") ?? "";
    if (!/^[a-z0-9][a-z0-9-]{5,63}$/i.test(owner)) return c.json({ error: "invalid owner" }, 400);
    if (!keyvalid(key)) return c.json({ error: "invalid key" }, 400);
    return c.json({ removed: deleteobject(owner, key) });
  });
  app.get("/api/v1/storage/usage", async (c) => {
    const owner = c.req.query("owner") ?? "";
    if (!/^[a-z0-9][a-z0-9-]{5,63}$/i.test(owner)) return c.json({ error: "invalid owner" }, 400);
    return c.json({ usage: usagefor(owner, await storagequotafor(owner)) });
  });

  // the account lane: the REAL accounts of the platform — the shared
  // sqlite store in the data home beside the storage one, outside every
  // served root. A family deploy pointing the shared data home (or
  // DATABASE_URL) at the same store logs the whole family in with one
  // session: every device reads the same rows. The secret rides only as a
  // salted scrypt digest, the session bearer only as its sha-256 digest,
  // and the oauth exchange redeems the provider code through the url gate
  // (every hop resolves public addresses, the provider rides the oauthrow
  // catalog).
  const accountownerpattern = /^[a-z0-9][a-z0-9-]{2,63}$/i;
  const accountbearer = (header: string | undefined): string => {
    const value = typeof header === "string" ? header : "";
    if (!/^bearer\s+/i.test(value)) return "";
    const token = value.replace(/^bearer\s+/i, "").trim();
    return accountsessiontokenvalid(token) ? token : "";
  };
  // the persistent family session rides an HttpOnly cookie the server mints
  // at every session door: the canonical state stays server side, the
  // visitor side never holds it in a scriptable store
  const FAMILYCOOKIENAME = "devthinkfamily";
  const FAMILYCOOKIEAGE = 60 * 60 * 24 * 30;
  const setfamilycookie = (c: Context, token: string): void => {
    const secure = c.req.url.startsWith("https://") ? [" Secure"] : [];
    c.header(
      "set-cookie",
      [[FAMILYCOOKIENAME, "=", token].join(""), "; Path=/; HttpOnly; SameSite=Lax", ["; Max-Age=", String(FAMILYCOOKIEAGE)].join(""), ...secure].join(""),
    );
  };
  const clearfamilycookie = (c: Context): void => {
    c.header("set-cookie", [FAMILYCOOKIENAME, "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"].join(""));
  };
  const familycookiebearer = (cookieheader: string | undefined): string => {
    const header = typeof cookieheader === "string" ? cookieheader : "";
    let token = "";
    for (const piece of header.split(";")) {
      const parts = piece.trim().split("=");
      if (parts[0] === FAMILYCOOKIENAME && parts.length >= 2) {
        const candidate = parts[1] || "";
        if (accountsessiontokenvalid(candidate)) token = candidate;
      }
    }
    return token;
  };
  app.post("/api/v1/accounts", async (c) => {
    const body = (await c.req.json().catch(() => null)) as { owner?: unknown; secret?: unknown } | null;
    const owner = typeof body?.owner === "string" ? body.owner : "";
    const secret = typeof body?.secret === "string" ? body.secret : "";
    if (!accountownerpattern.test(owner)) return c.json({ error: "invalid owner" }, 400);
    try {
      const account = createaccount(owner, secret);
      const session = issueaccountsession(account.id);
      setfamilycookie(c, session.token);
      return c.json(
        { owner: account.owner, createdAt: account.createdAt, token: session.token, expiresAt: session.expiresAt },
        201,
      );
    } catch (error) {
      if (error instanceof AccountError) {
        return c.json({ error: error.message }, error.message.includes("taken") ? 409 : 400);
      }
      return c.json({ error: "the account could not be created" }, 500);
    }
  });
  app.post("/api/v1/accounts/session", async (c) => {
    const body = (await c.req.json().catch(() => null)) as { owner?: unknown; secret?: unknown } | null;
    const owner = typeof body?.owner === "string" ? body.owner : "";
    const secret = typeof body?.secret === "string" ? body.secret : "";
    if (!accountownerpattern.test(owner)) return c.json({ error: "invalid owner" }, 400);
    const account = verifyaccount(owner, secret);
    if (!account) return c.json({ error: "the owner and the secret do not match" }, 401);
    const session = issueaccountsession(account.id);
    setfamilycookie(c, session.token);
    return c.json({ owner: account.owner, token: session.token, expiresAt: session.expiresAt });
  });
  app.get("/api/v1/accounts/session", async (c) => {
    const headerbearer = accountbearer(c.req.header("authorization"));
    // the persistent restore: a request with no authorization header but a
    // live family cookie answers a rotated session, so the sign in survives
    // the browser restart without any canonical state on the visitor side
    if (!headerbearer) {
      const cookiebearer = familycookiebearer(c.req.header("cookie"));
      if (cookiebearer) {
        const view = verifyaccountsession(cookiebearer);
        if (view) {
          const rotated = issueaccountsession(view.accountid);
          setfamilycookie(c, rotated.token);
          return c.json({
            owner: view.owner,
            createdAt: view.createdAt,
            expiresAt: rotated.expiresAt,
            token: rotated.token,
            rotated: true,
          });
        }
        return c.json({ error: "a current account session bearer is required" }, 401);
      }
    }
    const view = verifyaccountsession(headerbearer);
    if (!view) return c.json({ error: "a current account session bearer is required" }, 401);
    return c.json({ owner: view.owner, createdAt: view.createdAt, expiresAt: view.expiresAt });
  });
  app.delete("/api/v1/accounts/session", async (c) => {
    const token = accountbearer(c.req.header("authorization")) || familycookiebearer(c.req.header("cookie"));
    clearfamilycookie(c);
    if (!token || !revokeaccountsession(token)) {
      return c.json({ error: "a current account session bearer is required" }, 401);
    }
    return c.json({ revoked: true });
  });
  app.post("/api/v1/auth/exchange", async (c) => {
    const body = (await c.req.json().catch(() => null)) as {
      provider?: unknown;
      code?: unknown;
      verifier?: unknown;
      redirectUri?: unknown;
    } | null;
    const provider = typeof body?.provider === "string" ? body.provider : "";
    const code = typeof body?.code === "string" ? body.code : "";
    const verifier = typeof body?.verifier === "string" ? body.verifier : "";
    const redirectUri = typeof body?.redirectUri === "string" ? body.redirectUri : "";
    if (!OAUTH_PROVIDERS.includes(provider as OAuthProvider)) return c.json({ error: "unknown provider" }, 400);
    try {
      const answer = await exchangeoauthcode(provider, code, verifier, redirectUri);
      setfamilycookie(c, answer.token);
      return c.json(answer, 201);
    } catch (error) {
      if (error instanceof AccountError) return c.json({ error: error.message }, 400);
      if (error instanceof GateError) return c.json({ error: "the provider exchange did not answer" }, 502);
      return c.json({ error: "the exchange failed" }, 500);
    }
  });
}

/** createserver — build the hono app from the loaded config (exported at
 * the library surface below, so the battery drives the real routes
 * through app.request without a socket) */
async function createserver(): Promise<Hono> {
  // the gateway transport first — cors, the /api/config endpoint, the
  // version loop, the console static roots and the spa fallback live in
  // the getry owner since the ownership wave step 3 (the transport owns
  // the wire); the os lanes register on the same app after it, so one
  // surface answers both families in the order the merged lanes carried
  const app = await getrycreateserver();
  await createoslanes(app);
  return app;
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

/**
 * the ownership move (wave/ownership.gateway step 2): the gateway request
 * auth and key resolution family — the inbound extractors, the token
 * guards, the universal key resolution (db env inline ephemeral), the
 * outbound header and query param builders and the round robin helpers —
 * moved verbatim to the getry owner (getry/auth.ts, the
 * "@wenathlan/getry/auth" face: one owner, the family consumes). devthink
 * re-exports the public symbols here so every compat consumer (the http
 * and authentication test lanes, the engine seams, the published ./server
 * entry) keeps resolving without an edit; the private keysfromdb /
 * keysfromenv / keysfrominline / keysfromephemeral helpers moved with
 * resolvekeys and stay private in the owner, and the db seam rides the
 * "@wenathlan/devthink/storage" specifier the owner resolves dynamically
 * (the os keeps the persistence family).
 */
export { extracttoken, extractchatid, extractsessionid, extractrequestid, validatetoken, masktoken, resolvekeys, buildauthheaders, buildauthqueryparams, appendqueryparams, getkey, getkeycount } from "@wenathlan/getry/auth";

/**
 * the ownership move (wave/ownership.gateway step 4 — the final double
 * move): the gateway console cli family — the zero-dependency arg parser,
 * the version probe, the ansi colors, the shared stdin question stream,
 * the config search and the scaffold generators (config.mjs,
 * schema.prisma, prismaconfig.ts, .env.example), the interactive version
 * builder, the command dispatch (init add list show validate keys models
 * serve export help), the family entry runclifamily and the console main —
 * moved verbatim to the getry owner (getry/cli.ts, the
 * "@wenathlan/getry/cli" face: one owner, the family consumes). devthink
 * re-exports the public symbol here so every compat consumer (the devthink
 * router's gateway family, the published ./server entry) keeps resolving
 * without an edit; the private helpers moved with the family and stay
 * private in the owner. the serve seam flipped with the move: the owner's
 * cmdserve boots the getry transport main (the transport owns the wire),
 * and this entry answers serve through its own composed main above (the
 * os lanes register on the app the getry transport built) — the autorun
 * guard at the tail of this file dispatches accordingly.
 */
export { runclifamily } from "@wenathlan/getry/cli";

/* ── Merged: the grand merge section ── the correlated embedded gateway library barrel logics of the merged repository interned here, one surface without duplicate variations. ── */
/* the embedded gateway barrel: the config loading, the database, the engine, the types and the
   utils re-export beside the auth, transport and console exports this file already declares, so
   the server surface answers the whole library contract from one module. */
// config loading — bridge to the user customization layer
/* the flat package law (the consumer truth): the library surface answers
 * the inlined getry owner seats the entry imports statically — the bundle
 * inlines every loader through the family bridge — while the config face
 * keeps the computed lazy lane its browser purity law demands (the web
 * consumer never drags the hono transport at module scope). the node
 * consumer resolves one inlined module and never a registry specifier. */
export { getrygetversion as getversion, getrylistversions as listversions, loadconfig, getryreloadconfig as reloadconfig };
export { validateconfig } from "@wenathlan/getry/validate";
// database — prisma persistence (the storage family)
export { db, getsession, getsessionmessages, savemsg } from "./storage.js";
// engine — the universal request pipeline
export { createversion, engineinternals } from "@wenathlan/getry/engine";
// types — the configuration surface
export type { authmethod } from "./types.js";
export type {
  authconfig,
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
} from "@wenathlan/getry/types";

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
} from "@wenathlan/getry/utils";

/* the grand-merge autorun guard (the cli move of the gateway ownership
   wave, step 4): the console family answers from the getry owner now, and
   this entry keeps a tiny autorun guard of its own for the direct-run path
   the e2e lane spawns (`tsx server.ts serve`) — serve boots the composed
   devthink main (the os lanes register on the app the getry transport
   built, the seam step 3 kept), every other command delegates to the
   owner's runclifamily through the shim above. */
import { runclifamily } from "@wenathlan/getry/cli";

const serverDirectEntry = process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js");
const serverBunEntry = (import.meta as ImportMeta & { main?: boolean }).main === true;
if (serverDirectEntry || serverBunEntry) {
  const args = process.argv.slice(2);
  if (args[0] === "serve") {
    const portindex = args.findIndex((a) => a === "--port" || a === "-port");
    const portarg =
      portindex >= 0 && args[portindex + 1] && !args[portindex + 1].startsWith("-") ? args[portindex + 1] : undefined;
    const port = Number(portarg) || Number(process.env.PORT) || 3001;
    process.env.PORT = String(port);
    void main();
  } else {
    void runclifamily(args);
  }
}














/**
 * the ownership move (wave/ownership.gateway step 5 — the final double
 * move): the provider account console family — the account manager flows
 * (login logout accounts quota config models status doctor version manage
 * configure), the shared interaction and secure-atomic file helpers, the
 * opencode.json locator, its library barrel (the provider family
 * namespaces, the version identity and the bypass aggregates) and the
 * opencode server plugin entries (providerServer/googleAuth/
 * antigravityAuth) — moved verbatim to the getry owner
 * (getry/providercli.ts, the "@wenathlan/getry/providers" face: one
 * owner, the family consumes). the sanctioned transforms moved with the
 * family: the getAccountManager() fallback twin was deleted (every call
 * site answers getDefaultAccountManager from the accounts owner), the
 * provider maskToken renamed maskProviderToken (the shadow-kill), the
 * opencode model definitions moved to the models owner, the plugin
 * entries merged into the antigravity owner, and every getry face the
 * console consumed answers from in-package relatives now. devthink
 * re-exports the whole public surface here (the star carries the console
 * exports, the namespace barrel incl the CLI row, the bypass aggregates,
 * the plugin entries and the family entry runproviderfamily) so every
 * compat consumer (the devthink router's provider family, the published
 * ./server entry) keeps resolving without an edit.
 */
export * from "@wenathlan/getry/providers";
export type { ModelCatalogEntry, OpenCodeJsonLocation } from "@wenathlan/getry/providers";
/* the CLI namespace equivalent of the barrel row the provider console
   carried (export * as CLI): the console family answers from the getry cli
   owner now, and the star above already carries its own CLI row — this
   alias keeps the devthink face speaking the same name. */
export * as CLI from "@wenathlan/getry/cli";


