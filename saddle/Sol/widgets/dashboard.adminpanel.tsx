// Signal & Ledger: the admin view absorbed from dashboard.js — overview
// cards with global refresh, mesh nodes, users, global sandboxes and
// audit; on the static edge, the browser's own overview.
import { useEffect, useState } from 'react';
import { apiresult, fmtuptime, pick, readlocalsandboxes } from '../../dashboardlib.ts';
import { label } from '../../labels.ts';
import { available } from '../../localauth.ts';
import AuditLog from './dashboard.auditlog.tsx';
import GlobalSandboxesTable from './dashboard.globalsandboxestable.tsx';
import MeshNodesTable from './dashboard.meshnodestable.tsx';
import UsersTable from './dashboard.userstable.tsx';

type AdminPanelProps = {
	/** "api" reads the admin surface; "local" the browser-local overview. */
	mode: 'api' | 'local';
};

/** the six overview counters. */
type Overview = {
	users: string;
	nodes: string;
	sandboxes: string;
	sessions: string;
	events: string;
	uptime: string;
};

/** the honest failure state: every counter names its absence. */
function unavailableoverview(): Overview {
	const na = label('dashboard.admin.na');
	return { users: na, nodes: na, sandboxes: na, sessions: na, events: na, uptime: na };
}

/** the browser-local overview of the static edge admin. */
function localoverview(): Overview {
	let accounts = 0;
	try {
		const raw = window.localStorage.getItem('saddle_local_users');
		const parsed = raw ? JSON.parse(raw) : {};
		if (parsed !== null && typeof parsed === 'object') {
			accounts = Object.keys(parsed as Record<string, unknown>).length;
		}
	} catch {
		/* no registry in this browser */
	}
	const localboxes = available() ? readlocalsandboxes().length : 0;
	return {
		users: String(accounts),
		nodes: label('dashboard.admin.localNodes'),
		sandboxes: String(localboxes),
		sessions: label('dashboard.admin.localSessions'),
		events: label('dashboard.admin.na'),
		uptime: label('dashboard.admin.na'),
	};
}

export default function AdminPanel({ mode }: AdminPanelProps) {
	/* null while the overview loads: the cards render the honest skeleton */
	const [overview, setoverview] = useState<Overview | null>(null);
	const [reloadkey, setreloadkey] = useState(0);

	useEffect(() => {
		if (mode === 'local') {
			setoverview(localoverview());
			return;
		}
		let stopped = false;
		(async () => {
			try {
				const result = await apiresult('/api/v1/admin/overview');
				if (stopped) {
					return;
				}
				if (!result.ok || result.body === null || typeof result.body !== 'object') {
					setoverview(unavailableoverview());
					return;
				}
				const body = result.body as Record<string, unknown>;
				const counts =
					body.counts !== null && typeof body.counts === 'object'
						? body.counts
						: body.overview !== null && typeof body.overview === 'object'
							? body.overview
							: body;
				setoverview({
					users: String(pick(counts, ['users', 'userCount', 'totalUsers', 'usercount'], label('dashboard.admin.na'))),
					nodes: String(pick(counts, ['nodes', 'nodeCount', 'totalNodes', 'nodecount'], label('dashboard.admin.na'))),
					sandboxes: String(
						pick(counts, ['sandboxes', 'sandboxCount', 'totalSandboxes'], label('dashboard.admin.na')),
					),
					sessions: String(pick(counts, ['sessions', 'sessionCount', 'totalSessions'], label('dashboard.admin.na'))),
					events: String(pick(counts, ['events', 'eventCount', 'totalEvents'], label('dashboard.admin.na'))),
					uptime: fmtuptime(pick(counts, ['uptime', 'uptimeSeconds', 'uptime_seconds'], 0)),
				});
			} catch {
				if (!stopped) {
					setoverview(unavailableoverview());
				}
			}
		})();
		return () => {
			stopped = true;
		};
	}, [mode, reloadkey]);

	return (
		<div>
			<section className="dash-panel" aria-labelledby="overtitle">
				<h2 id="overtitle">{label('dashboard.admin.overview')}</h2>
				<div className="dash-cards">
					<div className="dash-card">
						<div className="k">{label('dashboard.card.users')}</div>
						<div className="v">
							{overview === null ? <span className="dash-skeleton" /> : overview.users}
						</div>
					</div>
					<div className="dash-card">
						<div className="k">{label('dashboard.card.nodes')}</div>
						<div className="v">
							{overview === null ? <span className="dash-skeleton" /> : overview.nodes}
						</div>
					</div>
					<div className="dash-card">
						<div className="k">{label('dashboard.card.sandboxes')}</div>
						<div className="v">
							{overview === null ? <span className="dash-skeleton" /> : overview.sandboxes}
						</div>
					</div>
					<div className="dash-card">
						<div className="k">{label('dashboard.card.sessions')}</div>
						<div className="v">
							{overview === null ? <span className="dash-skeleton" /> : overview.sessions}
						</div>
					</div>
					<div className="dash-card">
						<div className="k">{label('dashboard.card.events')}</div>
						<div className="v">
							{overview === null ? <span className="dash-skeleton" /> : overview.events}
						</div>
					</div>
					<div className="dash-card">
						<div className="k">{label('dashboard.card.uptime')}</div>
						<div className="v">
							{overview === null ? <span className="dash-skeleton" /> : overview.uptime}
						</div>
					</div>
				</div>
				<div className="dash-actions">
					<button
						type="button"
						className="button"
						aria-label={label('dashboard.admin.refreshAria')}
						aria-busy={overview === null ? 'true' : undefined}
						onClick={() => {
							setoverview(null);
							setreloadkey((key) => key + 1);
						}}
					>
						{label('dashboard.admin.refresh')}
					</button>
				</div>
			</section>

			<section className="dash-panel" aria-labelledby="nodestitle">
				<h2 id="nodestitle">{label('dashboard.admin.nodes')}</h2>
				<MeshNodesTable mode={mode} reloadkey={reloadkey} />
			</section>

			<section className="dash-panel" aria-labelledby="userstitle">
				<h2 id="userstitle">{label('dashboard.admin.users')}</h2>
				<UsersTable mode={mode} reloadkey={reloadkey} />
			</section>

			<section className="dash-panel" aria-labelledby="boxestitle">
				<h2 id="boxestitle">{label('dashboard.admin.sandboxes')}</h2>
				<GlobalSandboxesTable mode={mode} reloadkey={reloadkey} />
			</section>

			<section className="dash-panel" aria-labelledby="audittitle">
				<h2 id="audittitle">{label('dashboard.admin.audit')}</h2>
				<AuditLog mode={mode} reloadkey={reloadkey} />
			</section>
		</div>
	);
}
