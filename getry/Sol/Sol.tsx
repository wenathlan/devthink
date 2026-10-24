/**
 * Sol theme anchor — layer 2 of the anchor architecture.
 * The file carrying the theme folder's own name (Sol/Sol.tsx, beside
 * Sol/sol.css) is the path manager of the pages: it imports one anchor per
 * page folder (`folder/folder.tsx`, the only file each folder keeps since
 * the components centralization — the loose components ride
 * `widgets/<page>.<name>.tsx`, flat) and mounts every route and subroute
 * of the theme. App.tsx
 * consumes only this file and the theme stylesheet; no page component is
 * ever imported outside this layer. Since FAM-APPS-B the theme is an
 * APPLICATION: the entry flow opens the route table — /intro (the
 * akash-floor splash), /onboarding (the first-run frames) — and every other
 * route renders as the content of the ONE application window (the Shell
 * hosts the fundamentals; there is no OS chrome anymore). The flow contract
 * rides the home anchor's entry gate (Sol/widgets/home.entrygate.tsx): "/"
 * consults the seen flags (onboardingstate.ts) before anything shows, the
 * intro hands straight to /onboarding and the onboarding lands home.
 */
import { Route, Switch } from "wouter";
import HomeAnchor from "./home/home";
import IntroAnchor from "./intro/intro";
import NotFoundAnchor from "./notfound/notfound";
import OnboardingAnchor from "./onboarding/onboarding";
import SessionsAnchor from "./sessions/sessions";
import { Shell } from "./shell/Shell.tsx";
import ThinkingAnchor from "./thinking/thinking";
import VersionsAnchor from "./versions/versions";

/** The route table of the theme: the entry flow (intro, onboarding) before
 * the fundamentals — home plus the three gateway domains and the catch-all,
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
 * the ONE application window (home first, then the gateway domains, the
 * 404 page and the catch-all). */
function Fundamentals() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={HomeAnchor} />
        <Route path="/versions" component={VersionsAnchor} />
        <Route path="/thinking" component={ThinkingAnchor} />
        <Route path="/sessions" component={SessionsAnchor} />
        <Route path="/404" component={NotFoundAnchor} />
        <Route component={NotFoundAnchor} />
      </Switch>
    </Shell>
  );
}
