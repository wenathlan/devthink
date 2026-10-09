// the getry toast surface of the family.
/**
 * toast.tsx — the in-memory toast of the Sol theme.
 *
 * a tiny publish/subscribe toast: pages call toast() with a message and
 * a tone, the Toaster host re-renders the stack. everything lives in
 * module memory — nothing touches the visitor machine, nothing persists,
 * entries expire on their own timer.
 */

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

/** the tones a toast can carry. */
export type ToastTone = "success" | "error" | "info";

/** one toast entry in the stack. */
export type ToastEntry = {
  id: number;
  message: string;
  tone: ToastTone;
};

/** the module-level stack plus the subscriber set (in memory only). */
let entries: ToastEntry[] = [];
const subscribers = new Set<(next: ToastEntry[]) => void>();
let nextid = 1;

/** the lifetime of one toast in milliseconds. */
const toastttl = 4200;

/**
 * publishes a toast to every mounted Toaster.
 *
 * @param message the text to show.
 * @param tone the tone of the entry (defaults to info).
 * @returns the id of the published entry.
 */
export function toast(message: string, tone: ToastTone = "info"): number {
  const entry: ToastEntry = { id: nextid++, message, tone };
  entries = [...entries, entry];
  subscribers.forEach((render) => {
    render(entries);
  });
  setTimeout(() => dismiss(entry.id), toastttl);
  return entry.id;
}

/**
 * removes one toast by id and notifies the hosts.
 *
 * @param id the id to dismiss.
 */
export function dismiss(id: number): void {
  entries = entries.filter((entry) => entry.id !== id);
  subscribers.forEach((render) => {
    render(entries);
  });
}

/** the icon per tone, lucide family, stroke 1.8. */
const toneicon: Record<ToastTone, typeof Info> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
};

/**
 * the toast host: mount once in App, it renders the live stack.
 *
 * @returns the toaster element.
 */
export function Toaster() {
  const [stack, setStack] = useState<ToastEntry[]>(entries);

  useEffect(() => {
    subscribers.add(setStack);
    return () => {
      subscribers.delete(setStack);
    };
  }, []);

  if (stack.length === 0) return null;
  return (
    <div className="toaststack" role="status" aria-live="polite">
      {stack.map((entry) => {
        const Icon = toneicon[entry.tone];
        return (
          <div key={entry.id} className={`toast ${entry.tone}`}>
            <Icon size={16} />
            <span>{entry.message}</span>
            <button type="button" aria-label="dismiss" onClick={() => dismiss(entry.id)}>
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Toaster;
