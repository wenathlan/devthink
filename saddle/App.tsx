import { createRoot } from "react-dom/client";
import { ErrorBoundary, ThemeProvider, Toaster, TooltipProvider } from "./Sol/shell/Shell";
import "./Sol/sol.css";
import NotFound from "./Sol/notfound/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import Home from "./Sol/home/Home";
import Architecture from "./Sol/architecture/Architecture";
import AgentBrowser from "./Sol/agentbrowser/AgentBrowser";
import Compute from "./Sol/compute/Compute";
import Integrations from "./Sol/integrations/Integrations";
import Docs from "./Sol/docs/Docs";
import Playground from "./Sol/playground/Playground";
import Console from "./Sol/console/Console";
import Dashboard from "./Sol/dashboard/Dashboard";
import Login from "./Sol/login/Login";
import Register from "./Sol/register/Register";


function Router() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/architecture"} component={Architecture} />
        <Route path={"/agent-browser"} component={AgentBrowser} />
        <Route path={"/compute"} component={Compute} />
        <Route path={"/integrations"} component={Integrations} />
        <Route path={"/playground"} component={Playground} />
        <Route path={"/console"} component={Console} />
        <Route path={"/login"} component={Login} />
        <Route path={"/register"} component={Register} />
        {/* Session-gated panel: the Dashboard component decides on its own
            whether a session exists and renders the fatal sign-in panel when
            it does not, like the absorbed static dashboard. */}
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/docs"} component={Docs} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in Sol/sol.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

/* The self-mount: the app owns its bootstrap — the retired main.tsx
 * wrapper is gone, so this module is the single entry the html loads
 * (the doctrine of the 2.1.0 universal interface: one tsx app, the
 * router and the mount live together). */
if (typeof document !== "undefined" && document.getElementById("root")) {
  createRoot(document.getElementById("root")!).render(<App />);
}

export default App;
