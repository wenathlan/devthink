/**
 * App.tsx — the root anchor of the stealthhead Sol theme (layer 1 of the
 * anchor architecture) and the only TSX outside the theme: one static react
 * mount, one error boundary and the wouter router provider around the theme
 * anchor. The root imports only the theme anchor (sol/Sol.tsx — the file
 * named after the theme folder, beside sol/sol.css) and the theme
 * stylesheet; the whole route tree lives behind the anchor. data reaches the
 * pages from the root game logics (typed DB accessors over HTTPS with the
 * in-memory seed fallback); the visitor machine only loads the interface.
 */

import { WarningRegular as AlertTriangle, ArrowCounterclockwiseRegular as RotateCcw } from "@fluentui/react-icons";
import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Router as WouterRouter } from "wouter";
import Sol from "./sol/Sol";
import { Toaster } from "./sol/toast/Toast.tsx";
import { applyTheme } from "./theme";
import { label, seedlabels } from "./labels";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/inter";
import "./sol/sol.css";

// the copy law rides the boot: the seed refreshes the label store rows from
// the manifest (the browser cache mirrors the site db rows) before the theme
// renders — best effort, the manifest always answers the wingets.
if (typeof window !== "undefined") void seedlabels().catch(() => {});

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
      <Toaster />
      <WouterRouter base={routerBase()}>
        <Sol />
      </WouterRouter>
    </ThemeErrorBoundary>
  );
}

/** the route segments the theme answers to — the mount prefix of a deploy
 * unit is whatever precedes the first one of these in the boot path. */
const KNOWN_ROUTES: readonly string[] = [
  "/intro",
  "/onboarding",
  "/match",
  "/ranking",
  "/weapons",
  "/world",
  "/404",
];

function routerBase(): string {
  const declaredBase = import.meta.env.BASE_URL;
  // the build-time base wins (the pages workflow mounts every app at /<slug>/)
  if (declaredBase !== "/" && declaredBase !== "./") return declaredBase.replace(/\/$/, "");
  const path = window.location.pathname.replace(/index\.html$/, "");
  // a known route at the root means the app is mounted at "/" — no base
  if (KNOWN_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))) return "";
  // a lone first segment that is no known route is a mount prefix (the
  // power clip and the family stage serve this app under its slug)
  const segments = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  if (segments.length === 1) return `/${segments[0]}`;
  // otherwise the mount prefix is whatever precedes the first known segment
  // (the static hosting case: the deep link still lands on its page)
  for (const route of KNOWN_ROUTES) {
    const at = path.indexOf(route);
    if (at > 0) return path.slice(0, at).replace(/\/$/, "");
  }
  return "";
}

const root = document.getElementById("root");
if (!root) throw new Error("stealthhead root element is missing.");
createRoot(root).render(<App />);

export default App;
