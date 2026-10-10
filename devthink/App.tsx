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
import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Toaster } from "sonner";
import { Router as WouterRouter } from "wouter";
import Sol from "./Sol/Sol.tsx";
import { armGuard, guardStatus } from "./guard.ts";
import "./Sol/sol.css";

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
        <AlertTriangle size={34} />
        <p>DevThink could not render this workspace frame.</p>
        <pre>{error.stack}</pre>
        <button type="button" onClick={() => window.location.reload()}>
          <RotateCcw size={14} />
          reload local workbench
        </button>
      </main>
    );
  }
}

/** The router base derives from the declared base path so the same build serves every host.
 * Under relative hosting ("./") the build cannot know the folder it lands in, but the
 * dispatcher always boots cold links at the application root first — so the folder
 * prefix of the boot pathname is exactly the router base. */
function routerBase(): string {
  const declaredBase = import.meta.env.BASE_URL;
  if (declaredBase !== "/" && declaredBase !== "./") return declaredBase.replace(/\/$/, "");
  const bootPath = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
  return bootPath === "" ? "" : bootPath;
}

function App() {
  // the devtools shield arms before the first render: a banned address sees a blank site
  void guardStatus();
  armGuard();
  return (
    <WorkbenchErrorBoundary>
      <Toaster richColors theme="dark" />
      <WouterRouter base={routerBase()}>
        <Sol />
      </WouterRouter>
    </WorkbenchErrorBoundary>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("DevThink root element is missing.");
createRoot(root).render(<App />);

export default App;
