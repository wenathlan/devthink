/* ==========================================================================
   os-events.ts — feed de eventos do OS (History do app devthink).
   Ações dos sub-apps (render na fila, projeto criado, chat) são empurradas
   aqui via localStorage + CustomEvent — a timeline escuta e atualiza.
   ========================================================================== */

"use client";

import { useEffect, useState } from "react";

export type OSEvent = {
  id: string;
  title: string;
  note: string;
  kind: "release" | "action" | "chat";
  at: number;
};

const KEY = "dt-os-events-v1";
export const OS_EVENT_CHANGE = "dt-os-events-change";
const CAP = 30;

export function isOSEvent(v: unknown): v is OSEvent {
  if (typeof v !== "object" || v === null) return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.title === "string" &&
    typeof e.note === "string" &&
    (e.kind === "release" || e.kind === "action" || e.kind === "chat") &&
    typeof e.at === "number"
  );
}

export function readOSEvents(): OSEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isOSEvent);
  } catch {
    return [];
  }
}

export function pushOSEvent(evt: Pick<OSEvent, "title" | "note" | "kind"> & { at?: number }): void {
  if (typeof window === "undefined") return;
  const next: OSEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: evt.title,
    note: evt.note,
    kind: evt.kind,
    at: evt.at ?? Date.now(),
  };
  try {
    const list = [next, ...readOSEvents()].slice(0, CAP);
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage opcional */
  }
  window.dispatchEvent(new CustomEvent(OS_EVENT_CHANGE));
}

export function clearOSEvents(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* storage opcional */
  }
  window.dispatchEvent(new CustomEvent(OS_EVENT_CHANGE));
}

/** Hook de leitura reativa do feed (reativa ao receber OS_EVENT_CHANGE). */
export function useOSEvents(): OSEvent[] {
  const [events, setEvents] = useState<OSEvent[]>([]);
  useEffect(() => {
    setEvents(readOSEvents());
    const onChange = () => setEvents(readOSEvents());
    window.addEventListener(OS_EVENT_CHANGE, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(OS_EVENT_CHANGE, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return events;
}
