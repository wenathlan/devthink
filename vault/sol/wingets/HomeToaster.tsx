/**
 * Toaster.tsx — the sonner-style toast system of the vault product face:
 * one bottom-right stack of acrylic notices that answers every seal, every
 * refusal and every rehearsal action with a swipe-out voice. The copy
 * rides the ui store (uistore.ts — the callers pass no literal), the
 * stack keeps at most three notices (the oldest steps out), each notice
 * auto-dismisses on the sonner clock, pauses while the pointer rests on
 * it, and answers a real close key. The enter rides the spring curve, the
 * exit swipes out directionally — the doctrine toast cycle
 * (toast-in / swipe-out), reduced-motion stands down in the stylesheet.
 * The stack mounts once on the shell; the pages only call toast().
 */

import { DismissRegular } from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import { uicopy } from "../../uistore.ts";

/** the tone of one notice: ok seals, err refusals, info rehearsals. */
export type ToastTone = "ok" | "err" | "info";

/** one notice as the stack holds it. */
interface ToastItem {
  /** the stable id of the notice */
  id: number;
  /** the title line (the strong voice) */
  title: string;
  /** the body line (the truth under the title) */
  body: string;
  /** the tone the dot and the border answer */
  tone: ToastTone;
  /** true while the exit animation rides (removed after the swipe) */
  leaving: boolean;
}

/** the auto-dismiss clock of one notice (the sonner cadence). */
const TOAST_TTL = 4200;

/** the exit window the leaving notice rides before it unmounts. */
const TOAST_EXIT = 240;

/** the stack ceiling: the oldest notice steps out beyond three. */
const TOAST_MAX = 3;

/** the module store of the notices: one stack for the whole app. */
const items: ToastItem[] = [];

/** the mounted listeners: every Toaster element subscribes. */
const listeners = new Set<() => void>();

/** the auto-dismiss timers keyed by notice id (cleared on pause/close). */
const timers = new Map<number, ReturnType<typeof setTimeout>>();

/** the id source of the notices. */
let nextId = 1;

/**
 * Emits one change to every mounted Toaster.
 */
function emit(): void {
  for (const listener of listeners) listener();
}

/**
 * Arms the auto-dismiss clock of one notice.
 *
 * @param id the notice id.
 */
function armTimer(id: number): void {
  disarmTimer(id);
  timers.set(
    id,
    setTimeout(() => {
      leave(id);
    }, TOAST_TTL),
  );
}

/**
 * Disarms the clock of one notice (the hover pause, the close, the unmount).
 *
 * @param id the notice id.
 */
function disarmTimer(id: number): void {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
}

/**
 * Marks one notice leaving (the exit animation rides) and unmounts it
 * after the swipe window.
 *
 * @param id the notice id.
 */
function leave(id: number): void {
  disarmTimer(id);
  const item = items.find((entry) => entry.id === id);
  if (!item || item.leaving) return;
  item.leaving = true;
  emit();
  setTimeout(() => {
    const at = items.findIndex((entry) => entry.id === id);
    if (at >= 0) {
      items.splice(at, 1);
      emit();
    }
  }, TOAST_EXIT);
}

/**
 * toast — the one door the pages call: raises a notice into the stack
 * (the ceiling trims the oldest), arms the sonner clock and answers. The
 * copy the caller passes already rode the ui store.
 *
 * @param title the title line.
 * @param body the body line.
 * @param tone the tone (default info).
 * @returns the notice id (the tests read it through the snapshot).
 */
export function toast(title: string, body: string, tone: ToastTone = "info"): number {
  const id = nextId;
  nextId += 1;
  items.push({ id, title, body, tone, leaving: false });
  while (items.filter((entry) => !entry.leaving).length > TOAST_MAX) {
    const oldest = items.find((entry) => !entry.leaving);
    if (!oldest) break;
    leave(oldest.id);
  }
  armTimer(id);
  emit();
  return id;
}

/** The snapshot of the stack as one render reads it. */
function useToastitems(): ToastItem[] {
  const [, bump] = useState(0);
  useEffect(() => {
    const listener = (): void => bump((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return items;
}

/**
 * One notice of the stack: the acrylic card with the tone dot, the two
 * lines and the close key. The pointer pause rides a listener the effect
 * binds (the hover clock of the sonner cycle), never a JSX handler.
 *
 * @param item the notice to render.
 * @returns the notice element.
 */
function ToastCard({ item }: { item: ToastItem }) {
  const card = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const host = card.current;
    if (!host) return;
    const enter = (): void => disarmTimer(item.id);
    const move = (): void => {
      if (!item.leaving) armTimer(item.id);
    };
    host.addEventListener("mouseenter", enter);
    host.addEventListener("mouseleave", move);
    return () => {
      host.removeEventListener("mouseenter", enter);
      host.removeEventListener("mouseleave", move);
      disarmTimer(item.id);
    };
  }, [item]);
  return (
    <div className="vc-toast" ref={card} data-tone={item.tone} data-leaving={item.leaving ? "true" : undefined}>
      <i className="vc-toast__dot" aria-hidden="true" />
      <div className="vc-toast__body">
        <p className="vc-toast__title">{item.title}</p>
        <p className="vc-toast__line">{item.body}</p>
      </div>
      <button
        type="button"
        className="vc-toast__close"
        aria-label={uicopy("face.toast.dismiss")}
        onClick={() => leave(item.id)}
      >
        <DismissRegular fontSize={12} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * The stack mount: one element on the shell, the notices answering under
 * the polite live region the assistive tech reads.
 *
 * @returns the toaster element (null while the stack stands empty).
 */
export function Toaster() {
  const snapshot = useToastitems();
  if (snapshot.length === 0) return null;
  return (
    <div className="vc-toaster" role="status" aria-live="polite">
      {snapshot.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default Toaster;
