// # sha — the real digest engine of the vault (node:crypto, zero rehearsal).
// Every digest the real storage path answers is computed here over the real
// bytes: sha-256 for the masters (the git LFS oid discipline and the chunk
// catalog key) and sha-1 for the small in-db git blobs. The rehearsal digest
// of objects.ts stays where it is — the seeded catalog of the /objects page —
// while this module is the one the ledger, the chunk pipeline and the routes
// trust. No guessed shapes, no fnv stand-ins on the real path: one moved
// byte breaks the answer, always.
//
// @section digests — sha-256 and sha-1 over real bytes
// @section shapes — the hex shape gates

import { createHash } from "node:crypto";

/** @section digests */

/**
 * The real sha-256 digest of the bytes, hex-encoded — the oid the git LFS
 * pointer discipline answers for and the key the chunk catalog reuses
 * content by.
 *
 * @param data the bytes (or the utf-8 reading of a string) to digest.
 * @returns the 64-hex sha-256 digest.
 */
export function sha256Hex(data: Uint8Array | string): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * The real sha-1 digest of the bytes, hex-encoded — the git blob oid shape
 * of the small in-db channel.
 *
 * @param data the bytes (or the utf-8 reading of a string) to digest.
 * @returns the 40-hex sha-1 digest.
 */
export function sha1Hex(data: Uint8Array | string): string {
  return createHash("sha1").update(data).digest("hex");
}

/**
 * Verifies that a digest still answers for the bytes — the real tamper gate
 * of the storage engine: recompute, compare, refuse on any drift.
 *
 * @param data the bytes to verify.
 * @param digest the digest the bytes claim to answer for.
 * @param kind which real digest family the claim rides.
 * @returns true when the digest answers for the bytes.
 */
export function digestMatches(data: Uint8Array | string, digest: string, kind: "sha256" | "sha1"): boolean {
  const actual = kind === "sha256" ? sha256Hex(data) : sha1Hex(data);
  return actual === digest.toLowerCase();
}

/** @section shapes */

/**
 * True when the text is a well-formed sha-256 hex digest — 64 lowercase hex
 * characters, the width the LFS pointer and the chunk catalog demand.
 *
 * @param digest the candidate digest text.
 */
export function isSha256Hex(digest: string): boolean {
  return /^[0-9a-f]{64}$/.test(digest);
}

/**
 * True when the text is a well-formed sha-1 hex digest — 40 lowercase hex
 * characters, the git blob oid width.
 *
 * @param digest the candidate digest text.
 */
export function isSha1Hex(digest: string): boolean {
  return /^[0-9a-f]{40}$/.test(digest);
}
