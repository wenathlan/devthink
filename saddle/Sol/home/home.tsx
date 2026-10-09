/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 *
 * R3-saddle: home is the LANDING of the platform — one sand light over the
 * window stage, the prompt-giga field where the operator declares a sandbox
 * (a giant mono input with the embedded boot key and the real declared
 * vocabulary of sandboxprofile.ts as chips), the sandbox matrix as a
 * hairline ledger of the three runtime bases (base / guests / arch / vgpu /
 * ceiling — the documented development bootstrap limits of
 * sandboxenvprofile.ts), the thesis, the runtime chain, the surfaces
 * ledger, the 01–03 steps and the footer meta-quad. The boot key parses the
 * draft against the declared vocabulary and hands the parsed declaration to
 * the console over the `saddle.declared` session key — the console reads
 * and spends it once on mount (a real handoff: the hardware identities stay
 * caller choices there).
 */

import {
	ArrowDownRight,
	ArrowUpRight,
	Cable,
	Command,
	Layers3,
	MoveRight,
	Package,
} from 'lucide-react';
// Signal & Ledger: home as the landing — declare the sandbox, read the matrix, boot the console.
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { SectionRail } from '@/shell/Shell';
import { type MediaSlot, mediaSlots } from '../../catalog';
import { specenvlimits } from '../../sandboxenvprofile.ts';
import {
	SANDBOXARCHES,
	SANDBOXBASES,
	SANDBOXOSES,
	type sandboxarchid,
	type sandboxbaseid,
	type sandboxosid,
} from '../../sandboxprofile.ts';
import MetricStrip from './MetricStrip';
import RuntimeDiagram from './RuntimeDiagram';

export * from './MetricStrip';
export * from './RuntimeDiagram';

/** the session key the boot key writes and the console reads (once, then spent). */
const DECLARED_KEY = 'saddle.declared';

/** the parsed declaration: one member of each declared vocabulary, or null. */
type Declaration = {
	base: sandboxbaseid | null;
	os: sandboxosid | null;
	arch: sandboxarchid | null;
};

/** parses one draft line against the declared vocabularies of sandboxprofile. */
function parsedraft(raw: string): Declaration {
	const words = raw
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter(Boolean);
	return {
		base: SANDBOXBASES.find((entry) => words.includes(entry)) ?? null,
		os: SANDBOXOSES.find((entry) => words.includes(entry)) ?? null,
		arch: SANDBOXARCHES.find((entry) => words.includes(entry)) ?? null,
	};
}

/** the chip groups of the hero: the three fixed vocabularies, verbatim. */
const chipgroups: readonly { key: keyof Declaration; label: string; items: readonly string[] }[] = [
	{ key: 'base', label: 'base', items: SANDBOXBASES },
	{ key: 'os', label: 'guest', items: SANDBOXOSES },
	{ key: 'arch', label: 'arch', items: SANDBOXARCHES },
];

/** the surfaces ledger: one engine, three shells (the existing surfaces copy). */
const surfaces = [
	{
		index: '01',
		icon: Cable,
		title: 'Agent Browser',
		body: 'Capture and replay of human movement in reproducible sessions.',
		href: '/agent-browser',
	},
	{
		index: '02',
		icon: Layers3,
		title: 'Computational memory',
		body: 'Repos and buckets enter the process without pretending latency does not exist.',
		href: '/compute',
	},
	{
		index: '03',
		icon: Package,
		title: 'Package surfaces',
		body: 'The same machine can appear as a CLI, library, extension or app.',
		href: '/integrations',
	},
];

/** the 01–03 steps of the landing: declare → boot → keep. */
const steps = [
	{
		index: '01',
		title: 'declare',
		body: 'Name the base, the guest and the arch — the chips are the declared vocabulary.',
	},
	{
		index: '02',
		title: 'boot',
		body: 'The console boots the microvm: spec panel, terminal, bus events.',
		href: '/console',
	},
	{
		index: '03',
		title: 'keep',
		body: 'Snapshot the machine, or keep it on the dashboard shelf.',
		href: '/dashboard',
	},
];

/** the footer meta-quad: the four moves of the platform. */
const quad = [
	{ index: '01', title: 'boot', body: 'the console: spec, terminal, bus events', href: '/console' },
	{
		index: '02',
		title: 'operate',
		body: 'the dashboard: shelf, account, admin',
		href: '/dashboard',
	},
	{
		index: '03',
		title: 'chain',
		body: 'compute: the provider farm and the bridge',
		href: '/compute',
	},
	{
		index: '04',
		title: 'thesis',
		body: 'architecture: repo → runner → pages',
		href: '/architecture',
	},
];

export default function Home() {
	const [, navigate] = useLocation();
	const [media, setMedia] = useState<MediaSlot[]>([]);
	const [draft, setDraft] = useState('');

	useEffect(() => {
		void mediaSlots().then(setMedia);
	}, []);

	const runtimeSlot = media.find((slot) => slot.id === 'media.runtime.map');

	/** the live parse: chips and the typed draft share one source of truth. */
	const parsed = useMemo(() => parsedraft(draft), [draft]);
	const declaredbits = [
		parsed.base !== null ? `base ${parsed.base}` : null,
		parsed.os !== null ? `guest ${parsed.os}` : null,
		parsed.arch !== null ? `arch ${parsed.arch}` : null,
	].filter(Boolean);
	const declaredline =
		declaredbits.length > 0
			? `declared: ${declaredbits.join(' · ')} — the boot key hands it to the console`
			: 'nothing declared yet — tap a chip or type the words';

	/** toggles one vocabulary token inside the draft line. */
	const toggletoken = (token: string) => {
		setDraft((prev) => {
			const words = prev
				.toLowerCase()
				.split(/[^a-z0-9]+/)
				.filter(Boolean);
			const next = words.includes(token)
				? words.filter((word) => word !== token)
				: [...words, token];
			return next.join(' · ');
		});
	};

	/** the boot key: parse, hand the declaration over, open the console. */
	const spin = () => {
		try {
			sessionStorage.setItem(DECLARED_KEY, JSON.stringify(parsedraft(draft)));
		} catch {
			/* storage unavailable: the boot key still navigates */
		}
		navigate('/console');
	};

	/** the sandbox matrix: the three bases over the documented bootstrap limits. */
	const limits = specenvlimits({}).bases;
	const matrixrows = (['lite', 'balanced', 'max'] as const).map((id) => {
		const row = limits[id];
		return {
			id,
			featured: id === 'max',
			guests: `${SANDBOXOSES.length} guests`,
			arch: 'arm64 · amd64',
			vgpu:
				row.maxvgpus === 0 ? 'none' : `${row.maxvgpus} ${row.maxvgpus === 1 ? 'slice' : 'slices'}`,
			ceiling: `${row.maxvcpus} vcpu · ${row.maxramgb} gb ram · ${row.maxdiskgb} gb disk · ${Math.round(row.maxtimeoutseconds / 60)} min`,
		};
	});

	return (
		<div className="site-frame home-page">
			<main>
				{/* the landing hero: ONE sand light, the prompt-giga field, the declared
				 * chips and the sandbox matrix ledger (logo discipline: the mark stays
				 * in the window title bar) */}
				<section className="r3-hero halftone" aria-labelledby="r3herotitle">
					<div className="r3-hero-inner">
						<div className="r3-hero-copy">
							<p className="eyebrow r3-hero-eyebrow">
								<span className="status-dot" /> saddle · the sandbox runner of the family
							</p>
							<h1 className="r3-display" id="r3herotitle">
								Spin a<br />
								<em>sandbox</em>.
							</h1>
							<p className="r3-hero-lede">
								Declared, never assembled: one line names the base, the guest and the arch — the
								engine boots it and the result ships back as a package.
							</p>
							<form
								className="r3-prompt"
								aria-label="declare a sandbox and boot the console"
								onSubmit={(event) => {
									event.preventDefault();
									spin();
								}}
							>
								<label className="r3-prompt-label" htmlFor="r3declare">
									declare
								</label>
								<input
									id="r3declare"
									className="r3-prompt-input"
									type="text"
									value={draft}
									placeholder="spin a sandbox — try: omarchy · max · arm64"
									spellCheck={false}
									autoComplete="off"
									onChange={(event) => setDraft(event.target.value)}
								/>
								<button className="r3-prompt-key" type="submit">
									boot <ArrowDownRight size={15} aria-hidden="true" />
								</button>
							</form>
							<fieldset className="r3-chips">
								<legend className="r3-chips-legend">the declared vocabulary</legend>
								{chipgroups.map((group) => (
									<div className="r3-chipgroup" key={group.key}>
										<span className="r3-chipgroup-label">{group.label}</span>
										{group.items.map((token) => (
											<button
												key={token}
												type="button"
												className={parsed[group.key] === token ? 'r3-chip is-on' : 'r3-chip'}
												aria-pressed={parsed[group.key] === token}
												onClick={() => toggletoken(token)}
											>
												{token}
											</button>
										))}
									</div>
								))}
							</fieldset>
							<p className="r3-declared" role="status" aria-live="polite">
								{declaredline}
							</p>
						</div>
						<aside className="r3-matrix" aria-label="the sandbox matrix">
							<div className="r3-matrix-head">
								<span>the sandbox matrix</span>
								<span className="mono-label">three bases · bootstrap limits</span>
							</div>
							<table className="r3-matrix-table">
								<thead>
									<tr>
										<th scope="col">base</th>
										<th scope="col">guests</th>
										<th scope="col">arch</th>
										<th scope="col">vgpu</th>
										<th scope="col">ceiling</th>
									</tr>
								</thead>
								<tbody>
									{matrixrows.map((row) => (
										<tr key={row.id} className={row.featured ? 'is-featured' : undefined}>
											<th scope="row">{row.id}</th>
											<td>{row.guests}</td>
											<td>{row.arch}</td>
											<td>{row.vgpu}</td>
											<td>{row.ceiling}</td>
										</tr>
									))}
								</tbody>
							</table>
							<p className="r3-matrix-note">
								the documented development bootstrap limits — the table is configuration
								(SADDLE_SPEC_LIMITS), never a product rule. guests: {SANDBOXOSES.join(' · ')}.
							</p>
						</aside>
					</div>
				</section>

				<section className="metric-section container">
					<MetricStrip
						metrics={[
							{ value: '03', label: 'runtime bases', detail: 'lite / balanced / max' },
							{ value: '70+', label: 'storage backends', detail: 'rclone-compatible' },
							{ value: '∞', label: 'package surfaces', detail: 'one engine / many shells' },
						]}
					/>
				</section>

				<section id="thesis" className="thesis-section container section-with-rail">
					<SectionRail number="01" label="the thesis" />
					<div className="thesis-content">
						<p className="eyebrow">core principle / 01</p>
						<h2 className="section-title">
							The bytes are already there. <span>The flag is the machine.</span>
						</h2>
						<div className="thesis-grid">
							<p>
								RAM and disk are the same construct at the byte level. What changes is the usage
								flag: <b>keep</b> or <b>process</b>. Saddle makes that distinction explicit, then
								routes work to a runner that belongs to someone else.
							</p>
							<div className="evidence-card">
								<div className="evidence-card-head">
									<Command size={16} />
									<span>INODE / DENTRY / FILE_OPS</span>
									<span className="card-index">[01]</span>
								</div>
								<div className="evidence-equation">
									<span>storage</span>
									<b>=</b>
									<span>compute memory</span>
								</div>
								<div className="evidence-card-foot">
									<span>difference</span>
									<b>usage flag</b>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="runtime-section">
					<div className="container section-with-rail">
						<SectionRail number="02" label="the chain" />
						<div className="runtime-content">
							<div className="section-heading-row">
								<div>
									<p className="eyebrow">REPO → RUNNER → SURFACE</p>
									<h2 className="section-title">A repo can behave like a CPU.</h2>
								</div>
								<Link href="/architecture" className="small-arrow-link">
									Open architecture <MoveRight size={15} />
								</Link>
							</div>
							<div className="runtime-layout">
								<RuntimeDiagram />
								<div className="runtime-art-frame">
									{runtimeSlot && (
										<figure
											className="media-area"
											style={{ aspectRatio: runtimeSlot.ratio }}
											aria-label="media area"
										>
											<figcaption>
												<span>{runtimeSlot.label}</span>
												<span>{runtimeSlot.caption}</span>
											</figcaption>
										</figure>
									)}
									<span>FIG. 02 / REMOTE RUNTIME MAP</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="surfaces-section container section-with-rail">
					<SectionRail number="03" label="the surfaces" />
					<div className="surfaces-content">
						<div className="section-heading-row">
							<div>
								<p className="eyebrow">ONE ENGINE / MANY SHELLS</p>
								<h2 className="section-title">
									Use the same machine
									<br />
									where your work already lives.
								</h2>
							</div>
							<span className="mono-label">available / 04</span>
						</div>
						<div className="surface-list">
							{surfaces.map((surface) => {
								const Icon = surface.icon;
								return (
									<Link className="surface-row" href={surface.href} key={surface.title}>
										<span className="surface-number">{surface.index}</span>
										<Icon size={21} strokeWidth={1.5} aria-hidden="true" />
										<div className="surface-copy">
											<h3>{surface.title}</h3>
											<p>{surface.body}</p>
										</div>
										<ArrowUpRight className="surface-arrow" size={18} aria-hidden="true" />
									</Link>
								);
							})}
						</div>
					</div>
				</section>

				<section className="r3-steps container" aria-label="the first three moves">
					{steps.map((step) => (
						<div className="r3-step" key={step.index}>
							<span className="r3-step-index">{step.index}</span>
							<h3 className="r3-step-title">{step.title}</h3>
							<p className="r3-step-body">{step.body}</p>
							{step.href && (
								<Link className="r3-step-link" href={step.href}>
									open the {step.title} <ArrowUpRight size={14} aria-hidden="true" />
								</Link>
							)}
						</div>
					))}
				</section>
			</main>

			{/* the footer meta-quad: the four moves flush to the window floor */}
			<footer className="r3-quad">
				<div className="r3-quad-grid container">
					{quad.map((cell) => (
						<Link className="r3-quad-cell" href={cell.href} key={cell.index}>
							<span className="r3-quad-index">{cell.index}</span>
							<span className="r3-quad-title">{cell.title}</span>
							<span className="r3-quad-body">{cell.body}</span>
						</Link>
					))}
				</div>
				<div className="site-footer container">
					<span>© 2026 Saddle / distributed by design</span>
					<span className="mono-label">storage == compute</span>
				</div>
			</footer>
		</div>
	);
}
