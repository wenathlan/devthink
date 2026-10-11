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
 * The foundry mounts the APPLICATION flow (the reform wave): the entry flow
 * opens the route table — /intro (the splash), /onboarding (the first-run
 * frames) — and every other route renders as the content of the ONE shared
 * application window. The home anchor consults the entry gate (beside it in
 * the home folder) on the bare root route: the first-run state decides, the
 * landing renders only behind a finished flow — the landing first, then the
 * three platform pages of the machine room (sandboxes, images, artifacts),
 * the 404 and the catch-all, all as the content zone of the window.
 */
import type { ReactNode } from "react";
import { Route, Switch } from "wouter";
import ArtifactsAnchor from "./artifacts/artifacts";
import HomeAnchor from "./home/home";
import ImagesAnchor from "./images/images";
import IntroAnchor from "./intro/intro";
import NotFoundAnchor from "./notfound/notfound";
import OnboardingAnchor from "./onboarding/onboarding";
import SandboxesAnchor from "./sandboxes/sandboxes";
import { Shell } from "./shell/Shell";

/** the landing: the home surface riding the application window */
function Fundamentals() {
  return (
    <Shell>
      <HomeAnchor />
    </Shell>
  );
}

/** the platform pages: the machine room inside the same window */
function Platform({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}

/** the unrouted addresses: the 404 answer of the foundry, inside the same
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
      <Route path="/sandboxes">
        <Platform>
          <SandboxesAnchor />
        </Platform>
      </Route>
      <Route path="/images">
        <Platform>
          <ImagesAnchor />
        </Platform>
      </Route>
      <Route path="/artifacts">
        <Platform>
          <ArtifactsAnchor />
        </Platform>
      </Route>
      <Route path="/404" component={Unrouted} />
      <Route component={Unrouted} />
    </Switch>
  );
}
