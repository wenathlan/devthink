/**
 * @file fingerprint.test.ts
 * @description
 *  Tests for the pure hashing helpers exported from the fingerprint module
 *  (`../fingerprint.js`). Confirms FNV-1a-32 determinism, format, and
 *  distinctness; also smoke-tests `generateSessionId` and the 64-bit
 *  variant for shape.
 *
 *  The fingerprint module uses `node:crypto` + `node:os` + `node:path`
 *  only — safe to import. Does NOT touch the network.
 *
 *  Uses `node:test` + `node:assert/strict`. Imports only leaf modules.
 */

import { it as test } from "vitest";
import assert from "node:assert/strict";

import {
  fnv1a32,
  fnv1a32Hex,
  fnv1a64,
  generateSessionUuid,
  secureRandom,
  pickRandom,
  getJitterMs,
} from "../../fingerprint.js";

test("fnv1a32Hex returns an 8-char hex string (32-bit hash)", () => {
  try {
    // v2.1.15 Phase B: the hex-string form is fnv1a32Hex (core.js owner);
    // fnv1a32 is the numeric hash of the same bytes.
    const h = fnv1a32Hex("hello");
    assert.equal(typeof h, "string", "fnv1a32Hex must return a string");
    assert.equal(h.length, 8, "fnv1a32Hex must return 8 hex chars (32 bits, padded)");
    assert.ok(/^[0-9a-f]{8}$/.test(h), "fnv1a32Hex must match /^[0-9a-f]{8}$/");
  } catch (err) {
    assert.fail(`fnv1a32Hex format check failed: ${(err as Error).message}`);
  }
});

test("fnv1a32 is deterministic: same input -> same output", () => {
  try {
    const a = fnv1a32("maene");
    const b = fnv1a32("maene");
    assert.equal(a, b, "same input must produce identical hash");
  } catch (err) {
    assert.fail(`fnv1a32 determinism check failed: ${(err as Error).message}`);
  }
});

test("fnv1a32 is distinct: different inputs -> different outputs", () => {
  try {
    const a = fnv1a32("maene");
    const b = fnv1a32("Maene"); // different case, different bytes -> different hash
    const c = fnv1a32("other-input");
    assert.notEqual(a, b, "case-different inputs must hash differently");
    assert.notEqual(a, c, "different inputs must hash differently");
  } catch (err) {
    assert.fail(`fnv1a32 distinctness check failed: ${(err as Error).message}`);
  }
});

test("fnv1a32 of empty string matches the FNV offset basis (FNV_OFFSET_BASIS)", () => {
  // FNV-1a of empty input is the offset basis: 0x811c9dc5 = "811c9dc5".
  try {
    const h = fnv1a32Hex("");
    assert.equal(h, "811c9dc5", "fnv1a32Hex('') must equal the FNV offset basis");
  } catch (err) {
    assert.fail(`fnv1a32 empty check failed: ${(err as Error).message}`);
  }
});

test("fnv1a64 returns a 16-char hex string (BigInt-based)", () => {
  try {
    const h = fnv1a64("hello");
    assert.equal(typeof h, "string");
    assert.equal(h.length, 16, "fnv1a64 must return 16 hex chars (64 bits, padded)");
    assert.ok(/^[0-9a-f]{16}$/.test(h), "fnv1a64 must match /^[0-9a-f]{16}$/");
  } catch (err) {
    assert.fail(`fnv1a64 format check failed: ${(err as Error).message}`);
  }
});

test("fnv1a64 is deterministic for the same input", () => {
  try {
    const a = fnv1a64("maene");
    const b = fnv1a64("maene");
    assert.equal(a, b, "same input must produce identical 64-bit hash");
    assert.notEqual(a, fnv1a64("other"), "different inputs must produce different hashes");
  } catch (err) {
    assert.fail(`fnv1a64 determinism check failed: ${(err as Error).message}`);
  }
});

test("generateSessionUuid returns a deterministic pseudo-UUID (same dir -> same id)", () => {
  try {
    const a = generateSessionUuid("/home/z/maene-work/maene");
    const b = generateSessionUuid("/home/z/maene-work/maene");
    assert.equal(typeof a, "string");
    assert.ok(a.length > 0, "session id must be non-empty");
    assert.equal(a, b, "same dir must produce the same session id");
    // Pseudo-UUID shape: 8-4-4-4-12-ish (the implementation slices a bit
    // differently, but should contain dashes).
    assert.ok(a.includes("-"), "session id must contain dashes");
  } catch (err) {
    assert.fail(`generateSessionId check failed: ${(err as Error).message}`);
  }
});

test("generateSessionId differs across distinct directories", () => {
  try {
    const a = generateSessionUuid("/home/z/maene-work/maene");
    const b = generateSessionUuid("/tmp/another-folder");
    assert.notEqual(a, b, "different dirs must produce different session ids");
  } catch (err) {
    assert.fail(`generateSessionId distinctness check failed: ${(err as Error).message}`);
  }
});

test("secureRandom returns a float in [0,1)", () => {
  try {
    const r = secureRandom();
    assert.equal(typeof r, "number");
    assert.ok(r >= 0 && r < 1, "secureRandom must be in [0,1)");
  } catch (err) {
    assert.fail(`secureRandom check failed: ${(err as Error).message}`);
  }
});

test("pickRandom returns an element from the provided pool", () => {
  try {
    const pool = [1, 2, 3, 4, 5];
    const v = pickRandom(pool);
    assert.ok(pool.includes(v), "pickRandom must return an element of the pool");
  } catch (err) {
    assert.fail(`pickRandom check failed: ${(err as Error).message}`);
  }
});

test("getJitterMs returns an integer in [min, max]", () => {
  try {
    const v = getJitterMs(0, 80);
    assert.equal(typeof v, "number");
    assert.ok(Number.isInteger(v), "getJitterMs must return an integer (Math.floor)");
    assert.ok(v >= 0 && v <= 80, "getJitterMs(0,80) must be in [0,80]");
  } catch (err) {
    assert.fail(`getJitterMs check failed: ${(err as Error).message}`);
  }
});
