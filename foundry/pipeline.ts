// # pipeline.ts — the one keyword file of the pipeline domain: the
// consolidation law of the root (one keyword file per domain — the variant
// and correlated logics that lived scattered across the app's files
// unified into one module, every file one responsibility) merged the six
// wave files of the foundry pipeline into this seat — the artifact
// checksum engine (the former artifact.ts body below), the pipeline plan
// graph engine (graphplan.ts), the image format engine (imagestore.ts),
// the runner-mode seam (runner.ts), the sandbox state machine page model
// (sandbox.ts) and the workload lane declaration (sandboxmodality.ts) —
// every export preserved verbatim, zero logic changes. The consolidation
// notes: the helper four of the waves duplicated verbatim (mulberry32)
// rides once in its first section — the artifact engine's seat, exported
// because the sandbox section's public surface answered it (the graphplan,
// imagestore and sandbox copies were dropped); the one intra-app import
// the waves carried (artifact.ts reading imagestore.ts) dissolved into
// the seat; no other same-name const or decl lived in two sources, so no
// group suffix rides this file — every surface stays live in one seat.

import {
  canTransition,
  refusalFor,
  SANDBOX_LIFECYCLE_ACTION_TARGETS,
  SANDBOX_LIFECYCLE_STATES,
  type SandboxLifecycleAction,
  type SandboxLifecycleState,
} from "@wenathlan/saddle/sandbox";

/* the lane seat engine of the workload lane declaration below rides the
   owner's factory (wave W5, the dedup law) through the relative owner
   source — the engine lives in saddle once, this seat keeps only the
   foundry data (the slug, the env var name, the lane table). */
import { type AppWorkloadLane, type LaneSeatResult, laneseating } from "../saddle/workloadlaw.ts";

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: artifact.ts — the artifact checksum engine (the first section). */
/* (consolidation note: mulberry32 rides HERE as the one seat of the       */
/* helper the graphplan, imagestore and sandbox sections also carried      */
/* verbatim — exported, because the sandbox section's public surface       */
/* answered it.)                                                           */
/* ══════════════════════════════════════════════════════════════════════ */

// # artifact — the artifact checksum engine of the foundry (root layer,
// pure logic). Every packaged artifact the floor answers carries its
// checksum: a deterministic fnv-1a digest over the artifact's identity
// (name + format + byte size + payload) rendered as hex, beside the byte
// size and the herd format. The family already rides fnv-1a identities on
// the cadria gateway — the same engine here, so a checksum computed in node
// equals the one computed in the browser, and the tests pin it byte for
// byte. This module is the testable core of the /manifest page.

/** encodes a string as the utf-8 byte sequence (pure, no TextEncoder —
 * the same bytes in node and in the browser). */
export function utf8Bytes(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.codePointAt(i) as number;
    if (code > 0xffff) i++; // consume the low surrogate of an astral pair
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

/** fnv-1a (32-bit) over the utf-8 bytes of a string — the deterministic
 * identity hash of the family. */
export function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (const byte of utf8Bytes(text)) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** the 8-hex render of the fnv-1a digest. */
export function fnv1aHex(text: string): string {
  return fnv1a(text).toString(16).padStart(8, "0");
}

/** one packaged artifact of the floor. */
export interface Artifact {
  /** the stable id of the artifact */
  id: string;
  /** the artifact name (without the extension) */
  name: string;
  /** the herd format the artifact rides */
  format: ImageFormat;
  /** the sealed size in bytes */
  bytes: number;
  /** the fnv-1a checksum over the artifact identity (8 hex) */
  checksum: string;
  /** the identity string the checksum answers for (honest provenance) */
  identity: string;
}

/** builds the canonical identity string of an artifact (name · ext · bytes
 * · payload) — the exact string the checksum digests. */
export function artifactIdentity(name: string, format: ImageFormat, bytes: number, payload = ""): string {
  const ext = formatOf(format)?.ext ?? ".tzst";
  return [name, ext, String(bytes), payload].join(" · ");
}

/** seals an artifact: identity first, checksum over the identity, then the
 * record (pure — nothing is written anywhere). */
export function sealArtifact(name: string, format: ImageFormat, bytes: number, payload = ""): Artifact {
  const identity = artifactIdentity(name, format, bytes, payload);
  return {
    id: `art-${fnv1aHex(identity)}`,
    name,
    format,
    bytes,
    checksum: fnv1aHex(identity),
    identity,
  };
}

/** the packaged line of one artifact — the shelf renders it verbatim. */
export function artifactLine(artifact: Artifact): string {
  const ext = formatOf(artifact.format)?.ext ?? ".tzst";
  return `${artifact.name}${ext} · ${artifact.bytes.toLocaleString("en-US")} b · fnv-1a ${artifact.checksum}`;
}

/** the manifest of the floor: one line per artifact, stable order. */
export function manifest(artifacts: readonly Artifact[]): string {
  return artifacts.map((artifact) => artifactLine(artifact)).join("\n");
}

/** mulberry32 — the small deterministic prng of the family engines. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** the packaging runs the floor rehearses: deterministic from the seed —
 * each run seals one artifact per herd format. */
export function seedArtifacts(seed: number): Artifact[] {
  const rand = mulberry32(seed);
  const formats: readonly ImageFormat[] = ["tzst", "targz", "tarxz"];
  const names = ["base", "toolchain", "runtime"] as const;
  return formats.map((format, index) =>
    sealArtifact(
      `${names[index]}-${(seed >>> 0).toString(36).slice(0, 4)}`,
      format,
      (30 + Math.floor(rand() * 700)) * 1_000_000,
    ),
  );
}

/** re-verifies a sealed artifact: the checksum must still answer for the
 * identity (the seal is the proof, re-sealing must be byte-equal). */
export function verifyArtifact(artifact: Artifact): boolean {
  return fnv1aHex(artifact.identity) === artifact.checksum;
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: graphplan.ts — the pipeline plan graph engine.                 */
/* (consolidation note: the private mulberry32 copy this wave carried      */
/* — its own roll, byte-equal to the artifact section's — was dropped;     */
/* planfailindex reads the one seat above.)                                */
/* ══════════════════════════════════════════════════════════════════════ */

// # graphplan — the pipeline plan engine of the foundry (root layer, pure
// logic). The foundry stores and executes together, and the owner asked
// everything to be drawn by graphs and nodes, stage by stage — so the
// pipeline of one packaging run is a graph: provision the sandbox, pull the
// image through the registry gate, run the herd, collect the sealed
// artifacts and store them on the shelf. This module is the foundry's own
// small engine for that (the apps share no engine code — each app owns its
// own): the canonical plan, the projection into nodes and wires, the stable
// topological stages, the validation and the deterministic rehearsal states
// the artifacts page drives from its seed and tick. No DOM, no clocks, no
// randomness beyond the family mulberry32 seeded from the line: the same
// plan with the same seed and tick always answers the same states, in node
// and in the browser.

/** The ladder states one plan step holds across a rehearsal tick. */
export type planstate = "pending" | "running" | "done" | "failed" | "skipped";

/** Every plan state, in ladder order. */
export const PLAN_STATES: readonly planstate[] = ["pending", "running", "done", "failed", "skipped"];

/** The kinds a plan step can wear (the role the panel draws). */
export type planstepkind = "stage" | "gate" | "tool" | "sink";

/** One step of the pipeline plan: what the floor does on the way to the shelf. */
export interface planstep {
  /** The stable id of the step inside the plan. */
  id: string;
  /** The kind the step wears. */
  kind: planstepkind;
  /** The human label of the step. */
  label: string;
  /** The one-line note the manifest reads. */
  note: string;
}

/** One wire of the plan: the hand-off from one step into the next. */
export interface planwire {
  from: string;
  to: string;
}

/** One pipeline plan: the closed set of steps and wires (a tiny graph). */
export interface runplan {
  /** The plan identity (the rehearsed plan of the line answers the canonical id). */
  id: string;
  steps: readonly planstep[];
  wires: readonly planwire[];
}

/** One drawn plan node: the step fields plus the state the rehearsal holds. */
export interface plannode {
  id: string;
  kind: planstepkind;
  label: string;
  note: string;
  state: planstate;
}

/** One drawn plan edge (the wire, unchanged). */
export interface planedge {
  from: string;
  to: string;
}

/** The plan as a drawn graph: nodes carrying states, edges carrying hand-offs. */
export interface plangraph {
  nodes: readonly plannode[];
  edges: readonly planedge[];
}

/** One drawn position on the plan panel: the layer (stage) and the row inside it. */
export interface planposition {
  x: number;
  y: number;
  layer: number;
  row: number;
}

/** The canonical plan of one foundry pipeline run — the catalog of what a
 * packaging run is, in ride order: the sandbox shape provisions, the image
 * pulls through the registry gate, the herd runs, the artifacts come back
 * sealed and the vault shelf stores them. */
export const PIPELINE: runplan = {
  id: "foundry-pipeline",
  steps: [
    {
      id: "provision",
      kind: "stage",
      label: "provision the sandbox",
      note: "the sandbox shape comes up on the machine room floor",
    },
    {
      id: "pull",
      kind: "gate",
      label: "pull the image",
      note: "the image pulls through the registry gate before anything runs",
    },
    {
      id: "run",
      kind: "tool",
      label: "run the herd",
      note: "the herd executes inside the sandbox and the turnaround is recorded",
    },
    {
      id: "collect",
      kind: "tool",
      label: "collect the artifacts",
      note: "the artifacts come back sealed with their fnv-1a identity",
    },
    {
      id: "store",
      kind: "sink",
      label: "store on the shelf",
      note: "the vault shelf keeps every artifact the line seals",
    },
  ],
  wires: [
    { from: "provision", to: "pull" },
    { from: "pull", to: "run" },
    { from: "run", to: "collect" },
    { from: "collect", to: "store" },
  ],
};

/** Answers a fresh copy of one plan (immutable edits start from a copy). */
export function plancopy(plan: runplan): runplan {
  return {
    id: plan.id,
    steps: plan.steps.map((step) => ({ ...step })),
    wires: plan.wires.map((wire) => ({ ...wire })),
  };
}

/** Reads one step of the plan by id. */
export function planstepof(plan: runplan, id: string): planstep | undefined {
  return plan.steps.find((step) => step.id === id);
}

/** Reads the direct feeders of one step (the wires that arrive), stable order. */
export function planfeeders(plan: runplan, id: string): string[] {
  const feeders: string[] = [];
  for (const wire of plan.wires) {
    if (wire.to === id && !feeders.includes(wire.from)) feeders.push(wire.from);
  }
  return feeders;
}

/** Reads the direct successors of one step (the wires that leave), stable order. */
export function plannext(plan: runplan, id: string): string[] {
  const next: string[] = [];
  for (const wire of plan.wires) {
    if (wire.from === id && !next.includes(wire.to)) next.push(wire.to);
  }
  return next;
}

/** Layers the plan into the stable topological stages (one wave per layer,
 * steps inside a wave in ride order) — the stages the panel draws. */
export function planstages(plan: runplan): string[][] {
  const levels: Record<string, number> = {};
  let placed = true;
  while (placed) {
    placed = false;
    for (const step of plan.steps) {
      if (levels[step.id] !== undefined) continue;
      const feeders = planfeeders(plan, step.id);
      if (feeders.every((feeder) => levels[feeder] !== undefined)) {
        levels[step.id] = feeders.reduce((max, feeder) => Math.max(max, levels[feeder] ?? 0), -1) + 1;
        placed = true;
      }
    }
  }
  const waves: string[][] = [];
  for (const step of plan.steps) {
    const level = levels[step.id] ?? 0;
    while (waves.length <= level) waves.push([]);
    waves[level]?.push(step.id);
  }
  return waves;
}

/** The number of stages the plan rides. */
export function plandepth(plan: runplan): number {
  return planstages(plan).length;
}

/** Validates the plan: duplicate ids, wires naming unknown steps, cycles.
 * Answers the problem codes (empty array = a valid plan). */
export function planvalid(plan: runplan): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const step of plan.steps) {
    if (seen.has(step.id)) problems.push("duplicateid");
    seen.add(step.id);
  }
  for (const [index, wire] of plan.wires.entries()) {
    if (wire.from === wire.to) problems.push("selfwire");
    if (!seen.has(wire.from) || !seen.has(wire.to)) {
      problems.push("unknownstep");
      continue;
    }
    if (reaches(plan, wire.to, wire.from)) problems.push(`cycle@${index}`);
  }
  return problems;
}

/** Answers whether one step reaches another forward (transitive, self inclusive). */
function reaches(plan: runplan, from: string, to: string): boolean {
  if (from === to) return true;
  const seen = new Set<string>();
  const queue = [...plannext(plan, from)];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) break;
    if (current === to) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const next of plannext(plan, current)) queue.push(next);
  }
  return false;
}

/** Projects the plan into the drawn graph: every step carries the state the
 * rehearsal map holds (pending when the map stays silent). */
export function plangraphof(plan: runplan, states: Readonly<Record<string, planstate>> = {}): plangraph {
  return {
    nodes: plan.steps.map((step) => ({ ...step, state: states[step.id] ?? "pending" })),
    edges: plan.wires.map((wire) => ({ ...wire })),
  };
}

/** Lays the plan out on its stages: x rides the stage column, y rides the
 * stable row — the geometry the panel draws without improvising. */
export function planpositions(
  plan: runplan,
  options: { columnwidth?: number; rowheight?: number; originx?: number; originy?: number } = {},
): Record<string, planposition> {
  const columnwidth = Math.max(1, options.columnwidth ?? 208);
  const rowheight = Math.max(1, options.rowheight ?? 72);
  const originx = options.originx ?? 0;
  const originy = options.originy ?? 0;
  const positions: Record<string, planposition> = {};
  planstages(plan).forEach((wave, layer) => {
    wave.forEach((id, row) => {
      positions[id] = { x: originx + layer * columnwidth, y: originy + row * rowheight, layer, row };
    });
  });
  return positions;
}

/** Answers the bounds box of a drawn plan (the box the svg viewBox rides). */
export function planbounds(
  positions: Readonly<Record<string, planposition>>,
  options: { cardwidth?: number; cardheight?: number; padding?: number } = {},
): { minx: number; miny: number; width: number; height: number } {
  const cardwidth = options.cardwidth ?? 176;
  const cardheight = options.cardheight ?? 56;
  const padding = options.padding ?? 20;
  const entries = Object.values(positions);
  if (entries.length === 0)
    return { minx: 0, miny: 0, width: cardwidth + padding * 2, height: cardheight + padding * 2 };
  const minx = Math.min(...entries.map((position) => position.x)) - padding;
  const miny = Math.min(...entries.map((position) => position.y)) - padding;
  const maxx = Math.max(...entries.map((position) => position.x + cardwidth)) + padding;
  const maxy = Math.max(...entries.map((position) => position.y + cardheight)) + padding;
  return { minx, miny, width: maxx - minx, height: maxy - miny };
}

/** Answers whether one state settled (the rehearsal already decided the step). */
export function planstateissettled(state: planstate): boolean {
  return state === "done" || state === "failed" || state === "skipped";
}

/** Tallies the states of a rehearsal map. */
export function plantally(states: Readonly<Record<string, planstate>>): Record<planstate, number> {
  const tally: Record<planstate, number> = { pending: 0, running: 0, done: 0, failed: 0, skipped: 0 };
  for (const id of Object.keys(states)) tally[states[id] as planstate] += 1;
  return tally;
}

/** The aggregated progress of a rehearsal map (0..100): the done share. */
export function planprogress(states: Readonly<Record<string, planstate>>): number {
  const ids = Object.keys(states);
  if (ids.length === 0) return 0;
  let done = 0;
  for (const id of ids) {
    if (states[id] === "done") done += 1;
  }
  return Math.round((done / ids.length) * 100);
}

/** The step of the pipeline that rides red on this seed: one deterministic
 * roll (1 in 5 pipelines rides red — the rehearsal never heals a red rung
 * by hiding it, and a reseed rolls again). -1 = the pipeline rides green. */
export function planfailindex(plan: runplan, seed: number): number {
  const roll = mulberry32(seed >>> 0)();
  return roll < 1 / 5 ? Math.floor(roll * 5 * plan.steps.length) : -1;
}

/** The rehearsal states of the plan at one tick: every step before the
 * cursor settled done, the cursor step runs (or rides the seeded red and the
 * rest strand skipped), everything after stays pending. Deterministic —
 * the same seed and tick always answer the same map. */
export function planrehearsal(plan: runplan, seed: number, tick: number): Record<string, planstate> {
  const states: Record<string, planstate> = {};
  const failindex = planfailindex(plan, seed);
  const cursor = Math.min(Math.max(0, tick), plan.steps.length);
  for (const [index, step] of plan.steps.entries()) {
    if (failindex >= 0 && tick > failindex) {
      // the pipeline already rode red: the red step keeps its failure record and the rest strand
      states[step.id] = index < failindex ? "done" : index === failindex ? "failed" : "skipped";
      continue;
    }
    states[step.id] = index < cursor ? "done" : index === cursor && cursor < plan.steps.length ? "running" : "pending";
  }
  return states;
}

/** The ids of the steps the pipeline still holds on the shelf run: the
 * unsettled prefix the artifacts page reads to narrate the walk. */
export function planopensteps(plan: runplan, states: Readonly<Record<string, planstate>>): string[] {
  return plan.steps.filter((step) => !planstateissettled(states[step.id] ?? "pending")).map((step) => step.id);
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: imagestore.ts — the image format engine.                       */
/* (consolidation note: the private mulberry32 copy this wave carried      */
/* verbatim was dropped; seedImages reads the one seat in the artifact     */
/* section.)                                                               */
/* ══════════════════════════════════════════════════════════════════════ */

// # imagestore — the image engine of the foundry (root layer, pure logic).
// The herd formats of the family: images travel as .tzst (tar over zstd —
// the quick herd), .tar.gz (tar over gzip — the pack herd) and .tar.xz
// (tar over xz — the release herd). This module answers the honest
// conversion plan between the formats (always through the tar layer, never
// a direct recompress lie), the compression estimate per format and the
// pour order the floor keeps. Pure: bytes never move here — plans and
// numbers only. This module is the testable core of the /images page.

/** the three clone formats of the herd. */
export type ImageFormat = "tzst" | "targz" | "tarxz";

/** the format table: extension, label and the honest trait of each herd. */
export interface FormatSpec {
  id: ImageFormat;
  ext: ".tzst" | ".tar.gz" | ".tar.xz";
  label: string;
  trait: string;
}

/** the formats in floor order (the lead herd first). */
export const FORMATS: readonly FormatSpec[] = [
  { id: "tzst", ext: ".tzst", label: "the quick herd", trait: "tar over zstd — clones fast" },
  { id: "targz", ext: ".tar.gz", label: "the pack herd", trait: "tar over gzip — opens anywhere" },
  { id: "tarxz", ext: ".tar.xz", label: "the release herd", trait: "tar over xz — releases travel small" },
];

/** answers the format spec of an id (or the lead herd for unknowns — no,
 * the floor refuses unknowns honestly). */
export function formatOf(id: string): FormatSpec | undefined {
  return FORMATS.find((format) => format.id === id);
}

/** answers the format of an extension like ".tar.gz". */
export function formatFromExt(ext: string): FormatSpec | undefined {
  const clean = ext.trim().toLowerCase();
  return FORMATS.find((format) => format.ext === clean);
}

/** the conversion plan between two formats: the tar layer is unpacked once
 * and recompressed into the target — never a direct byte-to-byte lie. */
export interface ConvertPlan {
  from: FormatSpec;
  to: FormatSpec;
  /** the honest step list of the conversion */
  steps: readonly string[];
}

/** builds the conversion plan from one format into another (same format is
 * a no-op answer with a one-line plan). */
export function convertPlan(fromId: ImageFormat, toId: ImageFormat): ConvertPlan {
  const from = formatOf(fromId) ?? FORMATS[0];
  const to = formatOf(toId) ?? FORMATS[0];
  if (from.id === to.id) {
    return { from, to, steps: [`no conversion — the herd already rides ${from.ext}`] };
  }
  return {
    from,
    to,
    steps: [
      `unpack the ${from.ext} layer down to the tar stream`,
      `recompress the tar stream into ${to.ext}`,
      `seal the converted herd with its checksum (sha-256)`,
    ],
  };
}

/** the rough compressed-size estimate per format, as a share of the tar
 * stream (measured on the family trees: zstd the quickest and the tightest
 * on code, gzip the middle, xz the smallest but the slowest). */
const COMPRESS_SHARE: Readonly<Record<ImageFormat, number>> = { tzst: 0.32, targz: 0.38, tarxz: 0.26 };

/** estimates the converted size of a tar stream of `bytes` in a format. */
export function estimateSize(bytes: number, format: ImageFormat): number {
  if (bytes <= 0) return 0;
  return Math.max(1, Math.round(bytes * COMPRESS_SHARE[format]));
}

/** the pour order of the floor: the lead herd first, then the kept herds —
 * the order the /images shelf presents. */
export function pourOrder(): readonly FormatSpec[] {
  return FORMATS;
}

/** the image record the floor keeps per herd: name, format and the sealed
 * tar size. */
export interface HerdImage {
  id: string;
  name: string;
  format: ImageFormat;
  /** the uncompressed tar stream size in bytes */
  tarBytes: number;
}

/** the shelf of the machine room: a seeded, honest rehearsal of images
 * (sizes derive from the seed — the surface says the shelf is a rehearsal). */
export function seedImages(seed: number, count = 5): HerdImage[] {
  const rand = mulberry32(seed);
  const images: HerdImage[] = [];
  for (let i = 0; i < count; i++) {
    const format = FORMATS[i % FORMATS.length].id;
    const tarBytes = (40 + Math.floor(rand() * 900)) * 1_000_000;
    images.push({
      id: `img-${(seed >>> 0).toString(36)}-${String(i + 1).padStart(2, "0")}`,
      name: `${["base", "toolchain", "runtime", "pack", "release"][i % 5]}-${String(i + 1).padStart(2, "0")}`,
      format,
      tarBytes,
    });
  }
  return images;
}

/** the human byte count the shelves render (tabular, always one unit). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = "B";
  for (const next of units) {
    if (value < 1024) break;
    value /= 1024;
    unit = next;
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${unit}`;
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: runner.ts — the runner-mode seam (the mode ladder port).       */
/* (consolidation note: the re-export rides verbatim — the seam keeps      */
/* the app's name (modes) bound to the one ladder the engine owns.)        */
/* ══════════════════════════════════════════════════════════════════════ */

// runner — correlated logic of execution (the Saddle engine runs the
// binary and returns the result).
//
// wave 3, the engine ownership law: the runner-mode ladder (the five
// runtime targets a run asks for) answers from the saddle owner through
// the published library specifier ("@wenathlan/saddle/modes") — the list
// is never duplicated inside the app. this module stays the app-local
// seam: it keeps the app's name (modes) bound to the one ladder the
// engine owns.
export { runnermodes as modes } from "@wenathlan/saddle/modes";

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: sandbox.ts — the sandbox page model (the machine room).        */
/* (consolidation note: the @wenathlan/saddle/sandbox import merged        */
/* into the seat's top import; the exported mulberry32 copy this wave      */
/* carried was dropped — it rides the artifact section — and the           */
/* re-export of canTransition/refusalFor stays verbatim.)                  */
/* ══════════════════════════════════════════════════════════════════════ */

// # sandbox — the sandbox state machine of the foundry (root layer, pure
// logic). The foundry is the machine room of the family: every sandbox
// answers on a three-state ladder — cold (built, not booted), warm (booted,
// keeping its working set) and hot (executing work) — with pure, guarded
// transitions between the states. The rehearsal herd is deterministic from
// one integer seed (mulberry32); the transitions refuse what the machine
// does not do (a cold sandbox cannot execute, a hot one cannot boot twice),
// and every refusal is an honest string. This module is the testable core
// of the /sandboxes page.
//
// wave 3, the engine ownership law: the state machine itself (the ladder,
// the transition table, the guards and the refusal vocabulary) answers
// from the saddle owner through the published library specifier
// ("@wenathlan/saddle/sandbox") — the machine is never duplicated inside
// the app. the foundry keeps the page-model projection: the sandbox
// record, the herd, the census and the boot/step bookkeeping the machine
// drives.

/** the three states of the sandbox machine (the ladder the saddle engine owns). */
export type SandboxState = SandboxLifecycleState;

/** the state ladder in machine order (the ladder the saddle engine owns). */
export const SANDBOX_STATES: readonly SandboxState[] = SANDBOX_LIFECYCLE_STATES;

/** one sandbox of the herd. */
export interface Sandbox {
  /** the stable id of the sandbox */
  id: string;
  /** the display name of the sandbox */
  name: string;
  /** the machine state (cold / warm / hot) */
  state: SandboxState;
  /** the image the sandbox booted from (its herd format rides along) */
  image: string;
  /** the boot count of this working set */
  boots: number;
  /** the executed step count since the last cold build */
  steps: number;
}

/** the machine the saddle engine owns (the ladder, the transition table,
 * the guards canTransition/refusalFor and the action guard table), bound
 * to the foundry surface — wave 3, the engine ownership law. */
export { canTransition, refusalFor };

/** the action names of the machine, one per transition (the vocabulary the
 * saddle engine owns — wave 3). */
export type SandboxAction = SandboxLifecycleAction;

/** drives one action against one sandbox: returns the next sandbox and an
 * honest refusal when the machine does not allow the move. Pure — the
 * input never mutates. */
export function drive(sandbox: Sandbox, action: SandboxAction): { sandbox: Sandbox; refusal?: string } {
  const to = SANDBOX_LIFECYCLE_ACTION_TARGETS[action];
  if (!canTransition(sandbox.state, to)) {
    return { sandbox, refusal: refusalFor(sandbox.state, to) };
  }
  if (action === "warm") {
    return { sandbox: { ...sandbox, state: "warm", boots: sandbox.boots + 1, steps: 0 } };
  }
  if (action === "heat") {
    return { sandbox: { ...sandbox, state: "hot" } };
  }
  if (action === "cool") {
    // cool keeps the booted working set (the fast path back to warm)
    return { sandbox: { ...sandbox, state: "warm" } };
  }
  // freeze: the working set is torn down, the sandbox goes cold
  return { sandbox: { ...sandbox, state: "cold", boots: 0, steps: 0 } };
}

/** records one executed step on a hot sandbox; refuses on anything colder. */
export function step(sandbox: Sandbox): { sandbox: Sandbox; refusal?: string } {
  if (sandbox.state !== "hot") {
    return { sandbox, refusal: "only a hot sandbox executes steps — heat it first" };
  }
  return { sandbox: { ...sandbox, steps: sandbox.steps + 1 } };
}

/** the images the herd boots from (the real clone formats of the family). */
const HERD_IMAGES: readonly string[] = [
  "base.tzst",
  "toolchain.tzst",
  "runtime.tar.gz",
  "release.tar.xz",
  "pack.tzst",
] as const;

/** the rehearsal herd of the machine room: deterministic from the seed —
 * the same seed always herds the same sandboxes (the surface says the herd
 * is a seeded rehearsal, never a live claim). */
export function seedHerd(seed: number, count = 7): Sandbox[] {
  const rand = mulberry32(seed);
  const herd: Sandbox[] = [];
  for (let i = 0; i < count; i++) {
    const stateRoll = rand();
    const state: SandboxState = stateRoll < 0.4 ? "cold" : stateRoll < 0.75 ? "warm" : "hot";
    herd.push({
      id: `fdy-${(seed >>> 0).toString(36)}-${String(i + 1).padStart(2, "0")}`,
      name: `sandbox-${String(i + 1).padStart(2, "0")}`,
      state,
      image: HERD_IMAGES[Math.floor(rand() * HERD_IMAGES.length)] as string,
      boots: state === "cold" ? 0 : Math.floor(rand() * 6) + 1,
      steps: state === "hot" ? Math.floor(rand() * 40) + 1 : 0,
    });
  }
  return herd;
}

/** the herd census the /sandboxes page shows: counts per state and the
 * share of the herd keeping a warm working set. */
export interface HerdCensus {
  total: number;
  byState: Readonly<Record<SandboxState, number>>;
  warmShare: number;
}

/** summarizes the herd: the state histogram plus the warm share. */
export function herdCensus(herd: readonly Sandbox[]): HerdCensus {
  const byState: Record<SandboxState, number> = { cold: 0, warm: 0, hot: 0 };
  for (const sandbox of herd) byState[sandbox.state] += 1;
  return {
    total: herd.length,
    byState,
    warmShare: herd.length === 0 ? 0 : (byState.warm + byState.hot) / herd.length,
  };
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: sandboxmodality.ts — the workload lane declaration.            */
/* (consolidation note: zero imports rode this wave — the body lands       */
/* verbatim. wave W5 later moved the seat engine — the resolver, the env   */
/* reader and the lane lookup ride the saddle factory through the one      */
/* owner import at the top of this seat; the foundry data stays.)          */
/* ══════════════════════════════════════════════════════════════════════ */

// # sandboxmodality — the workload lane declaration of the foundry
// application (root layer, wave WL1): the lanes this app owns in the
// family workload catalog, mirrored from the engine of record
// (saddle/workloadlaw.ts — the FAMILYLANES table) as the string contract
// the deploy and the platform speak. The mirror law (the same discipline
// the devthink modalities vendor rides): the rows are mirrored, not
// imported, because the published saddle envelope the container build
// installs does not carry the workload law yet and the family law bars a
// relative path across apps — the day the envelope publishes, the ids
// answer the same strings (the lockstep is the string contract, not the
// import). The app battery pins the mirror against the engine source
// through the library bridge so the vendor can never drift in silence.
//
// The seat law (the deploy's opt-in, the family's shared shape): the
// deploy pins FOUNDRY_SANDBOX_LANE — "local" (the default, the deploy's own process),
// "join" (the platform resolves every lane through the engine's join
// resolver — the nuclear modality law: the workload never names a
// modality, the join answers), or a modality id the deploy pins for the
// app's lanes (named here, validated by the platform's join at dispatch —
// this module never judges engine vocabulary, so the mirror cannot drift
// when the registry grows). The module never spawns anything and resolves
// no join: it names the lanes' truth; the platform resolves the sandbox.
// Zero consumer data; the lane seat engine rides the owner's factory
// (the one owner import at the top of this seat) and nothing else
// enters.
//
// The engine seat (wave W5, the dedup law): the seat resolver, the env
// reader and the lane lookup no longer live in this section — they ride
// the saddle factory (laneseating of ../saddle/workloadlaw.ts, the
// owner's workload law) bound once to this app's own data, re-exported
// under the same names the surface always spoke. The rows stay mirrored
// (the drift pin the battery wants), only the engine moved: zero
// behavior change, zero public-surface change.

/** one mirrored workload lane row — the same five keys the engine law pins
 * (app, lane, role, demand, today); the shape itself rides the owner's
 * law now (wave W5 — saddle/workloadlaw.ts answers the type once),
 * re-exported under the historical surface name. */
export type { AppWorkloadLane };

/** the app slug every mirrored row carries. */
export const APPSLUG = "foundry";

/** the workload lanes this app owns — the mirror of the engine catalog
 * rows (saddle/workloadlaw.ts, the FAMILYLANES table; the battery pins
 * the two surfaces equal). */
export const WORKLOADLANES: readonly AppWorkloadLane[] = Object.freeze([
  {
    app: "foundry",
    lane: "pipeline-graph",
    role: "the pipeline graph lane: provision, pull, run, collect and store — the plan walk the herd drives",
    demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 },
    today: "app-lane",
  },
  {
    app: "foundry",
    lane: "image-artifact",
    role: "the image artifact lane: the format plans, the checksum seals and the shelf records the vault stores",
    demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 },
    today: "app-lane",
  },
]);

/** the environment name the deploy pins the sandbox lane seat through
 * (the opt-in seat — documented in the env example, zero hardcode). */
export const SANDBOXLANEENV = "FOUNDRY_SANDBOX_LANE";

/** the typed answer of the seat: the declaration the deploy reads —
 * local (the lanes run in the deploy's own process), join (the platform
 * resolves every lane through the engine's join resolver), or the pinned
 * modality id the deploy named (validated by the platform's join at
 * dispatch, never judged here). every answer is honest: an absent or
 * blank choice answers the declared default, never a silent switch. */
export type { LaneSeatResult };

/** the lane seat engine of this app — the saddle factory bound once to
 * this app's own data (the dedup law: the engine lives in the owner, the
 * app keeps its data), the seats re-exported below under the names the
 * surface always spoke. */
const seating = laneseating({ slug: APPSLUG, envvar: SANDBOXLANEENV, lanes: WORKLOADLANES });

/**
 * Resolves the sandbox lane seat of this application — the deploy's
 * opt-in: an absent or blank choice answers the declared default ("local"
 * — the lanes run in the deploy's own process); "join" opts every lane
 * onto the platform's join resolver (the nuclear modality law); any other
 * non-empty choice is the modality id the deploy pins for the lanes
 * (named by the deploy, validated by the platform's join at dispatch —
 * this module never judges engine vocabulary, so the mirror cannot drift
 * when the registry grows).
 *
 * @param choice the deploy's choice (the env value or the config row).
 * @returns the seat declaration.
 */
export const lanesandbox = seating.lanesandbox;

/**
 * Reads the lane seat off one environment lookup — the deploy pins
 * FOUNDRY_SANDBOX_LANE (opt-in per deploy); the lookup is injected so the server lane
 * hands process.env and any other lane hands its own seat. this module
 * never spawns anything: it names the truth the platform resolves.
 *
 * @param lookup the environment lookup function (the env carrier).
 * @returns the seat declaration.
 */
export const lanesandboxfromenv = seating.lanesandboxfromenv;

/**
 * Answers one mirrored lane row by lane id — the lookup the app surfaces
 * and the batteries read.
 *
 * @param lane the lane id inside the app.
 * @returns the mirrored row, or undefined when the app carries no such
 * lane.
 */
export const laneof = seating.laneof;
