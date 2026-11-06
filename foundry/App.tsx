/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the foundry theme. The foundry is the runner clone of the
 * family: it stores and executes together — the vault storage layer beside
 * the forge runtime layer in one deployable unit. The root manages the
 * themes as single files: it imports only the theme anchor (sol/Sol.tsx —
 * the file named after the theme folder, beside sol/sol.css) and the theme
 * stylesheet, wraps the anchor in the error boundary and the wouter router
 * provider (the base rides the build declaration, never the runtime path)
 * and mounts on #root. Every page and component lives behind the anchor
 * chain (App → Sol → the page anchors → the loose components); nothing is
 * imported directly.
 */
import { ArrowCounterclockwiseRegular as RotateCcw, WarningRegular as AlertTriangle } from "@fluentui/react-icons";
import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Router as WouterRouter } from "wouter";
import { label, seedLabels } from "./labels";
import Sol from "./sol/Sol";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/inter";
import "./sol/sol.css";

// the copy law rides the boot: the seed refreshes the label store rows
// (translated rows protected) before the first paint answers
if (typeof window !== "undefined") void seedLabels().catch(() => {});

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
        <button type="button" onClick={() => window.location.reload()}>
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
  "/sandboxes",
  "/images",
  "/artifacts",
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

function App() {
  return (
    <ThemeErrorBoundary>
      <WouterRouter base={routerBase()}>
        <Sol />
      </WouterRouter>
    </ThemeErrorBoundary>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("foundry root element is missing.");
createRoot(root).render(<App />);

export default App;
