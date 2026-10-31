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
// Every word of the page rides the label store (labels.ts — the copy law);
// the fixture and the stage states stay the honest data of the projection.
import {
        PulseRegular as Activity,
        ProhibitedRegular as Ban,
        CubeRegular as Blocks,
        BracesRegular as Braces,
        DatabaseRegular as Database,
        DocumentErrorRegular as FileWarning,
        CommunicationRegular as Network,
        ShieldTaskRegular as ShieldCheck,
} from '@fluentui/react-icons';
import { type CSSProperties, useMemo, useState } from 'react';
import { PageShell } from '../shell/Shell.tsx';
import { label, labelfill, type LabelKey } from '../../labels.ts';

const fixture = Object.freeze({
        id: 'fixture.binary.001',
        effect: 'binary-execution',
        target: 'remote',
        // biome-ignore lint/security/noSecrets: a deterministic demo payload digest for the sandbox spec fixture, not a credential
        source: '8c3d2e7b6a5f4c1d0e9b8a7f6c5d4e3b2a1908172635445566778899aabbccdd',
        budget: { maxbytes: 65536, maxmilliseconds: 250 },
});

/** the six boundaries of the projection: the glyph and the two-digit index
 * are presentation code, the words ride the store (playground.boundary.*). */
const boundaries: readonly {
        index: string;
        namekey: LabelKey;
        detailkey: LabelKey;
        icon: typeof Braces;
}[] = [
        {
                index: '01',
                namekey: 'playground.boundary.gateway.name',
                detailkey: 'playground.boundary.gateway.detail',
                icon: Braces,
        },
        {
                index: '02',
                namekey: 'playground.boundary.plan.name',
                detailkey: 'playground.boundary.plan.detail',
                icon: Blocks,
        },
        {
                index: '03',
                namekey: 'playground.boundary.policy.name',
                detailkey: 'playground.boundary.policy.detail',
                icon: ShieldCheck,
        },
        {
                index: '04',
                namekey: 'playground.boundary.materialize.name',
                detailkey: 'playground.boundary.materialize.detail',
                icon: Database,
        },
        {
                index: '05',
                namekey: 'playground.boundary.execute.name',
                detailkey: 'playground.boundary.execute.detail',
                icon: Activity,
        },
        {
                index: '06',
                namekey: 'playground.boundary.evidence.name',
                detailkey: 'playground.boundary.evidence.detail',
                icon: FileWarning,
        },
];

/** the two policy modalities of the projection: each is one card, and each
 * card walks the six boundaries as its own stage ladder (the windows
 * stepper — the ::after indicator: 0 closed, 6px #858585 done, 12px accent
 * active). the card words ride the store (playground.card.*). */
const modalitycards: readonly {
        id: 'default' | 'delegated';
        index: string;
        namekey: LabelKey;
        codekey: LabelKey;
        verdictkey: LabelKey;
        tipkey: LabelKey;
}[] = [
        {
                id: 'default',
                index: '01',
                namekey: 'playground.card.default.name',
                codekey: 'playground.card.default.code',
                verdictkey: 'playground.card.default.verdict',
                tipkey: 'playground.card.default.tip',
        },
        {
                id: 'delegated',
                index: '02',
                namekey: 'playground.card.delegated.name',
                codekey: 'playground.card.delegated.code',
                verdictkey: 'playground.card.delegated.verdict',
                tipkey: 'playground.card.delegated.tip',
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
                namekey: boundary.namekey,
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
                        section={label('playground.shell.section')}
                        label={label('playground.shell.label')}
                        title={label('playground.shell.title')}
                        intro={label('playground.shell.intro')}
                >
                        <section className="content-section split-content">
                                <div>
                                        <p className="eyebrow">{label('playground.split.eyebrow')}</p>
                                        <h2 className="section-title">
                                                {label('playground.split.title1')}
                                                <br />
                                                <span>{label('playground.split.title2')}</span>
                                        </h2>
                                </div>
                                <div className="prose-copy">
                                        <p>{label('playground.split.body1')}</p>
                                        <p>{label('playground.split.body2')}</p>
                                </div>
                        </section>

                        <section className="content-section">
                                <div className="content-section-heading">
                                        <p className="eyebrow">{label('playground.boundaries.eyebrow')}</p>
                                        <span className="mono-label">{label('playground.boundaries.mono')}</span>
                                </div>
                                <div className="playground-boundaries">
                                        {boundaries.map(({ index, namekey, detailkey, icon: Icon }, cardindex) => (
                                                <article
                                                        className="playground-boundary"
                                                        key={namekey}
                                                        style={{ '--stagger-i': cardindex } as CSSProperties}
                                                >
                                                        <span>{index}</span>
                                                        <Icon fontSize={18} />
                                                        <strong>{label(namekey)}</strong>
                                                        <small>{label(detailkey)}</small>
                                                </article>
                                        ))}
                                </div>
                        </section>

                        <section className="content-section" aria-label={label('playground.modalities.aria')}>
                                <div className="content-section-heading">
                                        <p className="eyebrow">{label('playground.modalities.eyebrow')}</p>
                                        <span className="mono-label">{label('playground.modalities.mono')}</span>
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
                                                                data-tip={label(card.tipkey)}
                                                                onClick={() => setMode(card.id)}
                                                        >
                                                                <span className="r3-modality-index">{card.index}</span>
                                                                <span className="r3-modality-name">{label(card.namekey)}</span>
                                                                <span className="r3-modality-code">{label(card.codekey)}</span>
                                                        </button>
                                                        <p className="r3-modality-verdict">{label(card.verdictkey)}</p>
                                                        <ol
                                                                className="r3-walk"
                                                                aria-label={labelfill('playground.walkAria', { name: label(card.namekey) })}
                                                        >
                                                                {walkstages(card.id).map((stage) => (
                                                                        <li key={stage.namekey} className="r3-walkstage" data-state={stage.state}>
                                                                                <span className="r3-walkstage-index">{stage.index}</span>
                                                                                <span className="r3-walkstage-name">{label(stage.namekey)}</span>
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
                                                        <Activity fontSize={14} /> {label('playground.projection.title')}
                                                </span>
                                                <span
                                                        className={handoff.state === 'execution-disabled' ? 'console-denied' : 'console-pass'}
                                                >
                                                        {handoff.state === 'execution-disabled' ? (
                                                                <Ban fontSize={13} />
                                                        ) : (
                                                                <ShieldCheck fontSize={13} />
                                                        )}{' '}
                                                        {handoff.code}
                                                </span>
                                        </div>
                                        <div className="playground-console-body">
                                                <div className="playground-row">
                                                        <span>{label('playground.row.request')}</span>
                                                        <b>{fixture.id}</b>
                                                </div>
                                                <div className="playground-row">
                                                        <span>{label('playground.row.effect')}</span>
                                                        <b>{fixture.effect}</b>
                                                </div>
                                                <div className="playground-row">
                                                        <span>{label('playground.row.target')}</span>
                                                        <b>{fixture.target}</b>
                                                </div>
                                                <div className="playground-row">
                                                        <span>{label('playground.row.outcome')}</span>
                                                        <b>{handoff.state}</b>
                                                </div>
                                                <div className="playground-row">
                                                        <span>{label('playground.row.effects')}</span>
                                                        <b>{JSON.stringify(projection.effects)}</b>
                                                </div>
                                                <pre>{JSON.stringify(handoff, null, 2)}</pre>
                                        </div>
                                        <div className="console-footer">
                                                <span>{label('playground.footer.fixture')}</span>
                                                <span>{label('playground.footer.adapter')}</span>
                                        </div>
                                </div>
                                <aside className="playground-controls">
                                        <p className="eyebrow">{label('playground.controls.eyebrow')}</p>
                                        <h3>{label('playground.controls.title')}</h3>
                                        <p>{label('playground.controls.body')}</p>
                                        <p className="r3-modality-note" role="status">
                                                {label(
                                                        mode === 'delegated'
                                                                ? 'playground.controls.projectingDelegated'
                                                                : 'playground.controls.projectingDefault',
                                                )}
                                        </p>
                                </aside>
                        </section>

                        <section className="content-section note-band">
                                <Network fontSize={21} />
                                <div>
                                        <p className="eyebrow">{label('playground.note.eyebrow')}</p>
                                        <p>{label('playground.note.body')}</p>
                                </div>
                        </section>
                </PageShell>
        );
}
