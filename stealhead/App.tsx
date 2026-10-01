/**
 * App.tsx — the root anchor of the stealhead Sol theme: one static react
 * mount, one error boundary and the route table of the platform. data
 * reaches the pages from the root game logics (typed DB accessors over
 * HTTPS with the in-memory seed fallback); the visitor machine only
 * loads the interface.
 */
import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Route, Router as WouterRouter, Switch } from "wouter";
import { Toaster } from "./Sol/toast/Toast";
import { applyTheme } from "./theme";
import { Shell } from "./Sol/shell/Shell";
import { Home } from "./Sol/home/Home";
import Match from "./Sol/match/Match";
import Ranking from "./Sol/ranking/Ranking";
import Weapons from "./Sol/weapons/Weapons";
import World from "./Sol/world/World";
import NotFound from "./Sol/notfound/NotFound";
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
        <p>stealhead could not render this frame.</p>
        <pre>{error.stack}</pre>
        <button type="button" onClick={() => window.location.reload()}>
          <RotateCcw size={14} />
          reload the interface
        </button>
      </main>
    );
  }
}

/** the route table: home plus the four game domains and the catch-all. */
function Router() {
  const declaredBase = import.meta.env.BASE_URL;
  const base = declaredBase === "/" || declaredBase === "./" ? "" : declaredBase.replace(/\/$/, "");
  return (
    <WouterRouter base={base}>
      <Shell>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/match" component={Match} />
          <Route path="/ranking" component={Ranking} />
          <Route path="/weapons" component={Weapons} />
          <Route path="/world" component={World} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
    </WouterRouter>
  );
}

function App() {
  /* the theme starts dark on every load: no storage, no visitor writes. */
  applyTheme("dark");
  return (
    <ThemeErrorBoundary>
      <Toaster />
      <Router />
    </ThemeErrorBoundary>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("stealhead root element is missing.");
createRoot(root).render(<App />);

export default App;
