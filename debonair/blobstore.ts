// # blobstore — the content-addressed binary store of the debonair
// pipeline (root layer, wave PV1.005): the ingest worker, the render jobs
// and the playback lane all ride this one seam. put() hands bytes in and a
// pointer comes back — {id, bytes, sha256, kind, storedAt} — and get(id)
// answers the same bytes. the id rides the bigintids mint (the
// time-ordered 64-bit row pointer the mix_pointer/stems_pointer columns
// expect), the sha256 is computed by the store itself over the caller's
// bytes — never trusted from the outside — through the fips 180-4 rounds
// hand-rolled in pure typescript the same discipline the fnv-1a pcmhash
// rides (deterministic, synchronous, zero dependencies), and the kind is
// the bare mime the caller declares ("audio/wav"). three backends answer
// the one interface: the memory mirror (byte-capped, oldest evicted, the
// offline seat and the test lane), the file lane (a root directory, the
// git-lfs object shard layout — the first two hex of the digest name the
// subdirectory — one json manifest row per blob, atomic temp+rename
// writes, node:fs through dynamic import so the browser bundle never
// loads it) and the gateway seam (an injected fetch talking
// GET/PUT/DELETE /api/v1/blob/:id to a configured origin under the house
// https law, typed errors, never a throw). every backend answers the same
// manifest row shape (schema "debonair.blob/1") so the ingest db rows and
// the git-lfs pointers stay interchangeable — the vault law: the storage
// app owns the engine, the gateway serves it. zero consumer data.

import { mintid } from "./bigintids.ts";
import { hostallowed } from "./onboardingstate.ts";

/** The schema literal every manifest row this store writes carries. */
export const BLOB_SCHEMA_VERSION = "debonair.blob/1";

/** The default byte ceiling of one backend — a generous 512 mb. */
export const BLOB_DEFAULT_CAP_BYTES = 512 * 1024 * 1024;

/** The shard width of the file lane: the first two hex of the digest name
 * the subdirectory (the git-lfs object layout). */
const BLOB_SHARD_CHARS = 2;

/** The route the gateway lane rides (the gateway serves /api/v1/blob/:id). */
const BLOB_API_PATH = "/api/v1/blob";

/** The wire header the digest rides (put declares it, get reads it). */
const BLOB_SHA_HEADER = "x-debonair-blob-sha256";

/** The wire header the byte count rides on get. */
const BLOB_BYTES_HEADER = "x-debonair-blob-bytes";

/** The wire header the stored-at instant rides on get. */
const BLOB_STORED_AT_HEADER = "x-debonair-blob-stored-at";

/** The default abort window of one gateway lane call — blob bodies are
 * bigger than json, the cloudsync 2.5 s law would starve them. */
export const BLOB_GATEWAY_TIMEOUT_MS = 30_000;

/** The fips 180-4 round constants (the cube-root fractional parts). */
const SHA256_K: readonly number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
  0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
  0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
  0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
  0xc67178f2,
];

/** The fips 180-4 initial state (the square-root fractional parts). */
const SHA256_H: readonly number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

/** One content-addressed blob pointer — the row the db columns and the
 * git-lfs pointers carry. */
export interface BlobPointer {
  /** The minted 64-bit row id (decimal string — js numbers cannot hold it). */
  id: string;
  /** The byte count of the blob. */
  bytes: number;
  /** The sha256 hex digest of the bytes (64 lowercase chars, computed by
   * the store itself — never trusted from the caller). */
  sha256: string;
  /** The bare mime the caller declared ("audio/wav"). */
  kind: string;
  /** The iso instant the store accepted the bytes. */
  storedAt: string;
}

/** The manifest row every backend answers and every sidecar writes — the
 * schema literal keeps the ingest db rows and the git-lfs pointers
 * interchangeable across backends. */
export interface BlobManifestRow {
  /** The schema literal of this store (the only one this wave writes). */
  schema: typeof BLOB_SCHEMA_VERSION;
  /** The pointer the bytes answer to. */
  pointer: BlobPointer;
}

/** The machine codes the store answers: the blob law first (the id, the
 * kind, the cap, the shelf, the retirement), the wire law last (the lane
 * the gateway and the file system ride). */
export type BlobErrorCode =
  | "bad-id" // the id is not a minted decimal pointer
  | "not-found" // no blob answers the id
  | "bad-kind" // the declared kind is not a bare mime
  | "too-large" // the bytes exceed the cap
  | "store-closed" // the store was retired
  | "offline" // the lane is unreachable (network or disk)
  | "timeout" // the lane kept silent past the abort window
  | "refused" // the lane answered a non-2xx
  | "bad-response"; // the lane answered a shape this store cannot parse

/** The typed result every store call answers — ok carries the pointer (and
 * the bytes on get, null on put and remove), the error branch carries the
 * machine code and, on the wire lanes, the http status. never a throw. */
export type BlobResult =
  | { ok: true; pointer: BlobPointer; data: Uint8Array | null }
  | { ok: false; code: BlobErrorCode; message: string; status: number | null };

/** The storage seam every lane rides (the ingeststore/takestore injectable
 * discipline): put/get/remove answer the typed result, list answers the
 * pointers (empty when the lane holds nothing or was closed), close
 * retires the store so later calls answer store-closed. */
export interface BlobStore {
  /** Stores bytes under a freshly minted pointer; the sha256 is computed
   * by the store itself. */
  put(data: Uint8Array, kind: string): Promise<BlobResult>;
  /** Answers the bytes and the pointer of one id. */
  get(id: string): Promise<BlobResult>;
  /** Drops one blob, answering the pointer it dropped. */
  remove(id: string): Promise<BlobResult>;
  /** Answers every pointer, newest first. */
  list(): Promise<BlobPointer[]>;
  /** Retires the store (idempotent). */
  close(): void;
}

/** One 32-bit rotate-right (the fips rotr, unsigned). */
function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * The hand-rolled sha256 of a byte block — the standard fips 180-4
 * compression rounds in pure typescript, synchronous and deterministic,
 * the same zero-dependency discipline the fnv-1a pcmhash rides. the tests
 * pin the standard vectors (the empty block, "abc", the two-block padding
 * edge and the million-a long vector).
 *
 * @param data the bytes to digest.
 * @returns the lowercase hex digest (64 chars).
 */
export function sha256hex(data: Uint8Array): string {
  // the padding: one 0x80, zeros to the 56-byte mark, the 64-bit
  // big-endian bit length — the length rides two 32-bit words
  const blocks = Math.ceil((data.length + 9) / 64);
  const padded = new Uint8Array(blocks * 64);
  padded.set(data);
  padded[data.length] = 0x80;
  const bits = data.length * 8;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bits / 4294967296), false);
  view.setUint32(padded.length - 4, bits % 4294967296, false);
  let h0 = SHA256_H[0];
  let h1 = SHA256_H[1];
  let h2 = SHA256_H[2];
  let h3 = SHA256_H[3];
  let h4 = SHA256_H[4];
  let h5 = SHA256_H[5];
  let h6 = SHA256_H[6];
  let h7 = SHA256_H[7];
  const w = new Array<number>(64);
  for (let block = 0; block < padded.length; block += 64) {
    for (let t = 0; t < 16; t++) w[t] = view.getUint32(block + t * 4, false);
    for (let t = 16; t < 64; t++) {
      const x = w[t - 15];
      const y = w[t - 2];
      const s0 = rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
      const s1 = rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;
    for (let t = 0; t < 64; t++) {
      const big1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + big1 + ch + SHA256_K[t] + w[t]) >>> 0;
      const big0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (big0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((word) => word.toString(16).padStart(8, "0")).join("");
}

/**
 * Validates a pointer id: the minted decimal form (one to twenty digits,
 * no leading zero — the shape bigintids answers).
 *
 * @param id the candidate id.
 * @returns true when the id could carry a blob.
 */
export function blobidvalid(id: string): boolean {
  return /^[1-9]\d{0,19}$/.test(id);
}

/**
 * Validates a declared kind: a bare mime (a token, a slash, a token — the
 * rfc shape), never empty, never parameters.
 *
 * @param kind the candidate kind.
 * @returns true when the kind may ride a pointer.
 */
export function blobkindvalid(kind: string): boolean {
  return /^[a-z0-9!#$%&'*+\-.^_`|~]+\/[a-z0-9!#$%&'*+\-.^_`|~]+$/i.test(kind);
}

/**
 * Validates a digest: 64 lowercase hex chars (the form sha256hex answers).
 *
 * @param sha256 the candidate digest.
 * @returns true when the digest is well formed.
 */
export function blobshavalid(sha256: string): boolean {
  return /^[0-9a-f]{64}$/.test(sha256);
}

/** The pointer field guard (the manifest parse shares it). */
function pointervalid(pointer: unknown): pointer is BlobPointer {
  if (!pointer || typeof pointer !== "object") return false;
  const candidate = pointer as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    blobidvalid(candidate.id) &&
    typeof candidate.bytes === "number" &&
    Number.isSafeInteger(candidate.bytes) &&
    candidate.bytes >= 0 &&
    typeof candidate.sha256 === "string" &&
    blobshavalid(candidate.sha256) &&
    typeof candidate.kind === "string" &&
    blobkindvalid(candidate.kind) &&
    typeof candidate.storedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}T/.test(candidate.storedAt)
  );
}

/**
 * Validates a manifest row: the schema literal of this store and every
 * pointer field (the guard the wire parse and the disk parse share).
 *
 * @param row the candidate row (already json-parsed).
 * @returns true when the row is a debonair.blob/1 manifest.
 */
export function blobrowvalid(row: unknown): row is BlobManifestRow {
  if (!row || typeof row !== "object") return false;
  const candidate = row as Record<string, unknown>;
  return candidate.schema === BLOB_SCHEMA_VERSION && pointervalid(candidate.pointer);
}

/** The error branch builder — the calls answer, they never throw. */
function storeerr(code: BlobErrorCode, message: string, status: number | null = null): BlobResult {
  return { ok: false, code, message, status };
}

/** The ok branch builder (the bytes ride only on get). */
function storeok(pointer: BlobPointer, data: Uint8Array | null): BlobResult {
  return { ok: true, pointer, data };
}

/** Orders pointers newest first — storedAt desc, the minted id desc as the
 * tiebreak (the ids order by creation, the house law). */
function sortnewest(pointers: readonly BlobPointer[]): BlobPointer[] {
  return [...pointers].sort((left, right) => {
    const bytime = right.storedAt.localeCompare(left.storedAt);
    if (bytime !== 0) return bytime;
    const a = BigInt(left.id);
    const b = BigInt(right.id);
    return b > a ? 1 : b < a ? -1 : 0;
  });
}

/** Mints one pointer for freshly accepted bytes (the store owns the sha,
 * the clock feeds both the mint and the stored-at instant). */
function mintpointer(tick: number, bytes: number, sha256: string, kind: string): BlobPointer {
  return { id: mintid(tick), bytes, sha256, kind, storedAt: new Date(tick).toISOString() };
}

/** The readable message of any failure. */
function errmsg(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** The errno of a node failure ("" when it carries none). */
function errnoof(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (typeof code === "string") return code;
  }
  return "";
}

/**
 * Builds the canonical git-lfs pointer text of a blob — the same text the
 * family vault writes beside its objects, so a debonair pointer exports to
 * a git-lfs pointer file verbatim (the vault law: the pointers stay
 * interchangeable).
 *
 * @param pointer the blob pointer.
 * @returns the three-line lfs pointer text.
 */
export function lfsPointerText(pointer: BlobPointer): string {
  return `version https://git-lfs.github.com/spec/v1\noid sha256:${pointer.sha256}\nsize ${pointer.bytes}\n`;
}

/**
 * Parses the git-lfs pointer text back into the fields this store owns
 * (the digest and the byte count — the id and the kind ride the manifest
 * row beside it).
 *
 * @param text the lfs pointer text.
 * @returns the digest and the byte count, or undefined when the text is
 * not an lfs pointer.
 */
export function lfsPointerFrom(text: string): { sha256: string; bytes: number } | undefined {
  const sha256 = text.match(/^oid sha256:([0-9a-f]{64})$/m)?.[1];
  const bytes = Number(text.match(/^size (\d+)$/m)?.[1]);
  if (!sha256 || !Number.isSafeInteger(bytes) || bytes < 0) return undefined;
  return { sha256, bytes };
}

/** The json face of the manifest rows (one encoder per process). */
const manifestencoder = new TextEncoder();

/** The memory mirror options. */
export interface MemoryBlobOptions {
  /** The byte ceiling of the mirror (default 512 mb — generous). */
  capBytes?: number;
  /** The clock the mint and the stored-at instant ride (the tests pin it). */
  now?: () => number;
}

/**
 * The memory mirror — the offline seat and the test lane: one map of owned
 * bytes under the byte cap, the oldest evicted first when the cap fills
 * (the ingeststore mirror law), deterministic in order and eviction, every
 * call answering the typed result.
 */
export class MemoryBlobStore implements BlobStore {
  private readonly cap: number;
  private readonly now: () => number;
  private readonly blobs = new Map<string, { pointer: BlobPointer; data: Uint8Array }>();
  private total = 0;
  private closed = false;

  constructor(options: MemoryBlobOptions = {}) {
    this.cap = options.capBytes ?? BLOB_DEFAULT_CAP_BYTES;
    this.now = options.now ?? Date.now;
  }

  async put(data: Uint8Array, kind: string): Promise<BlobResult> {
    if (this.closed) return storeerr("store-closed", "the mirror is closed");
    if (!blobkindvalid(kind)) return storeerr("bad-kind", "the declared kind is not a bare mime");
    if (data.length > this.cap) {
      return storeerr("too-large", `the ${data.length} bytes exceed the ${this.cap} byte mirror cap`);
    }
    const owned = new Uint8Array(data);
    // the mirror law: the oldest bytes evict first when the cap fills
    while (this.total + owned.length > this.cap && this.blobs.size > 0) {
      const oldest = this.blobs.keys().next().value;
      if (oldest === undefined) break;
      const dropped = this.blobs.get(oldest);
      this.blobs.delete(oldest);
      this.total -= dropped?.pointer.bytes ?? 0;
    }
    const pointer = mintpointer(this.now(), owned.length, sha256hex(owned), kind);
    this.blobs.set(pointer.id, { pointer, data: owned });
    this.total += owned.length;
    return storeok(pointer, null);
  }

  async get(id: string): Promise<BlobResult> {
    if (this.closed) return storeerr("store-closed", "the mirror is closed");
    if (!blobidvalid(id)) return storeerr("bad-id", "the id is not a minted pointer");
    const held = this.blobs.get(id);
    if (!held) return storeerr("not-found", `no blob answers ${id}`);
    return storeok(held.pointer, held.data);
  }

  async remove(id: string): Promise<BlobResult> {
    if (this.closed) return storeerr("store-closed", "the mirror is closed");
    if (!blobidvalid(id)) return storeerr("bad-id", "the id is not a minted pointer");
    const held = this.blobs.get(id);
    if (!held) return storeerr("not-found", `no blob answers ${id}`);
    this.blobs.delete(id);
    this.total -= held.pointer.bytes;
    return storeok(held.pointer, null);
  }

  async list(): Promise<BlobPointer[]> {
    if (this.closed) return [];
    return sortnewest([...this.blobs.values()].map((held) => held.pointer));
  }

  close(): void {
    this.closed = true;
    this.blobs.clear();
    this.total = 0;
  }
}

/**
 * The memory mirror factory (the lowercase seam the family law names).
 *
 * @param options the cap and the clock.
 * @returns the memory blob store.
 */
export function memoryblobstore(options: MemoryBlobOptions = {}): MemoryBlobStore {
  return new MemoryBlobStore(options);
}

/** The file lane options. */
export interface FileBlobOptions {
  /** The byte ceiling of the lane (default 512 mb — generous). */
  capBytes?: number;
  /** The clock the mint and the stored-at instant ride (the tests pin it). */
  now?: () => number;
}

/** The node:fs/promises face, loaded once through dynamic import so the
 * browser bundle never pulls it (the engine file stays pure). */
type NodeFs = typeof import("node:fs/promises");
let nodefs: NodeFs | null = null;

/** Loads the node fs/promises face (cached after the first call). */
async function fs(): Promise<NodeFs> {
  nodefs ??= (await import("node:fs/promises")) as NodeFs;
  return nodefs;
}

/** The temp-name entropy: a counter and four strong bytes, so two writers
 * never share a temp file. */
let tempseq = 0;

/** Mints one temp file name part. */
function tempname(): string {
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${(tempseq++).toString(36)}-${hex}`;
}

/**
 * The file lane — the server seat: one root directory, the bytes at
 * objects/<first two hex>/<remaining 62> (the git-lfs object shard law,
 * content-addressed so identical bytes dedupe on disk) and one json
 * manifest row at manifests/<id>.json (the pointer row the shelf reads).
 * every write is atomic (a temp file in the target directory, then the
 * rename) and the bytes land before the manifest, so a crash between the
 * two leaves an invisible orphan — never a row that points at missing
 * bytes.
 */
export class FileBlobStore implements BlobStore {
  private readonly root: string;
  private readonly cap: number;
  private readonly now: () => number;
  private closed = false;

  constructor(root: string, options: FileBlobOptions = {}) {
    this.root = root.replace(/\/+$/, "");
    this.cap = options.capBytes ?? BLOB_DEFAULT_CAP_BYTES;
    this.now = options.now ?? Date.now;
  }

  /** The manifest row path of one id. */
  private manifestpath(id: string): string {
    return `${this.root}/manifests/${id}.json`;
  }

  /** The object path of one digest — the git-lfs shard law. */
  private objectpath(sha256: string): string {
    return `${this.root}/objects/${sha256.slice(0, BLOB_SHARD_CHARS)}/${sha256.slice(BLOB_SHARD_CHARS)}`;
  }

  async put(data: Uint8Array, kind: string): Promise<BlobResult> {
    if (this.closed) return storeerr("store-closed", "the file lane is closed");
    if (!blobkindvalid(kind)) return storeerr("bad-kind", "the declared kind is not a bare mime");
    if (data.length > this.cap) {
      return storeerr("too-large", `the ${data.length} bytes exceed the ${this.cap} byte lane cap`);
    }
    const owned = new Uint8Array(data);
    const pointer = mintpointer(this.now(), owned.length, sha256hex(owned), kind);
    const row: BlobManifestRow = { schema: BLOB_SCHEMA_VERSION, pointer };
    try {
      const f = await fs();
      // the bytes land first, the manifest row second — a crash between
      // the two leaves an invisible orphan, never a dangling row
      await this.writeatomic(f, this.objectpath(pointer.sha256), owned);
      await this.writeatomic(f, this.manifestpath(pointer.id), manifestencoder.encode(JSON.stringify(row)));
      return storeok(pointer, null);
    } catch (error) {
      return storeerr("offline", `the file lane refused the write: ${errmsg(error)}`);
    }
  }

  async get(id: string): Promise<BlobResult> {
    if (this.closed) return storeerr("store-closed", "the file lane is closed");
    if (!blobidvalid(id)) return storeerr("bad-id", "the id is not a minted pointer");
    let row: BlobManifestRow | null;
    try {
      row = await this.readrow(id);
    } catch (error) {
      return storeerr("offline", `the file lane refused the manifest read: ${errmsg(error)}`);
    }
    if (!row) return storeerr("not-found", `no blob answers ${id}`);
    try {
      const f = await fs();
      const raw = await f.readFile(this.objectpath(row.pointer.sha256));
      if (raw.byteLength !== row.pointer.bytes) {
        return storeerr("bad-response", `the bytes of ${id} fail the manifest count`);
      }
      return storeok(row.pointer, new Uint8Array(raw));
    } catch (error) {
      if (errnoof(error) === "ENOENT") return storeerr("not-found", `the bytes of ${id} are missing`);
      return storeerr("offline", `the file lane refused the read: ${errmsg(error)}`);
    }
  }

  async remove(id: string): Promise<BlobResult> {
    if (this.closed) return storeerr("store-closed", "the file lane is closed");
    if (!blobidvalid(id)) return storeerr("bad-id", "the id is not a minted pointer");
    let row: BlobManifestRow | null;
    try {
      row = await this.readrow(id);
    } catch (error) {
      return storeerr("offline", `the file lane refused the manifest read: ${errmsg(error)}`);
    }
    if (!row) return storeerr("not-found", `no blob answers ${id}`);
    try {
      const f = await fs();
      await f.rm(this.objectpath(row.pointer.sha256), { force: true });
      await f.rm(this.manifestpath(id), { force: true });
      const shard = this.objectpath(row.pointer.sha256);
      try {
        await f.rmdir(shard.slice(0, shard.lastIndexOf("/")));
      } catch {
        // the shard keeps its siblings — only an empty directory folds away
      }
      return storeok(row.pointer, null);
    } catch (error) {
      return storeerr("offline", `the file lane refused the removal: ${errmsg(error)}`);
    }
  }

  async list(): Promise<BlobPointer[]> {
    if (this.closed) return [];
    try {
      const f = await fs();
      let names: string[] = [];
      try {
        names = await f.readdir(`${this.root}/manifests`);
      } catch (error) {
        if (errnoof(error) !== "ENOENT") throw error;
      }
      const pointers: BlobPointer[] = [];
      for (const name of names) {
        if (!name.endsWith(".json")) continue;
        const id = name.slice(0, -".json".length);
        if (!blobidvalid(id)) continue;
        // a row that fails the parse never blocks the shelf
        const row = await this.readrow(id).catch(() => null);
        if (row) pointers.push(row.pointer);
      }
      return sortnewest(pointers);
    } catch {
      return [];
    }
  }

  close(): void {
    this.closed = true;
  }

  /** One atomic write: the temp file lands in the target directory, then
   * the rename (a reader never observes a half-written blob). */
  private async writeatomic(f: NodeFs, target: string, bytes: Uint8Array): Promise<void> {
    await f.mkdir(target.slice(0, target.lastIndexOf("/")), { recursive: true });
    const temp = `${target}.${tempname()}.tmp`;
    await f.writeFile(temp, bytes);
    await f.rename(temp, target);
  }

  /** Reads and validates one manifest row (null when absent or unparsable,
   * a foreign errno throws so the caller can tell the lane apart). */
  private async readrow(id: string): Promise<BlobManifestRow | null> {
    const f = await fs();
    let raw: string;
    try {
      raw = await f.readFile(this.manifestpath(id), "utf8");
    } catch (error) {
      if (errnoof(error) === "ENOENT") return null;
      throw error;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return blobrowvalid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}

/**
 * The file lane factory (the lowercase seam the family law names).
 *
 * @param root the directory the lane owns (created on the first write).
 * @param options the cap and the clock.
 * @returns the file blob store.
 */
export function fileblobstore(root: string, options: FileBlobOptions = {}): FileBlobStore {
  return new FileBlobStore(root, options);
}

/** The gateway lane options. */
export interface GatewayBlobOptions {
  /** The fetch seam (the tests inject a double; the default is the host fetch). */
  fetchImpl?: typeof fetch;
  /** The clock the client-side mint rides. */
  now?: () => number;
  /** The abort window of every lane call (default 30 s). */
  timeoutMs?: number;
  /** The client-side byte cap (the gateway enforces its own beside it). */
  capBytes?: number;
}

/** One lane call answer: the response, or the typed failure. */
type LaneAnswer = { ok: true; response: Response } | { ok: false; result: BlobResult };

/**
 * The gateway seam — the vault lane: an injected fetch talking
 * GET/PUT/DELETE /api/v1/blob/:id to a configured origin under the house
 * https law (https only, public hosts — the onboardingstate gate), the
 * client mints the pointer id and computes the digest itself, the gateway
 * answers the manifest row (the put and the list ride json, the get rides
 * the raw bytes with the pointer fields in the house headers). every
 * failure answers the typed error — never a throw.
 */
export class GatewayBlobStore implements BlobStore {
  private readonly origin: string;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private readonly timeoutMs: number;
  private readonly cap: number;
  private readonly allowed: boolean;
  private closed = false;

  constructor(origin: string, options: GatewayBlobOptions = {}) {
    this.origin = origin.trim().replace(/\/+$/, "");
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
    this.now = options.now ?? Date.now;
    this.timeoutMs = options.timeoutMs ?? BLOB_GATEWAY_TIMEOUT_MS;
    this.cap = options.capBytes ?? BLOB_DEFAULT_CAP_BYTES;
    this.allowed = hostallowed(this.origin);
  }

  async put(data: Uint8Array, kind: string): Promise<BlobResult> {
    if (this.closed) return storeerr("store-closed", "the gateway lane is closed");
    if (!blobkindvalid(kind)) return storeerr("bad-kind", "the declared kind is not a bare mime");
    if (data.length > this.cap) {
      return storeerr("too-large", `the ${data.length} bytes exceed the ${this.cap} byte lane cap`);
    }
    const owned = new Uint8Array(data);
    const sha256 = sha256hex(owned);
    const pointer = mintpointer(this.now(), owned.length, sha256, kind);
    const call = await this.lane("PUT", `${BLOB_API_PATH}/${pointer.id}`, {
      headers: { "content-type": kind, [BLOB_SHA_HEADER]: sha256 },
      body: owned,
    });
    if (!call.ok) return call.result;
    if (!call.response.ok) return this.refused(call.response);
    return this.rowfrom(call.response, pointer.id, sha256);
  }

  async get(id: string): Promise<BlobResult> {
    if (this.closed) return storeerr("store-closed", "the gateway lane is closed");
    if (!blobidvalid(id)) return storeerr("bad-id", "the id is not a minted pointer");
    const call = await this.lane("GET", `${BLOB_API_PATH}/${id}`);
    if (!call.ok) return call.result;
    const response = call.response;
    if (!response.ok) return this.refused(response);
    try {
      const bytes = new Uint8Array(await response.arrayBuffer());
      // the header fields lead, the store's own math fills the gaps (the
      // digest is computed locally when the header stays silent — never
      // trusted from outside, the house law)
      const rawbytes = response.headers.get(BLOB_BYTES_HEADER);
      const count = rawbytes !== null && /^\d+$/.test(rawbytes) ? Number(rawbytes) : bytes.byteLength;
      const rawsha = response.headers.get(BLOB_SHA_HEADER);
      const sha256 = rawsha !== null && blobshavalid(rawsha) ? rawsha : sha256hex(bytes);
      const kind = (response.headers.get("content-type") ?? "").split(";")[0].trim();
      const storedAt = response.headers.get(BLOB_STORED_AT_HEADER) ?? "";
      return storeok({ id, bytes: count, sha256, kind, storedAt }, bytes);
    } catch (error) {
      return storeerr("bad-response", `the gateway body failed to arrive: ${errmsg(error)}`, response.status);
    }
  }

  async remove(id: string): Promise<BlobResult> {
    if (this.closed) return storeerr("store-closed", "the gateway lane is closed");
    if (!blobidvalid(id)) return storeerr("bad-id", "the id is not a minted pointer");
    const call = await this.lane("DELETE", `${BLOB_API_PATH}/${id}`);
    if (!call.ok) return call.result;
    if (!call.response.ok) return this.refused(call.response);
    try {
      const parsed: unknown = await call.response.json();
      if (blobrowvalid(parsed)) return storeok(parsed.pointer, null);
    } catch {
      // a 204 carries no body — the ack stands on the status alone
    }
    return storeok({ id, bytes: 0, sha256: "", kind: "", storedAt: "" }, null);
  }

  async list(): Promise<BlobPointer[]> {
    if (this.closed) return [];
    const call = await this.lane("GET", BLOB_API_PATH);
    if (!call.ok) return [];
    if (!call.response.ok) return [];
    try {
      const parsed: unknown = await call.response.json();
      if (!Array.isArray(parsed)) return [];
      const pointers: BlobPointer[] = [];
      for (const entry of parsed) {
        // a foreign row never blocks the shelf
        if (blobrowvalid(entry)) pointers.push(entry.pointer);
      }
      return sortnewest(pointers);
    } catch {
      return [];
    }
  }

  close(): void {
    this.closed = true;
  }

  /** One lane call: the house https law, the abort window, the typed
   * translation of every failure — never a throw. */
  private async lane(
    method: string,
    path: string,
    init: { headers?: Record<string, string>; body?: Uint8Array<ArrayBuffer> } = {},
  ): Promise<LaneAnswer> {
    if (this.closed) return { ok: false, result: storeerr("store-closed", "the gateway lane is closed") };
    if (!this.allowed) {
      return { ok: false, result: storeerr("offline", "the configured origin refuses the house https law") };
    }
    if (typeof this.fetchImpl !== "function") {
      return { ok: false, result: storeerr("offline", "no fetch seam on this host") };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.origin}${path}`, {
        method,
        headers: init.headers,
        body: init.body,
        signal: controller.signal,
      });
      return { ok: true, response };
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError";
      return {
        ok: false,
        result: aborted
          ? storeerr("timeout", `the gateway kept silent past ${this.timeoutMs} ms`)
          : storeerr("offline", `the gateway is unreachable: ${errmsg(error)}`),
      };
    } finally {
      clearTimeout(timer);
    }
  }

  /** Translates a non-2xx into the machine code (404 is not-found, 413 is
   * too-large, the rest refuse). */
  private refused(response: Response): BlobResult {
    if (response.status === 404) return storeerr("not-found", "the gateway holds no such blob", 404);
    if (response.status === 413) return storeerr("too-large", "the gateway refused the size", 413);
    return storeerr("refused", `the gateway answered ${response.status}`, response.status);
  }

  /** Parses the manifest row a 2xx answered and checks the echo — the row
   * must answer the very blob this store sent (the id and the digest). */
  private async rowfrom(response: Response, id: string, sha256: string): Promise<BlobResult> {
    let parsed: unknown;
    try {
      parsed = await response.json();
    } catch {
      return storeerr("bad-response", "the gateway answered no manifest row", response.status);
    }
    if (!blobrowvalid(parsed)) {
      return storeerr("bad-response", "the gateway answered a foreign manifest row", response.status);
    }
    if (parsed.pointer.id !== id || parsed.pointer.sha256 !== sha256) {
      return storeerr("bad-response", "the gateway answered a manifest of another blob", response.status);
    }
    return storeok(parsed.pointer, null);
  }
}

/**
 * The gateway lane factory (the lowercase seam the family law names).
 *
 * @param origin the configured gateway origin (https, a public host).
 * @param options the fetch seam, the clock, the window and the cap.
 * @returns the gateway blob store.
 */
export function gatewayblobstore(origin: string, options: GatewayBlobOptions = {}): GatewayBlobStore {
  return new GatewayBlobStore(origin, options);
}
