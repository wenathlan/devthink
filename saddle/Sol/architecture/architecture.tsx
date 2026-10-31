/**
 * architecture page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import {
	ArrowUpRightRegular as ArrowUpRight,
	BrainCircuitRegular as Cpu,
	DatabaseRegular as Database,
	BranchForkRegular as GitBranch,
	GlobeRegular as Globe2,
	ShieldTaskRegular as ShieldCheck,
} from '@fluentui/react-icons';
// Signal & Ledger: the architecture as a diagram-as-ledger — layered hairline
// rows (the runtime forms of sandboxprofile: runtime/packages, full/docker,
// published/registries) with mono annotations and connector dashes, then the
// four layers, the provider chain and the physical limit band. No floating
// boxes: every layer is a ruled row on the same spine. The page ships zero
// fixed data of its own: the runtime forms ride the declared vocabulary of
// sandboxprofile, the provider chain and the layer words ride the label
// store (labels.ts — the seed mirrors the rows into the labels table), and
// every word reads through the typed accessor — the copy law.
import { useEffect, useState } from 'react';
import { PageShell } from '../shell/Shell.tsx';
import { type MediaSlot, mediaSlots } from '../../catalog';
import { label } from '../../labels.ts';
import { SANDBOXFORMS, type sandboxformid } from '../../sandboxprofile.ts';

/** the ledger annotations of the three runtime forms: the copy rides the
 * store under the architecture.form.* family, keyed by the declared form
 * ids of sandboxprofile (the ids are data, the words are copy). */
const formlabels: Record<sandboxformid, { name: string; pkg: string; note: string }> = {
	'runtime-node': {
		name: label('architecture.form.runtimeNode.name'),
		pkg: label('architecture.form.runtimeNode.pkg'),
		note: label('architecture.form.runtimeNode.note'),
	},
	'full-docker': {
		name: label('architecture.form.fullDocker.name'),
		pkg: label('architecture.form.fullDocker.pkg'),
		note: label('architecture.form.fullDocker.note'),
	},
	published: {
		name: label('architecture.form.published.name'),
		pkg: label('architecture.form.published.pkg'),
		note: label('architecture.form.published.note'),
	},
};

/** the four layers of the map: the glyph is presentation code, every word
 * rides the store (the home surfaces() precedent). */
function layers(): readonly { icon: typeof GitBranch; name: string; sub: string; body: string }[] {
	return [
		{
			icon: GitBranch,
			name: label('architecture.layer.repository.name'),
			sub: label('architecture.layer.repository.sub'),
			body: label('architecture.layer.repository.body'),
		},
		{
			icon: Cpu,
			name: label('architecture.layer.runner.name'),
			sub: label('architecture.layer.runner.sub'),
			body: label('architecture.layer.runner.body'),
		},
		{
			icon: Database,
			name: label('architecture.layer.memory.name'),
			sub: label('architecture.layer.memory.sub'),
			body: label('architecture.layer.memory.body'),
		},
		{
			icon: Globe2,
			name: label('architecture.layer.surface.name'),
			sub: label('architecture.layer.surface.sub'),
			body: label('architecture.layer.surface.body'),
		},
	];
}

/** the provider chain as config: the ordered ids ride the label store
 * (architecture.chain.providers — the seed ingests the row into the labels
 * table like every other string) and the page only splits the row; no fixed
 * provider array survives inside the component. */
function providerchain(): readonly string[] {
	return label('architecture.chain.providers').split(' · ');
}

export default function Architecture() {
	const [media, setMedia] = useState<MediaSlot | undefined>(undefined);

	useEffect(() => {
		void mediaSlots().then((rows) =>
			setMedia(rows.find((slot) => slot.id === 'media.runtime.map')),
		);
	}, []);

	return (
		<PageShell
			section={label('architecture.shell.section')}
			label={label('architecture.shell.label')}
			title={label('architecture.shell.title')}
			intro={label('architecture.shell.intro')}
			media={media}
		>
			<section className="content-section split-content">
				<div>
					<p className="eyebrow">{label('architecture.model.eyebrow')}</p>
					<h2 className="section-title">{label('architecture.model.title')}</h2>
				</div>
				<div className="prose-copy">
					<p>{label('architecture.model.body1')}</p>
					<p>{label('architecture.model.body2')}</p>
				</div>
			</section>
			<section className="content-section" aria-label={label('architecture.forms.aria')}>
				<div className="content-section-heading">
					<p className="eyebrow">{label('architecture.forms.eyebrow')}</p>
					<span className="mono-label">{label('architecture.forms.mono')}</span>
				</div>
				<ol className="r3-forms">
					{SANDBOXFORMS.map((form, index) => (
						<li className="r3-form-row" key={form}>
							<span className="r3-form-index">{`0${index + 1}`}</span>
							<span className="r3-form-name">{formlabels[form].name}</span>
							<span className="r3-form-pkg">{formlabels[form].pkg}</span>
							<span className="r3-form-note">{formlabels[form].note}</span>
						</li>
					))}
				</ol>
			</section>
			<section className="content-section">
				<div className="content-section-heading">
					<p className="eyebrow">{label('architecture.layers.eyebrow')}</p>
					<span className="mono-label">{label('architecture.layers.mono')}</span>
				</div>
				<div className="layer-stack">
					{layers().map((layer, index) => {
						const Icon = layer.icon;
						return (
							<div className="layer-row" key={layer.name}>
								<span className="layer-index">0{index + 1}</span>
								<Icon fontSize={20} strokeWidth={1.5} aria-hidden="true" />
								<div className="layer-name">
									<strong>{layer.name}</strong>
									<span>{layer.sub}</span>
								</div>
								<p>{layer.body}</p>
								<ArrowUpRight fontSize={16} aria-hidden="true" />
							</div>
						);
					})}
				</div>
			</section>
			<section className="content-section">
				<div className="content-section-heading">
					<p className="eyebrow">{label('architecture.chain.eyebrow')}</p>
					<span className="mono-label">{label('architecture.chain.mono')}</span>
				</div>
				<div className="provider-grid">
					{providerchain().map((name, index) => (
						<div className={`provider-cell ${index === 0 ? 'is-active' : ''}`} key={name}>
							<span className="provider-index">0{index + 1}</span>
							<strong>{name}</strong>
							<small>
								{label(
									index === 0
										? 'architecture.chain.preferred'
										: 'architecture.chain.fallback',
								)}
							</small>
						</div>
					))}
				</div>
			</section>
			<section className="content-section architecture-note">
				<ShieldCheck fontSize={21} aria-hidden="true" />
				<div>
					<p className="eyebrow">{label('architecture.limit.eyebrow')}</p>
					<p>{label('architecture.limit.body')}</p>
				</div>
			</section>
		</PageShell>
	);
}
