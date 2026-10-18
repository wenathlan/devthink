/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the vault theme. The vault is the storage clone of the family:
 * it guards the network databases, receives the backups and hands out the
 * unified store. The root manages the themes as single files: it imports only
 * the theme anchor (Sol/Sol.tsx — the file named after the theme folder,
 * beside Sol/sol.css) and the theme stylesheet, wraps the anchor in the
 * error boundary and the wouter router provider (the base rides the build
 * declaration, never the runtime path) and mounts on #root. Every page and
 * component lives behind the anchor chain (App → Sol → the page anchors →
 * the loose components); nothing is imported directly.
 */
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Router as WouterRouter } from "wouter";
import Sol from "./Sol/Sol";
import installzoomlock from "./zoomlock";
import "./Sol/sol.css";

// the zoom lock arms before the first render: the interface boots pinned at 100%
if (typeof window !== "undefined") installzoomlock();

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
        <AlertTriangle size={34} />
        <p>vault could not render this page frame.</p>
        <pre>{error.stack}</pre>
        <button type="button" onClick={() => window.location.reload()}>
          <RotateCcw size={14} />
          reload the page
        </button>
      </main>
    );
  }
}

function routerBase(): string {
  // the base rides the BUILD declaration only: a sub-folder deployment
  // declares its own vite base and that declaration arrives here — the
  // runtime path would flatten every deep link into the home route.
  const declaredBase = import.meta.env.BASE_URL;
  if (declaredBase !== "/" && declaredBase !== "./") return declaredBase.replace(/\/$/, "");
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
if (!root) throw new Error("vault root element is missing.");
createRoot(root).render(<App />);

export default App;
