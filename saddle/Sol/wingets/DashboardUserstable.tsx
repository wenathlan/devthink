// Signal & Ledger: the users table absorbed from dashboard.js — client-side
// search by username, account fields only (hash and salt never leave the
// api); on the static edge, the browser-local registry.
import { useEffect, useState } from 'react';
import { apiresult, asarray, chipclass, fmtdate, pick } from '../../dashboardlib.ts';
import { label, labelfill } from '../../labels.ts';
import { available, roleof } from '../../localauth.ts';

type UsersTableProps = {
	/** "api" lists /api/v1/admin/users; "local" the browser account registry. */
	mode: 'api' | 'local';
	/** bumped by the admin refresh-all action. */
	reloadkey: number;
};

/** reads the local account names (defensive; the api mode never lands here). */
function localaccountnames(): string[] {
	try {
		const raw = window.localStorage.getItem('saddle_local_users');
		const parsed = raw ? JSON.parse(raw) : {};
		if (parsed !== null && typeof parsed === 'object') {
			return Object.keys(parsed as Record<string, unknown>);
		}
	} catch {
		/* no registry or unreadable storage: the empty table applies */
	}
	return [];
}

export default function UsersTable({ mode, reloadkey }: UsersTableProps) {
	const [users, setusers] = useState<unknown[]>([]);
	const [error, seterror] = useState('');
	const [query, setquery] = useState('');

	useEffect(() => {
		if (mode === 'local') {
			seterror('');
			setusers(available() ? localaccountnames() : []);
			return;
		}
		let stopped = false;
		(async () => {
			try {
				const result = await apiresult('/api/v1/admin/users');
				if (stopped) {
					return;
				}
				if (!result.ok) {
					seterror(labelfill('dashboard.users.unavailable', { status: String(result.status) }));
					return;
				}
				seterror('');
				setusers(asarray(result.body, ['users', 'items', 'data', 'list']));
			} catch {
				if (!stopped) {
					seterror(label('dashboard.users.unreachable'));
				}
			}
		})();
		return () => {
			stopped = true;
		};
	}, [mode]);

	const needle = query.trim().toLowerCase();
	const rows = users.filter((user) => {
		const username =
			mode === 'local' ? String(user) : String(pick(user, ['username', 'name', 'user'], ''));
		return needle === '' || username.toLowerCase().includes(needle);
	});

	return (
		<div>
			<div className="dash-field" style={{ maxWidth: '340px' }}>
				<label htmlFor="usersearch">{label('dashboard.users.searchLabel')}</label>
				<input
					type="search"
					id="usersearch"
					placeholder={label('dashboard.users.searchPlaceholder')}
					aria-label={label('dashboard.users.searchAria')}
					value={query}
					onChange={(event) => {
						setquery(event.target.value);
					}}
				/>
			</div>
			<div
				className="dash-tablescroll"
				// biome-ignore lint/a11y/noNoninteractiveTabindex: deliberate wcag scrollable-region pattern: the tabIndex keeps the overflowing table keyboard-scrollable; the rows are display data and the interactive cells (none here) use real buttons
				tabIndex={0}
				role="region"
				aria-label={label('dashboard.users.tableAria')}
			>
				<table>
					{rows.length === 0 && error === '' && (
						<caption className="dash-empty">
							{needle === ''
								? mode === 'local'
									? label('dashboard.users.emptyLocal')
									: label('dashboard.users.empty')
								: labelfill('dashboard.users.noMatch', { needle })}
						</caption>
					)}
					<thead>
						<tr>
							<th scope="col">{label('dashboard.users.colUsername')}</th>
							<th scope="col">{label('dashboard.users.colRole')}</th>
							<th scope="col">{label('dashboard.users.colLastLogin')}</th>
							<th scope="col">{label('dashboard.users.colCreated')}</th>
						</tr>
					</thead>
					<tbody>
						{mode === 'local'
							? rows.map((name) => (
									<tr key={String(name)}>
										<td>{String(name)}</td>
										<td>{roleof(String(name))}</td>
										<td>{label('dashboard.users.localCell')}</td>
									</tr>
								))
							: rows.map((user) => {
									const username = String(pick(user, ['username', 'name', 'user'], '?'));
									const role = String(pick(user, ['role'], 'user'));
									/* account fields only: hash and salt keys are ignored */
									return (
										<tr key={username}>
											<td>{username}</td>
											<td>
												<span className={chipclass(role)}>{role}</span>
											</td>
											<td>
												{fmtdate(pick(user, ['lastLoginAt', 'last_login_at', 'lastlogin'], null))}
											</td>
											<td>{fmtdate(pick(user, ['createdAt', 'created_at', 'createdat'], null))}</td>
										</tr>
									);
								})}
					</tbody>
				</table>
			</div>
			{mode !== 'local' && (
				<p className="dash-statusnote">{label('dashboard.users.hashesNote')}</p>
			)}
			{error !== '' && <p className="dash-panelerror">{error}</p>}
		</div>
	);
}
