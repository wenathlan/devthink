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
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/inter";
import "./sol/sol.css";

import { routerBase } from "./routerbase.ts";
// the copy law rides the boot: the seed refreshes the label store rows
// (translated rows protected) before the first paint answers
if (typeof window !== "undefined") void seedLabels().catch(() => {});

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
