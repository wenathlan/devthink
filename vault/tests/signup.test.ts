// # signup.test — the signup lane of the vault (the person's door), runnable
// with the house vitest suite:
//   bunx vitest run tests/signup.test.ts
// The security laws the battery pins: the password lands only as its salted
// sha-256 digest (the raw table row never carries the plaintext), the api
// key rides exactly the one creation answer — the store keeps only the
// digest (the raw apikeys row never carries the plaintext key), the
// shown-once answer never answers again from any later read, the per-bucket
// quota answers the generous 900MB floor at registration and bends to the
// owner's word (bytes at any scale or unlimited — never a fixed cap), and
// the routes answer over the real server (signup, signin, register, keys,
// quota — the credential doors beside the bearer doors).
import assert from "node:assert/strict";
import { afterAll, describe, it } from "vitest";
import "./doorisolation.ts";
import { queryAll, queryOne } from "../db.ts";
import { API_KEY_PREFIX, apiKeyLookup, databaseIdValid, issueApiKey, registerDatabase, revokeApiKey, setDatabaseQuota, signinAccount, signupAccount } from "../signup.ts";
import { QUOTA_FLOOR_BYTES } from "../quota.ts";
import { sha256Hex } from "../sha.ts";

/** the real server of the vault (the person's door routes). */
const { createVaultServer, listenVault } = await import("../api.ts");

/** the booted base url of the server. */
let base = "";

/** one json post against the booted server. */
async function post(path: string, body: unknown, headers: Record<string, string> = {}): Promise<{ status: number; body: any }> {
  const answer = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  return { status: answer.status, body: await answer.json().catch(() => null) };
}

/** one json get against the booted server. */
async function get(path: string, headers: Record<string, string> = {}): Promise<{ status: number; body: any }> {
  const answer = await fetch(`${base}${path}`, { headers });
  return { status: answer.status, body: await answer.json().catch(() => null) };
}

afterAll(async () => {
  const { closeQueryLanes } = await import("../querylane.ts");
  closeQueryLanes();
});

describe("the signup and signin doors", () => {
  it("signs the person up and refuses the taken email honestly", () => {
    const first = signupAccount("person@example.org", "honest words");
    assert.ok("account" in first);
    assert.equal(first.account.email, "person@example.org");
    const taken = signupAccount("person@example.org", "other words");
    assert.ok("refusal" in taken);
    assert.equal(taken.refusal.kind, "taken");
  });

  it("refuses the dishonest shapes (the email and the short password)", () => {
    assert.equal(signupAccount("not-an-email", "honest words").refusal?.kind, "invalid");
    assert.equal(signupAccount("person@example.org", "short").refusal?.kind, "invalid");
  });

  it("verifies the signin against the stored digest and refuses the wrong password", () => {
    const ok = signinAccount("person@example.org", "honest words");
    assert.ok("account" in ok);
    const wrong = signinAccount("person@example.org", "wrong words");
    assert.ok("refusal" in wrong);
    assert.equal(wrong.refusal.kind, "wrong");
    assert.ok("refusal" in signinAccount("nobody@example.org", "honest words"));
  });

  it("stores the password only as its salted digest — never the plaintext", () => {
    const row = queryOne<{ email: string; passwordDigest: string }>(
      "SELECT email, passwordDigest FROM accounts WHERE email = ?",
      ["person@example.org"],
    );
    assert.ok(row);
    assert.notEqual(row.passwordDigest, "honest words");
    assert.match(row.passwordDigest, /^[0-9a-f]{64}$/, "the digest rides the sha-256 hex shape");
    assert.equal(row.passwordDigest.length, 64);
  });
});

describe("the registration (the shown-once moment)", () => {
  it("registers the app database and answers the key exactly once", () => {
    const answer = registerDatabase("person@example.org", "honest words", "the first app");
    assert.ok(answer.answer, answer.refusal?.why);
    const { database, key, keyId } = answer.answer!;
    assert.match(database.id, /^db-[0-9a-f]{12}$/);
    assert.equal(database.name, "the first app");
    assert.equal(database.quotaBytes, QUOTA_FLOOR_BYTES, "the generous 900MB floor answers at creation");
    assert.ok(key.startsWith(API_KEY_PREFIX));
    assert.equal(key.length, API_KEY_PREFIX.length + 48);
    /* the store keeps only the digest: the raw key row never carries the
     * plaintext, and the digest answers for the key the creation returned. */
    const row = queryOne<{ keyDigest: string }>("SELECT keyDigest FROM apikeys WHERE id = ?", [keyId]);
    assert.ok(row);
    assert.equal(row.keyDigest, sha256Hex(key));
    const allKeys = queryAll<{ keyDigest: string }>("SELECT keyDigest FROM apikeys");
    for (const stored of allKeys) {
      assert.notEqual(stored.keyDigest, key, "the plaintext key never lands on the store");
      assert.match(stored.keyDigest, /^[0-9a-f]{64}$/);
    }
  });

  it("refuses the registration when the credentials do not answer", () => {
    const answer = registerDatabase("person@example.org", "wrong words", "the second app");
    assert.ok(answer.refusal);
    assert.equal(answer.refusal.kind, "credentials");
  });

  it("looks the presented key up (the query gate lane) and refuses the revoked", () => {
    const answer = registerDatabase("person@example.org", "honest words", "the key app");
    assert.ok(answer.answer);
    const { key, keyId, database } = answer.answer!;
    const lookup = apiKeyLookup(key);
    assert.ok("key" in lookup);
    assert.equal(lookup.database.id, database.id);
    assert.ok("key" in lookup && lookup.key.lastUsedAt !== null, "the last-use stamp lands");
    const wrong = apiKeyLookup("vault_000000000000000000000000000000000000000000000000");
    assert.ok("refusal" in wrong);
    assert.equal(revokeApiKey(keyId), true);
    const revoked = apiKeyLookup(key);
    assert.ok("refusal" in revoked);
    assert.equal(revoked.refusal.kind, "wrong", "the revoked key answers no vault");
  });

  it("issues another key and validates the routing shape", () => {
    const answer = registerDatabase("person@example.org", "honest words", "the second app");
    assert.ok(answer.answer);
    const { database } = answer.answer!;
    const issued = issueApiKey(database.id, "the second key");
    assert.ok(issued);
    assert.ok(issued.key.startsWith(API_KEY_PREFIX));
    assert.equal(issueApiKey("db-000000000000", "nope"), undefined, "an unknown database issues nothing");
    assert.equal(databaseIdValid(database.id), true);
    assert.equal(databaseIdValid("../escape"), false);
    assert.equal(databaseIdValid("db-nothex"), false);
  });
});

describe("the per-bucket quota (configurable, never a fixed cap)", () => {
  it("answers the generous floor at creation and bends to the owner's word", () => {
    const answer = registerDatabase("person@example.org", "honest words", "the quota app");
    assert.ok(answer.answer);
    const { database } = answer.answer!;
    assert.equal(database.quotaBytes, QUOTA_FLOOR_BYTES);
    const terabyte = setDatabaseQuota(database.id, BigInt("10995116277760"));
    assert.equal(terabyte?.quotaBytes, BigInt("10995116277760"), "terabyte scale answers");
    const unlimited = setDatabaseQuota(database.id, null);
    assert.equal(unlimited?.quotaBytes, null, "unlimited answers");
    assert.equal(setDatabaseQuota("db-000000000000", null), undefined, "an unknown database answers nothing");
  });
});

describe("the door routes over the real server", () => {
  it("serves the signup, the signin and the register (the shown-once answer)", async () => {
    const server = createVaultServer();
    const port = await listenVault(server, { port: 0 });
    base = `http://127.0.0.1:${port}`;
    try {
      const signup = await post("/api/v1/auth/signup", { email: "route@example.org", password: "route words" });
      assert.equal(signup.status, 201);
      assert.equal(signup.body.account.email, "route@example.org");
      assert.equal(signup.body.account.passwordDigest, undefined, "the password digest never rides an answer");
      const taken = await post("/api/v1/auth/signup", { email: "route@example.org", password: "route words" });
      assert.equal(taken.status, 409);
      const signin = await post("/api/v1/auth/signin", { email: "route@example.org", password: "route words" });
      assert.equal(signin.status, 200);
      assert.ok(Array.isArray(signin.body.databases));
      const refused = await post("/api/v1/auth/signin", { email: "route@example.org", password: "nope" });
      assert.equal(refused.status, 401);
      const register = await post("/api/v1/databases", {
        email: "route@example.org",
        password: "route words",
        name: "the route app",
      });
      assert.equal(register.status, 201);
      assert.equal(register.body.shown, "once");
      assert.match(register.body.database.id, /^db-[0-9a-f]{12}$/);
      assert.ok(register.body.key.startsWith(API_KEY_PREFIX));
      const key = register.body.key as string;
      const dbId = register.body.database.id as string;
      /* the shown-once law: the database reads never answer the key again. */
      const withKey = await get(`/api/v1/databases/${dbId}`, { authorization: `Bearer ${key}` });
      assert.equal(withKey.status, 200);
      assert.equal(withKey.body.database.id, dbId);
      assert.equal(withKey.body.key, undefined, "no later read answers the key");
      const withWrongKey = await get(`/api/v1/databases/${dbId}`, { authorization: "Bearer vault_wrong" });
      assert.equal(withWrongKey.status, 401);
      const issueRoute = await post(`/api/v1/databases/${dbId}/keys`, { label: "another" }, { authorization: `Bearer ${key}` });
      assert.equal(issueRoute.status, 201);
      assert.ok((issueRoute.body.key as string).startsWith(API_KEY_PREFIX));
      /* the per-bucket quota route: read the floor, set the owner's word. */
      const quotaRead = await get(`/api/v1/databases/${dbId}/quota`, { authorization: `Bearer ${key}` });
      assert.equal(quotaRead.status, 200);
      assert.equal(quotaRead.body.database.quotaBytes, QUOTA_FLOOR_BYTES.toString());
      const quotaSet = await post(`/api/v1/databases/${dbId}/quota`, { limitBytes: "10995116277760" }, { authorization: `Bearer ${key}` });
      assert.equal(quotaSet.status, 200);
      assert.equal(quotaSet.body.database.quotaBytes, "10995116277760");
      const quotaUnlimited = await post(`/api/v1/databases/${dbId}/quota`, { limitBytes: null }, { authorization: `Bearer ${key}` });
      assert.equal(quotaUnlimited.status, 200);
      assert.equal(quotaUnlimited.body.database.quotaBytes, null);
    } finally {
      server.close();
    }
  });
});
