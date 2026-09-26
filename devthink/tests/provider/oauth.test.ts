/**
 * @file oauth.test.ts
 * @description
 *  Tests for the pure PKCE / crypto helpers exported from the consolidated
 *  authentication module (`../auth.js`, v2.1.14 merge of oauth.ts +
 *  antigravity-cli.ts into auth.ts). Strictly tests ONLY the pure functions
 *  (`generatePKCE`, `buildAuthUrl`, `extractCodeFromUrl`,
 *  `isValidTokenResponse`) — does NOT trigger the OAuth server flow, does NOT
 *  spin up a callback server, does NOT call out to the network.
 *
 *  Per RFC 7636: the verifier is a high-entropy base64url string of length
 *  43..128; the challenge is BASE64URL(SHA256(verifier_ascii_bytes)) with
 *  no padding. maene's `generatePKCE` uses 64 random bytes -> 86 chars,
 *  method "S256".
 *
 *  Uses `node:test` + `node:assert/strict`. Imports only leaf modules; the
 *  consolidated auth module pulls only `node:*` builtins + global fetch.
 */

import { it as test } from "vitest";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { generatePKCE, buildAuthUrl, extractCodeFromUrl, isValidTokenResponse } from "../../oauth.js";

test("generatePKCE returns a non-empty verifier + base64url S256 challenge + method S256", () => {
  try {
    const pkce = generatePKCE();
    assert.ok(pkce, "generatePKCE must return an object");
    assert.equal(typeof pkce.verifier, "string", "verifier must be a string");
    assert.ok(pkce.verifier.length >= 43, "verifier must be >= 43 chars per RFC 7636");
    assert.ok(pkce.verifier.length <= 128, "verifier must be <= 128 chars per RFC 7636");
    assert.equal(typeof pkce.challenge, "string", "challenge must be a string");
    assert.ok(pkce.challenge.length > 0, "challenge must be non-empty");
    assert.equal(pkce.method, "S256", "method must be S256");

    // Verifier must be base64url: no '+', '/', or '='.
    assert.ok(!/[+/=]/.test(pkce.verifier), "verifier must be base64url (no +, /, =)");

    // Challenge must be base64url too.
    assert.ok(!/[+/=]/.test(pkce.challenge), "challenge must be base64url (no +, /, =)");
  } catch (err) {
    assert.fail(`generatePKCE shape check failed: ${(err as Error).message}`);
  }
});

test("generatePKCE challenge equals base64url(sha256(verifier_ascii))", () => {
  try {
    const pkce = generatePKCE();
    // RFC 7636 S256: challenge = base64url(SHA256(verifier ASCII bytes)).
    const expected = createHash("sha256")
      .update(pkce.verifier) // ASCII bytes of the verifier string
      .digest("base64url");
    assert.equal(pkce.challenge, expected, "challenge must match RFC 7636 S256");
  } catch (err) {
    assert.fail(`generatePKCE S256 check failed: ${(err as Error).message}`);
  }
});

test("generatePKCE verifier + challenge are unique across two calls", () => {
  try {
    const a = generatePKCE();
    const b = generatePKCE();
    assert.notEqual(a.verifier, b.verifier, "two verifiers must differ (cryptographic randomness)");
    assert.notEqual(a.challenge, b.challenge, "two challenges must differ");
  } catch (err) {
    assert.fail(`generatePKCE uniqueness check failed: ${(err as Error).message}`);
  }
});

test("buildAuthUrl builds a valid OAuth URL with state, client_id, and PKCE challenge", () => {
  try {
    const pkce = generatePKCE();
    const url = buildAuthUrl(pkce, "http://127.0.0.1:12345/callback");
    assert.ok(url.startsWith("https://accounts.google.com/"), "must target Google OAuth");
    const parsed = new URL(url);
    assert.ok(parsed.searchParams.get("client_id"), "client_id must be present and non-empty");
    assert.equal(parsed.searchParams.get("response_type"), "code");
    assert.equal(parsed.searchParams.get("redirect_uri"), "http://127.0.0.1:12345/callback");
    assert.equal(parsed.searchParams.get("code_challenge"), pkce.challenge);
    assert.equal(parsed.searchParams.get("code_challenge_method"), "S256");
    assert.equal(parsed.searchParams.get("access_type"), "offline");
    assert.ok(parsed.searchParams.get("state"), "state must be present and non-empty");
  } catch (err) {
    assert.fail(`buildAuthUrl check failed: ${(err as Error).message}`);
  }
});

test("buildAuthUrl works without a PKCE pair (state-only Gemini CLI parity)", () => {
  try {
    const url = buildAuthUrl(null, "http://127.0.0.1:9999/callback");
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("code_challenge"), null, "code_challenge must be absent when no PKCE");
    assert.equal(
      parsed.searchParams.get("code_challenge_method"),
      null,
      "code_challenge_method must be absent when no PKCE",
    );
    assert.ok(parsed.searchParams.get("state"), "state must still be present");
  } catch (err) {
    assert.fail(`buildAuthUrl no-PKCE check failed: ${(err as Error).message}`);
  }
});

test("extractCodeFromUrl extracts the authorization code from a callback URL", () => {
  try {
    const code = extractCodeFromUrl("http://127.0.0.1:12345/callback?code=4/0AX4-abcdef&state=st");
    assert.equal(code, "4/0AX4-abcdef");
  } catch (err) {
    assert.fail(`extractCodeFromUrl valid check failed: ${(err as Error).message}`);
  }
});

test("extractCodeFromUrl returns null when no code param is present", () => {
  try {
    const code = extractCodeFromUrl("http://127.0.0.1:12345/callback?error=access_denied");
    assert.equal(code, null, "must return null when there is no code");
  } catch (err) {
    assert.fail(`extractCodeFromUrl no-code check failed: ${(err as Error).message}`);
  }
});

test("isValidTokenResponse accepts well-formed objects and rejects malformed ones", () => {
  try {
    // The actual validator requires access_token (string), expires_at (number),
    // and expires_in (number). It does NOT require token_type.
    assert.ok(
      isValidTokenResponse({ access_token: "abc", expires_at: 1234, expires_in: 3600 }),
      "well-formed token response (access_token + expires_at + expires_in) must be valid",
    );

    // null/empty/string — all falsy return values (the impl short-circuits
    // via `obj && ...`, so null returns null, not strictly false).
    assert.ok(!isValidTokenResponse(null), "null must be falsy/invalid");
    assert.ok(!isValidTokenResponse({}), "empty object must be invalid (missing access_token)");
    assert.ok(!isValidTokenResponse("string"), "string must be invalid");

    // Missing one of the required number fields must also fail.
    assert.ok(!isValidTokenResponse({ access_token: "abc", expires_in: 3600 }), "missing expires_at must be invalid");
  } catch (err) {
    assert.fail(`isValidTokenResponse check failed: ${(err as Error).message}`);
  }
});

test("oauth module import smoke (does not throw on side-effect-free import)", () => {
  // The act of importing the module already happened at the top of this file.
  // If the module had any module-eval-time error, this test file would never
  // have loaded. So this test is a no-op smoke assertion.
  assert.ok(true, "oauth module imported without throwing");
});
