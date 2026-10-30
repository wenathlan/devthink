// # vaultblobstore.test — the vault lane of the debonair blob store
// (wave PV6.002): the pointer round trip over a fake vault seam (the put
// mints the pointer, the bytes land content-addressed at the git-lfs
// shard paths, the manifest row lands beside them, the get resolves the
// pointer through the vault's own object rows and answers the same
// bytes), the lfs-friendly shapes (the shard layout, the canonical lfs
// pointer text round trip, the lfs channel the audio masters ride), the
// digest guard (tampered bytes answer bad-response, never a shrug), the
// typed error lanes (bad-id, bad-kind, too-large, not-found,
// store-closed, the seam refusal translation), the remove law (both
// objects drop, the bytes never block), the http seam binding over a
// fake fetch (the deposit headers, the token gate, the read facts, the
// list, the error catalog) and the backend decision seat (memory, file,
// gateway, vault — the deploy decides, the missing facts refuse, the env
// reader names the law). runnable with vitest:
//   pnpm vitest run tests/vaultblobstore.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { mintid } from "../bigintids.ts";
import {
  BLOB_BACKEND_ENV,
  BLOB_BACKEND_NAMES,
  BLOB_ROOT_ENV,
  type BlobStore,
  blobseatfromenv,
  lfsPointerFrom,
  lfsPointerText,
  resolveblobstore,
  sha256hex,
  VAULT_ORIGIN_ENV,
  VAULT_PROJECT_ENV,
  VAULT_TOKEN_ENV,
  type VaultObjectRow,
  type VaultSeamAnswer,
  type VaultStorageSeam,
  vaultblobstore,
  vaultclientseam,
} from "../blobstore.ts";

/** The pinned clock tick every store mints from. */
const BASE_TICK = 1_700_000_000_000;

/** A clock that ticks one millisecond per call (deterministic order). */
function tickingclock(): () => number {
  let tick = BASE_TICK;
  return () => tick++;
}

/** One stored object of the fake vault (the row beside the bytes). */
interface FakeRow {
  row: VaultObjectRow;
  bytes: Uint8Array;
}

/** The fake vault seam — the vault engine's object api in memory: the
 * deposit digests the bytes itself (the sha256 the pointer carries), the
 * read re-digests (the verified flag), the rows are path-addressed and
 * the list answers the project scope. The refusal script lets the tests
 * pin the error translation lanes. */
class FakeVault implements VaultStorageSeam {
  readonly objects = new Map<string, FakeRow>();
  private seq = 0;
  private clock = 0;
  /** The refusal the next call answers (the error lane script). */
  refuse: { code: string; message: string; status: number | null } | null = null;
  /** When set, the read answers these bytes instead of the stored ones
   * (the tamper lane — the digest guard must catch it). */
  tamper: Uint8Array | null = null;

  private mintid(): string {
    return `obj-${(this.seq++).toString(36).padStart(4, "0")}`;
  }

  async putObject(input: {
    projectId: string;
    path: string;
    mime: string;
    bytes: Uint8Array;
  }): Promise<VaultSeamAnswer<{ object: VaultObjectRow; reused: boolean }>> {
    if (this.refuse !== null) {
      const refusal = this.refuse;
      this.refuse = null;
      return { ok: false, ...refusal };
    }
    const digest = sha256hex(input.bytes);
    const existing = [...this.objects.values()].find((held) => held.row.path === input.path);
    const id = existing?.row.id ?? this.mintid();
    const row: VaultObjectRow = {
      id,
      projectId: input.projectId,
      path: input.path,
      mime: input.mime,
      size: String(input.bytes.length),
      digest,
      channel: input.mime.startsWith("audio/") ? "lfs" : "blob",
      tier: "l3",
      createdAt: new Date(BASE_TICK + this.clock++ * 1000).toISOString(),
    };
    this.objects.set(id, { row, bytes: input.bytes });
    return { ok: true, value: { object: row, reused: existing !== undefined } };
  }

  async getObject(id: string): Promise<
    VaultSeamAnswer<{
      id: string;
      facts: { path: string; mime: string; size: number; digest: string; verified: boolean };
      bytes: Uint8Array;
    }>
  > {
    if (this.refuse !== null) {
      const refusal = this.refuse;
      this.refuse = null;
      return { ok: false, ...refusal };
    }
    const held = this.objects.get(id);
    if (held === undefined) {
      return { ok: false, code: "VAULT_ABSENT", message: `the object "${id}" is not in the ledger`, status: 404 };
    }
    const bytes = this.tamper ?? held.bytes;
    return {
      ok: true,
      value: {
        id,
        facts: {
          path: held.row.path,
          mime: held.row.mime,
          size: bytes.length,
          digest: held.row.digest,
          verified: sha256hex(bytes) === held.row.digest,
        },
        bytes,
      },
    };
  }

  async deleteObject(id: string): Promise<VaultSeamAnswer<{ removed: boolean; id: string }>> {
    const held = this.objects.get(id);
    if (held === undefined) {
      return { ok: false, code: "VAULT_ABSENT", message: `the object "${id}" is not in the ledger`, status: 404 };
    }
    this.objects.delete(id);
    return { ok: true, value: { removed: true, id } };
  }

  async listObjects(projectId: string): Promise<VaultSeamAnswer<VaultObjectRow[]>> {
    const rows = [...this.objects.values()]
      .filter((held) => held.row.projectId === projectId)
      .map((held) => held.row)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    return { ok: true, value: rows };
  }
}

/** One wav-shaped byte fixture (deterministic, non-trivial). */
function wavbytes(seed: number, length = 512): Uint8Array {
  const bytes = new Uint8Array(length);
  let state = seed >>> 0;
  for (let index = 0; index < length; index++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    bytes[index] = (state >>> 24) & 0xff;
  }
  return bytes;
}

describe("the vault lane over the fake vault seam", () => {
  it("round trips the pointer through the vault object store", async () => {
    const seam = new FakeVault();
    const store = vaultblobstore(seam, { now: tickingclock() });
    const bytes = wavbytes(11);
    const put = await store.put(bytes, "audio/wav");
    assert.ok(put.ok, "the put lands");
    assert.match(put.pointer.id, /^[1-9]\d{0,19}$/, "the minted decimal form");
    assert.equal(put.pointer.bytes, bytes.length);
    assert.equal(put.pointer.sha256, sha256hex(bytes), "the digest this store computed");
    assert.equal(put.pointer.kind, "audio/wav");
    assert.match(put.pointer.storedAt, /^\d{4}-\d{2}-\d{2}T/);
    const got = await store.get(put.pointer.id);
    assert.ok(got.ok, "the get lands");
    assert.deepEqual(got.data, bytes, "the same bytes answer");
    assert.deepEqual(got.pointer, put.pointer, "the same pointer answers");
    // a fresh store instance (no id cache) resolves through the listing —
    // the paths are the truth, not the instance memory
    const fresh = vaultblobstore(seam);
    const again = await fresh.get(put.pointer.id);
    assert.ok(again.ok);
    assert.deepEqual(again.data, bytes);
    assert.deepEqual(again.pointer, put.pointer);
    store.close();
  });

  it("lands the lfs-friendly shapes: the shard paths, the manifest row, the lfs pointer text", async () => {
    const seam = new FakeVault();
    const store = vaultblobstore(seam, { now: tickingclock() });
    const bytes = wavbytes(23);
    const put = await store.put(bytes, "audio/wav");
    assert.ok(put.ok);
    const sha = put.pointer.sha256;
    // the bytes ride the git-lfs shard layout under the debonair namespace
    const bytesPath = `/debonair/objects/${sha.slice(0, 2)}/${sha.slice(2)}`;
    const manifestPath = `/debonair/manifests/${put.pointer.id}.json`;
    const paths = [...seam.objects.values()].map((held) => held.row.path).sort();
    assert.deepEqual(paths, [manifestPath, bytesPath].sort());
    // the vault row declares the lfs channel for the audio master
    const bytesRow = [...seam.objects.values()].find((held) => held.row.path === bytesPath);
    assert.ok(bytesRow);
    assert.equal(bytesRow.row.channel, "lfs");
    assert.equal(bytesRow.row.mime, "audio/wav");
    assert.equal(bytesRow.row.digest, sha, "the vault computed the same digest");
    // the manifest row is the debonair.blob/1 shape the db columns expect
    const manifestRow = [...seam.objects.values()].find((held) => held.row.path === manifestPath);
    assert.ok(manifestRow);
    const parsed = JSON.parse(new TextDecoder().decode(manifestRow.bytes)) as {
      schema: string;
      pointer: { id: string; sha256: string; bytes: number };
    };
    assert.equal(parsed.schema, "debonair.blob/1");
    assert.deepEqual(parsed.pointer, {
      id: put.pointer.id,
      bytes: put.pointer.bytes,
      sha256: put.pointer.sha256,
      kind: put.pointer.kind,
      storedAt: put.pointer.storedAt,
    });
    // the pointer exports to the canonical git-lfs pointer text verbatim
    const text = lfsPointerText(put.pointer);
    assert.equal(text, `version https://git-lfs.github.com/spec/v1\noid sha256:${sha}\nsize ${bytes.length}\n`);
    const back = lfsPointerFrom(text);
    assert.ok(back);
    assert.equal(back.sha256, sha);
    assert.equal(back.bytes, bytes.length);
    store.close();
  });

  it("refuses the tampered bytes through the digest guard", async () => {
    const seam = new FakeVault();
    const store = vaultblobstore(seam, { now: tickingclock() });
    const put = await store.put(wavbytes(37), "audio/wav");
    assert.ok(put.ok);
    seam.tamper = wavbytes(99);
    const got = await store.get(put.pointer.id);
    assert.ok(!got.ok, "the digest guard refuses");
    assert.equal(got.code, "bad-response");
    seam.tamper = null;
    const honest = await store.get(put.pointer.id);
    assert.ok(honest.ok, "the honest bytes still answer once the tamper folds away");
    store.close();
  });

  it("answers the typed error lanes — never a throw", async () => {
    const seam = new FakeVault();
    const store = vaultblobstore(seam, { now: tickingclock(), capBytes: 1024 });
    const badkind = await store.put(wavbytes(1, 8), "audio");
    assert.ok(!badkind.ok && badkind.code === "bad-kind");
    const toolarge = await store.put(wavbytes(1, 2048), "audio/wav");
    assert.ok(!toolarge.ok && toolarge.code === "too-large");
    const badid = await store.get("not-a-pointer");
    assert.ok(!badid.ok && badid.code === "bad-id");
    const absent = await store.get(mintid());
    assert.ok(!absent.ok && absent.code === "not-found");
    const missing = await store.remove(mintid());
    assert.ok(!missing.ok && missing.code === "not-found");
    // the seam refusal translation: the vault's own catalog rides the
    // message, the code lane stays the store's
    seam.refuse = { code: "VAULT_QUOTA", message: "the project is over its quota", status: 413 };
    const quota = await store.put(wavbytes(1, 16), "audio/wav");
    assert.ok(!quota.ok && quota.code === "too-large" && quota.status === 413);
    seam.refuse = { code: "VAULT_AUTH", message: "the storage truth demands the vault token", status: 401 };
    const auth = await store.put(wavbytes(1, 16), "audio/wav");
    assert.ok(!auth.ok && auth.code === "refused" && auth.status === 401);
    seam.refuse = { code: "VAULT_TIMEOUT", message: "silent", status: null };
    const timedout = await store.put(wavbytes(1, 16), "audio/wav");
    assert.ok(!timedout.ok && timedout.code === "timeout");
    seam.refuse = { code: "VAULT_LANE", message: "unreachable", status: null };
    const offline = await store.put(wavbytes(1, 16), "audio/wav");
    assert.ok(!offline.ok && offline.code === "offline");
    store.close();
    const closed = await store.put(wavbytes(1, 16), "audio/wav");
    assert.ok(!closed.ok && closed.code === "store-closed");
  });

  it("drops both objects on remove and lists the shelf newest first", async () => {
    const seam = new FakeVault();
    const store = vaultblobstore(seam, { now: tickingclock() });
    const first = await store.put(wavbytes(41), "audio/wav");
    const second = await store.put(wavbytes(42), "audio/wav");
    assert.ok(first.ok && second.ok);
    const listed = await store.list();
    assert.equal(listed.length, 2);
    assert.deepEqual(
      listed.map((pointer) => pointer.id),
      [second.pointer.id, first.pointer.id],
      "newest first (the minted id desc tiebreak)",
    );
    const dropped = await store.remove(first.pointer.id);
    assert.ok(dropped.ok);
    assert.equal(dropped.pointer.id, first.pointer.id);
    const after = await store.get(first.pointer.id);
    assert.ok(!after.ok && after.code === "not-found");
    // both the manifest and the bytes folded away
    assert.equal(seam.objects.size, 2, "the second blob's pair alone stands");
    const shelf = await store.list();
    assert.equal(shelf.length, 1);
    assert.equal(shelf[0]?.id, second.pointer.id);
    store.close();
  });
});

describe("the http vault seam binding over a fake fetch", () => {
  /** One captured fetch call (the assertions read the wire law). */
  interface CapturedCall {
    url: string;
    init: RequestInit | undefined;
  }

  /** Builds the fake fetch serving the vault surface law: every call is
   * captured, the answers follow the vault's own wire shapes. */
  function fakefetch() {
    const calls: CapturedCall[] = [];
    const fetchImpl = (url: string, init?: RequestInit): Promise<Response> => {
      calls.push({ url, init });
      const parsed = new URL(url);
      const method = (init?.method ?? "GET").toUpperCase();
      const headers = (init?.headers ?? {}) as Record<string, string>;
      const tokenheader = headers["x-vault-token"] ?? "";
      if (tokenheader !== "the-pinned-token") {
        return Promise.resolve(
          new Response(JSON.stringify({ error: { code: "VAULT_AUTH", message: "the bearer refused" } }), {
            status: 401,
          }),
        );
      }
      if (method === "POST" && parsed.pathname === "/api/v1/storage/objects") {
        const body = new Uint8Array(((init?.body as Uint8Array) ?? new Uint8Array()).buffer);
        return Promise.resolve(
          new Response(
            JSON.stringify({
              object: {
                id: "obj-1",
                projectId: headers["x-project-id"],
                path: decodeURIComponent(headers["x-object-path"]),
                mime: headers["x-object-mime"],
                size: String(body.length),
                digest: `f${sha256hex(body).slice(1)}`,
                channel: "lfs",
                tier: "l3",
                createdAt: "2026-06-01T00:00:00.000Z",
              },
              reused: false,
            }),
            { status: 201 },
          ),
        );
      }
      if (method === "GET" && parsed.pathname === "/api/v1/storage/objects/obj-1") {
        return Promise.resolve(
          new Response(new Uint8Array([1, 2, 3]), {
            status: 200,
            headers: {
              "content-type": "audio/wav",
              "x-object-digest": "a".repeat(64),
              "x-object-size": "3",
              "x-object-path": "/debonair/objects/aa/bb",
              "x-object-verified": "true",
            },
          }),
        );
      }
      if (method === "GET" && parsed.pathname === "/api/v1/storage/objects") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              objects: [
                {
                  id: "obj-1",
                  projectId: parsed.searchParams.get("project"),
                  path: "/debonair/manifests/123.json",
                  mime: "application/json",
                  size: "64",
                  digest: "b".repeat(64),
                  channel: "blob",
                  tier: "l3",
                  createdAt: "2026-06-01T00:00:00.000Z",
                },
              ],
            }),
            { status: 200 },
          ),
        );
      }
      if (method === "DELETE" && parsed.pathname === "/api/v1/storage/objects/obj-1") {
        return Promise.resolve(new Response(JSON.stringify({ removed: true, id: "obj-1" }), { status: 200 }));
      }
      return Promise.resolve(
        new Response(JSON.stringify({ error: { code: "VAULT_ROUTE", message: "no route" } }), { status: 404 }),
      );
    };
    return { calls, fetchImpl };
  }

  it("deposits with the vault headers and the token gate", async () => {
    const { calls, fetchImpl } = fakefetch();
    const seam = vaultclientseam("https://vault.example.com", { token: "the-pinned-token", fetchImpl });
    const answer = await seam.putObject({
      projectId: "debonair",
      path: "/debonair/objects/aa/bb",
      mime: "audio/wav",
      bytes: new Uint8Array([1, 2, 3]),
    });
    assert.ok(answer.ok, "the deposit lands");
    assert.equal(answer.value.object.path, "/debonair/objects/aa/bb");
    assert.equal(answer.value.object.channel, "lfs");
    const call = calls[0];
    assert.ok(call);
    assert.equal(call.url, "https://vault.example.com/api/v1/storage/objects");
    const headers = call.init?.headers as Record<string, string>;
    assert.equal(headers["x-project-id"], "debonair");
    assert.equal(headers["x-object-path"], encodeURIComponent("/debonair/objects/aa/bb"));
    assert.equal(headers["x-object-mime"], "audio/wav");
    assert.equal(headers["x-vault-token"], "the-pinned-token");
    assert.equal(headers.authorization, "Bearer the-pinned-token");
  });

  it("answers the verified read with the header facts", async () => {
    const { fetchImpl } = fakefetch();
    const seam = vaultclientseam("https://vault.example.com", { token: "the-pinned-token", fetchImpl });
    const answer = await seam.getObject("obj-1");
    assert.ok(answer.ok);
    assert.deepEqual([...answer.value.bytes], [1, 2, 3]);
    assert.equal(answer.value.facts.path, "/debonair/objects/aa/bb");
    assert.equal(answer.value.facts.mime, "audio/wav");
    assert.equal(answer.value.facts.size, 3);
    assert.equal(answer.value.facts.digest, "a".repeat(64));
    assert.equal(answer.value.facts.verified, true);
  });

  it("lists the project rows, soft-deletes and translates the refusals", async () => {
    const { fetchImpl } = fakefetch();
    const seam = vaultclientseam("https://vault.example.com", { token: "the-pinned-token", fetchImpl });
    const list = await seam.listObjects("debonair");
    assert.ok(list.ok);
    assert.equal(list.value.length, 1);
    assert.equal(list.value[0]?.projectId, "debonair");
    const drop = await seam.deleteObject("obj-1");
    assert.ok(drop.ok && drop.value.removed);
    // the wrong token answers the vault's own refusal code
    const sealed = vaultclientseam("https://vault.example.com", { token: "a-wrong-token", fetchImpl });
    const refused = await sealed.putObject({
      projectId: "debonair",
      path: "/x",
      mime: "audio/wav",
      bytes: new Uint8Array([1]),
    });
    assert.ok(!refused.ok);
    assert.equal(refused.code, "VAULT_AUTH");
    assert.equal(refused.status, 401);
  });

  it("refuses the origin that breaks the house https law", async () => {
    const seam = vaultclientseam("http://vault.internal", {
      token: "the-pinned-token",
      fetchImpl: () => Promise.resolve(new Response()),
    });
    const answer = await seam.listObjects("debonair");
    assert.ok(!answer.ok);
    assert.equal(answer.code, "VAULT_LANE");
    assert.match(answer.message, /https law/);
  });
});

describe("the backend decision seat (memory, file, gateway, vault)", () => {
  it("answers the memory mirror by default and by name", () => {
    const unnamed = resolveblobstore({});
    assert.ok(unnamed.ok);
    assert.equal(unnamed.backend, "memory");
    assert.equal(typeof unnamed.store.put, "function");
    const named = resolveblobstore({ backend: "MEMORY" });
    assert.ok(named.ok && named.backend === "memory");
  });

  it("refuses the off-vocabulary backend name — never a silent fallback", () => {
    const refused = resolveblobstore({ backend: "turbo" });
    assert.ok(!refused.ok);
    assert.equal(refused.code, "bad-backend");
    assert.match(refused.message, new RegExp(BLOB_BACKEND_NAMES.join(", ")));
  });

  it("refuses the file lane without a root and answers it with one", () => {
    const refused = resolveblobstore({ backend: "file" });
    assert.ok(!refused.ok && refused.code === "missing-root");
    const seated = resolveblobstore({ backend: "file", root: "/tmp/debonair-blobs" });
    assert.ok(seated.ok && seated.backend === "file");
  });

  it("refuses the gateway lane without an origin and answers it with one", () => {
    const refused = resolveblobstore({ backend: "gateway" });
    assert.ok(!refused.ok && refused.code === "missing-origin");
    const seated = resolveblobstore({ backend: "gateway", origin: "https://gateway.example.com" });
    assert.ok(seated.ok && seated.backend === "gateway");
  });

  it("refuses the vault lane without the seam and answers it with one", () => {
    const refused = resolveblobstore({ backend: "vault" });
    assert.ok(!refused.ok && refused.code === "missing-vault");
    const seam = vaultclientseam("https://vault.example.com", { token: "t" });
    const seated = resolveblobstore({ backend: "vault", vault: seam, projectId: "debonair" });
    assert.ok(seated.ok && seated.backend === "vault");
    // the seated vault store satisfies the one interface every lane rides
    const store: BlobStore = seated.store;
    assert.equal(typeof store.put, "function");
  });

  it("reads the seat off the environment names (the deploy law)", () => {
    const env: Record<string, string> = {
      [BLOB_BACKEND_ENV]: "vault",
      [VAULT_ORIGIN_ENV]: "https://vault.example.com",
      [VAULT_TOKEN_ENV]: "the-pinned-token",
      [VAULT_PROJECT_ENV]: "debonair",
      [BLOB_ROOT_ENV]: "  ",
    };
    const seat = blobseatfromenv((name) => env[name]);
    assert.equal(seat.backend, "vault");
    assert.equal(seat.projectId, "debonair");
    assert.equal(seat.root, undefined, "a blank root never rides (the trim law)");
    assert.ok(seat.vault, "the vault seam builds from the configured origin");
    const resolved = resolveblobstore(seat);
    assert.ok(resolved.ok && resolved.backend === "vault");
    // an empty environment answers the memory default (the offline seat)
    const bare = blobseatfromenv(() => undefined);
    assert.deepEqual(bare, {});
    const offline = resolveblobstore(bare);
    assert.ok(offline.ok && offline.backend === "memory");
    // the file lane reads its root
    const filed = blobseatfromenv((name) =>
      name === BLOB_BACKEND_ENV ? "file" : name === BLOB_ROOT_ENV ? "/data/blobs" : undefined,
    );
    assert.equal(filed.backend, "file");
    assert.equal(filed.root, "/data/blobs");
  });
});
