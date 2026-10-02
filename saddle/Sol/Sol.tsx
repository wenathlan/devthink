/**
 * Sol theme anchor — layer 2 of the anchor architecture.
 * The file carrying the theme folder's own name (Sol/Sol.tsx, beside
 * Sol/sol.css) is the path manager of the pages: it imports one anchor per
 * page folder (`folder/folder.tsx`, each beside the loose components its
 * folder keeps) and mounts every route and subroute of the theme. App.tsx
 * consumes only this file and the theme stylesheet; no page component is
 * ever imported outside this layer. When a theme folder changes its name
 * (Moon, Aqua), this file follows the new name and App.tsx keeps importing
 * the anchor by the folder path.
 */
import { Route, Switch } from "wouter";
import AgentBrowserAnchor from "./agentbrowser/agentbrowser";
import ArchitectureAnchor from "./architecture/architecture";
import ComputeAnchor from "./compute/compute";
import ConsoleAnchor from "./console/console";
import DashboardAnchor from "./dashboard/dashboard";
import DocsAnchor from "./docs/docs";
import HomeAnchor from "./home/home";
import IntegrationsAnchor from "./integrations/integrations";
import LoginAnchor from "./login/login";
import NotFoundAnchor from "./notfound/notfound";
import PlaygroundAnchor from "./playground/playground";
import RegisterAnchor from "./register/register";

/** The route tree of the theme: one Route per page anchor, the catch-all last. */
export default function Sol() {
  return (
    <Switch>
      <Route path={"/"} component={HomeAnchor} />
      <Route path={"/architecture"} component={ArchitectureAnchor} />
      <Route path={"/agent-browser"} component={AgentBrowserAnchor} />
      <Route path={"/compute"} component={ComputeAnchor} />
      <Route path={"/integrations"} component={IntegrationsAnchor} />
      <Route path={"/playground"} component={PlaygroundAnchor} />
      <Route path={"/console"} component={ConsoleAnchor} />
      <Route path={"/login"} component={LoginAnchor} />
      <Route path={"/register"} component={RegisterAnchor} />
      {/* Session-gated panel: the Dashboard component decides on its own
          whether a session exists and renders the fatal sign-in panel when
          it does not, like the absorbed static dashboard. */}
      <Route path={"/dashboard"} component={DashboardAnchor} />
      <Route path={"/docs"} component={DocsAnchor} />
      <Route path={"/404"} component={NotFoundAnchor} />
      {/* Final fallback route */}
      <Route component={NotFoundAnchor} />
    </Switch>
  );
}
