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
	ArrowUpRightRegular as ArrowUpRight,
	BookOpenRegular as BookOpen,
	BracesRegular as Braces,
	CodeRegular as FileCode2,
	FlagRegular as Flag,
	RecordRegular as GitCommitHorizontal,
	PlayCircleRegular as PlayCircle,
} from '@fluentui/react-icons';
import { PageShell } from '../shell/Shell.tsx';
import { label, labelfill } from '../../labels.ts';

/** the operations index: the glyph and the two-digit index are presentation
 * code, every word rides the store under the docs.note.* family. */
const docs = [
	{ icon: BookOpen, index: '00', key: 'thesis' },
	{ icon: Braces, index: '01', key: 'session' },
	{ icon: GitCommitHorizontal, index: '02', key: 'repo' },
	{ icon: FileCode2, index: '03', key: 'chain' },
	{ icon: Flag, index: '04', key: 'gates' },
] as const;

export default function Docs() {
	return (
		<PageShell
			section={label('docs.shell.section')}
			label={label('docs.shell.label')}
			title={label('docs.shell.title')}
			intro={label('docs.shell.intro')}
		>
			<section className="content-section split-content">
				<div>
					<p className="eyebrow">{label('docs.split.eyebrow')}</p>
					<h2 className="section-title">{label('docs.split.title')}</h2>
				</div>
				<div className="prose-copy">
					<p>{label('docs.split.body1')}</p>
					<p>{label('docs.split.body2')}</p>
				</div>
			</section>
			<section className="content-section docs-list">
				<div className="content-section-heading">
					<p className="eyebrow">{label('docs.index.eyebrow')}</p>
					<span className="mono-label">{labelfill('docs.index.mono', { n: String(docs.length) })}</span>
				</div>
				{docs.map((doc) => {
					const Icon = doc.icon;
					return (
						<button
							type="button"
							className="doc-row"
							key={doc.key}
							onClick={(event) => event.preventDefault()}
						>
							<span className="doc-index">{doc.index}</span>
							<Icon fontSize={20} strokeWidth={1.5} />
							<div className="doc-copy">
								<span>{label(`docs.note.${doc.key}.meta`)}</span>
								<strong>{label(`docs.note.${doc.key}.title`)}</strong>
								<p>{label(`docs.note.${doc.key}.body`)}</p>
							</div>
							<ArrowUpRight fontSize={17} />
						</button>
					);
				})}
			</section>
			<section className="content-section docs-cta">
				<PlayCircle fontSize={22} />
				<div>
					<p className="eyebrow">{label('docs.cta.eyebrow')}</p>
					<h3>{label('docs.cta.title')}</h3>
					<p>{label('docs.cta.body')}</p>
				</div>
				<a
					href="https://github.com/wenathlan/saddle"
					target="_blank"
					rel="noreferrer"
					className="button button-dark"
				>
					{label('docs.cta.link')}
					<ArrowUpRight fontSize={15} />
				</a>
			</section>
		</PageShell>
	);
}
