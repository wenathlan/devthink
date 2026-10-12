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
import LoginForm from './LoginForm';

export * from './LoginForm';

/** meta description carried by the absorbed static page. */
export const loginpagedescription =
	'saddle sign in: username and password only, session carried by the saddlesession cookie';

/** the real session facts of the trust rail (the page's own absorbed copy). */
const trustfacts = [
	{
		label: 'session',
		body: 'the saddlesession cookie, httponly — nothing sensitive in localstorage.',
	},
	{ label: 'transport', body: 'the self-hosted node api · no serverless functions.' },
	{ label: 'errors', body: 'generic on purpose — no user enumeration, no cause leak.' },
	{
		label: 'fallback',
		body: 'no api at this base: accounts stay browser-local on the static edge.',
	},
];

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
						<span className="brand-wordmark">saddle</span>
					</Link>
					<span className="auth-tagline">sign in</span>
				</header>

				<main className="r3-authgrid">
					<section className="auth-panel" aria-labelledby="formtitle">
						<h2 className="auth-panel-title" id="formtitle">
							account
						</h2>
						<LoginForm />
					</section>
					<aside className="r3-authtrust" aria-label="session facts">
						<p className="eyebrow">the trust rail</p>
						<ul className="r3-trustlist">
							{trustfacts.map((fact) => (
								<li className="r3-trustfact" key={fact.label}>
									<span className="r3-trustlabel">{fact.label}</span>
									<span className="r3-trustbody">{fact.body}</span>
								</li>
							))}
						</ul>
					</aside>
				</main>

				<footer className="auth-foot">
					<span>session cookie: saddlesession (httponly)</span>
					<span className="auth-foot-right">self-hosted node api · no serverless functions</span>
				</footer>
			</div>
		</div>
	);
}
