// # internalroot.test — the internal root of the vault (the wave D static
// lane), runnable with the house vitest suite:
//   bunx vitest run tests/internalroot.test.ts
// The faun law owns the door: the static root must NEVER serve the raw
// database files (.db and every sqlite spelling with their -wal/-shm/
// -journal siblings) — the database data flows only through the internal
// api lanes. The battery pins the law over the real server: the database
// files answer the 403 refusal before any filesystem touch, the traversal
// paths answer the honest 404 (never a hint of the tree outside), every
// file type answers with the correct content type from the mimetypes
// registry (the family law rows included), the directory answers its
// index.html, and the static surface stays read-only (GET and HEAD, every
// other method 405).
import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, it } from "vitest";
import { databaseFileRefused, DATABASE_FILE_EXTENSIONS, resolveInternalPath } from "../internalroot.ts";

/** the throwaway static root of this battery (its own pid-named tree). */
const root = join(tmpdir(), `vault-internalroot-${process.pid}.test`);

/** the real server of the vault (the api import boots after the env below). */
const { createVaultServer, listenVault } = await import("../api.ts");

/** one fetch answer against the booted server. */
let base = "";

beforeAll(async () => {
  process.env.VAULT_INTERNAL_ROOT = root;
  mkdirSync(join(root, "docs"), { recursive: true });
  writeFileSync(join(root, "index.html"), "<!doctype html><title>the vault site</title>");
  writeFileSync(join(root, "docs", "page.ts"), "export const law = true;\n");
  writeFileSync(join(root, "docs", "app.tsx"), "export const face = true;\n");
  writeFileSync(join(root, "docs", "data.json"), "{\"law\":true}\n");
  writeFileSync(join(root, "docs", "asset.woff2"), new Uint8Array([0, 1, 2]));
  writeFileSync(join(root, "docs", "blob.zzzznope"), "unknown bytes");
  writeFileSync(join(root, "vault.db"), "the raw database bytes");
  writeFileSync(join(root, "secrets.db-wal"), "the raw wal bytes");
  writeFileSync(join(root, "site.sqlite3"), "the raw sqlite3 bytes");
  const server = createVaultServer();
  const port = await listenVault(server, { port: 0 });
  base = `http://127.0.0.1:${port}`;
  afterAll(() => {
    server.close();
    rmSync(root, { recursive: true, force: true });
  });
});

describe("the faun law (the database-file refusal)", () => {
  it("refuses every database spelling before any filesystem touch", () => {
    for (const extension of [".db", ".sqlite", ".sqlite3", ".db-wal", ".db-shm"]) {
      assert.ok(DATABASE_FILE_EXTENSIONS.includes(extension), `the law list carries ${extension}`);
      assert.equal(databaseFileRefused(`/vault${extension}`), true, `${extension} is refused`);
    }
    for (const extension of [".db-journal", ".sqlite-wal", ".sqlite-shm", ".sqlite3-wal", ".sqlite3-shm"]) {
      assert.equal(databaseFileRefused(`/vault${extension}`), true, `${extension} is refused (the sibling spellings)`);
    }
  });

  it("refuses the database spellings case-insensitively and on every segment", () => {
    assert.equal(databaseFileRefused("/VAULT.DB"), true);
    assert.equal(databaseFileRefused("/docs/Data.Sqlite"), true);
    assert.equal(databaseFileRefused("/backup.db.bak"), false, "a backup spelling is not a database file");
    assert.equal(databaseFileRefused("/index.html"), false);
    assert.equal(databaseFileRefused("/docs/page.ts"), false);
  });

  it("answers the 403 refusal on the live static root — never the bytes", async () => {
    for (const file of ["/vault.db", "/secrets.db-wal", "/site.sqlite3"]) {
      const answer = await fetch(`${base}${file}`);
      assert.equal(answer.status, 403, `${file} answers the refusal`);
      const body = (await answer.json()) as { error: { code: string } };
      assert.equal(body.error.code, "VAULT_DBFILE");
    }
  });
});

describe("the safe resolution", () => {
  it("refuses the traversal escapes and the null bytes with the honest 404", () => {
    for (const path of ["../outside.txt", "/docs/../../etc/passwd", "/a\0b"]) {
      const answer = resolveInternalPath(root, path);
      assert.ok("refusal" in answer, `${path} refuses`);
      assert.equal(answer.refusal.status, 404);
      assert.equal(answer.refusal.code, "VAULT_ABSENT", `${path} answers the absent 404, never a hint`);
    }
  });

  it("resolves the directory to its index.html and answers the file with the registry mime", () => {
    const index = resolveInternalPath(root, "/");
    assert.ok(!("refusal" in index), "the root resolves");
    if (!("refusal" in index)) {
      assert.ok(index.file.endsWith("index.html"));
      assert.equal(index.mime, "text/html");
    }
    const page = resolveInternalPath(root, "/docs/page.ts");
    assert.ok(!("refusal" in page));
    if (!("refusal" in page)) {
      assert.equal(page.mime, "video/mp2t");
    }
  });
});

describe("the static lane over the real server", () => {
  it("serves every file type with the correct content type", async () => {
    const cases: [string, string][] = [
      ["/index.html", "text/html"],
      ["/docs/page.ts", "video/mp2t"],
      ["/docs/app.tsx", "application/typescript"],
      ["/docs/data.json", "application/json"],
      ["/docs/asset.woff2", "font/woff2"],
      ["/docs/blob.zzzznope", "application/octet-stream"],
    ];
    for (const [path, mime] of cases) {
      const answer = await fetch(`${base}${path}`);
      assert.equal(answer.status, 200, `${path} serves`);
      assert.equal(answer.headers.get("content-type"), mime, `${path} answers ${mime}`);
      assert.equal(answer.headers.get("x-content-type-options"), "nosniff");
    }
  });

  it("answers the directory with its index.html and the HEAD with the headers alone", async () => {
    const directory = await fetch(`${base}/`);
    assert.equal(directory.status, 200);
    assert.equal(directory.headers.get("content-type"), "text/html");
    const head = await fetch(`${base}/index.html`, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(head.headers.get("content-type"), "text/html");
    assert.ok(Number(head.headers.get("content-length") ?? "0") > 0);
    assert.equal(await head.text(), "", "the HEAD answers headers alone");
  });

  it("answers the honest 404 for the absent file and the 405 for the write methods", async () => {
    const absent = await fetch(`${base}/no-such-page.html`);
    assert.equal(absent.status, 404);
    assert.equal(((await absent.json()) as { error: { code: string } }).error.code, "VAULT_ABSENT");
    const put = await fetch(`${base}/index.html`, { method: "PUT" });
    assert.equal(put.status, 405);
    const post = await fetch(`${base}/index.html`, { method: "POST" });
    assert.equal(post.status, 405);
  });
});
