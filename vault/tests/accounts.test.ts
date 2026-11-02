// # accounts.test — the identity lane of the vault, runnable with the
// house vitest suite:
//   bunx vitest run tests/accounts.test.ts
// The supabase law the owner pinned: a person signs up, signs in, registers
// an application and the application already carries its own id and api
// key. The suite boots the real http server with NO operator token — the
// person lane (the httpOnly session cookie) and the application lane (the
// x-api-key header) must answer on their own — and pins: the signup
// answers the account with the session cookie (HttpOnly, SameSite=Strict,
// never the browser's storage), the duplicate email and the weak password
// refuse, the wrong password and the unknown email refuse the same honest
// 401, the project id is the vault-issued [a-z0-9]{12} with the first api
// key answered exactly once, the api key authenticates the storage
// operations of its project (and refuses a foreign scope), the session
// rides the storage lane of its owned scopes, the credential-free request
// seals, and the logout ends the session honestly.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { afterAll, describe, it } from "vitest";

/* the isolation of the suite (the quotaisolation precedent): the engine
 * chain opens its sqlite singleton at import, so the storage routes into
 * the throwaway store BEFORE the engine imports — and the operator token
 * stays unset so the identity lanes answer without it (the api import
 * reads VAULT_TOKEN at module load). */
const dbhome = join(mkdtempSync(join(tmpdir(), "vault-accounts-")), "accounts.db");
process.env.VAULT_STORAGE_URL = `file:${dbhome}`;
delete process.env.VAULT_TOKEN;
for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`${dbhome}${suffix}`, { force: true });
}

const { createVaultServer, listenVault, routes } = await import("../api.ts");
const { hashPassword, projectNanoId, verifyPassword } = await import("../accounts.ts");

const encoder = new TextEncoder();
const server = createVaultServer();
const port = await listenVault(server, { port: 0 });
const base = `http://127.0.0.1:${port}`;

const email = `owner-${process.pid}-${Date.now()}@family.test`;
const password = "the-faun-lesson-8";

/** the raw session cookie the auth lanes answer — extracted off the Set-Cookie header. */
function cookieTokenOf(answer: Response): string {
  const set = answer.headers.getSetCookie().find((row) => row.startsWith("vaultsession="));
  assert.ok(set !== undefined, "the auth lane answers a vaultsession cookie");
  return (set ?? "").split(";")[0]?.slice("vaultsession=".length) ?? "";
}

afterAll(() => {
  server.close();
});

describe("the password lane (scrypt, node:crypto only)", () => {
  it("hashes with a fresh salt and verifies timing-safe — a foreign shape refuses", () => {
    const stored = hashPassword(password);
    assert.match(stored, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    assert.equal(verifyPassword(password, stored), true);
    assert.equal(verifyPassword("the-faun-lesson-9", stored), false);
    assert.equal(verifyPassword(password, "not-a-scrypt-shape"), false);
    assert.notEqual(hashPassword(password), stored, "every hash rides its own salt");
  });
});

describe("the signup door", () => {
  it("answers the account and sets the httpOnly SameSite=Strict session cookie", async () => {
    const answer = await fetch(`${base}${routes.signup}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(answer.status, 201);
    const set = answer.headers.getSetCookie().find((row) => row.startsWith("vaultsession=")) ?? "";
    assert.ok(set.includes("HttpOnly"), "the cookie never touches the browser's script lane");
    assert.ok(set.includes("SameSite=Strict"));
    assert.match(cookieTokenOf(answer), /^[A-Za-z0-9_-]{43}$/);
    const body = (await answer.json()) as { account: { id: string; email: string; role: string; createdAt: string } };
    assert.equal(body.account.email, email);
    assert.equal(body.account.role, "owner");
    assert.match(body.account.id, /^acc-[a-z0-9]{12}$/);
    assert.match(body.account.createdAt, /^\d+$/, "the bigint ms pointer rides as a decimal string");
  });

  it("refuses the duplicate email with the honest 409", async () => {
    const answer = await fetch(`${base}${routes.signup}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(answer.status, 409);
    const body = (await answer.json()) as { error: { code: string } };
    assert.equal(body.error.code, "VAULT_EMAIL_TAKEN");
  });

  it("refuses the weak password and the dishonest email", async () => {
    const weak = await fetch(`${base}${routes.signup}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: `second-${process.pid}@family.test`, password: "short" }),
    });
    assert.equal(weak.status, 400);
    const body = (await weak.json()) as { error: { code: string } };
    assert.equal(body.error.code, "VAULT_INVALID");
    const crooked = await fetch(`${base}${routes.signup}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "not-an-address", password }),
    });
    assert.equal(crooked.status, 400);
  });
});

describe("the login door", () => {
  it("refuses the wrong password and the unknown email with the same honest 401", async () => {
    const wrong = await fetch(`${base}${routes.login}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: "the-wrong-password" }),
    });
    assert.equal(wrong.status, 401);
    const body = (await wrong.json()) as { error: { code: string } };
    assert.equal(body.error.code, "VAULT_AUTH");
    const unknown = await fetch(`${base}${routes.login}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: `nobody-${process.pid}@family.test`, password }),
    });
    assert.equal(unknown.status, 401);
  });

  it("signs in with the honest pair and sets a fresh session cookie", async () => {
    const answer = await fetch(`${base}${routes.login}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(answer.status, 200);
    const body = (await answer.json()) as { account: { email: string } };
    assert.equal(body.account.email, email);
    assert.match(cookieTokenOf(answer), /^[A-Za-z0-9_-]{43}$/);
  });
});

describe("the session lane", () => {
  it("answers the signed-in account over the cookie and refuses without it", async () => {
    const signin = await fetch(`${base}${routes.login}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const token = cookieTokenOf(signin);
    const withCookie = await fetch(`${base}${routes.session}`, { headers: { cookie: `vaultsession=${token}` } });
    assert.equal(withCookie.status, 200);
    const body = (await withCookie.json()) as { account: { email: string } };
    assert.equal(body.account.email, email);
    const without = await fetch(`${base}${routes.session}`);
    assert.equal(without.status, 401);
    const stale = await fetch(`${base}${routes.session}`, { headers: { cookie: "vaultsession=not-a-real-token" } });
    assert.equal(stale.status, 401);
  });
});

describe("the owned projects lane", () => {
  let token = "";
  let projectId = "";
  let apiKey = "";

  it("registers the application — the vault issues the [a-z0-9]{12} id and answers the first api key once", async () => {
    const signin = await fetch(`${base}${routes.login}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    token = cookieTokenOf(signin);
    const answer = await fetch(`${base}${routes.accountProjects}`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: `vaultsession=${token}` },
      body: JSON.stringify({ name: "the first application" }),
    });
    assert.equal(answer.status, 201);
    const body = (await answer.json()) as {
      project: { id: string; name: string; ownerAccountId: string; quota: { limitBytes: string } };
      apiKey: { prefix: string; key: string };
    };
    projectId = body.project.id;
    apiKey = body.apiKey.key;
    assert.match(projectId, /^[a-z0-9]{12}$/, "the person never names the scope, the vault does");
    assert.equal(body.project.name, "the first application");
    assert.match(body.project.ownerAccountId, /^acc-[a-z0-9]{12}$/);
    assert.match(body.project.quota.limitBytes, /^\d+$/, "the 900MB floor rides as a decimal string");
    assert.match(apiKey, /^vk_[a-z0-9]{32}$/);
    assert.ok(body.apiKey.prefix.length >= 8, "the readable prefix answers for the console");
    assert.match(projectNanoId(), /^[a-z0-9]{12}$/);
  });

  it("refuses the projects lane without a session", async () => {
    const refused = await fetch(`${base}${routes.accountProjects}`);
    assert.equal(refused.status, 401);
    const body = (await refused.json()) as { error: { code: string } };
    assert.equal(body.error.code, "VAULT_AUTH");
  });

  it("lists the projects the person owns", async () => {
    const answer = await fetch(`${base}${routes.accountProjects}`, { headers: { cookie: `vaultsession=${token}` } });
    assert.equal(answer.status, 200);
    const body = (await answer.json()) as { projects: { id: string }[] };
    assert.ok(body.projects.some((project) => project.id === projectId));
  });

  it("the api key authenticates the storage operations of its project (no operator token anywhere)", async () => {
    const deposit = await fetch(`${base}${routes.objects}`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "x-project-id": projectId,
        "x-object-path": "/docs/hello.txt",
        "x-object-mime": "text/plain",
      },
      body: encoder.encode("hello from the identity lane"),
    });
    assert.equal(deposit.status, 201);
    const sealed = (await deposit.json()) as { object: { id: string } };
    const read = await fetch(`${base}${routes.objects}/${sealed.object.id}`, { headers: { "x-api-key": apiKey } });
    assert.equal(read.status, 200);
    assert.equal(await read.text(), "hello from the identity lane");
    const usage = await fetch(`${base}${routes.usage}?project=${projectId}`, { headers: { "x-api-key": apiKey } });
    assert.equal(usage.status, 200);
  });

  it("the api key refuses the foreign scope it does not answer for", async () => {
    const second = await fetch(`${base}${routes.accountProjects}`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: `vaultsession=${token}` },
      body: JSON.stringify({ name: "the second application" }),
    });
    assert.equal(second.status, 201);
    const body = (await second.json()) as { project: { id: string } };
    const cross = await fetch(`${base}${routes.objects}`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "x-project-id": body.project.id,
        "x-object-path": "/docs/cross.txt",
        "x-object-mime": "text/plain",
      },
      body: encoder.encode("the foreign scope"),
    });
    assert.equal(cross.status, 403);
    const refused = (await cross.json()) as { error: { code: string } };
    assert.equal(refused.error.code, "VAULT_SCOPE");
  });

  it("the session rides the storage lane of its owned scopes", async () => {
    const deposit = await fetch(`${base}${routes.objects}`, {
      method: "POST",
      headers: {
        cookie: `vaultsession=${token}`,
        "x-project-id": projectId,
        "x-object-path": "/docs/session.txt",
        "x-object-mime": "text/plain",
      },
      body: encoder.encode("the session lane rides too"),
    });
    assert.equal(deposit.status, 201);
  });

  it("the credential-free storage request seals (fail closed, no operator token pinned)", async () => {
    const sealed = await fetch(`${base}${routes.usage}?project=${projectId}`);
    assert.equal(sealed.status, 503);
    const body = (await sealed.json()) as { error: { code: string } };
    assert.equal(body.error.code, "VAULT_AUTH");
  });
});

describe("the logout door", () => {
  it("ends the session and the cookie stops answering", async () => {
    const signin = await fetch(`${base}${routes.login}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const token = cookieTokenOf(signin);
    const logout = await fetch(`${base}${routes.logout}`, {
      method: "POST",
      headers: { cookie: `vaultsession=${token}` },
    });
    assert.equal(logout.status, 200);
    const clearing = logout.headers.getSetCookie().find((row) => row.startsWith("vaultsession=")) ?? "";
    assert.ok(clearing.includes("Max-Age=0"), "the cookie clears");
    const after = await fetch(`${base}${routes.session}`, { headers: { cookie: `vaultsession=${token}` } });
    assert.equal(after.status, 401, "the ended session never answers again");
  });
});
