/**
 * navbarposition.tsx — the navbar card of the Personalization page: the two
 * modes of the bar as windows segmented controls — the MODE (floating: the
 * detached rounded pad the magnifying dock rides; docked: the bar pinned to
 * one screen edge) and the EDGE the docked bar hugs (the bottom taskbar, a
 * left rail or a right rail). Both choices persist on the system store —
 * the account-scoped preference lane of desktopstate.ts (never a browser
 * localStorage key of this build) — and the component dispatches the
 * NAVBAR_MODE_EVENT and NAVBAR_EDGE_EVENT the shell chrome listens for, so
 * the bar re-faces and re-docks the moment a choice lands — every button
 * and flyout keeps working. The edge control locks while the bar floats
 * (the edge answers the docked mode): the segments ride the windows
 * disabled grammar with the hint naming the law, and the lock follows the
 * mode choice live through the same event. Every string rides the ui store
 * (the uicopy accessor of uistore.ts — no literal lives here). Loose
 * component of the settings page, riding the dtw kit.
 */
import { useEffect, useState } from "react";
import {
  loadNavbarEdge,
  loadNavbarMode,
  NAVBAR_EDGE_EVENT,
  NAVBAR_MODE_EVENT,
  type NavbarEdge,
  type NavbarMode,
  saveNavbarEdge,
  saveNavbarMode,
} from "../../desktopstate";
import { uicopy, useUicopy } from "../../uistore.ts";

/** the two modes the mode control offers. */
const MODES: readonly NavbarMode[] = ["floating", "docked"];

/** the three edges the edge control offers. */
const EDGES: readonly NavbarEdge[] = ["bottom", "left", "right"];

/** NavbarModeControl — the segmented control of the navbar mode card:
 * floating or docked, the two faces of the shell bar. */
export function NavbarModeControl() {
  // the store ride: the live db rows land once per mount and the card
  // re-renders on them (the seeds answer the first paint with the same
  // words the db serves, so the swap never flashes)
  useUicopy();
  const [mode, setMode] = useState<NavbarMode>(() => "floating");

  // the store answers after mount (the account preference lane is async)
  useEffect(() => {
    let alive = true;
    void loadNavbarMode().then((stored) => {
      if (alive) setMode(stored);
    });
    return () => {
      alive = false;
    };
  }, []);

  // the drag gestures of the bar land live through the same event the
  // chrome plays — the card mirrors the bar the moment a drag moves it
  useEffect(() => {
    const onNavbarMode = (event: Event) => {
      const detail = (event as CustomEvent<NavbarMode>).detail;
      if (detail === "floating" || detail === "docked") setMode(detail);
    };
    window.addEventListener(NAVBAR_MODE_EVENT, onNavbarMode);
    return () => window.removeEventListener(NAVBAR_MODE_EVENT, onNavbarMode);
  }, []);

  function choose(next: NavbarMode) {
    setMode(next);
    saveNavbarMode(next);
    window.dispatchEvent(new CustomEvent<NavbarMode>(NAVBAR_MODE_EVENT, { detail: next }));
  }

  return (
    <div className="dtw-settings__segmented" role="radiogroup" aria-label={uicopy("navbar.mode.aria")}>
      {MODES.map((option) => {
        const selected = option === mode;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            className="dtw-settings__segment"
            data-selected={selected ? "true" : undefined}
            onClick={() => choose(option)}
          >
            {uicopy(`navbar.mode.${option}`)}
          </button>
        );
      })}
    </div>
  );
}

/** NavbarEdgeControl — the segmented control of the dock edge card: the
 * bottom taskbar, a left rail or a right rail. The control locks while the
 * bar floats — the edge answers the docked mode — and the stored choice
 * survives (the dock answers it the moment the bar docks again). */
export function NavbarEdgeControl() {
  const [edge, setEdge] = useState<NavbarEdge>(() => "bottom");
  const [locked, setLocked] = useState<boolean>(() => true);

  // the store answers after mount, and the lock follows the mode choice
  // live (the same event the shell chrome re-faces on)
  useEffect(() => {
    let alive = true;
    void loadNavbarEdge().then((stored) => {
      if (alive) setEdge(stored);
    });
    void loadNavbarMode().then((stored) => {
      if (alive) setLocked(stored !== "docked");
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    const onNavbarMode = (event: Event) => {
      const detail = (event as CustomEvent<NavbarMode>).detail;
      if (detail === "floating" || detail === "docked") setLocked(detail !== "docked");
    };
    window.addEventListener(NAVBAR_MODE_EVENT, onNavbarMode);
    return () => window.removeEventListener(NAVBAR_MODE_EVENT, onNavbarMode);
  }, []);

  function choose(next: NavbarEdge) {
    setEdge(next);
    saveNavbarEdge(next);
    window.dispatchEvent(new CustomEvent<NavbarEdge>(NAVBAR_EDGE_EVENT, { detail: next }));
  }

  return (
    <div className="dtw-settings__control">
      <div className="dtw-settings__segmented" role="radiogroup" aria-label={uicopy("navbar.edge.aria")}>
        {EDGES.map((option) => {
          const selected = option === edge;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              className="dtw-settings__segment"
              data-selected={selected ? "true" : undefined}
              disabled={locked}
              aria-disabled={locked ? "true" : undefined}
              onClick={() => choose(option)}
            >
              {uicopy(`navbar.edge.${option}`)}
            </button>
          );
        })}
      </div>
      {locked ? <p className="dtw-settings__hint">{uicopy("navbar.edge.locked")}</p> : null}
    </div>
  );
}
