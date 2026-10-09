/**
 * compute page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Signal & Ledger: compute as a map of workers, remote memory and execution states.
import { ArrowRight, Box, Cpu, Database, Gauge, HardDrive, MemoryStick } from 'lucide-react';
import { PageShell } from '@/shell/Shell';

const providers = [
	{ name: 'GitHub Actions', spec: '4 vCPU / 16 GB', state: 'primary' },
	{ name: 'Forgejo / Gitea', spec: 'self-hosted', state: 'unlimited' },
	{ name: 'Hugging Face', spec: '16 GB RAM', state: 'suspend-aware' },
	{ name: 'Kaggle', spec: 'T4 / P100', state: 'scheduled' },
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
			<section className="content-section">
				<div className="content-section-heading">
					<p className="eyebrow">MEMORY BRIDGE / STATES</p>
					<span className="mono-label">process ⇄ keep</span>
				</div>
				<div className="compute-flow">
					{[
						{ icon: Database, title: 'Persist', body: 'repos / buckets', tone: 'paper' },
						{ icon: HardDrive, title: 'Stage', body: 'artifact → tmpfs', tone: 'blue' },
						{ icon: Cpu, title: 'Process', body: 'runner active', tone: 'ember' },
						{ icon: MemoryStick, title: 'Sync', body: 'RAM → storage', tone: 'sage' },
					].map((item, index) => {
						const Icon = item.icon;
						return (
							<div className="compute-step-wrap" key={item.title}>
								<div className={`compute-step tone-${item.tone}`}>
									<Icon size={21} />
									<span className="step-index">0{index + 1}</span>
									<strong>{item.title}</strong>
									<small>{item.body}</small>
								</div>
								{index < 3 && <ArrowRight className="compute-arrow" size={17} />}
							</div>
						);
					})}
				</div>
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
							<Gauge size={16} />
						</div>
					))}
				</div>
			</section>
			<section className="content-section note-band">
				<Box size={21} />
				<div>
					<p className="eyebrow">OPERATING RULE</p>
					<p>
						The farm does not round-robin blindly. It breaks at the first free runner and keeps the
						chain readable for the operator.
					</p>
				</div>
			</section>
		</PageShell>
	);
}
