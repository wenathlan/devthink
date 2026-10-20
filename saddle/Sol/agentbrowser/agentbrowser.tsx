/**
 * agentbrowser page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import {
        PulseRegular as Activity,
        ProhibitedRegular as Ban,
        CameraRegular as Camera,
        CheckmarkCircleRegular as CheckCircle2,
        KeyboardRegular as Keyboard,
        CursorRegular as MousePointer2,
        PlayRegular as Play,
        ArrowCounterclockwiseRegular as RotateCcw,
        DocumentTextRegular as ScrollText,
        WindowConsoleRegular as Terminal,
} from '@fluentui/react-icons';
// Signal & Ledger: agent browser as an event trail, evidence and deterministic replay.
// The session console renders the rows the sessions catalog serves — the
// documented example log of docs/logs/examplesession.json offline, the paired
// database rows over HTTPS — never invented coordinates or counts.
import { useEffect, useState } from 'react';
import { PageShell } from '../shell/Shell';
import {
        type AgentSession,
        type AgentSessionEvent,
        agentsessions,
        type MediaSlot,
        mediaSlots,
} from '../../catalog';

/** the glyph of one event kind of the session trail. */
function eventicon(type: string) {
        if (type === 'scroll') return ScrollText;
        if (type === 'type') return Keyboard;
        return MousePointer2;
}

/** the value line of one event: exactly the fields the row carries. */
function eventvalue(event: AgentSessionEvent): string {
        if (event.type === 'scroll') return `dy ${event.dy ?? 0}`;
        if (event.type === 'type') return `key ${event.key ?? ''}`;
        return `x ${event.x ?? 0} / y ${event.y ?? 0}`;
}

/** the elapsed label of one event from its relative time. */
const eventtime = (event: AgentSessionEvent): string => `+${event.t} ms`;

/** one rendered event row: the glyph, the relative time, the kind and the fields. */
function SessionEventRow({ event }: { event: AgentSessionEvent }) {
        const Icon = eventicon(event.type);
        return (
                <div className="console-row">
                        <Icon fontSize={16} />
                        <span className="console-time">{eventtime(event)}</span>
                        <strong>{event.type}</strong>
                        <span>{eventvalue(event)}</span>
                </div>
        );
}

/** the event trail of one session: one row per captured event. */
function SessionTrail({ events }: { events: readonly AgentSessionEvent[] }) {
        return (
                <>
                        {events.map((event) => (
                                <SessionEventRow event={event} key={`${event.t}-${event.type}`} />
                        ))}
                </>
        );
}

/** the captcha verdict badge of one session: the honest outcome of the run. */
function CaptchaBadge({ verdict }: { verdict: AgentSession['captcha'] }) {
        return (
                <span className={verdict.passed ? 'console-pass' : 'console-denied'}>
                        {verdict.passed ? <CheckCircle2 fontSize={14} /> : <Ban fontSize={13} />} {verdict.kind}{' '}
                        {verdict.passed ? 'passed' : 'failed'}
                </span>
        );
}

export default function AgentBrowser() {
        const [media, setMedia] = useState<MediaSlot | undefined>(undefined);
        const [sessions, setSessions] = useState<AgentSession[] | null>(null);

        useEffect(() => {
                void mediaSlots().then((rows) =>
                        setMedia(rows.find((slot) => slot.id === 'media.agentbrowser.trace')),
                );
        }, []);

        useEffect(() => {
                let live = true;
                agentsessions()
                        .then((rows) => {
                                if (live) setSessions(rows);
                        })
                        .catch(() => {
                                if (live) setSessions([]);
                        });
                return () => {
                        live = false;
                };
        }, []);

        const session = sessions?.[0] ?? null;
        const lastt = session ? session.events[session.events.length - 1]?.t ?? 0 : 0;
        const sessionlabel = session ? session.session.id : 'reading the catalog…';
        /** the trimmed json projection of the served row (the docs/logs shape). */
        const sessionsummary = session
                ? JSON.stringify(
                          {
                                  version: session.version,
                                  session: {
                                          id: session.session.id,
                                          browser: session.session.browser,
                                  },
                                  events: session.events.map((event) => event.type),
                                  captcha: session.captcha,
                          },
                          null,
                          2,
                  )
                : 'waiting for the session rows…';

        return (
                <PageShell
                        section="02 / 06"
                        label="Agent Browser"
                        title="Movement becomes evidence."
                        intro="The browser agent captures a session as data: movement, click, scroll, key and the intent to replay everything later."
                        media={media}
                >
                        <section className="content-section split-content">
                                <div>
                                        <p className="eyebrow">CAPTURE / REPLAY</p>
                                        <h2 className="section-title">The session is an artifact, not a black box.</h2>
                                </div>
                                <div className="prose-copy">
                                        <p>
                                                Brave capture, movement replay and session recording share the same layer. Each event is
                                                stored with relative time, CSS px coordinates, target and seed. Replay reruns the
                                                sequence at configurable speed.
                                        </p>
                                        <p>
                                                For the operator, this means an auditable trail: every click can point to a screenshot,
                                                token or evidence video.
                                        </p>
                                </div>
                        </section>
                        <section className="content-section browser-grid">
                                <div className="session-console">
                                        <div className="console-head">
                                                <span>
                                                        <Terminal fontSize={14} /> SESSION / {sessionlabel}
                                                </span>
                                                {session ? <CaptchaBadge verdict={session.captcha} /> : null}
                                        </div>
                                        <div className="console-rows">
                                                {session === null ? (
                                                        <div className="console-row" aria-live="polite">
                                                                <Activity fontSize={16} />
                                                                <span className="console-time" />
                                                                <strong>catalog</strong>
                                                                <span>waiting for the rows…</span>
                                                        </div>
                                                ) : session.events.length === 0 ? (
                                                        <div className="console-row" aria-live="polite">
                                                                <Activity fontSize={16} />
                                                                <span className="console-time" />
                                                                <strong>catalog</strong>
                                                                <span>no session rows served yet.</span>
                                                        </div>
                                                ) : (
                                                        <>
                                                                <SessionTrail events={session.events} />
                                                                <div className="console-row">
                                                                        <Activity fontSize={16} />
                                                                        <span className="console-time">+{lastt} ms</span>
                                                                        <strong>metrics</strong>
                                                                        <span>
                                                                                {session.events.length} events /{' '}
                                                                                {(lastt / 1000).toFixed(1)} s
                                                                        </span>
                                                                </div>
                                                        </>
                                                )}
                                        </div>
                                        <div className="console-footer">
                                                <span>seed / {session ? session.session.seed : 'n/a'}</span>
                                                <span>browser / {session ? session.session.browser : 'n/a'}</span>
                                        </div>
                                </div>
                                <div className="browser-principles">
                                        <div className="principle-card">
                                                <Camera fontSize={19} />
                                                <div>
                                                        <strong>DOM + vision</strong>
                                                        <span>Hybrid capture is the baseline.</span>
                                                </div>
                                        </div>
                                        <div className="principle-card">
                                                <RotateCcw fontSize={19} />
                                                <div>
                                                        <strong>Deterministic replay</strong>
                                                        <span>Same events, configurable speed.</span>
                                                </div>
                                        </div>
                                        <div className="principle-card">
                                                <Play fontSize={19} />
                                                <div>
                                                        <strong>Evidence first</strong>
                                                        <span>Screenshot, token, video.</span>
                                                </div>
                                        </div>
                                </div>
                        </section>
                        <section className="content-section">
                                <div className="content-section-heading">
                                        <p className="eyebrow">SESSION JSON / V{session ? session.version : 1}</p>
                                        <span className="mono-label">docs/logs/&lt;session&gt;.json</span>
                                </div>
                                <pre className="code-block">
                                        <code>{sessionsummary}</code>
                                </pre>
                        </section>
                </PageShell>
        );
}
