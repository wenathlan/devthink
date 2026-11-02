/**
 * uistore — the ui store of the vault: the uicopy table of the vault's
 * better-sqlite3 store round trips (create, seed ingest, upsert, read),
 * the typed accessor chain answers the seed and the labels manifest while
 * the platform is away, and the same-origin route lane on the vault http
 * surface serves the rows and refuses an unknown key honestly. Every test
 * drives a unique temp database so the runs stay isolated.
 */

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { LABEL_MANIFEST } from "../labels.ts";
import {
  loaduicopy,
  uicopy,
  uicopyfill,
  uistoreget,
  uistoreingest,
  uistorelist,
  uistoreseedrows,
  uistoreupsert,
} from "../uistore.ts";

// the db home of this run: the env is read at open time (the first store
// call), never at import, so pointing it here isolates the run
process.env.VAULT_UISTORE_DB = join(mkdtempSync(join(tmpdir(), "vault-uistore-")), "uistore.db");

// the route lane below boots the engine itself (api.ts evaluates the
// storage singleton of drizzle.ts at import), so the storage truth routes
// into the throwaway store of the os tmpdir BEFORE the dynamic import
// evaluates (the quotaisolation precedent) — the run never drops a
// vault-storage.db beside the sources (the faun seal of the deploy wave).
const storageThrowaway = join(tmpdir(), `vault-uistore-${process.pid}.storage.db`);
process.env.VAULT_STORAGE_URL = `file:${storageThrowaway}`;
for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`${storageThrowaway}${suffix}`, { force: true });
}

describe("uistore seed", () => {
  it("carries the product-face copy verbatim — nothing invented, nothing dropped", () => {
    const seed = uistoreseedrows();
    expect(seed["face.hero.eyebrow"]).toBe("vault · edge storage for the whole family");
    expect(seed["face.hero.title"]).toBe("your state, sealed and served from one deployable store.");
    expect(seed["face.hero.lede"]).toBe(
      "bucket plans, object storage and a database console in one deployable clone — nothing rides the browser, everything answers from the vault engine.",
    );
    expect(seed["face.hero.cta"]).toBe("open the console");
    expect(seed["face.zone.title"]).toBe("one console for the plans, the objects and the database");
    expect(seed["face.plans.col.bucket"]).toBe("plan");
    expect(seed["face.plans.col.share"]).toBe("lfs share");
    expect(seed["face.browse.empty"]).toBe("no object answers this filter");
    expect(seed["face.console.head"]).toBe("database console");
    expect(seed["face.toast.sealedTitle"]).toBe("deposit sealed");
    expect(seed["face.toast.dismiss"]).toBe("dismiss the notice");
    expect(seed["face.skeleton.aria"]).toBe("loading the ledger");
    for (const [key, value] of Object.entries(seed)) {
      expect(key.length, `the key ${key} is a dotted address`).toBeGreaterThan(0);
      expect(value.length, `the row ${key} answers a word`).toBeGreaterThan(0);
    }
  });

  it("never overlaps the labels manifest — one home per literal", () => {
    const seed = uistoreseedrows();
    for (const key of Object.keys(LABEL_MANIFEST)) {
      expect(seed[key], `the key ${key} lives in one store only`).toBeUndefined();
    }
  });
});

describe("uistore accessor", () => {
  it("answers the seed rows and falls through to the labels store offline", () => {
    // the product face rides the seed
    expect(uicopy("face.hero.cta")).toBe("open the console");
    // the interface copy the pages already ride answers through the chain
    expect(uicopy("home.deposit.seal")).toBe("seal");
    expect(uicopy("objects.title")).toBe("Objects");
    // the missing key is loud, never a blank
    expect(uicopy("uistore.missing.key")).toBe("uistore.missing.key");
  });

  it("fills the {token} slots through the placeholder door", () => {
    expect(uicopyfill("face.toast.sealedBody", { path: "/sites/state.db", channel: "lfs", digest: "sha-256" })).toBe(
      "/sites/state.db rides the lfs channel — sha-256",
    );
    expect(uicopyfill("face.browse.count", { count: "7", bytes: "4.6 MB" })).toBe("7 objects · 4.6 MB under seal");
  });

  it("the offline loader answers without a fetch and keeps the seed answering", async () => {
    await loaduicopy();
    expect(uicopy("face.hero.cta")).toBe("open the console");
  });
});

describe("uistore store (better-sqlite3 lane)", () => {
  it("creates the db, ingests both stores and answers the rows", async () => {
    const ingested = await uistoreingest();
    const expected = Object.keys(uistoreseedrows()).length + Object.keys(LABEL_MANIFEST).length;
    expect(ingested).toBe(expected);
    const hero = await uistoreget("face.hero.title");
    expect(hero?.value).toBe("your state, sealed and served from one deployable store.");
    expect(hero?.locale).toBe("en");
    expect(hero?.updated ?? "").toBeTruthy();
    // the interface copy rides the same table (the boot ingest)
    expect((await uistoreget("home.deposit.seal"))?.value).toBe("seal");
    expect((await uistoreget("shell.rail.home"))?.value).toBe("home");
    const rows = await uistorelist("en");
    expect(rows.length).toBe(ingested);
    expect(await uistoreget("uistore.nobody")).toBeNull();
    // the ingest is idempotent: equal keys update in place, never duplicate
    expect(await uistoreingest()).toBe(expected);
    expect((await uistorelist("en")).filter((row) => row.key === "face.hero.title")).toHaveLength(1);
  });

  it("upserts a row in place and stamps the write", async () => {
    expect(await uistoreupsert([{ key: "test.wave.row", value: "first" }])).toBe(1);
    expect((await uistoreget("test.wave.row"))?.value).toBe("first");
    expect(await uistoreupsert([{ key: "test.wave.row", value: "second" }])).toBe(1);
    expect((await uistorelist("en")).filter((row) => row.key === "test.wave.row")).toHaveLength(1);
    expect((await uistoreget("test.wave.row"))?.value).toBe("second");
  });
});

describe("uistore route lane (the vault http surface)", () => {
  it("serves the rows over /api/v1/ui/copy, one key over /:key, and refuses the unknown key", async () => {
    const { createVaultServer, listenVault } = await import("../api.ts");
    const server = createVaultServer();
    const port = await listenVault(server, { port: 0 });
    try {
      const base = `http://127.0.0.1:${port}`;
      const list = await fetch(`${base}/api/v1/ui/copy`);
      expect(list.status).toBe(200);
      const answer = (await list.json()) as { rows: { key: string; value: string; locale: string }[] };
      expect(answer.rows.some((row) => row.key === "face.hero.cta" && row.value === "open the console")).toBe(true);
      expect(answer.rows.some((row) => row.key === "home.deposit.seal" && row.value === "seal")).toBe(true);
      expect(answer.rows.every((row) => row.locale === "en")).toBe(true);
      const one = await fetch(`${base}/api/v1/ui/copy/face.hero.cta`);
      expect(one.status).toBe(200);
      expect(((await one.json()) as { value: string }).value).toBe("open the console");
      const refused = await fetch(`${base}/api/v1/ui/copy/uistore.nobody`);
      expect(refused.status).toBe(404);
    } finally {
      server.close();
    }
  });
});
