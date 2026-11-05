// # workloadlaw — the family workload lane catalog and the join law of the
// engine (root layer, wave WL1). One row per heavy workload lane of every
// official app of the family: the app that owns the lane, the lane's name,
// the demand the lane puts on the sandbox (gpu, network, isolation depth,
// boot budget) and where the lane runs today. The law this module answers
// is the owner's nuclear modality law made executable for the whole
// family: the workload never chooses a modality by name — the join
// resolver reads the demand and answers the modality set that satisfies
// it, so the person chooses none and the platform resolves the join of
// all. Every lane row carries a demand and never a modality id: the
// candidates are always computed from the registry of record
// (modalityregistry.ts), so the answer can never drift from the catalog
// and a modality that turns live tomorrow answers the same lane without
// this file moving.
//
// The honest today fields: one row declares `today: "engine-lane"` when the
// heavy pass already runs on a server-side engine surface of the family
// (the os sandbox lane, the edge plane dispatcher, the app gateways the
// deploys serve), and `today: "app-lane"` when the heavy pass still walks
// inside the app surface (the seeded rehearsals, the browser fallbacks the
// catalog laws keep naming). The report reads both truths beside the join
// verdict — a lane that resolves dispatchable and still walks app-lane is
// the next wave's work order, named honestly instead of hidden. The join
// verdict itself answers from the registry alone: "dispatchable" when at
// least one live modality satisfies the demand, "planned-only" when only
// planned records do (the gpu lanes ride here today and say so), and
// "unresolved" when the demand fits nothing — a calibration defect the
// battery refuses.
//
// Pure data and pure functions: zero storage, zero node-only imports, the
// browser-pure bundle keeps carrying it, exactly the registry law.

import { type ModalityRecord, resolvejoin } from "./modalityregistry.ts";

/** The demand one workload lane puts on the sandbox — the join vocabulary
 * the resolver reads (never a modality name: the nuclear law). */
export type WorkloadDemand = {
  /** Whether the lane's pass needs a gpu path through the virtual drivers. */
  gpu: boolean;
  /** Whether the lane's pass needs a network path. */
  network: boolean;
  /** The isolation depth the lane demands at minimum. */
  isolation: ModalityRecord["isolation"];
  /** The boot budget the lane tolerates, in milliseconds (defaults to the
   * cold ceiling of the ladder when absent). */
  bootbudget?: number;
};

/** Where the heavy pass of the lane runs today — the honest truth the
 * report reads beside the join verdict. */
export type LaneToday = "engine-lane" | "app-lane";

/** One workload lane of the family catalog: the app that owns the lane,
 * the lane's stable id, the role sentence, the demand and the honest
 * today. */
export type WorkloadLane = {
  /** The official app slug that owns the lane. */
  app: string;
  /** The lane id inside the app (kebab-case, unique per app). */
  lane: string;
  /** What the lane does, in one sentence. */
  role: string;
  /** The demand the lane puts on the sandbox. */
  demand: WorkloadDemand;
  /** Where the heavy pass runs today (the honest truth). */
  today: LaneToday;
};

/** The join verdict of one lane: computed from the registry, never
 * declared by hand. */
export type LaneVerdict = "dispatchable" | "planned-only" | "unresolved";

/** One answered join: the lane row, the verdict and the candidate records
 * the resolver answered (best candidate first). */
export type LaneJoin = {
  /** The lane row the join answered. */
  lane: WorkloadLane;
  /** The honest verdict computed from the registry. */
  verdict: LaneVerdict;
  /** The modality records that satisfy the demand, best first. */
  candidates: readonly ModalityRecord[];
  /** How many candidates the registry already drives live. */
  livecount: number;
};

/** The family workload lane catalog: the lanes of the eleven official
 * apps, walked from the analysis waves (A1) that mapped every app's heavy
 * passes. The rows carry demands and honest todays — never modality ids:
 * the join computes the answer from the registry of record. */
export const FAMILYLANES: readonly WorkloadLane[] = Object.freeze([
  // the argan lanes: the dns engine's heavy passes
  { app: "argan", lane: "dnssec-validate", role: "the dnssec chain validation walk: rrsig parsing, key tag checksums, validity windows and ds match rules over untrusted input", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "app-lane" },
  { app: "argan", lane: "zonefile-parse-diff", role: "the master file parse and the external-dns diff: tokenizer, normalization, creates/deletes/updates by group", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "app-lane" },
  { app: "argan", lane: "catalog-registry-serve", role: "the registry tables the catalog serves: mime types, protocols and seed rows over https and db, never the browser fallback", demand: { gpu: false, network: true, isolation: "process", bootbudget: 800 }, today: "app-lane" },
  { app: "argan", lane: "label-store-seed", role: "the label manifest seed into the store: the upsert walk that protects translated rows, mirrored server-side", demand: { gpu: false, network: true, isolation: "process", bootbudget: 25 }, today: "app-lane" },
  // the cadria lanes: the versawaze engine's generation passes
  { app: "cadria", lane: "analyze-wav", role: "the audio analysis pipeline: decode, downmix, resample, stft and the spectrum, rhythm, tonality, timbre and structure fusion", demand: { gpu: false, network: false, isolation: "process", bootbudget: 800 }, today: "engine-lane" },
  { app: "cadria", lane: "generate-image", role: "the image generation walk: palette, composition blocks, rhythm scatter, texture and motion into the deterministic project", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "engine-lane" },
  { app: "cadria", lane: "render-svg", role: "the svg render of the image project: draw command compilation and the byte-deterministic serialization", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "engine-lane" },
  { app: "cadria", lane: "decode-video", role: "the frame-accurate video decode lane: the container-namespace pass the codec walk rides, never the visitor decoder", demand: { gpu: false, network: false, isolation: "namespace", bootbudget: 800 }, today: "app-lane" },
  { app: "cadria", lane: "compile-shader", role: "the shader program assembly: the fragment library, the deterministic manifest and the sha digest, no visitor gpu ever compiles", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "engine-lane" },
  // the cobaia lanes: the monetization surface's light walks
  { app: "cobaia", lane: "plan-checkout", role: "the plan checkout surface: mrr plan rows, link validation and the billing webhook walk when it lands, secrets server-side", demand: { gpu: false, network: true, isolation: "process", bootbudget: 25 }, today: "app-lane" },
  { app: "cobaia", lane: "ads-slot", role: "the honest ad slot lane: the reserved slots and the rotation decision the deploy answers before the render", demand: { gpu: false, network: true, isolation: "process", bootbudget: 25 }, today: "app-lane" },
  { app: "cobaia", lane: "label-seed", role: "the label manifest seed of the monetization face: the store walk the sqlite vault carries", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "app-lane" },
  // the debonair lanes: the kathesis engine's audio walks
  { app: "debonair", lane: "ingest-audio", role: "the ingest worker: the stream separation, the pcm downmix and the payload json the reconstruction reads", demand: { gpu: false, network: false, isolation: "process", bootbudget: 800 }, today: "engine-lane" },
  { app: "debonair", lane: "render-track", role: "the render worker: the composed plan render, the mastering chain and the wav encode into the take store", demand: { gpu: false, network: false, isolation: "process", bootbudget: 800 }, today: "engine-lane" },
  // the forge lanes: the execution clone's run walks
  { app: "forge", lane: "binary-run", role: "the binary run lane: the runner the saddle engine answers for the fleet, the mode gate resolving through the join", demand: { gpu: false, network: true, isolation: "namespace", bootbudget: 800 }, today: "app-lane" },
  { app: "forge", lane: "queue-priority", role: " the run queue walk: express, normal and batch ordering over the queue the lane serves", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "app-lane" },
  // the foundry lanes: the pipeline clone's graph walks
  { app: "foundry", lane: "pipeline-graph", role: "the pipeline graph lane: provision, pull, run, collect and store — the plan walk the herd drives", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "app-lane" },
  { app: "foundry", lane: "image-artifact", role: "the image artifact lane: the format plans, the checksum seals and the shelf records the vault stores", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "app-lane" },
  // the getry lanes: the ai gateway's inference walks
  { app: "getry", lane: "inference-route", role: "the inference route lane: the provider pool, the sse parse and the model masking over the upstream calls", demand: { gpu: false, network: true, isolation: "process", bootbudget: 800 }, today: "engine-lane" },
  { app: "getry", lane: "stream-fallback", role: "the resilience runner: the verdict ladder, the backoff walk and the trail the retry lane keeps", demand: { gpu: false, network: true, isolation: "process", bootbudget: 25 }, today: "engine-lane" },
  { app: "getry", lane: "thinking-ladder", role: "the seven-level reasoning ladder: the budget resolution the request injects before the upstream call", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "engine-lane" },
  { app: "getry", lane: "router-rotation", role: "the rotation lane: the weighted draw, the cooldown ledger and the session rows the store keeps", demand: { gpu: false, network: true, isolation: "process", bootbudget: 25 }, today: "engine-lane" },
  // the saddle lanes: the engine's own dispatch surface
  { app: "saddle", lane: "edge-dispatch", role: "the edge plane dispatch itself: the visitor guard, the lane resolution and the artifact commit through the vault seam", demand: { gpu: false, network: true, isolation: "process", bootbudget: 1500 }, today: "engine-lane" },
  // the stealthhead lanes: the fps platform's simulation walks
  { app: "stealthhead", lane: "match-simulate", role: "the authoritative match simulation: the fixed-step physics, the reconcile and rewind twin and the seeded spawns", demand: { gpu: false, network: true, isolation: "process", bootbudget: 25 }, today: "app-lane" },
  { app: "stealthhead", lane: "rank-compute", role: "the ranking walk: the elo ladder, the season batch and the position assignment over the standing rows", demand: { gpu: false, network: true, isolation: "process", bootbudget: 800 }, today: "app-lane" },
  { app: "stealthhead", lane: "world-bake", role: "the world pre-compilation: the map bake through the render engine — the gpu pass the planned modalities answer", demand: { gpu: true, network: true, isolation: "vm", bootbudget: 1500 }, today: "app-lane" },
  { app: "stealthhead", lane: "ballistics-balance", role: "the armory balance sweep: falloff, shots-to-kill and ttk validation, offline and deterministic", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "app-lane" },
  // the vault lanes: the storage engine's object walks
  { app: "vault", lane: "blob-ingest", role: "the object deposit lane: path and mime validation, the quota gate inside the write transaction and the detach walk", demand: { gpu: false, network: true, isolation: "process", bootbudget: 800 }, today: "engine-lane" },
  { app: "vault", lane: "chunk-window", role: "the chunk window lane: the fixed slicing, the per-window digest and the brotli decision over the byte stream", demand: { gpu: false, network: false, isolation: "process", bootbudget: 800 }, today: "engine-lane" },
  { app: "vault", lane: "digest-sha256", role: "the digest engine: the sha-256 master and chunk walks and the full re-verification the read path answers", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "engine-lane" },
  { app: "vault", lane: "ref-gc", role: "the reference gc lane: the soft-delete tombstones, the ref detach and the orphan sweep the store drives", demand: { gpu: false, network: true, isolation: "process", bootbudget: 800 }, today: "engine-lane" },
  // the devthink lanes: the os envelope's command walks
  { app: "devthink", lane: "chat-sandbox", role: "the chat sandbox lane: the session jail, the tool surface and the exec walks the engine dispatches server-side", demand: { gpu: false, network: true, isolation: "namespace", bootbudget: 1500 }, today: "engine-lane" },
  { app: "devthink", lane: "llm-gateway", role: "the universal gateway pipeline: model resolution, auth, body building, retry and the streaming byte passthrough", demand: { gpu: false, network: true, isolation: "process", bootbudget: 800 }, today: "engine-lane" },
  { app: "devthink", lane: "stream-parse", role: "the streaming parser: the tolerant sse walk, the payload normalization and the delta tracking over the live stream", demand: { gpu: false, network: true, isolation: "process", bootbudget: 25 }, today: "engine-lane" },
  { app: "devthink", lane: "graph-run", role: "the graph runner: the deterministic stage walk, the retry ladder and the progress views the console draws", demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 }, today: "engine-lane" },
  { app: "devthink", lane: "mcp-serve", role: "the mcp registry lane: the tool catalog, the approval gates and the transports the server answers", demand: { gpu: false, network: true, isolation: "process", bootbudget: 800 }, today: "engine-lane" },
]);

/** The official app slugs the catalog covers — the lockstep vocabulary the
 * ownership manifest of the os answers (every official app owns at least
 * one workload lane here). */
export const CATALOGAPPS: readonly string[] = Object.freeze([
  "argan",
  "cadria",
  "cobaia",
  "debonair",
  "devthink",
  "forge",
  "foundry",
  "getry",
  "saddle",
  "stealthhead",
  "vault",
]);

/** Answers the workload lanes one app owns.
 *
 * @param app the official app slug.
 * @returns the lane rows of the app, catalog order.
 */
export function lanesof(app: string): readonly WorkloadLane[] {
  return FAMILYLANES.filter((row) => row.app === app);
}

/** Answers one lane row by app and lane id.
 *
 * @param app the official app slug.
 * @param lane the lane id inside the app.
 * @returns the lane row, or undefined when the catalog carries no such
 * lane.
 */
export function getlane(app: string, lane: string): WorkloadLane | undefined {
  return FAMILYLANES.find((row) => row.app === app && row.lane === lane);
}

/** Joins one lane row against the registry of record: the nuclear law
 * made executable — the demand rides the join resolver, the candidates
 * answer best-first and the verdict is computed, never declared.
 *
 * @param row the lane row to join.
 * @returns the answered join: the row, the verdict and the candidates.
 */
export function lanejoin(row: WorkloadLane): LaneJoin {
  const candidates = resolvejoin({
    base: "max",
    gpu: row.demand.gpu,
    network: row.demand.network,
    isolation: row.demand.isolation,
    bootbudget: row.demand.bootbudget,
  });
  const livecount = candidates.filter((modality) => modality.state === "live").length;
  const verdict: LaneVerdict = livecount > 0 ? "dispatchable" : candidates.length > 0 ? "planned-only" : "unresolved";
  return { lane: row, verdict, candidates, livecount };
}

/** Joins one lane of one app by id — the surface the api route and the
 * app mirrors read.
 *
 * @param app the official app slug.
 * @param lane the lane id inside the app.
 * @returns the answered join, or undefined when the catalog carries no
 * such lane.
 */
export function familyjoin(app: string, lane: string): LaneJoin | undefined {
  const row = getlane(app, lane);
  return row === undefined ? undefined : lanejoin(row);
}

/** One app's workload answer: the lanes, the joins and the honest counts. */
export type AppWorkloadReport = {
  /** The official app slug. */
  app: string;
  /** The lane count the app owns. */
  lanes: number;
  /** The lanes whose join answered at least one live modality. */
  dispatchable: number;
  /** The lanes whose join answered only planned records. */
  plannedonly: number;
  /** The lanes whose join answered nothing (a calibration defect). */
  unresolved: number;
  /** The lanes whose heavy pass still walks the app surface. */
  applane: number;
  /** The lanes whose heavy pass already walks an engine surface. */
  enginelane: number;
  /** The per-lane joins, catalog order. */
  joins: readonly LaneJoin[];
};

/** The family workload report: the honest census of every app's lanes
 * against the registry of record — the work order the next waves read.
 * */
export type FamilyWorkloadReport = {
  /** The official app count the catalog covers. */
  apps: number;
  /** The total lane count of the catalog. */
  lanes: number;
  /** The lanes whose join answered at least one live modality. */
  dispatchable: number;
  /** The lanes whose join answered only planned records (the gpu waits). */
  plannedonly: number;
  /** The lanes whose join answered nothing. */
  unresolved: number;
  /** The lanes whose heavy pass still walks the app surface — the honest
   * migration list the next waves work through. */
  applanemigration: number;
  /** The per-app reports, catalog order. */
  perapp: readonly AppWorkloadReport[];
};

/** Computes the honest family workload report from the catalog and the
 * registry — every count derived, nothing hardcoded, so the report can
 * never drift from either surface.
 *
 * @returns the family census of the workload law.
 */
export function workloadreport(): FamilyWorkloadReport {
  const perapp: AppWorkloadReport[] = [];
  let dispatchable = 0;
  let plannedonly = 0;
  let unresolved = 0;
  let applanemigration = 0;
  for (const app of CATALOGAPPS) {
    const joins = lanesof(app).map(lanejoin);
    const dispatchablecount = joins.filter((join) => join.verdict === "dispatchable").length;
    const plannedonlycount = joins.filter((join) => join.verdict === "planned-only").length;
    const unresolvedcount = joins.filter((join) => join.verdict === "unresolved").length;
    const applanecount = joins.filter((join) => join.lane.today === "app-lane").length;
    dispatchable += dispatchablecount;
    plannedonly += plannedonlycount;
    unresolved += unresolvedcount;
    applanemigration += applanecount;
    perapp.push({
      app,
      lanes: joins.length,
      dispatchable: dispatchablecount,
      plannedonly: plannedonlycount,
      unresolved: unresolvedcount,
      applane: applanecount,
      enginelane: joins.length - applanecount,
      joins,
    });
  }
  return {
    apps: CATALOGAPPS.length,
    lanes: FAMILYLANES.length,
    dispatchable,
    plannedonly,
    unresolved,
    applanemigration,
    perapp,
  };
}
