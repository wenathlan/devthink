// # chunks — the 256KB chunk pipeline of the vault (the blob law).
// Blobs never ride the database raw: every object splits into 256KB windows,
// each window answers for its own real sha-256, and the catalog reuses any
// window it has already seen by digest — the automatic dedupe. Chunks store
// uncompressed first and ride brotli only when the packed form is strictly
// smaller (never a blind compression). Giant data rides chunks the same way
// — text=path, bytea=chunk, json=manifest, bigint=pointer — and the masters
// (binary mimes or anything past the 1,000,000-byte threshold of the
// storage.ts contract) sit in the l3 cold tier of the plan.
//
// @section split — the 256KB windows and their real digests
// @section encode — raw first, brotli only when it wins
// @section tier — the l3/warm plan answer
// @section manifest — the json truth the ledger keeps

import { brotliCompressSync, brotliDecompressSync } from "node:zlib";
import { sha256Hex } from "./sha.ts";
import { storageModeFor } from "./storage.ts";

/** @section split */

/** The chunk window of the vault: 262,144 bytes — the 256KB the blob law rides. */
export const CHUNK_BYTES = 262_144;

/** One slice of the split — a 256KB window and the real sha-256 that answers for it. */
export interface ChunkSlice {
  /** the real sha-256 digest of the window bytes (the catalog reuse key) */
  digest: string;
  /** the window bytes — a view into the source buffer, stored before the caller mutates */
  bytes: Uint8Array;
}

/**
 * Splits the bytes into 256KB windows, each carrying its real sha-256 — the
 * digest the catalog dedupes by. Empty bytes answer zero slices (the empty
 * object still digests whole at the ledger layer).
 *
 * @param bytes the whole object bytes.
 * @returns the ordered slices — reassembling them in order rebuilds the object.
 */
export function split(bytes: Uint8Array): ChunkSlice[] {
  const slices: ChunkSlice[] = [];
  for (let offset = 0; offset < bytes.length; offset += CHUNK_BYTES) {
    const window = bytes.subarray(offset, Math.min(offset + CHUNK_BYTES, bytes.length));
    slices.push({ digest: sha256Hex(window), bytes: window });
  }
  return slices;
}

/**
 * Reassembles ordered parts back into the whole object bytes.
 *
 * @param parts the decoded chunk bytes in position order.
 * @returns the whole object bytes.
 */
export function reassemble(parts: readonly Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const whole = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    whole.set(part, offset);
    offset += part.length;
  }
  return whole;
}

/** @section encode */

/** The encoding a stored chunk rides: raw first, brotli only when it is strictly smaller. */
export type ChunkEncoding = "raw" | "brotli";

/** One stored chunk: the digest of the raw window, the raw size, the encoding and the bytes as stored. */
export interface StoredChunk {
  /** the real sha-256 of the raw window — the reuse key, stable across encodings */
  digest: string;
  /** the raw window size in bytes */
  size: number;
  /** the encoding the stored bytes ride */
  encoding: ChunkEncoding;
  /** the bytes as stored — packed when brotli won, verbatim otherwise */
  data: Uint8Array;
}

/** The smallest window brotli is attempted on — packing a sliver costs more than it pays. */
const BROTLI_FLOOR_BYTES = 1024;

/**
 * Encodes one slice for storage: uncompressed first (the law), brotli only
 * when the packed form is strictly smaller than the raw window.
 *
 * @param slice the slice to encode.
 * @returns the stored chunk — its digest always answers for the raw window.
 */
export function encodeChunk(slice: ChunkSlice): StoredChunk {
  if (slice.bytes.length >= BROTLI_FLOOR_BYTES) {
    const packed = brotliCompressSync(slice.bytes);
    if (packed.length < slice.bytes.length) {
      return { digest: slice.digest, size: slice.bytes.length, encoding: "brotli", data: packed };
    }
  }
  return { digest: slice.digest, size: slice.bytes.length, encoding: "raw", data: slice.bytes };
}

/**
 * Decodes one stored chunk back to its raw window bytes.
 *
 * @param chunk the stored chunk (encoding and data are enough).
 * @returns the raw window bytes.
 */
export function decodeChunk(chunk: Pick<StoredChunk, "encoding" | "data">): Uint8Array {
  return chunk.encoding === "brotli" ? brotliDecompressSync(chunk.data) : chunk.data;
}

/**
 * Verifies that a stored chunk still answers for its digest — decode, hash,
 * compare. This is the per-chunk tamper gate of the read path.
 *
 * @param chunk the stored chunk to verify.
 * @returns true when the real sha-256 of the decoded window equals the digest.
 */
export function chunkIntact(chunk: Pick<StoredChunk, "digest" | "encoding" | "data">): boolean {
  return sha256Hex(decodeChunk(chunk)) === chunk.digest;
}

/**
 * The manifest entry of one stored chunk — the json=manifest law: what the
 * read path needs to reassemble and verify, nothing more.
 *
 * @param chunk the stored chunk.
 * @returns its manifest entry.
 */
export function manifestEntryOf(chunk: StoredChunk): ChunkManifestEntry {
  return { digest: chunk.digest, size: chunk.size, encoding: chunk.encoding, stored: chunk.data.length };
}

/** One entry of the object manifest — the ordered chunk truth the ledger keeps. */
export interface ChunkManifestEntry {
  /** the real sha-256 of the raw window */
  digest: string;
  /** the raw window size in bytes */
  size: number;
  /** the encoding the stored bytes ride */
  encoding: ChunkEncoding;
  /** the stored size in bytes — packed when brotli won */
  stored: number;
}

/** @section tier */

/** The two channels of the safe, as the storage.ts contract answers them. */
export type VaultChannel = ReturnType<typeof storageModeFor>;

/** The storage tier of a whole object: l3 (cold) for the masters, warm for the small rows. */
export type StorageTier = "l3" | "warm";

/**
 * The tier an object rides — the honest mapping of the storage.ts contract
 * onto the plan: binary masters and everything past the 1,000,000-byte
 * threshold go straight to l3 (cold), small text-like rows stay warm. Every
 * chunk of the object rides the same tier as the object.
 *
 * @param size the whole object size in bytes.
 * @param mime the content type the object serves as.
 * @returns the tier the manifest records.
 */
export function tierFor(size: number | bigint, mime: string): StorageTier {
  return storageModeFor(size, mime) === "lfs" ? "l3" : "warm";
}

/** @section manifest */

/**
 * The manifest of one stored object — the json=manifest law: the digest the
 * object answers for, the size as a decimal string (bigint-safe through
 * json), the channel and tier it rides, and the ordered chunk entries the
 * read path reassembles from.
 */
export interface ObjectManifest {
  /** the manifest version — 1 */
  version: 1;
  /** the real sha-256 of the whole object bytes */
  digest: string;
  /** the whole-object byte size as a decimal string — a 64-bit pointer that json cannot lie about */
  size: string;
  /** the channel the object rode — the storage.ts contract answer */
  channel: VaultChannel;
  /** the tier the object rides in the plan */
  tier: StorageTier;
  /** the ordered chunk entries — position in the array is position in the object */
  entries: ChunkManifestEntry[];
}
