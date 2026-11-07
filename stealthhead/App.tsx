/**
 * App.tsx — the root anchor of the stealthhead Sol theme (layer 1 of the
 * anchor architecture) and the only TSX outside the theme: one static react
 * mount, one error boundary and the theme anchor. The root imports only the
 * theme anchor (sol/Sol.tsx — the file named after the theme folder, beside
 * sol/sol.css) and the theme stylesheet; the whole surface lives behind the
 * anchor. The owner's law rides the boot (PR19): the FPS game is in
 * construction — clean everything, leave ONE component saying "game in
 * construction" — so the mounted surface is the under-construction face
 * alone: no routes, no game pages, no shell chrome, no entry flow. The
 * engine logics of the platform (match, ranking, weapons, world, physics,
 * netcode, spawner, hud) stay preserved in the theme topic folders
 * (sol/match, sol/ranking, …) for the day the game wakes up — the surface
 * never imports them.
 */

import { WarningRegular as AlertTriangle, ArrowCounterclockwiseRegular as RotateCcw } from "@fluentui/react-icons";
import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { label, seedlabels } from "./labels";
import Sol from "./sol/Sol";
import { applyTheme } from "./theme";
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
      <Sol />
    </ThemeErrorBoundary>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("stealthhead root element is missing.");
createRoot(root).render(<App />);

export default App;
