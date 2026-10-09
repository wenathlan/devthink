/**
 * docs page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Signal & Ledger: documentation as an operations index, with short paths and preserved context.
import {
	ArrowUpRight,
	BookOpen,
	Braces,
	FileCode2,
	Flag,
	GitCommitHorizontal,
	PlayCircle,
} from 'lucide-react';
import { PageShell } from '@/shell/Shell';

const docs = [
	{
		icon: BookOpen,
		index: '00',
		title: 'Start with the thesis',
		body: 'Storage, memory and the usage flag.',
		meta: 'FOUNDATION',
	},
	{
		icon: Braces,
		index: '01',
		title: 'Session JSON',
		body: 'The reproducible artifact behind a browser run.',
		meta: 'AGENT BROWSER',
	},
	{
		icon: GitCommitHorizontal,
		index: '02',
		title: 'Repo-as-CPU',
		body: 'Dispatch, runners, Pages and the shared surface.',
		meta: 'ENGINE',
	},
	{
		icon: FileCode2,
		index: '03',
		title: 'Provider chain',
		body: 'First free runner wins, with limits exposed.',
		meta: 'ENGINE',
	},
	{
		icon: Flag,
		index: '04',
		title: 'Build gates',
		body: 'Planning before platform implementation.',
		meta: 'PRODUCTIZATION',
	},
];

export default function Docs() {
	return (
		<PageShell
			section="05 / 06"
			label="Docs"
			title="Notes for operating the chain."
			intro="Progressive documentation: first the thesis, then the engine, then the surfaces that make the idea usable."
		>
			<section className="content-section split-content">
				<div>
					<p className="eyebrow">PROGRESSIVE ARC</p>
					<h2 className="section-title">Read how a system gets built.</h2>
				</div>
				<div className="prose-copy">
					<p>
						The Saddle README works as the source of truth. This surface organizes the concepts into
						smaller steps, so the architecture can be understood before it is triggered.
					</p>
					<p>
						The guides below are the first editorial layer and point to the upcoming implementation
						pages.
					</p>
				</div>
			</section>
			<section className="content-section docs-list">
				<div className="content-section-heading">
					<p className="eyebrow">INDEX / FOUNDATION → PRODUCTIZATION</p>
					<span className="mono-label">5 notes</span>
				</div>
				{docs.map((doc) => {
					const Icon = doc.icon;
					return (
						<button
							type="button"
							className="doc-row"
							key={doc.title}
							onClick={(event) => event.preventDefault()}
						>
							<span className="doc-index">{doc.index}</span>
							<Icon size={20} strokeWidth={1.5} />
							<div className="doc-copy">
								<span>{doc.meta}</span>
								<strong>{doc.title}</strong>
								<p>{doc.body}</p>
							</div>
							<ArrowUpRight size={17} />
						</button>
					);
				})}
			</section>
			<section className="content-section docs-cta">
				<PlayCircle size={22} />
				<div>
					<p className="eyebrow">NEXT / BUILD GATE</p>
					<h3>Planning first. Platform next.</h3>
					<p>The implementation path starts once the chain is clear enough to be operated.</p>
				</div>
				<a
					href="https://github.com/wenathlan/saddle"
					target="_blank"
					rel="noreferrer"
					className="button button-dark"
				>
					Open repository <ArrowUpRight size={15} />
				</a>
			</section>
		</PageShell>
	);
}
