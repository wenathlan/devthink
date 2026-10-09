/**
 * Sol theme anchor — layer 2 of the anchor architecture.
 * The file carrying the theme folder's own name (Sol/Sol.tsx, beside
 * Sol/sol.css) is the path manager of the pages: it imports one anchor per
 * page folder (`folder/folder.tsx`, each beside the loose components its
 * folder keeps) and mounts every route and subroute of the theme. App.tsx
 * consumes only this file and the theme stylesheet; no page component is
 * ever imported outside this layer. Since FAM-APPS-B the theme is an
 * APPLICATION: the entry flow opens the route table — /intro (the splash),
 * /onboarding (the first-run frames) — and every other route renders as
 * the content of the ONE application window (the Shell hosts the
 * fundamentals; there is no OS chrome anymore).
 */
import { Route, Switch } from "wouter";
import HomeAnchor from "./home/home";
import IntroAnchor from "./intro/intro";
import MatchAnchor from "./match/match";
import NotFoundAnchor from "./notfound/notfound";
import OnboardingAnchor from "./onboarding/onboarding";
import RankingAnchor from "./ranking/ranking";
import { Shell } from "./shell/Shell";
import WeaponsAnchor from "./weapons/weapons";
import WorldAnchor from "./world/world";

/** The route table of the theme: the entry flow (intro, onboarding) before
 * the fundamentals — home plus the four game domains and the catch-all,
 * all rendered inside the application window. */
export default function Sol() {
  return (
    <Switch>
      <Route path="/intro" component={IntroAnchor} />
      <Route path="/onboarding" component={OnboardingAnchor} />
      <Route component={Fundamentals} />
    </Switch>
  );
}

/** The fundamentals: the real pages of the app rendered as the content of
 * the ONE application window (home first, then the game domains, the 404
 * page and the catch-all). */
function Fundamentals() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={HomeAnchor} />
        <Route path="/match" component={MatchAnchor} />
        <Route path="/ranking" component={RankingAnchor} />
        <Route path="/weapons" component={WeaponsAnchor} />
        <Route path="/world" component={WorldAnchor} />
        <Route path="/404" component={NotFoundAnchor} />
        <Route component={NotFoundAnchor} />
      </Switch>
    </Shell>
  );
}
