/** Executes the soak run gate of the 2.0.0 roadmap item 51 ("a soak run keeps a long workflow alive across the full retention window without drift") against the real compiled modules: the gate composes one long workflow of three loop passes over the rows of a fixture pricing table — a repeated extraction — and drives it through the runworkflow engine in the fake clock mode so every stamp the engine makes rides the fixed epoch, with one keepalive heartbeat, one audit event, one hash chained log entry and one provenance carrying memory item per iteration. The run spans the audit retention window read back from the library settings three times over, checkpoints mid-run, simulates the service worker restart that reattaches the keepalive port, resumes from the checkpoint and proves the no drift contract four ways: the resumed outcome stays byte identical to the uninterrupted outcome, two full soak runs seal the identical audit hash, the whole immutable log chain verifies from the genesis hash to the seal, and the memory items keep their provenance while the retention window bounds the stored counts. The fake tab provider hands out fake tabs of every browser kind so the liveness sweep proves the zombie reaper never takes a beating run on chromium, firefox or safari while a silent run still reaps. The artifact tests/artifacts/soak.json records every executed check with its outcome in a fixed order with no timestamps so reruns stay byte identical, and the gate exits nonzero on any failed check. The retention window semantics and the invocation walkthrough live in docs/soak.md. */
import { mkdir, writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const artifactpath = "tests/artifacts/soak.json";

/** Collects one executed soak check with its outcome; the detail names the functions the check exercised and what they answered. */
const executed = [];

/** Runs one soak check body and records the outcome deterministically. */
async function entry(spec, body) {
  try {
    const detail = await body();
    executed.push({
      id: spec.id,
      title: spec.title,
      family: spec.family,
      module: spec.module,
      outcome: "pass",
      detail: detail ?? "",
    });
  } catch (error) {
    executed.push({
      id: spec.id,
      title: spec.title,
      family: spec.family,
      module: spec.module,
      outcome: "fail",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Asserts one condition with the message the failure reports. */
function check(condition, message) {
  if (!condition) throw new Error(message);
}

/** The fake clock mode of the soak run: the clock starts at one fixed epoch and every executed step advances exactly one heartbeat interval, so every startedat, at, endedat and duration the engine stamps rides the fake clock and the whole long run replays byte identical; the wall clock is patched for the suite duration and restored at the end. */
const epoch = 1_800_000_000_000;
const steptick = 1_000;
let clocknow = epoch;
const realdatenow = Date.now;
Date.now = () => clocknow;
function resetclock() {
  clocknow = epoch;
}
function tick() {
  clocknow += steptick;
}

/** The fake tab provider of the soak run: one deterministic tab id per browser kind and per slot, so the liveness sweep binds runs the same way on chromium, firefox and safari — the fake tab covers every browser kind the extension ships. */
const faketabprovider = {
  kinds: ["chromium", "firefox", "safari"],
  tabof(browser, slot) {
    const base = { chromium: 100, firefox: 200, safari: 300 }[browser] ?? 0;
    return base + slot;
  },
};

/** The in-memory adapter seam the memory store accepts, so the soak records persist through the real sessionmemory of the compiled memory module. */
class fakeadapter {
  constructor() {
    this.data = new Map();
  }
  async get(key) {
    return this.data.get(key);
  }
  async set(key, value) {
    this.data.set(key, value);
  }
}

/** The fixture page of the soak run: one pricing table of deterministic rows the repeated extraction reads, three passes of eight rows each so the run spans the audit retention window of eight events three times over. */
const fixtureorigin = "https://example.com";
const fixturepage = "https://example.com/pricing";
const retentionwindow = 8;
const passes = 3;
const rowsperpass = retentionwindow;
const totalrows = passes * rowsperpass;
const expirywindowms = retentionwindow * steptick;

/** Reads the row id of one zero padded row index. */
function rowof(index) {
  return `row-${String(index + 1).padStart(2, "0")}`;
}

/** Reads the deterministic cell count the fixture page holds for one row id. */
function cellsof(rowid) {
  return Number(rowid.slice(4));
}

/** Builds one loop pass step of the soak workflow: the reviewed payload loops the named list variable over its rows with its safety bound and reads one pricing row per iteration. */
function passstep(library, id, list) {
  const parsed = library.workflowstepof({
    id,
    kind: "loop",
    label: `The ${id} pass over the pricing table`,
    options: JSON.stringify({
      loop: {
        list,
        item: "row",
        index: "rowindex",
        bound: rowsperpass,
        steps: [
          {
            id: "readrow",
            kind: "readtext",
            label: "Read the pricing row",
            target: `tr[data-row="\${row}"]`,
            value: "The pricing row \${row} holds 7 cells at 9 usd.",
            extract: {
              pattern: "row (?<rowid>row-\\d\\d) holds (?<cells>\\d+) cells",
              flags: "",
              groups: ["rowid", "cells"],
            },
          },
        ],
      },
    }),
  });
  if (parsed === undefined) throw new Error(`The ${id} pass of the soak workflow did not normalize.`);
  return parsed;
}

/** Builds one count expression step of the soak workflow: the reviewed expression sums the last loop index into the pass count. */
function countstep(library, id, result, leftref) {
  const parsed = library.workflowstepof({
    id,
    kind: "compute",
    label: `Count the rows of the pass`,
    expression: { left: { ref: leftref }, right: { literal: 1 }, operator: "add", result, resultkind: "number" },
  });
  if (parsed === undefined) throw new Error(`The ${id} count step of the soak workflow did not normalize.`);
  return parsed;
}

/** Composes the long soak workflow: three loop passes over the fixture pricing table with a count expression after each pass and the two summing expressions that total every row, frozen by the real composeworkflow against the frozen kind catalog. */
function soakworkflow(library, policy) {
  const catalog = policy.actionkindcatalog();
  const kindallowed = (kind) => catalog.includes(kind);
  const riskof = (kind) => policy.actionrisk(kind);
  return library.composeworkflow({
    id: "wf-soak",
    name: "soak pricing sweep",
    version: 1,
    origins: [fixtureorigin],
    steps: [
      passstep(library, "passone", "passonerows"),
      countstep(library, "countone", "passonecount", "rowindex"),
      passstep(library, "passtwo", "passtworows"),
      countstep(library, "counttwo", "passtwocount", "rowindex"),
      passstep(library, "passthree", "passthreerows"),
      countstep(library, "countthree", "passthreecount", "rowindex"),
      {
        id: "subtotal",
        kind: "compute",
        label: "Sum the first two passes",
        expression: {
          left: { ref: "passonecount" },
          right: { ref: "passtwocount" },
          operator: "add",
          result: "subtotal",
          resultkind: "number",
        },
      },
      {
        id: "totalrows",
        kind: "compute",
        label: "Sum every pass",
        expression: {
          left: { ref: "subtotal" },
          right: { ref: "passthreecount" },
          operator: "add",
          result: "totalrows",
          resultkind: "number",
        },
      },
    ],
    now: epoch,
    kindallowed,
    riskof,
  });
}

/** Builds the root scope of the soak workflow: the three list variables of the three passes, one row per retention window slot. */
function soakscopes(library) {
  return [
    {
      name: "root",
      variables: [0, 1, 2].map((pass) => ({
        name: `${["passone", "passtwo", "passthree"][pass]}rows`,
        kind: "list",
        value: Array.from({ length: rowsperpass }, (_, index) => rowof(pass * rowsperpass + index)),
        setat: epoch,
      })),
    },
  ];
}

/** The executor seam of the soak run: every dispatched step advances the fake clock one heartbeat interval, emits one keepalive heartbeat and one runrecord heartbeat; every readtext step models the repeated extraction against the fixture page — the audit event, the hash chained log entry and the provenance carrying memory item of one pricing row. */
function soakexecutor(library, memorymodule, context) {
  return async (step) => {
    tick();
    context.dispatched.push(step.id);
    context.heartbeat = library.runheartbeat({ runid: "soakrun", beat: context.heartbeat?.beat, now: clocknow });
    context.state = library.beatrun(context.state, clocknow);
    if (step.kind === "readtext") {
      context.rowcounter += 1;
      const rowid = /row-(\d\d)/.exec(step.target ?? "")?.[1] ?? "row-00";
      await context.store.addaudi({
        id: `soak-audit-${context.rowcounter}`,
        kind: "scrape",
        at: clocknow,
        summary: `The pricing row ${rowid} read its ${cellsof(rowid)} cells from the fixture page.`,
        stepid: "readrow",
      });
      context.log = await library.appendlogentry({
        log: context.log,
        id: `soak-entry-${context.rowcounter}`,
        kind: "step",
        summary: `The pricing row ${rowid} of the fixture page read ${cellsof(rowid)} cells at 9 usd.`,
        origin: fixtureorigin,
        stepid: "readrow",
        at: clocknow,
      });
      await context.store.setmemoryitem(
        library.memoryitemof({
          key: `pricingrow-${rowid}`,
          value: { cells: cellsof(rowid), price: 9 },
          provenance: library.provenanceof({
            origin: fixtureorigin,
            runid: "soakrun",
            stepid: "readrow",
            now: clocknow,
          }),
        }),
      );
    }
    return {
      ok: true,
      summary:
        step.kind === "readtext"
          ? "The pricing row read its cells from the fixture page."
          : `The ${step.id} step computed its rows.`,
    };
  };
}

/** Opens the soak run state and store: the keepalive port opens at the epoch with the one second heartbeat interval and the memory store carries the audit retention window of the run. */
async function opensoakrun(library, memorymodule) {
  resetclock();
  const store = new memorymodule.sessionmemory(new fakeadapter());
  await store.setsettings({ auditretention: retentionwindow });
  const context = {
    store,
    log: library.openrunlog({ runid: "soakrun", sessionid: "soak-session", now: clocknow }),
    state: library.openrun({
      runid: "soakrun",
      sessionid: "soak-session",
      planid: "soak-plan",
      profileid: "soak-profile",
      interval: steptick,
      now: clocknow,
    }),
    heartbeat: undefined,
    dispatched: [],
    rowcounter: 0,
  };
  return context;
}

/** Runs the full uninterrupted soak workflow from the fixed epoch and answers the complete outcome bundle: the workflow result, the sealed immutable log, the store, the run state and the executor context. */
async function runsoakfull(library, policy, memorymodule) {
  const record = soakworkflow(library, policy);
  const context = await opensoakrun(library, memorymodule);
  const result = await library.runworkflow({
    record,
    run: library.newworkflowrun({ id: "soakrun", workflowid: record.id, now: clocknow }),
    scopes: soakscopes(library),
    execute: library.controlexecutor(soakexecutor(library, memorymodule, context)),
    now: clocknow,
    gates: { sessionactive: true, planapproved: true, origingranted: (origin) => origin === fixtureorigin },
  });
  const sealed = await library.sealrunlog(context.log, clocknow);
  return { record, result, sealed, context };
}

/** Runs the soak workflow in two segments with the checkpoint mid-run and the simulated service worker restart between them, then answers the resumed outcome: the segment result, the paused resume, the run record checkpoint and the reattached run state. */
async function runsoaksegmented(library, policy, memorymodule) {
  const record = soakworkflow(library, policy);
  const context = await opensoakrun(library, memorymodule);
  const run = library.newworkflowrun({ id: "soakrun", workflowid: record.id, now: clocknow });
  const boundary = 4;
  const segmentrecord = { ...record, steps: record.steps.slice(0, boundary) };
  const partial = await library.runworkflow({
    record: segmentrecord,
    run,
    scopes: soakscopes(library),
    execute: library.controlexecutor(soakexecutor(library, memorymodule, context)),
    now: clocknow,
    gates: { sessionactive: true, planapproved: true, origingranted: (origin) => origin === fixtureorigin },
  });
  /* the service worker restart at the checkpoint: the pending step marks, the persisted state rehydrates through the keepalive reattach and the recovery plan names the single step the executor resumes. */
  context.state = library.markpending(context.state, record.steps[boundary]?.id, clocknow);
  context.state = library.reattachrun(context.state, clocknow);
  const recovery = library.recoveryplan(context.state);
  const paused = { ...run, state: "paused", cursor: boundary, pausedat: clocknow };
  const resumed = await library.runworkflow({
    record,
    run: paused,
    log: partial.log,
    outputs: partial.outputs,
    scopes: partial.scopes,
    execute: library.controlexecutor(soakexecutor(library, memorymodule, context)),
    now: clocknow,
    gates: { sessionactive: true, planapproved: true, origingranted: (origin) => origin === fixtureorigin },
  });
  return { record, partial, resumed, checkpoint: { boundary, recovery } };
}

/** Runs the full soak run verification suite and answers the report the artifact records. */
export async function runsoaksuite() {
  if (!existsSync("dist/index.js") || !existsSync("dist/policy.js") || !existsSync("dist/memory.js")) {
    console.error(
      "SOAK The gate reads the compiled library, policy and memory bundles; run node tests/build.mjs before the soak run.",
    );
    return {
      release,
      checklist: "docs/soak.md",
      entries: [
        {
          id: 1,
          title: "the compiled bundles exist",
          family: "build",
          module: "dist",
          outcome: "fail",
          detail: "the dist bundles are absent",
        },
      ],
      summary: { total: 1, passed: 0, failed: 1 },
    };
  }
  const library = await import("./../dist/index.js");
  const policy = await import("./../dist/policy.js");
  const memorymodule = await import("./../dist/memory.js");

  /* the uninterrupted soak run every liveness, drift and memory check reads. */
  const full = await runsoakfull(library, policy, memorymodule);

  try {
    await entry(
      {
        id: 1,
        title: "the retention window loads from the library settings and bounds the stored counts",
        family: "retention window",
        module: "memory.js and run.js",
      },
      async () => {
        const store = new memorymodule.sessionmemory(new fakeadapter());
        await store.setsettings({ auditretention: retentionwindow });
        const settings = await store.getsettings();
        check(
          settings?.auditretention === retentionwindow,
          `the settings read the audit retention window ${settings?.auditretention} instead of ${retentionwindow}`,
        );
        for (let index = 1; index <= retentionwindow + 2; index += 1)
          await store.addaudi({
            id: `probe-${index}`,
            kind: "workflow",
            at: epoch + index * steptick,
            summary: `The probe event ${index} of the retention window check.`,
          });
        const audit = await store.getaudit();
        check(
          audit.length === retentionwindow,
          `the audit trail kept ${audit.length} events instead of the retention window of ${retentionwindow}`,
        );
        check(
          audit[0]?.id === `probe-${retentionwindow + 2}`,
          `the retention window dropped the newest event: ${audit[0]?.id}`,
        );
        const openstore = new memorymodule.sessionmemory(new fakeadapter());
        await openstore.addaudi({
          id: "probe-open",
          kind: "workflow",
          at: epoch,
          summary: "The probe event of the absent retention window.",
        });
        check((await openstore.getaudit()).length === 1, "the absent retention window kept no event");
        const window = library.heartbeatwindowof(undefined);
        check(
          window === library.roadmapheartbeatwindow && window === 60_000,
          `the absent heartbeat setting answered ${window} instead of the documented roadmap window of 60000`,
        );
        check(
          library.heartbeatwindowof({ heartbeatwindow: 30_000 }) === 30_000,
          "the configured heartbeat window never overrode the documented default",
        );
        return `the audit retention window of ${retentionwindow} events loaded from the real settings store and bounded the probe trail at exactly the newest ${retentionwindow} events while the absent setting kept every event, and the heartbeat window kept the documented roadmap default of 60000 ms unless the user configures it.`;
      },
    );

    await entry(
      {
        id: 2,
        title: "the long workflow composes and validates against the frozen kind catalog",
        family: "composition",
        module: "workflow.js and policy.js",
      },
      async () => {
        const record = full.record;
        check(
          record.steps.length === 2 + passes * 2,
          `the soak workflow carries ${record.steps.length} steps instead of ${2 + passes * 2}`,
        );
        check(
          record.risk === "interaction",
          `the soak workflow graded ${record.risk} instead of the interaction risk of the loop passes`,
        );
        const verdict = library.validateworkflow(record, {
          kindallowed: (kind) => policy.actionkindcatalog().includes(kind),
          inputs: ["rowindex", "passonecount", "passtwocount", "passthreecount", "subtotal"],
        });
        check(verdict.allowed === true, `the soak workflow failed its validation: ${verdict.reason}`);
        const summary = library.controlsummary(record.steps[0]);
        check(
          summary?.kind === "loop" && summary?.bound === rowsperpass && summary?.list === "passonerows",
          `the first pass carried ${JSON.stringify(summary)} instead of the loop summary with its bound`,
        );
        const catalog = policy.actionkindcatalog();
        for (const step of record.steps) {
          check(
            catalog.includes(step.kind),
            `the step ${step.id} carries the kind ${step.kind} outside the frozen catalog`,
          );
          for (const child of library.controlsteps(step))
            check(
              catalog.includes(child.kind),
              `the child step ${child.id} carries the kind ${child.kind} outside the frozen catalog`,
            );
        }
        return `composeworkflow froze the ${record.steps.length} step soak workflow (three loop passes with their count expressions and the two sums) with every kind inside the frozen catalog of ${catalog.length} kinds, the interaction risk grade of the loop family and the validateworkflow allowance under the declared runtime inputs.`;
      },
    );

    await entry(
      {
        id: 3,
        title: "the soak run stays alive across the full retention window",
        family: "liveness",
        module: "run.js and workflow.js",
      },
      async () => {
        const { result, context } = full;
        check(result.run.state === "done", `the soak run ended ${result.run.state} instead of done`);
        check(
          result.run.cursor === full.record.steps.length,
          `the soak run cursor stopped at ${result.run.cursor} of ${full.record.steps.length} steps`,
        );
        check(
          library.resolvevariable(result.scopes, "totalrows")?.value === totalrows,
          `the total rows variable answered ${library.resolvevariable(result.scopes, "totalrows")?.value} instead of ${totalrows}`,
        );
        check(
          context.dispatched.length === totalrows + 5,
          `the executor dispatched ${context.dispatched.length} steps instead of ${totalrows + 5}`,
        );
        check(
          context.rowcounter === totalrows,
          `the run read ${context.rowcounter} pricing rows instead of ${totalrows}`,
        );
        check(
          context.state.keepalive.state === "active" && context.state.state === "active",
          `the run state ended ${context.state.state} with its keepalive ${context.state.keepalive.state} instead of active`,
        );
        check(
          context.state.keepalive.beats === context.dispatched.length,
          `the keepalive emitted ${context.state.keepalive.beats} beats instead of one per dispatched step`,
        );
        const window = library.heartbeatwindowof(undefined);
        check(
          library.heartbeatisstale({ heartbeat: context.heartbeat, now: clocknow + window - steptick, window }) ===
            false,
          "the last heartbeat already sat stale inside the documented window",
        );
        check(
          library.heartbeatisstale({ heartbeat: context.heartbeat, now: clocknow + window + steptick, window }) ===
            true,
          "the heartbeat never turned stale past the documented window",
        );
        const swept = library.zombiesweep({
          states: [context.state],
          now: clocknow,
          interval: steptick,
          missedlimit: 3,
        });
        check(swept.reaped.length === 0, `the zombie reaper took the live soak run: ${swept.reaped.join(", ")}`);
        const silent = library.openrun({
          runid: "soak-silent",
          sessionid: "soak-session",
          planid: "soak-plan",
          profileid: "soak-profile",
          interval: steptick,
          now: epoch,
        });
        const discriminantnow = clocknow + steptick * 5;
        const discriminant = library.zombiesweep({
          states: [library.beatrun(context.state, discriminantnow), silent],
          now: discriminantnow,
          interval: steptick,
          missedlimit: 3,
        });
        check(
          discriminant.reaped.join(",") === "soak-silent",
          `the zombie reaper answered ${discriminant.reaped.join(", ")} instead of the silent run alone`,
        );
        const frozen = library.closerun(library.beatrun(context.state, clocknow), clocknow);
        check(
          frozen.state === "completed" && frozen.keepalive.state === "stopped" && frozen.keepalive.portopen === false,
          "the completed run never froze its keepalive port",
        );
        return `the ${totalrows} row soak run stayed alive across the ${passes} passes of the retention window: ${context.state.keepalive.beats} keepalive beats with the heartbeat fresh inside the documented 60000 ms window, the zombie sweep never reaped the beating run while the silent twin reaped, and the run closed done at cursor ${result.run.cursor} with the totalrows expression answering ${totalrows}.`;
      },
    );

    await entry(
      {
        id: 4,
        title: "the checkpoint mid-run resumes and completes identically",
        family: "resume",
        module: "run.js and workflow.js",
      },
      async () => {
        const segmented = await runsoaksegmented(library, policy, memorymodule);
        const { record, partial, resumed, checkpoint } = segmented;
        check(
          partial.run.cursor === checkpoint.boundary,
          `the segment stopped at cursor ${partial.run.cursor} instead of the boundary ${checkpoint.boundary}`,
        );
        check(
          checkpoint.recovery.recoverable === true &&
            checkpoint.recovery.pendingstepid === record.steps[checkpoint.boundary]?.id,
          `the recovery plan answered ${JSON.stringify(checkpoint.recovery)} instead of the pending step of the boundary`,
        );
        const digest = library.runcachedigest({ runid: "soakrun", resource: fixturepage });
        const recordcheckpoint = library.makecheckpoint({
          runid: "soakrun",
          stepid: record.steps[checkpoint.boundary - 1]?.id ?? "",
          completed: record.steps.slice(0, checkpoint.boundary).map((step) => step.id),
          digest,
          now: clocknow,
        });
        check(
          library.checkpointisvalid({ checkpoint: recordcheckpoint, runid: "soakrun", digest }) === true,
          "the checkpoint of the boundary never validated against its run and page digest",
        );
        check(
          library.checkpointisvalid({ checkpoint: recordcheckpoint, runid: "soakrun", digest: "0".repeat(64) }) ===
            false,
          "the checkpoint validated against a changed page digest",
        );
        const remaining = library.resumecheckpoint({
          checkpoint: recordcheckpoint,
          steps: record.steps.map((step) => step.id),
        });
        check(
          remaining.join(",") ===
            record.steps
              .slice(checkpoint.boundary)
              .map((step) => step.id)
              .join(","),
          `the resume answered ${remaining.join(", ")} instead of the steps past the checkpoint`,
        );
        check(
          resumed.run.state === "done" && resumed.run.cursor === record.steps.length,
          `the resumed run ended ${resumed.run.state} at cursor ${resumed.run.cursor}`,
        );
        check(
          library.resolvevariable(resumed.scopes, "totalrows")?.value === totalrows,
          "the resumed run never recomputed the total rows",
        );
        const uninterrupted = JSON.stringify({
          run: full.result.run,
          log: full.result.log,
          outputs: full.result.outputs,
        });
        const resumedoutcome = JSON.stringify({ run: resumed.run, log: resumed.log, outputs: resumed.outputs });
        check(
          uninterrupted === resumedoutcome,
          `the resumed outcome drifted from the uninterrupted outcome: the first difference sits at ${firstdifference(uninterrupted, resumedoutcome)}`,
        );
        return `the segment before the boundary ${checkpoint.boundary} completed at its cursor, the service worker restart marked the pending step and reattached the keepalive port with the recovery plan naming it, the run record checkpoint validated against its page digest and refused a changed digest, and the resumed outcome serialized byte identical to the uninterrupted outcome over the run, the ${resumed.log.length} log entries and the ${Object.keys(resumed.outputs).length} step outputs.`;
      },
    );

    await entry(
      { id: 5, title: "the audit trail hash chain verifies end to end", family: "audit trail", module: "security.js" },
      async () => {
        const { sealed } = full;
        check(
          sealed.log.entries.length === totalrows,
          `the immutable log carries ${sealed.log.entries.length} entries instead of the ${totalrows} rows`,
        );
        check(sealed.log.seal !== undefined, "the immutable log never sealed at completion");
        const verification = await library.verifylogchain(sealed.log.entries);
        check(verification.valid === true, `the hash chain broke: ${verification.reason}`);
        const read = await library.readverifiedlog(sealed.log);
        check(
          read.ok === true && read.entries.length === totalrows,
          `the verified read refused the sealed log: ${read.reason}`,
        );
        const exportbundle = await library.exportlogchain(sealed.log);
        check(
          exportbundle.chainvalid === true && exportbundle.entries === totalrows,
          `the chain export refused the sealed log: ${exportbundle.reason}`,
        );
        check(
          exportbundle.sealhash === sealed.seal.sealhash.current,
          "the chain export lost the seal hash of the completion",
        );
        const tampered = JSON.parse(JSON.stringify(sealed.log));
        tampered.entries[3].summary = "The tampered summary never rode the wire.";
        const tamperverification = await library.verifylogchain(tampered.entries);
        check(
          tamperverification.valid === false && tamperverification.brokenat === 3,
          "the tampered entry survived the chain verification",
        );
        let refused = false;
        try {
          await library.appendlogentry({
            log: sealed.log,
            kind: "step",
            summary: "The late append.",
            origin: fixtureorigin,
            at: clocknow,
          });
        } catch {
          refused = true;
        }
        check(refused === true, "the sealed log accepted a late append");
        return `verifylogchain walked the ${totalrows} step entries from the genesis hash to the seal and verified every link, readverifiedlog and exportlogchain returned the whole sealed chain with its seal hash, the tampered fourth entry broke the chain at its index and the sealed log refused the late append because the seal stays terminal.`;
      },
    );

    await entry(
      {
        id: 6,
        title: "repeated soak runs seal the identical audit hash",
        family: "no drift",
        module: "workflow.js and security.js",
      },
      async () => {
        const repeat = await runsoakfull(library, policy, memorymodule);
        check(repeat.result.run.state === "done", "the repeated soak run never completed");
        const first = JSON.stringify({ run: full.result.run, log: full.result.log, outputs: full.result.outputs });
        const second = JSON.stringify({
          run: repeat.result.run,
          log: repeat.result.log,
          outputs: repeat.result.outputs,
        });
        check(
          first === second,
          `the repeated soak run drifted: the first difference sits at ${firstdifference(first, second)}`,
        );
        check(
          full.sealed.seal.sealhash.current === repeat.sealed.seal.sealhash.current,
          "the repeated soak run sealed a different audit hash",
        );
        check(
          library.resolvevariable(repeat.result.scopes, "totalrows")?.value === totalrows,
          "the repeated soak run never recomputed the total rows",
        );
        const firstentries = full.sealed.log.entries;
        const secondentries = repeat.sealed.log.entries;
        for (let index = 0; index < totalrows; index += 1)
          check(
            firstentries[index]?.hash.current === secondentries[index]?.hash.current,
            `the log entry ${index} drifted between the two runs`,
          );
        return `two full soak runs from the same fixed epoch produced byte identical outcomes (the run, the ${totalrows} log entries and the outputs) and sealed the identical audit hash ${full.sealed.seal.sealhash.current.slice(0, 16)} over the same event sequence, so the long run carries no drift.`;
      },
    );

    await entry(
      {
        id: 7,
        title: "the memory items keep their provenance inside the retention bounds",
        family: "memory",
        module: "memory.js",
      },
      async () => {
        const { context } = full;
        const items = await context.store.getmemoryitems();
        check(
          items.length === totalrows,
          `the memory store holds ${items.length} items instead of the ${totalrows} rows`,
        );
        for (const item of items) {
          check(
            item.provenance.origin === fixtureorigin &&
              item.provenance.runid === "soakrun" &&
              item.provenance.stepid === "readrow",
            `the item ${item.key} drifted from the soak provenance: ${JSON.stringify(item.provenance)}`,
          );
        }
        const audit = await context.store.getaudit();
        check(
          audit.length === retentionwindow,
          `the audit trail of the soak run kept ${audit.length} events instead of the retention window of ${retentionwindow}`,
        );
        const plansteps = [
          { id: "readrow", kind: "readtext", summary: "Read the pricing row of the fixture page.", risk: "read" },
        ];
        const summarytext = library.stepsummaryfor(items[items.length - 1] ?? items[0], plansteps);
        check(summarytext.includes("Read the pricing row"), `the step summary answered ${summarytext}`);
        const rules = [{ pattern: "pricingrow-", lifetime: expirywindowms }];
        check(
          library.matchingrule(rules, "pricingrow-row-01")?.lifetime === expirywindowms,
          "the expiry rule never matched the pricing row keys",
        );
        const expired = library.expireditems(items, rules, clocknow);
        check(
          expired.length > 0 && expired.length < items.length,
          `the expiry pass answered ${expired.length} expired items of ${items.length}`,
        );
        const purge = library.purgeitems({ items, rules, confirmed: true, now: clocknow });
        check(
          purge.kept.length <= retentionwindow,
          `the purge kept ${purge.kept.length} items outside the retention window of ${retentionwindow}`,
        );
        check(
          purge.purged.length === expired.length,
          `the purge answered ${purge.purged.length} outcomes instead of the ${expired.length} expired items`,
        );
        for (const outcome of purge.purged) {
          check(
            outcome.provenance.origin === fixtureorigin &&
              outcome.provenance.runid === "soakrun" &&
              outcome.provenance.stepid === "readrow",
            `the purge outcome of ${outcome.key} lost the soak provenance`,
          );
          await context.store.addpurgesummary({
            key: outcome.key,
            summary: outcome.summary,
            provenance: outcome.provenance,
            at: outcome.at,
          });
        }
        await context.store.removememoryitems(purge.purged.map((outcome) => outcome.key));
        const kept = await context.store.getmemoryitems();
        check(
          kept.length === purge.kept.length,
          `the store holds ${kept.length} items after the purge instead of ${purge.kept.length}`,
        );
        const summaries = await context.store.listpurgesummaries();
        check(
          summaries.length === purge.purged.length,
          `the store holds ${summaries.length} purge summaries instead of ${purge.purged.length}`,
        );
        const bundle = library.auditexportof({
          runs: [
            {
              runid: "soakrun",
              planid: "soak-plan",
              sessionid: "soak-session",
              state: "completed",
              createdat: epoch,
              updatedat: clocknow,
            },
          ],
          items: kept,
          rules,
          timeline: [],
          locks: [],
          now: clocknow,
        });
        const chunks = library.exportchunks(bundle, 400);
        const reassembled = JSON.parse(chunks.map((chunk) => chunk.payload).join(""));
        check(
          JSON.stringify(reassembled) === JSON.stringify(bundle),
          "the audit export never round tripped through its chunks",
        );
        return `the ${totalrows} memory items kept the identical provenance (the fixture origin, the soak run and the readrow step) across the full window, the audit trail stayed bounded at the ${retentionwindow} event retention window while the immutable log kept every row, the expiry pass under the ${expirywindowms} ms rule purged ${purge.purged.length} aged items with every purge summary keeping its provenance and ${kept.length} items staying inside the window, and the audit export round tripped through its ${chunks.length} chunks.`;
      },
    );

    await entry(
      {
        id: 8,
        title: "every browser kind keeps the run alive on its fake tab",
        family: "browser matrix",
        module: "run.js",
      },
      async () => {
        const window = library.heartbeatwindowof(undefined);
        for (const browser of faketabprovider.kinds) {
          const tabid = faketabprovider.tabof(browser, 1);
          let state = library.openrun({
            runid: `soak-${browser}`,
            sessionid: "soak-session",
            planid: "soak-plan",
            profileid: "soak-profile",
            interval: steptick,
            now: epoch,
          });
          for (let beat = 0; beat < retentionwindow; beat += 1) {
            tick();
            state = library.beatrun(state, clocknow);
          }
          const isolated = library.tabisolate({ tabid, config: {}, runid: `soak-${browser}`, now: clocknow });
          check(
            library.tabnamespace(tabid) === `tab:${tabid}`,
            `the tab namespace of ${browser} answered ${library.tabnamespace(tabid)}`,
          );
          check(isolated.runid === `soak-${browser}`, `the isolated tab of ${browser} lost its run binding`);
          const live = library.zombiesweep({ states: [state], now: clocknow, interval: steptick, missedlimit: 3 });
          check(
            live.reaped.length === 0,
            `the zombie reaper took the beating ${browser} run: ${live.reaped.join(", ")}`,
          );
          const silent = library.openrun({
            runid: `soak-${browser}-silent`,
            sessionid: "soak-session",
            planid: "soak-plan",
            profileid: "soak-profile",
            interval: steptick,
            now: epoch,
          });
          tick();
          tick();
          tick();
          tick();
          tick();
          state = library.beatrun(state, clocknow);
          const discriminant = library.zombiesweep({
            states: [state, silent],
            now: clocknow,
            interval: steptick,
            missedlimit: 3,
          });
          check(
            discriminant.reaped.join(",") === `soak-${browser}-silent`,
            `the zombie reaper answered ${discriminant.reaped.join(", ")} on ${browser} instead of the silent run alone`,
          );
          const heartbeat = library.runheartbeat({ runid: `soak-${browser}`, now: clocknow });
          check(
            library.heartbeatisstale({ heartbeat, now: clocknow + window - steptick, window }) === false,
            `the ${browser} heartbeat sat stale inside the window`,
          );
        }
        const exportbundle = library.exportrunstate([full.context.state], clocknow);
        check(
          exportbundle.runs === 1 && exportbundle.beats === full.context.state.keepalive.beats,
          `the run state export answered ${JSON.stringify(exportbundle)}`,
        );
        return `the soak run stayed alive on the fake tab of every browser kind (chromium tab 101, firefox tab 201 and safari tab 301): the beating runs survived every zombie sweep inside the ${window} ms heartbeat window while their silent twins reaped, the tab isolation namespace bound each run to its tab, and the run state export answered ${exportbundle.beats} beats of the one run.`;
      },
    );

    await entry(
      {
        id: 9,
        title: "the soak report records every check and the exit answers the failures",
        family: "report",
        module: "soak.mjs",
      },
      async () => {
        const recorded = executed.filter((candidate) => candidate.id !== 9);
        check(recorded.length === 8, `the soak report carries ${recorded.length} executed checks instead of eight`);
        for (const candidate of recorded) {
          check(
            candidate.outcome === "pass" || candidate.outcome === "fail",
            `the check ${candidate.id} recorded no outcome`,
          );
          check(
            candidate.title.length > 10 && candidate.detail.length > 10,
            `the check ${candidate.id} recorded no title or detail`,
          );
        }
        const failedcount = recorded.filter((candidate) => candidate.outcome === "fail").length;
        const summary = {
          total: recorded.length + 1,
          passed: recorded.length - failedcount + (failedcount === 0 ? 1 : 0),
          failed: failedcount,
        };
        check(
          summary.failed === 0,
          `${summary.failed} soak check${summary.failed === 1 ? "" : "s"} failed before the report landed`,
        );
        check(full.result.run.state === "done", "the report landed while the soak run stayed unfinished");
        return `the soak report carries the eight executed checks with their outcomes and details, the summary computes ${summary.passed} of ${summary.total} passed over the ${totalrows} row soak run of ${passes} retention window passes, and the gate sets its nonzero exit the moment any failed check lands in the artifact.`;
      },
    );
  } finally {
    Date.now = realdatenow;
  }

  const failed = executed.filter((candidate) => candidate.outcome === "fail");
  return {
    release,
    checklist: "docs/soak.md",
    soak: {
      retentionwindow,
      passes,
      rows: totalrows,
      steps: 2 + passes * 2,
      dispatched: full.context.dispatched.length,
      logentries: full.sealed.log.entries.length,
      heartbeatwindow: library.heartbeatwindowof(undefined),
    },
    entries: executed,
    summary: { total: executed.length, passed: executed.length - failed.length, failed: failed.length },
  };
}

/** Reads the first index two strings disagree on, so a drift failure names where it started. */
function firstdifference(one, two) {
  for (let index = 0; index < Math.max(one.length, two.length); index += 1)
    if (one[index] !== two[index]) return String(index);
  return "the end";
}

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) {
  const report = await runsoaksuite();
  await mkdir("tests/artifacts", { recursive: true });
  await writeFile(artifactpath, `${JSON.stringify(report, null, 2)}\n`);
  for (const candidate of report.entries) {
    const line = `[${candidate.outcome === "pass" ? "ok" : "FAIL"}] ${candidate.id}. ${candidate.title} (${candidate.module}) — ${candidate.detail}`;
    if (candidate.outcome === "pass") console.log(line);
    else console.error(line);
  }
  console.log(JSON.stringify({ release: report.release, artifact: artifactpath, ...report.summary }, null, 2));
  if (report.summary.failed > 0) process.exitCode = 1;
}
