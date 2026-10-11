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
 * The vault mounts the APPLICATION flow (the FAM-APPS reform): the intro
 * opens the application, the onboarding walks the honest role, and the
 * surfaces ride the application window — the landing first, then the three
 * platform pages of the safe (objects, buckets, retention), the 404 and the
 * catch-all, all as the content zone of the ONE shared shell.
 */
import type { ReactNode } from "react";
import { Route, Switch } from "wouter";
import BucketsAnchor from "./buckets/buckets";
import HomeAnchor from "./home/home";
import IntroAnchor from "./intro/intro";
import NotFoundAnchor from "./notfound/notfound";
import ObjectsAnchor from "./objects/objects";
import OnboardingAnchor from "./onboarding/onboarding";
import RetentionAnchor from "./retention/retention";
import { Shell } from "./shell/Shell";

/** the landing: the home surface riding the application window */
function Fundamentals() {
  return (
    <Shell>
      <HomeAnchor />
    </Shell>
  );
}

/** the platform pages: the safe inside the same window */
function Platform({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}

/** the unrouted addresses: the 404 answer of the vault, inside the same
 * window (the theme catch-all) */
function Unrouted() {
  return (
    <Shell>
      <NotFoundAnchor />
    </Shell>
  );
}

/** Mounts the theme surface through the page anchors: the entry flow
 * (/intro, /onboarding) ahead of the window routes — the landing, the
 * platform pages, the /404 route and the catch-all last. */
export default function Sol() {
  return (
    <Switch>
      <Route path="/intro" component={IntroAnchor} />
      <Route path="/onboarding" component={OnboardingAnchor} />
      <Route path="/" component={Fundamentals} />
      <Route path="/objects">
        <Platform>
          <ObjectsAnchor />
        </Platform>
      </Route>
      <Route path="/buckets">
        <Platform>
          <BucketsAnchor />
        </Platform>
      </Route>
      <Route path="/retention">
        <Platform>
          <RetentionAnchor />
        </Platform>
      </Route>
      <Route path="/404" component={Unrouted} />
      <Route component={Unrouted} />
    </Switch>
  );
}
