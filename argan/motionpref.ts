// the argan unit of the family.
// # motionpref — the in-session reduce-motion switch of the settings page.
// The interface never touches the visitor machine: the choice rides the
// session scope (tab memory, the same contract as the theme) and the
// document carries it as data-motion="reduced" — the one attribute the
// stylesheet guards answer to (the session hard stop of Sol/sol.css). The
// media query stays the boss: the switch only ever adds the document flag
// on top of `prefers-reduced-motion`, never against it. Pure and
// multi-mode: the storage seam and the document root are injectable so
// tests run on stubs.

/** The session key the preference rides (tab memory, nothing persists). */
export const MOTION_PREF_KEY = "argan.motion.reduced";

/** The storage seam the preference reads and writes (session storage or a stub). */
export type MotionStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** The document root contract the attribute rides (the <html> element). */
export type MotionRoot = {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
};

/** An in-memory storage stub (the fallback when the session storage is unavailable). */
export function memoryMotionStorage(): MotionStorage {
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

/** The session storage when reachable, an in-memory stub otherwise. */
export function sessionStorageOrMemoryMotion(): MotionStorage {
  try {
    return window.sessionStorage;
  } catch {
    return memoryMotionStorage();
  }
}

/**
 * Whether the document carries the reduced flag (data-motion="reduced").
 *
 * @param root the document root the attribute rides (defaults to <html>).
 * @returns true when the flag is applied.
 */
export function reduceMotionApplied(root: MotionRoot = document.documentElement): boolean {
  return root.getAttribute("data-motion") === "reduced";
}

/**
 * Reads the session switch (not the document): true only when this session
 * asked for reduced motion.
 *
 * @param storage the storage seam (defaults to the session storage).
 * @returns the stored flag.
 */
export function reduceMotionStored(storage: MotionStorage = sessionStorageOrMemoryMotion()): boolean {
  try {
    return storage.getItem(MOTION_PREF_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Applies the flag to the document and stores it for the session (or clears
 * both). The stylesheet does the rest.
 *
 * @param on the new value of the switch.
 * @param storage the storage seam (defaults to the session storage).
 * @param root the document root the attribute rides (defaults to <html>).
 */
export function setReduceMotion(
  on: boolean,
  storage: MotionStorage = sessionStorageOrMemoryMotion(),
  root: MotionRoot = document.documentElement,
): void {
  if (on) {
    root.setAttribute("data-motion", "reduced");
    try {
      storage.setItem(MOTION_PREF_KEY, "1");
    } catch {
      /* storage unavailable: the flag still holds for this document */
    }
    return;
  }
  root.removeAttribute("data-motion");
  try {
    storage.removeItem(MOTION_PREF_KEY);
  } catch {
    /* storage unavailable: the document flag is already cleared */
  }
}
