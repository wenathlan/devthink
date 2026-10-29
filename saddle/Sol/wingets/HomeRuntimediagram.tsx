// Signal & Ledger: the runtime chain of repo, runner and pages as one
// execution model. Page-owned copy of the runtime diagram: lives inside the
// home folder that renders it. The topline states the chain it draws — no
// boot timer, no live indicator: the diagram is the model, never a claim
// that a runner is running. the copy rides the label store (labels.ts).
import {
        ArrowRightRegular as ArrowRight,
        DatabaseRegular as Database,
        BranchForkRegular as GitBranch,
        GlobeRegular as Globe2,
        ServerRegular as Server,
} from '@fluentui/react-icons';
import { label, type LabelKey } from '../../labels.ts';

/** the four nodes of the chain: the icon and the tone stay data, the words
 * ride the store. */
const nodes: readonly {
        icon: typeof GitBranch;
        labelkey: LabelKey;
        detailkey: LabelKey;
        tone: string;
}[] = [
        { icon: GitBranch, labelkey: 'home.diagram.repo', detailkey: 'home.diagram.repoDetail', tone: 'ink' },
        { icon: Server, labelkey: 'home.diagram.runner', detailkey: 'home.diagram.runnerDetail', tone: 'ember' },
        { icon: Database, labelkey: 'home.diagram.memory', detailkey: 'home.diagram.memoryDetail', tone: 'blue' },
        { icon: Globe2, labelkey: 'home.diagram.surface', detailkey: 'home.diagram.surfaceDetail', tone: 'sage' },
];

export default function RuntimeDiagram() {
        return (
                <div className="runtime-diagram" role="group" aria-label={label('home.diagram.aria')}>
                        <div className="diagram-topline">
                                <span>{label('home.diagram.topline')}</span>
                                <span>{label('home.diagram.chain')}</span>
                        </div>
                        <div className="diagram-nodes">
                                {nodes.map((node, index) => {
                                        const Icon = node.icon;
                                        return (
                                                <div
                                                        className="diagram-node-wrap"
                                                        key={label(node.labelkey)}
                                                >
                                                        <div className={`diagram-node tone-${node.tone}`}>
                                                                <Icon fontSize={19} strokeWidth={1.7} />
                                                                <div>
                                                                        <strong>{label(node.labelkey)}</strong>
                                                                        <small>{label(node.detailkey)}</small>
                                                                </div>
                                                        </div>
                                                        {index < nodes.length - 1 && <ArrowRight className="diagram-arrow" fontSize={18} />}
                                                </div>
                                        );
                                })}
                        </div>
                        <div className="diagram-footer">
                                <span>
                                        {label('home.diagram.usageFlag')}
                                        <b>{label('home.diagram.usageFlagValue')}</b>
                                </span>
                                <span>
                                        {label('home.diagram.latencyBudget')}
                                        <b>{label('home.diagram.latencyBudgetValue')}</b>
                                </span>
                        </div>
                </div>
        );
}
