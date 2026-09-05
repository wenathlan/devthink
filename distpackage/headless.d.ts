/** The headless library entry of the 1.1.80 family: the library runtime without a browser extension, so a host opens the run handle over a plan, a state source and a policy and drives the read only replay against recorded page state fixtures; the 1.1.81 library modes stamp the entry so it reports the bundle it runs from. */
export { bundlestamp } from "./runtime.js";
import type { consentprovider, flowrungate, flowrunrequest, headlessevent, headlessfixture, headlessfixtureoutcome, headlesssession, immutablelogentry, jsonrpcframe, libraryrunhandle, planfile, planfilestep, planprogress, storedrunlog, toolstep } from "./types.js";
import type { memoryadapter } from "./memory.js";
import { sessionmemory } from "./memory.js";
/** Executes one read only step against one recorded page state fixture: the fixture consent gate grades the kind against the fixture grants, the read only vocabulary with a recorded projection executes against the observation, and every other kind reports unsupported with the reason a fixture cannot satisfy it. */
export declare function headlessfixturestep(fixture: headlessfixture, step: planfilestep): headlessfixtureoutcome;
/** Records the headless outcomes through the same progress model the live runs record: every step records its step mark and its outcome, so a headless replay renders on the progress surfaces a live run renders on. */
export declare function headlessprogress(input: {
    progress: planprogress | undefined;
    planid: string;
    step: planfilestep;
    outcome: headlessfixtureoutcome;
    now: number;
}): planprogress;
/**
 * Headless library logic of the 1.1.67 family.
 * The library drives a remote browser with no chrome surface: a headless session opens on one origin behind the same consent gates, every gate wait routes to the consent provider the host implements (a terminal prompt in the cli, a callback anywhere else), denydefault refuses whatever no provider resolves, the remote session attaches through the same json rpc protocol the extension speaks, and the plan, run, session and memory entry points expose the whole engine to hosts.
 * The audit reader verifies the chain it reads, the policy engine validates for external callers and the typed run subscription emits every step, gate and run event — with telemetry off by default and forever unless the host opts in.
 */
/** Opens one headless session: the origin it addresses, the consent provider that resolves its gates and the telemetry marker that stays off by default. */
export declare function openheadlesssession(input: {
    origin: string;
    provider?: consentprovider;
    now: number;
    hostoptin?: boolean;
}): headlesssession;
/** Resolves one gate wait through the consent provider: an attached provider resolves the gate with its own human, an absent provider refuses under denydefault, and every resolution counts on the session. */
export declare function headlessgatewait(input: {
    session: headlesssession;
    gate: flowrungate;
    provider?: consentprovider;
}): Promise<{
    session: headlesssession;
    resolution: "approve" | "refuse";
    reason: string;
}>;
/** Closes one headless session: a closed session resolves no further gate and drives no further step. */
export declare function closeheadlesssession(session: headlesssession): headlesssession;
/** Builds the initialize frame of one remote session attach: the same json rpc protocol the extension speaks carries the protocol version, the runtime and the origin the session drives. */
export declare function remoteattachframes(input: {
    id: number | string;
    session: headlesssession;
    runtime: string;
}): {
    initialize: jsonrpcframe;
    ready: jsonrpcframe;
};
/** Validates one step of an external caller with the same policy engine the extension runs: the validation refuses what the extension refuses, with no browser attached. */
export declare function headlesspolicyvalidate(step: toolstep, origin: string): {
    allowed: boolean;
    reason?: string;
};
/** Reads the audit chain of one stored run log with its verification: the reader returns the verified entries or the reason the chain broke, exactly the way the extension reads its own audit. */
export declare function headlessauditread(log: storedrunlog): Promise<{
    ok: boolean;
    entries: immutablelogentry[];
    reason: string;
}>;
/** Opens the memory entry point over one adapter: the headless host drives the same sessionmemory the extension drives, so the profile store format and the lock protocol stay one. */
export declare function headlessmemory(adapter: memoryadapter): sessionmemory;
/** Builds the plan entry point of one plan file: the workflow proposal the headless run executes, validated the same way the extension validates it. */
export declare function headlessplan(file: planfile, grants: string[]): {
    version: string;
    workflow: {
        name: string;
        origins: string[];
        steps: Array<Record<string, unknown>>;
    };
};
/** Reads the run entry point descriptor of one headless run: the request, the plan file and the provider the host attached, so the flowrun pipeline runs headless without any chrome surface. */
export declare function headlessrun(input: {
    request: flowrunrequest;
    file: planfile;
    provider?: consentprovider;
}): {
    request: flowrunrequest;
    file: planfile;
    provider?: consentprovider;
};
/** Reads the session entry point view of one headless session for the host surfaces: the identity, origin, state and the gates it resolved. */
export declare function headlesssessionview(session: headlesssession): {
    id: string;
    origin: string;
    state: string;
    gatesresolved: number;
    telemetry: boolean;
};
/** Creates one typed run subscription: the host handler receives every step, gate and run event, and the subscription keeps its own event list for replay. */
export declare function headlesssubscribe(handler: (event: headlessevent) => void): {
    emit(event: headlessevent): void;
    events(): headlessevent[];
};
/** Reads the telemetry posture of the library: off by default, on only under the host opt in, so a bundle that reports by default refuses. */
export declare function headlesstelemetryposture(hostoptin: boolean): {
    telemetry: boolean;
    reason: string;
};
/** The library entry point of the 1.1.80 family: one plan, one state source and one policy open a run handle whose progress records through the same progress model the live runs use, with the pause and cancel controls the extension surface offers — the state source resolves the recorded fixture of an origin and the policy narrows the fixture grants to the grants the host attached. */
export declare function openlibraryrun(input: {
    plan: planfile;
    statesource: (origin: string) => headlessfixture | undefined;
    policy?: {
        grants?: string[];
    };
    now: number;
}): {
    handle(): libraryrunhandle;
    step(step: planfilestep, now: number): headlessfixtureoutcome;
    pause(now: number): void;
    resume(now: number): void;
    cancel(reason: string, now: number): void;
};
//# sourceMappingURL=headless.d.ts.map