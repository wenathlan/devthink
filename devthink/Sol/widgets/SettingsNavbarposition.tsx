/**
 * navbarposition.tsx — the navbar card of the Personalization page: the
 * two axes of the bar as windows segmented controls — the POSITION (the
 * floating bottom bar — the default, a vertical rail docked to the left
 * edge or one docked to the right edge) and the STYLE (the face the bar
 * wears: the windows taskbar — the full-width acrylic bar — or the apple
 * dock — the centered floating mica pad with the magnifying pins). Both
 * choices persist through the house localStorage pattern (desktopstate.ts
 * owns the accessors) and the component dispatches the NAVBAR_POS_EVENT
 * and NAVBAR_STYLE_EVENT the shell chrome listens for, so the bar
 * re-docks and re-faces the moment a choice lands — every button and
 * flyout keeps working. Loose component of the settings page, riding the
 * dtw kit.
 */
import { useState } from "react";
import { copy } from "../../copy";
import {
  loadNavbarPosition,
  loadNavbarStyle,
  NAVBAR_POS_EVENT,
  NAVBAR_STYLE_EVENT,
  type NavbarPosition,
  type NavbarStyle,
  saveNavbarPosition,
  saveNavbarStyle,
} from "../../desktopstate";

/** the three dock positions the segmented control offers. */
const POSITIONS: readonly NavbarPosition[] = ["floating", "left", "right"];

/** the two faces the style control offers. */
const STYLES: readonly NavbarStyle[] = ["windows", "apple"];

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

/** NavbarStyleControl — the segmented control of the Navbar style card:
 * the windows taskbar or the apple dock, the face the bar wears. */
export function NavbarStyleControl() {
  const [style, setStyle] = useState<NavbarStyle>(() => loadNavbarStyle());

  function choose(next: NavbarStyle) {
    setStyle(next);
    saveNavbarStyle(next);
    window.dispatchEvent(new CustomEvent<NavbarStyle>(NAVBAR_STYLE_EVENT, { detail: next }));
  }

  return (
    <div className="dtw-settings__segmented" role="radiogroup" aria-label={copy("settings.personal.navbarstyle")}>
      {STYLES.map((option) => {
        const selected = option === style;
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
