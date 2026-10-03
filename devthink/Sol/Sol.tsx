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
import { initautotranslate } from "./shell/translate.dom";
import AboutAnchor from "./about/about";
import AdminAnchor from "./admin/admin";
import AppsAnchor from "./apps/apps";
import ChatAnchor from "./chat/chat";
import ConsoleAnchor from "./console/console";
import DocsAnchor from "./docs/docs";
import ExploreAnchor from "./explore/explore";
import GamesAnchor from "./apps/games/games";
import GatewayAnchor from "./gatewayview/gatewayview";
import HistoryAnchor from "./history/history";
import HomeAnchor from "./home/home";
import MusicStudioAnchor from "./apps/musicstudio/musicstudio";
import NotFoundAnchor from "./notfound/notfound";
import OsAnchor from "./os/os";
import PolicyAnchor from "./policy/policy";
import ProjectsAnchor from "./projects/projects";
import ProvidersAnchor from "./providers/providers";
import RoutesAnchor from "./routes/routes";
import SettingsAnchor from "./settings/settings";
import TermsAnchor from "./terms/terms";
import UsageAnchor from "./usage/usage";
import VideoStudioAnchor from "./apps/videostudio/videostudio";

// the gtx translation arms beside the shield: the theme language rides the visitor choice
initautotranslate();

/** The route tree of the theme: one Route per page anchor, the catch-all last. */
export default function Sol() {
  return (
    <Switch>
      <Route path="/" component={HomeAnchor} />
      <Route path="/os" component={OsAnchor} />
      <Route path="/chat" component={ChatAnchor} />
      <Route path="/apps" component={AppsAnchor} />
      <Route path="/apps/video" component={VideoStudioAnchor} />
      <Route path="/apps/music" component={MusicStudioAnchor} />
      <Route path="/apps/games" component={GamesAnchor} />
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
      <Route path="/w/:workspaceId/s/:sessionId/t/:tabId/:sectionId" component={HomeAnchor} />
      <Route path="/404" component={NotFoundAnchor} />
      <Route component={NotFoundAnchor} />
    </Switch>
  );
}
