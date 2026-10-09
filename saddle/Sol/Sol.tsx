/**
 * Sol theme anchor — layer 2 of the anchor architecture.
 * The file carrying the theme folder's own name (Sol/Sol.tsx, beside
 * Sol/sol.css) is the path manager of the pages: it imports one anchor per
 * page folder (`folder/folder.tsx`, each beside the loose components its
 * folder keeps) and mounts every route and subroute of the theme. App.tsx
 * consumes only this file and the theme stylesheet; no page component is
 * ever imported outside this layer. When a theme folder changes its name
 * (Moon, Aqua), this file follows the new name and App.tsx keeps importing
 * the anchor by the folder path. Since the family window conversion the
 * theme is an APPLICATION: the entry flow opens the route table — /intro
 * (the splash) and /onboarding (the first-run frames) — and every other
 * route renders as the content of the ONE application window (the page
 * anchors carry no chrome of their own; the window rail is the only nav).
 */
import { Route, Switch } from 'wouter';
import AgentBrowserAnchor from './agentbrowser/agentbrowser';
import ArchitectureAnchor from './architecture/architecture';
import ComputeAnchor from './compute/compute';
import ConsoleAnchor from './console/console';
import DashboardAnchor from './dashboard/dashboard';
import DocsAnchor from './docs/docs';
import HomeAnchor from './home/home';
import IntegrationsAnchor from './integrations/integrations';
import IntroAnchor from './intro/intro';
import LoginAnchor from './login/login';
import NotFoundAnchor from './notfound/notfound';
import OnboardingAnchor from './onboarding/onboarding';
import PlaygroundAnchor from './playground/playground';
import RegisterAnchor from './register/register';
import { Shell } from './shell/Shell';

/** The window stage: the ONE application window wrapping the whole page
 * route table — every existing route stays alive inside the stage. */
function WindowStage() {
	return (
		<Shell>
			<Switch>
				<Route path={'/'} component={HomeAnchor} />
				<Route path={'/architecture'} component={ArchitectureAnchor} />
				<Route path={'/agent-browser'} component={AgentBrowserAnchor} />
				<Route path={'/compute'} component={ComputeAnchor} />
				<Route path={'/integrations'} component={IntegrationsAnchor} />
				<Route path={'/playground'} component={PlaygroundAnchor} />
				<Route path={'/console'} component={ConsoleAnchor} />
				<Route path={'/login'} component={LoginAnchor} />
				<Route path={'/register'} component={RegisterAnchor} />
				{/* Session-gated panel: the Dashboard component decides on its own
            whether a session exists and renders the fatal sign-in panel when
            it does not, like the absorbed static dashboard. */}
				<Route path={'/dashboard'} component={DashboardAnchor} />
				<Route path={'/docs'} component={DocsAnchor} />
				<Route path={'/404'} component={NotFoundAnchor} />
				{/* Final fallback route */}
				<Route component={NotFoundAnchor} />
			</Switch>
		</Shell>
	);
}

/** The route tree of the theme: the entry flow (intro, onboarding) before
 * the catch-all that mounts the window over every page route. */
export default function Sol() {
	return (
		<Switch>
			<Route path={'/intro'} component={IntroAnchor} />
			<Route path={'/onboarding'} component={OnboardingAnchor} />
			<Route component={WindowStage} />
		</Switch>
	);
}
