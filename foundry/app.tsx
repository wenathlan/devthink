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

/* the zoom lock law (the faun pattern the owner pinned in the reference):
   the viewport meta rides every html entry and pins the touch door, but the
   desktop page zoom never reads the meta — the browser scales the whole
   document on the ctrl wheel (and the trackpad pinch reports itself as one),
   and the console breaks. the foundry answers at its own door: one capture
   listener eats the default of every ctrl wheel before the browser owns it.
   no surface of the runner rides the browser zoom — the sandbox tables and
   the image lists scroll, nothing listens for the ctrl wheel — so the guard
   never steals a gesture the app serves: a plain wheel stays a scroll, the
   propagation never stops for the widgets above. the window flag arms once
   per page: the hot reload re-executes this module and never stacks a
   second listener */
type ZoomLockHost = Window & { __foundryzoomlock?: boolean };
const zoomlockhost = (typeof window === "undefined" ? undefined : (window as ZoomLockHost));
if (zoomlockhost && !zoomlockhost.__foundryzoomlock) {
  zoomlockhost.__foundryzoomlock = true;
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
  "/manifest",
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
  const segments = path.replace(/^\/+/, "").replace(/\/+$/, "").split("/").filter(Boolean);
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
