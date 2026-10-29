/**
 * vaulthandoff.ts — the vault storage handoff of the saddle engine: every
 * edge artifact lands in the better sqlite vault store server-side, the
 * internal api serves objects by id, and the faun download of the raw
 * database stays blocked.
 *
 * the saddle edge plane owns processing and the vault owns storage; this
 * module is the seam between them. a sink opens (or creates) a
 * better-sqlite3 database — the storage engine the vault app itself runs
 * on, with the native node:sqlite driver as the runtime fallback — and
 * lands every artifact of an edge run as one parameterized row of the
 * edgeartifacts table. no artifact ever persists in the visitor browser
 * and no raw database file is ever served as a static download: objects
 * answer over the internal api path /api/v1/vault/objects/<runid> only,
 * and the faun guard refuses any path that targets a raw database file.
 *
 * contexts (7): driver, errors, schema, sink, adapter, faun, visitor.
 *
 * rules: lowercase identifiers, english jsdoc in third person, no emoji,
 * try/catch on every fallible path with the standardized {code,message}
 * error shape, prepared statements memoized once per sink instance, the
 * file mode 0o600 right after open (the house pattern of db.ts).
 */

import { Buffer } from "node:buffer";
import { chmodSync } from "node:fs";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { artifactmanifest, artifactnotfound, idfactory, saddleerror, sha256, systemclock } from "./foundation.js";
import { collectbytes, storageadapter } from "./virtual.js";

/* ════════════════════════════════════════════════════════════════════ */
/* context: rowtypes — the typed projections of the handoff store      */
/* ════════════════════════════════════════════════════════════════════ */

/** one edge artifact handed to the vault store: the run id is the object
 * id the internal api serves, the modality names the edge lane that
 * produced the artifact and the bytes ride the blob cell (text artifacts
 * stay text cells so the roundtrip preserves the caller's shape). */
export type VaultArtifact = {
  runid: string;
  modality: string;
  mime: string;
  bytes: Uint8Array | string;
  createdat: number;
};

/** the adapter put envelope: the key is the run id and the data is bytes,
 * text or an async iterable of chunks (collectbytes folds the chunks). */
export type VaultPut = {
  key?: string;
  data?: Uint8Array | string | AsyncIterable<Uint8Array>;
  modality?: string;
  contenttype?: string;
  createdat?: number;
  metadata?: Record<string, unknown>;
};

/** the stored object manifest every adapter method answers with (the
 * foundation artifactmanifest shape: key, sizebytes, sha256, contenttype,
 * createdat and metadata). */
export type VaultManifest = {
  key: string;
  sizebytes: number;
  sha256: string;
  contenttype: string;
  createdat: number;
  metadata: Record<string, unknown>;
};

/** the write receipt of putartifact. */
export type VaultReceipt = { runid: string; size: number };

/** the store usage counters of counts. */
export type VaultCounts = { artifacts: number; bytes: number };

/** the faun guard verdict: blocked true when the path targets a raw
 * database download, carrying the machine readable code and the house
 * message; blocked false carries no code. */
export type FaunVerdict = { blocked: boolean; code?: string; message?: string };

/** the sink: the storageadapter surface (put, get, head, delete, list)
 * of virtual.ts plus the artifact table api, the internal object url,
 * the usage counters and the connection close. */
export type VaultSink = {
  driver: string;
  dbpath: string;
  putartifact(artifact: VaultArtifact): VaultReceipt;
  getartifact(runid: string): VaultArtifact | null;
  artifacturl(runid: string): string;
  counts(): VaultCounts;
  put(input?: VaultPut): Promise<VaultManifest>;
  get(key: string): Promise<Uint8Array>;
  head(key: string): Promise<VaultManifest | null>;
  delete(key: string): Promise<boolean>;
  list(prefix?: string): Promise<VaultManifest[]>;
  close(): void;
  [Symbol.dispose](): void;
};

/** the standardized vault error: the machine readable code plus the
 * non-enumerable internal detail, built on the house saddleerror. */
export type VaultError = Error & { code: string; internal?: string };

/* ════════════════════════════════════════════════════════════════════ */
/* context: errors — the {code,message} shape of the handoff surface   */
/* ════════════════════════════════════════════════════════════════════ */

/** the public messages keyed by code: static strings only, safe to
 * surface because they never carry driver or filesystem detail. */
const publicmessages: Record<string, string> = {
  "vault-open-failed": "vault store unavailable",
  "vault-schema-failed": "vault store unavailable",
  "vault-prepare-failed": "vault store error",
  "vault-sink-failed": "vault store error",
  VISITOR_STORE_REFUSED: "browser storage is refused on the artifact path",
};

/**
 * builds the standardized vault error: the internal detail is logged
 * server-side only and the thrown error exposes the public message and
 * the machine-readable code (the dberror pattern of db.ts).
 *
 * @param code machine readable code.
 * @param internal the server-side diagnostic detail.
 * @returns the decorated error.
 */
function vaulterror(code: string, internal: string): VaultError {
  if (typeof internal === "string" && internal.length > 0) {
    console.error(`[vaulthandoff] ${code}: ${internal}`);
  }
  const error = saddleerror(publicmessages[code] ?? code, { code });
  Object.defineProperty(error, "internal", {
    value: typeof internal === "string" ? internal : "",
    enumerable: false,
    writable: false,
    configurable: false,
  });
  return error as VaultError;
}

/** renders one unknown failure as diagnostic text. */
function errortext(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/* ════════════════════════════════════════════════════════════════════ */
/* context: driver — the better sqlite handle of the vault store      */
/* ════════════════════════════════════════════════════════════════════ */

/** the uniform statement surface both sqlite drivers answer. */
type SqliteStatement = {
  run(...params: unknown[]): { changes?: number | bigint };
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
};

/** the uniform database surface both sqlite drivers answer. */
type SqliteDatabase = {
  prepare(sql: string): SqliteStatement;
  exec(sql: string): void;
  close(): void;
};

/** one edgeartifacts row: the bytes cell is a blob for byte artifacts
 * and text for text artifacts (sqlite keeps the bound shape). */
type EdgeArtifactRow = {
  runid: string;
  modality: string;
  mime: string;
  bytes: unknown;
  createdat: number;
};

/**
 * opens the vault store: better-sqlite3 first (the storage engine the
 * vault app itself runs on), the native node:sqlite driver only when the
 * better driver fails at runtime. the busy timeout pragma follows the
 * house pattern of db.ts.
 *
 * @param path the database path (":memory:" keeps the store in ram).
 * @returns the opened database and the driver name that served it.
 */
function opendatabase(path: string): { database: SqliteDatabase; driver: string } {
  try {
    // the better driver loads lazily through createRequire so a host
    // whose install skipped the native binding (the ci lane installs
    // with ignore-scripts) degrades to the native driver instead of
    // crashing the module graph at import time.
    const require = createRequire(import.meta.url);
    const BetterSqlite = require("better-sqlite3") as new (path: string) => unknown;
    const database = new BetterSqlite(path) as unknown as SqliteDatabase;
    database.exec("pragma busy_timeout = 2000;");
    return { database, driver: "better-sqlite3" };
  } catch (better) {
    try {
      const database = new DatabaseSync(path) as unknown as SqliteDatabase;
      database.exec("pragma busy_timeout = 2000;");
      return { database, driver: "node:sqlite" };
    } catch (native) {
      throw vaulterror(
        "vault-open-failed",
        `opening "${path}" with better-sqlite3 failed: ${errortext(better)}; the node:sqlite fallback failed: ${errortext(native)}`,
      );
    }
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* context: schema — the edgeartifacts table                          */
/* ════════════════════════════════════════════════════════════════════ */

/** the one table of the handoff store: every edge artifact is one row,
 * keyed by the run id the internal api serves objects by. */
const schema = `
create table if not exists edgeartifacts (
  runid text primary key,
  modality text not null,
  mime text not null,
  bytes blob not null,
  size integer not null,
  createdat integer not null
);
`;

/** the upsert of putartifact: a repeated run id refreshes the row
 * instead of duplicating it (the run is the object identity). */
const upsertsql =
  "insert into edgeartifacts (runid, modality, mime, bytes, size, createdat) values (?, ?, ?, ?, ?, ?) " +
  "on conflict(runid) do update set modality = excluded.modality, mime = excluded.mime, " +
  "bytes = excluded.bytes, size = excluded.size, createdat = excluded.createdat";

/** the row projection every read answers with. */
const selectsql = "select runid, modality, mime, bytes, createdat from edgeartifacts";

/** the internal api root the object url law pins: artifacts answer over
 * /api/v1/vault/objects/<runid> and never over a file path. */
const objectapiroot = "/api/v1/vault/objects";

/* ════════════════════════════════════════════════════════════════════ */
/* context: sink — the vault storage handoff of the saddle engine      */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * opens (or creates) the vault store and returns the sink: the
 * storageadapter surface of virtual.ts (put, get, head, delete, list)
 * plus the artifact table api. better-sqlite3 is the primary driver and
 * the native node:sqlite driver answers when the better driver fails at
 * runtime; the database file is tightened to mode 0o600 right after
 * open because the store carries edge artifacts server-side only.
 *
 * @param options the store options; path defaults to ":memory:".
 * @returns the vault sink.
 */
export function vaultsink(options: { path?: string } = {}): VaultSink {
  const path = typeof options?.path === "string" && options.path.length > 0 ? options.path : ":memory:";
  const opened = opendatabase(path);
  const database = opened.database;
  if (path !== ":memory:") {
    try {
      chmodSync(path, 0o600);
    } catch {
      /* the mode is best effort on exotic filesystems */
    }
  }
  try {
    database.exec(schema);
  } catch (error) {
    throw vaulterror("vault-schema-failed", `creating the edgeartifacts table failed: ${errortext(error)}`);
  }

  /** prepared statements memoized once per sink instance, keyed by sql. */
  const statements = new Map<string, SqliteStatement>();
  function stmt(sql: string): SqliteStatement {
    try {
      let prepared = statements.get(sql);
      if (prepared === undefined) {
        prepared = database.prepare(sql);
        statements.set(sql, prepared);
      }
      return prepared;
    } catch (error) {
      throw vaulterror("vault-prepare-failed", `preparing "${sql.slice(0, 48)}" failed: ${errortext(error)}`);
    }
  }

  const clock = systemclock();
  const ids = idfactory();
  const encoder = new TextEncoder();

  /**
   * writes (or refreshes) one edge artifact row; an empty run id mints
   * one so the receipt always carries the object identity.
   *
   * @param artifact the artifact envelope.
   * @returns the write receipt.
   */
  function putartifact(artifact: VaultArtifact): VaultReceipt {
    try {
      const given = typeof artifact?.runid === "string" ? artifact.runid : "";
      const runid = given.length > 0 ? given : ids.next("edge");
      const modality = String(artifact?.modality ?? "edge");
      const mime = String(artifact?.mime ?? "application/octet-stream");
      const payload = artifact?.bytes ?? "";
      const data = payload instanceof Uint8Array ? payload : String(payload);
      const size = payload instanceof Uint8Array ? payload.byteLength : Buffer.byteLength(String(payload), "utf8");
      const createdat = Number(artifact?.createdat ?? clock.now()) || 0;
      stmt(upsertsql).run(runid, modality, mime, data, size, createdat);
      return { runid, size };
    } catch (error) {
      throw vaulterror("vault-sink-failed", `writing the artifact failed: ${errortext(error)}`);
    }
  }

  /**
   * reads one edge artifact row back; byte artifacts answer as plain
   * uint8arrays and text artifacts answer as text, so the roundtrip
   * preserves the caller's shape.
   *
   * @param runid the run id (the object identity).
   * @returns the artifact or null when absent.
   */
  function getartifact(runid: string): VaultArtifact | null {
    try {
      const row = stmt(`${selectsql} where runid = ?`).get(String(runid ?? "")) as EdgeArtifactRow | undefined;
      if (row === undefined) {
        return null;
      }
      return {
        runid: String(row.runid),
        modality: String(row.modality),
        mime: String(row.mime),
        bytes: row.bytes instanceof Uint8Array ? new Uint8Array(row.bytes) : String(row.bytes ?? ""),
        createdat: Number(row.createdat) || 0,
      };
    } catch (error) {
      throw vaulterror("vault-sink-failed", `reading the artifact failed: ${errortext(error)}`);
    }
  }

  /**
   * the internal api object url: /api/v1/vault/objects/<runid>. the url
   * is always an internal api path — never a file path and never a
   * static download of the raw database.
   *
   * @param runid the run id (the object identity).
   * @returns the internal api path string.
   */
  function artifacturl(runid: string): string {
    return `${objectapiroot}/${encodeURIComponent(String(runid ?? ""))}`;
  }

  /**
   * the store usage counters: the artifact rows and the summed bytes.
   *
   * @returns the counts.
   */
  function counts(): VaultCounts {
    try {
      const row = stmt("select count(*) as artifacts, coalesce(sum(size), 0) as bytes from edgeartifacts").get() as
        | { artifacts?: unknown; bytes?: unknown }
        | undefined;
      return { artifacts: Number(row?.artifacts ?? 0) || 0, bytes: Number(row?.bytes ?? 0) || 0 };
    } catch (error) {
      throw vaulterror("vault-sink-failed", `counting the store failed: ${errortext(error)}`);
    }
  }

  /** projects one artifact into the manifest shape of the family. */
  function manifestof(artifact: VaultArtifact): VaultManifest {
    return artifactmanifest({
      key: artifact.runid,
      sizebytes:
        artifact.bytes instanceof Uint8Array ? artifact.bytes.byteLength : Buffer.byteLength(artifact.bytes, "utf8"),
      sha256: sha256(artifact.bytes),
      contenttype: artifact.mime,
      createdat: artifact.createdat,
      metadata: {},
    });
  }

  /**
   * writes one artifact through the storageadapter envelope: the key is
   * the run id, the data is bytes, text or an async iterable of chunks
   * and the receipt is the manifest of the stored object. metadata rides
   * the write manifest only (the localstorage precedent: the table keeps
   * the durable columns the handoff law pins).
   *
   * @param input the put envelope.
   * @returns the manifest of the stored object.
   */
  async function put(input: VaultPut = {}): Promise<VaultManifest> {
    const key = String(input?.key ?? "");
    if (key.length === 0) {
      throw new TypeError("vault sink key is required (the run id of the artifact)");
    }
    const raw = input?.data ?? new Uint8Array();
    const data: Uint8Array | string =
      raw instanceof Uint8Array || typeof raw === "string" ? raw : await collectbytes(raw);
    const contenttype = String(input?.contenttype ?? "application/octet-stream");
    const createdat = Number(input?.createdat ?? clock.now()) || 0;
    putartifact({
      runid: key,
      modality: String(input?.modality ?? "edge"),
      mime: contenttype,
      bytes: data,
      createdat,
    });
    return artifactmanifest({
      key,
      sizebytes: data instanceof Uint8Array ? data.byteLength : Buffer.byteLength(data, "utf8"),
      sha256: sha256(data),
      contenttype,
      createdat,
      metadata: input?.metadata,
    });
  }

  /**
   * reads the bytes of one stored object; a missing key answers the
   * family artifactnotfound error (the ARTIFACT_NOT_FOUND code).
   *
   * @param key the run id.
   * @returns the stored bytes.
   */
  async function get(key: string): Promise<Uint8Array> {
    const artifact = getartifact(String(key ?? ""));
    if (artifact === null) {
      throw artifactnotfound(String(key ?? ""));
    }
    return artifact.bytes instanceof Uint8Array ? artifact.bytes : encoder.encode(artifact.bytes);
  }

  /**
   * reads the manifest of one stored object without the bytes.
   *
   * @param key the run id.
   * @returns the manifest or null when absent.
   */
  async function head(key: string): Promise<VaultManifest | null> {
    const artifact = getartifact(String(key ?? ""));
    return artifact === null ? null : manifestof(artifact);
  }

  /**
   * removes one stored object.
   *
   * @param key the run id.
   * @returns true when a row was removed.
   */
  async function remove(key: string): Promise<boolean> {
    try {
      const result = stmt("delete from edgeartifacts where runid = ?").run(String(key ?? ""));
      return Number(result?.changes ?? 0) > 0;
    } catch (error) {
      throw vaulterror("vault-sink-failed", `deleting the artifact failed: ${errortext(error)}`);
    }
  }

  /**
   * lists the manifests of every stored object whose run id carries the
   * prefix, ordered by run id; the bytes stay out of the projection.
   *
   * @param prefix the run id prefix filter.
   * @returns the manifests.
   */
  async function list(prefix = ""): Promise<VaultManifest[]> {
    try {
      const marker = String(prefix ?? "");
      const rows = stmt(`${selectsql} order by runid asc`).all() as EdgeArtifactRow[];
      return rows
        .filter((row) => String(row.runid).startsWith(marker))
        .map((row) =>
          manifestof({
            runid: String(row.runid),
            modality: String(row.modality),
            mime: String(row.mime),
            bytes: row.bytes instanceof Uint8Array ? new Uint8Array(row.bytes) : String(row.bytes ?? ""),
            createdat: Number(row.createdat) || 0,
          }),
        );
    } catch (error) {
      throw vaulterror("vault-sink-failed", `listing the store failed: ${errortext(error)}`);
    }
  }

  return {
    driver: opened.driver,
    dbpath: path,
    putartifact,
    getartifact,
    artifacturl,
    counts,
    ...storageadapter({ put, get, head, delete: remove, list }),
    /** closes the connection (idempotent). */
    close() {
      try {
        database.close();
      } catch {
        /* closing twice or after dispose is a no-op */
      }
    },
    /** explicit resource management: `using` support for node >= 24. */
    [Symbol.dispose]() {
      this.close();
    },
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* context: faun — the raw database download guard                    */
/* ════════════════════════════════════════════════════════════════════ */

/** the raw database file extensions the guard refuses (case-insensitive). */
const rawdatabaseextensions = /\.(db|sqlite3?)$/i;

/** the faun path patterns: any faun lane and any vault database file. */
const faunpathpatterns = [/\/faun/i, /\/vault.*\.db/i];

/**
 * the faun law guard: a raw database file is never served as a static
 * download. the verdict blocks any path that ends with .db, .sqlite or
 * .sqlite3 (case-insensitive) or matches the faun/vault database
 * patterns; everything else — the internal object api, the edge run
 * api, plain pages — passes.
 *
 * @param path the request path under review.
 * @returns the verdict with the FAUN_DOWNLOAD_BLOCKED code when blocked.
 */
export function faunblock(path: string): FaunVerdict {
  const target = String(path ?? "");
  const rawdownload = rawdatabaseextensions.test(target) || faunpathpatterns.some((pattern) => pattern.test(target));
  if (!rawdownload) {
    return { blocked: false };
  }
  return {
    blocked: true,
    code: "FAUN_DOWNLOAD_BLOCKED",
    message: "a raw database file is never a static download: the vault serves objects over the internal api only",
  };
}

/**
 * maps the faun guard over route paths for route-level assertions.
 *
 * @param paths the request paths under review.
 * @returns one verdict per path, in order.
 */
export function faunblockroutes(paths: readonly string[]): FaunVerdict[] {
  return paths.map((path) => faunblock(path));
}

/* ════════════════════════════════════════════════════════════════════ */
/* context: visitor — the no-browser-storage law of the artifact path */
/* ════════════════════════════════════════════════════════════════════ */

/** the browser storage surfaces the artifact path refuses. */
const visitorstoresurfaces = ["localStorage", "sessionStorage", "indexedDB"];

/**
 * the visitor store law: artifacts never persist in the visitor
 * browser. the assertion throws the standardized VISITOR_STORE_REFUSED
 * error when the scope carries any browser storage surface; a clean
 * scope answers { clean: true }.
 *
 * @param scope the scope under review (a store map, a config object).
 * @returns { clean: true } when the scope is browser-store free.
 */
export function assertvisitorstorefree(scope: Record<string, unknown>): { clean: true } {
  const carried = visitorstoresurfaces.filter((surface) => {
    const value = scope?.[surface];
    return value !== undefined && value !== null;
  });
  if (carried.length > 0) {
    throw vaulterror("VISITOR_STORE_REFUSED", `the scope carries browser storage: ${carried.join(", ")}`);
  }
  return { clean: true };
}
