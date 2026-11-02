// # dblock.test — the faun lesson lane of the vault download surface,
// runnable with the house vitest suite:
//   bunx vitest run tests/dblock.test.ts
// The .db file never rides the download lane: the deposit refuses it (the
// typed VAULT_DB_LOCKED refusal), the read re-verifies the policy (defense
// in depth — a legacy row seeded past the put refuses at the get), the
// declarative VAULT_DB_LOCKLIST widens the deny-list, and the normal
// deposit keeps landing (the lock never freezes the lane). The suite boots
// the real http server the uistore precedent rides and the real ledger
// behind it — every answer is the engine's, never a seam's.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { afterAll, describe, it } from "vitest";

/* the isolation of the suite (the quotaisolation precedent): the engine
 * chain opens its sqlite singleton at import, so the storage routes into
 * the throwaway store BEFORE the engine imports — and the operator token
 * the storage lane reads at api import time lands the same way. */
const dbhome = join(mkdtempSync(join(tmpdir(), "vault-dblock-")), "dblock.db");
process.env.VAULT_STORAGE_URL = `file:${dbhome}`;
process.env.VAULT_TOKEN = "dblock-operator-token";
for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`${dbhome}${suffix}`, { force: true });
}

const { createVaultServer, listenVault, routes } = await import("../api.ts");
const {
  createProject,
  dbDownloadLocked,
  DB_LOCKED_MESSAGE,
  getObject,
  putObject,
} = await import("../objectsledger.ts");
const { storage, storageObjects } = await import("../drizzle.ts");
const { sha256Hex } = await import("../sha.ts");

const encoder = new TextEncoder();
const server = createVaultServer();
const port = await listenVault(server, { port: 0 });
const base = `http://127.0.0.1:${port}`;

/** one operator deposit against the real surface. */
async function deposit(objectPath: string, mime: string, bytes: Uint8Array): Promise<Response> {
  return fetch(`${base}${routes.objects}`, {
    method: "POST",
    headers: {
      "x-vault-token": "dblock-operator-token",
      "x-project-id": "dblock-scope",
      "x-object-path": objectPath,
      "x-object-mime": mime,
    },
    body: bytes,
  });
}

/** the standardized error body the surface answers. */
async function errorOf(answer: Response): Promise<{ code: string; message: string }> {
  const body = (await answer.json()) as { error: { code: string; message: string } };
  return body.error;
}

afterAll(() => {
  server.close();
});

describe("the faun lesson deny-list (the deposit door)", () => {
  it("refuses the .db deposit with the typed VAULT_DB_LOCKED refusal", async () => {
    const made = createProject("dblock-scope");
    assert.equal(made.project?.id, "dblock-scope");
    const answer = await deposit("/seeds/fa1.db", "application/x-sqlite3", encoder.encode("SQLite format 3\0"));
    assert.equal(answer.status, 403);
    const error = await errorOf(answer);
    assert.equal(error.code, "VAULT_DB_LOCKED");
    assert.equal(error.message, "the faun lesson: database files never ride the download lane");
  });

  it("refuses .sqlite3, .db-wal and the locked mime on a clean extension", async () => {
    const sqlite3 = await deposit("/seeds/legacy.sqlite3", "application/octet-stream", encoder.encode("sqlite"));
    assert.equal(sqlite3.status, 403);
    assert.equal((await errorOf(sqlite3)).code, "VAULT_DB_LOCKED");
    const wal = await deposit("/seeds/fa1.db-wal", "application/octet-stream", encoder.encode("wal"));
    assert.equal(wal.status, 403);
    const mimeAlone = await deposit("/seeds/clean.bin", "application/x-sqlite", encoder.encode("sqlite"));
    assert.equal(mimeAlone.status, 403);
    const vnd = await deposit("/seeds/also-clean.bin", "application/vnd.sqlite3", encoder.encode("sqlite"));
    assert.equal(vnd.status, 403);
  });

  it("the ledger itself refuses the .db ride before one byte of the pipeline moves", () => {
    const answer = putObject({
      projectId: "dblock-scope",
      path: "/seeds/fa1.db",
      mime: "application/x-sqlite3",
      bytes: encoder.encode("SQLite format 3\0"),
    });
    assert.ok("refusal" in answer, "the .db deposit refuses at the ledger");
    if ("refusal" in answer) {
      assert.equal(answer.refusal.kind, "dblocked");
      assert.equal(answer.refusal.why, DB_LOCKED_MESSAGE);
    }
  });

  it("the case-insensitive verdict answers both doors of the name", () => {
    assert.equal(dbDownloadLocked("/seeds/FA1.DB", "application/octet-stream"), true);
    assert.equal(dbDownloadLocked("/seeds/Data.SQLite3", "application/octet-stream"), true);
    assert.equal(dbDownloadLocked("/docs/readme.md", "text/markdown"), false);
    assert.equal(dbDownloadLocked("/sites/state.db", "application/x-sqlite3"), true);
  });

  it("keeps the honest deposits landing — the lock never freezes the lane", async () => {
    const answer = await deposit("/docs/readme.md", "text/markdown", encoder.encode("the lock never freezes the lane"));
    assert.equal(answer.status, 201);
    const body = (await answer.json()) as { object: { id: string; path: string } };
    assert.equal(body.object.path, "/docs/readme.md");
    const read = await fetch(`${base}${routes.objects}/${body.object.id}`, {
      headers: { "x-vault-token": "dblock-operator-token" },
    });
    assert.equal(read.status, 200);
    assert.equal(await read.text(), "the lock never freezes the lane");
  });
});

describe("the faun lesson deny-list (the read door, defense in depth)", () => {
  it("refuses the legacy .db row that slipped past the put — at the module and over the wire", async () => {
    /* the legacy seed: a fa1.db row written straight into the ledger the
     * way the old static lane once did, bypassing the put gate — the read
     * door must refuse it on its own. */
    const bytes = encoder.encode("the legacy fa1 bytes");
    storage
      .insert(storageObjects)
      .values({
        id: "obj-legacy-fa1",
        projectId: "dblock-scope",
        path: "/seeds/fa1-legacy.db",
        mime: "application/octet-stream",
        size: BigInt(bytes.length),
        digest: sha256Hex(bytes),
        manifest: {
          version: 1,
          digest: sha256Hex(bytes),
          size: String(bytes.length),
          channel: "blob",
          tier: "warm",
          entries: [],
        },
        channel: "blob",
      })
      .run();
    const answer = getObject("obj-legacy-fa1");
    assert.ok(!("bytes" in answer), "the legacy .db never answers bytes");
    if ("refusal" in answer) {
      assert.equal(answer.refusal.kind, "dblocked");
      assert.equal(answer.refusal.why, DB_LOCKED_MESSAGE);
    }
    const wire = await fetch(`${base}${routes.objects}/obj-legacy-fa1`, {
      headers: { "x-vault-token": "dblock-operator-token" },
    });
    assert.equal(wire.status, 403);
    const error = await errorOf(wire);
    assert.equal(error.code, "VAULT_DB_LOCKED");
    assert.equal(error.message, "the faun lesson: database files never ride the download lane");
  });
});

describe("the declarative VAULT_DB_LOCKLIST widenings", () => {
  it("adds the operator's extensions beside the pinned four, without a reboot", async () => {
    process.env.VAULT_DB_LOCKLIST = "accdb, .MDB ";
    try {
      assert.equal(dbDownloadLocked("/seeds/legacy.accdb", "application/octet-stream"), true);
      assert.equal(dbDownloadLocked("/seeds/legacy.mdb", "application/octet-stream"), true);
      const answer = await deposit("/seeds/legacy.accdb", "application/octet-stream", encoder.encode("access"));
      assert.equal(answer.status, 403);
      assert.equal((await errorOf(answer)).code, "VAULT_DB_LOCKED");
      assert.equal(dbDownloadLocked("/docs/keep.md", "text/markdown"), false, "the widening never locks the rest");
    } finally {
      delete process.env.VAULT_DB_LOCKLIST;
    }
    assert.equal(
      dbDownloadLocked("/seeds/legacy.accdb", "application/octet-stream"),
      false,
      "the default list answers again",
    );
  });
});
