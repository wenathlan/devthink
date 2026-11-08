/**
 * usestoredstate.ts — the persistence pattern of the os: the validating
 * type-guard seat over the visitor state lane. The load happens after
 * mount (no SSR mismatch concerns in the static workbench either). Two
 * layers carry the value: the localStorage session mirror (private
 * browsing never breaks the view) and — when the platform gateway base is
 * configured (the same base the entry flow rides) — the vault state door
 * over GET/POST /api/v1/state, which is the source of truth: the mirror
 * hydrates from it and every change mirrors back. Without a configured
 * base the hook walks cache-only, exactly the static build's behavior.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { onboardingapibase, visitorid } from "./onboardingstate.ts";

export type Validator<T> = (value: unknown) => value is T;

/** the read timeout the state hydrate answers (the onboarding accessor
 * grammar — a slow gateway never hangs the mount). */
const READ_TIMEOUT_MS = 4000;

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

/** Reads the stored value of one visitor and key pair off the platform
 * state door (undefined when the base is unconfigured, the pair was never
 * written — 404 —, the answer fails the guard, or the door is
 * unreachable). Best effort: every failure answers undefined and the
 * mirror keeps the view alive. */
async function loadRemote<T>(base: URL, key: string, validate: Validator<T>): Promise<T | undefined> {
  if (typeof fetch === "undefined") return undefined;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), READ_TIMEOUT_MS);
  try {
    const response = await fetch(
      `${base.origin}/api/v1/state?visitor=${encodeURIComponent(visitorid())}&key=${encodeURIComponent(key)}`,
      { headers: { accept: "application/json" }, signal: controller.signal },
    );
    if (!response.ok) return undefined;
    const answer = (await response.json()) as { value?: unknown };
    if (answer?.value === undefined) return undefined;
    if (!validate(answer.value)) return undefined;
    return answer.value;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

/** Mirrors one value back to the platform state door. Fire and forget:
 * every failure stays silent (the offline mirror already holds the view). */
async function saveRemote(base: URL, key: string, value: unknown): Promise<void> {
  if (typeof fetch === "undefined") return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), READ_TIMEOUT_MS);
  try {
    await fetch(`${base.origin}/api/v1/state`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitor: visitorid(), key, value }),
      signal: controller.signal,
    });
  } catch {
    /* the mirror is best effort — the door may be unreachable */
  } finally {
    clearTimeout(timer);
  }
}

/**
 * useStoredState<T>(key, fallback, validate) — the ONE persistence
 * mechanism of the os. Safe fallback + type-guard; the vault state door
 * carries the truth when the gateway base is configured, the localStorage
 * seat mirrors it.
 *
 * @param key the storage key.
 * @param fallback the value before the stored one is loaded.
 * @param validate the type-guard applied to the stored value.
 * @returns the state tuple.
 */
export function useStoredState<T>(
  key: string,
  fallback: T,
  validate: Validator<T>,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(fallback);
  const loaded = useRef(false);
  const dirty = useRef(false);
  const base = useRef<URL | null>(onboardingapibase());

  // loads after mount (safe hydration): the mirror first, then the
  // platform door answers over it (the door is the source of truth — a
  // local change made before the answer lands is never clobbered).
  useEffect(() => {
    const stored = load(key, validate);
    if (stored !== null) setState(stored);
    loaded.current = true;
    dirty.current = false;
    const door = base.current;
    if (!door) return;
    let cancelled = false;
    loadRemote(door, key, validate).then((remote) => {
      if (cancelled || remote === undefined || dirty.current) return;
      setState(remote);
      try {
        window.localStorage.setItem(key, JSON.stringify(remote));
      } catch {
        /* private browsing may disable storage */
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- validate is pure; the identity must not re-trigger the load
  }, [key]);

  // persists every change after the load: the mirror always, the platform
  // door when configured (fire and forget).
  useEffect(() => {
    if (!loaded.current) return;
    dirty.current = true;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* private browsing may disable storage */
    }
    const door = base.current;
    if (door) void saveRemote(door, key, state);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the key and the door identity ride the mount
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
