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
import { initautotranslate } from "../translatedom.ts";
import { FAMILY_SLUGS } from "../window.ts";
import AboutAnchor from "./about/about.tsx";
import AudioAnchor from "./audio/audio.tsx";
import AuthAnchor from "./auth/auth.tsx";
import CalculatorAnchor from "./calculator/calculator.tsx";
import ChatAnchor from "./chat/chat.tsx";
import ConsoleAnchor from "./console/console.tsx";
import DocsAnchor from "./docs/docs.tsx";
import ExploreAnchor from "./explore/explore.tsx";
import FilesAnchor from "./files/files.tsx";
import GamesAnchor from "./games/games.tsx";
import GatewayAnchor from "./gateway/gateway.tsx";
import HistoryAnchor from "./history/history.tsx";
import ImageAnchor from "./image/image.tsx";
import IntroAnchor from "./intro/intro.tsx";
import NotFoundAnchor from "./notfound/notfound.tsx";
import OnboardingAnchor from "./onboarding/onboarding.tsx";
import PanelAnchor from "./panel/panel.tsx";
import PolicyAnchor from "./policy/policy.tsx";
import ProjectsAnchor from "./projects/projects.tsx";
import ProvidersAnchor from "./providers/providers.tsx";
import SettingsAnchor from "./settings/settings.tsx";
import { RouteSurface } from "./shell/routesurface.tsx";
import TermsAnchor from "./terms/terms.tsx";
import UsageAnchor from "./usage/usage.tsx";
import VideoAnchor from "./video/video.tsx";

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
 * The owner entry flow: "/" is the intro — the SaaS face on the web targets,
 * the Windows boot on the owned ones — and hands the surface to the login
 * face at /auth, which continues to the OS desktop at /panel; the panel is
 * the last page of the chain. The explorer (/explore) and the onboarding
 * tour (/onboarding) are indirect subapps: routable, never panel icons. The
 * deep /w/… workspace routes keep falling into the panel exactly as they
 * always fell into the desktop. */
export default function Sol() {
  return (
    <>
      <DeepRouteReplay />
      {/* the route stage: every page change plays the Windows grammar — the
          250ms entry rise and the real 100ms exit of the previous page */}
      <RouteSurface>
        <Switch>
          <Route path="/" component={IntroAnchor} />
          <Route path="/onboarding" component={OnboardingAnchor} />
          <Route path="/panel" component={() => <PanelAnchor />} />
          <Route path="/auth" component={AuthAnchor} />
          <Route path="/chat" component={ChatAnchor} />
          <Route path="/files" component={() => <FilesAnchor />} />
          <Route path="/video" component={() => <VideoAnchor />} />
          <Route path="/audio" component={() => <AudioAnchor />} />
          <Route path="/image" component={() => <ImageAnchor />} />
          <Route path="/calculator" component={() => <CalculatorAnchor />} />
          <Route path="/games" component={() => <GamesAnchor />} />
          <Route path="/console" component={() => <ConsoleAnchor />} />
          <Route path="/gateway" component={() => <GatewayAnchor />} />
          <Route path="/gateway/v/:versionId" component={() => <GatewayAnchor />} />
          <Route path="/providers" component={() => <ProvidersAnchor />} />
          <Route path="/projects" component={() => <ProjectsAnchor />} />
          <Route path="/usage" component={() => <UsageAnchor />} />
          <Route path="/docs" component={() => <DocsAnchor />} />
          <Route path="/explore" component={ExploreAnchor} />
          <Route path="/history" component={() => <HistoryAnchor />} />
          <Route path="/settings" component={() => <SettingsAnchor />} />
          <Route path="/about" component={AboutAnchor} />
          <Route path="/terms" component={TermsAnchor} />
          <Route path="/policy" component={PolicyAnchor} />
          {/* the family routes: DevThink barra <app> — the address carries the
              app's own subpath and the panel opens the power clip window of
              that app on arrival (the windows law with its own URL) */}
          {FAMILY_SLUGS.map((slug) => (
            <Route key={slug} path={`/${slug}`} component={() => <PanelAnchor familySlug={slug} />} />
          ))}
          <Route path="/w/:workspaceId/s/:sessionId/t/:tabId/:sectionId" component={() => <PanelAnchor />} />
          <Route path="/404" component={NotFoundAnchor} />
          <Route component={NotFoundAnchor} />
        </Switch>
      </RouteSurface>
    </>
  );
}
