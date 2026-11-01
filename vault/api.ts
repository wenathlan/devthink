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
// of the family, and no request reaches it without the bearer the operator
// pinned (VAULT_TOKEN). The health probe stays open so the platform can
// watch the service; every data route — the deposits, the listings, the
// verified reads, the removals, the quotas, the usage and the sweep —
// answers 401 without an honest bearer and 503 while the token never
// landed in the environment (fail closed, never fail open).
//
// @section auth — the token gate (the faun lesson)
// @section routes — the route catalog
// @section server — the node:http server and its boot
// @section handlers — the storage surface

import { createHash, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { createServer } from "node:http";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { storage, storageDriverKind } from "./drizzle.ts";
import {
  createProject,
  deleteObject,
  getObject,
  type LedgerObject,
  listObjects,
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

/** @section routes */

/** the route catalog of the vault http surface (health kept verbatim from the declaration it grew from). */
export const routes = {
  health: "/api/health",
  uicopy: "/api/v1/ui/copy",
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
    /* the faun lesson door: every route past the health probe demands the
     * honest bearer — the sealed and the refused answers ride the same
     * standardized error shape the rest of the surface speaks. */
    const verdict = tokenVerdict(req);
    if (verdict === "sealed") {
      sendError(
        res,
        503,
        "VAULT_AUTH",
        "the vault token is not configured — set VAULT_TOKEN before the storage truth answers",
      );
      return;
    }
    if (verdict === "refused") {
      sendError(
        res,
        401,
        "VAULT_AUTH",
        "the storage truth demands the vault token (Authorization: Bearer or x-vault-token)",
      );
      return;
    }
    if (pathname === routes.projects) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      await postProject(req, res);
      return;
    }
    if (pathname === routes.objects) {
      if (method === "POST") {
        await postObject(req, res);
        return;
      }
      if (method === "GET") {
        listObjectsRoute(res, url);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    if (pathname.startsWith(`${routes.objects}/`)) {
      const id = safeDecode(pathname.slice(routes.objects.length + 1));
      if (method === "GET") {
        getObjectRoute(res, id);
        return;
      }
      if (method === "DELETE") {
        deleteObjectRoute(res, id);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    if (pathname === routes.quota) {
      if (method === "GET") {
        getQuotaRoute(res, url);
        return;
      }
      if (method === "POST") {
        await postQuota(req, res, url);
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
      usageRoute(res, url);
      return;
    }
    if (pathname === routes.sweep) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
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

/** POST /api/v1/storage/objects — the deposit: raw body bytes, path and mime from the headers. */
async function postObject(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const projectId = headerOf(req, "x-project-id");
  const objectPath = safeDecode(headerOf(req, "x-object-path"));
  const mime = headerOf(req, "x-object-mime") || "application/octet-stream";
  if (projectId === "" || objectPath === "") {
    sendError(res, 400, "VAULT_INVALID", "the deposit needs the x-project-id and x-object-path headers");
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
function listObjectsRoute(res: ServerResponse, url: URL): void {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the list needs the project query parameter");
    return;
  }
  sendJson(res, 200, { objects: listObjects(projectId).map(jsonOfObject) });
}

/** GET /api/v1/storage/objects/:id — the verified bytes back, served as the stored mime. */
function getObjectRoute(res: ServerResponse, id: string): void {
  if (id === "") {
    sendError(res, 400, "VAULT_INVALID", "the object id is empty");
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

/** DELETE /api/v1/storage/objects/:id — the soft delete with the refcount detach. */
function deleteObjectRoute(res: ServerResponse, id: string): void {
  if (id === "") {
    sendError(res, 400, "VAULT_INVALID", "the object id is empty");
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
function getQuotaRoute(res: ServerResponse, url: URL): void {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the quota needs the project query parameter");
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
async function postQuota(req: IncomingMessage, res: ServerResponse, url: URL): Promise<void> {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the quota needs the project query parameter");
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
function usageRoute(res: ServerResponse, url: URL): void {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the usage needs the project query parameter");
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
