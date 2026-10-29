/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the theme. The root manages the themes as single files: it
 * imports only the theme anchor (Sol/Sol.tsx — the file named after the theme
 * folder, beside Sol/sol.css) and the theme stylesheet, wraps the anchor in
 * the global concerns it owns (the error boundary, the toast provider, the
 * clean-url and reveal boot, and the wouter router provider) and renders it.
 * The whole route tree lives behind the theme anchor; no page or component of
 * the theme is ever imported here.
 */

import { ArrowCounterclockwiseRegular as RotateCcw, WarningRegular as AlertTriangle } from "@fluentui/react-icons";
import { Component, type ReactNode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Router as WouterRouter } from "wouter";
import { applyNow, syncCanonical } from "./cleanurl.ts";
import { label, seedLabels } from "./labels.ts";
import { initReveal } from "./reveal.ts";
import Sol from "./Sol/Sol.tsx";
import { ToastProvider } from "./Sol/toast/Toast.tsx";
import { initTheme } from "./theme.ts";
import "./Sol/sol.css";

// the copy law rides the boot: the seed refreshes the label store rows
// (translated rows protected) before the first paint answers
if (typeof window !== "undefined") void seedLabels().catch(() => {});

initTheme();

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

/** the route segments the theme answers to — the mount prefix of a deploy
 * unit is whatever precedes the first one of these in the boot path. */
const KNOWN_ROUTES: readonly string[] = [
  "/intro",
  "/onboarding",
  "/studio",
  "/generate",
  "/ingest",
  "/library",
  "/settings",
  "/404",
];

function routerBase(): string {
  const declaredBase = import.meta.env.BASE_URL;
  // the build-time base wins (the pages workflow mounts every app at /<slug>/)
  if (declaredBase !== "/" && declaredBase !== "./") return declaredBase.replace(/\/$/, "");
  const path = window.location.pathname.replace(/index\.html$/, "");
  // a known route at the root means the app is mounted at "/" — no base
  if (KNOWN_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))) return "";
  // otherwise the mount prefix is everything before the first known segment
  // (the preview/static hosting case: the deep link still lands on its page)
  for (const route of KNOWN_ROUTES) {
    const at = path.indexOf(route);
    if (at > 0) return path.slice(0, at).replace(/\/$/, "");
  }
  return "";
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
        <WouterRouter base={routerBase()}>
          <Sol />
        </WouterRouter>
      </ToastProvider>
    </ThemeErrorBoundary>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("debonair root element is missing.");
createRoot(root).render(<App />);

export default App;
