// # accounts.test — the person-lane battery of the vault, runnable with the
// house vitest suite:
//   bunx vitest run tests/accounts.test.ts
// The accounts wave law, end to end over the real http surface: the public
// doors (the signup keeps only the scrypt digest, the signin answers the
// signed vs_ bearer once), the session lane (an account mints, lists and
// touches its own scopes only — a foreign project answers VAULT_FORBIDDEN),
// the project key lane (a vk_ secret deposits and lists inside its project
// alone, the gate stamps its last-used, the revocation kills it), and the
// retrocompatibility law: the operator token stays the total admin through
// the same x-vault-token lane every standing caller rides. The battery
// closes with the public-door rate counter, the secret rotation (a rotated
// key retires every standing session) and the pragma ladder a store opened
// before the wave climbs.

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { afterAll, describe, it } from "vitest";

/* the engine chain opens its sqlite singletons at import (drizzle.ts), so
 * the battery routes the storage into the throwaway store of the os tmpdir
 * BEFORE api.ts evaluates (the quotaisolation precedent) — the person-lane
 * battery never drops a store beside the sources. The token is pinned the
 * same way (the faun gate answers deterministically), the session secret
 * rides its default derivation from the token, and the auth rate ceiling
 * sits high enough that the flows never trip it (the rate law below pins
 * the counter on its own). */
const throwaway = join(tmpdir(), `vault-accounts-${process.pid}.test.db`);
process.env.VAULT_STORAGE_URL = `file:${throwaway}`;
process.env.VAULT_UISTORE_DB = join(tmpdir(), `vault-accounts-${process.pid}.uistore.db`);
process.env.VAULT_TOKEN = "the-accounts-operator-token";
process.env.VAULT_AUTH_RATE_MAX = "1000";
for (const file of [throwaway, process.env.VAULT_UISTORE_DB]) {
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(`${file}${suffix}`, { force: true });
  }
}

const { issueSession, resetAuthRateLimiter, verifySession, hashPassword, passwordMatches } = await import(
  "../accounts.ts"
);
const { openStorage } = await import("../drizzle.ts");
const { createVaultServer, listenVault } = await import("../api.ts");

const server = createVaultServer();
const port = await listenVault(server, { port: 0 });
const base = `http://127.0.0.1:${port}`;
const OPERATOR = "the-accounts-operator-token";

afterAll(() => {
  server.close();
});

/** one unique suffix per test — the flows never collide on emails or scopes. */
function suffix(): string {
  return randomUUID().slice(0, 8);
}

/** the standardized error body a refusal answers. */
async function refusalOf(response: Response): Promise<{ code: string; message: string }> {
  const body = (await response.json()) as { error: { code: string; message: string } };
  return body.error;
}

/** one signup call. */
function signup(email: string, password: string): Promise<Response> {
  return fetch(`${base}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

/** one signin call. */
function signin(email: string, password: string): Promise<Response> {
  return fetch(`${base}/api/v1/auth/signin`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

/** one deposit call under a bearer. */
function deposit(bearer: string, project: string, path: string, bytes: Uint8Array): Promise<Response> {
  return fetch(`${base}/api/v1/storage/objects`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${bearer}`,
      "x-project-id": project,
      "x-object-path": path,
      "x-object-mime": "text/plain",
    },
    body: bytes,
  });
}

/** creates one account and answers its session bearer (the flow helper). */
async function accountWithSession(label: string): Promise<{ email: string; accountId: string; token: string }> {
  const email = `${label}-${suffix()}@family.test`;
  const created = await signup(email, "the-honest-password");
  assert.equal(created.status, 201, "the flow account lands");
  const signed = await signin(email, "the-honest-password");
  assert.equal(signed.status, 200, "the flow session lands");
  const answer = (await signed.json()) as { account: { id: string }; token: string };
  return { email, accountId: answer.account.id, token: answer.token };
}

describe("the public account doors", () => {
  it("signs up honestly: 201 with the account id, never the digest; the duplicate answers 409; the short password answers 400", async () => {
    const email = `signup-${suffix()}@family.test`;
    const first = await signup(email, "the-honest-password");
    assert.equal(first.status, 201);
    const body = (await first.json()) as { account: Record<string, unknown> };
    assert.match(String(body.account.id), /^acct-[0-9a-f-]{36}$/);
    assert.equal(body.account.email, email);
    assert.equal("passwordHash" in body.account, false, "the digest never rides the answer");
    const duplicate = await signup(email, "another-honest-password");
    assert.equal(duplicate.status, 409);
    assert.equal((await refusalOf(duplicate)).code, "VAULT_AUTH");
    const short = await signup(`short-${suffix()}@family.test`, "short");
    assert.equal(short.status, 400);
    assert.equal((await refusalOf(short)).code, "VAULT_AUTH");
    const malformed = await signup(`not-an-email-${suffix()}`, "the-honest-password");
    assert.equal(malformed.status, 400);
    assert.equal((await refusalOf(malformed)).code, "VAULT_AUTH");
  });

  it("signs in honestly: the vs_ bearer answers once; the wrong password and the unknown email refuse identically", async () => {
    const email = `signin-${suffix()}@family.test`;
    await signup(email, "the-honest-password");
    const signed = await signin(email, "the-honest-password");
    assert.equal(signed.status, 200);
    const answer = (await signed.json()) as {
      account: { id: string; email: string };
      token: string;
      expiresAt: number;
    };
    assert.match(answer.token, /^vs_acct-[0-9a-f-]{36}\.\d{10,16}\.[a-f0-9]{64}$/);
    assert.ok(answer.expiresAt > Date.now(), "the expiry answers in the future");
    assert.equal(answer.account.email, email);
    const wrong = await signin(email, "the-wrong-password");
    assert.equal(wrong.status, 401);
    const unknown = await signin(`nobody-${suffix()}@family.test`, "the-honest-password");
    assert.equal(unknown.status, 401);
    assert.deepEqual(await wrong.json(), await unknown.json(), "the refusal never says which half failed");
  });

  it("the session law: verify accepts the minted bearer, refuses the expired, the tampered and the garbage", async () => {
    const accountId = `acct-${randomUUID()}`;
    const session = issueSession(accountId);
    assert.equal(verifySession(session.token)?.accountId, accountId);
    const expired = issueSession(accountId, -60);
    assert.equal(verifySession(expired.token), undefined, "an already-expired bearer refuses");
    const tampered = `${session.token.slice(0, -1)}${session.token.endsWith("0") ? "1" : "0"}`;
    assert.equal(verifySession(tampered), undefined, "a moved signature nibble refuses");
    assert.equal(verifySession(`vs_nobody.1.${"a".repeat(64)}`), undefined, "a forged bearer refuses");
    assert.equal(verifySession("garbage"), undefined);
    assert.equal(verifySession("vk_not-a-session"), undefined);
  });

  it("the scrypt law: the digest verifies its password and refuses every other input", () => {
    const stored = hashPassword("the-honest-password");
    assert.match(stored, /^[a-f0-9]{64}:[a-f0-9]{128}$/);
    assert.equal(passwordMatches("the-honest-password", stored), true);
    assert.equal(passwordMatches("the-wrong-password", stored), false);
    assert.equal(passwordMatches("the-honest-password", "not-a-digest"), false);
    assert.notEqual(hashPassword("the-honest-password"), stored, "a fresh salt never repeats the digest");
  });
});

describe("the session lane (an account owns its scopes)", () => {
  it("mints an owned scope, walks the list of its own only, and rides the deposit → read → delete flow", async () => {
    const person = await accountWithSession("flow");
    const project = `p-flow-${suffix()}`;
    const created = await fetch(`${base}/api/v1/storage/projects`, {
      method: "POST",
      headers: { authorization: `Bearer ${person.token}`, "content-type": "application/json" },
      body: JSON.stringify({ id: project, name: "the flow scope" }),
    });
    assert.equal(created.status, 201);
    const list = await fetch(`${base}/api/v1/storage/projects?limit=10&offset=0`, {
      headers: { authorization: `Bearer ${person.token}` },
    });
    assert.equal(list.status, 200);
    const page = (await list.json()) as { projects: { id: string; accountId: string | null }[]; total: number };
    assert.ok(page.projects.some((row) => row.id === project && row.accountId === person.accountId));
    const bytes = new TextEncoder().encode("the session bytes");
    const sealed = await deposit(person.token, project, "/flow/a.txt", bytes);
    assert.equal(sealed.status, 201);
    const object = (await sealed.json()) as { object: { id: string } };
    const read = await fetch(`${base}/api/v1/storage/objects/${object.object.id}`, {
      headers: { authorization: `Bearer ${person.token}` },
    });
    assert.equal(read.status, 200);
    assert.equal(await read.text(), "the session bytes");
    const listed = await fetch(`${base}/api/v1/storage/objects?project=${project}`, {
      headers: { authorization: `Bearer ${person.token}` },
    });
    assert.equal(listed.status, 200);
    assert.equal(((await listed.json()) as { objects: unknown[] }).objects.length, 1);
    const removed = await fetch(`${base}/api/v1/storage/objects/${object.object.id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${person.token}` },
    });
    assert.equal(removed.status, 200);
    const gone = await fetch(`${base}/api/v1/storage/objects/${object.object.id}`, {
      headers: { authorization: `Bearer ${person.token}` },
    });
    assert.equal(gone.status, 404);
  });

  it("refuses the foreign scope on every lane that names a project (VAULT_FORBIDDEN)", async () => {
    const person = await accountWithSession("foreign");
    const stranger = await accountWithSession("stranger");
    const foreign = `p-stranger-${suffix()}`;
    const created = await fetch(`${base}/api/v1/storage/projects`, {
      method: "POST",
      headers: { authorization: `Bearer ${stranger.token}`, "content-type": "application/json" },
      body: JSON.stringify({ id: foreign }),
    });
    assert.equal(created.status, 201);
    const sealed = await deposit(stranger.token, foreign, "/stranger/a.txt", new TextEncoder().encode("stranger"));
    const object = (await sealed.json()) as { object: { id: string } };
    // the deposit, the list, the object read and the removal of a foreign scope
    const attemptedDeposit = await deposit(person.token, foreign, "/foreign/a.txt", new TextEncoder().encode("no"));
    assert.equal(attemptedDeposit.status, 403);
    assert.equal((await refusalOf(attemptedDeposit)).code, "VAULT_FORBIDDEN");
    const attemptedList = await fetch(`${base}/api/v1/storage/objects?project=${foreign}`, {
      headers: { authorization: `Bearer ${person.token}` },
    });
    assert.equal(attemptedList.status, 403);
    const attemptedRead = await fetch(`${base}/api/v1/storage/objects/${object.object.id}`, {
      headers: { authorization: `Bearer ${person.token}` },
    });
    assert.equal(attemptedRead.status, 403);
    assert.equal((await refusalOf(attemptedRead)).code, "VAULT_FORBIDDEN");
    const attemptedDelete = await fetch(`${base}/api/v1/storage/objects/${object.object.id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${person.token}` },
    });
    assert.equal(attemptedDelete.status, 403);
    // the scope mint and the key lanes of a foreign scope
    const attemptedMint = await fetch(`${base}/api/v1/storage/projects`, {
      method: "POST",
      headers: { authorization: `Bearer ${person.token}`, "content-type": "application/json" },
      body: JSON.stringify({ id: foreign }),
    });
    assert.equal(attemptedMint.status, 403);
    const attemptedKey = await fetch(`${base}/api/v1/storage/projects/${foreign}/keys`, {
      method: "POST",
      headers: { authorization: `Bearer ${person.token}`, "content-type": "application/json" },
      body: JSON.stringify({ label: "thief" }),
    });
    assert.equal(attemptedKey.status, 403);
    // the list never leaks the foreign scope
    const list = await fetch(`${base}/api/v1/storage/projects`, {
      headers: { authorization: `Bearer ${person.token}` },
    });
    const page = (await list.json()) as { projects: { id: string }[]; total: number };
    assert.equal(
      page.projects.some((row) => row.id === foreign),
      false,
    );
  });

  it("keeps the sweep behind the operator door (a session never walks the whole catalog)", async () => {
    const person = await accountWithSession("sweep");
    const refused = await fetch(`${base}/api/v1/storage/sweep`, {
      method: "POST",
      headers: { authorization: `Bearer ${person.token}` },
    });
    assert.equal(refused.status, 403);
    assert.equal((await refusalOf(refused)).code, "VAULT_FORBIDDEN");
  });
});

describe("the project key lane (a vk_ bearer rides its scope alone)", () => {
  it("mints the secret once, rides the deposit and the list of its project, and never touches a foreign scope", async () => {
    const person = await accountWithSession("keys");
    const project = `p-keys-${suffix()}`;
    const created = await fetch(`${base}/api/v1/storage/projects`, {
      method: "POST",
      headers: { authorization: `Bearer ${person.token}`, "content-type": "application/json" },
      body: JSON.stringify({ id: project }),
    });
    assert.equal(created.status, 201);
    const minted = await fetch(`${base}/api/v1/storage/projects/${project}/keys`, {
      method: "POST",
      headers: { authorization: `Bearer ${person.token}`, "content-type": "application/json" },
      body: JSON.stringify({ label: "ci-lane" }),
    });
    assert.equal(minted.status, 201);
    const mint = (await minted.json()) as {
      key: { id: string; label: string; projectId: string; lastUsedAt: string | null };
      secret: string;
    };
    assert.equal(mint.key.label, "ci-lane");
    assert.equal(mint.key.projectId, project);
    assert.equal(mint.key.lastUsedAt, null, "a fresh key never rode the gate");
    assert.match(mint.secret, /^vk_[a-f0-9]{64}$/);
    // the key deposits and lists inside its project
    const sealed = await deposit(mint.secret, project, "/ci/a.txt", new TextEncoder().encode("the key bytes"));
    assert.equal(sealed.status, 201);
    const object = (await sealed.json()) as { object: { id: string } };
    const listed = await fetch(`${base}/api/v1/storage/objects?project=${project}`, {
      headers: { authorization: `Bearer ${mint.secret}` },
    });
    assert.equal(listed.status, 200);
    assert.equal(((await listed.json()) as { objects: unknown[] }).objects.length, 1);
    const read = await fetch(`${base}/api/v1/storage/objects/${object.object.id}`, {
      headers: { authorization: `Bearer ${mint.secret}` },
    });
    assert.equal(read.status, 200);
    // the last-used stamp answered the ride
    const keys = await fetch(`${base}/api/v1/storage/projects/${project}/keys`, {
      headers: { authorization: `Bearer ${person.token}` },
    });
    const keyList = (await keys.json()) as { keys: { id: string; label: string; lastUsedAt: string | null }[] };
    assert.equal(
      keyList.keys.some((row) => row.id === mint.key.id && row.lastUsedAt !== null),
      true,
    );
    assert.equal("secret" in (keyList.keys[0] ?? {}), false, "the list never carries the secret");
    // the foreign scope refuses on every lane
    const other = await accountWithSession("other");
    const foreign = `p-other-${suffix()}`;
    await fetch(`${base}/api/v1/storage/projects`, {
      method: "POST",
      headers: { authorization: `Bearer ${other.token}`, "content-type": "application/json" },
      body: JSON.stringify({ id: foreign }),
    });
    const foreignDeposit = await deposit(mint.secret, foreign, "/ci/a.txt", new TextEncoder().encode("no"));
    assert.equal(foreignDeposit.status, 403);
    assert.equal((await refusalOf(foreignDeposit)).code, "VAULT_FORBIDDEN");
    const foreignList = await fetch(`${base}/api/v1/storage/objects?project=${foreign}`, {
      headers: { authorization: `Bearer ${mint.secret}` },
    });
    assert.equal(foreignList.status, 403);
    // a key mints no scopes, lists no scopes, mints no keys, sweeps nothing
    const mintAttempt = await fetch(`${base}/api/v1/storage/projects`, {
      method: "POST",
      headers: { authorization: `Bearer ${mint.secret}`, "content-type": "application/json" },
      body: JSON.stringify({ id: `p-thief-${suffix()}` }),
    });
    assert.equal(mintAttempt.status, 403);
    const listAttempt = await fetch(`${base}/api/v1/storage/projects`, {
      headers: { authorization: `Bearer ${mint.secret}` },
    });
    assert.equal(listAttempt.status, 403);
    const keyAttempt = await fetch(`${base}/api/v1/storage/projects/${project}/keys`, {
      method: "POST",
      headers: { authorization: `Bearer ${mint.secret}`, "content-type": "application/json" },
      body: JSON.stringify({ label: "thief" }),
    });
    assert.equal(keyAttempt.status, 403);
    const sweepAttempt = await fetch(`${base}/api/v1/storage/sweep`, {
      method: "POST",
      headers: { authorization: `Bearer ${mint.secret}` },
    });
    assert.equal(sweepAttempt.status, 403);
    // the revocation kills the key: the same bearer answers 401 on its next ride
    const revoked = await fetch(`${base}/api/v1/storage/projects/${project}/keys/${mint.key.id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${person.token}` },
    });
    assert.equal(revoked.status, 200);
    const deadRide = await deposit(mint.secret, project, "/ci/b.txt", new TextEncoder().encode("no"));
    assert.equal(deadRide.status, 401);
    assert.equal((await refusalOf(deadRide)).code, "VAULT_AUTH");
    const twice = await fetch(`${base}/api/v1/storage/projects/${project}/keys/${mint.key.id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${person.token}` },
    });
    assert.equal(twice.status, 404, "a revoked key never answers the revoke again");
  });
});

describe("the operator token stays the total admin (the retrocompatibility law)", () => {
  it("rides the x-vault-token lane through every standing route, owns every scope and walks the pages", async () => {
    const person = await accountWithSession("admin");
    const owned = `p-owned-${suffix()}`;
    const operatorScope = `p-operator-${suffix()}`;
    // the old lane: the x-vault-token header (never the bearer) mints a scope
    const created = await fetch(`${base}/api/v1/storage/projects`, {
      method: "POST",
      headers: { "x-vault-token": OPERATOR, "content-type": "application/json" },
      body: JSON.stringify({ id: operatorScope }),
    });
    assert.equal(created.status, 201);
    const project = (await created.json()) as { project: { id: string; quota: { limitBytes: string } } };
    assert.equal(project.project.quota.limitBytes, (900n * 1024n * 1024n).toString(), "the 900MB floor stands");
    // the operator deposits into any scope, the session-owned one included
    const sessionScope = await fetch(`${base}/api/v1/storage/projects`, {
      method: "POST",
      headers: { authorization: `Bearer ${person.token}`, "content-type": "application/json" },
      body: JSON.stringify({ id: owned }),
    });
    assert.equal(sessionScope.status, 201);
    const sealed = await deposit(OPERATOR, owned, "/admin/a.txt", new TextEncoder().encode("admin"));
    assert.equal(sealed.status, 201);
    const object = (await sealed.json()) as { object: { id: string } };
    const read = await fetch(`${base}/api/v1/storage/objects/${object.object.id}`, {
      headers: { "x-vault-token": OPERATOR },
    });
    assert.equal(read.status, 200);
    // the list walks every scope (the session-owned and the operator-owned both ride)
    const list = await fetch(`${base}/api/v1/storage/projects?limit=500`, {
      headers: { "x-vault-token": OPERATOR },
    });
    assert.equal(list.status, 200);
    const page = (await list.json()) as { projects: { id: string; accountId: string | null }[]; total: number };
    assert.ok(page.projects.some((row) => row.id === owned && row.accountId === person.accountId));
    assert.ok(page.projects.some((row) => row.id === operatorScope && row.accountId === null));
    // the pagination window answers honestly
    const first = await fetch(`${base}/api/v1/storage/projects?limit=1&offset=0`, {
      headers: { authorization: `Bearer ${OPERATOR}` },
    });
    const firstPage = (await first.json()) as { projects: unknown[]; total: number; limit: number; offset: number };
    assert.equal(firstPage.projects.length, 1);
    assert.equal(firstPage.limit, 1);
    assert.equal(firstPage.offset, 0);
    assert.ok(firstPage.total >= 2, "the total answers the whole set");
    // the sweep, the quota and the usage lanes stay open to the operator
    const sweep = await fetch(`${base}/api/v1/storage/sweep`, {
      method: "POST",
      headers: { authorization: `Bearer ${OPERATOR}` },
    });
    assert.equal(sweep.status, 200);
    const usage = await fetch(`${base}/api/v1/storage/usage?project=${owned}`, {
      headers: { authorization: `Bearer ${OPERATOR}` },
    });
    assert.equal(usage.status, 200);
    const quota = await fetch(`${base}/api/v1/storage/quota?project=${operatorScope}`, {
      headers: { authorization: `Bearer ${OPERATOR}` },
    });
    assert.equal(quota.status, 200);
    // a wrong bearer still refuses the honest 401
    const refused = await fetch(`${base}/api/v1/storage/usage?project=${owned}`, {
      headers: { authorization: "Bearer the-wrong-bearer" },
    });
    assert.equal(refused.status, 401);
    assert.equal((await refusalOf(refused)).code, "VAULT_AUTH");
    const anonymous = await fetch(`${base}/api/v1/storage/usage?project=${owned}`);
    assert.equal(anonymous.status, 401);
  });

  it("mints and revokes the keys of any scope (the admin lane of the key surface)", async () => {
    const operatorScope = `p-opkey-${suffix()}`;
    await fetch(`${base}/api/v1/storage/projects`, {
      method: "POST",
      headers: { authorization: `Bearer ${OPERATOR}`, "content-type": "application/json" },
      body: JSON.stringify({ id: operatorScope }),
    });
    const minted = await fetch(`${base}/api/v1/storage/projects/${operatorScope}/keys`, {
      method: "POST",
      headers: { authorization: `Bearer ${OPERATOR}`, "content-type": "application/json" },
      body: JSON.stringify({ label: "operator-lane" }),
    });
    assert.equal(minted.status, 201);
    const mint = (await minted.json()) as { key: { id: string }; secret: string };
    const sealed = await deposit(mint.secret, operatorScope, "/op/a.txt", new TextEncoder().encode("operator"));
    assert.equal(sealed.status, 201);
    const revoked = await fetch(`${base}/api/v1/storage/projects/${operatorScope}/keys/${mint.key.id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${OPERATOR}` },
    });
    assert.equal(revoked.status, 200);
    const dead = await deposit(mint.secret, operatorScope, "/op/b.txt", new TextEncoder().encode("no"));
    assert.equal(dead.status, 401);
  });
});

describe("the rate law of the public doors", () => {
  it("answers 429 VAULT_RATE past the ceiling, with the retry window riding the header", async () => {
    resetAuthRateLimiter();
    process.env.VAULT_AUTH_RATE_MAX = "2";
    try {
      const first = await signup(`rate-a-${suffix()}@family.test`, "the-honest-password");
      assert.equal(first.status, 201);
      const second = await signin(`rate-a@family.test`, "the-honest-password");
      assert.equal(second.status, 401, "a miss still counts against the peer");
      const third = await signup(`rate-b-${suffix()}@family.test`, "the-honest-password");
      assert.equal(third.status, 429);
      assert.equal((await refusalOf(third)).code, "VAULT_RATE");
      assert.ok(Number(third.headers.get("retry-after")) >= 1, "the retry window rides the header");
    } finally {
      process.env.VAULT_AUTH_RATE_MAX = "1000";
      resetAuthRateLimiter();
    }
  });
});

describe("the secret rotation (a pinned key owns the account door)", () => {
  it("pins VAULT_SESSION_SECRET, retires the standing bearers when it leaves, and answers new ones", async () => {
    const email = `rotate-${suffix()}@family.test`;
    await signup(email, "the-honest-password");
    const before = await signin(email, "the-honest-password");
    const standing = ((await before.json()) as { token: string }).token;
    process.env.VAULT_SESSION_SECRET = "the-pinned-session-secret";
    try {
      const pinned = await signin(email, "the-honest-password");
      assert.equal(pinned.status, 200);
      const answer = (await pinned.json()) as { token: string };
      assert.notEqual(answer.token, standing, "the pinned key signs a fresh bearer");
      const ridden = await fetch(`${base}/api/v1/storage/projects`, {
        headers: { authorization: `Bearer ${answer.token}` },
      });
      assert.equal(ridden.status, 200, "the pinned bearer rides the gate");
      // the rotation retires the standing sessions: the derived-key bearer refuses
      const retired = await fetch(`${base}/api/v1/storage/projects`, {
        headers: { authorization: `Bearer ${standing}` },
      });
      assert.equal(retired.status, 401, "a rotated secret retires every standing bearer");
    } finally {
      delete process.env.VAULT_SESSION_SECRET;
    }
    const after = await signin(email, "the-honest-password");
    assert.equal(after.status, 200, "the default derivation answers again once the pin leaves");
    const revived = (await after.json()) as { token: string };
    const ridden = await fetch(`${base}/api/v1/storage/projects`, {
      headers: { authorization: `Bearer ${revived.token}` },
    });
    assert.equal(ridden.status, 200, "the derived-key bearer rides the gate again");
  });
});

describe("the accounts-wave ladder (a legacy store climbs on boot)", () => {
  it("adds the owner pointer to a projects table opened before the wave, idempotently", () => {
    const legacy = join(tmpdir(), `vault-accounts-legacy-${process.pid}.db`);
    for (const face of [legacy]) {
      for (const sidecar of ["", "-wal", "-shm"]) {
        rmSync(`${face}${sidecar}`, { force: true });
      }
    }
    const raw = new Database(legacy);
    raw.exec(
      "CREATE TABLE projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, region TEXT NOT NULL DEFAULT 'local', created_at TEXT NOT NULL DEFAULT (datetime('now')))",
    );
    raw.close();
    const database = openStorage(`file:${legacy}`);
    const info = database.$client.prepare("PRAGMA table_info(projects)").all() as { name: string }[];
    assert.ok(
      info.some((column) => column.name === "account_id"),
      "the ladder added the owner pointer",
    );
    assert.ok(
      info.some((column) => column.name === "name"),
      "the standing columns stay",
    );
    // the ladder is idempotent: a second boot over the climbed store answers the same shape
    const again = openStorage(`file:${legacy}`);
    const after = again.$client.prepare("PRAGMA table_info(projects)").all() as { name: string }[];
    assert.equal(after.filter((column) => column.name === "account_id").length, 1, "the climb never repeats");
    database.$client.close();
    again.$client.close();
    for (const face of [legacy]) {
      for (const sidecar of ["", "-wal", "-shm"]) {
        rmSync(`${face}${sidecar}`, { force: true });
      }
    }
  });
});
