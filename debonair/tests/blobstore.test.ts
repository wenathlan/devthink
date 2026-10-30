// # blobstore.test — the content-addressed store contract: the hand-rolled
// sha256 answers the fips 180-4 vectors (empty, abc, the two-block padding
// edge, the million-a long vector), the memory mirror round-trips bytes
// and pointers under the byte cap with the oldest-evicted law, the file
// lane persists the git-lfs shard layout with atomic writes and the
// sidecar manifest rows, and the gateway seam rides an injected fetch with
// typed errors — never a throw. runnable with vitest:
// pnpm vitest run tests/blobstore.test.ts
import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, it } from "vitest";
import { idtick, mintid } from "../bigintids.ts";
import {
  BLOB_DEFAULT_CAP_BYTES,
  type BlobManifestRow,
  type BlobPointer,
  blobrowvalid,
  fileblobstore,
  gatewayblobstore,
  lfsPointerFrom,
  lfsPointerText,
  memoryblobstore,
  sha256hex,
} from "../blobstore.ts";

const encoder = new TextEncoder();

/** the known fips 180-4 answers the hand-rolled rounds must reproduce. */
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

/** One captured gateway call — what the seam put on the wire. */
interface LaneCall {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: Uint8Array | null;
}

/** Builds an injected fetch double: every call is captured, the handler
 * answers the response (the tests pin the wire law). */
function fakelane(answer: (call: LaneCall) => Response | Promise<Response>): {
  fetchImpl: typeof fetch;
  calls: LaneCall[];
} {
  const calls: LaneCall[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const source = init?.headers as Record<string, string> | undefined;
    const headers: Record<string, string> = {};
    for (const name of Object.keys(source ?? {})) headers[name] = String(source?.[name]);
    const call: LaneCall = {
      method: init?.method ?? "GET",
      url: typeof input === "string" ? input : input.url,
      headers,
      body: init?.body instanceof Uint8Array ? new Uint8Array(init.body) : null,
    };
    calls.push(call);
    return answer(call);
  };
  return { fetchImpl, calls };
}

/** the temp roots the file-lane tests created (folded away at the end). */
const roots: string[] = [];

/** One fresh file-lane root under the system temp directory. */
async function newroot(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "debonair-blobstore-"));
  roots.push(root);
  return root;
}

afterAll(async () => {
  await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
});

/** Walks every file under a root (the temp-file audit and the layout check). */
async function walkfiles(root: string): Promise<string[]> {
  const found: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const full = `${root}/${entry.name}`;
    if (entry.isDirectory()) found.push(...(await walkfiles(full)));
    else found.push(full);
  }
  return found;
}

/** Answers whether a path exists (the removal audit). */
async function exists(candidate: string): Promise<boolean> {
  try {
    await stat(candidate);
    return true;
  } catch {
    return false;
  }
}

describe("sha256 (the hand-rolled fips 180-4 rounds)", () => {
  it("answers the empty vector", () => {
    assert.equal(sha256hex(new Uint8Array(0)), EMPTY_SHA);
  });

  it("answers the abc vector", () => {
    assert.equal(sha256hex(encoder.encode("abc")), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("answers the two-block padding edge", () => {
    const message = "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq";
    assert.equal(
      sha256hex(encoder.encode(message)),
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
    );
  });

  it("answers the million-a long vector", () => {
    const million = new Uint8Array(1_000_000).fill(97);
    assert.equal(sha256hex(million), "cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0");
  });
});

describe("the manifest row and the git-lfs pointer law", () => {
  const pointer: BlobPointer = {
    id: "123456789012345678",
    bytes: 44100,
    sha256: "ab".repeat(32),
    kind: "audio/wav",
    storedAt: "2026-01-01T00:00:00.000Z",
  };

  it("writes the canonical git-lfs pointer text and parses it back", () => {
    const text = `version https://git-lfs.github.com/spec/v1\noid sha256:${pointer.sha256}\nsize ${pointer.bytes}\n`;
    assert.equal(lfsPointerText(pointer), text);
    assert.deepEqual(lfsPointerFrom(text), { sha256: pointer.sha256, bytes: pointer.bytes });
    assert.equal(lfsPointerFrom("version https://git-lfs.github.com/spec/v1\n"), undefined);
  });

  it("guards the manifest row against foreign schemas and broken fields", () => {
    assert.ok(blobrowvalid({ schema: "debonair.blob/1", pointer }));
    assert.equal(blobrowvalid({ schema: "debonair.blob/2", pointer }), false);
    assert.equal(blobrowvalid(null), false);
    assert.equal(blobrowvalid({ schema: "debonair.blob/1", pointer: { ...pointer, sha256: "nothex" } }), false);
    assert.equal(blobrowvalid({ schema: "debonair.blob/1", pointer: { ...pointer, id: "0" } }), false);
  });
});

describe("memoryblobstore (the offline mirror and the test seat)", () => {
  it("round-trips bytes with the store-computed sha", async () => {
    const store = memoryblobstore();
    const bytes = new Uint8Array([0, 1, 2, 3, 250, 251, 252, 253, 254, 255]);
    const put = await store.put(bytes, "audio/wav");
    assert.ok(put.ok);
    assert.equal(put.pointer.bytes, bytes.byteLength);
    assert.equal(put.pointer.kind, "audio/wav");
    assert.equal(put.pointer.sha256, sha256hex(bytes));
    const got = await store.get(put.pointer.id);
    assert.ok(got.ok);
    assert.deepEqual(got.data, bytes);
    assert.equal(got.pointer.sha256, put.pointer.sha256);
  });

  it("mints decimal pointer ids that self-describe the tick", async () => {
    const store = memoryblobstore();
    const put = await store.put(new Uint8Array([9]), "audio/wav");
    assert.ok(put.ok);
    assert.match(put.pointer.id, /^[1-9]\d{0,19}$/);
    assert.ok(Math.abs(idtick(put.pointer.id) - Date.now()) < 60_000);
  });

  it("lists newest first", async () => {
    const store = memoryblobstore();
    const first = await store.put(new Uint8Array([1]), "audio/wav");
    const second = await store.put(new Uint8Array([2]), "audio/wav");
    assert.ok(first.ok);
    assert.ok(second.ok);
    const pointers = await store.list();
    assert.equal(pointers.length, 2);
    assert.equal(pointers[0].id, second.pointer.id);
    assert.equal(pointers[1].id, first.pointer.id);
  });

  it("remove answers the pointer, then get answers not-found", async () => {
    const store = memoryblobstore();
    const put = await store.put(new Uint8Array([3]), "audio/wav");
    assert.ok(put.ok);
    const removed = await store.remove(put.pointer.id);
    assert.ok(removed.ok);
    assert.equal(removed.pointer.id, put.pointer.id);
    assert.equal(removed.data, null);
    const gone = await store.get(put.pointer.id);
    assert.ok(!gone.ok);
    assert.equal(gone.code, "not-found");
    const again = await store.remove(put.pointer.id);
    assert.ok(!again.ok);
    assert.equal(again.code, "not-found");
  });

  it("refuses the bytes above the cap (the default is the generous 512 mb)", async () => {
    assert.equal(BLOB_DEFAULT_CAP_BYTES, 512 * 1024 * 1024);
    const store = memoryblobstore({ capBytes: 8 });
    const refused = await store.put(new Uint8Array(9), "audio/wav");
    assert.ok(!refused.ok);
    assert.equal(refused.code, "too-large");
    const kept = await store.put(new Uint8Array(8), "audio/wav");
    assert.ok(kept.ok);
  });

  it("refuses an empty or malformed kind", async () => {
    const store = memoryblobstore();
    for (const kind of ["", "audio", "audio/wav; charset=binary", " "]) {
      const refused = await store.put(new Uint8Array([1]), kind);
      assert.ok(!refused.ok, `the kind "${kind}" must refuse`);
      assert.equal(refused.code, "bad-kind");
    }
  });

  it("accepts empty data (the zero-bytes pointer, the empty-vector digest)", async () => {
    const store = memoryblobstore();
    const put = await store.put(new Uint8Array(0), "audio/wav");
    assert.ok(put.ok);
    assert.equal(put.pointer.bytes, 0);
    assert.equal(put.pointer.sha256, EMPTY_SHA);
    const got = await store.get(put.pointer.id);
    assert.ok(got.ok);
    assert.equal(got.data?.byteLength, 0);
  });

  it("answers bad-id for malformed ids on get and remove", async () => {
    const store = memoryblobstore();
    for (const id of ["", "nope", "0", "0123", "-1"]) {
      const got = await store.get(id);
      assert.ok(!got.ok);
      assert.equal(got.code, "bad-id");
      const removed = await store.remove(id);
      assert.ok(!removed.ok);
      assert.equal(removed.code, "bad-id");
    }
  });

  it("answers store-closed after close (list answers empty)", async () => {
    const store = memoryblobstore();
    const put = await store.put(new Uint8Array([1]), "audio/wav");
    assert.ok(put.ok);
    store.close();
    const refused = await store.put(new Uint8Array([2]), "audio/wav");
    assert.ok(!refused.ok);
    assert.equal(refused.code, "store-closed");
    const got = await store.get(put.pointer.id);
    assert.ok(!got.ok);
    assert.equal(got.code, "store-closed");
    assert.deepEqual(await store.list(), []);
  });

  it("evicts the oldest when the cap fills (the mirror law)", async () => {
    const store = memoryblobstore({ capBytes: 10 });
    const first = await store.put(new Uint8Array(6), "audio/wav");
    const second = await store.put(new Uint8Array(6), "audio/wav");
    assert.ok(first.ok);
    assert.ok(second.ok);
    const gone = await store.get(first.pointer.id);
    assert.ok(!gone.ok);
    assert.equal(gone.code, "not-found");
    const kept = await store.get(second.pointer.id);
    assert.ok(kept.ok);
    assert.deepEqual(await store.list(), [second.pointer]);
  });

  it("mints a fresh pointer per put (the row is the pointer, the content the address)", async () => {
    const store = memoryblobstore();
    const bytes = new Uint8Array([7, 7, 7]);
    const first = await store.put(bytes, "audio/wav");
    const second = await store.put(bytes, "audio/wav");
    assert.ok(first.ok);
    assert.ok(second.ok);
    assert.notEqual(first.pointer.id, second.pointer.id);
    assert.equal(first.pointer.sha256, second.pointer.sha256);
    assert.equal((await store.list()).length, 2);
  });
});

describe("fileblobstore (the server lane, node only)", () => {
  it("writes the shard layout on disk (the git-lfs object law)", async () => {
    const root = await newroot();
    const store = fileblobstore(root);
    const bytes = encoder.encode("the shard law keeps the objects flat");
    const put = await store.put(bytes, "audio/wav");
    assert.ok(put.ok);
    const { sha256 } = put.pointer;
    const object = path.join(root, "objects", sha256.slice(0, 2), sha256.slice(2));
    const raw = await readFile(object);
    assert.deepEqual(new Uint8Array(raw), bytes);
  });

  it("writes the sidecar manifest row beside the bytes", async () => {
    const root = await newroot();
    const store = fileblobstore(root);
    const bytes = encoder.encode("the manifest row rides its own shelf");
    const put = await store.put(bytes, "audio/wav");
    assert.ok(put.ok);
    const manifest = path.join(root, "manifests", `${put.pointer.id}.json`);
    const row = JSON.parse(await readFile(manifest, "utf8")) as BlobManifestRow;
    assert.equal(row.schema, "debonair.blob/1");
    assert.equal(row.pointer.id, put.pointer.id);
    assert.equal(row.pointer.bytes, bytes.byteLength);
    assert.equal(row.pointer.sha256, put.pointer.sha256);
    assert.equal(row.pointer.kind, "audio/wav");
    assert.match(row.pointer.storedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it("leaves no temp file behind (the atomic write)", async () => {
    const root = await newroot();
    const store = fileblobstore(root);
    await store.put(encoder.encode("atomic"), "audio/wav");
    const files = await walkfiles(root);
    assert.ok(files.length >= 2);
    for (const file of files) assert.ok(!file.endsWith(".tmp"), `a temp file was left: ${file}`);
  });

  it("round-trips across instances (the persistence law)", async () => {
    const root = await newroot();
    const first = fileblobstore(root);
    const bytes = encoder.encode("persisted across instances");
    const put = await first.put(bytes, "audio/wav");
    assert.ok(put.ok);
    const second = fileblobstore(root);
    const got = await second.get(put.pointer.id);
    assert.ok(got.ok);
    assert.deepEqual(got.data, bytes);
    assert.equal(got.pointer.sha256, put.pointer.sha256);
    const pointers = await second.list();
    assert.equal(pointers.length, 1);
    assert.equal(pointers[0].id, put.pointer.id);
  });

  it("removes both files and answers the pointer", async () => {
    const root = await newroot();
    const store = fileblobstore(root);
    const put = await store.put(encoder.encode("removed"), "audio/wav");
    assert.ok(put.ok);
    const manifest = path.join(root, "manifests", `${put.pointer.id}.json`);
    const object = path.join(root, "objects", put.pointer.sha256.slice(0, 2), put.pointer.sha256.slice(2));
    const removed = await store.remove(put.pointer.id);
    assert.ok(removed.ok);
    assert.equal(removed.pointer.id, put.pointer.id);
    assert.equal(await exists(manifest), false);
    assert.equal(await exists(object), false);
    const gone = await store.get(put.pointer.id);
    assert.ok(!gone.ok);
    assert.equal(gone.code, "not-found");
  });

  it("answers not-found for an unknown id and bad-id for a malformed one", async () => {
    const root = await newroot();
    const store = fileblobstore(root);
    const fresh = await store.get(mintid());
    assert.ok(!fresh.ok);
    assert.equal(fresh.code, "not-found");
    const malformed = await store.get("not-a-pointer");
    assert.ok(!malformed.ok);
    assert.equal(malformed.code, "bad-id");
  });

  it("refuses the bytes above the cap", async () => {
    const root = await newroot();
    const store = fileblobstore(root, { capBytes: 4 });
    const refused = await store.put(new Uint8Array(5), "audio/wav");
    assert.ok(!refused.ok);
    assert.equal(refused.code, "too-large");
  });

  it("accepts the empty blob at the empty-digest shard", async () => {
    const root = await newroot();
    const store = fileblobstore(root);
    const put = await store.put(new Uint8Array(0), "audio/wav");
    assert.ok(put.ok);
    assert.equal(put.pointer.bytes, 0);
    assert.equal(put.pointer.sha256, EMPTY_SHA);
    const got = await store.get(put.pointer.id);
    assert.ok(got.ok);
    assert.equal(got.data?.byteLength, 0);
  });
});

describe("gatewayblobstore (the vault seam over an injected fetch)", () => {
  const origin = "https://storage.example.com";

  it("round-trips through the injected fetch seam", async () => {
    const bytes = encoder.encode("debonair blob round trip");
    const kind = "audio/wav";
    const sha = sha256hex(bytes);
    const storedAt = "2026-01-01T00:00:00.000Z";
    const { fetchImpl, calls } = fakelane((call) => {
      if (call.method === "PUT") {
        const id = call.url.split("/").at(-1) ?? "";
        return Response.json({
          schema: "debonair.blob/1",
          pointer: {
            id,
            bytes: call.body?.byteLength ?? 0,
            sha256: call.headers["x-debonair-blob-sha256"] ?? "",
            kind: call.headers["content-type"] ?? "",
            storedAt,
          },
        });
      }
      return new Response(bytes, {
        headers: {
          "content-type": kind,
          "x-debonair-blob-sha256": sha,
          "x-debonair-blob-bytes": String(bytes.byteLength),
          "x-debonair-blob-stored-at": storedAt,
        },
      });
    });
    const store = gatewayblobstore(origin, { fetchImpl });
    const put = await store.put(bytes, kind);
    assert.ok(put.ok);
    assert.equal(put.pointer.sha256, sha);
    assert.equal(put.pointer.bytes, bytes.byteLength);
    assert.equal(put.pointer.kind, kind);
    assert.equal(put.pointer.storedAt, storedAt);
    assert.equal(put.data, null);
    // the wire law: PUT /api/v1/blob/:id, the mime and the digest on the headers, the raw bytes the body
    assert.equal(calls[0].method, "PUT");
    assert.equal(calls[0].url, `${origin}/api/v1/blob/${put.pointer.id}`);
    assert.equal(calls[0].headers["content-type"], kind);
    assert.equal(calls[0].headers["x-debonair-blob-sha256"], sha);
    assert.deepEqual(calls[0].body, bytes);
    const got = await store.get(put.pointer.id);
    assert.ok(got.ok);
    assert.deepEqual(got.data, bytes);
    assert.equal(got.pointer.id, put.pointer.id);
    assert.equal(got.pointer.sha256, sha);
    assert.equal(got.pointer.kind, kind);
    assert.equal(got.pointer.storedAt, storedAt);
    assert.equal(calls[1].method, "GET");
  });

  it("answers not-found when the gateway answers 404", async () => {
    const { fetchImpl } = fakelane(() => new Response("gone", { status: 404 }));
    const store = gatewayblobstore(origin, { fetchImpl });
    const got = await store.get("123456789012345678");
    assert.ok(!got.ok);
    assert.equal(got.code, "not-found");
    assert.equal(got.status, 404);
  });

  it("answers refused on the other non-2xx answers", async () => {
    const { fetchImpl } = fakelane(() => new Response("boom", { status: 500 }));
    const store = gatewayblobstore(origin, { fetchImpl });
    const got = await store.get("123456789012345678");
    assert.ok(!got.ok);
    assert.equal(got.code, "refused");
    assert.equal(got.status, 500);
  });

  it("answers too-large when the gateway refuses the size (413)", async () => {
    const { fetchImpl } = fakelane(() => new Response("", { status: 413 }));
    const store = gatewayblobstore(origin, { fetchImpl });
    const put = await store.put(encoder.encode("too big for the vault"), "audio/wav");
    assert.ok(!put.ok);
    assert.equal(put.code, "too-large");
    assert.equal(put.status, 413);
  });

  it("answers offline when the network refuses — never a throw", async () => {
    const { fetchImpl } = fakelane(() => {
      throw new Error("the dns is down");
    });
    const store = gatewayblobstore(origin, { fetchImpl });
    const got = await store.get("123456789012345678");
    assert.ok(!got.ok);
    assert.equal(got.code, "offline");
    assert.equal(got.status, null);
  });

  it("refuses an origin that breaks the house https law before any call", async () => {
    const { fetchImpl, calls } = fakelane(() => new Response("never", { status: 200 }));
    const insecure = gatewayblobstore("http://storage.example.com", { fetchImpl });
    const put = await insecure.put(new Uint8Array([1]), "audio/wav");
    assert.ok(!put.ok);
    assert.equal(put.code, "offline");
    const loopback = gatewayblobstore("https://localhost", { fetchImpl });
    const got = await loopback.get("123456789012345678");
    assert.ok(!got.ok);
    assert.equal(got.code, "offline");
    assert.equal(calls.length, 0);
  });

  it("answers bad-id before any call leaves the host", async () => {
    const { fetchImpl, calls } = fakelane(() => new Response("never", { status: 200 }));
    const store = gatewayblobstore(origin, { fetchImpl });
    const got = await store.get("not-a-pointer");
    assert.ok(!got.ok);
    assert.equal(got.code, "bad-id");
    assert.equal(calls.length, 0);
  });

  it("answers bad-response when the echo confuses the manifest", async () => {
    const { fetchImpl } = fakelane(() =>
      Response.json({
        schema: "debonair.blob/1",
        pointer: {
          id: "999999999999999999",
          bytes: 1,
          sha256: "cd".repeat(32),
          kind: "audio/wav",
          storedAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    );
    const store = gatewayblobstore(origin, { fetchImpl });
    const put = await store.put(encoder.encode("the echo must answer the request"), "audio/wav");
    assert.ok(!put.ok);
    assert.equal(put.code, "bad-response");
  });

  it("lists the rows the gateway answers, newest first", async () => {
    const rows = [
      {
        schema: "debonair.blob/1",
        pointer: {
          id: "111111111111111111",
          bytes: 1,
          sha256: "aa".repeat(32),
          kind: "audio/wav",
          storedAt: "2026-01-02T00:00:00.000Z",
        },
      },
      {
        schema: "debonair.blob/1",
        pointer: {
          id: "222222222222222222",
          bytes: 2,
          sha256: "bb".repeat(32),
          kind: "audio/wav",
          storedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    ];
    const { fetchImpl, calls } = fakelane(() => Response.json(rows));
    const store = gatewayblobstore(origin, { fetchImpl });
    const pointers = await store.list();
    assert.equal(pointers.length, 2);
    assert.equal(pointers[0].id, "111111111111111111");
    assert.equal(pointers[1].id, "222222222222222222");
    assert.equal(calls[0].method, "GET");
    assert.equal(calls[0].url, `${origin}/api/v1/blob`);
  });

  it("removes through the delete lane and answers not-found on the 404", async () => {
    let deletes = 0;
    const { fetchImpl, calls } = fakelane((call) => {
      if (call.method === "DELETE" && deletes === 0) {
        deletes++;
        const id = call.url.split("/").at(-1) ?? "";
        return Response.json({
          schema: "debonair.blob/1",
          pointer: { id, bytes: 4, sha256: "cc".repeat(32), kind: "audio/wav", storedAt: "2026-01-01T00:00:00.000Z" },
        });
      }
      return new Response("", { status: 404 });
    });
    const store = gatewayblobstore(origin, { fetchImpl });
    const removed = await store.remove("123456789012345678");
    assert.ok(removed.ok);
    assert.equal(removed.pointer.id, "123456789012345678");
    assert.equal(calls[0].method, "DELETE");
    assert.equal(calls[0].url, `${origin}/api/v1/blob/123456789012345678`);
    const missing = await store.remove("123456789012345679");
    assert.ok(!missing.ok);
    assert.equal(missing.code, "not-found");
  });

  it("answers store-closed after close, before any call leaves the host", async () => {
    const { fetchImpl, calls } = fakelane(() => new Response("never", { status: 200 }));
    const store = gatewayblobstore(origin, { fetchImpl });
    store.close();
    const put = await store.put(new Uint8Array([1]), "audio/wav");
    assert.ok(!put.ok);
    assert.equal(put.code, "store-closed");
    assert.deepEqual(await store.list(), []);
    assert.equal(calls.length, 0);
  });
});
