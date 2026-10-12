// the recently opened apps of the Start menu.
/**
 * recentapps — the persistence behind the Start menu "recommended" rail
 * (the Windows 11 recommended list). One responsibility: the recent app id
 * list of the shell. The list lives in localStorage under one key, holds at
 * most six ids, never repeats an id (a re-open promotes the app to the
 * head) and degrades to an empty list when storage is unavailable, so the
 * Start menu simply falls back to its pinned grid. Reading returns the
 * stored ids in most-recent-first order; the caller maps them onto the
 * shared app catalog (Sol/shell/appregistry.ts) — this module never imports
 * the catalog and never hardcodes app data.
 */

/** The localStorage key of the recent app id list. */
const RECENTS_KEY = "dt.start.recents.v1";

/** The list cap: six slots, the Windows recommended rail rhythm. */
const RECENTS_CAP = 6;

/**
 * Reads the recent app ids, most recently opened first.
 *
 * @returns up to six app ids; a malformed or unavailable store answers [].
 */
export function loadrecentapps(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string").slice(0, RECENTS_CAP);
  } catch {
    return [];
  }
}

/**
 * Promotes one app to the head of the recent list and persists it
 * (best effort: storage may be unavailable, the list then stays
 * session-only in the returned value).
 *
 * @param id the app id the visitor just opened.
 * @returns the fresh id list, most recent first, capped at six.
 */
export function pushrecentapp(id: string): string[] {
  const next = [id, ...loadrecentapps().filter((candidate) => candidate !== id)].slice(0, RECENTS_CAP);
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: the list stays session-only */
  }
  return next;
}
