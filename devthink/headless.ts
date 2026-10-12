/* ── The headless entry section the family kept before the 1.1.88 merge. ── */
/** The headless library entry of the 1.1.80 family: the library runtime without a browser extension, so a host opens the run handle over a plan, a state source and a policy and drives the read only replay against recorded page state fixtures; the 1.1.81 library modes stamp the entry so it reports the bundle it runs from. */
export { bundlestamp } from "./runtime.js";
import { stampbundle } from "./runtime.js";

stampbundle("headless", "headless.js");

/* ── Merged from headlesslib.ts: the 1.1.88 consolidation interns the correlated headlesslib logic here, so no variation of the same file lives beside another. ── */
import type {
  consentprovider,
  flowrungate,
  flowrunrequest,
  headlessevent,
  headlessfixture,
  headlessfixtureoutcome,
  headlesssession,
  immutablelogentry,
  jsonrpcframe,
  libraryrunhandle,
  planfile,
  planfilestep,
  planprogress,
  stepoutcome,
  storedrunlog,
  toolstep,
} from "./types.js";
import type { memoryadapter } from "./memory.js";
import { protocolversion } from "./types.js";
import { actionrisk, fixtureconsentgate, headlessconsentgate, headlesstelemetrygate, validatestep } from "./policy.js";
import { recordoutcome, recordstep } from "./progress.js";
import { readverifiedlog } from "./security.js";
import { randomid, sessionmemory } from "./memory.js";

/** Executes one read only step against one recorded page state fixture: the fixture consent gate grades the kind against the fixture grants, the read only vocabulary with a recorded projection executes against the observation, and every other kind reports unsupported with the reason a fixture cannot satisfy it. */
export function headlessfixturestep(fixture: headlessfixture, step: planfilestep): headlessfixtureoutcome {
  const gate = fixtureconsentgate({
    fixtureorigin: fixture.origin,
    grants: fixture.grants,
    kind: step.kind,
    riskof: (kind) => {
      try {
        return actionrisk(kind as never);
      } catch {
        return "sensitive" as const;
      }
    },
  });
  if (!gate.allowed) {
    const unsupported = (gate.reason ?? "").includes("not a reviewed action kind");
    return {
      stepid: step.id,
      kind: step.kind,
      state: unsupported ? "unsupported" : "refused",
      summary: gate.reason ?? "The fixture refused the step.",
    };
  }
  const observation = fixture.observation;
  const projections: Record<string, () => { summary: string; details?: Record<string, unknown> }> = {
    observe: () => ({
      summary: `The recorded page ${observation.title} of ${observation.url} carries ${observation.textlength} text characters and ${observation.interactive.length} interactive elements.`,
      details: {
        url: observation.url,
        title: observation.title,
        textlength: observation.textlength,
        interactive: observation.interactive.length,
      },
    }),
    readtext: () => ({
      summary: `The recorded page text reads ${observation.textpreview.length} preview characters of the ${observation.textlength} character body.`,
      details: { textpreview: observation.textpreview, textlength: observation.textlength },
    }),
    readforms: () => ({
      summary: `The recorded page carries ${observation.forms.length} form control${observation.forms.length === 1 ? "" : "s"}.`,
      details: { forms: observation.forms },
    }),
    inspect: () => ({
      summary: `The recorded page carries ${observation.interactive.length} interactive element${observation.interactive.length === 1 ? "" : "s"} with their selectors and roles.`,
      details: { interactive: observation.interactive },
    }),
    a11ytree: () => ({
      summary: `The recorded page accessibility view lists ${observation.interactive.length} interactive element${observation.interactive.length === 1 ? "" : "s"}.`,
      details: { interactive: observation.interactive },
    }),
    countelements: () => ({
      summary: `The recorded page counts ${observation.interactive.length} interactive element${observation.interactive.length === 1 ? "" : "s"}${step.target !== undefined ? ` for the selector ${step.target}` : ""}.`,
      details: { count: observation.interactive.length },
    }),
  };
  const projection = projections[step.kind];
  if (projection === undefined)
    return {
      stepid: step.id,
      kind: step.kind,
      state: "unsupported",
      summary: `The kind ${step.kind} is read only but a recorded page state carries no projection for it; the fixture cannot satisfy the step without a live tab.`,
    };
  const projected = projection();
  return {
    stepid: step.id,
    kind: step.kind,
    state: "done",
    summary: projected.summary,
    ...(projected.details !== undefined ? { details: projected.details } : {}),
  };
}

/** Records the headless outcomes through the same progress model the live runs record: every step records its step mark and its outcome, so a headless replay renders on the progress surfaces a live run renders on. */
export function headlessprogress(input: {
  progress: planprogress | undefined;
  planid: string;
  step: planfilestep;
  outcome: headlessfixtureoutcome;
  now: number;
}): planprogress {
  let progress = recordstep(input.progress, input.planid, input.step.id, input.now);
  const recorded: stepoutcome = {
    stepid: input.step.id,
    ok: input.outcome.state === "done",
    summary: input.outcome.summary,
    ...(input.outcome.details !== undefined ? { details: input.outcome.details } : {}),
    at: input.now,
  };
  progress = recordoutcome(progress, input.planid, recorded, input.now);
  return progress;
}

/**
 * Headless library logic of the 1.1.67 family.
 * The library drives a remote browser with no chrome surface: a headless session opens on one origin behind the same consent gates, every gate wait routes to the consent provider the host implements (a terminal prompt in the cli, a callback anywhere else), denydefault refuses whatever no provider resolves, the remote session attaches through the same json rpc protocol the extension speaks, and the plan, run, session and memory entry points expose the whole engine to hosts.
 * The audit reader verifies the chain it reads, the policy engine validates for external callers and the typed run subscription emits every step, gate and run event — with telemetry off by default and forever unless the host opts in.
 */

/** Opens one headless session: the origin it addresses, the consent provider that resolves its gates and the telemetry marker that stays off by default. */
export function openheadlesssession(input: {
  origin: string;
  provider?: consentprovider;
  now: number;
  hostoptin?: boolean;
}): headlesssession {
  if (input.origin.trim() === "" || !input.origin.startsWith("https://"))
    throw new Error("The headless session needs the HTTPS origin it addresses.");
  const telemetrygate = headlesstelemetrygate({
    telemetry: input.hostoptin === true,
    hostoptin: input.hostoptin === true,
  });
  if (!telemetrygate.allowed)
    throw new Error(telemetrygate.reason ?? "The library bundle carries no telemetry by default.");
  return {
    id: `headless:${randomid()}`,
    origin: input.origin,
    state: "active",
    openedat: input.now,
    gatesresolved: 0,
    telemetry: input.hostoptin === true,
  };
}

/** Resolves one gate wait through the consent provider: an attached provider resolves the gate with its own human, an absent provider refuses under denydefault, and every resolution counts on the session. */
export async function headlessgatewait(input: {
  session: headlesssession;
  gate: flowrungate;
  provider?: consentprovider;
}): Promise<{ session: headlesssession; resolution: "approve" | "refuse"; reason: string }> {
  if (input.session.state !== "active")
    throw new Error("The headless session closed; a closed session resolves no gate.");
  const resolution = input.provider !== undefined ? await input.provider.resolvegate(input.gate) : undefined;
  const gate = headlessconsentgate({
    providerpresent: input.provider !== undefined,
    ...(resolution !== undefined ? { resolution } : {}),
  });
  if (input.provider !== undefined && resolution === "approve")
    return {
      session: { ...input.session, gatesresolved: input.session.gatesresolved + 1 },
      resolution: "approve",
      reason: gate.reason ?? "The consent provider approved the gate.",
    };
  return { session: input.session, resolution: "refuse", reason: gate.reason ?? "The gate refused under denydefault." };
}

/** Closes one headless session: a closed session resolves no further gate and drives no further step. */
export function closeheadlesssession(session: headlesssession): headlesssession {
  return { ...session, state: "closed" };
}

/** Builds the initialize frame of one remote session attach: the same json rpc protocol the extension speaks carries the protocol version, the runtime and the origin the session drives. */
export function remoteattachframes(input: { id: number | string; session: headlesssession; runtime: string }): {
  initialize: jsonrpcframe;
  ready: jsonrpcframe;
} {
  return {
    initialize: {
      jsonrpc: "2.0",
      id: input.id,
      method: "initialize",
      params: { protocolversion, runtime: input.runtime, origin: input.session.origin },
    },
    ready: { jsonrpc: "2.0", id: input.id, result: { attached: true, origin: input.session.origin, protocolversion } },
  };
}

/** Validates one step of an external caller with the same policy engine the extension runs: the validation refuses what the extension refuses, with no browser attached. */
export function headlesspolicyvalidate(step: toolstep, origin: string): { allowed: boolean; reason?: string } {
  return validatestep(step, origin);
}

/** Reads the audit chain of one stored run log with its verification: the reader returns the verified entries or the reason the chain broke, exactly the way the extension reads its own audit. */
export async function headlessauditread(
  log: storedrunlog,
): Promise<{ ok: boolean; entries: immutablelogentry[]; reason: string }> {
  return readverifiedlog(log);
}

/** Opens the memory entry point over one adapter: the headless host drives the same sessionmemory the extension drives, so the profile store format and the lock protocol stay one. */
export function headlessmemory(adapter: memoryadapter): sessionmemory {
  return new sessionmemory(adapter);
}

/** Builds the plan entry point of one plan file: the workflow proposal the headless run executes, validated the same way the extension validates it. */
export function headlessplan(
  file: planfile,
  grants: string[],
): { version: string; workflow: { name: string; origins: string[]; steps: Array<Record<string, unknown>> } } {
  if (file.origin.trim() === "" || !file.origin.startsWith("https://"))
    throw new Error("The headless plan needs the HTTPS origin it addresses.");
  if (!grants.includes(file.origin))
    throw new Error(
      `The headless plan origin ${file.origin} stays outside the grants; a run without a granted origin never starts.`,
    );
  return {
    version: protocolversion,
    workflow: {
      name: `headless ${file.goal}`.trim().slice(0, 80),
      origins: [file.origin],
      steps: file.steps.map((step) => ({
        id: step.id,
        kind: step.kind,
        label: step.label,
        ...(step.target !== undefined ? { target: step.target } : {}),
        ...(step.value !== undefined ? { value: step.value } : {}),
      })),
    },
  };
}

/** Reads the run entry point descriptor of one headless run: the request, the plan file and the provider the host attached, so the flowrun pipeline runs headless without any chrome surface. */
export function headlessrun(input: { request: flowrunrequest; file: planfile; provider?: consentprovider }): {
  request: flowrunrequest;
  file: planfile;
  provider?: consentprovider;
} {
  return {
    request: input.request,
    file: input.file,
    ...(input.provider !== undefined ? { provider: input.provider } : {}),
  };
}

/** Reads the session entry point view of one headless session for the host surfaces: the identity, origin, state and the gates it resolved. */
export function headlesssessionview(session: headlesssession): {
  id: string;
  origin: string;
  state: string;
  gatesresolved: number;
  telemetry: boolean;
} {
  return {
    id: session.id,
    origin: session.origin,
    state: session.state,
    gatesresolved: session.gatesresolved,
    telemetry: session.telemetry,
  };
}

/** Creates one typed run subscription: the host handler receives every step, gate and run event, and the subscription keeps its own event list for replay. */
export function headlesssubscribe(handler: (event: headlessevent) => void): {
  emit(event: headlessevent): void;
  events(): headlessevent[];
} {
  const events: headlessevent[] = [];
  return {
    emit(event: headlessevent): void {
      events.push(event);
      handler(event);
    },
    events(): headlessevent[] {
      return [...events];
    },
  };
}

/** Reads the telemetry posture of the library: off by default, on only under the host opt in, so a bundle that reports by default refuses. */
export function headlesstelemetryposture(hostoptin: boolean): { telemetry: boolean; reason: string } {
  const gate = headlesstelemetrygate({ telemetry: hostoptin, hostoptin });
  return { telemetry: hostoptin, reason: gate.reason ?? "Telemetry stays off by default." };
}

/** The library entry point of the 1.1.80 family: one plan, one state source and one policy open a run handle whose progress records through the same progress model the live runs use, with the pause and cancel controls the extension surface offers — the state source resolves the recorded fixture of an origin and the policy narrows the fixture grants to the grants the host attached. */
export function openlibraryrun(input: {
  plan: planfile;
  statesource: (origin: string) => headlessfixture | undefined;
  policy?: { grants?: string[] };
  now: number;
}): {
  handle(): libraryrunhandle;
  step(step: planfilestep, now: number): headlessfixtureoutcome;
  pause(now: number): void;
  resume(now: number): void;
  cancel(reason: string, now: number): void;
} {
  const fixture = input.statesource(input.plan.origin);
  if (fixture === undefined)
    throw new Error(
      `The state source carries no recorded state for the origin ${input.plan.origin}; the library run needs its state before it opens.`,
    );
  let progress: planprogress | undefined;
  let paused = false;
  let cancelled = false;
  let reason: string | undefined;
  const handle = (): libraryrunhandle => ({
    runid: `library:${input.plan.origin}:${input.now}`,
    progress: progress ?? { planid: input.plan.origin, completedsteps: [], updatedat: input.now },
    paused,
    cancelled,
    ...(reason !== undefined ? { reason } : {}),
  });
  const state = {
    handle,
    step(step: planfilestep, now: number): headlessfixtureoutcome {
      if (cancelled)
        return {
          stepid: step.id,
          kind: step.kind,
          state: "refused",
          summary: reason ?? "The library run cancelled before the step.",
        };
      if (paused)
        return {
          stepid: step.id,
          kind: step.kind,
          state: "refused",
          summary:
            "The library run paused at its last checkpoint; a paused handle completes no further step until the resume continues.",
        };
      const scopedgrants =
        input.policy?.grants === undefined
          ? fixture.grants
          : fixture.grants.filter((kind) => input.policy?.grants?.includes(kind));
      const gated = { ...fixture, grants: scopedgrants };
      const outcome = headlessfixturestep(gated, step);
      progress = headlessprogress({ progress, planid: input.plan.origin, step, outcome, now });
      return outcome;
    },
    pause(now: number): void {
      paused = true;
      if (progress !== undefined) progress = { ...progress, updatedat: now };
    },
    resume(now: number): void {
      paused = false;
      if (progress !== undefined) progress = { ...progress, updatedat: now };
    },
    cancel(cancelreason: string, now: number): void {
      cancelled = true;
      reason = cancelreason;
      if (progress !== undefined) progress = { ...progress, updatedat: now };
    },
  };
  return state;
}
