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
// The container doctrine adds the site face: when a static root answers
// (VAULT_STATIC_DIR, default ./dist), the same server serves the built
// site beside the storage routes — real files with real content types, the
// spa fallback the platform lanes ride, and the faun seal held again (a
// database file never answers from the static lane, not even a stray one
// inside the root).
//
// The wave D rewire (the supabase-law storage engine): beside the operator
// gate the vault answers the person's door — the signup lane (an account,
// a registered database, an api key shown exactly once, stored hashed),
// the helix-style /v2/query lane (bearer plus database-id headers over the
// per-database sqlite files of the better-sqlite3 core), the protocols
// pillar (every wire of the catalog answers its own static-safe route) and
// the internal root (the static site surface with the correct content type
// for every file type — and the faun law enforced: the raw .db never rides
// the static root, database data flows only through these api lanes).
//
// The faun lesson owns the door: the storage truth is the network database
// of the family, and no request reaches it without an honest bearer. The
// health probe stays open so the platform can watch the service; every
// data route — the deposits, the listings, the verified reads, the
// removals, the quotas, the usage and the sweep — refuses without one and
// stays sealed (503, fail closed) while no door is configured at all.
//
// The accounts wave widens the door honestly: the operator bearer
// (VAULT_TOKEN) stays the total admin — every standing caller keeps
// riding — while two more bearers answer beside it, each scoped: the vk_
// project key authorizes its own project only (the gate stamps its
// last-used), and the vs_ session token authorizes the projects of its
// account. A route that names a project (or serves an object of one)
// answers 403 VAULT_FORBIDDEN when the caller's scope does not hold it.
// The account doors themselves — the signup and the signin — stay public:
// no operator token, only the per-peer rate counter and the fail-closed
// session secret (VAULT_SESSION_SECRET, or the derivation of VAULT_TOKEN).
// The signin answer is the signed bearer alone — nothing ever saves in a
// browser, the client owns where the token lives.
//
// @section auth — the token gate and the three doors (the faun lesson)
// @section routes — the route catalog
// @section server — the node:http server and its boot
// @section handlers — the storage surface
// @section static — the dist lane (the container doctrine)
// @section doors — the signup, database and query lanes (the person's door)

import { createHash, timingSafeEqual } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import {
  authRateVerdict,
  createAccount,
  createProjectKey,
  issueSession,
  KEY_PREFIX,
  listProjectKeys,
  projectOwnedBy,
  projectOwner,
  resolveProjectKey,
  revokeProjectKey,
  SESSION_PREFIX,
  sessionSecretConfigured,
  verifyCredentials,
  verifySession,
} from "./accounts.ts";
import { internalRootDir, serveInternal } from "./internalroot.ts";
import { PROTOCOL_ROUTE_COUNT, PROTOCOLS, protocolRouteOf, type ProtocolRow } from "./protocols.ts";
import { queryVerdict, runQuery } from "./querylane.ts";
import {
  accountVerified,
  apiKeyLookup,
  databaseOf,
  databasesOfAccount,
  databasesOfEmail,
  ensurePersonAccount,
  issueApiKey,
  registerDatabase,
  revokeApiKey,
  setDatabaseQuota,
  signinAccount,
  signupAccount,
} from "./signup.ts";
import { storage, storageDriverKind } from "./drizzle.ts";
import {
  createProject,
  deleteObject,
  getObject,
  type LedgerObject,
  listObjects,
  listProjects,
  objectProjectOf,
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

/** the token verdicts the request auth resolves from (the faun gate answer). */
type TokenVerdict = "open" | "refused" | "sealed";

/**
 * The request auth of the data gate — the three doors in order, each one
 * scoped: the operator bearer stays total (admin), the vk_ key authorizes
 * its own project only, the vs_ session authorizes the projects of its
 * account. The "none" answer refuses (401); the "sealed" answer keeps the
 * fail-closed law — no door configured at all seals the whole surface.
 */
type RequestAuth =
  | { kind: "admin" }
  | { kind: "key"; keyId: string; projectId: string }
  | { kind: "session"; accountId: string }
  | { kind: "none" }
  | { kind: "sealed" };

/**
 * Resolves the request auth — the token verdict rides in (the faun gate
 * answers exactly once per request), then the two scoped doors read the
 * presented bearer: a vk_ secret resolves through its sha-256 digest (the
 * gate stamps last-used on the ride), a vs_ bearer verifies its HMAC and
 * its clock. The sealed verdict only stands when neither the operator
 * token nor the session secret is configured at all.
 *
 * @param req the incoming request.
 * @param verdict the token verdict of the same request.
 * @returns the resolved auth the route dispatch enforces.
 */
function requestAuth(req: IncomingMessage, verdict: TokenVerdict): RequestAuth {
  if (verdict === "open") {
    return { kind: "admin" };
  }
  const presented = presentedToken(req);
  if (presented.startsWith(KEY_PREFIX)) {
    const key = resolveProjectKey(presented);
    if (key !== undefined) {
      return { kind: "key", keyId: key.keyId, projectId: key.projectId };
    }
  }
  if (presented.startsWith(SESSION_PREFIX)) {
    const session = verifySession(presented);
    if (session !== undefined) {
      return { kind: "session", accountId: session.accountId };
    }
  }
  return verdict === "sealed" && !sessionSecretConfigured() ? { kind: "sealed" } : { kind: "none" };
}

/**
 * Answers whether the request auth may touch one project — the
 * authorization matrix of the data lanes: the admin rides total, the key
 * its own scope, the session the scopes of its account.
 *
 * @param auth the resolved request auth.
 * @param projectId the project the route names.
 * @returns true when the caller's scope holds the project.
 */
function authorizeProject(auth: RequestAuth, projectId: string): boolean {
  if (auth.kind === "admin") {
    return true;
  }
  if (auth.kind === "key") {
    return auth.projectId === projectId;
  }
  if (auth.kind === "session") {
    return projectOwnedBy(auth.accountId, projectId);
  }
  return false;
}

/**
 * Answers whether the request auth may run the key lane of one project —
 * the mint, the list and the revoke answer the admin and the owning
 * session only (a project key never mints keys).
 *
 * @param auth the resolved request auth.
 * @param projectId the project the key lane names.
 * @returns true when the caller may manage the keys.
 */
function authorizeKeyLane(auth: RequestAuth, projectId: string): boolean {
  if (auth.kind === "admin") {
    return true;
  }
  return auth.kind === "session" && projectOwnedBy(auth.accountId, projectId);
}

/**
 * Answers the standardized forbidden refusal of a foreign project — the
 * honest why per lane (the key's scope, the session's ownership).
 *
 * @param res the response to answer.
 * @param auth the resolved request auth.
 * @param projectId the project the caller may not touch.
 */
function sendProjectForbidden(res: ServerResponse, auth: RequestAuth, projectId: string): void {
  const why =
    auth.kind === "key"
      ? `the project key authorizes its own project only — "${projectId}" is out of its scope`
      : auth.kind === "session"
        ? `the signed-in account does not own the project "${projectId}"`
        : `the caller may not touch the project "${projectId}"`;
  sendError(res, 403, "VAULT_FORBIDDEN", why);
}

/**
 * The peer address the public-door counter keys on — the socket answer,
 * "unknown" when the platform hides it (the counter never crashes a door).
 *
 * @param req the incoming request.
 * @returns the peer key of the rate counter.
 */
function peerOf(req: IncomingMessage): string {
  return req.socket.remoteAddress ?? "unknown";
}

/** @section routes */

/** the route catalog of the vault http surface (health kept verbatim from the declaration it grew from). */
export const routes = {
  health: "/api/health",
  uicopy: "/api/v1/ui/copy",
  signup: "/api/v1/auth/signup",
  signin: "/api/v1/auth/signin",
  databases: "/api/v1/databases",
  query: "/v2/query",
  protocols: "/api/v1/protocols",
  projects: "/api/v1/storage/projects",
  objects: "/api/v1/storage/objects",
  quota: "/api/v1/storage/quota",
  usage: "/api/v1/storage/usage",
  sweep: "/api/v1/storage/sweep",
} as const;

/** the whole route count the domain serves: the base catalog plus one
 * static-safe route per protocol row (the protocols pillar — above one
 * thousand on the wave D catalog). */
export const routeCount = Object.keys(routes).length + PROTOCOL_ROUTE_COUNT;

/** @section server */

/**
 * Creates the vault http server — pure node:http, no framework. The server
 * owns the storage truth, and — when a static root answers on the host —
 * the built site face beside it (the container doctrine: one process, one
 * port, the platform gateway may keep owning the site lane on the static
 * hosts by simply not mounting a static root). Every request is answered
 * with the standardized json or byte shapes.
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
    /* the site face lane (the container doctrine): when a static root
     * answers, every non-api GET (and HEAD) resolves against it — real
     * files with real content types, the spa entry for the extensionless
     * routes, and the sealed database faces refuse outright. The lane is
     * public the way the platform hosts serve the same dist tree (the
     * token gate owns the storage truth, never the static face), and the
     * api surface keeps precedence: a static root never shadows /api/*. */
    if ((method === "GET" || method === "HEAD") && !pathname.startsWith("/api/")) {
      if (serveStatic(res, pathname, method === "HEAD")) {
        return;
      }
    }
    /* the internal root — the static site surface the deployable unit
     * answers when the platform gateway delegates the domain: the correct
     * content type for every file type from the mimetypes registry, the
     * faun law enforced (the raw .db never rides the static root — database
     * data flows only through the api lanes below) and the read-only law
     * (every write method answers its 405). The container-doctrine static
     * face above answered first when it holds the tree; this lane answers
     * the internal root the deployable unit carries, and the api surface
     * keeps precedence (an unknown /api/* path answers the route 404, never
     * a static face). */
    if (!pathname.startsWith("/api/") && pathname !== "/api" && serveInternal(res, method, safeDecode(pathname))) {
      return;
    }
    /* the account lane — the public doors of the person surface: the
     * signup and the signin demand no operator bearer (they are how a
     * stranger becomes a caller), but the per-peer counter owns the door
     * and the session secret must answer before anything signs — a sealed
     * environment seals these doors too (fail closed, never fail open). */
    if (pathname === routes.signup) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      await postSignup(req, res);
      return;
    }
    if (pathname === routes.signin) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      await postSignin(req, res);
      return;
    }
    /* the protocols pillar — every wire of the catalog answers its own
     * static-safe route: the list lane and the one-handler-per-row scheme
     * lane (read-only, no storage truth, no query execution — the registry
     * rows carry no secret, the same open law the copy lane rides). */
    if (method === "GET" && pathname === routes.protocols) {
      sendJson(res, 200, { protocols: PROTOCOLS.map(jsonOfProtocol), count: PROTOCOLS.length });
      return;
    }
    if (method === "GET" && pathname.startsWith(`${routes.protocols}/`)) {
      const row = protocolRouteOf(pathname);
      if (row === undefined) {
        sendError(res, 404, "VAULT_PROTOCOL", `no protocol route answers ${pathname}`);
        return;
      }
      sendJson(res, 200, jsonOfProtocol(row));
      return;
    }
    /* the person's door onto the network database — the register lane
     * (verified credentials, the database id and the api key shown exactly
     * once), the database reads, the key lanes and the quota lanes, each
     * answering its own bearer door (the api key digest gate). */
    if (pathname === routes.databases) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      await postDatabases(req, res);
      return;
    }
    if (pathname.startsWith(`${routes.databases}/`)) {
      const rest = safeDecode(pathname.slice(routes.databases.length + 1));
      const [databaseId, tail] = rest.split("/", 2);
      if (tail === "keys" || tail === "quota") {
        await databaseSubroute(req, res, method, databaseId, tail);
        return;
      }
      if (tail !== undefined) {
        sendError(res, 404, "VAULT_ROUTE", `no route answers ${pathname}`);
        return;
      }
      if (method === "GET") {
        getDatabaseRoute(req, res, databaseId);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    /* the helix-style query lane — bearer plus database-id headers over the
     * per-database sqlite files: the key-hash gate answers (the operator
     * token or an issued api key, both compared as digests), the query body
     * rides the better-sqlite3 core, the json answer carries the rows or the
     * change counters. */
    if (pathname === routes.query) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      await postQuery(req, res);
      return;
    }
    /* the faun lesson door: every data route past the health probe and the
     * public account doors demands an honest bearer — the operator token
     * (total), a project key (its scope) or a session (its account). The
     * sealed and the refused answers ride the same standardized error
     * shape the rest of the surface speaks. */
    const verdict = tokenVerdict(req);
    const auth = requestAuth(req, verdict);
    if (auth.kind === "sealed") {
      sendError(
        res,
        503,
        "VAULT_AUTH",
        "the vault token is not configured — set VAULT_TOKEN (or VAULT_SESSION_SECRET for the account door) before the storage truth answers",
      );
      return;
    }
    if (auth.kind === "none") {
      sendError(
        res,
        401,
        "VAULT_AUTH",
        "the storage truth demands an honest bearer (the operator token, a project key or a session token)",
      );
      return;
    }
    if (pathname === routes.projects) {
      if (method === "POST") {
        await postProject(req, res, auth);
        return;
      }
      if (method === "GET") {
        listProjectsRoute(res, url, auth);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    if (pathname.startsWith(`${routes.projects}/`)) {
      const segments = safeDecode(pathname.slice(routes.projects.length + 1))
        .split("/")
        .filter((segment) => segment !== "");
      if (segments.length === 2 && segments[1] === "keys") {
        const projectId = segments[0];
        if (method === "POST") {
          await postProjectKey(req, res, projectId, auth);
          return;
        }
        if (method === "GET") {
          listProjectKeysRoute(res, projectId, auth);
          return;
        }
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      if (segments.length === 3 && segments[1] === "keys") {
        if (method === "DELETE") {
          revokeProjectKeyRoute(res, segments[0], segments[2], auth);
          return;
        }
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
    }
    if (pathname === routes.objects) {
      if (method === "POST") {
        await postObject(req, res, auth);
        return;
      }
      if (method === "GET") {
        listObjectsRoute(res, url, auth);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    if (pathname.startsWith(`${routes.objects}/`)) {
      const id = safeDecode(pathname.slice(routes.objects.length + 1));
      if (method === "GET") {
        getObjectRoute(res, id, auth);
        return;
      }
      if (method === "DELETE") {
        deleteObjectRoute(res, id, auth);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    if (pathname === routes.quota) {
      if (method === "GET") {
        getQuotaRoute(res, url, auth);
        return;
      }
      if (method === "POST") {
        await postQuota(req, res, url, auth);
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
      usageRoute(res, url, auth);
      return;
    }
    if (pathname === routes.sweep) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      sweepRoute(res, auth);
      return;
    }
    /* the api surface keeps precedence over the static lanes above: an
     * unknown /api/* path answers the route 404 (past the gate) instead of
     * any static face. */
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

/** POST /api/v1/auth/signup — the public account door: the row lands with the scrypt digest only, never the plaintext. */
async function postSignup(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const rate = authRateVerdict(peerOf(req));
  if (!rate.allowed) {
    sendError(
      res,
      429,
      "VAULT_RATE",
      "too many attempts from this address — the account door rests until the window rolls",
      {
        "retry-after": String(rate.retryAfterSeconds),
      },
    );
    return;
  }
  if (!sessionSecretConfigured()) {
    sendError(
      res,
      503,
      "VAULT_AUTH",
      "the session secret is not configured — set VAULT_SESSION_SECRET (or VAULT_TOKEN) before the account door answers",
    );
    return;
  }
  try {
    const body = await readJson(req);
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const answer = createAccount(email, password);
    if (answer.account !== undefined) {
      sendJson(res, 201, { account: answer.account });
      return;
    }
    sendError(
      res,
      answer.refusal?.kind === "taken" ? 409 : 400,
      "VAULT_AUTH",
      answer.refusal?.why ?? "the account was refused",
    );
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** POST /api/v1/auth/signin — the public password door: the signed session bearer answers once, nothing ever saves in a browser. */
async function postSignin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const rate = authRateVerdict(peerOf(req));
  if (!rate.allowed) {
    sendError(
      res,
      429,
      "VAULT_RATE",
      "too many attempts from this address — the account door rests until the window rolls",
      {
        "retry-after": String(rate.retryAfterSeconds),
      },
    );
    return;
  }
  if (!sessionSecretConfigured()) {
    sendError(
      res,
      503,
      "VAULT_AUTH",
      "the session secret is not configured — set VAULT_SESSION_SECRET (or VAULT_TOKEN) before the account door answers",
    );
    return;
  }
  try {
    const body = await readJson(req);
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const answer = verifyCredentials(email, password);
    if (answer === undefined) {
      sendError(res, 401, "VAULT_AUTH", "the email and the password do not match an account");
      return;
    }
    const session = issueSession(answer.id);
    sendJson(res, 200, {
      account: { id: answer.id, email: answer.email },
      token: session.token,
      expiresAt: session.expiresAt,
      databases: databasesOfEmail(answer.email).map(jsonOfDatabase),
    });
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** POST /api/v1/storage/projects — creates the owner scope with its 900MB quota floor (a session-minted scope lands owned). */
async function postProject(req: IncomingMessage, res: ServerResponse, auth: RequestAuth): Promise<void> {
  if (auth.kind === "key") {
    sendError(res, 403, "VAULT_FORBIDDEN", "a project key authorizes its own project only — it mints no scopes");
    return;
  }
  try {
    const body = await readJson(req);
    const id = typeof body.id === "string" ? body.id : "";
    const name = typeof body.name === "string" ? body.name : id;
    if (auth.kind === "session") {
      const owner = projectOwner(id);
      if (owner !== undefined && owner !== auth.accountId) {
        sendError(res, 403, "VAULT_FORBIDDEN", `the project "${id}" already answers to another owner`);
        return;
      }
    }
    const answer = createProject(id, name, auth.kind === "session" ? auth.accountId : undefined);
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

/** the page bounds of the project list — a default of fifty, a ceiling of five hundred, a non-negative offset. */
const PROJECT_PAGE_DEFAULT = 50;
const PROJECT_PAGE_MAX = 500;

/** parses one page limit (the default answers a malformed or absent value). */
function pageLimitOf(raw: string | null): number {
  if (raw === null || raw === "") {
    return PROJECT_PAGE_DEFAULT;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return PROJECT_PAGE_DEFAULT;
  }
  return Math.min(parsed, PROJECT_PAGE_MAX);
}

/** parses one page offset (zero answers a malformed or negative value). */
function pageOffsetOf(raw: string | null): number {
  if (raw === null || raw === "") {
    return 0;
  }
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

/** GET /api/v1/storage/projects — the owner scopes, paginated: the admin walks every row, a session walks its own only. */
function listProjectsRoute(res: ServerResponse, url: URL, auth: RequestAuth): void {
  if (auth.kind === "key") {
    sendError(res, 403, "VAULT_FORBIDDEN", "a project key authorizes its own project only — it lists no scopes");
    return;
  }
  const limit = pageLimitOf(url.searchParams.get("limit"));
  const offset = pageOffsetOf(url.searchParams.get("offset"));
  const page = listProjects({ accountId: auth.kind === "session" ? auth.accountId : undefined, limit, offset });
  sendJson(res, 200, {
    projects: page.rows.map(jsonOfProjectSummary),
    total: page.total,
    limit,
    offset,
  });
}

/** POST /api/v1/storage/projects/:id/keys — mints one vk_ bearer: the secret answers exactly once, only its digest lands. */
async function postProjectKey(
  req: IncomingMessage,
  res: ServerResponse,
  projectId: string,
  auth: RequestAuth,
): Promise<void> {
  if (!authorizeKeyLane(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  try {
    const body = await readJson(req);
    const label = typeof body.label === "string" ? body.label : "key";
    const answer = createProjectKey(projectId, label);
    if (answer.key !== undefined && answer.secret !== undefined) {
      sendJson(res, 201, { key: answer.key, secret: answer.secret });
      return;
    }
    if (answer.refusal?.kind === "absent") {
      sendError(res, 404, "VAULT_PROJECT", answer.refusal.why);
      return;
    }
    sendError(res, 400, "VAULT_INVALID", answer.refusal?.why ?? "the key was refused");
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** GET /api/v1/storage/projects/:id/keys — the labels and the last-used stamps, never a secret. */
function listProjectKeysRoute(res: ServerResponse, projectId: string, auth: RequestAuth): void {
  if (!authorizeKeyLane(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  sendJson(res, 200, { keys: listProjectKeys(projectId) });
}

/** DELETE /api/v1/storage/projects/:id/keys/:keyid — the revocation: a revoked secret answers 401 on its next ride. */
function revokeProjectKeyRoute(res: ServerResponse, projectId: string, keyId: string, auth: RequestAuth): void {
  if (!authorizeKeyLane(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  if (revokeProjectKey(projectId, keyId)) {
    sendJson(res, 200, { revoked: true, id: keyId });
    return;
  }
  sendError(res, 404, "VAULT_ABSENT", `the key "${keyId}" is not on the project "${projectId}"`);
}

/** POST /api/v1/storage/objects — the deposit: raw body bytes, path and mime from the headers. */
async function postObject(req: IncomingMessage, res: ServerResponse, auth: RequestAuth): Promise<void> {
  const projectId = headerOf(req, "x-project-id");
  const objectPath = safeDecode(headerOf(req, "x-object-path"));
  const mime = headerOf(req, "x-object-mime") || "application/octet-stream";
  if (projectId === "" || objectPath === "") {
    sendError(res, 400, "VAULT_INVALID", "the deposit needs the x-project-id and x-object-path headers");
    return;
  }
  if (!authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
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
  sendError(res, 400, "VAULT_INVALID", answer.refusal.why);
}

/** GET /api/v1/storage/objects — the live rows of one project, newest first. */
function listObjectsRoute(res: ServerResponse, url: URL, auth: RequestAuth): void {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the list needs the project query parameter");
    return;
  }
  if (!authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  sendJson(res, 200, { objects: listObjects(projectId).map(jsonOfObject) });
}

/** GET /api/v1/storage/objects/:id — the verified bytes back, served as the stored mime (the project verdict runs first). */
function getObjectRoute(res: ServerResponse, id: string, auth: RequestAuth): void {
  if (id === "") {
    sendError(res, 400, "VAULT_INVALID", "the object id is empty");
    return;
  }
  const projectId = objectProjectOf(id);
  if (projectId !== undefined && !authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
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
  sendError(res, 404, "VAULT_ABSENT", answer.refusal.why);
}

/** DELETE /api/v1/storage/objects/:id — the soft delete with the refcount detach (the project verdict runs first). */
function deleteObjectRoute(res: ServerResponse, id: string, auth: RequestAuth): void {
  if (id === "") {
    sendError(res, 400, "VAULT_INVALID", "the object id is empty");
    return;
  }
  const projectId = objectProjectOf(id);
  if (projectId !== undefined && !authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
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
function getQuotaRoute(res: ServerResponse, url: URL, auth: RequestAuth): void {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the quota needs the project query parameter");
    return;
  }
  if (!authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
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
async function postQuota(req: IncomingMessage, res: ServerResponse, url: URL, auth: RequestAuth): Promise<void> {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the quota needs the project query parameter");
    return;
  }
  if (!authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
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
function usageRoute(res: ServerResponse, url: URL, auth: RequestAuth): void {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the usage needs the project query parameter");
    return;
  }
  if (!authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
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

/** POST /api/v1/storage/sweep — collects the orphan chunks and the tombstones (the operator lane alone: the sweep walks the whole catalog). */
function sweepRoute(res: ServerResponse, auth: RequestAuth): void {
  if (auth.kind !== "admin") {
    sendError(res, 403, "VAULT_FORBIDDEN", "the sweep walks the whole catalog — the operator token owns it");
    return;
  }
  const answer = sweepOrphans();
  sendJson(res, 200, { chunks: answer.chunks, bytes: answer.bytes.toString(), tombstones: answer.tombstones });
}

/** @section doors — the signup, database and query lanes (the person's door) */

/** the bearer door of the database lanes: the operator token opens any
 * database (the master door), an issued api key opens its own database —
 * both compared as digests, never plaintext. */
function databaseDoor(
  req: IncomingMessage,
  databaseId: string,
): { open: true; operator: boolean } | { refusal: { status: number; code: string; why: string } } {
  if (tokenVerdict(req) === "open") {
    return { open: true, operator: true };
  }
  const bearer = presentedBearerOf(req);
  if (bearer.length > 0) {
    const lookup = apiKeyLookup(bearer);
    if ("refusal" in lookup) {
      return { refusal: { status: 401, code: "VAULT_KEY", why: lookup.refusal.why } };
    }
    if (lookup.database.id !== databaseId) {
      return {
        refusal: {
          status: 403,
          code: "VAULT_KEY_SCOPE",
          why: `the key answers the database ${lookup.database.id}, not ${databaseId}`,
        },
      };
    }
    return { open: true, operator: false };
  }
  return {
    refusal: {
      status: 401,
      code: "VAULT_KEY",
      why: "the database lane demands the bearer (operator token or api key)",
    },
  };
}

/** reads the presented bearer off one request (the api's token-gate seat). */
function presentedBearerOf(req: IncomingMessage): string {
  const value = req.headers.authorization;
  const authorization = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }
  const header = req.headers["x-vault-token"];
  return (Array.isArray(header) ? (header[0] ?? "") : (header ?? "")).trim();
}

/** POST /api/v1/databases — the register lane (the person's door: the api key shown exactly once). */
async function postDatabases(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await readJson(req);
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name : "";
    const quotaBytes =
      body.quotaBytes === null || body.quotaBytes === undefined
        ? undefined
        : BigInt(String(body.quotaBytes));
    let answer = registerDatabase(email, password, name, quotaBytes);
    if (answer.refusal?.kind === "credentials") {
      /* the two doors answer one person: a caller the accounts door
       * verified (the operator surface) provisions the person row on
       * first use, so the register lane always finds the credential. */
      if (verifyCredentials(email, password) !== undefined) {
        ensurePersonAccount(email, password);
        answer = registerDatabase(email, password, name, quotaBytes);
      }
    }
    if (answer.answer !== undefined) {
      sendJson(res, 201, {
        database: jsonOfDatabase(answer.answer.database),
        key: answer.answer.key,
        keyId: answer.answer.keyId,
        shown: "once",
      });
      return;
    }
    const status = answer.refusal?.kind === "credentials" ? 401 : 400;
    sendError(res, status, "VAULT_REGISTER", answer.refusal?.why ?? "the registration was refused");
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    if (error instanceof SyntaxError || (error instanceof Error && error.message.startsWith("Cannot convert"))) {
      sendError(res, 400, "VAULT_REGISTER", "the quota must ride decimal bytes or null");
      return;
    }
    throw error;
  }
}

/** GET /api/v1/databases/:id — the database row with its honest usage (the bearer door). */
async function getDatabaseRoute(req: IncomingMessage, res: ServerResponse, databaseId: string): Promise<void> {
  if (databaseId === "") {
    sendError(res, 400, "VAULT_INVALID", "the database id is empty");
    return;
  }
  const door = databaseDoor(req, databaseId);
  if ("refusal" in door) {
    sendError(res, door.refusal.status, door.refusal.code, door.refusal.why);
    return;
  }
  const database = databaseOf(databaseId);
  if (database === undefined) {
    sendError(res, 404, "VAULT_DATABASE", `the database ${databaseId} never registered`);
    return;
  }
  sendJson(res, 200, { database: jsonOfDatabase(database) });
}

/** the database subroutes — /keys (issue another key, shown once) and /quota
 * (the per-bucket quota lane: read the row, set the limit). The account
 * credentials open the door beside the bearer lanes (the owner's word). */
async function databaseSubroute(
  req: IncomingMessage,
  res: ServerResponse,
  method: string,
  databaseId: string,
  tail: "keys" | "quota",
): Promise<void> {
  if (databaseId === "") {
    sendError(res, 400, "VAULT_INVALID", "the database id is empty");
    return;
  }
  try {
    const body = method === "POST" ? await readJson(req) : {};
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const account = email !== "" && password !== "" ? accountVerified(email, password) : undefined;
    const ownerVerified =
      account !== undefined && account.id === databaseOf(databaseId)?.accountId ? true : undefined;
    const door = ownerVerified ? ({ open: true, operator: false } as const) : databaseDoor(req, databaseId);
    if ("refusal" in door) {
      sendError(res, door.refusal.status, door.refusal.code, door.refusal.why);
      return;
    }
    if (tail === "keys") {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${routes.databases}/${databaseId}/keys`);
        return;
      }
      const label = typeof body.label === "string" && body.label.length > 0 ? body.label : "a key";
      const issued = issueApiKey(databaseId, label);
      if (issued === undefined) {
        sendError(res, 404, "VAULT_DATABASE", `the database ${databaseId} never registered`);
        return;
      }
      sendJson(res, 201, { key: issued.key, keyId: issued.keyId, shown: "once" });
      return;
    }
    if (method === "GET") {
      const database = databaseOf(databaseId);
      if (database === undefined) {
        sendError(res, 404, "VAULT_DATABASE", `the database ${databaseId} never registered`);
        return;
      }
      sendJson(res, 200, { database: jsonOfDatabase(database) });
      return;
    }
    if (method === "POST") {
      const raw = body.limitBytes === null || body.limitBytes === undefined ? "unlimited" : String(body.limitBytes);
      const parsed = quotaLimitFrom(raw);
      if ("refusal" in parsed) {
        sendError(res, 400, "VAULT_INVALID", parsed.refusal);
        return;
      }
      const database = setDatabaseQuota(databaseId, parsed.limitBytes);
      if (database === undefined) {
        sendError(res, 404, "VAULT_DATABASE", `the database ${databaseId} never registered`);
        return;
      }
      sendJson(res, 200, { database: jsonOfDatabase(database) });
      return;
    }
    sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${routes.databases}/${databaseId}/quota`);
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** POST /v2/query — the helix-style lane: bearer plus database-id headers,
 * the query body over the per-database sqlite core, the json answer. */
async function postQuery(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await readJson(req);
    const sql = typeof body.query === "string" ? body.query : "";
    const params = Array.isArray(body.params) ? body.params : [];
    const bodyDatabaseId = typeof body.databaseId === "string" ? body.databaseId : "";
    const headerDatabaseId = headerOf(req, "x-database-id").trim() || bodyDatabaseId;
    const verdict = queryVerdict(req, headerDatabaseId);
    if (verdict.kind === "refused") {
      sendError(res, 401, "VAULT_QUERY_AUTH", verdict.why);
      return;
    }
    if (verdict.kind === "scope") {
      sendError(res, 403, "VAULT_QUERY_SCOPE", verdict.why);
      return;
    }
    if (verdict.kind === "absent") {
      sendError(res, 404, "VAULT_DATABASE", verdict.why);
      return;
    }
    const answer = runQuery({ databaseId: verdict.databaseId, sql, params });
    if ("refusal" in answer) {
      if (answer.refusal.kind === "quota") {
        sendJson(res, 413, {
          error: {
            code: "VAULT_QUOTA",
            message: answer.refusal.why,
            quota: answer.refusal.quotaBytes === null ? null : answer.refusal.quotaBytes.toString(),
            usage: answer.refusal.usageBytes.toString(),
          },
        });
        return;
      }
      if (answer.refusal.kind === "absent") {
        sendError(res, 404, "VAULT_DATABASE", answer.refusal.why);
        return;
      }
      sendError(res, 400, answer.refusal.kind === "sql" ? "VAULT_SQL" : "VAULT_QUERY_BODY", answer.refusal.why);
      return;
    }
    if (answer.kind === "read") {
      sendJson(res, 200, {
        databaseId: answer.databaseId,
        kind: "read",
        columns: answer.columns,
        rows: answer.rows,
        elapsedMs: answer.elapsedMs,
      });
      return;
    }
    sendJson(res, 200, {
      databaseId: answer.databaseId,
      kind: "write",
      changes: answer.changes,
      lastInsertRowid: answer.lastInsertRowid,
      elapsedMs: answer.elapsedMs,
    });
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** the json projection of one protocol row (the static-safe route answer). */
function jsonOfProtocol(row: ProtocolRow): Record<string, unknown> {
  return {
    scheme: row.scheme,
    name: row.name,
    port: row.port,
    spec: row.spec,
    group: row.group,
    ...(row.security !== undefined ? { security: row.security } : {}),
    ...(row.state !== undefined ? { state: row.state } : {}),
  };
}

/** the json projection of one database row (bigint pointers as decimal strings). */
function jsonOfDatabase(database: {
  id: string;
  accountId: string;
  name: string;
  quotaBytes: bigint | null;
  createdAt: string;
}): Record<string, unknown> {
  return {
    id: database.id,
    accountId: database.accountId,
    name: database.name,
    quotaBytes: database.quotaBytes === null ? null : database.quotaBytes.toString(),
    createdAt: database.createdAt,
  };
}

/** @section static */

/* ------------------------------------------------------------------ */
/* the dist lane — the container doctrine                              */
/* ------------------------------------------------------------------ */

/** the extension → media type table of the site faces (the mime.types
 * doctrine of the app root carried here, so the engine owns its content
 * types with zero boot reads — the text faces declare their utf-8 the way
 * the built pages carry it). */
const STATIC_MIME: Readonly<Record<string, string>> = Object.freeze({
  css: "text/css; charset=utf-8",
  htm: "text/html; charset=utf-8",
  html: "text/html; charset=utf-8",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  map: "application/json; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain; charset=utf-8",
  wasm: "application/wasm",
  webmanifest: "application/manifest+json",
  woff: "font/woff",
  woff2: "font/woff2",
  xml: "application/xml; charset=utf-8",
});

/** the database faces the static lane never serves (the faun seal — even a
 * stray store inside the static root answers 404, never bytes: the wal and
 * the shm sidecars refuse with their file). */
const SEALED_FACES = [".db", ".db-journal", ".db-shm", ".db-wal"] as const;

/**
 * Resolves the static root of the site face — VAULT_STATIC_DIR (the
 * container pins it to the dist volume), defaulting to ./dist beside the
 * working directory.
 *
 * @returns the configured static root.
 */
function staticRoot(): string {
  return process.env.VAULT_STATIC_DIR ?? "./dist";
}

/**
 * Serves the static lane of one request: when the static root exists on
 * this host, every non-api path resolves inside it — a real file answers
 * with its content type and the shared security headers, the extensionless
 * routes fall back to the spa entry (the same rewrite the pages, netlify
 * and vercel lanes ride), and a missing asset answers an honest 404. The
 * database faces refuse before the filesystem is ever consulted. A host
 * without a static root (the library seats, the tests) keeps the plain
 * route answers.
 *
 * @param res the response to answer.
 * @param pathname the raw url pathname.
 * @param head true when the request is a HEAD.
 * @returns true when this lane answered (false falls through to the route surface).
 */
function serveStatic(res: ServerResponse, pathname: string, head: boolean): boolean {
  const root = path.resolve(staticRoot());
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) {
    return false;
  }
  if (sealedFace(pathname)) {
    sendError(res, 404, "VAULT_STATIC", "a database file never answers from the static lane — the faun seal holds");
    return true;
  }
  const candidate = staticCandidate(root, pathname);
  if (candidate !== undefined && sealedFace(candidate)) {
    sendError(res, 404, "VAULT_STATIC", "a database file never answers from the static lane — the faun seal holds");
    return true;
  }
  if (candidate !== undefined && statSync(candidate, { throwIfNoEntry: false })?.isFile()) {
    sendStaticFile(res, candidate, head);
    return true;
  }
  if (isSpaRoute(pathname)) {
    const entry = path.join(root, "index.html");
    if (statSync(entry, { throwIfNoEntry: false })?.isFile()) {
      sendStaticFile(res, entry, head);
      return true;
    }
  }
  sendError(res, 404, "VAULT_STATIC", `no static face answers ${pathname}`);
  return true;
}

/**
 * Answers whether one pathname is a database face the lane refuses (case
 * insensitive — the sidecars ride the same seal as the store file).
 *
 * @param pathname the raw url pathname.
 * @returns true when the pathname names a database face.
 */
function sealedFace(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return SEALED_FACES.some((face) => lower.endsWith(face));
}

/**
 * Resolves one pathname inside the static root — the traversal attempts
 * (encoded or plain) never explore outside the root.
 *
 * @param root the resolved static root.
 * @param pathname the raw url pathname.
 * @returns the absolute candidate, or undefined when the path escapes the root.
 */
function staticCandidate(root: string, pathname: string): string | undefined {
  const decoded = safeDecode(pathname);
  if (decoded.includes("\0")) {
    return undefined;
  }
  const relative = path.posix.normalize(decoded).replace(/^\/+/, "");
  if (relative.split("/").includes("..")) {
    return undefined;
  }
  const resolved = path.resolve(root, relative);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return undefined;
  }
  return resolved;
}

/**
 * Answers whether one pathname is an spa route — the entry rewrites it the
 * way the platform lanes do: the root, or any path whose last segment
 * carries no extension. A file-like miss (a broken hashed face, a missing
 * icon) stays an honest 404 instead of the entry.
 *
 * @param pathname the raw url pathname.
 * @returns true when the spa fallback owns the path.
 */
function isSpaRoute(pathname: string): boolean {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  return !segment.includes(".");
}

/**
 * Answers one static file — its content type off the extension table, its
 * byte length, and the security headers the _headers doctrine stamps on
 * the platform lanes (the engine carries the same trio when it serves the
 * face itself).
 *
 * @param res the response to answer.
 * @param file the resolved file inside the static root.
 * @param head true when the request is a HEAD (the headers ride, the bytes never).
 */
function sendStaticFile(res: ServerResponse, file: string, head: boolean): void {
  const bytes = readFileSync(file);
  const extension = file.slice(file.lastIndexOf(".") + 1);
  res.writeHead(200, {
    "content-type": STATIC_MIME[extension] ?? "application/octet-stream",
    "content-length": String(bytes.length),
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
  });
  res.end(head ? undefined : bytes);
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

/** the json projection of one project with its quota row. */
function jsonOfProject(project: {
  id: string;
  name: string;
  region: string;
  createdAt: string;
  quota: { projectId: string; limitBytes: bigint | null; updatedAt: string };
}): Record<string, unknown> {
  return {
    id: project.id,
    name: project.name,
    region: project.region,
    createdAt: project.createdAt,
    quota: {
      limitBytes: project.quota.limitBytes === null ? null : project.quota.limitBytes.toString(),
      updatedAt: project.quota.updatedAt,
    },
  };
}

/** the json projection of one project list row — the lean shape with the owner pointer. */
function jsonOfProjectSummary(row: {
  id: string;
  name: string;
  region: string;
  accountId: string | null;
  createdAt: string;
}): Record<string, unknown> {
  return { id: row.id, name: row.name, region: row.region, accountId: row.accountId, createdAt: row.createdAt };
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

/** the cors headers the platform gateway and the sol pages call through — the token headers ride the allow list so an honest caller may present the bearer. */
function applyCors(res: ServerResponse): void {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader(
    "access-control-allow-headers",
    "content-type, authorization, x-vault-token, x-project-id, x-object-path, x-object-mime",
  );
}

/** answers one json payload with the status (the declared length rides the
 * utf-8 byte count — the copy lanes carry em-dashes and middots, and a
 * utf-16 char count would truncate every multibyte payload). */
function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": String(Buffer.byteLength(payload, "utf8")),
  });
  res.end(payload);
}

/** answers one standardized failure — { error: { code, message } } (the
 * extra headers ride the writeHead, the rate lane's retry-after among them). */
function sendError(
  res: ServerResponse,
  status: number,
  code: string,
  message: string,
  headers: Record<string, string> = {},
): void {
  const payload = JSON.stringify({ error: { code, message } });
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": String(Buffer.byteLength(payload, "utf8")),
    ...headers,
  });
  res.end(payload);
}

/* the direct boot — `node api.ts` serves the storage truth (and the built
 * site face when a static root answers) on the resolved port. */
const invokedDirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const server = createVaultServer();
  const port = await listenVault(server);
  const authState = vaultTokenConfigured()
    ? "token gate armed"
    : sessionSecretConfigured()
      ? "account door armed (no operator token — set VAULT_TOKEN for the admin lane)"
      : "SEALED — set VAULT_TOKEN to open the storage routes";
  const staticState = statSync(path.resolve(staticRoot()), { throwIfNoEntry: false })?.isDirectory()
    ? `serving the site face from ${path.resolve(staticRoot())}`
    : "no static root (set VAULT_STATIC_DIR to serve the built site beside the engine)";
  console.log(
    `vault api listening on port ${port} (storage driver: ${storageDriverKind()}, auth: ${authState}, site: ${staticState})`,
  );
  process.once("SIGINT", () => {
    server.close();
  });
}
