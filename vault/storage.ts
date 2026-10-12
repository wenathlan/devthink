// # vault storage — the storage library of the family, housed at the vault root.
// Everything storage in the platform lives here and only here: git LFS pointers,
// git objects/blobs inside the self-hosted DB (the virtual repo), and the table
// access every site borrows over the published @wenathlan/vault package. The
// other applications never reimplement storage — they import this library the
// same way they import saddle for sandboxes, cadria for media and debonair for
// audio. Library-grade: domain types and pure, parameterized helpers only —
// zero consumer data, and every statement shape is bound-parameter based.

/** A git LFS pointer as it is stored beside (and cataloged inside) the DB. */
export interface LfsPointer {
  /** the sha-256 oid the LFS object answers for */
  oid: string;
  /** byte size of the object — a 64-bit pointer, BigInt beyond the 2^53 safe range */
  size: number | bigint;
  /** repository-relative path the pointer sits at */
  path: string;
}

/** A git blob carried inside the DB (the virtual-repo object storage). */
export interface GitBlob {
  /** the git object id (sha-1 hex) */
  oid: string;
  /** byte size of the uncompressed blob — a 64-bit pointer, BigInt beyond the 2^53 safe range */
  size: number | bigint;
  /** content type the mimetype layer serves this blob as */
  mime: string;
}

/** One cataloged storage object a site serves over HTTPS. */
export interface StorageRecord {
  id: string;
  path: string;
  mime: string;
  /** byte size of the object — a 64-bit pointer, BigInt beyond the 2^53 safe range */
  size: number | bigint;
  /** true when the bytes live in LFS, false for in-DB git blobs */
  lfs: boolean;
  /** integrity digest (sha-256 for LFS rows, sha-1 git oid for blobs) */
  digest: string;
}

/** Builds the canonical git LFS pointer text for an object. */
export function lfsPointerText(pointer: LfsPointer): string {
  return `version https://git-lfs.github.com/spec/v1\noid sha256:${pointer.oid}\nsize ${pointer.size}\n`;
}

/** Parses a git LFS pointer document into its oid and size. */
export function lfsPointerFrom(text: string): LfsPointer | undefined {
  const oid = text.match(/^oid sha256:([0-9a-f]{64})$/m)?.[1];
  const size = Number(text.match(/^size (\d+)$/m)?.[1]);
  if (!oid || !Number.isFinite(size)) return undefined;
  return { oid, size, path: "" };
}

/** True when a digest is a well-formed sha-256 (LFS rows) or sha-1 (git blobs). */
export function digestValid(digest: string, lfs: boolean): boolean {
  return lfs ? /^[0-9a-f]{64}$/.test(digest) : /^[0-9a-f]{40}$/.test(digest);
}

/** Validates a storage record before the DB layer persists it (id, path, mime and integrity must hold). */
export function storageRecordValid(record: StorageRecord): boolean {
  return (
    record.id.length > 0 &&
    record.path.startsWith("/") &&
    record.mime.includes("/") &&
    Number(record.size) >= 0 &&
    digestValid(record.digest, record.lfs)
  );
}

/** Chooses the storage mode for a candidate upload: small text-like rows ride in-DB git blobs, binary masters ride LFS. */
export function storageModeFor(size: number | bigint, mime: string): "blob" | "lfs" {
  const binary = /^(image|video|audio|model)\//.test(mime) || mime === "application/octet-stream";
  return binary || Number(size) > 1_000_000 ? "lfs" : "blob";
}
