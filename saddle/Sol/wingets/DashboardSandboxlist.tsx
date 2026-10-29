// Signal & Ledger: the sandbox list absorbed from dashboard.js — state
// chips, skeletons, 30 s refresh, open/delete actions (api) and stop
// (browser-local engine).
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'wouter';
import type { ApiResult, LocalSandbox } from '../../dashboardlib.ts';
import {
        apiresult,
        asarray,
        chipclass,
        errormessage,
        fmtdate,
        pick,
        readlocalsandboxes,
        writelocalsandboxes,
} from '../../dashboardlib.ts';
import { label, labelfill } from '../../labels.ts';

type SandboxListProps = {
        /** "api" polls the shelf endpoint; "local" renders the sessionStorage shelf. */
        mode: 'api' | 'local';
        /** bumped by the orchestrator to force a skeleton reload. */
        reloadkey: number;
        /** false while the session bootstrap runs (avoids a premature 401). */
        ready: boolean;
};

/** truncates one sandbox id for display (the full id stays in the links). */
function shortid(id: string): string {
        return id.slice(0, 13) + (id.length > 13 ? '...' : '');
}

export default function SandboxList({ mode, reloadkey, ready }: SandboxListProps) {
        const [loading, setloading] = useState(true);
        const [items, setitems] = useState<unknown[]>([]);
        const [error, seterror] = useState('');
        const [notlive, setnotlive] = useState(false);
        const [deleting, setdeleting] = useState<string | null>(null);
        const [locals, setlocals] = useState<LocalSandbox[]>([]);

        /** loads the authenticated user's shelf exactly like the original page. */
        const load = useCallback(async (showskeleton: boolean) => {
                if (showskeleton) {
                        setloading(true);
                        setitems([]);
                }
                let result: ApiResult;
                try {
                        result = await apiresult('/api/v1/sandboxes');
                } catch {
                        setloading(false);
                        seterror(label('dashboard.list.unreachable'));
                        return;
                }
                if (result.status === 401 || result.status === 403) {
                        setloading(false);
                        seterror(label('dashboard.list.sessionExpired'));
                        return;
                }
                setloading(false);
                seterror('');
                if (result.status === 404) {
                        /* the list endpoint is not live on this node yet (v7 rollout) */
                        setitems([]);
                        setnotlive(true);
                        return;
                }
                setnotlive(false);
                const rows = asarray(result.body, ['sandboxes', 'items', 'data', 'list']);
                setitems(rows);
        }, []);

        useEffect(() => {
                if (!ready) {
                        return undefined;
                }
                if (mode === 'local') {
                        setloading(false);
                        seterror('');
                        setlocals(readlocalsandboxes());
                        return;
                }
                void load(true);
        }, [mode, ready, load]);

        /* the 30 s shelf poll: only while the tab is visible (api mode). */
        useEffect(() => {
                if (mode !== 'api' || !ready) {
                        return undefined;
                }
                const timer = setInterval(() => {
                        if (document.visibilityState !== 'visible') {
                                return;
                        }
                        void load(false);
                }, 30000);
                return () => clearInterval(timer);
        }, [mode, ready, load]);

        /** deletes one sandbox (the manual purge of the shelf contract). */
        async function destroy(id: string) {
                setdeleting(id);
                try {
                        const result = await apiresult(`/api/v1/sandboxes/${encodeURIComponent(id)}`, {
                                method: 'DELETE',
                        });
                        if (result.ok) {
                                await load(true);
                        } else {
                                seterror(
                                        errormessage(
                                                result,
                                                labelfill('dashboard.list.deleteFailed', { status: String(result.status) }),
                                        ),
                                );
                        }
                } catch {
                        seterror(label('dashboard.list.deleteUnreachable'));
                }
                setdeleting(null);
        }

        /** stops one browser-local sandbox (removes it from the shelf). */
        function stop(id: string) {
                const remaining = readlocalsandboxes().filter((entry) => entry.id !== id);
                writelocalsandboxes(remaining);
                setlocals(remaining);
        }

        const emptyvisible =
                !loading && error === '' && (mode === 'local' ? locals.length === 0 : items.length === 0);
        const listvisible = mode === 'local' ? locals.length > 0 : items.length > 0 && !loading;

        return (
                <div>
                        <h3>{label('dashboard.list.title')}</h3>
                        {loading && (
                                <div aria-hidden="true">
                                        <div className="dash-skeleton" />
                                        <div className="dash-skeleton" style={{ width: '88%' }} />
                                        <div className="dash-skeleton" style={{ width: '70%' }} />
                                </div>
                        )}
                        {listvisible && (
                                <ul
                                        className="dash-boxlist"
                                        aria-live="polite"
                                        aria-label={label('dashboard.list.aria')}
                                >
                                        {mode === 'local'
                                                ? locals.map((record) => {
                                                                const spectext = [
                                                                        record.spec.model,
                                                                        labelfill('dashboard.list.specVcpus', {
                                                                                vcpus: String(record.spec.vcpus),
                                                                        }),
                                                                        labelfill('dashboard.list.specRam', { ram: String(record.spec.ramgb) }),
                                                                        record.spec.gpu,
                                                                        record.spec.mig && record.spec.mig !== 'off'
                                                                                ? labelfill('dashboard.list.specMig', { mig: record.spec.mig })
                                                                                : '',
                                                                ]
                                                                        .filter(Boolean)
                                                                        .join(' / ');
                                                                return (
                                                                        <li key={record.id}>
                                                                                <div className="rowtop">
                                                                                        <span className="id">{shortid(record.id)}</span>
                                                                                        <span className={chipclass(record.state ?? 'created')}>
                                                                                                {record.state ?? 'created'}
                                                                                        </span>
                                                                                        <span className="rowactions">
                                                                                                <button
                                                                                                        type="button"
                                                                                                        className="danger mini"
                                                                                                        aria-label={labelfill('dashboard.list.stopAria', { id: record.id })}
                                                                                                        onClick={() => stop(record.id)}
                                                                                                >
                                                                                                        {label('dashboard.list.stop')}
                                                                                                </button>
                                                                                        </span>
                                                                                </div>
                                                                                <span className="specs">{spectext}</span>
                                                                                <span className="meta">
                                                                                        {labelfill('dashboard.list.metaCreated', {
                                                                                                date: fmtdate(record.createdat),
                                                                                        })}
                                                                                </span>
                                                                        </li>
                                                                );
                                                        })
                                                : items.map((record) => {
                                                                const id = String(pick(record, ['id'], ''));
                                                                const state = String(pick(record, ['state'], '?'));
                                                                const specobj = pick(record, ['spec'], null);
                                                                const spec = specobj !== null && typeof specobj === 'object' ? specobj : record;
                                                                const spectext = [
                                                                        String(pick(spec, ['model'], '?')),
                                                                        labelfill('dashboard.list.specVcpus', {
                                                                                vcpus: String(pick(spec, ['vcpus'], '?')),
                                                                        }),
                                                                        labelfill('dashboard.list.specRam', {
                                                                                ram: String(pick(spec, ['ramgb', 'ramGb', 'ram'], '?')),
                                                                        }),
                                                                        String(pick(spec, ['gpu'], '?')),
                                                                        labelfill('dashboard.list.specMig', {
                                                                                mig: String(pick(spec, ['mig'], 'off')),
                                                                        }),
                                                                ].join(' / ');
                                                                const files = pick(record, ['files'], null);
                                                                const metafrags = [
                                                                        labelfill('dashboard.list.metaCreated', {
                                                                                date: fmtdate(pick(record, ['createdAt', 'createdat', 'created_at'], null)),
                                                                        }),
                                                                        labelfill('dashboard.list.metaExpires', {
                                                                                date: fmtdate(pick(record, ['expiresAt', 'expiresat', 'expires_at'], null)),
                                                                        }),
                                                                        labelfill('dashboard.list.metaExecs', {
                                                                                count: String(pick(record, ['execCount', 'execcount'], 0)),
                                                                        }),
                                                                ];
                                                                if (files !== null && files !== undefined) {
                                                                        metafrags.push(labelfill('dashboard.list.metaFiles', { count: String(files) }));
                                                                }
                                                                const meta = metafrags.join(' / ');
                                                                return (
                                                                        <li key={id}>
                                                                                <div className="rowtop">
                                                                                        <span className="id">{shortid(id)}</span>
                                                                                        <span className={chipclass(state)}>{state}</span>
                                                                                        <span className="rowactions">
                                                                                                <Link
                                                                                                        className="dash-btn mini"
                                                                                                        href={`/console?sandbox=${encodeURIComponent(id)}`}
                                                                                                        aria-label={labelfill('dashboard.list.openAria', { id })}
                                                                                                >
                                                                                                        {label('dashboard.list.open')}
                                                                                                </Link>
                                                                                                <button
                                                                                                        type="button"
                                                                                                        className="danger mini"
                                                                                                        aria-label={labelfill('dashboard.list.deleteAria', { id })}
                                                                                                        disabled={deleting === id}
                                                                                                        onClick={() => {
                                                                                                                void destroy(id);
                                                                                                        }}
                                                                                                >
                                                                                                        {label('dashboard.list.delete')}
                                                                                                </button>
                                                                                        </span>
                                                                                </div>
                                                                                <span className="specs">{spectext}</span>
                                                                                <span className="meta">{meta}</span>
                                                                        </li>
                                                                );
                                                        })}
                                </ul>
                        )}
                        {emptyvisible && (
                                <p className="dash-empty">
                                        {notlive
                                                ? label('dashboard.list.emptyNotLive')
                                                : label('dashboard.list.empty')}
                                        {!notlive && <Link href="/console">{label('dashboard.list.consoleLink')}</Link>}
                                        {!notlive && label('dashboard.list.emptyPeriod')}
                                </p>
                        )}
                        {error !== '' && <p className="dash-panelerror">{error}</p>}
                </div>
        );
}
