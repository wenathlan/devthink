// Signal & Ledger: the account panel absorbed from dashboard.js — dl of
// session fields (api) or the browser-local account (static edge),
// with the backup/restore keyfile covering a full storage wipe. the widget
// owns its states: the loading skeleton before the session lands, the busy
// flag on the backup controls and the inline status line instead of a
// browser dialog.
import { useRef, useState } from 'react';
import type { SessionUser } from '../../../dashboardlib.ts';
import { fmtdate } from '../../../dashboardlib.ts';
import { adminusers, exportaccounts, importaccounts } from '../../../localauth.ts';

/** the local browser session normalized at boot (defensive read). */
export type LocalSessionView = {
	user: string;
	role: string;
	issuedat: number;
	expiresat: number;
};

type AccountPanelProps = {
	/** "api" renders the /auth/me account; "local" the browser session. */
	mode: 'api' | 'local';
	/** the normalized account (api mode; null while the session boots). */
	user: SessionUser | null;
	/** the normalized local session (local mode). */
	local: LocalSessionView | null;
};

export default function AccountPanel({ mode, user, local }: AccountPanelProps) {
	const fileref = useRef<HTMLInputElement>(null);
	const [busy, setbusy] = useState(false);
	const [status, setstatus] = useState('');

	/** downloads the accounts keyfile (salt + hash only, never passwords). */
	async function backup() {
		setbusy(true);
		setstatus('');
		try {
			const count = await exportaccounts();
			setstatus(
				count > 0
					? `backup downloaded (${count} account(s)). keep the file safe; it restores every account after a full browser wipe.`
					: 'no accounts to back up yet.',
			);
		} catch {
			setstatus('the backup download failed.');
		}
		setbusy(false);
	}

	/** imports accounts from the chosen keyfile (merge, never overwrite). */
	async function restore(file: File) {
		setbusy(true);
		setstatus('');
		try {
			const imported = await importaccounts(file);
			setstatus(
				imported > 0
					? `${imported} account(s) restored from the backup.`
					: 'no new accounts in that backup (already present or invalid).',
			);
			window.location.reload();
		} catch (error) {
			const message = error instanceof Error && error.message ? error.message : 'import failed.';
			setstatus(message);
			setbusy(false);
		}
	}

	if (mode === 'local' && local !== null) {
		const isadmin = local.role === 'admin';
		return (
			<div>
				<dl className="dash-kv">
					<dt>username</dt>
					<dd>{local.user}</dd>
					<dt>role</dt>
					<dd>{isadmin ? `admin (CODEOWNERS allowlist: ${adminusers.join(', ')})` : 'user'}</dd>
					<dt>mode</dt>
					<dd>
						local browser account (static edge; pbkdf2 in localstorage, never synced; the built-in
						admin seed survives storage resets)
					</dd>
					<dt>signed in</dt>
					<dd>{fmtdate(new Date(local.issuedat).toISOString())}</dd>
					<dt>expires</dt>
					<dd>{fmtdate(new Date(local.expiresat).toISOString())}</dd>
				</dl>
				{/* account backup controls: the keyfile covers a full wipe (the
            IndexedDB mirror already covers partial clears). */}
				<div className="dash-actions">
					<button type="button" className="dash-btn" disabled={busy} onClick={() => void backup()}>
						backup accounts
					</button>
					<button
						type="button"
						className="dash-btn"
						disabled={busy}
						onClick={() => {
							fileref.current?.click();
						}}
					>
						restore accounts
					</button>
				</div>
				{status !== '' && (
					<p className="dash-statusnote" role="status" aria-live="polite">
						{status}
					</p>
				)}
				<input
					ref={fileref}
					type="file"
					accept="application/json,.json"
					hidden
					onChange={(event) => {
						const file = event.target.files?.[0];
						if (file !== undefined) {
							void restore(file);
						}
					}}
				/>
			</div>
		);
	}

	/* api mode: the account is null only while the session bootstrap runs —
	   the skeleton is the honest load, never a invented field */
	const account = user;
	return (
		<dl className="dash-kv">
			<dt>username</dt>
			<dd>{account === null ? <span className="dash-skeleton" /> : account.username}</dd>
			<dt>role</dt>
			<dd>{account === null ? <span className="dash-skeleton" /> : account.role}</dd>
			<dt>created</dt>
			<dd>{account === null ? <span className="dash-skeleton" /> : fmtdate(account.createdat)}</dd>
			<dt>last login</dt>
			<dd>
				{account === null ? <span className="dash-skeleton" /> : fmtdate(account.lastloginat)}
			</dd>
			{account?.id !== null && account?.id !== undefined && (
				<>
					<dt>id</dt>
					<dd>{String(account.id)}</dd>
				</>
			)}
		</dl>
	);
}
