/**
 * navbarposition.tsx — the navbar position card of the Personalization
 * page: the queued taskbar feature as a windows segmented control — the
 * floating bottom bar (the default), a vertical rail docked to the left
 * edge or one docked to the right edge. The choice persists through the
 * house localStorage pattern (desktopstate.ts owns the accessor) and the
 * component dispatches the NAVBAR_POS_EVENT the shell chrome listens for,
 * so the taskbar re-docks the moment the choice lands — every button and
 * flyout keeps working. Loose component of the settings page, riding the
 * dtw kit.
 */
import { useState } from "react";
import { copy } from "../../copy";
import { loadNavbarPosition, NAVBAR_POS_EVENT, type NavbarPosition, saveNavbarPosition } from "../../desktopstate";

/** the three dock positions the segmented control offers. */
const POSITIONS: readonly NavbarPosition[] = ["floating", "left", "right"];

/** NavbarPositionControl — the segmented control of the Navbar position card. */
export function NavbarPositionControl() {
  const [position, setPosition] = useState<NavbarPosition>(() => loadNavbarPosition());

  function choose(next: NavbarPosition) {
    setPosition(next);
    saveNavbarPosition(next);
    window.dispatchEvent(new CustomEvent<NavbarPosition>(NAVBAR_POS_EVENT, { detail: next }));
  }

  return (
    <div className="dtw-settings__segmented" role="radiogroup" aria-label={copy("settings.personal.navbar")}>
      {POSITIONS.map((option) => {
        const selected = option === position;
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
            {copy(`settings.navbar.${option}`)}
          </button>
        );
      })}
    </div>
  );
}
