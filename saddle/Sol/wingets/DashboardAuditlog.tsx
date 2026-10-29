// Signal & Ledger: the audit log absorbed from dashboard.js — action,
// user, ip and instant of the entries the main node registers; on the
// static edge, the honest note.
import { useEffect, useState } from 'react';
import { apiresult, asarray, fmtdate, pick } from '../../dashboardlib.ts';
import { label, labelfill } from '../../labels.ts';

type AuditLogProps = {
	/** "api" lists /api/v1/admin/audit; "local" shows the static note. */
	mode: 'api' | 'local';
	/** bumped by the admin refresh-all action. */
	reloadkey: number;
};

export default function AuditLog({ mode, reloadkey }: AuditLogProps) {
	const [items, setitems] = useState<unknown[]>([]);
	const [error, seterror] = useState('');

	useEffect(() => {
		if (mode !== 'api') {
			return undefined;
		}
		let stopped = false;
		(async () => {
			try {
				const result = await apiresult('/api/v1/admin/audit');
				if (stopped) {
					return;
				}
				if (!result.ok) {
					seterror(labelfill('dashboard.audit.unavailable', { status: String(result.status) }));
					return;
				}
				seterror('');
				setitems(asarray(result.body, ['entries', 'audit', 'items', 'data', 'list', 'logs']));
			} catch {
				if (!stopped) {
					seterror(label('dashboard.audit.unreachable'));
				}
			}
		})();
		return () => {
			stopped = true;
		};
	}, [mode]);

	if (mode === 'local') {
		return <p className="dash-empty">{label('dashboard.audit.localNote')}</p>;
	}

	return (
		<div>
			<div
				className="dash-tablescroll"
				// biome-ignore lint/a11y/noNoninteractiveTabindex: deliberate wcag scrollable-region pattern: the tabIndex keeps the overflowing table keyboard-scrollable; the rows are display data and the interactive cells (none here) use real buttons
				tabIndex={0}
				role="region"
				aria-label={label('dashboard.audit.tableAria')}
			>
				<table>
					{items.length === 0 && error === '' && (
						<caption className="dash-empty">{label('dashboard.audit.empty')}</caption>
					)}
					<thead>
						<tr>
							<th scope="col">{label('dashboard.audit.colAction')}</th>
							<th scope="col">{label('dashboard.audit.colUser')}</th>
							<th scope="col">{label('dashboard.audit.colIp')}</th>
							<th scope="col">{label('dashboard.audit.colWhen')}</th>
						</tr>
					</thead>
					<tbody>
						{items.map((entry) => {
							const action = String(pick(entry, ['action', 'type', 'event'], '?'));
							const username = String(
								pick(entry, ['username', 'actor', 'by', 'user', 'userid', 'user_id'], '-'),
							);
							const ip = String(pick(entry, ['ip', 'sourceIp', 'address'], '-'));
							return (
								<tr key={`${action}|${username}|${ip}`}>
									<td>{action}</td>
									<td>{username}</td>
									<td className="wrapcell">{ip}</td>
									<td>{fmtdate(pick(entry, ['at', 'ts', 'time', 'createdAt', 'when'], null))}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			{error !== '' && <p className="dash-panelerror">{error}</p>}
		</div>
	);
}
