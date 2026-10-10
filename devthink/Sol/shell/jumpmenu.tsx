/**
 * jumpmenu.tsx — the taskbar jump list (`.task-jump`): the right-click menu
 * of a taskbar pin, in the Windows 11 menu grammar (12px glass panel, 28px
 * rows, the 180ms scale .97→1 + fade menu entrance of the ShellChrome mount
 * state). The entries derive from the app target — "Open" first, then the
 * kind-specific quick entry (window → "Open window", destination/route →
 * "Open <name>", os → "Open in OS", external → "Open <app> site" via the
 * familyurl deploy base) — followed by a separator and the pin/unpin action.
 * Every row carries its 16px stroke-1.5 glyph in a left rail; the hover tint
 * is the one signal color at 12% (color-mix). The pin order persists in
 * localStorage "dt.taskbar.pins.v1" as an id list; a missing, malformed or
 * empty list falls back to the defaults. role="menu" with arrow-key (and
 * Home/End) navigation; Escape and outside clicks are handled by the chrome.
 */

import { AppWindow, Compass, Globe, LayoutGrid, type LucideIcon, Pin, PinOff, Play } from "lucide-react";
import { type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import { familyurl } from "../../deploybase.ts";
import type { DesktopApp } from "./appregistry.ts";
import { FLYOUT_ACRYLIC, flyoutMotion } from "./trayflyouts.tsx";

/** The localStorage key of the taskbar pin order (an id list). */
const TASKBAR_PINS_KEY = "dt.taskbar.pins.v1";

/**
 * reads the persisted taskbar pin order; a missing, malformed or empty list
 * falls back to the given default ids.
 *
 * @param fallback the default pin ids (the taskbar contract).
 * @returns the stored pin ids in stored order, deduplicated.
 */
export function loadTaskbarPins(fallback: string[]): string[] {
  try {
    const raw = window.localStorage.getItem(TASKBAR_PINS_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const ids = parsed.filter((entry): entry is string => typeof entry === "string");
    return ids.length > 0 ? [...new Set(ids)] : fallback;
  } catch {
    return fallback;
  }
}

/**
 * persists the taskbar pin order (best effort: storage may be unavailable,
 * the order then simply stays session-only).
 *
 * @param ids the pin ids in taskbar order.
 */
export function saveTaskbarPins(ids: string[]): void {
  try {
    window.localStorage.setItem(TASKBAR_PINS_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable: the order stays session-only */
  }
}

/** one quick entry of the jump list */
type JumpEntry = { id: string; label: string; icon: LucideIcon; action: "open" | "site" };

/** the kind-specific quick entries derived from the app target */
function jumpEntries(app: DesktopApp): JumpEntry[] {
  switch (app.target.kind) {
    case "window":
      return [{ id: "window", label: "Open window", icon: AppWindow, action: "open" }];
    case "destination":
    case "route":
      return [{ id: "surface", label: `Open ${app.name}`, icon: Compass, action: "open" }];
    case "os":
      return [{ id: "os", label: "Open in OS", icon: LayoutGrid, action: "open" }];
    case "external":
      return [{ id: "site", label: `Open ${app.name} site`, icon: Globe, action: "site" }];
  }
}

const ITEM_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  minHeight: 28,
  padding: "0 10px",
  color: "#edf0f6",
  border: 0,
  borderRadius: 6,
  cursor: "pointer",
  font: "500 12px var(--dt-sans, sans-serif)",
  textAlign: "left",
};

type JumpListProps = {
  /** the pinned app the list belongs to */
  app: DesktopApp;
  /** visible state of the mount pattern (false renders the exit pose) */
  open: boolean;
  /** reduced motion: no transition styles at all */
  reduced: boolean;
  /** the cursor position the list opens at (clamped into the viewport) */
  x: number;
  y: number;
  /** whether the app is currently pinned (flips the pin/unpin label) */
  pinned: boolean;
  /** launches the app (the shell openApp path) */
  onOpen: () => void;
  /** toggles the pin (the shell persists the new order) */
  onTogglePin: () => void;
  /** closes the list */
  onClose: () => void;
};

/** the taskbar jump list of one pin */
export function JumpList({ app, open, reduced, x, y, pinned, onOpen, onTogglePin, onClose }: JumpListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x, y });
  const entries = jumpEntries(app);

  // clamp the measured list into the viewport (the cursor may sit low/right)
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nextX = x + rect.width > window.innerWidth - 8 ? Math.max(8, window.innerWidth - rect.width - 8) : x;
    const nextY = y + rect.height > window.innerHeight - 8 ? Math.max(8, window.innerHeight - rect.height - 8) : y;
    setPos({ x: nextX, y: nextY });
  }, [x, y]);

  // opening hands focus to the first item; arrows take over from there
  useLayoutEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
  }, [open]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      items[(index + delta + items.length) % items.length]?.focus();
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      (event.key === "Home" ? items[0] : items[items.length - 1])?.focus();
    }
  };

  const runEntry = (entry: JumpEntry) => {
    if (entry.action === "site" && app.target.kind === "external") {
      window.location.assign(familyurl(app.target.slug));
      onClose();
      return;
    }
    onOpen();
  };

  return (
    <div
      ref={listRef}
      className="task-jump"
      role="menu"
      aria-label={`${app.name} options`}
      data-hide={open ? undefined : "true"}
      data-flyout-keep="true"
      onKeyDown={onKeyDown}
      style={{
        ...FLYOUT_ACRYLIC,
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: "var(--z-menu, 60)",
        minWidth: 200,
        padding: 6,
        ...flyoutMotion(open, reduced, "menu"),
      }}
    >
      <button type="button" role="menuitem" className="task-jump__item" style={ITEM_STYLE} onClick={onOpen}>
        <span className="task-jump__icon" aria-hidden="true">
          <Play size={16} strokeWidth={1.5} />
        </span>
        Open
      </button>
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          role="menuitem"
          className="task-jump__item"
          style={ITEM_STYLE}
          onClick={() => runEntry(entry)}
        >
          <span className="task-jump__icon" aria-hidden="true">
            <entry.icon size={16} strokeWidth={1.5} />
          </span>
          {entry.label}
        </button>
      ))}
      <hr
        className="task-jump__sep"
        style={{ height: 1, margin: "4px 8px", border: 0, background: "rgb(255 255 255 / 9%)" }}
      />
      <button
        type="button"
        role="menuitem"
        className="task-jump__item"
        style={ITEM_STYLE}
        onClick={() => {
          onTogglePin();
          onClose();
        }}
      >
        <span className="task-jump__icon" aria-hidden="true">
          {pinned ? <PinOff size={16} strokeWidth={1.5} /> : <Pin size={16} strokeWidth={1.5} />}
        </span>
        {pinned ? "Unpin from taskbar" : "Pin to taskbar"}
      </button>
    </div>
  );
}
