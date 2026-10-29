/**
 * console page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Real sandbox console: faithful absorption of console.html + console.js —
// the spec panel, the animated boot sequence, the interactive terminal, the
// bus event timeline, snapshot/stop and the api detection badge. when the
// self-hosted node answers, the sandbox is also created through
// /api/v1/sandboxes and commands run through the api exec endpoint;
// otherwise the same dispatcher runs locally in the browser.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { PageShell } from '../shell/Shell.tsx';
import type { ExecResult, SandboxCreated, SandboxSpecPayload } from '../../api';
import { apibase, apifetch, fetchhealth } from '../../api';
import { label, labelfill } from '../../labels.ts';
import type { SandboxState } from '../../sandbox.ts';
import { bootSequence, cpudata, createSandboxState, dispatch, gpudata } from '../../sandbox.ts';
import { ApiBadge as ApiBadge } from '../wingets';
import { EventsTimeline as type, SandboxEvent, SandboxEventKind } from '../wingets';
import { EventsTimeline as EventsTimeline } from '../wingets';
import { SnapshotControls as SnapshotControls } from '../wingets';
import { SpecPanel as type, SandboxSpecSelection } from '../wingets';
import { SpecPanel as SpecPanel } from '../wingets';
import { Terminal as type, TerminalRow, TerminalState } from '../wingets';
import { Terminal as Terminal } from '../wingets';

export * from '../wingets';
export * from '../wingets';
export * from '../wingets';
export * from '../wingets';
export * from '../wingets';

/** display cap for very large payloads such as cpuinfo at 192 vcpus. */
const displaycap = 120000;

/** the session key the home landing writes and this page reads once (then spent). */
const declaredkey = 'saddle.declared';

/** the handed-over declaration of the landing prompt (base / guest / arch). */
type DeclaredSpec = { base: string | null; os: string | null; arch: string | null };

/** initial spec selection mirroring the static page defaults. */
const initialspec: SandboxSpecSelection = {
	model: cpudata[0].model,
	quotamb: 16,
	vcpus: 8,
	ramgb: 32,
	gpu: gpudata[0].id,
	mig: 'off',
};

/** the sleep used to animate the boot sequence line by line. */
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * the console page: wires the spec panel, terminal, events timeline and
 * lifecycle controls to the browser-pure engine (sandbox.ts) and, when
 * available, the self-hosted /api/v1 contract.
 */
export default function Console() {
	const rowseq = useRef(0);
	const eventseq = useRef(0);
	const engineref = useRef<SandboxState | null>(null);
	const apiref = useRef<string | null>(null);
	const [selection, setSelection] = useState<SandboxSpecSelection>(initialspec);
	const [rows, setRows] = useState<TerminalRow[]>([]);
	const [events, setEvents] = useState<SandboxEvent[]>([]);
	const [running, setRunning] = useState(false);
	const [busy, setBusy] = useState(false);
	const [termstate, setTermstate] = useState<TerminalState>('halted');
	const [prompt, setPrompt] = useState(labelfill('console.prompt', { host: 'saddle' }));
	const [apimode, setApimode] = useState(false);
	const [badgelabel, setBadgelabel] = useState(label('console.badge.local'));
	const [declared, setDeclared] = useState<DeclaredSpec | null>(null);

	/** api detection: probe the health endpoint once (1.5s budget). */
	useEffect(() => {
		let cancelled = false;
		const detect = async () => {
			const health = await fetchhealth(apibase(), 1500);
			if (cancelled) return;
			if (health !== null) {
				setApimode(true);
				setBadgelabel(
					labelfill('console.badge.api', {
						version: String(health.version),
						uptime: String(health.uptime),
					}),
				);
			} else {
				setBadgelabel(label('console.badge.local'));
			}
		};
		detect().catch(() => {
			if (!cancelled) setBadgelabel(label('console.badge.local'));
		});
		return () => {
			cancelled = true;
		};
	}, []);

	/** the handed-over declaration of the landing prompt: read once, then spent. */
	useEffect(() => {
		try {
			const raw = sessionStorage.getItem(declaredkey);
			if (raw === null) return;
			sessionStorage.removeItem(declaredkey);
			const parsed = JSON.parse(raw) as Record<string, unknown>;
			setDeclared({
				base: typeof parsed.base === 'string' ? parsed.base : null,
				os: typeof parsed.os === 'string' ? parsed.os : null,
				arch: typeof parsed.arch === 'string' ? parsed.arch : null,
			});
		} catch {
			/* a broken handoff spends itself silently */
		}
	}, []);

	/** appends one text block as a row; truncates giant payloads for display. */
	const printrow = (text: string, cls: string) => {
		rowseq.current += 1;
		const id = rowseq.current;
		if (text.length > displaycap) {
			rowseq.current += 1;
			const truncid = rowseq.current;
			setRows((prev) => [
				...prev,
				{ id, text: text.slice(0, displaycap), cls },
				{
					id: truncid,
					text: labelfill('console.boot.truncated', { bytes: String(text.length) }),
					cls: 'trunc',
				},
			]);
		} else {
			setRows((prev) => [...prev, { id, text, cls }]);
		}
	};

	/** prepends one bus event; the timeline keeps at most 50 entries. */
	const logevent = (topic: string, detail: string, kind: SandboxEventKind) => {
		eventseq.current += 1;
		const now = new Date();
		const item: SandboxEvent = {
			id: eventseq.current,
			time: now.toTimeString().slice(0, 8),
			topic,
			detail,
			kind,
		};
		setEvents((prev) => [item, ...prev].slice(0, 50));
	};

	const onselectionchange = (patch: Partial<SandboxSpecSelection>) => {
		setSelection((prev) => ({ ...prev, ...patch }));
	};

	/** boots the sandbox: spec commit, api-backed creation, animated dmesg. */
	const bootsandbox = async () => {
		setBusy(true);
		setRunning(false);
		setRows([]);
		setTermstate('booting');

		const spec: SandboxSpecPayload = {
			model: selection.model,
			vcpus: selection.vcpus,
			ramgb: selection.ramgb,
			gpu: selection.gpu,
			mig: selection.mig,
			quotamb: selection.quotamb,
		};
		const state = createSandboxState(spec);
		engineref.current = state;
		setPrompt(labelfill('console.prompt', { host: state.hostname }));

		logevent(
			'vm:creating',
			labelfill('console.event.creating', {
				model: spec.model,
				vcpus: String(state.vcpus),
				ram: String(spec.ramgb),
				gpu: spec.gpu,
			}),
			'lifecycle',
		);

		/* api-backed sandbox when the self-hosted server answers */
		if (apimode) {
			try {
				const response = await apifetch('/api/v1/sandboxes', {
					method: 'POST',
					body: JSON.stringify(spec),
				});
				if (response.ok) {
					const created = (await response.json()) as SandboxCreated;
					apiref.current = created.id;
					logevent(
						'sandbox:created',
						labelfill('console.event.created', { id: created.id, state: created.state }),
						'lifecycle',
					);
				}
			} catch {
				apiref.current = null;
				logevent('sandbox:create-failed', label('console.event.createFailed'), 'lifecycle');
			}
		}

		printrow(
			labelfill('console.boot.line', {
				model: spec.model,
				vcpus: String(state.vcpus),
				ram: String(spec.ramgb),
				gpu: spec.gpu,
			}),
			'boot',
		);
		const lines = bootSequence(spec.model, state.vcpus, spec.ramgb, spec.gpu);
		for (const bootline of lines) {
			printrow(bootline, 'boot');
			await sleep(28 + Math.random() * 34);
		}
		printrow(label('console.boot.ready'), 'ok');
		logevent('vm:created', labelfill('console.event.specsCommitted', { id: state.id }), 'lifecycle');
		logevent('vm:started', label('console.event.started'), 'lifecycle');

		setRunning(true);
		setTermstate('running');
		setBusy(false);
	};

	const onstart = () => {
		bootsandbox().catch(() => {
			printrow(label('console.boot.failed'), 'err');
			setBusy(false);
		});
	};

	/** executes one command: api exec first, local dispatcher as fallback. */
	const runcommand = async (rawcommand: string) => {
		printrow(`${prompt} ${rawcommand}`, 'cmdline');

		if (rawcommand === 'clear') {
			setRows([]);
			return;
		}

		let result: ExecResult | null = null;
		let source = 'local';
		if (apiref.current !== null) {
			try {
				const response = await apifetch(`/api/v1/sandboxes/${apiref.current}/exec`, {
					method: 'POST',
					body: JSON.stringify({ command: rawcommand }),
				});
				if (response.ok) {
					result = (await response.json()) as ExecResult;
					source = 'api';
				}
			} catch {
				result = null;
			}
		}
		if (result === null) {
			result =
				engineref.current !== null
					? dispatch(rawcommand, engineref.current)
					: { output: label('console.boot.notrunning'), exitCode: 1 };
			source = 'local';
		}
		if (result.output.length > 0) {
			printrow(result.output, result.exitCode === 0 ? '' : 'err');
		}
		logevent(
			'exec:completed',
			labelfill('console.event.exec', {
				command: rawcommand,
				code: String(result.exitCode),
				source,
			}),
			'exec',
		);
	};

	/** snapshot: precopy stage 1 of 1, memory + disk. */
	const onsnapshot = () => {
		if (!running) return;
		const snapid = `snap-${Math.random().toString(16).slice(2, 10)}`;
		printrow(labelfill('console.snapshot.created', { id: snapid }), 'ok');
		logevent(
			'snapshot:created',
			labelfill('console.event.snapshot', { id: snapid, sandbox: engineref.current?.id ?? 'n/a' }),
			'snapshot',
		);
	};

	/** teardown: local halt plus the api sandbox delete when connected. */
	const onstop = async () => {
		if (!running) return;
		setRunning(false);
		setTermstate('stopped');
		printrow(label('console.stop.done'), 'boot');
		logevent(
			'vm:stopped',
			labelfill('console.event.stopped', { id: engineref.current?.id ?? 'n/a' }),
			'lifecycle',
		);
		if (apiref.current !== null) {
			const id = apiref.current;
			try {
				await apifetch(`/api/v1/sandboxes/${id}`, { method: 'DELETE' });
				logevent('vm:deleted', labelfill('console.event.deleted', { id }), 'lifecycle');
			} catch {
				logevent('vm:delete-failed', labelfill('console.event.deleteFailed', { id }), 'lifecycle');
			}
			apiref.current = null;
		}
	};

	return (
		<PageShell
			section={label('console.shell.section')}
			label={label('console.shell.label')}
			title={label('console.shell.title')}
			intro={label('console.shell.intro')}
		>
			<section className="content-section console-section">
				<div className="content-section-heading">
					<p className="eyebrow">{label('console.eyebrow')}</p>
					<div className="console-heading-side">
						<Link href="/login" className="console-signin">
							{label('console.signin')}
						</Link>
						<ApiBadge apion={apimode} label={badgelabel} />
					</div>
				</div>
				<div className="sandbox-grid">
					<section className="sandbox-panel" aria-labelledby="specstitle">
						<h2 className="sandbox-panel-title" id="specstitle">
							{label('console.specs.title')}
						</h2>
						{declared !== null &&
							(declared.base !== null || declared.os !== null || declared.arch !== null) && (
								<p className="r3-declared-ribbon" role="note">
									{label('console.declared.head')}
									{[
										declared.base !== null
											? labelfill('console.declared.base', { value: declared.base })
											: null,
										declared.os !== null
											? labelfill('console.declared.guest', { value: declared.os })
											: null,
										declared.arch !== null
											? labelfill('console.declared.arch', { value: declared.arch })
											: null,
									]
										.filter(Boolean)
										.join(' · ')}
									{label('console.declared.tail')}
								</p>
							)}
						<SpecPanel spec={selection} onChange={onselectionchange} disabled={busy || running} />
						<div className="sandbox-actions">
							<button
								className="button button-primary"
								type="button"
								onClick={onstart}
								disabled={busy || running}
								aria-label={label('console.startAria')}
							>
								{label('console.start')}
							</button>
							<SnapshotControls running={running} onsnapshot={onsnapshot} onstop={onstop} />
						</div>
					</section>
					<Terminal
						rows={rows}
						prompt={prompt}
						state={termstate}
						enabled={running}
						oncommand={runcommand}
					/>
					<EventsTimeline events={events} />
				</div>
				<p className="console-note">{label('console.note')}</p>
			</section>
		</PageShell>
	);
}
