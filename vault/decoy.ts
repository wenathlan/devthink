// # decoy — the decoy database that answers anonymous probes (the faun
// lesson's final seal, root layer). The static deploy of the ancestor
// exposed a downloadable database and the lesson became law: the real
// base stays sealed forever, and the anonymous probe never learns the
// shape of the truth. This module is the decoy lane the api wires at the
// faun lesson door: a browser-shaped probe (the scanner signature — an
// accept header carrying text/html, the one shape no api client and no
// test harness ever sends) that rides the read routes without a bearer
// receives a plausible ledger of fake projects instead of the honest
// refusal, so the probe cannot distinguish a loaded vault from an empty
// one and the enumeration dies in the decoy. The api client contract
// stays intact: every non-browser anonymous request still answers the
// honest VAULT_AUTH refusal the accounts, objects and storagelane suites
// assert, and no test shape ever rides the decoy lane.
//
// the determinism law: the decoy ledger derives from a per-boot secret
// (a random 32-byte seed hashed into the project factory), so the same
// probe sees the same plausible ledger within a boot — a probe that
// repeats the call cannot detect the regeneration — while two boots
// never share a ledger, so the decoy never becomes a fingerprint of the
// install. the digests ride the real engine of ./sha.ts (node:crypto,
// the same lane the chunk catalog trusts); the decoy is a server-side
// lane of the api — the browser face never imports it.

import { sha256Hex } from "./sha.ts";

/** the per-boot decoy seed — one random secret per process, never persisted. */
let bootseed: Uint8Array | null = null;

/**
 * The per-boot secret of the decoy factory. Generated once per process
 * from the platform randomness, never written anywhere: the decoy is a
 * stage play, not a record.
 *
 * @returns the 32-byte boot seed of the decoy lane.
 */
function thebootseed(): Uint8Array {
  if (bootseed === null) {
    const seed = new Uint8Array(32);
    globalThis.crypto.getRandomValues(seed);
    bootseed = seed;
  }
  return bootseed;
}

/**
 * The stable 32-byte digest of a string under the boot seed — the
 * deterministic backbone of the decoy ledger (the same label answers
 * the same bytes within a boot, and two labels never collide).
 *
 * @param label the label to digest.
 * @returns the 32 digest bytes.
 */
function digestof(label: string): Uint8Array {
  const seed = thebootseed();
  const hex = sha256Hex(`vault-decoy:${label}:${Array.from(seed, (byte) => byte.toString(16).padStart(2, "0")).join("")}`);
  const bytes = new Uint8Array(32);
  for (let index = 0; index < 32; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

/**
 * A stable non-negative integer below the ceiling derived from a label —
 * the numeric spine of the plausible ledger (sizes, counts, ages).
 *
 * @param label the label to draw from.
 * @param ceiling the exclusive ceiling.
 * @returns the drawn integer.
 */
function draw(label: string, ceiling: number): number {
  const bytes = digestof(label);
  const view = new DataView(bytes.buffer, bytes.byteOffset, 8);
  return Number(view.getBigUint64(0, true) % BigInt(Math.max(1, ceiling)));
}

/** the plausible project name parts the decoy ledger composes. */
const NAMEPARTS = [
  ["aurora", "harbor", "atlas", "ember", "quartz", "meadow", "lumen", "cedar", "fjord", "willow"],
  ["ledger", "archive", "studio", "catalog", "pipeline", "portfolio", "vault", "library", "index", "works"],
] as const;

/**
 * One plausible decoy project row — the exact public shape of a real
 * project listing (id, name, createdAt, bytes, objects) with zero truth
 * inside: the ids carry the pd- prefix of the real lane so the shape
 * matches, the names read like the real ones, and the numbers sit in the
 * believable band of a small working install.
 *
 * @param index the index of the row in the ledger.
 * @returns the decoy project row.
 */
function decoyrow(index: number): {
  id: string;
  name: string;
  createdAt: string;
  bytes: number;
  objects: number;
} {
  const head = NAMEPARTS[0][draw(`head:${index}`, NAMEPARTS[0].length)];
  const tail = NAMEPARTS[1][draw(`tail:${index}`, NAMEPARTS[1].length)];
  const serial = 1000 + draw(`serial:${index}`, 9000);
  const day = 1 + draw(`day:${index}`, 28);
  const month = 1 + draw(`month:${index}`, 12);
  const megabytes = 12 + draw(`mb:${index}`, 4200);
  const objects = 40 + draw(`objects:${index}`, 56000);
  return {
    id: `pd-${serial}${draw(`idsuffix:${index}`, 100000).toString().padStart(5, "0")}`,
    name: `${head} ${tail}`,
    createdAt: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    bytes: megabytes * 1024 * 1024,
    objects,
  };
}

/**
 * The decoy ledger — the plausible answer of the read surface to a
 * browser-shaped anonymous probe. The row count rides the believable
 * band (three to nine projects of a small install) and the rows derive
 * deterministically from the per-boot seed so the repeated probe reads
 * the same world.
 *
 * @returns the decoy ledger rows.
 */
export function decoyledger(): ReturnType<typeof decoyrow>[] {
  const count = 3 + draw("count", 7);
  const rows: ReturnType<typeof decoyrow>[] = [];
  for (let index = 0; index < count; index += 1) {
    rows.push(decoyrow(index));
  }
  return rows;
}

/**
 * The probe verdict: does the request shape ride the decoy lane? The one
 * signature the decoy answers is the browser/scanner accept header
 * (text/html) — the shape a crawler, a scanner or a lost human sends and
 * no api client of this surface ever sends. Everything else (bare, json,
 * star-slash-star) keeps the honest refusal contract.
 *
 * @param acceptheader the accept header of the request (lowercased).
 * @returns true when the shape is the browser probe.
 */
export function isprobe(acceptheader: string | undefined): boolean {
  return typeof acceptheader === "string" && acceptheader.toLowerCase().includes("text/html");
}

/**
 * The encrypted decoy payload — the download leg of the law. A probe
 * that reaches for the database face receives bytes shaped like the real
 * encrypted store (the magic header, a plausible length) with zero truth
 * inside: the body is the decoy ledger serialized under a throwaway
 * keystream of the boot seed, so the download looks sealed while the
 * real base never rides the answer.
 *
 * @returns the encrypted decoy bytes (the plausible store face).
 */
export function encrypteddecoy(): Uint8Array {
  const body = new TextEncoder().encode(JSON.stringify({ projects: decoyledger() }));
  const keystream = digestof("download");
  const sealed = new Uint8Array(body.length);
  for (let index = 0; index < body.length; index += 1) {
    sealed[index] = body[index] ^ keystream[index % keystream.length];
  }
  /* the plausible store face: the sqlite magic prefix every probe
   * greps for, the sealed body behind it. */
  const face = new Uint8Array(16 + sealed.length);
  face.set([0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00], 0);
  face.set(sealed, 16);
  return face;
}
