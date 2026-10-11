// # artifact — the artifact checksum engine of the foundry (root layer,
// pure logic). Every packaged artifact the floor answers carries its
// checksum: a deterministic fnv-1a digest over the artifact's identity
// (name + format + byte size + payload) rendered as hex, beside the byte
// size and the herd format. The family already rides fnv-1a identities on
// the cadria gateway — the same engine here, so a checksum computed in node
// equals the one computed in the browser, and the tests pin it byte for
// byte. This module is the testable core of the /artifacts page.

import { formatOf, type ImageFormat } from "./imagestore.ts";

/** encodes a string as the utf-8 byte sequence (pure, no TextEncoder —
 * the same bytes in node and in the browser). */
export function utf8Bytes(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.codePointAt(i) as number;
    if (code > 0xffff) i++; // consume the low surrogate of an astral pair
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

/** fnv-1a (32-bit) over the utf-8 bytes of a string — the deterministic
 * identity hash of the family. */
export function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (const byte of utf8Bytes(text)) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** the 8-hex render of the fnv-1a digest. */
export function fnv1aHex(text: string): string {
  return fnv1a(text).toString(16).padStart(8, "0");
}

/** one packaged artifact of the floor. */
export interface Artifact {
  /** the stable id of the artifact */
  id: string;
  /** the artifact name (without the extension) */
  name: string;
  /** the herd format the artifact rides */
  format: ImageFormat;
  /** the sealed size in bytes */
  bytes: number;
  /** the fnv-1a checksum over the artifact identity (8 hex) */
  checksum: string;
  /** the identity string the checksum answers for (honest provenance) */
  identity: string;
}

/** builds the canonical identity string of an artifact (name · ext · bytes
 * · payload) — the exact string the checksum digests. */
export function artifactIdentity(name: string, format: ImageFormat, bytes: number, payload = ""): string {
  const ext = formatOf(format)?.ext ?? ".tzst";
  return [name, ext, String(bytes), payload].join(" · ");
}

/** seals an artifact: identity first, checksum over the identity, then the
 * record (pure — nothing is written anywhere). */
export function sealArtifact(name: string, format: ImageFormat, bytes: number, payload = ""): Artifact {
  const identity = artifactIdentity(name, format, bytes, payload);
  return {
    id: `art-${fnv1aHex(identity)}`,
    name,
    format,
    bytes,
    checksum: fnv1aHex(identity),
    identity,
  };
}

/** the packaged line of one artifact — the shelf renders it verbatim. */
export function artifactLine(artifact: Artifact): string {
  const ext = formatOf(artifact.format)?.ext ?? ".tzst";
  return `${artifact.name}${ext} · ${artifact.bytes.toLocaleString("en-US")} b · fnv-1a ${artifact.checksum}`;
}

/** the manifest of the floor: one line per artifact, stable order. */
export function manifest(artifacts: readonly Artifact[]): string {
  return artifacts.map((artifact) => artifactLine(artifact)).join("\n");
}

/** mulberry32 — the small deterministic prng of the family engines. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** the packaging runs the floor rehearses: deterministic from the seed —
 * each run seals one artifact per herd format. */
export function seedArtifacts(seed: number): Artifact[] {
  const rand = mulberry32(seed);
  const formats: readonly ImageFormat[] = ["tzst", "targz", "tarxz"];
  const names = ["base", "toolchain", "runtime"] as const;
  return formats.map((format, index) =>
    sealArtifact(
      `${names[index]}-${(seed >>> 0).toString(36).slice(0, 4)}`,
      format,
      (30 + Math.floor(rand() * 700)) * 1_000_000,
    ),
  );
}

/** re-verifies a sealed artifact: the checksum must still answer for the
 * identity (the seal is the proof, re-sealing must be byte-equal). */
export function verifyArtifact(artifact: Artifact): boolean {
  return fnv1aHex(artifact.identity) === artifact.checksum;
}
