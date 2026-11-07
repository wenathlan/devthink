// the debonair unit of the family.
// # motionpref — the in-session reduce-motion switch of the settings page.
// The interface never touches the visitor machine: the choice rides the
// session scope (tab memory, the same contract as the theme and the take
// shelf) and the document carries it as data-motion="reduced" — the one
// attribute the stylesheet guards answer to (the scoped kills plus the
// universal hard stop). The media query stays the boss: the switch only ever
// adds the document flag on top of `prefers-reduced-motion`, never against
// it. Pure and multi-mode: the storage seam and the document root are
// injectable so the tests run on stubs, exactly like takestore.
// The dedup law makes this unit the family owner of the switch: the behavior
// lives here once, and the sibling doors (argan/motionpref.ts) build their
// own instance through createMotionPref with their own session key, so the
// tab memory stays isolated per app while the document contract stays the
// family's one attribute.

/** The session key the preference rides (tab memory, nothing persists). */
export const MOTION_PREF_KEY = "debonair.motion.reduced";

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
 * Builds the full motion-preference set bound to one session key — the family
 * seam of the dedup law: the owner carries the behavior once, each sibling
 * door builds its instance with its own key (the per-app session isolation),
 * and the document contract (the data-motion attribute) stays identical
 * across the family. The direct exports below are the debonair instance of
 * this factory, riding the debonair key.
 *
 * @param key the session key the preference rides.
 * @returns the key-bound set (the same names the owner exports).
 */
export function createMotionPref(key: string) {
  function reduceMotionApplied(root: MotionRoot = document.documentElement): boolean {
    return root.getAttribute("data-motion") === "reduced";
  }

  function reduceMotionStored(storage: MotionStorage = sessionStorageOrMemoryMotion()): boolean {
    try {
      return storage.getItem(key) === "1";
    } catch {
      return false;
    }
  }

  function setReduceMotion(
    on: boolean,
    storage: MotionStorage = sessionStorageOrMemoryMotion(),
    root: MotionRoot = document.documentElement,
  ): void {
    if (on) {
      root.setAttribute("data-motion", "reduced");
      try {
        storage.setItem(key, "1");
      } catch {
        /* storage unavailable: the flag still holds for this document */
      }
      return;
    }
    root.removeAttribute("data-motion");
    try {
      storage.removeItem(key);
    } catch {
      /* storage unavailable: the document flag is already cleared */
    }
  }

  function toggleReduceMotion(storage: MotionStorage = sessionStorageOrMemoryMotion(), root?: MotionRoot): boolean {
    const next = !reduceMotionApplied(root ?? document.documentElement);
    setReduceMotion(next, storage, root ?? document.documentElement);
    return next;
  }

  return {
    MOTION_PREF_KEY: key,
    memoryMotionStorage,
    sessionStorageOrMemoryMotion,
    reduceMotionApplied,
    reduceMotionStored,
    setReduceMotion,
    toggleReduceMotion,
  };
}

// the debonair instance of the family seam: the direct exports below are its
// members riding the debonair key, so every debonair consumer and test keeps
// the same names, the same behavior and the same session key.
const motionPref = createMotionPref(MOTION_PREF_KEY);

/**
 * Whether the document carries the reduced flag (data-motion="reduced").
 *
 * @param root the document root the attribute rides (defaults to <html>).
 * @returns true when the flag is applied.
 */
export const reduceMotionApplied = motionPref.reduceMotionApplied;

/**
 * Reads the session switch (not the document): true only when this session
 * asked for reduced motion.
 *
 * @param storage the storage seam (defaults to the session storage).
 * @returns the stored flag.
 */
export const reduceMotionStored = motionPref.reduceMotionStored;

/**
 * Applies the flag to the document and stores it for the session (or clears
 * both). The stylesheet does the rest.
 *
 * @param on the new value of the switch.
 * @param storage the storage seam (defaults to the session storage).
 * @param root the document root the attribute rides (defaults to <html>).
 */
export const setReduceMotion = motionPref.setReduceMotion;

/**
 * Flips the switch on the document + session and answers the new value.
 *
 * @param storage the storage seam (defaults to the session storage).
 * @param root the document root the attribute rides (defaults to <html>).
 * @returns the new value.
 */
export const toggleReduceMotion = motionPref.toggleReduceMotion;
