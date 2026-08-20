/** DevThink v1.1.15 root entry: one static React mount, one error boundary and route-level page domains. */
import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Toaster } from "sonner";
import { Route, Router as WouterRouter, Switch } from "wouter";
import NotFound from "@/notfound/NotFound";
import Home from "@/home/Home";
import Projects from "@/projects/Projects";
import Providers from "@/providers/Providers";
import Routes from "@/routes/Routes";
import Settings from "@/settings/Settings";
import Usage from "@/usage/Usage";
import "./index.css";

class WorkbenchErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return <main className="workbench-failure" role="alert"><AlertTriangle size={34} /><p>DevThink could not render this workspace frame.</p><pre>{error.stack}</pre><button onClick={() => window.location.reload()}><RotateCcw size={14} />reload local workbench</button></main>;
  }
}

function Router() {
  const declaredBase = import.meta.env.BASE_URL;
  const base = declaredBase === "/" || declaredBase === "./" ? "" : declaredBase.replace(/\/$/, "");
  return <WouterRouter base={base}><Switch><Route path="/" component={Home} /><Route path="/providers" component={Providers} /><Route path="/projects" component={Projects} /><Route path="/routes" component={Routes} /><Route path="/usage" component={Usage} /><Route path="/settings" component={Settings} /><Route path="/w/:workspaceId/s/:sessionId/t/:tabId/:sectionId" component={Home} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></WouterRouter>;
}

function App() {
  return <WorkbenchErrorBoundary><Toaster richColors theme="dark" /><Router /></WorkbenchErrorBoundary>;
}

const root = document.getElementById("root");
if (!root) throw new Error("DevThink root element is missing.");
createRoot(root).render(<App />);

export default App;
