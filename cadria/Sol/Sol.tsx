/**
 * Sol theme anchor — layer 2 of the anchor architecture.
 * The file carrying the theme folder's own name (Sol/Sol.tsx, beside
 * Sol/sol.css) is the path manager of the pages: it imports one anchor per
 * page folder (`folder/folder.tsx`, each beside the loose components its
 * folder keeps) and mounts every route and subroute of the theme. App.tsx
 * consumes only this file and the theme stylesheet; no page component is
 * ever imported outside this layer. When a theme folder changes its name
 * (Moon, Aqua), this file follows the new name and App.tsx keeps importing
 * the anchor by the folder path. Since FAM-APPS-A the theme is an
 * APPLICATION: the entry flow opens the route table — /intro (the splash),
 * /onboarding (the first-run frames) — and every other route renders as
 * the content of the ONE application window (the page anchors host the
 * Shell chrome; there is no OS chrome anymore).
 */
import { Route, Switch } from "wouter";
import { useReveal } from "../reveal.ts";
import GalleryAnchor from "./gallery/gallery.ts";
import HomeAnchor from "./home/home.ts";
import IntroAnchor from "./intro/intro.ts";
import NotFoundAnchor from "./notfound/notfound.ts";
import OnboardingAnchor from "./onboarding/onboarding.ts";
import PlayerAnchor from "./player/player.ts";
import SettingsAnchor from "./settings/settings.ts";
import StudioAnchor from "./studio/studio.ts";

/** The route tree of the theme: the entry flow (intro, onboarding) before
 * the fundamentals — one Route per page anchor, the catch-all last. */
export default function Sol() {
  // the reveal effect rides the route tree: every mounted page answers to the observer
  useReveal();
  return (
    <Switch>
      <Route path="/intro" component={IntroAnchor} />
      <Route path="/onboarding" component={OnboardingAnchor} />
      <Route path="/" component={HomeAnchor} />
      <Route path="/player" component={PlayerAnchor} />
      <Route path="/studio" component={StudioAnchor} />
      <Route path="/gallery" component={GalleryAnchor} />
      <Route path="/settings" component={SettingsAnchor} />
      <Route path="/404" component={NotFoundAnchor} />
      <Route component={NotFoundAnchor} />
    </Switch>
  );
}
