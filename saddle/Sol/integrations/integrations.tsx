/**
 * integrations page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Signal & Ledger: integrations as surfaces of the same engine, not
// disconnected products. The glyphs are presentation code; every word rides
// the label store (labels.ts — the copy law).
import {
        FoodAppleRegular as Apple,
        BotRegular as Bot,
        BoxRegular as Box,
        BoxRegular as Container,
        BranchForkRegular as GitBranch,
        GlobeRegular as Globe,
        PhoneRegular as Smartphone,
        WindowConsoleRegular as Terminal,
} from '@fluentui/react-icons';
import { PageShell } from '../shell/Shell.tsx';
import { label, labelfill, type LabelKey } from '../../labels.ts';

/** the surface groups: the glyph is presentation code, the group and item
 * words ride the store (integrations.group.* / integrations.item.*). */
const integrationGroups: readonly {
        labelkey: LabelKey;
        items: readonly { icon: typeof Box; namekey: LabelKey; bodykey: LabelKey }[];
}[] = [
        {
                labelkey: 'integrations.group.package.label',
                items: [
                        {
                                icon: Box,
                                namekey: 'integrations.item.npm.name',
                                bodykey: 'integrations.item.npm.body',
                        },
                        {
                                icon: Terminal,
                                namekey: 'integrations.item.cli.name',
                                bodykey: 'integrations.item.cli.body',
                        },
                        {
                                icon: Container,
                                namekey: 'integrations.item.container.name',
                                bodykey: 'integrations.item.container.body',
                        },
                ],
        },
        {
                labelkey: 'integrations.group.client.label',
                items: [
                        {
                                icon: Globe,
                                namekey: 'integrations.item.crx.name',
                                bodykey: 'integrations.item.crx.body',
                        },
                        {
                                icon: Smartphone,
                                namekey: 'integrations.item.mobile.name',
                                bodykey: 'integrations.item.mobile.body',
                        },
                        {
                                icon: Apple,
                                namekey: 'integrations.item.desktop.name',
                                bodykey: 'integrations.item.desktop.body',
                        },
                ],
        },
        {
                labelkey: 'integrations.group.bot.label',
                items: [
                        {
                                icon: GitBranch,
                                namekey: 'integrations.item.forge.name',
                                bodykey: 'integrations.item.forge.body',
                        },
                        { icon: Bot, namekey: 'integrations.item.n8n.name', bodykey: 'integrations.item.n8n.body' },
                        {
                                icon: Terminal,
                                namekey: 'integrations.item.webhook.name',
                                bodykey: 'integrations.item.webhook.body',
                        },
                ],
        },
];

export default function Integrations() {
        return (
                <PageShell
                        section={label('integrations.shell.section')}
                        label={label('integrations.shell.label')}
                        title={label('integrations.shell.title')}
                        intro={label('integrations.shell.intro')}
                >
                        <section className="content-section split-content">
                                <div>
                                        <p className="eyebrow">{label('integrations.split.eyebrow')}</p>
                                        <h2 className="section-title">{label('integrations.split.title')}</h2>
                                </div>
                                <div className="prose-copy">
                                        <p>{label('integrations.split.body1')}</p>
                                        <p>{label('integrations.split.body2')}</p>
                                </div>
                        </section>
                        <section className="content-section integration-groups">
                                {integrationGroups.map((group) => (
                                        <div className="integration-group" key={group.labelkey}>
                                                <div className="content-section-heading">
                                                        <p className="eyebrow">{label(group.labelkey)}</p>
                                                        <span className="mono-label">
                                                                {labelfill('integrations.group.mono', {
                                                                        n: String(group.items.length),
                                                                })}
                                                        </span>
                                                </div>
                                                <div className="integration-grid">
                                                        {group.items.map((item) => {
                                                                const Icon = item.icon;
                                                                return (
                                                                        <div
                                                                                className="integration-card"
                                                                                key={item.namekey}
                                                                        >
                                                                                <Icon fontSize={20} strokeWidth={1.5} />
                                                                                <strong>{label(item.namekey)}</strong>
                                                                                <span>{label(item.bodykey)}</span>
                                                                        </div>
                                                                );
                                                        })}
                                                </div>
                                        </div>
                                ))}
                        </section>
                        <section className="content-section integration-quote">
                                <p>{label('integrations.quote.body')}</p>
                                <span className="mono-label">{label('integrations.quote.mono')}</span>
                        </section>
                </PageShell>
        );
}
