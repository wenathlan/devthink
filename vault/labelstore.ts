/**
 * labelstore.ts — the shared mechanism of the copy law: the typed accessor,
 * the placeholder door and the idempotent seed every family app rides. the
 * vault owns the store mechanism (the storage law of the family): each app
 * keeps its manifest — app data, never duplicated logic — and calls the
 * factory with its cache key; the translated rows stay protected from the
 * overwrite, the manifest always answers when the store is silent, and the
 * browser mirror rides the localStorage cache the way the site db seeds the
 * same rows on the server through each app's own db lane.
 *
 * the module is browser-safe by construction: zero imports (no
 * better-sqlite3, no node builtins — the row type is owned here so not even
 * a type-only db edge rides the graph), the cache rides typeof-window
 * guards, and the rowStore door (the IndexedDB lane of the os app) is an
 * injected interface, never a concrete storage import.
 */

/** one row of the label store: the shape every family db mirrors one to one
 * (the id answers the manifest key, the revision answers the copy wave, and
 * the translated flag protects the person's chosen language). */
export type LabelStoreRow = {
  id: string;
  text: string;
  revision: number;
  updatedAt: string;
  translated?: boolean;
};

/** the async row store the seed writes through when the app keeps its rows
 * behind a service door instead of the browser cache (the os app's
 * IndexedDB lane): readAll answers every stored row, save lands one. */
export type LabelRowStore = {
  readAll(): Promise<readonly LabelStoreRow[]>;
  save(row: LabelStoreRow): Promise<void>;
};

/** the manifest key type helper: each app re-derives its own LabelKey from
 * its own manifest (the key is app data — the mechanism is shared). */
export type LabelKeyOf<Manifest> = keyof Manifest & string;

/** the store the factory returns: the three doors every family app already
 * exports — the typed accessor, the placeholder filler and the seed. */
export type LabelStore<Manifest extends Readonly<Record<string, string>>> = {
  /** the typed accessor of the copy: the only door a widget or page anchor
   * uses; the override answers first, the manifest always answers last. */
  label(key: LabelKeyOf<Manifest>): string;
  /** the placeholder door: fills the {token} slots of one format key with
   * the runtime values (the store keeps the sentence, the widget passes
   * the data). */
  labelfill(key: LabelKeyOf<Manifest>, values: Record<string, string>): string;
  /** the seed ingests the manifest into the labels store, idempotent, and
   * the translated rows stay protected from the overwrite. */
  seedLabels(): Promise<{ seeded: number; protected: number }>;
};

/** the factory options: the manifest and the revision are the app's copy
 * data; the storage door is one of the two the family rides — the browser
 * cache key (localStorage) or the injected row store — and omitting both
 * answers the no-storage law (the monetization surface: the visitor browser
 * never writes). */
export type LabelStoreOptions<Manifest extends Readonly<Record<string, string>>> = {
  /** the english source of truth: the page.widget.key paths answering the
   * surface text. stays app data. */
  manifest: Manifest;
  /** the label revision of the manifest: bump on every copy wave so the
   * seed refreshes the store rows of the changed strings. */
  revision: number;
  /** the browser cache key ("<app>.labels.rows"): the rows mirror the site
   * db offline. omit when the app answers the no-storage law. */
  cacheKey?: string;
  /** the async row store the seed writes through (the service-door lane).
   * omit for the browser-cache lane. */
  rowStore?: LabelRowStore;
};

/** reads the browser cache rows: the localStorage mirror of the site db —
 * the db is the source of truth, the cache carries the translated rows
 * offline (the onboardingstate precedent for the visitor machine). */
function readCache(cacheKey: string): LabelStoreRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed.filter((row): row is LabelStoreRow => !!row && typeof row === "object") as LabelStoreRow[])
      : [];
  } catch {
    return [];
  }
}

/** writes the browser cache rows: best effort — the manifest always answers
 * when the cache stays silent. */
function writeCache(cacheKey: string, rows: readonly LabelStoreRow[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(cacheKey, JSON.stringify(rows));
  } catch {
    // the cache is best effort: the manifest always answers
  }
}

/** Builds one label store over the app's manifest: the typed accessor, the
 * placeholder door and the idempotent seed, over the storage door the app
 * declares (the browser cache, the injected row store, or the no-storage
 * law). the mechanism is owned here — the vault storage engine — and every
 * family app consumes it as a library; the manifest stays app data. */
export function createLabelStore<Manifest extends Readonly<Record<string, string>>>({
  manifest,
  revision,
  cacheKey,
  rowStore,
}: LabelStoreOptions<Manifest>): LabelStore<Manifest> {
  /** the translation overrides the runtime loads from the store at boot:
   * the key answers the translated text when the person changed the
   * language. */
  const overrides = new Map<string, string>();

  function label(key: LabelKeyOf<Manifest>): string {
    return overrides.get(key) ?? manifest[key];
  }

  function labelfill(key: LabelKeyOf<Manifest>, values: Record<string, string>): string {
    return label(key).replace(/\{(\w+)\}/g, (match, token: string) => values[token] ?? match);
  }

  /** the browser-cache seed: the rows mirror the site db (readCache) and the
   * changed rows land back through writeCache; the translated rows stay
   * protected from the overwrite. */
  async function seedCache(): Promise<{ seeded: number; protected: number }> {
    const stored = readCache(cacheKey as string);
    const rows = new Map<string, LabelStoreRow>(stored.map((row) => [row.id, row]));
    let seeded = 0;
    let saved = 0;
    for (const [id, text] of Object.entries(manifest)) {
      const row = rows.get(id);
      overrides.set(id, row?.translated ? row.text : text);
      if (!row || (!row.translated && row.text !== text)) {
        rows.set(id, {
          id,
          text,
          revision,
          updatedAt: new Date().toISOString(),
          ...(row?.translated ? { translated: true } : {}),
        });
        seeded += 1;
      }
      saved += 1;
    }
    writeCache(cacheKey as string, [...rows.values()]);
    return { seeded, protected: saved - seeded };
  }

  /** the row-store seed: the rows ride the injected service door (the os
   * app's IndexedDB lane) — readAll answers the stored rows and every
   * changed row lands through save; the translated rows stay protected. */
  async function seedRowStore(): Promise<{ seeded: number; protected: number }> {
    const store = rowStore as LabelRowStore;
    const stored = await store.readAll();
    const rows = new Map<string, LabelStoreRow>(stored.map((row) => [row.id, row]));
    let seeded = 0;
    let saved = 0;
    for (const [id, text] of Object.entries(manifest)) {
      const row = rows.get(id);
      overrides.set(id, row?.translated ? row.text : text);
      if (!row || (!row.translated && row.text !== text)) {
        await store.save({
          id,
          text,
          revision,
          updatedAt: new Date().toISOString(),
          ...(row?.translated ? { translated: true } : {}),
        });
        seeded += 1;
      }
      saved += 1;
    }
    return { seeded, protected: saved - seeded };
  }

  /** the no-storage seed: the monetization surface's own legal copy — the
   * visitor browser never writes — so the overrides answer the manifest and
   * the seed reports the protected count without touching a store. */
  async function seedNone(): Promise<{ seeded: number; protected: number }> {
    for (const [id, text] of Object.entries(manifest)) {
      overrides.set(id, text);
    }
    return { seeded: 0, protected: Object.keys(manifest).length };
  }

  function seedLabels(): Promise<{ seeded: number; protected: number }> {
    if (rowStore) return seedRowStore();
    if (cacheKey) return seedCache();
    return seedNone();
  }

  return { label, labelfill, seedLabels };
}
