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
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import AboutAnchor from "./about/about.tsx";
import AdminAnchor from "./admin/admin.tsx";
import AuthAnchor from "./auth/auth.tsx";
import CalculatorAnchor from "./calculator/calculator.tsx";
import ChatAnchor from "./chat/chat.tsx";
import ConsoleAnchor from "./console/console.tsx";
import DocsAnchor from "./docs/docs.tsx";
import ExploreAnchor from "./explore/explore.tsx";
import GamesAnchor from "./games/games.tsx";
import GatewayAnchor from "./gatewayview/gatewayview.tsx";
import HistoryAnchor from "./history/history.tsx";
import ImageAnchor from "./image/image.tsx";
import IntroAnchor from "./intro/intro.tsx";
import LauncherAnchor from "./launcher/launcher.tsx";
import MusicStudioAnchor from "./musicstudio/musicstudio.tsx";
import NotFoundAnchor from "./notfound/notfound.tsx";
import OsAnchor from "./os/os.tsx";
import PanelAnchor from "./panel/panel.tsx";
import PolicyAnchor from "./policy/policy.tsx";
import ProjectsAnchor from "./projects/projects.tsx";
import ProvidersAnchor from "./providers/providers.tsx";
import RoutesAnchor from "./routes/routes.tsx";
import SettingsAnchor from "./settings/settings.tsx";
import { initautotranslate } from "./shell/translatedom.ts";
import TermsAnchor from "./terms/terms.tsx";
import UsageAnchor from "./usage/usage.tsx";
import VideoStudioAnchor from "./videostudio/videostudio.tsx";

// the gtx translation arms beside the shield: the theme language rides the visitor choice
initautotranslate();

/**
 * DeepRouteReplay — the family Pages dispatcher parks the deep path of a
 * cold link under sessionStorage (GitHub Pages answers every miss with the
 * site-root 404, so the dispatcher hands the route back and redirects to
 * the application root). This anchor walks the router to the parked path
 * exactly once and clears the parking slot.
 */
function DeepRouteReplay() {
  const [, navigate] = useLocation();
  useEffect(() => {
    let timer = 0;
    try {
      const parked = window.sessionStorage.getItem("dt.deep.route");
      // a parked name that carries a file extension is a missed asset, never
      // a route: the walk ignores it instead of landing on the not-found page
      if (parked && parked !== "/" && !/\.[a-z0-9]+$/i.test(parked)) {
        // the walk defers one tick and consumes the slot only after it: the
        // mount effects of the root page read the slot in the same pass and
        // skip their own navigation while a deep link owns the URL
        timer = window.setTimeout(() => {
          window.sessionStorage.removeItem("dt.deep.route");
          navigate(parked);
        }, 0);
      }
    } catch {
      /* the storage is unavailable: nothing was parked */
    }
    return () => window.clearTimeout(timer);
  }, [navigate]);
  return null;
}

/** The route tree of the theme: one Route per page anchor, the catch-all last.
 * The owner entry flow: "/" is the intro (one variant per build target) that
 * hands the surface STRAIGHT to the OS desktop at /panel — no login screen in
 * the chain; the panel resolves the local identity silently and the display
 * name is edited in Settings (settings/identity.tsx). The /auth route
 * survives only as a manual compat handover to the same desktop (the retired
 * entry pass — Sol/auth/auth.tsx). The deep /w/… workspace routes keep
 * falling into the panel exactly as they always fell into the desktop. */
export default function Sol() {
  return (
    <>
      <DeepRouteReplay />
      <Switch>
        <Route path="/" component={IntroAnchor} />
        <Route path="/panel" component={PanelAnchor} />
        <Route path="/auth" component={AuthAnchor} />
        <Route path="/os" component={OsAnchor} />
        <Route path="/chat" component={ChatAnchor} />
        <Route path="/launcher" component={LauncherAnchor} />
        <Route path="/videostudio" component={VideoStudioAnchor} />
        <Route path="/musicstudio" component={MusicStudioAnchor} />
        <Route path="/image" component={ImageAnchor} />
        <Route path="/calculator" component={CalculatorAnchor} />
        <Route path="/games" component={GamesAnchor} />
        <Route path="/console" component={ConsoleAnchor} />
        <Route path="/gateway" component={GatewayAnchor} />
        <Route path="/gateway/v/:versionId" component={GatewayAnchor} />
        <Route path="/providers" component={ProvidersAnchor} />
        <Route path="/projects" component={ProjectsAnchor} />
        <Route path="/routes" component={RoutesAnchor} />
        <Route path="/usage" component={UsageAnchor} />
        <Route path="/docs" component={DocsAnchor} />
        <Route path="/explore" component={ExploreAnchor} />
        <Route path="/history" component={HistoryAnchor} />
        <Route path="/admin" component={AdminAnchor} />
        <Route path="/settings" component={SettingsAnchor} />
        <Route path="/about" component={AboutAnchor} />
        <Route path="/terms" component={TermsAnchor} />
        <Route path="/policy" component={PolicyAnchor} />
        <Route path="/w/:workspaceId/s/:sessionId/t/:tabId/:sectionId" component={PanelAnchor} />
        <Route path="/404" component={NotFoundAnchor} />
        <Route component={NotFoundAnchor} />
      </Switch>
    </>
  );
}
