// # take — the take domain of the katexis engine, consolidated: the three
// take*.ts leaves of the root (the event scheduler the browser transport
// and the render lane schedule against, the session take store the library
// lists, and the bounce desk the studio exports through) folded into the
// one keyword file the ownership law pins for this domain. The merge is
// pure consolidation — zero logic edits, every export verbatim — under the
// section banners below, one banner per retired source:
//
//   takeevents.ts    the event scheduler (plan → flat note event list)
//   takestore.ts     the session take store (tab memory, newest first)
//   takeexporter.ts  the bounce desk (wav, stems, midi, recon seed)
//
// The consolidation note (the only edit the merge made): takeexporter's
// type-only import of the TakeSchedule seat folds into the takeevents
// section of this file (the two sections share the one declaration).

import { type ArrangerRole, beatSecondsOf, stepSecondsOf, type TakePlan } from "./arranger.ts";
import { renderTakeOffline } from "./audio.ts";
import { hashSeed, mulberry32 } from "./harmonyengine.ts";
import { reconOf } from "./ingest.ts";
import { buildTracksFromSchedule, validateMidi, writeMidi } from "./midiwriter.ts";
import { chordNotes, scalePcs } from "./musictheory.ts";
import type { ReconDocument } from "./reconpayload.ts";
import { serializeRecon } from "./reconpayload.ts";
import { reconSeedOf } from "./reconworker.ts";
import { LANES, type LaneName } from "./rhythmgrammar.ts";
import { planStems, stemsManifest } from "./stems.ts";
import { writeWav16, writeWav24 } from "./wavwriter.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: takeevents.ts — the event scheduler. */
/* ════════════════════════════════════════════════════════════════════ */

/** One scheduled note of a take. */
export interface NoteEvent {
  /** The instrument lane ("kick", "bass", "keys", "lead"...). */
  lane: string;
  /** The role bus the event rides (the mixer strip). */
  role: ArrangerRole;
  /** The start time in seconds from the top of the take. */
  time: number;
  /** The note duration in seconds (the gate before release). */
  seconds: number;
  /** The velocity, 0..1 (section energy included). */
  velocity: number;
  /** The midi note number (drums answer 0). */
  midi: number;
}

/** The scheduled take: the flat event list plus the totals the surfaces read. */
export interface TakeSchedule {
  /** Every note event, time-ascending. */
  events: readonly NoteEvent[];
  /** The event count per role (the mixer strips' load). */
  perRole: Record<ArrangerRole, number>;
  /** The total duration the events cover (the plan's duration). */
  duration: number;
}

/** The documented fill cascade the last four steps of a fill bar play. */
const FILL_CASCADE: readonly number[] = [0.85, 0.6, 0.85, 1];

/** The event cap of one schedule (a runaway grid would freeze the transport). */
const EVENT_CAP = 4096;

/** The pitch classes of the plan's key (the lead motif's pool). */
function scalePcsList(plan: TakePlan): number[] {
  return scalePcs(plan.key);
}

/**
 * Expands a plan into the flat note event list (time-ascending).
 *
 * @param plan the arrangement plan.
 * @returns the schedule.
 */
export function scheduleTake(plan: TakePlan): TakeSchedule {
  const stepSec = stepSecondsOf(plan);
  const beatSec = beatSecondsOf(plan);
  const events: NoteEvent[] = [];
  const perRole: Record<ArrangerRole, number> = { drums: 0, bass: 0, keys: 0, lead: 0 };
  const push = (event: NoteEvent): void => {
    if (events.length >= EVENT_CAP) return;
    events.push(event);
    perRole[event.role] += 1;
  };

  const leadRng = mulberry32(hashSeed(`lead:${plan.seed}:${plan.prompt}`));
  const scalePcs = scalePcsList(plan);

  for (let bar = 0; bar < plan.bars; bar++) {
    const section = sectionAt(plan, bar);
    const barStart = bar * plan.barSeconds;
    const chord = plan.chords[bar];
    const fill = plan.fillBars[bar];

    if (section.voices.includes("drums")) {
      for (const lane of LANES) {
        const steps = plan.grid.lanes[lane as LaneName];
        for (let step = 0; step < 16; step++) {
          let velocity = steps[step];
          if (velocity <= 0) continue;
          if (fill && step >= 12) {
            // the documented fill: the snare cascade takes over, the hats halve
            if (lane === "snare") velocity = Math.max(velocity, FILL_CASCADE[step - 12]);
            if (lane === "hat" || lane === "openhat") velocity *= 0.5;
          }
          push({
            lane,
            role: "drums",
            time: barStart + (step + plan.offsets[step]) * stepSec,
            seconds: lane === "openhat" ? 0.28 : lane === "ride" ? 0.5 : 0.12,
            velocity: Math.min(1, velocity * section.energy),
            midi: 0,
          });
        }
      }
    }

    if (section.voices.includes("bass")) {
      const bassMidi = 24 + chord.chord.root;
      for (let step = 0; step < 16; step++) {
        const kick = plan.grid.lanes.kick[step];
        if (kick <= 0) continue;
        push({
          lane: "bass",
          role: "bass",
          time: barStart + (step + plan.offsets[step]) * stepSec,
          seconds: Number((0.9 * beatSec).toFixed(6)),
          velocity: Math.min(1, (0.55 + kick * 0.35) * section.energy),
          midi: bassMidi,
        });
      }
    }

    if (section.voices.includes("keys")) {
      for (const midi of chordNotes(chord.chord, 3)) {
        push({
          lane: "keys",
          role: "keys",
          time: barStart,
          seconds: Number((plan.barSeconds * 0.96).toFixed(6)),
          velocity: Math.min(1, (0.42 + chord.tension * 0.3) * section.energy),
          midi,
        });
      }
    }

    if (section.voices.includes("lead")) {
      for (let step = 0; step < 16; step += 2) {
        if (leadRng() < 0.5) continue;
        const pc = scalePcs[Math.floor(leadRng() * scalePcs.length)];
        const midi = 72 + pc;
        push({
          lane: "lead",
          role: "lead",
          time: barStart + step * stepSec,
          seconds: Number((stepSec * 1.6).toFixed(6)),
          velocity: 0.5 + leadRng() * 0.3,
          midi,
        });
      }
    }
  }

  events.sort((left, right) => left.time - right.time);
  return { events, perRole, duration: plan.durationSeconds };
}

/**
 * The section a bar sits in (the section plan is contiguous by construction).
 *
 * @param plan the arrangement plan.
 * @param bar the bar index.
 * @returns the owning section.
 */
export function sectionAt(plan: TakePlan, bar: number): TakePlan["sections"][number] {
  let cursor = 0;
  for (const section of plan.sections) {
    cursor += section.bars;
    if (bar < cursor) return section;
  }
  return plan.sections[plan.sections.length - 1];
}

/**
 * Slices the schedule to the events inside a window (the loop pass the
 * transport schedules).
 *
 * @param schedule the full schedule.
 * @param from the window start in seconds (inclusive).
 * @param to the window end in seconds (exclusive).
 * @returns the events inside [from, to).
 */
export function eventsInWindow(schedule: TakeSchedule, from: number, to: number): NoteEvent[] {
  return schedule.events.filter((event) => event.time >= from && event.time < to);
}

/**
 * The grid position of an instant: the bar and the 16-step column the
 * playhead sits on (the channel rack reads it while playing).
 *
 * @param plan the arrangement plan.
 * @param time the instant in seconds.
 * @returns the bar and step indices.
 */
export function positionAt(plan: TakePlan, time: number): { bar: number; step: number } {
  const stepSec = stepSecondsOf(plan);
  const absolute = Math.max(0, time / stepSec);
  const bar = Math.min(plan.bars - 1, Math.floor(absolute / 16));
  const step = Math.floor(absolute) % 16;
  return { bar, step };
}

/**
 * Validates a schedule; answers the problems (an empty list is a sound
 * schedule): every event inside the take, velocities in range, times finite
 * and ascending.
 *
 * @param schedule the schedule to check.
 * @returns the problems found.
 */
export function validateSchedule(schedule: TakeSchedule): string[] {
  const problems: string[] = [];
  let last = -1;
  for (const event of schedule.events) {
    if (!Number.isFinite(event.time) || event.time < 0 || event.time >= schedule.duration) {
      problems.push(`event ${event.lane}@${event.time} outside the take`);
    }
    if (!(event.velocity >= 0 && event.velocity <= 1))
      problems.push(`event ${event.lane}@${event.time} velocity out of range`);
    if (event.time < last - 1e-9) problems.push("events are not time-ascending");
    last = event.time;
  }
  if (schedule.events.length === 0) problems.push("the schedule carries no events");
  return problems;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: takestore.ts — the session take store. */
/* ════════════════════════════════════════════════════════════════════ */

/** The session key the store keeps its document under. */
export const TAKE_STORE_KEY = "debonair.takes";

/** The session key the library hands the studio to open one take. */
export const TAKE_SELECT_KEY = "debonair.studio.take";

/** The storage seam the store reads and writes (session storage or a stub). */
export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** One stored take: the plan plus the moment it was rendered. */
export interface TakeRecord {
  /** The plan itself (id, name, genre, bpm, key, grid, clips, strips). */
  plan: TakePlan;
  /** The ISO timestamp of the render. */
  savedAt: string;
}

/** An in-memory storage stub (the fallback when the session storage is unavailable). */
export function memoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

/** The session storage when reachable, the memory stub otherwise. */
export function sessionStorageOrMemory(): StorageLike {
  try {
    return window.sessionStorage;
  } catch {
    return memoryStorage();
  }
}

/** Parses the stored document; a broken document answers empty. */
function parseDocument(raw: string | null): TakeRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is TakeRecord => {
      const record = entry as TakeRecord;
      return Boolean(record?.plan && typeof record.plan.id === "string" && typeof record.plan.bpm === "number");
    });
  } catch {
    return [];
  }
}

/** Writes the document back (throws when the storage is full or frozen). */
function writeDocument(storage: StorageLike, records: readonly TakeRecord[]): void {
  storage.setItem(TAKE_STORE_KEY, JSON.stringify(records));
}

/**
 * Loads every stored take, newest first.
 *
 * @param storage the storage seam (defaults to the session storage).
 * @returns the take records.
 */
export function loadTakeRecords(storage: StorageLike = sessionStorageOrMemory()): TakeRecord[] {
  return parseDocument(storage.getItem(TAKE_STORE_KEY)).sort((left, right) =>
    right.savedAt.localeCompare(left.savedAt),
  );
}

/**
 * Stores one take (replacing the record of the same plan id).
 *
 * @param plan the plan to store.
 * @param storage the storage seam (defaults to the session storage).
 * @returns the records after the write, newest first.
 */
export function saveTakePlan(plan: TakePlan, storage: StorageLike = sessionStorageOrMemory()): TakeRecord[] {
  const record: TakeRecord = { plan, savedAt: new Date().toISOString() };
  const rest = parseDocument(storage.getItem(TAKE_STORE_KEY)).filter((entry) => entry.plan.id !== plan.id);
  const records = [record, ...rest];
  writeDocument(storage, records);
  return records;
}

/**
 * Removes one take by id.
 *
 * @param id the plan id.
 * @param storage the storage seam (defaults to the session storage).
 * @returns the records after the write, newest first.
 */
export function removeTakePlan(id: string, storage: StorageLike = sessionStorageOrMemory()): TakeRecord[] {
  const records = parseDocument(storage.getItem(TAKE_STORE_KEY)).filter((entry) => entry.plan.id !== id);
  writeDocument(storage, records);
  return records;
}

/**
 * Finds one stored take by id.
 *
 * @param id the plan id.
 * @param storage the storage seam (defaults to the session storage).
 * @returns the record, or undefined.
 */
export function findTakeRecord(id: string, storage: StorageLike = sessionStorageOrMemory()): TakeRecord | undefined {
  return parseDocument(storage.getItem(TAKE_STORE_KEY)).find((entry) => entry.plan.id === id);
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: takeexporter.ts — the bounce desk. */
/* ════════════════════════════════════════════════════════════════════ */

/** The export actions the desk offers. */
export type ExportKind = "wav16" | "wav24" | "midi" | "stems" | "recon";

/** The schema literal of the compact seed export — the recon lane's own
 * envelope around the canonical debonair.recon/3 document (the seed, the
 * identity checksums and the document ride; never wav bytes, never base64). */
export const RECON_SEED_SCHEMA_VERSION = "debonair.reconseed/1";

/** One file the export hands to the browser's save dialog. */
export interface ExportFile {
  /** The file name the download carries. */
  name: string;
  /** The bytes, typed for the browser (the audio and the manifest). */
  blob: Blob;
  /** The human line the toast answers with. */
  label: string;
}

/** The human names the export buttons ride. */
export const EXPORT_LABELS: Record<ExportKind, string> = {
  wav16: "wav 16",
  wav24: "wav 24",
  midi: "midi",
  stems: "stems",
  recon: "recon seed",
};

/** The blob part the encoders hand over (a private copy, TS 5.9-safe). */
function blobPart(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}

/**
 * Builds the compact seed export of one recon document — the honest size
 * answer of the recon lane (docs/recon.spec.md §5-7): the canonical
 * debonair.recon/3 document (serializeRecon — the same bytes always), the
 * seed the reconstruction rng rides and the document's identity checksums,
 * in one json file. NO wav, NO base64, NO open pcm arrays — the bytes the
 * document names live in the blob lane, never in the payload; the label
 * declares the honest size (kilobytes against the megabytes the pcm would
 * weigh). A checksum identifies, never alleges reproduction — the seed
 * rebuilds a take in the spirit of the analysis (strategy three), and the
 * label says exactly that.
 *
 * @param doc the recon document (the canonical serializer gates it — a
 *   broken document throws ReconError honestly).
 * @param name the file stem (the take id).
 * @returns the export file (json, application/json).
 */
export function reconSeedFile(doc: ReconDocument, name: string): ExportFile {
  const seed = reconSeedOf(doc);
  const payload = JSON.stringify({
    schema: RECON_SEED_SCHEMA_VERSION,
    name,
    seed,
    checksums: {
      pcmhash: doc.header.pcmhash,
      spectralPeaksHash: doc.header.spectralPeaksHash,
      midiNotesHash: doc.header.midiNotesHash,
    },
    document: JSON.parse(serializeRecon(doc)),
  });
  const bytes = new TextEncoder().encode(payload);
  return {
    name: `${name}-recon-seed.json`,
    blob: new Blob([blobPart(bytes)], { type: "application/json" }),
    label: `seed + checksums · ${(bytes.length / 1024).toFixed(1)} kb · no pcm (the rebuild rides the seed)`,
  };
}

/**
 * Bounces one export of the take. Every kind renders on demand — a wav is a
 * full offline bounce, a stem set is one bounce per voiced role, the midi is
 * pure bytes of the validated tracks, and the recon seed is the compact
 * rung: the recon document of the take (the caller's analysis when it
 * carries one, else one real bounce analyzed on the spot — the same desk
 * graph, the same law "every export a real render") serialized with its
 * seed and checksums, never the pcm bytes.
 *
 * @param kind the export action.
 * @param plan the plan the take answers to (naming and mastering rate).
 * @param schedule the schedule to bounce (the desk's edited one rides in).
 * @param recon the recon document of the take, when the caller analyzed one
 *   (the seed export's payload rung; without it the lane bounces and
 *   analyzes — never a placeholder).
 * @returns the files the action produced (stems carry one per voiced role plus the manifest).
 * @throws Error with the refusal line when the render or the encode fails.
 */
export async function exportTake(
  kind: ExportKind,
  plan: TakePlan,
  schedule: TakeSchedule,
  recon?: ReconDocument,
): Promise<ExportFile[]> {
  if (kind === "recon") {
    let document = recon;
    if (!document) {
      // the studio lane: one real bounce through the desk's own graph, then
      // the descriptor lane over the mono mix — the ladder's payload rung
      // answered on demand (the same law every wav export rides)
      const buffer = await renderTakeOffline(plan, schedule);
      document = reconOf(mixToMono(buffer), buffer.sampleRate, { name: plan.id });
    }
    return [reconSeedFile(document, plan.id)];
  }

  if (kind === "midi") {
    const tracks = buildTracksFromSchedule(schedule, plan, plan.bpm);
    const problems = validateMidi(tracks);
    if (problems.length > 0) throw new Error(`the midi refused this take: ${problems[0].message}`);
    const bytes = writeMidi(tracks, 480, plan.bpm);
    return [
      {
        name: `${plan.id}.mid`,
        blob: new Blob([blobPart(bytes)], { type: "audio/midi" }),
        label: "smf format 1, four role tracks",
      },
    ];
  }

  if (kind === "stems") {
    const stems = planStems(schedule, plan);
    const files: ExportFile[] = [];
    for (const stem of stems) {
      if (stem.events.length === 0) continue;
      const buffer = await renderTakeOffline(plan, schedule, { roles: [stem.role] });
      const mono = mixToMono(buffer);
      files.push({
        name: stem.file,
        blob: new Blob([blobPart(writeWav16([mono], buffer.sampleRate))], { type: "audio/wav" }),
        label: `${stem.role} · ${stem.events.length} events`,
      });
    }
    const manifest = stemsManifest({ plan, stems });
    files.push({
      name: `${plan.id}-stems.json`,
      blob: new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" }),
      label: "manifest schema v1",
    });
    if (files.length <= 1) throw new Error("every role is silent — there is nothing to bounce");
    return files;
  }

  // the full-mix wavs: one offline bounce, two channels, the desk's graph
  const buffer = await renderTakeOffline(plan, schedule);
  const channels = [buffer.getChannelData(0), buffer.getChannelData(1)];
  const bytes = kind === "wav24" ? writeWav24(channels, buffer.sampleRate) : writeWav16(channels, buffer.sampleRate);
  return [
    {
      name: `${plan.id}.wav`,
      blob: new Blob([blobPart(bytes)], { type: "audio/wav" }),
      label: `${buffer.sampleRate / 1000} kHz · ${formatSeconds(buffer.duration)} · ${kind === "wav24" ? "24" : "16"}-bit`,
    },
  ];
}

/**
 * Hands one file to the browser (the anchor click the save dialog answers).
 *
 * @param file the export file.
 */
export function downloadFile(file: ExportFile): void {
  const url = URL.createObjectURL(file.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Averages the bounce's channels into the mono bus a stem rides. */
function mixToMono(buffer: AudioBuffer): Float32Array {
  const out = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < out.length; index++) out[index] += data[index] / buffer.numberOfChannels;
  }
  return out;
}

/** The m:ss.t clock the toast labels ride (the dawview law, kept local). */
function formatSeconds(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe - minutes * 60;
  return `${minutes}:${rest.toFixed(1).padStart(4, "0")}`;
}
