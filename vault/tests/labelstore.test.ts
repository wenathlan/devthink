// # labelstore.test — the pure contract of the copy-law mechanism the vault
//   owns for the family: the typed accessor (override first, manifest last),
//   the placeholder door, and the idempotent seed over the three storage
//   doors (the browser cache lane, the injected row-store lane and the
//   no-storage law). runnable with the house vitest suite:
//   bunx vitest run tests/labelstore.test.ts
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "vitest";
import { createLabelStore, type LabelRowStore, type LabelStoreRow } from "../labelstore.ts";

/** the manifest fixture: three plain strings, one carrying a {token} slot —
 * the shape every family app's manifest rides (flat, string-valued). */
const manifest = {
  "home.title": "the vault",
  "home.caption": "storage for the family",
  "home.count": "{n} objects stored",
} as const;

/** the browser-cache mock: the localStorage contract the mechanism reads
 * (getItem/setItem over one string slot) — the node suite rides the shim
 * because the typeof-window guard answers the real guard's law. the slots
 * map IS the storage: writing it is writing the window's localStorage. */
let slots = new Map<string, string>();

function installWindow(): Map<string, string> {
  slots = new Map<string, string>();
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (key: string) => slots.get(key) ?? null,
      setItem: (key: string, value: string) => void slots.set(key, value),
    },
  };
  return slots;
}

beforeEach(() => {
  installWindow();
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe("the typed accessor", () => {
  it("answers the manifest text for every key", () => {
    const store = createLabelStore({ manifest, revision: 1, cacheKey: "test.labels.rows" });
    assert.equal(store.label("home.title"), "the vault");
    assert.equal(store.label("home.caption"), "storage for the family");
  });

  it("answers the override first once the seed loaded a translated row", async () => {
    const slots = installWindow();
    const store = createLabelStore({ manifest, revision: 1, cacheKey: "test.labels.rows" });
    // a translated row already in the cache answers over the manifest
    slots.set(
      "test.labels.rows",
      JSON.stringify([
        { id: "home.title", text: "der tresor", revision: 1, updatedAt: "2026-01-01T00:00:00.000Z", translated: true },
      ]),
    );
    const { seeded } = await store.seedLabels();
    assert.equal(seeded, 2); // the two untranslated keys land, the translated one stays protected
    assert.equal(store.label("home.title"), "der tresor");
    assert.equal(store.label("home.caption"), "storage for the family");
  });
});

describe("the placeholder door", () => {
  it("fills the {token} slots with the runtime values", () => {
    const store = createLabelStore({ manifest, revision: 1, cacheKey: "test.labels.rows" });
    assert.equal(store.labelfill("home.count", { n: "42" }), "42 objects stored");
  });

  it("keeps the unmatched slot literal when the value is absent", () => {
    const store = createLabelStore({ manifest, revision: 1, cacheKey: "test.labels.rows" });
    assert.equal(store.labelfill("home.count", {}), "{n} objects stored");
  });
});

describe("the browser-cache seed", () => {
  it("seeds every manifest row on the first run and stays idempotent", async () => {
    const store = createLabelStore({ manifest, revision: 1, cacheKey: "test.labels.rows" });
    const first = await store.seedLabels();
    assert.equal(first.seeded, 3);
    assert.equal(first.protected, 0);
    const second = await store.seedLabels();
    assert.equal(second.seeded, 0);
    assert.equal(second.protected, 3);
    const raw = slots.get("test.labels.rows");
    assert.ok(raw, "the cache row landed");
    const rows = JSON.parse(raw as string) as LabelStoreRow[];
    assert.equal(rows.length, 3);
    assert.equal(rows.find((row) => row.id === "home.title")?.text, "the vault");
  });

  it("protects the translated rows from the overwrite", async () => {
    const slots = installWindow();
    slots.set(
      "test.labels.rows",
      JSON.stringify([
        { id: "home.title", text: "der tresor", revision: 1, updatedAt: "2026-01-01T00:00:00.000Z", translated: true },
      ]),
    );
    const store = createLabelStore({ manifest, revision: 2, cacheKey: "test.labels.rows" });
    const result = await store.seedLabels();
    assert.equal(result.seeded, 2);
    assert.equal(result.protected, 1);
    const rows = JSON.parse(slots.get("test.labels.rows") as string) as LabelStoreRow[];
    const translated = rows.find((row) => row.id === "home.title");
    assert.equal(translated?.text, "der tresor");
    assert.equal(translated?.translated, true);
  });

  it("re-seeds a changed row when the copy wave moved the text", async () => {
    const slots = installWindow();
    slots.set(
      "test.labels.rows",
      JSON.stringify([
        { id: "home.title", text: "the vault (old)", revision: 1, updatedAt: "2026-01-01T00:00:00.000Z" },
      ]),
    );
    const store = createLabelStore({ manifest, revision: 2, cacheKey: "test.labels.rows" });
    const result = await store.seedLabels();
    assert.equal(result.seeded, 3); // the changed row plus the two missing rows
    const rows = JSON.parse(slots.get("test.labels.rows") as string) as LabelStoreRow[];
    assert.equal(rows.find((row) => row.id === "home.title")?.text, "the vault");
  });
});

describe("the no-storage law", () => {
  it("answers the manifest without touching any store", async () => {
    const store = createLabelStore({ manifest, revision: 1 });
    const result = await store.seedLabels();
    assert.equal(result.seeded, 0);
    assert.equal(result.protected, 3);
    assert.equal(store.label("home.title"), "the vault");
    assert.equal(slots.size, 0);
  });
});

describe("the row-store lane", () => {
  it("reads the stored rows and saves the changed ones through the door", async () => {
    const saved: LabelStoreRow[] = [];
    const rowStore: LabelRowStore = {
      readAll: async () => [
        { id: "home.title", text: "la voûte", revision: 1, updatedAt: "2026-01-01T00:00:00.000Z", translated: true },
      ],
      save: async (row) => void saved.push(row),
    };
    const store = createLabelStore({ manifest, revision: 2, rowStore });
    const result = await store.seedLabels();
    assert.equal(result.seeded, 2);
    assert.equal(result.protected, 1);
    assert.equal(saved.length, 2);
    assert.equal(store.label("home.title"), "la voûte");
    assert.equal(store.label("home.caption"), "storage for the family");
    assert.ok(saved.every((row) => row.revision === 2));
  });
});
