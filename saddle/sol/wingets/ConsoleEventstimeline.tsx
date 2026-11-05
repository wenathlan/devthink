// Events timeline: faithful absorption of the console.html bus events aside —
// the newest event on top, kind-tinted left borders and a 50 entry cap
// maintained by the console page.
import { label } from '../../labels.ts';

/** timeline entry kinds tinting the left border. */
export type SandboxEventKind = 'lifecycle' | 'exec' | 'snapshot';

/** one bus event row: stamp, sequence, topic and detail. */
export type SandboxEvent = {
	id: number;
	time: string;
	topic: string;
	detail: string;
	kind: SandboxEventKind;
};

type EventsTimelineProps = {
	events: SandboxEvent[];
};

/**
 * the bus event timeline (role=log, polite aria-live); the empty state
 * matches the static page ("no events yet; start the sandbox.").
 */
export default function EventsTimeline({ events }: EventsTimelineProps) {
	return (
		<aside className="events-panel" aria-labelledby="eventstitle">
			<h2 className="sandbox-panel-title" id="eventstitle">
				{label('console.events.title')}
			</h2>
			<ol
				className="events-list"
				role="log"
				aria-live="polite"
				aria-label={label('console.events.aria')}
			>
				{events.length === 0 ? (
					<li className="events-empty">{label('console.events.empty')}</li>
				) : (
					events.map((event) => (
						<li key={event.id} className={event.kind}>
							<span className="event-time">{`${event.time} #${event.id} `}</span>
							<span className="event-topic">{event.topic}</span>
							<span className="event-detail">{event.detail}</span>
						</li>
					))
				)}
			</ol>
		</aside>
	);
}
