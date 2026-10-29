// Signal & Ledger: the mesh nodes table absorbed from dashboard.js —
// ping through the signed /api/v1/mesh/ping route with fallback to the
// browser latency probe; on the static edge, the "this browser" row.
import { useEffect, useState } from 'react';
import { apiresult, asarray, chipclass, fmtdate, pick } from '../../dashboardlib.ts';
import { label, labelfill } from '../../labels.ts';

type MeshNodesTableProps = {
	/** "api" lists /api/v1/admin/nodes; "local" renders the browser row. */
	mode: 'api' | 'local';
	/** bumped by the admin refresh-all action. */
	reloadkey: number;
};

/** one ping outcome per node url. */
type PingState = { busy: boolean; result: string };

/**
 * pings one mesh node: the primary contract posts /api/v1/mesh/ping (the
 * server-side signed mesh); when the node does not expose it the browser
 * falls back to a latency probe of the node health endpoint.
 */
async function meshping(url: string): Promise<string> {
	try {
		const post = await apiresult('/api/v1/mesh/ping', {
			method: 'POST',
			body: JSON.stringify({ url }),
		});
		if (post.ok) {
			const rtt = pick(post.body, ['rttMs', 'rtt', 'latencyMs', 'latency'], null);
			return rtt !== null
				? labelfill('dashboard.mesh.pongMesh', { rtt: String(rtt) })
				: label('dashboard.mesh.pongMeshPlain');
		}
	} catch {
		/* fall through to the client probe */
	}
	try {
		const controller = new AbortController();
		const timer = setTimeout(() => {
			controller.abort();
		}, 4000);
		const started = performance.now();
		await fetch(`${String(url).replace(/\/+$/, '')}/api/v1/health`, {
			mode: 'no-cors',
			signal: controller.signal,
		});
		clearTimeout(timer);
		return labelfill('dashboard.mesh.pongProbe', {
			ms: String(Math.max(1, Math.round(performance.now() - started))),
		});
	} catch {
		return label('dashboard.mesh.unreachable');
	}
}

export default function MeshNodesTable({ mode, reloadkey }: MeshNodesTableProps) {
	const [nodes, setnodes] = useState<unknown[]>([]);
	const [error, seterror] = useState('');
	const [pings, setpings] = useState<Record<string, PingState>>({});

	useEffect(() => {
		if (mode !== 'api') {
			return undefined;
		}
		let stopped = false;
		(async () => {
			try {
				const result = await apiresult('/api/v1/admin/nodes');
				if (stopped) {
					return;
				}
				if (!result.ok) {
					setnodes([]);
					seterror(labelfill('dashboard.mesh.nodeUnavailable', { status: String(result.status) }));
					return;
				}
				seterror('');
				setnodes(asarray(result.body, ['nodes', 'items', 'data', 'list']));
			} catch {
				if (!stopped) {
					seterror(label('dashboard.mesh.nodesUnreachable'));
				}
			}
		})();
		return () => {
			stopped = true;
		};
	}, [mode]);

	/** runs one ping and paints the result cell beside the button. */
	function runping(url: string) {
		setpings((previous) => ({
			...previous,
			[url]: { busy: true, result: label('dashboard.mesh.pinging') },
		}));
		void meshping(url).then((result) => {
			setpings((previous) => ({ ...previous, [url]: { busy: false, result } }));
		});
	}

	return (
		<div>
			<p className="dash-statusnote">{label('dashboard.mesh.pollNote')}</p>
			<div
				className="dash-tablescroll"
				// biome-ignore lint/a11y/noNoninteractiveTabindex: deliberate wcag scrollable-region pattern: the tabIndex keeps the overflowing table keyboard-scrollable; the interactive cells are real buttons, the region itself only scrolls
				tabIndex={0}
				role="region"
				aria-label={label('dashboard.mesh.tableAria')}
			>
				<table>
					{mode === 'api' && nodes.length === 0 && error === '' && (
						<caption className="dash-empty">{label('dashboard.mesh.empty')}</caption>
					)}
					<thead>
						<tr>
							<th scope="col">{label('dashboard.mesh.colUrl')}</th>
							<th scope="col">{label('dashboard.mesh.colRegion')}</th>
							<th scope="col">{label('dashboard.mesh.colStatus')}</th>
							<th scope="col">{label('dashboard.mesh.colHeartbeat')}</th>
							<th scope="col">{label('dashboard.mesh.colPing')}</th>
						</tr>
					</thead>
					<tbody>
						{mode === 'local' ? (
							<tr>
								<td>{label('dashboard.mesh.localNode')}</td>
								<td>{label('dashboard.mesh.localRegion')}</td>
								<td>{label('dashboard.mesh.localStatus')}</td>
								<td>{label('dashboard.mesh.na')}</td>
							</tr>
						) : (
							nodes.map((node) => {
								const url = String(pick(node, ['url', 'endpoint', 'address', 'host'], '?'));
								const region = String(pick(node, ['region', 'location', 'zone'], '-'));
								const status = String(pick(node, ['status', 'state'], '?'));
								const heartbeat = pick(
									node,
									['lastHeartbeat', 'lastHeartbeatAt', 'lastSeen', 'last_heartbeat'],
									null,
								);
								const pingstate = pings[url];
								return (
									<tr key={url}>
										<td className="wrapcell">{url}</td>
										<td>{region}</td>
										<td>
											<span className={chipclass(status)}>{status}</span>
										</td>
										<td>{fmtdate(heartbeat)}</td>
											<td>
												<button
													type="button"
													className="dash-btn mini"
													aria-label={labelfill('dashboard.mesh.pingAria', { url })}
													aria-busy={pingstate?.busy === true ? 'true' : undefined}
													disabled={pingstate?.busy === true}
													onClick={() => {
														runping(url);
													}}
												>
													{label('dashboard.mesh.ping')}
												</button>{' '}
												<span className="wrapcell" role="status" aria-live="polite">
													{pingstate === undefined ? label('dashboard.mesh.nopong') : pingstate.result}
												</span>
											</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
			{error !== '' && <p className="dash-panelerror">{error}</p>}
		</div>
	);
}
