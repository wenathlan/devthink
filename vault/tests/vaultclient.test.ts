// # vaultclient.test — the engine door battery: the typed calls of the
// vault's own /api/v1 surface against an injected fetch seam, the away
// lane the rehearsal law declares, the token header the gate reads, the
// abort window the lane rides and the wire shapes the api serves (the
// route answers the real projections: the usage census with decimal
// bigint strings, the objects array, the quota verdict fields, the sweep
// report). The battery never opens the engine itself — the uistore
// battery boots the real server for the copy lane; this one pins the
// client contract the wingets ride.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { vaultclient, vaultorigin, vaulttokenconfigured } from "../vaultclient.ts";

/** one recorded call the fake seam answered (the method, the url, the
 * headers and the body the lane sent). */
interface Recorded {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: Uint8Array<ArrayBuffer>;
}

/** a json answer the fake seam serves. */
function jsonanswer(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

/** the fake fetch seam: records every call, answers the queued responses
 * in order (a thrown error serves the unreachable lane). */
function seam(answers: (Response | Error)[]): { fetch: typeof fetch; calls: Recorded[] } {
  const calls: Recorded[] = [];
  const fetch = (async (url: unknown, init?: RequestInit) => {
    const record: Recorded = {
      method: init?.method ?? "GET",
      url: String(url),
      headers: (init?.headers ?? {}) as Record<string, string>,
      body: init?.body as Uint8Array<ArrayBuffer> | undefined,
    };
    calls.push(record);
    const next = answers.shift();
    if (next instanceof Error) throw next;
    if (next === undefined) throw new Error("the seam ran out of answers");
    return next;
  }) as typeof fetch;
  return { fetch, calls };
}

/** the public https origin the lane accepts (the house law). */
const ORIGIN = "https://vault.family.example";

describe("the engine door", () => {
  it("answers the away lane when no origin is configured", async () => {
    const { fetch } = seam([]);
    const client = vaultclient({ origin: "", fetchImpl: fetch });
    const answer = await client.health();
    assert.equal(answer.ok, false);
    assert.equal(answer.code, "VAULT_AWAY");
    assert.equal(answer.status, null);
    assert.equal(fetch === undefined, false);
  });

  it("refuses an origin that breaks the house https law", async () => {
    const { fetch } = seam([]);
    const client = vaultclient({ origin: "http://vault.family.example", fetchImpl: fetch });
    const answer = await client.usage("p1");
    assert.equal(answer.ok, false);
    assert.equal(answer.code, "VAULT_AWAY");
  });

  it("rides the token header the gate reads", async () => {
    const { fetch, calls } = seam([
      jsonanswer(200, {
        ok: true,
        service: "vault",
        storage: { driver: "sqlite" },
        auth: { required: true, configured: true },
      }),
    ]);
    const client = vaultclient({ origin: ORIGIN, fetchImpl: fetch, token: "the-operator-token" });
    const answer = await client.health();
    assert.equal(answer.ok, true);
    assert.equal(answer.service, "vault");
    assert.equal(answer.driver, "sqlite");
    assert.equal(answer.authRequired, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].headers["x-vault-token"], "the-operator-token");
    assert.equal(calls[0].url, `${ORIGIN}/api/health`);
  });

  it("translates the standardized refusal the api serves", async () => {
    const { fetch } = seam([
      jsonanswer(401, { error: { code: "VAULT_TOKEN", message: "the storage truth demands the vault token" } }),
    ]);
    const client = vaultclient({ origin: ORIGIN, fetchImpl: fetch });
    const answer = await client.usage("p1");
    assert.equal(answer.ok, false);
    if (!answer.ok) {
      assert.equal(answer.code, "VAULT_TOKEN");
      assert.equal(answer.status, 401);
    }
  });

  it("parses the usage census the real route answers (decimal bigint strings)", async () => {
    const { fetch, calls } = seam([
      jsonanswer(200, {
        project: "p1",
        bytes: "1048576",
        objects: 3,
        chunks: 5,
        chunkBytes: "1310720",
        liveObjects: 3,
        liveBytes: "1048576",
      }),
    ]);
    const client = vaultclient({ origin: ORIGIN, fetchImpl: fetch });
    const answer = await client.usage("p1");
    assert.equal(answer.ok, true);
    if (answer.ok) {
      assert.equal(answer.bytes, 1048576n);
      assert.equal(answer.objects, 3);
      assert.equal(answer.chunks, 5);
      assert.equal(answer.liveBytes, 1048576n);
    }
    assert.equal(calls[0].url, `${ORIGIN}/api/v1/storage/usage?project=p1`);
  });

  it("parses the objects array the list route answers", async () => {
    const { fetch } = seam([
      jsonanswer(200, {
        objects: [
          {
            id: "o1",
            projectId: "p1",
            path: "/a.bin",
            mime: "application/octet-stream",
            size: "1024",
            digest: "d1",
            channel: "blob",
            tier: "hot",
            createdAt: "2026-01-01T00:00:00Z",
          },
          {
            id: "o2",
            projectId: "p1",
            path: "/b.bin",
            mime: "text/plain",
            size: "2048",
            digest: "d2",
            channel: "lfs",
            tier: "cold",
            createdAt: "2026-01-02T00:00:00Z",
          },
        ],
      }),
    ]);
    const client = vaultclient({ origin: ORIGIN, fetchImpl: fetch });
    const answer = await client.listObjects("p1");
    assert.equal(answer.ok, true);
    if (answer.ok) {
      assert.equal(answer.rows.length, 2);
      assert.equal(answer.rows[0].size, 1024n);
      assert.equal(answer.rows[1].channel, "lfs");
    }
  });

  it("parses the quota verdict and posts the limit the set lane rides", async () => {
    const { fetch, calls } = seam([
      jsonanswer(200, {
        project: "p1",
        usage: "2048",
        objects: 2,
        limit: "1048576",
        state: "within",
        remaining: "1046528",
        updatedAt: "2026-01-01T00:00:00Z",
      }),
      jsonanswer(200, { project: "p1", limit: null, updatedAt: "2026-01-02T00:00:00Z" }),
    ]);
    const client = vaultclient({ origin: ORIGIN, fetchImpl: fetch });
    const quota = await client.getQuota("p1");
    assert.equal(quota.ok, true);
    if (quota.ok) {
      assert.equal(quota.usage, 2048n);
      assert.equal(quota.limitBytes, 1048576n);
      assert.equal(quota.state, "within");
    }
    const set = await client.setQuota("p1", null);
    assert.equal(set.ok, true);
    if (set.ok) assert.equal(set.limitBytes, null);
    const posted = calls[1];
    assert.equal(posted.method, "POST");
    assert.equal(posted.url, `${ORIGIN}/api/v1/storage/quota?project=p1`);
    const body = JSON.parse(new TextDecoder().decode(posted.body ?? new Uint8Array())) as { limitBytes: string | null };
    assert.equal(body.limitBytes, null);
  });

  it("parses the sweep report the retention lane reads", async () => {
    const { fetch } = seam([jsonanswer(200, { chunks: 2, bytes: "4096", tombstones: 1 })]);
    const client = vaultclient({ origin: ORIGIN, fetchImpl: fetch });
    const answer = await client.sweep();
    assert.equal(answer.ok, true);
    if (answer.ok) {
      assert.equal(answer.chunks, 2);
      assert.equal(answer.bytes, 4096n);
      assert.equal(answer.tombstones, 1);
    }
  });

  it("rides the public account doors anonymous — signup and signin carry no bearer", async () => {
    const { fetch, calls } = seam([
      jsonanswer(201, { account: { id: "acct-1", email: "a@family.test", createdAt: "2026-01-01T00:00:00Z" } }),
      jsonanswer(200, {
        account: { id: "acct-1", email: "a@family.test" },
        token: `vs_acct-1.1794188607445.${"a".repeat(64)}`,
        expiresAt: 1794188607445,
      }),
    ]);
    const client = vaultclient({ origin: ORIGIN, fetchImpl: fetch, token: "the-operator-token" });
    const created = await client.signup("a@family.test", "the-honest-password");
    assert.equal(created.ok, true);
    if (created.ok) {
      assert.equal(created.accountId, "acct-1");
      assert.equal(created.email, "a@family.test");
    }
    assert.equal("x-vault-token" in calls[0].headers, false, "the signup wire carries no bearer");
    assert.equal(calls[0].url, `${ORIGIN}/api/v1/auth/signup`);
    const signed = await client.signin("a@family.test", "the-honest-password");
    assert.equal(signed.ok, true);
    if (signed.ok) {
      assert.equal(signed.token, `vs_acct-1.1794188607445.${"a".repeat(64)}`);
      assert.equal(signed.expiresAt, 1794188607445);
    }
    assert.equal("x-vault-token" in calls[1].headers, false, "the signin wire carries no bearer");
  });

  it("rides the project list and the key lanes with the token header", async () => {
    const { fetch, calls } = seam([
      jsonanswer(200, {
        projects: [{ id: "p1", name: "the scope", region: "local", accountId: "acct-1", createdAt: "2026-01-01" }],
        total: 1,
        limit: 1,
        offset: 0,
      }),
      jsonanswer(201, {
        key: { id: "pk-1", label: "ci", createdAt: "2026-01-01", lastUsedAt: null },
        secret: `vk_${"b".repeat(64)}`,
      }),
      jsonanswer(200, { keys: [{ id: "pk-1", label: "ci", createdAt: "2026-01-01", lastUsedAt: "2026-01-02" }] }),
      jsonanswer(200, { revoked: true, id: "pk-1" }),
    ]);
    const client = vaultclient({ origin: ORIGIN, fetchImpl: fetch, token: "the-operator-token" });
    const page = await client.listProjects({ limit: 1, offset: 0 });
    assert.equal(page.ok, true);
    if (page.ok) {
      assert.equal(page.total, 1);
      assert.equal(page.rows[0]?.id, "p1");
      assert.equal(page.rows[0]?.accountId, "acct-1");
    }
    assert.equal(calls[0].url, `${ORIGIN}/api/v1/storage/projects?limit=1&offset=0`);
    const mint = await client.createKey("p1", "ci");
    assert.equal(mint.ok, true);
    if (mint.ok) {
      assert.equal(mint.key.id, "pk-1");
      assert.equal(mint.secret, `vk_${"b".repeat(64)}`);
    }
    const keys = await client.listKeys("p1");
    assert.equal(keys.ok, true);
    if (keys.ok) {
      assert.equal(keys.rows[0]?.lastUsedAt, "2026-01-02");
      assert.equal("secret" in keys.rows[0], false, "the list never carries the secret");
    }
    const revoked = await client.revokeKey("p1", "pk-1");
    assert.equal(revoked.ok, true);
    if (revoked.ok) assert.equal(revoked.id, "pk-1");
    assert.equal(calls[3].method, "DELETE");
    assert.equal(calls[3].headers["x-vault-token"], "the-operator-token", "the gated lanes carry the bearer");
  });

  it("answers the timeout lane when the engine keeps silent past the window", async () => {
    const { fetch } = seam([new Error("the lane refused")]);
    const client = vaultclient({ origin: ORIGIN, fetchImpl: fetch, timeoutMs: 10 });
    const answer = await client.health();
    assert.equal(answer.ok, false);
    if (!answer.ok) assert.equal(answer.status, null);
  });

  it("declares the module origin and token states the winget reads", () => {
    assert.equal(typeof vaultorigin(), "string");
    assert.equal(typeof vaulttokenconfigured(), "boolean");
  });
});
