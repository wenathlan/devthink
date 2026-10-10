// # takestore — the session take store of debonair (root layer): the plans
// the composer renders land here so the library lists them and the studio
// reopens them. The store rides the session storage (tab memory — the
// interface never writes to the visitor machine, the same scope the hero
// draft and the intro flag ride) with a plain-memory fallback, injectable so
// the tests run on a stub. One JSON document, take ids unique (a re-render
// of the same seed+prompt replaces its earlier take), newest first. Pure
// bookkeeping — zero audio, zero consumer data.

import type { TakePlan } from "./arranger.ts";

/** The session key the store keeps its document under. */
export const TAKE_STORE_KEY = "debonair.takes";

/** The session key the library hands the studio to open one take. */
export const TAKE_SELECT_KEY = "debonair.studio.take";

/** The storage seam the store reads and writes (session storage or a stub). */
export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** One stored take: the plan plus the moment it was rendered. */
export interface TakeRecord {
  /** The plan itself (id, name, genre, bpm, key, grid, clips, strips). */
  plan: TakePlan;
  /** The ISO timestamp of the render. */
  savedAt: string;
}

/** An in-memory storage stub (the fallback when the session storage is unavailable). */
export function memoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

/** The session storage when reachable, the memory stub otherwise. */
export function sessionStorageOrMemory(): StorageLike {
  try {
    return window.sessionStorage;
  } catch {
    return memoryStorage();
  }
}

/** Parses the stored document; a broken document answers empty. */
function parseDocument(raw: string | null): TakeRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is TakeRecord => {
      const record = entry as TakeRecord;
      return Boolean(record?.plan && typeof record.plan.id === "string" && typeof record.plan.bpm === "number");
    });
  } catch {
    return [];
  }
}

/** Writes the document back (throws when the storage is full or frozen). */
function writeDocument(storage: StorageLike, records: readonly TakeRecord[]): void {
  storage.setItem(TAKE_STORE_KEY, JSON.stringify(records));
}

/**
 * Loads every stored take, newest first.
 *
 * @param storage the storage seam (defaults to the session storage).
 * @returns the take records.
 */
export function loadTakeRecords(storage: StorageLike = sessionStorageOrMemory()): TakeRecord[] {
  return parseDocument(storage.getItem(TAKE_STORE_KEY)).sort((left, right) =>
    right.savedAt.localeCompare(left.savedAt),
  );
}

/**
 * Stores one take (replacing the record of the same plan id).
 *
 * @param plan the plan to store.
 * @param storage the storage seam (defaults to the session storage).
 * @returns the records after the write, newest first.
 */
export function saveTakePlan(plan: TakePlan, storage: StorageLike = sessionStorageOrMemory()): TakeRecord[] {
  const record: TakeRecord = { plan, savedAt: new Date().toISOString() };
  const rest = parseDocument(storage.getItem(TAKE_STORE_KEY)).filter((entry) => entry.plan.id !== plan.id);
  const records = [record, ...rest];
  writeDocument(storage, records);
  return records;
}

/**
 * Removes one take by id.
 *
 * @param id the plan id.
 * @param storage the storage seam (defaults to the session storage).
 * @returns the records after the write, newest first.
 */
export function removeTakePlan(id: string, storage: StorageLike = sessionStorageOrMemory()): TakeRecord[] {
  const records = parseDocument(storage.getItem(TAKE_STORE_KEY)).filter((entry) => entry.plan.id !== id);
  writeDocument(storage, records);
  return records;
}

/**
 * Finds one stored take by id.
 *
 * @param id the plan id.
 * @param storage the storage seam (defaults to the session storage).
 * @returns the record, or undefined.
 */
export function findTakeRecord(id: string, storage: StorageLike = sessionStorageOrMemory()): TakeRecord | undefined {
  return parseDocument(storage.getItem(TAKE_STORE_KEY)).find((entry) => entry.plan.id === id);
}
