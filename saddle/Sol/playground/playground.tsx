/**
 * playground page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { internalapi } from '@saddle/isolation';
// Signal & Ledger: playground as the ledger of internal plans, never a console that executes bytes.
import {
	Activity,
	Ban,
	Blocks,
	Braces,
	Database,
	FileWarning,
	Network,
	ShieldCheck,
} from 'lucide-react';
import { type CSSProperties, useMemo, useState } from 'react';
import { PageShell } from '@/shell/Shell';

const fixture = Object.freeze({
	id: 'fixture.binary.001',
	effect: 'binary-execution',
	target: 'remote',
	// biome-ignore lint/security/noSecrets: a deterministic demo payload digest for the sandbox spec fixture, not a credential
	source: '8c3d2e7b6a5f4c1d0e9b8a7f6c5d4e3b2a1908172635445566778899aabbccdd',
	budget: { maxbytes: 65536, maxmilliseconds: 250 },
});

const boundaries = [
	{ index: '01', name: 'Gateway', detail: 'assigns a request identity', icon: Braces },
	{ index: '02', name: 'Plan', detail: 'normalizes intent and budget', icon: Blocks },
	{ index: '03', name: 'Policy', detail: 'requires explicit agreement', icon: ShieldCheck },
	{ index: '04', name: 'Materialize', detail: 'describes, never allocates', icon: Database },
	{ index: '05', name: 'Execute', detail: 'delegates or denies', icon: Activity },
	{ index: '06', name: 'Evidence', detail: 'records an honest receipt', icon: FileWarning },
];

/** the two policy modalities of the projection: each is one card, and each
 * card walks the six boundaries as its own stage ladder (the windows
 * stepper — the ::after indicator: 0 closed, 6px #858585 done, 12px accent
 * active). the state names are the honest ledger words, never decor. */
const modalitycards = [
	{
		id: 'default' as const,
		index: '01',
		name: 'default denial',
		code: 'EXECUTION_POLICY_DENIED',
		verdict:
			'the walk clears gateway, plan, policy and materialize — execute refuses the effect and the evidence never opens.',
		tip: 'project the default denial through the six boundaries',
	},
	{
		id: 'delegated' as const,
		index: '02',
		name: 'delegated handoff',
		code: 'CALLER_ADAPTER_REQUIRED',
		verdict:
			'the walk clears the same stages — execute arms the caller-owned handoff and the evidence waits for the receipt.',
		tip: 'project the optional handoff through the six boundaries',
	},
];

/** the stage states per modality, boundary order: done (6px gray), active
 * (12px accent), denied (12px gray), armed (6px gray) and closed (0). */
const stageladder: Record<'default' | 'delegated', readonly string[]> = {
	default: ['done', 'done', 'done', 'done', 'denied', 'closed'],
	delegated: ['done', 'done', 'done', 'done', 'active', 'armed'],
};

/** walks the six boundaries of one modality into the stage rows. */
function walkstages(modality: 'default' | 'delegated') {
	return boundaries.map((boundary, index) => ({
		index: boundary.index,
		name: boundary.name,
		state: stageladder[modality][index],
	}));
}

function fixtureenvelope(boundary: string, configuration = {}) {
	if (boundary === 'planning') return { boundary, requestid: 'web.fixture.plan', payload: fixture };
	if (boundary === 'policy' || boundary === 'execution')
		return {
			boundary,
			requestid: `web.fixture.${boundary}`,
			payload: { request: fixture, configuration },
		};
	return { boundary, requestid: `web.fixture.${boundary}`, payload: {} };
}

export default function Playground() {
	const [mode, setMode] = useState<'default' | 'delegated'>('default');
	const configuration = useMemo(
		() =>
			mode === 'delegated'
				? {
						policy: { alloweffects: ['binary-execution'], allowtargets: ['remote'] },
						approval: { effects: ['binary-execution'], targets: ['remote'] },
						adapter: { owner: 'operator', capabilities: ['binary-execution'] },
					}
				: {},
		[mode],
	);
	const projection = useMemo(
		() => internalapi().handle(fixtureenvelope('execution', configuration)),
		[configuration],
	);
	const handoff = projection.data.handoff;

	return (
		<PageShell
			section="07 / 07"
			label="Internal API Playground"
			title="Map the request. Do not run it."
			intro="This is a single-site projection of the former multi-site model. The boundaries are internal API contracts: they show what would be required, but they do not start a process, read a file, reach a provider, or spend a quota."
		>
			<section className="content-section split-content">
				<div>
					<p className="eyebrow">UNIFIED WEB / SAFE FIXTURE</p>
					<h2 className="section-title">
						One site.
						<br />
						<span>Six boundaries.</span>
					</h2>
				</div>
				<div className="prose-copy">
					<p>
						The playground uses a fixed binary descriptor. It does not accept uploads or arbitrary
						code, and it does not instantiate Wasm, a worker, a container, a browser, a database, or
						a remote session.
					</p>
					<p>
						“Internal API” means typed request and response envelopes in the same application. It is
						not a hidden endpoint, a second site, or a remote machine.
					</p>
				</div>
			</section>

			<section className="content-section">
				<div className="content-section-heading">
					<p className="eyebrow">INTERNAL BOUNDARY MAP</p>
					<span className="mono-label">pure / serializable / no transport</span>
				</div>
				<div className="playground-boundaries">
					{boundaries.map(({ index, name, detail, icon: Icon }, cardindex) => (
						<article
							className="playground-boundary"
							key={name}
							style={{ '--stagger-i': cardindex } as CSSProperties}
						>
							<span>{index}</span>
							<Icon size={18} />
							<strong>{name}</strong>
							<small>{detail}</small>
						</article>
					))}
				</div>
			</section>

			<section className="content-section" aria-label="the modality cards and their stage walks">
				<div className="content-section-heading">
					<p className="eyebrow">MODALITY CARDS / THE WALK BY STAGES</p>
					<span className="mono-label">one card per modality · six windows steps</span>
				</div>
				<div className="r3-modality">
					{modalitycards.map((card, cardindex) => (
						<article
							key={card.id}
							className={mode === card.id ? 'r3-modality-card is-on' : 'r3-modality-card'}
							style={{ '--stagger-i': cardindex } as CSSProperties}
						>
							<button
								type="button"
								className="r3-modality-key"
								aria-pressed={mode === card.id}
								data-tip={card.tip}
								onClick={() => setMode(card.id)}
							>
								<span className="r3-modality-index">{card.index}</span>
								<span className="r3-modality-name">{card.name}</span>
								<span className="r3-modality-code">{card.code}</span>
							</button>
							<p className="r3-modality-verdict">{card.verdict}</p>
							<ol className="r3-walk" aria-label={`the stage walk of the ${card.name} modality`}>
								{walkstages(card.id).map((stage) => (
									<li key={stage.name} className="r3-walkstage" data-state={stage.state}>
										<span className="r3-walkstage-index">{stage.index}</span>
										<span className="r3-walkstage-name">{stage.name}</span>
										<span className="r3-walkstage-state">{stage.state}</span>
									</li>
								))}
							</ol>
						</article>
					))}
				</div>
			</section>

			<section className="content-section playground-layout">
				<div className="playground-console">
					<div className="console-head">
						<span>
							<Activity size={14} /> INTERNAL API PROJECTION
						</span>
						<span
							className={handoff.state === 'execution-disabled' ? 'console-denied' : 'console-pass'}
						>
							{handoff.state === 'execution-disabled' ? (
								<Ban size={13} />
							) : (
								<ShieldCheck size={13} />
							)}{' '}
							{handoff.code}
						</span>
					</div>
					<div className="playground-console-body">
						<div className="playground-row">
							<span>request</span>
							<b>{fixture.id}</b>
						</div>
						<div className="playground-row">
							<span>effect</span>
							<b>{fixture.effect}</b>
						</div>
						<div className="playground-row">
							<span>target</span>
							<b>{fixture.target}</b>
						</div>
						<div className="playground-row">
							<span>outcome</span>
							<b>{handoff.state}</b>
						</div>
						<div className="playground-row">
							<span>effects</span>
							<b>{JSON.stringify(projection.effects)}</b>
						</div>
						<pre>{JSON.stringify(handoff, null, 2)}</pre>
					</div>
					<div className="console-footer">
						<span>fixture only</span>
						<span>no adapter invocation</span>
					</div>
				</div>
				<aside className="playground-controls">
					<p className="eyebrow">POLICY SWITCH</p>
					<h3>Show the difference between denial and delegation.</h3>
					<p>
						The second state still does not execute. It only produces a caller-owned handoff that a
						separately configured adapter could evaluate later.
					</p>
					<p className="r3-modality-note" role="status">
						projecting:
						{mode === 'delegated' ? ' the delegated handoff' : ' the default denial'} — the card
						picked above drives this console.
					</p>
				</aside>
			</section>

			<section className="content-section note-band">
				<Network size={21} />
				<div>
					<p className="eyebrow">RESOURCE POSTURE</p>
					<p>
						The static interface uses only ordinary UI rendering. It deliberately performs no binary
						work and has no network, persistence, browser, host-bridge, provider, or background-job
						capability. Any operational adapter must be supplied and authorized by its operator.
					</p>
				</div>
			</section>
		</PageShell>
	);
}
