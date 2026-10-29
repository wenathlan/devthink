// # edgeplane.ts — the edge execution law of the saddle engine: every
// pass of the system rides one modality lane of the engine, server-side,
// and the visitor browser never executes anything (the owner's law: the
// interface never uses the visitor browser, gpu or cpu; the sandbox and
// the saddle modalities act for the system over the internet). The plane
// owns the lane table — the ten live lanes the engine drives today and
// the six host lanes it probes — the visitor guard that refuses any
// browser-shaped scope before a single instruction rides, and the
// dispatcher that resolves the modality through the registry, rides the
// lane executor, captures the output and commits the artifact through
// the caller's storage adapter. The lane table is the wiring truth of
// this plane: the sv1 catalog declared most of these lanes planned
// before the edge wave wired them, and the report states what the engine
// drives today, honestly probed per runtime. The imports stay node-safe
// on purpose: the webserver's plain node host strips types and resolves
// only .ts specifiers, so the plane imports the pure registry and
// foundation modules directly and leaves the root domain graph
// (virtual.ts and its .js specifiers) to the lazy lane loads.

import {
  edgelaneexecutors,
  probedocker,
  probehostbinary,
  probemodule,
  probenodevm,
  probevirtualmodule,
  probewasm,
} from "./edgelandes.ts";
import { idfactory } from "./foundation.ts";
import { getmodality } from "./modalityregistry.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the contract types — the api surface of the edge plane. */
/* ════════════════════════════════════════════════════════════════════ */

/** one edge execution request: the modality lane to ride, the program
 * payload (or the base64 wasm bytes, or the vfs payload), the optional
 * inputs and the optional deadline budget in milliseconds. */
export type EdgeRequest = {
  /** the modality id of the lane to ride (the registry id). */
  modality: string;
  /** the program payload the lane interprets (code, bytes or script). */
  code: string;
  /** the caller inputs the lane surfaces to the program when given. */
  inputs?: unknown;
  /** the run deadline in milliseconds (clamped between 250 and 60000). */
  deadlinems?: number;
};

/** one lane of the edge plane as the report answers it: the modality it
 * wires, whether the lane executes (live) or probes (host), the runtime
 * surface it rides, and the honest probed presence of that runtime. */
export type EdgeLaneReport = {
  /** the modality id the lane wires. */
  modality: string;
  /** live lanes execute, host lanes probe the runtime (the next rung). */
  kind: "live" | "host";
  /** the runtime surface the lane rides ("node:vm", "bun", "docker"...). */
  runtime: string;
  /** whether this report row reflects a probe performed now (always true —
   * every lane probes its runtime surface when the table is read). */
  probed: boolean;
  /** whether the probed runtime surface is present on this engine host. */
  present: boolean;
};

/** one edge run result: the run identity, the lane it rode, the honest
 * status, the captured streams, the committed artifact manifest and the
 * coded error when the run failed. */
export type EdgeRunResult = {
  /** the run id the engine minted. */
  runid: string;
  /** the modality id that was requested. */
  modality: string;
  /** the runtime surface the run rode (empty when no lane rode it). */
  lane: string;
  /** the honest status of the run. */
  status: "succeeded" | "failed";
  /** the captured stdout when the run produced any. */
  stdout?: string;
  /** the captured stderr when the run produced any. */
  stderr?: string;
  /** the artifact the run committed (mime, byte count, storage ref). */
  artifact?: { mime: string; bytes: number; storageref?: string };
  /** the coded error when the run failed. */
  error?: { code: string; message: string };
};

/** the storage surface the edge plane commits artifacts through: the
 * duck-typed shape of the virtual.ts storageadapter products
 * (localstorage, memorystorage, the pools), so any adapter the engine
 * already carries slots in without importing the root domain graph. */
export interface EdgeStorageAdapter {
  /** writes one artifact and answers its manifest. */
  put(input: {
    key: string;
    data: Uint8Array | ArrayBuffer | string;
    contenttype?: string;
    metadata?: Record<string, unknown>;
  }): Promise<unknown>;
  /** reads one artifact back as bytes. */
  get(key: string): Promise<Uint8Array | ArrayBuffer>;
  /** answers the manifest of one artifact when present. */
  head(key: string): Promise<unknown>;
  /** removes one artifact. */
  delete(key: string): Promise<unknown>;
  /** lists the manifests under one prefix. */
  list(prefix?: string): Promise<readonly unknown[]>;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the lane table — the wiring truth of the edge plane. */
/* ════════════════════════════════════════════════════════════════════ */

/** one lane declaration of the table: the modality id, the kind, the
 * runtime surface and the synchronous presence probe. */
interface LaneSpec {
  modality: string;
  kind: "live" | "host";
  runtime: string;
  present: () => boolean;
}

/** the lane table of the edge plane: the ten live lanes (the execution
 * lanes the engine drives today) and the six host lanes (the runtimes
 * the engine probes, the execution wiring the next rung). The ids are
 * pinned — parallel waves and the api routes read them exactly. */
const EDGELANES: readonly LaneSpec[] = Object.freeze([
  // the live lanes: the engine executes through these today
  { modality: "container-docker", kind: "live", runtime: "docker", present: probedocker },
  { modality: "fs-vfs", kind: "live", runtime: "virtual-vfs", present: probevirtualmodule },
  { modality: "runner-node", kind: "live", runtime: "node:vm", present: probenodevm },
  { modality: "runner-bun", kind: "live", runtime: "bun", present: () => probehostbinary("bun") },
  { modality: "runner-wasm", kind: "live", runtime: "webassembly", present: probewasm },
  { modality: "runner-babel", kind: "live", runtime: "@babel/core", present: () => probemodule("@babel/core") },
  { modality: "runner-webpack", kind: "live", runtime: "webpack", present: () => probemodule("webpack") },
  { modality: "runner-universal", kind: "live", runtime: "bash", present: () => probehostbinary("bash") },
  { modality: "language-python", kind: "live", runtime: "python3", present: () => probehostbinary("python3") },
  { modality: "language-java", kind: "live", runtime: "java", present: () => probehostbinary("java") },
  // the host lanes: the engine probes the runtime, execution is the next rung
  { modality: "container-runsc", kind: "host", runtime: "runsc", present: () => probehostbinary("runsc") },
  {
    modality: "emulator-qemu",
    kind: "host",
    runtime: "qemu-system-x86_64",
    present: () => probehostbinary("qemu-system-x86_64"),
  },
  {
    modality: "microvm-firecracker",
    kind: "host",
    runtime: "firecracker",
    present: () => probehostbinary("firecracker"),
  },
  { modality: "runtime-jvm", kind: "host", runtime: "java", present: () => probehostbinary("java") },
  { modality: "language-go", kind: "host", runtime: "go", present: () => probehostbinary("go") },
  { modality: "language-ruby", kind: "host", runtime: "ruby", present: () => probehostbinary("ruby") },
]);

/** edgelanes — the lane table with every runtime probed now: the report
 * never lies, a lane whose runtime is absent says absent (an ops
 * surface, not a hot path — the probes walk PATH and the module
 * resolver synchronously). */
export function edgelanes(): EdgeLaneReport[] {
  return EDGELANES.map((lane) => ({
    modality: lane.modality,
    kind: lane.kind,
    runtime: lane.runtime,
    probed: true,
    present: lane.present(),
  }));
}

/** edgelandesreport — the same probed lane table keyed by modality id
 * for the api surface (GET /api/v1/edge/lanes answers {lanes: this}). */
export function edgelandesreport(): Record<string, EdgeLaneReport> {
  const report: Record<string, EdgeLaneReport> = {};
  for (const lane of edgelanes()) report[lane.modality] = lane;
  return report;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the visitor law guard — the engine refuses browser scopes. */
/* ════════════════════════════════════════════════════════════════════ */

/** the browser shells and storage surfaces that mark a visitor scope
 * (window, document, localStorage, sessionStorage, indexedDB): a scope
 * carrying any of them is a browser, and the engine refuses to execute
 * as one. navigator alone is not a marker — node itself ships a
 * vestigial navigator since v21 — the shells and the storages are the
 * law. */
const VISITORMARKERS: readonly string[] = Object.freeze([
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "indexedDB",
]);

/** assertvisitorfree — the law guard of the edge plane: throws
 * {code: "VISITOR_CONTEXT_REFUSED"} when the scope carries
 * browser-shaped globals, because the engine executes server-side only
 * and never as the visitor browser. Every runonedge entry calls it on
 * globalThis before a single instruction rides a lane.
 *
 * @param scope the scope to inspect (duck-typed, works in node).
 * @throws the coded refusal when the scope is browser-shaped.
 */
export function assertvisitorfree(scope: unknown): void {
  if (scope === null || typeof scope !== "object") return;
  const record = scope as Record<string, unknown>;
  for (const marker of VISITORMARKERS) {
    if (record[marker] !== undefined) {
      const error = new Error(
        `the visitor context is refused: the scope carries the browser global ${marker} and the edge plane executes server-side only`,
      ) as Error & { code: string };
      error.name = "edgeplaneerror";
      error.code = "VISITOR_CONTEXT_REFUSED";
      throw error;
    }
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the dispatch — runonedge rides one lane, honestly. */
/* ════════════════════════════════════════════════════════════════════ */

/** the default deadline of one edge run. */
const DEFAULTDEADLINEMS = 10000;

/** the deadline floor and ceiling: no run rides under 250 ms or over 60 s. */
const MINDEADLINEMS = 250;
const MAXDEADLINEMS = 60000;

/** the artifact extension of one mime type (the storage key suffix). */
function extensionfor(mime: string): string {
  const base = mime.split(";")[0]?.trim() ?? "";
  const extensions: Record<string, string> = {
    "text/plain": ".txt",
    "application/json": ".json",
    "application/javascript": ".js",
    "application/wasm": ".wasm",
    "application/octet-stream": ".bin",
  };
  return extensions[base] ?? ".bin";
}

/** clamps the caller deadline into the honest budget window. */
function clampdeadline(deadlinems: unknown): number {
  const requested = typeof deadlinems === "number" && Number.isFinite(deadlinems) ? deadlinems : DEFAULTDEADLINEMS;
  return Math.min(Math.max(Math.round(requested), MINDEADLINEMS), MAXDEADLINEMS);
}

/** the safe message of an unknown thrown value (no stack rides a result). */
function errormessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? "unknown edge failure");
}

/** the lane error code of an unknown thrown value: coded lane errors keep
 * their code, timeouts answer RUN_DEADLINE_EXCEEDED, the rest is honest
 * EDGE_LANE_FAILURE. */
function lanecode(error: unknown): string {
  const code = (error as { code?: unknown })?.code;
  if (typeof code === "string" && code.length > 0) return code;
  if (/timed out|timeout/i.test(errormessage(error))) return "RUN_DEADLINE_EXCEEDED";
  return "EDGE_LANE_FAILED";
}

/** the id factory of the edge plane (one run id per dispatch). */
const ids = idfactory();

/** runonedge — the dispatch law of the edge plane: the visitor guard
 * refuses any browser scope, the registry resolves the modality, the
 * lane executor rides the runtime server-side, the output is captured,
 * and the artifact (the lane artifact, or the stdout when the lane
 * produced none) is committed through the caller's storage adapter when
 * given. A planned or unknown modality answers MODALITY_NOT_LIVE; a
 * lane whose host runtime is absent answers HOST_RUNTIME_ABSENT naming
 * the runtime; a storage commit failure fails the run honestly
 * (STORAGE_FAILURE — an unpersisted artifact is a failed commit, the
 * engine law).
 *
 * @param request the edge run request (modality, code, inputs, deadline).
 * @param options the caller surfaces (the storage adapter for artifacts).
 * @returns the honest EdgeRunResult of the dispatch.
 */
export async function runonedge(
  request: EdgeRequest,
  options: { storage?: EdgeStorageAdapter } = {},
): Promise<EdgeRunResult> {
  const runid = ids.next("edgerun");
  const modality = typeof request?.modality === "string" ? request.modality : "";
  let lanename = "";
  try {
    assertvisitorfree(globalThis);
    if (modality.length === 0 || typeof request?.code !== "string") {
      return {
        runid,
        modality,
        lane: lanename,
        status: "failed",
        error: { code: "INVALID_EDGE_REQUEST", message: "an edge run requires a modality id and a code payload" },
      };
    }
    const lane = EDGELANES.find((entry) => entry.modality === modality);
    if (lane === undefined) {
      const record = getmodality(modality);
      if (record === undefined) {
        return {
          runid,
          modality,
          lane: lanename,
          status: "failed",
          error: { code: "MODALITY_NOT_LIVE", message: `the modality id ${modality} is unknown to the registry` },
        };
      }
      // a record the registry already drives live through another engine
      // surface (the envelope sandbox lane) is never lied about here: the
      // modality is live, this plane simply wires no lane for it yet.
      if (record.state === "planned") {
        return {
          runid,
          modality,
          lane: lanename,
          status: "failed",
          error: {
            code: "MODALITY_NOT_LIVE",
            message: `the modality ${modality} is planned: no engine surface drives it yet`,
          },
        };
      }
      return {
        runid,
        modality,
        lane: lanename,
        status: "failed",
        error: {
          code: "LANE_NOT_WIRED_IN_PLANE",
          message: `the modality ${modality} is ${record.state} in the registry, but this edge plane wires no lane for it yet — the other engine surfaces drive it`,
        },
      };
    }
    lanename = lane.runtime;
    const executor = edgelaneexecutors[lane.modality];
    if (executor === undefined) {
      return {
        runid,
        modality,
        lane: lanename,
        status: "failed",
        error: { code: "EDGE_PLANE_MISWIRED", message: `no executor is wired for the lane ${lanename}` },
      };
    }
    const deadline = clampdeadline(request.deadlinems);
    const output = await executor(request.code, request.inputs, deadline);
    const payload =
      output.artifact ??
      (output.stdout.length > 0
        ? { mime: "text/plain;charset=utf-8", bytes: new TextEncoder().encode(output.stdout) }
        : undefined);
    let artifact: EdgeRunResult["artifact"];
    if (payload !== undefined) {
      artifact = { mime: payload.mime, bytes: payload.bytes.byteLength };
      if (options.storage !== undefined) {
        try {
          const key = `edge/runs/${runid}/output${extensionfor(payload.mime)}`;
          const manifest = (await options.storage.put({
            key,
            data: payload.bytes,
            contenttype: payload.mime,
            metadata: { runid, modality },
          })) as { key?: string };
          artifact.storageref = typeof manifest?.key === "string" ? manifest.key : key;
        } catch (error) {
          return {
            runid,
            modality,
            lane: lanename,
            status: "failed",
            stderr: output.stderr,
            error: {
              code: "STORAGE_FAILURE",
              message: `the artifact of the edge run ${runid} failed to persist: ${errormessage(error)}`,
            },
          };
        }
      }
    }
    return {
      runid,
      modality,
      lane: lanename,
      status: "succeeded",
      stdout: output.stdout,
      stderr: output.stderr,
      artifact,
    };
  } catch (error) {
    return {
      runid,
      modality,
      lane: lanename,
      status: "failed",
      stderr: (error as { stderr?: string }).stderr,
      error: { code: lanecode(error), message: errormessage(error) },
    };
  }
}

/* the wiring self-check: the plane refuses to load over a lane it
 * cannot wire (a table entry without an executor is a miswired plane,
 * and miswiring must fail loud at boot, never silently at run time). */
for (const lane of EDGELANES) {
  if (edgelaneexecutors[lane.modality] === undefined) {
    throw new Error(`the edge plane is miswired: no executor for the lane ${lane.modality}`);
  }
}
