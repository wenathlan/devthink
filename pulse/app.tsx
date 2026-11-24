/**
 * app.tsx — the root anchor of the pulse Sol theme (layer 1 of the anchor
 * architecture) and the only TSX outside the theme: one static react mount,
 * one error boundary and the theme anchor. pulse is the twelfth module of
 * the wenathlan family — the open VOICE-FIRST SOCIAL STUDIO, the single
 * owner of the 24/7 social automation and channel management lane (X,
 * Instagram through the official Graph API with automatic token renewal,
 * Facebook and YouTube), operable by humans and agent swarms on the family
 * VMs, consuming getry, saddle, cadria, debonair, vault and cobaia through
 * the family package union (package.json) — never through a surface import
 * while the studio is in construction. The root imports only the theme
 * anchor (sol/Sol.tsx — the file named after the theme folder, beside
 * sol/sol.css) and the theme stylesheet; the whole surface lives behind the
 * anchor. The owner's law rides the boot the stealthhead precedent pinned:
 * the studio is in construction — clean everything, leave ONE component
 * saying "studio in construction" — so the mounted surface is the
 * under-construction face alone: no routes, no studio pages, no shell
 * chrome, no entry flow, zero invented automation logic and zero false
 * metrics. The channel automation, the static mission distribution without
 * collision (digital stigmergy with the MERGE_FEATURE versus CREATE_NEW_APP
 * anti-duplication filter), the viralization engineering and the 24h cut
 * channels stay unplanned on the surface until the day the studio wakes up.
 */

import { WarningRegular as AlertTriangle, ArrowCounterclockwiseRegular as RotateCcw } from "@fluentui/react-icons";
import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { label, seedlabels } from "./labels";
import Sol from "./sol/Sol";
import { applyTheme } from "./theme";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/inter";
import "./sol/sol.css";

// the copy law rides the boot: the seed refreshes the label store rows from
// the manifest (the browser cache mirrors the site db rows) before the theme
// renders — best effort, the manifest always answers the widgets.
if (typeof window !== "undefined") void seedlabels().catch(() => {});

/* the zoom lock law (the faun pattern the owner pinned in the reference,
   seated family-wide on the ten siblings before pulse): the viewport meta
   rides every html entry and pins the touch door, but the desktop page zoom
   never reads the meta — the browser scales the whole document on the ctrl
   wheel (and the trackpad pinch reports itself as one), and the face
   breaks. the under-construction face answers at its own door: one capture
   listener eats the default of every ctrl wheel before the browser owns
   it. the surface is the one component the owner's law left — no routes, no
   shell chrome, nothing listens for the ctrl wheel — so the guard never
   steals a gesture the app serves: a plain wheel stays a scroll, the
   propagation never stops for the widgets above. the window flag arms once
   per page: the hot reload re-executes this module and never stacks a
   second listener */
type ZoomLockHost = Window & { __pulsezoomlock?: boolean };
const zoomlockhost = (typeof window === "undefined" ? undefined : (window as ZoomLockHost));
if (zoomlockhost && !zoomlockhost.__pulsezoomlock) {
  zoomlockhost.__pulsezoomlock = true;
  zoomlockhost.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) event.preventDefault();
    },
    { passive: false, capture: true },
  );
}

/** the error boundary of the theme: one panel, one reload action. */
class ThemeErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <main className="failure" role="alert">
        <AlertTriangle fontSize={34} />
        <p>{label("app.boundary.body")}</p>
        <pre>{error.stack}</pre>
        <button type="button" onClick={() => window.location.reload()}>
          <RotateCcw fontSize={14} />
          {label("app.boundary.reload")}
        </button>
      </main>
    );
  }
}

function App() {
  /* the theme starts dark on every load: no storage, no visitor writes. */
  applyTheme("dark");
  return (
    <ThemeErrorBoundary>
      <Sol />
    </ThemeErrorBoundary>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("pulse root element is missing.");
createRoot(root).render(<App />);

export default App;
