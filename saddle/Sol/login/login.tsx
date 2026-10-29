/**
 * login page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Sign-in page: faithful absorption of login.html — the account panel with
// the login form, the api status line and the project footer. the session
// is carried exclusively by the saddlesession cookie (nothing sensitive is
// ever stored in localstorage). R3-saddle: one instrument card with an
// asymmetric interior — the form (1.2fr) beside the trust rail (1fr) that
// carries the real session facts; 44px inputs, the sand focus ring.
import { Link } from 'wouter';
import { label } from '../../labels.ts';
import { LoginForm as LoginForm } from '../wingets';

export * from '../wingets';

/** meta description carried by the absorbed static page. */
export const loginpagedescription =
	'saddle sign in: username and password only, session carried by the saddlesession cookie';

/** the real session facts of the trust rail: the labels ride the store. */
function trustfacts(): { label: string; body: string }[] {
	return [
		{
			label: label('login.trust.sessionLabel'),
			body: label('login.trust.sessionBody'),
		},
		{
			label: label('login.trust.transportLabel'),
			body: label('login.trust.transportBody'),
		},
		{
			label: label('login.trust.errorsLabel'),
			body: label('login.trust.errorsBody'),
		},
		{
			label: label('login.trust.fallbackLabel'),
			body: label('login.trust.fallbackBody'),
		},
	];
}

/**
 * the sign-in page frame: brand lockup, the instrument card (form beside
 * the trust rail) and the static-edge footer notes.
 */
export default function Login() {
	return (
		<div className="auth-frame">
			<div className="r3-authcard">
				<header className="auth-head">
					{/* logo discipline: the wordmark speaks — the mark stays in the window title bar */}
					<Link href="/" className="brand-lockup">
						<span className="brand-wordmark">{label('login.brand')}</span>
					</Link>
					<span className="auth-tagline">{label('login.tagline')}</span>
				</header>

				<main className="r3-authgrid">
					<section className="auth-panel" aria-labelledby="formtitle">
						<h2 className="auth-panel-title" id="formtitle">
							{label('login.panel.title')}
						</h2>
						<LoginForm />
					</section>
					<aside className="r3-authtrust" aria-label={label('login.trust.aria')}>
						<p className="eyebrow">{label('login.trust.eyebrow')}</p>
						<ul className="r3-trustlist">
							{trustfacts().map((fact) => (
								<li className="r3-trustfact" key={fact.label}>
									<span className="r3-trustlabel">{fact.label}</span>
									<span className="r3-trustbody">{fact.body}</span>
								</li>
							))}
						</ul>
					</aside>
				</main>

				<footer className="auth-foot">
					<span>{label('login.footer.cookie')}</span>
					<span className="auth-foot-right">{label('login.footer.api')}</span>
				</footer>
			</div>
		</div>
	);
}
