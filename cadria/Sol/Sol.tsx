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
 *
 * The route table mirrors the eight official pages of the family. The intro
 * (/intro) is the public presentation page and mounts bare — no chrome. The
 * other seven (onboarding, home, player, studio, gallery, settings and the
 * not-found handover) are PLATFORM pages: they mount inside the one Shell
 * chrome, which stays alive across their navigation (the inner Switch swaps
 * the page anchors inside the routed stage).
 */
import { Route, Switch } from "wouter";
import { useReveal } from "../reveal.ts";
import GalleryAnchor from "./gallery/gallery.tsx";
import HomeAnchor from "./home/home.tsx";
import IntroAnchor from "./intro/intro.tsx";
import NotFoundAnchor from "./notfound/notfound.tsx";
import OnboardingAnchor from "./onboarding/onboarding.tsx";
import PlayerAnchor from "./player/player.tsx";
import SettingsAnchor from "./settings/settings.tsx";
import Shell from "./shell/Shell.tsx";
import StudioAnchor from "./studio/studio.tsx";

/** the platform route tree: every application page inside the ONE chrome —
 * the entry flow first (onboarding), the apex home, then the seats, the
 * 404 handover last. */
function Platform() {
  return (
    <Shell>
      <Switch>
        <Route path="/onboarding" component={OnboardingAnchor} />
        <Route path="/" component={HomeAnchor} />
        <Route path="/player" component={PlayerAnchor} />
        <Route path="/studio" component={StudioAnchor} />
        <Route path="/gallery" component={GalleryAnchor} />
        <Route path="/settings" component={SettingsAnchor} />
        <Route path="/404" component={NotFoundAnchor} />
        <Route component={NotFoundAnchor} />
      </Switch>
    </Shell>
  );
}

/** the route tree of the theme: the public intro outside the chrome, every
 * platform page inside it — one Route per page anchor, the catch-all last. */
export default function Sol() {
  // the reveal effect rides the route tree: every mounted page answers to the observer
  useReveal();
  return (
    <Switch>
      <Route path="/intro" component={IntroAnchor} />
      <Route component={Platform} />
    </Switch>
  );
}
