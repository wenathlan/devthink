/* ==========================================================================
   useStoredState — padrão onda8c (ND-8831..8845): localStorage + validador
   type-guard. Storage é opcional: private browsing nunca quebra o app.
   Em Next.js o carregamento acontece pós-mount (evita mismatch de SSR).
   ========================================================================== */

"use client";

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
    return null; // storage indisponível ou JSON inválido: segue com fallback
  }
}

/**
 * useStoredState<T>(key, fallback, validate) — o ÚNICO mecanismo de
 * persistência do OS. Fallback seguro + type-guard + toast opcional.
 */
export function useStoredState<T>(
  key: string,
  fallback: T,
  validate: Validator<T>
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(fallback);
  const loaded = useRef(false);

  // carrega pós-mount (hidratação segura)
  useEffect(() => {
    const stored = load(key, validate);
    if (stored !== null) setState(stored);
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // persiste a cada mudança depois do load
  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* Private browsing may disable storage */
    }
  }, [key, state]);

  return [state, setState];
}

/** Restaura foco para um elemento após re-render (padrão onda8c, rAF). */
export function refocus(selector: string): void {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>(selector);
    el?.focus();
  });
}

/* ------------------------------------------------------------------ */
/* validadores reutilizáveis (type-guards)                            */
/* ------------------------------------------------------------------ */

export const isString: Validator<string> = (v): v is string => typeof v === "string";
export const isNumber: Validator<number> = (v): v is number => typeof v === "number" && Number.isFinite(v);

export function arrayOf<T>(guard: Validator<T>): Validator<T[]> {
  return (v): v is T[] => Array.isArray(v) && v.every(guard);
}

export function isObjectWith<K extends string>(keys: readonly K[]): Validator<Record<K, unknown>> {
  return (v): v is Record<K, unknown> =>
    typeof v === "object" && v !== null && keys.every((k) => k in (v as Record<string, unknown>));
}

/** useLocalStorageFlag — boolean persistido simples (tema, toggles). */
export function useStoredFlag(key: string, fallback: boolean): [boolean, (v: boolean) => void] {
  const [value, setValue] = useStoredState<boolean>(key, fallback, (v): v is boolean => typeof v === "boolean");
  const set = useCallback((v: boolean) => setValue(v), [setValue]);
  return [value, set];
}
