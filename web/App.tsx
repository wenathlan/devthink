/** Style: DevThink Terminal Atelier — browser workbench routes expose stable workspace, session, tab and section identity. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  const base = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");
  return <WouterRouter base={base}><Switch><Route path="/" component={Home} /><Route path="/w/:workspaceId/s/:sessionId/t/:tabId/:sectionId" component={Home} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></WouterRouter>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster richColors theme="dark" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
