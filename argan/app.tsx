/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the theme. The root manages the themes as single files: it
 * imports only the theme anchor (sol/Sol.tsx — the file named after the theme
 * folder, beside sol/sol.css) and the theme stylesheet, wraps the anchor in
 * the global concerns it owns (the error boundary, the toast provider, the
 * clean-url and reveal boot, and the wouter router provider) and renders it.
 * The whole route tree lives behind the theme anchor; no page or component of
 * the theme is ever imported here.
 */

import { ArrowCounterclockwiseRegular as RotateCcw, WarningRegular as AlertTriangle } from "@fluentui/react-icons";
import { Component, type ReactNode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Router as WouterRouter } from "wouter";
import { applyNow, syncCanonical } from "./dns";
import { label, seedLabels } from "./labels";
import { initReveal } from "./reveal";
import Sol from "./sol/Sol";
import { ToastProvider } from "./sol/toast/Toast";
import { initTheme } from "./theme";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/inter";
import "./sol/sol.css";

import { routerBase } from "./routerbase.ts";
// the copy law rides the boot: the seed refreshes the label store rows
// (translated rows protected) before the first paint answers
if (typeof window !== "undefined") void seedLabels().catch(() => {});

initTheme();

/* the zoom lock law (the faun pattern the owner pinned in the reference):
   the viewport meta rides every html entry and pins the touch door, but the
   desktop page zoom never reads the meta — the browser scales the whole
   document on the ctrl wheel (and the trackpad pinch reports itself as one),
   and the zone tables break. the resolver answers at its own door: one
   capture listener eats the default of every ctrl wheel before the browser
   owns it. no surface of the resolver rides the browser zoom — the zone
   tables and the dnssec panels scroll, nothing listens for the ctrl wheel —
   so the guard never steals a gesture the app serves: a plain wheel stays a
   scroll, the propagation never stops for the widgets above. the window
   flag arms once per page: the hot reload re-executes this module and never
   stacks a second listener */
type ZoomLockHost = Window & { __arganzoomlock?: boolean };
const zoomlockhost = (typeof window === "undefined" ? undefined : (window as ZoomLockHost));
if (zoomlockhost && !zoomlockhost.__arganzoomlock) {
  zoomlockhost.__arganzoomlock = true;
  zoomlockhost.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) event.preventDefault();
    },
    { passive: false, capture: true },
  );
}

class ThemeErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <main
        className="workbench-failure"
        role="alert"
        style={{ padding: "48px 24px", maxWidth: 720, margin: "0 auto" }}
      >
        <AlertTriangle fontSize={34} />
        <p>{label("app.boundary.body")}</p>
        <pre>{error.stack}</pre>
        <button type="button" className="btn secondary" onClick={() => window.location.reload()}>
          <RotateCcw fontSize={14} />
          {label("app.boundary.reload")}
        </button>
      </main>
    );
  }
}


function App() {
  useEffect(() => {
    initReveal();
    applyNow();
    syncCanonical();
    const onPop = (): void => {
      applyNow();
      syncCanonical();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <ThemeErrorBoundary>
      <ToastProvider>
        <WouterRouter base={routerBase("argan")}>
          <Sol />
        </WouterRouter>
      </ToastProvider>
    </ThemeErrorBoundary>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("argan root element is missing.");
createRoot(root).render(<App />);

export default App;
