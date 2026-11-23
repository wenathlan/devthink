/**
 * App.tsx — the root anchor of the getry Sol theme (layer 1 of the anchor
 * architecture) and the only TSX outside the theme: one static react mount,
 * one error boundary and the wouter router provider around the theme anchor.
 * The root imports only the theme anchor (sol/Sol.tsx — the file named after
 * the theme folder, beside sol/sol.css) and the theme stylesheet; the whole
 * route tree lives behind the anchor. data reaches the pages from the root
 * gateway logics (typed DB accessors over HTTPS with the in-memory seed
 * fallback); the visitor machine only loads the interface.
 */

import { ArrowCounterclockwiseRegular as RotateCcw, WarningRegular as AlertTriangle } from "@fluentui/react-icons";
import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Router as WouterRouter } from "wouter";
import { label, seedLabels } from "./labels";
import Sol from "./sol/Sol";
import { Toaster } from "./sol/toast/Toast.tsx";
import { applyTheme } from "./theme";
/* the studio type triad (interface 18): Bricolage Grotesque Variable rides the
 * display seats, Outfit Variable the body, JetBrains Mono Variable the
 * micro-labels and the numbers — Inter Variable and Geist Mono Variable stay
 * the offline fallbacks of the two prose seats (the entry carries the same
 * triad from Google Fonts; whichever lane answers first wins) */
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/outfit";
import "./sol/sol.css";

import { routerBase } from "./routerbase.ts";
// the copy law rides the boot: the seed refreshes the label store rows
// (translated rows protected) before the first paint answers
if (typeof window !== "undefined") void seedLabels().catch(() => {});

/* the zoom lock law (the faun pattern the owner pinned in the reference):
   the viewport meta rides every html entry and pins the touch door, but the
   desktop page zoom never reads the meta — the browser scales the whole
   document on the ctrl wheel (and the trackpad pinch reports itself as one),
   and the studio breaks. the studio answers at its own door: one capture
   listener eats the default of every ctrl wheel before the browser owns it.
   the guard never steals a gesture the app serves: the composer sliders ride
   the plain wheel on their own elements — a plain wheel stays a scroll, the
   propagation never stops for the widgets above, and no surface listens for
   the ctrl wheel. the window flag arms once per page: the hot reload
   re-executes this module and never stacks a second listener */
type ZoomLockHost = Window & { __getryzoomlock?: boolean };
const zoomlockhost = (typeof window === "undefined" ? undefined : (window as ZoomLockHost));
if (zoomlockhost && !zoomlockhost.__getryzoomlock) {
  zoomlockhost.__getryzoomlock = true;
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
  /* the theme starts LIGHT on every load (the design pass law: the reference
   * desktop is the light face, wallpaper + window) — still no storage, no
   * visitor writes; the rail toggle keeps the dark face one press away. */
  applyTheme("light");
  return (
    <ThemeErrorBoundary>
      <Toaster />
      <WouterRouter base={routerBase("getry")}>
        <Sol />
      </WouterRouter>
    </ThemeErrorBoundary>
  );
}


const root = document.getElementById("root");
if (!root) throw new Error("getry root element is missing.");
createRoot(root).render(<App />);

export default App;
