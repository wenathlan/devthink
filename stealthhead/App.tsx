/**
 * App.tsx — the root anchor of the stealthhead Sol theme (layer 1 of the
 * anchor architecture) and the only TSX outside the theme: one static react
 * mount, one error boundary and the wouter router provider around the theme
 * anchor. The root imports only the theme anchor (Sol/Sol.tsx — the file
 * named after the theme folder, beside Sol/sol.css) and the theme
 * stylesheet; the whole route tree lives behind the anchor. data reaches the
 * pages from the root game logics (typed DB accessors over HTTPS with the
 * in-memory seed fallback); the visitor machine only loads the interface.
 */
import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Router as WouterRouter } from "wouter";
import { Toaster } from "./Sol/toast/Toast";
import { applyTheme } from "./theme";
import Sol from "./Sol/Sol";
import "./Sol/sol.css";

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
        <AlertTriangle size={34} />
        <p>stealthhead could not render this frame.</p>
        <pre>{error.stack}</pre>
        <button type="button" onClick={() => window.location.reload()}>
          <RotateCcw size={14} />
          reload the interface
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

/** The router base derives from the declared base path so the same build serves every host. */
function routerBase(): string {
  const declaredBase = import.meta.env.BASE_URL;
  if (declaredBase !== "/" && declaredBase !== "./") return declaredBase.replace(/\/$/, "");
  const bootPath = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
  return bootPath === "" ? "" : bootPath;
}

const root = document.getElementById("root");
if (!root) throw new Error("stealthhead root element is missing.");
createRoot(root).render(<App />);

export default App;
