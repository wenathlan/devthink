// Signal & Ledger: the creation form absorbed from dashboard.js —
// engine catalogs (sandbox.ts) with static fallback, spec posted to the
// api or materialized in the local engine (static mode).
import { useState } from 'react';
import {
        apiresult,
        errormessage,
        fallbackcpus,
        fallbackgpus,
        readlocalsandboxes,
        writelocalsandboxes,
} from '../../dashboardlib.ts';
import { label, labelfill } from '../../labels.ts';
import { cpudata, createSandboxState, gpudata } from '../../sandbox.ts';

type CreateSandboxFormProps = {
        /** "api" posts /api/v1/sandboxes; "local" drives the browser engine shelf. */
        mode: 'api' | 'local';
        /** fires after a successful creation so the list reloads. */
        oncreated: () => void;
        /** the refresh action beside the submit button. */
        onrefresh: () => void;
};

/** the spec fields of one creation request (model from the reviewed catalog). */
function catalogs() {
        const cpumodels =
                Array.isArray(cpudata) && cpudata.length > 0 ? cpudata.map((cpu) => cpu.model) : fallbackcpus;
        const gpuids =
                Array.isArray(gpudata) && gpudata.length > 0 ? gpudata.map((gpu) => gpu.id) : fallbackgpus;
        return { cpumodels, gpuids };
}

export default function CreateSandboxForm({ mode, oncreated, onrefresh }: CreateSandboxFormProps) {
        const { cpumodels, gpuids } = catalogs();
        const [model, setmodel] = useState(cpumodels[0] ?? fallbackcpus[0]);
        const [vcpus, setvcpus] = useState(8);
        const [ramgb, setramgb] = useState(32);
        const [gpu, setgpu] = useState(gpuids[0] ?? fallbackgpus[0]);
        const [mig, setmig] = useState('off');
        const [busy, setbusy] = useState(false);
        const [error, seterror] = useState('');

        async function submit(event: React.FormEvent<HTMLFormElement>) {
                event.preventDefault();
                seterror('');
                const spec = { model, vcpus: Number(vcpus) || 8, ramgb: Number(ramgb) || 32, gpu, mig };
                if (mode === 'local') {
                        /* the browser-pure engine port drives the shelf: the same
                         * createSandboxState the console runs, no server involved.
                         * the record is a stored spec — nothing executes here —
                         * so the honest state chip reads 'created', never
                         * 'running'. */
                        const state = createSandboxState(spec);
                        const list = readlocalsandboxes();
                        list.unshift({
                                id: state.id,
                                spec: {
                                        model: state.model,
                                        vcpus: state.vcpus,
                                        ramgb: state.ramgb,
                                        gpu: state.gpu,
                                        mig: state.mig,
                                },
                                createdat: new Date().toISOString(),
                                state: 'created',
                        });
                        writelocalsandboxes(list);
                        oncreated();
                        return;
                }
                setbusy(true);
                try {
                        const result = await apiresult('/api/v1/sandboxes', {
                                method: 'POST',
                                body: JSON.stringify(spec),
                        });
                        if (result.ok) {
                                oncreated();
                        } else {
                                seterror(
                                        errormessage(
                                                result,
                                                labelfill('dashboard.create.failedStatus', { status: String(result.status) }),
                                        ),
                                );
                        }
                } catch {
                        seterror(label('dashboard.create.unreachable'));
                }
                setbusy(false);
        }

        return (
                <form noValidate aria-label={label('dashboard.create.formAria')} onSubmit={submit}>
                        <div className="dash-formrow">
                                <div className="dash-field">
                                        <label htmlFor="newmodel">{label('dashboard.create.cpuLabel')}</label>
                                        <select
                                                id="newmodel"
                                                aria-label={label('dashboard.create.cpuAria')}
                                                value={model}
                                                onChange={(event) => setmodel(event.target.value)}
                                        >
                                                {cpumodels.map((entry) => (
                                                        <option key={entry} value={entry}>
                                                                {entry}
                                                        </option>
                                                ))}
                                        </select>
                                </div>
                                <div className="dash-field">
                                        <label htmlFor="newvcpus">{label('dashboard.create.vcpusLabel')}</label>
                                        <input
                                                type="number"
                                                id="newvcpus"
                                                min={1}
                                                max={192}
                                                value={vcpus}
                                                aria-label={label('dashboard.create.vcpusAria')}
                                                onChange={(event) => setvcpus(Number(event.target.value))}
                                        />
                                </div>
                                <div className="dash-field">
                                        <label htmlFor="newram">{label('dashboard.create.ramLabel')}</label>
                                        <input
                                                type="number"
                                                id="newram"
                                                min={1}
                                                max={1024}
                                                value={ramgb}
                                                aria-label={label('dashboard.create.ramAria')}
                                                onChange={(event) => setramgb(Number(event.target.value))}
                                        />
                                </div>
                                <div className="dash-field">
                                        <label htmlFor="newgpu">{label('dashboard.create.gpuLabel')}</label>
                                        <select
                                                id="newgpu"
                                                aria-label={label('dashboard.create.gpuAria')}
                                                value={gpu}
                                                onChange={(event) => setgpu(event.target.value)}
                                        >
                                                {gpuids.map((entry) => (
                                                        <option key={entry} value={entry}>
                                                                {entry}
                                                        </option>
                                                ))}
                                        </select>
                                </div>
                                <div className="dash-field">
                                        <label htmlFor="newmig">{label('dashboard.create.migLabel')}</label>
                                        <select
                                                id="newmig"
                                                aria-label={label('dashboard.create.migAria')}
                                                value={mig}
                                                onChange={(event) => setmig(event.target.value)}
                                        >
                                                <option value="off">off</option>
                                                <option value="1g.24gb">1g.24gb</option>
                                                <option value="2g.48gb">2g.48gb</option>
                                                <option value="4g.96gb">4g.96gb</option>
                                        </select>
                                </div>
                        </div>
                        {error !== '' && (
                                <p className="dash-panelerror" role="alert">
                                        {error}
                                </p>
                        )}
                        <div className="dash-actions">
                                <button
                                        type="submit"
                                        className="primary"
                                        disabled={busy}
                                        aria-busy={busy ? 'true' : undefined}
                                        aria-label={label('dashboard.create.submitAria')}
                                >
                                        {label('dashboard.create.submit')}
                                </button>
                                <button
                                        type="button"
                                        className="button"
                                        aria-label={label('dashboard.create.refreshAria')}
                                        onClick={onrefresh}
                                >
                                        {label('dashboard.create.refresh')}
                                </button>
                        </div>
                </form>
        );
}
