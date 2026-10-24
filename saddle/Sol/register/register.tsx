/**
 * register page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Account creation page: faithful absorption of register.html + register.js —
// username charset validation (3-32 of [a-z0-9.-], lowercased as the visitor
// types), password strength meter, confirmation match, then POST
// /api/v1/auth/register with the localauth fallback for the static edge.
// R3-saddle: one instrument card with an asymmetric interior — the form
// (1.2fr) beside the trust rail (1fr) that carries the live rules checklist,
// the strength meter and the real policy facts; 44px inputs, sand focus ring.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { apibase, apierrormessage, apifetch, apistatustext } from '../../api';
import { label } from '../../labels.ts';
import { PasswordConfirm as PasswordConfirm } from '../widgets';
import { PasswordMeter as PasswordMeter } from '../widgets';
import { UsernameRules as UsernameRules, usernamere } from '../widgets';

export * from '../widgets';
export * from '../widgets';
export * from '../widgets';

/** meta description carried by the absorbed static page. */
export const registerpagedescription =
	'saddle account creation: username and password only, no e-mail by project policy';

/** state of the static-edge detection: does an api answer at this base? */
type ApiMode = 'probing' | 'remote' | 'local';

/** the real policy facts of the trust rail: the labels ride the store. */
function trustfacts(): { label: string; body: string }[] {
	return [
		{
			label: label('register.trust.identityLabel'),
			body: label('register.trust.identityBody'),
		},
		{
			label: label('register.trust.hashingLabel'),
			body: label('register.trust.hashingBody'),
		},
		{
			label: label('register.trust.charsetLabel'),
			body: label('register.trust.charsetBody'),
		},
		{
			label: label('register.trust.sessionLabel'),
			body: label('register.trust.sessionBody'),
		},
	];
}

/**
 * the create-account page: brand lockup, the instrument card (form beside
 * the live trust rail) and the policy footer.
 */
export default function Register() {
	const [, navigate] = useLocation();
	const usernameref = useRef<HTMLInputElement>(null);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmation, setConfirmation] = useState('');
	const [usernameinvalid, setUsernameinvalid] = useState(false);
	const [passwordinvalid, setPasswordinvalid] = useState(false);
	const [confirminvalid, setConfirminvalid] = useState(false);
	const [error, setError] = useState('');
	const [pending, setPending] = useState(false);
	const [succeeded, setSucceeded] = useState(false);
	const [apimode, setApimode] = useState<ApiMode>('probing');
	const [statusline, setStatusline] = useState(apistatustext());

	/** static edge detection: probe the api once; no answer -> local mode. */
	useEffect(() => {
		let cancelled = false;
		const detect = async () => {
			const base = apibase();
			const localauth = await import('../../localauth.ts');
			const apianswers = await localauth.probe(base);
			if (cancelled) return;
			if (!apianswers) {
				setApimode('local');
				setStatusline(label('register.status.local'));
			} else {
				setApimode('remote');
			}
		};
		detect().catch(() => {
			if (!cancelled) setApimode('local');
		});
		return () => {
			cancelled = true;
		};
	}, []);

	/** username field focus, like the static page controller. */
	useEffect(() => {
		usernameref.current?.focus();
	}, []);

	/** auto-lowercase the username while typing (selection restored). */
	const onusernamechange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const input = event.target;
		const lowered = input.value.toLowerCase();
		if (lowered !== input.value) {
			const start = input.selectionStart ?? input.value.length;
			const position = start - (input.value.length - lowered.length);
			input.value = lowered;
			try {
				input.setSelectionRange(position, position);
			} catch {
				/* selection restore is cosmetic */
			}
		}
		setUsername(input.value);
	};

	const onsubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError('');

		let valid = true;
		if (!usernamere.test(username)) {
			setUsernameinvalid(true);
			valid = false;
		} else {
			setUsernameinvalid(false);
		}
		if (password.length < 8) {
			setPasswordinvalid(true);
			valid = false;
		} else {
			setPasswordinvalid(false);
		}
		if (password !== confirmation) {
			setConfirminvalid(true);
			valid = false;
		} else {
			setConfirminvalid(false);
		}
		if (!valid) {
			setError(label('register.error.fixFields'));
			return;
		}

		setPending(true);

		/* static edge: no api at this base -> browser-local account */
		if (apimode === 'local') {
			try {
				const localauth = await import('../../localauth.ts');
				await localauth.register(username, password);
				setSucceeded(true);
				navigate('/dashboard');
			} catch (registererror) {
				const message =
					registererror instanceof Error ? registererror.message : label('register.error.localFailed');
				setError(message);
				setPending(false);
			}
			return;
		}

		try {
			const response = await apifetch('/api/v1/auth/register', {
				method: 'POST',
				body: JSON.stringify({ username, password }),
			});
			if (response.ok) {
				/* the backend sets the saddlesession cookie: straight to the dashboard */
				setSucceeded(true);
				navigate('/dashboard');
				return;
			}
			if (response.status === 404) {
				setError(label('register.error.noRegister'));
			} else {
				let message = label('register.error.generic');
				if (response.status === 400 || response.status === 409 || response.status === 429) {
					const payloadmessage = await apierrormessage(response);
					if (payloadmessage !== null) {
						message = payloadmessage;
					}
				}
				setError(message);
			}
		} catch {
			setError(label('register.error.unreachable'));
		}
		setPending(false);
	};

	const hintstate =
		username.length > 0 && !usernamere.test(username)
			? 'auth-hint bad'
			: usernamere.test(username)
				? 'auth-hint ok'
				: 'auth-hint';

	return (
		<div className="auth-frame">
			<div className="r3-authcard r3-authcard-wide">
				<header className="auth-head">
					{/* logo discipline: the wordmark speaks — the mark stays in the window title bar */}
					<Link href="/" className="brand-lockup">
						<span className="brand-wordmark">{label('register.brand')}</span>
					</Link>
					<span className="auth-tagline">{label('register.tagline')}</span>
				</header>

				<main className="r3-authgrid">
					<section className="auth-panel" aria-labelledby="formtitle">
						<h2 className="auth-panel-title" id="formtitle">
							{label('register.panel.title')}
						</h2>
						{succeeded ? (
							<div className="auth-success">
								<p className="auth-success-title" role="status" aria-live="polite">
									{label('register.success.title')}
								</p>
								<p className="auth-statusline">
									{label('register.success.continue')}{' '}
									<Link href="/dashboard">{label('register.success.dashboardLink')}</Link>
									<span aria-hidden="true"> · </span>
									<Link href="/login">{label('register.success.signinLink')}</Link>
								</p>
							</div>
						) : (
							<form className="auth-form" noValidate onSubmit={onsubmit}>
								<div className="auth-field">
									<label htmlFor="username">{label('register.field.username')}</label>
									<input
										ref={usernameref}
										className="auth-input"
										id="username"
										name="username"
										type="text"
										autoComplete="username"
										spellCheck={false}
										autoCapitalize="none"
										required
										minLength={3}
										maxLength={32}
										pattern="[a-z0-9.-]{3,32}"
										aria-invalid={usernameinvalid ? 'true' : undefined}
										aria-describedby="usernamehint"
										value={username}
										onChange={onusernamechange}
									/>
									<p className={hintstate} id="usernamehint">
										{label('register.hint.username')}
									</p>
								</div>
								<div className="auth-field">
									<label htmlFor="password">{label('register.field.password')}</label>
									<input
										className="auth-input"
										id="password"
										name="password"
										type="password"
										autoComplete="new-password"
										required
										minLength={8}
										aria-invalid={passwordinvalid ? 'true' : undefined}
										aria-describedby="passwordhint"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
									/>
								</div>
								<PasswordConfirm
									password={password}
									value={confirmation}
									invalid={confirminvalid}
									onChange={setConfirmation}
								/>
								{error !== '' && (
									<p className="auth-formerror" role="alert" aria-live="polite">
										{error}
									</p>
								)}
								<button
									className="button button-primary auth-submit"
									type="submit"
									disabled={pending}
								>
									{pending ? label('register.submitPending') : label('register.submit')}
								</button>
							</form>
						)}
					</section>
					<aside className="r3-authtrust" aria-label={label('register.trust.aria')}>
						<p className="eyebrow">{label('register.trust.eyebrow')}</p>
						<UsernameRules value={username} />
						<div className="r3-trustmeter">
							<PasswordMeter password={password} />
						</div>
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

				<p className="auth-statusline">{statusline}</p>
				<p className="auth-statusline">
					{label('register.already')} <Link href="/login">{label('register.signinLink')}</Link>
					<span aria-hidden="true"> · </span>
					<Link href="/console">{label('register.backConsole')}</Link>
				</p>

				<footer className="auth-foot">
					<span>{label('register.footer.policy')}</span>
					<span className="auth-foot-right">{label('register.footer.hashing')}</span>
				</footer>
			</div>
		</div>
	);
}
