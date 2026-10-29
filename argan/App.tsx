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
import { applyNow, syncCanonical } from "./cleanurl";
import { label, seedLabels } from "./labels";
import { initReveal } from "./reveal";
import Sol from "./Sol/Sol";
import { ToastProvider } from "./Sol/toast/Toast";
import { initTheme } from "./theme";
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

function routerBase(): string {
  const declaredBase = import.meta.env.BASE_URL;
  if (declaredBase !== "/" && declaredBase !== "./") return declaredBase.replace(/\/$/, "");
  const bootPath = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
  return bootPath === "" ? "" : bootPath;
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
if (!root) throw new Error("argan root element is missing.");
createRoot(root).render(<App />);

export default App;
