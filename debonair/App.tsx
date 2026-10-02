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
import { Component, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Router as WouterRouter } from "wouter";
import Sol from "./Sol/Sol";
import { ToastProvider } from "./Sol/toast/Toast";
import { initReveal } from "./reveal";
import { applyNow, syncCanonical } from "./clean.url";
import { initTheme } from "./theme";
import "./Sol/sol.css";

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
      <main className="workbench-failure" role="alert" style={{ padding: "48px 24px", maxWidth: 720, margin: "0 auto" }}>
        <AlertTriangle size={34} />
        <p>debonair could not render this page frame.</p>
        <pre>{error.stack}</pre>
        <button type="button" className="btn secondary" onClick={() => window.location.reload()}>
          <RotateCcw size={14} />
          reload the page
        </button>
      </main>
    );
  }
}

function routerBase(): string {
  const declaredBase = import.meta.env.BASE_URL;
  return declaredBase === "/" || declaredBase === "./" ? "" : declaredBase.replace(/\/$/, "");
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
