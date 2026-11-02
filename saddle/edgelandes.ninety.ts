// # edgelandes.ninety — the merge seat of the ninety modalities wave: the
// six heavyweight host lanes the plane probes (the browser server, the
// mobile seats, the pod session and the confidential compute — every one
// an honest probe lane that names its runtime and never fakes a boot) and
// the merged lane tables the dispatch plane reads. the three lane groups
// of the wave (edgelandes.host.ts — the host binary lanes, edgelandes.inproc.ts
// — the in-process lanes and edgelandes.virtual.ts — the virtual hardware
// composition lanes) each own their executors; this file only wires the
// heavyweight probes and answers the one merged surface the plane law
// demands: every lane in the table carries an executor, the wiring
// self-check never loads a gap. the visitor law holds everywhere: the
// heavyweight lanes probe server-side surfaces only, the visitor browser,
// gpu, cpu and storage are never touched.
//
// the dispatch reality law (the engine-real rung): the merged executor
// table prefers the real surfaces first — the host binary lanes and the
// base wire lanes (the s3 sigv4 signer, the libsql and mysql wire
// clients, the tmpfs / zram / swapfile kernel recipes) win over the
// in-process rehearsal lanes for every id they share, so a dispatched
// storage or ram lane answers the honest wire verdict (the configured
// roundtrip or the host-runtime-absent refusal that names its
// requirement) and never the composed rehearsal report. the in-process
// lanes remain the engine's deterministic rehearsal surface — importable
// directly (the battery drives their own map) and wired into the merged
// table only for the ids no real lane owns.

import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { edgelaneexecutorshost, hostlanespecs } from "./edgelandes.host.ts";
import { edgelaneexecutorsinproc, inproclanespecs } from "./edgelandes.inproc.ts";
import type { EdgeLaneExecutor } from "./edgelandes.ts";
import { edgelaneerror, edgelaneexecutors, probehostbinary } from "./edgelandes.ts";
import { edgelaneexecutorsvirtual, virtuallanespecs } from "./edgelandes.virtual.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the lane spec shape the heavyweight probes answer. */
/* ════════════════════════════════════════════════════════════════════ */

/** one heavyweight lane declaration: the modality id, the host kind
 * (every heavyweight lane probes, the execution wiring is the next
 * rung), the runtime surface it names and the synchronous probe. */
export interface HeavyweightLaneSpec {
  modality: string;
  kind: "live" | "host";
  runtime: string;
  present: () => boolean;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the heavyweight presence probes — server-side only. */
/* ════════════════════════════════════════════════════════════════════ */

/** probes the sandbox-side browser surface: any of the headless chromium
 * binaries on PATH or the playwright module through the node resolver —
 * the browser the lane drives lives inside the sandbox, never on the
 * visitor machine. */
function probebrowserserver(): boolean {
  return (
    probehostbinary("chromium") ||
    probehostbinary("chromium-browser") ||
    probehostbinary("google-chrome") ||
    probemoduleseat("playwright")
  );
}

/** probes the capacitor seat: the @capacitor/core module through the node
 * resolver (the mobile packaging surface the engine may carry). */
function probecapacitor(): boolean {
  return probemoduleseat("@capacitor/core");
}

/** probes the qemu machine the postmarketos image boots through (the
 * emulator runtime the mobile lane rides — the image law lives with the
 * deploy, the probe only names the runtime). */
function probepostmarketos(): boolean {
  return probehostbinary("qemu-system-x86_64");
}

/** probes the kubernetes client the pod session lane names. */
function probekubectl(): boolean {
  return probehostbinary("kubectl");
}

/** probes the amd sev-snp confidential compute surface: the /dev/sev
 * device node the attested guest mounts through. */
function probesevsnp(): boolean {
  return existsSync("/dev/sev");
}

/** probes the intel tdx confidential compute surface: the /dev/tdx device
 * node (the tdx module names it /dev/tdx on the hosts that carry it). */
function probetdx(): boolean {
  return existsSync("/dev/tdx") || existsSync("/dev/tdx-tdi");
}

/** resolves one engine module through the node resolver without loading
 * it — the honest seat check for the optional module surfaces. */
function probemoduleseat(specifier: string): boolean {
  try {
    createRequire(import.meta.url).resolve(specifier);
    return true;
  } catch {
    return false;
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the heavyweight probe executors — honest refusals only. */
/* ════════════════════════════════════════════════════════════════════ */

/** the honest probe executor of one heavyweight lane: the lane answers
 * HOST_RUNTIME_ABSENT when its surface is absent and the probe document
 * (the runtime it found and where) when present — the execution wiring
 * is the next rung and the lane never fakes a run. */
function heavyweightprobelane(modality: string, runtime: string, present: () => boolean): EdgeLaneExecutor {
  return async () => {
    if (!present()) {
      throw edgelaneerror(
        "HOST_RUNTIME_ABSENT",
        `the host runtime ${runtime} is absent from the engine host (the ${modality} lane probes and never fakes)`,
      );
    }
    return { stdout: `${runtime} probed for the ${modality} lane — the execution wiring is the next rung` };
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the heavyweight lane table — the six probes of the wave. */
/* ════════════════════════════════════════════════════════════════════ */

/** the six heavyweight lanes of the ninety modalities wave: the browser
 * server, the two mobile seats, the pod session and the two confidential
 * compute surfaces — every one kind host (the probe law). */
export const heavyweightlanespecs: readonly HeavyweightLaneSpec[] = Object.freeze([
  { modality: "browser-server", kind: "host", runtime: "chromium-headless", present: probebrowserserver },
  { modality: "mobile-capacitor", kind: "host", runtime: "capacitor", present: probecapacitor },
  { modality: "mobile-postmarketos", kind: "host", runtime: "qemu-system-x86_64", present: probepostmarketos },
  { modality: "pod-session", kind: "host", runtime: "kubectl", present: probekubectl },
  { modality: "confidential-sevsnp", kind: "host", runtime: "sev-snp", present: probesevsnp },
  { modality: "confidential-tdx", kind: "host", runtime: "tdx", present: probetdx },
]);

/** the executor table of the heavyweight lanes, keyed by modality id. */
export const edgelaneexecutorsheavy: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  "browser-server": heavyweightprobelane("browser-server", "chromium-headless", probebrowserserver),
  "mobile-capacitor": heavyweightprobelane("mobile-capacitor", "capacitor", probecapacitor),
  "mobile-postmarketos": heavyweightprobelane("mobile-postmarketos", "qemu-system-x86_64", probepostmarketos),
  "pod-session": heavyweightprobelane("pod-session", "kubectl", probekubectl),
  "confidential-sevsnp": heavyweightprobelane("confidential-sevsnp", "sev-snp", probesevsnp),
  "confidential-tdx": heavyweightprobelane("confidential-tdx", "tdx", probetdx),
});

/** the heavyweight lane ids in spec order. */
export const heavyweightlaneids: readonly string[] = Object.freeze(heavyweightlanespecs.map((lane) => lane.modality));

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: the merged tables — the one surface the plane reads. */
/* ════════════════════════════════════════════════════════════════════ */

/** the merged lane spec table of the plane: beside the sixteen base
 * lanes of the plane contract, the thirty-seven host binary lanes (the
 * twenty-five of the first wave, the twelve host seats of the wiring
 * wave), the twenty-four in-process lanes (the nineteen of the first
 * wave, the five seats of the wiring wave), the seven virtual hardware
 * lanes and the six heavyweight probes — seventy-four merged lanes, the
 * ninety the plan wires through the plane in total (sixty-six live,
 * twenty-four host), every modality the ninety plan answers. the order
 * walks the groups in their file order, then the heavyweight probes. */
export const edgelanespecsall: readonly (HeavyweightLaneSpec & { kind: "live" | "host" })[] = Object.freeze([
  ...hostlanespecs,
  ...inproclanespecs,
  ...virtuallanespecs,
  ...heavyweightlanespecs,
]);

/** the merged executor table of the plane: the dispatch reality law rides
 * the spread order — the rehearsal lanes spread first (they fill only the
 * ids no real lane owns), the virtual composition and the heavyweight
 * probes next, then the base wire executors and the host binary executors
 * last so every shared id answers its real surface: the storage and ram
 * ids carry the wire signers and the kernel recipes of the base table
 * (never the in-process rehearsal composer), the container and clr ids
 * carry the host binary lanes (the hardened docker run and the dotnet
 * compile) over the base profile documents. the dispatch law demands an
 * executor for every lane and this table answers it with the real seat
 * first, the rehearsal seat only where no real seat exists. */
export const edgelaneexecutorsall: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  ...edgelaneexecutorsinproc,
  ...edgelaneexecutorsvirtual,
  ...edgelaneexecutorsheavy,
  ...edgelaneexecutors,
  ...edgelaneexecutorshost,
});

/** the base lane ids of the plane contract (the sixteen lanes the base
 * edgeplane table wires directly — the merged executor table carries
 * their executors, so the reverse wiring check reads them too). */
const BASELANEIDS: readonly string[] = Object.freeze([
  "container-docker",
  "fs-vfs",
  "runner-node",
  "runner-bun",
  "runner-wasm",
  "runner-babel",
  "runner-webpack",
  "runner-universal",
  "language-python",
  "language-java",
  "container-runsc",
  "emulator-qemu",
  "microvm-firecracker",
  "runtime-jvm",
  "language-go",
  "language-ruby",
]);

/** the wiring self-check of the merge: the plane refuses to load over a
 * lane it cannot wire (a table entry without an executor is a miswired
 * plane, and miswiring must fail loud at boot, never silently at run
 * time) — and over a duplicate id (two lanes claiming one modality is a
 * miswired catalog). */
const seenids = new Set<string>();
for (const lane of edgelanespecsall) {
  if (seenids.has(lane.modality)) {
    throw new Error(`the ninety plane is miswired: the modality ${lane.modality} is declared twice`);
  }
  seenids.add(lane.modality);
  if (edgelaneexecutorsall[lane.modality] === undefined) {
    throw new Error(`the ninety plane is miswired: no executor for the lane ${lane.modality}`);
  }
}
for (const key of Object.keys(edgelaneexecutorsall)) {
  if (!seenids.has(key) && !BASELANEIDS.includes(key)) {
    throw new Error(`the ninety plane is miswired: the executor ${key} wires no lane in the table`);
  }
}
