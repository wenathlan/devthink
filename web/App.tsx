/** Style: DevThink Terminal Atelier — browser workbench routes expose stable workspace, session, tab and section identity. */
import { Toaster } from "@/primitives/sonner";
import { TooltipProvider } from "@/primitives/tooltip";
import NotFound from "@/notfound/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./app/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./home/Home";
import Projects from "./projects/Projects";
import Providers from "./providers/Providers";
import Routes from "./routes/Routes";
import Usage from "./usage/Usage";

function Router() {
  const base = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");
  return <WouterRouter base={base}><Switch><Route path="/" component={Home} /><Route path="/providers" component={Providers} /><Route path="/projects" component={Projects} /><Route path="/routes" component={Routes} /><Route path="/usage" component={Usage} /><Route path="/w/:workspaceId/s/:sessionId/t/:tabId/:sectionId" component={Home} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></WouterRouter>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster richColors theme="dark" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
