// # chunks.test — the 256KB chunk pipeline of the vault, runnable with the
// house vitest suite:
//   bunx vitest run tests/chunks.test.ts
// Real bytes ride the whole pipeline: the split answers the exact window
// counts, every window digests through the real sha-256, reassembly is
// byte-equal, identical windows reuse one digest, brotli only packs when it
// wins, and a tampered stored chunk answers broken.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  CHUNK_BYTES,
  type ChunkSlice,
  chunkIntact,
  decodeChunk,
  encodeChunk,
  manifestEntryOf,
  reassemble,
  split,
  tierFor,
} from "../chunks.ts";
import { mulberry32 } from "../objects.ts";
import { sha256Hex } from "../sha.ts";

/** deterministic pseudo-random bytes from the family prng — the same seed always answers the same bytes. */
function seededBytes(seed: number, length: number): Uint8Array {
  const rand = mulberry32(seed);
  const bytes = new Uint8Array(length);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Math.floor(rand() * 256);
  }
  return bytes;
}

/** the byte-for-byte comparison of two byte arrays. */
function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  return left.length === right.length && Buffer.from(left).equals(Buffer.from(right));
}

/** a compressible text payload — repetitive prose, the kind brotli loves. */
function compressibleText(length: number): Uint8Array {
  const phrase = "the vault keeps the bytes, the ledger keeps the truth · ";
  const text = phrase.repeat(Math.ceil(length / phrase.length)).slice(0, length);
  return new TextEncoder().encode(text);
}

describe("the 256KB window", () => {
  it("splits at the real boundaries", () => {
    assert.equal(split(new Uint8Array(0)).length, 0, "empty bytes answer zero slices");
    assert.equal(split(seededBytes(1, 1)).length, 1);
    assert.equal(split(seededBytes(2, CHUNK_BYTES)).length, 1, "exactly one window");
    assert.equal(split(seededBytes(3, CHUNK_BYTES + 1)).length, 2, "one byte past the window answers two");
    assert.equal(split(seededBytes(4, 1_000_000)).length, 4);
    assert.equal(split(seededBytes(5, 2_000_000)).length, 8);
  });

  it("answers the real sha-256 of every window", () => {
    const bytes = seededBytes(6, 600_000);
    const slices = split(bytes);
    for (const slice of slices) {
      assert.equal(slice.digest, sha256Hex(slice.bytes), "the window digest is the real hash");
      assert.match(slice.digest, /^[0-9a-f]{64}$/);
    }
    assert.equal(slices.length, 3, "600KB walks three windows");
    assert.equal(slices[0].bytes.length, CHUNK_BYTES);
    assert.equal(slices[1].bytes.length, CHUNK_BYTES);
    assert.equal(slices[2].bytes.length, 600_000 - 2 * CHUNK_BYTES);
  });

  it("reassembles the whole object byte for byte", () => {
    const bytes = seededBytes(7, 1_000_000);
    const whole = reassemble(split(bytes).map((slice: ChunkSlice) => slice.bytes));
    assert.equal(whole.length, bytes.length);
    assert.ok(bytesEqual(whole, bytes), "the roundtrip is byte-equal");
    assert.ok(bytesEqual(reassemble([]), new Uint8Array(0)), "empty parts answer empty bytes");
  });

  it("reuses identical windows by digest — the dedupe key", () => {
    const window = seededBytes(8, CHUNK_BYTES);
    const repeated = new Uint8Array(window.length * 3);
    repeated.set(window, 0);
    repeated.set(window, window.length);
    repeated.set(window, window.length * 2);
    const slices = split(repeated);
    assert.equal(slices.length, 3);
    assert.equal(new Set(slices.map((slice) => slice.digest)).size, 1, "identical windows share one digest");
  });
});

describe("the encoding", () => {
  it("stores compressible chunks packed and random chunks raw", () => {
    const packedSlices = split(compressibleText(CHUNK_BYTES * 2 + 75_712));
    const stored = packedSlices.map(encodeChunk);
    assert.equal(stored.length, 3);
    for (const chunk of stored) {
      assert.equal(chunk.encoding, "brotli", "repetitive prose rides brotli");
      assert.ok(chunk.data.length < chunk.size, "the packed form is strictly smaller");
    }
    const rawStored = split(seededBytes(9, 300_000)).map(encodeChunk);
    for (const chunk of rawStored) {
      assert.equal(chunk.encoding, "raw", "random bytes stay uncompressed — brotli never wins there");
      assert.equal(chunk.data.length, chunk.size);
    }
  });

  it("decodes every stored chunk back to its window", () => {
    const slices = [...split(compressibleText(400_000)), ...split(seededBytes(10, 300_000))];
    for (const slice of slices) {
      const chunk = encodeChunk(slice);
      const raw = decodeChunk(chunk);
      assert.ok(bytesEqual(raw, slice.bytes), "the decoded window is byte-equal");
      assert.equal(chunkIntact(chunk), true, "the stored chunk answers for its digest");
    }
  });

  it("answers the manifest entry of a stored chunk honestly", () => {
    const chunk = encodeChunk(split(compressibleText(CHUNK_BYTES))[0]);
    const entry = manifestEntryOf(chunk);
    assert.equal(entry.digest, chunk.digest);
    assert.equal(entry.size, chunk.size);
    assert.equal(entry.encoding, chunk.encoding);
    assert.equal(entry.stored, chunk.data.length);
    assert.ok(entry.stored < entry.size, "the packed entry records the smaller stored size");
  });

  it("detects a tampered stored chunk", () => {
    const chunk = encodeChunk(split(seededBytes(11, 5_000))[0]);
    assert.equal(chunk.encoding, "raw");
    const tampered = { ...chunk, data: Uint8Array.from(chunk.data) };
    tampered.data[0] ^= 0xff;
    assert.equal(chunkIntact(tampered), false, "a moved byte breaks the stored chunk");
    assert.equal(chunkIntact(chunk), true);
  });
});

describe("the tier law", () => {
  it("sends the masters and the giants to l3, the small rows to warm", () => {
    assert.equal(tierFor(4, "image/png"), "l3");
    assert.equal(tierFor(4, "video/mp4"), "l3");
    assert.equal(tierFor(4, "application/octet-stream"), "l3");
    assert.equal(tierFor(1_000_001, "text/plain"), "l3", "past the 1,000,000-byte threshold rides cold");
    assert.equal(tierFor(1_000_000, "text/plain"), "warm");
    assert.equal(tierFor(12_800, "text/markdown"), "warm");
    assert.equal(tierFor(148_204, "application/json"), "warm");
  });
});
