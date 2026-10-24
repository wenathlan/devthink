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
 * The forge mounts the APPLICATION flow (the reform wave): the route table
 * opens with the first-run flow — /intro (the splash) and /onboarding (the
 * first-run frames) — and the home route rides the ENTRY GATE (the flow
 * contract): the gate reads the DB-backed onboarding state before anything
 * paints, replaces to the missing first-run stage and only lets a visitor
 * that finished the flow see the landing. The platform pages (runs, queue,
 * logs), the 404 and the catch-all render as the content zone of the ONE
 * shared shell.
 */
import { Route, Switch } from "wouter";
import { EntryGate } from "./widgets/home.entrygate.tsx";
import HomeAnchor from "./home/home";
import IntroAnchor from "./intro/intro";
import LogsAnchor from "./logs/logs";
import NotFoundAnchor from "./notfound/notfound";
import OnboardingAnchor from "./onboarding/onboarding";
import QueueAnchor from "./queue/queue";
import RunsAnchor from "./runs/runs";
import { Shell } from "./shell/Shell";

/** the landing behind the entry gate: the gate resolves the first-run state
 * (rendering nothing while it does), replaces to /intro or /onboarding when
 * a stage is unseen and only then shows the home inside the window */
function Fundamentals() {
  return (
    <EntryGate>
      <Shell>
        <HomeAnchor />
      </Shell>
    </EntryGate>
  );
}

/** the platform pages: the runner floor inside the same window */
function Platform({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}

/** the unrouted addresses: the 404 answer of the forge, inside the same
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
      <Route path="/runs">
        <Platform>
          <RunsAnchor />
        </Platform>
      </Route>
      <Route path="/queue">
        <Platform>
          <QueueAnchor />
        </Platform>
      </Route>
      <Route path="/logs">
        <Platform>
          <LogsAnchor />
        </Platform>
      </Route>
      <Route path="/404" component={Unrouted} />
      <Route component={Unrouted} />
    </Switch>
  );
}
