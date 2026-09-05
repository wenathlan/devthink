/**
 * @file validate.test.ts
 * @description
 *  Tests for the canonical validation helpers of maene, merged into
 *  `../config.js` by the v2.1.14 consolidation (former `../validate.js`).
 *  Confirms the shape and behaviour of the exported pure-function
 *  validators: `isValidEmail`, `isValidSemver`, `isValidProjectId`,
 *  `validateAccount`, `validateModelId`.
 *
 *  Uses `node:test` + `node:assert/strict`. Imports only leaf modules.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { isValidEmail, isValidSemver, isValidProjectId, validateAccount, validateModelId } from "../../config.js";

test("isValidEmail accepts valid addresses and rejects invalid ones", () => {
  try {
    assert.equal(isValidEmail("user@example.com"), true);
    assert.equal(isValidEmail("first.last@sub.example.org"), true);
    assert.equal(isValidEmail("a@b.co"), true);

    assert.equal(isValidEmail(""), false);
    assert.equal(isValidEmail("not-an-email"), false);
    assert.equal(isValidEmail("missing@domain"), false);
    assert.equal(isValidEmail("missing-domain@"), false);
    assert.equal(isValidEmail("   "), false);
  } catch (err) {
    assert.fail(`isValidEmail check failed: ${(err as Error).message}`);
  }
});

test("isValidEmail handles nullish / non-string inputs gracefully", () => {
  try {
    // The validator coerces via String(... ?? "") so null/undefined should
    // return false instead of throwing.
    assert.equal(isValidEmail(null as unknown as string), false);
    assert.equal(isValidEmail(undefined as unknown as string), false);
  } catch (err) {
    assert.fail(`isValidEmail nullish check failed: ${(err as Error).message}`);
  }
});

test("isValidSemver accepts semver and semver-with-prerelease/build", () => {
  try {
    assert.equal(isValidSemver("1.2.3"), true);
    assert.equal(isValidSemver("2.1.0-rc.1"), true);
    assert.equal(isValidSemver("0.0.1+build.42"), true);

    assert.equal(isValidSemver(""), false);
    assert.equal(isValidSemver("v1.2.3"), false, "leading v must NOT pass per the strict regex");
    assert.equal(isValidSemver("1.2"), false);
    assert.equal(isValidSemver("not-a-version"), false);
  } catch (err) {
    assert.fail(`isValidSemver check failed: ${(err as Error).message}`);
  }
});

test("isValidProjectId accepts valid ids and the special fallback project id", () => {
  try {
    // The canonical fallback project id must pass (hardcoded special-case).
    assert.equal(isValidProjectId("rising-fact-p41fc"), true);

    // Valid generic id: lowercase letters + digits + dashes, length 6..30,
    // first char alpha, last char alnum (per the regex).
    assert.equal(isValidProjectId("rising-fact-p41"), true);

    // Invalid cases.
    assert.equal(isValidProjectId(""), false);
    assert.equal(isValidProjectId("UPPER"), false, "uppercase must fail");
    assert.equal(isValidProjectId("ab"), false, "too short must fail");
  } catch (err) {
    assert.fail(`isValidProjectId check failed: ${(err as Error).message}`);
  }
});

test("validateAccount returns valid for a well-formed account", () => {
  try {
    const result = validateAccount({
      email: "user@example.com",
      refreshToken: "0123456789abcdef", // length >= 10
    });
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  } catch (err) {
    assert.fail(`validateAccount valid check failed: ${(err as Error).message}`);
  }
});

test("validateAccount flags null account, bad email, short refresh token", () => {
  try {
    const nullRes = validateAccount(null);
    assert.equal(nullRes.valid, false);
    assert.ok(nullRes.errors.length > 0);

    const badEmail = validateAccount({ email: "not-an-email", refreshToken: "0123456789abcdef" });
    assert.equal(badEmail.valid, false);
    assert.ok(badEmail.errors.some((e) => e.includes("email")));

    const shortRt = validateAccount({ email: "user@example.com", refreshToken: "short" });
    assert.equal(shortRt.valid, false);
    assert.ok(shortRt.errors.some((e) => e.includes("refreshToken")));
  } catch (err) {
    assert.fail(`validateAccount invalid check failed: ${(err as Error).message}`);
  }
});

test("validateModelId accepts gemini/claude/antigravity ids and rejects unrelated ones", () => {
  try {
    // validateModelId checks lowercased id contains one of
    // gemini / claude / antigravity substrings.
    assert.equal(validateModelId("gemini-3.1-pro"), true);
    assert.equal(validateModelId("Claude-Opus-4-6-Thinking"), true, "case-insensitive");
    assert.equal(validateModelId("antigravity-gemini-3-flash"), true);

    assert.equal(validateModelId("gpt-4"), false, "gpt-only must fail");
    assert.equal(validateModelId("foo"), false);
    assert.equal(validateModelId(""), false);
  } catch (err) {
    assert.fail(`validateModelId check failed: ${(err as Error).message}`);
  }
});
