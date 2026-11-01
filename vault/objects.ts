// # objects — the object ledger engine of the vault (root layer, pure logic).
// The sealed inventory of the safe: every object carries its path, mime,
// byte size, the channel it rode (lfs for the masters, blob for the small —
// decided by the REAL contract of storage.ts, threshold 1,000,000 bytes)
// and the digest that attests it. The digest is the honest rehearsal form:
// the real rows carry sha-256 (lfs) and sha-1 (blob) — the rehearsal derives
// a same-shape digest from one integer seed through deterministic fnv-1a
// rounds, so the bytes validate through the real digestValid discipline and
// the whole record passes the real storageRecordValid gate. No network, no
// clocks at seal time — the same seed always seals the same vault.
// This module is the testable core of the /objects page.

import { digestValid, lfsPointerText, type StorageRecord, storageModeFor, storageRecordValid } from "./storage.ts";

/** the two channels of the safe (the storage.ts contract, mirrored). */
export type VaultChannel = "lfs" | "blob";

/** one sealed object of the vault rehearsal. */
export interface VaultObject {
  /** the stable id of the object */
  id: string;
  /** the bucket the object rides (the retention group) */
  bucket: string;
  /** the repository-relative path (absolute, the contract requires it) */
  path: string;
  /** the content type the mimetype layer serves this object as */
  mime: string;
  /** the sealed byte size (64-bit honest — numbers stay in the safe range) */
  size: number;
  /** true when the bytes ride the lfs channel, false for in-db blobs */
  lfs: boolean;
  /** the digest: sha-256 shaped (64 hex) for lfs, sha-1 shaped (40) for blobs */
  digest: string;
  /** the rehearsal tick the object was sealed at (the retention clock reads it) */
  sealedAt: number;
}

/** the rehearsal buckets of the vault (the retention page reads the same
 * names — one table, zero drift). */
export const VAULT_BUCKETS: readonly string[] = ["family-state", "site-assets", "run-evidence", "backups"] as const;

/** fnv-1a (32-bit) over the utf-8 bytes of a string — the deterministic
 * identity hash of the family (the same engine the cadria gateway rides). */
export function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** the 8-hex render of one fnv-1a digest. */
export function fnv1aHex(text: string): string {
  return fnv1a(text).toString(16).padStart(8, "0");
}

/**
 * Derives a digest in the exact shape the storage contract demands: 64 hex
 * for the lfs channel (sha-256 discipline), 40 hex for the blob channel
 * (sha-1 discipline). Eight (or five) fnv-1a rounds over salted identities
 * fill the width deterministically — the rehearsal digest validates through
 * the real digestValid gate and never guesses.
 */
export function digestFor(identity: string, lfs: boolean): string {
  const rounds = lfs ? 8 : 5;
  let digest = "";
  for (let round = 0; round < rounds; round++) {
    digest += fnv1aHex(`${identity} · round ${round}`);
  }
  return digest;
}

/** the canonical identity string of an object (what the digest answers for). */
export function objectIdentity(path: string, mime: string, size: number, bucket: string, payload = ""): string {
  return [bucket, path, mime, String(size), payload].join(" · ");
}

/**
 * Seals one deposit under the real storage contract: the channel comes from
 * storageModeFor, the digest from digestFor, and the record must pass
 * storageRecordValid before it rides the ledger. The answer carries an
 * honest refusal when the contract rejects the deposit.
 */
export function sealObject(
  bucket: string,
  path: string,
  mime: string,
  size: number,
  sealedAt: number,
  payload = "",
): { object: VaultObject; refusal?: string } {
  const lfs = storageModeFor(size, mime) === "lfs";
  const identity = objectIdentity(path, mime, size, bucket, payload);
  const digest = digestFor(identity, lfs);
  const record: StorageRecord = {
    id: `obj-${fnv1aHex(identity)}`,
    path,
    mime,
    size,
    lfs,
    digest,
  };
  if (!storageRecordValid(record)) {
    return {
      object: {
        id: record.id,
        bucket,
        path,
        mime,
        size,
        lfs,
        digest,
        sealedAt,
      },
      refusal: "the contract refuses the deposit — path must be absolute, mime typed and size ≥ 0",
    };
  }
  return {
    object: {
      id: record.id,
      bucket,
      path,
      mime,
      size,
      lfs,
      digest,
      sealedAt,
    },
  };
}

/** the lfs pointer document of an object (the three-line pointer the
 * contract keeps beside the bytes — rendered verbatim from storage.ts). */
export function pointerTextOf(object: VaultObject): string {
  return lfsPointerText({ oid: object.digest, size: object.size, path: object.path });
}

/** the census of the sealed vault: rows, bytes, channel split and the
 * biggest sealed object (the one glance answer of the /objects page). */
export interface VaultCensus {
  total: number;
  bytes: number;
  lfsRows: number;
  blobRows: number;
  lfsBytes: number;
  blobBytes: number;
  biggest: VaultObject | undefined;
}

/** rolls the ledger up into the census. */
export function vaultCensus(objects: readonly VaultObject[]): VaultCensus {
  let bytes = 0;
  let lfsRows = 0;
  let blobRows = 0;
  let lfsBytes = 0;
  let blobBytes = 0;
  let biggest: VaultObject | undefined;
  for (const object of objects) {
    bytes += object.size;
    if (object.lfs) {
      lfsRows += 1;
      lfsBytes += object.size;
    } else {
      blobRows += 1;
      blobBytes += object.size;
    }
    if (!biggest || object.size > biggest.size) biggest = object;
  }
  return { total: objects.length, bytes, lfsRows, blobRows, lfsBytes, blobBytes, biggest };
}

/** mulberry32 — the small deterministic prng of the family engines. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** the rehearsal deposits the safe keeps (honest house work, no fake repos). */
const REHEARSAL_OBJECTS: readonly { path: string; mime: string; weight: number }[] = [
  { path: "/sites/devthink/state.db", mime: "application/x-sqlite3", weight: 48_211_046 },
  { path: "/sites/cadria/gallery.json", mime: "application/json", weight: 148_204 },
  { path: "/media/hero-reel.mp4", mime: "video/mp4", weight: 912_004_512 },
  { path: "/docs/enginemap.md", mime: "text/markdown", weight: 38_912 },
  { path: "/backups/ledger-2026-02.tzst", mime: "application/x-tzst", weight: 220_118_016 },
  { path: "/sites/getry/rotations.json", mime: "application/json", weight: 96_440 },
  { path: "/media/cover-art.png", mime: "image/png", weight: 2_244_880 },
  { path: "/runs/forge/421337.log", mime: "text/plain", weight: 12_800 },
  { path: "/models/worldmodel.onnx", mime: "model/onnx", weight: 148_002_816 },
  { path: "/sites/argan/zones.db", mime: "application/x-sqlite3", weight: 8_882_176 },
] as const;

/** the bucket each rehearsal object rides (same order as the list). */
const REHEARSAL_BUCKETS: readonly string[] = [
  "family-state",
  "site-assets",
  "site-assets",
  "family-state",
  "backups",
  "family-state",
  "site-assets",
  "run-evidence",
  "run-evidence",
  "family-state",
] as const;

/**
 * The rehearsal vault, deterministic from the seed: the same seed always
 * seals the same objects, in the same order, on the same ticks — the
 * surface says the ledger is a seeded rehearsal, never a live claim.
 */
export function seedVault(seed: number): VaultObject[] {
  const rand = mulberry32(seed);
  const objects: VaultObject[] = [];
  for (let i = 0; i < REHEARSAL_OBJECTS.length; i++) {
    const draft = REHEARSAL_OBJECTS[i];
    const bucket = REHEARSAL_BUCKETS[i];
    const jitter = 1 + (rand() - 0.5) * 0.08;
    const size = Math.max(0, Math.round(draft.weight * jitter));
    const sealedAt = Math.round(i * 720 + rand() * 240);
    const sealed = sealObject(bucket, draft.path, draft.mime, size, sealedAt);
    objects.push(sealed.object);
  }
  return objects;
}

/** the human byte count the vault renders (tabular, always one unit). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = "B";
  for (const next of units) {
    if (value < 1024) break;
    value /= 1024;
    unit = next;
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${unit}`;
}

/** the short render of a digest for the ledger rows (head + tail, honest
 * about the elision). */
export function digestShort(digest: string): string {
  if (digest.length <= 16) return digest;
  return `${digest.slice(0, 8)}…${digest.slice(-4)}`;
}

/** the channel answer of the deposit draft, before anything is sealed —
 * the same contract the seal uses, surfaced for the live readout. */
export function channelPreview(
  mime: string,
  size: number,
): { channel: VaultChannel; why: string; digestShape: string } {
  const channel = storageModeFor(size, mime);
  return {
    channel,
    why:
      channel === "lfs"
        ? "binary master or over the 1,000,000-byte threshold"
        : "small text-like row under the threshold",
    digestShape: channel === "lfs" ? "sha-256 (64 hex)" : "sha-1 (40 hex)",
  };
}

/** re-verifies a sealed object: the digest must still answer for the
 * identity (the seal is the proof, re-sealing must be byte-equal). */
export function verifyObject(object: VaultObject): boolean {
  const identity = objectIdentity(object.path, object.mime, object.size, object.bucket);
  return digestFor(identity, object.lfs) === object.digest && digestValid(object.digest, object.lfs);
}
