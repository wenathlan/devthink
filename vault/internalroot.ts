// # internalroot — the internal static root of the vault storage engine (the
// wave D rewire): the deployable unit owns its whole domain now — the api
// lanes answer under /api and /v2, the protocol catalog answers its
// static-safe routes, and the internal root serves the site surface itself
// (index.html, the assets, the docs) with the correct content type for every
// file type from the mimetypes registry. The platform gateway may keep
// fronting the domain; when it delegates, the vault answers honestly.
//
// The faun law owns the door: the static root must NEVER serve the raw
// database files — the old faun mistake let anyone download the whole .db —
// so every request for a database file (.db, .sqlite, .sqlite3, and their
// -wal/-shm/-journal siblings) is refused on the static root, and database
// data flows ONLY through the internal api lanes. Path traversal is refused
// the same way: the root resolves inside itself or the request answers the
// honest refusal.
//
// @section law — the database-file refusal and the safe resolution
// @section serve — the static handler and its routes

import { createReadStream } from "node:fs";
import { statSync, type Stats } from "node:fs";
import path from "node:path";
import type { ServerResponse } from "node:http";
import { contentTypeFor } from "./mimetypes.ts";

/** @section law */

/** The database file extensions the static root never serves (the faun law):
 * the sqlite spellings and their wal/shm/journal siblings — the database
 * truth flows only through the internal api lanes. */
export const DATABASE_FILE_EXTENSIONS: readonly string[] = [
  ".db",
  ".sqlite",
  ".sqlite3",
  ".db-wal",
  ".db-shm",
  ".db-journal",
  ".sqlite-wal",
  ".sqlite-shm",
  ".sqlite3-wal",
  ".sqlite3-shm",
];

/** the refusal code a database-file request answers on the static root. */
export const DBFILE_REFUSAL_CODE = "VAULT_DBFILE";

/**
 * The database-file verdict of one path — the faun law as code: any path
 * whose extension (case-insensitive) is a database file spelling is refused
 * on the static root, before any filesystem touch, before any stat.
 *
 * @param pathname the request path.
 * @returns true when the static root refuses to serve the path.
 */
export function databaseFileRefused(pathname: string): boolean {
  const name = (pathname.split("/").pop() ?? "").toLowerCase();
  return DATABASE_FILE_EXTENSIONS.some((extension) => name.endsWith(extension));
}

/** The resolution answer of one static path: the absolute file inside the
 * root, or the typed refusal the caller answers. */
export type InternalPathAnswer =
  | { file: string; stats: Stats; mime: string }
  | { refusal: { status: number; code: string; why: string } };

/**
 * Resolves one request path inside the internal root — the safe resolution:
 * null bytes, dot segments and traversal escapes refuse (the honest 404, the
 * same answer an absent file gives, never a hint of the tree outside), a
 * directory resolves to its index.html when one lives inside, and the
 * content type answers from the mimetypes registry.
 *
 * @param root the absolute root directory the static lane serves.
 * @param pathname the request path (already url-decoded by the caller).
 * @returns the resolved file with its stats and mime, or the refusal.
 */
export function resolveInternalPath(root: string, pathname: string): InternalPathAnswer {
  if (pathname.includes("\0")) {
    return { refusal: { status: 404, code: "VAULT_ABSENT", why: "the path carries no honest file" } };
  }
  const segments: string[] = [];
  for (const segment of pathname.split("/")) {
    if (segment.length === 0 || segment === ".") continue;
    if (segment === "..") {
      return { refusal: { status: 404, code: "VAULT_ABSENT", why: "the path carries no honest file" } };
    }
    segments.push(segment);
  }
  const inside = path.resolve(root, ...segments);
  if (inside !== root && !inside.startsWith(`${root}${path.sep}`)) {
    return { refusal: { status: 404, code: "VAULT_ABSENT", why: "the path carries no honest file" } };
  }
  let file = inside;
  let stats = statOf(file);
  if (stats !== undefined && stats.isDirectory()) {
    file = path.join(inside, "index.html");
    stats = statOf(file);
  }
  if (stats === undefined || !stats.isFile()) {
    return { refusal: { status: 404, code: "VAULT_ABSENT", why: `no file answers ${pathname}` } };
  }
  return { file, stats, mime: contentTypeFor(file) };
}

/** stats one file, answering undefined on any error (the honest absent). */
function statOf(file: string): Stats | undefined {
  try {
    return statSync(file);
  } catch {
    return undefined;
  }
}

/** @section serve */

/** The directory the internal root serves: VAULT_INTERNAL_ROOT when the
 * operator pinned one, the vault app root beside this module otherwise (the
 * deployable unit — index.html, the assets, the docs). Under the vitest
 * banner the default carries the worker pid the isolation law pins, so a
 * fleet of workers never shares one root by accident. */
export function internalRootDir(): string {
  const pinned = process.env.VAULT_INTERNAL_ROOT;
  if (typeof pinned === "string" && pinned.length > 0) {
    return path.resolve(pinned);
  }
  const here = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const appRoot = path.dirname(path.resolve(here));
  if (
    typeof process !== "undefined" &&
    typeof process.env.VITEST === "string" &&
    typeof process.pid === "number"
  ) {
    return `${appRoot}.${process.pid}`;
  }
  return appRoot;
}

/**
 * Serves one static request off the internal root — the whole static lane:
 * the faun gate first (a database file answers the 403 refusal, never the
 * bytes), then the safe resolution, then the file body with the registry
 * content type. GET and HEAD answer; every other method answers 405 so the
 * static surface stays read-only.
 *
 * @param res the server response the lane answers.
 * @param method the request method (GET and HEAD serve).
 * @param pathname the url-decoded request path.
 * @param root the root directory the lane serves (default: internalRootDir()).
 * @returns true when the lane answered the request (the caller stops here).
 */
export function serveInternal(
  res: ServerResponse,
  method: string,
  pathname: string,
  root: string = internalRootDir(),
): boolean {
  if (method !== "GET" && method !== "HEAD") {
    sendJsonError(res, 405, "VAULT_METHOD", `${method} does not ride the static root`);
    return true;
  }
  if (databaseFileRefused(pathname)) {
    sendJsonError(
      res,
      403,
      DBFILE_REFUSAL_CODE,
      "the static root never serves the raw database files — the data flows through the internal api",
    );
    return true;
  }
  const answer = resolveInternalPath(root, pathname);
  if ("refusal" in answer) {
    sendJsonError(res, answer.refusal.status, answer.refusal.code, answer.refusal.why);
    return true;
  }
  const { file, stats, mime } = answer;
  res.writeHead(200, {
    "content-type": mime,
    "content-length": String(stats.size),
    "x-content-type-options": "nosniff",
  });
  if (method === "HEAD") {
    res.end();
    return true;
  }
  const stream = createReadStream(file);
  stream.on("error", () => {
    if (!res.headersSent) {
      sendJsonError(res, 500, "VAULT_FAULT", "the static read faulted");
    } else {
      res.destroy();
    }
  });
  stream.pipe(res);
  return true;
}

/** answers one standardized json failure — the shape every api lane speaks. */
function sendJsonError(res: ServerResponse, status: number, code: string, message: string): void {
  const payload = JSON.stringify({ error: { code, message } });
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": String(Buffer.byteLength(payload, "utf8")),
  });
  res.end(payload);
}
