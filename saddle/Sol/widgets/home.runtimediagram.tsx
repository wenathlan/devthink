// Signal & Ledger: the runtime chain of repo, runner and pages as one
// execution model. Page-owned copy of the runtime diagram: lives inside the
// home folder that renders it. The topline states the chain it draws — no
// boot timer, no live indicator: the diagram is the model, never a claim
// that a runner is running.
import {
        ArrowRightRegular as ArrowRight,
        DatabaseRegular as Database,
        BranchForkRegular as GitBranch,
        GlobeRegular as Globe2,
        ServerRegular as Server,
} from '@fluentui/react-icons';

const nodes = [
        { icon: GitBranch, label: 'repo', detail: 'persistent state', tone: 'ink' },
        { icon: Server, label: 'CI runner', detail: 'virtual processor', tone: 'ember' },
        { icon: Database, label: 'memory', detail: 'storage bridge', tone: 'blue' },
        { icon: Globe2, label: 'Pages / CDN', detail: 'shared surface', tone: 'sage' },
];

export default function RuntimeDiagram() {
        return (
                <div className="runtime-diagram" role="group" aria-label="Runtime chain diagram">
                        <div className="diagram-topline">
                                <span>THE CHAIN / FOUR STAGES</span>
                                <span>repo → runner → memory → surface</span>
                        </div>
                        <div className="diagram-nodes">
                                {nodes.map((node, index) => {
                                        const Icon = node.icon;
                                        return (
                                                <div className="diagram-node-wrap" key={node.label}>
                                                        <div className={`diagram-node tone-${node.tone}`}>
                                                                <Icon fontSize={19} strokeWidth={1.7} />
                                                                <div>
                                                                        <strong>{node.label}</strong>
                                                                        <small>{node.detail}</small>
                                                                </div>
                                                        </div>
                                                        {index < nodes.length - 1 && <ArrowRight className="diagram-arrow" fontSize={18} />}
                                                </div>
                                        );
                                })}
                        </div>
                        <div className="diagram-footer">
                                <span>
                                        usage flag: <b>process</b>
                                </span>
                                <span>
                                        latency budget: <b>remote / explicit</b>
                                </span>
                        </div>
                </div>
        );
}
