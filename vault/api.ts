// # api — the vault http surface: the real storage routes over pure
// node:http (zero dependencies, the saddle webserver discipline). The server
// is the whole truth of the engine — every route rides the real ledger,
// the real sha-256 digests and the real quota verdicts; nothing is cached
// or held in the person's browser. Objects travel as raw bodies with the
// x-object-path / x-object-mime / x-project-id headers (multipart parsing
// is a later rung — the raw body answers every byte today). Failures answer
// the standardized { error: { code, message } } shape, bigint pointers
// travel as decimal strings, and every fallible path is guarded.
//
// The faun lesson owns the door: the storage truth is the network database
// of the family, and no request reaches it without an honest credential —
// the operator bearer the platform pinned (VAULT_TOKEN, the bootstrap and
// admin lane), the session cookie of a signed-in person (the identity
// lane: signup, login, the httpOnly vaultsession cookie) or the api key of
// one project (x-api-key, the application lane). A credential of one lane
// only reaches the scopes it answers for: the operator rides everything,
// the api key its project, the session its owned scopes. The health probe
// stays open so the platform can watch the service; every data route — the
// deposits, the listings, the verified reads, the removals, the quotas,
// the usage and the sweep — answers 401 without an honest credential and
// 503 while no lane can answer at all (fail closed, never fail open). The
// faun lesson owns the download lane too: a .db file never rides it — the
// put refuses it and the read re-verifies (VAULT_DB_LOCKED).
//
// @section auth — the token gate and the identity lanes (the faun lesson)
// @section routes — the route catalog
// @section server — the node:http server and its boot
// @section handlers — the storage surface

import { createHash, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { createServer } from "node:http";
import process from "node:process";
import { pathToFileURL } from "node:url";
import {
  accountOwnsProject,
  createOwnedProject,
  endSession,
  loginAccount,
  ownedProjects,
  projectApiKeyOf,
  SESSION_TTL_MS,
  sessionAccountOf,
  signupAccount,
} from "./accounts.ts";
import { storage, storageDriverKind } from "./drizzle.ts";
import {
  createProject,
  deleteObject,
  getObject,
  listObjects,
  objectProjectOf,
  type LedgerObject,
  putObject,
  storageCensus,
  sweepOrphans,
  usageOf,
} from "./objectsledger.ts";
import { type QuotaVerdict, quotaLimitFrom, quotaVerdict, readQuota, setQuota } from "./quota.ts";
import { ensureuicopyingested, uistoreget, uistorelist } from "./uistore.ts";

/** @section auth */

/** the digest of the configured vault token — resolved once at boot, never the raw value in a closure. */
const vaultTokenDigest: Buffer | undefined = vaultTokenDigestOf();

/**
 * Resolves the sha-256 digest of the configured VAULT_TOKEN — the gate
 * compares digests, never the raw bearers, so a presented token never
 * rides a comparison that could leak its length or its bytes.
 *
 * @returns the digest, or undefined when the environment carries no token.
 */
function vaultTokenDigestOf(): Buffer | undefined {
  const token = process.env.VAULT_TOKEN;
  if (typeof token !== "string" || token.length === 0) {
    return undefined;
  }
  return createHash("sha256").update(token, "utf8").digest();
}

/**
 * Answers whether the operator pinned the vault token — the honest
 * readiness the health probe reports and the sealed refusal reads.
 *
 * @returns true when VAULT_TOKEN answered at boot.
 */
export function vaultTokenConfigured(): boolean {
  return vaultTokenDigest !== undefined;
}

/**
 * Reads the presented bearer of one request — the Authorization: Bearer
 * header first, then the x-vault-token header the platform gateway rides.
 *
 * @param req the incoming request.
 * @returns the raw presented token, or an empty string.
 */
function presentedToken(req: IncomingMessage): string {
  const authorization = headerOf(req, "authorization");
  if (authorization.toLowerCase().startsWith("bearer ")) {
    const bearer = authorization.slice("bearer ".length).trim();
    if (bearer.length > 0) {
      return bearer;
    }
  }
  return headerOf(req, "x-vault-token").trim();
}

/**
 * The token gate of every data route — the faun lesson as code: the
 * request passes only when the environment pinned a token and the
 * presented bearer digests to exactly it (timing safe). An unpinned
 * environment seals the whole storage surface (fail closed).
 *
 * @param req the incoming request.
 * @returns the verdict the route answers: "open", "refused" (a wrong or
 *   missing bearer) or "sealed" (no token configured).
 */
export function tokenVerdict(req: IncomingMessage): "open" | "refused" | "sealed" {
  if (vaultTokenDigest === undefined) {
    return "sealed";
  }
  const presented = presentedToken(req);
  if (presented.length === 0) {
    return "refused";
  }
  const digest = createHash("sha256").update(presented, "utf8").digest();
  return digest.length === vaultTokenDigest.length && timingSafeEqual(digest, vaultTokenDigest) ? "open" : "refused";
}

/* ------------------------------------------------------------------ */
/* the identity lanes — the session cookie and the project api key      */
/* ------------------------------------------------------------------ */

/** the cookie name the session rides — httpOnly, SameSite=Strict; nothing of the session ever touches the browser's localStorage. */
const SESSION_COOKIE = "vaultsession";

/** One resolved credential of a storage request — the lane that answered. */
export type VaultAuthContext =
  | { kind: "operator" }
  | { kind: "session"; accountId: string }
  | { kind: "apikey"; projectId: string };

/**
 * Resolves the credential of one storage request — the three-lane gate:
 * the operator bearer first (the faun lesson door), then the project api
 * key, then the session cookie. A presented credential that fails answers
 * its honest refusal ("refused" for a wrong bearer, key or session,
 * "sealed" for an operator bearer the environment never pinned); no
 * credential at all answers undefined, and the caller maps the sealed and
 * refused verdicts exactly the way the token-only gate always did.
 *
 * @param req the incoming request.
 * @param verdict the operator-bearer verdict already resolved.
 * @returns the auth context, "refused", "sealed", or undefined when no lane answered.
 */
function authContextOf(
  req: IncomingMessage,
  verdict: "open" | "refused" | "sealed",
): VaultAuthContext | "refused" | "sealed" | undefined {
  if (verdict === "open") {
    return { kind: "operator" };
  }
  if (presentedToken(req) !== "") {
    return verdict === "sealed" ? "sealed" : "refused";
  }
  const key = headerOf(req, "x-api-key").trim();
  if (key !== "") {
    const project = projectApiKeyOf(key);
    return project === undefined ? "refused" : { kind: "apikey", projectId: project.projectId };
  }
  return sessionContextOf(req);
}

/**
 * Resolves the session lane of one request — the httpOnly cookie the
 * person door rides (an expired or unknown session answers undefined).
 *
 * @param req the incoming request.
 * @returns the session context, or undefined when no live session answers.
 */
function sessionContextOf(req: IncomingMessage): { kind: "session"; accountId: string } | undefined {
  const token = cookieValueOf(req, SESSION_COOKIE);
  if (token === "") {
    return undefined;
  }
  const account = sessionAccountOf(token);
  return account === undefined ? undefined : { kind: "session", accountId: account.id };
}

/**
 * The scope gate of the project-keyed routes: the operator rides every
 * scope, the api key its project, the session its owned scopes.
 *
 * @param context the resolved credential.
 * @param projectId the project the route touches.
 * @returns true when the credential answers for the project.
 */
function projectScopeAllowed(context: VaultAuthContext, projectId: string): boolean {
  if (context.kind === "operator") {
    return true;
  }
  if (context.kind === "apikey") {
    return context.projectId === projectId;
  }
  return accountOwnsProject(context.accountId, projectId);
}

/**
 * Reads one cookie value off the request header — a linear split, no
 * dependency, the malformed parts skipped.
 *
 * @param req the incoming request.
 * @param name the cookie name.
 * @returns the cookie value, or an empty string.
 */
function cookieValueOf(req: IncomingMessage, name: string): string {
  const header = req.headers.cookie;
  if (typeof header !== "string" || header === "") {
    return "";
  }
  for (const part of header.split(";")) {
    const equals = part.indexOf("=");
    if (equals <= 0) {
      continue;
    }
    if (part.slice(0, equals).trim() === name) {
      return safeDecode(part.slice(equals + 1).trim());
    }
  }
  return "";
}

/**
 * The session cookie the auth lanes set — httpOnly, SameSite=Strict, the
 * patient seven-day window; the raw token rides the cookie and only its
 * sha-256 hash rides the database.
 *
 * @param token the raw session token.
 * @returns the Set-Cookie value.
 */
function sessionCookieOf(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Number(SESSION_TTL_MS / 1000n)}`;
}

/** the clearing cookie the logout lane answers. */
function clearedSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

/** @section routes */

/** the route catalog of the vault http surface (health kept verbatim from the declaration it grew from). */
export const routes = {
  health: "/api/health",
  uicopy: "/api/v1/ui/copy",
  signup: "/api/v1/auth/signup",
  login: "/api/v1/auth/login",
  logout: "/api/v1/auth/logout",
  session: "/api/v1/auth/session",
  accountProjects: "/api/v1/projects",
  projects: "/api/v1/storage/projects",
  objects: "/api/v1/storage/objects",
  quota: "/api/v1/storage/quota",
  usage: "/api/v1/storage/usage",
  sweep: "/api/v1/storage/sweep",
} as const;

/** @section server */

/**
 * Creates the vault http server — pure node:http, no framework, no static
 * hosting (the platform gateway owns the site surface; this server owns the
 * storage truth). Every request is answered with the standardized json or
 * byte shapes.
 *
 * @returns the server, not yet listening.
 */
export function createVaultServer(): Server {
  return createServer((req, res) => {
    void handle(req, res);
  });
}

/**
 * Starts listening — the port and host resolve from the options (port 0
 * answers an ephemeral port for tests), never a hardcoded localhost.
 *
 * @param server the vault server.
 * @param options the port (default VAULT_PORT, then 3210) and host (default VAULT_HOST, then 0.0.0.0).
 * @returns the bound port.
 */
export function listenVault(server: Server, options?: { port?: number; host?: string }): Promise<number> {
  const port = options?.port ?? Number(process.env.VAULT_PORT ?? 3210);
  const host = options?.host ?? process.env.VAULT_HOST ?? "0.0.0.0";
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const address = server.address();
      resolve(typeof address === "object" && address !== null ? address.port : port);
    });
  });
}

/** the one request entry — every fallible path guarded, every failure standardized. */
async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "vault.local"}`);
    applyCors(res);
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    const method = req.method ?? "GET";
    const pathname = url.pathname;
    if (method === "GET" && pathname === routes.health) {
      sendJson(res, 200, {
        ok: true,
        service: "vault",
        storage: { driver: storageDriverKind() },
        auth: { required: true, configured: vaultTokenConfigured() },
      });
      return;
    }
    /* the ui copy lane — the winget copy of the vault rides the uicopy
     * table of the site store and answers same-origin beside the health
     * probe (an open read: the interface text carries no secret — the
     * storage truth past this line stays behind the token gate). One lane
     * lists the rows for the mount loader, one lane answers a single key,
     * and an unknown key refuses honestly instead of inventing a word. */
    if (method === "GET" && pathname === routes.uicopy) {
      await ensureuicopyingested();
      const rows = await uistorelist(String(url.searchParams.get("locale") || "en"));
      sendJson(res, 200, { rows });
      return;
    }
    if (method === "GET" && pathname.startsWith(`${routes.uicopy}/`)) {
      await ensureuicopyingested();
      const key = safeDecode(pathname.slice(routes.uicopy.length + 1));
      const row = await uistoreget(key, String(url.searchParams.get("locale") || "en"));
      if (!row) {
        sendError(res, 404, "VAULT_COPY", `no copy row answers ${key}`);
        return;
      }
      sendJson(res, 200, row);
      return;
    }
    /* the identity lanes — the person door the supabase law promises: the
     * signup, the login, the logout and the session read answer their own
     * guards (never the operator bearer), and the owned projects ride the
     * httpOnly session cookie. Nothing of the session ever touches the
     * browser's storage — the cookie carries it, the vault keeps it. */
    if (pathname === routes.signup) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      await signupRoute(req, res);
      return;
    }
    if (pathname === routes.login) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      await loginRoute(req, res);
      return;
    }
    if (pathname === routes.logout) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      await logoutRoute(req, res);
      return;
    }
    if (pathname === routes.session) {
      if (method !== "GET") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      sessionRoute(req, res);
      return;
    }
    if (pathname === routes.accountProjects) {
      const context = sessionContextOf(req);
      if (context === undefined) {
        sendError(res, 401, "VAULT_AUTH", "the projects lane demands a session — sign up or sign in first");
        return;
      }
      if (method === "POST") {
        await postAccountProject(req, res, context);
        return;
      }
      if (method === "GET") {
        listAccountProjects(res, context);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    /* the faun lesson door, the three-lane edition: every storage route
     * past the copy lane demands one honest credential — the operator
     * bearer (VAULT_TOKEN, the bootstrap and admin lane), the project api
     * key (x-api-key, the application lane) or the session cookie (the
     * person lane). The sealed and the refused answers ride the same
     * standardized error shape the rest of the surface speaks, and a
     * credential of one lane only reaches the scopes it answers for. */
    const verdict = tokenVerdict(req);
    const context = authContextOf(req, verdict);
    if (context === "sealed" || (context === undefined && !vaultTokenConfigured())) {
      sendError(
        res,
        503,
        "VAULT_AUTH",
        "the vault token is not configured — set VAULT_TOKEN for the operator lane or ride the session and api key lanes",
      );
      return;
    }
    if (context === "refused" || context === undefined) {
      sendError(
        res,
        401,
        "VAULT_AUTH",
        "the storage truth demands the vault token (Authorization: Bearer or x-vault-token), a project api key (x-api-key) or a session cookie",
      );
      return;
    }
    if (pathname === routes.projects) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      if (context.kind !== "operator") {
        sendError(res, 403, "VAULT_SCOPE", "the bootstrap project lane belongs to the operator bearer");
        return;
      }
      await postProject(req, res);
      return;
    }
    if (pathname === routes.objects) {
      if (method === "POST") {
        await postObject(req, res, context);
        return;
      }
      if (method === "GET") {
        listObjectsRoute(res, url, context);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    if (pathname.startsWith(`${routes.objects}/`)) {
      const id = safeDecode(pathname.slice(routes.objects.length + 1));
      if (method === "GET") {
        getObjectRoute(res, id, context);
        return;
      }
      if (method === "DELETE") {
        deleteObjectRoute(res, id, context);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    if (pathname === routes.quota) {
      if (method === "GET") {
        getQuotaRoute(res, url, context);
        return;
      }
      if (method === "POST") {
        await postQuota(req, res, url, context);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    if (pathname === routes.usage) {
      if (method !== "GET") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      usageRoute(res, url, context);
      return;
    }
    if (pathname === routes.sweep) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      if (context.kind !== "operator") {
        sendError(res, 403, "VAULT_SCOPE", "the sweep touches every scope — it belongs to the operator bearer");
        return;
      }
      sweepRoute(res);
      return;
    }
    sendError(res, 404, "VAULT_ROUTE", `no route answers ${pathname}`);
  } catch (error) {
    sendError(res, 500, "VAULT_FAULT", error instanceof Error ? error.message : "the vault faulted");
  }
}

/** @section handlers */

/** answers one json body — 400 when the body is not honest json. */
async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const body = await readBody(req);
  if (body.length === 0) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(body.toString("utf8"));
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("the body must be a json object");
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    throw new BadBodyError(error instanceof Error ? error.message : "the body is not json");
  }
}

/** the typed refusal a malformed body answers. */
class BadBodyError extends Error {}

/** reads the whole raw body — the deposit bytes travel verbatim; the quota gate is the only ceiling. */
async function readBody(req: IncomingMessage): Promise<Buffer> {
  const parts: Buffer[] = [];
  for await (const part of req) {
    parts.push(typeof part === "string" ? Buffer.from(part, "utf8") : part);
  }
  return Buffer.concat(parts);
}

/** @section handlers — the identity surface */

/** POST /api/v1/auth/signup — the person door: email + password, the answer carries the account and sets the first session cookie. */
async function signupRoute(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await readJson(req);
    const answer = signupAccount(
      typeof body.email === "string" ? body.email : "",
      typeof body.password === "string" ? body.password : "",
    );
    if ("refusal" in answer) {
      sendError(res, answer.refusal.code === "VAULT_EMAIL_TAKEN" ? 409 : 400, answer.refusal.code, answer.refusal.why);
      return;
    }
    sendJson(
      res,
      201,
      { account: jsonOfAccount(answer.account) },
      { "set-cookie": sessionCookieOf(answer.session.token) },
    );
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** POST /api/v1/auth/login — the email and the password must both answer; the answer sets a fresh session cookie. */
async function loginRoute(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await readJson(req);
    const answer = loginAccount(
      typeof body.email === "string" ? body.email : "",
      typeof body.password === "string" ? body.password : "",
    );
    if ("refusal" in answer) {
      sendError(res, 401, answer.refusal.code, answer.refusal.why);
      return;
    }
    sendJson(
      res,
      200,
      { account: jsonOfAccount(answer.account) },
      { "set-cookie": sessionCookieOf(answer.session.token) },
    );
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** POST /api/v1/auth/logout — ends the session the cookie carries and clears the cookie. */
async function logoutRoute(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await readBody(req);
  const token = cookieValueOf(req, SESSION_COOKIE);
  if (token !== "") {
    endSession(token);
  }
  sendJson(res, 200, { ended: true }, { "set-cookie": clearedSessionCookie() });
}

/** GET /api/v1/auth/session — the signed-in account the cookie answers for, or the honest 401. */
function sessionRoute(req: IncomingMessage, res: ServerResponse): void {
  const token = cookieValueOf(req, SESSION_COOKIE);
  const account = token === "" ? undefined : sessionAccountOf(token);
  if (account === undefined) {
    sendError(res, 401, "VAULT_AUTH", "no session answers — sign up or sign in first");
    return;
  }
  sendJson(res, 200, { account: jsonOfAccount(account) });
}

/** POST /api/v1/projects — registers one application for the signed-in person: the vault issues the [a-z0-9]{12} id and answers the first api key exactly once. */
async function postAccountProject(
  req: IncomingMessage,
  res: ServerResponse,
  context: { kind: "session"; accountId: string },
): Promise<void> {
  try {
    const body = await readJson(req);
    const name = typeof body.name === "string" ? body.name : undefined;
    const answer = createOwnedProject(context.accountId, name);
    if ("refusal" in answer) {
      sendError(res, 400, "VAULT_INVALID", answer.refusal.why);
      return;
    }
    sendJson(res, 201, {
      project: jsonOfProject(answer.project),
      apiKey: { prefix: answer.apiKey.prefix, key: answer.apiKey.key },
    });
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** GET /api/v1/projects — the projects the signed-in person owns, newest first. */
function listAccountProjects(res: ServerResponse, context: { kind: "session"; accountId: string }): void {
  sendJson(res, 200, { projects: ownedProjects(context.accountId).map(jsonOfProject) });
}

/** @section handlers — the storage surface */

/** POST /api/v1/storage/projects — creates the owner scope with its 900MB quota floor. */
async function postProject(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await readJson(req);
    const id = typeof body.id === "string" ? body.id : "";
    const name = typeof body.name === "string" ? body.name : id;
    const answer = createProject(id, name);
    if (answer.project !== undefined) {
      sendJson(res, 201, { project: jsonOfProject(answer.project) });
      return;
    }
    sendError(res, 400, "VAULT_INVALID", answer.refusal?.why ?? "the project was refused");
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** POST /api/v1/storage/objects — the deposit: raw body bytes, path and mime from the headers. The faun lesson refuses the .db ride before one byte of the pipeline moves. */
async function postObject(req: IncomingMessage, res: ServerResponse, context: VaultAuthContext): Promise<void> {
  const projectId = headerOf(req, "x-project-id");
  const objectPath = safeDecode(headerOf(req, "x-object-path"));
  const mime = headerOf(req, "x-object-mime") || "application/octet-stream";
  if (projectId === "" || objectPath === "") {
    sendError(res, 400, "VAULT_INVALID", "the deposit needs the x-project-id and x-object-path headers");
    return;
  }
  if (!projectScopeAllowed(context, projectId)) {
    sendError(res, 403, "VAULT_SCOPE", "the credential does not answer for this project");
    return;
  }
  const bytes = await readBody(req);
  const answer = putObject({ projectId, path: objectPath, mime, bytes });
  if (!("refusal" in answer)) {
    sendJson(res, 201, { object: jsonOfObject(answer.object), reused: answer.reused });
    return;
  }
  if (answer.refusal.kind === "quota") {
    sendJson(res, 413, {
      error: { code: "VAULT_QUOTA", message: answer.refusal.why, quota: jsonOfVerdict(answer.refusal.verdict) },
    });
    return;
  }
  if (answer.refusal.kind === "dblocked") {
    sendError(res, 403, "VAULT_DB_LOCKED", answer.refusal.why);
    return;
  }
  sendError(res, 400, "VAULT_INVALID", answer.refusal.why);
}

/** GET /api/v1/storage/objects — the live rows of one project, newest first. */
function listObjectsRoute(res: ServerResponse, url: URL, context: VaultAuthContext): void {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the list needs the project query parameter");
    return;
  }
  if (!projectScopeAllowed(context, projectId)) {
    sendError(res, 403, "VAULT_SCOPE", "the credential does not answer for this project");
    return;
  }
  sendJson(res, 200, { objects: listObjects(projectId).map(jsonOfObject) });
}

/** GET /api/v1/storage/objects/:id — the verified bytes back, served as the stored mime; the faun lesson re-verified at the read. */
function getObjectRoute(res: ServerResponse, id: string, context: VaultAuthContext): void {
  if (id === "") {
    sendError(res, 400, "VAULT_INVALID", "the object id is empty");
    return;
  }
  const projectId = objectProjectOf(id);
  if (projectId !== undefined && !projectScopeAllowed(context, projectId)) {
    sendError(res, 403, "VAULT_SCOPE", "the credential does not answer for this object");
    return;
  }
  const answer = getObject(id);
  if (!("refusal" in answer)) {
    res.writeHead(200, {
      "content-type": answer.object.mime,
      "content-length": String(answer.bytes.length),
      "x-object-digest": answer.object.digest,
      "x-object-size": answer.object.size.toString(),
      "x-object-path": answer.object.path,
      "x-object-verified": String(answer.verified),
    });
    res.end(answer.bytes);
    return;
  }
  if (answer.refusal.kind === "corrupt") {
    sendError(res, 500, "VAULT_CORRUPT", answer.refusal.why);
    return;
  }
  if (answer.refusal.kind === "dblocked") {
    sendError(res, 403, "VAULT_DB_LOCKED", answer.refusal.why);
    return;
  }
  sendError(res, 404, "VAULT_ABSENT", answer.refusal.why);
}

/** DELETE /api/v1/storage/objects/:id — the soft delete with the refcount detach. */
function deleteObjectRoute(res: ServerResponse, id: string, context: VaultAuthContext): void {
  if (id === "") {
    sendError(res, 400, "VAULT_INVALID", "the object id is empty");
    return;
  }
  const projectId = objectProjectOf(id);
  if (projectId !== undefined && !projectScopeAllowed(context, projectId)) {
    sendError(res, 403, "VAULT_SCOPE", "the credential does not answer for this object");
    return;
  }
  const answer = deleteObject(id);
  if (answer.removed) {
    sendJson(res, 200, { removed: true, id: answer.id });
    return;
  }
  sendJson(res, 404, { error: { code: "VAULT_ABSENT", message: `the object "${id}" is not in the ledger` } });
}

/** GET /api/v1/storage/quota — the usage, the user-defined limit and the verdict state. */
function getQuotaRoute(res: ServerResponse, url: URL, context: VaultAuthContext): void {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the quota needs the project query parameter");
    return;
  }
  if (!projectScopeAllowed(context, projectId)) {
    sendError(res, 403, "VAULT_SCOPE", "the credential does not answer for this project");
    return;
  }
  const quota = readQuota(storage, projectId);
  if (quota === undefined) {
    sendError(res, 404, "VAULT_PROJECT", `the project "${projectId}" never wrote a quota — create it first`);
    return;
  }
  const usage = usageOf(projectId);
  const verdict = quotaVerdict(usage.bytes, quota.limitBytes, 0n);
  sendJson(res, 200, {
    project: projectId,
    usage: usage.bytes.toString(),
    objects: usage.objects,
    limit: quota.limitBytes === null ? null : quota.limitBytes.toString(),
    state: verdict.state,
    remaining: verdict.remaining === null ? null : verdict.remaining.toString(),
    updatedAt: quota.updatedAt,
  });
}

/** POST /api/v1/storage/quota?project= — sets the user-defined limit: decimal bytes or unlimited. */
async function postQuota(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  context: VaultAuthContext,
): Promise<void> {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the quota needs the project query parameter");
    return;
  }
  if (!projectScopeAllowed(context, projectId)) {
    sendError(res, 403, "VAULT_SCOPE", "the credential does not answer for this project");
    return;
  }
  try {
    const body = await readJson(req);
    const raw = body.limitBytes === null || body.limitBytes === undefined ? "unlimited" : String(body.limitBytes);
    const parsed = quotaLimitFrom(raw);
    if ("refusal" in parsed) {
      sendError(res, 400, "VAULT_INVALID", parsed.refusal);
      return;
    }
    if (readQuota(storage, projectId) === undefined) {
      sendError(res, 404, "VAULT_PROJECT", `the project "${projectId}" never wrote a quota — create it first`);
      return;
    }
    const quota = setQuota(storage, projectId, parsed.limitBytes);
    sendJson(res, 200, {
      project: quota.projectId,
      limit: quota.limitBytes === null ? null : quota.limitBytes.toString(),
      updatedAt: quota.updatedAt,
    });
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** GET /api/v1/storage/usage — the project usage and the catalog census behind it. */
function usageRoute(res: ServerResponse, url: URL, context: VaultAuthContext): void {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the usage needs the project query parameter");
    return;
  }
  if (!projectScopeAllowed(context, projectId)) {
    sendError(res, 403, "VAULT_SCOPE", "the credential does not answer for this project");
    return;
  }
  const usage = usageOf(projectId);
  const census = storageCensus();
  sendJson(res, 200, {
    project: projectId,
    bytes: usage.bytes.toString(),
    objects: usage.objects,
    chunks: census.chunks,
    chunkBytes: census.chunkBytes.toString(),
    liveObjects: census.liveObjects,
    liveBytes: census.liveBytes.toString(),
  });
}

/** POST /api/v1/storage/sweep — collects the orphan chunks and the tombstones. */
function sweepRoute(res: ServerResponse): void {
  const answer = sweepOrphans();
  sendJson(res, 200, { chunks: answer.chunks, bytes: answer.bytes.toString(), tombstones: answer.tombstones });
}

/* ------------------------------------------------------------------ */
/* the json and http plumbing                                          */
/* ------------------------------------------------------------------ */

/** the json projection of one ledger object — bigint pointers as decimal strings. */
function jsonOfObject(object: LedgerObject): Record<string, unknown> {
  return {
    id: object.id,
    projectId: object.projectId,
    path: object.path,
    mime: object.mime,
    size: object.size.toString(),
    digest: object.digest,
    channel: object.channel,
    tier: object.tier,
    createdAt: object.createdAt,
  };
}

/** the json projection of one account — the bigint ms pointer as a decimal string, never the password hash. */
function jsonOfAccount(account: {
  id: string;
  email: string;
  role: string;
  createdAt: bigint;
}): Record<string, unknown> {
  return {
    id: account.id,
    email: account.email,
    role: account.role,
    createdAt: account.createdAt.toString(),
  };
}

/** the json projection of one project with its quota row. */
function jsonOfProject(project: {
  id: string;
  name: string;
  region: string;
  ownerAccountId: string | null;
  createdAt: string;
  quota: { projectId: string; limitBytes: bigint | null; updatedAt: string };
}): Record<string, unknown> {
  return {
    id: project.id,
    name: project.name,
    region: project.region,
    ownerAccountId: project.ownerAccountId,
    createdAt: project.createdAt,
    quota: {
      limitBytes: project.quota.limitBytes === null ? null : project.quota.limitBytes.toString(),
      updatedAt: project.quota.updatedAt,
    },
  };
}

/** the json projection of one quota verdict. */
function jsonOfVerdict(verdict: QuotaVerdict): Record<string, unknown> {
  return {
    state: verdict.state,
    usage: verdict.usage.toString(),
    limit: verdict.limit === null ? null : verdict.limit.toString(),
    incoming: verdict.incoming.toString(),
    remaining: verdict.remaining === null ? null : verdict.remaining.toString(),
  };
}

/** reads one header — first value when the platform answers an array. */
function headerOf(req: IncomingMessage, name: string): string {
  const value = req.headers[name];
  if (value === undefined) {
    return "";
  }
  return Array.isArray(value) ? (value[0] ?? "") : value;
}

/** decodes a url-encoded header value, falling back to the raw text on a malformed escape. */
function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/** the cors headers the platform gateway and the sol pages call through — the token and api key headers ride the allow list so an honest caller may present its credential. */
function applyCors(res: ServerResponse): void {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader(
    "access-control-allow-headers",
    "content-type, authorization, x-vault-token, x-project-id, x-object-path, x-object-mime, x-api-key",
  );
}

/** answers one json payload with the status (the declared length rides the
 * utf-8 byte count — the copy lanes carry em-dashes and middots, and a
 * utf-16 char count would truncate every multibyte payload). The optional
 * headers ride the answer before the head (the session cookie lane). */
function sendJson(res: ServerResponse, status: number, body: unknown, headers?: Record<string, string>): void {
  const payload = JSON.stringify(body);
  if (headers !== undefined) {
    for (const [name, value] of Object.entries(headers)) {
      res.setHeader(name, value);
    }
  }
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": String(Buffer.byteLength(payload, "utf8")),
  });
  res.end(payload);
}

/** answers one standardized failure — { error: { code, message } }. */
function sendError(res: ServerResponse, status: number, code: string, message: string): void {
  sendJson(res, status, { error: { code, message } });
}

/* the direct boot — `node api.ts` serves the storage truth on the resolved port. */
const invokedDirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const server = createVaultServer();
  const port = await listenVault(server);
  const authState = vaultTokenConfigured() ? "token gate armed" : "SEALED — set VAULT_TOKEN to open the storage routes";
  console.log(`vault api listening on port ${port} (storage driver: ${storageDriverKind()}, auth: ${authState})`);
  process.once("SIGINT", () => {
    server.close();
  });
}
