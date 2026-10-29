/**
 * dashboard page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Signal & Ledger: the e2ugh dashboard absorbed into the single interface —
// session via the saddlesession cookie (api) or the browser-local account
// (static edge), user view and admin view in the same React shell.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { apibase } from '../../api';
import type { ApiResult, SessionUser } from '../../dashboardlib';
import { apiresult, noderole, pick } from '../../dashboardlib';
import { label, labelfill } from '../../labels.ts';
/* the explicit .ts suffix keeps the resolution unambiguous while the
 * typed ES module that replaced the window-global localauth.js of the static edge (the original
 * beside the typed module - the same convention the Login page uses. */
import { logout, probe, session as readlocalsession } from '../../localauth.ts';
import { AccountPanel as type, LocalSessionView } from '../wingets';
import { AccountPanel as AccountPanel } from '../wingets';
import { AdminPanel as AdminPanel } from '../wingets';
import { CreateSandboxForm as CreateSandboxForm } from '../wingets';
import { DashboardEventstimeline as EventsTimeline } from '../wingets';
import { SandboxList as SandboxList } from '../wingets';

export * from '../wingets';
export * from '../wingets';
export * from '../wingets';
export * from '../wingets';
export * from '../wingets';
export * from '../wingets';
export * from '../wingets';
export * from '../wingets';
export * from '../wingets';

/** which surface answers: the node api or the static-edge local engine. */
type Phase = 'booting' | 'api' | 'local';

export default function Dashboard() {
	const [, navigate] = useLocation();
	const [phase, setphase] = useState<Phase>('booting');
	const [fatal, setfatal] = useState<string | null>(null);
	const [me, setme] = useState<SessionUser | null>(null);
	const [localview, setlocalview] = useState<LocalSessionView | null>(null);
	const [nodelabel, setnodelabel] = useState(label('dashboard.node.pending'));
	const [tab, settab] = useState<'user' | 'admin'>('user');
	const [sandboxreload, setsandboxreload] = useState(0);
	const [leaving, setleaving] = useState(false);
	const tabrefs = useRef<Record<string, HTMLButtonElement | null>>({});

	/** decorative health read: paints the node role badge. */
	async function loadhealth() {
		try {
			const result = await apiresult('/api/v1/health');
			if (result.ok && result.body !== null && typeof result.body === 'object') {
				setnodelabel(noderole(result.body));
				return;
			}
		} catch {
			/* health is decorative; the badge simply stays neutral */
		}
		setnodelabel(label('dashboard.node.standalone'));
	}

	/** the account bootstrap: /auth/me fills the session or the fatal gate. */
	async function loadme() {
		let result: ApiResult;
		try {
			result = await apiresult('/api/v1/auth/me');
		} catch {
			setfatal(label('dashboard.fatal.apiUnreachable'));
			return;
		}
		if (result.status === 401 || result.status === 403) {
			setfatal(label('dashboard.fatal.needsSession'));
			return;
		}
		if (!result.ok || result.body === null || typeof result.body !== 'object') {
			setfatal(label('dashboard.fatal.payload'));
			return;
		}
		const envelope = result.body as Record<string, unknown>;
		const body =
			envelope.user !== null && typeof envelope.user === 'object'
				? (envelope.user as Record<string, unknown>)
				: envelope;
		setme({
			username: String(pick(body, ['username', 'name', 'user'], 'unknown')),
			role: String(pick(body, ['role'], 'user')).toLowerCase(),
			createdat: pick(body, ['createdAt', 'created_at', 'createdat', 'registeredAt'], null),
			lastloginat: pick(body, ['lastLoginAt', 'last_login_at', 'lastlogin', 'lastLogin'], null),
			id: pick(body, ['id', 'uuid'], null),
		});
	}

	/* boot: probe the api once; no answer -> the static edge takes over with
	 * the browser-local session (localauth), exactly like the original page. */
	useEffect(() => {
		let cancelled = false;
		void (async () => {
			const answers = await probe(apibase());
			if (cancelled) {
				return;
			}
			if (!answers) {
				setphase('local');
				setnodelabel(label('dashboard.node.edge'));
				const raw = (await readlocalsession()) as unknown;
				if (raw === null || raw === undefined) {
					setfatal(label('dashboard.fatal.noLocalSession'));
					return;
				}
				const view = {
					user: String(pick(raw, ['user', 'username'], 'unknown')),
					role: String(pick(raw, ['role'], 'user')),
					issuedat: Number(pick(raw, ['issuedat', 'issuedAt'], Date.now())),
					expiresat: Number(pick(raw, ['expiresat', 'expiresAt'], 0)),
				};
				setlocalview(view);
				setme({
					username: view.user,
					role: view.role === 'admin' ? 'admin' : 'local',
					createdat: null,
					lastloginat: new Date(view.issuedat).toISOString(),
					id: null,
				});
				return;
			}
			setphase('api');
			void loadhealth();
			void loadme();
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	/** ends the session (cookie or local) and returns to the sign in page. */
	async function dolgout() {
		setleaving(true);
		/* clears the local browser session too (no-op on the api mode) */
		void logout();
		try {
			await apiresult('/api/v1/auth/logout', { method: 'POST' });
		} catch {
			/* the cookie may already be gone; proceed to the login page */
		}
		navigate('/login');
	}

	/** selects one tab and moves the roving focus onto it. */
	function selecttab(next: 'user' | 'admin') {
		settab(next);
		requestAnimationFrame(() => {
			tabrefs.current[next]?.focus();
		});
	}

	const mode = phase === 'local' ? 'local' : 'api';
	const adminvisible = me !== null && me.role === 'admin';
	const userbadge =
		me === null
			? label('dashboard.userbadge.pending')
			: mode === 'local'
				? me.role === 'admin'
					? labelfill('dashboard.userbadge.localAdmin', { name: me.username })
					: labelfill('dashboard.userbadge.local', { name: me.username })
				: me.role === 'admin'
					? labelfill('dashboard.userbadge.admin', { name: me.username })
					: me.username;
	const roleclass =
		nodelabel === 'main' || nodelabel === 'clone'
			? `dash-rolebadge ${nodelabel}`
			: 'dash-rolebadge';

	return (
		<div className="dash">
			<div className="dash-wrap">
				<header className="dash-topbar">
					<h1>
						<Link href="/console">{label('dashboard.brand')}</Link>
					</h1>
					<span className="dash-tagline">{label('dashboard.tagline')}</span>
					<span className={roleclass} aria-live="polite">
						{labelfill('dashboard.nodeBadge', { label: nodelabel })}
					</span>
					<span className="dash-spacer" />
					<span className="dash-userbadge">{userbadge}</span>
					<button
						type="button"
						aria-label={label('dashboard.logoutAria')}
						disabled={leaving}
						onClick={() => {
							void dolgout();
						}}
					>
						{label('dashboard.logout')}
					</button>
				</header>

				{fatal !== null && (
					<div className="dash-panel dash-fatal" aria-live="polite">
						<h2>{label('dashboard.fatal.title')}</h2>
						<p>{fatal}</p>
						<div className="dash-actions">
							<Link className="dash-btn" href="/login">
								{label('dashboard.fatal.signin')}
							</Link>
							<Link className="dash-btn" href="/console">
								{label('dashboard.fatal.backConsole')}
							</Link>
						</div>
					</div>
				)}

				{fatal === null && (
					<div
						className="dash-tabs"
						role="tablist"
						aria-label={label('dashboard.tabsAria')}
						onKeyDown={(event) => {
							if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
								return;
							}
							if (adminvisible) {
								event.preventDefault();
								selecttab(tab === 'user' ? 'admin' : 'user');
							}
						}}
					>
						<button
							type="button"
							role="tab"
							id="tab-user"
							ref={(node) => {
								tabrefs.current.user = node;
							}}
							aria-selected={tab === 'user'}
							aria-controls="panel-user"
							tabIndex={tab === 'user' ? 0 : -1}
							onClick={() => {
								selecttab('user');
							}}
						>
							{label('dashboard.tab.user')}
						</button>
						{adminvisible && (
							<button
								type="button"
								role="tab"
								id="tab-admin"
								ref={(node) => {
									tabrefs.current.admin = node;
								}}
								aria-selected={tab === 'admin'}
								aria-controls="panel-admin"
								tabIndex={tab === 'admin' ? 0 : -1}
								onClick={() => {
									selecttab('admin');
								}}
							>
								{label('dashboard.tab.admin')}
							</button>
						)}
					</div>
				)}

				{fatal === null && (
					<div role="tabpanel" id="panel-user" aria-labelledby="tab-user" hidden={tab !== 'user'}>
						<div className="dash-grid2">
							<div>
								<section className="dash-panel" aria-labelledby="boxtitle">
									<h2 id="boxtitle">{label('dashboard.panel.sandboxes')}</h2>
									<CreateSandboxForm
										mode={mode}
										oncreated={() => {
											setsandboxreload((key) => key + 1);
										}}
										onrefresh={() => {
											setsandboxreload((key) => key + 1);
										}}
									/>
									<SandboxList mode={mode} reloadkey={sandboxreload} ready={me !== null} />
								</section>
							</div>
							<div>
								<section className="dash-panel" aria-labelledby="infotitle">
									<h2 id="infotitle">{label('dashboard.panel.account')}</h2>
									<AccountPanel mode={mode} user={me} local={localview} />
								</section>
								<section className="dash-panel" aria-labelledby="eventstitle">
									<h2 id="eventstitle">{label('dashboard.panel.events')}</h2>
									<EventsTimeline mode={mode} ready={me !== null} />
								</section>
							</div>
						</div>
					</div>
				)}

				{fatal === null && adminvisible && (
					<div
						role="tabpanel"
						id="panel-admin"
						aria-labelledby="tab-admin"
						hidden={tab !== 'admin'}
					>
						<AdminPanel mode={mode} />
					</div>
				)}

				<footer className="dash-footer">
					<span>{label('dashboard.footer.cookie')}</span>
					<span>{label('dashboard.footer.storage')}</span>
					<span style={{ marginLeft: 'auto' }}>{label('dashboard.footer.api')}</span>
				</footer>
			</div>
		</div>
	);
}
