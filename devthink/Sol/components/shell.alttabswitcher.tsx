/**
 * alttabswitcher.tsx — the Windows alt-tab task switcher of the Sol shell:
 * an acrylic overlay (the .acrylic Fluent surface — saturate(3) blur(20px)
 * over the rgb(43 43 43 / 88%) bed with the feTurbulence grain, 8px corners
 * and the flyout shadow) floating above the shell that shows every open
 * window as a card — the app tile, the window title and its state line —
 * in the MRU order (most recently focused first). The gesture is the
 * Windows one: the first alt+tab opens the switcher parked on the second
 * window, every further tab (or alt+arrow) steps the selection with
 * wrap-around (shift reverses), releasing Alt commits the selection (a
 * minimized window is restored, a live one is focused), Escape cancels back
 * to the pre-switch focus and Enter commits from the keyboard. The cycle
 * math lives in the pure root logic (alttab.ts); this component stays the
 * surface: it renders the cards, binds the global key listeners while
 * mounted and never touches the window state directly. The entrance is the
 * 150ms micro curve scale .97→1 (the menu entrance), skipped entirely under
 * prefers-reduced-motion by the stylesheet hard stop.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { alttabkeydown, mruorder, nextaltindex } from "../../alttab.ts";
import type { DesktopApp } from "../../appregistry.ts";
import { osText } from "../../oslabels.ts";
import { AppTile } from "./shell.apptile.tsx";

/** one card of the switcher: a shell window of the workspace */
export type AltTabCard = {
  /** the window id (the commit payload) */
  id: string;
  /** the window title (the role line of the card) */
  title: string;
  /** minimized windows restore on commit */
  minimized: boolean;
  /** the catalog app the card shows as its face */
  app: DesktopApp;
};

type AltTabSwitcherProps = {
  /** the open windows in z order (last = topmost) — the switcher walks the MRU */
  cards: AltTabCard[];
  /** commits the selection (focus or restore the window) */
  onCommit: (id: string) => void;
  /** cancels the gesture without touching the focus */
  onClose: () => void;
};

/** the switcher panel: the Fluent acrylic surface + the alt entrance */
const SWITCHER_CLASS =
  "alt-switch acrylic-panel fixed left-1/2 top-1/2 z-[70] w-[min(680px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 rounded-md p-2";

/** one card row: 44px+ hit, the wash on hover and the lit selection */
const CARD_CLASS =
  "alt-card flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xs border-0 bg-transparent px-3 py-1.5 text-left font-sans text-xs font-medium text-ink transition-colors duration-150 ease-entry hover:bg-white/8 data-[active=true]:bg-white/12 data-[active=true]:outline data-[active=true]:outline-1 data-[active=true]:-outline-offset-1 data-[active=true]:outline-white/35 light:hover:bg-black/8 light:data-[active=true]:bg-black/12";

export function AltTabSwitcher({ cards, onCommit, onClose }: AltTabSwitcherProps) {
  /** the walk order: the reversed z order (most recently focused first) */
  const order = useMemo(() => mruorder(cards.map((card) => card.id)), [cards]);
  const byId = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);
  /** the first alt+tab parks on the window behind the topmost one */
  const [selected, setSelected] = useState(() => (order.length > 1 ? 1 : 0));
  const selectedRef = useRef(selected);

  const step = useCallback(
    (delta: number) => {
      const next = nextaltindex(selectedRef.current, delta, order.length);
      selectedRef.current = next;
      setSelected(next);
    },
    [order.length],
  );

  const commit = useCallback(() => {
    const id = order[selectedRef.current];
    if (id) onCommit(id);
    else onClose();
  }, [onClose, onCommit, order]);

  // the switcher owns the keyboard while mounted: alt+tab and alt+arrows
  // step the selection, Enter commits, Escape cancels and the Alt release
  // commits (the Windows gesture end)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (alttabkeydown(event)) {
        event.preventDefault();
        if (event.key === "Tab") step(event.shiftKey ? -1 : 1);
        else if (event.key === "ArrowRight" || event.key === "ArrowDown") step(1);
        else step(-1);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        commit();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== "Alt") return;
      event.preventDefault();
      commit();
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKeyUp, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, [commit, onClose, step]);

  const activeId = order[selected];

  return createPortal(
    <div
      className="alt-scrim fixed inset-0 z-[70] grid place-items-center"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className={SWITCHER_CLASS} role="dialog" aria-label={osText("alttab.dialog.aria")}>
        <div
          className="grid grid-cols-[repeat(auto-fill,minmax(184px,1fr))] gap-1"
          role="listbox"
          aria-label={osText("alttab.list.aria")}
          aria-activedescendant={activeId ? `alt-card-${activeId}` : undefined}
          tabIndex={0}
        >
          {order.map((id) => {
            const card = byId.get(id);
            if (!card) return null;
            return (
              <button
                key={id}
                id={`alt-card-${id}`}
                type="button"
                role="option"
                aria-selected={id === activeId}
                data-active={id === activeId ? "true" : undefined}
                className={CARD_CLASS}
                onPointerEnter={() => {
                  const index = order.indexOf(id);
                  if (index < 0) return;
                  selectedRef.current = index;
                  setSelected(index);
                }}
                onClick={commit}
              >
                <AppTile app={card.app} size={26} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">{card.title}</span>
                  <span className="font-mono text-[9px] font-semibold tracking-[0.08em] lowercase text-ink-3">
                    {card.minimized ? osText("alttab.state.minimized") : osText("alttab.state.open")}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>,
    document.body,
  );
}
