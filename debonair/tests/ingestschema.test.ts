// # ingestschema.test — the reference law of the ingest rows (the wave
// PV1.001 ordered): every document carries the owner pointer, the kind,
// the visibility, the blob addresses, the size and the content hash; the
// pointers round trip exact beyond the js number floor; the migration
// upgrades an old-shape database in place without losing a row; the
// writes stamp the law's defaults and the typed errors answer the machine
// codes. runnable with vitest: pnpm vitest run tests/ingestschema.test.ts
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { describe, it } from "vitest";
import { mintid } from "../bigintids.ts";
import type { IngestDocument } from "../ingest.ts";
import { ingestPcm } from "../ingest.ts";
import type { IngestRow } from "../ingestdb.ts";
// the seat answers before the module load: this suite rides its own
// database file so the parallel vitest workers never share one wal
// writer (the SQLITE_BUSY lesson — every suite its own seat).
process.env.DATABASE_URL = "file:./local.ingestschema.db";

const ingestdbmodule = await import("../ingestdb.ts");
const { getingestrow, IngestDbError, listingestrows, migrateingestschema, puttingest } = ingestdbmodule;

/** A deterministic synthetic take: a 110 hz sawtooth bass (harmonic) over
 * an 8 hz amplitude-gated click train (percussive), 3 seconds at 8 khz —
 * the same shape tests/ingest.test.ts rides, small enough to ingest fast,
 * structured enough to fill every column of the document. */
function synthetictake(): { mono: Float32Array; sampleRate: number } {
  const sampleRate = 8000;
  const length = sampleRate * 3;
  const mono = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const bass = 0.4 * Math.sign(Math.sin(2 * Math.PI * 110 * t));
    const gate = t % 0.5 < 0.02 ? 0.8 : 0;
    mono[i] = Math.max(-1, Math.min(1, bass * 0.7 + gate));
  }
  return { mono, sampleRate };
}

/** One parametrized document the writes ride (a fixed ingest instant so
 * the rows stay deterministic across runs). */
function takedoc(name: string): IngestDocument {
  const { mono, sampleRate } = synthetictake();
  return ingestPcm(mono, sampleRate, { name, at: "2026-01-01T00:00:00.000Z" });
}

/** A 64-hex sha fixture (the blob store wave computes the real one). */
const SHA_FIXTURE = "3a7f1c9e2b84d05f6a1e93c47d82b5a6f0c1d2e34f5a6b7c8d9e0f1a2b3c4d5e";

describe("the reference law round trip", () => {
  it("stamps and reads back every column the law names", () => {
    const owner = "9007199254740993"; // 2^53 + 1 — beyond the js number floor
    const mix = "9223372036854775806"; // 2^63 - 2 — the top of the 64-bit rail
    const stems = "12345678901234567";
    const doc = takedoc("law take");
    puttingest("ingestschema-law", doc, {
      ownerId: owner,
      kind: "reference",
      visibility: "vitrine",
      mixPointer: mix,
      stemsPointer: stems,
      sizeBytes: 44100,
      sha256: SHA_FIXTURE,
    });
    const row = getingestrow("ingestschema-law");
    assert.ok(row, "the row must read back");
    assert.equal(row.id, "ingestschema-law");
    assert.equal(row.name, "law take");
    assert.equal(row.samplerate, 8000);
    assert.equal(row.ingestedat, "2026-01-01T00:00:00.000Z");
    assert.equal(row.owner_id, owner);
    assert.equal(row.kind, "reference");
    assert.equal(row.visibility, "vitrine");
    assert.equal(row.mix_pointer, mix);
    assert.equal(row.stems_pointer, stems);
    assert.equal(row.size_bytes, 44100);
    assert.equal(row.sha256, SHA_FIXTURE);
    assert.deepEqual(JSON.parse(row.docjson), doc);
  });

  it("reads the pointers exact beyond the js number floor (the cast law)", () => {
    // a number-coerced read would round 2^53 + 1 down to 2^53 and drop the
    // tail of a minted id — the row must answer the exact decimal string
    const row = getingestrow("ingestschema-law");
    assert.ok(row);
    assert.ok(BigInt(row.owner_id) > 2n ** 53n, "the probe id rides beyond the floor");
    assert.equal(row.owner_id, "9007199254740993");
    assert.notEqual(row.owner_id, "9007199254740992");
    assert.equal(BigInt(row.mix_pointer), 9223372036854775806n);
    assert.ok(BigInt(row.mix_pointer) > 2n ** 53n, "the mix pointer rides beyond the floor");
  });

  it("keeps an explicit vitrine visibility beside the private default", () => {
    puttingest("ingestschema-vitrine", takedoc("vitrine take"), {
      ownerId: "12345678901234568",
      kind: "render",
      visibility: "vitrine",
    });
    const row = getingestrow("ingestschema-vitrine");
    assert.ok(row);
    assert.equal(row.visibility, "vitrine");
    assert.equal(row.kind, "render");
  });
});

describe("the default law", () => {
  it("defaults the visibility to private and the absent fields to their zero shapes", () => {
    puttingest("ingestschema-default", takedoc("default take"), {
      ownerId: "12345678901234567",
      kind: "upload",
    });
    const row = getingestrow("ingestschema-default");
    assert.ok(row);
    assert.equal(row.visibility, "private");
    assert.equal(row.mix_pointer, null);
    assert.equal(row.stems_pointer, null);
    assert.equal(row.size_bytes, 0);
    assert.equal(row.sha256, "");
  });
});

describe("the migration path", () => {
  /** Boots one old-shape database (the exact PV0 table) carrying one row
   * of real pre-law data. */
  function oldshapedb() {
    const old = new Database(":memory:");
    old.exec(`
      CREATE TABLE ingest_documents (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        durationseconds REAL NOT NULL DEFAULT 0,
        samplerate      INTEGER NOT NULL DEFAULT 0,
        pcmhash         INTEGER NOT NULL DEFAULT 0,
        ingestedat      TEXT NOT NULL,
        docjson         TEXT NOT NULL
      );
    `);
    old
      .prepare(
        "INSERT INTO ingest_documents (id, name, durationseconds, samplerate, pcmhash, ingestedat, docjson) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        "old-1",
        "pre-law take",
        3,
        8000,
        424242,
        "2025-12-31T23:59:59.999Z",
        JSON.stringify(takedoc("pre-law take")),
      );
    return old;
  }

  /** Reads one full row off any handle with the store's column law (the
   * same literal column list, the same text casts — zero interpolation
   * into sql, the house law holds in the tests alike). */
  function rowof(handle: ReturnType<typeof oldshapedb>, id: string): IngestRow {
    const row = handle
      .prepare(
        `SELECT id, name, durationseconds, samplerate, pcmhash, ingestedat, docjson,
                CAST(owner_id AS TEXT) AS owner_id, kind, visibility,
                CAST(mix_pointer AS TEXT) AS mix_pointer, CAST(stems_pointer AS TEXT) AS stems_pointer,
                size_bytes, sha256
         FROM ingest_documents WHERE id = ?`,
      )
      .get(id) as IngestRow | undefined;
    assert.ok(row, `the row ${id} must read back`);
    return row;
  }

  it("upgrades an old-shape database without losing rows", () => {
    const old = oldshapedb();
    migrateingestschema(old);
    const counted = old.prepare("SELECT COUNT(*) AS total FROM ingest_documents").get() as { total: number };
    assert.equal(counted.total, 1, "no row is lost to the migration");
    const row = rowof(old, "old-1");
    // the pre-law data survives untouched
    assert.equal(row.name, "pre-law take");
    assert.equal(row.durationseconds, 3);
    assert.equal(row.samplerate, 8000);
    assert.equal(row.pcmhash, 424242);
    assert.equal(row.ingestedat, "2025-12-31T23:59:59.999Z");
    assert.ok(typeof row.docjson === "string" && row.docjson.length > 0, "the document json survives");
    // the law's fills on the pre-law row
    assert.equal(row.owner_id, "0");
    assert.equal(row.kind, "upload");
    assert.equal(row.visibility, "private");
    assert.equal(row.mix_pointer, null);
    assert.equal(row.stems_pointer, null);
    assert.equal(row.size_bytes, 0);
    assert.equal(row.sha256, "");
  });

  it("is idempotent — a second migration changes nothing", () => {
    const old = oldshapedb();
    migrateingestschema(old);
    migrateingestschema(old);
    const counted = old.prepare("SELECT COUNT(*) AS total FROM ingest_documents").get() as { total: number };
    assert.equal(counted.total, 1);
    const row = rowof(old, "old-1");
    assert.equal(row.name, "pre-law take");
    assert.equal(row.owner_id, "0");
    assert.equal(row.visibility, "private");
  });

  it("lands the full shape on a fresh handle (the create path)", () => {
    const fresh = new Database(":memory:");
    migrateingestschema(fresh);
    const columns = (fresh.pragma("table_info(ingest_documents)") as { name: string }[]).map((column) => column.name);
    for (const law of ["owner_id", "kind", "visibility", "mix_pointer", "stems_pointer", "size_bytes", "sha256"]) {
      assert.ok(columns.includes(law), `the fresh table carries ${law}`);
    }
    assert.equal(columns.length, 14, "the seven old columns plus the seven law columns");
  });
});

describe("the typed errors", () => {
  const doc = takedoc("error take");
  const goodowner = "12345678901234569";

  it("refuses a bad owner pointer (bad-owner)", () => {
    for (const bad of ["", "0", "-7", "abc", "12.5", "1e18", "18446744073709551616"]) {
      assert.throws(
        () => puttingest("ingestschema-err", doc, { ownerId: bad, kind: "upload" }),
        (error: unknown): boolean => error instanceof IngestDbError && error.code === "bad-owner",
        `owner "${bad}" must fail the mint law`,
      );
    }
  });

  it("refuses a bad kind (bad-kind)", () => {
    for (const bad of ["other", "references", "Upload", ""]) {
      assert.throws(
        () => puttingest("ingestschema-err", doc, { ownerId: goodowner, kind: bad as IngestRow["kind"] }),
        (error: unknown): boolean => error instanceof IngestDbError && error.code === "bad-kind",
        `kind "${bad}" must fail the enum law`,
      );
    }
  });

  it("refuses a bad visibility (bad-visibility)", () => {
    for (const bad of ["public", "PRIVATE", "", "vitrines"]) {
      assert.throws(
        () =>
          puttingest("ingestschema-err", doc, {
            ownerId: goodowner,
            kind: "upload",
            visibility: bad as IngestRow["visibility"],
          }),
        (error: unknown): boolean => error instanceof IngestDbError && error.code === "bad-visibility",
        `visibility "${bad}" must fail the lane law`,
      );
    }
  });

  it("refuses a bad blob pointer (bad-pointer)", () => {
    assert.throws(
      () => puttingest("ingestschema-err", doc, { ownerId: goodowner, kind: "upload", mixPointer: "nope" }),
      (error: unknown): boolean => error instanceof IngestDbError && error.code === "bad-pointer",
    );
    assert.throws(
      () => puttingest("ingestschema-err", doc, { ownerId: goodowner, kind: "upload", mixPointer: "0" }),
      (error: unknown): boolean => error instanceof IngestDbError && error.code === "bad-pointer",
    );
    assert.throws(
      () =>
        puttingest("ingestschema-err", doc, {
          ownerId: goodowner,
          kind: "upload",
          stemsPointer: "18446744073709551616",
        }),
      (error: unknown): boolean => error instanceof IngestDbError && error.code === "bad-pointer",
    );
  });
});

describe("the owner chain", () => {
  it("keeps two documents from different owners distinct and time-ordered", () => {
    const tick = 1_700_000_000_000;
    const ownerA = mintid(tick);
    const ownerB = mintid(tick + 1);
    assert.notEqual(ownerA, ownerB);
    assert.ok(BigInt(ownerA) < BigInt(ownerB), "the ids sort by creation");
    puttingest("ingestschema-chain-a", takedoc("chain a"), { ownerId: ownerA, kind: "reference" });
    puttingest("ingestschema-chain-b", takedoc("chain b"), {
      ownerId: ownerB,
      kind: "upload",
      visibility: "vitrine",
    });
    const rows = listingestrows().filter(
      (row) => row.id === "ingestschema-chain-a" || row.id === "ingestschema-chain-b",
    );
    assert.equal(rows.length, 2, "both documents list through the row seam");
    const rowA = rows.find((row) => row.id === "ingestschema-chain-a");
    const rowB = rows.find((row) => row.id === "ingestschema-chain-b");
    assert.ok(rowA && rowB, "both chain rows read back");
    assert.equal(rowA.owner_id, ownerA);
    assert.equal(rowB.owner_id, ownerB);
    assert.notEqual(rowA.owner_id, rowB.owner_id, "the owners never bleed across rows");
    assert.equal(rowA.kind, "reference");
    assert.equal(rowB.kind, "upload");
    assert.equal(rowB.visibility, "vitrine");
    assert.ok(BigInt(rowA.owner_id) < BigInt(rowB.owner_id), "the chain stays time-ordered end to end");
  });
});
