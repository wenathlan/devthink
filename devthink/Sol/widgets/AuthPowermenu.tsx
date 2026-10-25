/**
 * powermenu.tsx — the power corner of the auth sequence: the bottom right
 * glyph with its acrylic flyout, in the Windows position on both faces
 * (the lock and the sign-in). Loose component of the auth page, riding
 * the dtw-login kit of sol.css.
 */
import { PowerRegular } from "@fluentui/react-icons";
import { useState } from "react";

/** PowerMenu — the power corner. Self-contained: the flyout open state
 * dies with the mount; the restart hands the page back to the browser. */
export function PowerMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="dtw-login__powerwrap">
      <button
        type="button"
        className="dtw-login__power"
        aria-label="Power"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <PowerRegular fontSize={18} aria-hidden="true" />
      </button>
      {open ? (
        <div className="dtw-login__powermenu" role="menu" aria-label="Power options">
          <button type="button" role="menuitem" onClick={() => window.location.reload()}>
            Restart the session
          </button>
        </div>
      ) : null}
    </div>
  );
}
