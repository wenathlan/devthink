/**
 * compute page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Signal & Ledger: compute as an operational console — the memory bridge as a
// hairline state ledger (process carries the live pulse) beside the operating
// rail, then the free runner farm as a ruled mono table with its priority
// states, then the operating rule band.
import { ArrowRight, Box, Cpu, Database, HardDrive, MemoryStick } from 'lucide-react';
import { PageShell } from '@/shell/Shell';

const providers = [
	{ name: 'GitHub Actions', spec: '4 vCPU / 16 GB', state: 'primary' },
	{ name: 'Forgejo / Gitea', spec: 'self-hosted', state: 'unlimited' },
	{ name: 'Hugging Face', spec: '16 GB RAM', state: 'suspend-aware' },
	{ name: 'Kaggle', spec: 'T4 / P100', state: 'scheduled' },
];

/** the memory bridge states: one hairline row each, process is the live one. */
const bridge = [
	{ icon: Database, title: 'Persist', body: 'repos / buckets', state: 'keep' },
	{ icon: HardDrive, title: 'Stage', body: 'artifact → tmpfs', state: 'prepare' },
	{ icon: Cpu, title: 'Process', body: 'runner active', state: 'live' },
	{ icon: MemoryStick, title: 'Sync', body: 'RAM → storage', state: 'return' },
];

export default function Compute() {
	return (
		<PageShell
			section="03 / 06"
			label="Compute"
			title="Memory flows between places."
			intro="Heavy work enters a temporary working set; the result returns to persistent storage and the next session picks up where it stopped."
		>
			<section className="content-section split-content">
				<div>
					<p className="eyebrow">COMPUTATIONAL MEMORY</p>
					<h2 className="section-title">The disk is the origin. The runner is the moment.</h2>
				</div>
				<div className="prose-copy">
					<p>
						Saddle does not promise teleportation. It organizes distance: downloads data, mounts the
						working set, runs in tmpfs or local memory, syncs results and retires the runner.
					</p>
					<p>
						The model makes clear what persists, what is process, and when a provider chain should
						take the next job.
					</p>
				</div>
			</section>
			<section
				className="content-section r3-ops"
				aria-label="the memory bridge and the operating rule"
			>
				<div className="r3-bridge">
					<div className="content-section-heading">
						<p className="eyebrow">MEMORY BRIDGE / STATES</p>
						<span className="mono-label">process ⇄ keep</span>
					</div>
					<ol className="r3-bridge-list" aria-label="memory bridge states in order">
						{bridge.map((item, index) => {
							const Icon = item.icon;
							return (
								<li
									className={item.state === 'live' ? 'r3-bridge-row is-live' : 'r3-bridge-row'}
									key={item.title}
								>
									<span className="r3-bridge-index">0{index + 1}</span>
									<Icon size={18} strokeWidth={1.6} aria-hidden="true" />
									<span className="r3-bridge-name">{item.title}</span>
									<span className="r3-bridge-body">{item.body}</span>
									<span className="r3-bridge-state">{item.state}</span>
									{index < bridge.length - 1 && (
										<ArrowRight className="r3-bridge-arrow" size={14} aria-hidden="true" />
									)}
								</li>
							);
						})}
					</ol>
				</div>
				<aside className="r3-opsrail" aria-label="operating rule">
					<p className="eyebrow">OPERATING RULE</p>
					<p className="r3-opsrail-text">
						The farm does not round-robin blindly. It breaks at the first free runner and keeps the
						chain readable for the operator.
					</p>
					<div className="r3-opsrail-equation" aria-hidden="true">
						<span>storage</span>
						<b>=</b>
						<span>compute memory</span>
					</div>
					<p className="r3-opsrail-note">
						What persists, what is process and when the chain takes the next job stay explicit.
					</p>
				</aside>
			</section>
			<section className="content-section">
				<div className="content-section-heading">
					<p className="eyebrow">FREE RUNNER FARM / PRIORITY ORDER</p>
					<span className="mono-label">first 204 accepted</span>
				</div>
				<div className="provider-table">
					{providers.map((provider, index) => (
						<div className="provider-table-row" key={provider.name}>
							<span className="provider-table-index">0{index + 1}</span>
							<strong>{provider.name}</strong>
							<span>{provider.spec}</span>
							<span className={`provider-state ${provider.state}`}>{provider.state}</span>
							<span
								className={provider.state === 'primary' ? 'r3-rowdot is-live' : 'r3-rowdot'}
								aria-hidden="true"
							/>
						</div>
					))}
				</div>
			</section>
			<section className="content-section note-band">
				<Box size={21} aria-hidden="true" />
				<div>
					<p className="eyebrow">RETIRES / BY CONSTRUCTION</p>
					<p>
						The working set is temporary by construction: the runner retires when the sync lands and
						the next session re-mounts what the storage still keeps.
					</p>
				</div>
			</section>
		</PageShell>
	);
}
