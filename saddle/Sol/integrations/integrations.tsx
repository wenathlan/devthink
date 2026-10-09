/**
 * integrations page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Signal & Ledger: integrations as surfaces of the same engine, not disconnected products.
import { Apple, Bot, Box, Container, GitBranch, Globe, Smartphone, Terminal } from 'lucide-react';
import { PageShell } from '@/shell/Shell';

const integrationGroups = [
	{
		label: 'Package surfaces',
		items: [
			{ icon: Box, name: 'npm package', body: '@wenathlan/saddle' },
			{ icon: Terminal, name: 'CLI / binary', body: 'one command, remote run' },
			{ icon: Container, name: 'GitHub Container', body: 'runner-ready image' },
		],
	},
	{
		label: 'Client surfaces',
		items: [
			{ icon: Globe, name: 'CRX extension', body: 'capture from the browser' },
			{ icon: Smartphone, name: 'Android / iOS', body: 'native or Capacitor' },
			{ icon: Apple, name: 'Tauri desktop', body: 'local shell, remote engine' },
		],
	},
	{
		label: 'Bot surfaces',
		items: [
			{ icon: GitBranch, name: 'Forge adapters', body: 'GitHub / GitLab / Forgejo' },
			{ icon: Bot, name: 'n8n node', body: 'workflow as trigger' },
			{ icon: Terminal, name: 'Webhook server', body: 'event in, run out' },
		],
	},
];

export default function Integrations() {
	return (
		<PageShell
			section="04 / 06"
			label="Integrations"
			title="One machine. Many entry points."
			intro="The surface changes to fit the operator's flow; the engine stays the same, with storage, runner, events and results at the center."
		>
			<section className="content-section split-content">
				<div>
					<p className="eyebrow">SURFACE AREA</p>
					<h2 className="section-title">
						Do not choose between package, app or workflow. Chain them.
					</h2>
				</div>
				<div className="prose-copy">
					<p>
						Saddle can be imported, triggered, packaged or embedded. The architecture keeps a useful
						split: interfaces handle input and observation; the remote chain does the work.
					</p>
					<p>That is the detail that lets you swap the shell without rewriting the machine.</p>
				</div>
			</section>
			<section className="content-section integration-groups">
				{integrationGroups.map((group) => (
					<div className="integration-group" key={group.label}>
						<div className="content-section-heading">
							<p className="eyebrow">{group.label}</p>
							<span className="mono-label">3 surfaces</span>
						</div>
						<div className="integration-grid">
							{group.items.map((item) => {
								const Icon = item.icon;
								return (
									<div className="integration-card" key={item.name}>
										<Icon size={20} strokeWidth={1.5} />
										<strong>{item.name}</strong>
										<span>{item.body}</span>
									</div>
								);
							})}
						</div>
					</div>
				))}
			</section>
			<section className="content-section integration-quote">
				<p>“The same engine is sometimes each of the other three.”</p>
				<span className="mono-label">SADDLE / PRINCIPLE 04</span>
			</section>
		</PageShell>
	);
}
