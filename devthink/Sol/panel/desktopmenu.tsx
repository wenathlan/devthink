/**
 * desktopmenu.tsx — the Windows context menus of the desktop surface
 * (Sol/panel/desktop.tsx): the desktop menu (View ▸, Sort by ▸, Refresh,
 * Display settings) and the per-cell menu (Open, Open in new window,
 * properties-lite), painted as Tailwind composition on the design tokens
 * (task 3-a): the .acrylic-menu Fluent surface (rgb(43 43 43 / 85%) +
 * saturate(3) blur(20px) + grain, 8px corners, the flyout shadow) with 32px
 * rows on the 9% wash, hairline separators, mono shortcuts at the right and
 * the 150ms scale .97→1 menu entrance. One entry model drives both: flat
 * items, read-only label rows, separators and one-level-deep submenus that
 * open as sibling panels to the right of their anchor. Menus close on
 * Escape, outside pointerdown and after any action; the arrow keys walk the
 * items, Enter activates and the submenu collapses with Escape or ←.
 */

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { clampNumber } from "./desktopstate.ts";

/** one entry of a context menu */
export type MenuEntry =
  | { kind: "item"; id: string; label: string; shortcut?: string; disabled?: boolean; onSelect?: () => void }
  | { kind: "sep"; id: string }
  | { kind: "label"; id: string; label: string }
  | { kind: "submenu"; id: string; label: string; items: MenuEntry[] };

type DesktopMenuProps = {
  /** viewport x of the open gesture (the pointer position) */
  x: number;
  /** viewport y of the open gesture (the pointer position) */
  y: number;
  entries: MenuEntry[];
  /** closes the whole menu (Escape on the root, action, outside click) */
  onClose: () => void;
};

/** the margins a menu keeps from the viewport edges, in px */
const VIEWPORT_MARGIN = 8;
/** the submenu overlap relative to its anchor item, in px (the Windows offset) */
const SUBMENU_OVERLAP = 4;

type PanelProps = {
  x: number;
  y: number;
  entries: MenuEntry[];
  label: string;
  /** nesting depth (the root panel is 0; ← collapses only above the root) */
  depth: number;
  /** collapses this panel (a submenu closes; the root menu closes whole) */
  onCollapse: () => void;
  /** closes the whole menu (outside pointerdown, action) */
  onCommit: () => void;
};

/** the submenu anchor: its id and the viewport position of its panel */
type SubmenuState = { id: string; x: number; y: number };

/**
 * One menu panel. Reused recursively for submenus — every panel clamps
 * itself into the viewport, owns its highlight and handles its own keys.
 */
function MenuPanel({ x, y, entries, label, depth, onCollapse, onCommit }: PanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const [position, setPosition] = useState({ x, y });
  const [active, setActive] = useState(-1);
  const [submenu, setSubmenu] = useState<SubmenuState | null>(null);

  // clamps the panel into the viewport once measured (layout effect: before paint)
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - VIEWPORT_MARGIN - rect.width);
    const maxY = Math.max(VIEWPORT_MARGIN, window.innerHeight - VIEWPORT_MARGIN - rect.height);
    setPosition({ x: clampNumber(x, VIEWPORT_MARGIN, maxX), y: clampNumber(y, VIEWPORT_MARGIN, maxY) });
  }, [x, y]);

  // the panel takes focus so the arrow navigation works without a first click
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // outside pointerdown closes the whole menu (any panel of the menu counts as inside)
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".dsk-menu")) return;
      onCommit();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [onCommit]);

  const isSelectable = (index: number): boolean => {
    const entry = entries[index];
    if (!entry) return false;
    if (entry.kind === "submenu") return true;
    return entry.kind === "item" && !entry.disabled;
  };

  const step = (from: number, delta: number): number => {
    let index = from;
    for (let moves = 0; moves < entries.length; moves += 1) {
      index = (index + delta + entries.length) % entries.length;
      if (isSelectable(index)) return index;
    }
    return -1;
  };

  /** opens the submenu panel of one entry, anchored to its item */
  const openSubmenu = useCallback(
    (id: string) => {
      const entry = entries.find((candidate) => candidate.kind === "submenu" && candidate.id === id);
      if (entry?.kind !== "submenu") return;
      const anchor = itemRefs.current.get(id);
      const rect = anchor?.getBoundingClientRect();
      setSubmenu({
        id,
        x: (rect ? rect.right : x) - SUBMENU_OVERLAP,
        y: (rect ? rect.top : y) - SUBMENU_OVERLAP,
      });
    },
    [entries, x, y],
  );

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const entry = active >= 0 ? entries[active] : undefined;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (submenu) {
        setSubmenu(null);
        panelRef.current?.focus();
        return;
      }
      onCollapse();
      return;
    }
    if (event.key === "ArrowLeft") {
      if (submenu) {
        // the open submenu collapses first, the highlight returns to its anchor
        event.preventDefault();
        setSubmenu(null);
        panelRef.current?.focus();
      } else if (depth > 0) {
        // a submenu panel collapses back into its parent on ←
        event.preventDefault();
        onCollapse();
      }
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive(step(active, delta));
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActive(event.key === "Home" ? step(-1, 1) : step(entries.length, -1));
      return;
    }
    if ((event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") && entry?.kind === "submenu") {
      event.preventDefault();
      openSubmenu(entry.id);
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && entry?.kind === "item" && !entry.disabled) {
      event.preventDefault();
      entry.onSelect?.();
      onCommit();
    }
  };

  const activate = (index: number) => {
    const entry = entries[index];
    if (!entry || entry.kind === "sep" || entry.kind === "label") return;
    if (entry.kind === "submenu") {
      openSubmenu(entry.id);
      return;
    }
    if (entry.disabled) return;
    entry.onSelect?.();
    onCommit();
  };

  return (
    <>
      <div
        ref={panelRef}
        className="dsk-menu acrylic-menu fixed z-(--z-menu) min-w-[220px] origin-top-left rounded-md border border-white/8 p-1 animate-menu-in light:border-black/12"
        role="menu"
        aria-label={label}
        tabIndex={-1}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onKeyDown={onKeyDown}
      >
        {entries.map((entry, index) => {
          if (entry.kind === "sep") {
            return <hr key={entry.id} className="mx-2 my-1 h-px border-0 bg-white/8 light:bg-black/12" />;
          }
          if (entry.kind === "label") {
            return (
              <div
                key={entry.id}
                role="presentation"
                className="px-2.5 pt-[7px] pb-[5px] font-mono text-[10px] leading-[1.4] font-semibold tracking-[0.08em] lowercase text-ink-3"
              >
                {entry.label}
              </div>
            );
          }
          const isSubmenu = entry.kind === "submenu";
          const isOpen = isSubmenu && submenu?.id === entry.id;
          return (
            <button
              key={entry.id}
              ref={(node) => {
                if (node) itemRefs.current.set(entry.id, node);
                else itemRefs.current.delete(entry.id);
              }}
              type="button"
              role="menuitem"
              aria-haspopup={isSubmenu ? "menu" : undefined}
              aria-disabled={entry.kind === "item" && entry.disabled ? "true" : undefined}
              className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-xs border-0 bg-transparent px-2.5 text-left font-sans text-xs font-medium text-ink transition-colors duration-100 hover:bg-white/9 data-[active=true]:bg-white/9 aria-disabled:cursor-default aria-disabled:text-ink-3 aria-disabled:hover:bg-transparent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-white/40 light:hover:bg-black/8 light:data-[active=true]:bg-black/8"
              data-active={active === index || isOpen ? "true" : undefined}
              tabIndex={-1}
              onMouseEnter={(event) => {
                setActive(index);
                if (entry.kind === "submenu") {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setSubmenu({ id: entry.id, x: rect.right - SUBMENU_OVERLAP, y: rect.top - SUBMENU_OVERLAP });
                  return;
                }
                setSubmenu(null);
              }}
              onClick={() => activate(index)}
            >
              <span className="min-w-0 flex-1 overflow-hidden text-left text-ellipsis whitespace-nowrap">
                {entry.label}
              </span>
              {entry.kind === "item" && entry.shortcut && (
                <span className="ml-auto flex-none font-mono text-[11px] leading-none text-ink-2 tabular-nums">
                  {entry.shortcut}
                </span>
              )}
              {isSubmenu && (
                <span className="ml-auto flex-none text-[10px] leading-none text-ink-3" aria-hidden="true">
                  ▸
                </span>
              )}
            </button>
          );
        })}
      </div>
      {submenu &&
        entries.map((entry) => {
          if (entry.kind !== "submenu" || entry.id !== submenu.id) return null;
          return (
            <MenuPanel
              key={entry.id}
              x={submenu.x}
              y={submenu.y}
              entries={entry.items}
              label={entry.label}
              depth={depth + 1}
              onCollapse={() => {
                setSubmenu(null);
                panelRef.current?.focus();
              }}
              onCommit={onCommit}
            />
          );
        })}
    </>
  );
}

/** The desktop context menu: one root panel with optional submenu panels. */
export function DesktopMenu({ x, y, entries, onClose }: DesktopMenuProps) {
  return (
    <MenuPanel x={x} y={y} entries={entries} label="Desktop menu" depth={0} onCollapse={onClose} onCommit={onClose} />
  );
}
