/**
 * osevents.ts — the event feed of the os (the History page of the
 * devthink view). Actions of the sub-views (queued render, created
 * project, chat) are pushed here via localStorage + CustomEvent; the
 * timeline listens and updates live.
 */
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

/**
 * checks that an unknown value is a well formed os event.
 *
 * @param v the value to check.
 * @returns true when the value is an OSEvent.
 */
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

/**
 * reads the persisted event feed (empty outside the browser or when the
 * stored list is malformed).
 *
 * @returns the stored events, newest first.
 */
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

/**
 * pushes one event onto the feed (capped) and notifies the listeners.
 *
 * @param evt the event to push (timestamp defaults to now).
 */
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
    /* storage is optional */
  }
  window.dispatchEvent(new CustomEvent(OS_EVENT_CHANGE));
}

/** clears the persisted feed and notifies the listeners. */
export function clearOSEvents(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* storage is optional */
  }
  window.dispatchEvent(new CustomEvent(OS_EVENT_CHANGE));
}

/**
 * reactive reader hook of the feed (re-reads on OS_EVENT_CHANGE and on
 * cross-tab storage events).
 *
 * @returns the current events.
 */
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
