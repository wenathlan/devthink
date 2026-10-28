// # objectsledger — the real object ledger of the vault (server-side truth).
// The safe itself: every deposit rides the real pipeline — the bytes digest
// whole through real sha-256, split into 256KB windows, each window stored
// once in the content-addressed catalog (automatic reuse by digest, ref
// counted), the manifest (json) keeping the ordered truth, and the row
// carrying bigint pointers. Reads reassemble the windows in order and
// re-verify every digest — one moved byte answers corrupt, never a shrug.
// Removal soft-deletes the row, detaches the chunk references and lets the
// sweep collect the orphans. The quota gate runs inside the write
// transaction: over the limit nothing lands at all. Nothing rides the
// person's browser — the ledger, the catalog and the verdicts live on the
// vault infrastructure only.
//
// @section validation — the identity, path and mime gates
// @section projects — the owner scope and its quota floor
// @section put — the deposit pipeline (digest, chunks, manifest, refs)
// @section get — the verified read path (reassemble, re-digest, refuse)
// @section delete — soft-delete, refcount detach, orphan sweep
// @section usage — the ledger census the routes answer

import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, isNotNull, isNull, lte, sql } from "drizzle-orm";
import {
  CHUNK_BYTES,
  type ChunkEncoding,
  type ChunkManifestEntry,
  decodeChunk,
  encodeChunk,
  manifestEntryOf,
  type ObjectManifest,
  reassemble,
  type StorageTier,
  split,
  tierFor,
  type VaultChannel,
} from "./chunks.ts";
import { chunkRefs, chunks, projects, type StorageExecutor, storage, storageObjects } from "./drizzle.ts";
import { ensureQuota, type QuotaRow, type QuotaVerdict, quotaVerdict, readQuota } from "./quota.ts";
import { sha256Hex } from "./sha.ts";
import { storageModeFor } from "./storage.ts";

/** @section validation */

/** the project identity shape: 3-64 chars of lowercase letters, digits and dashes, starting alphanumeric. */
const PROJECT_PATTERN = /^[a-z0-9][a-z0-9-]{2,63}$/;

/**
 * Validates a project identity — the owner scope every object and quota hangs from.
 *
 * @param id the candidate project id.
 */
export function projectIdValid(id: string): boolean {
  return PROJECT_PATTERN.test(id);
}

/**
 * Validates an object path: absolute, no dot segments, no null bytes, bounded length.
 *
 * @param objectPath the candidate path.
 */
export function objectPathValid(objectPath: string): boolean {
  if (!objectPath.startsWith("/") || objectPath.length > 4096 || objectPath.includes("\0")) {
    return false;
  }
  for (const segment of objectPath.split("/")) {
    if (segment === "." || segment === "..") {
      return false;
    }
  }
  return true;
}

/**
 * Validates a mime type: the type/subtype shape, bounded length.
 *
 * @param mime the candidate content type.
 */
export function mimeValid(mime: string): boolean {
  return /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i.test(mime) && mime.length <= 255;
}

/** @section projects */

/** One project of the ledger with its quota row attached. */
export interface ProjectRow {
  /** the project identity */
  id: string;
  /** the human name */
  name: string;
  /** the region the project serves from */
  region: string;
  /** the creation datetime */
  createdAt: string;
  /** the quota row — the user-defined limit, null = unlimited */
  quota: QuotaRow;
}

/** the explicit column projection every project read answers (no select *). */
const PROJECT_COLUMNS = {
  id: projects.id,
  name: projects.name,
  region: projects.region,
  createdAt: projects.createdAt,
};

/**
 * Creates one project — the owner scope — with the 900MB quota floor laid
 * down beside it (the user redefines or removes the limit afterwards).
 * Idempotent: an existing project answers its row untouched.
 *
 * @param id the project identity.
 * @param name the human name (defaults to the id).
 * @returns the project with its quota, or the honest refusal.
 */
export function createProject(id: string, name = id): { project?: ProjectRow; refusal?: LedgerRefusal } {
  if (!projectIdValid(id)) {
    return {
      refusal: {
        kind: "invalid",
        why: `the project id "${id}" must be 3-64 chars of lowercase letters, digits and dashes, starting alphanumeric`,
      },
    };
  }
  storage.insert(projects).values({ id, name }).onConflictDoNothing().run();
  const quota = ensureQuota(storage, id);
  const row = storage.select(PROJECT_COLUMNS).from(projects).where(eq(projects.id, id)).get();
  if (row === undefined) {
    throw new Error(`the project row "${id}" did not land`);
  }
  return { project: { id: row.id, name: row.name, region: row.region, createdAt: row.createdAt, quota } };
}

/** @section put */

/** One deposit of the real pipeline: what the ledger is asked to keep. */
export interface PutInput {
  /** the owning project */
  projectId: string;
  /** the repository-relative absolute path the object answers at */
  path: string;
  /** the content type the object serves as */
  mime: string;
  /** the real bytes to keep */
  bytes: Uint8Array;
}

/** One object of the ledger — the row answer with bigint pointers. */
export interface LedgerObject {
  /** the ledger-issued identity */
  id: string;
  /** the owning project */
  projectId: string;
  /** the absolute path the object answers at */
  path: string;
  /** the content type the object serves as */
  mime: string;
  /** the whole-object byte size — a 64-bit bigint pointer */
  size: bigint;
  /** the real sha-256 of the whole object bytes */
  digest: string;
  /** the channel the object rode — blob or lfs (the storage.ts contract) */
  channel: VaultChannel;
  /** the tier the object rides — l3 cold or warm */
  tier: StorageTier;
  /** the creation datetime of the row */
  createdAt: string;
}

/** The refusal the ledger answers: why a deposit, read or removal did not land. */
export type LedgerRefusal =
  | { kind: "invalid"; why: string }
  | { kind: "quota"; verdict: QuotaVerdict; why: string }
  | { kind: "absent"; why: string }
  | { kind: "corrupt"; why: string; position?: number; digest?: string };

/** The put answer: the sealed object with its manifest and the reuse count, or the refusal. */
export type PutAnswer = { object: LedgerObject; manifest: ObjectManifest; reused: number } | { refusal: LedgerRefusal };

/**
 * Stores one object through the real pipeline — the whole write rides one
 * transaction: the quota gate refuses (nothing lands), the replaced row at
 * the same path detaches, every 256KB window upserts into the catalog by
 * digest (refs increment — automatic reuse), the manifest keeps the ordered
 * truth and the row carries the bigint pointers.
 *
 * @param input the deposit — project, path, mime and the real bytes.
 * @returns the object with its manifest and how many chunks the catalog already held, or the refusal.
 */
export function putObject(input: PutInput): PutAnswer {
  if (!projectIdValid(input.projectId)) {
    return { refusal: { kind: "invalid", why: `the project id "${input.projectId}" is not a valid owner scope` } };
  }
  if (!objectPathValid(input.path)) {
    return { refusal: { kind: "invalid", why: "the object path must be absolute, dot-free and bounded" } };
  }
  if (!mimeValid(input.mime)) {
    return { refusal: { kind: "invalid", why: "the mime must be a type/subtype pair" } };
  }
  const size = BigInt(input.bytes.length);
  const digest = sha256Hex(input.bytes);
  const channel = storageModeFor(size, input.mime);
  const tier = tierFor(size, input.mime);
  return storage.transaction((tx) => {
    const project = tx.select({ id: projects.id }).from(projects).where(eq(projects.id, input.projectId)).get();
    if (project === undefined) {
      return { refusal: { kind: "invalid", why: `the project "${input.projectId}" does not exist — create it first` } };
    }
    const existing = liveObjectAt(tx, input.projectId, input.path);
    const usage = usageIn(tx, input.projectId);
    const base = usage.bytes - (existing === undefined ? 0n : BigInt(existing.size));
    const quota = readQuota(tx, input.projectId) ?? ensureQuota(tx, input.projectId);
    const verdict = quotaVerdict(base, quota.limitBytes, size);
    if (verdict.state === "over") {
      return { refusal: { kind: "quota", verdict, why: "the write exceeds the remaining quota — nothing was stored" } };
    }
    if (existing !== undefined) {
      detachObject(tx, existing.id);
    }
    const id = `obj-${randomUUID()}`;
    const entries: ChunkManifestEntry[] = [];
    const chunkIds: number[] = [];
    let reused = 0;
    for (const slice of split(input.bytes)) {
      const stored = encodeChunk(slice);
      const known = tx.select({ id: chunks.id }).from(chunks).where(eq(chunks.digest, stored.digest)).get();
      if (known !== undefined) {
        reused += 1;
      }
      const row = tx
        .insert(chunks)
        .values({
          digest: stored.digest,
          size: BigInt(stored.size),
          stored: BigInt(stored.data.length),
          encoding: stored.encoding,
          refs: 1,
          bytes: Buffer.from(stored.data),
        })
        .onConflictDoUpdate({ target: chunks.digest, set: { refs: sql`${chunks.refs} + 1` } })
        .returning({ id: chunks.id })
        .get();
      if (row === undefined) {
        throw new Error("a chunk upsert answered no row — the catalog is inconsistent");
      }
      chunkIds.push(row.id);
      entries.push(manifestEntryOf(stored));
    }
    const manifest: ObjectManifest = { version: 1, digest, size: size.toString(), channel, tier, entries };
    tx.insert(storageObjects)
      .values({ id, projectId: input.projectId, path: input.path, mime: input.mime, size, digest, manifest, channel })
      .run();
    if (chunkIds.length > 0) {
      tx.insert(chunkRefs)
        .values(chunkIds.map((chunkId, position) => ({ objectId: id, position, chunkId })))
        .run();
    }
    const row = liveObjectById(tx, id);
    if (row === undefined) {
      throw new Error(`the object row "${id}" did not land`);
    }
    return { object: ledgerObjectOf(row), manifest, reused };
  });
}

/** @section get */

/** The get answer: the verified bytes with their object, or the refusal. */
export type GetAnswer = { bytes: Uint8Array; object: LedgerObject; verified: true } | { refusal: LedgerRefusal };

/**
 * Reads one object back through the verified path: the manifest drives the
 * ordered chunk reads, every chunk re-digests (a moved byte answers
 * corrupt), the reassembled whole re-digests against the object digest, and
 * only then do the bytes travel. The ledger never shrugs at drift.
 *
 * @param id the ledger identity of the object.
 * @returns the bytes with their object and verified true, or the refusal.
 */
export function getObject(id: string): GetAnswer {
  const row = liveObjectById(storage, id);
  if (row === undefined) {
    return { refusal: { kind: "absent", why: `the object "${id}" is not in the ledger` } };
  }
  const manifest = row.manifest;
  const ordered = storage
    .select({ chunkId: chunkRefs.chunkId })
    .from(chunkRefs)
    .where(eq(chunkRefs.objectId, id))
    .orderBy(asc(chunkRefs.position))
    .all();
  if (ordered.length !== manifest.entries.length) {
    return {
      refusal: {
        kind: "corrupt",
        why: `the manifest promises ${manifest.entries.length} chunks but ${ordered.length} are pointed at`,
        digest: manifest.digest,
      },
    };
  }
  const ids = ordered.map((edge) => edge.chunkId);
  const chunkRows =
    ids.length === 0
      ? []
      : storage
          .select({ id: chunks.id, digest: chunks.digest, encoding: chunks.encoding, bytes: chunks.bytes })
          .from(chunks)
          .where(inArray(chunks.id, ids))
          .all();
  const byId = new Map(chunkRows.map((chunk) => [String(chunk.id), chunk]));
  const parts: Uint8Array[] = [];
  for (let position = 0; position < ordered.length; position++) {
    const entry = manifest.entries[position];
    const chunk = byId.get(String(ordered[position].chunkId));
    if (chunk === undefined) {
      return {
        refusal: {
          kind: "corrupt",
          why: `the chunk at position ${position} left the catalog`,
          position,
          digest: entry.digest,
        },
      };
    }
    if (chunk.digest !== entry.digest) {
      return {
        refusal: {
          kind: "corrupt",
          why: `the chunk at position ${position} answers for a different digest`,
          position,
          digest: entry.digest,
        },
      };
    }
    const encoding: ChunkEncoding = chunk.encoding === "brotli" ? "brotli" : "raw";
    let raw: Uint8Array;
    try {
      raw = decodeChunk({ encoding, data: chunk.bytes });
    } catch {
      return {
        refusal: {
          kind: "corrupt",
          why: `the chunk at position ${position} no longer decodes — the bytes moved`,
          position,
          digest: entry.digest,
        },
      };
    }
    if (sha256Hex(raw) !== entry.digest) {
      return {
        refusal: {
          kind: "corrupt",
          why: `the chunk at position ${position} no longer answers for its digest — the bytes moved`,
          position,
          digest: entry.digest,
        },
      };
    }
    if (raw.length !== entry.size) {
      return {
        refusal: {
          kind: "corrupt",
          why: `the chunk at position ${position} decodes to ${raw.length} bytes, the manifest says ${entry.size}`,
          position,
        },
      };
    }
    parts.push(raw);
  }
  const whole = reassemble(parts);
  if (sha256Hex(whole) !== manifest.digest || whole.length !== Number(manifest.size)) {
    return {
      refusal: { kind: "corrupt", why: "the whole object no longer answers for its digest", digest: manifest.digest },
    };
  }
  return { bytes: whole, object: ledgerObjectOf(row), verified: true };
}

/** @section delete */

/** The delete answer: whether the tombstone landed. */
export interface DeleteAnswer {
  /** true when a live object was soft-deleted */
  removed: boolean;
  /** the identity the removal answered for */
  id: string;
}

/**
 * Removes one object — the soft delete: the row tombstones (deleted_at),
 * its chunk references detach and the refcounts drop. Shared chunks survive
 * while another object still points at them; the sweep collects what no one
 * references anymore.
 *
 * @param id the ledger identity of the object.
 * @returns whether a live object was removed.
 */
export function deleteObject(id: string): DeleteAnswer {
  const row = liveObjectById(storage, id);
  if (row === undefined) {
    return { removed: false, id };
  }
  storage.transaction((tx) => {
    detachObject(tx, id);
  });
  return { removed: true, id };
}

/** The sweep answer: what the orphan collection freed. */
export interface SweepAnswer {
  /** the orphan chunks collected */
  chunks: number;
  /** the stored bytes freed — a bigint pointer */
  bytes: bigint;
  /** the tombstoned object rows purged */
  tombstones: number;
}

/**
 * Sweeps the orphans: chunks whose refcount fell to zero leave the catalog
 * (their stored bytes freed), and the tombstoned object rows — whose
 * references already detached at removal time — leave the ledger. What
 * someone still references never moves.
 *
 * @returns what the sweep collected.
 */
export function sweepOrphans(): SweepAnswer {
  return storage.transaction((tx) => {
    const freed = tx
      .select({ chunks: sql<number>`COUNT(*)`, bytes: sql<number>`COALESCE(SUM(${chunks.stored}), 0)` })
      .from(chunks)
      .where(lte(chunks.refs, 0))
      .get();
    tx.delete(chunks).where(lte(chunks.refs, 0)).run();
    const tombstones = tx.delete(storageObjects).where(isNotNull(storageObjects.deletedAt)).run().changes;
    return {
      chunks: Number(freed?.chunks ?? 0),
      bytes: BigInt(freed?.bytes ?? 0),
      tombstones: Number(tombstones ?? 0),
    };
  });
}

/** @section usage */

/** The usage of one project, computed from the ledger — bigint bytes, int32 count. */
export interface UsageAnswer {
  /** the live bytes the project stores — a 64-bit bigint pointer */
  bytes: bigint;
  /** the live object count */
  objects: number;
}

/**
 * Answers the usage of one project — the sum over the live rows (deleted_at
 * is null), the number the quota verdict is computed from.
 *
 * @param projectId the owning project.
 */
export function usageOf(projectId: string): UsageAnswer {
  return usageIn(storage, projectId);
}

/** The census of the whole engine — the one-glance answer of the store. */
export interface CensusAnswer {
  /** the live object rows across every project */
  liveObjects: number;
  /** the live bytes across every project — a bigint pointer */
  liveBytes: bigint;
  /** the unique chunks the catalog holds */
  chunks: number;
  /** the stored chunk bytes (packed when brotli won) — a bigint pointer */
  chunkBytes: bigint;
}

/**
 * Answers the census of the storage engine — live objects and bytes, the
 * unique chunk count and the bytes the catalog actually holds (after the
 * reuse and the packing).
 */
export function storageCensus(): CensusAnswer {
  const live = storage
    .select({ objects: sql<number>`COUNT(*)`, bytes: sql<number>`COALESCE(SUM(${storageObjects.size}), 0)` })
    .from(storageObjects)
    .where(isNull(storageObjects.deletedAt))
    .get();
  const catalog = storage
    .select({ chunks: sql<number>`COUNT(*)`, bytes: sql<number>`COALESCE(SUM(${chunks.stored}), 0)` })
    .from(chunks)
    .get();
  return {
    liveObjects: Number(live?.objects ?? 0),
    liveBytes: BigInt(live?.bytes ?? 0),
    chunks: Number(catalog?.chunks ?? 0),
    chunkBytes: BigInt(catalog?.bytes ?? 0),
  };
}

/**
 * Lists the live objects of one project — newest first, bounded to five
 * hundred rows, the explicit projection only.
 *
 * @param projectId the owning project.
 */
export function listObjects(projectId: string): LedgerObject[] {
  return storage
    .select(OBJECT_COLUMNS)
    .from(storageObjects)
    .where(and(eq(storageObjects.projectId, projectId), isNull(storageObjects.deletedAt)))
    .orderBy(desc(storageObjects.createdAt), desc(storageObjects.id))
    .limit(500)
    .all()
    .map(ledgerObjectOf);
}

/* ------------------------------------------------------------------ */
/* the internal projections and helpers                                */
/* ------------------------------------------------------------------ */

/** the explicit column projection every object read answers (no select *). */
const OBJECT_COLUMNS = {
  id: storageObjects.id,
  projectId: storageObjects.projectId,
  path: storageObjects.path,
  mime: storageObjects.mime,
  size: storageObjects.size,
  digest: storageObjects.digest,
  manifest: storageObjects.manifest,
  channel: storageObjects.channel,
  createdAt: storageObjects.createdAt,
};

/** the raw object row the projection answers (the size cell is 64-bit, widened at the boundary). */
type ObjectRowSql = {
  id: string;
  projectId: string;
  path: string;
  mime: string;
  size: number | bigint;
  digest: string;
  manifest: ObjectManifest;
  channel: string;
  createdAt: string;
};

/** Widens one raw row into the ledger object — the size becomes a real bigint, the channel normalizes. */
function ledgerObjectOf(row: ObjectRowSql): LedgerObject {
  return {
    id: row.id,
    projectId: row.projectId,
    path: row.path,
    mime: row.mime,
    size: BigInt(row.size),
    digest: row.digest,
    channel: row.channel === "lfs" ? "lfs" : "blob",
    tier: row.manifest.tier,
    createdAt: row.createdAt,
  };
}

/** Reads the live object row of one id (deleted_at null). */
function liveObjectById(executor: StorageExecutor, id: string): ObjectRowSql | undefined {
  return executor
    .select(OBJECT_COLUMNS)
    .from(storageObjects)
    .where(and(eq(storageObjects.id, id), isNull(storageObjects.deletedAt)))
    .get();
}

/** Reads the live object row of one project path (the overwrite candidate). */
function liveObjectAt(executor: StorageExecutor, projectId: string, objectPath: string): ObjectRowSql | undefined {
  return executor
    .select(OBJECT_COLUMNS)
    .from(storageObjects)
    .where(
      and(
        eq(storageObjects.projectId, projectId),
        eq(storageObjects.path, objectPath),
        isNull(storageObjects.deletedAt),
      ),
    )
    .get();
}

/** Answers the usage of one project on the given executor — the quota gate reads it inside its transaction. */
function usageIn(executor: StorageExecutor, projectId: string): UsageAnswer {
  const row = executor
    .select({ bytes: sql<number>`COALESCE(SUM(${storageObjects.size}), 0)`, objects: sql<number>`COUNT(*)` })
    .from(storageObjects)
    .where(and(eq(storageObjects.projectId, projectId), isNull(storageObjects.deletedAt)))
    .get();
  return { bytes: BigInt(row?.bytes ?? 0), objects: Number(row?.objects ?? 0) };
}

/**
 * Detaches one object from the catalog: the chunk references leave, the
 * refcounts drop by exactly what left (floored at zero), and the row
 * tombstones. Runs inside the caller's transaction.
 */
function detachObject(executor: StorageExecutor, objectId: string): void {
  const grouped = executor
    .select({ chunkId: chunkRefs.chunkId, count: sql<number>`COUNT(*)` })
    .from(chunkRefs)
    .where(eq(chunkRefs.objectId, objectId))
    .groupBy(chunkRefs.chunkId)
    .all();
  executor.delete(chunkRefs).where(eq(chunkRefs.objectId, objectId)).run();
  for (const group of grouped) {
    executor
      .update(chunks)
      .set({ refs: sql`MAX(${chunks.refs} - ${group.count}, 0)` })
      .where(eq(chunks.id, group.chunkId))
      .run();
  }
  executor.update(storageObjects).set({ deletedAt: sql`datetime('now')` }).where(eq(storageObjects.id, objectId)).run();
}

/** the chunk window the ledger splits at — surfaced for the route answers and the tests. */
export { CHUNK_BYTES };
