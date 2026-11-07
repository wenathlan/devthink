// # drivers.test — the driver-paths law of the vault, runnable with the
// house vitest suite:
//   bunx vitest run test/drivers.test.ts
// The storage law the dossier answers: the engine rides better-sqlite3 in
// development and the alternate paths stay documented — drizzle executes,
// prisma declares, and the mysql2 rung waits behind the env seam with a
// loud refusal instead of a silent fallback. This battery pins both faces:
// the dossier documents every path (the reader never guesses the driver
// story) and the seam itself answers the honest verdict (sqlite by
// default, the typed StorageDriverError when MYSQL_URL asks for the rung
// that is not wired yet).

import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "vitest";
import { openStorage, StorageDriverError, storageDriverKind } from "../drizzle.ts";

/* the engine chain opens its sqlite singleton at import (drizzle.ts), so
 * the battery below routes the storage into the throwaway store of the os
 * tmpdir BEFORE drizzle evaluates (the deploysafety precedent) — the
 * battery that walks the driver seam never drops a store beside the
 * sources. */
const throwaway = join(tmpdir(), `vault-drivers-${process.pid}.test.db`);
process.env.VAULT_STORAGE_URL = `file:${throwaway}`;
for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`${throwaway}${suffix}`, { force: true });
}

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const DOSSIER = read("../docs/vault.md");
const PRISMA = read("../schema.prisma");

describe("the driver paths the dossier documents", () => {
  it("names better-sqlite3 the development ride with the pragma ladder", () => {
    assert.match(DOSSIER, /rides better-sqlite3 in development/, "the dev driver is named");
    assert.match(DOSSIER, /prepared-only statements/, "the prepared-only law rides the dossier");
    assert.match(DOSSIER, /busy_timeout armed before WAL/, "the pragma ladder order is documented");
  });

  it("documents drizzle executing and prisma declaring", () => {
    assert.match(
      DOSSIER,
      /Drizzle executes: the tables live as drizzle declarations in drizzle\.ts/,
      "the executor is named",
    );
    assert.match(
      DOSSIER,
      /no \.sql files exist in the repo and migrations stay CI-only/,
      "the migration law rides the dossier",
    );
    assert.match(DOSSIER, /schema\.prisma is the documentation of record/, "the declaration of record is named");
    assert.match(PRISMA, /prisma only declares/, "the schema carries the declaration law itself");
  });

  it("documents the mysql2 rung behind the env seam with the loud refusal", () => {
    assert.match(DOSSIER, /MYSQL_URL selects the driver kind through the seam/, "the rung selector is named");
    assert.match(DOSSIER, /StorageDriverError/, "the typed refusal is named");
    assert.match(DOSSIER, /clearing the variable rides sqlite again/, "the escape hatch is documented");
  });

  it("documents the blobs and the bigint pointer law", () => {
    assert.match(
      DOSSIER,
      /64-bit bigint cells on the rows and answer as decimal strings on the wire/,
      "the pointer law is documented",
    );
    assert.match(DOSSIER, /blob bytes never ride a row raw/, "the blob law is documented");
    assert.match(DOSSIER, /stored bytes answer as base64/, "the wire shape is documented");
    assert.match(PRISMA, /BigInt/, "the schema declares the bigint pointers");
    assert.match(PRISMA, /Bytes/, "the schema declares the blob column");
  });

  it("carries the driver surface table", () => {
    assert.match(DOSSIER, /\| VAULT_STORAGE_URL \|/, "the engine store url rides the table");
    assert.match(DOSSIER, /\| VAULT_DATABASES_DIR \|/, "the per-database directory rides the table");
    assert.match(DOSSIER, /\| MYSQL_URL \|/, "the mysql2 selector rides the table");
    assert.match(DOSSIER, /\| DATABASE_URL \|/, "the prisma datasource rides the table");
  });
});

describe("the mysql2 seam answers the honest verdict", () => {
  it("rides sqlite when no url answers", () => {
    delete process.env.MYSQL_URL;
    assert.equal(storageDriverKind(), "sqlite", "the default rides sqlite");
  });

  it("answers mysql and refuses loudly while the rung is not wired", () => {
    process.env.MYSQL_URL = "mysql://the-operator:the-secret@the-host:3306/the-vault";
    try {
      assert.equal(storageDriverKind(), "mysql", "the seam answers mysql");
      assert.throws(
        () => openStorage("file:./vault-drivers-rung.db"),
        StorageDriverError,
        "the unwired rung refuses with the typed error",
      );
      assert.throws(
        () => openStorage("file:./vault-drivers-rung.db"),
        /mysql2 driver rung is not wired yet/,
        "the refusal names the rung and the escape hatch",
      );
    } finally {
      delete process.env.MYSQL_URL;
    }
  });
});
