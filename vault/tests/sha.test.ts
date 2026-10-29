// # sha.test — the real digest engine of the vault, runnable with the
// house vitest suite:
//   bunx vitest run tests/sha.test.ts
// The digests answer the published NIST vectors verbatim, real binary bytes
// digest deterministically, and one moved byte breaks the answer — the
// tamper gate the whole storage stack trusts.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { digestMatches, isSha1Hex, isSha256Hex, sha1Hex, sha256Hex } from "../sha.ts";
import { mulberry32 } from "../objects.ts";

/** deterministic pseudo-random bytes from the family prng — the same seed always answers the same bytes. */
function seededBytes(seed: number, length: number): Uint8Array {
  const rand = mulberry32(seed);
  const bytes = new Uint8Array(length);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Math.floor(rand() * 256);
  }
  return bytes;
}

describe("real digests", () => {
  it("answers the published vectors verbatim", () => {
    assert.equal(sha256Hex(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    assert.equal(sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    assert.equal(
      sha256Hex("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"),
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
    );
    assert.equal(sha1Hex("abc"), "a9993e364706816aba3e25717850c26c9cd0d89d");
    assert.equal(sha1Hex(""), "da39a3ee5e6b4b0d3255bfef95601890afd80709");
  });

  it("digests real binary bytes deterministically", () => {
    const bytes = seededBytes(41, 70_000);
    const digest = sha256Hex(bytes);
    assert.match(digest, /^[0-9a-f]{64}$/);
    assert.equal(sha256Hex(bytes), digest, "the same bytes always answer the same digest");
    assert.equal(sha256Hex(seededBytes(41, 70_000)), digest, "the same seed answers the same bytes");
    assert.notEqual(sha256Hex(seededBytes(42, 70_000)), digest);
    assert.equal(sha1Hex(bytes).length, 40);
  });

  it("detects a moved byte through the real hash", () => {
    const bytes = seededBytes(43, 4096);
    const digest = sha256Hex(bytes);
    bytes[3] ^= 0xff;
    assert.notEqual(sha256Hex(bytes), digest, "one moved byte breaks the digest");
    assert.equal(digestMatches(bytes, digest, "sha256"), false);
    assert.equal(digestMatches(bytes, sha256Hex(bytes), "sha256"), true);
  });

  it("validates the digest shapes without guessing", () => {
    assert.equal(isSha256Hex(sha256Hex("vault")), true);
    assert.equal(isSha256Hex(sha1Hex("vault")), false);
    assert.equal(isSha1Hex(sha1Hex("vault")), true);
    assert.equal(isSha256Hex("".padEnd(64, "g")), false);
    assert.equal(isSha1Hex("".padEnd(40, "z")), false);
  });
});
