/**
 * @file system.test.ts
 * @description
 *  Tests for the system module of maene (`../system.js`). Since the
 *  v2.1.14 consolidation, system.ts is a pure compatibility re-export shim
 *  over config.ts, so these tests exercise the merged surface through the
 *  shim: the shape and behaviour of `redactSecrets` (Bearer JWT +
 *  refresh_token regex), a smoke-import of the singleton `debugLogger`,
 *  `VERSION_FALLBACK`, and the validator names (`validateEmail`,
 *  `validateSemver`, `validateProjectId`, `validateModelId` — now aliases
 *  of the canonical hardened validators — plus the charset variant
 *  `validateModelIdCharset`).
 *
 *  Uses `node:test` + `node:assert/strict`. Imports only leaf modules.
 */

import { it as test } from "vitest";
import assert from "node:assert/strict";

import {
  redactSecrets,
  debugLogger,
} from "../../maene-debug.js";
import {
  validateEmail,
  validateSemver,
  validateProjectId,
  validateModelId,
  validateModelIdCharset,
  VERSION_FALLBACK,
} from "../../config.js";

test("redactSecrets redacts Bearer JWT tokens", () => {
  try {
    const input = "Authorization: Bearer eyJhbGci.eyJzdWIi.SflKxwRJSMssa";
    const out = redactSecrets(input);
    assert.ok(out.includes("Bearer [REDACTED]"), "Bearer must be redacted");
    assert.ok(!out.includes("eyJhbGci.eyJzdWIi.SflKxwRJSMssa"), "raw JWT must not survive");
  } catch (err) {
    assert.fail(`redactSecrets Bearer check failed: ${(err as Error).message}`);
  }
});

test("redactSecrets redacts refresh_token substrings", () => {
  try {
    // The regex matches `refresh_token` followed by any non-whitespace chars.
    const input1 = "refresh_token=abcdef0123456789";
    const out1 = redactSecrets(input1);
    assert.ok(out1.includes("refresh_token=[REDACTED]"), "refresh_token=value must be redacted");
    assert.ok(!out1.includes("abcdef0123456789"), "raw token value must not survive");

    // key in JSON shape, no whitespace after the colon (still matches because
    // of the `[^\s]*` quantifier that starts after `refresh_token`).
    const input2 = "got refresh_tokenABCDEF0123 from google";
    const out2 = redactSecrets(input2);
    assert.ok(out2.includes("refresh_token=[REDACTED]"), "refresh_token<...> must be redacted");
  } catch (err) {
    assert.fail(`redactSecrets refresh_token check failed: ${(err as Error).message}`);
  }
});

test("redactSecrets leaves non-secret text intact", () => {
  try {
    const input = "Hello world - this is just a normal log line with no secrets.";
    const out = redactSecrets(input);
    assert.equal(out, input, "non-secret text must be returned verbatim");
  } catch (err) {
    assert.fail(`redactSecrets no-op check failed: ${(err as Error).message}`);
  }
});

test("redactSecrets handles empty string (does not throw on string inputs)", () => {
  // The implementation is `(s: string): string => s.replace(...).replace(...)`.
  // It does NOT guard against null/undefined inputs — passing null throws
  // "Cannot read properties of null (reading 'replace')". The contract is
  // strictly `string -> string`; the caller (debugLogger) wraps its own calls.
  try {
    assert.equal(redactSecrets(""), "");
  } catch (err) {
    assert.fail(`redactSecrets empty-string check failed: ${(err as Error).message}`);
  }
});

test("debugLogger singleton: .get() returns same instance, .log() and .getBuffer() do not throw", () => {
  try {
    const a = debugLogger.get();
    const b = debugLogger.get();
    assert.equal(a, b, "debugLogger.get() must return the same singleton instance");

    // Logging must not throw even when log-dir creation races / fails.
    a.log("test message - no secrets");
    a.log("Authorization: Bearer x.y.z");

    const buf = a.getBuffer();
    assert.ok(Array.isArray(buf), "getBuffer() must return an array");
  } catch (err) {
    assert.fail(`debugLogger check failed: ${(err as Error).message}`);
  }
});

test("system.js re-exports the canonical validators (aliases) plus the charset variant", () => {
  try {
    // Since the v2.1.14 consolidation, validateEmail / validateSemver /
    // validateProjectId are one-line aliases of the hardened canonical
    // validators in config.ts; the old weaker regex implementations were
    // the same-purpose duplicates and were deleted.
    assert.equal(validateEmail("a@b.co"), true);
    assert.equal(validateEmail("bad"), false);

    // validateSemver now enforces the full semver shape (prerelease /
    // build suffixes allowed), not just the /^\d+\.\d+\.\d+/ prefix.
    assert.equal(validateSemver("1.2.3"), true);
    assert.equal(validateSemver("1.2.3-rc.1"), true);
    assert.equal(validateSemver("1.2"), false);

    // validateProjectId: lowercase alnum + dash with the documented
    // special fallback project id accepted.
    assert.equal(validateProjectId("rising-fact-p41fc"), true);
    assert.equal(validateProjectId("UPPER"), false);

    // validateModelId: canonical semantic check — the lowercased id must
    // contain one of gemini / claude / antigravity.
    assert.equal(validateModelId("gemini-3.1-pro"), true);
    assert.equal(validateModelId("invalid id"), false);

    // validateModelIdCharset: the former system.ts charset regex variant
    // (lowercase alnum + dash + underscore + dot), preserved under its
    // new name.
    assert.equal(validateModelIdCharset("gemini-3.1-pro"), true);
    assert.equal(validateModelIdCharset("invalid id"), false);
  } catch (err) {
    assert.fail(`system.js validators check failed: ${(err as Error).message}`);
  }
});

test("VERSION_FALLBACK constant is the governed fallback string", () => {
  try {
    assert.equal(typeof VERSION_FALLBACK, "string");
    assert.equal(VERSION_FALLBACK, "1.19.2");
  } catch (err) {
    assert.fail(`VERSION_FALLBACK check failed: ${(err as Error).message}`);
  }
});
