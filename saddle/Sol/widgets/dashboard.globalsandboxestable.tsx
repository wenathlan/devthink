// Signal & Ledger: the global sandbox table absorbed from dashboard.js —
// db rows (flat or enveloped) for the main node admin; on the static
// edge, the honest note pointing to the user view.
import { useEffect, useState } from 'react';
import { apiresult, asarray, chipclass, fmtdate, pick } from '../../dashboardlib.ts';
import { label, labelfill } from '../../labels.ts';

type GlobalSandboxesTableProps = {
	/** "api" lists /api/v1/admin/sandboxes; "local" shows the static note. */
	mode: 'api' | 'local';
	/** bumped by the admin refresh-all action. */
	reloadkey: number;
};

export default function GlobalSandboxesTable({ mode, reloadkey }: GlobalSandboxesTableProps) {
	const [items, setitems] = useState<unknown[]>([]);
	const [error, seterror] = useState('');

	useEffect(() => {
		if (mode !== 'api') {
			return undefined;
		}
		let stopped = false;
		(async () => {
			try {
				const result = await apiresult('/api/v1/admin/sandboxes');
				if (stopped) {
					return;
				}
				if (!result.ok) {
					seterror(labelfill('dashboard.global.unavailable', { status: String(result.status) }));
					return;
				}
				seterror('');
				setitems(asarray(result.body, ['sandboxes', 'items', 'data', 'list']));
			} catch {
				if (!stopped) {
					seterror(label('dashboard.global.unreachable'));
				}
			}
		})();
		return () => {
			stopped = true;
		};
	}, [mode, reloadkey]);

	if (mode === 'local') {
		return <p className="dash-empty">{label('dashboard.global.localNote')}</p>;
	}

	return (
		<div>
			<div
				className="dash-tablescroll"
				tabIndex={0}
				role="region"
				aria-label={label('dashboard.global.tableAria')}
			>
				<table>
					{items.length === 0 && error === '' && (
						<caption className="dash-empty">{label('dashboard.global.empty')}</caption>
					)}
					<thead>
						<tr>
							<th scope="col">{label('dashboard.global.colId')}</th>
							<th scope="col">{label('dashboard.global.colOwner')}</th>
							<th scope="col">{label('dashboard.global.colState')}</th>
							<th scope="col">{label('dashboard.global.colSpec')}</th>
							<th scope="col">{label('dashboard.global.colCreated')}</th>
							<th scope="col">{label('dashboard.global.colExpires')}</th>
						</tr>
					</thead>
					<tbody>
						{items.map((record) => {
							/* admin rows may be flat db rows or enveloped public views */
							const specobj = pick(record, ['spec'], null);
							const spec = specobj !== null && typeof specobj === 'object' ? specobj : record;
							const owner = pick(
								record,
								['owner', 'username', 'user', 'ownerUsername', 'userid', 'user_id'],
								'-',
							);
							const id = String(pick(record, ['id'], '?'));
							return (
								<tr key={`${id}|${String(owner)}`}>
									<td className="wrapcell">{id}</td>
									<td>{String(owner)}</td>
									<td>
										<span className={chipclass(pick(record, ['state'], '?'))}>
											{String(pick(record, ['state'], '?'))}
										</span>
									</td>
									<td className="wrapcell">
										{[
											String(pick(spec, ['model'], '?')),
											`x${String(pick(spec, ['vcpus'], '?'))}`,
											`${String(pick(spec, ['ramgb', 'ramGb', 'ram'], '?'))}gb`,
											String(pick(spec, ['gpu'], '?')),
										].join(' ')}
									</td>
									<td>{fmtdate(pick(record, ['createdAt', 'createdat', 'created_at'], null))}</td>
									<td>{fmtdate(pick(record, ['expiresAt', 'expiresat', 'expires_at'], null))}</td>
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
