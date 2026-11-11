/**
 * uistore — the ui store of the os: the uicopy table of the app's
 * better-sqlite3 store round trips (create, seed ingest, upsert, read),
 * the typed accessor chain answers the seed and the copy seed while the
 * platform is away, and the same-origin route lane serves the rows and
 * refuses an unknown key honestly. the label seat of the copy law rides
 * the same file (the store the manifest ingests into): the winget
 * accessor answers the manifest offline, the seed refuses honestly where
 * the row store is absent, and the manifest keeps answering. Every test
 * drives a unique temp database so the runs stay isolated.
 */

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { labelManifest, seedChatStrings, type ChatStringId, type LabelKey } from "../labels.ts";
import { copyseed } from "../uistore.ts";
import {
  chatText,
  label,
  loaduicopy,
  seedChatLabels,
  seedLabels,
  uicopy,
  uistoreget,
  uistoreingest,
  uistorelist,
  uistoreseedrows,
  uistoreupsert,
} from "../uistore.ts";

// the db home of this run: the env is read at open time (the first store
// call), never at import, so pointing it here isolates the run
process.env.DEVTHINK_UISTORE_DB = join(mkdtempSync(join(tmpdir(), "devthink-uistore-")), "uistore.db");

describe("uistore seed", () => {
  it("carries the moved winget copy verbatim — nothing invented, nothing dropped", () => {
    const seed = uistoreseedrows();
    expect(seed["intro.hero.leada"]).toBe("An OS");
    expect(seed["intro.hero.leadb"]).toBe("built for");
    expect(seed["intro.hero.leadc"]).toBe("every AI");
    expect(seed["intro.hero.mode.agents"]).toBe("and your agents");
    expect(seed["intro.hero.mode.studios"]).toBe("and your studios");
    expect(seed["intro.hero.subtitle"]).toBe("Create stream and run any studio or AI team in one unified OS");
    expect(seed["intro.hero.keyprimary"]).toBe("Get Started");
    expect(seed["intro.hero.keysecondary"]).toBe("Why DevThink?");
    expect(seed["intro.hero.modetoggle"]).toBe("Toggle OS Mode");
    expect(seed["panel.nav.tabs.aria"]).toBe("Open sessions");
    expect(seed["panel.nav.tabs.new"]).toBe("Open a new session");
    expect(seed["panel.nav.tabs.close"]).toBe("Close {label}");
    expect(seed["explore.sidebar.recentsEmpty"]).toBe("nothing made yet — the studios answer the catalog first.");
    expect(seed["explore.sidebar.familyEmpty"]).toBe("the family list is still loading.");
    expect(seed["explorer.planEmpty"]).toBe("No folders yet");
    expect(seed["explorer.empty"]).toBe("This folder is empty.");
    for (const [key, value] of Object.entries(seed)) {
      expect(key.length, `the key ${key} is a dotted address`).toBeGreaterThan(0);
      expect(value.length, `the row ${key} answers a word`).toBeGreaterThan(0);
    }
  });

  it("never overlaps the copy seed — one home per literal", () => {
    const seed = uistoreseedrows();
    for (const key of Object.keys(copyseed())) {
      expect(seed[key], `the key ${key} lives in one seed only`).toBeUndefined();
    }
  });
});

describe("uistore accessor", () => {
  it("answers the seed rows and falls through to the copy seed offline", () => {
    expect(uicopy("intro.hero.leada")).toBe("An OS");
    // the auth titles and buttons ride the copy seed through the chain
    expect(uicopy("auth.signin.welcome")).toBe("Welcome back");
    expect(uicopy("auth.signin.submit")).toBe("Sign in");
    // the missing key is loud, never a blank
    expect(uicopy("uistore.missing.key")).toBe("uistore.missing.key");
  });

  it("the offline loader answers without a fetch and keeps the seed answering", async () => {
    await loaduicopy();
    expect(uicopy("intro.hero.leada")).toBe("An OS");
  });
});

describe("uistore store (better-sqlite3 lane)", () => {
  it("creates the db, ingests both seeds and answers the rows", async () => {
    const ingested = await uistoreingest();
    const expected = Object.keys(uistoreseedrows()).length + Object.keys(copyseed()).length;
    expect(ingested).toBe(expected);
    const hero = await uistoreget("intro.hero.leada");
    expect(hero?.value).toBe("An OS");
    expect(hero?.locale).toBe("en");
    expect(hero?.updated ?? "").toBeTruthy();
    // the auth buttons and titles ride the same table (the boot ingest)
    expect((await uistoreget("auth.signin.submit"))?.value).toBe("Sign in");
    expect((await uistoreget("auth.signin.password.create"))?.value).toBe("Create a password");
    const rows = await uistorelist("en");
    expect(rows.length).toBe(ingested);
    expect(await uistoreget("uistore.nobody")).toBeNull();
    // the ingest is idempotent: equal keys update in place, never duplicate
    expect(await uistoreingest()).toBe(expected);
    expect((await uistorelist("en")).filter((row) => row.key === "intro.hero.leada")).toHaveLength(1);
  });

  it("upserts a row in place and stamps the write", async () => {
    expect(await uistoreupsert([{ key: "test.wave.row", value: "first" }])).toBe(1);
    expect((await uistoreget("test.wave.row"))?.value).toBe("first");
    expect(await uistoreupsert([{ key: "test.wave.row", value: "second" }])).toBe(1);
    expect((await uistorelist("en")).filter((row) => row.key === "test.wave.row")).toHaveLength(1);
    expect((await uistoreget("test.wave.row"))?.value).toBe("second");
  });
});

describe("uistore route lane", () => {
  it("serves the rows over /api/v1/ui/copy, one key over /:key, and refuses the unknown key", async () => {
    const { createserver } = await import("../server.js");
    const app = await createserver();
    const list = await app.request("/api/v1/ui/copy");
    expect(list.status).toBe(200);
    const answer = (await list.json()) as { rows: { key: string; value: string; locale: string }[] };
    expect(answer.rows.some((row) => row.key === "intro.hero.leada" && row.value === "An OS")).toBe(true);
    expect(answer.rows.every((row) => row.locale === "en")).toBe(true);
    const one = await app.request("/api/v1/ui/copy/intro.hero.leada");
    expect(one.status).toBe(200);
    expect(((await one.json()) as { value: string }).value).toBe("An OS");
    const refused = await app.request("/api/v1/ui/copy/uistore.nobody");
    expect(refused.status).toBe(404);
  });
});

describe("uistore label seat", () => {
  it("answers the manifest verbatim through the store — the copy law moves the access, never the wording", () => {
    for (const [id, text] of Object.entries(labelManifest)) {
      expect(label(id as LabelKey)).toBe(text);
    }
  });

  it("the seed never blocks the boot and the manifest always answers", async () => {
    // the node runner holds no IndexedDB: the row store refuses honestly
    // and the boot lane catches (App.tsx void seedLabels().catch(() => {}))
    await expect(seedLabels().catch(() => "boot survives")).resolves.toBe("boot survives");
    // after the refused seed the overrides stay empty — the manifest answers
    expect(label("chat.composer.send")).toBe("Send message");
    expect(label("console.boot.name")).toBe("DEVTHINK");
    expect(label("explore.sidebar.categories")).toBe("the categories");
  });
});

describe("uistore chat label seat", () => {
  it("answers every chat string verbatim through the store — the chat wingets read the database door, the seed text answers offline", () => {
    // the copy law's chat seat: the winget accessor rides the store the
    // indexeddb lane seeds — every row of the seed answers through the
    // store door with zero invented copy and zero dropped rows
    expect(seedChatStrings.length).toBeGreaterThan(50);
    for (const row of seedChatStrings) {
      expect(chatText(row.id as ChatStringId)).toBe(row.text);
    }
    // the dot ids stay dotted addresses (the manifest key law)
    for (const row of seedChatStrings) {
      expect(row.id.includes(".")).toBe(true);
      expect(row.id.length).toBeGreaterThan(0);
    }
  });

  it("the chat seed never blocks the boot and the seed always answers", async () => {
    // the node runner holds no IndexedDB: the row store refuses honestly
    // and the boot lane catches (App.tsx void seedChatLabels().catch(() => {}))
    await expect(seedChatLabels().catch(() => "boot survives")).resolves.toBe("boot survives");
    // after the refused seed the overrides stay empty — the seed answers
    expect(chatText("welcome.temporarySub" as ChatStringId)).toBe(
      "temporary chat: nothing saves on this device",
    );
    expect(chatText("toast.stopped" as ChatStringId)).toBe("Generation stopped");
  });

  it("the two doors answer identically offline — the pure labels.ts seat and the store seat of uistore.ts", async () => {
    // the acyclic law keeps the pure door for the graph-below modules
    // (gateway.ts) while the wingets read the store door: before any seed
    // the overrides stay empty on both doors and the texts agree whole
    const { chatText: pureChatText } = await import("../labels.ts");
    for (const row of seedChatStrings) {
      expect(chatText(row.id as ChatStringId)).toBe(pureChatText(row.id as ChatStringId));
    }
  });
});
