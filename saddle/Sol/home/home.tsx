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
 *
 * The flow law rides this anchor: the default export is the ENTRY GATE
 * (entrygate.tsx, beside this anchor) — the seen flags are consulted before
 * the landing shows, an unfinished flow is replaced at /intro or
 * /onboarding, and only a visitor that finished both stages ever sees the
 * surface below.
 */

import {
        ArrowDownRightRegular as ArrowDownRight,
        ArrowUpRightRegular as ArrowUpRight,
        PlugConnectedRegular as Cable,
        KeyboardRegular as Command,
        LayerRegular as Layers3,
        ArrowRightRegular as MoveRight,
        BoxRegular as Package,
} from '@fluentui/react-icons';
// Signal & Ledger: home as the landing — declare the sandbox, read the matrix, boot the console.
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { SectionRail } from '../shell/Shell.tsx';
import { type MediaSlot, mediaSlots } from '../../catalog';
import { label, labelfill } from '../../labels.ts';
import { specenvlimits } from '../../sandboxenvprofile.ts';
import {
        SANDBOXARCHES,
        SANDBOXBASES,
        SANDBOXFORMS,
        SANDBOXOSES,
        type sandboxarchid,
        type sandboxbaseid,
        type sandboxosid,
} from '../../sandboxprofile.ts';
import EntryGate from '../widgets/home.entrygate.tsx';
import MetricStrip from '../widgets/home.metricstrip.tsx';
import RuntimeDiagram from '../widgets/home.runtimediagram.tsx';

export * from '../widgets/home.metricstrip.tsx';
export * from '../widgets/home.runtimediagram.tsx';

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

/** the chip groups of the hero: the three fixed vocabularies — the tokens
 * are the declared data, the group labels ride the store. */
function chipgroups(): readonly { key: keyof Declaration; label: string; items: readonly string[] }[] {
        return [
                { key: 'base', label: label('home.chips.base'), items: SANDBOXBASES },
                { key: 'os', label: label('home.chips.guest'), items: SANDBOXOSES },
                { key: 'arch', label: label('home.chips.arch'), items: SANDBOXARCHES },
        ];
}

/** the surfaces ledger: one engine, three shells (the labels ride the store). */
function surfaces(): readonly {
        index: string;
        icon: typeof Cable;
        title: string;
        body: string;
        href: string;
}[] {
        return [
                {
                        index: '01',
                        icon: Cable,
                        title: label('home.surface.browser.title'),
                        body: label('home.surface.browser.body'),
                        href: '/agent-browser',
                },
                {
                        index: '02',
                        icon: Layers3,
                        title: label('home.surface.compute.title'),
                        body: label('home.surface.compute.body'),
                        href: '/compute',
                },
                {
                        index: '03',
                        icon: Package,
                        title: label('home.surface.packages.title'),
                        body: label('home.surface.packages.body'),
                        href: '/integrations',
                },
        ];
}

/** the 01–03 steps of the landing: declare → boot → keep. */
function steps(): readonly { index: string; title: string; body: string; href?: string }[] {
        return [
                {
                        index: '01',
                        title: label('home.steps.declare.title'),
                        body: label('home.steps.declare.body'),
                },
                {
                        index: '02',
                        title: label('home.steps.boot.title'),
                        body: label('home.steps.boot.body'),
                        href: '/console',
                },
                {
                        index: '03',
                        title: label('home.steps.keep.title'),
                        body: label('home.steps.keep.body'),
                        href: '/dashboard',
                },
        ];
}

/** the footer meta-quad: the four moves of the platform. */
function quad(): readonly { index: string; title: string; body: string; href: string }[] {
        return [
                {
                        index: '01',
                        title: label('home.quad.boot.title'),
                        body: label('home.quad.boot.body'),
                        href: '/console',
                },
                {
                        index: '02',
                        title: label('home.quad.operate.title'),
                        body: label('home.quad.operate.body'),
                        href: '/dashboard',
                },
                {
                        index: '03',
                        title: label('home.quad.chain.title'),
                        body: label('home.quad.chain.body'),
                        href: '/compute',
                },
                {
                        index: '04',
                        title: label('home.quad.thesis.title'),
                        body: label('home.quad.thesis.body'),
                        href: '/architecture',
                },
        ];
}

/** the landing surface: the hero stage, the ledgers and the footer quad
 * (mounted only when the entry gate lets the flow through). */
function HomeSurface() {
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
                parsed.base !== null ? labelfill('home.declared.base', { value: parsed.base }) : null,
                parsed.os !== null ? labelfill('home.declared.guest', { value: parsed.os }) : null,
                parsed.arch !== null ? labelfill('home.declared.arch', { value: parsed.arch }) : null,
        ].filter(Boolean);
        const declaredline =
                declaredbits.length > 0
                        ? labelfill('home.declared.line', { parts: declaredbits.join(' · ') })
                        : label('home.declared.none');

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
                        guests: labelfill('home.matrix.guests', { n: String(SANDBOXOSES.length) }),
                        arch: label('home.matrix.archValue'),
                        vgpu:
                                row.maxvgpus === 0
                                        ? label('home.matrix.vgpuNone')
                                        : labelfill(
                                                  row.maxvgpus === 1 ? 'home.matrix.vgpuOne' : 'home.matrix.vgpuMany',
                                                  { n: String(row.maxvgpus) },
                                          ),
                        ceiling: labelfill('home.matrix.ceiling', {
                                vcpus: String(row.maxvcpus),
                                ram: String(row.maxramgb),
                                disk: String(row.maxdiskgb),
                                minutes: String(Math.round(row.maxtimeoutseconds / 60)),
                        }),
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
                                                        <span className="status-dot" /> {label('home.hero.eyebrow')}
                                                </p>
                                                <h1 className="r3-display" id="r3herotitle">
                                                        {label('home.hero.titleLine1')}
                                                        <br />
                                                        <em>{label('home.hero.titleLine2')}</em>
                                                </h1>
                                                <p className="r3-hero-lede">{label('home.hero.lede')}</p>
                                                <form
                                                        className="r3-prompt"
                                                        aria-label={label('home.hero.formAria')}
                                                        onSubmit={(event) => {
                                                                event.preventDefault();
                                                                spin();
                                                        }}
                                                >
                                                        <label className="r3-prompt-label" htmlFor="r3declare">
                                                                {label('home.hero.declareLabel')}
                                                        </label>
                                                        <input
                                                                id="r3declare"
                                                                className="r3-prompt-input"
                                                                type="text"
                                                                value={draft}
                                                                placeholder={label('home.hero.placeholder')}
                                                                spellCheck={false}
                                                                autoComplete="off"
                                                                onChange={(event) => setDraft(event.target.value)}
                                                        />
                                                        <button className="r3-prompt-key" type="submit">
                                                                {label('home.hero.boot')}
                                                                <ArrowDownRight fontSize={15} aria-hidden="true" />
                                                        </button>
                                                </form>
                                                <fieldset className="r3-chips">
                                                        <legend className="r3-chips-legend">{label('home.hero.chipsLegend')}</legend>
                                                        {chipgroups().map((group) => (
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
                                                <aside className="r3-matrix" aria-label={label('home.matrix.aria')}>
                                                        <div className="r3-matrix-head">
                                                                <span>{label('home.matrix.title')}</span>
                                                                <span className="mono-label">{label('home.matrix.subtitle')}</span>
                                                        </div>
                                                        <table className="r3-matrix-table">
                                                                <thead>
                                                                        <tr>
                                                                                <th scope="col">{label('home.matrix.colBase')}</th>
                                                                                <th scope="col">{label('home.matrix.colGuests')}</th>
                                                                                <th scope="col">{label('home.matrix.colArch')}</th>
                                                                                <th scope="col">{label('home.matrix.colVgpu')}</th>
                                                                                <th scope="col">{label('home.matrix.colCeiling')}</th>
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
                                                                {labelfill('home.matrix.note', { oses: SANDBOXOSES.join(' · ') })}
                                                        </p>
                                                </aside>
                                        </div>
                                </section>

                                <section className="metric-section container">
                                        <MetricStrip
                                                metrics={[
                                                        {
                                                                value: label('home.metric.bases.value'),
                                                                label: label('home.metric.bases.label'),
                                                                detail: label('home.metric.bases.detail'),
                                                        },
                                                        {
                                                                value: label('home.metric.storage.value'),
                                                                label: label('home.metric.storage.label'),
                                                                detail: label('home.metric.storage.detail'),
                                                        },
                                                        {
                                                                value: String(SANDBOXFORMS.length).padStart(2, '0'),
                                                                label: label('home.metric.forms.label'),
                                                                detail: label('home.metric.forms.detail'),
                                                        },
                                                ]}
                                        />
                                </section>

                                <section id="thesis" className="thesis-section container section-with-rail">
                                        <SectionRail number="01" label={label('home.thesis.railLabel')} />
                                        <div className="thesis-content">
                                                <p className="eyebrow">{label('home.thesis.eyebrow')}</p>
                                                <h2 className="section-title">
                                                        {label('home.thesis.title')}
                                                        <span>{label('home.thesis.titleAccent')}</span>
                                                </h2>
                                                <div className="thesis-grid">
                                                        <p>
                                                                {label('home.thesis.bodyLead')}
                                                                <b>{label('home.thesis.keep')}</b>
                                                                {label('home.thesis.join')}
                                                                <b>{label('home.thesis.process')}</b>
                                                                {label('home.thesis.bodyTail')}
                                                        </p>
                                                        <div className="evidence-card">
                                                                <div className="evidence-card-head">
                                                                        <Command fontSize={16} />
                                                                        <span>{label('home.evidence.head')}</span>
                                                                        <span className="card-index">{label('home.evidence.index')}</span>
                                                                </div>
                                                                <div className="evidence-equation">
                                                                        <span>{label('home.evidence.storage')}</span>
                                                                        <b>{label('home.evidence.equals')}</b>
                                                                        <span>{label('home.evidence.memory')}</span>
                                                                </div>
                                                                <div className="evidence-card-foot">
                                                                        <span>{label('home.evidence.difference')}</span>
                                                                        <b>{label('home.evidence.usageFlag')}</b>
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>
                                </section>

                                <section className="runtime-section">
                                        <div className="container section-with-rail">
                                                <SectionRail number="02" label={label('home.chain.railLabel')} />
                                                <div className="runtime-content">
                                                        <div className="section-heading-row">
                                                                <div>
                                                                        <p className="eyebrow">{label('home.chain.eyebrow')}</p>
                                                                        <h2 className="section-title">{label('home.chain.title')}</h2>
                                                                </div>
                                                                <Link href="/architecture" className="small-arrow-link">
                                                                        {label('home.chain.archLink')}
                                                                        <MoveRight fontSize={15} />
                                                                </Link>
                                                        </div>
                                                        <div className="runtime-layout">
                                                                <RuntimeDiagram />
                                                                <div className="runtime-art-frame">
                                                                        {runtimeSlot && (
                                                                                <figure
                                                                                        className="media-area"
                                                                                        style={{ aspectRatio: runtimeSlot.ratio }}
                                                                                        aria-label={label('home.media.area')}
                                                                                >
                                                                                        <figcaption>
                                                                                                <span>{runtimeSlot.label}</span>
                                                                                                <span>{runtimeSlot.caption}</span>
                                                                                        </figcaption>
                                                                                </figure>
                                                                        )}
                                                                        <span>{label('home.chain.fig')}</span>
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>
                                </section>

                                <section className="surfaces-section container section-with-rail">
                                        <SectionRail number="03" label={label('home.surfaces.railLabel')} />
                                        <div className="surfaces-content">
                                                <div className="section-heading-row">
                                                        <div>
                                                                <p className="eyebrow">{label('home.surfaces.eyebrow')}</p>
                                                                <h2 className="section-title">
                                                                        {label('home.surfaces.titleLine1')}
                                                                        <br />
                                                                        {label('home.surfaces.titleLine2')}
                                                                </h2>
                                                        </div>
                                                        <span className="mono-label">
                                                                {labelfill('home.surfaces.available', {
                                                                        n: String(surfaces().length).padStart(2, '0'),
                                                                })}
                                                        </span>
                                                </div>
                                                <div className="surface-list">
                                                        {surfaces().map((surface) => {
                                                                const Icon = surface.icon;
                                                                return (
                                                                        <Link className="surface-row" href={surface.href} key={surface.title}>
                                                                                <span className="surface-number">{surface.index}</span>
                                                                                <Icon fontSize={21} strokeWidth={1.5} aria-hidden="true" />
                                                                                <div className="surface-copy">
                                                                                        <h3>{surface.title}</h3>
                                                                                        <p>{surface.body}</p>
                                                                                </div>
                                                                                <ArrowUpRight className="surface-arrow" fontSize={18} aria-hidden="true" />
                                                                        </Link>
                                                                );
                                                        })}
                                                </div>
                                        </div>
                                </section>

                                <section className="r3-steps container" aria-label={label('home.steps.aria')}>
                                        {steps().map((step) => (
                                                <div className="r3-step" key={step.index}>
                                                        <span className="r3-step-index">{step.index}</span>
                                                        <h3 className="r3-step-title">{step.title}</h3>
                                                        <p className="r3-step-body">{step.body}</p>
                                                        {step.href && (
                                                                <Link className="r3-step-link" href={step.href}>
                                                                        {labelfill('home.steps.link', { title: step.title })}
                                                                        <ArrowUpRight fontSize={14} aria-hidden="true" />
                                                                </Link>
                                                        )}
                                                </div>
                                        ))}
                                </section>
                        </main>

                        {/* the footer meta-quad: the four moves flush to the window floor */}
                        <footer className="r3-quad">
                                <div className="r3-quad-grid container">
                                        {quad().map((cell) => (
                                                <Link className="r3-quad-cell" href={cell.href} key={cell.index}>
                                                        <span className="r3-quad-index">{cell.index}</span>
                                                        <span className="r3-quad-title">{cell.title}</span>
                                                        <span className="r3-quad-body">{cell.body}</span>
                                                </Link>
                                        ))}
                                </div>
                                <div className="site-footer container">
                                        <span>{label('home.footer.copyright')}</span>
                                        <span className="mono-label">{label('home.footer.mono')}</span>
                                </div>
                        </footer>
                </div>
        );
}

/**
 * The home page anchor: the entry gate rides the surface — the flow law
 * (intro → onboarding → the platform) is consulted before the home shows.
 *
 * @returns the gated home element.
 */
export default function Home() {
        return (
                <EntryGate>
                        <HomeSurface />
                </EntryGate>
        );
}
