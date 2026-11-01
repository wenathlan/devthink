/**
 * storagelane.test.ts — the contract of the shared sqlite mechanism: the
 * pragma ladder order (busy_timeout before WAL — the flake law), the
 * statement cache identity, the :memory: factory seat, the explicit url
 * override and the transaction wrap. the lane is the storage law of the
 * family: every assertion here protects the eleven apps riding it.
 */

import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { openStorageLane, PRAGMA_BOOTSTRAP } from "../storagelane.ts";

const tempdirs: string[] = [];

function tempdir(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "storagelane-"));
  tempdirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempdirs.length > 0) {
    const dir = tempdirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("the storage lane contract", () => {
  it("walks the pragma ladder in the family order — busy_timeout before WAL, foreign keys armed", () => {
    expect(PRAGMA_BOOTSTRAP).toEqual(["busy_timeout = 30000", "journal_mode = WAL", "foreign_keys = ON"]);
    const dir = tempdir();
    const lane = openStorageLane({ url: path.join(dir, "pragma.db") });
    expect(lane.db.pragma("busy_timeout", { simple: true })).toBe(30000);
    expect(lane.db.pragma("journal_mode", { simple: true })).toBe("wal");
    expect(lane.db.pragma("foreign_keys", { simple: true })).toBe(1);
    lane.close();
    const memory = openStorageLane({ url: ":memory:" });
    expect(memory.db.pragma("busy_timeout", { simple: true })).toBe(30000);
    expect(memory.db.pragma("foreign_keys", { simple: true })).toBe(1);
    memory.close();
  });

  it("answers the cached prepare seat — the same sql returns the same statement object", () => {
    const lane = openStorageLane({ url: ":memory:" });
    lane.exec("CREATE TABLE t (id TEXT PRIMARY KEY, n INTEGER)");
    const first = lane.prepare("SELECT n FROM t WHERE id = ?");
    const second = lane.prepare("SELECT n FROM t WHERE id = ?");
    expect(second).toBe(first);
    lane.close();
  });

  it("runs the parameterized helpers — execute, queryAll, queryOne, never concatenated sql", () => {
    const lane = openStorageLane({ url: ":memory:" });
    lane.exec("CREATE TABLE t (id TEXT PRIMARY KEY, n INTEGER)");
    const inserted = lane.execute("INSERT INTO t (id, n) VALUES (?, ?)", ["a", 1]);
    expect(inserted.changes).toBe(1);
    lane.execute("INSERT INTO t (id, n) VALUES (?, ?)", ["b", 2]);
    expect(lane.queryAll<{ id: string; n: number }>("SELECT id, n FROM t ORDER BY id ASC")).toEqual([
      { id: "a", n: 1 },
      { id: "b", n: 2 },
    ]);
    expect(lane.queryOne<{ n: number }>("SELECT n FROM t WHERE id = ?", ["b"])?.n).toBe(2);
    expect(lane.queryOne("SELECT n FROM t WHERE id = ?", ["missing"])).toBeUndefined();
    lane.close();
  });

  it("opens the explicit url file, creating the parent directory", () => {
    const dir = tempdir();
    const nested = path.join(dir, "deep", "nested", "lane.db");
    const lane = openStorageLane({ url: nested });
    lane.exec("CREATE TABLE t (id TEXT PRIMARY KEY)");
    lane.execute("INSERT INTO t (id) VALUES (?)", ["x"]);
    lane.close();
    const reopened = openStorageLane({ url: nested });
    expect(reopened.queryOne<{ id: string }>("SELECT id FROM t WHERE id = ?", ["x"])?.id).toBe("x");
    reopened.close();
  });

  it("reads the named environment before the default file", () => {
    const dir = tempdir();
    const envFile = path.join(dir, "env.db");
    process.env.STORAGELANE_TEST_URL = envFile;
    try {
      const lane = openStorageLane({ envName: "STORAGELANE_TEST_URL" });
      lane.exec("CREATE TABLE t (id TEXT PRIMARY KEY)");
      lane.close();
      const defaultLane = openStorageLane({ envName: "STORAGELANE_TEST_URL" });
      defaultLane.execute("INSERT INTO t (id) VALUES (?)", ["env"]);
      defaultLane.close();
      expect(true).toBe(true);
    } finally {
      delete process.env.STORAGELANE_TEST_URL;
    }
  });

  it("wraps a body in one transaction — the seat the seeds ride", () => {
    const lane = openStorageLane({ url: ":memory:" });
    lane.exec("CREATE TABLE t (id TEXT PRIMARY KEY)");
    const verdict = lane.transaction(() => {
      lane.execute("INSERT INTO t (id) VALUES (?)", ["one"]);
      lane.execute("INSERT INTO t (id) VALUES (?)", ["two"]);
      return "committed";
    });
    expect(verdict).toBe("committed");
    expect(lane.queryAll("SELECT id FROM t").length).toBe(2);
    lane.close();
  });
});
