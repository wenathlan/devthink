/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the theme. The root manages the themes as single files: it
 * imports only the theme anchor (Sol/Sol.tsx — the file named after the theme
 * folder, beside Sol/sol.css) and the theme stylesheet, wraps the anchor in
 * the global concerns it owns (the error boundary, the toaster, the devtools
 * shield and the wouter router provider) and renders it. The whole route tree
 * lives behind the theme anchor; no page or component of the theme is ever
 * imported here.
 */

import { ArrowClockwiseRegular, WarningRegular } from "@fluentui/react-icons";
import { Component, type ReactNode, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { Router as WouterRouter } from "wouter";
import { installdevtoolsguard, ondevtoolstrip, showdevtoolsinterstitial } from "./devtoolsguard.ts";
import { guardStatus, reportguardstrike } from "./guard.ts";
import { seedLabels } from "./labels.ts";
import Sol from "./Sol/Sol.tsx";
import { loadDevtoolsWall } from "./Sol/wingets/SettingsPersonalstore.ts";
import installzoomlock from "./zoomlock.ts";
import "./Sol/sol.css";

// the zoom lock arms before the first render: the interface boots pinned at 100%
if (typeof window !== "undefined") installzoomlock();

// the label seed rides the boot: the manifest ingests into the store and the
// translation overrides load before the surfaces read their copy
if (typeof window !== "undefined") void seedLabels().catch(() => {});

class WorkbenchErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <main className="workbench-failure" role="alert">
        <WarningRegular fontSize={34} aria-hidden="true" />
        <p>DevThink could not render this workspace frame.</p>
        <pre>{error.stack}</pre>
        <button type="button" onClick={() => window.location.reload()}>
          <ArrowClockwiseRegular fontSize={14} aria-hidden="true" />
          reload local workbench
        </button>
      </main>
    );
  }
}

/** The router base derives from the declared base path so the same build serves every host.
 * Under relative hosting ("./") the build cannot know the folder it lands in, but the
 * dispatcher always boots cold links at the application root first — so the folder
 * prefix of the boot pathname is exactly the router base. Under absolute root hosting
 * ("/") the routes live at the root itself: the boot pathname is a route, never a
 * folder prefix, and the base stays empty (a deep /auth link must open the auth page,
 * not the intro under a phantom base). */
function routerBase(): string {
  const declaredBase = import.meta.env.BASE_URL;
  if (declaredBase !== "/" && declaredBase !== "./") return declaredBase.replace(/\/$/, "");
  if (declaredBase === "./") {
    const bootPath = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
    return bootPath === "" ? "" : bootPath;
  }
  return "";
}

/** The devtools wall strike hook: one registration per module life (the
 * hot reload replaces the listener, never stacks them) — the wall trips,
 * the strike report rides the site api. */
let wallstrikehook: (() => void) | null = null;

/** Arms the devtools wall once per module life: the wall is OPT-IN (the
 * stored owner switch reads before the arm — default off, the false
 * positive era dies) and production builds only arm when the switch says
 * on; the personalization channel stays the only writer of the choice. */
function armdevtoolswall(): void {
  if (wallstrikehook) wallstrikehook();
  wallstrikehook = ondevtoolstrip((signal) => {
    void reportguardstrike(signal);
  });
  installdevtoolsguard(loadDevtoolsWall() ? undefined : { suspend: true });
}

/** The toaster follows the os theme ladder (the owner law: every surface,
 * the toasts beside, wears the same light or dark the system wears). The
 * data-theme attribute is the truth the personalization channel paints; the
 * subscription watches its mutations so a theme flip re-skins the toasts of
 * the live session without a reload. */
const themesubscribe = (notify: () => void): (() => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
const themetheme = (): "light" | "dark" => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
const themeserver = (): "light" | "dark" => "light";

function App() {
  // the devtools wall answers the stored owner switch: the boot reads the
  // choice before the arm (default off — the interstitial only ever stands
  // on the debugger trap of an explicitly armed wall or a server ban)
  void guardStatus().then((banned) => {
    if (banned) showdevtoolsinterstitial();
  });
  armdevtoolswall();
  const toastertheme = useSyncExternalStore(themesubscribe, themetheme, themeserver);
  return (
    <WorkbenchErrorBoundary>
      <Toaster richColors theme={toastertheme} />
      <WouterRouter base={routerBase()}>
        <Sol />
      </WouterRouter>
    </WorkbenchErrorBoundary>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("DevThink root element is missing.");

/* HMR re-executes this module on hot updates: reuse the live root instead of
 * re-creating one on the same container (React throws on the second
 * createRoot call and the workbench would blank out after every edit). */
type RootHost = HTMLElement & { __dtroot?: ReturnType<typeof createRoot> };
const host = root as RootHost;
const tree = host.__dtroot ?? createRoot(root);
host.__dtroot = tree;
tree.render(<App />);

export default App;
