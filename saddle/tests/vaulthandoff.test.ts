/**
 * real tests for the vault storage handoff (vaulthandoff.ts).
 *
 * the suite proves the storage engine law: every edge artifact lands in
 * the better sqlite vault store server-side (the roundtrip, the text
 * shape, the reopen of a real store file at mode 0o600), the sink
 * satisfies the virtual.ts storageadapter interface and answers the
 * internal api object url, the faun guard blocks every raw database
 * download path while the internal api passes, the visitor store
 * assertion refuses browser storage scopes, and a hostile run id stays
 * a bound parameter (the table still answers counts afterwards).
 *
 * run with plain node (no install): vitest run tests/vaulthandoff.test.ts
 * the .js import specifiers resolve to the .ts sources under vitest.
 */

import assert from "node:assert/strict";
import { statSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "vitest";
import { assertvisitorstorefree, faunblock, faunblockroutes, vaultsink } from "../vaulthandoff.js";
import { storageadapter } from "../virtual.js";

describe("the vaulthandoff contract", () => {
  it("putartifact and getartifact roundtrip an edge artifact through the vault store", () => {
    const sink = vaultsink();
    const bytes = new TextEncoder().encode("saddle edge artifact");
    const receipt = sink.putartifact({
      runid: "run-1",
      modality: "text",
      mime: "text/plain",
      bytes,
      createdat: 1234567890,
    });
    assert.equal(receipt.runid, "run-1");
    assert.equal(receipt.size, bytes.byteLength);
    const artifact = sink.getartifact("run-1");
    assert.notEqual(artifact, null);
    assert.equal(artifact?.runid, "run-1");
    assert.equal(artifact?.modality, "text");
    assert.equal(artifact?.mime, "text/plain");
    assert.equal(artifact?.createdat, 1234567890);
    assert.deepEqual(artifact?.bytes, bytes);
    assert.deepEqual(sink.counts(), { artifacts: 1, bytes: bytes.byteLength });
    const url = sink.artifacturl("run-1");
    assert.equal(url, "/api/v1/vault/objects/run-1");
    assert.equal(url.includes(".db"), false);
    assert.equal(sink.getartifact("absent-run"), null);
    sink.close();
  });

  it("putartifact keeps text artifacts as text and refreshes a repeated run id", () => {
    const sink = vaultsink();
    const first = sink.putartifact({
      runid: "run-text",
      modality: "log",
      mime: "text/plain",
      bytes: "one",
      createdat: 1,
    });
    assert.equal(first.size, 3);
    assert.equal(sink.getartifact("run-text")?.bytes, "one");
    const second = sink.putartifact({
      runid: "run-text",
      modality: "log",
      mime: "text/plain",
      bytes: "seven",
      createdat: 2,
    });
    assert.equal(second.size, 5);
    assert.deepEqual(sink.counts(), { artifacts: 1, bytes: 5 });
    assert.equal(sink.getartifact("run-text")?.bytes, "seven");
    sink.close();
  });

  it("the sink persists across reopen and keeps the store file at mode 0600", async () => {
    const root = await mkdtemp(join(tmpdir(), "saddlevault"));
    const dbfile = join(root, "vaulthandoff.db");
    const first = vaultsink({ path: dbfile });
    assert.ok(
      first.driver === "better-sqlite3" || first.driver === "node:sqlite",
      "the sink must run on a sqlite storage engine",
    );
    const bytes = new Uint8Array([1, 2, 3, 4]);
    first.putartifact({ runid: "run-file", modality: "image", mime: "image/png", bytes, createdat: 42 });
    first.close();
    const second = vaultsink({ path: dbfile });
    const artifact = second.getartifact("run-file");
    assert.notEqual(artifact, null);
    assert.deepEqual(artifact?.bytes, bytes);
    assert.deepEqual(second.counts(), { artifacts: 1, bytes: 4 });
    assert.equal(statSync(dbfile).mode & 0o777, 0o600);
    second.close();
    await rm(root, { recursive: true, force: true });
  });

  it("the sink satisfies the virtual.ts storageadapter interface", async () => {
    const sink = vaultsink();
    const required = ["put", "get", "head", "delete", "list"];
    for (const method of required) {
      assert.equal(typeof (sink as Record<string, unknown>)[method], "function", `the adapter requires ${method}`);
    }
    assert.strictEqual(storageadapter(sink), sink);
    const bytes = new TextEncoder().encode("adapter bytes");
    const manifest = await sink.put({ key: "run-adapter", data: bytes, contenttype: "text/plain" });
    assert.equal(manifest.key, "run-adapter");
    assert.equal(manifest.sizebytes, bytes.byteLength);
    assert.match(manifest.sha256, /^[0-9a-f]{64}$/);
    assert.deepEqual(await sink.get("run-adapter"), bytes);
    const head = await sink.head("run-adapter");
    assert.equal(head?.key, "run-adapter");
    assert.equal(head?.contenttype, "text/plain");
    assert.deepEqual(await sink.list("run-"), [manifest]);
    assert.deepEqual(await sink.list("other-"), []);
    assert.equal(await sink.delete("run-adapter"), true);
    assert.equal(await sink.delete("run-adapter"), false);
    assert.equal(await sink.head("run-adapter"), null);
    await assert.rejects(
      () => sink.get("run-adapter"),
      (error: unknown) => (error as { code?: string }).code === "ARTIFACT_NOT_FOUND",
    );
    sink.close();
  });

  it("faunblock blocks raw database downloads and allows internal api paths", () => {
    const blocked = ["faun.db", "vault/data.db", "store.sqlite", "BACKUP.DB", "/downloads/faun.sqlite3"];
    for (const path of blocked) {
      const verdict = faunblock(path);
      assert.equal(verdict.blocked, true, `${path} must be blocked`);
      assert.equal(verdict.code, "FAUN_DOWNLOAD_BLOCKED");
    }
    const allowed = ["/api/v1/vault/objects/abc123", "/api/v1/edge/run", "/index.html"];
    for (const path of allowed) {
      assert.deepEqual(faunblock(path), { blocked: false }, `${path} must be allowed`);
    }
    const routes = faunblockroutes(["faun.db", "/api/v1/vault/objects/abc123", "/index.html"]);
    assert.deepEqual(
      routes.map((verdict) => verdict.blocked),
      [true, false, false],
    );
    assert.equal(routes[0]?.code, "FAUN_DOWNLOAD_BLOCKED");
  });

  it("assertvisitorstorefree refuses browser storage scopes and passes clean scopes", () => {
    assert.throws(
      () => assertvisitorstorefree({ localStorage: {} }),
      (error: unknown) => (error as { code?: string }).code === "VISITOR_STORE_REFUSED",
    );
    assert.throws(
      () => assertvisitorstorefree({ sessionStorage: {}, indexedDB: {} }),
      (error: unknown) => (error as { code?: string }).code === "VISITOR_STORE_REFUSED",
    );
    assert.deepEqual(assertvisitorstorefree({}), { clean: true });
    assert.deepEqual(assertvisitorstorefree({ runtime: "server" }), { clean: true });
  });

  it("a hostile run id stays a bound parameter and the table still answers", () => {
    const sink = vaultsink();
    const hostile = "x'; drop table edgeartifacts;--";
    const receipt = sink.putartifact({
      runid: hostile,
      modality: "text",
      mime: "text/plain",
      bytes: "hostile payload",
      createdat: 7,
    });
    assert.equal(receipt.runid, hostile);
    const artifact = sink.getartifact(hostile);
    assert.notEqual(artifact, null);
    assert.equal(artifact?.bytes, "hostile payload");
    assert.deepEqual(sink.counts(), { artifacts: 1, bytes: 15 });
    assert.equal(sink.artifacturl(hostile).includes(".db"), false);
    sink.close();
  });
});
