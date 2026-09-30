/**
 * use.stored.state.ts — the persistence pattern of the os: localStorage
 * plus a validating type-guard. Storage is optional: private browsing
 * never breaks the view. The load happens after mount (no SSR mismatch
 * concerns in the static workbench either).
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type Validator<T> = (value: unknown) => value is T;

function load<T>(key: string, validate: Validator<T>): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!validate(parsed)) return null;
    return parsed;
  } catch {
    return null; // storage unavailable or invalid json: keep the fallback
  }
}

/**
 * useStoredState<T>(key, fallback, validate) — the ONE persistence
 * mechanism of the os. Safe fallback + type-guard.
 *
 * @param key the storage key.
 * @param fallback the value before the stored one is loaded.
 * @param validate the type-guard applied to the stored value.
 * @returns the state tuple.
 */
export function useStoredState<T>(
  key: string,
  fallback: T,
  validate: Validator<T>
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(fallback);
  const loaded = useRef(false);

  // loads after mount (safe hydration)
  useEffect(() => {
    const stored = load(key, validate);
    if (stored !== null) setState(stored);
    loaded.current = true;
  }, [key, validate]);

  // persists every change after the load
  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* private browsing may disable storage */
    }
  }, [key, state]);

  return [state, setState];
}

/**
 * restores focus to an element after a re-render (rAF).
 *
 * @param selector the css selector of the target element.
 */
export function refocus(selector: string): void {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>(selector);
    el?.focus();
  });
}

/* ------------------------------------------------------------------ */
/* reusable validators (type-guards)                                  */
/* ------------------------------------------------------------------ */

export const isString: Validator<string> = (v): v is string => typeof v === "string";
export const isNumber: Validator<number> = (v): v is number => typeof v === "number" && Number.isFinite(v);

/**
 * builds a list validator from an item validator.
 *
 * @param guard the item type-guard.
 * @returns a type-guard for arrays of the item type.
 */
export function arrayOf<T>(guard: Validator<T>): Validator<T[]> {
  return (v): v is T[] => Array.isArray(v) && v.every(guard);
}

/**
 * builds an object validator for a fixed key set.
 *
 * @param keys the required keys.
 * @returns a type-guard for records carrying those keys.
 */
export function isObjectWith<K extends string>(keys: readonly K[]): Validator<Record<K, unknown>> {
  return (v): v is Record<K, unknown> =>
    typeof v === "object" && v !== null && keys.every((k) => k in (v as Record<string, unknown>));
}

/**
 * useStoredFlag — a simple persisted boolean (theme, toggles).
 *
 * @param key the storage key.
 * @param fallback the value before the stored one is loaded.
 * @returns the boolean tuple.
 */
export function useStoredFlag(key: string, fallback: boolean): [boolean, (v: boolean) => void] {
  const [value, setValue] = useStoredState<boolean>(key, fallback, (v): v is boolean => typeof v === "boolean");
  const set = useCallback((v: boolean) => setValue(v), [setValue]);
  return [value, set];
}
