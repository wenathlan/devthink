// # objects.test — the object ledger engine of the vault, runnable with the
// house vitest suite:
//   bunx vitest run test/objects.test.ts
// The engine rides the REAL storage contract (storage.ts): the channel
// comes from storageModeFor, the digest validates through digestValid, the
// record passes storageRecordValid — and the rehearsal is deterministic
// from the seed (the same seed always seals the same vault).
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { describe, it } from "vitest";
import "./quotaisolation.ts";
import {
  bucketValid,
  channelPreview,
  DEFAULT_BUCKET,
  digestFor,
  digestShort,
  fnv1a,
  fnv1aHex,
  formatBytes,
  pointerTextOf,
  sealObject,
  seedVault,
  VAULT_BUCKETS,
  type VaultObject,
  vaultCensus,
  verifyObject,
} from "../objects.ts";
import { digestValid, storageModeFor, storageRecordValid } from "../storage.ts";

describe("seal engine", () => {
  it("splits the channels at the real 1,000,000-byte threshold", () => {
    assert.equal(storageModeFor(1_000_000, "text/plain"), "blob");
    assert.equal(storageModeFor(1_000_001, "text/plain"), "lfs");
    assert.equal(storageModeFor(4, "image/png"), "lfs");
    assert.equal(storageModeFor(4, "video/mp4"), "lfs");
    assert.equal(storageModeFor(4, "model/onnx"), "lfs");
    assert.equal(storageModeFor(4, "application/octet-stream"), "lfs");
    assert.equal(storageModeFor(2_000_000, "text/markdown"), "lfs");
  });

  it("derives digests in the exact shape the contract demands", () => {
    const lfs = digestFor("identity · lfs", true);
    const blob = digestFor("identity · blob", false);
    assert.equal(lfs.length, 64, "lfs rides the sha-256 width");
    assert.equal(blob.length, 40, "blob rides the sha-1 width");
    assert.match(lfs, /^[0-9a-f]{64}$/);
    assert.match(blob, /^[0-9a-f]{40}$/);
    assert.ok(digestValid(lfs, true));
    assert.ok(digestValid(blob, false));
    assert.equal(digestFor("identity · lfs", true), lfs, "the digest is deterministic");
  });

  it("seals a deposit through the real record gate", () => {
    const sealed = sealObject("family-state", "/sites/state.db", "application/x-sqlite3", 48_211_046, 0);
    assert.equal(sealed.refusal, undefined);
    const record = {
      id: sealed.object.id,
      path: sealed.object.path,
      mime: sealed.object.mime,
      size: sealed.object.size,
      lfs: sealed.object.lfs,
      digest: sealed.object.digest,
    };
    assert.ok(storageRecordValid(record), "the sealed record must pass the five checks");
    assert.equal(sealed.object.lfs, true, "a 48 MB row rides lfs");
  });

  it("refuses a deposit the contract rejects — and says why", () => {
    const sealed = sealObject("family-state", "relative/path", "text/plain", 12, 0);
    assert.ok(sealed.refusal, "a relative path is refused");
    assert.match(sealed.refusal!, /refuses the deposit/);
  });

  it("never issues a banned or guessed digest", () => {
    const sealed = sealObject("site-assets", "/media/cover.png", "image/png", 2_244_880, 3);
    assert.ok(digestValid(sealed.object.digest, sealed.object.lfs));
    assert.equal(verifyObject(sealed.object), true, "re-sealing is byte-equal");
  });

  it("verifies a tampered object as broken", () => {
    const sealed = sealObject("run-evidence", "/runs/421337.log", "text/plain", 12_800, 9);
    const tampered: VaultObject = { ...sealed.object, size: sealed.object.size + 1 };
    assert.equal(verifyObject(tampered), false, "a moved byte breaks the seal");
  });

  it("renders the three-line lfs pointer from the real writer", () => {
    const sealed = sealObject("backups", "/backups/ledger.tzst", "application/x-tzst", 220_118_016, 0);
    const pointer = pointerTextOf(sealed.object);
    const lines = pointer.split("\n");
    assert.equal(lines[0], "version https://git-lfs.github.com/spec/v1");
    assert.equal(lines[1], `oid sha256:${sealed.object.digest}`);
    assert.equal(lines[2], `size ${sealed.object.size}`);
  });
});

describe("rehearsal vault", () => {
  const vault = seedVault(20260314);

  it("musters the same rows for the same seed, byte for byte", () => {
    const again = seedVault(20260314);
    assert.deepEqual(again, vault);
    const other = seedVault(20260315);
    assert.notDeepEqual(other, vault);
  });

  it("rides only the named buckets and every row is sealed and verified", () => {
    for (const object of vault) {
      assert.ok(
        VAULT_BUCKETS.includes(object.bucket as (typeof VAULT_BUCKETS)[number]),
        `${object.path} rides a named bucket`,
      );
      assert.equal(verifyObject(object), true, `${object.path} is sealed intact`);
      assert.ok(object.size >= 0);
      assert.ok(object.path.startsWith("/"));
    }
  });

  it("carries both channels across the rehearsal", () => {
    const census = vaultCensus(vault);
    assert.ok(census.lfsRows > 0, "the lfs channel is exercised");
    assert.ok(census.blobRows > 0, "the blob channel is exercised");
    assert.equal(census.lfsRows + census.blobRows, census.total);
    assert.equal(census.lfsBytes + census.blobBytes, census.bytes);
  });

  it("answers the census with the biggest row on top", () => {
    const census = vaultCensus(vault);
    assert.equal(census.total, vault.length);
    assert.ok(census.biggest, "the biggest row exists");
    for (const object of vault) {
      assert.ok(census.biggest?.size >= object.size);
    }
    assert.equal(vaultCensus([]).total, 0);
    assert.equal(vaultCensus([]).biggest, undefined);
  });
});

describe("ledger render", () => {
  it("formats bytes with one unit and tabular intent", () => {
    assert.equal(formatBytes(0), "0 B");
    assert.equal(formatBytes(512), "512 B");
    assert.equal(formatBytes(1024), "1.0 KB");
    assert.equal(formatBytes(1_572_864), "1.5 MB");
    assert.equal(formatBytes(1_073_741_824), "1.0 GB");
    assert.equal(formatBytes(2_244_880), "2.1 MB");
  });

  it("shortens a digest without inventing characters", () => {
    const long = "a".repeat(64);
    assert.equal(digestShort(long), "aaaaaaaa…aaaa");
    assert.equal(digestShort("abcd1234"), "abcd1234");
  });

  it("keeps the family fnv-1a byte-exact", () => {
    assert.equal(fnv1a(""), 0x811c9dc5);
    assert.equal(fnv1a("a"), 0xe40c292c);
    assert.equal(fnv1aHex("hello"), fnv1a("hello").toString(16).padStart(8, "0"));
    assert.match(fnv1aHex("hello"), /^[0-9a-f]{8}$/);
  });

  it("previews the channel answer before anything is sealed", () => {
    const lfs = channelPreview("video/mp4", 12);
    assert.equal(lfs.channel, "lfs");
    assert.match(lfs.why, /binary master or over the threshold|binary master/);
    assert.match(lfs.digestShape, /sha-256/);
    const blob = channelPreview("text/markdown", 1200);
    assert.equal(blob.channel, "blob");
    assert.match(blob.digestShape, /sha-1/);
  });
});

describe("the real ledger bucket dimension (the retention group rides the row)", () => {
  /** the throwaway project of this battery (the quotaisolation store answers). */
  const project = `bucket-probe-${process.pid}`;

  it("validates the bucket shape the way the project shape rides", () => {
    assert.equal(DEFAULT_BUCKET, "family-state");
    for (const name of ["family-state", "site-assets", "run-evidence", "backups", "a", "bucket-2"] as const) {
      assert.equal(bucketValid(name), true, `${name} rides`);
    }
    for (const name of ["", "Not-A-Bucket", "bucket with spaces", "-nope", "UPPER", "x".repeat(65)]) {
      assert.equal(bucketValid(name), false, `${name} refuses`);
    }
  });

  it("seals every deposit onto its bucket and defaults to the family-state seat", async () => {
    const { createProject, getObject, listObjects, putObject } = await import("../objects.ts");
    const scope = createProject(project);
    assert.ok(scope.project !== undefined, "the project lands");

    const backup = putObject({
      projectId: project,
      path: "/backups/probe.tzst",
      mime: "application/x-tzst",
      bytes: new TextEncoder().encode("the backup bytes"),
      bucket: "backups",
    });
    assert.ok(!("refusal" in backup), backup.refusal?.why);
    if (!("refusal" in backup)) {
      assert.equal(backup.object.bucket, "backups", "the named bucket rides the row");
    }

    const unseated = putObject({
      projectId: project,
      path: "/sites/probe.json",
      mime: "application/json",
      bytes: new TextEncoder().encode('{"law":true}'),
    });
    assert.ok(!("refusal" in unseated), unseated.refusal?.why);
    if (!("refusal" in unseated)) {
      assert.equal(unseated.object.bucket, "family-state", "the default seat answers");
    }

    const refused = putObject({
      projectId: project,
      path: "/sites/bad.bin",
      mime: "application/octet-stream",
      bytes: new TextEncoder().encode("no"),
      bucket: "Not A Bucket",
    });
    assert.ok("refusal" in refused && refused.refusal.kind === "invalid", "a dishonest bucket name refuses");

    const whole = listObjects(project);
    assert.equal(whole.length, 2, "the unfiltered list answers every bucket");
    const backups = listObjects(project, "backups");
    assert.equal(backups.length, 1, "the shelf filter answers its own bucket");
    assert.equal(backups[0]?.path, "/backups/probe.tzst");
    assert.equal(backups[0]?.bucket, "backups");
    const seated = listObjects(project, "family-state");
    assert.equal(seated.length, 1, "the default seat filter answers its own row");
    assert.equal(seated[0]?.path, "/sites/probe.json");
    assert.equal(listObjects(project, "ghost-bucket").length, 0, "an empty bucket answers an honest empty");

    const verified = getObject(backup && !("refusal" in backup) ? backup.object.id : "");
    assert.ok(!("refusal" in verified) && verified.verified === true, "the verified read still answers");
    if (!("refusal" in verified)) {
      assert.equal(verified.object.bucket, "backups", "the read carries the bucket");
    }
  });

  it("climbs the bucket ladder on a store opened before the wave", async () => {
    const { openStorage } = await import("../drizzle.ts");
    const file = join(tmpdir(), `vault-bucketladder-${process.pid}.test.db`);
    for (const suffix of ["", "-wal", "-shm"]) {
      rmSync(`${file}${suffix}`, { force: true });
    }
    /* the old shape: a storage_objects table the bucket wave never touched. */
    const raw = new Database(file);
    raw.exec(
      `CREATE TABLE storage_objects (
         id TEXT PRIMARY KEY, project_id TEXT NOT NULL, path TEXT NOT NULL,
         mime TEXT NOT NULL, size INTEGER NOT NULL, digest TEXT NOT NULL,
         manifest TEXT NOT NULL, channel TEXT NOT NULL,
         created_at TEXT NOT NULL DEFAULT (datetime('now')), deleted_at TEXT
       )`,
    );
    raw
      .prepare(
        "INSERT INTO storage_objects (id, project_id, path, mime, size, digest, manifest, channel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run("obj-old", "p-old", "/old/row.bin", "application/octet-stream", 3, "d", "{}", "blob");
    raw.close();
    /* the open walks the ensureColumn ladder: the bucket climbs onto the
     * standing table and every standing row answers the family-state seat. */
    const climbed = openStorage(`file:${file}`);
    const columns = climbed.$client.pragma("table_info(storage_objects)") as { name: string }[];
    assert.ok(
      columns.some((column) => column.name === "bucket"),
      "the ladder added the bucket column",
    );
    const standing = climbed.$client.prepare("SELECT bucket FROM storage_objects WHERE id = ?").get("obj-old") as {
      bucket: string;
    };
    assert.equal(standing.bucket, "family-state", "a standing row answers the default seat");
    climbed.$client.close();
    for (const suffix of ["", "-wal", "-shm"]) {
      rmSync(`${file}${suffix}`, { force: true });
    }
  });
});
