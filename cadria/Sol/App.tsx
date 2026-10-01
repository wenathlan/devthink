// # App — global anchor of the theme: one react mount, one error boundary, one router.
// The base derives from import.meta.env.BASE_URL so the same build serves the apex,
// github pages subpaths and the preview hosts.
import { Component, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Route, Router as WouterRouter, Switch } from "wouter";
import Home from "./home/Home";
import Player from "./player/Player";
import Studio from "./studio/Studio";
import Gallery from "./gallery/Gallery";
import Settings from "./settings/Settings";
import NotFound from "./notfound/NotFound";
import { ToastProvider } from "./toast/Toast";
import { initReveal, useReveal } from "./reveal";
import { applyNow, syncCanonical } from "./clean.url";
import { initTheme } from "./theme";
import "./index.css";

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
        <p>cadria could not render this page frame.</p>
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

function Routes() {
  useReveal();
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/player" component={Player} />
      <Route path="/studio" component={Studio} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/settings" component={Settings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
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
          <Routes />
        </WouterRouter>
      </ToastProvider>
    </ThemeErrorBoundary>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("cadria root element is missing.");
createRoot(root).render(<App />);

export default App;
