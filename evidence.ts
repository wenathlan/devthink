/** The evidence module of the 1.1.90 consolidation: every correlated variation of the capture forensics and the run comparison logic interned in this one file, so the module family carries one surface without duplicate variations. */

/* ── Merged from forensics.ts: the 1.1.90 consolidation interns the correlated forensics logic here, so no variation of the same file lives beside another. ── */
import type {
  beforeafterpair,
  capturebundle,
  capturenamerule,
  consoletraceentry,
  diffbaserecord,
  diffresult,
  nettraceentry,
  ocrregion,
  outputcomparesession,
  provlogentry,
  runlogentry,
  timelapseconfig,
  timelapseframe,
  thumbnailrecord,
} from "./types.js";
import { randomid } from "./memory.js";

/**
 * Capture forensics logic of the 1.1.78 family.
 * Every correlated rule for recording what a run changed lives in this one module: the beforeafter pairing that captures the page state around every action step, skips the pre capture for read only steps because a page a read never changed needs no before state, and links both captures to the stepid they wrap; the consoletimeline that collects the console entries in capture order, attaches the stepid active at each entry, preserves the run wide sequence numbers across page reloads and classifies errors, warnings and logs by level; the nettimeline that collects the request and response trace entries, attaches each entry to the step running at its timestamp and joins the request and response sides through the correlateids map of the run; the diffbase baseline that freezes one stored screenshot for one page state under the user configured threshold; the diffshot comparison that runs a new capture against its baseline through the pixel diff seam, computes the changed regions by pixel blocks, reports the similarity score and flags the visual regression only above the user threshold; the thumbshot sizing that keeps a configurable maximum edge; the timelapse that captures a changing page on the user interval, stops on the plan completion or the user stop and assembles its frames into an ordered sequence; the namecaptures naming that builds the lowercase file names from the plan, step and timestamp parts and keeps them unique per run with a counter; and the exportcaptures bundling that assembles the captures, the timelines, the diffs, the thumbnails and the lapse frames into one export payload with the provlog provenance of every capture, because a bundle without provenance never leaves the device.
 * The module extends the reviewed families instead of duplicating them: the capture rectangle grammar rides the ocrregion shape the vision family already reads, the correlation joining composes the correlateids map the web api family of the 1.1.76 release already assigns, the console levels and sources reuse the loglevel and timelinesource grammars the run timeline family serves, and the naming carries the capturename grammar of the files family forward into the lowercase identifier rule.
 * Every impure move stays behind an injected seam — the pixel diff and the capture grab resolve through functions the executor wires — while every threshold, interval, edge, retention and duration stays the user's with no code default: an absent value never hides a hardcoded ceiling, an absent diff threshold never flags a regression, an absent thumbnail edge never rescales a capture, and no forensic path ever bypasses a review.
 */

/** Pixel diff seam: one baseline image and one capture image with the reviewed block grid resolve to the image size and the per block changed pixel fractions in row major order; the extension executor wires the capture canvas pixel walk, tests wire plain fixtures. */
export type pixeldiff = (
  baseline: string,
  capture: string,
  grid: { cols: number; rows: number },
) => Promise<{ width: number; height: number; blocks: number[] }>;

/** Capture grab seam: one live tab resolves to the grabbed capture with its id, bytes, size and capture time; the extension executor wires the tab capture, tests wire plain fixtures. */
export type capturegrab = () => Promise<{ id: string; bytes: string; width: number; height: number; at: number }>;

/** The forensic kinds of the 1.1.78 family, listed among the available capabilities of every proposal request. */
export const forensickinds: string[] = [
  "beforeafter",
  "consoletimeline",
  "nettimeline",
  "diffbase",
  "diffshot",
  "thumbshot",
  "timelapse",
  "namecaptures",
  "exportcaptures",
];

/**
 * Builds the beforeafter pair around one action step: a sensitive or interactive step captures the pre state and the post state, both linked to the stepid the pair wraps, while a read only step skips the pre capture because a page a read never changed needs no before state; the pair records the step kind and the heartbeat beat so the forensic view names what changed the page and which beat window the pair landed under.
 */
export function beforeafter(input: {
  runid: string;
  stepid: string;
  stepkind: string;
  risk: string;
  pre?: { id: string; at: number };
  post?: { id: string; at: number };
  beat?: number;
  now: number;
  id?: string;
}): { pair: beforeafterpair; skipped?: "precapture" | "postcapture"; reason: string } {
  if (input.runid.trim() === "")
    throw new Error("The beforeafter pair names its run; an unnamespaced pair answers no run.");
  if (input.stepid.trim() === "")
    throw new Error("The beforeafter pair names its step; the captures link to the stepid they wrap.");
  const readonly = input.risk === "read";
  const pair: beforeafterpair = {
    id: input.id ?? randomid(),
    runid: input.runid,
    stepid: input.stepid,
    ...(input.risk !== "read" && input.pre !== undefined ? { precaptureid: input.pre.id } : {}),
    ...(input.post !== undefined ? { postcaptureid: input.post.id } : {}),
    stepkind: input.stepkind,
    ...(input.beat !== undefined ? { beat: input.beat } : {}),
    at: input.now,
  };
  if (readonly && input.pre === undefined && input.post !== undefined)
    return {
      pair,
      skipped: "precapture",
      reason: `The read only ${input.stepkind} step skips its pre capture because a page a read never changed needs no before state; the post capture ${input.post.id} still answers what the step saw.`,
    };
  if (input.pre === undefined && input.post === undefined)
    return {
      pair,
      skipped: "postcapture",
      reason: `The ${input.stepkind} step captured neither state; the pair records the gap so the forensic view names it instead of inventing a capture.`,
    };
  return {
    pair,
    reason: `The ${input.stepkind} step paired its ${pair.precaptureid !== undefined ? "pre and post" : "post"} capture${pair.precaptureid !== undefined && pair.postcaptureid !== undefined ? "s" : ""} under the step ${input.stepid} of the run ${input.runid}.`,
  };
}

/**
 * Collects the console entries of one run into the forensic timeline: the entries sort into capture order, each entry attaches the stepid active at its timestamp, the run wide sequence numbers climb across page reloads so a reload never resets the ordering, and the level classification keeps errors, warnings and logs apart by the loglevel grammar.
 */
export function consoletimeline(input: {
  runid: string;
  entries: Array<{ level?: string; text: string; source?: string; at: number; reload?: number }>;
  steps: Array<{ id: string; startedat: number; endedat?: number }>;
  beat?: number;
  startsequence?: number;
  now: number;
}): consoletraceentry[] {
  if (input.runid.trim() === "")
    throw new Error("The console timeline names its run; an unnamespaced timeline answers no run.");
  const ordered = [...input.entries].sort((one, two) => one.at - two.at || (one.reload ?? 0) - (two.reload ?? 0));
  return ordered.map((entry, index) => {
    const level = islevel(entry.level) ? entry.level : "log";
    const source = issource(entry.source) ? entry.source : "console";
    const active =
      input.steps.find(
        (step) => entry.at >= step.startedat && (step.endedat === undefined || entry.at <= step.endedat),
      ) ??
      input.steps.filter((step) => step.startedat <= entry.at).sort((one, two) => two.startedat - one.startedat)[0];
    return {
      id: randomid(),
      runid: input.runid,
      stepid: active?.id ?? "",
      level,
      text: entry.text,
      source,
      sequence: (input.startsequence ?? 0) + index + 1,
      ...(entry.reload !== undefined && entry.reload > 0 ? { reload: entry.reload } : {}),
      ...(input.beat !== undefined ? { beat: input.beat } : {}),
      at: entry.at,
    };
  });
}

/**
 * Collects the request and response trace entries of one run into the forensic net timeline: each entry attaches to the step running at its timestamp, the correlation map of the run joins the request and its response through the shared correlation id — the correlateids grammar of the 1.1.76 family — and a request without its pair stays unjoined so the gap names itself instead of inventing a status.
 */
export function nettimeline(input: {
  runid: string;
  entries: Array<{
    url: string;
    method: string;
    status?: number;
    at: number;
    correlationid?: string;
    requestid?: string;
  }>;
  steps: Array<{ id: string; startedat: number; endedat?: number }>;
  correlations: Array<{ requestid: string; correlationid: string; responseid?: string; status?: number }>;
  beat?: number;
}): nettraceentry[] {
  if (input.runid.trim() === "")
    throw new Error("The net timeline names its run; an unnamespaced timeline answers no run.");
  const ordered = [...input.entries].sort((one, two) => one.at - two.at);
  return ordered.map((entry) => {
    const joined = input.correlations.find(
      (correlation) =>
        correlation.correlationid === entry.correlationid ||
        (entry.requestid !== undefined && correlation.requestid === entry.requestid),
    );
    const status = entry.status ?? joined?.status ?? 0;
    const active =
      input.steps.find(
        (step) => entry.at >= step.startedat && (step.endedat === undefined || entry.at <= step.endedat),
      ) ??
      input.steps.filter((step) => step.startedat <= entry.at).sort((one, two) => two.startedat - one.startedat)[0];
    return {
      id: randomid(),
      runid: input.runid,
      stepid: active?.id ?? "",
      url: entry.url,
      method: entry.method,
      status,
      correlationid: entry.correlationid ?? joined?.correlationid ?? "",
      ...(joined?.responseid !== undefined ? { paired: true } : {}),
      ...(input.beat !== undefined ? { beat: input.beat } : {}),
      at: entry.at,
    };
  });
}

/**
 * Stores one diff baseline for a page state: the baseline freezes the stored capture under its page state label and the user configured similarity threshold; the threshold rides the user choice with no code default so an absent value never flags a regression on its own.
 */
export function diffbase(input: {
  runid: string;
  captureid: string;
  pagestate: string;
  threshold?: number;
  beat?: number;
  now: number;
  id?: string;
}): diffbaserecord {
  if (input.runid.trim() === "")
    throw new Error("The diff baseline names its run; an unnamespaced baseline answers no run.");
  if (input.captureid.trim() === "")
    throw new Error("The diff baseline names its stored capture; a baseline without pixels flags nothing honestly.");
  if (input.pagestate.trim() === "")
    throw new Error("The diff baseline names its page state; the label answers which page the baseline froze.");
  if (input.threshold !== undefined && !(input.threshold >= 0 && input.threshold <= 1))
    throw new Error(
      "The diff threshold stays a similarity score between zero and one when configured; the bound never defaults in code.",
    );
  return {
    id: input.id ?? randomid(),
    runid: input.runid,
    captureid: input.captureid,
    pagestate: input.pagestate,
    ...(input.threshold !== undefined ? { threshold: input.threshold } : {}),
    ...(input.beat !== undefined ? { beat: input.beat } : {}),
    at: input.now,
  };
}

/**
 * Compares one new capture against its diff baseline through the pixel diff seam: the seam walks the two images block by block over the reviewed grid, the changed blocks merge into region rectangles in css pixels, the similarity score reports the agreeing block fraction between zero and one, and the visual regression flag answers the user threshold alone — an absent threshold never flags because the bound stays the user's choice with no code default.
 */
export async function diffshot(input: {
  baseline: diffbaserecord;
  capture: { id: string; bytes: string; width: number; height: number };
  diff: pixeldiff;
  blocks?: { cols: number; rows: number };
  stepid?: string;
  beat?: number;
  now: number;
  id?: string;
}): Promise<diffresult & { summary: string }> {
  if (input.capture.id.trim() === "")
    throw new Error("The diffshot comparison names its capture; a capture without pixels compares nothing.");
  const grid =
    input.blocks !== undefined
      ? input.blocks
      : {
          cols: Math.max(1, Math.min(12, Math.round(input.capture.width / 64) || 1)),
          rows: Math.max(1, Math.min(12, Math.round(input.capture.height / 64) || 1)),
        };
  if (!(grid.cols >= 1 && grid.rows >= 1))
    throw new Error("The diff grid needs at least one block column and row; the comparison reads real blocks only.");
  const walked = await input.diff(input.baseline.captureid, input.capture.bytes, grid);
  if (walked.blocks.length !== grid.cols * grid.rows)
    throw new Error(
      `The pixel diff seam returned ${walked.blocks.length} block fractions for the reviewed ${grid.cols} by ${grid.rows} grid; the comparison reads exactly the reviewed blocks.`,
    );
  const changedblocks = walked.blocks
    .map((fraction, index) => ({ index, fraction }))
    .filter((block) => block.fraction > 0);
  const regions: ocrregion[] = [];
  for (const block of changedblocks) {
    const column = block.index % grid.cols;
    const row = Math.floor(block.index / grid.cols);
    const width = Math.max(1, Math.round(walked.width / grid.cols));
    const height = Math.max(1, Math.round(walked.height / grid.rows));
    const region: ocrregion = { x: column * width, y: row * height, width, height };
    const previous = regions[regions.length - 1];
    if (previous !== undefined && previous.y === region.y && previous.x + previous.width === region.x)
      previous.width += region.width;
    else regions.push(region);
  }
  const score = walked.blocks.length > 0 ? 1 - changedblocks.length / walked.blocks.length : 1;
  const rounded = Math.round(score * 10000) / 10000;
  const threshold = input.baseline.threshold;
  const regression = threshold !== undefined && rounded < threshold;
  const result: diffresult = {
    id: input.id ?? randomid(),
    runid: input.baseline.runid,
    stepid: input.stepid ?? "",
    baselineid: input.baseline.id,
    captureid: input.capture.id,
    regions,
    score: rounded,
    regression,
    ...(input.beat !== undefined ? { beat: input.beat } : {}),
    at: input.now,
  };
  return {
    ...result,
    summary: `The capture ${input.capture.id} scores ${rounded} against the baseline ${input.baseline.id} of ${input.baseline.pagestate} with ${regions.length} changed region${regions.length === 1 ? "" : "s"}${threshold !== undefined ? ` under the user threshold ${threshold}` : " with no user threshold configured so no regression flags"}; ${regression ? "the visual regression flags" : "the comparison stays inside the reviewed bound"}.`,
  };
}

/**
 * Sizes one thumbnail for the capture log: the user configured maximum edge scales the capture while the aspect ratio holds, the longer edge lands exactly on the reviewed bound, and an absent edge keeps the thumbnail at its capture size because the bound never defaults in code.
 */
export function thumbshot(input: {
  runid: string;
  capture: { id: string; width: number; height: number };
  edge?: number;
  now: number;
  id?: string;
}): { thumb: thumbnailrecord; width: number; height: number; scale: number; reason: string } {
  if (input.runid.trim() === "")
    throw new Error("The thumbnail names its run; an unnamespaced thumbnail answers no run.");
  if (input.capture.id.trim() === "")
    throw new Error("The thumbnail names its capture; a thumbnail without its source links to nothing.");
  if (input.edge !== undefined && !(input.edge >= 1))
    throw new Error(
      "The thumbnail edge stays a positive number of pixels when configured; the bound never defaults in code.",
    );
  const source = {
    width: input.capture.width > 0 ? input.capture.width : 1,
    height: input.capture.height > 0 ? input.capture.height : 1,
  };
  const scale = input.edge === undefined ? 1 : Math.min(1, input.edge / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const thumb: thumbnailrecord = {
    id: input.id ?? randomid(),
    runid: input.runid,
    captureid: input.capture.id,
    width,
    height,
    at: input.now,
  };
  return {
    thumb,
    width,
    height,
    scale,
    reason:
      input.edge === undefined
        ? `The thumbnail of ${input.capture.id} keeps its capture size ${source.width} by ${source.height} because no user edge is configured; the bound never defaults in code.`
        : `The thumbnail of ${input.capture.id} scales to ${width} by ${height} inside the user edge ${input.edge}; the aspect ratio holds.`,
  };
}

/**
 * Plans one timelapse from the user reviewed interval and duration: the frames capture at startedat + k times the interval while they sit inside the duration, the lapse stops on the plan completion or the user stop — a stop before the end clamps the frame list — and every bound stays the user's with no code floor, so a missing interval leaves the lapse to the explicit user start.
 */
export function timelapse(input: {
  runid: string;
  interval: number;
  duration: number;
  startedat: number;
  stoppedat?: number;
}): { config: timelapseconfig; frames: number; stopsat: number; reason: string } {
  if (input.runid.trim() === "") throw new Error("The timelapse names its run; an unnamespaced lapse answers no run.");
  if (!(input.interval > 0))
    throw new Error(
      "The timelapse interval stays a positive number of milliseconds the user chose; the interval carries no code floor.",
    );
  if (!(input.duration >= 0))
    throw new Error(
      "The timelapse duration stays zero or a positive number of milliseconds the user chose; the duration never defaults in code.",
    );
  const stopsat =
    input.stoppedat !== undefined
      ? Math.min(input.startedat + input.duration, input.stoppedat)
      : input.startedat + input.duration;
  const span = Math.max(0, stopsat - input.startedat);
  const frames = Math.floor(span / input.interval) + 1;
  const config: timelapseconfig = {
    runid: input.runid,
    interval: input.interval,
    duration: input.duration,
    startedat: input.startedat,
    state: input.stoppedat !== undefined || span < input.duration ? "stopped" : "running",
    ...(input.stoppedat !== undefined ? { stoppedat: input.stoppedat } : {}),
  };
  return {
    config,
    frames,
    stopsat,
    reason: `The timelapse of the run ${input.runid} captures ${frames} frame${frames === 1 ? "" : "s"} every ${input.interval} milliseconds across ${span} milliseconds${input.stoppedat !== undefined ? " and stopped on the user stop" : ""}; the plan completion or the user stop closes the lapse.`,
  };
}

/**
 * Assembles the lapse frames into the ordered sequence the playback reads: the frames sort by their sequence numbers so a late stored frame lands in its place, and a duplicate sequence keeps the newest capture because one frame slot answers one capture.
 */
export function assemblelapse(frames: timelapseframe[]): timelapseframe[] {
  const ordered = [...frames].sort((one, two) => one.sequence - two.sequence);
  const slots = new Map<number, timelapseframe>();
  for (const frame of ordered) slots.set(frame.sequence, frame);
  return [...slots.values()].sort((one, two) => one.sequence - two.sequence);
}

/**
 * Builds the capture file names from the reviewed naming rule: the lowercase pattern stamps the {plan}, {step}, {timestamp} and {sequence} parts, every name folds into the lowercase identifier rule, and a name that already sits inside the run bumps its counter suffix so the names stay unique per run.
 */
export function namecaptures(input: {
  rule: capturenamerule;
  parts: Array<{ plan: string; step: string; timestamp: number; sequence: number }>;
  taken?: string[];
}): { names: string[]; taken: string[]; reason: string } {
  if (input.rule.pattern.trim() === "")
    throw new Error("The capture naming rule carries its lowercase pattern; an empty pattern names no file.");
  if (input.rule.parts.length === 0)
    throw new Error("The capture naming rule lists its parts; a pattern without parts stamps nothing.");
  const known = new Set(input.taken ?? []);
  const names: string[] = [];
  for (const part of input.parts) {
    const base = input.rule.pattern
      .replace(/\{plan\}/g, lowercaseid(part.plan))
      .replace(/\{step\}/g, lowercaseid(part.step))
      .replace(/\{timestamp\}/g, String(part.timestamp))
      .replace(/\{sequence\}/g, String(part.sequence))
      .toLowerCase()
      .replace(/[^a-z0-9\-]+/g, "-");
    /* the dash trim walks a single linear scan: a polynomial dash expression over library input answers attacker paced backtracking, and the name rule feeds the pattern the parts carry */
    const stamped = trimdashes(base);
    let name = stamped === "" ? `capture-${part.sequence}` : stamped;
    let counter = 2;
    while (known.has(name)) {
      name = `${stamped}-${counter}`;
      counter += 1;
    }
    known.add(name);
    names.push(name);
  }
  return {
    names,
    taken: [...known],
    reason: `The naming rule stamped ${names.length} lowercase name${names.length === 1 ? "" : "s"} from the ${input.rule.parts.join(", ")} parts; a repeated name bumps its counter so the names stay unique per run.`,
  };
}

/**
 * Assembles the export bundle of the forensic surface: the captures, their beforeafter pairs, the console and net timeline counts, the diff results, the thumbnails and the lapse frames bundle under their capture names, and every capture must carry its provlog provenance entry — a payload without provenance entries refuses loudly because an export that cannot answer where its captures came from never leaves the device.
 */
export function exportcaptures(input: {
  runid: string;
  captures: string[];
  pairs: string[];
  consoleentries: number;
  netentries: number;
  diffs: string[];
  thumbnails: string[];
  lapses: string[];
  names: Array<{ captureid: string; name: string }>;
  provlog: provlogentry[];
  masked: boolean;
  now: number;
  id?: string;
}): capturebundle {
  if (input.runid.trim() === "")
    throw new Error("The capture bundle names its run; an unnamespaced bundle answers no run.");
  const covered = new Set(input.provlog.flatMap((entry) => entry.rowkeys));
  const missing = input.captures.filter((captureid) => !covered.has(captureid));
  if (input.captures.length > 0 && (input.provlog.length === 0 || missing.length > 0))
    throw new Error(
      `The capture bundle of the run ${input.runid} carries ${input.captures.length} capture${input.captures.length === 1 ? "" : "s"} but the provlog provenance covers ${input.captures.length - missing.length} of them${missing.length > 0 ? ` (missing: ${missing.slice(0, 3).join(", ")})` : ""}; an export payload without provenance entries never leaves the device.`,
    );
  if (!input.masked)
    throw new Error(
      "The capture bundle assembles only after the redactshot masks ran over its captures; an unmasked capture never exports.",
    );
  return {
    id: input.id ?? randomid(),
    runid: input.runid,
    captures: input.captures,
    pairs: input.pairs,
    consoleentries: input.consoleentries,
    netentries: input.netentries,
    diffs: input.diffs,
    thumbnails: input.thumbnails,
    lapses: input.lapses,
    names: input.names,
    provenance: input.provlog.map((entry) => entry.id),
    masked: input.masked,
    at: input.now,
  };
}

/** Reads the loglevel grammar of the run timeline family so the console timeline classifies by the reviewed levels only. */
function islevel(value: unknown): value is consoletraceentry["level"] {
  return (
    value === "error" ||
    value === "warn" ||
    value === "info" ||
    value === "log" ||
    value === "debug" ||
    value === "trace"
  );
}

/** Reads the timelinesource grammar of the run timeline family so the console timeline names its sources from the reviewed set only. */
function issource(value: unknown): value is consoletraceentry["source"] {
  return (
    value === "console" ||
    value === "error" ||
    value === "rejection" ||
    value === "resource" ||
    value === "longtask" ||
    value === "network" ||
    value === "cdp"
  );
}

/** Trims the leading and trailing dashes of one identifier part with a single linear scan, because a polynomial dash expression over library input answers attacker paced backtracking. */
function trimdashes(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && value.charCodeAt(start) === 45) start += 1;
  while (end > start && value.charCodeAt(end - 1) === 45) end -= 1;
  return value.slice(start, end);
}

/** Folds one naming part into the lowercase identifier rule the capture filenames follow. */
function lowercaseid(value: string): string {
  return trimdashes(value.toLowerCase().replace(/[^a-z0-9\-]+/g, "-"));
}

/* ── Merged from outputcompare.ts: the 1.1.90 consolidation interns the correlated outputcompare logic here, so no variation of the same file lives beside another. ── */
/**
 * Outputcompare logic of the 1.1.66 family.
 * Two competing runs stand beside each other here: the join pairs the runs on their step sequence, each pair grades its agreement, divergence and duration delta, the first divergent step highlights, and the metric set the session used records in the audit trail.
 * The comparison never executes a step and never reads the page: it joins the stored runlog outcomes only, so an outputcompare session touches no browser state.
 */

/** Reads the task input signature of one run: the objective digest proxy over its step kinds and step count that two comparable runs must share. */
export function taskinputsignatureof(input: { objective: string; steps: string[] }): string {
  return `${input.objective.trim()}|${input.steps.length}|${input.steps.join(",")}`;
}

/** Reads the default metric set of one comparison session: agreement, divergence and the duration delta of every step pair. */
export function comparemetricdefaults(): string[] {
  return ["agreement", "divergence", "durationdelta"];
}

/** Joins the runlogs of two runs on their step sequence: the pairs walk the shared step ids in order while a step only one run carries grades as onlyone. */
export function joinruns(
  logsa: runlogentry[],
  logsb: runlogentry[],
): Array<{ stepid: string; index: number; a?: runlogentry; b?: runlogentry }> {
  const sequence: string[] = [];
  for (const entry of logsa) if (!sequence.includes(entry.stepid)) sequence.push(entry.stepid);
  for (const entry of logsb) if (!sequence.includes(entry.stepid)) sequence.push(entry.stepid);
  return sequence.map((stepid, index) => {
    const a = logsa.find((entry) => entry.stepid === stepid);
    const b = logsb.find((entry) => entry.stepid === stepid);
    return { stepid, index, ...(a !== undefined ? { a } : {}), ...(b !== undefined ? { b } : {}) };
  });
}

/** Grades one joined step pair: the pair agrees when both runs completed the step with the same state, diverges when their states or summaries differ and onlyone marks a step one run lacks. */
export function stepcomparisonof(pair: { stepid: string; index: number; a?: runlogentry; b?: runlogentry }): {
  stepid: string;
  index: number;
  agreement: "agree" | "diverge" | "onlyone";
  summarya: string;
  summaryb: string;
  durationdelta: number;
} {
  const a = pair.a;
  const b = pair.b;
  if (a === undefined || b === undefined)
    return {
      stepid: pair.stepid,
      index: pair.index,
      agreement: "onlyone",
      summarya: a?.summary ?? "",
      summaryb: b?.summary ?? "",
      durationdelta: 0,
    };
  const agree = a.state === b.state && a.summary === b.summary;
  return {
    stepid: pair.stepid,
    index: pair.index,
    agreement: agree ? "agree" : "diverge",
    summarya: a.summary,
    summaryb: b.summary,
    durationdelta: a.duration - b.duration,
  };
}

/** Reads the first divergent step of one comparison; an absent index marks agreement across the whole sequence. */
export function firstdivergenceof(
  steps: Array<{ stepid: string; index: number; agreement: "agree" | "diverge" | "onlyone" }>,
): number | undefined {
  const divergent = steps.find((step) => step.agreement !== "agree");
  return divergent === undefined ? undefined : divergent.index;
}

/** Builds one outputcompare session of two runs that share a task input signature: the join, the per step grades and the metric set the session used. */
export function outputcomparesessionof(input: {
  runids: [string, string];
  logsa: runlogentry[];
  logsb: runlogentry[];
  metrics?: string[];
  now: number;
}): outputcomparesession {
  if (input.runids[0].trim() === "" || input.runids[1].trim() === "")
    throw new Error("The outputcompare session needs both run ids.");
  if (input.runids[0] === input.runids[1])
    throw new Error("The outputcompare session compares two distinct runs; one run never stands beside itself.");
  const metrics = input.metrics ?? comparemetricdefaults();
  const steps = joinruns(input.logsa, input.logsb).map((pair) => stepcomparisonof(pair));
  const firstdivergence = firstdivergenceof(steps);
  return {
    id: `compare:${input.runids[0]}:${input.runids[1]}:${input.now}`,
    runids: input.runids,
    metrics,
    steps,
    ...(firstdivergence !== undefined ? { firstdivergence } : {}),
    openedat: input.now,
  };
}

/** Reads the metric summary of one comparison session for the audit trail: the metric set beside the agree, diverge and onlyone counts and the first divergence. */
export function comparesessionmetrics(session: outputcomparesession): {
  metrics: string[];
  agree: number;
  diverge: number;
  onlyone: number;
  firstdivergence?: number;
  reason: string;
} {
  const agree = session.steps.filter((step) => step.agreement === "agree").length;
  const diverge = session.steps.filter((step) => step.agreement === "diverge").length;
  const onlyone = session.steps.filter((step) => step.agreement === "onlyone").length;
  return {
    metrics: session.metrics,
    agree,
    diverge,
    onlyone,
    ...(session.firstdivergence !== undefined ? { firstdivergence: session.firstdivergence } : {}),
    reason: `The comparison of ${session.runids[0]} and ${session.runids[1]} graded ${agree} agreeing, ${diverge} divergent and ${onlyone} single run step${agree + diverge + onlyone === 1 ? "" : "s"} under the metric set ${session.metrics.join(", ")}${session.firstdivergence !== undefined ? ` with the first divergence at step index ${session.firstdivergence}` : " with agreement across the whole sequence"}.`,
  };
}

/** Reads the side by side view of one comparison session: one row per joined step with both summaries and the duration delta beside the divergence highlight. */
export function outputcompareview(
  session: outputcomparesession,
): Array<{
  stepid: string;
  index: number;
  agreement: string;
  summarya: string;
  summaryb: string;
  durationdelta: number;
  highlighted: boolean;
}> {
  return session.steps.map((step) => ({
    stepid: step.stepid,
    index: step.index,
    agreement: step.agreement,
    summarya: step.summarya,
    summaryb: step.summaryb,
    durationdelta: step.durationdelta,
    highlighted: session.firstdivergence !== undefined && step.index === session.firstdivergence,
  }));
}
