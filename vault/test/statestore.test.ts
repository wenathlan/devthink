// # statestore.test — the visitor state lane battery, runnable with the
// house vitest suite:
//   bunx vitest run test/statestore.test.ts
// Two seats: the storage mechanism (the vault factory every consumer
// rides over its own lane — the undefined read before the first write,
// the put/get roundtrip, the last-write-wins overwrite, the visitor and
// key isolation, and the cross-instance persistence over one file) and
// the state doors over the real http surface (the read answers the
// pair's payload, the write lands last-write-wins behind the rate
// ladder, the malformed calls answer the standardized refusals).

import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "vitest";
import { createStateStore } from "../statestore.ts";
import { openStorageLane, type StorageLane } from "../storage.ts";

const tempdirs: string[] = [];

function tempdir(): string {
  const dir = path.join(os.tmpdir(), `statestore-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  tempdirs.push(dir);
  return dir;
}

/** opens one throwaway lane over a fresh temp file (the family seat driver). */
function lane(dir: string, name: string): StorageLane {
  return openStorageLane({ url: path.join(dir, name) });
}

afterEach(() => {
  while (tempdirs.length > 0) {
    const dir = tempdirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("the state store mechanism", () => {
  it("answers undefined for a pair that never wrote", () => {
    const store = createStateStore(lane(tempdir(), "fresh.db"));
    assert.equal(store.getState("stranger", "dt.theme"), undefined);
    assert.equal(store.getRow("stranger", "dt.theme"), undefined);
  });

  it("answers the payload after one write (the roundtrip)", () => {
    const store = createStateStore(lane(tempdir(), "roundtrip.db"));
    store.putState("visitor", "dt.theme", JSON.stringify({ accent: "ember" }));
    assert.deepEqual(JSON.parse(store.getState("visitor", "dt.theme") ?? "null"), { accent: "ember" });
    const row = store.getRow("visitor", "dt.theme");
    assert.ok(row);
    assert.equal(row.visitor, "visitor");
    assert.equal(row.stateKey, "dt.theme");
    assert.ok(row.updatedAt.length > 0);
  });

  it("answers the newest payload (the last-write-wins overwrite)", () => {
    const store = createStateStore(lane(tempdir(), "lww.db"));
    store.putState("visitor", "dt.rail", JSON.stringify({ wide: false }));
    store.putState("visitor", "dt.rail", JSON.stringify({ wide: true }));
    assert.deepEqual(JSON.parse(store.getState("visitor", "dt.rail") ?? "null"), { wide: true });
  });

  it("isolates visitors and keys (the pair is the unique seat)", () => {
    const store = createStateStore(lane(tempdir(), "isolation.db"));
    store.putState("visitor-a", "dt.theme", JSON.stringify("ember"));
    store.putState("visitor-b", "dt.theme", JSON.stringify("sky"));
    store.putState("visitor-a", "dt.rail", JSON.stringify("wide"));
    assert.equal(JSON.parse(store.getState("visitor-a", "dt.theme") ?? "null"), "ember");
    assert.equal(JSON.parse(store.getState("visitor-b", "dt.theme") ?? "null"), "sky");
    assert.equal(JSON.parse(store.getState("visitor-a", "dt.rail") ?? "null"), "wide");
    assert.equal(store.getState("visitor-b", "dt.rail"), undefined);
  });

  it("persists across instances over one file (the throwaway lane)", () => {
    const dir = tempdir();
    const file = path.join(dir, "shared.db");
    const first = createStateStore(openStorageLane({ url: file }));
    first.putState("visitor", "dt.theme", JSON.stringify("ember"));
    const second = createStateStore(openStorageLane({ url: file }));
    assert.equal(JSON.parse(second.getState("visitor", "dt.theme") ?? "null"), "ember");
  });
});

/* ── the state doors over the real http surface ── */

const throwaway = path.join(os.tmpdir(), `vault-state-${process.pid}.test.db`);
process.env.VAULT_STORAGE_URL = `file:${throwaway}`;
process.env.VAULT_UISTORE_DB = path.join(os.tmpdir(), `vault-state-${process.pid}.uistore.db`);
process.env.VAULT_TOKEN = "the-state-operator-token";
process.env.VAULT_AUTH_RATE_MAX = "1000";
for (const file of [throwaway, process.env.VAULT_UISTORE_DB]) {
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(`${file}${suffix}`, { force: true });
  }
}

const { createVaultServer, listenVault } = await import("../account.ts");

const server = createVaultServer();
const port = await listenVault(server, { port: 0 });
const base = `http://127.0.0.1:${port}`;

describe("the state doors", () => {
  it("answers 404 for a pair that never wrote", async () => {
    const read = await fetch(`${base}/api/v1/state?visitor=nobody&key=dt.theme`);
    assert.equal(read.status, 404);
    const body = (await read.json()) as { error: { code: string } };
    assert.equal(body.error.code, "VAULT_STATE");
  });

  it("roundtrips a write and answers the newest value", async () => {
    const first = await fetch(`${base}/api/v1/state`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitor: "visitor-roundtrip", key: "dt.theme", value: { accent: "ember" } }),
    });
    assert.equal(first.status, 200);
    const read = await fetch(
      `${base}/api/v1/state?visitor=${encodeURIComponent("visitor-roundtrip")}&key=${encodeURIComponent("dt.theme")}`,
    );
    assert.equal(read.status, 200);
    const body = (await read.json()) as { value: { accent: string } };
    assert.deepEqual(body.value, { accent: "ember" });
    const second = await fetch(`${base}/api/v1/state`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitor: "visitor-roundtrip", key: "dt.theme", value: { accent: "sky" } }),
    });
    assert.equal(second.status, 200);
    const reread = await fetch(
      `${base}/api/v1/state?visitor=${encodeURIComponent("visitor-roundtrip")}&key=${encodeURIComponent("dt.theme")}`,
    );
    const rereadBody = (await reread.json()) as { value: { accent: string } };
    assert.deepEqual(rereadBody.value, { accent: "sky" });
  });

  it("refuses the malformed calls (the standardized refusals)", async () => {
    const missingParams = await fetch(`${base}/api/v1/state`);
    assert.equal(missingParams.status, 400);
    const missingFields = await fetch(`${base}/api/v1/state`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitor: "visitor-x" }),
    });
    assert.equal(missingFields.status, 400);
    const wrongMethod = await fetch(`${base}/api/v1/state?visitor=v&key=k`, { method: "DELETE" });
    assert.equal(wrongMethod.status, 405);
  });
});
