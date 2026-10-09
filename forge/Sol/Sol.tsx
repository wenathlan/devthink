/**
 * Sol theme anchor — layer 2 of the anchor architecture.
 * The file carrying the theme folder's own name (Sol/Sol.tsx, beside
 * Sol/sol.css) is the path manager of the pages: it imports one anchor per
 * page folder (`folder/folder.tsx`, each beside the loose components its
 * folder keeps) and mounts every route of the theme. App.tsx consumes only
 * this file and the theme stylesheet; no page component is ever imported
 * outside this layer. When a theme folder changes its name (Moon, Aqua),
 * this file follows the new name and App.tsx keeps importing the anchor by
 * the folder path.
 *
 * The forge mounts the APPLICATION flow (the FAM-APPS reform, polished on
 * wave D1): the intro opens the application, the onboarding walks the
 * honest role, and the fundamentals ride the application window — the home
 * anchor and the 404 answer render as the content zone of the ONE shared
 * shell.
 */
import { Route, Switch } from "wouter";
import HomeAnchor from "./home/home";
import IntroAnchor from "./intro/intro";
import NotFoundAnchor from "./notfound/notfound";
import OnboardingAnchor from "./onboarding/onboarding";
import { Shell } from "./shell/Shell";

/** the fundamentals: the home surface riding the application window */
function Fundamentals() {
  return (
    <Shell>
      <HomeAnchor />
    </Shell>
  );
}

/** the unrouted addresses: the 404 answer of the forge, inside the same
 * window (the catch-all of the theme) */
function Unrouted() {
  return (
    <Shell>
      <NotFoundAnchor />
    </Shell>
  );
}

/** Mounts the theme surface through the page anchors: the entry flow
 * (/intro, /onboarding) ahead of the window routes — the home first, the
 * /404 route and the catch-all last. */
export default function Sol() {
  return (
    <Switch>
      <Route path="/intro" component={IntroAnchor} />
      <Route path="/onboarding" component={OnboardingAnchor} />
      <Route path="/" component={Fundamentals} />
      <Route path="/404" component={Unrouted} />
      <Route component={Unrouted} />
    </Switch>
  );
}
