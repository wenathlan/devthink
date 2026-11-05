// Snapshot controls: faithful absorption of the console.html snapshot/stop
// buttons — both stay disabled until a sandbox is running.
import { label } from '../../labels.ts';

type SnapshotControlsProps = {
	running: boolean;
	onsnapshot: () => void;
	onstop: () => void;
};

/** the snapshot and teardown buttons of the running sandbox. */
export default function SnapshotControls({ running, onsnapshot, onstop }: SnapshotControlsProps) {
	return (
		<>
			<button
				className="button"
				type="button"
				disabled={!running}
				onClick={onsnapshot}
				aria-label={label('console.snapshotAria')}
			>
				{label('console.snapshot')}
			</button>
			<button
				className="button"
				type="button"
				disabled={!running}
				onClick={onstop}
				aria-label={label('console.stopAria')}
			>
				{label('console.stop')}
			</button>
		</>
	);
}
